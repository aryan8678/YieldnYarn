from django.contrib import admin

from .models import Dispute


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "order",
        "raised_by",
        "against",
        "type",
        "status",
        "created_at",
        "resolved_at",
    ]
    list_filter = ["type", "status"]
    search_fields = ["raised_by__email", "against__email", "description"]
