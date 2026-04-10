import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchOperationsCenterPage } from "../../lib/api/ops";
import type { OperationsCenterPagePayload } from "../../lib/api/opsTypes";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
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

function toneClass(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("CRITICAL") || upper.includes("DANGER") || upper.includes("위험")) {
    return "bg-red-100 text-red-700";
  }
  if (upper.includes("WARNING") || upper.includes("주의")) {
    return "bg-amber-100 text-amber-700";
  }
  if (upper.includes("HEALTHY") || upper.includes("정상")) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

function domainLabel(value: string, en: boolean) {
  const upper = value.toUpperCase();
  if (upper === "MEMBER") {
    return en ? "Member / Company" : "회원/회원사";
  }
  if (upper === "EMISSION") {
    return en ? "Emission / Business" : "배출/업무";
  }
  if (upper === "INTEGRATION") {
    return en ? "External Integration" : "외부연계";
  }
  if (upper === "CONTENT") {
    return en ? "Content" : "콘텐츠";
  }
  if (upper === "SECURITY_SYSTEM") {
    return en ? "Security / System" : "보안/시스템";
  }
  if (upper === "OPERATIONS_TOOLS") {
    return en ? "Operations Tools" : "운영도구";
  }
  return value || (en ? "General" : "일반");
}

function severityRank(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("CRITICAL") || upper.includes("위험")) {
    return 4;
  }
  if (upper.includes("WARNING") || upper.includes("주의")) {
    return 3;
  }
  if (upper.includes("INFO")) {
    return 2;
  }
  return 1;
}

function occurredAtTime(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return 0;
  }
  const parsed = Date.parse(normalized.replace(" ", "T"));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function OperationsCenterMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<OperationsCenterPagePayload>(fetchOperationsCenterPage, [], {});
  const page = pageState.value;
  const summaryCards = useMemo(() => ((page?.summaryCards || []) as Array<Record<string, string>>), [page]);
  const priorityItems = useMemo(() => ((page?.priorityItems || []) as Array<Record<string, string>>), [page]);
  const widgetGroups = useMemo(() => ((page?.widgetGroups || []) as Array<Record<string, unknown>>), [page]);
  const navigationSections = useMemo(() => ((page?.navigationSections || []) as Array<Record<string, unknown>>), [page]);
  const recentActions = useMemo(() => ((page?.recentActions || []) as Array<Record<string, string>>), [page]);
  const playbooks = useMemo(() => ((page?.playbooks || []) as Array<Record<string, string>>), [page]);
  const coreSummaryCards = useMemo(() => summaryCards.filter((card) => {
    const domain = stringOf(card, "domainType");
    return domain === "MEMBER" || domain === "EMISSION" || domain === "SECURITY_SYSTEM";
  }), [summaryCards]);
  const supportSummaryCards = useMemo(() => summaryCards.filter((card) => {
    const domain = stringOf(card, "domainType");
    return domain !== "MEMBER" && domain !== "EMISSION" && domain !== "SECURITY_SYSTEM";
  }), [summaryCards]);
  const primaryWidgetGroups = useMemo(() => widgetGroups.filter((group) => {
    const domain = stringOf(group as Record<string, unknown>, "domainType");
    return domain === "MEMBER" || domain === "EMISSION" || domain === "SECURITY_SYSTEM";
  }), [widgetGroups]);
  const secondaryWidgetGroups = useMemo(() => widgetGroups.filter((group) => {
    const domain = stringOf(group as Record<string, unknown>, "domainType");
    return domain !== "MEMBER" && domain !== "EMISSION" && domain !== "SECURITY_SYSTEM";
  }), [widgetGroups]);
  const overallStatus = stringOf(page as Record<string, unknown>, "overallStatus");
  const [selectedQueueDomain, setSelectedQueueDomain] = useState("ALL");
  const queueDomainOptions = useMemo(() => {
    const counts = new Map<string, number>();
    priorityItems.forEach((item) => {
      const domain = stringOf(item, "domainType") || "GENERAL";
      counts.set(domain, (counts.get(domain) || 0) + 1);
    });
    return [
      { value: "ALL", label: en ? "All" : "전체", count: priorityItems.length },
      ...Array.from(counts.entries()).map(([value, count]) => ({
        value,
        label: domainLabel(value, en),
        count
      }))
    ];
  }, [en, priorityItems]);
  const filteredPriorityItems = useMemo(() => {
    const scoped = selectedQueueDomain === "ALL"
      ? priorityItems
      : priorityItems.filter((item) => stringOf(item, "domainType") === selectedQueueDomain);
    return [...scoped].sort((left, right) => {
      const severityGap = severityRank(stringOf(right, "severity")) - severityRank(stringOf(left, "severity"));
      if (severityGap !== 0) {
        return severityGap;
      }
      return occurredAtTime(stringOf(right, "occurredAt")) - occurredAtTime(stringOf(left, "occurredAt"));
    });
  }, [priorityItems, selectedQueueDomain]);

  logGovernanceScope("PAGE", "operations-center", {
    language: en ? "en" : "ko",
    overallStatus,
    summaryCardCount: summaryCards.length,
    priorityItemCount: priorityItems.length,
    selectedQueueDomain,
    widgetGroupCount: widgetGroups.length,
    navigationSectionCount: navigationSections.length,
    recentActionCount: recentActions.length
  });

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Monitoring" : "모니터링" },
        { label: en ? "Operations Center" : "운영센터" }
      ]}
      title={en ? "Operations Center" : "운영센터"}
      subtitle={en ? "Review current operational health and move into detailed response screens." : "현재 운영 상태를 빠르게 점검하고 상세 대응 화면으로 이동합니다."}
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading operations center..." : "운영센터를 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}

        <section className="gov-card">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Current Status" : "현재 운영 상태"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${toneClass(overallStatus)}`}>
                  {overallStatus || (en ? "Unknown" : "미정")}
                </span>
                <span className="text-sm text-[var(--kr-gov-text-secondary)]">
                  {(en ? "Refreshed at " : "갱신 시각 ") + stringOf(page as Record<string, unknown>, "refreshedAt")}
                </span>
              </div>
            </div>
            <div className="max-w-xl text-sm text-[var(--kr-gov-text-secondary)]">
              {en
                ? "Use this page as the first stop, then move into the linked monitoring, log, scheduler, and audit screens."
                : "이 화면은 1차 상황판입니다. 상세 분석과 조치는 연결된 모니터링, 로그, 스케줄러, 감사 화면에서 진행합니다."}
            </div>
          </div>
          <div className="border-t border-[var(--kr-gov-border-light)] px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <a className="gov-btn" href={buildLocalizedPath("/admin/monitoring/sensor_add", "/en/admin/monitoring/sensor_add")}>
                {en ? "Register Sensor" : "센서 등록"}
              </a>
              <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/monitoring/sensor_edit", "/en/admin/monitoring/sensor_edit")}>
                {en ? "Open Sensor Settings" : "센서 설정 열기"}
              </a>
              <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/monitoring/sensor_list", "/en/admin/monitoring/sensor_list")}>
                {en ? "Open Sensor List" : "센서 목록 열기"}
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
                {en ? "Core Operations" : "핵심 운영"}
              </p>
              <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">
                {en ? "Primary Response Domains" : "우선 대응 도메인"}
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-[var(--kr-gov-text-secondary)]">
              {en
                ? "Start from member, emission, and security/system signals, then move into detailed screens."
                : "회원, 배출, 보안/시스템 신호부터 확인한 뒤 상세 화면으로 이동합니다."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coreSummaryCards.map((card, index) => (
              <a href={stringOf(card, "targetRoute")} key={`${stringOf(card, "key", "title", "label")}-${index}`}>
                <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[linear-gradient(135deg,rgba(248,251,255,0.96),rgba(255,255,255,1))] px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
                    {domainLabel(stringOf(card, "domainType"), en)}
                  </p>
                  <SummaryMetricCard
                    className="mt-2 border-0 bg-transparent px-0 py-0 shadow-none"
                    title={stringOf(card, "title", "label")}
                    description={stringOf(card, "description")}
                    value={stringOf(card, "value")}
                  />
                </article>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
                {en ? "Support Domains" : "지원 도메인"}
              </p>
              <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">
                {en ? "Governance And Tooling" : "거버넌스 및 도구"}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {supportSummaryCards.map((card, index) => (
            <a href={stringOf(card, "targetRoute")} key={`${stringOf(card, "key", "title", "label")}-${index}`}>
              <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--kr-gov-text-secondary)]">
                  {domainLabel(stringOf(card, "domainType"), en)}
                </p>
                <SummaryMetricCard
                  className="mt-2 border-0 bg-transparent px-0 py-0 shadow-none"
                  title={stringOf(card, "title", "label")}
                  description={stringOf(card, "description")}
                  value={stringOf(card, "value")}
                />
              </article>
            </a>
          ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {navigationSections.map((section, index) => {
            const links = ((section.links || []) as Array<Record<string, string>>);
            return (
              <article className="gov-card" key={`${stringOf(section as Record<string, unknown>, "sectionId", "title")}-${index}`}>
                <h3 className="text-base font-black text-[var(--kr-gov-text-primary)]">{stringOf(section as Record<string, unknown>, "title")}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(section as Record<string, unknown>, "description")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {links.map((link, linkIndex) => (
                    <a className="gov-btn gov-btn-outline" href={stringOf(link, "href")} key={`${stringOf(link, "label")}-${linkIndex}`}>
                      {stringOf(link, "label")}
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <article className="gov-card overflow-hidden p-0" data-help-id="operations-center-priority-queue">
            <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
              <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">{en ? "Priority Response Queue" : "우선 대응 큐"}</h3>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "Review the highest-impact items first and move into the linked detail screens." : "영향도가 큰 항목부터 확인하고 연결된 상세 화면으로 이동합니다."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {queueDomainOptions.map((option) => (
                  <button
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      selectedQueueDomain === option.value
                        ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white"
                        : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)] hover:border-[var(--kr-gov-blue)] hover:text-[var(--kr-gov-blue)]"
                    }`}
                    key={option.value}
                    onClick={() => setSelectedQueueDomain(option.value)}
                    type="button"
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Severity" : "심각도"}</th>
                    <th className="px-4 py-3">{en ? "Domain / Type" : "도메인 / 유형"}</th>
                    <th className="px-4 py-3">{en ? "Summary" : "요약"}</th>
                    <th className="px-4 py-3">{en ? "Occurred At" : "발생 시각"}</th>
                    <th className="px-4 py-3 text-right">{en ? "Action" : "이동"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPriorityItems.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        {selectedQueueDomain === "ALL"
                          ? (en ? "There are no priority items right now." : "현재 우선 대응 항목이 없습니다.")
                          : (en ? "There are no items in the selected domain." : "선택한 도메인에 우선 대응 항목이 없습니다.")}
                      </td>
                    </tr>
                  ) : filteredPriorityItems.map((item, index) => (
                    <tr key={`${stringOf(item, "itemId", "title")}-${index}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass(stringOf(item, "severity"))}`}>
                          {stringOf(item, "severity")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{domainLabel(stringOf(item, "domainType"), en)}</div>
                        <div className="mt-1 text-[13px] text-[var(--kr-gov-text-secondary)]">{stringOf(item, "sourceType")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(item, "title")}</div>
                        <div className="mt-1 text-[13px] text-[var(--kr-gov-text-secondary)]">{stringOf(item, "description")}</div>
                      </td>
                      <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "occurredAt")}</td>
                      <td className="px-4 py-3 text-right">
                        <a className="gov-btn gov-btn-outline" href={stringOf(item, "targetRoute")}>
                          {en ? "Open" : "열기"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <CollectionResultPanel
            data-help-id="operations-center-playbooks"
            description={en ? "Operator reminders before taking action in downstream screens." : "연결된 상세 화면에서 조치하기 전 운영 체크포인트입니다."}
            icon="rule"
            title={en ? "Operational Checkpoints" : "운영 체크포인트"}
          >
            <div className="space-y-3">
              {playbooks.map((item, index) => (
                <div
                  key={`${stringOf(item, "title")}-${index}`}
                  className={`rounded-lg border px-4 py-3 ${toneClass(stringOf(item, "tone"))}`}
                >
                  <p className="text-sm font-black">{stringOf(item, "title")}</p>
                  <p className="mt-1 text-sm">{stringOf(item, "body")}</p>
                </div>
              ))}
            </div>
          </CollectionResultPanel>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
              {en ? "Operational Widgets" : "운영 위젯"}
            </p>
            <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">
              {en ? "Core Domains" : "핵심 도메인"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {primaryWidgetGroups.map((group, index) => {
            const metricRows = ((group.metricRows || []) as Array<Record<string, string>>);
            const quickLinks = ((group.quickLinks || []) as Array<Record<string, string>>);
            return (
              <article className="gov-card" key={`${stringOf(group as Record<string, unknown>, "widgetId", "title")}-${index}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
                      {domainLabel(stringOf(group as Record<string, unknown>, "domainType"), en)}
                    </p>
                    <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">{stringOf(group as Record<string, unknown>, "title")}</h3>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(group as Record<string, unknown>, "description")}</p>
                  </div>
                  {stringOf(group as Record<string, unknown>, "targetRoute") ? (
                    <a className="gov-btn gov-btn-outline" href={stringOf(group as Record<string, unknown>, "targetRoute")}>
                      {en ? "View Detail" : "상세 보기"}
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {metricRows.map((row, rowIndex) => (
                    <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3" key={`${stringOf(row, "label")}-${rowIndex}`}>
                      <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{stringOf(row, "label")}</p>
                      <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{stringOf(row, "value")}</p>
                    </div>
                  ))}
                </div>
                {quickLinks.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {quickLinks.map((link, linkIndex) => (
                      <a className="gov-btn gov-btn-outline" href={stringOf(link, "href")} key={`${stringOf(link, "label")}-${linkIndex}`}>
                        {stringOf(link, "label")}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
              {en ? "Extended Operations" : "확장 운영"}
            </p>
            <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">
              {en ? "Integration, Content, And Tooling" : "외부연계, 콘텐츠, 운영도구"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {secondaryWidgetGroups.map((group, index) => {
            const metricRows = ((group.metricRows || []) as Array<Record<string, string>>);
            const quickLinks = ((group.quickLinks || []) as Array<Record<string, string>>);
            return (
              <article className="gov-card" key={`${stringOf(group as Record<string, unknown>, "widgetId", "title")}-${index}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">
                      {domainLabel(stringOf(group as Record<string, unknown>, "domainType"), en)}
                    </p>
                    <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">{stringOf(group as Record<string, unknown>, "title")}</h3>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(group as Record<string, unknown>, "description")}</p>
                  </div>
                  {stringOf(group as Record<string, unknown>, "targetRoute") ? (
                    <a className="gov-btn gov-btn-outline" href={stringOf(group as Record<string, unknown>, "targetRoute")}>
                      {en ? "View Detail" : "상세 보기"}
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {metricRows.map((row, rowIndex) => (
                    <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3" key={`${stringOf(row, "label")}-${rowIndex}`}>
                      <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{stringOf(row, "label")}</p>
                      <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{stringOf(row, "value")}</p>
                    </div>
                  ))}
                </div>
                {quickLinks.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {quickLinks.map((link, linkIndex) => (
                      <a className="gov-btn gov-btn-outline" href={stringOf(link, "href")} key={`${stringOf(link, "label")}-${linkIndex}`}>
                        {stringOf(link, "label")}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
          </div>
        </section>

        <section className="gov-card overflow-hidden p-0" data-help-id="operations-center-recent-actions">
          <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
            <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">{en ? "Recent Actions" : "최근 조치 이력"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
              {en ? "Check recent operator actions and move into the related history screen when needed." : "최근 운영자 조치를 확인하고 필요하면 관련 이력 화면으로 이동합니다."}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">{en ? "Time" : "시각"}</th>
                  <th className="px-4 py-3">{en ? "Actor" : "수행자"}</th>
                  <th className="px-4 py-3">{en ? "Action" : "조치"}</th>
                  <th className="px-4 py-3">{en ? "Target" : "대상"}</th>
                  <th className="px-4 py-3">{en ? "Result" : "결과"}</th>
                  <th className="px-4 py-3 text-right">{en ? "Link" : "이동"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {en ? "There is no recent action history." : "최근 조치 이력이 없습니다."}
                    </td>
                  </tr>
                ) : recentActions.map((row, index) => (
                  <tr key={`${stringOf(row, "actionId", "actedAt")}-${index}`}>
                    <td className="px-4 py-3">{stringOf(row, "actedAt")}</td>
                    <td className="px-4 py-3 font-semibold">{stringOf(row, "actorId")}</td>
                    <td className="px-4 py-3">{stringOf(row, "actionType")}</td>
                    <td className="px-4 py-3">{stringOf(row, "targetLabel")}</td>
                    <td className="px-4 py-3">{stringOf(row, "resultStatus")}</td>
                    <td className="px-4 py-3 text-right">
                      {stringOf(row, "targetRoute") ? (
                        <a className="gov-btn gov-btn-outline" href={stringOf(row, "targetRoute")}>
                          {en ? "History" : "이력"}
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
