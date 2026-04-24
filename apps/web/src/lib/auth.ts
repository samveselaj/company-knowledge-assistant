import type { AuthResponse, AuthUser } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_STORAGE = "company-knowledge-access-token";
const USER_STORAGE = "company-knowledge-auth-user";
export const AUTH_CHANGED_EVENT = "company-knowledge-auth-changed";

function dispatchAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json();
  }

  let message = "Request failed";
  try {
    const data = await res.json();
    message = data.detail || message;
  } catch {
    message = await res.text();
  }
  throw new Error(message);
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(TOKEN_STORAGE) || "";
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_STORAGE);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(auth: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE, auth.access_token);
  window.localStorage.setItem(USER_STORAGE, JSON.stringify(auth.user));
  dispatchAuthChanged();
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE);
  window.localStorage.removeItem(USER_STORAGE);
  dispatchAuthChanged();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const auth = await parseResponse<AuthResponse>(res);
  setAuthSession(auth);
  return auth;
}

export async function register(email: string, password: string, role = "user") {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const auth = await parseResponse<AuthResponse>(res);
  setAuthSession(auth);
  return auth;
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    clearAuthSession();
    return null;
  }

  return parseResponse<AuthUser>(res);
}
