import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchMenuManagementPage,
  fetchScreenCommandPage,
  type MenuManagementPagePayload,
  type ScreenCommandPagePayload
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf } from "../admin-system/adminSystemShared";
import { toDisplayMenuUrl } from "../menu-management/menuUrlDisplay";

type AssignmentRow = {
  menuCode: string;
  menuName: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
  expsrAt: string;
  pageId: string;
  routePath: string;
  status: "assigned" | "unassigned";
};

function isPageMenu(row: Record<string, unknown>) {
  return stringOf(row, "code").trim().length === 8 && stringOf(row, "menuUrl").trim() !== "";
}

function normalizePath(value: string) {
  return value.trim().replace(/^\/en/, "");
}

function buildAssignments(
  menuRows: Array<Record<string, unknown>>,
  pages: ScreenCommandPagePayload["pages"] | undefined
) {
  const pageList = pages || [];
  return menuRows
    .filter(isPageMenu)
    .map((row): AssignmentRow => {
      const menuCode = stringOf(row, "code").toUpperCase();
      const menuUrl = toDisplayMenuUrl(stringOf(row, "menuUrl"));
      const matched = pageList.find((page) => (
        String(page.menuCode || "").toUpperCase() === menuCode
          || normalizePath(String(page.routePath || "")) === normalizePath(menuUrl)
      ));
      return {
        menuCode,
        menuName: stringOf(row, "codeNm", "codeDc", "code"),
        menuUrl,
        menuIcon: stringOf(row, "menuIcon") || "menu",
        useAt: stringOf(row, "useAt") || "Y",
        expsrAt: stringOf(row, "expsrAt") || "Y",
        pageId: matched?.pageId || "",
        routePath: matched?.routePath || "",
        status: matched ? "assigned" : "unassigned"
      };
    });
}

function emptyPayload(): ScreenCommandPagePayload {
  return {
    selectedPageId: "",
    pages: [],
    page: {
      pageId: "",
      label: "",
      routePath: "",
      menuCode: "",
      domainCode: "",
      summary: "",
      source: "",
      menuLookupUrl: "",
      surfaces: [],
      events: [],
      apis: [],
      schemas: [],
      commonCodeGroups: [],
      menuPermission: {
        menuCode: "",
        menuLookupUrl: "",
        routePath: "",
        requiredViewFeatureCode: "",
        featureCodes: [],
        featureRows: [],
        relationTables: [],
        resolverNotes: []
      },
      changeTargets: []
    }
  };
}

export function ScreenMenuAssignmentManagementMigrationPage() {
  const en = isEnglish();
  const [filter, setFilter] = useState("");
  const [selectedMenuCode, setSelectedMenuCode] = useState("");
  const menuState = useAsyncValue<MenuManagementPagePayload>(() => fetchMenuManagementPage("ADMIN"), []);
  const catalogState = useAsyncValue<ScreenCommandPagePayload>(() => fetchScreenCommandPage(""), []);
  const assignments = useMemo(
    () => buildAssignments((menuState.value?.menuRows || []) as Array<Record<string, unknown>>, catalogState.value?.pages),
    [catalogState.value?.pages, menuState.value?.menuRows]
  );
  const filteredAssignments = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) {
      return assignments;
    }
    return assignments.filter((row) => {
      const haystack = `${row.menuCode} ${row.menuName} ${row.menuUrl} ${row.pageId} ${row.routePath}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [assignments, filter]);

  useEffect(() => {
    if (!selectedMenuCode && filteredAssignments.length > 0) {
      setSelectedMenuCode(filteredAssignments[0].menuCode);
      return;
    }
    if (selectedMenuCode && filteredAssignments.every((item) => item.menuCode !== selectedMenuCode) && filteredAssignments.length > 0) {
      setSelectedMenuCode(filteredAssignments[0].menuCode);
    }
  }, [filteredAssignments, selectedMenuCode]);

  const selectedAssignment = filteredAssignments.find((item) => item.menuCode === selectedMenuCode) || null;
  const detailState = useAsyncValue<ScreenCommandPagePayload>(
    () => (selectedAssignment?.pageId ? fetchScreenCommandPage(selectedAssignment.pageId) : Promise.resolve(emptyPayload())),
    [selectedAssignment?.pageId || ""]
  );

  const orphanPages = useMemo(() => {
    const linkedPageIds = new Set(assignments.map((item) => item.pageId).filter(Boolean));
    return (catalogState.value?.pages || []).filter((page) => !linkedPageIds.has(page.pageId));
  }, [assignments, catalogState.value?.pages]);

  const error = menuState.error || catalogState.error || detailState.error;
  const assignedCount = assignments.filter((item) => item.status === "assigned").length;
  const unassignedCount = assignments.filter((item) => item.status === "unassigned").length;

  useEffect(() => {
    logGovernanceScope("PAGE", "screen-menu-assignment-management", {
      language: en ? "en" : "ko",
      selectedMenuCode,
      assignmentCount: assignments.length,
      assignedCount,
      unassignedCount,
      orphanPageCount: orphanPages.length
    });
    logGovernanceScope("COMPONENT", "screen-menu-assignment-catalog", {
      filter,
      filteredAssignmentCount: filteredAssignments.length,
      selectedMenuCode
    });
  }, [assignedCount, assignments.length, en, filter, filteredAssignments.length, orphanPages.length, selectedMenuCode, unassignedCount]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment" : "환경" },
        { label: en ? "Screen-Menu Assignment Management" : "화면-메뉴 귀속 관리" }
      ]}
      title={en ? "Screen-Menu Assignment Management" : "화면-메뉴 귀속 관리"}
      subtitle={en ? "Check which page menu is bound to which screen command page, and spot unassigned or orphaned entries." : "페이지 메뉴가 어떤 screen command 페이지에 귀속됐는지 확인하고, 미귀속/고아 상태를 점검합니다."}
    >
      {error ? (
        <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4" data-help-id="screen-menu-assignment-summary">
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Page Menus" : "페이지 메뉴"}</p>
          <p className="mt-2 text-3xl font-black">{assignments.length}</p>
        </section>
        <section className="gov-card" data-help-id="screen-menu-assignment-catalog">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Assigned" : "귀속 완료"}</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{assignedCount}</p>
        </section>
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Unassigned" : "미귀속"}</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{unassignedCount}</p>
        </section>
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Orphaned Screens" : "고아 화면"}</p>
          <p className="mt-2 text-3xl font-black text-slate-700">{orphanPages.length}</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[24rem_1fr]">
        <section className="gov-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">{en ? "Menu Assignment List" : "귀속 목록"}</h3>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">
              {filteredAssignments.length}
            </span>
          </div>
          <input
            className="gov-input mb-4"
            onChange={(event) => setFilter(event.target.value)}
            placeholder={en ? "Search menu code, path, page ID" : "메뉴 코드, 경로, page ID 검색"}
            value={filter}
          />
          <div className="max-h-[70vh] space-y-2 overflow-y-auto">
            {filteredAssignments.map((row) => {
              const active = row.menuCode === selectedMenuCode;
              return (
                <button
                  className={`w-full rounded-[var(--kr-gov-radius)] border px-3 py-3 text-left ${active ? "border-[var(--kr-gov-blue)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white hover:border-[var(--kr-gov-blue)]"}`}
                  key={row.menuCode}
                  onClick={() => setSelectedMenuCode(row.menuCode)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{row.menuName}</strong>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${row.status === "assigned" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {row.status === "assigned" ? (en ? "Assigned" : "귀속") : (en ? "Unassigned" : "미귀속")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{row.menuCode}</p>
                  <p className="mt-1 break-all text-xs text-[var(--kr-gov-text-secondary)]">{row.menuUrl || "-"}</p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="gov-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{selectedAssignment?.menuName || (en ? "Select a menu" : "메뉴를 선택하세요")}</h3>
                <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{selectedAssignment?.menuUrl || "-"}</p>
              </div>
              {selectedAssignment ? (
                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3 text-sm">
                  <p><strong>{en ? "Menu Code" : "메뉴 코드"}</strong>: {selectedAssignment.menuCode}</p>
                  <p><strong>{en ? "Page ID" : "페이지 ID"}</strong>: {selectedAssignment.pageId || "-"}</p>
                  <p><strong>{en ? "Route" : "경로"}</strong>: {selectedAssignment.routePath || "-"}</p>
                </div>
              ) : null}
            </div>
            {selectedAssignment ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedAssignment.status === "assigned" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {selectedAssignment.status === "assigned" ? (en ? "Screen linked" : "화면 연결됨") : (en ? "No linked screen" : "연결된 화면 없음")}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {`${en ? "Use" : "사용"} ${selectedAssignment.useAt} / ${en ? "Expose" : "노출"} ${selectedAssignment.expsrAt}`}
                </span>
              </div>
            ) : null}
          </section>

          <section className="gov-card" data-help-id="screen-menu-assignment-detail">
            <h3 className="mb-4 text-lg font-bold">{en ? "Assignment Detail" : "귀속 상세"}</h3>
            {!selectedAssignment ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a menu to inspect the binding." : "귀속 상태를 보려면 메뉴를 선택하세요."}</p>
            ) : selectedAssignment.status === "unassigned" ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                {en ? "This menu exists in menu management, but no screen command page is linked by menu code or route path yet." : "이 메뉴는 menu management에는 존재하지만, 메뉴 코드 또는 route path 기준으로 연결된 screen command 페이지가 아직 없습니다."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Manifest Registry" : "Manifest Registry"}</p>
                  <p className="mt-2"><strong>{en ? "Page Name" : "페이지명"}</strong>: {detailState.value?.page?.manifestRegistry?.pageName || detailState.value?.page?.label || "-"}</p>
                  <p className="mt-2"><strong>{en ? "Layout Version" : "레이아웃 버전"}</strong>: {detailState.value?.page?.manifestRegistry?.layoutVersion || "-"}</p>
                  <p className="mt-2"><strong>{en ? "Components" : "컴포넌트 수"}</strong>: {numberOf(detailState.value?.page?.manifestRegistry as Record<string, unknown>, "componentCount")}</p>
                </div>
                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Permission Binding" : "권한 귀속"}</p>
                  <p className="mt-2"><strong>{en ? "Required View Feature" : "필수 VIEW 기능"}</strong>: {detailState.value?.page?.menuPermission?.requiredViewFeatureCode || "-"}</p>
                  <p className="mt-2"><strong>{en ? "Feature Rows" : "기능 행 수"}</strong>: {detailState.value?.page?.menuPermission?.featureRows?.length || 0}</p>
                  <p className="mt-2"><strong>{en ? "Relation Tables" : "연계 테이블"}</strong>: {(detailState.value?.page?.menuPermission?.relationTables || []).join(", ") || "-"}</p>
                </div>
              </div>
            )}
          </section>

          <section className="gov-card" data-help-id="screen-menu-assignment-orphans">
            <h3 className="mb-4 text-lg font-bold">{en ? "Orphaned Screen Pages" : "고아 화면 목록"}</h3>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>{en ? "Page ID" : "페이지 ID"}</th>
                    <th>{en ? "Label" : "화면명"}</th>
                    <th>{en ? "Route" : "경로"}</th>
                    <th>{en ? "Menu Code" : "메뉴 코드"}</th>
                  </tr>
                </thead>
                <tbody>
                  {orphanPages.length === 0 ? (
                    <tr>
                      <td className="text-center text-[var(--kr-gov-text-secondary)]" colSpan={4}>
                        {en ? "No orphaned screen page exists." : "고아 상태의 화면 페이지가 없습니다."}
                      </td>
                    </tr>
                  ) : (
                    orphanPages.map((page) => (
                      <tr key={page.pageId}>
                        <td>{page.pageId}</td>
                        <td>{page.label || "-"}</td>
                        <td>{page.routePath || "-"}</td>
                        <td>{page.menuCode || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AdminPageShell>
  );
}
