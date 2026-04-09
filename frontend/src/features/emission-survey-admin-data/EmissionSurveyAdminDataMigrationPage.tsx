import { useEffect, useRef, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchEmissionSurveyAdminDataPage,
  previewEmissionSurveySharedDataset,
  replaceEmissionSurveySharedDataset,
  getEmissionSurveyTemplateDownloadUrl,
  getEmissionSurveySampleDownloadUrl,
  type EmissionSurveyAdminDataPagePayload,
  type EmissionSurveyAdminSection,
  type EmissionSurveyAdminPagePayload
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, MemberButton, PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";

function stringOf(row: Record<string, unknown> | null | undefined, key: string) {
  if (!row) {
    return "";
  }
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

function renderSectionTable(section: Record<string, unknown> | EmissionSurveyAdminSection, key: string) {
  const rows = ((section.rows || []) as Array<Record<string, unknown>>);
  const columns = ((section.columns || []) as Array<Record<string, unknown>>);
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
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2">No.</th>
              {columns.map((column) => (
                <th className="px-2 py-2" key={stringOf(column, "key")}>{stringOf(column, "label") || stringOf(column, "key")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const values = ((row.values || {}) as Record<string, string>);
              return (
                <tr className="border-b border-slate-100" key={`${key}-${index}`}>
                  <td className="whitespace-nowrap px-2 py-2 font-bold text-slate-500">{index + 1}</td>
                  {columns.map((column) => (
                    <td className="px-2 py-2" key={`${key}-${index}-${stringOf(column, "key")}`}>{values[stringOf(column, "key")] || "-"}</td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td className="px-2 py-6 text-center text-slate-500" colSpan={Math.max(columns.length + 1, 2)}>데이터 행이 없습니다.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function EmissionSurveyAdminDataMigrationPage() {
  const en = isEnglish();
  const pageTitle = en ? "Shared Dataset Excel Apply" : "공통 데이터셋 엑셀 반영";
  const pageSubtitle = en
    ? "Upload a workbook, compare it with the current DB dataset, and decide whether to replace the shared dataset."
    : "엑셀 파일을 업로드해 현재 DB 데이터와 비교한 뒤, 공통 데이터셋 반영 여부를 결정합니다.";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewPayload, setPreviewPayload] = useState<EmissionSurveyAdminPagePayload | null>(null);

  const pageState = useAsyncValue<EmissionSurveyAdminDataPagePayload>(
    () => fetchEmissionSurveyAdminDataPage({}),
    []
  );
  const page = pageState.value || null;
  const pageExistingSections = ((page?.selectedDatasetSectionRows || []) as Array<Record<string, unknown>>);
  const previewExistingSections = ((previewPayload?.existingDatasetSectionRows || []) as Array<Record<string, unknown>>);
  const existingSections = previewPayload ? previewExistingSections : pageExistingSections;
  const previewSections = ((previewPayload?.sections || []) as EmissionSurveyAdminSection[]);
  const previewMessage = stringOf((previewPayload || {}) as Record<string, unknown>, "previewMessage");

  useEffect(() => {
    logGovernanceScope("PAGE", "emission-survey-admin-data", {
      language: en ? "en" : "ko",
      existingSectionCount: existingSections.length,
      previewSectionCount: previewSections.length
    });
  }, [en, existingSections.length, previewSections.length]);

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
      setUploadedFile(nextFile);
      setPreviewPayload(payload);
      setMessage(stringOf((payload as Record<string, unknown>), "previewMessage") || "업로드 파일 미리보기를 불러왔습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "엑셀 업로드 미리보기에 실패했습니다.");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  async function handleApplyUploadedFile() {
    if (!uploadedFile) {
      setErrorMessage("먼저 엑셀 파일을 업로드하세요.");
      return;
    }
    setApplying(true);
    setMessage("");
    setErrorMessage("");
    try {
      const payload = await replaceEmissionSurveySharedDataset(uploadedFile);
      setMessage(stringOf((payload as Record<string, unknown>), "message") || "업로드 파일 내용을 DB에 반영했습니다.");
      await pageState.reload();
      setPreviewPayload(null);
      setUploadedFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "업로드 파일을 DB에 반영하지 못했습니다.");
    } finally {
      setApplying(false);
    }
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
          description={en
            ? "Upload an Excel file to compare it against the current shared DB dataset. DB replacement runs only when you press the apply button."
            : "엑셀 파일을 업로드하면 현재 공통 DB 데이터와 비교합니다. 실제 DB 교체는 반영 버튼을 눌렀을 때만 실행됩니다."}
          title={en ? "Excel Upload And DB Apply" : "엑셀 업로드 및 DB 반영"}
        >
          <input accept=".xlsx" className="hidden" onChange={handleUploadChange} ref={fileInputRef} type="file" />
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4">
            <MemberButton onClick={() => fileInputRef.current?.click()} type="button" variant="primary">
              {uploading ? (en ? "Uploading..." : "업로드 중...") : (en ? "Excel Upload" : "엑셀 업로드")}
            </MemberButton>
            <MemberButton onClick={() => { window.location.href = getEmissionSurveyTemplateDownloadUrl(); }} title={en ? "Download blank Excel template" : "빈 엑셀 서식을 다운로드합니다."} type="button" variant="secondary">
              {en ? "Template Download" : "빈 양식 다운로드"}
            </MemberButton>
            <MemberButton onClick={() => { window.location.href = getEmissionSurveySampleDownloadUrl(); }} title={en ? "Download sample Excel file" : "작성 예시가 포함된 샘플 파일을 다운로드합니다."} type="button" variant="secondary">
              {en ? "Sample Download" : "샘플 다운로드"}
            </MemberButton>
            <MemberButton disabled={!uploadedFile || applying} onClick={() => void handleApplyUploadedFile()} type="button" variant="secondary">
              {applying ? (en ? "Applying To DB..." : "DB 반영 중...") : (en ? "Apply Uploaded File To DB" : "업로드 파일 DB 반영")}
            </MemberButton>
            <span className="text-xs text-slate-500">
              {uploadedFile ? `업로드 파일: ${uploadedFile.name}` : "업로드한 파일은 먼저 미리보기로 확인되고, 반영 버튼을 눌렀을 때만 기존 DB를 덮어씁니다."}
            </span>
          </div>
        </CollectionResultPanel>

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CollectionResultPanel
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
            description={previewPayload
              ? (previewMessage || "업로드한 파일의 내용은 아래와 같습니다. 반영 버튼을 누르면 기존 DB 데이터를 지우고 이 내용으로 다시 저장합니다.")
              : "엑셀 파일을 업로드하면 파일에서 읽은 내용을 여기서 미리 볼 수 있습니다."}
            title={en ? "Uploaded File Preview" : "업로드 파일 미리보기"}
          >
            {!previewPayload ? (
              <div className="px-3 py-6 text-sm text-slate-500">아직 업로드한 파일이 없습니다.</div>
            ) : previewSections.length === 0 ? (
              <div className="px-3 py-6 text-sm text-slate-500">파일에서 읽은 섹션이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {previewSections.map((section, index) => renderSectionTable(section as unknown as Record<string, unknown>, `preview-${section.sectionCode || index}`))}
              </div>
            )}
          </CollectionResultPanel>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
