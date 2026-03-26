# Runtime Package Matrix And Deploy Information Architecture

Generated on 2026-03-21 for Resonance project-unit runtime package visibility.

## Goal

Define the operator-facing IA for:

- runtime package matrix
- project-unit deployment readiness
- server-role delivery visibility
- parity and rollback readiness by target

This lane uses one fixed governed identity set across `06`, `07`, `08`, and `09`:

- `projectId`
- `releaseUnitId`
- `runtimePackageId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `deployTraceId`
- `rollbackAnchorYn`

For the current Carbonet delivery path, the default deploy-lane ownership model is:

- tmux session: `res-08-deploy`
- lane id: `08`
- repeat prompt: `docs/ai/80-skills/resonance-10-session-assignment.md 8번 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`
- build authority host: `233`
- runtime truth host: `221`
- DB control target: `193`

## 1. Runtime Package Matrix

One row should represent one governed asset family inside one release unit.

Required columns:

- `projectId`
- `releaseUnitId`
- `runtimePackageId`
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
- `screenFamilyRuleId`
- `guidedStateId`
- `ownerLane`
- `deployTraceId`
- `rollbackAnchorYn`
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
- `SCREEN_FAMILY_RULE`

## 2. Project-Unit Deploy View

The deploy console should show one project at a time.

Required panes:

### Left: Project Runtime Summary

- project id and display name
- selected framework/common/frontend lines
- main/sub/db/file/archive/idle bindings
- current active release unit
- target release unit
- active runtime package id
- latest deploy trace id
- rollback anchor state

### Center: Runtime Package Matrix

- filter by asset family
- filter by server role
- filter by blocker state
- filter by common/project ownership
- compare current vs target
- compare style coverage and dedupe state
- compare module pattern family and depth profile state
- compare screen-family rule and guided-step ownership state

### Right: Deploy And Rollback Rail

- build status
- artifact publish status
- 233 build -> 221 run with 193 DB target status and later multi-node delivery status
- main-server smoke status
- scheduler registration status
- rollback target picker
- `09` handoff evidence summary

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
- active guided step and family-rule blockers

## 4. Compare Views

The screen should support compare pivots:

- `current main server` vs `target generated`
- `baseline` vs `current`
- `current` vs `patch target`
- `common line current` vs `common line target`
- `frontend pattern` vs `backend/db/package pattern`
- `theme/css/module style coverage` vs `runtime attached style state`
- `screen family rule current` vs `screen family rule target`

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
- copy the numbered-lane repeat command for `08`
- open release-unit evidence prepared for `09`

## 6. Release Blockers

Do not allow deploy-complete status when:

- package matrix has unresolved blockers
- main server smoke failed
- required cron binding missing
- compare state is not green for required families
- common/project split is ambiguous
- pattern consistency is not green across frontend, backend, DB, and runtime package families
- style coverage or style dedupe state is not green
- screen-family rule state is unresolved for required runtime pages
- `releaseUnitId`, `runtimePackageId`, `deployTraceId`, or `ownerLane` is missing from deploy evidence

## 7. Handoff Evidence To 09

`08` is ready to hand off only when the deploy console, runtime package matrix, and session loop all expose the same values for:

- `releaseUnitId`
- `runtimePackageId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `deployTraceId`

The handoff note should be readable without opening implementation code and must answer:

- which release unit is moving
- which runtime package is attached
- which lane owns the deploy evidence
- whether rollback is already anchored
- whether `221` is still the runtime truth
