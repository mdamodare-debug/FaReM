from rest_framework import serializers
from .models import PromotionLibrary

class PromotionLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionLibrary
        fields = '__all__'
