import type {
  FullStackGovernanceAutoCollectRequest,
  FullStackGovernanceRegistryEntry,
  ScreenCommandPagePayload
} from "./client";
import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";

export async function fetchScreenCommandPage(pageId: string): Promise<ScreenCommandPagePayload> {
  const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
  const response = await apiFetch(`${buildAdminApiPath("/api/platform/help-management/screen-command/page")}${query}`, {
    credentials: "include",
    apiId: "admin.help-management.screen-command.page"
  });
  return readJsonResponse<ScreenCommandPagePayload>(response);
}

export async function fetchFullStackGovernanceRegistry(menuCode: string): Promise<FullStackGovernanceRegistryEntry> {
  const query = menuCode ? `?menuCode=${encodeURIComponent(menuCode)}` : "";
  const response = await apiFetch(`/api/admin/full-stack-management/registry${query}`, {
    credentials: "include",
    apiId: "admin.full-stack-management.registry"
  });
  return readJsonResponse<FullStackGovernanceRegistryEntry>(response);
}

export async function autoCollectFullStackGovernanceRegistry(payload: FullStackGovernanceAutoCollectRequest) {
  const response = await apiFetch("/api/admin/full-stack-management/registry/auto-collect", {
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
