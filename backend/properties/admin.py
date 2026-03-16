from django.contrib import admin

from .models import Favorite, Property, Review


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["title", "city", "price_per_month", "owner", "is_available"]
    search_fields = ["title", "address", "city"]
    list_filter = ["property_type", "is_available", "created_at"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("title", "description", "property_type")}),
        ("Location", {"fields": ("address", "city", "country")}),
        ("Details", {"fields": ("bedrooms", "bathrooms", "square_feet")}),
        (
            "Pricing & Availability",
            {"fields": ("price_per_month", "available_from", "is_available")},
        ),
        ("Images & Rating", {"fields": ("main_image", "rating")}),
        ("Owner", {"fields": ("owner",)}),
        ("Metadata", {"fields": ("created_at", "updated_at")}),
    )

    @admin.register(Review)
    class ReviewAdmin(admin.ModelAdmin):
        list_display = ["reviewer", "property", "rating", "title", "created_at"]
        search_fields = ["reviewer__username", "property__title", "title", "comment"]
        list_filter = ["rating", "created_at"]
        readonly_fields = ["created_at", "updated_at"]

        fieldsets = (
            (
                "Review Details",
                {"fields": ("property", "reviewer", "rating", "title", "comment")},
            ),
            ("Engagement", {"fields": ("helpful_count",)}),
            ("Metadata", {"fields": ("created_at", "updated_at")}),
        )

        @admin.register(Favorite)
        class FavoriteAdmin(admin.ModelAdmin):
            list_display = ["user", "property", "created_at"]
            search_fields = ["user__username", "property__title"]
            list_filter = ["created_at"]
            readonly_fields = ["created_at"]
