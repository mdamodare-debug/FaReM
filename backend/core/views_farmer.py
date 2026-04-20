from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Farmer, Role
from .serializers_farmer import FarmerSerializer
from .tasks import process_farmer_bulk_import
from .permissions import IsAdminUser

class FarmerViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ADMIN or user.role == Role.ZONAL_MANAGER or user.role == Role.CONTENT_TEAM:
            return Farmer.objects.all()
        elif user.role == Role.TERRITORY_MANAGER:
            # Assumes territory has sub_territories structured to find farmers, simplified here
            return Farmer.objects.filter(territory=user.territory)
        elif user.role == Role.FIELD_STAFF:
            return Farmer.objects.filter(assigned_staff=user)
        return Farmer.objects.none()

    def perform_destroy(self, instance):
        # Soft delete is processed here if allowed, though specs say Admin processes delete request.
        if self.request.user.role == Role.ADMIN:
            instance.status = 'Inactive'
            instance.save()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def upload_for_validation(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "excel file is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES['file']
        
        # Save file to media/imports/
        import os
        from django.conf import settings
        import_dir = os.path.join(settings.BASE_DIR, 'media', 'imports')
        os.makedirs(import_dir, exist_ok=True)
        file_path = os.path.join(import_dir, f"{request.user.id}_{file_obj.name}")
        
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        from .models import ImportJob
        import_job = ImportJob.objects.create(
            created_by=request.user,
            filename=file_path, # We'll store the path here for the task
            status='Processing'
        )
        
        # Dispatch to celery for validation
        from .tasks import validate_farmer_import
        validate_farmer_import.delay(str(import_job.id))
        
        return Response({"message": "Validation started", "import_job_id": str(import_job.id)}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def commit_import(self, request):
        import_job_id = request.data.get('import_job_id')
        is_acknowledged = request.data.get('is_acknowledged', False)
        
        from .models import ImportJob
        try:
            job = ImportJob.objects.get(id=import_job_id, created_by=request.user)
        except ImportJob.DoesNotExist:
            return Response({"error": "Import job not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if job.status != 'Pending': # Assuming Pending means 'Validation finished, waiting for commit'
             return Response({"error": "Job is not in a committable state"}, status=status.HTTP_400_BAD_REQUEST)
             
        if job.total_rows > 1000 and not is_acknowledged:
            return Response({"error": "Acknowledgment required for imports > 1000 records"}, status=status.HTTP_400_BAD_REQUEST)
            
        job.status = 'Processing'
        job.is_acknowledged = is_acknowledged
        job.save()
        
        from .tasks import commit_farmer_import
        commit_farmer_import.delay(str(job.id))
        
        return Response({"message": "Import commit started", "import_job_id": str(job.id)})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def request_disable(self, request, pk=None):
        farmer = self.get_object()
        
        # Optionally create a formal Request object, or just audit log the request
        # and send a notification to Admin. Here we log it as an Audit event
        # that admins monitor.
        from .models import SystemAuditLog
        SystemAuditLog.objects.create(
            entity_type='Farmer Disable Request',
            entity_id=str(farmer.id),
            field_changed='',
            old_value='',
            new_value=f'Field Staff {request.user.mobile_number} requested disable',
            action_type='Update',
            user_id=str(request.user.id)
        )
        return Response({"message": "Disable request submitted to Admin"}, status=status.HTTP_200_OK)
