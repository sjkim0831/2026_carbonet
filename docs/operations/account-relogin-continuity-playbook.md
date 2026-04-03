# Account Re-Login Continuity Playbook

Use this when a new login, new account, or fresh Codex session must continue the same Carbonet work without overlapping an already-active file family.

## Goal

- reopen the right active task first
- detect current in-progress work from the repository, not memory
- keep shared files under one temporary owner
- leave a durable handoff trail for the next login

## Reopen Order

Open in this order:

1. `bash ops/scripts/codex-resume-status.sh`
2. `bash ops/scripts/codex-admin-status.sh`
3. `docs/ai/60-operations/session-orchestration/active/ACTIVE_INDEX.md`
4. `docs/ai/60-operations/session-orchestration/active/`
5. `docs/ai/session-notes/`
6. `docs/architecture/tmux-multi-account-delivery-playbook.md`
7. `docs/architecture/operator-next-day-restart-card.md`
8. `git status --short`

If an `active/<request>/` folder exists, treat it as the first source of truth for lane ownership and restart order.

## Reconciliation Rule

Before starting new edits:

1. compare the active plan against `git status --short`
2. identify shared files already in play
3. decide whether the current login is:
   - reopening the same lane
   - taking a clean handoff
   - blocked until contract ownership is clarified

Do not infer that a lane is free just because a document exists. The working tree wins.

## Minimum Durable Artifacts

Each active coordinated request should keep these files under `docs/ai/60-operations/session-orchestration/active/<request-id>/`:

- `README.md`
- `session-plan.md`
- `current-worktree.md`
- `handoff-latest.md`

Use the templates under `docs/ai/60-operations/session-orchestration/` when creating or refreshing them.

## Ownership Rule

One temporary owner per shared file family:

- route registry and navigation
- shared frontend shell and common components
- backend controller-service-mapper chains
- SQL seed or migration drafts
- runtime packaging and generated assets

Generated files under `src/main/resources/static/react-app/` do not define ownership by themselves. The source owner remains the lane that owns the corresponding frontend or verification path.

`bash ops/scripts/codex-admin-status.sh` is intentionally narrowed to the currently remaining admin-route domains:

- `배출/인증`
- `거래`
- `콘텐츠`

## Suggested Resume Checklist

1. run `bash ops/scripts/codex-resume-status.sh`
2. open the active request folder
3. run `git status --short`
4. check whether your target files are already listed in `current-worktree.md`
5. if yes, stay in that lane or update the handoff instead of opening a duplicate lane
6. if no, add the new lane boundary to `session-plan.md` before editing
7. leave `handoff-latest.md` updated before you stop

## Status Phrase Standard

Use one of these short phrases in the latest handoff note:

- `IN_PROGRESS: <lane> owns <file family>; next step is <step>.`
- `HANDOFF READY: <lane> may continue from <entry point>; blocker count is <n>.`
- `BLOCKED: waiting for <lane or contract> because <reason>.`

## Current Repository Reality On 2026-03-30

- session-planning templates already exist under `docs/ai/60-operations/session-orchestration/`
- tmux and lane-routing rules already exist under `docs/architecture/tmux-multi-account-delivery-playbook.md`
- builder rollout status notes already exist under `docs/ai/session-notes/`
- the missing piece was a durable active-request folder tied to the real working tree
- `ops/scripts/codex-resume-status.sh` is now the shortest local resume entrypoint
