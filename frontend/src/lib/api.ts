import { getCsrfMeta } from "./runtime";

export type FrontendSession = {
  authenticated: boolean;
  userId: string;
  authorCode: string;
  insttId: string;
  companyScope: string;
  csrfToken: string;
  csrfHeaderName: string;
  featureCodes: string[];
  capabilityCodes: string[];
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  const text = await response.text();
  const compact = text.replace(/\s+/g, " ").trim();
  throw new Error(compact.startsWith("<!DOCTYPE") || compact.startsWith("<html")
    ? `Server returned HTML instead of JSON (${response.status})`
    : (compact || `Unexpected response format (${response.status})`));
}

function buildCsrfHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extraHeaders || {}) };
  const { token, headerName } = getCsrfMeta();
  if (token) {
    headers[headerName] = token;
  }
  return headers;
}

export type AuthGroupOption = {
  code: string;
  name: string;
};

export type AuthorGroup = {
  authorCode: string;
  authorNm: string;
  authorDc: string;
};

export type FeatureCatalogItem = {
  featureCode: string;
  featureNm: string;
  featureDc: string;
};

export type FeatureCatalogSection = {
  menuCode: string;
  menuNm: string;
  menuNmEn: string;
  menuUrl: string;
  features: FeatureCatalogItem[];
};

export type AuthGroupPagePayload = {
  isEn: boolean;
  currentUserId: string;
  isWebmaster: boolean;
  filteredAuthorGroups: AuthorGroup[];
  featureSections: FeatureCatalogSection[];
  roleCategoryOptions: AuthGroupOption[];
  selectedRoleCategory: string;
  selectedAuthorCode: string;
  selectedAuthorName: string;
  selectedFeatureCodes: string[];
  authorGroupCount: number;
  featureCount: number;
  pageCount: number;
  canManageScopedAuthorityGroups: boolean;
  authGroupCompanyOptions: Array<{ insttId: string; cmpnyNm: string }>;
  authGroupSelectedInsttId: string;
  authGroupError: string;
};

export type AdminRoleAssignment = {
  emplyrId: string;
  userNm: string;
  orgnztId: string;
  authorCode: string;
  authorNm: string;
  emplyrSttusCode: string;
};

export type AuthChangePagePayload = {
  isEn: boolean;
  currentUserId: string;
  isWebmaster: boolean;
  roleAssignments: AdminRoleAssignment[];
  authorGroups: AuthorGroup[];
  assignmentCount: number;
  authChangeUpdated: boolean;
  authChangeTargetUserId: string;
  authChangeMessage: string;
  authChangeError: string;
};

export type DeptRolePagePayload = {
  isEn: boolean;
  deptRoleUpdated: boolean;
  deptRoleTargetInsttId: string;
  deptRoleMessage: string;
  deptRoleError: string;
  currentUserId: string;
  isWebmaster: boolean;
  canManageAllCompanies: boolean;
  canManageOwnCompany: boolean;
  departmentMappings: Array<Record<string, string>>;
  departmentAuthorGroups: AuthorGroup[];
  memberAssignableAuthorGroups: AuthorGroup[];
  departmentCompanyOptions: Array<{ insttId: string; cmpnyNm: string }>;
  selectedInsttId: string;
  companyMembers: Array<{
    userId: string;
    userNm: string;
    deptNm: string;
    authorCode: string;
    authorNm: string;
  }>;
  companyMemberCount: number;
  mappingCount: number;
};

export type MemberEditPagePayload = Record<string, unknown> & {
  member?: {
    entrprsmberId: string;
    applcntNm: string;
    applcntEmailAdres: string;
    zip: string;
    adres: string;
    detailAdres: string;
    marketingYn: string;
    deptNm: string;
  };
  phoneNumber?: string;
  memberTypeOptions?: Array<{ code: string; label: string }>;
  memberStatusOptions?: Array<{ code: string; label: string }>;
  permissionAuthorGroups?: AuthorGroup[];
  permissionFeatureSections?: FeatureCatalogSection[];
  permissionSelectedAuthorCode?: string;
  permissionEffectiveFeatureCodes?: string[];
  member_editError?: string;
  member_editUpdated?: boolean;
  canViewMemberEdit?: boolean;
  canUseMemberSave?: boolean;
};

export type PasswordResetPagePayload = Record<string, unknown> & {
  passwordResetHistoryList?: Array<Record<string, string>>;
  totalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  resetSource?: string;
  passwordResetError?: string;
  canViewResetHistory?: boolean;
  canUseResetPassword?: boolean;
};

export type AdminPermissionPagePayload = Record<string, unknown> & {
  adminPermissionTarget?: {
    emplyrId: string;
    userNm: string;
    emailAdres: string;
    insttId: string;
    esntlId: string;
  };
  permissionAuthorGroups?: AuthorGroup[];
  permissionFeatureSections?: FeatureCatalogSection[];
  permissionSelectedAuthorCode?: string;
  permissionEffectiveFeatureCodes?: string[];
  adminPermissionError?: string;
  adminPermissionUpdated?: boolean;
  canViewAdminPermissionEdit?: boolean;
  canUseAdminPermissionSave?: boolean;
};

export type CompanySearchPayload = {
  list: Array<{
    insttId: string;
    cmpnyNm: string;
    bizrno: string;
    cxfc: string;
    joinStat: string;
    entrprsSeCode: string;
  }>;
  totalCnt: number;
  page: number;
  size: number;
  totalPages: number;
};

export type AdminAccountCreatePagePayload = Record<string, unknown> & {
  currentUserId?: string;
  adminAccountCreatePreset?: string;
  adminAccountCreatePresetAuthorCodes?: Record<string, string>;
  adminAccountCreatePresetFeatureCodes?: Record<string, string[]>;
  permissionFeatureSections?: FeatureCatalogSection[];
  permissionFeatureCount?: number;
  permissionPageCount?: number;
  adminAccountCreateError?: string;
  canViewAdminAccountCreate?: boolean;
  canUseAdminAccountCreate?: boolean;
};

export type CompanyAccountPagePayload = Record<string, unknown> & {
  companyAccountForm?: {
    insttId?: string;
    entrprsSeCode?: string;
    insttNm?: string;
    reprsntNm?: string;
    bizrno?: string;
    zip?: string;
    adres?: string;
    detailAdres?: string;
    chargerNm?: string;
    chargerEmail?: string;
    chargerTel?: string;
  };
  companyAccountFiles?: Array<{
    fileId?: string;
    orignlFileNm?: string;
    fileMg?: number;
  }>;
  companyAccountErrors?: string[];
  companyAccountSaved?: boolean;
  canViewCompanyAccount?: boolean;
  canUseCompanyAccountSave?: boolean;
  isEditMode?: boolean;
};

export type AdminListPagePayload = Record<string, unknown> & {
  member_list?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  sbscrbSttus?: string;
  canViewAdminList?: boolean;
  canUseAdminListActions?: boolean;
};

export type CompanyListPagePayload = Record<string, unknown> & {
  company_list?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  sbscrbSttus?: string;
  company_listError?: string;
  canViewCompanyList?: boolean;
  canUseCompanyListActions?: boolean;
};

export type MemberApprovePagePayload = Record<string, unknown> & {
  approvalRows?: Array<Record<string, unknown>>;
  memberApprovalTotalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  membershipType?: string;
  sbscrbSttus?: string;
  memberApprovalError?: string;
  memberApprovalResultMessage?: string;
  canViewMemberApprove?: boolean;
  canUseMemberApproveAction?: boolean;
};

export type CompanyApprovePagePayload = Record<string, unknown> & {
  approvalRows?: Array<Record<string, unknown>>;
  memberApprovalTotalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  sbscrbSttus?: string;
  memberApprovalError?: string;
  memberApprovalResultMessage?: string;
  canViewCompanyApprove?: boolean;
  canUseCompanyApproveAction?: boolean;
};

export type MemberListPagePayload = Record<string, unknown> & {
  member_list?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  membershipType?: string;
  sbscrbSttus?: string;
  member_listError?: string;
  canViewMemberList?: boolean;
  canUseMemberListActions?: boolean;
};

export type MemberDetailPagePayload = Record<string, unknown> & {
  member?: Record<string, unknown>;
  membershipTypeLabel?: string;
  statusLabel?: string;
  statusBadgeClass?: string;
  phoneNumber?: string;
  passwordResetHistoryRows?: Array<Record<string, string>>;
  latestPasswordResetAt?: string;
  latestPasswordResetBy?: string;
  member_detailError?: string;
  canViewMemberDetail?: boolean;
  canUseMemberEditLink?: boolean;
};

export type CompanyDetailPagePayload = Record<string, unknown> & {
  company?: Record<string, unknown>;
  companyFiles?: Array<Record<string, unknown>>;
  companyStatusLabel?: string;
  companyStatusBadgeClass?: string;
  companyTypeLabel?: string;
  companyDetailError?: string;
  canViewCompanyDetail?: boolean;
  canUseCompanyEditLink?: boolean;
};

export type JoinCompanyRegisterPagePayload = Record<string, unknown> & {
  membershipType?: string;
  canViewCompanyRegister?: boolean;
  canUseCompanyRegister?: boolean;
};

export type JoinCompanyStatusDetailPayload = {
  success: boolean;
  message?: string;
  result?: Record<string, unknown>;
  insttFiles?: Array<Record<string, unknown>>;
};

export type JoinCompanyReapplyPagePayload = {
  success: boolean;
  message?: string;
  result?: Record<string, unknown>;
  insttFiles?: Array<Record<string, unknown>>;
};

export type JoinSessionPayload = {
  step: number;
  joinVO: Record<string, unknown>;
  verifiedIdentity: boolean;
  requiredSessionReady: boolean;
  membershipType: string;
  canViewStep1: boolean;
  canViewStep2: boolean;
  canViewStep3: boolean;
  canViewStep4: boolean;
};

export type MypagePayload = Record<string, unknown> & {
  authenticated?: boolean;
  redirectUrl?: string;
  pageType?: string;
  userId?: string;
  companyName?: string;
  pendingStatus?: string;
  submittedAt?: string;
  rejectionReason?: string;
  rejectionProcessedAt?: string;
  member?: Record<string, unknown>;
};

export type MypageSectionItem = {
  label: string;
  value: string;
};

export type MypageSectionPayload = MypagePayload & {
  section?: string;
  sectionTitle?: string;
  canViewSection?: boolean;
  canUseSection?: boolean;
  sectionReason?: string;
  items?: MypageSectionItem[];
  passwordHistory?: Array<Record<string, string>>;
  saved?: boolean;
  message?: string;
};

export async function fetchFrontendSession(): Promise<FrontendSession> {
  const response = await fetch("/api/frontend/session", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to load session: ${response.status}`);
  }

  return response.json();
}

export async function fetchAuthGroupPage(params: {
  authorCode?: string;
  roleCategory?: string;
  insttId?: string;
  userSearchKeyword?: string;
}): Promise<AuthGroupPagePayload> {
  const search = new URLSearchParams();
  if (params.authorCode) search.set("authorCode", params.authorCode);
  if (params.roleCategory) search.set("roleCategory", params.roleCategory);
  if (params.insttId) search.set("insttId", params.insttId);
  if (params.userSearchKeyword) search.set("userSearchKeyword", params.userSearchKeyword);
  const query = search.toString();
  const response = await fetch(`/api/admin/auth-groups/page${query ? `?${query}` : ""}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to load auth-group page: ${response.status}`);
  }

  return response.json();
}

export async function fetchAuthChangePage(): Promise<AuthChangePagePayload> {
  const response = await fetch("/api/admin/auth-change/page", {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load auth-change page: ${response.status}`);
  }
  return response.json();
}

export async function fetchDeptRolePage(insttId?: string): Promise<DeptRolePagePayload> {
  const query = insttId ? `?insttId=${encodeURIComponent(insttId)}` : "";
  const response = await fetch(`/api/admin/dept-role-mapping/page${query}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load dept-role page: ${response.status}`);
  }
  return response.json();
}

export async function fetchMemberEditPage(memberId: string): Promise<MemberEditPagePayload> {
  const response = await fetch(`/api/admin/member/edit?memberId=${encodeURIComponent(memberId)}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load member edit page: ${response.status}`);
  }
  return response.json();
}

export async function fetchPasswordResetPage(params?: { memberId?: string; pageIndex?: number; searchKeyword?: string; resetSource?: string; }) {
  const search = new URLSearchParams();
  if (params?.memberId) search.set("memberId", params.memberId);
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.resetSource) search.set("resetSource", params.resetSource);
  const response = await fetch(`/api/admin/member/reset-password${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load password reset page: ${response.status}`);
  return response.json() as Promise<PasswordResetPagePayload>;
}

export async function fetchAdminPermissionPage(emplyrId: string) {
  const response = await fetch(`/api/admin/member/admin-account/permissions?emplyrId=${encodeURIComponent(emplyrId)}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load admin permission page: ${response.status}`);
  return response.json() as Promise<AdminPermissionPagePayload>;
}

export async function fetchAdminAccountCreatePage() {
  const response = await fetch("/api/admin/member/admin-account/page", {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load admin account create page: ${response.status}`);
  return response.json() as Promise<AdminAccountCreatePagePayload>;
}

export async function checkAdminAccountId(adminId: string) {
  const response = await fetch(`/api/admin/member/admin-account/check-id?adminId=${encodeURIComponent(adminId)}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || `Failed to check admin ID: ${response.status}`);
  }
  return body as { valid: boolean; duplicated: boolean; message: string; };
}

export async function searchAdminCompanies(params: { keyword: string; page?: number; size?: number; status?: string; }) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  const response = await fetch(`/api/admin/companies/search?${search.toString()}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to search companies: ${response.status}`);
  return response.json() as Promise<CompanySearchPayload>;
}

export async function searchJoinCompanies(params: { keyword: string; page?: number; size?: number; status?: string; }) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  const response = await fetch(`/join/searchCompany?${search.toString()}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to search join companies: ${response.status}`);
  return response.json() as Promise<CompanySearchPayload>;
}

export async function checkJoinMemberId(mberId: string) {
  const response = await fetch(`/join/checkId?mberId=${encodeURIComponent(mberId)}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to check join member ID: ${response.status}`);
  }
  const body = await response.json() as { isDuplicated?: boolean; duplicated?: boolean };
  return {
    isDuplicated: Boolean(body.isDuplicated ?? body.duplicated)
  };
}

export async function checkJoinEmail(email: string) {
  const response = await fetch(`/join/checkEmail?email=${encodeURIComponent(email)}`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to check join email: ${response.status}`);
  }
  const body = await response.json() as { isDuplicated?: boolean; duplicated?: boolean };
  return {
    isDuplicated: Boolean(body.isDuplicated ?? body.duplicated)
  };
}

export async function fetchCompanyAccountPage(insttId?: string) {
  const query = insttId ? `?insttId=${encodeURIComponent(insttId)}` : "";
  const response = await fetch(`/api/admin/member/company-account/page${query}`, {
    credentials: "include"
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.companyAccountErrors?.[0] || `Failed to load company account page: ${response.status}`);
  }
  return response.json() as Promise<CompanyAccountPagePayload>;
}

export async function fetchAdminListPage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const response = await fetch(`/api/admin/member/admin-list/page${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load admin list page: ${response.status}`);
  return response.json() as Promise<AdminListPagePayload>;
}

export async function fetchCompanyListPage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const response = await fetch(`/api/admin/member/company-list/page${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.company_listError || `Failed to load company list page: ${response.status}`);
  return body as CompanyListPagePayload;
}

export async function fetchMemberApprovePage(params?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; result?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.membershipType) search.set("membershipType", params.membershipType);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  if (params?.result) search.set("result", params.result);
  const response = await fetch(`/api/admin/member/approve/page${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.memberApprovalError || `Failed to load member approval page: ${response.status}`);
  return body as MemberApprovePagePayload;
}

export async function fetchCompanyApprovePage(params?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; result?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  if (params?.result) search.set("result", params.result);
  const response = await fetch(`/api/admin/member/company-approve/page${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.memberApprovalError || `Failed to load company approval page: ${response.status}`);
  return body as CompanyApprovePagePayload;
}

export async function fetchMemberListPage(params?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.membershipType) search.set("membershipType", params.membershipType);
  if (params?.sbscrbSttus) search.set("sbscrbSttus", params.sbscrbSttus);
  const response = await fetch(`/api/admin/member/list/page${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load member list page: ${response.status}`);
  return response.json() as Promise<MemberListPagePayload>;
}

export async function fetchMemberDetailPage(memberId: string) {
  const response = await fetch(`/api/admin/member/detail/page?memberId=${encodeURIComponent(memberId)}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.member_detailError || `Failed to load member detail page: ${response.status}`);
  return body as MemberDetailPagePayload;
}

export async function fetchCompanyDetailPage(insttId: string) {
  const response = await fetch(`/api/admin/member/company-detail/page?insttId=${encodeURIComponent(insttId)}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.companyDetailError || `Failed to load company detail page: ${response.status}`);
  return body as CompanyDetailPagePayload;
}

export async function fetchJoinCompanyRegisterPage() {
  const response = await fetch("/join/api/company-register/page", {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load join company register page: ${response.status}`);
  return response.json() as Promise<JoinCompanyRegisterPagePayload>;
}

export async function fetchJoinSession() {
  const response = await fetch("/join/api/session", {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load join session: ${response.status}`);
  return readJsonResponse<JoinSessionPayload>(response);
}

export async function fetchMypage(en = false) {
  const response = await fetch(en ? "/api/en/mypage" : "/api/mypage", {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage: ${response.status}`);
  }
  return body as MypagePayload;
}

export async function fetchMypageSection(section: string, en = false) {
  const response = await fetch(en ? `/api/en/mypage/section/${encodeURIComponent(section)}` : `/api/mypage/section/${encodeURIComponent(section)}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage section: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageMarketing(session: FrontendSession, marketingYn: string, en = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/marketing" : "/api/mypage/marketing", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams({ marketingYn }).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save marketing setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageProfile(
  session: FrontendSession,
  payload: { zip: string; address: string; detailAddress: string },
  en = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/profile" : "/api/mypage/profile", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams(payload).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save profile setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageCompany(
  session: FrontendSession,
  payload: { companyName: string; representativeName: string; zip: string; address: string; detailAddress: string },
  en = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/company" : "/api/mypage/company", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams(payload).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save company setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageStaff(
  session: FrontendSession,
  payload: { staffName: string; deptNm: string; areaNo: string; middleTelno: string; endTelno: string },
  en = false
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/staff" : "/api/mypage/staff", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams(payload).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save staff setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageEmail(session: FrontendSession, email: string, en = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/email" : "/api/mypage/email", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams({ email }).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save email setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypagePassword(session: FrontendSession, currentPassword: string, newPassword: string, en = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  const response = await fetch(en ? "/api/en/mypage/password" : "/api/mypage/password", {
    method: "POST",
    credentials: "include",
    headers,
    body: new URLSearchParams({ currentPassword, newPassword }).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save password setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function checkCompanyNameDuplicate(agencyName: string) {
  const response = await fetch(`/join/checkCompanyNameDplct?agencyName=${encodeURIComponent(agencyName)}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to check company name: ${response.status}`);
  const body = await response.text();
  return Number(body) > 0;
}

export async function fetchJoinCompanyStatusDetail(params: { bizNo?: string; appNo?: string; repName: string; }) {
  const search = new URLSearchParams();
  if (params.bizNo) search.set("bizNo", params.bizNo);
  if (params.appNo) search.set("appNo", params.appNo);
  search.set("repName", params.repName);
  const response = await fetch(`/join/api/company-status/detail?${search.toString()}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load company status detail: ${response.status}`);
  return body as JoinCompanyStatusDetailPayload;
}

export async function fetchJoinCompanyReapplyPage(params: { bizNo: string; repName: string; }) {
  const search = new URLSearchParams();
  search.set("bizNo", params.bizNo);
  search.set("repName", params.repName);
  const response = await fetch(`/join/api/company-reapply/page?${search.toString()}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load company reapply page: ${response.status}`);
  return body as JoinCompanyReapplyPagePayload;
}

function buildJsonHeaders(session: FrontendSession) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (session.csrfHeaderName && session.csrfToken) {
    headers[session.csrfHeaderName] = session.csrfToken;
  }
  return headers;
}

export async function createAuthGroup(
  session: FrontendSession,
  payload: {
    authorCode: string;
    authorNm: string;
    authorDc: string;
    roleCategory: string;
    insttId?: string;
  }
) {
  const response = await fetch("/api/admin/auth-groups", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to create auth group: ${response.status}`);
  }
  return body;
}

export async function saveAuthGroupFeatures(
  session: FrontendSession,
  payload: {
    authorCode: string;
    roleCategory: string;
    featureCodes: string[];
  }
) {
  const response = await fetch("/api/admin/auth-groups/features", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save auth-group features: ${response.status}`);
  }
  return body;
}

export async function saveAdminAuthChange(
  session: FrontendSession,
  payload: {
    emplyrId: string;
    authorCode: string;
  }
) {
  const response = await fetch("/api/admin/auth-change/save", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save auth change: ${response.status}`);
  }
  return body;
}

export async function saveDeptRoleMapping(
  session: FrontendSession,
  payload: {
    insttId: string;
    cmpnyNm: string;
    deptNm: string;
    authorCode: string;
  }
) {
  const response = await fetch("/api/admin/dept-role-mapping/save", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save dept mapping: ${response.status}`);
  }
  return body;
}

export async function saveDeptRoleMember(
  session: FrontendSession,
  payload: {
    insttId: string;
    entrprsMberId: string;
    authorCode: string;
  }
) {
  const response = await fetch("/api/admin/dept-role-mapping/member-save", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save dept member role: ${response.status}`);
  }
  return body;
}

export async function saveMemberEdit(
  session: FrontendSession,
  payload: {
    memberId: string;
    applcntNm: string;
    applcntEmailAdres: string;
    phoneNumber: string;
    entrprsSeCode: string;
    entrprsMberSttus: string;
    authorCode: string;
    featureCodes: string[];
    zip: string;
    adres: string;
    detailAdres: string;
    marketingYn: string;
    deptNm: string;
  }
) {
  const response = await fetch("/api/admin/member/edit", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member edit: ${response.status}`));
  }
  return body;
}

export async function resetMemberPasswordAction(session: FrontendSession, memberId: string) {
  const form = new URLSearchParams();
  form.set("memberId", memberId);
  const headers = buildJsonHeaders(session);
  delete headers["Content-Type"];
  const response = await fetch("/admin/member/reset_password", {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  const body = await response.json();
  if (!response.ok || body.status !== "success") {
    throw new Error(body.errors || `Failed to reset password: ${response.status}`);
  }
  return body;
}

export async function saveAdminPermission(session: FrontendSession, payload: { emplyrId: string; authorCode: string; featureCodes: string[]; }) {
  const response = await fetch("/api/admin/member/admin-account/permissions", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save admin permission: ${response.status}`));
  }
  return body;
}

export async function createAdminAccount(
  session: FrontendSession,
  payload: {
    rolePreset: string;
    adminId: string;
    adminName: string;
    password: string;
    passwordConfirm: string;
    adminEmail: string;
    phone1: string;
    phone2: string;
    phone3: string;
    deptNm: string;
    insttId: string;
    featureCodes: string[];
  }
) {
  const response = await fetch("/api/admin/member/admin-account", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to create admin account: ${response.status}`));
  }
  return body;
}

export async function saveCompanyAccount(
  session: FrontendSession,
  payload: {
    insttId?: string;
    membershipType: string;
    agencyName: string;
    representativeName: string;
    bizRegistrationNumber: string;
    zipCode: string;
    companyAddress: string;
    companyAddressDetail?: string;
    chargerName: string;
    chargerEmail: string;
    chargerTel: string;
    fileUploads: File[];
  }
) {
  const form = new FormData();
  if (payload.insttId) form.set("insttId", payload.insttId);
  form.set("membershipType", payload.membershipType);
  form.set("agencyName", payload.agencyName);
  form.set("representativeName", payload.representativeName);
  form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const headers = buildJsonHeaders(session);
  delete headers["Content-Type"];
  const response = await fetch("/api/admin/member/company-account", {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save company account: ${response.status}`));
  }
  return body;
}

export async function submitMemberApproveAction(
  session: FrontendSession,
  payload: { action: string; memberId?: string; selectedIds?: string[]; }
) {
  const response = await fetch("/api/admin/member/approve/action", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve member: ${response.status}`);
  }
  return body;
}

export async function submitCompanyApproveAction(
  session: FrontendSession,
  payload: { action: string; insttId?: string; selectedIds?: string[]; }
) {
  const response = await fetch("/api/admin/member/company-approve/action", {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve company: ${response.status}`);
  }
  return body;
}

export async function submitJoinCompanyRegister(payload: {
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail?: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
  lang?: string;
  fileUploads: File[];
}) {
  const form = new FormData();
  form.set("agencyName", payload.agencyName);
  form.set("representativeName", payload.representativeName);
  form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  form.set("lang", payload.lang || "ko");
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const response = await fetch("/join/api/company-register", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to submit company register: ${response.status}`);
  return body;
}

export async function resetJoinSession() {
  const response = await fetch("/join/api/reset", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders()
  });
  if (!response.ok) throw new Error(`Failed to reset join session: ${response.status}`);
  return readJsonResponse<{ success: boolean }>(response);
}

export async function saveJoinStep1(membershipType: string) {
  const form = new URLSearchParams();
  form.set("membership_type", membershipType);
  const response = await fetch("/join/api/step1", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step1: ${response.status}`);
  return body;
}

export async function saveJoinStep2(marketingYn: string) {
  const form = new URLSearchParams();
  form.set("marketing_yn", marketingYn);
  const response = await fetch("/join/api/step2", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step2: ${response.status}`);
  return body;
}

export async function saveJoinStep3(authMethod: string) {
  const form = new URLSearchParams();
  form.set("auth_method", authMethod);
  const response = await fetch("/join/api/step3", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step3: ${response.status}`);
  return body;
}

export async function submitJoinStep4(payload: {
  mberId: string;
  password: string;
  mberNm: string;
  insttNm: string;
  insttId: string;
  representativeName: string;
  bizrno: string;
  zip: string;
  adres: string;
  detailAdres?: string;
  deptNm?: string;
  moblphonNo1: string;
  moblphonNo2: string;
  moblphonNo3: string;
  applcntEmailAdres: string;
  fileUploads: File[];
}) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "fileUploads") return;
    form.set(key, String(value ?? ""));
  });
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));
  const response = await fetch("/join/api/step4/submit", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to submit join step4: ${response.status}`);
  return body;
}

export async function submitJoinCompanyReapply(payload: {
  insttId: string;
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail?: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
  fileUploads: File[];
}) {
  const form = new FormData();
  form.set("insttId", payload.insttId);
  form.set("agencyName", payload.agencyName);
  form.set("representativeName", payload.representativeName);
  form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const response = await fetch("/join/api/company-reapply", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to submit company reapply: ${response.status}`);
  return body;
}
