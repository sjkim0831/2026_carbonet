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

## Template-Line Compatibility Contract

One approved theme set may support multiple template lines within the same project.

The compatibility checks should follow this minimum crosswalk:

| Theme set field | Template line field | Compatibility rule |
| --- | --- | --- |
| `themeSetId` | `themeSetId` | exact identity match is required |
| `projectId` | `projectId` | theme sets should not be attached across projects without explicit copy/version |
| `shellCompositionProfileSet` | `shellProfileSet` | the theme set must contain every shell profile referenced by the template line |
| `pageFrameFamilySet` | `pageFrameFamilySet` | the theme set must contain every page frame family referenced by the template line |
| `spacingProfileId` | `spacingProfileId` | exact match is required |
| `densityProfileId` | `densityProfileId` | exact match is required |
| `componentCatalogSelection` | `componentFamilySet` | approved component coverage must include the families used by the template line |
| `screenFamilyRuleSet` | `scenarioFamilySet` | screen-family rules must cover all governed scenario families bound by the template line |

Theme-set split guidance:

- keep one shared theme set when public/admin lines intentionally share visual direction, token bundles, spacing, density, shell composition, and core component rules
- split the theme set when visual-system governance changes, not merely because routes or menu trees diverge
- prefer template-line versioning over theme-set versioning for namespace, menu, scenario, page-family, or backend facade changes
- if admin parity requires extra component families, update `componentCatalogSelection` only when those components are approved for the whole governed theme-set version

## Operator Review Checks

Before marking a theme set `APPROVED`, confirm:

- at least one public or admin template line can bind without missing shell/frame/component coverage
- the selected screen-family rules explicitly cover the scenario families expected by current template lines
- element design sets referencing this theme set remain compatible with the same spacing, density, accessibility, and security profiles

## Use

`theme-set.json` should be consumable by:

- page-design generation
- element-design generation
- component palette filtering
- shell and frame preview
- parity and uniformity comparison
- screen-family rule generation
