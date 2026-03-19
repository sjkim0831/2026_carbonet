export type SystemComponentCatalogType = "button" | "input" | "select" | "textarea" | "table" | "pagination";

export type SystemComponentCatalogRoute = {
  routeId: string;
  label: string;
  koPath: string;
  enPath: string;
};

export type SystemComponentCatalogInstance = {
  route: SystemComponentCatalogRoute;
  componentType: SystemComponentCatalogType;
  componentName: string;
  variant: string;
  size: string;
  className: string;
  icon: string;
  label: string;
  placeholder: string;
  summary: string;
};

export type SystemComponentCatalogItem = {
  key: string;
  styleGroupId: string;
  componentType: SystemComponentCatalogType;
  componentName: string;
  variant: string;
  size: string;
  className: string;
  icon: string;
  placeholder: string;
  summary: string;
  routeCount: number;
  instanceCount: number;
  labels: string[];
  routes: SystemComponentCatalogRoute[];
  instances: SystemComponentCatalogInstance[];
};

type RouteDefinition = {
  id: string;
  label: string;
  koPath: string;
  enPath: string;
};

declare global {
  interface ImportMeta {
    glob: (pattern: string, options?: Record<string, unknown>) => Record<string, unknown>;
  }
}

const routesModule = import.meta.glob("../../app/routes/definitions.ts", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

const pageRegistrySourceModule = import.meta.glob("../../app/routes/pageRegistry.tsx", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

const featureSourceModules = import.meta.glob("../**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default"
}) as Record<string, string>;

function normalizeFeatureImportPath(value: string) {
  const trimmed = value
    .trim()
    .replace(/^\.\.\/\.\.\/features\//, "../")
    .replace(/^\.\.\/\.\.\//, "../");
  return trimmed.endsWith(".tsx") ? trimmed : `${trimmed}.tsx`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function parseRouteDefinitions(): RouteDefinition[] {
  const source = Object.values(routesModule)[0] || "";
  const routes: RouteDefinition[] = [];
  const routePattern = /\{\s*id:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"[\s\S]*?koPath:\s*"([^"]+)"\s*,\s*enPath:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = routePattern.exec(source)) !== null) {
    routes.push({
      id: match[1],
      label: match[2],
      koPath: match[3],
      enPath: match[4]
    });
  }
  return routes;
}

function parsePageRegistryRouteFolders() {
  const source = Object.values(pageRegistrySourceModule)[0] || "";
  const sharedLoaderMap = new Map<string, string>();
  const routeFolderMap = new Map<string, string>();
  const loaderPattern = /const\s+([A-Za-z0-9_]+)\s*=\s*\(\)\s*=>\s*import\("([^"]+)"\);/g;
  let match: RegExpExecArray | null;
  while ((match = loaderPattern.exec(source)) !== null) {
    sharedLoaderMap.set(match[1], normalizeFeatureImportPath(match[2]));
  }
  const directPattern = /"([^"]+)":\s*lazyNamed\(\(\)\s*=>\s*import\("([^"]+)"\),/g;
  while ((match = directPattern.exec(source)) !== null) {
    routeFolderMap.set(match[1], normalizeFeatureImportPath(match[2]).replace(/[^/]+\.tsx$/, ""));
  }
  const sharedPattern = /"([^"]+)":\s*lazyNamed\(([A-Za-z0-9_]+),/g;
  while ((match = sharedPattern.exec(source)) !== null) {
    const importPath = sharedLoaderMap.get(match[2]);
    if (importPath) {
      routeFolderMap.set(match[1], importPath.replace(/[^/]+\.tsx$/, ""));
    }
  }
  return routeFolderMap;
}

function cleanLabel(value: string) {
  return value
    .replace(/\{[^}]*\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pushCatalogMatch(
  matches: SystemComponentCatalogInstance[],
  componentType: SystemComponentCatalogType,
  componentName: string,
  attrs: string,
  body = ""
) {
  const classNameMatch = attrs.match(/\bclassName="([^"]+)"/);
  const variantMatch = attrs.match(/\bvariant="([^"]+)"/);
  const sizeMatch = attrs.match(/\bsize="([^"]+)"/);
  const iconMatch = attrs.match(/\bicon="([^"]+)"/);
  const placeholderMatch = attrs.match(/\bplaceholder="([^"]+)"/);
  const label = cleanLabel(body);
  const summary = [variantMatch?.[1], sizeMatch?.[1], classNameMatch?.[1], iconMatch?.[1], placeholderMatch?.[1]]
    .filter(Boolean)
    .join(" / ");
  matches.push({
    route: { routeId: "", label: "", koPath: "", enPath: "" },
    componentType,
    componentName,
    variant: variantMatch?.[1] || "",
    size: sizeMatch?.[1] || "",
    className: classNameMatch?.[1] || "",
    icon: iconMatch?.[1] || "",
    label,
    placeholder: placeholderMatch?.[1] || "",
    summary
  });
}

function parseSystemComponentMatches(source: string) {
  const matches: SystemComponentCatalogInstance[] = [];
  const buttonPattern = /<(MemberButton|MemberLinkButton|MemberPermissionButton|MemberIconButton|AppButton|AppLinkButton|AppPermissionButton|AppIconButton)\b([\s\S]*?)(?:>([\s\S]*?)<\/\1>|\/>)/g;
  let match: RegExpExecArray | null;
  while ((match = buttonPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "button", match[1], match[2] || "", match[3] || "");
  }
  const inputPattern = /<(input|AdminInput|AppInput)\b([\s\S]*?)(?:\/>|>)/g;
  while ((match = inputPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "input", match[1], match[2] || "");
  }
  const textareaPattern = /<(textarea|AdminTextarea|AppTextarea)\b([\s\S]*?)(?:>([\s\S]*?)<\/\1>|\/>)/g;
  while ((match = textareaPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "textarea", match[1], match[2] || "", match[3] || "");
  }
  const selectPattern = /<(select|AdminSelect|AppSelect)\b([\s\S]*?)>/g;
  while ((match = selectPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "select", match[1], match[2] || "");
  }
  const tablePattern = /<(table|AdminTable|AppTable)\b([\s\S]*?)>/g;
  const checkboxPattern = /<(AppCheckbox)\b([\s\S]*?)(?:\/>|>)/g;
  while ((match = checkboxPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "input", match[1], match[2] || "");
  }
  const radioPattern = /<(AppRadio)\b([\s\S]*?)(?:\/>|>)/g;
  while ((match = radioPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "input", match[1], match[2] || "");
  }
  while ((match = tablePattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "table", match[1], match[2] || "");
  }
  const paginationPattern = /<(MemberPagination)\b([\s\S]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  while ((match = paginationPattern.exec(source)) !== null) {
    pushCatalogMatch(matches, "pagination", match[1], match[2] || "", match[3] || "");
  }
  return matches;
}

function stylePrefix(componentType: SystemComponentCatalogType) {
  switch (componentType) {
    case "button":
      return "BTN";
    case "input":
      return "INP";
    case "select":
      return "SEL";
    case "textarea":
      return "TXT";
    case "table":
      return "TBL";
    case "pagination":
      return "PGN";
    default:
      return "CMP";
  }
}

export function buildSystemComponentCatalog(): SystemComponentCatalogItem[] {
  const routeFolderMap = parsePageRegistryRouteFolders();
  const routeById = new Map(parseRouteDefinitions().map((route) => [route.id, route]));
  const entries = new Map<string, {
    componentType: SystemComponentCatalogType;
    componentName: string;
    variant: string;
    size: string;
    className: string;
    icon: string;
    placeholder: string;
    summary: string;
    routes: Map<string, SystemComponentCatalogRoute>;
    instances: SystemComponentCatalogInstance[];
  }>();

  Object.entries(featureSourceModules).forEach(([modulePath, source]) => {
    if (modulePath.includes("/screen-builder/") || modulePath.includes("/admin-ui/") || modulePath.endsWith("/common.tsx")) {
      return;
    }
    const routeIds = Array.from(routeFolderMap.entries())
      .filter(([, folder]) => modulePath.startsWith(folder))
      .map(([routeId]) => routeId);
    if (!routeIds.length) {
      return;
    }
    const componentMatches = parseSystemComponentMatches(source);
    if (!componentMatches.length) {
      return;
    }
    componentMatches.forEach((componentMatch) => {
      const key = [
        componentMatch.componentType,
        componentMatch.componentName,
        componentMatch.variant,
        componentMatch.size,
        componentMatch.className,
        componentMatch.icon,
        componentMatch.placeholder
      ].join(":");
      const current = entries.get(key) || {
        componentType: componentMatch.componentType,
        componentName: componentMatch.componentName,
        variant: componentMatch.variant,
        size: componentMatch.size,
        className: componentMatch.className,
        icon: componentMatch.icon,
        placeholder: componentMatch.placeholder,
        summary: componentMatch.summary,
        routes: new Map<string, SystemComponentCatalogRoute>(),
        instances: []
      };
      routeIds.forEach((routeId) => {
        const route = routeById.get(routeId);
        if (!route) {
          return;
        }
        const routePayload = {
          routeId,
          label: route.label,
          koPath: route.koPath,
          enPath: route.enPath
        };
        current.routes.set(routeId, routePayload);
        current.instances.push({
          ...componentMatch,
          route: routePayload
        });
      });
      entries.set(key, current);
    });
  });

  return Array.from(entries.entries())
    .map(([key, value]) => ({
      key,
      styleGroupId: `${stylePrefix(value.componentType)}-${slugify(`${value.componentName}-${value.variant || "plain"}-${value.size || "md"}-${value.className || "plain"}-${value.placeholder || "noplace"}`)}`,
      componentType: value.componentType,
      componentName: value.componentName,
      variant: value.variant,
      size: value.size,
      className: value.className,
      icon: value.icon,
      placeholder: value.placeholder,
      summary: value.summary,
      routeCount: value.routes.size,
      instanceCount: value.instances.length,
      labels: Array.from(new Set(value.instances.map((item) => item.label || item.placeholder).filter(Boolean))).slice(0, 6),
      routes: Array.from(value.routes.values()).sort((left, right) => left.koPath.localeCompare(right.koPath)),
      instances: value.instances
    }))
    .sort((left, right) =>
      right.instanceCount - left.instanceCount ||
      right.routeCount - left.routeCount ||
      left.componentType.localeCompare(right.componentType) ||
      left.componentName.localeCompare(right.componentName) ||
      left.className.localeCompare(right.className)
    );
}

export function buildSystemButtonCatalog() {
  return buildSystemComponentCatalog().filter((item) => item.componentType === "button");
}
