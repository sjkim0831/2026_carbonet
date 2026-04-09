import type { LazyPageUnit, RouteUnitDefinition } from "../../framework/routes/pageUnitTypes";

const screenBuilderLoader = () => import("./ScreenBuilderMigrationPage");
const screenRuntimeLoader = () => import("./ScreenRuntimeMigrationPage");
const runtimeCompareLoader = () => import("./CurrentRuntimeCompareMigrationPage");
const repairWorkbenchLoader = () => import("./RepairWorkbenchMigrationPage");

export const SCREEN_BUILDER_ROUTE_UNITS = [
  {
    id: "screen-builder",
    label: "화면 빌더",
    group: "platform",
    koPath: "/admin/system/screen-builder",
    enPath: "/en/admin/system/screen-builder"
  },
  {
    id: "screen-runtime",
    label: "발행 화면 런타임",
    group: "platform",
    koPath: "/admin/system/screen-runtime",
    enPath: "/en/admin/system/screen-runtime"
  },
  {
    id: "current-runtime-compare",
    label: "현재 런타임 비교",
    group: "platform",
    koPath: "/admin/system/current-runtime-compare",
    enPath: "/en/admin/system/current-runtime-compare"
  },
  {
    id: "repair-workbench",
    label: "복구 워크벤치",
    group: "platform",
    koPath: "/admin/system/repair-workbench",
    enPath: "/en/admin/system/repair-workbench"
  }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type ScreenBuilderRouteId = (typeof SCREEN_BUILDER_ROUTE_UNITS)[number]["id"];

export const SCREEN_BUILDER_PAGE_UNITS = [
  {
    id: "screen-builder",
    exportName: "ScreenBuilderMigrationPage",
    loader: screenBuilderLoader
  },
  {
    id: "screen-runtime",
    exportName: "ScreenRuntimeMigrationPage",
    loader: screenRuntimeLoader
  },
  {
    id: "current-runtime-compare",
    exportName: "CurrentRuntimeCompareMigrationPage",
    loader: runtimeCompareLoader
  },
  {
    id: "repair-workbench",
    exportName: "RepairWorkbenchMigrationPage",
    loader: repairWorkbenchLoader
  }
] as const satisfies ReadonlyArray<LazyPageUnit<ScreenBuilderRouteId>>;
