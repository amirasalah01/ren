import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    # Search by title
    title = django_filters.CharFilter(
        field_name="title", lookup_expr="icontains"  # Case-insensitive contains
    )

    # Filter by city
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")

    # Filter by property type
    property_type = django_filters.CharFilter(
        field_name="property_type", lookup_expr="iexact"  # Case-insensitive exact
    )

    # Filter by bedrooms (exact match)
    bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="exact")

    # Filter by price range
    price_min = django_filters.NumberFilter(
        field_name="price_per_month", lookup_expr="gte"  # Greater than or equal
    )

    price_max = django_filters.NumberFilter(
        field_name="price_per_month", lookup_expr="lte"  # Less than or equal
    )

    # Filter by availability
    is_available = django_filters.BooleanFilter(field_name="is_available")

    class Meta:
        model = Property
        fields = ["city", "property_type", "bedrooms", "is_available"]
