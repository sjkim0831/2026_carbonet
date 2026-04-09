# Project Version Management Console IA

Generated on 2026-04-08 for project-installed artifact governance.

## Goal

Define the operator-facing information architecture for the project management program that manages:

- installed common versions
- adapter versions
- package versions
- release units
- deployment and rollback state

## Core Rule

The version console should answer three questions immediately:

1. what is this project running now
2. what newer compatible versions exist
3. what would change if we upgrade

Do not force operators to infer these answers from source repositories or raw jar files.

## Primary Views

### 1. Project Version Overview

One screen per project.

Required summary cards:

- active project runtime version
- active common core version
- active adapter contract version
- active adapter artifact version
- installed package count
- rollback-ready release unit

Required tables:

- installed artifact set
- installed API/process/theme package set
- latest compatible candidate set
- incompatible candidate set

Candidate artifact list should expose at least:

- `INSTALLED`
- `LATEST`
- `REVIEW_REQUIRED`
- `AVAILABLE`

and support a bulk action:

- `Use Latest Set`

### 2. Adapter Change History

Required columns:

- `recordedAt`
- `adapterContractVersion`
- `adapterArtifactVersion`
- `compatibilityClass`
- `migrationRequiredYn`
- `changedPortSet`
- `changedDtoSet`
- `mappingImpactSummary`
- `relatedReleaseUnitId`

Use:

- inspect adapter drift risk before upgrade
- detect whether the current project still sits on an old contract line

### 3. Release Unit Explorer

Required columns:

- `releaseUnitId`
- `runtimePackageId`
- `projectRuntimeVersion`
- `adapterArtifactVersion`
- `commonArtifactSet`
- `packageVersionSet`
- `builtAt`
- `approvedAt`
- `rollbackTargetReleaseId`

Required actions:

- open release details
- compare with previous release
- mark deploy candidate
- roll back to previous approved release

Release explorer should keep a selected release context and expose:

- release summary cards
- selected artifact set
- selected package version set
- `Use As Rollback Target`

### 4. Server Deployment State

Required columns:

- `serverId`
- `serverRole`
- `activeReleaseUnitId`
- `deployTraceId`
- `deployedAt`
- `healthStatus`
- `runtimeTruthYn`

Required actions:

- open deployment trace
- compare active server vs target release
- move selected release unit to preview or active deployment

Server deploy state should allow jumping into the selected release detail from `activeReleaseUnitId`.

Deployment view should also expose:

- selected release alignment summary
- selected server detail
- match vs drift state per server
- server-role lanes such as `ACTIVE`, `PREVIEW`, `STAGE`

When backend metadata is available, `serverRole` should come from `SERVER_DEPLOYMENT_STATE.SERVER_ROLE` rather than frontend inference.

### 5. Upgrade Impact View

This is the most important decision screen.

Required output:

- current version set
- target version set
- adapter impact summary
- package delta
- runtime package delta
- rollback target
- blocker set

Upgrade should be classed as:

- `ADAPTER_SAFE`
- `ADAPTER_REVIEW_REQUIRED`
- `ADAPTER_BREAKING`

## Navigation Model

Recommended left navigation:

- `Project Overview`
- `Installed Versions`
- `Adapter History`
- `Release Units`
- `Deploy State`
- `Upgrade Impact`
- `Rollback History`

Current React entry alignment:

- route id: `version-management`
- route path: `/admin/system/version`
- implementation page: `frontend/src/features/project-version-management/ProjectVersionManagementMigrationPage.tsx`
- admin menu code: `A0060404`
- baseline permission code: `A0060404_VIEW`
- action permission codes:
  - `A0060404_ANALYZE`
  - `A0060404_APPLY`
  - `A0060404_ROLLBACK`

Current UI behavior:

- if `A0060404_VIEW` is missing, show a page-level access notice
- show the required feature-code set directly in the access notice:
  - `A0060404_VIEW`
  - `A0060404_ANALYZE`
  - `A0060404_APPLY`
  - `A0060404_ROLLBACK`
- disable action buttons with reason text when action feature codes are missing
- version-management API calls should use `/admin/api/platform/version-control/*` so the existing admin authorization interceptor can return `403`
- frontend API client should normalize `403` into operator-readable permission guidance
- version-management must surface the latest `project-pipeline` snapshot beside installed artifacts, release units, and rollback targets
- operators must be able to regenerate a governed pipeline snapshot from the version-management screen without leaving the release/rollback context
- after rollback, keep the latest rollback result visible with:
  - restored artifact count
  - restored artifact set
  - runtime package id
  - deploy trace id
  - next rollback target release id
  - server alignment summary against the rolled-back release
  - aligned server list
  - drift server list
  - automatic synchronization of the selected release context to the rolled-back release
  - quick actions to reopen the rolled-back release and its first aligned server
  - a direct jump from `deployTraceId` into the unified trace log view
- after upgrade apply, keep the latest prepared release result visible with:
  - applied artifact count
  - applied artifact set
  - runtime package id
  - rollback target release id
  - deploy-ready flag
  - server alignment summary against the prepared release
  - aligned server list
  - drift server list
  - automatic synchronization of the selected release context to the prepared release
  - quick actions to reopen the prepared release and its first aligned server
  - quick actions to open unified-log evidence by `targetType=RELEASE_UNIT` and `targetType=RUNTIME_PACKAGE`

## Required Filters

Operators should be able to filter by:

- project
- server role
- compatibility class
- artifact family
- release approval state
- rollback-ready state

## Required Detail Drawers

Every major table row should support a detail drawer showing:

- metadata identifiers
- artifact naming identity
- compatibility versions
- install or deploy timestamps
- human summary
- linked traces
- selected server detail and pipeline summary should expose quick actions that open `/admin/system/unified_log/trace?traceId=...` when `deployTraceId` is available
- pipeline summary should also expose quick actions that open unified-log evidence for `RELEASE_UNIT` and lineage evidence for `RELEASE_FAMILY`

## Trace Link Rule

The version management console must link directly to:

- artifact registry entry
- adapter change history
- release-unit detail
- deployment trace
- unified-log evidence filtered by `targetType/targetId` for `RELEASE_UNIT` and `RUNTIME_PACKAGE`
- rollback target
- project pipeline summary
- installable product contract
- release family lineage

Unified log follow-up should preserve the incoming `targetType` and `targetId` in both the search form and the browser URL so release evidence context is not lost after tab or filter changes.
The unified-log summary area should surface the active evidence target explicitly so operators can tell whether they are reviewing `RELEASE_UNIT`, `RUNTIME_PACKAGE`, or `RELEASE_FAMILY` evidence without re-reading the query string.
Unified log follow-up should also preserve `projectId` so the operator can jump back into `/admin/system/version?projectId=...` without reconstructing context manually.

## Practical Conclusion

The project management program is not complete unless operators can:

- see current installed versions per project
- inspect adapter change history
- compare current and target release units
- understand upgrade safety before deploy
- roll back without source inspection
- verify that version tracking uses the same `releaseFamilyId`, `runtimePackageId`, `deployTraceId`, and `rollbackTargetReleaseUnitId` as the governed project pipeline snapshot

See also:

- `docs/architecture/project-version-management-api-contracts.md`
- `docs/architecture/project-version-management-api-examples.md`
- `docs/sql/20260409_admin_project_version_management_menu.sql`
