# Builder Resource Row 1 Decision Note Template

## Purpose

Use this template only for row `1` of:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This file exists so the next owner can record one bounded row-`1` outcome without rewriting the note shape.

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-row1-delete-proof-checklist.md`
4. `docs/architecture/builder-resource-row1-explicit-shim-checklist.md`
5. `docs/architecture/builder-resource-row1-replacement-note-pattern.md`
6. `docs/architecture/builder-resource-review-framework-builder-compatibility-xml.md`

Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.

## Row

- row `1`
- `framework-builder compatibility mapper XML`

## Allowed Outcomes

Only three outcomes are valid for this template:

- keep `BLOCKS_CLOSEOUT`
- replace with one bounded `DELETE_NOW` note
- replace with one bounded `EXPLICIT_RESOURCE_SHIM` note

Do not use this template to reopen broad discovery.
On the current docs set, treat this template as historical-reference support because the live queue already records row `1` as `DELETE_NOW`.

## BLOCKS_CLOSEOUT Note

Use this when both the delete-proof branch and the explicit-shim branch fail on the current docs set.
This is now a historical comparison note, not the live row-`1` default.

Suggested note:

- `PARTIAL_DONE: framework-builder compatibility mapper XML remains BLOCKS_CLOSEOUT because the current docs set still lacks one bounded runtime-resolution delete-proof note and also lacks one named temporary shim reason with one explicit removal trigger.`

Suggested tracker wording:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement remains blocker.`

## DELETE_NOW Note

Use this only if the delete-proof checklist succeeds.
This is the current live row-`1` note shape.

Suggested note:

- `PARTIAL_DONE: framework-builder compatibility mapper XML now carries a bounded DELETE_NOW note because the current docs set says the executable/runtime path no longer resolves through any legacy root compatibility mapper line for this family, the XML resolves from the adapter module resource owner, and no remaining root copy is needed for runtime fallback.`

Suggested tracker wording:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement is deleted.`

## EXPLICIT_RESOURCE_SHIM Note

Use this only if the explicit-shim checklist succeeds.

Suggested note:

- `PARTIAL_DONE: framework-builder compatibility mapper XML now carries an explicit shim note because one named temporary legacy-root compatibility-mapper reason is documented together with one explicit removal trigger.`

Suggested tracker wording:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement is an explicit shim with one named reason.`

## Required Handoff Fields

Any row-`1` decision note should also carry:

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
