# Screen Builder Core Jar And Adapter Plan

## Goal

Make the screen builder installable into a new project in minutes by:

- keeping one reusable builder core
- importing backend core as a versioned `jar`
- importing frontend builder UI as a versioned shared bundle or package
- replacing only project adapters, not copying core source

This is the delivery model required if the team wants:

- "3-minute project builder bootstrap"
- reproducible upgrades
- one bug fix to propagate through version bumps instead of source copy

This plan assumes the reversible-boundary rules in:

- `docs/architecture/common-project-reversible-transition-rules.md`
- `docs/architecture/installable-builder-upgrade-roadmap.md`
- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md`
- `docs/architecture/builder-source-of-truth-matrix.md`

For the live builder continuation after structure-governance closure, use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for that continuation.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.
If continuation state changes blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn.

## Direct Answer

For backend: yes, the builder core should be imported as a `jar`.

For frontend: do not treat the whole frontend as raw copied source either.
Use a shared bundle or package line for the builder shell, builder widgets, and shared contracts.

Use this split:

- backend core: `jar`
- frontend core: shared package or built asset bundle
- project integration: thin adapters and configuration

## Why Copying Is Not The Real Goal

Copying core source is only acceptable for short-lived prototypes.

It is not the right normal operating model because it creates:

- per-project drift
- repeated bug-fix work
- hard upgrades
- no clear compatibility contract

The target model is:

- one builder core line
- many project adapters
- version-pinned rollout

## Target Packaging Model

### Backend

Recommended backend artifacts:

- `screenbuilder-core`
  - reusable builder logic
  - builder contracts
  - draft lifecycle
  - component registry governance
  - publish and compatibility checks
  - parity and authority validation helpers
- `screenbuilder-carbonet-adapter`
  - Carbonet menu adapter
  - Carbonet screen-command adapter
  - Carbonet observability adapter
  - Carbonet runtime binding helpers
- `carbonet-runtime`
  - application assembly
  - Spring Boot executable app

### Frontend

Recommended frontend artifacts:

- `@resonance/screenbuilder-core`
  - builder shell
  - builder canvas
  - property panel
  - event binding UI
  - shared builder contracts
- `@resonance/screenbuilder-carbonet-adapter`
  - Carbonet route bindings
  - Carbonet page bootstrap hooks
  - Carbonet menu and authority wiring

## Current Repository Mapping

For the fastest current answer to canonical path versus transitional path, use:

- `docs/architecture/builder-source-of-truth-matrix.md`

If the canonical-path answer is already accepted and the remaining question is about builder-owned resources or fallback lines, continue from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Current reusable core candidates:

- `src/main/java/egovframework/com/platform/screenbuilder/*`
- `src/main/java/egovframework/com/framework/builder/*`
- `frontend/src/framework/*`

Current Carbonet adapter candidates:

- `src/main/java/egovframework/com/feature/admin/screenbuilder/support/impl/CarbonetScreenBuilderMenuCatalogAdapter.java`
- `src/main/java/egovframework/com/feature/admin/screenbuilder/support/impl/CarbonetScreenBuilderCommandPageAdapter.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminScreenBuilderController.java`

Still too Carbonet-specific for core:

- adapter-layer dependence on Carbonet `MenuInfoDTO`
- direct dependency on `ObservabilityMapper`
- builder flows that assume Carbonet admin menu family `AMENU1`
- builder logic that assumes Carbonet route naming or admin URL shape

## Core Boundary Rule

`screenbuilder-core` must not know:

- Carbonet menu table names
- Carbonet admin route conventions
- Carbonet-specific DTO classes
- Carbonet-specific company or institution rules

`screenbuilder-core` may know:

- builder draft schema
- component registry schema
- authority role contract shape
- page manifest contract shape
- adapter interfaces

## Required Port Set

The builder core should only talk through ports such as:

- `ScreenBuilderMenuCatalogPort`
- `ScreenBuilderCommandPagePort`
- `ScreenBuilderComponentRegistryPort`
- `ScreenBuilderAuthorityContractPort`
- `ScreenBuilderRuntimeComparePort`
- `ScreenBuilderDraftStoragePort`
- `ScreenBuilderLegacyRegistrySourcePort`
- `ScreenBuilderMenuBindingPolicyPort`
- `ScreenBuilderArtifactNamingPolicyPort`
- `ScreenBuilderRuntimeComparePolicyPort`
- `ScreenBuilderRequestContextPolicyPort`

Current progress:

- `ScreenBuilderMenuCatalogPort`
- `ScreenBuilderCommandPagePort`
- `ScreenBuilderComponentRegistryPort`
- `ScreenBuilderAuthorityContractPort`
- `ScreenBuilderRuntimeComparePort`
- `ScreenBuilderDraftStoragePort`
- `ScreenBuilderLegacyRegistrySourcePort`
- `ScreenBuilderMenuBindingPolicyPort`
- `ScreenBuilderArtifactNamingPolicyPort`
- `ScreenBuilderRuntimeComparePolicyPort`
- `ScreenBuilderRequestContextPolicyPort`

Still recommended next:

- move adapter-side DTO and mapper types into thinner adapter-only mapping surfaces
- move any remaining file-backed compatibility import or scan logic out of core service bodies
- reduce remaining Carbonet-specific API route exposure and controller placement assumptions

## Migration Phases

### Phase 1: Logical Split In One Repository

Keep one repository and one executable app, but enforce ownership by package.

Required state:

- core logic under `platform/screenbuilder`
- project-specific adapter code under `platform/screenbuilder/support/impl` or project module paths
- runtime admin controller remains thin
- module blueprint files exist under `modules/` and `apps/` for the next cutover step

### Phase 2: Publishable Backend Core Jar

Introduce a multi-module Maven build:

- root parent `pom`
- `screenbuilder-core`
- `screenbuilder-carbonet-adapter`
- `carbonet-app`

Required rule:

- `screenbuilder-core` must build and test without importing `feature/admin/*`

### Phase 3: Frontend Shared Package

Split builder frontend into:

- shared builder package
- project adapter package

Required rule:

- project-specific routes and API URLs live outside shared builder widgets

## Recommended Maven End State

```xml
<modules>
  <module>modules/screenbuilder-core</module>
  <module>modules/screenbuilder-carbonet-adapter</module>
  <module>apps/carbonet-app</module>
</modules>
```

Suggested dependency direction:

- `carbonet-app` -> `screenbuilder-carbonet-adapter`
- `screenbuilder-carbonet-adapter` -> `screenbuilder-core`
- `screenbuilder-core` -> no Carbonet runtime module

## Thin Project Bootstrap Rule

To install into a new project quickly, the project should only need to provide:

- menu adapter
- route and runtime binding adapter
- authority adapter
- DB and storage configuration
- branding and theme overlays

If a new project needs to copy or edit builder internals, the core boundary is still wrong.

## Page Unit Rule

The jar-and-adapter model only works if the runtime consumes governed page units rather than ad hoc route implementations.

Each page intended for builder delivery should carry:

- `pageId`
- `menuCode`
- route binding
- manifest binding
- authority scope
- bootstrap/query/mutation contracts
- install scope
- project binding inputs

If those move separately, adapter boundaries become unstable and project bootstrap drifts back toward source-copy behavior.

## Immediate Next Steps In This Repository

1. Hide `ObservabilityMapper` behind a `ScreenBuilderComponentRegistryPort`.
2. Hide `FrameworkAuthorityContractService` behind a builder authority port.
3. Hide `ResonanceControlPlaneService` behind a builder runtime-compare port.
4. Keep `AdminScreenBuilderController` as a thin Carbonet adapter entry only.
5. Keep `MenuInfoDTO` usage confined to adapter-only mapping.

## Success Definition

The split is good enough when:

- a new project imports backend builder core as a `jar`
- project-specific menu and runtime logic is supplied only through adapters
- frontend builder UI is consumed as a shared package or bundle
- upgrading the builder mostly means changing version numbers, not copying code

## Bootstrap Template

The repository now also includes a first project-bootstrap template:

- `docs/architecture/screenbuilder-project-bootstrap-template.md`
- `templates/screenbuilder-project-bootstrap/pom-screenbuilder-dependencies.xml`
- `templates/screenbuilder-project-bootstrap/application-screenbuilder.properties`
- `templates/screenbuilder-project-bootstrap/PROJECT-ADAPTER-CHECKLIST.md`
- `templates/screenbuilder-project-bootstrap/manifests/*.json`
- `templates/screenbuilder-project-bootstrap/validate-screenbuilder-bootstrap.sh`

This template is the starting point for the next phase: turning the current Carbonet split into a repeatable "attach builder jars + add thin project adapter" install flow.

The broader upgrade path from "builder split" to "installable builder plus theme/API product" is tracked in:

- `docs/architecture/installable-builder-upgrade-roadmap.md`
