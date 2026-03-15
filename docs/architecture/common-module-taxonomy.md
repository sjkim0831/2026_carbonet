# Common Module Taxonomy

Generated on 2026-03-15 for the Carbonet platformization track.

## Goal

Define what kinds of common modules should exist in the Carbonet platform and how they should be selected when installing a new menu-centered feature.

## Core Split

The platform should not treat all common code as one undifferentiated bucket.

At minimum, common modules should be split into:

- `SI_COMMON`
- `OPS_COMMON`

Optional later splits:

- `SECURITY_COMMON`
- `UI_COMMON`
- `DATA_COMMON`
- `INTEGRATION_COMMON`

## 1. `SI_COMMON`

This is the implementation-facing common layer used while creating or extending features.

Typical contents:

- CRUD controller and service scaffolds
- request and response DTO patterns
- mapper and XML templates
- common search and pagination helpers
- code-group and common-code utilities
- file upload and download helpers
- Excel or PDF export adapters
- screen and form composition templates
- install-unit generation helpers

Use `SI_COMMON` when a new menu or page needs reusable feature-building blocks.

## 2. `OPS_COMMON`

This is the runtime and operations-facing common layer used across deployed projects.

Typical contents:

- authentication and session rules
- authority and permission evaluation
- menu visibility and route guards
- encryption, masking, and security transforms
- trace, audit, and telemetry infrastructure
- deployment, version, and compatibility checks
- project registry and install registry contracts
- orphan, drift, and delete-plan infrastructure
- batch or scheduler governance helpers

Use `OPS_COMMON` when a menu or project needs stable runtime behavior and operational governance.

## Recommended Supporting Common Areas

### `SECURITY_COMMON`

Usually shared by all projects and rarely copied:

- crypto adapters
- token handling
- sensitive-field masking
- IP policy helpers
- approval and policy checks

### `UI_COMMON`

Reusable frontend and template-level assets:

- shared admin layout primitives
- common tables, filters, dialogs, and tabs
- `data-help-id` governance helpers
- page manifest helpers

### `DATA_COMMON`

Reusable data and DB helpers:

- common pagination query fragments
- common code or lookup services
- migration helpers
- audit metadata persistence helpers

### `INTEGRATION_COMMON`

Reusable external integration wrappers:

- email or SMS adapters
- file storage adapters
- PDF engines
- spreadsheet engines
- external API wrappers

## Selection Model During Menu Install

When creating a new menu-centered install unit, the platform should let the operator choose common dependencies by category instead of copying source code manually.

Recommended selection flow:

1. define screen elements
2. define business functions
3. define parameters and outputs
4. define DB ownership needs
5. choose required common modules
6. mark each selected common as:
   - `REQUIRED`
   - `OPTIONAL`
   - `REFERENCE_ONLY`
7. record the selected common module version in the install unit

Examples:

- table list screen:
  - `SI_COMMON` search and pagination
  - `UI_COMMON` table and filter layout
  - `OPS_COMMON` permission and trace hooks
- approval workflow screen:
  - `OPS_COMMON` audit and authority checks
  - `SECURITY_COMMON` approval signature or masking
  - `INTEGRATION_COMMON` notification adapter
- file or report screen:
  - `SI_COMMON` attachment field scaffold
  - `INTEGRATION_COMMON` PDF or Excel engine
  - `OPS_COMMON` download audit

## Ownership Rule

Selected common modules should be referenced, not duplicated, unless a project explicitly forks them with approval.

That means:

- common modules are version-pinned artifacts
- install units store references to common modules
- delete of an install unit must not delete shared common modules
- common upgrades are managed centrally through the platform console

## What Should Not Be Common

Do not force these into common by default:

- project-specific business policies
- project-specific table layouts that are unstable
- temporary campaign or client customizations
- one-off route exceptions
- unclear legacy code with no owner

These should stay in project modules until they prove stable enough to promote.

## Registry Requirement

Every selected common module should be registered with:

- `commonModuleType`
- `commonModuleId`
- `version`
- `usageMode`
- `selectedByPackageId`
- `selectedByProjectId`

Without this, upgrade impact and uninstall safety remain unclear.
