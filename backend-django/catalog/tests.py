from unittest.mock import MagicMock, patch

import httpx
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from config.models import Vertical

from .models import Listing

User = get_user_model()


class GradingTriggerTest(APITestCase):
    """POST /api/catalog/listings/{id}/grading/trigger/ -> proxies to FastAPI's
    POST /compute/grading/grade (catalog/views.py:trigger_grading)."""

    def setUp(self):
        self.vertical = Vertical.objects.create(
            name="Agriculture", slug="agriculture", unit_of_measure="kg"
        )
        self.seller = User.objects.create_user(
            email="seller@example.com", password="pw12345", role="SELLER"
        )
        self.listing = Listing.objects.create(
            seller=self.seller,
            vertical=self.vertical,
            commodity_name="Wheat",
            quantity=100,
            unit="kg",
        )
        self.client.force_authenticate(user=self.seller)
        self.url = f"/api/catalog/listings/{self.listing.id}/grading/trigger/"

    @patch("catalog.views.httpx.post")
    def test_trigger_grading_proxies_fastapi_response(self, mock_post):
        fastapi_body = {
            "listing_id": self.listing.id,
            "grading_result_id": 1,
            "attribute_scores": {"foreign_matter": 0.9},
            "overall_confidence": 0.92,
            "needs_verification": False,
            "method": "opencv-heuristic",
        }
        mock_post.return_value = MagicMock(status_code=200, json=lambda: fastapi_body)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, fastapi_body)

        mock_post.assert_called_once()
        called_url = mock_post.call_args.args[0]
        self.assertTrue(called_url.endswith("/compute/grading/grade"))
        self.assertEqual(
            mock_post.call_args.kwargs["json"], {"listing_id": self.listing.id}
        )

    @patch("catalog.views.httpx.post")
    def test_trigger_grading_returns_503_when_service_unreachable(self, mock_post):
        mock_post.side_effect = httpx.ConnectError("connection refused")

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch("catalog.views.httpx.post")
    def test_trigger_grading_returns_502_on_upstream_error(self, mock_post):
        mock_post.return_value = MagicMock(status_code=404, text="listing not found")

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    def test_trigger_grading_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
