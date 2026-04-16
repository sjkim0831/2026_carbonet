# System Asset Management Screen And Menu Plan

Generated on 2026-04-14 for Carbonet system-asset-management closure.

## Goal

Organize Carbonet's current admin surfaces from the perspective of system asset management, then define:

- which existing screens already cover part of the asset-management problem
- which screens should be improved rather than rebuilt
- which missing screens should be created
- how the menu tree should be regrouped so operators can manage assets as one governed domain

Use this document when the request is about:

- "우리 시스템 자산관리 측면에서 미흡한 항목"
- asset inventory or CMDB-like admin screens
- screen/menu reorganization for operations governance
- deciding whether an existing screen is enough for asset management or still partial

See also:

- `docs/architecture/admin-system-screen-completion-audit.md`
- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/install-unit-lifecycle-and-resource-governance.md`
- `docs/architecture/platform-console-information-architecture.md`
- `docs/architecture/admin-page-ownership-and-menu-classification.md`

## Core Position

Carbonet already has many operations-adjacent screens, but they are spread across:

- `/admin/system/*`
- `/admin/external/*`
- `/admin/monitoring/*`
- `/admin/content/*`
- selected `/admin/member/*`

That means the product already contains many asset-management ingredients, but not yet one complete asset-management operating model.

The current gap is not "no screens exist".

The current gap is:

- asset inventory is fragmented
- asset ownership is implicit
- route/menu/screen/function/API/DB/resource chains are not exposed as one operator flow
- several screens are still partial or scaffold-level for actual asset governance

## Asset Management Scope For This Repository

Treat "system asset management" as seven governed families:

1. `service inventory assets`
   - menus, pages, functions, APIs, backend chains
2. `runtime infrastructure assets`
   - environment, node, scheduler, batch, backup, restore, version/runtime package
3. `security and access assets`
   - policy, whitelist, blocklist, login/access/security audit, authority and admin account scope
4. `integration assets`
   - external connections, keys, schema, sync, retry, monitoring, maintenance, webhooks
5. `content and file assets`
   - file registry, downloads, templates, popup/banner/content attachments
6. `governance metadata assets`
   - page registry, feature registry, menu registry, screen-flow, screen-menu assignment, help, manifests
7. `recovery and lifecycle assets`
   - backup, restore, DB promotion policy, runtime compare, repair, deploy/change evidence

## Current Existing Screens Worth Reusing

These screens already cover real asset-management slices and should be treated as the reuse base, not as throwaway prototypes.

| Asset family | Existing screen | Route | Current role | Immediate judgment |
| --- | --- | --- | --- | --- |
| Governance metadata | Menu management | `/admin/system/menu` | menu tree and entry registration | keep and extend |
| Governance metadata | Page management | `/admin/system/page-management` | page registry and page-code governance | keep and extend |
| Governance metadata | Function management | `/admin/system/feature-management` | feature/action registry | keep and extend |
| Governance metadata | Full-stack management | `/admin/system/full-stack-management` | menu-page-function-API-schema exploration | keep and extend |
| Governance metadata | Screen flow management | `/admin/system/screen-flow-management` | page-flow and dependency chain visibility | partial; upgrade |
| Governance metadata | Screen-menu assignment | `/admin/system/screen-menu-assignment-management` | menu-page binding and orphan visibility | partial; upgrade |
| Governance metadata | Screen builder | `/admin/system/screen-builder` | builder authoring and governance entry | keep; do not overload as CMDB |
| Governance metadata | Screen runtime | `/admin/system/screen-runtime` | published screen runtime evidence | keep |
| Governance metadata | Current runtime compare | `/admin/system/current-runtime-compare` | drift and mismatch comparison | keep |
| Runtime infrastructure | Environment management | `/admin/system/environment-management` | platform/env registry seed | partial; make this the inventory root |
| Runtime infrastructure | Scheduler management | `/admin/system/scheduler` | scheduler job and node view | keep |
| Runtime infrastructure | Batch management | `/admin/system/batch` | job queue and worker operations | partial; upgrade |
| Runtime infrastructure | Backup config | `/admin/system/backup_config` | backup policy/storage/retention | keep |
| Runtime infrastructure | Backup execution | `/admin/system/backup` | backup run surface | partial; split execution-first workflow |
| Runtime infrastructure | Restore execution | `/admin/system/restore` | restore surface | partial; split execution-first workflow |
| Runtime infrastructure | Observability | `/admin/system/observability` | audit/trace evidence | keep |
| Security and access | Security policy | `/admin/system/security-policy` | policy and remediation governance | keep |
| Security and access | Security monitoring | `/admin/system/security-monitoring` | security event monitoring | keep |
| Security and access | Security audit | `/admin/system/security-audit` | audit evidence search | keep |
| Security and access | Access history | `/admin/system/access_history` | access log search | keep |
| Security and access | Error log | `/admin/system/error-log` | failure/evidence search | keep |
| Security and access | IP whitelist | `/admin/system/ip_whitelist` | trusted-access asset list | keep |
| Security and access | Blocklist | `/admin/system/blocklist` | blocked entity asset list | keep |
| Integration assets | External connection list | `/admin/external/connection_list` | integration inventory root | keep |
| Integration assets | External connection edit/add | `/admin/external/connection_edit`, `/admin/external/connection_add` | connection definition maintenance | keep; add stronger validation |
| Integration assets | External keys | `/admin/external/keys` | key inventory and rotation queue | partial; upgrade |
| Integration assets | External schema | `/admin/external/schema` | interface schema governance | partial; upgrade |
| Integration assets | External sync | `/admin/external/sync` | execution and queue control | keep |
| Integration assets | External retry | `/admin/external/retry` | replay queue and policy | keep |
| Integration assets | External logs | `/admin/external/logs` | integration execution logs | keep |
| Integration assets | External monitoring | `/admin/external/monitoring` | integration health view | keep |
| Integration assets | External maintenance | `/admin/external/maintenance` | maintenance windows | partial; upgrade |
| Integration assets | External webhooks | `/admin/external/webhooks` | endpoint/delivery governance | partial; upgrade |
| Content and file assets | File management | `/admin/content/file` | file inventory, owner, retention | keep and pull into asset lens |
| Governance metadata | Help management | `/admin/system/help-management` | governed help metadata | keep |
| Recovery and lifecycle | Repair workbench | `/admin/system/repair-workbench` | compare/repair lane | keep |
| Recovery and lifecycle | Codex request | `/admin/system/codex-request` | controlled change execution | keep |
| Recovery and lifecycle | SR workbench | `/admin/system/sr-workbench` | request-to-build flow | keep |

## Existing Screens That Should Be Modified First

These are the highest-value modifications for asset management closure.

### 1. Environment Management

Route:

- `/admin/system/environment-management`

Why it should change:

- It is the best current anchor for a central asset inventory, but today it is still mostly a summary/engine page.

What to add:

- system registry list
- server/node registry
- environment profile registry
- runtime package identity
- ownership fields such as `ownerScope`, `operatorOwner`, `serviceOwner`, `criticality`
- dependency summary to menu/page/function/API/DB/resource chains

Target role:

- `asset inventory root`

### 2. Screen Flow Management

Route:

- `/admin/system/screen-flow-management`

Why it should change:

- It is already close to service-asset dependency management, but still weak on CRUD, versioning, and impact checks.

What to add:

- saved flow definitions
- route-to-function-to-API-to-DB chain persistence
- impact preview before change
- missing binding and orphan detection

Target role:

- `service asset relation map`

### 3. Screen-Menu Assignment Management

Route:

- `/admin/system/screen-menu-assignment-management`

Why it should change:

- It should become the operator view that explains which page belongs to which menu and what is currently ownerless.

What to add:

- assignment mutation
- duplicate/conflict detection
- hidden route handling
- authority impact preview
- orphaned page repair path

Target role:

- `page/menu ownership console`

### 4. Batch Management

Route:

- `/admin/system/batch`

Why it should change:

- Batch jobs are runtime assets, but the current page is not yet strong enough for lifecycle control.

What to add:

- pause/resume/retry
- queue drain state
- job ownership
- dependent API/DB/resource impact
- execution audit

Target role:

- `runtime execution asset console`

### 5. Backup And Restore

Routes:

- `/admin/system/backup_config`
- `/admin/system/backup`
- `/admin/system/restore`

Why they should change:

- Backup policy exists, but execution and restore still need stronger preflight, approval, evidence, and rollback trace.

What to add:

- separate execution-first views
- backup set inventory
- restore target compatibility
- approval and evidence chain
- runtime package and DB snapshot linkage

Target role:

- `recovery asset console`

### 6. External Keys, Schema, Webhooks, Maintenance

Routes:

- `/admin/external/keys`
- `/admin/external/schema`
- `/admin/external/webhooks`
- `/admin/external/maintenance`

Why they should change:

- These are critical integration assets but still partial for lifecycle governance.

What to add:

- issue/rotate/revoke and expiry policy for keys
- version publish/rollback for schemas
- delivery test/replay/secret rotation for webhooks
- approval and impact scope for maintenance windows

Target role:

- `integration asset lifecycle suite`

## New Screens To Build

These screens do not need a brand-new domain from scratch, but they do need distinct operator workflows beyond the current partial surfaces.

### 1. Asset Inventory Console

Recommended route:

- `/admin/system/asset-inventory`

Purpose:

- one search-first inventory for all governed assets

Minimum contents:

- asset type filter
- owner scope filter
- lifecycle status filter
- criticality filter
- route/menu/page/function/API/DB/resource link preview
- last audit/verification timestamp

This page should aggregate, not replace, existing screens.

### 2. Asset Detail Console

Recommended route:

- `/admin/system/asset-detail`

Purpose:

- one detail view for one governed asset across identity, ownership, dependency, runtime, security, backup, and audit

Minimum tabs:

- identity
- owner and scope
- dependency chain
- runtime and deployment
- security and authority
- backup and recovery
- audit and change history

### 3. Asset Change Impact Console

Recommended route:

- `/admin/system/asset-impact`

Purpose:

- show what will be affected before a menu/page/function/API/runtime change is applied

Minimum outputs:

- impacted menus and hidden pages
- feature/authority chain
- API/backend/DB chain
- files/templates/downloads/help/manifests
- rollback and verification checklist

### 4. Asset Lifecycle Governance Console

Recommended route:

- `/admin/system/asset-lifecycle`

Purpose:

- govern create, bind, publish, deprecate, retire, delete, and rollback for governed assets

Why separate:

- delete and retirement should be plan-driven, not hidden inside menu delete or page delete

### 5. Asset Gap Queue

Recommended route:

- `/admin/system/asset-gap`

Purpose:

- expose missing owner, missing route binding, missing backup policy, missing authority scope, missing audit binding, and orphan resources

Why separate:

- operators need one backlog for "what is still not governed"

This should reuse the ideas from `docs/architecture/missing-asset-queue-ia.md`, but scoped to system asset management rather than only missing page/component generation.

## Menu Structure To Improve

Current asset-management behavior is too spread across `system`, `external`, `monitoring`, and `content`.

Use this near-term menu grouping instead.

### 1. Asset Inventory

Recommended group under `/admin/system`:

- Asset inventory
- Asset detail
- Asset impact
- Asset lifecycle
- Asset gap

### 2. Service Registry

- Menu management
- Page management
- Function management
- Screen flow management
- Screen-menu assignment management
- Full-stack management
- Help management

### 3. Runtime Operations

- Environment management
- Verification center
- Scheduler management
- Batch management
- Backup config
- Backup execution
- Restore execution
- Current runtime compare
- Repair workbench

### 4. Security And Access Assets

- Security policy
- Security monitoring
- Security audit
- Access history
- Error log
- IP whitelist
- Blocklist

### 5. Integration Assets

- External connection list
- External keys
- External schema
- External sync
- External retry
- External logs
- External monitoring
- External webhooks
- External maintenance

### 6. Controlled Change And Evidence

- Observability
- Codex request
- SR workbench

## Menu Cleanup Rules

1. Do not create another separate asset-management tree under project business menus.
2. Keep central asset governance under `/admin/system` even when it links into `/admin/external` and `/admin/content`.
3. Keep integration-specific detail pages under `/admin/external/*`, but expose them from the asset inventory root.
4. Do not overload `screen-builder` to behave as a general CMDB.
5. Do not keep delete, retire, and rollback hidden inside ordinary list/detail forms.

## Implementation Order

Use this sequence.

1. Upgrade `environment-management` into the inventory root.
2. Upgrade `screen-flow-management` and `screen-menu-assignment-management` into real ownership/dependency consoles.
3. Create `asset-inventory` and `asset-detail`.
4. Split backup/restore into execution-first governed flows.
5. Upgrade partial integration lifecycle screens.
6. Add `asset-impact`, `asset-lifecycle`, and `asset-gap`.

## Skill Routing

Use these skills in this order when the request is asset-management-driven.

1. `carbonet-ai-session-orchestrator`
   - decide whether the work is one-session docs only, or shared frontend/backend/menu work
2. `carbonet-common-project-boundary-switcher`
   - when the request asks how to keep central ops assets separate from project-admin assets
3. `carbonet-audit-trace-architecture`
   - when the request needs inventory, ownership, dependency, audit, or trace modeling
4. `carbonet-feature-builder`
   - when implementing or extending actual menus, routes, services, mappers, and page contracts
5. `carbonet-screen-builder`
   - only when builder/governed-page authoring itself is part of the asset-management solution
6. `admin-screen-unifier`
   - when the screen already exists and needs consistency/closeout instead of net-new business logic

## Done Definition

Do not call system asset management "complete" until all of these are true:

- one asset inventory root exists
- one asset detail view exists
- owner and scope are explicit
- menu/page/function/API/backend/resource chains are queryable
- backup and restore evidence can attach to governed runtime assets
- at least one queue exposes missing owner, orphan, or missing-governance states
- partial screens above are either upgraded or explicitly documented as aliases/scaffolds

## Verification Center Extension

Use `/admin/system/verification-center` as the operational scanner for governed assets.
Use `/admin/system/verification-assets` as the direct management console for baseline rows, reusable test accounts, masked datasets, and action-queue closeout.

Minimum responsibilities:

- keep per-page baseline backup snapshots with retention location and owner
- keep reusable test account and dataset profiles with expiry and reset policy
- run scheduled daily and weekly smoke or drift sweeps like a maintenance scanner
- keep run evidence, trace linkage, compare linkage, and rollback linkage together
- block verification when only production-bound credentials or real datasets remain
- expose recent run history, stale baseline count, expiring profile count, stale dataset count, and immediate action queue on the page
- persist verification-center working state such as recent runs and action queue, at minimum in a local governed state file before DB promotion

This page should behave less like a passive documentation page and more like a governed maintenance console.
