# Package Governance Management Screen Design

Generated on 2026-04-16 for Carbonet platform operations and upgrade governance.

## Goal

Provide a visual interface for operators to manage project runtimes, verify compatibility, and execute upgrades across the fleet.

## 1. Information Architecture

The screen is part of the `Operations Console` and follows the `OperationsActionGate` pattern.

### Navigation Path
`Operations > Governance > Package & Runtime Management`

### Primary Views

#### A. Fleet Status Dashboard
- **Visual**: A table showing all projects and their current health.
- **Columns**:
  - Project (ID/Name)
  - Active Version (Core/Gate/Adapter)
  - Runtime Status (Running/Stopped/Error)
  - Last Health Check
  - Action: [Manage] [Restart] [Stop]

#### B. Project Detail & Upgrade Center
- **Context**: Opens when a project is selected.
- **Components**:
  - **Current Installation**: Details of active JARs and paths.
  - **Upgrade Candidates**: A list of compatible `common-core` versions from `package-registry.json`.
  - **Compatibility Check**: A visual indicator showing the results from `compatibility-matrix.json` (e.g., "IMPLEMENTATION_SAFE").
  - **Upgrade Button**: Triggers a sequence:
    1. Stop runtime.
    2. Backup current JAR.
    3. Copy new JAR to `bootTarget`.
    4. Update `manifest.json`.
    5. Start runtime.

#### C. Artifact Registry Browser
- **Visual**: A read-only list of all available artifacts in the platform.
- **Filters**: Component Type (Core, Gate, Adapter), Version.

## 2. API Design (Gate Actions)

The screen interacts with the backend through these gate actions:

- `operations.governance.project.list`: Get all projects from `project-runtime-manifest.json`.
- `operations.governance.project.get`: Get details for one project.
- `operations.governance.artifact.list`: Get available artifacts from `package-registry.json`.
- `operations.governance.compatibility.check`: Check compatibility for an upgrade target.
- `operations.governance.runtime.execute-upgrade`: Start the automated upgrade process.
- `operations.governance.runtime.control`: Send Start/Stop/Restart commands.

## 3. Implementation Rule

1. **Read-Through**: The screen must always read from the JSON files (or DB tables synced from them) as the source of truth.
2. **Atomic Upgrades**: The upgrade action must be atomic and support rollback by simply pointing the `bootTarget` back to the previous JAR version.
3. **Audit Logging**: Every action taken on this screen must be recorded in the platform's audit trail via `AuditTrailService`.

## 4. UI Mockup (Text Representation)

```text
+--------------------------------------------------------------------------+
| [Operations Console] > Governance > Package Management                   |
+--------------------------------------------------------------------------+
| FLEET OVERVIEW                                          [+] New Project  |
+---------+-----------------+------------+----------+-----------+----------+
| Project | Core Version    | Gate Ver.  | Status   | Health    | Actions  |
+---------+-----------------+------------+----------+-----------+----------+
| P001    | 1.1.0           | v1         | RUNNING  | [OK]      | [Manage] |
| P002    | 1.0.0 (Old!)    | v1         | RUNNING  | [OK]      | [Manage] |
| P003    | 1.1.0           | v1         | STOPPED  | [-]       | [Manage] |
+---------+-----------------+------------+----------+-----------+----------+

[ UPGRADE CENTER: P002 ]
Current: 1.0.0 (IMPLEMENTATION_SAFE)
Available Upgrades:
- 1.1.0 [IMPLEMENTATION_SAFE]  [Recommended]  [UPGRADE NOW]
- 1.2.0 [CONTRACT_AWARE]       [Requires Adapter Update]

Runtime Path: var/run/project-runtime/P002/project-runtime.jar
Log Path:     var/logs/project-runtime/P002/stdout.log
```
