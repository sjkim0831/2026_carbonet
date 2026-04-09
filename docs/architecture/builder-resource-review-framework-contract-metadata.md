# Builder Resource Review: Framework Contract Metadata Resource

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card only after the live family entry confirms row `2` is the active target.

## Family

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Resource Family

- `framework contract metadata resource`

## Canonical Owner

- `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json`

## Competing Legacy Root Path

- `src/main/resources/framework/**`

## Why This Is A Start-Now Review

- canonical owner is already explicit
- the duplicate line is narrow and easy to name
- this row directly tests whether builder metadata still relies on silent root fallback

## Evidence To Check

- `docs/architecture/screenbuilder-module-source-inventory.md` says contract-metadata ownership now lives in the dedicated module
- `docs/architecture/framework-builder-standard.md` still names `src/main/resources/framework/contracts/framework-contract-metadata.json` as the canonical shared metadata source and therefore must be interpreted carefully during this family
- `docs/architecture/builder-resource-ownership-status-tracker.md` row `2` should carry the final delete-versus-shim answer

## Decision Rule

Use `DELETE_NOW` only if the owner can say all of the following:

- the dedicated contract-metadata module is the intended runtime owner
- root `framework/**` resources are no longer needed for metadata lookup
- no app packaging or metadata regeneration path still depends on the legacy root copy

Use `EXPLICIT_RESOURCE_SHIM` only if:

- one temporary reason for retaining the root metadata path is written down
- the root path is treated as transitional rather than canonical
- the next removal trigger is explicit

Use `BLOCKS_CLOSEOUT` if:

- canonical ownership is split between the module path and root `framework/**`
- the owner cannot state whether runtime lookup still depends on the legacy root resource line
- documents still imply conflicting canonical answers for the same metadata resource

## Closeout Condition

This review is closed only when the owner can leave one sentence of the form:

- `Framework contract metadata resolves from the dedicated contract-metadata module; root framework metadata placement is <deleted | explicit shim with one named reason | blocker>.`

## Provisional Read

Before metadata lookup and app-assembly proof are fully aligned, the safe default reading is:

- canonical owner is already explicit at module level
- root `framework/**` ambiguity still exists in the documentation set
- the row should lean `BLOCKS_CLOSEOUT` unless the owner can explicitly prove `DELETE_NOW` or name one valid `EXPLICIT_RESOURCE_SHIM` reason

This is a review default, not a final decision.

## Default Handoff Phrase

If the owner reviewed this family but cannot yet close it, use:

- `PARTIAL_DONE: framework contract metadata has an explicit module owner, but root framework metadata fallback still needs a final delete-versus-shim verdict.`

## Required Handoff Output

- selected family:
  - `framework contract metadata resource`
- canonical owner path
- duplicate root path
- evidence checked
- closeout condition used
- duplicate decision
- blocker count contribution

## Related Docs

- `docs/architecture/builder-resource-ownership-status-tracker.md`
- `docs/architecture/builder-resource-ownership-owner-checklist.md`
- `docs/architecture/builder-resource-ownership-priority-board.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/framework-builder-standard.md`
