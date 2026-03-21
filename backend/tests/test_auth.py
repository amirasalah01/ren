"""
Tests for authentication endpoints
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Test user registration endpoint"""

    def test_user_can_register(self, api_client):
        """Test that a user can register with valid data"""
        url = "/api/auth/register/"
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "testpass123",
            "password2": "testpass123",  # ← Changed from password_confirm
            "first_name": "New",
            "last_name": "User",
        }
        response = api_client.post(url, data, format="json")

        # Check response status
        assert response.status_code == status.HTTP_201_CREATED

        # Verify user was created
        assert User.objects.filter(username="newuser").exists()

        # Verify email
        user = User.objects.get(username="newuser")
        assert user.email == "newuser@example.com"

    def test_user_registration_validates_email(self, api_client):
        """Test that email must be valid"""
        url = "/api/auth/register/"
        data = {
            "username": "newuser",
            "email": "invalid-email",
            "password": "testpass123",
            "password2": "testpass123",
        }
        response = api_client.post(url, data, format="json")

        # Should fail with 400
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_registration_requires_matching_passwords(self, api_client):
        """Test that passwords must match"""
        url = "/api/auth/register/"
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "testpass123",
            "password2": "differentpass",  # ← Doesn't match
        }
        response = api_client.post(url, data, format="json")

        # Should fail with 400
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_registration_requires_unique_username(self, test_user, api_client):
        """Test that usernames must be unique"""
        url = "/api/auth/register/"
        data = {
            "username": test_user.username,  # Use existing username
            "email": "different@example.com",
            "password": "testpass123",
            "password2": "testpass123",
        }
        response = api_client.post(url, data, format="json")

        # Should fail with 400
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLogin:
    """Test user login endpoint"""

    def test_user_can_login(self, api_client, test_user):
        """Test that a user can login with valid credentials"""
        url = "/api/auth/login/"
        data = {
            "email": "testuser@example.com",  # ← Changed from username to email
            "password": "testpass123",
        }
        response = api_client.post(url, data, format="json")

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

        # Should return tokens
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_fails_with_wrong_password(self, api_client, test_user):
        """Test that login fails with wrong password"""
        url = "/api/auth/login/"
        data = {
            "email": "testuser@example.com",  # ← Using email
            "password": "wrongpassword",
        }
        response = api_client.post(url, data, format="json")

        # Should fail
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_nonexistent_user(self, api_client):
        """Test that login fails for nonexistent user"""
        url = "/api/auth/login/"
        data = {
            "email": "nonexistent@example.com",  # ← Using email
            "password": "testpass123",
        }
        response = api_client.post(url, data, format="json")

        # Should fail
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_token_is_valid(self, api_client, test_user):
        """Test that returned token is valid and can be used"""
        url = "/api/auth/login/"
        data = {
            "email": "testuser@example.com",  # ← Using email
            "password": "testpass123",
        }
        response = api_client.post(url, data, format="json")

        # Get token
        token = response.data["access"]

        # Use token to access profile
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        profile_response = api_client.get("/api/auth/profile/")

        # Should succeed
        assert profile_response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestUserProfile:
    """Test user profile endpoints"""

    def test_authenticated_user_can_get_profile(self, authenticated_client, test_user):
        """Test that authenticated user can get their profile"""
        url = "/api/auth/profile/"
        response = authenticated_client.get(url)

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

        # Should contain user data
        assert response.data["username"] == "testuser"
        assert response.data["email"] == "testuser@example.com"

    def test_unauthenticated_user_cannot_get_profile(self, api_client):
        """Test that unauthenticated user cannot get profile"""
        url = "/api/auth/profile/"
        response = api_client.get(url)

        # Should fail with 401
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_update_profile(self, authenticated_client):
        """Test that authenticated user can update their profile"""
        url = "/api/auth/profile/"
        data = {"first_name": "Ahmed", "last_name": "Updated"}
        response = authenticated_client.put(url, data, format="json")

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

        # Verify data was updated
        assert response.data["first_name"] == "Ahmed"
        assert response.data["last_name"] == "Updated"


@pytest.mark.django_db
class TestUserDashboard:
    """Test user dashboard endpoint"""

    def test_authenticated_user_can_get_dashboard(self, authenticated_client):
        """Authenticated user receives a dashboard summary"""
        response = authenticated_client.get("/api/auth/dashboard/")

        assert response.status_code == status.HTTP_200_OK
        # All four top-level sections must be present
        assert "properties" in response.data
        assert "reviews" in response.data
        assert "messages" in response.data
        assert "favorites" in response.data

    def test_dashboard_properties_section(self, authenticated_client):
        """Dashboard properties section contains count and total_views"""
        response = authenticated_client.get("/api/auth/dashboard/")

        assert response.status_code == status.HTTP_200_OK
        assert "count" in response.data["properties"]
        assert "total_views" in response.data["properties"]
        assert response.data["properties"]["count"] == 0
        assert response.data["properties"]["total_views"] == 0

    def test_dashboard_messages_section(self, authenticated_client):
        """Dashboard messages section contains unread_count and total_received"""
        response = authenticated_client.get("/api/auth/dashboard/")

        assert response.status_code == status.HTTP_200_OK
        assert "unread_count" in response.data["messages"]
        assert "total_received" in response.data["messages"]

    def test_unauthenticated_user_cannot_get_dashboard(self, api_client):
        """Unauthenticated request must be rejected with 401"""
        response = api_client.get("/api/auth/dashboard/")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
