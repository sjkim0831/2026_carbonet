import { DiagnosticCard, GridToolbar, MemberButton, MemberButtonGroup } from "../../admin-ui/common";
import { TEMPLATE_OPTIONS, type BuilderTemplateType } from "../shared/screenBuilderShared";

type Props = {
  en: boolean;
  saving: boolean;
  publishReady: boolean;
  publishIssueCount: number;
  page: {
    menuCode?: string;
    pageId?: string;
    menuTitle?: string;
    menuUrl?: string;
    page?: unknown;
    screenBuilderMessage?: string;
    templateType?: string;
    publishedVersionId?: string;
    publishedSavedAt?: string;
    versionHistory?: Array<{
      versionId: string;
      savedAt?: string;
      templateType?: string;
      versionStatus: string;
      nodeCount: number;
      eventCount: number;
    }>;
  } | null;
  nodesLength: number;
  eventsLength: number;
  backendUnregisteredCount: number;
  backendMissingCount: number;
  backendDeprecatedCount: number;
  componentRegistryLength: number;
  selectedTemplateType: BuilderTemplateType;
  setSelectedTemplateType: (value: BuilderTemplateType) => void;
  handleApplyTemplatePreset: () => void;
  handleRestoreVersion: (versionId: string) => Promise<void>;
};

export default function ScreenBuilderOverviewPanels({
  en,
  saving,
  publishReady,
  publishIssueCount,
  page,
  nodesLength,
  eventsLength,
  backendUnregisteredCount,
  backendMissingCount,
  backendDeprecatedCount,
  componentRegistryLength,
  selectedTemplateType,
  setSelectedTemplateType,
  handleApplyTemplatePreset,
  handleRestoreVersion
}: Props) {
  return (
    <>
      <DiagnosticCard
        description={page?.screenBuilderMessage || (en ? "Use this MVP builder to create a schema-first page draft before moving into full runtime rendering." : "이 MVP 빌더로 schema 중심 초안을 먼저 만들고, 이후 runtime 렌더링 단계로 이어갑니다.")}
        eyebrow={page?.templateType || "EDIT_PAGE"}
        status={publishReady ? (en ? "READY" : "준비 완료") : (en ? "BLOCKED" : "차단")}
        statusTone={publishReady ? "healthy" : "danger"}
        summary={(
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
              <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">Menu Code</p>
              <p className="mt-2 font-mono text-sm">{page?.menuCode || "-"}</p>
            </div>
            <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
              <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">pageId</p>
              <p className="mt-2 font-mono text-sm">{page?.pageId || "-"}</p>
            </div>
            <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
              <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Nodes" : "노드 수"}</p>
              <p className="mt-2 text-lg font-black">{nodesLength}</p>
            </div>
            <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
              <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Events" : "이벤트 수"}</p>
              <p className="mt-2 text-lg font-black">{eventsLength}</p>
            </div>
            <div className={`rounded-lg border px-4 py-3 ${publishReady ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <p className={`text-xs font-bold ${publishReady ? "text-emerald-800" : "text-red-800"}`}>{en ? "Publish Readiness" : "Publish 준비 상태"}</p>
              <p className={`mt-2 text-lg font-black ${publishReady ? "text-emerald-900" : "text-red-900"}`}>
                {publishReady
                  ? (en ? "Ready to publish" : "Publish 가능")
                  : (en ? `${publishIssueCount} issues block publish` : `${publishIssueCount}건 이슈로 Publish 차단`)}
              </p>
            </div>
          </div>
        )}
        title={page?.menuTitle || (en ? "Select a page menu first" : "먼저 페이지 메뉴를 선택하세요")}
      />
      {page?.publishedVersionId ? (
        <section className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {en ? "Latest published version" : "최근 publish 버전"}: <span className="font-mono">{page.publishedVersionId}</span>
          {page.publishedSavedAt ? ` / ${page.publishedSavedAt}` : ""}
        </section>
      ) : null}
      <section className="gov-card p-0 overflow-hidden">
        <GridToolbar
          actions={(
            <MemberButtonGroup>
              <MemberButton disabled={saving} onClick={handleApplyTemplatePreset} size="xs" type="button" variant="secondary">
                {en ? "Apply template preset" : "템플릿 프리셋 적용"}
              </MemberButton>
            </MemberButtonGroup>
          )}
          meta={en ? "Choose a page type first so palette, slot positions, and AI component usage stay consistent." : "먼저 페이지 타입을 선택해 팔레트, 버튼 위치, AI 컴포넌트 사용 규칙을 일관되게 맞춥니다."}
          title={en ? "Template Type" : "템플릿 타입"}
        />
        <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-4">
          {TEMPLATE_OPTIONS.map((option) => {
            const active = selectedTemplateType === option.value;
            return (
              <button
                key={option.value}
                className={`rounded-[var(--kr-gov-radius)] border px-4 py-4 text-left ${active ? "border-[var(--kr-gov-blue)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white hover:bg-gray-50"}`}
                onClick={() => setSelectedTemplateType(option.value)}
                type="button"
              >
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{option.value}</p>
                <p className="mt-2 text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? option.labelEn : option.label}</p>
                <p className="mt-2 text-[12px] leading-5 text-[var(--kr-gov-text-secondary)]">{option.description}</p>
              </button>
            );
          })}
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DiagnosticCard
          description={en ? "Nodes without a linked componentId can be registered as reusable components or replaced with an existing one." : "componentId가 없는 노드는 재사용 컴포넌트로 등록하거나 기존 컴포넌트로 대체할 수 있습니다."}
          status={String(backendUnregisteredCount)}
          statusTone={backendUnregisteredCount ? "warning" : "healthy"}
          title={en ? "Unregistered reusable candidates" : "미등록 재사용 후보"}
        />
        <DiagnosticCard
          description={en ? "Nodes that reference missing componentIds should be replaced or the registry item should be restored." : "없는 componentId를 참조하는 노드는 대체하거나 레지스트리 항목을 복구해야 합니다."}
          status={String(backendMissingCount + backendDeprecatedCount)}
          statusTone={backendMissingCount + backendDeprecatedCount ? "danger" : "healthy"}
          title={en ? "Broken registry references" : "깨진 레지스트리 참조"}
        />
        <DiagnosticCard
          description={en ? "System and custom components that the AI or operators can target by componentId." : "운영자와 AI가 componentId로 재사용할 수 있는 시스템/커스텀 컴포넌트 목록입니다."}
          status={String(componentRegistryLength)}
          statusTone="neutral"
          title={en ? "Registered components" : "등록 컴포넌트 수"}
        />
      </section>
      <section className="gov-card p-0 overflow-hidden">
        <GridToolbar
          meta={publishReady
            ? (en ? "All registry validation issues are cleared. Publish can run now." : "레지스트리 검증 이슈가 없습니다. 지금 Publish 할 수 있습니다.")
            : (en ? "Publish runs only when all registry validation issues are cleared." : "레지스트리 검증 이슈가 모두 없어야 Publish 됩니다.")}
          title={en ? "Publish Validation Report" : "Publish 검증 리포트"}
        />
        <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-3">
          <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-amber-800">{en ? "Unregistered" : "미등록"}</p>
            <p className="mt-2 text-2xl font-black text-amber-900">{backendUnregisteredCount}</p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-red-800">{en ? "Missing" : "누락"}</p>
            <p className="mt-2 text-2xl font-black text-red-900">{backendMissingCount}</p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-rose-800">Deprecated</p>
            <p className="mt-2 text-2xl font-black text-rose-900">{backendDeprecatedCount}</p>
          </div>
        </div>
      </section>
      <section className="gov-card p-0 overflow-hidden">
        <GridToolbar
          meta={en ? `${page?.versionHistory?.length || 0} saved snapshots` : `저장된 스냅샷 ${page?.versionHistory?.length || 0}건`}
          title={en ? "Draft Version History" : "초안 버전 이력"}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">{en ? "Saved At" : "저장 시각"}</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">{en ? "Nodes" : "노드"}</th>
                <th className="px-4 py-3">{en ? "Events" : "이벤트"}</th>
                <th className="px-4 py-3">{en ? "Action" : "작업"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(page?.versionHistory || []).length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                    {en ? "No saved draft versions yet." : "아직 저장된 초안 버전이 없습니다."}
                  </td>
                </tr>
              ) : (
                (page?.versionHistory || []).map((version) => (
                  <tr key={version.versionId}>
                    <td className="px-4 py-3 font-mono text-[12px]">{version.versionId}</td>
                    <td className="px-4 py-3">{version.savedAt || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{version.templateType || "-"}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${version.versionStatus === "PUBLISHED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {version.versionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{version.nodeCount}</td>
                    <td className="px-4 py-3">{version.eventCount}</td>
                    <td className="px-4 py-3">
                      <MemberButton disabled={saving || version.versionStatus === "PUBLISHED"} onClick={() => { void handleRestoreVersion(version.versionId); }} size="xs" type="button" variant="secondary">
                        {version.versionStatus === "PUBLISHED" ? (en ? "Protected" : "보호됨") : (en ? "Restore" : "복원")}
                      </MemberButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
