from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthFlowSmokeTest(APITestCase):
    def test_register_login_me_flow(self):
        register_url = reverse("auth-register")
        payload = {
            "email": "seller1@example.com",
            "phone": "9999999999",
            "password": "SuperSecret123",
            "role": "SELLER",
            "display_name": "Seller One",
        }
        response = self.client.post(register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(email="seller1@example.com").exists()
        )

        login_url = reverse("auth-login")
        response = self.client.post(
            login_url,
            {"email": "seller1@example.com", "password": "SuperSecret123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        access_token = response.data["access"]
        me_url = reverse("auth-me")
        response = self.client.get(
            me_url, HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "seller1@example.com")
        self.assertEqual(response.data["role"], "SELLER")

    def test_cannot_self_register_as_admin(self):
        register_url = reverse("auth-register")
        payload = {
            "email": "wannabe-admin@example.com",
            "password": "SuperSecret123",
            "role": "ADMIN",
        }
        response = self.client.post(register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AdminUserManagementTest(APITestCase):
    """GET/PATCH /api/auth/users/ — admin-only list + is_active toggle
    (accounts/views.py:AdminUserViewSet)."""

    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@example.com", password="pw12345"
        )
        self.buyer = User.objects.create_user(
            email="buyer@example.com", password="pw12345", role="BUYER"
        )

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("admin-user-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        emails = {u["email"] for u in response.data["results"]}
        self.assertEqual(emails, {"admin@example.com", "buyer@example.com"})

    def test_non_admin_cannot_list_users(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get(reverse("admin-user-list"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_toggle_is_active(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("admin-user-detail", args=[self.buyer.id]),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.buyer.refresh_from_db()
        self.assertFalse(self.buyer.is_active)

    def test_admin_cannot_change_role_via_this_endpoint(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("admin-user-detail", args=[self.buyer.id]),
            {"role": "ADMIN"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.buyer.refresh_from_db()
        self.assertEqual(self.buyer.role, "BUYER")
