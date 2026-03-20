# Module Selection API Examples

Generated on 2026-03-21 for Resonance module selection UI flow.

## `module-selection/candidates`

```json
{
  "projectId": "member-core",
  "scenarioFamilyId": "join-family",
  "scenarioId": "join-member-info",
  "pageDesignId": "page-join-member-info-v4",
  "themeSetId": "theme-public-join-trust-v1"
}
```

```json
{
  "candidateModuleSet": [
    {
      "installableModuleId": "popup-member-selector",
      "moduleName": "회원 선택 팝업",
      "moduleFamily": "POPUP_SELECTOR",
      "selectionClass": "REQUIRED",
      "installReadyYn": true,
      "dependencyResolvedYn": true,
      "styleReadyYn": true,
      "dbImpactReviewedYn": true,
      "rollbackReadyYn": true,
      "requiresPopupReviewYn": false,
      "impactSummary": "popup, search form, result grid"
    },
    {
      "installableModuleId": "board-faq",
      "moduleName": "FAQ 게시판",
      "moduleFamily": "BOARD",
      "selectionClass": "RECOMMENDED",
      "installReadyYn": false,
      "dependencyResolvedYn": true,
      "styleReadyYn": false,
      "dbImpactReviewedYn": true,
      "rollbackReadyYn": false,
      "requiresPopupReviewYn": true,
      "impactSummary": "board page family + backend/DB/CSS"
    }
  ]
}
```

## `module-selection/preview`

```json
{
  "projectId": "member-core",
  "scenarioId": "join-member-info",
  "installableModuleId": "board-faq"
}
```

```json
{
  "installableModuleId": "board-faq",
  "modulePatternFamilyId": "BOARD_STANDARD",
  "moduleDepthProfileId": "BOARD_DEPTH_V1",
  "dependencySet": [
    "board-toolbar-common",
    "popup-member-selector"
  ],
  "frontendImpactSummary": "Adds board list/detail/edit page family.",
  "backendImpactSummary": "Adds FAQ board controller/service/mapper chain.",
  "dbImpactSummary": "Adds FAQ table and rollback SQL requirement.",
  "cssImpactSummary": "One duplicate toolbar class must be deduped.",
  "runtimePackageAttachPreview": "FEATURE_MODULE + CSS_BUNDLE + BACKEND_CHAIN + DB_SQL_DRAFT",
  "rollbackPlanSummary": "Detach module, rollback SQL, restore previous release unit.",
  "blockingIssueSet": [
    "css dedupe pending",
    "rollback sql missing"
  ]
}
```

## `module-selection/apply`

```json
{
  "projectId": "member-core",
  "scenarioId": "join-member-info",
  "selectedModuleSet": [
    "popup-member-selector",
    "excel-export-extended"
  ],
  "selectionMode": "INLINE_CHECK",
  "operator": "sjkim"
}
```

```json
{
  "moduleBindingPreviewId": "mbp-join-member-info-20260321-01",
  "selectedModuleSet": [
    "popup-member-selector",
    "excel-export-extended"
  ],
  "runtimePackageImpactSummary": "Adds 2 feature assets and 1 frontend helper binding.",
  "blockingIssueCount": 0,
  "readyForScaffoldYn": true
}
```
