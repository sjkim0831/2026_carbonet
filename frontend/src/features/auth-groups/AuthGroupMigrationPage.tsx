import { FormEvent, useEffect, useState } from "react";
import {
  AuthGroupPagePayload,
  FrontendSession,
  createAuthGroup,
  fetchAuthGroupPage,
  fetchFrontendSession,
  saveAuthGroupFeatures
} from "../../lib/api";
import { CanView } from "../../components/CanView";
import { PermissionButton } from "../../components/CanUse";
import { deriveUiPermissions } from "../../lib/permissions";

type CreateFormState = {
  authorCode: string;
  authorNm: string;
  authorDc: string;
};

export function AuthGroupMigrationPage() {
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [page, setPage] = useState<AuthGroupPagePayload | null>(null);
  const [roleCategory, setRoleCategory] = useState("GENERAL");
  const [insttId, setInsttId] = useState("");
  const [authorCode, setAuthorCode] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    authorCode: "",
    authorNm: "",
    authorDc: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const permissions = deriveUiPermissions(session, page);

  useEffect(() => {
    fetchFrontendSession()
      .then(setSession)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchAuthGroupPage({
      authorCode,
      roleCategory,
      insttId
    })
      .then((payload) => {
        setPage(payload);
        setRoleCategory(payload.selectedRoleCategory || "GENERAL");
        setInsttId(payload.authGroupSelectedInsttId || "");
        setAuthorCode(payload.selectedAuthorCode || "");
        setSelectedFeatures(payload.selectedFeatureCodes || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authorCode, roleCategory, insttId]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      setError("세션 정보가 없습니다.");
      return;
    }
    setMessage("");
    setError("");
    createAuthGroup(session, {
      ...createForm,
      roleCategory,
      insttId
    })
      .then((result) => {
        setMessage(`권한 그룹이 생성되었습니다: ${result.authorCode}`);
        setAuthorCode(result.authorCode);
        setCreateForm({ authorCode: "", authorNm: "", authorDc: "" });
      })
      .catch((err: Error) => setError(err.message));
  }

  function handleSaveFeatures() {
    if (!session || !authorCode) {
      setError("선택된 권한 그룹이 없습니다.");
      return;
    }
    setMessage("");
    setError("");
    saveAuthGroupFeatures(session, {
      authorCode,
      roleCategory,
      featureCodes: selectedFeatures
    })
      .then(() => setMessage("권한-기능 매핑을 저장했습니다."))
      .catch((err: Error) => setError(err.message));
  }

  function toggleFeature(featureCode: string) {
    setSelectedFeatures((current) =>
      current.includes(featureCode)
        ? current.filter((code) => code !== featureCode)
        : [...current, featureCode]
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet React Migration</p>
        <h1>권한 그룹 React 전환</h1>
        <p className="lede">
          기존 권한 그룹 화면을 React 기준 조회/생성/기능 저장 API로 전환하는 첫 배치입니다.
        </p>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <p className="caption">Current User</p>
            <h2>{page?.currentUserId || session?.userId || "-"}</h2>
          </div>
          <div className="toolbar-actions">
            <label className="field">
              <span>권한 분류</span>
              <select value={roleCategory} onChange={(e) => setRoleCategory(e.target.value)}>
                {(page?.roleCategoryOptions || []).map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            {(roleCategory === "DEPARTMENT" || roleCategory === "USER") && (
              <label className="field">
                <span>회사</span>
                <select value={insttId} onChange={(e) => setInsttId(e.target.value)}>
                  {(page?.authGroupCompanyOptions || []).map((option) => (
                    <option key={option.insttId} value={option.insttId}>
                      {option.cmpnyNm}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              <span>권한 그룹</span>
              <select value={authorCode} onChange={(e) => setAuthorCode(e.target.value)}>
                <option value="">선택하세요</option>
                {(page?.filteredAuthorGroups || []).map((group) => (
                  <option key={group.authorCode} value={group.authorCode}>
                    {group.authorNm} ({group.authorCode})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {loading ? <p className="state-text">불러오는 중입니다.</p> : null}
        {page?.authGroupError ? <p className="error-text">{page.authGroupError}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
      </section>

      <section className="stats-grid">
        <article className="panel stat-card">
          <p className="caption">Authority Groups</p>
          <strong>{page?.authorGroupCount ?? 0}</strong>
        </article>
        <article className="panel stat-card">
          <p className="caption">Pages</p>
          <strong>{page?.pageCount ?? 0}</strong>
        </article>
        <article className="panel stat-card">
          <p className="caption">Features</p>
          <strong>{page?.featureCount ?? 0}</strong>
        </article>
      </section>

      <CanView
        allowed={
          roleCategory === "GENERAL"
            ? permissions.canViewGeneralAuthGroupSection
            : permissions.canViewScopedAuthGroupSection
        }
        fallback={
          <section className="panel">
            <h2>권한 그룹 추가</h2>
            <p className="state-text">현재 권한으로는 이 생성 섹션을 볼 수 없습니다.</p>
          </section>
        }
      >
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="caption">Create Group</p>
            <h2>권한 그룹 추가</h2>
          </div>
        </div>
        <form className="create-grid" onSubmit={handleCreate}>
          <label className="field">
            <span>Role 코드</span>
            <input
              value={createForm.authorCode}
              onChange={(e) => setCreateForm((current) => ({ ...current, authorCode: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Role 명</span>
            <input
              value={createForm.authorNm}
              onChange={(e) => setCreateForm((current) => ({ ...current, authorNm: e.target.value }))}
            />
          </label>
          <label className="field field-wide">
            <span>설명</span>
            <input
              value={createForm.authorDc}
              onChange={(e) => setCreateForm((current) => ({ ...current, authorDc: e.target.value }))}
            />
          </label>
          <div className="action-row">
            <PermissionButton
              allowed={
                roleCategory === "GENERAL"
                  ? permissions.canUseGeneralAuthGroupCreate
                  : permissions.canUseScopedAuthGroupCreate
              }
              className="primary-button"
              reason={
                roleCategory === "GENERAL"
                  ? "일반 권한 그룹 생성은 webmaster만 사용할 수 있습니다."
                  : "회사 범위 권한이 있을 때만 부서/사용자 권한 그룹을 생성할 수 있습니다."
              }
              type="submit"
            >
              권한 그룹 생성
            </PermissionButton>
          </div>
        </form>
      </section>
      </CanView>

      <CanView
        allowed={
          roleCategory === "GENERAL"
            ? permissions.canViewGeneralAuthGroupSection
            : permissions.canViewScopedAuthGroupSection
        }
        fallback={
          <section className="panel">
            <h2>기능 매핑</h2>
            <p className="state-text">현재 권한으로는 이 기능 매핑 섹션을 볼 수 없습니다.</p>
          </section>
        }
      >
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="caption">Feature Mapping</p>
            <h2>{page?.selectedAuthorName || "권한 그룹을 선택하세요"}</h2>
          </div>
          <PermissionButton
            allowed={
              !!authorCode &&
              (roleCategory === "GENERAL"
                ? permissions.canUseGeneralFeatureSave
                : permissions.canUseScopedFeatureSave)
            }
            className="primary-button"
            onClick={handleSaveFeatures}
            reason={
              roleCategory === "GENERAL"
                ? "일반 권한 그룹 기능 저장은 webmaster만 사용할 수 있습니다."
                : "회사 범위 권한이 있을 때만 부서/사용자 권한 그룹 기능을 저장할 수 있습니다."
            }
            type="button"
          >
            기능 저장
          </PermissionButton>
        </div>
        <div className="feature-sections">
          {(page?.featureSections || []).map((section) => (
            <article className="feature-card" key={section.menuCode}>
              <header>
                <h3>{section.menuNm || section.menuNmEn || section.menuCode}</h3>
                <p>{section.menuUrl || "-"}</p>
              </header>
              <div className="feature-list">
                {section.features.map((feature) => (
                  <label className="feature-row" key={feature.featureCode}>
                    <input
                      checked={selectedFeatures.includes(feature.featureCode)}
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
