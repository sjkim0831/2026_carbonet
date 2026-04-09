import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";
import type {
  IpWhitelistPagePayload,
} from "./client";
import type {
  AccessHistoryPagePayload,
  BlocklistPagePayload,
  ErrorLogPagePayload,
  LoginHistoryPagePayload,
  MenuPermissionAutoCleanupResponse,
  SecurityAuditPagePayload,
  SecurityHistoryActionResponse,
  SecurityMonitoringPagePayload,
  SecurityPolicyPagePayload
} from "./securityTypes";

function buildQueryString(params?: Record<string, string | number | boolean | null | undefined>): string {
  if (!params) {
    return "";
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function postAdminJson<T>(path: string, payload?: unknown): Promise<T> {
  const response = await apiFetch(buildAdminApiPath(path), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  return readJsonResponse<T>(response);
}

export async function fetchLoginHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; loginResult?: string; insttId?: string; }) {
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/member/login-history/page")}${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<LoginHistoryPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.loginHistoryError || `Failed to load login history page: ${response.status}`));
  }
  return body;
}

export async function fetchAccessHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; insttId?: string; }) {
  const response = await apiFetch(`${buildLocalizedPath("/admin/system/access_history/page-data", "/en/admin/system/access_history/page-data")}${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<AccessHistoryPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.accessHistoryError || `Failed to load access history page: ${response.status}`));
  }
  return body;
}

export async function fetchErrorLogPage(params?: { pageIndex?: number; searchKeyword?: string; insttId?: string; sourceType?: string; errorType?: string; }) {
  const response = await apiFetch(`${buildLocalizedPath("/admin/system/error-log/page-data", "/en/admin/system/error-log/page-data")}${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<ErrorLogPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.errorLogError || `Failed to load error log page: ${response.status}`));
  }
  return body;
}

export async function fetchIpWhitelistPage(params?: { searchIp?: string; accessScope?: string; status?: string; }) {
  const response = await apiFetch(`${buildLocalizedPath("/admin/system/ip_whitelist/page-data", "/en/admin/system/ip_whitelist/page-data")}${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<IpWhitelistPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load IP whitelist page: ${response.status}`);
  }
  return body;
}

export async function decideIpWhitelistRequest(payload: Record<string, unknown>) {
  const body = await postAdminJson<{ success?: boolean; message?: string; requestId?: string } & Record<string, unknown>>(
    "/api/admin/system/ip-whitelist/request-decision",
    payload || {}
  );
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to process IP whitelist request"));
  }
  return body;
}

export async function fetchSecurityHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; insttId?: string; actionStatus?: string; }) {
  const response = await apiFetch(`/admin/system/security/page-data${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<LoginHistoryPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.loginHistoryError || `Failed to load security history page: ${response.status}`));
  }
  return body;
}

export async function fetchMemberSecurityHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; insttId?: string; actionStatus?: string; }) {
  const response = await apiFetch(`${buildLocalizedPath("/admin/member/security/page-data", "/en/admin/member/security/page-data")}${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<LoginHistoryPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.loginHistoryError || `Failed to load member security history page: ${response.status}`));
  }
  return body;
}

export async function saveSecurityHistoryAction(payload: Record<string, unknown>) {
  const body = await postAdminJson<SecurityHistoryActionResponse>("/api/admin/system/security-history/action", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to save security history action"));
  }
  return body;
}

export async function fetchSecurityPolicyPage() {
  const response = await apiFetch("/admin/system/security-policy/page-data", {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityPolicyPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load security policy page: ${response.status}`);
  }
  return body;
}

export async function fetchNotificationPage(params?: {
  deliveryChannel?: string;
  deliveryStatus?: string;
  deliveryKeyword?: string;
  deliveryPage?: number;
  activityAction?: string;
  activityKeyword?: string;
  activityPage?: number;
}) {
  const query = new URLSearchParams();
  if (params?.deliveryChannel) query.set("deliveryChannel", params.deliveryChannel);
  if (params?.deliveryStatus) query.set("deliveryStatus", params.deliveryStatus);
  if (params?.deliveryKeyword) query.set("deliveryKeyword", params.deliveryKeyword);
  if (params?.deliveryPage && params.deliveryPage > 1) query.set("deliveryPage", String(params.deliveryPage));
  if (params?.activityAction) query.set("activityAction", params.activityAction);
  if (params?.activityKeyword) query.set("activityKeyword", params.activityKeyword);
  if (params?.activityPage && params.activityPage > 1) query.set("activityPage", String(params.activityPage));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiFetch(buildLocalizedPath(`/admin/system/notification/page-data${suffix}`, `/en/admin/system/notification/page-data${suffix}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityPolicyPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load notification page: ${response.status}`);
  }
  return body;
}

export async function runMenuPermissionAutoCleanup(menuUrls?: string[]) {
  const body = await postAdminJson<MenuPermissionAutoCleanupResponse>("/api/admin/system/menu-permission-diagnostics/auto-cleanup", {
    menuUrls: menuUrls || []
  });
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to run menu permission auto cleanup"));
  }
  return body;
}

export async function saveSecurityPolicyFindingState(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/state", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to save security policy finding state"));
  }
  return body;
}

export async function clearSecurityPolicySuppressions() {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/clear-suppressions", {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to clear suppressions"));
  }
  return body;
}

export async function runSecurityPolicyAutoFix(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/auto-fix", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to run security policy auto-fix"));
  }
  return body;
}

export async function runSecurityPolicyBulkAutoFix(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/auto-fix-bulk", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to run security policy bulk auto-fix"));
  }
  return body;
}

export async function saveSecurityPolicyNotificationConfig(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/notification-config", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to save security policy notification config"));
  }
  return body;
}

export async function runSecurityPolicyRollback(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/rollback", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to run security policy rollback"));
  }
  return body;
}

export async function dispatchSecurityPolicyNotifications(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-policy/dispatch", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to dispatch security policy notifications"));
  }
  return body;
}

export async function fetchSecurityMonitoringPage() {
  const response = await apiFetch("/admin/system/security-monitoring/page-data", {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityMonitoringPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load security monitoring page: ${response.status}`);
  }
  return body;
}

export async function saveSecurityMonitoringState(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-monitoring/state", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to save security monitoring state"));
  }
  return body;
}

export async function registerSecurityMonitoringBlockCandidate(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-monitoring/block-candidates", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to register security monitoring block candidate"));
  }
  return body;
}

export async function updateSecurityMonitoringBlockCandidate(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-monitoring/block-candidates/state", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to update security monitoring block candidate"));
  }
  return body;
}

export async function dispatchSecurityMonitoringNotification(payload: Record<string, unknown>) {
  const body = await postAdminJson<Record<string, unknown>>("/api/admin/system/security-monitoring/notify", payload || {});
  if (body.success === false) {
    throw new Error(String(body.message || "Failed to dispatch security monitoring notification"));
  }
  return body;
}

export async function fetchBlocklistPage(params?: { searchKeyword?: string; blockType?: string; status?: string; source?: string; }) {
  const response = await apiFetch(`/admin/system/blocklist/page-data${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<BlocklistPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load blocklist page: ${response.status}`);
  }
  return body;
}

export async function fetchSecurityAuditPage(params?: {
  pageIndex?: number;
  searchKeyword?: string;
  actionType?: string;
  routeGroup?: string;
  startDate?: string;
  endDate?: string;
  sortKey?: string;
  sortDirection?: string;
}) {
  const query = new URLSearchParams();
  if (params?.pageIndex && params.pageIndex > 1) query.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) query.set("searchKeyword", params.searchKeyword);
  if (params?.actionType && params.actionType !== "ALL") query.set("actionType", params.actionType);
  if (params?.routeGroup && params.routeGroup !== "ALL") query.set("routeGroup", params.routeGroup);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.sortKey && params.sortKey !== "AUDIT_AT") query.set("sortKey", params.sortKey);
  if (params?.sortDirection && params.sortDirection !== "DESC") query.set("sortDirection", params.sortDirection);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await apiFetch(`/admin/system/security-audit/page-data${suffix}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityAuditPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load security audit page: ${response.status}`);
  }
  return body;
}
