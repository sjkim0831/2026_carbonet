# Builder Resource Row 1 Replacement Note Pattern

## Purpose

Use this note only for row `1` of:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This pattern now exists as resolved-row support so a later owner can verify or, only if needed, regress row `1`
from its current `DELETE_NOW` note without reopening broad discovery.

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-review-framework-builder-compatibility-xml.md`
4. `docs/architecture/builder-resource-row1-delete-proof-checklist.md`
5. `docs/architecture/builder-resource-row1-delete-proof-questions.md`
6. `docs/architecture/builder-resource-row1-explicit-shim-checklist.md`
7. `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
8. `docs/architecture/builder-resource-row1-decision-note-template.md`
9. `docs/architecture/screenbuilder-module-source-inventory.md`
10. `docs/architecture/screenbuilder-multimodule-cutover-plan.md`

Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.

## Row

- row `1`
- `framework-builder compatibility mapper XML`

## Allowed Replacement Shapes

Only two replacement-note shapes are valid from the current blocker state:

- one bounded `DELETE_NOW` note
- one bounded `EXPLICIT_RESOURCE_SHIM` note

If neither note can be written from a later regressed docs set, reopen row `1` conservatively.

## Use This Pattern For One Thing Only

- use this template only if a later docs set reintroduces root runtime dependence and adds one exact missing sentence bundle for row `1`
- do not reopen broad ownership discovery
- do not change blocker count or active blocker-resolution target unless one of the two bounded note shapes below is actually documented

## DELETE_NOW Pattern

Use this only if one later doc can say all of the following in one bounded note:

- the executable/runtime path no longer resolves through any legacy root compatibility mapper line for this family
- `FrameworkBuilderCompatibilityMapper.xml` resolves from the adapter module resource owner
- no remaining root duplicate is needed for unresolved runtime fallback

Suggested sentence:

- `DELETE_READY: framework-builder compatibility mapper XML now resolves from the adapter module resource owner, and the current runtime path no longer depends on any legacy root compatibility mapper line for this family.`

Suggested tracker/result wording:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement is deleted.`

## EXPLICIT_RESOURCE_SHIM Pattern

Use this only if one later doc can say all of the following in one bounded note:

- one named transition-only reason still keeps a root compatibility mapper line alive
- that root mapper line is explicitly temporary
- one explicit removal trigger is documented

Suggested sentence:

- `SHIM_READY: framework-builder compatibility mapper XML still keeps one legacy root mapper line for <named transition reason>; this is temporary and should be removed when <explicit removal trigger>.`

Suggested tracker/result wording:

- `Framework-builder compatibility mapper XML resolves from the adapter module resource owner; legacy root mapper placement is an explicit shim with one named reason.`

## Not Allowed

Do not treat these as sufficient:

- restating module ownership only
- restating that audit scripts fail on reintroduction
- restating that ownership must be finalized
- broad statements about cutover being partial

Those statements explain why a future regression could happen, but they do not replace the current `DELETE_NOW` result.

## Current Baseline

The current docs set already supports these statements:

- module-owned `FrameworkBuilderCompatibilityMapper.xml` is named
- legacy builder resource reintroduction is audit-blocked
- `apps/carbonet-app` explicitly excludes builder-owned root resources for this builder-owned family
- `FrameworkBuilderCompatibilityMapper` Java and XML ownership are finalized for the selected row-`1` family
- no named temporary shim reason with removal trigger is documented

So the current row stays:

- `DELETE_NOW`

## Immediate Next Attempt

- preferred next move:
  - keep the current bounded `DELETE_NOW` note unless a later docs set regresses it
- first open:
  - `docs/architecture/builder-resource-row1-delete-proof-checklist.md`
  - `docs/architecture/builder-resource-row1-delete-proof-questions.md`
- if that proof cannot be written:
  - open `docs/architecture/builder-resource-row1-explicit-shim-checklist.md`
  - `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
- if that shim proof also cannot be written:
  - stop and keep row `1` at `DELETE_NOW` unless a later regression note is explicitly documented
- do not invent a shim reason unless one named temporary reason and one removal trigger are both documented
- once one branch is chosen:
  - use `docs/architecture/builder-resource-row1-decision-note-template.md` to write the actual handoff/tracker note
