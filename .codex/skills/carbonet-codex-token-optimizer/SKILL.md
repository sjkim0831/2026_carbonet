---
name: carbonet-codex-token-optimizer
description: Select the most token-efficient launcher mode for Carbonet Codex tasks.
---

# Carbonet Codex Token Optimizer

## Purpose
Select the most token-efficient execution mode in `carbonet-codex` launcher based on the task classification to minimize costs while maintaining accuracy.

## When to use
- Anytime you are about to run a `codex` or `freeagent` command.
- When the task is purely informational (use `explain`).
- When the task requires multi-file edits (use `apply`).

## Core Execution Pattern

### 1. Classify the Task
Before typing your prompt, decide which family it belongs to:
- **Discovery** (Reading/Finding): "Where is this used?", "What does this do?"
- **Planning** (Designing): "How should I implement X?", "Write a plan."
- **Execution** (Editing/Creating): "Implement X", "Fix the bug in Y."

### 2. Select the Mode in Launcher
- **Class Discovery**: Select **`explain`** mode.
- **Class Planning**: Select **`plan`** or **`prompt`** mode.
- **Class Execution**: Select **`apply`** mode.

## Checklists
- [ ] Have I partitioned the session if it's getting too large?
- [ ] Am I using `explain` for single-file analysis?
- [ ] Is the `plan` updated before using `apply` to narrow down the target scope?

## Key References
- `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
- `docs/ai/00-governance/ai-reference-reduction-policy.md`
- `docs/operations/codex-token-optimization-guide.md`
- `app/server.py` (Mode implementation details)
