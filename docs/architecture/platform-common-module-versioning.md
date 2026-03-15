# Platform Common Module Versioning

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define how common code is shared across split or deployed projects without making those projects depend on live source retrieval from the main system.

## Core Rule

Common code must be delivered as version-pinned build artifacts:

- jar
- internal module
- packaged shared library
- exported installable bundle

Do not use runtime source fetching from the main system as the dependency model.

## Why

Version-pinned artifacts give:

- reproducible builds
- rollback safety
- compatibility checks
- controlled rollout by project
- stable audit of what version is deployed where

Runtime source fetching creates:

- hidden coupling to main-system availability
- unreproducible builds
- harder rollback
- unclear security review boundaries
- accidental behavior drift after main-system updates

## Required Version Metadata

Every deployed project should record:

- `platformVersion`
- `projectModuleVersion`
- `javaVersion`
- `dbDriverVersion`
- `apiContractVersion`
- `builtAt`
- `deployedAt`

## Recommended Package Split

### `platform-common`

Contains only cross-cutting code:

- authentication and session rules
- authority and permission helpers
- encryption, decryption, masking
- request and response normalization
- trace and audit infrastructure
- install registry contracts
- adapter or facade contracts for shared infrastructure

`platform-common` should be internally classified, not kept as one flat pool. The first recommended split is:

- `SI_COMMON`
- `OPS_COMMON`

See:

- `docs/architecture/common-module-taxonomy.md`

### `project-module`

Contains only project-owned business logic:

- project controllers
- project services
- project mappers
- project page manifests and screens
- project DB routing metadata

Project modules should assume a split data model:

- common governance metadata stays in `COMMON_DB`
- project business data lives in `PROJECT_DB`

### `install-unit`

Contains menu-centered feature assets:

- menu and page metadata
- feature definitions
- API and DTO definitions
- tables and columns owned by the module
- attached files, templates, or generated frontend assets

An install unit may depend on multiple common-module categories, but it should store those as versioned references instead of copying source code.

## Upgrade Rule

Upgrade flow should be:

1. update `platform-common`
2. publish a new versioned artifact
3. run compatibility checks against project modules
4. upgrade child systems selectively or in planned waves
5. record the applied platform version per deployment target

The main platform can move faster than deployed projects, but deployed projects must always run against an approved artifact version.

## Non-Goals

These are explicitly discouraged:

- runtime pulling of backend source code from the main platform
- child projects importing random source folders over the network
- treating the main platform repository as a live code filesystem for deployed systems
- bypassing version metadata because the code is "shared anyway"

## AI Guidance

AI can help with:

- facade extraction
- package split proposals
- compatibility diff summaries
- upgrade notes
- scaffold updates in project modules

The platform remains authoritative for:

- version publication
- compatibility approval
- security-sensitive dependency review
- deployment metadata
