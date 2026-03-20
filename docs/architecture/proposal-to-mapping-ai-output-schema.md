# Proposal-To-Mapping AI Output Schema

Generated on 2026-03-21 for Resonance proposal upload and AI-assisted mapping extraction.

## Goal

Define the structured AI output used immediately after a proposal or RFP upload.

The output should become the governed draft input for:

- requirement mapping
- menu candidate extraction
- scenario-family generation
- public-versus-admin split planning
- page and element design planning
- API and DB candidate planning
- common-versus-project asset split

## Core Rule

AI may create the first mapping draft in one pass, but Resonance must store it
as a governed draft, not as final truth.

Only approved canonical mapping becomes the control-plane source of truth.

Proposal extraction should always split:

- public or homepage-facing families
- admin or runtime-admin-facing families

Even when both use the same project and web-server set.

## `proposal-mapping-draft.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "synthesisRunId": "SYN-20260321-01",
  "sourceDocumentSet": [
    {
      "designSourceId": "DS-001",
      "documentFamily": "PROPOSAL_RFP",
      "sourceFormat": "HWP"
    }
  ],
  "requirementItemSet": [
    {
      "requirementId": "REQ-JOIN-001",
      "title": "회원가입",
      "domainCode": "02_회원인증",
      "priority": "HIGH",
      "surfaceType": "PUBLIC",
      "menuCandidateSet": ["JOIN", "JOIN_STATUS"],
      "templateLineCandidateSet": ["public-line-01"],
      "scenarioFamilyCandidateSet": ["join-public-company"],
      "screenFamilyRuleCandidateSet": ["JOIN_ENTRY", "JOIN_INFO", "JOIN_COMPLETE"],
      "pageFamilyCandidateSet": ["join-entry", "join-info", "join-complete"],
      "componentCandidateSet": [
        "search-form-standard",
        "grid-standard",
        "file-upload-block"
      ],
      "apiCandidateSet": ["joinCompanySave", "joinDraftLoad"],
      "dbCandidateSet": ["COMTN_MEMBER", "JOIN_COMPANY_DRAFT"],
      "commonAssetCandidateSet": ["COMMON_JOIN_SHELL"],
      "projectAssetCandidateSet": ["PROJECT_JOIN_POLICY"],
      "notes": "public user onboarding with status search"
    },
    {
      "requirementId": "REQ-JOIN-ADMIN-001",
      "title": "회원가입 검토",
      "domainCode": "02_회원인증",
      "priority": "HIGH",
      "surfaceType": "ADMIN",
      "menuCandidateSet": ["MEMBER_REVIEW", "MEMBER_APPROVAL"],
      "templateLineCandidateSet": ["admin-line-02"],
      "scenarioFamilyCandidateSet": ["join-admin-review"],
      "screenFamilyRuleCandidateSet": ["ADMIN_LIST_REVIEW"],
      "pageFamilyCandidateSet": ["review-list", "review-detail"],
      "componentCandidateSet": ["search-form-standard", "grid-standard", "approval-action-bar"],
      "apiCandidateSet": ["joinReviewList", "joinApprove", "joinReject"],
      "dbCandidateSet": ["JOIN_APPROVAL_AUDIT", "JOIN_REVIEW_QUEUE"],
      "commonAssetCandidateSet": ["COMMON_ADMIN_REVIEW_FRAME"],
      "projectAssetCandidateSet": [],
      "notes": "paired admin review flow for public onboarding"
    }
  ],
  "menuTreeCandidate": {
    "homeMenuNodeSet": [],
    "adminMenuNodeSet": []
  },
  "surfacePlan": {
    "publicSurfaceSet": [],
    "adminSurfaceSet": []
  },
  "templateReusePlan": {
    "publicTemplateFamilySet": [],
    "adminTemplateFamilySet": [],
    "copyableAdminTemplateYn": true
  },
  "templateLineCandidateSet": [],
  "screenFamilyRuleCandidateSet": [],
  "scenarioFamilyCandidateSet": [],
  "designOutputCandidateSet": [],
  "commonAssetPlanId": "CAP-001",
  "projectAssetPlanId": "PAP-001",
  "mappingConfidenceScore": 0.89
}
```

## Required Fields

- `projectId`
- `synthesisRunId`
- `sourceDocumentSet`
- `requirementItemSet`
- `menuTreeCandidate`
- `surfacePlan`
- `templateReusePlan`
- `templateLineCandidateSet`
- `screenFamilyRuleCandidateSet`
- `scenarioFamilyCandidateSet`
- `designOutputCandidateSet`
- `commonAssetPlanId`
- `projectAssetPlanId`
- `mappingConfidenceScore`

## Rules

- every requirement item should map to one or more scenario-family candidates
- every scenario-family candidate should map to menu or page families
- every requirement item should declare whether it belongs to `PUBLIC` or `ADMIN`
- public and admin families may share a project and runtime host set, but should remain separately classified in design and template planning
- admin template families should be marked reusable and copyable across projects where possible
- every requirement family should propose one or more template-line candidates
- every page-family candidate should propose one or more screen-family-rule candidates
- common-versus-project candidate split must be explicit
- the draft must remain reviewable and repairable before canonical approval
