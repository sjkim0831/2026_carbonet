# Install Unit Lifecycle and Resource Governance

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define how a menu-centered feature becomes an installable unit that can be created, copied, upgraded, deprecated, and deleted without leaving residue across code, DB, files, permissions, or screen metadata.

## Lifecycle Unit

The primary management unit is not a controller or a single source file.

The primary unit is an `install unit`:

- one menu or page entry point
- one page or page set
- one function set and permission chain
- one API and backend chain
- one owned DB footprint
- one owned file or attachment policy
- one trace and manifest footprint

This is the smallest unit that should support:

- install
- copy
- export
- import
- upgrade
- deprecate
- delete
- rollback

## Chain Management Model

Resource chains should be modeled as a governed dependency graph, not as a flat file list and not as a menu-only tree.

The practical chain shape in this repository is:

- `project -> install unit -> menu -> page -> function -> api -> backend chain -> db objects`
- `page -> help anchors -> telemetry metadata -> audit identifiers`
- `install unit -> common modules`

The platform should treat this as one authoritative graph with three different meanings:

- ownership chain
- execution chain
- delete-order chain

These meanings can overlap, but they should not be collapsed into one ambiguous relation type.

Recommended dependency categories:

- `OWNS`
- `USES`
- `CALLS`
- `EMITS`
- `STORES_IN`
- `REFERENCES`
- `BLOCKS_DELETE`

If a relationship matters for copy, upgrade, delete, drift detection, or audit search, it belongs in the registry.

## Ownership Scopes

Every managed resource must belong to exactly one scope:

- `COMMON`
- `PROJECT`
- `INSTALL_UNIT`
- `EXTERNAL`

Every managed resource must also declare its usage mode:

- `EXCLUSIVE`
- `SHARED`
- `REFERENCE_ONLY`

These two classifications must be stored before the platform offers auto-delete.

## Resources To Track

The registry must cover all of the following when they exist:

- menu code and route
- page ID and manifest
- function codes and permission bindings
- controller and endpoint mappings
- service, impl, mapper, and mapper XML
- request and response DTOs
- tables, columns, indexes, foreign keys, and code groups
- uploads, downloads, PDFs, templates, and generated bundles
- help anchors, telemetry metadata, and audit identifiers

If a generated asset is not in the registry, it is not uninstall-safe.

## Common Module Selection During Install

An install unit should be able to select shared common modules at install time instead of copying implementation code manually.

The platform should support selecting:

- `SI_COMMON`
- `OPS_COMMON`
- optional `SECURITY_COMMON`
- optional `UI_COMMON`
- optional `DATA_COMMON`
- optional `INTEGRATION_COMMON`

Each selected common module should record:

- selected module type
- selected version
- required or optional flag
- usage mode

This lets a menu install declare what shared functionality it consumes while preserving delete safety.

## Delete Safety Rules

Deletion must be plan-driven, never menu-only.

The delete plan should resolve:

1. feature and permission references
2. menu and page metadata references
3. frontend and backend file references
4. DB dependency order
5. shared-resource blocks
6. final orphan and drift scan

Automatic deletion is allowed only for `EXCLUSIVE` assets with valid ownership and zero shared blockers.

Assets marked `SHARED` or `REFERENCE_ONLY` must not be auto-deleted unless reference count and approval rules allow it.

Selected common modules are normally `REFERENCE_ONLY` from the perspective of an install unit and should not be deleted with the menu package.

## Complexity Management Rules

Resource-chain complexity grows quickly when one registry tries to answer ownership, runtime tracing, UI composition, and deletion with the same abstraction.

To keep complexity under control, use these rules:

1. keep one primary lifecycle owner
   every resource must have exactly one owning scope even if many units reference it
2. separate ownership from usage
   `ownerScope` answers who controls deletion, while `usageMode` answers how others consume it
3. keep the install unit as the operational boundary
   do not let controllers, source files, or individual tables become first-class lifecycle units
4. classify shared assets early
   common tables, templates, code groups, and modules must be marked `SHARED` or `REFERENCE_ONLY` before delete automation is attempted
5. split graph concerns by question
   ownership graph for authority, execution graph for tracing, delete graph for uninstall order
6. allow summaries in the admin UI
   operators should browse package-level dependency summaries first and expand to file or table detail only on demand
7. enforce non-blocking metadata collection
   missing enrichment may reduce visibility, but it must not break screen behavior or installs
8. favor append-and-verify rollout
   register resources first, verify ownership and dependency quality next, automate delete or clone only after coverage is stable

The platform should reject these anti-patterns:

- inferring ownership from package names alone
- deleting by route or menu without a generated delete plan
- treating low traffic as garbage
- copying full source trees instead of regenerating identities and declared references
- merging common-module dependency records with install-unit-owned assets

## Garbage Definition

Do not define garbage by low traffic or low recent usage.

Garbage candidates are:

- ownerless resources
- orphaned resources
- dead references
- duplicate generated resources with no active owner intent
- residue left after uninstall

These are not garbage by default:

- archived resources
- inactive but approved resources
- emergency admin pages
- shared common tables or components
- low-frequency operational screens

## Copy and Clone Rules

Copying an install unit must create a new identity set, not duplicate files blindly.

At minimum the copy flow must regenerate:

- `packageId`
- `menuCode`
- `pageId`
- `functionId` set
- route or canonical URL
- install metadata

If the install unit owns DB objects, the clone flow must either:

- generate a new physical namespace
- or explicitly reuse approved shared tables through `REFERENCE_ONLY`

## Backend Boundary

Install units should depend on:

- common versioned artifacts
- project-thin business adapters
- stable platform contracts

Install units should not depend on:

- live source retrieval from the main system
- hidden filesystem imports from another deployed project
- unmanaged runtime code sharing

## AI Usage Rule

AI can generate:

- page scaffolds
- controller, service, mapper, and XML drafts
- DTOs and schemas
- design bindings
- documentation and delete-plan summaries

AI should not be the authority for:

- owner assignment
- shared-resource classification
- delete approval
- security masking
- final DB drop decisions

The platform registry remains authoritative.

## Recommended Implementation Order In This Repository

1. stabilize admin route and page parity
2. keep `ScreenCommandCenterServiceImpl` as the seed metadata authority
3. add install-unit metadata and ownership fields
4. extend the command-center UI to show package and dependency views
5. add export, copy, delete-plan, orphan-scan, and drift-scan actions
6. only after that, split common platform and project modules further

## Admin UI Shape

The management UI should expose the chain in layers rather than dumping raw registry rows.

Recommended operator views:

- package summary
  install unit identity, owner scope, selected common modules, status
- chain view
  page, function, API, backend, DB, and attachment links for one install unit
- dependency impact
  inbound references, outbound references, delete blockers, and shared-resource reasons
- quality view
  orphan results, drift results, unverified resources, and missing ownership classifications
- action view
  install, copy, export, delete-plan, approve delete, rollback

## Minimum Metadata Keys

Every installable resource should be traceable by:

- `projectId`
- `packageId`
- `resourceId`
- `resourceType`
- `ownerScope`
- `usageMode`
- `platformVersion`
- `moduleVersion`
- `status`

Without these keys, copy and delete remain guesswork.
