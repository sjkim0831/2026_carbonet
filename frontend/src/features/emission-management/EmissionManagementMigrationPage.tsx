import { useEffect, useState } from "react";
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
import { AdminInput, AdminSelect, CollectionResultPanel, DiagnosticCard, MemberActionBar, MemberButton, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
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
  displayVariableCode,
  displayVariableName,
  hydrateInputs,
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
  shouldShowLimeTier2Variable,
  stringOf,
  syncLineNumbers,
  tier2FieldPlaceholder,
  variableCodeOf,
  variableOptions,
  visibleVariablesForStep
} from "./emissionManagementShared";

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

  function findSummationGroup(varCode: string) {
    const normalizedVarCode = stringOf(varCode).toUpperCase();
    return summationGroups.find((group) => group.includes(normalizedVarCode)) || [normalizedVarCode];
  }

  function resetSelectionState() {
    setSelectedTier(0);
    setWizardStep(1);
    setVariables([]);
    setFactors([]);
    setInputs({});
    setFormulaSummary("");
    setCalculationResult(null);
    setSessionId(0);
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
    applyRowChange(varCode, (rows) => syncLineNumbers([...rows, { lineNo: rows.length + 1, value: "" }]));
  }

  function removeInputRow(varCode: string, rowIndex: number) {
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

  function validateLineAlignment() {
    const subCode = stringOf(selectedCategory?.subCode).toUpperCase();
    if (subCode === "CEMENT" && selectedTier === 1) {
      const mciLines = filledLineNumbers("MCI");
      const ccliLines = filledLineNumbers("CCLI");
      const sameSize = mciLines.size === ccliLines.size;
      const sameMembers = sameSize && Array.from(mciLines).every((lineNo) => ccliLines.has(lineNo));
      if (!sameMembers) {
        return en
          ? "Cement Tier 1 requires matching MCI and CCLI lines. Align the row counts and line numbers before saving or calculating."
          : "시멘트 Tier 1은 MCI와 CCLI의 입력 라인 수와 라인 번호가 서로 같아야 합니다. 저장 또는 계산 전에 행 수와 라인 번호를 맞춰주세요.";
      }
    }
    return "";
  }

  async function handleSave() {
    if (selectedCategoryId <= 0 || selectedTier <= 0) {
      setError(en ? "Select a category and tier first." : "카테고리와 Tier를 먼저 선택하세요.");
      return 0;
    }
    const lineAlignmentWarning = validateLineAlignment();
    if (lineAlignmentWarning) {
      setWarning(lineAlignmentWarning);
      setError("");
      setMessage("");
      return 0;
    }
    setSaving(true);
    setError("");
    setWarning("");
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
      setError("");
      setMessage("");
      return;
    }
    setCalculating(true);
    setError("");
    setWarning("");
    setMessage("");
    try {
      const targetSessionId = sessionId > 0 ? sessionId : await handleSave();
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
        {warning ? <PageStatusNotice tone="warning">{warning}</PageStatusNotice> : null}
        {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}

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
                  <p className="text-xs leading-5 text-[var(--kr-gov-text-secondary)]">
                    {en
                      ? "Choosing a higher tier generally provides more accurate carbon emission results."
                      : "조금 더 높은 Tier를 선택할 경우 더 정확한 탄소배출 결과값을 보장합니다."}
                  </p>
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
                            <h4 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(tier.tierLabel) || `Tier ${tierNumber}`}</h4>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{guideVariables.length}</span>
                          </div>
                          <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-3 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Formula" : "계산식"}</p>
                            <p className="mt-2 text-sm font-semibold text-[var(--kr-gov-text-primary)]">{guide?.formulaDisplay || guide?.formulaSummary || "-"}</p>
                          </div>
                          <div className="mt-4 space-y-2">
                            {guideVariables.length > 0 ? guideVariables.map((variable) => (
                              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-3" key={`tier-guide-${tierNumber}-${stringOf(variable.varCode)}`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{displayVariableName(selectedCategory, tierNumber, variable)}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {isRequiredVariable(variable) ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{en ? "Required" : "필수"}</span> : null}
                                    {isRepeatableVariable(variable) ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">{en ? "Summation" : "Summation"}</span> : null}
                                  </div>
                                </div>
                                <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayVariableCode(selectedCategory, tierNumber, variable)} · {stringOf(variable.unit) || "-"}</p>
                              </div>
                            )) : (
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
            {formulaSummary ? (
              <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Formula" : "계산식"}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--kr-gov-text-primary)]">{tierGuideMap[selectedTier]?.formulaDisplay || formulaSummary}</p>
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {visibleVariables.map((variable) => (
                <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3" key={stringOf(variable.varCode)}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{displayVariableName(selectedCategory, selectedTier, variable)}</p>
                      <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayVariableCode(selectedCategory, selectedTier, variable)} · {stringOf(variable.unit) || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isRequiredVariable(variable) ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">{en ? "Required" : "필수"}</span> : null}
                      {isRepeatableVariable(variable) ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">{en ? "Summation" : "Summation 변수"}</span> : null}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{stringOf(variable.inputType) || "TEXT"}</span>
                    </div>
                  </div>
                  {stringOf(variable.varDesc) ? <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(variable.varDesc)}</p> : null}
                </article>
              ))}
              {!definitionLoading && visibleVariables.length === 0 ? (
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a category and tier to load variable definitions." : "카테고리와 Tier를 선택하면 변수 정의가 표시됩니다."}</p>
              ) : null}
            </div>

            <section className="mt-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold">{en ? "Factor References" : "계수 참조"}</h3>
                {selectedCategory && stringOf(selectedCategory.subCode).toUpperCase() === "LIME" && limeDefaultFactor ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {stringOf(limeDefaultFactor.factorValue)} {stringOf(limeDefaultFactor.unit)}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-3">
                {factors.map((factor) => (
                  <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3" key={stringOf(factor.factorCode)}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{stringOf(factor.factorName) || stringOf(factor.factorCode)}</p>
                        <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(factor.factorCode)} · {stringOf(factor.unit)}</p>
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
            <div className="mt-4 space-y-5">
              {variableSections.map((section) => {
                const sectionVariables = section.codes
                  .map((code) => visibleVariables.find((variable) => variableCodeOf(variable) === code))
                  .filter((variable): variable is EmissionVariableDefinition => Boolean(variable))
                  .filter((variable) => shouldShowLimeTier2Variable(selectedCategory, selectedTier, inputs, variableCodeOf(variable)))
                  ;
                if (sectionVariables.length === 0) {
                  return null;
                }
                return (
                  <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4" key={section.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-[var(--kr-gov-text-primary)]">{section.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{section.description}</p>
                        {section.formula ? <p className="mt-2 text-xs font-bold text-[var(--kr-gov-blue)]">{section.formula}</p> : null}
                      </div>
                      {isLimeTier2Scope(selectedCategory, selectedTier) && section.id !== "lime-tier2-production" ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">
                          {en ? "Inputs for derived factors" : "파생계수 결정용 입력"}
                        </span>
                      ) : null}
                    </div>
                    {isLimeTier2Scope(selectedCategory, selectedTier) && section.id !== "lime-tier2-production" ? (
                      <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-dashed border-blue-200 bg-white px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Derived factor preview" : "파생계수 계산 미리보기"}</p>
                        <div className="mt-2 space-y-2 text-sm text-[var(--kr-gov-text-primary)]">
                          {(inputs.MLI || [DEFAULT_INPUT_ROW]).map((_, rowIndex) => {
                            const preview = limeTier2DerivedSummary(en, inputs, rowIndex);
                            return (
                              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-3" key={`${section.id}-preview-${rowIndex + 1}`}>
                                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Line" : "라인"} {rowIndex + 1}</p>
                                {section.id === "lime-tier2-ef" ? (
                                  <div className="mt-1 space-y-1">
                                    <p>{preview.efAText}</p>
                                    <p>{preview.efBText}</p>
                                    <p>{preview.efCText}</p>
                                    <p className="font-bold text-[var(--kr-gov-blue)]">{preview.efText}</p>
                                  </div>
                                ) : null}
                                {section.id === "lime-tier2-cf" ? <p className="mt-1">{preview.cfText}</p> : null}
                                {section.id === "lime-tier2-ch" ? <p className="mt-1">{preview.chText}</p> : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 space-y-4">
                      {sectionVariables.map((variable) => {
                const code = stringOf(variable.varCode);
                const rows = inputs[code] || [{ lineNo: 1, value: "" }];
                const inputType = stringOf(variable.inputType).toUpperCase();
                const derivedFactorVariable = isDerivedCarbonateFactorVariable(selectedCategory, selectedTier, variable);
                const limeTier2SupplementalVariable = isLimeTier2SupplementalVariable(selectedCategory, selectedTier, variable);
                const limeTier2Hint = limeTier2VariableHint(en, selectedCategory, selectedTier, variable);
                return (
                  <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4" key={code}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black">{displayVariableName(selectedCategory, selectedTier, variable)}</h3>
                        <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{displayVariableCode(selectedCategory, selectedTier, variable)} · {stringOf(variable.unit) || "-"}</p>
                        {limeTier2Hint ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{limeTier2Hint}</p> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {limeTier2SupplementalVariable ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                            {en ? "Tier 2 only" : "Tier 2 전용"}
                          </span>
                        ) : null}
                        {isRepeatableVariable(variable) ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                            {en ? "Summation variable" : "Summation 변수"}
                          </span>
                        ) : null}
                        {derivedFactorVariable ? (
                          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                            {en ? "Auto from carbonate type" : "탄산염 종류 자동 반영"}
                          </span>
                        ) : null}
                        {isRepeatableVariable(variable) ? (
                          <MemberButton onClick={() => addInputRow(code)} type="button" variant="secondary">
                            {en ? "Add row" : "행 추가"}
                          </MemberButton>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {rows.map((row, rowIndex) => (
                        <div className="grid grid-cols-[96px_1fr_auto] items-end gap-3" key={`${code}-${row.lineNo}`}>
                          {(() => {
                            const disabledByLimeTier2 = isLimeTier2DisabledField(selectedCategory, selectedTier, inputs, code, rowIndex);
                            return (
                              <>
                          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-2 text-sm font-bold text-[var(--kr-gov-text-secondary)]">
                            {en ? "Line" : "라인"} {row.lineNo}
                          </div>
                          <label className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">
                              {derivedFactorVariable
                                ? (en ? "AUTO" : "자동계산")
                                : arrayOf(variable.options).length > 0 ? (en ? "SELECT" : "선택형") : (stringOf(variable.inputType) || "TEXT")}
                            </span>
                            {derivedFactorVariable ? (
                              <AdminInput
                                placeholder={en ? "Select carbonate type first" : "먼저 탄산염 종류를 선택하세요"}
                                readOnly
                                type="number"
                                value={derivedFactorValue(code, rowIndex)}
                              />
                            ) : arrayOf(variable.options).length > 0 ? (
                              <AdminSelect disabled={disabledByLimeTier2} onChange={(event) => updateInput(code, rowIndex, event.target.value)} value={row.value}>
                                <option value="">{en ? "Select option" : "선택"}</option>
                                {variableOptions(variable, row.value).map((option) => (
                                  <option key={`${code}-${option.code}`} value={option.code}>
                                    {option.label}
                                  </option>
                                ))}
                              </AdminSelect>
                            ) : (
                              <AdminInput
                                disabled={disabledByLimeTier2}
                                onChange={(event) => updateInput(code, rowIndex, event.target.value)}
                                placeholder={tier2FieldPlaceholder(en, selectedCategory, selectedTier, inputs, code, rowIndex, stringOf(variable.unit))}
                                step={inputType === "NUMBER" ? "any" : undefined}
                                type={inputType === "NUMBER" ? "number" : "text"}
                                value={disabledByLimeTier2 ? "" : row.value}
                              />
                            )}
                          </label>
                          {isRepeatableVariable(variable) ? (
                            <MemberButton
                              onClick={() => removeInputRow(code, rowIndex)}
                              type="button"
                              variant="secondary"
                            >
                              {en ? "Remove" : "삭제"}
                            </MemberButton>
                          ) : <span />}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
                    </div>
                  </section>
                );
              })}
              {visibleVariables.length === 0 ? (
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Variable inputs will appear here after a scope is selected." : "범위를 선택하면 여기에 변수 입력 항목이 나타납니다."}</p>
              ) : null}
            </div>

            <MemberActionBar
              dataHelpId="emission-management-actions"
              description={en ? "Save the current input values into a session first when you need a persistent work item. Calculation reuses the latest saved or just-created session." : "지속적인 작업 항목이 필요하면 현재 입력값을 세션으로 저장하세요. 계산은 마지막 저장 세션 또는 방금 생성한 세션을 사용합니다."}
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
                    disabled={saving || calculating}
                    onClick={() => {
                      setWizardStep(1);
                    }}
                    type="button"
                    variant="secondary"
                  >
                    {en ? "Back To Selection" : "선택 단계로 돌아가기"}
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
              <div className="space-y-4">
                <SummaryMetricCard
                  accentClassName="text-pink-700"
                  surfaceClassName="bg-pink-50"
                  title={en ? "Total Emission" : "총 배출량"}
                  value={`${stringOf(calculationResult.co2Total)} ${stringOf(calculationResult.unit) || "tCO2"}`}
                  description={stringOf(calculationResult.formulaDisplay || calculationResult.formulaSummary)}
                />
                <SummaryMetricCard
                  title={en ? "Default Applied" : "기본계수 적용"}
                  value={Boolean(calculationResult.defaultApplied) ? (en ? "Yes" : "예") : (en ? "No" : "아니오")}
                  description={en ? "Indicates whether fallback default factors were used during calculation." : "계산 시 기본 계수 fallback 사용 여부입니다."}
                />
                <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-blue)]">{en ? "Document Formula" : "문서 기준 계산식"}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--kr-gov-text-primary)]">
                    {stringOf(calculationResult.formulaDisplay || calculationResult.formulaSummary) || "-"}
                  </p>
                </div>
                <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{en ? "Actual Calculation" : "실제 계산식"}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--kr-gov-text-primary)]">
                    {stringOf(calculationResult.substitutedFormula) || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Calculation Log" : "계산 로그"}</p>
                  <div className="mt-3 space-y-3">
                    {arrayOf<Record<string, unknown>>(calculationResult.calculationLogs).map((log, index) => (
                      <article className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3" key={`calc-log-${index}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">
                            {stringOf(log.label) || (en ? "Step" : "단계")}
                            {numberOf(log.lineNo) > 0 ? ` · ${en ? "Line" : "라인"} ${numberOf(log.lineNo)}` : ""}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {stringOf(log.result) || "0"}
                          </span>
                        </div>
                        {stringOf(log.formula) ? <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{stringOf(log.formula)}</p> : null}
                        {stringOf(log.substituted) ? <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-primary)]">{stringOf(log.substituted)}</p> : null}
                        {stringOf(log.note) ? <p className="mt-2 text-xs leading-5 text-[var(--kr-gov-text-secondary)]">{stringOf(log.note)}</p> : null}
                      </article>
                    ))}
                    {arrayOf(calculationResult.calculationLogs).length === 0 ? (
                      <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No calculation steps were returned." : "계산 단계 로그가 없습니다."}</p>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Applied Factors" : "적용 계수"}</p>
                  <div className="mt-3 space-y-3">
                    {arrayOf<Record<string, unknown>>(calculationResult.appliedFactors).map((factor, index) => (
                      <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3" key={`factor-${index}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(factor.factorCode) || "-"}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--kr-gov-blue)]">{stringOf(factor.factorValue) || "-"}</span>
                            {Boolean(factor.defaultApplied) ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                                {en ? "Default" : "기본값"}
                              </span>
                            ) : null}
                          </div>
                        </div>
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
