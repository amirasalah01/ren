from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["sender", "receiver", "subject", "is_read", "created_at"]
    search_fields = ["sender__username", "receiver__username", "subject", "body"]
    list_filter = ["is_read", "created_at"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Message Details", {"fields": ("sender", "receiver", "subject", "body")}),
        ("Related", {"fields": ("property",)}),
        ("Status", {"fields": ("is_read",)}),
        ("Metadata", {"fields": ("created_at", "updated_at")}),
    )
