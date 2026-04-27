from rest_framework import serializers
from .models import PromotionLibrary

class PromotionLibrarySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='related_product.name')
    crop_name = serializers.ReadOnlyField(source='crop.crop_name')
    stage_name = serializers.ReadOnlyField(source='stage.stage_name')

    class Meta:
        model = PromotionLibrary
        fields = '__all__'
