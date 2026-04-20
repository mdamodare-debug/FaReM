from rest_framework import viewsets, permissions, serializers
from .models import ImportJob, SystemAuditLog

class ImportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportJob
        fields = '__all__'

class ImportJobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportJob.objects.all()
    serializer_class = ImportJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return ImportJob.objects.all()
        return ImportJob.objects.filter(created_by=self.request.user)

class SystemAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAuditLog
        fields = '__all__'

class SystemAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemAuditLog.objects.all().order_by('-timestamp')
    serializer_class = SystemAuditLogSerializer
    permission_classes = [permissions.IsAuthenticated] # Adjusted if Admin-only
