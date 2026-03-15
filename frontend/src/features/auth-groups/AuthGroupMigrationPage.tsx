import { FormEvent, useEffect, useState } from "react";
import {
  AuthGroupPagePayload,
  FrontendSession,
  createAuthGroup,
  fetchAuthGroupPage,
  fetchFrontendSession,
  saveAuthGroupFeatures
} from "../../lib/api/client";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { deriveUiPermissions } from "../../lib/auth/permissions";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

type CreateFormState = {
  authorCode: string;
  authorNm: string;
  authorDc: string;
};

type SummaryRow = {
  code?: string;
  name?: string;
  description?: string;
  status?: string;
};

type DepartmentRow = {
  cmpnyNm?: string;
  deptNm?: string;
  memberCount?: string;
  recommendedRoleName?: string;
  recommendedRoleCode?: string;
  status?: string;
};

type UserAuthorityRow = {
  userId?: string;
  userNm?: string;
  cmpnyNm?: string;
  authorNm?: string;
  authorCode?: string;
};

type AuthorityInfoRow = {
  title?: string;
  description?: string;
};

function text(page: AuthGroupPagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
}

export function AuthGroupMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AuthGroupPagePayload | null>(null);
  const [roleCategory, setRoleCategory] = useState("GENERAL");
  const [insttId, setInsttId] = useState("");
  const [authorCode, setAuthorCode] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    authorCode: "",
    authorNm: "",
    authorDc: ""
  });
  const [userSearchInput, setUserSearchInput] = useState("");
  const [submittedUserSearchKeyword, setSubmittedUserSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const payload = (page || {}) as Record<string, unknown>;
  const permissions = deriveUiPermissions(session, page);
  const roleCategories = (payload.roleCategories as Array<Record<string, string>> | undefined) || [];
  const recommendedRoleSections =
    (payload.recommendedRoleSections as Array<Record<string, unknown>> | undefined) || [];
  const deptRoleSummaries =
    (payload.authGroupDepartmentRoleSummaries as Array<Record<string, string>> | undefined) || [];
  const generalAuthorGroups =
    (payload.generalAuthorGroups as Array<Record<string, string>> | undefined) || [];
  const departmentRows =
    (payload.authGroupDepartmentRows as DepartmentRow[] | undefined) || [];
  const userAuthorityTargets =
    (payload.userAuthorityTargets as UserAuthorityRow[] | undefined) || [];
  const assignmentAuthorities =
    (payload.assignmentAuthorities as AuthorityInfoRow[] | undefined) || [];
  const referenceAuthorGroups =
    (payload.referenceAuthorGroups as Array<Record<string, string>> | undefined) || [];
  const selectedAuthorName =
    page?.selectedAuthorName || text(page, "권한 그룹을 선택하세요", "Select a role group");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetchFrontendSession(),
      fetchAuthGroupPage({
        authorCode,
        roleCategory,
        insttId,
        userSearchKeyword: submittedUserSearchKeyword
      })
    ])
      .then(([sessionPayload, nextPage]) => {
        setSession(sessionPayload);
        setPage(nextPage);
        setRoleCategory(nextPage.selectedRoleCategory || "GENERAL");
        setInsttId(nextPage.authGroupSelectedInsttId || "");
        setAuthorCode(nextPage.selectedAuthorCode || "");
        setSelectedFeatures(nextPage.selectedFeatureCodes || []);
        const nextKeyword = String((nextPage as Record<string, unknown>).userSearchKeyword || "");
        setUserSearchInput(nextKeyword);
        setSubmittedUserSearchKeyword(nextKeyword);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authorCode, roleCategory, insttId, submittedUserSearchKeyword]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setError(text(page, "세션 정보가 없습니다.", "Session is unavailable."));
      return;
    }
    setMessage("");
    setError("");
    createAuthGroup(session, {
      ...createForm,
      roleCategory,
      insttId
    })
      .then((result) => {
        setMessage(
          text(page, "권한 그룹이 생성되었습니다: ", "Authority group created: ") + result.authorCode
        );
        setAuthorCode(result.authorCode);
        setCreateForm({ authorCode: "", authorNm: "", authorDc: "" });
      })
      .catch((err: Error) => setError(err.message));
  }

  function handleSaveFeatures() {
    if (!session || !authorCode) {
      setError(text(page, "선택된 권한 그룹이 없습니다.", "No authority group selected."));
      return;
    }
    setMessage("");
    setError("");
    saveAuthGroupFeatures(session, {
      authorCode,
      roleCategory,
      featureCodes: selectedFeatures
    })
      .then(() =>
        setMessage(text(page, "Role-기능 매핑을 저장했습니다.", "Role-feature mapping saved."))
      )
      .catch((err: Error) => setError(err.message));
  }

  function toggleFeature(featureCode: string) {
    setSelectedFeatures((current) =>
      current.includes(featureCode)
        ? current.filter((code) => code !== featureCode)
        : [...current, featureCode]
    );
  }

  function handleUserSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedUserSearchKeyword(userSearchInput.trim());
  }

  function createButtonLabel() {
    if (roleCategory === "GENERAL") {
      return page?.isEn
        ? page?.isWebmaster
          ? "Add Role"
          : "Webmaster only"
        : page?.isWebmaster
          ? "Role 추가"
          : "webmaster 전용";
    }
    return page?.isEn
      ? page?.canManageScopedAuthorityGroups
        ? "Add Role"
        : "Role creation unavailable"
      : page?.canManageScopedAuthorityGroups
        ? "Role 추가"
        : "Role 추가 불가";
  }

  function renderExistingBadge(grantable: boolean) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-white text-[var(--kr-gov-text-secondary)]">
        {grantable ? text(page, "부여 가능", "Grantable") : text(page, "조회 전용", "Read only")}
      </span>
    );
  }

  function renderNeedStatus(status: string | undefined) {
    const existing = String(status || "").toLowerCase() === "existing";
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
          existing ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {existing ? text(page, "기존 존재", "Existing") : text(page, "추가 필요", "Need to add")}
      </span>
    );
  }

  function renderDepartmentStatus(status: string | undefined) {
    const normalized = String(status || "").toLowerCase();
    const className =
      normalized === "mapped"
        ? "bg-blue-50 text-blue-700"
        : normalized === "ready"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700";
    const label =
      normalized === "mapped"
        ? text(page, "매핑 완료", "Mapped")
        : normalized === "ready"
          ? text(page, "기본 매핑 후보", "Ready")
          : text(page, "검토 필요", "Needs review");
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>;
  }

  function renderUserAuthorityStatus(row: UserAuthorityRow) {
    if (!authorCode) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600">
          {text(page, "대상 권한 없음", "No target role")}
        </span>
      );
    }
    if ((row.authorCode || "").toUpperCase() === authorCode.toUpperCase()) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700">
          {text(page, "대상 권한과 동일", "Same as target")}
        </span>
      );
    }
    if (!row.authorCode) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700">
          {text(page, "권한 부여 필요", "Grant required")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700">
        {text(page, "권한 변경 필요", "Change required")}
      </span>
    );
  }

  function renderRecommendedTable(rows: SummaryRow[]) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
              <th className="px-4 py-3">{text(page, "Role 코드", "Role Code")}</th>
              <th className="px-4 py-3">{text(page, "Role 명", "Role Name")}</th>
              <th className="px-4 py-3">{text(page, "용도", "Purpose")}</th>
              <th className="px-4 py-3 text-center">{text(page, "상태", "Status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={4}>
                  {text(page, "이 분류에는 아직 준비된 권한 그룹이 없습니다.", "No roles prepared in this category yet.")}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.code || row.name || "role"}-${index}`}>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">{row.code || "-"}</td>
                  <td className="px-4 py-3">{row.name || "-"}</td>
                  <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">
                    {row.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">{renderNeedStatus(row.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <AdminPageShell
      actions={(
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
          {(page?.isWebmaster ? text(page, "마스터 계정", "Master Account") : text(page, "현재 계정", "Current Account")) +
            `: ${page?.currentUserId || session?.userId || "-"}`}
        </span>
      )}
      breadcrumbs={[
        { label: text(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: text(page, "시스템", "System") },
        { label: text(page, "권한 그룹", "Permission Groups") }
      ]}
      subtitle={text(
        page,
        "webmaster 계정이 전체 기능 카탈로그를 검토하는 마스터 권한 기준 화면입니다.",
        "Webmaster can review the full feature catalog and use this page as the master authority baseline."
      )}
      title={text(page, "권한 그룹", "Permission Groups")}
      loading={loading && !page && !error}
      loadingLabel={text(page, "권한 그룹 구성을 불러오는 중입니다.", "Loading authority group configuration.")}
    >
      {page?.authGroupError ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {page.authGroupError}
        </section>
      ) : null}
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

      <section className="gov-card border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8" data-help-id="auth-group-filters">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">tune</span>
          <h3 className="text-lg font-bold">{text(page, "권한 분류", "Role Category")}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="gov-label block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] !mb-0">
            {text(page, "권한 분류", "Role category")}
          </label>
          <select
            className="gov-select w-[18rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
            value={roleCategory}
            onChange={(event) => {
              setRoleCategory(event.target.value);
              setAuthorCode("");
            }}
          >
            {(page?.roleCategoryOptions || []).map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
          {(roleCategory === "DEPARTMENT" || roleCategory === "USER") && (
            <>
              <label className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] shrink-0 whitespace-nowrap">
                {text(page, "회사명", "Company")}
              </label>
              <select
                className="gov-select min-w-[28rem] w-[28rem] border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                value={insttId}
                onChange={(event) => setInsttId(event.target.value)}
              >
                {(page?.authGroupCompanyOptions || []).map((option) => (
                  <option key={option.insttId} value={option.insttId}>
                    {option.cmpnyNm}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </section>

      <CanView
        allowed={
          roleCategory === "GENERAL"
            ? permissions.canViewGeneralAuthGroupSection
            : permissions.canViewScopedAuthGroupSection
        }
        fallback={null}
      >
        <section className="gov-card border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8" data-help-id="auth-group-create">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">add_moderator</span>
            <h3 className="text-lg font-bold">{text(page, "권한 그룹 추가", "Create Authority Group")}</h3>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleCreate}>
            <label>
              <span className="gov-label block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {text(page, "Role 코드", "Role Code")}
              </span>
              <input
                className="gov-select w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                placeholder={
                  roleCategory === "GENERAL"
                    ? "ROLE_OPERATION_ADMIN"
                    : roleCategory === "DEPARTMENT"
                      ? "ROLE_DEPT_OPERATION"
                      : "ROLE_USER_STANDARD"
                }
                value={createForm.authorCode}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, authorCode: event.target.value }))
                }
              />
            </label>
            <label>
              <span className="gov-label block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {text(page, "Role 명", "Role Name")}
              </span>
              <input
                className="gov-select w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                placeholder={
                  roleCategory === "GENERAL"
                    ? text(page, "운영 관리자", "Operations Administrator")
                    : roleCategory === "DEPARTMENT"
                      ? text(page, "부서 운영 역할", "Department Operations Role")
                      : text(page, "사용자 표준 역할", "User Standard Role")
                }
                value={createForm.authorNm}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, authorNm: event.target.value }))
                }
              />
            </label>
            <label className="md:col-span-2">
              <span className="gov-label block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {text(page, "설명", "Description")}
              </span>
              <input
                className="gov-select w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                placeholder={
                  roleCategory === "GENERAL"
                    ? text(page, "운영 업무 전반 권한", "Administrative role baseline")
                    : roleCategory === "DEPARTMENT"
                      ? text(page, "회사/부서 범위 역할 기준", "Department-scoped role baseline")
                      : text(page, "회사/사용자 범위 역할 기준", "User-scoped role baseline")
                }
                value={createForm.authorDc}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, authorDc: event.target.value }))
                }
              />
            </label>
            {(roleCategory === "DEPARTMENT" || roleCategory === "USER") && (
              <label className="md:col-span-2">
                <span className="gov-label block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                  {text(page, "회사 범위", "Company Scope")}
                </span>
                <select
                  className="gov-select w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                  value={insttId}
                  onChange={(event) => setInsttId(event.target.value)}
                >
                  {page?.isWebmaster ? (
                    <option value="">{text(page, "회사 지정 안 함", "No company scope")}</option>
                  ) : null}
                  {(page?.authGroupCompanyOptions || []).map((option) => (
                    <option key={option.insttId} value={option.insttId}>
                      {option.cmpnyNm}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">
                  {page?.isWebmaster
                    ? text(
                        page,
                        "webmaster는 회사를 비워 공통 Role로 만들거나, 회사를 선택해 회사 범위 Role로 만들 수 있습니다.",
                        "Webmaster may leave the company empty to create a shared role, or choose a company to create a scoped role."
                      )
                    : text(
                        page,
                        "회사 범위 관리자는 본인 회사 Role만 생성할 수 있습니다.",
                        "Company-scoped administrators can create roles only for their own company."
                      )}
                </p>
              </label>
            )}
            <div className="md:col-span-4 flex justify-end">
              <PermissionButton
                allowed={
                  roleCategory === "GENERAL"
                    ? permissions.canUseGeneralAuthGroupCreate
                    : permissions.canUseScopedAuthGroupCreate
                }
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white disabled:opacity-50"
                reason={
                  roleCategory === "GENERAL"
                    ? text(page, "일반 권한 그룹 생성은 webmaster만 사용할 수 있습니다.", "Only webmaster can create general authority groups.")
                    : text(page, "회사 범위 권한이 있을 때만 부서/사용자 권한 그룹을 생성할 수 있습니다.", "Scoped authority is required to create department or user roles.")
                }
                type="submit"
              >
                {createButtonLabel()}
              </PermissionButton>
            </div>
          </form>
        </section>
      </CanView>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] uppercase">
            {text(page, "권한 그룹 수", "Authority Groups")}
          </p>
          <p className="mt-2 text-3xl font-black">{page?.authorGroupCount ?? 0}</p>
        </div>
        <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] uppercase">
            {text(page, "페이지 수", "Page Catalog")}
          </p>
          <p className="mt-2 text-3xl font-black">{page?.pageCount ?? 0}</p>
        </div>
        <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)] uppercase">
            {text(page, "기능 수", "Feature Catalog")}
          </p>
          <p className="mt-2 text-3xl font-black">{page?.featureCount ?? 0}</p>
        </div>
      </div>

      <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">account_tree</span>
          <h3 className="text-lg font-bold">{text(page, "권한 모델 구조", "Authority Model")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleCategories.map((category, index) => (
            <article
              className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4"
              key={`${category.title || "category"}-${index}`}
            >
              <h4 className="font-black">{category.title || "-"}</h4>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {category.description || "-"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">playlist_add_check</span>
          <h3 className="text-lg font-bold">
            {text(page, "추가 준비가 필요한 권한 그룹", "Recommended Roles to Prepare")}
          </h3>
        </div>
        <div className="space-y-6">
          {roleCategory === "DEPARTMENT" ? (
            <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden">
              <div className="bg-gray-50 border-b border-[var(--kr-gov-border-light)] px-4 py-4">
                <h4 className="font-black">{text(page, "부서 권한 그룹", "Department Authority Groups")}</h4>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {text(page, "선택한 회사의 부서에 적용 가능한 베이스라인 Role입니다.", "Baseline roles available for the selected company departments.")}
                </p>
              </div>
              {renderRecommendedTable(
                deptRoleSummaries.map((item) => ({
                  code: item.code,
                  name: item.name,
                  description: item.description,
                  status: item.status
                }))
              )}
            </section>
          ) : (
            recommendedRoleSections.map((section, index) => {
              const rows = (((section.roles as Array<Record<string, string>> | undefined) ||
                (section.items as Array<Record<string, string>> | undefined) ||
                [])).map((item) => ({
                code: item.code,
                name: item.name,
                description: item.description,
                status: item.status
              }));
              return (
                <section
                  className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden"
                  key={`${String(section.title || "section")}-${index}`}
                >
                  <div className="bg-gray-50 border-b border-[var(--kr-gov-border-light)] px-4 py-4">
                    <h4 className="font-black">{String(section.title || text(page, "권한 그룹", "Role Group"))}</h4>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                      {String(section.description || "-")}
                    </p>
                  </div>
                  {renderRecommendedTable(rows)}
                </section>
              );
            })
          )}
        </div>
      </section>

      {roleCategory === "GENERAL" ? (
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">admin_panel_settings</span>
            <h3 className="text-lg font-bold">{text(page, "권한 그룹 목록", "Authority Groups")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {generalAuthorGroups.map((group, index) => (
              <article
                className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4 bg-gray-50"
                key={`${group.authorCode || "group"}-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{group.authorNm || "-"}</p>
                    <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{group.authorCode || "-"}</p>
                  </div>
                  {renderExistingBadge(!!page?.isWebmaster)}
                </div>
                <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">
                  {group.authorDc || text(page, "설명 없음", "No description")}
                </p>
              </article>
            ))}
          </div>
          {generalAuthorGroups.length === 0 ? (
            <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-6 text-center text-sm text-[var(--kr-gov-text-secondary)]">
              {text(page, "등록된 일반 권한 그룹이 없습니다.", "There are no general authority groups registered.")}
            </div>
          ) : null}
        </section>
      ) : null}

      {roleCategory === "DEPARTMENT" ? (
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">account_tree</span>
            <h3 className="text-lg font-bold">{text(page, "부서 권한 그룹", "Department Authority Groups")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-3">{text(page, "회사명", "Company")}</th>
                  <th className="px-4 py-3">{text(page, "부서명", "Department")}</th>
                  <th className="px-4 py-3">{text(page, "회원 수", "Members")}</th>
                  <th className="px-4 py-3">{text(page, "부서 권한 Role", "Department Role")}</th>
                  <th className="px-4 py-3">{text(page, "상태", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departmentRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                      {text(page, "선택한 회사의 부서 권한 그룹이 없습니다.", "No department authority groups for the selected company.")}
                    </td>
                  </tr>
                ) : (
                  departmentRows.map((row, index) => (
                    <tr key={`${row.recommendedRoleCode || row.deptNm || "dept"}-${index}`}>
                      <td className="px-4 py-3 font-semibold">{row.cmpnyNm || "-"}</td>
                      <td className="px-4 py-3">{row.deptNm || "-"}</td>
                      <td className="px-4 py-3">{row.memberCount || "0"}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{row.recommendedRoleName || "-"}</div>
                        <div className="text-xs text-[var(--kr-gov-text-secondary)]">
                          {row.recommendedRoleCode || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderDepartmentStatus(row.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {roleCategory === "USER" ? (
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person_search</span>
            <h3 className="text-lg font-bold">{text(page, "사용자 권한 검색", "User Authority Search")}</h3>
          </div>
          <form className="mb-4 flex flex-wrap items-end gap-3" onSubmit={handleUserSearch}>
            <label className="min-w-[18rem]">
              <span className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {text(page, "회사명", "Company")}
              </span>
              <select
                className="w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                value={insttId}
                onChange={(event) => setInsttId(event.target.value)}
              >
                {(page?.authGroupCompanyOptions || []).map((option) => (
                  <option key={option.insttId} value={option.insttId}>
                    {`${option.insttId} / ${option.cmpnyNm}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[18rem]">
              <span className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">
                {text(page, "사용자 검색", "User search")}
              </span>
              <input
                className="w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
                placeholder={text(page, "사용자 ID / 이름 / 회사명", "User ID / name / company")}
                value={userSearchInput}
                onChange={(event) => setUserSearchInput(event.target.value)}
              />
            </label>
            <button className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white h-10" type="submit">
              {text(page, "검색", "Search")}
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                  <th className="px-4 py-3">{text(page, "사용자 ID", "User ID")}</th>
                  <th className="px-4 py-3">{text(page, "이름", "Name")}</th>
                  <th className="px-4 py-3">{text(page, "회사명", "Company")}</th>
                  <th className="px-4 py-3">{text(page, "현재 권한", "Current Authority")}</th>
                  <th className="px-4 py-3">{text(page, "부여 권한", "Grant Authority")}</th>
                  <th className="px-4 py-3">{text(page, "상태", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userAuthorityTargets.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {text(page, "회사와 사용자를 검색하면 사용자 권한 현황이 표시됩니다.", "Search a company and user to review user-specific authorities.")}
                    </td>
                  </tr>
                ) : (
                  userAuthorityTargets.map((row, index) => (
                    <tr key={`${row.userId || "user"}-${index}`}>
                      <td className="px-4 py-3 font-bold">{row.userId || "-"}</td>
                      <td className="px-4 py-3">{row.userNm || "-"}</td>
                      <td className="px-4 py-3">{row.cmpnyNm || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {row.authorNm || text(page, "권한 미지정", "No authority assigned")}
                        </div>
                        <div className="text-xs text-[var(--kr-gov-text-secondary)]">
                          {row.authorCode || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {authorCode ? selectedAuthorName : text(page, "선택 권한 없음", "No target selected")}
                        </div>
                        <div className="text-xs text-[var(--kr-gov-text-secondary)]">
                          {authorCode || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderUserAuthorityStatus(row)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">manage_accounts</span>
          <h3 className="text-lg font-bold">{text(page, "권한 할당 / 부여 권한 구조", "Assignment and Grant Authority")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignmentAuthorities.map((item, index) => (
            <article
              className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4 bg-gray-50"
              key={`${item.title || "assign"}-${index}`}
            >
              <h4 className="font-black">{item.title || "-"}</h4>
              <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                {item.description || "-"}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
          {text(
            page,
            "권장 운영 방식: 이 화면에서는 Role-기능 매핑을 관리하고, 회원 수정 화면에서는 현재 관리자에게 부여 가능한 Role만 노출합니다.",
            "Recommended operation: manage role-feature mapping here, then expose only grantable roles on the member edit page according to the current administrator."
          )}
        </div>
      </section>

      <CanView
        allowed={
          roleCategory === "GENERAL"
            ? permissions.canViewGeneralAuthGroupSection
            : permissions.canViewScopedAuthGroupSection
        }
        fallback={null}
      >
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="auth-group-features">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">rule_settings</span>
            <h3 className="text-lg font-bold">{text(page, "페이지별 기능 카탈로그", "Feature Catalog by Page")}</h3>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <label className="block text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
              {text(page, "기준 권한 그룹", "Reference group")}
            </label>
            <select
              className="max-w-sm w-full border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] h-10 px-3 text-sm"
              value={authorCode}
              onChange={(event) => setAuthorCode(event.target.value)}
            >
              <option value="">{text(page, "권한 그룹 선택", "Select a role group")}</option>
              {referenceAuthorGroups.map((group) => (
                <option key={group.authorCode} value={group.authorCode}>
                  {`${group.authorNm} (${group.authorCode})`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {(page?.featureSections || []).map((section) => (
              <section
                className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] overflow-hidden"
                key={section.menuCode}
              >
                <div className="flex flex-col gap-1 bg-gray-50 px-4 py-4 border-b border-[var(--kr-gov-border-light)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black">
                        {page?.isEn ? section.menuNmEn || section.menuNm || section.menuCode : section.menuNm || section.menuNmEn || section.menuCode}
                      </h4>
                      <p className="text-xs text-[var(--kr-gov-text-secondary)]">
                        {section.menuCode}
                        {section.menuUrl ? ` | ${section.menuUrl}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-[var(--kr-gov-blue)]">
                      {`${section.features.length}${text(page, "개 기능", " features")}`}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[13px] font-bold text-[var(--kr-gov-text-secondary)]">
                        <th className="px-4 py-3">{text(page, "기능 코드", "Feature Code")}</th>
                        <th className="px-4 py-3">{text(page, "기능명", "Feature Name")}</th>
                        <th className="px-4 py-3">{text(page, "영문 기능명", "English Name")}</th>
                        <th className="px-4 py-3">{text(page, "기능 설명", "Description")}</th>
                        <th className="px-4 py-3 text-center">{text(page, "사용", "Use")}</th>
                        <th className="px-4 py-3 text-center">{text(page, "할당", "Assigned")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.features.map((feature) => (
                        <tr key={feature.featureCode}>
                          <td className="px-4 py-3 font-bold whitespace-nowrap">{feature.featureCode}</td>
                          <td className="px-4 py-3">{feature.featureNm || "-"}</td>
                          <td className="px-4 py-3">{feature.featureNmEn || "-"}</td>
                          <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{feature.featureDc || "-"}</td>
                          <td className="px-4 py-3 text-center font-semibold">{feature.useAt || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              checked={selectedFeatures.includes(feature.featureCode)}
                              className="h-4 w-4"
                              disabled={
                                roleCategory === "GENERAL"
                                  ? !permissions.canUseGeneralFeatureSave
                                  : !permissions.canUseScopedFeatureSave
                              }
                              onChange={() => toggleFeature(feature.featureCode)}
                              type="checkbox"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <PermissionButton
              allowed={
                !!authorCode &&
                (roleCategory === "GENERAL"
                  ? permissions.canUseGeneralFeatureSave
                  : permissions.canUseScopedFeatureSave)
              }
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--kr-gov-blue)] text-white disabled:opacity-50"
              onClick={handleSaveFeatures}
              reason={
                roleCategory === "GENERAL"
                  ? text(page, "일반 권한 그룹 기능 저장은 webmaster만 사용할 수 있습니다.", "Only webmaster can save general role features.")
                  : text(page, "회사 범위 권한이 있을 때만 부서/사용자 권한 그룹 기능을 저장할 수 있습니다.", "Scoped authority is required to save department or user role features.")
              }
              type="button"
            >
              {page?.isWebmaster || roleCategory !== "GENERAL"
                ? text(page, "Role 기능 저장", "Save Role Features")
                : text(page, "webmaster 전용", "Webmaster only")}
            </PermissionButton>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
