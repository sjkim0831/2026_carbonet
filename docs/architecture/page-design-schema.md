# Page Design Schema

Generated on 2026-03-21 for Resonance page-level design governance.

## Goal

Define the normalized schema for `page-design.json`.

This schema describes page-level intent and should not inline all element details.

## Core Rule

`page-design.json` defines:

- why the page exists
- which scenario it belongs to
- where it appears in menu and route space
- which shell and frame it uses
- which element families are expected

## Required Fields

- `pageDesignId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `pageFamily`
- `screenFamilyRuleId`
- `menuCandidateSet`
- `routeCandidateSet`
- `shellProfileId`
- `pageFrameId`
- `themeSetId`
- `designGuideProfileId`
- `actionLayoutProfileId`
- `responsiveProfileId`
- `languageProfileSet`
- `actorPolicyId`
- `helpProfileId`
- `diagnosticsProfileId`
- `expectedElementFamilySet`
- `approvalState`
- `version`

## Recommended pageFamily Values

- `HOME_PAGE`
- `LIST_PAGE`
- `DETAIL_PAGE`
- `EDIT_PAGE`
- `REVIEW_PAGE`
- `DASHBOARD_PAGE`
- `POPUP_PAGE`
- `WIZARD_PAGE`

## Validation Rules

Reject publish-ready page designs when:

- page family is missing
- screen family rule is missing
- shell or frame is missing
- theme set is missing
- action layout profile is missing
- expected element families are empty
- actor or help profile is missing
- page design violates its approved screen family rule

## Use

`page-design.json` should be consumed by:

- page assembly
- menu-to-rendered-screen verification
- parity compare
- runtime package matrix
- design guide workspace and printable design output
- screen-family consistency verification
