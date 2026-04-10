# Builder Resource Row 2 Decision Note Template

## Purpose

Use this template only for row `2` of:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This file exists so the next owner can record one bounded row-`2` outcome without rewriting the note shape.

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-row2-delete-proof-checklist.md`
4. `docs/architecture/builder-resource-row2-explicit-shim-checklist.md`
5. `docs/architecture/builder-resource-row2-owner-packet.md`
6. `docs/architecture/builder-resource-review-framework-contract-metadata.md`

Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.

## Row

- row `2`
- `framework contract metadata resource`

## Allowed Outcomes

Only three outcomes are valid for this template:

- keep `BLOCKS_CLOSEOUT`
- replace with one bounded `DELETE_NOW` note
- replace with one bounded `EXPLICIT_RESOURCE_SHIM` note

Do not use this template to reopen broad discovery.
On the current docs set, treat this template as historical-reference support because the live queue already records row `2` as `DELETE_NOW`.

## BLOCKS_CLOSEOUT Note

Use this when both the delete-proof branch and the explicit-shim branch fail on a later regressed docs set.

Suggested note:

- `PARTIAL_DONE: framework contract metadata remains BLOCKS_CLOSEOUT because the current docs set still lacks one bounded runtime-and-packaging delete-proof note and also lacks one named temporary shim reason with one explicit removal trigger.`

Suggested tracker wording:

- `Framework contract metadata resolves from the dedicated contract-metadata module; root framework metadata placement remains blocker.`

## DELETE_NOW Note

Use this only if the delete-proof checklist succeeds.
This is the current live row-`2` note shape.

Suggested note:

- `PARTIAL_DONE: framework contract metadata now carries a bounded DELETE_NOW note because the current docs set says runtime lookup and packaging no longer depend on any root framework metadata copy for this resource, and the dedicated contract-metadata module is the intended runtime owner.`

Suggested tracker wording:

- `Framework contract metadata resolves from the dedicated contract-metadata module; root framework metadata placement is deleted.`

## EXPLICIT_RESOURCE_SHIM Note

Use this only if the explicit-shim checklist succeeds.

Suggested note:

- `PARTIAL_DONE: framework contract metadata now carries an explicit shim note because one named temporary root-framework-metadata reason is documented together with one explicit removal trigger.`

Suggested tracker wording:

- `Framework contract metadata resolves from the dedicated contract-metadata module; root framework metadata placement is an explicit shim with one named reason.`

## Required Handoff Fields

Any row-`2` decision note should also carry:

- selected family
- canonical owner path
- duplicate root path
- evidence checked
- chosen outcome
- blocker count impact

## Immediate Rule

- if neither checklist succeeds:
  - treat that result as historical comparison only on the current docs set
  - use the `BLOCKS_CLOSEOUT` note
- if the delete-proof checklist succeeds:
  - use the `DELETE_NOW` note
- if the delete-proof checklist fails but the explicit-shim checklist succeeds:
  - use the `EXPLICIT_RESOURCE_SHIM` note
