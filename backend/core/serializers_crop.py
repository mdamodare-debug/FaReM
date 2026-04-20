from rest_framework import serializers
from .models import CropMaster, CropVariety, CropStage

class CropVarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = CropVariety
        fields = '__all__'

class CropStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropStage
        fields = '__all__'

class CropMasterSerializer(serializers.ModelSerializer):
    varieties = CropVarietySerializer(many=True, read_only=True)
    stages = CropStageSerializer(many=True, read_only=True)

    class Meta:
        model = CropMaster
        fields = '__all__'
