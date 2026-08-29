from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GradingSchemaDetailView, PricingRuleDetailView, VerticalViewSet

router = DefaultRouter()
router.register("verticals", VerticalViewSet, basename="vertical")

urlpatterns = [
    path(
        "verticals/<int:vertical_id>/grading-schema/",
        GradingSchemaDetailView.as_view(),
        name="vertical-grading-schema",
    ),
    path(
        "verticals/<int:vertical_id>/pricing-rules/",
        PricingRuleDetailView.as_view(),
        name="vertical-pricing-rules",
    ),
    path("", include(router.urls)),
]
