from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from .models import PromotionLibrary
from .serializers_promotion import PromotionLibrarySerializer
from .permissions import IsAdminOrContentTeam

class IsAdminOrContentOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return IsAdminOrContentTeam().has_permission(request, view)

class PromotionLibraryViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Content team and Admin. Readonly for others.
    """
    queryset = PromotionLibrary.objects.all()
    serializer_class = PromotionLibrarySerializer
    permission_classes = [IsAuthenticated, IsAdminOrContentOrReadOnly]
