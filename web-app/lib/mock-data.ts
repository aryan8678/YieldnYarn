/**
 * Placeholder data for the buyer dashboard, shaped to match the Django
 * serializers (backend-django/catalog, orders) so swapping these arrays for
 * real `djangoApi.get(...)` calls later is a like-for-like change.
 *
 * TODO: replace with real API calls once the buyer-facing endpoints are
 * exercised end-to-end (see lib/api.ts).
 */

export type Vertical = "agriculture" | "textiles";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_GRADING"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SOLD"
  | "EXPIRED";

export interface MockListing {
  id: number;
  vertical: Vertical;
  commodity_name: string;
  sub_category: string;
  quantity: number;
  unit: string;
  price_suggested: number;
  price_final: number;
  status: ListingStatus;
  grade: string;
  grade_confidence: number;
  region: string;
  seller_name: string;
  seller_reputation: number;
}

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: 101,
    vertical: "agriculture",
    commodity_name: "Wheat",
    sub_category: "Sharbati",
    quantity: 120,
    unit: "quintal",
    price_suggested: 2410,
    price_final: 2450,
    status: "ACTIVE",
    grade: "Grade A",
    grade_confidence: 0.94,
    region: "Jaipur, Rajasthan",
    seller_name: "Rajesh Kumar",
    seller_reputation: 4.7,
  },
  {
    id: 102,
    vertical: "agriculture",
    commodity_name: "Wheat",
    sub_category: "Lokwan",
    quantity: 80,
    unit: "quintal",
    price_suggested: 2360,
    price_final: 2360,
    status: "ACTIVE",
    grade: "Grade B",
    grade_confidence: 0.88,
    region: "Indore, Madhya Pradesh",
    seller_name: "Mohan Singh",
    seller_reputation: 4.3,
  },
  {
    id: 103,
    vertical: "textiles",
    commodity_name: "Cotton Fabric",
    sub_category: "Grey cloth",
    quantity: 500,
    unit: "meter",
    price_suggested: 68,
    price_final: 70,
    status: "ACTIVE",
    grade: "Grade A",
    grade_confidence: 0.91,
    region: "Surat, Gujarat",
    seller_name: "Priya Textiles",
    seller_reputation: 4.9,
  },
  {
    id: 104,
    vertical: "textiles",
    commodity_name: "Cotton Yarn",
    sub_category: "30s combed",
    quantity: 2000,
    unit: "kg",
    price_suggested: 245,
    price_final: 245,
    status: "PENDING_VERIFICATION",
    grade: "Ungraded",
    grade_confidence: 0.62,
    region: "Coimbatore, Tamil Nadu",
    seller_name: "Anand Spinning Mills",
    seller_reputation: 4.5,
  },
  {
    id: 105,
    vertical: "agriculture",
    commodity_name: "Chana (Chickpea)",
    sub_category: "Desi",
    quantity: 60,
    unit: "quintal",
    price_suggested: 5150,
    price_final: 5200,
    status: "ACTIVE",
    grade: "Grade A",
    grade_confidence: 0.96,
    region: "Bikaner, Rajasthan",
    seller_name: "Suresh Pulses",
    seller_reputation: 4.6,
  },
  {
    id: 106,
    vertical: "textiles",
    commodity_name: "Dyed Cotton",
    sub_category: "Indigo",
    quantity: 300,
    unit: "meter",
    price_suggested: 92,
    price_final: 95,
    status: "ACTIVE",
    grade: "Grade B",
    grade_confidence: 0.83,
    region: "Ahmedabad, Gujarat",
    seller_name: "Gujarat Weaves",
    seller_reputation: 4.2,
  },
];

export type RequirementStatus = "OPEN" | "MATCHED" | "FULFILLED" | "CANCELLED";

export interface MockRequirement {
  id: number;
  vertical: Vertical;
  commodity: string;
  quantity: number;
  unit: string;
  min_grade: string;
  max_price: number;
  region: string;
  status: RequirementStatus;
  created_at: string;
}

export const MOCK_REQUIREMENTS: MockRequirement[] = [
  {
    id: 51,
    vertical: "agriculture",
    commodity: "Wheat",
    quantity: 100,
    unit: "quintal",
    min_grade: "Grade A",
    max_price: 2500,
    region: "Uttar Pradesh",
    status: "MATCHED",
    created_at: "2026-08-12",
  },
  {
    id: 52,
    vertical: "textiles",
    commodity: "Cotton Fabric",
    quantity: 800,
    unit: "meter",
    min_grade: "Grade B",
    max_price: 75,
    region: "Gujarat",
    status: "OPEN",
    created_at: "2026-08-20",
  },
  {
    id: 53,
    vertical: "agriculture",
    commodity: "Chana",
    quantity: 40,
    unit: "quintal",
    min_grade: "Grade A",
    max_price: 5300,
    region: "Rajasthan",
    status: "FULFILLED",
    created_at: "2026-07-28",
  },
];

export type OrderStatus = "PENDING" | "CONFIRMED" | "FULFILLED" | "DISPUTED" | "CANCELLED";

export interface MockOrderAllocation {
  listing_id: number;
  seller_name: string;
  commodity_name: string;
  allocated_quantity: number;
  unit: string;
  unit_price: number;
}

export interface MockOrder {
  id: number;
  requirement_id: number | null;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  allocations: MockOrderAllocation[];
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 301,
    requirement_id: 51,
    status: "CONFIRMED",
    total_price: 244500,
    created_at: "2026-08-14",
    allocations: [
      {
        listing_id: 101,
        seller_name: "Rajesh Kumar",
        commodity_name: "Wheat",
        allocated_quantity: 60,
        unit: "quintal",
        unit_price: 2450,
      },
      {
        listing_id: 102,
        seller_name: "Mohan Singh",
        commodity_name: "Wheat",
        allocated_quantity: 40,
        unit: "quintal",
        unit_price: 2360,
      },
    ],
  },
  {
    id: 302,
    requirement_id: 53,
    status: "FULFILLED",
    total_price: 208000,
    created_at: "2026-07-30",
    allocations: [
      {
        listing_id: 105,
        seller_name: "Suresh Pulses",
        commodity_name: "Chana",
        allocated_quantity: 40,
        unit: "quintal",
        unit_price: 5200,
      },
    ],
  },
  {
    id: 303,
    requirement_id: null,
    status: "PENDING",
    total_price: 35000,
    created_at: "2026-08-25",
    allocations: [
      {
        listing_id: 103,
        seller_name: "Priya Textiles",
        commodity_name: "Cotton Fabric",
        allocated_quantity: 500,
        unit: "meter",
        unit_price: 70,
      },
    ],
  },
];

export type NotificationType =
  | "GRADING_COMPLETE"
  | "ORDER_MATCHED"
  | "BID_RECEIVED"
  | "DISPUTE_UPDATE"
  | "SYSTEM";

export interface MockNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 1,
    type: "ORDER_MATCHED",
    title: "Requirement matched",
    message: "Your wheat requirement (#51) was matched across 2 sellers.",
    is_read: false,
    created_at: "2026-08-14T09:12:00Z",
  },
  {
    id: 2,
    type: "SYSTEM",
    title: "Price alert",
    message: "Wheat prices in Jaipur mandi are up 3.2% this week.",
    is_read: false,
    created_at: "2026-08-27T07:00:00Z",
  },
  {
    id: 3,
    type: "ORDER_MATCHED",
    title: "Order fulfilled",
    message: "Order #302 (Chana, 40 quintal) has been marked fulfilled.",
    is_read: true,
    created_at: "2026-07-30T14:45:00Z",
  },
];

// ---------------------------------------------------------------------------
// Admin & Verifier mock data
//
// Same rules as above: shaped to match the Django serializers (backend-django/
// config, verification) so this is a like-for-like swap once those endpoints
// are exercised from the frontend.
// ---------------------------------------------------------------------------

export interface MockPlatformStats {
  total_listings: number;
  total_orders: number;
  total_users: number;
  revenue: number;
  revenue_delta_pct: number;
}

export const MOCK_PLATFORM_STATS: MockPlatformStats = {
  total_listings: 186,
  total_orders: 94,
  total_users: 312,
  revenue: 18_450_000,
  revenue_delta_pct: 12.4,
};

export interface MockGradingAttribute {
  id: string;
  name: string;
  type: "numeric" | "categorical" | "boolean";
  gradeable_by_ml: boolean;
  weight: number;
  range: string;
}

export interface MockGradeAdjustment {
  grade: string;
  adjustment_pct: number;
}

export interface MockQuantityTier {
  min_qty: number;
  discount_pct: number;
}

export interface MockVerticalConfig {
  id: number;
  key: Vertical;
  name: string;
  description: string;
  is_active: boolean;
  grading_attributes: MockGradingAttribute[];
  grade_adjustments: MockGradeAdjustment[];
  quantity_tiers: MockQuantityTier[];
}

export const MOCK_VERTICAL_CONFIGS: MockVerticalConfig[] = [
  {
    id: 1,
    key: "agriculture",
    name: "Agriculture",
    description:
      "Grains and pulses, graded by moisture, purity, and foreign matter.",
    is_active: true,
    grading_attributes: [
      { id: "moisture", name: "Moisture content", type: "numeric", gradeable_by_ml: true, weight: 0.35, range: "0–20%" },
      { id: "purity", name: "Purity", type: "numeric", gradeable_by_ml: true, weight: 0.35, range: "0–100%" },
      { id: "foreign_matter", name: "Foreign matter", type: "numeric", gradeable_by_ml: true, weight: 0.2, range: "0–10%" },
      { id: "color", name: "Color uniformity", type: "categorical", gradeable_by_ml: false, weight: 0.1, range: "A / B / C" },
    ],
    grade_adjustments: [
      { grade: "Grade A", adjustment_pct: 4 },
      { grade: "Grade B", adjustment_pct: 0 },
      { grade: "Grade C", adjustment_pct: -6 },
    ],
    quantity_tiers: [
      { min_qty: 50, discount_pct: 1.5 },
      { min_qty: 200, discount_pct: 3 },
      { min_qty: 500, discount_pct: 5 },
    ],
  },
  {
    id: 2,
    key: "textiles",
    name: "Textiles",
    description:
      "Fabric and yarn, graded by weave density, tensile strength, and colorfastness.",
    is_active: true,
    grading_attributes: [
      { id: "weave_density", name: "Weave density", type: "numeric", gradeable_by_ml: true, weight: 0.3, range: "threads/in" },
      { id: "tensile_strength", name: "Tensile strength", type: "numeric", gradeable_by_ml: true, weight: 0.3, range: "N" },
      { id: "colorfastness", name: "Colorfastness", type: "numeric", gradeable_by_ml: false, weight: 0.25, range: "1–5" },
      { id: "defect_rate", name: "Defect rate", type: "numeric", gradeable_by_ml: true, weight: 0.15, range: "0–5%" },
    ],
    grade_adjustments: [
      { grade: "Grade A", adjustment_pct: 6 },
      { grade: "Grade B", adjustment_pct: 0 },
      { grade: "Grade C", adjustment_pct: -8 },
    ],
    quantity_tiers: [
      { min_qty: 300, discount_pct: 2 },
      { min_qty: 1000, discount_pct: 4 },
    ],
  },
];

export type PlatformUserRole = "SELLER" | "BUYER" | "ADMIN" | "VERIFIER";

export interface MockUser {
  id: number;
  email: string;
  display_name: string;
  role: PlatformUserRole;
  is_active: boolean;
  created_at: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 1, email: "rajesh.kumar@example.com", display_name: "Rajesh Kumar", role: "SELLER", is_active: true, created_at: "2026-02-11" },
  { id: 2, email: "priya.textiles@example.com", display_name: "Priya Textiles", role: "SELLER", is_active: true, created_at: "2026-03-02" },
  { id: 3, email: "anita.rao@example.com", display_name: "Anita Rao", role: "BUYER", is_active: true, created_at: "2026-04-18" },
  { id: 4, email: "vikram.singh@example.com", display_name: "Vikram Singh", role: "BUYER", is_active: true, created_at: "2026-05-06" },
  { id: 5, email: "meena.verifier@example.com", display_name: "Meena Nair", role: "VERIFIER", is_active: true, created_at: "2026-01-20" },
  { id: 6, email: "arjun.verifier@example.com", display_name: "Arjun Das", role: "VERIFIER", is_active: true, created_at: "2026-01-22" },
  { id: 7, email: "sunil.mills@example.com", display_name: "Sunil Mills", role: "SELLER", is_active: false, created_at: "2026-02-28" },
  { id: 8, email: "admin@msmemarket.in", display_name: "Platform Admin", role: "ADMIN", is_active: true, created_at: "2025-12-01" },
];

export type VerificationStatus = "PENDING" | "CONFIRMED" | "OVERRIDDEN" | "REJECTED";
export type VerificationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface MockAttributeScore {
  attribute: string;
  ai_value: string;
  ai_confidence: number;
}

export interface MockVerificationItem {
  id: number;
  listing_id: number;
  commodity_name: string;
  vertical: Vertical;
  seller_name: string;
  ai_grade: string;
  ai_confidence: number;
  priority: VerificationPriority;
  status: VerificationStatus;
  evidence_image_count: number;
  flagged_reason: string;
  attribute_scores: MockAttributeScore[];
  created_at: string;
}

export const MOCK_VERIFICATION_QUEUE: MockVerificationItem[] = [
  {
    id: 901,
    listing_id: 104,
    commodity_name: "Cotton Yarn",
    vertical: "textiles",
    seller_name: "Anand Spinning Mills",
    ai_grade: "Grade B",
    ai_confidence: 0.62,
    priority: "HIGH",
    status: "PENDING",
    evidence_image_count: 4,
    flagged_reason: "Low model confidence (<70%) on colorfastness",
    attribute_scores: [
      { attribute: "Weave density", ai_value: "142 threads/in", ai_confidence: 0.81 },
      { attribute: "Tensile strength", ai_value: "38 N", ai_confidence: 0.77 },
      { attribute: "Colorfastness", ai_value: "3 / 5", ai_confidence: 0.52 },
      { attribute: "Defect rate", ai_value: "2.1%", ai_confidence: 0.69 },
    ],
    created_at: "2026-08-27T10:15:00Z",
  },
  {
    id: 902,
    listing_id: 201,
    commodity_name: "Basmati Rice",
    vertical: "agriculture",
    seller_name: "Harpreet Grains",
    ai_grade: "Grade A",
    ai_confidence: 0.58,
    priority: "HIGH",
    status: "PENDING",
    evidence_image_count: 3,
    flagged_reason: "Purity score borderline between Grade A / B thresholds",
    attribute_scores: [
      { attribute: "Moisture content", ai_value: "12.4%", ai_confidence: 0.9 },
      { attribute: "Purity", ai_value: "94.1%", ai_confidence: 0.55 },
      { attribute: "Foreign matter", ai_value: "1.8%", ai_confidence: 0.88 },
      { attribute: "Color uniformity", ai_value: "A", ai_confidence: 0.71 },
    ],
    created_at: "2026-08-28T06:40:00Z",
  },
  {
    id: 903,
    listing_id: 202,
    commodity_name: "Dyed Polyester",
    vertical: "textiles",
    seller_name: "Gujarat Weaves",
    ai_grade: "Grade C",
    ai_confidence: 0.71,
    priority: "MEDIUM",
    status: "PENDING",
    evidence_image_count: 5,
    flagged_reason: "Defect rate near policy threshold for auto-reject",
    attribute_scores: [
      { attribute: "Weave density", ai_value: "108 threads/in", ai_confidence: 0.84 },
      { attribute: "Tensile strength", ai_value: "29 N", ai_confidence: 0.79 },
      { attribute: "Colorfastness", ai_value: "2 / 5", ai_confidence: 0.66 },
      { attribute: "Defect rate", ai_value: "4.6%", ai_confidence: 0.73 },
    ],
    created_at: "2026-08-28T11:05:00Z",
  },
  {
    id: 904,
    listing_id: 203,
    commodity_name: "Chana (Chickpea)",
    vertical: "agriculture",
    seller_name: "Suresh Pulses",
    ai_grade: "Grade B",
    ai_confidence: 0.9,
    priority: "LOW",
    status: "CONFIRMED",
    evidence_image_count: 2,
    flagged_reason: "Routine spot-check (5% sample)",
    attribute_scores: [
      { attribute: "Moisture content", ai_value: "10.1%", ai_confidence: 0.93 },
      { attribute: "Purity", ai_value: "91.5%", ai_confidence: 0.9 },
      { attribute: "Foreign matter", ai_value: "2.3%", ai_confidence: 0.89 },
      { attribute: "Color uniformity", ai_value: "B", ai_confidence: 0.86 },
    ],
    created_at: "2026-08-25T09:20:00Z",
  },
];

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export interface MockDispute {
  id: number;
  order_id: number;
  raised_by: string;
  reason: string;
  status: DisputeStatus;
  created_at: string;
}

export const MOCK_DISPUTES: MockDispute[] = [
  { id: 51, order_id: 303, raised_by: "Anita Rao", reason: "Delivered quantity 8% short of order.", status: "UNDER_REVIEW", created_at: "2026-08-26" },
  { id: 52, order_id: 301, raised_by: "Vikram Singh", reason: "Grade on arrival did not match listing grade.", status: "OPEN", created_at: "2026-08-27" },
  { id: 53, order_id: 302, raised_by: "Suresh Pulses", reason: "Buyer delayed payment past agreed terms.", status: "RESOLVED", created_at: "2026-08-05" },
  { id: 54, order_id: 299, raised_by: "Mohan Singh", reason: "Buyer requested cancellation after dispatch.", status: "REJECTED", created_at: "2026-07-18" },
];

export type PriceSource = "AGMARKNET" | "ADMIN_ENTERED" | "CCI";

export interface MockPriceEntry {
  id: number;
  vertical: Vertical;
  commodity: string;
  region: string;
  price: number;
  unit: string;
  source: PriceSource;
  timestamp: string;
}

export const MOCK_PRICE_ENTRIES: MockPriceEntry[] = [
  { id: 1, vertical: "agriculture", commodity: "Wheat", region: "Jaipur, Rajasthan", price: 2410, unit: "quintal", source: "AGMARKNET", timestamp: "2026-08-29T05:00:00Z" },
  { id: 2, vertical: "agriculture", commodity: "Wheat", region: "Indore, Madhya Pradesh", price: 2360, unit: "quintal", source: "AGMARKNET", timestamp: "2026-08-29T05:00:00Z" },
  { id: 3, vertical: "agriculture", commodity: "Chana (Chickpea)", region: "Bikaner, Rajasthan", price: 5150, unit: "quintal", source: "AGMARKNET", timestamp: "2026-08-29T05:00:00Z" },
  { id: 4, vertical: "textiles", commodity: "Cotton Fabric", region: "Surat, Gujarat", price: 68, unit: "meter", source: "ADMIN_ENTERED", timestamp: "2026-08-27T09:30:00Z" },
  { id: 5, vertical: "textiles", commodity: "Cotton Yarn", region: "Coimbatore, Tamil Nadu", price: 245, unit: "kg", source: "ADMIN_ENTERED", timestamp: "2026-08-24T12:00:00Z" },
  { id: 6, vertical: "textiles", commodity: "Dyed Cotton", region: "Ahmedabad, Gujarat", price: 92, unit: "meter", source: "CCI", timestamp: "2026-08-20T00:00:00Z" },
];

/** 30-day price trend, most recent last. */
export function mockPriceTrend(basePrice: number) {
  const points: { date: string; price: number }[] = [];
  let price = basePrice * 0.94;
  const start = new Date("2026-07-31T00:00:00Z");
  for (let i = 0; i < 30; i++) {
    // Deterministic pseudo-variation so the chart is stable across renders.
    const wave = Math.sin(i / 4) * basePrice * 0.015;
    price += wave + basePrice * 0.002;
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    points.push({
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      price: Math.round(price),
    });
  }
  return points;
}
