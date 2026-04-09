import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildAdminApiPath, buildCsrfHeaders, buildResilientCsrfHeaders, readJsonResponse } from "./core";
import { buildPageCacheKey, fetchCachedJson, fetchJsonWithoutCache } from "./pageCache";
import type {
  AuditEventSearchPayload,
  CodexHistoryPayload,
  CodexProvisionPagePayload,
  FunctionManagementPagePayload,
  FullStackGovernanceAutoCollectRequest,
  FullStackGovernanceRegistryEntry,
  HelpManagementItem,
  HelpManagementPagePayload,
  MenuManagementPagePayload,
  NewPagePagePayload,
  PageManagementPagePayload,
  ProjectApplyUpgradeResponse,
  ProjectRollbackResponse,
  ProjectUpgradeImpactResponse,
  ProjectVersionListPayload,
  ProjectVersionManagementPagePayload,
  ProjectVersionOverviewPayload,
  ProjectVersionServerStatePayload,
  ProjectVersionTargetArtifactPayload,
  ScreenCommandPagePayload,
  ScreenBuilderAutoReplacePreviewItem,
  ScreenBuilderComponentRegistryItem,
  ScreenBuilderComponentUsage,
  ScreenBuilderEventBinding,
  ScreenBuilderNode,
  ScreenBuilderPagePayload,
  ScreenBuilderPreviewPayload,
  ScreenBuilderRegistryScanItem,
  SrTicketArtifactPayload,
  SrTicketDetailPayload,
  SrTicketRow,
  SrWorkbenchPagePayload,
  SrWorkbenchStackItem,
  TraceEventSearchPayload,
  WbsManagementPagePayload
} from "./client";

const fetch = apiFetch;

function buildVersionControlApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return buildLocalizedPath(
    `/admin/api/platform/version-control${normalized}`,
    `/en/admin/api/platform/version-control${normalized}`
  );
}

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
  const response = await fetch(buildLocalizedPath(
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

async function postProjectVersionJson<T>(
  url: string,
  payload: unknown,
  fallback: string,
  requiredFeatureCode: string
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<T & Record<string, unknown>>(response).catch((error) => {
    if (error instanceof Error && error.message.includes("Authentication required")) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("Server returned HTML instead of JSON")) {
      throw error;
    }
    return {} as T & Record<string, unknown>;
  });
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        String(body.message || `You do not have permission to run this version-management action. Required feature: ${requiredFeatureCode}.`)
      );
    }
    throw new Error(String(body.message || fallback));
  }
  return body as T;
}

function versionPermissionError(
  body: Record<string, unknown>,
  status: number,
  fallback: string,
  requiredFeatureCode: string
) {
  if (status === 403) {
    return String(
      body.message || `You do not have permission to access project version management. Required feature: ${requiredFeatureCode}.`
    );
  }
  return String(body.message || fallback);
}

type EnvironmentManagedPageImpactResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  defaultViewFeatureCode?: string;
  linkedFeatureCodes?: string[];
  nonDefaultFeatureCodes?: string[];
  defaultViewRoleRefCount?: number;
  defaultViewUserOverrideCount?: number;
  blocked?: boolean;
} & Record<string, unknown>;

type EnvironmentManagedPageDeleteResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  nonDefaultFeatureCodes?: string[];
  defaultViewRoleRefCount?: number;
  defaultViewUserOverrideCount?: number;
} & Record<string, unknown>;

type EnvironmentFeatureImpactResponse = {
  success?: boolean;
  message?: string;
  featureCode?: string;
  assignedRoleCount?: number;
  userOverrideCount?: number;
} & Record<string, unknown>;

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

export async function fetchFunctionManagementPage(params?: { menuType?: string; searchMenuCode?: string; searchKeyword?: string; }) {
  const search = new URLSearchParams();
  if (params?.menuType) search.set("menuType", params.menuType);
  if (params?.searchMenuCode) search.set("searchMenuCode", params.searchMenuCode);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const query = search.toString();
  return fetchLocalizedPageData<FunctionManagementPagePayload>(
    "/admin/system/feature-management/page-data",
    "/en/admin/system/feature-management/page-data",
    {
      query,
      fallbackMessage: "Failed to load function management page",
      resolveError: (body, status) => body.featureMgmtError || `Failed to load function management page: ${status}`
    }
  );
}

export async function fetchMenuManagementPage(menuType?: string, saved?: string) {
  const search = new URLSearchParams();
  if (menuType) search.set("menuType", menuType);
  if (saved) search.set("saved", saved);
  const query = search.toString();
  return fetchLocalizedPageData<MenuManagementPagePayload>(
    "/admin/system/menu/page-data",
    "/en/admin/system/menu/page-data",
    {
      query,
      fallbackMessage: "Failed to load menu management page",
      resolveError: (body, status) => body.menuMgmtError || `Failed to load menu management page: ${status}`
    }
  );
}

export async function fetchContentMenuManagementPage(saved?: string) {
  const search = new URLSearchParams();
  if (saved) search.set("saved", saved);
  const query = search.toString();
  return fetchLocalizedPageData<MenuManagementPagePayload>(
    "/admin/content/menu/page-data",
    "/en/admin/content/menu/page-data",
    {
      query,
      fallbackMessage: "Failed to load content menu management page",
      resolveError: (body, status) => body.menuMgmtError || `Failed to load content menu management page: ${status}`
    }
  );
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
    url: `${buildAdminApiPath("/api/platform/screen-builder/page")}${query ? `?${query}` : ""}`,
    mapError: (body, status) => body.screenBuilderMessage || `Failed to load screen builder page: ${status}`
  });
}

export async function fetchProjectVersionManagementPage(params?: {
  projectId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ProjectVersionManagementPagePayload> {
  const search = new URLSearchParams();
  if (params?.projectId) search.set("projectId", params.projectId);
  const overviewQuery = search.toString();

  const paging = new URLSearchParams(search);
  if (params?.page) paging.set("page", String(params.page));
  if (params?.pageSize) paging.set("pageSize", String(params.pageSize));
  const listQuery = paging.toString();

  const [overview, adapterHistory, releaseUnits, serverDeployState, candidateArtifacts] = await Promise.all([
    fetchJsonWithoutCache<ProjectVersionOverviewPayload>({
      url: `${buildVersionControlApiPath("/overview")}${overviewQuery ? `?${overviewQuery}` : ""}`,
      mapError: (body, status) => versionPermissionError(body, status, `Failed to load version overview: ${status}`, "A0060404_VIEW")
    }),
    fetchJsonWithoutCache<ProjectVersionListPayload>({
      url: `${buildVersionControlApiPath("/adapter-history")}${listQuery ? `?${listQuery}` : ""}`,
      mapError: (body, status) => versionPermissionError(body, status, `Failed to load adapter history: ${status}`, "A0060404_VIEW")
    }),
    fetchJsonWithoutCache<ProjectVersionListPayload>({
      url: `${buildVersionControlApiPath("/release-units")}${listQuery ? `?${listQuery}` : ""}`,
      mapError: (body, status) => versionPermissionError(body, status, `Failed to load release units: ${status}`, "A0060404_VIEW")
    }),
    fetchJsonWithoutCache<ProjectVersionServerStatePayload>({
      url: `${buildVersionControlApiPath("/server-deploy-state")}${overviewQuery ? `?${overviewQuery}` : ""}`,
      mapError: (body, status) => versionPermissionError(body, status, `Failed to load server deployment state: ${status}`, "A0060404_VIEW")
    }),
    fetchJsonWithoutCache<ProjectVersionListPayload>({
      url: `${buildVersionControlApiPath("/candidate-artifacts")}${listQuery ? `?${listQuery}` : ""}`,
      mapError: (body, status) => versionPermissionError(body, status, `Failed to load candidate artifacts: ${status}`, "A0060404_VIEW")
    })
  ]);

  return {
    overview,
    adapterHistory,
    releaseUnits,
    serverDeployState,
    candidateArtifacts
  };
}

export async function analyzeProjectUpgradeImpact(payload: {
  projectId: string;
  operator: string;
  targetArtifactSet: ProjectVersionTargetArtifactPayload[];
}) {
  return postProjectVersionJson<ProjectUpgradeImpactResponse>(
    buildVersionControlApiPath("/upgrade-impact"),
    payload,
    "Failed to analyze project upgrade impact.",
    "A0060404_ANALYZE"
  );
}

export async function applyProjectUpgrade(payload: {
  projectId: string;
  operator: string;
  targetArtifactSet: ProjectVersionTargetArtifactPayload[];
}) {
  return postProjectVersionJson<ProjectApplyUpgradeResponse>(
    buildVersionControlApiPath("/apply-upgrade"),
    payload,
    "Failed to apply project upgrade.",
    "A0060404_APPLY"
  );
}

export async function rollbackProjectVersion(payload: {
  projectId: string;
  operator: string;
  targetReleaseUnitId: string;
}) {
  return postProjectVersionJson<ProjectRollbackResponse>(
    buildVersionControlApiPath("/rollback"),
    payload,
    "Failed to rollback project version.",
    "A0060404_ROLLBACK"
  );
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
  const response = await fetch(`${buildAdminApiPath("/api/platform/screen-builder/preview")}${query ? `?${query}` : ""}`, {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/draft"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/restore"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/publish"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/update"), {
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
  const response = await fetch(buildAdminApiPath(`/api/platform/screen-builder/component-registry/usage?componentId=${encodeURIComponent(componentId)}`), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/delete"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/remap"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/auto-replace"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/auto-replace-preview"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/scan"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/add-node"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/screen-builder/component-registry/add-node-tree"), {
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
  const body = await readJsonResponse<EnvironmentManagedPageImpactResponse>(response);
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
  const body = await readJsonResponse<EnvironmentManagedPageDeleteResponse>(response);
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
  const body = await readJsonResponse<EnvironmentFeatureImpactResponse>(response);
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
  const body = await readJsonResponse<EnvironmentFeatureImpactResponse>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to delete environment feature: ${response.status}`);
  return body;
}

export async function fetchPageManagementPage(params?: {
  menuType?: string;
  searchKeyword?: string;
  searchUrl?: string;
  autoFeature?: string;
  updated?: string;
  deleted?: string;
  deletedRoleRefs?: string;
  deletedUserOverrides?: string;
}) {
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

export async function fetchCodexProvisionPage() {
  const response = await fetch(buildLocalizedPath("/admin/system/codex-request/page-data", "/en/admin/system/codex-request/page-data"), {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`Failed to load Codex provision page: ${response.status}`);
  return body as CodexProvisionPagePayload;
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
  const response = await fetch(`${buildAdminApiPath("/api/platform/help-management/page")}${query}`, {
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
  const response = await fetch(buildAdminApiPath("/api/platform/help-management/save"), {
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
  const response = await fetch(`${buildAdminApiPath("/api/platform/help-management/screen-command/page")}${query}`, {
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
  const response = await fetch(buildAdminApiPath("/api/platform/help-management/screen-command/map-menu"), {
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
  const response = await fetch(`${buildAdminApiPath("/api/platform/workbench/page")}${query}`, {
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
  const response = await fetch(buildAdminApiPath("/api/platform/workbench/tickets"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/workbench/quick-execute"), {
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
  const response = await fetch(buildAdminApiPath("/api/platform/workbench/stack-items"), {
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
  const response = await fetch(buildAdminApiPath(`/api/platform/workbench/stack-items/${encodeURIComponent(stackItemId)}/delete`), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.stack-item.delete",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; removedCount: number }>(response);
}

export async function clearSrWorkbenchStack() {
  const response = await fetch(buildAdminApiPath("/api/platform/workbench/stack-items/clear"), {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.stack-item.clear",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string }>(response);
}

export async function approveSrTicket(ticketId: string, decision: "APPROVE" | "REJECT", comment: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/approve`)}`, {
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
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/prepare-execution`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.prepare-execution",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function planSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/plan`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.plan",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function executeSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function directExecuteSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/direct-execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.direct-execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}

export async function skipPlanExecuteSrTicket(ticketId: string) {
  const response = await fetch(`${buildAdminApiPath(`/api/platform/workbench/tickets/${encodeURIComponent(ticketId)}/skip-plan-execute`)}`, {
    method: "POST",
    credentials: "include",
    apiId: "admin.sr-workbench.ticket.skip-plan-execute",
    headers: await buildResilientCsrfHeaders()
  });
  return readJsonResponse<{ success: boolean; message: string; ticket: SrTicketRow }>(response);
}
