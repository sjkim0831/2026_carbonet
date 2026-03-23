# Builder Version Compatibility And Upgrade Contract

## Goal

Define how Carbonet builder versions can evolve without corrupting older source
contracts, overlays, or published asset lineage.

## Core Rule

Builder upgrades are allowed only when Carbonet can answer all three questions:

1. which source contract versions can this builder consume
2. which overlay schema versions can this builder replay
3. what migration path exists for incompatible older assets

No builder version should publish outputs from an unsupported source package
without an explicit migration or compatibility verdict.

## Version Axes

Carbonet must track at least these version axes:

- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `manifestContractVersion`
- `releaseCompatibilityVersion`

## Compatibility Object

Each builder release should declare a compatibility object containing:

- `builderVersion`
- `supportedSourceContractRange`
- `supportedOverlaySchemaRange`
- `emittedManifestContractVersion`
- `emittedAuthorityContractVersion`
- `requiredExtensionPointSet`
- `migrationPlanSet`
- `breakingChangeYn`
- `compatibilityReviewedBy`
- `compatibilityReviewedAt`

## Compatibility States

Allowed compatibility verdicts:

- `FULLY_SUPPORTED`
- `SUPPORTED_WITH_MIGRATION`
- `READ_ONLY_IMPORT_ONLY`
- `BLOCKED`

Meaning:

- `FULLY_SUPPORTED`
  - source and overlays may regenerate directly
- `SUPPORTED_WITH_MIGRATION`
  - migration must run before regeneration
- `READ_ONLY_IMPORT_ONLY`
  - assets may be collected and viewed but not republished
- `BLOCKED`
  - builder must reject publish and regenerate

## Migration Rule

Every incompatible upgrade must provide a migration plan record containing:

- `migrationPlanId`
- `fromBuilderVersion`
- `toBuilderVersion`
- `fromSourceContractRange`
- `toSourceContractRange`
- `fromOverlaySchemaRange`
- `toOverlaySchemaRange`
- `requiredTransformSet`
- `nonTransformableFieldSet`
- `manualReviewRequiredYn`

## Safe Upgrade Rule

A builder upgrade is safe only if:

1. stable identity keys remain unchanged, or a migration preserves them
2. overlays still resolve to the same governed targets
3. manifest and authority contracts remain publishable
4. trace lineage can link pre-upgrade and post-upgrade outputs
5. compare and smoke verification pass on regenerated outputs

## Breaking-Change Rule

Treat these as breaking changes:

- renaming stable identity keys
- changing template-line semantics
- changing screen-family semantics
- changing overlay matching behavior
- changing manifest field meaning
- removing extension points used by approved overlays

Breaking changes require:

- compatibility review
- migration plan
- replay test on existing source packages
- approval before publish

## Replay Requirement

Before a new builder version is approved, Carbonet should replay:

- at least one previously approved source package
- at least one overlay-heavy package
- at least one release-bound package

The replay should compare:

- emitted manifests
- authority outputs
- generated code families
- SQL draft families where applicable
- verification results

## Publish Gate

Block publish when:

- source contract range is unsupported
- overlay schema range is unsupported
- migration is required but not applied
- compatibility verdict is `BLOCKED`
- replay validation fails

## Trace Requirement

Generation lineage should persist:

- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `compatibilityVerdict`
- `migrationPlanId`

## Operational Policy

Recommended default policy:

- old source packages remain regenerable for at least one supported line
- unsupported packages remain importable for audit and migration planning
- no silent auto-upgrade of overlays or manifests in runtime publish flow
- compatibility failure should open repair or migration flow, not hidden fallback

## Carbonet Mapping

This contract should be used together with:

- `docs/architecture/framework-builder-standard.md`
- `docs/architecture/builder-regeneration-without-derived-asset-edits.md`
- `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/platform-common-module-versioning.md`

## Short Verdict

Carbonet builder versions should behave like governed release lines with
explicit compatibility ranges, replay checks, and migration plans rather than
implicit prompt changes.
