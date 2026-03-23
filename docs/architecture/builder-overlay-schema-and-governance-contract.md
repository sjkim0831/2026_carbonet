# Builder Overlay Schema And Governance Contract

## Goal

Define the approved overlay model that lets Carbonet customize generated
framework outputs without manually editing derived artifacts.

An overlay is:

- declarative
- traceable
- attached to stable governed keys
- safe to replay during regeneration

An overlay is not:

- arbitrary source-code editing
- unmanaged runtime hotfix text
- a replacement for builder rules

## Core Rule

Overlay data may refine generated output, but it must not bypass:

- page manifest governance
- component registry governance
- authority and feature governance
- trace and publish lineage
- screen-family and template-line contracts

If a requested customization cannot be expressed through this contract, Carbonet
should add an extension point or builder rule instead of encouraging direct file
edits.

## Overlay Identity

Every overlay record must carry:

- `overlayId`
- `overlayType`
- `projectId`
- `pageId`
- `scenarioId`
- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- `ownerLane`
- `targetScope`
- `targetKeySet`
- `overlayVersion`
- `approvalState`
- `createdBy`
- `createdAt`
- `updatedAt`

## Allowed Overlay Types

- `LAYOUT_VISIBILITY`
- `LAYOUT_ORDER`
- `FIELD_DEFAULT`
- `FIELD_REQUIRED_RULE`
- `FIELD_READONLY_RULE`
- `ACTION_BAR_COMPOSITION`
- `ROUTE_EXCEPTION`
- `AUTHORITY_BINDING`
- `FEATURE_BINDING`
- `THEME_TOKEN_OVERRIDE`
- `HELP_ANCHOR_BINDING`
- `API_ADAPTER_SELECTION`
- `MODULE_ATTACH_PLAN`
- `RELEASE_PACKAGING_OPTION`

No free-form catch-all overlay type should exist in the publish path.

## Target Scope

Allowed `targetScope` values:

- `PAGE`
- `SECTION`
- `COMPONENT_INSTANCE`
- `ACTION_ZONE`
- `ROUTE`
- `AUTHORITY_POLICY`
- `API_BINDING`
- `MODULE_BINDING`
- `RELEASE_UNIT`

## Target Keys

`targetKeySet` must reference stable governed identifiers such as:

- `pageId`
- `componentId`
- `instanceKey`
- `layoutZone`
- `actionId`
- `functionId`
- `apiId`
- `routePath`
- `featureCode`
- `authorCode`
- `moduleId`
- `releaseUnitId`

Overlay matching must never depend on fragile UI text labels alone.

## Overlay Payload Shape

Recommended payload shape:

- `payloadSchemaVersion`
- `matchPolicy`
- `applyMode`
- `payload`
- `validationRules`
- `compatibilityRange`

### `matchPolicy`

Allowed values:

- `EXACT_KEYS`
- `EXACT_KEYS_WITH_TEMPLATE_LINE`
- `EXACT_KEYS_WITH_SCREEN_FAMILY`

### `applyMode`

Allowed values:

- `MERGE`
- `REPLACE_ALLOWED_FIELDS`
- `REMOVE_ALLOWED_FIELDS`

`REPLACE_ALLOWED_FIELDS` must be restricted to the approved mutable fields for
that overlay type.

## Mutable Field Rules

Overlay payloads may mutate only approved fields.

Examples:

- `LAYOUT_VISIBILITY`
  - `visible`
  - `hiddenReason`
- `LAYOUT_ORDER`
  - `displayOrder`
- `FIELD_DEFAULT`
  - `defaultValueRef`
- `FIELD_REQUIRED_RULE`
  - `required`
  - `requiredCondition`
- `ACTION_BAR_COMPOSITION`
  - `actionSet`
  - `primaryActionId`
- `THEME_TOKEN_OVERRIDE`
  - `tokenOverrides`
- `AUTHORITY_BINDING`
  - `authorCodeSet`
  - `scopePolicy`
- `MODULE_ATTACH_PLAN`
  - `moduleIdSet`
  - `attachMode`

Overlays must not mutate:

- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- canonical manifest identity keys
- builder contract field names

Those require builder or contract-level change.

## Approval Rule

Overlay states:

- `DRAFT`
- `REVIEW_READY`
- `APPROVED`
- `PUBLISHED`
- `REJECTED`
- `SUPERSEDED`

Only `APPROVED` or `PUBLISHED` overlays may affect publishable regeneration.

## Precedence Rule

Apply in this order:

1. source contract
2. builder rule and template
3. approved overlay
4. runtime binding

If two overlays target the same mutable field:

- the higher `overlayVersion` wins only within the same overlay family
- cross-family conflicts must fail validation instead of using silent override

## Validation Rule

Every overlay must pass:

- stable target-key resolution
- allowed-type validation
- allowed-field validation
- authority and feature compatibility validation
- template-line and screen-family compatibility validation
- publish lineage registration

An overlay should be rejected if it:

- bypasses registered components
- bypasses approved API or function bindings
- changes slot placement outside approved profile
- introduces unmanaged route drift
- conflicts with authority policy scope

## Trace Requirement

Overlay use must be visible in generation lineage.

Each generation run should capture:

- `overlaySetId`
- `overlayIdSet`
- `overlayHash`
- `overlayCompatibilityStatus`

Each published asset should remain traceable to the overlay set that shaped it.

## Repair Rule

When compare or smoke verification fails because of customization:

- fix overlay data if the customization is valid
- fix builder extension points if the customization is common and reusable
- do not leave repeated manual code edits in derived files

## Carbonet Mapping

This contract should be used together with:

- `docs/architecture/framework-builder-standard.md`
- `docs/architecture/builder-regeneration-without-derived-asset-edits.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/admin-screen-builder-architecture.md`

## Short Verdict

Carbonet should preserve customization through governed overlays attached to
stable keys, not through repeated edits to generated code.
