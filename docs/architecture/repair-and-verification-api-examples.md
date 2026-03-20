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
  "selectedScreenId": "join-member-info-page",
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
  "selectedScreenId": "join-member-info-page",
  "selectedElementSet": [
    "join-info-search-form",
    "join-info-bottom-action-bar"
  ],
  "compareSnapshotId": "cmp-join-20260321-001",
  "blockingGapSet": [
    "BUTTON_ZONE_DRIFT",
    "SPACING_PROFILE_MISMATCH"
  ],
  "reuseRecommendationSet": [
    "common-search-form-v3",
    "common-bottom-action-bar-v2"
  ],
  "requiredContractSet": [
    "page-design.json",
    "page-assembly.json",
    "action-layout-profile"
  ],
  "status": "REPAIR_REQUIRED"
}
```

## 3. repair/apply Request Example

```json
{
  "repairSessionId": "repair-join-20260321-001",
  "projectId": "carbonet-main",
  "selectedScreenId": "join-member-info-page",
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
    "spacing-profile:admin-form-comfortable:v3"
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
  "updatedAssetTraceSet": [
    "trace-page-join-v4",
    "trace-assembly-join-v4"
  ],
  "updatedReleaseCandidateId": "ru-20260321-join-patch-02",
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
  "targetRuntime": "MAIN_SERVER_CURRENT",
  "releaseUnitId": "ru-20260321-join-patch-02",
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
  "shellProfileId": "public-join-compact",
  "pageFrameId": "wizard-join-frame",
  "componentCoverageState": "PASS",
  "bindingCoverageState": "PASS",
  "backendChainState": "PASS",
  "helpSecurityState": "PASS",
  "blockerSet": [],
  "result": "PASS"
}
```

## 7. Result Usage Rule

Use these examples as the baseline shape for:

- selected-screen repair workbench
- missing-asset queue actions
- parity compare workflow
- post-deploy verification workflow
