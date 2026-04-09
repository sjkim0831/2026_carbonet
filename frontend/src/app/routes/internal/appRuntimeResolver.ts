import { getRuntimeLocale } from "../../../lib/navigation/runtime";
import { createRuntimePathRegistry, normalizeComparablePath } from "../../../framework/routes/runtimePathRegistry";
import { resolvePlatformSpecialCasePage } from "../../../platform/routes/families/platformRuntimeRules";
import type { MigrationPageId } from "./appRouteTypes";
import { appRouteAliases, reactShellPaths, resolveAppRouteFallback, resolveAppSpecialCasePage } from "./appRoutePolicies";
import { ROUTES, getRouteDefinition, normalizeRouteId } from "../definitions";

const runtimePathRegistry = createRuntimePathRegistry(ROUTES, appRouteAliases);

export { normalizeComparablePath };

export function isReactShellPath(pathname: string): boolean {
  return reactShellPaths.has(normalizeComparablePath(pathname));
}

function resolveKoComparablePath(pathname: string): string {
  return normalizeComparablePath(pathname.replace(/^\/en/, "") || "/home");
}

function resolveSpecialCasePage(pathname: string): MigrationPageId | null {
  const normalizedKoPath = resolveKoComparablePath(pathname);
  return resolvePlatformSpecialCasePage(normalizedKoPath) || resolveAppSpecialCasePage(normalizedKoPath);
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
  return runtimePathRegistry.hasPath(koComparable) || runtimePathRegistry.hasPath(normalizedPath);
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
  const matched = runtimePathRegistry.getByPath(normalizedKoPath) || runtimePathRegistry.getByPath(normalizedCurrentPath);
  if (matched) {
    return matched;
  }
  return resolveAppRouteFallback(`${pathname}${search}`);
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
