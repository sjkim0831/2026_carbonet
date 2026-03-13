import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import {
  fetchFrontendSession,
  fetchMemberApprovePage,
  FrontendSession,
  MemberApprovePagePayload,
  submitMemberApproveAction
} from "../../lib/api";

export function MemberApproveMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<MemberApprovePagePayload | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [status, setStatus] = useState("A");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(next?: { pageIndex?: number; searchKeyword?: string; membershipType?: string; sbscrbSttus?: string; result?: string; }) {
    const [sessionPayload, pagePayload] = await Promise.all([
      session ? Promise.resolve(session) : fetchFrontendSession(),
      fetchMemberApprovePage(next)
    ]);
    setSession(sessionPayload);
    setPage(pagePayload);
    setSelectedIds([]);
    setSearchKeyword(String(pagePayload.searchKeyword || next?.searchKeyword || ""));
    setMembershipType(String(pagePayload.membershipType || next?.membershipType || ""));
    setStatus(String(pagePayload.sbscrbSttus || next?.sbscrbSttus || "A"));
    setMessage(String(pagePayload.memberApprovalResultMessage || ""));
  }

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, []);

  function toggleSelection(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function handleAction(action: string, memberId?: string) {
    if (!session) return;
    setError("");
    try {
      const result = await submitMemberApproveAction(session, {
        action,
        memberId,
        selectedIds: memberId ? undefined : selectedIds
      });
      await load({ searchKeyword, membershipType, sbscrbSttus: status, result: String(result.result || "") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "승인 처리 실패");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원 승인 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}
      <CanView allowed={!!page?.canViewMemberApprove} fallback={<section className="panel"><p className="state-text">회원 승인 화면을 볼 권한이 없습니다.</p></section>}>
        <section className="panel">
          <div className="toolbar">
            <label className="field"><span>검색어</span><input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} /></label>
            <label className="field"><span>회원유형</span><input value={membershipType} onChange={(e) => setMembershipType(e.target.value)} /></label>
            <label className="field"><span>상태</span><input value={status} onChange={(e) => setStatus(e.target.value)} /></label>
            <button className="primary-button" onClick={() => load({ searchKeyword, membershipType, sbscrbSttus: status })} type="button">조회</button>
          </div>
          <div className="toolbar-actions">
            <PermissionButton allowed={!!page?.canUseMemberApproveAction && selectedIds.length > 0} className="primary-button" onClick={() => handleAction("batch_approve")} reason="전체 관리자만 승인할 수 있습니다." type="button">선택 승인</PermissionButton>
            <PermissionButton allowed={!!page?.canUseMemberApproveAction && selectedIds.length > 0} className="primary-button" onClick={() => handleAction("batch_reject")} reason="전체 관리자만 반려할 수 있습니다." type="button">선택 반려</PermissionButton>
          </div>
        </section>
        <section className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>선택</th>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>회사명</th>
                  <th>회원유형</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {(page?.approvalRows || []).length === 0 ? (
                  <tr><td colSpan={7}>데이터가 없습니다.</td></tr>
                ) : (page?.approvalRows || []).map((row, index) => {
                  const id = String(row.memberId || `member-${index}`);
                  return (
                    <tr key={id}>
                      <td><input checked={selectedIds.includes(id)} onChange={() => toggleSelection(id)} type="checkbox" /></td>
                      <td>{id}</td>
                      <td>{String(row.memberName || "-")}</td>
                      <td>{String(row.companyName || "-")}</td>
                      <td>{String(row.membershipTypeLabel || "-")}</td>
                      <td>{String(row.statusLabel || "-")}</td>
                      <td>
                        <div className="toolbar-actions">
                          <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="primary-button" onClick={() => handleAction("approve", id)} reason="전체 관리자만 승인할 수 있습니다." type="button">승인</PermissionButton>
                          <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="primary-button" onClick={() => handleAction("reject", id)} reason="전체 관리자만 반려할 수 있습니다." type="button">반려</PermissionButton>
                        </div>
                      </td>
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
