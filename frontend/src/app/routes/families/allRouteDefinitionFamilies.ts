import type { ProjectVersionManagementRouteId } from "../../../features/project-version-management/projectVersionManagementPageUnit";
import { PROJECT_VERSION_MANAGEMENT_ROUTE_UNITS } from "../../../features/project-version-management/projectVersionManagementPageUnit";
import { flattenRouteDefinitionFamilies } from "../../../framework/routes/routeFamilyHelpers";
import type { PlatformRouteId } from "../../../platform/routes/platformRouteFamilies";
import { PLATFORM_ROUTE_DEFINITION_FAMILIES } from "../../../platform/routes/platformRouteFamilies";
import type { AppRouteFamilyId } from "../appRouteFamilies";
import { APP_ROUTE_DEFINITION_FAMILIES } from "../appRouteFamilies";

export type AllRouteId =
  | AppRouteFamilyId
  | PlatformRouteId
  | ProjectVersionManagementRouteId;

export const ALL_ROUTE_DEFINITION_FAMILIES = [
  ...APP_ROUTE_DEFINITION_FAMILIES,
  ...PLATFORM_ROUTE_DEFINITION_FAMILIES,
  PROJECT_VERSION_MANAGEMENT_ROUTE_UNITS
] as const;

export const ALL_ROUTE_DEFINITIONS = flattenRouteDefinitionFamilies<AllRouteId>(ALL_ROUTE_DEFINITION_FAMILIES);
