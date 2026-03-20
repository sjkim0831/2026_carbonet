# Actor Authority Generation Contracts

Generated on 2026-03-21 for the Resonance actor-first governance track.

## Goal

Define the contracts that let Resonance generate screens, backend endpoints, button visibility, and component actions from actor and authority rules before implementation begins.

Use this document for:

- `actor-policy.json`
- button and component authority gates
- actor-to-feature matrix
- scoped role inheritance

## Core Rule

No screen, menu, or feature should be generated without an explicit actor and scope policy.

Authority must propagate through one chain:

`actor -> scenario -> menu/page -> feature -> endpoint -> component -> button/action`

## `actor-policy.json`

Recommended shape:

```json
{
  "actorPolicyId": "company-admin-member-ops",
  "actorType": "ADMIN_USER",
  "authorCode": "ROLE_COMPANY_ADMIN",
  "dataScope": "INSTT_SCOPED",
  "memberClassificationScope": [
    "memberType",
    "memberStatus",
    "institutionId"
  ],
  "menuPermissionSet": ["AMENU_MEMBER"],
  "featurePermissionSet": [
    "MEMBER_LIST_VIEW",
    "MEMBER_DETAIL_VIEW",
    "MEMBER_EDIT_VIEW",
    "COMPANY_DETAIL_VIEW"
  ],
  "endpointPermissionSet": [
    "/admin/member/list",
    "/admin/member/detail",
    "/admin/member/edit"
  ],
  "uiActionSet": ["view", "edit", "assign"],
  "approvalAuthorityYn": false,
  "exceptionPolicy": "KEEP_NON_MANAGED_FEATURES",
  "status": "ACTIVE"
}
```

Required fields:

- `actorPolicyId`
- `actorType`
- `authorCode`
- `dataScope`
- `memberClassificationScope`
- `featurePermissionSet`
- `uiActionSet`
- `approvalAuthorityYn`
- `status`

## Authority Gate Contract

The frontend and backend should use the same gate definition family.

### `authority-gate.json`

Recommended shape:

```json
{
  "gateId": "member-edit-save-button",
  "scenarioId": "member-edit",
  "componentKey": "memberEdit.saveButton",
  "actionId": "save",
  "actorPolicyId": "company-admin-member-ops",
  "requiredFeatureSet": ["MEMBER_EDIT_VIEW"],
  "requiredUiActions": ["edit"],
  "requiredDataScope": "INSTT_SCOPED",
  "visibilityRule": "VISIBLE_IF_ALLOWED",
  "executionRule": "BLOCK_AND_AUDIT_IF_DENIED",
  "auditRequiredYn": true,
  "status": "ACTIVE"
}
```

Use this rule:

- visibility and execution authority should not be separate ad hoc conditions
- if a button or action is visible because of a feature code, the same gate family should be used for execution
- sensitive actions should default to `auditRequiredYn=true`
- member search, detail, export, and file-access actions should inherit the same classification scope gate used by the backend query layer

## Actor-To-Feature Matrix

Recommended matrix columns:

- `actorPolicyId`
- `actorType`
- `authorCode`
- `dataScope`
- `menuCode`
- `featureCode`
- `pageId`
- `endpoint`
- `uiAction`
- `approvalAuthorityYn`
- `exceptions`

Recommended example rows:

| actorPolicyId | authorCode | dataScope | menuCode | featureCode | uiAction |
|---|---|---|---|---|---|
| `system-master-sr` | `ROLE_SYSTEM_MASTER` | `GLOBAL` | `A1900102` | `A1900102_EXECUTE` | `execute` |
| `system-admin-sr` | `ROLE_SYSTEM_ADMIN` | `GLOBAL` | `A1900102` | `A1900102_APPROVE` | `approve` |
| `operation-admin-auth-scoped` | `ROLE_OPERATION_ADMIN` | `INSTT_SCOPED` | `AMENU_AUTH_GROUP` | `AUTH_GROUP_SCOPED_*` | `assign` |
| `company-admin-member-edit` | `ROLE_COMPANY_ADMIN` | `INSTT_SCOPED` | `AMENU_MEMBER` | `MEMBER_EDIT_PERMISSION_*` | `update` |
| `public-join-basic` | `ROLE_ANONYMOUS` | `PUBLIC` | `JOIN_STEP4` | `JOIN_INFO_SUBMIT` | `submit` |

## Scoped Role Inheritance

Use these role inheritance rules:

- `ROLE_SYSTEM_MASTER`
  - global administrative override
- `ROLE_SYSTEM_ADMIN`
  - global system operations without master-only exceptions
- `ROLE_ADMIN`
  - broad admin capability, but not every approval or execution path
- `ROLE_OPERATION_ADMIN`
  - institution-scoped operations
- `ROLE_COMPANY_ADMIN`
  - institution-scoped company administration
- `ROLE_DEPT_*`
  - department or business-unit scoped roles derived from institution context
- `ROLE_ANONYMOUS`
  - public access with tightly limited action sets

Use this rule:

- scoped roles should inherit family behavior from their parent actor type, but must narrow data scope explicitly
- scenario generation should not flatten department-scoped and company-scoped roles into one generic admin role

## Frontend Gate Rules

Frontend scaffolding should generate:

- action visibility map
- disabled-reason map
- audit-on-click rule
- actor-specific empty or denied state content

Required gated frontend families:

- page entry guards
- button bars
- grid row actions
- modal confirm actions
- file download and export actions
- approval and reject actions

## Backend Gate Rules

Backend scaffolding should generate or bind:

- endpoint-level actor policy mapping
- feature and menu permission checks
- data-scope check hooks
- audit-on-deny logging
- approval-authority verification hooks

## Consumption Order

Use these authority contracts in this order:

1. `actor-policy.json`
2. `scenario-definition.json`
3. `authority-gate.json`
4. menu and feature bindings
5. frontend and backend scaffold generation

## Non-Goals

This contract does not allow:

- button visibility without a matching execution rule
- backend authority checks that are invisible to generated UI metadata
- role assumptions hard-coded directly into page code without registered actor-policy references
