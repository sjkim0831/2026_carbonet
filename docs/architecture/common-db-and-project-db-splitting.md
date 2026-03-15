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

### `PROJECT_DB`

Project-owned business data only.

Typical contents:

- project business master and detail tables
- project-specific code or lookup tables
- project-owned upload metadata
- project-owned scheduler or batch tables
- project-owned statistics and domain data

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

Move these to `PROJECT_DB` by default:

- business entities
- domain transactions
- project-specific document and attachment records
- project-specific reports and operational data

## Access Rule

The main platform console may connect to project DBs for:

- migration status checks
- install verification
- resource validation
- metadata consistency checks

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
