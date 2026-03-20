# Security Scaffold And Runtime Governance Contract

## Goal

Define the security contract that Resonance must apply from scenario registration through scaffold, build, deploy, and runtime execution.

Security should not be treated as a later hardening phase.

It must be generated, versioned, reviewable, and auditable as part of the platform chain.

## Core Rule

No governed menu, page, feature, API, batch, file route, or runtime binding should be published unless its security posture is explicit.

Every generated feature family must declare:

- actor and authority posture
- data-scope and classification posture
- CSRF posture
- input validation posture
- output masking posture
- download and export posture
- secret and certificate dependency posture
- audit and deny-log posture

## Security Contract Families

Recommended governed objects:

- `security-profile.json`
- `csrf-policy.json`
- `input-validation-policy.json`
- `output-masking-policy.json`
- `file-access-policy.json`
- `transport-security-policy.json`
- `secret-usage-policy.json`
- `audit-deny-policy.json`
- `security-test-checklist.json`
- `approval-policy.json`
- `seal-image-profile.json`

## `security-profile.json`

Recommended shape:

```json
{
  "securityProfileId": "admin-member-standard",
  "actorPolicyId": "company-admin-member-ops",
  "memberClassificationPolicyId": "company-member-default",
  "csrfPolicyId": "admin-post-default",
  "inputValidationPolicyId": "member-admin-form-default",
  "outputMaskingPolicyId": "member-basic-mask",
  "fileAccessPolicyId": "member-attachment-scoped",
  "transportSecurityPolicyId": "https-hsts-secure-cookie",
  "auditDenyPolicyId": "standard-deny-audit",
  "status": "ACTIVE"
}
```

## Input Validation Rule

Generated frontend and backend code should both bind to one validation family.

Required minimums:

- required field contract
- type and length contract
- enum or code-list contract
- file extension and file size contract
- dangerous rich-text or HTML sanitization contract
- server-side final validation even when frontend validation exists

Do not treat frontend validation as the authoritative security boundary.

## Safe Frontend-JS Rule

Resonance should prefer frontend JS for behaviors that are safe to execute on the client side.

Examples of safe frontend-first behavior:

- layout transitions and interactive UI state
- tab, wizard, popup, and accordion coordination
- client-side formatting and display masking previews
- optimistic list filtering when the authoritative backend scope is unchanged
- local validation hints and field dependency behavior
- component interaction logging and diagnostics

Do not place the authoritative security boundary in frontend JS for:

- permission or authority enforcement
- final classification filtering
- final masking decisions for sensitive output
- CSRF-sensitive state changes
- secret usage
- file authorization
- export, download, approval, delete, or authority-changing operations

Use this split:

- frontend JS for safe UX behavior and fast interaction
- common backend and common jars for final validation, final security checks, and authoritative execution

## Output And Masking Rule

Every generated query, detail page, export, PDF, Excel, and download flow should declare:

- what fields are visible
- what fields are partially masked
- what fields are forbidden from output
- what actor scopes can override masking

Sensitive fields should never be left to ad hoc template conditions.

## File Access Rule

Uploads and downloads must be governed by:

- actor policy
- classification scope
- file-access policy
- audit rule
- retention rule

Generated file routes should not bypass:

- permission checks
- audit logging
- signed or governed download policy
- archive or deletion lifecycle

## Transport Security Rule

Every published runtime target should declare:

- HTTPS redirect policy
- secure-cookie policy
- HSTS policy
- allowed domain and host bindings
- certificate profile binding
- CSP or script-source policy posture where applicable

Do not allow:

- runtime targets with undefined HTTPS posture
- pages that change state over insecure transport
- silent mixed-content regressions in governed pages

## Secret And Provider Usage Rule

Generated code should never inline provider credentials or environment-specific secrets.

All secret-backed features must bind through:

- secret profile
- provider adapter
- versioned common facade

This applies to:

- mail
- SMS
- certificate providers
- AI providers
- object storage
- external APIs
- approval seal-image storage

## Audit And Deny Rule

The system must generate authoritative audit and deny logging for:

- login and auth-sensitive actions
- approval, reject, publish, rollback
- export, print, PDF, Excel, download
- authority and menu changes
- file move, archive, delete, retention expiry
- secret, certificate, and provider binding changes
- approval seal-image upload, replace, render, and delete

Denied actions should record:

- actor
- actor scope
- attempted action
- resource target
- deny reason
- policy family used

## Build And Publish Gates

No feature family should publish unless security checks confirm:

1. actor policy exists
2. classification policy exists where applicable
3. CSRF policy exists for state-changing actions
4. input validation policy exists
5. output masking policy exists when sensitive fields are present
6. file-access policy exists when files are uploaded or downloaded
7. transport-security posture is declared
8. audit and deny hooks are present
9. secret-backed integrations use governed profiles
10. security checklist result is attached to the release unit

## Generation Log And Security Trace Rule

Every scaffold, backend generation, mapper generation, and DB draft generation run should leave security-aware generation evidence.

Required minimum generation-log fields:

- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `menuCode`
- `pageId`
- `securityProfileId`
- `actorPolicyId`
- `memberClassificationPolicyId`
- `csrfPolicyId`
- `generatedBackendAssetSet`
- `generatedDbAssetSet`
- `securityCheckResult`
- `denyOrBlockReasonSet`
- `releaseUnitId`
- `operator`
- `generatedAt`

Use this rule:

- if a generated backend or DB artifact fails a security gate, the generation log must record the blocker
- generation history must be reviewable before publish, rollback, or re-generation
- security verification should apply to controller, service, mapper, XML, DDL draft, export path, and file route generation together

## Required Operator Screens

The control plane should expose:

- security profile registry
- masking-policy editor
- CSRF and stateful-action explorer
- file-access and download policy registry
- transport-security dashboard
- deny and security-audit explorer
- release-unit security checklist view

## Non-Goals

- replacing infrastructure firewalls or network policy tooling
- full application security testing automation in one document
- project-local security conventions outside central governance
