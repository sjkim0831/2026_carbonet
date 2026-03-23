package egovframework.com.framework.builder.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.framework.builder.model.FrameworkBuilderCompatibilityCheckRequestVO;
import egovframework.com.framework.builder.model.FrameworkBuilderCompatibilityCheckResponseVO;
import egovframework.com.framework.builder.model.FrameworkBuilderCompatibilityDeclarationVO;
import egovframework.com.framework.builder.model.FrameworkBuilderCompatibilityResultItemVO;
import egovframework.com.framework.builder.model.FrameworkBuilderMigrationPlanVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class FrameworkBuilderCompatibilityService {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE =
            new TypeReference<LinkedHashMap<String, Object>>() {};

    private final ObjectMapper objectMapper;

    @Value("${security.framework.builder.compatibility-check-file:/tmp/carbonet-framework-builder-compatibility-check.jsonl}")
    private String compatibilityCheckFilePath;

    private final ReentrantLock fileLock = new ReentrantLock();

    public FrameworkBuilderCompatibilityService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public FrameworkBuilderCompatibilityCheckResponseVO runCompatibilityCheck(
            FrameworkBuilderCompatibilityCheckRequestVO request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getBuilderVersion(), "builderVersion");
        requireField(request == null ? null : request.getSourceContractVersion(), "sourceContractVersion");
        requireField(request == null ? null : request.getCheckScope(), "checkScope");

        List<FrameworkBuilderCompatibilityDeclarationVO> declarations = getCompatibilityDeclarations(null, "ACTIVE");
        FrameworkBuilderCompatibilityDeclarationVO declaration = findDeclaration(declarations, safe(request.getBuilderVersion()));
        FrameworkBuilderMigrationPlanVO migrationPlan = findMigrationPlan(
                safe(request.getMigrationPlanId()),
                safe(request.getBuilderVersion()));

        FrameworkBuilderCompatibilityCheckResponseVO response = new FrameworkBuilderCompatibilityCheckResponseVO();
        response.setCompatibilityCheckRunId(buildId("fbcc"));
        response.setProjectId(safe(request.getProjectId()));
        response.setPageId(safe(request.getPageId()));
        response.setScenarioId(safe(request.getScenarioId()));
        response.setGuidedStateId(safe(request.getGuidedStateId()));
        response.setScreenFamilyRuleId(safe(request.getScreenFamilyRuleId()));
        response.setTemplateLineId(safe(request.getTemplateLineId()));
        response.setBuilderVersion(safe(request.getBuilderVersion()));
        response.setBuilderRulePackVersion(firstNonBlank(
                safe(request.getBuilderRulePackVersion()),
                declaration == null ? "" : declaration.getBuilderRulePackVersion()));
        response.setTemplatePackVersion(firstNonBlank(
                safe(request.getTemplatePackVersion()),
                declaration == null ? "" : declaration.getTemplatePackVersion()));
        response.setSourceContractVersion(safe(request.getSourceContractVersion()));
        response.setOverlaySchemaVersion(safe(request.getOverlaySchemaVersion()));
        response.setOverlaySetId(safe(request.getOverlaySetId()));
        response.setMigrationPlanId(safe(request.getMigrationPlanId()));
        response.setCheckScope(safe(request.getCheckScope()).toUpperCase(Locale.ROOT));
        response.setRequestedBy(safe(request.getRequestedBy()));
        response.setStartedAt(now());

        List<FrameworkBuilderCompatibilityResultItemVO> resultItems = new ArrayList<>();
        addDeclarationResult(resultItems, declaration, response.getBuilderVersion());
        addSourceVersionResult(resultItems, declaration, response.getSourceContractVersion());
        addOverlayVersionResult(resultItems, declaration, response.getOverlaySchemaVersion(), response.getCheckScope());
        addIdentityResult(resultItems, request);
        addExtensionPointResult(resultItems, request);
        addEmitResult(resultItems, declaration);
        addReplayResult(resultItems, request, migrationPlan);

        String verdict = resolveVerdict(resultItems, declaration, migrationPlan, request);
        int blockingCount = countBy(resultItems, true);
        int warningCount = countWarnings(resultItems);

        response.setCompatibilityVerdict(verdict);
        response.setBlockingIssueCount(blockingCount);
        response.setWarningCount(warningCount);
        response.setCompletedAt(now());
        response.setResultItems(resultItems);

        appendJsonLine(resolvePath(compatibilityCheckFilePath), objectMapper.convertValue(response, MAP_TYPE));
        return response;
    }

    public FrameworkBuilderCompatibilityCheckResponseVO getCompatibilityCheck(String compatibilityCheckRunId) throws Exception {
        requireField(compatibilityCheckRunId, "compatibilityCheckRunId");
        Map<String, Object> record = findLastRecord(resolvePath(compatibilityCheckFilePath),
                "compatibilityCheckRunId", safe(compatibilityCheckRunId));
        if (record.isEmpty()) {
            throw new IllegalArgumentException("compatibilityCheckRunId was not found.");
        }
        return objectMapper.convertValue(record, FrameworkBuilderCompatibilityCheckResponseVO.class);
    }

    public List<FrameworkBuilderCompatibilityDeclarationVO> getCompatibilityDeclarations(String builderVersion, String status) {
        List<FrameworkBuilderCompatibilityDeclarationVO> declarations = buildDeclarations();
        List<FrameworkBuilderCompatibilityDeclarationVO> filtered = new ArrayList<>();
        for (FrameworkBuilderCompatibilityDeclarationVO declaration : declarations) {
            if (declaration == null) {
                continue;
            }
            if (!safe(builderVersion).isEmpty() && !safe(builderVersion).equals(safe(declaration.getBuilderVersion()))) {
                continue;
            }
            if (!safe(status).isEmpty() && !safe(status).equalsIgnoreCase(safe(declaration.getStatus()))) {
                continue;
            }
            filtered.add(declaration);
        }
        return filtered;
    }

    public List<FrameworkBuilderMigrationPlanVO> getMigrationPlans(String fromBuilderVersion,
                                                                   String toBuilderVersion,
                                                                   String status) {
        List<FrameworkBuilderMigrationPlanVO> plans = buildMigrationPlans();
        List<FrameworkBuilderMigrationPlanVO> filtered = new ArrayList<>();
        for (FrameworkBuilderMigrationPlanVO plan : plans) {
            if (plan == null) {
                continue;
            }
            if (!safe(fromBuilderVersion).isEmpty()
                    && !safe(fromBuilderVersion).equals(safe(plan.getFromBuilderVersion()))) {
                continue;
            }
            if (!safe(toBuilderVersion).isEmpty()
                    && !safe(toBuilderVersion).equals(safe(plan.getToBuilderVersion()))) {
                continue;
            }
            if (!safe(status).isEmpty() && !safe(status).equalsIgnoreCase(safe(plan.getStatus()))) {
                continue;
            }
            filtered.add(plan);
        }
        return filtered;
    }

    private void addDeclarationResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                      FrameworkBuilderCompatibilityDeclarationVO declaration,
                                      String builderVersion) {
        if (declaration == null) {
            items.add(buildResult("SOURCE_RANGE", "BUILDER", builderVersion, "ERROR",
                    "DECLARATION_MISSING", "No compatibility declaration matched builderVersion.", true));
            return;
        }
        items.add(buildResult("SOURCE_RANGE", "BUILDER", builderVersion, "INFO",
                "DECLARATION_FOUND", "Compatibility declaration matched builderVersion.", false));
    }

    private void addSourceVersionResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                        FrameworkBuilderCompatibilityDeclarationVO declaration,
                                        String sourceContractVersion) {
        if (declaration == null) {
            return;
        }
        boolean supported = declaration.getSupportedSourceContractVersions().contains(sourceContractVersion);
        items.add(buildResult("SOURCE_RANGE", "SOURCE_CONTRACT", sourceContractVersion,
                supported ? "INFO" : "ERROR",
                supported ? "SOURCE_SUPPORTED" : "SOURCE_UNSUPPORTED",
                supported ? "Source contract version is supported."
                        : "Source contract version is outside the supported range.",
                !supported));
    }

    private void addOverlayVersionResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                         FrameworkBuilderCompatibilityDeclarationVO declaration,
                                         String overlaySchemaVersion,
                                         String checkScope) {
        boolean overlayRequired = !"SOURCE_ONLY".equalsIgnoreCase(safe(checkScope));
        if (!overlayRequired && safe(overlaySchemaVersion).isEmpty()) {
            items.add(buildResult("OVERLAY_RANGE", "OVERLAY", "", "INFO",
                    "OVERLAY_NOT_REQUIRED", "Overlay schema is not required for SOURCE_ONLY checks.", false));
            return;
        }
        if (safe(overlaySchemaVersion).isEmpty()) {
            items.add(buildResult("OVERLAY_RANGE", "OVERLAY", "", "WARN",
                    "OVERLAY_VERSION_MISSING", "overlaySchemaVersion was not supplied.", false));
            return;
        }
        boolean supported = declaration != null
                && declaration.getSupportedOverlaySchemaVersions().contains(overlaySchemaVersion);
        items.add(buildResult("OVERLAY_RANGE", "OVERLAY", overlaySchemaVersion,
                supported ? "INFO" : "ERROR",
                supported ? "OVERLAY_SUPPORTED" : "OVERLAY_UNSUPPORTED",
                supported ? "Overlay schema version is supported."
                        : "Overlay schema version is outside the supported range.",
                overlayRequired && !supported));
    }

    private void addIdentityResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                   FrameworkBuilderCompatibilityCheckRequestVO request) {
        boolean complete = !safe(request == null ? null : request.getGuidedStateId()).isEmpty()
                && !safe(request == null ? null : request.getScreenFamilyRuleId()).isEmpty()
                && !safe(request == null ? null : request.getTemplateLineId()).isEmpty();
        items.add(buildResult("IDENTITY_STABILITY", "IDENTITY_KEYS",
                safe(request == null ? null : request.getPageId()),
                complete ? "INFO" : "WARN",
                complete ? "IDENTITY_KEYS_PRESENT" : "IDENTITY_KEYS_PARTIAL",
                complete ? "Stable identity keys were supplied for replay-safe regeneration."
                        : "guidedStateId, screenFamilyRuleId, or templateLineId is missing.",
                false));
    }

    private void addExtensionPointResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                         FrameworkBuilderCompatibilityCheckRequestVO request) {
        boolean hasOverlaySet = !safe(request == null ? null : request.getOverlaySetId()).isEmpty();
        items.add(buildResult("EXTENSION_POINT", "OVERLAY_SET", safe(request == null ? null : request.getOverlaySetId()),
                hasOverlaySet ? "INFO" : "WARN",
                hasOverlaySet ? "OVERLAY_SET_BOUND" : "OVERLAY_SET_NOT_BOUND",
                hasOverlaySet ? "Overlay set is bound for compatibility evaluation."
                        : "No overlaySetId was provided. Overlay-heavy replay was not fully evaluated.",
                false));
    }

    private void addEmitResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                               FrameworkBuilderCompatibilityDeclarationVO declaration) {
        if (declaration == null) {
            return;
        }
        items.add(buildResult("MANIFEST_EMIT", "MANIFEST_CONTRACT", declaration.getEmittedManifestContractVersion(),
                "INFO", "MANIFEST_EMIT_READY", "Builder line declares an emitted manifest contract.", false));
        items.add(buildResult("AUTHORITY_EMIT", "AUTHORITY_CONTRACT", declaration.getEmittedAuthorityContractVersion(),
                "INFO", "AUTHORITY_EMIT_READY", "Builder line declares an emitted authority contract.", false));
    }

    private void addReplayResult(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                 FrameworkBuilderCompatibilityCheckRequestVO request,
                                 FrameworkBuilderMigrationPlanVO migrationPlan) {
        boolean replayCheck = "REPLAY_VALIDATION".equalsIgnoreCase(safe(request == null ? null : request.getCheckScope()));
        if (!replayCheck) {
            items.add(buildResult("REPLAY_DIFF", "REPLAY", "", "INFO",
                    "REPLAY_NOT_REQUESTED", "Replay validation was not requested for this check.", false));
            return;
        }
        if (!safe(request == null ? null : request.getMigrationPlanId()).isEmpty() && migrationPlan == null) {
            items.add(buildResult("REPLAY_DIFF", "REPLAY", safe(request.getMigrationPlanId()), "ERROR",
                    "MIGRATION_PLAN_NOT_FOUND", "migrationPlanId was supplied but no migration plan matched.", true));
            return;
        }
        items.add(buildResult("REPLAY_DIFF", "REPLAY", safe(request == null ? null : request.getPageId()), "INFO",
                "REPLAY_READY", "Replay validation can proceed under the current skeleton contract.", false));
    }

    private String resolveVerdict(List<FrameworkBuilderCompatibilityResultItemVO> items,
                                  FrameworkBuilderCompatibilityDeclarationVO declaration,
                                  FrameworkBuilderMigrationPlanVO migrationPlan,
                                  FrameworkBuilderCompatibilityCheckRequestVO request) {
        if (declaration == null || countBy(items, true) > 0) {
            return "BLOCKED";
        }
        if (!safe(request == null ? null : request.getMigrationPlanId()).isEmpty()) {
            return migrationPlan == null ? "BLOCKED" : "SUPPORTED_WITH_MIGRATION";
        }
        if ("READ_ONLY".equalsIgnoreCase(safe(request == null ? null : request.getCheckScope()))) {
            return "READ_ONLY_IMPORT_ONLY";
        }
        return "FULLY_SUPPORTED";
    }

    private int countBy(List<FrameworkBuilderCompatibilityResultItemVO> items, boolean blocking) {
        int count = 0;
        for (FrameworkBuilderCompatibilityResultItemVO item : items) {
            if (item != null && Boolean.valueOf(blocking).equals(item.getBlockingYn())) {
                count++;
            }
        }
        return count;
    }

    private int countWarnings(List<FrameworkBuilderCompatibilityResultItemVO> items) {
        int count = 0;
        for (FrameworkBuilderCompatibilityResultItemVO item : items) {
            if (item != null && "WARN".equalsIgnoreCase(safe(item.getSeverity()))) {
                count++;
            }
        }
        return count;
    }

    private FrameworkBuilderCompatibilityResultItemVO buildResult(String resultType,
                                                                  String targetScope,
                                                                  String targetKey,
                                                                  String severity,
                                                                  String ruleCode,
                                                                  String summary,
                                                                  boolean blockingYn) {
        FrameworkBuilderCompatibilityResultItemVO item = new FrameworkBuilderCompatibilityResultItemVO();
        item.setResultType(resultType);
        item.setTargetScope(targetScope);
        item.setTargetKey(targetKey);
        item.setSeverity(severity);
        item.setRuleCode(ruleCode);
        item.setSummary(summary);
        item.setBlockingYn(blockingYn);
        return item;
    }

    private FrameworkBuilderCompatibilityDeclarationVO findDeclaration(
            List<FrameworkBuilderCompatibilityDeclarationVO> declarations,
            String builderVersion) {
        for (FrameworkBuilderCompatibilityDeclarationVO declaration : declarations) {
            if (declaration != null && builderVersion.equals(safe(declaration.getBuilderVersion()))) {
                return declaration;
            }
        }
        return null;
    }

    private FrameworkBuilderMigrationPlanVO findMigrationPlan(String migrationPlanId, String toBuilderVersion) {
        if (migrationPlanId.isEmpty() && toBuilderVersion.isEmpty()) {
            return null;
        }
        for (FrameworkBuilderMigrationPlanVO plan : buildMigrationPlans()) {
            if (plan == null) {
                continue;
            }
            if (!migrationPlanId.isEmpty() && migrationPlanId.equals(safe(plan.getMigrationPlanId()))) {
                return plan;
            }
            if (migrationPlanId.isEmpty() && toBuilderVersion.equals(safe(plan.getToBuilderVersion()))) {
                return plan;
            }
        }
        return null;
    }

    private List<FrameworkBuilderCompatibilityDeclarationVO> buildDeclarations() {
        FrameworkBuilderCompatibilityDeclarationVO stable = new FrameworkBuilderCompatibilityDeclarationVO();
        stable.setCompatibilityDeclarationId("builder-comp-2026-03-24");
        stable.setBuilderVersion("2026-03-24");
        stable.setBuilderRulePackVersion("2026-03-24");
        stable.setTemplatePackVersion("2026-03-24");
        stable.setSupportedSourceContractVersions(new ArrayList<>(List.of("2026-03-23", "2026-03-24")));
        stable.setSupportedOverlaySchemaVersions(new ArrayList<>(List.of("2026-03-24")));
        stable.setEmittedManifestContractVersion("2026-03-24");
        stable.setEmittedAuthorityContractVersion("2026-03-24");
        stable.setReleaseCompatibilityVersion("2026-03-line");
        stable.setCompatibilityVerdict("FULLY_SUPPORTED");
        stable.setBreakingChangeYn(Boolean.FALSE);
        stable.setStatus("ACTIVE");

        FrameworkBuilderCompatibilityDeclarationVO migrationLine = new FrameworkBuilderCompatibilityDeclarationVO();
        migrationLine.setCompatibilityDeclarationId("builder-comp-2026-04-01");
        migrationLine.setBuilderVersion("2026-04-01");
        migrationLine.setBuilderRulePackVersion("2026-04-01");
        migrationLine.setTemplatePackVersion("2026-04-01");
        migrationLine.setSupportedSourceContractVersions(new ArrayList<>(List.of("2026-03-24", "2026-04-01")));
        migrationLine.setSupportedOverlaySchemaVersions(new ArrayList<>(List.of("2026-03-24", "2026-04-01")));
        migrationLine.setEmittedManifestContractVersion("2026-04-01");
        migrationLine.setEmittedAuthorityContractVersion("2026-04-01");
        migrationLine.setReleaseCompatibilityVersion("2026-04-line");
        migrationLine.setCompatibilityVerdict("SUPPORTED_WITH_MIGRATION");
        migrationLine.setBreakingChangeYn(Boolean.TRUE);
        migrationLine.setStatus("ACTIVE");

        return new ArrayList<>(List.of(stable, migrationLine));
    }

    private List<FrameworkBuilderMigrationPlanVO> buildMigrationPlans() {
        FrameworkBuilderMigrationPlanVO plan = new FrameworkBuilderMigrationPlanVO();
        plan.setMigrationPlanId("builder-mig-2026-03-24-to-2026-04-01");
        plan.setFromBuilderVersion("2026-03-24");
        plan.setToBuilderVersion("2026-04-01");
        plan.setFromSourceContractVersions(new ArrayList<>(List.of("2026-03-23", "2026-03-24")));
        plan.setToSourceContractVersions(new ArrayList<>(List.of("2026-04-01")));
        plan.setFromOverlaySchemaVersions(new ArrayList<>(List.of("2026-03-24")));
        plan.setToOverlaySchemaVersions(new ArrayList<>(List.of("2026-04-01")));
        plan.setManualReviewRequiredYn(Boolean.TRUE);
        plan.setStatus("ACTIVE");
        return new ArrayList<>(Collections.singletonList(plan));
    }

    private void appendJsonLine(Path path, Map<String, Object> payload) throws Exception {
        fileLock.lock();
        try {
            Path parent = path.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            try (BufferedWriter writer = Files.newBufferedWriter(path,
                    StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.WRITE,
                    Files.exists(path)
                            ? java.nio.file.StandardOpenOption.APPEND
                            : java.nio.file.StandardOpenOption.CREATE)) {
                writer.write(objectMapper.writeValueAsString(payload));
                writer.newLine();
            }
        } finally {
            fileLock.unlock();
        }
    }

    private Map<String, Object> findLastRecord(Path path, String key, String value) throws Exception {
        if (path == null || !Files.exists(path)) {
            return Collections.emptyMap();
        }
        Map<String, Object> matched = new LinkedHashMap<>();
        fileLock.lock();
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                Map<String, Object> row = objectMapper.readValue(line, MAP_TYPE);
                if (value.equals(safe(asString(row.get(key))))) {
                    matched = row;
                }
            }
        } finally {
            fileLock.unlock();
        }
        return matched;
    }

    private Path resolvePath(String filePath) {
        return Paths.get(firstNonBlank(filePath, "/tmp/carbonet-framework-builder-compatibility-check.jsonl"));
    }

    private void requireField(String value, String fieldName) {
        if (safe(value).isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
    }

    private String buildId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "");
    }

    private String now() {
        return LocalDateTime.now().format(TS_FORMAT);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (!safe(value).isEmpty()) {
                return safe(value);
            }
        }
        return "";
    }
}
