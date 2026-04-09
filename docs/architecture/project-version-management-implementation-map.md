# Project Version Management Implementation Map

Generated on 2026-04-08 for Spring implementation planning.

## Goal

Map the project version management contracts into concrete backend implementation ownership so the control-plane team can implement without re-deciding package placement.

## Core Rule

Keep version-governance logic in the control-plane lane.

Do not place project-version governance under project business packages.

Use:

- platform-owned controller
- platform-owned service
- platform-owned mapper
- project runtime remains a governed target, not the owner of version governance

## Recommended Backend Ownership

### Controller

Recommended path:

- `src/main/java/egovframework/com/platform/versioncontrol/web/ProjectVersionManagementApiController.java`

Responsibilities:

- request parsing
- response entity wrapping
- delegating to service
- no inline compatibility logic

### Service

Recommended paths:

- `src/main/java/egovframework/com/platform/versioncontrol/service/ProjectVersionManagementService.java`
- `src/main/java/egovframework/com/platform/versioncontrol/service/impl/ProjectVersionManagementServiceImpl.java`

Responsibilities:

- overview assembly
- adapter history lookup
- release-unit history lookup
- server deployment lookup
- upgrade impact calculation
- upgrade apply orchestration
- rollback orchestration

### Mapper

Recommended paths:

- `src/main/java/egovframework/com/platform/versioncontrol/mapper/ProjectVersionManagementMapper.java`
- `src/main/resources/egovframework/mapper/com/platform/versioncontrol/ProjectVersionManagementMapper.xml`

Responsibilities:

- artifact version registry reads
- project installed-version reads
- adapter change log reads and writes
- release unit registry reads and writes
- server deployment state reads and writes

## Recommended Frontend Ownership

### Route

Recommended route id and path:

- route id: `version-management`
- Korean path: `/admin/system/version`
- English path: `/en/admin/system/version`
- admin menu code: `A0060404`
- admin feature codes:
  - `A0060404_VIEW`
  - `A0060404_ANALYZE`
  - `A0060404_APPLY`
  - `A0060404_ROLLBACK`

### React Page

Recommended path:

- `frontend/src/features/project-version-management/ProjectVersionManagementMigrationPage.tsx`

Responsibilities:

- project-level version overview rendering
- installed artifact and package visibility
- adapter history rendering
- release-unit and deploy-state rendering
- upgrade-impact analysis trigger
- apply-upgrade and rollback action trigger

### Client API

Recommended path:

- `frontend/src/lib/api/client.ts`

Required client functions:

- `fetchProjectVersionManagementPage(...)`
- `analyzeProjectUpgradeImpact(...)`
- `applyProjectUpgrade(...)`
- `rollbackProjectVersion(...)`

Current permission gating:

- read operator feature codes from frontend session
- gate page notice with `A0060404_VIEW`
- gate action buttons with:
  - `A0060404_ANALYZE`
  - `A0060404_APPLY`
  - `A0060404_ROLLBACK`
- call version-control endpoints through `/admin/api/platform/version-control/*` and `/en/admin/api/platform/version-control/*`
- rely on the existing admin authorization interceptor path for backend `403` handling
- normalize `403` messages in the client with explicit required feature codes
- localize controller error messages by request path and locale for `/admin/...` and `/en/admin/...`
- bootstrap menu provisioning should register:
  - `A0060404_VIEW`
  - `A0060404_ANALYZE`
  - `A0060404_APPLY`
  - `A0060404_ROLLBACK`

## Recommended Method Groups

### Overview

- `getProjectVersionOverview(String projectId)`

### Adapter History

- `getAdapterHistory(String projectId, int page, int pageSize)`

### Release Units

- `getReleaseUnits(String projectId, int page, int pageSize)`

### Server Deploy State

- `getServerDeployState(String projectId)`

### Upgrade Impact

- `analyzeUpgradeImpact(ProjectUpgradeImpactRequest request)`

### Apply Upgrade

- `applyUpgrade(ProjectApplyUpgradeRequest request)`

### Rollback

- `rollbackProject(ProjectRollbackRequest request)`
- restore `PROJECT_ARTIFACT_INSTALL` active rows from the governed release-unit artifact set
- preserve previous active version as `rollbackTargetVersion` on the restored install rows
- append an adapter change log event for governed rollback execution

## Recommended DTO Ownership

Use platform-owned DTOs for version-governance APIs.

Recommended path:

- `src/main/java/egovframework/com/platform/versioncontrol/model/*`

Reason:

- these DTOs belong to the control plane, not to one project runtime

## Data Sources

The service should compose from:

- `PROJECT_REGISTRY`
- `ARTIFACT_VERSION_REGISTRY`
- `PROJECT_ARTIFACT_INSTALL`
- `ADAPTER_CHANGE_LOG`
- `RELEASE_UNIT_REGISTRY`
- `SERVER_DEPLOYMENT_STATE`

Optional later joins:

- `COMMON_MODULE_REGISTRY`
- `INSTALL_UNIT`
- `PROJECT_DB_MIGRATION_STATUS`

## Compatibility Decision Flow

The service implementation should classify upgrade impact in this order:

1. target artifact existence
2. adapter contract match
3. manifest/API/capability version compatibility
4. release-unit buildability
5. rollback target presence

Output classes:

- `ADAPTER_SAFE`
- `ADAPTER_REVIEW_REQUIRED`
- `ADAPTER_BREAKING`

## Separation Rule

Do not put this logic in:

- `feature/admin` page payload assemblers
- project-specific runtime controllers
- project adapter implementations

Those layers may consume the result later, but the source of truth belongs in the platform control plane.

## Practical Conclusion

If this feature is implemented in the repository, the first preferred ownership is:

- `platform/versioncontrol/web`
- `platform/versioncontrol/service`
- `platform/versioncontrol/mapper`
- `platform/versioncontrol/model`

Menu metadata seed reference:

- `docs/sql/20260409_admin_project_version_management_menu.sql`
