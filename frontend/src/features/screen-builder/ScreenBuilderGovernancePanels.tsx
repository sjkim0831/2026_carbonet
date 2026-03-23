import type { Dispatch, SetStateAction } from "react";
import type {
  ScreenBuilderAutoReplacePreviewItem,
  ScreenBuilderComponentPromptSurface,
  ScreenBuilderComponentRegistryItem,
  ScreenBuilderComponentUsage,
  ScreenBuilderRegistryScanItem
} from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { GridToolbar, MemberButton, MemberButtonGroup, MemberLinkButton } from "../admin-ui/common";
import { type SystemComponentCatalogType } from "./buttonCatalogCore";
import {
  renderSystemCatalogPreview,
  resolveButtonVariant,
  resolveCatalogInventoryTitle,
  resolveCatalogTitle,
  type AiNodeTreeInputRow
} from "./screenBuilderShared";

type SystemCatalogInstance = {
  key: string;
  styleGroupId: string;
  componentType: string;
  componentName: string;
  variant?: string;
  size?: string;
  className?: string;
  icon?: string;
  label?: string;
  placeholder?: string;
  route: {
    routeId: string;
    koPath: string;
    enPath: string;
    label: string;
  };
};

type SystemCatalogGroup = {
  key: string;
  styleGroupId: string;
  componentType: string;
  componentName: string;
  variant?: string;
  size?: string;
  className?: string;
  icon?: string;
  placeholder?: string;
  instanceCount: number;
  routeCount: number;
};

type Props = {
  en: boolean;
  saving: boolean;
  filteredSystemCatalog: SystemCatalogGroup[];
  systemCatalogInstances: SystemCatalogInstance[];
  selectedCatalogType: SystemComponentCatalogType | "ALL" | "";
  copiedButtonStyleId: string;
  copyButtonStyleId: (styleGroupId: string) => Promise<void>;
  componentRegistry: ScreenBuilderComponentRegistryItem[];
  backendUnregisteredNodes: Array<{ nodeId: string; componentType: string; label: string }>;
  backendMissingNodes: Array<{ nodeId: string; componentId?: string; label: string; replacementComponentId?: string }>;
  backendDeprecatedNodes: Array<{ nodeId: string; componentId?: string; label: string; replacementComponentId?: string }>;
  componentTypeOptions: string[];
  registryTypeFilter: string;
  setRegistryTypeFilter: Dispatch<SetStateAction<string>>;
  registryStatusFilter: "ALL" | "ACTIVE" | "DEPRECATED";
  setRegistryStatusFilter: Dispatch<SetStateAction<"ALL" | "ACTIVE" | "DEPRECATED">>;
  filteredComponentRegistry: ScreenBuilderComponentRegistryItem[];
  uniqueUsageUrlsByComponent: Record<string, string[]>;
  setSelectedNodeId: Dispatch<SetStateAction<string>>;
  setSelectedRegistryComponentId: Dispatch<SetStateAction<string>>;
  setReplacementComponentId: Dispatch<SetStateAction<string>>;
  handleDeprecateComponent: (item: ScreenBuilderComponentRegistryItem) => Promise<void>;
  selectedRegistryInventoryItem: ScreenBuilderComponentRegistryItem | null;
  registryUsageRows: ScreenBuilderComponentUsage[];
  registryUsageLoading: boolean;
  registryEditorType: string;
  setRegistryEditorType: Dispatch<SetStateAction<string>>;
  registryEditorLabel: string;
  setRegistryEditorLabel: Dispatch<SetStateAction<string>>;
  registryEditorDescription: string;
  setRegistryEditorDescription: Dispatch<SetStateAction<string>>;
  registryEditorStatus: string;
  setRegistryEditorStatus: Dispatch<SetStateAction<string>>;
  registryEditorReplacementId: string;
  setRegistryEditorReplacementId: Dispatch<SetStateAction<string>>;
  registryEditorPropsJson: string;
  setRegistryEditorPropsJson: Dispatch<SetStateAction<string>>;
  handleSaveRegistryItem: () => Promise<void>;
  handleRemapRegistryUsage: () => Promise<void>;
  handleDeleteRegistryItem: () => Promise<void>;
  autoReplacePreviewItems: ScreenBuilderAutoReplacePreviewItem[];
  registryScanRows: ScreenBuilderRegistryScanItem[];
  componentPromptSurface: ScreenBuilderComponentPromptSurface[];
  handleAddNodeFromComponent: (componentId: string) => Promise<void>;
  handlePreviewAutoReplaceDeprecated: () => Promise<void>;
  handleAutoReplaceDeprecated: () => Promise<void>;
  handleScanRegistryDiagnostics: () => Promise<void>;
  aiNodeTreeRows: AiNodeTreeInputRow[];
  updateAiNodeTreeRow: (index: number, field: keyof AiNodeTreeInputRow, value: string) => void;
  addAiNodeTreeRow: () => void;
  removeAiNodeTreeRow: (index: number) => void;
  handleAddNodeTreeFromAiSurface: () => Promise<void>;
};

export default function ScreenBuilderGovernancePanels({
  en,
  saving,
  filteredSystemCatalog,
  systemCatalogInstances,
  selectedCatalogType,
  copiedButtonStyleId,
  copyButtonStyleId,
  componentRegistry,
  backendUnregisteredNodes,
  backendMissingNodes,
  backendDeprecatedNodes,
  componentTypeOptions,
  registryTypeFilter,
  setRegistryTypeFilter,
  registryStatusFilter,
  setRegistryStatusFilter,
  filteredComponentRegistry,
  uniqueUsageUrlsByComponent,
  setSelectedNodeId,
  setSelectedRegistryComponentId,
  setReplacementComponentId,
  handleDeprecateComponent,
  selectedRegistryInventoryItem,
  registryUsageRows,
  registryUsageLoading,
  registryEditorType,
  setRegistryEditorType,
  registryEditorLabel,
  setRegistryEditorLabel,
  registryEditorDescription,
  setRegistryEditorDescription,
  registryEditorStatus,
  setRegistryEditorStatus,
  registryEditorReplacementId,
  setRegistryEditorReplacementId,
  registryEditorPropsJson,
  setRegistryEditorPropsJson,
  handleSaveRegistryItem,
  handleRemapRegistryUsage,
  handleDeleteRegistryItem,
  autoReplacePreviewItems,
  registryScanRows,
  componentPromptSurface,
  handleAddNodeFromComponent,
  handlePreviewAutoReplaceDeprecated,
  handleAutoReplaceDeprecated,
  handleScanRegistryDiagnostics,
  aiNodeTreeRows,
  updateAiNodeTreeRow,
  addAiNodeTreeRow,
  removeAiNodeTreeRow,
  handleAddNodeTreeFromAiSurface
}: Props) {
  return (
    <>
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
                      <td className="px-4 py-3">{renderSystemCatalogPreview(item, en)}</td>
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
            <div className="mt-3 max-h-[280px] space-y-2 overflow-auto">
              {filteredComponentRegistry.map((item) => (
                <div className="w-full rounded border border-[var(--kr-gov-border-light)] px-3 py-2 text-left text-sm" key={item.componentId}>
                  <button
                    className="w-full text-left hover:bg-gray-50"
                    onClick={() => {
                      setSelectedRegistryComponentId(item.componentId);
                      setReplacementComponentId(item.componentId);
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
          {componentPromptSurface.map((item) => (
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
    </>
  );
}
