import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { CompanyListPagePayload, fetchCompanyListPage } from "../../lib/api";

export function CompanyListMigrationPage() {
  const [page, setPage] = useState<CompanyListPagePayload | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load(next?: { pageIndex?: number; searchKeyword?: string; sbscrbSttus?: string; }) {
    const payload = await fetchCompanyListPage(next);
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
        <h1>회원사 목록 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      <CanView allowed={!!page?.canViewCompanyList} fallback={<section className="panel"><p className="state-text">회원사 목록을 볼 권한이 없습니다.</p></section>}>
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
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>기관 ID</th>
                  <th>기관명</th>
                  <th>사업자번호</th>
                  <th>대표자</th>
                  <th>회원유형</th>
                </tr>
              </thead>
              <tbody>
                {(page?.company_list || []).length === 0 ? (
                  <tr><td colSpan={5}>데이터가 없습니다.</td></tr>
                ) : (page?.company_list || []).map((row, index) => (
                  <tr key={`${String(row.insttId || "instt")}-${index}`}>
                    <td>{String(row.insttId || "-")}</td>
                    <td>{String(row.cmpnyNm || "-")}</td>
                    <td>{String(row.bizrno || "-")}</td>
                    <td>{String(row.cxfc || "-")}</td>
                    <td>{String(row.entrprsSeCode || "-")}</td>
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
