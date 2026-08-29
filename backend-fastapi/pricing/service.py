"""Grade/quantity price-adjustment helpers over `pricing_rules.rules` JSONB.

This is a documented, working first pass (not gold-plated) over the
`pricing_rules` concept from implementation_plan.md §3.1. `rules` is a
free-form JSONField on the Django side; the shape used here matches the key
names documented in backend-django's `PricingRule` model docstring
(`grade_adjustment_table`, `quantity_tier_table`):

    {
      "grade_adjustment_table": [
        {"grade": "A", "multiplier": 1.15},
        {"grade": "B", "multiplier": 1.0},
        {"grade": "C", "multiplier": 0.85}
      ],
      "quantity_tier_table": [
        {"min_quantity": 0,   "multiplier": 1.0},
        {"min_quantity": 50,  "multiplier": 0.97},
        {"min_quantity": 200, "multiplier": 0.93}
      ]
    }

`quantity_tier_table` multipliers apply to the *highest* tier whose
min_quantity the requested quantity meets or exceeds (standard volume
discount ladder).
"""
from __future__ import annotations

from typing import Optional


def grade_multiplier(rules: Optional[dict], grade: Optional[str]) -> float:
    if not rules or not grade:
        return 1.0
    for row in rules.get("grade_adjustment_table", []):
        if row.get("grade") == grade:
            return float(row.get("multiplier", 1.0))
    return 1.0


def quantity_tier_multiplier(rules: Optional[dict], quantity: float) -> float:
    if not rules:
        return 1.0
    tiers = sorted(rules.get("quantity_tier_table", []), key=lambda t: t.get("min_quantity", 0))
    multiplier = 1.0
    for tier in tiers:
        if quantity >= tier.get("min_quantity", 0):
            multiplier = float(tier.get("multiplier", 1.0))
    return multiplier


def apply_adjustments(base_price: float, rules: Optional[dict], grade: Optional[str], quantity: float) -> float:
    """Apply grade + quantity-tier multipliers to a base unit price."""
    return round(base_price * grade_multiplier(rules, grade) * quantity_tier_multiplier(rules, quantity), 2)
