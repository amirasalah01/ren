from django.contrib.auth import authenticate, get_user_model
from django.db.models import Avg, Sum
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(APIView):
    """User registration endpoint"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "message": "User registered successfully",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            user = authenticate(username=user.username, password=password)
            if user is None:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "message": "Login successful",
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """User profile endpoint"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    """User dashboard — aggregated stats for the authenticated user"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from messaging.models import Message
        from properties.models import Favorite, Property, Review

        user = request.user

        # Property stats
        properties = Property.objects.filter(owner=user)
        property_count = properties.count()
        total_views = properties.aggregate(total=Sum("view_count"))["total"] or 0

        # Reviews received across all owned properties
        reviews_received = Review.objects.filter(property__owner=user)
        review_count = reviews_received.count()
        avg_rating = reviews_received.aggregate(avg=Avg("rating"))["avg"]

        # Message stats
        unread_count = Message.objects.filter(receiver=user, is_read=False).count()
        total_received = Message.objects.filter(receiver=user).count()

        # Favorites the user has saved
        favorite_count = Favorite.objects.filter(user=user).count()

        return Response(
            {
                "properties": {
                    "count": property_count,
                    "total_views": total_views,
                },
                "reviews": {
                    "received_count": review_count,
                    "average_rating": round(float(avg_rating), 2)
                    if avg_rating is not None
                    else None,
                },
                "messages": {
                    "unread_count": unread_count,
                    "total_received": total_received,
                },
                "favorites": {
                    "count": favorite_count,
                },
            }
        )
