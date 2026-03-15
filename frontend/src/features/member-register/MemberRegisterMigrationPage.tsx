import { FormEvent, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchMemberRegisterPage, type MemberRegisterPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish, navigate } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

type RegisterFormState = {
  userName: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userType: string;
  orgName: string;
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
  orgName: "",
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.userName || !form.userId || !form.userEmail || !form.userPhone || !form.userType || !form.orgName || !form.dept || !form.title || form.permissions.length === 0) {
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
      {pageState.error || error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || pageState.error}</div> : null}
      {message ? <div className={`mb-4 rounded-[var(--kr-gov-radius)] px-4 py-3 text-sm ${duplicateState === "error" ? "border border-red-200 bg-red-50 text-red-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="gov-card">
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
                  <button className="px-4 py-2 border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-blue-50 whitespace-nowrap text-sm" onClick={handleDuplicateCheck} type="button">{en ? "Check Duplicates" : "중복 확인"}</button>
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

          <section className="gov-card">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--kr-gov-blue)]"><span className="material-symbols-outlined">badge</span>{en ? "Affiliation & Permissions" : "소속 및 권한 정보"}</h3>
            <div className="space-y-6">
              <div>
                <label className="form-label" htmlFor="org-name">{en ? "Organization / Company Name" : "소속 기관/기업명"} <span className="required">*</span></label>
                <div className="flex gap-2">
                  <input className="gov-input flex-1" id="org-name" placeholder={en ? "Search for organization or company" : "기관명 또는 기업명을 검색하세요"} value={form.orgName} onChange={(event) => update("orgName", event.target.value)} />
                  <button className="px-4 py-2 bg-gray-800 text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-700 whitespace-nowrap text-sm flex items-center gap-1" onClick={() => update("orgName", en ? "Korea CCUS Center" : "한국 CCUS 센터")} type="button"><span className="material-symbols-outlined text-[18px]">search</span>{en ? "Search Org" : "기관 검색"}</button>
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

        <div className="mt-12 flex justify-center gap-4 border-t border-[var(--kr-gov-border-light)] pt-10">
          <button className="px-10 py-3.5 border border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors text-[16px]" onClick={() => navigate(buildLocalizedPath("/admin/member/list", "/en/admin/member/list"))} type="button">{en ? "Cancel" : "취소"}</button>
          <button className="px-10 py-3.5 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors text-[16px] shadow-lg shadow-blue-900/10" type="submit">{en ? "Complete Registration" : "등록 완료"}</button>
        </div>
      </form>
    </AdminPageShell>
  );
}
