from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse

class RootView(APIView):
    """Root API endpoint"""

    def get(self, request):
        return Response(
            {
                "message": "Welcome to Rentify API!",
                "endpoints": {
                    "admin": "/admin/",
                    "auth": "/api/auth/",
                    "properties": "/api/properties/",
                    "messages": "/api/messages/",
                },
            }
        )


def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/", include("users.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/messages/", include("messaging.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)