"use client";

/**
 * Client-side JWT session storage.
 *
 * Tokens live in `localStorage` so they survive a refresh without an extra
 * round trip. This is a pragmatic default for the local/dev build — the
 * plan's long-term target (implementation_plan.md §10.1) is an httpOnly
 * refresh cookie issued by Django, which needs a backend change and should
 * land before this ships anywhere internet-facing.
 */

import type { AuthTokens, User } from "./api";

const TOKENS_KEY = "msme.auth.tokens";
const USER_KEY = "msme.auth.user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredTokens(): AuthTokens | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setSession(tokens: AuthTokens, user: User) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("msme-auth-change"));
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKENS_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("msme-auth-change"));
}

/** Where to send a signed-in user after login, based on role. */
export function dashboardPathForRole(role: User["role"]) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "VERIFIER":
      return "/verifier/dashboard";
    case "SELLER":
    case "BUYER":
    default:
      return "/buyer/dashboard";
  }
}
