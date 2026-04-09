import type { LazyPageUnit, RouteUnitDefinition } from "../../framework/routes/pageUnitTypes";

const environmentManagementLoader = () => import("./EnvironmentManagementHubPage");

export const ENVIRONMENT_MANAGEMENT_ROUTE_UNITS = [
  {
    id: "environment-management",
    label: "메뉴 통합 관리",
    group: "platform",
    koPath: "/admin/system/environment-management",
    enPath: "/en/admin/system/environment-management"
  }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type EnvironmentManagementRouteId = (typeof ENVIRONMENT_MANAGEMENT_ROUTE_UNITS)[number]["id"];

export const ENVIRONMENT_MANAGEMENT_PAGE_UNITS = [
  {
    id: "environment-management",
    exportName: "EnvironmentManagementHubPage",
    loader: environmentManagementLoader
  }
] as const satisfies ReadonlyArray<LazyPageUnit<EnvironmentManagementRouteId>>;
