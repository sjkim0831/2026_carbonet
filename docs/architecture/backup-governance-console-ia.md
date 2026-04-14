# Backup Governance Console IA

Generated on 2026-04-14 for the `A00604` backup and release-governance group.

## Goal

Turn the current backup-related scripts and pages into one governed central-operations console that:

- exposes backup, restore, retention, release, and DB promotion decisions through pages
- keeps raw scripts as execution workers rather than primary operator interfaces
- blocks unsafe bypass paths for remote DB sync and deploy flows

This document uses the current implemented anchors:

- `A0060401` `/admin/system/backup_config`
- `A0060402` `/admin/system/backup`
- `A0060404` `/admin/system/version`
- `A0060405` `/admin/system/db-promotion-policy`

Current metadata anchor:

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`

## Core Rule

The operator should not need to remember shell commands to decide:

1. whether a backup or DB promotion is allowed
2. what inputs are required
3. what evidence was produced
4. whether rollback is ready

Scripts remain valid implementation assets, but page actions become the approved operator surface.

## `A00604` Menu Tree

### Existing Anchors

| Menu code | Route | Purpose | Status |
| --- | --- | --- | --- |
| `A00604` | `#` | backup and release-governance parent group | active |
| `A0060401` | `/admin/system/backup_config` | backup policy, storage, retention, recent execution summary | active |
| `A0060402` | `/admin/system/backup` | governed backup execution and history view | active |
| `A0060404` | `/admin/system/version` | version, release-unit, apply, rollback console | active |
| `A0060405` | `/admin/system/db-promotion-policy` | DB change promotion policy catalog | active |

### Recommended Next Child Menus

These are the next natural additions under `A00604`.
Codes below are recommendations and not yet implemented.

| Proposed menu code | Proposed route | Proposed page | Why it belongs under `A00604` |
| --- | --- | --- | --- |
| `A0060406` | `/admin/system/db-sync-deploy` | DB sync and fresh deploy console | Owns the governed replacement for `windows-db-sync-push-and-fresh-deploy-221.sh`. |
| `A0060407` | `/admin/system/restore-history` | restore history and checkpoint explorer | Backup without restore evidence is incomplete. |
| `A0060408` | `/admin/system/retention-policy` | backup and archive retention governance | Day-two backup operations need explicit retention control. |
| `A0060409` | `/admin/system/deploy-evidence` | deploy, freshness, rollback, and release proof explorer | Keeps `version-management` focused on decisions and this page focused on evidence. |

## Page Roles Inside The Group

### `A0060401` Backup Config

Primary role:

- define profile, storage, remote archive, cadence, and restore playbook policy

Must answer:

- where backups land
- how long they live
- what counts as valid backup readiness
- which backup families are enabled

### `A0060402` Backup Execution

Primary role:

- run governed backup commands and show recent execution state

Must answer:

- what ran
- with which profile
- what evidence files were produced
- whether verification succeeded

### `A0060404` Version Management

Primary role:

- decide release, upgrade, apply, rollback, and runtime target state

Must answer:

- what is installed now
- what target set is being applied
- what rollback anchor exists
- which remote sync or deploy action is pending

### `A0060405` DB Promotion Policy

Primary role:

- register table-level promotion policy before high-risk DB sync actions are allowed

Must answer:

- which tables are safe additive changes
- which tables are review-required or destructive
- what masking, render mode, and change reason apply
- which recent tracked business changes touched the table

### `A0060406` DB Sync And Fresh Deploy Console

Primary role:

- replace direct operator use of `ops/scripts/windows-db-sync-push-and-fresh-deploy-221.sh`

Must answer:

- what local backup and remote backup will be taken
- which SQL set or schema diff is being applied
- which policy rows cover the impacted tables
- whether destructive diff is present
- which project, branch, release, and remote host are targeted
- whether freshness verification and rollback proof passed

## `windows-db-sync-push-and-fresh-deploy-221.sh` Guardrail Design

## Why This Script Needs A Page Gate

The script currently spans:

- local DB snapshot
- remote DB snapshot
- schema diff
- optional diff apply to local and remote
- SQL file apply
- git push
- remote deploy
- post-apply verification

That is too much authority for a raw shell entrypoint to remain the primary operator interface.

## Required Page Flow

The page flow for the future `db-sync-deploy` console should be:

1. select project and target environment
2. select release context or branch
3. load impacted SQL files and diff summary
4. resolve impacted tables against `DB_CHANGE_PROMOTION_POLICY`
5. classify risk as `SAFE`, `REVIEW_REQUIRED`, or `DESTRUCTIVE`
6. require operator confirmation with explicit side-effect summary
7. execute the script through a controlled backend runner
8. capture backup, diff, deploy, freshness, and rollback evidence
9. expose the result in observability and release history

## Non-Negotiable Guards

The page or backing API should refuse execution when any of these are true:

- impacted table exists with no active promotion policy row
- risk is `DESTRUCTIVE` and no explicit override approval exists
- `DB_PATCH_HISTORY` recording is disabled
- pre-backup step is skipped
- target release or rollback anchor is missing
- required freshness verification is disabled
- target host or project binding is unresolved

## Required Operator Inputs

The page should require these inputs before execution:

- `projectId`
- `targetEnvironment`
- `releaseUnitId` or approved deploy context
- `targetBranch`
- `sqlFileSet`
- `targetHostSet`
- `operatorReason`
- `approvalTicketId` when risk class is not `SAFE`

## Required Execution Summary

Before the operator can click execute, show:

- local DB snapshot path
- remote DB snapshot path
- SQL files to apply
- diff counts by change class
- impacted table list
- missing policy rows
- destructive statement summary
- git push target
- remote deploy target
- freshness verification plan
- rollback anchor summary

## Required Evidence Outputs

Store and surface at least:

- `backupRunStamp`
- local snapshot file
- remote pre-apply snapshot file
- remote post-apply snapshot file
- schema diff files
- applied SQL file set
- `DB_PATCH_HISTORY` patch id and status
- deploy trace id
- packaged jar identity
- remote runtime jar identity when available
- freshness verification result
- rollback-ready status

## Raw Script Bypass Policy

The end state should not ban the script entirely, but it must stop being an ungoverned shortcut.

Recommended policy:

- normal operator path: page action only
- CI or queue path: same backend runner and same validation chain
- raw shell path: allowed only for break-glass admin with explicit env flag and audit reason

Recommended script enforcement additions:

- require `EXECUTION_SOURCE=page`, `queue`, or `breakglass`
- fail when `EXECUTION_SOURCE` is missing
- when `EXECUTION_SOURCE=breakglass`, require:
  - `BREAKGLASS_REASON`
  - `BREAKGLASS_APPROVER`
  - audit log emission before apply steps
- when `EXECUTION_SOURCE=page` or `queue`, require:
  - signed execution request id
  - resolved policy-check result
  - approved target host set

## Feature-Code Plan For `A0060406`

Recommended baseline permission set:

- `A0060406_VIEW`
- `A0060406_ANALYZE`
- `A0060406_EXECUTE`
- `A0060406_BREAKGLASS`

Use:

- `VIEW` for read-only inspection
- `ANALYZE` for preflight diff and policy checks
- `EXECUTE` for approved apply and deploy
- `BREAKGLASS` for exceptional bypass execution only

## API Contract Shape

The future page should split the action API into small governed steps instead of one giant execute endpoint.

Recommended endpoints:

- `GET /admin/system/db-sync-deploy/page-data`
- `POST /admin/system/db-sync-deploy/analyze`
- `POST /admin/system/db-sync-deploy/validate-policy`
- `POST /admin/system/db-sync-deploy/execute`
- `GET /admin/system/db-sync-deploy/history`
- `GET /admin/system/db-sync-deploy/history/{runId}`

## Relationship To Existing Pages

Keep these boundaries explicit:

- `backup-config` owns policy and storage defaults
- `backup-execution` owns backup runs and backup history
- `version-management` owns release selection, apply, rollback, and runtime-state decisions
- `db-promotion-policy` owns table-level DB policy and change rationale
- `db-sync-deploy` owns one governed high-risk DB sync and fresh deploy workflow
- `observability` owns unified evidence search across these actions

## Practical Next Step

The next implementation slice should be:

1. add `A0060406` as a page contract and menu proposal
2. expose analyze-only preflight from the current script behavior
3. move script execution behind a backend runner endpoint
4. enforce `EXECUTION_SOURCE` and policy-check inputs inside the script
5. write deploy and DB patch evidence into the same observability line used by version management
