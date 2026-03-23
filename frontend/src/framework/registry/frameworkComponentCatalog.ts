import { buildSystemComponentCatalog } from "../../features/screen-builder/catalog/buttonCatalogCore";
import type { SystemComponentCatalogItem } from "../../features/screen-builder/catalog/buttonCatalogCore";
import type { FrameworkBuilderComponentContract } from "../contracts/builderContract";

const BUILDER_READY_COMPONENT_TYPES = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "table",
  "pagination"
]);

function inferOwnerDomain(item: SystemComponentCatalogItem): string {
  const firstRoute = item.routes[0];
  if (!firstRoute) {
    return "admin";
  }
  if (firstRoute.koPath.startsWith("/admin/")) {
    return "admin";
  }
  if (firstRoute.koPath.startsWith("/join/")) {
    return "join";
  }
  return "home";
}

function buildComponentLabel(item: SystemComponentCatalogItem): string {
  return item.labels[0] || item.summary || item.componentName || item.styleGroupId;
}

export function buildFrameworkComponentCatalog(): FrameworkBuilderComponentContract[] {
  return buildSystemComponentCatalog()
    .map((item) => ({
      componentId: item.styleGroupId,
      label: buildComponentLabel(item),
      componentType: item.componentType,
      ownerDomain: inferOwnerDomain(item),
      status: "ACTIVE",
      sourceType: "catalog-json",
      replacementComponentId: "",
      designReference: item.className,
      propsSchemaJson: JSON.stringify({
        variant: item.variant,
        size: item.size,
        icon: item.icon,
        placeholder: item.placeholder,
        labels: item.labels
      }),
      usageCount: item.instanceCount,
      routeCount: item.routeCount,
      instanceCount: item.instanceCount,
      labels: item.labels,
      builderReady: BUILDER_READY_COMPONENT_TYPES.has(item.componentType)
    }))
    .sort((left, right) => left.componentId.localeCompare(right.componentId));
}

