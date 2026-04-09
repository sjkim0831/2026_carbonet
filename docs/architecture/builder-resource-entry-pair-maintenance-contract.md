# Builder Resource Entry-Pair Maintenance Contract

This contract defines how to maintain the single live entry pair for:

- `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`

## Single Live Entry Pair

1. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
2. `docs/architecture/builder-resource-ownership-queue-map.md`

## Same-Turn Update Rule

If any of the following changes, update both entry-pair documents in the same turn:

- blocker count
- active row
- row state
- next review target
- partial-closeout wording
- live continuation reading order

## Apply This Contract When Editing

- current closeout notes
- queue-map state
- status-tracker rows
- review-card decisions
- partial-closeout examples reused as live handoff text
- kickoff, handoff, restart, routing, or operator notes that change live continuation state

## Non-Goal

Do not force same-turn updates for wording-only cleanups that do not change continuation state.

## Reading Order

1. Read the current live state in `builder-resource-ownership-current-closeout.md`.
2. Confirm queue order in `builder-resource-ownership-queue-map.md`.
3. Then continue into the row-specific review card or partial closeout example.
