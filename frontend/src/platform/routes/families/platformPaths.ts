import { buildLocalizedPath } from "../../../lib/navigation/runtime";

function appendQuery(basePath: string, params: Record<string, string>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildPlatformStudioPath() {
  return buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio");
}

export function buildFullStackManagementPath() {
  return buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management");
}

export function buildHelpManagementPath() {
  return buildLocalizedPath("/admin/system/help-management", "/en/admin/system/help-management");
}

export function buildInfraPath() {
  return buildLocalizedPath("/admin/system/infra", "/en/admin/system/infra");
}

export function buildMenuCreatePagePath() {
  return buildLocalizedPath("/admin/system/menu/create-page", "/en/admin/system/menu/create-page");
}

export function buildFeatureManagementPath(params: { menuType?: string; searchMenuCode?: string } = {}) {
  return buildLocalizedPath(
    appendQuery("/admin/system/feature-management", {
      menuType: params.menuType || "",
      searchMenuCode: params.searchMenuCode || ""
    }),
    appendQuery("/en/admin/system/feature-management", {
      menuType: params.menuType || "",
      searchMenuCode: params.searchMenuCode || ""
    })
  );
}

export function buildFeatureManagementCreatePath() {
  return buildLocalizedPath("/admin/system/feature-management/create", "/en/admin/system/feature-management/create");
}

export function buildObservabilityPath(params: {
  menuCode?: string;
  pageId?: string;
  searchKeyword?: string;
  traceId?: string;
  actionCode?: string;
} = {}) {
  return buildLocalizedPath(
    appendQuery("/admin/system/observability", {
      menuCode: params.menuCode || "",
      pageId: params.pageId || "",
      searchKeyword: params.searchKeyword || "",
      traceId: params.traceId || "",
      actionCode: params.actionCode || ""
    }),
    appendQuery("/en/admin/system/observability", {
      menuCode: params.menuCode || "",
      pageId: params.pageId || "",
      searchKeyword: params.searchKeyword || "",
      traceId: params.traceId || "",
      actionCode: params.actionCode || ""
    })
  );
}

export function buildUnifiedLogPath(params: { projectId?: string; targetType?: string; targetId?: string } = {}) {
  return buildLocalizedPath(
    appendQuery("/admin/system/unified_log", {
      projectId: params.projectId || "",
      targetType: params.targetType || "",
      targetId: params.targetId || ""
    }),
    appendQuery("/en/admin/system/unified_log", {
      projectId: params.projectId || "",
      targetType: params.targetType || "",
      targetId: params.targetId || ""
    })
  );
}

export function buildUnifiedLogTracePath(params: { traceId?: string; projectId?: string } = {}) {
  return buildLocalizedPath(
    appendQuery("/admin/system/unified_log/trace", {
      traceId: params.traceId || "",
      projectId: params.projectId || ""
    }),
    appendQuery("/en/admin/system/unified_log/trace", {
      traceId: params.traceId || "",
      projectId: params.projectId || ""
    })
  );
}
