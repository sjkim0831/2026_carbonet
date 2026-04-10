# Page Systemization Minimum Contract

## Goal

Define the minimum contract that turns an existing page into a governed system asset.

This document is the canonical answer to:

- what makes one page "systemized"
- what the builder may treat as a reusable page unit
- what can be installed into another project without falling back to source-copy delivery

## Core Rule

A working page is not automatically a systemized page.

A page is systemized only when it can move as one governed unit through:

- builder authoring
- project binding
- install and upgrade
- runtime deploy
- compare, repair, rollback, and audit

## Minimum Required Fields

Every systemized page must declare all of the following.

### 1. Stable Identity

- `pageId`
- `menuCode`
- canonical route path
- page family such as `registry`, `detail`, `edit`, `review`, `install-bind`, `validator-result`
- ownership lane such as `SYSTEM`, `BUILDER`, `PROJECT`, `DOMAIN_INSTALL`
- install scope such as `COMMON_ONLY`, `PROJECT_ONLY`, `COMMON_DEF_PROJECT_BIND`

### 2. Runtime Structure

- page manifest
- approved component tree or approved template profile
- layout slots and frame profile
- help, accessibility, security, and authority binding references

### 3. Authority Scope

- actor family
- data scope such as `GLOBAL`, `INSTT_SCOPED`, `DEPT_SCOPED`, `PROJECT_SCOPED`, `PUBLIC`
- action scope such as `view`, `create`, `update`, `delete`, `approve`, `execute`, `export`
- approval-authority requirement where relevant
- delegated or grantable authority rule where a higher actor configures a lower actor

Authority scope is mandatory because it aligns:

- menu visibility
- page entry guards
- query filtering
- mutation guards
- row and popup actions
- export, download, approve, and delete safety
- audit and trace interpretation

### 4. Data And Action Contracts

- bootstrap payload contract
- query contract
- mutation contract
- event to function/API linkage
- backend chain reference
- DB impact visibility when relevant

### 5. Install And Project Binding

- installable module or page-family ownership
- required project binding inputs
- theme or presentation binding inputs when relevant
- runtime effects
- validator checks
- rollback evidence expectations

## Non-Systemized States

Treat a page as not yet systemized when any of these are true:

- route works but `pageId` is unstable or missing
- menu exists but authority scope is implicit or hard-coded
- UI buttons hide actions that the backend does not gate the same way
- page manifest, help anchors, and backend screen-command metadata drift apart
- install scope is unclear
- rollback or validator visibility is missing

These pages may still be useful runtime pages, but they are not governed builder assets.

## Builder Rule

The builder may only publish or regenerate a page safely when:

- stable identity is explicit
- authority scope is explicit
- contracts are explicit
- install scope is explicit
- validators can prove the above before publish

If not, the page may be edited as a draft candidate, but it should not be called reusable or installable.

## Common Versus Project Rule

Use this split:

- `COMMON_ONLY`
  - common page definition and common policy with no project semantics
- `PROJECT_ONLY`
  - project runtime page with project-local route, DB, or business semantics
- `COMMON_DEF_PROJECT_BIND`
  - common page definition plus project menu, route, authority, theme, or data binding

For most reusable builder-managed pages, prefer `COMMON_DEF_PROJECT_BIND`.

## Success Test

One page is systemized enough when:

- it can be identified the same way in builder, runtime, audit, and deploy evidence
- it can be installed into a project through bindings instead of source copy
- authority scope survives regeneration and deploy
- validator and rollback surfaces can reason about it without page-local tribal knowledge

Use these closeout documents when the task moves from structure cleanup into productization:

- `docs/architecture/page-systemization-checklist.md`
- `docs/architecture/builder-install-deploy-closeout-checklist.md`
