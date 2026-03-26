# Repair And Verification API Contracts

Generated on 2026-03-21 for Resonance parity, repair, and runtime verification workflows.

## Goal

Define the minimum request and response contracts for:

- `repair/open`
- `repair/apply`
- `verification/menu-to-rendered-screen`

These APIs exist so that parity closure and selected-screen repair are governed, repeatable, and traceable.

## 1. repair/open

Purpose:

- open a governed repair session for one selected screen, element family, backend chain, or DB-linked feature family

### Request

- `projectId`
- `releaseUnitId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
- `builderInput`
  - `builderId`
  - `draftVersionId`
  - `menuCode`
  - `pageId`
  - `menuUrl`
- `runtimeEvidence`
  - `publishedVersionId`
  - `currentRuntimeTraceId`
  - `currentNodeCount`
  - `currentEventCount`
- `selectedElementSet`
- `compareBaseline`
  - recommended values:
    - `CURRENT_RUNTIME`
    - `PROPOSAL_BASELINE`
    - `PATCH_TARGET`
    - `GENERATED_TARGET`
- `reasonCode`
  - recommended values:
    - `PARITY_GAP`
    - `UNIFORMITY_GAP`
    - `MISSING_PAGE_FAMILY`
    - `MISSING_COMPONENT_FAMILY`
    - `MISSING_BINDING`
    - `RUNTIME_DRIFT`
- `existingAssetReuseSet`
- `requestedBy`
- `requestedByType`
  - `HUMAN`
  - `AI`
- `requestNote`

### Response

- `repairSessionId`
- `projectId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
- `builderInput`
- `runtimeEvidence`
- `selectedElementSet`
- `compareSnapshotId`
- `blockingGapSet`
- `reuseRecommendationSet`
- `requiredContractSet`
- `status`
  - `OPEN`
  - `REPAIR_REQUIRED`
  - `REVIEW_REQUIRED`

`repair/open` must remain directly consumable by `09`.
The response may not rename or drop:

- `releaseUnitId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
- `builderInput`
- `runtimeEvidence`

## 2. repair/apply

Purpose:

- apply one governed repair result back into generated assets and patch-release preparation

### Request

- `repairSessionId`
- `projectId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
- `builderInput`
- `runtimeEvidence`
- `updatedAssetSet`
- `updatedBindingSet`
- `updatedThemeOrLayoutSet`
- `sqlDraftSet`
- `publishMode`
  - `DRAFT_ONLY`
  - `REVIEW_READY`
  - `PUBLISH_READY`
- `requestedBy`
- `requestedByType`
- `changeSummary`

### Response

- `repairApplyRunId`
- `guidedStateId`
- `templateLineId`
- `ownerLane`
- `builderInput`
- `runtimeEvidence`
- `updatedAssetTraceSet`
- `updatedReleaseCandidateId`
- `parityRecheckRequiredYn`
- `uniformityRecheckRequiredYn`
- `smokeRequiredYn`
- `status`
  - `APPLIED`
  - `APPLIED_WITH_BLOCKERS`
  - `REJECTED`

When `06` is ready to hand off, `repair/apply` responses should already make it
obvious whether `09` must reopen compare or can continue to smoke closure.

## 3. verification/menu-to-rendered-screen

Purpose:

- verify that one governed menu node resolves to the correct rendered screen family and complete execution chain

### Request

- `projectId`
- `menuId`
- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- `targetRuntime`
  - `MAIN_SERVER_CURRENT`
  - `GENERATED_TARGET`
  - `PATCH_TARGET`
- `releaseUnitId`
- `builderInput`
- `verifyShellYn`
- `verifyComponentYn`
- `verifyBindingYn`
- `verifyBackendYn`
- `verifyHelpSecurityYn`

### Response

- `verificationRunId`
- `menuId`
- `pageId`
- `routeId`
- `templateLineId`
- `screenFamilyRuleId`
- `shellProfileId`
- `pageFrameId`
- `builderInput`
- `runtimeEvidence`
- `componentCoverageState`
- `bindingCoverageState`
- `backendChainState`
- `helpSecurityState`
- `blockerSet`
- `ownerLane`
- `result`
  - `PASS`
  - `WARN`
  - `FAIL`

`verification/menu-to-rendered-screen` must preserve the same governed
identity keys used by compare and repair. `09` should not need a translation
layer to connect verification output back to repair or release-unit evidence.

## 4. Audit Requirements

Every repair and verification run should record:

- `traceId`
- `projectId`
- `releaseUnitId`
- `guidedStateId`
- `screenFamilyRuleId`
- `ownerLane`
- `requestedBy`
- `requestedByType`
- `selectedScreenId`
- `selectedElementSet`
- `compareBaseline`
- `result`
- `occurredAt`

## 6. 06 Handoff Rule

`06` may move to handoff when:

- request and response identity fields are stable across compare, repair, and verification
- MyBatis mapper bindings use the same payload names as the documented contracts
- release-unit trace linkage is visible without ad hoc name conversion
- service tests cover the currently documented field names
- `07` and `09` can consume the output without reopening `01`

## 5. Use

These contracts should be used by:

- parity compare views
- selected-screen repair workbench
- runtime package matrix
- chain and matrix explorer
- release and rollback readiness checks
