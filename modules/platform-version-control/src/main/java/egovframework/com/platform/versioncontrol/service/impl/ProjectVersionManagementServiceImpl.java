package egovframework.com.platform.versioncontrol.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.platform.screenbuilder.support.ScreenBuilderArtifactSetNormalizer;
import egovframework.com.platform.screenbuilder.support.ScreenBuilderPlatformFamilyRegistry;
import egovframework.com.platform.versioncontrol.mapper.ProjectVersionManagementMapper;
import egovframework.com.platform.versioncontrol.model.ProjectApplyUpgradeRequest;
import egovframework.com.platform.versioncontrol.model.ProjectRollbackRequest;
import egovframework.com.platform.versioncontrol.model.ProjectUpgradeImpactRequest;
import egovframework.com.platform.versioncontrol.model.ProjectVersionPageRequest;
import egovframework.com.platform.versioncontrol.service.ProjectVersionManagementService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service("projectVersionManagementService")
public class ProjectVersionManagementServiceImpl implements ProjectVersionManagementService {

    private static final DateTimeFormatter RELEASE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<Map<String, Object>>() { };

    private final ProjectVersionManagementMapper projectVersionManagementMapper;
    private final ObjectMapper objectMapper;

    public ProjectVersionManagementServiceImpl(ProjectVersionManagementMapper projectVersionManagementMapper,
                                               ObjectMapper objectMapper) {
        this.projectVersionManagementMapper = projectVersionManagementMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, Object> getProjectVersionOverview(String projectId) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        Map<String, Object> overview = defaultMap(projectVersionManagementMapper.selectProjectOverview(normalizedProjectId));
        List<Map<String, Object>> installedArtifacts = canonicalArtifactRows(
                normalizedProjectId,
                safeList(projectVersionManagementMapper.selectInstalledArtifactList(normalizedProjectId)));
        List<Map<String, Object>> installedPackages = safeList(projectVersionManagementMapper.selectInstalledPackageList(normalizedProjectId));
        return orderedMap(
                "projectId", normalizedProjectId,
                "projectDisplayName", stringValue(overview.get("projectDisplayName")),
                "activeRuntimeVersion", stringValue(overview.get("activeRuntimeVersion")),
                "activeCommonCoreVersion", stringValue(overview.get("activeCommonCoreVersion")),
                "activeAdapterContractVersion", stringValue(overview.get("activeAdapterContractVersion")),
                "activeAdapterArtifactVersion", stringValue(overview.get("activeAdapterArtifactVersion")),
                "installedArtifactSet", installedArtifacts,
                "installedPackageSet", installedPackages,
                "rollbackReadyReleaseUnitId", stringValue(overview.get("rollbackReadyReleaseUnitId")));
    }

    @Override
    public Map<String, Object> getAdapterHistory(ProjectVersionPageRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        Map<String, Object> params = pagingParams(projectId, request);
        return orderedMap(
                "projectId", projectId,
                "itemSet", safeList(projectVersionManagementMapper.selectAdapterHistoryList(params)),
                "totalCount", safeInt(projectVersionManagementMapper.countAdapterHistory(projectId)));
    }

    @Override
    public Map<String, Object> getReleaseUnits(ProjectVersionPageRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        Map<String, Object> params = pagingParams(projectId, request);
        return orderedMap(
                "projectId", projectId,
                "itemSet", safeList(projectVersionManagementMapper.selectReleaseUnitList(params)),
                "totalCount", safeInt(projectVersionManagementMapper.countReleaseUnits(projectId)));
    }

    @Override
    public Map<String, Object> getServerDeployState(String projectId) throws Exception {
        String normalizedProjectId = required(projectId, "projectId");
        return orderedMap(
                "projectId", normalizedProjectId,
                "serverStateSet", safeList(projectVersionManagementMapper.selectServerDeploymentStateList(normalizedProjectId)));
    }

    @Override
    public Map<String, Object> getCandidateArtifacts(ProjectVersionPageRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        Map<String, Object> params = pagingParams(projectId, request);
        Map<String, Object> overview = getProjectVersionOverview(projectId);
        String activeAdapterContractVersion = stringValue(overview.get("activeAdapterContractVersion"));
        List<Map<String, Object>> installedArtifacts = canonicalArtifactRows(projectId, safeList(overview.get("installedArtifactSet")));
        Map<String, String> installedVersionByArtifact = installedVersionMap(installedArtifacts);
        Map<String, String> latestVersionByArtifact = new LinkedHashMap<String, String>();
        List<Map<String, Object>> rawCandidates = canonicalArtifactRows(
                projectId,
                safeList(projectVersionManagementMapper.selectCandidateArtifactList(params)));
        for (Map<String, Object> rawCandidate : rawCandidates) {
            String artifactId = stringValue(rawCandidate.get("artifactId"));
            if (!artifactId.isEmpty() && !latestVersionByArtifact.containsKey(artifactId)) {
                latestVersionByArtifact.put(artifactId, stringValue(rawCandidate.get("artifactVersion")));
            }
        }
        List<Map<String, Object>> enrichedCandidates = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> rawCandidate : rawCandidates) {
            enrichedCandidates.add(enrichCandidateArtifact(
                    rawCandidate,
                    installedVersionByArtifact,
                    latestVersionByArtifact,
                    activeAdapterContractVersion));
        }
        return orderedMap(
                "projectId", projectId,
                "activeAdapterContractVersion", activeAdapterContractVersion,
                "itemSet", enrichedCandidates,
                "totalCount", safeInt(projectVersionManagementMapper.countCandidateArtifacts(projectId)));
    }

    @Override
    public Map<String, Object> analyzeUpgradeImpact(ProjectUpgradeImpactRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        Map<String, Object> overview = getProjectVersionOverview(projectId);
        List<Map<String, Object>> targetArtifactSet = normalizeArtifactSet(projectId, request == null ? null : request.getTargetArtifactSet());
        String currentAdapterContractVersion = stringValue(overview.get("activeAdapterContractVersion"));
        List<String> blockerSet = new ArrayList<String>();
        List<Map<String, Object>> deltaSet = new ArrayList<Map<String, Object>>();
        String compatibilityClass = "ADAPTER_SAFE";
        for (Map<String, Object> artifact : targetArtifactSet) {
            Map<String, Object> targetVersion = projectVersionManagementMapper.selectArtifactVersion(orderedMap(
                    "artifactId", stringValue(artifact.get("artifactId")),
                    "artifactVersion", stringValue(artifact.get("artifactVersion"))));
            String targetAdapterContractVersion = stringValue(targetVersion.get("adapterContractVersion"));
            String targetApiContractVersion = stringValue(targetVersion.get("apiContractVersion"));
            String targetManifestContractVersion = stringValue(targetVersion.get("manifestContractVersion"));
            String targetCapabilityCatalogVersion = stringValue(targetVersion.get("capabilityCatalogVersion"));
            String candidateCompatibilityClass = "ADAPTER_SAFE";
            if (!targetAdapterContractVersion.isEmpty() && !currentAdapterContractVersion.isEmpty()
                    && !currentAdapterContractVersion.equalsIgnoreCase(targetAdapterContractVersion)) {
                compatibilityClass = "ADAPTER_BREAKING";
                candidateCompatibilityClass = "ADAPTER_BREAKING";
                blockerSet.add("adapter contract mismatch: "
                        + stringValue(artifact.get("artifactId"))
                        + " requires " + targetAdapterContractVersion
                        + " but project uses " + currentAdapterContractVersion);
            }
            if (!targetAdapterContractVersion.isEmpty() && currentAdapterContractVersion.isEmpty()) {
                compatibilityClass = "ADAPTER_REVIEW_REQUIRED";
                candidateCompatibilityClass = "ADAPTER_REVIEW_REQUIRED";
                blockerSet.add("adapter contract review required: "
                        + stringValue(artifact.get("artifactId"))
                        + " declares " + targetAdapterContractVersion
                        + " while project has no active adapter contract version");
            }
            deltaSet.add(orderedMap(
                    "artifactId", stringValue(artifact.get("artifactId")),
                    "artifactVersion", stringValue(artifact.get("artifactVersion")),
                    "adapterContractVersion", targetAdapterContractVersion,
                    "apiContractVersion", targetApiContractVersion,
                    "manifestContractVersion", targetManifestContractVersion,
                    "capabilityCatalogVersion", targetCapabilityCatalogVersion,
                    "compatibilityClass", candidateCompatibilityClass));
        }
        return orderedMap(
                "projectId", projectId,
                "currentVersionSet", orderedMap(
                        "commonCoreVersion", stringValue(overview.get("activeCommonCoreVersion")),
                        "adapterContractVersion", currentAdapterContractVersion,
                        "adapterArtifactVersion", stringValue(overview.get("activeAdapterArtifactVersion"))),
                "targetVersionSet", orderedMap(
                        "targetArtifactSet", targetArtifactSet),
                "compatibilityClass", compatibilityClass,
                "adapterImpactSummary", buildAdapterImpactSummary(compatibilityClass),
                "artifactDelta", deltaSet,
                "packageDelta", Collections.emptyList(),
                "runtimePackageDelta", targetArtifactSet.isEmpty() ? "" : "artifact-set update",
                "blockerSet", blockerSet,
                "rollbackTargetReleaseId", stringValue(overview.get("rollbackReadyReleaseUnitId")),
                "upgradeReadyYn", !"ADAPTER_BREAKING".equals(compatibilityClass));
    }

    @Override
    public Map<String, Object> applyUpgrade(ProjectApplyUpgradeRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        Map<String, Object> impact = analyzeUpgradeImpact(toImpactRequest(request));
        if (!Boolean.TRUE.equals(impact.get("upgradeReadyYn"))) {
            throw new IllegalArgumentException("Upgrade is blocked until compatibility issues are resolved.");
        }
        Map<String, Object> overview = getProjectVersionOverview(projectId);
        Map<String, Object> currentVersionSet = defaultMap((Map<String, Object>) impact.get("currentVersionSet"));
        Map<String, Object> targetVersionSet = defaultMap((Map<String, Object>) impact.get("targetVersionSet"));
        List<Map<String, Object>> targetArtifactSet = normalizeArtifactSet(projectId, targetVersionSet.get("targetArtifactSet"));
        String releaseUnitId = "ru-" + projectId + "-" + RELEASE_DATE.format(LocalDateTime.now()) + "-01";
        String runtimePackageId = "rp-" + projectId + "-" + System.currentTimeMillis();
        String adapterArtifactVersion = resolveAdapterArtifactVersion(projectId, targetArtifactSet, stringValue(currentVersionSet.get("adapterArtifactVersion")));
        String adapterContractVersion = resolveAdapterContractVersion(targetArtifactSet, stringValue(currentVersionSet.get("adapterContractVersion")));
        Map<String, Object> row = orderedMap(
                "releaseUnitId", releaseUnitId,
                "projectId", projectId,
                "runtimePackageId", runtimePackageId,
                "projectRuntimeVersion", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy.MM.dd.HHmm")),
                "adapterArtifactVersion", adapterArtifactVersion,
                "adapterContractVersion", adapterContractVersion,
                "commonArtifactSetJson", writeJson(targetVersionSet),
                "packageVersionSetJson", "[]",
                "rollbackTargetReleaseId", stringValue(impact.get("rollbackTargetReleaseId")),
                "approvedBy", safe(required(request.getOperator(), "operator")));
        projectVersionManagementMapper.insertReleaseUnitRegistry(row);
        List<Map<String, Object>> appliedArtifactSet = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> targetArtifact : targetArtifactSet) {
            String artifactId = stringValue(targetArtifact.get("artifactId"));
            String artifactVersion = stringValue(targetArtifact.get("artifactVersion"));
            Map<String, Object> artifactVersionRow = defaultMap(projectVersionManagementMapper.selectArtifactVersion(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion)));
            if (artifactVersionRow.isEmpty()) {
                throw new IllegalArgumentException("Artifact version does not exist: " + artifactId + "@" + artifactVersion);
            }
            Map<String, Object> activeInstall = defaultMap(projectVersionManagementMapper.selectActiveInstalledArtifact(orderedMap(
                    "projectId", projectId,
                    "artifactId", artifactId)));
            String rollbackTargetVersion = stringValue(activeInstall.get("installedArtifactVersion"));
            projectVersionManagementMapper.deactivateArtifactInstall(orderedMap(
                    "projectId", projectId,
                    "artifactId", artifactId));
            projectVersionManagementMapper.insertProjectArtifactInstall(orderedMap(
                    "projectArtifactInstallId", "pai-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                    "projectId", projectId,
                    "artifactVersionId", stringValue(artifactVersionRow.get("artifactVersionId")),
                    "installScope", firstNonBlank(stringValue(activeInstall.get("installScope")), "PROJECT_RUNTIME"),
                    "releaseUnitId", releaseUnitId,
                    "rollbackTargetVersion", rollbackTargetVersion,
                    "installedBy", safe(required(request.getOperator(), "operator"))));
            appliedArtifactSet.add(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion,
                    "rollbackTargetVersion", rollbackTargetVersion));
        }
        projectVersionManagementMapper.insertAdapterChangeLog(orderedMap(
                "adapterChangeId", "acl-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                "projectId", projectId,
                "adapterArtifactVersion", adapterArtifactVersion,
                "adapterContractVersion", adapterContractVersion,
                "changedPortSetJson", "[]",
                "changedDtoSetJson", "[]",
                "mappingImpactSummary", stringValue(impact.get("adapterImpactSummary")),
                "compatibilityClass", stringValue(impact.get("compatibilityClass")),
                "migrationRequiredYn", "ADAPTER_SAFE".equals(stringValue(impact.get("compatibilityClass"))) ? "N" : "Y",
                "relatedReleaseUnitId", releaseUnitId,
                "recordedBy", safe(required(request.getOperator(), "operator"))));
        return orderedMap(
                "projectId", projectId,
                "releaseUnitId", releaseUnitId,
                "runtimePackageId", runtimePackageId,
                "appliedArtifactSet", appliedArtifactSet,
                "compatibilityClass", impact.get("compatibilityClass"),
                "deployReadyYn", true,
                "rollbackTargetReleaseId", impact.get("rollbackTargetReleaseId"),
                "activeCommonCoreVersion", stringValue(overview.get("activeCommonCoreVersion")));
    }

    @Override
    public Map<String, Object> rollbackProject(ProjectRollbackRequest request) throws Exception {
        String projectId = required(request == null ? null : request.getProjectId(), "projectId");
        String targetReleaseUnitId = required(request == null ? null : request.getTargetReleaseUnitId(), "targetReleaseUnitId");
        Map<String, Object> releaseUnit = defaultMap(projectVersionManagementMapper.selectReleaseUnit(targetReleaseUnitId));
        if (releaseUnit.isEmpty()) {
            throw new IllegalArgumentException("Target release unit does not exist.");
        }
        if (!projectId.equals(stringValue(releaseUnit.get("projectId")))) {
            throw new IllegalArgumentException("Target release unit does not belong to the requested project.");
        }
        List<Map<String, Object>> rollbackArtifactSet = parseReleaseUnitArtifactSet(projectId, releaseUnit.get("commonArtifactSet"));
        if (rollbackArtifactSet.isEmpty()) {
            throw new IllegalArgumentException("Target release unit does not contain a rollback artifact set.");
        }
        String operator = safe(required(request.getOperator(), "operator"));
        List<Map<String, Object>> restoredArtifactSet = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> rollbackArtifact : rollbackArtifactSet) {
            String artifactId = stringValue(rollbackArtifact.get("artifactId"));
            String artifactVersion = stringValue(rollbackArtifact.get("artifactVersion"));
            Map<String, Object> artifactVersionRow = defaultMap(projectVersionManagementMapper.selectArtifactVersion(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion)));
            if (artifactVersionRow.isEmpty()) {
                throw new IllegalArgumentException("Rollback artifact version does not exist: " + artifactId + "@" + artifactVersion);
            }
            Map<String, Object> activeInstall = defaultMap(projectVersionManagementMapper.selectActiveInstalledArtifact(orderedMap(
                    "projectId", projectId,
                    "artifactId", artifactId)));
            String rollbackTargetVersion = stringValue(activeInstall.get("installedArtifactVersion"));
            projectVersionManagementMapper.deactivateArtifactInstall(orderedMap(
                    "projectId", projectId,
                    "artifactId", artifactId));
            projectVersionManagementMapper.insertProjectArtifactInstall(orderedMap(
                    "projectArtifactInstallId", "pai-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                    "projectId", projectId,
                    "artifactVersionId", stringValue(artifactVersionRow.get("artifactVersionId")),
                    "installScope", firstNonBlank(stringValue(activeInstall.get("installScope")), "PROJECT_RUNTIME"),
                    "releaseUnitId", targetReleaseUnitId,
                    "rollbackTargetVersion", rollbackTargetVersion,
                    "installedBy", operator));
            restoredArtifactSet.add(orderedMap(
                    "artifactId", artifactId,
                    "artifactVersion", artifactVersion,
                    "rollbackTargetVersion", rollbackTargetVersion));
        }
        projectVersionManagementMapper.insertAdapterChangeLog(orderedMap(
                "adapterChangeId", "acl-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16),
                "projectId", projectId,
                "adapterArtifactVersion", stringValue(releaseUnit.get("adapterArtifactVersion")),
                "adapterContractVersion", stringValue(releaseUnit.get("adapterContractVersion")),
                "changedPortSetJson", "[]",
                "changedDtoSetJson", "[]",
                "mappingImpactSummary", firstNonBlank(safe(request.getReason()), "Rollback applied from governed release unit."),
                "compatibilityClass", "ADAPTER_SAFE",
                "migrationRequiredYn", "N",
                "relatedReleaseUnitId", targetReleaseUnitId,
                "recordedBy", operator));
        return orderedMap(
                "projectId", projectId,
                "rolledBackToReleaseUnitId", targetReleaseUnitId,
                "runtimePackageId", stringValue(releaseUnit.get("runtimePackageId")),
                "deployTraceId", "dt-" + projectId + "-" + UUID.randomUUID().toString().substring(0, 8),
                "status", "ROLLED_BACK",
                "restoredArtifactSet", restoredArtifactSet,
                "rollbackTargetReleaseId", stringValue(releaseUnit.get("rollbackTargetReleaseId")));
    }

    private ProjectUpgradeImpactRequest toImpactRequest(ProjectApplyUpgradeRequest request) {
        ProjectUpgradeImpactRequest impactRequest = new ProjectUpgradeImpactRequest();
        impactRequest.setProjectId(request == null ? null : request.getProjectId());
        impactRequest.setTargetArtifactSet(request == null ? null : request.getTargetArtifactSet());
        impactRequest.setOperator(request == null ? null : request.getOperator());
        return impactRequest;
    }

    private Map<String, Object> pagingParams(String projectId, ProjectVersionPageRequest request) {
        int page = request == null || request.getPage() < 1 ? 1 : request.getPage();
        int pageSize = request == null || request.getPageSize() < 1 ? 20 : request.getPageSize();
        return orderedMap(
                "projectId", projectId,
                "offset", (page - 1) * pageSize,
                "pageSize", pageSize);
    }

    private String buildAdapterImpactSummary(String compatibilityClass) {
        if ("ADAPTER_BREAKING".equals(compatibilityClass)) {
            return "Adapter contract version mismatch detected.";
        }
        if ("ADAPTER_REVIEW_REQUIRED".equals(compatibilityClass)) {
            return "Adapter mapping review is required.";
        }
        return "No adapter rewrite required.";
    }

    private String resolveAdapterArtifactVersion(String projectId, List<Map<String, Object>> targetArtifactSet, String fallback) {
        for (Map<String, Object> targetArtifact : targetArtifactSet) {
            String artifactId = stringValue(targetArtifact.get("artifactId"));
            if (adapterArtifactId(projectId).equals(artifactId)) {
                return stringValue(targetArtifact.get("artifactVersion"));
            }
        }
        return fallback;
    }

    private String resolveAdapterContractVersion(List<Map<String, Object>> targetArtifactSet, String fallback) {
        for (Map<String, Object> targetArtifact : targetArtifactSet) {
            Map<String, Object> artifactVersion = defaultMap(projectVersionManagementMapper.selectArtifactVersion(orderedMap(
                    "artifactId", stringValue(targetArtifact.get("artifactId")),
                    "artifactVersion", stringValue(targetArtifact.get("artifactVersion")))));
            String adapterContractVersion = stringValue(artifactVersion.get("adapterContractVersion"));
            if (!adapterContractVersion.isEmpty()) {
                return adapterContractVersion;
            }
        }
        return fallback;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize release unit payload.", ex);
        }
    }

    private List<Map<String, Object>> parseReleaseUnitArtifactSet(String projectId, Object rawCommonArtifactSet) {
        Map<String, Object> parsed = parseJsonMap(rawCommonArtifactSet);
        List<Map<String, Object>> artifactSet = normalizeArtifactSet(projectId, parsed == null ? null : safeList(parsed.get("targetArtifactSet")));
        if (!artifactSet.isEmpty()) {
            return artifactSet;
        }
        return ScreenBuilderArtifactSetNormalizer.parseLegacyArtifactSet(projectId, stringValue(rawCommonArtifactSet));
    }

    private Map<String, Object> parseJsonMap(Object rawValue) {
        String raw = stringValue(rawValue);
        if (raw.isEmpty()) {
            return new LinkedHashMap<String, Object>();
        }
        try {
            return defaultMap(objectMapper.readValue(raw, MAP_TYPE));
        } catch (Exception ignored) {
            return new LinkedHashMap<String, Object>();
        }
    }

    private String firstNonBlank(String primary, String fallback) {
        return safe(primary).isEmpty() ? safe(fallback) : safe(primary);
    }

    private String resolveInstallScope(String artifactId) {
        return ScreenBuilderPlatformFamilyRegistry.resolveInstallScope(artifactId);
    }

    private List<Map<String, Object>> normalizeArtifactSet(String projectId, Object value) {
        return ScreenBuilderArtifactSetNormalizer.normalizeArtifactSet(projectId, safeList(value));
    }

    private List<Map<String, Object>> canonicalArtifactRows(String projectId, List<Map<String, Object>> rows) {
        return ScreenBuilderArtifactSetNormalizer.normalizeArtifactSet(projectId, rows);
    }

    private String adapterArtifactId(String projectId) {
        return ScreenBuilderPlatformFamilyRegistry.projectAdapterArtifactId(projectId);
    }

    private Map<String, String> installedVersionMap(List<Map<String, Object>> installedArtifacts) {
        Map<String, String> values = new LinkedHashMap<String, String>();
        for (Map<String, Object> installedArtifact : installedArtifacts) {
            String artifactId = stringValue(installedArtifact.get("artifactId"));
            if (artifactId.isEmpty() || values.containsKey(artifactId)) {
                continue;
            }
            values.put(artifactId, stringValue(installedArtifact.get("installedArtifactVersion")));
        }
        return values;
    }

    private Map<String, Object> enrichCandidateArtifact(Map<String, Object> rawCandidate,
                                                        Map<String, String> installedVersionByArtifact,
                                                        Map<String, String> latestVersionByArtifact,
                                                        String activeAdapterContractVersion) {
        Map<String, Object> candidate = new LinkedHashMap<String, Object>();
        if (rawCandidate != null) {
            candidate.putAll(rawCandidate);
        }
        String artifactId = stringValue(candidate.get("artifactId"));
        String artifactVersion = stringValue(candidate.get("artifactVersion"));
        String installedVersion = installedVersionByArtifact.getOrDefault(artifactId, "");
        String latestVersion = latestVersionByArtifact.getOrDefault(artifactId, "");
        String adapterContractVersion = stringValue(candidate.get("adapterContractVersion"));
        String compatibilityClass = resolveCandidateCompatibility(activeAdapterContractVersion, adapterContractVersion);
        String candidateState = resolveCandidateState(artifactVersion, installedVersion, latestVersion, compatibilityClass);
        candidate.put("installedArtifactVersion", installedVersion);
        candidate.put("latestArtifactVersion", latestVersion);
        candidate.put("compatibilityClass", compatibilityClass);
        candidate.put("candidateState", candidateState);
        candidate.put("upgradeReadyYn", !"ADAPTER_BREAKING".equals(compatibilityClass));
        candidate.put("stateSummary", buildCandidateStateSummary(candidateState, compatibilityClass));
        return candidate;
    }

    private String resolveCandidateCompatibility(String activeAdapterContractVersion, String candidateAdapterContractVersion) {
        if (!candidateAdapterContractVersion.isEmpty() && !activeAdapterContractVersion.isEmpty()
                && !activeAdapterContractVersion.equalsIgnoreCase(candidateAdapterContractVersion)) {
            return "ADAPTER_BREAKING";
        }
        if (!candidateAdapterContractVersion.isEmpty() && activeAdapterContractVersion.isEmpty()) {
            return "ADAPTER_REVIEW_REQUIRED";
        }
        return "ADAPTER_SAFE";
    }

    private String resolveCandidateState(String artifactVersion,
                                         String installedVersion,
                                         String latestVersion,
                                         String compatibilityClass) {
        if (!installedVersion.isEmpty() && installedVersion.equalsIgnoreCase(artifactVersion)) {
            return "INSTALLED";
        }
        if (!latestVersion.isEmpty() && latestVersion.equalsIgnoreCase(artifactVersion)) {
            return "ADAPTER_BREAKING".equals(compatibilityClass) || "ADAPTER_REVIEW_REQUIRED".equals(compatibilityClass)
                    ? "REVIEW"
                    : "LATEST";
        }
        if ("ADAPTER_BREAKING".equals(compatibilityClass) || "ADAPTER_REVIEW_REQUIRED".equals(compatibilityClass)) {
            return "REVIEW";
        }
        return "AVAILABLE";
    }

    private String buildCandidateStateSummary(String candidateState, String compatibilityClass) {
        if ("INSTALLED".equals(candidateState)) {
            return "Currently installed on this project.";
        }
        if ("LATEST".equals(candidateState)) {
            return "Latest candidate on the current artifact line.";
        }
        if ("ADAPTER_BREAKING".equals(compatibilityClass)) {
            return "Adapter contract mismatch detected.";
        }
        if ("ADAPTER_REVIEW_REQUIRED".equals(compatibilityClass)) {
            return "Adapter review is required before applying this version.";
        }
        return "Available candidate version.";
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeList(Object value) {
        return value instanceof List ? (List<Map<String, Object>>) value : Collections.emptyList();
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value.intValue();
    }

    private String required(String value, String fieldName) {
        String safe = safe(value);
        if (safe.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return safe;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Map<String, Object> defaultMap(Map<String, Object> value) {
        return value == null ? new LinkedHashMap<String, Object>() : value;
    }

    private Map<String, Object> orderedMap(Object... fields) {
        Map<String, Object> values = new LinkedHashMap<String, Object>();
        if (fields == null) {
            return values;
        }
        for (int index = 0; index + 1 < fields.length; index += 2) {
            values.put(String.valueOf(fields[index]), fields[index + 1]);
        }
        return values;
    }
}
