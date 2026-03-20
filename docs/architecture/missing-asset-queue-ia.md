# Missing Asset Queue Information Architecture

Generated on 2026-03-21 for Resonance missing-page, missing-component, and requirement-gap closure.

## Goal

Define the operator-facing IA for the queues that expose missing governed assets before release.

## Queue Families

Resonance should expose at least:

- `missing-page-family queue`
- `missing-component-family queue`
- `missing-binding-family queue`
- `requirement-gap queue`
- `runtime-only exception queue`

## 1. Missing Page-Family Queue

Each row should show:

- `projectId`
- `requirementDomain`
- `scenarioFamilyId`
- `expectedPageFamily`
- `currentState`
  - `MISSING`
  - `PLANNED_ONLY`
  - `DRAFT_ONLY`
  - `BLOCKED`
- `recommendedSource`
  - `GENERATE`
  - `PROMOTE_FROM_RUNTIME`
  - `REUSE_EXISTING`
- `blockingReason`
- `repairOpenAvailableYn`

## 2. Missing Component-Family Queue

Each row should show:

- `projectId`
- `scenarioFamilyId`
- `pageId`
- `expectedComponentFamily`
- `expectedBlockType`
- `themeSetId`
- `currentState`
- `recommendedCatalogAction`
  - `CREATE_COMPONENT`
  - `PROMOTE_EXISTING`
  - `ATTACH_TO_THEME_SET`
- `repairOpenAvailableYn`

## 3. Missing Binding-Family Queue

Each row should show:

- `projectId`
- `pageId`
- `componentId`
- `missingBindingType`
  - `EVENT`
  - `FUNCTION`
  - `API`
  - `BACKEND`
  - `DB`
  - `HELP`
  - `SECURITY`
  - `AUTHORITY`
- `blockingReason`
- `repairOpenAvailableYn`

## 4. Requirement-Gap Queue

Each row should show:

- `projectId`
- `requirementDomain`
- `screenRequirementId`
- `missingAssetClass`
- `linkedScenarioFamilyId`
- `linkedMenuId`
- `waiverYn`
- `repairOpenAvailableYn`

## 5. Required Actions

Operators should be able to:

- open repair session
- open page or element design
- open component catalog entry
- open theme-set studio
- open current-runtime promotion
- waive with audit note

## 6. Release Rule

Any row in blocking state should prevent:

- publish-ready generation
- parity-ready release
- deploy-complete status
