from django.conf import settings
from django.db import models


class ReputationScore(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reputation",
    )
    role = models.CharField(max_length=20)
    score = models.FloatField(default=0.0)
    grade_accuracy_score = models.FloatField(default=0.0)
    fulfillment_score = models.FloatField(default=0.0)
    payment_score = models.FloatField(default=0.0)
    total_transactions = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reputation_scores"

    def __str__(self):
        return f"ReputationScore<{self.user_id}:{self.score}>"
