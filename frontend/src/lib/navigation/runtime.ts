declare global {
  interface Window {
    __CARBONET_REACT_MIGRATION__?: {
      route?: string;
      locale?: string;
      admin?: boolean;
      devUrl?: string;
      prodJs?: string;
    };
    __CARBONET_REACT_BOOTSTRAP__?: {
      frontendSession?: unknown;
      adminMenuTree?: unknown;
      homePayload?: unknown;
      mypagePayload?: unknown;
      mypageContext?: unknown;
      memberStatsPageData?: unknown;
      securityPolicyPageData?: unknown;
      securityMonitoringPageData?: unknown;
      securityAuditPageData?: unknown;
      schedulerManagementPageData?: unknown;
      emissionResultListPageData?: unknown;
    };
  }
}

const NAVIGATION_EVENT = "carbonet:navigate";

export function getRuntimeLocale(): "ko" | "en" {
  const locale = window.__CARBONET_REACT_MIGRATION__?.locale;
  return locale === "en" || document.documentElement.lang === "en" || window.location.pathname.startsWith("/en/")
    ? "en"
    : "ko";
}

export function isEnglish(): boolean {
  return getRuntimeLocale() === "en";
}

export function isAdminContext(): boolean {
  const flag = window.__CARBONET_REACT_MIGRATION__?.admin;
  if (typeof flag === "boolean") {
    return flag;
  }
  return window.location.pathname.includes("/admin/");
}

export function getSearchParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name)?.trim() || "";
}

export function buildLocalizedPath(koPath: string, enPath: string): string {
  return isEnglish() ? enPath : koPath;
}

export function navigate(path: string) {
  const nextUrl = new URL(path, window.location.origin);
  const currentUrl = new URL(window.location.href);
  if (nextUrl.origin !== currentUrl.origin) {
    window.location.href = nextUrl.toString();
    return;
  }
  if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search && nextUrl.hash === currentUrl.hash) {
    window.dispatchEvent(new Event(NAVIGATION_EVENT));
    return;
  }
  window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function replace(path: string) {
  const nextUrl = new URL(path, window.location.origin);
  window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function getNavigationEventName() {
  return NAVIGATION_EVENT;
}

export function getCsrfMeta() {
  const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content")
    || (document.getElementById("admin-csrf-token") as HTMLInputElement | null)?.value
    || "";
  const headerName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content")
    || (document.getElementById("admin-csrf-header") as HTMLInputElement | null)?.value
    || "X-CSRF-TOKEN";
  return { token, headerName };
}
