from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        GRADING_COMPLETE = "GRADING_COMPLETE", "Grading Complete"
        ORDER_MATCHED = "ORDER_MATCHED", "Order Matched"
        BID_RECEIVED = "BID_RECEIVED", "Bid Received"
        DISPUTE_UPDATE = "DISPUTE_UPDATE", "Dispute Update"
        SYSTEM = "SYSTEM", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True, default="")
    related_object_type = models.CharField(max_length=50, blank=True, default="")
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    fcm_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "is_read"], name="idx_notif_user_unread"
            ),
        ]

    def __str__(self):
        return f"Notification<{self.user_id}:{self.type}>"
