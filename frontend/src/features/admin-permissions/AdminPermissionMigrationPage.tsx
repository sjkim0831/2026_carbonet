import { useEffect, useState } from "react";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import { AdminPermissionPagePayload, fetchAdminPermissionPage, fetchFrontendSession, FrontendSession, saveAdminPermission } from "../../lib/api";

function resolveInitialEmplyrId() {
  if (typeof window === "undefined") return "webmaster";
  return new URLSearchParams(window.location.search).get("emplyrId") || "webmaster";
}

export function AdminPermissionMigrationPage() {
  const initialEmplyrId = resolveInitialEmplyrId();
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AdminPermissionPagePayload | null>(null);
  const [emplyrId, setEmplyrId] = useState(initialEmplyrId);
  const [authorCode, setAuthorCode] = useState("");
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(target: string) {
    const [sessionPayload, pagePayload] = await Promise.all([
      session ? Promise.resolve(session) : fetchFrontendSession(),
      fetchAdminPermissionPage(target)
    ]);
    setSession(sessionPayload);
    setPage(pagePayload);
    setAuthorCode(String(pagePayload.permissionSelectedAuthorCode || ""));
    setFeatureCodes((pagePayload.permissionEffectiveFeatureCodes as string[]) || []);
  }

  useEffect(() => {
    load(initialEmplyrId).catch((err: Error) => setError(err.message));
  }, []);

  function toggleFeature(code: string) {
    setFeatureCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function handleSave() {
    if (!session || !page?.adminPermissionTarget) return;
    setError("");
    setMessage("");
    try {
      await saveAdminPermission(session, { emplyrId: page.adminPermissionTarget.emplyrId, authorCode, featureCodes });
      setMessage("관리자 권한을 저장했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>관리자 권한 편집 React 전환</h1>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}
      <section className="panel">
        <div className="toolbar">
          <label className="field"><span>관리자 ID</span><input value={emplyrId} onChange={(e) => setEmplyrId(e.target.value)} /></label>
          <PermissionButton allowed={true} className="primary-button" onClick={() => load(emplyrId)} type="button">조회</PermissionButton>
        </div>
      </section>
      <CanView allowed={!!page?.canViewAdminPermissionEdit} fallback={<section className="panel"><p className="state-text">편집 대상 관리자를 조회하세요.</p></section>}>
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="caption">Admin Permission</p>
              <h2>{page?.adminPermissionTarget?.emplyrId || "-"}</h2>
            </div>
            <PermissionButton allowed={!!page?.canUseAdminPermissionSave} className="primary-button" onClick={handleSave} reason="webmaster만 관리자 권한을 저장할 수 있습니다." type="button">권한 저장</PermissionButton>
          </div>
          <div className="create-grid">
            <label className="field field-wide">
              <span>기준 권한 롤</span>
              <select disabled={!page?.canUseAdminPermissionSave} value={authorCode} onChange={(e) => setAuthorCode(e.target.value)}>
                <option value="">권한 롤 선택</option>
                {(page?.permissionAuthorGroups || []).map((group) => <option key={group.authorCode} value={group.authorCode}>{group.authorNm} ({group.authorCode})</option>)}
              </select>
            </label>
          </div>
          <div className="feature-sections">
            {(page?.permissionFeatureSections || []).map((section) => (
              <article className="feature-card" key={section.menuCode}>
                <header><h3>{section.menuNm || section.menuNmEn || section.menuCode}</h3><p>{section.menuUrl || "-"}</p></header>
                <div className="feature-list">
                  {section.features.map((feature) => (
                    <label className="feature-row" key={feature.featureCode}>
                      <input disabled={!page?.canUseAdminPermissionSave} checked={featureCodes.includes(feature.featureCode)} onChange={() => toggleFeature(feature.featureCode)} type="checkbox" />
                      <span><strong>{feature.featureNm || feature.featureCode}</strong><small>{feature.featureCode}</small></span>
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
