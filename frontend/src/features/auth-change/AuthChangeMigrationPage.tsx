import { useEffect, useMemo, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { AuthChangePagePayload, FrontendSession, fetchAuthChangePage, fetchFrontendSession, saveAdminAuthChange } from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { AdminAuthorityPageFrame } from "../admin-ui/pageFrames";
import { AuthChangeHistorySection, AuthChangeOverview, AuthChangeSelectedCard, AuthChangeTableSection } from "./authChangeSections";

function t(page: AuthChangePagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
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
  const [pageIndex, setPageIndex] = useState(1);

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
    return Promise.all([existingSession ? Promise.resolve(existingSession) : fetchFrontendSession(), fetchAuthChangePage()]).then(([sessionPayload, payload]) => {
      applyPayload(sessionPayload, payload);
      return { sessionPayload, payload };
    });
  }

  useEffect(() => {
    loadPage().catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!restoreEmplyrId) return;
    const target = document.getElementById(`auth-change-row-${restoreEmplyrId}`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setRestoreEmplyrId("");
  }, [page, restoreEmplyrId]);

  const canView = !!page;
  const canEdit = !!page?.isWebmaster;
  const pendingChanges = (page?.roleAssignments || []).filter((row) => (drafts[row.emplyrId] || "") !== (row.authorCode || ""));
  const visibleAssignments = (page?.roleAssignments || []).filter((row) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const matchesKeyword = !keyword || row.emplyrId.toLowerCase().includes(keyword) || row.userNm.toLowerCase().includes(keyword) || (row.authorNm || "").toLowerCase().includes(keyword) || (row.authorCode || "").toLowerCase().includes(keyword);
    const pending = (drafts[row.emplyrId] || "") !== (row.authorCode || "");
    const matchesFilter = assignmentFilter === "ALL" || (assignmentFilter === "PENDING" && pending) || (assignmentFilter === "UNCHANGED" && !pending);
    return matchesKeyword && matchesFilter;
  });
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleAssignments.length / pageSize));
  const currentPage = Math.min(pageIndex, totalPages);
  const pagedAssignments = visibleAssignments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedAssignment = (page?.roleAssignments || []).find((row) => row.emplyrId === selectedAdminId) || null;
  const selectedDraftAuthorCode = selectedAssignment ? (drafts[selectedAssignment.emplyrId] || "") : "";
  const selectedDraftAuthorName = (page?.authorGroups || []).find((group) => group.authorCode === selectedDraftAuthorCode)?.authorNm || "";
  const filteredHistory = useMemo(() => {
    const rows = page?.recentRoleChangeHistory || [];
    if (!selectedAdminId) return rows;
    const matched = rows.filter((row) => row.targetUserId === selectedAdminId);
    return matched.length > 0 ? matched : rows;
  }, [page?.recentRoleChangeHistory, selectedAdminId]);

  useEffect(() => {
    setPageIndex(1);
  }, [searchKeyword, assignmentFilter]);

  useEffect(() => {
    if (pageIndex > totalPages) setPageIndex(totalPages);
  }, [pageIndex, totalPages]);

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
    const nextAuthorName = (page?.authorGroups || []).find((group) => group.authorCode === nextAuthorCode)?.authorNm || nextAuthorCode || "Unassigned";
    const confirmed = window.confirm(t(page, `${emplyrId} 권한을 ${(currentRow.authorNm || currentRow.authorCode || "미지정")}에서 ${nextAuthorName}로 변경하시겠습니까?`, `Do you want to change ${emplyrId} from ${currentRow.authorNm || currentRow.authorCode || "Unassigned"} to ${nextAuthorName}?`));
    if (!confirmed) return;
    setError("");
    setMessage("");
    setSavingEmplyrId(emplyrId);
    saveAdminAuthChange(session, { emplyrId, authorCode: nextAuthorCode })
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
    const confirmed = window.confirm(t(page, `${pendingChanges.length}건의 관리자 권한 변경을 한 번에 저장하시겠습니까?`, `Do you want to save ${pendingChanges.length} administrator role changes at once?`));
    if (!confirmed) return;
    setError("");
    setMessage("");
    setSavingEmplyrId("__bulk__");
    try {
      for (const row of pendingChanges) {
        await saveAdminAuthChange(session, { emplyrId: row.emplyrId, authorCode: drafts[row.emplyrId] || "" });
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
      actions={<span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">{page?.assignmentCount ?? 0}{t(page, "명", " admins")}</span>}
      breadcrumbs={[
        { label: t(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: t(page, "회원/권한", "Members/Authority") },
        { label: t(page, "권한 변경", "Authority Change") }
      ]}
      subtitle={t(page, "관리자 계정별 현재 권한 그룹을 확인하고 변경합니다.", "Review and update the assigned authority group for each administrator.")}
      title={t(page, "권한 변경", "Authority Change")}
      loading={!page && !error}
      loadingLabel={t(page, "관리자 권한 데이터를 불러오는 중입니다.", "Loading administrator authority data.")}
    >
      {(page?.authChangeError || error) ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{page?.authChangeError || error}</section> : null}
      {(message || page?.authChangeMessage) ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message || page?.authChangeMessage}</section> : null}
      <CanView allowed={canView} fallback={<section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">{t(page, "권한 변경 화면을 불러올 수 없습니다.", "Unable to load the authority change page.")}</p></section>}>
        <AdminAuthorityPageFrame>
        <AuthChangeOverview page={page} pendingCount={pendingChanges.length} />
        <AuthChangeSelectedCard page={page} selectedAssignment={selectedAssignment} selectedDraftAuthorCode={selectedDraftAuthorCode} selectedDraftAuthorName={selectedDraftAuthorName} />
        <AuthChangeTableSection
          assignmentFilter={assignmentFilter}
          canEdit={canEdit}
          currentPage={currentPage}
          drafts={drafts}
          onBulkSave={() => { void handleBulkSave(); }}
          onSave={handleSave}
          page={page}
          pagedAssignments={pagedAssignments}
          pendingCount={pendingChanges.length}
          savingEmplyrId={savingEmplyrId}
          searchKeyword={searchKeyword}
          selectedAdminId={selectedAdminId}
          setAssignmentFilter={setAssignmentFilter}
          setDrafts={setDrafts}
          setPageIndex={setPageIndex}
          setSearchKeyword={setSearchKeyword}
          setSelectedAdminId={setSelectedAdminId}
          totalPages={totalPages}
        />
        <AuthChangeHistorySection page={page} rows={filteredHistory} />
        </AdminAuthorityPageFrame>
      </CanView>
    </AdminPageShell>
  );
}
