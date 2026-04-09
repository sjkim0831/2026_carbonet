import { ComponentType, lazy } from "react";
import type { MigrationPageId } from "./definitions";

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

const platformStudioLoader = () => import("../../features/platform-studio/PlatformStudioMigrationPage");
const environmentManagementLoader = () => import("../../features/environment-management/EnvironmentManagementHubPage");
const screenBuilderLoader = () => import("../../features/screen-builder/ScreenBuilderMigrationPage");
const screenRuntimeLoader = () => import("../../features/screen-builder/ScreenRuntimeMigrationPage");
const runtimeCompareLoader = () => import("../../features/screen-builder/CurrentRuntimeCompareMigrationPage");
const repairWorkbenchLoader = () => import("../../features/screen-builder/RepairWorkbenchMigrationPage");
const observabilityLoader = () => import("../../features/observability/ObservabilityMigrationPage");
const helpManagementLoader = () => import("../../features/help-management/HelpManagementMigrationPage");
const codexRequestLoader = () => import("../../features/codex-provision/CodexProvisionMigrationPage");
const srWorkbenchLoader = () => import("../../features/sr-workbench/SrWorkbenchMigrationPage");

export const platformPageComponents: Partial<Record<MigrationPageId, ComponentType>> = {
  "platform-studio": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "screen-elements-management": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "event-management-console": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "function-management-console": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "api-management-console": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "controller-management-console": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "db-table-management": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "column-management-console": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "automation-studio": lazyNamed(platformStudioLoader, "PlatformStudioMigrationPage"),
  "environment-management": lazyNamed(environmentManagementLoader, "EnvironmentManagementHubPage"),
  "screen-builder": lazyNamed(screenBuilderLoader, "ScreenBuilderMigrationPage"),
  "screen-runtime": lazyNamed(screenRuntimeLoader, "ScreenRuntimeMigrationPage"),
  "current-runtime-compare": lazyNamed(runtimeCompareLoader, "CurrentRuntimeCompareMigrationPage"),
  "repair-workbench": lazyNamed(repairWorkbenchLoader, "RepairWorkbenchMigrationPage"),
  "codex-request": lazyNamed(codexRequestLoader, "CodexProvisionMigrationPage"),
  "unified-log": lazyNamed(observabilityLoader, "ObservabilityMigrationPage"),
  "observability": lazyNamed(observabilityLoader, "ObservabilityMigrationPage"),
  "help-management": lazyNamed(helpManagementLoader, "HelpManagementMigrationPage"),
  "sr-workbench": lazyNamed(srWorkbenchLoader, "SrWorkbenchMigrationPage")
};

export const platformPagePreloaders: Partial<Record<MigrationPageId, () => Promise<unknown>>> = {
  "platform-studio": platformStudioLoader,
  "screen-elements-management": platformStudioLoader,
  "event-management-console": platformStudioLoader,
  "function-management-console": platformStudioLoader,
  "api-management-console": platformStudioLoader,
  "controller-management-console": platformStudioLoader,
  "db-table-management": platformStudioLoader,
  "column-management-console": platformStudioLoader,
  "automation-studio": platformStudioLoader,
  "environment-management": environmentManagementLoader,
  "screen-builder": screenBuilderLoader,
  "screen-runtime": screenRuntimeLoader,
  "current-runtime-compare": runtimeCompareLoader,
  "repair-workbench": repairWorkbenchLoader,
  "codex-request": codexRequestLoader,
  "unified-log": observabilityLoader,
  "observability": observabilityLoader,
  "help-management": helpManagementLoader,
  "sr-workbench": srWorkbenchLoader
};
