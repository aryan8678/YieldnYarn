from rest_framework import serializers

from .models import GradingSchema, PricingRule, Vertical


class VerticalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vertical
        fields = ["id", "name", "slug", "unit_of_measure", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class GradingSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingSchema
        fields = ["id", "vertical", "attributes", "created_at", "updated_at"]
        read_only_fields = ["id", "vertical", "created_at", "updated_at"]


class PricingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingRule
        fields = ["id", "vertical", "rules", "created_at", "updated_at"]
        read_only_fields = ["id", "vertical", "created_at", "updated_at"]
