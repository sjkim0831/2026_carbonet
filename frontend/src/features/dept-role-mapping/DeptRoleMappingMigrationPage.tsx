import { useEffect, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import {
  DeptRolePagePayload,
  FrontendSession,
  fetchDeptRolePage,
  fetchFrontendSession,
  saveDeptRoleMapping,
  saveDeptRoleMember
} from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function t(page: DeptRolePagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
}

function renderRoleProfilePreview(
  page: DeptRolePagePayload | null,
  profile?: { displayTitle?: string; priorityWorks?: string[]; description?: string } | null
) {
  if (!profile || (!profile.displayTitle && !(profile.priorityWorks || []).length && !profile.description)) {
    return (
      <div className="mt-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[var(--kr-gov-text-secondary)]">
        {t(page, "연결된 프로필 메타데이터가 없습니다.", "No linked role profile metadata.")}
      </div>
    );
  }
  return (
    <div className="mt-2 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-[var(--kr-gov-text-secondary)]" data-help-id="dept-role-role-profile">
      <p className="font-bold text-[var(--kr-gov-blue)]">{profile.displayTitle || "-"}</p>
      {(profile.priorityWorks || []).length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(profile.priorityWorks || []).map((item) => (
            <span className="rounded-full bg-white px-2 py-0.5 font-bold text-[var(--kr-gov-blue)]" key={item}>{item}</span>
          ))}
        </div>
      ) : null}
      {profile.description ? <p className="mt-2">{profile.description}</p> : null}
    </div>
  );
}

export function DeptRoleMappingMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<DeptRolePagePayload | null>(null);
  const [insttId, setInsttId] = useState("");
  const [memberSearchKeyword, setMemberSearchKeyword] = useState("");
  const [memberSearchDraft, setMemberSearchDraft] = useState("");
  const [memberPageIndex, setMemberPageIndex] = useState(1);
  const [deptDrafts, setDeptDrafts] = useState<Record<string, string>>({});
  const [memberDrafts, setMemberDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function applyPayload(sessionPayload: FrontendSession, payload: DeptRolePagePayload) {
    setSession(sessionPayload);
    setPage(payload);
    setInsttId(payload.selectedInsttId || "");
    setMemberSearchKeyword(String(payload.companyMemberSearchKeyword || ""));
    setMemberSearchDraft(String(payload.companyMemberSearchKeyword || ""));
    setMemberPageIndex(Math.max(1, Number(payload.companyMemberPageIndex || 1)));
    const nextDeptDrafts: Record<string, string> = {};
    payload.departmentMappings.forEach((row) => {
      nextDeptDrafts[`${row.insttId}:${row.deptNm}`] = row.recommendedRoleCode || row.authorCode || "";
    });
    const nextMemberDrafts: Record<string, string> = {};
    payload.companyMembers.forEach((row) => {
      nextMemberDrafts[row.userId] = row.authorCode || "";
    });
    setDeptDrafts(nextDeptDrafts);
    setMemberDrafts(nextMemberDrafts);
  }

  function loadPage(
    nextInsttId?: string,
    existingSession?: FrontendSession | null,
    options?: { memberSearchKeyword?: string; memberPageIndex?: number }
  ) {
    setError("");
    return Promise.all([
      existingSession ? Promise.resolve(existingSession) : fetchFrontendSession(),
      fetchDeptRolePage({
        insttId: nextInsttId ?? insttId,
        memberSearchKeyword: options?.memberSearchKeyword ?? memberSearchKeyword,
        memberPageIndex: options?.memberPageIndex ?? memberPageIndex
      })
    ]).then(([sessionPayload, payload]) => {
      applyPayload(sessionPayload, payload);
      return { sessionPayload, payload };
    });
  }

  useEffect(() => {
    loadPage(insttId, undefined, { memberSearchKeyword, memberPageIndex }).catch((err: Error) => setError(err.message));
  }, [insttId, memberSearchKeyword, memberPageIndex]);

  const canViewCompanySelector = !!page;
  const canUseAllCompanies = !!page?.canManageAllCompanies;
  const canUseOwnCompany = !!page?.canManageOwnCompany;
  const roleProfilesByAuthorCode = page?.roleProfilesByAuthorCode || {};
  const currentMemberPage = Math.max(1, Number(page?.companyMemberPageIndex || memberPageIndex || 1));
  const totalMemberPages = Math.max(1, Number(page?.companyMemberTotalPages || 1));
  const visibleMemberPages = Array.from({ length: totalMemberPages }, (_, index) => index + 1)
    .filter((pageNumber) => Math.abs(pageNumber - currentMemberPage) <= 2 || pageNumber === 1 || pageNumber === totalMemberPages);

  function handleMemberSearchSubmit() {
    setMemberPageIndex(1);
    setMemberSearchKeyword(memberSearchDraft.trim());
  }

  function handleCompanyChange(nextInsttId: string) {
    setInsttId(nextInsttId);
    setMemberPageIndex(1);
  }

  function handleDeptSave(row: Record<string, string>) {
    if (!session) return;
    setError("");
    setMessage("");
    saveDeptRoleMapping(session, {
      insttId: row.insttId || insttId,
      cmpnyNm: row.cmpnyNm || "",
      deptNm: row.deptNm || "",
      authorCode: deptDrafts[`${row.insttId}:${row.deptNm}`] || ""
    })
      .then(() => loadPage(row.insttId || insttId, session, { memberSearchKeyword, memberPageIndex }))
      .then(() =>
        setMessage(
          t(page, `${row.deptNm} 부서 권한을 저장했습니다.`, `Saved the department role for ${row.deptNm}.`)
        )
      )
      .catch((err: Error) => setError(err.message));
  }

  function handleMemberSave(userId: string) {
    if (!session || !insttId) return;
    setError("");
    setMessage("");
    saveDeptRoleMember(session, {
      insttId,
      entrprsMberId: userId,
      authorCode: memberDrafts[userId] || ""
    })
      .then(() => loadPage(insttId, session, { memberSearchKeyword, memberPageIndex }))
      .then(() =>
        setMessage(
          t(page, `${userId} 회원 권한을 저장했습니다.`, `Saved the member role for ${userId}.`)
        )
      )
      .catch((err: Error) => setError(err.message));
  }

  return (
    <AdminPageShell
      actions={(
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
          {page?.mappingCount ?? 0}{t(page, "개 부서", " departments")}
        </span>
      )}
      breadcrumbs={[
        { label: t(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: t(page, "회원/권한", "Members/Authority") },
        { label: t(page, "부서 권한 맵핑", "Department Role Mapping") }
      ]}
      subtitle={t(
        page,
        "최상단에서 회사를 선택하고, 해당 회사 회원 목록과 부서별 기본 Role 맵핑을 함께 확인하는 화면입니다.",
        "Select a company first, then review company members and default department role mappings together."
      )}
      title={t(page, "부서 권한 맵핑", "Department Role Mapping")}
      loading={!page && !error}
      loadingLabel={t(page, "부서 권한 정보를 불러오는 중입니다.", "Loading department role data.")}
    >
      {(page?.deptRoleError || error) ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {page?.deptRoleError || error}
        </section>
      ) : null}
      {page?.deptRoleUpdated || message ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message || (page?.deptRoleTargetInsttId
            ? t(
              page,
              `${page.deptRoleTargetInsttId} 부서 권한 맵핑이 저장되었습니다.`,
              `Saved department role mappings for ${page.deptRoleTargetInsttId}.`
            )
            : t(page, "부서 권한 맵핑이 저장되었습니다.", "Department role mappings have been saved."))}
        </section>
      ) : null}
      {page?.deptRoleMessage && !message ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {page.deptRoleMessage}
        </section>
      ) : null}

      <CanView
        allowed={canViewCompanySelector}
        fallback={
          <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">
              {t(page, "부서 권한 화면을 불러올 수 없습니다.", "Unable to load the department role page.")}
            </p>
          </section>
        }
      >
        <section className="gov-card" data-help-id="dept-role-company">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">account_tree</span>
            <h3 className="text-lg font-bold">{t(page, "선택 회사의 부서 권한 목록", "Department roles for the selected company")}</h3>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]">{t(page, "회사명", "Company")}</label>
            <select
              className="max-w-md w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
              disabled={!canUseAllCompanies && !canUseOwnCompany}
              value={insttId}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              {(page?.departmentCompanyOptions || []).map((option) => (
                <option key={option.insttId} value={option.insttId}>
                  {option.cmpnyNm}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden" data-help-id="dept-role-departments">
            <div className="flex items-center justify-between gap-3 bg-gray-50 border-b border-[var(--kr-gov-border-light)] px-4 py-4">
              <h4 className="font-black">{t(page, "선택 회사 부서 기본 권한", "Default department roles for the selected company")}</h4>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
                {page?.mappingCount ?? 0}{t(page, "개 부서", " departments")}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-4 py-3">{t(page, "회사", "Company")}</th>
                    <th className="px-4 py-3">{t(page, "부서명", "Department")}</th>
                    <th className="px-4 py-3">{t(page, "권장 Role", "Recommended role")}</th>
                    <th className="px-4 py-3">{t(page, "권한 수정", "Update role")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(page?.departmentMappings || []).map((row) => {
                    const key = `${row.insttId}:${row.deptNm}`;
                    return (
                      <tr key={key}>
                        <td className="px-4 py-3">{row.cmpnyNm}</td>
                        <td className="px-4 py-3">{row.deptNm}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{row.recommendedRoleName || row.authorNm || "-"}</div>
                          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.authorCode || "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              className="min-w-[16rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                              disabled={!canUseAllCompanies && !canUseOwnCompany}
                              value={deptDrafts[key] || ""}
                              onChange={(e) =>
                                setDeptDrafts((current) => ({ ...current, [key]: e.target.value }))
                              }
                            >
                              {(page?.departmentAuthorGroups || []).map((group) => (
                                <option key={group.authorCode} value={group.authorCode}>
                                  {group.authorNm} ({group.authorCode})
                                </option>
                              ))}
                            </select>
                            <PermissionButton
                              allowed={canUseAllCompanies || canUseOwnCompany}
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white"
                              onClick={() => handleDeptSave(row)}
                              reason={t(
                                page,
                                "전체 회사 또는 자기 회사 관리 권한이 있어야 부서 기본 Role을 저장할 수 있습니다.",
                                "You need all-company or own-company access to save a department role."
                              )}
                              type="button"
                            >
                              {t(page, "저장", "Save")}
                            </PermissionButton>
                          </div>
                          {renderRoleProfilePreview(page, roleProfilesByAuthorCode[deptDrafts[key] || row.authorCode || ""])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden" data-help-id="dept-role-members">
            <div className="flex items-center justify-between gap-3 bg-gray-50 border-b border-[var(--kr-gov-border-light)] px-4 py-4">
              <h4 className="font-black">{t(page, "선택 회사 회원 권한 목록", "Member roles for the selected company")}</h4>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
                {page?.companyMemberCount ?? 0}{t(page, "명", " members")}
              </span>
            </div>
            <div className="flex flex-col gap-3 border-b border-[var(--kr-gov-border-light)] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full max-w-xl items-center gap-2">
                <input
                  className="h-10 flex-1 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-3 text-sm"
                  placeholder={t(page, "회원 ID, 이름, 부서명 검색", "Search by member ID, name, or department")}
                  value={memberSearchDraft}
                  onChange={(e) => setMemberSearchDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleMemberSearchSubmit();
                    }
                  }}
                />
                <button
                  className="inline-flex h-10 items-center rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-blue)] px-4 text-sm font-bold text-[var(--kr-gov-blue)] hover:bg-blue-50"
                  onClick={handleMemberSearchSubmit}
                  type="button"
                >
                  {t(page, "검색", "Search")}
                </button>
              </div>
              <p className="text-xs text-[var(--kr-gov-text-secondary)]">
                {t(page, `페이지 ${currentMemberPage} / ${totalMemberPages}`, `Page ${currentMemberPage} / ${totalMemberPages}`)}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-4 py-3">{t(page, "회원 ID", "Member ID")}</th>
                    <th className="px-4 py-3">{t(page, "이름", "Name")}</th>
                    <th className="px-4 py-3">{t(page, "부서명", "Department")}</th>
                    <th className="px-4 py-3">{t(page, "현재 권한", "Current role")}</th>
                    <th className="px-4 py-3">{t(page, "권한 수정", "Update role")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(page?.companyMembers || []).length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        {t(page, "선택한 회사의 회원이 없습니다.", "No members exist for the selected company.")}
                      </td>
                    </tr>
                  ) : (
                    (page?.companyMembers || []).map((row) => (
                      <tr key={row.userId}>
                        <td className="px-4 py-3 font-semibold">{row.userId}</td>
                        <td className="px-4 py-3">{row.userNm}</td>
                        <td className="px-4 py-3">{row.deptNm || t(page, "미지정", "Unassigned")}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{row.authorNm || t(page, "권한 미지정", "No role assigned")}</div>
                          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.authorCode || "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              className="min-w-[16rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                              disabled={!canUseAllCompanies && !canUseOwnCompany}
                              value={memberDrafts[row.userId] || ""}
                              onChange={(e) =>
                                setMemberDrafts((current) => ({ ...current, [row.userId]: e.target.value }))
                              }
                            >
                              {(page?.memberAssignableAuthorGroups || []).map((group) => (
                                <option key={group.authorCode} value={group.authorCode}>
                                  {group.authorNm} ({group.authorCode})
                                </option>
                              ))}
                            </select>
                            <PermissionButton
                              allowed={canUseAllCompanies || canUseOwnCompany}
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white"
                              onClick={() => handleMemberSave(row.userId)}
                              reason={t(
                                page,
                                "전체 회사 또는 자기 회사 관리 권한이 있어야 회원 권한을 저장할 수 있습니다.",
                                "You need all-company or own-company access to save a member role."
                              )}
                              type="button"
                            >
                              {t(page, "저장", "Save")}
                            </PermissionButton>
                          </div>
                          {renderRoleProfilePreview(page, roleProfilesByAuthorCode[memberDrafts[row.userId] || row.authorCode || ""])}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-center gap-1 border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-4 py-3">
              <button
                className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentMemberPage <= 1}
                onClick={() => setMemberPageIndex(1)}
                type="button"
              >
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button
                className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentMemberPage <= 1}
                onClick={() => setMemberPageIndex(Math.max(1, currentMemberPage - 1))}
                type="button"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {visibleMemberPages.map((pageNumber) => (
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded border text-sm ${pageNumber === currentMemberPage ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] font-bold text-white" : "border-transparent hover:border-gray-200 hover:bg-white"}`}
                  key={pageNumber}
                  onClick={() => setMemberPageIndex(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentMemberPage >= totalMemberPages}
                onClick={() => setMemberPageIndex(Math.min(totalMemberPages, currentMemberPage + 1))}
                type="button"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button
                className="rounded border border-transparent p-1 hover:border-gray-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentMemberPage >= totalMemberPages}
                onClick={() => setMemberPageIndex(totalMemberPages)}
                type="button"
              >
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </div>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
