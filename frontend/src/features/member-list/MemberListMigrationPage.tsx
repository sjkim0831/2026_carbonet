import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { fetchMemberListPage, MemberListPagePayload } from "../../lib/api";

export function MemberListMigrationPage() {
  const [page, setPage] = useState<MemberListPagePayload | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load(next?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; }) {
    const payload = await fetchMemberListPage(next);
    setPage(payload);
    setSearchKeyword(String(payload.searchKeyword || next?.searchKeyword || ""));
    setMembershipType(String(payload.membershipType || next?.membershipType || ""));
    setStatus(String(payload.sbscrbSttus || next?.sbscrbSttus || ""));
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원 목록 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      <CanView allowed={!!page?.canViewMemberList} fallback={<section className="panel"><p className="state-text">회원 목록을 불러오는 중입니다.</p></section>}>
        <section className="panel">
          <div className="toolbar">
            <label className="field"><span>검색어</span><input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} /></label>
            <label className="field"><span>회원유형</span><input value={membershipType} onChange={(e) => setMembershipType(e.target.value)} /></label>
            <label className="field"><span>상태</span><input value={status} onChange={(e) => setStatus(e.target.value)} /></label>
            <button className="primary-button" onClick={() => load({ searchKeyword, membershipType, sbscrbSttus: status })} type="button">조회</button>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Members</p>
              <h2>총 {page?.totalCount || 0}명</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>회사명</th>
                  <th>이메일</th>
                  <th>유형</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {(page?.member_list || []).length === 0 ? (
                  <tr><td colSpan={6}>데이터가 없습니다.</td></tr>
                ) : (page?.member_list || []).map((row, index) => (
                  <tr key={`${String(row.entrprsmberId || "member")}-${index}`}>
                    <td>{String(row.entrprsmberId || "-")}</td>
                    <td>{String(row.applcntNm || "-")}</td>
                    <td>{String(row.cmpnyNm || "-")}</td>
                    <td>{String(row.applcntEmailAdres || "-")}</td>
                    <td>{String(row.entrprsSeCode || "-")}</td>
                    <td>{String(row.entrprsMberSttus || "-")}</td>
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
