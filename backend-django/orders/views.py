from rest_framework import permissions, viewsets

from catalog.models import Listing
from core.permissions import IsBidPartyOrAdmin, IsOwnerOrAdmin

from .models import Bid, Order, Requirement
from .serializers import BidSerializer, OrderSerializer, RequirementSerializer


class RequirementViewSet(viewsets.ModelViewSet):
    """
    /api/orders/requirements/       (list, create)
    /api/orders/requirements/{id}/  (retrieve, update, destroy)
    """

    serializer_class = RequirementSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_fields = ["vertical", "status"]
    search_fields = ["commodity"]

    def get_queryset(self):
        user = self.request.user
        qs = Requirement.objects.select_related("buyer", "vertical").all()
        if user.is_superuser or user.role == "ADMIN":
            return qs
        if user.role == "BUYER":
            return qs.filter(buyer=user)
        # Sellers/verifiers can browse open requirements (demand signals)
        return qs.filter(status=Requirement.Status.OPEN)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/orders/orders/       (list)
    /api/orders/orders/{id}/  (retrieve)
    """

    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.select_related("buyer", "requirement").prefetch_related(
            "allocations__listing__seller__profile"
        )
        if user.is_superuser or user.role == "ADMIN":
            return qs
        if user.role == "BUYER":
            return qs.filter(buyer=user)
        if user.role == "SELLER":
            return qs.filter(allocations__listing__seller=user).distinct()
        return qs.none()


class BidViewSet(viewsets.ModelViewSet):
    """
    /api/orders/bids/       (list, create)
    /api/orders/bids/{id}/  (retrieve, update [accept/reject/counter])
    """

    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated, IsBidPartyOrAdmin]
    filterset_fields = ["listing", "status"]

    def get_queryset(self):
        user = self.request.user
        qs = Bid.objects.select_related("listing", "buyer").all()
        if user.is_superuser or user.role == "ADMIN":
            return qs
        if user.role == "BUYER":
            return qs.filter(buyer=user)
        if user.role == "SELLER":
            return qs.filter(listing__seller=user)
        return qs.none()
