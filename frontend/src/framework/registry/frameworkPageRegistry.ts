import { PAGE_MANIFESTS } from "../../platform/screen-registry/pageManifests";
import type { PageManifest } from "../../platform/screen-registry/types";
import type { FrameworkBuilderPageContract } from "../contracts/builderContract";

function buildPageLabel(page: PageManifest): string {
  if (page.menuCode) {
    return page.menuCode;
  }
  return page.pageId;
}

export function buildFrameworkPageRegistry(): FrameworkBuilderPageContract[] {
  return Object.values(PAGE_MANIFESTS)
    .map((page) => ({
      pageId: page.pageId,
      label: buildPageLabel(page),
      routePath: page.routePath,
      menuCode: page.menuCode ?? "",
      domainCode: page.domainCode,
      layoutVersion: page.layoutVersion,
      designTokenVersion: page.designTokenVersion,
      componentCount: page.components.length,
      components: page.components.map((component, index) => ({
        componentId: component.componentId,
        instanceKey: component.instanceKey,
        layoutZone: component.layoutZone,
        displayOrder: index + 1,
        propsSummary: component.propsSummary ?? [],
        conditionalRuleSummary: component.conditionalRuleSummary ?? ""
      }))
    }))
    .sort((left, right) => left.pageId.localeCompare(right.pageId));
}
