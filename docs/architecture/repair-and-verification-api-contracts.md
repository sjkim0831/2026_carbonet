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
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
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
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
- `selectedElementSet`
- `compareSnapshotId`
- `blockingGapSet`
- `reuseRecommendationSet`
- `requiredContractSet`
- `status`
  - `OPEN`
  - `REPAIR_REQUIRED`
  - `REVIEW_REQUIRED`

## 2. repair/apply

Purpose:

- apply one governed repair result back into generated assets and patch-release preparation

### Request

- `repairSessionId`
- `projectId`
- `guidedStateId`
- `screenFamilyRuleId`
- `ownerLane`
- `selectedScreenId`
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
- `ownerLane`
- `updatedAssetTraceSet`
- `updatedReleaseCandidateId`
- `parityRecheckRequiredYn`
- `uniformityRecheckRequiredYn`
- `smokeRequiredYn`
- `status`
  - `APPLIED`
  - `APPLIED_WITH_BLOCKERS`
  - `REJECTED`

## 3. verification/menu-to-rendered-screen

Purpose:

- verify that one governed menu node resolves to the correct rendered screen family and complete execution chain

### Request

- `projectId`
- `menuId`
- `guidedStateId`
- `ownerLane`
- `targetRuntime`
  - `MAIN_SERVER_CURRENT`
  - `GENERATED_TARGET`
  - `PATCH_TARGET`
- `releaseUnitId`
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
- `screenFamilyRuleId`
- `shellProfileId`
- `pageFrameId`
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

## 5. Use

These contracts should be used by:

- parity compare views
- selected-screen repair workbench
- runtime package matrix
- chain and matrix explorer
- release and rollback readiness checks
