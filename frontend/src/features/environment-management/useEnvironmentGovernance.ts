import { useEffect, useMemo, useState } from "react";
import {
  type FullStackGovernanceRegistryEntry,
  type ScreenCommandPagePayload
} from "../../lib/api/client";
import { fetchAuditEvents, fetchTraceEvents } from "../../lib/api/observability";
import { fetchScreenBuilderPage } from "../../lib/api/screenBuilder";
import { autoCollectFullStackGovernanceRegistry, fetchFullStackGovernanceRegistry, fetchScreenCommandPage } from "../../lib/api/screenGovernance";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import {
  buildGovernanceOverview,
  buildSurfaceChains,
  buildSurfaceEventTableRows,
  isDraftOnlyGovernancePage,
  resolveGovernancePageId,
  type GovernanceOverview,
  type GovernanceRemediationItem,
  type GovernanceSurfaceChain,
  type GovernanceSurfaceEventTableRow,
  type ManagedMenuRow,
  type ScreenBuilderIssueBreakdown,
  type ScreenBuilderStatus
} from "./environmentManagementShared";

type UseEnvironmentGovernanceParams = {
  en: boolean;
  featureRows: Array<Record<string, unknown>>;
  menuRows: ManagedMenuRow[];
  selectedMenu: ManagedMenuRow | null;
  selectedMenuCode: string;
  selectedMenuIsPage: boolean;
  onAfterCollect: () => Promise<void>;
};

export function useEnvironmentGovernance({
  en,
  featureRows,
  menuRows,
  selectedMenu,
  selectedMenuCode,
  selectedMenuIsPage,
  onAfterCollect
}: UseEnvironmentGovernanceParams) {
  const [governanceMessage, setGovernanceMessage] = useState("");
  const [governanceError, setGovernanceError] = useState("");
  const [screenCatalog, setScreenCatalog] = useState<ScreenCommandPagePayload | null>(null);
  const [governancePage, setGovernancePage] = useState<ScreenCommandPagePayload | null>(null);
  const [registryEntry, setRegistryEntry] = useState<FullStackGovernanceRegistryEntry | null>(null);
  const [governanceLoading, setGovernanceLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [postCollectAuditRows, setPostCollectAuditRows] = useState<Array<Record<string, unknown>>>([]);
  const [postCollectTraceRows, setPostCollectTraceRows] = useState<Array<Record<string, unknown>>>([]);
  const [lastAutoCollectAt, setLastAutoCollectAt] = useState("");
  const [screenBuilderStatus, setScreenBuilderStatus] = useState<ScreenBuilderStatus | null>(null);
  const [screenBuilderPublishedMap, setScreenBuilderPublishedMap] = useState<Record<string, boolean>>({});
  const [screenBuilderIssueMap, setScreenBuilderIssueMap] = useState<Record<string, number>>({});
  const [screenBuilderIssueDetailMap, setScreenBuilderIssueDetailMap] = useState<Record<string, ScreenBuilderIssueBreakdown>>({});

  const governancePageId = useMemo(
    () => resolveGovernancePageId(selectedMenu, screenCatalog?.pages),
    [screenCatalog?.pages, selectedMenu]
  );
  const governanceOverview = useMemo<GovernanceOverview>(
    () => buildGovernanceOverview(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const governanceDraftOnly = useMemo(
    () => isDraftOnlyGovernancePage(registryEntry, governancePage?.page || null),
    [governancePage?.page, registryEntry]
  );
  const governanceWarnings = useMemo(() => {
    if (!selectedMenu || !selectedMenuIsPage) {
      return [] as string[];
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
  const permissionSummary = useMemo(() => {
    const featureCount = featureRows.length;
    const linkedFeatureCount = featureRows.filter((row) => !Boolean(row.unassignedToRole)).length;
    const unassignedFeatureCount = featureRows.filter((row) => Boolean(row.unassignedToRole)).length;
    const assignedRoleTotal = featureRows.reduce((sum, row) => sum + Number(row.assignedRoleCount || 0), 0);
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
  const governanceSurfaceChains = useMemo<GovernanceSurfaceChain[]>(
    () => buildSurfaceChains(governancePage?.page || null),
    [governancePage?.page]
  );
  const governanceSurfaceEventRows = useMemo<GovernanceSurfaceEventTableRow[]>(
    () => buildSurfaceEventTableRows(governanceSurfaceChains),
    [governanceSurfaceChains]
  );
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
  }, [en]);

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

  useEffect(() => {
    setPostCollectAuditRows([]);
    setPostCollectTraceRows([]);
    setLastAutoCollectAt("");
  }, [selectedMenuCode]);

  async function handleAutoCollect() {
    if (!selectedMenu || !selectedMenuIsPage) {
      setGovernanceError(en ? "Select an 8-digit page menu first." : "먼저 8자리 페이지 메뉴를 선택하세요.");
      return false;
    }
    if (!governancePageId) {
      setGovernanceError(en ? "The selected menu is not linked to a collectable page." : "선택한 메뉴가 수집 가능한 페이지와 아직 연결되지 않았습니다.");
      return false;
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
      setLastAutoCollectAt(new Date().toISOString());
      const [auditResponse, traceResponse] = await Promise.all([
        fetchAuditEvents({ menuCode: selectedMenu.code, pageId: governancePageId, pageSize: 3 }).catch(() => ({ items: [] })),
        fetchTraceEvents({ pageId: governancePageId, pageSize: 3 }).catch(() => ({ items: [] }))
      ]);
      setPostCollectAuditRows(Array.isArray(auditResponse.items) ? auditResponse.items : []);
      setPostCollectTraceRows(Array.isArray(traceResponse.items) ? traceResponse.items : []);
    } catch (error) {
      setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to collect metadata." : "메타데이터 수집에 실패했습니다."));
      setCollecting(false);
      return false;
    }
    try {
      await onAfterCollect();
    } catch (error) {
      setGovernanceError(error instanceof Error ? error.message : (en ? "Failed to refresh metadata summary after collection." : "수집 후 메타데이터 요약 새로고침에 실패했습니다."));
    } finally {
      setCollecting(false);
    }
    return true;
  }

  return {
    collecting,
    governanceDraftOnly,
    governanceError,
    governanceLoading,
    governanceMessage,
    governanceOverview,
    governancePage,
    governancePageId,
    governanceRemediationItems,
    governanceSurfaceChains,
    governanceSurfaceEventRows,
    governanceWarnings,
    handleAutoCollect,
    lastAutoCollectAt,
    permissionSummary,
    postCollectAuditRows,
    postCollectTraceRows,
    screenBuilderIssueDetailMap,
    screenBuilderIssueMap,
    screenBuilderPageCounts,
    screenBuilderPublishedMap,
    screenBuilderStatus,
    setGovernanceError,
    setGovernanceMessage
  };
}
