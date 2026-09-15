from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Listing
from config.models import Vertical

from .models import Bid, Order, OrderAllocation, Requirement

User = get_user_model()


class RequirementViewSetTest(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(email="buyer@example.com", password="pw12345", role="BUYER")
        self.other_buyer = User.objects.create_user(email="buyer2@example.com", password="pw12345", role="BUYER")
        self.seller = User.objects.create_user(email="seller@example.com", password="pw12345", role="SELLER")
        self.admin = User.objects.create_superuser(email="admin@example.com", password="pw12345")
        self.vertical = Vertical.objects.create(name="Agriculture", slug="agriculture", unit_of_measure="kg")

        self.open_req = Requirement.objects.create(
            buyer=self.buyer, vertical=self.vertical, commodity="Wheat", quantity=100, status="OPEN"
        )
        self.matched_req = Requirement.objects.create(
            buyer=self.other_buyer, vertical=self.vertical, commodity="Rice", quantity=50, status="MATCHED"
        )

    def test_buyer_only_sees_own_requirements(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get("/api/orders/requirements/")

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["commodity"], "Wheat")

    def test_seller_only_sees_open_requirements(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.get("/api/orders/requirements/")

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["commodity"], "Wheat")

    def test_admin_sees_all_requirements(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/orders/requirements/")

        self.assertEqual(response.data["count"], 2)

    def test_create_sets_buyer_to_requesting_user(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.post(
            "/api/orders/requirements/",
            {"vertical": self.vertical.id, "commodity": "Chana", "quantity": "40.00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["buyer"], self.buyer.id)
        self.assertEqual(response.data["search_radius_km"], 100.0)  # model default
        self.assertEqual(response.data["region"], "")  # model default

    def test_create_persists_free_text_region(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.post(
            "/api/orders/requirements/",
            {
                "vertical": self.vertical.id,
                "commodity": "Chana",
                "quantity": "40.00",
                "region": "Uttar Pradesh",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["region"], "Uttar Pradesh")
        self.assertIsNone(response.data["region_lat"])  # independent of the free-text label

    def test_buyer_cannot_retrieve_another_buyers_requirement(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get(f"/api/orders/requirements/{self.matched_req.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class OrderViewSetTest(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(email="buyer@example.com", password="pw12345", role="BUYER")
        self.other_buyer = User.objects.create_user(email="buyer2@example.com", password="pw12345", role="BUYER")
        self.seller = User.objects.create_user(email="seller@example.com", password="pw12345", role="SELLER")
        self.other_seller = User.objects.create_user(email="seller2@example.com", password="pw12345", role="SELLER")
        self.admin = User.objects.create_superuser(email="admin@example.com", password="pw12345")
        self.vertical = Vertical.objects.create(name="Agriculture", slug="agriculture", unit_of_measure="kg")

        self.listing = Listing.objects.create(
            seller=self.seller, vertical=self.vertical, commodity_name="Wheat",
            quantity=100, unit="kg", status="ACTIVE",
        )
        self.order = Order.objects.create(buyer=self.buyer, status="CONFIRMED", total_price=1000)
        self.order.allocations.create(listing=self.listing, allocated_quantity=10, unit_price=100, status="PENDING")

        self.other_order = Order.objects.create(buyer=self.other_buyer, status="PENDING", total_price=500)

    def test_buyer_only_sees_own_orders(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get("/api/orders/orders/")

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.order.id)

    def test_allocations_include_denormalized_listing_fields(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get("/api/orders/orders/")

        allocation = response.data["results"][0]["allocations"][0]
        self.assertEqual(allocation["commodity_name"], "Wheat")
        self.assertEqual(allocation["unit"], "kg")
        self.assertEqual(allocation["seller_name"], self.seller.email)  # no profile set

    def test_seller_sees_orders_allocated_from_their_listings(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.get("/api/orders/orders/")

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.order.id)

    def test_unrelated_seller_sees_no_orders(self):
        self.client.force_authenticate(user=self.other_seller)

        response = self.client.get("/api/orders/orders/")

        self.assertEqual(response.data["count"], 0)

    def test_admin_sees_all_orders(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/orders/orders/")

        self.assertEqual(response.data["count"], 2)

    def test_orders_are_read_only(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.post(
            "/api/orders/orders/", {"status": "PENDING", "total_price": "500.00"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class BidViewSetTest(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(email="buyer@example.com", password="pw12345", role="BUYER")
        self.other_buyer = User.objects.create_user(email="buyer2@example.com", password="pw12345", role="BUYER")
        self.seller = User.objects.create_user(email="seller@example.com", password="pw12345", role="SELLER")
        self.stranger_seller = User.objects.create_user(email="seller2@example.com", password="pw12345", role="SELLER")
        self.admin = User.objects.create_superuser(email="admin@example.com", password="pw12345")
        self.vertical = Vertical.objects.create(name="Agriculture", slug="agriculture", unit_of_measure="kg")

        self.listing = Listing.objects.create(
            seller=self.seller, vertical=self.vertical, commodity_name="Wheat",
            quantity=100, unit="kg", status="ACTIVE",
        )
        self.bid = Bid.objects.create(
            listing=self.listing, buyer=self.buyer, offered_price=2000, offered_quantity=50
        )
        self.detail_url = f"/api/orders/bids/{self.bid.id}/"

    def test_buying_party_can_retrieve(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listing_owner_can_retrieve(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unrelated_seller_cannot_see_it_in_list(self):
        self.client.force_authenticate(user=self.stranger_seller)
        response = self.client.get("/api/orders/bids/")
        self.assertEqual(response.data["count"], 0)

    def test_unrelated_buyer_cannot_see_it_in_list(self):
        self.client.force_authenticate(user=self.other_buyer)
        response = self.client.get("/api/orders/bids/")
        self.assertEqual(response.data["count"], 0)

    def test_create_sets_buyer_to_requesting_user(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.post(
            "/api/orders/bids/",
            {"listing": self.listing.id, "offered_price": "2100.00", "offered_quantity": "40.00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["buyer"], self.buyer.id)

    def test_listing_owner_can_accept_bid(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bid.refresh_from_db()
        self.assertEqual(self.bid.status, Bid.Status.ACCEPTED)

    def test_accepting_a_bid_creates_a_real_order_and_allocation(self):
        # Regression check: accepting used to be a pure status flip — no
        # Order/OrderAllocation ever materialized, so the buyer's "my
        # orders" page would never show a bid they'd successfully closed.
        self.client.force_authenticate(user=self.seller)

        response = self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.get()
        self.assertEqual(order.buyer_id, self.buyer.id)
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.assertEqual(order.total_price, 2000 * 50)

        self.assertEqual(OrderAllocation.objects.count(), 1)
        allocation = OrderAllocation.objects.get()
        self.assertEqual(allocation.order_id, order.id)
        self.assertEqual(allocation.listing_id, self.listing.id)
        self.assertEqual(allocation.allocated_quantity, 50)
        self.assertEqual(allocation.unit_price, 2000)
        self.assertEqual(allocation.status, OrderAllocation.Status.CONFIRMED)

    def test_accepting_a_bid_decrements_listing_quantity(self):
        self.client.force_authenticate(user=self.seller)

        self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")

        self.listing.refresh_from_db()
        self.assertEqual(self.listing.quantity, 50)  # 100 - 50
        self.assertEqual(self.listing.status, "ACTIVE")  # not exhausted

    def test_accepting_a_bid_for_the_full_quantity_marks_listing_sold(self):
        full_bid = Bid.objects.create(
            listing=self.listing, buyer=self.buyer, offered_price=1900, offered_quantity=100
        )
        self.client.force_authenticate(user=self.seller)

        response = self.client.patch(f"/api/orders/bids/{full_bid.id}/", {"status": "ACCEPTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.quantity, 0)
        self.assertEqual(self.listing.status, "SOLD")

    def test_buyer_cannot_accept_their_own_bid(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.bid.refresh_from_db()
        self.assertEqual(self.bid.status, Bid.Status.PENDING)
        self.assertEqual(Order.objects.count(), 0)

    def test_buyer_cannot_reject_their_own_bid(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.patch(self.detail_url, {"status": "REJECTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_accept_a_bid_on_someone_elses_listing(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), 1)

    def test_re_accepting_an_already_accepted_bid_does_not_double_book(self):
        self.bid.status = Bid.Status.ACCEPTED
        self.bid.save(update_fields=["status"])
        self.client.force_authenticate(user=self.seller)

        response = self.client.patch(self.detail_url, {"status": "ACCEPTED"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.count(), 0)
