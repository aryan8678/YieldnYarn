"""Unit tests for the pure greedy allocation algorithm (§5.3). No DB required."""
from matching.allocation import ListingOffer, greedy_allocate


def test_exact_fulfillment_across_multiple_listings():
    listings = [
        ListingOffer(listing_id=1, available_quantity=50, unit_price=20, grade="A"),
        ListingOffer(listing_id=2, available_quantity=50, unit_price=25, grade="A"),
    ]

    result = greedy_allocate(quantity_needed=100, listings=listings)

    assert result.fully_fulfilled
    assert result.allocated_quantity == 100
    assert result.shortfall == 0
    assert [a.listing_id for a in result.allocations] == [1, 2]
    assert result.allocations[0].allocated_quantity == 50
    assert result.allocations[1].allocated_quantity == 50


def test_partial_fulfillment_when_supply_insufficient():
    listings = [
        ListingOffer(listing_id=1, available_quantity=30, unit_price=15, grade="A"),
    ]

    result = greedy_allocate(quantity_needed=100, listings=listings)

    assert not result.fully_fulfilled
    assert result.allocated_quantity == 30
    assert result.shortfall == 70
    assert len(result.allocations) == 1
    assert result.allocations[0].listing_id == 1


def test_reputation_tie_break_on_equal_price():
    listings = [
        ListingOffer(listing_id=1, available_quantity=100, unit_price=10, grade="A", reputation_score=3.0),
        ListingOffer(listing_id=2, available_quantity=100, unit_price=10, grade="A", reputation_score=4.5),
    ]

    result = greedy_allocate(quantity_needed=50, listings=listings)

    # Same unit price -> higher-reputation seller (listing 2) should be filled first.
    assert result.allocations[0].listing_id == 2
    assert result.allocations[0].allocated_quantity == 50
    assert len(result.allocations) == 1


def test_min_grade_filters_out_lower_grade_listings():
    listings = [
        ListingOffer(listing_id=1, available_quantity=100, unit_price=5, grade="C"),
        ListingOffer(listing_id=2, available_quantity=100, unit_price=8, grade="A"),
    ]

    result = greedy_allocate(quantity_needed=50, listings=listings, min_grade="A")

    assert [a.listing_id for a in result.allocations] == [2]
    assert result.fully_fulfilled


def test_inactive_listings_are_excluded():
    listings = [
        ListingOffer(listing_id=1, available_quantity=100, unit_price=5, grade="A", status="SOLD"),
        ListingOffer(listing_id=2, available_quantity=100, unit_price=8, grade="A", status="ACTIVE"),
    ]

    result = greedy_allocate(quantity_needed=20, listings=listings)

    assert [a.listing_id for a in result.allocations] == [2]
