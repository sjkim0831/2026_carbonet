# Builder Compatibility Shim Removal Plan

## Goal

Define the execution roadmap for removing transitional bridge and adapter code from the legacy root tree:

- `src/main/java/egovframework/com/common/mapper/*Bridge.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/*Bridge.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/*Adapter.java`

These files were created to isolate `screenbuilder-carbonet-adapter` from legacy services during the initial multi-module cutover. They must be removed as the underlying legacy services are migrated to platform-owned modules.

## Prerequisites

This plan starts after:

- `docs/architecture/builder-resource-ownership-wave-20260415-closure.md`

is accepted, confirming that resource ownership is already resolved.

## Removal Strategy

### Phase 1: Registration
Register all identified bridge and adapter files in the `BUILDER_COMPATIBILITY_SHIM_REMOVAL` family tracker.

### Phase 2: Dependency Verification
For each shim, verify if the legacy service it wraps (e.g., `MenuInfoService`, `ScreenCommandCenterService`) has a platform-owned equivalent or has been moved to a module that the `screenbuilder-carbonet-adapter` can depend on.

### Phase 3: Direct Wiring
Update the implementations inside `modules/screenbuilder-carbonet-adapter` to use the platform-owned services directly, bypassing the legacy bridge.

### Phase 4: Physical Deletion
Once the bridge is no longer referenced by any live bean or configuration, delete the Java file from the legacy root.

## Completion Standard

This family is closed when:
- No `*Bridge.java` or `*Adapter.java` files related to the builder remain in the legacy root `src/main/java`.
- `CarbonetApplication.java` no longer manually registers these bridge beans.
- `screenbuilder-carbonet-adapter` is fully decoupled from the legacy `feature/admin` service layer.

## Active Continuation

For the live continuation queue, use:
- `docs/architecture/builder-compatibility-shim-queue-map.md`
- `docs/architecture/builder-compatibility-shim-status-tracker.md`

## Next Move

1. Create the Queue Map for identified shims.
2. Create the Status Tracker to record the "Removal Trigger" for each shim.
