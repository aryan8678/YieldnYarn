from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdmin

from .models import User
from .serializers import (
    AdminUserSerializer,
    MyTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ -> JWT access + refresh tokens."""

    serializer_class = MyTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """GET /api/auth/me/"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    /api/auth/users/            (list, admin only)
    /api/auth/users/{id}/       (retrieve, partial_update — is_active only)

    Read/toggle only: email/phone/role edits and user creation/deletion are
    out of scope for this endpoint (registration owns creation).
    """

    queryset = User.objects.select_related("profile").all().order_by("-created_at")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    http_method_names = ["get", "patch", "head", "options"]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email"]
