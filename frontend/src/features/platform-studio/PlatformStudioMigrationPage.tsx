import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  autoCollectFullStackGovernanceRegistry,
  createSrTicket,
  fetchFullStackGovernanceRegistry,
  fetchFullStackManagementPage,
  fetchScreenCommandPage,
  fetchSrWorkbenchPage,
  saveFullStackGovernanceRegistry,
  type FullStackGovernanceRegistryEntry,
  type MenuManagementPagePayload,
  type ScreenCommandPagePayload,
  type SrWorkbenchPagePayload
} from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { buildLocalizedPath, getCsrfMeta, isEnglish } from "../../lib/navigation/runtime";
import { numberOf, stringOf } from "../admin-system/adminSystemShared";

type FocusTab =
  | "overview"
  | "surfaces"
  | "events"
  | "functions"
  | "apis"
  | "controllers"
  | "db"
  | "columns"
  | "automation";

type RegistryEditor = {
  summary: string;
  ownerScope: string;
  notes: string;
  frontendSources: string;
  componentIds: string;
  eventIds: string;
  functionIds: string;
  parameterSpecs: string;
  resultSpecs: string;
  apiIds: string;
  schemaIds: string;
  tableNames: string;
  columnNames: string;
  featureCodes: string;
  commonCodeGroups: string;
  tags: string;
};

type TargetSelection = {
  surfaceIds: string[];
  eventIds: string[];
  functionIds: string[];
  apiIds: string[];
  schemaIds: string[];
  tableNames: string[];
  columnNames: string[];
  changeTargetId: string;
};

const TAB_OPTIONS: Array<{ id: FocusTab; labelKo: string; labelEn: string }> = [
  { id: "overview", labelKo: "개요", labelEn: "Overview" },
  { id: "surfaces", labelKo: "화면 요소", labelEn: "Surfaces" },
  { id: "events", labelKo: "이벤트", labelEn: "Events" },
  { id: "functions", labelKo: "함수", labelEn: "Functions" },
  { id: "apis", labelKo: "API", labelEn: "APIs" },
  { id: "controllers", labelKo: "컨트롤러", labelEn: "Controllers" },
  { id: "db", labelKo: "DB 테이블", labelEn: "DB Tables" },
  { id: "columns", labelKo: "컬럼", labelEn: "Columns" },
  { id: "automation", labelKo: "작업 지시", labelEn: "Automation" }
];

function splitLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function joinLines(values: string[] | undefined) {
  return (values || []).join("\n");
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function parseFocus(): FocusTab {
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("focus") || "").trim() as FocusTab;
  return TAB_OPTIONS.some((item) => item.id === requested) ? requested : "overview";
}

function validateRegistryEditor(editor: RegistryEditor, en: boolean) {
  const errors: string[] = [];
  const tablePattern = /^[A-Z][A-Z0-9_]*$/;
  const columnPattern = /^[A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_]*$/;
  const upperTokenPattern = /^[A-Z][A-Z0-9_]*$/;
  const fieldSpecPattern = /^[^:\s][^:]*:[^:\s][^:]*(:[^:\s][^:]*)?$/;
  const check = (value: string, pattern: RegExp, ko: string, enMsg: string) => {
    const invalid = splitLines(value).find((item) => !pattern.test(item.trim().toUpperCase()));
    if (invalid) {
      errors.push((en ? enMsg : ko) + `: ${invalid}`);
    }
  };
  check(editor.tableNames, tablePattern, "테이블 형식 오류", "Invalid table format");
  check(editor.columnNames, columnPattern, "컬럼 형식 오류", "Invalid column format");
  check(editor.featureCodes, upperTokenPattern, "기능 코드 형식 오류", "Invalid feature code format");
  check(editor.commonCodeGroups, upperTokenPattern, "공통코드 그룹 형식 오류", "Invalid common-code group format");
  const invalidParam = splitLines(editor.parameterSpecs).find((item) => !fieldSpecPattern.test(item));
  if (invalidParam) errors.push(en ? `Invalid parameter spec: ${invalidParam}` : `파라미터 형식 오류: ${invalidParam}`);
  const invalidResult = splitLines(editor.resultSpecs).find((item) => !fieldSpecPattern.test(item));
  if (invalidResult) errors.push(en ? `Invalid result spec: ${invalidResult}` : `결과값 형식 오류: ${invalidResult}`);
  return errors;
}

function toEditor(entry: FullStackGovernanceRegistryEntry): RegistryEditor {
  return {
    summary: entry.summary || "",
    ownerScope: entry.ownerScope || "",
    notes: entry.notes || "",
    frontendSources: joinLines(entry.frontendSources),
    componentIds: joinLines(entry.componentIds),
    eventIds: joinLines(entry.eventIds),
    functionIds: joinLines(entry.functionIds),
    parameterSpecs: joinLines(entry.parameterSpecs),
    resultSpecs: joinLines(entry.resultSpecs),
    apiIds: joinLines(entry.apiIds),
    schemaIds: joinLines(entry.schemaIds),
    tableNames: joinLines(entry.tableNames),
    columnNames: joinLines(entry.columnNames),
    featureCodes: joinLines(entry.featureCodes),
    commonCodeGroups: joinLines(entry.commonCodeGroups),
    tags: joinLines(entry.tags)
  };
}

function emptyEditor(): RegistryEditor {
  return toEditor({
    menuCode: "",
    pageId: "",
    menuUrl: "",
    summary: "",
    ownerScope: "",
    notes: "",
    frontendSources: [],
    componentIds: [],
    eventIds: [],
    functionIds: [],
    parameterSpecs: [],
    resultSpecs: [],
    apiIds: [],
    schemaIds: [],
    tableNames: [],
    columnNames: [],
    featureCodes: [],
    commonCodeGroups: [],
    tags: [],
    updatedAt: "",
    source: "DEFAULT"
  });
}

function emptyTargetSelection(): TargetSelection {
  return {
    surfaceIds: [],
    eventIds: [],
    functionIds: [],
    apiIds: [],
    schemaIds: [],
    tableNames: [],
    columnNames: [],
    changeTargetId: ""
  };
}

function toggleSelection(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function buildDirection(page: ScreenCommandPagePayload["page"] | undefined, editor: RegistryEditor, selection: TargetSelection, summary: string, instruction: string) {
  return [
    `[SR 요약] ${summary || "요약 없음"}`,
    `대상 화면: ${page?.label || "-"} (${page?.routePath || "-"})`,
    `대상 메뉴: ${page?.menuCode || "-"}`,
    `지목 요소: ${selection.surfaceIds.join(", ") || splitLines(editor.componentIds).join(", ") || "-"}`,
    `지목 이벤트: ${selection.eventIds.join(", ") || splitLines(editor.eventIds).join(", ") || "-"}`,
    `지목 함수: ${selection.functionIds.join(", ") || splitLines(editor.functionIds).join(", ") || "-"}`,
    `지목 API: ${selection.apiIds.join(", ") || splitLines(editor.apiIds).join(", ") || "-"}`,
    `지목 스키마: ${selection.schemaIds.join(", ") || splitLines(editor.schemaIds).join(", ") || "-"}`,
    `지목 테이블: ${selection.tableNames.join(", ") || splitLines(editor.tableNames).join(", ") || "-"}`,
    `지목 컬럼: ${selection.columnNames.join(", ") || splitLines(editor.columnNames).join(", ") || "-"}`,
    `수정 타깃: ${selection.changeTargetId || "-"}`,
    `실행 지시: ${instruction || "구체 지시 필요"}`
  ].join("\n");
}

export function PlatformStudioMigrationPage() {
  const en = isEnglish();
  const [menuType, setMenuType] = useState(new URLSearchParams(window.location.search).get("menuType") || "ADMIN");
  const [focus, setFocus] = useState<FocusTab>(parseFocus());
  const [selectedMenuCode, setSelectedMenuCode] = useState("");
  const [summary, setSummary] = useState("");
  const [instruction, setInstruction] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [registryEditor, setRegistryEditor] = useState<RegistryEditor>(emptyEditor());
  const [registryEntry, setRegistryEntry] = useState<FullStackGovernanceRegistryEntry | null>(null);
  const [savingRegistry, setSavingRegistry] = useState(false);
  const [collectingRegistry, setCollectingRegistry] = useState(false);
  const [targetSelection, setTargetSelection] = useState<TargetSelection>(emptyTargetSelection());
  const pageState = useAsyncValue<MenuManagementPagePayload>(() => fetchFullStackManagementPage(menuType), [menuType]);
  const workbenchState = useAsyncValue<SrWorkbenchPagePayload>(() => fetchSrWorkbenchPage(""), []);
  const page = pageState.value;
  const workbench = workbenchState.value;
  const summaryRows = ((page?.fullStackSummaryRows || []) as Array<Record<string, unknown>>);
  const selectedSummary = useMemo(() => summaryRows.find((item) => stringOf(item, "menuCode") === selectedMenuCode) || null, [selectedMenuCode, summaryRows]);
  const pageId = stringOf(selectedSummary, "pageId");
  const commandState = useAsyncValue<ScreenCommandPagePayload>(() => (pageId ? fetchScreenCommandPage(pageId) : Promise.resolve({ selectedPageId: "", pages: [], page: {} as ScreenCommandPagePayload["page"] })), [pageId]);
  const commandPage = pageId ? commandState.value : null;
  const commandDetail = commandPage?.page;

  const derivedSelection = useMemo(() => {
    const events = (commandDetail?.events || []).filter((item) => targetSelection.eventIds.includes(item.eventId));
    const functions = unique([
      ...targetSelection.functionIds,
      ...events.map((item) => item.frontendFunction)
    ]);
    const apis = unique([
      ...targetSelection.apiIds,
      ...events.flatMap((item) => item.apiIds || [])
    ]);
    const schemas = unique([
      ...targetSelection.schemaIds,
      ...(commandDetail?.apis || []).filter((item) => apis.includes(item.apiId)).flatMap((item) => item.schemaIds || [])
    ]);
    const tables = unique([
      ...targetSelection.tableNames,
      ...(commandDetail?.apis || []).filter((item) => apis.includes(item.apiId)).flatMap((item) => item.relatedTables || []),
      ...(commandDetail?.schemas || []).filter((item) => schemas.includes(item.schemaId)).map((item) => item.tableName)
    ]);
    const columns = unique([
      ...targetSelection.columnNames,
      ...(commandDetail?.schemas || []).filter((item) => schemas.includes(item.schemaId)).flatMap((item) => (item.columns || []).map((column) => `${item.tableName}.${column}`))
    ]);
    return { functions, apis, schemas, tables, columns };
  }, [commandDetail, targetSelection]);

  const impactRows = useMemo(() => {
    if (!commandDetail) {
      return [];
    }
    const rows: Array<{ layer: string; id: string; detail: string }> = [];
    (commandDetail.surfaces || []).filter((item) => targetSelection.surfaceIds.includes(item.surfaceId)).forEach((item) => {
      rows.push({ layer: en ? "Surface" : "화면 요소", id: item.surfaceId, detail: `${item.selector} / ${item.componentId}` });
    });
    (commandDetail.events || []).filter((item) => targetSelection.eventIds.includes(item.eventId)).forEach((item) => {
      rows.push({ layer: en ? "Event" : "이벤트", id: item.eventId, detail: `${item.frontendFunction} -> ${(item.apiIds || []).join(", ") || "-"}` });
    });
    derivedSelection.functions.forEach((item) => {
      rows.push({ layer: en ? "Function" : "함수", id: item, detail: en ? "Triggered from selected event" : "선택 이벤트에서 호출" });
    });
    (commandDetail.apis || []).filter((item) => derivedSelection.apis.includes(item.apiId)).forEach((item) => {
      rows.push({ layer: "API", id: item.apiId, detail: `${item.method} ${item.endpoint} / ${item.controllerAction}` });
    });
    (commandDetail.schemas || []).filter((item) => derivedSelection.schemas.includes(item.schemaId)).forEach((item) => {
      rows.push({ layer: en ? "Schema" : "스키마", id: item.schemaId, detail: `${item.tableName} / ${(item.columns || []).length} ${en ? "columns" : "컬럼"}` });
    });
    derivedSelection.tables.forEach((item) => {
      rows.push({ layer: en ? "Table" : "테이블", id: item, detail: derivedSelection.columns.filter((column) => column.startsWith(`${item}.`)).length + ` ${en ? "linked columns" : "연결 컬럼"}` });
    });
    derivedSelection.columns.forEach((item) => {
      rows.push({ layer: en ? "Column" : "컬럼", id: item, detail: targetSelection.changeTargetId || "-" });
    });
    return rows;
  }, [commandDetail, derivedSelection, en, targetSelection]);

  useEffect(() => {
    if (!selectedMenuCode && summaryRows.length > 0) {
      setSelectedMenuCode(stringOf(summaryRows[0], "menuCode"));
    }
  }, [selectedMenuCode, summaryRows]);

  useEffect(() => {
    let cancelled = false;
    async function loadRegistry() {
      if (!selectedMenuCode) {
        setRegistryEntry(null);
        setRegistryEditor(emptyEditor());
        return;
      }
      try {
        const loaded = await fetchFullStackGovernanceRegistry(selectedMenuCode);
        if (!cancelled) {
          setRegistryEntry(loaded);
          setRegistryEditor(toEditor(loaded));
        }
      } catch {
        if (!cancelled) {
          setRegistryEntry(null);
          setRegistryEditor(emptyEditor());
        }
      }
    }
    void loadRegistry();
    return () => {
      cancelled = true;
    };
  }, [selectedMenuCode]);

  useEffect(() => {
    if (!commandDetail) {
      setTargetSelection(emptyTargetSelection());
      return;
    }
    setTargetSelection({
      surfaceIds: commandDetail.surfaces?.[0]?.surfaceId ? [commandDetail.surfaces[0].surfaceId] : [],
      eventIds: commandDetail.events?.[0]?.eventId ? [commandDetail.events[0].eventId] : [],
      functionIds: commandDetail.events?.[0]?.frontendFunction ? [commandDetail.events[0].frontendFunction] : [],
      apiIds: commandDetail.apis?.[0]?.apiId ? [commandDetail.apis[0].apiId] : [],
      schemaIds: commandDetail.schemas?.[0]?.schemaId ? [commandDetail.schemas[0].schemaId] : [],
      tableNames: commandDetail.schemas?.[0]?.tableName ? [commandDetail.schemas[0].tableName] : [],
      columnNames: commandDetail.schemas?.[0]
        ? (commandDetail.schemas[0].columns || []).slice(0, 2).map((column) => `${commandDetail.schemas?.[0]?.tableName}.${column}`)
        : [],
      changeTargetId: commandDetail.changeTargets?.[0]?.targetId || ""
    });
  }, [commandDetail]);

  async function createPageMenu(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setActionMessage("");
    const formData = new FormData(event.currentTarget);
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    ["parentCode", "codeNm", "codeDc", "menuUrl", "menuIcon", "useAt"].forEach((key) => body.set(key, String(formData.get(key) || "")));
    const { token, headerName } = getCsrfMeta();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    if (token) headers[headerName] = token;
    const response = await fetch(buildLocalizedPath("/admin/system/menu-management/create-page", "/en/admin/system/menu-management/create-page"), {
      method: "POST",
      credentials: "include",
      headers,
      body: body.toString()
    });
    const result = await response.json() as { success?: boolean; message?: string; createdCode?: string };
    if (!response.ok || !result.success) {
      setActionError(result.message || (en ? "Failed to create page menu." : "페이지 메뉴를 생성하지 못했습니다."));
      return;
    }
    await pageState.reload();
    setSelectedMenuCode(result.createdCode || "");
    setActionMessage(result.message || (en ? "Page menu created." : "페이지 메뉴를 생성했습니다."));
    event.currentTarget.reset();
  }

  async function toggleVisibility(nextUseAt: "Y" | "N") {
    if (!selectedMenuCode) {
      return;
    }
    setActionError("");
    setActionMessage("");
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("menuCode", selectedMenuCode);
    body.set("useAt", nextUseAt);
    const { token, headerName } = getCsrfMeta();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    if (token) headers[headerName] = token;
    const response = await fetch(buildLocalizedPath("/admin/system/full-stack-management/menu-visibility", "/en/admin/system/full-stack-management/menu-visibility"), {
      method: "POST",
      credentials: "include",
      headers,
      body: body.toString()
    });
    const result = await response.json() as { success?: boolean; message?: string };
    if (!response.ok || !result.success) {
      setActionError(result.message || (en ? "Failed to change menu visibility." : "메뉴 표시 상태를 변경하지 못했습니다."));
      return;
    }
    await pageState.reload();
    setActionMessage(result.message || (en ? "Visibility updated." : "표시 상태를 변경했습니다."));
  }

  async function saveRegistry() {
    if (!selectedMenuCode) {
      return;
    }
    const errors = validateRegistryEditor(registryEditor, en);
    if (errors.length > 0) {
      setActionError(errors.join(" "));
      return;
    }
    setSavingRegistry(true);
    setActionError("");
    try {
      const payload: FullStackGovernanceRegistryEntry = {
        menuCode: selectedMenuCode,
        pageId: pageId || registryEntry?.pageId || "",
        menuUrl: commandDetail?.menuLookupUrl || stringOf(selectedSummary, "menuUrl"),
        summary: registryEditor.summary,
        ownerScope: registryEditor.ownerScope,
        notes: registryEditor.notes,
        frontendSources: splitLines(registryEditor.frontendSources),
        componentIds: splitLines(registryEditor.componentIds),
        eventIds: splitLines(registryEditor.eventIds),
        functionIds: splitLines(registryEditor.functionIds),
        parameterSpecs: splitLines(registryEditor.parameterSpecs),
        resultSpecs: splitLines(registryEditor.resultSpecs),
        apiIds: splitLines(registryEditor.apiIds),
        schemaIds: splitLines(registryEditor.schemaIds),
        tableNames: splitLines(registryEditor.tableNames),
        columnNames: splitLines(registryEditor.columnNames),
        featureCodes: splitLines(registryEditor.featureCodes),
        commonCodeGroups: splitLines(registryEditor.commonCodeGroups),
        tags: splitLines(registryEditor.tags),
        updatedAt: registryEntry?.updatedAt || "",
        source: "FILE"
      };
      const result = await saveFullStackGovernanceRegistry(payload);
      setRegistryEntry(result.entry);
      setRegistryEditor(toEditor(result.entry));
      await pageState.reload();
      setActionMessage(result.message || (en ? "Registry saved." : "레지스트리를 저장했습니다."));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to save registry." : "레지스트리 저장에 실패했습니다."));
    } finally {
      setSavingRegistry(false);
    }
  }

  async function createAutomationTicket() {
    if (!commandDetail) {
      return;
    }
    const generatedDirection = buildDirection(commandDetail, registryEditor, targetSelection, summary, instruction);
    const selectedEvent = (commandDetail.events || []).find((item) => item.eventId === targetSelection.eventIds[0]);
    const selectedSurface = (commandDetail.surfaces || []).find((item) => item.surfaceId === targetSelection.surfaceIds[0]);
    const selectedTarget = (commandDetail.changeTargets || []).find((item) => item.targetId === targetSelection.changeTargetId);
    const response = await createSrTicket({
      pageId: commandDetail.pageId || pageId,
      pageLabel: commandDetail.label || "",
      routePath: commandDetail.routePath || "",
      menuCode: commandDetail.menuCode || selectedMenuCode,
      menuLookupUrl: commandDetail.menuLookupUrl || "",
      surfaceId: selectedSurface?.surfaceId || "",
      surfaceLabel: selectedSurface?.label || "",
      eventId: selectedEvent?.eventId || splitLines(registryEditor.eventIds)[0] || "",
      eventLabel: selectedEvent?.label || "",
      targetId: selectedTarget?.targetId || "",
      targetLabel: selectedTarget?.label || "",
      summary,
      instruction,
      generatedDirection,
      commandPrompt: [
        `pageId=${commandDetail.pageId || pageId}`,
        `route=${commandDetail.routePath || ""}`,
        `menuCode=${commandDetail.menuCode || selectedMenuCode}`,
        generatedDirection
      ].join("\n")
    });
    setActionMessage(response.message || (en ? "Automation ticket created." : "작업 지시 티켓을 생성했습니다."));
    await workbenchState.reload();
  }

  async function autoCollectRegistry() {
    if (!selectedMenuCode || !pageId) {
      setActionError(en ? "Select a page menu first." : "먼저 페이지 메뉴를 선택하세요.");
      return;
    }
    setCollectingRegistry(true);
    setActionError("");
    try {
      const result = await autoCollectFullStackGovernanceRegistry({
        menuCode: selectedMenuCode,
        pageId,
        menuUrl: commandDetail?.menuLookupUrl || stringOf(selectedSummary, "menuUrl"),
        mergeExisting: true,
        save: true
      });
      setRegistryEntry(result.entry);
      setRegistryEditor(toEditor(result.entry));
      await pageState.reload();
      setActionMessage(result.message || (en ? "Resources collected and saved." : "자원을 자동 수집하고 저장했습니다."));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to auto collect resources." : "자원 자동 수집에 실패했습니다."));
    } finally {
      setCollectingRegistry(false);
    }
  }

  const tabTitle = TAB_OPTIONS.find((item) => item.id === focus);

  function importSelectionToRegistry() {
    setRegistryEditor((current) => ({
      ...current,
      componentIds: joinLines(unique([...splitLines(current.componentIds), ...targetSelection.surfaceIds])),
      eventIds: joinLines(unique([...splitLines(current.eventIds), ...targetSelection.eventIds])),
      functionIds: joinLines(unique([...splitLines(current.functionIds), ...derivedSelection.functions])),
      apiIds: joinLines(unique([...splitLines(current.apiIds), ...derivedSelection.apis])),
      schemaIds: joinLines(unique([...splitLines(current.schemaIds), ...derivedSelection.schemas])),
      tableNames: joinLines(unique([...splitLines(current.tableNames), ...derivedSelection.tables])),
      columnNames: joinLines(unique([...splitLines(current.columnNames), ...derivedSelection.columns]))
    }));
    setActionMessage(en ? "Selected resources copied to the registry editor." : "선택 자원을 레지스트리 편집기에 반영했습니다.");
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Platform Studio" : "플랫폼 스튜디오" }
      ]}
      title={en ? "Platform Studio" : "플랫폼 스튜디오"}
      subtitle={en ? "Create menu pages, toggle visibility, edit connected resources, and create AI work instructions from one console." : "메뉴 생성, 숨김/보이기, 연결 자원 편집, AI 작업지시 생성까지 하나의 콘솔에서 처리합니다."}
    >
      {actionMessage ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionMessage}</div> : null}
      {actionError ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div> : null}

      <section className="gov-card mb-6">
        <div className="flex flex-wrap gap-2">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`gov-btn ${focus === tab.id ? "gov-btn-primary" : "gov-btn-outline"}`}
              onClick={() => setFocus(tab.id)}
            >
              {en ? tab.labelEn : tab.labelKo}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Current focus" : "현재 포커스"}: {en ? tabTitle?.labelEn : tabTitle?.labelKo}</p>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[20rem_1fr] gap-6">
        <aside className="gov-card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-bold">{en ? "Managed Menus" : "관리 대상 메뉴"}</h3>
            <select className="gov-select max-w-[8rem]" value={menuType} onChange={(event) => setMenuType(event.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            {summaryRows.map((row) => {
              const menuCode = stringOf(row, "menuCode");
              const selected = menuCode === selectedMenuCode;
              return (
                <button key={menuCode} type="button" className={`w-full rounded-[var(--kr-gov-radius)] border px-3 py-3 text-left ${selected ? "border-[var(--kr-gov-focus)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white"}`} onClick={() => setSelectedMenuCode(menuCode)}>
                  <strong className="block">{stringOf(row, "menuNm") || menuCode}</strong>
                  <span className="block text-xs text-[var(--kr-gov-text-secondary)]">{menuCode} / {stringOf(row, "menuUrl") || "-"}</span>
                  <span className="block text-xs text-[var(--kr-gov-text-secondary)]">{en ? "Coverage" : "커버리지"} {numberOf(row, "coverageScore")}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Menu / Page Control" : "메뉴 / 페이지 제어"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(selectedSummary, "menuCode")} / {stringOf(selectedSummary, "menuUrl") || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="gov-btn gov-btn-outline" type="button" onClick={() => { void toggleVisibility("Y"); }}>{en ? "Show" : "보이기"}</button>
                <button className="gov-btn gov-btn-outline" type="button" onClick={() => { void toggleVisibility("N"); }}>{en ? "Hide" : "숨기기"}</button>
              </div>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" onSubmit={(event) => { void createPageMenu(event); }}>
              <label>
                <span className="gov-label">{en ? "Parent Code" : "부모 코드"}</span>
                <input className="gov-input" name="parentCode" placeholder="A00601" />
              </label>
              <label>
                <span className="gov-label">{en ? "Page Name" : "페이지명"}</span>
                <input className="gov-input" name="codeNm" />
              </label>
              <label>
                <span className="gov-label">{en ? "Page Name EN" : "영문 페이지명"}</span>
                <input className="gov-input" name="codeDc" />
              </label>
              <label className="md:col-span-2">
                <span className="gov-label">{en ? "Page URL" : "페이지 URL"}</span>
                <input className="gov-input" name="menuUrl" placeholder={menuType === "USER" ? "/home/..." : "/admin/system/..."} />
              </label>
              <label>
                <span className="gov-label">{en ? "Icon" : "아이콘"}</span>
                <input className="gov-input" defaultValue="hub" name="menuIcon" />
              </label>
              <label>
                <span className="gov-label">{en ? "Use At" : "사용 여부"}</span>
                <select className="gov-select" defaultValue="Y" name="useAt">
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </select>
              </label>
              <div className="flex items-end">
                <button className="gov-btn gov-btn-primary w-full" type="submit">{en ? "Create Page Menu" : "페이지 메뉴 생성"}</button>
              </div>
            </form>
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Target Picker" : "수정 대상 선택"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Point to the exact surface, event, API, schema, and DB resources before saving or creating an SR ticket." : "저장이나 SR 생성 전에 정확한 화면 요소, 이벤트, API, 스키마, DB 자원을 지목합니다."}</p>
              </div>
              <button className="gov-btn gov-btn-outline" type="button" onClick={importSelectionToRegistry}>{en ? "Copy To Registry" : "레지스트리에 반영"}</button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div>
                <h4 className="mb-2 font-semibold">{en ? "Surfaces" : "화면 요소"}</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {(commandDetail?.surfaces || []).map((item) => (
                    <label key={item.surfaceId} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.surfaceIds.includes(item.surfaceId)} onChange={() => setTargetSelection((current) => ({ ...current, surfaceIds: toggleSelection(current.surfaceIds, item.surfaceId) }))} />
                      <span><strong>{item.surfaceId}</strong><br />{item.label}<br /><span className="text-[var(--kr-gov-text-secondary)]">{item.selector}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">{en ? "Events / Functions" : "이벤트 / 함수"}</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {(commandDetail?.events || []).map((item) => (
                    <label key={item.eventId} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.eventIds.includes(item.eventId)} onChange={() => setTargetSelection((current) => ({ ...current, eventIds: toggleSelection(current.eventIds, item.eventId), functionIds: unique(toggleSelection(current.eventIds, item.eventId).includes(item.eventId) ? [...current.functionIds, item.frontendFunction] : current.functionIds.filter((value) => value !== item.frontendFunction)) }))} />
                      <span><strong>{item.eventId}</strong><br />{item.label}<br /><span className="text-[var(--kr-gov-text-secondary)]">{item.frontendFunction} / {(item.apiIds || []).join(", ") || "-"}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">{en ? "Change Target" : "수정 타깃"}</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {(commandDetail?.changeTargets || []).map((item) => (
                    <label key={item.targetId} className="flex gap-2 text-sm">
                      <input type="radio" name="changeTargetId" checked={targetSelection.changeTargetId === item.targetId} onChange={() => setTargetSelection((current) => ({ ...current, changeTargetId: item.targetId }))} />
                      <span><strong>{item.targetId}</strong><br />{item.label}<br /><span className="text-[var(--kr-gov-text-secondary)]">{(item.editableFields || []).join(", ")}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">API / Schema</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {(commandDetail?.apis || []).map((item) => (
                    <label key={item.apiId} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.apiIds.includes(item.apiId)} onChange={() => setTargetSelection((current) => ({ ...current, apiIds: toggleSelection(current.apiIds, item.apiId) }))} />
                      <span><strong>{item.apiId}</strong><br />{item.method} {item.endpoint}<br /><span className="text-[var(--kr-gov-text-secondary)]">{item.controllerAction}</span></span>
                    </label>
                  ))}
                  {(commandDetail?.schemas || []).map((item) => (
                    <label key={item.schemaId} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.schemaIds.includes(item.schemaId)} onChange={() => setTargetSelection((current) => ({ ...current, schemaIds: toggleSelection(current.schemaIds, item.schemaId) }))} />
                      <span><strong>{item.schemaId}</strong><br />{item.tableName}<br /><span className="text-[var(--kr-gov-text-secondary)]">{(item.columns || []).slice(0, 4).join(", ")}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">{en ? "Tables" : "테이블"}</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {unique([...(registryEntry?.tableNames || []), ...derivedSelection.tables, ...(commandDetail?.schemas || []).map((item) => item.tableName)]).map((item) => (
                    <label key={item} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.tableNames.includes(item)} onChange={() => setTargetSelection((current) => ({ ...current, tableNames: toggleSelection(current.tableNames, item) }))} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">{en ? "Columns" : "컬럼"}</h4>
                <div className="space-y-2 rounded-[var(--kr-gov-radius)] border p-3 max-h-[14rem] overflow-auto">
                  {unique([...(registryEntry?.columnNames || []), ...derivedSelection.columns]).map((item) => (
                    <label key={item} className="flex gap-2 text-sm">
                      <input type="checkbox" checked={targetSelection.columnNames.includes(item)} onChange={() => setTargetSelection((current) => ({ ...current, columnNames: toggleSelection(current.columnNames, item) }))} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Resource Registry" : "자원 레지스트리"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Edit all connected assets in one place. The active tab changes the emphasis, not the source of truth." : "연결 자원을 한 곳에서 편집합니다. 탭은 강조점만 바꾸고 source of truth는 하나입니다."}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="gov-btn gov-btn-outline" disabled={collectingRegistry} type="button" onClick={() => { void autoCollectRegistry(); }}>
                  {collectingRegistry ? (en ? "Collecting..." : "수집 중...") : (en ? "Auto Collect" : "자동 수집")}
                </button>
                <button className="gov-btn gov-btn-primary" disabled={savingRegistry} type="button" onClick={() => { void saveRegistry(); }}>
                  {savingRegistry ? (en ? "Saving..." : "저장 중...") : (en ? "Save Registry" : "레지스트리 저장")}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <label className={focus === "overview" ? "xl:col-span-2" : ""}>
                <span className="gov-label">{en ? "Summary" : "요약"}</span>
                <textarea className="gov-textarea min-h-[96px]" value={registryEditor.summary} onChange={(event) => setRegistryEditor((current) => ({ ...current, summary: event.target.value }))} />
              </label>
              <label>
                <span className="gov-label">{en ? "Owner Scope" : "소유 범위"}</span>
                <input className="gov-input" value={registryEditor.ownerScope} onChange={(event) => setRegistryEditor((current) => ({ ...current, ownerScope: event.target.value }))} />
              </label>
              <label>
                <span className="gov-label">{en ? "Notes" : "메모"}</span>
                <input className="gov-input" value={registryEditor.notes} onChange={(event) => setRegistryEditor((current) => ({ ...current, notes: event.target.value }))} />
              </label>
              {(focus === "overview" || focus === "surfaces") ? <label><span className="gov-label">{en ? "Frontend Sources" : "프론트 소스"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.frontendSources} onChange={(event) => setRegistryEditor((current) => ({ ...current, frontendSources: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "surfaces") ? <label><span className="gov-label">{en ? "Component IDs" : "컴포넌트 ID"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.componentIds} onChange={(event) => setRegistryEditor((current) => ({ ...current, componentIds: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "events") ? <label><span className="gov-label">{en ? "Event IDs" : "이벤트 ID"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.eventIds} onChange={(event) => setRegistryEditor((current) => ({ ...current, eventIds: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "functions") ? <label><span className="gov-label">{en ? "Function IDs" : "함수 ID"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.functionIds} onChange={(event) => setRegistryEditor((current) => ({ ...current, functionIds: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "functions") ? <label><span className="gov-label">{en ? "Parameters" : "파라미터"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.parameterSpecs} onChange={(event) => setRegistryEditor((current) => ({ ...current, parameterSpecs: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "functions") ? <label><span className="gov-label">{en ? "Results" : "결과값"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.resultSpecs} onChange={(event) => setRegistryEditor((current) => ({ ...current, resultSpecs: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "apis" || focus === "controllers") ? <label><span className="gov-label">{en ? "API IDs" : "API ID"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.apiIds} onChange={(event) => setRegistryEditor((current) => ({ ...current, apiIds: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "apis" || focus === "controllers") ? <label><span className="gov-label">{en ? "Schema IDs" : "스키마 ID"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.schemaIds} onChange={(event) => setRegistryEditor((current) => ({ ...current, schemaIds: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "db") ? <label><span className="gov-label">{en ? "Tables" : "테이블"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.tableNames} onChange={(event) => setRegistryEditor((current) => ({ ...current, tableNames: event.target.value }))} /></label> : null}
              {(focus === "overview" || focus === "columns") ? <label><span className="gov-label">{en ? "Columns" : "컬럼"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.columnNames} onChange={(event) => setRegistryEditor((current) => ({ ...current, columnNames: event.target.value }))} /></label> : null}
              {focus === "overview" ? <label><span className="gov-label">{en ? "Feature Codes" : "기능 코드"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.featureCodes} onChange={(event) => setRegistryEditor((current) => ({ ...current, featureCodes: event.target.value }))} /></label> : null}
              {focus === "overview" ? <label><span className="gov-label">{en ? "Common Code Groups" : "공통코드 그룹"}</span><textarea className="gov-textarea min-h-[120px]" value={registryEditor.commonCodeGroups} onChange={(event) => setRegistryEditor((current) => ({ ...current, commonCodeGroups: event.target.value }))} /></label> : null}
            </div>
            <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "One item per line. Tables use TABLE_NAME, columns use TABLE_NAME.COLUMN_NAME, and parameter/result use name:type or name:type:source." : "한 줄에 하나씩 입력합니다. 테이블은 TABLE_NAME, 컬럼은 TABLE_NAME.COLUMN_NAME, 파라미터/결과값은 name:type 또는 name:type:source 형식을 사용합니다."}</p>
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Connected Metadata" : "연결 메타데이터"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{commandDetail?.routePath || stringOf(selectedSummary, "menuUrl") || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-[var(--kr-gov-radius)] border px-4 py-3"><strong>{en ? "Surfaces" : "화면 요소"}</strong><div>{commandDetail?.surfaces?.length || 0}</div></div>
              <div className="rounded-[var(--kr-gov-radius)] border px-4 py-3"><strong>{en ? "Events" : "이벤트"}</strong><div>{commandDetail?.events?.length || 0}</div></div>
              <div className="rounded-[var(--kr-gov-radius)] border px-4 py-3"><strong>API</strong><div>{commandDetail?.apis?.length || 0}</div></div>
              <div className="rounded-[var(--kr-gov-radius)] border px-4 py-3"><strong>{en ? "Schemas" : "스키마"}</strong><div>{commandDetail?.schemas?.length || 0}</div></div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>{en ? "Type" : "유형"}</th><th>{en ? "Id / Label" : "ID / 라벨"}</th><th>{en ? "Connection" : "연결"}</th></tr></thead>
                <tbody>
                  {(focus === "events" ? (commandDetail?.events || []).map((item) => ({ type: "event", id: item.eventId, label: item.label, extra: `${item.frontendFunction} / ${(item.apiIds || []).join(", ")}` })) :
                    focus === "functions" ? (commandDetail?.events || []).map((item) => ({ type: "function", id: item.frontendFunction, label: item.label, extra: `${(item.functionInputs || []).length} in / ${(item.functionOutputs || []).length} out` })) :
                    focus === "apis" || focus === "controllers" ? (commandDetail?.apis || []).map((item) => ({ type: "api", id: item.apiId, label: `${item.method} ${item.endpoint}`, extra: `${item.controllerAction} -> ${item.serviceMethod}` })) :
                    focus === "db" ? splitLines(registryEditor.tableNames).map((item) => ({ type: "table", id: item, label: item, extra: splitLines(registryEditor.columnNames).filter((column) => column.startsWith(`${item}.`)).length + " columns" })) :
                    focus === "columns" ? splitLines(registryEditor.columnNames).map((item) => ({ type: "column", id: item, label: item, extra: splitLines(registryEditor.apiIds).join(", ") || "-" })) :
                    focus === "surfaces" ? (commandDetail?.surfaces || []).map((item) => ({ type: "surface", id: item.surfaceId, label: item.label, extra: `${item.selector} / ${item.componentId}` })) :
                    [
                      ...(commandDetail?.surfaces || []).map((item) => ({ type: "surface", id: item.surfaceId, label: item.label, extra: item.componentId })),
                      ...(commandDetail?.events || []).map((item) => ({ type: "event", id: item.eventId, label: item.label, extra: item.frontendFunction })),
                      ...(commandDetail?.apis || []).map((item) => ({ type: "api", id: item.apiId, label: `${item.method} ${item.endpoint}`, extra: item.controllerAction }))
                    ]).map((row) => (
                    <tr key={`${row.type}-${row.id}`}>
                      <td>{row.type}</td>
                      <td><strong>{row.id}</strong><div className="text-[var(--kr-gov-text-secondary)]">{row.label}</div></td>
                      <td>{row.extra || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Impact Preview" : "영향도 미리보기"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Check every linked layer before hide, change, or deletion." : "숨김, 수정, 삭제 전에 연계 레이어를 먼저 확인합니다."}</p>
              </div>
              <div className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Linked resources" : "연결 자원"}: {impactRows.length}</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>{en ? "Layer" : "레이어"}</th><th>ID</th><th>{en ? "Impact" : "영향"}</th></tr></thead>
                <tbody>
                  {impactRows.length === 0 ? (
                    <tr><td colSpan={3} className="text-center text-[var(--kr-gov-text-secondary)]">{en ? "Select targets to preview impact." : "대상을 선택하면 영향도를 보여줍니다."}</td></tr>
                  ) : impactRows.map((row) => (
                    <tr key={`${row.layer}-${row.id}`}>
                      <td>{row.layer}</td>
                      <td><strong>{row.id}</strong></td>
                      <td>{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="gov-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold">{en ? "Automation Work Request" : "자동화 작업 지시"}</h3>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Generate an SR work ticket from the currently selected menu and resources." : "현재 선택한 메뉴와 자원을 기준으로 SR 작업 티켓을 생성합니다."}</p>
              </div>
              <div className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Tickets" : "티켓"}: {workbench?.ticketCount || 0}</div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
              <div>
                <label className="gov-label" htmlFor="automation-summary">{en ? "Summary" : "요약"}</label>
                <input className="gov-input" id="automation-summary" value={summary} onChange={(event) => setSummary(event.target.value)} />
                <label className="gov-label mt-4" htmlFor="automation-instruction">{en ? "Instruction" : "상세 지시"}</label>
                <textarea className="gov-textarea min-h-[150px]" id="automation-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} />
                <button className="gov-btn gov-btn-primary mt-4" type="button" onClick={() => { void createAutomationTicket(); }}>{en ? "Create SR Ticket" : "SR 티켓 생성"}</button>
              </div>
              <div>
                <label className="gov-label">{en ? "Generated Direction" : "생성된 지시문"}</label>
                <textarea className="gov-textarea min-h-[230px]" readOnly value={buildDirection(commandDetail, registryEditor, targetSelection, summary, instruction)} />
              </div>
            </div>
          </section>
        </div>
      </section>
    </AdminPageShell>
  );
}
