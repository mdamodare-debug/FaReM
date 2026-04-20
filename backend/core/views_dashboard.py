import pandas as pd
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Farmer, User, ActivityLog, Role
from django.http import HttpResponse

class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == Role.FIELD_STAFF:
            return Response({"error": "Field staff dashboards are managed locally"}, status=status.HTTP_403_FORBIDDEN)
            
        # Basic aggregate data
        data = {}
        
        farmers = Farmer.objects.filter(status='Active')
        activities = ActivityLog.objects.all()
        
        if user.role == Role.TERRITORY_MANAGER:
            farmers = farmers.filter(territory=user.territory)
            activities = activities.filter(farmer__territory=user.territory)
            
        data['total_farmers'] = farmers.count()
        data['total_visits'] = activities.filter(activity_type='Visit').count()
        data['total_calls'] = activities.filter(activity_type='Call').count()
        
        # Breakdown by village
        village_data = farmers.values('village').annotate(count=Count('id')).order_by('-count')[:5]
        data['top_villages'] = list(village_data)
        
        return Response(data)

class ExportReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in [Role.ADMIN, Role.ZONAL_MANAGER, Role.TERRITORY_MANAGER]:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        export_type = request.query_params.get('type', 'excel')
        report_data = []
        
        farmers = Farmer.objects.filter(status='Active')
        if user.role == Role.TERRITORY_MANAGER:
            farmers = farmers.filter(territory=user.territory)
            
        df = pd.DataFrame(list(farmers.values('id', 'full_name', 'primary_mobile', 'village', 'date_added')))
        
        if export_type == 'excel':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename=report.xlsx'
            df.to_excel(response, index=False)
            return response
        elif export_type == 'pdf':
            # Simplified for PDF export, usually done via reportlab
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename=report.pdf'
            # Just write text for implementation showcase
            response.write(b'Farmer Report PDF Content (Mock)')
            return response
            
        return Response({'error': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)
