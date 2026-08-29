from rest_framework import generics

from core.permissions import IsAdminOrReadOnly

from .models import PricePoint
from .serializers import PricePointSerializer


class PricePointListView(generics.ListCreateAPIView):
    """
    GET  /api/pricing/price-points/  — list (read-only for any authenticated user)
    POST /api/pricing/price-points/  — admin manually enters a price
                                        (source=ADMIN_ENTERED use case)
    """

    queryset = PricePoint.objects.select_related("vertical").all()
    serializer_class = PricePointSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["vertical", "commodity", "region", "source"]
