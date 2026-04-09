# Artifact And Release Naming Contract

Generated on 2026-04-08 for common artifact and project release governance.

## Goal

Define one naming contract for:

- common artifacts
- adapter artifacts
- installable packages
- release units
- runtime packages
- deployment traces

This contract exists so version governance stays queryable across many projects without ambiguous names.

## Core Rule

Names must answer these questions without opening source code:

1. what artifact family is this
2. which project does it belong to, if any
3. which version line does it belong to
4. whether it is common, adapter, or runtime

Prefer explicit structured names over human-memory-driven nicknames.

## Required Identity Fields

Use these fields consistently:

- `projectId`
- `artifactFamily`
- `artifactId`
- `artifactVersion`
- `adapterContractVersion`
- `releaseUnitId`
- `runtimePackageId`
- `deployTraceId`

## Artifact Family Rules

Recommended artifact family values:

- `COMMON_CORE_JAR`
- `COMMON_FRONTEND_BUNDLE`
- `API_PACKAGE`
- `PROCESS_PACKAGE`
- `THEME_PACKAGE`
- `PROJECT_ADAPTER_JAR`
- `PROJECT_RUNTIME_JAR`

## Naming Rules

### Common Artifact

Format:

- `<artifactId>-<artifactVersion>`

Examples:

- `resonance-common-core-1.2.0`
- `resonance-member-api-1.0.4`
- `resonance-member-process-1.1.0`

### Project Adapter Artifact

Format:

- `<projectId>-adapter-<adapterContractVersion>-<artifactVersion>`

Examples:

- `carbonet-main-adapter-v1-0.9.3`
- `member-core-adapter-v2-1.0.0`

Rule:

- adapter contract version must be visible in the artifact name

### Project Runtime Artifact

Format:

- `<projectId>-runtime-<artifactVersion>`

Examples:

- `carbonet-main-runtime-2026.04.08.1`
- `member-core-runtime-2026.04.09.2`

### Release Unit

Format:

- `ru-<projectId>-<yyyymmdd>-<sequence>`

Examples:

- `ru-carbonet-main-20260408-01`
- `ru-member-core-20260409-02`

Rule:

- release unit is the governed deployment selection key
- it is not the same as a git branch name

### Runtime Package

Format:

- `rp-<projectId>-<release-sequence>`

Examples:

- `rp-carbonet-main-00031`
- `rp-member-core-00007`

### Deployment Trace

Format:

- `dt-<projectId>-<yyyymmddhhmmss>-<sequence>`

Examples:

- `dt-carbonet-main-20260408113055-01`
- `dt-member-core-20260409100510-01`

## Metadata Link Rule

The naming contract is not a replacement for DB metadata.

Every release unit should link to:

- selected common artifact set
- selected adapter artifact
- selected runtime artifact
- selected package versions
- rollback target release unit

## Version Scope Rule

Use artifact version lines like:

- `1.2.0`
- `1.2.1`
- `2.0.0`

Use adapter contract lines like:

- `v1`
- `v2`

Do not hide both concepts inside one ambiguous version string.

Good:

- `resonance-common-core-1.2.1`
- `carbonet-main-adapter-v1-0.9.3`

Bad:

- `common-latest`
- `adapter-final`
- `project-runtime-new`

## Query Rule

The project management system should be able to answer:

- which common core version is project A using
- which adapter contract version is project A using
- which release unit is active on server X
- which older release unit can be rolled back

without inspecting source or jar contents directly.

## Practical Conclusion

Name artifacts and releases so they are:

- explicit
- versioned
- project-aware where needed
- stable enough for DB joins and operator search

