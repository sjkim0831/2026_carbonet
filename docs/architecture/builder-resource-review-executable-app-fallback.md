# Builder Resource Review: Executable App Resource Assembly Fallback

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card only after the live family entry confirms row `5` is the active target.
Treat the first two docs above as the `single live entry pair`.
If this review changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

## Family

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Resource Family

- `executable app resource assembly fallback`

## Canonical Owner

- `apps/carbonet-app` packaging plus dedicated builder module resources

## Competing Legacy Root Path

- implicit success through root duplicate availability
- likely review surface:
  - any builder flow that still works only because root resources remain present
  - app assembly behavior that does not fail even when module-owned resource assumptions are incomplete

## Why This Is The Likely Blocker Family

- this family is the blocker sink after narrower rows are reviewed
- the question is no longer just file ownership
- the question is whether executable app assembly still succeeds accidentally because the legacy root tree remains available

## Evidence To Check

- `docs/architecture/screenbuilder-module-source-inventory.md` says `apps/carbonet-app` still compiles broader runtime from the legacy root tree
- `docs/architecture/screenbuilder-module-source-inventory.md` also says the executable app jar must consume builder resources from dedicated modules instead of the legacy root resource tree
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md` describes `apps/carbonet-app` as still relying on the shared root tree for broader non-builder runtime closure during cutover
- `docs/architecture/builder-resource-ownership-status-tracker.md` row `5` should become the place where silent fallback is either disproven or recorded as the remaining blocker sink

## Decision Rule

Use `DELETE_NOW` only if the owner can say all of the following:

- executable app assembly no longer depends on root duplicate availability for builder resources
- dedicated module resources fully cover the builder resource needs of the executable app
- app success is no longer accidental or silently masked by the legacy root tree

Use `EXPLICIT_RESOURCE_SHIM` only if:

- one named executable-app fallback reason remains during transition
- that fallback is documented as temporary
- the next removal trigger is explicit

Use `BLOCKS_CLOSEOUT` if:

- executable app success still depends on silent root fallback
- the owner cannot distinguish successful module-owned assembly from accidental root-backed success
- narrower rows may be reviewed, but integration-level proof still fails here

## Closeout Condition

This review is closed only when the owner can leave one sentence of the form:

- `Executable app assembly resolves builder resources from dedicated module owners; remaining root-backed fallback is <deleted | explicit shim with one named reason | blocker>.`

## Provisional Read

Before integration-level proof is added, the safe default reading is:

- this row is the likely blocker sink
- it should usually stay `TODO` until rows `3` and `4` have narrowed the exact fallback surfaces
- once those rows are bounded, this row may become `BLOCKS_CLOSEOUT`

This is a review default, not a final decision.

## Default Handoff Phrase

If the owner reviewed this family boundary but did not yet complete integration-level proof, use:

- `PARTIAL_DONE: executable app assembly fallback remains the likely blocker sink, and integration-level proof is still needed before a delete-versus-shim verdict.`

## Required Handoff Output

- selected family:
  - `executable app resource assembly fallback`
- canonical owner path or owner assembly line
- competing root fallback behavior under review
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
