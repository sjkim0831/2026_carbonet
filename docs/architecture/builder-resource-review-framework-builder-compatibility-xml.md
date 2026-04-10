# Builder Resource Review: Framework-Builder Compatibility Mapper XML

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card as resolved-row support for row `1`, not as the current active-target opener.
Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.
If this review changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

## Family

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Resource Family

- `framework-builder compatibility mapper XML`

## Canonical Owner

- `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/**`

## Competing Legacy Root Path

- `src/main/resources/egovframework/mapper/com/feature/admin/**`

## Why This Review Still Matters

- canonical owner is already explicit
- ambiguity is now limited to resource-resolution behavior
- this row is the resolved delete-versus-shim example for:
  - `DELETE_NOW`
  - `EXPLICIT_RESOURCE_SHIM`
  - `BLOCKS_CLOSEOUT`

## Evidence To Check

- `docs/architecture/screenbuilder-module-source-inventory.md` says the builder-owned compatibility XML already lives under the adapter module resource path
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md` now says `FrameworkBuilderCompatibilityMapper` Java and XML ownership are finalized for the selected row-`1` family
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

## Historical Review Default

Before the current delete-proof bundle was added, the safe default reading was:

- canonical owner is already explicit
- root duplicate status is still unresolved
- the row should lean `BLOCKS_CLOSEOUT` unless the owner can explicitly prove `DELETE_NOW` or name one valid `EXPLICIT_RESOURCE_SHIM` reason

This is retained only as historical comparison context, not the live row-`1` state.

## Default Handoff Phrase

If a later doc regresses this family and the owner cannot yet close it again, use:

- `PARTIAL_DONE: framework-builder compatibility mapper XML has an explicit module owner, but legacy root mapper resolution still needs a final delete-versus-shim verdict.`

## Current Docs-Only Decision

- current decision:
  - `DELETE_NOW`
- current decision shape:
  - bounded delete-proof is now documented for the selected compatibility mapper family
- why `DELETE_NOW` now applies:
  - `screenbuilder-module-source-inventory.md` names `modules/screenbuilder-carbonet-adapter/.../FrameworkBuilderCompatibilityMapper.xml` as the module-owned resource path
  - `screenbuilder-module-source-inventory.md` says builder-owned resource paths now live under module resources and that `apps/carbonet-app` explicitly excludes builder-owned root resources so the executable app jar must consume them from the dedicated builder modules instead of the legacy root resource tree
  - `screenbuilder-multimodule-cutover-plan.md` now says `FrameworkBuilderCompatibilityMapper` Java and XML ownership are finalized so the adapter jar no longer depends on shared root resource placement assumptions
- why not `EXPLICIT_RESOURCE_SHIM` yet:
  - no one named transition-only reason for retaining a legacy root compatibility mapper line is documented
  - no explicit removal trigger is documented for such a root mapper line
- why `BLOCKS_CLOSEOUT` no longer applies on the current docs set:
  - the current docs baseline now does provide a bounded runtime-resolution sentence and a bounded no-fallback-needed sentence for the selected mapper family

## Next Decision Gate

Do not reopen broad structure or ownership discovery for this row unless a later docs set regresses the current delete-proof bundle.
If regression review is ever needed again, ask only one of these two bounded follow-up questions:

- `DELETE_NOW` gate:
  - is there one bounded note proving the executable/runtime path no longer resolves through any legacy root compatibility mapper line for this family?
- `EXPLICIT_RESOURCE_SHIM` gate:
  - is there one named transition-only reason that still keeps a root compatibility mapper line alive, with one explicit removal trigger?

On the current docs set, the delete-proof note now exists, so this row should be recorded as `DELETE_NOW`.

Use this bounded follow-up order:

1. `docs/architecture/builder-resource-row1-owner-packet.md`
2. `docs/architecture/builder-resource-row1-delete-proof-checklist.md`
3. `docs/architecture/builder-resource-row1-delete-proof-questions.md`
4. `docs/architecture/builder-resource-row1-delete-proof-evidence-map.md`
5. `docs/architecture/builder-resource-row1-candidate-sentence-ledger.md`
6. `docs/architecture/builder-resource-row1-replacement-note-pattern.md`
7. `docs/architecture/builder-resource-row1-replacement-note-attempt.md`
8. `docs/architecture/builder-resource-row1-explicit-shim-checklist.md`
9. `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
10. `docs/architecture/builder-resource-row1-explicit-shim-evidence-map.md`
11. `docs/architecture/builder-resource-row1-decision-note-template.md`
12. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row1-delete-now-example.md`
13. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row1-blocker-example.md`

Do not attempt the shim branch first unless a later docs set reopens the delete-proof branch and one named temporary shim reason with one removal trigger is actually documented.

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
- `docs/architecture/builder-resource-row1-owner-packet.md`
- `docs/architecture/builder-resource-row1-delete-proof-checklist.md`
- `docs/architecture/builder-resource-row1-delete-proof-questions.md`
- `docs/architecture/builder-resource-row1-delete-proof-evidence-map.md`
- `docs/architecture/builder-resource-row1-candidate-sentence-ledger.md`
- `docs/architecture/builder-resource-row1-replacement-note-attempt.md`
- `docs/architecture/builder-resource-row1-explicit-shim-checklist.md`
- `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
- `docs/architecture/builder-resource-row1-explicit-shim-evidence-map.md`
- `docs/architecture/builder-resource-row1-decision-note-template.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row1-delete-now-example.md`
- `docs/architecture/builder-resource-row1-replacement-note-pattern.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row1-blocker-example.md`
