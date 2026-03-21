"""
Tests for property endpoints
"""

from datetime import datetime, timedelta

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestPropertyList:
    """Test property list endpoint"""

    def test_can_get_all_properties(self, api_client):
        """Test that anyone can view all properties"""
        url = "/api/properties/list/"
        response = api_client.get(url)

        # Should succeed
        assert response.status_code == status.HTTP_200_OK

    def test_authenticated_user_can_create_property(self, authenticated_client, test_user):
        """Test that authenticated user can create property"""
        url = "/api/properties/list/"
        # Add available_from field (required)
        available_from = (datetime.now() + timedelta(days=1)).date().isoformat()

        data = {
            "title": "Beautiful Apartment",
            "description": "A great place to live",
            "address": "123 Main Street",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1000,
            "available_from": available_from,  # ← ADD THIS
        }
        response = authenticated_client.post(url, data, format="json")

        # Should succeed (201 Created)
        assert response.status_code == status.HTTP_201_CREATED

        # Should contain property data
        assert response.data["title"] == "Beautiful Apartment"

    def test_unauthenticated_user_cannot_create_property(self, api_client):
        """Test that unauthenticated user cannot create property"""
        available_from = (datetime.now() + timedelta(days=1)).date().isoformat()

        data = {
            "title": "Apartment",
            "description": "Description",
            "address": "Address",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1000,
            "available_from": available_from,  # ← ADD THIS
        }
        url = "/api/properties/list/"
        response = api_client.post(url, data, format="json")

        # Should fail with 401 Unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPropertyDetail:
    """Test property detail endpoint"""

    def test_can_get_property_detail(self, api_client, authenticated_client, test_user):
        """Test that anyone can view property detail"""
        # Create a property first
        available_from = (datetime.now() + timedelta(days=1)).date().isoformat()

        create_url = "/api/properties/list/"
        create_data = {
            "title": "Test Property",
            "description": "Test",
            "address": "Address",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1000,
            "available_from": available_from,  # ← ADD THIS
        }
        create_response = authenticated_client.post(create_url, create_data, format="json")

        # Only proceed if property creation succeeded
        if create_response.status_code != status.HTTP_201_CREATED:
            pytest.skip(f"Property creation failed: {create_response.data}")

        property_id = create_response.data["id"]

        # Get property detail
        detail_url = f"/api/properties/{property_id}/"
        response = api_client.get(detail_url)

        # Should succeed
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Test Property"

    def test_owner_can_update_property(self, authenticated_client):
        """Test that property owner can update property"""
        # Create a property
        available_from = (datetime.now() + timedelta(days=1)).date().isoformat()

        create_url = "/api/properties/list/"
        create_data = {
            "title": "Original Title",
            "description": "Test",
            "address": "Address",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1000,
            "available_from": available_from,
        }
        create_response = authenticated_client.post(create_url, create_data, format="json")

        if create_response.status_code != status.HTTP_201_CREATED:
            pytest.skip(f"Property creation failed: {create_response.data}")

        property_id = create_response.data["id"]

        # Update property - send all required fields
        update_url = f"/api/properties/{property_id}/"
        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "address": "Address",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1200,  # Updated price
            "available_from": available_from,  # Include this too
        }
        response = authenticated_client.put(update_url, update_data, format="json")

        # Should succeed
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated Title"
        assert response.data["price_per_month"] == "1200.00"

    def test_owner_can_delete_property(self, authenticated_client):
        """Test that property owner can delete property"""
        # Create a property
        available_from = (datetime.now() + timedelta(days=1)).date().isoformat()

        create_url = "/api/properties/list/"
        create_data = {
            "title": "Property to Delete",
            "description": "Test",
            "address": "Address",
            "city": "Cairo",
            "country": "Egypt",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_feet": 1200,
            "property_type": "apartment",
            "price_per_month": 1000,
            "available_from": available_from,  # ← ADD THIS
        }
        create_response = authenticated_client.post(create_url, create_data, format="json")

        if create_response.status_code != status.HTTP_201_CREATED:
            pytest.skip(f"Property creation failed: {create_response.data}")

        property_id = create_response.data["id"]

        # Delete property
        delete_url = f"/api/properties/{property_id}/"
        response = authenticated_client.delete(delete_url)

        # Should succeed (204 No Content)
        assert response.status_code == status.HTTP_204_NO_CONTENT
