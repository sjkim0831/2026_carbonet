import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";
import type {
  EmissionCategoryItem,
  EmissionDataHistoryPagePayload,
  EmissionDefinitionMaterializeResponse,
  EmissionDefinitionDraftSavePayload,
  EmissionDefinitionDraftSaveResponse,
  EmissionDefinitionStudioPagePayload,
  EmissionFactorDefinition,
  EmissionGwpValueSavePayload,
  EmissionGwpValueSaveResponse,
  EmissionGwpValuesPagePayload,
  EmissionInputSessionSavePayload,
  EmissionLciClassificationPagePayload,
  EmissionLciClassificationSavePayload,
  EmissionManagementPagePayload,
  EmissionManagementElementSavePayload,
  EmissionManagementElementSaveResponse,
  EmissionResultDetailPagePayload,
  EmissionResultListPagePayload,
  EmissionSiteManagementPagePayload,
  EmissionSurveyAdminDataPagePayload,
  EmissionSurveyAdminPagePayload,
  EmissionSurveyCaseDraftSavePayload,
  EmissionSurveyClassificationLoadResponse,
  EmissionSurveyDraftSetSavePayload,
  EmissionTierResponse,
  EmissionVariableDefinition,
  EmissionValidatePagePayload
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
    if (value === true) {
      search.set(key, "true");
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function fetchLocalizedJsonPage<T>(koPath: string, enPath: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
  const response = await apiFetch(`${buildLocalizedPath(koPath, enPath)}${buildQueryString(params)}`, {
    credentials: "include"
  });
  return readJsonResponse<T>(response);
}

async function postAdminJson<T>(path: string, payload?: unknown): Promise<T> {
  const response = await apiFetch(buildAdminApiPath(path), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  return readJsonResponse<T>(response);
}

export async function fetchEmissionGwpValuesPage(params?: {
  searchKeyword?: string;
  sectionCode?: string;
  rowId?: string;
  pdfComparePolicy?: string;
  includePdfCompare?: boolean;
  pdfCompareScope?: string;
}): Promise<EmissionGwpValuesPagePayload> {
  return fetchLocalizedJsonPage<EmissionGwpValuesPagePayload>("/admin/emission/gwp-values/page-data", "/en/admin/emission/gwp-values/page-data", params);
}

export async function saveEmissionGwpValue(payload: EmissionGwpValueSavePayload): Promise<EmissionGwpValueSaveResponse> {
  return postAdminJson<EmissionGwpValueSaveResponse>("/emission/api/gwp-values/save", payload);
}

export async function deleteEmissionGwpValue(rowId: string): Promise<{ success: boolean; message: string; rowId?: string }> {
  return postAdminJson<{ success: boolean; message: string; rowId?: string }>("/emission/api/gwp-values/delete", { rowId });
}

export async function fetchEmissionResultListPage(params?: { pageIndex?: number; searchKeyword?: string; resultStatus?: string; verificationStatus?: string; }) {
  return fetchLocalizedJsonPage<EmissionResultListPagePayload>("/admin/emission/result_list/page-data", "/en/admin/emission/result_list/page-data", params);
}

export async function fetchEmissionResultDetailPage(resultId: string) {
  return fetchLocalizedJsonPage<EmissionResultDetailPagePayload>("/admin/emission/result_detail/page-data", "/en/admin/emission/result_detail/page-data", resultId ? { resultId } : undefined);
}

export async function fetchEmissionDataHistoryPage(params?: { pageIndex?: number; searchKeyword?: string; changeType?: string; changeTarget?: string; }) {
  return fetchLocalizedJsonPage<EmissionDataHistoryPagePayload>("/admin/emission/data_history/page-data", "/en/admin/emission/data_history/page-data", params);
}

export async function fetchEmissionSiteManagementPage() {
  return fetchLocalizedJsonPage<EmissionSiteManagementPagePayload>("/admin/emission/site-management/page-data", "/en/admin/emission/site-management/page-data");
}

export async function fetchEmissionManagementPage() {
  return fetchLocalizedJsonPage<EmissionManagementPagePayload>("/admin/emission/management/page-data", "/en/admin/emission/management/page-data");
}

export async function fetchEmissionLciClassificationPage(params?: {
  searchKeyword?: string;
  level?: string;
  useAt?: string;
  code?: string;
}) {
  return fetchLocalizedJsonPage<EmissionLciClassificationPagePayload>("/admin/emission/lci-classification/page-data", "/en/admin/emission/lci-classification/page-data", params);
}

export async function saveEmissionLciClassification(payload: EmissionLciClassificationSavePayload) {
  return postAdminJson<{ success: boolean; message: string; code?: string; row?: Record<string, unknown> | null }>("/api/admin/emission/lci-classification/save", payload);
}

export async function deleteEmissionLciClassification(code: string) {
  return postAdminJson<{ success: boolean; message: string; code?: string }>("/api/admin/emission/lci-classification/delete", { code });
}

export async function fetchEmissionSurveyAdminPage() {
  return fetchLocalizedJsonPage<EmissionSurveyAdminPagePayload>("/admin/emission/survey-admin/page-data", "/en/admin/emission/survey-admin/page-data");
}

export async function fetchEmissionSurveyAdminDataPage(filters: {
  lciMajorCode?: string;
  lciMiddleCode?: string;
  lciSmallCode?: string;
  status?: string;
  datasetId?: string;
  logId?: string;
  pageIndex?: number;
  pageSize?: number;
}) {
  return fetchLocalizedJsonPage<EmissionSurveyAdminDataPagePayload>("/admin/emission/survey-admin-data/page-data", "/en/admin/emission/survey-admin-data/page-data", filters);
}

export async function fetchEmissionDefinitionStudioPage() {
  return fetchLocalizedJsonPage<EmissionDefinitionStudioPagePayload>("/admin/emission/definition-studio/page-data", "/en/admin/emission/definition-studio/page-data");
}

export async function saveEmissionDefinitionDraft(payload: EmissionDefinitionDraftSavePayload) {
  return postAdminJson<EmissionDefinitionDraftSaveResponse>("/api/admin/emission-definition-studio/drafts", payload);
}

export async function publishEmissionDefinitionDraft(draftId: string) {
  const response = await apiFetch(buildLocalizedPath(`/admin/api/admin/emission-definition-studio/drafts/${encodeURIComponent(draftId)}/publish`, `/en/admin/api/admin/emission-definition-studio/drafts/${encodeURIComponent(draftId)}/publish`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "X-Requested-With": "XMLHttpRequest"
    })
  });
  return readJsonResponse<EmissionDefinitionDraftSaveResponse>(response);
}

export async function fetchEmissionValidatePage(params?: { pageIndex?: number; resultId?: string; searchKeyword?: string; verificationStatus?: string; priorityFilter?: string; }) {
  return fetchLocalizedJsonPage<EmissionValidatePagePayload>("/admin/emission/validate/page-data", "/en/admin/emission/validate/page-data", params);
}

async function postEmissionJson<T>(koPath: string, enPath: string, payload?: unknown): Promise<T> {
  const response = await apiFetch(buildLocalizedPath(koPath, enPath), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  return readJsonResponse<T>(response);
}

async function postEmissionFormData<T>(koPath: string, enPath: string, formData: FormData): Promise<T> {
  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await apiFetch(buildLocalizedPath(koPath, enPath), {
    method: "POST",
    credentials: "include",
    headers,
    body: formData
  });
  return readJsonResponse<T>(response);
}

export async function uploadEmissionSurveyWorkbook(uploadFile: File, context?: Record<string, string>) {
  const form = new FormData();
  form.set("uploadFile", uploadFile);
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      form.set(key, value || "");
    });
  }
  return postEmissionFormData<EmissionSurveyAdminPagePayload>(
    "/admin/api/admin/emission-survey-admin/parse-workbook",
    "/en/admin/api/admin/emission-survey-admin/parse-workbook",
    form
  );
}

export async function previewEmissionSurveySharedDataset(uploadFile: File) {
  const form = new FormData();
  form.append("uploadFile", uploadFile);
  return postEmissionFormData<EmissionSurveyAdminPagePayload>(
    "/admin/api/admin/emission-survey-admin/preview-shared-dataset",
    "/en/admin/api/admin/emission-survey-admin/preview-shared-dataset",
    form
  );
}

export async function replaceEmissionSurveySharedDataset(uploadFile: File) {
  const form = new FormData();
  form.append("uploadFile", uploadFile);
  return postEmissionFormData<EmissionSurveyAdminPagePayload>(
    "/admin/api/admin/emission-survey-admin/replace-shared-dataset",
    "/en/admin/api/admin/emission-survey-admin/replace-shared-dataset",
    form
  );
}

export async function saveEmissionSurveyCaseDraft(payload: EmissionSurveyCaseDraftSavePayload) {
  return postEmissionJson<Record<string, unknown>>(
    "/admin/api/admin/emission-survey-admin/case-drafts",
    "/en/admin/api/admin/emission-survey-admin/case-drafts",
    payload
  );
}

export async function loadEmissionSurveyCaseDraftsByClassification(lciMajorCode: string, lciMiddleCode: string, lciSmallCode: string, caseCode: string) {
  const query = new URLSearchParams({ lciMajorCode, lciMiddleCode, lciSmallCode, caseCode }).toString();
  const response = await apiFetch(`${buildLocalizedPath("/admin/api/admin/emission-survey-admin/case-drafts/by-classification", "/en/admin/api/admin/emission-survey-admin/case-drafts/by-classification")}?${query}`, {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<EmissionSurveyClassificationLoadResponse>(response);
}

export async function deleteEmissionSurveyCaseDraft(sectionCode: string, caseCode: string) {
  const query = new URLSearchParams({ sectionCode, caseCode }).toString();
  const response = await apiFetch(`${buildLocalizedPath("/admin/api/admin/emission-survey-admin/case-drafts", "/en/admin/api/admin/emission-survey-admin/case-drafts")}?${query}`, {
    method: "DELETE",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "X-Requested-With": "XMLHttpRequest"
    })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function saveEmissionSurveyDraftSet(payload: EmissionSurveyDraftSetSavePayload) {
  return postEmissionJson<Record<string, unknown>>(
    "/admin/api/admin/emission-survey-admin/draft-sets",
    "/en/admin/api/admin/emission-survey-admin/draft-sets",
    payload
  );
}

export async function deleteEmissionSurveyDraftSet(setId: string) {
  const query = new URLSearchParams({ setId }).toString();
  const response = await apiFetch(`${buildLocalizedPath("/admin/api/admin/emission-survey-admin/draft-sets", "/en/admin/api/admin/emission-survey-admin/draft-sets")}?${query}`, {
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
  return postEmissionJson<EmissionManagementElementSaveResponse>(
    "/admin/api/admin/emission-management/element-definitions",
    "/en/admin/api/admin/emission-management/element-definitions",
    payload
  );
}

export async function fetchEmissionCategories(searchKeyword?: string) {
  const search = new URLSearchParams();
  if (searchKeyword) {
    search.set("searchKeyword", searchKeyword);
  }
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/emission-management/categories")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<{ items: EmissionCategoryItem[] }>(response);
}

export async function fetchEmissionTiers(categoryId: number) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/categories/${encodeURIComponent(String(categoryId))}/tiers`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<EmissionTierResponse>(response);
}

export async function fetchEmissionVariableDefinitions(categoryId: number, tier: number) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/categories/${encodeURIComponent(String(categoryId))}/tiers/${encodeURIComponent(String(tier))}/variables`), {
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
  return postAdminJson<Record<string, unknown>>("/api/admin/emission-management/input-sessions", payload);
}

export async function fetchEmissionInputSession(sessionId: number) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/input-sessions/${encodeURIComponent(String(sessionId))}`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function calculateEmissionInputSession(sessionId: number) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/input-sessions/${encodeURIComponent(String(sessionId))}/calculate`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function materializeEmissionDefinitionScope(draftId: string) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/definition-scopes/${encodeURIComponent(draftId)}/materialize`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<EmissionDefinitionMaterializeResponse>(response);
}

export async function fetchEmissionScopeStatus(categoryCode: string, tier: number) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/scopes/${encodeURIComponent(categoryCode)}/${encodeURIComponent(String(tier))}/status`), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function precheckEmissionDefinitionScope(draftId: string) {
  const response = await apiFetch(buildAdminApiPath(`/api/admin/emission-management/definition-scopes/${encodeURIComponent(draftId)}/precheck`), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({ Accept: "application/json", "X-Requested-With": "XMLHttpRequest" })
  });
  return readJsonResponse<Record<string, unknown>>(response);
}

export async function fetchEmissionLimeDefaultFactor() {
  const response = await apiFetch(buildAdminApiPath("/api/admin/emission-management/lime/default-factor"), {
    credentials: "include",
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
  });
  return readJsonResponse<Record<string, unknown>>(response);
}
