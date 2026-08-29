from django.contrib import admin

from .models import GradingEvidence, GradingResult, Listing


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "commodity_name",
        "seller",
        "vertical",
        "quantity",
        "unit",
        "status",
        "created_at",
    ]
    list_filter = ["status", "vertical"]
    search_fields = ["commodity_name", "sub_category", "seller__email"]


@admin.register(GradingEvidence)
class GradingEvidenceAdmin(admin.ModelAdmin):
    list_display = ["listing", "file_type", "uploaded_at"]
    list_filter = ["file_type"]


@admin.register(GradingResult)
class GradingResultAdmin(admin.ModelAdmin):
    list_display = ["listing", "source", "confidence_score", "graded_by", "created_at"]
    list_filter = ["source"]
