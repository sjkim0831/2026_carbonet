import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { AdminListPagePayload, fetchAdminListPage } from "../../lib/api";

export function AdminListMigrationPage() {
  const [page, setPage] = useState<AdminListPagePayload | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load(next?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
    const payload = await fetchAdminListPage(next);
    setPage(payload);
    setSearchKeyword(String(payload.searchKeyword || next?.searchKeyword || ""));
    setStatus(String(payload.sbscrbSttus || next?.sbscrbSttus || ""));
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>관리자 목록 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      <CanView allowed={!!page?.canViewAdminList} fallback={<section className="panel"><p className="state-text">화면을 불러오는 중입니다.</p></section>}>
        <section className="panel">
          <div className="toolbar">
            <label className="field">
              <span>검색어</span>
              <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
            </label>
            <label className="field">
              <span>상태</span>
              <input value={status} onChange={(e) => setStatus(e.target.value)} />
            </label>
            <button className="primary-button" onClick={() => load({ searchKeyword, sbscrbSttus: status })} type="button">조회</button>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Admin Members</p>
              <h2>총 {page?.totalCount || 0}명</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>관리자 ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>조직</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {(page?.member_list || []).length === 0 ? (
                  <tr><td colSpan={5}>데이터가 없습니다.</td></tr>
                ) : (page?.member_list || []).map((row, index) => (
                  <tr key={`${String(row.emplyrId || "admin")}-${index}`}>
                    <td>{String(row.emplyrId || "-")}</td>
                    <td>{String(row.userNm || "-")}</td>
                    <td>{String(row.emailAdres || "-")}</td>
                    <td>{String(row.orgnztId || "-")}</td>
                    <td>{String(row.emplyrStusCode || "-")}</td>
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
