"""
Tests for messaging endpoints
"""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestMessaging:
    """Test messaging functionality"""

    def test_authenticated_user_can_send_message(self, authenticated_client, test_user2):
        """Test that authenticated user can send a message"""
        url = "/api/messages/send/"
        data = {
            "receiver": test_user2.id,
            "title": "Hello",
            "body": "This is a test message",
        }
        response = authenticated_client.post(url, data, format="json")

        # Should succeed
        assert response.status_code == status.HTTP_201_CREATED

    def test_unauthenticated_user_cannot_send_message(self, api_client, test_user, test_user2):
        """Test that unauthenticated user cannot send message"""
        url = "/api/messages/send/"
        data = {
            "receiver": test_user2.id,
            "title": "Hello",
            "body": "This is a test message",
        }
        response = api_client.post(url, data, format="json")

        # Should fail
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_get_inbox(self, authenticated_client):
        """Test that authenticated user can get their inbox"""
        url = "/api/messages/inbox/"
        response = authenticated_client.get(url)

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_get_sent(self, authenticated_client):
        """Test that authenticated user can get sent messages"""
        url = "/api/messages/sent/"
        response = authenticated_client.get(url)

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

    def test_email_notification_sent_on_new_message(
        self, authenticated_client, test_user2, mailoutbox
    ):
        """Sending a message should trigger an email notification to the receiver"""
        url = "/api/messages/send/"
        data = {
            "receiver": test_user2.id,
            "subject": "Hello from tests",
            "body": "This is a notification test.",
        }
        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        # One email should have been dispatched
        assert len(mailoutbox) == 1
        email = mailoutbox[0]
        # Recipient is the receiver
        assert test_user2.email in email.to
        # Subject mentions the sender and the message subject
        assert "testuser" in email.subject
        assert "Hello from tests" in email.subject
