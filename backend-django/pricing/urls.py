from django.urls import path

from .views import PricePointListView

urlpatterns = [
    path("price-points/", PricePointListView.as_view(), name="price-point-list"),
]
