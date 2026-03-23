import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import {
  fetchMemberApprovePage,
  MemberApprovePagePayload,
  submitMemberApproveAction
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberPermissionButton, MEMBER_BUTTON_LABELS } from "../member/common";
import { ReviewModalFrame } from "../member/sections";
import { DEFAULT_MEMBER_APPROVE_FILTERS, MemberApproveFilters, MemberApproveReviewContent, MemberApproveSearchSection, MemberApproveTableSection } from "./memberApproveSections";

export function MemberApproveMigrationPage() {
  const initialFilters = {
    searchKeyword: getSearchParam("searchKeyword"),
    membershipType: getSearchParam("membershipType"),
    status: getSearchParam("sbscrbSttus") || DEFAULT_MEMBER_APPROVE_FILTERS.status,
    pageIndex: Number(getSearchParam("pageIndex") || DEFAULT_MEMBER_APPROVE_FILTERS.pageIndex)
  };
  const initialResult = getSearchParam("result");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<MemberApproveFilters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<MemberApproveFilters>(initialFilters);
  const [actionError, setActionError] = useState(() => getSearchParam("errorMessage"));
  const [message, setMessage] = useState("");
  const [reviewMemberId, setReviewMemberId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<MemberApprovePagePayload>(
    () => fetchMemberApprovePage({
      pageIndex: filters.pageIndex,
      searchKeyword: filters.searchKeyword,
      membershipType: filters.membershipType,
      sbscrbSttus: filters.status,
      result: initialResult
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
  const approvalRows = (page?.approvalRows || []) as Array<Record<string, unknown>>;
  const reviewRow = approvalRows.find((row) => String(row.memberId || "") === reviewMemberId) || null;

  function updateDraft<K extends keyof MemberApproveFilters>(key: K, value: MemberApproveFilters[K]) {
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
        selectedIds: memberId ? undefined : selectedIds,
        rejectReason: action.includes("reject") ? rejectReason : undefined
      });
      await pageState.reload();
      if (memberId) {
        setReviewMemberId("");
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
        <MemberApproveSearchSection
          applyFilters={applyFilters}
          draftFilters={draftFilters}
          resetFilters={() => { setDraftFilters(DEFAULT_MEMBER_APPROVE_FILTERS); setFilters(DEFAULT_MEMBER_APPROVE_FILTERS); }}
          updateDraft={updateDraft}
        />

        <MemberApproveTableSection
          approvalRows={approvalRows}
          currentPage={currentPage}
          handleAction={handleAction}
          movePage={movePage}
          openReview={setReviewMemberId}
          page={page}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelection={toggleSelection}
          totalPages={totalPages}
        />

        <ReviewModalFrame
          footerLeft={(
            reviewRow ? <MemberPermissionButton allowed={!!page?.canUseMemberApproveAction} className="flex-1 sm:min-w-[100px] sm:flex-none" onClick={() => handleAction("reject", String(reviewRow.memberId || ""))} reason="권한 있는 관리자만 반려할 수 있습니다." size="lg" type="button" variant="dangerSecondary">{MEMBER_BUTTON_LABELS.reject}</MemberPermissionButton> : null
          )}
          footerRight={(
            reviewRow ? <MemberPermissionButton allowed={!!page?.canUseMemberApproveAction} className="flex-1 sm:flex-none" onClick={() => handleAction("approve", String(reviewRow.memberId || ""))} reason="권한 있는 관리자만 승인할 수 있습니다." size="lg" type="button" variant="primary">{MEMBER_BUTTON_LABELS.approveDone}</MemberPermissionButton> : null
          )}
          onClose={() => {
            setReviewMemberId("");
            setRejectReason("");
          }}
          open={!!reviewRow}
          title="회원 가입 신청 상세 검토"
        >
          {reviewRow ? (
            <>
              <MemberApproveReviewContent reviewRow={reviewRow} />
              <section className="mt-6">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--kr-gov-text-primary)]">반려 사유</span>
                  <textarea
                    className="gov-input min-h-[120px] py-3"
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="상세 검토 후 반려 사유를 입력하세요."
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
