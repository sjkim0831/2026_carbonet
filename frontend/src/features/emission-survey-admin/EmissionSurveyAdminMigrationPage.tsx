import { useEffect, useMemo, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  deleteEmissionSurveyDraftSet,
  deleteEmissionSurveyCaseDraft,
  fetchEmissionSurveyAdminPage,
  getEmissionSurveySampleDownloadUrl,
  getEmissionSurveyTemplateDownloadUrl,
  saveEmissionSurveyDraftSet,
  saveEmissionSurveyCaseDraft,
  uploadEmissionSurveyWorkbook,
  type EmissionSurveyAdminPagePayload,
  type EmissionSurveyAdminSection
} from "../../lib/api/client";
import { isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, MemberActionBar, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect, MemberButton, MemberSectionToolbar } from "../member/common";

type DraftRow = {
  rowId: string;
  values: Record<string, string>;
};

type DraftCase = {
  rows: DraftRow[];
  savedAt: string;
};

type DraftState = Record<string, DraftCase>;
type SavedDatasetEntry = {
  draftKey: string;
  sectionCode: string;
  caseCode: string;
  majorCode: string;
  sectionLabel: string;
  savedAt: string;
  rowCount: number;
  columns: Array<Record<string, string>>;
  rows: DraftRow[];
};
type SavedDraftSetEntry = {
  setId: string;
  setName: string;
  savedAt: string;
  sourceFileName: string;
  sectionCount: number;
  sections: Array<Record<string, unknown>>;
};

const STORAGE_KEY = "carbonet.emission-survey-admin.draft.v2";

function stringOf(row: Record<string, unknown> | null | undefined, key: string) {
  if (!row) {
    return "";
  }
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

function readDraftState(): DraftState {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as DraftState;
    const next: DraftState = {};
    Object.entries(parsed).forEach(([draftKey, draftCase]) => {
      next[draftKey] = {
        ...draftCase,
        rows: (draftCase.rows || []).map((row, index) => ({
          rowId: row.rowId || `${draftKey}-${index + 1}`,
          values: normalizeRowValuesForSection(extractSectionCode(draftKey), row.values || {})
        }))
      };
    });
    return next;
  } catch {
    return {};
  }
}

function saveDraftState(next: DraftState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function normalizeServerDraftState(page: EmissionSurveyAdminPagePayload | null | undefined): DraftState {
  const raw = (page?.savedCaseMap || {}) as Record<string, Record<string, unknown>>;
  const next: DraftState = {};
  Object.entries(raw).forEach(([key, value]) => {
    const rows = Array.isArray(value.rows)
      ? (value.rows as Array<Record<string, unknown>>).map((row, index) => ({
          rowId: stringOf(row, "rowId") || `${key}-${index + 1}`,
          values: normalizeRowValuesForSection(extractSectionCode(key), { ...((row.values || {}) as Record<string, string>) })
        }))
      : [];
    next[key] = {
      rows,
      savedAt: stringOf(value, "savedAt")
    };
  });
  return next;
}

function buildDraftKey(sectionCode: string, caseCode: string) {
  return `${sectionCode}:${caseCode}`;
}

function extractSectionCode(draftKey: string) {
  return String(draftKey || "").split(":")[0] || "";
}

function normalizeRowValuesForSection(sectionCode: string, values: Record<string, string>) {
  const next = { ...values };
  if (sectionCode === "INPUT_RAW_MATERIALS" && next.transportMethod) {
    return {
      ...next,
      marineTransport: next.transportMethod || next.marineTransport || "",
      marineTonKm: next.marineTransport || next.marineTonKm || "",
      roadTransport: next.marineTonKm || next.roadTransport || "",
      roadTonKm: next.roadTransport || next.roadTonKm || "",
      transportRoute: next.roadTonKm || next.transportRoute || "",
      remark: next.transportRoute || next.remark || ""
    };
  }
  if (sectionCode === "OUTPUT_WASTE" && next.transportMethod) {
    return {
      ...next,
      treatmentMethod: next.treatmentMethod || next.transportTonKm || "",
      transportTonKm: next.transportMethod || next.transportTonKm || ""
    };
  }
  return next;
}

function buildRowsFromSection(section: EmissionSurveyAdminSection | undefined): DraftRow[] {
  return ((section?.rows || []) as Array<Record<string, unknown>>).map((row, index) => ({
    rowId: stringOf(row, "rowId") || `${section?.sectionCode || "section"}-${index + 1}`,
    values: normalizeRowValuesForSection(section?.sectionCode || "", { ...(((row.values || {}) as Record<string, string>)) })
  }));
}

function buildEditableColumns(columns: Array<Record<string, string>>, _sectionCode?: string) {
  return columns;
}

function createEmptyRow(section: EmissionSurveyAdminSection | undefined, index: number): DraftRow {
  const values: Record<string, string> = {};
  buildEditableColumns(((section?.columns || []) as Array<Record<string, string>>), section?.sectionCode).forEach((column) => {
    const key = stringOf(column, "key");
    if (key) {
      values[key] = "";
    }
  });
  return {
    rowId: `${section?.sectionCode || "section"}-new-${Date.now()}-${index}`,
    values
  };
}

function resolveSection(page: EmissionSurveyAdminPagePayload | undefined, sectionCode: string) {
  return ((page?.sections || []) as EmissionSurveyAdminSection[]).find((section) => section.sectionCode === sectionCode);
}

function resolveInitialSectionCode(page: EmissionSurveyAdminPagePayload | undefined, majorCode: string) {
  const matched = ((page?.sections || []) as EmissionSurveyAdminSection[]).find((section) => section.majorCode === majorCode);
  return matched?.sectionCode || "";
}

function reseedDraftsForPayload(current: DraftState, page: EmissionSurveyAdminPagePayload): DraftState {
  const next = { ...current };
  ((page.sections || []) as EmissionSurveyAdminSection[]).forEach((section) => {
    const sectionKey = section.sectionCode || "unknown";
    next[buildDraftKey(sectionKey, "CASE_3_1")] = {
      rows: buildRowsFromSection(section),
      savedAt: ""
    };
    next[buildDraftKey(sectionKey, "CASE_3_2")] = {
      rows: [],
      savedAt: ""
    };
  });
  return next;
}

function parseHeaderPath(column: Record<string, string>) {
  const raw = stringOf(column as Record<string, unknown>, "headerPath");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map((entry) => String(entry || "").trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function buildDisplayColumnLabels(columns: Array<Record<string, string>>, sectionCode?: string) {
  const filteredColumns = buildEditableColumns(columns, sectionCode);
  return filteredColumns.map((column) => {
    const rawLabel = stringOf(column, "label");
    const headerPath = parseHeaderPath(column);
    const leafLabel = headerPath[headerPath.length - 1] || rawLabel;
    const parts = leafLabel
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      key: stringOf(column, "key"),
      fullLabel: rawLabel,
      displayLines: parts.length > 0 ? parts : [leafLabel || rawLabel || "-"],
      headerPath: headerPath.length > 0 ? headerPath : [rawLabel || "-"]
    };
  });
}

type HeaderGroup = {
  key: string;
  lines: string[];
  columnStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
};

type HeaderColumn = {
  key: string;
  fullLabel: string;
  displayLines: string[];
  headerPath: string[];
};

function buildHeaderModel(columns: HeaderColumn[]) {
  const depth = Math.max(...columns.map((column) => column.headerPath.length), 1);
  const cells: HeaderGroup[] = [];
  for (let level = 0; level < depth; level += 1) {
    let index = 0;
    while (index < columns.length) {
      const column = columns[index];
      if (level >= column.headerPath.length) {
        index += 1;
        continue;
      }
      const label = column.headerPath[level];
      const prefix = column.headerPath.slice(0, level).join("\u0000");
      let span = 1;
      while (index + span < columns.length) {
        const candidate = columns[index + span];
        if (level >= candidate.headerPath.length) {
          break;
        }
        if (candidate.headerPath[level] !== label) {
          break;
        }
        if (candidate.headerPath.slice(0, level).join("\u0000") !== prefix) {
          break;
        }
        span += 1;
      }
      const columnStart = index + 2;
      cells.push({
        key: `${level}-${index}-${label}`,
        lines: label
          .split("\n")
          .map((entry) => entry.trim())
          .filter(Boolean),
        columnStart,
        rowStart: level + 1,
        colSpan: span,
        rowSpan: level === column.headerPath.length - 1 ? depth - level : 1
      });
      index += span;
    }
  }
  return {
    columns,
    cells,
    depth,
    hasMergedHeader: depth > 1
  };
}

function buildGridTemplate(columns: Array<{ key: string; fullLabel: string }>, sectionCode?: string) {
  if (sectionCode === "INPUT_RAW_MATERIALS") {
    const widths = columns.map((column) => {
      const key = column.key;
      const label = column.fullLabel;
      if (key === "group" || label.includes("구분")) {
        return "92px";
      }
      if (key === "materialName" || label.includes("물질명")) {
        return "minmax(220px, 2.2fr)";
      }
      if (key === "amount" || label.endsWith("양")) {
        return "minmax(110px, 0.9fr)";
      }
      if (key === "annualUnit" || label.includes("연간")) {
        return "minmax(110px, 0.9fr)";
      }
      if (key === "emissionFactor" || label.includes("배출계수")) {
        return "minmax(120px, 1fr)";
      }
      if (key === "emissionUnit" || label === "단위") {
        return "minmax(110px, 0.9fr)";
      }
      if (label.includes("비고")) {
        return "minmax(140px, 1.1fr)";
      }
      return "minmax(110px, 1fr)";
    });
    return `64px ${widths.join(" ")} 78px`;
  }
  return `64px repeat(${Math.max(columns.length, 1)}, minmax(110px, 1fr)) 78px`;
}

function hasMeaningfulRowValue(row: DraftRow) {
  return Object.values(row.values || {}).some((value) => String(value || "").trim() !== "");
}

function shouldReseedCase31Draft(currentRows: DraftRow[] | undefined, sectionRows: DraftRow[]) {
  if (!currentRows || currentRows.length === 0) {
    return true;
  }
  if (currentRows.length !== sectionRows.length) {
    return true;
  }
  const currentHasData = currentRows.some(hasMeaningfulRowValue);
  const sectionHasData = sectionRows.some(hasMeaningfulRowValue);
  if (!currentHasData && sectionHasData) {
    return true;
  }
  return false;
}

function buildSavedDatasetEntries(page: EmissionSurveyAdminPagePayload | null | undefined): SavedDatasetEntry[] {
  const raw = (page?.savedCaseMap || {}) as Record<string, Record<string, unknown>>;
  return Object.entries(raw).map(([draftKey, item]) => ({
    draftKey,
    sectionCode: stringOf(item, "sectionCode"),
    caseCode: stringOf(item, "caseCode"),
    majorCode: stringOf(item, "majorCode"),
    sectionLabel: stringOf(item, "sectionLabel"),
    savedAt: stringOf(item, "savedAt"),
    rowCount: Array.isArray(item.rows) ? (item.rows as Array<unknown>).length : 0,
    columns: Array.isArray(item.columns) ? (item.columns as Array<Record<string, string>>) : [],
    rows: Array.isArray(item.rows)
      ? (item.rows as Array<Record<string, unknown>>).map((row, index) => ({
          rowId: stringOf(row, "rowId") || `${draftKey}-${index + 1}`,
          values: normalizeRowValuesForSection(stringOf(item, "sectionCode"), { ...((row.values || {}) as Record<string, string>) })
        }))
      : []
  })).sort((left, right) => `${left.majorCode}-${left.sectionCode}-${left.caseCode}`.localeCompare(`${right.majorCode}-${right.sectionCode}-${right.caseCode}`));
}

function buildSavedDraftSetEntries(page: EmissionSurveyAdminPagePayload | null | undefined): SavedDraftSetEntry[] {
  const raw = (page?.savedSetMap || {}) as Record<string, Record<string, unknown>>;
  return Object.values(raw).map((item) => ({
    setId: stringOf(item, "setId"),
    setName: stringOf(item, "setName"),
    savedAt: stringOf(item, "savedAt"),
    sourceFileName: stringOf(item, "sourceFileName"),
    sectionCount: Number(item.sectionCount || 0),
    sections: Array.isArray(item.sections) ? (item.sections as Array<Record<string, unknown>>) : []
  })).sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

function downloadDraftCsv(entry: SavedDatasetEntry) {
  const columns = entry.columns.length > 0
    ? entry.columns
    : Object.keys(entry.rows[0]?.values || {}).map((key) => ({ key, label: key }));
  const escapeCell = (value: string) => `"${String(value || "").replace(/"/g, "\"\"")}"`;
  const lines = [
    columns.map((column) => escapeCell(stringOf(column, "label"))).join(","),
    ...entry.rows.map((row) => columns.map((column) => escapeCell(row.values[stringOf(column, "key")] || "")).join(","))
  ];
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${entry.sectionCode}-${entry.caseCode}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function CaseEditor({
  title,
  description,
  section,
  caseLabel,
  sectionToneClassName,
  rows,
  onAddRow,
  onRemoveRow,
  onChangeCell,
  onSave,
  savedAt,
  seedCase
}: {
  title: string;
  description: string;
  section: EmissionSurveyAdminSection | undefined;
  caseLabel: string;
  sectionToneClassName: string;
  rows: DraftRow[];
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeCell: (rowId: string, key: string, value: string) => void;
  onSave: () => void;
  savedAt: string;
  seedCase: boolean;
}) {
  const columns = buildEditableColumns(((section?.columns || []) as Array<Record<string, string>>), section?.sectionCode);
  const displayColumns = buildDisplayColumnLabels(columns, section?.sectionCode);
  const gridTemplateColumns = buildGridTemplate(displayColumns, section?.sectionCode);
  const headerModel = buildHeaderModel(displayColumns);
  const resolvedDisplayColumns = headerModel.columns;

  return (
    <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white shadow-sm">
      <div className={`border-b border-[var(--kr-gov-border-light)] px-5 py-4 ${sectionToneClassName}`.trim()}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kr-gov-blue)]">{caseLabel}</p>
        <h3 className="mt-2 text-lg font-bold text-[var(--kr-gov-text-primary)]">{section?.sectionLabel || "-"}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{description}</p>
      </div>
      <div className="border-b border-[var(--kr-gov-border-light)] bg-slate-50 px-5 py-4">
        <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">상단 섹션</p>
        <div className="mt-3 space-y-2 text-sm text-[var(--kr-gov-text-secondary)]">
          <p>대분류: {section?.majorLabel || "-"}</p>
          <p>중분류: {section?.sectionLabel || "-"}</p>
          <p>소분류: {title}</p>
          <p>엑셀 섹션 제목: {section?.titleRowLabel || "-"}</p>
          <p>데이터 원본: {seedCase ? "엑셀 예시 seed (기본 4건)" : "빈 draft"}</p>
          <p>저장 시각: {savedAt || "저장 전"}</p>
          {((section?.metadata || []) as Array<Record<string, string>>).map((item) => (
            <p key={`${section?.sectionCode || "section"}-${stringOf(item, "key")}`}>{stringOf(item, "label")}: {stringOf(item, "value") || "-"}</p>
          ))}
        </div>
      </div>
      <div className="px-5 py-5">
        <MemberSectionToolbar
          title={<span>하단 데이터 섹션</span>}
          meta={<span>{seedCase ? "엑셀 예시와 동일한 기본 4건을 먼저 보여주고, 나머지는 직접 행을 추가해서 입력합니다. 양식 다운로드 후 입력한 엑셀을 업로드해 8개 섹션 예시 구조를 기준으로 저장할 수 있습니다." : "동일 컬럼 구조의 빈 행으로 시작하며, 필요한 만큼 행을 직접 추가해 입력합니다."}</span>}
          actions={<MemberButton onClick={onAddRow} size="sm" type="button" variant="secondary">+ 행 추가</MemberButton>}
        />
        <div className="mt-4">
          {rows.length === 0 ? (
            <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              현재 행이 없습니다. `+ 행 추가`로 동일 구조의 입력 행을 만들 수 있습니다.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white">
              {headerModel.hasMergedHeader ? (
                <div
                  className="grid border-b border-slate-200 bg-slate-100"
                  style={{ gridTemplateColumns }}
                >
                  <div
                    className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]"
                    style={{ gridRow: `span ${headerModel.depth}` }}
                  >
                    행
                  </div>
                  {headerModel.cells.map((cell) => (
                    <div
                      className="border-r border-b border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)] last:border-r-0"
                      key={cell.key}
                      style={{
                        gridColumn: `${cell.columnStart} / span ${cell.colSpan}`,
                        gridRow: `${cell.rowStart} / span ${cell.rowSpan}`
                      }}
                    >
                      {cell.lines.map((line, index) => (
                        <span className="block leading-4" key={`${cell.key}-${index}`}>{line}</span>
                      ))}
                    </div>
                  ))}
                  <div
                    className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]"
                    style={{ gridRow: `span ${headerModel.depth}` }}
                  >
                    관리
                  </div>
                </div>
              ) : (
                <div
                  className="grid border-b border-slate-200 bg-slate-100"
                  style={{ gridTemplateColumns }}
                >
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">행</div>
                  {resolvedDisplayColumns.map((column) => (
                    <div
                      className="border-r border-slate-200 px-2 py-2 text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)] last:border-r-0"
                      key={`header-${column.key}`}
                      title={column.fullLabel}
                    >
                      {column.displayLines.map((line, index) => (
                        <span className="block leading-4" key={`${column.key}-${index}`}>{line}</span>
                      ))}
                    </div>
                  ))}
                  <div className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">관리</div>
                </div>
              )}
              {rows.map((row, index) => (
                <div
                  className="grid border-b border-slate-200 last:border-b-0"
                  key={row.rowId}
                  style={{ gridTemplateColumns }}
                >
                  <div className="flex items-center justify-center border-r border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">
                    {index + 1}
                  </div>
                  {resolvedDisplayColumns.map((column) => {
                    const key = column.key;
                    return (
                      <label className="block border-r border-slate-200 px-2 py-2 last:border-r-0" key={`${row.rowId}-${key}`} title={column.fullLabel}>
                        <span className="sr-only">{column.fullLabel}</span>
                        <AdminInput
                          onChange={(event) => onChangeCell(row.rowId, key, event.target.value)}
                          value={row.values[key] || ""}
                        />
                      </label>
                    );
                  })}
                  <div className="flex items-center justify-center px-2 py-2">
                    <MemberButton onClick={() => onRemoveRow(row.rowId)} size="sm" type="button" variant="secondary">삭제</MemberButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <MemberButton onClick={onSave} type="button" variant="primary">케이스 저장</MemberButton>
        </div>
      </div>
    </article>
  );
}

export function EmissionSurveyAdminMigrationPage() {
  const en = isEnglish();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [majorCode, setMajorCode] = useState("INPUT");
  const [sectionCode, setSectionCode] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [setName, setSetName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pageOverride, setPageOverride] = useState<EmissionSurveyAdminPagePayload | null>(null);
  const [drafts, setDrafts] = useState<DraftState>(readDraftState);

  const pageState = useAsyncValue<EmissionSurveyAdminPagePayload>(
    () => fetchEmissionSurveyAdminPage(),
    []
  );
  const page = pageOverride || pageState.value;
  const pagePayload = page || undefined;

  useEffect(() => {
    if (!page) {
      return;
    }
    const serverDrafts = normalizeServerDraftState(page);
    if (Object.keys(serverDrafts).length === 0) {
      return;
    }
    setDrafts((current) => {
      const merged = { ...serverDrafts, ...current };
      saveDraftState(merged);
      return merged;
    });
  }, [page]);

  useEffect(() => {
    if (!sectionCode && page) {
      setSectionCode(resolveInitialSectionCode(pagePayload, majorCode));
    }
  }, [majorCode, page, sectionCode]);

  useEffect(() => {
    const current = resolveSection(pagePayload, sectionCode);
    if (!current || current.majorCode !== majorCode) {
      setSectionCode(resolveInitialSectionCode(pagePayload, majorCode));
    }
  }, [majorCode, pagePayload, sectionCode]);

  useEffect(() => {
    logGovernanceScope("PAGE", "emission-survey-admin", {
      route: window.location.pathname,
      language: en ? "en" : "ko",
      majorCode,
      sectionCode,
      uploaded: Boolean(page?.uploaded)
    });
  }, [en, majorCode, page?.uploaded, sectionCode]);

  const currentSection = resolveSection(pagePayload, sectionCode);
  const sectionRows = useMemo(() => buildRowsFromSection(currentSection), [currentSection]);
  const savedDatasetEntries = useMemo(() => buildSavedDatasetEntries(page), [page]);
  const savedDraftSetEntries = useMemo(() => buildSavedDraftSetEntries(page), [page]);
  const case31Key = buildDraftKey(sectionCode || "unknown", "CASE_3_1");
  const case32Key = buildDraftKey(sectionCode || "unknown", "CASE_3_2");
  const case31 = drafts[case31Key] || { rows: sectionRows, savedAt: "" };
  const case32 = drafts[case32Key] || { rows: [], savedAt: "" };

  useEffect(() => {
    if (!sectionCode) {
      return;
    }
    setDrafts((current) => {
      let mutated = false;
      const next = { ...current };
      if (shouldReseedCase31Draft(next[case31Key]?.rows, sectionRows)) {
        next[case31Key] = { rows: sectionRows, savedAt: "" };
        mutated = true;
      }
      if (!next[case32Key]) {
        next[case32Key] = { rows: [], savedAt: "" };
        mutated = true;
      }
      if (mutated) {
        saveDraftState(next);
        return next;
      }
      return current;
    });
  }, [case31Key, case32Key, sectionCode, sectionRows]);

  useEffect(() => {
    if (setName) {
      return;
    }
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    setSetName(`배출 설문 세트 ${timestamp}`);
  }, [setName]);

  function updateCaseRows(caseKey: string, rows: DraftRow[], savedAt?: string) {
    setDrafts((current) => {
      const next = {
        ...current,
        [caseKey]: {
          rows,
          savedAt: savedAt ?? current[caseKey]?.savedAt ?? ""
        }
      };
      saveDraftState(next);
      return next;
    });
  }

  function handleAddRow(caseKey: string) {
    const targetRows = (drafts[caseKey]?.rows || []).slice();
    targetRows.push(createEmptyRow(currentSection, targetRows.length + 1));
    updateCaseRows(caseKey, targetRows);
  }

  function handleRemoveRow(caseKey: string, rowId: string) {
    updateCaseRows(caseKey, (drafts[caseKey]?.rows || []).filter((row) => row.rowId !== rowId));
  }

  function handleCellChange(caseKey: string, rowId: string, key: string, value: string) {
    updateCaseRows(
      caseKey,
      (drafts[caseKey]?.rows || []).map((row) => row.rowId === rowId ? { ...row, values: { ...row.values, [key]: value } } : row)
    );
  }

  function handleLoadSavedDataset(entry: SavedDatasetEntry) {
    setMajorCode(entry.majorCode || "INPUT");
    setSectionCode(entry.sectionCode || "");
    updateCaseRows(buildDraftKey(entry.sectionCode, entry.caseCode), entry.rows, entry.savedAt);
    setMessage(en ? "Saved dataset loaded." : "저장된 데이터셋을 불러왔습니다.");
    setErrorMessage("");
  }

  async function handleDeleteSavedDataset(entry: SavedDatasetEntry) {
    try {
      const response = await deleteEmissionSurveyCaseDraft(entry.sectionCode, entry.caseCode);
      setDrafts((current) => {
        const next = { ...current };
        delete next[entry.draftKey];
        saveDraftState(next);
        return next;
      });
      if (page) {
        setPageOverride({
          ...page,
          savedCaseMap: (response.savedCaseMap || {}) as Record<string, Record<string, unknown>>
        });
      }
      setMessage(String(response.message || (en ? "Saved dataset deleted." : "저장된 데이터셋을 삭제했습니다.")));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : (en ? "Failed to delete saved dataset." : "저장된 데이터셋 삭제에 실패했습니다."));
    }
  }

  async function handleSaveCase(caseKey: string, caseCode: string) {
    const savedAt = new Date().toLocaleString("ko-KR");
    const rows = drafts[caseKey]?.rows || [];
    updateCaseRows(caseKey, rows, savedAt);
    try {
      const response = await saveEmissionSurveyCaseDraft({
        sectionCode: sectionCode || "",
        caseCode,
        majorCode,
        sectionLabel: currentSection?.sectionLabel || "",
        sourceFileName: stringOf(page as Record<string, unknown>, "sourceFileName"),
        sourcePath: stringOf(page as Record<string, unknown>, "sourcePath"),
        targetPath: stringOf(page as Record<string, unknown>, "targetPath"),
        titleRowLabel: currentSection?.titleRowLabel || "",
        guidance: ((currentSection?.guidance || []) as string[]),
        columns: buildEditableColumns(((currentSection?.columns || []) as Array<{ key: string; label: string }>), currentSection?.sectionCode) as Array<{ key: string; label: string }>,
        rows
      });
      const persistedAt = String(response.savedAt || savedAt);
      updateCaseRows(caseKey, rows, persistedAt);
      if (page) {
        setPageOverride({
          ...page,
          savedCaseMap: (response.savedCaseMap || {}) as Record<string, Record<string, unknown>>
        });
      }
      setMessage(String(response.message || (en ? "Case draft saved." : "케이스 초안을 저장했습니다.")));
      setErrorMessage("");
    } catch (error) {
      setMessage(en
        ? "Server save failed, so the draft remains in browser fallback storage only."
        : "서버 저장에 실패해 브라우저 fallback draft에만 보관했습니다.");
      setErrorMessage(error instanceof Error ? error.message : (en ? "Failed to save the server draft." : "서버 초안 저장에 실패했습니다."));
    }
  }

  async function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadFile = event.target.files?.[0];
    if (!uploadFile) {
      return;
    }
    setUploading(true);
    setMessage("");
    setErrorMessage("");
    try {
      const payload = await uploadEmissionSurveyWorkbook(uploadFile);
      setPageOverride(payload);
      setDrafts((current) => {
        const next = reseedDraftsForPayload(current, payload);
        saveDraftState(next);
        return next;
      });
      setMajorCode("INPUT");
      setSectionCode(resolveInitialSectionCode(payload, "INPUT"));
      setMessage(en ? "Workbook parsed successfully." : "엑셀 파일을 파싱했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : (en ? "Failed to parse workbook." : "엑셀 파싱에 실패했습니다."));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploading(false);
    }
  }

  function buildDraftSetSections() {
    return (((page?.sections || []) as EmissionSurveyAdminSection[])).map((section) => {
      const sectionDraftKey31 = buildDraftKey(section.sectionCode || "unknown", "CASE_3_1");
      const sectionDraftKey32 = buildDraftKey(section.sectionCode || "unknown", "CASE_3_2");
      return {
        sectionCode: section.sectionCode || "",
        majorCode: section.majorCode || "",
        majorLabel: section.majorLabel || "",
        sectionLabel: section.sectionLabel || "",
        sheetName: section.sheetName || "",
        titleRowLabel: section.titleRowLabel || "",
        guidance: (section.guidance || []) as string[],
        metadata: (section.metadata || []) as Array<Record<string, string>>,
        columns: buildEditableColumns(((section.columns || []) as Array<Record<string, string>>), section.sectionCode),
        case31Rows: (drafts[sectionDraftKey31]?.rows || buildRowsFromSection(section)).map((row) => ({ rowId: row.rowId, values: row.values })),
        case32Rows: (drafts[sectionDraftKey32]?.rows || []).map((row) => ({ rowId: row.rowId, values: row.values }))
      };
    });
  }

  async function handleSaveDraftSet() {
    try {
      const response = await saveEmissionSurveyDraftSet({
        setName: setName.trim(),
        sourceFileName: stringOf(page as Record<string, unknown>, "sourceFileName"),
        sourcePath: stringOf(page as Record<string, unknown>, "sourcePath"),
        targetPath: stringOf(page as Record<string, unknown>, "targetPath"),
        sections: buildDraftSetSections()
      });
      if (page) {
        setPageOverride({
          ...page,
          savedSetMap: (response.savedSetMap || {}) as Record<string, Record<string, unknown>>
        });
      }
      setMessage(String(response.message || "초안 세트를 저장했습니다."));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "초안 세트 저장에 실패했습니다.");
    }
  }

  function handleLoadDraftSet(entry: SavedDraftSetEntry) {
    const nextDrafts = { ...drafts };
    entry.sections.forEach((section) => {
      const sectionCodeValue = stringOf(section, "sectionCode");
      const case31Rows = Array.isArray(section.case31Rows)
        ? (section.case31Rows as Array<Record<string, unknown>>).map((row, index) => ({
            rowId: stringOf(row, "rowId") || `${sectionCodeValue}-CASE_3_1-${index + 1}`,
            values: normalizeRowValuesForSection(sectionCodeValue, { ...((row.values || {}) as Record<string, string>) })
          }))
        : [];
      const case32Rows = Array.isArray(section.case32Rows)
        ? (section.case32Rows as Array<Record<string, unknown>>).map((row, index) => ({
            rowId: stringOf(row, "rowId") || `${sectionCodeValue}-CASE_3_2-${index + 1}`,
            values: normalizeRowValuesForSection(sectionCodeValue, { ...((row.values || {}) as Record<string, string>) })
          }))
        : [];
      nextDrafts[buildDraftKey(sectionCodeValue, "CASE_3_1")] = { rows: case31Rows, savedAt: entry.savedAt };
      nextDrafts[buildDraftKey(sectionCodeValue, "CASE_3_2")] = { rows: case32Rows, savedAt: entry.savedAt };
    });
    saveDraftState(nextDrafts);
    setDrafts(nextDrafts);
    setMajorCode("INPUT");
    setSectionCode(resolveInitialSectionCode(pagePayload, "INPUT"));
    setSetName(entry.setName);
    setMessage(en ? "Draft set loaded." : "초안 세트를 불러왔습니다.");
    setErrorMessage("");
  }

  async function handleDeleteDraftSet(entry: SavedDraftSetEntry) {
    try {
      const response = await deleteEmissionSurveyDraftSet(entry.setId);
      if (page) {
        setPageOverride({
          ...page,
          savedSetMap: (response.savedSetMap || {}) as Record<string, Record<string, unknown>>
        });
      }
      setMessage(String(response.message || "초안 세트를 삭제했습니다."));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "초안 세트 삭제에 실패했습니다.");
    }
  }

  const summaryCards = ((page?.summaryCards || []) as Array<Record<string, string>>);
  const majorOptions = ((page?.majorOptions || []) as Array<Record<string, string>>).map((option) => ({
    value: stringOf(option, "value"),
    label: stringOf(option, "label")
  }));
  const caseOptions = ((page?.caseOptions || []) as Array<Record<string, string>>).map((option) => ({
    value: stringOf(option, "value"),
    label: stringOf(option, "label")
  }));
  const sectionOptions = ((page?.sections || []) as EmissionSurveyAdminSection[])
    .filter((section) => section.majorCode === majorCode)
    .map((section) => ({ value: section.sectionCode || "", label: section.sectionLabel || "" }));

  return (
    <AdminPageShell
      subtitle={stringOf(page as Record<string, unknown>, "pageDescription") || "엑셀 탭 3, 4 기반 설문 케이스 관리 화면"}
      title={stringOf(page as Record<string, unknown>, "pageTitle") || "배출 설문 관리"}
    >
      <AdminWorkspacePageFrame>
        {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}
        {errorMessage || pageState.error ? <PageStatusNotice tone="error">{errorMessage || pageState.error}</PageStatusNotice> : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
            <SummaryMetricCard
              accentClassName="text-[var(--kr-gov-blue)]"
              description={stringOf(card, "description")}
              key={`summary-${index}`}
              title={stringOf(card, "title")}
              value={stringOf(card, "value")}
            />
        ))}
      </div>
        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kr-gov-blue)]">Survey Workspace</p>
            <h2 className="mt-2 text-xl font-bold text-[var(--kr-gov-text-primary)]">{stringOf(page as Record<string, unknown>, "pageTitle") || "배출 설문 관리"}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(page as Record<string, unknown>, "pageDescription") || "엑셀 탭 3, 4 기반 설문 케이스 관리 화면"}</p>
          </div>
        </section>

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <MemberSectionToolbar
            title={<span>엑셀 업로드 및 분류 선택</span>}
            meta={<span>빈 양식은 실제 업로드용으로 내려받고, 샘플 양식은 기존 예시 구조 확인용으로 별도 내려받을 수 있습니다. 업로드 후에는 입력된 값을 기준으로 8개 섹션 draft를 구성합니다.</span>}
            actions={(
              <div className="flex flex-wrap items-center justify-end gap-2">
                <a className="inline-flex min-h-[40px] items-center justify-center rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--kr-gov-text-primary)]" href={getEmissionSurveyTemplateDownloadUrl()}>
                  빈 양식 다운로드
                </a>
                <a className="inline-flex min-h-[40px] items-center justify-center rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--kr-gov-text-primary)]" href={getEmissionSurveySampleDownloadUrl()}>
                  샘플 다운로드
                </a>
                <MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">{uploading ? "업로드 중..." : "엑셀 업로드"}</MemberButton>
              </div>
            )}
          />
          <input accept=".xlsx" className="hidden" onChange={handleUploadChange} ref={fileInputRef} type="file" />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">대분류</span>
              <AdminSelect onChange={(event) => setMajorCode(event.target.value)} value={majorCode}>
                {majorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">중분류</span>
              <AdminSelect onChange={(event) => setSectionCode(event.target.value)} value={sectionCode}>
                {sectionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">원본 파일</span>
              <AdminInput readOnly value={stringOf(page as Record<string, unknown>, "sourceFileName")} />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">소분류 Case 1</span>
              <AdminSelect disabled value={caseOptions[0]?.value || "CASE_3_1"}>
                {caseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">소분류 Case 2</span>
              <AdminSelect disabled value={caseOptions[1]?.value || "CASE_3_2"}>
                {caseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
          </div>
          <CollectionResultPanel
            className="mt-4"
            title="섹션 가이드"
          >
            {((currentSection?.metadata || []) as Array<Record<string, string>>).length > 0 ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                {((currentSection?.metadata || []) as Array<Record<string, string>>).map((item) => (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]" key={`${currentSection?.sectionCode || "section"}-meta-${stringOf(item, "key")}`}>
                    {stringOf(item, "label")}: <span className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(item, "value") || "-"}</span>
                  </p>
                ))}
              </div>
            ) : null}
            <ul className="space-y-2">
              {((currentSection?.guidance || []) as string[]).map((item, index) => (
                <li key={`${currentSection?.sectionCode || "guidance"}-${index}`}>{item}</li>
              ))}
            </ul>
          </CollectionResultPanel>
        </section>

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <MemberSectionToolbar
            title={<span>저장 세트 목록</span>}
            meta={<span>투입물 4개와 산출물 4개, 총 8개 섹션 전체를 하나의 세트로 저장하고 다시 불러올 수 있습니다.</span>}
            actions={(
              <div className="flex flex-wrap items-end gap-2">
                <label className="block min-w-[260px]">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">세트명</span>
                  <AdminInput onChange={(event) => setSetName(event.target.value)} value={setName} />
                </label>
                <MemberButton onClick={() => void handleSaveDraftSet()} type="button" variant="primary">8개 섹션 세트 저장</MemberButton>
              </div>
            )}
          />
          <div className="mt-4 space-y-3">
            {savedDraftSetEntries.length === 0 ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                저장된 세트가 없습니다.
              </div>
            ) : savedDraftSetEntries.map((entry) => (
              <div className="flex flex-col gap-3 rounded-[var(--kr-gov-radius)] border border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between" key={entry.setId}>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{entry.setName}</p>
                  <p className="text-xs text-[var(--kr-gov-text-secondary)]">섹션 {entry.sectionCount}개 / 원본 {entry.sourceFileName || "-"} / 저장 {entry.savedAt || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <MemberButton onClick={() => handleLoadDraftSet(entry)} size="sm" type="button" variant="secondary">불러오기</MemberButton>
                  <MemberButton onClick={() => void handleDeleteDraftSet(entry)} size="sm" type="button" variant="secondary">삭제</MemberButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <MemberSectionToolbar
            title={<span>개별 케이스 목록</span>}
            meta={<span>개별 섹션 케이스도 별도로 저장, 불러오기, 삭제, CSV 다운로드가 가능합니다.</span>}
          />
          <div className="mt-4 space-y-3">
            {savedDatasetEntries.length === 0 ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                저장된 케이스가 없습니다.
              </div>
            ) : savedDatasetEntries.map((entry) => (
              <div className="flex flex-col gap-3 rounded-[var(--kr-gov-radius)] border border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between" key={entry.draftKey}>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{entry.sectionLabel || entry.sectionCode}</p>
                  <p className="text-xs text-[var(--kr-gov-text-secondary)]">{entry.majorCode} / {entry.caseCode} / 행 {entry.rowCount}개 / 저장 {entry.savedAt || "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <MemberButton onClick={() => handleLoadSavedDataset(entry)} size="sm" type="button" variant="secondary">불러오기</MemberButton>
                  <MemberButton onClick={() => downloadDraftCsv(entry)} size="sm" type="button" variant="secondary">CSV 다운로드</MemberButton>
                  <MemberButton onClick={() => void handleDeleteSavedDataset(entry)} size="sm" type="button" variant="secondary">삭제</MemberButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <CaseEditor
            caseLabel={caseOptions[0]?.label || "3-1 시작"}
            description="업로드한 엑셀 seed를 먼저 출력하고, 이후 행 추가, 수정, 삭제를 허용합니다."
            onAddRow={() => handleAddRow(case31Key)}
            onChangeCell={(rowId, key, value) => handleCellChange(case31Key, rowId, key, value)}
            onRemoveRow={(rowId) => handleRemoveRow(case31Key, rowId)}
            onSave={() => void handleSaveCase(case31Key, "CASE_3_1")}
            rows={case31.rows}
            savedAt={case31.savedAt}
            section={currentSection}
            sectionToneClassName="bg-[linear-gradient(135deg,rgba(219,234,254,0.72),rgba(255,255,255,0.98))]"
            seedCase
            title="3-1 시작"
          />
          <CaseEditor
            caseLabel={caseOptions[1]?.label || "3-2 LCI DB를 알고 있는 경우"}
            description="동일한 데이터 섹션 구조를 유지하되, 내용은 빈 행으로 시작해 별도로 저장합니다."
            onAddRow={() => handleAddRow(case32Key)}
            onChangeCell={(rowId, key, value) => handleCellChange(case32Key, rowId, key, value)}
            onRemoveRow={(rowId) => handleRemoveRow(case32Key, rowId)}
            onSave={() => void handleSaveCase(case32Key, "CASE_3_2")}
            rows={case32.rows}
            savedAt={case32.savedAt}
            section={currentSection}
            sectionToneClassName="bg-[linear-gradient(135deg,rgba(254,243,199,0.76),rgba(255,255,255,0.98))]"
            seedCase={false}
            title="3-2 LCI DB를 알고 있는 경우"
          />
        </div>

        <MemberActionBar
          description={(
            <div className="space-y-1">
              <p>기본 참조 파일 경로: {stringOf(page as Record<string, unknown>, "sourcePath") || "-"}</p>
              <p>사용자 요청 대상 경로: {stringOf(page as Record<string, unknown>, "targetPath") || "-"}</p>
              <p>저장 방식: 서버 초안 저장 우선, 실패 시 브라우저 fallback 유지</p>
            </div>
          )}
          eyebrow="Workbook Flow"
          primary={<MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">새 엑셀 업로드</MemberButton>}
          title="업로드 기준 설문 케이스 편집"
        />
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
