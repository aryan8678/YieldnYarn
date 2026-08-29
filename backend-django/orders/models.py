from django.conf import settings
from django.db import models

from catalog.models import Listing
from config.models import Vertical


class Requirement(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        MATCHED = "MATCHED", "Matched"
        FULFILLED = "FULFILLED", "Fulfilled"
        CANCELLED = "CANCELLED", "Cancelled"

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="requirements",
    )
    vertical = models.ForeignKey(
        Vertical, on_delete=models.PROTECT, related_name="requirements"
    )
    commodity = models.CharField(max_length=150)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    min_grade = models.CharField(max_length=30, blank=True, default="")
    max_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    region_lat = models.FloatField(null=True, blank=True)
    region_lng = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "requirements"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "vertical"], name="idx_req_status_vert"),
        ]

    def __str__(self):
        return f"Requirement<{self.commodity}:{self.buyer_id}>"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        FULFILLED = "FULFILLED", "Fulfilled"
        DISPUTED = "DISPUTED", "Disputed"
        CANCELLED = "CANCELLED", "Cancelled"

    requirement = models.ForeignKey(
        Requirement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING
    )
    total_price = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order<{self.id}:{self.status}>"


class OrderAllocation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="allocations"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.PROTECT, related_name="allocations"
    )
    allocated_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING
    )

    class Meta:
        db_table = "order_allocations"

    def __str__(self):
        return f"Allocation<order={self.order_id}, listing={self.listing_id}>"


class Bid(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        COUNTERED = "COUNTERED", "Countered"
        EXPIRED = "EXPIRED", "Expired"

    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="bids"
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bids"
    )
    offered_price = models.DecimalField(max_digits=12, decimal_places=2)
    offered_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.PENDING
    )
    parent_bid = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="counter_bids",
    )
    message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bids"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Bid<{self.listing_id}:{self.buyer_id}:{self.status}>"
