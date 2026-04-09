import { useEffect, useMemo, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionSurveyAdminPage,
  uploadEmissionSurveyWorkbook,
  type EmissionSurveyAdminPagePayload,
  type EmissionSurveyAdminSection
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect, MemberActionBar, MemberButton, MemberSectionToolbar } from "../member/common";

type DraftRow = {
  rowId: string;
  values: Record<string, string>;
};

type DraftCase = {
  rows: DraftRow[];
  savedAt: string;
};

type DraftState = Record<string, DraftCase>;
type SectionCaseState = Record<string, "CASE_3_1" | "CASE_3_2">;
type SectionExpandState = Record<string, boolean>;

type ClassificationRow = {
  code: string;
  label: string;
};

type ClassificationTreeNode = ClassificationRow & {
  middleRows?: ClassificationTreeNode[];
  smallRows?: ClassificationRow[];
};

const UNIT_OPTIONS = [
  { value: "carat", label: "carat | 캐럿" },
  { value: "cg", label: "cg | 센티그램" },
  { value: "ct", label: "ct | 캐럿 (중복)" },
  { value: "cwt", label: "cwt | 헌드레드웨이트" },
  { value: "dag", label: "dag | 데카그램" },
  { value: "dg", label: "dg | 데시그램" },
  { value: "dr (Av)", label: "dr (Av) | 드람 (상형)" },
  { value: "dwt", label: "dwt | 페니웨이트" },
  { value: "g", label: "g | 그램" },
  { value: "gr", label: "gr | 그레인" },
  { value: "hg", label: "hg | 헥토그램" },
  { value: "kg", label: "kg | 킬로그램" },
  { value: "kg SWU", label: "kg SWU | 킬로그램 분리작업단위" },
  { value: "kt", label: "kt | 킬로톤" },
  { value: "lb av", label: "lb av | 파운드 (상형)" },
  { value: "long tn", label: "long tn | 롱톤 (영국 톤)" },
  { value: "mg", label: "mg | 밀리그램" },
  { value: "Mg", label: "Mg | 메가그램 (톤)" },
  { value: "Mt", label: "Mt | 메가톤" },
  { value: "ng", label: "ng | 나노그램" },
  { value: "oz av", label: "oz av | 온스 (상형)" },
  { value: "oz t", label: "oz t | 온스 (트로이)" },
  { value: "pg", label: "pg | 피코그램" },
  { value: "sh tn", label: "sh tn | 쇼트톤 (미국 톤)" },
  { value: "t", label: "t | 톤" },
  { value: "ug", label: "ug | 마이크로그램" }
] as const;

const UNIT_OPTION_VALUES = new Set<string>(UNIT_OPTIONS.map((option) => option.value));

const UNIT_VALUE_ALIASES: Record<string, string> = {
  ton: "t",
  "t/yr": "t",
  "ton/yr": "t",
  "kg/yr": "kg",
  "mg/yr": "mg",
  "ug/yr": "ug",
  "g/yr": "g",
  "pg/yr": "pg",
  "ng/yr": "ng"
};

function stringOf(row: Record<string, unknown> | null | undefined, key: string) {
  if (!row) {
    return "";
  }
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

function buildDraftKey(classificationKey: string, sectionCode: string, caseCode: string) {
  return `${classificationKey}:${sectionCode}:${caseCode}`;
}

function normalizeUnitValue(value: string) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (UNIT_OPTION_VALUES.has(raw)) {
    return raw;
  }
  const codeOnly = raw.includes("|") ? raw.split("|")[0].trim() : raw;
  if (UNIT_OPTION_VALUES.has(codeOnly)) {
    return codeOnly;
  }
  const normalizedAlias = UNIT_VALUE_ALIASES[raw] || UNIT_VALUE_ALIASES[codeOnly];
  if (normalizedAlias && UNIT_OPTION_VALUES.has(normalizedAlias)) {
    return normalizedAlias;
  }
  return raw;
}

function normalizeRowValues(values: Record<string, string>) {
  const nextValues = { ...values };
  if ("annualUnit" in nextValues) {
    nextValues.annualUnit = normalizeUnitValue(nextValues.annualUnit || "");
  }
  if ("costUnit" in nextValues) {
    nextValues.costUnit = normalizeUnitValue(nextValues.costUnit || "");
  }
  return nextValues;
}

function buildRowsFromSection(section: EmissionSurveyAdminSection | undefined): DraftRow[] {
  return ((section?.rows || []) as Array<Record<string, unknown>>).map((row, index) => ({
    rowId: stringOf(row, "rowId") || `${section?.sectionCode || "section"}-${index + 1}`,
    values: normalizeRowValues({ ...(((row.values || {}) as Record<string, string>)) })
  }));
}

function buildRowsFromStoredDraft(sectionCode: string, stored: Record<string, unknown> | null | undefined) {
  const rows = Array.isArray(stored?.rows)
    ? (stored?.rows as Array<Record<string, unknown>>).map((row, index) => ({
        rowId: stringOf(row, "rowId") || `${sectionCode}-${index + 1}`,
        values: normalizeRowValues({ ...(((row.values || {}) as Record<string, string>)) })
      }))
    : [];
  return {
    rows,
    savedAt: stringOf(stored, "savedAt")
  };
}

function resolveSharedSectionRows(
  page: EmissionSurveyAdminPagePayload | null | undefined,
  section: EmissionSurveyAdminSection
) {
  const sectionCode = section.sectionCode || "";
  const selectedDatasetSectionRows = ((page as Record<string, unknown> | null | undefined)?.selectedDatasetSectionRows || []) as Array<Record<string, unknown>>;
  const matchedDatasetSection = selectedDatasetSectionRows.find((row) => stringOf(row, "sectionCode") === sectionCode);
  if (matchedDatasetSection) {
    return buildRowsFromStoredDraft(sectionCode, matchedDatasetSection);
  }

  const savedCaseMap = ((page as Record<string, unknown> | null | undefined)?.savedCaseMap || {}) as Record<string, Record<string, unknown>>;
  const matchedSavedDrafts = Object.values(savedCaseMap)
    .filter((row) => stringOf(row, "sectionCode") === sectionCode && stringOf(row, "caseCode") === "CASE_3_1")
    .sort((left, right) => stringOf(right, "savedAt").localeCompare(stringOf(left, "savedAt")));
  if (matchedSavedDrafts.length > 0) {
    return buildRowsFromStoredDraft(sectionCode, matchedSavedDrafts[0]);
  }

  return {
    rows: buildRowsFromSection(section),
    savedAt: ""
  };
}

function buildEditableColumns(columns: Array<Record<string, string>>) {
  return columns;
}

function createEmptyRow(section: EmissionSurveyAdminSection | undefined, index: number): DraftRow {
  const values: Record<string, string> = {};
  buildEditableColumns(((section?.columns || []) as Array<Record<string, string>>)).forEach((column) => {
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

function buildDefaultCaseRows(section: EmissionSurveyAdminSection, caseCode: "CASE_3_1" | "CASE_3_2") {
  if (caseCode === "CASE_3_1") {
    return buildRowsFromSection(section);
  }
  return [];
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

function buildDisplayColumnLabels(columns: Array<Record<string, string>>) {
  return columns.map((column) => {
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
        lines: label.split("\n").map((entry) => entry.trim()).filter(Boolean),
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

function stripSectionNumber(label: string) {
  return String(label || "").replace(/^\s*\d+\s*[.)-]?\s*/, "").trim();
}

function isUnitColumnKey(key: string) {
  return key === "annualUnit" || key === "costUnit";
}

function sectionGroupTitle(majorCode: string, en: boolean) {
  if (majorCode === "OUTPUT") {
    return {
      english: "OUTPUT",
      korean: "산출물",
      title: en ? "Output Data Collection" : "산출물 데이터 수집"
    };
  }
  return {
    english: "INPUT",
    korean: "투입물",
    title: en ? "Input Data Collection" : "투입물 데이터 수집"
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
      if (label.includes("비고")) {
        return "minmax(140px, 1.1fr)";
      }
      return "minmax(110px, 1fr)";
    });
    return `64px ${widths.join(" ")} 88px`;
  }
  return `64px repeat(${Math.max(columns.length, 1)}, minmax(110px, 1fr)) 88px`;
}

function buildClassificationTree(page: EmissionSurveyAdminPagePayload | undefined) {
  return (((page?.classificationCatalog || {}) as Record<string, unknown>).tree || []) as ClassificationTreeNode[];
}

function findCurrentMajor(tree: ClassificationTreeNode[], majorCode: string) {
  return tree.find((item) => String(item.code || "") === majorCode) || null;
}

function findCurrentMiddle(tree: ClassificationTreeNode[], majorCode: string, middleCode: string) {
  const major = findCurrentMajor(tree, majorCode);
  return (major?.middleRows || []).find((item) => String(item.code || "") === middleCode) || null;
}

function useClassificationSelection(page: EmissionSurveyAdminPagePayload | undefined) {
  const tree = useMemo(() => buildClassificationTree(page), [page]);
  const [majorCode, setMajorCode] = useState("");
  const [middleCode, setMiddleCode] = useState("");
  const [smallCode, setSmallCode] = useState("");

  useEffect(() => {
    if (tree.length === 0) {
      return;
    }
    if (!majorCode) {
      setMajorCode("");
      setMiddleCode("");
      setSmallCode("");
    }
  }, [tree, majorCode]);

  useEffect(() => {
    if (!majorCode) {
      if (middleCode || smallCode) {
        setMiddleCode("");
        setSmallCode("");
      }
      return;
    }
    const currentMajor = findCurrentMajor(tree, majorCode);
    const middleRows = currentMajor?.middleRows || [];
    if (!middleRows.some((row) => row.code === middleCode)) {
      setMiddleCode("");
      setSmallCode("");
    }
  }, [tree, majorCode, middleCode]);

  useEffect(() => {
    if (!majorCode || !middleCode) {
      if (smallCode) {
        setSmallCode("");
      }
      return;
    }
    const currentMiddle = findCurrentMiddle(tree, majorCode, middleCode);
    const smallRows = currentMiddle?.smallRows || [];
    if (!smallRows.some((row) => row.code === smallCode) && smallCode) {
      setSmallCode("");
    }
  }, [tree, majorCode, middleCode, smallCode]);

  const currentMajor = findCurrentMajor(tree, majorCode);
  const currentMiddle = findCurrentMiddle(tree, majorCode, middleCode);
  const currentSmall = (currentMiddle?.smallRows || []).find((item) => item.code === smallCode) || null;

  return {
    tree,
    majorCode,
    middleCode,
    smallCode,
    setMajorCode,
    setMiddleCode,
    setSmallCode,
    majorLabel: currentMajor?.label || "",
    middleLabel: currentMiddle?.label || "",
    smallLabel: currentSmall?.label || ""
  };
}

function SectionEditor({
  section,
  activeRows,
  expanded,
  onToggleExpanded,
  onAddRow,
  onRemoveRow,
  onChangeCell
}: {
  section: EmissionSurveyAdminSection;
  activeRows: DraftRow[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeCell: (rowId: string, key: string, value: string) => void;
}) {
  const columns = buildEditableColumns(((section.columns || []) as Array<Record<string, string>>));
  const displayColumns = buildDisplayColumnLabels(columns);
  const gridTemplateColumns = buildGridTemplate(displayColumns, section.sectionCode);
  const headerModel = buildHeaderModel(displayColumns);
  const sectionTitle = stripSectionNumber(section.sectionLabel || "");

  return (
    <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white shadow-sm">
      <div className="border-b border-[var(--kr-gov-border-light)] bg-[linear-gradient(135deg,rgba(219,234,254,0.65),rgba(255,255,255,0.98))] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black leading-tight text-[var(--kr-gov-text-primary)]">{sectionTitle || "-"}</h3>
            <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">행 수 {activeRows.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <MemberButton className="whitespace-nowrap" onClick={onToggleExpanded} size="xs" type="button" variant="secondary">
              {expanded ? "접기" : "펼치기"}
            </MemberButton>
            {expanded ? <MemberButton className="whitespace-nowrap" onClick={onAddRow} size="xs" type="button" variant="secondary">+ 행 추가</MemberButton> : null}
          </div>
        </div>
      </div>
      <div className="px-4 py-4">
        {!expanded ? (
          <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            섹션이 접혀 있습니다. `펼치기`를 누르면 행 편집기가 열립니다.
          </div>
        ) : (
        <div>
          {activeRows.length === 0 ? (
            <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              현재 행이 없습니다. `+ 행 추가`로 직접 입력을 시작할 수 있습니다.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white">
              {headerModel.hasMergedHeader ? (
                <div className="grid border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns }}>
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]" style={{ gridRow: `span ${headerModel.depth}` }}>행</div>
                  {headerModel.cells.map((cell) => (
                    <div
                      className="border-r border-b border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)] last:border-r-0"
                      key={cell.key}
                      style={{ gridColumn: `${cell.columnStart} / span ${cell.colSpan}`, gridRow: `${cell.rowStart} / span ${cell.rowSpan}` }}
                    >
                      {cell.lines.map((line, index) => <span className="block leading-4" key={`${cell.key}-${index}`}>{line}</span>)}
                    </div>
                  ))}
                  <div className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]" style={{ gridRow: `span ${headerModel.depth}` }}>관리</div>
                </div>
              ) : (
                <div className="grid border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns }}>
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">행</div>
                  {headerModel.columns.map((column) => (
                    <div className="border-r border-slate-200 px-2 py-2 text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)] last:border-r-0" key={`header-${column.key}`} title={column.fullLabel}>
                      {column.displayLines.map((line, index) => <span className="block leading-4" key={`${column.key}-${index}`}>{line}</span>)}
                    </div>
                  ))}
                  <div className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">관리</div>
                </div>
              )}
              {activeRows.map((row, index) => (
                <div className="grid border-b border-slate-200 last:border-b-0" key={row.rowId} style={{ gridTemplateColumns }}>
                  <div className="flex items-center justify-center border-r border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{index + 1}</div>
                  {headerModel.columns.map((column) => (
                    <label className="block border-r border-slate-200 px-2 py-2 last:border-r-0" key={`${row.rowId}-${column.key}`} title={column.fullLabel}>
                      <span className="sr-only">{column.fullLabel}</span>
                      {isUnitColumnKey(column.key) ? (
                        <AdminSelect onChange={(event) => onChangeCell(row.rowId, column.key, event.target.value)} value={row.values[column.key] || ""}>
                          <option value="">선택</option>
                          {UNIT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </AdminSelect>
                      ) : (
                        <AdminInput onChange={(event) => onChangeCell(row.rowId, column.key, event.target.value)} value={row.values[column.key] || ""} />
                      )}
                    </label>
                  ))}
                  <div className="flex items-center justify-center px-2 py-2">
                    <MemberButton onClick={() => onRemoveRow(row.rowId)} size="sm" type="button" variant="secondary">삭제</MemberButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </article>
  );
}

export function EmissionSurveyAdminMigrationPage() {
  const en = isEnglish();
  const emissionManagementHref = buildLocalizedPath("/admin/emission/management", "/en/admin/emission/management");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pageOverride, setPageOverride] = useState<EmissionSurveyAdminPagePayload | null>(null);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [activeCases, setActiveCases] = useState<SectionCaseState>({});
  const [expandedSections, setExpandedSections] = useState<SectionExpandState>({});

  const pageState = useAsyncValue<EmissionSurveyAdminPagePayload>(() => fetchEmissionSurveyAdminPage(), []);
  const page = pageOverride || pageState.value;
  const pagePayload = page || undefined;

  const classification = useClassificationSelection(pagePayload);
  const classificationKey = `${classification.majorCode}:${classification.middleCode}:${classification.smallCode || "-"}`;
  const sections = (((page?.sections || []) as EmissionSurveyAdminSection[]));
  const inputSections = sections.filter((section) => section.majorCode === "INPUT");
  const outputSections = sections.filter((section) => section.majorCode === "OUTPUT");
  const inputGroup = sectionGroupTitle("INPUT", en);
  const outputGroup = sectionGroupTitle("OUTPUT", en);
  const majorRows = classification.tree.map((item) => ({ value: item.code, label: item.label }));
  const middleRows = (findCurrentMajor(classification.tree, classification.majorCode)?.middleRows || []).map((item) => ({ value: item.code, label: item.label }));
  const smallRows = (findCurrentMiddle(classification.tree, classification.majorCode, classification.middleCode)?.smallRows || []).map((item) => ({ value: item.code, label: item.label }));
  const isClassificationReady = Boolean(classification.majorCode && classification.middleCode);

  useEffect(() => {
    if (!classification.majorCode || !classification.middleCode) {
      return;
    }
    setDrafts((current) => {
      const next = { ...current };
      let mutated = false;
      sections.forEach((section) => {
        const seedRows = buildRowsFromSection(section);
        const case31Key = buildDraftKey(classificationKey, section.sectionCode || "", "CASE_3_1");
        const case32Key = buildDraftKey(classificationKey, section.sectionCode || "", "CASE_3_2");
        if (!next[case31Key]) {
          next[case31Key] = { rows: seedRows, savedAt: "" };
          mutated = true;
        }
        if (!next[case32Key]) {
          next[case32Key] = { rows: [], savedAt: "" };
          mutated = true;
        }
      });
      return mutated ? next : current;
    });
    setActiveCases((current) => {
      const next = { ...current };
      let mutated = false;
      sections.forEach((section) => {
        const sectionCode = section.sectionCode || "";
        if (!next[sectionCode]) {
          next[sectionCode] = "CASE_3_1";
          mutated = true;
        }
      });
      return mutated ? next : current;
    });
    setExpandedSections((current) => {
      const next = { ...current };
      let mutated = false;
      sections.forEach((section) => {
        const sectionCode = section.sectionCode || "";
        if (!(sectionCode in next)) {
          next[sectionCode] = false;
          mutated = true;
        }
      });
      return mutated ? next : current;
    });
  }, [classification.majorCode, classification.middleCode, classification.smallCode, classificationKey, sections]);

  useEffect(() => {
    logGovernanceScope("PAGE", "emission-survey-admin", {
      route: window.location.pathname,
      language: en ? "en" : "ko",
      lciMajorCode: classification.majorCode,
      lciMiddleCode: classification.middleCode,
      lciSmallCode: classification.smallCode,
      uploaded: Boolean(page?.uploaded)
    });
  }, [classification.majorCode, classification.middleCode, classification.smallCode, en, page?.uploaded]);

  function getCase(sectionCode: string, caseCode: "CASE_3_1" | "CASE_3_2", fallbackRows: DraftRow[]) {
    return drafts[buildDraftKey(classificationKey, sectionCode, caseCode)] || { rows: fallbackRows, savedAt: "" };
  }

  function setCaseRows(sectionCode: string, caseCode: "CASE_3_1" | "CASE_3_2", rows: DraftRow[], savedAt?: string) {
    const draftKey = buildDraftKey(classificationKey, sectionCode, caseCode);
    setDrafts((current) => ({
      ...current,
      [draftKey]: {
        rows,
        savedAt: savedAt ?? current[draftKey]?.savedAt ?? ""
      }
    }));
  }

  function handleAddRow(section: EmissionSurveyAdminSection) {
    const sectionCode = section.sectionCode || "";
    const currentCaseCode = activeCases[sectionCode] || "CASE_3_1";
    const currentRows = getCase(sectionCode, currentCaseCode, buildRowsFromSection(section)).rows.slice();
    currentRows.push(createEmptyRow(section, currentRows.length + 1));
    setCaseRows(sectionCode, currentCaseCode, currentRows);
  }

  function handleRemoveRow(section: EmissionSurveyAdminSection, rowId: string) {
    const sectionCode = section.sectionCode || "";
    const currentCaseCode = activeCases[sectionCode] || "CASE_3_1";
    const currentRows = getCase(sectionCode, currentCaseCode, buildRowsFromSection(section)).rows.filter((row) => row.rowId !== rowId);
    setCaseRows(sectionCode, currentCaseCode, currentRows);
  }

  function handleCellChange(section: EmissionSurveyAdminSection, rowId: string, key: string, value: string) {
    const sectionCode = section.sectionCode || "";
    const currentCaseCode = activeCases[sectionCode] || "CASE_3_1";
    const currentRows = getCase(sectionCode, currentCaseCode, buildRowsFromSection(section)).rows.map((row) => row.rowId === rowId ? { ...row, values: { ...row.values, [key]: value } } : row);
    setCaseRows(sectionCode, currentCaseCode, currentRows);
  }

  function handleToggleSection(sectionCode: string) {
    setExpandedSections((current) => ({
      ...current,
      [sectionCode]: !current[sectionCode]
    }));
  }

  async function handleLoadCase(
    section: EmissionSurveyAdminSection,
    caseCode: "CASE_3_1" | "CASE_3_2",
    options?: { suppressMessage?: boolean; sourcePage?: EmissionSurveyAdminPagePayload | null | undefined }
  ) {
    const sectionCode = section.sectionCode || "";
    setActiveCases((current) => ({ ...current, [sectionCode]: caseCode }));
    if (caseCode === "CASE_3_1") {
      const sharedSection = resolveSharedSectionRows(options?.sourcePage || pagePayload, section);
      setCaseRows(sectionCode, caseCode, sharedSection.rows, sharedSection.savedAt);
      if (!options?.suppressMessage) {
        setMessage("공통 DB사용 데이터를 불러왔습니다.");
      }
    } else {
      setCaseRows(sectionCode, caseCode, [], "");
      if (!options?.suppressMessage) {
        setMessage("직접입력 상태로 전환했습니다.");
      }
    }
    setErrorMessage("");
  }

  async function handleLoadAllSections(caseCode: "CASE_3_1" | "CASE_3_2") {
    setMessage("");
    setErrorMessage("");
    try {
      const latestPage = caseCode === "CASE_3_1" ? await fetchEmissionSurveyAdminPage() : null;
      if (latestPage) {
        setPageOverride(latestPage);
      }
      const sourceSections = latestPage ? ((((latestPage.sections || []) as EmissionSurveyAdminSection[]))) : sections;
      const nextActiveCases: SectionCaseState = {};
      sourceSections.forEach((section) => {
        nextActiveCases[section.sectionCode || ""] = caseCode;
      });
      setActiveCases(nextActiveCases);

      for (const section of sourceSections) {
        await handleLoadCase(section, caseCode, { suppressMessage: true, sourcePage: latestPage || pagePayload });
      }
      setMessage(caseCode === "CASE_3_1"
        ? "공통 DB사용 데이터로 8개 섹션 전체를 불러왔습니다."
        : "8개 섹션 전체를 직접입력 상태로 전환했습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "섹션 전체 불러오기에 실패했습니다.");
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
      const payload = await uploadEmissionSurveyWorkbook(uploadFile, {
        lciMajorCode: classification.majorCode,
        lciMajorLabel: classification.majorLabel,
        lciMiddleCode: classification.middleCode,
        lciMiddleLabel: classification.middleLabel,
        lciSmallCode: classification.smallCode,
        lciSmallLabel: classification.smallLabel
      });
      setPageOverride(payload);
      setDrafts({});
      setActiveCases({});
      setMessage(String((payload.uploadAudit as Record<string, unknown> | undefined)?.message || "엑셀을 업로드했고 8개 섹션 구성을 다시 불러왔습니다."));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "엑셀 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈" },
        { label: en ? "Emissions & Certification" : "배출/인증" },
        { label: en ? "Emission Survey Management" : "배출 설문 관리" }
      ]}
      title={stringOf(page as Record<string, unknown>, "pageTitle") || "배출 설문 관리"}
      subtitle=""
      loading={false}
      loadingLabel={en ? "Loading the emission survey workspace..." : "배출 설문 작업공간을 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.loading && !page && !pageState.error ? (
          <PageStatusNotice tone="warning">기본 화면을 먼저 표시하고 있습니다. 설문 데이터는 로딩이 끝나는 대로 이어서 표시됩니다.</PageStatusNotice>
        ) : null}
        {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}
        {errorMessage || pageState.error ? <PageStatusNotice tone="error">{errorMessage || pageState.error}</PageStatusNotice> : null}

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <MemberSectionToolbar
            title={<span>분류 선택 및 편집 시작</span>}
            actions={(
              <div className="flex flex-wrap items-center justify-end gap-2">
                <MemberButton onClick={() => void handleLoadAllSections("CASE_3_1")} type="button" variant="secondary">DB사용</MemberButton>
                <MemberButton onClick={() => void handleLoadAllSections("CASE_3_2")} type="button" variant="secondary">직접입력</MemberButton>
                <MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">{uploading ? "업로드 중..." : "엑셀 업로드"}</MemberButton>
              </div>
            )}
          />
          <input accept=".xlsx" className="hidden" onChange={handleUploadChange} ref={fileInputRef} type="file" />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">LCI 대분류</span>
              <AdminSelect onChange={(event) => { setMessage(""); classification.setMajorCode(event.target.value); }} value={classification.majorCode}>
                <option value="">선택</option>
                {majorRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">LCI 중분류</span>
              <AdminSelect disabled={!classification.majorCode} onChange={(event) => { setMessage(""); classification.setMiddleCode(event.target.value); }} value={classification.middleCode}>
                <option value="">선택</option>
                {middleRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">LCI 소분류</span>
              <AdminSelect disabled={!classification.middleCode} onChange={(event) => { setMessage(""); classification.setSmallCode(event.target.value); }} value={classification.smallCode}>
                <option value="">미선택</option>
                {smallRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
          </div>
          <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4 text-sm text-[var(--kr-gov-text-secondary)]">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              <p>저장 대상: <span className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(page as Record<string, unknown>, "currentActorId") || "공통 데이터셋"}</span></p>
              <p>선택 분류: <span className="font-bold text-[var(--kr-gov-text-primary)]">{classification.majorLabel || "-"} / {classification.middleLabel || "-"} / {classification.smallLabel || "미선택"}</span></p>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-[var(--kr-gov-blue)]">
            <span className="text-sm font-black uppercase tracking-[0.2em]">{inputGroup.english}</span>
            <span className="text-xl font-black">{inputGroup.korean}</span>
          </div>
          {!isClassificationReady ? (
            <div className="mt-5 rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              LCI 대분류와 중분류를 선택하면 입력 섹션이 렌더링됩니다.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 items-start gap-5">
              {inputSections.map((section) => {
                const activeCase = activeCases[section.sectionCode || ""] || "CASE_3_1";
                const startCase = getCase(section.sectionCode || "", "CASE_3_1", buildDefaultCaseRows(section, "CASE_3_1"));
                const dbCase = getCase(section.sectionCode || "", "CASE_3_2", buildDefaultCaseRows(section, "CASE_3_2"));
                const current = activeCase === "CASE_3_1" ? startCase : dbCase;
                return (
                  <SectionEditor
                    activeRows={current.rows}
                    expanded={Boolean(expandedSections[section.sectionCode || ""])}
                    key={section.sectionCode}
                    onAddRow={() => handleAddRow(section)}
                    onChangeCell={(rowId, key, value) => handleCellChange(section, rowId, key, value)}
                    onRemoveRow={(rowId) => handleRemoveRow(section, rowId)}
                    onToggleExpanded={() => handleToggleSection(section.sectionCode || "")}
                    section={section}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-[var(--kr-gov-blue)]">
            <span className="text-sm font-black uppercase tracking-[0.2em]">{outputGroup.english}</span>
            <span className="text-xl font-black">{outputGroup.korean}</span>
          </div>
          {!isClassificationReady ? (
            <div className="mt-5 rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              LCI 대분류와 중분류를 선택하면 출력 섹션이 렌더링됩니다.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 items-start gap-5">
              {outputSections.map((section) => {
                const activeCase = activeCases[section.sectionCode || ""] || "CASE_3_1";
                const startCase = getCase(section.sectionCode || "", "CASE_3_1", buildDefaultCaseRows(section, "CASE_3_1"));
                const dbCase = getCase(section.sectionCode || "", "CASE_3_2", buildDefaultCaseRows(section, "CASE_3_2"));
                const current = activeCase === "CASE_3_1" ? startCase : dbCase;
                return (
                  <SectionEditor
                    activeRows={current.rows}
                    expanded={Boolean(expandedSections[section.sectionCode || ""])}
                    key={section.sectionCode}
                    onAddRow={() => handleAddRow(section)}
                    onChangeCell={(rowId, key, value) => handleCellChange(section, rowId, key, value)}
                    onRemoveRow={(rowId) => handleRemoveRow(section, rowId)}
                    onToggleExpanded={() => handleToggleSection(section.sectionCode || "")}
                    section={section}
                  />
                );
              })}
            </div>
          )}
        </section>
        <MemberActionBar
          className="mt-6"
          dataHelpId="emission-survey-admin-bottom-actions"
          eyebrow={en ? "Final Action" : "최종 실행"}
          primary={(
            <div className="flex flex-wrap items-center justify-end gap-3">
              <MemberButton
                onClick={() => {
                  window.location.href = emissionManagementHref;
                }}
                type="button"
              >
                {en ? "Calculate Carbon Emissions" : "탄소배출량 계산"}
              </MemberButton>
            </div>
          )}
          title={en ? "Carbon Emission Calculation" : "탄소배출량 계산"}
        />
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
