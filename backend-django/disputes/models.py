from django.conf import settings
from django.db import models

from orders.models import Order


class Dispute(models.Model):
    class Type(models.TextChoices):
        GRADE_MISMATCH = "GRADE_MISMATCH", "Grade Mismatch"
        QUANTITY_SHORTAGE = "QUANTITY_SHORTAGE", "Quantity Shortage"
        QUALITY_DEFECT = "QUALITY_DEFECT", "Quality Defect"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        RESOLVED = "RESOLVED", "Resolved"
        ESCALATED = "ESCALATED", "Escalated"

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="disputes"
    )
    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="disputes_raised",
    )
    against = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="disputes_against",
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.OPEN
    )
    description = models.TextField(blank=True, default="")
    evidence_refs = models.JSONField(default=list, blank=True)
    resolution_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "disputes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Dispute<{self.id}:{self.type}:{self.status}>"
