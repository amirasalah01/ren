from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    # Include sender and receiver details
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "subject",
            "body",
            "property",
            "is_read",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sender", "created_at", "updated_at"]


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""

    class Meta:
        model = Message
        fields = ["receiver", "subject", "body", "property"]

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)
