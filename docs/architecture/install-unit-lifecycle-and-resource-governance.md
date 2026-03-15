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
