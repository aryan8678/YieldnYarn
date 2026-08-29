from django.utils import timezone
from rest_framework import serializers

from .models import Dispute


class DisputeSerializer(serializers.ModelSerializer):
    raised_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id",
            "order",
            "raised_by",
            "against",
            "type",
            "status",
            "description",
            "evidence_refs",
            "resolution_notes",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = ["id", "raised_by", "created_at", "resolved_at"]

    def create(self, validated_data):
        validated_data["raised_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")
        if new_status in (Dispute.Status.RESOLVED,) and instance.status != new_status:
            validated_data["resolved_at"] = timezone.now()
        return super().update(instance, validated_data)
