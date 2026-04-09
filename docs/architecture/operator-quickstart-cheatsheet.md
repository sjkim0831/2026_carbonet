# Operator Quickstart Cheatsheet

Generated on 2026-03-21 for the Resonance handoff and execution phase.

## Purpose

This is the shortest operator reference after the `01` contract-lane handoff.

Use it when you need to:

- start a lane
- check lane health
- decide whether to hand off, block, or reopen `01`

## Start Order

Start in this order:

1. `05`
2. `06`
3. `08`
4. `09`
5. `07`

Then:

6. `04`
7. `10`
8. `03`
9. `02`

## Read First

1. `docs/architecture/implementation-handoff-document-index.md`
2. `docs/architecture/contract-lane-handoff-note.md`
3. `docs/architecture/implementation-priority-and-first-day-plan.md`
4. `docs/architecture/operator-lane-launch-routine.md`
5. `docs/architecture/operator-day-ops-check-card.md`
6. `docs/architecture/operator-first-hour-timeline.md`
7. `docs/architecture/operator-end-of-day-closeout-card.md`
8. `docs/architecture/operator-next-day-restart-card.md`

If the resumed family is `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`, also open:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair for that family.

For `05` and `09`, also open:

- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/frontend/admin-template-parity-inventory.md`

## Lane Start Prompts

Short English:

- `docs/architecture/implementation-lane-short-prompts.md`

Short Korean:

- `docs/architecture/implementation-lane-short-prompts-ko.md`

## Lane Checklists

First wave:

- `docs/architecture/lane-code-start-checklists-05-06-08-09.md`

Second wave:

- `docs/architecture/lane-code-start-checklists-07-10-04-03-02.md`

## Reporting Templates

- start receipt:
  - `docs/architecture/implementation-lane-handoff-receipt-template.md`
- progress status:
  - `docs/architecture/implementation-lane-status-template.md`
- completion:
  - `docs/architecture/implementation-lane-completion-template.md`
- drift:
  - `docs/architecture/implementation-drift-report-template.md`
- launch board:
  - `docs/architecture/operator-lane-launch-board-template.md`
- launch routine:
  - `docs/architecture/operator-lane-launch-routine.md`
- issue routing:
  - `docs/architecture/operator-issue-routing-card.md`
- command palette:
  - `docs/architecture/operator-command-palette-card.md`

## Health Check

Use:

- `docs/architecture/implementation-handoff-health-checklist.md`

## Reopen 01 Only If

- a new governed identity field is required
- context-key strip semantics are insufficient
- public/admin split cannot be represented
- template-line semantics break
- theme-set split semantics break
- custom admin route or EN variant governance cannot be represented inside the documented template-line rules
- screen-family-rule semantics break
- runtime-package or release trace semantics break

Reference:

- `docs/architecture/contract-lane-reopen-protocol.md`

## Official Phrases

Handoff:

- `HANDOFF READY: implementation lanes may start from documented lane instructions; contract blocker count is 0.`

Blocker:

- `BLOCKED: waiting for <lane or contract> because <specific reason>.`

Health good:

- `HEALTH OK: implementation lanes are progressing under the contract handoff baseline.`

Health warning:

- `HEALTH WARN: drift or ownership ambiguity detected; follow the blocker or reopen protocol.`
