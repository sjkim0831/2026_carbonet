# Cron Retention Governance Schema

Generated on 2026-03-21 for the Resonance retention and cleanup track.

## Goal

Define how Resonance governs scheduled jobs, retention rules, archive expiration, auto-delete, and orphan cleanup.

## Core Rule

No long-lived or temporary artifact should exist without:

- an owner
- a retention class
- a delete policy
- execution history

## Core Tables

### `CRON_JOB_REGISTRY`

Recommended fields:

- `cronJobId`
- `jobName`
- `jobFamily`
- `scheduleExpr`
- `targetScope`
- `projectId`
- `serverRole`
- `scriptBundleId`
- `macroProfileId`
- `enabledYn`
- `lastRunAt`
- `nextRunAt`
- `status`

Recommended `jobFamily` values:

- `FILE_ARCHIVE_MOVE_CRON`
- `FILE_RETENTION_DELETE_CRON`
- `TEMP_FILE_CLEANUP_CRON`
- `BUILD_ARTIFACT_CLEANUP_CRON`
- `LOG_RETENTION_CRON`
- `DB_BACKUP_CRON`
- `HEALTH_CHECK_CRON`
- `AI_RUNNER_MAINTENANCE_CRON`

### `RETENTION_POLICY`

Recommended fields:

- `retentionPolicyId`
- `policyName`
- `resourceFamily`
- `retentionClass`
- `retentionDays`
- `graceDays`
- `approvalMode`
- `deleteMode`
- `rollbackWindowDays`
- `status`

Recommended `resourceFamily` values:

- `ARCHIVE_FILE`
- `TEMP_FILE`
- `BUILD_ARTIFACT`
- `LOG_ARTIFACT`
- `AI_CACHE`

### `RETENTION_TARGET_BINDING`

Recommended fields:

- `bindingId`
- `retentionPolicyId`
- `targetType`
- `projectId`
- `fileCategory`
- `serverRole`
- `resourcePattern`
- `enabledYn`

### `DELETE_CANDIDATE`

Recommended fields:

- `deleteCandidateId`
- `resourceId`
- `resourceFamily`
- `retentionPolicyId`
- `candidateReason`
- `detectedAt`
- `approvalRequiredYn`
- `approvedYn`
- `executedYn`
- `executedAt`

### `ORPHAN_CLEANUP_EVENT`

Recommended fields:

- `cleanupEventId`
- `resourceId`
- `resourceFamily`
- `cleanupReason`
- `detectedAt`
- `resolvedAt`
- `resultStatus`
- `note`

## Required Operator Views

- cron schedule view
- cron run history
- retention policy list
- delete preview queue
- orphan cleanup queue
- failed cleanup and retry queue

## Governance Rules

- delete preview should exist before destructive cleanup where risk is meaningful
- approval mode should be configurable by retention class
- cleanup events must be auditable and correlated to the owning retention policy
- orphan cleanup must update chain blockers and resource status

## Non-Goals

This schema does not replace:

- file-location metadata
- audit-event history
- release-unit lifecycle tables
