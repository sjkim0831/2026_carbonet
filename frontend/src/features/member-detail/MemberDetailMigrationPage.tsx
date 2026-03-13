import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { fetchMemberDetailPage, MemberDetailPagePayload } from "../../lib/api";

function resolveInitialMemberId() {
  if (typeof window === "undefined") return "TEST1";
  return new URLSearchParams(window.location.search).get("memberId") || "TEST1";
}

export function MemberDetailMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const [memberId, setMemberId] = useState(initialMemberId);
  const [page, setPage] = useState<MemberDetailPagePayload | null>(null);
  const [error, setError] = useState("");

  async function load(target: string) {
    const payload = await fetchMemberDetailPage(target);
    setPage(payload);
    setMemberId(target);
  }

  useEffect(() => {
    load(initialMemberId).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원 상세 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      <section className="panel">
        <div className="toolbar">
          <label className="field"><span>회원 ID</span><input value={memberId} onChange={(e) => setMemberId(e.target.value)} /></label>
          <button className="primary-button" onClick={() => load(memberId)} type="button">조회</button>
        </div>
      </section>
      <CanView allowed={!!page?.canViewMemberDetail} fallback={<section className="panel"><p className="state-text">회원 상세를 볼 권한이 없거나 대상이 없습니다.</p></section>}>
        <section className="panel">
          <div className="meta-grid">
            <div><dt>회원 ID</dt><dd>{String(page?.member?.entrprsmberId || "-")}</dd></div>
            <div><dt>이름</dt><dd>{String(page?.member?.applcntNm || "-")}</dd></div>
            <div><dt>회사명</dt><dd>{String(page?.member?.cmpnyNm || "-")}</dd></div>
            <div><dt>회원유형</dt><dd>{String(page?.membershipTypeLabel || "-")}</dd></div>
            <div><dt>상태</dt><dd>{String(page?.statusLabel || "-")}</dd></div>
            <div><dt>연락처</dt><dd>{String(page?.phoneNumber || "-")}</dd></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Password Reset History</p>
              <h2>비밀번호 초기화 이력</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>초기화 시각</th>
                  <th>처리자</th>
                  <th>사유</th>
                </tr>
              </thead>
              <tbody>
                {(page?.passwordResetHistoryRows || []).length === 0 ? (
                  <tr><td colSpan={3}>이력이 없습니다.</td></tr>
                ) : (page?.passwordResetHistoryRows || []).map((row, index) => (
                  <tr key={`${row.resetPnttm || "reset"}-${index}`}>
                    <td>{row.resetPnttm || "-"}</td>
                    <td>{row.resetByUserId || "-"}</td>
                    <td>{row.resetReason || "-"}</td>
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
