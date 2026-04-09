import type { RouteUnitDefinition } from "../../framework/routes/pageUnitTypes";
import { createRouteDefinitionRegistry, normalizeRouteLookupPath } from "../../framework/routes/routeDefinitionRegistry";
import type { AllRouteId } from "./families/allRouteDefinitionFamilies";
import { ALL_ROUTE_DEFINITIONS } from "./families/allRouteDefinitionFamilies";

export type MigrationPageId = AllRouteId;

export type RouteDefinition = RouteUnitDefinition<MigrationPageId>;

export const ROUTES: RouteDefinition[] = [...ALL_ROUTE_DEFINITIONS];
const routeRegistry = createRouteDefinitionRegistry(ROUTES);

export function getRouteDefinition(value: string | null | undefined): RouteDefinition | null {
  return routeRegistry.getById(value);
}

export function findRouteDefinitionByPath(path: string): RouteDefinition | null {
  return routeRegistry.getByPath(path);
}

export function normalizeRouteId(value: string | null | undefined): MigrationPageId | "" {
  if (!value) {
    return "";
  }
  const normalized = value.trim().replace(/_/g, "-");
  if (normalized === "codex-provision") {
    return "codex-request";
  }
  return routeRegistry.hasId(normalized) ? normalized as MigrationPageId : "";
}
