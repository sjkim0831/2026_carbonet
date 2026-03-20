# Element Design Set Schema

Generated on 2026-03-21 for Resonance reusable element design governance.

## Goal

Define the normalized schema for `element-design-set.json`.

This schema represents one or more approved element assets that can be assembled into pages.

## Core Rule

Element designs should stay reusable, previewable, versionable, and theme-aligned.

They should describe:

- component family
- composition intent
- binding capabilities
- spacing and layout behavior
- internal slot placement behavior
- popup/grid/search/upload/report/action-bar behavior when relevant

## Required Fields

- `elementDesignSetId`
- `projectId`
- `themeSetId`
- `elementDesignSet`

Each element design entry should include:

- `elementDesignId`
- `elementFamily`
- `componentKind`
- `componentCatalogItemId`
- `slotProfileId`
- `pageZone`
- `reusableYn`
- `themeCompatibilitySet`
- `spacingProfileId`
- `bindingCapabilitySet`
- `popupBindingSet`
- `gridBindingSet`
- `searchFormBindingSet`
- `helpAnchorSet`
- `accessibilityProfileId`
- `securityProfileId`
- `approvalState`
- `version`

## Recommended elementFamily Values

- `SEARCH_FORM`
- `RESULT_GRID`
- `DETAIL_CARD`
- `FILE_ZONE`
- `BOTTOM_ACTION_BAR`
- `SUMMARY_CARD`
- `POPUP_SELECTOR`
- `TAB_PANEL`
- `WIZARD_STEP`

## Validation Rules

Reject publish-ready element sets when:

- component catalog item is missing
- slot profile is missing for governed internal layout
- theme compatibility is missing
- spacing profile is missing
- required popup/grid/search contracts are missing
- help, accessibility, or security metadata is missing

## Use

`element-design-set.json` should be consumed by:

- page assembly
- UI uniformity review
- selected-element repair
- component statistics and drift analysis
- component-slot parity review
