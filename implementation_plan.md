# MSME Multi-Vertical Commodity Marketplace — Full Implementation Plan

**Scope:** Agriculture + Textiles verticals only (MVP). Solo developer. Fully local build. Azure only in final migration phase.

This is a **single-phase, in-depth implementation plan** covering the entire project end-to-end: system dependencies, monorepo scaffold, both backends (Django + FastAPI), database, the Next.js web frontend (cloned from the Aceternity productized agency template and adapted for the marketplace), the Kotlin seller app, ML grading, and all supporting infrastructure.

> [!IMPORTANT]
> **Frontend approach:** The web-app will be built by 1:1 cloning the layout, animations, and design patterns from the [Aceternity productized agency template](https://productized-agency-template-acetern.vercel.app/) using **free open-source components only** (Aceternity UI, Magic UI, shadcn/ui). All text, imagery, sections, and navigation will be re-skinned for the MSME Marketplace context. No custom UI component design — everything sourced from these three libraries.

---

## Table of Contents

0. [Current Implementation Status](#0-current-implementation-status)
1. [System Dependencies & Environment Setup](#1-system-dependencies--environment-setup)
2. [Monorepo Scaffold & DevOps Foundation](#2-monorepo-scaffold--devops-foundation)
3. [Database Design & Docker Compose](#3-database-design--docker-compose)
4. [Backend — Django (Admin/CRUD/Auth)](#4-backend--django-admincrudauth)
5. [Backend — FastAPI (Compute/ML)](#5-backend--fastapi-computeml)
6. [Frontend — Web App (Next.js) — Landing/Marketing Site](#6-frontend--web-app-nextjs--landingmarketing-site)
7. [Frontend — Web App (Next.js) — Application Pages](#7-frontend--web-app-nextjs--application-pages)
8. [Seller Mobile App (Kotlin/Android)](#8-seller-mobile-app-kotlinandroid)
9. [ML Grading Pipeline](#9-ml-grading-pipeline)
10. [Integration, Testing & Polish](#10-integration-testing--polish)
11. [Azure Production Migration (Phase 7)](#11-azure-production-migration-phase-7)
12. [Pending Work — Prioritized](#12-pending-work--prioritized)

---

## 0. Current Implementation Status

> [!NOTE]
> **Last audited: 2026-08-30.** This section is a snapshot, not a living dashboard — re-verify against the codebase before trusting it if much time has passed.

The general shape of where the project stands: **both backends are further along than the frontend-to-backend wiring**, the **frontend UI is complete for three of four roles but its data layer is still mocked**, and **ML and the seller mobile app are pure spec — no code exists for either yet** (by design; explicitly deferred per standing instruction).

| # | Section | Status | One-line summary |
|---|---|---|---|
| 1 | System Dependencies & Env Setup | 🟡 Partial | Django/FastAPI venvs + Node/pnpm done; Kotlin/Gradle/Android SDK not installed (seller app not started). |
| 2 | Monorepo Scaffold & DevOps | 🟡 Mostly done | `docker-compose.yml` and 4 GitHub Actions workflows exist and match the plan; directory structure matches except a naming detail in §2.1 (now corrected below). |
| 3 | Database Design | ✅ Complete | All 8 Django apps' models implemented, migrated, and applied against a live Postgres. |
| 4 | Backend — Django | 🟡 Mostly complete | All apps + endpoints built, RBAC working, JWT auth working. Grading-trigger → FastAPI call is now wired (§4.3); FCM push dispatch remains a stub. `accounts` gained an admin user-management endpoint (`AdminUserViewSet`, §12) beyond the original plan. Test coverage thin (2 of 8 apps tested, though `accounts` and `catalog` are now more thoroughly covered than before). |
| 5 | Backend — FastAPI | 🟡 Partial | Pricing + matching are real and tested, and now include real letter-grade derivation (`grading/grade.py`, §12) — grade-adjustment pricing and `min_grade` matching filters both actually work end-to-end. Grading itself still runs an interim OpenCV heuristic, not real ML inference. `ingest_agmarknet_prices` scheduler job is a stub. |
| 6 | Frontend — Marketing/Landing | ✅ Complete | All 5 pages built per the section-by-section clone plan. |
| 7 | Frontend — Application Pages | ✅ UI complete / 🟡 data wiring partial | Auth is real (hits Django JWT). `app/admin/pricing`, `app/admin/verticals(/[id])`, and `app/admin/users` are now fully wired to real Django endpoints (§12) — the latter two needed small backend additions (a pricing-rules unit-conversion adapter; a new `AdminUserViewSet`), not just frontend changes. The rest of the Buyer/Admin/Verifier consoles (17 routes total) are built but still on mock data (`lib/mock-data.ts`) — some wiring is blocked on a real product-design gap (no canonical letter-grade contract from `attribute_scores`), see §12. |
| 8 | Seller Mobile App (Kotlin) | ⬜ Not started | No code, no directory. Explicitly out of scope for now. |
| 9 | ML Grading Pipeline | 🟡 ~30% | OpenCV preprocessing is real and live; the classifier is a never-run placeholder with no dataset or trained weights. |
| 10 | Integration, Testing & Polish | ⬜ Mostly not started | Only auth is integrated end-to-end. Test counts are thin across the board; no Vitest/Playwright yet. |
| 11 | Azure Production Migration | ⬜ Not started (by design) | Correctly deferred — untouched until local dev is complete, per the plan's own instruction. |

---

## 1. System Dependencies & Environment Setup

> **Status:** 🟡 Partial. Docker/Postgres, Python venvs (Django + FastAPI), and Node/pnpm are all set up and working. Kotlin, Gradle, and the Android SDK have **not** been installed — the seller app hasn't been started.

### 1.1 Packages Requiring Root (`sudo pacman -S`)

| Package | Purpose | Install Command |
|---|---|---|
| Docker | Container runtime for PostgreSQL, all services | `sudo pacman -S docker` |
| Docker Compose (plugin) | Multi-container orchestration | `sudo pacman -S docker-compose` |
| PostgreSQL client (`psql`) | DB debugging, migrations, CLI access | `sudo pacman -S postgresql` (client-only) |
| Kotlin compiler | Seller-app compilation | `sudo pacman -S kotlin` |
| Gradle | Kotlin/Android build system | `sudo pacman -S gradle` |
| PostGIS (via Docker) | Spatial queries — runs inside Docker, no host install needed | — |

**Post-install steps:**
```bash
# Enable & start Docker daemon
sudo systemctl enable --now docker
# Add user to docker group (avoids sudo for docker commands)
sudo usermod -aG docker sparkle
# Log out and back in for group to take effect
```

### 1.2 Packages NOT Requiring Root (user-space)

| Package | Purpose | Install Method |
|---|---|---|
| SDKMAN | Manage Kotlin/Gradle versions | `curl -s "https://get.sdkman.io" \| bash` |
| Android SDK + `sdkmanager` | Build Kotlin Android app | Via SDKMAN or manual download to `~/Android/Sdk` |
| Android SDK Build Tools, Platform Tools | Compile APKs | `sdkmanager "build-tools;35.0.0" "platforms;android-35"` |
| pnpm | Package manager for Next.js frontend | `npm i -g pnpm` |
| Python venv | Isolated Python environments for Django/FastAPI | `python3 -m venv .venv` (per-project) |
| Django + DRF + deps | Django backend | `pip install` inside venv |
| FastAPI + Uvicorn + deps | FastAPI backend | `pip install` inside venv |
| PyTorch + OpenCV + Ultralytics | ML grading | `pip install` inside venv (CUDA-enabled) |

### 1.3 Python Virtual Environment & Dependencies

**Backend venv** (shared by both Django and FastAPI, same DB):

```
# backend-django/requirements.txt (core)
# Actually installed: Django resolves to 6.1 under this open-ended pin (Python 3.14.7 venv).
Django>=5.2
djangorestframework>=3.15
djangorestframework-simplejwt>=5.4
django-storages>=1.14
django-cors-headers>=4.6
psycopg[binary]>=3.2
Pillow>=12.0
django-filter>=24.0
gunicorn>=23.0

# backend-fastapi/requirements.txt (core)
fastapi>=0.115
uvicorn[standard]>=0.34
sqlalchemy>=2.0
psycopg[binary]>=3.2
APScheduler>=3.11
python-multipart>=0.0.20
httpx>=0.28
pydantic>=2.10
pydantic-settings>=2.7

# ml-training/requirements.txt
torch>=2.6
torchvision>=0.21
opencv-python>=4.11
ultralytics>=8.3
numpy>=2.2
matplotlib>=3.10
scikit-learn>=1.6
```

### 1.4 Node.js / Frontend Dependencies

```
# Installed via pnpm inside web-app/ — actual versions as built:
next@16.3.3         # App Router, Turbopack (plan originally targeted 15)
react@19.2.8
react-dom@19.2.8
typescript@5
tailwindcss@4        # v4 (CSS-first config)
@tailwindcss/postcss
motion@13            # (formerly framer-motion) — for Aceternity components
clsx
tailwind-merge
lucide-react
@tabler/icons-react   # icons (used by Aceternity components)
react-hook-form + @hookform/resolvers + zod   # forms/validation (added; not in original plan list)
sonner                # toasts (added)
next-themes           # theme handling (added)
cobe                  # WebGL globe for the marketing bento grid (added)
```

> [!NOTE]
> `next-i18next` (Hindi/English i18n) is **not installed** — it was planned for Phase F7 polish (§6.7) but hasn't been reached; see §12 pending work.

---

## 2. Monorepo Scaffold & DevOps Foundation

> **Status:** 🟡 Mostly done. `docker-compose.yml` (§2.2) and all 4 GitHub Actions workflows (§2.3) exist and match this plan. The directory structure matches too, **except** the frontend route-group naming below has been corrected — see the note under §2.1. `seller-app/` doesn't exist yet (correctly deferred, not a bug).

### 2.1 Directory Structure

> [!NOTE]
> **Correction (frontend route groups):** the original tree below used `app/(admin)/` and `app/(verifier)/` — Next.js route **groups** (parens), which do **not** add a URL segment. That would have collapsed those pages to the wrong URLs (e.g. `/verticals` instead of `/admin/verticals`). The actual build correctly used real segment folders — `app/admin/` and `app/verifier/` (no parens) — alongside `app/buyer/` (also a real segment, not `(buyer)`), while `(marketing)` and `(auth)` remain genuine route groups since those routes don't need a role prefix. The tree below reflects what was actually built.

```
project/
├── backend-django/
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/                    # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/                # User model, JWT auth, RBAC
│   ├── config/                  # Vertical config (grading schemas, pricing rules)
│   ├── catalog/                 # Listings, grading evidence, catalog browsing
│   ├── orders/                  # Orders, allocations, requirements, bids
│   ├── disputes/                # Dispute handling workflow
│   ├── notifications/           # In-app notifications + FCM dispatch
│   ├── pricing/                 # Price points (Agmarknet/admin-entered/CCI) — built; not in original app list
│   └── reputation/              # Trust/reputation scores — built; not in original app list
│
├── backend-fastapi/
│   ├── main.py
│   ├── requirements.txt
│   ├── grading/                 # AI grading service
│   │   └── models/              # Pretrained weights, OpenCV pipeline
│   ├── pricing/                 # Price calculators, market price feeds
│   ├── matching/                # Matching engine, allocation algorithm
│   └── scheduler/               # APScheduler jobs (price ingestion)
│
├── ml-training/                 # Notebooks/scripts for model fine-tuning
│   ├── notebooks/
│   ├── scripts/
│   └── requirements.txt
│
├── web-app/                     # Next.js 16.3.3 (buyer + admin + verifier + landing)
│   ├── app/                     # App Router pages
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── (marketing)/         # Route group (no URL segment) — landing page + sub-pages
│   │   │   ├── page.tsx         # / — home
│   │   │   ├── pricing/
│   │   │   ├── services/        # (renamed from template's "products")
│   │   │   ├── verticals/       # (renamed from template's "work")
│   │   │   └── blog/
│   │   ├── (auth)/              # Route group (no URL segment) — login, register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── buyer/               # REAL segment folder → /buyer/* (not a route group — see note above)
│   │   │   ├── dashboard/
│   │   │   ├── catalog/[id]/
│   │   │   ├── requirements/
│   │   │   ├── orders/
│   │   │   ├── estimate/
│   │   │   └── notifications/
│   │   ├── admin/                # REAL segment folder → /admin/*
│   │   │   ├── dashboard/
│   │   │   ├── verticals/[id]/
│   │   │   ├── verification/
│   │   │   ├── disputes/
│   │   │   ├── users/
│   │   │   └── pricing/
│   │   └── verifier/             # REAL segment folder → /verifier/*
│   │       ├── dashboard/
│   │       └── queue/[id]/
│   ├── components/
│   │   ├── ui/                  # Aceternity UI + Magic UI + shadcn base components
│   │   ├── marketing/           # Landing page section components
│   │   ├── buyer/               # Buyer-specific components
│   │   ├── admin/               # Admin-specific components
│   │   ├── verifier/            # Verifier-specific components (built; not in original list)
│   │   ├── verification/        # Shared admin/verifier review-dialog components (built; not in original list)
│   │   └── shared/               # Shared components (navbar, footer, dashboard shell, stat tiles, etc.)
│   ├── lib/
│   │   ├── utils.ts             # cn() utility
│   │   ├── constants.ts         # Site content data
│   │   ├── api.ts               # API client (Django + FastAPI)
│   │   └── auth.ts              # JWT token management
│   ├── public/
│   │   ├── logos/               # Partner/vertical logos
│   │   ├── projects/            # Showcase images
│   │   ├── assets/              # General assets
│   │   └── blog/                # Blog post images
│   ├── next.config.ts
│   ├── tailwind.config.ts       # Tailwind v4 config
│   ├── tsconfig.json
│   └── package.json
│
├── seller-app/                  # Kotlin Android app
│   ├── app/
│   │   └── src/
│   │       ├── main/
│   │       │   ├── java/com/msme/seller/
│   │       │   ├── res/
│   │       │   └── AndroidManifest.xml
│   │       └── test/
│   ├── build.gradle.kts
│   └── gradle/
│
├── infra/                       # IaC (Bicep/Terraform) — migration time only
├── docs/                        # Project documentation
│   ├── MSME_Marketplace_Project_Document.md
│   ├── MSME_Marketplace_Build_Plan.md
│   └── api/                     # API documentation
│
├── docker-compose.yml           # PostgreSQL + PostGIS + dev services
├── .env.example
├── .gitignore
├── README.md
└── .github/
    └── workflows/
        ├── lint-backend.yml
        ├── test-backend.yml
        ├── lint-frontend.yml
        └── test-frontend.yml
```

### 2.2 Docker Compose (Local Dev)

```yaml
# docker-compose.yml
services:
  db:
    image: postgis/postgis:17-3.5
    container_name: msme-postgres
    environment:
      POSTGRES_DB: msme_marketplace
      POSTGRES_USER: msme_dev
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infra/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U msme_dev -d msme_marketplace"]
      interval: 10s
      retries: 5

  media:
    image: busybox
    volumes:
      - media_storage:/media
    command: "true"

volumes:
  pgdata:
  media_storage:
```

### 2.3 GitHub Actions (CI from Day 1)

- **Backend lint:** `ruff check` + `mypy` on both Django and FastAPI
- **Backend test:** `pytest` with PostgreSQL service container
- **Frontend lint:** `eslint` + `tsc --noEmit`
- **Frontend test:** Vitest for component tests (later)

---

## 3. Database Design & Docker Compose

> **Status:** ✅ Complete. All 8 Django apps' models are implemented and match the schema below closely, migrated, and confirmed applied against a live Postgres instance (`manage.py showmigrations` shows every migration checked off). Location fields use plain lat/lng `FloatField` pairs rather than PostGIS `Point` (see §3.1 note below) — a deliberate simplification to avoid a GDAL/GEOS dev dependency, documented in `backend-django/README.md`.

### 3.1 Core Schema (Django-owned, FastAPI reads directly)

All tables use Django ORM models. FastAPI reads via SQLAlchemy (read-only on most tables) or direct `psycopg` for performance-critical paths.

#### Users & Auth
- `users` — id, email, phone, password_hash, role (enum: SELLER, BUYER, ADMIN, VERIFIER), is_active, created_at
- `user_profiles` — user_id (FK), display_name, avatar_url, preferred_language, location (PostGIS Point)

#### Vertical Configuration (the plug-in point)
- `verticals` — id, name, slug, unit_of_measure, is_active, created_at
- `grading_schemas` — id, vertical_id (FK), attribute definitions (JSONB: name, type, range, ideal values, weight, `gradeable_by_ml` flag)
- `pricing_rules` — id, vertical_id (FK), rule set (JSONB: grade-adjustment table, quantity-tier table)

#### Catalog & Grading
- `listings` — id, seller_id (FK), vertical_id (FK), commodity_name, sub_category, quantity, unit, price_suggested, price_final, location (PostGIS Point), status (enum: DRAFT, PENDING_GRADING, PENDING_VERIFICATION, ACTIVE, SOLD, EXPIRED), created_at, updated_at
- `grading_evidence` — id, listing_id (FK), file_path, file_type (enum: IMAGE, VIDEO, DOCUMENT), uploaded_at
- `grading_results` — id, listing_id (FK), source (enum: AI, VERIFIER), confidence_score (float), attribute_scores (JSONB), graded_by (FK to user, nullable for AI), created_at, notes

#### Pricing & Market Data
- `price_points` — id, vertical_id (FK), commodity, region, price, source (enum: AGMARKNET, ADMIN_ENTERED, CCI), timestamp, raw_data (JSONB)

#### Orders & Matching
- `requirements` — id, buyer_id (FK), vertical_id (FK), commodity, quantity, min_grade, max_price, budget, region (PostGIS), status (enum: OPEN, MATCHED, FULFILLED, CANCELLED), created_at
- `orders` — id, requirement_id (FK, nullable), buyer_id (FK), status (enum: PENDING, CONFIRMED, FULFILLED, DISPUTED, CANCELLED), total_price, created_at
- `order_allocations` — id, order_id (FK), listing_id (FK), allocated_quantity, unit_price, status

#### Trust & Reputation
- `reputation_scores` — id, user_id (FK), role, score (float), grade_accuracy_score, fulfillment_score, payment_score, total_transactions, last_updated

#### Disputes
- `disputes` — id, order_id (FK), raised_by (FK), against (FK), type (enum: GRADE_MISMATCH, QUANTITY_SHORTAGE, QUALITY_DEFECT, OTHER), status (enum: OPEN, UNDER_REVIEW, RESOLVED, ESCALATED), description, evidence_refs (JSONB), resolution_notes, created_at, resolved_at

#### Notifications
- `notifications` — id, user_id (FK), type (enum: GRADING_COMPLETE, ORDER_MATCHED, BID_RECEIVED, DISPUTE_UPDATE, SYSTEM), title, message, related_object_type, related_object_id, is_read, fcm_sent, created_at

#### Bids / Negotiation
- `bids` — id, listing_id (FK), buyer_id (FK), offered_price, offered_quantity, status (enum: PENDING, ACCEPTED, REJECTED, COUNTERED, EXPIRED), parent_bid_id (FK, nullable for counter-offers), message, created_at

### 3.2 Indexes & Extensions

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Key indexes
CREATE INDEX idx_listings_vertical_status ON listings(vertical_id, status);
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_commodity_trgm ON listings USING GIN(commodity_name gin_trgm_ops);
CREATE INDEX idx_price_points_lookup ON price_points(vertical_id, commodity, region, timestamp DESC);
CREATE INDEX idx_requirements_status ON requirements(status, vertical_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

---

## 4. Backend — Django (Admin/CRUD/Auth)

> **Status:** 🟡 Mostly complete. All 8 apps are wired into `INSTALLED_APPS`, `manage.py check` is clean, and JWT auth (simplejwt) is fully working. Two integration points are explicit, README-acknowledged stubs (see §4.3 note). Test coverage is thin: only `accounts` has real tests (2 methods, a register→login→/me/ smoke test); the other 7 apps are untested default stub files.

### 4.1 Apps & Responsibilities

| Django App | Models | Responsibilities |
|---|---|---|
| `accounts` | User, UserProfile | Registration, JWT auth (SimpleJWT), RBAC (4 roles), profile management |
| `config` | Vertical, GradingSchema, PricingRule | Vertical CRUD, grading schema editor, pricing rule editor (Admin-only) |
| `catalog` | Listing, GradingEvidence, GradingResult | Listing CRUD, evidence upload (→ local disk via `django-storages`), grading result storage, catalog search/filter API |
| `orders` | Requirement, Order, OrderAllocation, Bid | Requirement posting, order creation, allocation records, bid/negotiation workflow |
| `disputes` | Dispute | Dispute creation, status transitions, evidence attachment, resolution |
| `notifications` | Notification | Create/read/mark-read notifications, FCM push dispatch |
| `pricing` | PricePoint | Price-point storage (Agmarknet/admin-entered/CCI), read by FastAPI's pricing service — **built but not in the original app table** |
| `reputation` | ReputationScore | Per-user trust/reputation scores — **built but not in the original app table** |

### 4.2 API Endpoints (DRF)

```
# Auth
POST   /api/auth/register/
POST   /api/auth/login/          → JWT access + refresh tokens
POST   /api/auth/refresh/
GET    /api/auth/me/

# Config (Admin only)
GET    /api/config/verticals/
POST   /api/config/verticals/
GET    /api/config/verticals/{id}/
PUT    /api/config/verticals/{id}/
GET    /api/config/verticals/{id}/grading-schema/
PUT    /api/config/verticals/{id}/grading-schema/
GET    /api/config/verticals/{id}/pricing-rules/
PUT    /api/config/verticals/{id}/pricing-rules/

# Catalog
GET    /api/catalog/listings/              → filtered, paginated, searchable
POST   /api/catalog/listings/              → seller creates listing
GET    /api/catalog/listings/{id}/
PUT    /api/catalog/listings/{id}/
POST   /api/catalog/listings/{id}/evidence/  → file upload
GET    /api/catalog/listings/{id}/grading/
POST   /api/catalog/listings/{id}/grading/trigger/  → triggers FastAPI grading

# Orders
GET    /api/orders/requirements/
POST   /api/orders/requirements/
GET    /api/orders/orders/
GET    /api/orders/orders/{id}/
POST   /api/orders/bids/
PUT    /api/orders/bids/{id}/

# Verification queue (Verifier + Admin)
GET    /api/verification/queue/
POST   /api/verification/queue/{listing_id}/review/

# Disputes
GET    /api/disputes/
POST   /api/disputes/
PUT    /api/disputes/{id}/

# Notifications
GET    /api/notifications/
POST   /api/notifications/{id}/read/
POST   /api/notifications/read-all/

# Reputation
GET    /api/reputation/{user_id}/
```

### 4.3 Key Implementation Details

> **Status:** RBAC, file upload, the offline-sync field, and the grading-trigger call are built as planned. FCM dispatch remains a stub — see the ⚠️ note below.

- **RBAC:** ✅ Built via `core/permissions.py` — 9 permission classes (`IsAdmin`, `IsSeller`, `IsBuyer`, `IsVerifier`, `IsVerifierOrAdmin`, `IsAdminOrReadOnly`, `IsListingOwnerOrReadOnly`, `IsOwnerOrAdmin`, `IsBidPartyOrAdmin`), applied per-viewset. Sellers can only CRUD their own listings. Buyers can only see ACTIVE listings. Admins see everything. Verifiers see only the verification queue.
- **File upload:** ✅ Built. `django-storages` with `FileSystemStorage` backend locally (Docker volume at `/media`). Swappable to `AzureBlobStorage` via settings — no code changes planned at migration time.
- **Seller-app sync:** ✅ Built on the Django side — `Listing.client_uuid` exists specifically for idempotent creation via `POST /api/catalog/listings/` on reconnection. The Kotlin app itself that would exercise this is not built (§8).
- **FCM dispatch:** ⚠️ **Stub.** `notifications/signals.py`'s `dispatch_fcm_on_notification_create` (post_save signal on `Notification`) currently only logs a `TODO(FCM)` message instead of calling the Firebase Admin SDK. See §12.
- **Grading trigger:** ✅ **Wired**, not in the original plan text but worth noting here since it's the Django↔FastAPI seam: `POST /api/catalog/listings/{id}/grading/trigger/` (`catalog/views.py:68`) calls FastAPI's `POST /compute/grading/grade` via `httpx` (base URL from `settings.FASTAPI_BASE_URL`, env `FASTAPI_BASE_URL`, default `http://localhost:8001`) and proxies its response back with `200`. Returns `503` if the FastAPI service is unreachable, `502` if it responds with an error. Verified with a real end-to-end call (not just mocked tests) — see `catalog/tests.py:GradingTriggerTest`.

---

## 5. Backend — FastAPI (Compute/ML)

> **Status:** 🟡 Partial. Pricing and matching are fully real and match this plan closely. Grading and one scheduler job are interim stubs — see the notes under §5.1, §5.3 (grading), and §5.4.

### 5.1 Services

| Module | Endpoints | Responsibilities | Status |
|---|---|---|---|
| `grading` | `POST /grading/grade` | Receives listing_id, fetches evidence from DB, runs ML on `gradeable_by_ml` attributes, writes results to `grading_results` | 🟡 Runs a real OpenCV edge-density heuristic (`grading/pipeline.py`) as an explicit interim proxy — `requirements-ml.txt` (torch/opencv/ultralytics) isn't installed in this env, so it never reaches real MobileNetV3/YOLOv8n inference. `CONFIDENCE_VERIFICATION_THRESHOLD = 0.80` is implemented as planned. |
| `pricing` | `GET /pricing/base-price`, `GET /pricing/adjusted-price`, `GET /pricing/cost-estimate`, `GET /pricing/trends` | Base price lookup, grade-adjusted calculator, quantity-tiered calculator, cost estimator, historical trend data | ✅ Fully real (`pricing/service.py` + `pricing/router.py`). Letter-grade derivation is now real too (`grading/grade.py`, §12) — grade-adjustment multipliers actually apply. One TODO remains: region-label derivation from lat/lng. |
| `matching` | `POST /matching/find-matches`, `POST /matching/allocate` | Matches requirements to listings, runs multi-listing allocation algorithm | ✅ Fully real (`matching/allocation.py`, pure/DB-decoupled), 5 passing tests (+9 for `grading/grade.py`). Grade derivation is now real (§12) — `min_grade` filtering actually excludes lower-graded listings, verified against real cheaper-but-lower-graded listings losing to more expensive higher-graded ones. One TODO remains: real lat/lng radius filtering (currently unfiltered by region). |
| `scheduler` | Internal (APScheduler) | Agmarknet data ingestion (cron), price data cleanup | 🟡 Split status — see §5.4. |

### 5.2 Key API Endpoints

```
# Grading
POST   /compute/grading/grade          → {listing_id} → triggers async ML grading
GET    /compute/grading/status/{id}    → grading job status

# Pricing
GET    /compute/pricing/base           → ?vertical=agriculture&commodity=wheat&region=UP
GET    /compute/pricing/adjusted       → ?listing_id=123
GET    /compute/pricing/estimate       → ?vertical=agriculture&commodity=wheat&quantity=50&min_grade=A
GET    /compute/pricing/trends         → ?vertical=agriculture&commodity=wheat&region=UP&days=30

# Matching
POST   /compute/matching/find          → {requirement_id} → returns matching listings
POST   /compute/matching/allocate      → {requirement_id, strategy} → runs allocation, creates order
```

### 5.3 Multi-Listing Allocation Algorithm

The most algorithmically nontrivial piece — a constrained optimization:

**Input:** Buyer requirement (quantity Q, min grade G, max price P, region R)
**Available:** Set of listings L meeting grade ≥ G and within region R

**Objective:** Minimize total cost while fulfilling quantity Q

**Approach:**
1. Filter listings by grade ≥ G, region ≤ R radius, status = ACTIVE
2. Sort by effective unit price (grade-adjusted) ascending
3. Greedy allocation: fill from cheapest first
4. Tie-break by seller reputation score (trust-weighted allocation)
5. Partial allocation: if total available < Q, offer partial fill with buyer confirmation
6. Output: list of (listing_id, allocated_quantity, unit_price) tuples

> [!NOTE]
> Start with greedy. Consider knapsack/LP only if the greedy solution produces meaningfully suboptimal results in testing — unlikely at pilot scale with 2 verticals.

> **Status:** ✅ Implemented exactly as specified — `matching/allocation.py`'s `greedy_allocate()` filters by status/region/price/grade, sorts by price ascending then reputation descending, and fills greedily, with dataclasses `ListingOffer`/`Allocation`/`AllocationResult` (the latter exposing `.shortfall`/`.fully_fulfilled` for the partial-allocation case). 5 unit tests cover exact fulfillment, partial fulfillment, reputation tie-break, min-grade filtering, and inactive-listing exclusion.

### 5.4 APScheduler Jobs

```python
# Agmarknet price ingestion — runs every 6 hours
scheduler.add_job(ingest_agmarknet_prices, 'interval', hours=6)

# Textiles — manual/admin-entered, no scheduled job needed yet

# Stale listing cleanup — runs daily
scheduler.add_job(expire_stale_listings, 'cron', hour=2, minute=0)
```

> **Status:** Both jobs are registered in `main.py`'s lifespan handler exactly per this schedule, but only one does real work:
> - `expire_stale_listings` — ✅ **Real.** Runs a bulk SQL `UPDATE` marking ACTIVE listings older than `STALE_LISTING_DAYS = 30` as EXPIRED, with `SQLAlchemyError` handling.
> - `ingest_agmarknet_prices` — ⚠️ **Stub.** Only logs an info message; makes no HTTP call to Agmarknet and writes nothing to `price_points`. See §12.

---

## 6. Frontend — Web App (Next.js) — Landing/Marketing Site

> **Status:** ✅ Complete. All 5 pages (home + `/verticals`, `/services`, `/pricing`, `/blog`) are built, following the section-by-section clone plan below closely. Built on Next.js 16.3.3 / React 19.2.8 (ahead of the versions named in §6.1 — see the correction there). The newsletter signup form (`components/marketing/newsletter-form.tsx`) is a TODO stub — no real list to wire it to yet.

> [!IMPORTANT]
> **This is the massive frontend planning section.** The landing site (marketing pages) will be a 1:1 clone of the [Aceternity productized agency template](https://productized-agency-template-acetern.vercel.app/), re-skinned for the MSME Marketplace. Every UI component is sourced from **Aceternity UI** (free), **Magic UI**, or **shadcn/ui** — no custom design from scratch.

### 6.0 Frontend Plan File

The complete frontend implementation plan is maintained as a separate, detailed file:

📄 **[frontend_plan.md](file:///home/sparkle/.gemini/antigravity/brain/72a200ee-61b0-48fb-97f0-27020806277d/frontend_plan.md)** — Contains:
- Section-by-section breakdown of every page
- Exact component mapping (template → MSME marketplace)
- Content adaptation table
- Animation specifications
- Color scheme / design tokens
- File-by-file implementation order
- Component dependency graph

### 6.1 Tech Stack & Setup

| Technology | Planned Version | Actually Installed | Purpose |
|---|---|---|---|
| Next.js | 15 (App Router, Turbopack) | **16.3.3** | Framework |
| React | 19 | **19.2.8** | UI library |
| TypeScript | Latest | 5 | Type safety |
| Tailwind CSS | 4.0 | 4 | Styling (CSS-first config) |
| `motion` | Latest | 13 | Animations (Aceternity components need this) |
| `clsx` + `tailwind-merge` | Latest | ✅ installed | Class merging utility (`cn()`) |
| `lucide-react` | Latest | ✅ installed | Primary icon library |
| `@tabler/icons-react` | Latest | ✅ installed | Secondary icons (Aceternity compat) |
| `next-i18next` | Latest | ⬜ **not installed** | i18n / multilingual — deferred to Phase F7 polish, not yet reached |
| pnpm | Latest | 11.24.0 | Package manager |
| `react-hook-form` + `zod` | *(not in original plan)* | ✅ installed | Form validation — used across auth + all admin/buyer forms |
| `sonner` | *(not in original plan)* | ✅ installed | Toast notifications |

### 6.2 Design System — Adapted from Template

#### Color Palette (MSME Marketplace Branding)

The template uses a gold/amber accent (`#FA9A63`, `#CDA63C`) on black. We'll adapt to a **green/teal** theme reflecting agriculture/trade, keeping the dark-mode-first approach:

| Token | Template Value | MSME Marketplace Value | Usage |
|---|---|---|---|
| `--background` | `#0a0a0a` (neutral-950) | `#0a0a0a` | Page background (keep dark) |
| `--surface` | `#171717` (neutral-900) | `#171717` | Card backgrounds |
| `--border` | `#262626` (neutral-800) | `#262626` | Card borders |
| `--primary` | `#FA9A63` (gold/amber) | `#10B981` (emerald-500) | CTAs, accents, highlights |
| `--primary-glow` | `#CDA63C` | `#059669` (emerald-600) | Glow effects |
| `--heading` | `#FFFFFF` | `#FFFFFF` | Headings |
| `--body` | `#a3a3a3` (neutral-400) | `#a3a3a3` | Body text |
| `--muted` | `#737373` (neutral-500) | `#737373` | Muted/secondary text |
| `--natural-white` | `#fafafa` | `#fafafa` | Pure white text |
| `--offwhite` | `#f5f5f0` (warm off-white) | `#f5f5f0` | Light section backgrounds |

> [!NOTE]
> **User Review Required:** The color palette above adapts the template's gold/amber to emerald/green for an agriculture/trade feel. If you prefer a different accent color (blue for trust, orange for energy, etc.), let me know before implementation.

#### Typography

| Font | Usage | Source |
|---|---|---|
| **Inter** | Primary sans-serif (headings + body) | Google Fonts (preloaded) |
| **Geist Mono** | Code snippets, data labels, monospace accents | `next/font` |
| **DM Mono** | Small caps labels (like "Trusted by" section headers) | Google Fonts |

### 6.3 Pages — Template → MSME Mapping

The marketing site has **5 pages** that map directly from the template:

| Template Page | MSME Marketplace Page | Route | Purpose |
|---|---|---|---|
| `/` (Home) | `/` (Home) | `/` | Landing page — hero, trust logos, features, showcase, testimonials, pricing overview, CTA |
| `/work` | `/verticals` | `/verticals` | Showcase the 2 (expandable) verticals with real commodity examples |
| `/products` | `/services` | `/services` | Explain the 3 core platform services: grading, pricing, matching |
| `/pricing` | `/pricing` | `/pricing` | Pricing tiers for marketplace participation |
| `/blog` | `/blog` | `/blog` | Blog/insights about market trends, MSME updates |

### 6.4 Home Page — Section-by-Section Clone Plan

Based on the template screenshots and HTML analysis:

#### Section 1: Navbar
- **Template:** Floating navbar — Logo | Work, Products, Pricing, Blog | "Chat with Alex" CTA button
- **MSME:** Floating navbar — MSME Logo | Verticals, Services, Pricing, Blog | "Get Started" CTA button
- **Component:** Aceternity UI `FloatingNavbar` (free) or custom with `motion` animations
- **Details:** 
  - Blur backdrop (`backdrop-blur-md`)
  - Absolute positioned, `z-50`, appears on scroll
  - Mobile: hamburger menu with slide-in drawer
  - CTA button with animated icon box (the distinctive dot-matrix → avatar animation from template)
  - **MSME adaptation:** Replace "Chat with Alex" with "Start Selling" or "Get Started", replace avatar with a commodity icon

#### Section 2: Hero Section
- **Template:** Full-height dark hero with:
  - Animated grid/dot-matrix background (subtle, upper portion)
  - Glowing elliptical arc (gold/amber gradient) at bottom
  - Star/particle field overlay
  - Badge pill ("Aceternity UI — New components every week")
  - Two-column layout: Large heading (left) + description + CTA (right)
  - Giant faded brand text at very bottom ("Aceternity")
- **MSME adaptation:**
  - Badge: "MSME Marketplace — Empowering Indian producers"
  - Heading: "The smartest way to trade commodities across India."
  - Description: "AI-graded quality. Real-time pricing. Multi-seller order fulfillment. Built for MSME producers and buyers."
  - CTA: "Start Selling" button (same animated style)
  - Giant faded text: "MSME Marketplace" or "MSMETrade"
  - Arc color: emerald/green gradient instead of gold
- **Components:**
  - Custom SVG arc (clone from template — it's inline SVG with gradient `linearGradient`)
  - Aceternity `Spotlight` or `BackgroundBeams` for ambient lighting
  - `motion` for fade-in animations
  - Dot grid/particle SVG (clone from template inline SVG)

#### Section 3: Logo Cloud / Trust Strip
- **Template:** "Trusted by fast-growing startups" + 15 grayscale company logos in a grid
- **MSME adaptation:** "Trusted by India's MSME ecosystem" + logos of relevant organizations:
  - MSME Ministry logo, NSIC, Agmarknet, APEDA, BIS, Textile Commissioner, KVIC, SIDBI
  - Use real government/industry logos (publicly available)
- **Component:** Aceternity `InfiniteMovingCards` (free) for marquee, or static grid matching template
- **Layout:** Grid with `flex-wrap`, logos at `h-4 md:h-6` with opacity/grayscale filter, 3D perspective hover

#### Section 4: Features / Bento Grid — "Replace your Engineering Team"
- **Template:** Large heading + 5-card asymmetric bento grid:
  - Card 1 (tall, left): "Design and Development" — animated browser mockup wireframe, code animation overlay
  - Card 2 (top center): "Regular updates and progress tracking" — donut chart + notification card
  - Card 3 (top right, dark): "Hosting, Deployment & Maintenance" — world map with avatar dots
  - Card 4 (bottom center): "Get found on Google" — Google search UI mockup
  - Card 5 (bottom right): "Components, Dashboards and Everything else" — circuit board pattern with floating element
- **MSME adaptation:** Heading: "Everything MSMEs Need to Trade Smarter"
  - Card 1 (tall, left): **"AI Quality Grading"** — animated mockup of grading interface: photo upload → AI analysis → grade result. Illustrate with a miniature grading card showing confidence bars
  - Card 2 (top center): **"Real-time Price Intelligence"** — donut chart → price trend chart mockup + notification: "Wheat price ↑ 3.2% in Mandi Jaipur"
  - Card 3 (top right, dark): **"Pan-India Reach"** — India map (replace world map) with seller/buyer dots across states. Keep the dark styling + avatar connections
  - Card 4 (bottom center): **"Smart Order Matching"** — mockup showing a buyer requirement → matching engine → multi-seller allocation result
  - Card 5 (bottom right): **"Seller Dashboard & Analytics"** — dashboard wireframe with charts/stats. Keep circuit-board pattern
- **Component:** Aceternity `BentoGrid` / `BentoGridItem` (free)
- **Grid layout:** `grid-cols-19` (matching template's asymmetric layout: col-span-6, col-span-7, col-span-6 etc.)
- **Card internals:** Each card has a custom animated illustration — these are the most implementation-heavy pieces. Use `motion` for the animated mockups.

#### Section 5: Projects / Portfolio Showcase
- **Template:** Grid of 6 project cards — large screenshot images with hover overlay showing project title + tags + "View Project →" link. Mix of light and dark backgrounds.
- **MSME adaptation:** **"See the Platform in Action"** — showcase cards for:
  1. Agriculture vertical: Wheat trading on the platform (grading view)
  2. Textiles vertical: Cotton fabric listing (quality analysis)
  3. Order fulfillment: Multi-seller allocation in action
  4. Price dashboard: Live Agmarknet data visualization
  5. Seller app: Mobile app listing creation (screenshot)
  6. Admin console: Vertical configuration view
- **Component:** Custom cards matching template layout (2-col grid on lg, full-width on sm)
- **Hover:** Image zoom + overlay with "Explore →" and category tags
- **Images:** Generate via `generate_image` tool for polished mockups

#### Section 6: Comparison Table — "Aceternity VS Traditional"
- **Template:** Full-width light-bg (`#f5f5f0`) section with a comparison table:
  - 3 columns: Category | Aceternity Labs ✅ | Traditional Providers ⚠️
  - 7 rows: Approach, Process, Design Philosophy, Development Stack, Communication, Deliverables, Support
- **MSME adaptation:** **"MSME Marketplace VS Traditional Trading"**
  - Columns: Category | MSME Marketplace ✅ | Traditional Commodity Trading ⚠️
  - Rows:
    - Quality Assurance → "AI-verified grading with audit trail" vs "Manual inspection, no records"
    - Pricing → "Real-time market data + grade-adjusted" vs "Opaque, middleman-dependent"
    - Order Fulfillment → "Multi-seller auto-allocation" vs "Single supplier or manual sourcing"
    - Reach → "Pan-India digital marketplace" vs "Local mandi, limited buyers"
    - Trust → "Reputation scoring + dispute resolution" vs "Word of mouth, no recourse"
    - Communication → "Real-time notifications, in-app updates" vs "Phone calls, no tracking"
    - Scale → "Handle 8+ verticals with plug-in config" vs "One commodity, one region"
- **Component:** Custom table component matching the template's clean grid style. Use shadcn `Table` as base with custom styling.

#### Section 7: Testimonials (if present in more screenshots)
- **Template:** Likely uses `InfiniteMovingCards` for testimonial marquee
- **MSME adaptation:** Testimonials from pilot MSME users (can use placeholder quotes initially)
- **Component:** Aceternity `InfiniteMovingCards` or Magic UI `Marquee`

#### Section 8: CTA Section
- **Template:** Dark section with prominent heading + CTA button
- **MSME:** "Ready to transform how you trade?" + "Join the Marketplace" button
- **Component:** Custom dark panel with `Spotlight` or gradient effect

#### Section 9: Footer
- **Template:** Multi-column footer with Logo, nav links (Products, Company, Legal), social icons, copyright
- **MSME adaptation:**
  - Column 1: MSME Marketplace logo + tagline ("Empowering India's producers")
  - Column 2: Platform (Verticals, Services, Pricing)
  - Column 3: Resources (Blog, Documentation, API)
  - Column 4: Legal (Privacy Policy, Terms of Service, Contact)
  - Bottom: Copyright + social icons
- **Component:** Custom footer matching template structure

### 6.5 Sub-Pages Clone Plan

#### `/verticals` page (maps to template's `/work`)
- Hero header: "Our Verticals" + description
- Vertical showcase cards (Agriculture, Textiles) — large cards with:
  - Hero image of the commodity sector
  - Vertical name, key metrics, grading attributes
  - "Explore Listings →" CTA
- Future verticals preview (grayed out): Engineering, Food Processing, etc.
- CTA + Footer

#### `/services` page (maps to template's `/products`)
- Hero header: "Platform Services"
- 3 service cards (full detail):
  1. **AI Grading Engine** — how it works, evidence types, confidence scoring
  2. **Price Intelligence** — market feeds, grade-adjusted pricing, historical trends
  3. **Smart Matching** — requirement posting, allocation algorithm, multi-seller fulfillment
- How It Works (stepped process flow)
- CTA + Footer

#### `/pricing` page (maps to template's `/pricing`)
- Hero: "Simple, Transparent Marketplace Access"
- 3-tier pricing cards:
  - **Starter** (Free): List up to 10 items/month, basic grading, manual pricing
  - **Growth** (₹999/mo): Unlimited listings, AI grading, price intelligence, 5 allocations/month
  - **Enterprise** (Custom): Everything + API access, bulk allocation, dedicated support
- FAQ accordion section
- CTA + Footer
- **Component:** shadcn `Accordion` for FAQ, custom pricing cards matching template style

#### `/blog` page (maps to template's `/blog`)
- Hero: "Insights & Market Intelligence"
- Blog post grid (2-3 columns)
- Card design: thumbnail, category tag, title, excerpt, author, date
- Static initially (hardcoded blog posts about MSME market trends)
- CTA + Footer

### 6.6 Component Sourcing Map

| Component Needed | Source Library | Component Name | Free? |
|---|---|---|---|
| Floating navbar with blur | Aceternity UI | `FloatingNavbar` | ✅ Free |
| Hero spotlight/beams | Aceternity UI | `Spotlight` / `BackgroundBeams` | ✅ Free |
| Text fade-in animation | Aceternity UI | `TextGenerateEffect` | ✅ Free |
| Infinite scrolling cards | Aceternity UI | `InfiniteMovingCards` | ✅ Free |
| Bento grid layout | Aceternity UI | `BentoGrid` / `BentoGridItem` | ✅ Free |
| 3D hover cards | Aceternity UI | `ThreeDCard` | ✅ Free |
| Animated tooltips | Aceternity UI | `AnimatedTooltip` | ✅ Free |
| Sticky scroll reveal | Aceternity UI | `StickyScrollReveal` | ✅ Free |
| Tabs with motion | Aceternity UI | `Tabs` | ✅ Free |
| Wobble card | Aceternity UI | `WobbleCard` | ✅ Free |
| Moving border button | Aceternity UI | `MovingBorder` | ✅ Free |
| Lamp effect heading | Aceternity UI | `LampEffect` | ✅ Free |
| Meteors background | Aceternity UI | `Meteors` | ✅ Free |
| Marquee (logos/testimonials) | Magic UI | `Marquee` | ✅ Free |
| Globe (India map alt.) | Magic UI | `Globe` | ✅ Free |
| Number ticker (stats) | Magic UI | `NumberTicker` | ✅ Free |
| Animated beam | Magic UI | `AnimatedBeam` | ✅ Free |
| Dock (mobile nav) | Magic UI | `Dock` | ✅ Free |
| Button | shadcn/ui | `Button` | ✅ Free |
| Card | shadcn/ui | `Card` | ✅ Free |
| Table | shadcn/ui | `Table` | ✅ Free |
| Accordion (FAQ) | shadcn/ui | `Accordion` | ✅ Free |
| Dialog/Modal | shadcn/ui | `Dialog` | ✅ Free |
| Input / Form | shadcn/ui | `Input`, `Form` | ✅ Free |
| Dropdown Menu | shadcn/ui | `DropdownMenu` | ✅ Free |
| Tabs (base) | shadcn/ui | `Tabs` | ✅ Free |
| Badge | shadcn/ui | `Badge` | ✅ Free |
| Avatar | shadcn/ui | `Avatar` | ✅ Free |
| Toast | shadcn/ui | `Toast` / `Sonner` | ✅ Free |
| Select | shadcn/ui | `Select` | ✅ Free |
| Tooltip | shadcn/ui | `Tooltip` | ✅ Free |

### 6.7 Frontend Implementation Order

```
Phase F1 — Project setup & design system (1 day)
  ├── Next.js 15 + Tailwind v4 + TypeScript scaffold
  ├── pnpm init, install all dependencies
  ├── Configure tailwind.config.ts with MSME color tokens
  ├── Set up cn() utility, global CSS, font loading (Inter, Geist Mono, DM Mono)
  ├── Create public/ directory structure
  └── Install base shadcn/ui components (button, card, input, etc.)

Phase F2 — Copy Aceternity UI + Magic UI components (1–2 days)
  ├── Copy all needed Aceternity UI components into components/ui/
  │   ├── spotlight.tsx
  │   ├── text-generate-effect.tsx
  │   ├── background-beams.tsx
  │   ├── infinite-moving-cards.tsx
  │   ├── bento-grid.tsx
  │   ├── three-d-card.tsx
  │   ├── floating-navbar.tsx
  │   ├── sticky-scroll-reveal.tsx
  │   ├── animated-tooltip.tsx
  │   ├── wobble-card.tsx
  │   ├── moving-border.tsx
  │   ├── lamp-effect.tsx
  │   ├── meteors.tsx
  │   └── tabs.tsx
  ├── Copy Magic UI components
  │   ├── marquee.tsx
  │   ├── globe.tsx
  │   ├── number-ticker.tsx
  │   ├── animated-beam.tsx
  │   └── dock.tsx
  ├── Verify all components render correctly with Tailwind v4
  └── Fix any import/dependency issues

Phase F3 — Navbar + Footer (shared layout) (0.5 day)
  ├── Build marketing/shared Navbar component
  ├── Build Footer component
  ├── Wire into app/layout.tsx
  └── Mobile responsive: hamburger + drawer

Phase F4 — Home page sections (3–4 days)
  ├── Hero section (arc SVG, dot grid, badge, heading, CTA)
  ├── Logo cloud / trust strip
  ├── Bento grid features ("Everything MSMEs Need")
  │   ├── Card 1: AI Grading mockup animation
  │   ├── Card 2: Price chart + notification
  │   ├── Card 3: India map with dots
  │   ├── Card 4: Matching engine mockup
  │   └── Card 5: Dashboard wireframe
  ├── Project showcase grid (6 cards with hover)
  ├── Comparison table section
  ├── Testimonials section
  ├── CTA section
  └── Scroll animations + polish

Phase F5 — Sub-pages (2–3 days)
  ├── /verticals page (showcase + future verticals)
  ├── /services page (3 service cards + how-it-works)
  ├── /pricing page (3 tiers + FAQ accordion)
  └── /blog page (post grid + placeholder content)

Phase F6 — Asset generation (1–2 days)
  ├── Generate hero images via generate_image tool
  ├── Generate project showcase mockups
  ├── Generate vertical hero images (agriculture, textiles)
  ├── Create MSME Marketplace logo
  └── Generate blog post thumbnails

Phase F7 — Polish & responsive (1–2 days)
  ├── Full responsive testing (mobile, tablet, desktop)
  ├── Animation tuning (timing, easing, stagger delays)
  ├── Lighthouse audit (performance, accessibility, SEO)
  ├── Cross-browser testing
  └── i18n setup (next-i18next for Hindi + English)
```

**Total frontend estimate: 10–14 days**

---

## 7. Frontend — Web App (Next.js) — Application Pages

These are the **authenticated, functional pages** that connect to the Django/FastAPI backends. Built after the marketing site is polished.

> **Status:** ✅ UI complete for Buyer/Admin/Verifier (17 routes across the three consoles) / 🟡 data wiring partial. Only auth actually calls the Django backend. Every other page reads from `web-app/lib/mock-data.ts`, deliberately shaped to match the Django serializers so each mock array is a like-for-like swap for a real `djangoApi.get(...)` call later. 7 write-actions are explicitly TODO-seamed (see §12 for the full file:line list): post requirement, buy/bid on a listing, verifier review submit, admin vertical-config save, admin user active-toggle, admin dispute resolve, admin price-point add.

### 7.1 Auth Pages

> **Status:** ✅ Built and real (not mocked). Login/register hit Django's `/api/auth/login/`, `/api/auth/register/`, `/api/auth/me/` for real, session (JWT + user) stored in `localStorage` via `lib/auth.ts`. `dashboardPathForRole()` redirects to the correct console post-login.

| Page | Route | Components | Status |
|---|---|---|---|
| Login | `/login` | Email/phone + password form, JWT storage, role-based redirect | ✅ Built |
| Register | `/register` | Role selection → profile info; reads `?plan=` query param to default role | ✅ Built (single-step, not multi-step as originally planned) |
| Forgot Password | `/forgot-password` | Email input → reset flow | ⬜ Not built |

> [!NOTE]
> **JWT storage is a known, documented tradeoff.** `lib/auth.ts` stores tokens in `localStorage` rather than the httpOnly refresh cookie described in §10.1 — a pragmatic dev-only choice, called out in-code as a TODO pointing back to this plan. See §12.

### 7.2 Buyer Dashboard

> **Status:** ✅ All 8 routes built (dashboard/catalog/catalog detail/requirements/orders/estimate/notifications — no separate requirement-detail or order-detail page yet, see table). All mock-data-driven except auth.

| Page | Route | Purpose | Status |
|---|---|---|---|
| Dashboard | `/buyer/dashboard` | Overview: active requirements, recent orders, price alerts | ✅ Built (stat tiles + recent-orders table) |
| Catalog Browse | `/buyer/catalog` | Search/filter listings by vertical, grade, location, price | ✅ Built (client-side filter over mock listings) |
| Listing Detail | `/buyer/catalog/[id]` | Full listing info, grading report, price breakdown, bid/buy CTA | ✅ Built. `ListingActions` (Buy Now/Contact seller) are stubbed — both just toast "coming soon" |
| My Requirements | `/buyer/requirements` | List/create/manage requirements | ✅ Built. "Post Requirement" dialog only appends to local state, no persistence |
| Requirement Detail | `/buyer/requirements/[id]` | View matches, allocation proposals, accept/reject | ⬜ Not built |
| Orders | `/buyer/orders` | Order history, status tracking | ✅ Built (expandable list, multi-seller allocations shown) |
| Order Detail | `/buyer/orders/[id]` | Allocation breakdown, dispute option | ⬜ Not built (folded into the expandable `/buyer/orders` list instead) |
| Cost Estimator | `/buyer/estimate` | Input quantity + grade → estimated cost | ✅ Built. Computes client-side from hardcoded base-price/grade-multiplier tables, not a live FastAPI `/compute/pricing/estimate` call |
| Notifications | `/buyer/notifications` | In-app notification panel | ✅ Built (static mock feed) |

### 7.3 Admin Console

> **Status:** ✅ All 7 routes built exactly as planned, all mock-data-driven.

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/admin/dashboard` | Platform overview: total listings, orders, users, revenue |
| Vertical Config | `/admin/verticals` | List all verticals, edit schemas/pricing rules |
| Vertical Editor | `/admin/verticals/[id]` | JSONB schema editor for grading attributes + pricing rules |
| User Management | `/admin/users` | View/manage all users, role assignments |
| Verification Queue | `/admin/verification` | Review flagged listings (shared with Verifier) |
| Disputes | `/admin/disputes` | All disputes, resolution workflow |
| Price Management | `/admin/pricing` | Manual price entry (textiles), view ingested prices |

### 7.4 Verifier Console

> **Status:** ✅ All 3 routes built exactly as planned, all mock-data-driven. The review page's Confirm/Override actions toast and redirect but don't call a real endpoint yet.

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/verifier/dashboard` | Queue count, recent reviews, accuracy stats |
| Verification Queue | `/verifier/queue` | Flagged listings awaiting review |
| Review Page | `/verifier/queue/[id]` | Side-by-side: evidence (photos/docs) + AI grade + override form |

### 7.5 Application UI Components (shadcn/ui based)

> **Status:** 🟡 Mostly built, with one substitution. Table, Form (react-hook-form + zod), Sheet/Sidebar, Tabs, Dialog, Select, Switch, and Field primitives are all built and used throughout. **No Command palette (⌘K)** exists yet. **No charting library** was added — `components/shared/price-trend-chart.tsx` is a small hand-built inline-SVG line chart instead of Recharts/shadcn charts, used on the buyer estimator page.

- **DataTable** (sortable, filterable, paginated) for listings, orders, disputes — ✅ built as plain shadcn `Table` (sort/filter is client-side, not a generic reusable `DataTable` abstraction)
- **Form** (react-hook-form + zod validation) for all input forms — ✅ built, used in auth + every admin/buyer form
- **Sheet/Drawer** for mobile-friendly side panels — ✅ built (`components/ui/sheet.tsx`, powers the mobile sidebar)
- **Command** (⌘K style) for quick search across listings — ⬜ not built
- **Charts** (Recharts or shadcn charts) for price trends, analytics — 🟡 substituted with a custom inline-SVG chart (`price-trend-chart.tsx`) rather than a charting library

---

## 8. Seller Mobile App (Kotlin/Android)

> **Status:** ⬜ Not started. No `seller-app/` directory, no Kotlin/Android files anywhere in the repository. This entire section remains pure forward-looking spec — explicitly out of scope for now per standing instruction to skip app/ML work while the web dashboard was being built. The Django side is already prepared for it (`Listing.client_uuid` for idempotent offline sync, §4.3), so this section can be picked up without backend changes.

### 8.1 Architecture

- **MVVM** with Kotlin Coroutines + Flow
- **Room DB** for offline-first listing creation
- **WorkManager** for background sync when connectivity returns
- **Retrofit** for REST API calls to Django backend
- **Hilt** for dependency injection
- **FCM SDK** for push notifications

### 8.2 Screens

| Screen | Purpose |
|---|---|
| Login/Register | JWT auth, role = SELLER enforced |
| Dashboard | Active listings, pending grades, notifications, quick stats |
| Create Listing | Multi-step form: vertical → commodity → quantity → evidence upload → submit |
| My Listings | List with status filters (Draft, Pending, Active, Sold) |
| Listing Detail | Full info + grading results + bids received |
| Evidence Capture | Camera/gallery integration for photo/video upload |
| Bid Management | View incoming bids, accept/reject/counter |
| Notifications | Push notification history |
| Profile | Edit profile, language preference, FCM token management |

### 8.3 Offline-First Flow

1. Seller creates listing offline → saved to Room DB with status `DRAFT_LOCAL`
2. Evidence photos saved to local storage with listing reference
3. `WorkManager` periodic task checks connectivity
4. On reconnect: upload evidence files → create listing via API → mark synced
5. Conflict resolution: server timestamp wins, client gets updated record

### 8.4 Key Dependencies

```kotlin
// build.gradle.kts
dependencies {
    // Android core
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.9.0")
    
    // Room (offline DB)
    implementation("androidx.room:room-runtime:2.7.1")
    implementation("androidx.room:room-ktx:2.7.1")
    ksp("androidx.room:room-compiler:2.7.1")
    
    // WorkManager (background sync)
    implementation("androidx.work:work-runtime-ktx:2.10.1")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // DI
    implementation("com.google.dagger:hilt-android:2.54")
    ksp("com.google.dagger:hilt-compiler:2.54")
    
    // FCM
    implementation("com.google.firebase:firebase-messaging-ktx:24.1.1")
    
    // Image loading
    implementation("io.coil-kt:coil:2.7.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.9.0")
}
```

---

## 9. ML Grading Pipeline

> **Status:** 🟡 ~30% complete. The OpenCV preprocessing stage (§9.4) is real, functional, and live — dynamically imported by the FastAPI grading service. Everything past preprocessing (§9.3 model training/inference) is unbuilt: `ml-training/scripts/train_classifier.py` is an explicit, never-run placeholder (its own docstring says so); `ml-training/data/` and `ml-training/notebooks/` are empty directories; no trained weights or checkpoints exist anywhere. `requirements-ml.txt` (torch/opencv/ultralytics) is declared but not installed in the FastAPI env. Grading currently falls back to a crude OpenCV edge-density heuristic proxy (`backend-fastapi/grading/pipeline.py`) instead of real MobileNetV3/YOLOv8n inference — see §5.1.

### 9.1 Architecture

```
Evidence Upload → Django (file storage) → FastAPI (grading trigger)
                                              ↓
                                    OpenCV preprocessing
                                              ↓
                                    MobileNetV3/YOLOv8n inference
                                              ↓
                                    Confidence score + attribute grades
                                              ↓
                              confidence ≥ 80%?  → grading_results (AI)
                              confidence < 80%?  → verification queue
```

### 9.2 Grading Attributes by Vertical

**Agriculture (wheat example):**
- `foreign_matter` — ML-gradeable (visual: detect foreign particles in grain photo)
- `moisture_content` — NOT ML-gradeable (needs instrument, manual entry)
- `grade_standard` — NOT ML-gradeable (needs certified assessment)

**Textiles (cotton fabric example):**
- `defect_rate` — ML-gradeable (visual: detect weaving defects, stains, holes)
- `gsm` — NOT ML-gradeable (needs weight measurement)
- `thread_count` — NOT ML-gradeable (needs lab analysis)

### 9.3 Model Selection

| Model | Params | Size | Inference (CPU) | Inference (GPU) | Use Case |
|---|---|---|---|---|---|
| MobileNetV3-Small | 2.5M | 10MB | ~15ms | ~3ms | Classification (grade prediction) |
| YOLOv8n | 3.2M | 6MB | ~30ms | ~5ms | Object detection (defect/foreign matter localization) |

**Training plan:**
1. Start with pretrained weights (ImageNet for MobileNetV3, COCO for YOLOv8n)
2. Use for general feature extraction initially — expect low accuracy, high verifier routing
3. As verifier-confirmed results accumulate (target: 200+ labeled images per class), fine-tune
4. Fine-tuning runs locally on RTX 3050 6GB — well within VRAM budget

### 9.4 OpenCV Preprocessing Pipeline

> **Status:** ✅ Implemented essentially as specified, in `ml-training/scripts/preprocess.py` — `extract_gabor_features()` (a real Gabor filter bank for texture) plus `preprocess_evidence()` matching the color histogram / texture / edge-density / resized-tensor shape below, with a CLI entry point. This is the module `backend-fastapi/grading/pipeline.py` dynamically imports at inference time — if the import fails (ML deps missing), grading falls back to a deterministic stub result instead (see §5.1).

```python
def preprocess_evidence(image_path: str) -> dict:
    img = cv2.imread(image_path)
    
    # 1. Color analysis (dominant colors, uniformity)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    color_histogram = cv2.calcHist([hsv], [0, 1], None, [180, 256], [0, 180, 0, 256])
    
    # 2. Texture analysis (Gabor filters for fabric, grain patterns)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gabor_features = extract_gabor_features(gray)
    
    # 3. Edge detection (defect boundaries)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # 4. Resize for model input
    resized = cv2.resize(img, (224, 224))
    normalized = resized / 255.0
    
    return {
        "tensor": normalized,
        "color_features": color_histogram,
        "texture_features": gabor_features,
        "edge_density": edge_density
    }
```

---

## 10. Integration, Testing & Polish

> **Status:** ⬜ Mostly not started. Only the auth flow is integrated end-to-end (frontend → Django JWT). Test coverage across the whole project is thin — see §10.2 for exact counts. No Vitest, Playwright, or ML test suite exists yet.

### 10.1 API Integration (Frontend ↔ Backend)

> **Status:** 🟡 Partial, and diverges from plan on JWT storage. `lib/api.ts` is built and generic (fetch-based, `djangoApi`/`fastApi` wrappers) but **only auth endpoints are wired through it** (`login`, `register`, `getCurrentUser`) — no listings/orders/verticals/pricing calls exist yet, despite the client being ready for them.

- **API client:** ✅ Built — `lib/api.ts`, fetch-based (not Axios), `djangoApi`/`fastApi` typed wrappers. Only auth calls actually go through it today.
- **JWT management:** 🟡 Diverges from plan. Tokens are stored in `localStorage` (`lib/auth.ts`), not "access token in memory, refresh token in httpOnly cookie" as originally planned — an explicit, in-code-documented dev-only tradeoff. Moving to an httpOnly refresh cookie is tracked in §12.
- **Error handling:** 🟡 Partial — `sonner` toasts are used ad hoc on individual pages for mock-action feedback; no global error boundary yet.
- **Loading states:** 🟡 Partial — `Skeleton` components are used for the auth-gating layout shells (buyer/admin/verifier layouts show a skeleton while checking the session), but not systematically across every data-fetching surface (most of which is still synchronous mock data, so there's nothing to load yet).

### 10.2 Testing Strategy

> **Status:** ⬜ Far below target across every layer. Actual counts as of this audit:

| Layer | Tool | Coverage Target | Actual |
|---|---|---|---|
| Django models/views | `pytest-django` | 80%+ on business logic (RBAC, allocation, grading) | ⚠️ 2 test methods total, `accounts` app only (register→login→/me/ flow, blocked admin self-registration). 7 of 8 apps have zero tests. |
| FastAPI endpoints | `pytest` + `httpx` | 80%+ on compute services | ⚠️ 5 test functions total, `matching/allocation.py` only. `grading`, `pricing`, `scheduler`, `main.py` have zero tests. |
| ML grading | Custom test suite | Accuracy metrics on holdout set | ⬜ None — no trained model to evaluate yet (§9). |
| React components | Vitest + React Testing Library | Key interactive flows | ⬜ Neither Vitest nor RTL is installed. |
| E2E flows | Playwright | Critical paths (listing creation → grading → matching → order) | ⬜ Not installed; no critical-path flow is fully wired end-to-end yet to test against. |
| API contract | OpenAPI schema validation | All endpoints | ⬜ Not set up. |

### 10.3 Performance Targets

- **Landing page:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API response:** P95 < 200ms for catalog queries, < 500ms for grading trigger
- **ML inference:** < 100ms per image on GPU, < 500ms on CPU
- **Offline sync:** < 30s to sync 10 listings on reconnect

---

## 11. Azure Production Migration (Phase 7)

> **Status:** ⬜ Not started — correctly so. Local development is not yet complete end-to-end (§7, §9, §10), so this phase should stay untouched per its own gating note below.

> [!NOTE]
> This entire section is deferred until all local development is complete and working end-to-end. The $100 Azure student credit is not touched until this phase.

### 11.1 Migration Checklist

- [ ] Swap PostgreSQL Docker → Azure Database for PostgreSQL Flexible Server (Burstable B1MS)
- [ ] Swap local disk → Azure Blob Storage via `django-storages` (settings change only)
- [ ] Deploy Django + FastAPI to Azure Container Apps (Consumption plan)
- [ ] Write Bicep/Terraform IaC in `infra/`
- [ ] Validate ML model CPU inference latency in container
- [ ] Add deploy workflows to GitHub Actions
- [ ] Add Sentry for error tracking
- [ ] Configure custom domain + SSL
- [ ] Load testing with realistic data volumes

### 11.2 Cost Projection

| Resource | Tier | Est. Monthly |
|---|---|---|
| Azure DB for PostgreSQL | Burstable B1MS (free 12mo if eligible) | $0–15 |
| Azure Container Apps | Consumption plan | ~$0 |
| Azure Blob Storage | Standard LRS | ~$1–3 |
| **Total** | | **< $15/month** |

---

## 12. Pending Work — Prioritized

Consolidated from every ⚠️/🟡/⬜ marker above, grouped by area. File paths are relative to the repo root.

### Backend — Django
- [x] Wire the grading-trigger endpoint to actually call FastAPI (`catalog/views.py:68`, `POST /api/catalog/listings/{id}/grading/trigger/` → `POST /compute/grading/grade`). Verified end-to-end against a real running FastAPI + Postgres, plus `catalog/tests.py:GradingTriggerTest`.
- [ ] Wire FCM dispatch to the Firebase Admin SDK (`notifications/signals.py:18,28`) — currently logs only.
- [ ] Write tests for the 7 untested apps (`catalog`, `config`, `disputes`, `notifications`, `orders`, `pricing`, `reputation`) — currently only `accounts` has coverage.

### Backend — FastAPI
- [ ] Implement real Agmarknet ingestion in `ingest_agmarknet_prices` (`scheduler/jobs.py`) — currently a stub that only logs.
- [x] Resolve the `grade` derivation TODOs in `matching/router.py` and `pricing/router.py`. New `grading/grade.py:derive_grade()` — weighted-average of `GradingResult.attribute_scores` by `GradingSchema.attributes[].weight`, thresholded into "Grade A"/"Grade B"/"Grade C" (documented as a deliberate, swappable choice for a contract §3.1 never defined, not a final design). Also fixed a real pre-existing inconsistency: `matching/allocation.py`'s `DEFAULT_GRADE_ORDER` used bare `"A"/"B"/"C"` while `PricingRule.rules.grade_adjustment_table` and every frontend fixture used `"Grade A"` — standardized on the latter (dominant convention) and updated `tests/test_allocation.py`'s fixtures accordingly. Also caught and fixed a float-precision boundary bug (0.85×0.5+0.85×0.3 == 0.8499999999999999 in binary float, misclassifying an exact threshold). 9 new tests (`tests/test_grade.py`). `grading/lookup.py` holds the shared DB-lookup glue (schema attributes, latest grading result) used by `grading/`, `pricing/`, and `matching/` routers alike. `GradeResponse`/`GradingStatusResponse` (`grading/schemas.py`) also gained a `grade` field. Verified end-to-end against live Postgres: graded a listing, confirmed `/compute/grading/status`, `/compute/pricing/adjusted` (`grade_used: "Grade A"`, correct multiplier applied), and `/compute/matching/find` (a cheaper but lower-graded listing correctly lost to a pricier higher-graded one under a `min_grade` requirement) all agree.
  - [ ] Region derivation (`matching/router.py`, `pricing/router.py`) is still unresolved — real lat/lng radius filtering (haversine or PostGIS `ST_DWithin`) against `location_lat`/`location_lng` vs `region_lat`/`region_lng`/`price_points.region` (free text). Left alone this pass; smaller/more geometry-heavy, less cross-cutting than grade was.
- [ ] Add test coverage for `grading/`, `pricing/`, and `scheduler/` modules (`matching/` and the new `grading/grade.py` are tested today).

### Frontend
- [x] `app/admin/pricing/page.tsx` — wired end-to-end: verticals and price points now load from `GET /api/config/verticals/` and `GET /api/pricing/price-points/` (both DRF-paginated — see `Paginated<T>` in `lib/api.ts`), "Add price point" persists via `POST /api/pricing/price-points/`. The vertical filter tabs and the add-dialog's vertical picker are now driven by real verticals instead of a hardcoded agriculture/textiles pair. `PricePoint` has no `unit` field on the Django side (unit is implied by the vertical's `unit_of_measure`) — the form's unit input is preserved in `raw_data.unit` rather than dropped or forced into the model. Verified with a real browser session against live Django/FastAPI/Postgres (login → add a price point → reload → still there), not just a mocked test.
- [x] `components/admin/vertical-editor.tsx` (+ `app/admin/verticals/page.tsx` and `app/admin/verticals/[id]/page.tsx`) — wired end-to-end via `PUT /api/config/verticals/{id}/grading-schema/` and `PUT /api/config/verticals/{id}/pricing-rules/` (not a plain `PATCH /verticals/{id}/`, which only touches name/slug/unit_of_measure/is_active). One real mismatch found and handled: `PricingRule.rules` has a live reader — `backend-fastapi/pricing/service.py` — that expects `{grade_adjustment_table: [{grade, multiplier}], quantity_tier_table: [{min_quantity, multiplier}]}`, not the editor's percentage-based UI shape (`adjustment_pct`/`discount_pct`). Added a bidirectional multiplier↔percentage converter in the component rather than changing the UI or the FastAPI contract. `GradingSchema.attributes` has no such live shape constraint (only `name`/`gradeable_by_ml` are read, by `grading/router.py:_ml_attribute_names`), so it's persisted as-is. Verified deeply: edited a grade adjustment in the browser (4%→5%), confirmed Postgres stored `multiplier: 1.05`, then confirmed `GET /compute/pricing/estimate` on FastAPI actually priced a listing using it (`2000 × 1.05 × 0.985 = 2068.5`) — full stack, not just the UI layer.
- [x] `app/admin/users/page.tsx` — wired end-to-end. This one was genuinely blocked (no admin user-list/detail endpoint existed), so it needed a small backend addition, not just frontend wiring: `accounts/views.py:AdminUserViewSet` (list + `is_active`-only partial update, `IsAdmin`-gated, `http_method_names` restricted to get/patch so it can't be used for user creation/deletion or email/role edits) + `AdminUserSerializer` (email/phone/role/created_at/profile read-only) + registered in `accounts/urls.py`. Real mount point is `GET/PATCH /api/auth/users/{id}/` — `accounts` is mounted at `/api/auth/` in `core/urls.py`, not `/api/accounts/` as this doc originally assumed (there is no `/api/accounts/` prefix anywhere). 4 new backend tests (`accounts/tests.py:AdminUserManagementTest`) cover list, 403-for-non-admin, the toggle, and that role can't be changed through this endpoint. Verified in a real browser: toggled a seller's account off, confirmed `is_active=False` in Postgres directly.
- [ ] Wire the remaining mock-data call sites to real `djangoApi`/`fastApi` calls. One is genuinely blocked on backend work not yet done (noted below); the rest are unblocked but not yet done:
  - `lib/mock-data.ts:6` — replace remaining mock arrays (listings, orders, notifications, disputes) with real fetches.
  - `components/buyer/listing-actions.tsx:7` — Buy Now/Contact seller → `POST /api/orders/bids/`. Unblocked (`BidViewSet` already supports create) — not yet done. Note this also needs the buyer catalog list/detail pages (`app/buyer/catalog/`) off mock data first, since `ListingActions` needs a real listing id to bid against. The letter-grade blocker those pages had is now resolved (`grading/grade.py`, above) — Django's `ListingSerializer` still doesn't expose a `grade` field though, so displaying it means either a small Django-side addition (call `derive_grade`-equivalent logic, or have Django call FastAPI's `GET /compute/grading/status/{id}`, which now returns `grade`) or having the frontend fetch grading status per listing itself.
  - `app/buyer` requirements dialog — **partially blocked**: `Requirement` (orders app) has no `unit` field and stores region as `region_lat`/`region_lng` floats, not the free-text region the UI collects — needs either a small model/serializer addition (a text `region` field, mirroring the `raw_data`-style workaround used for pricing's `unit`) or a geocoding step before this can wire cleanly.
  - `components/verifier/review-panel.tsx:33` and `components/verification/review-dialog.tsx` — Confirm/Override/Reject → `POST /api/verification/queue/{id}/review/`. The submit call itself is unblocked. **Loading the queue list needs one more small step**: `VerificationQueueView` (`catalog/views.py`) returns a bare `ListingSerializer` today, not the `ai_grade`/`attribute_scores`/`priority`/`flagged_reason` shape the UI needs. The letter-grade piece that blocked this is now resolved (`grading/grade.py`, above, verified end-to-end) — what's left is reshaping this one Django view's response (join in the latest `GradingResult` per listing, call `grade_for_listing`-equivalent logic or hit FastAPI's `GET /compute/grading/status/{id}`, and decide `priority`/`flagged_reason` — the latter two are presentational and can be simple: e.g. priority from confidence thresholds, flagged_reason from which attribute had the lowest confidence).
- [ ] Move session storage off `localStorage` to an httpOnly refresh cookie issued by Django (per §10.1's original design intent).
- [ ] Add a Vitest + React Testing Library setup and a Playwright E2E setup (§10.2) — neither exists yet.
- [ ] Decide on and build a Command palette (⌘K) if still wanted (§7.5) — currently unbuilt.
- [ ] `next-i18next` (Hindi/English) — not yet installed; part of the deferred Phase F7 polish (§6.7).
- [ ] `/forgot-password` page — not yet built (§7.1).

### ML Pipeline
- [ ] Collect a labeled dataset (target 200+ images/class/vertical per §9.3) under `ml-training/data/<vertical>/<attribute>/<class>/`.
- [ ] Run `ml-training/scripts/train_classifier.py` once data exists — code-complete but never executed.
- [ ] Install `requirements-ml.txt` (torch/opencv/ultralytics) in the FastAPI environment.
- [ ] Swap the OpenCV edge-density heuristic in `backend-fastapi/grading/pipeline.py` for real MobileNetV3-Small / YOLOv8n inference once trained weights exist.

### Seller Mobile App
- [ ] Entire Kotlin/Android app (§8) — not started. Scaffold when this phase is greenlit; the Django-side prerequisite (`Listing.client_uuid` for idempotent offline sync) is already in place.

### Testing / Polish
- [ ] Full §10.2 test-layer buildout across all five layers (Django, FastAPI, ML, React, E2E).
- [ ] Validate against §10.3 performance targets once there's real traffic/data to measure against.
- [ ] Add an OpenAPI schema validation step to CI once more endpoints are frontend-wired.

---

## Open Questions for User Review

> [!IMPORTANT]
> **Color palette:** The plan uses emerald/green (`#10B981`) as the primary accent, replacing the template's gold/amber. Is this the right branding direction? Alternatives: blue (trust), orange (energy/trade), teal (modern/fresh).

> [!IMPORTANT]
> **Brand name:** The plan uses "MSME Marketplace" as a working name. Do you have a preferred brand name? This affects the logo, hero text, and all marketing copy.

> [!IMPORTANT]
> **Pricing tiers (Section 6.5):** The pricing page shows 3 tiers (Starter/Growth/Enterprise). Are these relevant for your project, or should this be adapted? (The original project doc doesn't mention marketplace monetization.)

> [!WARNING]
> **Disk space:** Your system has ~34GB free on a 121GB drive. Docker images (PostgreSQL ~400MB, PostGIS ~800MB), node_modules (~300MB), Python venvs (~2GB with PyTorch), and Android SDK (~5–10GB) will consume significant space. You may want to free up space or use an external drive.

> [!NOTE]
> **Frontend template screenshots:** Only 4 screenshots were provided. The browser MCP and URL scraping have captured the full homepage structure. For sub-pages (`/work`, `/products`, `/pricing`, `/blog`), I'll use browser MCP during implementation to verify exact layouts.
