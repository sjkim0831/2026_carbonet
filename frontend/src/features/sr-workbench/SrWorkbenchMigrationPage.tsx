import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
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
    "Carbonet SR ticket",
    `pageId=${params.pageId}`,
    `page=${params.pageLabel}`,
    `route=${params.routePath}`,
    `menuCode=${params.menuCode || "-"}`,
    `menuUrl=${params.menuLookupUrl || "-"}`,
    `summary=${params.summary || "-"}`,
    "direction=",
    params.direction
  ].join("\n");
}

function statusBadgeClass(status: string) {
  switch ((status || "").toUpperCase()) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-rose-100 text-rose-700";
    case "PREPARED":
      return "bg-amber-100 text-amber-700";
    case "EXECUTED":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function executionBadgeClass(status: string) {
  switch ((status || "").toUpperCase()) {
    case "DONE":
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "READY":
    case "PREPARED":
      return "bg-blue-100 text-blue-700";
    case "FAILED":
      return "bg-rose-100 text-rose-700";
    case "RUNNING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function SrWorkbenchMigrationPage() {
  const en = typeof window !== "undefined" && window.location.pathname.startsWith("/en/");
  const [selectedPageId, setSelectedPageId] = useState("member-list");
  
  const workbenchState = useAsyncValue<SrWorkbenchPagePayload>(() => fetchSrWorkbenchPage(selectedPageId), [selectedPageId], {
    initialValue: null
  });
  
  const commandPageState = useAsyncValue<ScreenCommandPagePayload>(() => fetchScreenCommandPage(selectedPageId), [selectedPageId], {
    initialValue: null,
    onSuccess(payload) {
      setSelectedPageId(prev => payload.selectedPageId || prev);
    }
  });
  
  const [surfaceId, setSurfaceId] = useState("");
  const [eventId, setEventId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [summary, setSummary] = useState("");
  const [instruction, setInstruction] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [generatedDirection, setGeneratedDirection] = useState("");
  const [errorMessage, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const error = errorMessage || workbenchState.error || commandPageState.error;
  const loading = workbenchState.loading || commandPageState.loading;
  
  const workbench = workbenchState.value;
  const commandPage = commandPageState.value;
  
  useEffect(() => {
    if (commandPage?.page?.surfaces?.length && !surfaceId) {
      setSurfaceId(commandPage.page.surfaces[0].surfaceId || "");
    }
    if (commandPage?.page?.changeTargets?.length && !targetId) {
      setTargetId(commandPage.page.changeTargets[0].targetId || "");
    }
  }, [commandPage, surfaceId, targetId]);

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
    await workbenchState.reload();
  }

  async function reloadPage() {
    await Promise.all([
      workbenchState.reload(),
      commandPageState.reload()
    ]);
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
      setError(err instanceof Error ? err.message : (en ? "Failed to create SR ticket." : "SR 티켓 발행 중 오류가 발생했습니다."));
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
      setError(err instanceof Error ? err.message : (en ? "Failed to update approval." : "승인 처리 중 오류가 발생했습니다."));
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
      setError(err instanceof Error ? err.message : (en ? "Failed to prepare execution." : "실행 준비 처리 중 오류가 발생했습니다."));
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
      setError(err instanceof Error ? err.message : (en ? "Failed to execute Codex runner." : "Codex runner 실행 중 오류가 발생했습니다."));
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
              {en ? "Automation Operations" : "운영자동화"}
            </p>
            <h3 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">
              {en ? "Integrated SR approval and execution workspace" : "통합 SR 승인 및 실행 작업공간"}
            </h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en
                ? "Keep screen metadata, authority review, approval, and Codex execution in the same operator flow."
                : "화면 메타데이터, 권한 검토, 승인, Codex 실행을 한 흐름 안에서 이어서 처리합니다."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm text-[var(--kr-gov-text-secondary)] md:grid-cols-2">
            <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="font-bold text-[var(--kr-gov-blue)]">{en ? "Current route" : "현재 라우트"}</p>
              <p className="mt-1 break-all">{page?.routePath || "/admin/system/sr-workbench"}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Ticket lifecycle" : "티켓 처리 흐름"}</p>
              <p className="mt-1">{en ? "Draft -> Approval -> Prepare -> Execute" : "초안 -> 승인 -> 준비 -> 실행"}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {message ? (
        <section className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <article className="gov-card border-l-4 border-l-[var(--kr-gov-blue)]">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Target Screen" : "대상 화면"}</p>
          <p className="mt-3 text-2xl font-black text-[var(--kr-gov-text-primary)]">{page?.label || "-"}</p>
          <p className="mt-2 text-xs text-gray-500">{page?.routePath || "-"}</p>
        </article>
        <article className="gov-card border-l-4 border-l-[var(--kr-gov-green)]">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Open Tickets" : "진행 티켓"}</p>
          <p className="mt-3 text-2xl font-black text-[var(--kr-gov-text-primary)]">{workbench?.ticketCount || 0}</p>
          <p className="mt-2 text-xs text-gray-500">{en ? "Approval and execution queue" : "승인 및 실행 대기열"}</p>
        </article>
        <article className="gov-card border-l-4 border-l-amber-500">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "View Feature" : "조회 권한"}</p>
          <p className="mt-3 text-lg font-black text-[var(--kr-gov-text-primary)] break-all">{page?.menuPermission?.requiredViewFeatureCode || "-"}</p>
          <p className="mt-2 text-xs text-gray-500">{(page?.menuPermission?.featureCodes || []).join(", ") || "-"}</p>
        </article>
        <article className="gov-card border-l-4 border-l-slate-500">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Codex Status" : "Codex 상태"}</p>
          <p className="mt-3 text-2xl font-black text-[var(--kr-gov-text-primary)]">{workbench?.codexEnabled ? "ENABLED" : "DISABLED"}</p>
          <p className="mt-2 text-xs text-gray-500 break-all">{workbench?.codexHistoryFile || "-"}</p>
        </article>
      </section>

      <section className="gov-card">
        <div className="mb-6 flex flex-col gap-2 border-b border-[var(--kr-gov-border-light)] pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "SR Draft" : "SR 초안 작성"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en ? "Select a screen surface and generate an actionable SR direction." : "화면 요소를 선택하고 실행 가능한 SR 지시를 생성합니다."}
            </p>
          </div>
          <button
            className="gov-btn gov-btn-secondary"
            disabled={loading}
            onClick={() => reloadPage().catch(() => undefined)}
            type="button"
          >
            {loading ? (en ? "Loading..." : "불러오는 중...") : (en ? "Reload Screen" : "대상 화면 불러오기")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="gov-label">{en ? "Target Screen" : "대상 화면"}</span>
            <select className="gov-select" value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)}>
              {(workbench?.screenOptions || []).map((item) => (
                <option key={item.pageId} value={item.pageId}>
                  {item.label} ({item.routePath})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="gov-label">{en ? "Surface" : "요소"}</span>
            <select className="gov-select" value={selectedSurface?.surfaceId || ""} onChange={(event) => setSurfaceId(event.target.value)}>
              {(page?.surfaces || []).map((item) => (
                <option key={item.surfaceId} value={item.surfaceId}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="gov-label">{en ? "Event" : "이벤트"}</span>
            <select className="gov-select" value={selectedEvent?.eventId || ""} onChange={(event) => setEventId(event.target.value)}>
              {availableEvents.map((item) => (
                <option key={item.eventId} value={item.eventId}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="gov-label">{en ? "Change Layer" : "수정 레이어"}</span>
            <select className="gov-select" value={selectedTarget?.targetId || ""} onChange={(event) => setTargetId(event.target.value)}>
              {(page?.changeTargets || []).map((item) => (
                <option key={item.targetId} value={item.targetId}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <label className="block">
            <span className="gov-label">{en ? "SR Summary" : "SR 요약"}</span>
            <input
              className="gov-input"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder={en ? "Example: mismatch between badge color and authority exposure on member detail screen" : "예: 회원 상세 화면 상태배지 색상과 권한 노출 조건 불일치"}
            />
          </label>
          <label className="block">
            <span className="gov-label">{en ? "Instruction" : "상세 지시"}</span>
            <textarea
              className="gov-input min-h-[120px] py-3"
              rows={4}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder={en ? "Describe the UI, event, API, and authority impact that must be reviewed together." : "UI, 이벤트, API, 권한 영향도를 함께 검토해야 하는 내용을 적어주세요."}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="gov-btn gov-btn-outline-blue" onClick={handleGenerate} type="button">
            {en ? "Generate Direction" : "해결 지시 생성"}
          </button>
          <button className="gov-btn gov-btn-primary" onClick={() => handleCreateTicket().catch(() => undefined)} type="button">
            {en ? "Create Ticket" : "SR 티켓 발행"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="gov-card">
          <div className="mb-4 border-b border-[var(--kr-gov-border-light)] pb-4">
            <h3 className="text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "Execution Context" : "실행 컨텍스트"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en ? "Review API, schema, and permission metadata before approval." : "승인 전에 API, 스키마, 권한 메타데이터를 검토합니다."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">API / Controller</p>
              <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedApi ? `${selectedApi.method} ${selectedApi.endpoint}` : "-"}</p>
              <p className="mt-2 text-xs text-gray-500 break-all">{selectedApi?.controllerAction || "-"}</p>
              <p className="mt-1 text-xs text-gray-500 break-all">{selectedApi?.serviceMethod || "-"}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Schema</p>
              <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedSchema?.tableName || "-"}</p>
              <p className="mt-2 text-xs text-gray-500 break-all">{selectedApi?.mapperQuery || "-"}</p>
              <p className="mt-1 text-xs text-gray-500">{selectedSchema?.notes || "-"}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Surface" : "선택 요소"}</p>
              <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedSurface?.label || "-"}</p>
              <p className="mt-2 text-xs text-gray-500 break-all">{selectedSurface?.selector || "-"}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Event / Target" : "이벤트 / 타깃"}</p>
              <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedEvent?.label || "-"}</p>
              <p className="mt-2 text-xs text-gray-500">{selectedTarget?.label || "-"}</p>
            </div>
          </div>
        </article>

        <article className="gov-card">
          <div className="mb-4 border-b border-[var(--kr-gov-border-light)] pb-4">
            <h3 className="text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "Generated Direction" : "생성된 해결 지시"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en ? "Use the generated SR direction and Codex prompt for approval and execution." : "생성된 SR 지시와 Codex 프롬프트를 승인 및 실행에 사용합니다."}
            </p>
          </div>
          <label className="block">
            <span className="gov-label">{en ? "Direction" : "Direction"}</span>
            <textarea className="gov-input min-h-[220px] py-3 font-mono text-[12px]" readOnly rows={10} value={generatedDirection || preview} />
          </label>
          <label className="mt-4 block">
            <span className="gov-label">{en ? "Codex Command Prompt" : "Codex Command Prompt"}</span>
            <textarea className="gov-input min-h-[220px] py-3 font-mono text-[12px]" readOnly rows={10} value={commandPrompt} />
          </label>
        </article>
      </section>

      <section className="gov-card">
        <div className="mb-6 flex flex-col gap-2 border-b border-[var(--kr-gov-border-light)] pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "Ticket Queue" : "티켓 대기열"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en ? "Handle approval, preparation, and execution from the same queue." : "승인, 실행 준비, 실행을 같은 대기열에서 처리합니다."}
            </p>
          </div>
          <div className="text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "Total" : "전체"} <span className="font-bold text-[var(--kr-gov-blue)]">{workbench?.ticketCount || 0}</span>{en ? " tickets" : "건"}
          </div>
        </div>

        <label className="mb-6 block">
          <span className="gov-label">{en ? "Approval Comment" : "승인 코멘트"}</span>
          <input
            className="gov-input"
            value={approvalComment}
            onChange={(event) => setApprovalComment(event.target.value)}
            placeholder={en ? "Leave a reason for approval or rejection." : "승인/반려 사유를 남깁니다."}
          />
        </label>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="gov-table-header">
                <th className="px-5 py-4">ticketId</th>
                <th className="px-5 py-4">{en ? "Status" : "상태"}</th>
                <th className="px-5 py-4">{en ? "Page / Summary" : "페이지 / 요약"}</th>
                <th className="px-5 py-4">{en ? "Execution" : "실행"}</th>
                <th className="px-5 py-4 text-center">{en ? "Actions" : "처리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(workbench?.tickets || []).length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-gray-500" colSpan={5}>
                    {en ? "No SR tickets have been created yet." : "등록된 SR 티켓이 없습니다."}
                  </td>
                </tr>
              ) : (workbench?.tickets || []).map((ticket: SrTicketRow) => (
                <tr key={ticket.ticketId} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4 align-top font-mono text-xs text-[var(--kr-gov-text-primary)]">{ticket.ticketId}</td>
                  <td className="px-5 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-bold text-[var(--kr-gov-text-primary)]">{ticket.pageLabel || ticket.pageId}</p>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-primary)]">{ticket.summary || "-"}</p>
                    <p className="mt-2 text-xs text-gray-500">{ticket.surfaceLabel} / {ticket.eventLabel} / {ticket.targetLabel}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${executionBadgeClass(ticket.executionStatus)}`}>
                      {ticket.executionStatus || "-"}
                    </span>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <p>{ticket.executionComment || "-"}</p>
                      {ticket.executionRunId ? <p>runId: {ticket.executionRunId}</p> : null}
                      {ticket.executionCompletedAt ? <p>completed: {ticket.executionCompletedAt}</p> : null}
                      {ticket.executionChangedFiles ? <p>changed: {ticket.executionChangedFiles}</p> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button className="gov-btn gov-btn-secondary !h-[38px] !px-4 !text-[13px]" onClick={() => handleApprove(ticket.ticketId, "APPROVE").catch(() => undefined)} type="button">
                        {en ? "Approve" : "승인"}
                      </button>
                      <button className="gov-btn gov-btn-outline !h-[38px] !px-4 !text-[13px]" onClick={() => handleApprove(ticket.ticketId, "REJECT").catch(() => undefined)} type="button">
                        {en ? "Reject" : "반려"}
                      </button>
                      <button className="gov-btn gov-btn-outline-blue !h-[38px] !px-4 !text-[13px]" onClick={() => handlePrepareExecution(ticket.ticketId).catch(() => undefined)} type="button">
                        {en ? "Prepare" : "실행 준비"}
                      </button>
                      <button className="gov-btn gov-btn-primary !h-[38px] !px-4 !text-[13px]" onClick={() => handleExecute(ticket.ticketId).catch(() => undefined)} type="button">
                        {en ? "Execute" : "Codex 실행"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
