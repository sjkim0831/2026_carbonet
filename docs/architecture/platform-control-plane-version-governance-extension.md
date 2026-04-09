# Platform Control Plane Version Governance Extension

Generated on 2026-04-08 for control-plane schema alignment.

## Goal

Show how the original control-plane schema and the newer project-version governance schema should be understood together.

This document is the bridge between:

- `docs/sql/platform_control_plane_schema.sql`
- `docs/sql/project_version_governance_schema.sql`

## Core Position

The newer version-governance tables are not a separate product.

They are an extension of the control-plane schema for:

- version-pinned common artifacts
- project-installed artifact tracking
- adapter change history
- release-unit and deployment trace visibility

## Existing Core Tables

The original platform-control-plane draft already owns:

- `PROJECT_REGISTRY`
- `COMMON_MODULE_REGISTRY`
- `INSTALL_UNIT`
- `INSTALL_UNIT_COMMON_MODULE`
- `RESOURCE_REGISTRY`
- `PROJECT_DB_MIGRATION_STATUS`
- `RELEASE_UNIT`
- `PROJECT_DB_CONNECTION`

## Extension Tables

The version-governance extension adds:

- `ARTIFACT_VERSION_REGISTRY`
- `PROJECT_ARTIFACT_INSTALL`
- `ADAPTER_CHANGE_LOG`
- `RELEASE_UNIT_REGISTRY`
- `SERVER_DEPLOYMENT_STATE`

## Recommended Conceptual Join Map

### Project

- `PROJECT_REGISTRY.PROJECT_ID`
  -> `PROJECT_ARTIFACT_INSTALL.PROJECT_ID`
  -> `ADAPTER_CHANGE_LOG.PROJECT_ID`
  -> `RELEASE_UNIT_REGISTRY.PROJECT_ID`
  -> `SERVER_DEPLOYMENT_STATE.PROJECT_ID`

### Common Artifact

- `COMMON_MODULE_REGISTRY.MODULE_NAME / VERSION`
  -> normalized into `ARTIFACT_VERSION_REGISTRY`

Recommended future direction:

- keep `COMMON_MODULE_REGISTRY` as module-family registry
- use `ARTIFACT_VERSION_REGISTRY` as actual build-version registry

### Release Unit

- `RELEASE_UNIT.RELEASE_UNIT_ID`
  <-> `RELEASE_UNIT_REGISTRY.RELEASE_UNIT_ID`

Recommended interpretation:

- `RELEASE_UNIT`
  - approval and environment release control
- `RELEASE_UNIT_REGISTRY`
  - artifact-set and adapter-set composition detail

### Deployment State

- `RELEASE_UNIT_REGISTRY.RELEASE_UNIT_ID`
  -> `SERVER_DEPLOYMENT_STATE.RELEASE_UNIT_ID`

## Recommended Migration Direction

Do not delete the original schema draft.

Instead:

1. keep `platform_control_plane_schema.sql` as the primary control-plane baseline
2. treat `project_version_governance_schema.sql` as the version-governance extension
3. gradually align overlapping fields during implementation

## Overlap Rules

### `COMMON_MODULE_REGISTRY` vs `ARTIFACT_VERSION_REGISTRY`

Use this split:

- `COMMON_MODULE_REGISTRY`
  - logical module family and compatibility policy
- `ARTIFACT_VERSION_REGISTRY`
  - immutable published build versions and storage keys

### `RELEASE_UNIT` vs `RELEASE_UNIT_REGISTRY`

Use this split:

- `RELEASE_UNIT`
  - release approval and lifecycle state
- `RELEASE_UNIT_REGISTRY`
  - concrete artifact set, adapter version, runtime package, rollback target

## Practical Conclusion

The repository should not treat version governance as a detached side schema.

It should treat it as:

- a control-plane schema extension
- centered on immutable artifact versions
- joined back to project, release, and deployment governance

