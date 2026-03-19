import { useMemo, useState, type FormEvent } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { CompanyListPagePayload, fetchCompanyListPage } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberButton, MemberLinkButton, MemberPagination } from "../member/common";
import { MEMBER_BUTTON_LABELS, MEMBER_LIST_LABELS } from "../member/labels";
import { resolveMemberStatusBadgeClass, resolveMemberStatusLabel } from "../member/status";
import { MemberListEmptyRow, MemberListToolbar } from "../member/toolbar";

type SearchFilters = {
  searchKeyword: string;
  status: string;
  pageIndex: number;
};

const DEFAULT_FILTERS: SearchFilters = {
  searchKeyword: "",
  status: "",
  pageIndex: 1
};

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "P", label: "활성" },
  { value: "A", label: "승인 대기" },
  { value: "R", label: "반려" },
  { value: "D", label: "삭제" },
  { value: "X", label: "차단" }
];

export function CompanyListMigrationPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [actionError, setActionError] = useState("");
  const pageState = useAsyncValue<CompanyListPagePayload>(
    () => fetchCompanyListPage({
      pageIndex: filters.pageIndex,
      searchKeyword: filters.searchKeyword,
      sbscrbSttus: filters.status
    }),
    [filters.pageIndex, filters.searchKeyword, filters.status],
    {
      onSuccess(payload) {
        const nextFilters = {
          searchKeyword: String(payload.searchKeyword || ""),
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
  const exportQuery = useMemo(() => {
    const params = new URLSearchParams();
    const keyword = String(filters.searchKeyword || "").trim();
    const status = String(filters.status || "").trim();
    if (keyword) params.set("searchKeyword", keyword);
    if (status) params.set("sbscrbSttus", status);
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [filters.searchKeyword, filters.status]);

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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(1);
  }

  const fieldClassName = "w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white text-sm focus:ring-[var(--kr-gov-focus)] focus:border-[var(--kr-gov-focus)]";

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원사" },
        { label: "회원사 목록 조회" }
      ]}
      title="회원사 목록 조회"
      loading={pageState.loading && !page && !error}
      loadingLabel="회원사 목록을 불러오는 중입니다."
    >
      {error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">조회 중 오류: {error}</section> : null}
      <CanView allowed={!!page?.canViewCompanyList} fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원사 목록을 볼 권한이 없습니다.</p></section>}>
        <section className="gov-card mb-8" data-help-id="company-list-search">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleSearchSubmit}>
            <label>
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">상태</span>
              <select className={fieldClassName} value={draftFilters.status} onChange={(e) => updateDraft("status", e.target.value)}>
                {STATUS_OPTIONS.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">검색어</span>
              <div className="flex gap-2">
                <input className={`flex-1 ${fieldClassName}`} placeholder="기관명, 사업자등록번호 검색" value={draftFilters.searchKeyword} onChange={(e) => updateDraft("searchKeyword", e.target.value)} />
                <MemberButton icon="search" type="submit" variant="primary">
                  {MEMBER_BUTTON_LABELS.search}
                </MemberButton>
              </div>
            </label>
          </form>
        </section>

        <MemberListToolbar
          className="mb-4"
          excelHref={buildLocalizedPath(`/admin/member/company_list/excel${exportQuery}`, `/en/admin/member/company_list/excel${exportQuery}`)}
          registerHref={buildLocalizedPath("/admin/member/company_account", "/en/admin/member/company_account")}
          totalCount={Number(page?.totalCount || 0)}
        />

        <section className="gov-card p-0 overflow-hidden" data-help-id="company-list-table">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-6 py-4 text-center w-16">번호</th>
                  <th className="px-6 py-4">기관명</th>
                  <th className="px-6 py-4">사업자등록번호</th>
                  <th className="px-6 py-4">대표자명</th>
                  <th className="px-6 py-4 text-center">상태</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(page?.company_list || []).length === 0 ? (
                  <MemberListEmptyRow colSpan={6} message={MEMBER_LIST_LABELS.emptyCompanyList} />
                ) : (page?.company_list || []).map((row, index) => {
                  const insttId = String(row.insttId || "");
                  const rowNumber = Number(page?.totalCount || 0) - ((currentPage - 1) * 10 + index);
                  return (
                    <tr className="hover:bg-gray-50/50 transition-colors" key={`${insttId || "instt"}-${index}`}>
                      <td className="px-6 py-4 text-center text-gray-500">{rowNumber > 0 ? rowNumber : index + 1}</td>
                      <td className="px-6 py-4 font-bold text-[var(--kr-gov-text-primary)]">{String(row.cmpnyNm || "-")}</td>
                      <td className="px-6 py-4 text-gray-500">{String(row.bizrno || "-")}</td>
                      <td className="px-6 py-4 text-gray-500">{String(row.cxfc || "-")}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full ${resolveMemberStatusBadgeClass(row.joinStat)}`}>{resolveMemberStatusLabel(row.joinStat)}</span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <MemberLinkButton href={buildLocalizedPath(`/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`, `/en/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`)} size="xs" variant="secondary">
                          {MEMBER_BUTTON_LABELS.edit}
                        </MemberLinkButton>
                        <MemberLinkButton href={buildLocalizedPath(`/admin/member/company_detail?insttId=${encodeURIComponent(insttId)}`, `/en/admin/member/company_detail?insttId=${encodeURIComponent(insttId)}`)} size="xs" variant="primary">
                          {MEMBER_BUTTON_LABELS.detail}
                        </MemberLinkButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <MemberPagination currentPage={currentPage} dataHelpId="company-list-pagination" onPageChange={movePage} totalPages={totalPages} />
        </section>
      </CanView>
    </AdminPageShell>
  );
}
