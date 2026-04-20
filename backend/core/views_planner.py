from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Farmer, Role
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.utils import timezone
from .serializers_farmer import FarmerSerializer

class PlannerViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    @action(detail=False, methods=['get'])
    def daily_plan(self, request):
        if request.user.role != Role.FIELD_STAFF:
            return Response({"error": "Only field staff can access visit planner"}, status=status.HTTP_403_FORBIDDEN)
            
        params = request.query_params
        lat = params.get('lat')
        lng = params.get('lng')
        crop_id = params.get('crop')
        distance_radius = params.get('radius')
        village = params.get('village')
        
        from .models import AppConfiguration
        config = AppConfiguration.get_config()
        threshold_days = config.visit_frequency_norm_days
        
        farmers = Farmer.objects.filter(assigned_staff=request.user, status='Active')
        
        if crop_id:
            farmers = farmers.filter(plots__seasons__crop_id=crop_id, plots__seasons__status='Active')
        if village:
            farmers = farmers.filter(village__icontains=village)
            
        user_point = Point(float(lng), float(lat), srid=4326) if lat and lng else None
        
        today = timezone.now().date()
        plan_list = []
        
        # Prefetch activities to avoid N+1
        farmers = farmers.prefetch_related('activities', 'plots').distinct()
        
        for farmer in farmers:
            last_visit = farmer.activities.filter(activity_type='Visit').order_by('-date').first()
            days_since = (today - last_visit.date).days if last_visit else (today - farmer.date_added.date()).days
            
            # Distance logic
            min_distance = 999999 # Default for no location
            plot = farmer.plots.first()
            if user_point and plot and plot.location:
                min_distance = user_point.distance(plot.location)
                if distance_radius and min_distance > float(distance_radius):
                    continue
            
            plan_list.append({
                'farmer': FarmerSerializer(farmer).data,
                'overdue_days': days_since,
                'is_overdue': days_since >= threshold_days,
                'distance': min_distance if user_point else None
            })
            
        # Sort primary: overdue_days DESC, secondary: distance ASC
        plan_list.sort(key=lambda x: (-x['overdue_days'], x['distance'] if x['distance'] is not None else 0))
        
        return Response(plan_list)
