import { ComponentType } from "react";
import { createPageModuleRegistry } from "../../../framework/routes/pageRegistryHelpers";
import type { AllPageRouteId } from "./appRouteTypes";
import { ALL_ROUTE_PAGE_UNIT_FAMILIES } from "../appRouteFamilies";

const pageModuleRegistry = createPageModuleRegistry<AllPageRouteId>(ALL_ROUTE_PAGE_UNIT_FAMILIES, "home");

export const pageComponents: Partial<Record<AllPageRouteId, ComponentType>> = pageModuleRegistry.components;

export function getPageComponent(route: AllPageRouteId): ComponentType {
  return pageModuleRegistry.getPageComponent(route);
}

export function preloadPageModule(route: AllPageRouteId) {
  return pageModuleRegistry.preloadPageModule(route);
}
