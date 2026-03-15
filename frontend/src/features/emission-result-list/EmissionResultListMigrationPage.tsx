import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchEmissionResultListPage, type EmissionResultListPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

type Filters = {
  pageIndex: number;
  searchKeyword: string;
  resultStatus: string;
  verificationStatus: string;
};

export function EmissionResultListMigrationPage() {
  const en = isEnglish();
  const initial = useMemo<Filters>(() => {
    const search = new URLSearchParams(window.location.search);
    return {
      pageIndex: Number(search.get("pageIndex") || "1") || 1,
      searchKeyword: search.get("searchKeyword") || "",
      resultStatus: search.get("resultStatus") || "",
      verificationStatus: search.get("verificationStatus") || ""
    };
  }, []);
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const pageState = useAsyncValue<EmissionResultListPagePayload>(() => fetchEmissionResultListPage(filters), [filters.pageIndex, filters.searchKeyword, filters.resultStatus, filters.verificationStatus], {
    onSuccess(payload) {
      setDraft({
        pageIndex: Number(payload.pageIndex || 1),
        searchKeyword: String(payload.searchKeyword || ""),
        resultStatus: String(payload.resultStatus || ""),
        verificationStatus: String(payload.verificationStatus || "")
      });
    }
  });
  const page = pageState.value;
  const rows = (page?.emissionResultList || []) as Array<Record<string, unknown>>;
  const totalPages = Number(page?.totalPages || 1);
  const currentPage = Number(page?.pageIndex || 1);
  const startPage = Number(page?.startPage || 1);
  const endPage = Number(page?.endPage || totalPages);

  function resultBadgeClass(code: string) {
    switch (code) {
      case "COMPLETED": return "bg-emerald-100 text-emerald-700";
      case "REVIEW": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-200 text-slate-700";
    }
  }

  function verificationBadgeClass(code: string) {
    switch (code) {
      case "PENDING": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-indigo-100 text-indigo-700";
      case "VERIFIED": return "bg-emerald-100 text-emerald-700";
      case "FAILED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Calculation & Certification" : "산정·인증" },
        { label: en ? "Emission Result List" : "산정 결과 목록" }
      ]}
      title={en ? "Emission Result List" : "산정 결과 목록"}
      subtitle={en ? "Review emission calculation results by calculation and verification status." : "배출량 산정 결과를 검토 상태와 검증 상태 기준으로 조회합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="gov-card"><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] mb-2">{en ? "Total Results" : "전체 결과"}</p><p className="text-3xl font-black text-[var(--kr-gov-blue)]">{Number(page?.totalCount || 0).toLocaleString()}</p></div>
        <div className="gov-card"><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] mb-2">{en ? "Under Review" : "검토 진행"}</p><p className="text-3xl font-black text-amber-600">{Number(page?.reviewCount || 0).toLocaleString()}</p></div>
        <div className="gov-card"><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] mb-2">{en ? "Verified" : "검증 완료"}</p><p className="text-3xl font-black text-emerald-600">{Number(page?.verifiedCount || 0).toLocaleString()}</p></div>
      </div>

      <section className="gov-card mb-8">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-6" onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, pageIndex: 1 });
        }}>
          <div>
            <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="resultStatus">{en ? "Calculation Status" : "산정 상태"}</label>
            <select className="gov-select" id="resultStatus" value={draft.resultStatus} onChange={(event) => setDraft((current) => ({ ...current, resultStatus: event.target.value }))}>
              <option value="">{en ? "All" : "전체"}</option>
              <option value="COMPLETED">{en ? "Completed" : "산정 완료"}</option>
              <option value="REVIEW">{en ? "Under Review" : "검토 중"}</option>
              <option value="DRAFT">{en ? "Draft" : "임시 저장"}</option>
            </select>
          </div>
          <div>
            <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="verificationStatus">{en ? "Verification Status" : "검증 상태"}</label>
            <select className="gov-select" id="verificationStatus" value={draft.verificationStatus} onChange={(event) => setDraft((current) => ({ ...current, verificationStatus: event.target.value }))}>
              <option value="">{en ? "All" : "전체"}</option>
              <option value="VERIFIED">{en ? "Verified" : "검증 완료"}</option>
              <option value="PENDING">{en ? "Pending" : "검증 대기"}</option>
              <option value="IN_PROGRESS">{en ? "In Progress" : "검증 진행중"}</option>
              <option value="FAILED">{en ? "Recheck Needed" : "재검토 필요"}</option>
              <option value="NOT_REQUIRED">{en ? "Not Required" : "검증 제외"}</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="searchKeyword">{en ? "Keyword" : "검색어"}</label>
            <div className="flex gap-2">
              <input className="gov-input flex-1" id="searchKeyword" placeholder={en ? "Search by project, company, or result ID" : "프로젝트명, 기관명, 결과 ID 검색"} value={draft.searchKeyword} onChange={(event) => setDraft((current) => ({ ...current, searchKeyword: event.target.value }))} />
              <button className="gov-btn gov-btn-primary" type="submit">{en ? "Search" : "검색"}</button>
            </div>
          </div>
        </form>
      </section>

      <section className="gov-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-6 py-4 text-center w-16">{en ? "No." : "번호"}</th>
                <th className="px-6 py-4">{en ? "Result ID / Project" : "결과 ID / 프로젝트명"}</th>
                <th className="px-6 py-4">{en ? "Company" : "기관명"}</th>
                <th className="px-6 py-4">{en ? "Calculated At" : "산정일"}</th>
                <th className="px-6 py-4">{en ? "Total Emission" : "총 배출량"}</th>
                <th className="px-6 py-4 text-center">{en ? "Calculation" : "산정 상태"}</th>
                <th className="px-6 py-4 text-center">{en ? "Verification" : "검증 상태"}</th>
                <th className="px-6 py-4 text-center">{en ? "Action" : "관리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={8}>{en ? "No emission results found." : "조회된 산정 결과가 없습니다."}</td></tr>
              ) : rows.map((item, index) => {
                const rowNo = Number(page?.totalCount || 0) - ((currentPage - 1) * Number(page?.pageSize || 10) + index);
                return (
                  <tr className="hover:bg-gray-50/50 transition-colors" key={`${stringOf(item, "resultId")}-${index}`}>
                    <td className="px-6 py-4 text-center text-gray-500">{rowNo}</td>
                    <td className="px-6 py-4"><div className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(item, "projectName")}</div><div className="text-xs text-gray-400 mt-1">{stringOf(item, "resultId")}</div></td>
                    <td className="px-6 py-4 font-medium text-[var(--kr-gov-text-secondary)]">{stringOf(item, "companyName")}</td>
                    <td className="px-6 py-4 text-gray-500">{stringOf(item, "calculatedAt")}</td>
                    <td className="px-6 py-4 font-bold text-[var(--kr-gov-blue)]">{stringOf(item, "totalEmission")}</td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${resultBadgeClass(stringOf(item, "resultStatusCode"))}`}>{stringOf(item, "resultStatusLabel")}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${verificationBadgeClass(stringOf(item, "verificationStatusCode"))}`}>{stringOf(item, "verificationStatusLabel")}</span></td>
                    <td className="px-6 py-4 text-center"><a className="inline-flex px-3 py-1.5 bg-[var(--kr-gov-blue)] text-white text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" href={stringOf(item, "detailUrl")}>{en ? "Detail" : "상세"}</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[var(--kr-gov-border-light)] bg-gray-50 flex justify-center">
          <nav className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage <= 1} onClick={() => setFilters((current) => ({ ...current, pageIndex: 1 }))} type="button"><span className="material-symbols-outlined">first_page</span></button>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage <= 1} onClick={() => setFilters((current) => ({ ...current, pageIndex: Math.max(1, currentPage - 1) }))} type="button"><span className="material-symbols-outlined">chevron_left</span></button>
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, idx) => startPage + idx).map((pageNum) => (
                <button className={`w-8 h-8 rounded border border-transparent text-sm flex items-center justify-center ${pageNum === currentPage ? "bg-[var(--kr-gov-blue)] text-white font-bold" : "hover:bg-white hover:border-gray-200"}`} key={pageNum} onClick={() => setFilters((current) => ({ ...current, pageIndex: pageNum }))} type="button">{pageNum}</button>
              ))}
            </div>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage >= totalPages} onClick={() => setFilters((current) => ({ ...current, pageIndex: Math.min(totalPages, currentPage + 1) }))} type="button"><span className="material-symbols-outlined">chevron_right</span></button>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage >= totalPages} onClick={() => setFilters((current) => ({ ...current, pageIndex: totalPages }))} type="button"><span className="material-symbols-outlined">last_page</span></button>
          </nav>
        </div>
      </section>
    </AdminPageShell>
  );
}
