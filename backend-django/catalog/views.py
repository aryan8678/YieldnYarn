from rest_framework import parsers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsListingOwnerOrReadOnly, IsVerifierOrAdmin

from .models import GradingEvidence, GradingResult, Listing
from .serializers import (
    GradingEvidenceSerializer,
    GradingResultSerializer,
    ListingSerializer,
)


class ListingViewSet(viewsets.ModelViewSet):
    """
    /api/catalog/listings/                       (list, create)
    /api/catalog/listings/{id}/                   (retrieve, update, destroy)
    /api/catalog/listings/{id}/evidence/          (POST file upload)
    /api/catalog/listings/{id}/grading/           (GET grading results)
    /api/catalog/listings/{id}/grading/trigger/   (POST -> triggers FastAPI grading)
    """

    serializer_class = ListingSerializer
    permission_classes = [IsListingOwnerOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_fields = ["vertical", "status", "seller"]
    search_fields = ["commodity_name", "sub_category"]

    def get_queryset(self):
        user = self.request.user
        qs = Listing.objects.select_related("seller", "vertical").all()

        if not user.is_authenticated:
            return qs.filter(status=Listing.Status.ACTIVE)

        if user.is_superuser or user.role == "ADMIN":
            return qs
        if user.role == "SELLER":
            return qs.filter(seller=user)
        if user.role == "VERIFIER":
            return qs.filter(status=Listing.Status.PENDING_VERIFICATION)
        # BUYER (and any other authenticated role) only sees ACTIVE listings
        return qs.filter(status=Listing.Status.ACTIVE)

    def perform_create(self, serializer):
        serializer.save(
            seller=self.request.user, status=Listing.Status.PENDING_GRADING
        )

    @action(detail=True, methods=["post"], url_path="evidence")
    def upload_evidence(self, request, pk=None):
        listing = self.get_object()
        serializer = GradingEvidenceSerializer(
            data={**request.data, "listing": listing.id}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(listing=listing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="grading")
    def grading(self, request, pk=None):
        listing = self.get_object()
        results = listing.grading_results.all()
        return Response(GradingResultSerializer(results, many=True).data)

    @action(detail=True, methods=["post"], url_path="grading/trigger")
    def trigger_grading(self, request, pk=None):
        listing = self.get_object()
        # TODO: call the FastAPI grading service (backend-fastapi/grading/)
        # e.g. httpx.post(f"{FASTAPI_BASE_URL}/grading/trigger", json={"listing_id": listing.id})
        # For now this is a stub that just acknowledges the request.
        return Response(
            {
                "detail": "Grading trigger accepted.",
                "listing_id": listing.id,
                "todo": "Will call FastAPI grading service.",
            },
            status=status.HTTP_202_ACCEPTED,
        )


class VerificationQueueView(APIView):
    """GET /api/verification/queue/  (Verifier + Admin only)"""

    permission_classes = [IsVerifierOrAdmin]

    def get(self, request):
        listings = Listing.objects.filter(
            status=Listing.Status.PENDING_VERIFICATION
        ).select_related("seller", "vertical")
        return Response(ListingSerializer(listings, many=True).data)


class VerificationReviewView(APIView):
    """POST /api/verification/queue/{listing_id}/review/

    Body: {"decision": "APPROVE"|"REJECT", "notes": str, "attribute_scores": {...}}
    """

    permission_classes = [IsVerifierOrAdmin]

    def post(self, request, listing_id):
        try:
            listing = Listing.objects.get(
                pk=listing_id, status=Listing.Status.PENDING_VERIFICATION
            )
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found in verification queue."},
                status=status.HTTP_404_NOT_FOUND,
            )

        decision = request.data.get("decision", "APPROVE").upper()
        notes = request.data.get("notes", "")
        attribute_scores = request.data.get("attribute_scores", {})

        GradingResult.objects.create(
            listing=listing,
            source=GradingResult.Source.VERIFIER,
            confidence_score=1.0,
            attribute_scores=attribute_scores,
            graded_by=request.user,
            notes=notes,
        )

        listing.status = (
            Listing.Status.ACTIVE
            if decision == "APPROVE"
            else Listing.Status.DRAFT
        )
        listing.save(update_fields=["status", "updated_at"])

        return Response(ListingSerializer(listing).data)
