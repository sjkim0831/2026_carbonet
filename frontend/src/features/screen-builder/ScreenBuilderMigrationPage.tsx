import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  fetchScreenCommandPage,
  fetchScreenBuilderPage,
  fetchScreenBuilderPreview,
  fetchScreenBuilderComponentRegistryUsage,
  scanScreenBuilderRegistryDiagnostics,
  publishScreenBuilderDraft,
  readBootstrappedScreenBuilderPageData,
  addScreenBuilderNodeFromComponent,
  addScreenBuilderNodeTreeFromComponents,
  autoReplaceDeprecatedScreenBuilderComponents,
  deleteScreenBuilderComponentRegistryItem,
  remapScreenBuilderComponentRegistryUsage,
  registerScreenBuilderComponent,
  restoreScreenBuilderDraft,
  saveScreenBuilderDraft,
  updateScreenBuilderComponentRegistry,
  previewAutoReplaceDeprecatedScreenBuilderComponents,
  type ScreenBuilderAutoReplacePreviewItem,
  type ScreenBuilderComponentUsage,
  type ScreenBuilderComponentPromptSurface,
  type ScreenBuilderComponentRegistryItem,
  type ScreenBuilderRegistryScanItem,
  type ScreenCommandPagePayload,
  type ScreenBuilderEventBinding,
  type ScreenBuilderNode,
  type ScreenBuilderPagePayload,
  type ScreenBuilderPaletteItem
} from "../../lib/api/client";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { ContextKeyStrip } from "../admin-ui/ContextKeyStrip";
import { authorDesignContextKeys } from "../admin-ui/contextKeyPresets";
import { DiagnosticCard, GridToolbar, MemberButton, MemberButtonGroup, MemberIconButton, MemberLinkButton, PageStatusNotice } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { renderScreenBuilderNodePreview, resolveScreenBuilderQuery, sortScreenBuilderNodes } from "./screenBuilderRenderer";
import { buildSystemComponentCatalog, type SystemComponentCatalogType } from "./buttonCatalog";

function blankPropsFor(type: string): Record<string, unknown> {
  switch (type) {
    case "section":
      return { title: "새 섹션" };
    case "heading":
      return { text: "제목" };
    case "text":
      return { text: "설명 문구" };
    case "input":
      return { label: "입력 필드", placeholder: "값 입력", required: false };
    case "textarea":
      return { label: "긴 입력", placeholder: "상세 내용을 입력하세요.", required: false };
    case "select":
      return { label: "선택", placeholder: "옵션 선택", required: false };
    case "checkbox":
      return { label: "동의 항목", required: false };
    case "button":
      return { label: "버튼", variant: "primary" };
    case "table":
      return { title: "목록 테이블", columns: "번호|이름|상태", emptyText: "조회된 데이터가 없습니다." };
    case "pagination":
      return { summary: "1 / 1 페이지" };
    default:
      return {};
  }
}

function collectDescendantIds(nodes: ScreenBuilderNode[], nodeId: string): string[] {
  const children = nodes.filter((node) => (node.parentNodeId || "") === nodeId);
  return children.reduce<string[]>((acc, child) => {
    acc.push(child.nodeId);
    acc.push(...collectDescendantIds(nodes, child.nodeId));
    return acc;
  }, []);
}

function buildNodeTreeRows(nodes: ScreenBuilderNode[], collapsedNodeIds: Set<string>, parentNodeId = "", depth = 0): Array<{ node: ScreenBuilderNode; depth: number; hasChildren: boolean }> {
  return sortScreenBuilderNodes(nodes.filter((node) => (node.parentNodeId || "") === parentNodeId)).reduce<Array<{ node: ScreenBuilderNode; depth: number; hasChildren: boolean }>>((acc, node) => {
    const hasChildren = nodes.some((item) => (item.parentNodeId || "") === node.nodeId);
    acc.push({ node, depth, hasChildren });
    if (collapsedNodeIds.has(node.nodeId)) {
      return acc;
    }
    acc.push(...buildNodeTreeRows(nodes, collapsedNodeIds, node.nodeId, depth + 1));
    return acc;
  }, []);
}

function duplicateNodeTree(nodes: ScreenBuilderNode[], events: ScreenBuilderEventBinding[], sourceNodeId: string) {
  const descendants = [sourceNodeId, ...collectDescendantIds(nodes, sourceNodeId)];
  const idMap = new Map<string, string>();
  descendants.forEach((nodeId) => {
    idMap.set(nodeId, `${nodeId}-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  });
  const clonedNodes = sortScreenBuilderNodes(nodes)
    .filter((node) => descendants.includes(node.nodeId))
    .map((node, index) => ({
      ...node,
      nodeId: String(idMap.get(node.nodeId)),
      parentNodeId: node.parentNodeId && idMap.has(node.parentNodeId) ? String(idMap.get(node.parentNodeId)) : node.parentNodeId,
      sortOrder: nodes.length + index,
      props: { ...(node.props || {}) }
    }));
  const clonedEvents = events
    .filter((event) => idMap.has(event.nodeId))
    .map((event) => ({
      ...event,
      eventBindingId: `${event.eventBindingId}-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nodeId: String(idMap.get(event.nodeId)),
      actionConfig: { ...(event.actionConfig || {}) }
    }));
  return { clonedNodes, clonedEvents, topNodeId: String(idMap.get(sourceNodeId) || "") };
}

type AiNodeTreeInputRow = {
  componentId: string;
  alias: string;
  parentAlias: string;
  propsJson: string;
};

type BuilderTemplateType = "EDIT_PAGE" | "LIST_PAGE" | "DETAIL_PAGE" | "REVIEW_PAGE";

const supportedSystemCatalogTypes: SystemComponentCatalogType[] = ["button", "input", "select", "textarea", "table", "pagination"];

type TemplateOption = {
  value: BuilderTemplateType;
  label: string;
  labelEn: string;
  description: string;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { value: "LIST_PAGE", label: "목록형", labelEn: "List", description: "검색, 그리드, 페이지네이션, 행 액션 중심" },
  { value: "DETAIL_PAGE", label: "상세형", labelEn: "Detail", description: "요약, 상세 섹션, 상단/하단 이동 액션 중심" },
  { value: "EDIT_PAGE", label: "수정형", labelEn: "Edit", description: "입력 폼, 저장, 하단 액션바 중심" },
  { value: "REVIEW_PAGE", label: "검토형", labelEn: "Review", description: "검토 요약, 승인/반려, 하단 결정 액션 중심" }
];

const TEMPLATE_SLOT_RULES: Record<BuilderTemplateType, Record<string, string[]>> = {
  LIST_PAGE: {
    section: ["search_filters", "grid_toolbar", "content"],
    heading: ["search_filters", "grid_toolbar", "content"],
    text: ["grid_toolbar", "content"],
    input: ["search_filters", "content"],
    textarea: ["search_filters", "content"],
    select: ["search_filters", "content"],
    checkbox: ["search_filters", "content"],
    button: ["header_actions", "grid_toolbar_left", "grid_toolbar_right", "row_actions", "bottom_left_actions", "bottom_right_actions"],
    table: ["content"],
    pagination: ["pagination"]
  },
  DETAIL_PAGE: {
    section: ["summary", "content"],
    heading: ["summary", "content"],
    text: ["summary", "content"],
    input: ["content"],
    textarea: ["content"],
    select: ["content"],
    checkbox: ["content"],
    button: ["header_actions", "top_actions", "bottom_left_actions", "bottom_right_actions"],
    table: ["content"],
    pagination: ["bottom_right_actions"]
  },
  EDIT_PAGE: {
    section: ["summary", "content"],
    heading: ["summary", "content"],
    text: ["summary", "content"],
    input: ["content"],
    textarea: ["content"],
    select: ["content"],
    checkbox: ["content"],
    button: ["header_actions", "top_actions", "bottom_left_actions", "bottom_right_actions"],
    table: ["content"],
    pagination: ["bottom_right_actions"]
  },
  REVIEW_PAGE: {
    section: ["review_summary", "content"],
    heading: ["review_summary", "content"],
    text: ["review_summary", "content"],
    input: ["content"],
    textarea: ["content"],
    select: ["content"],
    checkbox: ["content"],
    button: ["header_actions", "review_actions", "bottom_left_actions", "bottom_right_actions"],
    table: ["content"],
    pagination: ["bottom_right_actions"]
  }
};

function resolveTemplateSlots(templateType: BuilderTemplateType, componentType: string) {
  return TEMPLATE_SLOT_RULES[templateType]?.[componentType] || ["content"];
}

function filterPaletteByTemplate(items: ScreenBuilderPaletteItem[], templateType: BuilderTemplateType) {
  return items.filter((item) => {
    if (templateType === "LIST_PAGE") {
      return true;
    }
    return item.componentType !== "table" && item.componentType !== "pagination";
  });
}

function buildTemplatePresetNodes(templateType: BuilderTemplateType, pageTitle: string): ScreenBuilderNode[] {
  const rootTitle = pageTitle || "Builder Page";
  if (templateType === "LIST_PAGE") {
    return sortScreenBuilderNodes([
      { nodeId: "root", parentNodeId: "", componentId: "", componentType: "page", slotName: "root", sortOrder: 0, props: { title: rootTitle } },
      { nodeId: "search-section", parentNodeId: "root", componentId: "", componentType: "section", slotName: "search_filters", sortOrder: 1, props: { title: "검색 조건" } },
      { nodeId: "search-heading", parentNodeId: "search-section", componentId: "", componentType: "heading", slotName: "search_filters", sortOrder: 2, props: { text: "검색" } },
      { nodeId: "search-input", parentNodeId: "search-section", componentId: "", componentType: "input", slotName: "search_filters", sortOrder: 3, props: { label: "검색어", placeholder: "검색어 입력" } },
      { nodeId: "search-button", parentNodeId: "search-section", componentId: "", componentType: "button", slotName: "grid_toolbar_right", sortOrder: 4, props: { label: "검색", variant: "primary" } },
      { nodeId: "toolbar-note", parentNodeId: "root", componentId: "", componentType: "text", slotName: "grid_toolbar_left", sortOrder: 5, props: { text: "총 건수 및 공통 목록 액션" } },
      { nodeId: "result-table", parentNodeId: "root", componentId: "", componentType: "table", slotName: "content", sortOrder: 6, props: { title: "목록", columns: "번호|이름|상태|관리", emptyText: "조회된 데이터가 없습니다." } },
      { nodeId: "result-pagination", parentNodeId: "root", componentId: "", componentType: "pagination", slotName: "pagination", sortOrder: 7, props: { summary: "1 / 1 페이지" } }
    ]);
  }
  if (templateType === "DETAIL_PAGE") {
    return sortScreenBuilderNodes([
      { nodeId: "root", parentNodeId: "", componentId: "", componentType: "page", slotName: "root", sortOrder: 0, props: { title: rootTitle } },
      { nodeId: "summary", parentNodeId: "root", componentId: "", componentType: "section", slotName: "summary", sortOrder: 1, props: { title: "요약" } },
      { nodeId: "summary-text", parentNodeId: "summary", componentId: "", componentType: "text", slotName: "summary", sortOrder: 2, props: { text: "상세 요약 정보" } },
      { nodeId: "detail-section", parentNodeId: "root", componentId: "", componentType: "section", slotName: "content", sortOrder: 3, props: { title: "상세 정보" } },
      { nodeId: "detail-heading", parentNodeId: "detail-section", componentId: "", componentType: "heading", slotName: "content", sortOrder: 4, props: { text: "상세 정보" } },
      { nodeId: "detail-actions", parentNodeId: "root", componentId: "", componentType: "button", slotName: "bottom_left_actions", sortOrder: 5, props: { label: "목록", variant: "secondary" } }
    ]);
  }
  if (templateType === "REVIEW_PAGE") {
    return sortScreenBuilderNodes([
      { nodeId: "root", parentNodeId: "", componentId: "", componentType: "page", slotName: "root", sortOrder: 0, props: { title: rootTitle } },
      { nodeId: "review-summary", parentNodeId: "root", componentId: "", componentType: "section", slotName: "review_summary", sortOrder: 1, props: { title: "검토 요약" } },
      { nodeId: "review-text", parentNodeId: "review-summary", componentId: "", componentType: "text", slotName: "review_summary", sortOrder: 2, props: { text: "검토 대상과 영향 요약" } },
      { nodeId: "review-section", parentNodeId: "root", componentId: "", componentType: "section", slotName: "content", sortOrder: 3, props: { title: "검토 내용" } },
      { nodeId: "approve-button", parentNodeId: "root", componentId: "", componentType: "button", slotName: "bottom_right_actions", sortOrder: 4, props: { label: "승인", variant: "primary" } },
      { nodeId: "reject-button", parentNodeId: "root", componentId: "", componentType: "button", slotName: "bottom_left_actions", sortOrder: 5, props: { label: "반려", variant: "secondary" } }
    ]);
  }
  return sortScreenBuilderNodes([
    { nodeId: "root", parentNodeId: "", componentId: "", componentType: "page", slotName: "root", sortOrder: 0, props: { title: rootTitle } },
    { nodeId: "summary", parentNodeId: "root", componentId: "", componentType: "section", slotName: "summary", sortOrder: 1, props: { title: "요약" } },
    { nodeId: "content-section", parentNodeId: "root", componentId: "", componentType: "section", slotName: "content", sortOrder: 2, props: { title: "기본 정보" } },
    { nodeId: "content-heading", parentNodeId: "content-section", componentId: "", componentType: "heading", slotName: "content", sortOrder: 3, props: { text: "기본 정보" } },
    { nodeId: "content-input", parentNodeId: "content-section", componentId: "", componentType: "input", slotName: "content", sortOrder: 4, props: { label: "필드명", placeholder: "값 입력" } },
    { nodeId: "save-button", parentNodeId: "root", componentId: "", componentType: "button", slotName: "bottom_right_actions", sortOrder: 5, props: { label: "저장", variant: "primary" } },
    { nodeId: "list-button", parentNodeId: "root", componentId: "", componentType: "button", slotName: "bottom_left_actions", sortOrder: 6, props: { label: "목록", variant: "secondary" } }
  ]);
}

function createAiNodeTreeInputRow(partial?: Partial<AiNodeTreeInputRow>): AiNodeTreeInputRow {
  return {
    componentId: partial?.componentId || "",
    alias: partial?.alias || "",
    parentAlias: partial?.parentAlias || "",
    propsJson: partial?.propsJson || "{}"
  };
}

function resolveButtonVariant(value: unknown): "primary" | "secondary" | "success" | "danger" | "dangerSecondary" | "info" | "ghost" {
  const variant = String(value || "secondary");
  if (variant === "primary" || variant === "secondary" || variant === "success" || variant === "danger" || variant === "dangerSecondary" || variant === "info" || variant === "ghost") {
    return variant;
  }
  return "secondary";
}

function resolveCatalogTitle(type: string, en: boolean) {
  switch (type) {
    case "button":
      return en ? "System Button Design Catalog" : "시스템 버튼 디자인 카탈로그";
    case "input":
      return en ? "System Input Catalog" : "시스템 입력 컴포넌트 카탈로그";
    case "select":
      return en ? "System Select Catalog" : "시스템 셀렉트 컴포넌트 카탈로그";
    case "textarea":
      return en ? "System Textarea Catalog" : "시스템 텍스트영역 카탈로그";
    case "table":
      return en ? "System Table Catalog" : "시스템 테이블 카탈로그";
    case "pagination":
      return en ? "System Pagination Catalog" : "시스템 페이지네이션 카탈로그";
    default:
      return en ? "System Component Catalog" : "시스템 컴포넌트 카탈로그";
  }
}

function resolveCatalogInventoryTitle(type: string, en: boolean) {
  switch (type) {
    case "button":
      return en ? "Button inventory" : "버튼 인벤토리";
    case "input":
      return en ? "Input inventory" : "입력 인벤토리";
    case "select":
      return en ? "Select inventory" : "셀렉트 인벤토리";
    case "textarea":
      return en ? "Textarea inventory" : "텍스트영역 인벤토리";
    case "table":
      return en ? "Table inventory" : "테이블 인벤토리";
    case "pagination":
      return en ? "Pagination inventory" : "페이지네이션 인벤토리";
    default:
      return en ? "Component inventory" : "컴포넌트 인벤토리";
  }
}

function renderSystemCatalogPreview(
  item: {
    componentType: string;
    componentName: string;
    variant?: string;
    size?: string;
    icon?: string;
    className?: string;
    label?: string;
    placeholder?: string;
  },
  en: boolean
) {
  if (item.componentType === "button") {
    if (item.componentName === "MemberLinkButton") {
      return (
        <MemberLinkButton href="#" onClick={(event) => event.preventDefault()} size={(item.size || "md") as "xs" | "sm" | "md" | "lg" | "icon"} variant={resolveButtonVariant(item.variant)}>
          {item.label || (en ? "Link" : "링크")}
        </MemberLinkButton>
      );
    }
    if (item.componentName === "MemberIconButton") {
      return <MemberIconButton icon={item.icon || "bolt"} size={(item.size || "icon") as "xs" | "sm" | "md" | "lg" | "icon"} variant={resolveButtonVariant(item.variant)} />;
    }
    return (
      <MemberButton size={(item.size || "md") as "xs" | "sm" | "md" | "lg" | "icon"} type="button" variant={resolveButtonVariant(item.variant)}>
        {item.label || (en ? "Button" : "버튼")}
      </MemberButton>
    );
  }
  if (item.componentType === "input") {
    return <input className={`gov-input w-full ${item.className || ""}`.trim()} placeholder={item.placeholder || (en ? "Input value" : "값 입력")} readOnly value="" />;
  }
  if (item.componentType === "select") {
    return (
      <select className={`gov-select w-full ${item.className || ""}`.trim()} defaultValue="">
        <option value="">{item.placeholder || (en ? "Select option" : "옵션 선택")}</option>
      </select>
    );
  }
  if (item.componentType === "textarea") {
    return <textarea className={`gov-textarea w-full ${item.className || ""}`.trim()} placeholder={item.placeholder || (en ? "Enter details" : "상세 내용을 입력하세요.")} readOnly rows={3} />;
  }
  if (item.componentType === "table") {
    return (
      <div className="overflow-hidden rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)]">
        <table className={`w-full text-sm ${item.className || ""}`.trim()}>
          <thead>
            <tr className="gov-table-header">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">{en ? "Name" : "이름"}</th>
              <th className="px-3 py-2">{en ? "Status" : "상태"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">1</td>
              <td className="px-3 py-2">{en ? "Sample row" : "샘플 행"}</td>
              <td className="px-3 py-2">{en ? "Ready" : "준비"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (item.componentType === "pagination") {
    return (
      <div className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-3 py-2 text-sm text-[var(--kr-gov-text-secondary)]">
        <span>{en ? "Prev" : "이전"}</span>
        <span className="rounded bg-[var(--kr-gov-bg-muted)] px-2 py-0.5 font-bold text-[var(--kr-gov-text-primary)]">1</span>
        <span>/ 5</span>
        <span>{en ? "Next" : "다음"}</span>
      </div>
    );
  }
  return <span className="text-sm text-[var(--kr-gov-text-secondary)]">{item.componentName}</span>;
}

export function ScreenBuilderMigrationPage() {
  const en = isEnglish();
  const initialQuery = useMemo(() => resolveScreenBuilderQuery({ get: getSearchParam }), []);
  const initialPayload = useMemo(() => readBootstrappedScreenBuilderPageData(), []);
  const pageState = useAsyncValue<ScreenBuilderPagePayload>(
    () => fetchScreenBuilderPage(initialQuery),
    [initialQuery.menuCode, initialQuery.pageId, initialQuery.menuTitle, initialQuery.menuUrl],
    {
      initialValue: initialPayload,
      skipInitialLoad: Boolean(initialPayload)
    }
  );
  const page = pageState.value;
  const commandState = useAsyncValue<ScreenCommandPagePayload>(
    () => (page?.pageId ? fetchScreenCommandPage(page.pageId) : Promise.resolve({ selectedPageId: "", pages: [], page: {} as ScreenCommandPagePayload["page"] })),
    [page?.pageId || ""],
    { enabled: Boolean(page?.pageId) }
  );
  const [nodes, setNodes] = useState<ScreenBuilderNode[]>([]);
  const [events, setEvents] = useState<ScreenBuilderEventBinding[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [dragNodeId, setDragNodeId] = useState("");
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewNodes, setPreviewNodes] = useState<ScreenBuilderNode[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewMode, setPreviewMode] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [selectedTemplateType, setSelectedTemplateType] = useState<BuilderTemplateType>("EDIT_PAGE");
  const [componentRegistry, setComponentRegistry] = useState<ScreenBuilderComponentRegistryItem[]>([]);
  const [selectedRegistryComponentId, setSelectedRegistryComponentId] = useState("");
  const [componentLabel, setComponentLabel] = useState("");
  const [componentDescription, setComponentDescription] = useState("");
  const [replacementComponentId, setReplacementComponentId] = useState("");
  const [registryStatusFilter, setRegistryStatusFilter] = useState<"ALL" | "ACTIVE" | "DEPRECATED">("ALL");
  const [registryTypeFilter, setRegistryTypeFilter] = useState("ALL");
  const [registryUsageRows, setRegistryUsageRows] = useState<ScreenBuilderComponentUsage[]>([]);
  const [registryUsagePreviewMap, setRegistryUsagePreviewMap] = useState<Record<string, ScreenBuilderComponentUsage[]>>({});
  const [registryUsageLoading, setRegistryUsageLoading] = useState(false);
  const [copiedButtonStyleId, setCopiedButtonStyleId] = useState("");
  const [registryEditorType, setRegistryEditorType] = useState("");
  const [registryEditorLabel, setRegistryEditorLabel] = useState("");
  const [registryEditorDescription, setRegistryEditorDescription] = useState("");
  const [registryEditorStatus, setRegistryEditorStatus] = useState("ACTIVE");
  const [registryEditorReplacementId, setRegistryEditorReplacementId] = useState("");
  const [registryEditorPropsJson, setRegistryEditorPropsJson] = useState("{}");
  const [registryScanRows, setRegistryScanRows] = useState<ScreenBuilderRegistryScanItem[]>([]);
  const [autoReplacePreviewItems, setAutoReplacePreviewItems] = useState<ScreenBuilderAutoReplacePreviewItem[]>([]);
  const [aiNodeTreeRows, setAiNodeTreeRows] = useState<AiNodeTreeInputRow[]>([
    createAiNodeTreeInputRow({
      componentId: "core.section",
      alias: "basicSection",
      propsJson: '{ "title": "AI 기본 섹션" }'
    }),
    createAiNodeTreeInputRow({
      componentId: "core.input",
      parentAlias: "basicSection",
      propsJson: '{ "label": "회사명", "placeholder": "회사명을 입력하세요." }'
    })
  ]);

  useEffect(() => {
    if (!page) {
      return;
    }
    setNodes(sortScreenBuilderNodes(page.nodes || []));
    setEvents(page.events || []);
    setSelectedNodeId((current) => {
      const available = new Set((page.nodes || []).map((item) => item.nodeId));
      if (current && available.has(current)) {
        return current;
      }
      return (page.nodes || [])[1]?.nodeId || (page.nodes || [])[0]?.nodeId || "";
    });
    setComponentRegistry(page.componentRegistry || []);
    setSelectedRegistryComponentId((current) => current || (page.componentRegistry || [])[0]?.componentId || "");
    setPreviewNodes(sortScreenBuilderNodes(page.nodes || []));
    setSelectedTemplateType(((page.templateType || "EDIT_PAGE") as BuilderTemplateType));
  }, [page]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.nodeId === selectedNodeId) || nodes[0] || null,
    [nodes, selectedNodeId]
  );
  const collapsedNodeIdSet = useMemo(() => new Set(collapsedNodeIds), [collapsedNodeIds]);
  const nodeTreeRows = useMemo(() => buildNodeTreeRows(nodes, collapsedNodeIdSet), [collapsedNodeIdSet, nodes]);
  const availableApis = useMemo(() => commandState.value?.page?.apis || [], [commandState.value]);
  const registryMap = useMemo(() => new Map(componentRegistry.map((item) => [item.componentId, item])), [componentRegistry]);
  const selectedRegistryComponent = useMemo(
    () => componentRegistry.find((item) => item.componentId === replacementComponentId) || null,
    [componentRegistry, replacementComponentId]
  );
  const selectedRegistryInventoryItem = useMemo(
    () => componentRegistry.find((item) => item.componentId === selectedRegistryComponentId) || null,
    [componentRegistry, selectedRegistryComponentId]
  );
  const backendUnregisteredNodes = page?.registryDiagnostics?.unregisteredNodes || [];
  const backendMissingNodes = page?.registryDiagnostics?.missingNodes || [];
  const backendDeprecatedNodes = page?.registryDiagnostics?.deprecatedNodes || [];
  const componentPromptSurface = page?.registryDiagnostics?.componentPromptSurface || [];
  const componentTypeOptions = useMemo(
    () => Array.from(new Set((page?.componentTypeOptions || componentRegistry.map((item) => item.componentType)).filter(Boolean))).sort((left, right) => String(left).localeCompare(String(right))),
    [componentRegistry, page?.componentTypeOptions]
  );
  const filteredComponentRegistry = useMemo(
    () => componentRegistry.filter((item) => {
      const matchesStatus = registryStatusFilter === "ALL" ? true : String(item.status || "ACTIVE") === registryStatusFilter;
      const matchesType = registryTypeFilter === "ALL" ? true : String(item.componentType || "") === registryTypeFilter;
      return matchesStatus && matchesType;
    }),
    [componentRegistry, registryStatusFilter, registryTypeFilter]
  );
  const systemComponentCatalog = useMemo(() => buildSystemComponentCatalog(), []);
  const selectedCatalogType = useMemo<SystemComponentCatalogType | "ALL" | "">(
    () => supportedSystemCatalogTypes.includes(registryTypeFilter as SystemComponentCatalogType)
      ? (registryTypeFilter as SystemComponentCatalogType)
      : registryTypeFilter === "ALL"
        ? "ALL"
        : "",
    [registryTypeFilter]
  );
  const filteredSystemCatalog = useMemo(
    () => selectedCatalogType === "ALL"
      ? systemComponentCatalog
      : selectedCatalogType
        ? systemComponentCatalog.filter((item) => item.componentType === selectedCatalogType)
        : [],
    [selectedCatalogType, systemComponentCatalog]
  );
  const systemCatalogInstances = useMemo(
    () => filteredSystemCatalog.flatMap((item) => item.instances.map((instance, index) => ({
      key: `${item.key}-${instance.route.routeId}-${instance.label || index}`,
      styleGroupId: item.styleGroupId,
      componentType: item.componentType,
      componentName: instance.componentName,
      variant: instance.variant,
      size: instance.size,
      className: instance.className,
      icon: instance.icon,
      label: instance.label,
      placeholder: instance.placeholder,
      summary: instance.summary,
      route: instance.route
    }))),
    [filteredSystemCatalog]
  );
  const uniqueUsageUrlsByComponent = useMemo(
    () => Object.fromEntries(
      Object.entries(registryUsagePreviewMap).map(([componentId, rows]) => [
        componentId,
        Array.from(new Set((rows || []).map((row) => String(row.menuUrl || "").trim()).filter(Boolean)))
      ])
    ),
    [registryUsagePreviewMap]
  );
  const publishIssueCount = backendUnregisteredNodes.length + backendMissingNodes.length + backendDeprecatedNodes.length;
  const publishReady = publishIssueCount === 0;
  const filteredPalette = useMemo(
    () => filterPaletteByTemplate(page?.componentPalette || [], selectedTemplateType),
    [page?.componentPalette, selectedTemplateType]
  );

  useEffect(() => {
    if (!selectedNode) {
      setComponentLabel("");
      setComponentDescription("");
      setReplacementComponentId("");
      return;
    }
    const linked = selectedNode.componentId ? registryMap.get(String(selectedNode.componentId)) : null;
    setComponentLabel(String(linked?.label || selectedNode.props?.label || selectedNode.props?.title || selectedNode.props?.text || ""));
    setComponentDescription(String(linked?.description || ""));
    setReplacementComponentId(String(selectedNode.componentId || ""));
  }, [registryMap, selectedNode]);

  useEffect(() => {
    if (!selectedRegistryInventoryItem) {
      setRegistryEditorType("");
      setRegistryEditorLabel("");
      setRegistryEditorDescription("");
      setRegistryEditorStatus("ACTIVE");
      setRegistryEditorReplacementId("");
      setRegistryEditorPropsJson("{}");
      setRegistryUsageRows([]);
      return;
    }
    setRegistryEditorType(String(selectedRegistryInventoryItem.componentType || ""));
    setRegistryEditorLabel(String(selectedRegistryInventoryItem.label || ""));
    setRegistryEditorDescription(String(selectedRegistryInventoryItem.description || ""));
    setRegistryEditorStatus(String(selectedRegistryInventoryItem.status || "ACTIVE"));
    setRegistryEditorReplacementId(String(selectedRegistryInventoryItem.replacementComponentId || ""));
    setRegistryEditorPropsJson(JSON.stringify(selectedRegistryInventoryItem.propsTemplate || {}, null, 2));
  }, [selectedRegistryInventoryItem]);

  useEffect(() => {
    if (!selectedRegistryComponentId) {
      setRegistryUsageRows([]);
      return;
    }
    let cancelled = false;
    setRegistryUsageLoading(true);
    fetchScreenBuilderComponentRegistryUsage(selectedRegistryComponentId)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setRegistryUsageRows(response.items || []);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setSaveError(error instanceof Error ? error.message : (en ? "Failed to load component usage." : "컴포넌트 사용 화면을 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!cancelled) {
          setRegistryUsageLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [en, selectedRegistryComponentId]);

  useEffect(() => {
    if (registryTypeFilter !== "button") {
      return;
    }
    const targetIds = filteredComponentRegistry
      .filter((item) => item.componentType === "button")
      .slice(0, 24)
      .map((item) => item.componentId)
      .filter(Boolean);
    const missingIds = targetIds.filter((componentId) => !registryUsagePreviewMap[componentId]);
    if (!missingIds.length) {
      return;
    }
    let cancelled = false;
    Promise.all(missingIds.map((componentId) => fetchScreenBuilderComponentRegistryUsage(componentId)))
      .then((responses) => {
        if (cancelled) {
          return;
        }
        setRegistryUsagePreviewMap((current) => {
          const next = { ...current };
          missingIds.forEach((componentId, index) => {
            next[componentId] = responses[index]?.items || [];
          });
          return next;
        });
      })
      .catch(() => {
        // Keep the gallery usable even if one preview lookup fails.
      });
    return () => {
      cancelled = true;
    };
  }, [filteredComponentRegistry, registryTypeFilter, registryUsagePreviewMap]);

  function updateNodeProps(nextProps: Record<string, unknown>) {
    if (!selectedNode) {
      return;
    }
    setNodes((current) => current.map((node) => node.nodeId === selectedNode.nodeId ? { ...node, props: nextProps } : node));
  }

  function updateSelectedNodeField(field: string, value: unknown) {
    const nextProps = { ...(selectedNode?.props || {}), [field]: value };
    updateNodeProps(nextProps);
  }

  function applyRegistryComponent(component: ScreenBuilderComponentRegistryItem) {
    if (!selectedNode || !component) {
      return;
    }
    setNodes((current) => current.map((node) => node.nodeId === selectedNode.nodeId
      ? {
        ...node,
        componentId: component.componentId,
        componentType: component.componentType || node.componentType,
        props: Object.keys(component.propsTemplate || {}).length
          ? { ...(component.propsTemplate || {}) }
          : { ...(node.props || {}) }
      }
      : node));
    setReplacementComponentId(component.componentId);
    setComponentLabel(component.label || "");
    setComponentDescription(component.description || "");
    setMessage(en ? `Applied component ${component.componentId}.` : `${component.componentId} 컴포넌트로 대체했습니다.`);
  }

  function addNode(item: ScreenBuilderPaletteItem) {
    const rootNode = nodes.find((node) => node.componentType === "page");
    const selected = selectedNode || rootNode || null;
    const canContainChildren = selected && (selected.componentType === "page" || selected.componentType === "section");
    const parentNodeId = item.componentType === "section"
      ? (rootNode?.nodeId || "root")
      : (canContainChildren ? selected?.nodeId : (selected?.parentNodeId || rootNode?.nodeId || "root"));
    const nextNodeId = `${item.componentType}-${Date.now()}`;
    const nextNode: ScreenBuilderNode = {
      nodeId: nextNodeId,
      componentId: "",
      parentNodeId,
      componentType: item.componentType,
      slotName: item.componentType === "button" ? "actions" : "content",
      sortOrder: nodes.length,
      props: blankPropsFor(item.componentType)
    };
    setNodes((current) => sortScreenBuilderNodes([...current, nextNode]).map((node, index) => ({ ...node, sortOrder: index })));
    setSelectedNodeId(nextNodeId);
  }

  function removeSelectedNode() {
    if (!selectedNode || selectedNode.componentType === "page") {
      return;
    }
    const removeIds = new Set([selectedNode.nodeId, ...collectDescendantIds(nodes, selectedNode.nodeId)]);
    const nextNodes = sortScreenBuilderNodes(nodes.filter((node) => !removeIds.has(node.nodeId))).map((node, index) => ({ ...node, sortOrder: index }));
    setNodes(nextNodes);
    setEvents((current) => current.filter((event) => !removeIds.has(event.nodeId)));
    setSelectedNodeId(nextNodes[1]?.nodeId || nextNodes[0]?.nodeId || "");
  }

  function duplicateSelectedNode() {
    if (!selectedNode || selectedNode.componentType === "page") {
      return;
    }
    const { clonedNodes, clonedEvents, topNodeId } = duplicateNodeTree(nodes, events, selectedNode.nodeId);
    setNodes((current) => sortScreenBuilderNodes([...current, ...clonedNodes]).map((node, index) => ({ ...node, sortOrder: index })));
    setEvents((current) => [...current, ...clonedEvents]);
    setSelectedNodeId(topNodeId);
  }

  function moveSelectedNode(direction: -1 | 1) {
    if (!selectedNode) {
      return;
    }
    const ordered = sortScreenBuilderNodes(nodes);
    const index = ordered.findIndex((node) => node.nodeId === selectedNode.nodeId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }
    const next = [...ordered];
    const [item] = next.splice(index, 1);
    next.splice(targetIndex, 0, item);
    setNodes(next.map((node, order) => ({ ...node, sortOrder: order })));
  }

  function reorderNodes(sourceNodeId: string, targetNodeId: string) {
    if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
      return;
    }
    const ordered = sortScreenBuilderNodes(nodes);
    const sourceIndex = ordered.findIndex((node) => node.nodeId === sourceNodeId);
    const targetIndex = ordered.findIndex((node) => node.nodeId === targetNodeId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }
    const next = [...ordered];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setNodes(next.map((node, index) => ({ ...node, sortOrder: index })));
  }

  function ensureSelectedEvent() {
    if (!selectedNode) {
      return null;
    }
    const existing = events.find((event) => event.nodeId === selectedNode.nodeId);
    if (existing) {
      return existing;
    }
    const nextEvent: ScreenBuilderEventBinding = {
      eventBindingId: `event-${Date.now()}`,
      nodeId: selectedNode.nodeId,
      eventName: "onClick",
      actionType: "navigate",
      actionConfig: { target: selectedNode.componentType === "button" ? "/admin/" : "" }
    };
    setEvents((current) => [...current, nextEvent]);
    return nextEvent;
  }

  const selectedEvent = useMemo(
    () => events.find((event) => event.nodeId === selectedNode?.nodeId) || null,
    [events, selectedNode]
  );
  const selectedApi = useMemo(
    () => availableApis.find((api) => api.apiId === String(selectedEvent?.actionConfig?.apiId || "")) || null,
    [availableApis, selectedEvent]
  );

  function updateSelectedEvent(field: "eventName" | "actionType", value: string) {
    if (!selectedNode) {
      return;
    }
    const base = ensureSelectedEvent();
    if (!base) {
      return;
    }
    setEvents((current) => current.map((event) => event.eventBindingId === base.eventBindingId ? { ...event, [field]: value } : event));
  }

  function updateSelectedEventTarget(value: string) {
    if (!selectedNode) {
      return;
    }
    const base = ensureSelectedEvent();
    if (!base) {
      return;
    }
    setEvents((current) => current.map((event) => event.eventBindingId === base.eventBindingId
      ? { ...event, actionConfig: { ...(event.actionConfig || {}), target: value } }
      : event));
  }

  function updateSelectedEventApi(apiId: string) {
    if (!selectedNode) {
      return;
    }
    const base = ensureSelectedEvent();
    if (!base) {
      return;
    }
    const selectedApi = availableApis.find((api) => api.apiId === apiId);
    setEvents((current) => current.map((event) => event.eventBindingId === base.eventBindingId
      ? {
        ...event,
        actionConfig: {
          ...(event.actionConfig || {}),
          apiId,
          endpoint: selectedApi?.endpoint || "",
          method: selectedApi?.method || ""
        }
      }
      : event));
  }

  function updateSelectedEventRequestMapping(fieldId: string, value: string) {
    if (!selectedNode) {
      return;
    }
    const base = ensureSelectedEvent();
    if (!base) {
      return;
    }
    setEvents((current) => current.map((event) => event.eventBindingId === base.eventBindingId
      ? {
        ...event,
        actionConfig: {
          ...(event.actionConfig || {}),
          requestMappings: {
            ...((event.actionConfig?.requestMappings as Record<string, string> | undefined) || {}),
            [fieldId]: value
          }
        }
      }
      : event));
  }

  function toggleCollapsedNode(nodeId: string) {
    setCollapsedNodeIds((current) => current.includes(nodeId) ? current.filter((item) => item !== nodeId) : [...current, nodeId]);
  }

  async function copyButtonStyleId(styleGroupId: string) {
    try {
      await navigator.clipboard.writeText(styleGroupId);
      setCopiedButtonStyleId(styleGroupId);
      window.setTimeout(() => {
        setCopiedButtonStyleId((current) => current === styleGroupId ? "" : current);
      }, 1500);
    } catch {
      setSaveError(en ? "Failed to copy button style id." : "버튼 스타일 ID를 복사하지 못했습니다.");
    }
  }

  function handleApplyTemplatePreset() {
    const nextNodes = buildTemplatePresetNodes(selectedTemplateType, page?.menuTitle || "");
    setNodes(nextNodes);
    setEvents([]);
    setSelectedNodeId(nextNodes[1]?.nodeId || nextNodes[0]?.nodeId || "");
    setMessage(en ? "Applied template preset." : "템플릿 프리셋을 적용했습니다.");
  }

  async function handleSave() {
    if (!page) {
      return;
    }
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const response = await saveScreenBuilderDraft({
        menuCode: page.menuCode,
        pageId: page.pageId,
        menuTitle: page.menuTitle,
        menuUrl: page.menuUrl,
        templateType: selectedTemplateType,
        nodes,
        events
      });
      setMessage(String(response.message || (en ? "Screen builder draft saved." : "화면 빌더 초안을 저장했습니다.")));
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to save screen builder draft." : "화면 빌더 저장 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePreviewRefresh(savedDraft = false) {
    if (!page) {
      return;
    }
    setPreviewLoading(true);
    setPreviewMessage("");
    try {
      const preview = await fetchScreenBuilderPreview({
        menuCode: page.menuCode,
        pageId: page.pageId,
        menuTitle: page.menuTitle,
        menuUrl: page.menuUrl,
        versionStatus: previewMode
      });
      setPreviewNodes(sortScreenBuilderNodes(preview.nodes || []));
      setPreviewMessage(savedDraft
        ? (en ? "Preview refreshed from the saved draft." : "저장된 초안 기준으로 미리보기를 갱신했습니다.")
        : (previewMode === "PUBLISHED"
          ? (en ? "Preview refreshed from the latest published snapshot." : "최근 publish 스냅샷 기준으로 미리보기를 갱신했습니다.")
          : (en ? "Preview refreshed." : "미리보기를 갱신했습니다.")));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to refresh preview." : "미리보기 갱신 중 오류가 발생했습니다."));
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleRestoreVersion(versionId: string) {
    if (!page?.menuCode || !versionId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const response = await restoreScreenBuilderDraft({
        menuCode: page.menuCode,
        versionId
      });
      setMessage(String(response.message || (en ? "Draft restored." : "초안을 복원했습니다.")));
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to restore draft." : "초안 복원 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!page?.menuCode) {
      return;
    }
    if (publishIssueCount > 0) {
      setSaveError(
        en
          ? `Publish is blocked until validation issues are resolved. Unregistered=${backendUnregisteredNodes.length}, Missing=${backendMissingNodes.length}, Deprecated=${backendDeprecatedNodes.length}`
          : `검증 이슈가 해결되기 전에는 Publish 할 수 없습니다. 미등록=${backendUnregisteredNodes.length}, 누락=${backendMissingNodes.length}, Deprecated=${backendDeprecatedNodes.length}`
      );
      return;
    }
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const response = await publishScreenBuilderDraft({ menuCode: page.menuCode });
      setMessage(String(response.message || (en ? "Published version snapshot created." : "publish 버전 스냅샷을 만들었습니다.")));
      await pageState.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to publish draft." : "초안 publish 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleRegisterSelectedComponent() {
    if (!page || !selectedNode || selectedNode.componentType === "page") {
      return;
    }
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      const response = await registerScreenBuilderComponent({
        menuCode: page.menuCode,
        pageId: page.pageId,
        nodeId: selectedNode.nodeId,
        componentType: selectedNode.componentType,
        label: componentLabel || String(selectedNode.props?.label || selectedNode.props?.title || selectedNode.props?.text || selectedNode.nodeId),
        description: componentDescription,
        propsTemplate: { ...(selectedNode.props || {}) }
      });
      setComponentRegistry((current) => {
        const next = current.filter((item) => item.componentId !== response.item.componentId);
        next.push(response.item);
        return next.sort((left, right) => String(left.componentId || "").localeCompare(String(right.componentId || "")));
      });
      setNodes((current) => current.map((node) => node.nodeId === selectedNode.nodeId
        ? { ...node, componentId: response.item.componentId }
        : node));
      setReplacementComponentId(response.item.componentId);
      setMessage(String(response.message || (en ? "Component registered." : "컴포넌트를 등록했습니다.")));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to register component." : "컴포넌트 등록 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  function handleReplaceSelectedComponent() {
    if (!selectedRegistryComponent || !selectedNode) {
      return;
    }
    applyRegistryComponent(selectedRegistryComponent);
  }

  async function handleDeprecateComponent(item: ScreenBuilderComponentRegistryItem) {
    if (!item?.componentId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await updateScreenBuilderComponentRegistry({
        componentId: item.componentId,
        status: "DEPRECATED",
        replacementComponentId: replacementComponentId || item.replacementComponentId || "",
        menuCode: page?.menuCode || ""
      });
      setComponentRegistry((current) => current.map((row) => row.componentId === response.item.componentId ? response.item : row));
      setMessage(String(response.message || (en ? "Component deprecated." : "컴포넌트를 deprecated 처리했습니다.")));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to update component." : "컴포넌트 수정 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRegistryItem() {
    if (!selectedRegistryInventoryItem?.componentId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const parsedProps = registryEditorPropsJson.trim() ? JSON.parse(registryEditorPropsJson) as Record<string, unknown> : {};
      const response = await updateScreenBuilderComponentRegistry({
        componentId: selectedRegistryInventoryItem.componentId,
        componentType: registryEditorType,
        label: registryEditorLabel,
        description: registryEditorDescription,
        status: registryEditorStatus,
        replacementComponentId: registryEditorReplacementId,
        propsTemplate: parsedProps,
        menuCode: page?.menuCode || ""
      });
      setComponentRegistry((current) => current.map((row) => row.componentId === response.item.componentId ? response.item : row));
      setMessage(String(response.message || (en ? "Component updated." : "컴포넌트를 수정했습니다.")));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to save component." : "컴포넌트 저장 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRegistryItem() {
    if (!selectedRegistryInventoryItem?.componentId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await deleteScreenBuilderComponentRegistryItem({
        componentId: selectedRegistryInventoryItem.componentId
      });
      setComponentRegistry((current) => current.filter((row) => row.componentId !== selectedRegistryInventoryItem.componentId));
      setSelectedRegistryComponentId((current) => current === selectedRegistryInventoryItem.componentId ? "" : current);
      setRegistryUsageRows([]);
      setMessage(String(response.message || (en ? "Component deleted." : "컴포넌트를 삭제했습니다.")));
      await pageState.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to delete component." : "컴포넌트 삭제 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemapRegistryUsage() {
    if (!selectedRegistryInventoryItem?.componentId || !registryEditorReplacementId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await remapScreenBuilderComponentRegistryUsage({
        fromComponentId: selectedRegistryInventoryItem.componentId,
        toComponentId: registryEditorReplacementId
      });
      setMessage(String(response.message || (en ? "Component usage remapped." : "컴포넌트 사용처를 재매핑했습니다.")));
      const usageResponse = await fetchScreenBuilderComponentRegistryUsage(selectedRegistryInventoryItem.componentId);
      setRegistryUsageRows(usageResponse.items || []);
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to remap component usage." : "컴포넌트 사용처 재매핑 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAutoReplaceDeprecated() {
    if (!page?.menuCode) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await autoReplaceDeprecatedScreenBuilderComponents({ menuCode: page.menuCode });
      setMessage(String(response.message || (en ? "Deprecated components replaced." : "deprecated 컴포넌트를 대체했습니다.")));
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to auto replace deprecated components." : "deprecated 컴포넌트 자동 대체 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePreviewAutoReplaceDeprecated() {
    if (!page?.menuCode) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await previewAutoReplaceDeprecatedScreenBuilderComponents({ menuCode: page.menuCode });
      setAutoReplacePreviewItems(response.items || []);
      setMessage(en ? "Loaded replacement diff preview." : "대체 diff 미리보기를 불러왔습니다.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to preview replacement diff." : "대체 diff 미리보기 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleScanRegistryDiagnostics() {
    setSaving(true);
    setSaveError("");
    try {
      const response = await scanScreenBuilderRegistryDiagnostics();
      setRegistryScanRows(response.items || []);
      setMessage(en ? "Registry diagnostics scanned." : "레지스트리 진단을 스캔했습니다.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to scan registry diagnostics." : "레지스트리 진단 스캔 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNodeFromComponent(componentId: string) {
    if (!page?.menuCode || !componentId) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await addScreenBuilderNodeFromComponent({
        menuCode: page.menuCode,
        componentId,
        parentNodeId: selectedNode?.nodeId || ""
      });
      setMessage(String(response.message || (en ? "Node added from component." : "컴포넌트로 노드를 추가했습니다.")));
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to add node from component." : "컴포넌트 노드 추가 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNodeTreeFromAiSurface() {
    if (!page?.menuCode) {
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const parsed = aiNodeTreeRows.map((row) => ({
        componentId: row.componentId.trim(),
        alias: row.alias.trim() || undefined,
        parentAlias: row.parentAlias.trim() || undefined,
        props: row.propsJson.trim() ? JSON.parse(row.propsJson) as Record<string, unknown> : {}
      })).filter((row) => row.componentId);
      const response = await addScreenBuilderNodeTreeFromComponents({
        menuCode: page.menuCode,
        items: parsed
      });
      setMessage(String(response.message || (en ? "Node tree added from AI component contracts." : "AI 컴포넌트 계약으로 노드 트리를 추가했습니다.")));
      await pageState.reload();
      await handlePreviewRefresh(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : (en ? "Failed to add node tree from AI component contracts." : "AI 컴포넌트 계약 노드 트리 추가 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  }

  function updateAiNodeTreeRow(index: number, field: keyof AiNodeTreeInputRow, value: string) {
    setAiNodeTreeRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  }

  function addAiNodeTreeRow() {
    setAiNodeTreeRows((current) => [...current, createAiNodeTreeInputRow()]);
  }

  function removeAiNodeTreeRow(index: number) {
    setAiNodeTreeRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  const selectedNodeProps = selectedNode?.props || {};
  const rootMenuHref = buildLocalizedPath("/admin/system/environment-management", "/en/admin/system/environment-management");

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment Management" : "메뉴 통합 관리", href: rootMenuHref },
        { label: en ? "Screen Builder" : "화면 빌더" }
      ]}
      title={en ? "Screen Builder" : "화면 빌더"}
      subtitle={en ? "Build a page draft from menu metadata, reusable components, and lightweight event bindings." : "메뉴 메타데이터를 기준으로 컴포넌트와 이벤트 연결을 조합해 화면 초안을 구성합니다."}
      contextStrip={
        <ContextKeyStrip items={authorDesignContextKeys} />
      }
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading screen builder..." : "화면 빌더를 불러오는 중입니다."}
    >
      {pageState.error || saveError ? (
        <PageStatusNotice tone="error">
          {pageState.error || saveError}
        </PageStatusNotice>
      ) : null}
      {message ? (
        <PageStatusNotice tone="success">
          {message}
        </PageStatusNotice>
      ) : null}
      <AdminWorkspacePageFrame>
        <DiagnosticCard
          actions={(
            <>
              {page?.menuCode ? (
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/environment-management?menuCode=${encodeURIComponent(page.menuCode)}`,
                    `/en/admin/system/environment-management?menuCode=${encodeURIComponent(page.menuCode)}`
                  )}
                  variant="secondary"
                >
                  {en ? "Open Environment Management" : "환경관리 열기"}
                </MemberLinkButton>
              ) : null}
              {page?.menuCode ? (
                <MemberLinkButton
                  href={buildLocalizedPath(
                    `/admin/system/screen-runtime?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`,
                    `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(page.menuCode)}&pageId=${encodeURIComponent(page.pageId || "")}&menuTitle=${encodeURIComponent(page.menuTitle || "")}&menuUrl=${encodeURIComponent(page.menuUrl || "")}`
                  )}
                  variant="secondary"
                >
                  {en ? "Open Published Runtime" : "발행 런타임 열기"}
                </MemberLinkButton>
              ) : null}
              <MemberButton disabled={!page?.menuCode || saving} onClick={() => { void handleSave(); }} variant="primary">
                {saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Draft" : "초안 저장")}
              </MemberButton>
              <MemberButton disabled={!page?.menuCode || saving || publishIssueCount > 0} onClick={() => { void handlePublish(); }} variant="info">
                {saving ? (en ? "Working..." : "처리 중...") : (en ? "Publish Snapshot" : "Publish 스냅샷")}
              </MemberButton>
              <MemberButton disabled={!page?.menuCode || previewLoading} onClick={() => { void handlePreviewRefresh(false); }} variant="secondary">
                {previewLoading ? (en ? "Refreshing..." : "갱신 중...") : (en ? "Refresh Preview" : "미리보기 갱신")}
              </MemberButton>
            </>
          )}
          description={page?.screenBuilderMessage || (en ? "Use this MVP builder to create a schema-first page draft before moving into full runtime rendering." : "이 MVP 빌더로 schema 중심 초안을 먼저 만들고, 이후 runtime 렌더링 단계로 이어갑니다.")}
          eyebrow={page?.templateType || "EDIT_PAGE"}
          status={publishReady ? (en ? "READY" : "준비 완료") : (en ? "BLOCKED" : "차단")}
          statusTone={publishReady ? "healthy" : "danger"}
          summary={(
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">Menu Code</p>
                <p className="mt-2 font-mono text-sm">{page?.menuCode || "-"}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">pageId</p>
                <p className="mt-2 font-mono text-sm">{page?.pageId || "-"}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Nodes" : "노드 수"}</p>
                <p className="mt-2 text-lg font-black">{nodes.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Events" : "이벤트 수"}</p>
                <p className="mt-2 text-lg font-black">{events.length}</p>
              </div>
              <div className={`rounded-lg border px-4 py-3 ${publishReady ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <p className={`text-xs font-bold ${publishReady ? "text-emerald-800" : "text-red-800"}`}>{en ? "Publish Readiness" : "Publish 준비 상태"}</p>
                <p className={`mt-2 text-lg font-black ${publishReady ? "text-emerald-900" : "text-red-900"}`}>
                  {publishReady
                    ? (en ? "Ready to publish" : "Publish 가능")
                    : (en ? `${publishIssueCount} issues block publish` : `${publishIssueCount}건 이슈로 Publish 차단`)}
                </p>
              </div>
            </div>
          )}
          title={page?.menuTitle || (en ? "Select a page menu first" : "먼저 페이지 메뉴를 선택하세요")}
        />
        {page?.publishedVersionId ? (
          <section className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {en ? "Latest published version" : "최근 publish 버전"}: <span className="font-mono">{page.publishedVersionId}</span>
            {page.publishedSavedAt ? ` / ${page.publishedSavedAt}` : ""}
          </section>
        ) : null}
        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            actions={(
              <MemberButtonGroup>
                <MemberButton disabled={saving} onClick={handleApplyTemplatePreset} size="xs" type="button" variant="secondary">
                  {en ? "Apply template preset" : "템플릿 프리셋 적용"}
                </MemberButton>
              </MemberButtonGroup>
            )}
            meta={en ? "Choose a page type first so palette, slot positions, and AI component usage stay consistent." : "먼저 페이지 타입을 선택해 팔레트, 버튼 위치, AI 컴포넌트 사용 규칙을 일관되게 맞춥니다."}
            title={en ? "Template Type" : "템플릿 타입"}
          />
          <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-4">
            {TEMPLATE_OPTIONS.map((option) => {
              const active = selectedTemplateType === option.value;
              return (
                <button
                  key={option.value}
                  className={`rounded-[var(--kr-gov-radius)] border px-4 py-4 text-left ${active ? "border-[var(--kr-gov-blue)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white hover:bg-gray-50"}`}
                  onClick={() => setSelectedTemplateType(option.value)}
                  type="button"
                >
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{option.value}</p>
                  <p className="mt-2 text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? option.labelEn : option.label}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--kr-gov-text-secondary)]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DiagnosticCard
            description={en ? "Nodes without a linked componentId can be registered as reusable components or replaced with an existing one." : "componentId가 없는 노드는 재사용 컴포넌트로 등록하거나 기존 컴포넌트로 대체할 수 있습니다."}
            status={String(backendUnregisteredNodes.length)}
            statusTone={backendUnregisteredNodes.length ? "warning" : "healthy"}
            title={en ? "Unregistered reusable candidates" : "미등록 재사용 후보"}
          />
          <DiagnosticCard
            description={en ? "Nodes that reference missing componentIds should be replaced or the registry item should be restored." : "없는 componentId를 참조하는 노드는 대체하거나 레지스트리 항목을 복구해야 합니다."}
            status={String(backendMissingNodes.length + backendDeprecatedNodes.length)}
            statusTone={backendMissingNodes.length + backendDeprecatedNodes.length ? "danger" : "healthy"}
            title={en ? "Broken registry references" : "깨진 레지스트리 참조"}
          />
          <DiagnosticCard
            description={en ? "System and custom components that the AI or operators can target by componentId." : "운영자와 AI가 componentId로 재사용할 수 있는 시스템/커스텀 컴포넌트 목록입니다."}
            status={String(componentRegistry.length)}
            statusTone="neutral"
            title={en ? "Registered components" : "등록 컴포넌트 수"}
          />
        </section>

        {filteredSystemCatalog.length ? (
          <section className="gov-card p-0 overflow-hidden">
            <GridToolbar
              meta={en
                ? `${filteredSystemCatalog.length} detected styles / ${systemCatalogInstances.length} total component uses across React pages.`
                : `React 화면 기준 감지 스타일 ${filteredSystemCatalog.length}종 / 전체 사용 ${systemCatalogInstances.length}건입니다.`}
              title={resolveCatalogTitle(selectedCatalogType || "button", en)}
            />
            <div className="border-t border-[var(--kr-gov-border-light)]">
              <GridToolbar
                meta={en ? `Every detected component use is listed below first. ${systemCatalogInstances.length} raw source-based instances.` : `아래에 감지된 컴포넌트 사용 인스턴스를 먼저 모두 나열합니다. 원본 기준 ${systemCatalogInstances.length}건입니다.`}
                title={en ? "All Component Usage Instances" : "전체 컴포넌트 사용 인스턴스"}
              />
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="gov-table-header">
                      <th className="px-4 py-3">styleGroupId</th>
                      <th className="px-4 py-3">{en ? "Preview" : "프리뷰"}</th>
                      <th className="px-4 py-3">{en ? "Component" : "컴포넌트"}</th>
                      <th className="px-4 py-3">{en ? "Label" : "라벨"}</th>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">{en ? "Open" : "열기"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {systemCatalogInstances.map((item) => (
                      <tr key={item.key}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <span className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{item.styleGroupId}</span>
                            <MemberButton onClick={() => { void copyButtonStyleId(item.styleGroupId); }} size="xs" type="button" variant="secondary">
                              {copiedButtonStyleId === item.styleGroupId ? (en ? "Copied" : "복사됨") : (en ? "Copy" : "복사")}
                            </MemberButton>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {renderSystemCatalogPreview(item, en)}
                        </td>
                        <td className="px-4 py-3 text-[12px]">
                          <div className="font-semibold text-[var(--kr-gov-text-primary)]">{item.componentName}</div>
                          <div className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">
                            {item.componentType}
                            {item.variant ? ` / ${item.variant}` : ""}
                            {item.size ? ` / ${item.size}` : ""}
                            {item.className ? ` / class=${item.className}` : ""}
                            {item.icon ? ` / icon=${item.icon}` : ""}
                            {item.placeholder ? ` / placeholder=${item.placeholder}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.label || item.placeholder || "-"}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{item.route.koPath}</td>
                        <td className="px-4 py-3">
                          <MemberLinkButton href={buildLocalizedPath(item.route.koPath, item.route.enPath)} size="xs" variant="secondary">
                            {en ? "Open" : "열기"}
                          </MemberLinkButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border-t border-[var(--kr-gov-border-light)]">
              <GridToolbar
                meta={en ? "Grouped styles are summarized below. Same variant with different className, icon, or placeholder is separated." : "아래는 묶어서 본 스타일 요약입니다. 같은 variant여도 className, icon, placeholder가 다르면 별도 스타일로 분리합니다."}
                title={en ? "Grouped Component Styles" : "그룹형 컴포넌트 스타일 요약"}
              />
              <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-2">
                {filteredSystemCatalog.map((item) => (
                  <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4" key={item.key}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{item.componentType}</p>
                        <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{item.componentName}</p>
                        <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">
                          {[item.variant, item.size, item.placeholder].filter(Boolean).join(" / ") || (en ? "base style" : "기본 스타일")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">
                          {en ? `${item.instanceCount} uses` : `${item.instanceCount}회 사용`}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                          {en ? `${item.routeCount} screens` : `${item.routeCount}개 화면`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-bg-muted)] px-3 py-4">
                      {renderSystemCatalogPreview(item, en)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 font-mono text-indigo-800">{item.styleGroupId}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-slate-700">{item.componentName}</span>
                      {item.className ? <span className="rounded-full bg-amber-50 px-2 py-1 font-mono text-amber-800">class: {item.className}</span> : null}
                      {item.icon ? <span className="rounded-full bg-emerald-50 px-2 py-1 font-mono text-emerald-800">icon: {item.icon}</span> : null}
                      {item.placeholder ? <span className="rounded-full bg-cyan-50 px-2 py-1 font-mono text-cyan-800">placeholder: {item.placeholder}</span> : null}
                    </div>
                    <div className="mt-3">
                      <MemberButton onClick={() => { void copyButtonStyleId(item.styleGroupId); }} size="xs" type="button" variant="secondary">
                        {copiedButtonStyleId === item.styleGroupId ? (en ? "Copied" : "복사됨") : (en ? "Copy styleGroupId" : "styleGroupId 복사")}
                      </MemberButton>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={publishReady
              ? (en ? "All registry validation issues are cleared. Publish can run now." : "레지스트리 검증 이슈가 없습니다. 지금 Publish 할 수 있습니다.")
              : (en ? "Publish runs only when all registry validation issues are cleared." : "레지스트리 검증 이슈가 모두 없어야 Publish 됩니다.")}
            title={en ? "Publish Validation Report" : "Publish 검증 리포트"}
          />
          <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-3">
            <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-amber-800">{en ? "Unregistered" : "미등록"}</p>
              <p className="mt-2 text-2xl font-black text-amber-900">{backendUnregisteredNodes.length}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-red-800">{en ? "Missing" : "누락"}</p>
              <p className="mt-2 text-2xl font-black text-red-900">{backendMissingNodes.length}</p>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-rose-800">Deprecated</p>
              <p className="mt-2 text-2xl font-black text-rose-900">{backendDeprecatedNodes.length}</p>
            </div>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            actions={(
              <MemberButtonGroup>
                <MemberButton disabled={!backendDeprecatedNodes.length || saving} onClick={() => { void handlePreviewAutoReplaceDeprecated(); }} size="xs" type="button" variant="secondary">
                  {en ? "Preview replace diff" : "대체 diff 미리보기"}
                </MemberButton>
                <MemberButton disabled={!backendDeprecatedNodes.length || saving} onClick={() => { void handleAutoReplaceDeprecated(); }} size="xs" type="button" variant="secondary">
                  {en ? "Auto replace deprecated" : "Deprecated 자동 대체"}
                </MemberButton>
                <MemberButton disabled={saving} onClick={() => { void handleScanRegistryDiagnostics(); }} size="xs" type="button" variant="secondary">
                  {en ? "Scan all drafts" : "전체 draft 스캔"}
                </MemberButton>
                <label className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-2 py-1 text-xs text-[var(--kr-gov-text-secondary)]">
                  <span>{en ? "Type" : "종류"}</span>
                  <select className="bg-transparent text-xs outline-none" value={registryTypeFilter} onChange={(event) => setRegistryTypeFilter(event.target.value)}>
                    <option value="ALL">{en ? "All" : "전체"}</option>
                    {componentTypeOptions.map((item) => (
                      <option key={`registry-type-${item}`} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <MemberButton onClick={() => setRegistryStatusFilter("ALL")} size="xs" type="button" variant={registryStatusFilter === "ALL" ? "primary" : "secondary"}>
                  {en ? "All" : "전체"}
                </MemberButton>
                <MemberButton onClick={() => setRegistryStatusFilter("ACTIVE")} size="xs" type="button" variant={registryStatusFilter === "ACTIVE" ? "primary" : "secondary"}>
                  ACTIVE
                </MemberButton>
                <MemberButton onClick={() => setRegistryStatusFilter("DEPRECATED")} size="xs" type="button" variant={registryStatusFilter === "DEPRECATED" ? "primary" : "secondary"}>
                  DEPRECATED
                </MemberButton>
              </MemberButtonGroup>
            )}
            meta={en ? `${componentRegistry.length} registry items / ${backendUnregisteredNodes.length} unregistered candidates` : `레지스트리 ${componentRegistry.length}건 / 미등록 후보 ${backendUnregisteredNodes.length}건`}
            title={en ? "Component Registry Inventory" : "컴포넌트 레지스트리 인벤토리"}
          />
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-3">
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
              <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Unregistered nodes" : "미등록 노드"}</p>
              <div className="mt-3 space-y-2">
                {backendUnregisteredNodes.length ? backendUnregisteredNodes.map((node) => (
                  <button
                    className="w-full rounded border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-100"
                    key={`unregistered-${node.nodeId}`}
                    onClick={() => setSelectedNodeId(node.nodeId)}
                    type="button"
                  >
                    <span className="font-mono text-[11px]">{node.componentType}</span>
                    <span className="ml-2">{node.label}</span>
                  </button>
                )) : (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No unregistered nodes." : "미등록 노드가 없습니다."}</p>
                )}
              </div>
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
              <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Broken references" : "깨진 참조"}</p>
              <div className="mt-3 space-y-2">
                {[...backendMissingNodes, ...backendDeprecatedNodes].length ? [...backendMissingNodes, ...backendDeprecatedNodes].map((node) => (
                  <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-800" key={`broken-${node.nodeId}`}>
                    <button className="w-full text-left" onClick={() => setSelectedNodeId(node.nodeId)} type="button">
                      <span className="font-mono text-[11px]">{String(node.componentId || "-")}</span>
                      <span className="ml-2">{node.label}</span>
                    </button>
                    {node.replacementComponentId ? (
                      <div className="mt-2 text-[11px] text-red-700">
                        {en ? "Suggested replacement" : "권장 대체"}: <span className="font-mono">{node.replacementComponentId}</span>
                      </div>
                    ) : null}
                  </div>
                )) : (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No broken references." : "깨진 참조가 없습니다."}</p>
                )}
              </div>
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">
                  {selectedCatalogType && selectedCatalogType !== "ALL"
                    ? resolveCatalogInventoryTitle(selectedCatalogType, en)
                    : (en ? "Registered components" : "등록 컴포넌트")}
                </p>
                {selectedCatalogType && selectedCatalogType !== "ALL" ? (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    {en ? `${systemCatalogInstances.length} detected` : `${systemCatalogInstances.length}건 감지`}
                  </span>
                ) : null}
              </div>
              {selectedCatalogType && selectedCatalogType !== "ALL" ? (
                <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-blue-900">
                  {en
                    ? "This area shows all detected component usage instances in the current system first. Registered components are listed below as a secondary section."
                    : "이 영역은 현재 시스템에서 감지된 전체 컴포넌트 사용 인스턴스를 먼저 보여주고, 등록된 컴포넌트는 아래 보조 섹션으로 보여줍니다."}
                </div>
              ) : null}
              {selectedCatalogType && selectedCatalogType !== "ALL" ? (
                <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-bg-muted)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                      {en ? "All Component Usage Instances" : "전체 컴포넌트 사용 인스턴스"}
                    </p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--kr-gov-text-secondary)]">
                      {en ? `${systemCatalogInstances.length} items` : `${systemCatalogInstances.length}건`}
                    </span>
                  </div>
                  <div className="mt-3 max-h-[260px] space-y-2 overflow-auto">
                    {systemCatalogInstances.length ? systemCatalogInstances.slice(0, 80).map((item) => (
                      <div className="rounded border border-[var(--kr-gov-border-light)] bg-white px-3 py-3" key={item.key}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--kr-gov-text-primary)]">
                              {item.label || (en ? "Button" : "버튼")} · {item.route.label}
                            </p>
                            <p className="truncate font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{item.route.koPath}</p>
                          </div>
                          <MemberLinkButton href={buildLocalizedPath(item.route.koPath, item.route.enPath)} size="xs" variant="secondary">
                            {en ? "Open" : "열기"}
                          </MemberLinkButton>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {renderSystemCatalogPreview(item, en)}
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] text-indigo-800">{item.styleGroupId}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700">{item.componentName}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="rounded border border-dashed border-[var(--kr-gov-border-light)] bg-white px-3 py-4 text-sm text-[var(--kr-gov-text-secondary)]">
                        {en ? "No component usage instances were detected." : "감지된 컴포넌트 사용 인스턴스가 없습니다."}
                      </p>
                    )}
                    {systemCatalogInstances.length > 80 ? (
                      <p className="text-[11px] text-[var(--kr-gov-text-secondary)]">
                        {en ? `+ ${systemCatalogInstances.length - 80} more component instances are listed in the catalog section below.` : `외 ${systemCatalogInstances.length - 80}건은 아래 카탈로그 섹션에서 계속 볼 수 있습니다.`}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {selectedCatalogType && selectedCatalogType !== "ALL" ? (
                <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                      {en ? "Registered components" : "등록된 컴포넌트"}
                    </p>
                    <span className="rounded-full bg-[var(--kr-gov-bg-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--kr-gov-text-secondary)]">
                      {filteredComponentRegistry.length}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--kr-gov-text-secondary)]">
                    {en
                      ? "This list is the DB-backed registry. It can be smaller than the detected system component inventory above."
                      : "이 목록은 DB 기반 레지스트리라서, 위의 시스템 컴포넌트 인벤토리보다 항목 수가 적을 수 있습니다."}
                  </p>
                </div>
              ) : null}
              <div className="mt-3 max-h-[280px] space-y-2 overflow-auto">
                {filteredComponentRegistry.map((item) => (
                  <div className="w-full rounded border border-[var(--kr-gov-border-light)] px-3 py-2 text-left text-sm" key={item.componentId}>
                    <button
                      className="w-full text-left hover:bg-gray-50"
                      onClick={() => {
                        setSelectedRegistryComponentId(item.componentId);
                        setReplacementComponentId(item.componentId);
                        if (selectedNode) {
                          setSelectedNodeId(selectedNode.nodeId);
                        }
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{item.componentId}</span>
                        <div className="flex items-center gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "DEPRECATED" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                            {item.status || "ACTIVE"}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.sourceType === "SYSTEM" ? "bg-slate-100 text-slate-700" : "bg-sky-100 text-sky-700"}`}>
                            {item.sourceType || "CUSTOM"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 font-semibold text-[var(--kr-gov-text-primary)]">{en ? (item.labelEn || item.label) : item.label}</p>
                      {item.description ? <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">{item.description}</p> : null}
                      {item.componentType === "button" ? (
                        <div className="mt-3 space-y-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-bg-muted)] px-3 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <MemberButton size="xs" type="button" variant={resolveButtonVariant(item.propsTemplate?.variant)}>
                              {String(item.propsTemplate?.label || item.label || (en ? "Button" : "버튼"))}
                            </MemberButton>
                            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] text-[var(--kr-gov-text-secondary)]">
                              variant: {String(item.propsTemplate?.variant || "secondary")}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-[var(--kr-gov-text-primary)]">{en ? "Included URLs" : "포함 URL"}</p>
                            {uniqueUsageUrlsByComponent[item.componentId]?.length ? uniqueUsageUrlsByComponent[item.componentId].slice(0, 4).map((menuUrl) => (
                              <p className="truncate font-mono text-[11px] text-[var(--kr-gov-text-secondary)]" key={`${item.componentId}-${menuUrl}`}>{menuUrl}</p>
                            )) : (
                              <p className="text-[11px] text-[var(--kr-gov-text-secondary)]">{en ? "No linked screen URLs yet." : "연결된 화면 URL이 아직 없습니다."}</p>
                            )}
                            {(uniqueUsageUrlsByComponent[item.componentId]?.length || 0) > 4 ? (
                              <p className="text-[11px] text-[var(--kr-gov-text-secondary)]">
                                {en ? `+ ${(uniqueUsageUrlsByComponent[item.componentId]?.length || 0) - 4} more URLs` : `외 ${(uniqueUsageUrlsByComponent[item.componentId]?.length || 0) - 4}건`}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                      <p className="mt-1 text-[11px] text-[var(--kr-gov-text-secondary)]">{en ? "Usage screens" : "사용 화면"}: {item.usageCount ?? 0}</p>
                      {item.replacementComponentId ? (
                        <p className="mt-1 font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">replacement: {item.replacementComponentId}</p>
                      ) : null}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <MemberButton disabled={item.sourceType === "SYSTEM" || item.status === "DEPRECATED"} onClick={() => { void handleDeprecateComponent(item); }} size="xs" type="button" variant="dangerSecondary">
                        {en ? "Deprecate" : "Deprecated 처리"}
                      </MemberButton>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={selectedRegistryInventoryItem
              ? `${selectedRegistryInventoryItem.componentId} / ${registryUsageRows.length}${en ? " usage rows" : "개 사용처"}`
              : (en ? "Select a registry component to inspect usage and replace mappings." : "레지스트리 컴포넌트를 선택하면 사용 화면과 대체 매핑을 확인할 수 있습니다.")}
            title={en ? "Registry Component Management" : "레지스트리 컴포넌트 관리"}
          />
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[0.92fr_1.08fr]">
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
              {selectedRegistryInventoryItem ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{selectedRegistryInventoryItem.componentId}</p>
                      <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? (selectedRegistryInventoryItem.labelEn || selectedRegistryInventoryItem.label) : selectedRegistryInventoryItem.label}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${registryEditorStatus === "DEPRECATED" ? "bg-amber-100 text-amber-800" : registryEditorStatus === "INACTIVE" ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {registryEditorStatus}
                    </span>
                  </div>
                  <label className="block">
                    <span className="gov-label">{en ? "Component Type" : "컴포넌트 종류"}</span>
                    <select className="gov-select" value={registryEditorType} onChange={(event) => setRegistryEditorType(event.target.value)}>
                      {componentTypeOptions.map((item) => (
                        <option key={`registry-editor-type-${item}`} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "Label" : "이름"}</span>
                    <input className="gov-input" value={registryEditorLabel} onChange={(event) => setRegistryEditorLabel(event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "Description" : "설명"}</span>
                    <textarea className="gov-input min-h-[90px] py-3" rows={4} value={registryEditorDescription} onChange={(event) => setRegistryEditorDescription(event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "Status" : "상태"}</span>
                    <select className="gov-select" value={registryEditorStatus} onChange={(event) => setRegistryEditorStatus(event.target.value)}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DEPRECATED">DEPRECATED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "Replacement Component" : "대체 컴포넌트"}</span>
                    <select className="gov-select" value={registryEditorReplacementId} onChange={(event) => setRegistryEditorReplacementId(event.target.value)}>
                      <option value="">{en ? "Select component" : "컴포넌트 선택"}</option>
                      {componentRegistry.filter((item) => item.componentId !== selectedRegistryInventoryItem.componentId).map((item) => (
                        <option key={`registry-replacement-${item.componentId}`} value={item.componentId}>
                          {item.componentId} / {en ? (item.labelEn || item.label) : item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "Props Template JSON" : "Props 템플릿 JSON"}</span>
                    <textarea className="gov-input min-h-[180px] py-3 font-mono text-[12px]" rows={8} value={registryEditorPropsJson} onChange={(event) => setRegistryEditorPropsJson(event.target.value)} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <MemberButton disabled={saving} onClick={() => { void handleSaveRegistryItem(); }} size="xs" type="button" variant="primary">
                      {en ? "Save component" : "컴포넌트 저장"}
                    </MemberButton>
                    <MemberButton disabled={saving || !registryEditorReplacementId} onClick={() => { void handleRemapRegistryUsage(); }} size="xs" type="button" variant="secondary">
                      {en ? "Remap usages" : "사용처 재매핑"}
                    </MemberButton>
                    <MemberButton disabled={saving || selectedRegistryInventoryItem.sourceType === "SYSTEM"} onClick={() => { void handleDeleteRegistryItem(); }} size="xs" type="button" variant="dangerSecondary">
                      {en ? "Delete if unused" : "미사용 시 삭제"}
                    </MemberButton>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a registry component from the inventory first." : "먼저 인벤토리에서 레지스트리 컴포넌트를 선택하세요."}</p>
              )}
            </article>
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white">
              <GridToolbar
                meta={registryUsageLoading ? (en ? "Loading usage..." : "사용 화면을 불러오는 중...") : (en ? `${registryUsageRows.length} usage rows` : `사용 화면 ${registryUsageRows.length}건`)}
                title={en ? "Screens Using This Component" : "이 컴포넌트를 사용하는 화면"}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="gov-table-header">
                      <th className="px-4 py-3">{en ? "Source" : "출처"}</th>
                      <th className="px-4 py-3">menuCode</th>
                      <th className="px-4 py-3">pageId</th>
                      <th className="px-4 py-3">{en ? "Title" : "메뉴명"}</th>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">{en ? "Zone / Node" : "영역 / 노드"}</th>
                      <th className="px-4 py-3">{en ? "Open" : "바로가기"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registryUsageRows.length ? registryUsageRows.map((row, index) => (
                      <tr key={`registry-usage-${row.usageSource}-${row.menuCode}-${row.pageId}-${row.nodeId || index}`}>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.usageSource === "PUBLISHED" ? "bg-blue-100 text-blue-800" : row.usageSource === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                            {row.usageSource}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px]">{row.menuCode || "-"}</td>
                        <td className="px-4 py-3">{row.pageId || "-"}</td>
                        <td className="px-4 py-3">{row.menuTitle || "-"}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{row.menuUrl || "-"}</td>
                        <td className="px-4 py-3 text-[12px] text-[var(--kr-gov-text-secondary)]">{row.layoutZone || row.nodeId || row.instanceKey || "-"}</td>
                        <td className="px-4 py-3">
                          {row.menuCode ? (
                            <div className="flex flex-wrap gap-2">
                              <MemberLinkButton href={buildLocalizedPath(`/admin/system/screen-builder?menuCode=${encodeURIComponent(row.menuCode)}&pageId=${encodeURIComponent(row.pageId || "")}&menuTitle=${encodeURIComponent(row.menuTitle || "")}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`, `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(row.menuCode)}&pageId=${encodeURIComponent(row.pageId || "")}&menuTitle=${encodeURIComponent(row.menuTitle || "")}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`)} variant="secondary">
                                {en ? "Builder" : "빌더"}
                              </MemberLinkButton>
                              {row.usageSource === "PUBLISHED" ? (
                                <MemberLinkButton href={buildLocalizedPath(`/admin/system/screen-runtime?menuCode=${encodeURIComponent(row.menuCode)}&pageId=${encodeURIComponent(row.pageId || "")}&menuTitle=${encodeURIComponent(row.menuTitle || "")}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`, `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(row.menuCode)}&pageId=${encodeURIComponent(row.pageId || "")}&menuTitle=${encodeURIComponent(row.menuTitle || "")}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`)} variant="secondary">
                                  {en ? "Runtime" : "런타임"}
                                </MemberLinkButton>
                              ) : null}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={7}>
                          {selectedRegistryInventoryItem
                            ? (en ? "No screen currently uses this component." : "현재 이 컴포넌트를 사용하는 화면이 없습니다.")
                            : (en ? "Select a registry component first." : "먼저 레지스트리 컴포넌트를 선택하세요.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={en ? `${autoReplacePreviewItems.length} replacement candidates` : `대체 후보 ${autoReplacePreviewItems.length}건`}
            title={en ? "Auto Replace Diff Preview" : "자동 대체 Diff 미리보기"}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">nodeId</th>
                  <th className="px-4 py-3">{en ? "Label" : "라벨"}</th>
                  <th className="px-4 py-3">{en ? "From" : "기존"}</th>
                  <th className="px-4 py-3">{en ? "To" : "대체"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {autoReplacePreviewItems.length ? autoReplacePreviewItems.map((item) => (
                  <tr key={`replace-preview-${item.nodeId}`}>
                    <td className="px-4 py-3 font-mono text-[12px]">{item.nodeId}</td>
                    <td className="px-4 py-3">{item.label}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-amber-800">{item.fromComponentId}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-emerald-800">{item.toComponentId}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={4}>
                      {en ? "Run preview diff to inspect deprecated replacements before applying them." : "deprecated 대체를 적용하기 전에 diff 미리보기를 실행하세요."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={en ? `${registryScanRows.length} drafts scanned` : `스캔된 draft ${registryScanRows.length}건`}
            title={en ? "All Draft Registry Scan" : "전체 Draft 레지스트리 스캔"}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">menuCode</th>
                  <th className="px-4 py-3">pageId</th>
                  <th className="px-4 py-3">{en ? "Title" : "메뉴명"}</th>
                  <th className="px-4 py-3">{en ? "Unregistered" : "미등록"}</th>
                  <th className="px-4 py-3">{en ? "Missing" : "누락"}</th>
                  <th className="px-4 py-3">{en ? "Deprecated" : "Deprecated"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registryScanRows.length ? registryScanRows.map((row) => (
                  <tr key={`scan-${row.menuCode}-${row.pageId}`}>
                    <td className="px-4 py-3 font-mono text-[12px]">{row.menuCode}</td>
                    <td className="px-4 py-3">{row.pageId}</td>
                    <td className="px-4 py-3">{row.menuTitle || "-"}</td>
                    <td className="px-4 py-3">{row.unregisteredCount}</td>
                    <td className="px-4 py-3">{row.missingCount}</td>
                    <td className="px-4 py-3">{row.deprecatedCount}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {en ? "Run a scan to inspect all builder drafts." : "전체 빌더 draft를 점검하려면 스캔을 실행하세요."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={en ? `${componentPromptSurface.length} prompt-ready contracts` : `AI 입력 계약 ${componentPromptSurface.length}건`}
            title={en ? "AI Component Prompt Surface" : "AI 컴포넌트 입력 표면"}
          />
          <div className="grid grid-cols-1 gap-4 p-6 xl:grid-cols-2">
            {componentPromptSurface.map((item: ScreenBuilderComponentPromptSurface) => (
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4" key={`prompt-${item.componentId}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs text-[var(--kr-gov-text-secondary)]">{item.componentId}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "DEPRECATED" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.status || "ACTIVE"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-[var(--kr-gov-text-primary)]">{item.label}</p>
                {item.description ? <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">{item.description}</p> : null}
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Allowed Props" : "허용 Props"}</p>
                <p className="mt-1 text-[12px] text-[var(--kr-gov-text-primary)]">{item.allowedPropKeys.join(", ") || "-"}</p>
                <div className="mt-3">
                  <MemberButton disabled={saving || item.status === "DEPRECATED"} onClick={() => { void handleAddNodeFromComponent(item.componentId); }} size="xs" type="button" variant="secondary">
                    {en ? "Add node from componentId" : "componentId로 노드 추가"}
                  </MemberButton>
                </div>
                <pre className="mt-3 overflow-x-auto rounded bg-slate-950 px-3 py-3 text-[11px] leading-5 text-slate-100">{JSON.stringify({
                  componentId: item.componentId,
                  componentType: item.componentType,
                  propsTemplate: item.propsTemplate
                }, null, 2)}</pre>
              </div>
            ))}
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            actions={(
              <MemberButton disabled={saving} onClick={() => { void handleAddNodeTreeFromAiSurface(); }} size="sm" type="button" variant="secondary">
                {en ? "Add node tree" : "노드 트리 추가"}
              </MemberButton>
            )}
            meta={en ? "Use componentId, alias, parentAlias, and props to append a node tree in one request." : "componentId, alias, parentAlias, props로 한 번에 노드 트리를 추가합니다."}
            title={en ? "AI Node Tree Input" : "AI 노드 트리 입력"}
          />
          <div className="space-y-4 p-6">
            {aiNodeTreeRows.map((row, index) => (
              <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4" key={`ai-row-${index}`}>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                  <label className="block">
                    <span className="gov-label">componentId</span>
                    <input className="gov-input font-mono" value={row.componentId} onChange={(event) => updateAiNodeTreeRow(index, "componentId", event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="gov-label">alias</span>
                    <input className="gov-input" value={row.alias} onChange={(event) => updateAiNodeTreeRow(index, "alias", event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="gov-label">{en ? "parentAlias" : "상위 alias"}</span>
                    <input className="gov-input" value={row.parentAlias} onChange={(event) => updateAiNodeTreeRow(index, "parentAlias", event.target.value)} />
                  </label>
                  <div className="flex items-end">
                    <MemberButton disabled={aiNodeTreeRows.length <= 1} onClick={() => removeAiNodeTreeRow(index)} size="xs" type="button" variant="dangerSecondary">
                      {en ? "Remove" : "제거"}
                    </MemberButton>
                  </div>
                </div>
                <label className="mt-4 block">
                  <span className="gov-label">props JSON</span>
                  <textarea
                    className="gov-input min-h-[120px] py-3 font-mono text-[12px]"
                    rows={5}
                    value={row.propsJson}
                    onChange={(event) => updateAiNodeTreeRow(index, "propsJson", event.target.value)}
                  />
                </label>
              </div>
            ))}
            <div className="flex justify-start">
              <MemberButton onClick={addAiNodeTreeRow} size="xs" type="button" variant="secondary">
                {en ? "Add Row" : "행 추가"}
              </MemberButton>
            </div>
            <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Generated Request Preview" : "생성 요청 미리보기"}</p>
              <pre className="mt-3 overflow-x-auto rounded bg-slate-950 px-3 py-3 text-[11px] leading-5 text-slate-100">{JSON.stringify(
                aiNodeTreeRows.map((row) => ({
                  componentId: row.componentId.trim(),
                  alias: row.alias.trim() || undefined,
                  parentAlias: row.parentAlias.trim() || undefined,
                  props: row.propsJson.trim()
                })),
                null,
                2
              )}</pre>
            </div>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            actions={<MemberButtonGroup>{filteredPalette.map((item) => (
              <MemberButton key={item.componentType} onClick={() => addNode(item)} size="xs" type="button" variant="secondary">
                {en ? (item.labelEn || item.label) : item.label}
              </MemberButton>
            ))}</MemberButtonGroup>}
            meta={en ? `${selectedTemplateType} palette. Append standardized blocks that match the selected page type.` : `${selectedTemplateType} 팔레트입니다. 선택한 페이지 타입에 맞는 표준 블록만 추가합니다.`}
            title={en ? "Component Palette" : "컴포넌트 팔레트"}
          />
          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white">
              <GridToolbar
                actions={(
                  <MemberButtonGroup>
                    <MemberIconButton disabled={!selectedNode || selectedNode.componentType === "page"} icon="arrow_upward" onClick={() => moveSelectedNode(-1)} type="button" />
                    <MemberIconButton disabled={!selectedNode || selectedNode.componentType === "page"} icon="arrow_downward" onClick={() => moveSelectedNode(1)} type="button" />
                    <MemberIconButton disabled={!selectedNode || selectedNode.componentType === "page"} icon="content_copy" onClick={duplicateSelectedNode} type="button" />
                    <MemberIconButton disabled={!selectedNode || selectedNode.componentType === "page"} icon="delete" onClick={removeSelectedNode} type="button" variant="dangerSecondary" />
                  </MemberButtonGroup>
                )}
                meta={en ? `${nodes.length} nodes in draft. Drag cards to reorder.` : `현재 초안 노드 ${nodes.length}개. 카드를 드래그해 순서를 바꿀 수 있습니다.`}
                title={en ? "Canvas Nodes" : "캔버스 노드"}
              />
              <div className="max-h-[680px] overflow-auto p-4">
                <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] bg-gray-50 px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Hierarchy" : "계층 트리"}</p>
                  <div className="mt-3 space-y-1">
                    {nodeTreeRows.map(({ node, depth, hasChildren }) => (
                      <div className="flex items-center gap-1" key={`tree-${node.nodeId}`} style={{ paddingLeft: `${depth * 16 + 8}px` }}>
                        <button
                          className={`flex h-6 w-6 items-center justify-center rounded ${hasChildren ? "hover:bg-white text-[var(--kr-gov-text-secondary)]" : "text-transparent"}`}
                          disabled={!hasChildren}
                          onClick={() => toggleCollapsedNode(node.nodeId)}
                          type="button"
                        >
                          {hasChildren ? (collapsedNodeIdSet.has(node.nodeId) ? "+" : "-") : "."}
                        </button>
                        <button
                          className={`flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${node.nodeId === selectedNode?.nodeId ? "bg-blue-100 text-[var(--kr-gov-blue)]" : "hover:bg-white text-[var(--kr-gov-text-primary)]"}`}
                          onClick={() => setSelectedNodeId(node.nodeId)}
                          type="button"
                        >
                          <span className="font-mono text-[10px] uppercase text-[var(--kr-gov-text-secondary)]">{node.componentType}</span>
                          <span className="truncate">{String(node.props?.label || node.props?.title || node.props?.text || node.nodeId)}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {sortScreenBuilderNodes(nodes).map((node) => {
                    const selected = node.nodeId === selectedNode?.nodeId;
                    return (
                      <button
                        className={`w-full rounded-[var(--kr-gov-radius)] border px-4 py-3 text-left ${selected ? "border-[var(--kr-gov-blue)] bg-blue-50" : "border-[var(--kr-gov-border-light)] bg-white hover:bg-gray-50"} ${dragNodeId === node.nodeId ? "opacity-60" : ""}`}
                        draggable={node.componentType !== "page"}
                        key={node.nodeId}
                        onClick={() => setSelectedNodeId(node.nodeId)}
                        onDragEnd={() => setDragNodeId("")}
                        onDragOver={(event) => {
                          if (node.componentType === "page") {
                            return;
                          }
                          event.preventDefault();
                        }}
                        onDragStart={() => setDragNodeId(node.nodeId)}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (node.componentType === "page") {
                            return;
                          }
                          reorderNodes(dragNodeId, node.nodeId);
                          setDragNodeId("");
                        }}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{node.componentType}</p>
                            <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{String(node.props?.label || node.props?.title || node.props?.text || node.nodeId)}</p>
                          </div>
                          <span className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{node.parentNodeId || "root"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>

            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white">
              <GridToolbar
                meta={selectedNode ? `${selectedNode.componentType} / ${selectedNode.nodeId}` : (en ? "Select a node" : "노드를 선택하세요")}
                title={en ? "Properties & Events" : "속성 및 이벤트"}
              />
              <div className="space-y-5 p-4">
                {selectedNode ? (
                  <>
                    {selectedNode.componentType === "section" ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Section Title" : "섹션 제목"}</span>
                        <input className="gov-input" value={String(selectedNodeProps.title || "")} onChange={(event) => updateSelectedNodeField("title", event.target.value)} />
                      </label>
                    ) : null}
                    {(selectedNode.componentType === "heading" || selectedNode.componentType === "text") ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Text" : "문구"}</span>
                        <textarea className="gov-input min-h-[110px] py-3" rows={4} value={String(selectedNodeProps.text || "")} onChange={(event) => updateSelectedNodeField("text", event.target.value)} />
                      </label>
                    ) : null}
                    {["input", "textarea", "select", "checkbox", "button"].includes(selectedNode.componentType) ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Label" : "라벨"}</span>
                        <input className="gov-input" value={String(selectedNodeProps.label || "")} onChange={(event) => updateSelectedNodeField("label", event.target.value)} />
                      </label>
                    ) : null}
                    {["input", "textarea", "select"].includes(selectedNode.componentType) ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Placeholder" : "플레이스홀더"}</span>
                        <input className="gov-input" value={String(selectedNodeProps.placeholder || "")} onChange={(event) => updateSelectedNodeField("placeholder", event.target.value)} />
                      </label>
                    ) : null}
                    {selectedNode.componentType === "button" ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Variant" : "버튼 종류"}</span>
                        <select className="gov-select" value={String(selectedNodeProps.variant || "primary")} onChange={(event) => updateSelectedNodeField("variant", event.target.value)}>
                          <option value="primary">primary</option>
                          <option value="secondary">secondary</option>
                        </select>
                      </label>
                    ) : null}
                    {selectedNode.componentType === "table" ? (
                      <>
                        <label className="block">
                          <span className="gov-label">{en ? "Table Title" : "테이블 제목"}</span>
                          <input className="gov-input" value={String(selectedNodeProps.title || "")} onChange={(event) => updateSelectedNodeField("title", event.target.value)} />
                        </label>
                        <label className="block">
                          <span className="gov-label">{en ? "Columns" : "컬럼"}</span>
                          <input className="gov-input" value={String(selectedNodeProps.columns || "")} onChange={(event) => updateSelectedNodeField("columns", event.target.value)} />
                        </label>
                        <label className="block">
                          <span className="gov-label">{en ? "Empty Text" : "빈 상태 문구"}</span>
                          <input className="gov-input" value={String(selectedNodeProps.emptyText || "")} onChange={(event) => updateSelectedNodeField("emptyText", event.target.value)} />
                        </label>
                      </>
                    ) : null}
                    {selectedNode.componentType === "pagination" ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Summary" : "요약 문구"}</span>
                        <input className="gov-input" value={String(selectedNodeProps.summary || "")} onChange={(event) => updateSelectedNodeField("summary", event.target.value)} />
                      </label>
                    ) : null}
                    {selectedNode.componentType !== "page" ? (
                      <label className="block">
                        <span className="gov-label">{en ? "Layout Slot" : "레이아웃 슬롯"}</span>
                        <select
                          className="gov-select"
                          value={String(selectedNode.slotName || resolveTemplateSlots(selectedTemplateType, selectedNode.componentType)[0] || "content")}
                          onChange={(event) => {
                            setNodes((current) => current.map((node) => node.nodeId === selectedNode.nodeId ? { ...node, slotName: event.target.value } : node));
                          }}
                        >
                          {resolveTemplateSlots(selectedTemplateType, selectedNode.componentType).map((slot) => (
                            <option key={`${selectedNode.nodeId}-${slot}`} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    {["input", "textarea", "select", "checkbox"].includes(selectedNode.componentType) ? (
                      <label className="flex items-center gap-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 px-4 py-3 text-sm font-medium text-[var(--kr-gov-text-primary)]">
                        <input checked={Boolean(selectedNodeProps.required)} onChange={(event) => updateSelectedNodeField("required", event.target.checked)} type="checkbox" />
                          <span>{en ? "Required field" : "필수 입력"}</span>
                      </label>
                    ) : null}

                    <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Component Registry" : "컴포넌트 레지스트리"}</p>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${selectedNode.componentId ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                          {selectedNode.componentId ? (en ? "Registered" : "등록됨") : (en ? "Unregistered" : "미등록")}
                        </span>
                      </div>
                      <div className="mt-4 space-y-4">
                        <label className="block">
                          <span className="gov-label">{en ? "Linked componentId" : "연결된 componentId"}</span>
                          <input className="gov-input font-mono" readOnly value={String(selectedNode.componentId || "")} />
                        </label>
                        <label className="block">
                          <span className="gov-label">{en ? "Registry label" : "레지스트리 이름"}</span>
                          <input className="gov-input" value={componentLabel} onChange={(event) => setComponentLabel(event.target.value)} />
                        </label>
                        <label className="block">
                          <span className="gov-label">{en ? "Description" : "설명"}</span>
                          <textarea className="gov-input min-h-[90px] py-3" rows={3} value={componentDescription} onChange={(event) => setComponentDescription(event.target.value)} />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <MemberButton disabled={saving || selectedNode.componentType === "page"} onClick={() => { void handleRegisterSelectedComponent(); }} size="xs" type="button" variant="secondary">
                            {en ? "Register selected node" : "선택 노드 등록"}
                          </MemberButton>
                          <MemberButton disabled={!selectedNode.componentId} onClick={() => {
                            if (!selectedNode) {
                              return;
                            }
                            setNodes((current) => current.map((node) => node.nodeId === selectedNode.nodeId ? { ...node, componentId: "" } : node));
                            setReplacementComponentId("");
                            setMessage(en ? "Component link cleared." : "컴포넌트 연결을 해제했습니다.");
                          }} size="xs" type="button" variant="dangerSecondary">
                            {en ? "Clear link" : "연결 해제"}
                          </MemberButton>
                        </div>
                        <label className="block">
                          <span className="gov-label">{en ? "Replace with existing component" : "기존 컴포넌트로 대체"}</span>
                          <select className="gov-select" value={replacementComponentId} onChange={(event) => setReplacementComponentId(event.target.value)}>
                            <option value="">{en ? "Select component" : "컴포넌트 선택"}</option>
                            {componentRegistry
                              .filter((item) => item.componentType !== "page")
                              .map((item) => (
                                <option key={item.componentId} value={item.componentId}>
                                  {item.componentId} / {en ? (item.labelEn || item.label) : item.label}
                                </option>
                              ))}
                          </select>
                        </label>
                        <MemberButton disabled={!selectedRegistryComponent} onClick={handleReplaceSelectedComponent} size="xs" type="button" variant="secondary">
                          {en ? "Apply registered component" : "등록 컴포넌트 적용"}
                        </MemberButton>
                      </div>
                    </div>

                    <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Event Binding" : "이벤트 연결"}</p>
                        <MemberButton onClick={() => { ensureSelectedEvent(); }} size="xs" type="button" variant="secondary">
                          {selectedEvent ? (en ? "Reset" : "다시 연결") : (en ? "Add Event" : "이벤트 추가")}
                        </MemberButton>
                      </div>
                      {selectedEvent ? (
                        <div className="mt-4 space-y-4">
                          <label className="block">
                            <span className="gov-label">{en ? "Event Name" : "이벤트명"}</span>
                            <select className="gov-select" value={selectedEvent.eventName} onChange={(event) => updateSelectedEvent("eventName", event.target.value)}>
                              <option value="onClick">onClick</option>
                              <option value="onChange">onChange</option>
                              <option value="onSubmit">onSubmit</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="gov-label">{en ? "Action Type" : "액션 타입"}</span>
                            <select className="gov-select" value={selectedEvent.actionType} onChange={(event) => updateSelectedEvent("actionType", event.target.value)}>
                              <option value="navigate">navigate</option>
                              <option value="open_modal">open_modal</option>
                              <option value="api_call">api_call</option>
                              <option value="set_state">set_state</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="gov-label">{en ? "Target / Config" : "대상 / 설정"}</span>
                            <input className="gov-input" value={String(selectedEvent.actionConfig?.target || "")} onChange={(event) => updateSelectedEventTarget(event.target.value)} />
                          </label>
                          {selectedEvent.actionType === "api_call" ? (
                            <>
                              <label className="block">
                                <span className="gov-label">{en ? "Linked API" : "연결 API"}</span>
                                <select className="gov-select" value={String(selectedEvent.actionConfig?.apiId || "")} onChange={(event) => updateSelectedEventApi(event.target.value)}>
                                  <option value="">{en ? "Select API" : "API 선택"}</option>
                                  {availableApis.map((api) => (
                                    <option key={api.apiId} value={api.apiId}>
                                      {api.method} {api.endpoint}
                                    </option>
                                  ))}
                                </select>
                                <p className="mt-2 text-xs text-[var(--kr-gov-text-secondary)]">
                                  {selectedEvent.actionConfig?.apiId
                                    ? `${String(selectedEvent.actionConfig?.method || "")} ${String(selectedEvent.actionConfig?.endpoint || "")}`
                                    : (commandState.value?.page?.apis?.length
                                      ? (en ? "Use the current page API catalog from screen-command metadata." : "screen-command 메타데이터의 현재 페이지 API 목록을 사용합니다.")
                                      : (en ? "No screen-command API metadata linked yet." : "연결된 screen-command API 메타데이터가 아직 없습니다."))}
                                </p>
                              </label>
                              {selectedApi?.requestFields?.length ? (
                                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 px-4 py-4">
                                  <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Request Field Mapping" : "요청 필드 매핑"}</p>
                                  <div className="mt-3 space-y-3">
                                    {selectedApi.requestFields.map((field) => (
                                      <label className="block" key={`req-map-${field.fieldId}`}>
                                        <span className="gov-label">{field.fieldId} <span className="text-xs font-normal text-[var(--kr-gov-text-secondary)]">[{field.type}]</span></span>
                                        <input
                                          className="gov-input"
                                          placeholder={en ? "ex) form.companyName or state.selectedId" : "예) form.companyName 또는 state.selectedId"}
                                          value={String(((selectedEvent.actionConfig?.requestMappings as Record<string, string> | undefined) || {})[field.fieldId] || "")}
                                          onChange={(event) => updateSelectedEventRequestMapping(field.fieldId, event.target.value)}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {selectedApi?.responseFields?.length ? (
                                <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 px-4 py-4">
                                  <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Response Field Binding" : "응답 필드 바인딩"}</p>
                                  <div className="mt-3 space-y-3">
                                    {selectedApi.responseFields.map((field) => (
                                      <label className="block" key={`res-map-${field.fieldId}`}>
                                        <span className="gov-label">{field.fieldId} <span className="text-xs font-normal text-[var(--kr-gov-text-secondary)]">[{field.type}]</span></span>
                                        <input
                                          className="gov-input"
                                          placeholder={en ? "ex) state.resultRows or form.companyName" : "예) state.resultRows 또는 form.companyName"}
                                          value={String(((selectedEvent.actionConfig?.responseMappings as Record<string, string> | undefined) || {})[field.fieldId] || "")}
                                          onChange={(event) => {
                                            if (!selectedNode) {
                                              return;
                                            }
                                            const base = ensureSelectedEvent();
                                            if (!base) {
                                              return;
                                            }
                                            setEvents((current) => current.map((item) => item.eventBindingId === base.eventBindingId
                                              ? {
                                                ...item,
                                                actionConfig: {
                                                  ...(item.actionConfig || {}),
                                                  responseMappings: {
                                                    ...((item.actionConfig?.responseMappings as Record<string, string> | undefined) || {}),
                                                    [field.fieldId]: event.target.value
                                                  }
                                                }
                                              }
                                              : item));
                                          }}
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">
                          {en ? "Connect a basic runtime action such as page navigation, modal open, API call, or local state update." : "페이지 이동, 모달 열기, API 호출, 로컬 상태 변경 같은 기본 런타임 액션을 연결할 수 있습니다."}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a node from the canvas first." : "먼저 캔버스에서 노드를 선택하세요."}</p>
                )}
              </div>
            </article>

            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white">
              <GridToolbar
                actions={(
                  <MemberButtonGroup>
                    <MemberButton onClick={() => setPreviewMode("DRAFT")} size="xs" type="button" variant={previewMode === "DRAFT" ? "primary" : "secondary"}>
                      {en ? "Draft" : "초안"}
                    </MemberButton>
                    <MemberButton disabled={!page?.publishedVersionId} onClick={() => setPreviewMode("PUBLISHED")} size="xs" type="button" variant={previewMode === "PUBLISHED" ? "primary" : "secondary"}>
                      {en ? "Published" : "발행본"}
                    </MemberButton>
                  </MemberButtonGroup>
                )}
                meta={`${page?.menuUrl || "-"} / ${previewMode}`}
                title={en ? "Preview" : "미리보기"}
              />
              <div className="min-h-[680px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4">
                {previewMessage ? (
                  <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    {previewMessage}
                  </div>
                ) : null}
                {previewNodes.length ? renderScreenBuilderNodePreview(sortScreenBuilderNodes(previewNodes)[0], previewNodes, en) : (
                  <div className="flex min-h-[280px] items-center justify-center rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] text-sm text-[var(--kr-gov-text-secondary)]">
                    {en ? "No preview nodes yet." : "아직 미리볼 노드가 없습니다."}
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="gov-card p-0 overflow-hidden">
          <GridToolbar
            meta={en ? `${page?.versionHistory?.length || 0} saved snapshots` : `저장된 스냅샷 ${page?.versionHistory?.length || 0}건`}
            title={en ? "Draft Version History" : "초안 버전 이력"}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">{en ? "Saved At" : "저장 시각"}</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">{en ? "Nodes" : "노드"}</th>
                  <th className="px-4 py-3">{en ? "Events" : "이벤트"}</th>
                  <th className="px-4 py-3">{en ? "Action" : "작업"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(page?.versionHistory || []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={6}>
                      {en ? "No saved draft versions yet." : "아직 저장된 초안 버전이 없습니다."}
                    </td>
                  </tr>
                ) : (
                  (page?.versionHistory || []).map((version) => (
                    <tr key={version.versionId}>
                      <td className="px-4 py-3 font-mono text-[12px]">{version.versionId}</td>
                      <td className="px-4 py-3">{version.savedAt || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{version.templateType || "-"}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${version.versionStatus === "PUBLISHED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {version.versionStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{version.nodeCount}</td>
                      <td className="px-4 py-3">{version.eventCount}</td>
                      <td className="px-4 py-3">
                        <MemberButton disabled={saving || version.versionStatus === "PUBLISHED"} onClick={() => { void handleRestoreVersion(version.versionId); }} size="xs" type="button" variant="secondary">
                          {version.versionStatus === "PUBLISHED" ? (en ? "Protected" : "보호됨") : (en ? "Restore" : "복원")}
                        </MemberButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
