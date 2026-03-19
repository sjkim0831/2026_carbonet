import { useMemo } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchAuditEvents, fetchScreenBuilderPage, fetchScreenBuilderPreview } from "../../lib/api/client";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { DiagnosticCard, GridToolbar, MemberLinkButton } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { renderScreenBuilderNodePreview, resolveScreenBuilderQuery, sortScreenBuilderNodes } from "./screenBuilderRenderer";

export function ScreenRuntimeMigrationPage() {
  const en = isEnglish();
  const query = useMemo(() => resolveScreenBuilderQuery({ get: getSearchParam }), []);
  const pageState = useAsyncValue(
    () => fetchScreenBuilderPage(query),
    [query.menuCode, query.pageId, query.menuTitle, query.menuUrl]
  );
  const page = pageState.value;
  const previewState = useAsyncValue(
    () => fetchScreenBuilderPreview({ ...query, versionStatus: "PUBLISHED" }),
    [query.menuCode, query.pageId, query.menuTitle, query.menuUrl, page?.publishedVersionId || ""],
    { enabled: Boolean(page?.publishedVersionId) }
  );
  const auditState = useAsyncValue(
    () => fetchAuditEvents({ menuCode: query.menuCode, pageId: query.pageId, pageSize: 10 }),
    [query.menuCode, query.pageId],
    { enabled: Boolean(query.menuCode || query.pageId) }
  );
  const preview = previewState.value;
  const previewNodes = useMemo(() => sortScreenBuilderNodes(preview?.nodes || []), [preview?.nodes]);
  const runtimeDiagnostics = preview?.registryDiagnostics || page?.registryDiagnostics || {};
  const runtimeIssueCount = (runtimeDiagnostics?.missingNodes?.length || 0) + (runtimeDiagnostics?.deprecatedNodes?.length || 0);
  const runtimeBlocked = runtimeIssueCount > 0;
  const screenBuilderAudits = useMemo(
    () => (auditState.value?.items || [])
      .filter((row) => String(row.actionCode || "").startsWith("SCREEN_BUILDER_"))
      .slice(0, 5),
    [auditState.value]
  );
  const publishedActionAudit = useMemo(
    () => screenBuilderAudits.find((row) => String(row.actionCode || "").includes("PUBLISH")) || null,
    [screenBuilderAudits]
  );

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Screen Builder" : "화면 빌더", href: buildLocalizedPath("/admin/system/screen-builder", "/en/admin/system/screen-builder") },
        { label: en ? "Published Runtime" : "발행 런타임" }
      ]}
      title={en ? "Published Screen Runtime" : "발행 화면 런타임"}
      subtitle={en ? "Review the latest published screen-builder snapshot as a read-only runtime surface." : "최신 publish 스냅샷을 읽기 전용 런타임 화면으로 확인합니다."}
      loading={(pageState.loading && !page) || (previewState.loading && !preview)}
      loadingLabel={en ? "Loading published runtime..." : "발행 런타임을 불러오는 중입니다."}
    >
      {pageState.error || previewState.error ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageState.error || previewState.error}
        </section>
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
                    `/admin/system/screen-builder?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`,
                    `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`
                  )}
                  variant="secondary"
                >
                  {en ? "Open Builder" : "빌더 열기"}
                </MemberLinkButton>
              ) : null}
            </>
          )}
          description={page?.publishedVersionId
            ? (en ? "This surface renders the latest published snapshot only. Draft-only edits remain in the builder." : "이 화면은 최신 publish 스냅샷만 렌더링합니다. 초안 수정은 빌더에만 남습니다.")
            : (en ? "No published snapshot exists yet. Publish from the screen builder first." : "아직 publish 스냅샷이 없습니다. 먼저 화면 빌더에서 publish 하세요.")}
          eyebrow={preview?.templateType || page?.templateType || "EDIT_PAGE"}
          status={page?.publishedVersionId ? "PUBLISHED" : "DRAFT_ONLY"}
          statusTone={page?.publishedVersionId ? "healthy" : "warning"}
          summary={(
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">Menu Code</p>
                <p className="mt-2 font-mono text-sm">{page?.menuCode || query.menuCode || "-"}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">pageId</p>
                <p className="mt-2 font-mono text-sm">{page?.pageId || query.pageId || "-"}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Published Version" : "발행 버전"}</p>
                <p className="mt-2 font-mono text-sm">{page?.publishedVersionId || "-"}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Nodes" : "노드 수"}</p>
                <p className="mt-2 text-lg font-black">{previewNodes.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Published At" : "발행 시각"}</p>
                <p className="mt-2 text-sm font-semibold">{String(page?.publishedSavedAt || "-")}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Snapshots" : "스냅샷 수"}</p>
                <p className="mt-2 text-lg font-black">{Array.isArray(page?.versionHistory) ? page.versionHistory.length : 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Recent Builder Events" : "최근 빌더 활동"}</p>
                <p className="mt-2 text-lg font-black">{screenBuilderAudits.length}</p>
              </div>
            </div>
          )}
          title={page?.menuTitle || query.menuTitle || (en ? "Published runtime" : "발행 런타임")}
        />
        {publishedActionAudit ? (
          <section className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.08em] text-blue-700">{en ? "Publish Action" : "발행 액션"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{String(publishedActionAudit.actionCode || "-")}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.08em] text-blue-700">{en ? "Published By" : "발행 작업자"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{String(publishedActionAudit.actorId || "-")}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.08em] text-blue-700">{en ? "Publish Time" : "발행 시각"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{String(publishedActionAudit.createdAt || "-")}</p>
              </div>
            </div>
          </section>
        ) : null}
        {runtimeBlocked ? (
          <section className="rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-black text-red-800">{en ? "Published runtime blocked" : "발행 런타임 차단"}</p>
            <p className="mt-1 text-sm text-red-700">
              {en
                ? "The published snapshot still references missing or deprecated components. Fix the registry or run replacement before using runtime."
                : "발행 스냅샷이 누락되었거나 deprecated된 컴포넌트를 참조하고 있습니다. 레지스트리를 정리하거나 대체를 먼저 실행하세요."}
            </p>
          </section>
        ) : null}

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={`${page?.menuUrl || query.menuUrl || "-"} / PUBLISHED`}
            title={en ? "Runtime Preview" : "런타임 미리보기"}
          />
          <div className="min-h-[680px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4">
            {previewNodes.length && !runtimeBlocked ? (
              renderScreenBuilderNodePreview(previewNodes[0], previewNodes, en)
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] text-sm text-[var(--kr-gov-text-secondary)]">
                {runtimeBlocked
                  ? (en ? "Runtime rendering is blocked until missing or deprecated components are resolved." : "누락 또는 deprecated 컴포넌트가 정리될 때까지 런타임 렌더링이 차단됩니다.")
                  : (en ? "No published runtime snapshot is available." : "사용 가능한 publish 런타임 스냅샷이 없습니다.")}
              </div>
            )}
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            actions={page?.menuCode ? (
              <MemberLinkButton
                href={buildLocalizedPath(
                  `/admin/system/observability?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                  `/en/admin/system/observability?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                )}
                size="sm"
                variant="secondary"
              >
                {en ? "Open Observability" : "Observability 열기"}
              </MemberLinkButton>
            ) : null}
            meta={en ? "Recent screen-builder save, publish, and restore activity for this page." : "이 페이지의 최근 screen-builder 저장, publish, 복원 이력입니다."}
            title={en ? "Builder Activity" : "빌더 활동 이력"}
          />
          <div className="divide-y divide-gray-100">
            {screenBuilderAudits.length ? screenBuilderAudits.map((row, index) => (
              <div className="px-5 py-4" key={`runtime-audit-${index}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-bold text-[var(--kr-gov-text-primary)]">{String(row.actionCode || "-")}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--kr-gov-text-secondary)]">{String(row.createdAt || "-")}</span>
                    <MemberLinkButton
                      href={buildLocalizedPath(
                        `/admin/system/observability?traceId=${encodeURIComponent(String(row.traceId || ""))}&menuCode=${encodeURIComponent(page?.menuCode || "")}&pageId=${encodeURIComponent(page?.pageId || "")}&actionCode=${encodeURIComponent(String(row.actionCode || ""))}`,
                        `/en/admin/system/observability?traceId=${encodeURIComponent(String(row.traceId || ""))}&menuCode=${encodeURIComponent(page?.menuCode || "")}&pageId=${encodeURIComponent(page?.pageId || "")}&actionCode=${encodeURIComponent(String(row.actionCode || ""))}`
                      )}
                      size="xs"
                      variant="secondary"
                    >
                      {en ? "Detail" : "상세"}
                    </MemberLinkButton>
                  </div>
                </div>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {en ? "Actor" : "작업자"}: {String(row.actorId || "-")} / {en ? "Result" : "결과"}: {String(row.resultStatus || "-")}
                </p>
                {String(row.message || "").trim() ? (
                  <p className="mt-2 text-sm text-[var(--kr-gov-text-primary)]">{String(row.message || "")}</p>
                ) : null}
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-[var(--kr-gov-text-secondary)]">
                {auditState.loading
                  ? (en ? "Loading recent builder activity..." : "최근 빌더 활동 이력을 불러오는 중입니다.")
                  : (en ? "No recent screen-builder activity was found." : "최근 screen-builder 활동 이력이 없습니다.")}
              </div>
            )}
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
