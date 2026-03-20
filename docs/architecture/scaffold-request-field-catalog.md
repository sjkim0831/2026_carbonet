# Scaffold Request Field Catalog

Generated on 2026-03-21 for the Resonance structured scaffold contract track.

## Goal

Define the normalized field catalog, value families, and validation rules for `scaffold-request.json`.

This document is the field-level companion to:

- `docs/architecture/scenario-family-generation-contracts.md`
- `docs/architecture/operations-platform-console-architecture.md`

## Core Rule

`scaffold-request.json` is the authoritative machine payload for generation.

No frontend or backend scaffold generation should begin from partial form state or free-text intent alone when this contract can be produced.

## Required Top-Level Fields

### Generation Unit

- `generationUnit`
  - type: `string`
  - required: yes
  - recommended values:
    - `THEME_SET`
    - `PAGE_DESIGN`
    - `ELEMENT_DESIGN`
    - `COMPONENT_CATALOG_ITEM`
    - `PAGE_ASSEMBLY`
    - `BINDING_SET`
    - `FULL_SCREEN_FAMILY`

### Project And Ownership

- `projectId`
  - type: `string`
  - required: yes
  - rule: must exist in `PROJECT_REGISTRY`
- `requirementDomain`
  - type: `string`
  - required: yes
  - example: `02_회원인증`
- `screenRequirementId`
  - type: `string`
  - required: conditional
  - rule: required when generation starts from requirement-mapped sources
- `designOutputPackageId`
  - type: `string`
  - required: conditional
  - rule: required when generation starts from uploaded proposal or design-workspace output packages

### Scenario And Authority

- `scenarioFamilyId`
  - type: `string`
  - required: yes
- `scenarioId`
  - type: `string`
  - required: yes
- `actorPolicyId`
  - type: `string`
  - required: yes
- `memberClassificationPolicyId`
  - type: `string`
  - required: conditional
  - rule: required when member or actor classification is part of the feature
- `csrfPolicyId`
  - type: `string`
  - required: conditional
  - rule: required for state-changing browser flows

### UI And Theme

- `themeId`
  - type: `string`
  - required: yes
- `colorTokenBundleId`
  - type: `string`
  - required: yes
- `fontBundleId`
  - type: `string`
  - required: yes
- `technologyProfileId`
  - type: `string`
  - required: yes
  - recommended values:
    - `EGOV_SPRING_MVC`
    - `REACT_MIGRATION`
    - `JSP_ADMIN`
    - `KRDS_REACT`
- `deviceProfileSet`
  - type: `string[]`
  - required: yes
- `responsiveProfileId`
  - type: `string`
  - required: yes
- `appRuntimeProfileId`
  - type: `string`
  - required: yes
- `languageProfileSet`
  - type: `string[]`
  - required: yes
- `actionLayoutProfile`
  - type: `string`
  - required: yes
- `componentCatalogSelection`
  - type: `string[]`
  - required: yes

### API, DB, Module

- `apiBindingSet`
  - type: `string[]`
  - required: conditional
- `functionBindingSet`
  - type: `string[]`
  - required: conditional
  - rule: required when the screen has governed event handlers, state transitions, formatting hooks, validation hooks, or reusable frontend action logic
- `eventBindingSet`
  - type: `string[]`
  - required: conditional
  - rule: required when the screen contains clickable, submit, row-action, modal, wizard, tab, upload, download, or workflow actions
- `dbBindingSet`
  - type: `string[]`
  - required: conditional
- `moduleBindingSet`
  - type: `string[]`
  - required: conditional
- `commonAssetPlanId`
  - type: `string`
  - required: conditional
  - rule: required when common-versus-project split was produced during proposal synthesis
- `projectAssetPlanId`
  - type: `string`
  - required: conditional
  - rule: required when project-local runtime outputs were split from common assets during proposal synthesis
- `selectedScreenId`
  - type: `string`
  - required: conditional
  - rule: required for directed repair or parity patch generation
- `selectedElementSet`
  - type: `string[]`
  - required: conditional
  - rule: required when the operator or AI selects components, popup families, action layouts, backend links, or DB links for targeted change
- `existingAssetReuseSet`
  - type: `string[]`
  - required: conditional
  - rule: list of existing governed assets intentionally reused during repair or generation
- `sqlGenerationProfileId`
  - type: `string`
  - required: conditional
  - rule: required when scaffold generation produces DDL, migration SQL, data patch SQL, or rollback SQL

### Project Source Mapping

- `folderMappingProfile`
  - type: `string`
  - required: yes
  - rule: must resolve to project-owned controlled paths

### Build And Publish

- `buildMode`
  - type: `string`
  - required: yes
  - recommended values:
    - `SCAFFOLD_ONLY`
    - `SCAFFOLD_AND_BUILD`
    - `SCAFFOLD_BUILD_AND_DEPLOY`
- `publishMode`
  - type: `string`
  - required: yes
  - recommended values:
    - `DRAFT_ONLY`
    - `REVIEW_READY`
    - `PUBLISH_READY`
- `codexAssistMode`
  - type: `string`
  - required: yes
  - recommended values:
    - `NONE`
    - `SCAFFOLD_ONLY`
    - `BINDING_ASSIST`
    - `REPAIR_ONLY`
    - `FULL_STRUCTURED_BUILD`
- `codexPromptPolicy`
  - type: `string`
  - required: yes
  - recommended values:
    - `JSON_ONLY`
    - `JSON_PLUS_SHORT_INTENT`
    - `MANUAL_OVERRIDE_REQUIRED`

## Validation Rules

Reject the request when:

- `generationUnit` is missing
- `projectId` is missing
- `scenarioFamilyId` or `scenarioId` is missing
- `actorPolicyId` is missing
- `themeId` or `technologyProfileId` is missing
- `colorTokenBundleId` or `fontBundleId` is missing
- `deviceProfileSet` is empty
- `responsiveProfileId` or `appRuntimeProfileId` is missing
- `componentCatalogSelection` is empty
- `folderMappingProfile` is missing
- `buildMode`, `publishMode`, `codexAssistMode`, or `codexPromptPolicy` is missing

Conditional blockers:

- missing `memberClassificationPolicyId` when classification-aware queries or exports exist
- missing `csrfPolicyId` when the scenario contains create, update, delete, approve, reject, upload, or import actions
- missing `eventBindingSet` when the screen contains governed UI actions
- missing `functionBindingSet` when event handlers require frontend or backend-connected function logic
- missing `apiBindingSet` when the scenario declares backend API use
- missing `dbBindingSet` when the scenario declares DB object coupling

## Binding Completeness Rule

Generation should not begin from visual layout alone.

Each governed screen must be able to resolve these binding families before publish-ready generation:

- `component -> event`
- `event -> function`
- `function -> API`
- `API -> DB or service contract`
- `component -> authority`
- `component -> help anchor`
- `component -> accessibility and security verification`

Use this rule:

- if a component can trigger business action, it must have an event binding
- if an event changes state or invokes logic, it must have a function binding
- if a function needs backend data or command execution, it must have an API binding
- if an API touches governed persistence, it must have DB or backend contract binding
- if any one of those links is unresolved, the request stays draft or repair-only

Recommended normalized manifests:

- `event-binding.json`
- `function-binding.json`
- `api-binding.json`
- `authority-gate.json`
- `help-anchor-map.json`
- `security-profile.json`
- `common-project-asset-split.json`
- `proposal-design-chain.json`
- `db-ddl-draft.sql`
- `db-migration-draft.sql`
- `db-data-patch-draft.sql`
- `db-rollback-draft.sql`

## Incremental Generation Rule

One valid `scaffold-request.json` may generate:

- one full screen family
- one theme set
- one page design
- one element design
- one component catalog item
- one binding set

The request should still preserve:

- project ownership
- scenario ownership when applicable
- theme and component governance
- compare and rollback lineage

## Common Component Coverage Rule

Before publish-ready generation, the request should be able to classify whether the screen uses:

- primitive-only composition
- approved common composite blocks
- approved popup or modal composites
- page-local exception components

Recommended additional selectors:

- `commonComponentSet`
  - approved reusable component or block ids
- `popupBindingSet`
  - popup or modal contract ids
- `gridBindingSet`
  - result-grid contract ids
- `searchFormBindingSet`
  - search-form contract ids

Use this rule:

- repeated search, grid, popup, and action structures should resolve from governed common-component assets first
- if a page introduces a page-local exception component, the reason should be recorded and later reviewable for promotion into the common catalog
- event, function, API, authority, help, accessibility, and security bindings must remain resolvable even when a popup or composite block is used

## Derived Outputs

One valid `scaffold-request.json` should be able to derive:

- page manifest
- route metadata
- frontend screen schema or source
- theme, color, and font bindings
- backend controller/service/VO/DTO/mapper/XML
- module binding manifest
- event, function, and API binding manifests
- help content and help anchors
- classification and CSRF manifests
- release-unit draft linkage

## Non-Goals

This catalog does not define:

- the final UI layout tree
- low-level bridge implementation for runtime adapters
- DB engine-specific DDL syntax

Those belong in adjacent contracts.
