# Project Version Management API Contracts

Generated on 2026-04-08 for project-installed artifact governance UI.

## Goal

Define the governed APIs used by the project management program for:

- installed-version lookup
- adapter change history lookup
- upgrade impact analysis
- release-unit lookup
- rollback execution
- project-pipeline lineage lookup
- artifact-centered deploy contract lookup

## 1. `project-version/overview`

Return the current installed version state for one project.

### Request

- `projectId`

### Response

- `projectId`
- `projectDisplayName`
- `activeRuntimeVersion`
- `activeCommonCoreVersion`
- `activeAdapterContractVersion`
- `activeAdapterArtifactVersion`
- `installedArtifactSet`
  - `artifactId`
  - `artifactFamily`
  - `installedArtifactVersion`
  - `installScope`
  - `activeYn`
- `installedPackageSet`
  - `packageId`
  - `packageType`
  - `installedVersion`
- `rollbackReadyReleaseUnitId`
- `projectPipelineSummary`
  - `pipelineRunId`
  - `releaseFamilyId`
  - `runtimePackageId`
  - `deployTraceId`
  - `rollbackTargetReleaseUnitId`

## 2. `project-version/adapter-history`

Return adapter change records for one project.

### Request

- `projectId`
- `page`
- `pageSize`

### Response

- `projectId`
- `itemSet`
  - `recordedAt`
  - `adapterContractVersion`
  - `adapterArtifactVersion`
  - `compatibilityClass`
  - `migrationRequiredYn`
  - `changedPortSet`
  - `changedDtoSet`
  - `mappingImpactSummary`
  - `relatedReleaseUnitId`
- `totalCount`

## 3. `project-version/release-units`

Return release-unit history for one project.

### Request

- `projectId`
- `page`
- `pageSize`

### Response

- `projectId`
- `itemSet`
  - `releaseUnitId`
  - `runtimePackageId`
  - `projectRuntimeVersion`
  - `adapterArtifactVersion`
  - `adapterContractVersion`
  - `commonArtifactSet`
  - `packageVersionSet`
  - `builtAt`
  - `approvedAt`
  - `rollbackTargetReleaseId`
  - `projectPipelineRef`
    - `pipelineRunId`
    - `releaseFamilyId`
    - `artifactManifestId`
- `totalCount`

## 4. `project-version/server-deploy-state`

Return current deployment state for one project.

### Request

- `projectId`

### Response

- `projectId`
- `serverStateSet`
  - `serverId`
  - `serverRole`
  - `activeReleaseUnitId`
  - `deployTraceId`
  - `deployedAt`
  - `healthStatus`
- `runtimeTruthYn`
  - `deploymentMode`
  - `releaseFamilyId`

## 5. `project-version/candidate-artifacts`

Return installable artifact versions on the current project artifact lines.

### Request

- `projectId`
- `page`
- `pageSize`

### Response

- `projectId`
- `activeAdapterContractVersion`
- `itemSet`
  - `artifactId`
  - `artifactFamily`
  - `artifactVersion`
  - `installedArtifactVersion`
  - `latestArtifactVersion`
  - `adapterContractVersion`
  - `apiContractVersion`
  - `manifestContractVersion`
  - `capabilityCatalogVersion`
  - `compatibilityClass`
  - `candidateState`
    - `INSTALLED`
    - `LATEST`
    - `REVIEW`
    - `AVAILABLE`
  - `upgradeReadyYn`
  - `stateSummary`
  - `publishedAt`
  - `installedYn`
- `totalCount`

## 6. `project-version/upgrade-impact`

Return the impact of moving one project from the current version set to a target artifact set.

### Request

- `projectId`
- `targetArtifactSet`
  - `artifactId`
  - `artifactVersion`
- `operator`

### Response

- `projectId`
- `currentVersionSet`
- `targetVersionSet`
- `compatibilityClass`
  - `ADAPTER_SAFE`
  - `ADAPTER_REVIEW_REQUIRED`
  - `ADAPTER_BREAKING`
- `adapterImpactSummary`
- `artifactDelta`
  - `artifactId`
  - `artifactVersion`
  - `adapterContractVersion`
  - `apiContractVersion`
  - `manifestContractVersion`
  - `capabilityCatalogVersion`
  - `compatibilityClass`
- `packageDelta`
- `runtimePackageDelta`
- `blockerSet`
- `rollbackTargetReleaseId`
- `upgradeReadyYn`

## 7. `project-version/apply-upgrade`

Persist the approved target version set and create a candidate release unit.

### Request

- `projectId`
- `targetArtifactSet`
- `operator`
- `approvalNote`

### Response

- `projectId`
- `releaseUnitId`
- `runtimePackageId`
- `appliedArtifactSet`
- `compatibilityClass`
- `deployReadyYn`
- `rollbackTargetReleaseId`
- `projectPipelineRef`
  - `pipelineRunId`
  - `releaseFamilyId`
  - `artifactManifestId`
  - `deploymentMode`

## 8. `project-version/rollback`

Roll back one project to a previously approved release unit.

### Request

- `projectId`
- `targetReleaseUnitId`
- `operator`
- `reason`

### Response

- `projectId`
- `rolledBackToReleaseUnitId`
- `runtimePackageId`
- `deployTraceId`
- `status`
  - `ROLLED_BACK`
  - `ROLLBACK_BLOCKED`
- `restoredArtifactSet`
  - `artifactId`
  - `artifactVersion`
  - `rollbackTargetVersion`
- `rollbackTargetReleaseId`
- `projectPipelineRef`
  - `pipelineRunId`
  - `rollbackTargetReleaseUnitId`
  - `rollbackMode`

## 8. `project-pipeline/status`

Return the latest governed pipeline snapshot for one project, release unit, or pipeline run.

### Request

- `projectId`
- `pipelineRunId`
- `releaseUnitId`

### Response

- `pipelineRunId`
- `projectId`
- `releaseUnitId`
- `runtimePackageId`
- `deployTraceId`
- `installableProduct`
  - `installableProductId`
  - `productType`
  - `packageId`
  - `packageFormat`
- `deployContract`
  - `artifactTargetSystem`
  - `deploymentTarget`
  - `deploymentMode`
  - `versionTrackingYn`
  - `releaseFamilyId`
- `artifactLineage`
  - `releaseFamilyId`
  - `releaseTrackVersion`
  - `artifactManifestId`
  - `rollbackAnchorReleaseUnitId`
- `validatorCheckSet`
- `stageSet`
- `artifactRegistryEntrySet`
- `rollbackPlan`
  - `rollbackTargetReleaseUnitId`
  - `rollbackMode`

## Rules

- no upgrade or rollback may proceed without `projectId`
- `ADAPTER_BREAKING` upgrades must be blocked unless an explicit migration path exists
- release-unit generation must preserve `releaseUnitId` and `runtimePackageId` identity across overview, deploy, and rollback views
- adapter history rows must remain queryable after newer common-core versions are published
- version-management views must preserve the same `releaseFamilyId`, `deployTraceId`, and `rollbackTargetReleaseUnitId` that appear in `project-pipeline/status`
- installable-product, deploy-contract, and artifact-lineage fields are governed identities and must not be renamed between compare, repair, version-management, and deploy views

## Implementation Mapping

Recommended backend ownership:

- `platform/versioncontrol/web`
- `platform/versioncontrol/service`
- `platform/versioncontrol/mapper`
- `platform/versioncontrol/model`

See:

- `docs/architecture/project-version-management-implementation-map.md`
