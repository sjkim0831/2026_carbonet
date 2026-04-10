import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchExternalMaintenancePage } from "../../lib/api/ops";
import type { ExternalMaintenancePagePayload } from "../../lib/api/opsTypes";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { stringOf } from "../admin-system/adminSystemShared";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, GridToolbar, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect } from "../member/common";

function badgeClass(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("BLOCKED") || upper.includes("DANGER")) return "bg-red-100 text-red-700";
  if (upper.includes("DUE") || upper.includes("WARN")) return "bg-amber-100 text-amber-700";
  if (upper.includes("READY") || upper.includes("NEUTRAL")) return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export function ExternalMaintenanceMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<ExternalMaintenancePagePayload>(fetchExternalMaintenancePage, [], {});
  const page = pageState.value;
  const summary = useMemo(() => ((page?.externalMaintenanceSummary || []) as Array<Record<string, string>>), [page]);
  const rows = useMemo(() => ((page?.externalMaintenanceRows || []) as Array<Record<string, string>>), [page]);
  const impactRows = useMemo(() => ((page?.externalMaintenanceImpactRows || []) as Array<Record<string, string>>), [page]);
  const runbooks = useMemo(() => ((page?.externalMaintenanceRunbooks || []) as Array<Record<string, string>>), [page]);
  const quickLinks = useMemo(() => ((page?.externalMaintenanceQuickLinks || []) as Array<Record<string, string>>), [page]);
  const guidance = useMemo(() => ((page?.externalMaintenanceGuidance || []) as Array<Record<string, string>>), [page]);
  const [keyword, setKeyword] = useState("");
  const [syncMode, setSyncMode] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesKeyword = !normalizedKeyword || [
        stringOf(row, "connectionId"),
        stringOf(row, "connectionName"),
        stringOf(row, "partnerName"),
        stringOf(row, "ownerName")
      ].join(" ").toLowerCase().includes(normalizedKeyword);
      const matchesSyncMode = syncMode === "ALL" || stringOf(row, "syncMode").toUpperCase() === syncMode;
      const matchesStatus = status === "ALL" || stringOf(row, "maintenanceStatus").toUpperCase() === status;
      return matchesKeyword && matchesSyncMode && matchesStatus;
    });
  }, [keyword, rows, status, syncMode]);

  useEffect(() => {
    logGovernanceScope("PAGE", "external-maintenance", {
      language: en ? "en" : "ko",
      totalCount: rows.length,
      filteredCount: filteredRows.length,
      syncMode,
      status
    });
  }, [en, filteredRows.length, rows.length, status, syncMode]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "External Integration" : "외부 연계" },
        { label: en ? "Maintenance" : "점검 관리" }
      ]}
      title={en ? "Maintenance" : "점검 관리"}
      subtitle={en ? "Track maintenance windows, impact scope, fallback paths, and recovery proof for external integrations." : "외부연계 점검 윈도우, 영향 범위, 대체 경로, 복구 확인 항목을 함께 관리합니다."}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/external/sync", "/en/admin/external/sync")}>
            {en ? "Sync Execution" : "동기화 실행"}
          </a>
          <a className="gov-btn" href={buildLocalizedPath("/admin/external/retry", "/en/admin/external/retry")}>
            {en ? "Retry Control" : "재시도 관리"}
          </a>
        </div>
      }
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading external maintenance plan..." : "외부연계 점검 현황을 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="external-maintenance-summary">
          {summary.map((item, index) => (
            <SummaryMetricCard
              key={`${stringOf(item, "title")}-${index}`}
              title={stringOf(item, "title")}
              value={stringOf(item, "value")}
              description={stringOf(item, "description")}
            />
          ))}
        </section>

        <CollectionResultPanel
          data-help-id="external-maintenance-filters"
          title={en ? "Maintenance Filters" : "점검 조회 조건"}
          description={en ? "Narrow the maintenance queue before coordinating fallback routing, partner notice, or recovery proof." : "대체 경로, 파트너 공지, 복구 증적을 조정하기 전에 점검 대상을 좁힙니다."}
          icon="build"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:w-[68rem]">
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalMaintenanceKeyword">{en ? "Keyword" : "검색어"}</label>
              <AdminInput id="externalMaintenanceKeyword" placeholder={en ? "Connection, partner, owner" : "연계명, 기관명, 담당자"} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalMaintenanceMode">{en ? "Sync Mode" : "동기화 방식"}</label>
              <AdminSelect id="externalMaintenanceMode" value={syncMode} onChange={(event) => setSyncMode(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="SCHEDULED">{en ? "Scheduled" : "스케줄 수집"}</option>
                <option value="HYBRID">{en ? "Hybrid" : "혼합형"}</option>
                <option value="WEBHOOK">{en ? "Webhook" : "웹훅"}</option>
              </AdminSelect>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalMaintenanceStatus">{en ? "Status" : "점검 상태"}</label>
              <AdminSelect id="externalMaintenanceStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="READY">READY</option>
                <option value="DUE_SOON">DUE_SOON</option>
                <option value="BLOCKED">BLOCKED</option>
              </AdminSelect>
            </div>
            <div className="flex items-end">
              <button className="gov-btn gov-btn-outline w-full" onClick={() => { setKeyword(""); setSyncMode("ALL"); setStatus("ALL"); }} type="button">
                {en ? "Reset Filters" : "검색 조건 초기화"}
              </button>
            </div>
          </div>
        </CollectionResultPanel>

        <section className="gov-card overflow-hidden p-0" data-help-id="external-maintenance-inventory">
          <GridToolbar
            actions={<p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? `Visible ${filteredRows.length} of ${rows.length}` : `전체 ${rows.length}건 중 ${filteredRows.length}건 표시`}</p>}
            meta={(en ? "Refreshed at " : "갱신 시각 ") + stringOf(page as Record<string, unknown>, "refreshedAt")}
            title={en ? "Maintenance Inventory" : "점검 대상 현황"}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                <tr>
                  <th className="px-4 py-3">{en ? "Connection" : "연계"}</th>
                  <th className="px-4 py-3">{en ? "Mode" : "방식"}</th>
                  <th className="px-4 py-3">{en ? "Planned At" : "예정 시각"}</th>
                  <th className="px-4 py-3">{en ? "Window" : "점검 윈도우"}</th>
                  <th className="px-4 py-3">{en ? "Impact" : "영향 범위"}</th>
                  <th className="px-4 py-3">{en ? "Fallback" : "대체 경로"}</th>
                  <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={`${stringOf(row, "maintenanceId")}-${index}`} className="border-t border-[var(--kr-gov-border-light)]">
                    <td className="px-4 py-3">
                      <a className="font-bold text-[var(--kr-gov-blue)] underline-offset-2 hover:underline" href={stringOf(row, "targetRoute")}>
                        {stringOf(row, "connectionName")}
                      </a>
                      <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "connectionId")} / {stringOf(row, "ownerName")}</p>
                    </td>
                    <td className="px-4 py-3">{stringOf(row, "syncMode")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{stringOf(row, "plannedAt")}</td>
                    <td className="px-4 py-3">{stringOf(row, "maintenanceWindow")}</td>
                    <td className="px-4 py-3">{stringOf(row, "impactScope")}</td>
                    <td className="px-4 py-3">{stringOf(row, "fallbackRoute")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(row, "maintenanceStatus"))}`}>{stringOf(row, "maintenanceStatus")}</span>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr className="border-t border-[var(--kr-gov-border-light)]">
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={7}>
                      {en ? "No maintenance targets match the current filters." : "현재 조건에 맞는 점검 대상이 없습니다."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr,1fr]">
          <article className="gov-card overflow-hidden p-0" data-help-id="external-maintenance-impact">
            <GridToolbar title={en ? "Impact Review" : "영향 검토"} meta={en ? "Operator actions are paired with fallback routing for each row." : "각 항목마다 운영 조치와 대체 경로를 함께 제시합니다."} />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Connection" : "연계"}</th>
                    <th className="px-4 py-3">{en ? "Impact" : "영향"}</th>
                    <th className="px-4 py-3">{en ? "Fallback" : "대체 경로"}</th>
                    <th className="px-4 py-3">{en ? "Operator Action" : "운영 조치"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {impactRows.map((row, index) => (
                    <tr key={`${stringOf(row, "connectionName")}-${index}`}>
                      <td className="px-4 py-3 font-bold">{stringOf(row, "connectionName")}</td>
                      <td className="px-4 py-3">{stringOf(row, "impactScope")}</td>
                      <td className="px-4 py-3">{stringOf(row, "fallbackRoute")}</td>
                      <td className="px-4 py-3">{stringOf(row, "operatorAction")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-4">
            <CollectionResultPanel data-help-id="external-maintenance-runbook" title={en ? "Runbook" : "운영 런북"} description={en ? "Keep the same operating sequence before, during, and after the maintenance window." : "점검 전, 점검 중, 복구 후 절차를 같은 순서로 유지합니다."} icon="fact_check">
              <div className="space-y-3">
                {runbooks.map((item, index) => (
                  <article key={`${stringOf(item, "title")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${badgeClass(stringOf(item, "tone"))}`}>{stringOf(item, "tone") || "INFO"}</span>
                      <h3 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(item, "title")}</h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body", "description")}</p>
                  </article>
                ))}
              </div>
            </CollectionResultPanel>

            <CollectionResultPanel data-help-id="external-maintenance-links" title={en ? "Quick Links" : "바로가기"} description={en ? "Move into adjacent operational screens without losing the maintenance context." : "점검 맥락을 유지한 채 인접 운영 화면으로 이동합니다."} icon="link">
              <div className="grid grid-cols-1 gap-3">
                {quickLinks.map((item, index) => (
                  <a key={`${stringOf(item, "label")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 py-3 text-sm font-bold text-[var(--kr-gov-blue)] hover:border-[var(--kr-gov-blue)]" href={stringOf(item, "targetRoute", "href")}>
                    {stringOf(item, "label", "title")}
                  </a>
                ))}
              </div>
            </CollectionResultPanel>

            <CollectionResultPanel data-help-id="external-maintenance-guidance" title={en ? "Guidance" : "운영 가이드"} description={en ? "Maintenance closure needs runtime proof, not just a status flip." : "점검 종료는 상태 변경이 아니라 실제 복구 확인까지 포함해야 합니다."} icon="schedule">
              <div className="space-y-3">
                {guidance.map((item, index) => (
                  <div key={`${stringOf(item, "title")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 py-3 text-sm">
                    <strong>{stringOf(item, "title")}</strong>
                    <p className="mt-1 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body", "description")}</p>
                  </div>
                ))}
              </div>
            </CollectionResultPanel>
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
