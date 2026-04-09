# Reusable Read Module Separation Plan

## Goal

Define which kinds of business-facing read logic should become reusable modules because they make installable screens practical, and which should remain project-owned.

## Core Principle

For framework reuse, prefer:

- reusable `read` contracts
- project-owned `write` execution

This keeps common packages stable while allowing project-specific business behavior to evolve.

## Classification

### `COMMON_READ`

Reusable read logic with stable semantics across projects.

Typical examples:

- code and enum lookup
- menu inventory lookup
- authority and role lookup
- screen metadata lookup
- component registry lookup
- install manifest lookup
- validator result lookup
- rollback history lookup
- audit summary lookup

### `COMMON_READ_PROJECT_BIND`

Reusable read shape, but project-specific source binding.

Typical examples:

- project-scoped list screens with common filter contract
- shared dashboard cards with project-specific data source
- stable summary widgets backed by project mappers

### `PROJECT_READ`

Project-owned read logic.

Typical examples:

- domain-specific operational lists
- project-only report semantics
- read models with project-only joins or authority semantics

### `PROJECT_WRITE`

Project-owned write logic.

Typical examples:

- create/update/delete flows
- calculations
- approvals
- settlement
- external side effects

## Screen Installation Rule

An installable screen package is easiest when its data contract is one of:

- `COMMON_READ`
- `COMMON_READ_PROJECT_BIND`

These are the best candidates for:

- list screens
- detail screens
- dashboards
- validator and rollback consoles
- governance registries

Screens that depend on `PROJECT_WRITE` should usually install only as:

- screen shell
- manifest
- binding contract

with project executors still supplied locally.

## Practical Target

Move these first into reusable read candidates:

- builder registry/detail/install validator read models
- theme package registry/detail read models
- API package registry/detail read models
- install queue summaries
- validator evidence summaries
- rollback evidence summaries

## Success Test

The read split is strong enough when:

- read-heavy screens attach without copying service code
- projects mostly provide source bindings and not new read contracts
- write-heavy flows remain explicitly project-owned
