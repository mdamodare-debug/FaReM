from rest_framework import serializers
from .models import Plot, CropSeason, StageChangeLog

class PlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plot
        fields = '__all__'

class CropSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropSeason
        fields = '__all__'
        read_only_fields = ['expected_next_stage_date']

class StageChangeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageChangeLog
        fields = '__all__'
