import { ComponentType } from "react";
import type { MigrationPageId } from "./definitions";
import { ALL_ROUTE_PAGE_UNIT_FAMILIES } from "./families/allPageUnitFamilies";
import { createPageModuleRegistry } from "../../framework/routes/pageRegistryHelpers";

const pageModuleRegistry = createPageModuleRegistry(ALL_ROUTE_PAGE_UNIT_FAMILIES, "home");

export const pageComponents: Partial<Record<MigrationPageId, ComponentType>> = pageModuleRegistry.components;

export function getPageComponent(route: MigrationPageId): ComponentType {
  return pageModuleRegistry.getPageComponent(route);
}

export function preloadPageModule(route: MigrationPageId) {
  return pageModuleRegistry.preloadPageModule(route);
}
