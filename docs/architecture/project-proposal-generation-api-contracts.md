# Project Proposal Generation API Contracts

Generated on 2026-03-21 for Resonance project onboarding and proposal-driven generation.

## Goal

Define the APIs used when a new project is created, a proposal is uploaded, and
menus, scenarios, design outputs, bindings, backend assets, and DB assets are
generated as one governed chain.

## 1. `project-onboarding/create`

Create the project shell before proposal synthesis begins.

Required request fields:

- `projectId`
- `projectName`
- `projectType`
- `runtimeTopologyProfileId`
- `defaultThemeSetId`

Required response fields:

- `projectId`
- `projectRegistryStatus`
- `homeMenuTreeId`
- `adminMenuTreeId`

## 2. `proposal-synthesis/upload-and-analyze`

Upload and analyze the proposal package for one project.

Required request fields:

- `projectId`
- `sourceDocumentSet`
- `sourceFormatSet`
- `requirementDomainSet`

Required response fields:

- `synthesisRunId`
- `mappingDraftId`
- `requirementItemCount`
- `menuCandidateSet`
- `templateLineCandidateSet`
- `scenarioFamilySet`
- `screenFamilyRuleCandidateSet`
- `designOutputCandidateSet`
- `componentCandidateSet`
- `apiCandidateSet`
- `dbCandidateSet`

## 3. `proposal-synthesis/mapping-draft`

Return the governed mapping draft extracted from one proposal baseline.

Required request fields:

- `projectId`
- `synthesisRunId`

Required response fields:

- `mappingDraftId`
- `mappingDraftStatus`
- `requirementItemSet`
- `menuTreeCandidate`
- `surfacePlan`
- `templateReusePlan`
- `templateLineCandidateSet`
- `screenFamilyRuleCandidateSet`
- `scenarioFamilyCandidateSet`
- `designOutputCandidateSet`
- `commonAssetPlanId`
- `projectAssetPlanId`
- `mappingConfidenceScore`

## 4. `project-proposal-generation/inventory`

Return generated counts for one proposal baseline.

Required request fields:

- `projectId`
- `synthesisRunId`

Required response fields:

- `homeMenuNodeCount`
- `adminMenuNodeCount`
- `templateLineCount`
- `screenCandidateCount`
- `scenarioFamilyCount`
- `publicScenarioFamilyCount`
- `adminScenarioFamilyCount`
- `childScenarioCount`
- `screenFamilyRuleCount`
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

## 5. `project-proposal-generation/matrix`

Return the matrix rows for one proposal-generated project.

Required request fields:

- `projectId`
- `synthesisRunId`

Required response fields:

- `matrixRowSet`
  - `assetFamily`
  - `assetId`
  - `templateLineId`
  - `screenFamilyRuleId`
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
  - `traceSourceType`
  - `traceSourceId`

## 6. `project-proposal-generation/design-outputs`

Return all mature design packages generated for one project baseline.

Required request fields:

- `projectId`
- `synthesisRunId`

Required response fields:

- `designOutputPackageSet`
  - `packageFamily`
  - `packageId`
  - `templateLineSet`
  - `screenFamilyRuleSet`
  - `canonicalSourceSet`
  - `scenarioFamilySet`
  - `approvalState`
  - `printableOutputPath`

## Rules

- no proposal-generated project may proceed to build without a green inventory
- matrix and inventory must use the same `projectId` and `synthesisRunId`
- mapping draft and inventory must use the same `projectId` and `synthesisRunId`
- scenario outputs and design outputs must remain queryable from the same
  project onboarding flow
- template lines and screen family rules must remain queryable from the same
  project onboarding flow
