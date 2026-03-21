import { useEffect, useMemo, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import {
  AdminAccountCreatePagePayload,
  checkAdminAccountId,
  CompanySearchPayload,
  createAdminAccount,
  fetchAdminAccountCreatePage,
  fetchFrontendSession,
  FrontendSession,
  searchAdminCompanies
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ADMIN_BUTTON_LABELS } from "../admin-ui/labels";
import {
  AdminInput,
  AdminSelect,
  AdminTable,
  GridToolbar,
  MemberActionBar,
  MemberButton,
  MemberIconButton,
  MemberModalFooter,
  MemberPermissionButton
} from "../admin-ui/common";
import { AdminEditPageFrame } from "../admin-ui/pageFrames";

const ROLE_PRESETS = [
  { code: "MASTER", label: "마스터 관리자" },
  { code: "SYSTEM", label: "시스템 관리자" },
  { code: "OPERATION", label: "운영 관리자" }
] as const;

const ROLE_PRESET_SUMMARIES: Record<string, string> = {
  MASTER: "기관 검색 없이 마스터 관리자 권한을 바로 부여합니다.",
  SYSTEM: "소속 회사 기준으로 설정, 계정, 운영 체계를 총괄합니다.",
  OPERATION: "소속 회사 기준으로 실무 운영과 현장 업무를 담당합니다."
};

const MEMBERSHIP_TYPE_OPTIONS = [
  { value: "E", label: "CO2 배출사업자" },
  { value: "P", label: "CCUS 프로젝트 사업자" },
  { value: "C", label: "진흥·지원 기관" },
  { value: "G", label: "관계 기관·주무관청" }
] as const;

function roleChipClass(active: boolean) {
  return `flex min-h-[56px] w-full items-center justify-center rounded-[var(--kr-gov-radius)] border px-4 text-center text-sm font-bold whitespace-nowrap transition-all ${
    active
      ? "border-[var(--kr-gov-blue)] bg-blue-50 text-[var(--kr-gov-blue)] shadow-sm"
      : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)] hover:border-[var(--kr-gov-blue)]/40 hover:bg-slate-50"
  }`;
}

type CompanyResult = CompanySearchPayload["list"][number];

export function AdminAccountCreateMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AdminAccountCreatePagePayload | null>(null);
  const [rolePreset, setRolePreset] = useState("MASTER");
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [phone1, setPhone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [deptNm, setDeptNm] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [insttId, setInsttId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bizrno, setBizrno] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [companyKeyword, setCompanyKeyword] = useState("");
  const [companySearch, setCompanySearch] = useState<CompanySearchPayload | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [error, setError] = useState("");
  const [searchingCompanies, setSearchingCompanies] = useState(false);

  useEffect(() => {
    Promise.all([fetchFrontendSession(), fetchAdminAccountCreatePage()])
      .then(([sessionPayload, pagePayload]) => {
        setSession(sessionPayload);
        setPage(pagePayload);
        setRolePreset(String(pagePayload.adminAccountCreatePreset || "MASTER"));
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (rolePreset === "MASTER") {
      setMembershipType("");
      setInsttId("");
      setCompanyName("");
      setBizrno("");
      setRepresentativeName("");
    }
  }, [page, rolePreset]);

  const canUseCreate = !!page?.canUseAdminAccountCreate;
  const filteredCompanyResults = useMemo(() => {
    const rows = companySearch?.list || [];
    if (!membershipType) return rows;
    return rows.filter((item) => String(item.entrprsSeCode || "").toUpperCase() === membershipType);
  }, [companySearch, membershipType]);

  function resetForm() {
    setAdminId("");
    setAdminName("");
    setPassword("");
    setPasswordConfirm("");
    setAdminEmail("");
    setPhone1("010");
    setPhone2("");
    setPhone3("");
    setDeptNm("");
    setMembershipType("");
    setInsttId("");
    setCompanyName("");
    setBizrno("");
    setRepresentativeName("");
    setCompanyKeyword("");
    setCompanySearch(null);
    setCompanySearchOpen(false);
    setIdCheckMessage("");
  }

  function applyCompany(item: CompanyResult) {
    setInsttId(item.insttId);
    setCompanyName(item.cmpnyNm);
    setBizrno(item.bizrno);
    setRepresentativeName(item.cxfc);
    setCompanySearchOpen(false);
  }

  async function handleCheckId() {
    setError("");
    setIdCheckMessage("");
    try {
      const result = await checkAdminAccountId(adminId);
      setIdCheckMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ID 확인 실패");
    }
  }

  async function handleCompanySearch(pageIndex = 1) {
    setError("");
    if (!membershipType) {
      setError("회사 타입을 먼저 선택해 주세요.");
      return;
    }
    setSearchingCompanies(true);
    try {
      const result = await searchAdminCompanies({ keyword: companyKeyword, page: pageIndex, size: 5 });
      setCompanySearch(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회사 검색 실패");
    } finally {
      setSearchingCompanies(false);
    }
  }

  async function handleSave() {
    if (!session) return;
    setError("");
    try {
      if (rolePreset !== "MASTER" && !membershipType) {
        throw new Error("시스템 관리자와 운영 관리자는 회사 타입을 선택해야 합니다.");
      }
      if (rolePreset !== "MASTER" && !insttId) {
        throw new Error("시스템 관리자와 운영 관리자는 기관 검색으로 소속 회사를 지정해야 합니다.");
      }
      await createAdminAccount(session, {
        rolePreset,
        adminId,
        adminName,
        password,
        passwordConfirm,
        adminEmail,
        phone1,
        phone2,
        phone3,
        deptNm,
        insttId,
        featureCodes: []
      });
      window.location.href = buildLocalizedPath("/admin/member/admin_list", "/en/admin/member/admin_list");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원·권한 관리" },
        { label: "관리자 사용자 추가" }
      ]}
      subtitle="관리자 계정 정보와 권한, 소속 정보를 입력합니다."
      title="관리자 사용자 추가"
    >
      {error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</section> : null}
      <CanView
        allowed={!!page?.canViewAdminAccountCreate}
        fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">이 화면을 볼 권한이 없습니다.</p></section>}
      >
        <form
          className=""
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <AdminEditPageFrame>
          <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm" data-help-id="admin-create-role">
            <GridToolbar
              actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield_person</span>}
              meta="마스터 관리자는 기관 검색 없이 생성하고, 시스템·운영 관리자는 회사 타입과 소속 기관을 지정합니다."
              title="관리 권한 프리셋 선택"
            />
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {ROLE_PRESETS.map((preset) => (
                  <button
                    className={roleChipClass(rolePreset === preset.code)}
                    disabled={!canUseCreate}
                    key={preset.code}
                    onClick={() => setRolePreset(preset.code)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                {ROLE_PRESET_SUMMARIES[rolePreset] || ROLE_PRESET_SUMMARIES.MASTER}
              </div>
            </div>
          </section>

          <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm" data-help-id="admin-create-account">
            <GridToolbar
              actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">manage_accounts</span>}
              title="계정 정보"
            />
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="admin-id">아이디 <span className="text-red-500">*</span></label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <AdminInput className="sm:flex-1" disabled={!canUseCreate} id="admin-id" placeholder="6~16자 영문, 숫자" spellCheck={false} value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                  <MemberPermissionButton allowed={canUseCreate} className="shrink-0 whitespace-nowrap sm:min-w-[126px]" onClick={handleCheckId} reason="생성 권한이 있어야 중복 확인을 사용할 수 있습니다." type="button" variant="primary">중복 확인</MemberPermissionButton>
                </div>
                {idCheckMessage ? <div className="text-sm text-[var(--kr-gov-blue)]">{idCheckMessage}</div> : null}
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="user-name-top">이름 <span className="text-red-500">*</span></label>
                <AdminInput disabled={!canUseCreate} id="user-name-top" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="password">비밀번호 <span className="text-red-500">*</span></label>
                <AdminInput disabled={!canUseCreate} id="password" placeholder="영문, 숫자, 특수문자 조합 8자 이상" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="password-confirm">비밀번호 확인 <span className="text-red-500">*</span></label>
                <AdminInput disabled={!canUseCreate} id="password-confirm" placeholder="비밀번호를 다시 입력하세요" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                {passwordConfirm ? (
                  <div className={`text-sm ${password === passwordConfirm ? "text-[var(--kr-gov-success)]" : "text-[var(--kr-gov-error)]"}`}>
                    {password === passwordConfirm ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6" id="infoSectionGrid">
            <section className={`section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm ${rolePreset === "MASTER" ? "xl:col-span-2" : ""}`}>
              <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">badge</span>
                <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">개인 정보</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="user-name">성명 <span className="text-red-500">*</span></label>
                  <AdminInput disabled={!canUseCreate} id="user-name" placeholder="사용자 성함을 입력하세요" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="email">공식 이메일 <span className="text-red-500">*</span></label>
                  <AdminInput disabled={!canUseCreate} id="email" placeholder="example@korea.kr / domain.com" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="contact-mid">연락처 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <AdminSelect className="min-w-0" disabled={!canUseCreate} value={phone1} onChange={(e) => setPhone1(e.target.value)}>
                      <option value="010">010</option>
                      <option value="011">011</option>
                      <option value="02">02</option>
                    </AdminSelect>
                    <span className="flex items-center">-</span>
                    <AdminInput className="min-w-0" disabled={!canUseCreate} id="contact-mid" inputMode="numeric" value={phone2} onChange={(e) => setPhone2(e.target.value)} />
                    <span className="flex items-center">-</span>
                    <AdminInput className="min-w-0" disabled={!canUseCreate} inputMode="numeric" value={phone3} onChange={(e) => setPhone3(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            {rolePreset !== "MASTER" ? (
              <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm">
                <GridToolbar
                  actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>}
                  title="소속 정보"
                />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="affiliation-type">회사 타입 <span className="text-red-500">*</span></label>
                    <AdminSelect disabled={!canUseCreate} id="affiliation-type" value={membershipType} onChange={(e) => setMembershipType(e.target.value)}>
                      <option value="">회사 타입을 선택하세요</option>
                      {MEMBERSHIP_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </AdminSelect>
                    <p className="text-xs text-[var(--kr-gov-text-secondary)]">시스템 관리자와 운영 관리자는 선택한 회사 타입 기준으로 기관 검색을 진행합니다.</p>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="department">부서명</label>
                    <AdminInput disabled={!canUseCreate} id="department" placeholder="부서명을 입력하세요" value={deptNm} onChange={(e) => setDeptNm(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="company-search">소속 기관 / 기업명 <span className="text-red-500">*</span></label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" value={insttId} />
                      <AdminInput className="bg-gray-50 sm:flex-1" id="company-search" placeholder="기관 검색으로 소속 회사를 선택해 주세요" readOnly value={companyName} />
                      <MemberPermissionButton
                        allowed={canUseCreate}
                        className="shrink-0 whitespace-nowrap sm:min-w-[132px]"
                        onClick={() => {
                          if (!membershipType) {
                            setError("회사 타입을 먼저 선택해 주세요.");
                            return;
                          }
                          setCompanySearchOpen(true);
                        }}
                        reason="생성 권한이 있어야 기관 검색을 사용할 수 있습니다."
                        type="button"
                        variant="primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">search</span>기관 검색
                      </MemberPermissionButton>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="biz-number">사업자등록번호</label>
                    <AdminInput className="bg-gray-50" id="biz-number" readOnly value={bizrno} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="representative-name">대표자명</label>
                    <AdminInput className="bg-gray-50" id="representative-name" readOnly value={representativeName} />
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <MemberActionBar
            dataHelpId="admin-create-actions"
            description="관리자 목록으로 돌아가거나 입력값을 초기화한 뒤 현재 관리자 계정을 등록할 수 있습니다."
            eyebrow="작업 흐름"
            primary={(
              <MemberPermissionButton
                allowed={canUseCreate}
                className="w-full max-w-[320px] shadow-lg shadow-blue-900/10"
                icon="person_add"
                onClick={handleSave}
                reason="webmaster만 관리자 계정을 생성할 수 있습니다."
                size="lg"
                type="button"
                variant="primary"
              >
                {ADMIN_BUTTON_LABELS.create}
              </MemberPermissionButton>
            )}
            secondary={{
              href: buildLocalizedPath("/admin/member/admin_list", "/en/admin/member/admin_list"),
              icon: "list",
              label: ADMIN_BUTTON_LABELS.list
            }}
            tertiary={{
              icon: "refresh",
              label: ADMIN_BUTTON_LABELS.reset,
              onClick: resetForm
            }}
            title="입력한 관리자 정보와 소속 정보를 검토한 뒤 등록하세요."
          />
          </AdminEditPageFrame>
        </form>

        <div aria-labelledby="modal-title" aria-modal="true" className={`${companySearchOpen ? "fixed" : "hidden"} inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm`} role="dialog">
          <div className="bg-white w-full max-w-[800px] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2" id="modal-title">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>
                기관/기업 검색
              </h2>
              <MemberIconButton aria-label="닫기" onClick={() => setCompanySearchOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </MemberIconButton>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]" htmlFor="modal-search">검색어 입력</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                      <AdminInput aria-label="기관명 또는 사업자등록번호 입력" className="pl-11 pr-4" id="modal-search" placeholder="기관명 또는 사업자등록번호를 입력하세요" value={companyKeyword} onChange={(e) => setCompanyKeyword(e.target.value)} />
                    </div>
                    <MemberButton className="shrink-0 whitespace-nowrap sm:min-w-[110px]" onClick={() => handleCompanySearch(1)} type="button" variant="primary">{ADMIN_BUTTON_LABELS.search}</MemberButton>
                  </div>
                </div>
              </div>
              <div className="border border-[var(--kr-gov-border-light)] rounded-lg overflow-hidden mb-4">
                <AdminTable>
                  <thead className="bg-[var(--kr-gov-bg-gray)] border-b border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)]">
                    <tr>
                      <th className="px-4 py-3 font-bold text-center w-12" scope="col">No</th>
                      <th className="px-4 py-3 font-bold" scope="col">기관/기업명</th>
                      <th className="px-4 py-3 font-bold" scope="col">사업자등록번호</th>
                      <th className="px-4 py-3 font-bold" scope="col">대표자명</th>
                      <th className="px-4 py-3 font-bold text-center" scope="col">선택</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {searchingCompanies ? (
                      <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>검색 중...</td></tr>
                    ) : filteredCompanyResults.length === 0 ? (
                      <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>검색어를 입력하고 검색 버튼을 눌러 주세요.</td></tr>
                    ) : (
                      filteredCompanyResults.map((item, idx) => (
                        <tr className="hover:bg-blue-50/50 transition-colors" key={item.insttId}>
                          <td className="px-4 py-4 text-center text-gray-500">{((companySearch?.page || 1) - 1) * (companySearch?.size || 5) + idx + 1}</td>
                          <td className="px-4 py-4 font-medium">{item.cmpnyNm}</td>
                          <td className="px-4 py-4 text-gray-600">{item.bizrno}</td>
                          <td className="px-4 py-4 text-gray-600">{item.cxfc}</td>
                          <td className="px-4 py-4 text-center">
                            <MemberButton onClick={() => applyCompany(item)} size="xs" type="button">선택</MemberButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </AdminTable>
              </div>
              {companySearch && companySearch.list.length > 0 && filteredCompanyResults.length === 0 ? (
                <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  선택한 회사 타입에 맞는 기관이 없습니다. 회사 타입이나 검색어를 다시 확인해 주세요.
                </div>
              ) : null}
              <nav aria-label="검색 결과 페이지" className={`${(companySearch?.totalPages || 0) > 1 ? "flex" : "hidden"} justify-center items-center gap-1 my-4`}>
                {Array.from({ length: Number(companySearch?.totalPages || 0) }, (_, idx) => idx + 1).map((pageIndex) => (
                  <MemberButton
                    className={`min-w-[36px] h-9 rounded border px-3 ${pageIndex === Number(companySearch?.page || 1) ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white" : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)]"}`}
                    key={pageIndex}
                    onClick={() => handleCompanySearch(pageIndex)}
                    variant="ghost"
                    type="button"
                  >
                    {pageIndex}
                  </MemberButton>
                ))}
              </nav>
              <div className="bg-gray-50 border-t border-b border-gray-200 p-4 rounded-md">
                <p className="text-[13px] text-[var(--kr-gov-text-secondary)] flex items-center gap-1.5 leading-relaxed">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                  찾으시는 정보가 없는 경우 <a className="font-bold text-[var(--kr-gov-blue)] text-sm hover:underline" href={buildLocalizedPath("/admin/member/company_account", "/en/admin/member/company_account")}>[신규 회원사 등록]</a>을 진행해 주세요.
                </p>
              </div>
            </div>
            <MemberModalFooter
              right={<MemberButton onClick={() => setCompanySearchOpen(false)} type="button">취소</MemberButton>}
            />
          </div>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
