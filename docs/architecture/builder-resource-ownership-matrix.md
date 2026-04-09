# Builder Resource Ownership Matrix

## Goal

Provide one quick matrix for the `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` family.

Read first:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for
`BUILDER_RESOURCE_OWNERSHIP_CLOSURE`.

Use this when the question is:

- which builder-related resource path is canonical
- whether a root duplicate still exists
- whether the duplicate should be deleted or kept as an explicit shim

## Current Matrix

| Resource family | Canonical owner path | Legacy or competing path | Current status | Target treatment |
| --- | --- | --- | --- | --- |
| framework-builder compatibility mapper XML | `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/**` | root shared mapper/resource paths | `PARTIAL` | `DELETE_ROOT_DUPLICATE_WHEN_RUNTIME_NO_LONGER_NEEDS_IT` |
| framework contract metadata resource | `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json` | `src/main/resources/framework/**` duplicates or fallback copies | `PARTIAL` | `DELETE_ROOT_DUPLICATE_OR_MARK_TRANSITIONAL_EXPLICITLY` |
| builder observability metadata/resource family | approved builder observability module resources | root observability resource fallbacks | `PARTIAL` | `DELETE_ROOT_DUPLICATE_OR_PROVE_EXPLICIT_SHIM` |
| builder-owned root resource line excluded by app packaging | dedicated builder module resources | `src/main/resources/egovframework/mapper/com/feature/admin/**`, `src/main/resources/egovframework/mapper/com/platform/**`, `src/main/resources/framework/**` | `PARTIAL` | `DO_NOT_REINTRODUCE_ROOT_OWNERSHIP` |
| executable app resource assembly | `apps/carbonet-app` packaging plus module resources | implicit success through root duplicate availability | `PARTIAL` | `REMOVE_SILENT_FALLBACK` |

## Status Meanings

- `PARTIAL`
  - ownership intent is known, but silent fallback or duplicate-root ambiguity still exists

## Target Treatment Meanings

- `DELETE_ROOT_DUPLICATE_WHEN_RUNTIME_NO_LONGER_NEEDS_IT`
  - remove the legacy root resource after proving the module-owned resource resolves correctly
- `DELETE_ROOT_DUPLICATE_OR_MARK_TRANSITIONAL_EXPLICITLY`
  - either delete it or name the one remaining reason it still exists
- `DELETE_ROOT_DUPLICATE_OR_PROVE_EXPLICIT_SHIM`
  - do not leave a duplicate resource without an explicit shim explanation
- `DO_NOT_REINTRODUCE_ROOT_OWNERSHIP`
  - root paths must never become canonical again for this family
- `REMOVE_SILENT_FALLBACK`
  - app packaging must not succeed accidentally because a root duplicate still masks missing module ownership

## Decision Rule

If a builder resource family is not explicitly listed with a canonical owner, do not claim that resource ownership is closed.

If a root duplicate still exists, one of these must be true:

- it is deleted
- it is named as an explicit transitional shim
- it is still blocking closeout and the family stays open

Silent coexistence is not an acceptable result.
