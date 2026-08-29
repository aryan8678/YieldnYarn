from django.contrib import admin

from .models import ReputationScore


@admin.register(ReputationScore)
class ReputationScoreAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "role",
        "score",
        "grade_accuracy_score",
        "fulfillment_score",
        "payment_score",
        "total_transactions",
        "last_updated",
    ]
    search_fields = ["user__email"]
