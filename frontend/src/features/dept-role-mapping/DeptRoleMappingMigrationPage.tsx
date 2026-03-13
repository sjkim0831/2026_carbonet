import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import {
  DeptRolePagePayload,
  FrontendSession,
  fetchDeptRolePage,
  fetchFrontendSession,
  saveDeptRoleMapping,
  saveDeptRoleMember
} from "../../lib/api";

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
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>부서 권한 맵핑 React 전환</h1>
        <p className="lede">
          회사 선택, 부서 기본 Role 저장, 회원 권한 저장을 모두 권한 기반 노출/사용 제어로 전환합니다.
        </p>
      </section>

      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}

      <CanView
        allowed={canViewCompanySelector}
        fallback={<section className="panel"><p className="state-text">부서 권한 화면을 불러올 수 없습니다.</p></section>}
      >
        <section className="panel">
          <div className="toolbar">
            <div>
              <p className="caption">Current User</p>
              <h2>{page?.currentUserId || "-"}</h2>
            </div>
            <div className="toolbar-actions">
              <label className="field">
                <span>회사 선택</span>
                <select
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
              </label>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Department Roles</p>
              <h2>선택 회사의 부서 권한 목록</h2>
            </div>
            <div className="stat-chip">{page?.mappingCount ?? 0}개 부서</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>회사</th>
                  <th>부서명</th>
                  <th>권장 Role</th>
                  <th>권한 수정</th>
                </tr>
              </thead>
              <tbody>
                {(page?.departmentMappings || []).map((row) => {
                  const key = `${row.insttId}:${row.deptNm}`;
                  return (
                    <tr key={key}>
                      <td>{row.cmpnyNm}</td>
                      <td>{row.deptNm}</td>
                      <td>{row.recommendedRoleName || row.authorNm || "-"}</td>
                      <td>
                        <div className="inline-form">
                          <select
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
                            className="primary-button"
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
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Company Members</p>
              <h2>선택 회사 회원 권한 목록</h2>
            </div>
            <div className="stat-chip">{page?.companyMemberCount ?? 0}명</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>부서명</th>
                  <th>현재 권한</th>
                  <th>권한 수정</th>
                </tr>
              </thead>
              <tbody>
                {(page?.companyMembers || []).map((row) => (
                  <tr key={row.userId}>
                    <td>{row.userId}</td>
                    <td>{row.userNm}</td>
                    <td>{row.deptNm || "-"}</td>
                    <td>
                      <strong>{row.authorNm || "권한 미지정"}</strong>
                      <div className="caption">{row.authorCode || "-"}</div>
                    </td>
                    <td>
                      <div className="inline-form">
                        <select
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
                          className="primary-button"
                          onClick={() => handleMemberSave(row.userId)}
                          reason="전체 회사 또는 자기 회사 관리 권한이 있어야 회원 권한을 저장할 수 있습니다."
                          type="button"
                        >
                          저장
                        </PermissionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </CanView>
    </main>
  );
}
