# Operator Day Ops Check Card

Generated on 2026-03-21 for the Resonance implementation phase.

## Purpose

This is a short day-operations card for the operator after the `01` handoff.

Use it to check:

- launch readiness
- mid-day health
- end-of-day handoff quality

## 1. Start Of Day

Confirm:

- `01` remains `HANDOFF`, not active reinterpretation
- launch order still begins with `05`, `06`, `08`, `09`
- launch board is ready
- short prompts and code-start checklists are available
- `05` and `09` reference the `03` template-line/theme-set/parity docs before fresh implementation starts

Open:

1. `docs/architecture/operator-quickstart-cheatsheet.md`
2. `docs/architecture/operator-lane-launch-routine.md`
3. `docs/architecture/operator-lane-launch-board-template.md`

## 2. Mid-Day

Confirm:

- at least one of `05`, `06`, `08`, or `09` is in `IN_PROGRESS`
- lanes are using receipt, status, or completion templates
- no lane has reopened `01` for routine implementation detail
- drift reports are being recorded instead of silently ignored
- custom admin route and EN variant issues are being handled inside `03` governance unless they truly break contract semantics

Use:

- `docs/architecture/implementation-handoff-health-checklist.md`
- `docs/architecture/implementation-drift-report-template.md`
- `docs/frontend/admin-template-parity-inventory.md`

## 3. End Of Day

Confirm:

- each active lane left a latest phrase
- each active lane updated current file family
- `HANDOFF READY` and `BLOCKED` messages are specific
- `07` only moved after `06` stabilized names
- next-day start order is clear
- any theme-set split or template-line exception was either documented as drift or escalated explicitly

Use:

- `docs/architecture/implementation-lane-status-template.md`
- `docs/architecture/implementation-lane-completion-template.md`
- `docs/architecture/operator-lane-launch-board-template.md`
- `docs/architecture/operator-end-of-day-closeout-card.md`

## 4. Reopen Rule

Only reopen `01` if the issue is contract-level.

Reference:

- `docs/architecture/contract-lane-reopen-protocol.md`

## Recommended Daily Phrases

Morning:

- `HANDOFF READY: implementation lanes may start from documented lane instructions; contract blocker count is 0.`

Mid-day:

- `HEALTH OK: implementation lanes are progressing under the contract handoff baseline.`

If needed:

- `HEALTH WARN: drift or ownership ambiguity detected; follow the blocker or reopen protocol.`
