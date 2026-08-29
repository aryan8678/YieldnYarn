# Project Document: MSME Multi-Vertical Commodity Marketplace

---

## 1. Problem Statement

MSME producers and sellers across fragmented commodity categories are structurally disadvantaged by price opacity (no reliable visibility into current market prices), inability to prove quality to a remote buyer without a physical inspection, and no efficient way to get a buyer's full order quantity fulfilled from a single small listing. This project addresses those three problems directly.

---

## 2. Target Verticals & the Plug-in Model

**Target verticals (MSME sectors):**

1. Agricultural produce
2. Basic engineering (goods/components)
3. Textiles
4. Food processing
5. Handicrafts
6. Wood & wood-based products
7. Chemicals
8. Plastics

**Why a plug-in model, and not one built-in logic per vertical:**

Each of these sectors grades quality on completely different attributes — for example (illustrative, not final):

| Vertical | Example grading attribute |
|---|---|
| Agricultural produce | Moisture content, size/grade standard |
| Basic engineering | Dimensional tolerance, material certification |
| Textiles | GSM, thread count, defect rate |
| Food processing | Shelf-life, hygiene/safety certification |
| Handicrafts | Craftsmanship consistency, material authenticity |
| Wood | Moisture content, grade/knot density |
| Chemicals | Purity %, hazard classification, batch certificate |
| Plastics | Polymer type/grade, melt flow index |

If grading, pricing, and matching logic were hardcoded per vertical, every one of the 8 sectors would need its own separately-built version of the same three systems. Instead, the **core logic (grading engine, price calculator, allocation/matching engine) is written once, generically**, and each vertical "plugs in" its own configuration: unit of measurement, grading schema/attributes, and price-calculation rules. Adding a 9th vertical later means writing a new config, not rewriting the engines.

This plug-in point is literally where a vertical's rules get defined/managed — see the admin configuration feature in Section 4.

---

## 3. User Roles

| Role | Description |
|---|---|
| **Seller** | Lists a commodity lot under a vertical, submits grading evidence, tracks allocation/orders |
| **Buyer** | Posts requirements, browses/filters catalog, negotiates, places orders |
| **Admin** | Configures verticals (units, grading schema, price rules), manages disputes |
| **Verifier** | Reviews low-confidence/flagged grading cases before they go live |

---

## 4. Feature List

### A. Catalog & Grading

1. **Listing creation** — seller creates a listing under a vertical: commodity/sub-category, quantity, unit (vertical-specific), specification attributes (vertical-specific), location. Must tolerate being created and queued under poor/no connectivity, syncing once available.
2. **Vertical-specific grading schema (the plug-in point)** — each vertical defines its own grading attributes and acceptable ranges as configuration.
3. **Grading evidence capture** — photo/video/document upload attached to a listing (e.g. a certificate for chemicals, a fabric sample photo for textiles).
4. **AI-assisted grading with confidence score** — a grading model estimates a quality grade against the vertical's schema from the uploaded evidence; low-confidence or unsupported attributes get flagged rather than guessed.
5. **Human verifier fallback** — verifier role reviews flagged listings and confirms/adjusts the grade before it's visible to buyers.
6. **Grade history & audit trail** — every grading decision (AI result, verifier override, timestamps) is retained — needed for dispute resolution and for a seller's grading track record over time.
7. **Catalog browsing & filtering** — buyers search/filter listings by vertical, sub-category, verified grade, location, and available quantity.

### B. Price Calculators

1. **Market price feed ingestion (per vertical)** — mechanism to bring in current reference price data relevant to each vertical's commodities. *(Source and update method: unfinalized — see Section 6.)*
2. **Base price display** — shows the current reference/market price for a commodity + region, per vertical.
3. **Grade-adjusted price calculator** — computes a suggested price for a specific listing from base market price + the listing's verified grade (premium for higher grade, discount for defects), as a configurable rule set per vertical.
4. **Quantity-based price calculator** — factors bulk quantity into the suggested price (e.g. volume-tiered pricing), also configurable per vertical.
5. **Historical price trend view** — shows recent price movement per commodity so both sides can see if price is trending up or down.
6. **Buyer-side cost estimator** — buyer enters a target quantity + minimum grade and sees an estimated total cost before placing a bid/order.
7. **Sell-now-vs-hold indicator** *(stretch)* — a lightweight trend signal suggesting whether the current price is favorable relative to recent history.

### C. Order Allocation & Matching

1. **Buyer requirement posting** — buyer specifies vertical, commodity, quantity, minimum grade, target price/budget, and region.
2. **Matching engine** — matches a buyer's requirement against available listings meeting grade, quantity, and region criteria.
3. **Order allocation across multiple sellers** — when no single listing covers the full required quantity, the system allocates the order across multiple matching listings to fulfill it in one requirement — a genuine allocation problem (multiple listings chosen to meet quantity while optimizing for price/grade), not just single listing-to-order matching.
4. **Bid/negotiation mechanism** — buyer and seller can bid/counter-offer on a listing before an order is finalized.
5. **Trust-weighted allocation** — when multiple listings equally satisfy a requirement, allocation can factor in seller reputation (see Section 4D) as a tie-breaker.
6. **Order finalization & status tracking** — generates an order record on match and tracks its state through to closed/disputed.
7. **Handoff point for delivery/payment** — once an order is finalized, it is handed off for fulfillment and payment settlement. Both are intentionally left unbuilt/unspecified at this stage.

### D. Trust, Access & Platform Administration

1. **Reputation scoring** — sellers accumulate a score from grading-accuracy history and fulfillment reliability; buyers accumulate one from payment reliability. Feeds into trust-weighted allocation (4C.5).
2. **Role-based authentication & access control** — distinct permissions for seller, buyer, admin, and verifier roles.
3. **Multilingual & accessibility layer** — interface support for regional languages and simplified/voice-assisted input, for sellers less comfortable with text-heavy interfaces.
4. **Vertical configuration console (admin)** — where a vertical's units, grading schema, and price-calculator rules are defined and edited — this is the actual plug-in mechanism from Section 2.
5. **Verification queue management** — admin/verifier view for reviewing listings flagged by low-confidence grading.
6. **Dispute handling** — workflow for flagging and resolving disputes on grade accuracy or order fulfillment, referencing the audit trail from 4A.6.

---

## 5. Directory Structure (basic, top-level only)

```
project/
├── backend/       # FastAPI service
├── web-app/       # buyer/admin web application
├── seller-app/    # Kotlin seller application
└── docs/          # project documentation
```

*(Not broken down further yet — internal structure to be defined once you start building.)*

---

## 6. Architecture (preliminary — to be researched further)

- **Backend framework:** FastAPI — confirmed
- **Database:** PostgreSQL — confirmed
- **Hosting/deployment:** not decided
- **Media/file storage:** not decided
- **External integrations** (market price data sourcing, delivery handoff, payments, notifications): not decided, not yet worked out

Everything beyond the backend framework and database choice is deliberately left open pending further research.
