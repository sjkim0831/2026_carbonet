# Operator Issue Routing Card

Generated on 2026-03-21 for the Resonance execution phase.

## Purpose

This card tells the operator which template or protocol to use based on the
type of issue discovered during implementation.

## 1. Normal Progress Update

Use when:

- the lane is moving normally
- no major drift or blocker exists

Use:

- `docs/architecture/implementation-lane-status-template.md`

Phrase:

- `IN_PROGRESS` with the current target and latest phrase

## 2. Handoff To Another Lane

Use when:

- the current lane completed a meaningful scope
- another lane can continue without reopening `01`

Use:

- `docs/architecture/implementation-lane-completion-template.md`

Phrase:

- `HANDOFF READY: <target lane> can continue from <file or flow>; current blocker count is <n>.`

## 3. Blocked By Another Lane

Use when:

- the current lane cannot continue without another lane finishing something first

Use:

- `docs/architecture/implementation-lane-status-template.md`

Phrase:

- `BLOCKED: waiting for <lane or contract> because <specific reason>.`

## 4. Drift Without Contract Break

Use when:

- UI, parity, binding, package, or trace drift exists
- but the current contracts still make sense

Use:

- `docs/architecture/implementation-drift-report-template.md`

Phrase:

- `DRIFT REPORT: <lane> detected <drift family> on <flow>; next action is <action>.`

Special note:

- if the drift is limited to template-line coverage, theme-set evidence, custom admin routes, or EN variant handling, stay inside the `03` governance docs and do not reopen `01`

## 5. Reopen 01 Needed

Use when:

- a true contract-level gap exists
- a new governed identity field is needed
- public/admin split or trace semantics break
- theme-set split semantics or template-line governance can no longer represent the current custom route or EN variant behavior

Use:

- `docs/architecture/contract-lane-reopen-protocol.md`

Phrase:

- `BLOCKED: waiting for 01 because <specific contract-level reason>.`

## 6. Start Of A New Lane

Use when:

- a lane accepts handoff and begins work

Use:

- `docs/architecture/implementation-lane-handoff-receipt-template.md`

Phrase:

- `ACCEPTED: <lane> will continue from <file or flow> under existing governed identity rules.`

## 7. Daily Operator Overview

Use when:

- the operator needs a short daily summary or launch check

Use:

- `docs/architecture/operator-quickstart-cheatsheet.md`
- `docs/architecture/operator-first-hour-timeline.md`
- `docs/architecture/operator-day-ops-check-card.md`
- `docs/architecture/operator-end-of-day-closeout-card.md`

## Fast Rule

If the issue changes contracts, go to `reopen`.

If the issue does not change contracts, use `status`, `completion`, or `drift`
instead.
