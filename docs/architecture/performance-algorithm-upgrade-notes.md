# Performance Algorithm Upgrade Notes

This document tracks repository-level algorithm and data-structure upgrades that materially reduce runtime cost.

## Implemented on 2026-03-18

### 1. Password reset history moved to DB-side filtering and pagination

- Previous pattern:
  - load all history rows
  - filter in Java
  - paginate in Java
- Current pattern:
  - push keyword filter, source filter, sort, and pagination into JPA query
- Benefit:
  - response time now scales with requested page size instead of total history size
  - heap pressure for admin history screens is bounded

### 2. Request execution log recent-read changed to bounded-memory scan

- Previous pattern:
  - `readAllLines`
  - parse all
  - full sort
  - `limit`
- Current pattern:
  - keep only the last `N` non-empty lines in a bounded deque
  - parse only the retained recent window
- Benefit:
  - memory stays proportional to requested limit
  - removed unnecessary global sort for append-only log usage

### 3. React asset manifest cached in memory

- Previous pattern:
  - load and parse the Vite manifest on each shell/bootstrap request
- Current pattern:
  - cache parsed assets in memory
  - invalidate only when manifest timestamp changes
- Benefit:
  - removes repeated JSON parsing and classpath I/O from hot shell paths

### 4. Route and manifest lookup changed from repeated linear scans to indexes

- Backend:
  - `ReactPageUrlMapper` now uses static path-to-route and route-to-path maps
- Frontend:
  - manifest lookups now use shared pageId, menuCode, and routePath indexes
  - runtime route resolution now uses prebuilt route maps instead of repeated `find`
- Benefit:
  - hot path lookups are now effectively `O(1)`
  - duplicated normalization and search logic is reduced

### 5. Permission feature evaluation moved to bitmap-backed set math on hot admin paths

- Previous pattern:
  - repeated `contains`, `removeAll`, `anyMatch`, and duplicate-elimination scans over feature-code lists
  - repeated section-to-selected-feature intersection checks during permission page count calculation
- Current pattern:
  - `FeatureCodeBitmap` provides indexed `BitSet` encoding for normalized feature codes
  - permission editor added/removed diff, managed merge, and selected-page counting now use bitmap intersection or bitmap difference
  - payload ID extraction switched from repeated list `contains` to `LinkedHashSet`
- Benefit:
  - permission editor math is now bounded by bitmap operations after one index build
  - repeated list scans on high-cardinality feature catalogs are reduced

### 6. Menu and sitemap requests now use precompiled snapshots with versioned invalidation

- Previous pattern:
  - `selectMenuTreeList` rows were reloaded, re-sorted, and reassembled into trees on each request
  - admin sitemap visibility checks issued repeated per-leaf permission lookups
- Current pattern:
  - `MenuInfoServiceImpl` caches sorted menu rows by `codeId` and invalidates on `saveMenuOrder`
  - `HomeMenuServiceImpl` caches compiled menu trees by language and menu version
  - `SiteMapServiceImpl` caches user sitemap trees and an admin compiled skeleton by language and menu version
  - admin sitemap request path now resolves author feature codes once and filters the compiled skeleton in memory
- Benefit:
  - hot menu and sitemap requests avoid repeated DB row sorting and tree reconstruction
  - admin sitemap permission filtering removes repeated menu-by-menu permission queries

### 7. Security audit summary cards changed from repeated scans to a single-pass aggregate snapshot

- Previous pattern:
  - read recent request logs
  - filter security-audit targets
  - rescan the filtered list multiple times to compute each summary card count
- Current pattern:
  - build `SecurityAuditSnapshot` once
  - collect filtered rows and summary counters together in one pass
- Benefit:
  - summary-card count cost stays linear with one traversal
  - opens a safe path toward later materialized or persisted aggregates without changing page contracts

### 8. Emission result summary filtering now computes counts in one pass

- Previous pattern:
  - filter emission result rows into a list
  - rescan the filtered list for `reviewCount`
  - rescan the filtered list again for `verifiedCount`
- Current pattern:
  - `EmissionResultFilterSnapshot` builds the filtered list and both counters together
- Benefit:
  - removes repeated scans on the filtered result window
  - keeps page contract unchanged while preparing for later persisted summaries

### 9. Feature catalog summary counts now use a shared one-pass snapshot

- Previous pattern:
  - rescan `featureSections` for total feature count
  - rescan the same `featureSections` again for unassigned feature count
- Current pattern:
  - `FeatureCatalogSummarySnapshot` computes both counters in one traversal
- Benefit:
  - removes repeated section scans on auth-group permission payload assembly

### 10. Admin request-time summaries now flow through a shared summary service

- Current pattern:
  - `AdminSummaryService` owns request-time summary assembly for:
    - `EmissionResultFilterSnapshot`
    - `FeatureCatalogSummarySnapshot`
    - `SecurityAuditSnapshot`
  - `AdminMainController` now consumes summary snapshots instead of building them inline
- Benefit:
  - reduces controller-local hardcoded summary logic
  - creates a single replacement seam for persisted/materialized summary sources
  - keeps existing page contracts stable while preparing admin cards and dashboards for incremental summaries

### 11. Admin dashboard summary cards now support persisted snapshot source

- Current pattern:
  - `COMTNADMINSUMMARYSNAPSHOT` can store summary card payloads by snapshot key and locale
  - `AdminSummaryService` reads persisted cards first for:
    - IP whitelist
    - security policy
    - security monitoring
    - blocklist
    - scheduler
    - security audit summary
  - when no persisted row exists, the service falls back to the current default builder and attempts to persist that payload
- Benefit:
  - moves admin/operations cards off controller-local hardcoded data as a first persistence step
  - gives later batch or write-time refresh jobs a stable table and key contract
  - keeps the screen contract unchanged while enabling materialized summary rollout

### 12. React shell now bootstraps first-request session and core menu data inline

- Previous pattern:
  - shell HTML loaded first
  - frontend then fetched `/api/frontend/session`
  - admin shell then fetched `/admin/system/menu-data`
  - home landing then fetched `/api/home`
  - Current pattern:
  - shell embeds a bootstrap payload with:
    - frontend session
    - admin menu tree for admin routes
    - admin-home summary payload backed by shared summary snapshots and recent audit rows
    - auth-group, dept-role, and member-edit payloads for high-frequency admin work screens
    - home landing payload for the home route
    - mypage payload and context for the mypage route
    - selected admin `page-data` payloads for filterless summary screens
    - query-aware admin payloads for `scheduler-management` and `emission-result-list`
  - frontend consumes that payload once and seeds the existing session-storage caches before falling back to network fetches
- Benefit:
  - removes 1 to 3 extra round trips on the first hard refresh, depending on route
  - admin-home now renders real summary cards, review queue, safeguard status, and recent audit logs from the same shell bootstrap path
  - selected admin dashboards such as member stats and security summary screens can now render without a separate first `page-data` fetch
  - query-driven admin list screens can skip the first fetch as long as the bootstrap payload matches the current URL query
  - high-frequency admin work screens such as auth-group, dept-role, and member-edit can also skip their first hard-refresh fetch
  - auth-group, dept-role, and member-edit payload assembly now lives in `AdminHotPathPagePayloadService`, so API and shell bootstrap reuse the same concrete builder path
  - authority-specific helper logic used by `auth-group` and `dept-role` has been split into `AdminAuthorityPagePayloadSupport`, reducing direct helper ownership inside `AdminMainController`
  - `AdminMainController` authority helper methods now mostly delegate to `AdminAuthorityPagePayloadSupport`, keeping the controller as a thin compatibility layer while the extracted support class becomes the main implementation path
  - `auth-change` role summary lookup and recent role change history generation now also run through `AdminAuthorityPagePayloadSupport`, so authority pages share the same support layer for both payloads and supporting audit summaries
  - preserves existing API contracts and cache invalidation behavior for subsequent navigations
  - keeps shell HTML as the single fast-path handoff point for initial React hydration

### 13. React admin navigation now prefetches heavy route modules and cached page-data on hover

- Previous pattern:
  - admin route changes preloaded the JS module only after click
  - heavy screens such as `auth-group`, `dept-role`, `member-edit`, and query-driven dashboards still started their first page-data request only after navigation
- Current pattern:
  - internal React-managed links now trigger route prefetch on hover and focus
  - prefetch warms both:
    - the lazy route module
    - the existing session-storage-backed page-data cache for selected hot routes
  - click navigation also awaits the same warm-up path before switching route
- Benefit:
  - repeated admin navigation cost shifts earlier into hover or focus idle time
  - hot routes can render from warmed cache instead of starting a cold request after click
  - `member-edit` now uses the same cache path as other admin page-data requests, so prefetched member payloads are reused directly

## High-value backlog

### 1. Permission evaluation bitset model

- Replace repeated string-list `includes` checks with integer-indexed `BitSet` or equivalent bitmap representation
- Best target areas:
  - feature permission checks
  - menu visibility checks
  - effective permission merge logic

### 2. Precompiled menu and sitemap snapshots

- Build immutable language- and scope-aware menu trees only when menu metadata changes
- Serve snapshot objects during requests instead of reconstructing trees repeatedly

### 3. Materialized summary tables for audit and operations dashboards

- Maintain state counts incrementally at write time
- Avoid repeated scan-and-count queries for summary cards
- Best next candidates in this repo:
  - admin main summary cards in `AdminMainController`
  - security/audit dashboard aggregates currently assembled from list or log reads

### 4. Append-only log segments with recent index

- Move beyond bounded linear scan when request log volume becomes large
- Keep recent-offset index or segmented files for near-constant recent reads

### 5. Heavy-hitter sketches for security and traffic analytics

- Candidate algorithms:
  - Count-Min Sketch
  - Misra-Gries
- Use for:
  - top failing IPs
  - top denied routes
  - top noisy actors

### 6. Bloom or Cuckoo filters for duplicate and blocklist fast-path checks

- Use for:
  - duplicate execution keys
  - repeated event IDs
  - large blocklist pre-checks before DB hits

## Delivery rule

For performance-sensitive changes in this repository, prefer this order:

1. push work to the persistence layer when the problem is large-result filtering or pagination
2. replace repeated linear scans with indexed lookup tables
3. add bounded-memory behavior before adding more caching
4. add incremental summaries before adding more full rescans
5. use probabilistic structures only when exact structures become too expensive

## Current safe invalidation boundary

- Menu snapshot invalidation currently happens when `MenuInfoService.saveMenuOrder(...)` writes menu ordering metadata.
- If menu structure or menu-to-feature mappings are changed through additional write paths later, extend the same invalidation hook before widening cache scope.

## Handoff for next AI

- Next high-priority action:
  - design and implement incremental or materialized summary counts for admin main cards before adding any new in-memory count cache
- Verify after continuing:
  - `cd /opt/projects/carbonet/frontend && npm run build`
  - `cd /opt/projects/carbonet && mvn -q -DskipTests compile`
