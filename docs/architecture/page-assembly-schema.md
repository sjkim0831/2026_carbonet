# Page Assembly Schema

Generated on 2026-03-21 for Resonance governed page composition.

## Goal

Define the normalized schema for `page-assembly.json`.

This schema combines one page design and one or more element designs into a publishable screen family.

## Core Rule

`page-assembly.json` should not invent layout freely.

It should:

- consume approved page design
- consume approved element design assets
- attach approved binding sets
- attach help and diagnostics assets
- remain comparable and rollbackable

## Required Fields

- `pageAssemblyId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `pageDesignId`
- `themeSetId`
- `screenFamilyRuleId`
- `elementDesignSet`
- `bindingAssemblyId`
- `helpAssemblyId`
- `diagnosticsAssemblyId`
- `menuBindingSet`
- `featureBindingSet`
- `routeBindingSet`
- `runtimeDeployableYn`
- `approvalState`
- `version`

## Placement Fields

Each element placement should include:

- `elementDesignId`
- `zoneId`
- `displayOrder`
- `visibilityPolicyId`
- `variantId`
- `actionLayoutSlot`
- `popupAnchorSet`
- `slotProfileId`

## Validation Rules

Reject publish-ready page assemblies when:

- page design is missing
- theme set is missing
- screen family rule is missing
- binding assembly is missing
- required zones are empty
- runtime-deployable pages still include control-plane-only assets
- menu, feature, or route binding is missing
- element placement violates the approved slot profile or action layout of the screen family

## Use

`page-assembly.json` should be consumed by:

- scaffold generation
- runtime package assembly
- menu-to-rendered-screen verification
- post-deploy smoke and parity compare
- screen-family consistency verification
