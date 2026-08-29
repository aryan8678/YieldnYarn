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

// TODO: Replace the stubs below with real calls once the Django auth
// endpoints are finalized (see backend-django/). Wired to
// NEXT_PUBLIC_DJANGO_API_URL.
export async function login(_credentials: { email: string; password: string }) {
  // return djangoApi.post<{ access: string; refresh: string }>("/auth/login/", credentials);
  throw new Error("TODO: wire up to Django auth endpoint at NEXT_PUBLIC_DJANGO_API_URL");
}

export async function register(_payload: Record<string, unknown>) {
  // return djangoApi.post("/auth/register/", payload);
  throw new Error("TODO: wire up to Django auth endpoint at NEXT_PUBLIC_DJANGO_API_URL");
}
