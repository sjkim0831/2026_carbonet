import type { MigrationPageId } from "../../app/routes/definitions";
import { buildLocalizedPath } from "../navigation/runtime";
import * as adminMemberApi from "./adminMember";
import * as bootstrapApi from "./bootstrap";
import {
  apiFetch,
  readJsonResponse
} from "./core";
import {
  fetchEmissionDataHistoryPage,
  fetchEmissionLciClassificationPage,
  fetchEmissionResultDetailPage,
  fetchEmissionResultListPage,
  fetchEmissionValidatePage
} from "./emission";
import * as memberApi from "./member";
import {
  fetchBackupConfigPage,
  fetchExternalConnectionListPage,
  fetchExternalLogsPage,
  fetchExternalMaintenancePage,
  fetchExternalMonitoringPage,
  fetchExternalRetryPage,
  fetchExternalSchemaPage,
  fetchExternalSyncPage,
  fetchExternalUsagePage,
  fetchExternalWebhooksPage,
  fetchPerformancePage,
  fetchSchedulerManagementPage
} from "./ops";
import { fetchJsonWithoutCache, SESSION_STORAGE_CACHE_PREFIX, writeSessionStorageCache } from "./pageCache";
import * as platformApi from "./platform";
import * as portalApi from "./portal";
import * as securityApi from "./security";
import * as tradeApi from "./trade";
import type {
  AdminMenuPlaceholderPagePayload,
  BootstrappedHomePayload,
  HomeMenuPlaceholderPagePayload,
  SitemapPagePayload
} from "./appBootstrapTypes";
import type { CertificateAuditLogPagePayload, MypagePayload } from "./client";

const SESSION_CACHE_TTL_MS = 5 * 60 * 1000;

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

async function fetchLocalizedPageJson<T>(
  koPath: string,
  enPath: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  return fetchJsonWithoutCache<T>({
    url: `${buildLocalizedPath(koPath, enPath)}${buildQueryString(params)}`
  });
}

export async function fetchSitemapPage(): Promise<SitemapPagePayload> {
  return fetchLocalizedPageJson<SitemapPagePayload>("/api/sitemap", "/api/en/sitemap");
}

export async function fetchHomeMenuPlaceholderPage(requestPath: string): Promise<HomeMenuPlaceholderPagePayload> {
  const query = requestPath ? `?requestPath=${encodeURIComponent(requestPath)}` : "";
  const response = await apiFetch(`${buildLocalizedPath("/api/home/menu-placeholder", "/api/en/home/menu-placeholder")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<HomeMenuPlaceholderPagePayload>(response);
}

export async function fetchAdminMenuPlaceholderPage(requestPath: string): Promise<AdminMenuPlaceholderPagePayload> {
  const query = requestPath ? `?requestPath=${encodeURIComponent(requestPath)}` : "";
  const response = await apiFetch(`${buildLocalizedPath("/admin/api/admin/menu-placeholder", "/en/admin/api/admin/menu-placeholder")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<AdminMenuPlaceholderPagePayload>(response);
}

export async function fetchHomePayload(): Promise<BootstrappedHomePayload> {
  const response = await apiFetch(buildLocalizedPath("/api/home", "/en/api/home"), {
    credentials: "include"
  });
  const payload = await readJsonResponse<BootstrappedHomePayload>(response);
  writeSessionStorageCache(
    `${SESSION_STORAGE_CACHE_PREFIX}home-payload:${payload.isEn ? "en" : "ko"}`,
    payload,
    SESSION_CACHE_TTL_MS
  );
  return payload;
}

export function prefetchRoutePageData(route: MigrationPageId, search = ""): Promise<unknown> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  switch (route) {
    case "auth-group":
      return adminMemberApi.fetchAuthGroupPage({
        authorCode: params.get("authorCode") || "",
        roleCategory: params.get("roleCategory") || "",
        insttId: params.get("insttId") || "",
        menuCode: params.get("menuCode") || "",
        featureCode: params.get("featureCode") || "",
        userSearchKeyword: params.get("userSearchKeyword") || ""
      });
    case "auth-change":
      return adminMemberApi.fetchAuthChangePage({
        searchKeyword: params.get("searchKeyword") || "",
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined
      });
    case "dept-role":
      return adminMemberApi.fetchDeptRolePage({
        insttId: params.get("insttId") || "",
        memberSearchKeyword: params.get("memberSearchKeyword") || "",
        memberPageIndex: params.get("memberPageIndex") ? Number(params.get("memberPageIndex")) : undefined
      });
    case "member-edit": {
      const memberId = params.get("memberId") || "";
      return memberId ? adminMemberApi.fetchMemberEditPage(memberId, { updated: params.get("updated") || "" }) : Promise.resolve(null);
    }
    case "member-stats":
      return memberApi.fetchMemberStatsPage();
    case "trade-statistics":
      return tradeApi.fetchTradeStatisticsPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        periodFilter: params.get("periodFilter") || "",
        tradeType: params.get("tradeType") || "",
        settlementStatus: params.get("settlementStatus") || ""
      });
    case "certificate-statistics":
      return tradeApi.fetchCertificateStatisticsPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        periodFilter: params.get("periodFilter") || "",
        certificateType: params.get("certificateType") || "",
        issuanceStatus: params.get("issuanceStatus") || ""
      });
    case "virtual-issue":
      return memberApi.fetchRefundAccountReviewPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        verificationStatus: params.get("verificationStatus") || "",
        payoutStatus: params.get("payoutStatus") || ""
      });
    case "security-policy":
      return securityApi.fetchSecurityPolicyPage();
    case "notification":
      return securityApi.fetchNotificationPage();
    case "performance":
      return fetchPerformancePage();
    case "external-connection-list":
      return fetchExternalConnectionListPage();
    case "external-schema":
      return fetchExternalSchemaPage();
    case "external-usage":
      return fetchExternalUsagePage();
    case "external-logs":
      return fetchExternalLogsPage();
    case "external-webhooks":
      return fetchExternalWebhooksPage();
    case "external-sync":
      return fetchExternalSyncPage();
    case "external-monitoring":
      return fetchExternalMonitoringPage();
    case "external-maintenance":
      return fetchExternalMaintenancePage();
    case "external-retry":
      return fetchExternalRetryPage();
    case "security-monitoring":
      return securityApi.fetchSecurityMonitoringPage();
    case "security-audit":
      return securityApi.fetchSecurityAuditPage();
    case "certificate-audit-log":
      return fetchCertificateAuditLogPage();
    case "scheduler-management":
      return fetchSchedulerManagementPage({
        jobStatus: params.get("jobStatus") || "",
        executionType: params.get("executionType") || ""
      });
    case "backup-config":
      return fetchBackupConfigPage("/admin/system/backup_config");
    case "backup-execution":
      return fetchBackupConfigPage("/admin/system/backup");
    case "new-page":
      return platformApi.fetchNewPagePage();
    case "restore-execution":
      return fetchBackupConfigPage("/admin/system/restore");
    case "version-management":
      return platformApi.fetchProjectVersionManagementPage({
        projectId: params.get("projectId") || "carbonet"
      });
    case "emission-result-list":
      return fetchEmissionResultListPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        resultStatus: params.get("resultStatus") || "",
        verificationStatus: params.get("verificationStatus") || ""
      });
    case "emission-result-detail":
      return fetchEmissionResultDetailPage(params.get("resultId") || "");
    case "emission-data-history":
      return fetchEmissionDataHistoryPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        changeType: params.get("changeType") || "",
        changeTarget: params.get("changeTarget") || ""
      });
    case "emission-lci-classification":
      return fetchEmissionLciClassificationPage({
        searchKeyword: params.get("searchKeyword") || "",
        level: params.get("level") || "",
        useAt: params.get("useAt") || "",
        code: params.get("code") || ""
      });
    case "emission-validate":
      return fetchEmissionValidatePage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        verificationStatus: params.get("verificationStatus") || "",
        priorityFilter: params.get("priorityFilter") || ""
      });
    default:
      return Promise.resolve(null);
  }
}

export async function prefetchRouteBootstrap(route: MigrationPageId, path: string): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isAdminPath = normalizedPath.startsWith("/admin") || normalizedPath.startsWith("/en/admin");
  const bootstrapEndpoint = isAdminPath
    ? buildLocalizedPath("/admin/api/admin/app/bootstrap", "/en/admin/api/admin/app/bootstrap")
    : buildLocalizedPath("/api/app/bootstrap", "/en/api/app/bootstrap");
  const url = new URL(bootstrapEndpoint, window.location.origin);
  url.searchParams.set("route", route);
  url.searchParams.set("path", normalizedPath);

  const responsePayload = await apiFetch(url.toString(), {
    credentials: "include",
    headers: {
      "X-Carbonet-Path": normalizedPath
    }
  }).then((response) => readJsonResponse<{ reactBootstrapPayload?: Partial<Record<bootstrapApi.BootstrapPayloadKey, unknown>> }>(response));

  bootstrapApi.mergeRuntimeBootstrap(responsePayload.reactBootstrapPayload || {});
}

export async function fetchCertificateAuditLogPage(params?: {
  pageIndex?: number;
  searchKeyword?: string;
  auditType?: string;
  status?: string;
  certificateType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const search = new URLSearchParams();
  if (params?.pageIndex && params.pageIndex > 1) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.auditType && params.auditType !== "ALL") search.set("auditType", params.auditType);
  if (params?.status && params.status !== "ALL") search.set("status", params.status);
  if (params?.certificateType && params.certificateType !== "ALL") search.set("certificateType", params.certificateType);
  if (params?.startDate) search.set("startDate", params.startDate);
  if (params?.endDate) search.set("endDate", params.endDate);
  const response = await apiFetch(buildLocalizedPath(
    `/admin/certificate/audit-log/page-data${search.toString() ? `?${search.toString()}` : ""}`,
    `/en/admin/certificate/audit-log/page-data${search.toString() ? `?${search.toString()}` : ""}`
  ), {
    credentials: "include"
  });
  const body = await readJsonResponse<CertificateAuditLogPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load certificate audit log page: ${response.status}`);
  return body;
}

export async function fetchMypage(en = false) {
  const bootstrappedPayload = bootstrapApi.consumeRuntimeBootstrap<MypagePayload>("mypagePayload");
  if (bootstrappedPayload) {
    return bootstrappedPayload;
  }
  return portalApi.fetchMypage(en) as Promise<MypagePayload>;
}
