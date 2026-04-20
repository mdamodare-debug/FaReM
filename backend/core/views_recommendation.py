from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Recommendation, Role
from .serializers_recommendation import RecommendationSerializer
from .tasks import dispatch_recommendation_msg

class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == Role.ADMIN or user.role == Role.ZONAL_MANAGER:
            return Recommendation.objects.all()
        elif user.role == Role.TERRITORY_MANAGER:
            return Recommendation.objects.filter(farmer__territory=user.territory)
        elif user.role == Role.FIELD_STAFF:
            return Recommendation.objects.filter(created_by_user=user)
        return Recommendation.objects.none()

    def perform_create(self, serializer):
        rec = serializer.save(created_by_user=self.request.user, send_status='Sent')
        dispatch_recommendation_msg.delay(str(rec.id))
