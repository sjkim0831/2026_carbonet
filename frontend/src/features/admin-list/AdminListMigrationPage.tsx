import { useEffect, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminListPagePayload, fetchAdminListPage } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function statusLabel(code: string) {
  switch (code) {
    case "P":
      return "활성";
    case "A":
      return "승인 대기";
    case "R":
      return "반려";
    case "D":
      return "삭제";
    case "X":
      return "차단";
    default:
      return code || "-";
  }
}

function statusBadgeClass(code: string) {
  switch (code) {
    case "P":
      return "bg-emerald-100 text-emerald-700";
    case "A":
      return "bg-blue-100 text-blue-700";
    case "R":
      return "bg-amber-100 text-amber-700";
    case "D":
      return "bg-slate-200 text-slate-700";
    case "X":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

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
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "관리자" },
        { label: "관리자 회원 목록 조회" }
      ]}
      title="관리자 회원 목록 조회"
    >
      {error ? <section className="mb-4 text-sm text-red-600 font-medium"><p>{error}</p></section> : null}
      <CanView allowed={!!page?.canViewAdminList} fallback={<section className="panel"><p className="state-text">화면을 불러오는 중입니다.</p></section>}>
        <section className="gov-card mb-8" data-help-id="admin-list-search">
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              load({ pageIndex: 1, searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message));
            }}
          >
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="status">상태</label>
              <select
                className="w-full border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-sm focus:ring-[var(--kr-gov-focus)] focus:border-[var(--kr-gov-focus)]"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">전체</option>
                <option value="P">활성</option>
                <option value="A">승인 대기</option>
                <option value="R">반려</option>
                <option value="D">삭제</option>
                <option value="X">차단</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="keyword">검색어</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-sm focus:ring-[var(--kr-gov-focus)] focus:border-[var(--kr-gov-focus)]"
                  id="keyword"
                  placeholder="성명, 아이디, 조직ID, 이메일 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button className="px-6 py-2 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors flex items-center gap-2" type="submit">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  검색
                </button>
              </div>
            </div>
          </form>
        </section>
        <section data-help-id="admin-list-table">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[14px]">
              전체 <span className="font-bold text-[var(--kr-gov-blue)]">{Number(page?.totalCount || 0).toLocaleString("ko-KR")}</span>건
            </div>
            <div className="flex gap-2">
              <a
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-[13px] font-bold hover:bg-gray-50"
                href={`/admin/member/admin_list/excel?searchKeyword=${encodeURIComponent(searchKeyword)}&sbscrbSttus=${encodeURIComponent(status)}`}
              >
                <span className="material-symbols-outlined text-[18px]">download</span> 관리자 엑셀 다운로드
              </a>
              <a
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--kr-gov-green)] text-white rounded-[var(--kr-gov-radius)] text-[13px] font-bold hover:opacity-90"
                href={buildLocalizedPath("/admin/react-migration?route=admin-create", "/en/admin/react-migration?route=admin-create")}
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span> 신규 관리자 등록
              </a>
            </div>
          </div>
          <div className="gov-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                    <th className="px-6 py-4 text-center w-16">번호</th>
                    <th className="px-6 py-4">성명 (아이디)</th>
                    <th className="px-6 py-4">조직 ID</th>
                    <th className="px-6 py-4">이메일</th>
                    <th className="px-6 py-4">가입일</th>
                    <th className="px-6 py-4 text-center">상태</th>
                    <th className="px-6 py-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(page?.member_list || []).length === 0 ? (
                    <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={7}>조회된 관리자 계정이 없습니다.</td></tr>
                  ) : (page?.member_list || []).map((row, index) => (
                    <tr className="hover:bg-gray-50/50 transition-colors" key={`${String(row.emplyrId || "admin")}-${index}`}>
                      <td className="px-6 py-4 text-center text-gray-500">{Number(page?.totalCount || 0) - (((Number(page?.pageIndex || 1) - 1) * 10) + index)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--kr-gov-text-primary)]">{String(row.userNm || "-")}</div>
                        <div className="text-xs text-gray-400">{String(row.emplyrId || "-")}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--kr-gov-text-secondary)]">{String(row.orgnztId || "-")}</td>
                      <td className="px-6 py-4 text-gray-500">{String(row.emailAdres || "-")}</td>
                      <td className="px-6 py-4 text-gray-500">{String(row.sbscrbDe || "-")}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`status-badge ${statusBadgeClass(String(row.emplyrStusCode || ""))}`}>
                          {statusLabel(String(row.emplyrStusCode || ""))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <a className="inline-flex px-3 py-1.5 border border-[var(--kr-gov-border-light)] text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-100" href={buildLocalizedPath(`/admin/react-migration?route=admin-permission&emplyrId=${encodeURIComponent(String(row.emplyrId || ""))}`, `/en/admin/react-migration?route=admin-permission&emplyrId=${encodeURIComponent(String(row.emplyrId || ""))}`)}>수정</a>
                        <a className="inline-flex px-3 py-1.5 bg-[var(--kr-gov-blue)] text-white text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" href={buildLocalizedPath(`/admin/react-migration?route=admin-permission&emplyrId=${encodeURIComponent(String(row.emplyrId || ""))}&mode=detail`, `/en/admin/react-migration?route=admin-permission&emplyrId=${encodeURIComponent(String(row.emplyrId || ""))}&mode=detail`)}>상세</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[var(--kr-gov-border-light)] bg-gray-50 flex justify-center">
              <nav className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={Number(page?.pageIndex || 1) <= 1} onClick={() => load({ pageIndex: 1, searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message))} type="button">
                  <span className="material-symbols-outlined">first_page</span>
                </button>
                <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={Number(page?.pageIndex || 1) <= 1} onClick={() => load({ pageIndex: Math.max(1, Number(page?.pageIndex || 1) - 1), searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message))} type="button">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex items-center gap-1 mx-4">
                  {Array.from({ length: Number(page?.totalPages || 0) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      className={`w-8 h-8 rounded border border-transparent text-sm flex items-center justify-center ${pageNum === Number(page?.pageIndex || 1) ? "bg-[var(--kr-gov-blue)] text-white font-bold" : "hover:bg-white hover:border-gray-200"}`}
                      key={pageNum}
                      onClick={() => load({ pageIndex: pageNum, searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message))}
                      type="button"
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={Number(page?.pageIndex || 1) >= Number(page?.totalPages || 1)} onClick={() => load({ pageIndex: Math.min(Number(page?.totalPages || 1), Number(page?.pageIndex || 1) + 1), searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message))} type="button">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={Number(page?.pageIndex || 1) >= Number(page?.totalPages || 1)} onClick={() => load({ pageIndex: Number(page?.totalPages || 1), searchKeyword, sbscrbSttus: status }).catch((err: Error) => setError(err.message))} type="button">
                  <span className="material-symbols-outlined">last_page</span>
                </button>
              </nav>
            </div>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
