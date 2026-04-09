# Framework Common Theme Project Inventory

## Purpose

Track the repository-wide lanes needed for fast framework reuse:

- `COMMON_PRIMITIVE`
- `THEME_PRESENTATION`
- `PROJECT_BINDING`
- `MIXED_TRANSITION`

This inventory is intentionally broad.
It is meant to cover the whole project folder, not only the builder package split.

## Current Inventory

### `COMMON_PRIMITIVE`

- `modules/screenbuilder-core`
- `modules/screenbuilder-runtime-common-adapter`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `modules/carbonet-mapper-infra`
- `frontend/src/features/admin-ui`
- `frontend/src/features/admin-entry`
- `frontend/src/features/screen-builder/shared`
- `templates/screenbuilder-project-bootstrap/manifests`
- `templates/screenbuilder-project-bootstrap/bootstrap-validator-checklist.md`
- `docs/architecture/installable-module-manifest-contract.md`
- `docs/architecture/framework-common-theme-project-separation-map.md`

### `THEME_PRESENTATION`

- `templates/screenbuilder-project-bootstrap/manifests/theme-install-manifest.json`
- theme token, preview, and component override contracts
- future `theme registry / install-bind / preview / rollback` screens

### `PROJECT_BINDING`

- `modules/screenbuilder-carbonet-adapter`
- `apps/carbonet-app`
- `templates/screenbuilder-project-bootstrap/sample-project-adapter`
- project business packages under `src/main/java/egovframework/com/feature/*`

### `MIXED_TRANSITION`

- builder/theme/API admin consoles that still depend on project routes but aim to become framework consoles
- theme-related runtime logic that is still embedded in project services
- theme and API menus that exist as placeholders but do not yet execute install/validate/rollback actions

## Immediate Gaps

### Theme

- no real theme registry/install/bind runtime yet
- no dedicated theme module path under `modules/`
- no dedicated frontend `theme-*` feature family yet

### API Package

- no full manifest-driven API registry/install validator lifecycle yet

### Project Bootstrap

- common versus project split is strong for builder code
- but `PROJECT_BINDING` is still too Carbonet-specific to claim true `3-minute bootstrap`

## Next Mandatory Split

Before claiming framework-level reuse:

1. split `screenbuilder-carbonet-adapter` into:
   - `common runtime adapter`
   - `project binding adapter`
2. create real `THEME_PRESENTATION` module ownership
3. keep project business code out of theme package boundaries

Current progress:

- `screenbuilder-runtime-common-adapter` now exists as the first reusable common runtime adapter lane
- property-backed policy ports no longer need to be reimplemented in every new project template
- repository-wide screen/process candidate inventory now exists in `docs/architecture/installable-screen-process-inventory.md`
- backend reusable-read versus project-executor candidate map now exists in `docs/architecture/reusable-read-and-executor-candidate-map.md`

## New Repository-Wide Reuse Targets

### Installable Business Processes

Process reuse should be split as:

- `PROCESS_DEFINITION`
- `PROCESS_BINDING`
- `PROJECT_EXECUTOR`

Current repository status:

- builder install/validator/rollback flow is moving toward `PROCESS_DEFINITION`
- project service packages still own most `PROJECT_EXECUTOR` behavior
- reusable process packaging contract is now documented, but not yet implemented as a dedicated module family

### Reusable Read Modules

Best early candidates:

- builder registry/detail/install read models
- theme and API registry read models
- validator evidence read models
- rollback evidence read models
- install queue summaries

Current repository status:

- read-heavy admin consoles exist
- but their data layer is not yet explicitly separated as `COMMON_READ` versus project-owned read bindings
- first read-port cut now exists for menu lookup, admin menu tree, governance registry lookup, and admin summary lookup
- first command-contract cut now exists for governance registry writes and security-summary action flows
- `AdminIpWhitelistSupportService` now provides a reusable read/project-bind support slice for ip-whitelist registry pages instead of keeping that logic inside the controller
- `AdminSecurityBootstrapReadService` now provides a reusable security read/project-bind slice for policy, monitoring, and audit consoles
- `AdminHomeBootstrapReadService` now provides a reusable admin-home read/project-bind slice for summary and review dashboard bootstrap
- `AdminSchedulerBootstrapReadService` now provides a reusable scheduler read/project-bind slice for scheduler dashboard bootstrap
- `AdminEmissionResultBootstrapReadService` now provides a reusable emission-result read/project-bind slice for list/detail dashboard bootstrap
- `AdminTradeBootstrapReadService` now provides a reusable trade read/project-bind slice for list, statistics, duplicate, and approve/reject base-row bootstrap
