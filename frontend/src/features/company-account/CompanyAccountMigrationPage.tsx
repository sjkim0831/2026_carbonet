import { ChangeEvent, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import {
  CompanyAccountPagePayload,
  fetchCompanyAccountPage,
  saveCompanyAccount
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

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
  return new URLSearchParams(window.location.search).get("insttId") || "";
}

export function CompanyAccountMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);
  const [lookupInsttId, setLookupInsttId] = useState(initialInsttId);
  const [activeInsttId, setActiveInsttId] = useState(initialInsttId);
  const [files, setFiles] = useState<File[]>([]);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
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
        setLookupInsttId(String(source.insttId || lookupInsttId || ""));
        setFiles([]);
      }
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;
  const fileRows = (page?.companyAccountFiles || []) as Array<Record<string, unknown>>;

  function updateField<K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const session = sessionState.value;
    if (!session) return;
    setActionError("");
    setMessage("");
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
        fileUploads: files
      });
      setMessage(`${result.insttId} 회원사 정보를 저장했습니다.`);
      setLookupInsttId(result.insttId);
      if (result.insttId === activeInsttId) {
        await pageState.reload();
      } else {
        setActiveInsttId(result.insttId);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files || []));
  }

  async function handleLoad() {
    setActionError("");
    const nextInsttId = lookupInsttId.trim();
    if (nextInsttId === activeInsttId) {
      if (!await pageState.reload()) {
        setActionError("회원사 조회 실패");
      }
      return;
    }
    setActiveInsttId(nextInsttId);
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
        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm mb-6" data-help-id="company-account-lookup">
          <div className="flex items-end gap-3">
            <label className="min-w-[280px]">
              <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">기관 ID 조회</span>
              <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] text-[15px]" placeholder="INSTT_..." value={lookupInsttId} onChange={(e) => setLookupInsttId(e.target.value)} />
            </label>
            <PermissionButton allowed={true} className="min-w-[110px] rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-6 py-3 font-bold text-white hover:bg-[var(--kr-gov-blue-hover)]" data-action="load" onClick={() => void handleLoad()} type="button">조회</PermissionButton>
          </div>
        </section>

        <div className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-8 shadow-sm" data-help-id="company-account-page">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-[var(--kr-gov-radius)] mb-8 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <p className="text-sm text-blue-900 leading-relaxed">
              `/join/companyRegister`와 같은 항목으로 등록합니다. 저장 시 `COMTNINSTTINFO`와 `COMTNINSTTFILE`에 반영되며, 첨부 파일 목록은 아래 테이블에서 다시 조회됩니다.
            </p>
          </div>

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
                    <button className="h-12 shrink-0 rounded-[var(--kr-gov-radius)] bg-gray-800 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600" disabled type="button">중복확인</button>
                  </div>
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
                    <input className="h-12 w-32 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50" disabled placeholder="우편번호" value={form.zipCode} />
                    <button className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-blue)] px-5 text-sm font-bold text-[var(--kr-gov-blue)] hover:bg-blue-50" disabled type="button">주소 검색</button>
                  </div>
                  <input className="w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] mb-2 bg-gray-50" disabled value={form.companyAddress} onChange={(e) => updateField("companyAddress", e.target.value)} />
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
                  <label className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    파일 추가
                    <input accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={!page?.canUseCompanyAccountSave} multiple onChange={handleFileChange} type="file" />
                  </label>
                </div>

                <div className="space-y-2">
                  {files.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-[var(--kr-gov-blue)]">
                      <span className="material-symbols-outlined text-gray-400">attach_file</span>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm text-gray-500">파일을 선택해 주세요.</span>
                          <span className="text-xs text-gray-400"></span>
                        </div>
                      </div>
                    </div>
                  ) : files.map((file, index) => (
                    <div className="flex items-center gap-3 rounded-lg border border-[var(--kr-gov-blue)] bg-blue-50/30 p-3 transition-all" key={`${file.name}-${index}`}>
                      <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">attach_file</span>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-bold text-[var(--kr-gov-blue)]">{file.name}</span>
                          <span className="text-xs text-gray-400">{Math.round(file.size / 1024)} KB</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500">PDF, JPG, PNG 파일만 업로드 가능하며 파일당 최대 10MB까지 허용됩니다.</p>
              </div>
            </section>

            <div className="flex flex-col gap-4 border-t border-gray-100 pt-8 md:flex-row md:items-stretch" data-help-id="company-account-actions">
              <a className="flex h-14 flex-1 items-center justify-center rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] text-lg font-bold text-[var(--kr-gov-text-primary)] hover:bg-gray-50" href={buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list")}>목록</a>
              <div className="flex-1 md:flex-[2]">
                <PermissionButton allowed={!!page?.canUseCompanyAccountSave} className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-6 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[var(--kr-gov-blue-hover)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none" data-action="save" onClick={handleSave} reason="전체 관리자만 회원사 정보를 저장할 수 있습니다." type="button">
                  <span>{page?.isEditMode ? "회원사 수정 저장" : "회원사 저장"}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </PermissionButton>
              </div>
            </div>
          </div>
        </div>

        <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-8 shadow-sm mt-8" data-help-id="company-account-file-table">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">첨부 파일 목록</h3>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">`COMTNINSTTFILE` 기준으로 다시 조회한 현재 첨부 파일입니다.</p>
            </div>
            {form.insttId ? <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700">{`신청번호 ${form.insttId}`}</span> : null}
          </div>

          <div className="overflow-x-auto rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)]">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f9fa] text-left">
                <tr>
                  <th className="px-4 py-3">순번</th>
                  <th className="px-4 py-3">파일명</th>
                  <th className="px-4 py-3">확장자</th>
                  <th className="px-4 py-3">크기</th>
                  <th className="px-4 py-3">등록일시</th>
                  <th className="px-4 py-3 text-center">다운로드</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fileRows.length === 0 ? (
                  <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={6}>저장된 첨부 파일이 없습니다.</td></tr>
                ) : fileRows.map((file, index) => {
                  const originalName = String(file.orignlFileNm || "-");
                  const fileExt = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "-";
                  return (
                    <tr key={`${String(file.fileId || "file")}-${index}`}>
                      <td className="px-4 py-3">{String(file.fileSn || index + 1)}</td>
                      <td className="px-4 py-3 font-medium">{originalName}</td>
                      <td className="px-4 py-3">{String(file.fileExtsn || fileExt)}</td>
                      <td className="px-4 py-3">{typeof file.fileMg === "number" ? `${Number(file.fileMg).toLocaleString()} bytes` : "-"}</td>
                      <td className="px-4 py-3">{String(file.regDate || "-")}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="inline-flex items-center gap-1 rounded border border-[var(--kr-gov-border-light)] px-3 py-1.5 font-bold hover:bg-gray-50" type="button">
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          다운로드
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </CanView>
    </AdminPageShell>
  );
}
