import { tracedFetch } from "../../app/telemetry/fetch";
import { buildLocalizedPath, getCsrfMeta } from "../navigation/runtime";

export const apiFetch = tracedFetch;

export function buildAdminApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/admin/")) {
    return buildLocalizedPath(`/admin${normalized}`, `/en/admin${normalized}`);
  }
  if (normalized.startsWith("/api/")) {
    return buildLocalizedPath(normalized, `/en${normalized}`);
  }
  return buildLocalizedPath(`/admin${normalized}`, `/en/admin${normalized}`);
}

function isLoginRedirectResponse(response: Response): boolean {
  if (!response.redirected || !response.url || typeof window === "undefined") {
    return false;
  }
  try {
    const redirectedUrl = new URL(response.url, window.location.origin);
    return redirectedUrl.pathname === "/admin/login/loginView"
      || redirectedUrl.pathname === "/en/admin/login/loginView"
      || redirectedUrl.pathname === "/signin/loginView"
      || redirectedUrl.pathname === "/en/signin/loginView";
  } catch {
    return false;
  }
}

function redirectToLogin(response: Response): never {
  if (typeof window !== "undefined" && response.url) {
    window.location.replace(response.url);
  }
  throw new Error("Authentication required. Redirecting to login.");
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  if (isLoginRedirectResponse(response)) {
    redirectToLogin(response);
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  const text = await response.text();
  const compact = text.replace(/\s+/g, " ").trim();
  throw new Error(compact.startsWith("<!DOCTYPE") || compact.startsWith("<html")
    ? `Server returned HTML instead of JSON (${response.status})`
    : (compact || `Unexpected response format (${response.status})`));
}

export function buildCsrfHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extraHeaders || {}) };
  const { token, headerName } = getCsrfMeta();
  if (token) {
    headers[headerName] = token;
  }
  return headers;
}

async function fetchFallbackFrontendSession() {
  const response = await apiFetch("/api/frontend/session", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load session: ${response.status}`);
  }
  return response.json() as Promise<{ csrfToken?: string; csrfHeaderName?: string }>;
}

export async function buildResilientCsrfHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers = buildCsrfHeaders(extraHeaders);
  const { token } = getCsrfMeta();
  if (token) {
    return headers;
  }
  try {
    const session = await fetchFallbackFrontendSession();
    if (session.csrfHeaderName && session.csrfToken) {
      headers[session.csrfHeaderName] = session.csrfToken;
    }
  } catch {
    // Keep request handling deterministic. The server will still reject if no token is available.
  }
  return headers;
}
