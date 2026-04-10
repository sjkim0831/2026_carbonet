import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchBatchManagementPage } from "../../lib/api/ops";
import type { BatchManagementPagePayload } from "../../lib/api/opsTypes";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { AdminInput, AdminSelect, CollectionResultPanel, GridToolbar, PageStatusNotice, SummaryMetricCard, WarningPanel } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";

function stringOf(row: Record<string, unknown> | null | undefined, ...keys: string[]) {
  if (!row) {
    return "";
  }
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) {
        return text;
      }
    }
  }
  return "";
}

function parseCount(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function BatchManagementMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<BatchManagementPagePayload>(fetchBatchManagementPage, [], {});
  const page = pageState.value;
  const jobs = ((page?.batchJobRows || []) as Array<Record<string, string>>);
  const queues = ((page?.batchQueueRows || []) as Array<Record<string, string>>);
  const nodes = ((page?.batchNodeRows || []) as Array<Record<string, string>>);
  const executions = ((page?.batchExecutionRows || []) as Array<Record<string, string>>);
  const runbooks = ((page?.batchRunbooks || []) as Array<Record<string, string>>);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [jobStatus, setJobStatus] = useState("ALL");
  const [nodeStatus, setNodeStatus] = useState("ALL");

  const keyword = searchKeyword.trim().toLowerCase();
  const filteredJobs = useMemo(() => jobs.filter((row) => {
    const matchesKeyword = !keyword || [
      stringOf(row, "jobId"),
      stringOf(row, "jobName"),
      stringOf(row, "queueName"),
      stringOf(row, "owner"),
      stringOf(row, "note")
    ].join(" ").toLowerCase().includes(keyword);
    const matchesStatus = jobStatus === "ALL" || stringOf(row, "jobStatus").toUpperCase() === jobStatus;
    return matchesKeyword && matchesStatus;
  }), [jobStatus, jobs, keyword]);
  const filteredQueues = useMemo(() => queues.filter((row) => !keyword || [
    stringOf(row, "queueId"),
    stringOf(row, "queueName"),
    stringOf(row, "consumerNode"),
    stringOf(row, "status")
  ].join(" ").toLowerCase().includes(keyword)), [keyword, queues]);
  const filteredNodes = useMemo(() => nodes.filter((row) => {
    const matchesKeyword = !keyword || [
      stringOf(row, "nodeId"),
      stringOf(row, "role"),
      stringOf(row, "affinity")
    ].join(" ").toLowerCase().includes(keyword);
    const matchesStatus = nodeStatus === "ALL" || stringOf(row, "status").toUpperCase() === nodeStatus;
    return matchesKeyword && matchesStatus;
  }), [keyword, nodeStatus, nodes]);
  const filteredExecutions = useMemo(() => executions.filter((row) => !keyword || [
    stringOf(row, "executedAt"),
    stringOf(row, "jobId"),
    stringOf(row, "result"),
    stringOf(row, "message")
  ].join(" ").toLowerCase().includes(keyword)), [executions, keyword]);

  const summary = useMemo(() => ([
    {
      title: en ? "Visible Jobs" : "조회 잡 수",
      value: String(filteredJobs.length),
      description: en ? "Jobs matching the current filter." : "현재 조건에 맞는 배치 잡 수입니다."
    },
    {
      title: en ? "Queue Backlog" : "큐 적체",
      value: String(filteredQueues.reduce((total, row) => total + parseCount(stringOf(row, "backlogCount")), 0)),
      description: en ? "Pending messages across visible queues." : "표시 중인 큐의 대기 메시지 합계입니다."
    },
    {
      title: en ? "Healthy / Standby Nodes" : "정상/대기 노드",
      value: String(filteredNodes.filter((row) => ["HEALTHY", "STANDBY"].includes(stringOf(row, "status").toUpperCase())).length),
      description: en ? "Nodes ready to accept new workloads." : "새 작업을 받을 수 있는 노드 수입니다."
    },
    {
      title: en ? "Failed / Review Runs" : "실패/재검토 실행",
      value: String(filteredExecutions.filter((row) => ["FAILED", "REVIEW"].includes(stringOf(row, "result").toUpperCase())).length),
      description: en ? "Recent executions that still need operator follow-up." : "운영자 후속 조치가 남은 최근 실행 건수입니다."
    }
  ]), [en, filteredExecutions, filteredJobs, filteredNodes, filteredQueues]);

  logGovernanceScope("PAGE", "batch-management", {
    language: en ? "en" : "ko",
    searchKeyword,
    jobStatus,
    nodeStatus,
    jobCount: filteredJobs.length,
    queueCount: filteredQueues.length,
    nodeCount: filteredNodes.length,
    executionCount: filteredExecutions.length
  });

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Batch" : "배치 관리" }
      ]}
      title={en ? "Batch Management" : "배치 관리"}
      subtitle={en ? "Review batch jobs, queue backlog, worker nodes, and recent execution signals in one workspace." : "배치 잡, 큐 적체, 워커 노드, 최근 실행 신호를 한 작업 공간에서 점검합니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}

        <CollectionResultPanel
          data-help-id="batch-management-filters"
          description={en ? "Narrow the job and node scope before investigating queue backlog or failed executions." : "큐 적체나 실패 실행을 보기 전에 잡과 노드 범위를 먼저 좁힙니다."}
          icon="schedule"
          title={en ? "Batch Scope Filter" : "배치 조회 조건"}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:w-[60rem]">
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="batchKeyword">{en ? "Keyword" : "검색어"}</label>
              <AdminInput
                id="batchKeyword"
                placeholder={en ? "Job, queue, owner, message" : "잡명, 큐, 담당자, 메시지"}
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="batchJobStatus">{en ? "Job Status" : "잡 상태"}</label>
              <AdminSelect id="batchJobStatus" value={jobStatus} onChange={(event) => setJobStatus(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="REVIEW">REVIEW</option>
              </AdminSelect>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="batchNodeStatus">{en ? "Node Status" : "노드 상태"}</label>
              <AdminSelect id="batchNodeStatus" value={nodeStatus} onChange={(event) => setNodeStatus(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="HEALTHY">HEALTHY</option>
                <option value="STANDBY">STANDBY</option>
                <option value="DEGRADED">DEGRADED</option>
              </AdminSelect>
            </div>
            <div className="flex items-end gap-2">
              <button
                className="gov-btn gov-btn-outline w-full"
                onClick={() => {
                  setSearchKeyword("");
                  setJobStatus("ALL");
                  setNodeStatus("ALL");
                }}
                type="button"
              >
                {en ? "Reset" : "초기화"}
              </button>
            </div>
          </div>
        </CollectionResultPanel>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="batch-management-summary">
          {summary.map((card) => (
            <SummaryMetricCard
              key={card.title}
              description={card.description}
              title={card.title}
              value={card.value}
            />
          ))}
        </section>

        <section className="gov-card overflow-hidden p-0" data-help-id="batch-management-jobs">
          <GridToolbar
            actions={<span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Total" : "총"} <strong>{filteredJobs.length}</strong>{en ? "" : "건"}</span>}
            meta={en ? "Keep job status, queue ownership, and next run time aligned." : "잡 상태, 큐 소유, 다음 실행 시점을 함께 확인합니다."}
            title={en ? "Batch Job List" : "배치 잡 목록"}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">{en ? "Job ID" : "잡 ID"}</th>
                  <th className="px-4 py-3">{en ? "Job Name" : "잡명"}</th>
                  <th className="px-4 py-3">{en ? "Queue" : "큐"}</th>
                  <th className="px-4 py-3">{en ? "Type" : "유형"}</th>
                  <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                  <th className="px-4 py-3">{en ? "Last Run" : "최근 실행"}</th>
                  <th className="px-4 py-3">{en ? "Next Run" : "다음 실행"}</th>
                  <th className="px-4 py-3">{en ? "Owner" : "담당"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((row) => (
                  <tr key={stringOf(row, "jobId")}>
                    <td className="px-4 py-3 font-bold">{stringOf(row, "jobId")}</td>
                    <td className="px-4 py-3">{stringOf(row, "jobName")}</td>
                    <td className="px-4 py-3">{stringOf(row, "queueName")}</td>
                    <td className="px-4 py-3">{stringOf(row, "executionType")}</td>
                    <td className="px-4 py-3">{stringOf(row, "jobStatus")}</td>
                    <td className="px-4 py-3">{stringOf(row, "lastRunAt")}</td>
                    <td className="px-4 py-3">{stringOf(row, "nextRunAt")}</td>
                    <td className="px-4 py-3">{stringOf(row, "owner")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="gov-card overflow-hidden p-0" data-help-id="batch-management-queues">
            <GridToolbar
              meta={en ? "Watch backlog, consumer ownership, and SLA state together." : "적체량, 소비 노드, SLA 상태를 함께 확인합니다."}
              title={en ? "Queue Backlog" : "큐 적체 현황"}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Queue ID" : "큐 ID"}</th>
                    <th className="px-4 py-3">{en ? "Queue Name" : "큐명"}</th>
                    <th className="px-4 py-3">{en ? "Backlog" : "대기 건수"}</th>
                    <th className="px-4 py-3">{en ? "Consumer Node" : "소비 노드"}</th>
                    <th className="px-4 py-3">{en ? "Last Message" : "최근 메시지"}</th>
                    <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredQueues.map((row) => (
                    <tr key={stringOf(row, "queueId")}>
                      <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "queueId")}</td>
                      <td className="px-4 py-3">{stringOf(row, "queueName")}</td>
                      <td className="px-4 py-3">{stringOf(row, "backlogCount")}</td>
                      <td className="px-4 py-3">{stringOf(row, "consumerNode")}</td>
                      <td className="px-4 py-3">{stringOf(row, "lastMessageAt")}</td>
                      <td className="px-4 py-3">{stringOf(row, "status")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <article className="gov-card overflow-hidden p-0" data-help-id="batch-management-nodes">
            <GridToolbar
              meta={en ? "Check node health and queue affinity before reruns." : "재실행 전에 노드 상태와 큐 affinity를 확인합니다."}
              title={en ? "Worker Nodes" : "워커 노드"}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Node ID" : "노드 ID"}</th>
                    <th className="px-4 py-3">{en ? "Role" : "역할"}</th>
                    <th className="px-4 py-3">{en ? "Affinity" : "담당 큐"}</th>
                    <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                    <th className="px-4 py-3">Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredNodes.map((row) => (
                    <tr key={stringOf(row, "nodeId")}>
                      <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "nodeId")}</td>
                      <td className="px-4 py-3">{stringOf(row, "role")}</td>
                      <td className="px-4 py-3">{stringOf(row, "affinity")}</td>
                      <td className="px-4 py-3">{stringOf(row, "status")}</td>
                      <td className="px-4 py-3">{stringOf(row, "heartbeatAt")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="gov-card overflow-hidden p-0" data-help-id="batch-management-executions">
          <GridToolbar
            meta={en ? "Focus on retry-required and review-required executions first." : "재시도 필요, 재검토 필요 실행을 먼저 확인하도록 구성했습니다."}
            title={en ? "Recent Batch Executions" : "최근 배치 실행"}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">{en ? "Executed At" : "실행 시각"}</th>
                  <th className="px-4 py-3">{en ? "Job ID" : "잡 ID"}</th>
                  <th className="px-4 py-3">{en ? "Result" : "결과"}</th>
                  <th className="px-4 py-3">{en ? "Duration" : "소요 시간"}</th>
                  <th className="px-4 py-3">{en ? "Message" : "메시지"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExecutions.map((row, index) => (
                  <tr key={`${stringOf(row, "executedAt")}-${index}`}>
                    <td className="px-4 py-3">{stringOf(row, "executedAt")}</td>
                    <td className="px-4 py-3 font-bold">{stringOf(row, "jobId")}</td>
                    <td className="px-4 py-3">{stringOf(row, "result")}</td>
                    <td className="px-4 py-3">{stringOf(row, "duration")}</td>
                    <td className="px-4 py-3">{stringOf(row, "message")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_1fr]">
          {runbooks.map((item, index) => (
            <CollectionResultPanel
              description={stringOf(item, "body")}
              icon="menu_book"
              key={`${stringOf(item, "title")}-${index}`}
              title={stringOf(item, "title")}
            >
              <WarningPanel className="mb-0 border-slate-200 bg-slate-50 text-[var(--kr-gov-text-secondary)]" title={stringOf(item, "title")}>
                {stringOf(item, "body")}
              </WarningPanel>
            </CollectionResultPanel>
          ))}
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
