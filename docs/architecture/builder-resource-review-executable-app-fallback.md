# Builder Resource Review: Executable App Resource Assembly Fallback

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card only after the live family entry confirms row `5` has become the active target again.
Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.
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
- `docs/architecture/builder-resource-executable-app-evidence-checklist.md` should be used to narrow the broad blocker-sink family into a bounded integration-proof set before row `5` is upgraded

Current bounded docs-only read:

- builder-owned root resource exclusion is already recorded on row `4` and should not be re-litigated here
- the remaining row-`5` ambiguity is whether executable-app success can be attributed cleanly to dedicated module builder resources while the app still compiles broader runtime from the legacy root source/resource layout during cutover
- this is therefore an executable-assembly distinction problem, not a newly discovered root resource surface problem

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
- it should not be reopened as broad `TODO` on the current docs set
- rows `3` and `4` already narrowed the fallback surfaces enough for blocker-grade review
- current docs-only baseline already supports `BLOCKS_CLOSEOUT`

This is a review default, not a final decision.

## Default Handoff Phrase

If the owner reviewed this family boundary but did not yet complete integration-level proof, use:

- `PARTIAL_DONE: executable app assembly fallback remains the likely blocker sink, and the current docs-only read is narrowed to broader legacy-root-backed runtime closure during cutover plus unresolved distinction between dedicated-module builder-resource assembly and mixed executable assembly success; integration-level proof is still needed before a delete-versus-shim verdict.`

## Current Docs-Only Decision

- current decision:
  - `BLOCKS_CLOSEOUT`
- current decision shape:
  - blocker-grade mixed executable-assembly dependency is now documented
- why not `EXPLICIT_RESOURCE_SHIM` yet:
  - no one named executable-app fallback reason is documented as a temporary shim
- why `BLOCKS_CLOSEOUT` now applies:
  - `screenbuilder-module-source-inventory.md` says the executable app jar must consume builder resources from dedicated builder modules instead of the legacy root resource tree
  - `screenbuilder-multimodule-cutover-plan.md` still says adapter and app modules rely on the shared root tree for broader non-builder runtime closure during cutover and that MyBatis mapper/resource ownership is only partially moved
  - together those statements mean the current docs baseline still cannot distinguish dedicated-module builder-resource assembly success from mixed executable assembly success under the shared-root closure baseline

## Next Decision Gate

The next owner should not reopen broad fallback discussion.
This row is already promoted. Only ask one of these two bounded follow-up questions:

- `EXPLICIT_RESOURCE_SHIM` fallback question:
  - can the mixed executable-assembly dependency be restated as one named temporary shim reason with one explicit removal trigger?
- blocker-resolution question:
  - can a later note prove the shared-root-tree dependency is removed so executable-app success is attributable cleanly to dedicated-module builder resources?

Current docs-only search result:

- broader runtime closure during cutover is documented
- one named temporary executable-app shim reason with one explicit removal trigger is not yet documented
- one narrow blocker-side candidate is documented:
  - `apps/carbonet-app` still compiles broader runtime from the legacy root source/resource layout
  - `adapter and app modules still rely on the shared root tree for broader non-builder runtime closure during cutover`
- `screenbuilder-module-source-inventory.md` also says the executable app jar must consume builder resources from dedicated builder modules instead of the legacy root resource tree
- `screenbuilder-multimodule-cutover-plan.md` also says MyBatis mapper/resource ownership is only partially moved, so the adapter still assumes shared root runtime wiring for part of the flow

So the row should not be promoted to `EXPLICIT_RESOURCE_SHIM` on the current document set alone.
It should now be treated as `BLOCKS_CLOSEOUT`, because the current docs set both requires dedicated-module builder-resource consumption and still documents shared-root runtime closure for part of the executable assembly path.

Current downgrade limits:

- do not downgrade this row to delete-proof on the current docs set, because broader runtime still compiles from the legacy root source/resource layout
- do not downgrade this row to explicit shim on the current docs set, because no one named temporary executable-app fallback reason with one explicit removal trigger is documented
- use `docs/architecture/builder-resource-row5-source-sentence-search-note.md` before rerunning the same docs-only source scan
- the next valid move is therefore watched-source change detection plus exact missing-sentence confirmation
- do not draft another bounded replacement note unless a watched source doc changed and adds one exact missing sentence bundle that supports that note

Use this bounded follow-up order:

1. `docs/architecture/builder-resource-row5-owner-packet.md`
2. `docs/architecture/builder-resource-row5-delete-proof-checklist.md`
3. `docs/architecture/builder-resource-row5-delete-proof-questions.md`
4. `docs/architecture/builder-resource-row5-delete-proof-evidence-map.md`
5. `docs/architecture/builder-resource-row5-candidate-sentence-ledger.md`
6. `docs/architecture/builder-resource-row5-source-sentence-search-note.md`
7. `docs/architecture/builder-resource-row5-replacement-note-pattern.md`
8. `docs/architecture/builder-resource-row5-replacement-note-attempt.md`
9. `docs/architecture/builder-resource-row5-explicit-shim-checklist.md`
10. `docs/architecture/builder-resource-row5-explicit-shim-questions.md`
11. `docs/architecture/builder-resource-row5-explicit-shim-evidence-map.md`
12. `docs/architecture/builder-resource-row5-decision-note-template.md`
13. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row5-blocker-example.md`
14. `docs/architecture/builder-resource-review-executable-app-fallback.md`
15. `docs/architecture/builder-resource-executable-app-evidence-checklist.md`
16. `docs/architecture/screenbuilder-module-source-inventory.md`
17. `docs/architecture/screenbuilder-multimodule-cutover-plan.md`

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
- `docs/architecture/builder-resource-executable-app-evidence-checklist.md`
- `docs/architecture/builder-resource-row5-owner-packet.md`
- `docs/architecture/builder-resource-row5-delete-proof-checklist.md`
- `docs/architecture/builder-resource-row5-delete-proof-questions.md`
- `docs/architecture/builder-resource-row5-delete-proof-evidence-map.md`
- `docs/architecture/builder-resource-row5-candidate-sentence-ledger.md`
- `docs/architecture/builder-resource-row5-source-sentence-search-note.md`
- `docs/architecture/builder-resource-row5-replacement-note-pattern.md`
- `docs/architecture/builder-resource-row5-replacement-note-attempt.md`
- `docs/architecture/builder-resource-row5-explicit-shim-checklist.md`
- `docs/architecture/builder-resource-row5-explicit-shim-questions.md`
- `docs/architecture/builder-resource-row5-explicit-shim-evidence-map.md`
- `docs/architecture/builder-resource-row5-decision-note-template.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row5-blocker-example.md`
