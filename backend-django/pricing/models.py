from django.db import models

from config.models import Vertical


class PricePoint(models.Model):
    """Market price data point, per implementation_plan.md §3.1/§3.2.

    Read by the FastAPI `pricing` service (via SQLAlchemy / direct psycopg)
    to power price calculators and market price feeds.
    """

    class Source(models.TextChoices):
        AGMARKNET = "AGMARKNET", "AGMARKNET"
        ADMIN_ENTERED = "ADMIN_ENTERED", "Admin Entered"
        CCI = "CCI", "CCI"

    vertical = models.ForeignKey(
        Vertical, on_delete=models.CASCADE, related_name="price_points"
    )
    commodity = models.CharField(max_length=150)
    region = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=20, choices=Source.choices)
    timestamp = models.DateTimeField()
    raw_data = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "price_points"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(
                fields=["vertical", "commodity", "region", "-timestamp"],
                name="idx_price_points_lookup",
            ),
        ]

    def __str__(self):
        return f"PricePoint<{self.vertical_id}:{self.commodity}:{self.region}:{self.price}>"
