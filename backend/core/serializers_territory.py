from rest_framework import serializers
from .models import Territory

class TerritorySerializer(serializers.ModelSerializer):
    sub_territories = serializers.SerializerMethodField()
    farmer_count = serializers.SerializerMethodField()

    class Meta:
        model = Territory
        fields = ['id', 'name', 'parent_territory', 'manager', 'status', 'sub_territories', 'farmer_count']

    def get_sub_territories(self, obj):
        if obj.sub_territories.exists():
            return TerritorySerializer(obj.sub_territories.all(), many=True).data
        return []

    def get_farmer_count(self, obj):
        # Recursive calculation of farmer count
        count = obj.farmers.count()
        for sub in obj.sub_territories.all():
            count += self.get_farmer_count(sub)
        return count
