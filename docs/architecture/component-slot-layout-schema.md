# Component Slot Layout Schema

Generated on 2026-03-21 for Resonance internal component-slot standardization.

## Goal

Standardize internal placement of labels, helper text, icons, counters, action groups, and footer buttons inside components that share:

- the same component family
- the same page-zone position
- the same visual intent

This prevents screens from drifting even when different teams or AI sessions generate them.

## Core Rule

Components in the same `componentFamily + slotProfileId + pageZone` combination should expose the same internal slot order.

Examples:

- search forms should place title, filter rows, helper text, and action buttons in one governed order
- result grids should place toolbar, total count, utility actions, grid body, and pagination in one governed order
- detail cards should place title, status badge, metadata rail, body fields, and local actions in one governed order
- bottom action bars should place primary, secondary, and danger actions in the same slots

## Required Fields

- `slotProfileId`
- `componentFamily`
- `pageZone`
- `slotOrder`
- `slotAlignmentMap`
- `actionClusterRule`
- `spacingProfileId`
- `densityProfileId`
- `version`

## Recommended pageZone Values

- `PAGE_HEADER`
- `SECTION_HEADER`
- `SECTION_BODY`
- `SECTION_FOOTER`
- `POPUP_HEADER`
- `POPUP_BODY`
- `POPUP_FOOTER`
- `GRID_TOOLBAR`
- `BOTTOM_ACTION`

## Recommended slotOrder Fields

Each slot profile should explicitly order these slots when applicable:

- `title`
- `subtitle`
- `statusBadge`
- `metaSummary`
- `helperText`
- `primaryActionGroup`
- `secondaryActionGroup`
- `dangerActionGroup`
- `filterArea`
- `gridToolbar`
- `pagination`

## Validation Rules

Reject publish-ready pages or element sets when:

- same-family components use conflicting slot profiles in the same page zone
- primary action is placed in different internal slots for the same family
- helper text, counter, or status badge moves across incompatible positions without a new approved slot profile
- page-local CSS overrides internal slot placement outside the approved profile

## Use

`component-slot-layout-schema` should be consumed by:

- component catalog governance
- element design validation
- page assembly validation
- parity and uniformity review
- selected-screen repair
