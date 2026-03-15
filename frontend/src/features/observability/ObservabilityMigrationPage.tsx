import { useEffect, useState } from "react";
import { fetchAuditEvents, fetchTraceEvents, AuditEventSearchPayload, TraceEventSearchPayload } from "../../lib/api/client";

type ObservabilityTab = "audit" | "trace";

export function ObservabilityMigrationPage() {
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

  async function loadAudit(next?: { traceId?: string; actorId?: string; actionCode?: string; pageId?: string; }) {
    const payload = await fetchAuditEvents({
      pageIndex: 1,
      pageSize: 20,
      traceId: next?.traceId ?? traceId,
      actorId: next?.actorId ?? actorId,
      actionCode: next?.actionCode ?? actionCode,
      pageId: next?.pageId ?? pageId
    });
    setAuditPage(payload);
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
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet Observability</p>
        <h1>감사 로그 / 추적 이벤트 조회</h1>
        <p className="route-path">traceId, actorId, actionCode, apiId 기준으로 운영 로그를 조회합니다.</p>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}

      <section className="panel">
        <div className="migration-tabs">
          <button className={`tab-button${tab === "audit" ? " active" : ""}`} onClick={() => setTab("audit")} type="button">Audit</button>
          <button className={`tab-button${tab === "trace" ? " active" : ""}`} onClick={() => setTab("trace")} type="button">Trace</button>
        </div>

        <div className="toolbar" data-help-id="observability-filters">
          <div className="contents" data-help-id="observability-search-panel" />
          <label className="field">
            <span>traceId</span>
            <input value={traceId} onChange={(e) => setTraceId(e.target.value)} />
          </label>
          <label className="field">
            <span>pageId</span>
            <input value={pageId} onChange={(e) => setPageId(e.target.value)} />
          </label>
          {tab === "audit" ? (
            <>
              <label className="field">
                <span>actorId</span>
                <input value={actorId} onChange={(e) => setActorId(e.target.value)} />
              </label>
              <label className="field">
                <span>actionCode</span>
                <input value={actionCode} onChange={(e) => setActionCode(e.target.value)} />
              </label>
              <button className="primary-button" onClick={() => loadAudit().catch((err: Error) => setError(err.message))} type="button">감사 조회</button>
            </>
          ) : (
            <>
              <label className="field">
                <span>componentId</span>
                <input value={componentId} onChange={(e) => setComponentId(e.target.value)} />
              </label>
              <label className="field">
                <span>functionId</span>
                <input value={functionId} onChange={(e) => setFunctionId(e.target.value)} />
              </label>
              <label className="field">
                <span>apiId</span>
                <input value={apiId} onChange={(e) => setApiId(e.target.value)} />
              </label>
              <label className="field">
                <span>eventType</span>
                <input value={eventType} onChange={(e) => setEventType(e.target.value)} />
              </label>
              <label className="field">
                <span>resultCode</span>
                <input value={resultCode} onChange={(e) => setResultCode(e.target.value)} />
              </label>
              <label className="field">
                <span>search</span>
                <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              </label>
              <button className="primary-button" onClick={() => loadTrace().catch((err: Error) => setError(err.message))} type="button">추적 조회</button>
            </>
          )}
        </div>
      </section>

      {tab === "audit" ? (
        <section className="panel" data-help-id="observability-audit-table">
          <div data-help-id="audit-event-table" />
          <div className="section-head">
            <div>
              <p className="caption">Audit Events</p>
              <h2>총 {auditPage?.totalCount || 0}건</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>createdAt</th>
                  <th>traceId</th>
                  <th>actorId</th>
                  <th>actionCode</th>
                  <th>entityId</th>
                  <th>result</th>
                  <th>pageId</th>
                </tr>
              </thead>
              <tbody>
                {(auditPage?.items || []).length === 0 ? (
                  <tr><td colSpan={7}>데이터가 없습니다.</td></tr>
                ) : (auditPage?.items || []).map((item, index) => (
                  <tr key={`${String(item.auditId || "audit")}-${index}`}>
                    <td>{String(item.createdAt || "-")}</td>
                    <td>
                      <button className="text-button" onClick={() => moveToTrace(String(item.traceId || ""))} type="button">
                        {String(item.traceId || "-")}
                      </button>
                    </td>
                    <td>{String(item.actorId || "-")}</td>
                    <td>{String(item.actionCode || "-")}</td>
                    <td>{String(item.entityId || "-")}</td>
                    <td>{String(item.resultStatus || "-")}</td>
                    <td>{String(item.pageId || "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel" data-help-id="observability-trace-table">
          <div data-help-id="trace-event-table" />
          <div className="section-head">
            <div>
              <p className="caption">Trace Events</p>
              <h2>총 {tracePage?.totalCount || 0}건</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>createdAt</th>
                  <th>traceId</th>
                  <th>pageId</th>
                  <th>componentId</th>
                  <th>functionId</th>
                  <th>apiId</th>
                  <th>eventType</th>
                  <th>resultCode</th>
                  <th>durationMs</th>
                </tr>
              </thead>
              <tbody>
                {(tracePage?.items || []).length === 0 ? (
                  <tr><td colSpan={9}>데이터가 없습니다.</td></tr>
                ) : (tracePage?.items || []).map((item, index) => (
                  <tr key={`${String(item.eventId || "trace")}-${index}`}>
                    <td>{String(item.createdAt || "-")}</td>
                    <td>{String(item.traceId || "-")}</td>
                    <td>{String(item.pageId || "-")}</td>
                    <td>{String(item.componentId || "-")}</td>
                    <td>{String(item.functionId || "-")}</td>
                    <td>{String(item.apiId || "-")}</td>
                    <td>{String(item.eventType || "-")}</td>
                    <td>{String(item.resultCode || "-")}</td>
                    <td>{String(item.durationMs || "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
