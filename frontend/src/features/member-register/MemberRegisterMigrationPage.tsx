import { FormEvent, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  fetchMemberRegisterPage,
  searchAdminCompanies,
  type CompanySearchPayload,
  type MemberRegisterPagePayload
} from "../../lib/api/client";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";
import { MemberActionBar, MemberPermissionButton, PageStatusNotice } from "../member/common";
import { AdminEditPageFrame } from "../admin-ui/pageFrames";

type RegisterFormState = {
  userName: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userType: string;
  insttId: string;
  orgName: string;
  orgBizNo: string;
  orgRepresentative: string;
  dept: string;
  title: string;
  permissions: string[];
};

const INITIAL_STATE: RegisterFormState = {
  userName: "",
  userId: "",
  userEmail: "",
  userPhone: "",
  userType: "",
  insttId: "",
  orgName: "",
  orgBizNo: "",
  orgRepresentative: "",
  dept: "",
  title: "",
  permissions: []
};

export function MemberRegisterMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<MemberRegisterPagePayload>(fetchMemberRegisterPage, []);
  const page = pageState.value;
  const memberTypeOptions = (page?.memberTypeOptions || []) as Array<Record<string, string>>;
  const permissionOptions = (page?.permissionOptions || []) as Array<Record<string, string>>;
  const [form, setForm] = useState(INITIAL_STATE);
  const [duplicateState, setDuplicateState] = useState<"idle" | "ok" | "error">("idle");
  const [orgSearchOpen, setOrgSearchOpen] = useState(false);
  const [orgKeyword, setOrgKeyword] = useState("");
  const [orgSearch, setOrgSearch] = useState<CompanySearchPayload | null>(null);
  const [orgSearchLoading, setOrgSearchLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedOrgSummary = useMemo(() => {
    if (!form.insttId || !form.orgName) {
      return null;
    }
    return [
      { label: en ? "Institution ID" : "기관 ID", value: form.insttId },
      { label: en ? "Business Number" : "사업자등록번호", value: form.orgBizNo || "-" },
      { label: en ? "Representative" : "대표자", value: form.orgRepresentative || "-" }
    ];
  }, [en, form.insttId, form.orgBizNo, form.orgName, form.orgRepresentative]);

  function update<K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePermission(code: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(code)
        ? current.permissions.filter((item) => item !== code)
        : [...current.permissions, code]
    }));
  }

  function handleDuplicateCheck() {
    const normalized = form.userId.trim();
    if (!/^[a-zA-Z0-9]{6,12}$/.test(normalized)) {
      setDuplicateState("error");
      setError(en ? "Username must be 6-12 alphanumeric characters." : "아이디는 6~12자의 영문/숫자 조합이어야 합니다.");
      setMessage("");
      return;
    }
    setDuplicateState("ok");
    setError("");
    setMessage(en ? "This username is available." : "사용 가능한 아이디입니다.");
  }

  async function handleSearchOrganization(pageIndex = 1) {
    if (!page?.canUseMemberRegisterOrgSearch) {
      setError(en ? "You do not have permission to search organizations." : "기관 검색 권한이 없습니다.");
      return;
    }
    const keyword = orgKeyword.trim();
    if (!keyword) {
      setError(en ? "Enter an organization keyword before searching." : "기관 검색어를 입력해 주세요.");
      return;
    }
    setError("");
    setOrgSearchLoading(true);
    try {
      const result = await searchAdminCompanies({ keyword, page: pageIndex, size: 5 });
      setOrgSearch(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : (en ? "Failed to search organizations." : "기관 검색에 실패했습니다."));
    } finally {
      setOrgSearchLoading(false);
    }
  }

  function applyOrganization(item: CompanySearchPayload["list"][number]) {
    setForm((current) => ({
      ...current,
      insttId: String(item.insttId || ""),
      orgName: String(item.cmpnyNm || ""),
      orgBizNo: String(item.bizrno || ""),
      orgRepresentative: String(item.cxfc || "")
    }));
    setOrgSearchOpen(false);
  }

  function resetForm() {
    setForm(INITIAL_STATE);
    setDuplicateState("idle");
    setMessage("");
    setError("");
    setOrgKeyword("");
    setOrgSearch(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!page?.canUseMemberRegisterSave) {
      setError(en ? "You do not have permission to save member registrations." : "회원 등록 저장 권한이 없습니다.");
      setMessage("");
      return;
    }
    if (!form.userName || !form.userId || !form.userEmail || !form.userPhone || !form.userType || !form.insttId || !form.orgName || !form.dept || !form.title || form.permissions.length === 0) {
      setError(en ? "Please complete all required fields." : "필수 항목을 모두 입력해주세요.");
      setMessage("");
      return;
    }
    setError("");
    setMessage(en ? "Registration draft is ready. Backend submission is not attached yet." : "등록 초안이 준비되었습니다. 실제 저장 연동은 아직 연결되지 않았습니다.");
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "Member & Permission" : "회원·권한 관리" },
        { label: en ? "Register New Member" : "신규 회원 등록" }
      ]}
      title={en ? "Register New Member" : "신규 회원 등록"}
      subtitle={en ? "Manually register a new user for system access." : "시스템 사용을 위한 신규 사용자를 직접 등록합니다."}
    >
      {pageState.error || error ? <PageStatusNotice tone="error">{error || pageState.error}</PageStatusNotice> : null}
      {message ? <PageStatusNotice tone={duplicateState === "error" ? "error" : "success"}>{message}</PageStatusNotice> : null}

      <CanView
        allowed={true}
        fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "You do not have permission to view member registration." : "회원 등록 화면을 볼 권한이 없습니다."}</p></section>}
      >
      <AdminEditPageFrame>
      <form onSubmit={handleSubmit}>
        <section className="gov-card mb-8 border border-[var(--kr-gov-border-light)] bg-[linear-gradient(135deg,rgba(239,246,255,0.9),rgba(255,255,255,0.96))]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--kr-gov-blue)]">{en ? "Registration Flow" : "등록 흐름"}</p>
              <h3 className="mt-2 text-xl font-black text-[var(--kr-gov-text-primary)]">{en ? "Create member first, then connect the institution." : "회원 기본 계정을 만들고 기관을 연결합니다."}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
                {en
                  ? "Use organization search to bind the new member to an existing institution. The selected institution context is reused in permission and approval flows."
                  : "기관 검색으로 기존 기관을 먼저 연결한 뒤 권한과 승인 흐름을 이어서 관리합니다. 선택한 기관 정보는 저장 전까지 이 화면 상단에서 계속 확인할 수 있습니다."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-white px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Institution" : "기관 연결"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{form.orgName || (en ? "Required" : "필수")}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-white px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "User Type" : "회원 유형"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{form.userType || "-"}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-white px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Permissions" : "권한 수"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{form.permissions.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <section className="gov-card" data-help-id="member-register-basic">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--kr-gov-blue)]"><span className="material-symbols-outlined">account_circle</span>{en ? "Basic Information" : "기본 정보"}</h3>
            <div className="space-y-6">
              <div>
                <label className="form-label" htmlFor="user-name">{en ? "Full Name" : "성명"} <span className="required">*</span></label>
                <input className="gov-input" id="user-name" placeholder={en ? "Enter full name" : "실명을 입력하세요"} value={form.userName} onChange={(event) => update("userName", event.target.value)} />
              </div>
              <div>
                <label className="form-label" htmlFor="user-id">{en ? "Username" : "아이디"} <span className="required">*</span></label>
                <div className="flex gap-2">
                  <input className="gov-input flex-1" id="user-id" placeholder={en ? "6-12 chars, alphanumeric" : "6~12자 영문, 숫자 조합"} value={form.userId} onChange={(event) => update("userId", event.target.value)} />
                  <MemberPermissionButton allowed={!!page?.canUseMemberRegisterIdCheck} onClick={handleDuplicateCheck} reason={en ? "Only authorized roles and members can check duplicate IDs." : "권한이 부여된 롤과 회원만 아이디 중복 확인을 사용할 수 있습니다."} type="button" variant="info">{en ? "Check Duplicates" : "중복 확인"}</MemberPermissionButton>
                </div>
                {duplicateState === "ok" ? <p className="validation-msg success">{en ? "This username is available." : "사용 가능한 아이디입니다."}</p> : null}
                {duplicateState === "error" ? <p className="validation-msg error">{en ? "Please use 6-12 alphanumeric characters." : "6~12자의 영문/숫자 조합으로 입력해주세요."}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="user-email">{en ? "Email" : "이메일"} <span className="required">*</span></label>
                  <input className="gov-input" id="user-email" placeholder="example@domain.com" type="email" value={form.userEmail} onChange={(event) => update("userEmail", event.target.value)} />
                </div>
                <div>
                  <label className="form-label" htmlFor="user-phone">{en ? "Phone Number" : "연락처"} <span className="required">*</span></label>
                  <input className="gov-input" id="user-phone" placeholder="010-0000-0000" value={form.userPhone} onChange={(event) => update("userPhone", event.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="user-type">{en ? "Member Type" : "회원 유형"} <span className="required">*</span></label>
                <select className="gov-select" id="user-type" value={form.userType} onChange={(event) => update("userType", event.target.value)}>
                  <option value="">{en ? "Select Type" : "선택하세요"}</option>
                  {memberTypeOptions.map((option) => <option key={stringOf(option, "value")} value={stringOf(option, "value")}>{stringOf(option, "label")}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="gov-card" data-help-id="member-register-affiliation">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--kr-gov-blue)]"><span className="material-symbols-outlined">badge</span>{en ? "Affiliation & Permissions" : "소속 및 권한 정보"}</h3>
            <div className="space-y-6">
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[#f8fafc] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Institution Search" : "기관 검색"}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
                      {en
                        ? "Select the institution first. This binds the member to an existing organization before permission assignment."
                        : "신규 회원은 먼저 기관을 검색해 연결합니다. 선택된 기관은 권한과 승인 처리의 기준으로 사용됩니다."}
                    </p>
                  </div>
                  <MemberPermissionButton allowed={!!page?.canUseMemberRegisterOrgSearch} icon="search" onClick={() => setOrgSearchOpen(true)} reason={en ? "Only authorized roles and members can search organizations." : "권한이 부여된 롤과 회원만 기관 검색을 사용할 수 있습니다."} type="button" variant="secondary">{en ? "Search Organization" : "기관 검색"}</MemberPermissionButton>
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="org-name">{en ? "Organization / Company Name" : "소속 기관/기업명"} <span className="required">*</span></label>
                <input className="gov-input bg-gray-50" id="org-name" placeholder={en ? "Select organization from search dialog" : "기관 검색으로 소속 기관을 선택해 주세요"} readOnly value={form.orgName} />
              </div>
              {selectedOrgSummary ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {selectedOrgSummary.map((item) => (
                    <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3" key={item.label}>
                      <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] bg-gray-50 px-4 py-6 text-sm text-[var(--kr-gov-text-secondary)]">
                  {en ? "No institution selected yet. Open the search dialog and choose an institution before saving." : "아직 연결된 기관이 없습니다. 기관 검색 창에서 소속 기관을 선택한 뒤 저장하세요."}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="instt-id">{en ? "Institution ID" : "기관 ID"} <span className="required">*</span></label>
                  <input className="gov-input bg-gray-50" id="instt-id" readOnly value={form.insttId} />
                </div>
                <div>
                  <label className="form-label" htmlFor="org-bizno">{en ? "Business Number" : "사업자등록번호"}</label>
                  <input className="gov-input bg-gray-50" id="org-bizno" readOnly value={form.orgBizNo} />
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="dept">{en ? "Department / Position" : "부서 / 직함"} <span className="required">*</span></label>
                <div className="grid grid-cols-2 gap-4">
                  <input className="gov-input" id="dept" placeholder={en ? "Department Name" : "부서명"} value={form.dept} onChange={(event) => update("dept", event.target.value)} />
                  <input className="gov-input" id="title" placeholder={en ? "Job Title" : "직함"} value={form.title} onChange={(event) => update("title", event.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">{en ? "System Access Permissions" : "시스템 접근 권한 설정"} <span className="required">*</span></label>
                <div className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] p-4 bg-gray-50">
                  <p className="text-[12px] text-gray-500 mb-3">{en ? "You can select multiple permissions to assign to the user." : "사용자에게 부여할 권한을 복수 선택할 수 있습니다."}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {permissionOptions.map((option) => {
                      const code = stringOf(option, "value");
                      const checked = form.permissions.includes(code);
                      return (
                        <label className={`flex items-center gap-3 p-3 bg-white border rounded-[var(--kr-gov-radius)] cursor-pointer transition-colors ${checked ? "border-[var(--kr-gov-blue)]" : "border-[var(--kr-gov-border-light)] hover:border-[var(--kr-gov-blue)]"}`} key={code}>
                          <input checked={checked} className="w-5 h-5 text-[var(--kr-gov-blue)] border-gray-300 rounded focus:ring-[var(--kr-gov-blue)]" onChange={() => togglePermission(code)} type="checkbox" />
                          <span className="text-sm font-medium">{stringOf(option, "label")}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <MemberActionBar
          dataHelpId="member-register-actions"
          description={en ? "Review the selected institution and permission scope before completing the registration draft." : "선택한 기관과 권한 범위를 확인한 뒤 신규 회원 등록을 마무리하세요."}
          eyebrow={en ? "Registration Actions" : "등록 작업"}
          primary={<MemberPermissionButton allowed={!!page?.canUseMemberRegisterSave} className="w-full sm:w-auto sm:min-w-[220px] justify-center whitespace-nowrap shadow-lg shadow-blue-900/10" reason={en ? "Only authorized roles and members can complete member registration." : "권한이 부여된 롤과 회원만 신규 회원 등록을 완료할 수 있습니다."} size="lg" type="submit" variant="primary">{en ? "Complete Registration" : "등록 완료"}</MemberPermissionButton>}
          secondary={{ href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"), icon: "list", label: en ? "List" : "목록" }}
          tertiary={{ icon: "refresh", label: en ? "Reset" : "초기화", onClick: resetForm }}
          title={en ? "Check the organization binding before saving." : "기관 연결 상태를 확인한 뒤 저장하세요."}
        />
      </form>
      </AdminEditPageFrame>
      </CanView>

      <div aria-labelledby="member-register-org-search-title" aria-modal="true" className={`${orgSearchOpen ? "fixed" : "hidden"} inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm`} role="dialog">
        <div className="w-full max-w-[960px] overflow-hidden rounded-[calc(var(--kr-gov-radius)+8px)] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--kr-gov-border-light)] px-6 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Institution Search" : "기관 검색"}</p>
              <h3 className="mt-1 text-lg font-black" id="member-register-org-search-title">{en ? "Search and select an institution" : "기관을 검색하고 선택하세요."}</h3>
            </div>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-secondary)] hover:bg-gray-50" onClick={() => setOrgSearchOpen(false)} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label>
                <span className="mb-2 block text-sm font-bold text-[var(--kr-gov-text-primary)]">{en ? "Keyword" : "검색어"}</span>
                <input className="gov-input" placeholder={en ? "Enter institution name or business number" : "기관명 또는 사업자등록번호를 입력하세요"} value={orgKeyword} onChange={(event) => setOrgKeyword(event.target.value)} />
              </label>
              <MemberPermissionButton allowed={!!page?.canUseMemberRegisterOrgSearch} className="min-w-[148px]" icon="search" onClick={() => handleSearchOrganization(1)} reason={en ? "Only authorized roles and members can search organizations." : "권한이 부여된 롤과 회원만 기관 검색을 사용할 수 있습니다."} type="button" variant="primary">
                {orgSearchLoading ? (en ? "Searching..." : "검색 중...") : (en ? "Search" : "검색")}
              </MemberPermissionButton>
            </div>
            <div className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)]">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f9fa] text-left">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">{en ? "Institution" : "기관명"}</th>
                    <th className="px-4 py-3">{en ? "Business Number" : "사업자등록번호"}</th>
                    <th className="px-4 py-3">{en ? "Representative" : "대표자"}</th>
                    <th className="px-4 py-3 text-center">{en ? "Action" : "선택"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(orgSearch?.list || []).length === 0 ? (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        {orgKeyword.trim()
                          ? (en ? "No matching institutions were found." : "검색 결과가 없습니다.")
                          : (en ? "Enter a keyword and search for institutions." : "검색어를 입력한 뒤 기관을 검색하세요.")}
                      </td>
                    </tr>
                  ) : (orgSearch?.list || []).map((item, index) => (
                    <tr className="hover:bg-blue-50/40" key={item.insttId}>
                      <td className="px-4 py-4 text-[var(--kr-gov-text-secondary)]">{((orgSearch?.page || 1) - 1) * (orgSearch?.size || 5) + index + 1}</td>
                      <td className="px-4 py-4 font-bold text-[var(--kr-gov-text-primary)]">{item.cmpnyNm}</td>
                      <td className="px-4 py-4 text-[var(--kr-gov-text-secondary)]">{item.bizrno}</td>
                      <td className="px-4 py-4 text-[var(--kr-gov-text-secondary)]">{item.cxfc}</td>
                      <td className="px-4 py-4 text-center">
                        <MemberPermissionButton allowed={!!page?.canUseMemberRegisterOrgSearch} onClick={() => applyOrganization(item)} reason={en ? "Only authorized roles and members can select institutions." : "권한이 부여된 롤과 회원만 기관을 선택할 수 있습니다."} size="xs" type="button" variant="secondary">{en ? "Select" : "선택"}</MemberPermissionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`${(orgSearch?.totalPages || 0) > 1 ? "flex" : "hidden"} items-center justify-center gap-1`}>
              {Array.from({ length: Number(orgSearch?.totalPages || 0) }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  className={`min-w-[36px] rounded border px-3 py-2 text-sm ${pageNumber === Number(orgSearch?.page || 1) ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white" : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)]"}`}
                  key={pageNumber}
                  onClick={() => handleSearchOrganization(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
