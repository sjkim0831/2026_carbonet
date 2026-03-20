# Platform Common Module Versioning

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define how common code is shared across split or deployed projects without making those projects depend on live source retrieval from the main system.

## Core Rule

Common code must be delivered as version-pinned build artifacts:

- jar
- internal module
- packaged shared library
- exported installable bundle

Do not use runtime source fetching from the main system as the dependency model.

Use this stronger rule as well:

- import-sensitive shared code must be managed centrally
- framework lines must be published centrally
- project systems should select approved framework, common-module, and feature-module versions instead of editing shared imports freely

This rule applies equally to:

- backend source templates and shared jars
- frontend shared shell, UI bundles, and manifest helpers
- theme, token, CSS, and JS shared assets
- installable feature modules and optional libraries used during scaffolded system delivery

Additional rule:

- module additions should preserve one governed pattern family and one governed structural depth per module family
- CSS attached by modules must reuse approved theme/token/component families and pass dedupe checks

## Why

Version-pinned artifacts give:

- reproducible builds
- rollback safety
- compatibility checks
- controlled rollout by project
- stable audit of what version is deployed where

Runtime source fetching creates:

- hidden coupling to main-system availability
- unreproducible builds
- harder rollback
- unclear security review boundaries
- accidental behavior drift after main-system updates

## Required Version Metadata

Every deployed project should record:

- `platformVersion`
- `egovFrameworkVersion`
- `frontendPlatformVersion`
- `uiCommonVersion`
- `screenManifestVersion`
- `designTokenVersion`
- `cssBundleVersion`
- `jsBundleVersion`
- `projectModuleVersion`
- `javaVersion`
- `dbDriverVersion`
- `apiContractVersion`
- `builtAt`
- `deployedAt`

## Recommended Package Split

### `platform-common`

Contains only cross-cutting code:

- authentication and session rules
- authority and permission helpers
- encryption, decryption, masking
- request and response normalization
- trace and audit infrastructure
- install registry contracts
- adapter or facade contracts for shared infrastructure

`platform-common` should be internally classified, not kept as one flat pool. The first recommended split is:

- `SI_COMMON`
- `OPS_COMMON`

It should also be version-aware by framework baseline:

- one common jar line per supported eGovFrame baseline
- one matching source/template line per supported eGovFrame baseline
- one compatibility matrix that states which project systems may consume which line

Use one more split inside `platform-common`:

- `stable facade line`
  - low-churn contracts
  - import changes should be rare
- `import-sensitive line`
  - shared code that may require import or signature updates across project code
  - must be centrally reviewed, centrally published, and explicitly version-selected by projects

Reference normalization candidates now identified:

- `/opt/reference/modules/gnrlogin-4.3.2`
- `/opt/reference/modules/certlogin-4.3.2`

Recommended split for those candidates:

- shared `egovframework.com.cmm` baseline -> `COMMON_WEB_SECURITY` or equivalent common line
- certificate-login-specific behavior -> certificate-login adapter line
- mail-related examples -> notification or mail provider adapter line

Do not keep the full reference folders as direct runtime module attachments.

See:

- `docs/architecture/common-module-taxonomy.md`

### `project-module`

Contains only project-owned business logic:

- project controllers
- project services
- project mappers
- project page manifests and screens
- project DB routing metadata
- project-specific frontend pages and assets

Project modules should assume a split data model:

- common governance metadata stays in `COMMON_DB`
- project business data lives in `PROJECT_DB`

Project modules should stay deliberately thin.

Preferred remaining code in project modules:

- route and page registration
- project-specific scenario wiring
- project-local query and business-rule deltas
- configuration values and binding profiles
- thin adapter code that calls stable common facades

Avoid leaving these in project-owned code when a common artifact line can own them:

- auth and session internals
- shared masking, encryption, and approval helpers
- file storage internals
- export, PDF, and Excel infrastructure
- shared popup, grid, search, and action-layout runtime behavior
- approval workflow and seal-image rendering helpers
- import-sensitive cross-cutting utility code

Use this rule:

- general runtime systems should contain mostly low-churn, lightweight source
- heavy shared behavior should move into centrally versioned jars or bundles
- project source should survive common upgrades with minimal or no import changes in the normal case

Product delivery rule:

- runtime project code should feel intentionally thin, not incomplete
- projects should consume approved common artifacts through release-unit selection, not through source copying
- when a product package is built, common jars and shared frontend bundles should be assembled together with project-local thin code into one governed runtime package
- module additions should not introduce a second styling dialect or a second structural pattern family into the same runtime package without explicit approval

### `install-unit`

Contains menu-centered feature assets:

- menu and page metadata
- feature definitions
- API and DTO definitions
- tables and columns owned by the module
- attached files, templates, or generated frontend assets

An install unit may depend on multiple common-module categories, but it should store those as versioned references instead of copying source code.

Install units should also support project-level version selection for:

- framework line
- common facade line
- import-sensitive common line
- frontend common line
- feature module line

## Upgrade Rule

Upgrade flow should be:

1. update `platform-common`
2. publish a new versioned artifact
3. run compatibility checks against project modules
4. upgrade child systems selectively or in planned waves
5. record the applied platform version per deployment target

The main platform can move faster than deployed projects, but deployed projects must always run against an approved artifact version.

Upgrade policy should distinguish:

- `facade-safe upgrade`
  - no project import change expected
- `import-aware upgrade`
  - project import or signature alignment may be required
  - must be centrally tracked and explicitly approved

## eGovFrame Version Separation Rule

For 표준 전자정부프레임워크 compatibility:

1. separate common jars by `egovFrameworkVersion`
2. separate common scaffold source/templates by `egovFrameworkVersion`
3. let operators choose the target framework version during project binding and scaffold generation
4. publish common artifacts per framework line
5. keep project backend source owned by the target system, not mixed into the common artifact line

This means:

- common shared jars are versioned by framework baseline
- scaffold source templates are versioned by framework baseline
- project backend controllers, services, mappers, and project business code stay in the project-owned source area
- upgrades across framework lines require explicit compatibility review

Framework selection rule:

- the control plane publishes supported framework lines
- each project explicitly selects one approved framework line
- scaffold generation, common jars, source templates, and compatibility checks must all resolve from that selected line
- framework upgrades should be handled as a controlled release-unit change, not as ad hoc project edits

## Frontend Version Separation Rule

Frontend should follow the same version-aware model.

Use this rule:

1. separate shared frontend assets by `frontendPlatformVersion`
2. version common UI modules separately as `uiCommonVersion`
3. version screen and route contracts as `screenManifestVersion`
4. let each project bind approved frontend versions explicitly
5. keep project-specific frontend pages and business interactions in the project-owned source area

Recommended frontend split:

- shared shell and layout assets
- shared component bundles
- shared theme and design-token bundles
- shared screen manifest helpers
- shared CSS bundles
- shared JS helper bundles
- project-owned page implementations

This means:

- frontend common bundles are version-pinned artifacts
- project frontend code is not mixed into the shared frontend bundle line
- shell/layout upgrades and screen-manifest upgrades can be rolled out in controlled waves
- backend and frontend compatibility can be checked as one release unit

Use this rule:

- safe UX-heavy JS may remain in project-owned page implementations
- security-sensitive execution contracts must remain behind centrally versioned common backend lines or common frontend wrappers that still defer final checks to the backend

### No-Drift Runtime Packaging Rule

Every productized general system should keep the following split visible:

- centrally upgradeable code
  - common jars
  - framework line
  - frontend common bundle
  - shell/theme/token/CSS/JS bundles
  - installable feature modules
- project-local code
  - thin route/page/controller/service adapters
  - project query deltas
  - project labels, config, and manifest bindings

Do not build a runtime package that hides this split.

A release unit should always be able to answer:

- which centrally managed common lines are included
- which thin runtime code remains project-local
- which imports are facade-safe
- which imports are import-aware and version-pinned
- CSS and JS import contracts can be reviewed and upgraded explicitly instead of drifting per project

Frontend selection rule:

- each project explicitly selects approved frontend platform, UI common, manifest, token, CSS, and JS lines
- frontend common upgrades that change imports or component contracts must be treated the same way as backend import-aware upgrades
- generated frontend code should consume stable wrappers where possible and isolate import-sensitive assets behind centrally managed manifests

## Feature And Module Selection Rule

Projects should be able to choose approved versions of shared modules and feature lines.

Minimum selectable families:

- `framework line`
- `backend common facade line`
- `backend import-sensitive line`
- `frontend common line`
- `theme and token line`
- `feature module line`
- `policy bundle line`

Use this rule:

- the control plane owns publication and compatibility
- the project owns version selection within approved ranges
- runtime deployment consumes the selected version set as one release unit
- installable feature and common modules should be attached by versioned selection, not by raw source copy
- every selectable module line should publish parameter and result contracts so screens, functions, and APIs can bind to them predictably

## Installable Parameter And Result Contract Rule

Each centrally published module or feature line should expose a governed contract for inputs and outputs.

Minimum contract areas:

- accepted parameters
- validation and masking requirements
- result payload shape
- status and error families
- popup, grid, and search compatibility
- required common jar and frontend asset families

Use this rule:

- projects select installable modules by approved version
- scaffold generation resolves parameter and result contracts from those selected modules
- runtime systems consume the packaged module and contract set together
- manual source inspection should not be required to understand how a selected module connects to page, function, API, or DB outputs

## Scaffold And Build Consumption Rule

Scaffolded systems should be built from centrally governed selections.

Required build inputs:

- project-owned backend source
- project-owned frontend source
- selected framework line
- selected backend common facade line
- selected backend import-sensitive line when approved
- selected frontend common line
- selected theme and token line
- selected CSS and JS lines
- selected feature-module line
- selected optional library set if governed for the project

Use this rule:

- the control plane resolves the version set first
- scaffold generation uses that version set as its baseline
- build and package outputs include the selected shared artifacts
- deployment uses the resulting release unit as the single source of truth
- project-owned source should compile mainly against stable facades and generated contracts, not against deep common internals

Do not:

- generate code against one version set and package against another
- let runtime nodes decide shared library versions locally
- add extra libraries outside the governed module or library-selection profile
- leave high-churn common implementation copied into general runtime project code

## Central Publication Families

Resonance should centrally publish at least these artifact families:

- `framework-line template bundle`
- `common-backend-jar`
- `common-import-sensitive-jar`
- `frontend-common-bundle`
- `theme-package`
- `design-token-package`
- `css-bundle`
- `js-bundle`
- `feature-module-bundle`
- `optional-library-bundle`

Each project release unit should reference exact versions of these families where applicable.

Recommended additional publication families:

- `parameter-contract-bundle`
- `result-contract-bundle`

## Non-Goals

These are explicitly discouraged:

- runtime pulling of backend source code from the main platform
- child projects importing random source folders over the network
- treating the main platform repository as a live code filesystem for deployed systems
- bypassing version metadata because the code is "shared anyway"
- letting projects silently absorb import-breaking shared changes without explicit version selection

## AI Guidance

AI can help with:

- facade extraction
- package split proposals
- compatibility diff summaries
- upgrade notes
- scaffold updates in project modules

The platform remains authoritative for:

- version publication
- compatibility approval
- security-sensitive dependency review
- deployment metadata
