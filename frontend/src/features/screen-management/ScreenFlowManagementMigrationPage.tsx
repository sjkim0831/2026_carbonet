import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import {
  fetchScreenCommandPage,
  type ScreenCommandApi,
  type ScreenCommandEvent,
  type ScreenCommandPagePayload,
  type ScreenCommandSchema,
  type ScreenCommandSurface
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function emptyPagePayload(): ScreenCommandPagePayload {
  return {
    selectedPageId: "",
    pages: [],
    page: {
      pageId: "",
      label: "",
      routePath: "",
      menuCode: "",
      domainCode: "",
      summary: "",
      source: "",
      menuLookupUrl: "",
      surfaces: [],
      events: [],
      apis: [],
      schemas: [],
      commonCodeGroups: [],
      menuPermission: {
        menuCode: "",
        menuLookupUrl: "",
        routePath: "",
        requiredViewFeatureCode: "",
        featureCodes: [],
        featureRows: [],
        relationTables: [],
        resolverNotes: []
      },
      changeTargets: []
    }
  };
}

function summarizeFields(items: Array<{ fieldId: string; type: string }> | undefined) {
  if (!items || items.length === 0) {
    return "-";
  }
  return items.map((item) => `${item.fieldId}:${item.type}`).join(", ");
}

function countRelatedEvents(surface: ScreenCommandSurface, events: ScreenCommandEvent[]) {
  const eventIds = new Set(surface.eventIds || []);
  return events.filter((event) => eventIds.has(event.eventId)).length;
}

function countRelatedApis(surface: ScreenCommandSurface, events: ScreenCommandEvent[]) {
  const apiIds = new Set<string>();
  const eventIds = new Set(surface.eventIds || []);
  events.forEach((event) => {
    if (!eventIds.has(event.eventId)) {
      return;
    }
    (event.apiIds || []).forEach((apiId) => apiIds.add(apiId));
  });
  return apiIds.size;
}

function findSelectedPage(pages: ScreenCommandPagePayload["pages"], selectedPageId: string) {
  return pages.find((page) => page.pageId === selectedPageId) || null;
}

export function ScreenFlowManagementMigrationPage() {
  const en = isEnglish();
  const [pageFilter, setPageFilter] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const catalogState = useAsyncValue<ScreenCommandPagePayload>(() => fetchScreenCommandPage(""), []);
  const filteredPages = useMemo(() => {
    const items = catalogState.value?.pages || [];
    const normalized = pageFilter.trim().toLowerCase();
    if (!normalized) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.label} ${item.pageId} ${item.routePath} ${item.menuCode}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [catalogState.value?.pages, pageFilter]);

  useEffect(() => {
    if (!selectedPageId && filteredPages.length > 0) {
      setSelectedPageId(filteredPages[0].pageId);
      return;
    }
    if (selectedPageId && filteredPages.every((item) => item.pageId !== selectedPageId) && filteredPages.length > 0) {
      setSelectedPageId(filteredPages[0].pageId);
    }
  }, [filteredPages, selectedPageId]);

  const detailState = useAsyncValue<ScreenCommandPagePayload>(
    () => (selectedPageId ? fetchScreenCommandPage(selectedPageId) : Promise.resolve(emptyPagePayload())),
    [selectedPageId]
  );

  const page = detailState.value?.page || emptyPagePayload().page;
  const selectedSummary = findSelectedPage(catalogState.value?.pages || [], selectedPageId);
  const error = catalogState.error || detailState.error;
  const apisById = useMemo(() => {
    const next = new Map<string, ScreenCommandApi>();
    (page.apis || []).forEach((api) => next.set(api.apiId, api));
    return next;
  }, [page.apis]);

  useEffect(() => {
    logGovernanceScope("PAGE", "screen-flow-management", {
      language: en ? "en" : "ko",
      selectedPageId,
      filteredPageCount: filteredPages.length,
      surfaceCount: page.surfaces?.length || 0,
      eventCount: page.events?.length || 0,
      apiCount: page.apis?.length || 0
    });
    logGovernanceScope("COMPONENT", "screen-flow-catalog", {
      filter: pageFilter,
      filteredPageCount: filteredPages.length,
      selectedPageId
    });
  }, [en, filteredPages.length, page.apis?.length, page.events?.length, page.surfaces?.length, pageFilter, selectedPageId]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment" : "환경" },
        { label: en ? "Screen Flow Management" : "화면 흐름 관리" }
      ]}
      title={en ? "Screen Flow Management" : "화면 흐름 관리"}
      subtitle={en ? "Inspect each registered screen by route, component surface, event, API, and schema chain." : "등록된 화면을 route, surface, event, API, schema 체인 기준으로 점검합니다."}
    >
      {error ? (
        <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4" data-help-id="screen-flow-summary">
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Registered Screens" : "등록 화면"}</p>
          <p className="mt-2 text-3xl font-black">{catalogState.value?.pages?.length || 0}</p>
        </section>
        <section className="gov-card" data-help-id="screen-flow-catalog">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Surfaces" : "화면 요소"}</p>
          <p className="mt-2 text-3xl font-black">{page.surfaces?.length || 0}</p>
        </section>
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "Events" : "이벤트"}</p>
          <p className="mt-2 text-3xl font-black">{page.events?.length || 0}</p>
        </section>
        <section className="gov-card">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">{en ? "APIs / Schemas" : "API / 스키마"}</p>
          <p className="mt-2 text-3xl font-black">{`${page.apis?.length || 0} / ${page.schemas?.length || 0}`}</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[22rem_1fr]">
        <section className="gov-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">{en ? "Screen Catalog" : "화면 카탈로그"}</h3>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">
              {filteredPages.length}
            </span>
          </div>
          <input
            className="gov-input mb-4"
            onChange={(event) => setPageFilter(event.target.value)}
            placeholder={en ? "Search by page ID, route, menu code" : "page ID, route, 메뉴 코드 검색"}
            value={pageFilter}
          />
          <div className="max-h-[70vh] space-y-2 overflow-y-auto">
            {filteredPages.map((item) => {
              const active = item.pageId === selectedPageId;
              return (
                <button
                  className={`w-full rounded-[var(--kr-gov-radius)] border px-3 py-3 text-left ${active ? "border-[var(--kr-gov-blue)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white hover:border-[var(--kr-gov-blue)]"}`}
                  key={item.pageId}
                  onClick={() => setSelectedPageId(item.pageId)}
                  type="button"
                >
                  <p className="text-sm font-bold">{item.label || item.pageId}</p>
                  <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{item.pageId}</p>
                  <p className="mt-1 break-all text-xs text-[var(--kr-gov-text-secondary)]">{item.routePath || "-"}</p>
                </button>
              );
            })}
            {filteredPages.length === 0 ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-5 text-center text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "No screens matched the filter." : "검색 조건과 일치하는 화면이 없습니다."}
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="gov-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{page.label || (en ? "Select a screen" : "화면을 선택하세요")}</h3>
                <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{page.summary || (en ? "No summary is registered for this screen." : "이 화면에 등록된 요약 정보가 없습니다.")}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3 text-sm">
                <p><strong>{en ? "Page ID" : "페이지 ID"}</strong>: {page.pageId || "-"}</p>
                <p><strong>{en ? "Menu Code" : "메뉴 코드"}</strong>: {page.menuCode || "-"}</p>
                <p><strong>{en ? "Route" : "경로"}</strong>: {page.routePath || "-"}</p>
                <p><strong>{en ? "Source" : "소스"}</strong>: {page.source || "-"}</p>
              </div>
            </div>
            {selectedSummary?.domainCode ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{selectedSummary.domainCode}</span>
                {page.menuPermission?.requiredViewFeatureCode ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{page.menuPermission.requiredViewFeatureCode}</span>
                ) : null}
                {page.manifestRegistry?.layoutVersion ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--kr-gov-blue)]">{page.manifestRegistry.layoutVersion}</span>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="gov-card" data-help-id="screen-flow-surface-chain">
            <h3 className="mb-4 text-lg font-bold">{en ? "Surface to Event Flow" : "화면 요소 흐름"}</h3>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[860px]">
                <thead>
                  <tr>
                    <th>{en ? "Surface" : "화면 요소"}</th>
                    <th>{en ? "Zone" : "영역"}</th>
                    <th>{en ? "Event Count" : "이벤트 수"}</th>
                    <th>{en ? "API Count" : "API 수"}</th>
                    <th>{en ? "Selector" : "셀렉터"}</th>
                  </tr>
                </thead>
                <tbody>
                  {(page.surfaces || []).length === 0 ? (
                    <tr>
                      <td className="text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        {en ? "No surface metadata is registered." : "등록된 화면 요소 메타데이터가 없습니다."}
                      </td>
                    </tr>
                  ) : (
                    (page.surfaces || []).map((surface) => (
                      <tr key={surface.surfaceId}>
                        <td>
                          <strong>{surface.label || surface.surfaceId}</strong>
                          <div className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{surface.componentId || "-"}</div>
                        </td>
                        <td>{surface.layoutZone || "-"}</td>
                        <td>{countRelatedEvents(surface, page.events || [])}</td>
                        <td>{countRelatedApis(surface, page.events || [])}</td>
                        <td className="break-all text-xs">{surface.selector || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="gov-card" data-help-id="screen-flow-event-chain">
            <h3 className="mb-4 text-lg font-bold">{en ? "Event / API Chain" : "이벤트 / API 체인"}</h3>
            <div className="overflow-x-auto">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>{en ? "Event" : "이벤트"}</th>
                    <th>{en ? "Frontend Function" : "프론트 함수"}</th>
                    <th>{en ? "Parameters" : "파라미터"}</th>
                    <th>{en ? "Results" : "결과값"}</th>
                    <th>{en ? "Linked APIs" : "연결 API"}</th>
                  </tr>
                </thead>
                <tbody>
                  {(page.events || []).length === 0 ? (
                    <tr>
                      <td className="text-center text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                        {en ? "No event chain is registered." : "등록된 이벤트 체인이 없습니다."}
                      </td>
                    </tr>
                  ) : (
                    (page.events || []).map((event) => (
                      <tr key={event.eventId}>
                        <td>
                          <strong>{event.label || event.eventId}</strong>
                          <div className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{event.eventType || "-"}</div>
                        </td>
                        <td>{event.frontendFunction || "-"}</td>
                        <td>{summarizeFields(event.functionInputs)}</td>
                        <td>{summarizeFields(event.functionOutputs)}</td>
                        <td>
                          {(event.apiIds || []).length === 0 ? "-" : (
                            <div className="space-y-1">
                              {(event.apiIds || []).map((apiId) => {
                                const api = apisById.get(apiId);
                                return (
                                  <div key={apiId}>
                                    <strong>{api?.label || apiId}</strong>
                                    <div className="text-xs text-[var(--kr-gov-text-secondary)]">{api ? `${api.method} ${api.endpoint}` : ""}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2" data-help-id="screen-flow-schema-permission">
            <section className="gov-card">
              <h3 className="mb-4 text-lg font-bold">{en ? "Schemas" : "스키마"}</h3>
              <div className="space-y-3">
                {(page.schemas || []).length === 0 ? (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No schema metadata." : "등록된 스키마 메타데이터가 없습니다."}</p>
                ) : (
                  (page.schemas || []).map((schema: ScreenCommandSchema) => (
                    <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4" key={schema.schemaId}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <strong>{schema.label || schema.schemaId}</strong>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{schema.tableName || "-"}</span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">{(schema.columns || []).join(", ") || "-"}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
            <section className="gov-card">
              <h3 className="mb-4 text-lg font-bold">{en ? "Permission / Change Targets" : "권한 / 변경 대상"}</h3>
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 p-4 text-sm">
                <p><strong>{en ? "Required View Feature" : "필수 VIEW 기능"}</strong>: {page.menuPermission?.requiredViewFeatureCode || "-"}</p>
                <p className="mt-2"><strong>{en ? "Feature Codes" : "기능 코드"}</strong>: {(page.menuPermission?.featureCodes || []).join(", ") || "-"}</p>
                <p className="mt-2"><strong>{en ? "Relation Tables" : "권한 연계 테이블"}</strong>: {(page.menuPermission?.relationTables || []).join(", ") || "-"}</p>
              </div>
              <div className="mt-4 space-y-3">
                {(page.changeTargets || []).length === 0 ? (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No registered change targets." : "등록된 변경 대상이 없습니다."}</p>
                ) : (
                  (page.changeTargets || []).map((target) => (
                    <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] p-4" key={target.targetId}>
                      <strong>{target.label || target.targetId}</strong>
                      <p className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">{(target.editableFields || []).join(", ") || "-"}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>
        </div>
      </div>
    </AdminPageShell>
  );
}
