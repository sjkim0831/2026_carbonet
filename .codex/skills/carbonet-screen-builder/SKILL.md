---
name: carbonet-screen-builder
description: Design or implement a Carbonet admin screen builder that lets operators compose screens with drag-and-drop layout, property editing, data binding, event wiring, schema storage, runtime rendering, and menu integration. Use when requests mention no-code page creation, drag-and-drop UI building, component palettes, event mapping, runtime schema rendering, or extending `/admin/system/environment-management` into a screen-builder workflow.
---

# Carbonet Screen Builder

Use this skill when the user wants Carbonet to create or evolve a drag-and-drop screen builder instead of a single fixed page.

If the request also wants the builder to stay easy to extract into shared `jar` plus project adapters later, use `carbonet-common-project-boundary-switcher` first and keep common/project reversibility ahead of feature growth.

Read only what you need:

- Read [`/opt/projects/carbonet/docs/architecture/admin-screen-builder-architecture.md`](/opt/projects/carbonet/docs/architecture/admin-screen-builder-architecture.md) first for the canonical architecture, phased rollout, storage model, and scope boundaries.
- Read [`/opt/projects/carbonet/docs/architecture/page-systemization-minimum-contract.md`](/opt/projects/carbonet/docs/architecture/page-systemization-minimum-contract.md) when the request asks what a page must contain before it counts as builder-ready, reusable, installable, or properly systemized.
- Read [`/opt/projects/carbonet/docs/architecture/system-folder-structure-alignment.md`](/opt/projects/carbonet/docs/architecture/system-folder-structure-alignment.md) when the request affects where new builder, adapter, platform, frontend, or bootstrap files should live.
- Read [`/opt/projects/carbonet/docs/architecture/builder-folder-refactor-priority-map.md`](/opt/projects/carbonet/docs/architecture/builder-folder-refactor-priority-map.md) when the request is specifically about builder-oriented folder cleanup or module cutover order.
- Read [`/opt/projects/carbonet/docs/architecture/large-move-completion-contract.md`](/opt/projects/carbonet/docs/architecture/large-move-completion-contract.md) when the user explicitly allows a large move and wants the selected families fully closed rather than left transitional.
- Read [`/opt/projects/carbonet/docs/architecture/common-project-reversible-transition-rules.md`](/opt/projects/carbonet/docs/architecture/common-project-reversible-transition-rules.md) when the request cares about common/platform extraction, project adapters, or fast future rebinding.
- Read [`/opt/projects/carbonet/docs/architecture/installable-builder-upgrade-roadmap.md`](/opt/projects/carbonet/docs/architecture/installable-builder-upgrade-roadmap.md) when the user wants the builder to become a theme-developable, API-installable, Cafe24-like framework product instead of a one-off admin page set.
- Read [`/opt/projects/carbonet/docs/architecture/installable-business-process-package-model.md`](/opt/projects/carbonet/docs/architecture/installable-business-process-package-model.md) when the user wants workflow/process reuse, installable approval flows, or project-executor splits.
- Read [`/opt/projects/carbonet/docs/architecture/reusable-read-module-separation-plan.md`](/opt/projects/carbonet/docs/architecture/reusable-read-module-separation-plan.md) when the user wants read-heavy screens to become installable packages.
- Read [`/opt/projects/carbonet/docs/architecture/installable-builder-admin-console-refactor-plan.md`](/opt/projects/carbonet/docs/architecture/installable-builder-admin-console-refactor-plan.md) when current admin pages are too similar, placeholder-heavy, or structurally mixed and must be turned into registry/detail/install/validator/rollback/package consoles.
- Read [`/opt/projects/carbonet/docs/architecture/stable-adapter-and-common-core-versioning.md`](/opt/projects/carbonet/docs/architecture/stable-adapter-and-common-core-versioning.md) when builder/common-core changes must stay safe for long-lived project adapters while AI agents continue updating common internals.
- Read [`/opt/projects/carbonet/docs/architecture/admin-screen-builder-phase1-mvp.md`](/opt/projects/carbonet/docs/architecture/admin-screen-builder-phase1-mvp.md) when the user asks for concrete Phase 1 implementation scope, table/API/React breakdown, or delivery order.
- Read [`/opt/projects/carbonet/docs/sql/admin_screen_builder_phase1_schema.sql`](/opt/projects/carbonet/docs/sql/admin_screen_builder_phase1_schema.sql) when the request needs table design, draft/publish/version storage, or a starting SQL contract.
- Read [`/opt/projects/carbonet/docs/frontend/admin-screen-layout-standard.md`](/opt/projects/carbonet/docs/frontend/admin-screen-layout-standard.md) when the request touches layout slots, action placement, page frames, or UI consistency rules.
- Read [`/opt/projects/carbonet/.codex/skills/carbonet-audit-trace-architecture/SKILL.md`](/opt/projects/carbonet/.codex/skills/carbonet-audit-trace-architecture/SKILL.md) if the request also needs audit, trace, manifest, registry, or runtime observability.
- Read [`/opt/projects/carbonet/.codex/skills/carbonet-feature-builder/SKILL.md`](/opt/projects/carbonet/.codex/skills/carbonet-feature-builder/SKILL.md) if the request includes actual Carbonet menu/page/service implementation beyond the builder platform itself.

## Use Cases

- drag-and-drop admin page builder
- no-code or low-code screen composer
- component palette and property panel
- event binding editor
- runtime screen schema renderer
- menu integration for generated pages
- schema versioning, publish, preview, rollback
- builder-backed page templates such as list/detail/edit/review
- DB-backed component registry governance, usage lookup, and replacement mapping

## Default Scope Rules

Treat screen-builder work as four layers:

1. `builder authoring UI`
2. `schema persistence and validation`
3. `runtime renderer`
4. `menu / authority / metadata integration`

Treat authority scope as a first-class page-systemization concern, not a later security add-on.
If a page cannot declare actor scope, data scope, action scope, and approval scope, it is not ready to be treated as a reusable builder page or installable runtime asset.

When the user wants a framework-grade installable builder, treat it as seven layers instead:

1. `builder core runtime`
2. `project adapter`
3. `theme package`
4. `API module package`
5. `screen template library`
6. `install/bootstrap validator`
7. `governed admin operations console`

When the user also wants installable screens and process reuse, add two more concerns:

8. `reusable read module`
9. `business process package`

When the user also wants installable themes, treat visual ownership as three lanes:

1. `common primitive`
2. `theme presentation`
3. `project binding`

Do not let theme packages absorb project business behavior.

When the user wants future editor separation too, treat builder delivery as four backend/product lanes:

1. `screenbuilder-core`
2. `screenbuilder-runtime-common-adapter`
3. `project binding adapter`
4. `editor/admin tool`

Do not assume the current admin editor screens must stay bundled with runtime builder support forever.

Do not jump straight to “build every screen”. Start from the narrowest viable template set:

- list
- detail
- edit
- review

When standardization is the goal, prefer this order:

1. DB-backed component registry
2. usage lookup and delete/remap controls
3. one pilot page such as `/admin/member/list`
4. then wider member/admin page migration

When "3-minute bootstrap" is the goal, prefer this order instead:

1. installable core and adapter split
2. starter adapter skeleton
3. validator and bootstrap manifest
4. theme-installable contract
5. API-installable contract
6. reusable read split for read-heavy screens
7. business process package contract for workflow reuse
8. only then large-scale screen/menu expansion

When AI-driven common-core iteration is expected, add this rule:

1. keep project-facing adapter contracts stable
2. keep manifest and DTO meaning stable
3. evolve builder/common internals behind those contracts
4. introduce new versioned adapter lines only for truly breaking changes

## Workflow

1. Classify the request:
   - architecture only
   - MVP design
   - builder UI implementation
   - schema/runtime implementation
   - menu integration
2. Decide the release phase:
   - Phase 1: layout + component palette
   - Phase 2: event/data binding
   - Phase 3: runtime/publish
   - Phase 4: governance/audit/rollback
3. Fix the canonical storage contract before UI work:
   - screen schema id
   - version id
   - component tree
   - event bindings
   - data bindings
   - publish status
4. Keep menu integration separate from builder authoring:
   - menu tree remains the inventory source of truth
   - builder schema is an overlay attached to a menu/page
5. Define allowed components explicitly. Avoid an unbounded palette in early phases.
6. For event binding, support only a small action set first:
   - navigate
   - open modal
   - set field/state
   - submit API
   - refresh query
7. Require validation before publish:
   - broken component references
   - missing API/schema links
   - invalid event target
   - missing authority metadata
   - missing authority scope or grantable-action scope
   - missing data-scope or approval-scope rule for list, detail, export, save, approve, or delete actions
8. If implementation is requested, build in this order:
   - schema types
   - validation
   - minimal runtime renderer
   - authoring UI
   - menu/environment integration
   - audit and publish history
   - component registry governance
   - pilot page preset

## Incremental Refactor Rule

When builder work is actively progressing, prefer incremental structural cleanup inside the same ownership family instead of postponing all refactoring to a separate phase.

Use this rule:

- while implementing a builder slice, also move obviously misplaced files in that same family toward the canonical folder structure
- do not open broad unrelated renames just for tidiness
- do not move shared files owned by another active session
- do not stop builder progress for repository-wide beautification

Good examples:

- builder core work also trims remaining builder-core leakage from the root legacy tree
- adapter work also renames or relocates adapter-local bridges into the adapter module
- frontend builder work also separates builder platform metadata from route-shell glue when both belong to the same slice

Bad examples:

- pausing a builder feature slice to reorganize unrelated member or trade folders
- sweeping rename of many route files without a builder ownership reason
- moving files across active owner boundaries without closing the current builder slice first

If the user explicitly allows a large move, prefer accumulated large moves through repeated builder-family slices rather than one blind bulk rename.

## Page Systemization Minimum

Before calling an existing admin page "systemized" or "builder-ready", require all of these:

1. Stable identity:
   - `pageId`
   - `menuCode`
   - canonical route path
   - install scope and ownership lane
2. Runtime metadata:
   - page manifest
   - component tree or approved template profile
   - help/accessibility/security/authority binding references
3. Authority scope:
   - actor family
   - data scope such as `GLOBAL`, `INSTT_SCOPED`, `DEPT_SCOPED`, `PROJECT_SCOPED`
   - action scope such as `view`, `create`, `update`, `delete`, `approve`, `execute`, `export`
   - approval-authority requirement where relevant
4. Data and action contracts:
   - bootstrap payload contract
   - query contract
   - mutation contract
   - event to function/API binding
5. Install and project binding:
   - installable module or page-family ownership
   - project binding inputs
   - validator checks
   - runtime effects and rollback expectations

If one of these is missing, treat the page as partially migrated or placeholder-like, not as a governed builder asset.

## Authority Scope Rule

Authority scope is mandatory for upgrade direction because it decides whether a page can survive:

- common-platform extraction
- project rebinding
- builder regeneration
- installable-module delivery
- runtime deploy and rollback verification

Without authority scope:

- menu visibility becomes ad hoc
- backend query scope drifts from UI visibility
- export, approve, delete, and execute actions become unsafe
- generated pages cannot be trusted across projects

Use authority scope at the same time as menu and page binding, not after the page is already built.

## Registry Rules

- Use `UI_COMPONENT_REGISTRY` and `UI_PAGE_COMPONENT_MAP` as the first storage layer when possible.
- File-backed registry rows may exist temporarily, but import them into DB and continue from DB.
- Never allow delete while a component is still used by manifest pages, builder drafts, or published builder snapshots.
- Support replacement mapping before delete.

## Primitive Standardization Rules

- Prefer one shared primitive layer for reusable UI atoms before creating admin-only or home/join-only wrappers.
- Keep route-group wrappers thin:
  - admin/member wrappers may set labels, layout slots, or policy defaults
  - home/join wrappers may set visual tone or accessibility defaults
  - but both should render the same primitive where possible
- Standardize detection around primitive names first. For regex-based cataloging, prefer explicit JSX tags such as:
  - `AppButton`
  - `AppLinkButton`
  - `AppPermissionButton`
  - `AppInput`
  - `AppSelect`
  - `AppTextarea`
  - `AppTable`
  - `AppPagination`
  - `AppCheckbox`
  - `AppRadio`
- Avoid mixing many raw `button`, `a`, `input`, `select`, `textarea`, `table` patterns once a primitive exists.
- When exact visual parity is needed across admin and home/join, add variant props to the primitive rather than cloning a new component.
- Keep DOM depth and base class tokens predictable so differences are easy to diff:
  - prefer one primitive wrapper element per atom
  - preserve canonical classes such as `app-btn`, `app-field`, `app-table`, `app-choice`
  - keep admin/member and home/join wrappers thin re-exports or prop adapters
- Maintain a repeatable audit:
  - run `npm run audit:component-standardization`
  - reduce remaining raw tags and legacy class names from the top hotspot files first

## Pilot Rules

For “can this rebuild member management pages?” requests:

- answer with staged adoption, not one-shot replacement
- start from `/admin/member/list`
- require reusable search form, table, pagination, and row action blocks before claiming broader coverage

## Delivery Rules

- Prefer template-limited MVP over a universal builder.
- Keep builder schema versioned and draft-first.
- Keep runtime rendering deterministic; do not hide missing bindings silently.
- Use existing environment-management, auth-group, screen-command, and full-stack metadata flows instead of inventing disconnected registries.
- Treat generated or builder-managed pages as installable runtime assets with explicit ownership and delete rules.
- Do not treat placeholder admin screens as delivery progress. A menu filled with nonfunctional, lookalike pages is governance debt, not framework readiness.
- For framework-grade delivery, every builder/admin/theme/API/process screen must declare:
  - owning module
  - install scope
  - required bindings
  - validator checks
  - runtime effects
- Theme screens and theme manifests must also declare:
  - whether they belong to runtime, editor, or project binding
  - `ownershipLane`
  - `projectBindingMode`
  - `componentOverrideGroups`
- Use the current canonical builder console map unless the user explicitly asks to change ownership:
  - `Menu Registry Console` = `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`
  - `Registry Detail Console` = `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
  - `Builder Install / Bind Console` = `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`
  - `Builder Package Studio` = `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`
  - `validator-result` family = `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`, `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
  - `rollback-history` family = `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`

## Response Shape

For planning requests, provide:

- phase scope
- required modules
- storage contract
- runtime contract
- menu and authority impact
- rollout order
- first implementation slice with exact page/API/table ownership when the request is implementation-oriented

For implementation requests, provide:

- changed files
- schema/storage assumptions
- menu integration impact
- verification summary
