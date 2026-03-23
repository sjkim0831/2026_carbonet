import { ChangeEvent, useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import {
  checkCompanyNameDuplicate,
  CompanyAccountPagePayload,
  fetchCompanyAccountPage,
  saveCompanyAccount
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberActionBar, MemberLinkButton, MemberPermissionButton, MEMBER_BUTTON_LABELS, PageStatusNotice } from "../member/common";
import { AdminEditPageFrame } from "../admin-ui/pageFrames";
import {
  CompanyBusinessSection,
  CompanyContactSection,
  CompanyFilesSection,
  CompanyFormState,
  CompanyMembershipSection,
  UploadRow
} from "./companyAccountSections";
import { MemberStateCard } from "../member/sections";

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

function resolveInitialInsttId() {
  if (typeof window === "undefined") return "";
  return getSearchParam("insttId");
}

export function CompanyAccountMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const initialSaved = getSearchParam("saved");
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);
  const [activeInsttId, setActiveInsttId] = useState(initialInsttId);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([createUploadRow()]);
  const [actionError, setActionError] = useState(() => getSearchParam("errorMessage"));
  const [message, setMessage] = useState("");
  const [nameCheckMessage, setNameCheckMessage] = useState("");
  const [isNameChecked, setIsNameChecked] = useState(false);
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<CompanyAccountPagePayload>(
    () => fetchCompanyAccountPage(activeInsttId || undefined, { saved: initialSaved }),
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
        <MemberLinkButton href={buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list")} icon="list" variant="secondary">
          {MEMBER_BUTTON_LABELS.list}
        </MemberLinkButton>
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
      {message ? <PageStatusNotice tone="success">{message}</PageStatusNotice> : null}
      {error ? <PageStatusNotice tone="error">{error}</PageStatusNotice> : null}
      {!pageState.loading && !!page && !page?.canViewCompanyAccount ? (
        <MemberStateCard description="현재 계정으로는 회원사 관리 화면을 조회할 수 없습니다." icon="lock" title="권한이 없습니다." tone="warning" />
      ) : null}
      <CanView
        allowed={!!page?.canViewCompanyAccount}
        fallback={null}
      >
        <AdminEditPageFrame>
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
            <CompanyMembershipSection canUse={!!page?.canUseCompanyAccountSave} form={form} updateField={updateField} />
            <CompanyBusinessSection canUseSave={canUseSave} form={form} handleAddressSearch={handleAddressSearch} handleCheckDuplicate={handleCheckDuplicate} isNameChecked={isNameChecked} nameCheckMessage={nameCheckMessage} updateField={updateField} />
            <CompanyContactSection canUseSave={canUseSave} form={form} updateField={updateField} />
            <CompanyFilesSection addFileRow={addFileRow} canUseSave={canUseSave} fileRows={fileRows} formatBytes={formatBytes} handleFileChange={handleFileChange} removeFileRow={removeFileRow} uploadRows={uploadRows} />

            <MemberActionBar
              dataHelpId="company-account-actions"
              description={
                form.insttId
                  ? "회원사 목록으로 돌아가거나 현재 수정 내용을 검토한 뒤 저장할 수 있습니다."
                  : "회원사 목록으로 돌아가거나 입력한 회원사 정보를 검토한 뒤 저장할 수 있습니다."
              }
              eyebrow="작업 흐름"
              primary={(
                <MemberPermissionButton
                  allowed={!!page?.canUseCompanyAccountSave}
                  className="w-full sm:w-auto sm:min-w-[220px] justify-center whitespace-nowrap shadow-lg shadow-blue-900/10"
                  data-action="save"
                  icon="arrow_forward"
                  onClick={handleSave}
                  reason="전체 관리자만 회원사 정보를 저장할 수 있습니다."
                  size="lg"
                  type="button"
                  variant="primary"
                >
                  {MEMBER_BUTTON_LABELS.save}
                </MemberPermissionButton>
              )}
              secondary={{
                href: buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list"),
                label: MEMBER_BUTTON_LABELS.list
              }}
              title={
                form.insttId
                  ? "회원사 정보를 검토한 뒤 수정 내용을 저장하세요."
                  : "입력한 회원사 정보를 검토한 뒤 등록 내용을 저장하세요."
              }
            />
          </div>
        </div>
        </AdminEditPageFrame>
      </CanView>
    </AdminPageShell>
  );
}
