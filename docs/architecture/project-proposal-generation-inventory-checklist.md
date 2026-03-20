# Project Proposal Generation Inventory Checklist

Generated on 2026-03-21 for Resonance project-first proposal onboarding.

## Goal

Provide one repeatable checklist to verify that a new project created from a
proposal or requirement package produces all expected governed assets before
scaffold, build, deploy, and parity review.

## Core Rule

When a new project is created and a proposal is uploaded, Resonance must not
stop at "screen candidates found".

It must also count and verify:

- menu trees
- template lines
- page families
- screen family rules
- scenario families
- scenario steps
- page designs
- element designs
- page assemblies
- component families
- event bindings
- function bindings
- API bindings
- backend assets
- DB objects and SQL drafts
- help assets
- release-unit assets

## Required Inventory Summary

The onboarding flow should always produce these counts:

- `homeMenuNodeCount`
- `adminMenuNodeCount`
- `templateLineCount`
- `screenCandidateCount`
- `screenFamilyRuleCount`
- `scenarioFamilyCount`
- `publicScenarioFamilyCount`
- `adminScenarioFamilyCount`
- `childScenarioCount`
- `scenarioStepCount`
- `pageDesignCount`
- `elementDesignCount`
- `pageAssemblyCount`
- `componentFamilyCount`
- `eventBindingCount`
- `functionBindingCount`
- `apiBindingCount`
- `backendAssetCount`
- `dbObjectCount`
- `ddlDraftCount`
- `helpContentCount`
- `releaseAssetCount`
- `designOutputPackageCount`
- `missingAssetCount`
- `currentRuntimeComparableYn`
- `baselineComparableYn`
- `parityGapCount`
- `buildReadyYn`

## Identity Rule

Every inventory snapshot must retain the same:

- `projectId`
- `synthesisRunId`
- `mappingDraftId`

used by the mapping draft, matrix, scenario output, and design-output package
views.

## Checklist

Before the new project can proceed to build:

1. project registry entry exists
2. proposal synthesis run exists
3. home and admin menu trees are both created or explicitly waived
4. public and admin template lines are both created or explicitly waived
5. every page family maps to at least one approved screen family rule
6. every menu node maps to at least one scenario family or shared reference
7. every scenario family has all required child scenarios
8. every child scenario step has at least one page family
9. every page family has:
   - page design
   - element design set
   - page assembly
   - help content
10. every business action has:
   - event binding
   - function binding
   - API binding
   - backend chain target
11. every backend chain has DB ownership or explicit no-DB rationale
12. every DB object change has SQL draft and rollback draft
13. every generated asset appears in chain and matrix views
14. current proposal inventory count and generated inventory count are comparable

## Parity Focus

For high-value families such as:

- sign-in
- join
- board
- approval
- admin dashboard

the inventory should also show:

- `currentRuntimeComparableYn`
- `baselineComparableYn`
- `parityGapCount`

## Release Blockers

Block build when:

- menu nodes exist without scenario ownership
- page families exist without screen family rules
- scenario steps exist without page assemblies
- page assemblies exist without bindings
- backend assets exist without SQL review
- generated inventory count is lower than required proposal-derived coverage
