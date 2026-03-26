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
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
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
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `installableModuleId`

Required response fields:

- `installableModuleId`
- `modulePatternFamilyId`
- `moduleDepthProfileId`
- `templateLineId`
- `screenFamilyRuleId`
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
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `selectedModuleSet`
- `selectionMode`
  - `INLINE_CHECK`
  - `POPUP_REVIEW`
- `operator`

Required response fields:

- `moduleBindingPreviewId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `selectedModuleSet`
- `runtimePackageImpactSummary`
- `blockingIssueCount`
- `readyForScaffoldYn`

## Rules

- no selected module may be persisted without project context
- modules flagged `requiresPopupReviewYn` must pass preview acknowledgment before apply
- required modules may not be omitted
- selected modules must be visible in runtime package impact preview immediately
- selected modules must remain traceable to the target template line and screen family rule

## 4. `module-selection/apply-result`

Return the persisted result after module binding is committed into the current
screen, scenario, and project-unit context.

Required request fields:

- `projectId`
- `scenarioId`
- `guidedStateId`
- `moduleBindingPreviewId`

Required response fields:

- `moduleBindingResultId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `selectionAppliedYn`
- `appliedModuleSet`
- `attachedPageAssetSet`
- `attachedBackendAssetSet`
- `attachedDbAssetSet`
- `runtimePackageImpactSummary`
- `followUpChecklistSummary`
- `repairNeededYn`
- `repairQueueCount`
- `nextRecommendedAction`

`module-selection/apply-result` must remain consumable by:

- `08` for runtime-package evidence
- `09` for repair-needed and release follow-up visibility

The response may not rename:

- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `runtimePackageImpactSummary`
- `repairNeededYn`
- `repairQueueCount`

## Additional Rules

- apply result must show exactly which page, backend, DB, and runtime-package
  assets were affected
- apply result must be traceable to one `moduleBindingPreviewId`
- if `repairNeededYn` is true, the operator may not continue directly to build
- apply result must remain visible from the current screen, runtime package
  matrix, and repair workbench

## 5. 06 Handoff Consumption

Before `06` is treated as handoff-ready, confirm the module-selection family,
repair family, and verification family all keep the same governed naming for:

- `releaseUnitId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
