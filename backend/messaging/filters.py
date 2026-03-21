import django_filters

from .models import Message


class MessageFilter(django_filters.FilterSet):
    # Search by sender username
    sender = django_filters.CharFilter(field_name="sender__username", lookup_expr="icontains")

    # Search by receiver username
    receiver = django_filters.CharFilter(field_name="receiver__username", lookup_expr="icontains")

    # Filter by read status
    is_read = django_filters.BooleanFilter(field_name="is_read")

    # Filter by subject
    subject = django_filters.CharFilter(field_name="subject", lookup_expr="icontains")

    # Filter by date range
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")

    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Message
        fields = ["is_read"]
