from django.urls import path

from .views import VerificationQueueView, VerificationReviewView

urlpatterns = [
    path("queue/", VerificationQueueView.as_view(), name="verification-queue"),
    path(
        "queue/<int:listing_id>/review/",
        VerificationReviewView.as_view(),
        name="verification-review",
    ),
]
