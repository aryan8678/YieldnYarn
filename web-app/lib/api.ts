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
