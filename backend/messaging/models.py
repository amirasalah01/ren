from django.db import models

from users.models import User


class Message(models.Model):
    # Sender & Receiver
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_messages"
    )

    # Message Content
    subject = models.CharField(max_length=255, blank=True, null=True)
    body = models.TextField()

    # Related Property (Optional)
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages",
    )

    # Message Status
    is_read = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "messages"
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"

    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        self.save()
