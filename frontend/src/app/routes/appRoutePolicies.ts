import type { AllRouteId } from "./families/allRouteDefinitionFamilies";

const routeIdAliases = new Map<string, AllRouteId>([
  ["codex-provision", "codex-request"]
]);

export const reactShellPaths = new Set(["/app", "/en/app", "/admin/app", "/en/admin/app"]);

const appSpecialCasePages = new Map<string, AllRouteId>([
  ["/admin/member/withdrawn", "member-list"],
  ["/admin/member/activate", "member-list"],
  ["/admin/system/menu", "menu-management"],
  ["/admin/system/menu-management", "menu-management"],
  ["/admin/content/menu", "faq-menu-management"],
  ["/signin/findId/overseas", "signin-find-id"],
  ["/signin/findPassword/overseas", "signin-find-password"],
  ["/co2/credit", "co2-credit"]
]);

export const appRouteAliases: Array<readonly [string, AllRouteId]> = [
  ["/admin/trade/list", "trade-list"],
  ["/en/admin/trade/list", "trade-list"],
  ["/trade/matching", "co2-search"],
  ["/en/trade/matching", "co2-search"],
  ["/monitoring/esg", "monitoring-statistics"],
  ["/en/monitoring/esg", "monitoring-statistics"],
  ["/payment/detail", "payment-history"],
  ["/en/payment/detail", "payment-history"],
  ["/payment/refund_account", "payment-refund-account"],
  ["/en/payment/refund_account", "payment-refund-account"],
  ["/payment/refundAccount", "payment-refund-account"],
  ["/en/payment/refundAccount", "payment-refund-account"]
];

export function resolveAppRouteIdAlias(value: string): AllRouteId | "" {
  return routeIdAliases.get(value) || "";
}

export function resolveAppSpecialCasePage(pathname: string): AllRouteId | null {
  return appSpecialCasePages.get(pathname) || null;
}

export function resolveAppRouteFallback(pathname: string): AllRouteId {
  if (pathname.startsWith("/admin") || pathname.startsWith("/en/admin")) {
    return "admin-home";
  }
  return "home";
}
