import { useEffect, useMemo, useState } from "react";
import { PAGE_MANIFESTS } from "../../app/screen-registry/pageManifests";
import {
  AuditEventSearchPayload,
  fetchAuditEvents,
  fetchHelpManagementPage,
  HelpManagementItem,
  HelpManagementPagePayload,
  saveHelpManagementPage
} from "../../lib/api/client";
import { ScreenCommandCenterPanel } from "./ScreenCommandCenterPanel";

type HelpManagementTab = "help" | "command";

function resolveInitialPageId() {
  if (typeof window === "undefined") {
    return "observability";
  }
  return new URLSearchParams(window.location.search).get("pageId") || "observability";
}

function createEmptyItem(displayOrder: number): HelpManagementItem {
  return {
    itemId: `draft-${displayOrder}`,
    title: "",
    body: "",
    anchorSelector: "",
    displayOrder,
    activeYn: "Y",
    placement: "top",
    imageUrl: "",
    iconName: "",
    highlightStyle: "focus",
    ctaLabel: "",
    ctaUrl: ""
  };
}

export function HelpManagementMigrationPage() {
  const manifestOptions = useMemo(() => Object.values(PAGE_MANIFESTS)
    .slice()
    .sort((left, right) => left.pageId.localeCompare(right.pageId)), []);
  const initialPageId = resolveInitialPageId();
  const [tab, setTab] = useState<HelpManagementTab>("help");
  const [selectedPageId, setSelectedPageId] = useState(initialPageId);
  const [payload, setPayload] = useState<HelpManagementPagePayload | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [helpVersion, setHelpVersion] = useState("v1");
  const [activeYn, setActiveYn] = useState("Y");
  const [items, setItems] = useState<HelpManagementItem[]>([]);
  const [auditPage, setAuditPage] = useState<AuditEventSearchPayload | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(pageId: string) {
    const [next, auditPayload] = await Promise.all([
      fetchHelpManagementPage(pageId),
      fetchAuditEvents({
        pageIndex: 1,
        pageSize: 10,
        pageId: "help-management",
        actionCode: "HELP_CONTENT_SAVE",
        searchKeyword: pageId
      })
    ]);
    setPayload(next);
    setAuditPage(auditPayload);
    setTitle(String(next.title || ""));
    setSummary(String(next.summary || ""));
    setHelpVersion(String(next.helpVersion || "v1"));
    setActiveYn(String(next.activeYn || "Y"));
    setItems((next.items || []).map((item, index) => ({
      itemId: String(item.itemId || `draft-${index + 1}`),
      title: String(item.title || ""),
      body: String(item.body || ""),
      anchorSelector: String(item.anchorSelector || ""),
      displayOrder: Number(item.displayOrder || index + 1),
      activeYn: String(item.activeYn || "Y"),
      placement: String(item.placement || "top"),
      imageUrl: String(item.imageUrl || ""),
      iconName: String(item.iconName || ""),
      highlightStyle: String(item.highlightStyle || "focus"),
      ctaLabel: String(item.ctaLabel || ""),
      ctaUrl: String(item.ctaUrl || "")
    })));
  }

  useEffect(() => {
    load(initialPageId).catch((err: Error) => setError(err.message));
  }, []);

  function updateItem(index: number, key: keyof HelpManagementItem, value: string | number) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  function addItem() {
    setItems((current) => [...current, createEmptyItem(current.length + 1)]);
  }

  function removeItem(index: number) {
    setItems((current) => current
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item, itemIndex) => ({ ...item, displayOrder: itemIndex + 1 })));
  }

  async function handleLoad() {
    setError("");
    setMessage("");
    await load(selectedPageId);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const normalizedItems = items
        .slice()
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((item, index) => ({
          ...item,
          displayOrder: index + 1
        }));
      const response = await saveHelpManagementPage({
        pageId: selectedPageId,
        title,
        summary,
        helpVersion,
        activeYn,
        items: normalizedItems
      });
      setMessage(response.message || "도움말을 저장했습니다.");
      await load(selectedPageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "도움말 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Carbonet Help Management</p>
        <h1>화면 도움말 운영</h1>
        <p className="route-path">페이지별 도움말 title, summary, step, anchor selector와 이미지, 아이콘, 버튼, 강조 스타일을 DB에 저장하고 즉시 overlay에 반영합니다.</p>
      </section>
      {error ? <section className="panel"><p className="error-text">{error}</p></section> : null}
      {message ? <section className="panel"><p className="success-text">{message}</p></section> : null}

      <section className="panel">
        <div className="migration-tabs">
          <button className={`tab-button${tab === "help" ? " active" : ""}`} onClick={() => setTab("help")} type="button">도움말 운영</button>
          <button className={`tab-button${tab === "command" ? " active" : ""}`} onClick={() => setTab("command")} type="button">수정 디렉션</button>
        </div>
      </section>

      {tab === "help" ? (
        <>
      <section className="panel" data-help-id="help-management-select">
        <div className="section-head">
          <div>
            <p className="caption">Target Page</p>
            <h2>{selectedPageId}</h2>
          </div>
          <div className="toolbar-actions">
            <button className="primary-button" disabled={saving} onClick={handleSave} type="button">저장</button>
          </div>
        </div>
        <div className="toolbar">
          <label className="field field-wide">
            <span>pageId</span>
            <select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)}>
              {manifestOptions.map((manifest) => (
                <option key={manifest.pageId} value={manifest.pageId}>
                  {manifest.pageId} ({manifest.routePath})
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" onClick={handleLoad} type="button">불러오기</button>
        </div>
        <div className="meta-grid">
          <div>
            <dt>Source</dt>
            <dd>{payload?.source || "-"}</dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>{PAGE_MANIFESTS[selectedPageId]?.routePath || "-"}</dd>
          </div>
          <div>
            <dt>Menu Code</dt>
            <dd>{PAGE_MANIFESTS[selectedPageId]?.menuCode || "-"}</dd>
          </div>
        </div>
      </section>

      <section className="panel" data-help-id="help-management-page-form">
        <div className="section-head">
          <div>
            <p className="caption">Page Metadata</p>
            <h2>기본 도움말 정보</h2>
          </div>
        </div>
        <div className="create-grid help-editor-grid">
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Help Version</span>
            <input value={helpVersion} onChange={(event) => setHelpVersion(event.target.value)} />
          </label>
          <label className="field">
            <span>Active</span>
            <select value={activeYn} onChange={(event) => setActiveYn(event.target.value)}>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </label>
          <label className="field field-wide">
            <span>Summary</span>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="panel" data-help-id="help-management-items">
        <div className="section-head">
          <div>
            <p className="caption">Help Steps</p>
            <h2>{items.length}개 단계</h2>
          </div>
          <div className="toolbar-actions">
            <button className="secondary-button" onClick={addItem} type="button">단계 추가</button>
          </div>
        </div>
        <div className="help-item-list">
          {items.length === 0 ? <p className="state-text">등록된 단계가 없습니다. 단계 추가로 새 도움말을 시작할 수 있습니다.</p> : null}
          {items.map((item, index) => (
            <article className="help-item-card" key={`${item.itemId}-${index}`}>
              <div className="section-head">
                <div>
                  <p className="caption">Step {index + 1}</p>
                  <h2>{item.title || "새 도움말 단계"}</h2>
                </div>
                <button className="secondary-button" onClick={() => removeItem(index)} type="button">삭제</button>
              </div>
              <div className="create-grid help-editor-grid">
                <label className="field">
                  <span>Item ID</span>
                  <input value={item.itemId} onChange={(event) => updateItem(index, "itemId", event.target.value)} />
                </label>
                <label className="field">
                  <span>Display Order</span>
                  <input
                    type="number"
                    value={item.displayOrder}
                    onChange={(event) => updateItem(index, "displayOrder", Number(event.target.value || index + 1))}
                  />
                </label>
                <label className="field">
                  <span>Active</span>
                  <select value={item.activeYn} onChange={(event) => updateItem(index, "activeYn", event.target.value)}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </label>
                <label className="field field-wide">
                  <span>Title</span>
                  <input value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} />
                </label>
                <label className="field field-wide">
                  <span>Anchor Selector</span>
                  <input value={item.anchorSelector} onChange={(event) => updateItem(index, "anchorSelector", event.target.value)} />
                </label>
                <label className="field">
                  <span>Placement</span>
                  <select value={item.placement} onChange={(event) => updateItem(index, "placement", event.target.value)}>
                    <option value="top">top</option>
                    <option value="right">right</option>
                    <option value="bottom">bottom</option>
                    <option value="left">left</option>
                  </select>
                </label>
                <label className="field">
                  <span>Highlight Style</span>
                  <select value={item.highlightStyle} onChange={(event) => updateItem(index, "highlightStyle", event.target.value)}>
                    <option value="focus">focus</option>
                    <option value="warning">warning</option>
                    <option value="success">success</option>
                    <option value="neutral">neutral</option>
                  </select>
                </label>
                <label className="field">
                  <span>Icon Name</span>
                  <input value={item.iconName} onChange={(event) => updateItem(index, "iconName", event.target.value)} />
                </label>
                <label className="field field-wide">
                  <span>Image URL</span>
                  <input value={item.imageUrl} onChange={(event) => updateItem(index, "imageUrl", event.target.value)} />
                </label>
                <label className="field">
                  <span>CTA Label</span>
                  <input value={item.ctaLabel} onChange={(event) => updateItem(index, "ctaLabel", event.target.value)} />
                </label>
                <label className="field field-wide">
                  <span>CTA URL</span>
                  <input value={item.ctaUrl} onChange={(event) => updateItem(index, "ctaUrl", event.target.value)} />
                </label>
                <label className="field field-wide">
                  <span>Body</span>
                  <textarea value={item.body} onChange={(event) => updateItem(index, "body", event.target.value)} rows={4} />
                </label>
                <div className="help-editor-preview field-wide">
                  <div>
                    <dt>Preview Placement</dt>
                    <dd>{item.placement}</dd>
                  </div>
                  <div>
                    <dt>Preview Tone</dt>
                    <dd>{item.highlightStyle}</dd>
                  </div>
                  <div>
                    <dt>CTA</dt>
                    <dd>{item.ctaLabel ? `${item.ctaLabel} -> ${item.ctaUrl || "-"}` : "-"}</dd>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="caption">Recent Saves</p>
            <h2>{selectedPageId} 저장 이력</h2>
          </div>
          <div className="stat-chip">{auditPage?.totalCount || 0}건</div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>createdAt</th>
                <th>actorId</th>
                <th>entityId</th>
                <th>result</th>
                <th>traceId</th>
              </tr>
            </thead>
            <tbody>
              {(auditPage?.items || []).length === 0 ? (
                <tr><td colSpan={5}>저장 이력이 없습니다.</td></tr>
              ) : (auditPage?.items || []).map((item, index) => (
                <tr key={`${String(item.auditId || "audit")}-${index}`}>
                  <td>{String(item.createdAt || "-")}</td>
                  <td>{String(item.actorId || "-")}</td>
                  <td>{String(item.entityId || "-")}</td>
                  <td>{String(item.resultStatus || "-")}</td>
                  <td>{String(item.traceId || "-")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
        </>
      ) : (
        <ScreenCommandCenterPanel initialPageId={selectedPageId} />
      )}
    </main>
  );
}
