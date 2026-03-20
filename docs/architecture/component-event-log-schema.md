# Component Event Log Schema

Generated on 2026-03-21 for Resonance component-level trace and audit coverage.

## Goal

Define the minimum schema for component interaction traces so that every governed component can be:

- observed
- compared
- audited
- repaired
- tied back to scenario, menu, page, and release lineage

## 1. Required Event Families

Every approved interactive component should emit one or more of these families:

- `COMPONENT_RENDER_SUMMARY`
- `COMPONENT_POINTER_ACTION`
- `COMPONENT_KEYBOARD_ACTION`
- `COMPONENT_FOCUS_CHANGE`
- `COMPONENT_STATE_CHANGE`
- `COMPONENT_BLOCKED_ACTION`

## 2. Required Fields

Every component event should carry:

- `traceId`
- `spanId`
- `parentSpanId`
- `eventId`
- `eventFamily`
- `occurredAt`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `menuId`
- `pageId`
- `routeId`
- `componentId`
- `componentVersion`
- `instanceKey`
- `pageVersion`
- `layoutVersion`
- `themeId`
- `shellProfileId`
- `actionLayoutProfileId`
- `actorId`
- `actorScope`
- `authorityPolicyId`
- `classificationScope`
- `result`
- `errorCode`
- `releaseUnitId`
- `mainServerTruthYn`

## 3. Optional Context Fields

Use when relevant:

- `popupFamilyId`
- `gridFamilyId`
- `searchFormFamilyId`
- `functionBindingId`
- `apiBindingId`
- `backendChainId`
- `dbContractId`
- `helpAnchorId`
- `securityProfileId`
- `accessibilityProfileId`

## 4. Result Values

Recommended `result` values:

- `SUCCESS`
- `BLOCKED`
- `NO_AUTHORITY`
- `VALIDATION_FAIL`
- `API_ERROR`
- `CANCELLED`
- `NO_DATA`

## 5. Logging Rules

Use these rules:

- pointer-only interaction is not enough for governed components
- keyboard-capable actions should emit keyboard traces as well
- blocked actions should emit `COMPONENT_BLOCKED_ACTION`
- state mutation should emit `COMPONENT_STATE_CHANGE`
- passive rendering should be summarized instead of logged per repaint

## 6. Governance Use Cases

These events should power:

- component usage statistics
- parity and uniformity drift detection
- selected-screen repair
- requirement coverage audit
- audit correlation
- post-deploy smoke traces

## 7. Storage And Retention

Recommended split:

- searchable trace index for query and compare
- immutable audit store for security-sensitive actions
- aggregate daily statistics for dashboards

Do not use raw browser exhaust as the canonical truth store.
