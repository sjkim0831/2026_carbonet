# Platform Control Plane Data Model

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define the minimum common-DB data model needed so the main platform console can manage:

- projects
- install units
- shared common modules
- resource ownership
- project DB migration status
- release and upgrade readiness

## Scope

These tables belong in `COMMON_DB`, not in project-owned business DBs.

They form the platform control plane and should remain available even when projects are split into separate apps and separate DBs.

## Core Tables

### `JSON_WORKSPACE_REGISTRY`

Tracks governed JSON authoring workspaces.

Key fields:

- `workspaceId`
- `projectId`
- `assetFamily`
- `assetKey`
- `workspaceStatus`
- `activeRevisionId`
- `rollbackAnchorRevisionId`
- `createdBy`
- `createdAt`

### `JSON_WORKSPACE_REVISION`

Tracks immutable revisions for JSON authoring assets.

Key fields:

- `jsonRevisionId`
- `workspaceId`
- `projectId`
- `assetFamily`
- `assetKey`
- `revisionNo`
- `parentJsonRevisionId`
- `storageUri`
- `contentHash`
- `approvalState`
- `editorType`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `createdAt`

Recommended `editorType` values:

- `USER`
- `AI_AGENT`
- `SYSTEM_AUTOMATION`

### `JSON_PUBLISH_BINDING`

Tracks which JSON revisions produced published assets or release units.

Key fields:

- `bindingId`
- `projectId`
- `workspaceId`
- `jsonRevisionId`
- `assetId`
- `assetFamily`
- `publishedVersion`
- `releaseUnitId`
- `boundAt`

### `PROJECT_REGISTRY`

Tracks every managed project.

Key fields:

- `projectId`
- `projectName`
- `projectCode`
- `routePrefix`
- `domainHost`
- `deploymentTarget`
- `javaVersion`
- `dbDriverVersion`
- `platformVersion`
- `egovFrameworkVersion`
- `frontendPlatformVersion`
- `uiCommonVersion`
- `screenManifestVersion`
- `designTokenVersion`
- `cssBundleVersion`
- `jsBundleVersion`
- `projectModuleVersion`
- `frameworkLineId`
- `backendFacadeLineId`
- `backendImportSensitiveLineId`
- `featureModuleLineId`
- `homeMenuTreeId`
- `adminMenuTreeId`
- `projectDbProfileId`
- `jsonWorkspaceProfileId`
- `fileStorageProfileId`
- `status`
- `ownerAdminId`

## Why

This is the anchor table for all project-scoped rollout, install, and migration tracking.

### `COMMON_MODULE_REGISTRY`

Tracks reusable common modules.

Key fields:

- `commonModuleId`
- `commonModuleType`
- `moduleName`
- `artifactCoordinate`
- `version`
- `status`
- `compatibilityPolicy`
- `publishedAt`
- `importImpactClass`
- `selectionRequiredYn`

Recommended `commonModuleType` values:

- `SI_COMMON`
- `OPS_COMMON`
- `SECURITY_COMMON`
- `UI_COMMON`
- `DATA_COMMON`
- `INTEGRATION_COMMON`

Recommended version-classification fields:

- `runtimeLayer`
  - `BACKEND`
  - `FRONTEND`
  - `STATIC_ASSET`
  - `POLICY`
- `frameworkLine`
  - for example supported eGovFrame or frontend platform baseline

Recommended `importImpactClass` values:

- `FACADE_SAFE`
- `IMPORT_AWARE`

### `INSTALL_UNIT`

Tracks menu-centered install packages.

Key fields:

- `packageId`
- `projectId`
- `menuCode`
- `pageId`
- `packageName`
- `moduleType`
- `status`
- `copySourcePackageId`
- `platformVersion`
- `moduleVersion`
- `installedAt`

### `INSTALL_UNIT_COMMON_MODULE`

Join table between install units and selected common modules.

Key fields:

- `packageId`
- `commonModuleId`
- `version`
- `requiredYn`
- `usageMode`
- `selectionScope`
- `compatibilityStatus`

This table is what allows menu install screens to select common capabilities without copying source code.

### `RESOURCE_REGISTRY`

Tracks every managed file, code artifact, DB object, and attachment policy.

Key fields:

- `resourceId`
- `projectId`
- `packageId`
- `resourceType`
- `ownerScope`
- `usageMode`
- `logicalName`
- `physicalName`
- `sourcePath`
- `dbObjectName`
- `resourceVersion`
- `artifactCoordinate`
- `status`
- `lastVerifiedAt`

### `RESOURCE_DEPENDENCY`

Tracks ownership and delete order.

Key fields:

- `dependencyId`
- `parentResourceId`
- `childResourceId`
- `dependencyType`
- `requiredYn`
- `deleteOrder`
- `sharedBlockReason`
- `dependencyScope`
- `chainType`

Recommended `chainType` values:

- `OWNERSHIP`
- `EXECUTION`
- `DELETE`

Recommended `dependencyScope` values:

- `PACKAGE_INTERNAL`
- `PROJECT_SHARED`
- `COMMON_PLATFORM`
- `EXTERNAL`

### `PROJECT_DB_MIGRATION_STATUS`

Tracks migration state for each target project DB.

Key fields:

- `projectId`
- `environmentCode`
- `dbMigrationVersion`
- `platformVersion`
- `projectModuleVersion`
- `lastAppliedAt`

## Builder Governance Extension

Builder regeneration governance should also use common-DB tables for:

- `BUILDER_OVERLAY_REGISTRY`
- `BUILDER_OVERLAY_PAYLOAD_REVISION`
- `BUILDER_OVERLAY_SET`
- `BUILDER_OVERLAY_SET_ITEM`
- `BUILDER_COMPATIBILITY_DECLARATION`
- `BUILDER_MIGRATION_PLAN`
- `BUILDER_COMPATIBILITY_CHECK_RUN`
- `BUILDER_COMPATIBILITY_CHECK_RESULT`

These tables are described in:

- `docs/architecture/builder-overlay-and-compatibility-control-plane-extension.md`
- `docs/sql/20260324_builder_overlay_and_compatibility_control_plane.sql`
- `lastVerifiedAt`
- `status`
- `driftYn`

### `RELEASE_UNIT`

Tracks a real deployable upgrade event.

Key fields:

- `releaseUnitId`
- `projectId`
- `environmentCode`
- `platformVersion`
- `egovFrameworkVersion`
- `frontendPlatformVersion`
- `uiCommonVersion`
- `screenManifestVersion`
- `designTokenVersion`
- `cssBundleVersion`
- `jsBundleVersion`
- `projectModuleVersion`
- `frameworkLineId`
- `backendFacadeLineId`
- `backendImportSensitiveLineId`
- `featureModuleLineId`
- `dbMigrationVersion`
- `apiContractVersion`
- `policyBundleVersion`
- `approvalStatus`
- `approvedBy`
- `approvedAt`
- `appliedAt`
- `rollbackReadyYn`

This row should represent one explicit version set for one target project environment.

## Supporting Tables

Recommended supporting tables:

- `PROJECT_DB_CONNECTION`
  stores connection metadata and access policy per project
- `DELETE_PLAN`
  stores generated uninstall or delete plans
- `DELETE_PLAN_ITEM`
  stores per-resource delete candidates and blockers
- `ORPHAN_SCAN_RESULT`
  stores orphan or residue scan results
- `DRIFT_SCAN_RESULT`
  stores drift between registry and actual project DB or code state
- `PROJECT_ACTIVE_RELEASE`
  stores which `RELEASE_UNIT` is currently active per project and environment
- `RELEASE_UNIT_ASSET`
  stores every bound asset family and exact version included in one release unit
- `PROJECT_RUNTIME_BINDING`
  stores currently bound backend, frontend, asset, and policy version families before release approval
- `FRAMEWORK_LINE_REGISTRY`
  stores supported backend or framework baselines published by the control plane
- `MODULE_SELECTION_PROFILE`
  stores approved version selections per project, package, or scenario family
- `IMPORT_AWARE_UPGRADE_RUN`
  stores upgrade reviews and required project-impact checks for import-sensitive shared lines
- `AI_PROVIDER_REGISTRY`
  stores central AI providers such as Codex, Gemini, and Ollama
- `AI_MODEL_REGISTRY`
  stores models per provider and task suitability
- `AI_PROJECT_BINDING`
  stores allowed provider/model bindings per project or environment
- `LOG_PIPELINE_REGISTRY`
  stores ELK or compatible log-pipeline ownership and status
- `LOG_SOURCE_BINDING`
  stores project/system/server log source mapping and correlation policy

## Complexity Control Notes

Do not try to make one table answer every governance question without classification.

The control plane stays manageable when it separates:

- package identity from resource identity
- ownership from runtime usage
- dependency semantics from UI presentation
- authoritative records from derived summaries

Recommended derived or materialized views:

- package dependency summary
- delete blocker summary
- shared common-module usage summary
- unverified resource summary
- orphan and drift trend summary
- active release versus target release diff summary
- rollback target summary
- AI provider availability and policy summary
- ELK pipeline health and missing-source summary
- JSON draft versus published lineage summary
- AI-edit versus user-edit provenance summary

These should be generated from authoritative tables instead of becoming a second source of truth.

## Relationship Summary

- one `PROJECT_REGISTRY` row owns many `INSTALL_UNIT` rows
- one `PROJECT_REGISTRY` row owns many `JSON_WORKSPACE_REGISTRY` rows
- one `JSON_WORKSPACE_REGISTRY` row owns many `JSON_WORKSPACE_REVISION` rows
- one `INSTALL_UNIT` row owns many `RESOURCE_REGISTRY` rows
- one `INSTALL_UNIT` row may reference many `COMMON_MODULE_REGISTRY` rows
- one `RESOURCE_REGISTRY` row may participate in many `RESOURCE_DEPENDENCY` rows across different `chainType` values
- one `PROJECT_REGISTRY` row owns many `PROJECT_DB_MIGRATION_STATUS` rows by environment
- one `RELEASE_UNIT` row points to one approved combination of platform, app, and DB versions
- one `PROJECT_ACTIVE_RELEASE` row points to the currently active `RELEASE_UNIT` per environment
- one `RELEASE_UNIT` row owns many `RELEASE_UNIT_ASSET` rows for backend, frontend, CSS, JS, manifest, policy, and DB version families
- one `PROJECT_REGISTRY` row may reference many `AI_PROJECT_BINDING` rows by environment or task type
- one `PROJECT_REGISTRY` row may reference many `LOG_SOURCE_BINDING` rows across app, Nginx, Jenkins, Nomad, and DB log families
- one `RELEASE_UNIT` row may reference many `JSON_PUBLISH_BINDING` rows for source provenance

## Minimum Rollout Order

Recommended implementation order for this repository:

1. add `PROJECT_REGISTRY`
2. add `JSON_WORKSPACE_REGISTRY` and `JSON_WORKSPACE_REVISION`
3. add `INSTALL_UNIT`
4. add `COMMON_MODULE_REGISTRY`
5. add `INSTALL_UNIT_COMMON_MODULE`
6. add `RESOURCE_REGISTRY` and `RESOURCE_DEPENDENCY`
7. add `PROJECT_DB_MIGRATION_STATUS`
8. add `RELEASE_UNIT`
9. add `PROJECT_RUNTIME_BINDING`
10. add `RELEASE_UNIT_ASSET`
11. add `PROJECT_ACTIVE_RELEASE`
12. add `JSON_PUBLISH_BINDING`
13. add `AI_PROVIDER_REGISTRY`, `AI_MODEL_REGISTRY`, and `AI_PROJECT_BINDING`
14. add `LOG_PIPELINE_REGISTRY` and `LOG_SOURCE_BINDING`

## Important Rule

Do not start with delete automation before `RESOURCE_REGISTRY` and `RESOURCE_DEPENDENCY` exist.

Do not start with project DB split before `PROJECT_REGISTRY` and `PROJECT_DB_MIGRATION_STATUS` exist.

Do not start `latest`-style deploy automation before `PROJECT_RUNTIME_BINDING`, `RELEASE_UNIT`, and `PROJECT_ACTIVE_RELEASE` exist.
