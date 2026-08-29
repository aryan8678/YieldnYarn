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
