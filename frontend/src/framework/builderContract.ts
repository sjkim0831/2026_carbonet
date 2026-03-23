import type { FrameworkBuilderContract } from "./contracts/builderContract";
import { buildFrameworkComponentCatalog } from "./registry/frameworkComponentCatalog";
import { buildFrameworkPageRegistry } from "./registry/frameworkPageRegistry";

export function buildFrameworkBuilderContract(): FrameworkBuilderContract {
  return {
    frameworkId: "carbonet-ui-framework",
    frameworkName: "Carbonet UI Framework",
    contractVersion: "2026-03-23",
    source: "frontend-static-registry",
    generatedAt: new Date().toISOString(),
    pages: buildFrameworkPageRegistry(),
    components: buildFrameworkComponentCatalog(),
    builderProfiles: {
      pageFrameProfileIds: ["dashboard-page", "list-page", "detail-page", "edit-page", "builder-page"],
      layoutZoneIds: ["header", "sidebar", "content", "footer", "actions"],
      componentTypeIds: ["button", "input", "select", "textarea", "table", "pagination"],
      artifactUnitIds: ["page-manifest", "component-registry", "screen-builder-draft"]
    }
  };
}

