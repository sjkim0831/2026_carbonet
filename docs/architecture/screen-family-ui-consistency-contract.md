# Screen Family UI Consistency Contract

Generated on 2026-03-21 for Resonance governed screen-family generation.

## Goal

Ensure that once a screen family is generated, every later screen of the same family follows the same UI rule set, while still allowing AI-assisted repair and editing inside governed boundaries.

## Core Rule

One screen family should map to one approved UI rule profile.

Examples:

- `JOIN_ENTRY`
- `JOIN_TERMS`
- `JOIN_AUTH`
- `JOIN_INFO`
- `JOIN_COMPLETE`
- `ADMIN_LIST`
- `ADMIN_DETAIL`
- `ADMIN_EDIT`
- `ADMIN_LIST_REVIEW`
- `BOARD_LIST`
- `BOARD_DETAIL`
- `BOARD_WRITE`
- `DASHBOARD_PRICE_PREDICTION`

Each family should resolve to the same:

- shell profile
- page frame
- action layout
- slot profile set
- spacing and density profile
- component family set
- help anchor structure
- diagnostics structure

## Required Family Rule Fields

- `screenFamilyRuleId`
- `projectId`
- `screenFamilyId`
- `pageFamily`
- `shellProfileId`
- `pageFrameId`
- `themeSetId`
- `actionLayoutProfileId`
- `slotProfileSet`
- `spacingProfileId`
- `densityProfileId`
- `componentFamilySet`
- `requiredElementFamilySet`
- `helpProfileId`
- `diagnosticsProfileId`
- `html5ProfileId`
- `aiEditableYn`
- `aiEditBoundaryProfileId`
- `approvalState`
- `version`

## AI Edit Rule

AI editing is allowed only when:

- the target screen belongs to an approved screen family rule
- the requested change stays within the `aiEditBoundaryProfileId`
- no family-level blocker is violated

AI editing must not:

- replace the shell family
- replace the page frame family
- move primary action slots outside the approved action layout
- introduce unapproved component families
- bypass approved slot profiles with page-local layout overrides
- break help anchor structure
- break governed HTML5 landmarks

## Allowed AI Edit Types

- text and label refinement
- spacing token refresh within the same spacing profile
- component property tuning within the same component family
- adding missing help anchors
- completing missing event/function/API bindings
- replacing a component instance with another approved variant in the same family
- filling missing diagnostics metadata

## Blocked AI Edit Types

- arbitrary new page frame creation inside a governed family
- changing a `LIST_PAGE` family into a custom one-off layout
- moving grid toolbar or bottom action bar outside the approved slot profile
- changing semantic structure from approved HTML5 landmarks to layout-only wrappers
- attaching control-plane-only components to runtime-deployable page families

## Family Consistency Verification

Before publish-ready:

1. resolve the page to `screenFamilyId`
2. load the approved `screenFamilyRuleId`
3. compare current page design and page assembly against:
   - shell
   - frame
   - slot profile
   - spacing
   - density
   - component family set
   - help profile
   - diagnostics profile
4. emit drift findings
5. reopen repair if any required family rule is violated

## Repair Rule

Repair should default to:

- restore to approved family rule
- reuse existing approved components first
- create new component assets only when no approved family-compatible asset exists

Repair history should record:

- who requested the repair
- whether AI or human applied it
- which family rule was enforced
- which drift points were corrected

## Use

This contract should be consumed by:

- page-design governance
- page-assembly governance
- menu-to-rendered-screen verification
- parity and uniformity compare
- repair-open and repair-apply flows
- AI-assisted screen editing workflows
