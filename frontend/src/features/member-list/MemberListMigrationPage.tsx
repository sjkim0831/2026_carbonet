import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { fetchMemberListPage, MemberListPagePayload } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import {
  MEMBER_STATUS_OPTIONS,
  MEMBER_TYPE_OPTIONS,
  resolveMembershipTypeLabel
} from "../member/shared";
import { resolveMemberStatusBadgeClass, resolveMemberStatusLabel } from "../member/status";
import { AdminInput, AdminSelect, AdminTable, MemberButton, MemberLinkButton, MemberPagination } from "../member/common";
import { MEMBER_BUTTON_LABELS, MEMBER_LIST_LABELS } from "../member/labels";
import { MemberListEmptyRow, MemberListToolbar } from "../member/toolbar";

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

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(1);
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원" },
        { label: "회원 목록 조회" }
      ]}
      title="회원 목록 조회"
      loading={pageState.loading && !page && !error}
      loadingLabel="회원 목록을 불러오는 중입니다."
    >
      {error ? <section className="border border-red-200 bg-red-50 rounded-[var(--kr-gov-radius)] px-4 py-3 mb-4"><p className="text-sm text-red-700">조회 중 오류: {error}</p></section> : null}
      <CanView allowed={!!page?.canViewMemberList} fallback={<section className="bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] px-6 py-8"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원 목록을 불러올 수 없습니다.</p></section>}>
        <div className="gov-card mb-8" data-help-id="member-search-form">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-6" data-help-id="member-list-search" onSubmit={handleSearchSubmit}>
            <div>
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">회원 유형</span>
              <AdminSelect id="member-type" value={draftFilters.membershipType} onChange={(event) => updateDraft("membershipType", event.target.value)}>
                {MEMBER_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>{option.label}</option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">상태</span>
              <AdminSelect id="status" value={draftFilters.status} onChange={(event) => updateDraft("status", event.target.value)}>
                {MEMBER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>{option.label}</option>
                ))}
              </AdminSelect>
            </div>
            <div className="md:col-span-2">
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">검색어</span>
              <div className="flex gap-2">
                <AdminInput className="flex-1" id="keyword" placeholder="신청자명, 아이디, 회사명 검색" value={draftFilters.searchKeyword} onChange={(event) => updateDraft("searchKeyword", event.target.value)} />
                <MemberButton icon="search" type="submit" variant="primary">
                  {MEMBER_BUTTON_LABELS.search}
                </MemberButton>
              </div>
            </div>
          </form>
        </div>

        <MemberListToolbar
          className="mb-4"
          excelHref={buildMemberListExcelPath(filters)}
          registerHref={buildLocalizedPath("/admin/member/register", "/en/admin/member/register")}
          totalCount={Number(page?.totalCount || 0)}
        />

        <div className="gov-card p-0 overflow-hidden" data-help-id="member-table">
          <div className="overflow-x-auto" data-help-id="member-list-table">
            <AdminTable>
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
                  <MemberListEmptyRow colSpan={7} message={MEMBER_LIST_LABELS.emptyMemberList} />
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
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full ${resolveMemberStatusBadgeClass(row.entrprsMberSttus)}`}>
                          {resolveMemberStatusLabel(row.entrprsMberSttus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <MemberLinkButton href={buildAdminPath("/admin/member/edit", "/en/admin/member/edit", "memberId", memberId)} size="xs" variant="secondary">
                          {MEMBER_BUTTON_LABELS.edit}
                        </MemberLinkButton>
                        <MemberLinkButton href={buildAdminPath("/admin/member/detail", "/en/admin/member/detail", "memberId", memberId)} size="xs" variant="primary">
                          {MEMBER_BUTTON_LABELS.detail}
                        </MemberLinkButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>
          </div>

          <MemberPagination currentPage={currentPage} onPageChange={movePage} totalPages={totalPages} />
        </div>
      </CanView>
    </AdminPageShell>
  );
}
