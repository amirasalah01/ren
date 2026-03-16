from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "first_name", "last_name", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]
    list_filter = ["is_active", "is_staff"]

    fieldsets = (
        (
            "User Information",
            {"fields": ("username", "email", "first_name", "last_name", "phone")},
        ),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
