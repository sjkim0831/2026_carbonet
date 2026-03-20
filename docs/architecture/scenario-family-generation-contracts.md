# Scenario Family Generation Contracts

Generated on 2026-03-21 for the Resonance scenario-first scaffold track.

## Goal

Define the structured contracts used when Resonance generates frontend and backend assets from scenario families instead of one-off page requests.

Use this document for:

- `scenario-family.json`
- `scenario-definition.json`
- `scaffold-request.json`
- `language-profile.json`
- `responsive-profile.json`
- `app-runtime-profile.json`
- join-family reference mapping

## Core Rule

One business capability may expand into many generated screens.

Do not assume:

- one menu equals one page
- one page equals one route
- one feature equals one language variant
- one scenario equals one responsive layout

Use one governed `scenario family` as the parent and derive child scenarios from it.

Every scenario family must belong to one explicit `projectId`.

Scenario families must be manageable as an operator-facing catalog.

Operators and AI workers should be able to:

- list scenario families by project and requirement domain
- inspect child scenarios without reading raw source files
- select one scenario and immediately inspect its menu, page, actor, API, DB, and action-layout bindings
- add page, menu, button, component, event, function, and API assets from that selected scenario context
- inspect the generated result chain from scenario to release unit

## Scenario Completeness And Runtime Parity Rule

Resonance should not allow a scenario to be considered build-ready unless the scenario can generate a uniform screen family with all required business actions present.

Use this rule:

- every selected scenario must resolve its required menu, page, button group, component set, popup family, grid family, search-form family, event set, function set, API set, backend chain, DB object set, help set, authority set, and security bindings
- the builder should prefer approved common components and governed composite blocks before allowing page-local variants
- scenario output must remain visually uniform by using approved frame profiles, action-layout profiles, shell profiles, and theme-bound component sets
- if a current Carbonet source family exists for the same capability, the generated scenario family should be compared against it before release approval

Do not allow:

- scenario publication with missing business actions that are required by the use case
- scenario generation that skips popup, search, grid, upload, approval, export, or status blocks required by the requirement domain
- direct page generation from ad hoc components outside the approved catalog
- release approval when scenario-to-runtime parity gaps remain unexplained

## `scenario-family.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "scenarioFamilyId": "join-public-company",
  "requirementDomain": "02_회원인증",
  "businessCapability": "company-join",
  "labelKo": "회원가입",
  "labelEn": "Join",
  "actorTypes": ["PUBLIC_USER", "ADMIN_REVIEWER"],
  "defaultThemeId": "krds-public-join",
  "deviceProfiles": ["desktop-default", "mobile-default"],
  "languageProfiles": ["ko-KR", "en-US"],
  "childScenarioIds": [
    "join-entry",
    "join-terms",
    "join-auth",
    "join-info",
    "join-complete",
    "join-status-search",
    "join-status-guide",
    "join-status-detail",
    "join-reapply",
    "join-admin-review"
  ],
  "installableModuleSet": [
    "COMMON_FRONTEND_MODULE:join-shell",
    "COMMON_BACKEND_MODULE:join-common",
    "SECURITY_POLICY_BUNDLE:public-auth-basic"
  ],
  "status": "ACTIVE"
}
```

Required fields:

- `projectId`
- `scenarioFamilyId`
- `requirementDomain`
- `businessCapability`
- `actorTypes`
- `defaultThemeId`
- `deviceProfiles`
- `languageProfiles`
- `childScenarioIds`
- `status`

## Scenario Catalog And Builder APIs

Resonance should expose scenario-first APIs so the operations system can drive generation without verbose prompts.

### Scenario Catalog

- `GET /api/admin/resonance/scenario-families`
  - filters:
    - `projectId`
    - `requirementDomain`
    - `businessCapability`
    - `actorType`
    - `status`
- `GET /api/admin/resonance/scenario-families/{scenarioFamilyId}`
- `GET /api/admin/resonance/scenario-families/{scenarioFamilyId}/scenarios`
- `GET /api/admin/resonance/scenarios/{scenarioId}`

These APIs should return:

- child scenario list
- menu and page policy
- actor policy
- required API set
- required DB objects
- required installable modules
- action-layout profile
- language and device profile coverage

### Scenario Asset Augmentation

- `POST /api/admin/resonance/scenarios/{scenarioId}/menu-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/page-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/button-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/component-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/event-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/function-bindings`
- `POST /api/admin/resonance/scenarios/{scenarioId}/api-bindings`

Use this rule:

- additions happen from a selected scenario context
- the system should not allow asset creation with no scenario ownership
- added assets must be immediately queryable from the scenario detail screen

### Scenario Result Chain

- `GET /api/admin/resonance/scenarios/{scenarioId}/result-chain`
- `GET /api/admin/resonance/scenario-families/{scenarioFamilyId}/result-chain`

These APIs should expose:

- menu, page, and feature results
- component, event, function, and API results
- backend and DB scaffold results
- help and security bindings
- generation run history
- published version history
- release-unit bindings
- deploy and rollback pointers

## `scenario-definition.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "scenarioId": "join-info",
  "scenarioFamilyId": "join-public-company",
  "screenType": "FORM",
  "actorType": "PUBLIC_USER",
  "primaryUseCase": "company-join-form-entry",
  "adminReviewPairYn": true,
  "routePolicy": {
    "koPath": "/join/step4",
    "enPath": "/join/en/step4"
  },
  "pagePolicy": {
    "pageId": "join-info",
    "menuCode": "JOIN_STEP4",
    "featureCode": "JOIN_INFO_VIEW"
  },
  "requiredApiSet": [
    "joinCompanyDraftLoad",
    "joinCompanySave",
    "joinFileUpload"
  ],
  "requiredDbObjects": [
    "COMTN_MEMBER",
    "JOIN_COMPANY_DRAFT",
    "ATCH_FILE"
  ],
  "requiredInstallableModules": [
    "COMMON_BACKEND_MODULE:join-common",
    "COMMON_FRONTEND_MODULE:file-upload-block"
  ],
  "actorPolicyId": "public-join-basic",
  "memberClassificationPolicyId": "public-join-default",
  "csrfPolicyId": "public-form-post-default",
  "actionLayoutProfile": "public-form-default",
  "successOutcome": "join-complete",
  "failureOutcome": "join-info-error"
}
```

Required fields:

- `projectId`
- `scenarioId`
- `scenarioFamilyId`
- `screenType`
- `actorType`
- `primaryUseCase`
- `routePolicy`
- `pagePolicy`
- `requiredApiSet`
- `requiredInstallableModules`
- `actorPolicyId`
- `memberClassificationPolicyId`
- `csrfPolicyId`
- `actionLayoutProfile`

Each scenario detail view should be able to answer:

1. what route, menu, and page it owns
2. what buttons and action layout it uses
3. what components are allowed
4. what events exist
5. what functions and APIs are bound
6. what DB objects are required
7. what generated results already exist
8. what still remains as scaffold debt

## `member-classification-policy.json`

Recommended shape:

```json
{
  "memberClassificationPolicyId": "company-member-admin-default",
  "classificationDimensions": [
    "memberType",
    "memberStatus",
    "institutionId",
    "departmentId",
    "approvalState"
  ],
  "queryEnforcementMode": "MANDATORY",
  "exportEnforcementMode": "MANDATORY",
  "outputMaskingPolicy": "CLASSIFICATION_AWARE",
  "auditCaptureYn": true,
  "status": "ACTIVE"
}
```

Use this rule:

- scenarios that handle member or actor data must declare a classification policy explicitly
- generated list, detail, export, and API bindings must all reference the same classification policy
- classification-aware output shaping is part of the scenario contract

## `csrf-policy.json`

Recommended shape:

```json
{
  "csrfPolicyId": "admin-form-post-default",
  "protectionMode": "TOKEN_REQUIRED",
  "transportMode": "HEADER_AND_FORM",
  "rotationMode": "SESSION_BOUND",
  "failureHandling": "BLOCK_AND_AUDIT",
  "sameSitePolicy": "LAX",
  "status": "ACTIVE"
}
```

Use this rule:

- state-changing scenarios must bind to an explicit CSRF policy
- public and admin flows may use different policies, but both must be governed centrally
- frontend form generation and backend endpoint generation should consume the same policy id

## `actor-policy.json`

Recommended shape:

```json
{
  "actorPolicyId": "public-join-basic",
  "actorType": "PUBLIC_USER",
  "authorCode": "ROLE_ANONYMOUS",
  "dataScope": "PUBLIC",
  "menuPermissionSet": ["JOIN_STEP1", "JOIN_STEP2", "JOIN_STEP3", "JOIN_STEP4", "JOIN_STEP5"],
  "featurePermissionSet": ["JOIN_INFO_VIEW", "JOIN_INFO_SUBMIT"],
  "endpointPermissionSet": ["/join/**"],
  "uiActionSet": ["view", "submit", "upload", "reapply"],
  "approvalAuthorityYn": false,
  "exceptionPolicy": "NONE",
  "status": "ACTIVE"
}
```

Use this rule:

- actor policy is required for every scenario
- actor policy must define both role family and data scope
- public, admin, company-scoped, and department-scoped flows should not be inferred late in implementation
- frontend button visibility and backend permission checks should reference the same actor policy family

## `language-profile.json`

Recommended shape:

```json
{
  "languageProfileId": "ko-KR",
  "locale": "ko-KR",
  "dir": "ltr",
  "labelPolicy": "KOREAN_PRIMARY",
  "fallbackProfileId": "en-US",
  "bundleKey": "messages.ko-KR",
  "dateFormat": "yyyy-MM-dd",
  "numberFormat": "ko-KR",
  "status": "ACTIVE"
}
```

Use this rule:

- language variants share the same scenario family
- route, label, copy, validation text, and policy text may differ
- component structure should remain aligned unless a documented exception exists

## `responsive-profile.json`

Recommended shape:

```json
{
  "responsiveProfileId": "mobile-default",
  "deviceClass": "mobile",
  "breakpoints": {
    "sm": 360,
    "md": 768,
    "lg": 1280
  },
  "layoutRules": {
    "searchFormColumns": 1,
    "gridToolbarWrap": true,
    "actionBarStacking": "vertical-on-mobile",
    "detailFormColumns": 1
  },
  "accessibilityPolicy": "MOBILE_A11Y_BASELINE",
  "status": "ACTIVE"
}
```

Use this rule:

- responsive behavior must be driven from profile rules
- do not fork a separate page implementation unless the scenario family explicitly requires it
- mobile and desktop are variations of the same governed page contract first

## `app-runtime-profile.json`

Recommended shape:

```json
{
  "appRuntimeProfileId": "hybrid-webview-default",
  "runtimeKind": "HYBRID_WEBVIEW",
  "jsCapabilitySet": [
    "ROUTE_NAVIGATION",
    "WEBVIEW_BACK_BUTTON",
    "CAMERA_BRIDGE",
    "FILE_PICKER_BRIDGE",
    "SECURE_STORAGE_BRIDGE",
    "PUSH_TOKEN_SYNC"
  ],
  "fallbackMode": "WEB_SAFE_DEGRADE",
  "eventBridgePolicy": "POST_MESSAGE_BRIDGE",
  "offlinePolicy": "CACHE_CRITICAL_METADATA_ONLY",
  "status": "ACTIVE"
}
```

Use this rule:

- frontend JS behavior should be selected through one governed runtime profile
- web browser, mobile web, hybrid webview, native wrapper, and kiosk flows should share the same capability model
- generated code should bind to capability flags and bridge adapters instead of scattering device checks through page code

## `scaffold-request.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "requirementDomain": "02_회원인증",
  "screenRequirementId": "REQ-JOIN-STEP4",
  "scenarioFamilyId": "join-public-company",
  "scenarioId": "join-info",
  "actorPolicyId": "public-join-basic",
  "memberClassificationPolicyId": "public-join-default",
  "csrfPolicyId": "public-form-post-default",
  "themeId": "krds-public-join",
  "technologyProfileId": "KRDS_REACT",
  "deviceProfileSet": ["desktop-default", "mobile-default"],
  "responsiveProfileId": "mobile-default",
  "appRuntimeProfileId": "hybrid-webview-default",
  "languageProfileSet": ["ko-KR", "en-US"],
  "actionLayoutProfile": "public-form-default",
  "componentCatalogSelection": [
    "FORM_SECTION:company-join",
    "FILE_UPLOAD_BLOCK:single-required",
    "ACTION_BAR:public-submit"
  ],
  "apiBindingSet": [
    "joinCompanyDraftLoad",
    "joinCompanySave",
    "joinFileUpload"
  ],
  "dbBindingSet": [
    "COMTN_MEMBER",
    "JOIN_COMPANY_DRAFT",
    "ATCH_FILE"
  ],
  "moduleBindingSet": [
    "COMMON_FRONTEND_MODULE:join-shell",
    "COMMON_BACKEND_MODULE:join-common"
  ],
  "folderMappingProfile": "member-react-default",
  "buildMode": "SCAFFOLD_AND_BUILD",
  "publishMode": "DRAFT_ONLY",
  "codexAssistMode": "BINDING_ASSIST",
  "codexPromptPolicy": "JSON_ONLY"
}
```

Use this rule:

- `scaffold-request.json` is the authoritative machine payload for generation
- proposal text, PDF, HWP, and design documents should be normalized into this contract before code generation starts
- frontend, backend, manifest, security, and deploy outputs should all trace back to one scaffold request id

## `generated-identifier-policy.json`

Recommended shape:

```json
{
  "generatedIdentifierPolicyId": "default-short-hash-v1",
  "strategy": "SEMANTIC_ALIAS_PLUS_DETERMINISTIC_HASH",
  "hashAlgorithm": "SHA-256-SHORT12",
  "seedFields": [
    "projectId",
    "scenarioFamilyId",
    "scenarioId",
    "artifactKind",
    "semanticAlias",
    "versionLine"
  ],
  "outputRules": {
    "separator": "_",
    "maxLength": 80,
    "preserveSemanticPrefixYn": true
  },
  "status": "ACTIVE"
}
```

Use this rule:

- semantic aliases remain readable and reviewable
- physical generated identifiers are derived from the semantic alias plus deterministic hash suffix
- function, event, API binding, component instance, and mapper identifiers should all follow one governed policy family
- rebuilds with the same seed fields must reproduce the same identifier
- published manifests should keep both semantic and physical forms

## Join Family Reference Mapping

Use the join family as the baseline expansion pattern for other business capabilities.

### Reference family

```text
join-public-company
  join-entry
  join-terms
  join-auth
  join-info
  join-complete
  join-status-search
  join-status-guide
  join-status-detail
  join-reapply
  join-admin-review
```

### Why this is the baseline

The join family already proves these patterns exist together:

- multi-step wizard
- completion and failure branches
- status lookup and detail flow
- reject and reapply flow
- public page and admin review pair
- Korean and English variants
- mobile and desktop responsive variants
- browser and hybrid-app runtime variants

## Join-Family Parity Assessment

Using the current repository as a reference, Resonance is close to being able to reproduce the join flow without visible output loss, but it is not fully guaranteed yet.

Confirmed strengths:

- the current repository already contains a substantial join page family in `frontend/src/app/screen-registry/pageManifests.ts`
- the current repository already contains separate public signin and admin-login routing and interceptor behavior
- the documented join scenario family covers step wizard, terms, auth, info, complete, status search, guide, detail, reapply, and admin review
- screen-builder and page-frame assets are already compatible with join-like multi-step composition
- authority, classification, CSRF, help, security, language, and responsive or device profile contracts already exist in the architecture

Still required before parity can be claimed:

- scenario catalog APIs must return all join-family children and bindings without manual file inspection
- event, function, and API binding manifests for the join flow must be fully populated
- help content and help anchors for all join-family screens must be complete
- release-unit comparison should confirm that generated assets and current runtime assets are materially equivalent
- output package builder should be able to emit the full join-family design and scaffold package in one run
- admin-login, signin, and recovery-family compare views should also confirm parity for public versus admin authority separation

Current judgment:

- architecture completeness for join-family generation: high
- guaranteed artifact parity with the existing runtime: not complete until binding manifests and compare views are implemented

Use this interpretation:

- the design is strong enough to start implementing join-family generation
- but the final claim of `no observable difference from the current system` still depends on compare, binding, and result-chain implementation

### Inference rules for other pages

Use these scenario-family templates for new features:

- `list-detail-edit-review`
  - common for business admin flows
- `search-guide-detail`
  - common for public query flows
- `wizard-complete`
  - common for registration and application flows
- `request-review-reapply`
  - common for approval and reject loops
- `public-admin-pair`
  - common when end users submit and operators review
- `alert-confirm-execute`
  - common for provider switch, retry, restart, resend, rotate, and revoke flows

## Operational Scenario Families

Notification, mail, SMS, and certificate features should also be modeled as scenario families.

Recommended operational families:

- `notification-provider-management`
  - provider list
  - provider detail
  - provider activate
  - provider disable
  - provider failover
- `notification-template-management`
  - template list
  - template edit
  - template preview
  - template publish
- `certificate-rotation-management`
  - certificate list
  - expiry alert
  - preflight check
  - rotate
  - rollback
- `secret-rotation-management`
  - secret list
  - rotate
  - verify
  - rollback

Use this rule:

- operational pages must also start from scenario-family registration
- alerts, confirms, retries, and irreversible actions must be represented as governed scenario branches
- operator buttons should map to action-layout and authority-gate contracts, not ad hoc modal logic

## Scaffold Consumption Rule

The scaffold engine should consume these contracts in this order:

1. `scenario-family.json`
2. `scenario-definition.json`
3. `actor-policy.json`
4. `member-classification-policy.json`
5. `csrf-policy.json`
6. `language-profile.json`
7. `responsive-profile.json`
8. `app-runtime-profile.json`
9. `scaffold-request.json`
10. `action-layout.json`
11. theme, component, API, and module bindings

Then generate:

- route metadata
- page manifest
- frontend screen schema or source
- backend controller/service/VO/DTO/mapper/XML
- installable module bindings
- language bundle manifest
- responsive rule manifest
- app-runtime capability manifest

## Non-Goals

This contract does not allow:

- skipping scenario-family registration for convenience
- generating language variants as unrelated pages
- generating mobile variants as disconnected one-off screens
- generating hybrid-app behavior from ad hoc user-agent checks instead of runtime profile policy
- deriving button layout ad hoc outside an approved action-layout profile
