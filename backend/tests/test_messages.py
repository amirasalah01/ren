"""
Tests for messaging endpoints
"""
import pytest
from rest_framework import status


@pytest.mark.django_db
class TestMessaging:
    """Test messaging functionality"""

    def test_authenticated_user_can_send_message(
        self, authenticated_client, test_user2
    ):
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

    def test_unauthenticated_user_cannot_send_message(
        self, api_client, test_user, test_user2
    ):
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
