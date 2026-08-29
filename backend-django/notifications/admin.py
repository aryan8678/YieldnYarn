from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "type", "title", "is_read", "fcm_sent", "created_at"]
    list_filter = ["type", "is_read", "fcm_sent"]
    search_fields = ["user__email", "title"]
