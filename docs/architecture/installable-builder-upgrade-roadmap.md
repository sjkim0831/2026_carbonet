# Installable Builder Upgrade Roadmap

## Goal

Turn the current builder split into a framework-grade product that supports:

- `3-minute new-project bootstrap`
- versioned `jar` import and upgrade
- project adapter migration instead of source copy
- installable theme packages
- installable API packages
- installable business process packages
- admin operations screens that actually govern those packages instead of placeholder menus

## Current Gap

The repository has made real progress on core-versus-project separation, but it is still far from a Cafe24-like framework product.

Current weaknesses:

- many admin screens exist only as placeholders with little or no behavior
- multiple screens look too similar and do not express clear ownership or workflow
- builder menu integration screens still have weak sectioning and mixed responsibilities
- theme-related menus exist, but they do not yet provide a real installable theme lifecycle
- API-related menus exist, but they do not yet provide a real installable API module lifecycle
- previous "build many things at once" attempts created surface area faster than governed runtime value

This means the next phase should not optimize for screen count.
It should optimize for installable product quality.

## Non-Negotiable Product Definition

Do not call the builder "installable" or "3-minute ready" until all of the following are true:

1. backend core is imported as `jar`
2. project-specific behavior is isolated to adapters and config
3. frontend builder shell is packageable and versioned
4. install inputs are small, explicit, and validator-checked
5. theme packages are installable and selectable without source edits
6. API packages are installable and bindable without source edits
7. business process packages are installable with thin project executors
8. admin operations screens actually execute install, validate, upgrade, rollback, and binding work

Do not call a page "builder-ready" or "installable" unless it also satisfies:

- `docs/architecture/page-systemization-minimum-contract.md`

In particular, page identity, authority scope, contract visibility, install scope, and validator visibility must move together.

## Required Upgrade Areas

### 1. Builder Core And Adapter Productization

Needed state:

- `screenbuilder-core` remains the reusable backend line
- `screenbuilder-runtime-common-adapter` carries reusable default policy behavior
- project adapters stay thin and input-driven
- bootstrap starter skeletons exist
- install validators exist

Target later split:

- runtime builder support can be imported without the full admin editor
- admin editor/tooling can be versioned as a separate module line

Still needed:

- reduce required install inputs to a small governed set
- add bootstrap validator flow
- add compatibility manifest and version check flow
- prove one sample project can attach the builder in minutes

Current improvement:

- `screenbuilder-runtime-common-adapter` now supplies reusable property-backed policy ports
- new project templates no longer need to reimplement all four policy ports by default

Current baseline assets now exist:

- `docs/architecture/installable-module-manifest-contract.md`
- `docs/architecture/installable-business-process-package-model.md`
- `docs/architecture/reusable-read-module-separation-plan.md`
- `docs/architecture/installable-screen-process-inventory.md`
- `docs/architecture/reusable-read-and-executor-candidate-map.md`
- `modules/screenbuilder-runtime-common-adapter`
- `templates/screenbuilder-project-bootstrap/manifests/*.json`
- `templates/screenbuilder-project-bootstrap/bootstrap-validator-checklist.md`
- `templates/screenbuilder-project-bootstrap/validate-screenbuilder-bootstrap.sh`
- `ops/scripts/audit-screenbuilder-bootstrap-assets.sh`
- `docs/architecture/installable-builder-admin-console-refactor-plan.md`

### 2. Theme Package Productization

Current theme-related screens are not enough by themselves.

A real installable theme package must include:

- theme manifest
- typography and token contract
- page-frame overrides
- component style overrides
- preview and rollback
- per-project binding
- install compatibility checks

Needed backend/runtime additions:

- theme manifest schema
- theme install/bind tables
- theme asset package loader
- theme validator
- clear split between `COMMON_PRIMITIVE`, `THEME_PRESENTATION`, and `PROJECT_BINDING`

Needed admin UI additions:

- theme registry
- theme package detail
- theme install/bind page
- theme preview and rollback page

Theme scale rule:

- many theme elements are acceptable
- many theme-owned business rules are not
- keep business logic in common core or project binding, not in theme packages
- folder-based theme packages are acceptable when they stay presentation-only and manifest-driven

### 3. API Module Productization

Current API-related pages are not enough if they only list or edit metadata.

A real installable API module package must include:

- API manifest
- route or operation contract
- auth/scope requirements
- request/response schema contract
- install compatibility checks
- version and rollback rules

Needed backend/runtime additions:

- API package manifest schema
- API install/bind tables
- API module registry
- compatibility validator

Needed admin UI additions:

- API package registry
- API package detail
- API install/bind page
- API validator result page

### 4. Admin Operations Console Refactor

This is where the current implementation is weakest.

The admin menus should stop being "screen count" surfaces and become governed consoles with real actions.

Every builder/theme/API admin screen should be classified as one of:

- `registry`
- `detail`
- `install-bind`
- `validator-result`
- `rollback-history`
- `package-builder`

If a screen cannot be classified like this, it is probably a placeholder and should not be expanded yet.

Current canonical builder-console mapping:

- `registry` = `Menu Registry Console`
  - `frontend/src/features/menu-management/MenuManagementMigrationPage.tsx`
- `detail` = `Registry Detail Console`
  - `frontend/src/features/menu-management/FullStackManagementMigrationPage.tsx`
- `install-bind` = `Builder Install / Bind Console`
  - `frontend/src/features/environment-management/EnvironmentManagementHubPage.tsx`
- `validator-result` = runtime/compare validator family
  - `frontend/src/features/screen-builder/ScreenRuntimeMigrationPage.tsx`
  - `frontend/src/features/screen-builder/CurrentRuntimeCompareMigrationPage.tsx`
- `rollback-history` = repair/rollback family
  - `frontend/src/features/screen-builder/RepairWorkbenchMigrationPage.tsx`
- `package-builder` = `Builder Package Studio`
  - `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`

### 5. Business Process Package Productization

Installable screens, theme packages, and API packages are not enough by themselves.

A real framework product also needs installable process definitions with thin project executors.

Needed common additions:

- process manifest schema
- process stage and transition contract
- executor capability keys
- process bind tables
- process validator and rollback metadata
- reusable read-heavy process screen contracts

Needed project additions:

- thin process binding adapters
- project executors for save/calculate/approval/external side effects

Reference:

- `docs/architecture/installable-business-process-package-model.md`
- `docs/architecture/reusable-read-module-separation-plan.md`

### 6. Home And Admin UI Refactor

The problem is not only visual similarity.
The larger problem is that current screens do not express different jobs clearly.

Refactor goal:

- home screens should express theme/runtime outcomes
- admin screens should express governance and operations
- builder screens should express composition and packaging

Required UI changes:

- page-family rules for registry/detail/install/validator flows
- real section ownership inside integrated builder pages
- stronger visual distinction between theme, API, builder, and runtime governance surfaces
- fewer duplicate empty forms and more task-driven panels

## 3-Minute New Project Bootstrap Rule

To reach a real 3-minute install, the new project should not implement many custom classes before the first working boot.

Target install input set:

- `projectId`
- `menuRoot`
- `runtimeClass`
- `menuScope`
- `releaseUnitPrefix`
- `runtimePackagePrefix`
- optional DB/storage root settings

Anything larger than that means the install flow is still too manual.

## Recommended Execution Order

1. finish installable builder core plus adapter flow
2. add bootstrap validator and compatibility manifest
3. prove one sample new-project bootstrap
4. define theme package contract and install flow
5. define API package contract and install flow
6. define business process package contract and reusable read split
7. refactor admin operations screens around those real flows
8. only then expand screen volume

## Immediate Repository Priorities

The next implementation slices in this repository should be:

1. add bootstrap validator for builder install inputs and required beans
2. add install manifest shape for builder/theme/API packages
3. refactor current builder management screens into registry/detail/install/validator sections
4. turn current theme screens from placeholders into installable theme registry and binding flows
5. turn current API screens from placeholders into installable API registry and binding flows

Current refactor reference:

- `docs/architecture/installable-builder-admin-console-refactor-plan.md`
- `docs/architecture/framework-common-theme-project-separation-map.md`
- `docs/architecture/builder-editor-runtime-module-split.md`

## Success Definition

The upgrade is good enough only when:

- the builder is attachable by dependency import plus thin adapter config
- a new project can boot the builder in minutes
- theme packages can be installed, previewed, bound, and rolled back
- API packages can be installed, validated, bound, and rolled back
- admin screens perform real governed actions instead of acting as empty placeholders
