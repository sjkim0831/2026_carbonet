import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import {
  fetchMemberApprovePage,
  MemberApprovePagePayload,
  submitMemberApproveAction
} from "../../lib/api/client";
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
  status: "A",
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
  { value: "A", label: "승인 대기" },
  { value: "P", label: "활성" },
  { value: "R", label: "반려" },
  { value: "X", label: "차단" }
];

export function MemberApproveMigrationPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewMemberId, setReviewMemberId] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<MemberApprovePagePayload>(
    () => fetchMemberApprovePage({
      pageIndex: filters.pageIndex,
      searchKeyword: filters.searchKeyword,
      membershipType: filters.membershipType,
      sbscrbSttus: filters.status
    }),
    [filters.pageIndex, filters.searchKeyword, filters.membershipType, filters.status],
    {
      onSuccess(pagePayload) {
        const nextFilters = {
          searchKeyword: String(pagePayload.searchKeyword || ""),
          membershipType: String(pagePayload.membershipType || ""),
          status: String(pagePayload.sbscrbSttus || "A"),
          pageIndex: Number(pagePayload.pageIndex || 1)
        };
        setSelectedIds([]);
        setFilters(nextFilters);
        setDraftFilters(nextFilters);
        setMessage(String(pagePayload.memberApprovalResultMessage || ""));
      }
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;
  const totalPages = Math.max(1, Number(page?.totalPages || 1));
  const currentPage = Math.max(1, Number(page?.pageIndex || filters.pageIndex || 1));
  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(totalPages, startPage + 9);
  const normalizedStartPage = Math.max(1, endPage - 9);
  const pageNumbers = useMemo(
    () => Array.from({ length: endPage - normalizedStartPage + 1 }, (_, index) => normalizedStartPage + index),
    [endPage, normalizedStartPage]
  );
  const approvalRows = (page?.approvalRows || []) as Array<Record<string, unknown>>;
  const reviewRow = approvalRows.find((row) => String(row.memberId || "") === reviewMemberId) || null;

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

  function toggleSelection(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function handleAction(action: string, memberId?: string) {
    const session = sessionState.value;
    if (!session) return;
    setActionError("");
    try {
      await submitMemberApproveAction(session, {
        action,
        memberId,
        selectedIds: memberId ? undefined : selectedIds
      });
      await pageState.reload();
      if (memberId) {
        setReviewMemberId("");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "승인 처리 실패");
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(approvalRows.map((row, index) => String(row.memberId || `member-${index}`)));
  }

  return (
    <AdminPageShell
      actions={(
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
          총 {Number(page?.memberApprovalTotalCount || 0).toLocaleString()}건
        </span>
      )}
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원" },
        { label: "회원 가입 승인 관리" }
      ]}
      subtitle="기업회원 가입 신청을 검토하고 승인 또는 반려 상태를 처리합니다."
      title="회원 가입 승인 관리"
    >
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</section> : null}
      {error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</section> : null}
      <CanView allowed={!!page?.canViewMemberApprove} fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원 승인 화면을 볼 권한이 없습니다.</p></section>}>
        <section className="gov-card p-5 mb-6" data-help-id="member-approve-search">
          <div className="grid gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)_auto_auto] lg:items-end">
            <label>
              <span className="block text-sm font-bold mb-2">회원구분</span>
              <select className="w-full rounded border-gray-300 text-sm" value={draftFilters.membershipType} onChange={(e) => updateDraft("membershipType", e.target.value)}>
                {MEMBER_TYPE_OPTIONS.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span className="block text-sm font-bold mb-2">상태</span>
              <select className="w-full rounded border-gray-300 text-sm" value={draftFilters.status} onChange={(e) => updateDraft("status", e.target.value)}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span className="block text-sm font-bold mb-2">검색어</span>
              <input className="w-full rounded border-gray-300 text-sm" placeholder="신청자명, 회원 ID, 기관명 검색" value={draftFilters.searchKeyword} onChange={(e) => updateDraft("searchKeyword", e.target.value)} />
            </label>
            <button className="px-4 py-2 bg-[var(--kr-gov-blue)] text-white text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" onClick={() => applyFilters(1)} type="button">검색</button>
            <button className="px-4 py-2 border border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)] text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50" onClick={() => { setDraftFilters(DEFAULT_FILTERS); setFilters(DEFAULT_FILTERS); }} type="button">초기화</button>
          </div>
        </section>

        <section className="gov-card overflow-hidden" data-help-id="member-approve-table">
          <div className="flex flex-col gap-3 border-b border-[var(--kr-gov-border-light)] px-6 py-4 bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-bold">승인 대기 목록</div>
              <div className="mt-1 text-sm text-gray-500">총 <span className="font-bold text-[var(--kr-gov-blue)]">{Number(page?.memberApprovalTotalCount || 0).toLocaleString()}</span>건</div>
            </div>
            <div className="flex gap-2" data-help-id="member-approve-batch-actions">
              <PermissionButton allowed={!!page?.canUseMemberApproveAction && selectedIds.length > 0} className="px-4 py-2 bg-[var(--kr-gov-blue)] text-white text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" onClick={() => handleAction("batch_approve")} reason="전체 관리자만 승인할 수 있습니다." type="button">선택 승인</PermissionButton>
              <PermissionButton allowed={!!page?.canUseMemberApproveAction && selectedIds.length > 0} className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 text-sm font-bold rounded-[var(--kr-gov-radius)] hover:bg-red-100" onClick={() => handleAction("batch_reject")} reason="전체 관리자만 반려할 수 있습니다." type="button">선택 반려</PermissionButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-gray-50 border-b border-[var(--kr-gov-border-light)]">
                <tr className="text-left text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-4 w-12 text-center">
                    <input checked={approvalRows.length > 0 && selectedIds.length === approvalRows.length} className="rounded border-gray-300" onChange={(e) => toggleSelectAll(e.target.checked)} type="checkbox" />
                  </th>
                  <th className="px-4 py-4 font-bold">신청인(ID)</th>
                  <th className="px-4 py-4 font-bold">소속기관</th>
                  <th className="px-4 py-4 font-bold">회원구분</th>
                  <th className="px-4 py-4 font-bold">신청일</th>
                  <th className="px-4 py-4 font-bold">첨부서류</th>
                  <th className="px-4 py-4 font-bold text-center">상태</th>
                  <th className="px-4 py-4 font-bold text-center">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvalRows.length === 0 ? (
                  <tr><td className="px-4 py-12 text-center text-sm text-gray-500" colSpan={8}>조회된 승인 대상 회원이 없습니다.</td></tr>
                ) : approvalRows.map((row, index) => {
                  const id = String(row.memberId || `member-${index}`);
                  const evidenceFiles = (row.evidenceFiles as Array<Record<string, unknown>> | undefined) || [];
                  return (
                    <tr className="align-top hover:bg-gray-50/60" key={id}>
                      <td className="px-4 py-4 text-center">
                        <input checked={selectedIds.includes(id)} className="rounded border-gray-300" onChange={() => toggleSelection(id)} type="checkbox" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900">{String(row.memberName || "-")}</div>
                        <div className="text-xs text-gray-500 mt-1">{id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{String(row.companyName || "-")}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">{String(row.membershipTypeLabel || "-")}</td>
                      <td className="px-4 py-4 text-gray-600">{String(row.joinDate || "-")}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          {evidenceFiles.length === 0 ? <span className="text-xs text-gray-400">등록 파일 없음</span> : evidenceFiles.map((file, fileIndex) => (
                            <a className="inline-flex items-center gap-1 text-xs font-bold text-[var(--kr-gov-blue)] hover:underline" href={String(file.downloadUrl || "#")} key={`${String(file.fileName || "file")}-${fileIndex}`}>
                              {String(file.fileName || "-")}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${String(row.statusBadgeClass || "bg-slate-100 text-slate-700")}`}>{String(row.statusLabel || "-")}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button className="px-3 py-1.5 border border-[var(--kr-gov-border-light)] bg-white text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50" onClick={() => setReviewMemberId(id)} type="button">상세 검토</button>
                          <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="px-3 py-1.5 bg-[var(--kr-gov-blue)] text-white text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)]" onClick={() => handleAction("approve", id)} reason="전체 관리자만 승인할 수 있습니다." type="button">승인</PermissionButton>
                          <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="px-3 py-1.5 border border-red-200 bg-red-50 text-red-600 text-[12px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-red-100" onClick={() => handleAction("reject", id)} reason="전체 관리자만 반려할 수 있습니다." type="button">반려</PermissionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center gap-1 border-t border-[var(--kr-gov-border-light)] px-6 py-4 bg-white">
            <button className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => movePage(Math.max(1, currentPage - 1))} type="button">이전</button>
            {pageNumbers.map((pageNumber) => (
              <button className={`rounded px-3 py-2 text-sm ${pageNumber === currentPage ? "bg-[var(--kr-gov-blue)] text-white font-bold" : "text-gray-600 hover:bg-gray-100"}`} key={pageNumber} onClick={() => movePage(pageNumber)} type="button">
                {pageNumber}
              </button>
            ))}
            <button className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => movePage(Math.min(totalPages, currentPage + 1))} type="button">다음</button>
          </div>
        </section>

        {reviewRow ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--kr-gov-border-light)] bg-white px-6 py-4">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">assignment_ind</span>
                  회원가입 신청 상세 검토
                </h3>
                <button className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setReviewMemberId("")} type="button">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-6 overflow-y-auto px-6 py-6">
                <section>
                  <h4 className="mb-3 flex items-center gap-2 text-[16px] font-bold"><span className="h-4 w-1 rounded-full bg-[var(--kr-gov-blue)]"></span>신청자 기본 정보</h4>
                  <div className="border-t-2 border-[var(--kr-gov-text-primary)]">
                    {[
                      ["신청자명", String(reviewRow.memberName || "-")],
                      ["회원 ID", String(reviewRow.memberId || "-")],
                      ["회원 유형", String(reviewRow.membershipTypeLabel || "-")],
                      ["신청일", String(reviewRow.joinDate || "-")]
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[140px_1fr] border-b border-[var(--kr-gov-border-light)]" key={label}>
                        <div className="bg-gray-50 px-4 py-3 text-sm font-bold text-[var(--kr-gov-text-secondary)] border-r border-[var(--kr-gov-border-light)]">{label}</div>
                        <div className="px-4 py-3 text-sm text-[var(--kr-gov-text-primary)]">{value}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="mb-3 flex items-center gap-2 text-[16px] font-bold"><span className="h-4 w-1 rounded-full bg-[var(--kr-gov-blue)]"></span>소속 정보</h4>
                  <div className="border-t-2 border-[var(--kr-gov-text-primary)]">
                    {[
                      ["업체/기관명", String(reviewRow.companyName || "-")],
                      ["사업자등록번호", String((reviewRow.member as Record<string, unknown> | undefined)?.bizrno || "-")],
                      ["부서명", String((reviewRow.member as Record<string, unknown> | undefined)?.deptNm || "-")],
                      ["대표자", String((reviewRow.member as Record<string, unknown> | undefined)?.cxfc || "-")]
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[140px_1fr] border-b border-[var(--kr-gov-border-light)]" key={label}>
                        <div className="bg-gray-50 px-4 py-3 text-sm font-bold text-[var(--kr-gov-text-secondary)] border-r border-[var(--kr-gov-border-light)]">{label}</div>
                        <div className="px-4 py-3 text-sm text-[var(--kr-gov-text-primary)]">{value}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h4 className="mb-3 flex items-center gap-2 text-[16px] font-bold"><span className="h-4 w-1 rounded-full bg-[var(--kr-gov-blue)]"></span>증빙 서류 확인</h4>
                  <div className="space-y-3 rounded-[var(--kr-gov-radius)] bg-[#f2f2f2] p-4">
                    {(((reviewRow.evidenceFiles as Array<Record<string, unknown>> | undefined) || []).length === 0) ? (
                      <div className="rounded border border-dashed border-[var(--kr-gov-border-light)] bg-white px-4 py-6 text-center text-sm text-gray-500">등록된 첨부 파일이 없습니다.</div>
                    ) : ((reviewRow.evidenceFiles as Array<Record<string, unknown>> | undefined) || []).map((file, index) => (
                      <div className="flex items-center justify-between rounded border border-[var(--kr-gov-border-light)] bg-white p-3" key={`${String(file.fileName || "file")}-${index}`}>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-gray-500">description</span>
                          <span className="text-sm font-medium">{String(file.fileName || "-")}</span>
                        </div>
                        <a className="flex items-center gap-1 rounded border border-[var(--kr-gov-blue)] px-3 py-1.5 text-xs font-bold text-[var(--kr-gov-blue)] hover:bg-blue-50" href={String(file.downloadUrl || "#")}>
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          미리보기
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="flex items-center gap-3 border-t border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-6">
                <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="h-12 flex-1 rounded-[var(--kr-gov-radius)] border border-red-500 bg-white px-6 font-bold text-red-600 hover:bg-red-50 sm:flex-none sm:min-w-[100px]" onClick={() => handleAction("reject", String(reviewRow.memberId || ""))} reason="전체 관리자만 반려할 수 있습니다." type="button">반려</PermissionButton>
                <div className="hidden flex-grow sm:block"></div>
                <PermissionButton allowed={!!page?.canUseMemberApproveAction} className="h-12 flex-1 rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-10 font-bold text-white hover:bg-[var(--kr-gov-blue-hover)] sm:flex-none" onClick={() => handleAction("approve", String(reviewRow.memberId || ""))} reason="전체 관리자만 승인할 수 있습니다." type="button">승인 완료</PermissionButton>
              </div>
            </div>
          </div>
        ) : null}
      </CanView>
    </AdminPageShell>
  );
}
