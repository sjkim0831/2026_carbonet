import { createRouteDefinitionRegistry, createRouteIdNormalizer, normalizeRouteLookupPath } from "../../../framework/routes/routeDefinitionRegistry";
import { resolveAppRouteIdAlias } from "./appRoutePolicies";
import type { MigrationPageId, RouteDefinition } from "./appRouteTypes";
import { ALL_ROUTE_DEFINITIONS } from "../families/allRouteDefinitionFamilies";

export { normalizeRouteLookupPath };

export const ROUTES = ALL_ROUTE_DEFINITIONS;

const routeRegistry = createRouteDefinitionRegistry(ROUTES);
const normalizeRouteIdValue = createRouteIdNormalizer<MigrationPageId>(routeRegistry.hasId, resolveAppRouteIdAlias);

export function getRouteDefinition(value: string | null | undefined): RouteDefinition | null {
  return routeRegistry.getById(value);
}

export function findRouteDefinitionByPath(path: string): RouteDefinition | null {
  return routeRegistry.getByPath(path);
}

export function normalizeRouteId(value: string | null | undefined): MigrationPageId | "" {
  return normalizeRouteIdValue(value);
}
