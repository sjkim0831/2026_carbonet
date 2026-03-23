import type { LayoutZone } from "../../app/screen-registry/types";

export type FrameworkContractSource = "frontend-static-registry" | "backend-runtime-registry";

export type FrameworkBuilderSurfaceContract = {
  componentId: string;
  instanceKey: string;
  layoutZone: LayoutZone | string;
  displayOrder: number;
  propsSummary: string[];
  conditionalRuleSummary: string;
};

export type FrameworkBuilderPageContract = {
  pageId: string;
  label: string;
  routePath: string;
  menuCode: string;
  domainCode: string;
  layoutVersion: string;
  designTokenVersion: string;
  componentCount: number;
  components: FrameworkBuilderSurfaceContract[];
};

export type FrameworkBuilderComponentContract = {
  componentId: string;
  label: string;
  componentType: string;
  ownerDomain: string;
  status: string;
  sourceType: string;
  replacementComponentId: string;
  designReference: string;
  propsSchemaJson: string;
  usageCount: number;
  routeCount: number;
  instanceCount: number;
  labels: string[];
  builderReady: boolean;
};

export type FrameworkBuilderProfiles = {
  pageFrameProfileIds: string[];
  layoutZoneIds: string[];
  componentTypeIds: string[];
  artifactUnitIds: string[];
};

export type FrameworkBuilderContract = {
  frameworkId: string;
  frameworkName: string;
  contractVersion: string;
  source: FrameworkContractSource;
  generatedAt: string;
  pages: FrameworkBuilderPageContract[];
  components: FrameworkBuilderComponentContract[];
  builderProfiles: FrameworkBuilderProfiles;
};

