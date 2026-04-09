import type { RouteDefinition } from "./definitions";

export const PLATFORM_ROUTES: RouteDefinition[] = [
  { id: "platform-studio", label: "플랫폼 스튜디오", group: "platform", koPath: "/admin/system/platform-studio", enPath: "/en/admin/system/platform-studio" },
  { id: "screen-elements-management", label: "화면 요소 관리", group: "platform", koPath: "/admin/system/screen-elements-management", enPath: "/en/admin/system/screen-elements-management" },
  { id: "event-management-console", label: "이벤트 관리", group: "platform", koPath: "/admin/system/event-management-console", enPath: "/en/admin/system/event-management-console" },
  { id: "function-management-console", label: "함수 콘솔", group: "platform", koPath: "/admin/system/function-management-console", enPath: "/en/admin/system/function-management-console" },
  { id: "api-management-console", label: "API 관리", group: "platform", koPath: "/admin/system/api-management-console", enPath: "/en/admin/system/api-management-console" },
  { id: "controller-management-console", label: "컨트롤러 관리", group: "platform", koPath: "/admin/system/controller-management-console", enPath: "/en/admin/system/controller-management-console" },
  { id: "db-table-management", label: "DB 테이블 관리", group: "platform", koPath: "/admin/system/db-table-management", enPath: "/en/admin/system/db-table-management" },
  { id: "column-management-console", label: "컬럼 관리", group: "platform", koPath: "/admin/system/column-management-console", enPath: "/en/admin/system/column-management-console" },
  { id: "automation-studio", label: "자동화 스튜디오", group: "platform", koPath: "/admin/system/automation-studio", enPath: "/en/admin/system/automation-studio" },
  { id: "environment-management", label: "메뉴 통합 관리", group: "platform", koPath: "/admin/system/environment-management", enPath: "/en/admin/system/environment-management" },
  { id: "screen-builder", label: "화면 빌더", group: "platform", koPath: "/admin/system/screen-builder", enPath: "/en/admin/system/screen-builder" },
  { id: "screen-runtime", label: "발행 화면 런타임", group: "platform", koPath: "/admin/system/screen-runtime", enPath: "/en/admin/system/screen-runtime" },
  { id: "current-runtime-compare", label: "현재 런타임 비교", group: "platform", koPath: "/admin/system/current-runtime-compare", enPath: "/en/admin/system/current-runtime-compare" },
  { id: "repair-workbench", label: "복구 워크벤치", group: "platform", koPath: "/admin/system/repair-workbench", enPath: "/en/admin/system/repair-workbench" },
  { id: "codex-request", label: "Codex Execution Console", group: "platform", koPath: "/admin/system/codex-request", enPath: "/en/admin/system/codex-request" },
  { id: "unified-log", label: "통합 로그", group: "platform", koPath: "/admin/system/unified_log", enPath: "/en/admin/system/unified_log" },
  { id: "observability", label: "추적 조회", group: "platform", koPath: "/admin/system/observability", enPath: "/en/admin/system/observability" },
  { id: "help-management", label: "도움말 운영", group: "platform", koPath: "/admin/system/help-management", enPath: "/en/admin/system/help-management" },
  { id: "sr-workbench", label: "SR 워크벤치", group: "platform", koPath: "/admin/system/sr-workbench", enPath: "/en/admin/system/sr-workbench" }
];
