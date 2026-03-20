# Common DB and Project DB Splitting

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Keep a stable common DB so the platform can scaffold, register, install, upgrade, and verify split project databases without losing governance.

## Core Rule

Do not try to move every table into project-specific DBs.

Keep a `common DB` for platform-wide governance and use separate `project DB` instances or schemas for project-owned business data.

This split is required so the platform can:

- register projects
- track install units
- manage common-module versions
- manage permissions and menu metadata
- run orphan and drift checks
- scaffold new project DB assets consistently

Also keep authoring JSON and file storage logically separated from both DB families.

Use four storage lanes:

- `COMMON_DB`
  - control-plane metadata and shared governance truth
- `PROJECT_DB`
  - project runtime and business data
- `GOVERNED_JSON_STORAGE`
  - versioned JSON working drafts and generated manifest bodies
- `GOVERNED_FILE_STORAGE`
  - artifact, attachment, and archive file bodies

## Recommended DB Split

### `COMMON_DB`

Platform-owned tables only.

Typical contents:

- users, admins, sessions, and login metadata
- authority groups, permission relations, user overrides
- menu, page, function, and install-unit metadata
- project registry
- common-module registry and version matrix
- resource registry and dependency graph
- audit, trace, rollout, release, and migration status
- code groups that are platform-wide rather than project-local
- home and admin menu registry
- common runtime module selection and binding metadata
- shared module key or license metadata when it governs multiple systems
- JSON revision indexes and publish bindings

### `PROJECT_DB`

Project-owned business data only.

Typical contents:

- project business master and detail tables
- project-specific code or lookup tables
- project-owned upload metadata
- project-owned scheduler or batch tables
- project-owned statistics and domain data
- project-specific menu usage state or business-facing menu preferences
- project-owned module key values or external integration values when they are runtime-local

### `GOVERNED_JSON_STORAGE`

Used for:

- scaffold request bodies
- screen drafts
- component-binding manifests
- event, function, and API binding manifests
- design extraction summaries
- diffable working revisions

DB should store:

- revision identity
- lineage
- content hash
- approval state
- publish binding

### `GOVERNED_FILE_STORAGE`

Used for:

- built artifacts
- proposal and design attachments
- generated package exports
- archive files
- governed uploads that should not be embedded in DB rows

## Why Common DB Must Remain

Without a stable common DB:

- menu and install metadata becomes fragmented by project
- common-module version control becomes harder
- scaffold and delete safety lose a central source of truth
- project split and clone operations become guesswork
- the main platform console cannot manage all projects consistently

The common DB is the control plane. Project DBs are execution-plane data stores.

## Scaffolding Model

When creating a new project or install unit, the platform should:

1. write platform metadata to `COMMON_DB`
2. decide whether required tables are:
   - project-owned
   - shared common references
   - reference-only external assets
3. generate migration scripts for the target `PROJECT_DB`
4. record the generated DB objects in the resource registry
5. track the applied migration version per project

Keep JSON authoring bodies and file artifacts outside project business tables unless the scenario explicitly requires project-local persistence.

This lets DB splitting remain automatable.

## What Should Stay In Common DB

Keep these in `COMMON_DB` by default:

- authentication and admin account data
- authority groups and permission metadata
- menu registry
- page and function registry
- install-unit registry
- project registry
- common-module registry
- release and migration tracking
- audit and governance metadata
- home and admin menu trees by project and runtime class
- screen, page, function, event, and API registry metadata
- common master data intentionally shared across systems
- module binding and release-unit asset metadata
- JSON draft revision metadata and publish lineage
- server, script, and macro registry

Move these to `PROJECT_DB` by default:

- business entities
- domain transactions
- project-specific document and attachment records
- project-specific reports and operational data
- project business lookup rows
- project runtime edit results and user-entered operational records
- generated feature data beyond scaffold or governance indexes
- project-local module keys and runtime integration values unless explicitly shared

## Menu Split Rule

Menus should be governed centrally, but rendered separately by runtime class.

Use this rule:

- home or public menu registry metadata belongs in `COMMON_DB`
- admin menu registry metadata belongs in `COMMON_DB`
- menu exposure to each project is resolved through project binding and release units
- runtime systems receive generated menu outputs and manifests during deploy
- runtime systems do not become the authority for menu structure definition

## Shared Versus Runtime Asset Split Rule

Store control-plane-only screen, menu, scenario, and scheduler governance metadata in `COMMON_DB` even when it is bound to one project.

Runtime systems should receive only:

- runtime-deployable menu outputs
- runtime-deployable page and feature outputs
- runtime-deployable scenario derivatives
- runtime-deployable scheduler manifests that belong to the project's main server

They should not receive:

- control-plane authoring screens
- scenario governance registries
- theme and component governance screens
- deploy, log, cron, and retention control screens

## Main-Server Runtime Observation Rule

Keep control-plane governance data in `COMMON_DB`, but treat the project's governed main server as the default runtime observation target when the operations system needs to confirm current rendered behavior or current business-state effects inside a deployed general system.

Use this rule:

- runtime-admin business changes continue to live in `PROJECT_DB`
- the operations system queries runtime-admin change visibility through the main-server-based current-runtime views
- sub or idle nodes may be checked for rollout health, but they are not the default runtime truth source for business-state confirmation
- runtime systems do not become the authority for design-time metadata even when runtime-admin changes are visible from the operations system

## Initial Local-And-Remote DB Attachment Rule

Resonance should support a phased DB attachment model instead of forcing the final topology on day one.

Phase 1:

- `34.82.141.193`
  - operations system connects to its local control-plane DB
- `136.117.100.221`
  - deployed general system connects to a copied or newly attached project DB target

Phase 2:

- a dedicated project DB server is added later
- `136.117.100.221` switches from the temporary attached DB target to the dedicated project DB server
- `34.82.141.193` continues to use its local control-plane DB unless later control-plane DB relocation is explicitly approved

Use this rule:

- do not mix `COMMON_DB` and `PROJECT_DB` just because both are temporarily reachable from one host
- record the current DB attachment target per project unit
- treat DB target switches as governed release and migration events
- keep runtime package and DB attachment history queryable from the control plane

## Common Versus Project Data Rule

Store in `COMMON_DB` when the row answers:

- which project owns this
- which menu, page, feature, or module exists
- which common version or release-unit line is active
- which JSON revision produced this artifact
- which server, script, or macro should operate this target

Store in `PROJECT_DB` when the row answers:

- what the business user entered or changed
- what runtime business process state currently exists
- what project-local usage, transaction, or domain record is being served
- what project-local module value is needed only by that system

## Access Rule

The main platform console may connect to project DBs for:

- migration status checks
- install verification
- resource validation
- metadata consistency checks

It may also verify:

- whether deployed menu and screen outputs match approved common metadata
- whether project-local runtime data remains separated from common governance data

It should not become the default runtime executor of project business queries.

Project apps should remain the primary runtime owners of project business data access.

## Version and Migration Rule

Every project DB should record:

- `projectId`
- `dbMigrationVersion`
- `platformVersion`
- `projectModuleVersion`
- `lastVerifiedAt`

The common DB should record the same target versions from the platform side so drift can be detected.

## Delete Rule

Deleting an install unit must never start by dropping arbitrary project DB tables.

The platform should:

1. resolve ownership from `COMMON_DB`
2. inspect dependency graph
3. generate project DB delete candidates
4. apply approved delete plan
5. record final state back into `COMMON_DB`

This keeps DB splitting reversible and traceable.

## Recommended Implementation In This Repository

1. keep existing menu, authority, and governance metadata under a common DB ownership model
2. add `projectId`, `packageId`, and DB ownership markers to install-unit metadata
3. add project DB migration status tracking in the platform console
4. scaffold project-owned DB objects from install-unit definitions instead of manual table creation
5. only after registry and migration tracking are stable, push more business tables out to project DBs

See also:

- `docs/architecture/platform-control-plane-data-model.md`
- `docs/sql/platform_control_plane_schema.sql`
