# Module Selection API Contracts

Generated on 2026-03-21 for Resonance screen-authoring module selection flow.

## Goal

Define the governed APIs used when an operator or AI-assisted flow selects installable modules during:

- scenario wizard
- screen builder
- page assembly
- project-unit build preparation

## 1. `module-selection/candidates`

Return module candidates for the current project and scenario context.

Required request fields:

- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageDesignId`
- `themeSetId`

Required response fields:

- `candidateModuleSet`
  - `installableModuleId`
  - `moduleName`
  - `moduleFamily`
  - `selectionClass`
  - `installReadyYn`
  - `dependencyResolvedYn`
  - `styleReadyYn`
  - `dbImpactReviewedYn`
  - `rollbackReadyYn`
  - `requiresPopupReviewYn`
  - `impactSummary`

## 2. `module-selection/preview`

Return the governed install popup payload for one candidate module.

Required request fields:

- `projectId`
- `scenarioId`
- `installableModuleId`

Required response fields:

- `installableModuleId`
- `modulePatternFamilyId`
- `moduleDepthProfileId`
- `dependencySet`
- `frontendImpactSummary`
- `backendImpactSummary`
- `dbImpactSummary`
- `cssImpactSummary`
- `runtimePackageAttachPreview`
- `rollbackPlanSummary`
- `blockingIssueSet`

## 3. `module-selection/apply`

Persist selected modules into the current scaffold/build context.

Required request fields:

- `projectId`
- `scenarioId`
- `selectedModuleSet`
- `selectionMode`
  - `INLINE_CHECK`
  - `POPUP_REVIEW`
- `operator`

Required response fields:

- `moduleBindingPreviewId`
- `selectedModuleSet`
- `runtimePackageImpactSummary`
- `blockingIssueCount`
- `readyForScaffoldYn`

## Rules

- no selected module may be persisted without project context
- modules flagged `requiresPopupReviewYn` must pass preview acknowledgment before apply
- required modules may not be omitted
- selected modules must be visible in runtime package impact preview immediately
