import { logGovernanceScope } from "../../app/policy/debug";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { fetchPerformancePage, type PerformancePagePayload } from "../../lib/api/client";
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
  if (upper.includes("CRITICAL") || upper.includes("DANGER")) {
    return "bg-red-100 text-red-700";
  }
  if (upper.includes("WARNING")) {
    return "bg-amber-100 text-amber-700";
  }
  if (upper.includes("HEALTHY")) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

function metricToneClass(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("danger")) {
    return "border-red-200 bg-red-50";
  }
  if (lower.includes("warning")) {
    return "border-amber-200 bg-amber-50";
  }
  return "border-slate-200 bg-white";
}

export function PerformanceMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<PerformancePagePayload>(fetchPerformancePage, [], {});
  const page = pageState.value;
  const runtimeSummary = ((page?.runtimeSummary || []) as Array<Record<string, string>>);
  const requestSummary = ((page?.requestSummary || []) as Array<Record<string, string>>);
  const hotspotRoutes = ((page?.hotspotRoutes || []) as Array<Record<string, string>>);
  const recentSlowRequests = ((page?.recentSlowRequests || []) as Array<Record<string, string>>);
  const responseStatusSummary = ((page?.responseStatusSummary || []) as Array<Record<string, string>>);
  const quickLinks = ((page?.quickLinks || []) as Array<Record<string, string>>);
  const guidance = ((page?.guidance || []) as Array<Record<string, string>>);
  const overallStatus = stringOf(page as Record<string, unknown>, "overallStatus");
  const refreshedAt = stringOf(page as Record<string, unknown>, "refreshedAt");
  const slowThresholdMs = stringOf(page as Record<string, unknown>, "slowThresholdMs") || "1000";
  const requestWindowSize = stringOf(page as Record<string, unknown>, "requestWindowSize") || "200";

  logGovernanceScope("PAGE", "performance", {
    language: en ? "en" : "ko",
    overallStatus,
    runtimeSummaryCount: runtimeSummary.length,
    requestSummaryCount: requestSummary.length,
    hotspotRouteCount: hotspotRoutes.length,
    recentSlowRequestCount: recentSlowRequests.length
  });

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Performance" : "성능" }
      ]}
      title={en ? "Performance" : "성능"}
      subtitle={en ? "Review current JVM capacity and recent request latency without leaving the admin console." : "관리 콘솔에서 현재 JVM 여유와 최근 요청 지연을 함께 점검합니다."}
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading performance page..." : "성능 화면을 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}

        <section className="gov-card overflow-hidden">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Current Status" : "현재 상태"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${toneClass(overallStatus)}`}>
                  {overallStatus || "UNKNOWN"}
                </span>
                <span className="text-sm text-[var(--kr-gov-text-secondary)]">
                  {(en ? "Refreshed at " : "갱신 시각 ") + refreshedAt}
                </span>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-[var(--kr-gov-text-secondary)]">
              {en
                ? `Sampled from the latest ${requestWindowSize} request execution logs. Slow threshold is ${slowThresholdMs}ms.`
                : `최근 ${requestWindowSize}건 요청 실행 로그를 기준으로 계산했습니다. 지연 기준은 ${slowThresholdMs}ms입니다.`}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[linear-gradient(180deg,rgba(248,251,255,0.96),rgba(255,255,255,1))] p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Runtime" : "런타임"}</p>
                <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{en ? "JVM Capacity" : "JVM 용량 현황"}</h2>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {runtimeSummary.map((item, index) => (
                <article key={`${stringOf(item, "title")}-${index}`} className={`rounded-[var(--kr-gov-radius)] border p-4 ${metricToneClass(stringOf(item, "tone"))}`}>
                  <SummaryMetricCard
                    className="border-0 bg-transparent px-0 py-0 shadow-none"
                    title={stringOf(item, "title")}
                    description={stringOf(item, "description")}
                    value={stringOf(item, "value")}
                  />
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Request Window" : "요청 윈도우"}</p>
            <h2 className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{en ? "Latency Summary" : "지연 요약"}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {requestSummary.map((item, index) => (
                <article key={`${stringOf(item, "title")}-${index}`} className={`rounded-[var(--kr-gov-radius)] border p-4 ${metricToneClass(stringOf(item, "tone"))}`}>
                  <SummaryMetricCard
                    className="border-0 bg-transparent px-0 py-0 shadow-none"
                    title={stringOf(item, "title")}
                    description={stringOf(item, "description")}
                    value={stringOf(item, "value")}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr,1fr]">
          <CollectionResultPanel
            title={en ? "Hotspot Routes" : "지연 집중 경로"}
            description={en ? "Routes with the highest average or peak latency in the current sample." : "현재 샘플에서 평균 또는 최대 지연이 높은 경로입니다."}
            icon="speed"
            className="mb-0"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                  <tr>
                    <th className="px-3 py-2">{en ? "Route" : "경로"}</th>
                    <th className="px-3 py-2">{en ? "Method" : "메서드"}</th>
                    <th className="px-3 py-2">{en ? "Avg" : "평균"}</th>
                    <th className="px-3 py-2">{en ? "Max" : "최대"}</th>
                    <th className="px-3 py-2">{en ? "Hits" : "건수"}</th>
                    <th className="px-3 py-2">{en ? "Slow" : "지연"}</th>
                    <th className="px-3 py-2">{en ? "Error" : "오류"}</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspotRoutes.map((row, index) => (
                    <tr key={`${stringOf(row, "requestUri")}-${index}`} className="border-t border-[var(--kr-gov-border-light)]">
                      <td className="px-3 py-3 font-mono text-xs">
                        <a className="text-[var(--kr-gov-blue)] underline-offset-2 hover:underline" href={stringOf(row, "targetRoute")}>
                          {stringOf(row, "requestUri")}
                        </a>
                      </td>
                      <td className="px-3 py-3">{stringOf(row, "httpMethod")}</td>
                      <td className="px-3 py-3 font-bold">{stringOf(row, "avgDurationMs")}ms</td>
                      <td className="px-3 py-3">{stringOf(row, "maxDurationMs")}ms</td>
                      <td className="px-3 py-3">{stringOf(row, "hits")}</td>
                      <td className="px-3 py-3">{stringOf(row, "slowCount")}</td>
                      <td className="px-3 py-3">{stringOf(row, "errorCount")}</td>
                    </tr>
                  ))}
                  {hotspotRoutes.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-[var(--kr-gov-text-secondary)]" colSpan={7}>
                        {en ? "No request samples are available yet." : "아직 요청 샘플이 없습니다."}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CollectionResultPanel>

          <div className="space-y-4">
            <CollectionResultPanel
              title={en ? "Response Distribution" : "응답 분포"}
              description={en ? "Status code and peak latency summary from the same sample." : "동일 샘플 기준 상태 코드와 최대 지연 요약입니다."}
              icon="analytics"
              className="mb-0"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {responseStatusSummary.map((item, index) => (
                  <article key={`${stringOf(item, "title")}-${index}`} className={`rounded-[var(--kr-gov-radius)] border p-4 ${metricToneClass(stringOf(item, "tone"))}`}>
                    <SummaryMetricCard
                      className="border-0 bg-transparent px-0 py-0 shadow-none"
                      title={stringOf(item, "title")}
                      description={stringOf(item, "description")}
                      value={stringOf(item, "value")}
                    />
                  </article>
                ))}
              </div>
            </CollectionResultPanel>

            <CollectionResultPanel
              title={en ? "Quick Links" : "바로가기"}
              description={en ? "Move into deeper traces and error details." : "상세 추적과 오류 화면으로 바로 이동합니다."}
              icon="link"
              className="mb-0"
            >
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={`${stringOf(link, "label")}-${index}`}
                    className="gov-btn gov-btn-outline"
                    href={stringOf(link, "targetRoute")}
                  >
                    {stringOf(link, "label")}
                  </a>
                ))}
              </div>
            </CollectionResultPanel>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr,1fr]">
          <CollectionResultPanel
            title={en ? "Recent Slow Or Error Requests" : "최근 지연/오류 요청"}
            description={en ? "Latest requests that crossed the slow threshold or returned an error response." : "지연 기준을 넘었거나 오류 응답을 반환한 최근 요청입니다."}
            icon="playlist_play"
            className="mb-0"
          >
            <div className="space-y-3">
              {recentSlowRequests.map((row, index) => (
                <article key={`${stringOf(row, "traceId", "executedAt")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black">{stringOf(row, "httpMethod") || "GET"}</span>
                      <span className="font-mono text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "requestUri")}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-amber-100 px-2 py-1 font-black text-amber-800">{stringOf(row, "durationMs")}ms</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-black">{stringOf(row, "responseStatus")}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <p><span className="font-bold">{en ? "Executed" : "실행 시각"}:</span> {stringOf(row, "executedAt") || "-"}</p>
                    <p><span className="font-bold">{en ? "Actor" : "사용자"}:</span> {stringOf(row, "actorUserId") || "-"}</p>
                    <p className="font-mono text-xs md:col-span-2"><span className="font-bold not-italic">{en ? "Trace" : "Trace"}:</span> {stringOf(row, "traceId") || "-"}</p>
                    {stringOf(row, "errorMessage") ? (
                      <p className="md:col-span-2"><span className="font-bold">{en ? "Error" : "오류"}:</span> {stringOf(row, "errorMessage")}</p>
                    ) : null}
                  </div>
                  {stringOf(row, "targetRoute") ? (
                    <div className="mt-3">
                      <a className="text-sm font-bold text-[var(--kr-gov-blue)] underline-offset-2 hover:underline" href={stringOf(row, "targetRoute")}>
                        {en ? "Open related trace" : "연관 trace 열기"}
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
              {recentSlowRequests.length === 0 ? (
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">
                  {en ? "No slow or error requests were found in the latest sample." : "최근 샘플에서 지연 또는 오류 요청이 발견되지 않았습니다."}
                </p>
              ) : null}
            </div>
          </CollectionResultPanel>

          <CollectionResultPanel
            title={en ? "Operator Guidance" : "운영 가이드"}
            description={en ? "Use the page as a fast triage surface, then move into the linked tools." : "이 화면은 빠른 분기점으로 사용하고 상세 분석은 연결된 도구에서 진행합니다."}
            icon="rule"
            className="mb-0"
          >
            <div className="space-y-3">
              {guidance.map((item, index) => (
                <article key={`${stringOf(item, "title")}-${index}`} className={`rounded-[var(--kr-gov-radius)] border p-4 ${metricToneClass(stringOf(item, "tone"))}`}>
                  <h3 className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(item, "title")}</h3>
                  <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body")}</p>
                </article>
              ))}
            </div>
          </CollectionResultPanel>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
