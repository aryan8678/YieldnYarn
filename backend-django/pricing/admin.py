from django.contrib import admin

from .models import PricePoint


@admin.register(PricePoint)
class PricePointAdmin(admin.ModelAdmin):
    list_display = ["id", "vertical", "commodity", "region", "price", "source", "timestamp"]
    list_filter = ["source", "vertical"]
    search_fields = ["commodity", "region"]
