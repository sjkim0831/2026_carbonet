import { useEffect, useMemo, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import {
  AdminAccountCreatePagePayload,
  checkAdminAccountId,
  CompanySearchPayload,
  createAdminAccount,
  fetchAdminAccountCreatePage,
  fetchFrontendSession,
  FrontendSession,
  searchAdminCompanies
} from "../../lib/api";

const ROLE_PRESETS = [
  { code: "MASTER", label: "마스터 관리자" },
  { code: "SYSTEM", label: "시스템 관리자" },
  { code: "OPERATION", label: "운영 관리자" },
  { code: "GENERAL", label: "일반 관리자" }
] as const;

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
  const [insttId, setInsttId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [companyKeyword, setCompanyKeyword] = useState("");
  const [companySearch, setCompanySearch] = useState<CompanySearchPayload | null>(null);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetchFrontendSession(),
      fetchAdminAccountCreatePage()
    ])
      .then(([sessionPayload, pagePayload]) => {
        setSession(sessionPayload);
        setPage(pagePayload);
        setRolePreset(String(pagePayload.adminAccountCreatePreset || "MASTER"));
        const presetMap = (pagePayload.adminAccountCreatePresetFeatureCodes || {}) as Record<string, string[]>;
        setFeatureCodes(presetMap.MASTER || []);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    const presetMap = (page?.adminAccountCreatePresetFeatureCodes || {}) as Record<string, string[]>;
    setFeatureCodes([...(presetMap[rolePreset] || [])]);
    if (rolePreset === "MASTER") {
      setInsttId("");
      setCompanyName("");
    }
  }, [page, rolePreset]);

  const canUseCreate = !!page?.canUseAdminAccountCreate;
  const roleAuthorCode = useMemo(() => {
    const authorCodes = (page?.adminAccountCreatePresetAuthorCodes || {}) as Record<string, string>;
    return authorCodes[rolePreset] || "";
  }, [page, rolePreset]);

  function toggleFeature(code: string) {
    setFeatureCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
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
    try {
      const result = await searchAdminCompanies({ keyword: companyKeyword, page: pageIndex, size: 5, status: "P" });
      setCompanySearch(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회사 검색 실패");
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
      setAdminId("");
      setAdminName("");
      setPassword("");
      setPasswordConfirm("");
      setAdminEmail("");
      setPhone2("");
      setPhone3("");
      setDeptNm("");
      setInsttId("");
      setCompanyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>관리자 신규 생성 React 전환</h1>
        <p className="lede">신규 관리자 생성도 권한에 따라 섹션 노출과 저장 사용 여부를 분리해서 처리합니다.</p>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}

      <CanView
        allowed={!!page?.canViewAdminAccountCreate}
        fallback={<section className="panel"><p className="state-text">이 화면을 볼 권한이 없습니다.</p></section>}
      >
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Role Preset</p>
              <h2>{rolePreset}</h2>
            </div>
            <PermissionButton
              allowed={canUseCreate}
              className="primary-button"
              onClick={handleSave}
              reason="webmaster만 관리자 계정을 생성할 수 있습니다."
              type="button"
            >
              관리자 생성
            </PermissionButton>
          </div>

          <div className="create-grid">
            <label className="field field-wide">
              <span>권한 프리셋</span>
              <select disabled={!canUseCreate} value={rolePreset} onChange={(e) => setRolePreset(e.target.value)}>
                {ROLE_PRESETS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>관리자 ID</span>
              <input disabled={!canUseCreate} value={adminId} onChange={(e) => setAdminId(e.target.value)} />
            </label>
            <div className="field">
              <span>ID 중복 확인</span>
              <PermissionButton allowed={true} className="primary-button" onClick={handleCheckId} type="button">ID 확인</PermissionButton>
            </div>
            <label className="field">
              <span>이름</span>
              <input disabled={!canUseCreate} value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </label>
            <label className="field">
              <span>이메일</span>
              <input disabled={!canUseCreate} type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </label>
            <label className="field">
              <span>비밀번호</span>
              <input disabled={!canUseCreate} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="field">
              <span>비밀번호 확인</span>
              <input disabled={!canUseCreate} type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </label>
            <label className="field">
              <span>연락처 앞자리</span>
              <select disabled={!canUseCreate} value={phone1} onChange={(e) => setPhone1(e.target.value)}>
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="02">02</option>
              </select>
            </label>
            <label className="field">
              <span>연락처 중간</span>
              <input disabled={!canUseCreate} value={phone2} onChange={(e) => setPhone2(e.target.value)} />
            </label>
            <label className="field">
              <span>연락처 끝자리</span>
              <input disabled={!canUseCreate} value={phone3} onChange={(e) => setPhone3(e.target.value)} />
            </label>
            <label className="field">
              <span>부서명</span>
              <input disabled={!canUseCreate} value={deptNm} onChange={(e) => setDeptNm(e.target.value)} />
            </label>
            <label className="field field-wide">
              <span>기준 롤 코드</span>
              <input disabled value={roleAuthorCode} />
            </label>
          </div>
          {idCheckMessage ? <p className="state-text">{idCheckMessage}</p> : null}
        </section>

        <CanView
          allowed={rolePreset !== "MASTER"}
          fallback={<section className="panel"><p className="state-text">마스터 관리자는 회사 소속 없이 생성됩니다.</p></section>}
        >
          <section className="panel">
            <div className="section-head">
              <div>
                <p className="caption">Company Scope</p>
                <h2>{companyName || "소속 기관/기업 선택"}</h2>
              </div>
            </div>
            <div className="toolbar">
              <label className="field field-wide">
                <span>회사 검색</span>
                <input disabled={!canUseCreate} value={companyKeyword} onChange={(e) => setCompanyKeyword(e.target.value)} placeholder="기관명 또는 사업자등록번호" />
              </label>
              <PermissionButton allowed={canUseCreate} className="primary-button" onClick={() => handleCompanySearch(1)} reason="저장 권한이 없으면 회사 선택도 사용할 수 없습니다." type="button">검색</PermissionButton>
            </div>
            <div className="meta-grid">
              <div><dt>선택 회사명</dt><dd>{companyName || "-"}</dd></div>
              <div><dt>기관 ID</dt><dd>{insttId || "-"}</dd></div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>기관명</th>
                    <th>사업자번호</th>
                    <th>대표자</th>
                    <th>선택</th>
                  </tr>
                </thead>
                <tbody>
                  {(companySearch?.list || []).length === 0 ? (
                    <tr><td colSpan={4}>검색 결과가 없습니다.</td></tr>
                  ) : (companySearch?.list || []).map((item) => (
                    <tr key={item.insttId}>
                      <td>{item.cmpnyNm}</td>
                      <td>{item.bizrno}</td>
                      <td>{item.cxfc}</td>
                      <td>
                        <PermissionButton
                          allowed={canUseCreate}
                          className="primary-button"
                          onClick={() => {
                            setInsttId(item.insttId);
                            setCompanyName(item.cmpnyNm);
                          }}
                          reason="저장 권한이 없으면 회사를 선택할 수 없습니다."
                          type="button"
                        >
                          선택
                        </PermissionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </CanView>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Feature Overrides</p>
              <h2>기능별 권한 조정</h2>
            </div>
            <div className="stat-chip">{featureCodes.length} features</div>
          </div>
          <div className="feature-sections">
            {(page?.permissionFeatureSections || []).map((section) => (
              <article className="feature-card" key={section.menuCode}>
                <header>
                  <h3>{section.menuNm || section.menuNmEn || section.menuCode}</h3>
                  <p>{section.menuUrl || "-"}</p>
                </header>
                <div className="feature-list">
                  {section.features.map((feature) => (
                    <label className="feature-row" key={feature.featureCode}>
                      <input
                        checked={featureCodes.includes(feature.featureCode)}
                        disabled={!canUseCreate}
                        onChange={() => toggleFeature(feature.featureCode)}
                        type="checkbox"
                      />
                      <span>
                        <strong>{feature.featureNm || feature.featureCode}</strong>
                        <small>{feature.featureCode}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </CanView>
    </main>
  );
}
