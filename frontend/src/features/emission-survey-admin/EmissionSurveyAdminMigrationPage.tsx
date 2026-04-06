import { useEffect, useMemo, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionSurveyAdminPage,
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

const STORAGE_KEY = "carbonet.emission-survey-admin.draft.v1";

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
    return raw ? JSON.parse(raw) as DraftState : {};
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
          values: { ...((row.values || {}) as Record<string, string>) }
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

function buildRowsFromSection(section: EmissionSurveyAdminSection | undefined): DraftRow[] {
  return ((section?.rows || []) as Array<Record<string, unknown>>).map((row, index) => ({
    rowId: stringOf(row, "rowId") || `${section?.sectionCode || "section"}-${index + 1}`,
    values: { ...(((row.values || {}) as Record<string, string>)) }
  }));
}

function createEmptyRow(section: EmissionSurveyAdminSection | undefined, index: number): DraftRow {
  const values: Record<string, string> = {};
  ((section?.columns || []) as Array<Record<string, string>>).forEach((column) => {
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
  const columns = ((section?.columns || []) as Array<Record<string, string>>);

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
          <p>데이터 원본: {seedCase ? "업로드 엑셀 seed" : "빈 draft"}</p>
          <p>저장 시각: {savedAt || "저장 전"}</p>
        </div>
      </div>
      <div className="px-5 py-5">
        <MemberSectionToolbar
          title={<span>하단 데이터 섹션</span>}
          meta={<span>{seedCase ? "엑셀 seed 후 편집 가능 / 입력 컬럼은 가로 배치" : "동일 컬럼 구조의 빈 행으로 시작 / 입력 컬럼은 가로 배치"}</span>}
          actions={<MemberButton onClick={onAddRow} size="sm" type="button" variant="secondary">+ 행 추가</MemberButton>}
        />
        <div className="mt-4 space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              현재 행이 없습니다. `+ 행 추가`로 동일 구조의 입력 행을 만들 수 있습니다.
            </div>
          ) : null}
          {rows.map((row, index) => (
            <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-4" key={row.rowId}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">행 {index + 1}</p>
                <MemberButton onClick={() => onRemoveRow(row.rowId)} size="sm" type="button" variant="secondary">삭제</MemberButton>
              </div>
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-max rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white">
                  <div className="grid auto-cols-[minmax(180px,1fr)] grid-flow-col border-b border-slate-200 bg-slate-100">
                    {columns.map((column) => (
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]" key={`${row.rowId}-${stringOf(column, "key")}-header`}>
                        {stringOf(column, "label")}
                      </div>
                    ))}
                  </div>
                  <div className="grid auto-cols-[minmax(180px,1fr)] grid-flow-col gap-0">
                    {columns.map((column) => {
                      const key = stringOf(column, "key");
                      return (
                        <label className="block border-r border-slate-200 px-3 py-3 last:border-r-0" key={`${row.rowId}-${key}`}>
                          <span className="sr-only">{stringOf(column, "label")}</span>
                          <AdminInput
                            onChange={(event) => onChangeCell(row.rowId, key, event.target.value)}
                            value={row.values[key] || ""}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
      if (!next[case31Key]) {
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
        columns: ((currentSection?.columns || []) as Array<{ key: string; label: string }>),
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
            meta={<span>탭 3, 4의 예시 영역을 읽어 Case 3-1 / 3-2 데이터를 구성하고, 저장 시 서버 초안과 브라우저 fallback을 함께 사용합니다.</span>}
            actions={<MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">{uploading ? "업로드 중..." : "엑셀 업로드"}</MemberButton>}
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
            <ul className="space-y-2">
              {((currentSection?.guidance || []) as string[]).map((item, index) => (
                <li key={`${currentSection?.sectionCode || "guidance"}-${index}`}>{item}</li>
              ))}
            </ul>
          </CollectionResultPanel>
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
