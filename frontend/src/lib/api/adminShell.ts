import { buildLocalizedPath } from "../navigation/runtime";
import { buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";
import {
  readSessionStorageCache,
  removeSessionStorageCache,
  SESSION_STORAGE_CACHE_PREFIX,
  writeSessionStorageCache
} from "./pageCache";
import type {
  AdminMenuTreePayload,
  AdminSessionSimulationPayload,
  FrontendSession
} from "./adminShellTypes";

const FRONTEND_SESSION_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}frontend-session`;
const ADMIN_MENU_TREE_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}admin-menu-tree`;
const ADMIN_MENU_TREE_REFRESH_EVENT = "carbonet:admin-menu-tree:refresh";
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000;

let frontendSessionCache: FrontendSession | null = null;
let frontendSessionPromise: Promise<FrontendSession> | null = null;
let adminMenuTreeCache: AdminMenuTreePayload | null = null;
let adminMenuTreePromise: Promise<AdminMenuTreePayload> | null = null;

function readBootstrap<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  const store = window.__CARBONET_REACT_BOOTSTRAP__ as Record<string, unknown> | undefined;
  const payload = store?.[key] as T | undefined;
  return payload ?? null;
}

export function getAdminMenuTreeRefreshEventName() {
  return ADMIN_MENU_TREE_REFRESH_EVENT;
}

export function invalidateFrontendSessionCache() {
  frontendSessionCache = null;
  frontendSessionPromise = null;
  adminMenuTreeCache = null;
  adminMenuTreePromise = null;
  removeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY);
  removeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY);
}

export function readAdminMenuTreeSnapshot(): AdminMenuTreePayload | null {
  const bootstrappedMenuTree = readBootstrap<AdminMenuTreePayload>("adminMenuTree");
  if (bootstrappedMenuTree) {
    adminMenuTreeCache = bootstrappedMenuTree;
    writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, bootstrappedMenuTree, SESSION_CACHE_TTL_MS);
    return bootstrappedMenuTree;
  }
  const storedMenuTree = readSessionStorageCache<AdminMenuTreePayload>(ADMIN_MENU_TREE_STORAGE_KEY);
  if (storedMenuTree) {
    adminMenuTreeCache = storedMenuTree;
    return storedMenuTree;
  }
  return adminMenuTreeCache;
}

export function readFrontendSessionSnapshot(): FrontendSession | null {
  const bootstrappedSession = readBootstrap<FrontendSession>("frontendSession");
  if (bootstrappedSession) {
    frontendSessionCache = bootstrappedSession;
    writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, bootstrappedSession, SESSION_CACHE_TTL_MS);
    return bootstrappedSession;
  }
  const storedSession = readSessionStorageCache<FrontendSession>(FRONTEND_SESSION_STORAGE_KEY);
  if (storedSession) {
    frontendSessionCache = storedSession;
    return storedSession;
  }
  return frontendSessionCache;
}

export function refreshAdminMenuTree() {
  invalidateFrontendSessionCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_MENU_TREE_REFRESH_EVENT));
  }
}

export async function fetchFrontendSession(): Promise<FrontendSession> {
  const bootstrappedSession = readBootstrap<FrontendSession>("frontendSession");
  if (bootstrappedSession) {
    frontendSessionCache = bootstrappedSession;
    writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, bootstrappedSession, SESSION_CACHE_TTL_MS);
    return bootstrappedSession;
  }
  const storedSession = readSessionStorageCache<FrontendSession>(FRONTEND_SESSION_STORAGE_KEY);
  if (storedSession) {
    frontendSessionCache = storedSession;
  }
  if (frontendSessionCache) {
    return frontendSessionCache;
  }
  if (!frontendSessionPromise) {
    frontendSessionPromise = fetch("/api/frontend/session", {
      credentials: "include"
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.status}`);
      }
      const session = await response.json() as FrontendSession;
      frontendSessionCache = session;
      writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, session, SESSION_CACHE_TTL_MS);
      return session;
    }).finally(() => {
      frontendSessionPromise = null;
    });
  }
  if (!frontendSessionPromise) {
    throw new Error("Frontend session promise was not initialized");
  }
  return frontendSessionPromise;
}

export async function fetchAdminSessionSimulator(insttId?: string): Promise<AdminSessionSimulationPayload> {
  const url = new URL(buildAdminApiPath("/api/admin/dev/session-simulator"), window.location.origin);
  if (insttId) {
    url.searchParams.set("insttId", insttId);
  }
  const response = await fetch(url.toString(), {
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

export async function applyAdminSessionSimulator(
  _session: FrontendSession,
  payload: { insttId: string; emplyrId: string; authorCode: string; }
): Promise<AdminSessionSimulationPayload> {
  const headers = await buildResilientCsrfHeaders({
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  });
  const response = await fetch(buildAdminApiPath("/api/admin/dev/session-simulator"), {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload)
  });
  invalidateFrontendSessionCache();
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

export async function resetAdminSessionSimulator(session: FrontendSession): Promise<AdminSessionSimulationPayload> {
  void session;
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  const response = await fetch(buildAdminApiPath("/api/admin/dev/session-simulator"), {
    method: "DELETE",
    credentials: "include",
    headers
  });
  invalidateFrontendSessionCache();
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

export async function fetchAdminMenuTree(): Promise<AdminMenuTreePayload> {
  const cachedMenuTree = readAdminMenuTreeSnapshot();
  if (!adminMenuTreePromise) {
    adminMenuTreePromise = fetch(buildLocalizedPath("/admin/system/menu-data", "/en/admin/system/menu-data"), {
      credentials: "include",
      cache: "no-store",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }).then((response) => readJsonResponse<AdminMenuTreePayload>(response))
      .then((payload) => {
        adminMenuTreeCache = payload;
        writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, payload, SESSION_CACHE_TTL_MS);
        return payload;
      })
      .catch((error) => {
        if (cachedMenuTree) {
          adminMenuTreeCache = cachedMenuTree;
          return cachedMenuTree;
        }
        throw error;
      })
      .finally(() => {
        adminMenuTreePromise = null;
      });
  }
  if (!adminMenuTreePromise) {
    throw new Error("Admin menu tree promise was not initialized");
  }
  return adminMenuTreePromise;
}
