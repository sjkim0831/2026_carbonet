# Workspace State Machine Map

Grounded on the current workspace-system code paths in `/opt/projects/carbonet` as of 2026-03-28.

This document is the compact lifecycle map for the operations workspace family:

- `codex-request`
- `sr-workbench`
- `screen-builder`
- `screen-runtime`
- `current-runtime-compare`
- `repair-workbench`

Use this before changing workflow behavior, storage migration, queueing, publish, restore, rollback, or artifact review behavior.

## 1. SR Ticket Lifecycle

Primary owner:

- `src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`

Entry routes:

- `/admin/system/sr-workbench`
- `/admin/system/codex-request`

### Ticket status

The human approval state is tracked in `ticket.status`.

States:

- `OPEN`
- `APPROVED`
- `REJECTED`

Transitions:

- `OPEN -> APPROVED`
  - trigger: `updateApproval(... decision=APPROVE ...)`
- `OPEN -> REJECTED`
  - trigger: `updateApproval(... decision=REJECT ...)`

Notes:

- new tickets are created as `OPEN`
- only `APPROVED` tickets may continue into prepare, plan, execute, queue, or skip-plan execute

### Execution status

The machine-execution state is tracked in `ticket.executionStatus`.

Common states found in code:

- `READY_FOR_APPROVAL`
- `CODEX_DISABLED`
- `APPROVED_READY`
- `APPROVED_MANUAL_ONLY`
- `REJECTED`
- `READY_FOR_CODEX`
- `READY_FOR_MANUAL_EXECUTION`
- `RUNNER_BLOCKED`
- `PLAN_RUNNING`
- `PLAN_COMPLETED`
- `PLAN_FAILED`
- `RUNNING_CODEX`
- `RUNNER_ERROR`
- `CODEX_COMPLETED`
- `VERIFY_FAILED`
- `DEPLOY_FAILED`
- `CODEX_FAILED`

Normal planned path:

1. create ticket
   - status: `OPEN`
   - executionStatus: `READY_FOR_APPROVAL` or `CODEX_DISABLED`
2. approve ticket
   - status: `APPROVED`
   - executionStatus: `APPROVED_READY` or `APPROVED_MANUAL_ONLY`
3. prepare execution
   - executionStatus: `READY_FOR_CODEX` or `READY_FOR_MANUAL_EXECUTION`
4. plan ticket
   - transient: `PLAN_RUNNING`
   - terminal: `PLAN_COMPLETED` or `PLAN_FAILED`
5. execute ticket
   - allowed only from `PLAN_COMPLETED`
   - transient: `RUNNING_CODEX`
   - terminal: mapped from runner result to `CODEX_COMPLETED`, `VERIFY_FAILED`, `DEPLOY_FAILED`, `CODEX_FAILED`, or `RUNNER_ERROR`

Shortcut paths:

- quick execute:
  - create -> approve -> prepare -> plan -> execute in one backend flow
- skip-plan execute:
  - allowed only from `APPROVED`
  - forces build path without requiring prior successful plan
- direct execute:
  - currently requires `APPROVED`
  - if still `APPROVED_READY`, the service prepares first
  - if not already `PLAN_COMPLETED`, current code still expects plan completion before the build path proceeds

Guards:

- `executeTicket` rejects unless `executionStatus == PLAN_COMPLETED`
- `skipPlanExecuteTicket` rejects if `status != APPROVED`
- `planTicket` accepts retry from `READY_FOR_CODEX`, `RUNNER_BLOCKED`, `PLAN_FAILED`, or `PLAN_COMPLETED`
- `planTicket` auto-prepares when starting from `APPROVED_READY`

### Queue status

Parallel lane execution is tracked in `ticket.queueStatus`.

States:

- `IDLE`
- `QUEUED`
- `RUNNING`
- `COMPLETED`
- `FAILED`

Transitions:

- `IDLE -> QUEUED`
  - trigger: `queueDirectExecuteTicket`
- `QUEUED -> RUNNING`
  - trigger: lane dispatcher picks a ticket
- `RUNNING -> COMPLETED`
  - trigger: queued execution succeeds
- `RUNNING -> FAILED`
  - trigger: queued execution throws

Notes:

- queue state is independent from the approval state, but queue submission still requires `status == APPROVED`
- queue lane metadata is persisted on the ticket row:
  - `queueLaneId`
  - `queueTmuxSessionName`
  - `queueRequestedBy`
  - `queueSubmittedAt`
  - `queueStartedAt`
  - `queueCompletedAt`

### Rollback status

Manual rollback is tracked in `ticket.rollbackStatus`.

States:

- empty
- `MANUAL_ROLLBACK_RUNNING`
- `MANUAL_ROLLBACK_COMPLETED`
- `MANUAL_ROLLBACK_FAILED`

Transitions:

- empty -> `MANUAL_ROLLBACK_RUNNING`
  - trigger: `rollbackTicket`
- `MANUAL_ROLLBACK_RUNNING -> MANUAL_ROLLBACK_COMPLETED`
  - trigger: rollback command succeeds
- `MANUAL_ROLLBACK_RUNNING -> MANUAL_ROLLBACK_FAILED`
  - trigger: rollback command fails

Guards:

- rollback is blocked while `executionStatus` is `PLAN_RUNNING` or `RUNNING_CODEX`
- rollback requires deploy history and backup JAR evidence

## 2. SR Workbench Stack Lifecycle

Primary owner:

- `src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`

Storage:

- file-backed JSONL at `security.codex.sr-workbench-stack-file`

States:

- captured
- stored in stack
- consumed into ticket
- deleted
- cleared

Transitions:

- capture -> stored in stack
  - trigger: `addStackItem`
- stored in stack -> consumed into ticket
  - trigger: `createTicket` with selected stack items
- stored in stack -> deleted
  - trigger: `removeStackItem`
- stored in stack -> cleared
  - trigger: `clearStack`

Notes:

- stack items are bridge storage, not yet governed control-plane entities
- stack items carry `traceId` and `requestId`, which should later be used for stronger audit correlation

## 3. Screen Builder Draft Lifecycle

Primary owner:

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenBuilderDraftServiceImpl.java`

Entry routes:

- `/admin/system/screen-builder`
- `/admin/system/screen-runtime`

Stored document state:

- `versionStatus`

States found in code:

- `DRAFT`
- `PUBLISHED`

Normal path:

1. first load
   - service synthesizes a default draft if no saved draft exists
2. save draft
   - `versionStatus = DRAFT`
   - current draft JSON is overwritten
   - history snapshot is appended
3. restore draft version
   - selected non-published history snapshot is cloned into a new `DRAFT`
4. publish draft
   - current draft is snapshotted with `versionStatus = PUBLISHED`
   - publish does not replace the working draft with a published document

Guards:

- save requires exactly one `page` root node and at least one node overall
- publish is blocked by:
  - unregistered registry nodes
  - missing nodes
  - deprecated nodes
  - invalid authority profile
  - authority/event misalignment
- restoring a `PUBLISHED` snapshot back into draft is explicitly blocked

Important consequence:

- current builder flow is snapshot-based, not branch-based
- `PUBLISHED` is a protected history snapshot
- `DRAFT` is the editable working document

## 4. Component Registry Lifecycle

Primary owner:

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenBuilderDraftServiceImpl.java`

Registry item state:

- `ACTIVE`
- `INACTIVE`

Operational actions:

- register component
- update component
- scan usage
- remap usage
- delete component
- auto-replace deprecated usages
- add node from component
- add node tree from component contracts

Constraints:

- system components are protected from deletion
- deletion is blocked while usages still exist
- registry mutations invalidate builder status summary projections

## 5. Compare And Repair Workspace

Primary current implementation shape:

- React-led workspace pages:
  - `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
  - `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`
- observability and governance linkage feed those views

Current practical lifecycle:

1. open compare context
2. inspect current/generated/baseline linkage
3. identify blockers or drift
4. open repair workbench
5. apply repair or hand off to builder or execution flow
6. verify through observability and deploy evidence

Current gap:

- compare and repair have rich UI state, but no single backend-owned lifecycle object comparable to `SrTicketRecordVO`
- if this area moves to DB-backed governed state, add a separate repair-session state machine rather than overloading SR ticket state

## 6. Recommended Invariants

- keep approval state, execution state, queue state, and rollback state as separate axes
- do not collapse `DRAFT` and `PUBLISHED` builder semantics into one mutable row
- do not treat stack items as durable workflow truth
- queue transitions should never bypass approval checks
- publish transitions should never bypass registry and authority checks
- rollback should always remain evidence-driven from artifact outputs

## 7. Migration Priorities

If the workspace system becomes more governed, migrate in this order:

1. SR ticket and stack storage from JSONL to DB-backed control-plane tables
2. queue lane and execution artifact metadata into governed persistence
3. builder draft, history, publish lineage, and projection ownership review
4. compare and repair session persistence as a first-class workflow model
