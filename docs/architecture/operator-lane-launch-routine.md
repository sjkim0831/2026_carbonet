# Operator Lane Launch Routine

Generated on 2026-03-21 for the Resonance execution kickoff phase.

## Purpose

This routine shows the operator how to move from `01` handoff into active
multi-lane execution without skipping status or ownership tracking.

## Routine

### 1. Open The Quick Entry Docs

Open in this order:

1. `docs/architecture/operator-quickstart-cheatsheet.md`
2. `docs/architecture/implementation-handoff-document-index.md`
3. `docs/architecture/operator-lane-launch-board-template.md`

If the resumed family is `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`, also open:

4. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
5. `docs/architecture/builder-resource-ownership-queue-map.md`

Treat these two docs as the single live entry pair for that family.

If launch-time review changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

### 2. Launch The First Wave

Start:

1. `05`
2. `06`
3. `08`
4. `09`

Do not start `07` before `06` stabilizes names.

### 3. Record Receipt

For each lane that starts:

- open `docs/architecture/implementation-lane-handoff-receipt-template.md`
- record `ACCEPTED`, `ACCEPTED_WITH_NOTE`, or `BLOCKED`
- copy the result to the launch board
- for `05` and `09`, also confirm `03` template-line/theme-set/parity docs are opened before acceptance

### 4. Track Status

For each lane that is in motion:

- update `docs/architecture/implementation-lane-status-template.md`
- keep governed identity keys visible
- keep the latest phrase current

### 5. Handle Drift

If a lane sees parity, UI, binding, package, or trace drift:

- use `docs/architecture/implementation-drift-report-template.md`
- decide whether it is:
  - lane-local repair
  - handoff to another lane
  - blocker
  - `01` reopen case
- keep template-line coverage, theme-set evidence, custom admin route, and EN variant issues inside `03` governance unless the contracts themselves no longer fit

### 6. Handle Completion

When a lane finishes a meaningful scope:

- use `docs/architecture/implementation-lane-completion-template.md`
- if another lane can continue, leave `HANDOFF READY`
- if the scope is fully done, leave `DONE`
- for builder resource-ownership continuation, do not skip the current closeout or queue map when preparing the handoff phrase
- for builder resource-ownership continuation, treat the current closeout and queue map as the single live entry pair
- if completion changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn

### 7. Monitor Health

At regular intervals:

- use `docs/architecture/implementation-handoff-health-checklist.md`
- confirm lanes still follow the handoff baseline
- for `05` and `09`, confirm theme-set split decisions still match documented parity evidence

### 8. Reopen 01 Only If Needed

Use:

- `docs/architecture/contract-lane-reopen-protocol.md`

Reopen only for contract-level problems, not routine code work.

## Recommended Launch Phrase

- `HANDOFF READY: implementation lanes may start from documented lane instructions; contract blocker count is 0.`

## Recommended Health Phrase

- `HEALTH OK: implementation lanes are progressing under the contract handoff baseline.`
