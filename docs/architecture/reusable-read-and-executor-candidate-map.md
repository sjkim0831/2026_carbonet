# Reusable Read And Executor Candidate Map

## Goal

Mark which current backend services should move toward reusable read contracts and which should remain project executors.

## Candidate Groups

### Group A: Reusable Read First

- `CommonCodeService`
- `SiteMapService`
- `MenuInfoService`
- `AdminMenuTreeService`
- `FullStackGovernanceRegistryService`
- `AdminSummaryService`
- `AdminObservabilityPageService`

Preferred move:

- extract read contract
- keep Carbonet mapper or route binding in adapter/app

### Group B: Read Shell Plus Project Binding

- `AdminSystemPageModelAssembler`
- `AdminMemberPageModelAssembler`
- `AdminApprovalPageModelAssembler`
- `AdminMenuShellService`
- `AdminShellBootstrapPageService`

Preferred move:

- stabilize output shape
- keep project payload binding thin

### Group C: Project Executor

- `AdminEmissionManagementServiceImpl`
- `EmissionInputSaveApplicationService`
- `EmissionCalculationApplicationService`
- `EmissionCalculationExecution`
- `EmissionInputSaveExecution`
- `IpWhitelistFirewallServiceImpl`
- `SrSelfHealingServiceImpl`
- `SrTicketCodexRunnerServiceImpl`

Preferred move:

- do not force common extraction yet
- expose capability keys only when installable process packages need them

## Immediate Delivery Rule

For `3-minute new-project bootstrap`, do this order:

1. extract Group A reusable reads
2. stabilize Group B payload shells
3. leave Group C as project executor adapters

## Current Progress

The first read-port cut is now in place for:

- `MenuInfoReadPort`
- `AdminMenuTreeReadPort`
- `FullStackGovernanceRegistryReadPort`
- `AdminSummaryReadPort`

Current Carbonet adapters:

- `CarbonetMenuInfoReadAdapter`
- `CarbonetAdminMenuTreeReadAdapter`
- `CarbonetFullStackGovernanceRegistryReadAdapter`
- `CarbonetAdminSummaryReadAdapter`

Current command contracts now also exist for mixed services:

- `AdminSummaryCommandService`
- `FullStackGovernanceRegistryCommandService`
- `MenuInfoCommandService`

Current read-only consumers now use ports instead of direct project services in:

- `SiteMapServiceImpl`
- `HomeMenuServiceImpl`
- `HomeMenuFallbackController`
- `AdminMenuController`
- `AdminMenuShellService`
- `WbsManagementService`
- `AdminSystemPageModelAssembler`
- `AdminObservabilityPageService`
- `PlatformObservabilityPagePayloadService`
- `AdminAuthorityPagePayloadService`
- `AdminEmissionResultPageModelAssembler`
- `AdminShellBootstrapPageService`

Current command consumers now use command contracts instead of mixed service types in:

- `AdminSystemBuilderController`
- `SecurityPolicyMaintenanceScheduler`
- `AdminFullStackManagementApiController`

Current mixed-controller reduction:

- `AdminMainController` now uses `AdminSummaryReadPort` for its remaining summary reads
- `AdminSystemCodeController` now uses `FullStackGovernanceRegistryReadPort` for governance registry reads
- `AdminSystemCodeController` now uses `MenuInfoReadPort` for menu reads and `MenuInfoCommandService` for menu-order writes
- `AdminIpWhitelistSupportService` now owns ip-whitelist read-side assembly, merge, summary, and persistence lookup support
- `AdminSystemCodeController` now keeps ip-whitelist command handling while delegating page-data assembly and stored-row lookup to `AdminIpWhitelistSupportService`
- `AdminSecurityBootstrapReadService` now owns security policy, monitoring, and audit bootstrap page-data assembly
- `AdminShellBootstrapPageService` now delegates those security read payloads instead of building them inline
- `AdminSystemPageModelAssembler` now consumes the same `AdminSecurityBootstrapReadService` payloads for security console model assembly
- `AdminHomeBootstrapReadService` now owns admin-home summary, review queue, progress, operational status, and system-log bootstrap assembly
- `AdminShellBootstrapPageService` now delegates admin-home read payloads instead of keeping those helper blocks inline
- `AdminSchedulerBootstrapReadService` now owns scheduler summary, job rows, node rows, execution rows, and playbook bootstrap assembly
- `AdminShellBootstrapPageService` and `AdminSystemPageModelAssembler` now share the same scheduler bootstrap read payload
- `AdminEmissionResultBootstrapReadService` now owns emission-result list/detail bootstrap assembly and its review/evidence/history helper bundle
- `AdminShellBootstrapPageService` now delegates emission-result read payloads instead of keeping those helper blocks inline
- `AdminTradeBootstrapReadService` now owns trade list/statistics/duplicate bootstrap assembly and the shared base trade row seeds
- `AdminShellBootstrapPageService` now reuses `AdminTradeBootstrapReadService.buildTradeListRows(...)` for trade reject/approve flows instead of keeping a second inline read seed
- remaining mixed hotspots are now closer to large page-assembly methods than to direct service-type coupling
