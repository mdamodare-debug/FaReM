from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, SystemAuditLog
from .serializers import UserSerializer
from .permissions import IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for Admin to manage users.
    Only Admin has access. Roles can only be assigned here.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Users aren't created by themselves, admin assigns role at creation
        user = serializer.save()
        
        SystemAuditLog.objects.create(
            entity_type='User',
            entity_id=str(user.id),
            action_type='Create',
            new_value=f"Created user {user.mobile_number} as {user.role}",
            user_id=str(request.user.id)
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        # Soft delete instead of hard delete
        instance = self.get_object()
        instance.status = 'Inactive'
        instance.save(update_fields=['status'])
        
        SystemAuditLog.objects.create(
            entity_type='User',
            entity_id=str(instance.id),
            field_changed='status',
            old_value='Active',
            new_value='Inactive',
            action_type='Update',
            user_id=str(request.user.id)
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
