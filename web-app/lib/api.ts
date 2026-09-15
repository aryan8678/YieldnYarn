/**
 * Thin fetch-based API client for the MSME Marketplace.
 *
 * - `DJANGO_API_URL` — main backend (auth, listings, orders, verticals, etc.)
 * - `FASTAPI_URL` — compute service (pricing estimates, ML grading calls, etc.)
 *
 * These read from `NEXT_PUBLIC_*` env vars so they can also be called from
 * client components. See `.env.local` for local development defaults.
 */

export const DJANGO_API_URL =
  process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "http://localhost:8000/api";

export const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8001/compute";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message || `Request failed with status ${res.status}`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/** Calls the Django REST backend at NEXT_PUBLIC_DJANGO_API_URL. */
export const djangoApi = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(DJANGO_API_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(DJANGO_API_URL, path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(DJANGO_API_URL, path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(DJANGO_API_URL, path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(DJANGO_API_URL, path, { ...options, method: "DELETE" }),
};

/** Calls the FastAPI compute service at NEXT_PUBLIC_FASTAPI_URL. */
export const fastApi = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(FASTAPI_URL, path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(FASTAPI_URL, path, { ...options, method: "POST", body }),
};

// --- Auth (backend-django/accounts) --------------------------------------

export type UserRole = "SELLER" | "BUYER" | "ADMIN" | "VERIFIER";

export interface UserProfile {
  display_name: string;
  avatar_url: string;
  preferred_language: string;
  location_lat: number | null;
  location_lng: number | null;
}

export interface User {
  id: number;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: Exclude<UserRole, "ADMIN">;
  phone?: string;
  display_name?: string;
}

/** POST /api/auth/login/ — returns a JWT access + refresh pair. */
export function login(credentials: LoginCredentials) {
  return djangoApi.post<AuthTokens>("/auth/login/", credentials);
}

/** POST /api/auth/register/ — creates the user; caller should call login() next. */
export function register(payload: RegisterPayload) {
  return djangoApi.post<Pick<User, "email" | "phone" | "role">>("/auth/register/", payload);
}

/** POST /api/auth/refresh/ — exchanges a refresh token for a new access token. */
export function refreshAccessToken(refresh: string) {
  return djangoApi.post<{ access: string }>("/auth/refresh/", { refresh });
}

/** GET /api/auth/me/ — requires a bearer token. */
export function getCurrentUser(token: string) {
  return djangoApi.get<User>("/auth/me/", { token });
}

/**
 * Admin user list/toggle. Note the real mount point is `/api/auth/users/`
 * (accounts app is mounted at `/api/auth/`, not `/api/accounts/` as
 * implementation_plan.md §12 assumed — there is no `/api/accounts/` prefix
 * anywhere in core/urls.py).
 */
export interface AdminUser {
  id: number;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  profile: UserProfile | null;
}

/** GET /api/auth/users/ — admin only. */
export function listUsers(token: string) {
  return djangoApi.get<Paginated<AdminUser>>("/auth/users/", { token });
}

/** PATCH /api/auth/users/{id}/ — admin only; only `is_active` is writable. */
export function setUserActive(id: number, isActive: boolean, token: string) {
  return djangoApi.patch<AdminUser>(`/auth/users/${id}/`, { is_active: isActive }, { token });
}

// --- Pagination -------------------------------------------------------------
// Every DRF list endpoint here uses PageNumberPagination (see core/settings.py
// REST_FRAMEWORK), so list responses are `{count, next, previous, results}`,
// not bare arrays.

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Config (backend-django/config) -----------------------------------------

export interface Vertical {
  id: number;
  name: string;
  slug: string;
  unit_of_measure: string;
  is_active: boolean;
  created_at: string;
}

/** GET /api/config/verticals/ */
export function listVerticals(token: string) {
  return djangoApi.get<Paginated<Vertical>>("/config/verticals/", { token });
}

/** GET /api/config/verticals/{id}/ */
export function getVertical(id: number, token: string) {
  return djangoApi.get<Vertical>(`/config/verticals/${id}/`, { token });
}

/**
 * `attributes` shape is a free-form JSONField (config/models.py:GradingSchema
 * docstring). The only keys a real consumer reads today are `name` and
 * `gradeable_by_ml` (backend-fastapi/grading/router.py:_ml_attribute_names) —
 * everything else here (type/weight/range) is admin-UI-only for now.
 */
export interface GradingAttribute {
  name: string;
  type: "numeric" | "categorical" | "boolean";
  gradeable_by_ml: boolean;
  weight: number;
  range: string;
}

export interface GradingSchema {
  id: number;
  vertical: number;
  attributes: GradingAttribute[];
  created_at: string;
  updated_at: string;
}

/** GET /api/config/verticals/{id}/grading-schema/ */
export function getGradingSchema(verticalId: number, token: string) {
  return djangoApi.get<GradingSchema>(`/config/verticals/${verticalId}/grading-schema/`, { token });
}

/** PUT /api/config/verticals/{id}/grading-schema/ (admin only) */
export function updateGradingSchema(verticalId: number, attributes: GradingAttribute[], token: string) {
  return djangoApi.put<GradingSchema>(
    `/config/verticals/${verticalId}/grading-schema/`,
    { attributes },
    { token }
  );
}

/**
 * `rules` shape is read live by backend-fastapi/pricing/service.py — unlike
 * `GradingSchema.attributes`, this one has a real consumer with an exact
 * expected shape (multipliers, not percentages). See that file's docstring.
 */
export interface PricingRuleGradeAdjustment {
  grade: string;
  multiplier: number;
}

export interface PricingRuleQuantityTier {
  min_quantity: number;
  multiplier: number;
}

export interface PricingRuleRules {
  grade_adjustment_table: PricingRuleGradeAdjustment[];
  quantity_tier_table: PricingRuleQuantityTier[];
}

export interface PricingRule {
  id: number;
  vertical: number;
  rules: PricingRuleRules;
  created_at: string;
  updated_at: string;
}

/** GET /api/config/verticals/{id}/pricing-rules/ */
export function getPricingRule(verticalId: number, token: string) {
  return djangoApi.get<PricingRule>(`/config/verticals/${verticalId}/pricing-rules/`, { token });
}

/** PUT /api/config/verticals/{id}/pricing-rules/ (admin only) */
export function updatePricingRule(verticalId: number, rules: PricingRuleRules, token: string) {
  return djangoApi.put<PricingRule>(
    `/config/verticals/${verticalId}/pricing-rules/`,
    { rules },
    { token }
  );
}

// --- Pricing (backend-django/pricing) ---------------------------------------

export type PriceSource = "AGMARKNET" | "ADMIN_ENTERED" | "CCI";

export interface PricePoint {
  id: number;
  vertical: number;
  commodity: string;
  region: string;
  price: string; // DRF serializes DecimalField as a string
  source: PriceSource;
  timestamp: string;
  raw_data: Record<string, unknown>;
}

export interface CreatePricePointPayload {
  vertical: number;
  commodity: string;
  region: string;
  price: number;
  source: PriceSource;
  timestamp: string;
  raw_data?: Record<string, unknown>;
}

/** GET /api/pricing/price-points/ — any authenticated user. */
export function listPricePoints(token: string) {
  return djangoApi.get<Paginated<PricePoint>>("/pricing/price-points/", { token });
}

/** POST /api/pricing/price-points/ — admin only (IsAdminOrReadOnly). */
export function createPricePoint(payload: CreatePricePointPayload, token: string) {
  return djangoApi.post<PricePoint>("/pricing/price-points/", payload, { token });
}
