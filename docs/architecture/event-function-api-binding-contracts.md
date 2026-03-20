# Event Function API Binding Contracts

Generated on 2026-03-21 for Resonance structured screen execution wiring.

## Goal

Define the normalized contracts for:

- `event-binding.json`
- `function-binding.json`
- `api-binding.json`

These contracts exist so that screen generation is not layout-only.

Every governed screen should prove:

- which component emits which event
- which function handles that event
- which API is called by that function
- which backend and DB chain is reached from that API

## 1. Core Rule

Do not allow publish-ready generation unless the following chain is complete:

1. `component -> event`
2. `event -> function`
3. `function -> API`
4. `API -> backend contract`
5. `backend contract -> DB contract`

If any link is unresolved, the screen remains:

- draft
- repair-only
- review-blocked

## 2. event-binding.json

Purpose:

- map one governed component instance or component family to emitted UI events

Required fields:

- `eventBindingId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `componentId`
- `instanceKeyRule`
- `eventName`
- `eventCategory`
- `triggerType`
- `functionBindingId`
- `authorityGateId`
- `helpAnchorId`
- `securityProfileId`
- `accessibilityProfileId`
- `traceRequiredYn`
- `blockingYn`
- `version`

Recommended `eventCategory` values:

- `CLICK`
- `SUBMIT`
- `CHANGE`
- `ROW_ACTION`
- `POPUP_OPEN`
- `POPUP_CLOSE`
- `TAB_CHANGE`
- `WIZARD_STEP`
- `FILE_UPLOAD`
- `FILE_DOWNLOAD`
- `PAGE_ACTION`
- `SHORTCUT`

Recommended `triggerType` values:

- `POINTER`
- `KEYBOARD`
- `POINTER_AND_KEYBOARD`
- `SYSTEM`

## 3. function-binding.json

Purpose:

- describe reusable or page-local action logic invoked by events

Required fields:

- `functionBindingId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `functionLogicalName`
- `functionPhysicalName`
- `functionType`
- `inputContractId`
- `outputContractId`
- `apiBindingSet`
- `stateMutationProfile`
- `errorHandlingProfile`
- `optimisticUiYn`
- `auditRequiredYn`
- `traceRequiredYn`
- `version`

Recommended `functionType` values:

- `VALIDATION`
- `COMMAND`
- `QUERY`
- `FORMATTER`
- `STATE_TRANSITION`
- `POPUP_COORDINATOR`
- `GRID_COORDINATOR`
- `FILE_COORDINATOR`

`functionPhysicalName` rule:

- may be a deterministic opaque identifier
- must remain versionable
- must not collide across the same project generation family

## 4. api-binding.json

Purpose:

- bind generated or reused functions to backend endpoints and service contracts

Required fields:

- `apiBindingId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `apiId`
- `endpointUri`
- `httpMethod`
- `requestContractId`
- `responseContractId`
- `backendChainId`
- `dbContractSet`
- `authorizationPolicyId`
- `classificationPolicyId`
- `csrfPolicyId`
- `maskingProfileId`
- `auditCategory`
- `traceRequiredYn`
- `version`

Recommended `httpMethod` values:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

## 5. Cross-Contract Validation

Reject publish-ready generation when:

- a governed component has no `event-binding`
- an event points to missing `functionBindingId`
- a function has no API set where backend data is required
- an API has no backend or DB contract where persistence is required
- an action has no authority, security, or trace requirement
- popup/grid/search actions do not declare the correct coordinator functions

## 6. Standard Families

These blocks should ship with default binding families:

- search form submit and reset
- grid row select and row action
- popup open, confirm, cancel, close
- file upload select, upload, download, delete
- approval confirm and reject
- wizard next, previous, submit

## 7. Compare And Repair Use

These contracts should be visible in:

- selected-screen repair
- generated-result compare
- backend chain explorer
- runtime package matrix
- chain and matrix explorer
