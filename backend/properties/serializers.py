from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Favorite, Property, Review


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for properties"""

    owner = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    favorite_id = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "address",
            "city",
            "country",
            "bedrooms",
            "bathrooms",
            "square_feet",
            "property_type",
            "price_per_month",
            "available_from",
            "is_available",
            "view_count",
            "average_rating",
            "review_count",
            "is_favorite",
            "favorite_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "view_count", "created_at", "updated_at"]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            from django.db.models import Avg

            avg = reviews.aggregate(Avg("rating"))["rating__avg"]
            return round(avg, 2) if avg else 0
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_favorite_id(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            favorite = obj.favorited_by.filter(user=request.user).first()
            return favorite.id if favorite else None
        return None


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""

    reviewer = UserSerializer(read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "property",
            "property_title",
            "reviewer",
            "rating",
            "title",
            "comment",
            "helpful_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reviewer",
            "helpful_count",
            "created_at",
            "updated_at",
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""

    class Meta:
        model = Review
        fields = ["property", "rating", "title", "comment"]

    def create(self, validated_data):
        validated_data["reviewer"] = self.context["request"].user
        return super().create(validated_data)


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites"""

    property_detail = PropertySerializer(source="property", read_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "property", "property_detail", "created_at"]
        read_only_fields = ["id", "created_at"]
