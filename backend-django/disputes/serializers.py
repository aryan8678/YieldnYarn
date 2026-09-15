from django.utils import timezone
from rest_framework import serializers

from catalog.serializers import _display_name

from .models import Dispute


class DisputeSerializer(serializers.ModelSerializer):
    raised_by = serializers.PrimaryKeyRelatedField(read_only=True)
    raised_by_name = serializers.SerializerMethodField()
    against_name = serializers.SerializerMethodField()

    class Meta:
        model = Dispute
        fields = [
            "id",
            "order",
            "raised_by",
            "raised_by_name",
            "against",
            "against_name",
            "type",
            "status",
            "description",
            "evidence_refs",
            "resolution_notes",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = ["id", "raised_by", "created_at", "resolved_at"]

    def get_raised_by_name(self, dispute):
        return _display_name(dispute.raised_by)

    def get_against_name(self, dispute):
        return _display_name(dispute.against)

    def create(self, validated_data):
        validated_data["raised_by"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status")
        if new_status in (Dispute.Status.RESOLVED,) and instance.status != new_status:
            validated_data["resolved_at"] = timezone.now()
        return super().update(instance, validated_data)
