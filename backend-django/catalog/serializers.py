from rest_framework import serializers

from .models import GradingEvidence, GradingResult, Listing


class ListingSerializer(serializers.ModelSerializer):
    seller = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "client_uuid",
            "seller",
            "vertical",
            "commodity_name",
            "sub_category",
            "quantity",
            "unit",
            "price_suggested",
            "price_final",
            "location_lat",
            "location_lng",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "seller", "status", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["seller"] = self.context["request"].user
        return super().create(validated_data)


class GradingEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingEvidence
        fields = ["id", "listing", "file", "file_type", "uploaded_at"]
        read_only_fields = ["id", "listing", "uploaded_at"]


class GradingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingResult
        fields = [
            "id",
            "listing",
            "source",
            "confidence_score",
            "attribute_scores",
            "graded_by",
            "created_at",
            "notes",
        ]
        read_only_fields = ["id", "listing", "created_at"]
