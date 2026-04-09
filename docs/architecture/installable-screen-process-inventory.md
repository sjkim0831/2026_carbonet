# Installable Screen And Process Inventory

## Goal

Turn the repository-wide separation rules into a concrete candidate inventory for:

- installable screens
- reusable read-heavy screens
- installable business process packages
- project-owned executors

This document is intentionally path-oriented so the next refactor cuts can be chosen by folder instead of only by concept.

## Classification Keys

- `INSTALLABLE_SCREEN_READ_HEAVY`
- `INSTALLABLE_SCREEN_MIXED`
- `INSTALLABLE_PROCESS_DEFINITION`
- `PROJECT_PROCESS_EXECUTOR`
- `EDITOR_ADMIN_ONLY`
- `LEAVE_PROJECT_ONLY`

## Frontend Installable Screen Candidates

### `INSTALLABLE_SCREEN_READ_HEAVY`

These are the best early installable-screen candidates because they are governance-oriented or mostly read-heavy.

- `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`
- `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
- `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`
- `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`
- `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`
- `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
- `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`
- `frontend/src/features/observability/*`
- `frontend/src/features/system-code/*`
- `frontend/src/features/sitemap/*`
- `frontend/src/features/login-history/*`
- `frontend/src/features/access-history/*`

Reason:

- strong governance/registry/validator flavor
- low project-specific transaction weight
- good fit for manifest-driven install and reusable read models

### `INSTALLABLE_SCREEN_MIXED`

These can become installable, but only after reusable read and project executor splits are clearer.

- `frontend/src/features/emission-definition-studio/*`
- `frontend/src/features/emission-management/*`
- `frontend/src/features/external-monitoring/*`
- `frontend/src/features/security-policy/*`
- `frontend/src/features/file-management/*`
- `frontend/src/features/help-management/*`
- `frontend/src/features/faq-management/*`
- `frontend/src/features/tag-management/*`
- `frontend/src/features/qna-category/*`

Reason:

- screen shell is reusable
- but save/workflow/runtime side effects are still strongly project-owned

### `EDITOR_ADMIN_ONLY`

These belong primarily to the governed editor/admin lane, not runtime-common delivery.

- `frontend/src/features/screen-builder/*MigrationPage.tsx`
- `frontend/src/features/menu-management/*`
- `frontend/src/features/environment-management/*`
- `frontend/src/features/platform-studio/*`
- `frontend/src/features/page-management/*`
- `frontend/src/features/screen-management/*`

Rule:

- keep separable from runtime builder jars
- do not collapse editor behavior into common runtime-only modules

## Backend Reusable Read Candidates

### `COMMON_READ`

- `src/main/java/egovframework/com/common/service/CommonCodeService.java`
- `src/main/java/egovframework/com/common/menu/service/SiteMapService.java`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `modules/screenbuilder-core`

These already behave like stable read-heavy or metadata-heavy lines.

### `COMMON_READ_PROJECT_BIND`

- `src/main/java/egovframework/com/feature/admin/service/MenuInfoService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminMenuTreeService.java`
- `src/main/java/egovframework/com/feature/admin/service/FullStackGovernanceRegistryService.java`
- `src/main/java/egovframework/com/feature/admin/service/AdminSummaryService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminObservabilityPageService.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminSystemPageModelAssembler.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminMemberPageModelAssembler.java`
- `src/main/java/egovframework/com/feature/admin/web/AdminApprovalPageModelAssembler.java`

These have reusable read-model potential, but still bind to Carbonet project routes, menu families, or page payload conventions.

## Installable Business Process Candidates

### `INSTALLABLE_PROCESS_DEFINITION`

These already look like process-definition candidates or can be cut that way:

- `modules/screenbuilder-core`
- `src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderContractService.java`
- `src/main/java/egovframework/com/framework/builder/service/FrameworkBuilderCompatibilityService.java`
- builder install/validate/rollback console flow
- validator and rollback manifest contracts under `docs/architecture/*`

Good future package families:

- builder publish -> validate -> repair -> rollback
- external monitoring verify/remediate flows
- security policy validate/remediate flows
- member registration -> review -> approve flow
- company signup -> review -> approve flow

### `PROJECT_PROCESS_EXECUTOR`

These should stay project-owned longer because they execute project transactions or runtime side effects:

- `src/main/java/egovframework/com/feature/admin/service/impl/AdminEmissionManagementServiceImpl.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSaveApplicationService.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationApplicationService.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationExecution.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSaveExecution.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/IpWhitelistFirewallServiceImpl.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/SrSelfHealingServiceImpl.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/SrTicketCodexRunnerServiceImpl.java`

## Next Refactor Priority

1. split `COMMON_READ_PROJECT_BIND` services into:
   - reusable read contract
   - Carbonet source binding adapter
2. keep `PROJECT_PROCESS_EXECUTOR` logic out of installable common packages
3. make `INSTALLABLE_SCREEN_READ_HEAVY` screens depend on reusable read contracts first
4. move `EDITOR_ADMIN_ONLY` screens toward a dedicated editor/admin lane

Current progress:

- first reusable read contracts now exist for menu lookup, admin menu tree, governance registry lookup, and admin summary lookup
- several read-only consumers now depend on read ports instead of direct project services
- command contracts now exist for governance registry writes and security-summary action flows
- `AdminMainController` summary reads are now on read ports
- `AdminSystemCodeController` menu reads/writes are now split by `MenuInfoReadPort` and `MenuInfoCommandService`
- ip-whitelist read-side payload assembly and stored-row merge logic now live in `AdminIpWhitelistSupportService`
- `AdminSystemCodeController` keeps ip-whitelist request/decision command flow but no longer owns the page-data assembly block
- security policy, monitoring, and audit bootstrap payloads now live in `AdminSecurityBootstrapReadService`
- `AdminShellBootstrapPageService` and `AdminSystemPageModelAssembler` now share the same security bootstrap read assembly
- admin-home bootstrap summary/review/progress/status/log assembly now lives in `AdminHomeBootstrapReadService`
- scheduler bootstrap summary/job/node/execution/playbook assembly now lives in `AdminSchedulerBootstrapReadService`
- emission-result list/detail bootstrap assembly now lives in `AdminEmissionResultBootstrapReadService`
- trade list/statistics/duplicate bootstrap assembly and shared base trade rows now live in `AdminTradeBootstrapReadService`
- trade reject/approve flows now reuse `AdminTradeBootstrapReadService` for their read-side seed rows instead of rebuilding them inline
- remaining mixed hotspots are increasingly concentrated in large controller/page-assembly bodies

## Success Test

This inventory is useful only if follow-up refactors use it to choose cuts by path.

Do not add more placeholder screens before these candidates are separated by:

- reusable read contract
- process definition contract
- project executor boundary
