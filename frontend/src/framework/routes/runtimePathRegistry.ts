import type { RouteUnitDefinition } from "./pageUnitTypes";
import { normalizeRouteLookupPath } from "./routeDefinitionRegistry";

export function normalizeComparablePath(value: string): string {
  return normalizeRouteLookupPath(value);
}

export function createRuntimePathRegistry<TId extends string>(
  routes: ReadonlyArray<RouteUnitDefinition<TId>>,
  aliases: ReadonlyArray<readonly [string, TId]> = []
) {
  const routeByComparablePath = new Map<string, TId>();

  routes.forEach((entry) => {
    routeByComparablePath.set(normalizeComparablePath(entry.koPath), entry.id);
    routeByComparablePath.set(normalizeComparablePath(entry.enPath), entry.id);
  });

  aliases.forEach(([path, pageId]) => {
    routeByComparablePath.set(normalizeComparablePath(path), pageId);
  });

  return {
    getByPath(path: string) {
      return routeByComparablePath.get(normalizeComparablePath(path)) || null;
    },
    hasPath(path: string) {
      return routeByComparablePath.has(normalizeComparablePath(path));
    }
  };
}
