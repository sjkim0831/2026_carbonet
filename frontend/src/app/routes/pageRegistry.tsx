import { ComponentType } from "react";
import type { MigrationPageId } from "./definitions";
import { ALL_ROUTE_PAGE_UNIT_FAMILIES } from "./families/allPageUnitFamilies";
import { composePageUnitRegistry } from "../../framework/routes/pageRegistryHelpers";

const { components: allPageComponents, preloaders: allPagePreloaders } = composePageUnitRegistry(ALL_ROUTE_PAGE_UNIT_FAMILIES);

export const pageComponents: Partial<Record<MigrationPageId, ComponentType>> = {
  ...allPageComponents
};

const preloadedModules: Partial<Record<MigrationPageId, Promise<unknown>>> = {};

const pagePreloaders: Partial<Record<MigrationPageId, () => Promise<unknown>>> = {
  ...allPagePreloaders,
};

export function getPageComponent(route: MigrationPageId): ComponentType {
  return pageComponents[route] || pageComponents.home!;
}

export function preloadPageModule(route: MigrationPageId) {
  const loader = pagePreloaders[route];
  if (!loader) {
    return Promise.resolve();
  }
  if (!preloadedModules[route]) {
    preloadedModules[route] = loader();
  }
  return preloadedModules[route]!;
}
