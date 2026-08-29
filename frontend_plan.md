# MSME Marketplace — Frontend Implementation Plan (Exhaustive)

**This is the dedicated frontend plan referenced from the main implementation plan.**
**Approach:** 1:1 clone of the [Aceternity productized agency template](https://productized-agency-template-acetern.vercel.app/) → re-skin every section for the MSME Marketplace.

**Component sources (in priority order):**
1. **Aceternity UI** — animation-heavy effects (free, copy-paste)
2. **Magic UI** — polished animated components (free, shadcn CLI)
3. **shadcn/ui** — base accessible components (free, shadcn CLI)

> [!IMPORTANT]
> **Rule:** No custom-designed UI components. Everything is sourced from the three libraries above, or 1:1 cloned from the template's open-source patterns. If a template section uses a paid-only Pro component, we replicate it using the free components.

---

## Table of Contents

1. [Project Setup & Design System](#1-project-setup--design-system)
2. [Component Library Setup](#2-component-library-setup)
3. [Shared Layout (Navbar + Footer)](#3-shared-layout-navbar--footer)
4. [Home Page — Section-by-Section](#4-home-page--section-by-section)
5. [Verticals Page (/verticals)](#5-verticals-page)
6. [Services Page (/services)](#6-services-page)
7. [Pricing Page (/pricing)](#7-pricing-page)
8. [Blog Page (/blog)](#8-blog-page)
9. [Authenticated Application Pages](#9-authenticated-application-pages)
10. [Asset Generation Plan](#10-asset-generation-plan)
11. [Component Dependency Graph](#11-component-dependency-graph)
12. [File-by-File Implementation Order](#12-file-by-file-implementation-order)
13. [Responsive Strategy](#13-responsive-strategy)
14. [Animation Catalog](#14-animation-catalog)

---

## 1. Project Setup & Design System

### 1.1 Scaffold

```bash
# Create Next.js 15 project with App Router + Tailwind v4
pnpm create next-app@latest web-app --typescript --tailwind --app --src-dir=false --import-alias="@/*" --turbopack

cd web-app

# Install core dependencies
pnpm add motion clsx tailwind-merge lucide-react @tabler/icons-react

# Install shadcn/ui
pnpm dlx shadcn@latest init

# Install Magic UI components (via shadcn registry)
# Done per-component as needed
```

### 1.2 Design Tokens (`app/globals.css`)

```css
@import "tailwindcss";

@theme inline {
  /* === MSME Marketplace Color Palette === */
  
  /* Backgrounds */
  --color-background: #0a0a0a;
  --color-surface: #171717;
  --color-surface-elevated: #1f1f1f;
  
  /* Borders */
  --color-border: #262626;
  --color-border-muted: #1a1a1a;
  
  /* Primary accent: Emerald (agriculture/trade) */
  --color-primary: #10B981;
  --color-primary-hover: #059669;
  --color-primary-glow: #34D399;
  --color-primary-muted: rgba(16, 185, 129, 0.15);
  
  /* Text */
  --color-heading: #ffffff;
  --color-body: #a3a3a3;
  --color-muted: #737373;
  --color-natural-white: #fafafa;
  
  /* Light sections */
  --color-offwhite: #f5f5f0;
  --color-offwhite-surface: #e8e8e3;
  
  /* Status colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* === Typography === */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
  --font-dm-mono: 'DM Mono', monospace;
  
  /* === Spacing (matches template) === */
  --max-w-container: 1280px;
  
  /* === Animations === */
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 600ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Custom keyframes for Aceternity/Magic UI components */
@keyframes spotlight {
  0% { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
  100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
}

@keyframes shimmer {
  from { background-position: 0 0; }
  to { background-position: -200% 0; }
}

@keyframes meteor {
  0% { transform: rotate(215deg) translateX(0); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
}

@keyframes border-beam {
  100% { offset-distance: 100%; }
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--gap))); }
}

@keyframes marquee-vertical {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-100% - var(--gap))); }
}
```

### 1.3 Utility (`lib/utils.ts`)

```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.4 Font Loading (`app/layout.tsx`)

```typescript
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmMono = localFont({
  src: "../public/fonts/DMMono-Regular.woff2",
  variable: "--font-dm-mono",
});
```

---

## 2. Component Library Setup

### 2.1 Aceternity UI Components to Copy

Each component is copied from [ui.aceternity.com](https://ui.aceternity.com/) into `components/ui/`:

| File | Component | Used In | Priority |
|---|---|---|---|
| `spotlight.tsx` | Spotlight | Hero, CTA section | P0 |
| `text-generate-effect.tsx` | TextGenerateEffect | Hero heading | P0 |
| `background-beams.tsx` | BackgroundBeams | Hero | P0 |
| `floating-navbar.tsx` | FloatingNavbar | All pages | P0 |
| `infinite-moving-cards.tsx` | InfiniteMovingCards | Logos, Testimonials | P0 |
| `bento-grid.tsx` | BentoGrid / BentoGridItem | Features section | P0 |
| `three-d-card.tsx` | ThreeDCard | Project showcase | P1 |
| `wobble-card.tsx` | WobbleCard | Verticals page | P1 |
| `animated-tooltip.tsx` | AnimatedTooltip | Team/avatar sections | P1 |
| `sticky-scroll-reveal.tsx` | StickyScrollReveal | Services page | P1 |
| `moving-border.tsx` | MovingBorder | CTA buttons | P1 |
| `lamp-effect.tsx` | LampEffect | Section headers | P2 |
| `tabs.tsx` | AnimatedTabs | Pricing toggle, features | P2 |
| `compare.tsx` | Compare | Before/after showcase | P2 |
| `meteors.tsx` | Meteors | Background accents | P2 |
| `typewriter-effect.tsx` | TypewriterEffect | Dynamic text | P2 |
| `card-hover-effect.tsx` | HoverEffect | Cards with spotlight hover | P2 |
| `hero-parallax.tsx` | HeroParallax | Possible verticals page | P2 |

### 2.2 Magic UI Components to Install

Installed via shadcn registry:

```bash
# Priority 0
pnpm dlx shadcn@latest add "https://magicui.design/r/marquee"
pnpm dlx shadcn@latest add "https://magicui.design/r/number-ticker"
pnpm dlx shadcn@latest add "https://magicui.design/r/shimmer-button"

# Priority 1
pnpm dlx shadcn@latest add "https://magicui.design/r/globe"
pnpm dlx shadcn@latest add "https://magicui.design/r/animated-beam"
pnpm dlx shadcn@latest add "https://magicui.design/r/border-beam"
pnpm dlx shadcn@latest add "https://magicui.design/r/magic-card"
pnpm dlx shadcn@latest add "https://magicui.design/r/avatar-circles"

# Priority 2
pnpm dlx shadcn@latest add "https://magicui.design/r/animated-list"
pnpm dlx shadcn@latest add "https://magicui.design/r/dock"
pnpm dlx shadcn@latest add "https://magicui.design/r/particles"
pnpm dlx shadcn@latest add "https://magicui.design/r/hero-video-dialog"
pnpm dlx shadcn@latest add "https://magicui.design/r/retro-grid"
pnpm dlx shadcn@latest add "https://magicui.design/r/blur-fade"
```

### 2.3 shadcn/ui Base Components

```bash
# Core UI
pnpm dlx shadcn@latest add button card badge avatar separator skeleton scroll-area

# Navigation
pnpm dlx shadcn@latest add navigation-menu breadcrumb sidebar pagination

# Forms
pnpm dlx shadcn@latest add form input textarea select combobox checkbox radio-group switch slider label

# Data Display
pnpm dlx shadcn@latest add table data-table progress chart

# Feedback
pnpm dlx shadcn@latest add dialog alert-dialog sheet drawer popover tooltip hover-card toast alert command

# Layout
pnpm dlx shadcn@latest add accordion tabs carousel
```

---

## 3. Shared Layout (Navbar + Footer)

### 3.1 Navbar (`components/marketing/navbar.tsx`)

**Cloning from template:** The Aceternity template navbar has these exact elements:
1. **Logo** (left) — `size-8` image, links to `/`
2. **Nav links** (center) — Work, Products, Pricing, Blog — `text-sm font-medium text-natural-white/80`
3. **CTA button** (right) — "Chat with Alex" with animated dot-matrix → avatar transition

**MSME adaptation:**

| Template Element | MSME Replacement |
|---|---|
| Aceternity logo | MSME Marketplace logo (generated) |
| Work | Verticals |
| Products | Services |
| Pricing | Pricing |
| Blog | Blog |
| "Chat with Alex" | "Get Started" |
| Avatar reveal on hover | Commodity icon reveal on hover |

**Animation details (from template HTML):**
- Button has a `data-slot="button-box"` div with absolute positioning
- Contains a 5x5 dot grid (each dot is a `size-0.75 rounded-full`) forming a cross/arrow pattern
- On hover: `group-hover:left-[calc(100%-2.3rem)] group-hover:rotate-180` — the box slides to the right and rotates
- An avatar image is hidden, revealed on hover with blur → sharp transition
- A clip-path overlay sweeps from right to left: `[clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)]`
- The text translates left: `group-hover:-translate-x-8`

**Implementation:** Clone this exact CSS animation pattern, replacing the avatar with a stylized commodity icon or the MSME logo.

**Mobile menu:** Hamburger icon (`tabler-icon-menu-2`), opens a full-screen overlay with nav links stacked vertically.

### 3.2 Footer (`components/marketing/footer.tsx`)

**Template structure (from HTML):**
- Multi-column layout on dark background
- Column 1: Logo + short description
- Columns 2-4: Link groups with headers
- Bottom bar: copyright + social icons

**MSME adaptation:**

```
┌─────────────────────────────────────────────────────────┐
│  [MSME Logo]              Platform    Resources  Legal  │
│  Empowering India's       ─────────   ─────────  ───── │
│  producers with AI-       Verticals   Blog       Privacy│
│  powered commodity        Services    API Docs   Terms  │
│  trading.                 Pricing     Support    Contact │
│                           For Sellers                    │
│                           For Buyers                     │
│─────────────────────────────────────────────────────────│
│  © 2024 MSME Marketplace. All rights reserved.          │
│  [Twitter] [LinkedIn] [GitHub]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Home Page — Section-by-Section

### Section 1: Hero — Deep Technical Clone

**Template visual analysis (from screenshot 1):**
- Full viewport height (`h-screen`) with `rounded-3xl` inner container on black
- Upper portion: subtle animated grid of squares (golden hue, varying opacity)
- Small scattered star dots
- A large glowing elliptical arc at the bottom third (gold/amber `#FA9A63` → `#CDA63C`)
- Multiple layers of blur for the arc glow (12px, 30px, 40px, 50px, 100px blur layers)
- Badge pill top-left
- Two-column text: large heading left, description + CTA right
- Enormous faded brand name text spanning the bottom

**SVG Arc implementation (from template source):**
```
<svg width="1951" height="1806" viewBox="0 0 1951 1806">
  <!-- Primary arc stroke -->
  <path d="M975.5 255C1402.88 255 1749 569.029 1749 956..." 
        stroke="url(#gradient)" stroke-width="4"/>
  <!-- Multiple blur layers for glow effect -->
  <g style="filter:blur(12px);mix-blend-mode:plus-lighter">
    <path ...same arc... stroke="url(#gradient2)"/>
  </g>
  <!-- Additional blur layers: 30px, 40px, 50px, 100px -->
</svg>
```

**MSME color change:** Replace all `#FA9A63` (gold) with `#10B981` (emerald) and `#CDA63C` with `#059669` in the SVG gradients.

**Dot grid (from template):**
```
<!-- Scattered circles at various positions, opacity 0.2 -->
<svg width="822" height="158">
  <circle cx="1" cy="12" r="1" fill="white" opacity="0.2"/>
  <circle cx="122" cy="113" r="1" fill="white" opacity="0.2"/>
  ...30+ circles...
</svg>
```

**Light beam / spotlight (from template):**
```
<!-- Three triangular paths with heavy gaussian blur -->
<g filter="url(#filter_blur_300px)" style="mix-blend-mode:plus-lighter">
  <path d="M611.5 51L495 -188H959L849.5 51H611.5Z" 
        fill="#FA9A63" fill-opacity="0.1"/>
</g>
```

**Badge component:**
```tsx
<a className="flex w-fit rounded-full bg-neutral-900 p-1 shadow-lg shadow-black">
  <div className="flex items-center gap-1 sm:gap-2">
    <div className="rounded-full bg-neutral-950 px-2 py-1 text-[10px] sm:text-xs">
      MSME Marketplace
    </div>
    <div className="text-natural-white rounded-full pr-2 text-[10px] sm:text-xs">
      Empowering Indian producers
    </div>
  </div>
</a>
```

**Content mapping:**

| Template | MSME Marketplace |
|---|---|
| "The best design and development agency in the world." | "The smartest way to trade commodities across India." |
| "We design and build websites that drive results and help your business grow. No Calls. No BS. Just Results." | "AI-graded quality. Real-time market pricing. Multi-seller order fulfillment. Built for MSME producers and buyers across Agriculture and Textiles." |
| "Aceternity" (faded giant text) | "MSMETrade" (faded giant text) |
| "Chat with Alex" (CTA) | "Start Trading" (CTA) |
| "Aceternity UI — New components every week" (badge) | "MSME Marketplace — Empowering Indian producers" (badge) |

**Files:**
- `components/marketing/hero.tsx` — main hero component
- `components/marketing/hero-arc.tsx` — SVG arc with glow layers
- `components/marketing/hero-dots.tsx` — scattered dot field
- `components/marketing/hero-beam.tsx` — light beam / spotlight
- `components/marketing/hero-badge.tsx` — top badge pill
- `components/marketing/hero-cta-button.tsx` — animated CTA button (dot-matrix → icon)

---

### Section 2: Logo Cloud

**Template:** "Trusted by fast-growing startups" in `font-dm-mono uppercase text-sm text-muted-foreground`, followed by a flex-wrap grid of 15 logos at `h-4 md:h-6` with 3D perspective hover.

**MSME adaptation:**
- Header: "Backed by India's MSME ecosystem"
- Logos: MSME Ministry, NSIC, Agmarknet, APEDA, BIS, Textile Commissioner, KVIC, SIDBI, NABARD, NITI Aayog
- Style: Grayscale/white versions of logos, same sizing

**File:** `components/marketing/logo-cloud.tsx`

---

### Section 3: Bento Grid Features

**Template analysis (from screenshot 2):**
- Heading: "Replace your Engineering Team" — `text-4xl md:text-5xl font-semibold tracking-tight`
- Grid: `grid-cols-19` with 5 cards in asymmetric layout
  - Row 1: `col-span-6` (tall) | `col-span-7` | `col-span-6`
  - Row 2: `col-span-10` | `col-span-9`
- Each card: `bg-natural-black rounded-2xl p-4 overflow-hidden` with internal animated illustrations

**Card-by-card adaptation:**

#### Card 1 (col-span-6, tall): "AI Quality Grading"
- **Template:** Browser mockup wireframe with dots + code animation overlay
- **MSME:** Animated grading interface mockup:
  - Mini browser frame (same red/yellow/green dots, URL bar)
  - Inside: photo upload area → AI analysis progress → grade result card
  - Overlay: flowing code-like text showing attribute scores
  - CTA: "Explore Grading" button (same animated style as template's "View pricing")

#### Card 2 (col-span-7): "Real-time Price Intelligence"
- **Template:** Donut chart + notification card ("HOTFIX: update design")
- **MSME:** 
  - Donut chart → Price trend donut/line chart (use `motion` animated SVG)
  - Notification card → "Price Alert: Wheat ↑ 3.2% in Mandi Jaipur 📈"
  - Progress bars showing price movement

#### Card 3 (col-span-6, dark bg): "Pan-India Reach"
- **Template:** World map (dark bg, dot-matrix pattern) with connected avatar circles
- **MSME:**
  - India map silhouette (SVG) with dot-matrix pattern
  - Connected avatar/commodity icons at state positions
  - Same dark background treatment
  - Use Magic UI `Globe` (configure for India) or custom SVG India map

#### Card 4 (col-span-10): "Smart Order Matching"
- **Template:** Google search UI mockup with search bar + result card
- **MSME:**
  - Requirement input mockup: "Need 100 quintals Grade A wheat, UP region"
  - Matching result cards: "3 sellers matched, best price ₹2,450/qtl"
  - Progress bar for allocation progress
  - Same light-bg card style with rounded corners

#### Card 5 (col-span-9): "Seller Dashboard & Analytics"
- **Template:** Circuit-board pattern with floating orange element
- **MSME:**
  - Dashboard wireframe with mini charts (bar, line, stats)
  - Circuit-board → data flow pattern in background
  - Floating commodity icon (wheat/cotton) instead of orange element

**Files:**
- `components/marketing/features-bento.tsx` — grid container
- `components/marketing/bento-cards/grading-card.tsx`
- `components/marketing/bento-cards/pricing-card.tsx`
- `components/marketing/bento-cards/reach-card.tsx`
- `components/marketing/bento-cards/matching-card.tsx`
- `components/marketing/bento-cards/dashboard-card.tsx`

---

### Section 4: Project Showcase

**Template analysis (from screenshot 3):**
- Grid of 6 project cards in 2-column layout (large cards)
- Row 1: 60/40 split — large image card (light bg, iPad mockup) + dark card (title, description, video play icon, tags)
- Row 2: 50/50 — workspace/app screenshot + data dashboard screenshot
- Each card has rounded corners, hover effects
- "View Project →" links with category tags

**MSME adaptation — 6 showcase cards:**

| # | Template Content | MSME Content | Layout |
|---|---|---|---|
| 1 | iPad with design app | Agriculture vertical showcase: wheat grading view (generated image) | Large, light bg, left |
| 2 | "SaaS homepage refresh" + dark bg | "Textile Quality Analysis" — cotton fabric defect detection view | Smaller, dark bg, right |
| 3 | Workspace join UI (green) | Seller mobile app — listing creation screen (screenshot mockup) | 50%, left |
| 4 | Data dashboard (orange) | Price intelligence dashboard — charts and trends | 50%, right |
| 5 | (scroll to see) | Admin console — vertical configuration interface | 50%, left |
| 6 | (scroll to see) | Multi-seller order allocation in action | 50%, right |

**Tags per card:** "Agriculture", "AI Grading", "Textiles", "Price Intelligence", "Seller App", "Admin Console", "Order Matching"

**File:** `components/marketing/project-showcase.tsx`

---

### Section 5: Comparison Table

**Template analysis (from screenshot 4):**
- Light background (`#f5f5f0`) full-width section
- Heading: "Aceternity VS Traditional Service Providers" — very large `text-4xl md:text-5xl`
- 3-column table with rounded container and subtle row borders
- Column headers: [Category icon] | ✅ green checkmark + "Aceternity Labs" | ⚠️ yellow warning + "Traditional Service Providers"
- 7 rows with icons in category column (settings, process, palette, code, chat, send, shield)
- Clean, minimal, high-contrast

**MSME adaptation:**

| Category (icon) | MSME Marketplace ✅ | Traditional Commodity Trading ⚠️ |
|---|---|---|
| 📊 Quality Assurance | AI-verified grading with full audit trail | Manual inspection, no standardized records |
| 💰 Pricing | Real-time market data, grade-adjusted algorithms | Opaque, middleman-dependent pricing |
| 📦 Order Fulfillment | Multi-seller auto-allocation in one click | Single supplier or manual sourcing |
| 🌍 Market Reach | Pan-India digital marketplace | Local mandi, limited buyer pool |
| 🛡️ Trust | Reputation scoring + dispute resolution | Word of mouth, no formal recourse |
| 📱 Communication | Real-time notifications, in-app tracking | Phone calls, no status tracking |
| ⚡ Scalability | 8+ verticals via plug-in configuration | One commodity, one region |

**File:** `components/marketing/comparison-table.tsx`

---

### Section 6: Testimonials

**Component:** Aceternity `InfiniteMovingCards` or Magic UI `Marquee`
- Two rows, opposite scroll directions
- Each card: quote, avatar, name, role/company, star rating

**MSME placeholder testimonials:**
- "Finally, a platform that lets me prove the quality of my produce to buyers I'll never meet in person." — Rajesh K., Wheat Farmer, UP
- "The multi-seller allocation saved me weeks of individual sourcing for my textile order." — Priya M., Buyer, Gujarat
- "I can set my prices based on real market data instead of guessing." — Mohan S., Cotton Seller, Maharashtra
- (6-8 total placeholder testimonials)

**File:** `components/marketing/testimonials.tsx`

---

### Section 7: CTA Section

**Dark section with gradient/spotlight effect:**
- Heading: "Ready to Transform How India Trades?"
- Subtext: "Join thousands of MSMEs already trading smarter."
- Dual CTA: "Start Selling" (primary) + "Browse Catalog" (outline)
- Background: `Spotlight` or `BackgroundBeams` from Aceternity

**File:** `components/marketing/cta-section.tsx`

---

### Section 8: Stats / Numbers Section (MSME addition, not in template)

**Using Magic UI `NumberTicker`:**
- Row of animated statistics:
  - "8+" — Commodity Verticals
  - "10,000+" — MSME Sellers (target)
  - "₹50Cr+" — Monthly Trade Volume (target)
  - "95%+" — Grade Accuracy

**File:** `components/marketing/stats-section.tsx`

---

### Section 9: Footer

(Detailed in Section 3.2 above)

---

## 5. Verticals Page

Maps to template's `/work` page.

### Structure:
1. **Hero header** — "Our Commodity Verticals" + description
2. **Active verticals** (2 large cards):
   - Agriculture: hero image, key commodities, grading attributes, "Explore →"
   - Textiles: hero image, key commodities, grading attributes, "Explore →"
3. **Coming soon verticals** (6 smaller cards, grayed):
   - Basic Engineering, Food Processing, Handicrafts, Wood, Chemicals, Plastics
   - Each with icon + name + "Coming Soon" badge
4. **CTA** — "Want your vertical added? Contact us"
5. **Footer**

**Component:** Use Aceternity `WobbleCard` for the active vertical cards, shadcn `Card` for coming-soon.

**File:** `app/(marketing)/verticals/page.tsx`

---

## 6. Services Page

Maps to template's `/products` page.

### Structure:
1. **Hero header** — "Platform Services" + description
2. **3 service deep-dives** (use Aceternity `StickyScrollReveal`):
   - **AI Grading Engine:** How it works (upload → preprocess → model → confidence → verifier)
   - **Price Intelligence:** Market data sources, grade-adjusted pricing, trend analysis
   - **Smart Matching & Allocation:** Requirement posting → matching → multi-seller allocation → order
3. **How It Works** — stepped process (4 steps for sellers, 4 for buyers)
4. **CTA + Footer**

**File:** `app/(marketing)/services/page.tsx`

---

## 7. Pricing Page

Maps to template's `/pricing` page.

### Structure:
1. **Hero header** — "Simple, Transparent Access"
2. **Billing toggle** — Monthly / Annual (with Magic UI `ShimmerButton` for toggle)
3. **3 pricing cards:**

| Feature | Starter (Free) | Growth (₹999/mo) | Enterprise (Custom) |
|---|---|---|---|
| Listings | 10/month | Unlimited | Unlimited |
| AI Grading | Basic (80% threshold) | Full (configurable threshold) | Full + custom models |
| Price Intelligence | View only | View + alerts + trends | Full API access |
| Allocation | Manual matching | Auto-allocation (5/mo) | Unlimited allocation |
| Support | Community | Priority email | Dedicated + SLA |
| Verticals | 1 | 2 | All |

4. **FAQ accordion** — shadcn `Accordion`:
   - "What happens after the free tier?" 
   - "How does AI grading work?"
   - "Can I use the platform offline?"
   - "What regions are covered?"
   - "How are disputes resolved?"
   - "What verticals are supported?"
5. **CTA + Footer**

**File:** `app/(marketing)/pricing/page.tsx`

---

## 8. Blog Page

Maps to template's `/blog` page.

### Structure:
1. **Hero header** — "Market Insights & MSME Intelligence"
2. **Featured post** — large card at top
3. **Post grid** — 2-3 column grid of blog cards:
   - Thumbnail, category badge, title, excerpt, author avatar, date, read time
4. **Newsletter CTA** — email input + subscribe (Magic UI `AnimatedSubscribeButton`)
5. **Footer**

**Static blog posts (placeholder content):**
- "Understanding Agmarknet: India's Agricultural Market Data"
- "How AI Grading is Transforming Commodity Quality Assurance"
- "The Future of MSME Digital Trade in India"
- "Cotton Price Trends Q3 2024: What Sellers Need to Know"

**File:** `app/(marketing)/blog/page.tsx`

---

## 9. Authenticated Application Pages

These pages use **shadcn/ui** extensively for functional components (forms, tables, dialogs). The visual style transitions from the marketing dark theme to a clean dashboard UI.

### 9.1 Layout: Dashboard Shell

```
┌──────────────────────────────────────────────────────┐
│ [Logo] MSME Marketplace    [Search] [Bell] [Avatar▼] │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │    Main Content Area                      │
│          │                                           │
│ Dashboard│    (route-specific content)                │
│ Catalog  │                                           │
│ Orders   │                                           │
│ ...      │                                           │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```

**Component:** shadcn `Sidebar` + `NavigationMenu`

### 9.2 Key Application Components

| Component | Library | Usage |
|---|---|---|
| Data Table | shadcn | Listings, orders, disputes — sortable, filterable, paginated |
| Form + Field | shadcn | All input forms (listing creation, requirement posting) |
| Sheet/Drawer | shadcn | Mobile-friendly side panels (filters, quick-edit) |
| Command (⌘K) | shadcn | Global search across listings, orders, users |
| Dialog | shadcn | Confirmations, quick-view modals |
| Toast/Sonner | shadcn | Success/error/info notifications |
| Chart | shadcn (Recharts) | Price trends, analytics dashboards |
| Skeleton | shadcn | Loading states |
| Badge | shadcn | Status indicators (ACTIVE, PENDING, SOLD, etc.) |
| Avatar + AvatarCircles | shadcn + Magic UI | User avatars, seller groups |

### 9.3 Buyer Pages

**Catalog Browse (`/buyer/catalog`):**
- Filter sidebar: vertical, commodity, grade, price range (slider), location
- Listing cards: image, title, grade badge, price, seller reputation
- Map view toggle (Leaflet or simple region selector)
- Sort: price, grade, distance, newest

**Listing Detail (`/buyer/catalog/[id]`):**
- Image gallery (carousel)
- Grading report card (attribute scores, confidence, source)
- Price breakdown (base + grade adjustment + quantity tier)
- Seller info (reputation score, history)
- Bid/Buy actions

**Cost Estimator (`/buyer/estimate`):**
- Inputs: vertical, commodity, quantity, min grade, region
- Real-time calculation: call `/compute/pricing/estimate`
- Result: estimated total, price per unit, available supply indicator

### 9.4 Admin Pages

**Vertical Config Editor (`/admin/verticals/[id]`):**
- JSONB schema visual editor (no raw JSON for admin)
- Grading attributes: add/remove/reorder, set `gradeable_by_ml`, define ranges
- Pricing rules: grade-adjustment table, quantity tiers
- Preview mode: show how a listing would appear with these settings

**Verification Queue (`/admin/verification`):**
- Queue count, priority indicators
- Each item: listing summary, evidence preview, AI grade, confidence
- Review actions: confirm, override (with notes), reject

### 9.5 Verifier Pages

**Review Page (`/verifier/queue/[id]`):**
- Two-panel layout:
  - Left: evidence viewer (image zoom, document viewer)
  - Right: AI grading results per attribute + override form
- Each attribute row: name, AI value, AI confidence bar, override input
- Submit: "Confirm AI Grade" or "Override" with mandatory notes

---

## 10. Asset Generation Plan

Images to generate using the `generate_image` tool during implementation:

| Asset | Prompt/Description | Usage |
|---|---|---|
| MSME Marketplace Logo | "Modern minimalist logo for MSME commodity marketplace, emerald green accent, icon combining trade/growth" | Navbar, footer, favicon |
| Agriculture Hero | "Indian wheat field at golden hour, mandi market in background, professional photo" | Verticals page, showcase |
| Textiles Hero | "Indian cotton fabric rolls, vibrant colors, textile workshop, professional" | Verticals page, showcase |
| Grading UI Mockup | "Clean dashboard UI showing AI grading of wheat with confidence bars" | Bento card, showcase |
| Price Dashboard | "Dark-themed analytics dashboard with commodity price charts" | Bento card, showcase |
| Seller App Screen | "Android phone showing commodity listing creation form" | Showcase |
| Order Matching | "UI showing buyer requirement matched to multiple seller listings" | Bento card |
| India Map (SVG) | Custom SVG — create programmatically, not generated | Bento card |
| Blog thumbnails (4) | Various MSME/agriculture/textile themed images | Blog page |
| Placeholder avatars (8) | Various Indian business people portraits | Testimonials |

---

## 11. Component Dependency Graph

```
layout.tsx
├── fonts (Inter, GeistMono, DMMono)
├── globals.css (design tokens, keyframes)
├── Navbar (floating-navbar.tsx, hero-cta-button.tsx)
└── Footer

page.tsx (Home)
├── Hero
│   ├── hero-arc.tsx (SVG arc + glow)
│   ├── hero-dots.tsx (particle field)
│   ├── hero-beam.tsx (spotlight effect)
│   ├── hero-badge.tsx (pill badge)
│   └── hero-cta-button.tsx
├── LogoCloud (infinite-moving-cards.tsx OR marquee.tsx)
├── FeaturesBento (bento-grid.tsx)
│   ├── GradingCard
│   ├── PricingCard
│   ├── ReachCard (globe.tsx OR custom SVG)
│   ├── MatchingCard
│   └── DashboardCard
├── ProjectShowcase (three-d-card.tsx)
├── ComparisonTable (custom, shadcn Table base)
├── Testimonials (infinite-moving-cards.tsx)
├── StatsSection (number-ticker.tsx)
└── CTASection (spotlight.tsx)
```

---

## 12. File-by-File Implementation Order

### Phase F1: Setup (Day 1)
```
1.  web-app/package.json
2.  web-app/app/globals.css
3.  web-app/app/layout.tsx
4.  web-app/lib/utils.ts
5.  web-app/lib/constants.ts
6.  web-app/tailwind.config.ts (if needed for v4)
7.  web-app/next.config.ts
```

### Phase F2: Component Copies (Days 2-3)
```
8.  components/ui/spotlight.tsx
9.  components/ui/text-generate-effect.tsx
10. components/ui/background-beams.tsx
11. components/ui/floating-navbar.tsx
12. components/ui/infinite-moving-cards.tsx
13. components/ui/bento-grid.tsx
14. components/ui/three-d-card.tsx
15. components/ui/wobble-card.tsx
16. components/ui/animated-tooltip.tsx
17. components/ui/sticky-scroll-reveal.tsx
18. components/ui/moving-border.tsx
19. components/ui/lamp-effect.tsx
20. components/ui/tabs.tsx
21. + Magic UI via CLI
22. + shadcn/ui base via CLI
```

### Phase F3: Layout (Day 3)
```
23. components/marketing/navbar.tsx
24. components/marketing/footer.tsx
25. components/marketing/mobile-menu.tsx
```

### Phase F4: Home Page (Days 4-7)
```
26. components/marketing/hero.tsx
27. components/marketing/hero-arc.tsx
28. components/marketing/hero-dots.tsx
29. components/marketing/hero-beam.tsx
30. components/marketing/hero-badge.tsx
31. components/marketing/hero-cta-button.tsx
32. components/marketing/logo-cloud.tsx
33. components/marketing/features-bento.tsx
34. components/marketing/bento-cards/grading-card.tsx
35. components/marketing/bento-cards/pricing-card.tsx
36. components/marketing/bento-cards/reach-card.tsx
37. components/marketing/bento-cards/matching-card.tsx
38. components/marketing/bento-cards/dashboard-card.tsx
39. components/marketing/project-showcase.tsx
40. components/marketing/comparison-table.tsx
41. components/marketing/testimonials.tsx
42. components/marketing/stats-section.tsx
43. components/marketing/cta-section.tsx
44. app/page.tsx (assemble all sections)
```

### Phase F5: Sub-pages (Days 8-10)
```
45. app/(marketing)/verticals/page.tsx
46. app/(marketing)/services/page.tsx
47. app/(marketing)/pricing/page.tsx
48. app/(marketing)/blog/page.tsx
```

### Phase F6: Assets (Days 10-11)
```
49. Generate all images (see Asset Generation Plan)
50. Create SVG India map
51. Create MSME logo variants (light, dark, favicon)
```

### Phase F7: Auth + Dashboard Shell (Days 12-13)
```
52. app/(auth)/login/page.tsx
53. app/(auth)/register/page.tsx
54. components/shared/dashboard-layout.tsx
55. components/shared/dashboard-sidebar.tsx
56. components/shared/dashboard-header.tsx
```

### Phase F8: Application Pages (Days 14-20)
```
57. app/(buyer)/catalog/page.tsx
58. app/(buyer)/catalog/[id]/page.tsx
59. app/(buyer)/requirements/page.tsx
60. app/(buyer)/orders/page.tsx
61. app/(buyer)/dashboard/page.tsx
62. app/(buyer)/estimate/page.tsx
63. app/(admin)/dashboard/page.tsx
64. app/(admin)/verticals/page.tsx
65. app/(admin)/verticals/[id]/page.tsx
66. app/(admin)/verification/page.tsx
67. app/(admin)/disputes/page.tsx
68. app/(verifier)/dashboard/page.tsx
69. app/(verifier)/queue/page.tsx
70. app/(verifier)/queue/[id]/page.tsx
```

### Phase F9: Polish (Days 21-22)
```
71. Responsive testing + fixes
72. Animation timing tuning
73. Lighthouse audit
74. SEO meta tags
75. i18n setup
```

---

## 13. Responsive Strategy

| Breakpoint | Name | Layout Behavior |
|---|---|---|
| < 640px | Mobile | Single column, hamburger nav, stacked cards, full-width sections |
| 640-768px | Small tablet | 2-column grids where applicable |
| 768-1024px | Tablet | Nav links visible, 2-col bento grid, side-by-side layouts |
| 1024-1280px | Desktop | Full layout, 3-col grids, floating navbar |
| > 1280px | Large | Max-width container centered, generous padding |

**Key responsive decisions:**
- Bento grid: 1 col on mobile, 2 on tablet, full asymmetric on desktop
- Project showcase: 1 col on mobile, 2 on desktop
- Pricing cards: stacked on mobile, side-by-side on desktop
- Comparison table: horizontal scroll on mobile
- Dashboard: sidebar collapses to bottom nav on mobile (Magic UI `Dock`)

---

## 14. Animation Catalog

All animations sourced from Aceternity/Magic UI components or matching the template:

| Animation | Trigger | Duration | Easing | Component |
|---|---|---|---|---|
| Hero arc glow | Page load | 1.5s | ease-out | Custom SVG |
| Text generate (word-by-word) | Page load / viewport enter | 50ms/word | ease | TextGenerateEffect |
| Badge fade-in | Page load | 600ms | ease-out | Custom |
| CTA button dot-matrix → icon | Hover | 400ms | ease-out | Custom |
| Logo cloud 3D flip | Continuous | Per logo | ease | Custom perspective |
| Bento card illustrations | Viewport enter | 800ms stagger | spring | motion |
| Project card hover zoom | Hover | 300ms | ease | CSS transform |
| Comparison table row highlight | Hover | 200ms | ease | CSS |
| Testimonial marquee | Continuous | 40s loop | linear | InfiniteMovingCards |
| Number ticker count-up | Viewport enter | 2s | ease-out | NumberTicker |
| Navbar appear/hide | Scroll direction | 300ms | ease | FloatingNavbar |
| Page section fade-in | Viewport enter | 600ms | ease-out | motion + IntersectionObserver |
| FAQ accordion expand | Click | 300ms | ease | shadcn Accordion |
| Pricing toggle | Click | 400ms | spring | motion |

---

> [!TIP]
> **Implementation strategy:** Build the home page section-by-section from top to bottom. Get each section pixel-perfect before moving to the next. Use the browser MCP to compare against the live template at each step. This prevents compound layout drift and makes debugging much easier.
