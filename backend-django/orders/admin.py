from django.contrib import admin

from .models import Bid, Order, OrderAllocation, Requirement


@admin.register(Requirement)
class RequirementAdmin(admin.ModelAdmin):
    list_display = ["id", "commodity", "buyer", "vertical", "quantity", "status", "created_at"]
    list_filter = ["status", "vertical"]
    search_fields = ["commodity", "buyer__email"]


class OrderAllocationInline(admin.TabularInline):
    model = OrderAllocation
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "buyer", "status", "total_price", "created_at"]
    list_filter = ["status"]
    search_fields = ["buyer__email"]
    inlines = [OrderAllocationInline]


@admin.register(OrderAllocation)
class OrderAllocationAdmin(admin.ModelAdmin):
    list_display = ["order", "listing", "allocated_quantity", "unit_price", "status"]


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ["id", "listing", "buyer", "offered_price", "offered_quantity", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["buyer__email", "listing__commodity_name"]
