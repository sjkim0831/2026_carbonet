# Service Module Gate Template And Compatibility Matrix

Generated on 2026-04-16 for Carbonet service-module growth and common-core upgrade safety.

## Goal

Provide one repeatable standard for:

- adding new service-module-backed screens
- naming gate action keys consistently
- classifying upgrade compatibility before touching project code
- letting hard-to-upgrade or non-upgradeable paths stay alive behind gate adapters

This document is the practical follow-up to:

- `stable adapter`
- `stable execution gate`
- `changeable common core`

## Core Rule

When a new service module or screen is added, do not wire:

- controller -> common internal service
- project runtime -> version-sensitive common helper
- operations console -> direct internal executor

Use this chain instead:

1. controller or page entry
2. stable gate request
3. gate router
4. gate adapter or gate handler
5. common-core internal service

If the downstream path is legacy, unstable, vendor-locked, or difficult to upgrade, stop at step 4 and keep the instability inside the adapter.

## Standard Gate Template

Use this minimum template when adding a new service module screen.

### 1. Stable request context

Every gate request should carry:

- `executionGateVersion`
- `actorScope`
- `routeScope`
- `capabilityKey`
- `actorId`
- trace/request ids when available

### 2. Stable action key

Every executable action should have one explicit key.

Format:

- `<surface>.<module>.<resource>.<verb>`

Examples:

- `system-builder.security-policy.auto-fix`
- `emission-definition-studio.draft.save`
- `codex-admin.tickets.plan`
- `wbs.excel.download`

### 3. Stable payload contract

Prefer:

- common-owned request DTO
- common-owned response DTO
- or common-owned `Map<String, Object>` only when the payload is still transitional

Do not let gate modules depend on project-only DTO packages unless the DTO itself has been promoted into a common contract module.

### 4. Gate adapter

Add an adapter when:

- the downstream API is hard to upgrade
- a legacy module must stay untouched
- a vendor or framework boundary should not leak outward
- a batch of modules still cannot be migrated at once

The adapter may:

- translate stable gate payload into legacy request shape
- reconstruct actor context for old APIs
- call vendor-locked or version-sensitive services
- normalize old responses into stable gate responses

The adapter must not:

- become a new business-logic dumping ground
- expose downstream unstable types to the caller
- create alternate bypass routes around the gate

## Action Key Naming Rule

### Required shape

Use four logical parts whenever possible:

1. surface
2. module
3. resource
4. verb

Recommended surfaces:

- `project-admin`
- `operations`
- `system-builder`
- `codex-admin`
- `emission`
- `wbs`
- `full-stack`

### Verb rule

Use explicit verbs:

- `get`
- `list`
- `save`
- `update`
- `delete`
- `prepare`
- `plan`
- `execute`
- `publish`
- `dispatch`
- `download`
- `rollback`
- `precheck`

Avoid vague tails such as:

- `run`
- `process`
- `do`
- `handle`

unless the action is genuinely a generic orchestration entry.

### Stability rule

Once published, an action key is part of the stable boundary.

If a new implementation is needed:

- keep the old action key working through an adapter
- or publish a new gate version and deprecate the old key deliberately

Do not silently rename keys in patch-level common upgrades.

## Gate Version Rule

Track these separately:

- `executionGateVersion`
- `actionContractVersion`
- `adapterVersion`
- `compatibilityClass`

Recommended minimum:

- `executionGateVersion = v1`
- action key remains stable across normal patch/minor upgrades
- adapter version changes when the adapter internals must absorb a downstream change

## Compatibility Matrix

Use these classes before releasing a common-core upgrade.

### `IMPLEMENTATION_SAFE`

Meaning:

- gate contract unchanged
- action keys unchanged
- payload meaning unchanged
- adapter unchanged or internal-only

Project impact:

- no project code change expected

### `ADAPTER_SAFE`

Meaning:

- gate contract unchanged
- downstream service changed
- gate adapter absorbs the difference

Project impact:

- no project code change expected
- adapter rollout verification required

### `CONTRACT_AWARE`

Meaning:

- response or request fields changed in a backward-aware way
- optional new fields added
- caller behavior may need review

Project impact:

- no forced rewrite, but project validation required

### `BREAKING`

Meaning:

- required field meaning changed
- action key removed or renamed
- response semantics no longer match the previous contract

Project impact:

- new contract line or gate version required

## Module-Add Workflow

When adding a new service module screen:

1. define the screen family and owner
2. define action keys first
3. define gate request/response contract
4. decide whether a direct handler or an adapter is needed
5. wire controller only to the gate
6. classify compatibility before release

Do not start by wiring the controller straight to the service.

## Hard-To-Upgrade Path Rule

If a module is effectively “non-upgradeable” in place:

- keep the legacy path behind a gate adapter
- freeze the stable action key and payload
- let the adapter translate to the old call shape
- migrate behind the adapter later

Examples:

- vendor SDK lock-in
- hard-coded legacy workbench methods
- framework-version-specific helper contracts
- legacy session or token assumptions

This is the preferred escape hatch when hundreds of modules cannot move at once.

## Management Screen Rule

Should package and upgrade governance eventually have a screen?

Yes.

But only after these become stable first:

- action key registry
- gate version registry
- compatibility matrix source
- package manifest schema
- runtime package metadata

Until then, the screen should not be treated as the source of truth.
The source of truth must stay in contracts, manifests, and registry data.

## Initial Compatibility Matrix Template

Use this row format in release planning:

| gateName | actionKeyPrefix | executionGateVersion | adapterVersion | compatibilityClass | projectRewriteRequired | notes |
| --- | --- | --- | --- | --- | --- | --- |
| operations-action | `system-builder.*` | `v1` | `1.0.0` | `ADAPTER_SAFE` | `false` | summary command service hidden behind gate |
| operations-action | `codex-admin.tickets.*` | `v1` | `1.0.0` | `ADAPTER_SAFE` | `false` | SR workbench calls absorbed by gate adapter |
| binary-download | `wbs.excel.download` | `v1` | `1.0.0` | `IMPLEMENTATION_SAFE` | `false` | controller sees only download contract |
| session-simulation | `session-simulator.*` | `v1` | `1.0.0` | `CONTRACT_AWARE` | `false` | servlet-bound transition path still exists behind gate |

## Required Closeout For New Modules

Before calling a new service module “gate-ready”, confirm:

- action keys are final and documented
- the controller has no direct internal service call
- a compatibility class is assigned
- an adapter exists when downstream upgrade risk is high
- a future common-core upgrade can be classified without reopening project code
