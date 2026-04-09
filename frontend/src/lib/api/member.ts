import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildAdminApiPath, readJsonResponse } from "./core";
import type {
  CertificateObjectionListPagePayload,
  CertificatePendingPagePayload,
  CertificateReviewPagePayload,
  MemberRegisterPagePayload,
  MemberStatsPagePayload,
  PasswordResetPagePayload,
  RefundAccountReviewPagePayload,
  SystemCodePagePayload
} from "./client";

async function fetchLocalizedPageData<T>(
  koPath: string,
  enPath: string,
  options?: {
    query?: string;
    fallbackMessage: string;
    resolveError?: (body: T, status: number) => string;
  }
): Promise<T> {
  const query = options?.query ? `${options.query}` : "";
  const response = await apiFetch(buildLocalizedPath(
    `${koPath}${query ? `?${query}` : ""}`,
    `${enPath}${query ? `?${query}` : ""}`
  ), {
    credentials: "include"
  });
  const body = await readJsonResponse<T>(response);
  if (!response.ok) {
    throw new Error(options?.resolveError?.(body, response.status) || `${options?.fallbackMessage}: ${response.status}`);
  }
  return body;
}

export async function fetchPasswordResetPage(params?: { memberId?: string; pageIndex?: number; searchKeyword?: string; resetSource?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.memberId) search.set("memberId", params.memberId);
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.resetSource) search.set("resetSource", params.resetSource);
  if (params?.insttId) search.set("insttId", params.insttId);
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/member/reset-password")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load password reset page: ${response.status}`);
  }
  return response.json() as Promise<PasswordResetPagePayload>;
}

export async function fetchCertificatePendingPage(params?: { pageIndex?: number; searchKeyword?: string; certificateType?: string; processStatus?: string; applicationId?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.certificateType) search.set("certificateType", params.certificateType);
  if (params?.processStatus) search.set("processStatus", params.processStatus);
  if (params?.applicationId) search.set("applicationId", params.applicationId);
  if (params?.insttId) search.set("insttId", params.insttId);
  return fetchLocalizedPageData<CertificatePendingPagePayload>(
    "/admin/certificate/pending_list/page-data",
    "/en/admin/certificate/pending_list/page-data",
    {
      query: search.toString(),
      fallbackMessage: "Failed to load certificate pending page",
      resolveError: (body, status) => body.certificatePendingError || `Failed to load certificate pending page: ${status}`
    }
  );
}

export async function fetchRefundAccountReviewPage(params?: { pageIndex?: number; searchKeyword?: string; verificationStatus?: string; payoutStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.verificationStatus) search.set("verificationStatus", params.verificationStatus);
  if (params?.payoutStatus) search.set("payoutStatus", params.payoutStatus);
  return fetchLocalizedPageData<RefundAccountReviewPagePayload>(
    "/admin/payment/virtual_issue/page-data",
    "/en/admin/payment/virtual_issue/page-data",
    {
      query: search.toString(),
      fallbackMessage: "Failed to load refund account review page",
      resolveError: (body, status) => body.refundAccountReviewError || `Failed to load refund account review page: ${status}`
    }
  );
}

export async function fetchCertificateObjectionListPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; priority?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.priority) search.set("priority", params.priority);
  return fetchLocalizedPageData<CertificateObjectionListPagePayload>(
    "/admin/certificate/objection_list/page-data",
    "/en/admin/certificate/objection_list/page-data",
    {
      query: search.toString(),
      fallbackMessage: "Failed to load certificate objection list page",
      resolveError: (body, status) => body.certificateObjectionError || `Failed to load certificate objection list page: ${status}`
    }
  );
}

export async function fetchCertificateReviewPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; certificateType?: string; applicationId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.certificateType) search.set("certificateType", params.certificateType);
  if (params?.applicationId) search.set("applicationId", params.applicationId);
  return fetchLocalizedPageData<CertificateReviewPagePayload>(
    "/admin/certificate/review/page-data",
    "/en/admin/certificate/review/page-data",
    {
      query: search.toString(),
      fallbackMessage: "Failed to load certificate review page",
      resolveError: (body, status) => body.certificateReviewError || `Failed to load certificate review page: ${status}`
    }
  );
}

export async function fetchMemberStatsPage() {
  return fetchLocalizedPageData<MemberStatsPagePayload>(
    "/admin/member/stats/page-data",
    "/en/admin/member/stats/page-data",
    { fallbackMessage: "Failed to load member stats page" }
  );
}

export async function fetchMemberRegisterPage() {
  return fetchLocalizedPageData<MemberRegisterPagePayload>(
    "/admin/member/register/page-data",
    "/en/admin/member/register/page-data",
    { fallbackMessage: "Failed to load member register page" }
  );
}

export async function fetchSystemCodePage(detailCodeId?: string) {
  const query = detailCodeId ? `detailCodeId=${encodeURIComponent(detailCodeId)}` : "";
  return fetchLocalizedPageData<SystemCodePagePayload>(
    "/admin/system/code/page-data",
    "/en/admin/system/code/page-data",
    {
      query,
      fallbackMessage: "Failed to load system code page",
      resolveError: (body, status) => body.codeMgmtError || `Failed to load system code page: ${status}`
    }
  );
}
