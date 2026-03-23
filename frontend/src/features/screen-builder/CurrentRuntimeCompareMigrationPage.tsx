import { useMemo } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchAuditEvents } from "../../lib/api/observability";
import { fetchScreenBuilderPage, fetchScreenBuilderPreview } from "../../lib/api/screenBuilder";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { GridToolbar, KeyValueGridPanel, MemberLinkButton, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { resolveRuntimeCompareContextKeys } from "../admin-ui/contextKeyPresets";
import { resolveScreenBuilderQuery, sortScreenBuilderNodes } from "./shared/screenBuilderUtils";

type CompareRow = {
  label: string;
  current: string;
  generated: string;
  baseline: string;
  result: "MATCH" | "MISMATCH" | "GAP";
};

function stringifyValue(value: unknown, empty = "-") {
  const normalized = String(value || "").trim();
  return normalized || empty;
}

function findContextKeyValue(items: Array<{ label: string; value: string }>, label: string, empty = "-") {
  return items.find((item) => item.label === label)?.value || empty;
}

function buildCompareRows(options: {
  currentTemplateLine: string;
  currentFamilyRule: string;
  currentScope: string;
  currentNodeCount: number;
  currentIssueCount: number;
  generatedTemplateLine: string;
  generatedFamilyRule: string;
  generatedScope: string;
  generatedNodeCount: number;
  generatedIssueCount: number;
  baselineTemplateLine: string;
  baselineFamilyRule: string;
  baselineScope: string;
}): CompareRow[] {
  const rows: Array<Omit<CompareRow, "result">> = [
    {
      label: "Template Line",
      current: options.currentTemplateLine,
      generated: options.generatedTemplateLine,
      baseline: options.baselineTemplateLine
    },
    {
      label: "Screen Family Rule",
      current: options.currentFamilyRule,
      generated: options.generatedFamilyRule,
      baseline: options.baselineFamilyRule
    },
    {
      label: "Authority Scope",
      current: options.currentScope,
      generated: options.generatedScope,
      baseline: options.baselineScope
    },
    {
      label: "Node Count",
      current: String(options.currentNodeCount),
      generated: String(options.generatedNodeCount),
      baseline: "family-governed",
    },
    {
      label: "Registry Issues",
      current: `${options.currentIssueCount} issue(s)`,
      generated: `${options.generatedIssueCount} issue(s)`,
      baseline: "0 issue(s)"
    }
  ];

  return rows.map((row) => {
    const values = [row.current, row.generated, row.baseline].map((item) => item.trim());
    const hasGap = values.some((item) => item === "-" || item === "");
    if (hasGap) {
      return { ...row, result: "GAP" as const };
    }
    const allMatch = values.every((item) => item === values[0]);
    return { ...row, result: allMatch ? "MATCH" as const : "MISMATCH" as const };
  });
}

function resultChipClassName(result: CompareRow["result"]) {
  if (result === "MATCH") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (result === "GAP") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-red-100 text-red-700";
}

export function CurrentRuntimeCompareMigrationPage() {
  const en = isEnglish();
  const query = useMemo(() => resolveScreenBuilderQuery({ get: getSearchParam }), []);
  const pageState = useAsyncValue(
    () => fetchScreenBuilderPage(query),
    [query.menuCode, query.pageId, query.menuTitle, query.menuUrl]
  );
  const page = pageState.value;
  const publishedPreviewState = useAsyncValue(
    () => fetchScreenBuilderPreview({ ...query, versionStatus: "PUBLISHED" }),
    [query.menuCode, query.pageId, query.menuTitle, query.menuUrl, page?.publishedVersionId || ""],
    { enabled: Boolean(page?.publishedVersionId) }
  );
  const currentPreviewState = useAsyncValue(
    () => fetchScreenBuilderPreview(query),
    [query.menuCode, query.pageId, query.menuTitle, query.menuUrl, page?.versionId || ""],
    { enabled: Boolean(query.menuCode || query.pageId) }
  );
  const auditState = useAsyncValue(
    () => fetchAuditEvents({ menuCode: query.menuCode, pageId: query.pageId, pageSize: 8 }),
    [query.menuCode, query.pageId],
    { enabled: Boolean(query.menuCode || query.pageId) }
  );

  const currentPreview = currentPreviewState.value;
  const publishedPreview = publishedPreviewState.value;
  const generatedNodes = useMemo(() => sortScreenBuilderNodes(currentPreview?.nodes || page?.nodes || []), [currentPreview?.nodes, page?.nodes]);
  const currentNodes = useMemo(() => sortScreenBuilderNodes(publishedPreview?.nodes || []), [publishedPreview?.nodes]);
  const currentDiagnostics = publishedPreview?.registryDiagnostics || page?.registryDiagnostics;
  const generatedDiagnostics = currentPreview?.registryDiagnostics || page?.registryDiagnostics;
  const currentIssueCount = (currentDiagnostics?.missingNodes?.length || 0) + (currentDiagnostics?.deprecatedNodes?.length || 0);
  const generatedIssueCount = (generatedDiagnostics?.missingNodes?.length || 0) + (generatedDiagnostics?.deprecatedNodes?.length || 0);
  const compareContextKeys = useMemo(() => resolveRuntimeCompareContextKeys({
    menuUrl: page?.menuUrl || query.menuUrl,
    templateType: currentPreview?.templateType || publishedPreview?.templateType || page?.templateType
  }), [currentPreview?.templateType, page?.menuUrl, page?.templateType, publishedPreview?.templateType, query.menuUrl]);
  const templateLineId = findContextKeyValue(compareContextKeys, "Template Line");
  const screenFamilyRuleId = findContextKeyValue(compareContextKeys, "Screen Family Rule");
  const compareRows = useMemo(() => buildCompareRows({
    currentTemplateLine: templateLineId,
    currentFamilyRule: screenFamilyRuleId,
    currentScope: stringifyValue(publishedPreview?.authorityProfile?.scopePolicy || page?.authorityProfile?.scopePolicy, "GLOBAL"),
    currentNodeCount: currentNodes.length,
    currentIssueCount,
    generatedTemplateLine: templateLineId,
    generatedFamilyRule: screenFamilyRuleId,
    generatedScope: stringifyValue(currentPreview?.authorityProfile?.scopePolicy || page?.authorityProfile?.scopePolicy, "GLOBAL"),
    generatedNodeCount: generatedNodes.length,
    generatedIssueCount,
    baselineTemplateLine: templateLineId,
    baselineFamilyRule: screenFamilyRuleId,
    baselineScope: "GLOBAL"
  }), [currentIssueCount, currentNodes.length, currentPreview?.authorityProfile?.scopePolicy, generatedIssueCount, generatedNodes.length, page?.authorityProfile?.scopePolicy, publishedPreview?.authorityProfile?.scopePolicy, screenFamilyRuleId, templateLineId]);
  const mismatchCount = compareRows.filter((row) => row.result === "MISMATCH").length;
  const gapCount = compareRows.filter((row) => row.result === "GAP").length;
  const recentAuditCount = (auditState.value?.items || []).length;
  const latestPublishAudit = (auditState.value?.items || []).find((row) => String(row.actionCode || "").includes("PUBLISH")) || null;

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Screen Builder" : "화면 빌더", href: buildLocalizedPath("/admin/system/screen-builder", "/en/admin/system/screen-builder") },
        { label: en ? "Current Runtime Compare" : "현재 런타임 비교" }
      ]}
      title={en ? "Current Runtime Compare" : "현재 런타임 비교"}
      subtitle={en ? "Compare the published runtime against the current generated snapshot and the governed baseline." : "발행 런타임을 현재 생성 스냅샷과 governed baseline에 맞춰 비교합니다."}
      contextStrip={<ContextKeyStrip items={compareContextKeys} />}
      loading={(pageState.loading && !page) || (currentPreviewState.loading && !currentPreview)}
      loadingLabel={en ? "Loading runtime compare..." : "런타임 비교를 불러오는 중입니다."}
    >
      {pageState.error || currentPreviewState.error || publishedPreviewState.error ? (
        <PageStatusNotice tone="error">
          {pageState.error || currentPreviewState.error || publishedPreviewState.error}
        </PageStatusNotice>
      ) : null}

      {!page?.publishedVersionId ? (
        <PageStatusNotice tone="warning">
          {en
            ? "No published runtime snapshot exists yet. Compare results are limited until a publish snapshot is available."
            : "아직 발행된 런타임 스냅샷이 없습니다. publish 스냅샷이 생기기 전까지 비교 결과가 제한됩니다."}
        </PageStatusNotice>
      ) : null}

      <AdminWorkspacePageFrame>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="runtime-compare-metrics">
          <SummaryMetricCard title={en ? "Compare Rows" : "비교 항목"} value={compareRows.length} description={en ? "Governed checks" : "governed 점검 항목"} />
          <SummaryMetricCard title={en ? "Mismatches" : "불일치"} value={mismatchCount} description={en ? "Current vs generated vs baseline" : "current / generated / baseline 비교"} accentClassName="text-red-700" surfaceClassName="bg-red-50" />
          <SummaryMetricCard title={en ? "Gaps" : "누락"} value={gapCount} description={en ? "Missing current evidence" : "현재 증거 부족"} accentClassName="text-amber-700" surfaceClassName="bg-amber-50" />
          <SummaryMetricCard title={en ? "Recent Builder Events" : "최근 빌더 이벤트"} value={recentAuditCount} description={en ? "Recent save/publish traces" : "최근 저장 / 발행 흔적"} />
        </section>

        <div data-help-id="runtime-compare-scope">
          <KeyValueGridPanel
            description={en ? "Baseline values are derived from the governed context keys for the current lane." : "baseline 값은 현재 레인의 governed context key 기준으로 계산합니다."}
            items={[
              { label: en ? "Menu Code" : "메뉴 코드", value: page?.menuCode || query.menuCode || "-" },
              { label: "pageId", value: page?.pageId || query.pageId || "-" },
              { label: en ? "Published Version" : "발행 버전", value: page?.publishedVersionId || "-" },
              { label: en ? "Draft Version" : "초안 버전", value: page?.versionId || "-" },
              { label: en ? "Runtime URL" : "런타임 URL", value: page?.menuUrl || query.menuUrl || "-" },
              { label: en ? "Latest Publish" : "최근 발행", value: latestPublishAudit ? String(latestPublishAudit.createdAt || "-") : "-" }
            ]}
            title={en ? "Compare Scope" : "비교 범위"}
          />
        </div>

        <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-matrix">
          <GridToolbar
            actions={(
              <>
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/screen-runtime?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&menuTitle=${encodeURIComponent(page?.menuTitle || query.menuTitle)}&menuUrl=${encodeURIComponent(page?.menuUrl || query.menuUrl)}`,
                    `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&menuTitle=${encodeURIComponent(page?.menuTitle || query.menuTitle)}&menuUrl=${encodeURIComponent(page?.menuUrl || query.menuUrl)}`
                  )}
                  size="sm"
                  variant="secondary"
                >
                  {en ? "Open Runtime" : "런타임 열기"}
                </MemberLinkButton>
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/observability?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                    `/en/admin/system/observability?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                  )}
                  size="sm"
                  variant="secondary"
                >
                  {en ? "Open Observability" : "Observability 열기"}
                </MemberLinkButton>
              </>
            )}
            meta={en ? "Published runtime is treated as current evidence; the draft builder snapshot is used as the generated target." : "발행 런타임을 current evidence로, 현재 빌더 스냅샷을 generated target으로 사용합니다."}
            title={en ? "Compare Matrix" : "비교 매트릭스"}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--kr-gov-border-light)]">
              <thead className="bg-slate-50 text-left text-[12px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                <tr>
                  <th className="px-5 py-4">{en ? "Target" : "대상"}</th>
                  <th className="px-5 py-4">{en ? "Current Runtime" : "현재 런타임"}</th>
                  <th className="px-5 py-4">{en ? "Generated" : "생성 결과"}</th>
                  <th className="px-5 py-4">{en ? "Baseline" : "기준선"}</th>
                  <th className="px-5 py-4">{en ? "Result" : "결과"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--kr-gov-border-light)] bg-white text-sm">
                {compareRows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-4 font-bold text-[var(--kr-gov-text-primary)]">{row.label}</td>
                    <td className="px-5 py-4">{row.current}</td>
                    <td className="px-5 py-4">{row.generated}</td>
                    <td className="px-5 py-4">{row.baseline}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${resultChipClassName(row.result)}`}>
                        {row.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-events">
          <GridToolbar
            meta={en ? "Latest compare-linked publish evidence and recent builder activity." : "비교와 연결된 최근 publish 증거와 빌더 활동입니다."}
            title={en ? "Recent Compare Events" : "최근 비교 이벤트"}
          />
          <div className="divide-y divide-[var(--kr-gov-border-light)] bg-white">
            <div className="px-5 py-4 text-sm">
              <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Latest Publish Evidence" : "최근 발행 증거"}</p>
              <p className="mt-1 text-[var(--kr-gov-text-secondary)]">
                {latestPublishAudit
                  ? `${String(latestPublishAudit.actionCode || "-")} / ${String(latestPublishAudit.createdAt || "-")}`
                  : (en ? "No publish audit was found yet." : "아직 publish audit 이력이 없습니다.")}
              </p>
            </div>
            <div className="px-5 py-4 text-sm">
              <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Recent Builder Event Count" : "최근 빌더 이벤트 수"}</p>
              <p className="mt-1 text-[var(--kr-gov-text-secondary)]">
                {recentAuditCount} {en ? "event(s) linked to this compare scope." : "건의 이벤트가 현재 비교 범위에 연결되어 있습니다."}
              </p>
            </div>
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
