from django.urls import path

from .views import DashboardView, LoginView, ProfileView, RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/dashboard/", DashboardView.as_view(), name="dashboard"),
]
