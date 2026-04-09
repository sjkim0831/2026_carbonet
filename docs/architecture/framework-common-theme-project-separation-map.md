# Framework Common Theme Project Separation Map

## Goal

Define a whole-repository ownership map so Carbonet can move toward:

- `3-minute new-project bootstrap`
- framework-first reuse
- installable theme packages
- thin project adapters instead of project forks

This document answers one practical question:

`which folders should become common framework, which belong to theme packaging, and which must stay project-owned?`

## Core Principle

Do not classify UI assets as only:

- common
- project

Use three layers:

1. `COMMON_PRIMITIVE`
2. `THEME_PRESENTATION`
3. `PROJECT_BINDING`

This is the only scalable way to support many components inside a theme without turning theme packages into project forks.

For business-facing process reuse, use a second split:

1. `PROCESS_DEFINITION`
2. `PROCESS_BINDING`
3. `PROJECT_EXECUTOR`

For builder bootstrap, use the same layered idea on the backend side too:

1. `screenbuilder-core`
2. `screenbuilder-runtime-common-adapter`
3. `project binding adapter`

Editor/admin tooling should be treated as a separate lane after that:

4. `screenbuilder-editor-admin`

## Theme Rule

Theme packages may contain many visual elements.
That is not the problem.

The real problem appears only when a theme starts owning:

- business queries
- project menu semantics
- project runtime transactions
- project authority rules
- project DTO shape

Allowed inside `THEME_PRESENTATION`:

- typography
- colors
- spacing
- radius
- motion
- page frame overrides
- component appearance overrides
- slot layout variants
- preview assets
- theme-local composition presets
- folder-based theme asset sets that can be copied and modified

Not allowed inside `THEME_PRESENTATION`:

- project business services
- project controller rules
- project DB reads and writes
- project-only route contracts
- project-specific DTO ownership

## Ownership Lanes

### `COMMON_PRIMITIVE`

Use for stable framework assets that should survive project changes.

Current repository examples:

- `modules/screenbuilder-core`
- `modules/screenbuilder-runtime-common-adapter`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `modules/carbonet-mapper-infra`
- `frontend/src/features/admin-ui`
- `frontend/src/features/admin-entry`
- `frontend/src/features/screen-builder/shared`
- `templates/screenbuilder-project-bootstrap/manifests`
- `docs/architecture/*contract*.md`

Rule:

- no project business assumptions
- no project menu family assumptions
- no project DTO naming
- no theme-specific branding decisions
- no project-only process execution rules

### `THEME_PRESENTATION`

Use for installable visual/runtime presentation packages that override how primitives look and how governed page families are framed.

Current repository baseline assets:

- `templates/screenbuilder-project-bootstrap/manifests/theme-install-manifest.json`
- theme-oriented docs and future theme registry/install pages

Future expected ownership:

- `modules/screenbuilder-theme-core`
- `modules/screenbuilder-theme-default`
- `frontend/src/features/theme-*`

Rule:

- may depend on common primitives
- may declare many tokens and component overrides
- must stay manifest-driven
- must not absorb project business code
- may be delivered as folder-oriented theme packages for copy-and-modify reuse

### `PROJECT_BINDING`

Use for the thin layer that attaches common framework and optional theme packages into one project runtime.

Current repository examples:

- `modules/screenbuilder-carbonet-adapter`
- `apps/carbonet-app`
- project-specific bridge wiring
- project-specific business packages under `src/main/java/egovframework/com/feature/*`

Rule:

- bind project id, menu root, route base, authority profile, storage root
- keep custom code thin where possible
- prefer config and adapters over copied common logic
- bind reusable process definitions to project executors instead of copying workflows

### `EDITOR_ADMIN`

Use for the builder editing tool and governed admin operations console.

Current repository examples:

- `frontend/src/features/screen-builder/*MigrationPage.tsx`
- `frontend/src/features/menu-management/*`
- `frontend/src/features/environment-management/*`
- admin builder controllers under project adapter paths

Rule:

- editor/admin may be attached to Carbonet today
- but must remain separable from runtime builder jars later
- do not collapse editor workflow logic into runtime core

### `MIXED_TRANSITION`

Use only for areas not fully separated yet.

Current likely hotspots:

- theme-related placeholder admin pages
- project-specific routes that still look like common operations consoles
- runtime/theme comparison logic still embedded in project services

Rule:

- do not deepen coupling
- extract contracts first
- leave only thin project or theme overlays

## Current Whole-Project Folder Classification

### Backend And Modules

- `modules/screenbuilder-core` = `COMMON_PRIMITIVE`
- `modules/screenbuilder-runtime-common-adapter` = `COMMON_PRIMITIVE`
- `modules/carbonet-contract-metadata` = `COMMON_PRIMITIVE`
- `modules/carbonet-builder-observability` = `COMMON_PRIMITIVE`
- `modules/carbonet-mapper-infra` = `COMMON_PRIMITIVE`
- `modules/screenbuilder-carbonet-adapter` = `PROJECT_BINDING`
- `apps/carbonet-app` = `PROJECT_BINDING`
- `src/main/java/egovframework/com/feature/*` = `PROJECT_BINDING` or `PROJECT_ONLY`

### Frontend

- `frontend/src/features/admin-ui` = `COMMON_PRIMITIVE`
- `frontend/src/features/admin-entry` = `COMMON_PRIMITIVE`
- `frontend/src/features/screen-builder/shared` = `COMMON_PRIMITIVE`
- `frontend/src/features/screen-builder/*MigrationPage.tsx` = governed operations consoles, currently `MIXED_TRANSITION` moving toward `COMMON_PRIMITIVE + PROJECT_BINDING`
- builder editor/admin consoles should ultimately become `EDITOR_ADMIN`
- future `frontend/src/features/theme-*` = `THEME_PRESENTATION`

### Templates And Docs

- `templates/screenbuilder-project-bootstrap` = `COMMON_PRIMITIVE`
- theme/api/builder manifest templates = `COMMON_PRIMITIVE`
- sample project adapter = `PROJECT_BINDING` example
- architecture contracts and upgrade roadmaps = `COMMON_PRIMITIVE`

## Practical Upgrade Order

To make most of the framework common:

1. move reusable primitives and install contracts into `COMMON_PRIMITIVE`
2. treat theme as `THEME_PRESENTATION`, not project code
3. keep only binding and business differences in `PROJECT_BINDING`
4. split editor/admin tooling away from runtime jars
5. split reusable process definitions from project executors
6. split any mixed console or runtime logic before adding more screens

## Success Test

The separation is strong enough when:

- many theme components can be added without changing project business code
- a new project mostly provides config and thin adapters
- common upgrades are version bumps instead of source merges
- theme upgrades are manifest installs instead of page rewrites
- project customization happens by binding and override, not by forking framework core
- installable processes upgrade by manifest and executor capability checks, not by copied workflow code
