import type { LazyPageUnit, RouteUnitDefinition } from "./pageUnitTypes";

export function flattenPageUnitFamilies<TId extends string>(
  families: ReadonlyArray<ReadonlyArray<LazyPageUnit<TId>>>
) {
  const units: LazyPageUnit<TId>[] = [];
  families.forEach((family) => {
    units.push(...family);
  });
  return units;
}

export function flattenRouteDefinitionFamilies<TId extends string>(
  families: ReadonlyArray<ReadonlyArray<RouteUnitDefinition<TId>>>
) {
  const definitions: RouteUnitDefinition<TId>[] = [];
  families.forEach((family) => {
    definitions.push(...family);
  });
  return definitions;
}
