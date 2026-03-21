from django.urls import path

from .views import (
    ConversationView,
    InboxView,
    MarkAsReadView,
    MessageDetailView,
    SendMessageView,
    SentView,
)

urlpatterns = [
    # Send message
    path("send/", SendMessageView.as_view(), name="send-message"),
    # Inbox (received messages)
    path("inbox/", InboxView.as_view(), name="inbox"),
    # Sent (sent messages)
    path("sent/", SentView.as_view(), name="sent"),
    # Message detail (get, update, delete)
    path("<int:pk>/", MessageDetailView.as_view(), name="message-detail"),
    # Mark as read
    path("<int:pk>/read/", MarkAsReadView.as_view(), name="mark-as-read"),
    # Conversation with specific user
    path("conversation/<int:user_id>/", ConversationView.as_view(), name="conversation"),
]
