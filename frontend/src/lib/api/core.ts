import { tracedFetch } from "../../platform/telemetry/fetch";
import { buildLocalizedPath, getCsrfMeta } from "../navigation/runtime";
import { SESSION_STORAGE_CACHE_PREFIX } from "./pageCache";

export const apiFetch = tracedFetch;
type ApiRequestInit = RequestInit & Record<string, unknown>;
type QueryParamPrimitive = string | number | boolean | null | undefined;
type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[];

export function buildPublicApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return buildLocalizedPath(normalized, `/en${normalized}`);
}

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

export function buildQueryString<T extends object>(
  params?: T
): string {
  if (!params) {
    return "";
  }
  const search = new URLSearchParams();
  Object.entries(params as Record<string, QueryParamValue>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") {
          return;
        }
        search.append(key, String(item));
      });
      return;
    }
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildQueryParams<T extends object>(
  params?: T
): string {
  return buildQueryString(params).replace(/^\?/, "");
}

export function buildFormUrlEncoded<T extends object>(
  payload?: T
): URLSearchParams {
  const search = new URLSearchParams();
  if (!payload) {
    return search;
  }
  Object.entries(payload as Record<string, QueryParamValue>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return;
        }
        search.append(key, String(item));
      });
      return;
    }
    if (value === undefined || value === null) {
      return;
    }
    search.set(key, String(value));
  });
  return search;
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

export function buildJsonHeaders(session: { csrfHeaderName?: string; csrfToken?: string }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  return headers;
}

export function invalidateAdminPageCaches() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const keysToDelete: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key) {
        continue;
      }
      if (
        key.startsWith(SESSION_STORAGE_CACHE_PREFIX) &&
        key !== "carbonet:frontend-session" &&
        key !== "carbonet:admin-menu-tree"
      ) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Ignore cache eviction failures.
  }
}

export async function fetchJson<T>(url: string, init?: ApiRequestInit): Promise<T> {
  const { body } = await fetchJsonWithResponse<T>(url, init);
  return body;
}

export async function fetchJsonWithResponse<T>(
  url: string,
  init?: ApiRequestInit
): Promise<{ response: Response; body: T }> {
  const response = await apiFetch(url, {
    credentials: "include",
    ...(init || {})
  });
  const body = await readJsonResponse<T>(response);
  return { response, body };
}

export async function fetchText(url: string, init?: ApiRequestInit): Promise<string> {
  const { body } = await fetchTextWithResponse(url, init);
  return body;
}

export async function fetchTextWithResponse(
  url: string,
  init?: ApiRequestInit
): Promise<{ response: Response; body: string }> {
  const response = await apiFetch(url, {
    credentials: "include",
    ...(init || {})
  });
  if (isLoginRedirectResponse(response)) {
    redirectToLogin(response);
  }
  const body = await response.text();
  return { response, body };
}

export async function fetchPageJson<T>(
  url: string,
  options?: {
    init?: ApiRequestInit;
    fallbackMessage?: string;
    resolveError?: (body: T, status: number) => string;
  }
): Promise<T> {
  const response = await apiFetch(url, {
    credentials: "include",
    ...(options?.init || {})
  });
  const body = await readJsonResponse<T>(response);
  if (!response.ok) {
    throw new Error(
      options?.resolveError?.(body, response.status)
        || `${options?.fallbackMessage || "Failed to load page"}: ${response.status}`
    );
  }
  return body;
}

export async function fetchLocalizedPageJson<T>(
  koPath: string,
  enPath: string,
  options?: {
    query?: string;
    init?: ApiRequestInit;
    fallbackMessage?: string;
    resolveError?: (body: T, status: number) => string;
  }
): Promise<T> {
  const query = options?.query ? `${options.query}` : "";
  return fetchPageJson<T>(
    buildLocalizedPath(
      `${koPath}${query ? `?${query}` : ""}`,
      `${enPath}${query ? `?${query}` : ""}`
    ),
    {
      init: options?.init,
      fallbackMessage: options?.fallbackMessage,
      resolveError: options?.resolveError
    }
  );
}

export async function fetchValidatedJson<T>(
  url: string,
  options?: {
    init?: ApiRequestInit;
    fallbackMessage?: string;
    resolveError?: (body: T, status: number) => string;
    validate?: (body: T) => boolean;
  }
): Promise<T> {
  const body = await fetchPageJson<T>(url, {
    init: options?.init,
    fallbackMessage: options?.fallbackMessage,
    resolveError: options?.resolveError
  });
  if (options?.validate && !options.validate(body)) {
    throw new Error(
      options.resolveError?.(body, 200)
        || options.fallbackMessage
        || "Validation failed"
    );
  }
  return body;
}

export async function postJson<T>(url: string, payload: unknown, init?: RequestInit): Promise<T> {
  const { body } = await postJsonWithResponse<T>(url, payload, init);
  return body;
}

export async function postJsonWithResponse<T>(
  url: string,
  payload: unknown,
  init?: RequestInit
): Promise<{ response: Response; body: T }> {
  const response = await apiFetch(url, {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined)
    }),
    body: JSON.stringify(payload),
    ...init
  });
  const body = await readJsonResponse<T>(response);
  return { response, body };
}

export async function postAdminJson<T>(path: string, payload: unknown, init?: RequestInit): Promise<T> {
  return postJson<T>(buildAdminApiPath(path), payload, {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers as Record<string, string> | undefined)
    },
    ...init
  });
}

export async function postAdminValidatedJson<T extends Record<string, unknown>>(
  path: string,
  payload: unknown,
  fallbackMessage: string,
  init?: RequestInit
): Promise<T> {
  const body = await postAdminJson<T>(path, payload, init);
  if (body.success === false) {
    throw new Error(String(body.message || fallbackMessage));
  }
  return body;
}

export async function postValidatedJson<T extends Record<string, unknown>>(
  url: string,
  payload: unknown,
  options: {
    init?: RequestInit;
    fallbackMessage: string;
    resolveError?: (body: T, status: number) => string;
    validate?: (body: T) => boolean;
  }
): Promise<T> {
  const { response, body } = await postJsonWithResponse<T>(url, payload, options.init);
  if (!response.ok) {
    throw new Error(
      options.resolveError?.(body, response.status)
        || options.fallbackMessage
    );
  }
  if (options.validate && !options.validate(body)) {
    throw new Error(
      options.resolveError?.(body, 200)
        || options.fallbackMessage
    );
  }
  return body;
}

export async function postLocalizedJson<T>(
  koPath: string,
  enPath: string,
  payload: unknown,
  init?: RequestInit
): Promise<T> {
  return postJson<T>(buildLocalizedPath(koPath, enPath), payload, {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers as Record<string, string> | undefined)
    },
    ...init
  });
}

export async function postLocalizedValidatedJson<T extends Record<string, unknown>>(
  koPath: string,
  enPath: string,
  payload: unknown,
  fallbackMessage: string,
  init?: RequestInit
): Promise<T> {
  const body = await postLocalizedJson<T>(koPath, enPath, payload, init);
  if (body.success === false) {
    throw new Error(String(body.message || fallbackMessage));
  }
  return body;
}

export async function postLocalizedAction<T>(
  koPath: string,
  enPath: string,
  init?: RequestInit
): Promise<T> {
  const response = await apiFetch(buildLocalizedPath(koPath, enPath), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers as Record<string, string> | undefined)
    }),
    ...init
  });
  return readJsonResponse<T>(response);
}

export async function postLocalizedValidatedAction<T extends Record<string, unknown>>(
  koPath: string,
  enPath: string,
  fallbackMessage: string,
  init?: RequestInit
): Promise<T> {
  const body = await postLocalizedAction<T>(koPath, enPath, init);
  if (body.success === false) {
    throw new Error(String(body.message || fallbackMessage));
  }
  return body;
}

export async function postLocalizedFormUrlEncoded<T>(
  koPath: string,
  enPath: string,
  payload: URLSearchParams,
  init?: RequestInit
): Promise<T> {
  return postFormUrlEncoded<T>(buildLocalizedPath(koPath, enPath), payload, init);
}

export async function postLocalizedValidatedFormUrlEncoded<T extends Record<string, unknown>>(
  koPath: string,
  enPath: string,
  payload: URLSearchParams,
  fallbackMessage: string,
  init?: RequestInit
): Promise<T> {
  const body = await postLocalizedFormUrlEncoded<T>(koPath, enPath, payload, init);
  if (body.success === false) {
    throw new Error(String(body.message || fallbackMessage));
  }
  return body;
}

export async function postFormUrlEncoded<T>(
  url: string,
  payload: URLSearchParams,
  init?: RequestInit
): Promise<T> {
  const { body } = await postFormUrlEncodedWithResponse<T>(url, payload, init);
  return body;
}

export async function postFormUrlEncodedWithResponse<T>(
  url: string,
  payload: URLSearchParams,
  init?: RequestInit
): Promise<{ response: Response; body: T }> {
  const response = await apiFetch(url, {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers as Record<string, string> | undefined)
    }),
    body: payload.toString(),
    ...init
  });
  const body = await readJsonResponse<T>(response);
  return { response, body };
}

export async function postFormData<T>(
  url: string,
  payload: FormData,
  init?: RequestInit
): Promise<T> {
  const { body } = await postFormDataWithResponse<T>(url, payload, init);
  return body;
}

export async function postFormDataWithResponse<T>(
  url: string,
  payload: FormData,
  init?: RequestInit
): Promise<{ response: Response; body: T }> {
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest",
    ...(init?.headers as Record<string, string> | undefined)
  });
  delete headers["Content-Type"];
  const response = await apiFetch(url, {
    method: "POST",
    credentials: "include",
    headers,
    body: payload,
    ...init
  });
  const body = await readJsonResponse<T>(response);
  return { response, body };
}

export async function submitFormUrlEncoded(
  url: string,
  payload: URLSearchParams,
  init?: RequestInit
): Promise<Response> {
  const response = await apiFetch(url, {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers as Record<string, string> | undefined)
    }),
    body: payload.toString(),
    ...init
  });

  if (isLoginRedirectResponse(response)) {
    redirectToLogin(response);
  }
  return response;
}
