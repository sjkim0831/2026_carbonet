# Project Proposal Generation Matrix

Generated on 2026-03-21 for Resonance project-level onboarding and proposal-driven generation.

## Goal

Define the matrix used to inspect all assets generated for one project after
proposal upload and before build or deploy.

## Identity Rule

Every matrix snapshot must retain the same:

- `projectId`
- `synthesisRunId`
- `mappingDraftId`
- `builderInputReadyYn`
- `verifyInputReadyYn`
- `consumerLaneSet`

used by the mapping draft, inventory, scenario output, and design-output
package views.

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

- `assetFamily`
- `assetId`
- `assetCount`
- `templateLineId`
- `screenFamilyRuleId`
- `ownedYn`
- `designedYn`
- `boundYn`
- `templateBoundYn`
- `familyRuleBoundYn`
- `buildReadyYn`
- `builderInputReadyYn`
- `verifyInputReadyYn`
- `deployReadyYn`
- `parityReadyYn`
- `runtimeComparableYn`
- `repairNeededYn`
- `blockerCount`
- `traceSourceType`
- `traceSourceId`
- `drilldownTargetSet`

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

## Required Summary Counters

The matrix header should also expose enough project-level counts to cross-check
inventory and output views:

- `scenarioFamilyCount`
- `publicScenarioFamilyCount`
- `adminScenarioFamilyCount`
- `childScenarioCount`
- `scenarioStepCount`
- `designOutputPackageCount`
- `missingAssetCount`
- `parityGapCount`
- `buildReadyYn`

## Rules

- no project is considered onboarded until the project proposal generation
  matrix is green for all required families
- row counts should be exportable as operator evidence
- matrix state should be preserved per project and per proposal baseline
- matrix header counts must be reconcilable with inventory and scenario/design
  output views without changing identity keys
- the same matrix export must tell `04` and `09` whether builder and verify
  intake is ready without opening another identity context
