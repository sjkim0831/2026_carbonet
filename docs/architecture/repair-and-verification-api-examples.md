# Repair And Verification API Examples

Generated on 2026-03-21 for Resonance selected-screen repair and parity verification flows.

See:

- `docs/architecture/repair-and-verification-api-contracts.md`
- `docs/architecture/parity-and-smoke-checklists.md`

## 1. repair/open Request Example

```json
{
  "projectId": "carbonet-main",
  "releaseUnitId": "ru-20260321-join-patch-01",
  "guidedStateId": "guided-build-15-repair",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "ownerLane": "res-verify",
  "selectedScreenId": "join-member-info-page",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-004",
    "menuCode": "MENU_JOIN_MEMBER_INFO",
    "pageId": "join-member-info-page",
    "menuUrl": "/member/join/info"
  },
  "runtimeEvidence": {
    "publishedVersionId": "publish-join-20260321-002",
    "currentRuntimeTraceId": "runtime-join-20260321-009",
    "currentNodeCount": 18,
    "currentEventCount": 4
  },
  "selectedElementSet": [
    "join-info-search-form",
    "join-info-bottom-action-bar"
  ],
  "compareBaseline": "CURRENT_RUNTIME",
  "reasonCode": "PARITY_GAP",
  "existingAssetReuseSet": [
    "common-search-form-v3",
    "common-bottom-action-bar-v2"
  ],
  "requestedBy": "system-master",
  "requestedByType": "HUMAN",
  "requestNote": "Join page spacing and action hierarchy should match current runtime."
}
```

## 2. repair/open Response Example

```json
{
  "repairSessionId": "repair-join-20260321-001",
  "projectId": "carbonet-main",
  "guidedStateId": "guided-build-15-repair",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "ownerLane": "res-verify",
  "selectedScreenId": "join-member-info-page",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-004"
  },
  "runtimeEvidence": {
    "publishedVersionId": "publish-join-20260321-002",
    "currentRuntimeTraceId": "runtime-join-20260321-009"
  },
  "selectedElementSet": [
    "join-info-search-form",
    "join-info-bottom-action-bar"
  ],
  "compareSnapshotId": "cmp-join-20260321-001",
  "blockingGapSet": [
    "ACTION_LAYOUT_DRIFT",
    "MISSING_HELP_ANCHOR"
  ],
  "reuseRecommendationSet": [
    "common-bottom-action-bar-v2",
    "help-anchor-bundle-join-v2"
  ],
  "requiredContractSet": [
    "page-design.json",
    "page-assembly.json",
    "action-layout-profile",
    "help-anchor-manifest"
  ],
  "status": "REPAIR_REQUIRED"
}
```

## 3. repair/apply Request Example

```json
{
  "repairSessionId": "repair-join-20260321-001",
  "projectId": "carbonet-main",
  "guidedStateId": "guided-build-15-repair",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "ownerLane": "res-verify",
  "selectedScreenId": "join-member-info-page",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-004"
  },
  "runtimeEvidence": {
    "publishedVersionId": "publish-join-20260321-002"
  },
  "updatedAssetSet": [
    "page-design:join-member-info-page:v4",
    "page-assembly:join-member-info-page:v4"
  ],
  "updatedBindingSet": [
    "event-binding:join-submit:v2",
    "function-binding:join-submit-handler:v2",
    "api-binding:join-submit-api:v2"
  ],
  "updatedThemeOrLayoutSet": [
    "action-layout:detail-footer-standard:v2",
    "help-anchor-bundle:join-v2"
  ],
  "sqlDraftSet": [],
  "publishMode": "REVIEW_READY",
  "requestedBy": "codex-agent-03",
  "requestedByType": "AI",
  "changeSummary": "Aligned bottom action layout and form spacing with approved family."
}
```

## 4. repair/apply Response Example

```json
{
  "repairApplyRunId": "repair-apply-20260321-014",
  "guidedStateId": "guided-build-15-repair",
  "templateLineId": "public-line-01",
  "ownerLane": "res-verify",
  "updatedAssetTraceSet": [
    "trace-page-join-v4",
    "trace-assembly-join-v4"
  ],
  "updatedReleaseCandidateId": "ru-20260321-join-patch-02",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-005"
  },
  "runtimeEvidence": {
    "publishedVersionId": "publish-join-20260321-002"
  },
  "parityRecheckRequiredYn": true,
  "uniformityRecheckRequiredYn": true,
  "smokeRequiredYn": true,
  "status": "APPLIED"
}
```

## 5. menu-to-rendered-screen Verification Request Example

```json
{
  "projectId": "carbonet-main",
  "menuId": "MENU_JOIN_MEMBER_INFO",
  "guidedStateId": "guided-build-14-runtime-compare",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "ownerLane": "res-verify",
  "targetRuntime": "MAIN_SERVER_CURRENT",
  "releaseUnitId": "ru-20260321-join-patch-02",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-005"
  },
  "verifyShellYn": true,
  "verifyComponentYn": true,
  "verifyBindingYn": true,
  "verifyBackendYn": true,
  "verifyHelpSecurityYn": true
}
```

## 6. menu-to-rendered-screen Verification Response Example

```json
{
  "verificationRunId": "verify-join-20260321-011",
  "menuId": "MENU_JOIN_MEMBER_INFO",
  "pageId": "join-member-info-page",
  "routeId": "/member/join/info",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "shellProfileId": "public-join-compact",
  "pageFrameId": "wizard-join-frame",
  "builderInput": {
    "builderId": "sb-join-member-info",
    "draftVersionId": "draft-join-20260321-005"
  },
  "runtimeEvidence": {
    "publishedVersionId": "publish-join-20260321-002",
    "currentRuntimeTraceId": "runtime-join-20260321-011"
  },
  "componentCoverageState": "PASS",
  "bindingCoverageState": "PASS",
  "backendChainState": "PASS",
  "helpSecurityState": "PASS",
  "blockerSet": [],
  "result": "PASS"
}
```

## 7. parity/compare Response Example

```json
{
  "compareContextId": "compare-join-20260321-014",
  "projectId": "carbonet-main",
  "guidedStateId": "guided-build-14-runtime-compare",
  "templateLineId": "public-line-01",
  "screenFamilyRuleId": "PUBLIC_JOIN_STEP",
  "ownerLane": "res-verify",
  "selectedScreenId": "join-member-info-page",
  "releaseUnitId": "ru-20260321-join-patch-02",
  "compareBaseline": "CURRENT_RUNTIME",
  "compareTargetSet": [
    {
      "target": "Action Layout",
      "currentRuntime": "detail-footer-left/right",
      "generatedTarget": "detail-footer-standard",
      "proposalBaseline": "detail-footer-standard",
      "patchTarget": "detail-footer-standard",
      "result": "MISMATCH"
    },
    {
      "target": "Help Anchors",
      "currentRuntime": "12",
      "generatedTarget": "10",
      "proposalBaseline": "12",
      "patchTarget": "12",
      "result": "GAP"
    }
  ],
  "blockerSet": [
    "ACTION_LAYOUT_DRIFT",
    "MISSING_HELP_ANCHOR"
  ],
  "repairCandidateSet": [
    "join-info-bottom-action-bar",
    "join-help-anchor-bundle"
  ],
  "result": "REPAIR_REQUIRED",
  "traceId": "trace-compare-20260321-014"
}
```

## 8. Result Usage Rule

Use these examples as the baseline shape for:

- selected-screen repair workbench
- missing-asset queue actions
- parity compare workflow
- post-deploy verification workflow

Keep one `ownerLane` value per open verification scope. Do not encode multi-lane ownership in one field; handoff happens in status notes, not by widening the payload key.

UI mapping rule:

- compare tables must show `currentRuntime`, `generatedTarget`, `proposalBaseline`, and `patchTarget` together
- blocker rows must keep `ownerLane`
- repair queue rows must keep `guidedStateId`, `templateLineId`, and `screenFamilyRuleId`
- verify views must surface builder draft and published runtime evidence together before closing parity or smoke
- repair views should surface one handoff-readiness panel containing blocker count, parity recheck, uniformity recheck, smoke pending state, and latest trace id before `09 -> 01` handoff
