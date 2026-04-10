# System Builder Project Domain Install Target

Generated on 2026-04-08 for the current Carbonet and Resonance direction review.

## Goal

Define the target end state for separating:

- `SYSTEM`
- `BUILDER`
- `PROJECT`
- installable `DOMAIN` packages

This document answers the practical question:

`can the main system create accounts, create projects, attach builder/runtime lines, and later install domain packages such as member flows into generated projects without collapsing everything back into one application?`

The intended answer is:

- `yes`

but the repository is still in transition toward that end state.

## Canonical Position

Use this top-level split:

1. `SYSTEM`
2. `BUILDER`
3. `PROJECT`
4. `DOMAIN_INSTALL`

### 1. `SYSTEM`

Authoritative control plane.

Responsibilities:

- platform master account management
- project registry
- common module registry
- installable module registry
- project-to-module binding
- design intake
- scaffold governance
- build, deploy, compare, repair, and rollback governance

Current naming direction:

- `Resonance Control Plane`
- `Resonance Ops`
- `Resonance AI`

### 2. `BUILDER`

Reusable generation and governed screen assembly line.

Responsibilities:

- screen builder core
- runtime/common adapter defaults
- package and manifest generation
- registry/detail/install/validator/rollback console flows
- scaffold-ready output generation

Current naming direction:

- `Resonance Builder`

### 3. `PROJECT`

Project-owned runtime application.

Responsibilities:

- real business execution
- project-specific routes
- project-specific DB workloads
- project-specific integrations
- thin project binding adapters
- project-owned executors for write-heavy behavior

Current naming direction:

- `Resonance Runtime`
- project runtime system such as `Carbonet Runtime`

### 4. `DOMAIN_INSTALL`

Installable domain capability line attached to a project through governed contracts.

Examples:

- member/register/approve flows
- board or support flows
- approval chains
- monitoring/governance workflows
- API packages
- theme packages
- reusable read-heavy screen families

Rule:

- do not attach domains as opaque copied source
- attach them through manifests, bindings, compatibility checks, and project executors where needed

## Required Ownership Split

### System Versus Project

Use this rule:

- `SYSTEM` owns registry, governance, generation, deploy, compare, repair, and release control
- `PROJECT` owns runtime execution and business data changes

The project runtime should consume approved outputs from the system.
It should not become the primary authority for design-time metadata or install governance.

### Builder Versus Project

Use this rule:

- `BUILDER` owns reusable builder core and package generation contracts
- `PROJECT` supplies thin adapters and runtime bindings

The project must not copy builder internals as the normal operating model.

### Domain Package Versus Project

Use this rule:

- installable domain packages should provide reusable definition and binding contracts
- project runtime should provide thin project binding and project-owned execution where write-heavy logic is unstable

## Domain Install Rule

Generated projects should be able to receive installable domain capabilities later.

Use this split for business-facing domain installation:

1. `PROCESS_DEFINITION`
2. `PROCESS_BINDING`
3. `PROJECT_EXECUTOR`

Interpretation:

- `PROCESS_DEFINITION`
  - reusable process manifest
  - screen family map
  - state machine
  - validator and rollback contract
- `PROCESS_BINDING`
  - project menu, route, authority, table, theme, and API bindings
- `PROJECT_EXECUTOR`
  - project-owned save/update/calculate/approval/external side effects

This means a generated project should be able to install a domain family like:

- member registration
- member approval
- notice/Q&A board family
- request/review/approve workflow

without requiring a full project fork of common scaffolding logic.

## Page-As-Unit Rule

For builder-driven upgrade, a page should be treated as the minimum governed install unit.

That means one page is not only a React screen or JSP replacement.
It is a package of coordinated assets:

- `pageId`
- `menuCode`
- route binding
- page manifest
- component or template profile
- authority scope policy
- bootstrap/query/mutation contracts
- event/function/API linkage
- help/accessibility/security bindings
- install scope
- project binding inputs
- validator and rollback evidence

If these do not move together, the page cannot be reliably:

- reused by the builder
- attached to another project
- regenerated safely
- deployed and verified as part of a runtime package

Use these operating documents when closing a page family:

- `docs/architecture/page-systemization-checklist.md`
- `docs/architecture/builder-install-deploy-closeout-checklist.md`
- `docs/architecture/project-binding-patterns.md`

## Why Authority Scope Matters

Authority scope plays a central role in this upgrade direction.

It is required to decide:

- whether a page belongs to `SYSTEM`, `BUILDER`, `PROJECT`, or `DOMAIN_INSTALL`
- whether the page is globally common or project-scoped
- which actions are installable versus project-bound
- what data and exports a generated page may expose
- whether project binding is only visual/menu binding or also includes actor/data-scope narrowing

At minimum, every installable page or page family should declare:

- actor family
- data scope
- action scope
- approval-authority requirement
- project-binding overrides, if any

Pages without explicit authority scope may still run, but they are not safe targets for governed install, cross-project reuse, or builder regeneration.

Use `docs/architecture/authority-scope-application-checklist.md` when deciding whether authority scope is only declared or actually applied across runtime behavior.

## Member Process Example

The membership area should not be treated as one indivisible blob.

Preferred split:

- installable member process definition
  - stage map
  - required fields
  - authority checkpoints
  - common read models
  - validator rules
- project member binding
  - menu placement
  - route prefix
  - authority group mapping
  - project table mapping
  - notification/API binding
- project member executor
  - actual save logic
  - project-specific approval exceptions
  - project-specific external identity or institution integrations

This is the intended mechanism that makes "install member process into a generated project later" possible.

## Project Creation Flow

The intended end-state operator path is:

1. create or select platform account
2. create project
3. register project runtime target and DB attachment
4. choose framework line and common module line
5. choose builder/theme/API/domain package lines
6. generate or bind screen/runtime artifacts
7. build and deploy the project runtime package
8. compare current runtime versus approved target
9. repair, patch, roll back, or upgrade by governed flow

Do not reverse this order.

In particular:

- do not start code generation before `projectId` is fixed
- do not attach project binding only after runtime code already exists
- do not allow installable domain packages without manifest, compatibility, and rollback visibility

## Current Repository Evidence

The repository already contains strong evidence that this target direction is established.

### Docs

- `docs/architecture/platform-console-information-architecture.md`
- `docs/architecture/operations-platform-console-architecture.md`
- `docs/architecture/common-project-reversible-transition-rules.md`
- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/screenbuilder-core-jar-adapter-plan.md`
- `docs/architecture/installable-builder-upgrade-roadmap.md`
- `docs/architecture/installable-business-process-package-model.md`
- `docs/architecture/member-domain-install-package-model.md`
- `docs/architecture/reusable-read-module-separation-plan.md`
- `docs/architecture/framework-common-theme-project-separation-map.md`
- `docs/architecture/stable-adapter-and-common-core-versioning.md`

### Skills

- `.codex/skills/carbonet-common-project-boundary-switcher/SKILL.md`
- `.codex/skills/carbonet-screen-builder/SKILL.md`
- `.codex/skills/carbonet-audit-trace-architecture/SKILL.md`
- `docs/ai/80-skills/skill-index.md`

### Templates And Bootstrap Assets

- `templates/screenbuilder-project-bootstrap/PROJECT-ADAPTER-CHECKLIST.md`
- `templates/screenbuilder-project-bootstrap/pom-screenbuilder-dependencies.xml`
- `templates/screenbuilder-project-bootstrap/application-screenbuilder.properties`
- `templates/screenbuilder-project-bootstrap/manifests/builder-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/theme-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/api-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/business-process-install-manifest.json`

### Live Module Structure

- `modules/screenbuilder-core`
- `modules/screenbuilder-runtime-common-adapter`
- `modules/screenbuilder-carbonet-adapter`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `apps/carbonet-app`

This means the direction is not merely hypothetical.
The repository already started implementing the target modular split.

## Current Maturity

Status by lane:

- target direction
  - `DONE`
- docs and skill routing
  - `DONE`
- bootstrap template and manifest starter
  - `DONE`
- live backend modular split
  - `PARTIAL_DONE`
- system console as the only full control-plane authority
  - `PARTIAL`
- installable builder product quality
  - `PARTIAL`
- installable domain package lifecycle with real operator UI and validators
  - `PARTIAL`
- generated-project click-through domain install with thin executors only
  - `NOT_DONE`

## What Is Already True

- the repository has a defined system-builder-project split
- project creation is intended to start before scaffold generation
- new projects are intended to attach builder capability through adapters, not copied core source
- generated projects are intended to accept later installable theme/API/business-process packages
- business process reuse is intended to happen through `PROCESS_DEFINITION + PROCESS_BINDING + PROJECT_EXECUTOR`

## What Is Not Yet Proven End To End

- one fully separate operations system product running independently from Carbonet runtime
- one generated project that installs multiple domain packages only through governed UI and manifests
- one fully realized member-process package line that can be attached to a fresh project without source-copy drift
- one complete operator flow where account creation, project creation, builder attach, domain install, build, deploy, compare, and repair are all executed from one finished control-plane product

## Practical Conclusion

The final direction is already set.

That direction is:

- system creates and governs projects
- builder is a reusable generation product
- projects stay thin on bindings and runtime execution
- domain capabilities should be installable into generated projects later
- member and similar business flows should be separable into installable process definition plus project binding and executor layers

The current repository should therefore be treated as:

- `direction-fixed`
- `implementation-in-progress`

not as:

- `direction-undecided`
