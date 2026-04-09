# Project Version Management API Examples

Generated on 2026-04-08 for project-installed artifact governance UI.

## `project-version/overview`

```json
{
  "projectId": "carbonet-main"
}
```

```json
{
  "projectId": "carbonet-main",
  "projectDisplayName": "Carbonet Main",
  "activeRuntimeVersion": "2026.04.08.1",
  "activeCommonCoreVersion": "1.2.1",
  "activeAdapterContractVersion": "v1",
  "activeAdapterArtifactVersion": "0.9.3",
  "installedArtifactSet": [
    {
      "artifactId": "resonance-common-core",
      "artifactFamily": "COMMON_CORE_JAR",
      "installedArtifactVersion": "1.2.1",
      "installScope": "PROJECT_RUNTIME",
      "activeYn": true
    },
    {
      "artifactId": "carbonet-main-adapter",
      "artifactFamily": "PROJECT_ADAPTER_JAR",
      "installedArtifactVersion": "0.9.3",
      "installScope": "PROJECT_RUNTIME",
      "activeYn": true
    }
  ],
  "installedPackageSet": [
    {
      "packageId": "member-process",
      "packageType": "PROCESS_PACKAGE",
      "installedVersion": "1.1.0"
    }
  ],
  "rollbackReadyReleaseUnitId": "ru-carbonet-main-20260408-01",
  "projectPipelineSummary": {
    "pipelineRunId": "pipe-7f312d20b71f4d4a",
    "releaseFamilyId": "release-family-carbonet-main",
    "runtimePackageId": "runtime-package-carbonet-main-version-governance-20260409113000",
    "deployTraceId": "deploy-release-unit-carbonet-main-20260409113000-a93bc812",
    "rollbackTargetReleaseUnitId": "release-unit-carbonet-main-20260408103000-rollback-anchor"
  }
}
```

## `project-version/adapter-history`

```json
{
  "projectId": "carbonet-main",
  "page": 1,
  "pageSize": 20
}
```

```json
{
  "projectId": "carbonet-main",
  "itemSet": [
    {
      "recordedAt": "2026-04-08T11:30:55+09:00",
      "adapterContractVersion": "v1",
      "adapterArtifactVersion": "0.9.3",
      "compatibilityClass": "ADAPTER_SAFE",
      "migrationRequiredYn": false,
      "changedPortSet": [
        "ScreenBuilderMenuCatalogPort"
      ],
      "changedDtoSet": [],
      "mappingImpactSummary": "Menu root binding normalization only.",
      "relatedReleaseUnitId": "ru-carbonet-main-20260408-01"
    }
  ],
  "totalCount": 1
}
```

## `project-version/upgrade-impact`

```json
{
  "projectId": "carbonet-main",
  "targetArtifactSet": [
    {
      "artifactId": "resonance-common-core",
      "artifactVersion": "1.2.2"
    }
  ],
  "operator": "sjkim"
}
```

```json
{
  "projectId": "carbonet-main",
  "currentVersionSet": {
    "commonCoreVersion": "1.2.1",
    "adapterContractVersion": "v1",
    "adapterArtifactVersion": "0.9.3"
  },
  "targetVersionSet": {
    "commonCoreVersion": "1.2.2",
    "adapterContractVersion": "v1"
  },
  "compatibilityClass": "ADAPTER_SAFE",
  "adapterImpactSummary": "No adapter rewrite required.",
  "packageDelta": [],
  "runtimePackageDelta": "common-core patch upgrade only",
  "blockerSet": [],
  "rollbackTargetReleaseId": "ru-carbonet-main-20260408-01",
  "upgradeReadyYn": true
}
```

## `project-version/apply-upgrade`

```json
{
  "projectId": "carbonet-main",
  "targetArtifactSet": [
    {
      "artifactId": "resonance-common-core",
      "artifactVersion": "1.2.2"
    }
  ],
  "operator": "sjkim",
  "approvalNote": "Patch upgrade after adapter-safe review."
}
```

```json
{
  "projectId": "carbonet-main",
  "releaseUnitId": "ru-carbonet-main-20260409-01",
  "runtimePackageId": "rp-carbonet-main-00032",
  "appliedArtifactSet": [
    {
      "artifactId": "resonance-common-core",
      "artifactVersion": "1.2.2",
      "rollbackTargetVersion": "1.2.1"
    }
  ],
  "compatibilityClass": "ADAPTER_SAFE",
  "deployReadyYn": true,
  "rollbackTargetReleaseId": "ru-carbonet-main-20260408-01",
  "projectPipelineRef": {
    "pipelineRunId": "pipe-7f312d20b71f4d4a",
    "releaseFamilyId": "release-family-carbonet-main",
    "artifactManifestId": "artifact-manifest-release-unit-carbonet-main-20260409-01",
    "deploymentMode": "ARTIFACT_CENTERED"
  }
}

## `project-pipeline/status`

```json
{
  "projectId": "carbonet-main"
}
```

```json
{
  "pipelineRunId": "pipe-7f312d20b71f4d4a",
  "projectId": "carbonet-main",
  "releaseUnitId": "release-unit-carbonet-main-20260409113000",
  "runtimePackageId": "runtime-package-carbonet-main-version-governance-20260409113000",
  "deployTraceId": "deploy-release-unit-carbonet-main-20260409113000-a93bc812",
  "installableProduct": {
    "installableProductId": "installable-carbonet-main",
    "productType": "INSTALLABLE_RUNTIME_PACKAGE",
    "packageId": "runtime-package-carbonet-main-version-governance-20260409113000",
    "packageFormat": "jar+properties+manifest"
  },
  "deployContract": {
    "artifactTargetSystem": "carbonet-general",
    "deploymentTarget": "ops-runtime-main-01",
    "deploymentMode": "ARTIFACT_CENTERED",
    "versionTrackingYn": true,
    "releaseFamilyId": "release-family-carbonet-main"
  },
  "artifactLineage": {
    "releaseFamilyId": "release-family-carbonet-main",
    "releaseTrackVersion": "release-family-carbonet-main-track-v1",
    "artifactManifestId": "artifact-manifest-release-unit-carbonet-main-20260409113000",
    "rollbackAnchorReleaseUnitId": "release-unit-carbonet-main-20260408103000-rollback-anchor"
  },
  "rollbackPlan": {
    "rollbackTargetReleaseUnitId": "release-unit-carbonet-main-20260408103000-rollback-anchor",
    "rollbackMode": "REINSTALL_PREVIOUS_ARTIFACT_SET"
  }
}
```

## `project-version/rollback`

```json
{
  "projectId": "carbonet-main",
  "targetReleaseUnitId": "ru-carbonet-main-20260408-01",
  "operator": "sjkim",
  "reason": "Rollback after deploy-state drift review."
}
```

```json
{
  "projectId": "carbonet-main",
  "rolledBackToReleaseUnitId": "ru-carbonet-main-20260408-01",
  "runtimePackageId": "rp-carbonet-main-00028",
  "deployTraceId": "dt-carbonet-main-7f31a2b0",
  "status": "ROLLED_BACK",
  "restoredArtifactSet": [
    {
      "artifactId": "resonance-common-core",
      "artifactVersion": "1.2.1",
      "rollbackTargetVersion": "1.2.2"
    }
  ],
  "rollbackTargetReleaseId": "ru-carbonet-main-20260407-02"
}
```
