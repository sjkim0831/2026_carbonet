import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchSchedulerManagementPage, readBootstrappedSchedulerManagementPageData, type SchedulerManagementPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

export function SchedulerManagementMigrationPage() {
  const en = isEnglish();
  const initialFilters = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    return {
      jobStatus: search.get("jobStatus") || "",
      executionType: search.get("executionType") || ""
    };
  }, []);
  const initialPayload = useMemo(() => readBootstrappedSchedulerManagementPageData(), []);
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState(initialFilters);
  const pageState = useAsyncValue<SchedulerManagementPagePayload>(() => fetchSchedulerManagementPage(filters), [filters.jobStatus, filters.executionType], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload),
    onSuccess(payload) {
      setDraft({
        jobStatus: String(payload.jobStatus || ""),
        executionType: String(payload.executionType || "")
      });
    }
  });
  const page = pageState.value;
  const summary = (page?.schedulerSummary || []) as Array<Record<string, string>>;
  const jobs = (page?.schedulerJobRows || []) as Array<Record<string, string>>;
  const nodes = (page?.schedulerNodeRows || []) as Array<Record<string, string>>;
  const executions = (page?.schedulerExecutionRows || []) as Array<Record<string, string>>;
  const playbooks = (page?.schedulerPlaybooks || []) as Array<Record<string, string>>;

  logGovernanceScope("PAGE", "scheduler-management", {
    language: en ? "en" : "ko",
    jobStatus: filters.jobStatus,
    executionType: filters.executionType,
    summaryCount: summary.length,
    jobCount: jobs.length,
    nodeCount: nodes.length,
    executionCount: executions.length
  });
  logGovernanceScope("COMPONENT", "scheduler-management-jobs", {
    jobCount: jobs.length,
    nodeCount: nodes.length,
    executionCount: executions.length,
    playbookCount: playbooks.length
  });
  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Scheduler" : "크론/스케줄러 관리" }
      ]}
      title={en ? "Cron / Scheduler Management" : "크론/스케줄러 관리"}
      subtitle={en ? "Inspect periodic jobs, manual runs, worker nodes, and recent executions on one screen." : "정기 배치, 수동 실행 잡, 워커 상태, 최근 실행 이력을 한 화면에서 점검합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <section className="gov-card mb-6" data-help-id="scheduler-management-search">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:w-[44rem]" onSubmit={(event) => { event.preventDefault(); logGovernanceScope("ACTION", "scheduler-management-search", { jobStatus: draft.jobStatus, executionType: draft.executionType }); setFilters(draft); }}>
          <div><label className="block mb-1 text-sm font-bold" htmlFor="jobStatus">{en ? "Job Status" : "잡 상태"}</label><select className="gov-select" id="jobStatus" value={draft.jobStatus} onChange={(event) => setDraft((current) => ({ ...current, jobStatus: event.target.value }))}><option value="">{en ? "All" : "전체"}</option><option value="ACTIVE">ACTIVE</option><option value="PAUSED">PAUSED</option><option value="REVIEW">REVIEW</option></select></div>
          <div><label className="block mb-1 text-sm font-bold" htmlFor="executionType">{en ? "Execution Type" : "실행 유형"}</label><select className="gov-select" id="executionType" value={draft.executionType} onChange={(event) => setDraft((current) => ({ ...current, executionType: event.target.value }))}><option value="">{en ? "All" : "전체"}</option><option value="CRON">{en ? "Scheduled" : "정기"}</option><option value="MANUAL">{en ? "Manual" : "수동"}</option></select></div>
          <div className="flex gap-2 items-end"><button className="gov-btn gov-btn-primary w-full" type="submit">{en ? "Search" : "조회"}</button><button className="gov-btn gov-btn-outline w-full" onClick={() => { const reset = { jobStatus: "", executionType: "" }; logGovernanceScope("ACTION", "scheduler-management-reset", reset); setDraft(reset); setFilters(reset); }} type="button">{en ? "Reset" : "초기화"}</button></div>
        </form>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">{summary.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}</section>
      <section className="gov-card mb-6 p-0 overflow-hidden" data-help-id="scheduler-management-jobs"><div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)] flex items-center justify-between"><div><h3 className="text-lg font-bold">{en ? "Job List" : "잡 목록"}</h3><p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Check cron, last run, and next run together." : "Cron 표현식, 최근 실행, 다음 실행 시점을 함께 확인합니다."}</p></div><span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Total" : "총"} <strong>{jobs.length}</strong>{en ? "" : "건"}</span></div><div className="overflow-x-auto"><table className="w-full text-sm text-left border-collapse"><thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Job ID" : "잡 ID"}</th><th className="px-4 py-3">{en ? "Job Name" : "잡명"}</th><th className="px-4 py-3">Cron</th><th className="px-4 py-3">{en ? "Type" : "유형"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Last Run" : "최근 실행"}</th><th className="px-4 py-3">{en ? "Next Run" : "다음 실행"}</th><th className="px-4 py-3">{en ? "Owner" : "담당"}</th></tr></thead><tbody className="divide-y divide-gray-100">{jobs.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-bold">{stringOf(row, "jobId")}</td><td className="px-4 py-3">{stringOf(row, "jobName")}</td><td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "cronExpression")}</td><td className="px-4 py-3">{stringOf(row, "executionType")}</td><td className="px-4 py-3">{stringOf(row, "jobStatus")}</td><td className="px-4 py-3">{stringOf(row, "lastRunAt")}</td><td className="px-4 py-3">{stringOf(row, "nextRunAt")}</td><td className="px-4 py-3">{stringOf(row, "owner")}</td></tr>)}</tbody></table></div></section>
      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 mb-6"><article className="gov-card p-0 overflow-hidden"><div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]"><h3 className="text-lg font-bold">{en ? "Worker Nodes" : "워커 노드 상태"}</h3><p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Check cluster heartbeat and node load." : "클러스터 heartbeat와 노드별 실행 부하를 확인합니다."}</p></div><div className="overflow-x-auto"><table className="w-full text-sm text-left border-collapse"><thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Node ID" : "노드 ID"}</th><th className="px-4 py-3">{en ? "Role" : "역할"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Running" : "실행중"}</th><th className="px-4 py-3">Heartbeat</th></tr></thead><tbody className="divide-y divide-gray-100">{nodes.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "nodeId")}</td><td className="px-4 py-3">{stringOf(row, "role")}</td><td className="px-4 py-3">{stringOf(row, "status")}</td><td className="px-4 py-3">{stringOf(row, "runningJobs")}</td><td className="px-4 py-3">{stringOf(row, "heartbeatAt")}</td></tr>)}</tbody></table></div></article><article className="gov-card"><h3 className="text-lg font-bold">{en ? "Operational Notes" : "운영 메모"}</h3><ul className="mt-4 space-y-3 text-sm text-[var(--kr-gov-text-secondary)] leading-6"><li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{en ? "Review environment, retry policy, and dedupe key for new cron jobs." : "Cron 잡 신규 등록 시 운영환경, 재시도 정책, 중복 실행 방지 키를 함께 검토합니다."}</li><li className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">{en ? "Review history before rerunning jobs in REVIEW status." : "`REVIEW` 상태 잡은 즉시 재실행하지 말고 최근 이력과 관련 승인 상태를 먼저 확인합니다."}</li><li className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">{en ? "Leave ops notice and retention notes before heavy manual runs." : "대량 보정성 수동 실행은 운영 공지와 로그 보존 기준을 남긴 뒤 진행합니다."}</li></ul></article></section>
      <section className="gov-card mb-6 p-0 overflow-hidden" data-help-id="scheduler-management-executions"><div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]"><h3 className="text-lg font-bold">{en ? "Recent Executions" : "최근 실행 이력"}</h3><p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Track success, failure, and review candidates quickly." : "성공, 실패, 재검토 대상 이력을 빠르게 추적할 수 있도록 구성했습니다."}</p></div><div className="overflow-x-auto"><table className="w-full text-sm text-left border-collapse"><thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Executed At" : "실행 시각"}</th><th className="px-4 py-3">{en ? "Job ID" : "잡 ID"}</th><th className="px-4 py-3">{en ? "Result" : "결과"}</th><th className="px-4 py-3">{en ? "Duration" : "소요 시간"}</th><th className="px-4 py-3">{en ? "Message" : "메시지"}</th></tr></thead><tbody className="divide-y divide-gray-100">{executions.map((row, idx) => <tr key={idx}><td className="px-4 py-3">{stringOf(row, "executedAt")}</td><td className="px-4 py-3 font-bold">{stringOf(row, "jobId")}</td><td className="px-4 py-3">{stringOf(row, "result")}</td><td className="px-4 py-3">{stringOf(row, "duration")}</td><td className="px-4 py-3">{stringOf(row, "message")}</td></tr>)}</tbody></table></div></section>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">{playbooks.map((item, idx) => <article className="gov-card" key={idx}><h3 className="text-lg font-bold">{stringOf(item, "title")}</h3><p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body")}</p></article>)}</section>
    </AdminPageShell>
  );
}
