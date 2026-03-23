import { useEffect, useState } from "react";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { verifyRuntimeContextKeys } from "../admin-ui/contextKeyPresets";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import type { AuditEventSearchPayload, TraceEventSearchPayload } from "../../lib/api/client";
import { fetchAuditEvents, fetchTraceEvents } from "../../lib/api/observability";
import { AdminInput, AdminTable, MemberButton, MemberSectionToolbar } from "../member/common";

type ObservabilityTab = "audit" | "trace";

export function ObservabilityMigrationPage() {
  const en = isEnglish();
  const [tab, setTab] = useState<ObservabilityTab>("audit");
  const [auditPage, setAuditPage] = useState<AuditEventSearchPayload | null>(null);
  const [tracePage, setTracePage] = useState<TraceEventSearchPayload | null>(null);
  const [traceId, setTraceId] = useState("");
  const [actorId, setActorId] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [pageId, setPageId] = useState("");
  const [componentId, setComponentId] = useState("");
  const [functionId, setFunctionId] = useState("");
  const [apiId, setApiId] = useState("");
  const [eventType, setEventType] = useState("");
  const [resultCode, setResultCode] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAudit(next?: { traceId?: string; actorId?: string; actionCode?: string; pageId?: string; }) {
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

  useEffect(() => {
    Promise.all([loadAudit(), loadTrace()]).catch((err: Error) => setError(err.message));
  }, []);

  function moveToTrace(trace: string) {
    setTraceId(trace);
    setTab("trace");
    loadTrace({ traceId: trace }).catch((err: Error) => setError(err.message));
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Audit Log" : "감사 로그" }
      ]}
      title={en ? "Audit Log" : "감사 로그"}
      subtitle={en ? "Search audit logs first, then follow the related trace events." : "감사 로그를 중심으로 조회하고 필요한 경우 추적 이벤트를 이어서 확인합니다."}
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
                {tab === "audit" ? "감사 로그" : "추적 이벤트"}
              </div>
            )}
            meta="traceId와 pageId를 공통 기준으로 좁히고, 감사 로그와 추적 이벤트를 탭으로 나눠 확인합니다."
            title="검색 조건"
          />
        </div>
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <MemberButton onClick={() => setTab("audit")} type="button" variant={tab === "audit" ? "primary" : "secondary"}>감사 로그</MemberButton>
            <MemberButton onClick={() => setTab("trace")} type="button" variant={tab === "trace" ? "primary" : "secondary"}>추적 이벤트</MemberButton>
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
          {tab === "audit" ? (
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
                {tab === "audit"
                  ? "감사 로그를 시간 역순으로 보고 traceId를 눌러 관련 추적 이벤트로 이동합니다."
                  : "추적 이벤트는 페이지, 컴포넌트, API 흐름을 세부적으로 확인할 때 사용합니다."}
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <MemberButton
                  onClick={() => {
                    if (tab === "audit") {
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

      <div className="gov-card overflow-hidden p-0" data-help-id={tab === "audit" ? "observability-audit-table" : "observability-trace-table"}>
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
          <MemberSectionToolbar
            meta={tab === "audit" ? "감사 이벤트를 시간순으로 확인합니다." : "추적 이벤트를 시간순으로 확인합니다."}
            title={(
              <span className="text-[15px] font-semibold text-[var(--kr-gov-text-primary)]">
                전체 <span className="text-[var(--kr-gov-blue)]">{Number(tab === "audit" ? auditPage?.totalCount || 0 : tracePage?.totalCount || 0).toLocaleString()}</span>건
              </span>
            )}
          />
        </div>
        <div className="overflow-x-auto">
          <AdminTable>
            {tab === "audit" ? (
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
