from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from .models import ImportJob

class ImportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportJob
        fields = '__all__'

class ImportJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Status polling for bulk imports.
    """
    queryset = ImportJob.objects.all()
    serializer_class = ImportJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
