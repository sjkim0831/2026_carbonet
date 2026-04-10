# Builder Resource Review: Framework Contract Metadata Resource

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-ownership-status-tracker.md`

Use this review card only after the live family entry confirms row `2` is being checked as resolved historical support.
Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.
If this review changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

## Family

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Resource Family

- `framework contract metadata resource`

## Canonical Owner

- `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json`

## Competing Legacy Root Path

- `src/main/resources/framework/**`

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

## Current Docs-Only Decision

- current decision:
  - `DELETE_NOW`
- current decision shape:
  - dedicated module owner is explicit, and root canonical and runtime fallback readings are now reconciled
- why `DELETE_NOW` now succeeds:
  - `framework-builder-standard.md` now names `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json` as the canonical shared metadata source
  - `framework-builder-standard.md` now says framework contract metadata runtime lookup and packaging no longer depend on any root framework metadata copy
  - `screenbuilder-module-source-inventory.md` now says runtime lookup resolves from the dedicated module resource and packaging no longer depends on any root `framework/**` metadata copy
  - `screenbuilder-multimodule-cutover-plan.md` now says the live cutover path resolves runtime lookup and packaging through the dedicated contract-metadata module resource
- why not `EXPLICIT_RESOURCE_SHIM`:
  - no one named temporary reason for keeping root framework metadata is documented
  - no explicit removal trigger is documented for a remaining root metadata line

## Current Resolved Phrase

- `PARTIAL_DONE: framework contract metadata now carries a bounded DELETE_NOW note because the current docs set says runtime lookup and packaging no longer depend on any root framework metadata copy for this resource, and the dedicated contract-metadata module is the intended runtime owner.`

## Downgrade Limits

- do not reopen row `2` on the current docs set, because the bounded delete-proof bundle is now documented
- do not replace row `2` with explicit shim on the current docs set, because no one named temporary reason with one explicit removal trigger is documented
- reopen this row only if a later docs set reintroduces root framework metadata dependence

## Related Docs

- `docs/architecture/builder-resource-ownership-status-tracker.md`
- `docs/architecture/builder-resource-ownership-owner-checklist.md`
- `docs/architecture/builder-resource-ownership-priority-board.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/framework-builder-standard.md`
- `docs/architecture/builder-resource-row2-owner-packet.md`
- `docs/architecture/builder-resource-row2-delete-proof-checklist.md`
- `docs/architecture/builder-resource-row2-delete-proof-questions.md`
- `docs/architecture/builder-resource-row2-delete-proof-evidence-map.md`
- `docs/architecture/builder-resource-row2-candidate-sentence-ledger.md`
- `docs/architecture/builder-resource-row2-branch-flip-gate.md`
- `docs/architecture/builder-resource-row2-source-sentence-search-note.md`
- `docs/architecture/builder-resource-row2-replacement-note-pattern.md`
- `docs/architecture/builder-resource-row2-replacement-note-attempt.md`
- `docs/architecture/builder-resource-row2-explicit-shim-checklist.md`
- `docs/architecture/builder-resource-row2-explicit-shim-questions.md`
- `docs/architecture/builder-resource-row2-explicit-shim-evidence-map.md`
- `docs/architecture/builder-resource-row2-decision-note-template.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-row2-blocker-example.md`
