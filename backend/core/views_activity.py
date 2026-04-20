from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ActivityLog, Role
from .serializers_activity import ActivityLogSerializer
from .permissions import IsStaffOrManagerOrAdmin

class ActivityLogViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    Append-only viewset for Activity Logs. No updates or deletes allowed.
    Offline records sync here.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsStaffOrManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ADMIN or user.role == Role.ZONAL_MANAGER or user.role == Role.CONTENT_TEAM:
            return ActivityLog.objects.all()
        elif user.role == Role.TERRITORY_MANAGER:
            return ActivityLog.objects.filter(farmer__territory=user.territory)
        elif user.role == Role.FIELD_STAFF:
            return ActivityLog.objects.filter(logged_by_user=user)
        return ActivityLog.objects.none()

    def perform_create(self, serializer):
        serializer.save(logged_by_user=self.request.user, sync_status='Synced')

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsStaffOrManagerOrAdmin])
    def upload_photo(self, request):
        """Upload a visit photo to Cloudinary and return the URL."""
        if 'file' not in request.FILES:
            return Response({"error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            import cloudinary.uploader
            result = cloudinary.uploader.upload(
                request.FILES['file'],
                folder='ffma/visits',
                resource_type='image',
                transformation=[{'quality': 'auto:low', 'fetch_format': 'auto'}]
            )
            return Response({"url": result['secure_url']}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

