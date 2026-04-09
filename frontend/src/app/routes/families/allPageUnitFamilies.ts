import { PROJECT_VERSION_MANAGEMENT_PAGE_UNITS } from "../../../features/project-version-management/projectVersionManagementPageUnit";
import { PLATFORM_PAGE_UNIT_FAMILIES } from "../../../platform/routes/platformRouteFamilies";
import { APP_ROUTE_PAGE_UNIT_FAMILIES } from "../appRouteFamilies";

export const ALL_ROUTE_PAGE_UNIT_FAMILIES = [
  ...APP_ROUTE_PAGE_UNIT_FAMILIES,
  ...PLATFORM_PAGE_UNIT_FAMILIES,
  PROJECT_VERSION_MANAGEMENT_PAGE_UNITS
] as const;

export type AllPageRouteId = (typeof ALL_ROUTE_PAGE_UNIT_FAMILIES)[number][number]["id"];
