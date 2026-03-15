# DB Migration and Upgrade Operations

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define when real upgrades happen and how DB schema changes, common-module upgrades, and project-app deployment should be coordinated.

## Core Rule

A real upgrade does not happen when code is merely written.

A real upgrade happens only when all of the following are ready for a target project:

- common module version is fixed
- project app version is fixed
- DB migration version is fixed
- compatibility checks pass
- rollback path is prepared
- deployment window is approved

## Upgrade Unit

Every project upgrade should be tracked as one release unit:

- `projectId`
- `platformVersion`
- `projectModuleVersion`
- `dbMigrationVersion`
- `apiContractVersion`
- `targetEnvironment`
- `approvedAt`
- `appliedAt`

## When To Upgrade

Upgrade timing should follow these stages:

### 1. Build Complete

Code, docs, and migration scripts are ready.

This is not yet a real upgrade.

### 2. Compatibility Verified

Verify:

- project app works with the target common jar version
- migration scripts work against the target project DB
- no blocked shared-resource or contract changes remain

Still not production upgrade yet.

### 3. Deployment Window Approved

Real upgrade should be scheduled in:

- planned maintenance window
- low-traffic project window
- emergency security patch window if risk justifies it

This is the point where the upgrade becomes operationally real.

### 4. Apply Upgrade

Recommended order:

1. backup or snapshot
2. run pre-checks
3. apply DB migration
4. deploy project app with the approved common jar version
5. run smoke tests
6. sync registry and metadata if needed
7. monitor logs, errors, and audit events

### 5. Close Or Roll Back

If checks pass:

- mark the release unit as applied

If checks fail:

- execute rollback plan
- restore DB if required
- revert project app and common module version

## DB Change Rules

This document assumes:

- a stable `COMMON_DB` for platform governance
- one or more `PROJECT_DB` targets for business data

Migration planning should always distinguish whether a change affects:

- `COMMON_DB`
- one specific `PROJECT_DB`
- many project DBs in a rollout wave

### Safe Changes

Usually safe with low risk:

- add nullable column
- add new table
- add index
- add backward-compatible code table entry

### Caution Changes

Require staged rollout:

- rename column
- change column type
- drop column
- change primary key or foreign key behavior
- split or merge tables

These should usually be done in two phases:

1. additive and compatibility-preserving
2. cleanup after the new app version is fully stable

## Separate DB Server Strategy

Running an extra DB server and switching over is possible, but it should be reserved for:

- large schema rewrites
- high-risk migrations
- near-zero-downtime cutovers
- major vendor or storage changes

It should not be the default for ordinary column updates.

For normal project upgrades, prefer:

- versioned migration scripts
- project-scoped DB update
- app deployment aligned to the migration version

## Immediate Reflection Of Column Changes

To reflect a column or schema change immediately, all dependent layers must already understand the new version:

- DB migration applied
- project app deployed or restarted
- common module compatibility confirmed
- caches or metadata refreshed if relevant

If one of these lags behind, "immediate reflection" becomes partial and unsafe.

## Platform Console Responsibilities

The main platform console should track:

- pending migrations by project
- approved upgrade windows
- current and target platform version
- current and target project module version
- current and target DB migration version
- rollback readiness
- final applied status

## Default Recommendation

Use this policy by default:

1. finish code and migration
2. verify compatibility in a non-production environment
3. schedule a release window
4. apply DB migration and app deployment together
5. confirm smoke test and audit trail

Do not treat a merged code change as a completed upgrade.
