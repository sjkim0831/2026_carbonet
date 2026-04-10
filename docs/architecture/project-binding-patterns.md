# Project Binding Patterns

## Goal

Document the preferred patterns for keeping common definitions reusable while letting each project bind them safely.

Use this document together with:

- `docs/architecture/common-project-reversible-transition-rules.md`
- `docs/architecture/system-builder-project-domain-install-target.md`
- `docs/architecture/page-systemization-minimum-contract.md`

## Preferred Pattern

Prefer `COMMON_DEF_PROJECT_BIND` over source-copy delivery.

Use this split:

1. `COMMON_DEFINITION`
2. `PROJECT_BINDING`
3. `PROJECT_EXECUTOR`

## 1. Common Definition

Keep these in the common lane when they are reusable:

- page manifest
- template or component-tree profile
- route family definition
- validator contract
- rollback expectation
- authority baseline
- read-heavy contract

## 2. Project Binding

Keep these in the project-binding lane:

- menu placement
- route prefix or route ownership selection
- theme or presentation override
- authority narrowing or override
- project data-source attachment
- project-specific integration endpoint selection

## 3. Project Executor

Keep these project-owned when behavior is unstable or business-specific:

- save/update/delete behavior
- approval exceptions
- project-specific calculation or side effects
- project-specific external integration writes

## Good Patterns

- common screen definition plus project menu binding
- common read model plus project write executor
- common page family plus project authority narrowing
- common validator plus project-specific runtime target selection

## Bad Patterns

- copying common page sources into each project as the default install path
- keeping common definition and project binding in one mixed DTO or table row
- forcing write-heavy project logic into common modules just to claim reuse
- hiding project binding assumptions in controller code instead of manifests or binding records

## Closeout Sentence

Use this sentence when ready:

`CLOSED: project binding is explicit for <page-family>; common definition, project binding, and project executor lines are separately traceable.`
