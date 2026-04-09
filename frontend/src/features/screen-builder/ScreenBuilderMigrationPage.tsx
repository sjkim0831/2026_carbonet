import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { FrameworkAuthorityRoleContract } from "../../framework";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  readBootstrappedScreenBuilderPageData,
  type ScreenCommandPagePayload,
  type ScreenBuilderPagePayload
} from "../../lib/api/client";
import { fetchScreenCommandPage } from "../../lib/api/screenGovernance";
import {
  fetchScreenBuilderPage,
} from "../../lib/api/screenBuilder";
import { buildLocalizedPath, getNavigationEventName, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { authorDesignContextKeys } from "../admin-ui/contextKeyPresets";
import { DiagnosticCard, MemberButton, MemberLinkButton, PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { resolveScreenBuilderQuery } from "./shared/screenBuilderUtils";
import {
  BUILDER_INSTALL_VALIDATOR_CHECKS,
  buildBuilderInstallQueueSummary as buildInstallQueueSummaryFromContract
} from "./shared/installableBuilderContract";
import { useScreenBuilderEditor } from "./hooks/useScreenBuilderEditor";
import { useScreenBuilderGovernanceState } from "./hooks/useScreenBuilderGovernanceState";
import { useScreenBuilderMutations } from "./hooks/useScreenBuilderMutations";
import { useScreenBuilderWorkspaceState } from "./hooks/useScreenBuilderWorkspaceState";

const ScreenBuilderGovernancePanels = lazy(() => import("./panels/ScreenBuilderGovernancePanels"));
const ScreenBuilderEditorPanels = lazy(() => import("./panels/ScreenBuilderEditorPanels"));
const ScreenBuilderOverviewPanels = lazy(() => import("./panels/ScreenBuilderOverviewPanels"));

function readScreenBuilderQueryFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return resolveScreenBuilderQuery({
    get(name: string) {
      return searchParams.get(name);
    }
  });
}

export function ScreenBuilderMigrationPage() {
  const en = isEnglish();
  const [pageQuery, setPageQuery] = useState(() => readScreenBuilderQueryFromLocation());
  const bootstrappedPayload = useMemo(() => readBootstrappedScreenBuilderPageData(), []);
  const initialPayload = useMemo(() => {
    if (!bootstrappedPayload) {
      return null;
    }
    const payloadMenuCode = String(bootstrappedPayload.menuCode || "");
    const payloadPageId = String(bootstrappedPayload.pageId || "");
    const payloadMenuUrl = String(bootstrappedPayload.menuUrl || "");
    const queryMenuCode = String(pageQuery.menuCode || "");
    const queryPageId = String(pageQuery.pageId || "");
    const queryMenuUrl = String(pageQuery.menuUrl || "");
    const matchesMenuCode = !queryMenuCode || payloadMenuCode === queryMenuCode;
    const matchesPageId = !queryPageId || payloadPageId === queryPageId;
    const matchesMenuUrl = !queryMenuUrl || payloadMenuUrl === queryMenuUrl;
    return matchesMenuCode && matchesPageId && matchesMenuUrl ? bootstrappedPayload : null;
  }, [bootstrappedPayload, pageQuery.menuCode, pageQuery.menuUrl, pageQuery.pageId]);

  useEffect(() => {
    function syncScreenBuilderQuery() {
      setPageQuery(readScreenBuilderQueryFromLocation());
    }

    const navigationEventName = getNavigationEventName();
    window.addEventListener(navigationEventName, syncScreenBuilderQuery);
    window.addEventListener("popstate", syncScreenBuilderQuery);
    return () => {
      window.removeEventListener(navigationEventName, syncScreenBuilderQuery);
      window.removeEventListener("popstate", syncScreenBuilderQuery);
    };
  }, []);

  const pageState = useAsyncValue<ScreenBuilderPagePayload>(
    () => fetchScreenBuilderPage(pageQuery),
    [pageQuery.menuCode, pageQuery.pageId, pageQuery.menuTitle, pageQuery.menuUrl],
    {
      initialValue: initialPayload,
      skipInitialLoad: Boolean(initialPayload)
    }
  );
  const page = pageState.value;
  const [draftAuthorityProfile, setDraftAuthorityProfile] = useState<ScreenBuilderPagePayload["authorityProfile"] | null>(null);
  const commandState = useAsyncValue<ScreenCommandPagePayload>(
    () => (page?.pageId ? fetchScreenCommandPage(page.pageId) : Promise.resolve({ selectedPageId: "", pages: [], page: {} as ScreenCommandPagePayload["page"] })),
    [page?.pageId || ""],
    { enabled: Boolean(page?.pageId) }
  );
  const {
    addAiNodeTreeRow,
    aiNodeTreeRows,
    autoReplacePreviewItems,
    componentRegistry,
    copiedButtonStyleId,
    copyButtonStyleId,
    message,
    previewLoading,
    previewMessage,
    previewMode,
    previewNodes,
    registryEditorDescription,
    registryEditorLabel,
    registryEditorPropsJson,
    registryEditorReplacementId,
    registryEditorStatus,
    registryEditorType,
    registryScanRows,
    registryStatusFilter,
    registryTypeFilter,
    registryUsageLoading,
    registryUsagePreviewMap,
    registryUsageRows,
    removeAiNodeTreeRow,
    saveError,
    saving,
    selectedRegistryComponentId,
    selectedTemplateType,
    setAutoReplacePreviewItems,
    setComponentRegistry,
    setMessage,
    setPreviewLoading,
    setPreviewMessage,
    setPreviewMode,
    setPreviewNodes,
    setRegistryEditorDescription,
    setRegistryEditorLabel,
    setRegistryEditorPropsJson,
    setRegistryEditorReplacementId,
    setRegistryEditorStatus,
    setRegistryEditorType,
    setRegistryScanRows,
    setRegistryStatusFilter,
    setRegistryTypeFilter,
    setRegistryUsageLoading,
    setRegistryUsagePreviewMap,
    setRegistryUsageRows,
    setSaveError,
    setSaving,
    setSelectedRegistryComponentId,
    setSelectedTemplateType,
    updateAiNodeTreeRow
  } = useScreenBuilderWorkspaceState(en);

  const availableApis = useMemo(() => commandState.value?.page?.apis || [], [commandState.value]);
  const {
    authorityAssignmentAuthorities,
    authorityLoading,
    authorityRoleCategories,
    authorityRoleCategoryOptions,
    authorityRoleTemplates,
    backendDeprecatedNodes,
    backendMissingNodes,
    backendUnregisteredNodes,
    componentPromptSurface,
    componentTypeOptions,
    filteredComponentRegistry,
    filteredSystemCatalog,
    selectedCatalogType,
    selectedRegistryInventoryItem,
    systemCatalogInstances,
    uniqueUsageUrlsByComponent
  } = useScreenBuilderGovernanceState({
    componentRegistry,
    en,
    page,
    registryStatusFilter,
    registryTypeFilter,
    registryUsagePreviewMap,
    selectedRegistryComponentId,
    setComponentRegistry,
    setPreviewNodes,
    setRegistryEditorDescription,
    setRegistryEditorLabel,
    setRegistryEditorPropsJson,
    setRegistryEditorReplacementId,
    setRegistryEditorStatus,
    setRegistryEditorType,
    setRegistryUsageLoading,
    setRegistryUsagePreviewMap,
    setRegistryUsageRows,
    setSaveError,
    setSelectedRegistryComponentId,
    setSelectedTemplateType
  });
  useEffect(() => {
    setDraftAuthorityProfile(page?.authorityProfile || null);
  }, [page?.authorityProfile]);
  const publishIssueCount = backendUnregisteredNodes.length + backendMissingNodes.length + backendDeprecatedNodes.length;
  const publishReady = publishIssueCount === 0;

  const {
    addNode,
    collapsedNodeIdSet,
    componentDescription,
    componentLabel,
    dragNodeId,
    duplicateSelectedNode,
    ensureSelectedEvent,
    events,
    filteredPalette,
    handleApplyTemplatePreset,
    handleReplaceSelectedComponent,
    moveSelectedNode,
    nodeTreeRows,
    nodes,
    removeSelectedNode,
    reorderNodes,
    replacementComponentId,
    selectedApi,
    selectedEvent,
    selectedNode,
    selectedNodeProps,
    selectedRegistryComponent,
    setComponentDescription,
    setComponentLabel,
    setDragNodeId,
    setEvents,
    setNodes,
    setReplacementComponentId,
    setSelectedNodeId,
    toggleCollapsedNode,
    updateSelectedEvent,
    updateSelectedEventApi,
    updateSelectedEventRequestMapping,
    updateSelectedEventTarget,
    updateSelectedNodeField
  } = useScreenBuilderEditor({
    availableApis,
    componentRegistry,
    en,
    page: page || undefined,
    selectedTemplateType,
    setMessage
  });


  const {
    handleAddNodeFromComponent,
    handleAddNodeTreeFromAiSurface,
    handleAutoReplaceDeprecated,
    handleDeleteRegistryItem,
    handleDeprecateComponent,
    handlePreviewAutoReplaceDeprecated,
    handlePreviewRefresh,
    handlePublish,
    handleRegisterSelectedComponent,
    handleRemapRegistryUsage,
    handleRestoreVersion,
    handleSave,
    handleSaveRegistryItem,
    handleScanRegistryDiagnostics
  } = useScreenBuilderMutations({
    aiNodeTreeRows,
    backendDeprecatedNodesLength: backendDeprecatedNodes.length,
    backendMissingNodesLength: backendMissingNodes.length,
    backendUnregisteredNodesLength: backendUnregisteredNodes.length,
    componentDescription,
    componentLabel,
    en,
    events,
    nodes,
    page,
    pageReload: pageState.reload,
    previewMode,
    publishIssueCount,
    draftAuthorityProfile,
    registryEditorDescription,
    registryEditorLabel,
    registryEditorPropsJson,
    registryEditorReplacementId,
    registryEditorStatus,
    registryEditorType,
    replacementComponentId,
    selectedNode,
    selectedRegistryInventoryItem,
    selectedTemplateType,
    setAutoReplacePreviewItems,
    setComponentRegistry,
    setMessage,
    setNodes,
    setPreviewLoading,
    setPreviewMessage,
    setPreviewNodes,
    setRegistryScanRows,
    setRegistryUsageRows,
    setReplacementComponentId,
    setSaveError,
    setSaving,
    setSelectedRegistryComponentId
  });

  const rootMenuHref = buildLocalizedPath("/admin/system/environment-management", "/en/admin/system/environment-management");
  const screenFlowHref = buildLocalizedPath("/admin/system/screen-flow-management", "/en/admin/system/screen-flow-management");
  const screenMenuAssignmentHref = buildLocalizedPath("/admin/system/screen-menu-assignment-management", "/en/admin/system/screen-menu-assignment-management");
  const screenGovernanceSummary = useMemo(() => ({
    requiredViewFeatureCode: String(commandState.value?.page?.menuPermission?.requiredViewFeatureCode || ""),
    featureCodeCount: commandState.value?.page?.menuPermission?.featureCodes?.length || 0,
    relationTableCount: commandState.value?.page?.menuPermission?.relationTables?.length || 0,
    surfaceCount: commandState.value?.page?.surfaces?.length || 0,
    eventCount: commandState.value?.page?.events?.length || 0,
    apiCount: commandState.value?.page?.apis?.length || 0,
    schemaCount: commandState.value?.page?.schemas?.length || 0,
    changeTargetCount: commandState.value?.page?.changeTargets?.length || 0,
    routePath: String(commandState.value?.page?.routePath || page?.menuUrl || ""),
    menuLookupUrl: String(commandState.value?.page?.menuLookupUrl || "")
  }), [commandState.value?.page, page?.menuUrl]);
  const packageArtifactEvidence = (page?.artifactEvidence || {}) as Record<string, unknown>;
  const packageQueueSummary = useMemo(() => buildInstallQueueSummaryFromContract({
    menuCode: page?.menuCode,
    pageId: page?.pageId,
    menuUrl: page?.menuUrl,
    releaseUnitId: page?.releaseUnitId || page?.publishedVersionId,
    runtimePackageId: String(packageArtifactEvidence.runtimePackageId || page?.publishedVersionId || ""),
    deployTraceId: String(packageArtifactEvidence.deployTraceId || page?.publishedSavedAt || ""),
    publishReady,
    issueCount: publishIssueCount,
    validatorPassCount: publishReady ? BUILDER_INSTALL_VALIDATOR_CHECKS.length : Math.max(BUILDER_INSTALL_VALIDATOR_CHECKS.length - 2, 0),
    validatorTotalCount: BUILDER_INSTALL_VALIDATOR_CHECKS.length
  }), [packageArtifactEvidence.deployTraceId, packageArtifactEvidence.runtimePackageId, page?.menuCode, page?.menuUrl, page?.pageId, page?.publishedSavedAt, page?.publishedVersionId, page?.releaseUnitId, publishIssueCount, publishReady]);
  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "screen-builder", {
      route: window.location.pathname,
      pageId: page.pageId || "",
      menuCode: page.menuCode || "",
      nodeCount: nodes.length,
      eventCount: events.length,
      publishIssueCount,
      componentRegistryCount: componentRegistry.length
    });
    logGovernanceScope("COMPONENT", "screen-builder-governance", {
      component: "screen-builder-governance",
      selectedNodeId: selectedNode?.nodeId || "",
      selectedRegistryComponentId,
      registryIssueCount: backendUnregisteredNodes.length + backendMissingNodes.length + backendDeprecatedNodes.length,
      previewNodeCount: previewNodes.length
    });
  }, [
    backendDeprecatedNodes.length,
    backendMissingNodes.length,
    backendUnregisteredNodes.length,
    componentRegistry.length,
    events.length,
    nodes.length,
    page,
    previewNodes.length,
    publishIssueCount,
    selectedNode,
    selectedRegistryComponentId
  ]);

  function applyAuthorityRoleToDraft(role: FrameworkAuthorityRoleContract) {
    setDraftAuthorityProfile({
      roleKey: role.roleKey,
      authorCode: role.authorCode,
      label: role.label,
      description: role.description,
      tier: role.tier,
      actorType: role.actorType,
      scopePolicy: role.scopePolicy,
      hierarchyLevel: role.hierarchyLevel,
      featureCodes: role.featureCodes || [],
      tags: [`role-template:${role.authorCode}`, `role-tier:${role.tier}`]
    });
    setMessage(en ? `Authority profile ${role.authorCode} applied to the draft.` : `${role.authorCode} 권한 프로필을 draft에 반영했습니다.`);
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Builder Install / Bind Console" : "빌더 설치 / 바인딩 콘솔", href: rootMenuHref },
        { label: en ? "Builder Package Studio" : "빌더 패키지 스튜디오" }
      ]}
      title={en ? "Builder Package Studio" : "빌더 패키지 스튜디오"}
      subtitle={en ? "Assemble a package-ready page draft from menu metadata, governed components, authority evidence, and install validation context." : "메뉴 메타데이터, 거버넌스 컴포넌트, 권한 증거, 설치 검증 문맥을 묶어 패키지 가능한 페이지 초안을 구성합니다."}
      contextStrip={
        <ContextKeyStrip items={authorDesignContextKeys} />
      }
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading screen builder..." : "화면 빌더를 불러오는 중입니다."}
    >
      {pageState.error || saveError ? (
        <PageStatusNotice tone="error">
          {pageState.error || saveError}
        </PageStatusNotice>
      ) : null}
      {message ? (
        <PageStatusNotice tone="success">
          {message}
        </PageStatusNotice>
      ) : null}
      <AdminWorkspacePageFrame>
        <div data-help-id="screen-builder-summary">
          <DiagnosticCard
            actions={(
              <>
                {page?.menuCode ? (
                  <MemberLinkButton
                    href={buildLocalizedPath(
                      `/admin/system/environment-management?menuCode=${encodeURIComponent(page.menuCode)}`,
                      `/en/admin/system/environment-management?menuCode=${encodeURIComponent(page.menuCode)}`
                    )}
                    variant="secondary"
                  >
                    {en ? "Open Install / Bind Console" : "설치 / 바인딩 콘솔 열기"}
                  </MemberLinkButton>
                ) : null}
                {page?.menuCode ? (
                  <MemberLinkButton
                    href={buildLocalizedPath(
                      `/admin/system/screen-runtime?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`,
                      `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`
                    )}
                    variant="secondary"
                  >
                    {en ? "Open Install Runtime" : "설치 런타임 열기"}
                  </MemberLinkButton>
                ) : null}
                <MemberLinkButton href={screenFlowHref} variant="secondary">
                  {en ? "Open Package Flow" : "패키지 흐름 관리"}
                </MemberLinkButton>
                <MemberLinkButton href={screenMenuAssignmentHref} variant="secondary">
                  {en ? "Open Menu Package Binding" : "메뉴 패키지 바인딩"}
                </MemberLinkButton>
                <MemberButton disabled={!page?.menuCode || saving} onClick={() => { void handleSave(); }} variant="primary">
                  {saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Package Draft" : "패키지 초안 저장")}
                </MemberButton>
                <MemberButton disabled={!page?.menuCode || saving || publishIssueCount > 0} onClick={() => { void handlePublish(); }} variant="info">
                  {saving ? (en ? "Working..." : "처리 중...") : (en ? "Build Install Snapshot" : "설치 스냅샷 빌드")}
                </MemberButton>
                <MemberButton disabled={!page?.menuCode || previewLoading} onClick={() => { void handlePreviewRefresh(false); }} variant="secondary">
                  {previewLoading ? (en ? "Refreshing..." : "갱신 중...") : (en ? "Refresh Package Preview" : "패키지 미리보기 갱신")}
                </MemberButton>
              </>
            )}
            description={en ? "Use this studio to save package drafts, build install snapshots, and hand off runtime validation for the current menu." : "현재 메뉴 기준으로 패키지 초안을 저장하고, 설치 스냅샷을 만들고, 런타임 검증으로 넘기는 스튜디오입니다."}
            eyebrow={page?.templateType || "EDIT_PAGE"}
            status={publishReady ? (en ? "READY" : "준비 완료") : (en ? "BLOCKED" : "차단")}
            statusTone={publishReady ? "healthy" : "danger"}
            summary={(
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">menuCode / pageId</p>
                  <p className="mt-2 font-mono text-sm">{packageQueueSummary.menuCode} / {packageQueueSummary.pageId}</p>
                </div>
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Install Target" : "설치 타깃"}</p>
                  <p className="mt-2 font-mono text-sm break-all">{packageQueueSummary.menuUrl}</p>
                </div>
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">releaseUnit / package</p>
                  <p className="mt-2 font-mono text-sm">{packageQueueSummary.releaseUnitId} / {packageQueueSummary.runtimePackageId}</p>
                </div>
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Validator Gate" : "검증 게이트"}</p>
                  <p className="mt-2 text-lg font-black">{packageQueueSummary.validatorPassCount} / {packageQueueSummary.validatorTotalCount}</p>
                  <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">
                    {en ? `Issues ${packageQueueSummary.issueCount} / Trace ${packageQueueSummary.deployTraceId}` : `이슈 ${packageQueueSummary.issueCount} / 추적 ${packageQueueSummary.deployTraceId}`}
                  </p>
                </div>
              </div>
            )}
            title={en ? "Package Builder Actions" : "패키지 빌더 액션"}
          />
        </div>
        <DiagnosticCard
          description={en ? "Authority profile embedded in the current package draft artifact." : "현재 패키지 초안 산출물에 포함되는 권한 프로필입니다."}
          eyebrow={draftAuthorityProfile?.tier || (en ? "UNASSIGNED" : "미지정")}
          status={draftAuthorityProfile?.authorCode || (en ? "MISSING" : "없음")}
          statusTone={draftAuthorityProfile?.authorCode ? "healthy" : "warning"}
          summary={(
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <div className="text-[var(--kr-gov-text-secondary)]">{en ? "Scope" : "범위"}</div>
                <div className="font-semibold text-[var(--kr-gov-text-primary)]">{draftAuthorityProfile?.scopePolicy || "-"}</div>
              </div>
              <div>
                <div className="text-[var(--kr-gov-text-secondary)]">{en ? "Actor" : "주체"}</div>
                <div className="font-semibold text-[var(--kr-gov-text-primary)]">{draftAuthorityProfile?.actorType || "-"}</div>
              </div>
              <div>
                <div className="text-[var(--kr-gov-text-secondary)]">{en ? "Feature Grants" : "기능 권한"}</div>
                <div className="font-semibold text-[var(--kr-gov-text-primary)]">{draftAuthorityProfile?.featureCodes?.length || 0}</div>
              </div>
            </div>
          )}
          title={draftAuthorityProfile?.label || (en ? "Package Draft Authority Profile" : "패키지 초안 권한 프로필")}
        />
        <div data-help-id="screen-builder-overview">
          <Suspense
            fallback={(
              <section className="gov-card px-6 py-8 text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "Loading overview panels..." : "개요 패널을 불러오는 중입니다."}
              </section>
            )}
          >
            <ScreenBuilderOverviewPanels
              backendDeprecatedCount={backendDeprecatedNodes.length}
              backendMissingCount={backendMissingNodes.length}
              backendUnregisteredCount={backendUnregisteredNodes.length}
              componentRegistryLength={componentRegistry.length}
              en={en}
              eventsLength={events.length}
              handleApplyTemplatePreset={handleApplyTemplatePreset}
              handleRestoreVersion={handleRestoreVersion}
              installQueueSummary={packageQueueSummary}
              nodesLength={nodes.length}
              page={page ? {
                ...page,
                screenGovernance: screenGovernanceSummary
              } : null}
              publishIssueCount={publishIssueCount}
              publishReady={publishReady}
              saving={saving}
              selectedTemplateType={selectedTemplateType}
              setSelectedTemplateType={setSelectedTemplateType}
            />
          </Suspense>
        </div>

        <div data-help-id="screen-builder-governance">
          <Suspense
            fallback={(
              <section className="gov-card px-6 py-8 text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "Loading governance workspace..." : "거버넌스 작업 영역을 불러오는 중입니다."}
              </section>
            )}
          >
            <ScreenBuilderGovernancePanels
              aiNodeTreeRows={aiNodeTreeRows}
              addAiNodeTreeRow={addAiNodeTreeRow}
              authorityLoading={authorityLoading}
              authorityAssignmentAuthorities={authorityAssignmentAuthorities}
              authorityRoleCategories={authorityRoleCategories}
              authorityRoleCategoryOptions={authorityRoleCategoryOptions}
              authorityRoleTemplates={authorityRoleTemplates}
              applyAuthorityRoleToDraft={applyAuthorityRoleToDraft}
              autoReplacePreviewItems={autoReplacePreviewItems}
              backendDeprecatedNodes={backendDeprecatedNodes}
              backendMissingNodes={backendMissingNodes}
              backendUnregisteredNodes={backendUnregisteredNodes}
              componentPromptSurface={componentPromptSurface}
              componentRegistry={componentRegistry}
              componentTypeOptions={componentTypeOptions}
              copiedButtonStyleId={copiedButtonStyleId}
              copyButtonStyleId={copyButtonStyleId}
              draftAuthorityAuthorCode={String(draftAuthorityProfile?.authorCode || "")}
              en={en}
              filteredComponentRegistry={filteredComponentRegistry}
              filteredSystemCatalog={filteredSystemCatalog}
              handleAddNodeFromComponent={handleAddNodeFromComponent}
              handleAddNodeTreeFromAiSurface={handleAddNodeTreeFromAiSurface}
              handleAutoReplaceDeprecated={handleAutoReplaceDeprecated}
              handleDeleteRegistryItem={handleDeleteRegistryItem}
              handleDeprecateComponent={handleDeprecateComponent}
              handlePreviewAutoReplaceDeprecated={handlePreviewAutoReplaceDeprecated}
              handleRemapRegistryUsage={handleRemapRegistryUsage}
              handleSaveRegistryItem={handleSaveRegistryItem}
              handleScanRegistryDiagnostics={handleScanRegistryDiagnostics}
              registryEditorDescription={registryEditorDescription}
              registryEditorPropsJson={registryEditorPropsJson}
              registryEditorLabel={registryEditorLabel}
              registryEditorReplacementId={registryEditorReplacementId}
              registryEditorStatus={registryEditorStatus}
              registryEditorType={registryEditorType}
              registryScanRows={registryScanRows}
              registryStatusFilter={registryStatusFilter}
              registryTypeFilter={registryTypeFilter}
              registryUsageLoading={registryUsageLoading}
              registryUsageRows={registryUsageRows}
              removeAiNodeTreeRow={removeAiNodeTreeRow}
              saving={saving}
              selectedCatalogType={selectedCatalogType}
              selectedRegistryInventoryItem={selectedRegistryInventoryItem}
              setRegistryEditorDescription={setRegistryEditorDescription}
              setRegistryEditorLabel={setRegistryEditorLabel}
              setRegistryEditorPropsJson={setRegistryEditorPropsJson}
              setRegistryEditorReplacementId={setRegistryEditorReplacementId}
              setRegistryEditorStatus={setRegistryEditorStatus}
              setRegistryEditorType={setRegistryEditorType}
              setRegistryStatusFilter={setRegistryStatusFilter}
              setRegistryTypeFilter={setRegistryTypeFilter}
              setReplacementComponentId={setReplacementComponentId}
              setSelectedNodeId={setSelectedNodeId}
              setSelectedRegistryComponentId={setSelectedRegistryComponentId}
              systemCatalogInstances={systemCatalogInstances}
              uniqueUsageUrlsByComponent={uniqueUsageUrlsByComponent}
              updateAiNodeTreeRow={updateAiNodeTreeRow}
            />
          </Suspense>
        </div>

        <div data-help-id="screen-builder-editor">
          <Suspense
            fallback={(
              <section className="gov-card px-6 py-8 text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "Loading editor panels..." : "편집 패널을 불러오는 중입니다."}
              </section>
            )}
          >
            <ScreenBuilderEditorPanels
              addNode={addNode}
              availableApis={availableApis}
              collapsedNodeIdSet={collapsedNodeIdSet}
              commandHasApis={Boolean(commandState.value?.page?.apis?.length)}
              componentDescription={componentDescription}
              componentLabel={componentLabel}
              componentRegistry={componentRegistry}
              dragNodeId={dragNodeId}
              duplicateSelectedNode={duplicateSelectedNode}
              en={en}
              ensureSelectedEvent={ensureSelectedEvent}
              filteredPalette={filteredPalette}
              handleRegisterSelectedComponent={handleRegisterSelectedComponent}
              handleReplaceSelectedComponent={handleReplaceSelectedComponent}
              menuUrl={page?.menuUrl}
              moveSelectedNode={moveSelectedNode}
              nodeTreeRows={nodeTreeRows}
              nodes={nodes}
              previewMessage={previewMessage}
              previewMode={previewMode}
              previewNodes={previewNodes}
              publishedVersionId={page?.publishedVersionId}
              removeSelectedNode={removeSelectedNode}
              reorderNodes={reorderNodes}
              replacementComponentId={replacementComponentId}
              saving={saving}
              selectedApi={selectedApi}
              selectedEvent={selectedEvent}
              selectedNode={selectedNode}
              selectedNodeProps={selectedNodeProps}
              selectedRegistryComponent={selectedRegistryComponent}
              selectedTemplateType={selectedTemplateType}
              setComponentDescription={setComponentDescription}
              setComponentLabel={setComponentLabel}
              setDragNodeId={setDragNodeId}
              setEvents={setEvents}
              setMessage={setMessage}
              setNodes={setNodes}
              setPreviewMode={setPreviewMode}
              setReplacementComponentId={setReplacementComponentId}
              setSelectedNodeId={setSelectedNodeId}
              toggleCollapsedNode={toggleCollapsedNode}
              updateSelectedEvent={updateSelectedEvent}
              updateSelectedEventApi={updateSelectedEventApi}
              updateSelectedEventRequestMapping={updateSelectedEventRequestMapping}
              updateSelectedEventTarget={updateSelectedEventTarget}
              updateSelectedNodeField={updateSelectedNodeField}
            />
          </Suspense>
        </div>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
