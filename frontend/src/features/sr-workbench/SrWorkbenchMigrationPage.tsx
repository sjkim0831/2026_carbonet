import { useEffect, useMemo, useState } from "react";
import {
  approveSrTicket,
  createSrTicket,
  executeSrTicket,
  fetchScreenCommandPage,
  fetchSrWorkbenchPage,
  prepareSrExecution,
  ScreenCommandApi,
  ScreenCommandChangeTarget,
  ScreenCommandEvent,
  ScreenCommandPagePayload,
  ScreenCommandSchema,
  ScreenCommandSurface,
  SrTicketRow,
  SrWorkbenchPagePayload
} from "../../lib/api/client";

function buildDirectionPreview(params: {
  pageLabel: string;
  routePath: string;
  surface?: ScreenCommandSurface;
  event?: ScreenCommandEvent;
  api?: ScreenCommandApi;
  target?: ScreenCommandChangeTarget;
  schema?: ScreenCommandSchema;
  summary: string;
  instruction: string;
}) {
  const lines = [
    `[SR 요약] ${params.summary || "요약 없음"}`,
    `대상 화면: ${params.pageLabel} (${params.routePath})`,
    `대상 요소: ${params.surface ? `${params.surface.label} [${params.surface.selector}]` : "미선택"}`,
    `이벤트: ${params.event ? `${params.event.label} / ${params.event.frontendFunction}` : "미선택"}`,
    `API: ${params.api ? `${params.api.method} ${params.api.endpoint}` : "미선택"}`,
    `백엔드: ${params.api ? `${params.api.controllerAction} -> ${params.api.serviceMethod} -> ${params.api.mapperQuery}` : "미선택"}`,
    `스키마: ${params.schema ? `${params.schema.tableName} (${params.schema.columns.join(", ")})` : "미선택"}`,
    `수정 레이어: ${params.target ? `${params.target.label} [${params.target.editableFields.join(", ")}]` : "미선택"}`,
    `실행 지시: ${params.instruction || "구체 지시 필요"}`
  ];
  return lines.join("\n");
}

function buildCommandPrompt(params: {
  pageId: string;
  pageLabel: string;
  routePath: string;
  summary: string;
  direction: string;
  menuCode: string;
  menuLookupUrl: string;
}) {
  return [
    `Carbonet SR ticket`,
    `pageId=${params.pageId}`,
    `page=${params.pageLabel}`,
    `route=${params.routePath}`,
    `menuCode=${params.menuCode || "-"}`,
    `menuUrl=${params.menuLookupUrl || "-"}`,
    `summary=${params.summary || "-"}`,
    `direction=`,
    params.direction
  ].join("\n");
}

export function SrWorkbenchMigrationPage() {
  const [selectedPageId, setSelectedPageId] = useState("member-list");
  const [workbench, setWorkbench] = useState<SrWorkbenchPagePayload | null>(null);
  const [commandPage, setCommandPage] = useState<ScreenCommandPagePayload | null>(null);
  const [surfaceId, setSurfaceId] = useState("");
  const [eventId, setEventId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [summary, setSummary] = useState("");
  const [instruction, setInstruction] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [generatedDirection, setGeneratedDirection] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(pageId: string) {
    setLoading(true);
    setError("");
    try {
      const [nextWorkbench, nextCommandPage] = await Promise.all([
        fetchSrWorkbenchPage(pageId),
        fetchScreenCommandPage(pageId)
      ]);
      setWorkbench(nextWorkbench);
      setCommandPage(nextCommandPage);
      setSelectedPageId(nextCommandPage.selectedPageId || pageId);
      setSurfaceId(nextCommandPage.page?.surfaces?.[0]?.surfaceId || "");
      setEventId("");
      setTargetId(nextCommandPage.page?.changeTargets?.[0]?.targetId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "SR 워크벤치를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("member-list").catch(() => undefined);
  }, []);

  const page = commandPage?.page;
  const selectedSurface = useMemo(
    () => page?.surfaces?.find((item) => item.surfaceId === surfaceId) || page?.surfaces?.[0],
    [page, surfaceId]
  );
  const availableEvents = useMemo(() => {
    if (!page) {
      return [];
    }
    if (!selectedSurface?.eventIds?.length) {
      return page.events || [];
    }
    const ids = new Set(selectedSurface.eventIds);
    return page.events.filter((item) => ids.has(item.eventId));
  }, [page, selectedSurface]);
  const selectedEvent = useMemo(
    () => availableEvents.find((item) => item.eventId === eventId) || availableEvents[0],
    [availableEvents, eventId]
  );
  const selectedApi = useMemo(() => {
    if (!page) {
      return undefined;
    }
    const ids = new Set(selectedEvent?.apiIds || []);
    return page.apis.find((item) => ids.has(item.apiId)) || page.apis?.[0];
  }, [page, selectedEvent]);
  const selectedSchema = useMemo(() => {
    if (!page) {
      return undefined;
    }
    const schemaId = selectedApi?.schemaIds?.[0];
    return page.schemas.find((item) => item.schemaId === schemaId) || page.schemas?.[0];
  }, [page, selectedApi]);
  const selectedTarget = useMemo(
    () => page?.changeTargets?.find((item) => item.targetId === targetId) || page?.changeTargets?.[0],
    [page, targetId]
  );
  const preview = useMemo(() => buildDirectionPreview({
    pageLabel: page?.label || "-",
    routePath: page?.routePath || "-",
    surface: selectedSurface,
    event: selectedEvent,
    api: selectedApi,
    target: selectedTarget,
    schema: selectedSchema,
    summary,
    instruction
  }), [instruction, page, selectedApi, selectedEvent, selectedSchema, selectedSurface, selectedTarget, summary]);
  const commandPrompt = useMemo(() => buildCommandPrompt({
    pageId: page?.pageId || "-",
    pageLabel: page?.label || "-",
    routePath: page?.routePath || "-",
    summary,
    direction: generatedDirection || preview,
    menuCode: page?.menuCode || "",
    menuLookupUrl: page?.menuLookupUrl || ""
  }), [generatedDirection, page, preview, summary]);

  async function refreshTickets() {
    const next = await fetchSrWorkbenchPage(selectedPageId);
    setWorkbench(next);
  }

  function handleGenerate() {
    setGeneratedDirection(preview);
  }

  async function handleCreateTicket() {
    setError("");
    setMessage("");
    try {
      const response = await createSrTicket({
        pageId: page?.pageId || "",
        pageLabel: page?.label || "",
        routePath: page?.routePath || "",
        menuCode: page?.menuCode || "",
        menuLookupUrl: page?.menuLookupUrl || "",
        surfaceId: selectedSurface?.surfaceId || "",
        surfaceLabel: selectedSurface?.label || "",
        eventId: selectedEvent?.eventId || "",
        eventLabel: selectedEvent?.label || "",
        targetId: selectedTarget?.targetId || "",
        targetLabel: selectedTarget?.label || "",
        summary,
        instruction,
        generatedDirection: generatedDirection || preview,
        commandPrompt
      });
      setMessage(response.message);
      setSummary("");
      setInstruction("");
      setGeneratedDirection("");
      await refreshTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "SR 티켓 발행 중 오류가 발생했습니다.");
    }
  }

  async function handleApprove(ticketId: string, decision: "APPROVE" | "REJECT") {
    setError("");
    setMessage("");
    try {
      const response = await approveSrTicket(ticketId, decision, approvalComment);
      setMessage(response.message);
      setApprovalComment("");
      await refreshTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "승인 처리 중 오류가 발생했습니다.");
    }
  }

  async function handlePrepareExecution(ticketId: string) {
    setError("");
    setMessage("");
    try {
      const response = await prepareSrExecution(ticketId);
      setMessage(response.message);
      await refreshTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "실행 준비 처리 중 오류가 발생했습니다.");
    }
  }

  async function handleExecute(ticketId: string) {
    setError("");
    setMessage("");
    try {
      const response = await executeSrTicket(ticketId);
      setMessage(response.message);
      await refreshTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Codex runner 실행 중 오류가 발생했습니다.");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet SR Workbench</p>
        <h1>SR 요청 / 승인 / Codex 실행 준비</h1>
        <p className="route-path">화면 요소 기반 SR 티켓을 발행하고, 해결 지시를 생성한 뒤 승인과 Codex 실행 준비까지 한 화면에서 관리합니다.</p>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}

      <section className="panel" data-help-id="sr-ticket-draft">
        <div className="section-head">
          <div>
            <p className="caption">SR Ticket Draft</p>
            <h2>{page?.label || "SR 발행"}</h2>
          </div>
          <div className="toolbar-actions">
            <button className="primary-button" disabled={loading} onClick={() => load(selectedPageId).catch(() => undefined)} type="button">
              {loading ? "불러오는 중..." : "대상 화면 불러오기"}
            </button>
          </div>
        </div>
        <div className="toolbar">
          <label className="field field-wide">
            <span>대상 화면</span>
            <select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)}>
              {(workbench?.screenOptions || []).map((item) => (
                <option key={item.pageId} value={item.pageId}>
                  {item.label} ({item.routePath})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="create-grid help-editor-grid">
          <label className="field">
            <span>요소</span>
            <select value={selectedSurface?.surfaceId || ""} onChange={(event) => setSurfaceId(event.target.value)}>
              {(page?.surfaces || []).map((item) => (
                <option key={item.surfaceId} value={item.surfaceId}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>이벤트</span>
            <select value={selectedEvent?.eventId || ""} onChange={(event) => setEventId(event.target.value)}>
              {availableEvents.map((item) => (
                <option key={item.eventId} value={item.eventId}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>수정 레이어</span>
            <select value={selectedTarget?.targetId || ""} onChange={(event) => setTargetId(event.target.value)}>
              {(page?.changeTargets || []).map((item) => (
                <option key={item.targetId} value={item.targetId}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="field field-wide">
            <span>SR 요약</span>
            <input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="예: 회원 상세 화면 상태배지 색상과 권한 노출 조건 불일치" />
          </label>
          <label className="field field-wide">
            <span>상세 지시</span>
            <textarea
              rows={4}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="예: 반려 상태일 때만 관리자 재검토 버튼이 보이도록 UI, 이벤트, API 응답 필드, 권한 영향도를 함께 검토"
            />
          </label>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-button" onClick={handleGenerate} type="button">해결 지시 생성</button>
          <button className="primary-button" onClick={() => handleCreateTicket().catch(() => undefined)} type="button">SR 티켓 발행</button>
        </div>
      </section>

      <section className="panel" data-help-id="sr-direction-preview">
        <div className="command-grid">
          <article className="command-card">
            <p className="caption">API / Controller</p>
            <h3>{selectedApi ? `${selectedApi.method} ${selectedApi.endpoint}` : "-"}</h3>
            <p className="route-path">{selectedApi?.controllerAction || "-"}</p>
            <p className="state-text">{selectedApi?.serviceMethod || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">Schema</p>
            <h3>{selectedSchema?.tableName || "-"}</h3>
            <p className="route-path">{selectedApi?.mapperQuery || "-"}</p>
            <p className="state-text">{selectedSchema?.notes || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">권한</p>
            <h3>{page?.menuPermission?.requiredViewFeatureCode || "-"}</h3>
            <p className="state-text">{(page?.menuPermission?.featureCodes || []).join(", ") || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">Codex 상태</p>
            <h3>{workbench?.codexEnabled ? "ENABLED" : "DISABLED"}</h3>
            <p className="state-text">{workbench?.codexHistoryFile || "-"}</p>
          </article>
        </div>
      </section>

      <section className="panel" data-help-id="sr-ticket-table">
        <div className="section-head">
          <div>
            <p className="caption">Generated Direction</p>
            <h2>승인 전 해결 지시</h2>
          </div>
        </div>
        <label className="field field-wide">
          <span>Direction</span>
          <textarea rows={9} readOnly value={generatedDirection || preview} />
        </label>
        <label className="field field-wide">
          <span>Codex Command Prompt</span>
          <textarea rows={9} readOnly value={commandPrompt} />
        </label>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="caption">Approval / Execution</p>
            <h2>SR 티켓 {workbench?.ticketCount || 0}건</h2>
          </div>
        </div>
        <label className="field field-wide">
          <span>승인 코멘트</span>
          <input value={approvalComment} onChange={(event) => setApprovalComment(event.target.value)} placeholder="승인/반려 사유를 남깁니다." />
        </label>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ticketId</th>
                <th>status</th>
                <th>page</th>
                <th>summary</th>
                <th>execution</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {(workbench?.tickets || []).length === 0 ? (
                <tr><td colSpan={6}>등록된 SR 티켓이 없습니다.</td></tr>
              ) : (workbench?.tickets || []).map((ticket: SrTicketRow) => (
                <tr key={ticket.ticketId}>
                  <td>{ticket.ticketId}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.pageLabel || ticket.pageId}</td>
                  <td>
                    <strong>{ticket.summary}</strong>
                    <div className="state-text">{ticket.surfaceLabel} / {ticket.eventLabel} / {ticket.targetLabel}</div>
                  </td>
                  <td>
                    <div>{ticket.executionStatus}</div>
                    <div className="state-text">{ticket.executionComment || "-"}</div>
                    {ticket.executionRunId ? <div className="state-text">runId: {ticket.executionRunId}</div> : null}
                    {ticket.executionCompletedAt ? <div className="state-text">completed: {ticket.executionCompletedAt}</div> : null}
                    {ticket.executionChangedFiles ? <div className="state-text">changed: {ticket.executionChangedFiles}</div> : null}
                  </td>
                  <td>
                    <div className="toolbar-actions">
                      <button className="secondary-button" onClick={() => handleApprove(ticket.ticketId, "APPROVE").catch(() => undefined)} type="button">승인</button>
                      <button className="secondary-button" onClick={() => handleApprove(ticket.ticketId, "REJECT").catch(() => undefined)} type="button">반려</button>
                      <button className="primary-button" onClick={() => handlePrepareExecution(ticket.ticketId).catch(() => undefined)} type="button">실행 준비</button>
                      <button className="primary-button" onClick={() => handleExecute(ticket.ticketId).catch(() => undefined)} type="button">Codex 실행</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
