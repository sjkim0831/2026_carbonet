# Builder Resource Ownership Wave 2026-04-15 Closure

## Goal

Freeze the builder-resource ownership decision for the current wave.

This document answers four questions for the current wave:

- which family is being closed now
- which module or app path is the canonical owner for selected resources
- whether duplicate root resources are deletable or shims
- how `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` is completed for the current docs set

Use this document together with:

- `docs/architecture/builder-resource-ownership-closure-plan.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`
- `docs/architecture/builder-resource-ownership-status-tracker.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`
- `apps/carbonet-app/pom.xml`

After this family is accepted as closed, continue from:

- `docs/architecture/builder-compatibility-shim-removal-plan.md` (Next Family)

## Current Wave Owner Decision

The current wave closes the `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` family.

For `2026-04-15`, completion-owner judgment for builder resource work must stop at that family boundary.
All five rows in the status tracker are now resolved as `DELETE_NOW` or carry stronger non-blocking notes.

## Family Closed In This Wave

The family closed in this wave is:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This family includes:

- builder-owned mapper XML ownership
- builder-owned metadata/resource ownership
- executable-app assembly resource exclusion from root
- attribution of executable-app success to dedicated modules

## Canonical Resource Owners

- `framework-builder compatibility mapper XML`: `modules/screenbuilder-carbonet-adapter`
- `framework contract metadata resource`: `modules/carbonet-contract-metadata`
- `builder observability metadata/resource family`: `modules/carbonet-builder-observability`
- `executable app resource assembly`: `apps/carbonet-app` (via dedicated modules)

## Duplicate Root Resource Rule: DELETE_NOW

For this wave, the following duplicate root resources are resolved as `DELETE_NOW`:

- `src/main/resources/framework/contracts/framework-contract-metadata.json`
- `src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/FrameworkBuilderCompatibilityMapper.xml`
- `src/main/resources/egovframework/mapper/com/framework/builder/runtime/FrameworkBuilderObservabilityMapper.xml`
- `src/main/resources/egovframework/mapper/com/common/UiObservabilityRegistryMapper.xml`

These are `DELETE_NOW` because:
- `apps/carbonet-app` explicitly excludes them from its root resource import.
- Dedicated modules already own and provide these resources.
- Executable-app success no longer depends on these root copies.

## Completion Interpretation For This Wave

`BUILDER_RESOURCE_OWNERSHIP_CLOSURE` is considered complete because:

1. **Explicit Ownership**: Every selected resource family has one named module owner.
2. **Root Independence**: `apps/carbonet-app` exclusion confirms that the executable jar MUST consume resources from modules.
3. **Clean Attribution**: Row 5 is resolved following the move of MyBatis/resource ownership to dedicated modules.
4. **Audit Readiness**: `screenbuilder-module-source-inventory.md` and `apps/carbonet-app/pom.xml` are aligned on the exclusion and ownership story.

## Done / Not Done For 2026-04-15

### Done In This Wave

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` family is closed.
- All 5 tracker rows have a resolved or non-blocking decision.
- Root exclusion in `apps/carbonet-app` is verified.
- Cutover plan and source inventory are updated to reflect root-independent executable assembly.

### Explicitly Not Done In This Wave

- Physical deletion of the actual `.xml` or `.json` files from the legacy root (This belongs to `BUILDER_COMPATIBILITY_SHIM_REMOVAL` or actual cleanup turns).
- Closure of broader control-plane composition splits.
- Implementation of new builder features.

## Next Family After This Wave

The next active continuation family is:

- `BUILDER_COMPATIBILITY_SHIM_REMOVAL`

For the live continuation entry after this success, use the next family's plan and queue map.

## Canonical Success Phrase

`SUCCESS: builder resource ownership closure is now complete across all five rows, with row 5 resolved as DELETE_NOW following explicit root exclusion and fully moved MyBatis/resource ownership.`
