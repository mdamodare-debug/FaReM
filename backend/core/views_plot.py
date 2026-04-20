from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Plot, CropSeason, StageChangeLog, CropStage, Role
from .serializers_plot import PlotSerializer, CropSeasonSerializer, StageChangeLogSerializer
from .permissions import IsStaffOrManagerOrAdmin

class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.all()
    serializer_class = PlotSerializer
    permission_classes = [IsAuthenticated]

    # Additional query scoping can be added similar to FarmerViewSet

class CropSeasonViewSet(viewsets.ModelViewSet):
    queryset = CropSeason.objects.all()
    serializer_class = CropSeasonSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        season = serializer.save()
        self._calculate_next_stage_date(season)

    def _calculate_next_stage_date(self, season):
        if not season.current_stage:
            return

        next_stages = CropStage.objects.filter(
            crop=season.crop, 
            sequence_number__gt=season.current_stage.sequence_number
        ).order_by('sequence_number')
        
        next_stage = next_stages.first()

        if next_stage:
            # Formula: SowingDate + Σ(DaysFromPreviousStage) for stages 1 through N+1
            # First, get all stages up to and including the next stage
            all_stages_up_to_next = CropStage.objects.filter(
                crop=season.crop,
                sequence_number__lte=next_stage.sequence_number
            ).order_by('sequence_number')
            
            total_days = sum(s.days_from_previous_stage for s in all_stages_up_to_next)
            season.expected_next_stage_date = season.sowing_date + timedelta(days=total_days)
            season.save(update_fields=['expected_next_stage_date'])

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStaffOrManagerOrAdmin])
    def advance_stage(self, request, pk=None):
        season = self.get_object()
        
        # User confirmation is required before this API is called (handled in frontend logic)
        
        old_stage = season.current_stage
        if not old_stage:
            return Response({"error": "Current stage is not set"}, status=status.HTTP_400_BAD_REQUEST)
            
        next_stage = CropStage.objects.filter(
            crop=season.crop, 
            sequence_number__gt=old_stage.sequence_number
        ).order_by('sequence_number').first()
        
        if not next_stage:
            return Response({"error": "Already at final stage"}, status=status.HTTP_400_BAD_REQUEST)

        # Update stage
        season.current_stage = next_stage
        season.save(update_fields=['current_stage'])
        self._calculate_next_stage_date(season)

        # Record Audit
        StageChangeLog.objects.create(
            season=season,
            from_stage=old_stage,
            to_stage=next_stage,
            changed_by_user=request.user
        )

        return Response({"message": "Stage advanced successfully", "new_stage": next_stage.id}, status=status.HTTP_200_OK)
