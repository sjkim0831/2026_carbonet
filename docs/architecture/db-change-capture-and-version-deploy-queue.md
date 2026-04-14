# DB Change Capture And Version Deploy Queue

Generated on 2026-04-14 for Carbonet admin save tracking and `/admin/system/version` deploy orchestration.

## Goal

Make admin-side DB changes queryable, reviewable, and deployable without overloading `DB_PATCH_HISTORY`.

This design separates three concerns:

- business-side save tracking
- operator-approved deploy queue generation
- deploy-time diff verification and execution proof

## Core Rule

Do not treat `DB_PATCH_HISTORY` as the authoritative source for every day-to-day admin saves.

`DB_PATCH_HISTORY` remains the execution history for SQL patches that were actually prepared and applied by deploy automation.

AI-agent rule:

- if an AI agent changes DB state, the change must be representable through this middle layer
- admin-save style writes must leave `BUSINESS_CHANGE_LOG`
- promotable changes must be queueable through `DEPLOYABLE_DB_PATCH_QUEUE`
- actual apply on target DB must leave `DEPLOYABLE_DB_PATCH_RESULT` and final `DB_PATCH_HISTORY`
- remote app restart is not considered complete proof unless patch evidence was written first

Use new tables for:

- what changed
- what is allowed to be promoted
- what was approved and executed

## Why This Split Is Needed

Current repository behavior already supports:

- backend audit and trace persistence
- deploy-time DB diff generation
- deploy-time `DB_PATCH_HISTORY` recording
- code push, remote pull, restart, and freshness verification

What is missing is a stable middle layer between:

- a normal admin save such as common-code or menu metadata changes
- and a deploy-ready DB patch batch that operators can approve in `/admin/system/version`

Without that middle layer:

- every save is invisible to deploy governance until diff time
- `DB_PATCH_HISTORY` becomes too late in the lifecycle
- business changes and deploy patches blur together

## Data Model

### `BUSINESS_CHANGE_LOG`

Authoritative capture of business-significant admin saves.

Store:

- actor and scope
- page and API context
- table and primary-key target
- change type such as `INSERT`, `UPDATE`, `DELETE`, `UPSERT`
- before and after summary payloads
- promotion policy snapshot
- queue decision

This table answers:

- who changed what
- from which page or API
- whether the change was eligible for promotion
- whether it was already turned into a deployable patch

### `DB_CHANGE_PROMOTION_POLICY`

Authoritative rules for whether a table can be promoted toward ops deploy.

Policy classes:

- `AUTO_QUEUE`
- `MANUAL_APPROVAL`
- `BLOCKED`

Typical examples:

- common code, menu, feature, page metadata: usually `AUTO_QUEUE` or `MANUAL_APPROVAL`
- live business transaction tables: `BLOCKED`
- environment-dependent settings: usually `BLOCKED`

### `DEPLOYABLE_DB_PATCH_QUEUE`

Operator-facing queue of deployable units.

Each row should represent a stable patch candidate derived from one or more business changes.

Store:

- source change IDs
- target env
- patch format such as `JSON_PATCH`, `UPSERT_SQL`, `DELETE_SQL`
- rendered SQL preview
- checksum
- approval status
- apply status
- release and project context

### `DEPLOYABLE_DB_PATCH_RESULT`

Execution result for queue items.

Store:

- execution attempt
- operator
- started and finished times
- success or fail
- result summary
- linked `DB_PATCH_HISTORY` patch ID when an actual SQL patch was executed

## Relationship To Existing Tables

### Keep As-Is

- `AUDIT_EVENT`
- `TRACE_EVENT`
- `PROJECT_DEPLOYMENT_HISTORY`
- `DB_PATCH_HISTORY`

### New Responsibility Split

- `AUDIT_EVENT`: backend authoritative actor and action audit
- `BUSINESS_CHANGE_LOG`: structured business data mutation capture
- `DEPLOYABLE_DB_PATCH_QUEUE`: promotion candidates awaiting approval or execution
- `DEPLOYABLE_DB_PATCH_RESULT`: execution attempts and outcomes
- `DB_PATCH_HISTORY`: actual SQL patch execution history at deploy time

## Promotion Policy

Use table-level policy first. Add optional row-level or action-level policy later only if needed.

Recommended first-cut policy:

- `COMTCCMMNCLCODE`: `AUTO_QUEUE`
- `COMTCCMMNCODE`: `AUTO_QUEUE`
- `COMTNMENUINFO`: `MANUAL_APPROVAL`
- `COMTNMENUFUNCTIONINFO`: `MANUAL_APPROVAL`
- `COMTNAUTHORINFO`: `MANUAL_APPROVAL`
- `COMTNAUTHORFUNCTIONRELATE`: `MANUAL_APPROVAL`
- `COMTNDEPTAUTHORRELATE`: `MANUAL_APPROVAL`
- `COMTNEMPLYRSCRTYESTBS`: `BLOCKED`
- screen builder and manifest tables: `MANUAL_APPROVAL`
- runtime environment settings: `MANUAL_APPROVAL`
- login, member, payment, emission input, survey response, approval workflow tables: `BLOCKED`

## Write Path

### Step 1. Admin Save Executes

The existing feature service saves the target row through mapper or repository.

### Step 2. Save Tracking Hook Runs

Immediately after successful commit or successful service-level save:

- resolve page, menu, actor, request, and trace context
- load `before` snapshot where needed
- capture `after` summary
- resolve promotion policy for the target table
- insert `BUSINESS_CHANGE_LOG`
- include logical object metadata such as:
  - source env
  - logical object ID
  - base revision
  - rename aliases when the effective key changed

### Step 3. Queue Decision

If policy is:

- `AUTO_QUEUE`: generate queue row immediately
- `MANUAL_APPROVAL`: create change log only, allow operator to queue later
- `BLOCKED`: record only, do not queue

## Queue Model

Do not queue raw arbitrary SQL for the first version.

Preferred first version:

- store normalized key/value row payload
- store table name and key column map
- render deterministic SQL only at approval or execution time

AI-agent additions:

- queue execution must rebuild SQL from the latest ordered change chain, not trust stale preview SQL
- same logical object changes should replay in capture order
- mixed `LOCAL` and `REMOTE` chains for the same logical object should be treated as conflicts unless explicitly overridden

This reduces:

- malformed SQL storage
- hidden environment-specific values
- drift between row payload and rendered SQL intent

## `/admin/system/version` Integration

Extend the current page with a new section:

- change capture summary
- pending deployable queue
- blocked changes summary
- approval actions
- execute approved queue
- diff verification summary

Recommended operator flow:

1. Save admin changes on source pages
2. Review `BUSINESS_CHANGE_LOG` rollup in `/admin/system/version`
3. Approve or reject queued patch candidates
4. Execute queue batch
5. Run existing diff verification
6. If diff is safe, continue current push, pull, restart flow

## Diff Verification Rule

The new queue does not replace deploy diff verification.

Keep the existing deploy script as the final safety gate.

Do not allow AI-created remote DB reflection to bypass:

- backup
- queue or patch-file evidence
- `DB_PATCH_HISTORY`
- remote restart verification

Deploy-time sequence should become:

1. execute approved queue items against target DB
2. record execution results
3. run current local-to-remote and remote-to-local diff
4. if diff remains, decide:
   - auto-fix if additive and safe
   - block if destructive or ambiguous
5. write final `DB_PATCH_HISTORY`
6. continue code push, remote pull, and restart

## Backend Ownership

Recommended package ownership:

- `src/main/java/egovframework/com/platform/dbchange/model/*`
- `src/main/java/egovframework/com/platform/dbchange/service/*`
- `src/main/java/egovframework/com/platform/dbchange/service/impl/*`
- `src/main/java/egovframework/com/platform/dbchange/web/*`
- `src/main/java/egovframework/com/platform/dbchange/mapper/*`
- `src/main/resources/egovframework/mapper/com/platform/dbchange/*`

Recommended integration points:

- common save tracker utility under `src/main/java/egovframework/com/common/audit` or `.../platform/dbchange`
- `/admin/system/version` backend payload builder under version-control lane
- no direct ownership under business feature packages except calling the save tracker

## Frontend Ownership

Recommended frontend additions:

- `frontend/src/features/project-version-management/ProjectVersionManagementMigrationPage.tsx`
- `frontend/src/lib/api/platform.ts`
- `frontend/src/lib/api/platformTypes.ts`

New UI blocks:

- pending business changes summary
- deployable patch queue grid
- approval buttons
- execute queue button
- diff result summary and destructive-warning notice

## Non-Goals For First Version

- real-time bidirectional DB sync
- automatic promotion of all CRUD tables
- free-form SQL editor for every operator
- automatic destructive patch execution without approval
- replacing `DB_PATCH_HISTORY`

## Phase Plan

### Phase 1. Persistence And Policy

- add new schema tables
- add policy seed rows for a small set of admin metadata tables
- add service API to record `BUSINESS_CHANGE_LOG`

### Phase 2. Save Hook Adoption

- wire high-value admin save flows:
  - common code
  - menu and feature governance
  - page metadata
  - environment-independent settings

### Phase 3. Version Page Integration

- show pending changes and queue
- support approve, reject, and execute

### Phase 4. Deploy Script Linkage

- merge queue execution result into deploy summary
- keep existing diff verification as final proof

## Decision Summary

Use:

- `BUSINESS_CHANGE_LOG` for broad save capture
- `DEPLOYABLE_DB_PATCH_QUEUE` and `...RESULT` for promotion governance
- existing diff automation and `DB_PATCH_HISTORY` as final deploy proof

Do not use:

- `DB_PATCH_HISTORY` as the place where every admin save is recorded
