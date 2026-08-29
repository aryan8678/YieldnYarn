from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "type",
            "title",
            "message",
            "related_object_type",
            "related_object_id",
            "is_read",
            "fcm_sent",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "fcm_sent",
            "created_at",
        ]
