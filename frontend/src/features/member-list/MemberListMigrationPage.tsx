import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { fetchMemberListPage, MemberListPagePayload } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

type SearchFilters = {
  searchKeyword: string;
  membershipType: string;
  status: string;
  pageIndex: number;
};

const DEFAULT_FILTERS: SearchFilters = {
  searchKeyword: "",
  membershipType: "",
  status: "",
  pageIndex: 1
};

const MEMBER_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "EMITTER", label: "CO2 배출 및 포집 기업" },
  { value: "PERFORMER", label: "CCUS 사업 수행 기업" },
  { value: "CENTER", label: "CCUS 진흥센터" },
  { value: "GOV", label: "주무관청 / 행정기관" }
];

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "P", label: "활성" },
  { value: "A", label: "승인 대기" },
  { value: "R", label: "반려" },
  { value: "D", label: "삭제" },
  { value: "X", label: "차단" }
];

function resolveMembershipTypeLabel(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
    case "E":
    case "EMITTER":
      return "CO2 배출 및 포집 기업";
    case "P":
    case "PERFORMER":
      return "CCUS 사업 수행 기업";
    case "C":
    case "CENTER":
      return "CCUS 진흥센터";
    case "G":
    case "GOV":
      return "주무관청 / 행정기관";
    default:
      return String(rawValue || "기타");
  }
}

function resolveStatusBadgeClass(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
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

function resolveStatusLabel(rawValue: unknown) {
  switch (String(rawValue || "").trim().toUpperCase()) {
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
      return String(rawValue || "기타");
  }
}

function buildAdminPath(koPath: string, enPath: string, key?: string, value?: string) {
  const params = new URLSearchParams();
  if (key && value) {
    params.set(key, value);
  }
  const query = params.toString();
  return buildLocalizedPath(
    query ? `${koPath}?${query}` : koPath,
    query ? `${enPath}?${query}` : enPath
  );
}

function buildMemberListExcelPath(filters: SearchFilters) {
  const params = new URLSearchParams();
  if (filters.searchKeyword) {
    params.set("searchKeyword", filters.searchKeyword);
  }
  if (filters.membershipType) {
    params.set("membershipType", filters.membershipType);
  }
  if (filters.status) {
    params.set("sbscrbSttus", filters.status);
  }
  const query = params.toString();
  return buildLocalizedPath(
    query ? `/admin/member/list/excel?${query}` : "/admin/member/list/excel",
    query ? `/en/admin/member/list/excel?${query}` : "/en/admin/member/list/excel"
  );
}

export function MemberListMigrationPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [actionError, setActionError] = useState("");
  const pageState = useAsyncValue<MemberListPagePayload>(
    () => fetchMemberListPage({
      pageIndex: filters.pageIndex,
      searchKeyword: filters.searchKeyword,
      membershipType: filters.membershipType,
      sbscrbSttus: filters.status
    }),
    [filters.pageIndex, filters.searchKeyword, filters.membershipType, filters.status],
    {
      onSuccess(payload) {
        const nextFilters = {
          searchKeyword: String(payload.searchKeyword || ""),
          membershipType: String(payload.membershipType || ""),
          status: String(payload.sbscrbSttus || ""),
          pageIndex: Number(payload.pageIndex || 1)
        };
        setFilters(nextFilters);
        setDraftFilters(nextFilters);
      }
    }
  );
  const page = pageState.value;
  const error = actionError || pageState.error;
  const totalPages = Math.max(1, Number(page?.totalPages || 1));
  const currentPage = Math.max(1, Number(page?.pageIndex || filters.pageIndex || 1));
  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(totalPages, startPage + 9);
  const normalizedStartPage = Math.max(1, endPage - 9);
  const pageNumbers = useMemo(
    () => Array.from({ length: endPage - normalizedStartPage + 1 }, (_, index) => normalizedStartPage + index),
    [endPage, normalizedStartPage]
  );

  function updateDraft<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(nextPageIndex = 1) {
    setActionError("");
    setFilters({
      ...draftFilters,
      pageIndex: nextPageIndex
    });
  }

  function movePage(nextPageIndex: number) {
    setActionError("");
    setFilters((current) => ({ ...current, pageIndex: nextPageIndex }));
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원" },
        { label: "회원 목록 조회" }
      ]}
      title="회원 목록 조회"
    >
      {error ? <section className="border border-red-200 bg-red-50 rounded-[var(--kr-gov-radius)] px-4 py-3 mb-4"><p className="text-sm text-red-700">조회 중 오류: {error}</p></section> : null}
      <CanView allowed={!!page?.canViewMemberList} fallback={<section className="bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] px-6 py-8"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원 목록을 불러오는 중입니다.</p></section>}>
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8" data-help-id="member-search-form">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-help-id="member-list-search">
            <label>
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">회원 유형</span>
              <select className="w-full rounded-[var(--kr-gov-radius)] border-[var(--kr-gov-border-light)] text-sm focus:border-[var(--kr-gov-focus)] focus:ring-[var(--kr-gov-focus)]" value={draftFilters.membershipType} onChange={(event) => updateDraft("membershipType", event.target.value)}>
                {MEMBER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">상태</span>
              <select className="w-full rounded-[var(--kr-gov-radius)] border-[var(--kr-gov-border-light)] text-sm focus:border-[var(--kr-gov-focus)] focus:ring-[var(--kr-gov-focus)]" value={draftFilters.status} onChange={(event) => updateDraft("status", event.target.value)}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">검색어</span>
              <div className="flex gap-2">
                <input className="flex-1 rounded-[var(--kr-gov-radius)] border-[var(--kr-gov-border-light)] text-sm focus:border-[var(--kr-gov-focus)] focus:ring-[var(--kr-gov-focus)]" placeholder="신청자명, 아이디, 회사명 검색" value={draftFilters.searchKeyword} onChange={(event) => updateDraft("searchKeyword", event.target.value)} />
                <button className="px-6 py-2 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors flex items-center gap-2" onClick={() => applyFilters(1)} type="button">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  검색
                </button>
              </div>
            </label>
          </div>
        </section>

        <div className="flex justify-between items-center mb-4">
          <div className="text-[14px]">
            전체 <span className="font-bold text-[var(--kr-gov-blue)]">{Number(page?.totalCount || 0).toLocaleString()}</span>건
          </div>
          <div className="flex gap-2">
            <a className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-[13px] font-bold hover:bg-gray-50" href={buildMemberListExcelPath(filters)}>
              <span className="material-symbols-outlined text-[18px]">download</span>
              엑셀 다운로드
            </a>
            <a className="flex items-center gap-1.5 px-3 py-2 bg-[var(--kr-gov-green)] text-white rounded-[var(--kr-gov-radius)] text-[13px] font-bold hover:opacity-90" href={buildLocalizedPath("/admin/member/register", "/en/admin/member/register")}>
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              신규 회원 등록
            </a>
          </div>
        </div>

        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm overflow-hidden" data-help-id="member-table">
          <div className="overflow-x-auto" data-help-id="member-list-table">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-6 py-4 text-center w-16">번호</th>
                  <th className="px-6 py-4">성명 (아이디)</th>
                  <th className="px-6 py-4">회원 유형</th>
                  <th className="px-6 py-4">소속 기관</th>
                  <th className="px-6 py-4">가입일</th>
                  <th className="px-6 py-4 text-center">상태</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(page?.member_list || []).length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>조회된 기업 회원이 없습니다.</td>
                  </tr>
                ) : (page?.member_list || []).map((row, index) => {
                  const memberId = String(row.entrprsmberId || "");
                  const rowNumber = Number(page?.totalCount || 0) - ((currentPage - 1) * 10 + index);
                  return (
                    <tr className="hover:bg-gray-50/50 transition-colors" key={`${memberId || "member"}-${index}`}>
                      <td className="px-6 py-4 text-center text-gray-500">{rowNumber > 0 ? rowNumber : index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--kr-gov-text-primary)]">{String(row.applcntNm || "-")}</div>
                        <div className="text-xs text-gray-400">{memberId || "-"}</div>
                      </td>
                      <td className="px-6 py-4">{resolveMembershipTypeLabel(row.entrprsSeCode)}</td>
                      <td className="px-6 py-4 font-medium text-[var(--kr-gov-text-secondary)]">{String(row.cmpnyNm || "-")}</td>
                      <td className="px-6 py-4 text-gray-500">{String(row.sbscrbDe || "-")}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full ${resolveStatusBadgeClass(row.entrprsMberSttus)}`}>
                          {resolveStatusLabel(row.entrprsMberSttus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <a className="inline-flex px-3 py-1.5 border border-[var(--kr-gov-border-light)] text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-100" href={buildAdminPath("/admin/member/edit", "/en/admin/member/edit", "memberId", memberId)}>
                          수정
                        </a>
                        <a className="inline-flex px-3 py-1.5 bg-[var(--kr-gov-blue)] text-white text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" href={buildAdminPath("/admin/member/detail", "/en/admin/member/detail", "memberId", memberId)}>
                          상세
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-[var(--kr-gov-border-light)] bg-gray-50 flex justify-center">
            <nav className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => movePage(1)} type="button">
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => movePage(Math.max(1, currentPage - 1))} type="button">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex items-center gap-1 mx-4">
                {pageNumbers.map((pageNumber) => (
                  <button
                    className={`min-w-9 px-3 py-1.5 rounded text-sm border ${pageNumber === currentPage ? "bg-[var(--kr-gov-blue)] text-white border-[var(--kr-gov-blue)] font-bold" : "bg-white text-[var(--kr-gov-text-secondary)] border-transparent hover:border-gray-200"}`}
                    key={pageNumber}
                    onClick={() => movePage(pageNumber)}
                    type="button"
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => movePage(Math.min(totalPages, currentPage + 1))} type="button">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => movePage(totalPages)} type="button">
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </nav>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
