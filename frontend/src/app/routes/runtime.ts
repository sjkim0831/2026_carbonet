import { getRuntimeLocale } from "../../lib/navigation/runtime";
import { MigrationPageId, ROUTES, normalizeRouteId } from "./definitions";

const routeById = new Map(ROUTES.map((entry) => [entry.id, entry] as const));
const routeByComparablePath = new Map<string, MigrationPageId>();

ROUTES.forEach((entry) => {
  routeByComparablePath.set(normalizeComparablePath(entry.koPath), entry.id);
  routeByComparablePath.set(normalizeComparablePath(entry.enPath), entry.id);
});

export function normalizeComparablePath(value: string): string {
  if (!value) {
    return "/";
  }
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

export function isReactManagedPath(pathname: string): boolean {
  const normalizedPath = normalizeComparablePath(pathname);
  const koComparable = normalizeComparablePath(normalizedPath.replace(/^\/en/, "") || "/home");
  const isReactShellPath = normalizedPath === "/app"
    || normalizedPath === "/en/app"
    || normalizedPath === "/admin/app"
    || normalizedPath === "/en/admin/app";

  if (isReactShellPath) {
    return true;
  }

  if (koComparable === "/admin/member/withdrawn" || koComparable === "/admin/member/activate") {
    return true;
  }

  return routeByComparablePath.has(koComparable) || routeByComparablePath.has(normalizedPath);
}

export function resolveCanonicalRuntimePath(): string {
  const pathname = window.location.pathname;
  const isReactShellPath = pathname === "/app"
    || pathname === "/en/app"
    || pathname === "/admin/app"
    || pathname === "/en/admin/app";
  if (!isReactShellPath) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const route = normalizeRouteId(params.get("route") || window.__CARBONET_REACT_MIGRATION__?.route);
  if (!route) {
    return "";
  }
  const matched = routeById.get(route);
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
  const normalizedKoPath = normalizeComparablePath(pathname.replace(/^\/en/, "") || "/home");
  if (normalizedKoPath === "/admin/member/withdrawn" || normalizedKoPath === "/admin/member/activate") {
    return "member-list";
  }
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
