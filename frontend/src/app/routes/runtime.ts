import { getRuntimeLocale } from "../../lib/navigation/runtime";
import { MigrationPageId, ROUTES, normalizeRouteId } from "./definitions";

export function normalizeComparablePath(value: string): string {
  if (!value) {
    return "/";
  }
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

export function isReactManagedPath(pathname: string): boolean {
  const normalizedPath = normalizeComparablePath(pathname);
  const koComparable = normalizeComparablePath(normalizedPath.replace(/^\/en/, "") || "/home");
  const isReactShellPath = normalizedPath === "/react-migration"
    || normalizedPath === "/en/react-migration"
    || normalizedPath === "/admin/react-migration"
    || normalizedPath === "/en/admin/react-migration";

  if (isReactShellPath) {
    return true;
  }

  return ROUTES.some((entry) =>
    normalizeComparablePath(entry.koPath) === koComparable || normalizeComparablePath(entry.enPath) === normalizedPath
  );
}

export function resolveCanonicalRuntimePath(): string {
  const pathname = window.location.pathname;
  const isReactShellPath = pathname === "/react-migration"
    || pathname === "/en/react-migration"
    || pathname === "/admin/react-migration"
    || pathname === "/en/admin/react-migration";
  if (!isReactShellPath) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const route = normalizeRouteId(params.get("route") || window.__CARBONET_REACT_MIGRATION__?.route);
  if (!route) {
    return "";
  }
  const matched = ROUTES.find((entry) => entry.id === route);
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
  const matched = ROUTES.find((entry) =>
    normalizeComparablePath(entry.koPath) === normalizedKoPath || normalizeComparablePath(entry.enPath) === normalizedCurrentPath
  );
  if (matched) {
    return matched.id;
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
