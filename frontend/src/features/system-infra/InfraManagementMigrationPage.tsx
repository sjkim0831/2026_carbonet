import { useMemo, useState } from "react";
import { logGovernanceScope } from "../../app/policy/debug";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { MemberActionBar } from "../member/common";

type InfraNode = {
  id: string;
  name: string;
  role: string;
  zone: string;
  health: string;
  cpu: string;
  memory: string;
  disk: string;
  note: string;
};

const INFRA_ROWS: InfraNode[] = [
  { id: "WEB-01", name: "Admin Web Node 01", role: "WEB", zone: "Seoul-A", health: "Healthy", cpu: "41%", memory: "58%", disk: "63%", note: "Primary admin traffic and shell delivery." },
  { id: "WEB-02", name: "Admin Web Node 02", role: "WEB", zone: "Seoul-B", health: "Warning", cpu: "72%", memory: "69%", disk: "70%", note: "Burst traffic fallback during heavy audit/export windows." },
  { id: "JOB-01", name: "Batch Worker 01", role: "BATCH", zone: "Seoul-A", health: "Healthy", cpu: "33%", memory: "44%", disk: "52%", note: "Scheduler and report generation lane." },
  { id: "OBS-01", name: "Observability Relay", role: "OBSERVABILITY", zone: "Seoul-B", health: "Review", cpu: "49%", memory: "61%", disk: "46%", note: "Telemetry ingest and alert fan-out relay." }
];

const INCIDENT_ROWS = [
  {
    titleKo: "WEB-02 응답 지연 상승",
    titleEn: "WEB-02 latency elevation",
    severity: "Warning",
    actionKo: "오후 배치 종료 전까지 신규 세션 분산 비율을 10% 낮춥니다.",
    actionEn: "Reduce new-session distribution by 10% until the current batch window closes."
  },
  {
    titleKo: "OBS-01 알림 큐 재처리 필요",
    titleEn: "OBS-01 alert queue replay needed",
    severity: "Review",
    actionKo: "중복 이벤트 정리 후 재전송 작업을 예약합니다.",
    actionEn: "Schedule replay after duplicate-event cleanup completes."
  }
];

function toneClass(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("HEALTHY") || upper.includes("정상")) return "bg-emerald-100 text-emerald-700";
  if (upper.includes("WARNING") || upper.includes("주의")) return "bg-amber-100 text-amber-700";
  if (upper.includes("CRITICAL") || upper.includes("위험")) return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
}

function utilizationValue(value: string) {
  return Number.parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
}

export function InfraManagementMigrationPage() {
  const en = isEnglish();
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");

  const filteredRows = useMemo(() => INFRA_ROWS.filter((row) => {
    const roleMatched = roleFilter === "ALL" || row.role === roleFilter;
    const zoneMatched = zoneFilter === "ALL" || row.zone === zoneFilter;
    return roleMatched && zoneMatched;
  }), [roleFilter, zoneFilter]);

  const summaryCards = useMemo(() => {
    const warningCount = filteredRows.filter((row) => row.health !== "Healthy").length;
    const avgCpu = filteredRows.length === 0 ? 0 : Math.round(filteredRows.reduce((sum, row) => sum + utilizationValue(row.cpu), 0) / filteredRows.length);
    const avgMemory = filteredRows.length === 0 ? 0 : Math.round(filteredRows.reduce((sum, row) => sum + utilizationValue(row.memory), 0) / filteredRows.length);
    return [
      {
        title: en ? "Tracked Nodes" : "추적 노드 수",
        value: String(filteredRows.length),
        description: en ? "Web, batch, and observability nodes in the current filter." : "현재 필터 기준 웹, 배치, 관측 노드 수입니다."
      },
      {
        title: en ? "Attention Needed" : "점검 필요",
        value: String(warningCount),
        description: en ? "Nodes not currently in the healthy lane." : "현재 정상 상태가 아닌 노드 수입니다."
      },
      {
        title: en ? "Avg CPU" : "평균 CPU",
        value: `${avgCpu}%`,
        description: en ? "Average CPU utilization across the selected nodes." : "선택된 노드 기준 평균 CPU 사용률입니다."
      },
      {
        title: en ? "Avg Memory" : "평균 메모리",
        value: `${avgMemory}%`,
        description: en ? "Average memory utilization across the selected nodes." : "선택된 노드 기준 평균 메모리 사용률입니다."
      }
    ];
  }, [en, filteredRows]);

  logGovernanceScope("PAGE", "system-infra", {
    language: en ? "en" : "ko",
    roleFilter,
    zoneFilter,
    trackedNodeCount: filteredRows.length
  });

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Infrastructure" : "인프라" }
      ]}
      title={en ? "Infrastructure Console" : "인프라 콘솔"}
      subtitle={en ? "Review core web, batch, and observability infrastructure status and move into related operations tools." : "웹, 배치, 관측 인프라의 상태를 빠르게 점검하고 관련 운영 도구로 이동합니다."}
      actions={
        <div className="flex flex-wrap gap-2">
          <a className="gov-btn" href={buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management")}>
            {en ? "Full-stack" : "풀스택 관리"}
          </a>
          <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio")}>
            {en ? "Platform Studio" : "플랫폼 스튜디오"}
          </a>
        </div>
      }
    >
      <AdminWorkspacePageFrame>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
            />
          ))}
        </section>

        <section className="gov-card mt-6">
          <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Filtering" : "필터"}</p>
              <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{en ? "Infrastructure Segments" : "인프라 세그먼트"}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="gov-select min-w-[160px]" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="ALL">{en ? "All roles" : "전체 역할"}</option>
                <option value="WEB">WEB</option>
                <option value="BATCH">BATCH</option>
                <option value="OBSERVABILITY">OBSERVABILITY</option>
              </select>
              <select className="gov-select min-w-[160px]" value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
                <option value="ALL">{en ? "All zones" : "전체 존"}</option>
                <option value="Seoul-A">Seoul-A</option>
                <option value="Seoul-B">Seoul-B</option>
              </select>
            </div>
          </div>
          <div className="border-t border-[var(--kr-gov-border-light)] px-6 py-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredRows.map((row) => (
                <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm" key={row.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--kr-gov-blue)]">{row.role}</p>
                      <h3 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{row.name}</h3>
                      <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{row.id} · {row.zone}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${toneClass(row.health)}`}>{row.health}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <SummaryMetricCard className="border bg-slate-50 shadow-none" title="CPU" value={row.cpu} description={en ? "Load" : "부하"} />
                    <SummaryMetricCard className="border bg-slate-50 shadow-none" title="MEM" value={row.memory} description={en ? "Usage" : "사용률"} />
                    <SummaryMetricCard className="border bg-slate-50 shadow-none" title="DISK" value={row.disk} description={en ? "Storage" : "저장소"} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{row.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <CollectionResultPanel
            title={en ? "Current Infra Actions" : "현재 인프라 조치"}
            description={en ? "Use these actions to stabilize the current runtime before escalating into deeper tooling." : "심화 도구로 이동하기 전에 현재 런타임을 안정화하기 위한 우선 조치입니다."}
          >
            <div className="space-y-3">
              {INCIDENT_ROWS.map((item) => (
                <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4" key={item.titleKo}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{en ? item.titleEn : item.titleKo}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${toneClass(item.severity)}`}>{item.severity}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{en ? item.actionEn : item.actionKo}</p>
                </article>
              ))}
            </div>
          </CollectionResultPanel>

          <CollectionResultPanel
            title={en ? "Connected Consoles" : "연결 콘솔"}
            description={en ? "Move into the right console depending on whether the issue is topology, governance, or event-driven." : "토폴로지, 거버넌스, 이벤트 성격에 따라 적절한 콘솔로 이동합니다."}
          >
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  label: en ? "Operations Center" : "운영센터",
                  href: buildLocalizedPath("/admin/monitoring/center", "/en/admin/monitoring/center"),
                  note: en ? "Runtime signals, sensors, and alert-focused follow-up." : "런타임 신호, 센서, 경보 중심 후속 조치."
                },
                {
                  label: en ? "Observability" : "통합 관측",
                  href: buildLocalizedPath("/admin/system/observability", "/en/admin/system/observability"),
                  note: en ? "Unified logs and runtime comparison context." : "통합 로그와 런타임 비교 문맥."
                },
                {
                  label: en ? "Scheduler" : "스케줄러 관리",
                  href: buildLocalizedPath("/admin/system/scheduler", "/en/admin/system/scheduler"),
                  note: en ? "Batch pressure and retry scheduling path." : "배치 부하 및 재시도 스케줄 관리 경로."
                }
              ].map((item) => (
                <a className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm" href={item.href} key={item.href}>
                  <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{item.note}</p>
                </a>
              ))}
            </div>
          </CollectionResultPanel>
        </section>

        <MemberActionBar
          eyebrow={en ? "Infra Governance" : "인프라 거버넌스"}
          title={en ? "Use this console as the first checkpoint before detailed remediation" : "상세 조치 전에 먼저 점검하는 인프라 콘솔"}
          description={en ? "This page is a lightweight operator dashboard for node health, capacity balance, and jump points into deeper system consoles." : "이 화면은 노드 상태, 용량 균형, 심화 시스템 콘솔 진입점을 빠르게 보는 운영자용 대시보드입니다."}
          secondary={{ label: en ? "Open Full-stack" : "풀스택 관리", href: buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management") }}
          tertiary={{ label: en ? "Open Platform Studio" : "플랫폼 스튜디오", href: buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio") }}
          primary={
            <a
              className="inline-flex min-w-[180px] items-center justify-center rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
              href={buildLocalizedPath("/admin/monitoring/center", "/en/admin/monitoring/center")}
            >
              {en ? "Open Operations Center" : "운영센터 열기"}
            </a>
          }
        />
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
