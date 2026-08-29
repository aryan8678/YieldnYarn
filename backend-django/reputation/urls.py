from django.urls import path

from .views import ReputationDetailView

urlpatterns = [
    path("<int:user_id>/", ReputationDetailView.as_view(), name="reputation-detail"),
]
