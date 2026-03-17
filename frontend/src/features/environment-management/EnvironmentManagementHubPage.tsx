import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { PAGE_MANIFESTS } from "../../app/screen-registry/pageManifests";
import {
  autoCollectFullStackGovernanceRegistry,
  fetchFullStackGovernanceRegistry,
  fetchFunctionManagementPage,
  fetchMenuManagementPage,
  fetchScreenCommandPage,
  getScreenCommandChainValues,
  type FullStackGovernanceRegistryEntry,
  type FunctionManagementPagePayload,
  type MenuManagementPagePayload,
  type ScreenCommandPagePayload
} from "../../lib/api/client";
import { buildLocalizedPath, getCsrfMeta, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf, submitFormRequest } from "../admin-system/adminSystemShared";
import { toDisplayMenuUrl } from "../menu-management/menuUrlDisplay";

type ManagedMenuRow = {
  code: string;
  label: string;
  labelEn: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
  sortOrdr: number;
  parentCode: string;
};

type FeatureDraft = {
  featureCode: string;
  featureNm: string;
  featureNmEn: string;
  featureDc: string;
  useAt: string;
};

type GovernanceOverview = {
  summary: string;
  pageId: string;
  source: string;
  componentIds: string[];
  eventIds: string[];
  functionIds: string[];
  parameterSpecs: string[];
  resultSpecs: string[];
  apiIds: string[];
  controllerActions: string[];
  serviceMethods: string[];
  mapperQueries: string[];
  schemaIds: string[];
  tableNames: string[];
  columnNames: string[];
  featureCodes: string[];
  commonCodeGroups: string[];
};

type GovernanceChildElement = {
  instanceKey: string;
  componentId: string;
  componentName: string;
  layoutZone: string;
  designReference: string;
  notes: string;
};

type GovernanceSurfaceChain = {
  surfaceId: string;
  label: string;
  selector: string;
  componentId: string;
  layoutZone: string;
  notes: string;
  childElements: GovernanceChildElement[];
  events: Array<{
    eventId: string;
    label: string;
    eventType: string;
    frontendFunction: string;
    triggerSelector: string;
    notes: string;
    functionInputs: Array<{ fieldId: string; type: string; source: string; required: boolean; notes: string }>;
    functionOutputs: Array<{ fieldId: string; type: string; source: string; required: boolean; notes: string }>;
    apis: Array<{
      apiId: string;
      label: string;
      method: string;
      endpoint: string;
      controllerActions: string[];
      serviceMethods: string[];
      mapperQueries: string[];
      requestFields: Array<{ fieldId: string; type: string; source: string; required: boolean; notes: string }>;
      responseFields: Array<{ fieldId: string; type: string; source: string; required: boolean; notes: string }>;
      schemaIds: string[];
      relatedTables: string[];
      schemas: Array<{ schemaId: string; label: string; tableName: string; columns: string[]; notes: string }>;
    }>;
  }>;
};

type GovernanceSurfaceEventTableRow = {
  surfaceLabel: string;
  surfaceId: string;
  childElements: string;
  eventLabel: string;
  eventId: string;
  eventType: string;
  frontendFunction: string;
  parameters: string;
  results: string;
  apiLabels: string;
  controllerActions: string;
  serviceMethods: string;
  mapperQueries: string;
};

const ENVIRONMENT_MANAGEMENT_MENU_CODE = "A0060118";
const KNOWN_GOVERNANCE_PAGE_IDS: Record<string, string> = {
  A0060118: "environment-management"
};

function resolveDefaultSelectedMenuCode(menuType: string, explicitMenuCode: string) {
  if (explicitMenuCode) {
    return explicitMenuCode;
  }
  return menuType === "ADMIN" ? ENVIRONMENT_MANAGEMENT_MENU_CODE : "";
}

function normalizeRows(rows: Array<Record<string, unknown>>): ManagedMenuRow[] {
  return rows
    .map((row) => {
      const code = stringOf(row, "code").toUpperCase();
      return {
        code,
        label: stringOf(row, "codeNm"),
        labelEn: stringOf(row, "codeDc"),
        menuUrl: toDisplayMenuUrl(stringOf(row, "menuUrl")),
        menuIcon: stringOf(row, "menuIcon") || "menu",
        useAt: stringOf(row, "useAt") || "Y",
        sortOrdr: numberOf(row, "sortOrdr"),
        parentCode: code.length === 8 ? code.slice(0, 6) : code.length === 6 ? code.slice(0, 4) : ""
      };
    })
    .filter((row) => row.code.length === 8)
    .sort((left, right) => {
      const orderLeft = left.sortOrdr > 0 ? left.sortOrdr : Number.MAX_SAFE_INTEGER;
      const orderRight = right.sortOrdr > 0 ? right.sortOrdr : Number.MAX_SAFE_INTEGER;
      if (orderLeft !== orderRight) {
        return orderLeft - orderRight;
      }
      return left.code.localeCompare(right.code);
    });
}

function buildSuggestedPageCode(parentCode: string, rows: ManagedMenuRow[]) {
  if (parentCode.length !== 6) {
    return "";
  }
  let maxSuffix = 0;
  rows.forEach((row) => {
    if (!row.code.startsWith(parentCode) || row.code.length !== 8) {
      return;
    }
    const suffix = Number(row.code.slice(6));
    if (Number.isFinite(suffix) && suffix > maxSuffix) {
      maxSuffix = suffix;
    }
  });
  if (maxSuffix >= 99) {
    return "";
  }
  return `${parentCode}${String(maxSuffix + 1).padStart(2, "0")}`;
}

function createEmptyFeatureDraft(): FeatureDraft {
  return {
    featureCode: "",
    featureNm: "",
    featureNmEn: "",
    featureDc: "",
    useAt: "Y"
  };
}

function normalizeLookupPath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const withoutQuery = trimmed.split("?")[0] || "";
  return withoutQuery.startsWith("/en/") ? withoutQuery.slice(3) : withoutQuery;
}

function resolveGovernancePageId(
  selectedMenu: ManagedMenuRow | null,
  pages: ScreenCommandPagePayload["pages"] | undefined
) {
  if (!selectedMenu) {
    return "";
  }
  const menuCode = selectedMenu.code.toUpperCase();
  const knownPageId = KNOWN_GOVERNANCE_PAGE_IDS[menuCode];
  if (knownPageId) {
    return knownPageId;
  }
  const menuPath = normalizeLookupPath(selectedMenu.menuUrl);
  const matchedCatalogPage = (pages || []).find((item) => (
    String(item.menuCode || "").toUpperCase() === menuCode
      || normalizeLookupPath(String(item.routePath || "")) === menuPath
  ));
  if (matchedCatalogPage?.pageId) {
    return String(matchedCatalogPage.pageId);
  }
  const matchedManifest = Object.values(PAGE_MANIFESTS).find((manifest) => (
    String(manifest.menuCode || "").toUpperCase() === menuCode
      || normalizeLookupPath(String(manifest.routePath || "")) === menuPath
  ));
  return matchedManifest?.pageId || "";
}

function buildGovernanceOverview(
  entry: FullStackGovernanceRegistryEntry | null,
  page: ScreenCommandPagePayload["page"] | null
): GovernanceOverview {
  return {
    summary: entry?.summary || page?.summary || "",
    pageId: entry?.pageId || page?.pageId || "",
    source: entry?.source || page?.source || "",
    componentIds: entry?.componentIds || Array.from(new Set([
      ...((page?.surfaces || []).map((item) => item.componentId).filter(Boolean)),
      ...((page?.manifestRegistry?.components || []).map((item) => String(item.componentId || "")).filter(Boolean))
    ])),
    eventIds: entry?.eventIds || (page?.events || []).map((item) => item.eventId).filter(Boolean),
    functionIds: entry?.functionIds || Array.from(new Set((page?.events || []).map((item) => item.frontendFunction).filter(Boolean))),
    parameterSpecs: entry?.parameterSpecs || (page?.events || []).flatMap((item) => (
      item.functionInputs || []
    ).map((field) => `${field.fieldId}:${field.type}:${field.source || "input"}`)),
    resultSpecs: entry?.resultSpecs || (page?.events || []).flatMap((item) => (
      item.functionOutputs || []
    ).map((field) => `${field.fieldId}:${field.type}:${field.source || "output"}`)),
    apiIds: entry?.apiIds || (page?.apis || []).map((item) => item.apiId).filter(Boolean),
    controllerActions: entry?.controllerActions || Array.from(new Set((page?.apis || []).flatMap((item) => (
      getScreenCommandChainValues(item.controllerActions, item.controllerAction)
    )))),
    serviceMethods: entry?.serviceMethods || Array.from(new Set((page?.apis || []).flatMap((item) => (
      getScreenCommandChainValues(item.serviceMethods, item.serviceMethod)
    )))),
    mapperQueries: entry?.mapperQueries || Array.from(new Set((page?.apis || []).flatMap((item) => (
      getScreenCommandChainValues(item.mapperQueries, item.mapperQuery)
    )))),
    schemaIds: entry?.schemaIds || (page?.schemas || []).map((item) => item.schemaId).filter(Boolean),
    tableNames: entry?.tableNames || Array.from(new Set([
      ...(page?.schemas || []).map((item) => item.tableName).filter(Boolean),
      ...(page?.apis || []).flatMap((item) => item.relatedTables || []),
      ...(page?.menuPermission?.relationTables || [])
    ])),
    columnNames: entry?.columnNames || Array.from(new Set((page?.schemas || []).flatMap((item) => item.columns || []))),
    featureCodes: entry?.featureCodes || Array.from(new Set([
      ...(page?.menuPermission?.featureCodes || []),
      ...((page?.menuPermission?.featureRows || []).map((item) => item.featureCode))
    ])),
    commonCodeGroups: entry?.commonCodeGroups || (page?.commonCodeGroups || []).map((item) => item.codeGroupId).filter(Boolean)
  };
}

function isDraftOnlyGovernancePage(
  entry: FullStackGovernanceRegistryEntry | null,
  page: ScreenCommandPagePayload["page"] | null
) {
  if (entry && String(entry.source || "").trim()) {
    return false;
  }
  return String(page?.source || "").trim() === "UI_PAGE_MANIFEST draft registry";
}

function renderMetaList(items: string[], emptyLabel: string) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--kr-gov-text-secondary)]">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-mono text-[var(--kr-gov-text-primary)]">
          {item}
        </span>
      ))}
    </div>
  );
}

function buildSurfaceChains(page: ScreenCommandPagePayload["page"] | null): GovernanceSurfaceChain[] {
  if (!page) {
    return [];
  }
  const events = page.events || [];
  const apis = page.apis || [];
  const schemas = page.schemas || [];
  const manifestComponents = ((page.manifestRegistry?.components || []) as Array<Record<string, unknown>>);
  return (page.surfaces || []).map((surface) => {
    const surfaceEvents = events.filter((event) => (surface.eventIds || []).includes(event.eventId));
    const childElements = manifestComponents
      .filter((component) => {
        const instanceKey = stringOf(component, "instanceKey");
        const componentId = stringOf(component, "componentId");
        const layoutZone = stringOf(component, "layoutZone");
        return instanceKey === surface.surfaceId
          || componentId === surface.componentId
          || (!surface.componentId && layoutZone === surface.layoutZone)
          || (layoutZone === surface.layoutZone && instanceKey.startsWith(surface.surfaceId));
      })
      .map((component) => ({
        instanceKey: stringOf(component, "instanceKey"),
        componentId: stringOf(component, "componentId"),
        componentName: stringOf(component, "componentName"),
        layoutZone: stringOf(component, "layoutZone"),
        designReference: stringOf(component, "designReference"),
        notes: stringOf(component, "conditionalRuleSummary")
      }));
    return {
      surfaceId: surface.surfaceId,
      label: surface.label,
      selector: surface.selector,
      componentId: surface.componentId,
      layoutZone: surface.layoutZone,
      notes: surface.notes,
      childElements: childElements.filter((item, index, list) => (
        list.findIndex((candidate) => `${candidate.instanceKey}-${candidate.componentId}` === `${item.instanceKey}-${item.componentId}`) === index
      )),
      events: surfaceEvents.map((event) => {
        const connectedApis = (event.apiIds || []).map((apiId) => apis.find((candidate) => candidate.apiId === apiId)).filter(Boolean);
        return {
          eventId: event.eventId,
          label: event.label,
          eventType: event.eventType,
          frontendFunction: event.frontendFunction,
          triggerSelector: event.triggerSelector,
          notes: event.notes,
          functionInputs: event.functionInputs || [],
          functionOutputs: event.functionOutputs || [],
          apis: connectedApis.map((api) => ({
            apiId: api!.apiId,
            label: api!.label,
            method: api!.method,
            endpoint: api!.endpoint,
            controllerActions: getScreenCommandChainValues(api!.controllerActions, api!.controllerAction),
            serviceMethods: getScreenCommandChainValues(api!.serviceMethods, api!.serviceMethod),
            mapperQueries: getScreenCommandChainValues(api!.mapperQueries, api!.mapperQuery),
            requestFields: api!.requestFields || [],
            responseFields: api!.responseFields || [],
            schemaIds: api!.schemaIds || [],
            relatedTables: api!.relatedTables || [],
            schemas: (api!.schemaIds || []).map((schemaId) => schemas.find((schema) => schema.schemaId === schemaId)).filter(Boolean).map((schema) => ({
              schemaId: schema!.schemaId,
              label: schema!.label,
              tableName: schema!.tableName,
              columns: schema!.columns || [],
              notes: schema!.notes
            }))
          }))
        };
      })
    };
  });
}

function buildSurfaceEventTableRows(chains: GovernanceSurfaceChain[]): GovernanceSurfaceEventTableRow[] {
  return chains.flatMap((surface) => {
    if (surface.events.length === 0) {
      return [{
        surfaceLabel: surface.label,
        surfaceId: surface.surfaceId,
        childElements: surface.childElements.map((item) => item.componentName || item.instanceKey || item.componentId).filter(Boolean).join(", "),
        eventLabel: "-",
        eventId: "-",
        eventType: "-",
        frontendFunction: "-",
        parameters: "-",
        results: "-",
        apiLabels: "-",
        controllerActions: "-",
        serviceMethods: "-",
        mapperQueries: "-"
      }];
    }
    return surface.events.map((event) => ({
      surfaceLabel: surface.label,
      surfaceId: surface.surfaceId,
      childElements: surface.childElements.map((item) => item.componentName || item.instanceKey || item.componentId).filter(Boolean).join(", "),
      eventLabel: event.label,
      eventId: event.eventId,
      eventType: event.eventType,
      frontendFunction: event.frontendFunction,
      parameters: event.functionInputs.map((field) => `${field.fieldId}:${field.type}`).join(", ") || "-",
      results: event.functionOutputs.map((field) => `${field.fieldId}:${field.type}`).join(", ") || "-",
      apiLabels: event.apis.map((api) => `${api.apiId} (${api.method} ${api.endpoint})`).join(", ") || "-",
      controllerActions: event.apis.flatMap((api) => api.controllerActions).join(", ") || "-",
      serviceMethods: event.apis.flatMap((api) => api.serviceMethods).join(", ") || "-",
      mapperQueries: event.apis.flatMap((api) => api.mapperQueries).join(", ") || "-"
    }));
  });
}

export function EnvironmentManagementHubPage() {
  const en = isEnglish();
  const searchParams = new URLSearchParams(window.location.search);
  const initialMenuType = searchParams.get("menuType") || "ADMIN";
  const [menuType, setMenuType] = useState(initialMenuType);
  const [menuSearch, setMenuSearch] = useState(searchParams.get("keyword") || "");
  const [selectedMenuCode, setSelectedMenuCode] = useState(
    resolveDefaultSelectedMenuCode(initialMenuType, searchParams.get("menuCode") || "")
  );
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [parentCodeValue, setParentCodeValue] = useState("");
  const [codeNm, setCodeNm] = useState("");
  const [codeDc, setCodeDc] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuIcon, setMenuIcon] = useState("web");
  const [useAt, setUseAt] = useState("Y");
  const [featureDraft, setFeatureDraft] = useState<FeatureDraft>(createEmptyFeatureDraft);
  const [governanceMessage, setGovernanceMessage] = useState("");
  const [governanceError, setGovernanceError] = useState("");
  const [screenCatalog, setScreenCatalog] = useState<ScreenCommandPagePayload | null>(null);
  const [governancePage, setGovernancePage] = useState<ScreenCommandPagePayload | null>(null);
  const [registryEntry, setRegistryEntry] = useState<FullStackGovernanceRegistryEntry | null>(null);
  const [governanceLoading, setGovernanceLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const menuPageState = useAsyncValue<MenuManagementPagePayload>(() => fetchMenuManagementPage(menuType), [menuType]);
  const menuPage = menuPageState.value;

  const featurePageState = useAsyncValue<FunctionManagementPagePayload>(
    () => fetchFunctionManagementPage({ menuType, searchMenuCode: selectedMenuCode }),
    [menuType, selectedMenuCode]
  );
  const featurePage = featurePageState.value;

  const menuRows = useMemo(
    () => normalizeRows(((menuPage?.menuRows || []) as Array<Record<string, unknown>>)),
    [menuPage?.menuRows]
  );
  const groupMenuOptions = ((menuPage?.groupMenuOptions || []) as Array<Record<string, string>>);
  const iconOptions = ((menuPage?.iconOptions || []) as string[]);
  const useAtOptions = ((menuPage?.useAtOptions || []) as string[]);
  const featureRows = ((featurePage?.featureRows || []) as Array<Record<string, unknown>>);

  const filteredMenus = useMemo(() => {
    const keyword = menuSearch.trim().toLowerCase();
    if (!keyword) {
      return menuRows;
    }
    return menuRows.filter((row) => (
      row.code.toLowerCase().includes(keyword)
      || row.label.toLowerCase().includes(keyword)
      || row.labelEn.toLowerCase().includes(keyword)
      || row.menuUrl.toLowerCase().includes(keyword)
    ));
  }, [menuRows, menuSearch]);

  const selectedMenu = useMemo(
    () => menuRows.find((row) => row.code === selectedMenuCode) || null,
    [menuRows, selectedMenuCode]
  );
  const selectedMenuIsPage = selectedMenu?.code.length === 8;
  const governancePageId = useMemo(() => {
    return resolveGovernancePageId(selectedMenu, screenCatalog?.pages);
  }, [screenCatalog?.pages, selectedMenu]);
  const governanceOverview = useMemo(
    () => buildGovernanceOverview(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const governanceDraftOnly = useMemo(
    () => isDraftOnlyGovernancePage(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const governanceSurfaceChains = useMemo(
    () => buildSurfaceChains(governancePage?.page || null),
    [governancePage?.page]
  );
  const governanceSurfaceEventRows = useMemo(
    () => buildSurfaceEventTableRows(governanceSurfaceChains),
    [governanceSurfaceChains]
  );

  useEffect(() => {
    if (!parentCodeValue && groupMenuOptions.length > 0) {
      setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
    }
  }, [groupMenuOptions, parentCodeValue]);

  useEffect(() => {
    setActionError("");
    setActionMessage("");
    setMenuSearch("");
    setSelectedMenuCode(menuType === "ADMIN" ? ENVIRONMENT_MANAGEMENT_MENU_CODE : "");
    setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
    setMenuIcon(iconOptions[0] || "web");
    setUseAt(useAtOptions[0] || "Y");
    setFeatureDraft(createEmptyFeatureDraft());
    setGovernanceMessage("");
    setGovernanceError("");
    setGovernancePage(null);
    setRegistryEntry(null);
  }, [menuType]);

  useEffect(() => {
    if (!selectedMenuCode && menuRows.length > 0) {
      setSelectedMenuCode(menuRows[0].code);
    }
  }, [menuRows, selectedMenuCode]);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const payload = await fetchScreenCommandPage("");
        if (!cancelled) {
          setScreenCatalog(payload);
        }
      } catch (error) {
        if (!cancelled) {
          setScreenCatalog(null);
          setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to load screen registry." : "화면 registry를 불러오지 못했습니다."));
        }
      }
    }
    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [en, menuType]);

  useEffect(() => {
    let cancelled = false;
    async function loadGovernanceData() {
      setGovernanceMessage("");
      setGovernanceError("");
      if (!selectedMenu || !selectedMenuIsPage) {
        setGovernancePage(null);
        setRegistryEntry(null);
        return;
      }
      setGovernanceLoading(true);
      try {
        const [pagePayload, registryPayload] = await Promise.all([
          governancePageId ? fetchScreenCommandPage(governancePageId) : Promise.resolve(null),
          fetchFullStackGovernanceRegistry(selectedMenu.code).catch(() => null)
        ]);
        if (!cancelled) {
          setGovernancePage(pagePayload);
          setRegistryEntry(registryPayload);
          if (!governancePageId) {
            setGovernanceError(en ? "This menu is not linked to the screen-command registry yet." : "이 메뉴는 아직 screen-command registry와 연결되지 않았습니다.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setGovernancePage(null);
          setRegistryEntry(null);
          setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to load menu metadata." : "메뉴 메타데이터를 불러오지 못했습니다."));
        }
      } finally {
        if (!cancelled) {
          setGovernanceLoading(false);
        }
      }
    }
    void loadGovernanceData();
    return () => {
      cancelled = true;
    };
  }, [en, governancePageId, selectedMenu, selectedMenuIsPage]);

  async function createPageMenu() {
    setActionError("");
    setActionMessage("");
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("parentCode", parentCodeValue);
    body.set("codeNm", codeNm);
    body.set("codeDc", codeDc);
    body.set("menuUrl", menuUrl);
    body.set("menuIcon", menuIcon);
    body.set("useAt", useAt);
    const { token, headerName } = getCsrfMeta();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    if (token) {
      headers[headerName] = token;
    }
    const response = await fetch(buildLocalizedPath("/admin/system/menu-management/create-page", "/en/admin/system/menu-management/create-page"), {
      method: "POST",
      credentials: "include",
      headers,
      body: body.toString()
    });
    const responseBody = await response.json() as { success?: boolean; message?: string; createdCode?: string };
    if (!response.ok || !responseBody.success) {
      throw new Error(responseBody.message || `Failed to create page menu: ${response.status}`);
    }
    await menuPageState.reload();
    await featurePageState.reload();
    if (responseBody.createdCode) {
      setSelectedMenuCode(String(responseBody.createdCode));
    }
    setActionMessage(responseBody.message || (en ? "The page menu has been created." : "페이지 메뉴를 생성했습니다."));
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
  }

  async function handleFeatureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setActionMessage("");
    try {
      await submitFormRequest(event.currentTarget);
      setFeatureDraft(createEmptyFeatureDraft());
      await featurePageState.reload();
      setActionMessage(en ? "Feature has been added." : "기능을 추가했습니다.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to add feature." : "기능 추가에 실패했습니다."));
    }
  }

  async function handleFeatureDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setActionMessage("");
    try {
      await submitFormRequest(event.currentTarget);
      await featurePageState.reload();
      setActionMessage(en ? "Feature has been deleted." : "기능을 삭제했습니다.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to delete feature." : "기능 삭제에 실패했습니다."));
    }
  }

  async function handleAutoCollect() {
    if (!selectedMenu || !selectedMenuIsPage) {
      setGovernanceError(en ? "Select an 8-digit page menu first." : "먼저 8자리 페이지 메뉴를 선택하세요.");
      return;
    }
    if (!governancePageId) {
      setGovernanceError(en ? "The selected menu is not linked to a collectable page." : "선택한 메뉴가 수집 가능한 페이지와 아직 연결되지 않았습니다.");
      return;
    }
    setCollecting(true);
    setGovernanceError("");
    setGovernanceMessage("");
    try {
      const response = await autoCollectFullStackGovernanceRegistry({
        menuCode: selectedMenu.code,
        pageId: governancePageId,
        menuUrl: selectedMenu.menuUrl,
        mergeExisting: true,
        save: true
      });
      setRegistryEntry(response.entry);
      setGovernanceMessage(response.message || (en ? "Metadata collected and saved." : "메타데이터를 자동 수집하고 저장했습니다."));
    } catch (error) {
      setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to collect metadata." : "메타데이터 수집에 실패했습니다."));
    } finally {
      setCollecting(false);
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment" : "환경" },
        { label: en ? "Menu Unified Management" : "메뉴 통합 관리" }
      ]}
      title={en ? "Menu Unified Management" : "메뉴 통합 관리"}
      subtitle={en
        ? "Search menus, register new pages with URL and group assignment, and continue feature editing from the same screen."
        : "메뉴를 검색해 수정하고, 그룹/공통코드와 URL을 지정해 페이지 메뉴를 등록한 뒤 같은 화면에서 기능 추가와 편집까지 이어서 처리합니다."}
    >
      {actionMessage ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </section>
      ) : null}
      {menuPageState.error || featurePageState.error || actionError ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError || menuPageState.error || featurePageState.error}
        </section>
      ) : null}

      <section className="gov-card mb-6" data-help-id="environment-management-summary">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
              {en ? "Unified Workspace" : "통합 작업공간"}
            </p>
            <h3 className="mt-2 text-2xl font-black text-[var(--kr-gov-text-primary)]">
              {en ? "Create menus simply, then keep editing on the same screen" : "메뉴를 단순하게 추가하고 같은 화면에서 계속 편집"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
              {en
                ? "Register the target menu under a group code, assign the runtime URL, let the default VIEW permission be created automatically, and then add page-specific feature codes without switching to multiple screens."
                : "그룹 메뉴 아래에 대상 메뉴를 등록하고 URL을 할당하면 기본 VIEW 권한이 함께 생성됩니다. 이후 선택 메뉴 기준으로 기능 코드를 바로 추가해 여러 화면을 오가지 않도록 구성했습니다."}
            </p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
              {en ? "Auto Provision" : "자동 생성 항목"}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--kr-gov-text-secondary)]">
              <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">{en ? "8-digit page menu code under selected group" : "선택한 그룹 하위의 8자리 페이지 메뉴 코드"}</li>
              <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">{en ? "Menu URL and icon metadata" : "메뉴 URL과 아이콘 메타데이터"}</li>
              <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">{en ? "Default PAGE_CODE_VIEW feature" : "기본 PAGE_CODE_VIEW 기능"}</li>
              <li className="rounded-lg border border-slate-200 bg-white px-3 py-2">{en ? "Initial sort order under the same parent" : "같은 부모 메뉴 기준 초기 정렬 순서"}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">add_circle</span>
              <h3 className="text-lg font-bold">{en ? "Register New Menu" : "신규 메뉴 등록"}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="gov-label" htmlFor="parentCode">{en ? "Group / Common Code" : "그룹 / 공통코드"}</label>
                <select className="gov-select" id="parentCode" value={parentCodeValue} onChange={(event) => setParentCodeValue(event.target.value)}>
                  {groupMenuOptions.map((option) => (
                    <option key={stringOf(option, "value")} value={stringOf(option, "value")}>{stringOf(option, "label")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="gov-label" htmlFor="nextCode">{en ? "Generated Page Code" : "생성 예정 페이지 코드"}</label>
                <input className="gov-input bg-gray-50" id="nextCode" readOnly value={buildSuggestedPageCode(parentCodeValue, menuRows)} />
              </div>
              <div>
                <label className="gov-label" htmlFor="codeNm">{en ? "Menu Name" : "메뉴명"}</label>
                <input className="gov-input" id="codeNm" value={codeNm} onChange={(event) => setCodeNm(event.target.value)} />
              </div>
              <div>
                <label className="gov-label" htmlFor="codeDc">{en ? "Menu Name (EN)" : "영문 메뉴명"}</label>
                <input className="gov-input" id="codeDc" value={codeDc} onChange={(event) => setCodeDc(event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="gov-label" htmlFor="menuUrl">{en ? "Runtime URL" : "연결 URL"}</label>
                <input className="gov-input" id="menuUrl" placeholder={menuType === "USER" ? "/home/..." : "/admin/system/..."} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} />
              </div>
              <div>
                <label className="gov-label" htmlFor="menuIcon">{en ? "Icon" : "아이콘"}</label>
                <select className="gov-select" id="menuIcon" value={menuIcon} onChange={(event) => setMenuIcon(event.target.value)}>
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="gov-label" htmlFor="newMenuUseAt">{en ? "Use" : "사용 여부"}</label>
                <select className="gov-select" id="newMenuUseAt" value={useAt} onChange={(event) => setUseAt(event.target.value)}>
                  {useAtOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="gov-btn gov-btn-primary" onClick={() => { void createPageMenu().catch((error: Error) => setActionError(error.message)); }} type="button">
                {en ? "Create Menu + Default Permission" : "메뉴 등록 + 기본 권한 생성"}
              </button>
            </div>
          </section>

          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">search</span>
              <h3 className="text-lg font-bold">{en ? "Search Menu" : "메뉴 검색"}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
              <div>
                <label className="gov-label" htmlFor="environmentMenuType">{en ? "Scope" : "화면 구분"}</label>
                <select className="gov-select" id="environmentMenuType" value={menuType} onChange={(event) => setMenuType(event.target.value)}>
                  {((menuPage?.menuTypes || []) as Array<Record<string, unknown>>).map((type) => (
                    <option key={stringOf(type, "value")} value={stringOf(type, "value")}>{stringOf(type, "label")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="gov-label" htmlFor="environmentMenuSearch">{en ? "Menu Search" : "메뉴 검색어"}</label>
                <input
                  className="gov-input"
                  id="environmentMenuSearch"
                  placeholder={en ? "Menu code, page name, or URL" : "메뉴 코드, 페이지명, URL"}
                  value={menuSearch}
                  onChange={(event) => setMenuSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Menu" : "메뉴"}</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3 text-center">{en ? "Default Permission" : "기본 권한"}</th>
                    <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                    <th className="px-4 py-3 text-center">{en ? "Select" : "선택"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMenus.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                        {en ? "No menus matched the search." : "검색 조건에 맞는 메뉴가 없습니다."}
                      </td>
                    </tr>
                  ) : filteredMenus.map((row) => {
                    const selected = row.code === selectedMenuCode;
                    return (
                      <tr key={row.code} className={selected ? "bg-[rgba(28,100,242,0.04)]" : ""}>
                        <td className="px-4 py-3">
                          <p className="font-bold">{row.label}</p>
                          <p className="text-xs text-[var(--kr-gov-text-secondary)]">{row.code} / {row.parentCode}</p>
                        </td>
                        <td className="px-4 py-3 break-all text-[var(--kr-gov-text-secondary)]">{row.menuUrl}</td>
                        <td className="px-4 py-3 text-center font-mono text-[13px]">{row.code}_VIEW</td>
                        <td className="px-4 py-3 text-center">{row.useAt}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className={selected ? "gov-btn gov-btn-primary" : "gov-btn gov-btn-outline-blue"}
                            onClick={() => setSelectedMenuCode(row.code)}
                            type="button"
                          >
                            {selected ? (en ? "Selected" : "선택됨") : (en ? "Select" : "선택")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">tune</span>
              <h3 className="text-lg font-bold">{en ? "Selected Menu" : "선택 메뉴"}</h3>
            </div>
            {selectedMenu ? (
              <div className="space-y-3">
                <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Menu</p>
                  <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{selectedMenu.label}</p>
                  <p className="mt-1 font-mono text-[13px] text-[var(--kr-gov-text-secondary)]">{selectedMenu.code}</p>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Group Code" : "그룹 코드"}</dt>
                    <dd className="font-mono text-[13px] text-[var(--kr-gov-text-primary)]">{selectedMenu.parentCode}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-bold text-[var(--kr-gov-text-secondary)]">URL</dt>
                    <dd className="font-mono text-[13px] text-right text-[var(--kr-gov-text-primary)]">{selectedMenu.menuUrl}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Default Permission" : "기본 권한"}</dt>
                    <dd className="font-mono text-[13px] text-[var(--kr-gov-text-primary)]">{selectedMenu.code}_VIEW</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a menu to continue." : "작업할 메뉴를 먼저 선택하세요."}</p>
            )}
          </section>

          <section className="gov-card">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">extension</span>
              <h3 className="text-lg font-bold">{en ? "Feature Add / Edit" : "기능 추가 / 편집"}</h3>
            </div>
            {selectedMenu ? (
              <>
                <form action={buildLocalizedPath("/admin/system/feature-management/create", "/en/admin/system/feature-management/create")} className="grid gap-4" method="post" onSubmit={handleFeatureSubmit}>
                  <input name="menuType" type="hidden" value={menuType} />
                  <input name="menuCode" type="hidden" value={selectedMenu.code} />
                  <div>
                    <label className="gov-label" htmlFor="featureCode">{en ? "Feature Code" : "기능 코드"}</label>
                    <input className="gov-input" id="featureCode" name="featureCode" placeholder={`${selectedMenu.code}_CREATE`} value={featureDraft.featureCode} onChange={(event) => setFeatureDraft((current) => ({ ...current, featureCode: event.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="featureNm">{en ? "Feature Name" : "기능명"}</label>
                    <input className="gov-input" id="featureNm" name="featureNm" value={featureDraft.featureNm} onChange={(event) => setFeatureDraft((current) => ({ ...current, featureNm: event.target.value }))} />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="featureNmEn">{en ? "Feature Name (EN)" : "영문 기능명"}</label>
                    <input className="gov-input" id="featureNmEn" name="featureNmEn" value={featureDraft.featureNmEn} onChange={(event) => setFeatureDraft((current) => ({ ...current, featureNmEn: event.target.value }))} />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="featureDc">{en ? "Description" : "설명"}</label>
                    <input className="gov-input" id="featureDc" name="featureDc" value={featureDraft.featureDc} onChange={(event) => setFeatureDraft((current) => ({ ...current, featureDc: event.target.value }))} />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="featureUseAt">{en ? "Use" : "사용 여부"}</label>
                    <select className="gov-select" id="featureUseAt" name="useAt" value={featureDraft.useAt} onChange={(event) => setFeatureDraft((current) => ({ ...current, useAt: event.target.value }))}>
                      {((featurePage?.useAtOptions || ["Y", "N"]) as string[]).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button className="gov-btn gov-btn-primary" type="submit">{en ? "Add Feature" : "기능 추가"}</button>
                  </div>
                </form>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="gov-table-header">
                        <th className="px-4 py-3">{en ? "Feature Code" : "기능 코드"}</th>
                        <th className="px-4 py-3">{en ? "Feature Name" : "기능명"}</th>
                        <th className="px-4 py-3">{en ? "Description" : "설명"}</th>
                        <th className="px-4 py-3 text-center">{en ? "Authority" : "권한 연계"}</th>
                        <th className="px-4 py-3 text-center">{en ? "Delete" : "삭제"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {featureRows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                            {en ? "No additional features have been registered yet." : "추가 등록된 기능이 아직 없습니다."}
                          </td>
                        </tr>
                      ) : featureRows.map((row) => {
                        const featureCode = stringOf(row, "featureCode");
                        const unassigned = Boolean(row.unassignedToRole);
                        return (
                          <tr key={featureCode}>
                            <td className="px-4 py-3 font-bold whitespace-nowrap">{featureCode}</td>
                            <td className="px-4 py-3">{stringOf(row, "featureNm")}</td>
                            <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "featureDc")}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${unassigned ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                {unassigned ? (en ? "Unassigned" : "미할당") : (en ? "Linked" : "연결됨")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <form action={buildLocalizedPath("/admin/system/feature-management/delete", "/en/admin/system/feature-management/delete")} method="post" onSubmit={handleFeatureDelete}>
                                <input name="featureCode" type="hidden" value={featureCode} />
                                <input name="menuType" type="hidden" value={menuType} />
                                <input name="searchMenuCode" type="hidden" value={selectedMenu.code} />
                                <input name="searchKeyword" type="hidden" value="" />
                                <button className="gov-btn gov-btn-danger" type="submit">{en ? "Delete" : "삭제"}</button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "After selecting a menu, you can add and delete page-specific feature codes here." : "메뉴를 선택하면 여기서 페이지 전용 기능 코드를 추가하고 삭제할 수 있습니다."}</p>
            )}
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-3 border-b pb-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">dataset</span>
                <h3 className="text-lg font-bold">{en ? "Collected Metadata" : "수집 메타데이터"}</h3>
              </div>
              <button
                className="gov-btn gov-btn-primary"
                disabled={!selectedMenuIsPage || collecting || governanceLoading}
                onClick={() => { void handleAutoCollect(); }}
                type="button"
              >
                {collecting ? (en ? "Collecting..." : "수집 중...") : (en ? "Auto Collect" : "자동 수집")}
              </button>
            </div>

            {governanceMessage ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {governanceMessage}
              </div>
            ) : null}
            {governanceError ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {governanceError}
              </div>
            ) : null}

            {!selectedMenu ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a menu to inspect connected page metadata." : "연결된 페이지 메타데이터를 보려면 메뉴를 먼저 선택하세요."}</p>
            ) : !selectedMenuIsPage ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Only 8-digit page menus can display collected metadata." : "수집 메타데이터는 8자리 페이지 메뉴에서만 표시됩니다."}</p>
            ) : governanceDraftOnly ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Page ID</p>
                    <p className="mt-2 font-mono text-sm text-[var(--kr-gov-text-primary)]">{governanceOverview.pageId || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Source</p>
                    <p className="mt-2 font-mono text-sm text-[var(--kr-gov-text-primary)]">{governanceOverview.source || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">URL</p>
                    <p className="mt-2 font-mono text-sm break-all text-[var(--kr-gov-text-primary)]">{selectedMenu.menuUrl || "-"}</p>
                  </div>
                </div>

                <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  {en
                    ? "This menu is connected through a draft registry entry only. Detailed components, events, APIs, and schema metadata will appear after the page implementation or an explicit registry save."
                    : "이 메뉴는 현재 draft registry로만 연결된 상태입니다. 상세 컴포넌트, 이벤트, API, 스키마 메타데이터는 실제 페이지 구현 또는 명시적 registry 저장 이후에 표시됩니다."}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Page ID</p>
                    <p className="mt-2 font-mono text-sm text-[var(--kr-gov-text-primary)]">{governanceOverview.pageId || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Source</p>
                    <p className="mt-2 font-mono text-sm text-[var(--kr-gov-text-primary)]">{governanceOverview.source || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">URL</p>
                    <p className="mt-2 font-mono text-sm break-all text-[var(--kr-gov-text-primary)]">{selectedMenu.menuUrl || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="gov-label mb-2">{en ? "Summary" : "요약"}</p>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-[var(--kr-gov-text-primary)]">
                    {governanceOverview.summary || (en ? "No summary collected yet." : "아직 수집된 요약이 없습니다.")}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="gov-label mb-2">{en ? "Screen Elements / Components" : "화면 요소 / 컴포넌트"}</p>
                    {renderMetaList(governanceOverview.componentIds, en ? "No components collected yet." : "수집된 컴포넌트가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Events" : "이벤트"}</p>
                    {renderMetaList(governanceOverview.eventIds, en ? "No events collected yet." : "수집된 이벤트가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Functions" : "함수"}</p>
                    {renderMetaList(governanceOverview.functionIds, en ? "No functions collected yet." : "수집된 함수가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Feature Codes" : "기능 코드"}</p>
                    {renderMetaList(governanceOverview.featureCodes, en ? "No feature codes collected yet." : "수집된 기능 코드가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Parameters" : "파라미터"}</p>
                    {renderMetaList(governanceOverview.parameterSpecs, en ? "No parameters collected yet." : "수집된 파라미터가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Results" : "출력값"}</p>
                    {renderMetaList(governanceOverview.resultSpecs, en ? "No results collected yet." : "수집된 출력값이 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">API</p>
                    {renderMetaList(governanceOverview.apiIds, en ? "No APIs collected yet." : "수집된 API가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">Controller</p>
                    {renderMetaList(governanceOverview.controllerActions, en ? "No controller actions collected yet." : "수집된 Controller 액션이 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">Service</p>
                    {renderMetaList(governanceOverview.serviceMethods, en ? "No service methods collected yet." : "수집된 Service 메서드가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">Mapper</p>
                    {renderMetaList(governanceOverview.mapperQueries, en ? "No mapper queries collected yet." : "수집된 Mapper 쿼리가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Schemas" : "스키마"}</p>
                    {renderMetaList(governanceOverview.schemaIds, en ? "No schemas collected yet." : "수집된 스키마가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "Common Codes" : "공통코드"}</p>
                    {renderMetaList(governanceOverview.commonCodeGroups, en ? "No common code groups collected yet." : "수집된 공통코드가 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "DB Tables" : "DB 테이블"}</p>
                    {renderMetaList(governanceOverview.tableNames, en ? "No tables collected yet." : "수집된 테이블이 없습니다.")}
                  </div>
                  <div>
                    <p className="gov-label mb-2">{en ? "DB Columns" : "DB 컬럼"}</p>
                    {renderMetaList(governanceOverview.columnNames, en ? "No columns collected yet." : "수집된 컬럼이 없습니다.")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="gov-label mb-2">{en ? "Surface-Centric Detail" : "화면 요소 기준 상세 체인"}</p>
                    <p className="text-sm text-[var(--kr-gov-text-secondary)]">
                      {en
                        ? "Each screen element shows child elements, events, functions, API/backend chains, schemas, DB resources, and related codes in one flow."
                        : "각 화면 요소별로 작은 요소, 이벤트, 함수, API/백엔드 체인, 스키마, DB 자원, 코드 연결을 한 흐름으로 확인합니다."}
                    </p>
                  </div>
                  {governanceSurfaceChains.length === 0 ? (
                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                      {en ? "No screen elements collected yet." : "수집된 화면 요소가 없습니다."}
                    </div>
                  ) : governanceSurfaceChains.map((surface) => (
                    <article key={surface.surfaceId} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-black text-[var(--kr-gov-text-primary)]">{surface.label || surface.surfaceId}</h4>
                          <p className="mt-1 text-xs font-mono text-[var(--kr-gov-text-secondary)]">{surface.surfaceId}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{surface.layoutZone || "-"}</span>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{surface.componentId || "-"}</span>
                        </div>
                      </div>
                      <p className="mt-3 break-all text-xs text-[var(--kr-gov-text-secondary)]">{surface.selector || "-"}</p>
                      {surface.notes ? <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{surface.notes}</p> : null}

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Small Elements" : "작은 요소"}</p>
                          <div className="mt-3 space-y-2">
                            {surface.childElements.length === 0 ? (
                              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No child elements mapped yet." : "연결된 작은 요소가 없습니다."}</p>
                            ) : surface.childElements.map((child) => (
                              <div key={`${surface.surfaceId}-${child.instanceKey}-${child.componentId}`} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-3 py-2">
                                <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{child.componentName || child.instanceKey || child.componentId || "-"}</p>
                                <p className="mt-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{child.instanceKey || "-"}</p>
                                <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{child.componentId || "-"} / {child.layoutZone || "-"}</p>
                                {child.designReference ? <p className="mt-1 break-all text-[11px] text-[var(--kr-gov-text-secondary)]">{child.designReference}</p> : null}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Page-Level Codes" : "페이지 공통 코드"}</p>
                          <div className="mt-3 space-y-3">
                            <div>
                              <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Feature Codes" : "기능 코드"}</p>
                              {renderMetaList(governanceOverview.featureCodes, en ? "No feature codes collected yet." : "수집된 기능 코드가 없습니다.")}
                            </div>
                            <div>
                              <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Common Codes" : "공통코드"}</p>
                              {renderMetaList(governanceOverview.commonCodeGroups, en ? "No common code groups collected yet." : "수집된 공통코드가 없습니다.")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {surface.events.length === 0 ? (
                          <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                            {en ? "No events mapped to this screen element yet." : "이 화면 요소에 연결된 이벤트가 없습니다."}
                          </div>
                        ) : surface.events.map((event) => (
                          <section key={event.eventId} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h5 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{event.label || event.eventId}</h5>
                                <p className="mt-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{event.eventId}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{event.eventType || "-"}</span>
                                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{event.frontendFunction || "-"}</span>
                              </div>
                            </div>
                            <p className="mt-2 break-all text-xs text-[var(--kr-gov-text-secondary)]">{event.triggerSelector || "-"}</p>
                            {event.notes ? <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{event.notes}</p> : null}

                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-3">
                                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Function Inputs" : "함수 파라미터"}</p>
                                <div className="mt-3 space-y-2">
                                  {event.functionInputs.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No parameters collected yet." : "수집된 파라미터가 없습니다."}</p> : event.functionInputs.map((field) => (
                                    <div key={`${event.eventId}-in-${field.fieldId}`} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-2">
                                      <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{field.fieldId}</p>
                                      <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.type} / {field.source || "-"} / {field.required ? "required" : "optional"}</p>
                                      {field.notes ? <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.notes}</p> : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-3">
                                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Function Results" : "함수 결과값"}</p>
                                <div className="mt-3 space-y-2">
                                  {event.functionOutputs.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No results collected yet." : "수집된 결과값이 없습니다."}</p> : event.functionOutputs.map((field) => (
                                    <div key={`${event.eventId}-out-${field.fieldId}`} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-3 py-2">
                                      <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{field.fieldId}</p>
                                      <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.type} / {field.source || "-"} / {field.required ? "required" : "optional"}</p>
                                      {field.notes ? <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.notes}</p> : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 space-y-3">
                              {event.apis.length === 0 ? (
                                <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                                  {en ? "No API is linked to this event." : "이 이벤트에 연결된 API가 없습니다."}
                                </div>
                              ) : event.apis.map((api) => (
                                <article key={`${event.eventId}-${api.apiId}`} className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white p-4">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <h6 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{api.label || api.apiId}</h6>
                                      <p className="mt-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{api.apiId}</p>
                                    </div>
                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{api.method} {api.endpoint}</span>
                                  </div>

                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Backend Chain</p>
                                      <div className="mt-3 space-y-3">
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">Controller</p>
                                          {renderMetaList(api.controllerActions, en ? "No controller actions collected yet." : "수집된 Controller 액션이 없습니다.")}
                                        </div>
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">Service</p>
                                          {renderMetaList(api.serviceMethods, en ? "No service methods collected yet." : "수집된 Service 메서드가 없습니다.")}
                                        </div>
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">Mapper</p>
                                          {renderMetaList(api.mapperQueries, en ? "No mapper queries collected yet." : "수집된 Mapper 쿼리가 없습니다.")}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">API I/O</p>
                                      <div className="mt-3 space-y-3">
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Request Fields" : "요청 필드"}</p>
                                          {api.requestFields.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No request fields collected yet." : "수집된 요청 필드가 없습니다."}</p> : api.requestFields.map((field) => (
                                            <div key={`${api.apiId}-req-${field.fieldId}`} className="mb-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-3 py-2">
                                              <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{field.fieldId}</p>
                                              <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.type} / {field.source || "-"} / {field.required ? "required" : "optional"}</p>
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Response Fields" : "응답 필드"}</p>
                                          {api.responseFields.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No response fields collected yet." : "수집된 응답 필드가 없습니다."}</p> : api.responseFields.map((field) => (
                                            <div key={`${api.apiId}-res-${field.fieldId}`} className="mb-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-3 py-2">
                                              <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{field.fieldId}</p>
                                              <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{field.type} / {field.source || "-"} / {field.required ? "required" : "optional"}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Schemas / Tables / Columns" : "스키마 / 테이블 / 컬럼"}</p>
                                      <div className="mt-3 space-y-3">
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Schemas" : "스키마"}</p>
                                          {api.schemas.length === 0 ? <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No schemas linked yet." : "연결된 스키마가 없습니다."}</p> : api.schemas.map((schema) => (
                                            <div key={`${api.apiId}-${schema.schemaId}`} className="mb-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-3 py-2">
                                              <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{schema.label || schema.schemaId}</p>
                                              <p className="mt-1 text-[11px] font-mono text-[var(--kr-gov-text-secondary)]">{schema.schemaId}</p>
                                              <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{schema.tableName || "-"}</p>
                                              <div className="mt-2">{renderMetaList(schema.columns || [], en ? "No columns collected yet." : "수집된 컬럼이 없습니다.")}</div>
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Related Tables" : "관련 테이블"}</p>
                                          {renderMetaList(api.relatedTables, en ? "No tables collected yet." : "수집된 테이블이 없습니다.")}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-3">
                                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Codes / Permissions" : "코드 / 권한"}</p>
                                      <div className="mt-3 space-y-3">
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Feature Codes" : "기능 코드"}</p>
                                          {renderMetaList(governanceOverview.featureCodes, en ? "No feature codes collected yet." : "수집된 기능 코드가 없습니다.")}
                                        </div>
                                        <div>
                                          <p className="mb-2 text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Common Codes" : "공통코드"}</p>
                                          {renderMetaList(governanceOverview.commonCodeGroups, en ? "No common code groups collected yet." : "수집된 공통코드가 없습니다.")}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="gov-label mb-2">{en ? "Surface-Event Mapping Table" : "화면 요소-이벤트 매핑 표"}</p>
                    <p className="text-sm text-[var(--kr-gov-text-secondary)]">
                      {en
                        ? "Review screen elements, child elements, events, functions, and backend chains in a single table."
                        : "화면 요소, 작은 요소, 이벤트, 함수, 백엔드 체인을 한 표에서 확인합니다."}
                    </p>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{en ? "Surface" : "화면 요소"}</th>
                          <th>{en ? "Child Elements" : "작은 요소"}</th>
                          <th>{en ? "Event" : "이벤트"}</th>
                          <th>{en ? "Function" : "함수"}</th>
                          <th>{en ? "Parameters / Results" : "파라미터 / 결과값"}</th>
                          <th>API</th>
                          <th>{en ? "Backend Chain" : "백엔드 체인"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {governanceSurfaceEventRows.length === 0 ? (
                          <tr><td colSpan={7}>{en ? "No surface-event mappings collected yet." : "수집된 화면 요소-이벤트 매핑이 없습니다."}</td></tr>
                        ) : governanceSurfaceEventRows.map((row) => (
                          <tr key={`${row.surfaceId}-${row.eventId}-${row.frontendFunction}`}>
                            <td>
                              <strong>{row.surfaceLabel || row.surfaceId}</strong>
                              <br />
                              <span className="text-[var(--kr-gov-text-secondary)]">{row.surfaceId}</span>
                            </td>
                            <td>{row.childElements || "-"}</td>
                            <td>
                              <strong>{row.eventLabel}</strong>
                              <br />
                              <span className="text-[var(--kr-gov-text-secondary)]">{row.eventId} / {row.eventType}</span>
                            </td>
                            <td>{row.frontendFunction || "-"}</td>
                            <td>
                              <strong>{en ? "IN" : "입력"}</strong> {row.parameters}
                              <br />
                              <strong>{en ? "OUT" : "출력"}</strong> {row.results}
                            </td>
                            <td>{row.apiLabels || "-"}</td>
                            <td>
                              <strong>Controller</strong> {row.controllerActions}
                              <br />
                              <strong>Service</strong> {row.serviceMethods}
                              <br />
                              <strong>Mapper</strong> {row.mapperQueries}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </AdminPageShell>
  );
}
