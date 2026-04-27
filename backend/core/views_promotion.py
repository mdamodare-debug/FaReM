from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from .models import PromotionLibrary, ImportJob
from .serializers_promotion import PromotionLibrarySerializer
from .permissions import IsAdminOrContentTeam

class IsAdminOrContentOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return IsAdminOrContentTeam().has_permission(request, view)

class PromotionLibraryViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Content team and Admin. Readonly for others.
    """
    queryset = PromotionLibrary.objects.all().order_by('-created_at')
    serializer_class = PromotionLibrarySerializer
    permission_classes = [IsAuthenticated, IsAdminOrContentOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content_type', 'crop__crop_name', 'stage__stage_name', 'related_product__name']

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrContentTeam])
    def upload_for_validation(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "excel file is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        
        import os
        from django.conf import settings
        import_dir = os.path.join(settings.BASE_DIR, 'media', 'imports')
        os.makedirs(import_dir, exist_ok=True)
        file_path = os.path.join(import_dir, f"promos_{request.user.id}_{file_obj.name}")
        
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        import_job = ImportJob.objects.create(
            created_by=request.user,
            filename=file_path,
            status='Processing'
        )
        
        from .tasks import validate_promotion_import
        validate_promotion_import.delay(str(import_job.id))
        
        return Response({"message": "Validation started", "import_job_id": str(import_job.id)}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrContentTeam])
    def commit_import(self, request):
        import_job_id = request.data.get('import_job_id')
        
        try:
            job = ImportJob.objects.get(id=import_job_id, created_by=request.user)
        except ImportJob.DoesNotExist:
            return Response({"error": "Import job not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if job.status != 'Pending':
             return Response({"error": "Job is not in a committable state"}, status=status.HTTP_400_BAD_REQUEST)
             
        job.status = 'Processing'
        job.save()
        
        from .tasks import commit_promotion_import
        commit_promotion_import.delay(str(job.id))
        
        return Response({"message": "Import commit started", "import_job_id": str(job.id)})
