# Module Intake API Contracts

Generated on 2026-03-21 for Resonance AI-assisted module intake governance.

## Goal

Define the governed request and review APIs used when a new module folder or external module candidate is proposed.

## 1. `module-intake/request`

Create a new intake request.

Required request fields:

- `projectId`
- `intakeSourceType`
  - `LOCAL_FOLDER`
  - `REPOSITORY`
  - `ARCHIVE`
- `intakeSourceRef`
- `requestedModuleFamily`
- `requestedRuntimeScope`
  - `COMMON`
  - `PROJECT`
- `requestReason`
- `requestedBy`

Required response fields:

- `moduleIntakeRequestId`
- `status`
  - `REQUESTED`
  - `ANALYSIS_PENDING`
- `nextAction`

## 2. `module-intake/analyze`

Attach AI analysis result to an intake request.

Required request fields:

- `moduleIntakeRequestId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `ownershipVerdict`
- `modulePatternFamilyId`
- `moduleDepthProfileId`
- `frontendImpactSummary`
- `backendImpactSummary`
- `dbImpactSummary`
- `cssImpactSummary`
- `rollbackPlanSummary`
- `blockingIssueSet`

Required response fields:

- `analysisRunId`
- `status`
  - `ANALYZED`
  - `REVIEW_REQUIRED`
- `blockingIssueCount`

## 3. `module-intake/approve-attach-plan`

Approve a normalized module candidate for governed build.

Required request fields:

- `moduleIntakeRequestId`
- `approvedPatternFamilyId`
- `approvedDepthProfileId`
- `approvedRuntimePackageAttachmentProfileId`
- `approvedBy`
- `reviewNote`

Required response fields:

- `attachPlanId`
- `status`
  - `ATTACH_APPROVED`
  - `BUILD_READY`
- `nextAction`

## 4. `module-intake/reject`

Reject a candidate and preserve trace.

Required request fields:

- `moduleIntakeRequestId`
- `rejectedBy`
- `rejectReason`
- `reopenAllowedYn`

## Rules

- no direct build starts from `REQUESTED`
- build starts only after `ATTACH_APPROVED`
- every analysis run must preserve AI provenance
- rejected intake stays queryable in audit and repair history
