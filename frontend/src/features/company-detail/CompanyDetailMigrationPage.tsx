import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { CompanyDetailPagePayload, fetchCompanyDetailPage } from "../../lib/api";

function resolveInitialInsttId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("insttId") || "";
}

export function CompanyDetailMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const [insttId, setInsttId] = useState(initialInsttId);
  const [page, setPage] = useState<CompanyDetailPagePayload | null>(null);

  async function load(target: string) {
    const payload = await fetchCompanyDetailPage(target);
    setPage(payload);
    setInsttId(target);
  }

  useEffect(() => {
    if (initialInsttId) {
      load(initialInsttId).catch(() => undefined);
    }
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원사 상세 React 전환</h1>
      </section>
      <section className="panel">
        <div className="toolbar">
          <label className="field"><span>기관 ID</span><input value={insttId} onChange={(e) => setInsttId(e.target.value)} placeholder="INSTT_..." /></label>
          <button className="primary-button" onClick={() => load(insttId)} type="button">조회</button>
        </div>
      </section>
      <CanView allowed={!!page?.canViewCompanyDetail} fallback={<section className="panel"><p className="state-text">회원사 상세를 볼 권한이 없거나 대상이 없습니다.</p></section>}>
        <section className="panel">
          <div className="meta-grid">
            <div><dt>기관명</dt><dd>{String(page?.company?.insttNm || "-")}</dd></div>
            <div><dt>대표자</dt><dd>{String(page?.company?.reprsntNm || "-")}</dd></div>
            <div><dt>사업자번호</dt><dd>{String(page?.company?.bizrno || "-")}</dd></div>
            <div><dt>회원유형</dt><dd>{String(page?.companyTypeLabel || "-")}</dd></div>
            <div><dt>상태</dt><dd>{String(page?.companyStatusLabel || "-")}</dd></div>
            <div><dt>담당자 이메일</dt><dd>{String(page?.company?.chargerEmail || "-")}</dd></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Company Files</p>
              <h2>첨부 파일</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>파일 ID</th>
                  <th>파일명</th>
                  <th>경로</th>
                </tr>
              </thead>
              <tbody>
                {(page?.companyFiles || []).length === 0 ? (
                  <tr><td colSpan={3}>첨부 파일이 없습니다.</td></tr>
                ) : (page?.companyFiles || []).map((row, index) => (
                  <tr key={`${String(row.fileId || "file")}-${index}`}>
                    <td>{String(row.fileId || "-")}</td>
                    <td>{String(row.orignlFileNm || "-")}</td>
                    <td>{String(row.fileStrePath || "-")}</td>
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
