import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { fetchPasswordResetPage, resetMemberPasswordAction } from "../../lib/api/client";

function resolveInitialMemberId() {
  if (typeof window === "undefined") return "TEST1";
  return new URLSearchParams(window.location.search).get("memberId") || "TEST1";
}

export function PasswordResetMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const [memberId, setMemberId] = useState(initialMemberId);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue(
    () => fetchPasswordResetPage({ memberId }),
    [memberId],
    {
      initialValue: null,
      onError: () => undefined
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;

  async function reload() {
    setActionError("");
    if (!await pageState.reload()) {
      setActionError("조회 실패");
    }
  }

  async function handleReset() {
    const session = sessionState.value;
    if (!session) return;
    setActionError("");
    setMessage("");
    try {
      const result = await resetMemberPasswordAction(session, memberId);
      setMessage(`임시 비밀번호: ${result.temporaryPassword}`);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "초기화 실패");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>비밀번호 초기화 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}
      <CanView allowed={!!page?.canViewResetHistory} fallback={<section className="panel"><p className="state-text">초기화 이력을 볼 수 없습니다.</p></section>}>
        <section className="panel" data-help-id="password-reset-actions">
          <div className="toolbar">
            <label className="field"><span>회원 ID</span><input value={memberId} onChange={(e) => setMemberId(e.target.value)} /></label>
            <div className="toolbar-actions">
              <PermissionButton allowed={true} className="primary-button" onClick={reload} type="button">조회</PermissionButton>
              <PermissionButton allowed={!!page?.canUseResetPassword} className="primary-button" onClick={handleReset} reason="회사 범위 관리자는 대상 회원 ID가 필요합니다." type="button">비밀번호 초기화</PermissionButton>
            </div>
          </div>
        </section>
        <section className="panel" data-help-id="password-reset-history">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>일시</th><th>회원 ID</th><th>수행자</th><th>IP</th><th>유형</th></tr></thead>
              <tbody>
                {((page?.passwordResetHistoryList as Array<Record<string,string>>) || []).map((row, idx) => (
                  <tr key={`${row.targetUserId}-${idx}`}>
                    <td>{row.resetAt}</td><td>{row.targetUserId}</td><td>{row.resetBy}</td><td>{row.resetIp}</td><td>{row.resetSource}</td>
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
