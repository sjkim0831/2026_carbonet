import { apiFetch, buildAdminApiPath, readJsonResponse } from "./core";

export type UnifiedLogTab =
  | "all"
  | "access-auth"
  | "audit"
  | "error"
  | "trace"
  | "security"
  | "batch-runtime";

export interface UnifiedLogSearchParams {
  pageIndex?: number;
  pageSize?: number;
  tab?: UnifiedLogTab;
  logType?: string;
  detailType?: string;
  resultCode?: string;
  actorId?: string;
  actorRole?: string;
  insttId?: string;
  memberType?: string;
  menuCode?: string;
  pageId?: string;
  componentId?: string;
  functionId?: string;
  apiId?: string;
  actionCode?: string;
  targetType?: string;
  targetId?: string;
  traceId?: string;
  requestUri?: string;
  remoteAddr?: string;
  fromDate?: string;
  toDate?: string;
  searchKeyword?: string;
}

export interface UnifiedLogRow {
  logId: string;
  logType: string;
  detailType: string;
  occurredAt: string;
  resultCode: string;
  actorId: string;
  actorRole: string;
  insttId: string;
  companyName: string;
  memberType: string;
  menuCode: string;
  pageId: string;
  componentId: string;
  functionId: string;
  apiId: string;
  actionCode: string;
  targetType: string;
  targetId: string;
  traceId: string;
  requestUri: string;
  remoteAddr: string;
  durationMs: number | null;
  summary: string;
  message: string;
  rawSourceType: string;
}

export interface UnifiedLogSearchPayload {
  totalCount: number;
  items: UnifiedLogRow[];
}

export async function fetchUnifiedLog(params?: UnifiedLogSearchParams): Promise<UnifiedLogSearchPayload> {
  const search = new URLSearchParams();
  if (params?.pageIndex) search.set("pageIndex", String(params.pageIndex));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.tab) search.set("tab", params.tab);
  if (params?.logType) search.set("logType", params.logType);
  if (params?.detailType) search.set("detailType", params.detailType);
  if (params?.resultCode) search.set("resultCode", params.resultCode);
  if (params?.actorId) search.set("actorId", params.actorId);
  if (params?.actorRole) search.set("actorRole", params.actorRole);
  if (params?.insttId) search.set("insttId", params.insttId);
  if (params?.memberType) search.set("memberType", params.memberType);
  if (params?.menuCode) search.set("menuCode", params.menuCode);
  if (params?.pageId) search.set("pageId", params.pageId);
  if (params?.componentId) search.set("componentId", params.componentId);
  if (params?.functionId) search.set("functionId", params.functionId);
  if (params?.apiId) search.set("apiId", params.apiId);
  if (params?.actionCode) search.set("actionCode", params.actionCode);
  if (params?.targetType) search.set("targetType", params.targetType);
  if (params?.targetId) search.set("targetId", params.targetId);
  if (params?.traceId) search.set("traceId", params.traceId);
  if (params?.requestUri) search.set("requestUri", params.requestUri);
  if (params?.remoteAddr) search.set("remoteAddr", params.remoteAddr);
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  if (params?.searchKeyword) search.set("searchKeyword", params.searchKeyword);
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/observability/unified-log")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include",
    apiId: "admin.observability.unified-log.search"
  });
  return readJsonResponse<UnifiedLogSearchPayload>(response);
}
