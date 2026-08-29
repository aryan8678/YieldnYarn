from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BidViewSet, OrderViewSet, RequirementViewSet

router = DefaultRouter()
router.register("requirements", RequirementViewSet, basename="requirement")
router.register("orders", OrderViewSet, basename="order")
router.register("bids", BidViewSet, basename="bid")

urlpatterns = [
    path("", include(router.urls)),
]
