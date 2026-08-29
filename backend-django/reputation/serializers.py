from rest_framework import serializers

from .models import ReputationScore


class ReputationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReputationScore
        fields = [
            "id",
            "user",
            "role",
            "score",
            "grade_accuracy_score",
            "fulfillment_score",
            "payment_score",
            "total_transactions",
            "last_updated",
        ]
        read_only_fields = fields
