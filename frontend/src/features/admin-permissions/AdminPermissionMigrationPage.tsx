import { useEffect, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import { AdminPermissionPagePayload, fetchAdminPermissionPage, fetchFrontendSession, FrontendSession, saveAdminPermission } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function text(page: AdminPermissionPagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
}

function resolveInitialEmplyrId() {
  if (typeof window === "undefined") return "webmaster";
  return getSearchParam("emplyrId") || "webmaster";
}

export function AdminPermissionMigrationPage() {
  const initialEmplyrId = resolveInitialEmplyrId();
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AdminPermissionPagePayload | null>(null);
  const [authorCode, setAuthorCode] = useState("");
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(target: string) {
    const [sessionPayload, pagePayload] = await Promise.all([
      session ? Promise.resolve(session) : fetchFrontendSession(),
      fetchAdminPermissionPage(target)
    ]);
    setSession(sessionPayload);
    setPage(pagePayload);
    setAuthorCode(String(pagePayload.permissionSelectedAuthorCode || ""));
    setFeatureCodes((pagePayload.permissionEffectiveFeatureCodes as string[]) || []);
  }

  useEffect(() => {
    load(initialEmplyrId).catch((err: Error) => setError(err.message));
  }, []);

  function toggleFeature(code: string) {
    setFeatureCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  const selectedAuthorName = String(page?.permissionSelectedAuthorName || "-");
  const featureCount = Number(page?.permissionFeatureCount || featureCodes.length);
  const pageCount = Number(page?.permissionPageCount || page?.permissionFeatureSections?.length || 0);
  const addedFeatureCodes = new Set((page?.permissionAddedFeatureCodes as string[] | undefined) || []);
  const removedFeatureCodes = new Set((page?.permissionRemovedFeatureCodes as string[] | undefined) || []);
  const baseFeatureCodes = new Set((page?.permissionBaseFeatureCodes as string[] | undefined) || []);
  const readOnly = Boolean(page?.adminAccountReadOnly);
  const validationErrors = (page?.adminPermissionErrors as string[] | undefined) || [];

  async function handleSave() {
    if (!session || !page?.adminPermissionTarget) return;
    setError("");
    setMessage("");
    try {
      await saveAdminPermission(session, { emplyrId: page.adminPermissionTarget.emplyrId, authorCode, featureCodes });
      setMessage("관리자 권한을 저장했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: text(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: text(page, "회원·권한 관리", "Member / Authority Management") },
        { label: text(page, "관리자 사용자 추가", "Administrator Account") }
      ]}
      subtitle={text(
        page,
        "관리자 계정 정보와 권한, 소속 정보를 확인하고 권한 예외를 조정합니다.",
        "Review administrator account data, authority, and affiliation, then adjust permission overrides."
      )}
      title={text(page, "관리자 사용자 추가", "Administrator Account")}
    >
      {page?.adminPermissionError || error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{String(page?.adminPermissionError || error)}</section> : null}
      {validationErrors.length > 0 ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-bold mb-1">{text(page, "입력값을 확인해 주세요.", "Please check the input values.")}</p>
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        </section>
      ) : null}
      {page?.adminPermissionUpdated ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{text(page, "관리자 권한이 저장되었습니다.", "Administrator permissions have been saved.")}</section> : null}
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</section> : null}
      <CanView allowed={!!page?.canViewAdminPermissionEdit} fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">{text(page, "편집 대상 관리자를 조회하세요.", "Look up an administrator to edit.")}</p></section>}>
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm mb-6" data-help-id="admin-permission-summary">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">admin_panel_settings</span>
            <div>
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">{text(page, "관리자 계정 요약", "Administrator Account Summary")}</h3>
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{text(page, "현재 관리자 계정과 롤 기준 권한, 개별 예외 권한을 함께 관리합니다.", "Manage the current admin account together with role-based permissions and account-specific overrides.")}</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p><span className="font-bold">관리자 ID:</span> {page?.adminPermissionTarget?.emplyrId || "-"}</p>
              <p className="mt-1"><span className="font-bold">이름:</span> {page?.adminPermissionTarget?.userNm || "-"}</p>
              <p className="mt-1"><span className="font-bold">이메일:</span> {page?.adminPermissionTarget?.emailAdres || "-"}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
              <p><span className="font-bold">상태:</span> {String(page?.adminPermissionStatusLabel || "-")}</p>
              <p className="mt-1"><span className="font-bold">가입일:</span> {String(page?.adminPermissionJoinedAt || "-")}</p>
              <p className="mt-1"><span className="font-bold">기관 ID:</span> {page?.adminPermissionTarget?.insttId || "-"}</p>
            </div>
          </div>
        </section>
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm" data-help-id="admin-permission-features">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield</span>
            <div>
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">{text(page, "권한 롤 및 개별 권한", "Role and Individual Permissions")}</h3>
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{text(page, "관리자 롤을 기준으로 체크를 맞춘 뒤, 계정별 추가 허용 또는 제외 권한을 직접 조정합니다.", "Align the baseline to the administrator role, then adjust account-specific additions or removals directly.")}</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block">
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">{text(page, "기준 권한 롤", "Base Role")} <span className="text-red-500">*</span></span>
                  <select className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseAdminPermissionSave || readOnly} value={authorCode} onChange={(e) => setAuthorCode(e.target.value)}>
                    <option value="">{text(page, "권한 롤 선택", "Select a role")}</option>
                    {(page?.permissionAuthorGroups || []).map((group) => <option key={group.authorCode} value={group.authorCode}>{group.authorNm} ({group.authorCode})</option>)}
                  </select>
                </label>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4 text-sm">
                <p><span className="font-bold">선택 롤:</span> {selectedAuthorName}</p>
                <p className="mt-1"><span className="font-bold">최종 권한 수:</span> {featureCount}</p>
                <p className="mt-1"><span className="font-bold">대상 메뉴 수:</span> {pageCount}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-slate-100 text-slate-700">{text(page, "기본 롤 권한", "Base role permission")}</span>
              <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-emerald-100 text-emerald-700">{text(page, "관리자별 추가", "Admin-specific add")}</span>
              <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-red-100 text-red-700">{text(page, "관리자별 제외", "Admin-specific remove")}</span>
            </div>
            <div className="space-y-4">
              {(page?.permissionFeatureSections || []).map((section) => (
                <section className="rounded-[var(--kr-gov-radius)] border border-slate-200" key={section.menuCode}>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{section.menuNm || section.menuNmEn || section.menuCode}</h4>
                      <p className="mt-1 text-xs text-slate-500">{section.menuUrl || text(page, "연결 URL 없음", "No linked URL")}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{section.features.length}{text(page, "개 기능", " features")}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                    {section.features.map((feature) => (
                      <label className="flex items-start gap-3 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-4 py-3" key={feature.featureCode}>
                        <input className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--kr-gov-blue)] focus:ring-[var(--kr-gov-focus)]" disabled={!page?.canUseAdminPermissionSave || readOnly} checked={featureCodes.includes(feature.featureCode)} onChange={() => toggleFeature(feature.featureCode)} type="checkbox" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{feature.featureNm || feature.featureCode}</span>
                            {addedFeatureCodes.has(feature.featureCode) ? <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700">{text(page, "추가", "Added")}</span> : null}
                            {removedFeatureCodes.has(feature.featureCode) ? <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-red-100 text-red-700">{text(page, "제외", "Removed")}</span> : null}
                            {baseFeatureCodes.has(feature.featureCode) && !removedFeatureCodes.has(feature.featureCode) ? <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">{text(page, "기본", "Base")}</span> : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{feature.featureCode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
        <div className="pt-2 flex justify-center gap-4">
          <a className="min-w-[180px] h-14 border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors flex items-center justify-center" href={buildLocalizedPath("/admin/member/admin_list", "/en/admin/member/admin_list")}>{text(page, "목록으로", "Back to list")}</a>
          <PermissionButton allowed={!!page?.canUseAdminPermissionSave && !readOnly} className="min-w-[220px] h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors shadow-lg" onClick={handleSave} reason={readOnly ? text(page, "상세 모드에서는 저장할 수 없습니다.", "Save is unavailable in detail mode.") : text(page, "webmaster만 관리자 권한을 저장할 수 있습니다.", "Only webmaster can save administrator permissions.")} type="button">{readOnly ? text(page, "상세 모드", "Detail mode") : text(page, "권한 저장", "Save permissions")}</PermissionButton>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
