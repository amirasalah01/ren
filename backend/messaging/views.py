from django.conf import settings
from django.core.mail import send_mail
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions
from rest_framework.response import Response

from .filters import MessageFilter
from .models import Message
from .serializers import MessageCreateSerializer, MessageSerializer

_NO_SUBJECT = "(no subject)"


class SendMessageView(generics.CreateAPIView):
    """
    Send a new message (authenticated)
    """

    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Notify the receiver by email
        subject_line = message.subject or _NO_SUBJECT
        send_mail(
            subject=f"New message from {message.sender.username}: {subject_line}",
            message=message.body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[message.receiver.email],
            fail_silently=True,
        )


class InboxView(generics.ListAPIView):
    """
    Get all messages received by current user (authenticated)
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = MessageFilter
    search_fields = ["sender__username", "subject", "body"]
    ordering_fields = ["created_at", "is_read"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Message.objects.filter(receiver=self.request.user)


class SentView(generics.ListAPIView):
    """
    Get all messages sent by current user (authenticated)
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = MessageFilter
    search_fields = ["receiver__username", "subject", "body"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a message (owner only)
    """

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.receiver != self.request.user and obj.sender != self.request.user:
            raise permissions.PermissionDenied("You can only view your own messages")
        return obj

    def perform_destroy(self, instance):
        if instance.receiver != self.request.user and instance.sender != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own messages")
        instance.delete()


class MarkAsReadView(generics.UpdateAPIView):
    """
    Mark a message as read (receiver only)
    """

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.receiver != self.request.user:
            raise permissions.PermissionDenied("Only receiver can mark as read")
        return obj

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.mark_as_read()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ConversationView(generics.ListAPIView):
    """
    Get all messages between current user and another user (authenticated)
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        current_user = self.request.user

        # Get all messages between these two users
        return Message.objects.filter(
            sender__in=[current_user, user_id], receiver__in=[current_user, user_id]
        ).order_by("created_at")
