# Admin Ops And Project Admin Separation Plan

Generated on 2026-04-13 for Carbonet common/project boundary decisions.

## Goal

Allow Carbonet to move from the current shared admin surface into:

- `COMMON_ADMIN_OPS`
- `PROJECT_ADMIN`

without forcing an immediate UI rewrite and without making later project handoff depend on one central vendor.

## Short Answer

Yes.

The fastest safe path is:

1. split ownership, route scope, authority scope, and API contracts first
2. keep the UI and component library mostly the same at first
3. separate runtime packaging and deployment only after the screen contracts are already classified

Do not try to visually redesign the admin area before the ownership split is stable.

## Core Rule

At the beginning, treat "same UI" and "same system" as different things.

Two screens may share:

- frame layout
- form components
- grid components
- action-bar styling
- status message patterns

while still being different in:

- owner scope
- route prefix
- authority scope
- data scope
- API port
- deployment target

That is the preferred first step.

## Target Split

Use these lanes:

### `COMMON_ADMIN_OPS`

Central operator authority.

Owns:

- common artifact registry
- project registration
- compatibility matrix
- rollout, rollback, and deploy history
- DB patch and diff governance
- common policy and audit views
- install or bind operations for common packages

Should not directly own:

- customer business settings
- project business write flows
- project-local approval rules
- project runtime data maintenance

### `PROJECT_ADMIN`

Project or customer-scoped administrator authority.

Owns:

- project user and role assignment within allowed boundaries
- project menu exposure
- project settings
- business data maintenance
- project-local workflow and approval configuration
- project-local content and operational screens

Should not directly own:

- common artifact publication
- global compatibility approval
- fleet-wide upgrade execution
- platform security baseline override

## What To Split First

Before any runtime separation, add explicit metadata for each admin screen:

- `screenId`
- `ownerScope`
  - `COMMON_ADMIN_OPS`
  - `PROJECT_ADMIN`
  - `COMMON_DEF_PROJECT_BIND`
  - `MIXED_TRANSITION`
- `routeScope`
  - central console route or project runtime route
- `authorityScope`
  - operator role or project-admin role
- `dataScope`
  - control-plane DB or project DB
- `apiPort`
  - common port or project adapter port
- `shellFamily`
  - reused UI shell line
- `deploymentLane`
  - central console, project runtime, or both during transition

If a screen cannot declare all seven fields, it is not ready for clean separation.

## Can Screens Be Split In Parallel

Yes, but only after the screen family is classified correctly.

Good parallel split candidates:

- list and detail screens that already consume descriptors instead of raw project tables
- edit forms whose save action is behind a stable port
- registry and history screens that are read-heavy
- screens that differ mainly by authority and API target

Poor parallel split candidates:

- one page mixing fleet operations and project business actions
- one dashboard joining control-plane DB and project business DB in the same query path
- one edit screen where button visibility, save logic, and audit target all depend on hidden project-specific code

Rule:

- split screen family and action ports first
- split runtime packaging second
- split visual design last

## UI Rule

Yes.

At first, the UI may stay the same.

Recommended initial policy:

- same design tokens
- same shell family
- same form and grid components
- same message patterns
- separate menu trees
- separate route prefixes
- separate authority checks
- separate API ports

This gives faster separation and lower regression risk.

Change the visual language only when the product roles genuinely diverge.

## Recommended Three-Minute Bootstrap Strategy

If the real target is "separate later, but bootstrap quickly now", use this order:

### Phase 0. Shared UI, Declared Ownership

Keep the current admin UI.

Add:

- owner-scope classification
- route-scope classification
- API port classification
- menu ownership classification

This is the minimum step that keeps future separation cheap.

### Phase 1. Shared Components, Separate Shell Entrypoints

Create two shell entry lanes:

- central operations shell
- project admin shell

Both may still import the same component library and same page-family layouts.

At this phase, visual parity is acceptable.

### Phase 2. Separate Runtime Packaging

Move to separately deployable units:

- common ops console artifact
- project runtime artifact

Keep shared packages for:

- UI primitives
- admin page templates
- shared DTO descriptors
- common API client contracts

Keep project-specific actions behind adapters.

### Phase 3. Optional Visual Divergence

Only after the runtime and authority boundaries are stable:

- adjust IA
- adjust dashboard composition
- adjust role-specific shortcuts
- adjust branding or navigation density

## Migration Pattern For Current Shared Admin Screens

Classify each current screen as one of:

### `OPS_ONLY`

Move to central console.

### `PROJECT_ONLY`

Move to project admin.

### `COMMON_DEF_PROJECT_BIND`

Keep one common screen definition and bind:

- menu
- route
- authority
- API endpoint
- data source

per project or per runtime.

This is the preferred pattern when the UI is the same but the execution target differs.

### `MIXED_TRANSITION`

Do not fork the screen immediately.

First split:

- read model
- action port
- authority policy
- audit target

Only then decide whether it becomes two screens or one common definition with two bindings.

## Handoff Safety Rule

To keep vendor handoff realistic, the receiving company must be able to operate:

- `PROJECT_ADMIN`
- `PROJECT_ADAPTER`
- `PROJECT_BUSINESS`
- `PROJECT_DB`

without needing to rewrite `COMMON_ADMIN_OPS`.

That means project-facing admin screens must not depend on hidden central-only services for normal business operation.

## Minimum Deliverables

Before large code separation starts, create:

1. screen ownership registry
2. menu ownership registry
3. route-to-authority matrix
4. API port classification table
5. control-plane DB versus project DB map
6. adapter contract list for project-admin actions

Without those six artifacts, screen-by-screen separation will drift and later runtime split will be expensive.

## Recommended Carbonet Decision

For Carbonet, use this near-term rule:

- same UI is acceptable
- same component library is preferred
- same page-family layout is preferred
- same runtime artifact is acceptable only during transition
- same authority scope is not acceptable
- same API ownership is not acceptable
- same DB ownership is not acceptable when ops and project data differ

The first successful milestone is not "two different-looking admin sites".

It is:

- one governed screen registry
- two authority lanes
- stable adapter ports
- later-separable runtime packaging

