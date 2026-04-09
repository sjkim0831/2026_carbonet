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
5. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md` if the next owner is resuming the latest builder resource ownership state
6. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-kickoff.md` if the next owner is resuming builder resource ownership closure
7. `docs/architecture/builder-resource-ownership-status-tracker.md` if the next owner must resume builder resource ownership family status from yesterday
8. `docs/architecture/builder-resource-review-builder-observability.md` if the next review target is row `3` after the current provisional closeout is accepted

For this family, the single live entry pair is:

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`

If restart work changes blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

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
- any builder resource ownership closeout from yesterday left updated tracker rows and an explicit blocker count
- if rows `1` and `2` remain provisional blockers, the next review target for the resumed owner is clearly named

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
