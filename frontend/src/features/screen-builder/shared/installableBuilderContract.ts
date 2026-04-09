export const BUILDER_INSTALL_REQUIRED_BINDINGS = [
  "projectId",
  "menuRoot",
  "runtimeClass",
  "menuScope",
  "releaseUnitPrefix",
  "runtimePackagePrefix"
] as const;
export type BuilderInstallBindingKey = typeof BUILDER_INSTALL_REQUIRED_BINDINGS[number];

export const BUILDER_INSTALL_VALIDATOR_CHECKS = [
  "required-beans-present",
  "required-properties-present",
  "menu-root-resolvable",
  "storage-writable",
  "builder-routes-exposed"
] as const;
export type BuilderInstallValidatorCheckKey = typeof BUILDER_INSTALL_VALIDATOR_CHECKS[number];

export const BUILDER_INSTALL_ARTIFACTS = [
  "screenbuilder-core.jar",
  "screenbuilder-project-adapter.jar",
  "application-screenbuilder.properties"
] as const;

export type BuilderInstallQueueSummary = {
  menuCode: string;
  pageId: string;
  menuUrl: string;
  releaseUnitId: string;
  runtimePackageId: string;
  deployTraceId: string;
  publishReady: boolean;
  issueCount: number;
  validatorPassCount: number;
  validatorTotalCount: number;
};

export function describeBuilderInstallBinding(binding: BuilderInstallBindingKey, en: boolean) {
  switch (binding) {
    case "projectId":
      return en ? "Project Id" : "프로젝트 ID";
    case "menuRoot":
      return en ? "Menu Root" : "메뉴 루트";
    case "runtimeClass":
      return en ? "Runtime Class" : "런타임 클래스";
    case "menuScope":
      return en ? "Menu Scope" : "메뉴 스코프";
    case "releaseUnitPrefix":
      return en ? "Release Unit Prefix" : "릴리즈 유닛 Prefix";
    case "runtimePackagePrefix":
      return en ? "Runtime Package Prefix" : "런타임 패키지 Prefix";
    default:
      return binding;
  }
}

export function describeBuilderValidatorCheck(check: BuilderInstallValidatorCheckKey, en: boolean) {
  switch (check) {
    case "required-beans-present":
      return en ? "Required Beans" : "필수 Bean";
    case "required-properties-present":
      return en ? "Required Properties" : "필수 Properties";
    case "menu-root-resolvable":
      return en ? "Menu Root Resolvable" : "메뉴 루트 해석";
    case "storage-writable":
      return en ? "Storage Writable" : "스토리지 쓰기";
    case "builder-routes-exposed":
      return en ? "Builder Routes Exposed" : "빌더 라우트 노출";
    default:
      return check;
  }
}

export function buildBuilderInstallQueueSummary(input: {
  menuCode?: string | null;
  pageId?: string | null;
  menuUrl?: string | null;
  releaseUnitId?: string | null;
  runtimePackageId?: string | null;
  deployTraceId?: string | null;
  publishReady: boolean;
  issueCount: number;
  validatorPassCount: number;
  validatorTotalCount: number;
}): BuilderInstallQueueSummary {
  return {
    menuCode: String(input.menuCode || "-"),
    pageId: String(input.pageId || "-"),
    menuUrl: String(input.menuUrl || "-"),
    releaseUnitId: String(input.releaseUnitId || "-"),
    runtimePackageId: String(input.runtimePackageId || "-"),
    deployTraceId: String(input.deployTraceId || "-"),
    publishReady: input.publishReady,
    issueCount: input.issueCount,
    validatorPassCount: input.validatorPassCount,
    validatorTotalCount: input.validatorTotalCount
  };
}
