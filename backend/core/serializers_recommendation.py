from rest_framework import serializers
from .models import Recommendation

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__'
        read_only_fields = ['created_by_user', 'send_status', 'timestamp']
