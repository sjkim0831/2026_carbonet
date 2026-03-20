# UI Block Binding Contracts

Generated on 2026-03-21 for the Resonance governed UI block track.

## Goal

Define the normalized contracts for popup, grid, search-form, and dashboard blocks so Resonance can generate and repair them consistently.

Use this document for:

- `popup-binding.json`
- `grid-binding.json`
- `search-form-binding.json`
- `dashboard-layout-profile.json`

## Core Rule

These blocks are not optional visual fragments.

They are governed executable assets that must connect:

- scenario
- page
- component family
- event and function chain
- API and backend chain
- authority and security policy
- help and diagnostics coverage

## `popup-binding.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "scenarioId": "member-search-popup",
  "popupBindingId": "popup-member-selector-v1",
  "popupFamily": "member-selector",
  "popupFrameProfileId": "modal-standard-wide",
  "triggerComponentId": "cmp_8f2c1a90",
  "openEventId": "evt_open_member_selector",
  "closeEventId": "evt_close_member_selector",
  "focusReturnPolicy": "RETURN_TO_TRIGGER",
  "searchFormBindingId": "search-member-basic-v1",
  "gridBindingId": "grid-member-selector-v1",
  "apiBindingSet": ["apiMemberSearch", "apiMemberSelect"],
  "authorityPolicyId": "admin-member-search",
  "helpAnchorSet": ["popup-member-selector.header", "popup-member-selector.grid"],
  "stateProfileSet": ["LOADING", "EMPTY", "ERROR", "NO_AUTHORITY"],
  "version": "1.0.0"
}
```

Required fields:

- `projectId`
- `scenarioId`
- `popupBindingId`
- `popupFamily`
- `popupFrameProfileId`
- `triggerComponentId`
- `openEventId`
- `closeEventId`
- `searchFormBindingId`
- `gridBindingId`
- `authorityPolicyId`

## `grid-binding.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "scenarioId": "member-list",
  "gridBindingId": "grid-member-list-v1",
  "gridFamily": "member-list-standard",
  "gridDensityProfileId": "grid-density-default",
  "columnSetId": "member-list-columns-v1",
  "defaultSortSet": ["memberNm:asc"],
  "rowActionSet": ["view", "edit", "approve"],
  "pagingPolicy": "PAGE_NUMBER",
  "emptyStateProfile": "EMPTY_STANDARD",
  "apiBindingId": "apiMemberList",
  "authorityPolicyId": "admin-member-read",
  "helpAnchorSet": ["member-list.grid", "member-list.row-actions"],
  "version": "1.0.0"
}
```

Required fields:

- `projectId`
- `scenarioId`
- `gridBindingId`
- `gridFamily`
- `gridDensityProfileId`
- `columnSetId`
- `apiBindingId`
- `authorityPolicyId`

## `search-form-binding.json`

Recommended shape:

```json
{
  "projectId": "carbonet-member",
  "scenarioId": "member-list",
  "searchFormBindingId": "search-member-basic-v1",
  "searchFamily": "member-basic-search",
  "layoutProfileId": "search-inline-two-row",
  "fieldSetId": "member-search-fields-v1",
  "submitEventId": "evt_search_submit",
  "resetEventId": "evt_search_reset",
  "boundGridBindingId": "grid-member-list-v1",
  "apiBindingId": "apiMemberList",
  "authorityPolicyId": "admin-member-read",
  "helpAnchorSet": ["member-list.search"],
  "version": "1.0.0"
}
```

Required fields:

- `projectId`
- `scenarioId`
- `searchFormBindingId`
- `searchFamily`
- `layoutProfileId`
- `fieldSetId`
- `submitEventId`
- `boundGridBindingId`
- `apiBindingId`

## `dashboard-layout-profile.json`

Recommended shape:

```json
{
  "projectId": "carbonet-ops",
  "dashboardLayoutProfileId": "dashboard-gwt-price-prediction-v1",
  "layoutFamily": "GWT_PRICE_PREDICTION",
  "summaryCardCount": 4,
  "primaryPanelZone": "CENTER",
  "secondaryPanelZone": "RIGHT",
  "detailGridZone": "BOTTOM",
  "filterPlacement": "TOP_STICKY",
  "allowedBlockFamilySet": [
    "summary-card",
    "trend-chart",
    "prediction-chart",
    "driver-explanation",
    "recommendation-panel",
    "detail-grid"
  ],
  "actionLayoutProfile": "dashboard-bottom-action-standard",
  "version": "1.0.0"
}
```

Required fields:

- `dashboardLayoutProfileId`
- `layoutFamily`
- `summaryCardCount`
- `allowedBlockFamilySet`
- `actionLayoutProfile`

## Completeness Rules

Do not allow:

- popup generation without search, grid, and state coverage
- grid generation without row-action and sort policy
- search generation without field set and bound grid or result target
- dashboard generation without approved dashboard layout profile
- block publication without authority, help, diagnostics, and state coverage

## Release Impact

Each block should appear in:

- page/component matrix
- event/function/API/backend/DB chain matrix
- parity/uniformity matrix

No page should be considered build-ready if one of these governed blocks is missing or unresolved.
