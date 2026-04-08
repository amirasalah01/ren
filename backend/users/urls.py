from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import DashboardView, LoginView, ProfileView, RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
