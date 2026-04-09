# Installable Builder Admin Console Refactor Plan

## Goal

Refactor the current builder-related admin screens away from placeholder and lookalike pages into a governed operations console that supports:

- builder package registry
- project install/bind
- validator result review
- rollback history
- package build and publish
- future theme package and API package installation

## Core Rule

Do not expand screen count until each screen has a clear job.

Every builder/theme/API admin screen must be classified as one of:

- `registry`
- `detail`
- `install-bind`
- `validator-result`
- `rollback-history`
- `package-builder`

If a page does not fit one of these roles, it is probably a placeholder and should be merged, removed, or re-scoped.

## Current Carbonet Screen Inventory

Current builder-adjacent screens that should be reused instead of replaced blindly:

- `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`
- `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
- `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`
- `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`
- `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`
- `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
- `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`
- `frontend/src/features/screen-builder/panels/ScreenBuilderGovernancePanels.tsx`

These pages already contain data, governance, or registry concepts.
The problem is that their section ownership is not yet aligned to an installable-module lifecycle.

## Target Reclassification

Canonical screen ownership after current refactor:

- `registry`
  - `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`
  - UI title: `Menu Registry Console`
- `detail`
  - `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
  - UI title: `Registry Detail Console`
- `install-bind`
  - `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`
  - UI title: `Builder Install / Bind Console`
- `validator-result`
  - `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`
  - `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
- `rollback-history`
  - `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`
- `package-builder`
  - `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`
  - UI title: `Builder Package Studio`

### 1. Builder Registry

Target role: `registry`

Primary candidate:

- `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`

Refactor direction:

- keep it focused on menu/page inventory
- remove unrelated packaging or validator concerns
- use it as the entry inventory for builder-manageable pages

Required sections:

- package-aware menu/page inventory
- builder-ready status
- package ownership badge
- selected page handoff into detail/install views
- current console naming should stay `Menu Registry Console`

### 2. Builder Detail And Governance

Target role: `detail`

Primary candidates:

- `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
- `frontend/src/features/screen-builder/panels/ScreenBuilderGovernancePanels.tsx`

Refactor direction:

- keep deep metadata, registry, authority, and schema insight here
- stop mixing this screen with install execution
- make it the governed detail view for one builder package or one page package unit

Required sections:

- manifest summary
- component registry status
- authority chain
- event/function/API/schema links
- package ownership and dependency view
- current console naming should stay `Registry Detail Console`

### 3. Install And Bind Console

Target role: `install-bind`

Primary candidate:

- `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`

Refactor direction:

- reposition this page as the install/bind dashboard
- show project bindings, missing inputs, builder readiness, and package attach actions
- this is where new-project bootstrap and project attach flows should live

Required sections:

- required binding checklist
- install input editor
- builder/theme/API package attach actions
- per-project bind state
- next-action guidance
- current console naming should stay `Builder Install / Bind Console`

### 4. Validator Result Console

Target role: `validator-result`

Primary candidates:

- `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`
- `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
- validator slices inside `ScreenBuilderGovernancePanels.tsx`

Refactor direction:

- consolidate publish/install validation and parity/runtime comparison into one validator console family
- separate blocking errors from advisory warnings

Required sections:

- bootstrap validator result
- package compatibility result
- runtime compare result
- registry validation result
- publish/install blocking reasons
- this family should read as validator-first, not generic runtime tooling

### 5. Rollback And Repair

Target role: `rollback-history`

Primary candidate:

- `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`

Refactor direction:

- align this page with rollback and repair history instead of generic repair workbench framing
- connect it to install/package rollback units

Required sections:

- rollback unit history
- repair attempt history
- validator failure lineage
- reapply and rollback actions
- this family should read as rollback-first, not generic repair tooling

### 6. Package Builder

Target role: `package-builder`

Primary candidate:

- `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`

Refactor direction:

- keep authoring and publish actions here
- add package manifest summary and package output preview
- stop using this page as a catch-all admin governance page

Required sections:

- draft authoring
- package manifest preview
- artifact evidence preview
- publish/package action
- handoff into validator-result and rollback-history
- current console naming should stay `Builder Package Studio`

## Theme And API Upgrade Rule

Current theme or API menus should not grow independently yet.

First align them to the same six-role model:

- theme registry
- theme detail
- theme install-bind
- theme validator-result
- theme rollback-history
- theme package-builder

- API registry
- API detail
- API install-bind
- API validator-result
- API rollback-history
- API package-builder

If an existing theme/API page cannot be mapped to one of these, treat it as a placeholder and redesign it before adding more fields.

## Immediate Refactor Sequence

1. classify all existing builder/theme/API admin pages into the six target roles
2. merge or retire pages that cannot be classified cleanly
3. keep `MenuManagementMigrationPage` aligned as `Menu Registry Console`
4. keep `FullStackManagementMigrationPage` aligned as `Registry Detail Console`
5. keep `EnvironmentManagementHubPage` aligned as `Builder Install / Bind Console`
6. keep `ScreenBuilderMigrationPage` aligned as `Builder Package Studio`
7. refactor `ScreenRuntimeMigrationPage` and `CurrentRuntimeCompareMigrationPage` into validator-result family
8. refactor `RepairWorkbenchMigrationPage` into rollback-history-first console

## Success Definition

The refactor is good enough when:

- each admin page has one primary job
- install and validator actions are no longer buried inside mixed pages
- theme and API flows can reuse the same console pattern
- placeholder pages are reduced rather than multiplied
