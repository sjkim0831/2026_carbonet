import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  fetchScreenCommandPage,
  fetchScreenBuilderPage,
  fetchScreenBuilderPreview,
  scanScreenBuilderRegistryDiagnostics,
  publishScreenBuilderDraft,
  readBootstrappedScreenBuilderPageData,
  addScreenBuilderNodeFromComponent,
  addScreenBuilderNodeTreeFromComponents,
  autoReplaceDeprecatedScreenBuilderComponents,
  registerScreenBuilderComponent,
  restoreScreenBuilderDraft,
  saveScreenBuilderDraft,
  updateScreenBuilderComponentRegistry,
  previewAutoReplaceDeprecatedScreenBuilderComponents,
  type ScreenBuilderAutoReplacePreviewItem,
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
import { DiagnosticCard, GridToolbar, MemberButton, MemberButtonGroup, MemberIconButton, MemberLinkButton } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { renderScreenBuilderNodePreview, resolveScreenBuilderQuery, sortScreenBuilderNodes } from "./screenBuilderRenderer";

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

function createAiNodeTreeInputRow(partial?: Partial<AiNodeTreeInputRow>): AiNodeTreeInputRow {
  return {
    componentId: partial?.componentId || "",
    alias: partial?.alias || "",
    parentAlias: partial?.parentAlias || "",
    propsJson: partial?.propsJson || "{}"
  };
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
  const [componentRegistry, setComponentRegistry] = useState<ScreenBuilderComponentRegistryItem[]>([]);
  const [componentLabel, setComponentLabel] = useState("");
  const [componentDescription, setComponentDescription] = useState("");
  const [replacementComponentId, setReplacementComponentId] = useState("");
  const [registryStatusFilter, setRegistryStatusFilter] = useState<"ALL" | "ACTIVE" | "DEPRECATED">("ALL");
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
    setPreviewNodes(sortScreenBuilderNodes(page.nodes || []));
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
  const backendUnregisteredNodes = page?.registryDiagnostics?.unregisteredNodes || [];
  const backendMissingNodes = page?.registryDiagnostics?.missingNodes || [];
  const backendDeprecatedNodes = page?.registryDiagnostics?.deprecatedNodes || [];
  const componentPromptSurface = page?.registryDiagnostics?.componentPromptSurface || [];
  const filteredComponentRegistry = useMemo(
    () => componentRegistry.filter((item) => registryStatusFilter === "ALL" ? true : String(item.status || "ACTIVE") === registryStatusFilter),
    [componentRegistry, registryStatusFilter]
  );
  const publishIssueCount = backendUnregisteredNodes.length + backendMissingNodes.length + backendDeprecatedNodes.length;
  const publishReady = publishIssueCount === 0;

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
        templateType: page.templateType,
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
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading screen builder..." : "화면 빌더를 불러오는 중입니다."}
    >
      {pageState.error || saveError ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageState.error || saveError}
        </section>
      ) : null}
      {message ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </section>
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
              <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Registered components" : "등록 컴포넌트"}</p>
              <div className="mt-3 max-h-[280px] space-y-2 overflow-auto">
                {filteredComponentRegistry.map((item) => (
                  <div className="w-full rounded border border-[var(--kr-gov-border-light)] px-3 py-2 text-left text-sm" key={item.componentId}>
                    <button
                      className="w-full text-left hover:bg-gray-50"
                      onClick={() => {
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
            actions={<MemberButtonGroup>{(page?.componentPalette || []).map((item) => (
              <MemberButton key={item.componentType} onClick={() => addNode(item)} size="xs" type="button" variant="secondary">
                {en ? (item.labelEn || item.label) : item.label}
              </MemberButton>
            ))}</MemberButtonGroup>}
            meta={en ? "Append reusable blocks to the current draft. The Phase 1 MVP uses list-based composition before full drag-and-drop." : "재사용 블록을 현재 초안에 추가합니다. 1차 MVP는 완전한 drag-and-drop 전에 리스트 기반 조합으로 시작합니다."}
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
