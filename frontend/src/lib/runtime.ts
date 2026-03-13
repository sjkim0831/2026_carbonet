declare global {
  interface Window {
    __CARBONET_REACT_MIGRATION__?: {
      route?: string;
      locale?: string;
      admin?: boolean;
      devUrl?: string;
      prodJs?: string;
    };
  }
}

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
  window.location.href = path;
}

export function getCsrfMeta() {
  const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content") || "";
  const headerName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
  return { token, headerName };
}

