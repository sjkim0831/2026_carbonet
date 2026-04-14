# Implementation Handoff Document Index

Generated on 2026-03-21 for the Resonance implementation kickoff.

## Purpose

This is the shortest entry page for implementation lanes after the `01`
contract-lane handoff.

If a lane does not know where to start reading, start here.

For the shortest operator-facing summary, see:

- `docs/architecture/operator-quickstart-cheatsheet.md`
- `docs/architecture/operator-lane-launch-routine.md`
- `docs/architecture/operator-day-ops-check-card.md`
- `docs/architecture/operator-first-hour-timeline.md`
- `docs/architecture/operator-end-of-day-closeout-card.md`
- `docs/architecture/operator-next-day-restart-card.md`
- `docs/architecture/operator-command-palette-card.md`

## Read Order

### 1. Executive Summary

- `docs/architecture/contract-lane-executive-summary.md`

### 1-A. Current Routing And Continuity Baseline

- `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
- `docs/ai/00-governance/ai-orchestration-doc-retention-inventory.md`
- `docs/architecture/high-parallel-account-orchestration-playbook.md`
- `docs/operations/account-relogin-continuity-playbook.md`

### 2. Handoff Decision

- `docs/architecture/contract-lane-handoff-note.md`
- `docs/architecture/contract-lane-final-completion-checklist.md`
- `docs/architecture/implementation-blocker-audit.md`
- `docs/architecture/contract-lane-reopen-protocol.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-structure-wave-closeout.md` when the current question is whether the builder structure wave itself is already closed

### 3. Global Execution Order

- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/ai/80-skills/resonance-10-session-assignment.md`
- `docs/architecture/tmux-multi-account-delivery-playbook.md`

Treat the routing matrix and high-parallel playbook as the first entry gate.
Treat `resonance-10-session-assignment.md` and `tmux-multi-account-delivery-playbook.md`
as conditional operator aids rather than the default first read.

### 4. Lane-Specific Start

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/lane-start-instructions-05-06-08-09.md`
- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-kickoff.md` when the active builder family is builder resource ownership closure
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md` when builder resource ownership closure should resume from the current provisional state
- `docs/architecture/builder-resource-ownership-queue-map.md` for the shortest row-by-row builder resource ownership queue

For `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`, treat these as the single live entry pair:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Use this as supporting maintenance-contract guidance only:

- `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`

Current active continuation target:

- row `5`
- `executable app resource assembly fallback`
- blocker-resolution state with row `5` as the remaining blocker
- `docs/architecture/builder-resource-row5-owner-packet.md`
- compressed blocker control docs:
  - `docs/architecture/builder-resource-blocker-source-sentence-matrix.md`
  - `docs/architecture/builder-resource-blocker-source-trigger-matrix.md`
- canonical partial phrase:
  - `PARTIAL_DONE: builder resource ownership closure now carries bounded DELETE_NOW notes on rows 1 and 2, stronger non-blocker notes on rows 3 and 4, and row 5 remains the only BLOCKS_CLOSEOUT fallback blocker on the current docs set.`

If blocker count, active row, next review target, or partial-closeout wording changes, update both entry-pair docs in the same turn before handing off to row-specific material.

### 4-A. Theme And Template Governance For 05 And 09

- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/frontend/admin-template-parity-inventory.md`

### 5. Code-Start Checks

- `docs/architecture/lane-code-start-checklists-05-06-08-09.md`
- `docs/architecture/lane-code-start-checklists-07-10-04-03-02.md`

### 6. Prompt And Messaging Aids

- `docs/architecture/implementation-lane-prompt-starters.md`
- `docs/architecture/implementation-lane-short-prompts.md`
- `docs/architecture/implementation-lane-short-prompts-ko.md`

### 7. Status And Reporting

- `docs/architecture/implementation-lane-status-template.md`
- `docs/architecture/implementation-lane-handoff-receipt-template.md`
- `docs/architecture/implementation-lane-completion-template.md`
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-structure-wave-closeout.md` for family-scoped closeout reporting
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-closeout-template.md` for resource-ownership-family reporting
- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md` for the latest resumable resource-ownership-family state
- `docs/architecture/implementation-handoff-health-checklist.md`
- `docs/architecture/implementation-drift-report-template.md`
- `docs/architecture/operator-lane-launch-board-template.md`
- `docs/architecture/operator-issue-routing-card.md`
- `docs/architecture/operator-command-palette-card.md`

### 8. Identity Rules

- `docs/architecture/governed-identity-naming-convention.md`
- `docs/architecture/context-key-strip-contract.md`

## Quick Start By Lane

### 05

Read:

1. executive summary
2. handoff note
3. lane start instructions `05`
4. code-start checklist `05`
5. template-line/theme-set/parity governance docs from `03`

### 06

Read:

1. executive summary
2. handoff note
3. lane start instructions `06`
4. code-start checklist `06`

### 08

Read:

1. executive summary
2. handoff note
3. lane start instructions `08`
4. code-start checklist `08`

### 09

Read:

1. executive summary
2. handoff note
3. lane start instructions `09`
4. code-start checklist `09`
5. template-line/theme-set/parity governance docs from `03`

### 07 10 04 03 02

Read:

1. executive summary
2. handoff note
3. second-wave lane start instructions
4. second-wave code-start checklist

## Official Start Phrase

- `HANDOFF READY: implementation lanes may start from documented lane instructions; contract blocker count is 0.`
