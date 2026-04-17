# Admin Package Governance Screen Design

Generated on 2026-04-16 for Carbonet package/runtime governance.

## Goal

Define the operational screen for managing:
- project-specific versions (common-core, gate, adapter)
- compatibility classes
- runtime package paths and boot targets
- upgrade and rollback status

## Data Source

The screen reads from and writes to the following "Source of Truth" files:
- `data/version-control/package-registry.json` (Available versions)
- `data/version-control/project-runtime-manifest.json` (Project-specific active versions)
- `data/version-control/compatibility-matrix.json` (Compatibility rules)

## Screen Layout Design

The screen consists of three main sections:

### 1. Fleet Overview (Project List)

A table showing all projects and their high-level status.

| Project ID | Project Name | common-core | gate | adapter | Status | Actions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| P001 | Carbonet Standard | 1.1.0 | v1 | 1.0.0 | [RUNNING] | [Manage] [Logs] |
| P002 | Steel Project | 1.0.0 | v1 | 1.0.0 | [UPGRADING] | [Manage] [Logs] |

### 2. Project Management Detail (Manage Mode)

When a project is selected, show detailed configuration and upgrade options.

#### A. Active Version & Path Configuration
- **common-core**: `1.1.0` (Latest)
- **stable-gate**: `v1`
- **adapter**: `1.0.0`
- **Package Path**: `apps/project-runtime/target/project-runtime.jar`
- **Boot Target**: `var/run/project-runtime/P001/project-runtime.jar`
- **Boot Command**: `java -jar ...` [Edit]

#### B. Compatibility Analysis
- Current state: `IMPLEMENTATION_SAFE`
- Note: "Internal observability and performance optimization. No contract changes."

#### C. Upgrade/Rollback Center
- **Available common-core versions**:
  - `1.1.0` (Active)
  - `1.2.0-RC1` (Newer) [Check Compatibility] [Upgrade]
- **Rollback Target**: `1.0.0` [Rollback]

### 3. Artifact Registry (Global View)

A list of all released artifacts available in the platform.

- **common-core**: `1.1.0`, `1.0.0`, `0.9.0`
- **stable-gate**: `v1`
- **adapters**: `carbonet-default-adapter@1.0.0`

## Behavioral Workflow

### 1. Upgrade Trigger
1. User selects a new version for a project.
2. System queries `compatibility-matrix.json`.
3. If `IMPLEMENTATION_SAFE`, show "Fast Upgrade Possible" (Green).
4. If `CONTRACT_AWARE`, show "Adapter Review Required" (Yellow).
5. If `BREAKING`, show "Requires New Gate Version" (Red).
6. User clicks [Upgrade].
7. System updates `project-runtime-manifest.json` and triggers deployment script.

### 2. Boot Path Management
1. User edits "Boot Target" or "Boot Command".
2. System validates if the path follows the `var/run/project-runtime/<project-id>/` rule.
3. System saves to `project-runtime-manifest.json`.

## Technical Implementation (Frontend)

- **Feature Code**: `ADMIN_PACKAGE_GOVERNANCE`
- **Route**: `/admin/system/package-governance`
- **Components**:
  - `ProjectFleetTable`: List of projects.
  - `VersionControlPanel`: Individual project management.
  - `CompatibilityAlert`: Visual warning based on matrix rules.
  - `ArtifactRegistryView`: Read-only view of all versions.

## Future Expansion
- **Automatic Health Check**: Integration with `SERVER_DEPLOYMENT_STATE` to show real-time health.
- **Diff Viewer**: Show code diff between common-core versions (via git/registry metadata).
- **Auto-Rollback**: Trigger rollback if health check fails after upgrade.
