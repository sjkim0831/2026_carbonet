# Builder Resource Review: Framework-Builder Compatibility Mapper XML

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card only after the live family entry confirms row `1` is the active target.
Treat the first two docs above as the `single live entry pair`.
If this review changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

## Family

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Resource Family

- `framework-builder compatibility mapper XML`

## Canonical Owner

- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/**`

## Competing Legacy Root Path

- `src/main/resources/egovframework/mapper/com/feature/admin/**`

## Why This Is A Start-Now Review

- canonical owner is already explicit
- ambiguity is now limited to resource-resolution behavior
- this row is the cleanest first decision between:
  - `DELETE_NOW`
  - `EXPLICIT_RESOURCE_SHIM`
  - `BLOCKS_CLOSEOUT`

## Evidence To Check

- `docs/architecture/screenbuilder-module-source-inventory.md` says the builder-owned compatibility XML already lives under the adapter module resource path
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md` says adapter MyBatis/resource ownership is still partial and compatibility mapper XML ownership must be finalized
- `docs/architecture/builder-resource-ownership-status-tracker.md` row `1` should carry the same ownership answer

## Decision Rule

Use `DELETE_NOW` only if the owner can say all of the following without reopening structure governance:

- the module XML is the only intended owner
- the executable app is not succeeding because a duplicate root mapper XML still happens to exist
- no remaining root copy is needed for unresolved runtime fallback

Use `EXPLICIT_RESOURCE_SHIM` only if:

- one named transition reason is still active
- the root duplicate is described as temporary
- the next removal condition is explicit

Use `BLOCKS_CLOSEOUT` if:

- app/resource resolution still depends on the root mapper line
- module ownership and runtime assembly do not yet tell the same story
- the owner cannot prove whether the root duplicate is still masking missing module wiring

## Closeout Condition

This review is closed only when the owner can leave one sentence of the form:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement is <deleted | explicit shim with one named reason | blocker>.`

## Provisional Read

Before runtime-proof or app-assembly proof is added, the safe default reading is:

- canonical owner is already explicit
- root duplicate status is still unresolved
- the row should lean `BLOCKS_CLOSEOUT` unless the owner can explicitly prove `DELETE_NOW` or name one valid `EXPLICIT_RESOURCE_SHIM` reason

This is a review default, not a final decision.

## Default Handoff Phrase

If the owner reviewed this family but cannot yet close it, use:

- `PARTIAL_DONE: framework-builder compatibility mapper XML has an explicit module owner, but legacy root mapper resolution still needs a final delete-versus-shim verdict.`

## Required Handoff Output

- selected family:
  - `framework-builder compatibility mapper XML`
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
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`
