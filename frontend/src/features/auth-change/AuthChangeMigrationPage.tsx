import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import {
  AuthChangePagePayload,
  FrontendSession,
  fetchAuthChangePage,
  fetchFrontendSession,
  saveAdminAuthChange
} from "../../lib/api";

export function AuthChangeMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AuthChangePagePayload | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetchFrontendSession(), fetchAuthChangePage()])
      .then(([sessionPayload, pagePayload]) => {
        setSession(sessionPayload);
        setPage(pagePayload);
        const nextDrafts: Record<string, string> = {};
        pagePayload.roleAssignments.forEach((row) => {
          nextDrafts[row.emplyrId] = row.authorCode;
        });
        setDrafts(nextDrafts);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  function handleSave(emplyrId: string) {
    if (!session) {
      setError("세션 정보가 없습니다.");
      return;
    }
    setError("");
    setMessage("");
    saveAdminAuthChange(session, {
      emplyrId,
      authorCode: drafts[emplyrId]
    })
      .then((result) => {
        setMessage(`${result.emplyrId} 권한이 저장되었습니다.`);
      })
      .catch((err: Error) => setError(err.message));
  }

  const canViewSection = !!page;
  const canUseSave = !!page?.isWebmaster;

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>권한 변경 React 전환</h1>
        <p className="lede">
          관리자 권한 변경 화면을 React 컴포넌트로 전환하고, 행 단위 저장 버튼도 권한으로 사용 제어합니다.
        </p>
      </section>

      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}

      <CanView
        allowed={canViewSection}
        fallback={
          <section className="panel">
            <p className="state-text">권한 변경 화면을 불러올 수 없습니다.</p>
          </section>
        }
      >
        <section className="panel">
          <div className="toolbar">
            <div>
              <p className="caption">Current User</p>
              <h2>{page?.currentUserId || session?.userId || "-"}</h2>
            </div>
            <div className="stat-chip">{page?.assignmentCount ?? 0}명</div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Authority Change</p>
              <h2>관리자 권한 변경 대상</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>관리자 ID</th>
                  <th>이름</th>
                  <th>조직 ID</th>
                  <th>현재 권한 그룹</th>
                  <th>변경 가능 후보</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {(page?.roleAssignments || []).map((row) => {
                  const locked = row.emplyrId === "webmaster";
                  return (
                    <tr key={row.emplyrId}>
                      <td>{row.emplyrId}</td>
                      <td>{row.userNm}</td>
                      <td>{row.orgnztId || "-"}</td>
                      <td>
                        <strong>{row.authorNm || "미지정"}</strong>
                        <div className="caption">{row.authorCode}</div>
                      </td>
                      <td>
                        <div className="inline-form">
                          <select
                            disabled={!canUseSave || locked}
                            value={drafts[row.emplyrId] || ""}
                            onChange={(e) =>
                              setDrafts((current) => ({
                                ...current,
                                [row.emplyrId]: e.target.value
                              }))
                            }
                          >
                            {(page?.authorGroups || []).map((group) => (
                              <option key={group.authorCode} value={group.authorCode}>
                                {group.authorNm} ({group.authorCode})
                              </option>
                            ))}
                          </select>
                          <PermissionButton
                            allowed={canUseSave && !locked}
                            className="primary-button"
                            onClick={() => handleSave(row.emplyrId)}
                            reason={
                              locked
                                ? "webmaster 계정은 ROLE_SYSTEM_MASTER로 고정됩니다."
                                : "webmaster만 관리자 권한을 변경할 수 있습니다."
                            }
                            type="button"
                          >
                            저장
                          </PermissionButton>
                        </div>
                      </td>
                      <td>{row.emplyrSttusCode || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </CanView>
    </main>
  );
}
