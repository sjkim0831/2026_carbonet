import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";
import type { AllPageRouteId as AllPageRouteFamilyId } from "../families/allPageUnitFamilies";
import type { AllRouteId } from "../families/allRouteDefinitionFamilies";

export type MigrationPageId = AllRouteId;
export type AllPageRouteId = AllPageRouteFamilyId;
export type RouteDefinition = RouteUnitDefinition<MigrationPageId>;
