import { getRuntimeLocale } from "../../lib/navigation/runtime";
import { resolvePlatformSpecialCasePage } from "../../platform/routes/families/platformRuntimeRules";
import { MigrationPageId, ROUTES, getRouteDefinition, normalizeRouteId, normalizeRouteLookupPath } from "./definitions";
import { appRouteAliases, appSpecialCasePages, reactShellPaths } from "./appRuntimeRules";

const routeByComparablePath = new Map<string, MigrationPageId>();

ROUTES.forEach((entry) => {
  routeByComparablePath.set(normalizeComparablePath(entry.koPath), entry.id);
  routeByComparablePath.set(normalizeComparablePath(entry.enPath), entry.id);
});

appRouteAliases.forEach(([path, pageId]) => {
  routeByComparablePath.set(normalizeComparablePath(path), pageId);
});

export function normalizeComparablePath(value: string): string {
  return normalizeRouteLookupPath(value);
}

export function isReactShellPath(pathname: string): boolean {
  return reactShellPaths.has(normalizeComparablePath(pathname));
}

function resolveKoComparablePath(pathname: string): string {
  return normalizeComparablePath(pathname.replace(/^\/en/, "") || "/home");
}

function resolveSpecialCasePage(pathname: string): MigrationPageId | null {
  const normalizedKoPath = resolveKoComparablePath(pathname);
  return resolvePlatformSpecialCasePage(normalizedKoPath) || appSpecialCasePages.get(normalizedKoPath) || null;
}

export function isReactManagedPath(pathname: string): boolean {
  const normalizedPath = normalizeComparablePath(pathname);
  const koComparable = resolveKoComparablePath(normalizedPath);
  if (isReactShellPath(normalizedPath)) {
    return true;
  }
  if (resolveSpecialCasePage(koComparable)) {
    return true;
  }
  return routeByComparablePath.has(koComparable) || routeByComparablePath.has(normalizedPath);
}

export function resolveCanonicalRuntimePath(): string {
  const pathname = window.location.pathname;
  if (!isReactShellPath(pathname)) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const route = normalizeRouteId(params.get("route") || window.__CARBONET_REACT_MIGRATION__?.route);
  if (!route) {
    return "";
  }
  const matched = getRouteDefinition(route);
  if (!matched) {
    return "";
  }

  params.delete("route");
  params.delete("content");
  params.delete("language");

  const basePath = getRuntimeLocale() === "en" ? matched.enPath : matched.koPath;
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function resolvePageFromPath(pathname: string, search = ""): MigrationPageId {
  const normalizedCurrentPath = normalizeComparablePath(pathname);
  const specialCasePage = resolveSpecialCasePage(normalizedCurrentPath);
  if (specialCasePage) {
    return specialCasePage;
  }
  const normalizedKoPath = resolveKoComparablePath(pathname);
  const matched = routeByComparablePath.get(normalizedKoPath) || routeByComparablePath.get(normalizedCurrentPath);
  if (matched) {
    return matched;
  }
  const nextUrl = `${pathname}${search}`;
  if (nextUrl.startsWith("/admin") || nextUrl.startsWith("/en/admin")) {
    return "admin-home";
  }
  return "home";
}

export function parseLocationState(locationState: string) {
  const fallback = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const url = new URL(locationState || fallback, window.location.origin);
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash
  };
}
