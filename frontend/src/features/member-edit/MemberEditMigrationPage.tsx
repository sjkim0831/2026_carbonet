import { useMemo, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import { fetchFrontendSession, fetchMemberEditPage, FrontendSession, MemberEditPagePayload, saveMemberEdit } from "../../lib/api";

const DEFAULT_MEMBER_ID = "TEST1";

function resolveInitialMemberId() {
  if (typeof window === "undefined") return DEFAULT_MEMBER_ID;
  const params = new URLSearchParams(window.location.search);
  return params.get("memberId") || DEFAULT_MEMBER_ID;
}

export function MemberEditMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<MemberEditPagePayload | null>(null);
  const [memberIdInput, setMemberIdInput] = useState(initialMemberId);
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [form, setForm] = useState({
    memberId: initialMemberId,
    applcntNm: "",
    applcntEmailAdres: "",
    phoneNumber: "",
    entrprsSeCode: "",
    entrprsMberSttus: "",
    authorCode: "",
    zip: "",
    adres: "",
    detailAdres: "",
    marketingYn: "N",
    deptNm: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canView = !!page?.canViewMemberEdit;
  const canUse = !!page?.canUseMemberSave;

  const load = async (memberId: string) => {
    const [sessionPayload, pagePayload] = await Promise.all([
      session ? Promise.resolve(session) : fetchFrontendSession(),
      fetchMemberEditPage(memberId)
    ]);
    setSession(sessionPayload);
    setPage(pagePayload);
    const member = pagePayload.member;
    setForm({
      memberId,
      applcntNm: String(member?.applcntNm || ""),
      applcntEmailAdres: String(member?.applcntEmailAdres || ""),
      phoneNumber: String(pagePayload.phoneNumber || ""),
      entrprsSeCode: String((pagePayload as Record<string, unknown>).memberTypeCode || ""),
      entrprsMberSttus: String((pagePayload as Record<string, unknown>).memberStatusCode || ""),
      authorCode: String(pagePayload.permissionSelectedAuthorCode || ""),
      zip: String(member?.zip || ""),
      adres: String(member?.adres || ""),
      detailAdres: String(member?.detailAdres || ""),
      marketingYn: String(member?.marketingYn || "N"),
      deptNm: String(member?.deptNm || "")
    });
    setFeatureCodes((pagePayload.permissionEffectiveFeatureCodes as string[]) || []);
  };

  useMemo(() => {
    load(initialMemberId).catch((err: Error) => setError(err.message));
  }, []);

  function toggleFeature(code: string) {
    setFeatureCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function handleSave() {
    if (!session) {
      setError("세션 정보가 없습니다.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const result = await saveMemberEdit(session, { ...form, featureCodes });
      setMessage(`${result.memberId} 회원 정보를 저장했습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>회원 수정 React 전환</h1>
        <p className="lede">기본 정보, 권한 롤/개별 권한, 주소를 React로 옮기고 섹션별 노출/사용 권한을 분리합니다.</p>
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="field">
            <span>회원 ID</span>
            <input value={memberIdInput} onChange={(e) => setMemberIdInput(e.target.value)} />
          </label>
          <PermissionButton allowed={true} className="primary-button" onClick={() => load(memberIdInput)} type="button">
            조회
          </PermissionButton>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
      </section>

      <CanView
        allowed={canView}
        fallback={<section className="panel"><p className="state-text">{String(page?.member_editError || "회원 수정 화면을 볼 수 없습니다.")}</p></section>}
      >
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Member Basic Info</p>
              <h2>회원 기본 정보</h2>
            </div>
            <PermissionButton
              allowed={canUse}
              className="primary-button"
              onClick={handleSave}
              reason="현재 관리자 권한으로 수정 가능한 회원만 저장할 수 있습니다."
              type="button"
            >
              저장
            </PermissionButton>
          </div>
          <div className="create-grid">
            <label className="field"><span>회원명</span><input disabled={!canUse} value={form.applcntNm} onChange={(e) => setForm({ ...form, applcntNm: e.target.value })} /></label>
            <label className="field"><span>이메일</span><input disabled={!canUse} value={form.applcntEmailAdres} onChange={(e) => setForm({ ...form, applcntEmailAdres: e.target.value })} /></label>
            <label className="field"><span>연락처</span><input disabled={!canUse} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label>
            <label className="field"><span>부서명</span><input disabled={!canUse} value={form.deptNm} onChange={(e) => setForm({ ...form, deptNm: e.target.value })} /></label>
            <label className="field"><span>회원 유형</span><select disabled={!canUse} value={form.entrprsSeCode} onChange={(e) => setForm({ ...form, entrprsSeCode: e.target.value })}>{((page?.memberTypeOptions as Array<{code:string;label:string}>) || []).map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}</select></label>
            <label className="field"><span>회원 상태</span><select disabled={!canUse} value={form.entrprsMberSttus} onChange={(e) => setForm({ ...form, entrprsMberSttus: e.target.value })}>{((page?.memberStatusOptions as Array<{code:string;label:string}>) || []).map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}</select></label>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Role And Features</p>
              <h2>권한 롤 및 개별 권한</h2>
            </div>
          </div>
          <div className="create-grid">
            <label className="field field-wide">
              <span>기준 권한 롤</span>
              <select disabled={!canUse} value={form.authorCode} onChange={(e) => setForm({ ...form, authorCode: e.target.value })}>
                <option value="">권한 롤 선택</option>
                {(page?.permissionAuthorGroups || []).map((group) => (
                  <option key={group.authorCode} value={group.authorCode}>{group.authorNm} ({group.authorCode})</option>
                ))}
              </select>
            </label>
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
                      <input disabled={!canUse} checked={featureCodes.includes(feature.featureCode)} onChange={() => toggleFeature(feature.featureCode)} type="checkbox" />
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

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Address</p>
              <h2>연락 및 제출 주소</h2>
            </div>
          </div>
          <div className="create-grid">
            <label className="field"><span>우편번호</span><input disabled={!canUse} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></label>
            <label className="field"><span>상세주소</span><input disabled={!canUse} value={form.detailAdres} onChange={(e) => setForm({ ...form, detailAdres: e.target.value })} /></label>
            <label className="field field-wide"><span>기본주소</span><input disabled={!canUse} value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} /></label>
          </div>
        </section>
      </CanView>
    </main>
  );
}
