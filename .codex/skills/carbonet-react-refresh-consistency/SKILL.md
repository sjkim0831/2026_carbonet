---
name: carbonet-react-refresh-consistency
description: Keep Carbonet React migration changes visible immediately after a hard refresh while preserving fast repeat loads. Use when changing frontend build output, React shell templates, static asset delivery, cache headers, or Spring resource handling for `/react-migration`.
---

# Carbonet React Refresh Consistency

Use this skill when React migration changes must be reflected reliably after deployment or rebuild.

Read only what you need:

- Read [`/opt/projects/carbonet-react-migration/docs/ai/60-operations/react-refresh-and-cache-control.md`](/opt/projects/carbonet-react-migration/docs/ai/60-operations/react-refresh-and-cache-control.md) for the repository cache strategy.
- Read [`/opt/projects/carbonet-react-migration/frontend/vite.config.ts`](/opt/projects/carbonet-react-migration/frontend/vite.config.ts) for current build output behavior.
- Read [`/opt/projects/carbonet-react-migration/src/main/java/egovframework/com/feature/home/web/ReactMigrationViewSupport.java`](/opt/projects/carbonet-react-migration/src/main/java/egovframework/com/feature/home/web/ReactMigrationViewSupport.java) and related shell controllers when the delivery path is changing.
- Read [`/opt/projects/carbonet-react-migration/src/main/java/egovframework/com/config/web/WebMvcConfig.java`](/opt/projects/carbonet-react-migration/src/main/java/egovframework/com/config/web/WebMvcConfig.java) when resource caching or response headers may change.

## Use Cases

- React build output naming
- Vite manifest usage
- shell HTML cache headers
- Spring static resource cache policy
- stale bundle prevention after deployment
- refresh consistency for `/react-migration` routes

## Workflow

1. Confirm whether the change affects:
   - shell HTML
   - built JS or CSS
   - Spring resource delivery
   - deployment verification
2. Confirm the actual delivery chain in this repository before declaring success:
   - `frontend` build output under `src/main/resources/static/react-app`
   - copied classpath output under `target/classes/static/react-app`
   - packaged jar under `target/carbonet.jar`
   - runtime jar under `var/run/carbonet-18000.jar` when local service scripts are used
3. Keep packaging and restart in sequence, not in parallel:
   - finish `npm run build`
   - finish `mvn package -DskipTests`
   - only then run `bash ops/scripts/restart-18000.sh`
   - if `mvn package` and restart run in parallel, `var/run` can copy an older jar and serve stale bundles even though `src/main/resources` and `target/classes` are already fresh
4. Keep the repository standard:
   - shell HTML no-store
   - hashed assets immutable
5. If production assets are fixed filenames, replace that strategy with manifest-resolved hashed assets.
6. Ensure the backend resolves production asset paths from the Vite manifest.
7. Cache parsed manifest metadata in memory and invalidate it only when the manifest changes.
8. Ensure the shell route returns no-cache headers.
9. Verify a rebuild changes bundle filenames when source changes.
10. When local deployment is involved, verify the running jar contains the same manifest entries as `target/carbonet.jar`.
11. Verify the frontend build and the backend build still pass.

## Delivery Rules

- Do not reintroduce fixed production names like `assets/index.js` for React bundles.
- Do not set long-lived cache headers on the shell HTML.
- Keep fallback behavior for missing manifest cases, but do not treat fallback as the normal path.
- Do not re-parse an unchanged Vite manifest on every request when simple in-memory caching is sufficient.
- Document the cache strategy whenever this area changes.
- When using local start/restart scripts, never assume a successful restart means the newest frontend assets were deployed; confirm the runtime jar manifest or asset hash.

## Response Shape

For implementation requests, provide:

- what cache boundary changed
- what guarantees freshness after hard refresh
- what preserves fast repeat load
- verification result
