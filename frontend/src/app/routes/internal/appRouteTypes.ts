import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";
import type { AllPageRouteId as AllPageRouteFamilyId, AllRouteId } from "../appRouteFamilies";

export type MigrationPageId = AllRouteId;
export type AllPageRouteId = AllPageRouteFamilyId;
export type RouteDefinition = RouteUnitDefinition<MigrationPageId>;
