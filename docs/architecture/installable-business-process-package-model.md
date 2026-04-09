# Installable Business Process Package Model

## Goal

Define how Carbonet should treat business processes as installable packages without collapsing project-specific business logic into common framework modules.

This model supports:

- `3-minute new-project bootstrap`
- installable process flows
- reusable read-heavy screens
- thin project executors instead of project forks

## Core Rule

Do not treat an entire business workflow as one common blob.

Split every installable business process into three ownership layers:

1. `PROCESS_DEFINITION`
2. `PROCESS_BINDING`
3. `PROJECT_EXECUTOR`

## Ownership Layers

### `PROCESS_DEFINITION`

Common installable process package ownership.

Typical contents:

- process manifest
- state machine and status transitions
- stage definitions
- required input contract
- validator rules
- audit and rollback contract
- page family map
- event contract
- install compatibility rules

This is the part that should be reusable across projects.

### `PROCESS_BINDING`

Project attach layer for one process package.

Typical contents:

- project menu binding
- project authority binding
- project route binding
- project table binding
- project notification binding
- project theme or API package binding

This layer should stay thin and input-driven.

### `PROJECT_EXECUTOR`

Project-owned business execution logic.

Typical contents:

- save/update logic
- transactional workflow execution
- calculations
- approval exceptions
- external integrations
- project-specific side effects

This should remain project-owned unless the rule is truly stable across multiple projects.

## Installable Process Families

### Good Candidates

These are suitable for installable process packages:

- request -> review -> approve
- register -> inspect -> confirm
- collect -> validate -> compare -> repair
- publish -> verify -> deploy
- ticket and work-order style flows
- read-heavy monitoring and governance workflows

### Mixed Candidates

These need a common process shell plus project executor:

- forms with project-specific save rules
- approval flows with project exceptions
- workflows that share stage shape but not business execution

### Poor Candidates

These should usually stay project-owned:

- heavy calculation engines
- settlement logic
- project-only external agency integrations
- project-only state machines with unstable semantics

## Reusable Read Layer Rule

Most reusable screen installation value comes from read-heavy flows, not write-heavy business logic.

Prefer a dedicated reusable read module for:

- code lookup
- menu lookup
- authority lookup
- metadata lookup
- install status lookup
- validator result lookup
- rollback history lookup
- list/detail read models with stable semantics

Do not force write-heavy business logic into the same reusable package.

## Process Package Shape

An installable process package should declare:

- process manifest
- screen package dependencies
- theme package dependencies
- API package dependencies
- required bindings
- validator checks
- rollback metadata
- supported executor capability keys

## Success Test

A business process is installable enough when:

- process definition can be versioned and installed without source copy
- project changes mostly happen in binding and executor layers
- read-heavy screens can attach with thin adapters
- upgrades happen by manifest and capability checks, not by manual source merge
