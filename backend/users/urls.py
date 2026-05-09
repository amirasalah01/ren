from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import DashboardView, LoginView, ProfileView, RegisterView, UserSearchView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("users/search/", UserSearchView.as_view(), name="user-search"),
]