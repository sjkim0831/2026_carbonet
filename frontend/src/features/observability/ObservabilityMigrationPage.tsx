import { useEffect, useState } from "react";
import { logGovernanceScope } from "../../app/policy/debug";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { verifyRuntimeContextKeys } from "../admin-ui/contextKeyPresets";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import type { AuditEventSearchPayload, TraceEventSearchPayload } from "../../lib/api/client";
import { fetchAuditEvents, fetchTraceEvents } from "../../lib/api/observability";
import { fetchUnifiedLog, type UnifiedLogRow, type UnifiedLogSearchPayload, type UnifiedLogTab } from "../../lib/api/unifiedLog";
import { AdminInput, AdminTable, MemberButton, MemberSectionToolbar } from "../member/common";

type ObservabilityTab = "audit" | "trace";
const UNIFIED_LOG_TABS: UnifiedLogTab[] = ["all", "access-auth", "audit", "error", "trace", "security", "batch-runtime"];
const UNIFIED_LOG_PRESETS = [
  {
    pathSuffix: "/system/unified_log",
    label: "통합 로그",
    subtitle: "접속, 감사, 오류, 추적 로그를 하나의 공통 계약으로 조회합니다.",
    tab: "all" as UnifiedLogTab,
    logType: "",
    detailType: ""
  },
  {
    pathSuffix: "/system/unified_log/trace",
    label: "추적 로그",
    subtitle: "traceId를 기준으로 페이지, 컴포넌트, API 흐름을 추적합니다.",
    tab: "trace" as UnifiedLogTab,
    logType: "TRACE",
    detailType: ""
  },
  {
    pathSuffix: "/system/unified_log/page-events",
    label: "페이지 이벤트 로그",
    subtitle: "페이지 진입과 화면 전환 흐름을 추적합니다.",
    tab: "trace" as UnifiedLogTab,
    logType: "TRACE",
    detailType: "PAGE_VIEW,PAGE_LEAVE"
  },
  {
    pathSuffix: "/system/unified_log/ui-actions",
    label: "UI 액션 로그",
    subtitle: "버튼, 검색, 저장 같은 사용자 액션을 추적합니다.",
    tab: "trace" as UnifiedLogTab,
    logType: "TRACE",
    detailType: "UI_ACTION"
  },
  {
    pathSuffix: "/system/unified_log/api-trace",
    label: "API 추적 로그",
    subtitle: "화면 액션과 연결된 API 호출 흐름을 추적합니다.",
    tab: "trace" as UnifiedLogTab,
    logType: "TRACE",
    detailType: "API_REQUEST,API_RESPONSE"
  },
  {
    pathSuffix: "/system/unified_log/ui-errors",
    label: "UI 오류 로그",
    subtitle: "프론트 오류와 렌더링 실패를 추적합니다.",
    tab: "error" as UnifiedLogTab,
    logType: "TRACE,ERROR",
    detailType: "UI_ERROR,WINDOW_ERROR,UNHANDLED_REJECTION,REACT_ERROR_BOUNDARY,FRONTEND_REPORT,FRONTEND_TELEMETRY"
  },
  {
    pathSuffix: "/system/unified_log/layout-render",
    label: "레이아웃 렌더 로그",
    subtitle: "레이아웃 렌더링과 화면 구성 변경을 추적합니다.",
    tab: "trace" as UnifiedLogTab,
    logType: "TRACE",
    detailType: "LAYOUT_RENDER"
  }
] as const;

function resolveUnifiedLogPreset() {
  if (typeof window === "undefined") {
    return UNIFIED_LOG_PRESETS[0];
  }
  const pathname = window.location.pathname;
  return UNIFIED_LOG_PRESETS.find((preset) => pathname.endsWith(preset.pathSuffix)) || UNIFIED_LOG_PRESETS[0];
}

function readInitialQuery() {
  if (typeof window === "undefined") {
    return {
      tab: "audit" as ObservabilityTab,
      unifiedTab: "all" as UnifiedLogTab,
      traceId: "",
      actorId: "",
      actionCode: "",
      pageId: "",
      componentId: "",
      functionId: "",
      apiId: "",
      eventType: "",
      resultCode: "",
      searchKeyword: ""
    };
  }
  const params = new URLSearchParams(window.location.search);
  const tab: ObservabilityTab = params.get("tab") === "trace" ? "trace" : "audit";
  const requestedUnifiedTab = (params.get("tab") || "").trim() as UnifiedLogTab;
  return {
    tab,
    unifiedTab: UNIFIED_LOG_TABS.includes(requestedUnifiedTab) ? requestedUnifiedTab : "all",
    traceId: params.get("traceId") || "",
    actorId: params.get("actorId") || "",
    actionCode: params.get("actionCode") || "",
    pageId: params.get("pageId") || "",
    componentId: params.get("componentId") || "",
    functionId: params.get("functionId") || "",
    apiId: params.get("apiId") || "",
    eventType: params.get("eventType") || "",
    resultCode: params.get("resultCode") || "",
    searchKeyword: params.get("searchKeyword") || ""
  };
}

export function ObservabilityMigrationPage() {
  const en = isEnglish();
  const isUnifiedLogPage = typeof window !== "undefined" && window.location.pathname.includes("/system/unified_log");
  const unifiedPreset = resolveUnifiedLogPreset();
  const initialQuery = readInitialQuery();
  const [tab, setTab] = useState<ObservabilityTab>(initialQuery.tab);
  const [unifiedTab, setUnifiedTab] = useState<UnifiedLogTab>(isUnifiedLogPage && unifiedPreset.tab !== "all" ? unifiedPreset.tab : initialQuery.unifiedTab);
  const [auditPage, setAuditPage] = useState<AuditEventSearchPayload | null>(null);
  const [tracePage, setTracePage] = useState<TraceEventSearchPayload | null>(null);
  const [unifiedPage, setUnifiedPage] = useState<UnifiedLogSearchPayload | null>(null);
  const [traceId, setTraceId] = useState(initialQuery.traceId);
  const [actorId, setActorId] = useState(initialQuery.actorId);
  const [actionCode, setActionCode] = useState(initialQuery.actionCode);
  const [pageId, setPageId] = useState(initialQuery.pageId);
  const [componentId, setComponentId] = useState(initialQuery.componentId);
  const [functionId, setFunctionId] = useState(initialQuery.functionId);
  const [apiId, setApiId] = useState(initialQuery.apiId);
  const [eventType, setEventType] = useState(isUnifiedLogPage && unifiedPreset.detailType ? unifiedPreset.detailType : initialQuery.eventType);
  const [resultCode, setResultCode] = useState(initialQuery.resultCode);
  const [searchKeyword, setSearchKeyword] = useState(initialQuery.searchKeyword);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAudit(next?: { traceId?: string; actorId?: string; actionCode?: string; pageId?: string; }) {
    logGovernanceScope("ACTION", "observability-audit-search", {
      traceId: next?.traceId ?? traceId,
      actorId: next?.actorId ?? actorId,
      actionCode: next?.actionCode ?? actionCode,
      pageId: next?.pageId ?? pageId
    });
    setLoading(true);
    try {
      const payload = await fetchAuditEvents({
        pageIndex: 1,
        pageSize: 20,
        traceId: next?.traceId ?? traceId,
        actorId: next?.actorId ?? actorId,
        actionCode: next?.actionCode ?? actionCode,
        pageId: next?.pageId ?? pageId
      });
      setAuditPage(payload);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrace(next?: {
    traceId?: string;
    pageId?: string;
    componentId?: string;
    functionId?: string;
    apiId?: string;
    eventType?: string;
    resultCode?: string;
    searchKeyword?: string;
  }) {
    logGovernanceScope("ACTION", "observability-trace-search", {
      traceId: next?.traceId ?? traceId,
      pageId: next?.pageId ?? pageId,
      componentId: next?.componentId ?? componentId,
      functionId: next?.functionId ?? functionId,
      apiId: next?.apiId ?? apiId,
      eventType: next?.eventType ?? eventType,
      resultCode: next?.resultCode ?? resultCode,
      searchKeyword: next?.searchKeyword ?? searchKeyword
    });
    setLoading(true);
    try {
      const payload = await fetchTraceEvents({
        pageIndex: 1,
        pageSize: 20,
        traceId: next?.traceId ?? traceId,
        pageId: next?.pageId ?? pageId,
        componentId: next?.componentId ?? componentId,
        functionId: next?.functionId ?? functionId,
        apiId: next?.apiId ?? apiId,
        eventType: next?.eventType ?? eventType,
        resultCode: next?.resultCode ?? resultCode,
        searchKeyword: next?.searchKeyword ?? searchKeyword
      });
      setTracePage(payload);
    } finally {
      setLoading(false);
    }
  }

  async function loadUnified(next?: { tab?: UnifiedLogTab }) {
    const effectiveTab = next?.tab ?? unifiedTab;
    const effectiveLogType = unifiedPreset.logType || "";
    const effectiveDetailType = unifiedPreset.detailType || eventType;
    logGovernanceScope("ACTION", "unified-log-search", {
      tab: effectiveTab,
      logType: effectiveLogType,
      traceId,
      actorId,
      actionCode,
      pageId,
      componentId,
      functionId,
      apiId,
      eventType: effectiveDetailType,
      resultCode,
      searchKeyword
    });
    setLoading(true);
    try {
      const payload = await fetchUnifiedLog({
        pageIndex: 1,
        pageSize: 20,
        tab: effectiveTab,
        logType: effectiveLogType,
        traceId,
        actorId,
        actionCode,
        pageId,
        componentId,
        functionId,
        apiId,
        detailType: effectiveDetailType,
        resultCode,
        searchKeyword
      });
      setUnifiedPage(payload);
    } finally {
      setLoading(false);
    }
  }

  function syncUnifiedLogUrl(nextTab: UnifiedLogTab) {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("tab", nextTab);
    if (traceId) url.searchParams.set("traceId", traceId); else url.searchParams.delete("traceId");
    if (actorId) url.searchParams.set("actorId", actorId); else url.searchParams.delete("actorId");
    if (actionCode) url.searchParams.set("actionCode", actionCode); else url.searchParams.delete("actionCode");
    if (pageId) url.searchParams.set("pageId", pageId); else url.searchParams.delete("pageId");
    if (componentId) url.searchParams.set("componentId", componentId); else url.searchParams.delete("componentId");
    if (functionId) url.searchParams.set("functionId", functionId); else url.searchParams.delete("functionId");
    if (apiId) url.searchParams.set("apiId", apiId); else url.searchParams.delete("apiId");
    const effectiveDetailType = unifiedPreset.detailType || eventType;
    const effectiveLogType = unifiedPreset.logType || "";
    if (effectiveDetailType) url.searchParams.set("eventType", effectiveDetailType); else url.searchParams.delete("eventType");
    if (effectiveLogType) url.searchParams.set("logType", effectiveLogType); else url.searchParams.delete("logType");
    if (resultCode) url.searchParams.set("resultCode", resultCode); else url.searchParams.delete("resultCode");
    if (searchKeyword) url.searchParams.set("searchKeyword", searchKeyword); else url.searchParams.delete("searchKeyword");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function applyUnifiedTab(nextTab: UnifiedLogTab) {
    setUnifiedTab(nextTab);
    syncUnifiedLogUrl(nextTab);
    loadUnified({ tab: nextTab }).catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    if (isUnifiedLogPage && unifiedPreset.detailType && eventType !== unifiedPreset.detailType) {
      setEventType(unifiedPreset.detailType);
    }
    if (isUnifiedLogPage && unifiedPreset.tab !== "all" && unifiedTab !== unifiedPreset.tab) {
      setUnifiedTab(unifiedPreset.tab);
    }
    const loader = isUnifiedLogPage
      ? loadUnified()
      : Promise.all([loadAudit(), loadTrace()]);
    Promise.resolve(loader).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    logGovernanceScope("PAGE", "observability", {
      route: window.location.pathname,
      tab: isUnifiedLogPage ? unifiedTab : tab,
      traceId,
      pageId,
      actorId,
      actionCode,
      componentId,
      functionId,
      apiId
    });
    logGovernanceScope("COMPONENT", isUnifiedLogPage ? "unified-log-table" : tab === "audit" ? "observability-audit-table" : "observability-trace-table", {
      component: isUnifiedLogPage ? "unified-log-table" : tab === "audit" ? "observability-audit-table" : "observability-trace-table",
      rowCount: Number(isUnifiedLogPage ? unifiedPage?.items?.length || 0 : tab === "audit" ? auditPage?.items?.length || 0 : tracePage?.items?.length || 0),
      totalCount: Number(isUnifiedLogPage ? unifiedPage?.totalCount || 0 : tab === "audit" ? auditPage?.totalCount || 0 : tracePage?.totalCount || 0)
    });
  }, [actionCode, actorId, apiId, auditPage?.items?.length, auditPage?.totalCount, componentId, functionId, isUnifiedLogPage, pageId, tab, traceId, tracePage?.items?.length, tracePage?.totalCount, unifiedPage?.items?.length, unifiedPage?.totalCount, unifiedTab]);

  function moveToTrace(trace: string) {
    if (isUnifiedLogPage) {
      setTraceId(trace);
      applyUnifiedTab("trace");
      return;
    }
    setTraceId(trace);
    setTab("trace");
    loadTrace({ traceId: trace }).catch((err: Error) => setError(err.message));
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: isUnifiedLogPage ? (en ? "Unified Log" : unifiedPreset.label) : (en ? "Audit Log" : "감사 로그") }
      ]}
      title={isUnifiedLogPage ? (en ? "Unified Log" : unifiedPreset.label) : (en ? "Audit Log" : "감사 로그")}
      subtitle={isUnifiedLogPage
        ? (en ? "Search access, audit, error, and trace events through one common log contract." : unifiedPreset.subtitle)
        : (en ? "Search audit logs first, then follow the related trace events." : "감사 로그를 중심으로 조회하고 필요한 경우 추적 이벤트를 이어서 확인합니다.")}
      contextStrip={
        <ContextKeyStrip items={verifyRuntimeContextKeys} />
      }
    >
      {error ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">조회 중 오류: {error}</p>
        </section>
      ) : null}

      <div className="gov-card mb-8" data-help-id="observability-filters">
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
          <MemberSectionToolbar
            actions={(
              <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {isUnifiedLogPage ? unifiedPreset.label : tab === "audit" ? "감사 로그" : "추적 이벤트"}
              </div>
            )}
            meta={isUnifiedLogPage ? "로그 유형, traceId, 페이지, 액션 기준으로 공통 로그를 좁힙니다." : "traceId와 pageId를 공통 기준으로 좁히고, 감사 로그와 추적 이벤트를 탭으로 나눠 확인합니다."}
            title="검색 조건"
          />
        </div>
        {isUnifiedLogPage ? (
          <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {UNIFIED_LOG_PRESETS.map((preset) => (
                <MemberButton
                  key={preset.pathSuffix}
                  type="button"
                  variant={unifiedPreset.pathSuffix === preset.pathSuffix ? "primary" : "secondary"}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = preset.pathSuffix;
                    }
                  }}
                >
                  {preset.label}
                </MemberButton>
              ))}
            </div>
          </div>
        ) : null}
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {isUnifiedLogPage ? (
              <>
                <MemberButton onClick={() => applyUnifiedTab("all")} type="button" variant={unifiedTab === "all" ? "primary" : "secondary"}>전체</MemberButton>
                <MemberButton onClick={() => applyUnifiedTab("access-auth")} type="button" variant={unifiedTab === "access-auth" ? "primary" : "secondary"}>접속/인증</MemberButton>
                <MemberButton onClick={() => applyUnifiedTab("audit")} type="button" variant={unifiedTab === "audit" ? "primary" : "secondary"}>감사</MemberButton>
                <MemberButton onClick={() => applyUnifiedTab("error")} type="button" variant={unifiedTab === "error" ? "primary" : "secondary"}>오류</MemberButton>
                <MemberButton onClick={() => applyUnifiedTab("trace")} type="button" variant={unifiedTab === "trace" ? "primary" : "secondary"}>추적</MemberButton>
              </>
            ) : (
              <>
                <MemberButton onClick={() => setTab("audit")} type="button" variant={tab === "audit" ? "primary" : "secondary"}>감사 로그</MemberButton>
                <MemberButton onClick={() => setTab("trace")} type="button" variant={tab === "trace" ? "primary" : "secondary"}>추적 이벤트</MemberButton>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-4" data-help-id="observability-search-panel">
          <div>
            <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">traceId</span>
            <AdminInput value={traceId} onChange={(e) => setTraceId(e.target.value)} />
          </div>
          <div>
            <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">pageId</span>
            <AdminInput value={pageId} onChange={(e) => setPageId(e.target.value)} />
          </div>
          {isUnifiedLogPage ? (
            <>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">actorId</span>
                <AdminInput value={actorId} onChange={(e) => setActorId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">actionCode</span>
                <AdminInput value={actionCode} onChange={(e) => setActionCode(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">apiId</span>
                <AdminInput value={apiId} onChange={(e) => setApiId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">event/detail</span>
                <AdminInput disabled={Boolean(unifiedPreset.detailType)} value={eventType} onChange={(e) => setEventType(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">functionId</span>
                <AdminInput value={functionId} onChange={(e) => setFunctionId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">componentId</span>
                <AdminInput value={componentId} onChange={(e) => setComponentId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">resultCode</span>
                <AdminInput value={resultCode} onChange={(e) => setResultCode(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">검색어</span>
                <AdminInput value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              </div>
            </>
          ) : tab === "audit" ? (
            <>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">actorId</span>
                <AdminInput value={actorId} onChange={(e) => setActorId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">actionCode</span>
                <AdminInput value={actionCode} onChange={(e) => setActionCode(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">apiId</span>
                <AdminInput value={apiId} onChange={(e) => setApiId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">eventType</span>
                <AdminInput value={eventType} onChange={(e) => setEventType(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">functionId</span>
                <AdminInput value={functionId} onChange={(e) => setFunctionId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">componentId</span>
                <AdminInput value={componentId} onChange={(e) => setComponentId(e.target.value)} />
              </div>
              <div>
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">resultCode</span>
                <AdminInput value={resultCode} onChange={(e) => setResultCode(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <span className="mb-2 block text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">검색어</span>
                <AdminInput value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              </div>
            </>
          )}
          <div className="md:col-span-4">
            <div className="flex flex-col gap-3 border-t border-[var(--kr-gov-border-light)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
                {isUnifiedLogPage
                  ? `${unifiedPreset.label}를 공통 컬럼으로 시간 역순 조회합니다.`
                  : tab === "audit"
                  ? "감사 로그를 시간 역순으로 보고 traceId를 눌러 관련 추적 이벤트로 이동합니다."
                  : "추적 이벤트는 페이지, 컴포넌트, API 흐름을 세부적으로 확인할 때 사용합니다."}
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <MemberButton
                  onClick={() => {
                    if (isUnifiedLogPage) {
                      loadUnified().catch((err: Error) => setError(err.message));
                    } else if (tab === "audit") {
                      loadAudit().catch((err: Error) => setError(err.message));
                    } else {
                      loadTrace().catch((err: Error) => setError(err.message));
                    }
                  }}
                  type="button"
                  variant="primary"
                >
                  {loading ? "조회 중..." : "검색"}
                </MemberButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-help-id="observability-audit-table" hidden={isUnifiedLogPage || tab !== "audit"} />
      <div data-help-id="observability-trace-table" hidden={isUnifiedLogPage || tab !== "trace"} />
      <div data-help-id="unified-log-table" hidden={!isUnifiedLogPage} />
      <div className="gov-card overflow-hidden p-0" data-help-id={isUnifiedLogPage ? "unified-log-table" : tab === "audit" ? "observability-audit-table" : "observability-trace-table"}>
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
          <MemberSectionToolbar
            meta={isUnifiedLogPage ? "공통 로그 이벤트를 시간순으로 확인합니다." : tab === "audit" ? "감사 이벤트를 시간순으로 확인합니다." : "추적 이벤트를 시간순으로 확인합니다."}
            title={(
              <span className="text-[15px] font-semibold text-[var(--kr-gov-text-primary)]">
                전체 <span className="text-[var(--kr-gov-blue)]">{Number(isUnifiedLogPage ? unifiedPage?.totalCount || 0 : tab === "audit" ? auditPage?.totalCount || 0 : tracePage?.totalCount || 0).toLocaleString()}</span>건
              </span>
            )}
          />
        </div>
        <div className="overflow-x-auto">
          <AdminTable>
            {isUnifiedLogPage ? (
              <>
                <thead>
                  <tr className="border-y border-[var(--kr-gov-border-light)] bg-gray-50 text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-6 py-4">발생 일시</th>
                    <th className="px-6 py-4">유형</th>
                    <th className="px-6 py-4">세부유형</th>
                    <th className="px-6 py-4">사용자</th>
                    <th className="px-6 py-4">페이지/기능</th>
                    <th className="px-6 py-4">대상</th>
                    <th className="px-6 py-4">결과</th>
                    <th className="px-6 py-4">traceId</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(unifiedPage?.items || []).length === 0 ? (
                    <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={8}>조회된 통합 로그가 없습니다.</td></tr>
                  ) : (unifiedPage?.items || []).map((item: UnifiedLogRow, index) => (
                    <tr className="transition-colors hover:bg-gray-50/50" key={`${String(item.logId || "unified")}-${index}`}>
                      <td className="px-6 py-4 text-gray-600">{String(item.occurredAt || "-")}</td>
                      <td className="px-6 py-4 text-[var(--kr-gov-text-primary)]">{String(item.logType || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.detailType || "-")}</td>
                      <td className="px-6 py-4 text-[var(--kr-gov-text-primary)]">{String(item.actorId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {String(item.pageId || "-")}
                        {item.functionId ? ` / ${String(item.functionId)}` : ""}
                        {item.apiId ? ` / ${String(item.apiId)}` : ""}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {String(item.targetId || item.requestUri || "-")}
                        {item.summary ? <div className="mt-1 text-xs text-slate-500">{String(item.summary)}</div> : null}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{String(item.resultCode || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.traceId ? (
                          <button className="font-semibold text-[var(--kr-gov-blue)] hover:underline" onClick={() => moveToTrace(String(item.traceId || ""))} type="button">
                            {String(item.traceId || "-")}
                          </button>
                        ) : String(item.traceId || "-")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : tab === "audit" ? (
              <>
                <thead data-help-id="audit-event-table">
                  <tr className="border-y border-[var(--kr-gov-border-light)] bg-gray-50 text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-6 py-4">발생 일시</th>
                    <th className="px-6 py-4">traceId</th>
                    <th className="px-6 py-4">사용자</th>
                    <th className="px-6 py-4">행위</th>
                    <th className="px-6 py-4">대상</th>
                    <th className="px-6 py-4">결과</th>
                    <th className="px-6 py-4">페이지</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(auditPage?.items || []).length === 0 ? (
                    <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={7}>조회된 감사 로그가 없습니다.</td></tr>
                  ) : (auditPage?.items || []).map((item, index) => (
                    <tr className="transition-colors hover:bg-gray-50/50" key={`${String(item.auditId || "audit")}-${index}`}>
                      <td className="px-6 py-4 text-gray-600">{String(item.createdAt || "-")}</td>
                      <td className="px-6 py-4">
                        <button className="font-semibold text-[var(--kr-gov-blue)] hover:underline" onClick={() => moveToTrace(String(item.traceId || ""))} type="button">
                          {String(item.traceId || "-")}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-[var(--kr-gov-text-primary)]">{String(item.actorId || "-")}</td>
                      <td className="px-6 py-4 text-[var(--kr-gov-text-primary)]">{String(item.actionCode || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.entityId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.resultStatus || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.pageId || "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead data-help-id="trace-event-table">
                  <tr className="border-y border-[var(--kr-gov-border-light)] bg-gray-50 text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-6 py-4">발생 일시</th>
                    <th className="px-6 py-4">traceId</th>
                    <th className="px-6 py-4">페이지</th>
                    <th className="px-6 py-4">컴포넌트</th>
                    <th className="px-6 py-4">함수</th>
                    <th className="px-6 py-4">API</th>
                    <th className="px-6 py-4">이벤트</th>
                    <th className="px-6 py-4">결과</th>
                    <th className="px-6 py-4">소요(ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(tracePage?.items || []).length === 0 ? (
                    <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={9}>조회된 추적 이벤트가 없습니다.</td></tr>
                  ) : (tracePage?.items || []).map((item, index) => (
                    <tr className="transition-colors hover:bg-gray-50/50" key={`${String(item.eventId || "trace")}-${index}`}>
                      <td className="px-6 py-4 text-gray-600">{String(item.createdAt || "-")}</td>
                      <td className="px-6 py-4 text-[var(--kr-gov-text-primary)]">{String(item.traceId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.pageId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.componentId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.functionId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.apiId || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.eventType || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.resultCode || "-")}</td>
                      <td className="px-6 py-4 text-gray-600">{String(item.durationMs || "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </AdminTable>
        </div>
      </div>
    </AdminPageShell>
  );
}
