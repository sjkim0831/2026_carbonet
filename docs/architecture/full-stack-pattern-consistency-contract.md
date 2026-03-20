# Full-Stack Pattern Consistency Contract

Generated on 2026-03-21 for Resonance cross-layer pattern uniformity.

## Goal

Guarantee that generated and deployed assets keep the same approved pattern family across:

- frontend shell, page frame, theme, spacing, slot profile, and component family
- event, function, API, backend, and DB chain
- SQL draft, migration draft, and runtime package assembly

This prevents visually uniform screens from hiding backend or DB pattern drift.

## Core Rule

Every governed release unit must prove that frontend, backend, DB, and package families are built from compatible approved pattern profiles.

No runtime package may mix:

- one page family with an unrelated backend chain family
- one slot-profile family with a conflicting action-layout family
- one SQL draft profile with a mismatched DB object profile
- one thin-runtime package with unstated common artifact substitutions

## Required Pattern Families

Each project-unit release should declare:

- `shellPatternFamilyId`
- `pageFrameFamilyId`
- `themeSetId`
- `spacingProfileId`
- `densityProfileId`
- `slotProfileSet`
- `actionLayoutProfileId`
- `componentFamilySet`
- `bindingPatternFamilyId`
- `backendChainPatternFamilyId`
- `dbObjectPatternFamilyId`
- `sqlDraftPatternFamilyId`
- `runtimePackagePatternFamilyId`

## Pattern Consistency Rules

### Frontend

- same page family should use one approved shell/page-frame/theme/action-layout family
- same component family in same page zone should use one slot profile family
- same popup/grid/search family should keep one internal block pattern

### Backend

- same screen family should map to one governed backend-chain family
- same function intent should resolve to one API contract family
- same API family should resolve to one controller/service/mapper chain family

### DB

- same feature family should use one DB object profile family
- same SQL generation family should preserve naming/comment/key/index conventions
- migration and rollback SQL should stay inside the same DB pattern family

### Runtime Package

- the release unit should expose one explicit runtime package pattern
- common jar and frontend bundle choices should not break the selected pattern family
- project-local thin runtime code should be the only allowed variable layer

## Validation Rules

Reject publish-ready or deploy-ready status when:

- any pattern family is missing
- frontend family and backend family are not mapped
- backend family and DB family are not mapped
- SQL draft family differs from DB object family without approved exception
- runtime package pattern does not match selected common lines and thin-runtime boundary

## Use

This contract should be consumed by:

- runtime package matrix
- parity compare
- repair workbench
- backend chain explorer
- DB object review
- deploy and rollback gates
