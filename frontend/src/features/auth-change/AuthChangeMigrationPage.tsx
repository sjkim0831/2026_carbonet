import { useEffect, useMemo, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import {
  AuthChangePagePayload,
  FrontendSession,
  fetchAuthChangePage,
  fetchFrontendSession,
  saveAdminAuthChange
} from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function t(page: AuthChangePagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
}

function formatResultStatus(page: AuthChangePagePayload | null, status: string) {
  const normalized = status.trim().toUpperCase();
  if (normalized === "SUCCESS") {
    return t(page, "성공", "Success");
  }
  if (normalized === "FAIL" || normalized === "FAILED" || normalized === "ERROR") {
    return t(page, "실패", "Failed");
  }
  return status || t(page, "성공", "Success");
}

export function AuthChangeMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AuthChangePagePayload | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingEmplyrId, setSavingEmplyrId] = useState("");
  const [restoreEmplyrId, setRestoreEmplyrId] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");

  function applyPayload(sessionPayload: FrontendSession, payload: AuthChangePagePayload) {
    setSession(sessionPayload);
    setPage(payload);
    const nextDrafts: Record<string, string> = {};
    payload.roleAssignments.forEach((row) => {
      nextDrafts[row.emplyrId] = row.authorCode || "";
    });
    setDrafts(nextDrafts);
    setSelectedAdminId((current) => current || payload.authChangeTargetUserId || payload.roleAssignments[0]?.emplyrId || "");
  }

  function loadPage(existingSession?: FrontendSession | null) {
    setError("");
    return Promise.all([
      existingSession ? Promise.resolve(existingSession) : fetchFrontendSession(),
      fetchAuthChangePage()
    ]).then(([sessionPayload, payload]) => {
      applyPayload(sessionPayload, payload);
      return { sessionPayload, payload };
    });
  }

  useEffect(() => {
    loadPage().catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!restoreEmplyrId) {
      return;
    }
    const target = document.getElementById(`auth-change-row-${restoreEmplyrId}`);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setRestoreEmplyrId("");
  }, [page, restoreEmplyrId]);

  const canView = !!page;
  const canEdit = !!page?.isWebmaster;
  const pendingChanges = (page?.roleAssignments || []).filter((row) => (drafts[row.emplyrId] || "") !== (row.authorCode || ""));
  const visibleAssignments = (page?.roleAssignments || []).filter((row) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const matchesKeyword = !keyword
      || row.emplyrId.toLowerCase().includes(keyword)
      || row.userNm.toLowerCase().includes(keyword)
      || (row.authorNm || "").toLowerCase().includes(keyword)
      || (row.authorCode || "").toLowerCase().includes(keyword);
    const pending = (drafts[row.emplyrId] || "") !== (row.authorCode || "");
    const matchesFilter = assignmentFilter === "ALL"
      || (assignmentFilter === "PENDING" && pending)
      || (assignmentFilter === "UNCHANGED" && !pending);
    return matchesKeyword && matchesFilter;
  });
  const selectedAssignment = (page?.roleAssignments || []).find((row) => row.emplyrId === selectedAdminId) || null;
  const selectedDraftAuthorCode = selectedAssignment ? (drafts[selectedAssignment.emplyrId] || "") : "";
  const selectedDraftAuthor = (page?.authorGroups || []).find((group) => group.authorCode === selectedDraftAuthorCode) || null;
  const filteredHistory = useMemo(() => {
    const rows = page?.recentRoleChangeHistory || [];
    if (!selectedAdminId) {
      return rows;
    }
    const matched = rows.filter((row) => row.targetUserId === selectedAdminId);
    return matched.length > 0 ? matched : rows;
  }, [page?.recentRoleChangeHistory, selectedAdminId]);

  function handleSave(emplyrId: string) {
    if (!session) {
      setError(t(page, "세션 정보가 없습니다.", "Session is unavailable."));
      return;
    }
    const currentRow = (page?.roleAssignments || []).find((row) => row.emplyrId === emplyrId);
    const nextAuthorCode = drafts[emplyrId] || "";
    if (!currentRow || nextAuthorCode === (currentRow.authorCode || "")) {
      setMessage(t(page, "변경된 권한이 없습니다.", "There is no changed role to save."));
      return;
    }
    const nextAuthor = (page?.authorGroups || []).find((group) => group.authorCode === nextAuthorCode);
    const confirmed = window.confirm(
      t(
        page,
        `${emplyrId} 권한을 ${(currentRow.authorNm || currentRow.authorCode || "미지정")}에서 ${(nextAuthor?.authorNm || nextAuthorCode || "미지정")}로 변경하시겠습니까?`,
        `Do you want to change ${emplyrId} from ${currentRow.authorNm || currentRow.authorCode || "Unassigned"} to ${nextAuthor?.authorNm || nextAuthorCode || "Unassigned"}?`
      )
    );
    if (!confirmed) {
      return;
    }
    setError("");
    setMessage("");
    setSavingEmplyrId(emplyrId);
    saveAdminAuthChange(session, {
      emplyrId,
      authorCode: nextAuthorCode
    })
      .then(() => loadPage(session))
      .then(() => {
        setSelectedAdminId(emplyrId);
        setRestoreEmplyrId(emplyrId);
        setMessage(t(page, "권한 변경을 저장했습니다.", "Authority change has been saved."));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSavingEmplyrId(""));
  }

  async function handleBulkSave() {
    if (!session || pendingChanges.length === 0) {
      setMessage(t(page, "저장할 변경이 없습니다.", "There are no pending changes to save."));
      return;
    }
    const confirmed = window.confirm(
      t(
        page,
        `${pendingChanges.length}건의 관리자 권한 변경을 한 번에 저장하시겠습니까?`,
        `Do you want to save ${pendingChanges.length} administrator role changes at once?`
      )
    );
    if (!confirmed) {
      return;
    }
    setError("");
    setMessage("");
    setSavingEmplyrId("__bulk__");
    try {
      for (const row of pendingChanges) {
        await saveAdminAuthChange(session, {
          emplyrId: row.emplyrId,
          authorCode: drafts[row.emplyrId] || ""
        });
      }
      await loadPage(session);
      setSelectedAdminId(pendingChanges[0]?.emplyrId || "");
      setRestoreEmplyrId(pendingChanges[0]?.emplyrId || "");
      setMessage(t(page, "권한 변경을 일괄 저장했습니다.", "Authority changes have been saved in bulk."));
    } catch (err) {
      setError(err instanceof Error ? err.message : t(page, "일괄 저장에 실패했습니다.", "Bulk save failed."));
    } finally {
      setSavingEmplyrId("");
    }
  }

  return (
    <AdminPageShell
      actions={(
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
          {page?.assignmentCount ?? 0}{t(page, "명", " admins")}
        </span>
      )}
      breadcrumbs={[
        { label: t(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: t(page, "회원/권한", "Members/Authority") },
        { label: t(page, "권한 변경", "Authority Change") }
      ]}
      subtitle={t(
        page,
        "관리자 계정별 현재 권한 그룹을 확인하고 변경합니다.",
        "Review and update the assigned authority group for each administrator."
      )}
      title={t(page, "권한 변경", "Authority Change")}
      loading={!page && !error}
      loadingLabel={t(page, "관리자 권한 데이터를 불러오는 중입니다.", "Loading administrator authority data.")}
    >
      {(page?.authChangeError || error) ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {page?.authChangeError || error}
        </section>
      ) : null}
      {(message || page?.authChangeMessage) ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message || page?.authChangeMessage}
        </section>
      ) : null}

      <CanView
        allowed={canView}
        fallback={(
          <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">
              {t(page, "권한 변경 화면을 불러올 수 없습니다.", "Unable to load the authority change page.")}
            </p>
          </section>
        )}
      >
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4 bg-gray-50">
              <h3 className="font-black">{t(page, "이 화면의 역할", "Purpose of this page")}</h3>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {t(
                  page,
                  "사용자 단위로 현재 Role을 확인하고, 회원 수정 화면과 연계할 권한 변경 기준을 검토합니다.",
                  "Review the current role per user and check the authority-change baseline used with member editing."
                )}
              </p>
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4 bg-gray-50">
              <h3 className="font-black">{t(page, "권장 운영", "Recommended operation")}</h3>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {t(
                  page,
                  "기본 권한은 권한 그룹/부서 권한에서 정하고, 여기서는 개인 예외와 직접 변경만 다룹니다.",
                  "Keep baseline authority in role groups and department roles, and use this page only for direct exceptions."
                )}
              </p>
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4 bg-gray-50">
              <h3 className="font-black">{t(page, "다음 단계", "Next step")}</h3>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {t(
                  page,
                  "저장 기능은 사용자-Role 변경 이력과 함께 붙이는 것이 안전합니다.",
                  "Saving should be paired with user-role change history for safer operations."
                )}
              </p>
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-blue-200 p-4 bg-blue-50">
              <h3 className="font-black text-[var(--kr-gov-blue)]">{t(page, "저장 전 변경", "Pending changes")}</h3>
              <p className="mt-2 text-2xl font-black text-[var(--kr-gov-blue)]">{pendingChanges.length}</p>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {pendingChanges.length > 0
                  ? t(page, "저장되지 않은 관리자 권한 변경이 있습니다.", "There are unsaved administrator role changes.")
                  : t(page, "현재 저장 대기 중인 변경이 없습니다.", "There are no unsaved administrator role changes.")}
              </p>
            </article>
          </div>
        </section>
        {selectedAssignment ? (
          <section className="mb-8 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-blue)]">
                  {t(page, "선택 관리자", "Selected admin")}
                </p>
                <p className="mt-2 text-lg font-black text-[var(--kr-gov-text-primary)]">
                  {selectedAssignment.userNm} ({selectedAssignment.emplyrId})
                </p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {t(page, "현재", "Current")}: {selectedAssignment.authorNm || t(page, "미지정", "Unassigned")}
                  {" -> "}
                  {t(page, "변경안", "Draft")}: {selectedDraftAuthor?.authorNm || selectedDraftAuthorCode || t(page, "미지정", "Unassigned")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDraftAuthorCode !== (selectedAssignment.authorCode || "") ? (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">
                    {t(page, "저장 대기 변경", "Pending save")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800">
                    {t(page, "변경 없음", "No pending change")}
                  </span>
                )}
                <a
                  className="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-blue)]"
                  href={buildLocalizedPath(
                    `/admin/system/observability?pageId=auth-change&actionCode=ADMIN_ROLE_ASSIGNMENT_SAVE&searchKeyword=${encodeURIComponent(selectedAssignment.emplyrId)}`,
                    `/en/admin/system/observability?pageId=auth-change&actionCode=ADMIN_ROLE_ASSIGNMENT_SAVE&searchKeyword=${encodeURIComponent(selectedAssignment.emplyrId)}`
                  )}
                >
                  {t(page, "선택 관리자 이력", "Selected admin history")}
                </a>
              </div>
            </div>
          </section>
        ) : null}
        <section
          className="gov-card"
          data-help-id="auth-change-summary"
        >
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">manage_accounts</span>
            <h3 className="text-lg font-bold">{t(page, "관리자 권한 변경 대상", "Administrator Authority Targets")}</h3>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.3fr_0.7fr_auto]">
            <label>
              <span className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {t(page, "관리자 검색", "Admin Search")}
              </span>
              <input
                className="gov-input"
                placeholder={t(page, "ID, 이름, 현재 권한 검색", "Search by ID, name, or current role")}
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </label>
            <label>
              <span className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {t(page, "변경 상태", "Change State")}
              </span>
              <select
                className="gov-select"
                value={assignmentFilter}
                onChange={(event) => setAssignmentFilter(event.target.value)}
              >
                <option value="ALL">{t(page, "전체", "All")}</option>
                <option value="PENDING">{t(page, "변경 대기만", "Pending only")}</option>
                <option value="UNCHANGED">{t(page, "변경 없음", "Unchanged")}</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                className="gov-btn gov-btn-primary w-full"
                disabled={!canEdit || pendingChanges.length === 0 || savingEmplyrId === "__bulk__"}
                onClick={() => { void handleBulkSave(); }}
                type="button"
              >
                {savingEmplyrId === "__bulk__"
                  ? t(page, "일괄 저장 중...", "Bulk saving...")
                  : t(page, "변경 일괄 저장", "Save All Pending")}
              </button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">
              {t(page, "현재 표시", "Visible")}: {visibleAssignments.length}
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800">
              {t(page, "변경 대기", "Pending")}: {pendingChanges.length}
            </span>
          </div>
          <div className="overflow-x-auto" data-help-id="auth-change-table">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-3">{t(page, "관리자 ID", "Admin ID")}</th>
                  <th className="px-4 py-3">{t(page, "이름", "Name")}</th>
                  <th className="px-4 py-3">{t(page, "조직 ID", "Organization ID")}</th>
                  <th className="px-4 py-3">{t(page, "현재 권한 그룹", "Current Authority Group")}</th>
                  <th className="px-4 py-3">{t(page, "변경 가능 후보", "Change Candidates")}</th>
                  <th className="px-4 py-3">{t(page, "상태", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleAssignments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {t(page, "조건에 맞는 관리자 계정이 없습니다.", "No administrator accounts match the current filter.")}
                    </td>
                  </tr>
                ) : (
                  visibleAssignments.map((row) => {
                    const pending = (drafts[row.emplyrId] || "") !== (row.authorCode || "");
                    const rowSelected = row.emplyrId === selectedAdminId;
                    const nextAuthor = (page?.authorGroups || []).find((group) => group.authorCode === (drafts[row.emplyrId] || ""));
                    return (
                  <tr
                    className={rowSelected ? "bg-[rgba(28,100,242,0.06)]" : ""}
                    id={`auth-change-row-${row.emplyrId}`}
                    key={row.emplyrId}
                    onClick={() => setSelectedAdminId(row.emplyrId)}
                  >
                    <td className="px-4 py-3 font-bold">{row.emplyrId}</td>
                    <td className="px-4 py-3">{row.userNm}</td>
                    <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{row.orgnztId || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{row.authorNm || t(page, "미지정", "Unassigned")}</div>
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.authorCode || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          className="min-w-[16rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                          disabled={!canEdit || row.emplyrId === "webmaster"}
                          value={drafts[row.emplyrId] || ""}
                          onChange={(event) =>
                            setDrafts((current) => ({ ...current, [row.emplyrId]: event.target.value }))
                          }
                          onClick={(event) => event.stopPropagation()}
                        >
                          {(page?.authorGroups || []).map((group) => (
                            <option key={group.authorCode} value={group.authorCode}>
                              {group.authorNm} ({group.authorCode})
                            </option>
                          ))}
                        </select>
                        <PermissionButton
                          allowed={canEdit && row.emplyrId !== "webmaster"}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white"
                          onClick={() => handleSave(row.emplyrId)}
                          reason={t(
                            page,
                            row.emplyrId === "webmaster"
                              ? ""
                              : "webmaster 권한이 있어야 관리자 권한을 변경할 수 있습니다.",
                            row.emplyrId === "webmaster"
                              ? ""
                              : "Webmaster authority is required to change administrator authority."
                          )}
                          type="button"
                        >
                          {savingEmplyrId === row.emplyrId
                            ? t(page, "저장 중...", "Saving...")
                            : t(page, "저장", "Save")}
                        </PermissionButton>
                      </div>
                      {pending ? (
                        <div className="mt-2 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          {t(page, "변경 예정", "Pending")}: {(row.authorNm || row.authorCode || t(page, "미지정", "Unassigned"))}
                          {" -> "}
                          {(nextAuthor?.authorNm || drafts[row.emplyrId] || t(page, "미지정", "Unassigned"))}
                        </div>
                      ) : null}
                      {row.emplyrId === "webmaster" ? (
                        <div className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">
                          {t(page, "webmaster는 ROLE_SYSTEM_MASTER로 고정됩니다.", "The webmaster account is fixed to ROLE_SYSTEM_MASTER.")}
                        </div>
                      ) : null}
                      {!canEdit && row.emplyrId !== "webmaster" ? (
                        <div className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">
                          {t(page, "webmaster 계정만 권한을 변경할 수 있습니다.", "Only the webmaster account can change administrator authority.")}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700">
                        {row.emplyrSttusCode === "P" ? t(page, "활성", "Active") : (row.emplyrSttusCode || "-")}
                      </span>
                    </td>
                  </tr>
                );}))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="gov-card mt-8">
          <div className="flex items-center justify-between gap-3 border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">history</span>
              <h3 className="text-lg font-bold">{t(page, "최근 권한 변경 이력", "Recent authority change history")}</h3>
            </div>
            <a
              className="inline-flex items-center rounded-full border border-[var(--kr-gov-border-light)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--kr-gov-text-primary)]"
              href={buildLocalizedPath(
                "/admin/system/observability?pageId=auth-change&actionCode=ADMIN_ROLE_ASSIGNMENT_SAVE",
                "/en/admin/system/observability?pageId=auth-change&actionCode=ADMIN_ROLE_ASSIGNMENT_SAVE"
              )}
            >
              {t(page, "감사 화면 열기", "Open audit view")}
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-3">{t(page, "변경 시각", "Changed at")}</th>
                  <th className="px-4 py-3">{t(page, "수행자", "Changed by")}</th>
                  <th className="px-4 py-3">{t(page, "대상 관리자", "Target admin")}</th>
                  <th className="px-4 py-3">{t(page, "이전 권한", "Before")}</th>
                  <th className="px-4 py-3">{t(page, "변경 권한", "After")}</th>
                  <th className="px-4 py-3">{t(page, "결과", "Result")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {t(page, "최근 권한 변경 이력이 없습니다.", "No recent authority changes were found.")}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row, index) => (
                    <tr key={`${row.changedAt}-${row.targetUserId}-${index}`}>
                      <td className="px-4 py-3 whitespace-nowrap">{row.changedAt || "-"}</td>
                      <td className="px-4 py-3 font-semibold">{row.changedBy || "-"}</td>
                      <td className="px-4 py-3">{row.targetUserId || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.beforeAuthorName || t(page, "미지정", "Unassigned")}</div>
                        <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.beforeAuthorCode || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.afterAuthorName || t(page, "미지정", "Unassigned")}</div>
                        <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.afterAuthorCode || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700">
                          {formatResultStatus(page, row.resultStatus || "")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
