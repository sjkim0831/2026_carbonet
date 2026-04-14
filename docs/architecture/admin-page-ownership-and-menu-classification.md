# Admin Page Ownership And Menu Classification

Generated on 2026-04-14 for Carbonet admin surface separation.

## Goal

Classify the current and near-term Carbonet admin pages into:

- `COMMON_ADMIN_OPS`
- `GENERAL_ADMIN`
- `PROJECT_ADMIN`

without forcing an immediate UI redesign.

This document exists so new menus, page manifests, feature codes, and script-to-page migrations follow one ownership model instead of expanding the current shared admin surface indefinitely.

## Core Rule

Keep one visual admin line for now, but stop treating all admin pages as the same product.

Every governed page should declare at least:

- `ownerScope`
- `routeScope`
- `authorityScope`
- `dataScope`
- `apiPort`
- `shellFamily`
- `deploymentLane`

This follows:

- `docs/architecture/admin-ops-and-project-admin-separation-plan.md`
- `docs/architecture/common-project-reversible-transition-rules.md`
- `docs/architecture/page-systemization-minimum-contract.md`

## Page Lanes

### `COMMON_ADMIN_OPS`

Central operator authority.

Own here:

- deployment, rollback, and runtime freshness proof
- backup, restore, retention, and DB promotion policy
- system, project, server, and topology registry
- observability, audit, and centralized diagnostics
- common module, artifact, and compatibility governance
- AI runner and controlled execution consoles

### `GENERAL_ADMIN`

Shared admin framework pages that remain reusable and may later bind into either central ops or project admin.

Own here:

- menu, page, feature, and screen registry management
- authority framework and admin account framework
- common code and platform metadata maintenance
- reusable shell-backed list/detail/edit families

Default install scope:

- `COMMON_DEF_PROJECT_BIND`

### `PROJECT_ADMIN`

Project or customer-scoped runtime admin.

Own here:

- project user, role, and organization maintenance within allowed boundaries
- project menu exposure and project setting changes
- business workflow and approval configuration
- project runtime content, monitoring, member, emission, and trade operations

## Current Classification Matrix

| Screen or family | Current route | Current menu/code anchor | Recommended ownerScope | Notes |
| --- | --- | --- | --- | --- |
| Environment management | `/admin/system/environment-management` | current system menu family | `COMMON_ADMIN_OPS` | Extend into project, server-role, topology, and file-placement registry. |
| Screen builder | `/admin/system/screen-builder` | current system menu family | `COMMON_ADMIN_OPS` | Builder/editor governance belongs to central operator control. |
| Full-stack management | `/admin/system/full-stack-management` | current system menu family | `GENERAL_ADMIN` | Reusable metadata explorer first, central compare/verification hooks second. |
| Screen command metadata | `ScreenCommandCenterServiceImpl` driven | page metadata registry | `GENERAL_ADMIN` | This is the canonical page contract authority during transition. |
| Codex request | `/admin/system/codex-request` | current system menu family | `COMMON_ADMIN_OPS` | Execution console, deploy targeting, rollback, queue control. |
| Observability | `/admin/system/observability` | current system menu family | `COMMON_ADMIN_OPS` | Deploy, trace, audit, security, backup, and runtime evidence. |
| Backup config | `/admin/system/backup_config` | `A0060401` | `COMMON_ADMIN_OPS` | Policy, storage, retention, execution summaries, restore playbooks. |
| Backup execution | `/admin/system/backup` | `A0060402` | `COMMON_ADMIN_OPS` | Execute governed backup actions only through audited action ports. |
| Version management | `/admin/system/version` | `A0060404` | `COMMON_ADMIN_OPS` | Release, rollout, apply, rollback, runtime package state. |
| DB promotion policy | `/admin/system/db-promotion-policy` | `A0060405` | `COMMON_ADMIN_OPS` | Policy catalog for DB change class, masking, render mode, rationale. |
| Menu management | current admin system route family | menu management family | `GENERAL_ADMIN` | Reusable page family with project binding, not fleet-ops by itself. |
| Page management | current admin system route family | page management family | `GENERAL_ADMIN` | Shared builder-ready registry family. |
| Feature management | current admin system route family | function/feature family | `GENERAL_ADMIN` | Shared authority and action registry. |
| Authority and role framework | admin member/system role families | current authority family | `GENERAL_ADMIN` | Common authority framework first, project narrowing through binding. |
| Project member/company/admin flows | `/admin/member/*` and nearby | project admin menu families | `PROJECT_ADMIN` | Project-specific approval and scope rules keep these project-owned. |
| Emission runtime admin | `/admin/emission/*` | emission menu families | `PROJECT_ADMIN` | Save/calculate/approval stays project runtime even if shell is shared. |
| Trade/payment/certificate admin | `/admin/trade/*`, `/admin/payment/*` and nearby | business menu families | `PROJECT_ADMIN` | Business semantics and project data ownership dominate. |
| Content/support/admin business screens | content and support menu families | business menu families | `PROJECT_ADMIN` | Project content policy and records are project-owned. |
| External monitoring governance | `/admin/external/monitoring` | current monitoring menu family | `MIXED_TRANSITION` | Project-facing diagnostics may stay project-owned; fleet-wide linkage and incident evidence should move to central ops. |

## Classification Contract By Lane

| Lane | routeScope | authorityScope | dataScope | apiPort | deploymentLane |
| --- | --- | --- | --- | --- | --- |
| `COMMON_ADMIN_OPS` | central console route | operator roles such as `ROLE_SYSTEM_MASTER`, `ROLE_SYSTEM_ADMIN`, `ROLE_OPERATION_ADMIN` | control-plane DB plus read-only links to project evidence | common control-plane ports | central console first, transitional dual exposure only when needed |
| `GENERAL_ADMIN` | shared admin shell route family | common admin roles with explicit bindable narrowing | common metadata DB or common definition plus binding | common runtime ports with project binding adapters where needed | both during transition |
| `PROJECT_ADMIN` | project runtime admin route | project admin and scoped business-admin roles | project DB | project adapter or project runtime ports | project runtime |

## Near-Term Menu Grouping

Use this grouping for operator IA and menu tree cleanup.

### Central Ops Menus

- system registry
- project registry
- server role binding
- deploy and rollback console
- backup and restore governance
- DB promotion and migration governance
- observability and audit
- file and retention governance
- common version and compatibility governance
- AI execution governance

### General Admin Menus

- menu management
- page management
- feature management
- screen-flow and assignment management
- common code and metadata management
- authority framework management

### Project Admin Menus

- project account and role assignment
- project menu exposure
- project settings
- project workflow and approval setup
- project business operations by domain

## Practical Split Rule

When one page mixes these concerns, do not fork the UI immediately.

Split first:

1. read model
2. action port
3. authority policy
4. audit target

Then choose one of:

- `OPS_ONLY`
- `PROJECT_ONLY`
- `COMMON_DEF_PROJECT_BIND`
- `MIXED_TRANSITION`

## Immediate Implementation Rule

For new pages and menu additions:

- do not add fleet deploy, backup, restore, DB sync, retention, or AI runner actions under project business menus
- do not put project business writes under central ops menus
- prefer one common page definition with project binding for shared metadata pages
- require `ScreenCommandCenterServiceImpl` metadata to carry the separation fields before claiming the page is systemized

## Current Recommended Next Moves

1. Keep `A00604` as the central backup and release-governance group.
2. Keep `A0060401`, `A0060402`, `A0060404`, and `A0060405` in `COMMON_ADMIN_OPS`.
3. Extend `environment-management` with project/server/topology registry instead of creating a parallel registry surface.
4. Extend `codex-request` into a central deploy-and-execute console instead of leaving deploy macros as raw scripts.
5. Treat project business admin families as `PROJECT_ADMIN` even when they keep the same shell and components.
