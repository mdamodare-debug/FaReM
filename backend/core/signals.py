from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Farmer, Territory, User, PromotionLibrary, AuditLog
from .tasks import create_audit_log_async
import threading

_thread_locals = threading.local()

def set_current_user(user):
    _thread_locals.user = user

def get_current_user():
    return getattr(_thread_locals, 'user', None)

@receiver(pre_save, sender=Farmer)
@receiver(pre_save, sender=Territory)
@receiver(pre_save, sender=User)
@receiver(pre_save, sender=PromotionLibrary)
def audit_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._old_instance = None

@receiver(post_save, sender=Farmer)
@receiver(post_save, sender=Territory)
@receiver(post_save, sender=User)
@receiver(post_save, sender=PromotionLibrary)
def audit_post_save(sender, instance, created, **kwargs):
    user = get_current_user()
    user_id = str(user.id) if user else None
    
    if created:
        create_audit_log_async.delay(
            entity_type=sender.__name__,
            entity_id=str(instance.id),
            field_changed='All',
            old_value='',
            new_value='Created',
            user_id=user_id,
            action_type='Create'
        )
    else:
        old_instance = getattr(instance, '_old_instance', None)
        if old_instance:
            for field in instance._meta.fields:
                field_name = field.name
                old_value = getattr(old_instance, field_name)
                new_value = getattr(instance, field_name)
                if old_value != new_value:
                    create_audit_log_async.delay(
                        entity_type=sender.__name__,
                        entity_id=str(instance.id),
                        field_changed=field_name,
                        old_value=str(old_value),
                        new_value=str(new_value),
                        user_id=user_id,
                        action_type='Update'
                    )

@receiver(post_delete, sender=Farmer)
@receiver(post_delete, sender=Territory)
@receiver(post_delete, sender=User)
@receiver(post_delete, sender=PromotionLibrary)
def audit_post_delete(sender, instance, **kwargs):
    user = get_current_user()
    user_id = str(user.id) if user else None
    
    create_audit_log_async.delay(
        entity_type=sender.__name__,
        entity_id=str(instance.id),
        field_changed='All',
        old_value='Deleted',
        new_value='',
        user_id=user_id,
        action_type='Delete'
    )
