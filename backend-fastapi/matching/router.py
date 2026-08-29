"""Matching endpoints (implementation_plan.md §5.2, §5.3).

    POST /compute/matching/find      {requirement_id} -> dry-run allocation preview
    POST /compute/matching/allocate  {requirement_id, strategy} -> persists Order + OrderAllocations
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from db import Listing, Order, OrderAllocation, ReputationScore, Requirement, get_db
from matching.allocation import Allocation, AllocationResult, ListingOffer, greedy_allocate
from matching.schemas import AllocateRequest, FindMatchesRequest

router = APIRouter(prefix="/compute/matching", tags=["matching"])


def _load_candidate_listings(db: Session, requirement: Requirement) -> list[ListingOffer]:
    """Build plain ListingOffer objects for the allocator from DB rows.

    Two documented simplifications (first pass, not gold-plated):

    1. Grade: §3.1 doesn't define an explicit `grade` column on `listings` —
       a listing's grade is expected to come from the latest
       `grading_results.attribute_scores`. Listings are passed through with
       `grade=None` (treated as ungraded, and therefore excluded whenever the
       requirement sets a `min_grade`) rather than aggregating
       attribute_scores into a single letter grade. Revisit once that
       contract solidifies.
    2. Region: `listings`/`requirements` store location as plain lat/lng
       floats (`location_lat`/`location_lng`, `region_lat`/`region_lng`)
       rather than a text region label, and `requirements` has no explicit
       search-radius field. Real geo-radius filtering (haversine distance or
       PostGIS ST_DWithin) is a documented TODO; `region` is left unset
       (None) on both sides for now, so `greedy_allocate`'s region filter is
       effectively a no-op.
    """
    stmt = select(Listing).where(
        Listing.vertical_id == requirement.vertical_id,
        Listing.status == "ACTIVE",
        Listing.quantity > 0,
    )
    if requirement.commodity:
        stmt = stmt.where(Listing.commodity_name.ilike(requirement.commodity))
    listings = db.execute(stmt).scalars().all()

    offers = []
    for listing in listings:
        reputation = db.execute(select(ReputationScore.score).where(ReputationScore.user_id == listing.seller_id)).scalar()
        offers.append(
            ListingOffer(
                listing_id=listing.id,
                available_quantity=listing.quantity,
                unit_price=listing.price_final or listing.price_suggested or 0.0,
                grade=None,  # TODO: derive from latest grading_results attribute_scores
                region=None,  # TODO: real lat/lng radius filtering (see docstring above)
                reputation_score=reputation or 0.0,
                status=listing.status,
            )
        )
    return offers


def _run_allocation(db: Session, requirement: Requirement) -> AllocationResult:
    offers = _load_candidate_listings(db, requirement)
    return greedy_allocate(
        quantity_needed=requirement.quantity,
        listings=offers,
        min_grade=requirement.min_grade or None,
        max_unit_price=requirement.max_price,
        region=None,  # TODO: derive from requirement.region_lat/region_lng once radius filtering exists
    )


def _serialize(allocations: list[Allocation]) -> list[dict]:
    return [{"listing_id": a.listing_id, "allocated_quantity": a.allocated_quantity, "unit_price": a.unit_price} for a in allocations]


@router.post("/find")
def find_matches(payload: FindMatchesRequest, db: Session = Depends(get_db)):
    try:
        requirement = db.get(Requirement, payload.requirement_id)
        if requirement is None:
            raise HTTPException(status_code=404, detail="requirement not found")
        result = _run_allocation(db, requirement)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail=f"Database not ready: {exc}") from exc

    return {
        "requirement_id": requirement.id,
        "matches": _serialize(result.allocations),
        "requested_quantity": result.requested_quantity,
        "allocated_quantity": result.allocated_quantity,
        "shortfall": result.shortfall,
        "fully_fulfilled": result.fully_fulfilled,
    }


@router.post("/allocate")
def allocate(payload: AllocateRequest, db: Session = Depends(get_db)):
    try:
        requirement = db.get(Requirement, payload.requirement_id)
        if requirement is None:
            raise HTTPException(status_code=404, detail="requirement not found")

        result = _run_allocation(db, requirement)
        if not result.allocations:
            raise HTTPException(status_code=409, detail="no matching listings available for this requirement")

        total_price = sum(a.allocated_quantity * a.unit_price for a in result.allocations)
        # Order.status only has PENDING/CONFIRMED/FULFILLED/DISPUTED/CANCELLED
        # (no dedicated "partial" status) — partial fulfillment is instead
        # visible via the API response's `fully_fulfilled`/`shortfall` fields.
        order = Order(
            requirement_id=requirement.id,
            buyer_id=requirement.buyer_id,
            status="PENDING",
            total_price=total_price,
            created_at=datetime.now(timezone.utc),  # Django's auto_now_add is ORM-layer only; DB column is NOT NULL
        )
        db.add(order)
        db.flush()  # populate order.id before creating child allocations

        for a in result.allocations:
            db.add(
                OrderAllocation(
                    order_id=order.id,
                    listing_id=a.listing_id,
                    allocated_quantity=a.allocated_quantity,
                    unit_price=a.unit_price,
                    status="PENDING",
                )
            )

        requirement.status = "MATCHED" if result.fully_fulfilled else "OPEN"
        db.commit()
        db.refresh(order)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Database not ready: {exc}") from exc

    return {
        "order_id": order.id,
        "allocations": _serialize(result.allocations),
        "total_price": total_price,
        "fully_fulfilled": result.fully_fulfilled,
        "shortfall": result.shortfall,
    }
