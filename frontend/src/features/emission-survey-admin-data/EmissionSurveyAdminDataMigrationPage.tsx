import { useEffect, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionGwpValuesPage,
  fetchEmissionSurveyAdminDataPage,
  getEmissionSurveyAdminBlankTemplateDownloadUrl,
  previewEmissionSurveySharedDataset,
  replaceEmissionSurveySharedDatasetSections
} from "../../lib/api/emission";
import type {
  EmissionSurveyAdminDataPagePayload,
  EmissionSurveyAdminRow,
  EmissionSurveyAdminSection
} from "../../lib/api/emissionTypes";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, MemberButton, PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect } from "../member/common";

type GwpCandidateRow = Record<string, string>;
type FactorType = "ECOINVENT" | "AR4" | "AR5" | "AR6" | "DIRECT";
type ArFactorType = "AR4" | "AR5" | "AR6";

type MappingTarget = {
  sectionIndex: number;
  rowIndex: number;
  rowId: string;
  materialName: string;
  allowArSelection: boolean;
};

function stringOf(row: Record<string, unknown> | null | undefined, key: string) {
  if (!row) {
    return "";
  }
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

function normalizeText(value: string) {
  return String(value || "").trim().toLowerCase();
}

function normalizedValue(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function displayValue(value: unknown) {
  const normalized = normalizedValue(value);
  return normalized === "" ? "-" : normalized;
}

function isArFactorType(value: string): value is ArFactorType {
  return value === "AR4" || value === "AR5" || value === "AR6";
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

function resolveSearchKeyword(values: Record<string, string>) {
  return normalizedValue(values.gwpMappedName) || normalizedValue(values.materialName);
}

function isAirEmissionSection(section: Record<string, unknown> | EmissionSurveyAdminSection) {
  const sectionCode = normalizeText(stringOf(section as Record<string, unknown>, "sectionCode")).replace(/\s+/g, "");
  const sectionLabel = normalizeText(stringOf(section as Record<string, unknown>, "sectionLabel")).replace(/\s+/g, "");
  return sectionCode === "output_air" || sectionLabel === "대기배출물";
}

function hasMappedValue(values: Record<string, string>) {
  return mappingSummary(values) !== null;
}

function needsMappingAttention(values: Record<string, string>) {
  return Boolean(resolveSearchKeyword(values)) && !hasMappedValue(values);
}

function cloneSections(sections: EmissionSurveyAdminSection[]) {
  return sections.map((section) => ({
    ...section,
    metadata: Array.isArray(section.metadata) ? section.metadata.map((item) => ({ ...item })) : [],
    columns: Array.isArray(section.columns) ? section.columns.map((column) => ({ ...column })) : [],
    rows: Array.isArray(section.rows)
      ? section.rows.map((row) => ({
          ...row,
          values: { ...((row.values || {}) as Record<string, string>) }
        }))
      : []
  }));
}

function resolveFactorValue(candidate: GwpCandidateRow | null, factorType: FactorType, directValue: string) {
  if (factorType === "DIRECT") {
    return directValue.trim();
  }
  if (!candidate) {
    return "";
  }
  if (factorType === "ECOINVENT") {
    return normalizedValue(candidate.manualInputValue);
  }
  if (factorType === "AR4") {
    return normalizedValue(candidate.ar4Value);
  }
  if (factorType === "AR5") {
    return normalizedValue(candidate.ar5Value);
  }
  return normalizedValue(candidate.ar6Value);
}

function resolveStoredFactorValue(values: Record<string, string>, factorType: ArFactorType) {
  if (factorType === "AR4") {
    return normalizedValue(values.gwpAr4Value);
  }
  if (factorType === "AR5") {
    return normalizedValue(values.gwpAr5Value);
  }
  return normalizedValue(values.gwpAr6Value);
}

function factorLabel(factorType: string) {
  if (factorType === "ECOINVENT") {
    return "Ecoinvent";
  }
  if (factorType === "AR4" || factorType === "AR5" || factorType === "AR6") {
    return factorType;
  }
  if (factorType === "DIRECT") {
    return "직접입력";
  }
  return factorType || "-";
}

function mappingSummary(values: Record<string, string>) {
  const mappedName = normalizedValue(values.gwpMappedName);
  const factorType = normalizedValue(values.gwpValueType);
  const factorValue = normalizedValue(values.gwpValue);
  if (!mappedName && !factorType && !factorValue) {
    return null;
  }
  return {
    mappedName: mappedName || "-",
    factorType: factorLabel(factorType),
    factorValue: factorValue || "-"
  };
}

function applyMappedValues(values: Record<string, string>, candidate: GwpCandidateRow, factorType: FactorType, directValue: string) {
  const factorValue = resolveFactorValue(candidate, factorType, directValue);
  return {
    ...values,
    gwpMappedRowId: normalizedValue(candidate.rowId),
    gwpMappedName: normalizedValue(candidate.commonName),
    gwpMappedSource: normalizedValue(candidate.source),
    gwpValueType: factorType,
    gwpValue: factorValue,
    gwpDirectValue: factorType === "DIRECT" ? directValue.trim() : "",
    gwpReferenceValue: factorType === "ECOINVENT" ? normalizedValue(candidate.manualInputValue) : "",
    gwpAr4Value: normalizedValue(candidate.ar4Value),
    gwpAr5Value: normalizedValue(candidate.ar5Value),
    gwpAr6Value: normalizedValue(candidate.ar6Value)
  };
}

function applyAutoEcoinventMapping(values: Record<string, string>, candidate: GwpCandidateRow | null) {
  if (!candidate || !normalizedValue(candidate.manualInputValue)) {
    return values;
  }
  return applyMappedValues(values, candidate, "ECOINVENT", "");
}

function renderSectionTable(
  section: Record<string, unknown> | EmissionSurveyAdminSection,
  key: string,
  options?: {
    editable?: boolean;
    sectionIndex?: number;
    onOpenMapping?: (sectionIndex: number, rowIndex: number, row: EmissionSurveyAdminRow) => void;
  }
) {
  const rows = ((section.rows || []) as Array<Record<string, unknown>>);
  const columns = ((section.columns || []) as Array<Record<string, unknown>>);
  const metadata = ((section.metadata || []) as Array<Record<string, unknown>>).filter(
    (item) => stringOf(item, "label") || stringOf(item, "value")
  );
  const editable = Boolean(options?.editable);
  return (
    <article className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-4" key={key}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kr-gov-blue)]">{stringOf(section as Record<string, unknown>, "majorCode") || "-"}</p>
          <h3 className="mt-1 text-xl font-black text-[var(--kr-gov-text-primary)]">{stringOf(section as Record<string, unknown>, "sectionLabel") || stringOf(section as Record<string, unknown>, "sectionCode") || "-"}</h3>
          <p className="mt-1 text-xs text-slate-500">행 수 {rows.length} / 컬럼 {columns.length} / 저장 {stringOf(section as Record<string, unknown>, "savedAt") || "-"}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{stringOf(section as Record<string, unknown>, "caseCode") || "CASE_3_1"}</span>
      </div>
      {metadata.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {metadata.map((item, index) => (
            <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800" key={`${key}-metadata-${index}`}>
              <span className="font-bold">{stringOf(item, "label") || "-"}</span>
              <span className="ml-1">{displayValue(stringOf(item, "value"))}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2">No.</th>
              {columns.map((column) => (
                <th className="px-2 py-2" key={stringOf(column, "key")}>{stringOf(column, "label") || stringOf(column, "key")}</th>
              ))}
              {editable ? <th className="px-2 py-2">GWP 매핑</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const values = ((row.values || {}) as Record<string, string>);
              const summary = mappingSummary(values);
              const requiresAttention = editable && needsMappingAttention(values);
              return (
                <tr className={`border-b border-slate-100 ${requiresAttention ? "bg-rose-50/70" : ""}`} key={`${key}-${index}`}>
                  <td className="whitespace-nowrap px-2 py-2 font-bold text-slate-500">{index + 1}</td>
                  {columns.map((column) => (
                    <td className="px-2 py-2" key={`${key}-${index}-${stringOf(column, "key")}`}>{displayValue(values[stringOf(column, "key")])}</td>
                  ))}
                  {editable ? (
                    <td className="min-w-[220px] px-2 py-2">
                      <div className="space-y-2">
                        {summary ? (
                          <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-2 text-[11px] text-emerald-800">
                            <div className="font-bold">{summary.mappedName}</div>
                            <div>{summary.factorType} / {summary.factorValue}</div>
                          </div>
                        ) : (
                          <div className={`rounded border px-2 py-2 text-[11px] ${requiresAttention ? "border-rose-200 bg-rose-50 text-rose-700" : "border-dashed border-slate-300 bg-slate-50 text-slate-500"}`}>
                            {requiresAttention ? "Ecoinvent 자동 매핑 값이 없습니다. 팝업에서 직접 지정하세요." : "아직 매핑되지 않았습니다."}
                          </div>
                        )}
                        <MemberButton
                          onClick={() => options?.onOpenMapping?.(options.sectionIndex || 0, index, row as EmissionSurveyAdminRow)}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          매핑
                        </MemberButton>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td className="px-2 py-6 text-center text-slate-500" colSpan={Math.max(columns.length + (editable ? 2 : 1), 2)}>데이터 행이 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function GwpMappingModal({
  target,
  searchKeyword,
  onSearchKeywordChange,
  rows,
  selectedCandidateId,
  onSelectCandidate,
  allowArSelection,
  datasetArVersion,
  onDatasetArVersionChange,
  factorType,
  onFactorTypeChange,
  directValue,
  onDirectValueChange,
  onSearch,
  loading,
  onClose,
  onApply
}: {
  target: MappingTarget;
  searchKeyword: string;
  onSearchKeywordChange: (value: string) => void;
  rows: GwpCandidateRow[];
  selectedCandidateId: string;
  onSelectCandidate: (rowId: string) => void;
  allowArSelection: boolean;
  datasetArVersion: ArFactorType;
  onDatasetArVersionChange: (value: ArFactorType) => void;
  factorType: FactorType;
  onFactorTypeChange: (value: FactorType) => void;
  directValue: string;
  onDirectValueChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  const selectedCandidate = rows.find((row) => String(row.rowId || "") === selectedCandidateId) || null;
  const ecoinventValue = normalizedValue(selectedCandidate?.manualInputValue);
  const datasetArPreview = displayValue(
    datasetArVersion === "AR4"
      ? selectedCandidate?.ar4Value
      : datasetArVersion === "AR5"
        ? selectedCandidate?.ar5Value
        : selectedCandidate?.ar6Value
  );
  const factorOptions: Array<{ value: FactorType; label: string; preview: string; disabled?: boolean }> = [
    { value: "ECOINVENT", label: "Ecoinvent", preview: ecoinventValue || "임의 입력값 없음", disabled: !ecoinventValue },
    ...(allowArSelection ? [{ value: datasetArVersion, label: `공통 AR 버전 (${datasetArVersion})`, preview: datasetArPreview }] : []),
    { value: "DIRECT", label: "직접입력", preview: directValue.trim() || "-" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[var(--kr-gov-radius)] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-[var(--kr-gov-text-primary)]">GWP 매핑</h3>
            <p className="mt-1 text-sm text-slate-500">대상 물질: {target.materialName || "-"}</p>
          </div>
          <MemberButton onClick={onClose} size="sm" type="button" variant="secondary">닫기</MemberButton>
        </div>
        <div className="grid gap-4 overflow-y-auto px-5 py-5 lg:grid-cols-[1.4fr,1fr]">
          <section className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr,120px]">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">물질 검색</span>
                <AdminInput value={searchKeyword} onChange={(event) => onSearchKeywordChange(event.target.value)} />
              </label>
              <div className="flex items-end">
                <MemberButton onClick={onSearch} type="button" variant="primary">{loading ? "검색 중..." : "검색"}</MemberButton>
              </div>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-slate-200">
              <div className="grid grid-cols-[120px,1.2fr,0.7fr,0.7fr,0.7fr,1fr,1fr,80px] border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                <div className="px-3 py-2">우선순위</div>
                <div className="px-3 py-2">물질</div>
                <div className="px-3 py-2">AR4</div>
                <div className="px-3 py-2">AR5</div>
                <div className="px-3 py-2">AR6</div>
                <div className="px-3 py-2">출처</div>
                <div className="px-3 py-2">Ecoinvent/임의값</div>
                <div className="px-3 py-2 text-center">선택</div>
              </div>
              <div className="max-h-[48vh] overflow-y-auto">
                {rows.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-500">검색 결과가 없습니다.</div>
                ) : (
                  rows.map((row) => {
                    const selected = String(row.rowId || "") === selectedCandidateId;
                    return (
                      <div className={`grid grid-cols-[120px,1.2fr,0.7fr,0.7fr,0.7fr,1fr,1fr,80px] border-b border-slate-100 text-sm ${selected ? "bg-blue-50/70" : ""}`} key={String(row.rowId || row.commonName || Math.random())}>
                        <div className="px-3 py-3 text-[11px] font-bold text-[var(--kr-gov-blue)]">
                          {mapPriority(row, searchKeyword) === 0 ? "1순위 Ecoinvent" : mapPriority(row, searchKeyword) === 1 ? "정확 일치" : "후보"}
                        </div>
                        <div className="px-3 py-3">
                          <p className="font-bold text-slate-900">{displayValue(row.commonName)}</p>
                          <p className="mt-1 text-xs text-slate-500">{displayValue(row.note)}</p>
                        </div>
                        <div className="px-3 py-3">{displayValue(row.ar4Value)}</div>
                        <div className="px-3 py-3">{displayValue(row.ar5Value)}</div>
                        <div className="px-3 py-3">{displayValue(row.ar6Value)}</div>
                        <div className="px-3 py-3 text-xs text-slate-600">{displayValue(row.source)}</div>
                        <div className="px-3 py-3 font-mono text-xs text-slate-600">{displayValue(row.manualInputValue)}</div>
                        <div className="flex items-center justify-center px-3 py-3">
                          <MemberButton onClick={() => onSelectCandidate(String(row.rowId || ""))} size="sm" type="button" variant={selected ? "primary" : "secondary"}>선택</MemberButton>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">선택된 물질</p>
              <p className="mt-2 text-base font-black text-[var(--kr-gov-text-primary)]">{selectedCandidate ? displayValue(selectedCandidate.commonName) : "먼저 물질을 선택하세요."}</p>
              {selectedCandidate ? (
                <p className="mt-2 text-xs text-slate-500">출처: {displayValue(selectedCandidate.source)} / 임의값: {displayValue(selectedCandidate.manualInputValue)}</p>
              ) : null}
            </div>

            <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-800">배출계수 선택</p>
              {allowArSelection ? (
                <label className="mt-3 block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">대기 배출물 공통 AR 버전</span>
                  <AdminSelect onChange={(event) => onDatasetArVersionChange(event.target.value as ArFactorType)} value={datasetArVersion}>
                    <option value="AR4">AR4</option>
                    <option value="AR5">AR5</option>
                    <option value="AR6">AR6</option>
                  </AdminSelect>
                </label>
              ) : null}
              <div className="mt-3 space-y-2">
                {factorOptions.map((option) => (
                  <label className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-3 ${factorType === option.value ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"} ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`} key={option.value}>
                    <input
                      checked={factorType === option.value}
                      disabled={option.disabled}
                      name="gwp-factor-type"
                      onChange={() => onFactorTypeChange(option.value)}
                      type="radio"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">{option.label}</span>
                      <span className="block text-xs text-slate-500">{option.preview}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">직접 입력값</span>
                <AdminInput value={directValue} onChange={(event) => onDirectValueChange(event.target.value)} />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <MemberButton onClick={onClose} type="button" variant="secondary">취소</MemberButton>
              <MemberButton onClick={onApply} type="button" variant="primary">이 행에 적용</MemberButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function EmissionSurveyAdminDataMigrationPage() {
  const en = isEnglish();
  const pageTitle = en ? "Shared Dataset Excel Apply" : "공통 데이터셋 엑셀 반영";
  const pageSubtitle = en
    ? "Upload a workbook, compare it with the current DB dataset, map GWP rows, and then replace the shared dataset."
    : "엑셀 파일을 업로드해 현재 DB 데이터와 비교하고, GWP 매핑까지 확정한 뒤 공통 데이터셋에 반영합니다.";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewPayload, setPreviewPayload] = useState<Record<string, unknown> | null>(null);
  const [editablePreviewSections, setEditablePreviewSections] = useState<EmissionSurveyAdminSection[]>([]);
  const [mappingTarget, setMappingTarget] = useState<MappingTarget | null>(null);
  const [mappingSearchKeyword, setMappingSearchKeyword] = useState("");
  const [mappingRows, setMappingRows] = useState<GwpCandidateRow[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [datasetArVersion, setDatasetArVersion] = useState<ArFactorType>("AR6");
  const [factorType, setFactorType] = useState<FactorType>("ECOINVENT");
  const [directValue, setDirectValue] = useState("");

  const pageState = useAsyncValue<EmissionSurveyAdminDataPagePayload>(
    () => fetchEmissionSurveyAdminDataPage({}),
    []
  );
  const page = pageState.value || null;
  const pageExistingSections = ((page?.selectedDatasetSectionRows || []) as Array<Record<string, unknown>>);
  const previewExistingSections = ((previewPayload?.existingDatasetSectionRows || []) as Array<Record<string, unknown>>);
  const existingSections = previewPayload ? previewExistingSections : pageExistingSections;
  const previewMessage = stringOf((previewPayload || {}) as Record<string, unknown>, "previewMessage");

  async function autoMapSectionsWithEcoinvent(sections: EmissionSurveyAdminSection[]) {
    const searchKeywords = Array.from(
      new Set(
        sections.flatMap((section) =>
          ((section.rows || []) as EmissionSurveyAdminRow[])
            .map((row) => resolveSearchKeyword((row.values || {}) as Record<string, string>))
            .filter(Boolean)
        )
      )
    );
    const results = await Promise.allSettled(
      searchKeywords.map(async (keyword) => {
        const payload = await fetchEmissionGwpValuesPage({ searchKeyword: keyword });
        const rows = (((payload.gwpRows || []) as Array<Record<string, string>>))
          .slice()
          .sort((left, right) => mapPriority(left, keyword) - mapPriority(right, keyword));
        const candidate = rows.find((row) => normalizedValue(row.manualInputValue)) || null;
        return [keyword, candidate] as const;
      })
    );
    const candidateMap = new Map<string, GwpCandidateRow | null>();
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        candidateMap.set(result.value[0], result.value[1]);
      }
    });
    return sections.map((section) => ({
      ...section,
      rows: ((section.rows || []) as EmissionSurveyAdminRow[]).map((row) => {
        const values = { ...((row.values || {}) as Record<string, string>) };
        const candidate = candidateMap.get(resolveSearchKeyword(values)) || null;
        return {
          ...row,
          values: applyAutoEcoinventMapping(values, candidate)
        };
      })
    }));
  }

  useEffect(() => {
    logGovernanceScope("PAGE", "emission-survey-admin-data", {
      language: en ? "en" : "ko",
      existingSectionCount: existingSections.length,
      previewSectionCount: editablePreviewSections.length
    });
  }, [en, existingSections.length, editablePreviewSections.length]);

  useEffect(() => {
    setEditablePreviewSections((current) => current.map((section) => ({
      ...section,
      rows: ((section.rows || []) as EmissionSurveyAdminRow[]).map((row) => {
        const values = { ...((row.values || {}) as Record<string, string>) };
        const currentType = normalizedValue(values.gwpValueType);
        if (!isArFactorType(currentType)) {
          return row;
        }
        return {
          ...row,
          values: {
            ...values,
            gwpValueType: datasetArVersion,
            gwpValue: resolveStoredFactorValue(values, datasetArVersion)
          }
        };
      })
    })));
  }, [datasetArVersion]);

  async function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      return;
    }
    setUploading(true);
    setMessage("");
    setErrorMessage("");
    try {
      const payload = await previewEmissionSurveySharedDataset(nextFile);
      const previewSections = cloneSections(((payload.sections || []) as EmissionSurveyAdminSection[]));
      const autoMappedSections = await autoMapSectionsWithEcoinvent(previewSections);
      const totalRows = autoMappedSections.reduce((sum, section) => sum + (((section.rows || []) as EmissionSurveyAdminRow[]).length), 0);
      const unmappedRows = autoMappedSections.reduce(
        (sum, section) =>
          sum + (((section.rows || []) as EmissionSurveyAdminRow[]).filter((row) => needsMappingAttention((row.values || {}) as Record<string, string>)).length),
        0
      );
      setUploadedFile(nextFile);
      setPreviewPayload(payload as Record<string, unknown>);
      setEditablePreviewSections(autoMappedSections);
      setDatasetArVersion("AR6");
      setMessage(
        stringOf((payload as Record<string, unknown>), "previewMessage")
          || `관리자 업로드 양식 미리보기를 불러왔습니다. ${Math.max(totalRows - unmappedRows, 0)}행은 Ecoinvent로 자동 매핑했고, ${unmappedRows}행은 추가 확인이 필요합니다.`
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "관리자 업로드 양식 미리보기에 실패했습니다.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  async function handleApplyUploadedFile() {
    if (!uploadedFile || !previewPayload || editablePreviewSections.length === 0) {
      setErrorMessage("먼저 관리자 업로드 양식을 업로드하세요.");
      return;
    }
    setApplying(true);
    setMessage("");
    setErrorMessage("");
    try {
      const payload = await replaceEmissionSurveySharedDatasetSections({
        sourceFileName: uploadedFile.name,
        sourcePath: stringOf(previewPayload, "sourcePath"),
        targetPath: stringOf(previewPayload, "targetPath"),
        sections: editablePreviewSections as Array<Record<string, unknown>>
      });
      setMessage(stringOf((payload as Record<string, unknown>), "message") || "업로드 파일 내용을 DB에 반영했습니다.");
      await pageState.reload();
      setPreviewPayload(null);
      setEditablePreviewSections([]);
      setUploadedFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "업로드 파일을 DB에 반영하지 못했습니다.");
    } finally {
      setApplying(false);
    }
  }

  function handleOpenMapping(sectionIndex: number, rowIndex: number, row: EmissionSurveyAdminRow) {
    const section = editablePreviewSections[sectionIndex];
    const values = { ...((row.values || {}) as Record<string, string>) };
    setMappingTarget({
      sectionIndex,
      rowIndex,
      rowId: String(row.rowId || ""),
      materialName: String(values.materialName || ""),
      allowArSelection: isAirEmissionSection(section || {})
    });
    setMappingSearchKeyword(String(values.gwpMappedName || values.materialName || ""));
    setMappingRows([]);
    setSelectedCandidateId(String(values.gwpMappedRowId || ""));
    setFactorType(isArFactorType(String(values.gwpValueType || "")) ? datasetArVersion : (String(values.gwpValueType || "ECOINVENT") as FactorType));
    setDirectValue(String(values.gwpDirectValue || values.gwpValue || ""));
  }

  async function handleSearchMapping() {
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
      if (rows.length > 0) {
        const nextSelectedCandidateId = String(rows[0].rowId || "");
        setSelectedCandidateId(nextSelectedCandidateId);
        if (normalizedValue(rows[0].manualInputValue)) {
          setFactorType("ECOINVENT");
        } else if (mappingTarget.allowArSelection && factorType !== "DIRECT") {
          setFactorType(datasetArVersion);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "GWP 검색에 실패했습니다.");
    } finally {
      setMappingLoading(false);
    }
  }

  function handleApplyMapping() {
    if (!mappingTarget) {
      return;
    }
    const candidate = mappingRows.find((row) => String(row.rowId || "") === selectedCandidateId) || null;
    if (!candidate) {
      setErrorMessage("먼저 매핑할 물질을 선택하세요.");
      return;
    }
    if (factorType === "DIRECT" && !directValue.trim()) {
      setErrorMessage("직접 입력값을 입력하세요.");
      return;
    }
    if (factorType === "ECOINVENT" && !normalizedValue(candidate.manualInputValue)) {
      setErrorMessage("선택한 물질에는 Ecoinvent 임의 입력값이 없습니다.");
      return;
    }
    setEditablePreviewSections((current) => current.map((section, sectionIndex) => {
      if (sectionIndex !== mappingTarget.sectionIndex) {
        return section;
      }
      return {
        ...section,
        rows: ((section.rows || []) as EmissionSurveyAdminRow[]).map((row, rowIndex) => {
          if (rowIndex !== mappingTarget.rowIndex || String(row.rowId || "") !== mappingTarget.rowId) {
            return row;
          }
          const values = { ...((row.values || {}) as Record<string, string>) };
          return {
            ...row,
            values: applyMappedValues(values, candidate, factorType, directValue)
          };
        })
      };
    }));
    setMessage(`${String(candidate.commonName || "-")} / ${factorLabel(factorType)} 매핑을 적용했습니다.`);
    setMappingTarget(null);
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Emissions & Certification" : "배출/인증" },
        { label: pageTitle }
      ]}
      title={pageTitle}
      subtitle={pageSubtitle}
      loading={pageState.loading && !page && !pageState.error}
      loadingLabel={en ? "Loading the survey dataset workspace..." : "설문 데이터셋 작업공간을 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}
        {errorMessage || pageState.error ? <PageStatusNotice tone="error">{errorMessage || pageState.error}</PageStatusNotice> : null}

        <CollectionResultPanel
          data-help-id="emission-survey-admin-data-upload"
          description={en
            ? "Upload the administrator workbook, map each row to a GWP substance plus one of five factor choices, and then apply the edited dataset to DB."
            : "관리자 업로드 양식을 업로드한 뒤 각 행에 대해 GWP 물질과 5종 배출계수 중 하나를 매핑하고, 수정된 데이터셋을 DB에 반영합니다."}
          title={en ? "Administrator Workbook Upload" : "관리자 양식 업로드"}
        >
          <input accept=".xlsx" className="hidden" onChange={handleUploadChange} ref={fileInputRef} type="file" />
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4">
            <MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">
              {uploading ? (en ? "Uploading..." : "업로드 중...") : (en ? "Admin Workbook Upload" : "관리자 양식 업로드")}
            </MemberButton>
            <MemberButton onClick={() => { window.location.href = getEmissionSurveyAdminBlankTemplateDownloadUrl(); }} title={en ? "Download the administrator workbook" : "관리자 업로드 양식을 다운로드합니다."} type="button" variant="secondary">
              {en ? "Admin Workbook" : "관리자 업로드 양식"}
            </MemberButton>
            <MemberButton disabled={!uploadedFile || applying || editablePreviewSections.length === 0} onClick={() => void handleApplyUploadedFile()} type="button" variant="secondary">
              {applying ? (en ? "Applying To DB..." : "DB 반영 중...") : (en ? "Apply Uploaded Dataset To DB" : "매핑된 업로드 데이터 DB 반영")}
            </MemberButton>
            <span className="text-xs text-slate-500">
              {uploadedFile
                ? `업로드 파일: ${uploadedFile.name}`
                : "관리자 업로드 양식은 업로드 직후 Ecoinvent 자동 매핑을 먼저 시도하고, 분홍색 행만 팝업에서 보정한 뒤 반영 버튼을 눌렀을 때만 기존 DB를 덮어씁니다."}
            </span>
          </div>
        </CollectionResultPanel>

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CollectionResultPanel
            data-help-id="emission-survey-admin-data-dataset"
            description={existingSections.length > 0
              ? "이미 DB에 아래와 같이 있습니다."
              : "현재 DB에 저장된 공통 데이터가 없습니다."}
            title={en ? "Current DB Dataset" : "기존 DB 데이터"}
          >
            {existingSections.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-500">기존 DB 데이터가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {existingSections.map((section, index) => renderSectionTable(section, `existing-${stringOf(section, "sectionCode")}-${index}`))}
              </div>
            )}
          </CollectionResultPanel>

          <CollectionResultPanel
            data-help-id="emission-survey-admin-data-preview"
            description={previewPayload
              ? (previewMessage || "업로드한 파일의 내용은 아래와 같습니다. 각 행에서 GWP 물질과 배출계수를 선택한 뒤 반영 버튼을 누르세요.")
              : "엑셀 파일을 업로드하면 파일에서 읽은 내용을 여기서 미리 보고, 각 행별 GWP 매핑을 추가할 수 있습니다."}
            title={en ? "Uploaded File Preview" : "업로드 파일 미리보기"}
          >
            {!previewPayload ? (
              <div className="px-3 py-6 text-sm text-slate-500">아직 업로드한 파일이 없습니다.</div>
            ) : editablePreviewSections.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-500">파일에서 읽은 섹션이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {editablePreviewSections.map((section, index) => renderSectionTable(section, `preview-${section.sectionCode || index}`, {
                  editable: true,
                  sectionIndex: index,
                  onOpenMapping: handleOpenMapping
                }))}
              </div>
            )}
          </CollectionResultPanel>
        </section>

        {mappingTarget ? (
          <GwpMappingModal
            allowArSelection={mappingTarget.allowArSelection}
            datasetArVersion={datasetArVersion}
            onDatasetArVersionChange={setDatasetArVersion}
            directValue={directValue}
            factorType={factorType}
            loading={mappingLoading}
            onApply={handleApplyMapping}
            onClose={() => setMappingTarget(null)}
            onDirectValueChange={setDirectValue}
            onFactorTypeChange={setFactorType}
            onSearch={() => void handleSearchMapping()}
            onSearchKeywordChange={setMappingSearchKeyword}
            onSelectCandidate={setSelectedCandidateId}
            rows={mappingRows}
            searchKeyword={mappingSearchKeyword}
            selectedCandidateId={selectedCandidateId}
            target={mappingTarget}
          />
        ) : null}
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
