# Module Selection Apply Result Contract

Generated on 2026-03-21 for Resonance module selection completion flow.

## Goal

Define the governed result view shown after selected installable modules are
applied to a project, scenario, page assembly, and runtime package context.

## Purpose

The apply-result view is the bridge between:

- module selection popup
- module selection checklist
- module binding preview
- runtime package matrix
- repair workbench
- generation trace explorer

It should answer one question clearly:

`What changed after the selected modules were applied?`

## Required Output Families

The result screen should show:

- selected module set
- attached page asset set
- attached component and block set
- attached backend asset set
- attached DB asset set
- runtime package delta
- release blocker delta
- repair-needed status
- follow-up checklist status

## Required Fields

- `moduleBindingResultId`
- `projectId`
- `scenarioId`
- `pageAssemblyId`
- `moduleBindingPreviewId`
- `selectionAppliedYn`
- `appliedModuleSet`
- `attachedPageAssetSet`
- `attachedComponentAssetSet`
- `attachedBackendAssetSet`
- `attachedDbAssetSet`
- `runtimePackageImpactSummary`
- `releaseBlockerDelta`
- `repairNeededYn`
- `repairQueueCount`
- `nextRecommendedAction`
- `traceLinkSet`

## UI Expectations

The apply-result page should provide:

- a summary card
- an asset delta table
- a runtime package impact card
- blocker and repair summary
- direct links to:
  - module selection checklist
  - module binding preview
  - runtime package matrix
  - repair workbench
  - generation trace explorer

## Rules

- apply-result must never hide attached backend or DB impact
- apply-result must be available immediately after module apply
- apply-result must be retained in generation trace history
- apply-result must be comparable against the previous module binding result

## 10 Handoff Rule

`10` may move to handoff when the apply-result view can be consumed by `08` and
`09` without renaming module or runtime-package linkage fields.

Minimum visible carry-over:

- `moduleBindingResultId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `runtimePackageImpactSummary`
- `repairNeededYn`
- `repairQueueCount`
- `traceLinkSet`

The result view should make it obvious which links go to:

- runtime package matrix
- repair workbench
- generation trace explorer
