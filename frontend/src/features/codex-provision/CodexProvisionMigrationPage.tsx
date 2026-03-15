import { useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  type CodexHistoryPayload,
  executeCodexProvision,
  fetchCodexHistory,
  fetchCodexProvisionPage,
  inspectCodexHistory,
  remediateCodexHistory,
  runCodexLoginCheck,
  type CodexProvisionPagePayload
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

function numberOrDash(value: unknown) {
  return value == null || value === "" ? "-" : String(value);
}

function boolOf(value: unknown) {
  return value === true;
}

export function CodexProvisionMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<CodexProvisionPagePayload>(fetchCodexProvisionPage, []);
  const historyState = useAsyncValue<CodexHistoryPayload>(fetchCodexHistory, []);
  const [payload, setPayload] = useState("");
  const [responseText, setResponseText] = useState(en ? "No execution result yet." : "아직 호출 결과가 없습니다.");
  const [httpStatus, setHttpStatus] = useState("-");
  const [createdCount, setCreatedCount] = useState("-");
  const [existingCount, setExistingCount] = useState("-");
  const [skippedCount, setSkippedCount] = useState("-");
  const [error, setError] = useState("");

  useEffect(() => {
    if (pageState.value?.codexSamplePayload) {
      setPayload(String(pageState.value.codexSamplePayload));
    }
  }, [pageState.value?.codexSamplePayload]);

  function renderResponse(status: string, body: unknown) {
    setHttpStatus(status);
    const record = (body || {}) as Record<string, unknown>;
    setCreatedCount(numberOrDash(record.createdCount));
    setExistingCount(numberOrDash(record.existingCount));
    setSkippedCount(numberOrDash(record.skippedCount));
    setResponseText(typeof body === "string" ? body : JSON.stringify(body, null, 2));
  }

  async function withResult(action: () => Promise<unknown>) {
    setError("");
    try {
      const result = await action();
      renderResponse("200", result);
      await historyState.reload();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : (en ? "Request failed." : "요청 처리에 실패했습니다.");
      setError(message);
      setResponseText(message);
    }
  }

  const historyRows = historyState.value?.items || [];
  const historyCount = historyState.value?.totalCount ?? historyRows.length;

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Codex Request" : "Codex 요청" }
      ]}
      title={en ? "Codex Request" : "Codex 요청"}
      subtitle={en ? "Run Codex metadata registration and inspection through the internal admin proxy." : "관리자 화면에서 서버 내부 프록시로 Codex 메타데이터 등록과 점검을 실행합니다."}
    >
      {pageState.error || historyState.error || error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || pageState.error || historyState.error}</div> : null}
      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <article className="gov-card">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">settings_ethernet</span>
            <h3 className="text-lg font-bold">{en ? "Request Setup" : "호출 설정"}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="gov-label" htmlFor="proxyMode">{en ? "Mode" : "호출 모드"}</label>
              <input className="gov-input bg-slate-50" id="proxyMode" readOnly value={en ? "Admin Internal Proxy" : "관리자 내부 프록시"} />
            </div>
            <div className="md:col-span-2">
              <label className="gov-label" htmlFor="payload">Provision JSON Payload</label>
              <textarea className="w-full min-h-[24rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] px-4 py-3 text-sm font-mono leading-6" id="payload" value={payload} onChange={(event) => setPayload(event.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="gov-btn gov-btn-outline" onClick={() => { void withResult(runCodexLoginCheck); }} type="button">{en ? "Check Auth" : "인증 확인"}</button>
            <button className="gov-btn gov-btn-primary" onClick={() => { void withResult(async () => executeCodexProvision(JSON.parse(payload))); }} type="button">{en ? "Run Provision" : "Provision 실행"}</button>
            <button className="gov-btn gov-btn-outline" onClick={() => {
              try {
                setPayload(JSON.stringify(JSON.parse(payload), null, 2));
              } catch {
                setError(en ? "Invalid JSON payload." : "JSON 형식이 올바르지 않습니다.");
              }
            }} type="button">{en ? "Format JSON" : "JSON 정렬"}</button>
            <button className="gov-btn gov-btn-outline" onClick={() => { void navigator.clipboard.writeText(payload); }} type="button">{en ? "Copy Payload" : "Payload 복사"}</button>
          </div>
        </article>
        <article className="space-y-6">
          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">monitoring</span>
              <h3 className="text-lg font-bold">{en ? "Response Result" : "응답 결과"}</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-[var(--kr-gov-text-secondary)]">HTTP: <strong>{httpStatus}</strong></div>
              <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">CREATED: <strong>{createdCount}</strong></div>
              <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">EXISTING: <strong>{existingCount}</strong></div>
              <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">SKIPPED: <strong>{skippedCount}</strong></div>
            </div>
            <pre className="rounded-[var(--kr-gov-radius)] bg-slate-950 text-slate-100 p-4 text-xs md:text-sm font-mono whitespace-pre-wrap break-all leading-6 min-h-[20rem]">{responseText}</pre>
          </section>
          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">rule_settings</span>
              <h3 className="text-lg font-bold">{en ? "Checkpoints" : "호출 체크포인트"}</h3>
            </div>
            <ul className="space-y-3 text-sm text-[var(--kr-gov-text-secondary)] leading-6">
              <li className="rounded-[var(--kr-gov-radius)] border border-slate-200 px-4 py-3 bg-slate-50">`page.code` {en ? "must be an 8-digit menu code." : "는 8자리 메뉴 코드여야 합니다."}</li>
              <li className="rounded-[var(--kr-gov-radius)] border border-slate-200 px-4 py-3 bg-slate-50">{en ? "When parent detail codes are missing, 4/6-digit parents are created together." : "새 페이지를 등록할 때 상위 4자리/6자리 detail code가 없으면 함께 생성됩니다."}</li>
              <li className="rounded-[var(--kr-gov-radius)] border border-slate-200 px-4 py-3 bg-slate-50">{en ? "`authors[].featureCodes` must match `features[].featureCode`." : "권한 그룹을 함께 등록하려면 `authors[].featureCodes`가 `features[].featureCode`와 일치해야 합니다."}</li>
            </ul>
          </section>
        </article>
      </section>
      <section className="gov-card mt-6">
        <div className="flex flex-col gap-3 border-b pb-4 mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">{en ? "Execution History" : "실행 이력 점검"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Review company context and mapping status for recent executions." : "최근 실행된 Codex 요청에서 회사 컨텍스트와 페이지/메뉴/기능/공통코드 매핑 상태를 다시 점검합니다."}</p>
          </div>
          <button className="gov-btn gov-btn-outline" onClick={() => { void historyState.reload(); }} type="button">{en ? "Refresh History" : "이력 새로고침"}</button>
        </div>
        <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">{historyRows.length === 0 ? (en ? "No execution history yet." : "아직 실행 이력이 없습니다.") : `${historyRows.length}${en ? " records loaded" : "건 이력을 불러왔습니다"} / ${historyCount}${en ? " total." : "건 전체."}`}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3 text-left">{en ? "Executed At" : "실행시각"}</th>
                <th className="px-4 py-3 text-left">{en ? "Request / Actor" : "요청/실행자"}</th>
                <th className="px-4 py-3 text-left">{en ? "Company / API" : "회사/대상 API"}</th>
                <th className="px-4 py-3 text-left">{en ? "Result" : "점검 결과"}</th>
                <th className="px-4 py-3 text-left">{en ? "Actions" : "조치"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyRows.length === 0 ? <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>{en ? "No history loaded." : "불러온 이력이 없습니다."}</td></tr> : historyRows.map((item, idx) => (
                <tr className="align-top" key={`${stringOf(item, "logId")}-${idx}`}>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="font-semibold">{stringOf(item, "executedAt") || "-"}</div><div className="text-xs text-gray-400">HTTP {stringOf(item, "httpStatus") || "-"} / {stringOf(item, "executionStatus") || "-"}</div></td>
                  <td className="px-4 py-4"><div className="font-semibold">{stringOf(item, "requestId") || "-"}</div><div className="text-xs text-gray-500">{stringOf(item, "actorUserId") || "-"} / {stringOf(item, "actorAuthorCode") || "-"}</div></td>
                  <td className="px-4 py-4">
                    <div className="font-semibold">{stringOf(item, "companyId") || "-"}</div>
                    <div className="text-xs text-gray-500 break-all">{stringOf(item, "targetApiPath") || stringOf(item, "pageMenuUrl") || "-"}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${boolOf(item.companyContextOk) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{en ? "Company" : "회사"}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${boolOf(item.pageMapped) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{en ? "Page" : "페이지"}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${boolOf(item.menuMapped) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{en ? "Menu" : "메뉴"}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${boolOf(item.featuresMapped) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{en ? "Feature" : "기능"}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${boolOf(item.commonCodesMapped) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{en ? "Code" : "공통코드"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`font-semibold ${Number(item.issueCount || 0) > 0 ? "text-red-700" : "text-emerald-700"}`}>{stringOf(item, "issueSummary") || "-"}</div>
                    {Array.isArray(item.issues) && item.issues.length > 0 ? (
                      <div className="mt-2 text-xs leading-5 text-red-700">
                        {item.issues.map((issue, issueIndex) => (
                          <div key={`${stringOf(item, "logId")}-issue-${issueIndex}`}>• {String(issue)}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-emerald-700">{en ? "No issue found" : "문제 없음"}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"><div className="flex flex-col gap-2"><button className="gov-btn gov-btn-outline !px-3 !py-1.5 text-xs" onClick={() => { setPayload(stringOf(item, "requestJson")); }} type="button">{en ? "Load Payload" : "Payload 불러오기"}</button><button className="gov-btn gov-btn-outline !px-3 !py-1.5 text-xs" onClick={() => { void withResult(async () => inspectCodexHistory(stringOf(item, "logId"))); }} type="button">{en ? "Inspect" : "재점검"}</button><button className="gov-btn gov-btn-primary !px-3 !py-1.5 text-xs" onClick={() => { void withResult(async () => remediateCodexHistory(stringOf(item, "logId"))); }} type="button">{en ? "Remediate" : "조치 실행"}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
