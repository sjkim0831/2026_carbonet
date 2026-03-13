import { ChangeEvent, useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import {
  CompanyAccountPagePayload,
  fetchCompanyAccountPage,
  fetchFrontendSession,
  FrontendSession,
  saveCompanyAccount
} from "../../lib/api";

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

function resolveInitialInsttId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("insttId") || "";
}

export function CompanyAccountMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<CompanyAccountPagePayload | null>(null);
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);
  const [lookupInsttId, setLookupInsttId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(insttId?: string) {
    const [sessionPayload, pagePayload] = await Promise.all([
      session ? Promise.resolve(session) : fetchFrontendSession(),
      fetchCompanyAccountPage(insttId)
    ]);
    setSession(sessionPayload);
    setPage(pagePayload);
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
    setLookupInsttId(String(source.insttId || insttId || ""));
    setFiles([]);
  }

  useEffect(() => {
    load(initialInsttId || undefined).catch((err: Error) => setError(err.message));
  }, []);

  function updateField<K extends keyof CompanyFormState>(key: K, value: CompanyFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!session) return;
    setError("");
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
      load(result.insttId).catch((err: Error) => setError(err.message));
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files || []));
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원사 계정 관리 React 전환</h1>
        <p className="lede">회원사 등록과 수정도 조회 권한과 저장 권한을 분리해서 마이그레이션합니다.</p>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}
      <CanView
        allowed={!!page?.canViewCompanyAccount}
        fallback={<section className="panel"><p className="state-text">회원사 관리 화면을 볼 권한이 없습니다.</p></section>}
      >
        <section className="panel">
          <div className="toolbar">
            <label className="field">
              <span>기관 ID 조회</span>
              <input value={lookupInsttId} onChange={(e) => setLookupInsttId(e.target.value)} placeholder="INSTT_..." />
            </label>
            <PermissionButton allowed={true} className="primary-button" onClick={() => load(lookupInsttId)} type="button">조회</PermissionButton>
            <PermissionButton
              allowed={!!page?.canUseCompanyAccountSave}
              className="primary-button"
              onClick={handleSave}
              reason="전체 관리자만 회원사 정보를 저장할 수 있습니다."
              type="button"
            >
              회원사 저장
            </PermissionButton>
          </div>
        </section>

        <section className="panel">
          <div className="meta-grid">
            <div><dt>모드</dt><dd>{page?.isEditMode ? "수정" : "신규"}</dd></div>
            <div><dt>기관 ID</dt><dd>{form.insttId || "-"}</dd></div>
            <div><dt>기존 첨부</dt><dd>{(page?.companyAccountFiles || []).length}</dd></div>
          </div>
          <div className="create-grid">
            <label className="field">
              <span>회원 유형</span>
              <select disabled={!page?.canUseCompanyAccountSave} value={form.membershipType} onChange={(e) => updateField("membershipType", e.target.value)}>
                <option value="E">CO2 배출사업자</option>
                <option value="P">CCUS 프로젝트</option>
                <option value="C">진흥센터</option>
                <option value="G">주무관청</option>
              </select>
            </label>
            <label className="field field-wide">
              <span>기관/기업명</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.agencyName} onChange={(e) => updateField("agencyName", e.target.value)} />
            </label>
            <label className="field">
              <span>대표자명</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.representativeName} onChange={(e) => updateField("representativeName", e.target.value)} />
            </label>
            <label className="field">
              <span>사업자등록번호</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.bizRegistrationNumber} onChange={(e) => updateField("bizRegistrationNumber", e.target.value)} />
            </label>
            <label className="field">
              <span>우편번호</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} />
            </label>
            <label className="field field-wide">
              <span>사업장 주소</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.companyAddress} onChange={(e) => updateField("companyAddress", e.target.value)} />
            </label>
            <label className="field field-wide">
              <span>상세 주소</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.companyAddressDetail} onChange={(e) => updateField("companyAddressDetail", e.target.value)} />
            </label>
            <label className="field">
              <span>담당자명</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.chargerName} onChange={(e) => updateField("chargerName", e.target.value)} />
            </label>
            <label className="field">
              <span>담당자 이메일</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.chargerEmail} onChange={(e) => updateField("chargerEmail", e.target.value)} />
            </label>
            <label className="field">
              <span>담당자 연락처</span>
              <input disabled={!page?.canUseCompanyAccountSave} value={form.chargerTel} onChange={(e) => updateField("chargerTel", e.target.value)} />
            </label>
            <label className="field field-wide">
              <span>증빙 파일 추가</span>
              <input disabled={!page?.canUseCompanyAccountSave} multiple onChange={handleFileChange} type="file" />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Existing Files</p>
              <h2>기존 첨부 문서</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>파일 ID</th>
                  <th>파일명</th>
                  <th>크기</th>
                </tr>
              </thead>
              <tbody>
                {(page?.companyAccountFiles || []).length === 0 ? (
                  <tr><td colSpan={3}>등록된 첨부 파일이 없습니다.</td></tr>
                ) : (page?.companyAccountFiles || []).map((file, index) => (
                  <tr key={`${file.fileId || "file"}-${index}`}>
                    <td>{file.fileId || "-"}</td>
                    <td>{file.orignlFileNm || "-"}</td>
                    <td>{file.fileMg || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {files.length > 0 ? <p className="state-text">새로 업로드할 파일 {files.length}건이 선택되었습니다.</p> : null}
        </section>
      </CanView>
    </main>
  );
}
