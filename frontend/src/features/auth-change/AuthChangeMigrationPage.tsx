import { useEffect, useState } from "react";
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

export function AuthChangeMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AuthChangePagePayload | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFrontendSession().then(setSession).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchAuthChangePage()
      .then((payload) => {
        setPage(payload);
        const nextDrafts: Record<string, string> = {};
        payload.roleAssignments.forEach((row) => {
          nextDrafts[row.emplyrId] = row.authorCode || "";
        });
        setDrafts(nextDrafts);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const canView = !!page;
  const canEdit = !!page?.isWebmaster;

  function handleSave(emplyrId: string) {
    if (!session) {
      setError(t(page, "세션 정보가 없습니다.", "Session is unavailable."));
      return;
    }
    setError("");
    setMessage("");
    saveAdminAuthChange(session, {
      emplyrId,
      authorCode: drafts[emplyrId] || ""
    })
      .then(() => {
        setMessage(t(page, "권한 변경을 저장했습니다.", "Authority change has been saved."));
      })
      .catch((err: Error) => setError(err.message));
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
        <section
          className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden bg-white shadow-sm"
          data-help-id="auth-change-summary"
        >
          <div className="flex items-center justify-between gap-3 bg-gray-50 border-b border-[var(--kr-gov-border-light)] px-4 py-4">
            <h3 className="text-lg font-bold">{t(page, "관리자 권한 목록", "Administrator Authority List")}</h3>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
              {page?.assignmentCount ?? 0}{t(page, "건", " entries")}
            </span>
          </div>
          <div className="overflow-x-auto" data-help-id="auth-change-table">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-3">{t(page, "관리자 ID", "Admin ID")}</th>
                  <th className="px-4 py-3">{t(page, "이름", "Name")}</th>
                  <th className="px-4 py-3">{t(page, "조직", "Organization")}</th>
                  <th className="px-4 py-3">{t(page, "현재 권한", "Current Authority")}</th>
                  <th className="px-4 py-3">{t(page, "권한 변경", "Change Authority")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(page?.roleAssignments || []).map((row) => (
                  <tr key={row.emplyrId}>
                    <td className="px-4 py-3 font-semibold">{row.emplyrId}</td>
                    <td className="px-4 py-3">{row.userNm}</td>
                    <td className="px-4 py-3">{row.orgnztId || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{row.authorNm || "-"}</div>
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{row.authorCode || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          className="min-w-[16rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                          disabled={!canEdit}
                          value={drafts[row.emplyrId] || ""}
                          onChange={(event) =>
                            setDrafts((current) => ({ ...current, [row.emplyrId]: event.target.value }))
                          }
                        >
                          {(page?.authorGroups || []).map((group) => (
                            <option key={group.authorCode} value={group.authorCode}>
                              {group.authorNm} ({group.authorCode})
                            </option>
                          ))}
                        </select>
                        <PermissionButton
                          allowed={canEdit}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white"
                          onClick={() => handleSave(row.emplyrId)}
                          reason={t(
                            page,
                            "webmaster 권한이 있어야 관리자 권한을 변경할 수 있습니다.",
                            "Webmaster authority is required to change administrator authority."
                          )}
                          type="button"
                        >
                          {t(page, "저장", "Save")}
                        </PermissionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
