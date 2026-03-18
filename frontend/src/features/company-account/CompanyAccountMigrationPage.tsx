import { ChangeEvent, useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import {
  checkCompanyNameDuplicate,
  CompanyAccountPagePayload,
  fetchCompanyAccountPage,
  saveCompanyAccount
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberActionBar } from "../member/common";

type CompanyFormState = {
  insttId: string;
  membershipType: string;
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
};

type UploadRow = {
  id: number;
  file: File | null;
};

const EMPTY_FORM: CompanyFormState = {
  insttId: "",
  membershipType: "E",
  agencyName: "",
  representativeName: "",
  bizRegistrationNumber: "",
  zipCode: "",
  companyAddress: "",
  companyAddressDetail: "",
  chargerName: "",
  chargerEmail: "",
  chargerTel: ""
};

let uploadRowSequence = 1;

function createUploadRow(): UploadRow {
  const row = { id: uploadRowSequence, file: null };
  uploadRowSequence += 1;
  return row;
}

const MEMBERSHIP_CARD_OPTIONS = [
  {
    value: "E",
    icon: "factory",
    title: "CO2 배출사업자",
    description: "배출량 관리 및 상시 모니터링"
  },
  {
    value: "P",
    icon: "precision_manufacturing",
    title: "CCUS 프로젝트",
    description: "포집·저장·감축 프로젝트 수행"
  },
  {
    value: "C",
    icon: "domain",
    title: "진흥센터",
    description: "검증 및 운영 지원"
  },
  {
    value: "G",
    icon: "account_balance",
    title: "주무관청",
    description: "통계·정책 데이터 활용"
  }
] as const;

function resolveInitialInsttId() {
  if (typeof window === "undefined") return "";
  return getSearchParam("insttId");
}

export function CompanyAccountMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);
  const [activeInsttId, setActiveInsttId] = useState(initialInsttId);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([createUploadRow()]);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [nameCheckMessage, setNameCheckMessage] = useState("");
  const [isNameChecked, setIsNameChecked] = useState(false);
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<CompanyAccountPagePayload>(
    () => fetchCompanyAccountPage(activeInsttId || undefined),
    [activeInsttId],
    {
      initialValue: null,
      onSuccess(pagePayload) {
        const source = pagePayload.companyAccountForm || {};
        setForm({
          insttId: String(source.insttId || ""),
          membershipType: String(source.entrprsSeCode || "E"),
          agencyName: String(source.insttNm || ""),
          representativeName: String(source.reprsntNm || ""),
          bizRegistrationNumber: String(source.bizrno || ""),
          zipCode: String(source.zip || ""),
          companyAddress: String(source.adres || ""),
          companyAddressDetail: String(source.detailAdres || ""),
          chargerName: String(source.chargerNm || ""),
          chargerEmail: String(source.chargerEmail || ""),
          chargerTel: String(source.chargerTel || "")
        });
        setUploadRows([createUploadRow()]);
        if (String(source.insttId || "").trim() && String(source.insttNm || "").trim()) {
          setIsNameChecked(true);
          setNameCheckMessage("");
        } else {
          setIsNameChecked(false);
          setNameCheckMessage("");
        }
      }
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;
  const fileRows = (page?.companyAccountFiles || []) as Array<Record<string, unknown>>;
  const canUseSave = !!page?.canUseCompanyAccountSave;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function updateField<K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) {
    if (key === "agencyName") {
      const nextName = String(value || "").trim();
      const originalInsttId = String((page?.companyAccountForm as Record<string, unknown> | undefined)?.insttId || "").trim();
      const originalName = String((page?.companyAccountForm as Record<string, unknown> | undefined)?.insttNm || "").trim();
      if (originalInsttId && nextName && nextName === originalName) {
        setIsNameChecked(true);
        setNameCheckMessage("");
      } else {
        setIsNameChecked(false);
        setNameCheckMessage("");
      }
    }
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCheckDuplicate() {
    const name = form.agencyName.trim();
    const originalInsttId = String((page?.companyAccountForm as Record<string, unknown> | undefined)?.insttId || "").trim();
    const originalName = String((page?.companyAccountForm as Record<string, unknown> | undefined)?.insttNm || "").trim();
    if (!name) {
      setActionError("기관/회사명을 입력해 주세요.");
      return;
    }
    setActionError("");
    try {
      const duplicated = await checkCompanyNameDuplicate(name);
      const isSameExisting = !!originalInsttId && name === originalName;
      if (duplicated && !isSameExisting) {
        setIsNameChecked(false);
        setNameCheckMessage("이미 등록된 기관/회사명입니다.");
        return;
      }
      setIsNameChecked(true);
      setNameCheckMessage("사용 가능한 기관/회사명입니다.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "중복 확인 중 오류가 발생했습니다.");
    }
  }

  function handleAddressSearch() {
    if (typeof window === "undefined") return;
    const daum = (window as Window & { daum?: { Postcode?: new (options: { oncomplete: (data: { zonecode?: string; roadAddress?: string; jibunAddress?: string; userSelectedType?: string; }) => void; }) => { open: () => void; }; }; }).daum;
    if (!daum?.Postcode) {
      setActionError("주소 검색 도구를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new daum.Postcode({
      oncomplete(data) {
        const address = data.userSelectedType === "R" ? (data.roadAddress || "") : (data.jibunAddress || "");
        setForm((current) => ({
          ...current,
          zipCode: String(data.zonecode || ""),
          companyAddress: String(address || "")
        }));
      }
    }).open();
  }

  async function handleSave() {
    const session = sessionState.value;
    if (!session) return;
    setActionError("");
    setMessage("");
    if (!isNameChecked) {
      setActionError("기관/회사명 중복 확인이 필요합니다.");
      return;
    }
    const uploadedFiles = uploadRows
      .map((row) => row.file)
      .filter((file): file is File => Boolean(file && file.size > 0));
    try {
      const result = await saveCompanyAccount(session, {
        insttId: form.insttId || undefined,
        membershipType: form.membershipType,
        agencyName: form.agencyName,
        representativeName: form.representativeName,
        bizRegistrationNumber: form.bizRegistrationNumber,
        zipCode: form.zipCode,
        companyAddress: form.companyAddress,
        companyAddressDetail: form.companyAddressDetail,
        chargerName: form.chargerName,
        chargerEmail: form.chargerEmail,
        chargerTel: form.chargerTel,
        fileUploads: uploadedFiles
      });
      setMessage(`${result.insttId} 회원사 정보를 저장했습니다.`);
      if (result.insttId === activeInsttId) {
        await pageState.reload();
      } else {
        setActiveInsttId(result.insttId);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
  }

  function handleFileChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      setUploadRows((current) => current.map((row, currentIndex) => (
        currentIndex === index ? { ...row, file: null } : row
      )));
      return;
    }
    const lower = nextFile.name.toLowerCase();
    const okExt = [".pdf", ".jpg", ".jpeg", ".png"].some((ext) => lower.endsWith(ext));
    if (!okExt) {
      window.alert("PDF, JPG, PNG 파일만 업로드 가능합니다.");
      event.target.value = "";
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      window.alert("파일 크기는 10MB 이하만 가능합니다.");
      event.target.value = "";
      return;
    }
    setUploadRows((current) => current.map((row, currentIndex) => (
      currentIndex === index ? { ...row, file: nextFile } : row
    )));
  }

  function addFileRow() {
    setUploadRows((current) => [...current, createUploadRow()]);
  }

  function removeFileRow(index: number) {
    setUploadRows((current) => {
      if (current.length <= 1) {
        return [{ ...current[0], file: null }];
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  }

  return (
    <AdminPageShell
      actions={(
        <a className="inline-flex items-center gap-1.5 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50" href={buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list")}>
          <span className="material-symbols-outlined text-[18px]">list</span>
          회원사 목록
        </a>
      )}
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원관리" },
        { label: "회원사" },
        { label: form.insttId ? "회원사 수정" : "신규 회원사 등록" }
      ]}
      subtitle={form.insttId ? "기존 회원사 신청 정보를 수정합니다." : "회원사 신청 정보를 관리자 화면에서 직접 등록합니다."}
      title={form.insttId ? "회원사 수정" : "신규 회원사 등록"}
    >
      {message ? <section className="mb-6 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-emerald-700">{message}</section> : null}
      {error ? <section className="mb-6 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</section> : null}
      <CanView
        allowed={!!page?.canViewCompanyAccount}
        fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원사 관리 화면을 볼 권한이 없습니다.</p></section>}
      >
        <div className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-8 shadow-sm" data-help-id="company-account-page">
          {form.insttId ? (
            <div className="mb-8 flex items-center justify-between rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">현재 수정 대상</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{form.agencyName || "회원사"}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">
                {form.insttId}
              </span>
            </div>
          ) : null}
          <div className="space-y-8">
            <section data-help-id="company-account-membership">
              <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-4">회원 유형 선택 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {MEMBERSHIP_CARD_OPTIONS.map((option) => {
                  const selected = form.membershipType === option.value;
                  return (
                    <label className={`border rounded-[var(--kr-gov-radius)] bg-white p-5 transition-all cursor-pointer ${selected ? "border-[var(--kr-gov-blue)] bg-blue-50 shadow-sm" : "border-[var(--kr-gov-border-light)]"}`} key={option.value}>
                      <div className="mb-2 flex items-start justify-between">
                        <span className={`material-symbols-outlined ${selected ? "text-[var(--kr-gov-blue)]" : ""}`}>{option.icon}</span>
                        <input checked={selected} className="w-4 h-4 text-[var(--kr-gov-blue)]" disabled={!page?.canUseCompanyAccountSave} name="membershipType" onChange={() => updateField("membershipType", option.value)} type="radio" />
                      </div>
                      <span className="block font-bold text-[15px] mb-1">{option.title}</span>
                      <p className="text-[12px] text-gray-500 leading-snug">{option.description}</p>
                    </label>
                  );
                })}
              </div>
            </section>

            <section data-help-id="company-account-business">
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">business_center</span>
                사업자 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">기관/기업명 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} value={form.agencyName} onChange={(e) => updateField("agencyName", e.target.value)} />
                    <button className="h-12 shrink-0 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-blue)] px-4 text-sm font-bold text-[var(--kr-gov-blue)] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400" disabled={!canUseSave} onClick={() => void handleCheckDuplicate()} type="button">중복확인</button>
                  </div>
                  {nameCheckMessage ? (
                    <p className={`mt-2 text-xs font-bold ${isNameChecked ? "text-emerald-600" : "text-red-600"}`}>{nameCheckMessage}</p>
                  ) : null}
                </div>
                <label>
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">대표자명 <span className="text-red-500">*</span></span>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} value={form.representativeName} onChange={(e) => updateField("representativeName", e.target.value)} />
                </label>
                <label>
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">사업자등록번호 <span className="text-red-500">*</span></span>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} inputMode="numeric" value={form.bizRegistrationNumber} onChange={(e) => updateField("bizRegistrationNumber", e.target.value)} />
                </label>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">사업장 주소 <span className="text-red-500">*</span></label>
                  <div className="mb-2 flex gap-2">
                    <input className="h-12 w-32 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50" placeholder="우편번호" readOnly value={form.zipCode} />
                    <button className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-blue)] px-5 text-sm font-bold text-[var(--kr-gov-blue)] hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400" disabled={!canUseSave} onClick={handleAddressSearch} type="button">주소 검색</button>
                  </div>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] mb-2 bg-gray-50" onClick={handleAddressSearch} readOnly value={form.companyAddress} />
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} value={form.companyAddressDetail} onChange={(e) => updateField("companyAddressDetail", e.target.value)} />
                </div>
              </div>
            </section>

            <section data-help-id="company-account-contact">
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>
                담당자 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <label>
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">담당자 성명 <span className="text-red-500">*</span></span>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} value={form.chargerName} onChange={(e) => updateField("chargerName", e.target.value)} />
                </label>
                <label>
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">이메일 주소 <span className="text-red-500">*</span></span>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} type="text" value={form.chargerEmail} onChange={(e) => updateField("chargerEmail", e.target.value)} />
                </label>
                <label className="md:col-span-2">
                  <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">연락처 <span className="text-red-500">*</span></span>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!page?.canUseCompanyAccountSave} type="text" value={form.chargerTel} onChange={(e) => updateField("chargerTel", e.target.value)} />
                </label>
              </div>
            </section>

            <section data-help-id="company-account-files">
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-100">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">upload_file</span>
                증빙 서류 제출
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-[var(--kr-gov-text-primary)]">사업자등록증 또는 법인 검증 서류 <span className="text-red-500">*</span></label>
                  <button className="inline-flex items-center gap-1.5 rounded border border-[var(--kr-gov-blue)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--kr-gov-blue)] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400" disabled={!canUseSave} onClick={addFileRow} type="button">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    파일 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {uploadRows.map((row, index) => (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-all ${row.file ? "border-[var(--kr-gov-blue)] bg-blue-50/30" : "border-gray-200 hover:border-[var(--kr-gov-blue)]"}`} key={row.id}>
                      <span className={`material-symbols-outlined ${row.file ? "text-[var(--kr-gov-blue)]" : "text-gray-400"}`}>attach_file</span>
                      <div className="min-w-0 flex-grow">
                        <input accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={!canUseSave} onChange={(event) => handleFileChange(index, event)} type="file" />
                        <div className="flex items-center justify-between gap-3">
                          <span className={`truncate text-sm ${row.file ? "font-bold text-[var(--kr-gov-blue)]" : "text-gray-500"}`}>
                            {row.file ? row.file.name : "파일을 선택해 주세요."}
                          </span>
                          <span className="text-xs text-gray-400">
                            {row.file ? formatBytes(row.file.size) : ""}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:text-gray-300" disabled={!canUseSave} onClick={(event) => { event.preventDefault(); event.stopPropagation(); removeFileRow(index); }} type="button">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </label>
                  ))}
                </div>

                <p className="text-xs text-gray-500">PDF, JPG, PNG 파일만 업로드 가능하며 파일당 최대 10MB까지 허용됩니다.</p>
                {fileRows.length > 0 ? (
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">기존 첨부 파일</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fileRows.map((file, index) => (
                        <a className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-text-secondary)] hover:border-[var(--kr-gov-blue)] hover:text-[var(--kr-gov-blue)]" href={buildLocalizedPath(`/admin/member/company-file?fileId=${encodeURIComponent(String(file.fileId || ""))}&download=true`, `/en/admin/member/company-file?fileId=${encodeURIComponent(String(file.fileId || ""))}&download=true`)} key={`${String(file.fileId || "existing")}-${index}`}>
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          {String(file.orignlFileNm || "첨부 파일")}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <MemberActionBar
              dataHelpId="company-account-actions"
              primary={(
                <PermissionButton allowed={!!page?.canUseCompanyAccountSave} className="flex min-h-[56px] w-full max-w-[320px] items-center justify-center gap-2 rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-6 text-base font-bold text-white shadow-lg transition-colors hover:bg-[var(--kr-gov-blue-hover)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none" data-action="save" onClick={handleSave} reason="전체 관리자만 회원사 정보를 저장할 수 있습니다." type="button">
                  <span>{page?.isEditMode ? "회원사 수정 저장" : "회원사 저장"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </PermissionButton>
              )}
              secondary={{
                href: buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list"),
                label: "목록"
              }}
            />
          </div>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
