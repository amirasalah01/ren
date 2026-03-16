from django.db import models
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import PropertyFilter
from .models import Favorite, Property, Review
from .serializers import (FavoriteSerializer, PropertySerializer,
                          ReviewCreateSerializer, ReviewSerializer)


class PropertyListCreateView(generics.ListCreateAPIView):
    """
    List all properties or create a new one (authenticated)
    """

    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PropertyFilter
    search_fields = ["title", "description", "city", "country"]
    ordering_fields = ["price_per_month", "created_at", "bedrooms"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Property.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a property (owner only)
    """

    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self):
        obj = super().get_object()
        # Track views on GET requests
        if self.request.method == "GET":
            obj.view_count += 1
            obj.save(update_fields=["view_count"])
        # Check ownership for edit/delete
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            if obj.owner != self.request.user:
                raise permissions.PermissionDenied(
                    "You can only edit your own properties"
                )
        return obj

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise permissions.PermissionDenied(
                "You can only delete your own properties"
            )
        instance.delete()


class MyPropertiesView(generics.ListAPIView):
    """
    Get all properties owned by current user (authenticated)
    """

    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PropertyFilter
    search_fields = ["title", "description", "city"]
    ordering_fields = ["price_per_month", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)


class PropertySearchView(generics.ListAPIView):
    """
    Advanced search and filter for properties
    """

    serializer_class = PropertySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["property_type", "bedrooms", "bathrooms", "is_available"]
    search_fields = ["title", "description", "city", "country", "address"]
    ordering_fields = ["price_per_month", "created_at", "view_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Property.objects.all()

        # Price range filter
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")

        if min_price:
            queryset = queryset.filter(price_per_month__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_month__lte=max_price)

        return queryset


class ReviewListCreateView(generics.ListCreateAPIView):
    """
    List all reviews for a property
    Create a new review (authenticated)
    """

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["title", "comment", "reviewer__username"]
    ordering_fields = ["rating", "created_at", "helpful_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        property_id = self.kwargs.get("property_id")
        return Review.objects.filter(property_id=property_id)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        property_id = self.kwargs.get("property_id")
        property_obj = Property.objects.get(id=property_id)
        serializer.save(property=property_obj, reviewer=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a review (reviewer only)
    """

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.reviewer != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own reviews")
        return obj

    def perform_destroy(self, instance):
        if instance.reviewer != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own reviews")
        instance.delete()


class PropertyRatingView(generics.RetrieveAPIView):
    """
    Get average rating for a property
    """

    queryset = Property.objects.all()
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        property_obj = self.get_object()
        reviews = property_obj.reviews.all()

        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg("rating"))["rating__avg"]
            total_reviews = reviews.count()
        else:
            avg_rating = 0
            total_reviews = 0

        return Response(
            {
                "property_id": property_obj.id,
                "property_title": property_obj.title,
                "average_rating": round(avg_rating, 2) if avg_rating else 0,
                "total_reviews": total_reviews,
                "rating_distribution": {
                    "5_star": reviews.filter(rating=5).count(),
                    "4_star": reviews.filter(rating=4).count(),
                    "3_star": reviews.filter(rating=3).count(),
                    "2_star": reviews.filter(rating=2).count(),
                    "1_star": reviews.filter(rating=1).count(),
                },
            }
        )


class FavoriteListCreateView(generics.ListCreateAPIView):
    """
    List user's favorite properties or add a favorite
    """

    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDetailView(generics.DestroyAPIView):
    """
    Remove a favorite property
    """

    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
