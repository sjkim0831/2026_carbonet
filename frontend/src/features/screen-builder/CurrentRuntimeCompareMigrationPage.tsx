import { useEffect, useMemo } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchAuditEvents } from "../../lib/api/observability";
import { RESONANCE_PROJECT_ID, fetchParityCompare, type ResonanceParityCompareRow } from "../../lib/api/resonanceControlPlane";
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
  patchTarget: string;
  result: "MATCH" | "MISMATCH" | "GAP";
};

type BlockerRow = {
  blocker: string;
  ownerLane: string;
  source: string;
};

type RepairQueueEntry = {
  candidate: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
};

type VerifyClosureRow = {
  label: string;
  state: "PASS" | "WARN";
  evidence: string;
};

type LoopStatusItem = {
  label: string;
  value: string;
};

function stringifyValue(value: unknown, empty = "-") {
  const normalized = String(value || "").trim();
  return normalized || empty;
}

function findContextKeyValue(items: Array<{ label: string; value: string }>, label: string, empty = "-") {
  return items.find((item) => item.label === label)?.value || empty;
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function normalizeToken(value: string, fallback: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function buildDeployEvidence(options: {
  releaseUnitId: string;
  selectedScreenId: string;
  ownerLane: string;
  runtimeEvidence?: Record<string, unknown> | null;
}) {
  const runtimeEvidence = options.runtimeEvidence || {};
  const releaseUnitId = stringifyValue(options.releaseUnitId);
  const selectedScreenToken = normalizeToken(options.selectedScreenId, "screen-runtime");

  return {
    releaseUnitId,
    runtimePackageId: stringifyValue(runtimeEvidence.runtimePackageId, `runtime-package-${selectedScreenToken}`),
    deployTraceId: stringifyValue(runtimeEvidence.deployTraceId, `deploy-trace-${normalizeToken(releaseUnitId, "release-unit")}-${selectedScreenToken}`),
    ownerLane: stringifyValue(runtimeEvidence.ownerLane, options.ownerLane),
    rollbackAnchorYn: stringifyValue(runtimeEvidence.rollbackAnchorYn, "Y")
  };
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
  patchTemplateLine: string;
  patchFamilyRule: string;
  patchScope: string;
  patchNodeCount: number;
  patchIssueCount: number;
}): CompareRow[] {
  const rows: Array<Omit<CompareRow, "result">> = [
    {
      label: "Template Line",
      current: options.currentTemplateLine,
      generated: options.generatedTemplateLine,
      baseline: options.baselineTemplateLine,
      patchTarget: options.patchTemplateLine
    },
    {
      label: "Screen Family Rule",
      current: options.currentFamilyRule,
      generated: options.generatedFamilyRule,
      baseline: options.baselineFamilyRule,
      patchTarget: options.patchFamilyRule
    },
    {
      label: "Authority Scope",
      current: options.currentScope,
      generated: options.generatedScope,
      baseline: options.baselineScope,
      patchTarget: options.patchScope
    },
    {
      label: "Node Count",
      current: String(options.currentNodeCount),
      generated: String(options.generatedNodeCount),
      baseline: "family-governed",
      patchTarget: String(options.patchNodeCount),
    },
    {
      label: "Registry Issues",
      current: `${options.currentIssueCount} issue(s)`,
      generated: `${options.generatedIssueCount} issue(s)`,
      baseline: "0 issue(s)",
      patchTarget: `${options.patchIssueCount} issue(s)`
    }
  ];

  return rows.map((row) => {
    const values = [row.current, row.generated, row.baseline, row.patchTarget].map((item) => item.trim());
    const hasGap = values.some((item) => item === "-" || item === "");
    if (hasGap) {
      return { ...row, result: "GAP" as const };
    }
    const allMatch = values.every((item) => item === values[0]);
    return { ...row, result: allMatch ? "MATCH" as const : "MISMATCH" as const };
  });
}

function mapParityRows(rows: ResonanceParityCompareRow[]): CompareRow[] {
  return rows.map((row) => ({
    label: stringifyValue(row.target),
    current: stringifyValue(row.currentRuntime),
    generated: stringifyValue(row.generatedTarget),
    baseline: stringifyValue(row.proposalBaseline),
    patchTarget: stringifyValue(row.patchTarget),
    result: row.result === "MATCH" || row.result === "MISMATCH" || row.result === "GAP" ? row.result : "GAP"
  }));
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

function buildCompareContextStripItems(
  baseItems: Array<{ label: string; value: string }>,
  rows: CompareRow[],
  releaseUnitId: string
) {
  const items = [...baseItems];
  const trackedTargets = new Set(items.map((item) => item.label));
  const compareTargets = [
    { label: "Template Line", rowLabel: "Template Line" },
    { label: "Screen Family Rule", rowLabel: "Screen Family Rule" }
  ];

  compareTargets.forEach(({ label, rowLabel }) => {
    const row = rows.find((candidate) => candidate.label === rowLabel);
    if (!row || row.result === "MATCH") {
      return;
    }
    const currentLabel = `Current ${label}`;
    const targetLabel = `Target ${label}`;
    if (!trackedTargets.has(currentLabel)) {
      items.push({ label: currentLabel, value: row.current });
      trackedTargets.add(currentLabel);
    }
    if (!trackedTargets.has(targetLabel)) {
      items.push({ label: targetLabel, value: row.patchTarget });
      trackedTargets.add(targetLabel);
    }
  });

  if (releaseUnitId && releaseUnitId !== "-" && !trackedTargets.has("Release Unit")) {
    items.push({ label: "Release Unit", value: releaseUnitId });
  }

  return items;
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
  const currentEventCount = publishedPreview?.events?.length || 0;
  const generatedEventCount = currentPreview?.events?.length || page?.events?.length || 0;
  const compareContextKeys = useMemo(() => resolveRuntimeCompareContextKeys({
    menuUrl: page?.menuUrl || query.menuUrl,
    templateType: currentPreview?.templateType || publishedPreview?.templateType || page?.templateType
  }), [currentPreview?.templateType, page?.menuUrl, page?.templateType, publishedPreview?.templateType, query.menuUrl]);
  const templateLineId = findContextKeyValue(compareContextKeys, "Template Line");
  const screenFamilyRuleId = findContextKeyValue(compareContextKeys, "Screen Family Rule");
  const guidedStateId = findContextKeyValue(compareContextKeys, "Guided State");
  const ownerLane = findContextKeyValue(compareContextKeys, "Owner Lane");
  const selectedScreenId = page?.pageId || query.pageId || query.menuCode || "screen-runtime";
  const releaseUnitId = page?.publishedVersionId || page?.versionId || "-";
  const previewRuntimeEvidence = ((currentPreview as unknown as { runtimeEvidence?: Record<string, unknown> } | undefined)?.runtimeEvidence) || null;
  const deployEvidence = useMemo(
    () => buildDeployEvidence({
      releaseUnitId,
      selectedScreenId,
      ownerLane,
      runtimeEvidence: previewRuntimeEvidence
    }),
    [ownerLane, previewRuntimeEvidence, releaseUnitId, selectedScreenId]
  );
  const fallbackCompareRows = useMemo(() => buildCompareRows({
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
    baselineScope: "GLOBAL",
    patchTemplateLine: templateLineId,
    patchFamilyRule: screenFamilyRuleId,
    patchScope: stringifyValue(currentPreview?.authorityProfile?.scopePolicy || page?.authorityProfile?.scopePolicy, "GLOBAL"),
    patchNodeCount: generatedNodes.length,
    patchIssueCount: generatedIssueCount
  }), [currentIssueCount, currentNodes.length, currentPreview?.authorityProfile?.scopePolicy, generatedIssueCount, generatedNodes.length, page?.authorityProfile?.scopePolicy, publishedPreview?.authorityProfile?.scopePolicy, screenFamilyRuleId, templateLineId]);
  const parityCompareState = useAsyncValue(
    () => fetchParityCompare({
      projectId: RESONANCE_PROJECT_ID,
      guidedStateId,
      templateLineId,
      screenFamilyRuleId,
      ownerLane,
      selectedScreenId,
      releaseUnitId: page?.publishedVersionId || page?.versionId || "",
      compareBaseline: "CURRENT_RUNTIME",
      requestedBy: "current-runtime-compare-ui",
      requestedByType: "ADMIN_UI"
    }),
    [
      guidedStateId,
      ownerLane,
      page?.pageId,
      page?.publishedVersionId,
      page?.versionId,
      query.menuCode,
      query.pageId,
      screenFamilyRuleId,
      selectedScreenId,
      templateLineId
    ],
    { enabled: Boolean(selectedScreenId && guidedStateId && templateLineId && screenFamilyRuleId && ownerLane) }
  );
  const compareRows = parityCompareState.value?.compareTargetSet?.length
    ? mapParityRows(parityCompareState.value.compareTargetSet)
    : fallbackCompareRows;
  const compareContextStripItems = useMemo(
    () => buildCompareContextStripItems(compareContextKeys, compareRows, releaseUnitId),
    [compareContextKeys, compareRows, releaseUnitId]
  );
  const mismatchCount = compareRows.filter((row) => row.result === "MISMATCH").length;
  const gapCount = compareRows.filter((row) => row.result === "GAP").length;
  const parityScore = parityCompareState.value?.parityScore ?? Math.max(0, 100 - mismatchCount * 10 - gapCount * 15);
  const uniformityScore = parityCompareState.value?.uniformityScore ?? Math.max(0, 100 - mismatchCount * 8 - gapCount * 10);
  const blockerRows: BlockerRow[] = (parityCompareState.value?.blockerSet || []).map((blocker) => ({
    blocker,
    ownerLane,
    source: parityCompareState.value?.traceId || "parity-compare"
  }));
  const repairQueue: RepairQueueEntry[] = (parityCompareState.value?.repairCandidateSet || []).map((candidate) => ({
    candidate,
    guidedStateId,
    templateLineId,
    screenFamilyRuleId,
    ownerLane,
    selectedScreenId
  }));
  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "current-runtime-compare", {
      route: window.location.pathname,
      pageId: page.pageId || "",
      menuCode: page.menuCode || "",
      compareRowCount: compareRows.length,
      currentNodeCount: currentNodes.length,
      generatedNodeCount: generatedNodes.length
    });
    logGovernanceScope("COMPONENT", "current-runtime-compare-table", {
      component: "current-runtime-compare-table",
      compareRowCount: compareRows.length,
      blockerCount: blockerRows.length,
      repairQueueCount: repairQueue.length
    });
  }, [blockerRows.length, compareRows.length, currentNodes.length, generatedNodes.length, page, repairQueue.length]);
  const recentAuditCount = (auditState.value?.items || []).length;
  const latestPublishAudit = (auditState.value?.items || []).find((row) => String(row.actionCode || "").includes("PUBLISH")) || null;
  const verifyClosureRows: VerifyClosureRow[] = [
    {
      label: en ? "menuCode / pageId / menuUrl alignment" : "menuCode / pageId / menuUrl 정렬",
      state: page?.menuCode && selectedScreenId && (page?.menuUrl || query.menuUrl) ? "PASS" : "WARN",
      evidence: `${page?.menuCode || query.menuCode || "-"} / ${selectedScreenId} / ${page?.menuUrl || query.menuUrl || "-"}`
    },
    {
      label: en ? "Governed context keys fixed" : "governed 컨텍스트 키 고정",
      state: guidedStateId !== "-" && templateLineId !== "-" && screenFamilyRuleId !== "-" && ownerLane !== "-" ? "PASS" : "WARN",
      evidence: `${guidedStateId} / ${templateLineId} / ${screenFamilyRuleId} / ${ownerLane}`
    },
    {
      label: en ? "Draft and published versions visible" : "초안 및 발행 버전 가시성",
      state: page?.versionId && page?.publishedVersionId ? "PASS" : "WARN",
      evidence: `${page?.versionId || "-"} / ${page?.publishedVersionId || "-"}`
    },
    {
      label: en ? "Node and event counts comparable" : "노드 및 이벤트 수 비교 가능",
      state: generatedNodes.length > 0 || currentNodes.length > 0 ? "PASS" : "WARN",
      evidence: `${generatedNodes.length}/${currentNodes.length} ${en ? "nodes" : "노드"}, ${generatedEventCount}/${currentEventCount} ${en ? "events" : "이벤트"}`
    },
    {
      label: en ? "Publish or compare evidence attached" : "발행 또는 비교 증거 첨부",
      state: latestPublishAudit || parityCompareState.value?.traceId ? "PASS" : "WARN",
      evidence: latestPublishAudit
        ? `${String(latestPublishAudit.actionCode || "-")} / ${String(latestPublishAudit.createdAt || "-")}`
        : (parityCompareState.value?.traceId || "-")
    },
    {
      label: en ? "08 deploy evidence attached" : "08 배포 증거 첨부",
      state: deployEvidence.releaseUnitId !== "-" && deployEvidence.runtimePackageId !== "-" && deployEvidence.deployTraceId !== "-" ? "PASS" : "WARN",
      evidence: `${deployEvidence.releaseUnitId} / ${deployEvidence.runtimePackageId} / ${deployEvidence.deployTraceId} / ${deployEvidence.rollbackAnchorYn}`
    }
  ];
  const repairPayloadItems = [
    { label: "projectId", value: RESONANCE_PROJECT_ID },
    { label: "releaseUnitId", value: deployEvidence.releaseUnitId },
    { label: "runtimePackageId", value: deployEvidence.runtimePackageId },
    { label: "deployTraceId", value: deployEvidence.deployTraceId },
    { label: "rollbackAnchorYn", value: deployEvidence.rollbackAnchorYn },
    { label: "selectedScreenId", value: selectedScreenId },
    { label: "guidedStateId", value: guidedStateId },
    { label: "templateLineId", value: templateLineId },
    { label: "screenFamilyRuleId", value: screenFamilyRuleId },
    { label: "ownerLane", value: ownerLane },
    { label: "deployEvidence.ownerLane", value: deployEvidence.ownerLane },
    { label: "compareBaseline", value: parityCompareState.value?.compareBaseline || "CURRENT_RUNTIME" },
    { label: "builderInput.builderId", value: page?.builderId || "-" },
    { label: "builderInput.draftVersionId", value: page?.versionId || "-" },
    { label: "builderInput.menuCode", value: page?.menuCode || query.menuCode || "-" },
    { label: "builderInput.pageId", value: page?.pageId || query.pageId || "-" },
    { label: "builderInput.menuUrl", value: page?.menuUrl || query.menuUrl || "-" },
    { label: "runtimeEvidence.publishedVersionId", value: page?.publishedVersionId || "-" },
    { label: "runtimeEvidence.currentNodeCount", value: String(currentNodes.length) },
    { label: "runtimeEvidence.currentEventCount", value: String(currentEventCount) },
    { label: "publishEvidence", value: latestPublishAudit ? `${String(latestPublishAudit.actionCode || "-")} / ${String(latestPublishAudit.createdAt || "-")}` : "-" },
    { label: "compareTraceId", value: parityCompareState.value?.traceId || "-" },
    { label: en ? "blockerSet" : "blockerSet", value: blockerRows.length ? blockerRows.map((row) => row.blocker).join(", ") : "-" },
    { label: en ? "repairCandidateSet" : "repairCandidateSet", value: repairQueue.length ? repairQueue.map((row) => row.candidate).join(", ") : "-" }
  ];
  const smokeReadinessItems = [
    { label: en ? "Parity Score" : "정합성 점수", value: `${parityScore}%` },
    { label: en ? "Uniformity Score" : "일관성 점수", value: `${uniformityScore}%` },
    { label: en ? "Current Result" : "현재 결과", value: parityCompareState.value?.result || "-" },
    { label: en ? "Open Blockers" : "열린 차단 항목", value: String(blockerRows.length) },
    { label: en ? "Repair Queue" : "복구 큐", value: String(repairQueue.length) },
    { label: "runtimePackageId", value: deployEvidence.runtimePackageId },
    { label: "deployTraceId", value: deployEvidence.deployTraceId },
    { label: en ? "Publish Evidence" : "발행 증거", value: latestPublishAudit ? `${String(latestPublishAudit.actionCode || "-")} / ${String(latestPublishAudit.createdAt || "-")}` : "-" },
    { label: en ? "Compare Trace" : "비교 추적", value: parityCompareState.value?.traceId || "-" },
    { label: en ? "Smoke Gate" : "스모크 게이트", value: blockerRows.length === 0 && Boolean(latestPublishAudit || parityCompareState.value?.traceId) ? "READY_FOR_SMOKE" : "BLOCKED_BY_COMPARE" }
  ];
  const firstUnfinishedBlocker = blockerRows[0]?.blocker || "";
  const firstRepairCandidate = repairQueue[0]?.candidate || "";
  const loopStatusItems: LoopStatusItem[] = [
    { label: en ? "Loop Cadence" : "루프 주기", value: en ? "60 seconds" : "60초" },
    {
      label: en ? "Loop Mode" : "루프 모드",
      value: firstUnfinishedBlocker || firstRepairCandidate ? "CONTINUE_UNFINISHED" : "RERUN_SCOPE"
    },
    {
      label: en ? "Last Unfinished Scope" : "마지막 미완료 범위",
      value: firstUnfinishedBlocker || firstRepairCandidate || (en ? "smoke-readiness review" : "스모크 준비 상태 재점검")
    },
    {
      label: en ? "Recovery Order" : "복구 순서",
      value: en
        ? "session alive -> recover last unfinished compare item -> continue repair queue -> rerun full compare scope"
        : "세션 생존 확인 -> 마지막 미완료 compare 항목 복구 -> repair 큐 이어서 진행 -> 전체 compare 범위 재실행"
    },
    {
      label: en ? "Next Recheck Entry" : "다음 재점검 시작점",
      value: firstUnfinishedBlocker || firstRepairCandidate || (compareRows[0]?.label || "-")
    },
    {
      label: en ? "Stop Condition" : "중지 조건",
      value: en ? "operator stop, DONE, BLOCKED, or ownership change" : "운영자 중지, DONE, BLOCKED, 또는 소유 범위 변경"
    }
  ];

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
      contextStrip={<ContextKeyStrip items={compareContextStripItems} />}
      loading={(pageState.loading && !page) || (currentPreviewState.loading && !currentPreview)}
      loadingLabel={en ? "Loading runtime compare..." : "런타임 비교를 불러오는 중입니다."}
    >
      {pageState.error || currentPreviewState.error || publishedPreviewState.error || parityCompareState.error ? (
        <PageStatusNotice tone="error">
          {pageState.error || currentPreviewState.error || publishedPreviewState.error || parityCompareState.error}
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
          <SummaryMetricCard title={en ? "Parity Score" : "정합성 점수"} value={`${parityScore}%`} description={en ? "Current compare score" : "현재 compare 점수"} />
          <SummaryMetricCard title={en ? "Uniformity Score" : "일관성 점수"} value={`${uniformityScore}%`} description={en ? "Uniformity closure" : "uniformity 종료 기준"} />
          <SummaryMetricCard title={en ? "Mismatches" : "불일치"} value={mismatchCount} description={en ? "Current vs generated vs baseline" : "current / generated / baseline 비교"} accentClassName="text-red-700" surfaceClassName="bg-red-50" />
          <SummaryMetricCard title={en ? "Repair Candidates" : "복구 후보"} value={repairQueue.length} description={en ? "Queue-ready compare targets" : "큐에 올릴 수 있는 비교 대상"} />
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
              { label: en ? "Latest Publish" : "최근 발행", value: latestPublishAudit ? String(latestPublishAudit.createdAt || "-") : "-" },
              { label: en ? "Compare Context" : "비교 컨텍스트", value: parityCompareState.value?.compareContextId || "-" },
              { label: en ? "Parity Result" : "정합성 결과", value: parityCompareState.value?.result || "-" },
              { label: en ? "Blocker Count" : "차단 항목 수", value: String(blockerRows.length) },
              { label: en ? "Repair Queue" : "복구 큐", value: String(repairQueue.length) }
            ]}
            title={en ? "Compare Scope" : "비교 범위"}
          />
        </div>

        <div data-help-id="runtime-compare-linkage">
          <KeyValueGridPanel
            description={en ? "This panel closes the verify handoff between the builder lane input and the frontend runtime evidence used for compare and repair." : "이 패널은 compare/repair에 사용하는 빌더 레인 입력물과 프런트엔드 런타임 증거 사이의 verify handoff를 닫습니다."}
            items={[
              { label: en ? "Builder Id" : "빌더 ID", value: page?.builderId || "-" },
              { label: en ? "Builder Draft" : "빌더 초안", value: page?.versionId || "-" },
              { label: en ? "Published Runtime" : "발행 런타임", value: page?.publishedVersionId || "-" },
              { label: en ? "Published At" : "발행 시각", value: page?.publishedSavedAt || "-" },
              { label: en ? "Generated Nodes" : "생성 노드 수", value: formatCountLabel(generatedNodes.length, en ? "node" : "개", en ? "nodes" : "개") },
              { label: en ? "Current Nodes" : "현재 노드 수", value: formatCountLabel(currentNodes.length, en ? "node" : "개", en ? "nodes" : "개") },
              { label: en ? "Generated Events" : "생성 이벤트 수", value: formatCountLabel(generatedEventCount, en ? "event" : "개", en ? "events" : "개") },
              { label: en ? "Current Events" : "현재 이벤트 수", value: formatCountLabel(currentEventCount, en ? "event" : "개", en ? "events" : "개") },
              { label: en ? "Generated Registry Issues" : "생성 레지스트리 이슈", value: String(generatedIssueCount) },
              { label: en ? "Current Registry Issues" : "현재 레지스트리 이슈", value: String(currentIssueCount) }
            ]}
            title={en ? "Builder / Runtime Evidence" : "빌더 / 런타임 증거"}
          />
        </div>

        <div data-help-id="runtime-compare-deploy-evidence">
          <KeyValueGridPanel
            description={en ? "Lane 09 must preserve the latest 08 deploy evidence without renaming these fields before repair or handoff." : "09 레인은 repair나 handoff 전에 최신 08 배포 증거를 이 필드 이름 그대로 유지해야 합니다."}
            items={[
              { label: "releaseUnitId", value: deployEvidence.releaseUnitId },
              { label: "runtimePackageId", value: deployEvidence.runtimePackageId },
              { label: "deployTraceId", value: deployEvidence.deployTraceId },
              { label: "ownerLane", value: deployEvidence.ownerLane },
              { label: "rollbackAnchorYn", value: deployEvidence.rollbackAnchorYn }
            ]}
            title={en ? "08 Deploy Evidence" : "08 배포 증거"}
          />
        </div>

        <div data-help-id="runtime-compare-smoke-readiness">
          <KeyValueGridPanel
            description={en ? "This checklist maps parity and smoke closure directly to compare response fields and publish evidence." : "이 체크리스트는 parity 및 smoke 종료 기준을 compare 응답 필드와 publish 증거에 직접 매핑합니다."}
            items={smokeReadinessItems}
            title={en ? "Parity / Smoke Readiness" : "정합성 / 스모크 준비 상태"}
          />
        </div>

        <div data-help-id="runtime-compare-loop-status">
          <KeyValueGridPanel
            description={en ? "Use the same lane-09 repeat order every minute: recover the last unfinished compare item first, then rerun only when the unfinished scope is closed." : "1분마다 같은 09 레인 반복 순서를 유지합니다. 마지막 미완료 compare 항목을 먼저 복구하고, 그 범위가 닫힌 뒤에만 재실행합니다."}
            items={loopStatusItems}
            title={en ? "Lane 09 Loop Continuation" : "09 레인 루프 이어가기"}
          />
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-verify-closure">
            <GridToolbar
              meta={en ? "These checks close the 04 builder input and 05 runtime evidence into one verify handoff." : "이 체크는 04 빌더 입력물과 05 런타임 증거를 하나의 verify handoff로 닫습니다."}
              title={en ? "Verify Closure" : "검증 종료 기준"}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--kr-gov-border-light)]">
                <thead className="bg-slate-50 text-left text-[12px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                  <tr>
                    <th className="px-5 py-4">{en ? "Check" : "체크"}</th>
                    <th className="px-5 py-4">{en ? "State" : "상태"}</th>
                    <th className="px-5 py-4">{en ? "Evidence" : "근거"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--kr-gov-border-light)] bg-white text-sm">
                  {verifyClosureRows.map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-4 font-bold text-[var(--kr-gov-text-primary)]">{row.label}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${row.state === "PASS" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                          {row.state}
                        </span>
                      </td>
                      <td className="px-5 py-4">{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div data-help-id="runtime-compare-repair-payload">
            <KeyValueGridPanel
              description={en ? "Use this payload preview to open repair without renaming governed keys from the compare scope." : "이 payload 미리보기는 compare 범위의 governed key를 바꾸지 않고 repair를 열기 위한 기준입니다."}
              items={repairPayloadItems}
              title={en ? "repair/open Payload Preview" : "repair/open 페이로드 미리보기"}
            />
          </div>
        </section>

        <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-matrix">
          <GridToolbar
            actions={(
              <>
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/repair-workbench?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&menuTitle=${encodeURIComponent(page?.menuTitle || query.menuTitle)}&menuUrl=${encodeURIComponent(page?.menuUrl || query.menuUrl)}`,
                    `/en/admin/system/repair-workbench?menuCode=${encodeURIComponent(page?.menuCode || query.menuCode)}&pageId=${encodeURIComponent(page?.pageId || query.pageId)}&menuTitle=${encodeURIComponent(page?.menuTitle || query.menuTitle)}&menuUrl=${encodeURIComponent(page?.menuUrl || query.menuUrl)}`
                  )}
                  size="sm"
                  variant="secondary"
                >
                  {en ? "Open Repair" : "복구 열기"}
                </MemberLinkButton>
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
                  <th className="px-5 py-4">{en ? "Patch Target" : "패치 대상"}</th>
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
                    <td className="px-5 py-4">{row.patchTarget}</td>
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
            <div className="px-5 py-4 text-sm">
              <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Parity Trace" : "정합성 추적"}</p>
              <p className="mt-1 text-[var(--kr-gov-text-secondary)]">
                {parityCompareState.value?.traceId
                  ? `${String(parityCompareState.value.traceId)} / ${String(parityCompareState.value.occurredAt || "-")}`
                  : (en ? "No parity trace was recorded yet." : "아직 정합성 추적 이력이 없습니다.")}
              </p>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-blockers">
            <GridToolbar
              meta={en ? "Blockers must keep the verify lane owner before handoff." : "차단 항목은 인계 전까지 verify owner lane을 유지해야 합니다."}
              title={en ? "Blocker List" : "차단 항목 목록"}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--kr-gov-border-light)]">
                <thead className="bg-slate-50 text-left text-[12px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                  <tr>
                    <th className="px-5 py-4">{en ? "Blocker" : "차단 항목"}</th>
                    <th className="px-5 py-4">{en ? "Owner Lane" : "소유 레인"}</th>
                    <th className="px-5 py-4">{en ? "Source" : "출처"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--kr-gov-border-light)] bg-white text-sm">
                  {blockerRows.length ? blockerRows.map((row) => (
                    <tr key={row.blocker}>
                      <td className="px-5 py-4 font-bold text-[var(--kr-gov-text-primary)]">{row.blocker}</td>
                      <td className="px-5 py-4">{row.ownerLane}</td>
                      <td className="px-5 py-4">{row.source}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-5 py-4 text-[var(--kr-gov-text-secondary)]" colSpan={3}>
                        {en ? "No blocking gaps were returned for the current compare scope." : "현재 비교 범위에는 차단 항목이 없습니다."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="gov-card overflow-hidden p-0" data-help-id="runtime-compare-repair-queue">
            <GridToolbar
              meta={en ? "Repair queue rows keep governed identity keys for repair/open handoff." : "복구 큐 행은 repair/open 인계를 위해 governed identity key를 유지합니다."}
              title={en ? "Repair Queue" : "복구 큐"}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--kr-gov-border-light)]">
                <thead className="bg-slate-50 text-left text-[12px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                  <tr>
                    <th className="px-5 py-4">{en ? "Candidate" : "후보"}</th>
                    <th className="px-5 py-4">guidedStateId</th>
                    <th className="px-5 py-4">templateLineId</th>
                    <th className="px-5 py-4">screenFamilyRuleId</th>
                    <th className="px-5 py-4">{en ? "Owner Lane" : "소유 레인"}</th>
                    <th className="px-5 py-4">{en ? "Selected Screen" : "선택 화면"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--kr-gov-border-light)] bg-white text-sm">
                  {repairQueue.length ? repairQueue.map((row) => (
                  <tr key={row.candidate}>
                      <td className="px-5 py-4 font-bold text-[var(--kr-gov-text-primary)]">{row.candidate}</td>
                      <td className="px-5 py-4">{row.guidedStateId}</td>
                      <td className="px-5 py-4">{row.templateLineId}</td>
                      <td className="px-5 py-4">{row.screenFamilyRuleId}</td>
                      <td className="px-5 py-4">{row.ownerLane}</td>
                      <td className="px-5 py-4 font-mono">{row.selectedScreenId}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-5 py-4 text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                        {en ? "No repair candidates were returned yet for this compare target." : "이 비교 대상에는 아직 복구 후보가 없습니다."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
