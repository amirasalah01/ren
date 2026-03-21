from django.db import models

from users.models import User


class Property(models.Model):
    """Property listing model"""

    # Owner
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="properties")

    # Basic Info
    title = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    # Details
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    square_feet = models.FloatField()

    # Type & Price
    property_type = models.CharField(
        max_length=50,
        choices=[
            ("apartment", "Apartment"),
            ("house", "House"),
            ("condo", "Condo"),
            ("villa", "Villa"),
            ("studio", "Studio"),
        ],
    )
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)

    # Availability
    available_from = models.DateField()
    is_available = models.BooleanField(default=True)

    # Tracking
    view_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"
        verbose_name = "Property"
        verbose_name_plural = "Properties"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.city}"


class Review(models.Model):
    """Review and Rating for properties"""

    # Foreign Keys
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="reviews")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_given")

    # Rating (1-5 stars)
    rating = models.IntegerField(
        choices=[(i, f'{i} Star{"s" if i != 1 else ""}') for i in range(1, 6)],
        default=5,
    )

    # Review Content
    title = models.CharField(max_length=255)
    comment = models.TextField()

    # Helpful votes
    helpful_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reviews"
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ["-created_at"]
        unique_together = ["property", "reviewer"]

    def __str__(self):
        return f"{self.reviewer} - {self.property.title} ({self.rating}★)"


class Favorite(models.Model):
    """User's favorite properties"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favorites"
        verbose_name = "Favorite"
        verbose_name_plural = "Favorites"
        unique_together = ["user", "property"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.property.title}"
