import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import {
  CompanyApprovePagePayload,
  fetchCompanyApprovePage,
  submitCompanyApproveAction
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberPermissionButton, MEMBER_BUTTON_LABELS } from "../member/common";
import { MemberStateCard, ReviewModalFrame } from "../member/sections";
import { CompanyApproveFilters, CompanyApproveReviewContent, CompanyApproveSearchSection, CompanyApproveTableSection, DEFAULT_COMPANY_APPROVE_FILTERS } from "./companyApproveSections";

export function CompanyApproveMigrationPage() {
  const initialFilters = {
    searchKeyword: getSearchParam("searchKeyword"),
    status: getSearchParam("sbscrbSttus") || DEFAULT_COMPANY_APPROVE_FILTERS.status,
    pageIndex: Number(getSearchParam("pageIndex") || DEFAULT_COMPANY_APPROVE_FILTERS.pageIndex)
  };
  const initialResult = getSearchParam("result");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<CompanyApproveFilters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<CompanyApproveFilters>(initialFilters);
  const [actionError, setActionError] = useState(() => getSearchParam("errorMessage"));
  const [message, setMessage] = useState("");
  const [reviewInsttId, setReviewInsttId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<CompanyApprovePagePayload>(
    () => fetchCompanyApprovePage({
      pageIndex: filters.pageIndex,
      searchKeyword: filters.searchKeyword,
      sbscrbSttus: filters.status,
      result: initialResult
    }),
    [filters.pageIndex, filters.searchKeyword, filters.status],
    {
      onSuccess(pagePayload) {
        const nextFilters = {
          searchKeyword: String(pagePayload.searchKeyword || ""),
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
  const approvalRows = (page?.approvalRows || []) as Array<Record<string, unknown>>;
  const reviewRow = approvalRows.find((row) => String(row.insttId || "") === reviewInsttId) || null;

  function updateDraft<K extends keyof CompanyApproveFilters>(key: K, value: CompanyApproveFilters[K]) {
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

  async function handleAction(action: string, insttId?: string) {
    const session = sessionState.value;
    if (!session) return;
    setActionError("");
    try {
      await submitCompanyApproveAction(session, {
        action,
        insttId,
        selectedIds: insttId ? undefined : selectedIds,
        rejectReason: action.includes("reject") ? rejectReason : undefined
      });
      await pageState.reload();
      if (insttId) {
        setReviewInsttId("");
        setRejectReason("");
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
    setSelectedIds(approvalRows.map((row, index) => String(row.insttId || `instt-${index}`)));
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
        { label: "회원사" },
        { label: "회원사 가입승인" }
      ]}
      subtitle="회원사 등록 신청 내역을 검토하고 승인 또는 반려 상태를 처리합니다."
      title="회원사 가입승인"
      loading={pageState.loading && !page && !error}
      loadingLabel="회원사 승인 대상을 불러오는 중입니다."
    >
      <section className="gov-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-[40px] text-[var(--kr-gov-blue)]">domain_verification</span>
          <div>
            <h3 className="text-lg font-black">회원사 승인 처리</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
              회원사 목록 데이터를 기준으로 승인 대기, 활성, 반려 상태를 검토하고 처리합니다.
              회원사 기본 정보와 첨부 서류를 확인한 뒤 승인 또는 반려를 진행할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</section> : null}
      {error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</section> : null}
      {!pageState.loading && !!page && !page?.canViewCompanyApprove ? (
        <MemberStateCard description="현재 계정으로는 회원사 승인 관리 화면을 조회할 수 없습니다." icon="lock" title="권한이 없습니다." tone="warning" />
      ) : null}
      <CanView allowed={!!page?.canViewCompanyApprove} fallback={null}>
        <CompanyApproveSearchSection
          applyFilters={applyFilters}
          draftFilters={draftFilters}
          resetFilters={() => { setDraftFilters(DEFAULT_COMPANY_APPROVE_FILTERS); setFilters(DEFAULT_COMPANY_APPROVE_FILTERS); }}
          updateDraft={updateDraft}
        />

        <CompanyApproveTableSection
          approvalRows={approvalRows}
          currentPage={currentPage}
          handleAction={handleAction}
          movePage={movePage}
          openReview={setReviewInsttId}
          page={page}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelection={toggleSelection}
          totalPages={totalPages}
        />

        <ReviewModalFrame
          footerLeft={(
            reviewRow ? <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction} className="flex-1 sm:min-w-[100px] sm:flex-none" onClick={() => handleAction("reject", String(reviewRow.insttId || ""))} reason="마스터 관리자만 반려할 수 있습니다." size="lg" type="button" variant="dangerSecondary">{MEMBER_BUTTON_LABELS.reject}</MemberPermissionButton> : null
          )}
          footerRight={(
            reviewRow ? <MemberPermissionButton allowed={!!page?.canUseCompanyApproveAction} className="flex-1 sm:flex-none" onClick={() => handleAction("approve", String(reviewRow.insttId || ""))} reason="마스터 관리자만 승인할 수 있습니다." size="lg" type="button" variant="primary">{MEMBER_BUTTON_LABELS.approveDone}</MemberPermissionButton> : null
          )}
          onClose={() => {
            setReviewInsttId("");
            setRejectReason("");
          }}
          open={!!reviewRow}
          title="회원사 가입 신청 상세 검토"
        >
          {reviewRow ? (
            <>
              <CompanyApproveReviewContent reviewRow={reviewRow} />
              <section className="mt-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--kr-gov-text-primary)]">반려 사유</span>
                  <textarea
                    className="gov-input min-h-[120px] py-3"
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="회원사 반려 사유를 입력하세요."
                    value={rejectReason}
                  />
                </label>
              </section>
            </>
          ) : null}
        </ReviewModalFrame>
      </CanView>
    </AdminPageShell>
  );
}
