import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchPageManagementPage, type PageManagementPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf, submitFormRequest } from "../admin-system/adminSystemShared";

type Filters = {
  menuType: string;
  searchKeyword: string;
  searchUrl: string;
  autoFeature: string;
  updated: string;
  deleted: string;
  deletedRoleRefs: string;
  deletedUserOverrides: string;
};

function parseFilters(): Filters {
  const search = new URLSearchParams(window.location.search);
  return {
    menuType: search.get("menuType") || "ADMIN",
    searchKeyword: search.get("searchKeyword") || "",
    searchUrl: search.get("searchUrl") || "",
    autoFeature: search.get("autoFeature") || "",
    updated: search.get("updated") || "",
    deleted: search.get("deleted") || "",
    deletedRoleRefs: search.get("deletedRoleRefs") || "",
    deletedUserOverrides: search.get("deletedUserOverrides") || ""
  };
}

function extractQueryState(url: string): Partial<Filters> {
  const parsed = new URL(url, window.location.origin);
  const search = parsed.searchParams;
  return {
    menuType: search.get("menuType") || "ADMIN",
    searchKeyword: search.get("searchKeyword") || "",
    searchUrl: search.get("searchUrl") || "",
    autoFeature: search.get("autoFeature") || "",
    updated: search.get("updated") || "",
    deleted: search.get("deleted") || "",
    deletedRoleRefs: search.get("deletedRoleRefs") || "",
    deletedUserOverrides: search.get("deletedUserOverrides") || ""
  };
}

type IconPickerProps = {
  icons: string[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  helperText: string;
};

function IconPicker(props: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const filteredIcons = useMemo(
    () => props.icons.filter((icon) => !keyword || icon.toLowerCase().includes(keyword.toLowerCase())),
    [keyword, props.icons]
  );

  return (
    <details className="relative" open={open}>
      <summary className="flex w-full cursor-pointer items-center justify-between rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-3 py-2 text-sm list-none" onClick={(event) => {
        event.preventDefault();
        setOpen((current) => !current);
      }}>
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined">{props.value || "web"}</span>
          <span>{props.value || "web"}</span>
        </span>
        <span className="material-symbols-outlined text-[18px]">expand_more</span>
      </summary>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-3 shadow-lg">
          <input className="gov-input mb-3" placeholder={props.searchPlaceholder} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <p className="mb-2 text-xs text-[var(--kr-gov-text-secondary)]">{props.helperText}</p>
          <div className="grid max-h-[28rem] grid-cols-4 gap-2 overflow-y-auto md:grid-cols-6">
            {filteredIcons.map((icon) => (
              <button
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[var(--kr-gov-radius)] border px-2 py-3 text-xs transition-colors ${icon === props.value ? "border-[var(--kr-gov-blue)] bg-blue-50 font-bold text-[var(--kr-gov-blue)]" : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)] hover:border-[var(--kr-gov-blue)] hover:bg-blue-50"}`}
                key={icon}
                onClick={() => {
                  props.onChange(icon);
                  setOpen(false);
                }}
                type="button"
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{icon}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </details>
  );
}

type RowFormState = {
  codeNm: string;
  codeDc: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
};

export function PageManagementMigrationPage() {
  const en = isEnglish();
  const initial = useMemo(parseFilters, []);
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [openCode, setOpenCode] = useState("");
  const [actionError, setActionError] = useState("");
  const [createForm, setCreateForm] = useState({
    domainCode: "",
    code: "",
    codeNm: "",
    codeDc: "",
    menuUrl: "",
    menuIcon: "web",
    useAt: "Y"
  });
  const [editForms, setEditForms] = useState<Record<string, RowFormState>>({});
  const pageState = useAsyncValue<PageManagementPagePayload>(() => fetchPageManagementPage(filters), [filters.menuType, filters.searchKeyword, filters.searchUrl, filters.autoFeature, filters.updated, filters.deleted, filters.deletedRoleRefs, filters.deletedUserOverrides], {
    onSuccess(payload) {
      const next = {
        menuType: String(payload.menuType || "ADMIN"),
        searchKeyword: String(payload.searchKeyword || ""),
        searchUrl: String(payload.searchUrl || ""),
        autoFeature: filters.autoFeature,
        updated: filters.updated,
        deleted: filters.deleted,
        deletedRoleRefs: filters.deletedRoleRefs,
        deletedUserOverrides: filters.deletedUserOverrides
      };
      setDraft(next);
      const rows = (payload.pageRows || []) as Array<Record<string, unknown>>;
      setEditForms(() => {
        const nextState: Record<string, RowFormState> = {};
        rows.forEach((row) => {
          const code = stringOf(row, "code");
          if (!code) {
            return;
          }
          nextState[code] = {
            codeNm: stringOf(row, "codeNm"),
            codeDc: stringOf(row, "codeDc"),
            menuUrl: stringOf(row, "menuUrl"),
            menuIcon: stringOf(row, "menuIcon") || "web",
            useAt: stringOf(row, "useAt") || "Y"
          };
        });
        return nextState;
      });
    }
  });
  const page = pageState.value;
  const rows = (page?.pageRows || []) as Array<Record<string, unknown>>;
  const domainOptions = (page?.domainOptions || []) as Array<Record<string, unknown>>;
  const iconOptions = ((page?.iconOptions || []) as string[]).length > 0 ? (page?.iconOptions as string[]) : ["web"];
  const useAtOptions = ((page?.useAtOptions || []) as string[]).length > 0 ? (page?.useAtOptions as string[]) : ["Y", "N"];
  const blockedLinks = (page?.pageMgmtBlockedFeatureLinks || []) as Array<Record<string, string>>;

  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "page-management", {
      route: window.location.pathname,
      menuType: filters.menuType,
      rowCount: rows.length,
      domainOptionCount: domainOptions.length,
      blockedFeatureLinkCount: blockedLinks.length
    });
    logGovernanceScope("COMPONENT", "page-management-table", {
      component: "page-management-table",
      rowCount: rows.length,
      openCode
    });
  }, [blockedLinks.length, domainOptions.length, filters.menuType, openCode, page, rows.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>, nextState?: Partial<Filters>) {
    event.preventDefault();
    logGovernanceScope("ACTION", "page-management-submit", {
      menuType: draft.menuType,
      searchKeyword: draft.searchKeyword,
      searchUrl: draft.searchUrl
    });
    setActionError("");
    try {
      const response = await submitFormRequest(event.currentTarget);
      const merged = { ...draft, ...extractQueryState(response.url), ...(nextState || {}) } as Filters;
      setFilters(merged);
      await pageState.reload();
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : (en ? "Request failed." : "요청 처리에 실패했습니다."));
    }
  }

  function ensureDomainPrefix(domainCode: string) {
    setCreateForm((current) => {
      if (!domainCode) {
        return { ...current, domainCode };
      }
      const code = current.code.trim();
      const nextCode = !code || code.length < domainCode.length || !code.startsWith(domainCode) ? domainCode : code;
      return { ...current, domainCode, code: nextCode };
    });
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Code Management" : "코드 관리" },
        { label: en ? "Screen Management" : "화면 관리" }
      ]}
      title={en ? "Screen Management" : "화면 관리"}
      subtitle={en ? "Manage screen codes and URLs used in the admin menu based on common-code records." : "관리자 메뉴에 등록되는 화면 코드와 URL을 공통코드 기준으로 관리합니다."}
    >
      {page?.pageMgmtError || actionError || pageState.error ? (
        <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="leading-6">{actionError || page?.pageMgmtError || pageState.error}</p>
          {blockedLinks.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {blockedLinks.map((item) => (
                <a className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100" href={stringOf(item, "href")} key={stringOf(item, "featureCode")}>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>{stringOf(item, "featureCode")}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {page?.pageMgmtMessage ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{String(page.pageMgmtMessage)}</div> : null}

      <section className="gov-card mb-8" data-help-id="page-management-register">
        <div className="mb-4 flex items-center gap-2 border-b pb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">web</span>
          <h3 className="text-lg font-bold">{en ? "Register Page" : "페이지 등록"}</h3>
        </div>
        <form action={buildLocalizedPath("/admin/system/page-management/create", "/en/admin/system/page-management/create")} className="grid grid-cols-1 gap-4 xl:grid-cols-6" method="post" onSubmit={(event) => handleSubmit(event, { autoFeature: "Y", updated: "", deleted: "" })}>
          <input name="menuType" type="hidden" value={draft.menuType} />
          <div>
            <label className="gov-label" htmlFor="domainCode">{en ? "Domain" : "도메인"}</label>
            <select className="gov-select" id="domainCode" name="domainCode" value={createForm.domainCode} onChange={(event) => ensureDomainPrefix(event.target.value)}>
              <option value="">{en ? "Select" : "선택"}</option>
              {domainOptions.map((opt) => (
                <option key={stringOf(opt, "code")} value={stringOf(opt, "code")}>{stringOf(opt, "label")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="code">{en ? "Page Code" : "페이지 코드"}</label>
            <input className="gov-input" id="code" name="code" placeholder={en ? "e.g. A0060105" : "예: A0060105"} value={createForm.code} onChange={(event) => setCreateForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className="gov-label" htmlFor="codeNm">{en ? "Page Name" : "페이지명"}</label>
            <input className="gov-input" id="codeNm" name="codeNm" placeholder={en ? "e.g. Page Management" : "예: 페이지 관리"} value={createForm.codeNm} onChange={(event) => setCreateForm((current) => ({ ...current, codeNm: event.target.value }))} />
          </div>
          <div>
            <label className="gov-label" htmlFor="codeDc">{en ? "English Page Name" : "영문 페이지명"}</label>
            <input className="gov-input" id="codeDc" name="codeDc" placeholder="Page Management" value={createForm.codeDc} onChange={(event) => setCreateForm((current) => ({ ...current, codeDc: event.target.value }))} />
          </div>
          <div className="xl:col-span-2">
            <label className="gov-label" htmlFor="menuUrl">{en ? "Page URL" : "페이지 URL"}</label>
            <input className="gov-input" id="menuUrl" name="menuUrl" placeholder={en ? "e.g. /admin/system/page-management" : "예: /admin/system/page-management"} value={createForm.menuUrl} onChange={(event) => setCreateForm((current) => ({ ...current, menuUrl: event.target.value }))} />
          </div>
          <div>
            <label className="gov-label">{en ? "Menu Icon" : "메뉴 아이콘"}</label>
            <input name="menuIcon" type="hidden" value={createForm.menuIcon} />
            <IconPicker helperText={en ? "Scroll to view the full icon list." : "스크롤해서 전체 아이콘을 볼 수 있습니다."} icons={iconOptions} onChange={(value) => setCreateForm((current) => ({ ...current, menuIcon: value }))} searchPlaceholder={en ? "Search icons" : "아이콘 검색"} value={createForm.menuIcon} />
          </div>
          <div>
            <label className="gov-label" htmlFor="useAt">{en ? "Use" : "사용 여부"}</label>
            <select className="gov-select" id="useAt" name="useAt" value={createForm.useAt} onChange={(event) => setCreateForm((current) => ({ ...current, useAt: event.target.value }))}>
              {useAtOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)] xl:col-span-4">
            {en ? "When a domain is selected, the page-code input is prefilled with the common-code prefix for that domain. Page codes follow the 8-digit detail-code convention." : "도메인을 선택하면 페이지 코드 입력칸에 해당 도메인 공통코드 앞자리를 미리 채웁니다. 페이지 코드는 8자리 상세 코드 체계를 따릅니다."}
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 xl:col-span-2">
            {en ? <>Registering a page automatically creates the default <span className="font-bold">PAGE_CODE_VIEW</span> feature. Review role assignment manually in the authority group screen.</> : <>페이지 등록 시 <span className="font-bold">페이지코드_VIEW</span> 기본 기능을 자동 생성합니다. 권한 부여는 권한 그룹 화면에서 수동으로 검토하세요.</>}
          </div>
          <div className="flex justify-end gap-2 xl:col-span-6">
            <button className="gov-btn gov-btn-primary" type="submit">{en ? "Add Page Code" : "페이지 코드 추가"}</button>
          </div>
        </form>
      </section>

      <section className="gov-card" data-help-id="page-management-list">
        <div className="mb-4 flex items-center gap-2 border-b pb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">travel_explore</span>
          <h3 className="text-lg font-bold">{en ? "Registered Pages" : "등록 페이지 목록"}</h3>
        </div>
        <form className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, autoFeature: "", updated: "", deleted: "", deletedRoleRefs: "", deletedUserOverrides: "" });
        }}>
          <div>
            <label className="gov-label" htmlFor="menuType">{en ? "Screen" : "화면 구분"}</label>
            <select className="gov-select" id="menuType" value={draft.menuType} onChange={(event) => setDraft((current) => ({ ...current, menuType: event.target.value }))}>
              <option value="USER">{en ? "Home" : "홈"}</option>
              <option value="ADMIN">{en ? "Admin" : "관리자"}</option>
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="searchKeyword">{en ? "Search by Name or Code" : "페이지명/코드 검색"}</label>
            <input className="gov-input" id="searchKeyword" placeholder={en ? "e.g. Page Management or A0060105" : "예: 페이지 관리 또는 A0060105"} value={draft.searchKeyword} onChange={(event) => setDraft((current) => ({ ...current, searchKeyword: event.target.value }))} />
          </div>
          <div>
            <label className="gov-label" htmlFor="searchUrl">{en ? "Search by URL" : "URL 검색"}</label>
            <input className="gov-input" id="searchUrl" placeholder="/admin/system" value={draft.searchUrl} onChange={(event) => setDraft((current) => ({ ...current, searchUrl: event.target.value }))} />
          </div>
          <div className="flex items-end gap-2">
            <button className="gov-btn gov-btn-outline w-full" type="submit">{en ? "Search" : "조회"}</button>
            <button className="gov-btn gov-btn-outline w-full" onClick={() => {
              const reset = { ...draft, searchKeyword: "", searchUrl: "", autoFeature: "", updated: "", deleted: "", deletedRoleRefs: "", deletedUserOverrides: "" };
              setDraft(reset);
              setFilters(reset);
            }} type="button">{en ? "Reset" : "초기화"}</button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">{en ? "Domain" : "도메인"}</th>
                <th className="px-4 py-3">{en ? "Page Code" : "페이지 코드"}</th>
                <th className="px-4 py-3">{en ? "Page Name" : "페이지명"}</th>
                <th className="px-4 py-3">{en ? "English Page Name" : "영문 페이지명"}</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">{en ? "Icon" : "아이콘"}</th>
                <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                <th className="px-4 py-3 text-center">{en ? "Actions" : "관리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={8}>{en ? "No registered pages." : "등록된 페이지가 없습니다."}</td></tr>
              ) : rows.flatMap((row) => {
                const code = stringOf(row, "code");
                const editForm = editForms[code] || { codeNm: "", codeDc: "", menuUrl: "", menuIcon: "web", useAt: "Y" };
                return [
                  <tr key={`${code}-view`}>
                    <td className="whitespace-nowrap px-4 py-3">{en ? stringOf(row, "domainNameEn", "domainName") : stringOf(row, "domainName")}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold">{code}</td>
                    <td className="min-w-[12rem] px-4 py-3">{stringOf(row, "codeNm")}</td>
                    <td className="min-w-[12rem] px-4 py-3">{stringOf(row, "codeDc")}</td>
                    <td className="min-w-[16rem] break-all px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "menuUrl")}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[var(--kr-gov-text-secondary)]">
                        <span className="material-symbols-outlined text-[18px]">{stringOf(row, "menuIcon") || "web"}</span>
                        <span>{stringOf(row, "menuIcon") || "web"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{stringOf(row, "useAt")}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <button className="gov-btn gov-btn-outline w-full" onClick={() => setOpenCode((current) => current === code ? "" : code)} type="button">{openCode === code ? (en ? "Close Edit" : "수정 닫기") : (en ? "Edit" : "수정")}</button>
                        <form action={buildLocalizedPath("/admin/system/page-management/delete", "/en/admin/system/page-management/delete")} method="post" onSubmit={(event) => {
                          if (!window.confirm(en
                            ? `Delete and recreate if needed. Default VIEW cleanup impact: role mappings ${numberToText(row.defaultViewRoleRefCount)}, user overrides ${numberToText(row.defaultViewUserOverrideCount)}. Continue?`
                            : `삭제 후 다시 생성해야 합니다. 기본 VIEW 정리 영향: 권한그룹 매핑 ${numberToText(row.defaultViewRoleRefCount)}건, 사용자 예외권한 ${numberToText(row.defaultViewUserOverrideCount)}건. 계속하시겠습니까?`)) {
                            event.preventDefault();
                            return;
                          }
                          void handleSubmit(event, { deleted: "Y", autoFeature: "", updated: "" });
                        }}>
                          <input name="code" type="hidden" value={code} />
                          <input name="menuType" type="hidden" value={draft.menuType} />
                          <input name="searchKeyword" type="hidden" value={draft.searchKeyword} />
                          <input name="searchUrl" type="hidden" value={draft.searchUrl} />
                          <button className="gov-btn gov-btn-danger w-full" type="submit">{en ? "Delete" : "삭제"}</button>
                        </form>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          <span className="gov-chip bg-blue-50 text-[var(--kr-gov-blue)]">{`Role ${numberToText(row.defaultViewRoleRefCount)}`}</span>
                          <span className="gov-chip bg-amber-50 text-amber-800">{`User ${numberToText(row.defaultViewUserOverrideCount)}`}</span>
                        </div>
                      </div>
                    </td>
                  </tr>,
                  openCode === code ? (
                    <tr className="bg-gray-50" key={`${code}-edit`}>
                      <td className="px-4 py-4" colSpan={8}>
                        <form action={buildLocalizedPath("/admin/system/page-management/update", "/en/admin/system/page-management/update")} className="grid grid-cols-1 items-end gap-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4 md:grid-cols-6" method="post" onSubmit={(event) => handleSubmit(event, { updated: "Y", autoFeature: "", deleted: "" })}>
                          <input name="code" type="hidden" value={code} />
                          <input name="menuType" type="hidden" value={draft.menuType} />
                          <input name="searchKeyword" type="hidden" value={draft.searchKeyword} />
                          <input name="searchUrl" type="hidden" value={draft.searchUrl} />
                          <label>
                            <span className="gov-label">{en ? "Page Name" : "페이지명"}</span>
                            <input className="gov-input" name="codeNm" value={editForm.codeNm} onChange={(event) => setEditForms((current) => ({ ...current, [code]: { ...editForm, codeNm: event.target.value } }))} />
                          </label>
                          <label>
                            <span className="gov-label">{en ? "English Page Name" : "영문 페이지명"}</span>
                            <input className="gov-input" name="codeDc" value={editForm.codeDc} onChange={(event) => setEditForms((current) => ({ ...current, [code]: { ...editForm, codeDc: event.target.value } }))} />
                          </label>
                          <label className="md:col-span-2">
                            <span className="gov-label">{en ? "Page URL" : "페이지 URL"}</span>
                            <input className="gov-input" name="menuUrl" value={editForm.menuUrl} onChange={(event) => setEditForms((current) => ({ ...current, [code]: { ...editForm, menuUrl: event.target.value } }))} />
                          </label>
                          <label>
                            <span className="gov-label">{en ? "Menu Icon" : "메뉴 아이콘"}</span>
                            <input name="menuIcon" type="hidden" value={editForm.menuIcon} />
                            <IconPicker helperText={en ? "Scroll to view the full icon list." : "스크롤해서 전체 아이콘을 볼 수 있습니다."} icons={iconOptions} onChange={(value) => setEditForms((current) => ({ ...current, [code]: { ...editForm, menuIcon: value } }))} searchPlaceholder={en ? "Search icons" : "아이콘 검색"} value={editForm.menuIcon} />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label>
                              <span className="gov-label">{en ? "Use" : "사용"}</span>
                              <select className="gov-select" name="useAt" value={editForm.useAt} onChange={(event) => setEditForms((current) => ({ ...current, [code]: { ...editForm, useAt: event.target.value } }))}>
                                {useAtOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </label>
                            <div className="flex items-end">
                              <button className="gov-btn gov-btn-outline w-full" type="submit">{en ? "Save Edit" : "수정 저장"}</button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null
                ];
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}

function numberToText(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? String(parsed) : "0";
}
