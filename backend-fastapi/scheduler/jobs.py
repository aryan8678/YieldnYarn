"""APScheduler job functions (implementation_plan.md §5.4).

Kept separate from main.py for clarity/testability. main.py registers these
with an AsyncIOScheduler on app startup:

    scheduler.add_job(ingest_agmarknet_prices, "interval", hours=6)
    scheduler.add_job(expire_stale_listings, "cron", hour=2, minute=0)
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("scheduler.jobs")

# Listings sitting ACTIVE (unsold) longer than this are considered stale.
STALE_LISTING_DAYS = 30


def ingest_agmarknet_prices() -> None:
    """Fetch latest commodity prices from the Agmarknet API and upsert into `price_points`.

    TODO: real Agmarknet API integration is future work. Agmarknet
    (https://agmarknet.gov.in) exposes daily mandi price data; once
    integrated, this job should:
      1. Call the Agmarknet API/data feed for each tracked commodity/region.
      2. Upsert rows into PricePoint (vertical_id, commodity, region, price,
         source="AGMARKNET", timestamp, raw_data=<raw API payload>).
      3. Handle partial failures per-commodity without aborting the whole run.

    For now this is a stub so the scheduler wiring (interval: every 6 hours)
    is in place and easy to verify/observe via logs.
    """
    logger.info(
        "[scheduler] ingest_agmarknet_prices stub run at %s -- TODO: integrate real Agmarknet API "
        "and upsert into PricePoint (see implementation_plan.md §5.4).",
        datetime.now(timezone.utc).isoformat(),
    )


def expire_stale_listings() -> None:
    """Mark ACTIVE listings older than STALE_LISTING_DAYS (by updated_at) as EXPIRED.

    Runs daily at 02:00. Uses a direct SQL UPDATE for efficiency rather than
    loading/saving each row via the ORM.
    """
    # Imported lazily to avoid a hard import-time dependency between
    # scheduler and db (keeps this module cheap to import in isolation/tests).
    from db import Listing, SessionLocal

    cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_LISTING_DAYS)
    session = SessionLocal()
    try:
        result = session.execute(
            update(Listing).where(Listing.status == "ACTIVE", Listing.updated_at < cutoff).values(status="EXPIRED")
        )
        session.commit()
        logger.info(
            "[scheduler] expire_stale_listings: marked %s listing(s) EXPIRED (older than %sd)",
            result.rowcount,
            STALE_LISTING_DAYS,
        )
    except SQLAlchemyError as exc:
        session.rollback()
        logger.warning("[scheduler] expire_stale_listings skipped/failed (DB likely not migrated yet): %s", exc)
    finally:
        session.close()
