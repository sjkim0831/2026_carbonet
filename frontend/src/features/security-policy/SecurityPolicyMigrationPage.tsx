import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchSecurityPolicyPage, readBootstrappedSecurityPolicyPageData, type SecurityPolicyPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";
import { CopyableCodeBlock, DiagnosticCard, GridToolbar, MemberLinkButton } from "../admin-ui/common";
import { AdminPolicyPageFrame, AdminSummaryStrip } from "../admin-ui/pageFrames";
import { useMemo, useState } from "react";

export function SecurityPolicyMigrationPage() {
  const en = isEnglish();
  const initialPayload = useMemo(() => readBootstrappedSecurityPolicyPageData(), []);
  const [copiedSqlKey, setCopiedSqlKey] = useState("");
  const pageState = useAsyncValue<SecurityPolicyPagePayload>(fetchSecurityPolicyPage, [], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload)
  });
  const page = pageState.value;
  const cards = (page?.securityPolicySummary || []) as Array<Record<string, string>>;
  const rows = (page?.securityPolicyRows || []) as Array<Record<string, string>>;
  const playbooks = (page?.securityPolicyPlaybooks || []) as Array<Record<string, string>>;
  const diagnostics = (page?.menuPermissionDiagnostics || {}) as Record<string, unknown>;
  const duplicatedMenuUrls = (diagnostics.duplicatedMenuUrls || []) as Array<Record<string, string>>;
  const duplicatedViewMappings = (diagnostics.duplicatedViewMappings || []) as Array<Record<string, string>>;
  function buildEnvironmentUrl(menuCode: string) {
    const normalizedMenuCode = (menuCode || "").trim();
    const query = normalizedMenuCode ? `?menuCode=${encodeURIComponent(normalizedMenuCode)}` : "";
    return buildLocalizedPath(`/admin/system/environment-management${query}`, `/en/admin/system/environment-management${query}`);
  }
  function buildAuthGroupUrl(menuCode: string, featureCode?: string) {
    const search = new URLSearchParams();
    if ((menuCode || "").trim()) {
      search.set("menuCode", menuCode.trim());
    }
    if ((featureCode || "").trim()) {
      search.set("featureCode", featureCode!.trim());
    }
    const query = search.toString() ? `?${search.toString()}` : "";
    return buildLocalizedPath(`/admin/auth/group${query}`, `/en/admin/auth/group${query}`);
  }
  async function copySqlPreview(copyKey: string, sql: string) {
    if (!sql.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSqlKey(copyKey);
      window.setTimeout(() => {
        setCopiedSqlKey((current) => (current === copyKey ? "" : current));
      }, 1800);
    } catch {
      setCopiedSqlKey("");
    }
  }
  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Security Policy" : "보안 정책 관리" }
      ]}
      title={en ? "Security Policy Management" : "보안 정책 관리"}
      subtitle={en ? "Manage thresholds and automatic response rules for login, APIs, and admin access." : "로그인, 검색 API, 관리자 접근에 대한 임계치와 자동 대응 규칙을 관리합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <AdminPolicyPageFrame>
      <AdminSummaryStrip data-help-id="security-policy-summary">
        {cards.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}
      </AdminSummaryStrip>
      <section className="gov-card p-0 overflow-hidden" data-help-id="security-policy-table">
        <GridToolbar
          actions={<span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Total" : "총"} <strong>{rows.length}</strong>{en ? "" : "건"}</span>}
          title={en ? "Applied Policy List" : "적용 정책 목록"}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Policy ID" : "정책 ID"}</th><th className="px-4 py-3">{en ? "Target URL" : "대상 URL"}</th><th className="px-4 py-3">{en ? "Policy Name" : "정책명"}</th><th className="px-4 py-3">{en ? "Threshold" : "기본 임계치"}</th><th className="px-4 py-3">Burst</th><th className="px-4 py-3">{en ? "Action" : "조치"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Updated At" : "수정일시"}</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-bold">{stringOf(row, "policyId")}</td><td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "targetUrl")}</td><td className="px-4 py-3">{stringOf(row, "policyName")}</td><td className="px-4 py-3">{stringOf(row, "threshold")}</td><td className="px-4 py-3">{stringOf(row, "burst")}</td><td className="px-4 py-3">{stringOf(row, "action")}</td><td className="px-4 py-3"><span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700">{stringOf(row, "status")}</span></td><td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "updatedAt")}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]" data-help-id="security-policy-diagnostics">
        <DiagnosticCard
          actions={(
            <>
              <MemberLinkButton href={stringOf(page, "menuPermissionDiagnosticSqlDownloadUrl")} variant="info">
                {en ? "Download SQL" : "진단 SQL 다운로드"}
              </MemberLinkButton>
              <MemberLinkButton href={stringOf(page, "menuPermissionAuthGroupUrl")} variant="secondary">
                {en ? "Open Auth Group" : "권한 그룹 열기"}
              </MemberLinkButton>
              <MemberLinkButton href={stringOf(page, "menuPermissionEnvironmentUrl")} variant="secondary">
                {en ? "Open Environment Management" : "환경관리 열기"}
              </MemberLinkButton>
            </>
          )}
          description={stringOf(diagnostics, "message") || (en ? "No diagnostic message." : "진단 메시지가 없습니다.")}
          eyebrow={en ? "Menu Permission Diagnostics" : "메뉴 권한 진단"}
          status={duplicatedMenuUrls.length || duplicatedViewMappings.length ? (en ? "Needs Cleanup" : "정리 필요") : (en ? "Healthy" : "정상")}
          statusTone={duplicatedMenuUrls.length || duplicatedViewMappings.length ? "warning" : "healthy"}
          summary={(
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-4">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Duplicated Menu URLs" : "중복 메뉴 URL"}</p>
                  <p className="mt-2 text-2xl font-black">{stringOf(diagnostics, "menuUrlDuplicateCount") || "0"}</p>
                </div>
                <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-4">
                  <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Duplicated VIEW Mappings" : "중복 VIEW 매핑"}</p>
                  <p className="mt-2 text-2xl font-black">{stringOf(diagnostics, "viewFeatureDuplicateCount") || "0"}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-4">
                <p className="text-xs font-bold text-amber-700">{en ? "Cleanup Recommendations" : "정리 추천"}</p>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  {en
                    ? `Review ${stringOf(diagnostics, "cleanupRecommendationCount") || "0"} duplicated targets and keep one canonical menu / VIEW feature per route.`
                    : `${stringOf(diagnostics, "cleanupRecommendationCount") || "0"}건의 중복 대상을 검토하고, 라우트별로 대표 메뉴 1건과 대표 VIEW 기능 1건만 유지하는 것을 권장합니다.`}
                </p>
              </div>
              <p className="mt-4 text-xs text-gray-400">{en ? "Generated At" : "생성 시각"}: {stringOf(diagnostics, "generatedAt") || "-"}</p>
            </>
          )}
          title={en ? "Duplicate URL / VIEW Mapping Check" : "중복 URL / VIEW 매핑 점검"}
        />
        <article className="gov-card p-0 overflow-hidden">
          <GridToolbar title={en ? "Detected Duplicate Targets" : "감지된 중복 대상"} />
          <div className="max-h-[420px] overflow-auto">
            {duplicatedMenuUrls.length === 0 && duplicatedViewMappings.length === 0 ? (
              <div className="px-6 py-10 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No duplicate active menu URL or VIEW feature mapping was found." : "활성 메뉴 URL 또는 VIEW 기능 중복 매핑이 없습니다."}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {duplicatedMenuUrls.map((row, idx) => (
                  <div className="px-6 py-4" key={`menu-url-${idx}`}>
                    <p className="text-xs font-bold text-amber-700">{en ? "Duplicated Menu URL" : "중복 메뉴 URL"}</p>
                    <p className="mt-2 font-mono text-[13px]">{stringOf(row, "menuUrl")}</p>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Menu Codes" : "메뉴 코드"}: {stringOf(row, "menuCodes")}</p>
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm">
                      <p className="font-bold text-amber-800">{en ? "Recommended Cleanup" : "추천 정리안"}</p>
                      <p className="mt-1 text-amber-900">{en ? "Primary Menu" : "대표 유지 메뉴"}: <span className="font-mono">{stringOf(row, "recommendedPrimaryMenuCode")}</span></p>
                      <p className="mt-1 text-amber-900">{en ? "Disable Candidates" : "비활성 후보"}: <span className="font-mono">{stringOf(row, "recommendedDisableMenuCodes") || "-"}</span></p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <MemberLinkButton href={buildEnvironmentUrl(stringOf(row, "recommendedPrimaryMenuCode"))} size="xs" variant="secondary">
                          {en ? "Open Environment" : "환경관리 열기"}
                        </MemberLinkButton>
                        <MemberLinkButton href={buildAuthGroupUrl(stringOf(row, "recommendedPrimaryMenuCode"))} size="xs" variant="secondary">
                          {en ? "Open Auth Group" : "권한 그룹 열기"}
                        </MemberLinkButton>
                      </div>
                      <CopyableCodeBlock
                        copiedLabel={en ? "Copied" : "복사됨"}
                        copied={copiedSqlKey === `menu-${idx}`}
                        copyLabel={en ? "Copy SQL" : "SQL 복사"}
                        onCopy={() => { void copySqlPreview(`menu-${idx}`, stringOf(row, "recommendedSqlPreview")); }}
                        title="SQL Preview"
                        value={stringOf(row, "recommendedSqlPreview")}
                      />
                    </div>
                  </div>
                ))}
                {duplicatedViewMappings.map((row, idx) => (
                  <div className="px-6 py-4" key={`view-map-${idx}`}>
                    <p className="text-xs font-bold text-red-700">{en ? "Duplicated VIEW Mapping" : "중복 VIEW 매핑"}</p>
                    <p className="mt-2 font-mono text-[13px]">{stringOf(row, "menuUrl")}</p>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Menu Codes" : "메뉴 코드"}: {stringOf(row, "menuCodes")}</p>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Feature Codes" : "기능 코드"}: {stringOf(row, "featureCodes")}</p>
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm">
                      <p className="font-bold text-red-800">{en ? "Recommended Cleanup" : "추천 정리안"}</p>
                      <p className="mt-1 text-red-900">{en ? "Primary Menu" : "대표 유지 메뉴"}: <span className="font-mono">{stringOf(row, "recommendedPrimaryMenuCode") || "-"}</span></p>
                      <p className="mt-1 text-red-900">{en ? "Primary VIEW Feature" : "대표 VIEW 기능"}: <span className="font-mono">{stringOf(row, "recommendedPrimaryFeatureCode")}</span></p>
                      <p className="mt-1 text-red-900">{en ? "Remove Candidates" : "정리 후보 기능"}: <span className="font-mono">{stringOf(row, "recommendedRemoveFeatureCodes") || "-"}</span></p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <MemberLinkButton href={buildEnvironmentUrl(stringOf(row, "recommendedPrimaryMenuCode"))} size="xs" variant="secondary">
                          {en ? "Open Environment" : "환경관리 열기"}
                        </MemberLinkButton>
                        <MemberLinkButton href={buildAuthGroupUrl(stringOf(row, "recommendedPrimaryMenuCode"), stringOf(row, "recommendedPrimaryFeatureCode"))} size="xs" variant="secondary">
                          {en ? "Open Focused Auth Group" : "포커스 권한 그룹 열기"}
                        </MemberLinkButton>
                      </div>
                      <CopyableCodeBlock
                        copiedLabel={en ? "Copied" : "복사됨"}
                        copied={copiedSqlKey === `view-${idx}`}
                        copyLabel={en ? "Copy SQL" : "SQL 복사"}
                        onCopy={() => { void copySqlPreview(`view-${idx}`, stringOf(row, "recommendedSqlPreview")); }}
                        title="SQL Preview"
                        value={stringOf(row, "recommendedSqlPreview")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3" data-help-id="security-policy-playbooks">
        {playbooks.map((item, idx) => <article className="gov-card" key={idx}><h3 className="text-lg font-bold">{stringOf(item, "title")}</h3><p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body")}</p></article>)}
      </section>
      </AdminPolicyPageFrame>
    </AdminPageShell>
  );
}
