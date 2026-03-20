# Approval And Seal Governance Contract

Generated on 2026-03-21 for Resonance approval-flow and seal-image governance.

## Goal

Define how Resonance should govern:

- approval and reject actions
- approval chain metadata
- seal or stamp image storage
- rendered approval evidence
- audit and rollback for approval records

This contract is intended for business approval flows, operator approvals, and productized runtime systems.

## Core Rule

Approval behavior and seal-image usage must be treated as governed common capabilities, not page-local ad hoc logic.

Use this rule:

- approval logic belongs to centrally versioned common code and common contracts
- runtime systems consume approval behavior through stable facades and approved UI blocks
- seal or stamp images are governed file assets with access policy, audit policy, and version trace

## Approval Capability Families

Recommended governed objects:

- `approval-policy.json`
- `approval-step-family.json`
- `approval-action-bar-profile.json`
- `seal-image-profile.json`
- `approval-render-policy.json`
- `approval-evidence-policy.json`

## `approval-policy.json`

Recommended shape:

```json
{
  "approvalPolicyId": "member-change-standard",
  "approvalMode": "SEQUENTIAL",
  "requiredStepFamilyId": "member-admin-approval-v1",
  "approvalActionBarProfileId": "approve-reject-comment-v1",
  "sealImageRequiredYn": true,
  "evidencePolicyId": "approval-evidence-default",
  "status": "ACTIVE"
}
```

## `seal-image-profile.json`

Recommended shape:

```json
{
  "sealImageProfileId": "company-admin-seal-default",
  "ownerScope": "PROJECT_RUNTIME",
  "fileStoragePolicyId": "seal-image-private",
  "fileAccessPolicyId": "seal-image-owner-only",
  "maskingRequiredYn": false,
  "watermarkPolicyId": "approval-render-watermark-default",
  "versionedYn": true,
  "status": "ACTIVE"
}
```

## DB And File Rules

Approval metadata should live in governed DB tables.

Seal binary files should live in governed private file storage, while DB metadata stores:

- `approvalRecordId`
- `approvalPolicyId`
- `approvalStepId`
- `approvalState`
- `approverId`
- `approvedAt`
- `sealFileAssetId`
- `sealFileHash`
- `approvalEvidenceId`

## Security Rules

Seal-image and approval flows must bind:

- actor policy
- file-access policy
- audit and deny policy
- output/render policy
- retention and deletion policy

Do not allow:

- public uncontrolled stamp image access
- approval actions without authoritative backend audit
- runtime page-local approval logic bypassing common approval facade
- replacing stamp images without version trace

## UI And Component Rules

Approval screens should use approved common blocks:

- approval status summary
- approval step timeline
- approval action bar
- approval comment block
- approval evidence preview

Seal-image upload or replacement should use:

- governed upload component family
- governed file preview component family
- governed access warning and audit note

## Required Operator Screens

- approval policy registry
- approval step-family registry
- seal-image profile registry
- seal image upload and replacement history
- approval evidence explorer
- approval action audit explorer
