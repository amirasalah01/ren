"""
Pytest configuration and fixtures for all tests
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """
    Create a REST API client for unauthenticated requests
    """
    return APIClient()


@pytest.fixture
def test_user(db):
    """
    Create a test user for authentication tests
    """
    user = User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="testpass123",
        first_name="Test",
        last_name="User",
    )
    return user


@pytest.fixture
def test_user2(db):
    """
    Create a second test user for messaging tests
    """
    user = User.objects.create_user(
        username="testuser2",
        email="testuser2@example.com",
        password="testpass123",
        first_name="Test2",
        last_name="User2",
    )
    return user


@pytest.fixture
def authenticated_client(api_client, test_user):
    """
    Create authenticated API client with JWT token
    """
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def authenticated_client2(api_client, test_user2):
    """
    Create authenticated API client for second test user
    """
    refresh = RefreshToken.for_user(test_user2)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def jwt_token(test_user):
    """
    Generate JWT token for a test user
    """
    refresh = RefreshToken.for_user(test_user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
