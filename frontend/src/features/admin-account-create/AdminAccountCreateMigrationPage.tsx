import { useEffect, useMemo, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
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

const ROLE_PRESETS = [
  { code: "MASTER", label: "마스터 관리자" },
  { code: "SYSTEM", label: "시스템 관리자" },
  { code: "OPERATION", label: "운영 관리자" },
  { code: "GENERAL", label: "일반 관리자" }
] as const;

function roleChipClass(active: boolean) {
  return `flex items-center justify-center min-h-[52px] rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 text-sm font-bold transition-all ${
    active
      ? "border-[var(--kr-gov-blue)] bg-blue-50 text-[var(--kr-gov-blue)] shadow-sm"
      : "bg-white text-[var(--kr-gov-text-secondary)]"
  }`;
}

type CompanyResult = CompanySearchPayload["list"][number];

function normalizeText(value: unknown, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

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
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [companyKeyword, setCompanyKeyword] = useState("");
  const [companySearch, setCompanySearch] = useState<CompanySearchPayload | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    const presetMap = (page?.adminAccountCreatePresetFeatureCodes || {}) as Record<string, string[]>;
    setFeatureCodes([...(presetMap[rolePreset] || [])]);
    if (rolePreset === "MASTER") {
      setMembershipType("");
      setInsttId("");
      setCompanyName("");
      setBizrno("");
      setRepresentativeName("");
    }
  }, [page, rolePreset]);

  const canUseCreate = !!page?.canUseAdminAccountCreate;
  const featureSections = page?.permissionFeatureSections || [];
  const summarySections = featureSections.slice(0, 4);

  const sectionSelections = useMemo(() => (
    summarySections.map((section) => ({
      section,
      selectedCount: section.features.filter((feature) => featureCodes.includes(feature.featureCode)).length,
      totalCount: section.features.length
    }))
  ), [featureCodes, summarySections]);

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
    setMessage("");
  }

  function applyCompany(item: CompanyResult) {
    setInsttId(item.insttId);
    setCompanyName(item.cmpnyNm);
    setBizrno(item.bizrno);
    setRepresentativeName(item.cxfc);
    setCompanySearchOpen(false);
  }

  function toggleSection(sectionFeatureCodes: string[], nextChecked: boolean) {
    setFeatureCodes((current) => {
      const set = new Set(current);
      sectionFeatureCodes.forEach((code) => {
        if (nextChecked) {
          set.add(code);
        } else {
          set.delete(code);
        }
      });
      return [...set];
    });
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
    setSearchingCompanies(true);
    try {
      const result = await searchAdminCompanies({ keyword: companyKeyword, page: pageIndex, size: 5, status: "P" });
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
    setMessage("");
    try {
      const result = await createAdminAccount(session, {
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
        featureCodes
      });
      setMessage(`${result.emplyrId} 관리자 계정을 생성했습니다.`);
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
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</section> : null}

      <CanView
        allowed={!!page?.canViewAdminAccountCreate}
        fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">이 화면을 볼 권한이 없습니다.</p></section>}
      >
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield_person</span>
              <div>
                <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">마스터 관리자 선택</h3>
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">마스터 선택 시 회사 분류 없이 전체 권한 범위로 등록합니다.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            </div>
          </section>

          <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">manage_accounts</span>
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">계정 정보</h3>
            </div>
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="admin-id">아이디 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="admin-id" placeholder="6~16자 영문, 숫자" spellCheck={false} value={adminId} onChange={(e) => setAdminId(e.target.value)} />
                  <PermissionButton allowed={canUseCreate} className="px-4 bg-gray-800 text-white text-sm font-bold rounded-[var(--kr-gov-radius)] whitespace-nowrap" onClick={handleCheckId} reason="생성 권한이 있어야 중복 확인을 사용할 수 있습니다." type="button">중복확인</PermissionButton>
                </div>
                {idCheckMessage ? <div className="text-sm text-[var(--kr-gov-blue)]">{idCheckMessage}</div> : null}
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="user-name-top">이름 <span className="text-red-500">*</span></label>
                <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="user-name-top" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="password">비밀번호 <span className="text-red-500">*</span></label>
                <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="password" placeholder="영문, 숫자, 특수문자 조합 8자 이상" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="password-confirm">비밀번호 확인 <span className="text-red-500">*</span></label>
                <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="password-confirm" placeholder="비밀번호를 다시 입력하세요" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
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
                  <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="user-name" placeholder="사용자 성함을 입력하세요" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="email">공식 이메일 <span className="text-red-500">*</span></label>
                  <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="email" placeholder="example@korea.kr / domain.com" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="contact-mid">연락처 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select className="form-input w-24 h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} value={phone1} onChange={(e) => setPhone1(e.target.value)}>
                      <option value="010">010</option>
                      <option value="011">011</option>
                      <option value="02">02</option>
                    </select>
                    <span className="flex items-center">-</span>
                    <input className="form-input flex-1 h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="contact-mid" inputMode="numeric" value={phone2} onChange={(e) => setPhone2(e.target.value)} />
                    <span className="flex items-center">-</span>
                    <input className="form-input flex-1 h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} inputMode="numeric" value={phone3} onChange={(e) => setPhone3(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            {rolePreset !== "MASTER" ? (
              <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>
                  <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">소속 정보</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="affiliation-type">회원 유형</label>
                    <select className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="affiliation-type" value={membershipType} onChange={(e) => setMembershipType(e.target.value)}>
                      <option value="">유형을 선택하세요</option>
                      <option value="enterprise">기업회원</option>
                      <option value="agency">기관회원</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="department">부서명</label>
                    <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUseCreate} id="department" placeholder="부서명을 입력하세요" value={deptNm} onChange={(e) => setDeptNm(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="company-search">소속 기관 / 기업명 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input type="hidden" value={insttId} />
                      <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50" id="company-search" placeholder="기업명을 검색해 주세요" readOnly value={companyName} />
                      <PermissionButton allowed={canUseCreate} className="px-5 bg-gray-800 text-white text-sm font-bold rounded-[var(--kr-gov-radius)] whitespace-nowrap flex items-center gap-1" onClick={() => setCompanySearchOpen(true)} reason="생성 권한이 있어야 기관 검색을 사용할 수 있습니다." type="button">
                        <span className="material-symbols-outlined text-[18px]">search</span> 기관 검색
                      </PermissionButton>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="biz-number">사업자등록번호</label>
                    <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50" id="biz-number" readOnly value={bizrno} />
                  </div>
                  <div className="space-y-1">
                    <label className="form-label block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2" htmlFor="representative-name">대표자명</label>
                    <input className="form-input w-full h-12 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50" id="representative-name" readOnly value={representativeName} />
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <section className="section-shell border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--kr-gov-border-light)]">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">tune</span>
              <h3 className="text-lg font-bold text-[var(--kr-gov-text-primary)]">권한 부여</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="block text-sm font-bold text-[var(--kr-gov-text-primary)] mb-2">권한 프리셋 (Preset Role) <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      className={roleChipClass(rolePreset === preset.code)}
                      disabled={!canUseCreate}
                      key={`bottom-${preset.code}`}
                      onClick={() => setRolePreset(preset.code)}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">세부 메뉴 접근 권한 (Custom Toggle)</p>
                  <span className="text-xs text-[var(--kr-gov-text-secondary)]">기본 프리셋 위에 세부 토글을 추가로 조정합니다.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sectionSelections.map(({ section, selectedCount, totalCount }) => {
                    const checked = totalCount > 0 && selectedCount === totalCount;
                    const sectionFeatureCodes = section.features.map((feature) => feature.featureCode);
                    return (
                      <label className="flex items-center justify-between rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3" key={section.menuCode}>
                        <span className="text-sm font-medium text-[var(--kr-gov-text-primary)]">{normalizeText(section.menuNm || section.menuNmEn || section.menuCode)}</span>
                        <button
                          aria-label={`${normalizeText(section.menuNm || section.menuNmEn || section.menuCode)} 권한 토글`}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[var(--kr-gov-blue)]" : "bg-gray-300"}`}
                          disabled={!canUseCreate}
                          onClick={() => toggleSection(sectionFeatureCodes, !checked)}
                          type="button"
                        >
                          <span className={`absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
                        </button>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-2 flex justify-center gap-4">
            <button className="min-w-[180px] h-14 border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-colors" onClick={resetForm} type="button">
              초기화
            </button>
            <PermissionButton allowed={canUseCreate} className="min-w-[220px] h-14 bg-[var(--kr-gov-blue)] text-white text-lg font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors shadow-lg" onClick={handleSave} reason="webmaster만 관리자 계정을 생성할 수 있습니다." type="button">
              등록하기
            </PermissionButton>
          </div>
        </form>

        <div aria-labelledby="modal-title" aria-modal="true" className={`${companySearchOpen ? "fixed" : "hidden"} inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm`} role="dialog">
          <div className="bg-white w-full max-w-[800px] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[var(--kr-gov-text-primary)] flex items-center gap-2" id="modal-title">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">corporate_fare</span>
                기관/기업 검색
              </h2>
              <button aria-label="닫기" className="text-gray-400 hover:text-gray-600 rounded-full p-1" onClick={() => setCompanySearchOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[var(--kr-gov-text-secondary)]" htmlFor="modal-search">검색어 입력</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                      <input aria-label="기관명 또는 사업자등록번호 입력" className="w-full h-12 pl-11 pr-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" id="modal-search" placeholder="기관명 또는 사업자등록번호를 입력하세요" value={companyKeyword} onChange={(e) => setCompanyKeyword(e.target.value)} />
                    </div>
                    <button className="px-8 bg-[var(--kr-gov-blue)] text-white font-bold rounded-[var(--kr-gov-radius)] hover:bg-[var(--kr-gov-blue-hover)] transition-colors" onClick={() => handleCompanySearch(1)} type="button">검색</button>
                  </div>
                </div>
              </div>
              <div className="border border-[var(--kr-gov-border-light)] rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm text-left">
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
                    ) : (companySearch?.list || []).length === 0 ? (
                      <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={5}>검색어를 입력하고 검색 버튼을 눌러 주세요.</td></tr>
                    ) : (
                      (companySearch?.list || []).map((item, idx) => (
                        <tr className="hover:bg-blue-50/50 transition-colors" key={item.insttId}>
                          <td className="px-4 py-4 text-center text-gray-500">{((companySearch?.page || 1) - 1) * (companySearch?.size || 5) + idx + 1}</td>
                          <td className="px-4 py-4 font-medium">{item.cmpnyNm}</td>
                          <td className="px-4 py-4 text-gray-600">{item.bizrno}</td>
                          <td className="px-4 py-4 text-gray-600">{item.cxfc}</td>
                          <td className="px-4 py-4 text-center">
                            <button className="px-3 py-1.5 border border-[var(--kr-gov-blue)] text-[var(--kr-gov-blue)] text-xs font-bold rounded-md hover:bg-[var(--kr-gov-blue)] hover:text-white transition-all" onClick={() => applyCompany(item)} type="button">선택</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <nav aria-label="검색 결과 페이지" className={`${(companySearch?.totalPages || 0) > 1 ? "flex" : "hidden"} justify-center items-center gap-1 my-4`}>
                {Array.from({ length: Number(companySearch?.totalPages || 0) }, (_, idx) => idx + 1).map((pageIndex) => (
                  <button
                    className={`min-w-[36px] h-9 px-3 rounded border ${pageIndex === Number(companySearch?.page || 1) ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white" : "border-[var(--kr-gov-border-light)] bg-white text-[var(--kr-gov-text-secondary)]"}`}
                    key={pageIndex}
                    onClick={() => handleCompanySearch(pageIndex)}
                    type="button"
                  >
                    {pageIndex}
                  </button>
                ))}
              </nav>
              <div className="bg-gray-50 border-t border-b border-gray-200 p-4 rounded-md">
                <p className="text-[13px] text-[var(--kr-gov-text-secondary)] flex items-center gap-1.5 leading-relaxed">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                  찾으시는 정보가 없는 경우 <a className="font-bold text-[var(--kr-gov-blue)] text-sm hover:underline" href={buildLocalizedPath("/admin/member/company_account", "/en/admin/member/company_account")}>[신규 회원사 등록]</a>을 진행해 주세요.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-100 flex justify-end gap-2">
              <button className="px-6 py-2.5 bg-white border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50" onClick={() => setCompanySearchOpen(false)} type="button">취소</button>
            </div>
          </div>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
