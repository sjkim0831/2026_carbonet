import type {
  ScreenBuilderAutoReplacePreviewItem,
  ScreenBuilderComponentRegistryItem,
  ScreenBuilderComponentUsage,
  ScreenBuilderEventBinding,
  ScreenBuilderNode,
  ScreenBuilderPagePayload,
  ScreenBuilderPreviewPayload,
  ScreenBuilderRegistryScanItem
} from "./client";
import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";

const pageDataCache = new Map<string, unknown>();

function buildPageCacheKey(path: string) {
  return `page:${path}`;
}

async function fetchCachedJson<T>(options: {
  cacheKey: string;
  url: string;
  mapError: (body: Record<string, unknown>, status: number) => string;
}): Promise<T> {
  if (pageDataCache.has(options.cacheKey)) {
    return pageDataCache.get(options.cacheKey) as T;
  }
  const response = await apiFetch(options.url, {
    credentials: "include"
  });
  const body = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(options.mapError(body, response.status));
  }
  pageDataCache.set(options.cacheKey, body);
  return body as T;
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
    mapError: (body, status) => String(body.screenBuilderMessage || `Failed to load screen builder page: ${status}`)
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
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/screen-builder/preview")}${query ? `?${query}` : ""}`, {
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
  authorityProfile?: ScreenBuilderPagePayload["authorityProfile"];
  nodes: ScreenBuilderNode[];
  events: ScreenBuilderEventBinding[];
}) {
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/draft"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/restore"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/publish"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/update"), {
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
  const response = await apiFetch(buildAdminApiPath(`/api/admin/screen-builder/component-registry/usage?componentId=${encodeURIComponent(componentId)}`), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/delete"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/remap"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/auto-replace"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/auto-replace-preview"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/scan"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/add-node"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/admin/screen-builder/component-registry/add-node-tree"), {
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
