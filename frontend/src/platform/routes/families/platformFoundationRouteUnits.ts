import type { LazyPageUnit, RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

const platformStudioLoader = () => import("../../../features/platform-studio/PlatformStudioMigrationPage");
const observabilityLoader = () => import("../../../features/observability/ObservabilityMigrationPage");
const helpManagementLoader = () => import("../../../features/help-management/HelpManagementMigrationPage");
const codexRequestLoader = () => import("../../../features/codex-provision/CodexProvisionMigrationPage");
const srWorkbenchLoader = () => import("../../../features/sr-workbench/SrWorkbenchMigrationPage");

export const PLATFORM_FOUNDATION_ROUTE_UNITS = [
  { id: "platform-studio", label: "플랫폼 스튜디오", group: "platform", koPath: "/admin/system/platform-studio", enPath: "/en/admin/system/platform-studio" },
  { id: "screen-elements-management", label: "화면 요소 관리", group: "platform", koPath: "/admin/system/screen-elements-management", enPath: "/en/admin/system/screen-elements-management" },
  { id: "event-management-console", label: "이벤트 관리", group: "platform", koPath: "/admin/system/event-management-console", enPath: "/en/admin/system/event-management-console" },
  { id: "function-management-console", label: "함수 콘솔", group: "platform", koPath: "/admin/system/function-management-console", enPath: "/en/admin/system/function-management-console" },
  { id: "api-management-console", label: "API 관리", group: "platform", koPath: "/admin/system/api-management-console", enPath: "/en/admin/system/api-management-console" },
  { id: "controller-management-console", label: "컨트롤러 관리", group: "platform", koPath: "/admin/system/controller-management-console", enPath: "/en/admin/system/controller-management-console" },
  { id: "db-table-management", label: "DB 테이블 관리", group: "platform", koPath: "/admin/system/db-table-management", enPath: "/en/admin/system/db-table-management" },
  { id: "column-management-console", label: "컬럼 관리", group: "platform", koPath: "/admin/system/column-management-console", enPath: "/en/admin/system/column-management-console" },
  { id: "automation-studio", label: "자동화 스튜디오", group: "platform", koPath: "/admin/system/automation-studio", enPath: "/en/admin/system/automation-studio" },
  { id: "codex-request", label: "Codex Execution Console", group: "platform", koPath: "/admin/system/codex-request", enPath: "/en/admin/system/codex-request" },
  { id: "unified-log", label: "통합 로그", group: "platform", koPath: "/admin/system/unified_log", enPath: "/en/admin/system/unified_log" },
  { id: "observability", label: "추적 조회", group: "platform", koPath: "/admin/system/observability", enPath: "/en/admin/system/observability" },
  { id: "help-management", label: "도움말 운영", group: "platform", koPath: "/admin/system/help-management", enPath: "/en/admin/system/help-management" },
  { id: "sr-workbench", label: "SR 워크벤치", group: "platform", koPath: "/admin/system/sr-workbench", enPath: "/en/admin/system/sr-workbench" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export const PLATFORM_FOUNDATION_PAGE_UNITS: LazyPageUnit[] = [
  { id: "platform-studio", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "screen-elements-management", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "event-management-console", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "function-management-console", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "api-management-console", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "controller-management-console", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "db-table-management", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "column-management-console", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "automation-studio", exportName: "PlatformStudioMigrationPage", loader: platformStudioLoader },
  { id: "codex-request", exportName: "CodexProvisionMigrationPage", loader: codexRequestLoader },
  { id: "unified-log", exportName: "ObservabilityMigrationPage", loader: observabilityLoader },
  { id: "observability", exportName: "ObservabilityMigrationPage", loader: observabilityLoader },
  { id: "help-management", exportName: "HelpManagementMigrationPage", loader: helpManagementLoader },
  { id: "sr-workbench", exportName: "SrWorkbenchMigrationPage", loader: srWorkbenchLoader }
];
