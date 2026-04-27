from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ProductMaster
from rest_framework import serializers

class ProductMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMaster
        fields = '__all__'

class ProductMasterViewSet(viewsets.ModelViewSet):
    queryset = ProductMaster.objects.all().order_by('name')
    serializer_class = ProductMasterSerializer
    permission_classes = [IsAuthenticated]
