import type { MigrationPageId } from "./definitions";

export function resolvePlatformSpecialCasePage(normalizedKoPath: string): MigrationPageId | null {
  if (normalizedKoPath === "/admin/system/unified_log" || normalizedKoPath.startsWith("/admin/system/unified_log/")) {
    return "unified-log";
  }
  return null;
}
