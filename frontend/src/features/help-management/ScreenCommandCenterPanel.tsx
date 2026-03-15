import { useEffect, useMemo, useState } from "react";
import {
  fetchScreenCommandPage,
  ScreenCommandApi,
  ScreenCommandChangeTarget,
  ScreenCommandEvent,
  ScreenCommandFieldSpec,
  ScreenCommandMaskRule,
  ScreenCommandPagePayload,
  ScreenCommandSchema,
  ScreenCommandSurface
} from "../../lib/api/client";

type ScreenCommandCenterPanelProps = {
  initialPageId: string;
};

function buildDirectionPreview(params: {
  pageLabel: string;
  routePath: string;
  surface?: ScreenCommandSurface;
  event?: ScreenCommandEvent;
  api?: ScreenCommandApi;
  target?: ScreenCommandChangeTarget;
  schema?: ScreenCommandSchema;
  instruction: string;
}) {
  const lines = [
    `대상 화면: ${params.pageLabel} (${params.routePath})`,
    `대상 요소: ${params.surface ? `${params.surface.label} [${params.surface.selector}]` : "미선택"}`,
    `이벤트: ${params.event ? `${params.event.label} / ${params.event.frontendFunction}` : "미선택"}`,
    `API/라우트: ${params.api ? `${params.api.method} ${params.api.endpoint}` : "미선택"}`,
    `백엔드 연결: ${params.api ? `${params.api.controllerAction} -> ${params.api.serviceMethod} -> ${params.api.mapperQuery}` : "미선택"}`,
    `함수 입력: ${params.event?.functionInputs?.map((item) => `${item.fieldId}:${item.type}`).join(", ") || "미선택"}`,
    `API 요청: ${params.api?.requestFields?.map((item) => `${item.fieldId}:${item.type}`).join(", ") || "미선택"}`,
    `스키마: ${params.schema ? `${params.schema.tableName} (${params.schema.columns.join(", ")})` : "미선택"}`,
    `수정 레이어: ${params.target ? `${params.target.label} [${params.target.editableFields.join(", ")}]` : "미선택"}`,
    `지시 내용: ${params.instruction || "구체 지시를 입력하세요."}`
  ];
  return lines.join("\n");
}

function renderFieldSpecs(title: string, items: ScreenCommandFieldSpec[] | undefined) {
  return (
    <div className="command-card">
      <p className="caption">{title}</p>
      {items && items.length > 0 ? (
        <div className="state-text">
          {items.map((item) => (
            <div key={`${title}-${item.fieldId}`}>
              <strong>{item.fieldId}</strong> [{item.type}] {item.required ? "required" : "optional"} / {item.source}
              <br />
              {item.notes}
            </div>
          ))}
        </div>
      ) : (
        <p className="state-text">-</p>
      )}
    </div>
  );
}

function renderMaskRules(items: ScreenCommandMaskRule[] | undefined) {
  return (
    <div className="command-card">
      <p className="caption">Masking</p>
      {items && items.length > 0 ? (
        <div className="state-text">
          {items.map((item) => (
            <div key={`mask-${item.fieldId}`}>
              <strong>{item.fieldId}</strong> [{item.strategy}]
              <br />
              {item.notes}
            </div>
          ))}
        </div>
      ) : (
        <p className="state-text">-</p>
      )}
    </div>
  );
}

export function ScreenCommandCenterPanel({ initialPageId }: ScreenCommandCenterPanelProps) {
  const [pageId, setPageId] = useState(initialPageId);
  const [payload, setPayload] = useState<ScreenCommandPagePayload | null>(null);
  const [surfaceId, setSurfaceId] = useState("");
  const [eventId, setEventId] = useState("");
  const [changeTargetId, setChangeTargetId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(nextPageId: string) {
    setLoading(true);
    setError("");
    try {
      const nextPayload = await fetchScreenCommandPage(nextPageId);
      setPayload(nextPayload);
      setPageId(nextPayload.selectedPageId || nextPageId);
      const firstSurfaceId = nextPayload.page?.surfaces?.[0]?.surfaceId || "";
      const firstTargetId = nextPayload.page?.changeTargets?.[0]?.targetId || "";
      setSurfaceId(firstSurfaceId);
      setEventId("");
      setChangeTargetId(firstTargetId);
      setInstruction("");
      setPreviewText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 디렉션 메타데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initialPageId).catch(() => undefined);
  }, [initialPageId]);

  const currentPage = payload?.page;
  const selectedSurface = useMemo(
    () => currentPage?.surfaces?.find((item) => item.surfaceId === surfaceId) || currentPage?.surfaces?.[0],
    [currentPage, surfaceId]
  );
  const availableEvents = useMemo(() => {
    if (!currentPage) {
      return [];
    }
    if (!selectedSurface?.eventIds?.length) {
      return currentPage.events || [];
    }
    const eventIdSet = new Set(selectedSurface.eventIds);
    return (currentPage.events || []).filter((item) => eventIdSet.has(item.eventId));
  }, [currentPage, selectedSurface]);
  const selectedEvent = useMemo(
    () => availableEvents.find((item) => item.eventId === eventId) || availableEvents[0],
    [availableEvents, eventId]
  );
  const availableApis = useMemo(() => {
    if (!currentPage) {
      return [];
    }
    if (!selectedEvent?.apiIds?.length) {
      return currentPage.apis || [];
    }
    const apiIdSet = new Set(selectedEvent.apiIds);
    return (currentPage.apis || []).filter((item) => apiIdSet.has(item.apiId));
  }, [currentPage, selectedEvent]);
  const selectedApi = availableApis[0];
  const selectedSchema = useMemo(() => {
    if (!currentPage) {
      return undefined;
    }
    const schemaId = selectedApi?.schemaIds?.[0];
    if (!schemaId) {
      return currentPage.schemas?.[0];
    }
    return currentPage.schemas.find((item) => item.schemaId === schemaId) || currentPage.schemas?.[0];
  }, [currentPage, selectedApi]);
  const selectedTarget = useMemo(
    () => currentPage?.changeTargets?.find((item) => item.targetId === changeTargetId) || currentPage?.changeTargets?.[0],
    [changeTargetId, currentPage]
  );
  const preview = useMemo(() => buildDirectionPreview({
    pageLabel: currentPage?.label || "-",
    routePath: currentPage?.routePath || "-",
    surface: selectedSurface,
    event: selectedEvent,
    api: selectedApi,
    target: selectedTarget,
    schema: selectedSchema,
    instruction
  }), [currentPage, instruction, selectedApi, selectedEvent, selectedSchema, selectedSurface, selectedTarget]);

  function handleGeneratePreview() {
    setPreviewText(preview);
  }

  return (
    <div className="help-command-center" data-help-id="help-management-command-center">
      {error ? <p className="error-text">{error}</p> : null}
      <section className="panel panel-embedded">
        <div className="section-head">
          <div>
            <p className="caption">Screen Command Scope</p>
            <h2>{currentPage?.label || "화면 메타데이터"}</h2>
          </div>
          <div className="toolbar-actions">
            <button className="primary-button" disabled={loading} onClick={() => load(pageId).catch(() => undefined)} type="button">
              {loading ? "불러오는 중..." : "화면 연결 불러오기"}
            </button>
          </div>
        </div>
        <div className="toolbar">
          <label className="field field-wide">
            <span>대상 화면</span>
            <select value={pageId} onChange={(event) => setPageId(event.target.value)}>
              {(payload?.pages || []).map((option) => (
                <option key={option.pageId} value={option.pageId}>
                  {option.label} ({option.routePath})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="meta-grid">
          <div>
            <dt>Route</dt>
            <dd>{currentPage?.routePath || "-"}</dd>
          </div>
          <div>
            <dt>Menu Code</dt>
            <dd>{currentPage?.menuCode || "-"}</dd>
          </div>
          <div>
            <dt>Menu URL</dt>
            <dd>{currentPage?.menuLookupUrl || "-"}</dd>
          </div>
        </div>
        <p className="state-text">{currentPage?.summary || "선택한 화면의 연결 메타데이터를 탐색합니다."}</p>
        <div className="meta-grid">
          <div>
            <dt>Registry</dt>
            <dd>{currentPage?.manifestRegistry?.pageId || "-"}</dd>
          </div>
          <div>
            <dt>Layout</dt>
            <dd>{currentPage?.manifestRegistry?.layoutVersion || "-"}</dd>
          </div>
          <div>
            <dt>Design Token</dt>
            <dd>{currentPage?.manifestRegistry?.designTokenVersion || "-"}</dd>
          </div>
          <div>
            <dt>Components</dt>
            <dd>{String(currentPage?.manifestRegistry?.componentCount || 0)}</dd>
          </div>
        </div>
      </section>

      <section className="panel panel-embedded">
        <div className="section-head">
          <div>
            <p className="caption">Element / Event / API</p>
            <h2>수정 경로 선택</h2>
          </div>
        </div>
        <div className="create-grid help-editor-grid">
          <label className="field">
            <span>요소</span>
            <select value={selectedSurface?.surfaceId || ""} onChange={(event) => setSurfaceId(event.target.value)}>
              {(currentPage?.surfaces || []).map((item) => (
                <option key={item.surfaceId} value={item.surfaceId}>
                  {item.label} ({item.componentId})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>이벤트</span>
            <select value={selectedEvent?.eventId || ""} onChange={(event) => setEventId(event.target.value)}>
              {availableEvents.map((item) => (
                <option key={item.eventId} value={item.eventId}>
                  {item.label} ({item.eventType})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>수정 레이어</span>
            <select value={selectedTarget?.targetId || ""} onChange={(event) => setChangeTargetId(event.target.value)}>
              {(currentPage?.changeTargets || []).map((item) => (
                <option key={item.targetId} value={item.targetId}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field field-wide">
            <span>작업 지시</span>
            <textarea
              rows={4}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="예: 회원목록 검색폼에 기관유형 필터를 추가하고 API 검색조건, 매퍼 조회조건, 권한 영향까지 함께 검토"
            />
          </label>
        </div>
        <div className="toolbar-actions">
          <button className="primary-button" data-action="generate" onClick={handleGeneratePreview} type="button">지시문 생성</button>
        </div>
      </section>

      <section className="panel panel-embedded">
        <div className="section-head">
          <div>
            <p className="caption">Connected Metadata</p>
            <h2>연결된 요소와 실행 경로</h2>
          </div>
        </div>
        <div className="command-grid">
          <article className="command-card">
            <p className="caption">선택 요소</p>
            <h3>{selectedSurface?.label || "-"}</h3>
            <p className="route-path">{selectedSurface?.selector || "-"}</p>
            <p className="state-text">{selectedSurface?.notes || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">이벤트</p>
            <h3>{selectedEvent?.label || "-"}</h3>
            <p className="route-path">{selectedEvent?.frontendFunction || "-"}</p>
            <p className="state-text">{selectedEvent?.notes || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">API / Controller</p>
            <h3>{selectedApi ? `${selectedApi.method} ${selectedApi.endpoint}` : "-"}</h3>
            <p className="route-path">{selectedApi?.controllerAction || "-"}</p>
            <p className="state-text">{selectedApi?.serviceMethod || "-"}</p>
          </article>
          <article className="command-card">
            <p className="caption">Schema</p>
            <h3>{selectedSchema?.tableName || "-"}</h3>
            <p className="route-path">{selectedApi?.mapperQuery || "-"}</p>
            <p className="state-text">{selectedSchema?.notes || "-"}</p>
          </article>
          {renderFieldSpecs("Function Inputs", selectedEvent?.functionInputs)}
          {renderFieldSpecs("Function Outputs", selectedEvent?.functionOutputs)}
          {renderFieldSpecs("API Request", selectedApi?.requestFields)}
          {renderFieldSpecs("API Response", selectedApi?.responseFields)}
          {renderMaskRules(selectedApi?.maskingRules)}
          <article className="command-card">
            <p className="caption">Guards / Side Effects</p>
            <h3>{selectedEvent?.eventId || "-"}</h3>
            <p className="route-path">{selectedEvent?.guardConditions?.join(", ") || "-"}</p>
            <p className="state-text">{selectedEvent?.sideEffects?.join(", ") || "-"}</p>
          </article>
        </div>
      </section>

      <section className="panel panel-embedded">
        <div className="section-head">
          <div>
            <p className="caption">Permission / Common Code</p>
            <h2>메뉴, 기능 권한, 공통코드</h2>
          </div>
        </div>
        <div className="command-grid">
          <article className="command-card">
            <p className="caption">VIEW 권한</p>
            <h3>{currentPage?.menuPermission?.requiredViewFeatureCode || "-"}</h3>
            <p className="state-text">{(currentPage?.menuPermission?.featureCodes || []).join(", ") || "기능 코드 없음"}</p>
          </article>
          <article className="command-card">
            <p className="caption">권한 해석 테이블</p>
            <h3>{(currentPage?.menuPermission?.relationTables || []).join(", ") || "-"}</h3>
            <p className="state-text">{(currentPage?.menuPermission?.resolverNotes || []).join(" ") || "-"}</p>
          </article>
          <article className="command-card command-card-wide">
            <p className="caption">공통코드 그룹</p>
            <div className="code-chip-list">
              {(currentPage?.commonCodeGroups || []).map((item) => (
                <span className="stat-chip" key={item.codeGroupId}>{item.codeGroupId}: {item.label}</span>
              ))}
            </div>
            <p className="state-text">
              {(currentPage?.commonCodeGroups || [])
                .map((item) => `${item.codeGroupId}[${item.values.join(", ")}]`)
                .join(" / ") || "-"}
            </p>
          </article>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>featureCode</th>
                <th>featureNm</th>
                <th>menuCode</th>
                <th>menuUrl</th>
              </tr>
            </thead>
            <tbody>
              {(currentPage?.menuPermission?.featureRows || []).length === 0 ? (
                <tr><td colSpan={4}>연결된 기능 코드가 없습니다.</td></tr>
              ) : (currentPage?.menuPermission?.featureRows || []).map((item) => (
                <tr key={item.featureCode}>
                  <td>{item.featureCode}</td>
                  <td>{item.featureNm}</td>
                  <td>{item.menuCode}</td>
                  <td>{item.menuUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel panel-embedded">
        <div className="section-head">
          <div>
            <p className="caption">Direction Preview</p>
            <h2>AI 작업 지시 초안</h2>
          </div>
        </div>
        <label className="field field-wide">
          <span>생성된 지시문</span>
          <textarea readOnly rows={9} value={previewText || preview} />
        </label>
      </section>
    </div>
  );
}
