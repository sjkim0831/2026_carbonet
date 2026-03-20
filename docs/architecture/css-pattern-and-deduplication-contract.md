# CSS Pattern And Deduplication Contract

Generated on 2026-03-21 for Resonance CSS uniformity and duplicate prevention.

## Goal

Prevent:

- duplicate CSS bundles
- page-local CSS drift
- missing style application after module attachment
- visually inconsistent modules that bypass theme, token, spacing, or slot rules

## Core Rule

All styles must resolve through governed CSS families:

- theme package
- token bundle
- spacing profile
- density profile
- slot profile
- approved component family classes

Do not attach arbitrary per-module CSS without mapping it to the approved style families.

## Required CSS Governance Fields

- `cssBundleId`
- `cssPatternFamilyId`
- `themeSetId`
- `tokenBundleSet`
- `spacingProfileId`
- `densityProfileId`
- `slotProfileSet`
- `componentFamilyCoverageSet`
- `dedupeHash`
- `applyScope`

## Allowed CSS Layers

1. base semantic layer
2. theme and token layer
3. spacing and density layer
4. component family layer
5. module extension layer

Only layer 5 may vary by module, and even that layer must:

- reuse existing component family classes when possible
- not override shell, page-frame, action-layout, or slot placements
- not redefine color or font tokens already covered by the theme set

## Dedupe Rules

Reject publish-ready CSS bundles when:

- same component family styles are duplicated under multiple unmanaged class names
- module CSS redefines an existing theme token value
- module CSS introduces page-local action-layout or slot-position overrides
- a bundle is attached without `dedupeHash` or family coverage declaration

## Missing-Style Prevention

Before module attach, verify:

- required CSS bundle exists
- required theme/token compatibility is declared
- required component family coverage is present
- runtime package matrix shows style bundle as attached

## Use

This contract should be consumed by:

- theme-set studio
- module attachment review
- runtime package matrix
- parity and uniformity review
- missing-style or duplicate-style repair flows
