from django.urls import path

from .views import (
    FavoriteDetailView,
    FavoriteListCreateView,
    MyPropertiesView,
    PropertyDetailView,
    PropertyImageDeleteView,
    PropertyImageUploadView,
    PropertyListCreateView,
    PropertyRatingView,
    PropertySearchView,
    ReviewDetailView,
    ReviewListCreateView,
)

urlpatterns = [
    # Properties
    path("list/", PropertyListCreateView.as_view(), name="property-list"),
    path("<int:pk>/", PropertyDetailView.as_view(), name="property-detail"),
    path("my/", MyPropertiesView.as_view(), name="my-properties"),
    path("search/", PropertySearchView.as_view(), name="property-search"),
    # Property images
    path("<int:property_id>/images/", PropertyImageUploadView.as_view(), name="property-image-upload"),
    path("images/<int:pk>/", PropertyImageDeleteView.as_view(), name="property-image-delete"),
    # Reviews
    path(
        "<int:property_id>/reviews/",
        ReviewListCreateView.as_view(),
        name="property-reviews",
    ),
    path("review/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),
    path("<int:pk>/rating/", PropertyRatingView.as_view(), name="property-rating"),
    # Favorites
    path("favorites/", FavoriteListCreateView.as_view(), name="favorite-list"),
    path("favorite/<int:pk>/", FavoriteDetailView.as_view(), name="favorite-detail"),
]
