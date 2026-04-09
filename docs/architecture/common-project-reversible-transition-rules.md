# Common Project Reversible Transition Rules

## Goal

Keep Carbonet and Resonance work easy to move in both directions:

- project-specific code promoted into common platform
- common platform code rebound into a project through adapters

This document exists so implementation does not optimize only for today's placement.
It should optimize for future promotion, extraction, rebinding, and upgrade too.

For the live builder continuation after the closed structure-governance family, use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

## Core Principle

Do not ask only:

- "is this common or project?"

Also ask:

- "how easily can this move later without rewrite?"

That means every change should be classified for both:

- current owner
- future transfer cost

## Ownership Classes

### `COMMON_ONLY`

Use for:

- platform governance metadata
- shared builder contracts
- shared component registry definitions
- common authority policy definitions
- common release, install-unit, and module metadata

Rule:

- no project DTOs
- no project route semantics
- no project table semantics

### `PROJECT_ONLY`

Use for:

- project business entities
- project runtime transactions
- project-local routes
- project-local business rules

Rule:

- keep it thin if later promotion is likely

### `COMMON_DEF_PROJECT_BIND`

Use for:

- menus
- screen templates
- component definitions
- theme definitions
- authority assignment overlays
- runtime package attachment

Rule:

- common definition is stable
- project binding decides exposure, override, attachment, or activation

### `MIXED_TRANSITION`

Use when the repository is not cleanly split yet.

Rule:

- do not deepen the coupling
- add ports, wrappers, adapters, and core-owned DTOs first

## Transition Patterns

### `MOVE`

Use when the target code is already stable and should become common now.

### `WRAP`

Use when old project paths must stay working while new common ownership becomes the source of truth.

Rule:

- wrapper paths are compatibility shims only
- wrapper paths must not regain feature growth
- if the wrapper becomes a live extension point again, the transition is open and incomplete

### `PORT_ADAPTER`

Use when core logic still depends on project services, DTOs, route rules, or DB conventions.

### `COMMON_DEF_PROJECT_BIND`

Use when one stable definition must fan out to many projects.

### `LEAVE_FOR_NOW`

Use when moving now would create more risk than value, but record the next extraction point explicitly.

## Menu Rule

Menus should be classified at least as:

- `PLATFORM_COMMON`
- `PROJECT_COMMON`
- `PROJECT_RUNTIME`

Recommended pattern:

- common definition table
- project binding table

When the menu is attached to a builder-managed or installable page, keep `menuCode`, `pageId`, route identity, and authority scope aligned.
Do not allow menu-only migration that leaves the page identity or scope contract implicit.

Core services should depend on core-owned menu descriptors, not project menu DTO classes.

## DB Rule

Always decide ownership first.

Do not always create two tables.

Use:

- one common table when the data is common only
- one project table when the data is project only
- two-layer definition and binding when reversibility matters

## DTO Rule

If a type crosses a common boundary, make it common-owned.

Do not let reusable core services depend on:

- project DTO packages
- project VO naming
- project-specific route or code systems

Use wrappers only as compatibility shims.

## Page Systemization Rule

When a request is really about turning existing pages into reusable system assets, do not stop at controller or route moves.

Require one governed page unit with:

- stable `pageId`
- stable `menuCode`
- canonical route
- manifest and component/template structure
- authority scope
- data and action contracts
- install scope
- project binding inputs

Use `docs/architecture/page-systemization-minimum-contract.md` as the canonical minimum contract.

For most reusable builder-managed pages, prefer:

- common page definition
- project menu and route binding
- project authority and theme binding
- project executor only where write-heavy business behavior is unstable

## Authority Scope Rule

Treat authority scope as a boundary decision, not only a security detail.

If a page cannot declare actor family, data scope, action scope, and approval scope, it is not ready for:

- common extraction
- installable delivery
- builder regeneration
- cross-project rebinding

## Theme Rule

Do not treat theme as project business code.

Use this split:

- `COMMON_PRIMITIVE`
  - stable component behavior and shared UI contracts
- `THEME_PRESENTATION`
  - tokens, frame overrides, component appearance overrides, preview assets
- `PROJECT_BINDING`
  - project theme attachment, activation, and override selection

Theme packages may grow large in component count.
That is fine if they remain presentation-only and manifest-driven.

## Packaging Rule

If fast cross-project reuse is a goal:

- backend reusable core should move toward versioned `jar`
- frontend reusable core should move toward shared package or bundle
- projects should contribute thin adapters and overlays

## Immediate Heuristics

When in doubt, do these first:

1. core-owned DTO
2. port plus adapter
3. definition plus binding split
4. thin controller or thin route adapter
5. only then deeper feature logic

## Old Path Decision Heuristic

When choosing between keeping an old path or deleting it, use this order:

1. if the new canonical path is not yet real, do not claim closure
2. if the old path is still extended, it is not a shim
3. if the old path only forwards one remaining entry, keep it as an explicit shim
4. if no remaining entry needs it, delete it

Prefer explicit deletion over passive duplication.

For builder-owned paths, do not reopen canonical-path answers here once `BUILDER_STRUCTURE_GOVERNANCE` is frozen.

Use the live continuation set instead:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

## Success Test

A boundary is reversible enough when:

- promoting project code into common needs mostly package move and adapter trim
- attaching common code into a new project needs mostly adapter creation and configuration
- upgrade is mostly version bump, not source copy
