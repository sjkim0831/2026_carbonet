package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.logging.RequestExecutionLogPage;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.feature.admin.mapper.AuthGroupManageMapper;
import egovframework.com.feature.admin.mapper.AdminSummarySnapshotMapper;
import egovframework.com.feature.admin.model.vo.AdminSummarySnapshotVO;
import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.EmissionResultSummaryView;
import egovframework.com.feature.admin.model.vo.FeatureCatalogItemVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSectionVO;
import egovframework.com.feature.admin.model.vo.FeatureCatalogSummarySnapshot;
import egovframework.com.feature.admin.model.vo.SecurityAuditAggregate;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.feature.admin.service.AdminSummaryService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service("adminSummaryService")
public class AdminSummaryServiceImpl extends EgovAbstractServiceImpl implements AdminSummaryService {

    private static final Logger log = LoggerFactory.getLogger(AdminSummaryServiceImpl.class);
    private static final TypeReference<List<Map<String, String>>> CARD_LIST_TYPE = new TypeReference<List<Map<String, String>>>() {};
    private static final String SNAPSHOT_TYPE_CARD_LIST = "CARD_LIST";
    private static final String SNAPSHOT_TYPE_AUDIT_SUMMARY = "SECURITY_AUDIT_SUMMARY";

    private final RequestExecutionLogService requestExecutionLogService;
    private final AdminSummarySnapshotMapper adminSummarySnapshotMapper;
    private final AuthGroupManageMapper authGroupManageMapper;
    private final ObjectMapper objectMapper;

    public AdminSummaryServiceImpl(RequestExecutionLogService requestExecutionLogService,
            AdminSummarySnapshotMapper adminSummarySnapshotMapper,
            AuthGroupManageMapper authGroupManageMapper,
            ObjectMapper objectMapper) {
        this.requestExecutionLogService = requestExecutionLogService;
        this.adminSummarySnapshotMapper = adminSummarySnapshotMapper;
        this.authGroupManageMapper = authGroupManageMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public EmissionResultFilterSnapshot buildEmissionResultFilterSnapshot(boolean isEn,
            String keyword,
            String normalizedResultStatus,
            String normalizedVerificationStatus) {
        return filterEmissionResultSummaryViews(buildEmissionResultSummaryViews(isEn),
                safeString(keyword).toLowerCase(Locale.ROOT),
                safeString(normalizedResultStatus).toUpperCase(Locale.ROOT),
                safeString(normalizedVerificationStatus).toUpperCase(Locale.ROOT));
    }

    @Override
    public FeatureCatalogSummarySnapshot summarizeFeatureCatalog(List<FeatureCatalogSectionVO> featureSections) {
        if (featureSections == null || featureSections.isEmpty()) {
            return FeatureCatalogSummarySnapshot.empty();
        }
        int totalFeatureCount = 0;
        int unassignedFeatureCount = 0;
        for (FeatureCatalogSectionVO section : featureSections) {
            if (section == null || section.getFeatures() == null || section.getFeatures().isEmpty()) {
                continue;
            }
            for (FeatureCatalogItemVO feature : section.getFeatures()) {
                if (feature == null) {
                    continue;
                }
                totalFeatureCount++;
                if (feature.isUnassignedToRole()) {
                    unassignedFeatureCount++;
                }
            }
        }
        return new FeatureCatalogSummarySnapshot(totalFeatureCount, unassignedFeatureCount);
    }

    @Override
    public List<Map<String, String>> getIpWhitelistSummary(boolean isEn) {
        return loadCardSnapshot("IP_WHITELIST_SUMMARY", isEn, defaultIpWhitelistSummary(isEn));
    }

    @Override
    public List<Map<String, String>> getSecurityPolicySummary(boolean isEn) {
        return loadCardSnapshot("SECURITY_POLICY_SUMMARY", isEn, defaultSecurityPolicySummary(isEn));
    }

    @Override
    public List<Map<String, String>> getSecurityMonitoringCards(boolean isEn) {
        return loadCardSnapshot("SECURITY_MONITORING_SUMMARY", isEn, defaultSecurityMonitoringSummary(isEn));
    }

    @Override
    public List<Map<String, String>> getBlocklistSummary(boolean isEn) {
        return loadCardSnapshot("BLOCKLIST_SUMMARY", isEn, defaultBlocklistSummary(isEn));
    }

    @Override
    public SecurityAuditSnapshot loadSecurityAuditSnapshot() {
        try {
            List<RequestExecutionLogVO> auditLogs = new ArrayList<>();
            SecurityAuditAggregate aggregate = new SecurityAuditAggregate();
            RequestExecutionLogPage auditPage = requestExecutionLogService.searchRecent(this::isSecurityAuditTarget, 1, 300);
            for (RequestExecutionLogVO item : auditPage.getItems()) {
                auditLogs.add(item);
                aggregate.accept(item);
            }
            return new SecurityAuditSnapshot(auditLogs, aggregate);
        } catch (Exception e) {
            log.warn("Failed to load request execution logs for security audit.", e);
            return SecurityAuditSnapshot.empty();
        }
    }

    @Override
    public List<Map<String, String>> getSecurityAuditSummary(SecurityAuditSnapshot auditSnapshot, boolean isEn) {
        String snapshotKey = snapshotKey("SECURITY_AUDIT_SUMMARY", isEn);
        List<Map<String, String>> persisted = readSnapshotCards(snapshotKey);
        if (!persisted.isEmpty()) {
            return persisted;
        }
        List<Map<String, String>> rows = buildSecurityAuditSummaryRows(auditSnapshot, isEn);
        persistSnapshot(snapshotKey, rows, SNAPSHOT_TYPE_AUDIT_SUMMARY, resolveLatestAuditTimestamp(auditSnapshot));
        return rows;
    }

    @Override
    public List<Map<String, String>> buildSecurityAuditRows(List<RequestExecutionLogVO> auditLogs, boolean isEn) {
        if (auditLogs == null || auditLogs.isEmpty()) {
            return Collections.emptyList();
        }
        return auditLogs.stream()
                .limit(50)
                .map(item -> mapOf(
                        "auditAt", safeString(item.getExecutedAt()),
                        "actor", resolveSecurityAuditActor(item),
                        "action", resolveSecurityAuditAction(item, isEn),
                        "target", safeString(item.getRequestUri()),
                        "detail", resolveSecurityAuditDetail(item, isEn)))
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, String>> getSchedulerSummary(boolean isEn) {
        return loadCardSnapshot("SCHEDULER_SUMMARY", isEn, defaultSchedulerSummary(isEn));
    }

    @Override
    public Map<String, Object> buildMenuPermissionDiagnosticSummary(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
            List<Map<String, String>> menuUrlRows = authGroupManageMapper.selectActiveMenuUrlRows();
            List<Map<String, String>> viewFeatureRows = authGroupManageMapper.selectActiveMenuViewFeatureRows();
            List<Map<String, String>> duplicatedMenuUrls = buildDuplicatedMenuUrlRows(menuUrlRows);
            List<Map<String, String>> duplicatedViewMappings = buildDuplicatedViewMappingRows(viewFeatureRows);
            response.put("generatedAt", java.time.LocalDateTime.now().toString());
            response.put("menuUrlDuplicateCount", duplicatedMenuUrls.size());
            response.put("viewFeatureDuplicateCount", duplicatedViewMappings.size());
            response.put("cleanupRecommendationCount", duplicatedMenuUrls.size() + duplicatedViewMappings.size());
            response.put("duplicatedMenuUrls", duplicatedMenuUrls);
            response.put("duplicatedViewMappings", duplicatedViewMappings);
            response.put("message", duplicatedMenuUrls.isEmpty() && duplicatedViewMappings.isEmpty()
                    ? (isEn ? "No duplicate active menu URL or VIEW feature mapping was found."
                            : "활성 메뉴 URL 또는 VIEW 기능 중복 매핑이 없습니다.")
                    : (isEn ? "Duplicate active menu URL or VIEW feature mappings were detected."
                            : "활성 메뉴 URL 또는 VIEW 기능 중복 매핑이 감지되었습니다."));
        } catch (Exception e) {
            log.warn("Failed to build menu permission diagnostic summary.", e);
            response.put("generatedAt", java.time.LocalDateTime.now().toString());
            response.put("menuUrlDuplicateCount", 0);
            response.put("viewFeatureDuplicateCount", 0);
            response.put("cleanupRecommendationCount", 0);
            response.put("duplicatedMenuUrls", Collections.emptyList());
            response.put("duplicatedViewMappings", Collections.emptyList());
            response.put("message", isEn
                    ? "Failed to collect menu permission diagnostics."
                    : "메뉴 권한 진단 정보를 수집하지 못했습니다.");
        }
        return response;
    }

    private List<Map<String, String>> buildSecurityAuditSummaryRows(SecurityAuditSnapshot auditSnapshot, boolean isEn) {
        SecurityAuditAggregate aggregate = auditSnapshot == null
                ? SecurityAuditAggregate.empty()
                : auditSnapshot.getAggregate();
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Company Scope Denies" : "회사 스코프 차단", String.valueOf(aggregate.getDeniedCount()),
                isEn ? "Blocked requests due to missing or mismatched company scope." : "회사 컨텍스트 누락 또는 불일치로 차단된 요청"));
        rows.add(summaryCard(isEn ? "Global No-Context" : "전역 예외 허용", String.valueOf(aggregate.getGlobalBypassCount()),
                isEn ? "Global admin executions without an explicit company context." : "명시적 회사 ID 없이 허용된 전역 관리자 실행"));
        rows.add(summaryCard(isEn ? "Implicit Self Scope" : "자기회사 암묵 적용", String.valueOf(aggregate.getImplicitSelfCount()),
                isEn ? "Requests resolved to the actor company without an explicit company parameter." : "회사 ID 파라미터 없이 계정 회사로 해석된 요청"));
        rows.add(summaryCard(isEn ? "Company Mismatch" : "회사 불일치", String.valueOf(aggregate.getMismatchCount()),
                isEn ? "Requests blocked because the target company did not match the actor company." : "대상 회사와 계정 회사가 달라 차단된 요청"));
        return rows;
    }

    private EmissionResultFilterSnapshot filterEmissionResultSummaryViews(List<EmissionResultSummaryView> allItems,
            String keyword,
            String normalizedResultStatus,
            String normalizedVerificationStatus) {
        List<EmissionResultSummaryView> filteredItems = new ArrayList<>();
        long reviewCount = 0L;
        long verifiedCount = 0L;
        if (allItems == null || allItems.isEmpty()) {
            return new EmissionResultFilterSnapshot(filteredItems, reviewCount, verifiedCount);
        }
        for (EmissionResultSummaryView item : allItems) {
            if (item == null) {
                continue;
            }
            if (!keyword.isEmpty()
                    && !item.getProjectName().toLowerCase(Locale.ROOT).contains(keyword)
                    && !item.getCompanyName().toLowerCase(Locale.ROOT).contains(keyword)
                    && !item.getResultId().toLowerCase(Locale.ROOT).contains(keyword)) {
                continue;
            }
            if (!normalizedResultStatus.isEmpty() && !normalizedResultStatus.equals(item.getResultStatusCode())) {
                continue;
            }
            if (!normalizedVerificationStatus.isEmpty()
                    && !normalizedVerificationStatus.equals(item.getVerificationStatusCode())) {
                continue;
            }
            filteredItems.add(item);
            if ("REVIEW".equals(item.getResultStatusCode())) {
                reviewCount++;
            }
            if ("VERIFIED".equals(item.getVerificationStatusCode())) {
                verifiedCount++;
            }
        }
        return new EmissionResultFilterSnapshot(filteredItems, reviewCount, verifiedCount);
    }

    private List<EmissionResultSummaryView> buildEmissionResultSummaryViews(boolean isEn) {
        String prefix = isEn ? "/en/admin" : "/admin";
        List<EmissionResultSummaryView> items = new ArrayList<>();
        items.add(new EmissionResultSummaryView("ER-2026-001", "2026 Q1 Capture Plant Baseline",
                "Korea CCUS Plant", "2026-03-04", "125,440 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "VERIFIED", isEn ? "Verified" : "검증 완료",
                prefix + "/emission/result_detail?resultId=ER-2026-001"));
        items.add(new EmissionResultSummaryView("ER-2026-002", "Blue Hydrogen Process Review",
                "Hanbit Energy", "2026-03-03", "84,210 tCO2e", "REVIEW",
                isEn ? "Under Review" : "검토 중", "PENDING", isEn ? "Pending" : "검증 대기",
                prefix + "/emission/result_detail?resultId=ER-2026-002"));
        items.add(new EmissionResultSummaryView("ER-2026-003", "Transport Network Simulation",
                "East Carbon Hub", "2026-02-28", "56,980 tCO2e", "DRAFT",
                isEn ? "Draft" : "임시 저장", "NOT_REQUIRED", isEn ? "Not Required" : "검증 제외",
                prefix + "/emission/result_detail?resultId=ER-2026-003"));
        items.add(new EmissionResultSummaryView("ER-2026-004", "Storage Integrity Monitoring",
                "Seohae Storage", "2026-02-26", "142,300 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "VERIFIED", isEn ? "Verified" : "검증 완료",
                prefix + "/emission/result_detail?resultId=ER-2026-004"));
        items.add(new EmissionResultSummaryView("ER-2026-005", "Methanol Conversion Project",
                "Daehan Synthesis", "2026-02-24", "73,560 tCO2e", "REVIEW",
                isEn ? "Under Review" : "검토 중", "PENDING", isEn ? "Pending" : "검증 대기",
                prefix + "/emission/result_detail?resultId=ER-2026-005"));
        items.add(new EmissionResultSummaryView("ER-2026-006", "Regional Capture Efficiency Audit",
                "Busan Capture Cluster", "2026-02-20", "91,004 tCO2e", "COMPLETED",
                isEn ? "Completed" : "산정 완료", "VERIFIED", isEn ? "Verified" : "검증 완료",
                prefix + "/emission/result_detail?resultId=ER-2026-006"));
        return items;
    }

    private List<Map<String, String>> buildDuplicatedMenuUrlRows(List<Map<String, String>> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Set<String>> grouped = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String menuUrl = safeString(row.get("menuUrl"));
            String menuCode = safeString(row.get("menuCode"));
            if (menuUrl.isEmpty() || menuCode.isEmpty()) {
                continue;
            }
            grouped.computeIfAbsent(menuUrl, key -> new LinkedHashSet<>()).add(menuCode);
        }
        List<Map<String, String>> result = new ArrayList<>();
        for (Map.Entry<String, Set<String>> entry : grouped.entrySet()) {
            if (entry.getValue().size() < 2) {
                continue;
            }
            List<String> menuCodes = new ArrayList<>(entry.getValue());
            Collections.sort(menuCodes);
            String primaryMenuCode = menuCodes.get(0);
            String disableCandidates = menuCodes.size() > 1
                    ? String.join(", ", menuCodes.subList(1, menuCodes.size()))
                    : "";
            result.add(mapOf(
                    "menuUrl", entry.getKey(),
                    "menuCodeCount", String.valueOf(menuCodes.size()),
                    "menuCodes", String.join(", ", menuCodes),
                    "recommendedPrimaryMenuCode", primaryMenuCode,
                    "recommendedDisableMenuCodes", disableCandidates,
                    "recommendedAction", "KEEP_PRIMARY_DISABLE_OTHERS",
                    "recommendedSqlPreview", buildMenuCleanupSqlPreview(entry.getKey(), primaryMenuCode, disableCandidates)));
        }
        return result;
    }

    private List<Map<String, String>> buildDuplicatedViewMappingRows(List<Map<String, String>> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Set<String>> menuCodesByUrl = new LinkedHashMap<>();
        Map<String, Set<String>> featureCodesByUrl = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String menuUrl = safeString(row.get("menuUrl"));
            String menuCode = safeString(row.get("menuCode"));
            String featureCode = safeString(row.get("featureCode"));
            if (menuUrl.isEmpty() || featureCode.isEmpty()) {
                continue;
            }
            menuCodesByUrl.computeIfAbsent(menuUrl, key -> new LinkedHashSet<>()).add(menuCode);
            featureCodesByUrl.computeIfAbsent(menuUrl, key -> new LinkedHashSet<>()).add(featureCode);
        }
        List<Map<String, String>> result = new ArrayList<>();
        for (Map.Entry<String, Set<String>> entry : featureCodesByUrl.entrySet()) {
            if (entry.getValue().size() < 2) {
                continue;
            }
            List<String> menuCodes = new ArrayList<>(menuCodesByUrl.getOrDefault(entry.getKey(), Collections.emptySet()));
            List<String> featureCodes = new ArrayList<>(entry.getValue());
            Collections.sort(menuCodes);
            Collections.sort(featureCodes);
            String primaryMenuCode = menuCodes.isEmpty() ? "" : menuCodes.get(0);
            String primaryFeatureCode = featureCodes.get(0);
            String removeCandidates = featureCodes.size() > 1
                    ? String.join(", ", featureCodes.subList(1, featureCodes.size()))
                    : "";
            result.add(mapOf(
                    "menuUrl", entry.getKey(),
                    "menuCodeCount", String.valueOf(menuCodes.size()),
                    "menuCodes", String.join(", ", menuCodes),
                    "viewFeatureCount", String.valueOf(featureCodes.size()),
                    "featureCodes", String.join(", ", featureCodes),
                    "recommendedPrimaryMenuCode", primaryMenuCode,
                    "recommendedPrimaryFeatureCode", primaryFeatureCode,
                    "recommendedRemoveFeatureCodes", removeCandidates,
                    "recommendedAction", "KEEP_PRIMARY_VIEW_REMOVE_OTHERS",
                    "recommendedSqlPreview", buildViewCleanupSqlPreview(entry.getKey(), primaryMenuCode, primaryFeatureCode, removeCandidates)));
        }
        return result;
    }

    private String buildMenuCleanupSqlPreview(String menuUrl, String primaryMenuCode, String disableCandidates) {
        List<String> candidateCodes = splitCsv(disableCandidates);
        StringBuilder builder = new StringBuilder();
        builder.append("-- menuUrl: ").append(menuUrl).append("\n");
        builder.append("-- keep primary menu: ").append(primaryMenuCode).append("\n");
        if (candidateCodes.isEmpty()) {
            builder.append("-- no disable candidates");
            return builder.toString();
        }
        builder.append("SELECT MENU_CODE, MENU_URL, USE_AT\n")
                .append("FROM COMTNMENUINFO\n")
                .append("WHERE MENU_CODE IN (").append(joinQuoted(candidateCodes)).append(")\n")
                .append("ORDER BY MENU_CODE;\n\n");
        builder.append("UPDATE COMTNMENUINFO\n")
                .append("SET USE_AT = 'N'\n")
                .append("WHERE MENU_CODE IN (").append(joinQuoted(candidateCodes)).append(");");
        return builder.toString();
    }

    private String buildViewCleanupSqlPreview(String menuUrl,
            String primaryMenuCode,
            String primaryFeatureCode,
            String removeCandidates) {
        List<String> candidateCodes = splitCsv(removeCandidates);
        StringBuilder builder = new StringBuilder();
        builder.append("-- menuUrl: ").append(menuUrl).append("\n");
        builder.append("-- keep primary menu/view: ").append(primaryMenuCode).append(" / ").append(primaryFeatureCode).append("\n");
        if (candidateCodes.isEmpty()) {
            builder.append("-- no redundant VIEW features");
            return builder.toString();
        }
        builder.append("SELECT MENU_CODE, FEATURE_CODE, USE_AT\n")
                .append("FROM COMTNMENUFUNCTIONINFO\n")
                .append("WHERE FEATURE_CODE IN (").append(joinQuoted(candidateCodes)).append(")\n")
                .append("ORDER BY MENU_CODE, FEATURE_CODE;\n\n");
        builder.append("UPDATE COMTNMENUFUNCTIONINFO\n")
                .append("SET USE_AT = 'N'\n")
                .append("WHERE FEATURE_CODE IN (").append(joinQuoted(candidateCodes)).append(");");
        return builder.toString();
    }

    private List<String> splitCsv(String csv) {
        if (csv == null || csv.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<String> values = new ArrayList<>();
        for (String token : csv.split(",")) {
            String value = safeString(token);
            if (!value.isEmpty()) {
                values.add(value);
            }
        }
        return values;
    }

    private String joinQuoted(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return values.stream()
                .map(value -> "'" + value.replace("'", "''") + "'")
                .collect(Collectors.joining(", "));
    }

    private boolean isSecurityAuditTarget(RequestExecutionLogVO item) {
        if (item == null) {
            return false;
        }
        String decision = safeString(item.getCompanyScopeDecision()).toUpperCase(Locale.ROOT);
        return !decision.isEmpty()
                && ("DENY_MISSING_COMPANY_CONTEXT".equals(decision)
                || "DENY_COMPANY_MISMATCH".equals(decision)
                || "DENY_NO_ACTOR_COMPANY".equals(decision)
                || "ALLOW_GLOBAL_NO_CONTEXT".equals(decision)
                || "ALLOW_IMPLICIT_SELF".equals(decision)
                || "DENY_GLOBAL_ONLY_ROUTE".equals(decision)
                || "DENY_NO_COMPANY_SCOPE_PERMISSION".equals(decision));
    }

    private String resolveSecurityAuditActor(RequestExecutionLogVO item) {
        String actor = safeString(item.getActorUserId());
        String actorType = safeString(item.getActorType());
        String insttId = safeString(item.getActorInsttId());
        StringBuilder builder = new StringBuilder(actor.isEmpty() ? "-" : actor);
        if (!actorType.isEmpty()) {
            builder.append(" (").append(actorType).append(")");
        }
        if (!insttId.isEmpty()) {
            builder.append(" / ").append(insttId);
        }
        return builder.toString();
    }

    private String resolveSecurityAuditAction(RequestExecutionLogVO item, boolean isEn) {
        String decision = safeString(item.getCompanyScopeDecision()).toUpperCase(Locale.ROOT);
        if ("DENY_MISSING_COMPANY_CONTEXT".equals(decision)) {
            return isEn ? "Blocked missing company context" : "회사 컨텍스트 누락 차단";
        }
        if ("DENY_COMPANY_MISMATCH".equals(decision)) {
            return isEn ? "Blocked company mismatch" : "회사 불일치 차단";
        }
        if ("DENY_NO_ACTOR_COMPANY".equals(decision)) {
            return isEn ? "Blocked missing actor company" : "계정 회사 정보 누락 차단";
        }
        if ("ALLOW_GLOBAL_NO_CONTEXT".equals(decision)) {
            return isEn ? "Allowed global execution without company context" : "회사 컨텍스트 없는 전역 관리자 허용";
        }
        if ("ALLOW_IMPLICIT_SELF".equals(decision)) {
            return isEn ? "Allowed implicit self-company resolution" : "자기회사 암묵 해석 허용";
        }
        if ("DENY_GLOBAL_ONLY_ROUTE".equals(decision)) {
            return isEn ? "Blocked global-only route" : "전체 관리자 전용 경로 차단";
        }
        return decision.isEmpty() ? (isEn ? "Request audit" : "요청 감사") : decision;
    }

    private String resolveSecurityAuditDetail(RequestExecutionLogVO item, boolean isEn) {
        String actorInsttId = safeString(item.getActorInsttId());
        String targetInsttId = safeString(item.getTargetCompanyContextId());
        String explicit = item.isCompanyContextExplicit()
                ? (isEn ? "Explicit context" : "명시적 컨텍스트")
                : (isEn ? "Implicit/no parameter" : "암묵/파라미터 없음");
        String reason = safeString(item.getCompanyScopeReason());
        return (isEn ? "actor=" : "계정=") + (actorInsttId.isEmpty() ? "-" : actorInsttId)
                + ", " + (isEn ? "target=" : "대상=") + (targetInsttId.isEmpty() ? "-" : targetInsttId)
                + ", " + explicit
                + (reason.isEmpty() ? "" : ", " + reason);
    }

    private List<Map<String, String>> loadCardSnapshot(String baseKey, boolean isEn, List<Map<String, String>> fallback) {
        String snapshotKey = snapshotKey(baseKey, isEn);
        List<Map<String, String>> persisted = readSnapshotCards(snapshotKey);
        if (!persisted.isEmpty()) {
            return persisted;
        }
        persistSnapshot(snapshotKey, fallback, SNAPSHOT_TYPE_CARD_LIST, null);
        return fallback;
    }

    private List<Map<String, String>> readSnapshotCards(String snapshotKey) {
        try {
            AdminSummarySnapshotVO snapshot = adminSummarySnapshotMapper.selectSnapshotByKey(snapshotKey);
            if (snapshot == null || safeString(snapshot.getSnapshotJson()).isEmpty()) {
                return Collections.emptyList();
            }
            List<Map<String, String>> rows = objectMapper.readValue(snapshot.getSnapshotJson(), CARD_LIST_TYPE);
            return rows == null ? Collections.emptyList() : rows.stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.debug("Failed to read admin summary snapshot. snapshotKey={}", snapshotKey, e);
            return Collections.emptyList();
        }
    }

    private void persistSnapshot(String snapshotKey,
            List<Map<String, String>> rows,
            String snapshotType,
            String sourceUpdatedAt) {
        if (rows == null || rows.isEmpty()) {
            return;
        }
        try {
            AdminSummarySnapshotVO snapshot = new AdminSummarySnapshotVO();
            snapshot.setSnapshotKey(snapshotKey);
            snapshot.setSnapshotJson(objectMapper.writeValueAsString(rows));
            snapshot.setSnapshotType(snapshotType);
            snapshot.setSourceUpdatedAt(safeString(sourceUpdatedAt));
            snapshot.setUseAt("Y");
            if (adminSummarySnapshotMapper.countSnapshotByKey(snapshotKey) > 0) {
                adminSummarySnapshotMapper.updateSnapshot(snapshot);
            } else {
                adminSummarySnapshotMapper.insertSnapshot(snapshot);
            }
        } catch (Exception e) {
            log.debug("Failed to persist admin summary snapshot. snapshotKey={}", snapshotKey, e);
        }
    }

    private String resolveLatestAuditTimestamp(SecurityAuditSnapshot auditSnapshot) {
        if (auditSnapshot == null || auditSnapshot.getAuditLogs() == null || auditSnapshot.getAuditLogs().isEmpty()) {
            return "";
        }
        return safeString(auditSnapshot.getAuditLogs().get(0).getExecutedAt());
    }

    private String snapshotKey(String baseKey, boolean isEn) {
        return baseKey + "_" + (isEn ? "EN" : "KO");
    }

    private List<Map<String, String>> defaultIpWhitelistSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Active Rules" : "활성 규칙", "12",
                isEn ? "CIDR and single-IP policies currently applied." : "현재 게이트웨이에 반영 중인 CIDR/단일 IP 정책"));
        rows.add(summaryCard(isEn ? "Pending Requests" : "승인 대기", "3",
                isEn ? "Approval requests waiting for security review." : "보안담당 승인 대기 중인 예외 허용 요청"));
        rows.add(summaryCard(isEn ? "Expiring Today" : "오늘 만료", "2",
                isEn ? "Temporary exceptions scheduled to expire today." : "오늘 자동 회수 예정인 임시 허용"));
        rows.add(summaryCard(isEn ? "Protected Scopes" : "보호 범위", "4",
                isEn ? "Admin, API, Batch, and Internal access scopes." : "관리자, API, Batch, 내부망 범위 운영"));
        return rows;
    }

    private List<Map<String, String>> defaultSecurityPolicySummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Applied Policies" : "적용 정책", "7",
                isEn ? "Rate-limit and automated response rules currently enabled." : "현재 적용 중인 rate-limit 및 자동대응 룰"));
        rows.add(summaryCard(isEn ? "Protected Endpoints" : "보호 URL", "19",
                isEn ? "Endpoints protected by dedicated thresholds." : "개별 임계치가 설정된 엔드포인트 수"));
        rows.add(summaryCard(isEn ? "Captcha Triggers" : "CAPTCHA 발동", "3",
                isEn ? "Flows with bot challenge fallback enabled." : "봇 검증이 연결된 사용자 흐름"));
        rows.add(summaryCard(isEn ? "Escalation Paths" : "자동 조치", "4",
                isEn ? "Routes with temporary block escalation." : "임시 차단까지 자동 승격되는 정책"));
        return rows;
    }

    private List<Map<String, String>> defaultSecurityMonitoringSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Current RPS" : "현재 RPS", "1,284",
                isEn ? "Combined HTTP requests per second across external ingress." : "외부 인입 전체 기준 초당 요청 수"));
        rows.add(summaryCard(isEn ? "Blocked Requests" : "차단 요청", "438",
                isEn ? "Requests blocked in the last 5 minutes." : "최근 5분간 차단된 요청 수"));
        rows.add(summaryCard(isEn ? "429 Responses" : "429 응답", "126",
                isEn ? "Rate-limit responses in the last 5 minutes." : "최근 5분간 rate-limit 응답 수"));
        rows.add(summaryCard(isEn ? "Active Incidents" : "활성 인시던트", "2",
                isEn ? "Incidents requiring operator review." : "운영자 확인이 필요한 현재 공격 이벤트"));
        return rows;
    }

    private List<Map<String, String>> defaultBlocklistSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Active Blocks" : "활성 차단", "27",
                isEn ? "Currently enforced IP, CIDR, account, and UA blocks." : "현재 적용 중인 IP/CIDR/계정/UA 차단"));
        rows.add(summaryCard(isEn ? "Auto Blocks" : "자동 차단", "21",
                isEn ? "Entries generated by security rules." : "보안 룰로 자동 생성된 차단"));
        rows.add(summaryCard(isEn ? "Manual Blocks" : "수동 차단", "6",
                isEn ? "Operator-issued blocks requiring audit review." : "운영자가 등록한 수동 차단"));
        rows.add(summaryCard(isEn ? "Releases Today" : "오늘 해제", "4",
                isEn ? "Scheduled or approved releases for today." : "오늘 예정된 차단 해제 건수"));
        return rows;
    }

    private List<Map<String, String>> defaultSchedulerSummary(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(summaryCard(isEn ? "Registered Jobs" : "등록 잡", "14",
                isEn ? "Cron-based and on-demand jobs managed from the system menu." : "시스템 메뉴에서 관리 중인 cron 및 수동 실행 잡 수"));
        rows.add(summaryCard(isEn ? "Active Jobs" : "활성 잡", "11",
                isEn ? "Jobs enabled for production execution." : "운영 실행이 활성화된 스케줄러 잡 수"));
        rows.add(summaryCard(isEn ? "Failed Today" : "오늘 실패", "2",
                isEn ? "Jobs that require operator review today." : "오늘 운영 확인이 필요한 실패 잡 수"));
        rows.add(summaryCard(isEn ? "Next 1 Hour" : "1시간 내 예정", "6",
                isEn ? "Executions expected within the next hour." : "다음 1시간 이내 실행 예정 건수"));
        return rows;
    }

    private Map<String, String> summaryCard(String title, String value, String description) {
        Map<String, String> card = new LinkedHashMap<>();
        card.put("title", title);
        card.put("value", value);
        card.put("description", description);
        return card;
    }

    private Map<String, String> mapOf(String... values) {
        Map<String, String> result = new LinkedHashMap<>();
        if (values == null) {
            return result;
        }
        for (int i = 0; i + 1 < values.length; i += 2) {
            result.put(values[i], values[i + 1]);
        }
        return result;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
