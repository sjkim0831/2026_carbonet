import { buildAdminApiPath, readJsonResponse } from "./core";
import { buildPageCacheKey, fetchCachedJson, fetchJsonWithoutCache } from "./pageCache";
import type {
  AdminAccountCreatePagePayload,
  AdminListPagePayload,
  AdminPermissionPagePayload,
  AuthChangeHistoryRow,
  AuthChangePagePayload,
  AuthGroupPagePayload,
  CertificateApprovePagePayload,
  CompanyAccountPagePayload,
  CompanyApprovePagePayload,
  CompanyDetailPagePayload,
  CompanyListPagePayload,
  CompanySearchPayload,
  DeptRolePagePayload,
  MemberApprovePagePayload,
  MemberDetailPagePayload,
  MemberEditPagePayload,
  MemberListPagePayload
} from "./client";

type DuplicateCheckResponse = {
  valid?: boolean;
  duplicated?: boolean;
  message?: string;
};

async function checkIdentifierAvailability(
  url: string,
  fallbackMessage: string
): Promise<{ valid: boolean; duplicated: boolean; message: string }> {
  const response = await fetch(url, {
    credentials: "include"
  });
  const body = await readJsonResponse<DuplicateCheckResponse>(response);
  if (!response.ok) {
    throw new Error(body.message || `${fallbackMessage}: ${response.status}`);
  }
  return {
    valid: Boolean(body.valid),
    duplicated: Boolean(body.duplicated),
    message: String(body.message || "")
  };
}

async function searchCompanyDirectory(
  url: string,
  fallbackMessage: string
): Promise<CompanySearchPayload> {
  const response = await fetch(url, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.status}`);
  }
  return response.json() as Promise<CompanySearchPayload>;
}

export async function fetchAuthGroupPage(params: {
  authorCode?: string;
  roleCategory?: string;
  insttId?: string;
  menuCode?: string;
  featureCode?: string;
  userSearchKeyword?: string;
}): Promise<AuthGroupPagePayload> {
  const search = new URLSearchParams();
  if (params.authorCode) search.set("authorCode", params.authorCode);
  if (params.roleCategory) search.set("roleCategory", params.roleCategory);
  if (params.insttId) search.set("insttId", params.insttId);
  if (params.menuCode) search.set("menuCode", params.menuCode);
  if (params.featureCode) search.set("featureCode", params.featureCode);
  if (params.userSearchKeyword) search.set("userSearchKeyword", params.userSearchKeyword);
  const query = search.toString();
  return fetchCachedJson<AuthGroupPagePayload>({
    cacheKey: buildPageCacheKey(`auth-groups/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/auth-groups/page")}${query ? `?${query}` : ""}`,
    mapError: (_body, status) => `Failed to load auth-group page: ${status}`
  });
}

export async function fetchAuthChangePage(params?: { searchKeyword?: string; pageIndex?: number }): Promise<AuthChangePagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.pageIndex && params.pageIndex > 1) search.set("pageIndex", String(params.pageIndex));
  const query = search.toString() ? `?${search.toString()}` : "";
  return fetchCachedJson<AuthChangePagePayload>({
    cacheKey: buildPageCacheKey(`auth-change/page${query}`),
    url: `${buildAdminApiPath("/api/admin/auth-change/page")}${query}`,
    mapError: (_body, status) => `Failed to load auth-change page: ${status}`
  });
}

export async function fetchAuthChangeHistory(): Promise<AuthChangeHistoryRow[]> {
  const response = await fetchCachedJson<{ items?: AuthChangeHistoryRow[] }>({
    cacheKey: buildPageCacheKey("auth-change/history"),
    url: buildAdminApiPath("/api/admin/auth-change/history"),
    mapError: (_body, status) => `Failed to load auth-change history: ${status}`
  });
  return Array.isArray(response.items) ? response.items : [];
}

export async function fetchDeptRolePage(params?: {
  insttId?: string;
  memberSearchKeyword?: string;
  memberPageIndex?: number;
}): Promise<DeptRolePagePayload> {
  const search = new URLSearchParams();
  if (params?.insttId) search.set("insttId", params.insttId);
  if (params?.memberSearchKeyword) search.set("memberSearchKeyword", params.memberSearchKeyword);
  if (params?.memberPageIndex && params.memberPageIndex > 1) search.set("memberPageIndex", String(params.memberPageIndex));
  const query = search.toString() ? `?${search.toString()}` : "";
  return fetchCachedJson<DeptRolePagePayload>({
    cacheKey: buildPageCacheKey(`dept-role/page${query}`),
    url: `${buildAdminApiPath("/api/admin/dept-role-mapping/page")}${query}`,
    mapError: (_body, status) => `Failed to load dept-role page: ${status}`
  });
}

export async function fetchMemberEditPage(memberId: string, options?: { updated?: string }): Promise<MemberEditPagePayload> {
  const search = new URLSearchParams();
  search.set("memberId", memberId);
  if (options?.updated) search.set("updated", options.updated);
  return fetchJsonWithoutCache<MemberEditPagePayload>({
    url: `${buildAdminApiPath("/api/admin/member/edit")}?${search.toString()}`,
    mapError: (_body, status) => `Failed to load member edit page: ${status}`
  });
}

export async function fetchAdminPermissionPage(emplyrId: string, options?: { updated?: string; mode?: string }) {
  const search = new URLSearchParams();
  search.set("emplyrId", emplyrId);
  if (options?.updated) search.set("updated", options.updated);
  if (options?.mode) search.set("mode", options.mode);
  const query = search.toString();
  return fetchCachedJson<AdminPermissionPagePayload>({
    cacheKey: buildPageCacheKey(`admin-permission/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/admin-account/permissions")}?${query}`,
    mapError: (_body, status) => `Failed to load admin permission page: ${status}`
  });
}

export async function fetchAdminAccountCreatePage() {
  return fetchCachedJson<AdminAccountCreatePagePayload>({
    cacheKey: buildPageCacheKey("admin-account-create/page"),
    url: buildAdminApiPath("/api/admin/member/admin-account/page"),
    mapError: (_body, status) => `Failed to load admin account create page: ${status}`
  });
}

export async function fetchCompanyAccountPage(insttId?: string, options?: { saved?: string }) {
  const search = new URLSearchParams();
  if (insttId) search.set("insttId", insttId);
  if (options?.saved) search.set("saved", options.saved);
  const query = search.toString();
  return fetchCachedJson<CompanyAccountPagePayload>({
    cacheKey: buildPageCacheKey(`company-account/page${query ? `?${query}` : ""}`),
    url: `${buildAdminApiPath("/api/admin/member/company-account/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.companyAccountErrors?.[0] || `Failed to load company account page: ${status}`
  });
}

export async function fetchAdminListPage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const query = search.toString();
  return fetchCachedJson<AdminListPagePayload>({
    cacheKey: buildPageCacheKey(`admin-list/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/admin-list/page")}${query ? `?${query}` : ""}`,
    mapError: (_body, status) => `Failed to load admin list page: ${status}`
  });
}

export async function fetchCompanyListPage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const query = search.toString();
  return fetchCachedJson<CompanyListPagePayload>({
    cacheKey: buildPageCacheKey(`company-list/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/company-list/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.company_listError || `Failed to load company list page: ${status}`
  });
}

export async function fetchMemberApprovePage(params?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; result?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.membershipType) search.set("membershipType", params.membershipType);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  if (params?.result) search.set("result", params.result);
  const query = search.toString();
  return fetchCachedJson<MemberApprovePagePayload>({
    cacheKey: buildPageCacheKey(`member-approve/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/approve/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.memberApprovalError || `Failed to load member approval page: ${status}`
  });
}

export async function fetchCompanyApprovePage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; result?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  if (params?.result) search.set("result", params.result);
  const query = search.toString();
  return fetchCachedJson<CompanyApprovePagePayload>({
    cacheKey: buildPageCacheKey(`company-approve/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/company-approve/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.memberApprovalError || `Failed to load company approval page: ${status}`
  });
}

export async function fetchCertificateApprovePage(params?: { pageIndex?: number; searchKeyword?: string; requestType?: string; status?: string; result?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.requestType) search.set("requestType", params.requestType);
  if (params?.status) search.set("status", params.status);
  if (params?.result) search.set("result", params.result);
  const query = search.toString();
  return fetchCachedJson<CertificateApprovePagePayload>({
    cacheKey: buildPageCacheKey(`certificate-approve/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/certificate/approve/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.certificateApprovalError || `Failed to load certificate approval page: ${status}`
  });
}

export async function fetchMemberListPage(params?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.membershipType) search.set("membershipType", params.membershipType);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const query = search.toString();
  return fetchCachedJson<MemberListPagePayload>({
    cacheKey: buildPageCacheKey(`member-list/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/list/page")}${query ? `?${query}` : ""}`,
    mapError: (_body, status) => `Failed to load member list page: ${status}`
  });
}

export async function fetchMemberDetailPage(memberId: string) {
  return fetchJsonWithoutCache<MemberDetailPagePayload>({
    url: `${buildAdminApiPath("/api/admin/member/detail/page")}?memberId=${encodeURIComponent(memberId)}`,
    mapError: (body, status) => body.member_detailError || `Failed to load member detail page: ${status}`
  });
}

export async function fetchCompanyDetailPage(insttId: string) {
  return fetchCachedJson<CompanyDetailPagePayload>({
    cacheKey: buildPageCacheKey(`company-detail/page?insttId=${encodeURIComponent(insttId)}`),
    url: `${buildAdminApiPath("/api/admin/member/company-detail/page")}?insttId=${encodeURIComponent(insttId)}`,
    mapError: (body, status) => body.companyDetailError || `Failed to load company detail page: ${status}`
  });
}

export async function checkAdminAccountId(adminId: string) {
  return checkIdentifierAvailability(
    `${buildAdminApiPath("/api/admin/member/admin-account/check-id")}?adminId=${encodeURIComponent(adminId)}`,
    "Failed to check admin ID"
  );
}

export async function searchAdminCompanies(params: {
  keyword: string;
  page?: number;
  size?: number;
  status?: string;
  membershipType?: string;
}) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  if (params.membershipType) search.set("membershipType", params.membershipType);
  return searchCompanyDirectory(
    `${buildAdminApiPath("/api/admin/companies/search")}?${search.toString()}`,
    "Failed to search companies"
  );
}
