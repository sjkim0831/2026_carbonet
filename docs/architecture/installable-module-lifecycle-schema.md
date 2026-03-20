# Installable Module Lifecycle Schema

Generated on 2026-03-21 for the Resonance installable-module track.

## Goal

Define how installable modules are registered, built, attached, upgraded, detached, and rolled back without uncontrolled source copying.

## Core Rule

Every shared capability must be:

- installable
- buildable
- versioned
- attachable
- detachable
- rollback-aware

## Core Tables

### `INSTALLABLE_MODULE`

Recommended fields:

- `installableModuleId`
- `moduleName`
- `moduleFamily`
- `moduleType`
- `ownerScope`
- `sourceRepository`
- `sourceRootPath`
- `artifactType`
- `artifactCoordinate`
- `activeVersion`
- `status`
- `publishedAt`

Recommended `moduleFamily` values:

- `COMMON_BACKEND_MODULE`
- `COMMON_FRONTEND_MODULE`
- `STATIC_ASSET_BUNDLE`
- `CSS_BUNDLE`
- `DESIGN_SOURCE_PACKAGE`
- `THEME_PACKAGE`
- `DESIGN_TOKEN_PACKAGE`
- `AI_PROVIDER_ADAPTER`
- `AI_RUNNER_PROFILE`
- `LOG_PIPELINE_ADAPTER`
- `BLOCKCHAIN_EVIDENCE_ADAPTER`
- `SERVER_SETUP_BUNDLE`

### `INSTALLABLE_MODULE_VERSION`

Recommended fields:

- `moduleVersionId`
- `installableModuleId`
- `version`
- `buildProfile`
- `artifactCoordinate`
- `compatibilityRange`
- `installContractVersion`
- `rollbackContractVersion`
- `publishedYn`
- `publishedAt`

### `MODULE_BINDING`

Represents module attachment to project, package, or common plane.

Recommended fields:

- `bindingId`
- `installableModuleId`
- `moduleVersionId`
- `bindingScope`
- `projectId`
- `packageId`
- `releaseUnitId`
- `installStatus`
- `enabledYn`
- `attachedAt`
- `detachedAt`

Recommended `bindingScope` values:

- `COMMON_PLANE`
- `PROJECT`
- `PACKAGE`
- `SCENARIO_FAMILY`

### `MODULE_LIFECYCLE_EVENT`

Recommended fields:

- `eventId`
- `installableModuleId`
- `moduleVersionId`
- `eventType`
- `targetScope`
- `targetId`
- `requestedBy`
- `approvedBy`
- `executedAt`
- `resultStatus`
- `resultSummary`

Recommended `eventType` values:

- `INSTALL`
- `ENABLE`
- `DISABLE`
- `UPGRADE`
- `REPLACE`
- `DETACH`
- `UNINSTALL`
- `ROLLBACK`

## Lifecycle Rules

No module may move to `INSTALLED` unless:

1. a published build artifact exists
2. a compatibility range is defined
3. delete and rollback blockers are known
4. owned resources are declared

No module may move to `UNINSTALLED` unless:

1. active bindings are resolved
2. orphan resources are checked
3. rollback or replacement path is recorded where required

## Required Ownership Metadata

Each module version should declare:

- owned resources
- dependent resources
- runtime targets
- compatibility range
- rollback contract
- module pattern family
- module depth profile
- CSS and frontend asset compatibility where relevant

## Non-Goals

This schema does not replace:

- release-unit history
- project source ownership
- chain-matrix blocker views
