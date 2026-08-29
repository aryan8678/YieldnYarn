# backend-fastapi — Compute/ML Service

FastAPI service handling grading (ML), pricing, and matching/allocation
compute workloads for the MSME Multi-Vertical Commodity Marketplace. See
`implementation_plan.md` §5 and §9 in the repo root for the full design.

Django (`backend-django/`) owns user-facing CRUD, auth, and the source-of-truth
database migrations. This service reads/writes the same Postgres database via
SQLAlchemy for compute-heavy paths (grading inference, pricing calculators,
multi-listing allocation).

## Two-tier requirements

- **`requirements.txt`** — base runtime deps (FastAPI, SQLAlchemy, psycopg,
  APScheduler, etc.). Fast to install. The service boots and serves every
  route with only this installed — grading falls back to a deterministic
  stub result if the ML stack isn't present.
- **`requirements-ml.txt`** — heavy ML inference deps (opencv-python, torch,
  torchvision, ultralytics, numpy) for the real grading pipeline (§9).
  Install this only when you're ready to run actual image-based grading.
  `grading/pipeline.py` lazy-imports everything in this file and logs a
  clear `TODO` + falls back gracefully if it's missing.
- **`requirements-dev.txt`** — `pytest`, for running the unit test suite.

## Setup

```bash
cd backend-fastapi
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# optional, only for real ML grading:
# pip install -r requirements-ml.txt

# for running tests:
pip install -r requirements-dev.txt
```

Configuration is loaded via `pydantic-settings` from the monorepo root
`.env` (`../.env` relative to this directory), specifically `DATABASE_URL`.
If `.env` isn't found, a sensible local default matching
`docker-compose.yml` is used (`postgresql://msme_dev:devpassword@localhost:5432/msme_marketplace`).

## Run

```bash
uvicorn main:app --reload --port 8001
```

Then visit `http://localhost:8001/docs` for interactive API docs, or
`GET /health` for a basic liveness check (no DB access required).

> **Note:** most routes under `/compute/*` do query the database (via
> SQLAlchemy models in `db.py`, mirroring tables Django's migrations create).
> If those tables don't exist yet (e.g. Django migrations haven't run),
> routes will return a `503` with a clear "Database not ready" message
> instead of crashing the app — the service itself boots and serves `/docs`
> and `/health` regardless.

## Project layout

```
backend-fastapi/
├── main.py              FastAPI app, CORS, APScheduler lifespan, /health
├── db.py                Settings (pydantic-settings) + SQLAlchemy engine/session/models
├── grading/
│   ├── router.py         POST /compute/grading/grade, GET /compute/grading/status/{id}
│   ├── pipeline.py        OpenCV preprocessing + grade_attributes() with ML fallback
│   └── schemas.py         Pydantic request/response models
├── pricing/
│   ├── router.py          GET /compute/pricing/{base,adjusted,estimate,trends}
│   └── service.py         Grade/quantity-tier price adjustment helpers
├── matching/
│   ├── router.py          POST /compute/matching/{find,allocate}
│   ├── allocation.py      Pure greedy allocation algorithm (§5.3) — no DB deps
│   └── schemas.py
├── scheduler/
│   └── jobs.py            ingest_agmarknet_prices, expire_stale_listings (APScheduler jobs)
├── tests/
│   └── test_allocation.py Unit tests for the greedy allocation algorithm
├── requirements.txt
├── requirements-ml.txt
└── requirements-dev.txt
```

## Testing

```bash
pip install -r requirements-dev.txt
pytest
```

The test suite currently covers the pure `matching/allocation.py` algorithm
(exact fulfillment, partial fulfillment, reputation tie-breaking, grade
filtering, status filtering) with no database required.

## Table names

FastAPI's SQLAlchemy models in `db.py` mirror tables owned by Django's
migrations (built by a separate, concurrent agent). Table names/columns were
verified directly against the applied migrations and the live `msme-postgres`
schema (`psql \d <table>`) — Django uses an explicit `Meta.db_table` per
model matching the plain names from the plan's §3.1 (e.g. `verticals`,
`listings`, `grading_results`, `price_points`), not its default
`<app_label>_<modelname>` convention. If Django's schema changes, update the
affected model(s) in `db.py` to match.

## Known simplifications / TODOs

- **Grading** runs synchronously in the request/response cycle for now
  (no background job queue yet) and uses an OpenCV-feature heuristic proxy
  instead of trained MobileNetV3/YOLOv8n weights (see `grading/pipeline.py`).
- **Geospatial matching** — `listings`/`requirements` store location as
  plain `location_lat`/`location_lng` and `region_lat`/`region_lng` float
  columns (no PostGIS geometry column, no `geoalchemy2` dependency); this
  service currently skips radius-based filtering entirely (documented TODO
  in `matching/router.py`) rather than implementing haversine/`ST_DWithin`
  filtering, since `requirements` has no explicit search-radius field yet.
  Relatedly, `pricing/router.py`'s `/adjusted` endpoint looks up the most
  recent price point for a listing's commodity across *all* regions (rather
  than the listing's own region), since `listings` has no text region field
  to join against `price_points.region` — same underlying gap, documented
  inline.
- **Listing grade** — the schema doesn't define a single top-level `grade`
  field on listings; pricing/matching currently treat listings as ungraded
  pending a finalized way to derive a letter grade from
  `grading_results.attribute_scores`.
- **Agmarknet ingestion** is a stub (`scheduler/jobs.py`) — logs on each
  scheduled run; real API integration is future work.
