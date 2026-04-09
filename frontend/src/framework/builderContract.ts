import type { FrameworkBuilderContract } from "./contracts";
import { getFrameworkContractMetadata } from "./contractMetadata";
import { buildFrameworkComponentCatalog } from "./registry/frameworkComponentCatalog";
import { buildFrameworkPageRegistry } from "./registry/frameworkPageRegistry";

export function buildFrameworkBuilderContract(): FrameworkBuilderContract {
  const metadata = getFrameworkContractMetadata();

  return {
    frameworkId: metadata.frameworkId,
    frameworkName: metadata.frameworkName,
    contractVersion: metadata.contractVersion,
    source: "frontend-static-registry",
    generatedAt: new Date().toISOString(),
    pages: buildFrameworkPageRegistry(),
    components: buildFrameworkComponentCatalog(),
    builderProfiles: metadata.builderProfiles
  };
}
