---
name: carbonet-audit-trace-architecture
description: Design or extend Carbonet-wide audit logging, trace correlation, UI manifest, component registry, and operational governance for pages, components, functions, and APIs in this repository. Use when the user asks how to track parameters, outputs, execution results, page layout, component composition, or rollout plans across the React frontend and Spring Boot backend.
---

# Carbonet Audit Trace Architecture

Use this skill when the task is system-wide observability, audit, or governance rather than one feature screen.

If the request becomes a concrete menu/page/service implementation after the audit or registry rules are decided, hand the implementation portion to `carbonet-feature-builder`.

Read only what you need:

- Read the matching docs under `/opt/projects/carbonet/docs/...` first. Older `carbonet-react-migration` paths may appear in historic handoff notes, but the canonical docs for this repository live under `/opt/projects/carbonet/docs/`.
- Read [`/opt/projects/carbonet/docs/architecture/system-observability-audit-trace-design.md`](/opt/projects/carbonet/docs/architecture/system-observability-audit-trace-design.md) when you need the repository-specific target architecture, rollout sequence, or the latest AI handoff state.
- Read [`/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md`](/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md) when the user asks how split projects should consume shared backend code, version common modules, or avoid runtime source sharing.
- Read [`/opt/projects/carbonet/docs/architecture/common-module-taxonomy.md`](/opt/projects/carbonet/docs/architecture/common-module-taxonomy.md) when the user asks what kinds of common modules should exist, how `SI_COMMON` differs from `OPS_COMMON`, or how install units should select shared common capabilities.
- Read [`/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md`](/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md) when the user asks how project DBs should split while keeping a common governance DB for scaffolding, installs, and migration control.
- Read [`/opt/projects/carbonet/docs/architecture/install-unit-lifecycle-and-resource-governance.md`](/opt/projects/carbonet/docs/architecture/install-unit-lifecycle-and-resource-governance.md) when the user asks about menu-centered install packages, delete safety, garbage classification, copy behavior, resource ownership, or chain management.
- Read [`/opt/projects/carbonet/docs/architecture/system-asset-management-screen-and-menu-plan.md`](/opt/projects/carbonet/docs/architecture/system-asset-management-screen-and-menu-plan.md) when the user asks which current admin screens already cover asset management, which screens are still weak, or how asset inventory/detail/impact/lifecycle menus should be organized.
- Read [`/opt/projects/carbonet/docs/architecture/platform-console-information-architecture.md`](/opt/projects/carbonet/docs/architecture/platform-console-information-architecture.md) when the user asks how the main system should act as the top-level platform console, what the super-master manages, or how project/menu/resource governance should appear in one admin surface.
- Read [`/opt/projects/carbonet/docs/architecture/project-governance-control-plane-and-priority-roadmap.md`](/opt/projects/carbonet/docs/architecture/project-governance-control-plane-and-priority-roadmap.md) when the user asks to centrally manage the project itself, including schedule, issue, document, mail, or call governance, and you need to decide what must be closed first versus what should follow later.
- Read [`/opt/projects/carbonet/docs/architecture/db-migration-and-upgrade-operations.md`](/opt/projects/carbonet/docs/architecture/db-migration-and-upgrade-operations.md) when the user asks when real upgrades happen, how DB migrations and app deployment should align, or whether a second DB server cutover is appropriate.
- Read [`/opt/projects/carbonet/docs/architecture/platform-control-plane-data-model.md`](/opt/projects/carbonet/docs/architecture/platform-control-plane-data-model.md) and [`/opt/projects/carbonet/docs/sql/platform_control_plane_schema.sql`](/opt/projects/carbonet/docs/sql/platform_control_plane_schema.sql) when the user asks for the common-DB table design behind project registry, install units, common modules, resources, and migration status.
- Read [`/opt/projects/carbonet/docs/architecture/react-observability-blind-spots.md`](/opt/projects/carbonet/docs/architecture/react-observability-blind-spots.md) before extending telemetry into browser-owned, third-party, file, or session-storage driven flows.
- Read [`/opt/projects/carbonet/docs/audit/non-admin-react-migration-audit.md`](/opt/projects/carbonet/docs/audit/non-admin-react-migration-audit.md) when deciding rollout priority for migrated public flows.
- Read [`/opt/projects/carbonet/docs/sql/system_observability_schema.sql`](/opt/projects/carbonet/docs/sql/system_observability_schema.sql) before changing UI registry, trace, or audit persistence.
- Read [`/opt/projects/carbonet/docs/architecture/performance-algorithm-upgrade-notes.md`](/opt/projects/carbonet/docs/architecture/performance-algorithm-upgrade-notes.md) when the request is performance-sensitive or asks for algorithm/data-structure upgrades.
- Read [`/opt/projects/carbonet/docs/ai/60-operations/performance-handoff-prompt-20260318.md`](/opt/projects/carbonet/docs/ai/60-operations/performance-handoff-prompt-20260318.md) when another AI session must continue the performance upgrade track.

## Use Cases

- audit design for frontend and backend
- trace ID propagation
- page, component, function, and API governance
- UI manifest or component registry design
- rollout estimate across this Carbonet codebase
- admin query screen or API for audit and trace search
- project-governance control plane planning
- schedule, issue, document, mail, and call governance sequencing
- menu-centered install unit governance
- resource ownership and dependency modeling
- orphan, drift, and uninstall-safety design
- common-platform vs project-module governance
- common-module taxonomy such as `SI_COMMON` and `OPS_COMMON`

## Workflow

1. Confirm whether the user wants:
   - conceptual design only
   - implementation plan
   - concrete code changes
   - a reusable skill or standard
2. Inspect current repository structure before proposing package paths.
3. Split the problem into four tracks:
   - backend authoritative audit
   - frontend route and action trace
   - function and API correlation
   - page manifest and component registry
4. If the request is really about installable modules or platform governance, add a fifth track:
   - resource registry, package lifecycle, and ownership enforcement
5. If the request expands into project schedule, issue, document, mail, or call management, add a sixth track:
   - project-governance overlay and communication-governance sequencing
5. When the request asks for resource chains, package lifecycle, or delete safety, model the problem in three explicit graphs:
   - ownership graph
   - execution graph
   - delete graph
   Do not collapse them into one vague dependency list.
6. Keep trust boundaries explicit:
   - frontend logs are diagnostic
   - backend audit is authoritative
   - UI metadata is governance data
   - install ownership is the authority for delete, copy, and drift decisions
7. Prefer manifest-based UI management over raw DOM capture.
8. If the user asks to track parameters or outputs, define masking rules before defining payload schemas.
9. For history or audit search screens, push filtering, sorting, and pagination to the DB or persistence layer before considering in-memory post-processing.
10. For file-backed audit or request logs, prefer bounded recent-log reads over full-file load and sort.
11. If the user asks for rollout timing, provide phased estimates with assumptions and a lower-risk MVP path.
12. For implementation work, start with common infrastructure before instrumenting feature pages.
13. For permission or role-assignment work, require authoritative backend audit on:
   - authority-group create/update
   - department-role mapping save
   - member/admin role assignment save
   - user feature override save
14. For non-master actors, treat `instt_id` or company scope as part of the audit context and review it at the same time as the permission model.
15. If the user wants common code reused across split projects, steer toward:
   - versioned jars or modules
   - facade or adapter layers
   - compatibility contracts
   and away from deployed systems fetching live backend source from the main system at runtime.
16. Control complexity explicitly:
   - keep one lifecycle owner per resource
   - separate `ownerScope` from `usageMode`
   - keep package summaries and derived views out of the authoritative source tables
   - automate delete only after ownership coverage and dependency verification are stable

## Repository Mapping

Use these default locations unless the codebase shows a stronger existing pattern:

- Frontend tracing:
  - `frontend/src/lib`
  - `frontend/src/components`
  - `frontend/src/features/*`
- Backend tracing and audit:
  - `src/main/java/egovframework/com/common/filter`
  - `src/main/java/egovframework/com/common/interceptor`
  - `src/main/java/egovframework/com/common/audit`
  - `src/main/java/egovframework/com/common/trace`
  - `src/main/java/egovframework/com/common/aspect`
- Persistence:
  - mapper XML under `src/main/resources/egovframework/mapper`
  - Java mappers and VO/DTO in the matching `common` or feature package
- Governance docs:
  - `docs/`
- Reusable skill assets:
  - `.codex/skills/`

## Delivery Rules

- Always define `traceId`, `requestId`, `pageId`, `actionId`, `functionId`, and `apiId`.
- When the page is intended to be installable, also define `projectId`, `packageId`, `resourceId`, and ownership scope.
- When resource chains are part of the request, also define whether each relation belongs to `OWNERSHIP`, `EXECUTION`, or `DELETE`.
- Treat `data-help-id` as mandatory for every governed UI surface, form block, table, tab, button group, and other business-significant component instance.
- Always distinguish audit records from technical trace events.
- Never recommend raw production logging of passwords, tokens, or full sensitive payloads.
- Prefer storing payload summaries, hashes, masks, and status transitions.
- Prefer persistence-native pagination for large history views and bounded-memory reads for file-backed recent-event views.
- If screen composition must be queryable, define page manifests and component registry records rather than full runtime DOM capture.
- If runtime component inspection is requested, scope it to debug or sampled mode unless the user explicitly accepts the cost.
- Do not sacrifice baseline screen behavior to improve observability. Metadata and telemetry must remain non-blocking and behavior-preserving.
- When admin screens are being restored from original templates, prefer backend audit and scope enforcement changes that survive the later UI restoration.
- Do not call low-frequency assets garbage unless ownership, dependency, and delete safety have already been checked.
- Do not recommend dynamic runtime source sharing between deployed projects and the main platform. Use versioned, reproducible artifacts instead.
- Prefer package-level drill-down views in admin UI instead of dumping raw dependency rows as the default operator experience.

## Current Repository State

- `TRACE_EVENT`, `AUDIT_EVENT`, `UI_PAGE_MANIFEST`, `UI_COMPONENT_REGISTRY`, and `UI_PAGE_COMPONENT_MAP` are already wired and in use.
- Frontend telemetry transport to `/api/telemetry/events` is implemented; backend persistence lives under `src/main/java/egovframework/com/common/trace`.
- Admin observability and help-management root APIs are exposed under `/api/admin/...`.
- Performance-sensitive governance paths already upgraded in this repo include:
  - route and manifest lookup indexes
  - bounded recent request-log reads
  - bitmap-backed permission feature evaluation in `AdminMainController`
  - versioned menu and sitemap snapshots in `MenuInfoServiceImpl`, `HomeMenuServiceImpl`, and `SiteMapServiceImpl`
- `ScreenCommandCenterServiceImpl` is the authoritative metadata builder for page-level governance:
  - UI surfaces
  - events and frontend functions
  - APIs and backend chain
  - schemas and related tables
  - menu/feature permissions
  - function input/output specs
  - API request/response specs
  - masking rules
- `ScreenCommandCenterServiceImpl` is also the most natural extension point for:
  - install-unit metadata
  - resource ownership
  - dependency and delete impact summaries
  - common vs project scope classification
- `frontend/src/app/screen-registry/pageManifests.ts` is the authoritative frontend manifest registry source for DB sync.
- `frontend/scripts/check-ui-governance.mjs` is the repository-wide verification gate for route, manifest, backend metadata, and `data-help-id` alignment.
- `frontend/src/features/help-management/ScreenCommandCenterPanel.tsx` already renders the connected metadata and should be extended instead of bypassed.
- `frontend/src/features/environment-management/VerificationCenterMigrationPage.tsx` is the current operator-first technical governance root and should be treated as the first stop before broader project-governance or communication-governance expansion.

## Handoff Rules For Another AI Session

- Treat `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java` as a shared-owner file. If you are continuing observability coverage, edit this file in the same session as any related frontend manifest updates.
- Keep `frontend/src/app/screen-registry/pageManifests.ts` and `ScreenCommandCenterServiceImpl` aligned. A new `pageId` is incomplete unless it exists in both.
- Keep React source `data-help-id` markers aligned with both manifest `instanceKey` values and help-content anchors. A governed page is incomplete if any of the three drift.
- If you add new persisted registry fields, update both:
  - the Java response/types/builders
  - the frontend TypeScript types and management panel rendering
- If you add install ownership fields, keep the following aligned in one session:
  - backend metadata builder
  - registry persistence schema
  - frontend command-center rendering
  - verification scripts or docs that define delete and orphan rules
- Before reusing old doc paths, verify them. The canonical docs live under:
  - `docs/architecture/`
  - `docs/audit/`
  - `docs/sql/`
- If you extend admin dashboard cards or audit summary APIs, prefer incremental/materialized summary writes before adding more request-time list scans.
- When handing off, leave absolute file references and verification commands in the architecture doc so another account or session can continue without chat history.

## Continuation Checklist

When continuing this work in another session, verify in this order:

1. `docs/architecture/react-observability-blind-spots.md`
2. `docs/architecture/system-observability-audit-trace-design.md`
3. `frontend/src/app/screen-registry/pageManifests.ts`
4. `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`
5. `frontend/scripts/check-ui-governance.mjs`
6. `frontend/src/features/help-management/ScreenCommandCenterPanel.tsx`
7. `src/main/java/egovframework/com/common/trace/UiManifestRegistryService.java`

Then validate with:

- `npm run build` in `frontend`
- `npm run audit:ui-governance` in `frontend`
- `mvn -DskipTests package`
- `curl -sS 'http://localhost:18000/api/admin/help-management/screen-command/page?pageId=<pageId>'`

## Recommended Rollout Order

1. Trace context and header propagation
2. Backend audit baseline for business actions
3. Frontend page, action, and API instrumentation
4. Function correlation wrappers
5. Page manifest and component registry
6. Admin search UI and retention controls
7. Install-unit ownership and orphan or drift checks

## Response Shape

For design requests, provide:

- phased architecture
- data model candidates
- package or folder mapping for this repository
- timeline range with assumptions
- key risks and non-goals

For implementation requests, provide:

- concrete target files
- minimal viable rollout sequence
- masking and privacy rules
- verification approach
