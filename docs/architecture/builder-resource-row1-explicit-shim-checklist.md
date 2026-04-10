# Builder Resource Row 1 Explicit-Shim Checklist

## Purpose

Use this checklist only for row `1` of:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

This checklist narrows the `EXPLICIT_RESOURCE_SHIM` attempt for row `1` to one bounded question:

- can the current docs set name one temporary legacy-root compatibility-mapper reason and one removal trigger?

On the current docs set this is historical/regression-only support, because row `1` already closes as `DELETE_NOW`.
If a later docs set reintroduces root runtime dependence, reopen this checklist; otherwise do not treat it as a live blocker path.

## Read First

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`
3. `docs/architecture/builder-resource-row1-replacement-note-pattern.md`
4. `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
5. `docs/architecture/builder-resource-row1-explicit-shim-evidence-map.md`
6. `docs/architecture/builder-resource-review-framework-builder-compatibility-xml.md`
7. `docs/architecture/screenbuilder-module-source-inventory.md`
8. `docs/architecture/screenbuilder-multimodule-cutover-plan.md`

Treat the first two docs above as the `single live entry pair`.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`
only as supporting guidance when continuation state changes.

## Row

- row `1`
- `framework-builder compatibility mapper XML`

## Required Shim Sentence

To replace the blocker state with `EXPLICIT_RESOURCE_SHIM`, one bounded note must say all of the following together:

- one named transition-only reason still keeps a legacy root compatibility mapper line alive
- that root mapper line is explicitly temporary
- one explicit removal trigger is documented

## Evidence Shape

Treat the `EXPLICIT_RESOURCE_SHIM` attempt as valid only if the docs set provides:

- one named temporary reason
- one explicit temporary-life statement
- one removal-trigger statement

Those three parts may come from more than one doc, but the replacement note must combine them into one bounded conclusion.

## Not Enough

Do not treat any of these as shim-proof by themselves:

- ownership still must be finalized
- cutover remains partial
- the adapter jar still depends on shared root placement assumptions
- broader runtime closure still exists during cutover

Those statements explain why the row is blocked, but they do not name one valid temporary shim.

## Current Docs-Only Failure Point

The current docs set already supports:

- module-owned `FrameworkBuilderCompatibilityMapper.xml`
- `apps/carbonet-app` explicitly excludes builder-owned root resources for this builder-owned family
- `FrameworkBuilderCompatibilityMapper` Java and XML ownership are finalized for the selected row-`1` family

The current docs set still does not support:

- one named transition-only reason for a legacy root compatibility mapper line
- one explicit removal trigger for that same temporary reason

So the current `EXPLICIT_RESOURCE_SHIM` attempt fails on those missing statements.

Current proof-question split:

- Q1:
  - named temporary reason is missing
- Q2:
  - explicit temporary-life statement is missing
- Q3:
  - removal trigger is missing

See:

- `docs/architecture/builder-resource-row1-explicit-shim-questions.md`
- `docs/architecture/builder-resource-row1-explicit-shim-evidence-map.md`

## Suggested Shim Sentence

Use this only if a later doc supports it directly:

- `SHIM_READY: framework-builder compatibility mapper XML still keeps one legacy root mapper line for <named transition reason>; this is temporary and should be removed when <explicit removal trigger>.`

## Immediate Regression Rule

- if the named temporary reason or the removal trigger is still absent:
  - keep row `1` at `DELETE_NOW`
- if both the named temporary reason and the removal trigger appear:
  - write one bounded `EXPLICIT_RESOURCE_SHIM` replacement note
- do not substitute broad cutover-progress wording for the missing temporary-reason or removal-trigger statements
