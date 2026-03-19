import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { findManifestByMenuCodeOrRoutePath, normalizeManifestLookupPath } from "../../app/screen-registry/pageManifestIndex";
import {
  autoCollectFullStackGovernanceRegistry,
  deleteEnvironmentManagedPage,
  deleteEnvironmentFeature,
  fetchAuditEvents,
  fetchEnvironmentManagedPageImpact,
  fetchFullStackGovernanceRegistry,
  fetchEnvironmentFeatureImpact,
  fetchFunctionManagementPage,
  fetchMenuManagementPage,
  fetchScreenBuilderPage,
  fetchScreenCommandPage,
  fetchTraceEvents,
  getScreenCommandChainValues,
  type FullStackGovernanceRegistryEntry,
  type FunctionManagementPagePayload,
  type MenuManagementPagePayload,
  type ScreenCommandPagePayload,
  updateEnvironmentFeature,
  updateEnvironmentManagedPage
} from "../../lib/api/client";
import { buildLocalizedPath, getCsrfMeta, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf, submitFormRequest } from "../admin-system/adminSystemShared";
import { DiagnosticCard, GridToolbar, MemberButton, MemberLinkButton } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
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

type SelectedMenuDraft = {
  codeNm: string;
  codeDc: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
};

type FeatureDeleteImpact = {
  featureCode: string;
  assignedRoleCount: number;
  userOverrideCount: number;
};

type PageDeleteImpact = {
  code: string;
  defaultViewFeatureCode: string;
  linkedFeatureCodes: string[];
  nonDefaultFeatureCodes: string[];
  defaultViewRoleRefCount: number;
  defaultViewUserOverrideCount: number;
  blocked: boolean;
};

type UrlValidation = {
  tone: "neutral" | "success" | "warning";
  message: string;
};

type GovernanceRemediationItem = {
  title: string;
  description: string;
  href?: string;
  actionLabel: string;
  actionKind: "link" | "autoCollect" | "permissions";
};

type GovernanceOverview = {
  summary: string;
  pageId: string;
  source: string;
  tags: string[];
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

type ScreenBuilderIssueBreakdown = {
  unregisteredCount: number;
  missingCount: number;
  deprecatedCount: number;
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

function createEmptySelectedMenuDraft(): SelectedMenuDraft {
  return {
    codeNm: "",
    codeDc: "",
    menuUrl: "",
    menuIcon: "web",
    useAt: "Y"
  };
}

function validateManagedUrl(
  value: string,
  menuType: string,
  rows: ManagedMenuRow[],
  currentCode?: string,
  en?: boolean
): UrlValidation {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      tone: "warning",
      message: en ? "URL is required." : "URL은 필수입니다."
    };
  }
  const normalized = toDisplayMenuUrl(trimmed);
  const validPrefix = menuType === "USER"
    ? (normalized.startsWith("/home") || normalized.startsWith("/en/home"))
    : (normalized.startsWith("/admin/") || normalized.startsWith("/en/admin/"));
  if (!validPrefix) {
    return {
      tone: "warning",
      message: en
        ? (menuType === "USER" ? "Home URLs must start with /home or /en/home." : "Admin URLs must start with /admin/ or /en/admin/.")
        : (menuType === "USER" ? "홈 URL은 /home 또는 /en/home 으로 시작해야 합니다." : "관리자 URL은 /admin/ 또는 /en/admin/ 으로 시작해야 합니다.")
    };
  }
  const duplicated = rows.find((row) => row.menuUrl === normalized && row.code !== (currentCode || ""));
  if (duplicated) {
    return {
      tone: "warning",
      message: en ? `URL is already used by ${duplicated.code}.` : `이미 ${duplicated.code} 메뉴가 사용하는 URL입니다.`
    };
  }
  return {
    tone: "success",
    message: en ? "Available URL pattern." : "사용 가능한 URL 패턴입니다."
  };
}

function summarizeBuilderBlockingReason(issueCount: number, en: boolean) {
  if (issueCount <= 0) {
    return en ? "No registry issue. Publish can run immediately." : "레지스트리 이슈가 없어 바로 Publish 가능합니다.";
  }
  return en ? `${issueCount} registry issues require cleanup before publish.` : `${issueCount}건 레지스트리 이슈를 먼저 정리해야 Publish 됩니다.`;
}

function summarizeBuilderIssueBreakdown(
  counts: { unregisteredCount?: number; missingCount?: number; deprecatedCount?: number } | null | undefined,
  en: boolean
) {
  const parts: string[] = [];
  const unregisteredCount = counts?.unregisteredCount || 0;
  const missingCount = counts?.missingCount || 0;
  const deprecatedCount = counts?.deprecatedCount || 0;
  if (unregisteredCount > 0) {
    parts.push(en ? `unregistered ${unregisteredCount}` : `미등록 ${unregisteredCount}건`);
  }
  if (missingCount > 0) {
    parts.push(en ? `missing ${missingCount}` : `누락 ${missingCount}건`);
  }
  if (deprecatedCount > 0) {
    parts.push(en ? `deprecated ${deprecatedCount}` : `Deprecated ${deprecatedCount}건`);
  }
  if (!parts.length) {
    return en ? "No registry issue. Publish can run immediately." : "레지스트리 이슈가 없어 바로 Publish 가능합니다.";
  }
  return parts.join(en ? " / " : " / ");
}

function recommendBuilderNextAction(
  counts: { unregisteredCount?: number; missingCount?: number; deprecatedCount?: number } | null | undefined,
  en: boolean
) {
  const unregisteredCount = counts?.unregisteredCount || 0;
  const missingCount = counts?.missingCount || 0;
  const deprecatedCount = counts?.deprecatedCount || 0;
  if (unregisteredCount > 0) {
    return en ? "Register reusable components for unregistered nodes first." : "미등록 노드를 먼저 재사용 컴포넌트로 등록하세요.";
  }
  if (missingCount > 0) {
    return en ? "Repair or relink missing component references in Screen Builder." : "화면 빌더에서 누락된 컴포넌트 참조를 먼저 복구하세요.";
  }
  if (deprecatedCount > 0) {
    return en ? "Run deprecated replacement before publish." : "Publish 전에 Deprecated 대체를 먼저 실행하세요.";
  }
  return en ? "No blocking issue. You can publish this page now." : "차단 이슈가 없습니다. 지금 이 페이지를 Publish 할 수 있습니다.";
}

function describeScreenBuilderFilter(
  screenBuilderFilter: "ALL" | "PUBLISHED_ONLY" | "DRAFT_ONLY" | "READY_ONLY" | "BLOCKED_ONLY" | "ISSUE_ONLY",
  screenBuilderIssueReasonFilter: "ALL" | "UNREGISTERED" | "MISSING" | "DEPRECATED",
  en: boolean
) {
  const scopeLabel = (() => {
    switch (screenBuilderFilter) {
      case "PUBLISHED_ONLY":
        return en ? "Published only" : "Publish만";
      case "DRAFT_ONLY":
        return en ? "No publish yet" : "Publish 없음";
      case "READY_ONLY":
        return en ? "Ready only" : "가능만";
      case "BLOCKED_ONLY":
        return en ? "Blocked only" : "차단만";
      case "ISSUE_ONLY":
        return en ? "Issue pages only" : "이슈만";
      default:
        return en ? "All pages" : "전체 메뉴";
    }
  })();
  const reasonLabel = (() => {
    switch (screenBuilderIssueReasonFilter) {
      case "UNREGISTERED":
        return en ? "Unregistered only" : "미등록만";
      case "MISSING":
        return en ? "Missing only" : "누락만";
      case "DEPRECATED":
        return en ? "Deprecated only" : "Deprecated만";
      default:
        return en ? "All reasons" : "전체 사유";
    }
  })();
  return `${scopeLabel} / ${reasonLabel}`;
}

function matchesScreenBuilderIssueReason(
  detail: ScreenBuilderIssueBreakdown | undefined,
  reason: "UNREGISTERED" | "MISSING" | "DEPRECATED"
) {
  if (reason === "UNREGISTERED") {
    return (detail?.unregisteredCount || 0) > 0;
  }
  if (reason === "MISSING") {
    return (detail?.missingCount || 0) > 0;
  }
  return (detail?.deprecatedCount || 0) > 0;
}

function describeScreenBuilderIssueReason(
  reason: "UNREGISTERED" | "MISSING" | "DEPRECATED" | null,
  en: boolean
) {
  switch (reason) {
    case "UNREGISTERED":
      return en ? "Unregistered" : "미등록";
    case "MISSING":
      return en ? "Missing" : "누락";
    case "DEPRECATED":
      return en ? "Deprecated" : "Deprecated";
    default:
      return en ? "Issue" : "이슈";
  }
}

function describeScreenBuilderQueueFocus(
  queue: { remainingPublished: number; remainingDraft: number },
  en: boolean
) {
  if (queue.remainingPublished <= 0 && queue.remainingDraft <= 0) {
    return en ? "No remaining queue in this issue family." : "이 이슈 유형에서 남은 대상이 없습니다.";
  }
  if (queue.remainingPublished > queue.remainingDraft) {
    return en ? "Prioritize published pages first because runtime impact is higher." : "런타임 영향이 큰 Publish 페이지부터 먼저 정리하세요.";
  }
  if (queue.remainingDraft > queue.remainingPublished) {
    return en ? "Clear draft pages first to reduce pending builder backlog." : "빌더 적체를 줄이기 위해 초안 페이지부터 먼저 정리하세요.";
  }
  return en ? "Published and draft queues are balanced. Follow the current order." : "Publish와 초안이 비슷하므로 현재 순서대로 진행하면 됩니다.";
}

function parseAuditSnapshot(value: unknown): Record<string, unknown> | null {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }
  return typeof value === "object" ? value as Record<string, unknown> : null;
}

function summarizeMenuAuditDiff(row: Record<string, unknown>, en: boolean) {
  const changedFields = Array.isArray(row.changedFields) ? row.changedFields as Array<Record<string, unknown>> : [];
  if (changedFields.length > 0) {
    return changedFields.slice(0, 3).map((field) => {
      const label = String(field.field || "-");
      const beforeValue = String(field.before || "-");
      const afterValue = String(field.after || "-");
      return `${label} ${beforeValue} -> ${afterValue}`;
    }).join(" / ");
  }
  const before = parseAuditSnapshot(row.beforeSummaryJson || row.beforeData || row.beforeSummary);
  const after = parseAuditSnapshot(row.afterSummaryJson || row.afterData || row.afterSummary);
  if (!before || !after) {
    return en ? "No interpreted diff available." : "해석 가능한 diff가 없습니다.";
  }
  const labels: Array<[string, string, string]> = [
    ["codeNm", en ? "Name" : "메뉴명", ""],
    ["codeDc", en ? "English name" : "영문명", ""],
    ["menuUrl", "URL", ""],
    ["menuIcon", en ? "Icon" : "아이콘", ""],
    ["useAt", en ? "Use" : "사용 여부", ""]
  ];
  const changes = labels.flatMap(([key, label]) => {
    const beforeValue = String(before[key] || "");
    const afterValue = String(after[key] || "");
    return beforeValue && afterValue && beforeValue !== afterValue
      ? [`${label} ${beforeValue} -> ${afterValue}`]
      : [];
  });
  return changes.length > 0 ? changes.join(" / ") : (en ? "No interpreted diff available." : "해석 가능한 diff가 없습니다.");
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
  const menuPath = normalizeManifestLookupPath(selectedMenu.menuUrl);
  const matchedCatalogPage = (pages || []).find((item) => (
    String(item.menuCode || "").toUpperCase() === menuCode
      || normalizeManifestLookupPath(String(item.routePath || "")) === menuPath
  ));
  if (matchedCatalogPage?.pageId) {
    return String(matchedCatalogPage.pageId);
  }
  const matchedManifest = findManifestByMenuCodeOrRoutePath(menuCode, menuPath);
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
    tags: entry?.tags || [],
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
  const [screenBuilderFilter, setScreenBuilderFilter] = useState<"ALL" | "PUBLISHED_ONLY" | "DRAFT_ONLY" | "READY_ONLY" | "BLOCKED_ONLY" | "ISSUE_ONLY">("ALL");
  const [screenBuilderIssueReasonFilter, setScreenBuilderIssueReasonFilter] = useState<"ALL" | "UNREGISTERED" | "MISSING" | "DEPRECATED">("ALL");
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureLinkFilter, setFeatureLinkFilter] = useState<"ALL" | "UNASSIGNED" | "LINKED">("ALL");
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
  const [selectedMenuDraft, setSelectedMenuDraft] = useState<SelectedMenuDraft>(createEmptySelectedMenuDraft);
  const [menuSaving, setMenuSaving] = useState(false);
  const [pageDeleteImpactLoading, setPageDeleteImpactLoading] = useState(false);
  const [pendingPageDeleteImpact, setPendingPageDeleteImpact] = useState<PageDeleteImpact | null>(null);
  const [pageDeleting, setPageDeleting] = useState(false);
  const [menuAuditRows, setMenuAuditRows] = useState<Array<Record<string, unknown>>>([]);
  const [menuAuditLoading, setMenuAuditLoading] = useState(false);
  const [editingFeatureCode, setEditingFeatureCode] = useState("");
  const [editingFeatureDraft, setEditingFeatureDraft] = useState<FeatureDraft>(createEmptyFeatureDraft);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [deleteImpactLoading, setDeleteImpactLoading] = useState(false);
  const [deleteImpactFeatureCode, setDeleteImpactFeatureCode] = useState("");
  const [pendingDeleteImpact, setPendingDeleteImpact] = useState<FeatureDeleteImpact | null>(null);
  const [featureDeleting, setFeatureDeleting] = useState(false);
  const [governanceMessage, setGovernanceMessage] = useState("");
  const [governanceError, setGovernanceError] = useState("");
  const [screenCatalog, setScreenCatalog] = useState<ScreenCommandPagePayload | null>(null);
  const [governancePage, setGovernancePage] = useState<ScreenCommandPagePayload | null>(null);
  const [registryEntry, setRegistryEntry] = useState<FullStackGovernanceRegistryEntry | null>(null);
  const [governanceLoading, setGovernanceLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(false);
  const [postCollectAuditRows, setPostCollectAuditRows] = useState<Array<Record<string, unknown>>>([]);
  const [postCollectTraceRows, setPostCollectTraceRows] = useState<Array<Record<string, unknown>>>([]);
  const [lastAutoCollectAt, setLastAutoCollectAt] = useState("");
  const [screenBuilderStatus, setScreenBuilderStatus] = useState<{ publishedVersionId: string; publishedSavedAt: string; versionCount: number; unregisteredCount: number; missingCount: number; deprecatedCount: number } | null>(null);
  const [screenBuilderPublishedMap, setScreenBuilderPublishedMap] = useState<Record<string, boolean>>({});
  const [screenBuilderIssueMap, setScreenBuilderIssueMap] = useState<Record<string, number>>({});
  const [screenBuilderIssueDetailMap, setScreenBuilderIssueDetailMap] = useState<Record<string, ScreenBuilderIssueBreakdown>>({});

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
    return menuRows.filter((row) => {
      if (screenBuilderFilter === "PUBLISHED_ONLY" && row.code.length === 8 && !screenBuilderPublishedMap[row.code]) {
        return false;
      }
      if (screenBuilderFilter === "DRAFT_ONLY" && row.code.length === 8 && screenBuilderPublishedMap[row.code]) {
        return false;
      }
      if (screenBuilderFilter === "ISSUE_ONLY" && row.code.length === 8 && !(screenBuilderIssueMap[row.code] > 0)) {
        return false;
      }
      if (screenBuilderFilter === "READY_ONLY" && row.code.length === 8 && (screenBuilderIssueMap[row.code] || 0) > 0) {
        return false;
      }
      if (screenBuilderFilter === "BLOCKED_ONLY" && row.code.length === 8 && (screenBuilderIssueMap[row.code] || 0) === 0) {
        return false;
      }
      if (row.code.length === 8 && screenBuilderIssueReasonFilter !== "ALL") {
        const detail = screenBuilderIssueDetailMap[row.code];
        if (!matchesScreenBuilderIssueReason(detail, screenBuilderIssueReasonFilter)) {
          return false;
        }
      }
      if (!keyword) {
        return true;
      }
      return (
        row.code.toLowerCase().includes(keyword)
        || row.label.toLowerCase().includes(keyword)
        || row.labelEn.toLowerCase().includes(keyword)
        || row.menuUrl.toLowerCase().includes(keyword)
      );
    });
  }, [menuRows, menuSearch, screenBuilderFilter, screenBuilderIssueDetailMap, screenBuilderIssueMap, screenBuilderIssueReasonFilter, screenBuilderPublishedMap]);
  const screenBuilderPageCounts = useMemo(() => {
    const pageMenus = menuRows.filter((row) => row.code.length === 8);
    const publishedCount = pageMenus.filter((row) => Boolean(screenBuilderPublishedMap[row.code])).length;
    const issuePagesCount = pageMenus.filter((row) => (screenBuilderIssueMap[row.code] || 0) > 0).length;
    const unregisteredPages = pageMenus.filter((row) => (screenBuilderIssueDetailMap[row.code]?.unregisteredCount || 0) > 0).length;
    const missingPages = pageMenus.filter((row) => (screenBuilderIssueDetailMap[row.code]?.missingCount || 0) > 0).length;
    const deprecatedPages = pageMenus.filter((row) => (screenBuilderIssueDetailMap[row.code]?.deprecatedCount || 0) > 0).length;
    return {
      totalPages: pageMenus.length,
      publishedPages: publishedCount,
      readyPages: Math.max(pageMenus.length - issuePagesCount, 0),
      blockedPages: issuePagesCount,
      draftOnlyPages: Math.max(pageMenus.length - publishedCount, 0),
      issuePages: issuePagesCount,
      unregisteredPages,
      missingPages,
      deprecatedPages
    };
  }, [menuRows, screenBuilderIssueDetailMap, screenBuilderIssueMap, screenBuilderPublishedMap]);
  const screenBuilderIssuePageCounts = useMemo(() => ({
    UNREGISTERED: screenBuilderPageCounts.unregisteredPages,
    MISSING: screenBuilderPageCounts.missingPages,
    DEPRECATED: screenBuilderPageCounts.deprecatedPages
  }), [screenBuilderPageCounts.deprecatedPages, screenBuilderPageCounts.missingPages, screenBuilderPageCounts.unregisteredPages]);

  const selectedMenu = useMemo(
    () => menuRows.find((row) => row.code === selectedMenuCode) || null,
    [menuRows, selectedMenuCode]
  );
  const selectedMenuBuilderAudits = useMemo(
    () => menuAuditRows.filter((row) => String(row.actionCode || "").startsWith("SCREEN_BUILDER_")).slice(0, 3),
    [menuAuditRows]
  );
  const latestSelectedMenuBuilderAudit = selectedMenuBuilderAudits[0] || null;
  const hasActiveScreenBuilderFilter = screenBuilderFilter !== "ALL" || screenBuilderIssueReasonFilter !== "ALL";
  const activeScreenBuilderFilterLabel = describeScreenBuilderFilter(screenBuilderFilter, screenBuilderIssueReasonFilter, en);
  const selectedBuilderStatus = screenBuilderStatus;
  const selectedMenuBuilderIssueCount = (screenBuilderStatus?.unregisteredCount || 0) + (screenBuilderStatus?.missingCount || 0) + (screenBuilderStatus?.deprecatedCount || 0);
  const selectedMenuPublishReady = selectedMenuBuilderIssueCount === 0;
  const selectedIssueReason = useMemo<"UNREGISTERED" | "MISSING" | "DEPRECATED" | null>(() => {
    if (!selectedBuilderStatus || selectedMenuPublishReady) {
      return null;
    }
    if (selectedBuilderStatus.unregisteredCount > 0) {
      return "UNREGISTERED";
    }
    if (selectedBuilderStatus.missingCount > 0) {
      return "MISSING";
    }
    if (selectedBuilderStatus.deprecatedCount > 0) {
      return "DEPRECATED";
    }
    return null;
  }, [selectedBuilderStatus, selectedMenuPublishReady]);
  const sameIssueMenus = useMemo(() => {
    if (!selectedIssueReason) {
      return [] as ManagedMenuRow[];
    }
    return menuRows.filter((row) => row.code.length === 8 && matchesScreenBuilderIssueReason(screenBuilderIssueDetailMap[row.code], selectedIssueReason));
  }, [menuRows, screenBuilderIssueDetailMap, selectedIssueReason]);
  const sameIssueIndex = useMemo(() => {
    if (!selectedMenu || !selectedIssueReason) {
      return -1;
    }
    return sameIssueMenus.findIndex((row) => row.code === selectedMenu.code);
  }, [sameIssueMenus, selectedIssueReason, selectedMenu]);
  const nextSameIssueMenu = useMemo(() => {
    if (sameIssueMenus.length === 0) {
      return null;
    }
    if (sameIssueIndex >= 0 && sameIssueIndex < sameIssueMenus.length - 1) {
      return sameIssueMenus[sameIssueIndex + 1];
    }
    return sameIssueMenus[0] || null;
  }, [sameIssueIndex, sameIssueMenus]);
  const previousSameIssueMenu = useMemo(() => {
    if (sameIssueMenus.length === 0) {
      return null;
    }
    if (sameIssueIndex > 0) {
      return sameIssueMenus[sameIssueIndex - 1];
    }
    return sameIssueMenus[sameIssueMenus.length - 1] || null;
  }, [sameIssueIndex, sameIssueMenus]);
  const remainingSameIssueCount = useMemo(() => {
    if (sameIssueMenus.length === 0) {
      return 0;
    }
    return Math.max(sameIssueMenus.length - 1, 0);
  }, [sameIssueMenus.length]);
  const resolvedSameIssueCount = useMemo(() => {
    if (sameIssueMenus.length === 0) {
      return 0;
    }
    return Math.max((sameIssueIndex >= 0 ? sameIssueIndex : 0), 0);
  }, [sameIssueIndex, sameIssueMenus.length]);
  const sameIssueProgressPercent = useMemo(() => {
    if (sameIssueMenus.length === 0) {
      return 0;
    }
    return Math.round((resolvedSameIssueCount / sameIssueMenus.length) * 100);
  }, [resolvedSameIssueCount, sameIssueMenus.length]);
  const sameIssueQueueSummary = useMemo(() => {
    return sameIssueMenus.reduce((summary, row, index) => {
      const published = Boolean(screenBuilderPublishedMap[row.code]);
      summary.totalPublished += published ? 1 : 0;
      summary.totalDraft += published ? 0 : 1;
      if (index > sameIssueIndex) {
        summary.remainingPublished += published ? 1 : 0;
        summary.remainingDraft += published ? 0 : 1;
      }
      return summary;
    }, {
      totalPublished: 0,
      totalDraft: 0,
      remainingPublished: 0,
      remainingDraft: 0
    });
  }, [sameIssueIndex, sameIssueMenus, screenBuilderPublishedMap]);
  const nextRemainingPublishedSameIssueMenu = useMemo(() => (
    sameIssueMenus.find((row, index) => index > sameIssueIndex && Boolean(screenBuilderPublishedMap[row.code])) || null
  ), [sameIssueIndex, sameIssueMenus, screenBuilderPublishedMap]);
  const nextRemainingDraftSameIssueMenu = useMemo(() => (
    sameIssueMenus.find((row, index) => index > sameIssueIndex && !Boolean(screenBuilderPublishedMap[row.code])) || null
  ), [sameIssueIndex, sameIssueMenus, screenBuilderPublishedMap]);
  const previousPublishedSameIssueMenu = useMemo(() => {
    for (let index = sameIssueIndex - 1; index >= 0; index -= 1) {
      const row = sameIssueMenus[index];
      if (Boolean(screenBuilderPublishedMap[row.code])) {
        return row;
      }
    }
    return null;
  }, [sameIssueIndex, sameIssueMenus, screenBuilderPublishedMap]);
  const previousDraftSameIssueMenu = useMemo(() => {
    for (let index = sameIssueIndex - 1; index >= 0; index -= 1) {
      const row = sameIssueMenus[index];
      if (!Boolean(screenBuilderPublishedMap[row.code])) {
        return row;
      }
    }
    return null;
  }, [sameIssueIndex, sameIssueMenus, screenBuilderPublishedMap]);
  const sameIssueMenuCodeSet = useMemo(() => new Set(sameIssueMenus.map((row) => row.code)), [sameIssueMenus]);
  const sameIssueIndexMap = useMemo(() => (
    sameIssueMenus.reduce<Record<string, number>>((accumulator, row, index) => {
      accumulator[row.code] = index;
      return accumulator;
    }, {})
  ), [sameIssueMenus]);
  const orderedFilteredMenus = useMemo(() => {
    if (!selectedIssueReason) {
      return filteredMenus;
    }
    return [...filteredMenus].sort((left, right) => {
      const leftIndex = sameIssueIndexMap[left.code];
      const rightIndex = sameIssueIndexMap[right.code];
      const leftInIssueFamily = Number.isInteger(leftIndex);
      const rightInIssueFamily = Number.isInteger(rightIndex);
      if (leftInIssueFamily && rightInIssueFamily) {
        return leftIndex - rightIndex;
      }
      if (leftInIssueFamily !== rightInIssueFamily) {
        return leftInIssueFamily ? -1 : 1;
      }
      return 0;
    });
  }, [filteredMenus, sameIssueIndexMap, selectedIssueReason]);
  const sameIssueRemainingMap = useMemo(() => (
    sameIssueMenus.reduce<Record<string, number>>((accumulator, row, index) => {
      accumulator[row.code] = Math.max(sameIssueMenus.length - index - 1, 0);
      return accumulator;
    }, {})
  ), [sameIssueMenus]);
  const visibleSameIssueMenus = useMemo(
    () => orderedFilteredMenus.filter((row) => sameIssueMenuCodeSet.has(row.code)),
    [orderedFilteredMenus, sameIssueMenuCodeSet]
  );
  const visibleSameIssuePublishedCount = useMemo(
    () => visibleSameIssueMenus.filter((row) => Boolean(screenBuilderPublishedMap[row.code])).length,
    [screenBuilderPublishedMap, visibleSameIssueMenus]
  );
  const visibleSameIssueDraftCount = useMemo(
    () => visibleSameIssueMenus.filter((row) => !Boolean(screenBuilderPublishedMap[row.code])).length,
    [screenBuilderPublishedMap, visibleSameIssueMenus]
  );
  const visibleSameIssueReadyCount = useMemo(
    () => visibleSameIssueMenus.filter((row) => (screenBuilderIssueMap[row.code] || 0) === 0).length,
    [screenBuilderIssueMap, visibleSameIssueMenus]
  );
  const visibleSameIssueBlockedCount = useMemo(
    () => visibleSameIssueMenus.filter((row) => (screenBuilderIssueMap[row.code] || 0) > 0).length,
    [screenBuilderIssueMap, visibleSameIssueMenus]
  );
  const visibleSameIssueRatio = useMemo(() => {
    if (orderedFilteredMenus.length === 0) {
      return 0;
    }
    return Math.round((visibleSameIssueMenus.length / orderedFilteredMenus.length) * 100);
  }, [orderedFilteredMenus.length, visibleSameIssueMenus.length]);
  const visibleOtherMenus = useMemo(
    () => orderedFilteredMenus.filter((row) => !sameIssueMenuCodeSet.has(row.code)),
    [orderedFilteredMenus, sameIssueMenuCodeSet]
  );
  const visibleOtherPublishedCount = useMemo(
    () => visibleOtherMenus.filter((row) => Boolean(screenBuilderPublishedMap[row.code])).length,
    [screenBuilderPublishedMap, visibleOtherMenus]
  );
  const visibleOtherDraftCount = useMemo(
    () => visibleOtherMenus.filter((row) => !Boolean(screenBuilderPublishedMap[row.code])).length,
    [screenBuilderPublishedMap, visibleOtherMenus]
  );
  const visibleOtherReadyCount = useMemo(
    () => visibleOtherMenus.filter((row) => (screenBuilderIssueMap[row.code] || 0) === 0).length,
    [screenBuilderIssueMap, visibleOtherMenus]
  );
  const visibleOtherBlockedCount = useMemo(
    () => visibleOtherMenus.filter((row) => (screenBuilderIssueMap[row.code] || 0) > 0).length,
    [screenBuilderIssueMap, visibleOtherMenus]
  );
  const visibleOtherRatio = useMemo(() => {
    if (orderedFilteredMenus.length === 0) {
      return 0;
    }
    return Math.round((visibleOtherMenus.length / orderedFilteredMenus.length) * 100);
  }, [orderedFilteredMenus.length, visibleOtherMenus.length]);
  const previousSameIssueMenuIssueCount = previousSameIssueMenu ? (screenBuilderIssueMap[previousSameIssueMenu.code] || 0) : 0;
  const previousSameIssueMenuIsPublished = previousSameIssueMenu ? Boolean(screenBuilderPublishedMap[previousSameIssueMenu.code]) : false;
  const nextSameIssueMenuIssueCount = nextSameIssueMenu ? (screenBuilderIssueMap[nextSameIssueMenu.code] || 0) : 0;
  const nextSameIssueMenuIsPublished = nextSameIssueMenu ? Boolean(screenBuilderPublishedMap[nextSameIssueMenu.code]) : false;
  const filteredFeatureRows = useMemo(() => {
    const keyword = featureSearch.trim().toLowerCase();
    return featureRows.filter((row) => {
      const featureCode = stringOf(row, "featureCode");
      const featureNm = stringOf(row, "featureNm");
      const featureDc = stringOf(row, "featureDc");
      const unassigned = Boolean(row.unassignedToRole);
      if (featureLinkFilter === "UNASSIGNED" && !unassigned) {
        return false;
      }
      if (featureLinkFilter === "LINKED" && unassigned) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        featureCode.toLowerCase().includes(keyword)
        || featureNm.toLowerCase().includes(keyword)
        || featureDc.toLowerCase().includes(keyword)
      );
    });
  }, [featureLinkFilter, featureRows, featureSearch]);
  const selectedMenuIsPage = selectedMenu?.code.length === 8;
  const governancePageId = useMemo(() => {
    return resolveGovernancePageId(selectedMenu, screenCatalog?.pages);
  }, [screenCatalog?.pages, selectedMenu]);
  const governanceOverview = useMemo(
    () => buildGovernanceOverview(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const createUrlValidation = useMemo(
    () => validateManagedUrl(menuUrl, menuType, menuRows, undefined, en),
    [en, menuRows, menuType, menuUrl]
  );
  const selectedUrlValidation = useMemo(
    () => validateManagedUrl(selectedMenuDraft.menuUrl, menuType, menuRows, selectedMenu?.code, en),
    [en, menuRows, menuType, selectedMenu?.code, selectedMenuDraft.menuUrl]
  );
  const governanceDraftOnly = useMemo(
    () => isDraftOnlyGovernancePage(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const governanceWarnings = useMemo(() => {
    if (!selectedMenu || !selectedMenuIsPage) {
      return [];
    }
    const warnings: string[] = [];
    if (!governanceOverview.pageId) {
      warnings.push(en ? "Screen-command registry is not linked yet." : "screen-command registry 연결이 아직 없습니다.");
    }
    if (governanceDraftOnly) {
      warnings.push(en ? "Only draft registry is connected." : "draft registry만 연결된 상태입니다.");
    }
    if (governanceOverview.apiIds.length === 0) {
      warnings.push(en ? "No backend API linkage collected." : "연결된 백엔드 API가 수집되지 않았습니다.");
    }
    if (governanceOverview.tableNames.length === 0) {
      warnings.push(en ? "No DB table metadata collected." : "DB 테이블 메타데이터가 수집되지 않았습니다.");
    }
    if (featureRows.some((row) => Boolean(row.unassignedToRole))) {
      warnings.push(en ? "Some features are still unassigned to permission groups." : "일부 기능이 아직 권한 그룹에 연결되지 않았습니다.");
    }
    return warnings;
  }, [en, featureRows, governanceDraftOnly, governanceOverview.apiIds.length, governanceOverview.pageId, governanceOverview.tableNames.length, selectedMenu, selectedMenuIsPage]);
  useEffect(() => {
    let cancelled = false;
    async function loadScreenBuilderStatus() {
      if (!selectedMenu || !selectedMenuIsPage) {
        setScreenBuilderStatus(null);
        return;
      }
      try {
        const payload = await fetchScreenBuilderPage({
          menuCode: selectedMenu.code,
          pageId: governancePageId || selectedMenu.code.toLowerCase(),
          menuTitle: selectedMenu.label,
          menuUrl: selectedMenu.menuUrl || ""
        });
        if (cancelled) {
          return;
        }
        setScreenBuilderStatus({
          publishedVersionId: String(payload.publishedVersionId || ""),
          publishedSavedAt: String(payload.publishedSavedAt || ""),
          versionCount: Array.isArray(payload.versionHistory) ? payload.versionHistory.length : 0,
          unregisteredCount: Array.isArray(payload.registryDiagnostics?.unregisteredNodes) ? payload.registryDiagnostics.unregisteredNodes.length : 0,
          missingCount: Array.isArray(payload.registryDiagnostics?.missingNodes) ? payload.registryDiagnostics.missingNodes.length : 0,
          deprecatedCount: Array.isArray(payload.registryDiagnostics?.deprecatedNodes) ? payload.registryDiagnostics.deprecatedNodes.length : 0
        });
      } catch {
        if (!cancelled) {
          setScreenBuilderStatus(null);
        }
      }
    }
    void loadScreenBuilderStatus();
    return () => {
      cancelled = true;
    };
  }, [governancePageId, selectedMenu, selectedMenuIsPage]);
  useEffect(() => {
    let cancelled = false;
    async function loadPublishedFlags() {
      const pageMenus = menuRows.filter((row) => row.code.length === 8);
      if (pageMenus.length === 0) {
        setScreenBuilderPublishedMap({});
        setScreenBuilderIssueMap({});
        setScreenBuilderIssueDetailMap({});
        return;
      }
      try {
        const entries = await Promise.all(pageMenus.map(async (row) => {
          try {
            const payload = await fetchScreenBuilderPage({
              menuCode: row.code,
              pageId: row.code.toLowerCase(),
              menuTitle: row.label,
              menuUrl: row.menuUrl || ""
            });
            const unregisteredCount = Array.isArray(payload.registryDiagnostics?.unregisteredNodes) ? payload.registryDiagnostics.unregisteredNodes.length : 0;
            const missingCount = Array.isArray(payload.registryDiagnostics?.missingNodes) ? payload.registryDiagnostics.missingNodes.length : 0;
            const deprecatedCount = Array.isArray(payload.registryDiagnostics?.deprecatedNodes) ? payload.registryDiagnostics.deprecatedNodes.length : 0;
            const issueCount = unregisteredCount + missingCount + deprecatedCount;
            return [row.code, { published: Boolean(payload.publishedVersionId), issueCount, unregisteredCount, missingCount, deprecatedCount }] as const;
          } catch {
            return [row.code, { published: false, issueCount: 0, unregisteredCount: 0, missingCount: 0, deprecatedCount: 0 }] as const;
          }
        }));
        if (cancelled) {
          return;
        }
        setScreenBuilderPublishedMap(Object.fromEntries(entries.map(([code, value]) => [code, value.published])));
        setScreenBuilderIssueMap(Object.fromEntries(entries.map(([code, value]) => [code, value.issueCount])));
        setScreenBuilderIssueDetailMap(Object.fromEntries(entries.map(([code, value]) => [code, {
          unregisteredCount: value.unregisteredCount,
          missingCount: value.missingCount,
          deprecatedCount: value.deprecatedCount
        }])));
      } catch {
        if (!cancelled) {
          setScreenBuilderPublishedMap({});
          setScreenBuilderIssueMap({});
          setScreenBuilderIssueDetailMap({});
        }
      }
    }
    void loadPublishedFlags();
    return () => {
      cancelled = true;
    };
  }, [menuRows]);
  const permissionSummary = useMemo(() => {
    const featureCount = featureRows.length;
    const linkedFeatureCount = featureRows.filter((row) => !Boolean(row.unassignedToRole)).length;
    const unassignedFeatureCount = featureRows.filter((row) => Boolean(row.unassignedToRole)).length;
    const assignedRoleTotal = featureRows.reduce((sum, row) => sum + numberOf(row, "assignedRoleCount"), 0);
    return {
      featureCount,
      linkedFeatureCount,
      unassignedFeatureCount,
      assignedRoleTotal
    };
  }, [featureRows]);
  const governanceRemediationItems = useMemo<GovernanceRemediationItem[]>(() => {
    const items: GovernanceRemediationItem[] = [];
    if (!selectedMenu || !selectedMenuIsPage) {
      return items;
    }
    if (!governanceOverview.pageId) {
      items.push({
        title: en ? "Link this menu to registry" : "이 메뉴를 registry에 연결",
        description: en
          ? "Create or save the page manifest so the menu is traceable from route to implementation."
          : "페이지 manifest를 생성하거나 저장해 메뉴를 route와 구현 정보에 연결하세요.",
        href: buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management"),
        actionLabel: en ? "Open Full-Stack Management" : "풀스택 관리 열기",
        actionKind: "link"
      });
    }
    if (governanceDraftOnly) {
      items.push({
        title: en ? "Promote draft metadata" : "draft 메타데이터 승격",
        description: en
          ? "Run auto-collection or save the screen registry so draft-only linkage becomes operational metadata."
          : "자동 수집 또는 화면 registry 저장으로 draft 연결을 운영 메타데이터로 승격하세요.",
        href: governancePageId ? undefined : buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio"),
        actionLabel: governancePageId ? (en ? "Run Auto Collect" : "자동 수집 실행") : (en ? "Open Platform Studio" : "플랫폼 스튜디오 열기"),
        actionKind: governancePageId ? "autoCollect" : "link"
      });
    }
    if (governanceOverview.apiIds.length === 0) {
      items.push({
        title: en ? "Collect backend API chain" : "백엔드 API 체인 수집",
        description: en
          ? "Review event-to-API mappings and persist controller/service/mapper linkage."
          : "이벤트-API 매핑을 검토하고 controller/service/mapper 연결을 저장하세요.",
        href: governancePageId ? undefined : buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio"),
        actionLabel: governancePageId ? (en ? "Run Auto Collect" : "자동 수집 실행") : (en ? "Review In Platform Studio" : "플랫폼 스튜디오에서 검토"),
        actionKind: governancePageId ? "autoCollect" : "link"
      });
    }
    if (governanceOverview.tableNames.length === 0) {
      items.push({
        title: en ? "Add DB metadata coverage" : "DB 메타데이터 보강",
        description: en
          ? "Register related schema and table metadata so operational impact can be traced before change."
          : "관련 스키마와 테이블 메타데이터를 등록해 변경 전 영향도를 추적 가능하게 하세요.",
        href: governancePageId ? undefined : buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management"),
        actionLabel: governancePageId ? (en ? "Run Auto Collect" : "자동 수집 실행") : (en ? "Review In Full-Stack Management" : "풀스택 관리에서 검토"),
        actionKind: governancePageId ? "autoCollect" : "link"
      });
    }
    if (permissionSummary.unassignedFeatureCount > 0) {
      items.push({
        title: en ? "Assign unlinked features to roles" : "미연결 기능을 권한 그룹에 할당",
        description: en
          ? "Open permission groups with the current menu scope and assign the remaining features."
          : "현재 메뉴 범위로 권한 그룹 화면을 열어 남은 기능을 연결하세요.",
        href: buildLocalizedPath(`/admin/auth/group?menuCode=${selectedMenu.code}`, `/en/admin/auth/group?menuCode=${selectedMenu.code}`),
        actionLabel: en ? "Open Permission Groups" : "권한 그룹 열기",
        actionKind: "permissions"
      });
    }
    return items;
  }, [en, governanceDraftOnly, governanceOverview.apiIds.length, governanceOverview.pageId, governanceOverview.tableNames.length, governancePageId, permissionSummary.unassignedFeatureCount, selectedMenu, selectedMenuIsPage]);
  const selectedMenuDiff = useMemo(() => {
    if (!selectedMenu) {
      return [];
    }
    const changes: string[] = [];
    if (selectedMenu.label !== selectedMenuDraft.codeNm) changes.push(`${en ? "Name" : "메뉴명"}: ${selectedMenu.label} -> ${selectedMenuDraft.codeNm}`);
    if (selectedMenu.labelEn !== selectedMenuDraft.codeDc) changes.push(`${en ? "English name" : "영문명"}: ${selectedMenu.labelEn} -> ${selectedMenuDraft.codeDc}`);
    if (selectedMenu.menuUrl !== selectedMenuDraft.menuUrl) changes.push(`URL: ${selectedMenu.menuUrl} -> ${selectedMenuDraft.menuUrl}`);
    if (selectedMenu.menuIcon !== selectedMenuDraft.menuIcon) changes.push(`${en ? "Icon" : "아이콘"}: ${selectedMenu.menuIcon} -> ${selectedMenuDraft.menuIcon}`);
    if (selectedMenu.useAt !== selectedMenuDraft.useAt) changes.push(`${en ? "Use" : "사용 여부"}: ${selectedMenu.useAt} -> ${selectedMenuDraft.useAt}`);
    return changes;
  }, [en, selectedMenu, selectedMenuDraft.codeDc, selectedMenuDraft.codeNm, selectedMenuDraft.menuIcon, selectedMenuDraft.menuUrl, selectedMenuDraft.useAt]);
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
    setFeatureSearch("");
    setFeatureLinkFilter("ALL");
    setSelectedMenuCode(menuType === "ADMIN" ? ENVIRONMENT_MANAGEMENT_MENU_CODE : "");
    setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
    setMenuIcon(iconOptions[0] || "web");
    setUseAt(useAtOptions[0] || "Y");
    setFeatureDraft(createEmptyFeatureDraft());
    setSelectedMenuDraft(createEmptySelectedMenuDraft());
    setMenuSaving(false);
    setPageDeleteImpactLoading(false);
    setPendingPageDeleteImpact(null);
    setPageDeleting(false);
    setEditingFeatureCode("");
    setEditingFeatureDraft(createEmptyFeatureDraft());
    setFeatureSaving(false);
    setDeleteImpactLoading(false);
    setDeleteImpactFeatureCode("");
    setPendingDeleteImpact(null);
    setFeatureDeleting(false);
    setGovernanceMessage("");
    setGovernanceError("");
    setGovernancePage(null);
    setRegistryEntry(null);
    setMetadataExpanded(false);
    setPostCollectAuditRows([]);
    setPostCollectTraceRows([]);
    setLastAutoCollectAt("");
  }, [menuType]);

  useEffect(() => {
    setMetadataExpanded(false);
  }, [selectedMenuCode]);

  useEffect(() => {
    setPostCollectAuditRows([]);
    setPostCollectTraceRows([]);
    setLastAutoCollectAt("");
  }, [selectedMenuCode]);

  useEffect(() => {
    setPendingPageDeleteImpact(null);
  }, [selectedMenuCode]);

  useEffect(() => {
    let cancelled = false;
    async function loadMenuAudit() {
      if (!selectedMenu || !selectedMenuIsPage) {
        setMenuAuditRows([]);
        return;
      }
      setMenuAuditLoading(true);
      try {
        const response = await fetchAuditEvents({ menuCode: selectedMenu.code, pageSize: 5 });
        if (!cancelled) {
          setMenuAuditRows(Array.isArray(response.items) ? response.items : []);
        }
      } catch {
        if (!cancelled) {
          setMenuAuditRows([]);
        }
      } finally {
        if (!cancelled) {
          setMenuAuditLoading(false);
        }
      }
    }
    void loadMenuAudit();
    return () => {
      cancelled = true;
    };
  }, [selectedMenu, selectedMenuIsPage]);

  useEffect(() => {
    if (!selectedMenu) {
      setSelectedMenuDraft(createEmptySelectedMenuDraft());
      return;
    }
    setSelectedMenuDraft({
      codeNm: selectedMenu.label,
      codeDc: selectedMenu.labelEn,
      menuUrl: selectedMenu.menuUrl,
      menuIcon: selectedMenu.menuIcon || (iconOptions[0] || "web"),
      useAt: selectedMenu.useAt || (useAtOptions[0] || "Y")
    });
  }, [iconOptions, selectedMenu, useAtOptions]);

  useEffect(() => {
    if (!editingFeatureCode) {
      setEditingFeatureDraft(createEmptyFeatureDraft());
      setPendingDeleteImpact(null);
      return;
    }
    const row = featureRows.find((item) => stringOf(item, "featureCode") === editingFeatureCode);
    if (!row) {
      setEditingFeatureDraft(createEmptyFeatureDraft());
      return;
    }
    setEditingFeatureDraft({
      featureCode: stringOf(row, "featureCode"),
      featureNm: stringOf(row, "featureNm"),
      featureNmEn: stringOf(row, "featureNmEn"),
      featureDc: stringOf(row, "featureDc"),
      useAt: stringOf(row, "useAt") || "Y"
    });
  }, [editingFeatureCode, featureRows]);

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

  async function handleSelectedMenuSave() {
    if (!selectedMenu) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setMenuSaving(true);
    try {
      const response = await updateEnvironmentManagedPage({
        menuType,
        code: selectedMenu.code,
        codeNm: selectedMenuDraft.codeNm,
        codeDc: selectedMenuDraft.codeDc,
        menuUrl: selectedMenuDraft.menuUrl,
        menuIcon: selectedMenuDraft.menuIcon,
        useAt: selectedMenuDraft.useAt
      });
      await menuPageState.reload();
      await featurePageState.reload();
      setActionMessage(String(response.message || (en ? "The selected menu has been updated." : "선택한 메뉴를 수정했습니다.")));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to update the selected menu." : "선택한 메뉴 수정에 실패했습니다."));
    } finally {
      setMenuSaving(false);
    }
  }

  async function prepareFeatureDelete(featureCode: string) {
    setActionError("");
    setActionMessage("");
    setDeleteImpactLoading(true);
    setDeleteImpactFeatureCode(featureCode);
    setPendingDeleteImpact(null);
    try {
      const response = await fetchEnvironmentFeatureImpact(featureCode);
      setPendingDeleteImpact({
        featureCode,
        assignedRoleCount: numberOf(response, "assignedRoleCount"),
        userOverrideCount: numberOf(response, "userOverrideCount")
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to load delete impact." : "삭제 영향도를 불러오지 못했습니다."));
    } finally {
      setDeleteImpactLoading(false);
    }
  }

  async function preparePageDelete() {
    if (!selectedMenu) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setPageDeleteImpactLoading(true);
    setPendingPageDeleteImpact(null);
    try {
      const response = await fetchEnvironmentManagedPageImpact(menuType, selectedMenu.code);
      setPendingPageDeleteImpact({
        code: String(response.code || selectedMenu.code),
        defaultViewFeatureCode: String(response.defaultViewFeatureCode || `${selectedMenu.code}_VIEW`),
        linkedFeatureCodes: Array.isArray(response.linkedFeatureCodes) ? response.linkedFeatureCodes.map(String) : [],
        nonDefaultFeatureCodes: Array.isArray(response.nonDefaultFeatureCodes) ? response.nonDefaultFeatureCodes.map(String) : [],
        defaultViewRoleRefCount: numberOf(response, "defaultViewRoleRefCount"),
        defaultViewUserOverrideCount: numberOf(response, "defaultViewUserOverrideCount"),
        blocked: Boolean(response.blocked)
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to load page delete impact." : "페이지 삭제 영향도를 불러오지 못했습니다."));
    } finally {
      setPageDeleteImpactLoading(false);
    }
  }

  async function confirmPageDelete() {
    if (!selectedMenu || !pendingPageDeleteImpact || pendingPageDeleteImpact.blocked) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setPageDeleting(true);
    try {
      const response = await deleteEnvironmentManagedPage(menuType, selectedMenu.code);
      await menuPageState.reload();
      await featurePageState.reload();
      setPendingPageDeleteImpact(null);
      setEditingFeatureCode("");
      setSelectedMenuCode("");
      setActionMessage(String(response.message || (en ? "The page menu has been deleted." : "페이지 메뉴를 삭제했습니다.")));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to delete the selected page menu." : "선택한 페이지 메뉴 삭제에 실패했습니다."));
    } finally {
      setPageDeleting(false);
    }
  }

  async function confirmFeatureDelete() {
    if (!pendingDeleteImpact) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setFeatureDeleting(true);
    try {
      const response = await deleteEnvironmentFeature(pendingDeleteImpact.featureCode);
      await featurePageState.reload();
      setPendingDeleteImpact(null);
      setDeleteImpactFeatureCode("");
      if (editingFeatureCode === pendingDeleteImpact.featureCode) {
        setEditingFeatureCode("");
      }
      setActionMessage(String(response.message || (en ? "The feature has been deleted." : "기능을 삭제했습니다.")));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to delete the feature." : "기능 삭제에 실패했습니다."));
    } finally {
      setFeatureDeleting(false);
    }
  }

  async function handleFeatureUpdate() {
    if (!selectedMenu || !editingFeatureCode) {
      return;
    }
    setActionError("");
    setActionMessage("");
    setFeatureSaving(true);
    try {
      const response = await updateEnvironmentFeature({
        menuType,
        menuCode: selectedMenu.code,
        featureCode: editingFeatureDraft.featureCode,
        featureNm: editingFeatureDraft.featureNm,
        featureNmEn: editingFeatureDraft.featureNmEn,
        featureDc: editingFeatureDraft.featureDc,
        useAt: editingFeatureDraft.useAt
      });
      await featurePageState.reload();
      setActionMessage(String(response.message || (en ? "The feature has been updated." : "기능을 수정했습니다.")));
      setPendingDeleteImpact(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : (en ? "Failed to update the feature." : "기능 수정에 실패했습니다."));
    } finally {
      setFeatureSaving(false);
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
      setMetadataExpanded(true);
      setGovernanceMessage(response.message || (en ? "Metadata collected and saved." : "메타데이터를 자동 수집하고 저장했습니다."));
      setLastAutoCollectAt(new Date().toISOString());
      const [auditResponse, traceResponse] = await Promise.all([
        fetchAuditEvents({ menuCode: selectedMenu.code, pageId: governancePageId, pageSize: 3 }).catch(() => ({ items: [] })),
        fetchTraceEvents({ pageId: governancePageId, pageSize: 3 }).catch(() => ({ items: [] }))
      ]);
      setPostCollectAuditRows(Array.isArray(auditResponse.items) ? auditResponse.items : []);
      setPostCollectTraceRows(Array.isArray(traceResponse.items) ? traceResponse.items : []);
    } catch (error) {
      setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to collect metadata." : "메타데이터 수집에 실패했습니다."));
    } finally {
      setCollecting(false);
    }
    try {
      await menuPageState.reload();
      await featurePageState.reload();
    } catch (error) {
      setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to refresh metadata summary after collection." : "수집 후 메타데이터 요약 새로고침에 실패했습니다."));
    }
  }

  function scrollToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyScreenBuilderIssueView(reason: "UNREGISTERED" | "MISSING" | "DEPRECATED") {
    setMenuSearch("");
    setScreenBuilderFilter("BLOCKED_ONLY");
    setScreenBuilderIssueReasonFilter(reason);
    const firstMatch = menuRows.find((row) => {
      if (row.code.length !== 8) {
        return false;
      }
      const detail = screenBuilderIssueDetailMap[row.code];
      return matchesScreenBuilderIssueReason(detail, reason);
    });
    if (firstMatch?.code) {
      setSelectedMenuCode(firstMatch.code);
    }
    window.setTimeout(() => scrollToSection("environment-search-menu"), 0);
  }

  function moveToSameIssueMenu(targetMenuCode: string) {
    if (!targetMenuCode || !selectedIssueReason) {
      return;
    }
    setMenuSearch("");
    setScreenBuilderFilter("BLOCKED_ONLY");
    setScreenBuilderIssueReasonFilter(selectedIssueReason);
    setSelectedMenuCode(targetMenuCode);
    window.setTimeout(() => scrollToSection("environment-search-menu"), 0);
  }

  function moveToSameIssueQueueMode(mode: "PUBLISHED" | "DRAFT") {
    const targetMenu = mode === "PUBLISHED" ? nextRemainingPublishedSameIssueMenu : nextRemainingDraftSameIssueMenu;
    if (!targetMenu?.code) {
      return;
    }
    moveToSameIssueMenu(targetMenu.code);
  }

  function applySameIssueQueueFilter(mode: "PUBLISHED" | "DRAFT") {
    if (!selectedIssueReason) {
      return;
    }
    setMenuSearch("");
    setScreenBuilderIssueReasonFilter(selectedIssueReason);
    setScreenBuilderFilter(mode === "PUBLISHED" ? "PUBLISHED_ONLY" : "DRAFT_ONLY");
    const targetMenu = mode === "PUBLISHED" ? nextRemainingPublishedSameIssueMenu : nextRemainingDraftSameIssueMenu;
    if (targetMenu?.code) {
      setSelectedMenuCode(targetMenu.code);
    }
    window.setTimeout(() => scrollToSection("environment-search-menu"), 0);
  }

  function applySameIssueBlockedFilter() {
    if (!selectedIssueReason) {
      return;
    }
    setMenuSearch("");
    setScreenBuilderIssueReasonFilter(selectedIssueReason);
    setScreenBuilderFilter("BLOCKED_ONLY");
    window.setTimeout(() => scrollToSection("environment-search-menu"), 0);
  }

  function runGovernanceAction(item: GovernanceRemediationItem) {
    if (item.actionKind === "autoCollect") {
      setMetadataExpanded(true);
      void handleAutoCollect();
      return;
    }
    if (item.actionKind === "permissions") {
      if (item.href) {
        window.location.href = item.href;
      }
      return;
    }
    if (item.href) {
      window.location.href = item.href;
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
      <AdminWorkspacePageFrame>
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

      <DiagnosticCard
        description={en
          ? "Register the target menu under a group code, assign the runtime URL, let the default VIEW permission be created automatically, and then add page-specific feature codes without switching to multiple screens."
          : "그룹 메뉴 아래에 대상 메뉴를 등록하고 URL을 할당하면 기본 VIEW 권한이 함께 생성됩니다. 이후 선택 메뉴 기준으로 기능 코드를 바로 추가해 여러 화면을 오가지 않도록 구성했습니다."}
        summary={(
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
            <div className="mt-4 flex flex-wrap gap-2">
              <MemberButton onClick={() => scrollToSection("environment-register-menu")} size="sm" type="button" variant="secondary">
                {en ? "Register Menu" : "메뉴 등록"}
              </MemberButton>
              <MemberButton onClick={() => scrollToSection("environment-search-menu")} size="sm" type="button" variant="secondary">
                {en ? "Search Menu" : "메뉴 검색"}
              </MemberButton>
              <MemberButton onClick={() => scrollToSection("environment-feature-management")} size="sm" type="button" variant="secondary">
                {en ? "Manage Features" : "기능 관리"}
              </MemberButton>
              <MemberButton onClick={() => scrollToSection("environment-metadata")} size="sm" type="button" variant="secondary">
                {en ? "Metadata" : "메타데이터"}
              </MemberButton>
            </div>
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
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Menus" : "메뉴 수"}</p>
                <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{filteredMenus.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Features" : "기능 수"}</p>
                <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{featureRows.length}</p>
              </div>
            </div>
          </div>
        </div>
        )}
        title={en ? "Unified Workspace" : "통합 작업공간"}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" data-help-id="environment-management-cards">
        <div className="space-y-6">
          <section className="gov-card" id="environment-register-menu">
            <GridToolbar title={en ? "Register New Menu" : "신규 메뉴 등록"} />
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
                <p className={`mt-2 text-xs ${createUrlValidation.tone === "success" ? "text-emerald-700" : "text-amber-700"}`}>{createUrlValidation.message}</p>
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
              <MemberButton disabled={createUrlValidation.tone !== "success"} onClick={() => { void createPageMenu().catch((error: Error) => setActionError(error.message)); }} type="button" variant="primary">
                {en ? "Create Menu + Default Permission" : "메뉴 등록 + 기본 권한 생성"}
              </MemberButton>
            </div>
          </section>

          <section className="gov-card" id="environment-search-menu">
            <GridToolbar title={en ? "Search Menu" : "메뉴 검색"} />
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white px-3 py-1 font-bold text-[var(--kr-gov-text-primary)]">
                  {en ? `Results ${filteredMenus.length}` : `검색 결과 ${filteredMenus.length}건`}
                </span>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[var(--kr-gov-text-secondary)]">
                  {en ? `Pages ${screenBuilderPageCounts.totalPages}` : `페이지 ${screenBuilderPageCounts.totalPages}건`}
                </span>
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                  {en ? `Published ${screenBuilderPageCounts.publishedPages}` : `Publish ${screenBuilderPageCounts.publishedPages}건`}
                </span>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                  {en ? `Ready ${screenBuilderPageCounts.readyPages}` : `가능 ${screenBuilderPageCounts.readyPages}건`}
                </span>
                <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                  {en ? `Blocked ${screenBuilderPageCounts.blockedPages}` : `차단 ${screenBuilderPageCounts.blockedPages}건`}
                </span>
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                  {en ? `No Publish ${screenBuilderPageCounts.draftOnlyPages}` : `미발행 ${screenBuilderPageCounts.draftOnlyPages}건`}
                </span>
                <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                  {en ? `Issues ${screenBuilderPageCounts.issuePages}` : `이슈 ${screenBuilderPageCounts.issuePages}건`}
                </span>
                <MemberButton
                  onClick={() => setScreenBuilderIssueReasonFilter("UNREGISTERED")}
                  size="xs"
                  type="button"
                  variant={screenBuilderIssueReasonFilter === "UNREGISTERED" ? "primary" : "secondary"}
                >
                  {en ? `Unregistered ${screenBuilderPageCounts.unregisteredPages}` : `미등록 ${screenBuilderPageCounts.unregisteredPages}건`}
                </MemberButton>
                <MemberButton
                  onClick={() => setScreenBuilderIssueReasonFilter("MISSING")}
                  size="xs"
                  type="button"
                  variant={screenBuilderIssueReasonFilter === "MISSING" ? "primary" : "secondary"}
                >
                  {en ? `Missing ${screenBuilderPageCounts.missingPages}` : `누락 ${screenBuilderPageCounts.missingPages}건`}
                </MemberButton>
                <MemberButton
                  onClick={() => setScreenBuilderIssueReasonFilter("DEPRECATED")}
                  size="xs"
                  type="button"
                  variant={screenBuilderIssueReasonFilter === "DEPRECATED" ? "primary" : "secondary"}
                >
                  {en ? `Deprecated ${screenBuilderPageCounts.deprecatedPages}` : `Deprecated ${screenBuilderPageCounts.deprecatedPages}건`}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("ALL")} size="xs" type="button" variant={screenBuilderFilter === "ALL" ? "primary" : "secondary"}>
                  {en ? "All Menus" : "전체 메뉴"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("PUBLISHED_ONLY")} size="xs" type="button" variant={screenBuilderFilter === "PUBLISHED_ONLY" ? "primary" : "secondary"}>
                  {en ? "Published Only" : "Publish만"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("DRAFT_ONLY")} size="xs" type="button" variant={screenBuilderFilter === "DRAFT_ONLY" ? "primary" : "secondary"}>
                  {en ? "No Publish Yet" : "Publish 없음"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("READY_ONLY")} size="xs" type="button" variant={screenBuilderFilter === "READY_ONLY" ? "primary" : "secondary"}>
                  {en ? "Ready Only" : "가능만"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("BLOCKED_ONLY")} size="xs" type="button" variant={screenBuilderFilter === "BLOCKED_ONLY" ? "primary" : "secondary"}>
                  {en ? "Blocked Only" : "차단만"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderFilter("ISSUE_ONLY")} size="xs" type="button" variant={screenBuilderFilter === "ISSUE_ONLY" ? "primary" : "secondary"}>
                  {en ? "Issues Only" : "이슈만"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderIssueReasonFilter("ALL")} size="xs" type="button" variant={screenBuilderIssueReasonFilter === "ALL" ? "primary" : "secondary"}>
                  {en ? "All Reasons" : "전체 사유"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderIssueReasonFilter("UNREGISTERED")} size="xs" type="button" variant={screenBuilderIssueReasonFilter === "UNREGISTERED" ? "primary" : "secondary"}>
                  {en ? "Unregistered" : "미등록"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderIssueReasonFilter("MISSING")} size="xs" type="button" variant={screenBuilderIssueReasonFilter === "MISSING" ? "primary" : "secondary"}>
                  {en ? "Missing" : "누락"}
                </MemberButton>
                <MemberButton onClick={() => setScreenBuilderIssueReasonFilter("DEPRECATED")} size="xs" type="button" variant={screenBuilderIssueReasonFilter === "DEPRECATED" ? "primary" : "secondary"}>
                  {en ? "Deprecated" : "Deprecated"}
                </MemberButton>
                {hasActiveScreenBuilderFilter ? (
                  <>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[var(--kr-gov-text-secondary)]">
                      {en ? "Active filter" : "적용 필터"}: {activeScreenBuilderFilterLabel}
                    </span>
                    <MemberButton
                      onClick={() => {
                        setScreenBuilderFilter("ALL");
                        setScreenBuilderIssueReasonFilter("ALL");
                      }}
                      size="xs"
                      type="button"
                      variant="secondary"
                    >
                      {en ? "Reset Filters" : "필터 초기화"}
                    </MemberButton>
                  </>
                ) : null}
                {selectedMenu ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[var(--kr-gov-text-secondary)]">
                    {en ? "Selected" : "선택 메뉴"}: {selectedMenu.label} ({selectedMenu.code})
                  </span>
                ) : null}
              </div>
              <p className="text-[var(--kr-gov-text-secondary)]">
                {en ? "Search by code, label, or runtime URL." : "코드, 메뉴명, URL 기준으로 바로 찾을 수 있습니다."}
              </p>
            </div>

            {selectedIssueReason ? (
              <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-blue-800">
                      {en
                        ? `Menu search result list is focused on ${describeScreenBuilderIssueReason(selectedIssueReason, en)} issue pages.`
                        : `메뉴 검색 결과 목록은 ${describeScreenBuilderIssueReason(selectedIssueReason, en)} 이슈가 있는 페이지 메뉴를 중심으로 보고 있습니다.`}
                    </p>
                    <p className="text-blue-700">
                      {en
                        ? `Visible page menus ${visibleSameIssueMenus.length} of ${sameIssueMenus.length} in this issue family.`
                        : `현재 이 이슈군의 페이지 메뉴 ${sameIssueMenus.length}건 중 ${visibleSameIssueMenus.length}건이 검색 결과 목록에 표시되고 있습니다.`}
                    </p>
                    <p className="text-blue-700">
                      {en
                        ? "Issue-family menus are pinned to the top of the search result list in queue order."
                        : "이 이슈군의 페이지 메뉴는 검색 결과 목록 상단에 정리 순서대로 먼저 배치됩니다."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <MemberButton onClick={applySameIssueBlockedFilter} size="xs" type="button" variant="secondary">
                      {en ? "Show blocked issue list" : "같은 이슈 목록 보기"}
                    </MemberButton>
                    <MemberButton
                      onClick={() => {
                        setScreenBuilderFilter("ALL");
                        setScreenBuilderIssueReasonFilter("ALL");
                      }}
                      size="xs"
                      type="button"
                      variant="secondary"
                    >
                      {en ? "Clear issue focus" : "이슈 집중 해제"}
                    </MemberButton>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="gov-table-header">
                    <th className="px-4 py-3">{en ? "Menu" : "메뉴"}</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3 text-center">{en ? "Type" : "유형"}</th>
                    <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                    <th className="px-4 py-3 text-center">{en ? "Select" : "선택"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderedFilteredMenus.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                        <div className="flex flex-col items-center gap-2">
                          <p>
                            {hasActiveScreenBuilderFilter
                              ? (en
                                ? `No menus matched the active builder filter: ${activeScreenBuilderFilterLabel}.`
                                : `현재 빌더 필터(${activeScreenBuilderFilterLabel})에 맞는 메뉴가 없습니다.`)
                              : (en ? "No menus matched the search." : "검색 조건에 맞는 메뉴가 없습니다.")}
                          </p>
                          {hasActiveScreenBuilderFilter ? (
                            <MemberButton
                              onClick={() => {
                                setScreenBuilderFilter("ALL");
                                setScreenBuilderIssueReasonFilter("ALL");
                              }}
                              size="xs"
                              type="button"
                              variant="secondary"
                            >
                              {en ? "Reset Builder Filters" : "빌더 필터 초기화"}
                            </MemberButton>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ) : orderedFilteredMenus.map((row, index) => {
                    const selected = row.code === selectedMenuCode;
                    const rowIssueCount = screenBuilderIssueMap[row.code] || 0;
                    const rowIssueDetail = screenBuilderIssueDetailMap[row.code] || { unregisteredCount: 0, missingCount: 0, deprecatedCount: 0 };
                    const rowPublishReady = row.code.length === 8 && rowIssueCount === 0;
                    const rowInSameIssueFamily = sameIssueMenuCodeSet.has(row.code);
                    const rowSameIssuePosition = rowInSameIssueFamily ? (sameIssueIndexMap[row.code] ?? -1) + 1 : 0;
                    const rowSameIssueRemaining = rowInSameIssueFamily ? (sameIssueRemainingMap[row.code] ?? 0) : 0;
                    const rowIsCurrentIssueTarget = selectedMenu?.code === row.code && rowInSameIssueFamily;
                    const rowIsPreviousIssueTarget = previousSameIssueMenu?.code === row.code;
                    const rowIsNextIssueTarget = nextSameIssueMenu?.code === row.code;
                    const rowToneClass = rowIsCurrentIssueTarget
                      ? "bg-blue-50 ring-1 ring-blue-200"
                      : rowIsNextIssueTarget
                        ? "bg-emerald-50"
                        : rowIsPreviousIssueTarget
                          ? "bg-amber-50"
                          : selected
                            ? "bg-[rgba(28,100,242,0.04)]"
                            : "";
                    const showOtherMenusDivider = Boolean(
                      selectedIssueReason
                      && visibleSameIssueMenus.length > 0
                      && visibleSameIssueMenus.length < orderedFilteredMenus.length
                      && index === visibleSameIssueMenus.length
                    );
                    const showIssueQueueDivider = Boolean(
                      selectedIssueReason
                      && visibleSameIssueMenus.length > 0
                      && index === 0
                      && rowInSameIssueFamily
                    );
                    return (
                      <Fragment key={row.code}>
                        {showIssueQueueDivider ? (
                          <tr className="bg-blue-100/70">
                            <td className="px-4 py-2 text-[11px] text-blue-800" colSpan={5}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold uppercase tracking-[0.08em]">
                                  {en
                                    ? `Current issue queue menus · ${describeScreenBuilderIssueReason(selectedIssueReason, en)}`
                                    : `현재 이슈 큐 메뉴 · ${describeScreenBuilderIssueReason(selectedIssueReason, en)}`}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex rounded-full border border-blue-200 bg-white px-2 py-0.5 font-bold text-blue-800">
                                    {en ? `Share ${visibleSameIssueRatio}%` : `비중 ${visibleSameIssueRatio}%`}
                                  </span>
                                  <MemberButton onClick={applySameIssueBlockedFilter} size="xs" type="button" variant="secondary">
                                    {en ? "Show only this queue" : "이 구간만 보기"}
                                  </MemberButton>
                                </div>
                              </div>
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-200/70">
                                <div className="h-full rounded-full bg-blue-600" style={{ width: `${visibleSameIssueRatio}%` }} />
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 font-bold">
                                <span>{en ? `Visible ${visibleSameIssueMenus.length} / Total ${sameIssueMenus.length}` : `표시 ${visibleSameIssueMenus.length}건 / 전체 ${sameIssueMenus.length}건`}</span>
                                <span>{en ? `Published ${sameIssueQueueSummary.totalPublished}` : `Publish ${sameIssueQueueSummary.totalPublished}건`}</span>
                                <span>{en ? `Drafts ${sameIssueQueueSummary.totalDraft}` : `초안 ${sameIssueQueueSummary.totalDraft}건`}</span>
                                <span>{en ? `Ready ${visibleSameIssueReadyCount}` : `가능 ${visibleSameIssueReadyCount}건`}</span>
                                <span>{en ? `Blocked ${visibleSameIssueBlockedCount}` : `차단 ${visibleSameIssueBlockedCount}건`}</span>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        {showOtherMenusDivider ? (
                          <tr key={`${row.code}-divider`} className="bg-slate-100/80">
                            <td className="px-4 py-2 text-[11px] text-[var(--kr-gov-text-secondary)]" colSpan={5}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold uppercase tracking-[0.08em]">
                                  {en ? "Other menus outside this issue queue" : "현재 이슈 큐 밖의 다른 메뉴"}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 font-bold text-[var(--kr-gov-text-primary)]">
                                    {en ? `Share ${visibleOtherRatio}%` : `비중 ${visibleOtherRatio}%`}
                                  </span>
                                  <MemberButton
                                    onClick={() => {
                                      setScreenBuilderFilter("ALL");
                                      setScreenBuilderIssueReasonFilter("ALL");
                                      window.setTimeout(() => scrollToSection("environment-search-menu"), 0);
                                    }}
                                    size="xs"
                                    type="button"
                                    variant="secondary"
                                  >
                                    {en ? "Show outside queue" : "이 구간만 보기"}
                                  </MemberButton>
                                </div>
                              </div>
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div className="h-full rounded-full bg-slate-500" style={{ width: `${visibleOtherRatio}%` }} />
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 font-bold">
                                <span>{en ? `Menus ${visibleOtherMenus.length}` : `메뉴 ${visibleOtherMenus.length}건`}</span>
                                <span>{en ? `Published ${visibleOtherPublishedCount}` : `Publish ${visibleOtherPublishedCount}건`}</span>
                                <span>{en ? `Drafts ${visibleOtherDraftCount}` : `초안 ${visibleOtherDraftCount}건`}</span>
                                <span>{en ? `Ready ${visibleOtherReadyCount}` : `가능 ${visibleOtherReadyCount}건`}</span>
                                <span>{en ? `Blocked ${visibleOtherBlockedCount}` : `차단 ${visibleOtherBlockedCount}건`}</span>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        <tr key={row.code} className={rowToneClass}>
                          <td className="px-4 py-3">
                          <p className="font-bold">{row.label}</p>
                          <p className="text-xs text-[var(--kr-gov-text-secondary)]">{row.code} / {row.parentCode}</p>
                          {row.code.length === 8 ? (
                            <>
                              {rowInSameIssueFamily ? (
                                <p className="mt-1 flex flex-wrap gap-1">
                                  {rowIsCurrentIssueTarget ? (
                                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                      {en ? "Current issue target" : "현재 이슈 대상"}
                                    </span>
                                  ) : null}
                                  {rowIsPreviousIssueTarget ? (
                                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                      {en ? "Previous issue target" : "이전 이슈 대상"}
                                    </span>
                                  ) : null}
                                  {rowIsNextIssueTarget ? (
                                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                      {en ? "Next issue target" : "다음 이슈 대상"}
                                    </span>
                                  ) : null}
                                  {!rowIsCurrentIssueTarget && !rowIsPreviousIssueTarget && !rowIsNextIssueTarget ? (
                                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                      {en ? "Same issue family" : "같은 이슈군"}
                                    </span>
                                  ) : null}
                                  {rowSameIssuePosition > 0 ? (
                                    <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                      {en
                                        ? `Position ${rowSameIssuePosition}/${sameIssueMenus.length}`
                                        : `순번 ${rowSameIssuePosition}/${sameIssueMenus.length}`}
                                    </span>
                                  ) : null}
                                  {rowSameIssuePosition > 0 ? (
                                    <span className="inline-flex rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                      {en
                                        ? `Remaining ${rowSameIssueRemaining}`
                                        : `남은 ${rowSameIssueRemaining}건`}
                                    </span>
                                  ) : null}
                                </p>
                              ) : null}
                              <p className="mt-1 flex flex-wrap gap-1">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${screenBuilderPublishedMap[row.code] ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                  {screenBuilderPublishedMap[row.code] ? (en ? "Published" : "Publish") : (en ? "Draft" : "초안")}
                                </span>
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${rowPublishReady ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  {rowPublishReady ? (en ? "Ready" : "가능") : (en ? "Blocked" : "차단")}
                                </span>
                                {rowIssueCount > 0 ? (
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700">
                                    {en ? `Issues ${rowIssueCount}` : `이슈 ${rowIssueCount}`}
                                  </span>
                                ) : null}
                                {rowIssueDetail.unregisteredCount > 0 ? (
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700">
                                    {en ? `U ${rowIssueDetail.unregisteredCount}` : `미 ${rowIssueDetail.unregisteredCount}`}
                                  </span>
                                ) : null}
                                {rowIssueDetail.missingCount > 0 ? (
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700">
                                    {en ? `M ${rowIssueDetail.missingCount}` : `누 ${rowIssueDetail.missingCount}`}
                                  </span>
                                ) : null}
                                {rowIssueDetail.deprecatedCount > 0 ? (
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-fuchsia-100 text-fuchsia-700">
                                    {en ? `D ${rowIssueDetail.deprecatedCount}` : `D ${rowIssueDetail.deprecatedCount}`}
                                  </span>
                                ) : null}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <MemberLinkButton
                                  href={buildLocalizedPath(
                                    `/admin/system/screen-builder?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&menuTitle=${encodeURIComponent(row.label)}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`,
                                    `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&menuTitle=${encodeURIComponent(row.label)}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`
                                  )}
                                  size="xs"
                                  variant={rowPublishReady ? "secondary" : "info"}
                                >
                                  {en ? "Builder" : "빌더"}
                                </MemberLinkButton>
                                {screenBuilderPublishedMap[row.code] ? (
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/screen-runtime?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&menuTitle=${encodeURIComponent(row.label)}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`,
                                      `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&menuTitle=${encodeURIComponent(row.label)}&menuUrl=${encodeURIComponent(row.menuUrl || "")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Runtime" : "런타임"}
                                  </MemberLinkButton>
                                ) : null}
                                <MemberLinkButton
                                  href={buildLocalizedPath(
                                    `/admin/system/observability?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                    `/en/admin/system/observability?menuCode=${encodeURIComponent(row.code)}&pageId=${encodeURIComponent(row.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                  )}
                                  size="xs"
                                  variant="secondary"
                                >
                                  {en ? "Activity" : "활동"}
                                </MemberLinkButton>
                              </div>
                            </>
                          ) : null}
                          {row.code.length === 8 ? (
                            <p className={`mt-1 text-[11px] ${rowPublishReady ? "text-emerald-700" : "text-red-700"}`}>
                              {summarizeBuilderBlockingReason(rowIssueCount, en)}
                            </p>
                          ) : null}
                        </td>
                          <td className="px-4 py-3 break-all text-[var(--kr-gov-text-secondary)]">{row.menuUrl}</td>
                          <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${row.code.length === 8 ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"}`}>
                            {row.code.length === 8 ? (en ? "Page" : "페이지") : (en ? "Group" : "그룹")}
                          </span>
                          </td>
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
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="gov-card min-w-0">
            <GridToolbar title={en ? "Selected Menu / Edit" : "선택 메뉴 / 수정"} />
            {selectedMenu ? (
              <div className="space-y-4">
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
                <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                  {en
                    ? "This panel updates the selected page menu in place without leaving the screen."
                    : "이 패널에서 화면 이동 없이 선택한 페이지 메뉴의 이름, URL, 아이콘, 사용 여부를 바로 수정합니다."}
                </div>
                <div className="flex flex-wrap gap-2">
                  <MemberLinkButton href={buildLocalizedPath("/admin/auth/group", "/en/admin/auth/group")} size="sm" variant="secondary">
                    {en ? "Open Permission Groups" : "권한 그룹 바로가기"}
                  </MemberLinkButton>
                  <MemberLinkButton href={buildLocalizedPath(`/admin/system/feature-management?menuType=${encodeURIComponent(menuType)}&searchMenuCode=${encodeURIComponent(selectedMenu.code)}`, `/en/admin/system/feature-management?menuType=${encodeURIComponent(menuType)}&searchMenuCode=${encodeURIComponent(selectedMenu.code)}`)} size="sm" variant="secondary">
                    {en ? "Open Feature Management" : "기능 관리 바로가기"}
                  </MemberLinkButton>
                  {selectedMenuIsPage ? (
                    <>
                      <MemberLinkButton
                        href={buildLocalizedPath(
                          `/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`,
                          `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`
                        )}
                        size="sm"
                        variant="info"
                      >
                        {en ? "Open Screen Builder" : "화면 빌더 열기"}
                      </MemberLinkButton>
                      <MemberLinkButton
                        href={buildLocalizedPath(
                          `/admin/system/screen-runtime?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`,
                          `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`
                        )}
                        size="sm"
                        variant="secondary"
                      >
                        {en ? "Open Published Runtime" : "발행 런타임 열기"}
                      </MemberLinkButton>
                      <MemberLinkButton
                        href={buildLocalizedPath(
                          `/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                          `/en/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                        )}
                        size="sm"
                        variant="secondary"
                      >
                        {en ? "Open Builder Activity" : "빌더 활동 열기"}
                      </MemberLinkButton>
                    </>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Linked Features" : "연결 기능"}</p>
                    <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{permissionSummary.linkedFeatureCount} / {permissionSummary.featureCount}</p>
                    <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">
                      {en ? "Features already connected to at least one role group" : "권한 그룹에 1개 이상 연결된 기능 수"}
                    </p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Role Links" : "권한 연결 수"}</p>
                    <p className="mt-1 text-lg font-black text-[var(--kr-gov-text-primary)]">{permissionSummary.assignedRoleTotal}</p>
                    <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">
                      {permissionSummary.unassignedFeatureCount > 0
                        ? (en ? `${permissionSummary.unassignedFeatureCount} features still need review` : `${permissionSummary.unassignedFeatureCount}개 기능 추가 검토 필요`)
                        : (en ? "All registered features are mapped" : "등록 기능이 모두 매핑됨")}
                    </p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Screen Builder" : "화면 빌더"}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${screenBuilderStatus?.publishedVersionId ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {screenBuilderStatus?.publishedVersionId ? (en ? "Published" : "Publish 있음") : (en ? "Draft Only" : "초안만 있음")}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${selectedMenuPublishReady ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {selectedMenuPublishReady
                          ? (en ? "Publish Ready" : "Publish 가능")
                          : (en ? "Publish Blocked" : "Publish 차단")}
                      </span>
                      <span className="text-sm text-[var(--kr-gov-text-secondary)]">
                        {en ? "Snapshots" : "스냅샷"}: {screenBuilderStatus?.versionCount || 0}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${selectedMenuBuilderIssueCount > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {en ? "Registry Issues" : "레지스트리 이슈"}: {selectedMenuBuilderIssueCount}
                      </span>
                      {screenBuilderStatus?.publishedVersionId ? (
                        <>
                          <span className="font-mono text-[11px] text-[var(--kr-gov-text-secondary)]">{screenBuilderStatus.publishedVersionId}</span>
                          {screenBuilderStatus.publishedSavedAt ? (
                            <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">{screenBuilderStatus.publishedSavedAt}</span>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    {screenBuilderStatus ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-4">
                        <div className={`rounded border px-3 py-2 ${selectedMenuPublishReady ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                          <p className={`text-[11px] font-black uppercase tracking-[0.08em] ${selectedMenuPublishReady ? "text-emerald-800" : "text-red-800"}`}>{en ? "Publish Readiness" : "Publish 준비 상태"}</p>
                          <p className={`mt-1 text-sm font-bold ${selectedMenuPublishReady ? "text-emerald-900" : "text-red-900"}`}>
                            {selectedMenuPublishReady
                              ? (en ? "Ready now" : "지금 가능")
                              : (en ? `${selectedMenuBuilderIssueCount} issues blocking` : `${selectedMenuBuilderIssueCount}건 차단`)}
                          </p>
                          <p className={`mt-1 text-[11px] ${selectedMenuPublishReady ? "text-emerald-700" : "text-red-700"}`}>
                            {summarizeBuilderIssueBreakdown(screenBuilderStatus, en)}
                          </p>
                          <p className={`mt-2 text-[11px] font-medium ${selectedMenuPublishReady ? "text-emerald-800" : "text-red-800"}`}>
                            {en ? "Next action" : "권장 다음 조치"}: {recommendBuilderNextAction(screenBuilderStatus, en)}
                          </p>
                        </div>
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Unregistered" : "미등록"}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{screenBuilderStatus.unregisteredCount}</p>
                        </div>
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Missing" : "누락"}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{screenBuilderStatus.missingCount}</p>
                        </div>
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Deprecated</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{screenBuilderStatus.deprecatedCount}</p>
                        </div>
                      </div>
                    ) : null}
                    {selectedMenuIsPage && selectedBuilderStatus ? (
                      <div className={`mt-3 rounded-[var(--kr-gov-radius)] border px-4 py-3 ${selectedMenuPublishReady ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className={`text-xs font-black uppercase tracking-[0.08em] ${selectedMenuPublishReady ? "text-emerald-800" : "text-red-800"}`}>
                              {en ? "Recommended Builder Action" : "권장 빌더 작업"}
                            </p>
                            <p className={`mt-1 text-sm font-bold ${selectedMenuPublishReady ? "text-emerald-900" : "text-red-900"}`}>
                              {recommendBuilderNextAction(selectedBuilderStatus, en)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <MemberLinkButton
                              href={buildLocalizedPath(
                                `/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`,
                                `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`
                              )}
                              size="sm"
                              variant={selectedMenuPublishReady ? "secondary" : "info"}
                            >
                              {en ? "Open Builder Now" : "지금 빌더 열기"}
                            </MemberLinkButton>
                            <MemberLinkButton
                              href={buildLocalizedPath(
                                `/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                `/en/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                              )}
                              size="sm"
                              variant="secondary"
                            >
                              {en ? "Check Builder Activity" : "빌더 활동 확인"}
                            </MemberLinkButton>
                          </div>
                        </div>
                        {(selectedBuilderStatus!.unregisteredCount > 0 || selectedBuilderStatus!.missingCount > 0 || selectedBuilderStatus!.deprecatedCount > 0) ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                              {en ? "View pages with same issue" : "같은 유형 페이지 보기"}
                            </span>
                            {selectedBuilderStatus!.unregisteredCount > 0 ? (
                              <MemberButton
                                onClick={() => applyScreenBuilderIssueView("UNREGISTERED")}
                                size="xs"
                                type="button"
                                variant="secondary"
                              >
                                {en ? `Unregistered pages ${screenBuilderIssuePageCounts.UNREGISTERED}` : `미등록 페이지 ${screenBuilderIssuePageCounts.UNREGISTERED}건`}
                              </MemberButton>
                            ) : null}
                            {selectedBuilderStatus!.missingCount > 0 ? (
                              <MemberButton
                                onClick={() => applyScreenBuilderIssueView("MISSING")}
                                size="xs"
                                type="button"
                                variant="secondary"
                              >
                                {en ? `Missing pages ${screenBuilderIssuePageCounts.MISSING}` : `누락 페이지 ${screenBuilderIssuePageCounts.MISSING}건`}
                              </MemberButton>
                            ) : null}
                            {selectedBuilderStatus!.deprecatedCount > 0 ? (
                              <MemberButton
                                onClick={() => applyScreenBuilderIssueView("DEPRECATED")}
                                size="xs"
                                type="button"
                                variant="secondary"
                              >
                                {en ? `Deprecated pages ${screenBuilderIssuePageCounts.DEPRECATED}` : `Deprecated 페이지 ${screenBuilderIssuePageCounts.DEPRECATED}건`}
                              </MemberButton>
                            ) : null}
                          </div>
                        ) : null}
                        {selectedIssueReason && sameIssueMenus.length > 0 ? (
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 font-bold ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                                {en ? `Issue family ${describeScreenBuilderIssueReason(selectedIssueReason, en)}` : `이슈 유형 ${describeScreenBuilderIssueReason(selectedIssueReason, en)}`}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 font-bold ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                                {en
                                  ? `Current position ${sameIssueIndex >= 0 ? sameIssueIndex + 1 : 1} / ${sameIssueMenus.length}`
                                  : `현재 위치 ${sameIssueIndex >= 0 ? sameIssueIndex + 1 : 1} / ${sameIssueMenus.length}`}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 font-bold ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                                {en ? `Remaining ${remainingSameIssueCount}` : `남은 대상 ${remainingSameIssueCount}건`}
                              </span>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 font-bold ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                                {en ? `Resolved ${resolvedSameIssueCount}` : `지나온 대상 ${resolvedSameIssueCount}건`}
                              </span>
                              {selectedMenu ? (
                                <span className={`inline-flex items-center rounded-full px-3 py-1 font-mono ${selectedMenuPublishReady ? "bg-white text-emerald-800" : "bg-white text-red-800"}`}>
                                  {selectedMenu.code} / {selectedMenu.label}
                                </span>
                              ) : null}
                              {previousSameIssueMenu ? (
                                <MemberButton onClick={() => moveToSameIssueMenu(previousSameIssueMenu.code)} size="xs" type="button" variant="secondary">
                                  {en ? `Previous ${previousSameIssueMenu.code}` : `이전 대상 ${previousSameIssueMenu.code}`}
                                </MemberButton>
                              ) : null}
                              {nextSameIssueMenu ? (
                                <MemberButton onClick={() => moveToSameIssueMenu(nextSameIssueMenu.code)} size="xs" type="button" variant="secondary">
                                  {en ? `Next ${nextSameIssueMenu.code}` : `다음 대상 ${nextSameIssueMenu.code}`}
                                </MemberButton>
                              ) : null}
                            </div>
                            <div className="rounded border border-white bg-white/70 px-3 py-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                                  {en ? "Issue family progress" : "이슈 정리 진행률"}
                                </span>
                                <span className="text-[11px] font-bold text-[var(--kr-gov-text-primary)]">
                                  {sameIssueProgressPercent}%
                                </span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className={`h-full rounded-full ${selectedMenuPublishReady ? "bg-emerald-500" : "bg-red-500"}`}
                                  style={{ width: `${sameIssueProgressPercent}%` }}
                                />
                              </div>
                              <p className="mt-2 text-[11px] text-[var(--kr-gov-text-secondary)]">
                                {en
                                  ? `${resolvedSameIssueCount} reviewed / ${sameIssueMenus.length} total`
                                  : `${resolvedSameIssueCount}건 확인 / 전체 ${sameIssueMenus.length}건`}
                              </p>
                              <p className="mt-1 text-[10px] text-[var(--kr-gov-text-secondary)]">
                                {en
                                  ? "Counts below are based on the menu search result list on this page."
                                  : "아래 수치는 이 화면의 메뉴 검색 결과 목록에 현재 보이는 페이지 메뉴 기준입니다."}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  {en
                                    ? `Visible in search list ${visibleSameIssueMenus.length} / ${sameIssueMenus.length}`
                                    : `검색 결과 목록 표시 ${visibleSameIssueMenus.length} / ${sameIssueMenus.length}`}
                                </span>
                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                  {en
                                    ? `Visible published menus ${visibleSameIssuePublishedCount}`
                                    : `검색 결과 Publish 메뉴 ${visibleSameIssuePublishedCount}건`}
                                </span>
                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  {en
                                    ? `Visible draft menus ${visibleSameIssueDraftCount}`
                                    : `검색 결과 초안 메뉴 ${visibleSameIssueDraftCount}건`}
                                </span>
                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                  {en
                                    ? `Published queue ${sameIssueQueueSummary.totalPublished}`
                                    : `Publish 큐 ${sameIssueQueueSummary.totalPublished}건`}
                                </span>
                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  {en
                                    ? `Draft queue ${sameIssueQueueSummary.totalDraft}`
                                    : `초안 큐 ${sameIssueQueueSummary.totalDraft}건`}
                                </span>
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  {en
                                    ? `Remaining published ${sameIssueQueueSummary.remainingPublished}`
                                    : `남은 Publish ${sameIssueQueueSummary.remainingPublished}건`}
                                </span>
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  {en
                                    ? `Remaining draft ${sameIssueQueueSummary.remainingDraft}`
                                    : `남은 초안 ${sameIssueQueueSummary.remainingDraft}건`}
                                </span>
                                {previousPublishedSameIssueMenu ? (
                                  <>
                                    <MemberButton onClick={() => moveToSameIssueMenu(previousPublishedSameIssueMenu.code)} size="xs" type="button" variant="secondary">
                                      {en ? "Open previous published" : "이전 Publish 열기"}
                                    </MemberButton>
                                    <>
                                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-mono text-blue-700">
                                        {previousPublishedSameIssueMenu.code} / {previousPublishedSameIssueMenu.label}
                                      </span>
                                      <MemberLinkButton
                                        href={buildLocalizedPath(
                                          `/admin/system/screen-builder?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousPublishedSameIssueMenu.menuUrl || "")}`,
                                          `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousPublishedSameIssueMenu.menuUrl || "")}`
                                        )}
                                        size="xs"
                                        variant="secondary"
                                      >
                                        {en ? "Builder" : "빌더"}
                                      </MemberLinkButton>
                                      <MemberLinkButton
                                        href={buildLocalizedPath(
                                          `/admin/system/screen-runtime?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousPublishedSameIssueMenu.menuUrl || "")}`,
                                          `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousPublishedSameIssueMenu.menuUrl || "")}`
                                        )}
                                        size="xs"
                                        variant="secondary"
                                      >
                                        {en ? "Runtime" : "런타임"}
                                      </MemberLinkButton>
                                      <MemberLinkButton
                                        href={buildLocalizedPath(
                                          `/admin/system/observability?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                          `/en/admin/system/observability?menuCode=${encodeURIComponent(previousPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(previousPublishedSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                        )}
                                        size="xs"
                                        variant="secondary"
                                      >
                                        {en ? "Activity" : "활동"}
                                      </MemberLinkButton>
                                    </>
                                  </>
                                ) : null}
                                {previousDraftSameIssueMenu ? (
                                  <>
                                    <MemberButton onClick={() => moveToSameIssueMenu(previousDraftSameIssueMenu.code)} size="xs" type="button" variant="secondary">
                                      {en ? "Open previous draft" : "이전 초안 열기"}
                                    </MemberButton>
                                    <>
                                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-700">
                                        {previousDraftSameIssueMenu.code} / {previousDraftSameIssueMenu.label}
                                      </span>
                                      <MemberLinkButton
                                        href={buildLocalizedPath(
                                          `/admin/system/screen-builder?menuCode=${encodeURIComponent(previousDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(previousDraftSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousDraftSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousDraftSameIssueMenu.menuUrl || "")}`,
                                          `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(previousDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(previousDraftSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousDraftSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousDraftSameIssueMenu.menuUrl || "")}`
                                        )}
                                        size="xs"
                                        variant="secondary"
                                      >
                                        {en ? "Builder" : "빌더"}
                                      </MemberLinkButton>
                                      <MemberLinkButton
                                        href={buildLocalizedPath(
                                          `/admin/system/observability?menuCode=${encodeURIComponent(previousDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(previousDraftSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                          `/en/admin/system/observability?menuCode=${encodeURIComponent(previousDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(previousDraftSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                        )}
                                        size="xs"
                                        variant="secondary"
                                      >
                                        {en ? "Activity" : "활동"}
                                      </MemberLinkButton>
                                    </>
                                  </>
                                ) : null}
                                {sameIssueQueueSummary.remainingPublished > 0 ? (
                                  <>
                                    <MemberButton onClick={() => moveToSameIssueQueueMode("PUBLISHED")} size="xs" type="button" variant="secondary">
                                      {en ? "Open next published" : "다음 Publish 열기"}
                                    </MemberButton>
                                    <MemberButton onClick={() => applySameIssueQueueFilter("PUBLISHED")} size="xs" type="button" variant="secondary">
                                      {en ? "Show published in list" : "목록에서 Publish만 보기"}
                                    </MemberButton>
                                    {nextRemainingPublishedSameIssueMenu ? (
                                      <>
                                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-mono text-blue-700">
                                          {nextRemainingPublishedSameIssueMenu.code} / {nextRemainingPublishedSameIssueMenu.label}
                                        </span>
                                        <MemberLinkButton
                                          href={buildLocalizedPath(
                                            `/admin/system/screen-builder?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.menuUrl || "")}`,
                                            `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.menuUrl || "")}`
                                          )}
                                          size="xs"
                                          variant="secondary"
                                        >
                                          {en ? "Builder" : "빌더"}
                                        </MemberLinkButton>
                                        <MemberLinkButton
                                          href={buildLocalizedPath(
                                            `/admin/system/screen-runtime?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.menuUrl || "")}`,
                                            `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.menuUrl || "")}`
                                          )}
                                          size="xs"
                                          variant="secondary"
                                        >
                                          {en ? "Runtime" : "런타임"}
                                        </MemberLinkButton>
                                        <MemberLinkButton
                                          href={buildLocalizedPath(
                                            `/admin/system/observability?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                            `/en/admin/system/observability?menuCode=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingPublishedSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                          )}
                                          size="xs"
                                          variant="secondary"
                                        >
                                          {en ? "Activity" : "활동"}
                                        </MemberLinkButton>
                                      </>
                                    ) : null}
                                  </>
                                ) : null}
                                {sameIssueQueueSummary.remainingDraft > 0 ? (
                                  <>
                                    <MemberButton onClick={() => moveToSameIssueQueueMode("DRAFT")} size="xs" type="button" variant="secondary">
                                      {en ? "Open next draft" : "다음 초안 열기"}
                                    </MemberButton>
                                    <MemberButton onClick={() => applySameIssueQueueFilter("DRAFT")} size="xs" type="button" variant="secondary">
                                      {en ? "Show drafts in list" : "목록에서 초안만 보기"}
                                    </MemberButton>
                                    {nextRemainingDraftSameIssueMenu ? (
                                      <>
                                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-700">
                                          {nextRemainingDraftSameIssueMenu.code} / {nextRemainingDraftSameIssueMenu.label}
                                        </span>
                                        <MemberLinkButton
                                          href={buildLocalizedPath(
                                            `/admin/system/screen-builder?menuCode=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingDraftSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingDraftSameIssueMenu.menuUrl || "")}`,
                                            `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextRemainingDraftSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextRemainingDraftSameIssueMenu.menuUrl || "")}`
                                          )}
                                          size="xs"
                                          variant="secondary"
                                        >
                                          {en ? "Builder" : "빌더"}
                                        </MemberLinkButton>
                                        <MemberLinkButton
                                          href={buildLocalizedPath(
                                            `/admin/system/observability?menuCode=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                            `/en/admin/system/observability?menuCode=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code)}&pageId=${encodeURIComponent(nextRemainingDraftSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                          )}
                                          size="xs"
                                          variant="secondary"
                                        >
                                          {en ? "Activity" : "활동"}
                                        </MemberLinkButton>
                                      </>
                                    ) : null}
                                  </>
                                ) : null}
                                {selectedIssueReason ? (
                                  <MemberButton onClick={applySameIssueBlockedFilter} size="xs" type="button" variant="secondary">
                                    {en ? "Show blocked issue list" : "목록에서 같은 이슈 보기"}
                                  </MemberButton>
                                ) : null}
                              </div>
                              <p className="mt-2 text-[11px] font-medium text-[var(--kr-gov-text-primary)]">
                                {describeScreenBuilderQueueFocus(sameIssueQueueSummary, en)}
                              </p>
                            </div>
                            {selectedMenu ? (
                              <div className="rounded border border-white bg-white/80 px-3 py-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                                    {en ? "Current target" : "현재 대상"}
                                  </span>
                                  <span className="font-mono text-[11px] text-[var(--kr-gov-text-primary)]">
                                    {selectedMenu.code}
                                  </span>
                                  <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">
                                    {selectedMenu.label}
                                  </span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${screenBuilderStatus?.publishedVersionId ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                    {screenBuilderStatus?.publishedVersionId ? (en ? "Published" : "Publish") : (en ? "Draft" : "초안")}
                                  </span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${selectedMenuPublishReady ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {selectedMenuPublishReady ? (en ? "Ready" : "가능") : (en ? `Issues ${selectedMenuBuilderIssueCount}` : `이슈 ${selectedMenuBuilderIssueCount}`)}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`,
                                      `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Current Builder" : "현재 빌더"}
                                  </MemberLinkButton>
                                  {screenBuilderStatus?.publishedVersionId ? (
                                    <MemberLinkButton
                                      href={buildLocalizedPath(
                                        `/admin/system/screen-runtime?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`,
                                        `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(selectedMenu.label)}&menuUrl=${encodeURIComponent(selectedMenu.menuUrl || "")}`
                                      )}
                                      size="xs"
                                      variant="secondary"
                                    >
                                      {en ? "Current Runtime" : "현재 런타임"}
                                    </MemberLinkButton>
                                  ) : null}
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                      `/en/admin/system/observability?menuCode=${encodeURIComponent(selectedMenu.code)}&pageId=${encodeURIComponent(governancePageId || selectedMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Current Activity" : "현재 활동"}
                                  </MemberLinkButton>
                                </div>
                              </div>
                            ) : null}
                            {previousSameIssueMenu ? (
                              <div className="rounded border border-white bg-white/80 px-3 py-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                                    {en ? "Previous target" : "이전 대상"}
                                  </span>
                                  <span className="font-mono text-[11px] text-[var(--kr-gov-text-primary)]">
                                    {previousSameIssueMenu.code}
                                  </span>
                                  <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">
                                    {previousSameIssueMenu.label}
                                  </span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${previousSameIssueMenuIsPublished ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                    {previousSameIssueMenuIsPublished ? (en ? "Published" : "Publish") : (en ? "Draft" : "초안")}
                                  </span>
                                  <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                    {en ? `Issues ${previousSameIssueMenuIssueCount}` : `이슈 ${previousSameIssueMenuIssueCount}`}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/screen-builder?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousSameIssueMenu.menuUrl || "")}`,
                                      `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousSameIssueMenu.menuUrl || "")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Previous Builder" : "이전 빌더"}
                                  </MemberLinkButton>
                                  {previousSameIssueMenuIsPublished ? (
                                    <MemberLinkButton
                                      href={buildLocalizedPath(
                                        `/admin/system/screen-runtime?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousSameIssueMenu.menuUrl || "")}`,
                                        `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(previousSameIssueMenu.label)}&menuUrl=${encodeURIComponent(previousSameIssueMenu.menuUrl || "")}`
                                      )}
                                      size="xs"
                                      variant="secondary"
                                    >
                                      {en ? "Previous Runtime" : "이전 런타임"}
                                    </MemberLinkButton>
                                  ) : null}
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/observability?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                      `/en/admin/system/observability?menuCode=${encodeURIComponent(previousSameIssueMenu.code)}&pageId=${encodeURIComponent(previousSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Previous Activity" : "이전 활동"}
                                  </MemberLinkButton>
                                </div>
                              </div>
                            ) : null}
                            {nextSameIssueMenu ? (
                              <div className="rounded border border-white bg-white/80 px-3 py-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                                    {en ? "Next target" : "다음 대상"}
                                  </span>
                                  <span className="font-mono text-[11px] text-[var(--kr-gov-text-primary)]">
                                    {nextSameIssueMenu.code}
                                  </span>
                                  <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">
                                    {nextSameIssueMenu.label}
                                  </span>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${nextSameIssueMenuIsPublished ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                                    {nextSameIssueMenuIsPublished ? (en ? "Published" : "Publish") : (en ? "Draft" : "초안")}
                                  </span>
                                  <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                    {en ? `Issues ${nextSameIssueMenuIssueCount}` : `이슈 ${nextSameIssueMenuIssueCount}`}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/screen-builder?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextSameIssueMenu.menuUrl || "")}`,
                                      `/en/admin/system/screen-builder?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextSameIssueMenu.menuUrl || "")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Next Builder" : "다음 빌더"}
                                  </MemberLinkButton>
                                  {nextSameIssueMenuIsPublished ? (
                                    <MemberLinkButton
                                      href={buildLocalizedPath(
                                        `/admin/system/screen-runtime?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextSameIssueMenu.menuUrl || "")}`,
                                        `/en/admin/system/screen-runtime?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&menuTitle=${encodeURIComponent(nextSameIssueMenu.label)}&menuUrl=${encodeURIComponent(nextSameIssueMenu.menuUrl || "")}`
                                      )}
                                      size="xs"
                                      variant="secondary"
                                    >
                                      {en ? "Next Runtime" : "다음 런타임"}
                                    </MemberLinkButton>
                                  ) : null}
                                  <MemberLinkButton
                                    href={buildLocalizedPath(
                                      `/admin/system/observability?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`,
                                      `/en/admin/system/observability?menuCode=${encodeURIComponent(nextSameIssueMenu.code)}&pageId=${encodeURIComponent(nextSameIssueMenu.code.toLowerCase())}&searchKeyword=${encodeURIComponent("SCREEN_BUILDER_")}`
                                    )}
                                    size="xs"
                                    variant="secondary"
                                  >
                                    {en ? "Next Activity" : "다음 활동"}
                                  </MemberLinkButton>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {latestSelectedMenuBuilderAudit ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Latest Action" : "최신 액션"}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{stringOf(latestSelectedMenuBuilderAudit, "actionCode") || "-"}</p>
                        </div>
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Latest Actor" : "최신 작업자"}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{stringOf(latestSelectedMenuBuilderAudit, "actorId") || "-"}</p>
                        </div>
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Latest Time" : "최신 시각"}</p>
                          <p className="mt-1 text-sm font-bold text-[var(--kr-gov-text-primary)]">{stringOf(latestSelectedMenuBuilderAudit, "createdAt") || "-"}</p>
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Recent Builder Activity" : "최근 빌더 활동"}</p>
                        <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">{selectedMenuBuilderAudits.length}{en ? " items" : "건"}</span>
                      </div>
                      {selectedMenuBuilderAudits.length ? (
                        <div className="mt-3 space-y-2">
                          {selectedMenuBuilderAudits.map((row, index) => (
                            <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2" key={`selected-builder-audit-${index}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{stringOf(row, "actionCode") || "-"}</p>
                                <span className="text-[11px] text-[var(--kr-gov-text-secondary)]">{stringOf(row, "createdAt") || "-"}</span>
                              </div>
                              <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">
                                {en ? "Actor" : "작업자"}: {stringOf(row, "actorId") || "-"} / {en ? "Result" : "결과"}: {stringOf(row, "resultStatus") || "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[12px] text-[var(--kr-gov-text-secondary)]">
                          {en ? "No recent screen-builder activity was found for this menu." : "이 메뉴에 대한 최근 screen-builder 활동 이력이 없습니다."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="gov-label" htmlFor="selectedMenuName">{en ? "Menu Name" : "메뉴명"}</label>
                    <input className="gov-input" id="selectedMenuName" value={selectedMenuDraft.codeNm} onChange={(event) => setSelectedMenuDraft((current) => ({ ...current, codeNm: event.target.value }))} />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="selectedMenuNameEn">{en ? "Menu Name (EN)" : "영문 메뉴명"}</label>
                    <input className="gov-input" id="selectedMenuNameEn" value={selectedMenuDraft.codeDc} onChange={(event) => setSelectedMenuDraft((current) => ({ ...current, codeDc: event.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="gov-label" htmlFor="selectedMenuUrl">{en ? "Runtime URL" : "연결 URL"}</label>
                    <input className="gov-input" id="selectedMenuUrl" value={selectedMenuDraft.menuUrl} onChange={(event) => setSelectedMenuDraft((current) => ({ ...current, menuUrl: event.target.value }))} />
                    <p className={`mt-2 text-xs ${selectedUrlValidation.tone === "success" ? "text-emerald-700" : "text-amber-700"}`}>{selectedUrlValidation.message}</p>
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="selectedMenuIcon">{en ? "Icon" : "아이콘"}</label>
                    <select className="gov-select" id="selectedMenuIcon" value={selectedMenuDraft.menuIcon} onChange={(event) => setSelectedMenuDraft((current) => ({ ...current, menuIcon: event.target.value }))}>
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="selectedMenuUseAt">{en ? "Use" : "사용 여부"}</label>
                    <select className="gov-select" id="selectedMenuUseAt" value={selectedMenuDraft.useAt} onChange={(event) => setSelectedMenuDraft((current) => ({ ...current, useAt: event.target.value }))}>
                      {useAtOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Change Diff" : "변경 Diff"}</p>
                  {selectedMenuDiff.length === 0 ? (
                    <p className="mt-2 text-sm text-emerald-700">{en ? "No pending menu changes." : "저장 전 메뉴 변경 사항이 없습니다."}</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMenuDiff.map((item) => (
                        <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] text-[var(--kr-gov-text-primary)]" key={item}>{item}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button className="gov-btn gov-btn-primary" disabled={menuSaving || selectedUrlValidation.tone !== "success"} onClick={() => { void handleSelectedMenuSave(); }} type="button">
                    {menuSaving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Menu Changes" : "메뉴 변경 저장")}
                  </button>
                </div>
                {selectedMenuIsPage ? (
                  <div className="rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-red-700">{en ? "Delete Page Menu" : "페이지 메뉴 삭제"}</p>
                        <p className="mt-2 text-sm leading-6 text-red-900">
                          {en
                            ? "Review feature dependencies and VIEW permission cleanup impact before deleting the selected page menu."
                            : "선택한 페이지 메뉴를 삭제하기 전에 연결 기능과 기본 VIEW 권한 정리 영향을 먼저 확인합니다."}
                        </p>
                      </div>
                      <button className="gov-btn gov-btn-danger" disabled={pageDeleteImpactLoading || pageDeleting} onClick={() => { void preparePageDelete(); }} type="button">
                        {pageDeleteImpactLoading ? (en ? "Checking..." : "확인 중...") : (en ? "Review Delete Impact" : "삭제 영향 확인")}
                      </button>
                    </div>
                    {pendingPageDeleteImpact ? (
                      <div className="mt-4 space-y-3 rounded-[var(--kr-gov-radius)] border border-white/80 bg-white/70 px-4 py-4 text-sm">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Default VIEW" : "기본 VIEW"}</p>
                            <p className="mt-1 font-mono text-[13px] text-[var(--kr-gov-text-primary)]">{pendingPageDeleteImpact.defaultViewFeatureCode}</p>
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Cleanup Impact" : "정리 영향"}</p>
                            <p className="mt-1 text-[var(--kr-gov-text-primary)]">
                              {en
                                ? `Role mappings ${pendingPageDeleteImpact.defaultViewRoleRefCount}, user overrides ${pendingPageDeleteImpact.defaultViewUserOverrideCount}`
                                : `권한그룹 매핑 ${pendingPageDeleteImpact.defaultViewRoleRefCount}건, 사용자 예외권한 ${pendingPageDeleteImpact.defaultViewUserOverrideCount}건`}
                            </p>
                          </div>
                        </div>
                        {pendingPageDeleteImpact.nonDefaultFeatureCodes.length > 0 ? (
                          <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                            <p className="font-bold">{en ? "Delete blocked" : "삭제 차단"}</p>
                            <p className="mt-2">
                              {en
                                ? "Delete the page-specific action features first. Remaining features:"
                                : "페이지 전용 액션 기능을 먼저 삭제해 주세요. 남아 있는 기능:"}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {pendingPageDeleteImpact.nonDefaultFeatureCodes.map((featureCode) => (
                                <button
                                  key={featureCode}
                                  className="inline-flex rounded-full border border-amber-300 bg-white px-3 py-1 text-[12px] font-mono text-amber-900"
                                  onClick={() => {
                                    setEditingFeatureCode(featureCode);
                                    scrollToSection("environment-feature-management");
                                  }}
                                  type="button"
                                >
                                  {featureCode}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                            {en
                              ? "No page-specific action features remain. You can delete this page menu."
                              : "남아 있는 페이지 전용 액션 기능이 없습니다. 이 페이지 메뉴를 삭제할 수 있습니다."}
                          </div>
                        )}
                        <div className="flex flex-wrap justify-end gap-2">
                          <button className="gov-btn gov-btn-outline-blue" onClick={() => setPendingPageDeleteImpact(null)} type="button">
                            {en ? "Close" : "닫기"}
                          </button>
                          <button className="gov-btn gov-btn-danger" disabled={pageDeleting || pendingPageDeleteImpact.blocked} onClick={() => { void confirmPageDelete(); }} type="button">
                            {pageDeleting ? (en ? "Deleting..." : "삭제 중...") : (en ? "Delete Page Menu" : "페이지 메뉴 삭제")}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {selectedMenuIsPage ? (
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">history</span>
                      <p className="font-bold text-[var(--kr-gov-text-primary)]">{en ? "Recent Changes" : "최근 변경 이력"}</p>
                    </div>
                    {menuAuditLoading ? (
                      <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Loading recent audit events..." : "최근 감사 이력을 불러오는 중입니다..."}</p>
                    ) : menuAuditRows.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No recent audit events for this menu." : "이 메뉴의 최근 감사 이력이 없습니다."}</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {menuAuditRows.map((row, index) => (
                          <div key={`${stringOf(row, "auditId") || "audit"}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-bold text-[var(--kr-gov-text-primary)]">{stringOf(row, "actionCode") || "-"}</p>
                              <span className="text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "createdAt") || "-"}</span>
                            </div>
                            <p className="mt-1 text-[var(--kr-gov-text-secondary)]">{en ? "Actor" : "작업자"}: {stringOf(row, "actorId") || "-"}</p>
                            <p className="mt-1 text-[var(--kr-gov-text-secondary)]">{en ? "Result" : "결과"}: {stringOf(row, "resultStatus") || "-"}</p>
                            {stringOf(row, "reasonSummary") ? <p className="mt-1 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "reasonSummary")}</p> : null}
                            <p className="mt-2 rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] font-bold text-[var(--kr-gov-blue)]">
                              {summarizeMenuAuditDiff(row, en)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a menu to continue." : "작업할 메뉴를 먼저 선택하세요."}</p>
            )}
          </section>

          <section className="gov-card" id="environment-feature-management">
            <GridToolbar title={en ? "Feature Add / Edit" : "기능 추가 / 편집"} />
            {selectedMenu && selectedMenuIsPage ? (
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

                {pendingDeleteImpact ? (
                  <div className="mt-5 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                    <p className="font-bold">
                      {en ? "Delete Impact Review" : "삭제 영향 검토"}: {pendingDeleteImpact.featureCode}
                    </p>
                    <p className="mt-2">
                      {en
                        ? `Role mappings ${pendingDeleteImpact.assignedRoleCount}, user overrides ${pendingDeleteImpact.userOverrideCount} will be removed together.`
                        : `권한그룹 매핑 ${pendingDeleteImpact.assignedRoleCount}건, 사용자 예외권한 ${pendingDeleteImpact.userOverrideCount}건이 함께 삭제됩니다.`}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <a className="gov-btn gov-btn-outline-blue" href={buildLocalizedPath("/admin/auth/group", "/en/admin/auth/group")}>
                        {en ? "Review In Permission Groups" : "권한 그룹에서 검토"}
                      </a>
                      <button className="gov-btn gov-btn-outline-blue" onClick={() => { setPendingDeleteImpact(null); setDeleteImpactFeatureCode(""); }} type="button">
                        {en ? "Cancel" : "취소"}
                      </button>
                      <button className="gov-btn gov-btn-danger" disabled={featureDeleting} onClick={() => { void confirmFeatureDelete(); }} type="button">
                        {featureDeleting ? (en ? "Deleting..." : "삭제 중...") : (en ? "Confirm Delete" : "영향 확인 후 삭제")}
                      </button>
                    </div>
                  </div>
                ) : null}

                {editingFeatureCode ? (
                  <div className="mt-5 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Editing Feature" : "수정 중 기능"}</p>
                        <p className="mt-1 font-mono text-sm text-[var(--kr-gov-text-primary)]">{editingFeatureDraft.featureCode}</p>
                      </div>
                      <button className="gov-btn gov-btn-outline-blue" onClick={() => setEditingFeatureCode("")} type="button">
                        {en ? "Close" : "닫기"}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="gov-label" htmlFor="editingFeatureNm">{en ? "Feature Name" : "기능명"}</label>
                        <input className="gov-input" id="editingFeatureNm" value={editingFeatureDraft.featureNm} onChange={(event) => setEditingFeatureDraft((current) => ({ ...current, featureNm: event.target.value }))} />
                      </div>
                      <div>
                        <label className="gov-label" htmlFor="editingFeatureNmEn">{en ? "Feature Name (EN)" : "영문 기능명"}</label>
                        <input className="gov-input" id="editingFeatureNmEn" value={editingFeatureDraft.featureNmEn} onChange={(event) => setEditingFeatureDraft((current) => ({ ...current, featureNmEn: event.target.value }))} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="gov-label" htmlFor="editingFeatureDc">{en ? "Description" : "설명"}</label>
                        <input className="gov-input" id="editingFeatureDc" value={editingFeatureDraft.featureDc} onChange={(event) => setEditingFeatureDraft((current) => ({ ...current, featureDc: event.target.value }))} />
                      </div>
                      <div>
                        <label className="gov-label" htmlFor="editingFeatureUseAt">{en ? "Use" : "사용 여부"}</label>
                        <select className="gov-select" id="editingFeatureUseAt" value={editingFeatureDraft.useAt} onChange={(event) => setEditingFeatureDraft((current) => ({ ...current, useAt: event.target.value }))}>
                          {((featurePage?.useAtOptions || ["Y", "N"]) as string[]).map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="gov-btn gov-btn-primary" disabled={featureSaving} onClick={() => { void handleFeatureUpdate(); }} type="button">
                        {featureSaving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Feature Changes" : "기능 변경 저장")}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_12rem]">
                  <div>
                    <label className="gov-label" htmlFor="featureSearch">{en ? "Feature Search" : "기능 검색"}</label>
                    <input
                      className="gov-input"
                      id="featureSearch"
                      placeholder={en ? "Feature code, name, or description" : "기능 코드, 이름, 설명"}
                      value={featureSearch}
                      onChange={(event) => setFeatureSearch(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="gov-label" htmlFor="featureLinkFilter">{en ? "Link Status" : "연계 상태"}</label>
                    <select
                      className="gov-select"
                      id="featureLinkFilter"
                      value={featureLinkFilter}
                      onChange={(event) => setFeatureLinkFilter(event.target.value as "ALL" | "UNASSIGNED" | "LINKED")}
                    >
                      <option value="ALL">{en ? "All" : "전체"}</option>
                      <option value="UNASSIGNED">{en ? "Unassigned" : "미할당"}</option>
                      <option value="LINKED">{en ? "Linked" : "연결됨"}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="gov-table-header">
                        <th className="px-4 py-3">{en ? "Feature Code" : "기능 코드"}</th>
                        <th className="px-4 py-3">{en ? "Feature Name" : "기능명"}</th>
                        <th className="px-4 py-3">{en ? "Description" : "설명"}</th>
                        <th className="px-4 py-3 text-center">{en ? "Authority" : "권한 연계"}</th>
                        <th className="px-4 py-3 text-center">{en ? "Manage" : "관리"}</th>
                        <th className="px-4 py-3 text-center">{en ? "Delete" : "삭제"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFeatureRows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                            {featureRows.length === 0
                              ? (en ? "No additional features have been registered yet." : "추가 등록된 기능이 아직 없습니다.")
                              : (en ? "No features matched the current filter." : "현재 필터 조건에 맞는 기능이 없습니다.")}
                          </td>
                        </tr>
                      ) : filteredFeatureRows.map((row) => {
                        const featureCode = stringOf(row, "featureCode");
                        const unassigned = Boolean(row.unassignedToRole);
                        return (
                          <tr key={featureCode}>
                            <td className="px-4 py-3 font-bold whitespace-nowrap">{featureCode}</td>
                            <td className="px-4 py-3">{stringOf(row, "featureNm")}</td>
                            <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "featureDc")}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${unassigned ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                                {unassigned ? (en ? "Unassigned" : "미할당") : `${en ? "Roles" : "Role"} ${numberOf(row, "assignedRoleCount")}`}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className={editingFeatureCode === featureCode ? "gov-btn gov-btn-primary" : "gov-btn gov-btn-outline-blue"} onClick={() => setEditingFeatureCode(featureCode)} type="button">
                                {editingFeatureCode === featureCode ? (en ? "Editing" : "수정 중") : (en ? "Edit" : "수정")}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className="gov-btn gov-btn-danger" disabled={deleteImpactLoading && deleteImpactFeatureCode === featureCode} onClick={() => { void prepareFeatureDelete(featureCode); }} type="button">
                                {deleteImpactLoading && deleteImpactFeatureCode === featureCode ? (en ? "Checking..." : "확인 중...") : (en ? "Delete" : "삭제")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : selectedMenu ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Only 8-digit page menus can own feature codes." : "기능 코드는 8자리 페이지 메뉴에서만 관리할 수 있습니다."}</p>
            ) : (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "After selecting a menu, you can add and delete page-specific feature codes here." : "메뉴를 선택하면 여기서 페이지 전용 기능 코드를 추가하고 삭제할 수 있습니다."}</p>
            )}
          </section>

          <section className="gov-card" id="environment-metadata">
            <div className="flex items-center justify-between gap-3 border-b pb-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">dataset</span>
                <h3 className="text-lg font-bold">{en ? "Collected Metadata" : "수집 메타데이터"}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="gov-btn gov-btn-outline-blue"
                  disabled={!selectedMenuIsPage && !governanceOverview.pageId}
                  onClick={() => setMetadataExpanded((current) => !current)}
                  type="button"
                >
                  {metadataExpanded ? (en ? "Collapse" : "접기") : (en ? "Expand" : "펼치기")}
                </button>
                <button
                  className="gov-btn gov-btn-primary"
                  disabled={!selectedMenuIsPage || collecting || governanceLoading}
                  onClick={() => { void handleAutoCollect(); }}
                  type="button"
                >
                  {collecting ? (en ? "Collecting..." : "수집 중...") : (en ? "Auto Collect" : "자동 수집")}
                </button>
              </div>
            </div>

            {governanceMessage ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {governanceMessage}
              </div>
            ) : null}
            {lastAutoCollectAt && (postCollectAuditRows.length > 0 || postCollectTraceRows.length > 0) ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-[var(--kr-gov-text-primary)]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">task_alt</span>
                  <p className="font-bold">{en ? "Latest Auto-Collect Result" : "최근 자동 수집 결과"}</p>
                </div>
                <p className="mt-2 text-[var(--kr-gov-text-secondary)]">
                  {en ? "Collected metadata and linked the newest observability records." : "메타데이터 수집 직후 연결된 최신 observability 기록입니다."}
                </p>
                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Audit</p>
                    {postCollectAuditRows.length === 0 ? (
                      <p className="mt-2 text-[var(--kr-gov-text-secondary)]">{en ? "No audit event was found yet." : "아직 연결된 감사 이력이 없습니다."}</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {postCollectAuditRows.map((row, index) => (
                          <div className="rounded-[var(--kr-gov-radius)] border border-slate-100 bg-slate-50 px-3 py-2" key={`${stringOf(row, "auditId") || "audit"}-${index}`}>
                            <p className="font-bold">{stringOf(row, "actionCode") || "-"}</p>
                            <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">{stringOf(row, "createdAt") || "-"}</p>
                            <p className="mt-1 text-[12px] text-[var(--kr-gov-blue)]">{summarizeMenuAuditDiff(row, en)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Trace</p>
                    {postCollectTraceRows.length === 0 ? (
                      <p className="mt-2 text-[var(--kr-gov-text-secondary)]">{en ? "No trace event was found yet." : "아직 연결된 trace 이벤트가 없습니다."}</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {postCollectTraceRows.map((row, index) => (
                          <div className="rounded-[var(--kr-gov-radius)] border border-slate-100 bg-slate-50 px-3 py-2" key={`${stringOf(row, "traceId") || "trace"}-${index}`}>
                            <p className="font-bold">{stringOf(row, "eventType") || stringOf(row, "functionId") || "-"}</p>
                            <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">
                              {[stringOf(row, "pageId"), stringOf(row, "apiId"), stringOf(row, "resultCode")].filter(Boolean).join(" / ") || "-"}
                            </p>
                            <p className="mt-1 text-[12px] text-[var(--kr-gov-text-secondary)]">{stringOf(row, "createdAt") || stringOf(row, "occurredAt") || "-"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            {governanceError ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {governanceError}
              </div>
            ) : null}

            <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">Page</p>
                <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{governanceOverview.pageId || "-"}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Events / APIs" : "이벤트 / API"}</p>
                <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{governanceOverview.eventIds.length} / {governanceOverview.apiIds.length}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "DB Assets" : "DB 자원"}</p>
                <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{governanceOverview.tableNames.length} / {governanceOverview.columnNames.length}</p>
              </div>
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Feature Codes" : "기능 코드"}</p>
                <p className="mt-1 text-sm font-black text-[var(--kr-gov-text-primary)]">{governanceOverview.featureCodes.length}</p>
              </div>
            </div>
            {selectedMenu && selectedMenuIsPage ? (
              <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${governanceOverview.pageId ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <p className="text-xs font-black uppercase tracking-[0.08em]">{en ? "Registry" : "레지스트리"}</p>
                  <p className="mt-1 text-sm font-bold">{governanceOverview.pageId ? (en ? "Linked" : "연결됨") : (en ? "Missing" : "누락")}</p>
                </div>
                <div className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${featureRows.some((row) => Boolean(row.unassignedToRole)) ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                  <p className="text-xs font-black uppercase tracking-[0.08em]">{en ? "Permissions" : "권한"}</p>
                  <p className="mt-1 text-sm font-bold">{featureRows.some((row) => Boolean(row.unassignedToRole)) ? (en ? "Review required" : "검토 필요") : (en ? "Aligned" : "정상")}</p>
                </div>
                <div className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${governanceOverview.apiIds.length > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <p className="text-xs font-black uppercase tracking-[0.08em]">API</p>
                  <p className="mt-1 text-sm font-bold">{governanceOverview.apiIds.length > 0 ? (en ? "Collected" : "수집됨") : (en ? "Not collected" : "미수집")}</p>
                </div>
                <div className={`rounded-[var(--kr-gov-radius)] border px-4 py-3 ${governanceOverview.tableNames.length > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  <p className="text-xs font-black uppercase tracking-[0.08em]">DB</p>
                  <p className="mt-1 text-sm font-bold">{governanceOverview.tableNames.length > 0 ? (en ? "Collected" : "수집됨") : (en ? "Not collected" : "미수집")}</p>
                </div>
              </div>
            ) : null}
            {governanceWarnings.length > 0 ? (
              <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-bold">{en ? "Operational warnings" : "운영 경고"}</p>
                <ul className="mt-2 space-y-1">
                  {governanceWarnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="gov-btn gov-btn-outline-blue" href={buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management")}>
                    {en ? "Open Full-Stack Management" : "풀스택 관리 바로가기"}
                  </a>
                  <a className="gov-btn gov-btn-outline-blue" href={buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio")}>
                    {en ? "Open Platform Studio" : "플랫폼 스튜디오 바로가기"}
                  </a>
                </div>
                {governanceRemediationItems.length > 0 ? (
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {governanceRemediationItems.map((item) => (
                      <article className="rounded-[var(--kr-gov-radius)] border border-white bg-white px-4 py-4 text-[13px] text-[var(--kr-gov-text-secondary)]" key={`${item.title}-${item.href || item.actionKind}`}>
                        <p className="font-bold text-[var(--kr-gov-text-primary)]">{item.title}</p>
                        <p className="mt-2 leading-6">{item.description}</p>
                        <button
                          className="mt-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--kr-gov-blue)]"
                          onClick={() => runGovernanceAction(item)}
                          type="button"
                        >
                          {item.actionLabel}
                        </button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {!selectedMenu ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Select a menu to inspect connected page metadata." : "연결된 페이지 메타데이터를 보려면 메뉴를 먼저 선택하세요."}</p>
            ) : !selectedMenuIsPage ? (
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Only 8-digit page menus can display collected metadata." : "수집 메타데이터는 8자리 페이지 메뉴에서만 표시됩니다."}</p>
            ) : !metadataExpanded ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-[var(--kr-gov-text-secondary)]">
                {en
                  ? "Detailed metadata is folded by default so the daily menu and feature workflow stays visible. Expand this area when you need the full governance chain."
                  : "일상적인 메뉴/기능 작업이 먼저 보이도록 상세 메타데이터는 기본 접힘 상태입니다. 전체 거버넌스 체인이 필요할 때 펼쳐서 확인하세요."}
              </div>
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
              <div className="min-w-0 space-y-5">
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 p-4">
                    <h4 className="font-bold mb-2">{en ? "Screen / Manifest" : "화면 / 매니페스트"}</h4>
                    <p className="text-sm text-[var(--kr-gov-text-secondary)]">{governanceOverview.summary || "-"}</p>
                    <dl className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><dt className="font-bold">Menu Code</dt><dd>{selectedMenu.code || "-"}</dd></div>
                      <div><dt className="font-bold">Menu URL</dt><dd>{selectedMenu.menuUrl || "-"}</dd></div>
                      <div><dt className="font-bold">Page ID</dt><dd>{governancePage?.page?.manifestRegistry?.pageId || governanceOverview.pageId || "-"}</dd></div>
                      <div><dt className="font-bold">Layout</dt><dd>{String(governancePage?.page?.manifestRegistry?.layoutVersion || "-")}</dd></div>
                      <div><dt className="font-bold">Design Token</dt><dd>{String(governancePage?.page?.manifestRegistry?.designTokenVersion || "-")}</dd></div>
                      <div><dt className="font-bold">VIEW Feature</dt><dd>{String(governancePage?.page?.menuPermission?.requiredViewFeatureCode || "-")}</dd></div>
                    </dl>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border-2 border-[rgba(28,100,242,0.18)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(248,250,252,0.98))] p-4 shadow-[0_12px_32px_rgba(28,100,242,0.08)]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">policy</span>
                      <h4 className="font-black text-[var(--kr-gov-text-primary)]">{en ? "Common Code / Permission" : "공통코드 / 권한"}</h4>
                    </div>
                    <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">
                      {(governancePage?.page?.commonCodeGroups || []).map((item) => `${item.codeGroupId}[${item.values.join(", ")}]`).join(" / ") || "-"}
                    </p>
                    <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-white/70 bg-white/80 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-blue)]">Resolver Notes</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-primary)]">
                        {(governancePage?.page?.menuPermission?.resolverNotes || []).join(" ") || "-"}
                      </p>
                    </div>
                    <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-white/70 bg-white/80 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-blue)]">{en ? "Relation Tables" : "권한 해석 테이블"}</p>
                      <div className="mt-2">
                        {renderMetaList(governancePage?.page?.menuPermission?.relationTables || [], en ? "No relation tables collected yet." : "수집된 권한 해석 테이블이 없습니다.")}
                      </div>
                    </div>
                    <div className="mt-3 rounded-[var(--kr-gov-radius)] border border-white/70 bg-white/80 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-blue)]">{en ? "Tags" : "태그"}</p>
                      <div className="mt-2">
                      {renderMetaList(governanceOverview.tags, en ? "No tags collected yet." : "수집된 태그가 없습니다.")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-[#f8fbff] px-4 py-3">
                    <p className="font-bold text-[var(--kr-gov-blue)]">{en ? "Tables" : "테이블"}</p>
                    <p className="mt-1">{governanceOverview.tableNames.length}</p>
                    <p className="text-[var(--kr-gov-text-secondary)] break-all">{governanceOverview.tableNames.join(", ") || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-[#fcfbf7] px-4 py-3">
                    <p className="font-bold text-[#8a5a00]">{en ? "Columns" : "컬럼"}</p>
                    <p className="mt-1">{governanceOverview.columnNames.length}</p>
                    <p className="text-[var(--kr-gov-text-secondary)] break-all">{governanceOverview.columnNames.join(", ") || "-"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-[#f7fbf8] px-4 py-3">
                    <p className="font-bold text-[#196c2e]">{en ? "Events / APIs" : "이벤트 / API"}</p>
                    <p className="mt-1">{(governancePage?.page?.events || []).length} / {(governancePage?.page?.apis || []).length}</p>
                    <p className="text-[var(--kr-gov-text-secondary)]">{en ? "Function and backend linkage count" : "함수 및 백엔드 연결 수"}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-[#f9f7fb] px-4 py-3">
                    <p className="font-bold text-[#6b3ea1]">{en ? "Permission Rows" : "권한 행"}</p>
                    <p className="mt-1">{(governancePage?.page?.menuPermission?.featureRows || []).length}</p>
                    <p className="text-[var(--kr-gov-text-secondary)]">{(governancePage?.page?.menuPermission?.featureCodes || []).join(", ") || "-"}</p>
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
                  <div className="table-wrap max-w-full">
                    <table className="data-table min-w-[1200px]">
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
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
