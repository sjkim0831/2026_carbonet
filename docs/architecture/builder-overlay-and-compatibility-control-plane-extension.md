# Builder Overlay And Compatibility Control Plane Extension

## Goal

Extend the platform control plane so Carbonet can persist:

- governed overlay definitions
- overlay sets used by regeneration
- builder compatibility declarations
- builder migration plans
- compatibility check runs and results

These records belong in `COMMON_DB` because they govern regeneration and
publish across projects, not one project business DB.

## New Tables

### `BUILDER_OVERLAY_REGISTRY`

Tracks one governed overlay definition.

Key fields:

- `overlayId`
- `projectId`
- `pageId`
- `scenarioId`
- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- `ownerLane`
- `overlayType`
- `targetScope`
- `targetKeyJson`
- `payloadSchemaVersion`
- `matchPolicy`
- `applyMode`
- `overlayVersion`
- `approvalState`
- `overlayStatus`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

### `BUILDER_OVERLAY_PAYLOAD_REVISION`

Tracks immutable payload revisions for overlays.

Key fields:

- `overlayRevisionId`
- `overlayId`
- `projectId`
- `revisionNo`
- `parentOverlayRevisionId`
- `payloadJson`
- `payloadHash`
- `validationSummary`
- `compatibilityRange`
- `editorType`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `approvalState`
- `createdAt`

### `BUILDER_OVERLAY_SET`

Tracks the approved overlay bundle selected for one regeneration or publish
scope.

Key fields:

- `overlaySetId`
- `projectId`
- `overlaySetName`
- `targetReleaseUnitId`
- `overlayHash`
- `approvalState`
- `createdBy`
- `createdAt`

### `BUILDER_OVERLAY_SET_ITEM`

Join table between overlay sets and overlay revisions.

Key fields:

- `overlaySetItemId`
- `overlaySetId`
- `overlayId`
- `overlayRevisionId`
- `applyOrder`
- `requiredYn`

### `BUILDER_COMPATIBILITY_DECLARATION`

Tracks what one builder line can consume and emit.

Key fields:

- `compatibilityDeclarationId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `supportedSourceContractRange`
- `supportedOverlaySchemaRange`
- `emittedManifestContractVersion`
- `emittedAuthorityContractVersion`
- `releaseCompatibilityVersion`
- `breakingChangeYn`
- `compatibilityVerdict`
- `reviewedBy`
- `reviewedAt`
- `status`

### `BUILDER_MIGRATION_PLAN`

Tracks migration paths between incompatible builder lines.

Key fields:

- `migrationPlanId`
- `fromBuilderVersion`
- `toBuilderVersion`
- `fromSourceContractRange`
- `toSourceContractRange`
- `fromOverlaySchemaRange`
- `toOverlaySchemaRange`
- `requiredTransformSetJson`
- `nonTransformableFieldSetJson`
- `manualReviewRequiredYn`
- `status`
- `createdBy`
- `createdAt`

### `BUILDER_COMPATIBILITY_CHECK_RUN`

Tracks each compatibility check execution.

Key fields:

- `compatibilityCheckRunId`
- `projectId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `overlaySetId`
- `migrationPlanId`
- `checkScope`
- `compatibilityVerdict`
- `blockingIssueCount`
- `startedAt`
- `completedAt`
- `requestedBy`

Recommended `checkScope` values:

- `SOURCE_ONLY`
- `SOURCE_AND_OVERLAY`
- `PRE_PUBLISH`
- `PRE_UPGRADE`
- `REPLAY_VALIDATION`

### `BUILDER_COMPATIBILITY_CHECK_RESULT`

Tracks detailed findings for one compatibility run.

Key fields:

- `compatibilityResultId`
- `compatibilityCheckRunId`
- `resultType`
- `targetScope`
- `targetKey`
- `severity`
- `ruleCode`
- `summary`
- `detailsJson`
- `blockingYn`
- `createdAt`

Recommended `resultType` values:

- `SOURCE_RANGE`
- `OVERLAY_RANGE`
- `IDENTITY_STABILITY`
- `EXTENSION_POINT`
- `MANIFEST_EMIT`
- `AUTHORITY_EMIT`
- `REPLAY_DIFF`
- `SQL_FAMILY_REPLAY`

## Control Plane Rule

These builder-governance tables should remain separate from:

- project business data
- runtime telemetry event streams
- generated derived artifact storage

The control plane owns approval, compatibility, and replay governance. Runtime
systems only consume approved outputs.

## Trace Alignment

The following fields should align with generation lineage:

- `overlaySetId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `compatibilityVerdict`
- `migrationPlanId`

## Carbonet Mapping

Use with:

- `docs/architecture/platform-control-plane-data-model.md`
- `docs/sql/platform_control_plane_schema.sql`
- `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- `docs/architecture/builder-version-compatibility-and-upgrade-contract.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
