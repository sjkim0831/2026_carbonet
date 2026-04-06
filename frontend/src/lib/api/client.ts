import { tracedFetch } from "../../platform/telemetry/fetch";
import type { MigrationPageId } from "../../app/routes/definitions";
import { buildLocalizedPath, getCsrfMeta, getRuntimeLocale } from "../navigation/runtime";

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
  actualUserId: string;
  userId: string;
  authorCode: string;
  insttId: string;
  companyScope: string;
  simulationAvailable: boolean;
  simulationActive: boolean;
  csrfToken: string;
  csrfHeaderName: string;
  featureCodes: string[];
  capabilityCodes: string[];
};

export type AdminSessionSimulationOption = {
  insttId?: string;
  cmpnyNm?: string;
  emplyrId?: string;
  userNm?: string;
  orgnztId?: string;
  authorCode?: string;
  authorNm?: string;
};

export type AdminSessionSimulationPayload = {
  available: boolean;
  active: boolean;
  actualUserId: string;
  effectiveUserId: string;
  effectiveAuthorCode: string;
  effectiveInsttId: string;
  companyOptions: AdminSessionSimulationOption[];
  adminAccountOptions: AdminSessionSimulationOption[];
  authorOptions: AdminSessionSimulationOption[];
  selectedInsttId: string;
  selectedEmplyrId: string;
  selectedAuthorCode: string;
};

type MypageContext = {
  authenticated: boolean;
  userId?: string;
  insttId: string;
  redirectUrl?: string;
};

export type AdminMenuLink = {
  code?: string;
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

export type TagManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  summaryCards?: Array<Record<string, string>>;
  tagRows?: Array<Record<string, string>>;
  usageRows?: Array<Record<string, string>>;
  governanceNotes?: Array<Record<string, string>>;
};

export type FaqManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  exposure?: string;
  category?: string;
  selectedFaqId?: string;
  summaryCards?: Array<Record<string, string>>;
  faqRows?: Array<Record<string, string>>;
  selectedFaq?: Record<string, string>;
  governanceNotes?: Array<Record<string, string>>;
};

export type FileManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  visibility?: string;
  selectedFileId?: string;
  summaryCards?: Array<Record<string, string>>;
  fileRows?: Array<Record<string, string>>;
  selectedFile?: Record<string, string>;
  selectedFileHistory?: Array<Record<string, string>>;
  deletedFileRows?: Array<Record<string, string>>;
  governanceNotes?: Array<Record<string, string>>;
};

export type FileManagementSaveResponse = {
  success: boolean;
  message?: string;
  fileId?: string;
  file?: Record<string, string>;
};

export type PostManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  category?: string;
  summaryCards?: Array<Record<string, string>>;
  categoryOptions?: Array<Record<string, string>>;
  postRows?: Array<Record<string, string>>;
  selectedPost?: Record<string, string> | null;
  governanceNotes?: Array<Record<string, string>>;
};

export type BoardDistributionPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  draftId?: string;
  draftDetail?: Record<string, unknown>;
  summaryCards?: Array<Record<string, string>>;
  governanceNotes?: Array<Record<string, string>>;
};

export type BoardManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  summaryCards?: Array<Record<string, string>>;
  boardTypeOptions?: Array<Record<string, string>>;
  boardRows?: Array<Record<string, string>>;
  selectedBoard?: Record<string, string> | null;
  governanceNotes?: Array<Record<string, string>>;
};

export type BoardDistributionSavePayload = {
  draftId?: string;
  boardType: string;
  audience: string;
  title: string;
  summary: string;
  body: string;
  publishAt: string;
  expireAt: string;
  channels: string[];
  tags: string[];
  pinned: boolean;
  urgent: boolean;
  allowComments: boolean;
};

export type BoardDistributionSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  draftId?: string;
  message?: string;
  draftDetail?: Record<string, unknown>;
};

export type QnaCategoryPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  useAt?: string;
  channel?: string;
  selectedCategoryId?: string;
  summaryCards?: Array<Record<string, string>>;
  categoryRows?: Array<Record<string, string>>;
  selectedCategory?: Record<string, string>;
  governanceNotes?: Array<Record<string, string>>;
  integrationNotes?: Array<Record<string, string>>;
};

export type QnaCategorySavePayload = {
  categoryId?: string;
  code: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  channel: string;
  useAt: string;
  sortOrder: number;
  ownerKo: string;
  ownerEn: string;
};

export type EmissionGwpValuesPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  sectionCode?: string;
  selectedRowId?: string;
  documentName?: string;
  documentSourcePath?: string;
  documentTargetPath?: string;
  pdfOcrStatus?: string;
  pdfOcrStatusLabel?: string;
  pdfOcrStatusDetail?: string;
  pdfOcrInstallHint?: string;
  pdfComparePolicy?: string;
  pdfComparePolicyLabel?: string;
  pdfComparePolicyOptions?: Array<Record<string, string>>;
  pdfCompareLoaded?: boolean;
  pdfCompareScope?: string;
  summaryCards?: Array<Record<string, string>>;
  pdfComparisonSummary?: Array<Record<string, string>>;
  sectionOptions?: Array<Record<string, string>>;
  gwpRows?: Array<Record<string, string>>;
  selectedRow?: Record<string, string>;
  governanceNotes?: Array<Record<string, string>>;
  methaneGuidance?: Array<Record<string, string>>;
};

export type EmissionGwpValueSavePayload = {
  rowId?: string;
  sectionCode: string;
  commonName: string;
  formula: string;
  ar4Value: string;
  ar5Value: string;
  ar6Value: string;
  note: string;
  sortOrder: number;
};

export type EmissionGwpValueSaveResponse = {
  success: boolean;
  message: string;
  rowId?: string;
  row?: Record<string, string>;
  compareStatus?: string;
  compareStatusLabel?: string;
  compareMismatchLabels?: string;
  compareMismatchFields?: string[];
  pdfCompareStatus?: string;
  pdfCompareStatusLabel?: string;
  pdfComparePage?: string;
  pdfCompareSource?: string;
  pdfCompareSourceLabel?: string;
  pdfCompareDetail?: string;
};

export type BannerManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  placement?: string;
  summaryCards?: Array<Record<string, string>>;
  bannerRows?: Array<Record<string, string | number>>;
  selectedBanner?: Record<string, string | number> | null;
  placementOptions?: Array<Record<string, string>>;
};

export type BannerEditPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  bannerId?: string;
  bannerDetail?: Record<string, string | number>;
  statusOptions?: Array<Record<string, string>>;
  placementOptions?: Array<Record<string, string>>;
  summaryCards?: Array<Record<string, string>>;
};

export type BannerSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  bannerId?: string;
  message?: string;
  bannerDetail?: Record<string, string | number>;
};

export type PopupListPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  status?: string;
  targetAudience?: string;
  summaryCards?: Array<Record<string, string>>;
  statusOptions?: Array<Record<string, string>>;
  targetAudienceOptions?: Array<Record<string, string>>;
  popupRows?: Array<Record<string, string | number>>;
  selectedPopup?: Record<string, string | number>;
  governanceNotes?: Array<Record<string, string>>;
};

export type PopupEditPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  popupId?: string;
  popupDetail?: Record<string, string | number>;
  summaryCards?: Array<Record<string, string>>;
  popupTypeOptions?: Array<Record<string, string>>;
  priorityOptions?: Array<Record<string, string>>;
  exposureStatusOptions?: Array<Record<string, string>>;
  useAtOptions?: Array<Record<string, string>>;
  targetAudienceOptions?: Array<Record<string, string>>;
  displayScopeOptions?: Array<Record<string, string>>;
  closePolicyOptions?: Array<Record<string, string>>;
};

export type PopupSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  popupId?: string;
  message?: string;
  popupDetail?: Record<string, string | number>;
};

export type FaqSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  faqId?: string;
  message?: string;
  faq?: Record<string, string>;
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
  if (response.redirected && response.url && typeof window !== "undefined") {
    try {
      const redirectedUrl = new URL(response.url, window.location.origin);
      if (redirectedUrl.pathname === "/admin/login/loginView"
        || redirectedUrl.pathname === "/en/admin/login/loginView"
        || redirectedUrl.pathname === "/signin/loginView"
        || redirectedUrl.pathname === "/en/signin/loginView") {
        window.location.replace(response.url);
        throw new Error("Authentication required. Redirecting to login.");
      }
    } catch {
      // Fall through to the normal response parser.
    }
  }
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
  const headers: Record<string, string> = { ...(extraHeaders || {}) };
  try {
    const session = await fetchFreshFrontendSession();
    if (session.csrfHeaderName && session.csrfToken) {
      headers[session.csrfHeaderName] = session.csrfToken;
    }
  } catch {
    const fallbackHeaders = buildCsrfHeaders(extraHeaders);
    Object.assign(headers, fallbackHeaders);
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

export type AuthorGroupSection = {
  layerKey: string;
  sectionLabel: string;
  groups: AuthorGroup[];
};

export type AuthorRoleProfile = {
  authorCode: string;
  displayTitle: string;
  priorityWorks: string[];
  description: string;
  memberEditVisibleYn: string;
  roleType?: string;
  baseRoleYn?: string;
  parentAuthorCode?: string;
  assignmentScope?: string;
  defaultMemberTypes?: string[];
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
  canManageAllCompanies?: boolean;
  canManageOwnCompany?: boolean;
  authGroupCompanyOptions: Array<{ insttId: string; cmpnyNm: string }>;
  authGroupSelectedInsttId: string;
  authGroupDepartmentRows?: Array<Record<string, string>>;
  authGroupDepartmentRoleSummaries?: Array<Record<string, string>>;
  userAuthorityTargets?: Array<Record<string, string>>;
  userSearchKeyword?: string;
  focusedMenuCode?: string;
  focusedFeatureCode?: string;
  selectedAuthorProfile?: AuthorRoleProfile;
  referenceAuthorProfilesByCode?: Record<string, AuthorRoleProfile>;
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
  canEditAuthChange?: boolean;
  roleAssignments: AdminRoleAssignment[];
  authorGroups: AuthorGroup[];
  authorGroupSections?: AuthorGroupSection[];
  recentRoleChangeHistory: AuthChangeHistoryRow[];
  assignmentCount: number;
  assignmentPageIndex: number;
  assignmentPageSize: number;
  assignmentTotalPages: number;
  assignmentSearchKeyword: string;
  authChangeUpdated: boolean;
  authChangeTargetUserId: string;
  authChangeMessage: string;
  authChangeError: string;
};

export type AuthChangeHistoryRow = {
  changedAt: string;
  changedBy: string;
  targetUserId: string;
  beforeAuthorCode: string;
  beforeAuthorName: string;
  afterAuthorCode: string;
  afterAuthorName: string;
  resultStatus: string;
};

export type EmissionSiteManagementPagePayload = {
  isEn?: boolean;
  menuCode?: string;
  menuUrl?: string;
  homeReferenceUrl?: string;
  referenceFolder?: string;
  summaryCards?: Array<Record<string, string>>;
  quickLinks?: Array<Record<string, string>>;
  operationCards?: Array<Record<string, string>>;
  featureRows?: Array<Record<string, string>>;
  referenceRows?: Array<Record<string, string>>;
};

export type EmissionValidatePagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  resultId?: string;
  searchKeyword?: string;
  verificationStatus?: string;
  priorityFilter?: string;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  pendingCount?: number;
  inProgressCount?: number;
  failedCount?: number;
  highPriorityCount?: number;
  summaryCards?: Array<Record<string, string>>;
  queueRows?: Array<Record<string, string>>;
  selectedResultFound?: boolean;
  selectedResult?: Record<string, string>;
  priorityLegend?: Array<Record<string, string>>;
  policyRows?: Array<Record<string, string>>;
  actionLinks?: Array<Record<string, string>>;
};

export type EmissionManagementPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  menuUrl?: string;
  pageTitle?: string;
  pageTitleEn?: string;
  pageDescription?: string;
  pageDescriptionEn?: string;
  elementRegistrySummary?: Array<Record<string, string>>;
  elementRegistryRows?: Array<Record<string, unknown>>;
  selectedElementDefinition?: Record<string, unknown>;
  elementTypeOptions?: Array<Record<string, string>>;
  layoutZoneOptions?: Array<Record<string, string>>;
  componentTypeOptions?: Array<Record<string, string>>;
  formulaReference?: Record<string, unknown>;
  rolloutSummaryCards?: Array<Record<string, string>>;
  rolloutStatusRows?: Array<Record<string, unknown>>;
  definitionScopeSummaryCards?: Array<Record<string, string>>;
  definitionScopeRows?: Array<Record<string, unknown>>;
  definitionDraftRows?: Array<Record<string, unknown>>;
  definitionPolicyOptions?: Array<Record<string, string>>;
  selectedDefinitionDraft?: Record<string, unknown>;
  publishedDefinitionRows?: Array<Record<string, unknown>>;
  selectedPublishedDefinition?: Record<string, unknown>;
};

export type EmissionSurveyAdminColumn = {
  key: string;
  label: string;
  headerPath?: string;
};

export type EmissionSurveyAdminRow = {
  rowId?: string;
  values?: Record<string, string>;
};

export type EmissionSurveyAdminSection = {
  sectionCode?: string;
  majorCode?: string;
  majorLabel?: string;
  sectionLabel?: string;
  sheetName?: string;
  titleRowLabel?: string;
  guidance?: string[];
  metadata?: Array<Record<string, string>>;
  columns?: EmissionSurveyAdminColumn[];
  rows?: EmissionSurveyAdminRow[];
};

export type EmissionSurveyAdminPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  pageTitle?: string;
  pageDescription?: string;
  sourceFileName?: string;
  sourcePath?: string;
  targetPath?: string;
  uploaded?: boolean;
  summaryCards?: Array<Record<string, string>>;
  majorOptions?: Array<Record<string, string>>;
  sectionOptions?: Array<Record<string, string>>;
  caseOptions?: Array<Record<string, string>>;
  workbookGuidance?: string[];
  sections?: EmissionSurveyAdminSection[];
  savedCaseMap?: Record<string, Record<string, unknown>>;
  savedSetMap?: Record<string, Record<string, unknown>>;
};

export type EmissionSurveyCaseDraftSavePayload = {
  sectionCode: string;
  caseCode: string;
  majorCode: string;
  sectionLabel: string;
  sourceFileName?: string;
  sourcePath?: string;
  targetPath?: string;
  titleRowLabel?: string;
  guidance?: string[];
  columns?: EmissionSurveyAdminColumn[];
  rows: Array<{
    rowId: string;
    values: Record<string, string>;
  }>;
};

export type EmissionSurveyDraftSetSavePayload = {
  setId?: string;
  setName: string;
  sourceFileName?: string;
  sourcePath?: string;
  targetPath?: string;
  sections: Array<Record<string, unknown>>;
};

export type EmissionManagementElementSavePayload = {
  definitionId?: string;
  elementKey: string;
  elementName: string;
  elementType: string;
  layoutZone: string;
  componentType: string;
  bindingTarget: string;
  defaultLabel: string;
  defaultLabelEn: string;
  description: string;
  variableScope: string;
  policyNote: string;
  directRequiredCodes: string[];
  fallbackCodes: string[];
  autoCalculatedCodes: string[];
  useYn: string;
  tags: string[];
};

export type EmissionManagementElementSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  definitionId?: string;
  message?: string;
  elementRegistryRows?: Array<Record<string, unknown>>;
  selectedElementDefinition?: Record<string, unknown>;
};

export type EmissionDefinitionStudioPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  menuUrl?: string;
  pageTitle?: string;
  pageTitleEn?: string;
  pageDescription?: string;
  pageDescriptionEn?: string;
  summaryCards?: Array<Record<string, string>>;
  quickLinks?: Array<Record<string, string>>;
  seedCategories?: Array<Record<string, string>>;
  seedTiers?: Array<Record<string, string>>;
  policyOptions?: Array<Record<string, string>>;
  saveChecklist?: Array<Record<string, string>>;
  governanceNotes?: Array<Record<string, string>>;
  definitionRows?: Array<Record<string, unknown>>;
  selectedDefinition?: Record<string, unknown>;
  sections?: Array<Record<string, unknown>>;
};

export type EmissionDefinitionDraftSavePayload = {
  draftId?: string;
  categoryCode: string;
  categoryName: string;
  tierLabel: string;
  formula: string;
  formulaTree?: Array<Record<string, unknown>>;
  inputMode: string;
  policies: string[];
  directRequiredCodes: string[];
  fallbackCodes: string[];
  autoCalculatedCodes: string[];
  supplementalCodes: string[];
  sections: Array<Record<string, unknown>>;
  variableDefinitions: Array<Record<string, unknown>>;
  runtimeMode?: string;
  note: string;
};

export type EmissionDefinitionDraftSaveResponse = Record<string, unknown> & {
  saved?: boolean;
  published?: boolean;
  draftId?: string;
  message?: string;
  draftDetail?: Record<string, unknown>;
  definitionRows?: Array<Record<string, unknown>>;
};

export type EmissionDefinitionMaterializeResponse = Record<string, unknown> & {
  success?: boolean;
  draftId?: string;
  categoryId?: number;
  categoryCode?: string;
  tier?: number;
  createdCategory?: boolean;
  insertedVariableCount?: number;
  updatedVariableCount?: number;
  skippedFields?: string[];
  message?: string;
};

export type EmissionCategoryItem = Record<string, unknown> & {
  categoryId?: number;
  majorCode?: string;
  majorName?: string;
  subCode?: string;
  subName?: string;
  useYn?: string;
};

export type EmissionTierItem = Record<string, unknown> & {
  tier?: number;
  tierLabel?: string;
};

export type EmissionTierResponse = {
  category?: EmissionCategoryItem;
  tiers?: EmissionTierItem[];
  unsupportedTiers?: EmissionTierItem[];
  warning?: string;
};

export type EmissionVariableDefinition = Record<string, unknown> & {
  variableId?: number;
  categoryId?: number;
  tier?: number;
  varCode?: string;
  varName?: string;
  varDesc?: string;
  unit?: string;
  inputType?: string;
  sourceType?: string;
  isRepeatable?: string;
  isRequired?: string;
  sortOrder?: number;
  useYn?: string;
  commonCodeId?: string;
  options?: Array<Record<string, string>>;
  displayName?: string;
  displayCode?: string;
  uiHint?: string;
  derivedYn?: string;
  supplementalYn?: string;
  repeatGroupKey?: string;
  sectionId?: string;
  sectionOrder?: number;
  sectionTitle?: string;
  sectionDescription?: string;
  sectionFormula?: string;
  sectionPreviewType?: string;
  sectionRelatedFactorCodes?: string;
  visibleWhen?: string;
  disabledWhen?: string;
};

export type EmissionFactorDefinition = Record<string, unknown> & {
  factorId?: number;
  categoryId?: number;
  tier?: number;
  factorCode?: string;
  factorName?: string;
  factorValue?: number;
  unit?: string;
  defaultYn?: string;
  remark?: string;
};

export type EmissionInputValuePayload = {
  varCode: string;
  lineNo?: number;
  valueNum?: number | null;
  valueText?: string;
};

export type EmissionInputSessionSavePayload = {
  categoryId: number;
  tier: number;
  createdBy?: string;
  values: EmissionInputValuePayload[];
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
  authorityProfile?: {
    roleKey?: string;
    authorCode?: string;
    label?: string;
    description?: string;
    tier?: string;
    actorType?: string;
    scopePolicy?: string;
    hierarchyLevel?: number;
    featureCodes?: string[];
    tags?: string[];
  };
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
  releaseUnitId?: string;
  artifactEvidence?: {
    artifactSourceSystem?: string;
    artifactTargetSystem?: string;
    releaseUnitId?: string;
    runtimePackageId?: string;
    deployTraceId?: string;
    publishedVersionId?: string;
    publishedSavedAt?: string;
    artifactKind?: string;
    artifactPathHint?: string;
  };
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
  authorityProfile?: ScreenBuilderPagePayload["authorityProfile"];
  versionStatus?: string;
  releaseUnitId?: string;
  artifactEvidence?: ScreenBuilderPagePayload["artifactEvidence"];
  registryDiagnostics?: {
    unregisteredNodes?: ScreenBuilderRegistryIssue[];
    missingNodes?: ScreenBuilderRegistryIssue[];
    deprecatedNodes?: ScreenBuilderRegistryIssue[];
    componentPromptSurface?: ScreenBuilderComponentPromptSurface[];
  };
  nodes: ScreenBuilderNode[];
  events: ScreenBuilderEventBinding[];
};

export type ScreenBuilderStatusSummaryItem = {
  menuCode: string;
  pageId: string;
  menuTitle: string;
  menuUrl: string;
  publishedVersionId: string;
  publishedSavedAt: string;
  releaseUnitId: string;
  artifactTargetSystem: string;
  runtimePackageId: string;
  deployTraceId: string;
  publishFreshnessState: "UNPUBLISHED" | "FRESH" | "AGING" | "STALE" | "UNKNOWN";
  publishFreshnessLabel: string;
  publishFreshnessDetail: string;
  parityState: "UNAVAILABLE" | "MATCH" | "DRIFT" | "GAP";
  parityLabel: string;
  parityDetail: string;
  parityTraceId: string;
  versionCount: number;
  unregisteredCount: number;
  missingCount: number;
  deprecatedCount: number;
};

export type ScreenBuilderStatusSummaryResponse = {
  items: ScreenBuilderStatusSummaryItem[];
  count: number;
  projectId: string;
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
  permissionRoleFeatureCodesByAuthorCode?: Record<string, string[]>;
  assignedRoleProfile?: AuthorRoleProfile;
  member_editError?: string;
  member_editUpdated?: boolean;
  canViewMemberEdit?: boolean;
  canUseMemberSave?: boolean;
  currentUserInsttId?: string;
  canManageAllCompanies?: boolean;
  canManageOwnCompany?: boolean;
  memberManagementScopeMode?: string;
  memberManagementRequiresInsttId?: boolean;
  targetMemberInsttId?: string;
  targetMemberType?: string;
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
  summaryMetrics?: {
    surfaceCount: number;
    eventCount: number;
    apiCount: number;
    schemaCount: number;
    changeTargetCount: number;
    featureCount: number;
    relationTableCount: number;
    componentCount: number;
  };
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
  queueStatus: string;
  queueMode: string;
  queueSubmittedAt: string;
  queueStartedAt: string;
  queueCompletedAt: string;
  queueRequestedBy: string;
  queueLaneId: string;
  queueTmuxSessionName: string;
  queueErrorMessage: string;
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

export type CertificateApprovePagePayload = Record<string, unknown> & {
  approvalRows?: Array<Record<string, unknown>>;
  certificateApprovalTotalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  requestType?: string;
  status?: string;
  certificateApprovalError?: string;
  certificateApprovalResultMessage?: string;
  canViewCertificateApprove?: boolean;
  canUseCertificateApproveAction?: boolean;
};

export type CertificatePendingPagePayload = Record<string, unknown> & {
  certificatePendingRows?: Array<Record<string, unknown>>;
  certificatePendingSummary?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  totalPages?: number;
  searchKeyword?: string;
  certificateType?: string;
  processStatus?: string;
  applicationId?: string;
  insttId?: string;
  selectedApplicationId?: string;
  selectedInsttId?: string;
  selectedInsttName?: string;
  selectedInsttNameEn?: string;
  canViewCertificatePending?: boolean;
  certificatePendingError?: string;
};

export type RefundAccountReviewPagePayload = Record<string, unknown> & {
  refundAccountRows?: Array<Record<string, unknown>>;
  refundAccountSummary?: Array<Record<string, unknown>>;
  refundAccountGuidance?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  verificationStatus?: string;
  payoutStatus?: string;
  canViewRefundAccountReview?: boolean;
  refundAccountReviewError?: string;
  isEn?: boolean;
};

export type CertificateObjectionListPagePayload = Record<string, unknown> & {
  certificateObjectionRows?: Array<Record<string, unknown>>;
  certificateObjectionSummary?: Array<Record<string, unknown>>;
  certificateObjectionGuidance?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  status?: string;
  priority?: string;
  canViewCertificateObjectionList?: boolean;
  certificateObjectionError?: string;
  isEn?: boolean;
};

export type CertificateReviewPagePayload = Record<string, unknown> & {
  certificateReviewRows?: Array<Record<string, unknown>>;
  certificateReviewSummary?: Array<Record<string, unknown>>;
  certificateReviewGuidance?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  status?: string;
  certificateType?: string;
  applicationId?: string;
  selectedRequestId?: string;
  canViewCertificateReview?: boolean;
  certificateReviewError?: string;
  isEn?: boolean;
};

export type CertificateRecCheckPagePayload = Record<string, unknown> & {
  duplicateGroups?: Array<Record<string, unknown>>;
  totalCount?: number;
  blockedCount?: number;
  reviewCount?: number;
  highestRisk?: number;
  lastRefreshedAt?: string;
  isEn?: boolean;
};

export type TradeDuplicatePagePayload = Record<string, unknown> & {
  abnormalTradeRows?: Array<Record<string, unknown>>;
  totalCount?: number;
  criticalCount?: number;
  reviewCount?: number;
  settlementBlockedCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  detectionType?: string;
  reviewStatus?: string;
  riskLevel?: string;
  detectionTypeOptions?: Array<Record<string, unknown>>;
  reviewStatusOptions?: Array<Record<string, unknown>>;
  riskLevelOptions?: Array<Record<string, unknown>>;
  escalationAlerts?: Array<Record<string, unknown>>;
  operatorGuidance?: Array<Record<string, unknown>>;
  lastRefreshedAt?: string;
  isEn?: boolean;
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
  currentUserInsttId?: string;
  canManageAllCompanies?: boolean;
  canManageOwnCompany?: boolean;
  memberManagementScopeMode?: string;
  memberManagementRequiresInsttId?: boolean;
  allowedMembershipTypes?: string[];
  memberTypeOptions?: Array<{ code: string; label: string }>;
  memberStatusOptions?: Array<{ code: string; label: string }>;
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
  currentUserInsttId?: string;
  canManageAllCompanies?: boolean;
  canManageOwnCompany?: boolean;
  memberManagementScopeMode?: string;
  memberManagementRequiresInsttId?: boolean;
  targetMemberInsttId?: string;
  targetMemberType?: string;
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
  expsrAtOptions?: string[];
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

export type NewPagePagePayload = Record<string, unknown> & {
  isEn?: boolean;
  pageId?: string;
  canonicalMenuUrl?: string;
  localizedMenuUrl?: string;
  menuCode?: string;
  menuName?: string;
  menuNameEn?: string;
  menuIcon?: string;
  useAt?: string;
  sortOrder?: number;
  requiredViewFeatureCode?: string;
  featureCount?: number;
  featureCodes?: string[];
  roleAssignments?: Array<Record<string, unknown>>;
  menuAncestry?: Array<Record<string, unknown>>;
  manifest?: Record<string, unknown>;
  governanceNotes?: Array<Record<string, string>>;
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
  securityHistoryActionRows?: Array<Record<string, string>>;
  securityHistoryActionByHistoryKey?: Record<string, Record<string, string>>;
  securityHistoryRelatedCountByHistoryKey?: Record<string, Record<string, number>>;
  securityHistoryAggregate?: Record<string, unknown>;
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

export type SecurityHistoryActionResponse = Record<string, unknown> & {
  success?: boolean;
  message?: string;
  savedAction?: Record<string, string>;
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
  departmentMappings?: Array<Record<string, string>>;
  memberAssignableAuthorGroups?: AuthorGroup[];
  memberAssignableAuthorGroupSections?: AuthorGroupSection[];
  roleProfilesByAuthorCode?: Record<string, AuthorRoleProfile>;
  currentUserInsttId?: string;
  canManageAllCompanies?: boolean;
  canManageOwnCompany?: boolean;
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
    integrityIssueCount?: number;
    highRiskExposureCount?: number;
    scopeViolationCount?: number;
    message?: string;
    autoCleanupExecutableCount?: number;
    codexReviewRequiredCount?: number;
    duplicatedMenuUrls?: Array<Record<string, string>>;
    duplicatedViewMappings?: Array<Record<string, string>>;
    menusMissingView?: Array<Record<string, string>>;
    inactiveAuthorFeatureRelations?: Array<Record<string, string>>;
    inactiveUserOverrides?: Array<Record<string, string>>;
    sensitiveRoleExposures?: Array<Record<string, string>>;
    companyScopeSensitiveExposures?: Array<Record<string, string>>;
    securityInsightItems?: Array<Record<string, string>>;
    securityInsightTotal?: number;
    securityInsightActionRequiredCount?: number;
    securityInsightGradeCounts?: Record<string, number>;
    securityInsightGate?: Record<string, unknown>;
    securityInsightConfig?: Record<string, unknown>;
    securityInsightExplorer?: Record<string, unknown>;
    securityInsightMessage?: string;
  };
  isEn?: boolean;
};

export type MenuPermissionAutoCleanupResponse = {
  success?: boolean;
  message?: string;
  disabledMenuCodes?: string[];
  processedMenuUrls?: string[];
  disabledMenuCount?: number;
  processedTargetCount?: number;
  diagnostics?: SecurityPolicyPagePayload["menuPermissionDiagnostics"];
};

export type SecurityMonitoringPagePayload = Record<string, unknown> & {
  securityMonitoringCards?: Array<Record<string, string>>;
  securityMonitoringTargets?: Array<Record<string, string>>;
  securityMonitoringIps?: Array<Record<string, string>>;
  securityMonitoringEvents?: Array<Record<string, string>>;
  securityMonitoringActivityRows?: Array<Record<string, string>>;
  securityMonitoringBlockCandidates?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type BlocklistPagePayload = Record<string, unknown> & {
  searchKeyword?: string;
  blockType?: string;
  status?: string;
  blocklistSummary?: Array<Record<string, string>>;
  blocklistRows?: Array<Record<string, string>>;
  blocklistReleaseQueue?: Array<Record<string, string>>;
  blocklistReleaseHistory?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type SecurityAuditPagePayload = Record<string, unknown> & {
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  searchKeyword?: string;
  actionType?: string;
  routeGroup?: string;
  startDate?: string;
  endDate?: string;
  sortKey?: string;
  sortDirection?: string;
  filteredBlockedCount?: number;
  filteredAllowedCount?: number;
  filteredUniqueActorCount?: number;
  filteredRouteCount?: number;
  filteredErrorCount?: number;
  filteredSlowCount?: number;
  filteredRepeatedActorCount?: number;
  filteredRepeatedTargetCount?: number;
  filteredRepeatedRemoteAddrCount?: number;
  latestSecurityAuditRow?: Record<string, string> | null;
  securityAuditSummary?: Array<Record<string, string>>;
  securityAuditRepeatedActors?: Array<Record<string, string>>;
  securityAuditRepeatedTargets?: Array<Record<string, string>>;
  securityAuditRepeatedRemoteAddrs?: Array<Record<string, string>>;
  securityAuditRows?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type CertificateAuditLogPagePayload = Record<string, unknown> & {
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  searchKeyword?: string;
  auditType?: string;
  status?: string;
  certificateType?: string;
  startDate?: string;
  endDate?: string;
  lastUpdated?: string;
  certificateAuditSummary?: Array<Record<string, string>>;
  certificateAuditAlerts?: Array<Record<string, string>>;
  certificateAuditRows?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type OperationsCenterPagePayload = Record<string, unknown> & {
  overallStatus?: string;
  refreshedAt?: string;
  summaryCards?: Array<Record<string, string> & { domainType?: string; targetRoute?: string }>;
  priorityItems?: Array<Record<string, string> & { domainType?: string; sourceType?: string }>;
  widgetGroups?: Array<Record<string, unknown> & { domainType?: string; targetRoute?: string; quickLinks?: Array<Record<string, string>> }>;
  navigationSections?: Array<Record<string, unknown> & { links?: Array<Record<string, string>> }>;
  recentActions?: Array<Record<string, string>>;
  playbooks?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type PerformancePagePayload = Record<string, unknown> & {
  overallStatus?: string;
  refreshedAt?: string;
  slowThresholdMs?: number;
  requestWindowSize?: number;
  runtimeSummary?: Array<Record<string, string>>;
  requestSummary?: Array<Record<string, string>>;
  hotspotRoutes?: Array<Record<string, string>>;
  recentSlowRequests?: Array<Record<string, string>>;
  responseStatusSummary?: Array<Record<string, string>>;
  quickLinks?: Array<Record<string, string>>;
  guidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalConnectionListPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalConnectionSummary?: Array<Record<string, string>>;
  externalConnectionRows?: Array<Record<string, string>>;
  externalConnectionIssueRows?: Array<Record<string, string>>;
  externalConnectionQuickLinks?: Array<Record<string, string>>;
  externalConnectionGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalSchemaPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalSchemaSummary?: Array<Record<string, string>>;
  externalSchemaRows?: Array<Record<string, string>>;
  externalSchemaReviewRows?: Array<Record<string, string>>;
  externalSchemaQuickLinks?: Array<Record<string, string>>;
  externalSchemaGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalKeysPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalKeysSummary?: Array<Record<string, string>>;
  externalKeyRows?: Array<Record<string, string>>;
  externalKeyRotationRows?: Array<Record<string, string>>;
  externalKeyQuickLinks?: Array<Record<string, string>>;
  externalKeyGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalUsagePagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalUsageSummary?: Array<Record<string, string>>;
  externalUsageRows?: Array<Record<string, string>>;
  externalUsageKeyRows?: Array<Record<string, string>>;
  externalUsageTrendRows?: Array<Record<string, string>>;
  externalUsageQuickLinks?: Array<Record<string, string>>;
  externalUsageGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalLogsPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalLogSummary?: Array<Record<string, string>>;
  externalLogRows?: Array<Record<string, string>>;
  externalLogIssueRows?: Array<Record<string, string>>;
  externalLogConnectionRows?: Array<Record<string, string>>;
  externalLogQuickLinks?: Array<Record<string, string>>;
  externalLogGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalConnectionFormPagePayload = Record<string, unknown> & {
  connectionProfile?: Record<string, string>;
  refreshedAt?: string;
  externalConnectionFormSummary?: Array<Record<string, string>>;
  externalConnectionIssueRows?: Array<Record<string, string>>;
  externalConnectionQuickLinks?: Array<Record<string, string>>;
  externalConnectionGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
  mode?: string;
  success?: boolean;
  message?: string;
};

export type ExternalWebhooksPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  keyword?: string;
  syncMode?: string;
  status?: string;
  externalWebhookSummary?: Array<Record<string, string>>;
  externalWebhookRows?: Array<Record<string, string>>;
  externalWebhookDeliveryRows?: Array<Record<string, string>>;
  externalWebhookQuickLinks?: Array<Record<string, string>>;
  externalWebhookGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalSyncPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  externalSyncSummary?: Array<Record<string, string>>;
  externalSyncRows?: Array<Record<string, string>>;
  externalSyncQueueRows?: Array<Record<string, string>>;
  externalSyncExecutionRows?: Array<Record<string, string>>;
  externalSyncQuickLinks?: Array<Record<string, string>>;
  externalSyncGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalMonitoringPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalMonitoringSummary?: Array<Record<string, string>>;
  externalMonitoringRows?: Array<Record<string, string>>;
  externalMonitoringAlertRows?: Array<Record<string, string>>;
  externalMonitoringTimelineRows?: Array<Record<string, string>>;
  externalMonitoringQuickLinks?: Array<Record<string, string>>;
  externalMonitoringGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalMaintenancePagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  externalMaintenanceSummary?: Array<Record<string, string>>;
  externalMaintenanceRows?: Array<Record<string, string>>;
  externalMaintenanceImpactRows?: Array<Record<string, string>>;
  externalMaintenanceRunbooks?: Array<Record<string, string>>;
  externalMaintenanceQuickLinks?: Array<Record<string, string>>;
  externalMaintenanceGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type ExternalRetryPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  overallStatus?: string;
  externalRetrySummary?: Array<Record<string, string>>;
  externalRetryRows?: Array<Record<string, string>>;
  externalRetryPolicyRows?: Array<Record<string, string>>;
  externalRetryExecutionRows?: Array<Record<string, string>>;
  externalRetryQuickLinks?: Array<Record<string, string>>;
  externalRetryGuidance?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type SensorListPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  totalCount?: number;
  sensorSummary?: Array<Record<string, string>>;
  sensorRows?: Array<Record<string, string>>;
  sensorActivityRows?: Array<Record<string, string>>;
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

export type BatchManagementPagePayload = Record<string, unknown> & {
  refreshedAt?: string;
  batchSummary?: Array<Record<string, string>>;
  batchJobRows?: Array<Record<string, string>>;
  batchQueueRows?: Array<Record<string, string>>;
  batchNodeRows?: Array<Record<string, string>>;
  batchExecutionRows?: Array<Record<string, string>>;
  batchRunbooks?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type BackupConfigPagePayload = Record<string, unknown> & {
  backupConfigSummary?: Array<Record<string, string>>;
  backupConfigForm?: Record<string, string>;
  backupStorageRows?: Array<Record<string, string>>;
  backupExecutionRows?: Array<Record<string, string>>;
  backupVersionRows?: Array<Record<string, string>>;
  backupGitPrecheckRows?: Array<Record<string, string>>;
  backupRestoreGitRows?: Array<Record<string, string>>;
  backupRestoreSqlRows?: Array<Record<string, string>>;
  backupRestorePhysicalRows?: Array<Record<string, string>>;
  backupRestorePitrInfo?: Record<string, string>;
  backupRecoveryPlaybooks?: Array<Record<string, string>>;
  backupCurrentJob?: Record<string, unknown> | null;
  backupRecentJobs?: Array<Record<string, unknown>>;
  canUseBackupConfigSave?: boolean;
  canUseBackupExecution?: boolean;
  canUseDbBackupExecution?: boolean;
  canUseGitBackupExecution?: boolean;
  backupConfigUpdated?: boolean;
  backupConfigMessage?: string;
  backupJobStarted?: boolean;
  backupJobId?: string;
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
    parallelLanes?: number;
  };
  srTicketCount?: number;
  srTickets?: SrTicketRow[];
  executionLaneCount?: number;
  executionLanes?: Array<Record<string, unknown>>;
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

export type TradeListPagePayload = Record<string, unknown> & {
  tradeRows?: Array<Record<string, unknown>>;
  totalCount?: number;
  matchingCount?: number;
  settlementPendingCount?: number;
  completedCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  tradeStatus?: string;
  settlementStatus?: string;
  tradeStatusOptions?: Array<Record<string, unknown>>;
  settlementStatusOptions?: Array<Record<string, unknown>>;
  settlementAlerts?: Array<Record<string, unknown>>;
  isEn?: boolean;
};

export type TradeStatisticsPagePayload = Record<string, unknown> & {
  totalTradeVolume?: number;
  totalSettlementAmount?: number;
  pendingSettlementCount?: number;
  exceptionCount?: number;
  settlementCompletionRate?: string;
  avgSettlementDays?: string;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  searchKeyword?: string;
  periodFilter?: string;
  tradeType?: string;
  settlementStatus?: string;
  monthlyRows?: Array<Record<string, unknown>>;
  tradeTypeRows?: Array<Record<string, unknown>>;
  institutionRows?: Array<Record<string, unknown>>;
  alertRows?: Array<Record<string, unknown>>;
  isEn?: boolean;
};

export type SettlementCalendarPagePayload = Record<string, unknown> & {
  selectedMonth?: string;
  searchKeyword?: string;
  settlementStatus?: string;
  riskLevel?: string;
  totalScheduledCount?: number;
  dueTodayCount?: number;
  highRiskCount?: number;
  completedCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  monthOptions?: Array<Record<string, unknown>>;
  settlementStatusOptions?: Array<Record<string, unknown>>;
  riskLevelOptions?: Array<Record<string, unknown>>;
  calendarDays?: Array<Record<string, unknown>>;
  scheduleRows?: Array<Record<string, unknown>>;
  alertRows?: Array<Record<string, unknown>>;
  isEn?: boolean;
};

export type RefundListPagePayload = Record<string, unknown> & {
  refundRows?: Array<Record<string, unknown>>;
  totalCount?: number;
  pendingCount?: number;
  inReviewCount?: number;
  transferScheduledCount?: number;
  completedCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  status?: string;
  riskLevel?: string;
  statusOptions?: Array<Record<string, unknown>>;
  riskLevelOptions?: Array<Record<string, unknown>>;
  refundAlerts?: Array<Record<string, unknown>>;
  isEn?: boolean;
};

export type TradeApprovePagePayload = Record<string, unknown> & {
  approvalRows?: Array<Record<string, unknown>>;
  totalCount?: number;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  holdCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  approvalStatus?: string;
  tradeType?: string;
  approvalStatusOptions?: Array<Record<string, unknown>>;
  tradeTypeOptions?: Array<Record<string, unknown>>;
  canViewTradeApprove?: boolean;
  canUseTradeApproveAction?: boolean;
  isEn?: boolean;
};

export type RefundProcessPagePayload = Record<string, unknown> & {
  refundRows?: Array<Record<string, unknown>>;
  refundSummary?: Array<Record<string, unknown>>;
  refundGuidance?: Array<Record<string, unknown>>;
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  refundStatus?: string;
  refundChannel?: string;
  priority?: string;
  canViewRefundProcess?: boolean;
  isEn?: boolean;
};

export type TradeRejectPagePayload = Record<string, unknown> & {
  found?: boolean;
  tradeId?: string;
  returnUrl?: string;
  listUrl?: string;
  pageError?: string;
  productType?: string;
  sellerName?: string;
  buyerName?: string;
  contractName?: string;
  quantity?: string;
  amount?: string;
  requestedAt?: string;
  tradeStatusCode?: string;
  tradeStatusLabel?: string;
  settlementStatusCode?: string;
  settlementStatusLabel?: string;
  blockerCount?: number;
  evidenceCount?: number;
  historyCount?: number;
  suggestedReason?: string;
  rejectionChecklist?: Array<Record<string, unknown>>;
  rejectionReasons?: Array<Record<string, unknown>>;
  evidenceRows?: Array<Record<string, unknown>>;
  historyRows?: Array<Record<string, unknown>>;
  notificationPlan?: Array<Record<string, unknown>>;
  quickLinks?: Array<Record<string, unknown>>;
  isEn?: boolean;
};

export type EmissionResultDetailPagePayload = Record<string, unknown> & {
  found?: boolean;
  resultId?: string;
  projectName?: string;
  companyName?: string;
  calculatedAt?: string;
  totalEmission?: string;
  resultStatusCode?: string;
  resultStatusLabel?: string;
  verificationStatusCode?: string;
  verificationStatusLabel?: string;
  reportPeriod?: string;
  submittedAt?: string;
  formulaVersion?: string;
  verificationOwner?: string;
  reviewMessage?: string;
  reviewChecklist?: Array<Record<string, unknown>>;
  siteRows?: Array<Record<string, unknown>>;
  evidenceRows?: Array<Record<string, unknown>>;
  historyRows?: Array<Record<string, unknown>>;
  siteCount?: number;
  evidenceCount?: number;
  listUrl?: string;
  verificationActionUrl?: string;
  historyUrl?: string;
  pageError?: string;
  isEn?: boolean;
};

export type CertificateStatisticsPagePayload = Record<string, unknown> & {
  totalIssuedCount?: number;
  pendingCount?: number;
  rejectedCount?: number;
  reissuedCount?: number;
  totalRequestCount?: number;
  avgLeadDays?: string;
  issuanceRate?: string;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  searchKeyword?: string;
  periodFilter?: string;
  certificateType?: string;
  issuanceStatus?: string;
  monthlyRows?: Array<Record<string, string>>;
  certificateTypeRows?: Array<Record<string, string>>;
  institutionRows?: Array<Record<string, string>>;
  alertRows?: Array<Record<string, string>>;
  isEn?: boolean;
};

export type EmissionDataHistoryPagePayload = Record<string, unknown> & {
  historyRows?: Array<Record<string, unknown>>;
  totalCount?: number;
  correctionCount?: number;
  approvalCount?: number;
  schemaCount?: number;
  summaryCards?: Array<Record<string, unknown>>;
  pageIndex?: number;
  pageSize?: number;
  totalPages?: number;
  searchKeyword?: string;
  changeType?: string;
  changeTarget?: string;
  changeTypeOptions?: Array<Record<string, unknown>>;
  changeTargetOptions?: Array<Record<string, unknown>>;
  changeTypeMeta?: Record<string, Record<string, unknown>>;
  changeTargetMeta?: Record<string, Record<string, unknown>>;
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
const ADMIN_MENU_CODE_LABEL_OVERRIDES_KO: Record<string, string> = {
  A001: "회원",
  A00101: "회원",
  A00105: "이력",
  A002: "배출/인증",
  A00201: "배출",
  A003: "거래",
  A004: "콘텐츠",
  A005: "외부 연계",
  A006: "시스템",
  A00601: "환경",
  A00602: "보안",
  A00603: "로그",
  A00604: "백업",
  A007: "대시보드",
  A00701: "대시보드",
  A190: "AI 운영",
  A19001: "AI 작업센터",
  AMENU_AUTH: "권한",
  AMENU_MEMBER: "회원",
  AMENU_COMPANY: "회원사",
  AMENU_ADMIN: "관리자",
  AMENU_SYSTEM: "시스템"
};
const ADMIN_MENU_CODE_LABEL_OVERRIDES_EN: Record<string, string> = {
  A001: "Members",
  A00101: "Members",
  A00105: "History",
  A002: "Emission",
  A00201: "Emission",
  A003: "Trading",
  A004: "Content",
  A005: "Integrations",
  A006: "System",
  A00601: "Environment",
  A00602: "Security",
  A00603: "Logs",
  A00604: "Backup",
  A007: "Dashboard",
  A00701: "Dashboard",
  A190: "AI Ops",
  A19001: "AI Workbench",
  AMENU_AUTH: "Authority",
  AMENU_MEMBER: "Members",
  AMENU_COMPANY: "Company",
  AMENU_ADMIN: "Admins",
  AMENU_SYSTEM: "System"
};
type BootstrapPayloadKey =
  | "frontendSession"
  | "adminMenuTree"
  | "adminHomePageData"
  | "newPagePageData"
  | "authGroupPageData"
  | "authChangePageData"
  | "deptRolePageData"
  | "memberEditPageData"
  | "homePayload"
  | "mypagePayload"
  | "mypageContext"
  | "memberStatsPageData"
  | "tradeListPageData"
  | "tradeStatisticsPageData"
  | "settlementCalendarPageData"
  | "tradeDuplicatePageData"
  | "refundListPageData"
  | "tradeApprovePageData"
  | "tradeRejectPageData"
  | "certificateReviewPageData"
  | "securityPolicyPageData"
  | "notificationPageData"
  | "externalMonitoringPageData"
  | "securityMonitoringPageData"
  | "securityAuditPageData"
  | "certificateAuditLogPageData"
  | "certificateRecCheckPageData"
  | "schedulerManagementPageData"
  | "backupConfigPageData"
  | "emissionResultListPageData"
  | "emissionResultDetailPageData"
  | "certificateStatisticsPageData"
  | "emissionDataHistoryPageData"
  | "emissionDefinitionStudioPageData"
  | "emissionSiteManagementPageData"
  | "emissionValidatePageData"
  | "screenBuilderPageData";
let runtimeBootstrapCache: Partial<Record<BootstrapPayloadKey, unknown>> = {};
let runtimeBootstrapCachePath = "";
const SESSION_STORAGE_CACHE_PREFIX = "carbonet:api-cache:v3:";
const FRONTEND_SESSION_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}frontend-session`;
const ADMIN_MENU_TREE_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}admin-menu-tree`;
const HOME_PAYLOAD_STORAGE_KEY_KO = `${SESSION_STORAGE_CACHE_PREFIX}home-payload:ko`;
const HOME_PAYLOAD_STORAGE_KEY_EN = `${SESSION_STORAGE_CACHE_PREFIX}home-payload:en`;
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

function isLikelyAdminMenuCodeLabel(value: string) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return false;
  }
  return /^[A-Z][A-Z0-9_]{3,}$/.test(normalized) || /^[A-Z]\d{3,}$/.test(normalized);
}

function resolveAdminMenuCodeLabel(value: string, en: boolean) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    return "";
  }
  return en
    ? (ADMIN_MENU_CODE_LABEL_OVERRIDES_EN[normalized] || "")
    : (ADMIN_MENU_CODE_LABEL_OVERRIDES_KO[normalized] || "");
}

function normalizeAdminMenuText(value: string | undefined, en: boolean) {
  const fallback = String(value || "").trim();
  if (!isLikelyAdminMenuCodeLabel(fallback)) {
    return fallback;
  }
  return resolveAdminMenuCodeLabel(fallback, en) || fallback;
}

function normalizeAdminMenuTree(payload: AdminMenuTreePayload | null | undefined): AdminMenuTreePayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const normalizedTree = Object.entries(payload).reduce<AdminMenuTreePayload>((accumulator, [domainKey, domain]) => {
    const normalizedDomain: AdminMenuDomain = {
      ...domain,
      label: normalizeAdminMenuText(domain?.label || domainKey, false),
      labelEn: normalizeAdminMenuText(domain?.labelEn || domain?.label || domainKey, true),
      groups: (domain?.groups || []).map((group) => {
        const normalizedLinks = (group?.links || []).map((link) => ({
          ...link,
          text: normalizeAdminMenuText(link?.text, false),
          tEn: normalizeAdminMenuText(link?.tEn || link?.text, true)
        }));
        const fallbackGroupKo = normalizeAdminMenuText(group?.title, false);
        const fallbackGroupEn = normalizeAdminMenuText(group?.titleEn || group?.title, true);
        const firstLink = normalizedLinks[0];
        return {
          ...group,
          title: isLikelyAdminMenuCodeLabel(fallbackGroupKo) && firstLink?.text
            ? firstLink.text
            : fallbackGroupKo,
          titleEn: isLikelyAdminMenuCodeLabel(fallbackGroupEn)
            ? (firstLink?.tEn || firstLink?.text || fallbackGroupEn)
            : fallbackGroupEn,
          links: normalizedLinks
        };
      })
    };
    accumulator[domainKey] = normalizedDomain;
    return accumulator;
  }, {});
  return normalizedTree;
}

function buildPageCacheKey(path: string) {
  return `${SESSION_STORAGE_CACHE_PREFIX}${path}`;
}

function currentBootstrapScopePath() {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.pathname}${window.location.search}`;
}

function syncRuntimeBootstrapCacheScope() {
  const nextPath = currentBootstrapScopePath();
  if (runtimeBootstrapCachePath === nextPath) {
    return;
  }
  runtimeBootstrapCache = {};
  runtimeBootstrapCachePath = nextPath;
}

function consumeRuntimeBootstrap<T>(key: BootstrapPayloadKey): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  syncRuntimeBootstrapCacheScope();
  const bootstrapStore = window.__CARBONET_REACT_BOOTSTRAP__ as Partial<Record<BootstrapPayloadKey, unknown>> | undefined;
  if (!bootstrapStore) {
    return (runtimeBootstrapCache[key] as T | undefined) ?? null;
  }
  const payload = bootstrapStore[key] as T | undefined;
  if (typeof payload === "undefined") {
    return (runtimeBootstrapCache[key] as T | undefined) ?? null;
  }
  runtimeBootstrapCache[key] = payload;
  delete bootstrapStore[key];
  return payload ?? null;
}

function mergeRuntimeBootstrap(payload: Partial<Record<BootstrapPayloadKey, unknown>>) {
  if (typeof window === "undefined") {
    return;
  }
  if (!window.__CARBONET_REACT_BOOTSTRAP__) {
    window.__CARBONET_REACT_BOOTSTRAP__ = {} as Partial<Record<BootstrapPayloadKey, unknown>>;
  }
  Object.assign(window.__CARBONET_REACT_BOOTSTRAP__ as Partial<Record<BootstrapPayloadKey, unknown>>, payload);
}

function resolveHomePayloadStorageKey(isEn: boolean) {
  return isEn ? HOME_PAYLOAD_STORAGE_KEY_EN : HOME_PAYLOAD_STORAGE_KEY_KO;
}

function writeHomePayloadCache(payload: BootstrappedHomePayload | null | undefined) {
  if (!payload) {
    return;
  }
  writeSessionStorageCache(resolveHomePayloadStorageKey(Boolean(payload.isEn)), payload, SESSION_CACHE_TTL_MS);
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
  const body = await readJsonResponse<T>(response).catch((error) => {
    if (error instanceof Error && error.message.includes("Authentication required")) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("Server returned HTML instead of JSON")) {
      throw error;
    }
    return {} as T;
  });
  if (!response.ok) {
    throw new Error(options.mapError?.(body, response.status) || `Failed to load page: ${response.status}`);
  }
  writeSessionStorageCache(options.cacheKey, body as T, options.ttlMs ?? DEFAULT_PAGE_CACHE_TTL_MS);
  return body as T;
}

async function fetchJsonWithoutCache<T>(options: {
  url: string;
  mapError?: (body: any, status: number) => string;
}): Promise<T> {
  const response = await fetch(options.url, {
    credentials: "include"
  });
  const body = await readJsonResponse<T>(response).catch((error) => {
    if (error instanceof Error && error.message.includes("Authentication required")) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("Server returned HTML instead of JSON")) {
      throw error;
    }
    return {} as T;
  });
  if (!response.ok) {
    throw new Error(options.mapError?.(body, response.status) || `Failed to load page: ${response.status}`);
  }
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

export function readAdminMenuTreeSnapshot(): AdminMenuTreePayload | null {
  const bootstrappedMenuTree = normalizeAdminMenuTree(
    consumeRuntimeBootstrap<AdminMenuTreePayload>("adminMenuTree")
  );
  if (bootstrappedMenuTree) {
    adminMenuTreeCache = bootstrappedMenuTree;
    writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, bootstrappedMenuTree, SESSION_CACHE_TTL_MS);
    return bootstrappedMenuTree;
  }

  const storedMenuTree = normalizeAdminMenuTree(
    readSessionStorageCache<AdminMenuTreePayload>(ADMIN_MENU_TREE_STORAGE_KEY)
  );
  if (storedMenuTree) {
    adminMenuTreeCache = storedMenuTree;
    return storedMenuTree;
  }

  return adminMenuTreeCache;
}

export function readFrontendSessionSnapshot(): FrontendSession | null {
  const bootstrappedSession = consumeRuntimeBootstrap<FrontendSession>("frontendSession");
  if (bootstrappedSession) {
    frontendSessionCache = bootstrappedSession;
    writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, bootstrappedSession, SESSION_CACHE_TTL_MS);
    return bootstrappedSession;
  }

  const storedSession = readSessionStorageCache<FrontendSession>(FRONTEND_SESSION_STORAGE_KEY);
  if (storedSession) {
    frontendSessionCache = storedSession;
    return storedSession;
  }

  return frontendSessionCache;
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

export async function fetchAdminSessionSimulator(insttId?: string): Promise<AdminSessionSimulationPayload> {
  const url = new URL(buildAdminApiPath("/api/admin/dev/session-simulator"), window.location.origin);
  if (insttId) {
    url.searchParams.set("insttId", insttId);
  }
  const response = await fetch(url.toString(), {
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

export async function applyAdminSessionSimulator(
  _session: FrontendSession,
  payload: { insttId: string; emplyrId: string; authorCode: string; }
): Promise<AdminSessionSimulationPayload> {
  const headers = await buildResilientCsrfHeaders({
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  });
  const response = await fetch(buildAdminApiPath("/api/admin/dev/session-simulator"), {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(payload)
  });
  invalidateFrontendSessionCache();
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

export async function resetAdminSessionSimulator(session: FrontendSession): Promise<AdminSessionSimulationPayload> {
  void session;
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  const response = await fetch(buildAdminApiPath("/api/admin/dev/session-simulator"), {
    method: "DELETE",
    credentials: "include",
    headers
  });
  invalidateFrontendSessionCache();
  return readJsonResponse<AdminSessionSimulationPayload>(response);
}

async function fetchFreshFrontendSession(): Promise<FrontendSession> {
  const response = await globalThis.fetch("/api/frontend/session", {
    credentials: "include",
    cache: "no-store",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to load session: ${response.status}`);
  }
  const session = await response.json() as FrontendSession;
  frontendSessionCache = session;
  writeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY, session, SESSION_CACHE_TTL_MS);
  return session;
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

export async function fetchTagManagementPage(params?: { searchKeyword?: string; status?: string; }): Promise<TagManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/tag", "/en/admin/api/admin/content/tag")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<TagManagementPagePayload>(response);
}

export async function fetchFaqManagementPage(params?: {
  searchKeyword?: string;
  status?: string;
  exposure?: string;
  category?: string;
  faqId?: string;
}): Promise<FaqManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.exposure) search.set("exposure", params.exposure);
  if (params?.category) search.set("category", params.category);
  if (params?.faqId) search.set("faqId", params.faqId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/faq", "/en/admin/api/admin/content/faq")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<FaqManagementPagePayload>(response);
}

export async function fetchFileManagementPage(params?: {
  searchKeyword?: string;
  status?: string;
  visibility?: string;
  fileId?: string;
}): Promise<FileManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.visibility) search.set("visibility", params.visibility);
  if (params?.fileId) search.set("fileId", params.fileId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/file", "/en/admin/api/admin/content/file")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<FileManagementPagePayload>(response);
}

export async function saveFileManagementPage(payload: {
  uploadFile: File;
  category: string;
  visibility: string;
  status: string;
  description: string;
}): Promise<FileManagementSaveResponse> {
  const form = new FormData();
  form.set("uploadFile", payload.uploadFile);
  form.set("category", payload.category);
  form.set("visibility", payload.visibility);
  form.set("status", payload.status);
  form.set("description", payload.description);

  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/file/save", "/en/admin/api/admin/content/file/save"), {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  return readJsonResponse<FileManagementSaveResponse>(response);
}

export async function replaceFileManagementPage(payload: {
  fileId: string;
  uploadFile: File;
}): Promise<FileManagementSaveResponse> {
  const form = new FormData();
  form.set("fileId", payload.fileId);
  form.set("uploadFile", payload.uploadFile);
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/file/replace", "/en/admin/api/admin/content/file/replace"), {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  return readJsonResponse<FileManagementSaveResponse>(response);
}

export async function deleteFileManagementPage(fileId: string): Promise<{ success: boolean; message?: string; fileId?: string; }> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/file/delete", "/en/admin/api/admin/content/file/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: new URLSearchParams({ fileId }).toString()
  });
  return readJsonResponse<{ success: boolean; message?: string; fileId?: string; }>(response);
}

export async function restoreFileManagementPage(fileId: string, restoreNote?: string): Promise<FileManagementSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/file/restore", "/en/admin/api/admin/content/file/restore"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: new URLSearchParams({
      fileId,
      restoreNote: restoreNote || ""
    }).toString()
  });
  return readJsonResponse<FileManagementSaveResponse>(response);
}

export async function updateFileManagementPage(payload: {
  fileId: string;
  category: string;
  visibility: string;
  status: string;
  description: string;
}): Promise<FileManagementSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/file/update", "/en/admin/api/admin/content/file/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: new URLSearchParams({
      fileId: payload.fileId,
      category: payload.category,
      visibility: payload.visibility,
      status: payload.status,
      description: payload.description
    }).toString()
  });
  return readJsonResponse<FileManagementSaveResponse>(response);
}

export async function fetchPostManagementPage(params?: {
  searchKeyword?: string;
  status?: string;
  category?: string;
  selectedPostId?: string;
}): Promise<PostManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.category) search.set("category", params.category);
  if (params?.selectedPostId) search.set("selectedPostId", params.selectedPostId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/post", "/en/admin/api/admin/content/post")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<PostManagementPagePayload>(response);
}

export async function fetchBoardDistributionPage(): Promise<BoardDistributionPagePayload> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/board/detail", "/en/admin/api/admin/content/board/detail"), {
    credentials: "include"
  });
  return readJsonResponse<BoardDistributionPagePayload>(response);
}

export async function fetchBoardManagementPage(): Promise<BoardManagementPagePayload> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/board/list", "/en/admin/api/admin/content/board/list"), {
    credentials: "include"
  });
  return readJsonResponse<BoardManagementPagePayload>(response);
}

export async function saveBoardDistributionPage(payload: BoardDistributionSavePayload): Promise<BoardDistributionSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/board/save", "/en/admin/api/admin/content/board/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<BoardDistributionSaveResponse>(response);
}

export async function saveFaqManagementPage(payload: {
  faqId: string;
  category: string;
  question: string;
  answerScope: string;
  exposure: string;
  status: string;
  displayOrder: string;
}): Promise<FaqSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/faq/save", "/en/admin/api/admin/content/faq/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: new URLSearchParams({
      faqId: payload.faqId,
      category: payload.category,
      question: payload.question,
      answerScope: payload.answerScope,
      exposure: payload.exposure,
      status: payload.status,
      displayOrder: payload.displayOrder
    }).toString()
  });
  return readJsonResponse<FaqSaveResponse>(response);
}

export async function fetchQnaCategoryPage(params?: { searchKeyword?: string; useAt?: string; channel?: string; categoryId?: string; }): Promise<QnaCategoryPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.useAt) search.set("useAt", params.useAt);
  if (params?.channel) search.set("channel", params.channel);
  if (params?.categoryId) search.set("categoryId", params.categoryId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/qna", "/en/admin/api/admin/content/qna")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<QnaCategoryPagePayload>(response);
}

export async function saveQnaCategory(payload: QnaCategorySavePayload): Promise<{ success: boolean; message: string; categoryId?: string; category?: Record<string, string> }> {
  const { token, headerName } = getCsrfMeta();
  const response = await fetch(buildAdminApiPath("/api/admin/content/qna/save"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [headerName]: token } : {})
    },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response);
}

export async function deleteQnaCategory(categoryId: string): Promise<{ success: boolean; message: string; categoryId?: string }> {
  const { token, headerName } = getCsrfMeta();
  const response = await fetch(buildAdminApiPath("/api/admin/content/qna/delete"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [headerName]: token } : {})
    },
    body: JSON.stringify({ categoryId })
  });
  return readJsonResponse(response);
}

export async function fetchEmissionGwpValuesPage(params?: {
  searchKeyword?: string;
  sectionCode?: string;
  rowId?: string;
  pdfComparePolicy?: string;
  includePdfCompare?: boolean;
  pdfCompareScope?: string;
}): Promise<EmissionGwpValuesPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.sectionCode) search.set("sectionCode", params.sectionCode);
  if (params?.rowId) search.set("rowId", params.rowId);
  if (params?.pdfComparePolicy) search.set("pdfComparePolicy", params.pdfComparePolicy);
  if (params?.includePdfCompare) search.set("includePdfCompare", "true");
  if (params?.pdfCompareScope) search.set("pdfCompareScope", params.pdfCompareScope);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/emission/gwp-values/page-data", "/en/admin/emission/gwp-values/page-data")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<EmissionGwpValuesPagePayload>(response);
}

export async function saveEmissionGwpValue(payload: EmissionGwpValueSavePayload): Promise<EmissionGwpValueSaveResponse> {
  const { token, headerName } = getCsrfMeta();
  const response = await fetch(buildAdminApiPath("/emission/api/gwp-values/save"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [headerName]: token } : {})
    },
    body: JSON.stringify(payload)
  });
  return readJsonResponse(response);
}

export async function deleteEmissionGwpValue(rowId: string): Promise<{ success: boolean; message: string; rowId?: string }> {
  const { token, headerName } = getCsrfMeta();
  const response = await fetch(buildAdminApiPath("/emission/api/gwp-values/delete"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [headerName]: token } : {})
    },
    body: JSON.stringify({ rowId })
  });
  return readJsonResponse(response);
}

export async function fetchBannerManagementPage(params?: {
  searchKeyword?: string;
  status?: string;
  placement?: string;
  selectedBannerId?: string;
}): Promise<BannerManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.placement) search.set("placement", params.placement);
  if (params?.selectedBannerId) search.set("selectedBannerId", params.selectedBannerId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/banner", "/en/admin/api/admin/content/banner")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<BannerManagementPagePayload>(response);
}

export async function fetchBannerEditPage(bannerId: string): Promise<BannerEditPagePayload> {
  const query = bannerId ? `?bannerId=${encodeURIComponent(bannerId)}` : "";
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/banner/detail", "/en/admin/api/admin/content/banner/detail")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<BannerEditPagePayload>(response);
}

export async function saveBannerEditPage(payload: {
  bannerId: string;
  title: string;
  targetUrl: string;
  status: string;
  startAt: string;
  endAt: string;
}): Promise<BannerSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/banner/save", "/en/admin/api/admin/content/banner/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: new URLSearchParams({
      bannerId: payload.bannerId,
      title: payload.title,
      targetUrl: payload.targetUrl,
      status: payload.status,
      startAt: payload.startAt,
      endAt: payload.endAt
    }).toString()
  });
  return readJsonResponse<BannerSaveResponse>(response);
}

export async function fetchPopupEditPage(popupId: string): Promise<PopupEditPagePayload> {
  const query = popupId ? `?popupId=${encodeURIComponent(popupId)}` : "";
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/popup/detail", "/en/admin/api/admin/content/popup/detail")}${query}`, {
    credentials: "include"
  });
  return readJsonResponse<PopupEditPagePayload>(response);
}

export async function fetchPopupListPage(params?: {
  searchKeyword?: string;
  status?: string;
  targetAudience?: string;
  selectedPopupId?: string;
}): Promise<PopupListPagePayload> {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.targetAudience) search.set("targetAudience", params.targetAudience);
  if (params?.selectedPopupId) search.set("selectedPopupId", params.selectedPopupId);
  const query = search.toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/content/popup", "/en/admin/api/admin/content/popup")}${query ? `?${query}` : ""}`, {
    credentials: "include"
  });
  return readJsonResponse<PopupListPagePayload>(response);
}

export async function savePopupEditPage(payload: {
  popupId: string;
  popupTitle: string;
  popupType: string;
  exposureStatus: string;
  priority: string;
  useAt: string;
  targetAudience: string;
  displayScope: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  closePolicy: string;
  width: string;
  height: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  ownerName: string;
  ownerContact: string;
  notes: string;
}): Promise<PopupSaveResponse> {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/content/popup/save", "/en/admin/api/admin/content/popup/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<PopupSaveResponse>(response);
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
  const cachedMenuTree = readAdminMenuTreeSnapshot();

  if (!adminMenuTreePromise) {
    adminMenuTreePromise = fetch(buildLocalizedPath("/admin/system/menu-data", "/en/admin/system/menu-data"), {
      credentials: "include",
      cache: "no-store",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then((response) => readJsonResponse<AdminMenuTreePayload>(response))
      .then((payload) => {
        const normalizedPayload = normalizeAdminMenuTree(payload) || payload;
        adminMenuTreeCache = normalizedPayload;
        writeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY, normalizedPayload, SESSION_CACHE_TTL_MS);
        return normalizedPayload;
      })
      .catch((error) => {
        if (cachedMenuTree) {
          adminMenuTreeCache = cachedMenuTree;
          return cachedMenuTree;
        }
        throw error;
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
  const bootstrappedPayload = consumeRuntimeBootstrap<BootstrappedHomePayload>("homePayload");
  if (bootstrappedPayload) {
    writeHomePayloadCache(bootstrappedPayload);
    return bootstrappedPayload;
  }
  return readSessionStorageCache<BootstrappedHomePayload>(
    resolveHomePayloadStorageKey(getRuntimeLocale() === "en")
  );
}

export async function fetchHomePayload(): Promise<BootstrappedHomePayload> {
  const response = await fetch(buildLocalizedPath("/api/home", "/en/api/home"), {
    credentials: "include"
  });
  const payload = await readJsonResponse<BootstrappedHomePayload>(response);
  writeHomePayloadCache(payload);
  return payload;
}

export function readBootstrappedAdminHomePageData(): AdminHomePagePayload | null {
  return consumeRuntimeBootstrap<AdminHomePagePayload>("adminHomePageData");
}

export function readBootstrappedNewPagePageData(): NewPagePagePayload | null {
  return consumeRuntimeBootstrap<NewPagePagePayload>("newPagePageData");
}

export function readBootstrappedEmissionDefinitionStudioPageData(): EmissionDefinitionStudioPagePayload | null {
  return consumeRuntimeBootstrap<EmissionDefinitionStudioPagePayload>("emissionDefinitionStudioPageData");
}

export function readBootstrappedAuthGroupPageData(): AuthGroupPagePayload | null {
  return consumeRuntimeBootstrap<AuthGroupPagePayload>("authGroupPageData");
}

export function readBootstrappedAuthChangePageData(): AuthChangePagePayload | null {
  return consumeRuntimeBootstrap<AuthChangePagePayload>("authChangePageData");
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

export function readBootstrappedTradeDuplicatePageData(): TradeDuplicatePagePayload | null {
  return consumeRuntimeBootstrap<TradeDuplicatePagePayload>("tradeDuplicatePageData");
}

export function readBootstrappedSecurityPolicyPageData(): SecurityPolicyPagePayload | null {
  return consumeRuntimeBootstrap<SecurityPolicyPagePayload>("securityPolicyPageData");
}

export function readBootstrappedNotificationPageData(): SecurityPolicyPagePayload | null {
  return consumeRuntimeBootstrap<SecurityPolicyPagePayload>("notificationPageData")
    || consumeRuntimeBootstrap<SecurityPolicyPagePayload>("securityPolicyPageData");
}

export function readBootstrappedExternalMonitoringPageData(): ExternalMonitoringPagePayload | null {
  return consumeRuntimeBootstrap<ExternalMonitoringPagePayload>("externalMonitoringPageData");
}

export function readBootstrappedSecurityMonitoringPageData(): SecurityMonitoringPagePayload | null {
  return consumeRuntimeBootstrap<SecurityMonitoringPagePayload>("securityMonitoringPageData");
}

export function readBootstrappedSecurityAuditPageData(): SecurityAuditPagePayload | null {
  return consumeRuntimeBootstrap<SecurityAuditPagePayload>("securityAuditPageData");
}

export function readBootstrappedCertificateAuditLogPageData(): CertificateAuditLogPagePayload | null {
  return consumeRuntimeBootstrap<CertificateAuditLogPagePayload>("certificateAuditLogPageData");
}

export function readBootstrappedCertificateRecCheckPageData(): CertificateRecCheckPagePayload | null {
  return consumeRuntimeBootstrap<CertificateRecCheckPagePayload>("certificateRecCheckPageData");
}

export function readBootstrappedSchedulerManagementPageData(): SchedulerManagementPagePayload | null {
  return consumeRuntimeBootstrap<SchedulerManagementPagePayload>("schedulerManagementPageData");
}

export function readBootstrappedBackupConfigPageData(): BackupConfigPagePayload | null {
  return consumeRuntimeBootstrap<BackupConfigPagePayload>("backupConfigPageData");
}

export function readBootstrappedEmissionResultListPageData(): EmissionResultListPagePayload | null {
  return consumeRuntimeBootstrap<EmissionResultListPagePayload>("emissionResultListPageData");
}

export function readBootstrappedTradeListPageData(): TradeListPagePayload | null {
  return consumeRuntimeBootstrap<TradeListPagePayload>("tradeListPageData");
}

export function readBootstrappedTradeStatisticsPageData(): TradeStatisticsPagePayload | null {
  return consumeRuntimeBootstrap<TradeStatisticsPagePayload>("tradeStatisticsPageData");
}

export function readBootstrappedRefundListPageData(): RefundListPagePayload | null {
  return consumeRuntimeBootstrap<RefundListPagePayload>("refundListPageData");
}

export function readBootstrappedSettlementCalendarPageData(): SettlementCalendarPagePayload | null {
  return consumeRuntimeBootstrap<SettlementCalendarPagePayload>("settlementCalendarPageData");
}

export function readBootstrappedTradeApprovePageData(): TradeApprovePagePayload | null {
  return consumeRuntimeBootstrap<TradeApprovePagePayload>("tradeApprovePageData");
}

export function readBootstrappedTradeRejectPageData(): TradeRejectPagePayload | null {
  return consumeRuntimeBootstrap<TradeRejectPagePayload>("tradeRejectPageData");
}

export function readBootstrappedCertificateReviewPageData(): CertificateReviewPagePayload | null {
  return consumeRuntimeBootstrap<CertificateReviewPagePayload>("certificateReviewPageData");
}

export function readBootstrappedCertificateStatisticsPageData(): CertificateStatisticsPagePayload | null {
  return consumeRuntimeBootstrap<CertificateStatisticsPagePayload>("certificateStatisticsPageData");
}

export function readBootstrappedEmissionDataHistoryPageData(): EmissionDataHistoryPagePayload | null {
  return consumeRuntimeBootstrap<EmissionDataHistoryPagePayload>("emissionDataHistoryPageData");
}

export function readBootstrappedEmissionSiteManagementPageData(): EmissionSiteManagementPagePayload | null {
  return consumeRuntimeBootstrap<EmissionSiteManagementPagePayload>("emissionSiteManagementPageData");
}

export function readBootstrappedEmissionValidatePageData(): EmissionValidatePagePayload | null {
  return consumeRuntimeBootstrap<EmissionValidatePagePayload>("emissionValidatePageData");
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
  const query = search.toString();
  return fetchJsonWithoutCache<MemberEditPagePayload>({
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
      return fetchAuthChangePage({
        searchKeyword: params.get("searchKeyword") || "",
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined
      });
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
    case "trade-statistics":
      return fetchTradeStatisticsPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        periodFilter: params.get("periodFilter") || "",
        tradeType: params.get("tradeType") || "",
        settlementStatus: params.get("settlementStatus") || ""
      });
    case "certificate-statistics":
      return fetchCertificateStatisticsPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        periodFilter: params.get("periodFilter") || "",
        certificateType: params.get("certificateType") || "",
        issuanceStatus: params.get("issuanceStatus") || ""
      });
    case "virtual-issue":
      return fetchRefundAccountReviewPage({
        pageIndex: params.get("pageIndex") ? Number(params.get("pageIndex")) : undefined,
        searchKeyword: params.get("searchKeyword") || "",
        verificationStatus: params.get("verificationStatus") || "",
        payoutStatus: params.get("payoutStatus") || ""
      });
    case "security-policy":
      return fetchSecurityPolicyPage();
    case "notification":
      return fetchNotificationPage();
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
      return fetchSecurityMonitoringPage();
    case "security-audit":
      return fetchSecurityAuditPage();
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
      return fetchNewPagePage();
    case "restore-execution":
      return fetchBackupConfigPage("/admin/system/restore");
    case "version-management":
      return fetchBackupConfigPage("/admin/system/version");
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

  const responsePayload = await fetch(url.toString(), {
    credentials: "include",
    headers: {
      "X-Carbonet-Path": normalizedPath
    }
  }).then((response) => readJsonResponse<{ reactBootstrapPayload?: Partial<Record<BootstrapPayloadKey, unknown>> }>(response));

  mergeRuntimeBootstrap(responsePayload.reactBootstrapPayload || {});
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

export async function searchAdminCompanies(params: { keyword: string; page?: number; size?: number; status?: string; membershipType?: string; }) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  if (params.membershipType) search.set("membershipType", params.membershipType);
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

export async function fetchCertificatePendingPage(params?: { pageIndex?: number; searchKeyword?: string; certificateType?: string; processStatus?: string; applicationId?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.certificateType) search.set("certificateType", params.certificateType);
  if (params?.processStatus) search.set("processStatus", params.processStatus);
  if (params?.applicationId) search.set("applicationId", params.applicationId);
  if (params?.insttId) search.set("insttId", params.insttId);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/certificate/pending_list/page-data${query ? `?${query}` : ""}`, `/en/admin/certificate/pending_list/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.certificatePendingError || `Failed to load certificate pending page: ${response.status}`);
  }
  return body as CertificatePendingPagePayload;
}

export async function fetchRefundAccountReviewPage(params?: { pageIndex?: number; searchKeyword?: string; verificationStatus?: string; payoutStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.verificationStatus) search.set("verificationStatus", params.verificationStatus);
  if (params?.payoutStatus) search.set("payoutStatus", params.payoutStatus);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/payment/virtual_issue/page-data${query ? `?${query}` : ""}`, `/en/admin/payment/virtual_issue/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.refundAccountReviewError || `Failed to load refund account review page: ${response.status}`);
  }
  return body as RefundAccountReviewPagePayload;
}

export async function fetchCertificateObjectionListPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; priority?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.priority) search.set("priority", params.priority);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/certificate/objection_list/page-data${query ? `?${query}` : ""}`, `/en/admin/certificate/objection_list/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.certificateObjectionError || `Failed to load certificate objection list page: ${response.status}`);
  }
  return body as CertificateObjectionListPagePayload;
}

export async function fetchCertificateReviewPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; certificateType?: string; applicationId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.certificateType) search.set("certificateType", params.certificateType);
  if (params?.applicationId) search.set("applicationId", params.applicationId);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/certificate/review/page-data${query ? `?${query}` : ""}`, `/en/admin/certificate/review/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.certificateReviewError || `Failed to load certificate review page: ${response.status}`);
  }
  return body as CertificateReviewPagePayload;
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

export async function checkMemberRegisterId(memberId: string) {
  const response = await fetch(`${buildAdminApiPath("/api/admin/member/register/check-id")}?memberId=${encodeURIComponent(memberId)}`, {
    credentials: "include"
  });
  const body = await response.json() as { valid?: boolean; duplicated?: boolean; message?: string };
  if (!response.ok) {
    throw new Error(body.message || `Failed to check member ID: ${response.status}`);
  }
  return {
    valid: Boolean(body.valid),
    duplicated: Boolean(body.duplicated),
    message: String(body.message || "")
  };
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
  const response = await fetch(buildLocalizedPath(`/admin/system/menu/page-data${query ? `?${query}` : ""}`, `/en/admin/system/menu/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.menuMgmtError || `Failed to load menu management page: ${response.status}`);
  return body as MenuManagementPagePayload;
}

export async function fetchContentMenuManagementPage(saved?: string) {
  const search = new URLSearchParams();
  if (saved) search.set("saved", saved);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/content/menu/page-data${query ? `?${query}` : ""}`, `/en/admin/content/menu/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.menuMgmtError || `Failed to load content menu management page: ${response.status}`);
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

export async function fetchNewPagePage() {
  const response = await fetch(buildLocalizedPath("/admin/system/new-page/page-data", "/en/admin/system/new-page/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load new page: ${response.status}`);
  return body as NewPagePagePayload;
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

export async function createIpWhitelistRequest(payload: Record<string, unknown>) {
  const response = await fetch(buildLocalizedPath("/admin/system/ip-whitelist/request", "/en/admin/system/ip-whitelist/request"), {
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

export async function decideIpWhitelistRequest(payload: Record<string, unknown>) {
  const response = await fetch(buildLocalizedPath("/admin/system/ip-whitelist/request-decision", "/en/admin/system/ip-whitelist/request-decision"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; requestId?: string } & Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to process IP whitelist request: ${response.status}`));
  }
  return body;
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
  const body = await readJsonResponse<AccessHistoryPagePayload>(response);
  if (!response.ok) throw new Error(body.accessHistoryError || `Failed to load access history page: ${response.status}`);
  return body;
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
  const body = await readJsonResponse<ErrorLogPagePayload>(response);
  if (!response.ok) throw new Error(body.errorLogError || `Failed to load error log page: ${response.status}`);
  return body;
}

export async function fetchSecurityHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.userSe) search.set("userSe", params.userSe);
  if (params?.insttId) search.set("insttId", params.insttId);
  if ((params as { actionStatus?: string } | undefined)?.actionStatus) search.set("actionStatus", String((params as { actionStatus?: string }).actionStatus));
  const response = await fetch(`/admin/system/security/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.loginHistoryError || `Failed to load security history page: ${response.status}`);
  return body as LoginHistoryPagePayload;
}

export async function fetchMemberSecurityHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; userSe?: string; insttId?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.userSe) search.set("userSe", params.userSe);
  if (params?.insttId) search.set("insttId", params.insttId);
  if ((params as { actionStatus?: string } | undefined)?.actionStatus) search.set("actionStatus", String((params as { actionStatus?: string }).actionStatus));
  const response = await fetch(buildLocalizedPath(`/admin/member/security/page-data${search.toString() ? `?${search.toString()}` : ""}`, `/en/admin/member/security/page-data${search.toString() ? `?${search.toString()}` : ""}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<LoginHistoryPagePayload>(response);
  if (!response.ok) throw new Error(body.loginHistoryError || `Failed to load member security history page: ${response.status}`);
  return body as LoginHistoryPagePayload;
}

export async function saveSecurityHistoryAction(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-history/action"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<SecurityHistoryActionResponse>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to save security history action: ${response.status}`));
  }
  return body;
}

export async function fetchSecurityPolicyPage() {
  const response = await fetch("/admin/system/security-policy/page-data", {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityPolicyPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load security policy page: ${response.status}`);
  return body as SecurityPolicyPagePayload;
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
  const search = new URLSearchParams();
  if (params?.deliveryChannel) search.set("deliveryChannel", params.deliveryChannel);
  if (params?.deliveryStatus) search.set("deliveryStatus", params.deliveryStatus);
  if (params?.deliveryKeyword) search.set("deliveryKeyword", params.deliveryKeyword);
  if (params?.deliveryPage && params.deliveryPage > 1) search.set("deliveryPage", String(params.deliveryPage));
  if (params?.activityAction) search.set("activityAction", params.activityAction);
  if (params?.activityKeyword) search.set("activityKeyword", params.activityKeyword);
  if (params?.activityPage && params.activityPage > 1) search.set("activityPage", String(params.activityPage));
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/system/notification/page-data${query ? `?${query}` : ""}`, `/en/admin/system/notification/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityPolicyPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load notification page: ${response.status}`);
  return body as SecurityPolicyPagePayload;
}

export async function runMenuPermissionAutoCleanup(menuUrls?: string[]) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/menu-permission-diagnostics/auto-cleanup"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify({ menuUrls: menuUrls || [] })
  });
  const body = await readJsonResponse<MenuPermissionAutoCleanupResponse>(response);
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Failed to run menu permission auto cleanup: ${response.status}`);
  }
  return body;
}

export async function saveSecurityPolicyFindingState(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/state"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to save security policy finding state: ${response.status}`));
  }
  return body;
}

export async function clearSecurityPolicySuppressions() {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/clear-suppressions"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: "{}"
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to clear suppressions: ${response.status}`));
  }
  return body;
}

export async function runSecurityPolicyAutoFix(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/auto-fix"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to run security policy auto-fix: ${response.status}`));
  }
  return body;
}

export async function runSecurityPolicyBulkAutoFix(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/auto-fix-bulk"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to run security policy bulk auto-fix: ${response.status}`));
  }
  return body;
}

export async function saveSecurityPolicyNotificationConfig(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/notification-config"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to save security policy notification config: ${response.status}`));
  }
  return body;
}

export async function runSecurityPolicyRollback(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/rollback"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to run security policy rollback: ${response.status}`));
  }
  return body;
}

export async function dispatchSecurityPolicyNotifications(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-policy/dispatch"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to dispatch security policy notifications: ${response.status}`));
  }
  return body;
}

export async function fetchSecurityMonitoringPage() {
  const response = await fetch("/admin/system/security-monitoring/page-data", {
    credentials: "include"
  });
  const body = await readJsonResponse<SecurityMonitoringPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load security monitoring page: ${response.status}`);
  return body;
}

export async function saveSecurityMonitoringState(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-monitoring/state"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to save security monitoring state: ${response.status}`));
  }
  return body;
}

export async function registerSecurityMonitoringBlockCandidate(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-monitoring/block-candidates"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to register security monitoring block candidate: ${response.status}`));
  }
  return body;
}

export async function updateSecurityMonitoringBlockCandidate(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-monitoring/block-candidates/state"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to update security monitoring block candidate: ${response.status}`));
  }
  return body;
}

export async function dispatchSecurityMonitoringNotification(payload: Record<string, unknown>) {
  const response = await fetch(buildAdminApiPath("/api/admin/system/security-monitoring/notify"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await readJsonResponse<Record<string, unknown>>(response);
  if (!response.ok || body.success === false) {
    throw new Error(String(body.message || `Failed to dispatch security monitoring notification: ${response.status}`));
  }
  return body;
}

export async function fetchBlocklistPage(params?: { searchKeyword?: string; blockType?: string; status?: string; source?: string; }) {
  const search = new URLSearchParams();
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.blockType) search.set("blockType", params.blockType);
  if (params?.status) search.set("status", params.status);
  if (params?.source) search.set("source", params.source);
  const response = await fetch(`/admin/system/blocklist/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load blocklist page: ${response.status}`);
  return body as BlocklistPagePayload;
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
  const search = new URLSearchParams();
  if (params?.pageIndex && params.pageIndex > 1) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.actionType && params.actionType !== "ALL") search.set("actionType", params.actionType);
  if (params?.routeGroup && params.routeGroup !== "ALL") search.set("routeGroup", params.routeGroup);
  if (params?.startDate) search.set("startDate", params.startDate);
  if (params?.endDate) search.set("endDate", params.endDate);
  if (params?.sortKey && params.sortKey !== "AUDIT_AT") search.set("sortKey", params.sortKey);
  if (params?.sortDirection && params.sortDirection !== "DESC") search.set("sortDirection", params.sortDirection);
  const response = await fetch(`/admin/system/security-audit/page-data${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load security audit page: ${response.status}`);
  return body as SecurityAuditPagePayload;
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
  const response = await fetch(buildLocalizedPath(
    `/admin/certificate/audit-log/page-data${search.toString() ? `?${search.toString()}` : ""}`,
    `/en/admin/certificate/audit-log/page-data${search.toString() ? `?${search.toString()}` : ""}`
  ), {
    credentials: "include"
  });
  const body = await readJsonResponse<CertificateAuditLogPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load certificate audit log page: ${response.status}`);
  return body;
}

export async function fetchOperationsCenterPage() {
  const response = await fetch("/admin/monitoring/center/page-data", {
    credentials: "include"
  });
  const body = await readJsonResponse<OperationsCenterPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load operations center page: ${response.status}`);
  return body;
}

export async function fetchPerformancePage() {
  const response = await fetch(buildLocalizedPath("/admin/system/performance/page-data", "/en/admin/system/performance/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<PerformancePagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load performance page: ${response.status}`);
  return body;
}

export async function fetchExternalConnectionListPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/connection_list/page-data", "/en/admin/external/connection_list/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalConnectionListPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external connection list page: ${response.status}`);
  return body;
}

export async function fetchExternalSchemaPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/schema/page-data", "/en/admin/external/schema/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalSchemaPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external schema page: ${response.status}`);
  return body;
}

export async function fetchExternalKeysPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/keys/page-data", "/en/admin/external/keys/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalKeysPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external keys page: ${response.status}`);
  return body;
}

export async function fetchExternalUsagePage() {
  const response = await fetch(buildLocalizedPath("/admin/external/usage/page-data", "/en/admin/external/usage/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalUsagePagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external usage page: ${response.status}`);
  return body;
}

export async function fetchExternalLogsPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/logs/page-data", "/en/admin/external/logs/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalLogsPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external logs page: ${response.status}`);
  return body;
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
  const response = await fetch(`${buildLocalizedPath("/admin/external/webhooks/page-data", "/en/admin/external/webhooks/page-data")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalWebhooksPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external webhooks page: ${response.status}`);
  return body;
}

export async function fetchExternalSyncPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/sync/page-data", "/en/admin/external/sync/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalSyncPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external sync page: ${response.status}`);
  return body;
}

export async function fetchExternalMonitoringPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/monitoring/page-data", "/en/admin/external/monitoring/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalMonitoringPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external monitoring page: ${response.status}`);
  return body;
}

export async function fetchExternalMaintenancePage() {
  const response = await fetch(buildLocalizedPath("/admin/external/maintenance/page-data", "/en/admin/external/maintenance/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalMaintenancePagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external maintenance page: ${response.status}`);
  return body;
}

export async function fetchExternalRetryPage() {
  const response = await fetch(buildLocalizedPath("/admin/external/retry/page-data", "/en/admin/external/retry/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalRetryPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external retry page: ${response.status}`);
  return body;
}

export async function fetchExternalConnectionFormPage(mode: "add" | "edit", connectionId?: string) {
  const search = new URLSearchParams();
  if (connectionId) search.set("connectionId", connectionId);
  const path = mode === "add"
    ? buildLocalizedPath("/admin/external/connection_add/page-data", "/en/admin/external/connection_add/page-data")
    : buildLocalizedPath("/admin/external/connection_edit/page-data", "/en/admin/external/connection_edit/page-data");
  const response = await fetch(`${path}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<ExternalConnectionFormPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load external connection form page: ${response.status}`);
  return body;
}

export async function saveExternalConnection(payload: Record<string, string>) {
  const response = await fetch(buildLocalizedPath("/admin/external/connection/save", "/en/admin/external/connection/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ExternalConnectionFormPagePayload>(response);
  if (body.success === false) throw new Error(body.message || "Failed to save external connection.");
  if (!response.ok) throw new Error(body.message || `Failed to save external connection: ${response.status}`);
  return body;
}

export async function fetchSensorListPage() {
  const response = await fetch(buildLocalizedPath("/admin/monitoring/sensor_list/page-data", "/en/admin/monitoring/sensor_list/page-data"), {
    credentials: "include"
  });
  const body = await readJsonResponse<SensorListPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load sensor list page: ${response.status}`);
  return body;
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

export async function fetchBatchManagementPage() {
  const response = await fetch("/admin/system/batch/page-data", {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load batch management page: ${response.status}`);
  return body as BatchManagementPagePayload;
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
  const response = await fetch(url, {
    credentials: "include"
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) throw new Error(`Failed to load backup config page: ${response.status}`);
  return body;
}

export async function saveBackupConfig(payload: Record<string, string>) {
  const response = await fetch(buildLocalizedPath("/admin/system/backup_config/save", "/en/admin/system/backup_config/save"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) throw new Error(body.backupConfigMessage || `Failed to save backup config: ${response.status}`);
  return body;
}

export async function restoreBackupConfigVersion(versionId: string) {
  const response = await fetch(buildLocalizedPath("/admin/system/version/restore", "/en/admin/system/version/restore"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify({ versionId })
  });
  const body = await readJsonResponse<BackupConfigPagePayload>(response);
  if (!response.ok) throw new Error(body.backupConfigMessage || `Failed to restore backup version: ${response.status}`);
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
  const response = await fetch(buildLocalizedPath("/admin/system/backup/run", "/en/admin/system/backup/run"), {
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
    const retrySuffix = retryAfterSeconds > 0
      ? ` (${retryAfterSeconds}s)`
      : "";
    throw new Error(body.backupConfigMessage || fallbackMessage || `Failed to run backup execution: ${response.status}${retrySuffix}`);
  }
  return body;
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

export async function fetchTradeListPage(params?: { pageIndex?: number; searchKeyword?: string; tradeStatus?: string; settlementStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.tradeStatus) search.set("tradeStatus", params.tradeStatus);
  if (params?.settlementStatus) search.set("settlementStatus", params.settlementStatus);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/trade/list/page-data${query ? `?${query}` : ""}`, `/en/trade/list/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load trade list page: ${response.status}`);
  return body as TradeListPagePayload;
}

export async function fetchTradeStatisticsPage(params?: { pageIndex?: number; searchKeyword?: string; periodFilter?: string; tradeType?: string; settlementStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.periodFilter) search.set("periodFilter", params.periodFilter);
  if (params?.tradeType) search.set("tradeType", params.tradeType);
  if (params?.settlementStatus) search.set("settlementStatus", params.settlementStatus);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/trade/statistics/page-data${query ? `?${query}` : ""}`, `/en/admin/trade/statistics/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load trade statistics page: ${response.status}`);
  return body as TradeStatisticsPagePayload;
}

export async function fetchTradeDuplicatePage(params?: { pageIndex?: number; searchKeyword?: string; detectionType?: string; reviewStatus?: string; riskLevel?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.detectionType) search.set("detectionType", params.detectionType);
  if (params?.reviewStatus) search.set("reviewStatus", params.reviewStatus);
  if (params?.riskLevel) search.set("riskLevel", params.riskLevel);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/trade/duplicate/page-data${query ? `?${query}` : ""}`, `/en/admin/trade/duplicate/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load abnormal trade review page: ${response.status}`);
  return body as TradeDuplicatePagePayload;
}

export async function fetchRefundListPage(params?: { pageIndex?: number; searchKeyword?: string; status?: string; riskLevel?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.status) search.set("status", params.status);
  if (params?.riskLevel) search.set("riskLevel", params.riskLevel);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/payment/refund_list/page-data${query ? `?${query}` : ""}`, `/en/admin/payment/refund_list/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load refund list page: ${response.status}`);
  return body as RefundListPagePayload;
}

export async function fetchSettlementCalendarPage(params?: { pageIndex?: number; selectedMonth?: string; searchKeyword?: string; settlementStatus?: string; riskLevel?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.selectedMonth) search.set("selectedMonth", params.selectedMonth);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.settlementStatus) search.set("settlementStatus", params.settlementStatus);
  if (params?.riskLevel) search.set("riskLevel", params.riskLevel);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/payment/settlement/page-data${query ? `?${query}` : ""}`, `/en/admin/payment/settlement/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load settlement calendar page: ${response.status}`);
  return body as SettlementCalendarPagePayload;
}

export async function fetchTradeApprovePage(params?: { pageIndex?: number; searchKeyword?: string; approvalStatus?: string; tradeType?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.approvalStatus) search.set("approvalStatus", params.approvalStatus);
  if (params?.tradeType) search.set("tradeType", params.tradeType);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/trade/approve/page-data${query ? `?${query}` : ""}`, `/en/admin/trade/approve/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(String(body?.message || `Failed to load trade approval page: ${response.status}`));
  return body as TradeApprovePagePayload;
}

export async function fetchRefundProcessPage(params?: { pageIndex?: number; searchKeyword?: string; refundStatus?: string; refundChannel?: string; priority?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.refundStatus) search.set("refundStatus", params.refundStatus);
  if (params?.refundChannel) search.set("refundChannel", params.refundChannel);
  if (params?.priority) search.set("priority", params.priority);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/payment/refund_process/page-data${query ? `?${query}` : ""}`, `/en/admin/payment/refund_process/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(String(body?.refundProcessError || `Failed to load refund processing page: ${response.status}`));
  return body as RefundProcessPagePayload;
}

export async function fetchTradeRejectPage(params?: { tradeId?: string; returnUrl?: string; }) {
  const search = new URLSearchParams();
  if (params?.tradeId) search.set("tradeId", params.tradeId);
  if (params?.returnUrl) search.set("returnUrl", params.returnUrl);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/trade/reject/page-data${query ? `?${query}` : ""}`, `/en/admin/trade/reject/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load trade reject page: ${response.status}`);
  return body as TradeRejectPagePayload;
}

export async function fetchEmissionResultDetailPage(resultId: string) {
  const search = new URLSearchParams();
  if (resultId) search.set("resultId", resultId);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/emission/result_detail/page-data${query ? `?${query}` : ""}`, `/en/admin/emission/result_detail/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(String(body?.pageError || `Failed to load emission result detail page: ${response.status}`));
  return body as EmissionResultDetailPagePayload;
}

export async function fetchCertificateStatisticsPage(params?: { pageIndex?: number; searchKeyword?: string; periodFilter?: string; certificateType?: string; issuanceStatus?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.periodFilter) search.set("periodFilter", params.periodFilter);
  if (params?.certificateType) search.set("certificateType", params.certificateType);
  if (params?.issuanceStatus) search.set("issuanceStatus", params.issuanceStatus);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/certificate/statistics/page-data${query ? `?${query}` : ""}`, `/en/admin/certificate/statistics/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load certificate statistics page: ${response.status}`);
  return body as CertificateStatisticsPagePayload;
}

export async function fetchEmissionDataHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; changeType?: string; changeTarget?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.changeType) search.set("changeType", params.changeType);
  if (params?.changeTarget) search.set("changeTarget", params.changeTarget);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/emission/data_history/page-data${query ? `?${query}` : ""}`, `/en/admin/emission/data_history/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load emission data history page: ${response.status}`);
  return body as EmissionDataHistoryPagePayload;
}

export async function fetchEmissionSiteManagementPage() {
  const response = await fetch(buildLocalizedPath("/admin/emission/site-management/page-data", "/en/admin/emission/site-management/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load emission site management page: ${response.status}`);
  return body as EmissionSiteManagementPagePayload;
}

export async function fetchEmissionManagementPage() {
  const response = await fetch(buildLocalizedPath("/admin/emission/management/page-data", "/en/admin/emission/management/page-data"), {
    credentials: "include"
  });
  return readJsonResponse<EmissionManagementPagePayload>(response);
}

export async function fetchEmissionSurveyAdminPage() {
  const response = await fetch(buildLocalizedPath("/admin/emission/survey-admin/page-data", "/en/admin/emission/survey-admin/page-data"), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<EmissionSurveyAdminPagePayload>(response);
}

export async function uploadEmissionSurveyWorkbook(uploadFile: File) {
  const form = new FormData();
  form.set("uploadFile", uploadFile);
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await fetch(buildLocalizedPath("/admin/api/admin/emission-survey-admin/parse-workbook", "/en/admin/api/admin/emission-survey-admin/parse-workbook"), {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  return readJsonResponse<EmissionSurveyAdminPagePayload>(response);
}

export async function saveEmissionSurveyCaseDraft(payload: EmissionSurveyCaseDraftSavePayload) {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/emission-survey-admin/case-drafts", "/en/admin/api/admin/emission-survey-admin/case-drafts"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function deleteEmissionSurveyCaseDraft(sectionCode: string, caseCode: string) {
  const query = new URLSearchParams({ sectionCode, caseCode }).toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/emission-survey-admin/case-drafts", "/en/admin/api/admin/emission-survey-admin/case-drafts")}?${query}`, {
    method: "DELETE",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "X-Requested-With": "XMLHttpRequest"
    })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function saveEmissionSurveyDraftSet(payload: EmissionSurveyDraftSetSavePayload) {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/emission-survey-admin/draft-sets", "/en/admin/api/admin/emission-survey-admin/draft-sets"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function deleteEmissionSurveyDraftSet(setId: string) {
  const query = new URLSearchParams({ setId }).toString();
  const response = await fetch(`${buildLocalizedPath("/admin/api/admin/emission-survey-admin/draft-sets", "/en/admin/api/admin/emission-survey-admin/draft-sets")}?${query}`, {
    method: "DELETE",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "X-Requested-With": "XMLHttpRequest"
    })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export function getEmissionSurveyTemplateDownloadUrl() {
  return buildLocalizedPath("/admin/api/admin/emission-survey-admin/template-download", "/en/admin/api/admin/emission-survey-admin/template-download");
}

export function getEmissionSurveySampleDownloadUrl() {
  return buildLocalizedPath("/admin/api/admin/emission-survey-admin/sample-download", "/en/admin/api/admin/emission-survey-admin/sample-download");
}

export async function saveEmissionManagementElementDefinition(payload: EmissionManagementElementSavePayload) {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/emission-management/element-definitions", "/en/admin/api/admin/emission-management/element-definitions"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<EmissionManagementElementSaveResponse>(response);
}

export async function fetchEmissionDefinitionStudioPage() {
  const response = await fetch(buildLocalizedPath("/admin/emission/definition-studio/page-data", "/en/admin/emission/definition-studio/page-data"), {
    credentials: "include"
  });
  return readJsonResponse<EmissionDefinitionStudioPagePayload>(response);
}

export async function saveEmissionDefinitionDraft(payload: EmissionDefinitionDraftSavePayload) {
  const response = await fetch(buildLocalizedPath("/admin/api/admin/emission-definition-studio/drafts", "/en/admin/api/admin/emission-definition-studio/drafts"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<EmissionDefinitionDraftSaveResponse>(response);
}

export async function publishEmissionDefinitionDraft(draftId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/api/admin/emission-definition-studio/drafts/${encodeURIComponent(draftId)}/publish`, `/en/admin/api/admin/emission-definition-studio/drafts/${encodeURIComponent(draftId)}/publish`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "X-Requested-With": "XMLHttpRequest"
    })
  });
  return readJsonResponse<EmissionDefinitionDraftSaveResponse>(response);
}

export async function fetchEmissionValidatePage(params?: { pageIndex?: number; resultId?: string; searchKeyword?: string; verificationStatus?: string; priorityFilter?: string; }) {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.resultId) search.set("resultId", params.resultId);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  if (params?.verificationStatus) search.set("verificationStatus", params.verificationStatus);
  if (params?.priorityFilter) search.set("priorityFilter", params.priorityFilter);
  const query = search.toString();
  const response = await fetch(buildLocalizedPath(`/admin/emission/validate/page-data${query ? `?${query}` : ""}`, `/en/admin/emission/validate/page-data${query ? `?${query}` : ""}`), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load emission validate page: ${response.status}`);
  return body as EmissionValidatePagePayload;
}

export async function fetchEmissionCategories(searchKeyword?: string) {
  const search = new URLSearchParams();
  if (searchKeyword) {
    search.set("searchKeyword", searchKeyword);
  }
  const query = search.toString();
  const response = await fetch(`${buildAdminApiPath("/api/admin/emission-management/categories")}${query ? `?${query}` : ""}`, {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<{ items: EmissionCategoryItem[] }>(response);
}

export async function fetchEmissionTiers(categoryId: number) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/categories/${encodeURIComponent(String(categoryId))}/tiers`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<EmissionTierResponse>(response);
}

export async function fetchEmissionVariableDefinitions(categoryId: number, tier: number) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/categories/${encodeURIComponent(String(categoryId))}/tiers/${encodeURIComponent(String(tier))}/variables`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<{
    category?: EmissionCategoryItem;
    tier?: number;
    variables?: EmissionVariableDefinition[];
    factors?: EmissionFactorDefinition[];
    formulaSummary?: string;
    formulaDisplay?: string;
    publishedDefinition?: Record<string, unknown>;
    publishedDefinitionApplied?: boolean;
  }>(response);
}

export async function saveEmissionInputSession(payload: EmissionInputSessionSavePayload) {
  const response = await fetch(buildAdminApiPath("/api/admin/emission-management/input-sessions"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function fetchEmissionInputSession(sessionId: number) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/input-sessions/${encodeURIComponent(String(sessionId))}`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function calculateEmissionInputSession(sessionId: number) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/input-sessions/${encodeURIComponent(String(sessionId))}/calculate`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function materializeEmissionDefinitionScope(draftId: string) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/definition-scopes/${encodeURIComponent(draftId)}/materialize`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<EmissionDefinitionMaterializeResponse>(response);
}

export async function fetchEmissionScopeStatus(categoryCode: string, tier: number) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/scopes/${encodeURIComponent(categoryCode)}/${encodeURIComponent(String(tier))}/status`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function precheckEmissionDefinitionScope(draftId: string) {
  const response = await fetch(buildAdminApiPath(`/api/admin/emission-management/definition-scopes/${encodeURIComponent(draftId)}/precheck`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function fetchEmissionLimeDefaultFactor() {
  const response = await fetch(buildAdminApiPath("/api/admin/emission-management/lime/default-factor"), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
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

export async function queueDirectExecuteCodexSrTicket(ticketId: string) {
  const response = await fetch(buildLocalizedPath(`/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/queue-direct-execute`, `/en/admin/system/codex-request/tickets/${encodeURIComponent(ticketId)}/queue-direct-execute`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow; executionLanes?: Array<Record<string, unknown>> }>(response);
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

export async function saveScreenCommandMenuMapping(payload: {
  pageId: string;
  menuCode: string;
  menuName: string;
  menuUrl: string;
  domainCode: string;
}) {
  const response = await fetch(buildAdminApiPath("/api/admin/help-management/screen-command/map-menu"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.help-management.screen-command.map-menu",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; message: string; pageId: string; menuCode: string; routePath: string }>(response);
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
    roleType?: string;
    baseRoleYn?: string;
    parentAuthorCode?: string;
    assignmentScope?: string;
    defaultMemberTypes?: string[];
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
  _session: FrontendSession,
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
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member edit: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveMemberRegister(
  _session: FrontendSession,
  payload: {
    memberId: string;
    applcntNm: string;
    password: string;
    passwordConfirm: string;
    applcntEmailAdres: string;
    phoneNumber: string;
    entrprsSeCode: string;
    insttId: string;
    deptNm: string;
    authorCode: string;
    zip: string;
    adres: string;
    detailAdres: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/register"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member register: ${response.status}`));
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

export async function saveAdminPermission(_session: FrontendSession, payload: { emplyrId: string; authorCode: string; featureCodes: string[]; }) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account/permissions"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
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
  _session: FrontendSession,
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
    zip: string;
    adres: string;
    detailAdres: string;
    featureCodes: string[];
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
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
    agencyName?: string;
    representativeName?: string;
    bizRegistrationNumber?: string;
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
  if (typeof payload.agencyName === "string") form.set("agencyName", payload.agencyName);
  if (typeof payload.representativeName === "string") form.set("representativeName", payload.representativeName);
  if (typeof payload.bizRegistrationNumber === "string") form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
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

export async function submitCertificateApproveAction(
  session: FrontendSession,
  payload: { action: string; certificateId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/certificate/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve certificate: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitTradeRejectAction(
  session: FrontendSession,
  payload: { tradeId?: string; rejectReason?: string; operatorNote?: string; }
) {
  const response = await fetch(buildAdminApiPath("/trade/reject/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to submit trade reject action: ${response.status}`);
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitTradeApproveAction(
  session: FrontendSession,
  payload: { action: string; tradeId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/trade/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to approve trade: ${response.status}`);
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
export function readBootstrappedEmissionResultDetailPageData(): EmissionResultDetailPagePayload | null {
  return consumeRuntimeBootstrap<EmissionResultDetailPagePayload>("emissionResultDetailPageData");
}
