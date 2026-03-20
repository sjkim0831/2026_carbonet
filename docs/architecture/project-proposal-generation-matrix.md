# Project Proposal Generation Matrix

Generated on 2026-03-21 for Resonance project-level onboarding and proposal-driven generation.

## Goal

Define the matrix used to inspect all assets generated for one project after
proposal upload and before build or deploy.

## Matrix Axes

### Rows

- project
- proposal synthesis run
- menu tree
- menu node
- template line
- scenario family
- child scenario
- scenario step
- page family
- screen family rule
- page design
- element design set
- page assembly
- component family
- event binding
- function binding
- API binding
- backend chain
- DB object
- SQL draft
- help asset
- release asset

### Columns

- `ownedYn`
- `designedYn`
- `boundYn`
- `templateBoundYn`
- `familyRuleBoundYn`
- `buildReadyYn`
- `deployReadyYn`
- `parityReadyYn`
- `runtimeComparableYn`
- `repairNeededYn`
- `blockerCount`

## Required Compare Views

The matrix should support:

- proposal source vs generated result
- generated result vs current runtime
- baseline vs patch target
- project A vs project B family coverage

## Required Drill-Down

Operators should be able to open:

- scenario result-chain explorer
- backend chain explorer
- runtime package matrix
- repair workbench
- missing-asset queue

from any row.

## Rules

- no project is considered onboarded until the project proposal generation
  matrix is green for all required families
- row counts should be exportable as operator evidence
- matrix state should be preserved per project and per proposal baseline
