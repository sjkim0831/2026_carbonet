import type { AuditEventSearchPayload, TraceEventSearchPayload } from "../../lib/api/client";
import { apiFetch, buildAdminApiPath, readJsonResponse } from "../../lib/api/core";

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
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/observability/audit-events")}${search.toString() ? `?${search.toString()}` : ""}`, {
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
  const response = await apiFetch(`${buildAdminApiPath("/api/admin/observability/trace-events")}${search.toString() ? `?${search.toString()}` : ""}`, {
    credentials: "include",
    apiId: "admin.observability.trace-events.search"
  });
  return readJsonResponse<TraceEventSearchPayload>(response);
}
