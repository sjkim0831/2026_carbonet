# Carbonet Resonance Separation Status

Generated on 2026-04-08 for the current Carbonet and Resonance separation review.

## Goal

Record how far the repository has progressed in separating:

- `Carbonet Runtime`
- `Resonance Control Plane`
- shared platform-common layers
- project-owned runtime layers

This document is the current-state companion to:

- `docs/architecture/carbonet-resonance-boundary-classification.md`
- `docs/architecture/common-db-and-project-db-splitting.md`
- `docs/architecture/api-prefix-boundary-plan.md`
- `docs/architecture/screenbuilder-core-jar-adapter-plan.md`
- `docs/architecture/system-builder-project-domain-install-target.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md`

## Current Wave Freeze

For the current structure-governance owner wave, the only family explicitly counted as closed is:

- `BUILDER_STRUCTURE_GOVERNANCE`

For the current app-closure owner wave, the following family is also explicitly counted as closed:

- `APP_ASSEMBLY_BUILD_RUNTIME_CLOSURE`

That closure means:

- builder source-of-truth paths are frozen
- old-path shim versus delete criteria are frozen
- `large-move-completion-contract.md` is interpreted as a family-scoped close for this wave

That closure does not mean:

- every remaining builder compatibility shim is already removed
- broader control-plane composition split is done
- repository-wide separation is done

Builder resource-ownership continuation note:

- after `BUILDER_STRUCTURE_GOVERNANCE` is accepted as closed, continue builder ownership work from:
  - `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
  - `docs/architecture/builder-resource-ownership-queue-map.md`
- treat those two docs as the single live entry pair for `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

App-closure continuation note:

- local canonical app assembly now uses `apps/carbonet-app`
- canonical packaged jar is now `apps/carbonet-app/target/carbonet.jar`
- closure and runtime proof now run through:
  - `ops/scripts/verify-app-closure-all.sh`
  - `ops/scripts/codex-verify-18000-freshness.sh`
- route and shell runtime proof for the recovered React route registry now covers:
  - admin and public route responses
  - packaged jar versus runtime jar hash equality
  - packaged jar versus runtime jar React manifest and shell index equality
  - live `/assets/react/...` static asset responses from `:18000`

## Current Summary

The separation has passed the pure-idea stage.

The repository already contains:

- documented boundary rules
- documented common DB versus project DB rules
- a first `platform/*` backend package split
- first control-plane APIs and DB draft families
- first frontend `platform/*` support layers

However, the separation is not complete.

The main remaining issue is that many runtime entry and bootstrap points still live under `feature/admin` while directly depending on `platform/*` services.

That means the codebase currently has:

- `logical boundary definition`
  - mostly done
- `first package split`
  - partly done
- `control-plane implementation`
  - partly done
- `runtime and control-plane composition split`
  - not done yet
- `app assembly, package, runtime, and asset freshness closure`
  - done for the current owner wave

## Status By Area

### 1. Boundary Definition

Status: `DONE`

Completed:

- Carbonet-runtime versus Resonance-control-plane classification rules exist
- mixed and pending targets are explicitly listed
- migration priority order is defined

Reference:

- `docs/architecture/carbonet-resonance-boundary-classification.md`

### 2. Common Versus Project Data Split

Status: `DONE`

Completed:

- `COMMON_DB` versus `PROJECT_DB` rule is defined
- governed JSON and governed file storage lanes are defined
- menu governance and runtime delivery split is defined
- common-versus-project row classification rule is defined

Reference:

- `docs/architecture/common-db-and-project-db-splitting.md`

### 3. Resonance Control-Plane Backend Package Split

Status: `PARTIAL`

Completed:

- dedicated `egovframework.com.platform` package family exists
- control-plane service interfaces and controllers exist
- observability, codex, workbench, and runtime-control families exist under `platform`
- screen-builder service, API, and model types now have a `platform/screenbuilder` ownership line
- first screen-builder adapter ports exist for menu catalog and screen-command page lookup
- screen-builder component registry, authority contract, and runtime-compare access now flow through platform ports instead of direct project-service imports
- draft/history/status-summary storage and legacy component-registry file import now flow through platform ports instead of direct file access in the core service
- menu catalog roots and page-id derivation rules now flow through a platform menu-binding policy port instead of hard-coded `AMENU1` and `/admin/...` assumptions in the core service
- menu descriptor defaults such as `menuScope` and `runtimeClass` now also flow through the same menu-binding policy instead of hard-coded `PROJECT_RUNTIME` and `ADMIN` values in the adapter
- release-unit naming and runtime artifact evidence naming now flow through a platform artifact-naming policy port instead of hard-coded `carbonet-*` and `screen-builder-runtime-*` rules in core service/controller code
- default builder-id generation now also flows through the platform artifact-naming policy port instead of a hard-coded `builder-*` rule in the core service
- runtime-compare requester metadata now flows through a platform runtime-compare policy port instead of hard-coded `screen-builder-status-summary` and `SCREEN_BUILDER_QUEUE` labels in the core service
- runtime-compare project context and baseline selection now also flow through the same policy port instead of hard-coded `carbonet-main` and `CURRENT_RUNTIME` values in the core service
- runtime-compare guided state, template line, owner lane, and admin/public screen-family classification now also flow through the same policy port instead of hard-coded `ADMIN_*` and `PUBLIC_*` rules in the core service
- runtime-compare surface detection and selected-screen resolution now also flow through the same policy port instead of direct `/admin` path checks and `pageId/menuCode` fallback logic in the core service
- request locale detection now flows through a platform request-context policy port instead of direct `/en/admin` and `/en/api` path checks in the API controller
- framework-builder compatibility checks now flow through persistence and record-storage ports instead of direct mapper and file-path access in the core service
- framework-builder compatibility MyBatis XML has started moving from shared root resources into adapter-module resources
- screen-builder and framework-builder Carbonet adapter Java sources have started mirroring into the dedicated adapter module tree for later source-root cutover
- menu-catalog and command-page adapter closure has started shrinking through adapter-local source interfaces instead of direct dependency on admin menu and screen-command services
- framework-builder metadata and observability adapter closure has started shrinking through adapter-local source interfaces instead of direct dependency on metadata service and observability mapper
- authority and runtime-compare adapter closure has started shrinking through adapter-local source interfaces instead of direct dependency on authority service and runtime-control compare service
- component-registry and screen-builder audit closure has started shrinking through adapter-local source interfaces instead of direct dependency on observability mapper and audit trail service
- builder controller response handling and admin route forwarding closure has started shrinking through adapter-local source interfaces instead of direct dependency on shared web helpers
- staged adapter closure is now mostly reduced to infrastructure-level mapper support instead of project business services, DTOs, and shared web helpers
- `carbonet-mapper-infra`, `screenbuilder-core`, and `screenbuilder-carbonet-adapter` now build together in the live reactor
- `apps/carbonet-app` has started excluding builder-owned root source paths so screen-builder and framework-builder classes can be supplied by dedicated modules instead of duplicate root compilation
- API-response and admin-route forwarding bridges are now supplied by the live adapter module through `carbonet-web-support`
- metadata bridge is now supplied by the live adapter module through `carbonet-contract-metadata`
- observability bridge is now supplied by the live adapter module through `carbonet-builder-observability`
- screen-builder legacy compatibility wrappers are now also supplied by the live adapter module
- `feature/admin` menu and command-page bridges now implement adapter `Source` interfaces while `screenbuilder-carbonet-adapter` supplies the public `ScreenBuilder*Port` beans
- `UiManifestRegistryService` is now consumed through `UiManifestRegistryPort`, so screen-command/help/admin code no longer depends on the concrete builder-observability service class directly
- platform observability backup action contracts now use platform-owned request DTOs, with legacy admin DTO conversion isolated in the delegate bridge
- `feature/admin` observability composition now consumes `PlatformObservabilityAdminPagePort` instead of the concrete `PlatformObservabilityAdminPageFacade` in the remaining admin entry points that still assemble control-plane payloads
- `feature/admin` help compatibility controllers now consume `PlatformHelpManagementPort` instead of directly depending on the platform help web controller type
- `feature/admin` self-healing and safe-plan workbench entry points now consume `SrTicketWorkbenchPort` instead of directly depending on the workbench service type
- `screenbuilder-core`, `screenbuilder-carbonet-adapter`, `carbonet-contract-metadata`, and `carbonet-builder-observability` now package real builder classes/resources into dedicated jars
- root `feature/admin/model/ScreenBuilder*` compatibility wrappers have now been removed
- root `feature/admin/screenbuilder`, `feature/admin/framework/builder`, and `AdminScreenBuilderController` copies have now been removed
- root `platform/screenbuilder`, `framework/builder`, and shared builder VO copies have now been removed
- builder-owned metadata/compatibility/observability resources are now supplied by module resources instead of root resource paths
- `apps/carbonet-app` now explicitly excludes builder-owned root resources so those assets must come from dedicated builder modules during packaging
- no staged builder bridge files remain under `apps/carbonet-app/src/main/java`
- first project-bootstrap template files now exist under `templates/screenbuilder-project-bootstrap`

Current package examples:

- `src/main/java/egovframework/com/platform/runtimecontrol`
- `src/main/java/egovframework/com/platform/observability`
- `src/main/java/egovframework/com/platform/codex`
- `src/main/java/egovframework/com/platform/workbench`
- `modules/platform-runtime-control/pom.xml`

Not completed:

- admin composition still owns many control-plane entry points
- screen-builder legacy compatibility wrappers still live under `feature/admin`
- controller and page-service boundaries are still assembled from `feature/admin`
- one `feature/admin` authority payload support path still depends on the `ObservabilityQueryService` interface for audit lookup
- screen-command metadata strings still contain a small number of legacy concrete names where the underlying runtime wiring has not been port-lifted yet

Builder-family interpretation note:

- builder module lane ownership is frozen enough for structure-governance close
- backend package and composition closure remains partial
- do not treat this section alone as evidence that the whole builder cutover is done
- builder resource-ownership row progress should be read from the current closeout and queue map, not inferred from this status page alone

### 4. Resonance Control-Plane DB Draft

Status: `PARTIAL`

Completed:

- first `RSN_*` table family exists as `COMMON_DB` draft
- module-selection, parity-compare, repair, and verification records are modeled
- current reviewed runtime-control implementation persists through file-backed JSONL stores under `platform/runtimecontrol`
- legacy duplicate module-local `ResonanceControlPlane*` sources under `modules/platform-runtime-control/src` have been removed so the reactor points at one runtime-control source line
- `modules/platform-runtime-control` now compiles and tests against `RuntimeControlPlane*` sources, and `mvn -q -pl apps/carbonet-app -am clean compile -DskipTests` passes with that module line

Completed draft families:

- `RSN_MODULE_BINDING_PREVIEW`
- `RSN_PARITY_COMPARE_RUN`
- `RSN_MODULE_BINDING_RESULT`
- `RSN_REPAIR_SESSION`
- `RSN_REPAIR_APPLY_RUN`
- `RSN_VERIFICATION_RUN`

Not completed:

- no evidence in this review that the whole `RSN_*` draft family is fully promoted as the only runtime truth
- the reviewed service path still writes JSONL stores as the active persistence path
- no runtime-control mapper XML currently exists under `src/main/resources/egovframework/mapper/com/platform/runtimecontrol`

### 5. Frontend Platform Layer

Status: `PARTIAL`

Completed:

- frontend `platform/telemetry` exists
- frontend `platform/screen-registry` exists
- control-plane API wrapper exists
- app shell already consumes platform telemetry and manifest loading

Completed examples:

- `frontend/src/platform/telemetry`
- `frontend/src/platform/screen-registry`
- `frontend/src/lib/api/resonanceControlPlane.ts`

Not completed:

- one route registry still mixes Carbonet runtime pages and platform pages
- platform pages still live inside the same runtime application shell
- project ID is still hard-coded in several control-plane-facing frontend flows

### 6. Runtime Versus Control-Plane Composition

Status: `NOT_DONE`

The largest unresolved boundary is composition ownership.

Today:

- `feature/admin` still boots or routes several control-plane features
- platform services are invoked directly from Carbonet admin classes
- menu bootstrap for control-plane screens still occurs from runtime-admin package families

This is the main reason the split should still be treated as in progress.

### 7. App Assembly And Runtime Closure

Status: `DONE`

Completed:

- canonical app assembly is now `apps/carbonet-app`
- canonical packaged jar is now `apps/carbonet-app/target/carbonet.jar`
- owner scripts under `ops/scripts/**` now point at the canonical app jar and canonical package line
- closure verification now runs through `verify-app-closure-all.sh`
- runtime freshness proof now runs through `codex-verify-18000-freshness.sh`
- fresh build line for the React route-registry recovery is restored
- `:18000` runtime proof now includes route response checks for:
  - `/admin/system/version`
  - `/admin/system/environment-management`
  - `/admin/system/screen-builder`
  - `/admin/system/current-runtime-compare`
  - `/home`
  - `/signin/loginView`
  - `/admin/login/loginView`
  - `/join/companyJoinStatusSearch`
  - and their `en` variants
- packaged jar and runtime jar hashes now match for the current app line
- packaged jar and runtime jar now carry the same React manifest and shell `index.html`
- shell-linked assets under `/assets/react/assets/...` now respond on `:18000`

Not completed:

- this closure does not by itself finish control-plane composition separation
- this closure does not imply repository-wide frontend cleanup beyond the route-registry recovery slice

## Already Separated

These areas are meaningfully separated already.

### Backend

- `egovframework.com.platform.runtimecontrol.*`
- `egovframework.com.platform.observability.*`
- `egovframework.com.platform.codex.*`
- `egovframework.com.platform.workbench.*`
- `egovframework.com.platform.screenbuilder.*`

### Frontend

- `frontend/src/platform/telemetry/*`
- `frontend/src/platform/screen-registry/*`
- `frontend/src/lib/api/resonanceControlPlane.ts`
- `frontend/src/platform/observability/observability.ts`

### Contracts And Draft Data

- `docs/sql/20260321_resonance_repair_module_selection_schema.sql`
- `docs/sql/20260321_resonance_repair_module_selection_migration.sql`
- `src/main/java/egovframework/com/platform/runtimecontrol/service/impl/RuntimeControlPlaneServiceImpl.java`

## Still Mixed

These areas are still mixed and should not be described as fully separated.

### 1. Observability Legacy Services Still Touch Runtime Admin

Examples:

- `src/main/java/egovframework/com/feature/admin/web/AdminAuthorityPagePayloadSupport.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMainController.java`

Reason:

- platform web ownership now covers page forward, page-data, and action endpoints
- but legacy page assembly and some supporting payload services still remain in runtime-admin packages
- control-plane observability exists as a platform service
- so service ownership is thinner, not fully erased

### 2. Screen Builder Legacy Compatibility Still Leaks Through Runtime Admin

Example:

- `src/main/java/egovframework/com/feature/admin/model/ScreenBuilderDraftDocumentVO.java`
- `src/main/java/egovframework/com/feature/admin/model/ScreenBuilderSaveRequestVO.java`

Reason:

- the concrete service, platform API, and builder model types now live under `platform/screenbuilder`
- the remaining runtime-admin leak is now mostly historical compatibility references in separation review notes, not an active service contract
- that means the runtime-admin boundary is thinner now, but not fully removed

### 3. Control-Plane Persistence Truth Is Still Transitional

Examples:

- `src/main/java/egovframework/com/platform/runtimecontrol/service/impl/RuntimeControlPlaneServiceImpl.java`
- `docs/sql/20260321_resonance_repair_module_selection_schema.sql`

Reason:

- control-plane runtime-control persistence exists
- but the reviewed implementation currently uses JSONL stores while DB draft families remain documented separately
- this keeps the persistence family operationally transitional even though controller ownership already moved

### 4. One Frontend Route Registry Still Owns Both Runtime And Platform Pages

Example:

- `frontend/src/app/routes/pageRegistry.tsx`

Reason:

- Carbonet runtime pages and Resonance-like control-plane pages share the same route registry and shell entry
- this is acceptable for a transitional phase
- it is not a final separation state

## Separation Completion Criteria

Treat the separation as functionally complete only when all of the following are true.

### Backend

- control-plane controllers no longer live under `feature/admin` except for explicit compatibility shims
- control-plane page assembly is moved behind platform-owned facade or page modules
- control-plane bootstrap is no longer triggered from Carbonet runtime-admin boot classes
- control-plane persistence assets have one clear primary truth path, with DB draft and runtime implementation no longer diverging

### Frontend

- platform page registration is split from project runtime page registration
- platform telemetry and registry helpers remain shared, but project pages do not own platform routing concerns
- project-specific runtime pages can be listed without mixing platform governance pages in the same ownership map

### Data And Delivery

- control-plane records are persisted as the primary governed source of truth
- file fallback is optional diagnostics only, not the practical system of record
- runtime package outputs and project runtime DB concerns are clearly separated from control-plane authoring records

## Recommended Next Separation Order

### Priority 1. Move Control-Plane Composition Out Of `feature/admin`

Start here because this is the current highest-value boundary fix.

Targets:

- menu bootstrap classes that use `CodexProvisioningService`
- observability controllers and page assembly classes
- codex and workbench admin entry composition classes

Expected result:

- runtime admin no longer owns control-plane startup and routing composition

Immediate execution slices under this priority:

- `Priority 1A`
  - move observability entry and page assembly families:
  - keep explicit compatibility shims only where runtime-admin routes must still forward into platform-owned handlers
  - current progress:
    - menu bootstrap assembly now delegates into `platform.codex.service.*BootstrapSupport`
    - runtime-admin menu bootstrap listeners have been removed
    - `PlatformObservabilityPageController`, `PlatformObservabilityPageDataController`, and `PlatformObservabilityActionController` now own observability route, page-data, and action entrypoints
    - `AdminMemberController`, `AdminMainController`, `AdminShellBootstrapPageService`, and `AdminSessionSimulationService` no longer depend on legacy runtime-admin observability page assembly for the current reviewed entry points
    - `security-history` and `login-history` page payloads now execute through `platform.observability.service.PlatformObservabilityHistoryPayloadService`
    - `security-policy` page payload now executes through `platform.observability.service.PlatformObservabilitySecurityPolicyPayloadService`
    - `blocklist` page payload now executes through `platform.observability.service.PlatformObservabilityBlocklistPayloadService`
    - `scheduler` page payload now executes through `platform.observability.service.PlatformObservabilitySchedulerPayloadService`
    - `batch-management` page payload now executes through `platform.observability.service.PlatformObservabilityBatchManagementPayloadService`
    - `external connection list` page payload now executes through `platform.observability.service.PlatformObservabilityExternalConnectionListPayloadService`
    - `external keys` page payload now executes through `platform.observability.service.PlatformObservabilityExternalKeysPayloadService`
    - `external schema` page payload now executes through `platform.observability.service.PlatformObservabilityExternalSchemaPayloadService`
    - `external usage` page payload now executes through `platform.observability.service.PlatformObservabilityExternalUsagePayloadService`
    - `external logs` page payload now executes through `platform.observability.service.PlatformObservabilityExternalLogsPayloadService`
    - `external sync` page payload now executes through `platform.observability.service.PlatformObservabilityExternalSyncPayloadService`
    - `external maintenance` page payload now executes through `platform.observability.service.PlatformObservabilityExternalMaintenancePayloadService`
    - `external retry` page payload now executes through `platform.observability.service.PlatformObservabilityExternalRetryPayloadService`
    - `external webhooks` page payload now executes through `platform.observability.service.PlatformObservabilityExternalWebhooksPayloadService`
    - `external monitoring` page payload now executes through `platform.observability.service.PlatformObservabilityExternalMonitoringPayloadService`
    - `external connection form` and `save` now execute through `platform.observability.service.PlatformObservabilityExternalConnectionFormPayloadService` and `platform.observability.service.PlatformObservabilityExternalConnectionCommandService`
    - `error-log` page payload now executes through `platform.observability.service.PlatformObservabilityErrorLogPayloadService`
    - `security-audit` page payload and CSV export now execute through `platform.observability.service.PlatformObservabilitySecurityAuditPayloadService`
    - `certificate-audit-log` page payload now executes through `platform.observability.service.PlatformObservabilityCertificateAuditPayloadService`
    - `PlatformObservabilityPagePayloadService` no longer depends on legacy runtime-admin observability page assembly for `security-policy`, `scheduler`, `error-log`, `security-audit`, or operations-center summary/priority/widget assembly
    - the legacy compatibility shell `AdminObservabilityPageService` has been removed, leaving `platform.observability` controllers/facades/payload services as the remaining owner for observability page-data and action composition
- `Priority 1B`
  - move codex and workbench admin composition off runtime-admin ownership
  - reduce direct `feature/admin` dependency on `platform.codex` and `platform.workbench`
  - current progress:
    - `CodexProvisionAdminApiController` and `CodexProvisionPageController` are owned by `platform.codex.web`
    - active AI inventory docs now reference the platform codex controller as the action API owner
    - `platform.workbench` controller and service signatures now consume `egovframework.com.platform.request.workbench.*` contracts instead of `feature.admin.dto.request.*`
    - `platform.codex` controller and provisioning/admin execution signatures now consume `egovframework.com.platform.request.codex.CodexProvisionRequest` and `platform.codex.model.CodexProvisionResponse`
    - `platform.codex` history and inspection entrypoints now consume `platform.codex.model.CodexExecutionHistoryResponse`
    - `platform.codex` execution entrypoints and internal history persistence now consume `platform.codex.model.CodexAdminActorContext` and `platform.codex.model.CodexExecutionLog` instead of direct `feature.admin.model.vo` codex types
    - `CodexProvisionAdminApiController` now depends on `platform.codex.service.CodexExecutionAdminPort`, and `feature.admin.service.CodexExecutionAdminService` compatibility contract has been removed so the concrete implementation is owned only by `platform.codex.service.impl.CodexExecutionAdminServiceImpl`
    - `platform.observability` summary contracts now consume `platform.observability.model.EmissionResultFilterSnapshot`, `EmissionResultSummaryView`, `SecurityAuditSnapshot`, and `SecurityAuditAggregate`, with bridge-level conversion from legacy `feature.admin.model.vo.*`
    - unified-log submenu bootstrap ownership is moved from `feature.admin.service.impl.AdminUnifiedLogSubmenuBootstrap` to `platform.codex.service.AdminUnifiedLogSubmenuBootstrapSupport`
    - access-history, error-log, and security-audit menu bootstrap ownership is moved from `feature.admin.service.impl.*MenuBootstrap` to `platform.codex.service.*BootstrapSupport`
    - backup-operations, file-management, and content-menu-management bootstrap ownership is moved from `feature.admin.service.impl.*MenuBootstrap` to `platform.codex.service.*BootstrapSupport`
    - screen-management, emission-survey, and emission-definition-studio bootstrap ownership is moved from `feature.admin.service.impl.*MenuBootstrap` to `platform.codex.service.*BootstrapSupport`
    - remaining emission menu bootstrap ownership is moved from `feature.admin.service.impl.*MenuBootstrap` to `platform.codex.service.*BootstrapSupport` for validation, site-management, gwp-values, data-history, survey-data, and lci-classification
- `Priority 1C`
  - move remaining page-model/bootstrap assembly that still makes runtime admin the apparent owner of control-plane features

### Priority 2. Move Screen Builder Ownership

Targets:

- `ScreenBuilderDraftServiceImpl`
- screen-builder-related status summary and builder integration services

Expected result:

- builder and repair flow become clearly platform-owned

### Priority 3. Move Control-Plane Persistence Assets

Targets:

- `RuntimeControlPlaneServiceImpl`
- `docs/sql/20260321_resonance_repair_module_selection_schema.sql`

Expected result:

- DB draft and active runtime persistence become visibly aligned as one governed ownership lane

### Priority 4. Split Frontend Route Ownership

Targets:

- `frontend/src/app/routes/pageRegistry.tsx`
- platform page registration and loading helpers

Expected result:

- Carbonet runtime route ownership and Resonance platform route ownership become separately traceable

### Priority 5. Finish Auth And Governance Boundary Review

Pending targets already identified by the boundary classification document:

- `AuthGroupManageServiceImpl`
- `MenuFeatureManageServiceImpl`
- `AdminLoginHistoryServiceImpl`
- selected `Admin*MenuBootstrap` families

Expected result:

- remaining mixed governance and runtime-admin concerns are formally classified

## Practical Interpretation

Use this wording when describing current progress:

- `boundary rules are established`
- `common DB versus project DB rules are established`
- `first control-plane package split is implemented`
- `control-plane API and DB draft families are implemented`
- `admin composition split is still in progress`
- `the repository is not yet in a final fully separated state`

Use this wording only after the next refactor phases complete:

- `Carbonet runtime and Resonance control plane are physically separated by ownership and composition`

## Immediate Execution Backlog

Use this backlog when the operator says to continue immediately without reopening the whole architecture discussion.

### Track A. Control-Plane Composition

Status: `READY`

Do next:

1. finish `Priority 1A`
2. convert mixed `feature/admin` composition into platform-owned composition plus compatibility shims
3. update this status document after each moved family

Definition of done:

- one selected family no longer has `feature/admin` as the real composition owner
- compatibility shims are visibly transitional, not the source of truth

### Track B. Builder Productization

Status: `READY`

Do next:

1. keep builder ownership in platform/control-plane lanes
2. close the authenticated verification gap for:
   - `/admin/system/environment-management`
   - `/admin/system/screen-builder`
   - current-runtime compare
   - repair workbench
3. continue installable-builder hardening around validators, package lifecycle, and compatibility evidence

Definition of done:

- builder screens are not only reachable but operationally verified
- install and publish evidence are explicit enough for project bootstrap and rollback

### Track C. Version And Deploy Governance

Status: `READY`

Do next:

1. implement the platform-owned `versioncontrol` lane
2. connect `releaseUnitId`, `runtimePackageId`, and `deployTraceId` into one operator-visible flow
3. keep runtime package and project version state under control-plane ownership

Definition of done:

- project version management is implemented under `platform/versioncontrol`
- deploy evidence is queryable without reopening implementation code

### Track D. Frontend Route Split

Status: `BLOCKED_BY_TRACK_A`

Do after Track A stabilizes:

1. split platform page registration from runtime page registration
2. keep one shell only as a transitional host, not as the ownership model
3. remove hard-coded project context from control-plane flows where possible

Definition of done:

- runtime routes and platform routes are separately traceable in the registry and bootstrap flow
