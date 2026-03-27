import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchAuditEvents } from "../../lib/api/observability";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  RESONANCE_PROJECT_ID,
  fetchParityCompare,
  fetchRepairApply,
  fetchRepairOpen,
  type ResonanceParityCompareRow,
  type ResonanceRepairApplyResponse,
  type ResonanceRepairOpenResponse
} from "../../lib/api/resonanceControlPlane";
import { fetchScreenBuilderPage, fetchScreenBuilderPreview } from "../../lib/api/screenBuilder";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import {
  AdminSelect,
  AdminTextarea,
  GridToolbar,
  KeyValueGridPanel,
  MemberButton,
  MemberLinkButton,
  PageStatusNotice,
  SummaryMetricCard
} from "../admin-ui/common";
import { resolveRepairWorkbenchContextKeys } from "../admin-ui/contextKeyPresets";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { resolveScreenBuilderQuery, sortScreenBuilderNodes } from "./shared/screenBuilderUtils";

type CompareRow = {
  label: string;
  current: string;
  generated: string;
  baseline: string;
  patchTarget: string;
  result: "MATCH" | "MISMATCH" | "GAP";
};

function stringifyValue(value: unknown, empty = "-") {
  const normalized = String(value || "").trim();
  return normalized || empty;
}

function findContextKeyValue(items: Array<{ label: string; value: string }>, label: string, empty = "-") {
  return items.find((item) => item.label === label)?.value || empty;
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

function toneClassName(value: string) {
  if (value === "MATCH" || value === "PASS" || value === "APPLIED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (value === "GAP" || value === "WARN" || value === "REVIEW_REQUIRED") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-red-100 text-red-700";
}

function toList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return [];
}

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

type LoopStatusItem = {
  label: string;
  value: string;
};

function buildRepairContextStripItems(
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

function normalizeToken(value: string, fallback: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function buildDeployEvidence(options: {
  releaseUnitId: string;
  selectedScreenId: string;
  ownerLane: string;
  runtimeEvidence?: Record<string, unknown> | null;
  artifactEvidence?: Record<string, unknown> | null;
}) {
  const runtimeEvidence = options.runtimeEvidence || {};
  const artifactEvidence = options.artifactEvidence || {};
  const releaseUnitId = stringifyValue(artifactEvidence.releaseUnitId || options.releaseUnitId);
  const selectedScreenToken = normalizeToken(options.selectedScreenId, "screen-runtime");

  return {
    releaseUnitId,
    runtimePackageId: stringifyValue(artifactEvidence.runtimePackageId || runtimeEvidence.runtimePackageId, `runtime-package-${selectedScreenToken}`),
    deployTraceId: stringifyValue(artifactEvidence.deployTraceId || runtimeEvidence.deployTraceId, `deploy-trace-${normalizeToken(releaseUnitId, "release-unit")}-${selectedScreenToken}`),
    ownerLane: stringifyValue(runtimeEvidence.ownerLane, options.ownerLane),
    rollbackAnchorYn: stringifyValue(runtimeEvidence.rollbackAnchorYn, "Y")
  };
}

export function RepairWorkbenchMigrationPage() {
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

  const compareContextKeys = useMemo(() => resolveRepairWorkbenchContextKeys({
    menuUrl: page?.menuUrl || query.menuUrl,
    templateType: currentPreviewState.value?.templateType || publishedPreviewState.value?.templateType || page?.templateType
  }), [currentPreviewState.value?.templateType, page?.menuUrl, page?.templateType, publishedPreviewState.value?.templateType, query.menuUrl]);
  const guidedStateId = findContextKeyValue(compareContextKeys, "Guided State");
  const templateLineId = findContextKeyValue(compareContextKeys, "Template Line");
  const screenFamilyRuleId = findContextKeyValue(compareContextKeys, "Screen Family Rule");
  const ownerLane = findContextKeyValue(compareContextKeys, "Owner Lane");
  const selectedScreenId = page?.pageId || query.pageId || query.menuCode || "screen-runtime";
  const artifactEvidence = publishedPreviewState.value?.artifactEvidence || currentPreviewState.value?.artifactEvidence || page?.artifactEvidence || null;
  const releaseUnitId = stringifyValue(page?.releaseUnitId || publishedPreviewState.value?.releaseUnitId || currentPreviewState.value?.releaseUnitId || page?.publishedVersionId || page?.versionId || selectedScreenId);
  const generatedNodes = useMemo(() => sortScreenBuilderNodes(currentPreviewState.value?.nodes || page?.nodes || []), [currentPreviewState.value?.nodes, page?.nodes]);
  const currentNodes = useMemo(() => sortScreenBuilderNodes(publishedPreviewState.value?.nodes || []), [publishedPreviewState.value?.nodes]);
  const generatedEventCount = currentPreviewState.value?.events?.length || page?.events?.length || 0;
  const currentEventCount = publishedPreviewState.value?.events?.length || 0;
  const compareState = useAsyncValue(
    () => fetchParityCompare({
      projectId: RESONANCE_PROJECT_ID,
      guidedStateId,
      templateLineId,
      screenFamilyRuleId,
      ownerLane,
      selectedScreenId,
      releaseUnitId,
      compareBaseline: "CURRENT_RUNTIME",
      requestedBy: "repair-workbench-ui",
      requestedByType: "ADMIN_UI"
    }),
    [guidedStateId, ownerLane, releaseUnitId, screenFamilyRuleId, selectedScreenId, templateLineId],
    { enabled: Boolean(guidedStateId && templateLineId && screenFamilyRuleId && ownerLane && selectedScreenId) }
  );

  const compareRows = compareState.value?.compareTargetSet?.length ? mapParityRows(compareState.value.compareTargetSet) : [];
  const repairContextStripItems = useMemo(
    () => buildRepairContextStripItems(compareContextKeys, compareRows, releaseUnitId),
    [compareContextKeys, compareRows, releaseUnitId]
  );
  const fallbackCandidates = compareRows.filter((row) => row.result !== "MATCH").map((row) => row.label.toLowerCase().replace(/\s+/g, "-"));
  const selectedElementSet = compareState.value?.repairCandidateSet?.length ? compareState.value.repairCandidateSet : fallbackCandidates;
  const reuseRecommendationSet = [
    "common-bottom-action-bar-v2",
    "help-anchor-bundle-join-v2",
    "spacing-profile:public-form-comfortable:v2"
  ];
  const requiredContractSet = [
    "page-design.json",
    "page-assembly.json",
    "backend-chain-manifest"
  ];
  const builderInput = {
    builderId: page?.builderId || selectedScreenId,
    draftVersionId: page?.versionId || "-",
    menuCode: page?.menuCode || query.menuCode || selectedScreenId,
    pageId: selectedScreenId,
    menuUrl: page?.menuUrl || query.menuUrl || "-"
  };
  const runtimeEvidence = {
    publishedVersionId: stringifyValue(artifactEvidence?.publishedVersionId, page?.publishedVersionId || "-"),
    currentRuntimeTraceId: compareState.value?.traceId || "runtime-compare-trace",
    currentNodeCount: currentNodes.length,
    currentEventCount
  };
  const latestPublishAudit = (auditState.value?.items || []).find((row) => String(row.actionCode || "").includes("PUBLISH")) || null;
  const [openingRepair, setOpeningRepair] = useState(false);
  const [repairOpenResponse, setRepairOpenResponse] = useState<ResonanceRepairOpenResponse | null>(null);
  const [openError, setOpenError] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");
  const [applyingRepair, setApplyingRepair] = useState(false);
  const [repairApplyResponse, setRepairApplyResponse] = useState<ResonanceRepairApplyResponse | null>(null);
  const [publishMode, setPublishMode] = useState("REVIEW_READY");
  const [changeSummary, setChangeSummary] = useState(
    "Close runtime compare blockers by aligning governed action layout, help anchors, and builder/runtime evidence before parity recheck."
  );
  const previewRuntimeEvidence = ((currentPreviewState.value as unknown as { runtimeEvidence?: Record<string, unknown> } | undefined)?.runtimeEvidence) || null;
  const repairRuntimeEvidence = (repairOpenResponse?.runtimeEvidence || repairApplyResponse?.runtimeEvidence || previewRuntimeEvidence || null) as Record<string, unknown> | null;
  const deployEvidence = useMemo(
    () => buildDeployEvidence({
      releaseUnitId,
      selectedScreenId,
      ownerLane,
      runtimeEvidence: repairRuntimeEvidence,
      artifactEvidence
    }),
    [artifactEvidence, ownerLane, releaseUnitId, repairRuntimeEvidence, selectedScreenId]
  );

  useEffect(() => {
    logGovernanceScope("PAGE", "repair-workbench", {
      language: en ? "en" : "ko",
      selectedScreenId,
      releaseUnitId,
      compareRowCount: compareRows.length,
      selectedElementCount: selectedElementSet.length,
      openingRepair,
      applyingRepair
    });
    logGovernanceScope("COMPONENT", "repair-workbench-compare", {
      compareRowCount: compareRows.length,
      auditCount: (auditState.value?.items || []).length,
      latestTrace: compareState.value?.traceId || "-"
    });
  }, [
    (auditState.value?.items || []).length,
    applyingRepair,
    compareRows.length,
    compareState.value?.traceId,
    en,
    openingRepair,
    releaseUnitId,
    selectedElementSet.length,
    selectedScreenId
  ]);

  async function handleOpenRepair() {
    logGovernanceScope("ACTION", "repair-workbench-open", {
      selectedScreenId,
      releaseUnitId,
      selectedElementCount: selectedElementSet.length
    });
    setOpeningRepair(true);
    setOpenError("");
    setApplySuccess("");
    try {
      const response = await fetchRepairOpen({
        projectId: RESONANCE_PROJECT_ID,
        releaseUnitId,
        guidedStateId,
        templateLineId,
        screenFamilyRuleId,
        ownerLane,
        selectedScreenId,
        builderInput,
        runtimeEvidence,
        selectedElementSet,
        compareBaseline: compareState.value?.compareBaseline || "CURRENT_RUNTIME",
        reasonCode: compareState.value?.blockerSet?.length ? "PARITY_GAP" : "RUNTIME_DRIFT",
        existingAssetReuseSet: reuseRecommendationSet,
        requestedBy: "repair-workbench-ui",
        requestedByType: "ADMIN_UI",
        requestNote: changeSummary
      });
      setRepairOpenResponse(response);
    } catch (error) {
      setOpenError(error instanceof Error ? error.message : String(error));
    } finally {
      setOpeningRepair(false);
    }
  }

  async function handleApplyRepair() {
    if (!repairOpenResponse) {
      return;
    }
    logGovernanceScope("ACTION", "repair-workbench-apply", {
      selectedScreenId,
      releaseUnitId,
      publishMode
    });
    setApplyingRepair(true);
    setApplyError("");
    setApplySuccess("");
    try {
      const response = await fetchRepairApply({
        repairSessionId: repairOpenResponse.repairSessionId,
        projectId: repairOpenResponse.projectId,
        releaseUnitId: repairOpenResponse.releaseUnitId,
        guidedStateId: repairOpenResponse.guidedStateId,
        templateLineId: repairOpenResponse.templateLineId,
        screenFamilyRuleId: repairOpenResponse.screenFamilyRuleId,
        ownerLane: repairOpenResponse.ownerLane,
        selectedScreenId: repairOpenResponse.selectedScreenId,
        selectedElementSet: repairOpenResponse.selectedElementSet,
        compareBaseline: repairOpenResponse.compareBaseline,
        builderInput: toRecord(repairOpenResponse.builderInput),
        runtimeEvidence: toRecord(repairOpenResponse.runtimeEvidence),
        updatedAssetSet: [
          `page-design:${selectedScreenId}:v4`,
          `page-assembly:${selectedScreenId}:v4`
        ],
        updatedBindingSet: [
          `event-binding:${selectedScreenId}:v2`,
          `function-binding:${selectedScreenId}:v2`
        ],
        updatedThemeOrLayoutSet: [
          "action-layout:detail-footer-standard:v2",
          "help-anchor-bundle:join-v2"
        ],
        sqlDraftSet: [],
        publishMode,
        requestedBy: "repair-workbench-ui",
        requestedByType: "ADMIN_UI",
        changeSummary
      });
      setRepairApplyResponse(response);
      setApplySuccess(response.status);
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : String(error));
    } finally {
      setApplyingRepair(false);
    }
  }

  const blockingGapSet = repairOpenResponse?.blockingGapSet || compareState.value?.blockerSet || [];
  const mismatchCount = compareRows.filter((row) => row.result === "MISMATCH").length;
  const latestTrace = repairApplyResponse?.traceId || repairOpenResponse?.traceId || compareState.value?.traceId || "-";
  const parityRecheckRequired = repairApplyResponse?.parityRecheckRequiredYn ?? true;
  const uniformityRecheckRequired = repairApplyResponse?.uniformityRecheckRequiredYn ?? true;
  const smokeRequired = repairApplyResponse?.smokeRequiredYn ?? (publishMode !== "DRAFT_ONLY");
  const closureChecklistItems = [
    { label: en ? "Blocking Gaps" : "차단 gap", value: blockingGapSet.length ? blockingGapSet.join(", ") : (en ? "0 open blockers" : "열린 차단 항목 0건") },
    { label: en ? "Selected Repair Targets" : "선택 복구 대상", value: selectedElementSet.join(", ") || "-" },
    { label: en ? "Required Contracts" : "필수 계약", value: (repairOpenResponse?.requiredContractSet || requiredContractSet).join(", ") },
    { label: en ? "Reuse Recommendation" : "재사용 권장", value: (repairOpenResponse?.reuseRecommendationSet || reuseRecommendationSet).join(", ") },
    { label: en ? "Parity Recheck" : "정합성 재검증", value: String(parityRecheckRequired) },
    { label: en ? "Uniformity Recheck" : "일관성 재검증", value: String(uniformityRecheckRequired) },
    { label: en ? "Smoke Required" : "스모크 필요 여부", value: String(smokeRequired) },
    { label: en ? "Latest Publish Evidence" : "최근 발행 증거", value: latestPublishAudit ? `${String(latestPublishAudit.actionCode || "-")} / ${String(latestPublishAudit.createdAt || "-")}` : "-" },
    { label: en ? "Closure Gate" : "종료 게이트", value: repairApplyResponse?.status ? (smokeRequired ? "READY_FOR_SMOKE" : "READY_FOR_HANDOFF") : "REPAIR_PENDING" }
  ];
  const handoffReady = Boolean(repairApplyResponse?.status) && blockingGapSet.length === 0 && !parityRecheckRequired && !uniformityRecheckRequired && !smokeRequired;
  const handoffStatus = handoffReady ? "HANDOFF READY" : "IN_PROGRESS";
  const handoffNote = handoffReady
    ? "HANDOFF READY: 01 may continue from parity, compare, repair, and verification outputs cross-checked against 04 builder inputs, 05 frontend runtime results, and 08 deploy evidence; blocker count is 0 for current verification scope."
    : `IN_PROGRESS: 09 verification scope still requires ${[
      blockingGapSet.length ? `${blockingGapSet.length} blocker(s)` : "",
      parityRecheckRequired ? "parity recheck" : "",
      uniformityRecheckRequired ? "uniformity recheck" : "",
      smokeRequired ? "smoke verification" : ""
    ].filter(Boolean).join(", ")}.`;
  const crossLaneEvidenceItems = [
    { label: en ? "04 Builder Input" : "04 빌더 입력", value: `${builderInput.builderId} / ${builderInput.draftVersionId}` },
    { label: en ? "05 Runtime Result" : "05 런타임 결과", value: `${stringifyValue(runtimeEvidence.publishedVersionId)} / nodes ${runtimeEvidence.currentNodeCount} / events ${runtimeEvidence.currentEventCount}` },
    { label: en ? "06 Compare Contract" : "06 비교 계약", value: `${compareState.value?.traceId || "-"} / ${compareState.value?.compareBaseline || "CURRENT_RUNTIME"}` },
    { label: en ? "08 Release Evidence" : "08 릴리즈 증거", value: `${deployEvidence.releaseUnitId} / ${deployEvidence.runtimePackageId} / ${deployEvidence.deployTraceId}` },
    { label: en ? "Owner Lane" : "소유 레인", value: ownerLane },
    { label: en ? "08 Deploy Owner Lane" : "08 배포 소유 레인", value: deployEvidence.ownerLane },
    { label: en ? "Selected Screen" : "선택 화면", value: selectedScreenId }
  ];
  const handoffChecklistItems = [
    { label: en ? "Lane Status" : "레인 상태", value: handoffStatus },
    { label: en ? "Open Blockers" : "열린 차단 항목", value: String(blockingGapSet.length) },
    { label: en ? "Parity Recheck Pending" : "정합성 재검증 대기", value: String(parityRecheckRequired) },
    { label: en ? "Uniformity Recheck Pending" : "일관성 재검증 대기", value: String(uniformityRecheckRequired) },
    { label: en ? "Smoke Pending" : "스모크 대기", value: String(smokeRequired) },
    { label: "ownerLane", value: ownerLane },
    { label: "runtimePackageId", value: deployEvidence.runtimePackageId },
    { label: "deployTraceId", value: deployEvidence.deployTraceId },
    { label: "rollbackAnchorYn", value: deployEvidence.rollbackAnchorYn },
    { label: "deployEvidence.ownerLane", value: deployEvidence.ownerLane },
    { label: en ? "Latest Trace" : "최신 추적", value: latestTrace }
  ];
  const lastUnfinishedRepairItem = blockingGapSet[0]
    || (parityRecheckRequired ? "PARITY_RECHECK" : "")
    || (uniformityRecheckRequired ? "UNIFORMITY_RECHECK" : "")
    || (smokeRequired ? "SMOKE_VERIFICATION" : "")
    || "";
  const loopStatusItems: LoopStatusItem[] = [
    { label: en ? "Loop Cadence" : "루프 주기", value: en ? "60 seconds" : "60초" },
    {
      label: en ? "Loop Mode" : "루프 모드",
      value: handoffReady ? "HANDOFF_MONITOR" : (lastUnfinishedRepairItem ? "CONTINUE_UNFINISHED" : "RERUN_SCOPE")
    },
    {
      label: en ? "Last Unfinished Scope" : "마지막 미완료 범위",
      value: handoffReady ? (en ? "handoff receipt confirmation" : "인계 수신 확인") : (lastUnfinishedRepairItem || "-")
    },
    {
      label: en ? "Recovery Order" : "복구 순서",
      value: en
        ? "session alive -> recover last unfinished repair item -> continue parity/uniformity/smoke gates -> rerun linked verify scope"
        : "세션 생존 확인 -> 마지막 미완료 repair 항목 복구 -> parity/uniformity/smoke 게이트 이어서 진행 -> 연결된 verify 범위 재실행"
    },
    {
      label: en ? "Next Recheck Entry" : "다음 재점검 시작점",
      value: lastUnfinishedRepairItem || latestTrace
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
        { label: en ? "Repair Workbench" : "복구 워크벤치" }
      ]}
      title={en ? "Repair Workbench" : "복구 워크벤치"}
      subtitle={en ? "Carry compare blockers into governed repair/open and repair/apply flows without losing builder/runtime identity." : "compare 차단 항목을 빌더/런타임 식별 키를 유지한 채 governed repair/open과 repair/apply 흐름으로 넘깁니다."}
      contextStrip={<ContextKeyStrip items={repairContextStripItems} />}
      loading={(pageState.loading && !page) || (currentPreviewState.loading && !currentPreviewState.value)}
      loadingLabel={en ? "Loading repair workbench..." : "복구 워크벤치를 불러오는 중입니다."}
    >
      {pageState.error || currentPreviewState.error || publishedPreviewState.error || compareState.error ? (
        <PageStatusNotice tone="error">
          {pageState.error || currentPreviewState.error || publishedPreviewState.error || compareState.error}
        </PageStatusNotice>
      ) : null}
      {openError ? <PageStatusNotice tone="error">{openError}</PageStatusNotice> : null}
      {applyError ? <PageStatusNotice tone="error">{applyError}</PageStatusNotice> : null}
      {applySuccess ? (
        <PageStatusNotice tone="success">
          {en ? `Repair apply completed with status ${applySuccess}.` : `repair apply가 ${applySuccess} 상태로 완료되었습니다.`}
        </PageStatusNotice>
      ) : null}

      <AdminWorkspacePageFrame>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetricCard title={en ? "Compare Blockers" : "비교 차단"} value={blockingGapSet.length} description={en ? "Open repair gaps" : "열린 repair gap"} accentClassName="text-red-700" surfaceClassName="bg-red-50" />
          <SummaryMetricCard title={en ? "Mismatch Rows" : "불일치 행"} value={mismatchCount} description={en ? "Parity drift rows" : "정합성 드리프트"} accentClassName="text-amber-700" surfaceClassName="bg-amber-50" />
          <SummaryMetricCard title={en ? "Repair Targets" : "복구 대상"} value={selectedElementSet.length} description={en ? "Selected repair candidates" : "선택된 복구 후보"} />
          <SummaryMetricCard title={en ? "Required Contracts" : "필수 계약"} value={(repairOpenResponse?.requiredContractSet || requiredContractSet).length} description={en ? "Repair handoff artifacts" : "repair 인계 산출물"} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div data-help-id="repair-workbench-scope">
            <KeyValueGridPanel
              title={en ? "Repair Scope" : "복구 범위"}
              description={en ? "The workbench keeps compare scope, builder input, and runtime evidence on one governed chain." : "이 워크벤치는 compare 범위, builder 입력, runtime 증거를 하나의 governed 체인으로 유지합니다."}
              items={[
                { label: en ? "Menu Code" : "메뉴 코드", value: builderInput.menuCode },
                { label: "pageId", value: builderInput.pageId },
                { label: en ? "Runtime URL" : "런타임 URL", value: builderInput.menuUrl },
                { label: en ? "Release Unit" : "릴리즈 유닛", value: releaseUnitId },
                { label: en ? "Published Runtime" : "발행 런타임", value: stringifyValue(runtimeEvidence.publishedVersionId) },
                { label: en ? "Latest Publish" : "최근 발행", value: latestPublishAudit ? String(latestPublishAudit.createdAt || "-") : "-" },
                { label: en ? "Compare Trace" : "비교 추적", value: compareState.value?.traceId || "-" },
                { label: en ? "Repair Session" : "복구 세션", value: repairOpenResponse?.repairSessionId || "-" },
                { label: en ? "Apply Run" : "적용 실행", value: repairApplyResponse?.repairApplyRunId || "-" },
                { label: en ? "Latest Trace" : "최신 추적", value: latestTrace }
              ]}
            />
          </div>
          <div data-help-id="repair-workbench-linkage">
            <KeyValueGridPanel
              title={en ? "Builder / Runtime Evidence" : "빌더 / 런타임 증거"}
              description={en ? "Selected repair targets should map back to the same builder draft and published runtime snapshot." : "선택된 복구 대상은 동일한 빌더 초안과 발행 런타임 스냅샷으로 되돌아가야 합니다."}
              items={[
                { label: en ? "Builder Id" : "빌더 ID", value: builderInput.builderId },
                { label: en ? "Draft Version" : "초안 버전", value: builderInput.draftVersionId },
                { label: en ? "Published Version" : "발행 버전", value: stringifyValue(runtimeEvidence.publishedVersionId) },
                { label: en ? "Generated Nodes" : "생성 노드", value: String(generatedNodes.length) },
                { label: en ? "Current Nodes" : "현재 노드", value: String(currentNodes.length) },
                { label: en ? "Generated Events" : "생성 이벤트", value: String(generatedEventCount) },
                { label: en ? "Current Events" : "현재 이벤트", value: String(currentEventCount) },
                { label: en ? "Selected Elements" : "선택 요소", value: selectedElementSet.join(", ") || "-" }
              ]}
            />
          </div>
        </section>

        <div data-help-id="repair-workbench-deploy-evidence">
          <KeyValueGridPanel
            title={en ? "08 Deploy Evidence" : "08 배포 증거"}
            description={en ? "Keep the deploy evidence fields from lane 08 unchanged while repair/open, repair/apply, and final handoff stay in progress." : "repair/open, repair/apply, 최종 handoff 동안 08 레인의 배포 증거 필드를 이름 변경 없이 그대로 유지합니다."}
            items={[
              { label: "releaseUnitId", value: deployEvidence.releaseUnitId },
              { label: "runtimePackageId", value: deployEvidence.runtimePackageId },
              { label: "deployTraceId", value: deployEvidence.deployTraceId },
              { label: "ownerLane", value: deployEvidence.ownerLane },
              { label: "rollbackAnchorYn", value: deployEvidence.rollbackAnchorYn }
            ]}
          />
        </div>

        <div data-help-id="repair-workbench-closure-checklist">
          <KeyValueGridPanel
            title={en ? "Parity / Smoke Closure" : "정합성 / 스모크 종료 기준"}
            description={en ? "This panel keeps the repair contract, parity recheck, and smoke verification gates on one governed checklist." : "이 패널은 repair 계약, parity 재검증, smoke 검증 게이트를 하나의 governed 체크리스트로 유지합니다."}
            items={closureChecklistItems}
          />
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div data-help-id="repair-workbench-cross-lane-evidence">
            <KeyValueGridPanel
              title={en ? "Cross-Lane Evidence Mapping" : "교차 레인 증거 매핑"}
              description={en ? "Keep the 04 builder input, 05 runtime result, 06 compare contract, and 08 release evidence on one verify chain before handoff." : "인계 전까지 04 빌더 입력, 05 런타임 결과, 06 비교 계약, 08 릴리즈 증거를 하나의 verify 체인으로 유지합니다."}
              items={crossLaneEvidenceItems}
            />
          </div>
          <div data-help-id="repair-workbench-handoff-readiness">
            <KeyValueGridPanel
              title={en ? "Verification Handoff Readiness" : "검증 인계 준비도"}
              description={en ? "Use this gate before handing 09 outputs back to 01." : "09 산출물을 01로 되돌려 넘기기 전에 이 게이트를 사용합니다."}
              items={handoffChecklistItems}
            />
          </div>
        </section>

        <div data-help-id="repair-workbench-loop-status">
          <KeyValueGridPanel
            title={en ? "Lane 09 Loop Continuation" : "09 레인 루프 이어가기"}
            description={en ? "Keep the existing 09 session attached: recover the last unfinished repair or verify gate first, and rerun the same scope only after the unfinished item closes." : "기존 09 세션에 붙은 상태를 유지합니다. 마지막 미완료 repair 또는 verify 게이트를 먼저 복구하고, 그 항목이 닫힌 뒤에만 같은 범위를 재실행합니다."}
            items={loopStatusItems}
          />
        </div>

        <PageStatusNotice tone={handoffReady ? "success" : "warning"}>
          {handoffNote}
        </PageStatusNotice>

        <section className="gov-card overflow-hidden p-0">
          <GridToolbar
            title={en ? "Compare Drift Matrix" : "비교 드리프트 매트릭스"}
            meta={en ? "Rows returned from parity compare remain the source of truth for repair/open handoff." : "정합성 비교 행은 repair/open 인계의 기준 truth source로 유지됩니다."}
            actions={(
              <>
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/current-runtime-compare?menuCode=${encodeURIComponent(query.menuCode)}&pageId=${encodeURIComponent(query.pageId)}&menuTitle=${encodeURIComponent(query.menuTitle)}&menuUrl=${encodeURIComponent(query.menuUrl)}`,
                    `/en/admin/system/current-runtime-compare?menuCode=${encodeURIComponent(query.menuCode)}&pageId=${encodeURIComponent(query.pageId)}&menuTitle=${encodeURIComponent(query.menuTitle)}&menuUrl=${encodeURIComponent(query.menuUrl)}`
                  )}
                  size="sm"
                  variant="secondary"
                >
                  {en ? "Open Compare" : "비교 열기"}
                </MemberLinkButton>
                <MemberButton disabled={openingRepair || !selectedElementSet.length} onClick={handleOpenRepair} size="sm" type="button">
                  {openingRepair ? (en ? "Opening..." : "여는 중...") : (en ? "Open Repair Session" : "복구 세션 열기")}
                </MemberButton>
              </>
            )}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--kr-gov-border-light)]">
              <thead className="bg-slate-50 text-left text-[12px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                <tr>
                  <th className="px-5 py-4">{en ? "Target" : "대상"}</th>
                  <th className="px-5 py-4">{en ? "Current" : "현재"}</th>
                  <th className="px-5 py-4">{en ? "Generated" : "생성"}</th>
                  <th className="px-5 py-4">{en ? "Baseline" : "기준선"}</th>
                  <th className="px-5 py-4">{en ? "Patch" : "패치"}</th>
                  <th className="px-5 py-4">{en ? "Result" : "결과"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--kr-gov-border-light)] bg-white text-sm">
                {compareRows.length ? compareRows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-4 font-bold text-[var(--kr-gov-text-primary)]">{row.label}</td>
                    <td className="px-5 py-4">{row.current}</td>
                    <td className="px-5 py-4">{row.generated}</td>
                    <td className="px-5 py-4">{row.baseline}</td>
                    <td className="px-5 py-4">{row.patchTarget}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClassName(row.result)}`}>{row.result}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-5 py-4 text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {en ? "No compare rows were returned for this scope yet." : "아직 이 범위에 대한 compare 행이 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="gov-card overflow-hidden p-0">
            <GridToolbar
              title={en ? "Repair Session" : "복구 세션"}
              meta={en ? "repair/open response and governed blocker ownership." : "repair/open 응답과 governed 차단 항목 소유 상태입니다."}
            />
            <div className="divide-y divide-[var(--kr-gov-border-light)] bg-white">
              <div className="grid grid-cols-1 gap-3 px-5 py-4 text-sm md:grid-cols-2">
                <div><p className="text-[var(--kr-gov-text-secondary)]">status</p><p className="mt-1 font-bold"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClassName(repairOpenResponse?.status || "REVIEW_REQUIRED")}`}>{repairOpenResponse?.status || "READY"}</span></p></div>
                <div><p className="text-[var(--kr-gov-text-secondary)]">repairSessionId</p><p className="mt-1 font-bold">{repairOpenResponse?.repairSessionId || "-"}</p></div>
                <div><p className="text-[var(--kr-gov-text-secondary)]">compareSnapshotId</p><p className="mt-1 font-bold">{repairOpenResponse?.compareSnapshotId || "-"}</p></div>
                <div><p className="text-[var(--kr-gov-text-secondary)]">ownerLane</p><p className="mt-1 font-bold">{repairOpenResponse?.ownerLane || ownerLane}</p></div>
              </div>
              <div className="px-5 py-4 text-sm">
                <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Blocking Gaps" : "차단 gap"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {blockingGapSet.length ? blockingGapSet.map((item) => (
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700" key={item}>{item}</span>
                  )) : <span className="text-[var(--kr-gov-text-secondary)]">{en ? "No blockers." : "차단 항목이 없습니다."}</span>}
                </div>
              </div>
              <div className="px-5 py-4 text-sm">
                <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Reuse Recommendations" : "재사용 권장"}</p>
                <ul className="mt-3 space-y-2 text-[var(--kr-gov-text-secondary)]">
                  {(repairOpenResponse?.reuseRecommendationSet || reuseRecommendationSet).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="px-5 py-4 text-sm">
                <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Required Contracts" : "필수 계약"}</p>
                <ul className="mt-3 space-y-2 text-[var(--kr-gov-text-secondary)]">
                  {(repairOpenResponse?.requiredContractSet || requiredContractSet).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="gov-card overflow-hidden p-0">
            <GridToolbar
              title={en ? "Repair Apply" : "복구 적용"}
              meta={en ? "Close the current session into parity recheck and smoke verification readiness." : "현재 세션을 parity 재검증과 smoke 검증 준비 상태로 닫습니다."}
              actions={(
                <MemberButton disabled={!repairOpenResponse || applyingRepair} onClick={handleApplyRepair} size="sm" type="button">
                  {applyingRepair ? (en ? "Applying..." : "적용 중...") : (en ? "Apply Repair" : "복구 적용")}
                </MemberButton>
              )}
            />
            <div className="space-y-4 bg-white px-5 py-4">
              <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)]">
                {en ? "Publish Mode" : "배포 모드"}
                <AdminSelect className="mt-2" onChange={(event) => setPublishMode(event.target.value)} value={publishMode}>
                  <option value="DRAFT_ONLY">DRAFT_ONLY</option>
                  <option value="REVIEW_READY">REVIEW_READY</option>
                  <option value="PUBLISH_READY">PUBLISH_READY</option>
                </AdminSelect>
              </label>
              <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)]">
                {en ? "Change Summary" : "변경 요약"}
                <AdminTextarea className="mt-2 min-h-[120px]" onChange={(event) => setChangeSummary(event.target.value)} value={changeSummary} />
              </label>
              <div className="rounded border border-[var(--kr-gov-border-light)] bg-slate-50 p-4 text-sm">
                <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Apply Result" : "적용 결과"}</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div><p className="text-[var(--kr-gov-text-secondary)]">repairApplyRunId</p><p className="mt-1 font-bold">{repairApplyResponse?.repairApplyRunId || "-"}</p></div>
                  <div><p className="text-[var(--kr-gov-text-secondary)]">updatedReleaseCandidateId</p><p className="mt-1 font-bold">{repairApplyResponse?.updatedReleaseCandidateId || "-"}</p></div>
                  <div><p className="text-[var(--kr-gov-text-secondary)]">parityRecheckRequiredYn</p><p className="mt-1 font-bold">{String(parityRecheckRequired)}</p></div>
                  <div><p className="text-[var(--kr-gov-text-secondary)]">uniformityRecheckRequiredYn</p><p className="mt-1 font-bold">{String(uniformityRecheckRequired)}</p></div>
                  <div><p className="text-[var(--kr-gov-text-secondary)]">smokeRequiredYn</p><p className="mt-1 font-bold">{String(smokeRequired)}</p></div>
                  <div><p className="text-[var(--kr-gov-text-secondary)]">closureGate</p><p className="mt-1 font-bold">{repairApplyResponse?.status ? (smokeRequired ? "READY_FOR_SMOKE" : "READY_FOR_HANDOFF") : "REPAIR_PENDING"}</p></div>
                </div>
                <div className="mt-4">
                  <p className="text-[var(--kr-gov-text-secondary)]">updatedAssetTraceSet</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toList(repairApplyResponse?.updatedAssetTraceSet).length ? toList(repairApplyResponse?.updatedAssetTraceSet).map((item) => (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700" key={item}>{item}</span>
                    )) : <span className="text-[var(--kr-gov-text-secondary)]">{en ? "Apply has not run yet." : "아직 apply가 실행되지 않았습니다."}</span>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
