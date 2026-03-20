# Theme Set Schema

Generated on 2026-03-21 for Resonance governed AI theme-set generation.

## Goal

Define the normalized schema for `theme-set.json`.

This schema should let Resonance generate or update one approved visual system package that can be reused across many pages.

## Core Rule

One theme set should bundle together:

- theme identity
- design-system profile
- color and font bundles
- spacing and density profiles
- shell composition defaults
- page-frame families
- approved component bundle
- approved composite block set
- starter page and element design assets
- screen-family starter rule set

## Required Fields

- `themeSetId`
- `projectId`
- `themeId`
- `themeFamily`
- `designSystemProfileId`
- `visualDirection`
- `colorTokenBundleId`
- `fontBundleId`
- `spacingProfileId`
- `densityProfileId`
- `shellCompositionProfileSet`
- `pageFrameFamilySet`
- `componentCatalogSelection`
- `compositeBlockSet`
- `starterPageDesignSet`
- `starterElementDesignSet`
- `screenFamilyRuleSet`
- `responsiveProfileSet`
- `languageProfileSet`
- `accessibilityProfileId`
- `securityProfileId`
- `approvalState`
- `generatedBy`
- `version`

## Recommended Values

Recommended `generatedBy` values:

- `HUMAN`
- `AI`
- `HUMAN_WITH_AI`

Recommended `approvalState` values:

- `DRAFT`
- `REVIEW`
- `APPROVED`
- `SUPERSEDED`

## Validation Rules

Reject publish-ready theme sets when:

- token bundles are missing
- shell composition defaults are missing
- page-frame families are missing
- component bundle is empty
- starter design sets are empty
- screen-family starter rules are missing for governed page families
- accessibility profile is missing
- visual direction is not documented

## Use

`theme-set.json` should be consumable by:

- page-design generation
- element-design generation
- component palette filtering
- shell and frame preview
- parity and uniformity comparison
- screen-family rule generation
