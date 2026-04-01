import type { EmissionCategoryItem, EmissionVariableDefinition } from "../../lib/api/client";

export type InputRow = {
  lineNo: number;
  value: string;
};

export type InputMap = Record<string, InputRow[]>;
export type WizardStep = 1 | 2;
export type MajorCategoryOption = {
  key: string;
  majorCode: string;
  majorName: string;
};

export type VariableSection = {
  id: string;
  title: string;
  description: string;
  formula: string;
  codes: string[];
};

export type TierGuide = {
  formulaSummary: string;
  formulaDisplay: string;
  variables: EmissionVariableDefinition[];
};

type TierUiDefinition = {
  summationGroups?: string[][];
};

export const DEFAULT_INPUT_ROW: InputRow = { lineNo: 1, value: "" };

const TIER_UI_DEFINITIONS: Record<string, TierUiDefinition> = {};

const CACO3_FACTOR = 0.43971;
const MGCO3_FACTOR = 0.52197;
const CAMGCO32_FACTOR = 0.47732;
const FECO3_FACTOR = 0.37987;
const CAFE_MG_MN_CO32_FACTOR = 0.40822;
const MNCO3_FACTOR = 0.38286;
const NA2CO3_FACTOR = 0.41492;
const SR_CAO_DEFAULT = 0.785;
const SR_CAO_MGO_DEFAULT = 0.913;
const HIGH_CALCIUM_CONTENT_DEFAULT = 0.95;
const DOLOMITIC_HIGH_CONTENT_DEFAULT = 0.95;
const DOLOMITIC_LOW_CONTENT_DEFAULT = 0.85;
const HYDRAULIC_CONTENT_DEFAULT = 0.75;
const LIME_CF_LKD_DEFAULT = 1.02;
const HYDRATED_LIME_CORRECTION_DEFAULT = 0.97;

export function stringOf(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function tierUiDefinition(category: EmissionCategoryItem | null, tier: number) {
  const subCode = stringOf(category?.subCode).toUpperCase();
  return TIER_UI_DEFINITIONS[`${subCode}:${tier}`];
}

export function numberOf(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ratioOf(value: unknown) {
  const parsed = numberOf(value);
  if (parsed >= 1 && parsed <= 100) {
    return parsed / 100;
  }
  return parsed;
}

export function arrayOf<T = Record<string, unknown>>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isYes(value: unknown) {
  return stringOf(value).toUpperCase() === "Y";
}

export function isRepeatableVariable(variable: EmissionVariableDefinition) {
  return isYes(variable.isRepeatable ?? variable.repeatable);
}

export function isRequiredVariable(variable: EmissionVariableDefinition) {
  return isYes(variable.isRequired ?? variable.required);
}

export function variableCodeOf(variable: EmissionVariableDefinition) {
  return stringOf(variable.varCode).toUpperCase();
}

function normalizeToken(value: string) {
  return stringOf(value)
    .toUpperCase()
    .replace(/ /g, "")
    .replace(/_/g, "")
    .replace(/-/g, "")
    .replace(/·/g, "")
    .replace(/\./g, "")
    .replace(/내지/g, "");
}

export function carbonateFactorOf(value: string) {
  const normalized = normalizeToken(value);
  if (!normalized) {
    return "";
  }
  if (normalized.includes("CACO3") || normalized.includes("방해석") || normalized.includes("아라고나이트") || normalized.includes("CALCITE") || normalized.includes("ARAGONITE")) {
    return String(CACO3_FACTOR);
  }
  if (normalized.includes("MGCO3") || normalized.includes("마그네사이트") || normalized.includes("MAGNESITE")) {
    return String(MGCO3_FACTOR);
  }
  if (normalized.includes("CAMG(CO3)2") || normalized.includes("백운석") || normalized.includes("DOLOMITE")) {
    return String(CAMGCO32_FACTOR);
  }
  if (normalized.includes("FECO3") || normalized.includes("능철광") || normalized.includes("SIDERITE")) {
    return String(FECO3_FACTOR);
  }
  if (normalized.includes("CA(FE,MG,MN)(CO3)2") || normalized.includes("CAFEMGMNCO32") || normalized.includes("철백운석") || normalized.includes("ANKERITE")) {
    return String(CAFE_MG_MN_CO32_FACTOR);
  }
  if (normalized.includes("MNCO3") || normalized.includes("망간광")) {
    return String(MNCO3_FACTOR);
  }
  if (normalized.includes("NA2CO3") || normalized.includes("탄산나트륨") || normalized.includes("소다회") || normalized.includes("SODAASH")) {
    return String(NA2CO3_FACTOR);
  }
  return "";
}

export function variableOptions(variable: EmissionVariableDefinition, currentValue: string) {
  const options = arrayOf<Record<string, unknown>>(variable.options).map((option) => ({
    code: stringOf(option.code),
    label: stringOf(option.label) || stringOf(option.code)
  })).filter((option) => option.code);
  if (currentValue && !options.some((option) => option.code === currentValue)) {
    options.unshift({
      code: currentValue,
      label: `${currentValue}${options.length > 0 ? " (현재값)" : ""}`
    });
  }
  return options;
}

export function buildSummationGroups(category: EmissionCategoryItem | null, tier: number, variables: EmissionVariableDefinition[]) {
  const metadataGroups = new Map<string, string[]>();
  variables.forEach((variable) => {
    if (!isRepeatableVariable(variable)) {
      return;
    }
    const groupKey = stringOf(variable.repeatGroupKey);
    if (!groupKey) {
      return;
    }
    const nextCodes = metadataGroups.get(groupKey) || [];
    nextCodes.push(variableCodeOf(variable));
    metadataGroups.set(groupKey, nextCodes);
  });
  if (metadataGroups.size > 0) {
    return Array.from(metadataGroups.values()).filter((group) => group.length > 1);
  }
  const variableCodes = new Set(variables.filter((variable) => isRepeatableVariable(variable)).map((variable) => variableCodeOf(variable)));
  return (tierUiDefinition(category, tier)?.summationGroups || [])
    .map((group) => group.filter((code) => variableCodes.has(code)))
    .filter((group) => group.length > 1);
}

export function sortVariableDefinitions(variables: EmissionVariableDefinition[]) {
  return variables.slice().sort((left, right) => numberOf(left.sortOrder) - numberOf(right.sortOrder));
}

export function buildTierGuide(variables: EmissionVariableDefinition[], formulaSummary: unknown, formulaDisplay?: unknown): TierGuide {
  return {
    formulaSummary: stringOf(formulaSummary),
    formulaDisplay: stringOf(formulaDisplay),
    variables: sortVariableDefinitions(variables)
  };
}

export function isDerivedCarbonateFactorVariable(category: EmissionCategoryItem | null, tier: number, variable: EmissionVariableDefinition) {
  if (isYes(variable.derivedYn)) {
    return true;
  }
  void category;
  void tier;
  return false;
}

export function visibleVariablesForStep(category: EmissionCategoryItem | null, tier: number, variables: EmissionVariableDefinition[]) {
  return variables.filter((variable) => !isDerivedCarbonateFactorVariable(category, tier, variable));
}

export function displayVariableName(_category: EmissionCategoryItem | null, _tier: number, variable: EmissionVariableDefinition) {
  const backendDisplayName = stringOf(variable.displayName);
  if (backendDisplayName) {
    return backendDisplayName;
  }
  return stringOf(variable.varName) || stringOf(variable.varCode);
}

export function displayVariableCode(_category: EmissionCategoryItem | null, _tier: number, variable: EmissionVariableDefinition) {
  const backendDisplayCode = stringOf(variable.displayCode);
  if (backendDisplayCode) {
    return backendDisplayCode;
  }
  return stringOf(variable.varCode);
}

function limeTypeTokenForRow(inputs: InputMap, rowIndex: number) {
  return normalizeToken(inputs.LIME_TYPE?.[rowIndex]?.value || "");
}

export function resolveLimeTier2Type(inputs: InputMap, rowIndex: number) {
  const limeType = limeTypeTokenForRow(inputs, rowIndex);
  if (!limeType) {
    return "BLANK";
  }
  if (limeType === "A" || limeType.includes("고칼슘") || limeType.includes("HIGHCALCIUM")) {
    return "HIGH_CALCIUM";
  }
  if (limeType === "C" || limeType.includes("수경성") || limeType.includes("HYDRAULIC")) {
    return "HYDRAULIC";
  }
  if (limeType.includes("개도국") || limeType.includes("LOW") || limeType.includes("0.77")) {
    return "DOLOMITIC_LOW";
  }
  if (limeType.includes("선진국") || limeType.includes("HIGH") || limeType.includes("0.86")) {
    return "DOLOMITIC_HIGH";
  }
  if (limeType === "B" || limeType.includes("고토") || limeType.includes("DOLOMITIC")) {
    return "DOLOMITIC";
  }
  return "BLANK";
}

function rowValue(inputs: InputMap, code: string, rowIndex: number) {
  return inputs[code]?.[rowIndex]?.value || "";
}

function defaultLimeTier2Content(limeType: string) {
  if (limeType === "HIGH_CALCIUM") {
    return HIGH_CALCIUM_CONTENT_DEFAULT;
  }
  if (limeType === "HYDRAULIC") {
    return HYDRAULIC_CONTENT_DEFAULT;
  }
  if (limeType === "DOLOMITIC_LOW") {
    return DOLOMITIC_LOW_CONTENT_DEFAULT;
  }
  if (limeType === "DOLOMITIC_HIGH" || limeType === "DOLOMITIC") {
    return DOLOMITIC_HIGH_CONTENT_DEFAULT;
  }
  return 0;
}

export function limeTier2DerivedSummary(en: boolean, inputs: InputMap, rowIndex: number) {
  const limeType = resolveLimeTier2Type(inputs, rowIndex);
  const mli = numberOf(rowValue(inputs, "MLI", rowIndex));
  const cao = ratioOf(rowValue(inputs, "CAO_CONTENT", rowIndex));
  const mgo = ratioOf(rowValue(inputs, "MGO_CONTENT", rowIndex));
  const caoMgoRaw = ratioOf(rowValue(inputs, "CAO_MGO_CONTENT", rowIndex));
  const md = numberOf(rowValue(inputs, "MD", rowIndex));
  const cd = ratioOf(rowValue(inputs, "CD", rowIndex));
  const fd = ratioOf(rowValue(inputs, "FD", rowIndex));
  const hydratedYn = stringOf(rowValue(inputs, "HYDRATED_LIME_PRODUCTION_YN", rowIndex)).toUpperCase();
  const x = ratioOf(rowValue(inputs, "X", rowIndex));
  const y = ratioOf(rowValue(inputs, "Y", rowIndex));

  const usesCaoMgo = limeType === "DOLOMITIC" || limeType === "DOLOMITIC_HIGH" || limeType === "DOLOMITIC_LOW";
  const content = usesCaoMgo
    ? (caoMgoRaw > 0 ? caoMgoRaw : (cao + mgo > 0 ? cao + mgo : defaultLimeTier2Content(limeType)))
    : (cao > 0 ? cao : defaultLimeTier2Content(limeType));
  const ef = (usesCaoMgo ? SR_CAO_MGO_DEFAULT : SR_CAO_DEFAULT) * content;
  const cf = md > 0 && cd > 0 && fd > 0 && mli > 0 ? 1 + (md / mli) * cd * fd : LIME_CF_LKD_DEFAULT;
  const ch = hydratedYn === "N" ? 1 : hydratedYn === "Y" ? (x > 0 && y > 0 ? 1 - (x * y) : HYDRATED_LIME_CORRECTION_DEFAULT) : 1;
  const efA = SR_CAO_DEFAULT * (cao > 0 ? cao : defaultLimeTier2Content(limeType));
  const combinedForB = caoMgoRaw > 0 ? caoMgoRaw : (cao + mgo > 0 ? cao + mgo : defaultLimeTier2Content(limeType));
  const efB = SR_CAO_MGO_DEFAULT * combinedForB;
  const efC = SR_CAO_DEFAULT * (cao > 0 ? cao : defaultLimeTier2Content(limeType));

  return {
    ef,
    efAText: `${en ? "EF_lime,a" : "EF석회,a"} = ${SR_CAO_DEFAULT} × ${usesCaoMgo ? (cao > 0 ? cao.toFixed(4) : "CaO") : content.toFixed(4)} = ${efA.toFixed(6)}`,
    efBText: `${en ? "EF_lime,b" : "EF석회,b"} = ${SR_CAO_MGO_DEFAULT} × ${combinedForB.toFixed(4)} = ${efB.toFixed(6)}`,
    efCText: `${en ? "EF_lime,c" : "EF석회,c"} = ${SR_CAO_DEFAULT} × ${content.toFixed(4)} = ${efC.toFixed(6)}`,
    efText: usesCaoMgo
      ? `${en ? "Selected EF_lime,i" : "적용 EF석회,i"} = ${en ? "EF_lime,b" : "EF석회,b"} = ${ef.toFixed(6)}`
      : `${en ? "Selected EF_lime,i" : "적용 EF석회,i"} = ${limeType === "HYDRAULIC" ? (en ? "EF_lime,c" : "EF석회,c") : (en ? "EF_lime,a" : "EF석회,a")} = ${ef.toFixed(6)}`,
    cfText: md > 0 && cd > 0 && fd > 0 && mli > 0
      ? `${en ? "CF_lkd,i" : "CF_lkd,i"} = 1 + (${md} / ${mli}) × ${cd.toFixed(4)} × ${fd.toFixed(4)} = ${cf.toFixed(6)}`
      : `${en ? "CF_lkd,i" : "CF_lkd,i"} = ${LIME_CF_LKD_DEFAULT.toFixed(2)} ${en ? "(default)" : "(기본값)"}`,
    chText: hydratedYn === "N"
      ? `${en ? "C_h,i" : "C_h,i"} = 1.00 ${en ? "(hydrated lime not produced)" : "(수화석회 생산 안 함)"}`
      : hydratedYn === "Y"
        ? (x > 0 && y > 0
          ? `${en ? "C_h,i" : "C_h,i"} = 1 - (${x.toFixed(4)} × ${y.toFixed(4)}) = ${ch.toFixed(6)}`
          : `${en ? "C_h,i" : "C_h,i"} = ${HYDRATED_LIME_CORRECTION_DEFAULT.toFixed(2)} ${en ? "(hydrated lime default)" : "(수화석회 기본값)"}`)
        : `${en ? "C_h,i" : "C_h,i"} = 1.00 ${en ? "(select production status)" : "(생산 여부 선택 전)"}`
  };
}

export function isLimeTier2Scope(category: EmissionCategoryItem | null, tier: number) {
  return stringOf(category?.subCode).toUpperCase() === "LIME" && tier === 2;
}

export function buildVariableSections(en: boolean, category: EmissionCategoryItem | null, tier: number, variables: EmissionVariableDefinition[]): VariableSection[] {
  const metadataSections = new Map<string, VariableSection>();
  variables.forEach((variable) => {
    const sectionId = stringOf(variable.sectionId);
    if (!sectionId) {
      return;
    }
    const existing = metadataSections.get(sectionId);
    const code = variableCodeOf(variable);
    if (existing) {
      existing.codes.push(code);
      return;
    }
    metadataSections.set(sectionId, {
      id: sectionId,
      title: stringOf(variable.sectionTitle) || (en ? "Variable Inputs" : "변수 입력"),
      description: stringOf(variable.sectionDescription),
      formula: stringOf(variable.sectionFormula),
      codes: [code]
    });
  });
  if (metadataSections.size > 0) {
    return Array.from(metadataSections.values());
  }
  if (!isLimeTier2Scope(category, tier)) {
    return [{
      id: "default",
      title: en ? "Variable Inputs" : "변수 입력",
      description: en ? "Enter the variables required by the selected formula." : "선택한 계산식에 필요한 변수를 입력합니다.",
      formula: "",
      codes: variables.map((variable) => variableCodeOf(variable))
    }];
  }
  return [];
}

export function isLimeTier2DisabledField(category: EmissionCategoryItem | null, tier: number, inputs: InputMap, varCode: string, rowIndex: number) {
  const subCode = stringOf(category?.subCode).toUpperCase();
  if (subCode !== "LIME" || tier !== 2) {
    return false;
  }
  const limeType = limeTypeTokenForRow(inputs, rowIndex);
  if (!limeType) {
    return false;
  }
  const code = stringOf(varCode).toUpperCase();
  const resolvedType = resolveLimeTier2Type(inputs, rowIndex);
  const isDolomitic = resolvedType === "DOLOMITIC" || resolvedType === "DOLOMITIC_HIGH" || resolvedType === "DOLOMITIC_LOW";
  if (!isDolomitic && (code === "CAO_MGO_CONTENT" || code === "MGO_CONTENT")) {
    return true;
  }
  if ((code === "X" || code === "Y") && stringOf(inputs.HYDRATED_LIME_PRODUCTION_YN?.[rowIndex]?.value).toUpperCase() === "N") {
    return true;
  }
  return false;
}

export function shouldShowLimeTier2Variable(category: EmissionCategoryItem | null, tier: number, inputs: InputMap, varCode: string) {
  const subCode = stringOf(category?.subCode).toUpperCase();
  if (subCode !== "LIME" || tier !== 2) {
    return true;
  }
  const code = stringOf(varCode).toUpperCase();
  if (code === "MGO_CONTENT") {
    return false;
  }
  const limeRows = inputs.LIME_TYPE || [];
  const hasDolomitic = limeRows.some((_, rowIndex) => {
    const resolvedType = resolveLimeTier2Type(inputs, rowIndex);
    return resolvedType === "DOLOMITIC" || resolvedType === "DOLOMITIC_HIGH" || resolvedType === "DOLOMITIC_LOW";
  });
  const hasNonDolomitic = limeRows.length === 0 || limeRows.some((_, rowIndex) => {
    const resolvedType = resolveLimeTier2Type(inputs, rowIndex);
    return resolvedType === "BLANK" || resolvedType === "HIGH_CALCIUM" || resolvedType === "HYDRAULIC";
  });
  if (code === "CAO_CONTENT") {
    return hasNonDolomitic;
  }
  if (code === "CAO_MGO_CONTENT") {
    return hasDolomitic;
  }
  return true;
}

export function isLimeTier2SupplementalVariable(_category: EmissionCategoryItem | null, _tier: number, variable: EmissionVariableDefinition) {
  if (isYes(variable.supplementalYn)) {
    return true;
  }
  return false;
}

export function limeTier2VariableHint(_en: boolean, _category: EmissionCategoryItem | null, _tier: number, variable: EmissionVariableDefinition) {
  const backendHint = stringOf(variable.uiHint);
  if (backendHint) {
    return backendHint;
  }
  return "";
}

export function tier2FieldPlaceholder(en: boolean, category: EmissionCategoryItem | null, tier: number, inputs: InputMap, varCode: string, rowIndex: number, unit: string) {
  if (!isLimeTier2DisabledField(category, tier, inputs, varCode, rowIndex)) {
    return unit || (en ? "Enter value" : "값 입력");
  }
  return en ? "Not used for the selected lime type" : "선택한 석회 유형에서는 사용하지 않습니다";
}

export function majorCategoryKey(category: EmissionCategoryItem | null | undefined) {
  return `${stringOf(category?.majorCode)}::${stringOf(category?.majorName)}`;
}

export function majorCategoryLabel(option: MajorCategoryOption | null, en: boolean) {
  if (!option) {
    return en ? "Not selected" : "미선택";
  }
  return `${option.majorName}${option.majorCode ? ` (${option.majorCode})` : ""}`;
}

export function buildMajorCategoryOptions(categories: EmissionCategoryItem[]) {
  const deduped = new Map<string, MajorCategoryOption>();
  categories.forEach((category) => {
    const key = majorCategoryKey(category);
    if (!key || deduped.has(key)) {
      return;
    }
    deduped.set(key, {
      key,
      majorCode: stringOf(category.majorCode),
      majorName: stringOf(category.majorName)
    });
  });
  return Array.from(deduped.values()).sort((left, right) => left.majorName.localeCompare(right.majorName, "ko"));
}

export function buildEmptyInputs(variables: EmissionVariableDefinition[]) {
  const next: InputMap = {};
  variables.forEach((variable) => {
    const code = stringOf(variable.varCode);
    if (!code) {
      return;
    }
    next[code] = [DEFAULT_INPUT_ROW];
  });
  return next;
}

export function hydrateInputs(variables: EmissionVariableDefinition[], values: Array<Record<string, unknown>>) {
  const grouped = new Map<string, InputRow[]>();
  values.forEach((value) => {
    const code = stringOf(value.varCode);
    if (!code) {
      return;
    }
    const rows = grouped.get(code) || [];
    rows.push({
      lineNo: Math.max(1, numberOf(value.lineNo) || rows.length + 1),
      value: value.valueNum == null ? stringOf(value.valueText) : String(value.valueNum)
    });
    grouped.set(code, rows);
  });

  const next: InputMap = {};
  variables.forEach((variable) => {
    const code = stringOf(variable.varCode);
    if (!code) {
      return;
    }
    const rows = (grouped.get(code) || []).sort((left, right) => left.lineNo - right.lineNo);
    next[code] = rows.length > 0 ? rows : [DEFAULT_INPUT_ROW];
  });
  return next;
}

export function syncLineNumbers(rows: InputRow[]) {
  return rows.map((row, index) => ({ ...row, lineNo: index + 1 }));
}

export function alignedRowsForRemoval(rows: InputRow[], rowIndex: number) {
  const nextRows = syncLineNumbers(rows.filter((_, index) => index !== rowIndex));
  return nextRows.length > 0 ? nextRows : [DEFAULT_INPUT_ROW];
}
