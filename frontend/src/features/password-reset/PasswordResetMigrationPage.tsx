import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { fetchPasswordResetPage, resetMemberPasswordAction, type PasswordResetPagePayload } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberPagination } from "../member/common";
import { MemberStateCard } from "../member/sections";

type PasswordResetHistoryRow = {
  resetAt?: string;
  targetUserId?: string;
  targetUserSeLabel?: string;
  resetBy?: string;
  resetIp?: string;
  resetSource?: string;
  detailUrl?: string;
};

function getInitialSearchParams() {
  if (typeof window === "undefined") {
    return {
      memberId: "",
      searchKeyword: "",
      resetSource: "",
      pageIndex: 1
    };
  }

  const params = new URLSearchParams(window.location.search);
  const pageIndex = Number.parseInt(params.get("pageIndex") || "1", 10);
  return {
    memberId: params.get("memberId") || "",
    searchKeyword: params.get("searchKeyword") || "",
    resetSource: params.get("resetSource") || "",
    pageIndex: Number.isFinite(pageIndex) && pageIndex > 0 ? pageIndex : 1
  };
}

function resolvePageError(page: PasswordResetPagePayload | null) {
  if (!page) {
    return "";
  }
  const candidate = page.passwordResetError || (page.member_resetPasswordError as string | undefined);
  return candidate || "";
}

export function PasswordResetMigrationPage() {
  const initial = getInitialSearchParams();
  const [memberId, setMemberId] = useState(initial.memberId);
  const [searchKeyword, setSearchKeyword] = useState(initial.searchKeyword);
  const [resetSource, setResetSource] = useState(initial.resetSource);
  const [pageIndex, setPageIndex] = useState(initial.pageIndex);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const en = typeof window !== "undefined" && window.location.pathname.startsWith("/en/");

  const sessionState = useFrontendSession();
  const pageState = useAsyncValue(
    () => fetchPasswordResetPage({ memberId, searchKeyword, resetSource, pageIndex }),
    [memberId, searchKeyword, resetSource, pageIndex],
    {
      initialValue: null,
      onError: () => undefined
    }
  );

  const page = pageState.value;
  const backendError = resolvePageError(page);
  const error = actionError || backendError || sessionState.error || pageState.error;
  const historyRows = (page?.passwordResetHistoryList as PasswordResetHistoryRow[] | undefined) || [];
  const totalCount = Number(page?.totalCount || 0);
  const currentPage = Number(page?.pageIndex || pageIndex || 1);
  const totalPages = Number(page?.totalPages || 1);

  async function reload() {
    setActionError("");
    if (!await pageState.reload()) {
      setActionError(en ? "Failed to load password reset history." : "비밀번호 초기화 이력을 불러오지 못했습니다.");
    }
  }

  async function handleReset() {
    const session = sessionState.value;
    if (!session) {
      return;
    }
    if (!memberId.trim()) {
      setActionError(en ? "Enter a member ID to reset the password." : "비밀번호를 초기화할 회원 ID를 입력하세요.");
      return;
    }
    setActionError("");
    setMessage("");
    try {
      const result = await resetMemberPasswordAction(session, memberId.trim());
      setMessage(en
        ? `Temporary password issued: ${result.temporaryPassword}`
        : `임시 비밀번호가 발급되었습니다: ${result.temporaryPassword}`);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : (en ? "Password reset failed." : "비밀번호 초기화에 실패했습니다."));
    }
  }

  function handleSearch() {
    setActionError("");
    setMessage("");
    setPageIndex(1);
  }

  function movePage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }
    setPageIndex(nextPage);
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: en ? "/en/admin/" : "/admin/" },
        { label: en ? "Member / Permissions" : "회원·권한 관리" },
        { label: en ? "Password Reset History" : "비밀번호 초기화 이력" }
      ]}
      subtitle={en ? "Review administrator-triggered password reset history." : "관리자 비밀번호 초기화 실행 이력을 조회합니다."}
      title={en ? "Password Reset History" : "비밀번호 초기화 이력"}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <p className="text-sm text-[var(--kr-gov-text-secondary)]">
          {en ? "Total" : "전체"} <span className="font-bold text-[var(--kr-gov-blue)]">{totalCount.toLocaleString()}</span>{en ? " items" : "건"}
        </p>
      </div>

      {error ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {message ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </section>
      ) : null}
      {!pageState.loading && !!page && !page?.canViewResetHistory ? (
        <MemberStateCard description={en ? "You do not have permission to view password reset history." : "현재 계정으로는 비밀번호 초기화 이력을 조회할 수 없습니다."} icon="lock" title={en ? "Permission denied." : "권한이 없습니다."} tone="warning" />
      ) : null}

      <CanView
        allowed={!!page?.canViewResetHistory}
        fallback={null}
      >
        <section className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-6 shadow-sm" data-help-id="password-reset-search">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)]">
              <span className="mb-2 block">{en ? "Reset Type" : "유형"}</span>
              <select
                className="w-full rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-3 py-2 text-sm"
                value={resetSource}
                onChange={(event) => setResetSource(event.target.value)}
              >
                <option value="">{en ? "All" : "전체"}</option>
                <option value="ADMIN_MEMBER_RESET">{en ? "Admin Reset" : "관리자 초기화"}</option>
                <option value="SELF_SERVICE">{en ? "Self Service" : "사용자 직접 변경"}</option>
              </select>
            </label>

            <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)]">
              <span className="mb-2 block">{en ? "Member ID" : "회원 ID"}</span>
              <input
                className="w-full rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-3 py-2 text-sm"
                placeholder={en ? "Optional member ID" : "선택 입력"}
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
              />
            </label>

            <label className="block text-sm font-bold text-[var(--kr-gov-text-secondary)] md:col-span-2">
              <span className="mb-2 block">{en ? "Keyword" : "검색어"}</span>
              <input
                className="w-full rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-3 py-2 text-sm"
                placeholder={en ? "Search member ID, actor ID, or IP" : "회원 ID, 수행자 ID, IP 검색"}
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </label>

            <div className="flex items-end gap-2 md:justify-end">
              <button className="gov-btn gov-btn-primary" type="button" onClick={handleSearch}>
                {en ? "Search" : "검색"}
              </button>
              <PermissionButton
                allowed={!!page?.canUseResetPassword}
                className="gov-btn gov-btn-outline-blue"
                onClick={handleReset}
                reason={en ? "Company-scoped administrators must enter a target member ID." : "회사 범위 관리자는 대상 회원 ID가 필요합니다."}
                type="button"
              >
                {en ? "Reset Password" : "비밀번호 초기화"}
              </PermissionButton>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white shadow-sm" data-help-id="password-reset-history">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-6 py-4 text-center">{en ? "No." : "번호"}</th>
                  <th className="px-6 py-4">{en ? "Reset At" : "초기화 일시"}</th>
                  <th className="px-6 py-4">{en ? "Member ID" : "회원 ID"}</th>
                  <th className="px-6 py-4">{en ? "Member Type" : "회원 구분"}</th>
                  <th className="px-6 py-4">{en ? "Actor" : "수행자"}</th>
                  <th className="px-6 py-4">{en ? "IP" : "IP"}</th>
                  <th className="px-6 py-4">{en ? "Type" : "유형"}</th>
                  <th className="px-6 py-4 text-center">{en ? "Detail" : "상세"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyRows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-500" colSpan={8}>
                      {en ? "No password reset history found." : "조회된 비밀번호 초기화 이력이 없습니다."}
                    </td>
                  </tr>
                ) : historyRows.map((row, index) => {
                  const displayNumber = totalCount - ((currentPage - 1) * Number(page?.pageSize || 10) + index);
                  return (
                    <tr key={`${row.targetUserId || "row"}-${index}`} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-center text-gray-500">{displayNumber}</td>
                      <td className="px-6 py-4 text-gray-600">{row.resetAt || "-"}</td>
                      <td className="px-6 py-4 font-semibold">{row.targetUserId || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{row.targetUserSeLabel || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{row.resetBy || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{row.resetIp || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{row.resetSource || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {row.detailUrl ? (
                          <a className="inline-flex items-center justify-center rounded border border-[var(--kr-gov-border-light)] px-3 py-1.5 text-xs font-bold hover:bg-gray-50" href={row.detailUrl}>
                            {en ? "View Member" : "회원 보기"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <MemberPagination currentPage={currentPage} onPageChange={movePage} totalPages={totalPages} />
        </section>
      </CanView>
    </AdminPageShell>
  );
}
