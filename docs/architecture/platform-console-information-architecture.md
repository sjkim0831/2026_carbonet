# Platform Console Information Architecture

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define the main system as the platform console that replaces ad hoc IDE-driven management for common modules, projects, menus, resources, install units, and deployment governance.

## Core Position

The main system is not just another business app.

It is the authoritative platform console for:

- common module governance
- project registration and rollout control
- menu and install-unit lifecycle management
- resource ownership and delete safety
- audit, trace, and change history

This console should be the place where a top-level master account can see and control what used to be scattered across source browsing, IDE search, SQL scripts, and manual deployment notes.

## Primary Actors

### `SUPER_MASTER`

Platform-wide authority.

Can manage:

- common platform versions
- project registration and status
- project DB connection metadata
- menu and install-unit policies
- shared resource classification
- delete approval and rollback approval
- compatibility and upgrade gates
- orphan and drift scan execution

### `PROJECT_ADMIN`

Project-scoped authority.

Can manage:

- project-owned menus
- project-owned install units
- project-owned routes, screens, functions, and APIs
- project-owned DB objects within approved boundaries
- project deployment metadata for assigned projects

Cannot override:

- common platform security policy
- common shared-resource ownership
- global delete policy
- platform version publication

### `AUDITOR` or `OPERATOR`

Read-mostly or approval-focused actor.

Can review:

- audit and trace history
- install and delete plans
- drift or orphan findings
- rollout status

## Main Console Areas

### 1. Platform Overview

Shows:

- current common platform version
- deployed project count
- pending install, upgrade, and delete plans
- orphan and drift alerts
- compatibility warnings

### 2. Common Module Management

Shows and manages:

- shared jar or module versions
- `SI_COMMON` and `OPS_COMMON` module groups
- optional security, UI, data, and integration common groups
- compatibility matrix by project
- common contract versions
- security-sensitive dependency updates
- facade and adapter ownership

### 3. Project Registry

Shows and manages:

- `projectId`
- display name
- route prefix or domain
- deployment target
- Java version
- DB driver version
- project module version
- current common-platform version
- common DB linkage status
- project DB migration status
- status and owner

### 4. Menu and Install Unit Management

Shows and manages:

- menu tree
- page IDs
- function and permission chain
- route and canonical URL
- package ownership
- selected common modules and versions
- install status
- copy, export, import, upgrade, deprecate, and delete actions

This area should become the operational root for new feature onboarding.

### 5. Resource Registry

Shows and manages:

- files
- controllers
- services
- mappers
- XML
- DTOs
- tables
- columns
- indexes
- uploaded asset definitions
- PDFs, downloads, and templates

Each resource should expose:

- `ownerScope`
- `usageMode`
- `projectId`
- `packageId`
- dependency count
- last verification result

### 6. Delete and Rollback Planning

Shows:

- generated delete plan
- dependency order
- shared blockers
- DB drop candidates
- file delete candidates
- rollback checkpoints

Delete execution should start here, not from a simple menu delete button.

### 7. Audit, Trace, and Change History

Shows:

- who changed what
- what package was installed or deleted
- what common version changed
- what project was upgraded
- what delete plan was approved

### 8. Drift and Orphan Control

Shows:

- ownerless resources
- dead references
- manifest drift
- route drift
- DB objects with no current owner
- files or code artifacts missing from registry

## Default Workflow

Recommended platform workflow:

1. register or update project
2. select target project and module boundary
3. define or clone install unit from menu management
4. generate or bind frontend, backend, and DB resources
5. register every resource in the registry
6. run compatibility and ownership verification
7. install or deploy
8. track changes through audit and trace
9. use delete-plan and rollback-plan instead of manual cleanup

## Boundaries

The platform console should manage metadata, contracts, and lifecycle authority.

The deployed project apps should execute business logic and serve user traffic.

The platform console should retain a stable common DB as its control plane, even when project business data is split into project DBs.

The platform console should not require deployed project apps to fetch live source code from the main system. Shared behavior must come from versioned artifacts, not runtime source pull.

## Recommended First Build In This Repository

1. extend `ScreenCommandCenterServiceImpl` metadata toward package and resource ownership
2. extend the help or command-center admin UI into a platform console panel
3. add project registry and version status views
4. add install-unit lifecycle actions and delete-plan preview
5. add orphan and drift reporting
6. then split common module packaging and project module rollout more aggressively
