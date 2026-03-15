import fs from "node:fs";
import path from "node:path";

const frontendRoot = process.cwd();
const srcRoot = path.join(frontendRoot, "src");
const repoRoot = path.resolve(frontendRoot, "..");

const appPath = path.join(srcRoot, "App.tsx");
const manifestPath = path.join(srcRoot, "app", "screen-registry", "pageManifests.ts");
const helpContentPath = path.join(srcRoot, "app", "screen-registry", "helpContent.ts");
const screenCommandPath = path.join(
  repoRoot,
  "src",
  "main",
  "java",
  "egovframework",
  "com",
  "feature",
  "admin",
  "service",
  "impl",
  "ScreenCommandCenterServiceImpl.java"
);

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseRoutes(appSource) {
  const routePattern =
    /\{\s*id:\s*"([^"]+)",\s*label:\s*"[^"]*",\s*group:\s*"([^"]+)",\s*koPath:\s*"([^"]+)",\s*enPath:\s*"([^"]+)"\s*\}/g;
  const routes = new Map();
  for (const match of appSource.matchAll(routePattern)) {
    routes.set(match[1], {
      id: match[1],
      group: match[2],
      koPath: match[3],
      enPath: match[4]
    });
  }
  return routes;
}

function parseLazyImports(appSource) {
  const importPattern = /const\s+(\w+)\s*=\s*lazyNamed\(\(\)\s*=>\s*import\("([^"]+)"\),\s*"([^"]+)"\);/g;
  const result = new Map();
  for (const match of appSource.matchAll(importPattern)) {
    result.set(match[1], {
      importPath: match[2],
      exportName: match[3]
    });
  }
  return result;
}

function parseRouteComponentMap(appSource, lazyImports) {
  const casePattern = /case\s+"([^"]+)":\s*return\s+(\w+);/g;
  const result = new Map();
  for (const match of appSource.matchAll(casePattern)) {
    const routeId = match[1];
    const componentVar = match[2];
    const imported = lazyImports.get(componentVar);
    if (!imported) continue;
    result.set(routeId, path.join(srcRoot, imported.importPath.replace(/^\.\//, "") + ".tsx"));
  }
  return result;
}

function parsePageManifests(source) {
  const manifests = new Map();
  const entryPattern = /"([^"]+)":\s*\{([\s\S]*?)\n\s*\},/g;
  for (const match of source.matchAll(entryPattern)) {
    const pageId = match[1];
    const block = match[2];
    const routePath = /routePath:\s*"([^"]+)"/.exec(block)?.[1] || "";
    const componentKeys = [...block.matchAll(/instanceKey:\s*"([^"]+)"/g)].map((item) => item[1]);
    manifests.set(pageId, { pageId, routePath, componentKeys });
  }
  return manifests;
}

function parseHelpContent(source) {
  const entries = new Map();
  const pagePattern = /"([^"]+)":\s*\{([\s\S]*?)\n\s*\},/g;
  for (const match of source.matchAll(pagePattern)) {
    const pageId = match[1];
    const block = match[2];
    const anchors = [...block.matchAll(/anchorSelector:\s*'\[data-help-id="([^"]+)"\]'/g)].map((item) => item[1]);
    if (anchors.length > 0) {
      entries.set(pageId, anchors);
    }
  }
  return entries;
}

function parseScreenCommandIds(source) {
  return {
    pageOptions: new Set([...source.matchAll(/pageOption\("([^"]+)"/g)].map((match) => match[1])),
    buildCases: new Set([...source.matchAll(/case\s+"([^"]+)":/g)].map((match) => match[1]))
  };
}

function parseHelpIds(source) {
  return new Set([...source.matchAll(/data-help-id=["{]?"([^"]+)"/g)].map((match) => match[1]));
}

function relative(filePath) {
  return path.relative(frontendRoot, filePath) || ".";
}

const appSource = read(appPath);
const manifestSource = read(manifestPath);
const helpContentSource = read(helpContentPath);
const screenCommandSource = read(screenCommandPath);

const routes = parseRoutes(appSource);
const lazyImports = parseLazyImports(appSource);
const routeToFile = parseRouteComponentMap(appSource, lazyImports);
const manifests = parsePageManifests(manifestSource);
const helpContent = parseHelpContent(helpContentSource);
const screenCommand = parseScreenCommandIds(screenCommandSource);

const issues = [];
const warnings = [];

for (const [routeId, route] of routes) {
  if (!manifests.has(routeId)) {
    issues.push(`Missing manifest for route "${routeId}" (${route.koPath})`);
  }
}

for (const [pageId, manifest] of manifests) {
  const route = routes.get(pageId);
  if (!route) {
    issues.push(`Manifest page "${pageId}" is not present in App.tsx ROUTES`);
    continue;
  }
  if (manifest.routePath && route.koPath !== manifest.routePath) {
    issues.push(
      `Route mismatch for "${pageId}": App.tsx=${route.koPath}, pageManifests.ts=${manifest.routePath}`
    );
  }
  if (!screenCommand.pageOptions.has(pageId)) {
    issues.push(`ScreenCommandCenter page option missing for "${pageId}"`);
  }
  if (!screenCommand.buildCases.has(pageId)) {
    issues.push(`ScreenCommandCenter build case missing for "${pageId}"`);
  }

  const sourceFile = routeToFile.get(pageId);
  if (!sourceFile) {
    issues.push(`No component mapping found in App.tsx switch for "${pageId}"`);
    continue;
  }
  if (!fs.existsSync(sourceFile)) {
    issues.push(`Component source missing for "${pageId}": ${relative(sourceFile)}`);
    continue;
  }

  const source = read(sourceFile);
  const helpIds = parseHelpIds(source);
  for (const key of manifest.componentKeys) {
    if (!helpIds.has(key)) {
      issues.push(
        `Missing data-help-id="${key}" in ${relative(sourceFile)} for manifest page "${pageId}"`
      );
    }
  }

  const helpAnchors = helpContent.get(pageId) || [];
  for (const anchor of helpAnchors) {
    if (!helpIds.has(anchor)) {
      issues.push(
        `helpContent anchor "${anchor}" not found in ${relative(sourceFile)} for page "${pageId}"`
      );
    }
  }

  if (manifest.componentKeys.length === 0) {
    warnings.push(`Manifest page "${pageId}" has no component instance keys`);
  }
}

for (const [pageId] of helpContent) {
  if (!manifests.has(pageId)) {
    warnings.push(`helpContent page "${pageId}" has no page manifest yet`);
  }
}

const header = `UI governance audit: ${issues.length} issue(s), ${warnings.length} warning(s)`;
console.log(header);

if (issues.length > 0) {
  console.log("\nIssues:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
}

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (issues.length === 0 && warnings.length === 0) {
  console.log("\nAll checked routes currently satisfy the UI governance baseline.");
}

process.exit(issues.length > 0 ? 1 : 0);
