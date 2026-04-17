---
name: carbonet-common-project-boundary-switcher
description: Keep Carbonet work reversible between common-platform ownership and project-specific ownership. Use when requests involve common vs project splitting, platform-common extraction, project adapter creation, common DB vs project DB ownership, menu scope separation, installable builder/module packaging, fleet-wide common-core upgrades, compatibility matrices, ring rollout, or making code easy to move between core and project layers later.
---

# Carbonet Common Project Boundary Switcher

Use this skill before implementation when the real goal is not only "make it work" but also "make it easy to move between common and project ownership later".

Read only what you need:

- Read [`/opt/projects/carbonet/docs/architecture/common-project-reversible-transition-rules.md`](/opt/projects/carbonet/docs/architecture/common-project-reversible-transition-rules.md) first for the canonical reversible-boundary rules.
- Read [`/opt/projects/carbonet/docs/architecture/page-systemization-minimum-contract.md`](/opt/projects/carbonet/docs/architecture/page-systemization-minimum-contract.md) when the request involves page-by-page systemization, installable screens, page manifests, authority scope, or deciding whether a page is common definition plus project binding.
- Read [`/opt/projects/carbonet/docs/architecture/page-systemization-checklist.md`](/opt/projects/carbonet/docs/architecture/page-systemization-checklist.md) when the task needs a page or page-family closeout checklist.
- Read [`/opt/projects/carbonet/docs/architecture/project-binding-patterns.md`](/opt/projects/carbonet/docs/architecture/project-binding-patterns.md) when the task is really about common definition versus project binding versus project executor lines.
- Read [`/opt/projects/carbonet/docs/architecture/builder-install-deploy-closeout-checklist.md`](/opt/projects/carbonet/docs/architecture/builder-install-deploy-closeout-checklist.md) when the user asks whether common-to-project binding is installable and deployable, not just structurally separated.
- Read [`/opt/projects/carbonet/docs/architecture/authority-scope-application-checklist.md`](/opt/projects/carbonet/docs/architecture/authority-scope-application-checklist.md) when project binding must preserve authority behavior across menu, route, query, action, and audit surfaces.
- Read [`/opt/projects/carbonet/docs/architecture/system-folder-structure-alignment.md`](/opt/projects/carbonet/docs/architecture/system-folder-structure-alignment.md) when the request also affects folder placement, module extraction, app assembly placement, or keeping new files out of the root legacy tree.
- Read [`/opt/projects/carbonet/docs/architecture/large-move-completion-contract.md`](/opt/projects/carbonet/docs/architecture/large-move-completion-contract.md) when the request explicitly asks for a fully completed large move instead of an open-ended transitional cleanup.
- Read [`/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md`](/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md) when DB ownership or table split is involved.
- Read [`/opt/projects/carbonet/docs/architecture/admin-ops-and-project-admin-separation-plan.md`](/opt/projects/carbonet/docs/architecture/admin-ops-and-project-admin-separation-plan.md) when the request is about central operator screens versus project-admin screens, keeping the same UI first, or separating current shared admin pages into later-separable runtime lanes.
- Read [`/opt/projects/carbonet/docs/architecture/system-asset-management-screen-and-menu-plan.md`](/opt/projects/carbonet/docs/architecture/system-asset-management-screen-and-menu-plan.md) when the request is about reorganizing current admin menus into asset inventory, runtime operations, security assets, integration assets, or controlled-change lanes.
- Read [`/opt/projects/carbonet/docs/architecture/common-jar-platform-and-project-runtime-plan.md`](/opt/projects/carbonet/docs/architecture/common-jar-platform-and-project-runtime-plan.md) when the request is about splitting project runtime first, delivering reusable common jars, adding new projects from templates, or postponing control-plane extraction until later.
- Read [`/opt/projects/carbonet/docs/architecture/carbonet-runtime-split-classification-matrix.md`](/opt/projects/carbonet/docs/architecture/carbonet-runtime-split-classification-matrix.md) when the user wants the current Carbonet menus, route families, or DB lanes classified into `COMMON_RUNTIME`, `PROJECT_RUNTIME`, `PROJECT_ADAPTER`, and `CONTROL_PLANE_LATER`.
- Read [`/opt/projects/carbonet/docs/architecture/carbonet-backend-and-db-split-starter-matrix.md`](/opt/projects/carbonet/docs/architecture/carbonet-backend-and-db-split-starter-matrix.md) when the task needs a first-pass backend package, service, mapper, or DB table-family split plan before actual code moves.
- Read [`/opt/projects/carbonet/docs/architecture/carbonet-first-code-move-candidates.md`](/opt/projects/carbonet/docs/architecture/carbonet-first-code-move-candidates.md) when the task is about the first concrete extraction batch order, initial module targets, or which classes should move first.
- Read [`/opt/projects/carbonet/docs/architecture/screenbuilder-core-jar-adapter-plan.md`](/opt/projects/carbonet/docs/architecture/screenbuilder-core-jar-adapter-plan.md) when the task affects builder-core extraction, shared jar packaging, or project adapter lines.
- Read [`/opt/projects/carbonet/docs/architecture/installable-builder-upgrade-roadmap.md`](/opt/projects/carbonet/docs/architecture/installable-builder-upgrade-roadmap.md) when the task is driven by "3-minute new-project bootstrap", installable builder/module delivery, theme-installable upgrades, API-installable upgrades, or framework-level builder packaging.
- Read [`/opt/projects/carbonet/docs/architecture/installable-business-process-package-model.md`](/opt/projects/carbonet/docs/architecture/installable-business-process-package-model.md) when the task involves installable workflow/process packaging, reusable process stages, or thin project executors.
- Read [`/opt/projects/carbonet/docs/architecture/reusable-read-module-separation-plan.md`](/opt/projects/carbonet/docs/architecture/reusable-read-module-separation-plan.md) when the task involves reusable list/detail/dashboard queries or screen-installable read models.
- Read [`/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md`](/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md) when the task affects reusable jars, frontend shared bundles, or version-pinned rollout.
- Read [`/opt/projects/carbonet/docs/architecture/stable-adapter-and-common-core-versioning.md`](/opt/projects/carbonet/docs/architecture/stable-adapter-and-common-core-versioning.md) when the user wants AI agents to keep evolving the common system while project adapters remain stable and versioned.
- Read [`/opt/projects/carbonet/docs/architecture/project-runtime-independent-boot-and-package-rule.md`](/opt/projects/carbonet/docs/architecture/project-runtime-independent-boot-and-package-rule.md) when the request asks whether project runtime and common runtime can be packaged or booted separately later, whether new projects can be added from thin packages, whether separate build/package paths are required, or whether a management screen is needed for package and runtime governance.
- Read [`/opt/projects/carbonet/docs/architecture/new-project-bootstrap-and-adapter-binding-design.md`](/opt/projects/carbonet/docs/architecture/new-project-bootstrap-and-adapter-binding-design.md) when the request also involves external source handoff, project-only delivery boundaries, or deciding which parts stay common binary versus project-owned source.
- Read [`/opt/projects/carbonet/docs/architecture/new-project-bootstrap-example-p003.md`](/opt/projects/carbonet/docs/architecture/new-project-bootstrap-example-p003.md) when the request involves central project selection, route-prefix versus domain split, or showing how a concrete project should appear in the shared governance screen.
- Read [`/opt/projects/carbonet/docs/architecture/project-db-project-id-instt-id-query-contract.md`](/opt/projects/carbonet/docs/architecture/project-db-project-id-instt-id-query-contract.md) when legacy file tables or shared member/institution tables must be project-scoped first at the repository boundary before full DB backfill.
- Read [`/opt/projects/carbonet/docs/architecture/fleet-common-upgrade-operating-model.md`](/opt/projects/carbonet/docs/architecture/fleet-common-upgrade-operating-model.md) when the task is about keeping many projects on maintained common versions, automatic compatibility runs, update waves, or common maintenance operations across customers.
- Read [`/opt/projects/carbonet/docs/architecture/artifact-registry-and-project-version-governance.md`](/opt/projects/carbonet/docs/architecture/artifact-registry-and-project-version-governance.md) when the task affects artifact preservation, project-installed version records, adapter change history, or project-management-console upgrade flow.
- Read [`/opt/projects/carbonet/docs/architecture/artifact-and-release-naming-contract.md`](/opt/projects/carbonet/docs/architecture/artifact-and-release-naming-contract.md) when the task affects artifact naming, release-unit IDs, runtime-package IDs, or deploy-trace identity rules.

## Use Cases

- common vs project ownership split
- making code movable from project into common later
- making common code re-bindable into project later
- extracting reusable core and leaving thin project adapters
- menu scope split such as platform/common/project/runtime
- theme/common/project split such as primitive/theme/binding
- builder runtime versus editor/admin split
- reusable read layer versus project write layer split
- installable business process package split
- common DB vs project DB decision
- builder core jar and project adapter preparation
- 3-minute new-project bootstrap preparation
- installable builder/module packaging with versioned upgrades
- stable adapter plus changeable common-core governance
- fleet-wide common-core maintenance and patch rollout
- compatibility matrix, upgrade candidate, and ring rollout governance
- artifact registry and adapter change recording governance
- project-wide framework upgrade planning across many modules
- separating operations/admin product lanes from project business lanes
- independent project package build and boot path design
- project-runtime versus operations-console separate startup planning
- deciding whether package/runtime governance needs a screen now or later
- "do this first so future conversion is easy"

## Core Rule

Before writing or moving code, classify every changed asset as one of:

- `COMMON_ONLY`
- `PROJECT_ONLY`
- `COMMON_DEF_PROJECT_BIND`
- `MIXED_TRANSITION`

Default handling:

- `COMMON_ONLY`
  - keep project DTO, route, or DB details out
- `PROJECT_ONLY`
  - keep common-layer abstractions out unless they are already stable
- `COMMON_DEF_PROJECT_BIND`
  - split definition from project binding
- `MIXED_TRANSITION`
  - add ports, adapters, or wrappers first before deeper refactor

## Workflow

1. Classify the request:
   - pure common extraction
   - pure project implementation
   - mixed transition
2. Identify which assets need reversible ownership:
   - DTO and model types
   - ports and adapters
   - menu definitions
   - theme tokens and overrides
   - DB tables
   - runtime routes
   - frontend shared widgets
   - read-heavy query layers
   - process definitions and project executors
3. Choose the transition pattern:
   - `MOVE`
   - `WRAP`
   - `PORT_ADAPTER`
   - `COMMON_DEF_PROJECT_BIND`
   - `LEAVE_FOR_NOW`
4. Prefer these changes first:
   - core-owned DTOs instead of project DTOs
   - ports instead of direct project service calls
   - stable adapter contract before faster common-core iteration
   - configuration-backed adapter registries before endpoint-specific condition branches
   - definition tables plus binding tables instead of hard-coded mixed rows
   - thin project controllers and thin project adapters
   - property-driven defaults and starter templates before custom project logic
   - install validators before claiming "fast bootstrap"
   - separate build/package outputs before promising independent boot
   - registry and manifest governance before building a package-management screen
5. Only after that, continue with feature implementation.

## Menu Rule

Do not model menus as one undifferentiated pool.

At minimum classify menus as:

- `PLATFORM_COMMON`
- `PROJECT_COMMON`
- `PROJECT_RUNTIME`

If the core needs menu data, return a core-owned descriptor from a port.
Do not let core services depend on project DTO classes or project menu table semantics.

## Theme Rule

Do not collapse theme and project into one lane.

Classify theme-related assets as:

- `COMMON_PRIMITIVE`
- `THEME_PRESENTATION`
- `PROJECT_BINDING`

Theme packages may contain many visual elements.
That is not a problem by itself.

The problem starts when theme packages own:

- project business services
- project DTOs
- project DB logic
- project controller or route semantics

Prefer:

- common primitive behavior
- theme presentation overrides
- project binding selection

## Builder Editor Split Rule

Do not assume the admin editing tool must ship in the same artifact as the runtime builder framework.

Prefer these lanes:

- `screenbuilder-core`
- `screenbuilder-runtime-common-adapter`
- `project binding adapter`
- `editor/admin tool`

If the user wants future separation, keep editor workflow and admin-console logic out of runtime core jars.

## Operations Split Rule

If the user says operations screens, operator consoles, runtime-control pages, monitoring, backup, verification, deploy, or platform governance will be split later, do not leave them mixed inside project business runtime by default.

Prefer these lanes:

- `platform/common-core`
- `project-runtime`
- `operations-console`

When the current repository still ships them together, make the boundary explicit first:

- operations route family
- operations bootstrap payload owner
- operations menu ownership
- operations adapter/config registry

Do not make operations separation depend on copying project code later.
Make the runtime and payload contract separable now, even if packaging split comes later.

## Adapter Registry Rule

When framework upgrades or endpoint-contract upgrades can hit many modules or many projects, do not solve them with repeated route-specific `if` branches across controllers.

Prefer:

- one adapter or support owner for the compatibility boundary
- one configuration-backed endpoint-to-contract registry
- one stable project-facing contract
- one place to add new version bindings

Examples:

- bootstrap endpoint to requested-path and default-route binding
- framework version to adapter implementation binding
- operations endpoint to payload-owner binding

If a change would otherwise require touching tens or hundreds of modules, stop and create the registry/adapter seam first.

## DB Rule

Do not force two tables for everything.

Use one of these:

- `COMMON_ONLY`
- `PROJECT_ONLY`
- `COMMON_DEF_PROJECT_BIND`

When reversibility matters, prefer:

- common definition table
- project binding or override table

## Packaging Rule

If the user wants very fast reuse across projects:

- backend core should move toward shared `jar`
- frontend core should move toward shared package or bundle
- project systems should provide adapters, bindings, and overlays
- installation should be input-driven and validator-backed, not source-copy-driven

For a real "3-minute bootstrap" target, prioritize:

- fewer required input values
- starter adapter skeletons
- install validators
- versioned manifests and compatibility checks

Adapter safety rule:

- prefer stable project-facing ports and DTOs
- let common-core internals evolve behind them
- when breaking adapter changes are unavoidable, publish a new versioned contract line instead of silently rewriting existing project adapters
- common-core patch and minor releases should be designed to keep project adapters unchanged in the normal case
- fleet updates should create compatibility candidates and ring rollout plans instead of immediately changing all production projects
- endpoint and bootstrap compatibility rules should be movable to configuration where practical so patch/minor upgrades do not require source edits in every project
- if independent boot is a near-term goal, each runnable app must own its own package output path, config source, and startup command rather than sharing one transitional assembled jar
- do not build a management screen first when the underlying package registry, version manifest, and gate compatibility rules are still unstable; establish CLI/doc/manifest governance first, then add the screen as an operator surface

When business-facing screens are involved, prefer:

- reusable `read` contracts first
- process definition packages second
- project executors last

Do not force write-heavy business behavior into common packages just to increase reuse numbers.

Copying source is allowed only for prototypes, not as the normal delivery rule.

## Fleet Upgrade Rule

For many-project maintenance, prefer this order:

1. define the stable adapter contract and artifact lock format
2. publish a common-core patch artifact
3. generate project compatibility candidates
4. run build, adapter contract, DB diff, and smoke checks per project
5. update only passing projects automatically
6. route failing projects to adapter-fix tickets

For large fleet upgrades such as "200 modules" or repeated 5.0 -> 5.1 lines, explicitly answer these before implementation:

1. what stays in common-core
2. what stays in project adapter
3. what moves to configuration-backed registry
4. what belongs to operations-console rather than project runtime
5. whether the current change reduces or increases future per-project touch count
7. roll out by rings instead of all-at-once production updates

Default policy:

- `PATCH`: automatic candidate, automatic ring rollout if checks pass
- `MINOR`: automatic candidate, operator approval before broad rollout
- `MAJOR`: explicit migration plan and versioned contract line

Do not claim a common update is fleet-safe without a compatibility matrix.

## Productization Rule

When the user asks how to improve the system after boundary cleanup, prefer these answers in order:

1. stabilize page-as-unit contracts
2. make project binding explicit
3. keep write-heavy behavior in project executors
4. prove install and deploy closure

Do not answer with source-copy scaling or mixed common/project ownership as the normal path.

## Delivery Shape

For implementation requests, provide:

- ownership classification
- chosen transition pattern
- changed files
- what became easier to move later
- what is still mixed and should move next
