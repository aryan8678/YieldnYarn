from django.db import models


class Vertical(models.Model):
    """A commodity vertical (e.g. Agriculture, Textiles) — the plug-in point."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    unit_of_measure = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "verticals"
        ordering = ["name"]

    def __str__(self):
        return self.name


class GradingSchema(models.Model):
    """Attribute definitions for grading a vertical's listings.

    `attributes` JSON shape (per implementation_plan.md):
    [{"name": str, "type": str, "range": [min, max], "ideal_value": Any,
      "weight": float, "gradeable_by_ml": bool}, ...]
    """

    vertical = models.OneToOneField(
        Vertical, on_delete=models.CASCADE, related_name="grading_schema"
    )
    attributes = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "grading_schemas"

    def __str__(self):
        return f"GradingSchema<{self.vertical.slug}>"


class PricingRule(models.Model):
    """Rule set for a vertical's pricing (grade-adjustment / quantity tiers).

    `rules` JSON shape (per implementation_plan.md):
    {"grade_adjustment_table": [...], "quantity_tier_table": [...]}
    """

    vertical = models.OneToOneField(
        Vertical, on_delete=models.CASCADE, related_name="pricing_rule"
    )
    rules = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pricing_rules"

    def __str__(self):
        return f"PricingRule<{self.vertical.slug}>"
