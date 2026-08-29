from rest_framework import serializers

from .models import PricePoint


class PricePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricePoint
        fields = [
            "id",
            "vertical",
            "commodity",
            "region",
            "price",
            "source",
            "timestamp",
            "raw_data",
        ]
        read_only_fields = ["id"]
