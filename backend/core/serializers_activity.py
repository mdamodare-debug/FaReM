from rest_framework import serializers
from .models import ActivityLog
from django.db import IntegrityError

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['logged_by_user', 'sync_status']

    def create(self, validated_data):
        client_uuid = validated_data.get('client_uuid')
        
        # Idempotent deduplication
        if client_uuid:
            existing = ActivityLog.objects.filter(client_uuid=client_uuid).first()
            if existing:
                return existing
                
        try:
            return super().create(validated_data)
        except IntegrityError:
            # Fallback for unique_together constraint
            existing = ActivityLog.objects.filter(
                farmer=validated_data.get('farmer'),
                logged_by_user=validated_data.get('logged_by_user'),
                date=validated_data.get('date'),
                time=validated_data.get('time'),
                activity_type=validated_data.get('activity_type')
            ).first()
            if existing:
                return existing
            raise
