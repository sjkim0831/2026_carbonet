import type { RouteUnitDefinition } from "./pageUnitTypes";

export function normalizeRouteLookupPath(value: string): string {
  if (!value) {
    return "/";
  }
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

export function createRouteDefinitionRegistry<TId extends string>(
  routes: ReadonlyArray<RouteUnitDefinition<TId>>
) {
  const routeById = new Map<string, RouteUnitDefinition<TId>>();
  const routeByLookupPath = new Map<string, RouteUnitDefinition<TId>>();

  routes.forEach((entry) => {
    routeById.set(entry.id, entry);
    routeByLookupPath.set(normalizeRouteLookupPath(entry.koPath), entry);
    routeByLookupPath.set(normalizeRouteLookupPath(entry.enPath), entry);
  });

  return {
    getById(value: string | null | undefined) {
      if (!value) {
        return null;
      }
      return routeById.get(value) || null;
    },
    getByPath(path: string) {
      return routeByLookupPath.get(normalizeRouteLookupPath(path)) || null;
    },
    hasId(value: string) {
      return routeById.has(value);
    }
  };
}

export function createRouteIdNormalizer<TId extends string>(
  hasId: (value: string) => boolean,
  resolveAlias?: (value: string) => TId | ""
) {
  return (value: string | null | undefined): TId | "" => {
    if (!value) {
      return "";
    }
    const normalized = value.trim().replace(/_/g, "-");
    const aliased = resolveAlias?.(normalized) || "";
    if (aliased) {
      return aliased;
    }
    return hasId(normalized) ? normalized as TId : "";
  };
}
