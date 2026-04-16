# Builder Compatibility Shim Status Tracker

## Goal

Track the current decision state and removal readiness for each transitional bridge in:

- `BUILDER_COMPATIBILITY_SHIM_REMOVAL`

Use this tracker after reading:
- `docs/architecture/builder-compatibility-shim-removal-plan.md`
- `docs/architecture/builder-compatibility-shim-queue-map.md`

## Decision Codes

- `PENDING_DEPENDENCY`
  - underlying legacy service is not yet moved to platform
- `READY_FOR_WIRING`
  - platform equivalent exists; module implementation needs direct wiring
- `REMOVAL_BLOCKED`
  - technical barrier (e.g., circular dependency) prevents removal
- `DELETED`
  - shim file is physically removed from legacy root

## Current Tracker

| Row | Shim Class | Wraps Legacy Service | Platform Equivalent Status | Decision | Notes |
| --- | --- | --- | --- | --- | --- |
| `1` | `CarbonetScreenBuilderComponentRegistrySourceBridge` | `UiObservabilityRegistryMapper` | `modules/carbonet-builder-observability` exists | `DELETED` | Moved to `modules/screenbuilder-carbonet-adapter` and removed from legacy root. |
| `2` | `CarbonetMenuInfoCommandAdapter` | `MenuInfoService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | `MenuInfoService` migration is required before this adapter can be removed. |
| `3` | `CarbonetScreenBuilderAuthoritySourceBridge` | `CurrentUserContextService`, `FrameworkAuthorityContractService` | Still in `feature/admin` / `common-auth` | `PENDING_DEPENDENCY` | Authority governance is still partially coupled with legacy session logic. |
| `4` | `CarbonetAdminMenuTreeReadAdapter` | `AdminMenuTreeService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `5` | `CarbonetScreenBuilderCommandPageSourceBridge` | `ScreenCommandCenterService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `6` | `CarbonetScreenBuilderMenuSourceBridge` | `MenuInfoService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `7` | `CarbonetMenuInfoReadAdapter` | `MenuInfoService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `8` | `CarbonetAdminSummaryReadAdapter` | `AdminSummaryService` | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `9` | `CarbonetFullStackGovernanceRegistryReadAdapter` | `FullStackGovernanceRegistryReadPort` implementation | Still in `feature/admin` | `PENDING_DEPENDENCY` | |
| `10` | `CarbonetAdminRouteSourceBridge` | `AdminReactRouteSupport` | `modules/carbonet-web-support` exists | `DELETED` | Removed stale references from `CarbonetApplication.java`; file was already gone. |

## Update Rule

When a shim state changes:
1. Update `Decision`
2. Summarize the reason in `Notes`
3. If `DELETED`, ensure `CarbonetApplication.java` registration is also removed.
