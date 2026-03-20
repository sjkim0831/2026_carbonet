# Module Selection Trace Linkage Contract

Generated on 2026-03-21 for Resonance module-selection trace continuity.

## Goal

Define how module selection flows connect to generation trace, release trace, and
repair workbench sessions without losing lineage.

## Core Rule

After module selection is applied, operators should be able to move directly to:

- generation trace explorer
- runtime package matrix
- repair workbench
- deploy or scaffold preparation

No module-selection result may exist without a trace link to:

- `projectId`
- `scenarioId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `moduleBindingPreviewId`
- `moduleBindingResultId`
- `generationRunId`
- `releaseUnitId`

## Required Trace Link Set

Each module-selection apply result should carry:

- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `generationRunId`
- `jsonRevisionSet`
- `publishedAssetTraceSet`
- `releaseUnitId`
- `runtimePackageId`
- `repairSessionCandidateId`
- `compareContextId`

## Required Navigation Targets

The UI should provide direct navigation to:

- generation trace explorer
- generated asset trace explorer
- release-unit asset matrix
- repair workbench
- current runtime compare

## Rules

- if applied modules produce blocker deltas, the repair workbench link must be
  promoted above scaffold or deploy actions
- if attached assets change backend or DB structure, the trace view must expose
  backend-chain links
- if the result is scaffold-ready, the trace view must still remain preserved as
  a mandatory audit artifact
