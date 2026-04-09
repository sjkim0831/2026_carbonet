# Screen Builder Multimodule Cutover Plan

## Goal

Move from the current single-module Carbonet build into a staged layout that supports:

- `screenbuilder-core`
- `screenbuilder-runtime-common-adapter`
- `screenbuilder-carbonet-adapter`
- `carbonet-app`

without breaking the current runtime during transition.

This document is the implementation companion to:

- `docs/architecture/screenbuilder-core-jar-adapter-plan.md`
- `docs/architecture/screenbuilder-project-bootstrap-template.md`
- `docs/architecture/carbonet-resonance-separation-status.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md`

For live continuation after the closed structure-governance family, use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for
`BUILDER_RESOURCE_OWNERSHIP_CLOSURE`.
If continuation state changes blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn.

## Current Wave Closure Scope

For the 2026-04-09 structure-governance wave, treat this document as the builder-family implementation inventory, not the wave-close decision by itself.

Wave-close authority for this family now lives in:

- `docs/architecture/builder-structure-wave-20260409-closure.md`

That means:

- this document tracks the cutover and remaining blockers
- the closure doc decides which family is considered closed today
- this document should not be read as claiming repository-wide builder completion on its own

If the question has shifted from structure-governance to remaining builder-owned resources, continue from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Again, treat those two docs as the single live entry pair before opening row-specific review material.

## Current Constraint

The repository root `pom.xml` is already an aggregator parent and the reactor is live.

Current transition constraint:

- `apps/carbonet-app` still compiles most runtime code from the legacy root `src/main/java`
- `screenbuilder-core` is the live ownership path for builder core classes
- adapter and app modules still rely on the shared root tree for broader non-builder runtime closure during cutover
- `screenbuilder-carbonet-adapter` is now a live compile and package module with its own classes and builder-owned resources

Current transition reason:

- adapter-local source interfaces now cover menu, command-page, authority, runtime-compare, metadata, observability, API-response, and audit entrypoints
- `apps/carbonet-app` still compiles directly from the legacy root source tree, but it has now started excluding builder-owned root paths that are supplied by dedicated modules
- `apps/carbonet-app` now also excludes builder-owned root resources that are supplied by dedicated modules, so future root reintroduction does not silently leak into the executable jar
- MyBatis mapper/resource ownership is only partially moved, so the adapter still assumes shared root runtime wiring for part of the flow

## Recommended Cutover Shape

Target file layout:

```text
pom.xml                             # parent aggregator
modules/screenbuilder-core/pom.xml
modules/screenbuilder-runtime-common-adapter/pom.xml
modules/screenbuilder-carbonet-adapter/pom.xml
apps/carbonet-app/pom.xml
```

Target dependency direction:

- `apps/carbonet-app` -> `modules/screenbuilder-carbonet-adapter`
- `modules/screenbuilder-carbonet-adapter` -> `modules/screenbuilder-runtime-common-adapter`
- `modules/screenbuilder-runtime-common-adapter` -> `modules/screenbuilder-core`
- `modules/screenbuilder-core` -> no `feature/admin/*`

## Package Ownership Map

### Module: `screenbuilder-core`

Move here first:

- `src/main/java/egovframework/com/platform/screenbuilder/model/*`
- `src/main/java/egovframework/com/platform/screenbuilder/service/*`
- `src/main/java/egovframework/com/platform/screenbuilder/service/impl/ScreenBuilderDraftServiceImpl.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/*`
- `src/main/java/egovframework/com/platform/screenbuilder/support/model/*`
- `src/main/java/egovframework/com/framework/builder/model/*`
- `src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderCompatibilityService.java`
- `src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderContractService.java`
- `src/main/java/egovframework/com/framework/builder/support/*`
- `src/main/java/egovframework/com/framework/builder/support/FrameworkBuilderCompatibilityRecordMapper.java`
- `src/main/java/egovframework/com/framework/builder/support/impl/FileFrameworkBuilderCompatibilityRecordStorageAdapter.java`

Keep out of core:

- `feature/admin/*`
- Carbonet DTO imports
- Carbonet menu table semantics
- runtime-specific controller placement

### Module: `screenbuilder-runtime-common-adapter`

Move or keep here:

- property-backed menu binding policy
- property-backed artifact naming policy
- property-backed runtime compare policy
- property-backed request-context policy
- runtime-common configuration properties and Spring configuration

Keep out of this module:

- project menu catalog reads
- project authority reads
- project runtime compare bridges
- project controller placement

### Module: `screenbuilder-carbonet-adapter`

Move or keep here:

- `src/main/java/egovframework/com/feature/admin/screenbuilder/support/impl/Carbonet*Adapter.java`
- `src/main/java/egovframework/com/feature/admin/screenbuilder/web/ScreenBuilderApiController.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/web/FrameworkBuilderContractController.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/web/FrameworkBuilderCompatibilityController.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/mapper/FrameworkBuilderCompatibilityMapper.java`
- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/FrameworkBuilderCompatibilityMapper.xml`
- `src/main/java/egovframework/com/feature/admin/framework/builder/support/impl/CarbonetFrameworkBuilderCompatibilityPersistenceAdapter.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/support/impl/CarbonetFrameworkBuilderMetadataAdapter.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/support/impl/CarbonetFrameworkBuilderObservabilityAdapter.java`
- `src/main/java/egovframework/com/feature/admin/framework/builder/support/impl/CarbonetFrameworkBuilderRequestContextAdapter.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminScreenBuilderController.java`
- compatibility wrappers under `feature/admin/model/ScreenBuilder*`
- any Carbonet menu, authority, runtime compare, request-context, and route policy adapters that cannot use the runtime-common defaults

### Module: `carbonet-app`

Keep here:

- `egovframework.com.CarbonetApplication`
- runtime boot configuration
- existing Spring Boot executable assembly
- application resource wiring
- current non-builder Carbonet features

## Phase Plan

### Phase 1

Scaffold module directories and blueprint poms without changing the root build.

Success state:

- module paths exist
- move inventory is explicit
- current root build remains green

### Phase 2

Turn root `pom.xml` into an aggregator `pom`.

Success state:

- root packaging becomes `pom`
- child modules build in reactor
- existing executable assembly moves to `apps/carbonet-app`

Current progress:

- completed
- root reactor builds through `apps/carbonet-app`

### Phase 3

Move `platform/screenbuilder` and `framework/builder` core-owned classes into `screenbuilder-core`.

Success state:

- `screenbuilder-core` compiles without `feature/admin/*`
- adapter interfaces stay stable

Current progress:

- core-safe model, port, service, and file-adapter source files are now mirrored under `modules/screenbuilder-core/src/main/java`
- `FrameworkBuilderContractService` and `framework/builder/support/*` are also mirrored into `modules/screenbuilder-core`
- `FrameworkBuilderCompatibilityService` now depends on core-owned persistence and record-storage ports instead of the mapper and file path directly, and the mirrored core source reflects that change
- core-referenced shared contract VO paths from `common/trace`, `framework/contract/model`, and `framework/authority/model` are mirrored at the minimum set needed for compilation
- adapter-owned Java sources for `feature/admin/screenbuilder`, `feature/admin/framework/builder`, and `AdminScreenBuilderController` are now mirrored under `modules/screenbuilder-carbonet-adapter/src/main/java`
- adapter-owned MyBatis XML for framework-builder compatibility is now mirrored under `modules/screenbuilder-carbonet-adapter/src/main/resources`
- the first adapter-closure split is applied: menu catalog and command-page adapters now depend on adapter-local sources instead of `MenuInfoService`, `MenuInfoDTO`, and `ScreenCommandCenterService` directly
- the second adapter-closure split is applied: framework-builder metadata and observability adapters now depend on adapter-local sources instead of `FrameworkContractMetadataService` and `ObservabilityMapper` directly
- the third adapter-closure split is applied: authority and runtime-compare adapters now depend on adapter-local sources instead of `FrameworkAuthorityContractService`, `ResonanceControlPlaneService`, and `ParityCompareRequest` directly
- the fourth adapter-closure split is applied: component-registry and API audit flows now depend on adapter-local sources instead of `ObservabilityMapper` and `AuditTrailService` directly
- the fifth adapter-closure split is applied: builder controllers and admin route forwarding now depend on adapter-local sources instead of `FrameworkApiResponseSupport` and `AdminReactRouteSupport` directly
- metadata, observability, API-response, and admin-route bridges now all have dedicated module dependencies instead of app-owned staging
- staged adapter imports are now mostly reduced to infrastructure-level mapper support instead of project business services, DTOs, and shared web helpers
- `carbonet-mapper-infra` remains the only extra module dependency the adapter can safely take today
- `carbonet-web-support` is now also a safe adapter dependency for route forwarding and API-response helpers
- `carbonet-contract-metadata` is now a safe adapter dependency for framework contract metadata loading
- `carbonet-builder-observability` is now a safe adapter dependency for builder-only UI manifest/component registry reads
- `screenbuilder-runtime-common-adapter` now provides reusable property-backed policy ports for new projects
- the adapter module remains live-compiled in the reactor
- the adapter module now also packages its controller, compatibility-wrapper, bridge, and mapper XML assets into a real adapter jar
- no staged builder bridge files remain under `apps/carbonet-app/src/main/java`
- compatibility wrapper classes under `feature/admin/model/ScreenBuilder*` are now also supplied by the live adapter module
- legacy root wrapper copies under `feature/admin/model/ScreenBuilder*` have now been removed
- legacy root adapter/controller copies under `feature/admin/screenbuilder`, `feature/admin/framework/builder`, and `AdminScreenBuilderController` have now been removed
- legacy root core copies under `platform/screenbuilder`, `framework/builder`, and the shared builder VO set have now been removed
- the remaining blocker is now final source-root removal and broader runtime ownership cleanup, not builder bridge relocation
- the repository is still in a staged duplication phase, not final source removal
- staged app-owned builder bridge mirrors are now fully retired
- legacy compatibility wrapper reintroduction is now blocked by `audit-screenbuilder-legacy-root-duplicates.sh`
- legacy adapter/controller reintroduction is now blocked by `audit-screenbuilder-legacy-root-adapter-paths.sh`
- legacy builder resource reintroduction is now blocked by `audit-screenbuilder-legacy-root-resources.sh`
- packaged builder module completeness is now checked by `audit-screenbuilder-module-jars.sh`
- `apps/carbonet-app` now explicitly excludes builder-owned root resources from its legacy root resource import

### Phase 4

Move Carbonet-specific adapters and builder entry controllers into `screenbuilder-carbonet-adapter`.

Success state:

- Carbonet-only dependencies exist only in adapter/app modules
- `screenbuilder-core.jar` is publishable

## Immediate File Candidates

These files are already shaped well for the split:

- `src/main/java/egovframework/com/platform/screenbuilder/support/ScreenBuilderMenuCatalogPort.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/ScreenBuilderMenuBindingPolicyPort.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/ScreenBuilderArtifactNamingPolicyPort.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/ScreenBuilderRuntimeComparePolicyPort.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/ScreenBuilderRequestContextPolicyPort.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/impl/FileScreenBuilderDraftStorageAdapter.java`
- `src/main/java/egovframework/com/platform/screenbuilder/support/impl/FileScreenBuilderLegacyRegistrySourceAdapter.java`

## Remaining Blockers Before Actual Move

- legacy root sources are still the dominant compile source for `apps/carbonet-app`
- adapter-module-scoped MyBatis XML has started moving out of shared resources, but resource ownership cutover is still partial
- root builder bridge implementations still remain in the legacy source tree, but live ownership has moved to adapter/support modules

## Adapter Closure Checklist

The adapter is live-compiled and packaged. Final adapter/app cutover still requires the items below.

- `CarbonetFrameworkBuilderMetadataSource`, `CarbonetFrameworkBuilderObservabilitySource`, and `CarbonetFrameworkApiResponseSource` are backed by adapter-owned bridge/wiring or moved into a module that the adapter can depend on without reaching back into the root tree
- `CarbonetAdminRouteSource` is backed by adapter-owned bridge wiring through `carbonet-web-support`
- screen-builder adapter sources that already use `CarbonetScreenBuilderMenuSource`, `CarbonetScreenBuilderCommandPageSource`, `CarbonetScreenBuilderAuthoritySource`, `CarbonetScreenBuilderComponentRegistrySource`, `CarbonetScreenBuilderRuntimeCompareSource`, and `CarbonetScreenBuilderAuditSource` have matching non-root bean wiring
- `FrameworkBuilderCompatibilityMapper` Java and XML ownership are finalized so the adapter jar no longer depends on shared root resource placement assumptions
- `AdminScreenBuilderController` route forwarding continues to depend only on adapter-local route sources and no longer assumes root-only controller co-location

## Minimum Dependency Ladder

When `screenbuilder-carbonet-adapter` needs extra dependencies, add them only in this order.

1. Keep `screenbuilder-core` as the only mandatory functional dependency.
2. Prefer `screenbuilder-runtime-common-adapter` before adding project-specific policy code.
2. Keep `carbonet-mapper-infra` only for shared mapper base support that cannot yet move into the adapter.
3. Reuse `carbonet-web-support` for `FrameworkApiResponseSupport` and `AdminReactRouteSupport`.
4. Reuse `carbonet-contract-metadata` for `FrameworkContractMetadataService` and the framework contract metadata JSON resource.
5. Reuse `carbonet-builder-observability` for builder-only UI manifest/component registry queries.

Avoid these dependency shortcuts:

- do not point `screenbuilder-carbonet-adapter` at `apps/carbonet-app`
- do not restore broad root-source compilation as a substitute for missing module dependencies
- do not move `feature/admin/*` runtime helpers into `screenbuilder-core` just to satisfy adapter compilation

## Boundary Audit

Before each real package move, run:

```bash
bash ops/scripts/audit-screenbuilder-module-boundary.sh
bash ops/scripts/audit-screenbuilder-app-bridge-staging.sh
bash ops/scripts/audit-screenbuilder-legacy-root-duplicates.sh
bash ops/scripts/audit-screenbuilder-legacy-root-adapter-paths.sh
bash ops/scripts/audit-screenbuilder-legacy-root-core-paths.sh
bash ops/scripts/audit-screenbuilder-legacy-root-resources.sh
```

The cutover should not proceed if core-candidate paths still import `feature/admin/*`.

## Success Definition

The cutover is complete when:

- `screenbuilder-core` builds as a standalone jar
- Carbonet-specific adapters build separately
- `carbonet-app` assembles the executable runtime
- a new project can consume the builder by depending on the core jar and supplying only project adapters
