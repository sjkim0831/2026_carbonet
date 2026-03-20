# Operator Next Day Restart Card

Generated on 2026-03-21 for the Resonance implementation phase.

## Purpose

This card helps the operator restart execution cleanly on the next day after the
first implementation wave has already begun.

## 1. Open First

Open in this order:

1. `docs/architecture/operator-end-of-day-closeout-card.md`
2. `docs/architecture/operator-lane-launch-board-template.md`
3. `docs/architecture/implementation-handoff-health-checklist.md`
4. `docs/architecture/operator-quickstart-cheatsheet.md`

## 2. Resume Order

Resume in this order:

1. unfinished `05`
2. unfinished `06`
3. unfinished `08`
4. unfinished `09`

Then start newly eligible lanes:

5. `07` if backend family names are stable
6. `04` if governed shell/frame boundary is stable
7. `03` if template or theme selector boundary is stable
8. `10` if runtime package attachment points are real
9. `02` if proposal outputs have real downstream consumers

## 3. Check Before Restart

Confirm:

- launch board has latest phrases from yesterday
- each active lane left either status or completion output
- any blocker still has a named owner lane
- no pending reopen request was left unresolved
- `05` and `09` still have a valid theme-set/template-line/parity baseline from `03`

## 4. Drift Check

Before starting new code work, confirm:

- no unreviewed high-severity drift report exists
- parity drift is not silently accumulating
- public/admin split is still preserved in active scopes
- custom admin routes and EN variants did not create a new undocumented visual-system branch overnight

Reference:

- `docs/architecture/implementation-drift-report-template.md`
- `docs/frontend/admin-template-parity-inventory.md`

## 5. Restart Phrase

- `RESTART OK: continue from the latest lane status and launch board without reopening 01.`

or

- `RESTART WARN: unresolved blocker or drift exists; review before starting new code work.`
