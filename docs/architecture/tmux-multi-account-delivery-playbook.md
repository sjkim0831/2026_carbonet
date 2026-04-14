# Tmux Multi-Account Delivery Playbook

Generated on 2026-03-21 for Resonance multi-account parallel delivery.

## Goal

Define a repeatable `tmux` and multi-account operating model so multiple AI-driven sessions can work in parallel without corrupting shared contracts or overlapping implementation families.

This playbook may be used even when a large pool such as `34` total accounts is available.
In that case, keep the same ownership model and use extra accounts as verify-only, read-only, standby, or observer lanes unless a truly disjoint writer lane is needed.

## Core Rule

Parallel work should always be divided by:

- account
- tmux session
- owned file families
- dependency order
- handoff target

No parallel lane should start implementation before shared contracts are frozen.

Do not equate available account count with safe concurrent write-lane count.

## Minimum Recommended Session Layout

Use one top-level `tmux` session per account or operator lane.

Recommended names:

- `res-contract`
- `res-backend`
- `res-frontend`
- `res-builder`
- `res-deploy`
- `res-verify`

Recommended window layout per session:

- `0: main`
- `1: audit`
- `2: notes`
- `3: verify`

## Account-To-Session Mapping

Recommended if enough accounts exist:

1. account A
   - session `res-contract`
   - owns shared contracts and schemas
2. account B
   - session `res-backend`
   - owns backend registry and API implementation
3. account C
   - session `res-frontend`
   - owns React operator screens and shell or runtime UI
4. account D
   - session `res-builder`
   - owns builder, theme-set, incremental asset, and repair workbench flows
5. account E
   - session `res-deploy`
   - owns Jenkins, runtime package, rollout, and deploy automation
6. account F
   - session `res-verify`
   - owns compare, parity, uniformity, audit, and smoke verification

If fewer accounts exist:

- combine only non-overlapping lanes
- never combine `contract` with another write-heavy lane once implementation starts

## Allowed Ownership Examples

### Contract

Allowed:

- `docs/architecture/*`
- `docs/ai/80-skills/*`

Blocked:

- `frontend/src/*`
- `src/main/java/*`

### Backend

Allowed:

- `src/main/java/*`
- `src/main/resources/egovframework/mapper/*`

Blocked:

- shared contract docs unless explicitly handed off

### Frontend

Allowed:

- `frontend/src/*`
- `frontend/scripts/*`

Blocked:

- shared contract docs unless explicitly handed off

### Builder

Allowed:

- builder-focused frontend and backend families
- prototype pages related to builder or design workspace

Blocked:

- shared contract docs unless explicitly handed off

## Handoff Rule

Every session should leave:

- current task summary
- files changed
- blockers
- next expected lane
- verification status

Recommended handoff summary phrase:

- `HANDOFF READY: <target lane> can continue from <file or flow>; current blocker count is <n>.`

Recommended blocker phrase:

- `BLOCKED: waiting for <lane or contract> because <specific reason>.`

Handoff should happen before:

- contract changes affecting other lanes
- release-unit schema changes
- runtime package structure changes

## Same-Instructions Routing Rule

When the same operator keeps extending the same initiative:

- continue inside the same tmux lane if ownership did not change
- do not open an overlapping convenience session for the same file family
- do not widen the ownership scope unless a formal handoff occurs

Repeated work should follow the same lane, the same guided step, and the same ownership notes until a planned handoff changes that boundary.

Governed UIs and APIs should surface the same `ownerLane` identity whenever:

- a blocker is assigned
- a repair session is opened
- a compare result is handed off
- a deploy or verification step changes responsibility

## Attachment And Repeat Aliases

If the operator says `N에 붙어`, `N에 붙어서`, `N번에 붙어`, or `N번에 붙어서`:

- attach to the matching numbered lane from `docs/ai/80-skills/resonance-10-session-assignment.md`
- continue from that lane's last unfinished step
- if that numbered lane has its own session-specific repeat rule in the assignment doc, follow that lane-specific rule first
- keep the same tmux lane, ownership notes, and path boundaries

If the operator says `docs/ai/80-skills/resonance-10-session-assignment.md 붙어`, `resonance-10-session-assignment.md 붙어서`, or similar file-path wording:

- use the numbered-session assignment doc as the routing source
- if a numbered lane is also named, that numbered lane wins
- otherwise continue the active lane or the most recently attached numbered lane
- do not open a duplicate lane only because the file path was named

If the operator says `이어서 해줘`:

- continue the active tmux lane, or the most recently attached numbered lane if none is currently active
- resume from the last unfinished step instead of opening a parallel lane

If the operator says `무한 반복`, `무한반복`, `1분마다 재실행`, or `1분마다 재실행 혹은 이어서 해줘` together with an attached lane:

- keep the same numbered lane attached
- rerun or continue that same lane about every 1 minute
- stop only when the operator says stop, the work reaches `DONE`, or the lane becomes `BLOCKED`

Examples:

- `N번에 붙어`
- `0N에 붙어서`
- `N번에 붙어서 이어서 해줘`
- `N번에 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`
- `무한반복 N번에 붙어`
- `docs/ai/80-skills/resonance-10-session-assignment.md 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`

## When More Accounts Are Needed

Additional accounts are useful when:

- builder and frontend both have large active work
- verify lane must compare current runtime while backend/frontend continue
- a dedicated `runtime-collection` or `legacy-import` lane is needed
- one lane is blocked on review but another lane can continue

Additional accounts should usually become:

- verify-only lanes
- read-only research lanes
- standby continuation lanes
- observer or audit lanes

Even if `17` Codex and `17` Gemini accounts are available, start from the minimum safe active lane count first.

Extra session candidates:

- `res-legacy-import`
- `res-runtime-collect`
- `res-perf`
- `res-style`

## Approval For New Accounts

If extra accounts or login sessions are needed, request them only when:

- contract freeze is complete
- ownership boundaries are already documented
- the new account has a bounded, non-overlapping lane to own

## Use

This playbook should be used together with:

- `docs/architecture/high-parallel-account-orchestration-playbook.md`
- `docs/ai/80-skills/resonance-10-session-assignment.md`
- it is the numbered-session source of truth for lane numbers, attachment wording, and repeat-loop interpretation
- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/implementation-blocker-audit.md`
- `docs/architecture/governed-identity-naming-convention.md`
- `docs/architecture/resonance-ai-track-partition-map.md`
- `docs/ai/80-skills/resonance-skill-and-doc-update-pattern.md`
