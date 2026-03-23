import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { FrameworkAuthorityRoleContract } from "../../framework";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  readBootstrappedScreenBuilderPageData,
  type ScreenCommandPagePayload,
  type ScreenBuilderPagePayload
} from "../../lib/api/client";
import { fetchScreenCommandPage } from "../../lib/api/screenGovernance";
import {
  fetchScreenBuilderPage,
} from "../../lib/api/screenBuilder";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { authorDesignContextKeys } from "../admin-ui/contextKeyPresets";
import { DiagnosticCard, MemberButton, MemberLinkButton, PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { resolveScreenBuilderQuery } from "./shared/screenBuilderUtils";
import {
} from "./shared/screenBuilderShared";
import { useScreenBuilderEditor } from "./hooks/useScreenBuilderEditor";
import { useScreenBuilderGovernanceState } from "./hooks/useScreenBuilderGovernanceState";
import { useScreenBuilderMutations } from "./hooks/useScreenBuilderMutations";
import { useScreenBuilderWorkspaceState } from "./hooks/useScreenBuilderWorkspaceState";

const ScreenBuilderGovernancePanels = lazy(() => import("./panels/ScreenBuilderGovernancePanels"));
const ScreenBuilderEditorPanels = lazy(() => import("./panels/ScreenBuilderEditorPanels"));
const ScreenBuilderOverviewPanels = lazy(() => import("./panels/ScreenBuilderOverviewPanels"));

export function ScreenBuilderMigrationPage() {
  const en = isEnglish();
  const initialQuery = useMemo(() => resolveScreenBuilderQuery({ get: getSearchParam }), []);
  const initialPayload = useMemo(() => readBootstrappedScreenBuilderPageData(), []);
  const pageState = useAsyncValue<ScreenBuilderPagePayload>(
    () => fetchScreenBuilderPage(initialQuery),
    [initialQuery.menuCode, initialQuery.pageId, initialQuery.menuTitle, initialQuery.menuUrl],
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
    authorityLoading,
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
        { label: en ? "Environment Management" : "메뉴 통합 관리", href: rootMenuHref },
        { label: en ? "Screen Builder" : "화면 빌더" }
      ]}
      title={en ? "Screen Builder" : "화면 빌더"}
      subtitle={en ? "Build a page draft from menu metadata, reusable components, and lightweight event bindings." : "메뉴 메타데이터를 기준으로 컴포넌트와 이벤트 연결을 조합해 화면 초안을 구성합니다."}
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
                  {en ? "Open Environment Management" : "환경관리 열기"}
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
                  {en ? "Open Published Runtime" : "발행 런타임 열기"}
                </MemberLinkButton>
              ) : null}
              <MemberButton disabled={!page?.menuCode || saving} onClick={() => { void handleSave(); }} variant="primary">
                {saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Draft" : "초안 저장")}
              </MemberButton>
              <MemberButton disabled={!page?.menuCode || saving || publishIssueCount > 0} onClick={() => { void handlePublish(); }} variant="info">
                {saving ? (en ? "Working..." : "처리 중...") : (en ? "Publish Snapshot" : "Publish 스냅샷")}
              </MemberButton>
              <MemberButton disabled={!page?.menuCode || previewLoading} onClick={() => { void handlePreviewRefresh(false); }} variant="secondary">
                {previewLoading ? (en ? "Refreshing..." : "갱신 중...") : (en ? "Refresh Preview" : "미리보기 갱신")}
              </MemberButton>
            </>
          )}
          description={en ? "Draft save, publish, and runtime verification actions for the current menu." : "현재 메뉴의 draft 저장, publish, runtime 검증 액션입니다."}
          eyebrow={page?.templateType || "EDIT_PAGE"}
          status={publishReady ? (en ? "READY" : "준비 완료") : (en ? "BLOCKED" : "차단")}
          statusTone={publishReady ? "healthy" : "danger"}
          title={en ? "Builder Actions" : "빌더 액션"}
        />
        <DiagnosticCard
          description={en ? "Authority profile embedded in the current draft artifact." : "현재 draft 산출물에 포함되는 권한 프로필입니다."}
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
          title={draftAuthorityProfile?.label || (en ? "Draft Authority Profile" : "Draft 권한 프로필")}
        />
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
            nodesLength={nodes.length}
            page={page}
            publishIssueCount={publishIssueCount}
            publishReady={publishReady}
            saving={saving}
            selectedTemplateType={selectedTemplateType}
            setSelectedTemplateType={setSelectedTemplateType}
          />
        </Suspense>

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
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
