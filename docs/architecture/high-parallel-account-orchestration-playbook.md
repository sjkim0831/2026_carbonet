# High-Parallel Account Orchestration Playbook

Status: LIVE_ENTRY

Generated for high-account-count AI collaboration on the Carbonet repository.

## Goal

Define how to use a large account pool safely when many Codex and Gemini accounts are available at the same time.

Current operator capacity example:

- Codex accounts: `17`
- Gemini accounts: `17`
- total available accounts: `34`

This does not mean `34` concurrent write lanes should be opened.

## Core Rule

Account count is capacity.

Ownership lanes are the safety boundary.

Always size active write lanes by:

- shared file families
- contract overlap
- merge risk
- verification dependency

Never size active write lanes by the number of available accounts alone.

## Lane Classes

Use these lane classes explicitly.

### 1. Active Write Lane

May edit owned files.

Requirements:

- explicit `allowedPaths`
- explicit `forbiddenPaths`
- one clear owner
- current handoff target

Examples:

- contract coordinator
- frontend feature owner
- backend chain owner
- runtime/package owner

### 2. Verify-Only Lane

May run checks, compare outputs, review route responses, and validate runtime or docs alignment.

Should not edit shared implementation files unless formally handed ownership.

Examples:

- smoke verification
- route/runtime proof
- diff review
- map consistency checks

### 3. Research Or Read-Only Lane

May inspect code, docs, logs, and design sources.

Should not claim ownership of writable shared families.

Examples:

- design interpretation
- architecture evidence gathering
- source-of-truth confirmation

### 4. Standby Continuation Lane

Prepared to resume a blocked or paused lane.

Should not write until ownership is formally transferred.

Examples:

- paused backend owner replacement
- alternate verifier
- next-shift continuation account

### 5. Observer Or Audit Lane

Tracks state, blockers, and completion quality only.

Should not produce overlapping implementation changes.

Examples:

- blocker ledger review
- handoff receipt validation
- archive/delete candidate review

## Recommended Lane Budget With 34 Accounts

Even with `34` accounts available, start here:

- `4` to `6` active write lanes
- `2` to `4` verify-only lanes
- `2` to `6` research or read-only lanes
- remaining accounts stay parked as standby continuation or observer lanes

Typical safe distribution:

1. `1` contract coordinator
2. `1` frontend owner
3. `1` backend owner
4. `1` runtime/package owner
5. `1` docs or verification owner
6. optional `1` builder or domain-specialist owner when truly disjoint

That still leaves most of the `34` accounts unused or parked, which is correct.

## Activation Rule

Open a new active write lane only when all of these are true:

1. the lane has a bounded ownership family
2. its writable files do not overlap an active writer
3. the contract freeze for that family already happened
4. a handoff target or merge order is already known

If any one of these is false, the extra account should remain:

- verify-only
- read-only
- standby
- observer

## Provider Mix Rule

Codex and Gemini may both be part of the same account pool, but provider diversity does not relax ownership rules.

Use provider mix for:

- redundancy
- standby continuation
- parallel review
- alternative analysis on bounded read-only work

Do not use provider mix to justify duplicate active writers on the same file family.

## Suggested 34-Account Pool Shape

This is a scheduling example, not a mandatory fixed layout.

### Active write lanes

- `A01` contract coordinator
- `A02` backend owner
- `A03` frontend owner
- `A04` runtime/package owner
- `A05` docs/verification closer
- `A06` optional bounded domain owner

### Verify-only lanes

- `V01` route and runtime verification
- `V02` docs and map consistency verification
- `V03` regression checklist verification

### Research/read-only lanes

- `R01` design source confirmation
- `R02` architecture evidence gathering
- `R03` source-of-truth drift detection

### Standby lanes

- `S01` contract continuation standby
- `S02` frontend continuation standby
- `S03` backend continuation standby
- `S04` runtime continuation standby

### Observer lanes

- `O01` blocker ledger review
- `O02` archive/delete candidate audit

Everything else stays unassigned until a bounded need appears.

## Lane State Model

Every lane should have one visible state:

- `UNASSIGNED`
- `STANDBY`
- `READ_ONLY`
- `VERIFY_ONLY`
- `ACTIVE_WRITE`
- `HANDOFF_PENDING`
- `BLOCKED`
- `DONE`

Do not treat all attached accounts as active by default.

## Token Expiry Continuity Rule

High account count does not remove token-expiry risk.

Treat token expiry, session eviction, forced re-login, and provider-side conversation reset as the same continuity class.

Before a lane is likely to expire or pause, update at least:

1. `handoff-latest.md`
2. `current-worktree.md` when owned files changed
3. the lane state in the relevant active request note

Every active write lane should leave a short expiry-safe note with:

- current owned family
- last completed step
- next exact step
- blocker count
- verification state

Recommended phrase:

- `EXPIRY SAFE: <lane> may be resumed from <entry file or command>; owned family is <family>; next step is <step>.`

## Token Expiry Recovery Order

When a token expires and another account or fresh session must continue:

1. run `bash ops/scripts/codex-resume-status.sh`
2. open `docs/ai/60-operations/session-orchestration/active/ACTIVE_INDEX.md`
3. open the active request folder
4. read `session-plan.md`
5. read `current-worktree.md`
6. read `handoff-latest.md`
7. compare against `git status --short`
8. resume only if the target family is still clearly owned or formally handed off

Do not restart from memory when a durable handoff exists.

## Token Expiry Scheduling Rule For 34 Accounts

With `34` total accounts available, reserve part of the pool for expiry recovery instead of spending all accounts on active work.

Recommended reservation:

- `2` to `4` standby continuation accounts for active write lanes
- `1` to `2` reserve verifier accounts
- `1` observer account for handoff quality and delete/archive review

This makes expiry recovery fast without increasing concurrent write conflicts.

## Deletion Safety Rule For Orchestration Docs

Before deleting any orchestration doc:

1. identify the current live-entry doc for that family
2. identify the current latest active handoff doc for that family
3. keep those latest live docs
4. classify the rest as `CONDITIONAL`, `EXAMPLE_ONLY`, `ARCHIVE`, or delete candidate
5. remove references before deletion

If a doc is still the latest handoff or current live-entry source for an unfinished lane, it is not a delete candidate.

Token-expiry recovery depends on these docs staying available, so current handoff docs should be treated as protected live artifacts until the initiative is closed.

## Use With

- `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
- `docs/ai/00-governance/ai-reference-reduction-policy.md`
- `.codex/skills/carbonet-ai-session-orchestrator/SKILL.md`
- `docs/ai/60-operations/session-orchestration/README.md`
- `docs/architecture/tmux-multi-account-delivery-playbook.md`
- `docs/operations/account-relogin-continuity-playbook.md`
