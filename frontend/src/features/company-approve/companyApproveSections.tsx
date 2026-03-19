import type { ReactNode } from "react";
import type { CompanyApprovePagePayload } from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { MemberButton, MemberButtonGroup, MemberPagination, MemberPermissionButton, MemberSectionToolbar, MEMBER_BUTTON_LABELS } from "../member/common";

export type CompanyApproveFilters = {
  searchKeyword: string;
  status: string;
  pageIndex: number;
};

export const DEFAULT_COMPANY_APPROVE_FILTERS: CompanyApproveFilters = {
  searchKeyword: "",
  status: "A",
  pageIndex: 1
};

export const COMPANY_APPROVE_STATUS_OPTIONS = [
  { value: "A", label: "승인 대기" },
  { value: "P", label: "활성" },
  { value: "R", label: "반려" },
  { value: "X", label: "차단" }
];

export function CompanyApproveSearchSection({
  draftFilters,
  updateDraft,
  applyFilters,
  resetFilters
}: {
  draftFilters: CompanyApproveFilters;
  updateDraft: <K extends keyof CompanyApproveFilters>(key: K, value: CompanyApproveFilters[K]) => void;
  applyFilters: (nextPageIndex?: number) => void;
  resetFilters: () => void;
}) {
  return (
    <section className="gov-card p-5 mb-6" data-help-id="company-approve-search">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto_auto] lg:items-end">
        <label>
          <span className="block text-sm font-bold mb-2">상태</span>
          <select className="w-full rounded border-gray-300 text-sm" value={draftFilters.status} onChange={(e) => updateDraft("status", e.target.value)}>
            {COMPANY_APPROVE_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-sm font-bold mb-2">검색어</span>
          <input className="w-full rounded border-gray-300 text-sm" placeholder="회원사명, 사업자등록번호 검색" value={draftFilters.searchKeyword} onChange={(e) => updateDraft("searchKeyword", e.target.value)} />
        </label>
        <MemberButton onClick={() => applyFilters(1)} type="button" variant="primary">{MEMBER_BUTTON_LABELS.search}</MemberButton>
        <MemberButton onClick={resetFilters} type="button" variant="secondary">{MEMBER_BUTTON_LABELS.reset}</MemberButton>
      </div>
    </section>
  );
}

export function CompanyApproveTableSection({
  page,
  approvalRows,
  selectedIds,
  toggleSelectAll,
  toggleSelection,
  openReview,
  handleAction,
  currentPage,
  totalPages,
  movePage
}: {
  page: CompanyApprovePagePayload | null;
  approvalRows: Array<Record<string, unknown>>;
  selectedIds: string[];
  toggleSelectAll: (checked: boolean) => void;
  toggleSelection: (id: string) => void;
  openReview: (insttId: string) => void;
  handleAction: (action: string, insttId?: string) => void;
  currentPage: number;
  totalPages: number;
  movePage: (pageNumber: number) => void;
}) {
  return (
    <section className="gov-card overflow-hidden" data-help-id="company-approve-table">
      <MemberSectionToolbar
        actions={(
          <MemberButtonGroup data-help-id="company-approve-batch-actions">
            <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction && selectedIds.length > 0} onClick={() => handleAction("batch_approve")} reason="전체 관리자만 승인할 수 있습니다." type="button" variant="primary">선택 승인</MemberPermissionButton>
            <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction && selectedIds.length > 0} onClick={() => handleAction("batch_reject")} reason="전체 관리자만 반려할 수 있습니다." type="button" variant="dangerSecondary">선택 반려</MemberPermissionButton>
          </MemberButtonGroup>
        )}
        className="border-b border-[var(--kr-gov-border-light)] bg-gray-50 px-6 py-4"
        meta={<>총 <span className="font-bold text-[var(--kr-gov-blue)]">{Number(page?.memberApprovalTotalCount || 0).toLocaleString()}</span>건</>}
        title="회원사 승인 목록"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-gray-50 border-b border-[var(--kr-gov-border-light)]">
            <tr className="text-left text-[var(--kr-gov-text-secondary)]">
              <th className="px-4 py-4 w-12 text-center">
                <input checked={approvalRows.length > 0 && selectedIds.length === approvalRows.length} className="rounded border-gray-300" onChange={(e) => toggleSelectAll(e.target.checked)} type="checkbox" />
              </th>
              <th className="px-4 py-4 font-bold">정보 수정</th>
              <th className="px-4 py-4 font-bold">사업자등록번호</th>
              <th className="px-4 py-4 font-bold">대표자</th>
              <th className="px-4 py-4 font-bold">회원사명</th>
              <th className="px-4 py-4 font-bold">첨부서류</th>
              <th className="px-4 py-4 font-bold text-center">상태</th>
              <th className="px-4 py-4 font-bold text-center">처리</th>
            </tr>
          </thead>
          <tbody>
            {approvalRows.length === 0 ? (
              <tr><td className="px-4 py-12 text-center text-sm text-gray-500" colSpan={8}>조회된 승인 대상 회원사가 없습니다.</td></tr>
            ) : approvalRows.map((row, index) => {
              const id = String(row.insttId || `instt-${index}`);
              const evidenceFiles = (row.evidenceFiles as Array<Record<string, unknown>> | undefined) || [];
              return (
                <tr className="border-b border-[var(--kr-gov-border-light)] align-top" key={id}>
                  <td className="px-4 py-4 text-center">
                    <input checked={selectedIds.includes(id)} className="rounded border-gray-300" onChange={() => toggleSelection(id)} type="checkbox" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">{String(row.companyName || "-")}</div>
                    <div className="text-xs text-gray-500 mt-1">{String(row.membershipTypeLabel || "-")}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{String(row.businessNumber || "-")}</td>
                  <td className="px-4 py-4 text-gray-700">{String(row.representativeName || "-")}</td>
                  <td className="px-4 py-4">
                    <a className="inline-flex items-center gap-1 text-xs font-bold text-[var(--kr-gov-blue)] hover:underline" href={String(row.editUrl || buildLocalizedPath(`/admin/member/company_account?insttId=${encodeURIComponent(id)}`, `/en/admin/member/company_account?insttId=${encodeURIComponent(id)}`))}>
                      회원사 정보 수정
                    </a>
                  </td>
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
                      <MemberButton onClick={() => openReview(id)} size="xs" type="button" variant="secondary">{MEMBER_BUTTON_LABELS.review}</MemberButton>
                      <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction} onClick={() => handleAction("approve", id)} reason="전체 관리자만 승인할 수 있습니다." size="xs" type="button" variant="primary">{MEMBER_BUTTON_LABELS.approve}</MemberPermissionButton>
                      <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction} onClick={() => handleAction("reject", id)} reason="전체 관리자만 반려할 수 있습니다." size="xs" type="button" variant="dangerSecondary">{MEMBER_BUTTON_LABELS.reject}</MemberPermissionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MemberPagination currentPage={currentPage} onPageChange={movePage} totalPages={totalPages} />
    </section>
  );
}

function ReviewDataTable({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="border-t-2 border-[var(--kr-gov-text-primary)]">
      {rows.map(([label, value]) => (
        <div className="grid grid-cols-[140px_1fr]" key={label}>
          <div className="bg-gray-50 px-4 py-3 text-sm font-bold text-[var(--kr-gov-text-secondary)] border-b border-r border-[var(--kr-gov-border-light)]">{label}</div>
          <div className="px-4 py-3 text-sm text-[var(--kr-gov-text-primary)] border-b border-[var(--kr-gov-border-light)]">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 flex items-center gap-2 text-[16px] font-bold"><span className="h-4 w-1 rounded-full bg-[var(--kr-gov-blue)]"></span>{title}</h4>
      {children}
    </section>
  );
}

export function CompanyApproveReviewContent({
  reviewRow
}: {
  reviewRow: Record<string, unknown>;
}) {
  const id = String(reviewRow.insttId || "");
  const evidenceFiles = ((reviewRow.evidenceFiles as Array<Record<string, unknown>> | undefined) || []);
  return (
    <>
      <ReviewBlock title="회원사 기본 정보">
        <ReviewDataTable rows={[
          ["회원사명", String(reviewRow.companyName || "-")],
          ["기관 ID", String(reviewRow.insttId || "-")],
          ["회원 유형", String(reviewRow.membershipTypeLabel || "-")],
          ["현재 상태", String(reviewRow.statusLabel || "-")]
        ]} />
      </ReviewBlock>
      <ReviewBlock title="소속 정보">
        <ReviewDataTable rows={[
          ["업체/기관명", String(reviewRow.companyName || "-")],
          ["사업자등록번호", String(reviewRow.businessNumber || "-")],
          ["대표자명", String(reviewRow.representativeName || "-")],
          ["회원사 정보", <a className="font-bold text-[var(--kr-gov-blue)] hover:underline" href={String(reviewRow.editUrl || buildLocalizedPath(`/admin/member/company_account?insttId=${encodeURIComponent(id)}`, `/en/admin/member/company_account?insttId=${encodeURIComponent(id)}`))}>회원사 정보 수정 화면으로 이동</a>]
        ]} />
      </ReviewBlock>
      <ReviewBlock title="증빙 서류 확인">
        <div className="space-y-3 rounded-[var(--kr-gov-radius)] bg-[#f2f2f2] p-4">
          {evidenceFiles.length === 0 ? (
            <div className="rounded border border-dashed border-[var(--kr-gov-border-light)] bg-white px-4 py-6 text-center text-sm text-gray-500">등록된 첨부 파일이 없습니다.</div>
          ) : evidenceFiles.map((file, index) => (
            <div className="flex items-center justify-between rounded border border-[var(--kr-gov-border-light)] bg-white p-3" key={`${String(file.fileName || "file")}-${index}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">description</span>
                <span className="text-sm font-medium">{String(file.fileName || "-")}</span>
              </div>
              <MemberButton className="text-[var(--kr-gov-blue)]" icon="visibility" onClick={() => { window.location.href = String(file.downloadUrl || "#"); }} size="xs" type="button" variant="info">
                {MEMBER_BUTTON_LABELS.preview}
              </MemberButton>
            </div>
          ))}
        </div>
      </ReviewBlock>
    </>
  );
}
