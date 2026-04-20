from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Territory, Farmer, Plot, CropMaster, CropVariety, 
    CropStage, CropSeason, StageChangeLog, ActivityLog, 
    Recommendation, PromotionLibrary, BulkSendBatch, 
    ImportJob, SystemAuditLog, AppConfiguration
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('mobile_number', 'username', 'role', 'territory', 'status', 'is_staff')
    list_filter = ('role', 'status', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('mobile_number', 'employee_id', 'role', 'territory', 'reporting_manager', 'status', 'device_push_token')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('mobile_number', 'role', 'territory', 'status')}),
    )

@admin.register(Territory)
class TerritoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent_territory', 'manager', 'status')
    list_filter = ('status',)
    search_fields = ('name',)

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'primary_mobile', 'village', 'taluka', 'district', 'status')
    list_filter = ('status', 'state', 'district')
    search_fields = ('full_name', 'primary_mobile')

@admin.register(Plot)
class PlotAdmin(GISModelAdmin):
    list_display = ('plot_name', 'farmer', 'area_acres', 'soil_type')
    search_fields = ('plot_name', 'farmer__full_name')

@admin.register(CropMaster)
class CropMasterAdmin(admin.ModelAdmin):
    list_display = ('crop_name', 'crop_category', 'status')
    list_filter = ('status', 'crop_category')
    search_fields = ('crop_name',)

@admin.register(CropVariety)
class CropVarietyAdmin(admin.ModelAdmin):
    list_display = ('variety_name', 'crop', 'typical_duration_days')
    list_filter = ('crop',)

@admin.register(CropStage)
class CropStageAdmin(admin.ModelAdmin):
    list_display = ('stage_name', 'crop', 'sequence_number', 'days_from_previous_stage')
    list_filter = ('crop',)
    ordering = ('crop', 'sequence_number')

@admin.register(CropSeason)
class CropSeasonAdmin(admin.ModelAdmin):
    list_display = ('plot', 'crop', 'sowing_date', 'current_stage', 'status')
    list_filter = ('status', 'crop')

@admin.register(StageChangeLog)
class StageChangeLogAdmin(admin.ModelAdmin):
    list_display = ('season', 'from_stage', 'to_stage', 'changed_by_user', 'change_timestamp')
    readonly_fields = ('change_timestamp',)

@admin.register(ActivityLog)
class ActivityLogAdmin(GISModelAdmin):
    list_display = ('farmer', 'logged_by_user', 'activity_type', 'date', 'time', 'sync_status')
    list_filter = ('activity_type', 'sync_status', 'date')
    search_fields = ('farmer__full_name', 'notes')

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('farmer', 'product_name', 'crop', 'stage', 'channel', 'send_status', 'timestamp')
    list_filter = ('channel', 'send_status', 'timestamp')

@admin.register(PromotionLibrary)
class PromotionLibraryAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'expiry_date', 'status')
    list_filter = ('content_type', 'status')

@admin.register(BulkSendBatch)
class BulkSendBatchAdmin(admin.ModelAdmin):
    list_display = ('content', 'created_by_user', 'channel', 'approval_status', 'send_status', 'created_at')
    list_filter = ('approval_status', 'send_status', 'channel')

@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ('filename', 'created_by', 'status', 'total_rows', 'valid_rows', 'created_at')
    list_filter = ('status', 'created_at')

@admin.register(SystemAuditLog)
class SystemAuditLogAdmin(admin.ModelAdmin):
    list_display = ('entity_type', 'action_type', 'user_id', 'timestamp')
    list_filter = ('action_type', 'entity_type', 'timestamp')
    readonly_fields = ('timestamp',)

@admin.register(AppConfiguration)
class AppConfigurationAdmin(admin.ModelAdmin):
    list_display = ('visit_frequency_norm_days', 'planner_refresh_hour', 'updated_at')
    
    def has_add_permission(self, request):
        # Singleton pattern
        return not AppConfiguration.objects.exists()
