# Screen Builder Module Source Inventory

## Purpose

Track the exact source ownership split for the planned Maven module cutover:

- `modules/screenbuilder-core`
- `modules/screenbuilder-runtime-common-adapter`
- `modules/screenbuilder-carbonet-adapter`
- `apps/carbonet-app`

Use this file together with:

- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`
- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/builder-resource-ownership-closure-plan.md`
- `ops/scripts/audit-screenbuilder-module-boundary.sh`

For the live continuation queue after builder structure-governance closure, use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for
`BUILDER_RESOURCE_OWNERSHIP_CLOSURE`.

## Core Candidates

These paths are now live-owned by `screenbuilder-core`.

### Platform Screen Builder

- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/model`
- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/service`
- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/service/impl/ScreenBuilderDraftServiceImpl.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/support`
- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/support/impl`
- `modules/screenbuilder-core/src/main/java/egovframework/com/platform/screenbuilder/support/model`

### Framework Builder Shared Contracts

- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/model`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderCompatibilityService.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderContractService.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/support`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/support/FrameworkBuilderCompatibilityRecordMapper.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/builder/support/impl/FileFrameworkBuilderCompatibilityRecordStorageAdapter.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/contract/model`
- `modules/screenbuilder-core/src/main/java/egovframework/com/framework/authority/model/FrameworkAuthorityRoleContractVO.java`
- `modules/screenbuilder-core/src/main/java/egovframework/com/common/trace`

## Runtime Common Adapter Candidates

These paths are reusable across many projects and belong in `screenbuilder-runtime-common-adapter`.

- `modules/screenbuilder-runtime-common-adapter/src/main/java/egovframework/com/platform/screenbuilder/runtime/common/ScreenBuilderRuntimeCommonProperties.java`
- `modules/screenbuilder-runtime-common-adapter/src/main/java/egovframework/com/platform/screenbuilder/runtime/common/PropertyBackedScreenBuilderPolicyAdapter.java`
- `modules/screenbuilder-runtime-common-adapter/src/main/java/egovframework/com/platform/screenbuilder/runtime/common/ScreenBuilderRuntimeCommonAdapterConfiguration.java`

Current role:

- provide default property-backed implementations for:
  - `ScreenBuilderMenuBindingPolicyPort`
  - `ScreenBuilderArtifactNamingPolicyPort`
  - `ScreenBuilderRuntimeComparePolicyPort`
  - `ScreenBuilderRequestContextPolicyPort`
- reduce what a new project must reimplement before first boot
- keep project-specific policy overrides optional instead of mandatory

## Adapter Candidates

These paths are Carbonet-specific and belong in `screenbuilder-carbonet-adapter`.

Current build rule:

- staged adapter Java under `modules/screenbuilder-carbonet-adapter/src/main/java` is now live compile input
- the module build now compiles against `screenbuilder-core` and `carbonet-mapper-infra`
- the staged source set already contains adapter-local boundary interfaces for metadata, observability, API response, menu, authority, command-page, component-registry, runtime-compare, and audit flows
- final source removal is still blocked by bridge implementations that depend on shared runtime services and by partial resource ownership, not by raw direct imports inside the adapter implementations

- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/FrameworkBuilderCompatibilityMapper.xml`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/model/ScreenBuilder*.java`

Mirrored into module staging path:

- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/impl`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/web/ScreenBuilderApiController.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/mapper/FrameworkBuilderCompatibilityMapper.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/support/impl`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/web`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/model`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/web/AdminScreenBuilderController.java`
- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/FrameworkBuilderCompatibilityMapper.xml`

Adapter-local boundary interfaces already staged:

- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/support/CarbonetFrameworkApiResponseSource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/support/CarbonetFrameworkBuilderMetadataSource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/framework/builder/support/CarbonetFrameworkBuilderObservabilitySource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderAuditSource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderAuthoritySource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderCommandPageSource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderComponentRegistrySource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderMenuSource.java`
- `modules/screenbuilder-carbonet-adapter/src/main/java/egovframework/com/feature/admin/screenbuilder/support/CarbonetScreenBuilderRuntimeCompareSource.java`

Adapter-owned bridge implementations now live only under module/support paths.

Current remaining cutover gaps:

- builder runtime bridge wiring now relies on dedicated support modules:
- `modules/carbonet-builder-observability`
- web-support ownership is now extracted into:
- `modules/carbonet-web-support/src/main/java/egovframework/com/framework/web/FrameworkApiResponseSupport.java`
- `modules/carbonet-web-support/src/main/java/egovframework/com/feature/admin/web/AdminReactRouteSupport.java`
- contract-metadata ownership is now extracted into:
- `modules/carbonet-contract-metadata/src/main/java/egovframework/com/framework/contract/service/FrameworkContractMetadataService.java`
- `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json`
- the adapter-safe module dependencies already available for this path are:
- `modules/carbonet-mapper-infra`
- `modules/carbonet-web-support`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- adapter MyBatis/resource ownership is still partial:
- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/FrameworkBuilderCompatibilityMapper.xml`
- `apps/carbonet-app` still compiles the broader non-builder runtime from the legacy root tree
- `apps/carbonet-app` has only started excluding builder-owned root source paths; source removal from the legacy tree is not started yet

## App Candidates

These paths stay in `carbonet-app`.

- `src/main/java/egovframework/com/CarbonetApplication.java`
- current Spring Boot configuration and runtime assembly
- all non-builder Carbonet runtime features
- no staged builder bridge files remain under `apps/carbonet-app/src/main/java`

## Core Boundary Rules

`screenbuilder-core` must not import:

- `egovframework.com.feature.admin.*`
- `egovframework.com.feature.home.*`
- Carbonet-specific DTO classes
- Carbonet-specific controllers
- Carbonet-specific menu service semantics

`screenbuilder-core` may import:

- Spring stereotypes and framework contracts
- Jackson
- shared builder models
- shared builder ports

## Current Known Exceptions

These still need real cutover work even though live module ownership is now established for the builder core and adapter jars.

- source removal from the legacy root tree is partially completed for builder core and adapter paths
- `apps/carbonet-app` still compiles the broader non-builder runtime from the legacy root source/resource layout
- legacy compatibility wrappers under `src/main/java/egovframework/com/feature/admin/model` have now been removed from the root tree
- `ops/scripts/audit-screenbuilder-legacy-root-duplicates.sh` now fails if any legacy root wrapper is reintroduced
- legacy root adapter/controller paths under `feature/admin/screenbuilder`, `feature/admin/framework/builder`, and `AdminScreenBuilderController` have now been removed
- `ops/scripts/audit-screenbuilder-legacy-root-adapter-paths.sh` now fails if any removed legacy adapter path is reintroduced
- legacy root core paths under `platform/screenbuilder`, `framework/builder`, and the shared builder VO set have now been removed
- `ops/scripts/audit-screenbuilder-legacy-root-core-paths.sh` now fails if any removed legacy core path is reintroduced
- builder-owned resource paths now live under module resources, and `ops/scripts/audit-screenbuilder-legacy-root-resources.sh` fails if removed legacy builder resources are reintroduced at the root
- `ops/scripts/audit-screenbuilder-module-jars.sh` now fails if the packaged module jars are missing core builder classes or builder-owned resources
- `apps/carbonet-app` explicitly excludes builder-owned root resources so the executable app jar must consume them from the dedicated builder modules instead of the legacy root resource tree

These exceptions are the primary handoff input for:

- `docs/architecture/builder-resource-ownership-closure-plan.md`

The active continuation entry for those exceptions is:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair before opening row-specific review cards.

## Verification Command

Use:

```bash
bash ops/scripts/audit-screenbuilder-module-boundary.sh
bash ops/scripts/audit-screenbuilder-app-bridge-staging.sh
bash ops/scripts/audit-screenbuilder-legacy-root-duplicates.sh
bash ops/scripts/audit-screenbuilder-legacy-root-adapter-paths.sh
bash ops/scripts/audit-screenbuilder-legacy-root-core-paths.sh
bash ops/scripts/audit-screenbuilder-legacy-root-resources.sh
```

The audit should fail if core-candidate paths import `feature/admin/*`.
It should also fail if `framework/builder` directly imports `ObservabilityMapper`, `FrameworkContractMetadataService`, or `FrameworkBuilderCompatibilityMapper`.
