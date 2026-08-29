from rest_framework import serializers

from .models import Bid, Order, OrderAllocation, Requirement


class RequirementSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Requirement
        fields = [
            "id",
            "buyer",
            "vertical",
            "commodity",
            "quantity",
            "min_grade",
            "max_price",
            "budget",
            "region_lat",
            "region_lng",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "buyer", "status", "created_at"]

    def create(self, validated_data):
        validated_data["buyer"] = self.context["request"].user
        return super().create(validated_data)


class OrderAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAllocation
        fields = [
            "id",
            "order",
            "listing",
            "allocated_quantity",
            "unit_price",
            "status",
        ]
        read_only_fields = ["id"]


class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    allocations = OrderAllocationSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "requirement",
            "buyer",
            "status",
            "total_price",
            "created_at",
            "allocations",
        ]
        read_only_fields = ["id", "buyer", "created_at", "allocations"]

    def create(self, validated_data):
        validated_data["buyer"] = self.context["request"].user
        return super().create(validated_data)


class BidSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Bid
        fields = [
            "id",
            "listing",
            "buyer",
            "offered_price",
            "offered_quantity",
            "status",
            "parent_bid",
            "message",
            "created_at",
        ]
        read_only_fields = ["id", "buyer", "created_at"]

    def create(self, validated_data):
        validated_data["buyer"] = self.context["request"].user
        return super().create(validated_data)
