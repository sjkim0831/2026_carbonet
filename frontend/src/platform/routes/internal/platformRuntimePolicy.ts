import type { MigrationPageId } from "../../../app/routes/appRouteTypes";

const platformSpecialCasePrefixes: Array<readonly [string, MigrationPageId]> = [
  ["/admin/system/unified_log", "unified-log"]
];

export function resolvePlatformSpecialCasePage(normalizedKoPath: string): MigrationPageId | null {
  for (const [prefix, pageId] of platformSpecialCasePrefixes) {
    if (normalizedKoPath === prefix || normalizedKoPath.startsWith(`${prefix}/`)) {
      return pageId;
    }
  }
  return null;
}
