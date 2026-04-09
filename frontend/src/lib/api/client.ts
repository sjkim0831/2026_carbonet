import * as adminShellApi from "./adminShell";
import * as appBootstrapApi from "./appBootstrap";
export type {
  AdminMenuPlaceholderPagePayload,
  BootstrappedHomePayload,
  HomeMenuPlaceholderPagePayload,
  SitemapNode,
  SitemapPagePayload
} from "./appBootstrapTypes";
import type {
  AdminMenuTreePayload,
  AdminSessionSimulationPayload,
  FrontendSession
} from "./adminShellTypes";
export {
  ADMIN_MENU_CODE_LABEL_OVERRIDES_EN,
  ADMIN_MENU_CODE_LABEL_OVERRIDES_KO
} from "./adminShellTypes";
export type {
  AdminMenuDomain,
  AdminMenuGroup,
  AdminMenuLink,
  AdminSessionSimulationOption,
  AdminMenuTreePayload,
  AdminSessionSimulationPayload,
  FrontendSession
} from "./adminShellTypes";
export type {
  AccessHistoryPagePayload,
  BlocklistPagePayload,
  ErrorLogPagePayload,
  LoginHistoryPagePayload,
  MenuPermissionAutoCleanupResponse,
  NotificationPagePayload,
  SecurityAuditPagePayload,
  SecurityHistoryActionResponse,
  SecurityMonitoringPagePayload,
  SecurityPolicyPagePayload
} from "./securityTypes";
export type {
  CertificateStatisticsPagePayload,
  RefundListPagePayload,
  RefundProcessPagePayload,
  SettlementCalendarPagePayload,
  TradeApprovePagePayload,
  TradeDuplicatePagePayload,
  TradeListPagePayload,
  TradeRejectPagePayload,
  TradeStatisticsPagePayload
} from "./tradeTypes";
import {
  removeSessionStorageCache,
  SESSION_STORAGE_CACHE_PREFIX
} from "./pageCache";
export { checkMemberRegisterId } from "./adminMember";
export {
  buildSecurityAuditExportUrl,
  fetchBackupConfigPage,
  fetchBatchManagementPage,
  fetchExternalConnectionFormPage,
  fetchExternalConnectionListPage,
  fetchExternalKeysPage,
  fetchExternalLogsPage,
  fetchExternalMaintenancePage,
  fetchExternalMonitoringPage,
  fetchExternalRetryPage,
  fetchExternalSchemaPage,
  fetchExternalSyncPage,
  fetchExternalUsagePage,
  fetchExternalWebhooksPage,
  fetchOperationsCenterPage,
  fetchPerformancePage,
  fetchSchedulerManagementPage,
  fetchSensorListPage,
  saveBackupConfig,
  saveExternalConnection
} from "./ops";
export { createIpWhitelistRequest, restoreBackupConfigVersion, runBackupExecution } from "./ops";

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

export type ProjectVersionOverviewPayload = {
  projectId: string;
  projectDisplayName?: string;
  activeRuntimeVersion?: string;
  activeCommonCoreVersion?: string;
  activeAdapterContractVersion?: string;
  activeAdapterArtifactVersion?: string;
  installedArtifactSet?: Array<Record<string, unknown>>;
  installedPackageSet?: Array<Record<string, unknown>>;
  rollbackReadyReleaseUnitId?: string;
};

export type ProjectVersionListPayload = {
  projectId: string;
  itemSet?: Array<Record<string, unknown>>;
  totalCount?: number;
};

export type ProjectVersionServerStatePayload = {
  projectId: string;
  serverStateSet?: Array<Record<string, unknown>>;
};

export type ProjectVersionManagementPagePayload = {
  overview: ProjectVersionOverviewPayload;
  adapterHistory: ProjectVersionListPayload;
  releaseUnits: ProjectVersionListPayload;
  serverDeployState: ProjectVersionServerStatePayload;
  candidateArtifacts: ProjectVersionListPayload;
};

export type ProjectVersionTargetArtifactPayload = {
  artifactId: string;
  artifactVersion: string;
};

export type ProjectUpgradeImpactResponse = {
  projectId: string;
  currentVersionSet?: Record<string, unknown>;
  targetVersionSet?: Record<string, unknown>;
  compatibilityClass?: string;
  adapterImpactSummary?: string;
  artifactDelta?: Array<Record<string, unknown>>;
  packageDelta?: Array<Record<string, unknown>>;
  runtimePackageDelta?: string;
  blockerSet?: string[];
  rollbackTargetReleaseId?: string;
  upgradeReadyYn?: boolean;
};

export type ProjectApplyUpgradeResponse = {
  projectId: string;
  releaseUnitId?: string;
  runtimePackageId?: string;
  appliedArtifactSet?: Array<Record<string, unknown>>;
  compatibilityClass?: string;
  deployReadyYn?: boolean;
  rollbackTargetReleaseId?: string;
};

export type ProjectRollbackResponse = {
  projectId: string;
  rolledBackToReleaseUnitId?: string;
  runtimePackageId?: string;
  deployTraceId?: string;
  status?: string;
  restoredArtifactSet?: Array<Record<string, unknown>>;
  rollbackTargetReleaseId?: string;
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

export type EmissionLciClassificationPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  searchKeyword?: string;
  level?: string;
  useAt?: string;
  selectedCode?: string;
  catalogSource?: string;
  catalogSourceLabel?: string;
  summaryCards?: Array<Record<string, string>>;
  levelOptions?: Array<Record<string, string>>;
  classificationRows?: Array<Record<string, unknown>>;
  selectedClassification?: Record<string, unknown> | null;
  governanceNotes?: Array<Record<string, string>>;
};

export type EmissionLciClassificationSavePayload = {
  originalCode?: string;
  code: string;
  label: string;
  tierLabel: string;
  aliases: string;
  useAt: string;
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

export type EmissionSurveyClassificationLoadResponse = Record<string, unknown> & {
  lciMajorCode?: string;
  lciMiddleCode?: string;
  lciSmallCode?: string;
  caseCode?: string;
  matchedCount?: number;
  matchedCaseMap?: Record<string, Record<string, unknown>>;
  message?: string;
};

export type EmissionSurveyAdminPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  currentActorId?: string;
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
  uploadLogRows?: Array<Record<string, unknown>>;
  uploadAudit?: Record<string, unknown>;
};

export type EmissionSurveyCaseDraftSavePayload = {
  ownerActorId?: string;
  datasetId?: string;
  datasetName?: string;
  sectionCode: string;
  caseCode: string;
  majorCode: string;
  lciMajorCode: string;
  lciMajorLabel?: string;
  lciMiddleCode: string;
  lciMiddleLabel?: string;
  lciSmallCode: string;
  lciSmallLabel?: string;
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

export type EmissionSurveyAdminDataPagePayload = Record<string, unknown> & {
  isEn?: boolean;
  menuCode?: string;
  currentActorId?: string;
  pageTitle?: string;
  pageDescription?: string;
  lciMajorCode?: string;
  lciMiddleCode?: string;
  lciSmallCode?: string;
  status?: string;
  datasetId?: string;
  logId?: string;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  summaryCards?: Array<Record<string, string>>;
  statusOptions?: Array<Record<string, string>>;
  datasetRows?: Array<Record<string, unknown>>;
  uploadLogRows?: Array<Record<string, unknown>>;
  selectedDatasetSectionRows?: Array<Record<string, unknown>>;
  selectedLog?: Record<string, unknown>;
  selectedLogSectionResults?: Array<Record<string, unknown>>;
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
  classificationCode?: string;
  classificationPath?: string;
  classificationTierLabel?: string;
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
  runtimePackageId?: string;
  deployTraceId?: string;
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

const FRONTEND_SESSION_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}frontend-session`;
const ADMIN_MENU_TREE_STORAGE_KEY = `${SESSION_STORAGE_CACHE_PREFIX}admin-menu-tree`;

export function invalidateFrontendSessionCache() {
  adminShellApi.invalidateFrontendSessionCache();
  removeSessionStorageCache(FRONTEND_SESSION_STORAGE_KEY);
  removeSessionStorageCache(ADMIN_MENU_TREE_STORAGE_KEY);
}

export {
  deleteFileManagementPage,
  deleteQnaCategory,
  fetchAdminSitemapPage,
  fetchBannerEditPage,
  fetchBannerManagementPage,
  fetchBoardDistributionPage,
  fetchBoardManagementPage,
  fetchFaqManagementPage,
  fetchFileManagementPage,
  fetchPopupEditPage,
  fetchPopupListPage,
  fetchPostManagementPage,
  fetchQnaCategoryPage,
  fetchTagManagementPage,
  replaceFileManagementPage,
  restoreFileManagementPage,
  saveBannerEditPage,
  saveBoardDistributionPage,
  saveFaqManagementPage,
  saveFileManagementPage,
  savePopupEditPage,
  saveQnaCategory,
  updateFileManagementPage
} from "./content";
export {
  calculateEmissionInputSession,
  deleteEmissionGwpValue,
  deleteEmissionSurveyCaseDraft,
  deleteEmissionSurveyDraftSet,
  deleteEmissionLciClassification,
  fetchEmissionCategories,
  fetchEmissionDataHistoryPage,
  fetchEmissionDefinitionStudioPage,
  fetchEmissionInputSession,
  fetchEmissionGwpValuesPage,
  fetchEmissionLimeDefaultFactor,
  fetchEmissionLciClassificationPage,
  fetchEmissionManagementPage,
  fetchEmissionResultDetailPage,
  fetchEmissionResultListPage,
  fetchEmissionScopeStatus,
  fetchEmissionSiteManagementPage,
  fetchEmissionSurveyAdminDataPage,
  fetchEmissionSurveyAdminPage,
  fetchEmissionTiers,
  fetchEmissionValidatePage,
  fetchEmissionVariableDefinitions,
  getEmissionSurveySampleDownloadUrl,
  getEmissionSurveyTemplateDownloadUrl,
  loadEmissionSurveyCaseDraftsByClassification,
  materializeEmissionDefinitionScope,
  precheckEmissionDefinitionScope,
  previewEmissionSurveySharedDataset,
  publishEmissionDefinitionDraft,
  replaceEmissionSurveySharedDataset,
  saveEmissionInputSession,
  saveEmissionDefinitionDraft,
  saveEmissionGwpValue,
  saveEmissionLciClassification,
  saveEmissionManagementElementDefinition,
  saveEmissionSurveyCaseDraft,
  saveEmissionSurveyDraftSet,
  uploadEmissionSurveyWorkbook
} from "./emission";
export {
  createAdminAccount,
  createAuthGroup,
  resetMemberPasswordAction,
  saveAdminAuthChange,
  saveAdminPermission,
  saveAuthGroupFeatures,
  saveAuthorRoleProfile,
  saveCompanyAccount,
  saveDeptRoleMapping,
  saveDeptRoleMember,
  saveMemberEdit,
  saveMemberRegister,
  submitCertificateApproveAction,
  submitCompanyApproveAction,
  submitMemberApproveAction,
  submitTradeApproveAction,
  submitTradeRejectAction
} from "./adminActions";
export {
  checkAdminAccountId,
  fetchAdminAccountCreatePage,
  fetchAdminListPage,
  fetchAdminPermissionPage,
  fetchAuthChangeHistory,
  fetchAuthChangePage,
  fetchAuthGroupPage,
  fetchCertificateApprovePage,
  fetchCompanyAccountPage,
  fetchCompanyApprovePage,
  fetchCompanyDetailPage,
  fetchCompanyListPage,
  fetchDeptRolePage,
  fetchMemberApprovePage,
  fetchMemberDetailPage,
  fetchMemberEditPage,
  fetchMemberListPage,
  searchAdminCompanies
} from "./adminMember";
export {
  fetchCertificateObjectionListPage,
  fetchCertificatePendingPage,
  fetchCertificateReviewPage,
  fetchMemberRegisterPage,
  fetchMemberStatsPage,
  fetchPasswordResetPage,
  fetchRefundAccountReviewPage,
  fetchSystemCodePage
} from "./member";
export {
  fetchCertificateStatisticsPage,
  fetchRefundListPage,
  fetchRefundProcessPage,
  fetchSettlementCalendarPage,
  fetchTradeApprovePage,
  fetchTradeDuplicatePage,
  fetchTradeListPage,
  fetchTradeRejectPage,
  fetchTradeStatisticsPage
} from "./trade";
export {
  addScreenBuilderNodeFromComponent,
  addScreenBuilderNodeTreeFromComponents,
  addSrWorkbenchStackItem,
  analyzeProjectUpgradeImpact,
  applyProjectUpgrade,
  approveSrTicket,
  autoCollectFullStackGovernanceRegistry,
  autoReplaceDeprecatedScreenBuilderComponents,
  clearSrWorkbenchStack,
  createSrTicket,
  deleteCodexSrTicket,
  deleteEnvironmentFeature,
  deleteEnvironmentManagedPage,
  deleteScreenBuilderComponentRegistryItem,
  directExecuteCodexSrTicket,
  directExecuteSrTicket,
  executeCodexProvision,
  executeCodexSrTicket,
  executeSrTicket,
  fetchAuditEvents,
  fetchCodexHistory,
  fetchCodexProvisionPage,
  fetchCodexSrTicketArtifact,
  fetchCodexSrTicketDetail,
  fetchContentMenuManagementPage,
  fetchEnvironmentFeatureImpact,
  fetchEnvironmentManagedPageImpact,
  fetchFullStackGovernanceRegistry,
  fetchFullStackManagementPage,
  fetchFunctionManagementPage,
  fetchHelpManagementPage,
  fetchMenuManagementPage,
  fetchNewPagePage,
  fetchPageManagementPage,
  fetchProjectVersionManagementPage,
  fetchScreenBuilderComponentRegistryUsage,
  fetchScreenBuilderPage,
  fetchScreenBuilderPreview,
  fetchScreenCommandPage,
  fetchSrWorkbenchPage,
  fetchTraceEvents,
  fetchWbsManagementPage,
  inspectCodexHistory,
  planCodexSrTicket,
  planSrTicket,
  prepareCodexSrTicket,
  prepareSrExecution,
  previewAutoReplaceDeprecatedScreenBuilderComponents,
  publishScreenBuilderDraft,
  quickExecuteSrTicket,
  queueDirectExecuteCodexSrTicket,
  registerScreenBuilderComponent,
  reissueCodexSrTicket,
  remapScreenBuilderComponentRegistryUsage,
  remediateCodexHistory,
  removeSrWorkbenchStackItem,
  restoreScreenBuilderDraft,
  rollbackCodexSrTicket,
  rollbackProjectVersion,
  runCodexLoginCheck,
  saveFullStackGovernanceRegistry,
  saveHelpManagementPage,
  saveScreenBuilderDraft,
  saveScreenCommandMenuMapping,
  saveWbsManagementEntry,
  scanScreenBuilderRegistryDiagnostics,
  skipPlanExecuteCodexSrTicket,
  skipPlanExecuteSrTicket,
  updateEnvironmentFeature,
  updateEnvironmentManagedPage,
  updateScreenBuilderComponentRegistry
} from "./platform";
export {
  fetchJoinSession,
  invalidateJoinSessionCache,
  resetJoinSession,
  saveJoinStep1,
  saveJoinStep2,
  saveJoinStep3,
  submitJoinCompanyReapply,
  submitJoinStep4
} from "./joinSession";
export {
  clearSecurityPolicySuppressions,
  decideIpWhitelistRequest,
  dispatchSecurityMonitoringNotification,
  dispatchSecurityPolicyNotifications,
  fetchAccessHistoryPage,
  fetchBlocklistPage,
  fetchErrorLogPage,
  fetchIpWhitelistPage,
  fetchLoginHistoryPage,
  fetchMemberSecurityHistoryPage,
  fetchNotificationPage,
  fetchSecurityAuditPage,
  fetchSecurityHistoryPage,
  fetchSecurityMonitoringPage,
  fetchSecurityPolicyPage,
  registerSecurityMonitoringBlockCandidate,
  runMenuPermissionAutoCleanup,
  runSecurityPolicyAutoFix,
  runSecurityPolicyBulkAutoFix,
  runSecurityPolicyRollback,
  saveSecurityHistoryAction,
  saveSecurityMonitoringState,
  saveSecurityPolicyFindingState,
  saveSecurityPolicyNotificationConfig,
  updateSecurityMonitoringBlockCandidate
} from "./security";
export {
  checkCompanyNameDuplicate,
  checkJoinEmail,
  checkJoinMemberId,
  fetchJoinCompanyReapplyPage,
  fetchJoinCompanyRegisterPage,
  fetchJoinCompanyStatusDetail,
  searchJoinCompanies,
  submitJoinCompanyRegister
} from "./join";
export {
  fetchMypageSection,
  invalidatePortalContextCache,
  saveMypageCompany,
  saveMypageEmail,
  saveMypageMarketing,
  saveMypagePassword,
  saveMypageProfile,
  saveMypageStaff
} from "./portal";
export {
  fetchAdminMenuPlaceholderPage,
  fetchCertificateAuditLogPage,
  fetchHomeMenuPlaceholderPage,
  fetchHomePayload,
  fetchSitemapPage,
  prefetchRouteBootstrap,
  prefetchRoutePageData
} from "./appBootstrap";
export {
  readBootstrappedAdminHomePageData,
  readBootstrappedAuthChangePageData,
  readBootstrappedAuthGroupPageData,
  readBootstrappedBackupConfigPageData,
  readBootstrappedCertificateAuditLogPageData,
  readBootstrappedCertificateRecCheckPageData,
  readBootstrappedCertificateReviewPageData,
  readBootstrappedCertificateStatisticsPageData,
  readBootstrappedDeptRolePageData,
  readBootstrappedEmissionDataHistoryPageData,
  readBootstrappedEmissionDefinitionStudioPageData,
  readBootstrappedEmissionResultDetailPageData,
  readBootstrappedEmissionResultListPageData,
  readBootstrappedEmissionSiteManagementPageData,
  readBootstrappedEmissionValidatePageData,
  readBootstrappedExternalMonitoringPageData,
  readBootstrappedHomePayload,
  readBootstrappedMemberEditPageData,
  readBootstrappedMemberStatsPageData,
  readBootstrappedMypagePayload,
  readBootstrappedNewPagePageData,
  readBootstrappedNotificationPageData,
  readBootstrappedRefundListPageData,
  readBootstrappedSchedulerManagementPageData,
  readBootstrappedScreenBuilderPageData,
  readBootstrappedSecurityAuditPageData,
  readBootstrappedSecurityMonitoringPageData,
  readBootstrappedSecurityPolicyPageData,
  readBootstrappedSettlementCalendarPageData,
  readBootstrappedTradeApprovePageData,
  readBootstrappedTradeDuplicatePageData,
  readBootstrappedTradeListPageData,
  readBootstrappedTradeRejectPageData,
  readBootstrappedTradeStatisticsPageData
} from "./bootstrap";
export function getAdminMenuTreeRefreshEventName() {
  return adminShellApi.getAdminMenuTreeRefreshEventName();
}

export function readAdminMenuTreeSnapshot(): AdminMenuTreePayload | null {
  return adminShellApi.readAdminMenuTreeSnapshot() as AdminMenuTreePayload | null;
}

export function readFrontendSessionSnapshot(): FrontendSession | null {
  return adminShellApi.readFrontendSessionSnapshot() as FrontendSession | null;
}

export function refreshAdminMenuTree() {
  adminShellApi.refreshAdminMenuTree();
}

export async function fetchFrontendSession(): Promise<FrontendSession> {
  return adminShellApi.fetchFrontendSession() as Promise<FrontendSession>;
}

export async function fetchAdminSessionSimulator(insttId?: string): Promise<AdminSessionSimulationPayload> {
  return adminShellApi.fetchAdminSessionSimulator(insttId) as Promise<AdminSessionSimulationPayload>;
}

export async function applyAdminSessionSimulator(
  _session: FrontendSession,
  payload: { insttId: string; emplyrId: string; authorCode: string; }
): Promise<AdminSessionSimulationPayload> {
  return adminShellApi.applyAdminSessionSimulator(_session as never, payload) as Promise<AdminSessionSimulationPayload>;
}

export async function resetAdminSessionSimulator(session: FrontendSession): Promise<AdminSessionSimulationPayload> {
  return adminShellApi.resetAdminSessionSimulator(session as never) as Promise<AdminSessionSimulationPayload>;
}

export async function fetchAdminMenuTree(): Promise<AdminMenuTreePayload> {
  return adminShellApi.fetchAdminMenuTree() as Promise<AdminMenuTreePayload>;
}

export async function fetchMypage(en = false) {
  return appBootstrapApi.fetchMypage(en) as Promise<MypagePayload>;
}
