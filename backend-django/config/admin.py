from django.contrib import admin

from .models import GradingSchema, PricingRule, Vertical


@admin.register(Vertical)
class VerticalAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "unit_of_measure", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(GradingSchema)
class GradingSchemaAdmin(admin.ModelAdmin):
    list_display = ["vertical", "updated_at"]


@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ["vertical", "updated_at"]
