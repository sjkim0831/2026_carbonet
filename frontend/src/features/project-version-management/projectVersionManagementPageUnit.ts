import type { LazyPageUnit, RouteUnitDefinition } from "../../framework/routes/pageUnitTypes";

const projectVersionManagementLoader = () => import("./ProjectVersionManagementMigrationPage");

export const PROJECT_VERSION_MANAGEMENT_ROUTE_UNITS = [
  {
    id: "version-management",
    label: "버전 관리",
    group: "admin",
    koPath: "/admin/system/version",
    enPath: "/en/admin/system/version"
  }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type ProjectVersionManagementRouteId = (typeof PROJECT_VERSION_MANAGEMENT_ROUTE_UNITS)[number]["id"];

export const PROJECT_VERSION_MANAGEMENT_PAGE_UNITS = [
  {
    id: "version-management",
    exportName: "ProjectVersionManagementMigrationPage",
    loader: projectVersionManagementLoader
  }
] as const satisfies ReadonlyArray<LazyPageUnit<ProjectVersionManagementRouteId>>;
