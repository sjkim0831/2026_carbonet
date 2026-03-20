# Project Proposal Generation API Examples

Generated on 2026-03-21 for Resonance project onboarding and proposal-driven generation.

See:

- [project-proposal-generation-api-contracts.md](/opt/projects/carbonet/docs/architecture/project-proposal-generation-api-contracts.md)
- [proposal-to-mapping-ai-output-schema.md](/opt/projects/carbonet/docs/architecture/proposal-to-mapping-ai-output-schema.md)

## 1. `proposal-synthesis/upload-and-analyze` Response Example

```json
{
  "synthesisRunId": "SYN-20260321-01",
  "menuCandidateSet": ["JOIN", "JOIN_STATUS", "MEMBER_REVIEW"],
  "templateLineCandidateSet": ["public-line-01", "admin-line-02"],
  "scenarioFamilySet": ["join-public-company", "join-admin-review"],
  "screenFamilyRuleCandidateSet": [
    "JOIN_ENTRY",
    "JOIN_INFO",
    "JOIN_COMPLETE",
    "ADMIN_LIST_REVIEW",
    "ADMIN_LIST_REVIEW"
  ],
  "designOutputCandidateSet": [
    "requirement-summary-package",
    "public-shell-and-template-package",
    "admin-shell-and-template-package",
    "page-design-package",
    "page-assembly-package"
  ],
  "componentCandidateSet": [
    "search-form-standard",
    "grid-standard",
    "approval-action-bar"
  ],
  "apiCandidateSet": ["joinCompanySave", "joinApprove"],
  "dbCandidateSet": ["COMTN_MEMBER", "JOIN_REVIEW_QUEUE"]
}
```

## 2. `project-proposal-generation/inventory` Response Example

```json
{
  "homeMenuNodeCount": 8,
  "adminMenuNodeCount": 14,
  "templateLineCount": 2,
  "scenarioFamilyCount": 2,
  "screenFamilyRuleCount": 5,
  "scenarioStepCount": 9,
  "pageDesignCount": 6,
  "elementDesignCount": 14,
  "pageAssemblyCount": 6,
  "eventBindingCount": 18,
  "functionBindingCount": 12,
  "apiBindingCount": 9,
  "backendAssetCount": 22,
  "dbObjectCount": 4,
  "ddlDraftCount": 2,
  "designOutputPackageCount": 11,
  "missingAssetCount": 0,
  "buildReadyYn": true
}
```

## 3. `project-proposal-generation/matrix` Response Example

```json
{
  "matrixRowSet": [
    {
      "assetFamily": "TEMPLATE_LINE",
      "assetId": "public-line-01",
      "templateLineId": "public-line-01",
      "screenFamilyRuleId": null,
      "ownedYn": true,
      "designedYn": true,
      "boundYn": true,
      "templateBoundYn": true,
      "familyRuleBoundYn": false,
      "buildReadyYn": true,
      "deployReadyYn": true,
      "parityReadyYn": true,
      "runtimeComparableYn": true,
      "repairNeededYn": false,
      "blockerCount": 0
    },
    {
      "assetFamily": "SCREEN_FAMILY_RULE",
      "assetId": "JOIN_INFO",
      "templateLineId": "public-line-01",
      "screenFamilyRuleId": "JOIN_INFO",
      "ownedYn": true,
      "designedYn": true,
      "boundYn": true,
      "templateBoundYn": true,
      "familyRuleBoundYn": true,
      "buildReadyYn": true,
      "deployReadyYn": true,
      "parityReadyYn": false,
      "runtimeComparableYn": true,
      "repairNeededYn": true,
      "blockerCount": 1
    }
  ]
}
```

## 4. `project-proposal-generation/design-outputs` Response Example

```json
{
  "designOutputPackageSet": [
    {
      "packageFamily": "PUBLIC_SHELL_AND_TEMPLATE_PACKAGE",
      "packageId": "pkg-public-join-20260321-01",
      "templateLineSet": ["public-line-01"],
      "screenFamilyRuleSet": ["JOIN_ENTRY", "JOIN_INFO", "JOIN_COMPLETE"],
      "canonicalSourceSet": ["DS-001"],
      "scenarioFamilySet": ["join-public-company"],
      "approvalState": "APPROVED",
      "printableOutputPath": "/design-output/public-join.pdf"
    }
  ]
}
```
