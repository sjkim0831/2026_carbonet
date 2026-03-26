import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { fetchWbsManagementPage, saveWbsManagementEntry, type WbsManagementPagePayload } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf } from "../admin-system/adminSystemShared";

type MenuNode = {
  code: string;
  label: string;
  url: string;
  icon: string;
  sortOrdr: number;
  children: MenuNode[];
};

type WbsEditorState = {
  owner: string;
  status: string;
  progress: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  notes: string;
  codexInstruction: string;
};

function parentCode(code: string) {
  if (code.length === 8) return code.slice(0, 6);
  if (code.length === 6) return code.slice(0, 4);
  return "";
}

function buildTree(rows: Array<Record<string, unknown>>) {
  const nodes = new Map<string, MenuNode>();
  rows.forEach((row) => {
    const code = stringOf(row, "code").toUpperCase();
    if (!code) return;
    nodes.set(code, {
      code,
      label: stringOf(row, "codeNm", "code"),
      url: stringOf(row, "menuUrl"),
      icon: stringOf(row, "menuIcon") || "menu",
      sortOrdr: numberOf(row, "sortOrdr"),
      children: []
    });
  });
  const roots: MenuNode[] = [];
  nodes.forEach((node) => {
    const parent = nodes.get(parentCode(node.code));
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortNodes = (items: MenuNode[]) => {
    items.sort((a, b) => {
      const orderA = a.sortOrdr > 0 ? a.sortOrdr : Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrdr > 0 ? b.sortOrdr : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.code.localeCompare(b.code);
    });
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

function editorFromRow(row: Record<string, unknown> | null): WbsEditorState {
  return {
    owner: stringOf(row, "owner"),
    status: stringOf(row, "status") || "NOT_STARTED",
    progress: String(numberOf(row, "progress")),
    plannedStartDate: stringOf(row, "plannedStartDate", "startDate"),
    plannedEndDate: stringOf(row, "plannedEndDate", "endDate"),
    actualStartDate: stringOf(row, "actualStartDate"),
    actualEndDate: stringOf(row, "actualEndDate"),
    notes: stringOf(row, "notes"),
    codexInstruction: stringOf(row, "codexInstruction")
  };
}

function statusTone(status: string) {
  if (status === "DONE") return "bg-emerald-100 text-emerald-700";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  if (status === "BLOCKED") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function varianceTone(varianceDays: number) {
  if (varianceDays > 0) return "text-red-700";
  if (varianceDays < 0) return "text-emerald-700";
  return "text-slate-600";
}

function spanActive(startDate: string, endDate: string, slotStart: string, slotEnd: string) {
  if (!startDate || !endDate) {
    return false;
  }
  return !(endDate < slotStart || startDate > slotEnd);
}

function WbsTreeNode(props: {
  node: MenuNode;
  selectedCode: string;
  onSelect: (code: string) => void;
}) {
  const { node, selectedCode, onSelect } = props;
  const isPage = node.code.length === 8;
  return (
    <li className="space-y-2">
      <button
        className={`flex w-full items-center gap-2 rounded-[var(--kr-gov-radius)] px-3 py-2 text-left text-sm ${selectedCode === node.code ? "bg-[var(--kr-gov-blue)] text-white" : "bg-white text-[var(--kr-gov-text-primary)] hover:bg-slate-50"} ${isPage ? "border border-slate-200" : "border border-transparent font-semibold"}`}
        onClick={() => {
          if (isPage) onSelect(node.code);
        }}
        type="button"
      >
        <span className="material-symbols-outlined text-base">{node.icon || (isPage ? "article" : "folder")}</span>
        <span className="min-w-0 flex-1 truncate">{node.label}</span>
        <span className="text-[11px] opacity-70">{node.code}</span>
      </button>
      {node.children.length > 0 ? (
        <ul className="ml-3 space-y-2 border-l border-slate-200 pl-3">
          {node.children.map((child) => (
            <WbsTreeNode key={child.code} node={child} onSelect={onSelect} selectedCode={selectedCode} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function WbsManagementMigrationPage() {
  const en = isEnglish();
  const [menuType, setMenuType] = useState("USER");
  const pageState = useAsyncValue<WbsManagementPagePayload>(() => fetchWbsManagementPage(menuType), [menuType]);
  const [selectedMenuCode, setSelectedMenuCode] = useState("");
  const [editor, setEditor] = useState<WbsEditorState>(editorFromRow(null));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const menuRows = (pageState.value?.menuRows || []) as Array<Record<string, unknown>>;
  const wbsRows = (pageState.value?.wbsRows || []) as Array<Record<string, unknown>>;
  const inventorySummary = (pageState.value?.inventorySummary || {}) as Record<string, unknown>;
  const waveSummary = (pageState.value?.waveSummary || []) as Array<Record<string, unknown>>;
  const timeline = (pageState.value?.timeline || {}) as Record<string, unknown>;
  const timelineWeeks = (timeline.weeks || []) as Array<Record<string, unknown>>;
  const timelineMonths = (timeline.months || []) as Array<Record<string, unknown>>;
  const statusOptions = (pageState.value?.statusOptions || []) as Array<Record<string, string>>;

  useEffect(() => {
    if (!selectedMenuCode && wbsRows.length > 0) {
      setSelectedMenuCode(stringOf(wbsRows[0], "menuCode"));
      return;
    }
    if (selectedMenuCode && !wbsRows.some((row) => stringOf(row, "menuCode") === selectedMenuCode) && wbsRows.length > 0) {
      setSelectedMenuCode(stringOf(wbsRows[0], "menuCode"));
    }
  }, [selectedMenuCode, wbsRows]);

  const selectedRow = (wbsRows.find((row) => stringOf(row, "menuCode") === selectedMenuCode) || null) as Record<string, unknown> | null;

  useEffect(() => {
    setEditor(editorFromRow(selectedRow));
  }, [selectedMenuCode, selectedRow]);

  const tree = useMemo(() => buildTree(menuRows), [menuRows]);

  const filteredRows = useMemo(() => wbsRows.filter((row) => {
    if (statusFilter !== "ALL" && stringOf(row, "status") !== statusFilter) {
      return false;
    }
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return (
      stringOf(row, "menuName").toLowerCase().includes(keyword)
      || stringOf(row, "menuCode").toLowerCase().includes(keyword)
      || stringOf(row, "menuUrl").toLowerCase().includes(keyword)
      || stringOf(row, "owner").toLowerCase().includes(keyword)
    );
  }), [searchKeyword, statusFilter, wbsRows]);

  async function handleSave() {
    if (!selectedRow) return;
    logGovernanceScope("ACTION", "wbs-management-save", {
      menuType,
      menuCode: stringOf(selectedRow, "menuCode"),
      status: editor.status,
      progress: editor.progress
    });
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await saveWbsManagementEntry({
        menuType,
        menuCode: stringOf(selectedRow, "menuCode"),
        owner: editor.owner,
        status: editor.status,
        progress: Number(editor.progress || 0),
        plannedStartDate: editor.plannedStartDate,
        plannedEndDate: editor.plannedEndDate,
        actualStartDate: editor.actualStartDate,
        actualEndDate: editor.actualEndDate,
        startDate: editor.plannedStartDate,
        endDate: editor.plannedEndDate,
        notes: editor.notes,
        codexInstruction: editor.codexInstruction
      });
      setMessage(response.message || (en ? "Saved." : "저장했습니다."));
      await pageState.reload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Failed to save." : "저장에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  }

  const selectedPrompt = stringOf(selectedRow, "codexPrompt");
  const promptPreview = editor.codexInstruction && !selectedPrompt.includes(editor.codexInstruction)
    ? `${selectedPrompt}\n추가 지시: ${editor.codexInstruction}`
    : selectedPrompt;
  const excelDownloadHref = useMemo(() => {
    const query = new URLSearchParams();
    query.set("menuType", menuType);
    if (statusFilter) {
      query.set("statusFilter", statusFilter);
    }
    if (searchKeyword.trim()) {
      query.set("searchKeyword", searchKeyword.trim());
    }
    return buildLocalizedPath(`/admin/api/admin/wbs-management/excel?${query.toString()}`, `/en/admin/api/admin/wbs-management/excel?${query.toString()}`);
  }, [menuType, searchKeyword, statusFilter]);

  useEffect(() => {
    logGovernanceScope("PAGE", "wbs-management", {
      language: en ? "en" : "ko",
      menuType,
      selectedMenuCode,
      statusFilter,
      searchKeyword: searchKeyword.trim(),
      rowCount: filteredRows.length,
      saving
    });
    logGovernanceScope("COMPONENT", "wbs-summary-cards", {
      scope: stringOf(inventorySummary, "scope"),
      rowCount: filteredRows.length,
      waveCount: waveSummary.length,
      timelineWeekCount: timelineWeeks.length,
      timelineMonthCount: timelineMonths.length
    });
  }, [en, filteredRows.length, inventorySummary, menuType, saving, searchKeyword, selectedMenuCode, statusFilter, timelineMonths.length, timelineWeeks.length, waveSummary.length]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: "WBS" }
      ]}
      title={en ? "WBS Management" : "WBS 관리"}
      subtitle={en ? "Manage planned vs actual schedules, delay indicators, and Codex execution prompts per DB menu." : "DB 메뉴 기준으로 예상일정/실적일정, 지연 지표, Codex 작업 지시문을 함께 관리합니다."}
    >
      {pageState.error || error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || pageState.error}</div> : null}
      {message ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-6" data-help-id="wbs-summary-cards">
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Scope" : "범위"}</div>
          <div className="mt-2 text-2xl font-black">{stringOf(inventorySummary, "scope") || "-"}</div>
        </article>
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Page Menus" : "페이지 메뉴"}</div>
          <div className="mt-2 text-2xl font-black">{numberOf(inventorySummary, "pageMenus")}</div>
        </article>
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Overdue" : "지연"}</div>
          <div className="mt-2 text-2xl font-black text-red-700">{numberOf(inventorySummary, "overdue")}</div>
        </article>
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "On-time Rate" : "정시 완료율"}</div>
          <div className="mt-2 text-2xl font-black">{numberOf(inventorySummary, "onTimeCompletionRate")}%</div>
        </article>
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Avg Variance" : "평균 편차"}</div>
          <div className="mt-2 text-2xl font-black">{numberOf(inventorySummary, "averageVarianceDays")}d</div>
        </article>
        <article className="gov-card min-w-0">
          <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Missing Plan" : "예상일정 미입력"}</div>
          <div className="mt-2 text-2xl font-black">{numberOf(inventorySummary, "noPlannedDate")}</div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <article className="gov-card">
            <div className="flex flex-wrap gap-2">
              <button className={`gov-btn ${menuType === "USER" ? "gov-btn-primary" : "gov-btn-outline"}`} onClick={() => setMenuType("USER")} type="button">HOME</button>
              <button className={`gov-btn ${menuType === "ADMIN" ? "gov-btn-primary" : "gov-btn-outline"}`} onClick={() => setMenuType("ADMIN")} type="button">ADMIN</button>
            </div>
            <div className="mt-4">
              <label className="gov-label" htmlFor="wbs-search">{en ? "Search" : "검색"}</label>
              <input className="gov-input" id="wbs-search" onChange={(event) => setSearchKeyword(event.target.value)} value={searchKeyword} />
            </div>
            <div className="mt-4">
              <label className="gov-label" htmlFor="wbs-status-filter">{en ? "Status Filter" : "상태 필터"}</label>
              <select className="gov-select" id="wbs-status-filter" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{en ? option.labelEn : option.label}</option>
                ))}
              </select>
            </div>
          </article>

          <article className="gov-card min-w-0" data-help-id="wbs-menu-tree">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{en ? "Menu Tree" : "메뉴 트리"}</h3>
              <span className="text-xs text-[var(--kr-gov-text-secondary)]">{wbsRows.length}</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <ul className="space-y-2">
                {tree.map((node) => (
                  <WbsTreeNode key={node.code} node={node} onSelect={setSelectedMenuCode} selectedCode={selectedMenuCode} />
                ))}
              </ul>
            </div>
          </article>
        </aside>

        <div className="min-w-0 space-y-6">
          <article className="gov-card min-w-0" data-help-id="wbs-execution-table">
            <div className="mb-4 flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">{en ? "Execution WBS" : "실행용 WBS"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Rows are sorted by the earliest planned schedule. Planned and actual dates are separated." : "가장 빠른 예상일정 순으로 정렬되고, 예상일정과 실적일정을 분리해서 봅니다."}</p>
              </div>
              <div className="flex items-start justify-end">
                <a className="gov-btn gov-btn-outline shrink-0" href={excelDownloadHref}>{en ? "Excel Download" : "엑셀 다운로드"}</a>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--kr-gov-text-secondary)]">
              {waveSummary.map((wave) => (
                <span className="rounded-full bg-slate-100 px-3 py-1" key={`${stringOf(wave, "waveOrder")}-${stringOf(wave, "waveLabel")}`}>
                  {stringOf(wave, "waveLabel")} {numberOf(wave, "done")}/{numberOf(wave, "count")} · {en ? "Overdue" : "지연"} {numberOf(wave, "overdue")}
                </span>
              ))}
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[1500px] w-full text-sm">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3 text-left">WBS</th>
                    <th className="px-4 py-3 text-left">{en ? "Menu" : "메뉴"}</th>
                    <th className="px-4 py-3 text-left">URL</th>
                    <th className="px-4 py-3 text-left">{en ? "Planned" : "예상일정"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Actual" : "작업일정"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Variance" : "편차"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Owner" : "담당"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Status" : "상태"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Progress" : "진행률"}</th>
                    <th className="px-4 py-3 text-left">{en ? "Coverage" : "메타"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row) => (
                    <tr className={`cursor-pointer align-top ${selectedMenuCode === stringOf(row, "menuCode") ? "bg-blue-50" : "bg-white"}`} key={stringOf(row, "menuCode")} onClick={() => setSelectedMenuCode(stringOf(row, "menuCode"))}>
                      <td className="px-4 py-4 whitespace-nowrap font-semibold">{stringOf(row, "wbsId")}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold">{stringOf(row, "menuName")}</div>
                        <div className="text-xs text-gray-500">{stringOf(row, "menuCode")} · {stringOf(row, "waveLabel")}</div>
                      </td>
                      <td className="px-4 py-4">
                        <a className="text-[var(--kr-gov-blue)] underline break-all" href={stringOf(row, "menuUrl")} target="_blank" rel="noreferrer">{stringOf(row, "menuUrl") || "-"}</a>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{stringOf(row, "plannedStartDate") || "-"} ~ {stringOf(row, "plannedEndDate") || "-"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{stringOf(row, "actualStartDate") || "-"} ~ {stringOf(row, "actualEndDate") || "-"}</td>
                      <td className={`px-4 py-4 font-semibold ${varianceTone(numberOf(row, "varianceDays"))}`}>
                        {numberOf(row, "varianceDays")}d
                        {stringOf(row, "status") !== "DONE" && String(row["overdue"]) === "true" ? <div className="text-xs text-red-700">{en ? "Overdue" : "지연"}</div> : null}
                      </td>
                      <td className="px-4 py-4">{stringOf(row, "owner") || "-"}</td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(stringOf(row, "status"))}`}>{stringOf(row, "status")}</span></td>
                      <td className="px-4 py-4">{numberOf(row, "progress")}%</td>
                      <td className="px-4 py-4">{numberOf(row, "coverageScore")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <article className="gov-card min-w-0" data-help-id="wbs-editor-panel">
              <div className="mb-4 border-b pb-4">
                <h3 className="text-lg font-bold">{en ? "Selected Menu Plan" : "선택 메뉴 계획"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{selectedRow ? `${stringOf(selectedRow, "menuName")} / ${stringOf(selectedRow, "menuCode")}` : (en ? "Select a menu row." : "메뉴 행을 선택하세요.")}</p>
              </div>
              {!selectedRow ? <div className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No menu selected." : "선택된 메뉴가 없습니다."}</div> : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="gov-label" htmlFor="wbs-owner">{en ? "Owner" : "담당자"}</label>
                      <input className="gov-input" id="wbs-owner" onChange={(event) => setEditor((current) => ({ ...current, owner: event.target.value }))} value={editor.owner} />
                    </div>
                    <div>
                      <label className="gov-label" htmlFor="wbs-status">{en ? "Status" : "상태"}</label>
                      <select className="gov-select" id="wbs-status" onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value }))} value={editor.status}>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{en ? option.labelEn : option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="gov-label" htmlFor="wbs-planned-start">{en ? "Planned Start" : "예상 시작일"}</label>
                      <input className="gov-input" id="wbs-planned-start" onChange={(event) => setEditor((current) => ({ ...current, plannedStartDate: event.target.value }))} type="date" value={editor.plannedStartDate} />
                    </div>
                    <div>
                      <label className="gov-label" htmlFor="wbs-planned-end">{en ? "Planned End" : "예상 종료일"}</label>
                      <input className="gov-input" id="wbs-planned-end" onChange={(event) => setEditor((current) => ({ ...current, plannedEndDate: event.target.value }))} type="date" value={editor.plannedEndDate} />
                    </div>
                    <div>
                      <label className="gov-label" htmlFor="wbs-actual-start">{en ? "Actual Start" : "작업 시작일"}</label>
                      <input className="gov-input" id="wbs-actual-start" onChange={(event) => setEditor((current) => ({ ...current, actualStartDate: event.target.value }))} type="date" value={editor.actualStartDate} />
                    </div>
                    <div>
                      <label className="gov-label" htmlFor="wbs-actual-end">{en ? "Actual End" : "작업 종료일"}</label>
                      <input className="gov-input" id="wbs-actual-end" onChange={(event) => setEditor((current) => ({ ...current, actualEndDate: event.target.value }))} type="date" value={editor.actualEndDate} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="gov-label" htmlFor="wbs-progress">{en ? "Progress" : "진행률"}</label>
                      <div className="flex items-center gap-3">
                        <input className="w-full" id="wbs-progress" max={100} min={0} onChange={(event) => setEditor((current) => ({ ...current, progress: event.target.value }))} type="range" value={editor.progress} />
                        <span className="w-12 text-right text-sm font-bold">{editor.progress}%</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="gov-label" htmlFor="wbs-notes">{en ? "Execution Notes" : "작업 메모"}</label>
                      <textarea className="w-full min-h-[120px] rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 py-3 text-sm" id="wbs-notes" onChange={(event) => setEditor((current) => ({ ...current, notes: event.target.value }))} value={editor.notes} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="gov-label" htmlFor="wbs-codex-instruction">{en ? "Codex Extra Instruction" : "Codex 추가 지시"}</label>
                      <textarea className="w-full min-h-[120px] rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 py-3 text-sm" id="wbs-codex-instruction" onChange={(event) => setEditor((current) => ({ ...current, codexInstruction: event.target.value }))} value={editor.codexInstruction} />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Page ID" : "페이지 ID"}</div>
                      <div className="mt-1 font-semibold">{stringOf(selectedRow, "pageId") || "-"}</div>
                    </div>
                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Variance" : "일정 편차"}</div>
                      <div className={`mt-1 font-semibold ${varianceTone(numberOf(selectedRow, "varianceDays"))}`}>{numberOf(selectedRow, "varianceDays")}d</div>
                    </div>
                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Planned Days" : "예상 공기"}</div>
                      <div className="mt-1 font-semibold">{numberOf(selectedRow, "plannedDurationDays")}d</div>
                    </div>
                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                      <div className="text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Actual Days" : "실작업 공기"}</div>
                      <div className="mt-1 font-semibold">{numberOf(selectedRow, "actualDurationDays")}d</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="gov-btn gov-btn-primary" disabled={saving} onClick={() => { void handleSave(); }} type="button">{saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Plan" : "계획 저장")}</button>
                    <button className="gov-btn gov-btn-outline" onClick={() => setEditor(editorFromRow(selectedRow))} type="button">{en ? "Reset Form" : "폼 초기화"}</button>
                    <a className="gov-btn gov-btn-outline" href={stringOf(selectedRow, "menuUrl")} rel="noreferrer" target="_blank">{en ? "Open Page" : "화면 열기"}</a>
                  </div>
                </>
              )}
            </article>

            <article className="gov-card min-w-0" data-help-id="wbs-codex-prompt">
              <div className="mb-4 border-b pb-4">
                <h3 className="text-lg font-bold">{en ? "Codex Work Instruction" : "Codex 작업 지시문"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Prompt includes planned/actual dates, variance, backend chain, and extra instruction." : "지시문에 예상/실적 일정, 편차, 백엔드 체인, 추가 지시를 함께 넣습니다."}</p>
              </div>
              <textarea className="w-full min-h-[420px] rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100" readOnly value={promptPreview} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="gov-btn gov-btn-primary" onClick={() => { void navigator.clipboard.writeText(promptPreview); }} type="button">{en ? "Copy Prompt" : "지시문 복사"}</button>
                <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/system/codex-request", "/en/admin/system/codex-request")} target="_blank" rel="noreferrer">{en ? "Open Codex Request" : "Codex 요청 열기"}</a>
              </div>
            </article>
          </section>

          <article className="gov-card min-w-0">
            <div className="mb-4 border-b pb-4">
              <h3 className="text-lg font-bold">{en ? "Weekly Schedule Timeline" : "주차 기준 일정표"}</h3>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Week view is the most readable here. Planned bars use light tone and actual bars use stronger tone." : "월/일보다 주차 기준이 가장 보기 좋아서 주간 보기로 고정했습니다. 예상 막대는 연한 톤, 실제 막대는 진한 톤으로 구분합니다."}</p>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[1800px] w-full text-xs">
                <thead>
                  <tr className="gov-table-header">
                    <th className="sticky left-0 z-20 bg-slate-100 px-4 py-3 text-left" rowSpan={2}>Menu</th>
                    {timelineMonths.map((month) => (
                      <th className="px-3 py-2 text-center" colSpan={Math.max(1, numberOf(month, "span"))} key={stringOf(month, "key")}>{stringOf(month, "label")}</th>
                    ))}
                  </tr>
                  <tr className="gov-table-header">
                    {timelineWeeks.map((week) => (
                      <th className="px-3 py-3 text-center" key={stringOf(week, "key")}>{stringOf(week, "label")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row) => (
                    <tr key={`timeline-${stringOf(row, "menuCode")}`}>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3">
                        <div className="font-semibold">{stringOf(row, "menuName")}</div>
                        <div className="text-[11px] text-slate-500">{stringOf(row, "menuCode")} · {stringOf(row, "owner") || "-"}</div>
                      </td>
                      {timelineWeeks.map((week) => {
                        const plannedActive = spanActive(stringOf(row, "plannedStartDate"), stringOf(row, "plannedEndDate"), stringOf(week, "startDate"), stringOf(week, "endDate"));
                        const actualActive = spanActive(stringOf(row, "actualStartDate"), stringOf(row, "actualEndDate"), stringOf(week, "startDate"), stringOf(week, "endDate"));
                        return (
                          <td className="px-2 py-2" key={`${stringOf(row, "menuCode")}-${stringOf(week, "key")}`}>
                            <div className="space-y-1">
                              <div className={`h-3 rounded-full ${plannedActive ? "bg-slate-300" : "bg-slate-50"}`} />
                              <div className={`h-3 rounded-full ${actualActive ? (stringOf(row, "status") === "DONE" ? "bg-emerald-500" : stringOf(row, "status") === "BLOCKED" ? "bg-red-500" : "bg-blue-500") : "bg-slate-100"}`} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--kr-gov-text-secondary)]">
              <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-6 rounded-full bg-slate-300" />{en ? "Planned" : "예상일정"}</span>
              <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-6 rounded-full bg-blue-500" />{en ? "Actual In Progress" : "작업일정 진행중"}</span>
              <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-6 rounded-full bg-emerald-500" />{en ? "Actual Done" : "작업일정 완료"}</span>
              <span className="inline-flex items-center gap-2"><span className="inline-block h-3 w-6 rounded-full bg-red-500" />{en ? "Actual Blocked" : "작업일정 지연"}</span>
            </div>
          </article>
        </div>
      </section>
    </AdminPageShell>
  );
}
