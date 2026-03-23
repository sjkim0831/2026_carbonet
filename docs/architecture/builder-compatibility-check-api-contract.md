# Builder Compatibility Check API Contract

## Goal

Define the control-plane API that validates whether a given source package,
overlay set, and builder version can safely regenerate and publish.

## Core Rule

Compatibility check must run before:

- regenerate publish
- builder version upgrade publish
- overlay-heavy release publish

The API should fail early when compatibility is unsupported instead of letting
runtime deployment discover drift.

## API Surface

### `POST /api/admin/framework/builder-compatibility/check`

Run a compatibility check for a requested build package.

Request fields:

- `projectId`
- `pageId`
- `scenarioId`
- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `overlaySetId`
- `migrationPlanId`
- `checkScope`
- `requestedBy`

Recommended `checkScope` values:

- `SOURCE_ONLY`
- `SOURCE_AND_OVERLAY`
- `PRE_PUBLISH`
- `PRE_UPGRADE`
- `REPLAY_VALIDATION`

Response fields:

- `compatibilityCheckRunId`
- `compatibilityVerdict`
- `blockingIssueCount`
- `warningCount`
- `builderVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `overlaySetId`
- `migrationPlanId`
- `resultItems[]`

Each `resultItems[]` entry should contain:

- `resultType`
- `targetScope`
- `targetKey`
- `severity`
- `ruleCode`
- `summary`
- `blockingYn`

### `GET /api/admin/framework/builder-compatibility/checks/{compatibilityCheckRunId}`

Return one compatibility check summary and full result details.

Response fields:

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
- `startedAt`
- `completedAt`
- `resultItems[]`

### `GET /api/admin/framework/builder-compatibility/declarations`

Return builder compatibility declarations available for selection.

Query fields:

- `builderVersion`
- `status`

Response fields:

- `compatibilityDeclarationId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `supportedSourceContractRange`
- `supportedOverlaySchemaRange`
- `emittedManifestContractVersion`
- `emittedAuthorityContractVersion`
- `releaseCompatibilityVersion`
- `compatibilityVerdict`
- `breakingChangeYn`

### `GET /api/admin/framework/builder-compatibility/migration-plans`

Return migration plans between builder lines.

Query fields:

- `fromBuilderVersion`
- `toBuilderVersion`
- `status`

Response fields:

- `migrationPlanId`
- `fromBuilderVersion`
- `toBuilderVersion`
- `fromSourceContractRange`
- `toSourceContractRange`
- `fromOverlaySchemaRange`
- `toOverlaySchemaRange`
- `manualReviewRequiredYn`
- `status`

## Validation Rules

The check API should validate at minimum:

1. source contract range support
2. overlay schema range support
3. stable identity key continuity
4. extension-point availability
5. manifest and authority emission compatibility
6. replay validation if requested

## Failure Rules

Return `BLOCKED` when:

- no compatibility declaration matches
- source version is unsupported
- overlay schema version is unsupported
- migration is required but missing
- replay validation finds blocking drift

Return `SUPPORTED_WITH_MIGRATION` when:

- target builder line is valid only after migration

Return `READ_ONLY_IMPORT_ONLY` when:

- assets can be collected but not republished safely

Return `FULLY_SUPPORTED` when:

- regeneration and publish may proceed under current inputs

## Trace Rule

Every successful or failed check should persist a control-plane run record and
its detailed result items before returning the response.

## Carbonet Mapping

This API contract should be used together with:

- `docs/architecture/builder-version-compatibility-and-upgrade-contract.md`
- `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/platform-control-plane-data-model.md`
