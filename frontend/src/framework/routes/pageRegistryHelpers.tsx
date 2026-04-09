import { type ComponentType, lazy } from "react";
import type { LazyPageUnit } from "./pageUnitTypes";
import { flattenPageUnitFamilies } from "./routeFamilyHelpers";

export function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

export function buildLazyUnitComponents<TId extends string>(units: ReadonlyArray<LazyPageUnit<TId>>) {
  const components: Partial<Record<TId, ComponentType>> = {};
  units.forEach((unit) => {
    components[unit.id] = lazyNamed(unit.loader as () => Promise<Record<string, unknown>>, unit.exportName as never);
  });
  return components;
}

export function buildLazyUnitPreloaders<TId extends string>(units: ReadonlyArray<LazyPageUnit<TId>>) {
  const preloaders: Partial<Record<TId, () => Promise<unknown>>> = {};
  units.forEach((unit) => {
    preloaders[unit.id] = unit.loader;
  });
  return preloaders;
}

export function composePageUnitRegistry<TId extends string>(families: ReadonlyArray<ReadonlyArray<LazyPageUnit<TId>>>) {
  const units = flattenPageUnitFamilies(families);
  return {
    components: buildLazyUnitComponents(units),
    preloaders: buildLazyUnitPreloaders(units)
  };
}

export function createPageModuleRegistry<TId extends string>(
  families: ReadonlyArray<ReadonlyArray<LazyPageUnit<TId>>>,
  fallbackRoute: TId
) {
  const { components, preloaders } = composePageUnitRegistry(families);
  const preloadedModules: Partial<Record<TId, Promise<unknown>>> = {};

  return {
    components,
    getPageComponent(route: TId) {
      return components[route] || components[fallbackRoute]!;
    },
    preloadPageModule(route: TId) {
      const loader = preloaders[route];
      if (!loader) {
        return Promise.resolve();
      }
      if (!preloadedModules[route]) {
        preloadedModules[route] = loader();
      }
      return preloadedModules[route]!;
    }
  };
}
