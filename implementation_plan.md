# MSME Multi-Vertical Commodity Marketplace — Full Implementation Plan

**Scope:** Agriculture + Textiles verticals only (MVP). Solo developer. Fully local build. Azure only in final migration phase.

This is a **single-phase, in-depth implementation plan** covering the entire project end-to-end: system dependencies, monorepo scaffold, both backends (Django + FastAPI), database, the Next.js web frontend (cloned from the Aceternity productized agency template and adapted for the marketplace), the Kotlin seller app, ML grading, and all supporting infrastructure.

> [!IMPORTANT]
> **Frontend approach:** The web-app will be built by 1:1 cloning the layout, animations, and design patterns from the [Aceternity productized agency template](https://productized-agency-template-acetern.vercel.app/) using **free open-source components only** (Aceternity UI, Magic UI, shadcn/ui). All text, imagery, sections, and navigation will be re-skinned for the MSME Marketplace context. No custom UI component design — everything sourced from these three libraries.

---

## Table of Contents

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

---

## 1. System Dependencies & Environment Setup

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
# Installed via pnpm inside web-app/
next@15            # App Router
react@19
react-dom@19
typescript
tailwindcss@4      # v4 (CSS-first config)
@tailwindcss/postcss
motion             # (formerly framer-motion) — for Aceternity components
clsx
tailwind-merge
lucide-react       # icons
@tabler/icons-react # icons (used by Aceternity components)
next-i18next       # i18n
```

---

## 2. Monorepo Scaffold & DevOps Foundation

### 2.1 Directory Structure

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
│   ├── orders/                  # Orders, allocations, requirements
│   ├── disputes/                # Dispute handling workflow
│   └── notifications/           # In-app notifications + FCM dispatch
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
├── web-app/                     # Next.js 15 (buyer + admin + verifier + landing)
│   ├── app/                     # App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing/home page
│   │   ├── globals.css
│   │   ├── (marketing)/         # Route group: landing page sections
│   │   │   ├── work/
│   │   │   ├── products/
│   │   │   ├── pricing/
│   │   │   └── blog/
│   │   ├── (auth)/              # Route group: login, register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (buyer)/             # Route group: buyer dashboard
│   │   │   ├── catalog/
│   │   │   ├── requirements/
│   │   │   ├── orders/
│   │   │   └── dashboard/
│   │   ├── (admin)/             # Route group: admin console
│   │   │   ├── verticals/
│   │   │   ├── verification-queue/
│   │   │   ├── disputes/
│   │   │   └── dashboard/
│   │   └── (verifier)/          # Route group: verifier console
│   │       ├── queue/
│   │       └── dashboard/
│   ├── components/
│   │   ├── ui/                  # Aceternity UI + Magic UI + shadcn base components
│   │   ├── marketing/           # Landing page section components
│   │   ├── buyer/               # Buyer-specific components
│   │   ├── admin/               # Admin-specific components
│   │   └── shared/              # Shared components (navbar, footer, etc.)
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

### 4.1 Apps & Responsibilities

| Django App | Models | Responsibilities |
|---|---|---|
| `accounts` | User, UserProfile | Registration, JWT auth (SimpleJWT), RBAC (4 roles), profile management |
| `config` | Vertical, GradingSchema, PricingRule | Vertical CRUD, grading schema editor, pricing rule editor (Admin-only) |
| `catalog` | Listing, GradingEvidence, GradingResult | Listing CRUD, evidence upload (→ local disk via `django-storages`), grading result storage, catalog search/filter API |
| `orders` | Requirement, Order, OrderAllocation, Bid | Requirement posting, order creation, allocation records, bid/negotiation workflow |
| `disputes` | Dispute | Dispute creation, status transitions, evidence attachment, resolution |
| `notifications` | Notification | Create/read/mark-read notifications, FCM push dispatch |

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

- **RBAC:** Custom permission classes per role. Sellers can only CRUD their own listings. Buyers can only see ACTIVE listings. Admins see everything. Verifiers see only the verification queue.
- **File upload:** `django-storages` with `FileSystemStorage` backend locally (Docker volume at `/media`). Swappable to `AzureBlobStorage` via settings.
- **Seller-app sync:** Listings created offline on the Kotlin app sync via `POST /api/catalog/listings/` on reconnection. Idempotent creation using a client-generated UUID to avoid duplicates.
- **FCM dispatch:** When a `Notification` record is created, a Django signal dispatches it via FCM to registered devices (if the user has an FCM token stored).

---

## 5. Backend — FastAPI (Compute/ML)

### 5.1 Services

| Module | Endpoints | Responsibilities |
|---|---|---|
| `grading` | `POST /grading/grade` | Receives listing_id, fetches evidence from DB, runs ML on `gradeable_by_ml` attributes, writes results to `grading_results` |
| `pricing` | `GET /pricing/base-price`, `GET /pricing/adjusted-price`, `GET /pricing/cost-estimate`, `GET /pricing/trends` | Base price lookup, grade-adjusted calculator, quantity-tiered calculator, cost estimator, historical trend data |
| `matching` | `POST /matching/find-matches`, `POST /matching/allocate` | Matches requirements to listings, runs multi-listing allocation algorithm |
| `scheduler` | Internal (APScheduler) | Agmarknet data ingestion (cron), price data cleanup |

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

### 5.4 APScheduler Jobs

```python
# Agmarknet price ingestion — runs every 6 hours
scheduler.add_job(ingest_agmarknet_prices, 'interval', hours=6)

# Textiles — manual/admin-entered, no scheduled job needed yet

# Stale listing cleanup — runs daily
scheduler.add_job(expire_stale_listings, 'cron', hour=2, minute=0)
```

---

## 6. Frontend — Web App (Next.js) — Landing/Marketing Site

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

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router, Turbopack) | Framework |
| React | 19 | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | 4.0 | Styling (CSS-first config) |
| `motion` | Latest | Animations (Aceternity components need this) |
| `clsx` + `tailwind-merge` | Latest | Class merging utility (`cn()`) |
| `lucide-react` | Latest | Primary icon library |
| `@tabler/icons-react` | Latest | Secondary icons (Aceternity compat) |
| `next-i18next` | Latest | i18n / multilingual |
| pnpm | Latest | Package manager |

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

### 7.1 Auth Pages

| Page | Route | Components |
|---|---|---|
| Login | `/login` | Email/phone + password form, JWT storage, role-based redirect |
| Register | `/register` | Multi-step: role selection → profile info → verification |
| Forgot Password | `/forgot-password` | Email input → reset flow |

### 7.2 Buyer Dashboard

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/buyer/dashboard` | Overview: active requirements, recent orders, price alerts |
| Catalog Browse | `/buyer/catalog` | Search/filter listings by vertical, grade, location, price |
| Listing Detail | `/buyer/catalog/[id]` | Full listing info, grading report, price breakdown, bid/buy CTA |
| My Requirements | `/buyer/requirements` | List/create/manage requirements |
| Requirement Detail | `/buyer/requirements/[id]` | View matches, allocation proposals, accept/reject |
| Orders | `/buyer/orders` | Order history, status tracking |
| Order Detail | `/buyer/orders/[id]` | Allocation breakdown, dispute option |
| Cost Estimator | `/buyer/estimate` | Input quantity + grade → estimated cost |
| Notifications | `/buyer/notifications` | In-app notification panel |

### 7.3 Admin Console

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

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/verifier/dashboard` | Queue count, recent reviews, accuracy stats |
| Verification Queue | `/verifier/queue` | Flagged listings awaiting review |
| Review Page | `/verifier/queue/[id]` | Side-by-side: evidence (photos/docs) + AI grade + override form |

### 7.5 Application UI Components (shadcn/ui based)

For the application pages (dashboards, forms, tables), use shadcn/ui base components extensively:
- **DataTable** (sortable, filterable, paginated) for listings, orders, disputes
- **Form** (react-hook-form + zod validation) for all input forms
- **Sheet/Drawer** for mobile-friendly side panels
- **Command** (⌘K style) for quick search across listings
- **Charts** (Recharts or shadcn charts) for price trends, analytics

---

## 8. Seller Mobile App (Kotlin/Android)

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

### 10.1 API Integration (Frontend ↔ Backend)

- **API client:** Centralized `lib/api.ts` with Axios/fetch wrapper
- **JWT management:** Access token in memory, refresh token in httpOnly cookie
- **Error handling:** Global error boundary, toast notifications for API errors
- **Loading states:** Skeleton loaders matching the Aceternity design aesthetic

### 10.2 Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Django models/views | `pytest-django` | 80%+ on business logic (RBAC, allocation, grading) |
| FastAPI endpoints | `pytest` + `httpx` | 80%+ on compute services |
| ML grading | Custom test suite | Accuracy metrics on holdout set |
| React components | Vitest + React Testing Library | Key interactive flows |
| E2E flows | Playwright | Critical paths (listing creation → grading → matching → order) |
| API contract | OpenAPI schema validation | All endpoints |

### 10.3 Performance Targets

- **Landing page:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API response:** P95 < 200ms for catalog queries, < 500ms for grading trigger
- **ML inference:** < 100ms per image on GPU, < 500ms on CPU
- **Offline sync:** < 30s to sync 10 listings on reconnect

---

## 11. Azure Production Migration (Phase 7)

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
