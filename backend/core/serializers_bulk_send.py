from rest_framework import serializers
from .models import BulkSendBatch

class BulkSendBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkSendBatch
        fields = '__all__'
        read_only_fields = ['created_by_user', 'farmer_ids', 'recipient_count', 'approval_status', 'approved_by_user', 'approval_timestamp', 'send_status', 'sent_count', 'failed_count']
