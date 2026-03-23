import { tracedFetch } from "../../app/telemetry/fetch";
import type { MigrationPageId } from "../../app/routes/definitions";
import { buildLocalizedPath, getCsrfMeta } from "../navigation/runtime";

const fetch = tracedFetch;

function buildAdminApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/api/admin/")) {
    return buildLocalizedPath(`/admin${normalized}`, `/en/admin${normalized}`);
  }
  if (normalized.startsWith("/api/")) {
    return buildLocalizedPath(normalized, `/en${normalized}`);
  }
  return buildLocalizedPath(`/admin${normalized}`, `/en/admin${normalized}`);
}

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

type MypageContext = {
  authenticated: boolean;
  userId?: string;
  insttId: string;
  redirectUrl?: string;
};

export type AdminMenuLink = {
  text: string;
  tEn: string;
  u: string;
  icon: string;
};

export type AdminMenuGroup = {
  title: string;
  titleEn: string;
  icon: string;
  links: AdminMenuLink[];
};

export type AdminMenuDomain = {
  label: string;
  labelEn: string;
  summary: string;
  groups: AdminMenuGroup[];
};

export type AdminMenuTreePayload = Record<string, AdminMenuDomain>;
export type BootstrappedHomePayload = {
  isLoggedIn: boolean;
  isEn: boolean;
  homeMenu: Array<Record<string, unknown>>;
};

export type SitemapNode = {
  code?: string;
  label?: string;
  url?: string;
  icon?: string;
  children?: SitemapNode[];
};

export type SitemapPagePayload = {
  isEn?: boolean;
  isLoggedIn?: boolean;
  siteMapSections?: SitemapNode[];
};

export type HomeMenuPlaceholderPagePayload = {
  placeholderTitle?: string;
  placeholderTitleEn?: string;
  placeholderCode?: string;
  placeholderUrl?: string;
  placeholderIcon?: string;
  placeholderDescription?: string;
  isLoggedIn?: boolean;
  isEn?: boolean;
};

export type AdminMenuPlaceholderPagePayload = HomeMenuPlaceholderPagePayload;

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

async function buildResilientCsrfHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers = buildCsrfHeaders(extraHeaders);
  const { token } = getCsrfMeta();
  if (token) {
    return headers;
  }
  try {
    const session = await fetchFrontendSession();
    if (session.csrfHeaderName && session.csrfToken) {
      headers[session.csrfHeaderName] = session.csrfToken;
    }
  } catch {
    // Keep request handling deterministic. The server will still reject if no token is available.
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

export type AuthorRoleProfile = {
  authorCode: string;
  displayTitle: string;
  priorityWorks: string[];
  description: string;
  memberEditVisibleYn: string;
  updatedAt?: string;
};

export type FeatureCatalogItem = {
  featureCode: string;
  featureNm: string;
  featureNmEn?: string;
  featureDc: string;
  useAt?: string;
  assignedRoleCount?: number;
  unassignedToRole?: boolean;
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
  generalAuthorGroups?: AuthorGroup[];
  referenceAuthorGroups?: AuthorGroup[];
  featureSections: FeatureCatalogSection[];
  roleCategoryOptions: AuthGroupOption[];
  roleCategories?: Array<Record<string, string>>;
  recommendedRoleSections?: Array<Record<string, unknown>>;
  assignmentAuthorities?: Array<Record<string, string>>;
  selectedRoleCategory: string;
  selectedAuthorCode: string;
  selectedAuthorName: string;
  selectedFeatureCodes: string[];
  authorGroupCount: number;
  featureCount: number;
  catalogFeatureCount: number;
  pageCount: number;
  unassignedFeatureCount: number;
  canManageScopedAuthorityGroups: boolean;
  authGroupCompanyOptions: Array<{ insttId: string; cmpnyNm: string }>;
  authGroupSelectedInsttId: string;
  authGroupDepartmentRows?: Array<Record<string, string>>;
  authGroupDepartmentRoleSummaries?: Array<Record<string, string>>;
  userAuthorityTargets?: Array<Record<string, string>>;
  userSearchKeyword?: string;
  focusedMenuCode?: string;
  focusedFeatureCode?: string;
  selectedAuthorProfile?: AuthorRoleProfile;
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
  recentRoleChangeHistory: Array<{
    changedAt: string;
    changedBy: string;
    targetUserId: string;
    beforeAuthorCode: string;
    beforeAuthorName: string;
    afterAuthorCode: string;
    afterAuthorName: string;
    resultStatus: string;
  }>;
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
  roleProfilesByAuthorCode?: Record<string, AuthorRoleProfile>;
  companyMemberCount: number;
  companyMemberPageIndex?: number;
  companyMemberPageSize?: number;
  companyMemberTotalPages?: number;
  companyMemberSearchKeyword?: string;
  mappingCount: number;
};

export type ScreenBuilderNode = {
  nodeId: string;
  componentId?: string;
  parentNodeId?: string;
  componentType: string;
  slotName?: string;
  sortOrder: number;
  props: Record<string, unknown>;
};

export type ScreenBuilderEventBinding = {
  eventBindingId: string;
  nodeId: string;
  eventName: string;
  actionType: string;
  actionConfig: Record<string, unknown>;
};

export type ScreenBuilderPaletteItem = {
  componentType: string;
  label: string;
  labelEn?: string;
  description?: string;
};

export type ScreenBuilderComponentRegistryItem = {
  componentId: string;
  componentType: string;
  label: string;
  labelEn?: string;
  description?: string;
  status?: string;
  replacementComponentId?: string;
  sourceType?: string;
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  propsTemplate?: Record<string, unknown>;
};

export type ScreenBuilderComponentUsage = {
  usageSource: string;
  usageStatus?: string;
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
  layoutZone?: string;
  instanceKey?: string;
  nodeId?: string;
  componentId: string;
  versionId?: string;
};

export type ScreenBuilderRegistryIssue = {
  nodeId: string;
  componentId?: string;
  componentType: string;
  label: string;
  reason: string;
  replacementComponentId?: string;
};

export type ScreenBuilderComponentPromptSurface = {
  componentId: string;
  componentType: string;
  status?: string;
  replacementComponentId?: string;
  label: string;
  description?: string;
  allowedPropKeys: string[];
  propsTemplate: Record<string, unknown>;
};

export type ScreenBuilderRegistryScanItem = {
  menuCode: string;
  pageId: string;
  menuTitle: string;
  unregisteredCount: number;
  missingCount: number;
  deprecatedCount: number;
};

export type ScreenBuilderAutoReplacePreviewItem = {
  nodeId: string;
  fromComponentId: string;
  toComponentId: string;
  label: string;
};

export type ScreenBuilderVersionSummary = {
  versionId: string;
  versionStatus: string;
  menuCode: string;
  pageId: string;
  templateType: string;
  savedAt: string;
  nodeCount: number;
  eventCount: number;
};

export type ScreenBuilderPagePayload = {
  isEn: boolean;
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
  builderId: string;
  versionId: string;
  versionStatus: string;
  templateType: string;
  componentPalette: ScreenBuilderPaletteItem[];
  componentRegistry: ScreenBuilderComponentRegistryItem[];
  componentTypeOptions?: string[];
  registryDiagnostics?: {
    unregisteredNodes?: ScreenBuilderRegistryIssue[];
    missingNodes?: ScreenBuilderRegistryIssue[];
    deprecatedNodes?: ScreenBuilderRegistryIssue[];
    componentPromptSurface?: ScreenBuilderComponentPromptSurface[];
  };
  nodes: ScreenBuilderNode[];
  events: ScreenBuilderEventBinding[];
  versionHistory?: ScreenBuilderVersionSummary[];
  publishedVersionId?: string;
  publishedSavedAt?: string;
  previewAvailable: boolean;
  screenBuilderMessage?: string;
};

export type ScreenBuilderPreviewPayload = {
  isEn: boolean;
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
  templateType: string;
  versionStatus?: string;
  registryDiagnostics?: {
    unregisteredNodes?: ScreenBuilderRegistryIssue[];
    missingNodes?: ScreenBuilderRegistryIssue[];
    deprecatedNodes?: ScreenBuilderRegistryIssue[];
    componentPromptSurface?: ScreenBuilderComponentPromptSurface[];
  };
  nodes: ScreenBuilderNode[];
  events: ScreenBuilderEventBinding[];
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
  assignedRoleProfile?: AuthorRoleProfile;
  member_editError?: string;
  member_editUpdated?: boolean;
  canViewMemberEdit?: boolean;
  canUseMemberSave?: boolean;
};

export type PasswordResetPagePayload = Record<string, unknown> & {
  passwordResetHistoryList?: Array<Record<string, string>>;
  companyOptions?: Array<Record<string, string>>;
  selectedInsttId?: string;
  canManageAllCompanies?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
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

export type AuditEventSearchPayload = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  items: Array<Record<string, unknown>>;
};

export type TraceEventSearchPayload = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  items: Array<Record<string, unknown>>;
};

export type CodexHistoryPayload = {
  totalCount: number;
  items: Array<Record<string, unknown>>;
};

export type HelpManagementItem = {
  itemId: string;
  title: string;
  body: string;
  anchorSelector: string;
  displayOrder: number;
  activeYn: string;
  placement: string;
  imageUrl: string;
  iconName: string;
  highlightStyle: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type HelpManagementPagePayload = {
  pageId: string;
  source: string;
  title: string;
  summary: string;
  helpVersion: string;
  activeYn: string;
  items: HelpManagementItem[];
};

export type ScreenCommandPageOption = {
  pageId: string;
  label: string;
  routePath: string;
  menuCode: string;
  domainCode: string;
};

export type ScreenCommandSurface = {
  surfaceId: string;
  label: string;
  selector: string;
  componentId: string;
  layoutZone: string;
  eventIds: string[];
  notes: string;
};

export type ScreenCommandEvent = {
  eventId: string;
  label: string;
  eventType: string;
  frontendFunction: string;
  triggerSelector: string;
  apiIds: string[];
  notes: string;
  functionInputs: ScreenCommandFieldSpec[];
  functionOutputs: ScreenCommandFieldSpec[];
  guardConditions: string[];
  sideEffects: string[];
};

export type ScreenCommandApi = {
  apiId: string;
  label: string;
  method: string;
  endpoint: string;
  controllerAction: string;
  controllerActions?: string[];
  serviceMethod: string;
  serviceMethods?: string[];
  mapperQuery: string;
  mapperQueries?: string[];
  relatedTables: string[];
  schemaIds: string[];
  notes: string;
  requestFields: ScreenCommandFieldSpec[];
  responseFields: ScreenCommandFieldSpec[];
  maskingRules: ScreenCommandMaskRule[];
};

function normalizeChainValues(values: string[] | undefined, fallback: string) {
  const normalized = (values || []).map((item) => item.trim()).filter(Boolean);
  if (normalized.length > 0) {
    return normalized;
  }
  return fallback.trim() ? [fallback.trim()] : [];
}

export function getScreenCommandChainValues(
  values: string[] | undefined,
  fallback: string
) {
  return normalizeChainValues(values, fallback);
}

export function getScreenCommandChainText(
  values: string[] | undefined,
  fallback: string,
  separator = " -> "
) {
  const normalized = normalizeChainValues(values, fallback);
  return normalized.length > 0 ? normalized.join(separator) : "-";
}

export type ScreenCommandFieldSpec = {
  fieldId: string;
  type: string;
  required: boolean;
  source: string;
  notes: string;
};

export type ScreenCommandMaskRule = {
  fieldId: string;
  strategy: string;
  notes: string;
};

export type ScreenCommandSchema = {
  schemaId: string;
  label: string;
  tableName: string;
  columns: string[];
  writePatterns: string[];
  notes: string;
};

export type ScreenCommandCodeGroup = {
  codeGroupId: string;
  label: string;
  values: string[];
  notes: string;
};

export type ScreenCommandChangeTarget = {
  targetId: string;
  label: string;
  editableFields: string[];
  notes: string;
};

export type ScreenCommandFeatureRow = {
  menuCode: string;
  menuNm: string;
  menuNmEn: string;
  menuUrl: string;
  featureCode: string;
  featureNm: string;
  featureNmEn: string;
  featureDc: string;
  useAt: string;
};

export type ScreenCommandMenuPermission = {
  menuCode: string;
  menuLookupUrl: string;
  routePath: string;
  requiredViewFeatureCode: string;
  featureCodes: string[];
  featureRows: ScreenCommandFeatureRow[];
  relationTables: string[];
  resolverNotes: string[];
};

export type ScreenCommandPageDetail = ScreenCommandPageOption & {
  summary: string;
  source: string;
  menuLookupUrl: string;
  manifestRegistry?: {
    pageId: string;
    pageName: string;
    routePath: string;
    menuCode: string;
    domainCode: string;
    layoutVersion: string;
    designTokenVersion: string;
    componentCount: number;
    components: Array<Record<string, unknown>>;
  };
  surfaces: ScreenCommandSurface[];
  events: ScreenCommandEvent[];
  apis: ScreenCommandApi[];
  schemas: ScreenCommandSchema[];
  commonCodeGroups: ScreenCommandCodeGroup[];
  menuPermission: ScreenCommandMenuPermission;
  changeTargets: ScreenCommandChangeTarget[];
};

export type ScreenCommandPagePayload = {
  selectedPageId: string;
  pages: ScreenCommandPageOption[];
  page: ScreenCommandPageDetail;
};

export type FullStackGovernanceRegistryEntry = {
  menuCode: string;
  pageId: string;
  menuUrl: string;
  summary: string;
  ownerScope: string;
  notes: string;
  frontendSources: string[];
  componentIds: string[];
  eventIds: string[];
  functionIds: string[];
  parameterSpecs: string[];
  resultSpecs: string[];
  apiIds: string[];
  controllerActions: string[];
  serviceMethods: string[];
  mapperQueries: string[];
  schemaIds: string[];
  tableNames: string[];
  columnNames: string[];
  featureCodes: string[];
  commonCodeGroups: string[];
  tags: string[];
  updatedAt: string;
  source: string;
};

export type FullStackGovernanceAutoCollectRequest = {
  menuCode: string;
  pageId: string;
  menuUrl: string;
  mergeExisting?: boolean;
  save?: boolean;
};

export type SrTicketRow = {
  ticketId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastActionBy: string;
  approvedBy: string;
  approvedAt: string;
  approvalComment: string;
  executionPreparedAt: string;
  executionPreparedBy: string;
  executionStatus: string;
  executionComment: string;
  pageId: string;
  pageLabel: string;
  routePath: string;
  menuCode: string;
  menuLookupUrl: string;
  surfaceId: string;
  surfaceLabel: string;
  eventId: string;
  eventLabel: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  instruction: string;
  technicalContext: string;
  generatedDirection: string;
  commandPrompt: string;
  planRunId: string;
  planStartedAt: string;
  planCompletedAt: string;
  planLogPath: string;
  planStderrPath: string;
  planResultPath: string;
  executionRunId: string;
  executionStartedAt: string;
  executionStartedBy: string;
  executionCompletedAt: string;
  executionCompletedBy: string;
  executionLogPath: string;
  executionStderrPath: string;
  executionDiffPath: string;
  executionChangedFiles: string;
  executionWorktreePath: string;
  backendVerifyLogPath: string;
  backendVerifyStderrPath: string;
  frontendVerifyLogPath: string;
  frontendVerifyStderrPath: string;
  deployLogPath: string;
  deployStderrPath: string;
  backendVerifyExitCode: number | null;
  frontendVerifyExitCode: number | null;
  deployExitCode: number | null;
  deployCommand: string;
  healthCheckStatus: string;
  rollbackStatus: string;
  rollbackLogPath: string;
  rollbackStderrPath: string;
};

export type SrTicketArtifactSummary = {
  artifactType: string;
  label: string;
  filePath: string;
  available: boolean;
};

export type SrTicketArtifactPayload = {
  success: boolean;
  ticketId: string;
  artifactType: string;
  label: string;
  filePath: string;
  available: boolean;
  content: string;
  truncated: boolean;
  message: string;
};

export type SrWorkbenchStackItem = {
  stackItemId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  pageId: string;
  pageLabel: string;
  routePath: string;
  menuCode: string;
  menuLookupUrl: string;
  surfaceId: string;
  surfaceLabel: string;
  selector: string;
  componentId: string;
  eventId: string;
  eventLabel: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  instruction: string;
  technicalContext: string;
  traceId: string;
  requestId: string;
};

export type SrTicketDetailPayload = {
  success: boolean;
  ticket: SrTicketRow;
  availableArtifacts: SrTicketArtifactSummary[];
  reviewSummary?: {
    planStderrSnippet?: string;
    buildStderrSnippet?: string;
    backendVerifySnippet?: string;
    frontendVerifySnippet?: string;
    deploySnippet?: string;
    rollbackSnippet?: string;
  };
};

export type SrWorkbenchPagePayload = {
  selectedPageId: string;
  codexEnabled: boolean;
  codexHistoryFile: string;
  ticketCount: number;
  stackCount: number;
  stackItems: SrWorkbenchStackItem[];
  tickets: SrTicketRow[];
  screenOptions: ScreenCommandPageOption[];
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

export type SystemCodePagePayload = Record<string, unknown> & {
  clCodeList?: Array<Record<string, unknown>>;
  codeList?: Array<Record<string, unknown>>;
  detailCodeList?: Array<Record<string, unknown>>;
  detailCodeId?: string;
  useAtOptions?: string[];
  codeMgmtError?: string;
};

export type FunctionManagementPagePayload = Record<string, unknown> & {
  menuType?: string;
  featurePageOptions?: Array<Record<string, unknown>>;
  featureRows?: Array<Record<string, unknown>>;
  featureTotalCount?: number;
  featureUnassignedCount?: number;
  useAtOptions?: string[];
  searchMenuCode?: string;
  searchKeyword?: string;
  featureMgmtError?: string;
};

export type MenuManagementPagePayload = Record<string, unknown> & {
  menuType?: string;
  menuRows?: Array<Record<string, unknown>>;
  menuTypes?: Array<Record<string, unknown>>;
  groupMenuOptions?: Array<Record<string, string>>;
  iconOptions?: string[];
  useAtOptions?: string[];
  fullStackSummaryRows?: Array<Record<string, unknown>>;
  menuMgmtError?: string;
  menuMgmtMessage?: string;
  menuMgmtGuide?: string;
  siteMapMgmtGuide?: string;
};

export type WbsManagementPagePayload = Record<string, unknown> & {
  menuType?: string;
  scope?: string;
  menuRows?: Array<Record<string, unknown>>;
  wbsRows?: Array<Record<string, unknown>>;
  inventorySummary?: Record<string, unknown>;
  waveSummary?: Array<Record<string, unknown>>;
  statusOptions?: Array<Record<string, string>>;
  timeline?: Record<string, unknown>;
  today?: string;
};

export type PageManagementPagePayload = Record<string, unknown> & {
  pageRows?: Array<Record<string, unknown>>;
  menuType?: string;
  domainOptions?: Array<Record<string, unknown>>;
  iconOptions?: string[];
  useAtOptions?: string[];
  searchKeyword?: string;
  searchUrl?: string;
  pageMgmtError?: string;
  pageMgmtMessage?: string;
  pageMgmtBlockedFeatureLinks?: Array<Record<string, string>>;
};

export type IpWhitelistPagePayload = Record<string, unknown> & {
  ipWhitelistSummary?: Array<Record<string, string>>;
  ipWhitelistRows?: Array<Record<string, string>>;
  ipWhitelistRequestRows?: Array<Record<string, string>>;
  searchIp?: string;
  accessScope?: string;
  status?: string;
};

export type AccessHistoryPagePayload = Record<string, unknown> & {
  accessHistoryList?: Array<Record<string, unknown>>;
  companyOptions?: Array<Record<string, string>>;
  selectedInsttId?: string;
  canViewAccessHistory?: boolean;
  canManageAllCompanies?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  startPage?: number;
  endPage?: number;
  prevPage?: number;
  nextPage?: number;
  searchKeyword?: string;
  accessHistoryError?: string;
  isEn?: boolean;
};

export type ErrorLogPagePayload = Record<string, unknown> & {
  errorLogList?: Array<Record<string, unknown>>;
  companyOptions?: Array<Record<string, string>>;
  sourceTypeOptions?: Array<Record<string, string>>;
  errorTypeOptions?: Array<Record<string, string>>;
  selectedInsttId?: string;
  selectedSourceType?: string;
  selectedErrorType?: string;
  canViewErrorLog?: boolean;
  canManageAllCompanies?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  startPage?: number;
  endPage?: number;
  prevPage?: number;
  nextPage?: number;
  searchKeyword?: string;
  errorLogError?: string;
  isEn?: boolean;
};

export type LoginHistoryPagePayload = Record<string, unknown> & {
  loginHistoryList?: Array<Record<string, unknown>>;
  companyOptions?: Array<Record<string, string>>;
  selectedInsttId?: string;
  canManageAllCompanies?: boolean;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  startPage?: number;
  endPage?: number;
  prevPage?: number;
  nextPage?: number;
  searchKeyword?: string;
  userSe?: string;
  loginResult?: string;
  loginHistoryError?: string;
  isEn?: boolean;
};

export type AdminHomePagePayload = Record<string, unknown> & {
  summaryCards?: Array<Record<string, string>>;
  reviewQueueRows?: Array<Record<string, string>>;
  reviewProgressRows?: Array<Record<string, string>>;
  operationalStatusRows?: Array<Record<string, string>>;
  systemLogs?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type MemberStatsPagePayload = Record<string, unknown> & {
  totalMembers?: number;
  memberTypeStats?: Array<Record<string, string>>;
  monthlySignupStats?: Array<Record<string, string>>;
  regionalDistribution?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type MemberRegisterPagePayload = Record<string, unknown> & {
  memberTypeOptions?: Array<Record<string, string>>;
  permissionOptions?: Array<Record<string, string>>;
  defaultOrganizationName?: string;
  canViewMemberRegister?: boolean;
  canUseMemberRegisterIdCheck?: boolean;
  canUseMemberRegisterOrgSearch?: boolean;
  canUseMemberRegisterSave?: boolean;
  memberRegisterFeatureCodes?: string[];
  isEn?: boolean;
};

export type SecurityPolicyPagePayload = Record<string, unknown> & {
  securityPolicySummary?: Array<Record<string, string>>;
  securityPolicyRows?: Array<Record<string, string>>;
  securityPolicyPlaybooks?: Array<Record<string, string>>;
  menuPermissionDiagnosticSqlDownloadUrl?: string;
  menuPermissionAuthGroupUrl?: string;
  menuPermissionEnvironmentUrl?: string;
  menuPermissionDiagnostics?: {
    generatedAt?: string;
    menuUrlDuplicateCount?: number;
    viewFeatureDuplicateCount?: number;
    cleanupRecommendationCount?: number;
    message?: string;
    duplicatedMenuUrls?: Array<Record<string, string>>;
    duplicatedViewMappings?: Array<Record<string, string>>;
  };
  isEn?: boolean;
};

export type SecurityMonitoringPagePayload = Record<string, unknown> & {
  securityMonitoringCards?: Array<Record<string, string>>;
  securityMonitoringTargets?: Array<Record<string, string>>;
  securityMonitoringIps?: Array<Record<string, string>>;
  securityMonitoringEvents?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type BlocklistPagePayload = Record<string, unknown> & {
  searchKeyword?: string;
  blockType?: string;
  status?: string;
  blocklistSummary?: Array<Record<string, string>>;
  blocklistRows?: Array<Record<string, string>>;
  blocklistReleaseQueue?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type SecurityAuditPagePayload = Record<string, unknown> & {
  securityAuditSummary?: Array<Record<string, string>>;
  securityAuditRows?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type SchedulerManagementPagePayload = Record<string, unknown> & {
  jobStatus?: string;
  executionType?: string;
  schedulerSummary?: Array<Record<string, string>>;
  schedulerJobRows?: Array<Record<string, string>>;
  schedulerNodeRows?: Array<Record<string, string>>;
  schedulerExecutionRows?: Array<Record<string, string>>;
  schedulerPlaybooks?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type CodexProvisionPagePayload = Record<string, unknown> & {
  codexEnabled?: boolean;
  codexApiKeyConfigured?: boolean;
  codexRunnerEnabled?: boolean;
  codexAvailabilityMessage?: string;
  codexSamplePayload?: string;
  codexRuntimeConfig?: {
    runnerEnabled?: boolean;
    repoRoot?: string;
    workspaceRoot?: string;
    runnerHistoryFile?: string;
    planCommandConfigured?: boolean;
    buildCommandConfigured?: boolean;
    deployCommandConfigured?: boolean;
    planCommand?: string;
    buildCommand?: string;
    deployCommand?: string;
    healthCheckUrl?: string;
  };
  srTicketCount?: number;
  srTickets?: SrTicketRow[];
  isEn?: boolean;
};

export type EmissionResultListPagePayload = Record<string, unknown> & {
  emissionResultList?: Array<Record<string, unknown>>;
  totalCount?: number;
  reviewCount?: number;
  verifiedCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  startPage?: number;
  endPage?: number;
  prevPage?: number;
  nextPage?: number;
  searchKeyword?: string;
  resultStatus?: string;
  verificationStatus?: string;
  isEn?: boolean;
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

let frontendSessionCache: FrontendSession | null = null;
let frontendSessionPromise: Promise<FrontendSession> | null = null;
let adminMenuTreeCache: AdminMenuTreePayload | null = null;
let adminMenuTreePromise: Promise<AdminMenuTreePayload> | null = null;
let mypageContextCache: MypageContext | null = null;
let mypageContextPromise: Promise<MypageContext> | null = null;
let joinSessionCache: JoinSessionPayload | null = null;
let joinSessionPromise: Promise<JoinSessionPayload> | null = null;
const SESSION_STORAGE_CACHE_PREFIX = "carbonet:api-cache:v2:";
const FRONTEND_SESSION_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}frontend-session`;
const ADMIN_MENU_TREE_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}admin-menu-tree`;
const ADMIN_MENU_TREE_REFRESH_EVENT = "carbonet:admin-menu-tree:refresh";
const DEFAULT_PAGE_CACHE_TTL_MS = 60 * 1000;
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000;

type SessionStorageCacheEntry<T> = {
  expiresAt: number;
  value: T;
};

function readSessionStorageCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SessionStorageCacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

function writeSessionStorageCache<T>(key: string, value: T, ttlMs: number) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: SessionStorageCacheEntry<T> = {
      expiresAt: Date.now() + ttlMs,
      value
    };
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or serialization errors and keep the runtime path working.
  }
}

function removeSessionStorageCache(key: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore sessionStorage failures.
  }
}

function buildPageCacheKey(path: string) {
  return `${SESSION_STORAGE_CACHE_PREFIX}${path}`;
}

function consumeRuntimeBootstrap<T>(key: "frontendSession" | "adminMenuTree" | "adminHomePageData" | "authGroupPageData" | "deptRolePageData" | "memberEditPageData" | "homePayload" | "mypagePayload" | "mypageContext" | "memberStatsPageData" | "securityPolicyPageData" | "securityMonitoringPageData" | "securityAuditPageData" | "schedulerManagementPageData" | "emissionResultListPageData" | "screenBuilderPageData"): T | null {
  if (typeof window === "undefined" || !window.__CARBONET_REACT_BOOTSTRAP__) {
    return null;
  }
  const payload = window.__CARBONET_REACT_BOOTSTRAP__[key] as T | undefined;
  if (typeof payload === "undefined") {
    return null;
  }
  delete window.__CARBONET_REACT_BOOTSTRAP__[key];
  return payload ?? null;
}

function invalidateAdminPageCaches() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const keysToDelete: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key) {
        continue;
      }
      if (
        key.startsWith(SESSION_STORAGE_CACHE_PREFIX) &&
        key !== FRONTEND_SESSION_STORAGE_KEY &&
        key !== ADMIN_MENU_TREE_STORAGE_KEY
      ) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Ignore cache eviction failures.
  }
}

async function fetchCachedJson<T>(options: {
  cacheKey: string;
  url: string;
  ttlMs?: number;
  mapError?: (body: any, status: number) => string;
}): Promise<T> {
  const cached = readSessionStorageCache<T>(options.cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(options.url, {
    credentials: "include"
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(options.mapError?.(body, response.status) || `Failed to load page: ${response.status}`);
  }
  writeSessionStorageCache(options.cacheKey, body as T, options.ttlMs ?? DEFAULT_PAGE_CACHE_TTL_MS);
  return body as T;
}

export function invalidateFrontendSessionCache() {
  frontendSessionCache = null;
  frontendSessionPromise = null;
  adminMenuTreeCache = null;
  adminMenuTreePromise = null;
  mypageContextCache = null;
  mypageContextPromise = null;
  removeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY);
  removeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY);
}

export function getAdminMenuTreeRefreshEventName() {
  return ADMIN_MENU_TREE_REFRESH_EVENT;
}

export function refreshAdminMenuTree() {
  invalidateFrontendSessionCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_MENU_TREE_REFRESH_EVENT));
  }
}

export function invalidateJoinSessionCache() {
  joinSessionCache = null;
  joinSessionPromise = null;
}

export async function fetchFrontendSession(): Promise<FrontendSession> {
  const bootstrappedSession = consumeRuntimeBootstrap<FrontendSession>("frontendSession");
  if (bootstrappedSession) {
    frontendSessionCache = bootstrappedSession;
    writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, bootstrappedSession, SESSION_CACHE_TTL_MS);
    return bootstrappedSession;
  }

  const storedSession = readSessionStorageCache<FrontendSession>(FRONTEND_SESSION_STORAGE_KEY);
  if (storedSession) {
    frontendSessionCache = storedSession;
  }

  if (frontendSessionCache) {
    return frontendSessionCache;
  }

  if (!frontendSessionPromise) {
    frontendSessionPromise = fetch("/api/frontend/session", {
      credentials: "include"
    })
      .then(async (response: Response) => {
        if (!response.ok) {
          throw new Error(`Failed to load session: ${response.status}`);
        }
        const session = await response.json() as FrontendSession;
        frontendSessionCache = session;
        writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, session, SESSION_CACHE_TTL_MS);
        return session;
      })
      .finally(() => {
        frontendSessionPromise = null;
      });
  }

  if (!frontendSessionPromise) {
    throw new Error("Frontend session promise was not initialized");
  }

  return frontendSessionPromise;
}

export async function fetchSitemapPage(): Promise<SitemapPagePayload> {
  const response = await fetch(buildLocalizedPath("/api/sitemap", "/api/en/sitemap"), {
    credentials: "include"
  });
  return readJsonResponse<SitemapPagePayload>(response);
}

export async function fetchAdminSitemapPage(): Promise<SitemapPagePayload> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/sitemap", "/en/admin/api/admin/content/sitemap"), {
    credentials: "include"
  });
  return readJsonResponse<SitemapPagePayload>(response);
}

export async function fetchHomeMenuPlaceholderPage(requestPath: string): Promise<HomeMenuPlaceholderPagePayload> {
  const query = requestPath ? `?requestPath=${encodeURIComponent(requestPath)}` : "";
  const response = await fetch(`${buildLocalizedPath("/api/home/menu-placeholder", "/api/en/home/menu-placeholder")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<HomeMenuPlaceholderPagePayload>(response);
}

export async function fetchAdminMenuPlaceholderPage(requestPath: string): Promise<AdminMenuPlaceholderPagePayload> {
  const query = requestPath ? `?requestPath=${encodeURIComponent(requestPath)}` : "";
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/menu-placeholder", "/en/admin/api/admin/menu-placeholder")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<AdminMenuPlaceholderPagePayload>(response);
}

async function fetchMypageContext(en = false): Promise<MypageContext> {
  const bootstrappedContext = consumeRuntimeBootstrap<MypageContext>("mypageContext");
  if (bootstrappedContext) {
    mypageContextCache = bootstrappedContext;
    return bootstrappedContext;
  }

  if (mypageContextCache) {
    return mypageContextCache;
  }

  if (!mypageContextPromise) {
    mypageContextPromise = fetch(en ? "/api/en/mypage/context" : "/api/mypage/context", {
      credentials: "include"
    })
      .then((response) => readJsonResponse<MypageContext>(response))
      .then((context) => {
        mypageContextCache = context;
        return context;
      })
      .finally(() => {
        mypageContextPromise = null;
      });
  }

  if (!mypageContextPromise) {
    throw new Error("Mypage context promise was not initialized");
  }

  return mypageContextPromise;
}

function appendInsttId(search: URLSearchParams, insttId?: string) {
  const normalizedInsttId = String(insttId || "").trim();
  if (normalizedInsttId) {
    search.set("instt_id", normalizedInsttId);
  }
  return search;
}

async function buildMypageUrl(path: string) {
  const context = await fetchMypageContext(path.startsWith("/api/en/")).catch(() => null);
  const search = appendInsttId(new URLSearchParams(), context?.insttId);
  return search.toString() ? `${path}?${search.toString()}` : path;
}

export async function fetchAdminMenuTree(): Promise<AdminMenuTreePayload> {
  const bootstrappedMenuTree = consumeRuntimeBootstrap<AdminMenuTreePayload>("adminMenuTree");
  if (bootstrappedMenuTree) {
    adminMenuTreeCache = bootstrappedMenuTree;
    writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, bootstrappedMenuTree, SESSION_CACHE_TTL_MS);
    return bootstrappedMenuTree;
  }

  const storedMenuTree = readSessionStorageCache<AdminMenuTreePayload>(ADMIN_MENU_TREE_STORAGE_KEY);
  if (storedMenuTree) {
    adminMenuTreeCache = storedMenuTree;
  }

  if (adminMenuTreeCache) {
    return adminMenuTreeCache;
  }

  if (!adminMenuTreePromise) {
    adminMenuTreePromise = fetch(buildLocalizedPath("/admin/system/menu-data", "/en/admin/system/menu-data"), {
      credentials: "include"
    })
      .then((response) => readJsonResponse<AdminMenuTreePayload>(response))
      .then((payload) => {
        adminMenuTreeCache = payload;
        writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, payload, SESSION_CACHE_TTL_MS);
        return payload;
      })
      .finally(() => {
        adminMenuTreePromise = null;
      });
  }

  if (!adminMenuTreePromise) {
    throw new Error("Admin menu tree promise was not initialized");
  }

  return adminMenuTreePromise;
}

export function readBootstrappedHomePayload(): BootstrappedHomePayload | null {
  return consumeRuntimeBootstrap<BootstrappedHomePayload>("homePayload");
}

export function readBootstrappedAdminHomePageData(): AdminHomePagePayload | null {
  return consumeRuntimeBootstrap<AdminHomePagePayload>("adminHomePageData");
}

export function readBootstrappedAuthGroupPageData(): AuthGroupPagePayload | null {
  return consumeRuntimeBootstrap<AuthGroupPagePayload>("authGroupPageData");
}

export function readBootstrappedDeptRolePageData(): DeptRolePagePayload | null {
  return consumeRuntimeBootstrap<DeptRolePagePayload>("deptRolePageData");
}

export function readBootstrappedMemberEditPageData(): MemberEditPagePayload | null {
  return consumeRuntimeBootstrap<MemberEditPagePayload>("memberEditPageData");
}

export function readBootstrappedMypagePayload(): MypagePayload | null {
  return consumeRuntimeBootstrap<MypagePayload>("mypagePayload");
}

export function readBootstrappedMemberStatsPageData(): MemberStatsPagePayload | null {
  return consumeRuntimeBootstrap<MemberStatsPagePayload>("memberStatsPageData");
}

export function readBootstrappedSecurityPolicyPageData(): SecurityPolicyPagePayload | null {
  return consumeRuntimeBootstrap<SecurityPolicyPagePayload>("securityPolicyPageData");
}

export function readBootstrappedSecurityMonitoringPageData(): SecurityMonitoringPagePayload | null {
  return consumeRuntimeBootstrap<SecurityMonitoringPagePayload>("securityMonitoringPageData");
}

export function readBootstrappedSecurityAuditPageData(): SecurityAuditPagePayload | null {
  return consumeRuntimeBootstrap<SecurityAuditPagePayload>("securityAuditPageData");
}

export function readBootstrappedSchedulerManagementPageData(): SchedulerManagementPagePayload | null {
  return consumeRuntimeBootstrap<SchedulerManagementPagePayload>("schedulerManagementPageData");
}

export function readBootstrappedEmissionResultListPageData(): EmissionResultListPagePayload | null {
  return consumeRuntimeBootstrap<EmissionResultListPagePayload>("emissionResultListPageData");
}

export function readBootstrappedScreenBuilderPageData(): ScreenBuilderPagePayload | null {
  return consumeRuntimeBootstrap<ScreenBuilderPagePayload>("screenBuilderPageData");
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

export async function fetchAuthChangePage(): Promise<AuthChangePagePayload> {
  return fetchCachedJson<AuthChangePagePayload>({
    cacheKey: buildPageCacheKey("auth-change/page"),
    url: buildAdminApiPath("/api/admin/auth-change/page"),
    mapError: (_body, status) => `Failed to load auth-change page: ${status}`
  });
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
  const query = search.toString();
  return fetchCachedJson<MemberEditPagePayload>({
    cacheKey: buildPageCacheKey(`member-edit/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/member/edit")}?${query}`,
    mapError: (_body, status) => `Failed to load member edit page: ${status}`
  });
}

export function prefetchRoutePageData(route: MigrationPageId, search = ""): Promise<unknown> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  switch (route) {
    case "auth-group":
      return fetchAuthGroupPage({
        authorCode: params.get("authorCode") || "",
        roleCategory: params.get("roleCategory") || "",
        insttId: params.get("insttId") || "",
        menuCode: params.get("menuCode") || "",
        featureCode: params.get("featureCode") || "",
        userSearchKeyword: params.get("userSearchKeyword") || ""
      });
    case "auth-change":
      return fetchAuthChangePage();
    case "dept-role":
      return fetchDeptRolePage({
        insttId: params.get("insttId") || "",
        memberSearchKeyword: params.get("memberSearchKeyword") || "",
        memberPageIndex: params.get("memberPageIndex") ? Number(params.get("memberPageIndex")) : undefined
      });
    case "member-edit": {
      const memberId = params.get("memberId") || "";
      return memberId ? fetchMemberEditPage(memberId, { updated: params.get("updated") || "" }) : Promise.resolve(null);
    }
    case "member-stats":
      return fetchMemberStatsPage();
    case "security-policy":
      return fetchSecurityPolicyPage();
    case "security-monitoring":
      return fetchSecurityMonitoringPage();
    case "security-audit":
      return fetchSecurityAuditPage();
    case "scheduler-management":
      return fetchSchedulerManagementPage({
        jobStatus: params.get("jobStatus") || "",
        executionType: params.get("executionType") || ""
      });
    case "emission-result-list":
      return fetchEmissionResultListPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        resultStatus: params.get("resultStatus") || "",
        verificationStatus: params.get("verificationStatus") || ""
      });
    default:
      return Promise.resolve(null);
  }
}

export async function fetchPasswordResetPage(params?: { memberId?: string; pageIndex?: number; searchKeyword?: string; resetSource?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.memberId) search.set("memberId", params.memberId);
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.resetSource) search.set("resetSource", params.resetSource);
  if (params?.insttId) search.set("insttId", params.insttId);
  const response = await fetch(`${buildAdminApiPath("/api/admin/member/reset-password")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load password reset page: ${response.status}`);
  return response.json() as Promise<PasswordResetPagePayload>;
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

export async function checkAdminAccountId(adminId: string) {
  const response = await fetch(`${buildAdminApiPath("/api/admin/member/admin-account/check-id")}?adminId=${encodeURIComponent(adminId)}`, {
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
  const response = await fetch(`${buildAdminApiPath("/api/admin/companies/search")}?${search.toString()}`, {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to search companies: ${response.status}`);
  return response.json() as Promise<CompanySearchPayload>;
}

export async function searchJoinCompanies(params: { keyword: string; page?: number; size?: number; status?: string; membershipType?: string; }) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  if (params.membershipType) search.set("membershipType", params.membershipType);
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

export async function fetchMemberStatsPage() {
  const response = await fetch(buildLocalizedPath("/admin/member/stats/page-data", "/en/admin/member/stats/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load member stats page: ${response.status}`);
  return body as MemberStatsPagePayload;
}

export async function fetchMemberRegisterPage() {
  const response = await fetch(buildLocalizedPath("/admin/member/register/page-data", "/en/admin/member/register/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load member register page: ${response.status}`);
  return body as MemberRegisterPagePayload;
}

export async function fetchMemberDetailPage(memberId: string) {
  return fetchCachedJson<MemberDetailPagePayload>({
    cacheKey: buildPageCacheKey(`member-detail/page?memberId=${encodeURIComponent(memberId)}`),
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

export async function fetchSystemCodePage(detailCodeId?: string) {
  const query = detailCodeId ? `?detailCodeId=${encodeURIComponent(detailCodeId)}` : "";
  const response = await fetch(buildLocalizedPath(`/admin/system/code/page-data${query}`, `/en/admin/system/code/page-data${query}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.codeMgmtError || `Failed to load system code page: ${response.status}`);
  return body as SystemCodePagePayload;
}

export async function fetchFunctionManagementPage(params?: { menuType?: string; searchMenuCode?: string; searchKeyword?: string; }) {
  const search = new URLSearchParams();
  if (params?.menuType) search.set("menuType", params.menuType);
  if (params?.searchMenuCode) search.set("searchMenuCode", params.searchMenuCode);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/feature-management/page-data${query ? `?${query}` : ""}`, `/en/admin/system/feature-management/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.featureMgmtError || `Failed to load function management page: ${response.status}`);
  return body as FunctionManagementPagePayload;
}

export async function fetchMenuManagementPage(menuType?: string, saved?: string) {
  const search = new URLSearchParams();
  if (menuType) search.set("menuType", menuType);
  if (saved) search.set("saved", saved);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/menu-management/page-data${query ? `?${query}` : ""}`, `/en/admin/system/menu-management/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.menuMgmtError || `Failed to load menu management page: ${response.status}`);
  return body as MenuManagementPagePayload;
}

export async function fetchScreenBuilderPage(params?: {
  menuCode?: string;
  pageId?: string;
  menuTitle?: string;
  menuUrl?: string;
}) {
  const search = new URLSearchParams();
  if (params?.menuCode) search.set("menuCode", params.menuCode);
  if (params?.pageId) search.set("pageId", params.pageId);
  if (params?.menuTitle) search.set("menuTitle", params.menuTitle);
  if (params?.menuUrl) search.set("menuUrl", params.menuUrl);
  const query = search.toString();
  return fetchCachedJson<ScreenBuilderPagePayload>({
    cacheKey: buildPageCacheKey(`screen-builder/page?${query}`),
    url: `${buildAdminApiPath("/api/admin/screen-builder/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.screenBuilderMessage || `Failed to load screen builder page: ${status}`
  });
}

export async function fetchScreenBuilderPreview(params?: {
  menuCode?: string;
  pageId?: string;
  menuTitle?: string;
  menuUrl?: string;
  versionStatus?: string;
}) {
  const search = new URLSearchParams();
  if (params?.menuCode) search.set("menuCode", params.menuCode);
  if (params?.pageId) search.set("pageId", params.pageId);
  if (params?.menuTitle) search.set("menuTitle", params.menuTitle);
  if (params?.menuUrl) search.set("menuUrl", params.menuUrl);
  if (params?.versionStatus) search.set("versionStatus", params.versionStatus);
  const query = search.toString();
  const response = await fetch(`${buildAdminApiPath("/api/admin/screen-builder/preview")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<ScreenBuilderPreviewPayload & Record<string, unknown>>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to load screen builder preview: ${response.status}`));
  }
  return body as ScreenBuilderPreviewPayload;
}

export async function saveScreenBuilderDraft(payload: {
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
  templateType: string;
  nodes: ScreenBuilderNode[];
  events: ScreenBuilderEventBinding[];
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/draft"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save screen builder draft: ${response.status}`));
  }
  return body;
}

export async function restoreScreenBuilderDraft(payload: {
  menuCode: string;
  versionId: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/restore"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to restore screen builder draft: ${response.status}`));
  }
  return body;
}

export async function publishScreenBuilderDraft(payload: {
  menuCode: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/publish"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to publish screen builder draft: ${response.status}`));
  }
  return body;
}

export async function registerScreenBuilderComponent(payload: {
  menuCode: string;
  pageId: string;
  nodeId: string;
  componentId?: string;
  componentType: string;
  label: string;
  labelEn?: string;
  description?: string;
  propsTemplate?: Record<string, unknown>;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; item?: ScreenBuilderComponentRegistryItem } & Record<string, unknown>>(response);
  if (!response.ok || !body.success || !body.item) {
    throw new Error(String(body.message || `Failed to register screen builder component: ${response.status}`));
  }
  return body as { success: boolean; message?: string; item: ScreenBuilderComponentRegistryItem };
}

export async function updateScreenBuilderComponentRegistry(payload: {
  componentId: string;
  componentType?: string;
  label?: string;
  labelEn?: string;
  description?: string;
  status?: string;
  replacementComponentId?: string;
  propsTemplate?: Record<string, unknown>;
  menuCode?: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; item?: ScreenBuilderComponentRegistryItem } & Record<string, unknown>>(response);
  if (!response.ok || !body.success || !body.item) {
    throw new Error(String(body.message || `Failed to update screen builder component registry: ${response.status}`));
  }
  return body as { success: boolean; message?: string; item: ScreenBuilderComponentRegistryItem };
}

export async function fetchScreenBuilderComponentRegistryUsage(componentId: string) {
  const response = await fetch(buildAdminApiPath(`/api/admin/screen-builder/component-registry/usage?componentId=${encodeURIComponent(componentId)}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<{ componentId?: string; items?: ScreenBuilderComponentUsage[] } & Record<string, unknown>>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to load component usage: ${response.status}`));
  }
  return body as { componentId: string; items: ScreenBuilderComponentUsage[] };
}

export async function deleteScreenBuilderComponentRegistryItem(payload: {
  componentId: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to delete screen builder component: ${response.status}`));
  }
  return body as { success: boolean; message?: string };
}

export async function remapScreenBuilderComponentRegistryUsage(payload: {
  fromComponentId: string;
  toComponentId: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/remap"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; updatedDraftCount?: number; updatedPublishedCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to remap screen builder component usage: ${response.status}`));
  }
  return body as { success: boolean; message?: string; updatedDraftCount?: number; updatedPublishedCount?: number };
}

export async function autoReplaceDeprecatedScreenBuilderComponents(payload: {
  menuCode: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/auto-replace"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; replacedCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to auto replace deprecated components: ${response.status}`));
  }
  return body as { success: boolean; message?: string; replacedCount?: number };
}

export async function previewAutoReplaceDeprecatedScreenBuilderComponents(payload: {
  menuCode: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/auto-replace-preview"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ replacedCount?: number; items?: ScreenBuilderAutoReplacePreviewItem[] } & Record<string, unknown>>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to preview deprecated component replacement: ${response.status}`));
  }
  return body as { replacedCount: number; items: ScreenBuilderAutoReplacePreviewItem[] };
}

export async function scanScreenBuilderRegistryDiagnostics() {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/scan"), {
    credentials: "include"
  });
  const body = await readJsonResponse<{ items?: ScreenBuilderRegistryScanItem[]; totalCount?: number } & Record<string, unknown>>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to scan screen builder registry diagnostics: ${response.status}`));
  }
  return body as { items: ScreenBuilderRegistryScanItem[]; totalCount: number };
}

export async function addScreenBuilderNodeFromComponent(payload: {
  menuCode: string;
  componentId: string;
  parentNodeId?: string;
  props?: Record<string, unknown>;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/add-node"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; nodeId?: string; componentId?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to add node from registered component: ${response.status}`));
  }
  return body as { success: boolean; message?: string; nodeId?: string; componentId?: string };
}

export async function addScreenBuilderNodeTreeFromComponents(payload: {
  menuCode: string;
  items: Array<{
    componentId: string;
    alias?: string;
    parentAlias?: string;
    parentNodeId?: string;
    props?: Record<string, unknown>;
  }>;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/add-node-tree"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; addedCount?: number; items?: Array<Record<string, unknown>> } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to add node tree from components: ${response.status}`));
  }
  return body as { success: boolean; message?: string; addedCount?: number; items?: Array<Record<string, unknown>> };
}

export async function updateEnvironmentManagedPage(payload: {
  menuType: string;
  code: string;
  codeNm: string;
  codeDc: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
}) {
  const form = new URLSearchParams();
  form.set("menuType", payload.menuType);
  form.set("code", payload.code);
  form.set("codeNm", payload.codeNm);
  form.set("codeDc", payload.codeDc);
  form.set("menuUrl", payload.menuUrl);
  form.set("menuIcon", payload.menuIcon);
  form.set("useAt", payload.useAt);
  const response = await fetch(buildLocalizedPath("/admin/system/environment-management/page/update", "/en/admin/system/environment-management/page/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; code?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to update environment managed page: ${response.status}`);
  return body;
}

export async function fetchEnvironmentManagedPageImpact(menuType: string, code: string) {
  const query = new URLSearchParams();
  query.set("menuType", menuType);
  query.set("code", code);
  const response = await fetch(buildLocalizedPath(`/admin/system/environment-management/page-impact?${query.toString()}`, `/en/admin/system/environment-management/page-impact?${query.toString()}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<{
    success?: boolean;
    message?: string;
    code?: string;
    defaultViewFeatureCode?: string;
    linkedFeatureCodes?: string[];
    nonDefaultFeatureCodes?: string[];
    defaultViewRoleRefCount?: number;
    defaultViewUserOverrideCount?: number;
    blocked?: boolean;
  } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load environment managed page impact: ${response.status}`);
  return body;
}

export async function deleteEnvironmentManagedPage(menuType: string, code: string) {
  const form = new URLSearchParams();
  form.set("menuType", menuType);
  form.set("code", code);
  const response = await fetch(buildLocalizedPath("/admin/system/environment-management/page/delete", "/en/admin/system/environment-management/page/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{
    success?: boolean;
    message?: string;
    code?: string;
    nonDefaultFeatureCodes?: string[];
    defaultViewRoleRefCount?: number;
    defaultViewUserOverrideCount?: number;
  } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to delete environment managed page: ${response.status}`);
  return body;
}

export async function updateEnvironmentFeature(payload: {
  menuType: string;
  menuCode: string;
  featureCode: string;
  featureNm: string;
  featureNmEn: string;
  featureDc: string;
  useAt: string;
}) {
  const form = new URLSearchParams();
  form.set("menuType", payload.menuType);
  form.set("menuCode", payload.menuCode);
  form.set("featureCode", payload.featureCode);
  form.set("featureNm", payload.featureNm);
  form.set("featureNmEn", payload.featureNmEn);
  form.set("featureDc", payload.featureDc);
  form.set("useAt", payload.useAt);
  const response = await fetch(buildLocalizedPath("/admin/system/environment-management/feature/update", "/en/admin/system/environment-management/feature/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to update environment feature: ${response.status}`);
  return body;
}

export async function fetchEnvironmentFeatureImpact(featureCode: string) {
  const query = `?featureCode=${encodeURIComponent(featureCode)}`;
  const response = await fetch(buildLocalizedPath(`/admin/system/environment-management/feature-impact${query}`, `/en/admin/system/environment-management/feature-impact${query}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string; assignedRoleCount?: number; userOverrideCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load environment feature impact: ${response.status}`);
  return body;
}

export async function deleteEnvironmentFeature(featureCode: string) {
  const form = new URLSearchParams();
  form.set("featureCode", featureCode);
  const response = await fetch(buildLocalizedPath("/admin/system/environment-management/feature/delete", "/en/admin/system/environment-management/feature/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string; assignedRoleCount?: number; userOverrideCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to delete environment feature: ${response.status}`);
  return body;
}

export async function fetchFullStackManagementPage(menuType?: string, saved?: string) {
  const search = new URLSearchParams();
  if (menuType) search.set("menuType", menuType);
  if (saved) search.set("saved", saved);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/full-stack-management/page-data${query ? `?${query}` : ""}`, `/en/admin/system/full-stack-management/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.menuMgmtError || `Failed to load full-stack management page: ${response.status}`);
  return body as MenuManagementPagePayload;
}

export async function fetchWbsManagementPage(menuType?: string) {
  const search = new URLSearchParams();
  if (menuType) search.set("menuType", menuType);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/wbs-management/page-data${query ? `?${query}` : ""}`, `/en/admin/system/wbs-management/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load WBS management page: ${response.status}`);
  return body as WbsManagementPagePayload;
}

export async function fetchPageManagementPage(params?: { menuType?: string; searchKeyword?: string; searchUrl?: string; autoFeature?: string; updated?: string; deleted?: string; deletedRoleRefs?: string; deletedUserOverrides?: string; }) {
  const search = new URLSearchParams();
  if (params?.menuType) search.set("menuType", params.menuType);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.searchUrl) search.set("searchUrl", params.searchUrl);
  if (params?.autoFeature) search.set("autoFeature", params.autoFeature);
  if (params?.updated) search.set("updated", params.updated);
  if (params?.deleted) search.set("deleted", params.deleted);
  if (params?.deletedRoleRefs) search.set("deletedRoleRefs", params.deletedRoleRefs);
  if (params?.deletedUserOverrides) search.set("deletedUserOverrides", params.deletedUserOverrides);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/page-management/page-data${query ? `?${query}` : ""}`, `/en/admin/system/page-management/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.pageMgmtError || `Failed to load page management page: ${response.status}`);
  return body as PageManagementPagePayload;
}

export async function fetchIpWhitelistPage(params?: { searchIp?: string; accessScope?: string; status?: string; }) {
  const search = new URLSearchParams();
  if (params?.searchIp) search.set("searchIp", params.searchIp);
  if (params?.accessScope) search.set("accessScope", params.accessScope);
  if (params?.status) search.set("status", params.status);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/ip_whitelist/page-data${query ? `?${query}` : ""}`, `/en/admin/system/ip_whitelist/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load IP whitelist page: ${response.status}`);
  return body as IpWhitelistPagePayload;
}

export async function fetchLoginHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; loginResult?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.userSe) search.set("userSe", params.userSe);
  if (params?.loginResult) search.set("loginResult", params.loginResult);
  if (params?.insttId) search.set("insttId", params.insttId);
  const response = await fetch(`${buildAdminApiPath("/api/admin/member/login-history/page")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.loginHistoryError || `Failed to load login history page: ${response.status}`);
  return body as LoginHistoryPagePayload;
}

export async function fetchAccessHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.insttId) search.set("insttId", params.insttId);
  const response = await fetch(buildLocalizedPath(`/admin/system/access_history/page-data${search.toString() ? `?${search.toString()}` : ""}`, `/en/admin/system/access_history/page-data${search.toString() ? `?${search.toString()}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.accessHistoryError || `Failed to load access history page: ${response.status}`);
  return body as AccessHistoryPagePayload;
}

export async function fetchErrorLogPage(params?: { pageIndex?: number; searchKeyword?: string; insttId?: string; sourceType?: string; errorType?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.insttId) search.set("insttId", params.insttId);
  if (params?.sourceType) search.set("sourceType", params.sourceType);
  if (params?.errorType) search.set("errorType", params.errorType);
  const response = await fetch(buildLocalizedPath(`/admin/system/error-log/page-data${search.toString() ? `?${search.toString()}` : ""}`, `/en/admin/system/error-log/page-data${search.toString() ? `?${search.toString()}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.errorLogError || `Failed to load error log page: ${response.status}`);
  return body as ErrorLogPagePayload;
}

export async function fetchSecurityHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.userSe) search.set("userSe", params.userSe);
  if (params?.insttId) search.set("insttId", params.insttId);
  const response = await fetch(`/admin/system/security/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.loginHistoryError || `Failed to load security history page: ${response.status}`);
  return body as LoginHistoryPagePayload;
}

export async function fetchSecurityPolicyPage() {
  const response = await fetch("/admin/system/security-policy/page-data", {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load security policy page: ${response.status}`);
  return body as SecurityPolicyPagePayload;
}

export async function fetchSecurityMonitoringPage() {
  const response = await fetch("/admin/system/security-monitoring/page-data", {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load security monitoring page: ${response.status}`);
  return body as SecurityMonitoringPagePayload;
}

export async function fetchBlocklistPage(params?: { searchKeyword?: string; blockType?: string; status?: string; }) {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.blockType) search.set("blockType", params.blockType);
  if (params?.status) search.set("status", params.status);
  const response = await fetch(`/admin/system/blocklist/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load blocklist page: ${response.status}`);
  return body as BlocklistPagePayload;
}

export async function fetchSecurityAuditPage() {
  const response = await fetch("/admin/system/security-audit/page-data", {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load security audit page: ${response.status}`);
  return body as SecurityAuditPagePayload;
}

export async function fetchSchedulerManagementPage(params?: { jobStatus?: string; executionType?: string; }) {
  const search = new URLSearchParams();
  if (params?.jobStatus) search.set("jobStatus", params.jobStatus);
  if (params?.executionType) search.set("executionType", params.executionType);
  const response = await fetch(`/admin/system/scheduler/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load scheduler management page: ${response.status}`);
  return body as SchedulerManagementPagePayload;
}

export async function fetchCodexProvisionPage() {
  const response = await fetch(buildLocalizedPath("/admin/system/codex-request/page-data", "/en/admin/system/codex-request/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load Codex provision page: ${response.status}`);
  return body as CodexProvisionPagePayload;
}

export async function fetchEmissionResultListPage(params?: { pageIndex?: number; searchKeyword?: string; resultStatus?: string; verificationStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.resultStatus) search.set("resultStatus", params.resultStatus);
  if (params?.verificationStatus) search.set("verificationStatus", params.verificationStatus);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/emission/result_list/page-data${query ? `?${query}` : ""}`, `/en/admin/emission/result_list/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load emission result list page: ${response.status}`);
  return body as EmissionResultListPagePayload;
}

export async function runCodexLoginCheck() {
  const response = await fetch(buildLocalizedPath("/admin/system/codex-request/login", "/en/admin/system/codex-request/login"), {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function executeCodexProvision(payload: Record<string, unknown>) {
  const response = await fetch(buildLocalizedPath("/admin/system/codex-request/execute", "/en/admin/system/codex-request/execute"), {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({ "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function fetchCodexHistory() {
  const response = await fetch(buildLocalizedPath("/admin/system/codex-request/history", "/en/admin/system/codex-request/history"), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<CodexHistoryPayload>(response);
}

export async function inspectCodexHistory(logId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/history/${encodeURIComponent(logId)}/inspect`, `/en/admin/system/codex-request/history/${encodeURIComponent(logId)}/inspect`), {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function remediateCodexHistory(logId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/history/${encodeURIComponent(logId)}/remediate`, `/en/admin/system/codex-request/history/${encodeURIComponent(logId)}/remediate`), {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function prepareCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/prepare`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/prepare`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function planCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/plan`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/plan`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function executeCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/execute`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/execute`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function directExecuteCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/direct-execute`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/direct-execute`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function skipPlanExecuteCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/skip-plan-execute`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/skip-plan-execute`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function reissueCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/reissue`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/reissue`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow; sourceTicketId: string }>(response);
}

export async function rollbackCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/rollback`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/rollback`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function deleteCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/delete`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/delete`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; deletedTicketId: string }>(response);
}

export async function fetchCodexSrTicketDetail(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<SrTicketDetailPayload>(response);
}

export async function fetchCodexSrTicketArtifact(ticketId: string, artifactType: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/artifacts/${encodeURIComponent(artifactType)}`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/artifacts/${encodeURIComponent(artifactType)}`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<SrTicketArtifactPayload>(response);
}

export async function fetchAuditEvents(params?: {
  pageIndex?: number;
  pageSize?: number;
  traceId?: string;
  actorId?: string;
  actionCode?: string;
  menuCode?: string;
  pageId?: string;
  resultStatus?: string;
  searchKeyword?: string;
}): Promise<AuditEventSearchPayload> {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.traceId) search.set("traceId", params.traceId);
  if (params?.actorId) search.set("actorId", params.actorId);
  if (params?.actionCode) search.set("actionCode", params.actionCode);
  if (params?.menuCode) search.set("menuCode", params.menuCode);
  if (params?.pageId) search.set("pageId", params.pageId);
  if (params?.resultStatus) search.set("resultStatus", params.resultStatus);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const response = await fetch(`${buildAdminApiPath("/api/admin/observability/audit-events")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include",
    apiId: "admin.observability.audit-events.search"
  });
  return readJsonResponse<AuditEventSearchPayload>(response);
}

export async function fetchTraceEvents(params?: {
  pageIndex?: number;
  pageSize?: number;
  traceId?: string;
  pageId?: string;
  componentId?: string;
  functionId?: string;
  apiId?: string;
  eventType?: string;
  resultCode?: string;
  searchKeyword?: string;
}): Promise<TraceEventSearchPayload> {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.traceId) search.set("traceId", params.traceId);
  if (params?.pageId) search.set("pageId", params.pageId);
  if (params?.componentId) search.set("componentId", params.componentId);
  if (params?.functionId) search.set("functionId", params.functionId);
  if (params?.apiId) search.set("apiId", params.apiId);
  if (params?.eventType) search.set("eventType", params.eventType);
  if (params?.resultCode) search.set("resultCode", params.resultCode);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const response = await fetch(`${buildAdminApiPath("/api/admin/observability/trace-events")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include",
    apiId: "admin.observability.trace-events.search"
  });
  return readJsonResponse<TraceEventSearchPayload>(response);
}

export async function fetchHelpManagementPage(pageId: string): Promise<HelpManagementPagePayload> {
  const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
  const response = await fetch(`${buildAdminApiPath("/api/admin/help-management/page")}${query}`, {
    credentials: "include",
    apiId: "admin.help-management.page"
  });
  return readJsonResponse<HelpManagementPagePayload>(response);
}

export async function saveHelpManagementPage(payload: {
  pageId: string;
  title: string;
  summary: string;
  helpVersion: string;
  activeYn: string;
  items: HelpManagementItem[];
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/help-management/save"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.help-management.save",
    headers: buildCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; pageId: string; message: string }>(response);
}

export async function fetchScreenCommandPage(pageId: string): Promise<ScreenCommandPagePayload> {
  const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
  const response = await fetch(`${buildAdminApiPath("/api/admin/help-management/screen-command/page")}${query}`, {
    credentials: "include",
    apiId: "admin.help-management.screen-command.page"
  });
  return readJsonResponse<ScreenCommandPagePayload>(response);
}

export async function fetchFullStackGovernanceRegistry(menuCode: string): Promise<FullStackGovernanceRegistryEntry> {
  const query = menuCode ? `?menuCode=${encodeURIComponent(menuCode)}` : "";
  const response = await fetch(`/api/admin/full-stack-management/registry${query}`, {
    credentials: "include",
    apiId: "admin.full-stack-management.registry"
  });
  return readJsonResponse<FullStackGovernanceRegistryEntry>(response);
}

export async function saveFullStackGovernanceRegistry(payload: FullStackGovernanceRegistryEntry) {
  const response = await fetch("/api/admin/full-stack-management/registry", {
    method: "POST",
    credentials: "include",
    apiId: "admin.full-stack-management.registry-save",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; entry: FullStackGovernanceRegistryEntry }>(response);
}

export async function saveWbsManagementEntry(payload: {
  menuType: string;
  menuCode: string;
  owner: string;
  status: string;
  progress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  startDate: string;
  endDate: string;
  notes: string;
  codexInstruction: string;
}) {
  const response = await fetch("/api/admin/wbs-management/entry", {
    method: "POST",
    credentials: "include",
    apiId: "admin.wbs-management.entry-save",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; entry: Record<string, unknown> }>(response);
}

export async function autoCollectFullStackGovernanceRegistry(payload: FullStackGovernanceAutoCollectRequest) {
  const response = await fetch("/api/admin/full-stack-management/registry/auto-collect", {
    method: "POST",
    credentials: "include",
    apiId: "admin.full-stack-management.registry-auto-collect",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; entry: FullStackGovernanceRegistryEntry }>(response);
}

export async function fetchSrWorkbenchPage(pageId: string): Promise<SrWorkbenchPagePayload> {
  const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
  const response = await fetch(`${buildAdminApiPath("/api/admin/sr-workbench/page")}${query}`, {
    credentials: "include",
    apiId: "admin.sr-workbench.page"
  });
  return readJsonResponse<SrWorkbenchPagePayload>(response);
}

export async function createSrTicket(payload: {
  pageId: string;
  pageLabel: string;
  routePath: string;
  menuCode: string;
  menuLookupUrl: string;
  surfaceId: string;
  surfaceLabel: string;
  eventId: string;
  eventLabel: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  instruction: string;
  technicalContext?: string;
  generatedDirection: string;
  commandPrompt: string;
  stackItemIds?: string[];
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/sr-workbench/tickets"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.create",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function quickExecuteSrTicket(payload: {
  pageId: string;
  pageLabel: string;
  routePath: string;
  menuCode: string;
  menuLookupUrl: string;
  surfaceId: string;
  surfaceLabel: string;
  eventId: string;
  eventLabel: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  instruction: string;
  technicalContext?: string;
  generatedDirection: string;
  commandPrompt: string;
  stackItemIds?: string[];
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/sr-workbench/quick-execute"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.quick-execute",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow; ticketId: string }>(response);
}

export async function addSrWorkbenchStackItem(payload: {
  pageId: string;
  pageLabel: string;
  routePath: string;
  menuCode: string;
  menuLookupUrl: string;
  surfaceId: string;
  surfaceLabel: string;
  selector: string;
  componentId: string;
  eventId: string;
  eventLabel: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  instruction: string;
  technicalContext?: string;
  traceId: string;
  requestId: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/sr-workbench/stack-items"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.stack-item.create",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; stackItem: SrWorkbenchStackItem }>(response);
}

export async function removeSrWorkbenchStackItem(stackItemId: string) {
  const response = await fetch(buildAdminApiPath(`/api/admin/sr-workbench/stack-items/${encodeURIComponent(stackItemId)}/delete`), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.stack-item.delete",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; removedCount: number }>(response);
}

export async function clearSrWorkbenchStack() {
  const response = await fetch(buildAdminApiPath("/api/admin/sr-workbench/stack-items/clear"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.stack-item.clear",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string }>(response);
}

export async function approveSrTicket(ticketId: string, decision: "APPROVE" | "REJECT", comment: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/approve`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.approve",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ decision, comment })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function prepareSrExecution(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/prepare-execution`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.prepare-execution",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function planSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/plan`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.plan",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function executeSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function directExecuteSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/direct-execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.direct-execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function skipPlanExecuteSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/admin/sr-workbench/tickets/${encodeURIComponent(ticketId)}/skip-plan-execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.skip-plan-execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function fetchJoinCompanyRegisterPage() {
  const response = await fetch("/join/api/company-register/page", {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load join company register page: ${response.status}`);
  return response.json() as Promise<JoinCompanyRegisterPagePayload>;
}

export async function fetchJoinSession(): Promise<JoinSessionPayload> {
  if (joinSessionCache) {
    return joinSessionCache;
  }

  if (!joinSessionPromise) {
    joinSessionPromise = fetch("/join/api/session", {
      credentials: "include"
    })
      .then(async (response: Response) => {
        if (!response.ok) throw new Error(`Failed to load join session: ${response.status}`);
        const session = await readJsonResponse<JoinSessionPayload>(response);
        joinSessionCache = session;
        return session;
      })
      .finally(() => {
        joinSessionPromise = null;
      });
  }

  if (!joinSessionPromise) {
    throw new Error("Join session promise was not initialized");
  }

  return joinSessionPromise;
}

export async function fetchMypage(en = false) {
  const bootstrappedPayload = consumeRuntimeBootstrap<MypagePayload>("mypagePayload");
  if (bootstrappedPayload) {
    return bootstrappedPayload;
  }
  const response = await fetch(await buildMypageUrl(en ? "/api/en/mypage" : "/api/mypage"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage: ${response.status}`);
  }
  return body as MypagePayload;
}

export async function fetchMypageSection(section: string, en = false) {
  const response = await fetch(await buildMypageUrl(en ? `/api/en/mypage/section/${encodeURIComponent(section)}` : `/api/mypage/section/${encodeURIComponent(section)}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(`Failed to load mypage section: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageMarketing(session: FrontendSession, marketingYn: string, en = false, insttId?: string) {
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
    body: appendInsttId(new URLSearchParams({ marketingYn }), insttId || session.insttId).toString()
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
  en = false,
  insttId?: string
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
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
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
  en = false,
  insttId?: string
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
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
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
  en = false,
  insttId?: string
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
    body: appendInsttId(new URLSearchParams(payload), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save staff setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypageEmail(session: FrontendSession, email: string, en = false, insttId?: string) {
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
    body: appendInsttId(new URLSearchParams({ email }), insttId || session.insttId).toString()
  });
  const body = await response.json();
  if (!response.ok && response.status !== 401) {
    throw new Error(body.message || `Failed to save email setting: ${response.status}`);
  }
  return body as MypageSectionPayload;
}

export async function saveMypagePassword(session: FrontendSession, currentPassword: string, newPassword: string, en = false, insttId?: string) {
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
    body: appendInsttId(new URLSearchParams({ currentPassword, newPassword }), insttId || session.insttId).toString()
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
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to create auth group: ${response.status}`);
  }
  invalidateAdminPageCaches();
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
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups/features"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save auth-group features: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAdminAuthChange(
  session: FrontendSession,
  payload: {
    emplyrId: string;
    authorCode: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-change/save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save auth change: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAuthorRoleProfile(
  session: FrontendSession,
  payload: {
    authorCode: string;
    roleCategory: string;
    displayTitle: string;
    priorityWorks: string[];
    description: string;
    memberEditVisibleYn: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups/profile-save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save author role profile: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body as { success: boolean; authorCode: string; profile: AuthorRoleProfile };
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
  const response = await fetch(buildAdminApiPath("/api/admin/dept-role-mapping/save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save dept mapping: ${response.status}`);
  }
  invalidateAdminPageCaches();
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
  const response = await fetch(buildAdminApiPath("/api/admin/dept-role-mapping/member-save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to save dept member role: ${response.status}`);
  }
  invalidateAdminPageCaches();
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
  const response = await fetch(buildAdminApiPath("/api/admin/member/edit"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member edit: ${response.status}`));
  }
  invalidateAdminPageCaches();
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
  invalidateAdminPageCaches();
  return body;
}

export async function saveAdminPermission(session: FrontendSession, payload: { emplyrId: string; authorCode: string; featureCodes: string[]; }) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account/permissions"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save admin permission: ${response.status}`));
  }
  invalidateAdminPageCaches();
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
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to create admin account: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveCompanyAccount(
  _session: FrontendSession,
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

  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await fetch(buildAdminApiPath("/api/admin/member/company-account"), {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save company account: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitMemberApproveAction(
  session: FrontendSession,
  payload: { action: string; memberId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve member: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitCompanyApproveAction(
  session: FrontendSession,
  payload: { action: string; insttId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/company-approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve company: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitJoinCompanyRegister(payload: {
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
  lang?: string;
  fileUploads: File[];
}) {
  invalidateJoinSessionCache();
  const form = new FormData();
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
  invalidateJoinSessionCache();
  const response = await fetch("/join/api/reset", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders()
  });
  if (!response.ok) throw new Error(`Failed to reset join session: ${response.status}`);
  return readJsonResponse<{ success: boolean }>(response);
}

export async function saveJoinStep1(membershipType: string) {
  invalidateJoinSessionCache();
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
  invalidateJoinSessionCache();
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
  invalidateJoinSessionCache();
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
  membershipType?: string;
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
  invalidateJoinSessionCache();
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
  invalidateJoinSessionCache();
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
