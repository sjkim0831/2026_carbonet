# System Folder Structure Alignment

## Goal

Define the clean target folder structure for the current Carbonet and Resonance transition.

This document is the canonical answer to:

- which folders are source of truth
- which folders are transitional
- where new common/platform code should go
- where new project-specific code should go
- how builder-related modules should be placed so later refactors do not reopen the same boundary problems

For execution order, use:

- `docs/architecture/builder-folder-refactor-priority-map.md`
- `docs/architecture/large-move-completion-contract.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md`

For continuation after the closed structure-governance wave, resume from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for
`BUILDER_RESOURCE_OWNERSHIP_CLOSURE`.

## Current Top-Level Direction

Use this top-level structure as the preferred long-term shape:

```text
apps/        executable runtime assemblies
modules/     reusable jars and common/platform module lines
frontend/    frontend authoring source
templates/   project bootstrap and install templates
docs/        architecture, operations, AI maps, SQL, and handoff docs
ops/         scripts and operational helpers
src/         legacy root runtime tree still being cut over
var/         runtime mutable data
```

Current repository observation:

- this shape is already partially live
- `modules/` and `apps/` are real reactor participants in `pom.xml`
- `frontend/src/` is already the authoring source for React
- `templates/` is already the bootstrap/install asset lane
- the main cleanup task is reducing the root legacy `src/` tree over time without reopening ownership

## Source Of Truth Rule

Prefer these rules:

- `apps/`
  - source of truth for executable app assembly
- `modules/`
  - source of truth for reusable backend module ownership
- `frontend/src/`
  - source of truth for frontend authoring
- `templates/`
  - source of truth for project bootstrap and install manifests
- `docs/`
  - source of truth for architecture, operations, and AI routing docs
- `src/main/java` and `src/main/resources`
  - transitional source of truth only for runtime families that are not yet fully cut over to `modules/` or `apps/`

Do not treat `target/` or built static assets as authoring locations.

## Builder-While-Refactoring Rule

Do not force builder implementation and folder cleanup into completely separate worlds.

Preferred operating rule:

- builder work should improve structure as it goes inside the same ownership family
- each builder slice should leave its touched paths cleaner than before
- cleanup should follow the active builder ownership path, not a repository-wide beauty pass

This means:

- implementation and structural improvement may happen together
- but the cleanup should stay narrow, ownership-safe, and family-scoped

## Preferred Ownership Split

### 1. `apps/`

Use `apps/` for executable runtime assemblies only.

Preferred contents:

- Spring Boot application entry points
- runtime packaging configuration
- executable assembly wiring
- app-local exclusions and resource composition

Keep reusable business logic and reusable platform logic out of `apps/` when they can live in `modules/`.

### 2. `modules/`

Use `modules/` for publishable or reusable backend lines.

Preferred module families:

- builder core and adapters
- platform request and service contracts
- platform help, observability, runtime control, version control
- shared metadata and web-support modules
- mapper support and other reusable infrastructure jars

Use `modules/` when the code should be:

- versioned separately
- reused by more than one app or project
- tested as a narrower ownership slice
- installable or adapter-safe

### 3. `frontend/src/`

Use `frontend/src/` as the only authoring source for React work.

Preferred internal split:

- `frontend/src/app`
  - shell, route registry, bootstrapping, policy
- `frontend/src/platform`
  - platform registry, telemetry, manifest, observability metadata
- `frontend/src/framework`
  - shared full-stack contract boundary
- `frontend/src/features`
  - route-level feature and page implementations
- `frontend/src/lib`
  - infrastructure helpers
- `frontend/src/components`
  - reusable UI primitives and shared components
- `frontend/src/generated`
  - generated artifacts only

When route ownership becomes mixed, split runtime and platform route definitions explicitly instead of keeping one giant registry forever.

### 4. `templates/`

Use `templates/` for bootstrap, starter, and install manifests only.

Preferred contents:

- project bootstrap templates
- install manifests
- starter adapter checklists
- validator templates

Do not treat `templates/` as a dumping ground for ordinary app code.

### 5. `src/` Legacy Transition Tree

Treat the root `src/` tree as a transition lane.

Use it for:

- runtime families not yet cut over
- compatibility shims during module extraction
- app-wide configuration that still belongs to the root runtime

Do not expand root `src/` with new common/platform code when a module path already exists.

## Builder-Specific Folder Rules

For the currently frozen wave-level owner decision, use:

- `docs/architecture/builder-structure-wave-20260409-closure.md`

That document closes `BUILDER_STRUCTURE_GOVERNANCE` only.

Do not reopen source-of-truth or shim-vs-delete debates here once that family is accepted as closed.

The next active continuation is:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Use this builder-aligned split:

- `modules/screenbuilder-core`
  - reusable builder logic, contracts, runtime-neutral services, ports
- `modules/screenbuilder-runtime-common-adapter`
  - reusable property-backed defaults and runtime-common adapter behavior
- `modules/screenbuilder-carbonet-adapter`
  - Carbonet-specific adapter behavior, bridge wiring, and builder entry controllers
- `frontend/src/features/screen-builder`
  - builder UI implementation
- `frontend/src/framework`
  - shared frontend builder/authority contracts
- `frontend/src/platform`
  - page manifest, telemetry, and observability registry support
- `templates/screenbuilder-project-bootstrap`
  - bootstrap manifests and starter install assets

Do not reintroduce builder core classes into:

- `src/main/java/egovframework/com/feature/admin/**`
- `src/main/java/egovframework/com/platform/screenbuilder/**`
- arbitrary project-local copied paths

For the current wave, interpret the builder lanes as:

- `modules/screenbuilder-core/**`
  - builder-core source of truth
- `modules/screenbuilder-runtime-common-adapter/**`
  - reusable runtime-common policy source of truth
- `modules/screenbuilder-carbonet-adapter/**`
  - Carbonet-specific project-binding and bridge source of truth
- root legacy builder paths
  - transitional only, never canonical

## Platform Folder Rules

When code belongs to the common platform or Resonance control plane, prefer:

- backend reusable logic -> `modules/platform-*` or another reusable module
- backend app/runtime assembly -> `apps/carbonet-app`
- frontend platform metadata/registry -> `frontend/src/platform`
- frontend route-shell integration -> `frontend/src/app`

Do not leave platform families half-owned by root `feature/admin` unless the file is an explicit compatibility shim.

## Cleanup Rules

### Add New Files Here

- new reusable backend package -> `modules/`
- new executable/runtime assembly concern -> `apps/`
- new React page or route-level feature -> `frontend/src/features`
- new platform manifest/telemetry/registry support -> `frontend/src/platform`
- new shared contract bridge -> `frontend/src/framework` or a backend module
- new starter/bootstrap/install asset -> `templates/`

### Avoid These Moves

- do not add new common/platform core logic into the root legacy `src/` tree if a live module already exists
- do not add new route registries inside feature folders
- do not add new generated output to source-of-truth docs or code folders
- do not mix bootstrap templates with runtime source

## Immediate Cleanup Direction

For the current repository, the cleanest direction is:

1. keep expanding `modules/` for reusable builder and platform families
2. keep `apps/carbonet-app` as the executable assembly target
3. keep React authoring under `frontend/src/`
4. keep bootstrap/install assets under `templates/`
5. shrink the root `src/` tree over time instead of letting it regrow

## Success Test

Folder structure is aligned enough when:

- new common/platform work naturally lands in `modules/`
- new project runtime work naturally lands in `apps/` or project feature lanes
- builder code no longer leaks back into root legacy paths
- frontend route, platform, framework, and feature ownership is easy to explain from path alone
- future folder cleanup is mostly source removal, not another architecture debate
