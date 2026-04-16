# Builder Compatibility Shim Queue Map

## Goal

Provide a compressed queue view for:

- `BUILDER_COMPATIBILITY_SHIM_REMOVAL`

This queue manages the final deletion of transitional bridge and adapter files in the legacy root.

## Pair Maintenance Contract

Reference:
- `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`

When any row state, removal trigger, or next review target changes, update this file and:
- `docs/architecture/builder-compatibility-shim-status-tracker.md`

in the same turn.

## Current Queue

| Row | Shim Class | Target Removal Trigger | Current State |
| --- | --- | --- | --- |
| `1` | `CarbonetScreenBuilderComponentRegistrySourceBridge` | All Component Registry read/write logic moved to `platform` | `PENDING_DEPENDENCY` |
| `2` | `CarbonetMenuInfoCommandAdapter` | `MenuInfoService` moved to `platform` or common-admin-runtime | `PENDING_DEPENDENCY` |
| `3` | `CarbonetScreenBuilderAuthoritySourceBridge` | Authority scope logic moved to `platform-auth` | `PENDING_DEPENDENCY` |
| `4` | `CarbonetAdminMenuTreeReadAdapter` | `AdminMenuTreeService` moved to `platform` | `PENDING_DEPENDENCY` |
| `5` | `CarbonetScreenBuilderCommandPageSourceBridge` | `ScreenCommandCenterService` moved to `platform` | `PENDING_DEPENDENCY` |
| `6` | `CarbonetScreenBuilderMenuSourceBridge` | `MenuInfoService` moved to `platform` | `PENDING_DEPENDENCY` |
| `7` | `CarbonetMenuInfoReadAdapter` | `MenuInfoService` moved to `platform` | `PENDING_DEPENDENCY` |
| `8` | `CarbonetAdminSummaryReadAdapter` | `AdminSummaryService` moved to `platform` | `PENDING_DEPENDENCY` |
| `9` | `CarbonetFullStackGovernanceRegistryReadAdapter` | Governance registry moved to `platform` | `PENDING_DEPENDENCY` |
| `10` | `CarbonetAdminRouteSourceBridge` | React route forwarding moved to `carbonet-web-support` | `PENDING_DEPENDENCY` |

## Reading Order

1. `docs/architecture/builder-compatibility-shim-removal-plan.md`
2. `docs/architecture/builder-compatibility-shim-queue-map.md`
3. `docs/architecture/builder-compatibility-shim-status-tracker.md`

## Next Move

- Create the `docs/architecture/builder-compatibility-shim-status-tracker.md` to record detailed dependencies.
