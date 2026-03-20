# Chain Matrix Governance Schema

Generated on 2026-03-21 for the Resonance chain-matrix track.

## Goal

Define the minimum schema needed so Resonance can manage every governed asset through one operator-facing chain matrix.

## Core Rule

Every governed resource should appear in matrix views that answer:

- who owns it
- what executes it
- what builds it
- what deploys it
- what blocks delete
- what blocks rollback
- what runtime targets consume it

Also answer:

- whether it is `CONTROL_PLANE_ONLY`, `RUNTIME_DEPLOYABLE`, or `SHARED_REFERENCE_ONLY`
- whether it is complete enough to build
- whether it is complete enough to deploy
- whether it is parity-ready against the current runtime
- whether it is uniformity-ready against the approved theme, frame, and action-layout family

## Core Tables

### `CHAIN_MATRIX_ROW`

One row per governed resource summary.

Recommended fields:

- `chainRowId`
- `resourceId`
- `resourceType`
- `logicalName`
- `ownerScope`
- `projectId`
- `packageId`
- `scenarioId`
- `scenarioFamilyId`
- `actorPolicyId`
- `installableModuleId`
- `releaseUnitId`
- `activeVersion`
- `targetVersion`
- `previousVersion`
- `status`
- `lastVerifiedAt`
- `deployabilityClass`
- `buildReadyYn`
- `deployReadyYn`
- `parityReadyYn`
- `uniformityReadyYn`
- `mainServerTruthRequiredYn`
- `currentRuntimeCompareState`
- `generatedResultCompareState`
- `patchCompareState`

### `CHAIN_MATRIX_LINK`

Represents directional chain links.

Recommended fields:

- `linkId`
- `chainRowId`
- `linkedResourceId`
- `chainType`
- `requiredYn`
- `direction`
- `note`

Recommended `chainType` values:

- `OWNERSHIP`
- `EXECUTION`
- `DEPLOY`
- `DELETE`
- `ROLLBACK`
- `COMPATIBILITY`
- `SOURCE_TO_BUILD`
- `BUILD_TO_RUNTIME`
- `MENU_TO_SCREEN`
- `SCREEN_TO_COMPONENT`
- `COMPONENT_TO_EVENT`
- `EVENT_TO_FUNCTION`
- `FUNCTION_TO_API`
- `API_TO_BACKEND`
- `BACKEND_TO_DB`
- `SCREEN_TO_HELP`
- `SCREEN_TO_SECURITY`
- `SCREEN_TO_AUTHORITY`
- `SCREEN_TO_RUNTIME_CHECK`

### `CHAIN_BLOCKER`

Represents a block on delete, replace, install, or rollback.

Recommended fields:

- `blockerId`
- `chainRowId`
- `blockerType`
- `blockingResourceId`
- `severity`
- `reasonCode`
- `reasonDetail`
- `resolvableYn`
- `resolvedYn`
- `resolvedAt`

Recommended `blockerType` values:

- `DELETE_BLOCKER`
- `ROLLBACK_BLOCKER`
- `COMPATIBILITY_BLOCKER`
- `MISSING_BUILD_ARTIFACT`
- `MISSING_SCENARIO`
- `MISSING_ACTOR_POLICY`
- `RUNTIME_IN_USE`
- `MISSING_MENU_BINDING`
- `MISSING_PAGE_FRAME`
- `MISSING_COMPONENT_BINDING`
- `MISSING_EVENT_CHAIN`
- `MISSING_API_CHAIN`
- `MISSING_BACKEND_CHAIN`
- `MISSING_DB_CHAIN`
- `MISSING_HELP_COVERAGE`
- `MISSING_SECURITY_POLICY`
- `PARITY_GAP`
- `UNIFORMITY_GAP`
- `MAIN_SERVER_RUNTIME_MISMATCH`

## Recommended Views

### `module install matrix`

Columns:

- module
- version
- target project
- install status
- compatibility status
- rollback target

### `release-unit asset matrix`

Columns:

- release unit
- asset family
- active version
- target version
- previous version
- rollout status

### `screen-to-backend generation matrix`

Columns:

- scenario
- page
- controller
- service
- mapper
- API bindings
- actor policy

### `menu-scenario-screen matrix`

Columns:

- project
- menu tree class
- scenario family
- scenario
- page
- feature
- route
- shell profile
- page frame
- action-layout profile
- deployability class
- build-ready
- deploy-ready

### `component execution matrix`

Columns:

- page
- element family
- component family
- component version
- popup family
- grid family
- search-form family
- event chain state
- help/security/authority state
- parity state

### `runtime truth and rollout matrix`

Columns:

- release unit
- main server
- sub server
- idle target
- current runtime compare state
- generated target compare state
- patch compare state
- smoke state
- rollback target

### `delete and rollback blocker matrix`

Columns:

- resource
- blocker type
- blocking dependency
- resolution action
- owner

## Query Rules

Every chain matrix query should be able to answer:

1. what is active now
2. what is planned next
3. what version was previously active
4. what blocks delete
5. what blocks rollback
6. what blocks build or deploy
7. what blocks parity or uniformity approval
8. which main server is the runtime truth source

## Required Matrix Families

Resonance should expose at least these operator-facing matrix families:

- project and runtime matrix
- menu and scenario matrix
- page and component matrix
- event/function/API/backend/DB chain matrix
- release-unit asset matrix
- runtime truth and rollout matrix
- delete and rollback blocker matrix
- parity and uniformity matrix

No governed feature family should be considered complete if it cannot be located in these matrix views.

## Non-Goals

This schema is not a replacement for:

- detailed audit history
- raw log storage
- source repository history
