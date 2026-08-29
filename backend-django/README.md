# MSME Marketplace — Django Backend

Django + DRF backend for the MSME Multi-Vertical Commodity Marketplace
(Admin/CRUD/Auth service). See `implementation_plan.md` (§3, §4) in the
repo root for the full design.

## Apps

| App | Models | Responsibility |
|---|---|---|
| `accounts` | `User`, `UserProfile` | Custom email-based user, JWT auth, RBAC roles (SELLER/BUYER/ADMIN/VERIFIER) |
| `config` | `Vertical`, `GradingSchema`, `PricingRule` | Vertical plug-in config (admin-managed) |
| `catalog` | `Listing`, `GradingEvidence`, `GradingResult` | Listings, evidence upload, grading results, verification queue |
| `orders` | `Requirement`, `Order`, `OrderAllocation`, `Bid` | Buyer requirements, orders, allocations, bid negotiation |
| `disputes` | `Dispute` | Dispute lifecycle |
| `notifications` | `Notification` | In-app notifications (+ FCM dispatch stub via signal) |
| `reputation` | `ReputationScore` | Per-user trust/reputation scores |
| `pricing` | `PricePoint` | Market price data (AGMARKNET / Admin-entered / CCI), read by FastAPI's pricing service |

## Requirements

- Python 3.11+ (tested with 3.14)
- A running PostgreSQL instance (the repo-root `docker-compose.yml` provides
  a PostGIS-enabled Postgres container, `msme-postgres`, on `localhost:5432`)
- The repo-root `.env` file (`SoftwareEnggProject/.env`) with at least:

  ```
  DB_NAME=msme_marketplace
  DB_USER=msme_dev
  DB_PASSWORD=devpassword
  DB_HOST=localhost
  DB_PORT=5432
  DJANGO_SECRET_KEY=...
  DJANGO_DEBUG=True
  DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
  CORS_ALLOWED_ORIGINS=http://localhost:3000
  MEDIA_ROOT=./media
  JWT_ACCESS_TOKEN_LIFETIME_MIN=15
  JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
  ```

  This file is loaded automatically by `core/settings.py` via `python-dotenv`
  (path resolved as `backend-django/../.env`).

## Setup

```bash
cd backend-django
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Database

Make sure Postgres is up (via the root `docker-compose.yml`):

```bash
cd ..
docker compose up -d db
```

Then, from `backend-django/`:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
```

## Running

```bash
python manage.py runserver
```

The API is served at `http://localhost:8000/api/...` and the Django admin
at `http://localhost:8000/admin/`.

## Notes on design decisions

- **Location fields:** Rather than using GeoDjango/PostGIS ORM fields, all
  `location`/`region` columns are stored as plain `location_lat` /
  `location_lng` (or `region_lat` / `region_lng`) `FloatField` pairs. This
  keeps the ORM setup simple and avoids requiring `GDAL`/`GEOS` on the dev
  machine, while the underlying Postgres container still has PostGIS
  available if geospatial queries are added later.
- **Media storage:** Uses Django's local `FileSystemStorage` (see
  `STORAGES["default"]` in `core/settings.py`). This is structured so it can
  be swapped for `storages.backends.azure_storage.AzureStorage`
  (from `django-storages`) later, by changing that one setting and adding
  `AZURE_*` credentials — no model or view changes required.
- **Custom user model:** `accounts.User` uses `AbstractBaseUser` +
  `PermissionsMixin` with `email` as the login field (`USERNAME_FIELD`),
  plus a `role` field used for RBAC everywhere in DRF permission classes
  (see `core/permissions.py`).
- **RBAC:** Shared permission classes live in `core/permissions.py`
  (`IsAdmin`, `IsSeller`, `IsBuyer`, `IsVerifier`, `IsVerifierOrAdmin`,
  `IsAdminOrReadOnly`, `IsListingOwnerOrReadOnly`, `IsOwnerOrAdmin`,
  `IsBidPartyOrAdmin`). Per-viewset `get_queryset()` overrides additionally
  filter results by role (e.g. buyers only ever see `ACTIVE` listings,
  sellers only see their own listings, verifiers only see
  `PENDING_VERIFICATION` listings).
- **Grading trigger:** `POST /api/catalog/listings/{id}/grading/trigger/` is
  currently a stub that returns `202 Accepted` — it does not yet call the
  FastAPI grading service. See the `TODO` in `catalog/views.py`.
- **FCM dispatch:** A `post_save` signal on `Notification`
  (`notifications/signals.py`) logs a `TODO(FCM)` line instead of actually
  sending a push notification. Wire up the Firebase Admin SDK there when
  ready.
- **Idempotent listing sync:** `Listing.client_uuid` (a client-generated
  UUID, unique) lets the offline-first Kotlin seller app safely re-POST the
  same listing on reconnection without creating duplicates.

## API Endpoints

See `implementation_plan.md` §4.2 for the full canonical list. Summary:

```
# Auth
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/refresh/
GET    /api/auth/me/

# Config (Admin write, everyone authenticated can read)
GET/POST     /api/config/verticals/
GET/PUT      /api/config/verticals/{id}/
GET/PUT      /api/config/verticals/{id}/grading-schema/
GET/PUT      /api/config/verticals/{id}/pricing-rules/

# Catalog
GET/POST     /api/catalog/listings/
GET/PUT      /api/catalog/listings/{id}/
POST         /api/catalog/listings/{id}/evidence/
GET          /api/catalog/listings/{id}/grading/
POST         /api/catalog/listings/{id}/grading/trigger/

# Verification queue (Verifier + Admin)
GET          /api/verification/queue/
POST         /api/verification/queue/{listing_id}/review/

# Orders
GET/POST     /api/orders/requirements/
GET/PUT      /api/orders/requirements/{id}/
GET          /api/orders/orders/
GET          /api/orders/orders/{id}/
GET/POST     /api/orders/bids/
GET/PUT      /api/orders/bids/{id}/

# Disputes
GET/POST     /api/disputes/
GET/PUT      /api/disputes/{id}/

# Notifications
GET          /api/notifications/
POST         /api/notifications/{id}/read/
POST         /api/notifications/read-all/

# Reputation
GET          /api/reputation/{user_id}/

# Pricing (market data — read by FastAPI's pricing/matching services)
GET/POST     /api/pricing/price-points/
```

## Tests

A basic smoke test covers the register → login → `/me/` flow:

```bash
python manage.py test accounts
```

## Django Admin

All models across all apps are registered in each app's `admin.py`, so the
full schema is manageable at `/admin/` once you've created a superuser.
