# Module Intake API Examples

Generated on 2026-03-21 for Resonance AI-assisted module intake workflow.

## `module-intake/request`

```json
{
  "projectId": "member-core",
  "intakeSourceType": "LOCAL_FOLDER",
  "intakeSourceRef": "/opt/projects/carbosys/modules/board-faq",
  "requestedModuleFamily": "BOARD",
  "requestedRuntimeScope": "PROJECT",
  "requestReason": "FAQ board module should be normalized and attached to member-core runtime.",
  "requestedBy": "sjkim"
}
```

```json
{
  "moduleIntakeRequestId": "mir-board-faq-20260321-01",
  "status": "ANALYSIS_PENDING",
  "nextAction": "RUN_AI_ANALYSIS"
}
```

## `module-intake/analyze`

```json
{
  "moduleIntakeRequestId": "mir-board-faq-20260321-01",
  "agentProvider": "CODEX",
  "agentModel": "gpt-5-codex",
  "agentSessionId": "codex-session-board-faq-01",
  "ownershipVerdict": "PROJECT",
  "modulePatternFamilyId": "BOARD_STANDARD",
  "moduleDepthProfileId": "BOARD_DEPTH_V1",
  "frontendImpactSummary": "Adds list/detail/edit page families plus board toolbar composite block.",
  "backendImpactSummary": "Requires controller/service/mapper family matching board standard.",
  "dbImpactSummary": "Requires FAQ table, category table link, and migration draft.",
  "cssImpactSummary": "Needs module extension CSS only; one duplicate class detected.",
  "rollbackPlanSummary": "Detach module, remove menu binding, restore previous release unit, run rollback SQL.",
  "blockingIssueSet": [
    "faq rollback sql missing",
    "duplicate board toolbar class name"
  ]
}
```

```json
{
  "analysisRunId": "mia-board-faq-20260321-01",
  "status": "REVIEW_REQUIRED",
  "blockingIssueCount": 2
}
```

## `module-intake/approve-attach-plan`

```json
{
  "moduleIntakeRequestId": "mir-board-faq-20260321-01",
  "approvedPatternFamilyId": "BOARD_STANDARD",
  "approvedDepthProfileId": "BOARD_DEPTH_V1",
  "approvedRuntimePackageAttachmentProfileId": "BOARD_RUNTIME_ATTACH_V1",
  "approvedBy": "super-master",
  "reviewNote": "Proceed after rollback SQL and CSS dedupe fixes are attached."
}
```

```json
{
  "attachPlanId": "map-board-faq-20260321-01",
  "status": "BUILD_READY",
  "nextAction": "OPEN_RUNTIME_PACKAGE_MATRIX"
}
```

## `module-intake/reject`

```json
{
  "moduleIntakeRequestId": "mir-legacy-report-20260321-02",
  "rejectedBy": "super-master",
  "rejectReason": "Common/runtime ownership unresolved and export adapter bypasses current security facade.",
  "reopenAllowedYn": true
}
```

## Reference Login Module Intake Example

```json
{
  "projectId": "member-core",
  "intakeSourceType": "LOCAL_FOLDER",
  "intakeSourceRef": "/opt/reference/modules/certlogin-4.3.2",
  "requestedModuleFamily": "CERTIFICATE_LOGIN_ADAPTER",
  "requestedRuntimeScope": "COMMON",
  "requestReason": "Normalize certificate-login related common code into governed common lines and provider adapters.",
  "requestedBy": "sjkim"
}
```
