# Operator Command Palette Card

Generated on 2026-03-21 for the Resonance execution phase.

## Purpose

This card gives the operator fast command-style phrases for starting, checking,
handing off, blocking, and restarting lanes.

## Start Commands

- `05 시작`
- `06 시작`
- `08 시작`
- `09 시작`
- `07 대기`
- `04 대기`
- `10 대기`
- `03 대기`
- `02 대기`

Builder resource ownership reopen set:

- `builder-resource-ownership-current-closeout.md`
- `builder-resource-ownership-queue-map.md`

Use this as supporting maintenance-contract guidance only:

- `builder-resource-entry-pair-maintenance-contract.md`

Current active continuation target:

- row `5`
- `executable app resource assembly fallback`
- blocker-resolution state with row `5` as the remaining blocker
- `builder-resource-row5-owner-packet.md`
- compressed blocker control docs:
  - `builder-resource-blocker-source-sentence-matrix.md`
  - `builder-resource-blocker-source-trigger-matrix.md`
- canonical partial phrase:
  - `PARTIAL_DONE: builder resource ownership closure now carries bounded DELETE_NOW notes on rows 1 and 2, stronger non-blocker notes on rows 3 and 4, and row 5 remains the only BLOCKS_CLOSEOUT fallback blocker on the current docs set.`

## Handoff Commands

- `05 handoff`
- `06 handoff`
- `08 handoff`
- `09 handoff`
- `03 handoff 확인`

Use with:

- `HANDOFF READY: <target lane> can continue from <file or flow>; current blocker count is <n>.`
- `HANDOFF READY: 05 and 09 may continue from template-line/theme-set/parity governance docs; blocker count is 0 for current admin/public split rules.`

## Blocker Commands

- `05 blocked`
- `06 blocked`
- `08 blocked`
- `09 blocked`

Use with:

- `BLOCKED: waiting for <lane or contract> because <specific reason>.`

## Drift Commands

- `05 drift`
- `06 drift`
- `08 drift`
- `09 drift`
- `03 drift 확인`

Use with:

- `docs/architecture/implementation-drift-report-template.md`
- `docs/frontend/admin-template-parity-inventory.md`

## Health Commands

- `health check`
- `health ok`
- `health warn`

Use with:

- `docs/architecture/implementation-handoff-health-checklist.md`

## Restart Commands

- `다음날 재시작`
- `05 재개`
- `06 재개`
- `08 재개`
- `09 재개`
- `builder resource ownership 재개`

Use with:

- `docs/architecture/operator-next-day-restart-card.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat the last two docs above as the single live entry pair for `builder resource ownership 재개`.
Use `builder-resource-entry-pair-maintenance-contract.md` as supporting guidance when continuation state changes.

If the restart command results in a changed blocker count, active row, next review target, or partial-closeout wording, update both entry-pair docs in the same turn.

## Reopen Command

- `01 reopen`

Use only with:

- `docs/architecture/contract-lane-reopen-protocol.md`

## Reference

- `docs/architecture/operator-quickstart-cheatsheet.md`
- `docs/architecture/operator-lane-launch-routine.md`
- `docs/architecture/operator-lane-launch-board-template.md`
