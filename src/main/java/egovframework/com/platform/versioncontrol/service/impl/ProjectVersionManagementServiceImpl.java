package egovframework.com.platform.versioncontrol.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.platform.versioncontrol.mapper.ProjectVersionManagementMapper;
import egovframework.com.platform.versioncontrol.model.ProjectApplyUpgradeRequest;
import egovframework.com.platform.versioncontrol.model.ProjectRollbackRequest;
import egovframework.com.platform.versioncontrol.model.ProjectUpgradeImpactRequest;
import egovframework.com.platform.versioncontrol.service.ProjectVersionManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectVersionManagementServiceImpl implements ProjectVersionManagementService {

    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE = new TypeReference<LinkedHashMap<String, Object>>() {};
    private static final DateTimeFormatter VERSION_STAMP = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final ObjectMapper objectMapper;
    private final ProjectVersionManagementMapper projectVersionManagementMapper;

    @Value("${carbonet.platform.runtimecontrol.project-pipeline-store:/tmp/carbonet-resonance-project-pipeline.jsonl}")
    private String projectPipelineStore;

    @Value("${carbonet.platform.versioncontrol.apply-store:/tmp/carbonet-version-apply.jsonl}")
    private String applyStore;

    @Value("${carbonet.platform.versioncontrol.rollback-store:/tmp/carbonet-version-rollback.jsonl}")
    private String rollbackStore;

    @Override
    public Map<String, Object> getOverview(String projectId) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        if (canUseDatabase()) {
            Map<String, Object> databaseOverview = loadOverviewFromDatabase(normalizedProjectId);
            if (databaseOverview != null) {
                return databaseOverview;
            }
        }
        Map<String, Object> pipeline = getLatestPipeline(normalizedProjectId);

        Map<String, Object> response = orderedMap();
        response.put("projectId", normalizedProjectId);
        response.put("projectDisplayName", titleCase(normalizedProjectId));
        response.put("activeRuntimeVersion", value(pipeline, "runtimePackageId"));
        response.put("activeCommonCoreVersion", valueMap(pipeline, "artifactVersionSet").get("common-core"));
        response.put("activeAdapterContractVersion", valueMap(pipeline, "artifactVersionSet").get(normalizedProjectId + "-adapter-contract"));
        response.put("activeAdapterArtifactVersion", valueMap(pipeline, "artifactVersionSet").get(normalizedProjectId + "-adapter-artifact"));
        response.put("installedArtifactSet", installedArtifactSet(normalizedProjectId, pipeline));
        response.put("installedPackageSet", installedPackageSet(pipeline));
        response.put("rollbackReadyReleaseUnitId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"));
        response.put("projectPipelineSummary", orderedMap(
                "pipelineRunId", value(pipeline, "pipelineRunId"),
                "releaseFamilyId", valueMap(pipeline, "artifactLineage").get("releaseFamilyId"),
                "runtimePackageId", value(pipeline, "runtimePackageId"),
                "deployTraceId", value(pipeline, "deployTraceId"),
                "rollbackTargetReleaseUnitId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId")));
        return response;
    }

    @Override
    public Map<String, Object> getAdapterHistory(String projectId, int page, int pageSize) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        if (canUseDatabase()) {
            List<Map<String, Object>> rows = loadAdapterHistoryFromDatabase(normalizedProjectId);
            if (!rows.isEmpty()) {
                return pagedListPayload(normalizedProjectId, rows, page, pageSize);
            }
        }
        Map<String, Object> pipeline = getLatestPipeline(normalizedProjectId);
        Map<String, Object> artifactVersionSet = valueMap(pipeline, "artifactVersionSet");
        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(orderedMap(
                "recordedAt", value(pipeline, "occurredAt"),
                "adapterContractVersion", artifactVersionSet.get(normalizedProjectId + "-adapter-contract"),
                "adapterArtifactVersion", artifactVersionSet.get(normalizedProjectId + "-adapter-artifact"),
                "compatibilityClass", "ADAPTER_SAFE",
                "migrationRequiredYn", Boolean.FALSE,
                "changedPortSet", stringList("screen-binding", "menu-binding"),
                "changedDtoSet", stringList("ProjectRuntimeContract", "ProjectDeployContract"),
                "mappingImpactSummary", "Adapter boundary remains governed under common/project split.",
                "relatedReleaseUnitId", value(pipeline, "releaseUnitId")));
        rows.add(orderedMap(
                "recordedAt", minusDays(1),
                "adapterContractVersion", previousVersion(artifactVersionSet.get(normalizedProjectId + "-adapter-contract")),
                "adapterArtifactVersion", previousVersion(artifactVersionSet.get(normalizedProjectId + "-adapter-artifact")),
                "compatibilityClass", "ADAPTER_REVIEW_REQUIRED",
                "migrationRequiredYn", Boolean.TRUE,
                "changedPortSet", stringList("event-binding"),
                "changedDtoSet", stringList("RepairApplyContract"),
                "mappingImpactSummary", "Legacy binding path needed review before installable packaging.",
                "relatedReleaseUnitId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId")));
        return pagedListPayload(normalizedProjectId, rows, page, pageSize);
    }

    @Override
    public Map<String, Object> getReleaseUnits(String projectId, int page, int pageSize) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        if (canUseDatabase()) {
            List<Map<String, Object>> rows = loadReleaseUnitsFromDatabase(normalizedProjectId);
            if (!rows.isEmpty()) {
                return pagedListPayload(normalizedProjectId, rows, page, pageSize);
            }
        }
        Map<String, Object> pipeline = getLatestPipeline(normalizedProjectId);
        Map<String, Object> artifactVersionSet = valueMap(pipeline, "artifactVersionSet");
        Map<String, Object> artifactLineage = valueMap(pipeline, "artifactLineage");

        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(orderedMap(
                "releaseUnitId", value(pipeline, "releaseUnitId"),
                "runtimePackageId", value(pipeline, "runtimePackageId"),
                "projectRuntimeVersion", value(pipeline, "runtimePackageId"),
                "adapterArtifactVersion", artifactVersionSet.get(normalizedProjectId + "-adapter-artifact"),
                "adapterContractVersion", artifactVersionSet.get(normalizedProjectId + "-adapter-contract"),
                "commonArtifactSet", value(pipeline, "commonArtifactSet"),
                "packageVersionSet", artifactVersionSet,
                "builtAt", value(pipeline, "occurredAt"),
                "approvedAt", value(pipeline, "occurredAt"),
                "rollbackTargetReleaseId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"),
                "projectPipelineRef", orderedMap(
                        "pipelineRunId", value(pipeline, "pipelineRunId"),
                        "releaseFamilyId", artifactLineage.get("releaseFamilyId"),
                        "artifactManifestId", artifactLineage.get("artifactManifestId"))));
        rows.add(orderedMap(
                "releaseUnitId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"),
                "runtimePackageId", previousVersion(value(pipeline, "runtimePackageId")),
                "projectRuntimeVersion", previousVersion(value(pipeline, "runtimePackageId")),
                "adapterArtifactVersion", previousVersion(artifactVersionSet.get(normalizedProjectId + "-adapter-artifact")),
                "adapterContractVersion", previousVersion(artifactVersionSet.get(normalizedProjectId + "-adapter-contract")),
                "commonArtifactSet", value(pipeline, "commonArtifactSet"),
                "packageVersionSet", artifactVersionSet,
                "builtAt", minusDays(2),
                "approvedAt", minusDays(2),
                "rollbackTargetReleaseId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"),
                "projectPipelineRef", orderedMap(
                        "pipelineRunId", value(pipeline, "pipelineRunId"),
                        "releaseFamilyId", artifactLineage.get("releaseFamilyId"),
                        "artifactManifestId", artifactLineage.get("artifactManifestId"))));
        return pagedListPayload(normalizedProjectId, rows, page, pageSize);
    }

    @Override
    public Map<String, Object> getServerDeployState(String projectId) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        if (canUseDatabase()) {
            List<Map<String, Object>> serverStateSet = loadServerStateFromDatabase(normalizedProjectId);
            if (!serverStateSet.isEmpty()) {
                Map<String, Object> response = orderedMap();
                response.put("projectId", normalizedProjectId);
                response.put("serverStateSet", serverStateSet);
                return response;
            }
        }
        Map<String, Object> pipeline = getLatestPipeline(normalizedProjectId);
        Map<String, Object> deployContract = valueMap(pipeline, "deployContract");
        Map<String, Object> artifactLineage = valueMap(pipeline, "artifactLineage");

        List<Map<String, Object>> serverStateSet = new ArrayList<Map<String, Object>>();
        String deploymentTarget = firstNonBlank(value(deployContract, "deploymentTarget"), "ops-runtime-main-01");
        String targetRole = resolveDeploymentRole(deploymentTarget);
        serverStateSet.add(serverState("ops-runtime-preview-01", "PREVIEW", pipeline, deployContract, artifactLineage, healthStatusForRole("PREVIEW", targetRole), true));
        serverStateSet.add(serverState("ops-runtime-stage-01", "STAGE", pipeline, deployContract, artifactLineage, healthStatusForRole("STAGE", targetRole), !"PREVIEW".equals(targetRole)));
        serverStateSet.add(serverState("ops-runtime-main-01", "PRIMARY", pipeline, deployContract, artifactLineage, healthStatusForRole("PRIMARY", targetRole), "PRIMARY".equals(targetRole)));

        Map<String, Object> response = orderedMap();
        response.put("projectId", normalizedProjectId);
        response.put("serverStateSet", serverStateSet);
        return response;
    }

    @Override
    public Map<String, Object> getCandidateArtifacts(String projectId, int page, int pageSize) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        if (canUseDatabase()) {
            List<Map<String, Object>> rows = loadCandidateArtifactsFromDatabase(normalizedProjectId);
            if (!rows.isEmpty()) {
                return pagedListPayload(normalizedProjectId, rows, page, pageSize);
            }
        }
        Map<String, Object> pipeline = getLatestPipeline(normalizedProjectId);
        Map<String, Object> versions = valueMap(pipeline, "artifactVersionSet");
        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(candidateArtifact("common-core", versions.get("common-core"), "COMMON_CORE", "LATEST"));
        rows.add(candidateArtifact(normalizedProjectId + "-adapter-contract", versions.get(normalizedProjectId + "-adapter-contract"), "ADAPTER_CONTRACT", "LATEST"));
        rows.add(candidateArtifact(normalizedProjectId + "-adapter-artifact", versions.get(normalizedProjectId + "-adapter-artifact"), "ADAPTER_ARTIFACT", "LATEST"));
        rows.add(candidateArtifact(value(pipeline, "runtimePackageId"), value(pipeline, "runtimePackageId"), "INSTALLABLE_PRODUCT", "PACKAGE"));
        return pagedListPayload(normalizedProjectId, rows, page, pageSize);
    }

    @Override
    public Map<String, Object> analyzeUpgradeImpact(ProjectUpgradeImpactRequest request) throws Exception {
        String projectId = required(request.getProjectId(), "projectId");
        Map<String, Object> pipeline = getLatestPipeline(projectId);
        List<Map<String, Object>> targetArtifactSet = normalizeArtifactSet(request.getTargetArtifactSet());

        Map<String, Object> currentVersionSet = valueMap(pipeline, "artifactVersionSet");
        Map<String, Object> targetVersionSet = orderedMap();
        for (Map<String, Object> item : targetArtifactSet) {
            targetVersionSet.put(String.valueOf(item.get("artifactId")), item.get("artifactVersion"));
        }

        List<String> blockerSet = new ArrayList<String>();
        boolean breaking = false;
        for (Map<String, Object> item : targetArtifactSet) {
            String artifactId = String.valueOf(item.get("artifactId"));
            String artifactVersion = String.valueOf(item.get("artifactVersion"));
            if (artifactId.contains("adapter") && artifactVersion.toLowerCase().contains("breaking")) {
                blockerSet.add("Breaking adapter artifact requires explicit migration path.");
                breaking = true;
            }
        }

        Map<String, Object> response = orderedMap();
        response.put("projectId", projectId);
        response.put("currentVersionSet", currentVersionSet);
        response.put("targetVersionSet", targetVersionSet);
        response.put("compatibilityClass", breaking ? "ADAPTER_BREAKING" : "ADAPTER_SAFE");
        response.put("adapterImpactSummary", breaking
                ? "Selected artifact set crosses a governed adapter boundary and is blocked."
                : "Target artifact set stays within the governed common/project adapter contract.");
        response.put("packageDelta", packageDelta(targetArtifactSet));
        response.put("runtimePackageDelta", value(pipeline, "runtimePackageId") + " -> " + nextVersion(value(pipeline, "runtimePackageId")));
        response.put("blockerSet", blockerSet);
        response.put("rollbackTargetReleaseId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"));
        response.put("upgradeReadyYn", Boolean.valueOf(!breaking));
        return response;
    }

    @Override
    public Map<String, Object> applyUpgrade(ProjectApplyUpgradeRequest request) throws Exception {
        String projectId = required(request.getProjectId(), "projectId");
        Map<String, Object> pipeline = getLatestPipeline(projectId);
        List<Map<String, Object>> targetArtifactSet = normalizeArtifactSet(request.getTargetArtifactSet());
        String releaseUnitId = buildReleaseUnitId("rel", projectId);
        String runtimePackageId = buildRuntimePackageId("pkg", projectId);

        Map<String, Object> response = orderedMap();
        response.put("projectId", projectId);
        response.put("releaseUnitId", releaseUnitId);
        response.put("runtimePackageId", runtimePackageId);
        response.put("appliedArtifactSet", targetArtifactSet);
        response.put("compatibilityClass", "ADAPTER_SAFE");
        response.put("deployReadyYn", Boolean.TRUE);
        response.put("rollbackTargetReleaseId", value(pipeline, "releaseUnitId"));
        response.put("projectPipelineRef", orderedMap(
                "pipelineRunId", value(pipeline, "pipelineRunId"),
                "releaseFamilyId", valueMap(pipeline, "artifactLineage").get("releaseFamilyId"),
                "artifactManifestId", valueMap(pipeline, "artifactLineage").get("artifactManifestId"),
                "deploymentMode", valueMap(pipeline, "deployContract").get("deploymentMode")));
        response.put("operator", orDefault(request.getOperator(), "system"));
        response.put("approvalNote", orDefault(request.getApprovalNote(), ""));
        response.put("occurredAt", now());
        if (canUseDatabase()) {
            persistApplyUpgradeToDatabase(projectId, releaseUnitId, runtimePackageId, response, targetArtifactSet, pipeline, request);
        }
        appendJsonLine(applyStore, response);
        return response;
    }

    @Override
    public Map<String, Object> rollbackProject(ProjectRollbackRequest request) throws Exception {
        String projectId = required(request.getProjectId(), "projectId");
        String targetReleaseUnitId = required(request.getTargetReleaseUnitId(), "targetReleaseUnitId");
        Map<String, Object> pipeline = getLatestPipeline(projectId);

        Map<String, Object> response = orderedMap();
        response.put("projectId", projectId);
        response.put("rolledBackToReleaseUnitId", targetReleaseUnitId);
        response.put("runtimePackageId", previousVersion(value(pipeline, "runtimePackageId")));
        response.put("deployTraceId", "deploy-" + shortId());
        response.put("status", "ROLLED_BACK");
        response.put("projectPipelineRef", orderedMap(
                "pipelineRunId", value(pipeline, "pipelineRunId"),
                "rollbackTargetReleaseUnitId", valueMap(pipeline, "rollbackPlan").get("rollbackTargetReleaseUnitId"),
                "rollbackMode", valueMap(pipeline, "rollbackPlan").get("rollbackMode")));
        response.put("operator", orDefault(request.getOperator(), "system"));
        response.put("reason", orDefault(request.getReason(), ""));
        response.put("occurredAt", now());
        if (canUseDatabase()) {
            persistRollbackToDatabase(projectId, targetReleaseUnitId, response, request);
        }
        appendJsonLine(rollbackStore, response);
        return response;
    }

    private void persistApplyUpgradeToDatabase(
            String projectId,
            String releaseUnitId,
            String runtimePackageId,
            Map<String, Object> response,
            List<Map<String, Object>> targetArtifactSet,
            Map<String, Object> pipeline,
            ProjectApplyUpgradeRequest request
    ) throws Exception {
        Map<String, Object> packageVersionSet = new LinkedHashMap<String, Object>(valueMap(pipeline, "artifactVersionSet"));
        for (Map<String, Object> artifact : targetArtifactSet) {
            packageVersionSet.put(String.valueOf(artifact.get("artifactId")), artifact.get("artifactVersion"));
        }
        packageVersionSet.put("runtime-package", runtimePackageId);

        String adapterArtifactVersion = findArtifactVersion(targetArtifactSet, projectId + "-adapter-artifact", String.valueOf(packageVersionSet.get(projectId + "-adapter-artifact")));
        String adapterContractVersion = findArtifactVersion(targetArtifactSet, projectId + "-adapter-contract", String.valueOf(packageVersionSet.get(projectId + "-adapter-contract")));

        projectVersionManagementMapper.insertReleaseUnitRegistry(orderedMap(
                "releaseUnitId", releaseUnitId,
                "projectId", projectId,
                "runtimePackageId", runtimePackageId,
                "projectRuntimeVersion", runtimePackageId,
                "adapterArtifactVersion", adapterArtifactVersion,
                "adapterContractVersion", adapterContractVersion,
                "commonArtifactSetJson", objectMapper.writeValueAsString(value(pipeline, "commonArtifactSet").isEmpty() ? stringList("common-core") : pipeline.get("commonArtifactSet")),
                "packageVersionSetJson", objectMapper.writeValueAsString(packageVersionSet),
                "rollbackTargetReleaseId", value(pipeline, "releaseUnitId"),
                "approvedBy", orDefault(request.getOperator(), "system")));

        List<Map<String, Object>> currentInstalls = projectVersionManagementMapper.selectInstalledArtifacts(projectId);
        Map<String, String> rollbackVersionByArtifactId = new LinkedHashMap<String, String>();
        for (Map<String, Object> installed : currentInstalls) {
            rollbackVersionByArtifactId.put(value(installed, "artifactId"), value(installed, "installedArtifactVersion"));
        }
        projectVersionManagementMapper.deactivateProjectArtifactInstalls(projectId);

        for (Map<String, Object> artifact : targetArtifactSet) {
            String artifactId = String.valueOf(artifact.get("artifactId"));
            String artifactVersion = String.valueOf(artifact.get("artifactVersion"));
            Map<String, Object> artifactVersionRow = projectVersionManagementMapper.selectArtifactVersionByKey(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion));
            if (artifactVersionRow == null) {
                continue;
            }
            projectVersionManagementMapper.insertProjectArtifactInstall(orderedMap(
                    "projectArtifactInstallId", "pai-" + shortId(),
                    "projectId", projectId,
                    "artifactVersionId", value(artifactVersionRow, "artifactVersionId"),
                    "installScope", resolveInstallScope(artifactId),
                    "releaseUnitId", releaseUnitId,
                    "rollbackTargetVersion", rollbackVersionByArtifactId.get(artifactId),
                    "installedBy", orDefault(request.getOperator(), "system")));
        }

        if (hasText(adapterArtifactVersion) || hasText(adapterContractVersion)) {
            projectVersionManagementMapper.insertAdapterChangeLog(orderedMap(
                    "adapterChangeId", "chg-" + shortId(),
                    "projectId", projectId,
                    "adapterArtifactVersion", adapterArtifactVersion,
                    "adapterContractVersion", adapterContractVersion,
                    "changedPortSetJson", objectMapper.writeValueAsString(stringList("screen-binding", "menu-binding")),
                    "changedDtoSetJson", objectMapper.writeValueAsString(stringList("ProjectRuntimeContract", "ProjectDeployContract")),
                    "mappingImpactSummary", "Upgrade apply persisted into governed release unit registry.",
                    "compatibilityClass", "ADAPTER_SAFE",
                    "migrationRequiredYn", "N",
                    "relatedReleaseUnitId", releaseUnitId,
                    "recordedBy", orDefault(request.getOperator(), "system")));
        }

        for (Map<String, Object> serverState : buildDeploymentStateRecords(
                projectId,
                releaseUnitId,
                "deploy-" + shortId(),
                "ops-runtime-main-01",
                orDefault(request.getOperator(), "system"),
                false)) {
            projectVersionManagementMapper.insertServerDeploymentState(serverState);
        }
    }

    private void persistRollbackToDatabase(
            String projectId,
            String targetReleaseUnitId,
            Map<String, Object> response,
            ProjectRollbackRequest request
    ) throws Exception {
        Map<String, Object> targetReleaseUnit = projectVersionManagementMapper.selectReleaseUnitById(targetReleaseUnitId);
        if (targetReleaseUnit == null) {
            return;
        }
        Map<String, Object> packageVersionSet = parseJsonObject(targetReleaseUnit.get("packageVersionSetJson"));
        List<Map<String, Object>> currentInstalls = projectVersionManagementMapper.selectInstalledArtifacts(projectId);
        Map<String, String> rollbackVersionByArtifactId = new LinkedHashMap<String, String>();
        for (Map<String, Object> installed : currentInstalls) {
            rollbackVersionByArtifactId.put(value(installed, "artifactId"), value(installed, "installedArtifactVersion"));
        }
        projectVersionManagementMapper.deactivateProjectArtifactInstalls(projectId);

        for (Map.Entry<String, Object> entry : packageVersionSet.entrySet()) {
            String artifactId = entry.getKey();
            String artifactVersion = String.valueOf(entry.getValue());
            if ("runtime-package".equals(artifactId) || !hasText(artifactVersion)) {
                continue;
            }
            Map<String, Object> artifactVersionRow = projectVersionManagementMapper.selectArtifactVersionByKey(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion));
            if (artifactVersionRow == null) {
                continue;
            }
            projectVersionManagementMapper.insertProjectArtifactInstall(orderedMap(
                    "projectArtifactInstallId", "pai-" + shortId(),
                    "projectId", projectId,
                    "artifactVersionId", value(artifactVersionRow, "artifactVersionId"),
                    "installScope", resolveInstallScope(artifactId),
                    "releaseUnitId", targetReleaseUnitId,
                    "rollbackTargetVersion", rollbackVersionByArtifactId.get(artifactId),
                    "installedBy", orDefault(request.getOperator(), "system")));
        }

        for (Map<String, Object> serverState : buildDeploymentStateRecords(
                projectId,
                targetReleaseUnitId,
                value(response, "deployTraceId"),
                "ops-runtime-main-01",
                orDefault(request.getOperator(), "system"),
                true)) {
            projectVersionManagementMapper.insertServerDeploymentState(serverState);
        }
    }

    private Map<String, Object> getLatestPipeline(String projectId) throws Exception {
        Path path = Paths.get(projectPipelineStore);
        if (Files.exists(path)) {
            List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            for (int i = lines.size() - 1; i >= 0; i--) {
                String line = lines.get(i).trim();
                if (line.isEmpty()) {
                    continue;
                }
                Map<String, Object> record = objectMapper.readValue(line, MAP_TYPE);
                if (projectId.equals(String.valueOf(record.get("projectId")))) {
                    return record;
                }
            }
        }
        return syntheticPipeline(projectId);
    }

    private boolean canUseDatabase() {
        try {
            return projectVersionManagementMapper != null
                    && projectVersionManagementMapper.countArtifactVersionRegistry() >= 0
                    && projectVersionManagementMapper.countProjectArtifactInstall() >= 0
                    && projectVersionManagementMapper.countReleaseUnitRegistry() >= 0
                    && projectVersionManagementMapper.countServerDeploymentState() >= 0;
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> loadOverviewFromDatabase(String projectId) throws Exception {
        List<Map<String, Object>> installedArtifacts = projectVersionManagementMapper.selectInstalledArtifacts(projectId);
        List<Map<String, Object>> releaseUnits = projectVersionManagementMapper.selectReleaseUnits(projectId);
        Map<String, Object> projectRegistry = projectVersionManagementMapper.selectProjectRegistry(projectId);
        if (installedArtifacts.isEmpty() && releaseUnits.isEmpty() && projectRegistry == null) {
            return null;
        }

        Map<String, Object> latestReleaseUnit = releaseUnits.isEmpty() ? orderedMap() : releaseUnits.get(0);
        Map<String, Object> packageVersionSet = parseJsonObject(latestReleaseUnit.get("packageVersionSetJson"));
        Map<String, Object> response = orderedMap();
        response.put("projectId", projectId);
        response.put("projectDisplayName", firstNonBlank(
                value(projectRegistry, "projectName"),
                titleCase(projectId)));
        response.put("activeRuntimeVersion", firstNonBlank(
                value(latestReleaseUnit, "runtimePackageId"),
                value(packageVersionSet, "runtime-package")));
        response.put("activeCommonCoreVersion", resolveInstalledVersion(installedArtifacts, "COMMON_CORE", packageVersionSet.get("common-core")));
        response.put("activeAdapterContractVersion", firstNonBlank(
                value(latestReleaseUnit, "adapterContractVersion"),
                String.valueOf(packageVersionSet.get(projectId + "-adapter-contract"))));
        response.put("activeAdapterArtifactVersion", firstNonBlank(
                value(latestReleaseUnit, "adapterArtifactVersion"),
                String.valueOf(packageVersionSet.get(projectId + "-adapter-artifact"))));
        response.put("installedArtifactSet", installedArtifacts);
        response.put("installedPackageSet", databaseInstalledPackages(latestReleaseUnit));
        response.put("rollbackReadyReleaseUnitId", value(latestReleaseUnit, "rollbackTargetReleaseId"));
        response.put("projectPipelineSummary", orderedMap(
                "pipelineRunId", "",
                "releaseFamilyId", projectId + "-family",
                "runtimePackageId", value(latestReleaseUnit, "runtimePackageId"),
                "deployTraceId", "",
                "rollbackTargetReleaseUnitId", value(latestReleaseUnit, "rollbackTargetReleaseId")));
        return response;
    }

    private List<Map<String, Object>> loadAdapterHistoryFromDatabase(String projectId) throws Exception {
        List<Map<String, Object>> rows = projectVersionManagementMapper.selectAdapterHistory(projectId);
        List<Map<String, Object>> normalized = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> row : rows) {
            Map<String, Object> item = orderedMap();
            item.put("recordedAt", value(row, "recordedAt"));
            item.put("adapterContractVersion", value(row, "adapterContractVersion"));
            item.put("adapterArtifactVersion", value(row, "adapterArtifactVersion"));
            item.put("compatibilityClass", value(row, "compatibilityClass"));
            item.put("migrationRequiredYn", truthy(row.get("migrationRequiredYn")));
            item.put("changedPortSet", parseJsonArray(row.get("changedPortSetJson")));
            item.put("changedDtoSet", parseJsonArray(row.get("changedDtoSetJson")));
            item.put("mappingImpactSummary", value(row, "mappingImpactSummary"));
            item.put("relatedReleaseUnitId", value(row, "relatedReleaseUnitId"));
            normalized.add(item);
        }
        return normalized;
    }

    private List<Map<String, Object>> loadReleaseUnitsFromDatabase(String projectId) throws Exception {
        List<Map<String, Object>> rows = projectVersionManagementMapper.selectReleaseUnits(projectId);
        List<Map<String, Object>> normalized = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> row : rows) {
            Map<String, Object> packageVersionSet = parseJsonObject(row.get("packageVersionSetJson"));
            normalized.add(orderedMap(
                    "releaseUnitId", value(row, "releaseUnitId"),
                    "runtimePackageId", value(row, "runtimePackageId"),
                    "projectRuntimeVersion", value(row, "projectRuntimeVersion"),
                    "adapterArtifactVersion", value(row, "adapterArtifactVersion"),
                    "adapterContractVersion", value(row, "adapterContractVersion"),
                    "commonArtifactSet", parseJsonArray(row.get("commonArtifactSetJson")),
                    "packageVersionSet", packageVersionSet,
                    "builtAt", value(row, "builtAt"),
                    "approvedAt", value(row, "approvedAt"),
                    "rollbackTargetReleaseId", value(row, "rollbackTargetReleaseId"),
                    "projectPipelineRef", orderedMap(
                            "pipelineRunId", "",
                            "releaseFamilyId", projectId + "-family",
                            "artifactManifestId", "")));
        }
        return normalized;
    }

    private List<Map<String, Object>> loadServerStateFromDatabase(String projectId) throws Exception {
        List<Map<String, Object>> rows = projectVersionManagementMapper.selectServerDeploymentState(projectId);
        Map<String, Map<String, Object>> latestByRole = new LinkedHashMap<String, Map<String, Object>>();
        for (Map<String, Object> row : rows) {
            String serverRole = value(row, "serverRole");
            if (!latestByRole.containsKey(serverRole)) {
                latestByRole.put(serverRole, row);
            }
        }

        List<Map<String, Object>> normalized = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> row : latestByRole.values()) {
            normalized.add(orderedMap(
                    "serverId", value(row, "serverId"),
                    "serverRole", value(row, "serverRole"),
                    "activeReleaseUnitId", value(row, "activeReleaseUnitId"),
                    "deployTraceId", value(row, "deployTraceId"),
                    "deployedAt", value(row, "deployedAt"),
                    "healthStatus", value(row, "healthStatus"),
                    "runtimeTruthYn", Boolean.valueOf(isRuntimeTruthRole(value(row, "serverRole"), value(row, "healthStatus"))),
                    "deploymentMode", "ARTIFACT_LINEAGE_CONTROLLED",
                    "releaseFamilyId", projectId + "-family"));
        }
        return normalized;
    }

    private List<Map<String, Object>> loadCandidateArtifactsFromDatabase(String projectId) throws Exception {
        Map<String, Object> params = orderedMap("projectId", projectId);
        List<Map<String, Object>> rows = projectVersionManagementMapper.selectCandidateArtifacts(params);
        List<Map<String, Object>> normalized = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> row : rows) {
            normalized.add(orderedMap(
                    "artifactId", value(row, "artifactId"),
                    "artifactVersion", value(row, "artifactVersion"),
                    "artifactType", value(row, "artifactType"),
                    "artifactFamily", value(row, "artifactFamily"),
                    "compatibilityStatus", value(row, "compatibilityStatus"),
                    "publishedYn", "Y".equalsIgnoreCase(value(row, "publishedYn")),
                    "publishedAt", value(row, "publishedAt"),
                    "builtAt", value(row, "builtAt"),
                    "adapterContractVersion", value(row, "adapterContractVersion"),
                    "commonCoreVersion", value(row, "commonCoreVersion"),
                    "apiContractVersion", value(row, "apiContractVersion"),
                    "manifestContractVersion", value(row, "manifestContractVersion"),
                    "capabilityCatalogVersion", value(row, "capabilityCatalogVersion")));
        }
        return normalized;
    }

    private Map<String, Object> syntheticPipeline(String projectId) {
        String releaseUnitId = buildReleaseUnitId("rel", projectId);
        String runtimePackageId = buildRuntimePackageId("pkg", projectId);
        Map<String, Object> artifactVersionSet = orderedMap(
                "common-core", versionStamp("common-core"),
                projectId + "-adapter-contract", versionStamp("adapter-contract"),
                projectId + "-adapter-artifact", versionStamp("adapter-artifact"),
                "runtime-package", runtimePackageId);
        return orderedMap(
                "pipelineRunId", "pipe-" + shortId(),
                "projectId", projectId,
                "releaseUnitId", releaseUnitId,
                "runtimePackageId", runtimePackageId,
                "deployTraceId", "deploy-" + shortId(),
                "commonArtifactSet", stringList("common-core", "builder-validator", "deploy-contract"),
                "artifactVersionSet", artifactVersionSet,
                "artifactLineage", orderedMap(
                        "releaseFamilyId", projectId + "-family",
                        "artifactManifestId", "manifest-" + shortId(),
                        "rollbackAnchorReleaseUnitId", buildReleaseUnitId("rollback", projectId)),
                "deployContract", orderedMap(
                        "deploymentMode", "ARTIFACT_LINEAGE_CONTROLLED",
                        "releaseFamilyId", projectId + "-family"),
                "rollbackPlan", orderedMap(
                        "rollbackTargetReleaseUnitId", buildReleaseUnitId("rollback", projectId),
                        "rollbackMode", "ARTIFACT_REDEPLOY"),
                "occurredAt", now());
    }

    private Map<String, Object> pagedListPayload(String projectId, List<Map<String, Object>> itemSet, int page, int pageSize) {
        int safePage = page < 1 ? 1 : page;
        int safePageSize = pageSize < 1 ? 20 : pageSize;
        int from = Math.min((safePage - 1) * safePageSize, itemSet.size());
        int to = Math.min(from + safePageSize, itemSet.size());

        Map<String, Object> response = orderedMap();
        response.put("projectId", projectId);
        response.put("itemSet", new ArrayList<Map<String, Object>>(itemSet.subList(from, to)));
        response.put("totalCount", Integer.valueOf(itemSet.size()));
        return response;
    }

    private List<Map<String, Object>> installedArtifactSet(String projectId, Map<String, Object> pipeline) {
        Map<String, Object> versions = valueMap(pipeline, "artifactVersionSet");
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        items.add(installedArtifact("common-core", "COMMON_CORE", versions.get("common-core"), "COMMON"));
        items.add(installedArtifact(projectId + "-adapter-contract", "ADAPTER_CONTRACT", versions.get(projectId + "-adapter-contract"), "PROJECT"));
        items.add(installedArtifact(projectId + "-adapter-artifact", "ADAPTER_ARTIFACT", versions.get(projectId + "-adapter-artifact"), "PROJECT"));
        return items;
    }

    private List<Map<String, Object>> installedPackageSet(Map<String, Object> pipeline) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        items.add(orderedMap(
                "packageId", value(pipeline, "runtimePackageId"),
                "packageType", "INSTALLABLE_RUNTIME_PACKAGE",
                "installedVersion", value(pipeline, "runtimePackageId")));
        return items;
    }

    private List<Map<String, Object>> databaseInstalledPackages(Map<String, Object> latestReleaseUnit) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        if (!value(latestReleaseUnit, "runtimePackageId").isEmpty()) {
            items.add(orderedMap(
                    "packageId", value(latestReleaseUnit, "runtimePackageId"),
                    "packageType", "INSTALLABLE_RUNTIME_PACKAGE",
                    "installedVersion", firstNonBlank(value(latestReleaseUnit, "projectRuntimeVersion"), value(latestReleaseUnit, "runtimePackageId"))));
        }
        return items;
    }

    private Map<String, Object> installedArtifact(String artifactId, String artifactFamily, Object version, String scope) {
        return orderedMap(
                "artifactId", artifactId,
                "artifactFamily", artifactFamily,
                "installedArtifactVersion", version,
                "installScope", scope,
                "activeYn", Boolean.TRUE);
    }

    private Map<String, Object> serverState(
            String serverId,
            String serverRole,
            Map<String, Object> pipeline,
            Map<String, Object> deployContract,
            Map<String, Object> artifactLineage,
            String healthStatus,
            boolean runtimeTruthYn
    ) {
        return orderedMap(
                "serverId", serverId,
                "serverRole", serverRole,
                "activeReleaseUnitId", value(pipeline, "releaseUnitId"),
                "deployTraceId", value(pipeline, "deployTraceId"),
                "deployedAt", value(pipeline, "occurredAt"),
                "healthStatus", healthStatus,
                "runtimeTruthYn", Boolean.valueOf(runtimeTruthYn),
                "deploymentMode", deployContract.get("deploymentMode"),
                "releaseFamilyId", artifactLineage.get("releaseFamilyId"));
    }

    private List<Map<String, Object>> buildDeploymentStateRecords(
            String projectId,
            String releaseUnitId,
            String deployTraceId,
            String deploymentTarget,
            String operator,
            boolean rollbackMode
    ) {
        String targetRole = rollbackMode ? "PRIMARY" : resolveDeploymentRole(deploymentTarget);
        List<Map<String, Object>> states = new ArrayList<Map<String, Object>>();
        states.add(buildDeploymentStateRecord("ops-runtime-preview-01", "PREVIEW", projectId, releaseUnitId, deployTraceId, operator, targetRole, rollbackMode));
        states.add(buildDeploymentStateRecord("ops-runtime-stage-01", "STAGE", projectId, releaseUnitId, deployTraceId, operator, targetRole, rollbackMode));
        states.add(buildDeploymentStateRecord("ops-runtime-main-01", "PRIMARY", projectId, releaseUnitId, deployTraceId, operator, targetRole, rollbackMode));
        return states;
    }

    private Map<String, Object> buildDeploymentStateRecord(
            String serverId,
            String serverRole,
            String projectId,
            String releaseUnitId,
            String deployTraceId,
            String operator,
            String targetRole,
            boolean rollbackMode
    ) {
        String healthStatus = rollbackMode ? rollbackHealthStatusForRole(serverRole) : healthStatusForRole(serverRole, targetRole);
        return orderedMap(
                "serverDeploymentId", "dep-" + shortId(),
                "serverId", serverId,
                "serverRole", serverRole,
                "projectId", projectId,
                "releaseUnitId", releaseUnitId,
                "deployTraceId", deployTraceId,
                "healthStatus", healthStatus,
                "deployedBy", operator);
    }

    private String healthStatusForRole(String serverRole, String targetRole) {
        if ("PREVIEW".equals(serverRole)) {
            return "PREVIEW".equals(targetRole) ? "HEALTHY" : "PROMOTED";
        }
        if ("STAGE".equals(serverRole)) {
            return "PRIMARY".equals(targetRole) ? "PROMOTED" : ("STAGE".equals(targetRole) ? "VALIDATING" : "PENDING_PROMOTION");
        }
        return "PRIMARY".equals(targetRole) ? "HEALTHY" : "PENDING_PROMOTION";
    }

    private String rollbackHealthStatusForRole(String serverRole) {
        if ("PRIMARY".equals(serverRole)) {
            return "ROLLED_BACK";
        }
        if ("STAGE".equals(serverRole)) {
            return "ROLLBACK_SYNCED";
        }
        return "BASELINE_READY";
    }

    private boolean isRuntimeTruthRole(String serverRole, String healthStatus) {
        return ("PRIMARY".equals(serverRole) && !"PENDING_PROMOTION".equalsIgnoreCase(healthStatus))
                || ("STAGE".equals(serverRole) && "VALIDATING".equalsIgnoreCase(healthStatus))
                || ("PREVIEW".equals(serverRole) && "HEALTHY".equalsIgnoreCase(healthStatus));
    }

    private String resolveDeploymentRole(String deploymentTarget) {
        String normalized = firstNonBlank(deploymentTarget, "").toLowerCase();
        if (normalized.contains("preview")) {
            return "PREVIEW";
        }
        if (normalized.contains("stage")) {
            return "STAGE";
        }
        return "PRIMARY";
    }

    private Map<String, Object> candidateArtifact(String artifactId, Object artifactVersion, String artifactType, String lifecycle) {
        return orderedMap(
                "artifactId", artifactId,
                "artifactVersion", artifactVersion,
                "artifactType", artifactType,
                "lifecycle", lifecycle,
                "publishedAt", now());
    }

    private List<Map<String, Object>> packageDelta(List<Map<String, Object>> targetArtifactSet) {
        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> artifact : targetArtifactSet) {
            rows.add(orderedMap(
                    "artifactId", artifact.get("artifactId"),
                    "targetVersion", artifact.get("artifactVersion"),
                    "changeType", "UPGRADE"));
        }
        return rows;
    }

    private List<Map<String, Object>> normalizeArtifactSet(List<Map<String, Object>> targetArtifactSet) {
        if (targetArtifactSet == null || targetArtifactSet.isEmpty()) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> item : targetArtifactSet) {
            if (item == null || item.isEmpty()) {
                continue;
            }
            result.add(new LinkedHashMap<String, Object>(item));
        }
        return result;
    }

    private String resolveInstallScope(String artifactId) {
        if ("common-core".equals(artifactId)) {
            return "COMMON";
        }
        if (artifactId.contains("adapter")) {
            return "PROJECT";
        }
        return "PROJECT";
    }

    private String findArtifactVersion(List<Map<String, Object>> targetArtifactSet, String artifactId, String fallback) {
        for (Map<String, Object> item : targetArtifactSet) {
            if (artifactId.equals(String.valueOf(item.get("artifactId")))) {
                return String.valueOf(item.get("artifactVersion"));
            }
        }
        return fallback;
    }

    private void appendJsonLine(String location, Map<String, Object> payload) throws IOException {
        Path path = Paths.get(location);
        Path parent = path.getParent();
        if (parent != null) {
            Files.createDirectories(parent);
        }
        String line = objectMapper.writeValueAsString(payload) + System.lineSeparator();
        Files.write(path, line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    private Map<String, Object> valueMap(Map<String, Object> source, String key) {
        if (source == null) {
            return orderedMap();
        }
        Object value = source.get(key);
        if (value instanceof Map) {
            return new LinkedHashMap<String, Object>((Map<String, Object>) value);
        }
        return orderedMap();
    }

    private String value(Map<String, Object> source, String key) {
        if (source == null) {
            return "";
        }
        Object value = source.get(key);
        return value == null ? "" : String.valueOf(value);
    }

    private Map<String, Object> parseJsonObject(Object value) throws IOException {
        if (value == null) {
            return orderedMap();
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return orderedMap();
        }
        return objectMapper.readValue(text, MAP_TYPE);
    }

    private List<Object> parseJsonArray(Object value) throws IOException {
        if (value == null) {
            return Collections.emptyList();
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return Collections.emptyList();
        }
        return objectMapper.readValue(text, new TypeReference<List<Object>>() {});
    }

    private boolean truthy(Object value) {
        if (value == null) {
            return false;
        }
        String text = String.valueOf(value).trim();
        return "Y".equalsIgnoreCase(text) || "1".equals(text) || "true".equalsIgnoreCase(text);
    }

    private String resolveInstalledVersion(List<Map<String, Object>> installedArtifacts, String artifactFamily, Object fallback) {
        for (Map<String, Object> row : installedArtifacts) {
            if (artifactFamily.equalsIgnoreCase(value(row, "artifactFamily"))) {
                return value(row, "installedArtifactVersion");
            }
        }
        return fallback == null ? "" : String.valueOf(fallback);
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private String required(String value, String fieldName) {
        if (!hasText(value)) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String orDefault(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String buildReleaseUnitId(String prefix, String projectId) {
        return sanitize(prefix) + "-" + sanitize(projectId) + "-" + VERSION_STAMP.format(LocalDateTime.now(ZoneOffset.UTC));
    }

    private String buildRuntimePackageId(String prefix, String projectId) {
        return sanitize(prefix) + "-" + sanitize(projectId) + "-" + VERSION_STAMP.format(LocalDateTime.now(ZoneOffset.UTC));
    }

    private String versionStamp(String prefix) {
        return sanitize(prefix) + "-" + VERSION_STAMP.format(LocalDateTime.now(ZoneOffset.UTC));
    }

    private String previousVersion(Object value) {
        String source = String.valueOf(value == null ? "" : value);
        return source.isEmpty() ? "" : source + ".prev";
    }

    private String nextVersion(String value) {
        return value + ".next";
    }

    private String minusDays(int days) {
        return Instant.now().minusSeconds(days * 86400L).toString();
    }

    private String now() {
        return Instant.now().toString();
    }

    private String shortId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String sanitize(String value) {
        return orDefault(value, "unknown").replaceAll("[^A-Za-z0-9._-]", "-");
    }

    private List<String> stringList(String... values) {
        List<String> result = new ArrayList<String>();
        if (values == null) {
            return result;
        }
        for (String value : values) {
            if (hasText(value)) {
                result.add(value.trim());
            }
        }
        return result;
    }

    private String titleCase(String projectId) {
        String[] tokens = projectId.replace('_', '-').split("-");
        StringBuilder builder = new StringBuilder();
        for (String token : tokens) {
            if (token.isEmpty()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(token.charAt(0)));
            if (token.length() > 1) {
                builder.append(token.substring(1));
            }
        }
        return builder.length() == 0 ? projectId : builder.toString();
    }

    private Map<String, Object> orderedMap(Object... pairs) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        if (pairs == null) {
            return map;
        }
        for (int i = 0; i + 1 < pairs.length; i += 2) {
            map.put(String.valueOf(pairs[i]), pairs[i + 1]);
        }
        return map;
    }
}
