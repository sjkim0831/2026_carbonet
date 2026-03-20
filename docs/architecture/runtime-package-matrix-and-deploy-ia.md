# Runtime Package Matrix And Deploy Information Architecture

Generated on 2026-03-21 for Resonance project-unit runtime package visibility.

## Goal

Define the operator-facing IA for:

- runtime package matrix
- project-unit deployment readiness
- server-role delivery visibility
- parity and rollback readiness by target

## 1. Runtime Package Matrix

One row should represent one governed asset family inside one release unit.

Required columns:

- `projectId`
- `releaseUnitId`
- `assetFamily`
- `assetId`
- `assetVersion`
- `ownershipScope`
- `deployabilityClass`
- `commonOrProject`
- `buildReadyYn`
- `deployReadyYn`
- `parityReadyYn`
- `uniformityReadyYn`
- `rollbackReadyYn`
- `targetServerRoleSet`
- `mainServerTruthRequiredYn`
- `compareState`
- `blockerCount`
- `patternFamilyState`
- `patternConsistencyReadyYn`
- `styleCoverageReadyYn`
- `styleDedupeReadyYn`

Recommended `assetFamily` values:

- `COMMON_JAR`
- `FRONTEND_BUNDLE`
- `THEME_PACKAGE`
- `TOKEN_BUNDLE`
- `CSS_BUNDLE`
- `JS_BUNDLE`
- `FEATURE_MODULE`
- `MODULE_PATTERN`
- `MENU_TREE`
- `PAGE_MANIFEST`
- `BINDING_MANIFEST`
- `BACKEND_CHAIN`
- `DB_SQL_DRAFT`
- `CRON_BINDING`

## 2. Project-Unit Deploy View

The deploy console should show one project at a time.

Required panes:

### Left: Project Runtime Summary

- project id and display name
- selected framework/common/frontend lines
- main/sub/db/file/archive/idle bindings
- current active release unit
- target release unit

### Center: Runtime Package Matrix

- filter by asset family
- filter by server role
- filter by blocker state
- filter by common/project ownership
- compare current vs target
- compare style coverage and dedupe state
- compare module pattern family and depth profile state

### Right: Deploy And Rollback Rail

- build status
- artifact publish status
- 193 -> 221 and later multi-node delivery status
- main-server smoke status
- scheduler registration status
- rollback target picker

## 3. Server-Role Tabs

Each project-unit deploy screen should expose:

- `MAIN`
- `SUB`
- `IDLE`
- `DB`
- `FILE`
- `ARCHIVE`
- `SCHEDULER`

Each tab should show:

- target host
- package applicability
- macro readiness
- smoke readiness
- parity blockers
- recent deploy trace

## 4. Compare Views

The screen should support compare pivots:

- `current main server` vs `target generated`
- `baseline` vs `current`
- `current` vs `patch target`
- `common line current` vs `common line target`
- `frontend pattern` vs `backend/db/package pattern`
- `theme/css/module style coverage` vs `runtime attached style state`

## 5. Required Actions

Operators should be able to:

- open build details
- open generated asset trace
- open selected-screen repair
- open backend chain explorer
- open SQL draft review
- open deploy macro trace
- open rollback explorer
- open module intake analysis
- open style dedupe review

## 6. Release Blockers

Do not allow deploy-complete status when:

- package matrix has unresolved blockers
- main server smoke failed
- required cron binding missing
- compare state is not green for required families
- common/project split is ambiguous
- pattern consistency is not green across frontend, backend, DB, and runtime package families
- style coverage or style dedupe state is not green
