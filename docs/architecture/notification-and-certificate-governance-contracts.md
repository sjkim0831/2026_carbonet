# Notification And Certificate Governance Contracts

Generated on 2026-03-21 for the Resonance common-operations reliability track.

## Goal

Define the contracts that let Resonance update mail, SMS, certificate, and related secret-backed common capabilities without breaking project systems.

## Core Rule

Mail, SMS, certificate, and secret-backed integrations must be treated as:

- installable modules
- centrally versioned provider adapters
- centrally governed configuration assets
- explicit retry and failover families
- explicit rotation and rollback families

Project systems should consume these capabilities through stable facades, not direct provider-specific code.

## Common Capability Families

Recommended module families:

- `MAIL_PROVIDER_ADAPTER`
- `SMS_PROVIDER_ADAPTER`
- `CERTIFICATE_PROVIDER_ADAPTER`
- `NOTIFICATION_TEMPLATE_BUNDLE`
- `SECRET_PROFILE_BUNDLE`
- `CERTIFICATE_POLICY_BUNDLE`

Reference-source candidates currently identified for Resonance intake:

- `/opt/reference/modules/gnrlogin-4.3.2`
  - common login/security/file/common-web baseline
- `/opt/reference/modules/certlogin-4.3.2`
  - certificate-login-oriented variant on top of the same common baseline

Use this rule:

- these folders are reference intake sources, not direct runtime dependencies
- shared common-web and security behavior should be normalized into centrally versioned common lines
- certificate-specific login or provider behavior should be isolated into certificate-related adapters or feature-module lines

## `notification-provider-profile.json`

Recommended shape:

```json
{
  "providerProfileId": "mail-primary-smtp",
  "providerType": "MAIL",
  "providerCode": "SMTP_PRIMARY",
  "adapterModuleId": "MAIL_PROVIDER_ADAPTER:smtp-core",
  "adapterVersion": "1.2.0",
  "endpointRef": "secret://mail/smtp-primary",
  "status": "ACTIVE",
  "failoverGroupId": "mail-default",
  "retryPolicyId": "mail-standard"
}
```

Recommended `providerType` values:

- `MAIL`
- `SMS`
- `CERTIFICATE`

## `notification-template-bundle.json`

Recommended shape:

```json
{
  "templateBundleId": "notification-core-ko-en",
  "templateType": "MAIL",
  "version": "2026.03.21",
  "languageProfiles": ["ko-KR", "en-US"],
  "templates": [
    {
      "templateCode": "JOIN_VERIFY",
      "channel": "MAIL",
      "subjectKey": "mail.join.verify.subject",
      "bodyKey": "mail.join.verify.body"
    }
  ],
  "status": "ACTIVE"
}
```

Use this rule:

- message content should be versioned independently from provider adapters
- project systems should bind approved template bundles rather than editing provider payloads directly

## `retry-policy.json`

Recommended shape:

```json
{
  "retryPolicyId": "mail-standard",
  "maxAttempts": 3,
  "backoffMode": "EXPONENTIAL",
  "baseDelaySeconds": 10,
  "deadLetterAfterFailYn": true,
  "operatorAlertYn": true,
  "status": "ACTIVE"
}
```

Recommended `backoffMode` values:

- `FIXED`
- `LINEAR`
- `EXPONENTIAL`

## `failover-group.json`

Recommended shape:

```json
{
  "failoverGroupId": "mail-default",
  "providerType": "MAIL",
  "orderedProviderProfiles": [
    "mail-primary-smtp",
    "mail-secondary-api"
  ],
  "switchCondition": "PRIMARY_FAILURE_THRESHOLD",
  "recoveryMode": "MANUAL_RESTORE",
  "status": "ACTIVE"
}
```

Use this rule:

- failover should switch providers, not force project-side code changes
- switch conditions and recovery mode must be auditable
- provider failover must remain inside centrally governed adapters

## `certificate-profile.json`

Recommended shape:

```json
{
  "certificateProfileId": "public-main-domain",
  "usageType": "TLS",
  "providerProfileId": "certificate-acme-primary",
  "boundDomains": ["example.com", "www.example.com"],
  "expiresAt": "2026-09-30T00:00:00Z",
  "rotationPolicyId": "tls-standard-rotation",
  "status": "ACTIVE"
}
```

Recommended `usageType` values:

- `TLS`
- `SIGNING`
- `REPORT_ISSUANCE`
- `API_CLIENT`

## `rotation-policy.json`

Recommended shape:

```json
{
  "rotationPolicyId": "tls-standard-rotation",
  "resourceType": "CERTIFICATE",
  "rotateBeforeDays": 30,
  "approvalRequiredYn": true,
  "preflightCheckRequiredYn": true,
  "rollbackWindowDays": 7,
  "status": "ACTIVE"
}
```

Use this rule:

- certificate and secret rotation must be planned changes, not ad hoc replacement
- preflight checks, activation, and rollback must be tracked as governed lifecycle events

## `secret-profile.json`

Recommended shape:

```json
{
  "secretProfileId": "mail-smtp-primary",
  "secretFamily": "MAIL_PROVIDER",
  "storageRef": "vault://resonance/mail/smtp-primary",
  "rotationPolicyId": "secret-standard-rotation",
  "status": "ACTIVE"
}
```

## Reliability Rules

Use these rules for safe updates:

1. provider adapter versions are separate from template versions
2. provider failover should not require project import changes
3. certificate and secret rotation must be centrally scheduled and auditable
4. retry policy must be explicit for each provider family
5. rollback path must exist before switching critical provider bindings
6. reference modules such as `gnrlogin-4.3.2` and `certlogin-4.3.2` must be normalized into governed provider and security lines before use

## Reference Intake Notes

Observed from the reference folders:

- both modules share a wide `egovframework.com.cmm` common baseline
- both include file-management, multipart, security, XSS, interceptor, and double-submit helpers
- `certlogin-4.3.2` should be treated as the stronger reference for certificate-login and related security integration
- mail delivery examples appear in the reference tree and should be normalized into `MAIL_PROVIDER_ADAPTER` or notification-related common modules rather than copied as raw source
- SMS is not a first-class runtime source in these two folders, so SMS should continue to be modeled through provider adapters and template bundles, not inferred as implemented from the reference folders

## Required Operator Screens

- provider registry
- provider version registry
- template bundle registry
- retry and failover policy screens
- certificate profile screen
- certificate expiry and rotation dashboard
- secret profile and rotation dashboard
- notification delivery status and retry dashboard

## Required Audit Events

Record audit events for:

- provider binding changes
- template bundle changes
- retry policy changes
- failover activation
- certificate rotation start and completion
- secret rotation start and completion
- delivery failure threshold exceeded

## Non-Goals

This contract does not allow:

- direct provider credentials inside project source
- project-specific ad hoc mail or SMS logic bypassing common adapters
- certificate replacement without preflight and rollback planning
