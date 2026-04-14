import { useEffect, useMemo, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionCategories,
  fetchEmissionGwpValuesPage,
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
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect, MemberActionBar, MemberButton, MemberSectionToolbar } from "../member/common";

type DraftRow = {
  rowId: string;
  values: Record<string, string>;
};

type GwpCandidateRow = Record<string, string>;

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

function normalizeText(value: string) {
  return String(value || "").trim().toLowerCase();
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
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

function hasGwpMapping(values: Record<string, string>) {
  return Boolean(
    String(values.gwpMappedRowId || "").trim()
      || String(values.gwpDirectValue || "").trim()
  );
}

function requiresGwpMapping(section: EmissionSurveyAdminSection, values: Record<string, string>) {
  const materialName = String(values.materialName || "").trim();
  if (!materialName) {
    return false;
  }
  return (section.sectionCode || "").startsWith("OUTPUT_");
}

function mapPriority(row: GwpCandidateRow, keyword: string) {
  const commonName = normalizeText(String(row.commonName || ""));
  const source = normalizeText(String(row.source || ""));
  const note = normalizeText(String(row.note || ""));
  const normalizedKeyword = normalizeText(keyword);
  if (source.includes("ecoinvent") || note.includes("ecoinvent")) {
    return 0;
  }
  if (commonName === normalizedKeyword) {
    return 1;
  }
  if (commonName.includes(normalizedKeyword)) {
    return 2;
  }
  return 3;
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

function GwpMappingModal({
  open,
  materialName,
  searchKeyword,
  searchRows,
  loading,
  valueType,
  directValue,
  onClose,
  onSearchKeywordChange,
  onSearch,
  onSelectValueType,
  onDirectValueChange,
  onApplyCandidate,
  onApplyDirect
}: {
  open: boolean;
  materialName: string;
  searchKeyword: string;
  searchRows: GwpCandidateRow[];
  loading: boolean;
  valueType: "AR4" | "AR5" | "AR6";
  directValue: string;
  onClose: () => void;
  onSearchKeywordChange: (value: string) => void;
  onSearch: () => void;
  onSelectValueType: (value: "AR4" | "AR5" | "AR6") => void;
  onDirectValueChange: (value: string) => void;
  onApplyCandidate: (row: GwpCandidateRow) => void;
  onApplyDirect: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[var(--kr-gov-radius)] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">GWP 매핑 선택</h3>
            <p className="mt-1 text-sm text-slate-500">물질명: {materialName || "-"}</p>
          </div>
          <MemberButton onClick={onClose} type="button" variant="secondary">닫기</MemberButton>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr,1fr,auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">검색어</span>
              <AdminInput value={searchKeyword} onChange={(event) => onSearchKeywordChange(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">값 기준</span>
              <AdminSelect value={valueType} onChange={(event) => onSelectValueType(event.target.value as "AR4" | "AR5" | "AR6")}>
                <option value="AR4">AR4</option>
                <option value="AR5">AR5</option>
                <option value="AR6">AR6</option>
              </AdminSelect>
            </label>
            <div className="flex items-end">
              <MemberButton onClick={onSearch} type="button" variant="primary">{loading ? "검색 중..." : "검색"}</MemberButton>
            </div>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-slate-200">
            <div className="grid grid-cols-[1.5fr,0.8fr,0.8fr,0.8fr,1fr,1fr,90px] border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <div className="px-3 py-2">Common Name</div>
              <div className="px-3 py-2">AR4</div>
              <div className="px-3 py-2">AR5</div>
              <div className="px-3 py-2">AR6</div>
              <div className="px-3 py-2">출처</div>
              <div className="px-3 py-2">임의 입력값</div>
              <div className="px-3 py-2 text-center">선택</div>
            </div>
            <div className="max-h-[45vh] overflow-y-auto">
              {searchRows.length === 0 ? (
                <div className="px-4 py-8 text-sm text-slate-500">검색 결과가 없습니다.</div>
              ) : (
                searchRows.map((row) => (
                  <div className="grid grid-cols-[1.5fr,0.8fr,0.8fr,0.8fr,1fr,1fr,90px] border-b border-slate-100 text-sm last:border-b-0" key={String(row.rowId || row.commonName || Math.random())}>
                    <div className="px-3 py-3">
                      <p className="font-bold text-slate-900">{String(row.commonName || "-")}</p>
                      <p className="mt-1 text-xs text-slate-500">{String(row.note || "-")}</p>
                      <p className="mt-1 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                        {mapPriority(row, searchKeyword) === 0 ? "1순위 Ecoinvent" : mapPriority(row, searchKeyword) === 1 ? "정확 일치" : "후보"}
                      </p>
                    </div>
                    <div className="px-3 py-3">{String(row.ar4Value || "-")}</div>
                    <div className="px-3 py-3">{String(row.ar5Value || "-")}</div>
                    <div className="px-3 py-3">{String(row.ar6Value || "-")}</div>
                    <div className="px-3 py-3 text-xs text-slate-600">{String(row.source || "-")}</div>
                    <div className="px-3 py-3 font-mono text-xs text-slate-600">{String(row.manualInputValue || "-")}</div>
                    <div className="flex items-center justify-center px-3 py-3">
                      <MemberButton onClick={() => onApplyCandidate(row)} size="sm" type="button" variant="secondary">선택</MemberButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50/60 p-4">
            <p className="text-sm font-bold text-rose-700">직접 입력</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block min-w-[220px] flex-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-rose-700">직접 배출계수 값</span>
                <AdminInput value={directValue} onChange={(event) => onDirectValueChange(event.target.value)} />
              </label>
              <MemberButton onClick={onApplyDirect} type="button" variant="secondary">직접입력 적용</MemberButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  activeRows,
  expanded,
  onToggleExpanded,
  onAddRow,
  onRemoveRow,
  onChangeCell,
  onOpenGwpMapping
}: {
  section: EmissionSurveyAdminSection;
  activeRows: DraftRow[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeCell: (rowId: string, key: string, value: string) => void;
  onOpenGwpMapping: (row: DraftRow) => void;
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
                <div className="grid border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns: `${gridTemplateColumns} 96px` }}>
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
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]" style={{ gridRow: `span ${headerModel.depth}` }}>GWP</div>
                  <div className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]" style={{ gridRow: `span ${headerModel.depth}` }}>관리</div>
                </div>
              ) : (
                <div className="grid border-b border-slate-200 bg-slate-100" style={{ gridTemplateColumns: `${gridTemplateColumns} 96px` }}>
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">행</div>
                  {headerModel.columns.map((column) => (
                    <div className="border-r border-slate-200 px-2 py-2 text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)] last:border-r-0" key={`header-${column.key}`} title={column.fullLabel}>
                      {column.displayLines.map((line, index) => <span className="block leading-4" key={`${column.key}-${index}`}>{line}</span>)}
                    </div>
                  ))}
                  <div className="border-r border-slate-200 px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">GWP</div>
                  <div className="px-2 py-2 text-center text-[10px] font-bold tracking-tight text-[var(--kr-gov-text-secondary)]">관리</div>
                </div>
              )}
              {activeRows.map((row, index) => (
                <div className={`grid border-b border-slate-200 last:border-b-0 ${requiresGwpMapping(section, row.values) && !hasGwpMapping(row.values) ? "bg-rose-50/70" : ""}`} key={row.rowId} style={{ gridTemplateColumns: `${gridTemplateColumns} 96px` }}>
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
                  <div className="flex flex-col items-center justify-center gap-1 border-r border-slate-200 px-2 py-2">
                    <MemberButton onClick={() => onOpenGwpMapping(row)} size="sm" type="button" variant="secondary">매핑</MemberButton>
                    {requiresGwpMapping(section, row.values) && !hasGwpMapping(row.values) ? (
                      <span className="text-center text-[10px] font-bold text-rose-700">오류
                        <br />
                        관리자 문의
                      </span>
                    ) : (
                      <span className="text-center text-[10px] font-bold text-emerald-700">{hasGwpMapping(row.values) ? "완료" : "-"}</span>
                    )}
                  </div>
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
  const [mappingTarget, setMappingTarget] = useState<{ sectionCode: string; rowId: string; materialName: string } | null>(null);
  const [mappingSearchKeyword, setMappingSearchKeyword] = useState("");
  const [mappingRows, setMappingRows] = useState<GwpCandidateRow[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingValueType, setMappingValueType] = useState<"AR4" | "AR5" | "AR6">("AR4");
  const [mappingDirectValue, setMappingDirectValue] = useState("");
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

  function handleOpenGwpMapping(section: EmissionSurveyAdminSection, row: DraftRow) {
    setMappingTarget({
      sectionCode: section.sectionCode || "",
      rowId: row.rowId,
      materialName: String(row.values.materialName || "")
    });
    setMappingSearchKeyword(String(row.values.materialName || ""));
    setMappingRows([]);
    setMappingDirectValue(String(row.values.gwpDirectValue || ""));
  }

  async function handleSearchGwpMapping() {
    if (!mappingTarget) {
      return;
    }
    setMappingLoading(true);
    try {
      const payload = await fetchEmissionGwpValuesPage({ searchKeyword: mappingSearchKeyword });
      const rows = (((payload.gwpRows || []) as Array<Record<string, string>>))
        .slice()
        .sort((left, right) => mapPriority(left, mappingSearchKeyword) - mapPriority(right, mappingSearchKeyword));
      setMappingRows(rows);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "GWP 검색에 실패했습니다.");
    } finally {
      setMappingLoading(false);
    }
  }

  function applyGwpMapping(sectionCode: string, rowId: string, updater: (row: DraftRow) => DraftRow) {
    const currentCaseCode = activeCases[sectionCode] || "CASE_3_1";
    const section = sections.find((item) => item.sectionCode === sectionCode);
    if (!section) {
      return;
    }
    const currentRows = getCase(sectionCode, currentCaseCode, buildRowsFromSection(section)).rows.map((row) => row.rowId === rowId ? updater(row) : row);
    setCaseRows(sectionCode, currentCaseCode, currentRows);
  }

  function handleApplyCandidateMapping(row: GwpCandidateRow) {
    if (!mappingTarget) {
      return;
    }
    const selectedValue = String(row[mappingValueType.toLowerCase() === "ar4" ? "ar4Value" : mappingValueType.toLowerCase() === "ar5" ? "ar5Value" : "ar6Value"] || "");
    applyGwpMapping(mappingTarget.sectionCode, mappingTarget.rowId, (draftRow) => ({
      ...draftRow,
      values: {
        ...draftRow.values,
        gwpMappedRowId: String(row.rowId || ""),
        gwpMappedName: String(row.commonName || ""),
        gwpValueType: mappingValueType,
        gwpValue: selectedValue,
        gwpDirectValue: ""
      }
    }));
    setMappingTarget(null);
  }

  function handleApplyDirectMapping() {
    if (!mappingTarget) {
      return;
    }
    applyGwpMapping(mappingTarget.sectionCode, mappingTarget.rowId, (draftRow) => ({
      ...draftRow,
      values: {
        ...draftRow.values,
        gwpMappedRowId: "",
        gwpMappedName: "",
        gwpValueType: "DIRECT",
        gwpValue: mappingDirectValue,
        gwpDirectValue: mappingDirectValue
      }
    }));
    setMappingTarget(null);
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
      setMessage(`${productName || "기본"} 제품 기준 DB사용 데이터를 불러올 준비가 되었습니다.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "제품 기준 DB 데이터를 불러오지 못했습니다.");
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
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">제품 선택</span>
              <div className="flex gap-2">
                <AdminSelect value={selectedProductName} onChange={(event) => setSelectedProductName(event.target.value)}>
                  <option value="">선택</option>
                  {productRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </AdminSelect>
                <MemberButton disabled={!selectedProductName} onClick={() => { void handleReloadSharedProduct(selectedProductName); }} type="button" variant="secondary">제품 반영</MemberButton>
              </div>
            </label>
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
          </div>
          <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4 text-sm text-[var(--kr-gov-text-secondary)]">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
              <p>저장 대상: <span className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(page as Record<string, unknown>, "currentActorId") || "공통 데이터셋"}</span></p>
              <p>선택 제품: <span className="font-bold text-[var(--kr-gov-text-primary)]">{selectedProductName || "-"}</span></p>
              <p>선택 분류: <span className="font-bold text-[var(--kr-gov-text-primary)]">{classification.majorLabel || "-"} / {classification.middleLabel || "-"} / {classification.smallLabel || "미선택"}</span></p>
            </div>
          </div>
          <div className={`mt-4 rounded-[var(--kr-gov-radius)] border px-4 py-4 text-sm ${
            calculationScope.ready
              ? "border-emerald-200 bg-emerald-50"
              : calculationScope.loading
                ? "border-sky-200 bg-sky-50"
                : "border-amber-200 bg-amber-50"
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">계산 배출계수 준비 상태</p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {calculationScope.loading ? "선택한 분류 기준 계산 카테고리와 배출계수를 확인하는 중입니다." : calculationScope.message || "아직 계산 범위를 확인하지 못했습니다."}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                calculationScope.ready
                  ? "bg-emerald-100 text-emerald-700"
                  : calculationScope.loading
                    ? "bg-sky-100 text-sky-700"
                    : "bg-amber-100 text-amber-700"
              }`}>
                {calculationScope.ready ? "준비 완료" : calculationScope.loading ? "확인 중" : "확인 필요"}
              </span>
            </div>
            {(calculationScope.categoryName || calculationScope.tierLabel) ? (
              <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
                <p>카테고리: <span className="font-bold text-[var(--kr-gov-text-primary)]">{calculationScope.categoryName || "-"}</span></p>
                <p>Tier: <span className="font-bold text-[var(--kr-gov-text-primary)]">{calculationScope.tierLabel || "-"}</span></p>
                <p>배출계수: <span className="font-bold text-[var(--kr-gov-text-primary)]">{calculationScope.factors.length}건</span></p>
              </div>
            ) : null}
            {!calculationScope.ready && calculationScope.blockingMessage ? (
              <p className="mt-3 text-xs font-bold text-amber-800">{calculationScope.blockingMessage}</p>
            ) : null}
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
                    onOpenGwpMapping={(row) => handleOpenGwpMapping(section, row)}
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
                    onOpenGwpMapping={(row) => handleOpenGwpMapping(section, row)}
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
                }}
                type="button"
              >
                {en ? "Calculate Carbon Emissions" : "탄소배출량 계산"}
              </MemberButton>
            </div>
          )}
          title={en ? "Carbon Emission Calculation" : "탄소배출량 계산"}
        />
        <GwpMappingModal
          directValue={mappingDirectValue}
          loading={mappingLoading}
          materialName={mappingTarget?.materialName || ""}
          onApplyCandidate={handleApplyCandidateMapping}
          onApplyDirect={handleApplyDirectMapping}
          onClose={() => setMappingTarget(null)}
          onDirectValueChange={setMappingDirectValue}
          onSearch={() => { void handleSearchGwpMapping(); }}
          onSearchKeywordChange={setMappingSearchKeyword}
          onSelectValueType={setMappingValueType}
          open={Boolean(mappingTarget)}
          searchKeyword={mappingSearchKeyword}
          searchRows={mappingRows}
          valueType={mappingValueType}
        />
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
