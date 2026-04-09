# Artifact Registry And Project Version Governance

Generated on 2026-04-08 for common-module and project-install governance.

## Goal

Define how the system should manage:

- versioned common artifacts
- project-installed versions
- adapter change history
- server deployment state

This document assumes:

- source development is separated between common and project lines
- projects consume common artifacts through importable jars or installable bundles
- projects are upgraded selectively, not automatically

## Core Rule

`DB metadata only` is not enough.

`Git tag only` is not enough.

Use both:

1. `artifact registry`
2. `metadata governance DB`

See also:

- `docs/architecture/artifact-and-release-naming-contract.md`
- `docs/architecture/project-version-management-console-ia.md`
- `docs/sql/project_version_governance_schema.sql`

The artifact registry stores the real build outputs.
The metadata DB stores what exists, what changed, where it is deployed, and which project is allowed to use it.

## Required Storage Lanes

### `ARTIFACT_REGISTRY`

Stores versioned immutable build outputs such as:

- common jars
- frontend common bundles
- installable API packages
- installable business-process packages
- theme packages
- project adapter artifacts
- project runtime packages

Rule:

- never overwrite a released artifact version
- publish a new version instead

### `METADATA_DB`

Stores governance metadata such as:

- artifact version rows
- package compatibility rows
- project installed-version rows
- adapter contract rows
- adapter change history
- release-unit deployment rows
- rollback target rows

## Mandatory Metadata

### Common Artifact Metadata

Each common artifact row should record at minimum:

- `artifactId`
- `artifactType`
- `artifactVersion`
- `groupLine`
- `storageKey`
- `checksum`
- `commonCoreVersion`
- `adapterContractVersion`
- `apiContractVersion`
- `manifestContractVersion`
- `capabilityCatalogVersion`
- `builtAt`
- `publishedAt`
- `publishedBy`
- `compatibilityStatus`

### Project Installed-Version Metadata

Each project-install row should record at minimum:

- `projectId`
- `artifactId`
- `installedArtifactVersion`
- `installScope`
- `installedAt`
- `installedBy`
- `releaseUnitId`
- `activeYn`
- `rollbackTargetVersion`

### Server Deployment Metadata

Each deployment row should record at minimum:

- `serverId`
- `serverRole`
- `projectId`
- `releaseUnitId`
- `runtimePackageVersion`
- `commonArtifactSet`
- `adapterArtifactVersion`
- `deployedAt`
- `deployedBy`
- `healthStatus`

Recommended server roles:

- `ACTIVE`
- `PREVIEW`
- `STAGE`
- `IDLE`

## Adapter Change Recording Rule

Adapter changes are mandatory governance events.

Do not treat adapter edits as ordinary local code churn.

Every adapter-affecting release should record:

- `adapterContractVersion`
- `adapterArtifactVersion`
- `changedPortSet`
- `changedDtoSet`
- `mappingImpactSummary`
- `compatibilityClass`
- `migrationRequiredYn`

Compatibility classes:

- `ADAPTER_SAFE`
  - no adapter rewrite required
- `ADAPTER_REVIEW_REQUIRED`
  - mapping review required
- `ADAPTER_BREAKING`
  - new adapter contract line required

## Project Management Console Rule

The project management program should show, per project:

- currently installed common versions
- currently installed API/process/theme package versions
- adapter contract version
- adapter artifact version
- latest available compatible version
- incompatible available versions
- current server deployment state
- rollback target state
- recent adapter change history
- active release-unit identity

Operators should be able to:

- inspect version differences
- approve selective upgrades
- reject incompatible upgrades
- deploy a chosen release unit
- roll back to the previous approved release unit

The metadata DB draft tables for this are captured in:

- `docs/sql/project_version_governance_schema.sql`

## Upgrade Rule

When common code changes:

1. build a new versioned artifact
2. publish it to the artifact registry
3. write version metadata
4. classify adapter impact
5. expose the new version in the project management console
6. let projects opt in selectively
7. deploy only after compatibility passes

Do not treat a new common artifact as globally active by default.

## Retention Rule

Because projects may remain on different versions:

- old released common artifacts must be preserved
- old adapter-compatible lines must remain queryable
- rollback-target artifacts must remain retrievable

Storage cost is expected.
Manage it with retention and archive policy, not by deleting active historical versions casually.

## Practical Conclusion

Common management is reliable only when:

- common artifacts are versioned and preserved
- project-installed versions are recorded explicitly
- adapter change history is mandatory
- the project management system can inspect and apply versions safely
