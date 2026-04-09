import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildResilientCsrfHeaders, readJsonResponse } from "./core";
import type {
  BackupConfigPagePayload,
  BatchManagementPagePayload,
  ExternalConnectionFormPagePayload,
  ExternalConnectionListPagePayload,
  ExternalKeysPagePayload,
  ExternalLogsPagePayload,
  ExternalMaintenancePagePayload,
  ExternalMonitoringPagePayload,
  ExternalRetryPagePayload,
  ExternalSchemaPagePayload,
  ExternalSyncPagePayload,
  ExternalUsagePagePayload,
  ExternalWebhooksPagePayload,
  OperationsCenterPagePayload,
  PerformancePagePayload,
  SchedulerManagementPagePayload,
  SecurityAuditPagePayload,
  SensorListPagePayload
} from "./client";

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

async function fetchPage<T>(url: string, fallbackMessage: string): Promise<T> {
  const response = await apiFetch(url, {
    credentials: "include"
  });
  const body = await readJsonResponse<T>(response);
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.status}`);
  }
  return body;
}

export async function fetchOperationsCenterPage() {
  return fetchPage<OperationsCenterPagePayload>("/admin/monitoring/center/page-data", "Failed to load operations center page");
}

export async function fetchPerformancePage() {
  return fetchPage<PerformancePagePayload>(buildLocalizedPath("/admin/system/performance/page-data", "/en/admin/system/performance/page-data"), "Failed to load performance page");
}

export async function fetchExternalConnectionListPage() {
  return fetchPage<ExternalConnectionListPagePayload>(buildLocalizedPath("/admin/external/connection_list/page-data", "/en/admin/external/connection_list/page-data"), "Failed to load external connection list page");
}

export async function fetchExternalSchemaPage() {
  return fetchPage<ExternalSchemaPagePayload>(buildLocalizedPath("/admin/external/schema/page-data", "/en/admin/external/schema/page-data"), "Failed to load external schema page");
}

export async function fetchExternalKeysPage() {
  return fetchPage<ExternalKeysPagePayload>(buildLocalizedPath("/admin/external/keys/page-data", "/en/admin/external/keys/page-data"), "Failed to load external keys page");
}

export async function fetchExternalUsagePage() {
  return fetchPage<ExternalUsagePagePayload>(buildLocalizedPath("/admin/external/usage/page-data", "/en/admin/external/usage/page-data"), "Failed to load external usage page");
}

export async function fetchExternalLogsPage() {
  return fetchPage<ExternalLogsPagePayload>(buildLocalizedPath("/admin/external/logs/page-data", "/en/admin/external/logs/page-data"), "Failed to load external logs page");
}

export async function fetchExternalWebhooksPage(params?: {
  keyword?: string;
  syncMode?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  if (params?.keyword?.trim()) search.set("keyword", params.keyword.trim());
  if (params?.syncMode && params.syncMode !== "ALL") search.set("syncMode", params.syncMode);
  if (params?.status && params.status !== "ALL") search.set("status", params.status);
  return fetchPage<ExternalWebhooksPagePayload>(`${buildLocalizedPath("/admin/external/webhooks/page-data", "/en/admin/external/webhooks/page-data")}${search.toString() ? `?${search.toString()}` : ""}`, "Failed to load external webhooks page");
}

export async function fetchExternalSyncPage() {
  return fetchPage<ExternalSyncPagePayload>(buildLocalizedPath("/admin/external/sync/page-data", "/en/admin/external/sync/page-data"), "Failed to load external sync page");
}

export async function fetchExternalMonitoringPage() {
  return fetchPage<ExternalMonitoringPagePayload>(buildLocalizedPath("/admin/external/monitoring/page-data", "/en/admin/external/monitoring/page-data"), "Failed to load external monitoring page");
}

export async function fetchExternalMaintenancePage() {
  return fetchPage<ExternalMaintenancePagePayload>(buildLocalizedPath("/admin/external/maintenance/page-data", "/en/admin/external/maintenance/page-data"), "Failed to load external maintenance page");
}

export async function fetchExternalRetryPage() {
  return fetchPage<ExternalRetryPagePayload>(buildLocalizedPath("/admin/external/retry/page-data", "/en/admin/external/retry/page-data"), "Failed to load external retry page");
}

export async function fetchExternalConnectionFormPage(mode: "add" | "edit", connectionId?: string) {
  const search = new URLSearchParams();
  if (connectionId) search.set("connectionId", connectionId);
  const path = mode === "add"
    ? buildLocalizedPath("/admin/external/connection_add/page-data", "/en/admin/external/connection_add/page-data")
    : buildLocalizedPath("/admin/external/connection_edit/page-data", "/en/admin/external/connection_edit/page-data");
  return fetchPage<ExternalConnectionFormPagePayload>(`${path}${search.toString() ? `?${search.toString()}` : ""}`, "Failed to load external connection form page");
}

export async function saveExternalConnection(payload: Record<string, string>) {
  const response = await apiFetch(buildLocalizedPath("/admin/external/connection/save", "/en/admin/external/connection/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ExternalConnectionFormPagePayload>(response);
  if (body.success === false) {
    throw new Error(body.message || "Failed to save external connection.");
  }
  if (!response.ok) {
    throw new Error(body.message || `Failed to save external connection: ${response.status}`);
  }
  return body;
}

export async function fetchSensorListPage() {
  return fetchPage<SensorListPagePayload>(buildLocalizedPath("/admin/monitoring/sensor_list/page-data", "/en/admin/monitoring/sensor_list/page-data"), "Failed to load sensor list page");
}

export function buildSecurityAuditExportUrl(params?: {
  searchKeyword?: string;
  actionType?: string;
  routeGroup?: string;
  startDate?: string;
  endDate?: string;
  sortKey?: string;
  sortDirection?: string;
}) {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.actionType && params.actionType !== "ALL") search.set("actionType", params.actionType);
  if (params?.routeGroup && params.routeGroup !== "ALL") search.set("routeGroup", params.routeGroup);
  if (params?.startDate) search.set("startDate", params.startDate);
  if (params?.endDate) search.set("endDate", params.endDate);
  if (params?.sortKey && params.sortKey !== "AUDIT_AT") search.set("sortKey", params.sortKey);
  if (params?.sortDirection && params.sortDirection !== "DESC") search.set("sortDirection", params.sortDirection);
  const query = search.toString();
  return buildLocalizedPath(
    `/admin/system/security-audit/export.csv${query ? `?${query}` : ""}`,
    `/en/admin/system/security-audit/export.csv${query ? `?${query}` : ""}`
  );
}

export async function fetchSchedulerManagementPage(params?: { jobStatus?: string; executionType?: string; }) {
  const response = await apiFetch(`/admin/system/scheduler/page-data${buildQueryString(params)}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<SchedulerManagementPagePayload>(response);
  if (!response.ok) {
    throw new Error(`Failed to load scheduler management page: ${response.status}`);
  }
  return body;
}

export async function fetchBatchManagementPage() {
  return fetchPage<BatchManagementPagePayload>("/admin/system/batch/page-data", "Failed to load batch management page");
}

export async function fetchBackupConfigPage(pathname?: string) {
  const currentPath = pathname || (typeof window === "undefined" ? "/admin/system/backup_config" : window.location.pathname);
  const normalizedPath = currentPath.replace(/\/page-data$/, "");
  const sharedPath = normalizedPath
    .replace(/\/admin\/system\/backup$/, "/admin/system/backup_config")
    .replace(/\/admin\/system\/restore$/, "/admin/system/backup_config")
    .replace(/\/admin\/system\/version$/, "/admin/system/backup_config")
    .replace(/\/en\/admin\/system\/backup$/, "/en/admin/system/backup_config")
    .replace(/\/en\/admin\/system\/restore$/, "/en/admin/system/backup_config")
    .replace(/\/en\/admin\/system\/version$/, "/en/admin/system/backup_config");
  const url = sharedPath.startsWith("/en/")
    ? `${sharedPath}/page-data`
    : buildLocalizedPath(`${sharedPath}/page-data`, `/en${sharedPath}/page-data`);
  return fetchPage<BackupConfigPagePayload>(url, "Failed to load backup config page");
}

export async function saveBackupConfig(payload: Record<string, string>) {
  const response = await apiFetch(buildLocalizedPath("/admin/system/backup_config/save", "/en/admin/system/backup_config/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) {
    throw new Error(String(body.backupConfigMessage || `Failed to save backup config: ${response.status}`));
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
  return fetchPage<SecurityAuditPagePayload>(`/admin/system/security-audit/page-data${suffix}`, "Failed to load security audit page");
}

export async function createIpWhitelistRequest(payload: Record<string, unknown>) {
  const response = await apiFetch(buildLocalizedPath("/admin/system/ip-whitelist/request", "/en/admin/system/ip-whitelist/request"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; requestId?: string; ruleId?: string } & Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to create IP whitelist request: ${response.status}`));
  }
  return body;
}

export async function restoreBackupConfigVersion(versionId: string) {
  const response = await apiFetch(buildLocalizedPath("/admin/system/version/restore", "/en/admin/system/version/restore"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify({ versionId })
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) {
    throw new Error(body.backupConfigMessage || `Failed to restore backup version: ${response.status}`);
  }
  return body;
}

export async function runBackupExecution(
  executionType:
    | "DB"
    | "GIT"
    | "GIT_PRECHECK"
    | "GIT_CLEANUP_SAFE"
    | "GIT_BUNDLE"
    | "GIT_COMMIT_AND_PUSH_BASE"
    | "GIT_PUSH_BASE"
    | "GIT_PUSH_RESTORE"
    | "GIT_TAG_PUSH"
    | "GIT_RESTORE_COMMIT"
    | "DB_RESTORE_SQL"
    | "DB_RESTORE_PHYSICAL"
    | "DB_RESTORE_PITR",
  options?: {
    gitRestoreCommit?: string;
    dbRestoreType?: string;
    dbRestoreTarget?: string;
    dbRestorePointInTime?: string;
    sudoPassword?: string;
  }
) {
  const response = await apiFetch(buildLocalizedPath("/admin/system/backup/run", "/en/admin/system/backup/run"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify({
      executionType,
      gitRestoreCommit: options?.gitRestoreCommit || "",
      dbRestoreType: options?.dbRestoreType || "",
      dbRestoreTarget: options?.dbRestoreTarget || "",
      dbRestorePointInTime: options?.dbRestorePointInTime || "",
      sudoPassword: options?.sudoPassword || ""
    })
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) {
    const fallbackMessage = (body as BackupConfigPagePayload & { message?: string; retryAfterSeconds?: number; }).message;
    const retryAfterSeconds = Number((body as BackupConfigPagePayload & { retryAfterSeconds?: number; }).retryAfterSeconds || 0);
    const retrySuffix = retryAfterSeconds > 0 ? ` (${retryAfterSeconds}s)` : "";
    throw new Error(body.backupConfigMessage || fallbackMessage || `Failed to run backup execution: ${response.status}${retrySuffix}`);
  }
  return body;
}
