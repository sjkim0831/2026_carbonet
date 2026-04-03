import { Fragment, useEffect, useState } from "react";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  type EmissionCategoryItem,
  type EmissionFactorDefinition,
  type EmissionInputValuePayload,
  type EmissionManagementPagePayload,
  type EmissionTierItem,
  type EmissionVariableDefinition,
  calculateEmissionInputSession,
  fetchEmissionCategories,
  fetchEmissionInputSession,
  fetchEmissionLimeDefaultFactor,
  fetchEmissionManagementPage,
  fetchEmissionTiers,
  fetchEmissionVariableDefinitions,
  saveEmissionInputSession
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { AdminInput, AdminSelect, CollectionResultPanel, DiagnosticCard, LookupContextStrip, MemberActionBar, MemberButton, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import {
  type InputMap,
  type InputRow,
  type TierGuide,
  type WizardStep,
  DEFAULT_INPUT_ROW,
  alignedRowsForRemoval,
  arrayOf,
  buildEmptyInputs,
  buildMajorCategoryOptions,
  buildSummationGroups,
  buildTierGuide,
  buildVariableSections,
  carbonateFactorOf,
  cementTier2DerivedSummary,
  displayVariableCode,
  displayVariableName,
  hydrateInputs,
  isCementTier2Scope,
  isDerivedCarbonateFactorVariable,
  isLimeTier2DisabledField,
  isLimeTier2Scope,
  isLimeTier2SupplementalVariable,
  isRepeatableVariable,
  isRequiredVariable,
  limeTier2DerivedSummary,
  limeTier2VariableHint,
  majorCategoryKey,
  majorCategoryLabel,
  numberOf,
  resolutionGuideForVariable,
  shouldShowLimeTier2Variable,
  stringOf,
  syncLineNumbers,
  tier2FieldPlaceholder,
  variableCodeOf,
  variableOptions,
  visibleVariablesForStep
} from "./emissionManagementShared";

function splitFormulaToken(token: string) {
  const directMatch = token.match(/^([A-Za-z가-힣·]+)(?:_([A-Za-z0-9가-힣·]+))?(?:,([A-Za-z0-9가-힣]+))?$/);
  if (directMatch && (directMatch[2] || directMatch[3])) {
    return {
      head: directMatch[1],
      sub: `${directMatch[2] || ""}${directMatch[2] && directMatch[3] ? "," : ""}${directMatch[3] || ""}`
    };
  }
  const compactMatch = token.match(/^([A-Z]{1,3})([a-z]+(?:,[A-Za-z0-9]+)?)$/);
  if (compactMatch) {
    return {
      head: compactMatch[1],
      sub: compactMatch[2]
    };
  }
  return null;
}

function documentFormulaText(formula: string) {
  return formula
    .replace(/\bEFI\b/g, "EFi")
    .replace(/\bEFK\b/g, "EFk")
    .replace(/\bMI\b/g, "Mi")
    .replace(/\bFI\b/g, "Fi")
    .replace(/\bMK\b/g, "Mk")
    .replace(/\bXK\b/g, "Xk")
    .replace(/\bMCL\b/g, "Mcl")
    .replace(/\bEFCL\b/g, "EFcl")
    .replace(/\bEFCLC\b/g, "EFclc")
    .replace(/\bCFCKD\b/g, "CFckd")
    .replace(/\bIM\b/g, "Im")
    .replace(/\bEX\b/g, "Ex")
    .replace(/\bMD\b/g, "Md")
    .replace(/\bCD\b/g, "Cd")
    .replace(/\bFD\b/g, "Fd")
    .replace(/\s*,\s*,+\s*/g, ", ")
    .replace(/,{2,}/g, ",")
    .replace(/,\s*,/g, ",");
}

function displayUnitLabel(unit: string, en: boolean) {
  const normalized = stringOf(unit).trim();
  if (!normalized) {
    return "-";
  }
  if (normalized === "ton") {
    return en ? "metric tons" : "톤";
  }
  if (normalized === "ratio") {
    return en ? "ratio" : "비율";
  }
  if (normalized === "YN") {
    return en ? "yes/no" : "예/아니오";
  }
  if (normalized === "tCO2/ton") {
    return en ? "tCO2 per ton" : "톤당 CO2 배출량";
  }
  if (normalized === "tCO2/t-lime") {
    return en ? "tCO2 per ton of lime" : "석회 1톤당 CO2 배출량";
  }
  if (normalized === "tCO2/t-CaO") {
    return en ? "tCO2 per ton of CaO" : "CaO 1톤당 CO2 환산량";
  }
  if (normalized === "tCO2/t-CaO·MgO") {
    return en ? "tCO2 per ton of CaO·MgO" : "CaO·MgO 1톤당 CO2 환산량";
  }
  return normalized;
}

function appliedFactorLabel(factor: Record<string, unknown>, en: boolean) {
  const source = stringOf(factor.source).toUpperCase();
  if (source === "EF_LIME") {
    return en ? "Applied lime emission factor" : "적용 석회 배출계수";
  }
  if (source === "CF_LKD") {
    return en ? "Applied LKD correction factor" : "적용 LKD 보정계수";
  }
  if (source === "C_H") {
    return en ? "Applied hydrated-lime correction" : "적용 수화석회 보정계수";
  }
  if (source === "EFI") {
    return en ? "Applied carbonate emission factor" : "적용 탄산염 배출계수";
  }
  if (source === "EFK") {
    return en ? "Applied raw-material emission factor" : "적용 원료 배출계수";
  }
  if (source === "EFD") {
    return en ? "Applied residual carbonate factor" : "적용 잔류 탄산염 계수";
  }
  return en ? "Applied factor" : "적용 계수";
}

function appliedFactorContext(factor: Record<string, unknown>, en: boolean) {
  const source = stringOf(factor.source).toUpperCase();
  const lineNo = numberOf(factor.lineNo);
  const linePrefix = lineNo > 0 ? `${en ? "Line" : "라인"} ${lineNo} · ` : "";
  if (source === "EF_LIME") {
    return `${linePrefix}${en ? "formula term EF석회,i" : "수식 항 EF석회,i"}`;
  }
  if (source === "CF_LKD") {
    return `${linePrefix}${en ? "formula term CF_lkd,i" : "수식 항 CF_lkd,i"}`;
  }
  if (source === "C_H") {
    return `${linePrefix}${en ? "formula term C_h,i" : "수식 항 C_h,i"}`;
  }
  if (source === "EFI") {
    return `${linePrefix}${en ? "formula term EFi" : "수식 항 EFi"}`;
  }
  if (source === "EFK") {
    return `${linePrefix}${en ? "formula term EFk" : "수식 항 EFk"}`;
  }
  if (source === "EFD") {
    return `${linePrefix}${en ? "formula term EFd" : "수식 항 EFd"}`;
  }
  return linePrefix || (en ? "Applied during calculation" : "계산 중 적용");
}

function appliedFactorSourceBadge(factor: Record<string, unknown>, en: boolean) {
  const defaultApplied = Boolean(factor.defaultApplied);
  if (defaultApplied) {
    return en ? "Default/Mapped" : "기본값/매핑";
  }
  return en ? "Saved/Entered" : "저장값/입력값";
}

function localizedLimeTypeLabel(value: string, en: boolean) {
  const normalized = stringOf(value).trim().toUpperCase();
  if (normalized === "HIGH_CALCIUM") {
    return en ? "high-calcium lime" : "고칼슘석회";
  }
  if (normalized === "HYDRAULIC") {
    return en ? "hydraulic lime" : "수경성석회";
  }
  if (normalized === "DOLOMITIC") {
    return en ? "dolomitic lime" : "고토석회";
  }
  if (normalized === "DOLOMITIC_HIGH") {
    return en ? "dolomitic lime (high-grade)" : "고토석회(선진국 기준)";
  }
  if (normalized === "DOLOMITIC_LOW") {
    return en ? "dolomitic lime (low-grade)" : "고토석회(개도국 기준)";
  }
  return stringOf(value);
}

function presentCalculationText(value: string, en: boolean) {
  return stringOf(value)
    .replace(/\bHIGH_CALCIUM\b/g, localizedLimeTypeLabel("HIGH_CALCIUM", en))
    .replace(/\bHYDRAULIC\b/g, localizedLimeTypeLabel("HYDRAULIC", en))
    .replace(/\bDOLOMITIC_HIGH\b/g, localizedLimeTypeLabel("DOLOMITIC_HIGH", en))
    .replace(/\bDOLOMITIC_LOW\b/g, localizedLimeTypeLabel("DOLOMITIC_LOW", en))
    .replace(/\bDOLOMITIC\b/g, localizedLimeTypeLabel("DOLOMITIC", en));
}

function FormulaNotation({
  formula,
  active = false,
  compact = false,
  highlightedTokens = []
}: {
  formula: string;
  active?: boolean;
  compact?: boolean;
  highlightedTokens?: string[];
}) {
  const normalizedFormula = documentFormulaText(formula);
  const normalizedHighlights = highlightedTokens
    .map((token) => documentFormulaText(stringOf(token)).replace(/\s+/g, ""))
    .filter(Boolean);
  const parts = normalizedFormula.split(/(\s+|[=()+\-×/])/g).filter((part) => part.length > 0);
  return (
    <div
      className={`flex flex-wrap items-end gap-x-1.5 gap-y-1 ${
        compact ? "text-sm" : "text-base"
      } ${active ? "text-[var(--kr-gov-text-primary)]" : "text-[var(--kr-gov-text-secondary)]"}`}
      style={{ fontFamily: "\"Times New Roman\", serif" }}
    >
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span aria-hidden="true" className="w-1.5" key={`space-${index}`} />;
        }
        if (/^[=()+\-×/]$/.test(part)) {
          return (
            <span className={active ? "font-bold text-[var(--kr-gov-blue)]" : "font-semibold"} key={`operator-${index}`}>
              {part}
            </span>
          );
        }
        const normalized = part.replace(/^[:;,]+|[:;,]+$/g, "");
        if (!normalized) {
          return <span key={`punctuation-${index}`}>{part}</span>;
        }
        const prefixLength = normalized ? part.indexOf(normalized) : 0;
        const prefix = prefixLength > 0 ? part.slice(0, prefixLength) : "";
        const suffix = part.slice(prefixLength + normalized.length);
        const notation = normalized ? splitFormulaToken(normalized) : null;
        const isHighlighted = normalizedHighlights.includes(normalized.replace(/\s+/g, ""));
        return (
          <span className="inline-flex items-end gap-0.5" key={`token-${index}`}>
            {prefix ? <span>{prefix}</span> : null}
            {notation ? (
              <span
                className={`inline-flex items-end gap-0.5 rounded-md px-1.5 py-0.5 shadow-sm ring-1 ${
                  isHighlighted
                    ? "bg-amber-100 ring-amber-300"
                    : "bg-white/70 ring-black/5"
                }`}
              >
                <span className={`font-semibold tracking-[0.01em] ${isHighlighted ? "text-amber-900" : ""}`}>{notation.head}</span>
                <sub className={`text-[0.72em] font-semibold leading-none ${isHighlighted ? "text-amber-700" : "text-[var(--kr-gov-blue)]"}`}>{notation.sub}</sub>
              </span>
            ) : (
              <span className={isHighlighted ? "rounded bg-amber-100 px-1 text-amber-900" : ""}>{normalized || part}</span>
            )}
            {suffix ? <span>{suffix}</span> : null}
          </span>
        );
      })}
    </div>
  );
}

function findCategoryById(categories: EmissionCategoryItem[], categoryId: number) {
  return categories.find((item) => numberOf(item.categoryId) === categoryId) || null;
}

function readSessionIdFromUrl() {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = new URLSearchParams(window.location.search).get("sessionId") || "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function updateSessionIdInUrl(sessionId: number) {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (sessionId > 0) {
    url.searchParams.set("sessionId", String(sessionId));
  } else {
    url.searchParams.delete("sessionId");
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function EmissionManagementMigrationPage() {
  type ValidationIssue = {
    sectionId: string;
    sectionTitle: string;
    lineNo: number | null;
    inputCode: string;
    variableLabel: string;
    formulaLabel: string;
  };

  const en = isEnglish();
  const [page, setPage] = useState<EmissionManagementPagePayload | null>(null);
  const [categories, setCategories] = useState<EmissionCategoryItem[]>([]);
  const [tiers, setTiers] = useState<EmissionTierItem[]>([]);
  const [variables, setVariables] = useState<EmissionVariableDefinition[]>([]);
  const [factors, setFactors] = useState<EmissionFactorDefinition[]>([]);
  const [inputs, setInputs] = useState<InputMap>({});
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [majorSearchKeyword, setMajorSearchKeyword] = useState("");
  const [subCategorySearchKeyword, setSubCategorySearchKeyword] = useState("");
  const [selectedMajorKey, setSelectedMajorKey] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [selectedTier, setSelectedTier] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<EmissionCategoryItem | null>(null);
  const [formulaSummary, setFormulaSummary] = useState("");
  const [tierGuideMap, setTierGuideMap] = useState<Record<number, TierGuide>>({});
  const [sessionId, setSessionId] = useState(0);
  const [limeDefaultFactor, setLimeDefaultFactor] = useState<Record<string, unknown> | null>(null);
  const [calculationResult, setCalculationResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [tierGuideLoading, setTierGuideLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [pendingValidationFocus, setPendingValidationFocus] = useState<ValidationIssue | null>(null);
  const [activeFormulaStep, setActiveFormulaStep] = useState(0);
  const [focusedFormulaToken, setFocusedFormulaToken] = useState("");
  const [hoveredFormulaToken, setHoveredFormulaToken] = useState("");
  const majorOptions = buildMajorCategoryOptions(categories);
  const filteredMajorOptions = majorOptions.filter((option) => {
    const keyword = majorSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return `${option.majorCode} ${option.majorName}`.toLowerCase().includes(keyword);
  });
  const visibleCategories = categories.filter((category) => {
    const matchesMajor = !selectedMajorKey || majorCategoryKey(category) === selectedMajorKey;
    if (!matchesMajor) {
      return false;
    }
    const keyword = subCategorySearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return true;
    }
    return `${stringOf(category.subCode)} ${stringOf(category.subName)}`.toLowerCase().includes(keyword);
  });
  const selectedMajorOption = majorOptions.find((option) => option.key === selectedMajorKey) || null;
  const visibleVariables = visibleVariablesForStep(selectedCategory, selectedTier, variables);
  const summationGroups = buildSummationGroups(selectedCategory, selectedTier, visibleVariables);
  const variableSections = buildVariableSections(en, selectedCategory, selectedTier, visibleVariables);

  function formulaCodeOf(variable: EmissionVariableDefinition) {
    return documentFormulaText(displayVariableCode(selectedCategory, selectedTier, variable));
  }

  function sectionHighlightedTokens(sectionId: string) {
    const activeSection = variableSections[activeFormulaStep];
    if (!activeSection || activeSection.id !== sectionId) {
      return [];
    }
    const sectionVariables = sectionVariablesFor(sectionId);
    const completedTokens = sectionVariables
      .filter((variable) => {
        const code = variableCodeOf(variable);
        return (inputs[code] || []).some((row, rowIndex) => {
          if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex)) {
            return false;
          }
          return row.value.trim() !== "";
        });
      })
      .map((variable) => formulaCodeOf(variable));
    return Array.from(new Set([hoveredFormulaToken, focusedFormulaToken, ...completedTokens].filter(Boolean)));
  }

  function sectionFormulaMappings(sectionId: string) {
    return sectionVariablesFor(sectionId)
      .map((variable) => ({
        code: formulaCodeOf(variable),
        name: displayVariableName(selectedCategory, selectedTier, variable)
      }))
      .filter((item) => item.code);
  }

  function previewCardForRow(sectionId: string, rowIndex: number) {
    return sectionPreviewCards(sectionId)[rowIndex] || null;
  }

  function previewValueForVariable(variable: EmissionVariableDefinition, rowIndex?: number) {
    const code = variableCodeOf(variable);
    const rawValue = typeof rowIndex === "number"
      ? inputValueAt(code, rowIndex)
      : (inputs[code] || []).map((row) => row.value.trim()).find(Boolean) || "";
    if (isDerivedCarbonateFactorVariable(selectedCategory, selectedTier, variable)) {
      const derivedValue = typeof rowIndex === "number" ? derivedFactorValue(code, rowIndex) : "";
      return derivedValue || (en ? "Calculated from selection" : "선택값 기준 자동계산");
    }
    return optionLabelForValue(variable, rawValue) || rawValue || (en ? "Waiting for input" : "입력 대기");
  }

  function previewLineForVariable(variable: EmissionVariableDefinition, rowIndex?: number) {
    const value = previewValueForVariable(variable, rowIndex);
    const unit = displayUnitLabel(stringOf(variable.unit), en);
    return unit && unit !== "-"
      ? `${displayVariableName(selectedCategory, selectedTier, variable)}: ${value} (${unit})`
      : `${displayVariableName(selectedCategory, selectedTier, variable)}: ${value}`;
  }

  function sectionFactorTokens(sectionId: string) {
    return sectionVariablesFor(sectionId)
      .flatMap((variable) => {
        const formulaCode = formulaCodeOf(variable);
        return [
          stringOf(variable.varCode),
          displayVariableCode(selectedCategory, selectedTier, variable),
          formulaCode
        ];
      })
      .map((token) => stringOf(token).toLowerCase())
      .filter(Boolean);
  }

  function findSummationGroup(varCode: string) {
    const normalizedVarCode = stringOf(varCode).toUpperCase();
    return summationGroups.find((group) => group.includes(normalizedVarCode)) || [normalizedVarCode];
  }

  function findVariableByCode(varCode: string) {
    const normalizedVarCode = stringOf(varCode).toUpperCase();
    return visibleVariables.find((item) => variableCodeOf(item) === normalizedVarCode) || null;
  }

  function repeatGroupAnchorCode(varCode: string) {
    return findSummationGroup(varCode)[0] || stringOf(varCode).toUpperCase();
  }

  function inputValueAt(varCode: string, rowIndex: number) {
    return inputs[stringOf(varCode).toUpperCase()]?.[rowIndex]?.value || "";
  }

  function optionLabelForValue(variable: EmissionVariableDefinition | null, value: string) {
    if (!variable || !value) {
      return "";
    }
    return variableOptions(variable, value).find((option) => option.code === value)?.label || value;
  }

  function rowContextSummary(varCode: string, rowIndex: number) {
    const anchorCode = repeatGroupAnchorCode(varCode);
    const anchorVariable = findVariableByCode(anchorCode);
    const anchorValue = inputValueAt(anchorCode, rowIndex);
    const anchorLabel = optionLabelForValue(anchorVariable, anchorValue) || anchorValue;
    const anchorTitle = anchorVariable
      ? displayVariableName(selectedCategory, selectedTier, anchorVariable)
      : (en ? "selected item" : "선택 항목");
    if (!anchorLabel) {
      return en
        ? `Line ${rowIndex + 1}: select ${anchorTitle} first`
        : `라인 ${rowIndex + 1}: ${anchorTitle}을 먼저 선택하세요`;
    }
    return en
      ? `Line ${rowIndex + 1}: ${anchorTitle} = ${anchorLabel}`
      : `라인 ${rowIndex + 1}: ${anchorTitle} = ${anchorLabel}`;
  }

  function repeatableSectionRowCount(sectionVariables: EmissionVariableDefinition[]) {
    return Math.max(
      1,
      ...sectionVariables.map((variable) => {
        const code = variableCodeOf(variable);
        return (inputs[code] || [DEFAULT_INPUT_ROW]).length;
      })
    );
  }

  function sectionVariablesFor(sectionId: string) {
    return variableSections
      .find((section) => section.id === sectionId)
      ?.codes.map((code) => visibleVariables.find((variable) => variableCodeOf(variable) === code))
      .filter((variable): variable is EmissionVariableDefinition => Boolean(variable))
      .filter((variable) => shouldShowLimeTier2Variable(selectedCategory, selectedTier, inputs, variableCodeOf(variable))) || [];
  }

  function sectionForVariableCode(code: string) {
    return variableSections.find((section) => section.codes.includes(code)) || null;
  }

  function validationInputId(sectionId: string, code: string, lineNo?: number | null) {
    const safeSectionId = stringOf(sectionId).replace(/[^a-zA-Z0-9_-]/g, "-");
    const safeCode = stringOf(code).replace(/[^a-zA-Z0-9_-]/g, "-");
    return `validation-input-${safeSectionId}-${safeCode}-${lineNo ?? "single"}`;
  }

  function sectionCompletion(sectionId: string) {
    const sectionVariables = sectionVariablesFor(sectionId);
    const requiredVariables = sectionVariables.filter((variable) => isRequiredVariable(variable));
    if (requiredVariables.length === 0) {
      return { complete: false, filled: 0, total: 0 };
    }
    let filled = 0;
    requiredVariables.forEach((variable) => {
      const code = variableCodeOf(variable);
      const rows = inputs[code] || [DEFAULT_INPUT_ROW];
      const hasValue = rows.some((row, rowIndex) => {
        if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex)) {
          return true;
        }
        return row.value.trim() !== "";
      });
      if (hasValue) {
        filled += 1;
      }
    });
    return { complete: filled === requiredVariables.length, filled, total: requiredVariables.length };
  }

  function sectionPreviewCards(sectionId: string) {
    const sectionVariables = sectionVariablesFor(sectionId);
    if (sectionVariables.length > 0 && sectionVariables.every((variable) => isRepeatableVariable(variable))) {
      const anchorCode = variableCodeOf(sectionVariables[0]);
      return Array.from({ length: repeatableSectionRowCount(sectionVariables) }, (_, rowIndex) => ({
        title: `${en ? "Line" : "라인"} ${rowIndex + 1}`,
        emphasis: rowContextSummary(anchorCode, rowIndex),
        lines: sectionVariables.map((variable) => previewLineForVariable(variable, rowIndex))
      }));
    }
    return sectionVariables.map((variable) => {
      const formulaCode = formulaCodeOf(variable);
      return {
        title: displayVariableName(selectedCategory, selectedTier, variable),
        emphasis: previewValueForVariable(variable),
        lines: [
          formulaCode ? `${en ? "Formula term" : "수식 항"}: ${formulaCode}` : "",
          displayUnitLabel(stringOf(variable.unit), en) !== "-" ? `${en ? "Unit" : "단위"}: ${displayUnitLabel(stringOf(variable.unit), en)}` : ""
        ].filter(Boolean)
      };
    });
  }

  function factorCardsForSection(sectionId: string) {
    const section = variableSections.find((item) => item.id === sectionId);
    const explicitFactorCodes = stringOf(section?.relatedFactorCodes)
      .split(",")
      .map((code) => stringOf(code).trim().toUpperCase())
      .filter(Boolean);
    if (explicitFactorCodes.length > 0) {
      const explicitMatches = factors.filter((factor) => explicitFactorCodes.includes(stringOf(factor.factorCode).toUpperCase()));
      if (explicitMatches.length > 0) {
        return explicitMatches;
      }
    }
    const sectionTokens = sectionFactorTokens(sectionId);
    const matchedFactors = factors.filter((factor) => {
      const token = `${stringOf(factor.factorCode)} ${stringOf(factor.factorName)} ${stringOf(factor.remark)}`.toLowerCase();
      return sectionTokens.some((sectionToken) => sectionToken && token.includes(sectionToken));
    });
    return matchedFactors.length > 0 ? matchedFactors : factors;
  }

  function derivedPreviewCards(section: (typeof variableSections)[number]) {
    const previewType = stringOf(section.previewType);
    if (!previewType) {
      return [];
    }
    if (previewType === "cement-tier2-cf" && isCementTier2Scope(selectedCategory, selectedTier)) {
      const preview = cementTier2DerivedSummary(en, inputs);
      return [{
        title: en ? "Tier 2 correction preview" : "Tier 2 보정계수 미리보기",
        lines: [preview.efcText, preview.efclText, preview.cfckdText],
        emphasis: preview.totalText
      }];
    }
    if (!isLimeTier2Scope(selectedCategory, selectedTier)) {
      return [];
    }
    return (inputs.MLI || [DEFAULT_INPUT_ROW]).map((_, rowIndex) => {
      const preview = limeTier2DerivedSummary(en, inputs, rowIndex);
      if (previewType === "lime-tier2-ef") {
        return {
          title: `${en ? "Line" : "라인"} ${rowIndex + 1}`,
          lines: [preview.efAText, preview.efBText, preview.efCText],
          emphasis: preview.efText
        };
      }
      if (previewType === "lime-tier2-cf") {
        return {
          title: `${en ? "Line" : "라인"} ${rowIndex + 1}`,
          lines: [],
          emphasis: preview.cfText
        };
      }
      if (previewType === "lime-tier2-ch") {
        return {
          title: `${en ? "Line" : "라인"} ${rowIndex + 1}`,
          lines: [],
          emphasis: preview.chText
        };
      }
      return null;
    }).filter((item): item is { title: string; lines: string[]; emphasis: string } => Boolean(item));
  }

  function activeSectionPreviewCards() {
    const activeSection = variableSections[activeFormulaStep];
    if (!activeSection) {
      return [];
    }
    return sectionPreviewCards(activeSection.id);
  }

  function moveFormulaStep(direction: "prev" | "next") {
    setActiveFormulaStep((current) => {
      if (direction === "prev") {
        return Math.max(0, current - 1);
      }
      return Math.min(variableSections.length - 1, current + 1);
    });
  }

  function renderFormulaSection(section: (typeof variableSections)[number], sectionIndex: number) {
    const sectionVariables = section.codes
      .map((code) => visibleVariables.find((variable) => variableCodeOf(variable) === code))
      .filter((variable): variable is EmissionVariableDefinition => Boolean(variable))
      .filter((variable) => shouldShowLimeTier2Variable(selectedCategory, selectedTier, inputs, variableCodeOf(variable)));
    if (sectionVariables.length === 0) {
      return null;
    }
    const activeSection = sectionIndex === activeFormulaStep;
    const completion = sectionCompletion(section.id);
    const previewCards = sectionPreviewCards(section.id);
    return (
      <section
        className={`rounded-[var(--kr-gov-radius)] border px-4 py-4 transition ${
          activeSection ? "border-[var(--kr-gov-blue)] bg-slate-50" : "border-[var(--kr-gov-border-light)] bg-slate-100/70 opacity-60"
        }`}
        id={`formula-section-${section.id}`}
        key={section.id}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[var(--kr-gov-text-primary)]">{sectionIndex + 1}. {section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{section.description}</p>
            {section.formula ? (
              <div className="mt-3">
                <FormulaNotation active={activeSection} compact formula={section.formula} highlightedTokens={sectionHighlightedTokens(section.id)} />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeSection ? "bg-blue-100 text-[var(--kr-gov-blue)]" : "bg-white text-slate-600"}`}>
              {activeSection ? (en ? "Active block" : "활성 블록") : (en ? "Inactive" : "비활성")}
            </span>
            {completion.total > 0 ? (
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${completion.complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {completion.filled}/{completion.total} {en ? "required" : "필수"}
              </span>
            ) : null}
          </div>
        </div>
        {!activeSection ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3">
              <p className="text-sm text-[var(--kr-gov-text-primary)]">
                {completion.complete ? (en ? "This block has the required inputs." : "이 블록은 필수 입력이 완료되었습니다.") : (en ? "Open this block to continue the formula." : "이 블록을 열어 수식을 이어서 입력하세요.")}
              </p>
            </div>
            {previewCards.length > 0 ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">
                    {en ? "Step preview" : "스텝 미리보기"}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {en ? "Read only" : "읽기 전용"}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {previewCards.slice(0, 2).map((previewCard) => (
                    <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-3" key={`${section.id}-inactive-preview-${previewCard.title}`}>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{previewCard.title}</p>
                      <p className="mt-1 text-sm font-black text-[var(--kr-gov-blue)]">{previewCard.emphasis}</p>
                    </div>
                  ))}
                  {previewCards.length > 2 ? (
                    <p className="text-xs text-[var(--kr-gov-text-secondary)]">
                      {en ? `+ ${previewCards.length - 2} more preview item(s) inside this step` : `이 스텝 안에 미리보기 ${previewCards.length - 2}건이 더 있습니다.`}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeSection && previewCards.length > 0 ? (
          <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Calculated result under current formula" : "현재 수식 바로 아래 계산 결과"}</p>
            <div className="mt-3 space-y-2">
              {previewCards.map((previewCard) => (
                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-3" key={`${section.id}-inline-${previewCard.title}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{previewCard.title}</p>
                  <p className="mt-1 text-sm font-black text-[var(--kr-gov-blue)]">{previewCard.emphasis}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {activeSection && derivedPreviewCards(section).length > 0 ? (
          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-dashed border-blue-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Derived factor preview" : "파생계수 계산 미리보기"}</p>
            <div className="mt-2 space-y-2 text-sm text-[var(--kr-gov-text-primary)]">
              {derivedPreviewCards(section).map((previewCard) => {
                return (
                  <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-3" key={`${section.id}-${previewCard.title}`}>
                    <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{previewCard.title}</p>
                    {previewCard.lines.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {previewCard.lines.map((line) => (
                          <p key={`${section.id}-${previewCard.title}-${line}`}>{line}</p>
                        ))}
                        <p className="font-bold text-[var(--kr-gov-blue)]">{previewCard.emphasis}</p>
                      </div>
                    ) : (
                      <p className="mt-1">{previewCard.emphasis}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {activeSection ? (
          <>
            <div className="mt-4 space-y-4">
              {sectionVariables.every((variable) => isRepeatableVariable(variable)) ? (
                <section className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Row-based input sheet" : "행 기준 입력 시트"}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">
                        {en ? "Enter one target per row and complete the formula block on one screen." : "한 행을 한 대상 기준으로 입력하고 이 블록을 한 화면에서 완성합니다."}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.from({ length: repeatableSectionRowCount(sectionVariables) }, (_, rowIndex) => (
                        <button
                          className="rounded-full border border-[var(--kr-gov-border-light)] bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-text-secondary)] transition hover:border-[var(--kr-gov-blue)] hover:text-[var(--kr-gov-blue)]"
                          key={`${section.id}-jump-${rowIndex + 1}`}
                          onClick={() => {
                            document.getElementById(`${section.id}-row-${rowIndex + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          type="button"
                        >
                          {en ? "Line" : "라인"} {rowIndex + 1}
                        </button>
                      ))}
                      <MemberButton onClick={() => addInputRow(variableCodeOf(sectionVariables[0]))} type="button" variant="secondary">
                        {en ? "Add row" : "행 추가"}
                      </MemberButton>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th className="sticky left-0 z-10 border-b border-[var(--kr-gov-border-light)] bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Line" : "라인"}</th>
                          <th className="sticky left-[88px] z-10 min-w-[260px] border-b border-[var(--kr-gov-border-light)] bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Current target" : "현재 입력 대상"}</th>
                          {sectionVariables.map((variable) => (
                            <th
                              className={`min-w-[220px] border-b px-4 py-3 text-left align-top ${
                                supportsFallbackInput(variable)
                                  ? "border-amber-200 bg-amber-50/60"
                                  : "border-[var(--kr-gov-border-light)] bg-white"
                              }`}
                              key={`${section.id}-${stringOf(variable.varCode)}-header`}
                            >
                              <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{displayVariableName(selectedCategory, selectedTier, variable)}</p>
                              {formulaCodeOf(variable) ? (
                                <div className="mt-2">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Formula term" : "수식 항"}</p>
                                  <div className="mt-1">
                                    <div onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))} onMouseLeave={() => setHoveredFormulaToken("")}>
                                      <FormulaNotation compact formula={formulaCodeOf(variable)} highlightedTokens={sectionHighlightedTokens(section.id)} />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                              <p className="mt-1 text-xs font-bold text-[var(--kr-gov-blue)]">{displayUnitLabel(stringOf(variable.unit), en)}</p>
                              {supportsFallbackInput(variable) ? (
                                <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                  {en ? "Default-capable" : "기본 계수 사용 가능"}
                                </p>
                              ) : null}
                              {stringOf(variable.varDesc) ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{stringOf(variable.varDesc)}</p> : null}
                              {limeTier2VariableHint(en, selectedCategory, selectedTier, variable) ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{limeTier2VariableHint(en, selectedCategory, selectedTier, variable)}</p> : null}
                            </th>
                          ))}
                          <th className="border-b border-[var(--kr-gov-border-light)] bg-white px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Action" : "작업"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: repeatableSectionRowCount(sectionVariables) }, (_, rowIndex) => {
                          const rowPreview = previewCardForRow(section.id, rowIndex);
                          return (
                            <Fragment key={`${section.id}-row-group-${rowIndex + 1}`}>
                              <tr className="align-top" id={`${section.id}-row-${rowIndex + 1}`}>
                                <td className="sticky left-0 z-[1] border-b border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                                  <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-3 py-2 text-sm font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Line" : "라인"} {rowIndex + 1}</div>
                                </td>
                                <td className="sticky left-[88px] z-[1] min-w-[260px] border-b border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                                  <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-3 py-3">
                                    <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{rowContextSummary(variableCodeOf(sectionVariables[0]), rowIndex)}</p>
                                    <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{en ? "Use this target context for every value in the same row." : "같은 행의 모든 값은 이 대상 기준으로 입력합니다."}</p>
                                  </div>
                                </td>
                                {sectionVariables.map((variable) => {
                                  const code = stringOf(variable.varCode);
                                  const row = inputs[code]?.[rowIndex] || { lineNo: rowIndex + 1, value: "" };
                                  const inputType = stringOf(variable.inputType).toUpperCase();
                                  const disabledByLimeTier2 = isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex);
                                  return (
                                    <td className="border-b border-[var(--kr-gov-border-light)] px-4 py-4" key={`${section.id}-${code}-row-${rowIndex + 1}`}>
                                      <div className="space-y-2">
                                        {arrayOf(variable.options).length > 0 ? (
                                          <AdminSelect
                                            className={validationInputClass(section.id, code, rowIndex + 1)}
                                            disabled={disabledByLimeTier2}
                                            id={validationInputId(section.id, code, rowIndex + 1)}
                                            onChange={(event) => updateInput(code, rowIndex, event.target.value)}
                                            onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))}
                                            onMouseLeave={() => setHoveredFormulaToken("")}
                                            onFocus={() => setFocusedFormulaToken(formulaCodeOf(variable))}
                                            value={row.value}
                                          >
                                            <option value="">{en ? "Select option" : "선택"}</option>
                                            {variableOptions(variable, row.value).map((option) => (
                                              <option key={`${code}-${rowIndex + 1}-${option.code}`} value={option.code}>{option.label}</option>
                                            ))}
                                          </AdminSelect>
                                        ) : (
                                          <AdminInput
                                            className={validationInputClass(section.id, code, rowIndex + 1)}
                                            disabled={disabledByLimeTier2}
                                            id={validationInputId(section.id, code, rowIndex + 1)}
                                            onChange={(event) => updateInput(code, rowIndex, event.target.value)}
                                            onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))}
                                            onMouseLeave={() => setHoveredFormulaToken("")}
                                            onFocus={() => setFocusedFormulaToken(formulaCodeOf(variable))}
                                            placeholder={tier2FieldPlaceholder(en, selectedCategory, selectedTier, inputs, code, rowIndex, stringOf(variable.unit))}
                                            step={inputType === "NUMBER" ? "any" : undefined}
                                            type={inputType === "NUMBER" ? "number" : "text"}
                                            value={disabledByLimeTier2 ? "" : row.value}
                                          />
                                        )}
                                        {shouldShowDirectInputWarning(variable, rowIndex) ? (
                                          <p className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">
                                            {en ? "Direct input required. This field is not supplemented automatically." : "직접 입력 필요. 이 항목은 자동 보완되지 않습니다."}
                                          </p>
                                        ) : null}
                                        {validationMessage(section.id, code, rowIndex + 1) ? (
                                          <p className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">
                                            {validationMessage(section.id, code, rowIndex + 1)}
                                          </p>
                                        ) : null}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="border-b border-[var(--kr-gov-border-light)] px-4 py-4">
                                  <MemberButton onClick={() => removeInputRow(variableCodeOf(sectionVariables[0]), rowIndex)} type="button" variant="secondary">
                                    {en ? "Remove" : "삭제"}
                                  </MemberButton>
                                </td>
                              </tr>
                              {rowPreview ? (
                                <tr className="bg-blue-50/55">
                                  <td className="border-b border-[var(--kr-gov-border-light)] px-4 py-0" />
                                  <td className="border-b border-[var(--kr-gov-border-light)] px-4 py-0" colSpan={sectionVariables.length + 2}>
                                    <div className="mx-4 mb-4 -mt-1 rounded-[var(--kr-gov-radius)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-4 py-3 shadow-[inset_4px_0_0_0_var(--kr-gov-blue)]">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">
                                          {en ? "Line result" : "행 결과"} · {rowPreview.title}
                                        </p>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                                          {en ? "Live preview" : "실시간 반영"}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-sm font-black leading-5 text-[var(--kr-gov-blue)]">{rowPreview.emphasis}</p>
                                      {rowPreview.lines.length > 0 ? (
                                        <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs leading-5 text-[var(--kr-gov-text-secondary)] xl:grid-cols-2">
                                          {rowPreview.lines.map((line) => (
                                            <p className="rounded-[var(--kr-gov-radius)] bg-white/80 px-3 py-2" key={`${section.id}-${rowPreview.title}-${line}`}>{line}</p>
                                          ))}
                                        </div>
                                      ) : null}
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                sectionVariables.map((variable) => {
                  const code = variableCodeOf(variable);
                  const inputType = stringOf(variable.inputType).toUpperCase();
                  const rows = inputs[code] || [DEFAULT_INPUT_ROW];
                  const derivedFactorVariable = isDerivedCarbonateFactorVariable(selectedCategory, selectedTier, variable);
                  const limeTier2SupplementalVariable = isLimeTier2SupplementalVariable(selectedCategory, selectedTier, variable);
                  const limeTier2Hint = limeTier2VariableHint(en, selectedCategory, selectedTier, variable);
                  return (
                    <section
                      className={`rounded-[var(--kr-gov-radius)] border px-4 py-4 ${
                        supportsFallbackInput(variable)
                          ? "border-amber-200 bg-amber-50/60"
                          : "border-[var(--kr-gov-border-light)] bg-white"
                      }`}
                      key={code}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black">{displayVariableName(selectedCategory, selectedTier, variable)}</h3>
                          {formulaCodeOf(variable) ? (
                            <div className="mt-2">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Formula term" : "수식 항"}</p>
                              <div className="mt-1">
                                <div onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))} onMouseLeave={() => setHoveredFormulaToken("")}>
                                  <FormulaNotation compact formula={formulaCodeOf(variable)} highlightedTokens={sectionHighlightedTokens(section.id)} />
                                </div>
                              </div>
                            </div>
                          ) : null}
                          <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayUnitLabel(stringOf(variable.unit), en)}</p>
                          {supportsFallbackInput(variable) ? (
                            <p className="mt-2 text-xs leading-5 text-amber-700">
                              {en ? "If this value is omitted, a defined default coefficient or mapped fallback may be used." : "이 값이 없으면 정의된 기본 계수 또는 매핑 fallback 값이 적용될 수 있습니다."}
                            </p>
                          ) : null}
                          {limeTier2Hint ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{limeTier2Hint}</p> : null}
                        </div>
                        <div className="flex items-center gap-2">
                          {limeTier2SupplementalVariable ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{en ? "Tier 2 only" : "Tier 2 전용"}</span> : null}
                          {isRepeatableVariable(variable) ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">{en ? "Summation variable" : "Summation 변수"}</span> : null}
                          {derivedFactorVariable ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">{en ? "Auto from carbonate type" : "탄산염 종류 자동 반영"}</span> : null}
                          {isRepeatableVariable(variable) ? (
                            <MemberButton onClick={() => addInputRow(code)} type="button" variant="secondary">
                              {en ? "Add row" : "행 추가"}
                            </MemberButton>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {rows.map((row, rowIndex) => {
                          const disabledByLimeTier2 = isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex);
                          const rowPreview = previewCardForRow(section.id, rowIndex);
                          return (
                            <Fragment key={`${code}-${row.lineNo}`}>
                              <div className="grid grid-cols-[96px_1fr_auto] items-end gap-3">
                                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-2 text-sm font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Line" : "라인"} {row.lineNo}</div>
                                <label className="flex flex-col gap-2">
                                  <span className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">
                                    {derivedFactorVariable ? (en ? "AUTO" : "자동계산") : arrayOf(variable.options).length > 0 ? (en ? "SELECT" : "선택형") : (stringOf(variable.inputType) || "TEXT")}
                                  </span>
                                  {derivedFactorVariable ? (
                                    <AdminInput placeholder={en ? "Select carbonate type first" : "먼저 탄산염 종류를 선택하세요"} readOnly type="number" value={derivedFactorValue(code, rowIndex)} />
                                  ) : arrayOf(variable.options).length > 0 ? (
                                    <AdminSelect
                                      className={validationInputClass(section.id, code, row.lineNo)}
                                      disabled={disabledByLimeTier2}
                                      id={validationInputId(section.id, code, row.lineNo)}
                                      onChange={(event) => updateInput(code, rowIndex, event.target.value)}
                                      onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))}
                                      onMouseLeave={() => setHoveredFormulaToken("")}
                                      onFocus={() => setFocusedFormulaToken(formulaCodeOf(variable))}
                                      value={row.value}
                                    >
                                      <option value="">{en ? "Select option" : "선택"}</option>
                                      {variableOptions(variable, row.value).map((option) => (
                                        <option key={`${code}-${option.code}`} value={option.code}>{option.label}</option>
                                      ))}
                                    </AdminSelect>
                                  ) : (
                                    <AdminInput
                                      className={validationInputClass(section.id, code, row.lineNo)}
                                      disabled={disabledByLimeTier2}
                                      id={validationInputId(section.id, code, row.lineNo)}
                                      onChange={(event) => updateInput(code, rowIndex, event.target.value)}
                                      onMouseEnter={() => setHoveredFormulaToken(formulaCodeOf(variable))}
                                      onMouseLeave={() => setHoveredFormulaToken("")}
                                      onFocus={() => setFocusedFormulaToken(formulaCodeOf(variable))}
                                      placeholder={tier2FieldPlaceholder(en, selectedCategory, selectedTier, inputs, code, rowIndex, stringOf(variable.unit))}
                                      step={inputType === "NUMBER" ? "any" : undefined}
                                      type={inputType === "NUMBER" ? "number" : "text"}
                                      value={disabledByLimeTier2 ? "" : row.value}
                                    />
                                  )}
                                  {shouldShowDirectInputWarning(variable, rowIndex) ? (
                                    <span className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">
                                      {en ? "Direct input required. This field is not supplemented automatically." : "직접 입력 필요. 이 항목은 자동 보완되지 않습니다."}
                                    </span>
                                  ) : null}
                                  {validationMessage(section.id, code, row.lineNo) ? (
                                    <span className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">
                                      {validationMessage(section.id, code, row.lineNo)}
                                    </span>
                                  ) : null}
                                </label>
                                <div className="flex flex-col items-end gap-2">
                                  {isRepeatableVariable(variable) ? (
                                    <MemberButton onClick={() => removeInputRow(code, rowIndex)} type="button" variant="secondary">
                                      {en ? "Remove" : "삭제"}
                                    </MemberButton>
                                  ) : <span />}
                                </div>
                              </div>
                              {rowPreview ? (
                                <div className="ml-[96px] mt-2 rounded-[var(--kr-gov-radius)] border border-sky-200 bg-gradient-to-r from-sky-50 to-white px-4 py-3 shadow-[inset_4px_0_0_0_var(--kr-gov-blue)]">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">
                                      {en ? "Line result" : "행 결과"} · {rowPreview.title}
                                    </p>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                                      {en ? "Live preview" : "실시간 반영"}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm font-black leading-5 text-[var(--kr-gov-blue)]">{rowPreview.emphasis}</p>
                                  {rowPreview.lines.length > 0 ? (
                                    <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs leading-5 text-[var(--kr-gov-text-secondary)] md:grid-cols-2">
                                      {rowPreview.lines.map((line) => (
                                        <p className="rounded-[var(--kr-gov-radius)] bg-white/80 px-3 py-2" key={`${section.id}-${rowPreview.title}-${line}`}>{line}</p>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </Fragment>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
            {variableSections.length > 0 ? (
              <div className="sticky bottom-4 z-20 mt-6">
                <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Quick block navigation" : "빠른 블록 이동"}</p>
                      <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">
                        {en
                          ? `${activeFormulaStep + 1} / ${variableSections.length} active. Move without scrolling back to the top.`
                          : `${activeFormulaStep + 1} / ${variableSections.length} 블록 활성 상태입니다. 상단으로 돌아가지 않고 이동할 수 있습니다.`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MemberButton
                        disabled={activeFormulaStep <= 0}
                        onClick={() => moveFormulaStep("prev")}
                        type="button"
                        variant="secondary"
                      >
                        {en ? "Prev" : "이전"}
                      </MemberButton>
                      <MemberButton
                        disabled={activeFormulaStep >= variableSections.length - 1}
                        onClick={() => moveFormulaStep("next")}
                        type="button"
                        variant="secondary"
                      >
                        {en ? "Next" : "다음"}
                      </MemberButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Immediate formula preview" : "즉시 계산 미리보기"}</p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {en ? "This block updates immediately as values are entered." : "이 블록은 값이 입력될 때마다 즉시 갱신됩니다."}
                </p>
                <div className="mt-3 space-y-3">
                  {previewCards.map((previewCard) => (
                    <article className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3" key={`${section.id}-${previewCard.title}`}>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{previewCard.title}</p>
                      <p className="mt-2 text-sm font-black text-[var(--kr-gov-text-primary)]">{previewCard.emphasis}</p>
                      {previewCard.lines.length > 0 ? (
                        <div className="mt-2 space-y-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">
                          {previewCard.lines.map((line) => (
                            <p key={`${section.id}-${previewCard.title}-${line}`}>{line}</p>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                  {previewCards.length === 0 ? (
                    <article className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3">
                      <p className="text-sm text-[var(--kr-gov-text-secondary)]">
                        {en ? "Preview will appear as soon as this formula block has enough input values." : "이 수식 블록에 필요한 값이 입력되면 여기에 미리보기 계산식이 표시됩니다."}
                      </p>
                    </article>
                  ) : null}
                </div>
              </section>
              <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Related factors and references" : "연관 계수 및 기준값"}</p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {en ? "Keep the active formula block and related coefficients on the same screen." : "활성 수식 블록과 연관 계수를 같은 화면에서 확인합니다."}
                </p>
                <div className="mt-3 space-y-3">
                  {selectedCategory && stringOf(selectedCategory.subCode).toUpperCase() === "LIME" && limeDefaultFactor ? (
                    <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{en ? "Lime default factor" : "석회 기본 계수"}</p>
                      <p className="mt-2 text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(limeDefaultFactor.factorValue)} {displayUnitLabel(stringOf(limeDefaultFactor.unit), en)}</p>
                    </div>
                  ) : null}
                  {factorCardsForSection(section.id).map((factor) => (
                    <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3" key={`${section.id}-${stringOf(factor.factorCode)}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(factor.factorName) || stringOf(factor.factorCode)}</p>
                          <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayUnitLabel(stringOf(factor.unit), en)}</p>
                        </div>
                        <p className="text-sm font-black text-[var(--kr-gov-blue)]">{stringOf(factor.factorValue)}</p>
                      </div>
                      {stringOf(factor.remark) ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{stringOf(factor.remark)}</p> : null}
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </section>
    );
  }

  function resetSelectionState() {
    setSelectedTier(0);
    setWizardStep(1);
    setActiveFormulaStep(0);
    setVariables([]);
    setFactors([]);
    setInputs({});
    setFormulaSummary("");
    setCalculationResult(null);
    setSessionId(0);
    setValidationIssues([]);
    setPendingValidationFocus(null);
    updateSessionIdInUrl(0);
  }

  function resetCurrentDraft() {
    setInputs(buildEmptyInputs(variables));
    setCalculationResult(null);
    setSessionId(0);
    setActiveFormulaStep(0);
    setFocusedFormulaToken("");
    setHoveredFormulaToken("");
    setError("");
    setWarning("");
    setValidationIssues([]);
    setPendingValidationFocus(null);
    setMessage(en ? "Current draft has been reset." : "현재 입력 초안을 초기화했습니다.");
    updateSessionIdInUrl(0);
  }

  function applyRowChange(varCode: string, updater: (rows: InputRow[]) => InputRow[]) {
    setInputs((current) => {
      const next = { ...current };
      findSummationGroup(varCode).forEach((code) => {
        next[code] = updater(current[code] || [DEFAULT_INPUT_ROW]);
      });
      return next;
    });
  }

  async function loadCategories() {
    const response = await fetchEmissionCategories("");
    const nextCategories = response.items || [];
    setCategories(nextCategories);
    if (!selectedCategoryId && nextCategories.length === 1) {
      const nextCategory = nextCategories[0];
      const nextCategoryId = numberOf(nextCategory.categoryId);
      if (nextCategoryId > 0) {
        setSelectedMajorKey(majorCategoryKey(nextCategory));
        await handleCategoryChange(nextCategoryId, nextCategories);
      }
    }
  }

  async function loadDefinitions(categoryId: number, tier: number, existingValues?: Array<Record<string, unknown>>, existingResult?: Record<string, unknown> | null) {
    setDefinitionLoading(true);
    try {
      const response = await fetchEmissionVariableDefinitions(categoryId, tier);
      const nextGuide = buildTierGuide(response.variables || [], response.formulaSummary, response.formulaDisplay);
      const nextVariables = nextGuide.variables;
      setVariables(nextVariables);
      setFactors(response.factors || []);
      setFormulaSummary(nextGuide.formulaSummary);
      setInputs(existingValues ? hydrateInputs(nextVariables, existingValues) : buildEmptyInputs(nextVariables));
      setCalculationResult(existingResult || null);
    } finally {
      setDefinitionLoading(false);
    }
  }

  async function loadTierGuides(categoryId: number, tierItems: EmissionTierItem[]) {
    if (categoryId <= 0 || tierItems.length === 0) {
      setTierGuideMap({});
      return;
    }
    setTierGuideLoading(true);
    try {
      const results = await Promise.allSettled(
        tierItems.map(async (tierItem) => {
          const tierNumber = numberOf(tierItem.tier);
          const response = await fetchEmissionVariableDefinitions(categoryId, tierNumber);
          return {
            tier: tierNumber,
            guide: buildTierGuide(response.variables || [], response.formulaSummary, response.formulaDisplay)
          };
        })
      );
      const nextGuideMap: Record<number, TierGuide> = {};
      results.forEach((result) => {
        if (result.status !== "fulfilled") {
          return;
        }
        nextGuideMap[result.value.tier] = result.value.guide;
      });
      setTierGuideMap(nextGuideMap);
    } finally {
      setTierGuideLoading(false);
    }
  }

  async function handleCategoryChange(categoryId: number, sourceCategories?: EmissionCategoryItem[]) {
    setSelectedCategoryId(categoryId);
    resetSelectionState();
    setTierGuideMap({});
    setWarning("");
    const nextCategory = findCategoryById(sourceCategories || categories, categoryId);
    setSelectedCategory(nextCategory);
    setSelectedMajorKey(majorCategoryKey(nextCategory));
    if (categoryId <= 0) {
      setTiers([]);
      return;
    }
    const response = await fetchEmissionTiers(categoryId);
    setSelectedCategory((response.category as EmissionCategoryItem) || nextCategory);
    const nextTiers = response.tiers || [];
    setTiers(nextTiers);
    setWarning(stringOf(response.warning));
    await loadTierGuides(categoryId, nextTiers);
  }

  async function handleTierChange(tier: number) {
    setSelectedTier(tier);
    resetSelectionState();
    setSelectedTier(tier);
  }

  async function restoreSession(targetSessionId: number) {
    if (targetSessionId <= 0) {
      return;
    }
    const response = await fetchEmissionInputSession(targetSessionId);
    const session = (response.session || {}) as Record<string, unknown>;
    const existingValues = (response.values || []) as Array<Record<string, unknown>>;
    const existingResult = (response.result || null) as Record<string, unknown> | null;
    const categoryId = numberOf(session.categoryId);
    const tier = numberOf(session.tier);
    setSessionId(targetSessionId);
    setWizardStep(2);
    updateSessionIdInUrl(targetSessionId);
    setSelectedCategoryId(categoryId);
    setSelectedTier(tier);
    const tiersResponse = await fetchEmissionTiers(categoryId);
    const restoredCategory = (tiersResponse.category as EmissionCategoryItem) || null;
    setSelectedCategory(restoredCategory);
    setSelectedMajorKey(majorCategoryKey(restoredCategory));
    setTiers(tiersResponse.tiers || []);
    setWarning(stringOf(tiersResponse.warning));
    await loadDefinitions(categoryId, tier, existingValues, existingResult);
  }

  async function proceedToInputStep() {
    if (selectedCategoryId <= 0) {
      setError(en ? "Select a major and subcategory first." : "대분류와 중분류를 먼저 선택하세요.");
      return;
    }
    if (selectedTier <= 0) {
      setError(en ? "Select a tier first." : "Tier를 먼저 선택하세요.");
      return;
    }
    setError("");
    setWarning("");
    setMessage("");
    await loadDefinitions(selectedCategoryId, selectedTier);
    setWizardStep(2);
  }

  function updateInput(varCode: string, rowIndex: number, value: string) {
    if (validationIssues.length > 0 || warning) {
      setWarning("");
      setValidationIssues([]);
      setPendingValidationFocus(null);
    }
    setInputs((current) => {
      const rows = (current[varCode] || []).slice();
      if (!rows[rowIndex]) {
        rows[rowIndex] = { lineNo: rowIndex + 1, value: "" };
      }
      rows[rowIndex] = { ...rows[rowIndex], value };
      return { ...current, [varCode]: rows };
    });
  }

  function addInputRow(varCode: string) {
    if (validationIssues.length > 0 || warning) {
      setWarning("");
      setValidationIssues([]);
      setPendingValidationFocus(null);
    }
    applyRowChange(varCode, (rows) => syncLineNumbers([...rows, { lineNo: rows.length + 1, value: "" }]));
  }

  function removeInputRow(varCode: string, rowIndex: number) {
    if (validationIssues.length > 0 || warning) {
      setWarning("");
      setValidationIssues([]);
      setPendingValidationFocus(null);
    }
    applyRowChange(varCode, (rows) => alignedRowsForRemoval(rows, rowIndex));
  }

  function serializeInputs() {
    return variables.reduce<EmissionInputValuePayload[]>((collected, variable) => {
      const code = stringOf(variable.varCode);
      if (isDerivedCarbonateFactorVariable(selectedCategory, selectedTier, variable)) {
        return collected;
      }
      const inputType = stringOf(variable.inputType).toUpperCase();
      (inputs[code] || []).forEach((row) => {
        if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, row.lineNo - 1)) {
          return;
        }
        const trimmed = row.value.trim();
        if (!trimmed) {
          return;
        }
        if (inputType === "NUMBER") {
          const valueNum = Number(trimmed);
          if (!Number.isFinite(valueNum)) {
            return;
          }
          collected.push({ varCode: code, lineNo: row.lineNo, valueNum, valueText: "" });
          return;
        }
        collected.push({ varCode: code, lineNo: row.lineNo, valueNum: null, valueText: trimmed });
      });
      return collected;
    }, []);
  }

  function derivedFactorValue(varCode: string, rowIndex: number) {
    const normalizedCode = stringOf(varCode).toUpperCase();
    if (normalizedCode === "EFI") {
      return carbonateFactorOf(inputs.CARBONATE_TYPE?.[rowIndex]?.value || "");
    }
    if (normalizedCode === "EFK") {
      return carbonateFactorOf(inputs.RAW_MATERIAL_CARBONATE_TYPE?.[rowIndex]?.value || "");
    }
    return "";
  }

  function filledLineNumbers(varCode: string) {
    return new Set(
      (inputs[varCode] || [])
        .filter((row) => row.value.trim() !== "")
        .map((row) => row.lineNo)
    );
  }

  function collectMissingRequiredInputIssues() {
    const issues: ValidationIssue[] = [];
    const seenRepeatGroups = new Set<string>();

    for (const variable of visibleVariables) {
      if (!isRequiredVariable(variable)) {
        continue;
      }

      const code = variableCodeOf(variable);
      if (isRepeatableVariable(variable)) {
        const group = findSummationGroup(code);
        const groupKey = group.join("|");
        if (seenRepeatGroups.has(groupKey)) {
          continue;
        }
        seenRepeatGroups.add(groupKey);

        const populatedLines = new Set<number>();
        group.forEach((groupCode) => {
          (inputs[groupCode] || []).forEach((row, rowIndex) => {
            if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, groupCode, rowIndex)) {
              return;
            }
            if (row.value.trim() !== "") {
              populatedLines.add(row.lineNo);
            }
          });
        });

        if (populatedLines.size === 0) {
          continue;
        }

        const requiredGroupVariables = group
          .map((groupCode) => findVariableByCode(groupCode))
          .filter((item): item is EmissionVariableDefinition => Boolean(item))
          .filter((item) => isRequiredVariable(item));

        for (const lineNo of Array.from(populatedLines).sort((a, b) => a - b)) {
          for (const requiredVariable of requiredGroupVariables) {
            const requiredCode = variableCodeOf(requiredVariable);
            const rowIndex = Math.max(0, lineNo - 1);
            if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, requiredCode, rowIndex)) {
              continue;
            }
            const value = inputs[requiredCode]?.[rowIndex]?.value?.trim() || "";
            if (value) {
              continue;
            }
            const section = sectionForVariableCode(requiredCode);
            issues.push({
              sectionId: section?.id || "default",
              sectionTitle: section?.title || (en ? "Variable Inputs" : "변수 입력"),
              lineNo,
              inputCode: requiredCode,
              variableLabel: displayVariableName(selectedCategory, selectedTier, requiredVariable),
              formulaLabel: formulaCodeOf(requiredVariable) || requiredCode
            });
          }
        }
        continue;
      }

      const rows = inputs[code] || [DEFAULT_INPUT_ROW];
      const hasValue = rows.some((row, rowIndex) => {
        if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex)) {
          return true;
        }
        return row.value.trim() !== "";
      });

      if (!hasValue) {
        const section = sectionForVariableCode(code);
        issues.push({
          sectionId: section?.id || "default",
          sectionTitle: section?.title || (en ? "Variable Inputs" : "변수 입력"),
          lineNo: null,
          inputCode: code,
          variableLabel: displayVariableName(selectedCategory, selectedTier, variable),
          formulaLabel: formulaCodeOf(variable) || code
        });
      }
    }

    return issues;
  }

  function focusValidationIssue(issue: ValidationIssue | null) {
    if (!issue) {
      return;
    }
    const nextIndex = variableSections.findIndex((section) => section.id === issue.sectionId);
    if (nextIndex >= 0) {
      setActiveFormulaStep(nextIndex);
    }
    setPendingValidationFocus(issue);
  }

  function hasValidationIssue(sectionId: string, code: string, lineNo?: number | null) {
    return validationIssues.some((issue) => {
      if (issue.sectionId !== sectionId) {
        return false;
      }
      if (stringOf(issue.inputCode).toUpperCase() !== stringOf(code).toUpperCase()) {
        return false;
      }
      if (lineNo == null) {
        return issue.lineNo == null;
      }
      return issue.lineNo === lineNo;
    });
  }

  function validationInputClass(sectionId: string, code: string, lineNo?: number | null) {
    return hasValidationIssue(sectionId, code, lineNo)
      ? "border-rose-500 bg-rose-50 shadow-[0_0_0_1px_var(--kr-gov-red,#dc2626)]"
      : "";
  }

  function validationMessage(sectionId: string, code: string, lineNo?: number | null) {
    if (!hasValidationIssue(sectionId, code, lineNo)) {
      return "";
    }
    return en ? "This required value is missing." : "필수 입력값이 비어 있습니다.";
  }

  useEffect(() => {
    if (!pendingValidationFocus) {
      return;
    }
    const activeSection = variableSections[activeFormulaStep];
    if (!activeSection || activeSection.id !== pendingValidationFocus.sectionId) {
      return;
    }
    const timer = window.setTimeout(() => {
      document.getElementById(`formula-section-${pendingValidationFocus.sectionId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      const input = document.getElementById(
        validationInputId(
          pendingValidationFocus.sectionId,
          pendingValidationFocus.inputCode,
          pendingValidationFocus.lineNo
        )
      ) as HTMLInputElement | HTMLSelectElement | null;
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
      }
      setPendingValidationFocus(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeFormulaStep, pendingValidationFocus, variableSections]);

  function missingRequiredInputWarning() {
    const issues = collectMissingRequiredInputIssues();
    if (issues.length === 0) {
      return { message: "", issues: [] as ValidationIssue[] };
    }
    const firstIssue = issues[0];
    const message = en
      ? `${issues.length} required input(s) are missing. Review the list below before saving or calculating.`
      : `필수 입력 ${issues.length}건이 비어 있습니다. 아래 목록을 확인한 뒤 저장 또는 계산을 진행하세요.`;
    return { message, issues, firstIssue };
  }

  function supportsFallbackInput(
    variable: EmissionVariableDefinition,
    categoryOverride: EmissionCategoryItem | null = selectedCategory,
    tierOverride = selectedTier
  ) {
    if (stringOf(variable.supplementalYn).toUpperCase() === "Y") {
      return true;
    }
    const categoryCode = stringOf(categoryOverride?.subCode).toUpperCase();
    const code = stringOf(variable.varCode).toUpperCase();
    if (categoryCode === "CEMENT" && tierOverride === 1) {
      return code === "EFCLC";
    }
    if (categoryCode === "CEMENT" && tierOverride === 3) {
      return code === "EFD";
    }
    if (categoryCode === "LIME" && tierOverride === 1) {
      return code === "LIME_TYPE";
    }
    if (categoryCode === "LIME" && tierOverride === 2) {
      return ["LIME_TYPE", "CAO_CONTENT", "CAO_MGO_CONTENT", "MD", "CD", "FD", "HYDRATED_LIME_PRODUCTION_YN", "X", "Y"].includes(code);
    }
    if (categoryCode === "LIME" && tierOverride === 3) {
      return code === "EFD";
    }
    return false;
  }

  function hasInputValue(variable: EmissionVariableDefinition, rowIndex = 0) {
    const code = variableCodeOf(variable);
    if (isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex)) {
      return true;
    }
    if (isDerivedCarbonateFactorVariable(selectedCategory, selectedTier, variable)) {
      return true;
    }
    return (inputs[code]?.[rowIndex]?.value || "").trim() !== "";
  }

  function shouldShowDirectInputWarning(variable: EmissionVariableDefinition, rowIndex = 0) {
    if (!isRequiredVariable(variable)) {
      return false;
    }
    if (supportsFallbackInput(variable)) {
      return false;
    }
    return !hasInputValue(variable, rowIndex);
  }

  function tierGuideFallbackSummary(category: EmissionCategoryItem | null, tierNumber: number, guideVariables: EmissionVariableDefinition[]) {
    if (isCementTier2Scope(category, tierNumber)) {
      return en
        ? "Tier 2 supports fallback handling for Md, Cd, Fd, EFc, EFcl, and CFckd. If derivation inputs are incomplete, stored coefficients or documented defaults are used."
        : "Tier 2에서는 Md, Cd, Fd, EFc, EFcl, CFckd에 대체값 흐름이 적용됩니다. 유도식 입력이 부족하면 저장 계수 또는 문서 기본값을 사용합니다.";
    }
    if (isLimeTier2Scope(category, tierNumber)) {
      return en
        ? "Tier 2 supports fallback handling for lime-type-based factors and correction terms. Missing composition or hydration inputs can switch to mapped or documented defaults."
        : "Tier 2에서는 석회 유형 기반 계수와 보정항에 대체값 흐름이 적용됩니다. 조성값이나 수화 입력이 없으면 매핑값 또는 문서 기본값으로 전환될 수 있습니다.";
    }
    const fallbackVariables = guideVariables.filter((variable) => supportsFallbackInput(variable, category, tierNumber));
    if (fallbackVariables.length === 0) {
      return "";
    }
    return en
      ? "Some variables in this tier can fall back to stored coefficients or documented defaults."
      : "이 Tier의 일부 변수는 저장 계수 또는 문서 기본값으로 대체될 수 있습니다.";
  }

  function repeatGroupValidationWarning() {
    for (const group of summationGroups) {
      const groupVariables = group
        .map((code) => findVariableByCode(code))
        .filter((variable): variable is EmissionVariableDefinition => Boolean(variable));
      if (groupVariables.length <= 1) {
        continue;
      }

      const primaryCodes = new Set<string>([group[0] || ""]);
      groupVariables.forEach((variable) => {
        if (isRequiredVariable(variable)) {
          primaryCodes.add(variableCodeOf(variable));
        }
      });

      const normalizedPrimaryCodes = Array.from(primaryCodes).filter(Boolean);
      const referenceCodes = normalizedPrimaryCodes.length > 0 ? normalizedPrimaryCodes : group;
      const filledSets = referenceCodes
        .map((code) => ({
          code,
          lines: filledLineNumbers(code)
        }))
        .filter((item) => item.lines.size > 0);

      if (filledSets.length <= 1) {
        continue;
      }

      const [reference, ...rest] = filledSets;
      const aligned = rest.every((item) =>
        item.lines.size === reference.lines.size &&
        Array.from(item.lines).every((lineNo) => reference.lines.has(lineNo))
      );
      if (aligned) {
        continue;
      }

      const labels = referenceCodes.map((code) => {
        const variable = findVariableByCode(code);
        return variable
          ? `${displayVariableName(selectedCategory, selectedTier, variable)} (${formulaCodeOf(variable) || code})`
          : code;
      });

      return en
        ? `This summation group requires matching row counts and line numbers: ${labels.join(", ")}. Align the repeated rows before saving or calculating.`
        : `이 Summation 묶음은 입력 라인 수와 라인 번호가 서로 같아야 합니다: ${labels.join(", ")}. 저장 또는 계산 전에 반복 행을 맞춰주세요.`;
    }
    return "";
  }

  const supplementCount = calculationResult
    ? arrayOf<Record<string, unknown>>(calculationResult.appliedFactors).filter((factor) => Boolean(factor.defaultApplied)).length
    : 0;

  function validateLineAlignment() {
    return repeatGroupValidationWarning();
  }

  async function handleSave() {
    if (selectedCategoryId <= 0 || selectedTier <= 0) {
      setError(en ? "Select a category and tier first." : "카테고리와 Tier를 먼저 선택하세요.");
      return 0;
    }
    const lineAlignmentWarning = validateLineAlignment();
    if (lineAlignmentWarning) {
      setWarning(lineAlignmentWarning);
      setValidationIssues([]);
      setError("");
      setMessage("");
      return 0;
    }
    const requiredInputWarning = missingRequiredInputWarning();
    if (requiredInputWarning.message) {
      setWarning(requiredInputWarning.message);
      setValidationIssues(requiredInputWarning.issues);
      focusValidationIssue(requiredInputWarning.firstIssue || null);
      setError("");
      setMessage("");
      return 0;
    }
    setSaving(true);
    setError("");
    setWarning("");
    setValidationIssues([]);
    setMessage("");
    try {
      const response = await saveEmissionInputSession({
        categoryId: selectedCategoryId,
        tier: selectedTier,
        values: serializeInputs()
      });
      const nextSessionId = numberOf(response.sessionId);
      setSessionId(nextSessionId);
      updateSessionIdInUrl(nextSessionId);
      setMessage(en ? "Input session saved." : "입력 세션을 저장했습니다.");
      await restoreSession(nextSessionId);
      return nextSessionId;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : (en ? "Failed to save session." : "세션 저장에 실패했습니다."));
      return 0;
    } finally {
      setSaving(false);
    }
  }

  async function handleCalculate() {
    const lineAlignmentWarning = validateLineAlignment();
    if (lineAlignmentWarning) {
      setWarning(lineAlignmentWarning);
      setValidationIssues([]);
      setError("");
      setMessage("");
      return;
    }
    const requiredInputWarning = missingRequiredInputWarning();
    if (requiredInputWarning.message) {
      setWarning(requiredInputWarning.message);
      setValidationIssues(requiredInputWarning.issues);
      focusValidationIssue(requiredInputWarning.firstIssue || null);
      setError("");
      setMessage("");
      return;
    }
    setCalculating(true);
    setError("");
    setWarning("");
    setValidationIssues([]);
    setMessage("");
    try {
      const targetSessionId = await handleSave();
      if (targetSessionId <= 0) {
        return;
      }
      const response = await calculateEmissionInputSession(targetSessionId);
      setCalculationResult(response);
      setMessage(en ? "Calculation completed." : "계산을 완료했습니다.");
      await restoreSession(targetSessionId);
    } catch (calculationError) {
      setError(calculationError instanceof Error ? calculationError.message : (en ? "Calculation failed." : "계산 실행에 실패했습니다."));
    } finally {
      setCalculating(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [pageResponse, limeResponse] = await Promise.all([
          fetchEmissionManagementPage().catch(() => null),
          fetchEmissionLimeDefaultFactor().catch(() => null)
        ]);
        if (cancelled) {
          return;
        }
        setPage(pageResponse);
        setLimeDefaultFactor(limeResponse);
        await loadCategories();
        const initialSessionId = readSessionIdFromUrl();
        if (initialSessionId > 0) {
          await restoreSession(initialSessionId);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : (en ? "Failed to load the page." : "페이지를 불러오지 못했습니다."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [en]);

  useEffect(() => {
    logGovernanceScope("PAGE", "emission-management", {
      language: en ? "en" : "ko",
      categoryId: selectedCategoryId,
      tier: selectedTier,
      variableCount: visibleVariables.length,
      factorCount: factors.length,
      sessionId
    });
    logGovernanceScope("COMPONENT", "emission-management-input", {
      repeatableCount: visibleVariables.filter((item) => isRepeatableVariable(item)).length,
      savedValueCount: serializeInputs().length,
      hasResult: Boolean(calculationResult)
    });
  }, [calculationResult, en, factors.length, inputs, selectedCategory, selectedCategoryId, selectedTier, sessionId, variables, visibleVariables]);

  useEffect(() => {
    setActiveFormulaStep((current) => {
      if (variableSections.length === 0) {
        return 0;
      }
      return Math.min(current, variableSections.length - 1);
    });
  }, [variableSections.length]);

  useEffect(() => {
    setFocusedFormulaToken("");
    setHoveredFormulaToken("");
  }, [activeFormulaStep, selectedCategoryId, selectedTier]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Calculation & Certification" : "산정·인증" },
        { label: en ? "Emission Variable Management" : "배출 변수 관리" }
      ]}
      title={stringOf(en ? page?.pageTitleEn : page?.pageTitle) || (en ? "Emission Variable Management" : "배출 변수 관리")}
      subtitle={stringOf(en ? page?.pageDescriptionEn : page?.pageDescription) || (en ? "Operate category, tier, variable input sessions, and calculation execution from one admin console." : "카테고리, Tier, 변수 입력 세션 저장과 계산 실행을 하나의 관리자 콘솔에서 운영합니다.")}
    >
      <AdminWorkspacePageFrame>
        {error ? <PageStatusNotice tone="error">{error}</PageStatusNotice> : null}
        {warning ? (
          <PageStatusNotice tone="warning">
            <div className="space-y-3">
              <p>{warning}</p>
              {validationIssues.length > 0 ? (
                <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                    {en ? "Missing inputs" : "누락 입력 목록"}
                  </p>
                  <div className="mt-3 space-y-2">
                    {validationIssues.slice(0, 6).map((issue, index) => (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--kr-gov-radius)] border border-amber-100 bg-white px-3 py-2" key={`${issue.sectionId}-${issue.variableLabel}-${issue.lineNo ?? "single"}-${index}`}>
                        <p className="text-sm text-[var(--kr-gov-text-primary)]">
                          {issue.sectionTitle}
                          {issue.lineNo ? ` · ${en ? "Line" : "라인"} ${issue.lineNo}` : ""}
                          {` · ${issue.variableLabel} (${issue.formulaLabel})`}
                        </p>
                        <MemberButton
                          onClick={() => focusValidationIssue(issue)}
                          type="button"
                          variant="secondary"
                        >
                          {en ? "Move" : "이동"}
                        </MemberButton>
                      </div>
                    ))}
                    {validationIssues.length > 6 ? (
                      <p className="text-xs text-[var(--kr-gov-text-secondary)]">
                        {en ? `+ ${validationIssues.length - 6} more missing input(s)` : `누락 입력 ${validationIssues.length - 6}건이 더 있습니다.`}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </PageStatusNotice>
        ) : null}
        {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}
        {wizardStep === 2 ? (
          <LookupContextStrip
            action={(
              <MemberButton
                disabled={saving || calculating}
                onClick={() => {
                  setWizardStep(1);
                }}
                type="button"
                variant="secondary"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>{en ? "Change selection" : "선택 변경"}</span>
              </MemberButton>
            )}
            label={en ? "Current selection" : "현재 선택 범위"}
            value={(
              <span className="font-semibold">
                {`${majorCategoryLabel(selectedMajorOption, en)} / ${selectedCategory ? stringOf(selectedCategory.subName) : (en ? "Not selected" : "미선택")} / ${selectedTier > 0 ? `Tier ${selectedTier}` : "-"}`}
              </span>
            )}
          />
        ) : null}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4" data-help-id="emission-management-summary">
          <SummaryMetricCard title={en ? "Selected Major" : "선택 대분류"} value={majorCategoryLabel(selectedMajorOption, en)} description={en ? "Search the major classification to narrow the workflow scope." : "대분류 검색으로 작업 범위를 먼저 좁힙니다."} />
          <SummaryMetricCard title={en ? "Selected Subcategory" : "선택 중분류"} value={selectedCategory ? stringOf(selectedCategory.subName) : (en ? "Not selected" : "미선택")} description={en ? "Subcategory selection determines the available tier list." : "중분류 선택에 따라 사용 가능한 Tier 목록이 결정됩니다."} />
          <SummaryMetricCard title="Tier" value={selectedTier > 0 ? `Tier ${selectedTier}` : "-"} description={en ? "Tier selection controls formula and variable definitions." : "Tier 선택에 따라 계산식과 입력 변수가 바뀝니다."} />
          <SummaryMetricCard title={en ? "Step" : "단계"} value={wizardStep === 1 ? (en ? "Step 1" : "1단계") : (en ? "Step 2" : "2단계")} description={wizardStep === 1 ? (en ? "Select scope and tier." : "범위와 Tier를 선택합니다.") : (en ? "Enter variables and calculate." : "변수를 입력하고 계산합니다.")} />
        </section>
        {wizardStep === 1 ? (
          <CollectionResultPanel
            data-help-id="emission-management-scope"
            title={en ? "Step 1. Scope And Tier Selection" : "1단계. 범위 및 Tier 선택"}
            description={en ? "Search major and subcategory names, decide the tier, then move to the input page." : "대분류와 중분류를 검색해 선택하고 Tier를 정한 뒤 입력 페이지로 이동합니다."}
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{en ? "Major Category" : "대분류"}</h3>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Search and select the business family first." : "먼저 업무 대분류를 검색하고 선택합니다."}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{filteredMajorOptions.length}</span>
                </div>
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-bold">{en ? "Major Search" : "대분류 검색"}</span>
                  <AdminInput
                    onChange={(event) => setMajorSearchKeyword(event.target.value)}
                    placeholder={en ? "Search major code or name" : "대분류 코드 또는 명 검색"}
                    value={majorSearchKeyword}
                  />
                </label>
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-bold">{en ? "Major Category" : "대분류 선택"}</span>
                  <AdminSelect
                    onChange={(event) => {
                      const nextMajorKey = event.target.value;
                      setSelectedMajorKey(nextMajorKey);
                      setSubCategorySearchKeyword("");
                      setSelectedCategoryId(0);
                      setSelectedCategory(null);
                      setTiers([]);
                      resetSelectionState();
                    }}
                    value={selectedMajorKey}
                  >
                    <option value="">{en ? "Select major category" : "대분류 선택"}</option>
                    {filteredMajorOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {majorCategoryLabel(option, en)}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
              </section>

              <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{en ? "Subcategory And Tier" : "중분류 및 Tier"}</h3>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Search the detailed module and choose the tier to generate the variable form." : "상세 모듈을 검색하고 Tier를 선택하면 변수 입력 폼이 생성됩니다."}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">{selectedTier > 0 ? `Tier ${selectedTier}` : (en ? "Pending" : "선택 대기")}</span>
                </div>
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-bold">{en ? "Subcategory Search" : "중분류 검색"}</span>
                  <AdminInput
                    disabled={!selectedMajorKey}
                    onChange={(event) => setSubCategorySearchKeyword(event.target.value)}
                    placeholder={en ? "Search subcategory code or name" : "중분류 코드 또는 명 검색"}
                    value={subCategorySearchKeyword}
                  />
                </label>
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-bold">{en ? "Subcategory" : "중분류 선택"}</span>
                  <AdminSelect
                    disabled={!selectedMajorKey}
                    onChange={(event) => {
                      void handleCategoryChange(Number(event.target.value) || 0);
                    }}
                    value={selectedCategoryId > 0 ? String(selectedCategoryId) : ""}
                  >
                    <option value="">{en ? "Select subcategory" : "중분류 선택"}</option>
                    {visibleCategories.map((category) => (
                      <option key={stringOf(category.categoryId)} value={stringOf(category.categoryId)}>
                        {`${stringOf(category.subName)}${stringOf(category.subCode) ? ` (${stringOf(category.subCode)})` : ""}`}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-sm font-bold">Tier</span>
                  <AdminSelect
                    disabled={selectedCategoryId <= 0}
                    onChange={(event) => {
                      void handleTierChange(Number(event.target.value) || 0);
                    }}
                    value={selectedTier > 0 ? String(selectedTier) : ""}
                  >
                    <option value="">{en ? "Select tier" : "Tier 선택"}</option>
                    {tiers.map((tier) => (
                      <option key={`${stringOf(tier.tier)}-${stringOf(tier.tierLabel)}`} value={stringOf(tier.tier)}>
                        {stringOf(tier.tierLabel) || `Tier ${stringOf(tier.tier)}`}
                      </option>
                    ))}
                  </AdminSelect>
                  <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{en ? "Tier Guidance" : "Tier 안내"}</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-amber-900">
                      {en
                        ? "Choosing a higher tier generally improves carbon emission accuracy."
                        : "조금 더 높은 Tier를 선택할수록 탄소배출량 산정 정확도가 높아집니다."}
                    </p>
                  </div>
                </label>
                <div className="mt-6 flex items-center justify-end">
                  <MemberButton
                    disabled={loading || definitionLoading || selectedCategoryId <= 0 || selectedTier <= 0}
                    onClick={() => {
                      void proceedToInputStep();
                    }}
                    type="button"
                  >
                    {definitionLoading ? (en ? "Loading..." : "불러오는 중...") : (en ? "Next: Input Variables" : "다음: 변수 입력")}
                  </MemberButton>
                </div>
              </section>
            </div>
            {selectedCategoryId > 0 ? (
              <section className="mt-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{en ? "Tier Input Guide" : "Tier별 입력값 안내"}</h3>
                    <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                      {en
                        ? "After selecting a subcategory, review the formula and main inputs required for each tier before deciding."
                        : "중분류를 선택한 뒤 각 Tier에서 요구하는 계산식과 주요 입력값을 먼저 확인할 수 있습니다."}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">{tiers.length}</span>
                </div>
                {tierGuideLoading ? (
                  <p className="mt-4 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Loading tier guidance..." : "Tier 안내를 불러오는 중입니다..."}</p>
                ) : null}
                {!tierGuideLoading && tiers.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    {tiers.map((tier) => {
                      const tierNumber = numberOf(tier.tier);
                      const guide = tierGuideMap[tierNumber];
                      const guideVariables = guide?.variables ? visibleVariablesForStep(selectedCategory, tierNumber, guide.variables) : [];
                      return (
                        <article className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-4" key={`tier-guide-${tierNumber}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(tier.tierLabel) || `Tier ${tierNumber}`}</h4>
                              {tierGuideFallbackSummary(selectedCategory, tierNumber, guideVariables) ? (
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                  {en ? "Fallback Available" : "대체값 적용 가능"}
                                </span>
                              ) : null}
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{guideVariables.length}</span>
                          </div>
                          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-3 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Formula" : "계산식"}</p>
                            <div className="mt-2">
                              <FormulaNotation active formula={guide?.formulaDisplay || guide?.formulaSummary || "-"} />
                            </div>
                          </div>
                          {tierGuideFallbackSummary(selectedCategory, tierNumber, guideVariables) ? (
                            <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-3 py-3">
                              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                                {en ? "Fallback Guidance" : "대체값 안내"}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-amber-900">
                                {tierGuideFallbackSummary(selectedCategory, tierNumber, guideVariables)}
                              </p>
                            </div>
                          ) : null}
                          <div className="mt-4 space-y-2">
                            {guideVariables.length > 0 ? guideVariables.map((variable) => {
                              return (
                                <div
                                  className={`rounded-[var(--kr-gov-radius)] border px-3 py-3 ${
                                    supportsFallbackInput(variable, selectedCategory, tierNumber)
                                      ? "border-amber-200 bg-amber-50/70"
                                      : "border-[var(--kr-gov-border-light)] bg-slate-50"
                                  }`}
                                  key={`tier-guide-${tierNumber}-${stringOf(variable.varCode)}`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{displayVariableName(selectedCategory, tierNumber, variable)}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {supportsFallbackInput(variable, selectedCategory, tierNumber) ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{en ? "Default-capable" : "기본 계수 사용 가능"}</span> : null}
                                      {isRepeatableVariable(variable) ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">{en ? "Summation" : "Summation"}</span> : null}
                                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">{stringOf(variable.inputType) || "TEXT"}</span>
                                    </div>
                                  </div>
                                  <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayUnitLabel(stringOf(variable.unit), en)}</p>
                                </div>
                              );
                            }) : (
                              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No variable guide is available for this tier yet." : "이 Tier의 변수 안내를 아직 불러오지 못했습니다."}</p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            ) : null}
          </CollectionResultPanel>
        ) : null}

        {wizardStep === 2 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="min-w-0 xl:w-[420px] xl:min-w-[420px] xl:max-w-[420px]">
          <DiagnosticCard
            data-help-id="emission-management-definition"
            description={en ? "Step 2 begins after tier selection. Review the current formula, variable metadata, and factor references before entering values." : "2단계에서는 선택된 Tier 기준 계산식, 변수 메타데이터, 계수 참조를 확인한 뒤 값을 입력합니다."}
            status={definitionLoading ? (en ? "Loading" : "불러오는 중") : (en ? "Ready" : "준비됨")}
            statusTone={definitionLoading ? "warning" : "healthy"}
            title={en ? "Step 2. Variable Definition Catalog" : "2단계. 변수 정의 카탈로그"}
          >
            {loading ? (
              <p className="mt-4 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Loading categories and metadata..." : "카테고리와 메타데이터를 불러오는 중입니다..."}</p>
            ) : null}
            <div className="mt-4 space-y-3">
              {visibleVariables.map((variable) => {
                const resolutionGuide = resolutionGuideForVariable(en, selectedCategory, selectedTier, variable);
                return (
                  <article
                    className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${
                      supportsFallbackInput(variable)
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-[var(--kr-gov-border-light)] bg-white"
                    }`}
                    key={stringOf(variable.varCode)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{displayVariableName(selectedCategory, selectedTier, variable)}</p>
                        <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayUnitLabel(stringOf(variable.unit), en)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {supportsFallbackInput(variable) ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">{en ? "Default-capable" : "기본 계수 사용 가능"}</span> : null}
                        {resolutionGuide ? <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">{resolutionGuide.badge}</span> : null}
                        {isRepeatableVariable(variable) ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">{en ? "Summation" : "Summation 변수"}</span> : null}
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{stringOf(variable.inputType) || "TEXT"}</span>
                      </div>
                    </div>
                    {stringOf(variable.varDesc) ? <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(variable.varDesc)}</p> : null}
                    {resolutionGuide ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{resolutionGuide.description}</p> : null}
                  </article>
                );
              })}
              {!definitionLoading && visibleVariables.length === 0 ? (
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a category and tier to load variable definitions." : "카테고리와 Tier를 선택하면 변수 정의가 표시됩니다."}</p>
              ) : null}
            </div>

            <section className="mt-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold">{en ? "Factor References" : "계수 참조"}</h3>
                {selectedCategory && stringOf(selectedCategory.subCode).toUpperCase() === "LIME" && limeDefaultFactor ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {stringOf(limeDefaultFactor.factorValue)} {displayUnitLabel(stringOf(limeDefaultFactor.unit), en)}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-3">
                {factors.map((factor) => (
                  <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3" key={stringOf(factor.factorCode)}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{stringOf(factor.factorName) || stringOf(factor.factorCode)}</p>
                        <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayUnitLabel(stringOf(factor.unit), en)}</p>
                      </div>
                      <p className="text-sm font-black text-[var(--kr-gov-blue)]">{stringOf(factor.factorValue)}</p>
                    </div>
                    {stringOf(factor.remark) ? <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(factor.remark)}</p> : null}
                  </div>
                ))}
                {factors.length === 0 ? (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No stored factor rows for the current scope." : "현재 범위에 저장된 계수 행이 없습니다."}</p>
                ) : null}
              </div>
            </section>
          </DiagnosticCard>
          </div>

          <div className="min-w-0">
          <DiagnosticCard
            data-help-id="emission-management-input"
            description={en ? "Enter numeric or text values for the loaded variables. Repeatable variables support row addition for summation formulas." : "불러온 변수에 숫자 또는 텍스트 값을 입력합니다. 반복 입력 변수는 Summation 계산을 위해 행 추가를 지원합니다."}
            status={sessionId > 0 ? `${en ? "Session" : "세션"} #${sessionId}` : (en ? "Draft" : "초안")}
            statusTone={sessionId > 0 ? "healthy" : "neutral"}
            title={en ? "Step 2. Input Workspace" : "2단계. 입력 작업공간"}
          >
            <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Summation Guide" : "Summation 입력 안내"}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-primary)]">
                {en
                  ? "Variables marked as Summation support line-by-line entry. Use Add row for repeated items, then run the calculation to see CO2 at the bottom."
                  : "Summation 변수로 표시된 항목은 여러 줄 입력이 가능합니다. 반복 항목은 행 추가로 입력하고, 계산 실행 후 하단에서 CO2 결과를 확인합니다."}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Major Category" : "대분류"}</p>
                <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{majorCategoryLabel(selectedMajorOption, en)}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Subcategory" : "중분류"}</p>
                <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedCategory ? stringOf(selectedCategory.subName) : "-"}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">Tier</p>
                <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{selectedTier > 0 ? `Tier ${selectedTier}` : "-"}</p>
              </div>
            </div>
            {formulaSummary ? (
              <div className="sticky top-[-2rem] z-20 mt-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-blue-50/95">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Document Formula" : "문서 기준 계산식"}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">
                      {en ? "Review the full formula here before entering values in the blocks below." : "아래 블록 입력 전에 전체 계산식을 여기서 먼저 확인합니다."}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                    {en ? "Input context" : "입력 기준"}
                  </span>
                </div>
                <div className="mt-3 overflow-x-auto rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3">
                  <div className="min-w-max">
                    <FormulaNotation active formula={tierGuideMap[selectedTier]?.formulaDisplay || formulaSummary} />
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Formula workflow" : "수식 진행 워크플로우"}</p>
                  <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                    {en ? "Activate one formula block at a time and move with Prev or Next." : "수식 블록을 하나씩 활성화하고 Prev/Next로 이동합니다."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variableSections.map((section, sectionIndex) => {
                    const completion = sectionCompletion(section.id);
                    const active = sectionIndex === activeFormulaStep;
                    return (
                      <button
                        className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                          active
                            ? "border-[var(--kr-gov-blue)] bg-blue-50 text-[var(--kr-gov-blue)]"
                            : completion.complete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)]"
                        }`}
                        key={`${section.id}-step`}
                        onClick={() => setActiveFormulaStep(sectionIndex)}
                        type="button"
                      >
                        {sectionIndex + 1}. {section.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              {variableSections[activeFormulaStep] ? (
                <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{variableSections[activeFormulaStep].title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{variableSections[activeFormulaStep].description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MemberButton
                        disabled={activeFormulaStep <= 0}
                        onClick={() => moveFormulaStep("prev")}
                        type="button"
                        variant="secondary"
                      >
                        {en ? "Prev" : "이전"}
                      </MemberButton>
                      <MemberButton
                        disabled={activeFormulaStep >= variableSections.length - 1}
                        onClick={() => moveFormulaStep("next")}
                        type="button"
                        variant="secondary"
                      >
                        {en ? "Next" : "다음"}
                      </MemberButton>
                    </div>
                  </div>
                  {variableSections[activeFormulaStep].formula ? (
                    <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Active formula notation" : "활성 수식 표기"}</p>
                      <div className="mt-3">
                        <FormulaNotation active formula={variableSections[activeFormulaStep].formula} highlightedTokens={sectionHighlightedTokens(variableSections[activeFormulaStep].id)} />
                      </div>
                      {sectionFormulaMappings(variableSections[activeFormulaStep].id).length > 0 ? (
                        <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Formula term mapping" : "수식 항 매핑"}</p>
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {sectionFormulaMappings(variableSections[activeFormulaStep].id).map((item) => (
                              <button
                                className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-3 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50"
                                key={`${variableSections[activeFormulaStep].id}-${item.code}`}
                                onBlur={() => setHoveredFormulaToken("")}
                                onFocus={() => setHoveredFormulaToken(item.code)}
                                onMouseEnter={() => setHoveredFormulaToken(item.code)}
                                onMouseLeave={() => setHoveredFormulaToken("")}
                                type="button"
                              >
                                <FormulaNotation compact formula={item.code} highlightedTokens={sectionHighlightedTokens(variableSections[activeFormulaStep].id)} />
                                <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{item.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {activeSectionPreviewCards().length > 0 ? (
                        <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Calculated result under formula" : "수식 바로 아래 계산 결과"}</p>
                          <div className="mt-3 space-y-2">
                            {activeSectionPreviewCards().map((previewCard) => (
                              <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-3 py-3" key={`active-inline-${previewCard.title}`}>
                                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{previewCard.title}</p>
                                <p className="mt-1 text-sm font-black text-[var(--kr-gov-blue)]">{previewCard.emphasis}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="mt-4 space-y-5">
              {variableSections[activeFormulaStep] ? renderFormulaSection(variableSections[activeFormulaStep], activeFormulaStep) : null}
              {variableSections
                .map((section, sectionIndex) => ({ section, sectionIndex }))
                .filter(({ sectionIndex }) => sectionIndex !== activeFormulaStep)
                .map(({ section, sectionIndex }) => renderFormulaSection(section, sectionIndex))}
              {visibleVariables.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Variable inputs will appear here after a scope is selected." : "범위를 선택하면 여기에 변수 입력 항목이 나타납니다."}</p> : null}
            </div>

            <MemberActionBar
              dataHelpId="emission-management-actions"
              description={en ? "Save the current input values into a session when you need a persistent work item. Run calculation always saves the latest on-screen inputs first, then calculates with that newest session." : "지속적인 작업 항목이 필요하면 현재 입력값을 세션으로 저장하세요. 계산 실행은 항상 현재 화면 입력값을 먼저 저장한 뒤, 그 최신 세션으로 계산합니다."}
              eyebrow={en ? "Execution" : "실행"}
              secondary={{
                label: saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save session" : "세션 저장"),
                onClick: () => {
                  void handleSave();
                }
              }}
              primary={(
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <MemberButton
                    disabled={saving || calculating || selectedCategoryId <= 0 || selectedTier <= 0 || variables.length === 0}
                    onClick={() => {
                      resetCurrentDraft();
                    }}
                    type="button"
                    variant="secondary"
                  >
                    {en ? "Reset draft" : "입력 초기화"}
                  </MemberButton>
                  <MemberButton
                    disabled={saving || calculating}
                    onClick={() => {
                      setWizardStep(1);
                    }}
                    type="button"
                    variant="secondary"
                  >
                    {en ? "Change selection" : "선택 변경"}
                  </MemberButton>
                  <MemberButton disabled={saving || calculating || visibleVariables.length === 0} onClick={() => void handleCalculate()} type="button">
                    {calculating ? (en ? "Calculating..." : "계산 중...") : (en ? "Run calculation" : "계산 실행")}
                  </MemberButton>
                </div>
              )}
              title={en ? "Session Save And Calculation" : "세션 저장 및 계산"}
            />
          </DiagnosticCard>
          </div>
        </div>
        ) : null}

        <DiagnosticCard
          data-help-id="emission-management-result"
          description={en ? "The lower result area updates after calculation on step 2." : "2단계에서 계산을 실행하면 하단 결과 영역이 갱신됩니다."}
          status={calculationResult ? (en ? "Latest result" : "최신 결과") : (en ? "No result" : "결과 없음")}
          statusTone={calculationResult ? "healthy" : "neutral"}
          title={en ? "Calculation Result" : "계산 결과"}
        >
          {calculationResult ? (
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4 xl:self-start">
                <div className="xl:sticky xl:top-24 xl:z-10 space-y-4">
                  <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-blue-50/95">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Document Formula" : "문서 기준 계산식"}</p>
                    <div className="mt-2">
                      <FormulaNotation active formula={stringOf(calculationResult.formulaDisplay || calculationResult.formulaSummary) || "-"} />
                    </div>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-emerald-50/95">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{en ? "Actual Calculation" : "실제 계산식"}</p>
                    <div className="mt-2">
                      <FormulaNotation active formula={stringOf(calculationResult.substitutedFormula) || "-"} />
                    </div>
                  </div>
                </div>
                <SummaryMetricCard
                  accentClassName="text-pink-700"
                  surfaceClassName="bg-pink-50"
                  title={en ? "Total Emission" : "총 배출량"}
                  value={`${stringOf(calculationResult.co2Total)} ${displayUnitLabel(stringOf(calculationResult.unit) || "tCO2", en)}`}
                  description={documentFormulaText(stringOf(calculationResult.formulaDisplay || calculationResult.formulaSummary))}
                />
                <div
                  className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${
                    supplementCount > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wide ${supplementCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                        {en ? "Supplement Summary" : "보완 적용 요약"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                        {en
                          ? "Only formula terms with defined defaults or stored coefficients are counted here."
                          : "정의된 기본 계수 또는 저장 계수로 보완된 수식 항만 집계합니다."}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-black ${
                        supplementCount > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {supplementCount > 0 ? (en ? `${supplementCount} supplemented` : `보완 ${supplementCount}건`) : (en ? "No supplement" : "보완 없음")}
                    </span>
                  </div>
                </div>
                <SummaryMetricCard
                  title={en ? "Fallback/Stored Supplement Used" : "기본 계수/저장 계수 보완 사용 여부"}
                  value={Boolean(calculationResult.defaultApplied) ? (en ? "Used" : "사용함") : (en ? "Not used" : "사용 안 함")}
                  description={en ? "Shows whether any formula term with a defined default or stored coefficient was supplemented during calculation." : "기본값이 정의된 수식 항에 한해 기본 계수 또는 저장 계수 보완이 적용되었는지 표시합니다."}
                />
              </div>
              <div className="space-y-4">
                <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Calculation Log" : "계산 로그"}</p>
                  <div className="mt-3 space-y-3">
                    {arrayOf<Record<string, unknown>>(calculationResult.calculationLogs).map((log, index) => (
                      <article className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-4 py-4 shadow-sm" key={`calc-log-${index}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                {en ? "Step" : "단계"} {index + 1}
                              </span>
                              {numberOf(log.lineNo) > 0 ? (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                                  {en ? "Line" : "라인"} {numberOf(log.lineNo)}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(log.label) || (en ? "Step" : "단계")}</p>
                          </div>
                          <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">{en ? "Result" : "결과"}</p>
                            <p className="mt-1 text-sm font-black text-emerald-800">{stringOf(log.result) || "0"}</p>
                          </div>
                        </div>
                        {stringOf(log.formula) ? (
                          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Formula" : "수식"}</p>
                            <div className="mt-2">
                              <FormulaNotation compact formula={stringOf(log.formula)} />
                            </div>
                          </div>
                        ) : null}
                        {stringOf(log.substituted) ? (
                          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-3 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Substituted values" : "값 대입식"}</p>
                            <div className="mt-2">
                              <FormulaNotation active compact formula={stringOf(log.substituted)} />
                            </div>
                          </div>
                        ) : null}
                        {stringOf(log.note) ? (
                          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-3 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{en ? "Note" : "비고"}</p>
                            <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{presentCalculationText(stringOf(log.note), en)}</p>
                          </div>
                        ) : null}
                      </article>
                    ))}
                    {arrayOf(calculationResult.calculationLogs).length === 0 ? (
                      <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No calculation steps were returned." : "계산 단계 로그가 없습니다."}</p>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Applied Factors" : "적용 계수"}</p>
                      <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                        {en
                          ? "Review the factors applied during calculation, including any default or stored supplement that replaced direct input."
                          : "계산에 적용된 계수를 확인합니다. 직접 입력 대신 기본 계수 또는 저장 계수 보완이 사용된 경우 여기서 함께 표시합니다."}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${supplementCount > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {supplementCount > 0 ? (en ? `${supplementCount} supplemented` : `보완 ${supplementCount}건`) : (en ? "No supplement" : "보완 없음")}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {arrayOf<Record<string, unknown>>(calculationResult.appliedFactors).map((factor, index) => (
                      <div
                        className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${
                          Boolean(factor.defaultApplied) ? "border-amber-200 bg-amber-50/70" : "border-white bg-white"
                        }`}
                        key={`factor-${index}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{appliedFactorLabel(factor, en)}</p>
                            <p className="mt-1 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{appliedFactorContext(factor, en)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--kr-gov-blue)]">{stringOf(factor.factorValue) || "-"}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Boolean(factor.defaultApplied) ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {appliedFactorSourceBadge(factor, en)}
                            </span>
                          </div>
                        </div>
                        {Boolean(factor.defaultApplied) ? (
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                            <p className="rounded-[var(--kr-gov-radius)] bg-white/80 px-3 py-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">
                              {en
                                ? "This term was completed with a defined default, stored coefficient, or mapped fallback because direct input was unavailable."
                                : "직접 입력값이 없어 정의된 기본 계수, 저장 계수 또는 매핑 fallback 값으로 이 항목을 보완해 계산했습니다."}
                            </p>
                            <span className="inline-flex items-center justify-center rounded-[var(--kr-gov-radius)] border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700">
                              {en ? "Supplement used" : "보완 적용"}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {arrayOf(calculationResult.appliedFactors).length === 0 ? (
                      <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No factor list was returned." : "적용 계수 목록이 없습니다."}</p>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Run a calculation to inspect the saved result." : "계산을 실행하면 저장된 결과를 여기서 확인할 수 있습니다."}</p>
          )}
        </DiagnosticCard>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
