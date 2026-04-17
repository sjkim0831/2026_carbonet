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

For builder resource-ownership continuation after that frozen structure wave, reopen:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`
- supporting guidance only: `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`

Current interpretation:

- continuation routing is already standardized
- remaining progress should be measured by row decisions and blocker reduction, not by additional entry routing edits
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
- use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md` only as supporting guidance when continuation state changes
- if continuation state changes blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn

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

Builder install/deploy closeout note:

- builder-managed admin/system output is now closed at install/deploy level under `COMMON_DEF_PROJECT_BIND`
- governed page-family closeout target is the builder-managed `admin/system` family, with stable identity carried by explicit `pageId`, `menuCode`, canonical route path, and packaged React manifest/bootstrap shell evidence instead of source-copy delivery
- required binding inputs are now treated as explicit:
  - `pageId`
  - `menuCode`
  - canonical route path or route prefix
  - actor/data/action authority scope
  - project menu placement
  - authority override or narrowing
  - theme or presentation override where relevant
  - project executor handoff where write-heavy logic exists
- packaging owner path is `apps/carbonet-app/pom.xml`
- app assembly owner path is also `apps/carbonet-app/pom.xml`
- canonical packaged jar is `apps/carbonet-app/target/carbonet.jar`
- module/resource source of truth is explicit:
  - app assembly excludes moved root resource families
  - moved runtime/help/observability/version-control families are consumed from dedicated modules, not source-copy fallback
- local runtime target URL is `https://127.0.0.1:18000`
- authority-scope application is treated as explicit for this family:
  - menu and entry guard follow the same admin/system route policy
  - page bootstrap and page-data payloads are delegated to family owners instead of mixed controller-local fallbacks
  - query, action, approval, and audit surfaces are separated behind owner services and command/page supports
  - deny/allow interpretation is expected to remain traceable through page-family owner lanes and runtime evidence
- validator evidence path is:
  - `ops/scripts/verify-app-closure-all.sh`
  - `ops/scripts/verify-large-move-app-closure.sh`
  - `ops/scripts/codex-verify-18000-freshness.sh`
- deploy evidence path is:
  - `ops/scripts/build-restart-18000.sh`
  - `ops/scripts/codex-apply-and-deploy.sh`
  - `ops/scripts/deploy-193-to-221.sh`
  - `ops/scripts/jenkins-deploy-carbonet.sh`
  - `ops/scripts/deploy-blue-green-221.sh`
- rollback evidence path is:
  - `ops/scripts/codex-rollback-18000.sh`
  - `var/backups/codex-deploy`
  - `var/backups/manual-deploy`
  - `var/logs/codex-rollback-18000.log`
- runtime proof is currently closed with:
  - `verify-app-closure-all.sh` passing
  - `build-restart-18000.sh` completed
  - `codex-verify-18000-freshness.sh` passing with `apps/carbonet-app/target/carbonet.jar` equal to `var/run/carbonet-18000.jar`

Closeout sentence for the current builder-managed family:

- `CLOSED: page systemization is complete for the builder-managed admin/system family; identity, authority scope, contracts, project binding, validator checks, and runtime verification target are explicit.`
- `CLOSED: authority scope is consistently applied for the builder-managed admin/system family; menu, entry, query, action, approval, audit, and trace surfaces follow the same governed policy.`
- `CLOSED: builder install and deploy closeout is complete for the builder-managed admin/system family; install inputs, project bindings, packaging source of truth, runtime target, and evidence surfaces are explicit.`

Screen-builder pilot family closeout note:

- pilot family is fixed to `screen-builder` only for this functional wave
- canonical route set is now explicit and live:
  - `/admin/system/screen-builder`
  - `/admin/system/screen-runtime`
  - `/admin/system/current-runtime-compare`
  - `/admin/system/repair-workbench`
- page systemization metadata is explicit in `frontend/src/features/screen-builder/screenBuilderFamily.ts` with:
  - `pageId`
  - `menuCode`
  - canonical route
  - manifest contract
  - install scope `COMMON_DEF_PROJECT_BIND`
  - project binding inputs
  - project executor ownership
- authority scope application is now live in both frontend and backend for this family:
  - menu and route entry guard align on the same admin route policy
  - `ScreenBuilderApiController` enforces query/action/approval feature checks through `CarbonetScreenBuilderAuthoritySource`
  - deny paths emit explicit screen-builder audit evidence instead of frontend-only blocked state
- install/deploy closeout is now explicit at family level:
  - packaging owner path: `apps/carbonet-app/pom.xml`
  - app assembly owner path: `apps/carbonet-app/pom.xml`
  - module/resource source of truth: `screenbuilder-carbonet-adapter`, `screenbuilder-core`, route family metadata, and app assembly packaging instead of source-copy delivery
  - runtime target URL: `https://127.0.0.1:18000`
  - validator/deploy/rollback evidence path:
    - `ops/scripts/build-restart-18000.sh`
    - `ops/scripts/codex-verify-18000-freshness.sh`
    - `ops/scripts/codex-rollback-18000.sh`
- current runtime proof for the family:
  - target jar and runtime jar hash match: `a34d9bc3cd0becd4d9cc9b6167aa10b8157d88ac4e3bba6c97a6bcd0a712cd0a`
  - pid: `67594`
  - port: `18000`
  - startup marker: `Tomcat started on port(s): 18000`
  - exact route evidence:
    - `/admin/system/screen-builder` -> `302` login redirect
    - `/admin/system/screen-runtime` -> `302` login redirect
    - `/admin/system/current-runtime-compare` -> `302` login redirect
    - `/admin/system/repair-workbench` -> `302` login redirect

Closeout sentence for the current pilot:

- `CLOSED: page systemization is complete for screen-builder; pageId, menuCode, canonical route, manifest, project binding, validator checks, and runtime verification target are explicit.`
- `CLOSED: authority scope is consistently applied for screen-builder; menu, entry, query, action, approval, audit, and trace surfaces follow the same governed policy.`
- `CLOSED: builder install and deploy closeout is complete for screen-builder; install inputs, project bindings, packaging source of truth, runtime target, and evidence surfaces are explicit.`

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
- `AdminSessionSimulationService` now consumes the narrower `PlatformObservabilityCompanyScopePort` instead of the broader observability page-facade port because it only needs scoped company-option resolution
- `AdminMainController` now also uses `PlatformObservabilityCompanyScopePort` for access-history company-option helpers instead of the broader observability page-facade port
- `AdminMemberController` now consumes a dedicated `PlatformObservabilityHistoryPagePayloadPort` for member security-history page data instead of the broader observability page-facade port
- `AdminShellBootstrapPageService` now consumes `ExternalMonitoringPayloadPort` and `CertificateAuditLogPageDataPort` instead of the broader observability page-facade port
- certificate-audit page-data ownership is now implemented directly by `PlatformObservabilityCertificateAuditPayloadService`, so the old reverse bridge back into `AdminShellBootstrapPageService` is removed
- `PlatformObservabilityBatchManagementPayloadService` now implements `BatchManagementPagePayloadPort`, and `ScreenCommandCenterServiceImpl` batch metadata now points at that dedicated port
- `ScreenCommandCenterServiceImpl` observability metadata for batch-management, external monitoring, and external logs now points at dedicated ports instead of the broad observability page-facade contract
- `AdminMemberExportController` now calls `AdminMemberExportService` and `AdminAuthorityPagePayloadSupport` directly, so `AdminMainController` no longer owns the member/admin/company Excel export pass-through endpoints
- `AdminEmissionResultController` now owns its own React-route forwarding, list payload assembly, and detail payload lookup, so `AdminMainController` no longer owns the emission-result list/detail pass-through endpoints
- `AdminAuthorityController` now owns auth-group/auth-change/dept-role React-route forwarding and page-data payload lookup directly through `AdminReactRouteSupport` and `AdminAuthorityPagePayloadService`, so `AdminMainController` no longer owns those page/api pass-through endpoints
- `AdminAuthorityApiCommandService` now owns auth-group/auth-change/dept-role write API orchestration, so `AdminAuthorityController` no longer routes those write APIs back through `AdminMainController`
- `AdminAuthorityFormCommandService` now owns auth-group/auth-change/dept-role form-post submit orchestration, so `AdminMainController` no longer owns those authority form-submit paths
- `AdminAuthorityCommandSupportService` now owns authority command request-context, audit recording, author-profile mapping, and auth-group/auth-change/dept-role redirect building, so live `AdminMainController` references are cleared from `AdminAuthorityApiCommandService` and `AdminAuthorityFormCommandService`
- `AdminSystemBuilderController` now uses `AdminSystemBuilderAccessService`, `AdminSummaryReadPort`, and `AdminMenuShellService` instead of routing through `AdminMainController` for system-builder access checks, diagnostics, and fallback shell handling
- `AdminApprovalController` now owns member/company/certificate approval React-route forwarding and page-data payload lookup directly through `AdminReactRouteSupport` and `AdminApprovalPagePayloadService`, so `AdminMainController` no longer owns those page/api pass-through endpoints
- `AdminApprovalPagePayloadService` now uses `AdminRequestContextSupport` and `AdminApprovalPageModelAssembler` directly, so that payload service no longer uses `AdminMainController` as a request-helper/provider shim
- `AdminAuthorityPagePayloadService` now uses `AdminAuthorityPagePayloadSupport` for request-context, role-profile mapping, auth-group path resolution, and auth-change message formatting, so that payload service no longer uses `AdminMainController` as a helper/provider shim
- `AdminMemberPagePayloadService` now uses `AdminRequestContextSupport` and `AdminAuthorityPagePayloadSupport` directly for request-context, normalized-string, and shared authority-profile helpers, so its remaining `AdminMainController` dependence is narrowed to heavier member/account orchestration helpers
- `AdminMemberPagePayloadService` now also routes member/admin/company list payloads plus member-detail, password-reset history, company-detail, and company-account read-side assembly directly to `AdminListPageModelAssembler` and `AdminMemberPageModelAssembler`, so those read-side payload paths no longer use `AdminMainController`; the remaining live controller dependency there is narrowed to heavier member-register/admin-account orchestration
- `AdminMemberPagePayloadService` now also routes member-stats bootstrap data to `AdminShellBootstrapPageService`, and member-register bootstrap data plus grantable member-author-group loading to `AdminMemberRegisterSupportService`; `AdminMemberRegisterCommandService` now reuses the same support owner, so those live member-stats/register read-support helpers are cleared from `AdminMainController`
- `AdminAdminAccountAccessService` now owns admin-account create/access preset rules plus institution lookup and admin-visibility checks; `AdminMemberPagePayloadService` now uses `AdminMemberPageModelAssembler` plus that access service for admin-account create/permission read-side, and `AdminAdminAccountCreateCommandService` now reuses the same access owner for create-submit access/institution checks
- `AdminMemberPagePayloadService` now also uses `AdminMemberPageModelAssembler` directly for member-edit read-side defaults and model assembly, so live `AdminMainController` references are cleared from that payload service
- `AdminAdminPermissionSupportService` now owns admin-permission author-group section loading, current-role validation, baseline feature lookup, role assignment, and grantable-feature scope resolution; `AdminAdminPermissionService` no longer uses `AdminMainController` for those permission-save helpers
- `AdminMemberEditSupportService` now owns member-edit permission author-group section loading, current-role lookup, grantable-feature scope resolution, baseline feature loading/filtering, and failure-model permission repopulation; `AdminMemberEditCommandService` no longer uses `AdminMainController` for those permission-lane helpers
- `AdminMemberEditNavigationSupport` and `AdminMemberEditAuditSupport` now own member-edit form view/redirect resolution and audit recording, while `AdminRequestContextSupport` plus assembler-local defaults now cover request-context and default-model setup; live `AdminMainController` references are cleared from `AdminMemberEditCommandService`
- `AdminAdminAccountCreateSupportService` now owns admin-account-create preset-role resolution, feature normalization/baseline loading, grantable-feature scope resolution, and create-audit recording; `AdminAdminAccountCreateCommandService` now uses request-context, access, and create support owners directly, so live `AdminMainController` references are cleared from that command service
- `AdminMemberPageModelAssembler` now uses `AdminRequestContextSupport`, `PlatformObservabilityCompanyScopePort`, and local reset-history row formatting for password-reset history assembly, so that slice no longer uses `AdminMainController` for request-context, company-option lookup, selected-company resolution, or reset-history row mapping
- `AdminMemberPageModelAssembler` now also uses assembler-local company-detail/account labels, routes, and institution/file lookup helpers, so those company detail/account slices no longer use `AdminMainController` for status labels, membership labels, admin-prefix/url building, or institution-file loading
- `AdminMemberPageModelAssembler` now also uses assembler-local defaults, labels, access-scope/document formatting, reset-history row formatting, and admin-account preset/feature normalization for member edit/detail and admin-account slices, so the remaining `AdminMainController` dependence there is narrowed to heavier permission-editor, member merge/evidence, and access-check helpers
- `AdminMemberPageModelAssembler` now also uses assembler-local member access checks and permission author-group section assembly/flattening, so those member edit/detail and admin-account slices no longer use `AdminMainController` for access gating or permission section construction before the remaining shared permission-editor step
- `AdminMemberPageModelAssembler` no longer keeps live `AdminMainController` indirection at all; the remaining member/company/admin-account read-side assembly now runs through assembler-local helpers plus support owners directly
- `AdminListQuerySupportService` now owns member/admin/company/login-history list query helpers such as member-management scope checks, selected-company resolution, access-history company-option lookup, admin-list visibility filtering, and admin-list action access; live `AdminMainController` references are cleared from `AdminListPageModelAssembler`
- `AdminPermissionEditorService` now owns the shared permission-editor payload assembly used by member edit/detail, admin-account edit, and member-edit failure recovery, so live callers no longer use `AdminMainController` for `populatePermissionEditorModel`; only a compatibility delegate remains there
- `AdminPermissionOverrideService` now owns the shared user-feature override persistence used by member edit/register and admin-account create/update flows, so live command callers no longer use `AdminMainController` for `savePermissionOverrides`; only a compatibility helper remains there
- `AdminMemberEvidenceSupport` now owns member-to-institution merge, institution lookup for member detail/edit, and member evidence-file loading; member-page and approval assemblers no longer use `AdminMainController` for those evidence/detail helpers
- `AdminMemberAccessSupport` now owns member/company access checks plus member/company file lookup and file-path/media-type validation; member-file serving, member-edit/password-reset access gates, member-edit payload read-side, member-detail read-side, and member-approval access checks no longer use `AdminMainController` for those helpers
- `AdminMemberController` now owns member-stats and member-register React-route forwarding and page-data payload lookup directly through `AdminReactRouteSupport` and `AdminMemberPagePayloadService`, so `AdminMainController` no longer owns those page/api pass-through endpoints
- `AdminMemberController` now also owns member-detail and admin-account page forwarding / create-page payload lookup directly through `AdminReactRouteSupport` and `AdminMemberPagePayloadService`, so `AdminMainController` no longer owns those page/api pass-through endpoints
- `AdminMemberController` now also owns member-edit and password-reset React-route forwarding and page-data payload lookup directly through `AdminReactRouteSupport` and `AdminMemberPagePayloadService`, so `AdminMainController` no longer owns those page/api pass-through endpoints
- `AdminMemberController` now also owns admin-account permission page-data lookup directly through `AdminMemberPagePayloadService`, so `AdminMainController` no longer owns that read-side payload endpoint
- `AdminMemberController` now also owns member/admin/company list routing and page-data lookup plus company-detail/company-account routing and page-data lookup directly through `AdminReactRouteSupport` and `AdminMemberPagePayloadService`, so `AdminMainController` no longer owns those read-side member/company pass-through endpoints
- `AdminMemberSupportService` now owns admin-account ID duplication checks and company-search support APIs, so `AdminMainController` no longer owns those member/account support-read endpoints
- `AdminAdminPermissionCommandService` now owns admin-account permission submit orchestration for both API and form-post flows, so `AdminMainController` no longer owns that member/account write command path
- `AdminCompanyAccountCommandService` now owns company-account submit orchestration for both API and form-post flows, so `AdminMainController` no longer owns that company-account write command path
- `AdminCompanyAccountSupportService` now also owns company-account normalization, institution/file lookup, institution-id generation, upload validation, and evidence-file persistence/path joining; `AdminCompanyAccountService` no longer uses `AdminMainController` for the company-account save lane
- `AdminAdminAccountCreateCommandService` now owns admin-account create submit orchestration for the API flow, so `AdminMainController` no longer owns that admin-account creation command path
- `AdminAdminPermissionCommandSupportService` now owns admin-permission request-language routing, redirect/view-name resolution, and audit recording, while `AdminMemberPageModelAssembler` now exposes admin-account default-model setup for reuse; live `AdminMainController` references are cleared from `AdminAdminPermissionCommandService`
- `AdminMemberPasswordResetCommandService` now owns member password-reset action orchestration, so `AdminMainController` no longer owns that password-reset command path
- `AdminMemberPasswordResetSupportService` now owns member-password-reset request-context, client-ip normalization, and audit recording, so live `AdminMainController` references are cleared from `AdminMemberPasswordResetCommandService`
- `AdminMemberSupportService` now also owns member ID duplication checks, and `AdminMemberRegisterCommandService` now owns member-register submit orchestration, so `AdminMainController` no longer owns the member-register support/command path
- `AdminMemberRegisterCommandSupportService` now owns member-register request-context, normalization/validation helpers, institution lookup reuse, grantable-feature scope resolution, and member-register audit recording, so live `AdminMainController` references are cleared from `AdminMemberRegisterCommandService`
- `AdminMemberEditCommandService` now owns member-edit submit orchestration for both API and form-post flows, so `AdminMainController` no longer owns the member-edit command path
- `AdminMemberFileAccessService` now owns member/company file download and preview orchestration, so `AdminMainController` no longer owns those member/company file-serving paths
- `AdminApprovalCommandService` now owns member/company/certificate approval submit orchestration for form-post and API flows, so `AdminMainController` no longer owns those approval submit/action paths
- `AdminPayloadSelectionSupport` and `AdminApprovalStatusChangeService` now own selected-id extraction and member/company approval status-change persistence, so `AdminApprovalActionService` no longer uses `AdminMainController` for those approval helpers; `AdminCertificateApprovalService` also now uses the same payload-selection support
- `AdminApprovalNavigationSupport` and `AdminApprovalAuditSupport` now own approval redirect/view-name resolution, redirect-query appending, approval audit recording, and approval audit JSON escaping, so `AdminApprovalCommandService` no longer uses `AdminMainController` for those broad approval helpers; its remaining controller use is narrowed to failure-path list repopulation
- `AdminApprovalCommandService` now also uses `AdminApprovalPagePayloadService` for approval failure-path list/model restoration, so live `AdminMainController` references are cleared from that command service
- `AdminApprovalPageModelAssembler` now uses request-context, authority, and approval-navigation supports plus assembler-local label/option/path helpers, so live `AdminMainController` references are also cleared from approval list assembly
- `AdminSystemPageModelAssembler` now uses assembler-local string normalization and direct shell-bootstrap injection for blocklist filtering and backup-config page data, so live `AdminMainController` references are cleared from that system-page assembler
- `AdminMainController` now routes its remaining institution-info lookup calls through `AdminCompanyAccountSupportService`, and the controller-local institution/file lookup helpers (`loadInstitutionInfoByInsttId`, `loadInsttFilesByInsttId`, `resolveInstitutionFile`) are removed
- `AdminMainController` no longer keeps duplicate approval status-change helper bodies; member/company approval status changes are now owned only by `AdminApprovalStatusChangeService`
- `AdminMainController` no longer keeps duplicate approval list/member-load/redirect-query compatibility helpers; those live lanes are now owned by `AdminApprovalPageModelAssembler`, `AdminMemberAccessSupport`, and `AdminApprovalNavigationSupport`
- `AdminMainController` has also dropped dead member-list, duplicate-check, and generic redirect-error response wrappers after those lanes moved or disappeared from live call sites
- `AdminMainController` has also dropped dead hot-path member-edit and menu-permission-diagnostics shim entries, so `AdminHotPathPagePayloadService` and `AdminSystemBuilderController` remain the live owners for those lanes
- `AdminMainController` has also dropped dead generic status/error extraction wrappers (`statusFailureResponse`, `statusSuccessResponse`, `extractResponseErrorMessage`) after those response-shaping lanes disappeared from live call sites
- `AdminMainController` has also dropped dead admin-member/company/login-history/emission-result forwarding wrappers, and no longer keeps the corresponding list/emission assembler provider indirection
- `AdminMainController` has also dropped dead approval result/navigation/status-option duplicates plus the dead password-reset forwarding/simple-row wrapper, leaving those lanes owned by `AdminApprovalNavigationSupport`, `AdminApprovalPageModelAssembler`, and `AdminMemberPageModelAssembler`
- `AdminMainController` has also dropped dead password-reset history/company-scope helper bodies (`buildPasswordResetHistoryListRows`, `resolveHistoryTargetInsttId`, `resolveCompanyNameByInsttId`, `loadAccessHistoryCompanyOptions`, `buildScopedAccessHistoryCompanyOptions`, `formatDateTime`, `resolveUserSeLabel`) together with the now-unused company-scope cache and enterprise/general member repository indirection
- `AdminMainController` has also dropped dead authority feature/profile/history duplicate wrappers plus the now-unused local JSON/audit-summary helpers, leaving those lanes owned by `AdminAuthorityPagePayloadSupport`
- `AdminMainController` has also dropped dead recommended-role and department-role-summary duplicate helpers, leaving those recommendation/summary lanes owned by `AdminAuthorityPagePayloadSupport`
- `AdminMainController` has also dropped dead reset-keyword and authority role-category/company-option duplicate wrappers, leaving those lanes owned by `AdminMemberPagePayloadService` and `AdminAuthorityPagePayloadSupport`
- `AdminMainController` has also dropped dead generic utility duplicates (`buildTemporaryPassword`, `safeJson`, `resolveRequestIp`) after command/support owners took over those utility lanes
- `AdminMainController` now also calls `AdminRequestContextSupport` and `AdminAuthorityPagePayloadSupport` directly for the remaining current-user and member-management scope checks, so the controller-local thin wrappers for current-user extraction, authority lookup, company-scope checks, selected-institution selection, and filtered authority-group helper pass-throughs are removed
- `AdminMainController` has also dropped dead admin-account/member-access/auth-group-scope compatibility helpers (`canCreateAdminAccounts`, `canCreateAdminRolePreset`, `canCurrentAdminAccessAdmin`, `selectVisibleAdminMembers`, `canCurrentAdminAccessMember`, `canCurrentAdminAccessInsttId`, `resolveMemberFileInsttId`, and the local `AuthGroupScopeContext` shim), leaving those lanes owned by `AdminAdminAccountAccessService`, `AdminMemberAccessSupport`, `AdminListQuerySupportService`, and `AdminAuthorityPagePayloadSupport`
- `AdminMainController` has also dropped dead authority-scope normalization duplicates (`matchesRoleCategory`, scoped-author prefix/normalization checks, and `containsAny`) together with the now-unused `FrameworkAuthorityPolicyService` field, leaving those lanes owned by `AdminAuthorityPagePayloadSupport`, `AdminAuthorityCommandService`, and other dedicated owners
- `AdminMainController` has also dropped dead payload-selection, grantable-feature merge/filter, CSRF priming, member-evidence/file, and generic parse/phone/file-path duplicate helpers after those lanes were fully internalized by `AdminPayloadSelectionSupport`, `AdminAuthorityPagePayloadSupport`, `AdminPermissionOverrideService`, `AdminMemberEvidenceSupport`, `AdminMemberAccessSupport`, and request-context/support owners
- `AdminMainController` has also dropped dead system summary payload builders, member-type/common-code option builders, phone/email formatting helpers, and duplicate feature-label/password helpers; those lanes are now owned by `AdminSummaryServiceImpl`, `AdminSecurityBootstrapReadService`, `AdminMemberPagePayloadService`, `AdminMemberPageModelAssembler`, `AdminPermissionEditorService`, `AdminMemberRegisterCommandSupportService`, and `AdminCompanyAccountSupportService`
- `AdminMainController` has now also dropped dead provider wrappers plus local route/label/status/scope helper duplicates for authority, member, approval, and system lanes, so the remaining controller body is narrowed further toward direct admin entry routing and a very small shared utility surface
- `AdminMainController` has now also dropped dead compatibility route shims (`auth_group`, `auth_change`, `dept_role_mapping`, menu placeholder/fallback passthrough) and dead local file/webmaster helpers, leaving those lanes owned by dedicated controller/service owners such as `AdminSystemBuilderController`, `AdminCompanyAccountSupportService`, and authority payload/command supports
- `AdminMainController` now also drops its dead legacy constants, logger, URL-encode helper, and the huge stale import surface, leaving the file as a near-minimal admin entry/route-forward controller with only still-live route methods and `safeString`
- `/admin/external/connection_edit` is now owned by `AdminExternalConnectionController`, `/admin/emission/survey-admin` and `/admin/emission/survey-admin-data` are now owned by `AdminEmissionSiteController`, and the former `AdminMainController` admin-home entry is now owned by `AdminHomeController`; `AdminMainController.java` itself has been removed
- `AdminSystemCodeController` now directly owns the `/admin/system/menu` alias route family (`/menu`, `/menu/page-data`, `/menu/order`, `/menu/create-page`), so the old pass-through `AdminContentMenuController.java` has been removed
- `AdminSystemCodeController` now also directly owns the `/admin/content/menu` API alias family (`/content/menu/page-data`, `/content/menu/order`, `/content/menu/create-page`) with FAQ-branch filtering built in, so `AdminContentMenuManagementController` is reduced to page forwarding only and no longer injects another controller
- content-support page wrappers (`AdminContentMenuManagementController`, `AdminTagManagementController`, `AdminBannerController`, `AdminFaqManagementController`) now forward through `AdminReactRouteSupport` instead of directly rendering through `ReactAppViewSupport`, aligning them with the standard admin route-owner pattern
- the remaining thin content/admin page wrappers (`AdminBoardController`, `AdminPostManagementController`, `AdminQnaCategoryController`, `AdminFileManagementController`, `AdminPopupController`, `AdminSiteMapController`) now also forward through `AdminReactRouteSupport`, so direct `ReactAppViewSupport` rendering is cleared from the current content-support controller set
- `AdminMenuManagementPageService` now owns the `menu-management` read-side payload for `/system/menu/page-data` and `/content/menu/page-data`, so `AdminSystemCodeController` no longer assembles those menu payloads inline
- `AdminMenuManagementCommandService` now owns `menu-management` order-save and create-page command orchestration for `/system/menu/*` and `/content/menu/*`, so `AdminSystemCodeController` no longer executes those write flows inline
- `AdminMenuManagementPageService` now also owns the `full-stack-management` read-side payload for `/full-stack-management/page-data`, including summary-row assembly, so `AdminSystemCodeController` no longer builds the full-stack summary inline
- `AdminMenuManagementCommandService` now also owns `/full-stack-management/menu-visibility`, including default VIEW feature metadata sync and menu-management audit recording for that write path
- `AdminPageManagementPageService` now owns the `page-management` read-side payload for `/page-management/page-data`, including permission-impact enrichment, public-catalog merge, domain-option loading, and result-message shaping, so `AdminSystemCodeController` no longer assembles that page-management view model inline
- `AdminPageManagementCommandService` now owns the `page-management` write lane for page create/update/delete and environment-managed page update/impact/delete, including redirect-error shaping and default VIEW feature synchronization/deletion for those flows
- `AdminFeatureManagementPageService` now owns the `feature-management` read-side payload for `/function-management/page-data` and `/feature-management/page-data`, including assignment-count enrichment and page-option loading
- `AdminFeatureManagementCommandService` now owns the `feature-management` write lane for feature create/update/delete and environment-feature impact/delete flows, so `AdminSystemCodeController` no longer executes feature validation, redirect shaping, or linked-permission deletion inline for that family
- `AdminCodeManagementPageService` now owns the `code-management` read-side payload for `/code/page-data`, including class/common/detail code lists, linked-reference counts, selected detail-code resolution, and query message/error shaping
- `AdminCodeManagementCommandService` now owns the `code-management` write lane for class/common/detail code create/update/delete and detail-code bulk `useAt` update flows, so `AdminSystemCodeController` no longer executes code validation, redirect shaping, or bulk update logic inline for that family
- `AdminAccessHistoryPageService` now owns the `access-history` read-side payload for `/access_history/page-data`, including scope/authority resolution, company-option loading, request-log paging, company-name enrichment, and keyword filtering, so `AdminSystemCodeController` no longer carries access-history-specific query helpers or repositories for that family
- `AdminIpWhitelistCommandService` now owns the `ip-whitelist` write lane for request creation and review decision flows, including request/rule row shaping, firewall execution feedback, audit recording, and bilingual execution messaging, so `AdminSystemCodeController` no longer carries ip-whitelist-specific command helpers or firewall plumbing for that family
- `MENU_MANAGEMENT_SUPPORT` dead duplicates are now cleared from `AdminSystemCodeController`; menu tree loading/sorting, managed-page validation, default VIEW feature sync, audit helpers, actor/request metadata helpers, and related page/menu utility wrappers remain only in the dedicated menu/page command-page services that now own those lanes
- `SYSTEM_MISC_RESIDUALS` in `AdminSystemCodeController` are now trimmed down as well; unused legacy constants, dead redirect/query helpers, dead duplicate payload wrappers, and stale owner fields/imports are removed, leaving the controller centered on live route delegation plus a very small shared utility surface
- `ScreenCommandCenterServiceImpl` authority/member/approval/company-detail metadata now points at the narrowed controller and payload/command owners instead of legacy `AdminMainController.*` entries for those live paths
- `AdminMainController` itself has now dropped its unused compatibility wrappers for approval/member/admin-account/company-account permission and redirect/audit helper lanes, so the remaining controller body is narrowed further toward only still-live local helpers and entry orchestration
- `AdminMainController` has now also dropped its duplicate permission-section, admin-preset, and default-model helper wrappers after those lanes were fully internalized by assembler/support owners, so the remaining controller helper inventory is narrower again
- admin-facing help API aliases now terminate directly in `platform-help` `HelpManagementApiController`, so `feature/admin` only keeps the page-forwarding shim for `/admin/system/help-management`
- `feature/admin` self-healing and safe-plan workbench entry points now consume `SrTicketWorkbenchPort` instead of directly depending on the workbench service type
- `feature/admin` authority payload support now consumes `PlatformObservabilityAuditQueryPort` instead of directly depending on the observability query service type
- direct `platform.* service/web` imports from `src/main/java/egovframework/com/feature/admin/**` are now reduced to `0` for live code paths
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
- controller and page-service boundaries are still partly assembled from `feature/admin`
- some `feature/admin` composition still depends on platform-owned contract interfaces and bridge-driven metadata even though direct service/web type imports are now removed

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
    - [CLOSED] all `*MenuBootstrap` in `feature/admin` have been moved, deleted, or trimmed.
    - [CLOSED] home monitoring and integrated dashboard bootstraps moved to `platform.codex.service.*BootstrapSupport`.
    - [CLOSED] member registration, member approval, company approval, and system menu management bootstraps moved to `platform.codex.service.*BootstrapSupport`.
    - [CLOSED] `SrSelfHealingService`, `SrTicketRecordVO`, `SrWorkbenchStackItemVO`, and `SrTicketSafePlanTool` moved to `platform.workbench.*`.
    - [CLOSED] `SrTicketCodexRunnerService`, `SrTicketRunnerExecutionVO`, `ScreenCommandCenterService`, and `ScreenCommandCenterServiceImpl` moved to `platform.codex.*`.
    - [CLOSED] `ReactAppMenuUrlNormalizationBootstrap` trimmed to core normalization logic.
    - [CLOSED] redundant log-related bootstraps deleted from `feature/admin`.
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

Status: `IN_PROGRESS`

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

Status: `CLOSED`

Implemented:

1. platform-owned `versioncontrol` lane (Service, Mapper, API)
2. `releaseUnitId`, `runtimePackageId`, and `deployTraceId` connected into RDB persistence
3. project version state moved to `COMMON_DB` (RSN_* tables)

### Track D. Frontend Route Split

Status: `CLOSED`

Implemented:

1. split platform page registration from runtime page registration in `routeCatalog.ts`
2. removed hard-coded project context ("carbonet") from control-plane flows using `ProjectRuntimeContext`
3. added `routeScope` to identify "PLATFORM" versus "RUNTIME" ownership

Definition of done:

- runtime routes and platform routes are separately traceable in the registry and bootstrap flow
