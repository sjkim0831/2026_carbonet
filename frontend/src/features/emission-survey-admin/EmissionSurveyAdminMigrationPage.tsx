import { useEffect, useMemo, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionCategories,
  fetchEmissionSurveyAdminPage,
  fetchEmissionTiers,
  fetchEmissionVariableDefinitions,
  uploadEmissionSurveyWorkbook
} from "../../lib/api/emission";
import type {
  EmissionCategoryItem,
  EmissionFactorDefinition,
  EmissionSurveyAdminPagePayload,
  EmissionSurveyAdminSection
} from "../../lib/api/emissionTypes";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { normalizeUnitValue, UNIT_OPTIONS } from "../emission-common/unitOptions";
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

type SurveyCalculationScopeState = {
  loading: boolean;
  ready: boolean;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  tier: number;
  tierLabel: string;
  factors: EmissionFactorDefinition[];
  message: string;
  blockingMessage: string;
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

function normalizeRowValues(values: Record<string, string>) {
  const nextValues = { ...values };
  Object.keys(nextValues).forEach((key) => {
    if (String(nextValues[key] || "").trim() === "-") {
      nextValues[key] = "";
    }
  });
  if ("annualUnit" in nextValues) {
    nextValues.annualUnit = normalizeUnitValue(nextValues.annualUnit || "");
  }
  if ("costUnit" in nextValues) {
    nextValues.costUnit = normalizeUnitValue(nextValues.costUnit || "");
  }
  const emissionFactor = String(nextValues.emissionFactor || nextValues.gwpValue || nextValues.gwpDirectValue || "").trim();
  if (emissionFactor) {
    nextValues.emissionFactor = emissionFactor;
  }
  return nextValues;
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function decimalValue(value: unknown) {
  const normalized = stringValue(value).replace(/,/g, "").trim();
  if (!normalized) {
    return 0;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTierLabelNumber(value: unknown) {
  const digits = stringValue(value).replace(/[^0-9]/g, "");
  if (!digits) {
    return 0;
  }
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveCategoryByClassification(categories: EmissionCategoryItem[], classificationCode: string) {
  const normalizedCode = stringValue(classificationCode).trim();
  if (!normalizedCode) {
    return { matchedCategory: null as EmissionCategoryItem | null, ambiguous: false };
  }
  const exactMatch = categories.find((item) => stringValue(item.classificationCode) === normalizedCode) || null;
  if (exactMatch) {
    return { matchedCategory: exactMatch, ambiguous: false };
  }
  const prefixMatches = categories.filter((item) => stringValue(item.classificationCode).startsWith(normalizedCode));
  if (prefixMatches.length === 1) {
    return { matchedCategory: prefixMatches[0], ambiguous: false };
  }
  return { matchedCategory: null, ambiguous: prefixMatches.length > 1 };
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

function supportsEmissionFactorColumn(sectionCode?: string) {
  return Boolean(sectionCode);
}

function emissionFactorColumnTemplate() {
  return {
    key: "emissionFactor",
    label: "배출계수",
    headerPath: JSON.stringify(["배출계수"])
  };
}

function buildEditableColumns(section: EmissionSurveyAdminSection | undefined) {
  const columns = ((section?.columns || []) as Array<Record<string, string>>);
  const hasAmountColumn = columns.some((column) => stringOf(column, "key") === "amount");
  if (!supportsEmissionFactorColumn(section?.sectionCode) || !hasAmountColumn) {
    return columns;
  }
  if (columns.some((column) => stringOf(column, "key") === "emissionFactor")) {
    return columns;
  }
  const nextColumns = [...columns];
  const amountIndex = nextColumns.findIndex((column) => stringOf(column, "key") === "amount");
  const insertIndex = amountIndex >= 0 ? amountIndex + 1 : nextColumns.length;
  nextColumns.splice(insertIndex, 0, emissionFactorColumnTemplate());
  return nextColumns;
}

function createEmptyRow(section: EmissionSurveyAdminSection | undefined, index: number): DraftRow {
  const values: Record<string, string> = {};
  buildEditableColumns(section).forEach((column) => {
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

function isExcludedPreviewSection(sectionCode?: string) {
  return String(sectionCode || "") === "OUTPUT_PRODUCTS";
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
  const columns = buildEditableColumns(section);
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
                      {column.key === "emissionFactor" ? (
                        <AdminInput onChange={(event) => onChangeCell(row.rowId, column.key, event.target.value)} value={row.values[column.key] || ""} />
                      ) : isUnitColumnKey(column.key) ? (
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
  const [selectedProductName, setSelectedProductName] = useState("");
  const [calculationScope, setCalculationScope] = useState<SurveyCalculationScopeState>({
    loading: false,
    ready: false,
    categoryId: 0,
    categoryCode: "",
    categoryName: "",
    tier: 0,
    tierLabel: "",
    factors: [],
    message: "",
    blockingMessage: ""
  });

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
  const productRows = (((page?.productOptions || []) as Array<Record<string, string>>)).map((item) => ({ value: stringOf(item, "value"), label: stringOf(item, "label") }));
  const isClassificationReady = Boolean(classification.majorCode && classification.middleCode);
  const previewSummary = useMemo(() => {
    const sectionSummaries = sections.map((section) => {
      const sectionCode = section.sectionCode || "";
      const activeCase = activeCases[sectionCode] || "CASE_3_1";
      const fallbackRows = buildDefaultCaseRows(section, activeCase);
      const currentRows = getCase(sectionCode, activeCase, fallbackRows).rows;
      const totalEmission = currentRows.reduce((sum, row) => {
        const amount = decimalValue(row.values.amount);
        const emissionFactor = decimalValue(row.values.emissionFactor);
        if (amount <= 0 || emissionFactor <= 0) {
          return sum;
        }
        return sum + amount * emissionFactor;
      }, 0);
      const rowCount = isExcludedPreviewSection(sectionCode) ? 0 : currentRows.length;
      const calculatedRowCount = isExcludedPreviewSection(sectionCode)
        ? 0
        : currentRows.filter((row) => decimalValue(row.values.amount) > 0 && decimalValue(row.values.emissionFactor) > 0).length;
      return {
        sectionCode,
        sectionLabel: stripSectionNumber(section.sectionLabel || ""),
        totalEmission: isExcludedPreviewSection(sectionCode) ? 0 : totalEmission,
        rowCount,
        calculatedRowCount
      };
    });
    return {
      totalEmission: sectionSummaries.reduce((sum, section) => sum + section.totalEmission, 0),
      rowCount: sectionSummaries.reduce((sum, section) => sum + section.rowCount, 0),
      calculatedRowCount: sectionSummaries.reduce((sum, section) => sum + section.calculatedRowCount, 0)
    };
  }, [activeCases, classificationKey, drafts, sections]);

  useEffect(() => {
    const nextSelected = stringOf(page as Record<string, unknown>, "selectedProductName");
    if (nextSelected && nextSelected !== selectedProductName) {
      setSelectedProductName(nextSelected);
    }
  }, [page, selectedProductName]);

  useEffect(() => {
    if (!classification.majorCode || !classification.middleCode) {
      return;
    }
    setDrafts((current) => {
      const next = { ...current };
      let mutated = false;
      sections.forEach((section) => {
        const sharedSection = resolveSharedSectionRows(pagePayload, section);
        const seedRows = sharedSection.rows;
        const case31Key = buildDraftKey(classificationKey, section.sectionCode || "", "CASE_3_1");
        const case32Key = buildDraftKey(classificationKey, section.sectionCode || "", "CASE_3_2");
        if (!next[case31Key]) {
          next[case31Key] = { rows: seedRows, savedAt: sharedSection.savedAt };
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
  }, [classification.majorCode, classification.middleCode, classification.smallCode, classificationKey, pagePayload, sections]);

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

  useEffect(() => {
    let cancelled = false;

    async function loadCalculationScope() {
      if (!classification.middleCode) {
        setCalculationScope({
          loading: false,
          ready: false,
          categoryId: 0,
          categoryCode: "",
          categoryName: "",
          tier: 0,
          tierLabel: "",
          factors: [],
          message: "중분류 이상을 선택하면 계산에 사용할 배출계수 범위를 함께 확인합니다.",
          blockingMessage: "탄소배출량 계산 전에 LCI 중분류를 선택하세요."
        });
        return;
      }

      setCalculationScope((current) => ({
        ...current,
        loading: true,
        ready: false,
        message: "",
        blockingMessage: ""
      }));

      try {
        const categoryResponse = await fetchEmissionCategories("");
        if (cancelled) {
          return;
        }
        const categories = (categoryResponse.items || []) as EmissionCategoryItem[];
        const preferredClassificationCode = classification.smallCode || classification.middleCode;
        const resolution = resolveCategoryByClassification(categories, preferredClassificationCode);
        const matchedCategory = resolution.matchedCategory;
        if (!matchedCategory) {
          setCalculationScope({
            loading: false,
            ready: false,
            categoryId: 0,
            categoryCode: "",
            categoryName: "",
            tier: 0,
            tierLabel: "",
            factors: [],
            message: resolution.ambiguous
              ? "선택한 중분류에 연결된 계산 카테고리가 여러 개라 소분류 선택이 더 필요합니다."
              : "선택한 분류와 연결된 배출 산정 카테고리를 찾지 못했습니다.",
            blockingMessage: resolution.ambiguous
              ? "계산 대상이 여러 개라 탄소배출량 계산 전에 LCI 소분류를 선택하세요."
              : "연결된 배출 산정 카테고리가 없어 계산할 수 없습니다. 관리자에 문의하세요."
          });
          return;
        }

        const categoryId = numberValue(matchedCategory.categoryId);
        const tiersResponse = await fetchEmissionTiers(categoryId);
        if (cancelled) {
          return;
        }
        const supportedTiers = ((tiersResponse.tiers || []) as Array<Record<string, unknown>>)
          .map((item) => ({
            tier: numberValue(item.tier),
            tierLabel: stringValue(item.tierLabel) || `Tier ${numberValue(item.tier)}`
          }))
          .filter((item) => item.tier > 0);
        const recommendedTier = parseTierLabelNumber(matchedCategory.classificationTierLabel);
        const selectedTier = supportedTiers.find((item) => item.tier === recommendedTier)?.tier || supportedTiers[0]?.tier || 0;
        const selectedTierLabel = supportedTiers.find((item) => item.tier === selectedTier)?.tierLabel || (selectedTier > 0 ? `Tier ${selectedTier}` : "");

        if (selectedTier <= 0) {
          setCalculationScope({
            loading: false,
            ready: false,
            categoryId,
            categoryCode: stringValue(matchedCategory.subCode),
            categoryName: stringValue(matchedCategory.subName),
            tier: 0,
            tierLabel: "",
            factors: [],
            message: "연결된 카테고리는 확인했지만 실행 가능한 Tier가 없습니다.",
            blockingMessage: "실행 가능한 Tier가 없어 계산할 수 없습니다. 관리자에 문의하세요."
          });
          return;
        }

        const definitionResponse = await fetchEmissionVariableDefinitions(categoryId, selectedTier);
        if (cancelled) {
          return;
        }
        const loadedFactors = (definitionResponse.factors || []) as EmissionFactorDefinition[];
        setCalculationScope({
          loading: false,
          ready: loadedFactors.length > 0,
          categoryId,
          categoryCode: stringValue(matchedCategory.subCode),
          categoryName: stringValue(matchedCategory.subName),
          tier: selectedTier,
          tierLabel: selectedTierLabel,
          factors: loadedFactors,
          message: loadedFactors.length > 0
            ? `계산 범위 ${stringValue(matchedCategory.subName)} / ${selectedTierLabel}에서 배출계수 ${loadedFactors.length}건을 확인했습니다.`
            : `계산 범위 ${stringValue(matchedCategory.subName)} / ${selectedTierLabel}에 저장된 배출계수가 없습니다.`,
          blockingMessage: loadedFactors.length > 0
            ? ""
            : "저장된 배출계수 값이 없어 계산할 수 없습니다. 관리자에 문의하세요."
        });
      } catch (scopeError) {
        if (cancelled) {
          return;
        }
        setCalculationScope({
          loading: false,
          ready: false,
          categoryId: 0,
          categoryCode: "",
          categoryName: "",
          tier: 0,
          tierLabel: "",
          factors: [],
          message: scopeError instanceof Error ? scopeError.message : "계산용 배출계수 범위를 불러오지 못했습니다.",
          blockingMessage: "배출계수 범위를 확인하지 못해 계산을 진행할 수 없습니다. 관리자에 문의하세요."
        });
      }
    }

    void loadCalculationScope();
    return () => {
      cancelled = true;
    };
  }, [classification.middleCode, classification.smallCode]);

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
      const latestPage = caseCode === "CASE_3_1" ? await fetchEmissionSurveyAdminPage({ productName: selectedProductName }) : null;
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

  async function handleReloadSharedProduct(productName: string) {
    setMessage("");
    setErrorMessage("");
    try {
      const latestPage = await fetchEmissionSurveyAdminPage({ productName });
      setPageOverride(latestPage);
      setSelectedProductName(productName);
      setDrafts({});
      setActiveCases({});
      setMessage(`${productName || "기본"} 제품 기준 DB사용 데이터를 불러올 준비가 되었습니다.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "제품 기준 DB 데이터를 불러오지 못했습니다.");
    }
  }

  function handleChangeProduct(productName: string) {
    setSelectedProductName(productName);
    if (!productName) {
      return;
    }
    void handleReloadSharedProduct(productName);
  }

  function handleMoveToCalculation() {
    if (!classification.middleCode) {
      setErrorMessage("탄소배출량 계산 전에 LCI 중분류를 선택하세요.");
      return;
    }
    if (!calculationScope.ready || calculationScope.categoryId <= 0 || calculationScope.tier <= 0) {
      setErrorMessage(calculationScope.blockingMessage || "배출계수 범위를 확인하지 못해 계산을 진행할 수 없습니다. 관리자에 문의하세요.");
      return;
    }
    const url = new URL(emissionManagementHref, window.location.origin);
    url.searchParams.set("categoryId", String(calculationScope.categoryId));
    url.searchParams.set("tier", String(calculationScope.tier));
    url.searchParams.set("fromSurveyAdmin", "Y");
    window.location.href = `${url.pathname}${url.search}${url.hash}`;
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

        <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm" data-help-id="emission-survey-admin-classification">
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
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">LCI 소분류 (선택사항)</span>
              <AdminSelect disabled={!classification.middleCode} onChange={(event) => { setMessage(""); classification.setSmallCode(event.target.value); }} value={classification.smallCode}>
                  <option value="">미선택 (선택사항)</option>
                  {smallRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">제품 선택</span>
              <AdminSelect value={selectedProductName} onChange={(event) => { setMessage(""); handleChangeProduct(event.target.value); }}>
                <option value="">선택</option>
                {productRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </AdminSelect>
            </label>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm" data-help-id="emission-survey-admin-grid">
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

            <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-5 shadow-sm" data-help-id="emission-survey-admin-grid">
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
              dataHelpId="emission-survey-admin-bottom-actions"
              eyebrow={en ? "Final Action" : "최종 실행"}
              primary={(
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <MemberButton onClick={handleMoveToCalculation} type="button">
                    {en ? "Calculate Carbon Emissions" : "실제 탄소배출량 계산"}
                  </MemberButton>
                </div>
              )}
              title={en ? "Carbon Emission Calculation" : "탄소배출량 계산"}
            />
          </div>

          <aside className="xl:fixed xl:bottom-24 xl:right-6 xl:z-40 xl:w-[320px] xl:self-start">
            <div className="rounded-[var(--kr-gov-radius)] border border-sky-200 bg-white/95 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--kr-gov-blue)]">입력 안내</p>
              <h3 className="mt-2 text-lg font-black text-[var(--kr-gov-text-primary)]">탄소배출량 미리 계산</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
                배출 설문 관리 화면의 모든 섹션에서 각 행의 `양`과 `배출계수`를 서로 곱한 뒤, `제품 및 부산물`을 제외한 전체 행 결과를 모두 더해 합계 탄소배출량으로 표시합니다.
              </p>
              <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">계산된 행</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">
                  {previewSummary.calculatedRowCount} / {previewSummary.rowCount} 행
                </p>
                <p className="mt-3 text-xs font-bold text-slate-500">합계 탄소배출량</p>
                <p className="mt-1 text-2xl font-black text-[var(--kr-gov-text-primary)]">
                  {previewSummary.totalEmission.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
              </div>
              <MemberButton className="mt-4 w-full" onClick={handleMoveToCalculation} type="button">
                {en ? "Calculate Carbon Emissions" : "실제 탄소배출량 계산"}
              </MemberButton>
            </div>
          </aside>
        </div>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
