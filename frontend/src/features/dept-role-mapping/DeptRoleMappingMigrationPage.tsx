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

export function DeptRoleMappingMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<DeptRolePagePayload | null>(null);
  const [insttId, setInsttId] = useState("");
  const [deptDrafts, setDeptDrafts] = useState<Record<string, string>>({});
  const [memberDrafts, setMemberDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFrontendSession().then(setSession).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchDeptRolePage(insttId)
      .then((payload) => {
        setPage(payload);
        setInsttId(payload.selectedInsttId || "");
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
      })
      .catch((err: Error) => setError(err.message));
  }, [insttId]);

  const canViewCompanySelector = !!page;
  const canUseAllCompanies = !!page?.canManageAllCompanies;
  const canUseOwnCompany = !!page?.canManageOwnCompany;

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
      .then(() => setMessage(`${row.deptNm} 부서 권한을 저장했습니다.`))
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
      .then(() => setMessage(`${userId} 회원 권한을 저장했습니다.`))
      .catch((err: Error) => setError(err.message));
  }

  return (
    <AdminPageShell
      actions={(
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
          {page?.mappingCount ?? 0}개 부서
        </span>
      )}
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원/권한" },
        { label: "부서 권한 맵핑" }
      ]}
      subtitle="최상단에서 회사를 선택하고, 해당 회사 회원 목록과 부서별 기본 Role 맵핑을 함께 확인하는 화면입니다."
      title="부서 권한 맵핑"
    >
      {(page?.deptRoleError || error) ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {page?.deptRoleError || error}
        </section>
      ) : null}
      {page?.deptRoleUpdated || message ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message || (page?.deptRoleTargetInsttId ? `${page.deptRoleTargetInsttId} 부서 권한 맵핑이 저장되었습니다.` : "부서 권한 맵핑이 저장되었습니다.")}
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
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">부서 권한 화면을 불러올 수 없습니다.</p>
          </section>
        }
      >
        <section className="gov-card" data-help-id="dept-role-company">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">account_tree</span>
            <h3 className="text-lg font-bold">선택 회사의 부서 권한 목록</h3>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]">회사명</label>
            <select
              className="max-w-md w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
              disabled={!canUseAllCompanies && !canUseOwnCompany}
              value={insttId}
              onChange={(e) => setInsttId(e.target.value)}
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
              <h4 className="font-black">선택 회사 부서 기본 권한</h4>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
                {page?.mappingCount ?? 0}개 부서
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-4 py-3">회사</th>
                    <th className="px-4 py-3">부서명</th>
                    <th className="px-4 py-3">권장 Role</th>
                    <th className="px-4 py-3">권한 수정</th>
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
                              reason="전체 회사 또는 자기 회사 관리 권한이 있어야 부서 기본 Role을 저장할 수 있습니다."
                              type="button"
                            >
                              저장
                            </PermissionButton>
                          </div>
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
              <h4 className="font-black">선택 회사 회원 권한 목록</h4>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
                {page?.companyMemberCount ?? 0}명
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-4 py-3">회원 ID</th>
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3">부서명</th>
                    <th className="px-4 py-3">현재 권한</th>
                    <th className="px-4 py-3">권한 수정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(page?.companyMembers || []).length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        선택한 회사의 회원이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    (page?.companyMembers || []).map((row) => (
                      <tr key={row.userId}>
                        <td className="px-4 py-3 font-semibold">{row.userId}</td>
                        <td className="px-4 py-3">{row.userNm}</td>
                        <td className="px-4 py-3">{row.deptNm || "미지정"}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{row.authorNm || "권한 미지정"}</div>
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
                              reason="전체 회사 또는 자기 회사 관리 권한이 있어야 회원 권한을 저장할 수 있습니다."
                              type="button"
                            >
                              저장
                            </PermissionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
