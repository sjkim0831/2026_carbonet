package egovframework.com.feature.admin.service;

import egovframework.com.common.trace.UiManifestRegistryService;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.model.vo.AuthorInfoVO;
import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.EmissionResultSummaryView;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminShellBootstrapPageService {

    private final AdminSummaryService adminSummaryService;
    private final BackupConfigManagementService backupConfigManagementService;
    private final MenuInfoService menuInfoService;
    private final AuthGroupManageService authGroupManageService;
    private final UiManifestRegistryService uiManifestRegistryService;
    private final ObjectProvider<egovframework.com.feature.admin.web.AdminObservabilityPageService> adminObservabilityPageServiceProvider;

    private static final int SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE = 10;
    private final Map<String, Map<String, String>> tradeApprovalState = new ConcurrentHashMap<>();

    private egovframework.com.feature.admin.web.AdminObservabilityPageService adminObservabilityPageService() {
        return adminObservabilityPageServiceProvider.getObject();
    }

    public Map<String, Object> buildMemberStatsPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("title", isEn ? "Member Statistics Dashboard" : "회원 통계 현황");
        response.put("subtitle", isEn
                ? "Analyze the registered member base by member type, monthly signups, and regional distribution."
                : "시스템에 등록된 전체 회원 정보를 유형별, 지역별로 분석합니다.");
        response.put("totalMembers", 1422);
        response.put("memberTypeStats", List.of(
                statsRow("enterprise", isEn ? "Enterprise Members" : "기업 회원", "78.7", "1120", "bg-blue-600"),
                statsRow("individual", isEn ? "Individual Members" : "개인 회원", "21.3", "302", "bg-emerald-500")));
        response.put("monthlySignupStats", List.of(
                monthlySignupRow(isEn ? "Apr" : "04월", "100", "56", false),
                monthlySignupRow(isEn ? "May" : "05월", "85", "48", false),
                monthlySignupRow(isEn ? "Jun" : "06월", "120", "63", false),
                monthlySignupRow(isEn ? "Jul" : "07월", "145", "81", false),
                monthlySignupRow(isEn ? "Aug" : "08월", "170", "96", true)));
        response.put("regionalDistribution", List.of(
                regionalDistributionRow(isEn ? "Capital Area" : "수도권", "42.5", isEn ? "774 companies" : "774개 기업"),
                regionalDistributionRow(isEn ? "Yeongnam Area" : "영남권", "28.2", isEn ? "513 companies" : "513개 기업"),
                regionalDistributionRow(isEn ? "Chungcheong Area" : "충청권", "18.4", isEn ? "335 companies" : "335개 기업"),
                regionalDistributionRow(isEn ? "Honam and Others" : "호남·기타", "10.9", isEn ? "198 companies" : "198개 기업")));
        return response;
    }

    public Map<String, Object> buildSecurityPolicyPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        String adminPrefix = isEn ? "/en/admin" : "/admin";
        response.put("isEn", isEn);
        response.put("securityPolicySummary", adminSummaryService.getSecurityPolicySummary(isEn));
        response.put("securityPolicyRows", buildSecurityPolicyRows(isEn));
        response.put("securityPolicyPlaybooks", buildSecurityPolicyPlaybooks(isEn));
        response.put("menuPermissionDiagnostics", adminSummaryService.buildMenuPermissionDiagnosticSummary(isEn));
        response.put("menuPermissionDiagnosticSqlDownloadUrl", "/downloads/menu-permission-diagnostics.sql");
        response.put("menuPermissionAuthGroupUrl", adminPrefix + "/auth/group");
        response.put("menuPermissionEnvironmentUrl", adminPrefix + "/system/environment-management");
        return response;
    }

    public Map<String, Object> buildSecurityMonitoringPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("securityMonitoringCards", adminSummaryService.getSecurityMonitoringCards(isEn));
        response.put("securityMonitoringTargets", adminSummaryService.getSecurityMonitoringTargets(isEn));
        response.put("securityMonitoringIps", adminSummaryService.getSecurityMonitoringIps(isEn));
        response.put("securityMonitoringEvents", adminSummaryService.mergeSecurityMonitoringEventState(adminSummaryService.getSecurityMonitoringEvents(isEn), isEn));
        response.put("securityMonitoringActivityRows", adminSummaryService.getSecurityMonitoringActivityRows(isEn));
        response.put("securityMonitoringBlockCandidates", adminSummaryService.getSecurityMonitoringBlockCandidateRows(isEn));
        return response;
    }

    public Map<String, Object> buildExternalMonitoringPageData(boolean isEn) {
        return adminObservabilityPageService().buildExternalMonitoringPagePayload(isEn);
    }

    public Map<String, Object> buildSecurityAuditPageData(
            String pageIndexParam,
            String searchKeyword,
            String actionType,
            String routeGroup,
            String startDate,
            String endDate,
            String sortKey,
            String sortDirection,
            boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }
        String normalizedKeyword = safeString(searchKeyword);
        String normalizedActionType = normalizeSecurityAuditActionType(actionType);
        String normalizedRouteGroup = normalizeSecurityAuditRouteGroup(routeGroup);
        String normalizedSortKey = normalizeSecurityAuditSortKey(sortKey);
        String normalizedSortDirection = normalizeSecurityAuditSortDirection(sortDirection);
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        List<Map<String, String>> allRows = adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn);
        List<Map<String, String>> filteredRows = filterAndSortSecurityAuditRows(
                allRows,
                normalizedKeyword,
                normalizedActionType,
                normalizedRouteGroup,
                normalizedSortKey,
                normalizedSortDirection);
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int startIndex = Math.max(currentPage - 1, 0) * SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE;
        int endIndex = Math.min(startIndex + SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE, filteredRows.size());
        List<Map<String, String>> pagedRows = startIndex >= endIndex
                ? Collections.emptyList()
                : new ArrayList<>(filteredRows.subList(startIndex, endIndex));

        response.put("isEn", isEn);
        response.put("pageIndex", currentPage);
        response.put("pageSize", SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE);
        response.put("totalCount", totalCount);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", normalizedKeyword);
        response.put("actionType", normalizedActionType);
        response.put("routeGroup", normalizedRouteGroup);
        response.put("startDate", safeString(startDate));
        response.put("endDate", safeString(endDate));
        response.put("sortKey", normalizedSortKey);
        response.put("sortDirection", normalizedSortDirection);
        response.put("filteredErrorCount", filteredRows.stream().filter(this::isSecurityAuditErrorRow).count());
        response.put("filteredRepeatedActorCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> extractSecurityAuditActorId(safeString(row.get("actor")))));
        response.put("filteredRepeatedTargetCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> safeString(row.get("target"))));
        response.put("filteredRepeatedRemoteAddrCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> safeString(row.get("remoteAddr"))));
        response.put("filteredSlowCount", filteredRows.stream().filter(this::isSecurityAuditSlowRow).count());
        response.put("securityAuditSummary", adminSummaryService.getSecurityAuditSummary(auditSnapshot, isEn));
        response.put("securityAuditRepeatedActors",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> extractSecurityAuditActorId(safeString(row.get("actor"))),
                        isEn ? "Actor" : "수행자"));
        response.put("securityAuditRepeatedTargets",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> safeString(row.get("target")),
                        isEn ? "Target Route" : "대상 경로"));
        response.put("securityAuditRepeatedRemoteAddrs",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> safeString(row.get("remoteAddr")),
                        isEn ? "Remote IP" : "원격 IP"));
        response.put("securityAuditRows", pagedRows);
        return response;
    }

    public Map<String, Object> buildCertificateAuditLogPageData(
            String pageIndexParam,
            String searchKeyword,
            String auditType,
            String status,
            String certificateType,
            String startDate,
            String endDate,
            boolean isEn) {
        return adminObservabilityPageService().buildCertificateAuditLogPagePayload(
                pageIndexParam,
                searchKeyword,
                auditType,
                status,
                certificateType,
                startDate,
                endDate,
                isEn);
    }

    public Map<String, Object> buildCertificateRecCheckPageData(boolean isEn) {
        List<Map<String, Object>> duplicateGroups = buildCertificateRecCheckGroups();
        long blockedCount = duplicateGroups.stream()
                .filter(row -> "BLOCKED".equals(stringValue(row.get("status"))))
                .count();
        long reviewCount = duplicateGroups.stream()
                .filter(row -> "REVIEW".equals(stringValue(row.get("status"))))
                .count();
        int highestRisk = duplicateGroups.stream()
                .mapToInt(row -> parseInt(row.get("riskScore")))
                .max()
                .orElse(0);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("duplicateGroups", duplicateGroups);
        response.put("totalCount", duplicateGroups.size());
        response.put("blockedCount", blockedCount);
        response.put("reviewCount", reviewCount);
        response.put("highestRisk", highestRisk);
        response.put("lastRefreshedAt", "2026-03-30 09:20");
        return response;
    }

    public Map<String, Object> buildAdminHomePageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        EmissionResultFilterSnapshot emissionSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(isEn, "", "", "");

        response.put("isEn", isEn);
        response.put("summaryCards", buildAdminHomeSummaryCards(isEn));
        response.put("reviewQueueRows", buildAdminHomeReviewQueueRows(emissionSnapshot.getItems(), isEn));
        response.put("reviewProgressRows", buildAdminHomeReviewProgressRows(emissionSnapshot.getItems(), isEn));
        response.put("operationalStatusRows", buildAdminHomeOperationalStatusRows(isEn));
        response.put("systemLogs", buildAdminHomeSystemLogs(auditSnapshot, isEn));
        return response;
    }

    public Map<String, Object> buildSchedulerPageData(String jobStatus, String executionType, boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        String normalizedJobStatus = safeString(jobStatus).toUpperCase(Locale.ROOT);
        String normalizedExecutionType = safeString(executionType).toUpperCase(Locale.ROOT);
        List<Map<String, String>> jobRows = buildSchedulerJobRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : jobRows) {
            String rowStatus = safeString(row.get("jobStatus")).toUpperCase(Locale.ROOT);
            String rowType = safeString(row.get("executionTypeCode")).toUpperCase(Locale.ROOT);
            boolean matchesStatus = normalizedJobStatus.isEmpty() || normalizedJobStatus.equals(rowStatus);
            boolean matchesType = normalizedExecutionType.isEmpty() || normalizedExecutionType.equals(rowType);
            if (matchesStatus && matchesType) {
                filteredRows.add(row);
            }
        }
        response.put("isEn", isEn);
        response.put("jobStatus", normalizedJobStatus);
        response.put("executionType", normalizedExecutionType);
        response.put("schedulerSummary", adminSummaryService.getSchedulerSummary(isEn));
        response.put("schedulerJobRows", filteredRows);
        response.put("schedulerNodeRows", buildSchedulerNodeRows(isEn));
        response.put("schedulerExecutionRows", buildSchedulerExecutionRows(isEn));
        response.put("schedulerPlaybooks", buildSchedulerPlaybooks(isEn));
        return response;
    }

    public Map<String, Object> buildBackupConfigPageData(boolean isEn) {
        return backupConfigManagementService.buildPageData(isEn);
    }

    public Map<String, Object> buildNewPagePageData(boolean isEn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        String canonicalMenuUrl = "/admin/system/new-page";
        String localizedMenuUrl = isEn ? "/en/admin/system/new-page" : canonicalMenuUrl;
        String menuCode = "";
        String requiredViewFeatureCode = "";
        List<String> featureCodes = Collections.emptyList();
        MenuInfoDTO menuDetail = null;
        Map<String, Object> manifest = uiManifestRegistryService.getPageRegistry("new-page");

        try {
            menuDetail = menuInfoService.selectMenuDetailByUrl(canonicalMenuUrl);
        } catch (Exception ignored) {
            menuDetail = null;
        }

        try {
            menuCode = safeString(authGroupManageService.selectMenuCodeByMenuUrl(canonicalMenuUrl));
            requiredViewFeatureCode = safeString(authGroupManageService.selectRequiredViewFeatureCodeByMenuUrl(canonicalMenuUrl));
            if (!menuCode.isEmpty()) {
                featureCodes = new ArrayList<>(authGroupManageService.selectFeatureCodesByMenuCode(menuCode));
            }
        } catch (Exception ignored) {
            featureCodes = Collections.emptyList();
        }

        if (menuCode.isEmpty()) {
            menuCode = safeString(menuDetail == null ? null : menuDetail.getCode());
        }
        if (requiredViewFeatureCode.isEmpty() && !menuCode.isEmpty()) {
            requiredViewFeatureCode = menuCode + "_VIEW";
        }

        List<MenuInfoDTO> menuRows = loadMenuTreeRows("AMENU1");
        MenuInfoDTO selfRow = findMenuRow(menuRows, menuCode);
        payload.put("isEn", isEn);
        payload.put("pageId", "new-page");
        payload.put("canonicalMenuUrl", canonicalMenuUrl);
        payload.put("localizedMenuUrl", localizedMenuUrl);
        payload.put("menuCode", menuCode);
        payload.put("menuName", firstNonBlank(
                safeString(menuDetail == null ? null : menuDetail.getCodeNm()),
                safeString(selfRow == null ? null : selfRow.getCodeNm()),
                "새 페이지"));
        payload.put("menuNameEn", firstNonBlank(
                safeString(menuDetail == null ? null : menuDetail.getCodeDc()),
                safeString(selfRow == null ? null : selfRow.getCodeDc()),
                "New Page"));
        payload.put("menuIcon", firstNonBlank(
                safeString(menuDetail == null ? null : menuDetail.getMenuIcon()),
                safeString(selfRow == null ? null : selfRow.getMenuIcon()),
                "note_stack"));
        payload.put("useAt", firstNonBlank(
                safeString(menuDetail == null ? null : menuDetail.getUseAt()),
                safeString(selfRow == null ? null : selfRow.getUseAt()),
                "Y"));
        payload.put("sortOrder", selfRow == null ? null : selfRow.getSortOrdr());
        payload.put("requiredViewFeatureCode", requiredViewFeatureCode);
        payload.put("featureCodes", featureCodes);
        payload.put("featureCount", featureCodes.size());
        payload.put("roleAssignments", buildNewPageRoleAssignments(requiredViewFeatureCode, isEn));
        payload.put("menuAncestry", buildMenuAncestry(menuRows, menuCode, isEn));
        payload.put("manifest", manifest);
        payload.put("governanceNotes", buildNewPageGovernanceNotes(isEn, requiredViewFeatureCode, manifest, featureCodes));
        return payload;
    }

    public Map<String, Object> buildEmissionResultListPageData(
            String pageIndexParam,
            String searchKeyword,
            String resultStatus,
            String verificationStatus,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedResultStatus = safeString(resultStatus).toUpperCase(Locale.ROOT);
        String normalizedVerificationStatus = safeString(verificationStatus).toUpperCase(Locale.ROOT);

        EmissionResultFilterSnapshot filterSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(
                isEn,
                keyword,
                normalizedResultStatus,
                normalizedVerificationStatus);
        List<EmissionResultSummaryView> filteredItems = filterSnapshot.getItems();

        int pageSize = 10;
        int totalCount = filterSnapshot.getTotalCount();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<EmissionResultSummaryView> pageItems = filteredItems.subList(fromIndex, toIndex);

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("emissionResultList", pageItems);
        response.put("totalCount", totalCount);
        response.put("reviewCount", filterSnapshot.getReviewCount());
        response.put("verifiedCount", filterSnapshot.getVerifiedCount());
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("startPage", startPage);
        response.put("endPage", endPage);
        response.put("prevPage", Math.max(1, currentPage - 1));
        response.put("nextPage", Math.min(totalPages, currentPage + 1));
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("resultStatus", normalizedResultStatus);
        response.put("verificationStatus", normalizedVerificationStatus);
        return response;
    }

    public Map<String, Object> buildTradeListPageData(
            String pageIndexParam,
            String searchKeyword,
            String tradeStatus,
            String settlementStatus,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedTradeStatus = safeString(tradeStatus).toUpperCase(Locale.ROOT);
        String normalizedSettlementStatus = safeString(settlementStatus).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildTradeListRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("tradeId")),
                    safeString(row.get("productType")),
                    safeString(row.get("sellerName")),
                    safeString(row.get("buyerName")),
                    safeString(row.get("contractName"))).toLowerCase(Locale.ROOT);
            String rowTradeStatus = safeString(row.get("tradeStatusCode")).toUpperCase(Locale.ROOT);
            String rowSettlementStatus = safeString(row.get("settlementStatusCode")).toUpperCase(Locale.ROOT);
            boolean matchesKeyword = keyword.isEmpty() || searchable.contains(keyword);
            boolean matchesTradeStatus = normalizedTradeStatus.isEmpty() || normalizedTradeStatus.equals(rowTradeStatus);
            boolean matchesSettlementStatus = normalizedSettlementStatus.isEmpty() || normalizedSettlementStatus.equals(rowSettlementStatus);
            if (matchesKeyword && matchesTradeStatus && matchesSettlementStatus) {
                filteredRows.add(row);
            }
        }

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long matchingCount = allRows.stream()
                .filter(row -> "MATCHING".equalsIgnoreCase(safeString(row.get("tradeStatusCode"))))
                .count();
        long settlementPendingCount = allRows.stream()
                .filter(row -> "PENDING".equalsIgnoreCase(safeString(row.get("settlementStatusCode"))))
                .count();
        long completedCount = allRows.stream()
                .filter(row -> "COMPLETED".equalsIgnoreCase(safeString(row.get("tradeStatusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("tradeRows", pageRows);
        response.put("totalCount", totalCount);
        response.put("matchingCount", matchingCount);
        response.put("settlementPendingCount", settlementPendingCount);
        response.put("completedCount", completedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("tradeStatus", normalizedTradeStatus);
        response.put("settlementStatus", normalizedSettlementStatus);
        response.put("tradeStatusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("REQUESTED", isEn ? "Requested" : "요청"),
                option("MATCHING", isEn ? "Matching" : "매칭중"),
                option("APPROVED", isEn ? "Approved" : "승인"),
                option("COMPLETED", isEn ? "Completed" : "완료"),
                option("HOLD", isEn ? "On Hold" : "보류")));
        response.put("settlementStatusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("PENDING", isEn ? "Pending" : "정산 대기"),
                option("IN_PROGRESS", isEn ? "In Progress" : "정산 진행"),
                option("DONE", isEn ? "Done" : "정산 완료"),
                option("EXCEPTION", isEn ? "Exception" : "예외")));
        response.put("settlementAlerts", List.of(
                mapOf(
                        "title", isEn ? "Pending settlement review" : "정산 대기 거래 점검",
                        "detail", isEn ? "Trades with pending settlement should be reviewed before the daily close window."
                                : "정산 대기 거래는 일 마감 전에 담당자가 우선 점검해야 합니다.",
                        "tone", "warning"),
                mapOf(
                        "title", isEn ? "Exception handling path" : "예외 거래 처리 경로",
                        "detail", isEn ? "Exception trades require operator note and counterparty confirmation."
                                : "예외 거래는 운영 메모와 상대 기관 확인 절차가 필요합니다.",
                        "tone", "info")));
        return response;
    }

    public Map<String, Object> buildTradeStatisticsPageData(
            String pageIndexParam,
            String searchKeyword,
            String periodFilter,
            String tradeType,
            String settlementStatus,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedPeriodFilter = normalizeTradeStatisticsPeriodFilter(periodFilter);
        String normalizedTradeType = safeString(tradeType).toUpperCase(Locale.ROOT);
        String normalizedSettlementStatus = safeString(settlementStatus).toUpperCase(Locale.ROOT);

        List<Map<String, String>> institutionRows = buildTradeStatisticsInstitutionRows(isEn).stream()
                .filter(row -> normalizedTradeType.isEmpty() || normalizedTradeType.equals(safeString(row.get("tradeTypeCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedSettlementStatus.isEmpty() || normalizedSettlementStatus.equals(safeString(row.get("settlementStatusCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedKeyword.isEmpty() || matchesTradeStatisticsKeyword(row, normalizedKeyword))
                .collect(Collectors.toList());

        List<Map<String, String>> monthlyRows = selectTradeStatisticsMonthlyRows(buildTradeStatisticsMonthlyRows(isEn), normalizedPeriodFilter);
        List<Map<String, String>> tradeTypeRows = buildTradeStatisticsTypeRows(isEn).stream()
                .filter(row -> normalizedTradeType.isEmpty() || normalizedTradeType.equals(safeString(row.get("tradeTypeCode")).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());

        int pageSize = 6;
        int totalCount = institutionRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = institutionRows.subList(fromIndex, toIndex);

        long totalTradeVolume = sumTradeStatistic(institutionRows, "tradeVolume");
        long totalSettlementAmount = sumTradeStatistic(institutionRows, "settlementAmount");
        long pendingSettlementCount = sumTradeStatistic(institutionRows, "pendingCount");
        long exceptionCount = sumTradeStatistic(institutionRows, "exceptionCount");
        long completedCount = sumTradeStatistic(institutionRows, "completedCount");
        long requestCount = sumTradeStatistic(institutionRows, "requestCount");
        String settlementCompletionRate = requestCount <= 0
                ? "0.0"
                : String.format(Locale.ROOT, "%.1f", (completedCount * 100.0) / requestCount);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("totalCount", totalCount);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("periodFilter", normalizedPeriodFilter);
        response.put("tradeType", normalizedTradeType);
        response.put("settlementStatus", normalizedSettlementStatus);
        response.put("totalTradeVolume", totalTradeVolume);
        response.put("totalSettlementAmount", totalSettlementAmount);
        response.put("pendingSettlementCount", pendingSettlementCount);
        response.put("exceptionCount", exceptionCount);
        response.put("settlementCompletionRate", settlementCompletionRate);
        response.put("avgSettlementDays", formatTradeLeadDays(institutionRows));
        response.put("monthlyRows", monthlyRows);
        response.put("tradeTypeRows", tradeTypeRows);
        response.put("institutionRows", pageRows);
        response.put("alertRows", buildTradeStatisticsAlertRows(isEn));
        return response;
    }

    public Map<String, Object> buildTradeDuplicatePageData(
            String pageIndexParam,
            String searchKeyword,
            String detectionType,
            String reviewStatus,
            String riskLevel,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedDetectionType = safeString(detectionType).toUpperCase(Locale.ROOT);
        String normalizedReviewStatus = safeString(reviewStatus).toUpperCase(Locale.ROOT);
        String normalizedRiskLevel = safeString(riskLevel).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildTradeDuplicateRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("reviewId")),
                    safeString(row.get("tradeId")),
                    safeString(row.get("contractName")),
                    safeString(row.get("sellerName")),
                    safeString(row.get("buyerName")),
                    safeString(row.get("analyst")),
                    safeString(row.get("reason"))).toLowerCase(Locale.ROOT);
            String rowDetectionType = safeString(row.get("detectionTypeCode")).toUpperCase(Locale.ROOT);
            String rowReviewStatus = safeString(row.get("reviewStatusCode")).toUpperCase(Locale.ROOT);
            String rowRiskLevel = safeString(row.get("riskLevelCode")).toUpperCase(Locale.ROOT);
            boolean matchesKeyword = keyword.isEmpty() || searchable.contains(keyword);
            boolean matchesDetectionType = normalizedDetectionType.isEmpty() || normalizedDetectionType.equals(rowDetectionType);
            boolean matchesReviewStatus = normalizedReviewStatus.isEmpty() || normalizedReviewStatus.equals(rowReviewStatus);
            boolean matchesRiskLevel = normalizedRiskLevel.isEmpty() || normalizedRiskLevel.equals(rowRiskLevel);
            if (matchesKeyword && matchesDetectionType && matchesReviewStatus && matchesRiskLevel) {
                filteredRows.add(row);
            }
        }

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long criticalCount = allRows.stream()
                .filter(row -> "CRITICAL".equalsIgnoreCase(safeString(row.get("riskLevelCode"))))
                .count();
        long reviewCount = allRows.stream()
                .filter(row -> "REVIEW".equalsIgnoreCase(safeString(row.get("reviewStatusCode"))))
                .count();
        long settlementBlockedCount = allRows.stream()
                .filter(row -> "BLOCKED".equalsIgnoreCase(safeString(row.get("reviewStatusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("abnormalTradeRows", pageRows);
        response.put("totalCount", totalCount);
        response.put("criticalCount", criticalCount);
        response.put("reviewCount", reviewCount);
        response.put("settlementBlockedCount", settlementBlockedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("detectionType", normalizedDetectionType);
        response.put("reviewStatus", normalizedReviewStatus);
        response.put("riskLevel", normalizedRiskLevel);
        response.put("lastRefreshedAt", "2026-03-31 09:10");
        response.put("detectionTypeOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("DUPLICATE_PARTY", isEn ? "Duplicate party" : "거래 당사자 중복"),
                option("SPLIT_ORDER", isEn ? "Split order" : "주문 분할"),
                option("SETTLEMENT_GAP", isEn ? "Settlement gap" : "정산 불일치"),
                option("LIMIT_BREACH", isEn ? "Limit breach" : "한도 초과"),
                option("PRICE_OUTLIER", isEn ? "Price outlier" : "가격 이상")));
        response.put("reviewStatusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("REVIEW", isEn ? "Under review" : "검토 중"),
                option("ESCALATED", isEn ? "Escalated" : "상향 검토"),
                option("BLOCKED", isEn ? "Settlement blocked" : "정산 보류"),
                option("CLEARED", isEn ? "Cleared" : "해소")));
        response.put("riskLevelOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("CRITICAL", isEn ? "Critical" : "치명"),
                option("HIGH", isEn ? "High" : "높음"),
                option("MEDIUM", isEn ? "Medium" : "중간"),
                option("LOW", isEn ? "Low" : "낮음")));
        response.put("escalationAlerts", List.of(
                mapOf(
                        "title", isEn ? "Linked counterpart duplication requires same-day review" : "동일 거래 당사자 반복 탐지 건은 당일 검토 필요",
                        "detail", isEn ? "Three critical reviews share counterpart overlap and should remain blocked until operator sign-off."
                                : "치명 등급 3건이 동일 당사자 중복 패턴을 보여 운영 승인 전까지 거래를 유지 차단해야 합니다.",
                        "tone", "warning"),
                mapOf(
                        "title", isEn ? "Settlement mismatch is propagating to close queue" : "정산 불일치가 마감 큐로 전파 중",
                        "detail", isEn ? "Mismatch cases should be reconciled before end-of-day settlement to avoid carry-over exceptions."
                                : "정산 불일치 건은 일마감 전에 조정하지 않으면 예외 건이 다음 정산일로 이월됩니다.",
                        "tone", "info")));
        response.put("operatorGuidance", List.of(
                mapOf(
                        "title", isEn ? "Keep analyst note before release" : "해제 전 운영 메모 기록",
                        "detail", isEn ? "Releasing a blocked trade requires an analyst note and counterpart confirmation in the same shift."
                                : "정산 보류 거래를 해제할 때는 같은 근무조 안에서 운영 메모와 상대 기관 확인 기록을 함께 남깁니다."),
                mapOf(
                        "title", isEn ? "Escalate duplicate party patterns first" : "당사자 중복 패턴 우선 상향",
                        "detail", isEn ? "Duplicate parties with repeated price deviation should move to escalated review before price-only outliers."
                                : "거래 당사자 중복과 가격 편차가 함께 보이면 단순 가격 이상보다 먼저 상향 검토 대상으로 전환합니다."),
                mapOf(
                        "title", isEn ? "Clear settlement gap after ledger sync" : "원장 동기화 후 정산 불일치 해소",
                        "detail", isEn ? "Settlement gap rows can be cleared only after the closing ledger and operator memo share the same values."
                                : "정산 불일치 건은 마감 원장과 운영 메모 값이 일치한 뒤에만 해소 처리합니다.")));
        return response;
    }

    public Map<String, Object> buildSettlementCalendarPageData(
            String pageIndexParam,
            String selectedMonth,
            String searchKeyword,
            String settlementStatus,
            String riskLevel,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String normalizedMonth = safeString(selectedMonth).isEmpty() ? "2026-04" : safeString(selectedMonth);
        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedStatus = safeString(settlementStatus).toUpperCase(Locale.ROOT);
        String normalizedRisk = safeString(riskLevel).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildSettlementCalendarRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("settlementId")),
                    safeString(row.get("settlementTitle")),
                    safeString(row.get("institutionName")),
                    safeString(row.get("ownerName")),
                    safeString(row.get("blockerReason"))).toLowerCase(Locale.ROOT);
            boolean matchesMonth = normalizedMonth.equals(safeString(row.get("settlementMonth")));
            boolean matchesKeyword = normalizedKeyword.isEmpty() || searchable.contains(normalizedKeyword);
            boolean matchesStatus = normalizedStatus.isEmpty() || normalizedStatus.equals(safeString(row.get("statusCode")).toUpperCase(Locale.ROOT));
            boolean matchesRisk = normalizedRisk.isEmpty() || normalizedRisk.equals(safeString(row.get("riskLevelCode")).toUpperCase(Locale.ROOT));
            if (matchesMonth && matchesKeyword && matchesStatus && matchesRisk) {
                filteredRows.add(row);
            }
        }

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long dueTodayCount = filteredRows.stream()
                .filter(row -> "2026-04-01".equals(safeString(row.get("dueDate"))))
                .count();
        long highRiskCount = filteredRows.stream()
                .filter(row -> "HIGH".equalsIgnoreCase(safeString(row.get("riskLevelCode"))))
                .count();
        long completedCount = filteredRows.stream()
                .filter(row -> "COMPLETED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("selectedMonth", normalizedMonth);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("settlementStatus", normalizedStatus);
        response.put("riskLevel", normalizedRisk);
        response.put("totalScheduledCount", totalCount);
        response.put("dueTodayCount", dueTodayCount);
        response.put("highRiskCount", highRiskCount);
        response.put("completedCount", completedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("monthOptions", List.of(
                mapOf("value", "2026-04", "label", isEn ? "April 2026" : "2026년 4월"),
                mapOf("value", "2026-05", "label", isEn ? "May 2026" : "2026년 5월"),
                mapOf("value", "2026-06", "label", isEn ? "June 2026" : "2026년 6월")));
        response.put("settlementStatusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("PENDING", isEn ? "Pending" : "대기"),
                option("READY", isEn ? "Ready" : "준비 완료"),
                option("COMPLETED", isEn ? "Completed" : "완료"),
                option("BLOCKED", isEn ? "Blocked" : "차단")));
        response.put("riskLevelOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("HIGH", isEn ? "High" : "높음"),
                option("MEDIUM", isEn ? "Medium" : "보통"),
                option("LOW", isEn ? "Low" : "낮음")));
        response.put("calendarDays", buildSettlementCalendarDays(normalizedMonth, isEn));
        response.put("scheduleRows", pageRows);
        response.put("alertRows", List.of(
                mapOf(
                        "title", isEn ? "Counterparty evidence still pending" : "상대 기관 증빙 대기",
                        "description", isEn ? "Three high-risk schedules are blocked by unsigned counterparty evidence packets."
                                : "고위험 일정 3건이 상대 기관 미서명 증빙 묶음 때문에 차단되어 있습니다.",
                        "badgeLabel", isEn ? "High" : "높음",
                        "badgeClassName", "bg-rose-100 text-rose-700",
                        "actionLabel", isEn ? "Open trade list" : "거래 목록 열기",
                        "actionUrl", isEn ? "/en/admin/trade/list?settlementStatus=PENDING" : "/admin/trade/list?settlementStatus=PENDING"),
                mapOf(
                        "title", isEn ? "Treasury confirmation window" : "재무 확인 시간대",
                        "description", isEn ? "Ready schedules due on April 3 should be handed off before 15:00 treasury close."
                                : "4월 3일 마감 준비 완료 건은 15시 재무 마감 전에 이관해야 합니다.",
                        "badgeLabel", isEn ? "Watch" : "주의",
                        "badgeClassName", "bg-amber-100 text-amber-700",
                        "actionLabel", isEn ? "Open refund queue" : "환불 큐 열기",
                        "actionUrl", isEn ? "/en/admin/payment/refund_list" : "/admin/payment/refund_list")));
        return response;
    }

    public Map<String, Object> buildRefundListPageData(
            String pageIndexParam,
            String searchKeyword,
            String status,
            String riskLevel,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedStatus = safeString(status).toUpperCase(Locale.ROOT);
        String normalizedRiskLevel = safeString(riskLevel).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildRefundListRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("refundId")),
                    safeString(row.get("companyName")),
                    safeString(row.get("applicantName")),
                    safeString(row.get("paymentMethodLabel")),
                    safeString(row.get("reasonSummary")),
                    safeString(row.get("accountMasked"))).toLowerCase(Locale.ROOT);
            String rowStatus = safeString(row.get("statusCode")).toUpperCase(Locale.ROOT);
            String rowRiskLevel = safeString(row.get("riskLevelCode")).toUpperCase(Locale.ROOT);
            boolean matchesKeyword = keyword.isEmpty() || searchable.contains(keyword);
            boolean matchesStatus = normalizedStatus.isEmpty() || normalizedStatus.equals(rowStatus);
            boolean matchesRiskLevel = normalizedRiskLevel.isEmpty() || normalizedRiskLevel.equals(rowRiskLevel);
            if (matchesKeyword && matchesStatus && matchesRiskLevel) {
                filteredRows.add(row);
            }
        }

        int pageSize = 8;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = filteredRows.subList(fromIndex, toIndex);

        long pendingCount = allRows.stream()
                .filter(row -> "RECEIVED".equalsIgnoreCase(safeString(row.get("statusCode"))) || "ACCOUNT_REVIEW".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long inReviewCount = allRows.stream()
                .filter(row -> "IN_REVIEW".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long transferScheduledCount = allRows.stream()
                .filter(row -> "TRANSFER_SCHEDULED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();
        long completedCount = allRows.stream()
                .filter(row -> "COMPLETED".equalsIgnoreCase(safeString(row.get("statusCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("refundRows", pageRows);
        response.put("totalCount", totalCount);
        response.put("pendingCount", pendingCount);
        response.put("inReviewCount", inReviewCount);
        response.put("transferScheduledCount", transferScheduledCount);
        response.put("completedCount", completedCount);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("status", normalizedStatus);
        response.put("riskLevel", normalizedRiskLevel);
        response.put("statusOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("RECEIVED", isEn ? "Received" : "접수"),
                option("ACCOUNT_REVIEW", isEn ? "Account Review" : "계좌 검수"),
                option("IN_REVIEW", isEn ? "In Review" : "검토중"),
                option("APPROVED", isEn ? "Approved" : "승인"),
                option("TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정"),
                option("COMPLETED", isEn ? "Completed" : "처리 완료"),
                option("REJECTED", isEn ? "Rejected" : "반려")));
        response.put("riskLevelOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("HIGH", isEn ? "High" : "높음"),
                option("MEDIUM", isEn ? "Medium" : "보통"),
                option("LOW", isEn ? "Low" : "낮음")));
        response.put("refundAlerts", List.of(
                mapOf(
                        "title", isEn ? "Same-day transfer cut-off" : "당일 이체 마감 확인",
                        "detail", isEn ? "Approved refunds after 16:00 move to the next business-day transfer batch."
                                : "16시 이후 승인된 환불은 다음 영업일 이체 배치로 이월됩니다.",
                        "tone", "warning"),
                mapOf(
                        "title", isEn ? "Account verification backlog" : "환불 계좌 검수 적체",
                        "detail", isEn ? "Requests missing account-owner validation should stay blocked before approval."
                                : "예금주 검증이 끝나지 않은 요청은 승인 전에 계속 보류해야 합니다.",
                        "tone", "info")));
        return response;
    }

    public Map<String, Object> buildTradeRejectPageData(String tradeId, String returnUrl, boolean isEn) {
        String normalizedTradeId = safeString(tradeId);
        String normalizedReturnUrl = safeString(returnUrl);
        if (normalizedReturnUrl.isEmpty()) {
            normalizedReturnUrl = buildAdminPath(isEn, "/trade/list");
        }

        Map<String, String> selectedTrade = buildTradeListRows(isEn).stream()
                .filter(row -> normalizedTradeId.equalsIgnoreCase(safeString(row.get("tradeId"))))
                .findFirst()
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("tradeId", normalizedTradeId);
        response.put("returnUrl", normalizedReturnUrl);
        response.put("listUrl", buildAdminPath(isEn, "/trade/list"));
        response.put("found", selectedTrade != null);

        if (selectedTrade == null) {
            response.put("pageError", normalizedTradeId.isEmpty()
                    ? (isEn ? "A trade ID is required to review a rejection case." : "반려 검토를 하려면 거래 ID가 필요합니다.")
                    : (isEn ? "The selected trade could not be found in the current operator queue." : "현재 운영 큐에서 선택한 거래를 찾을 수 없습니다."));
            return response;
        }

        response.putAll(selectedTrade);
        response.put("blockerCount", 3);
        response.put("evidenceCount", 3);
        response.put("historyCount", 4);
        response.put("suggestedReason", isEn ? "Counterparty evidence mismatch" : "상대 기관 증빙 불일치");
        response.put("rejectionChecklist", List.of(
                mapOf(
                        "title", isEn ? "Contract consistency" : "계약 정보 정합성",
                        "detail", isEn ? "Seller and buyer submitted different contract quantities for the same settlement window."
                                : "동일 정산 구간에 대해 매도·매수 기관이 제출한 계약 수량이 서로 다릅니다.",
                        "severity", "high"),
                mapOf(
                        "title", isEn ? "Evidence completeness" : "증빙 첨부 완전성",
                        "detail", isEn ? "Required settlement evidence is missing the counterparty signed attachment."
                                : "필수 정산 증빙 중 상대 기관 서명 첨부가 누락되었습니다.",
                        "severity", "medium"),
                mapOf(
                        "title", isEn ? "Operator handoff" : "운영 인수 조건",
                        "detail", isEn ? "Rejection notice should include the exact resubmission scope and due date."
                                : "반려 통지에는 재제출 범위와 기한을 명확히 적어야 합니다.",
                        "severity", "medium")));
        response.put("rejectionReasons", List.of(
                mapOf("code", "EVIDENCE_GAP", "label", isEn ? "Missing evidence package" : "증빙 누락"),
                mapOf("code", "COUNTERPARTY_MISMATCH", "label", isEn ? "Counterparty mismatch" : "상대 기관 정보 불일치"),
                mapOf("code", "SETTLEMENT_SCOPE", "label", isEn ? "Settlement scope mismatch" : "정산 범위 불일치"),
                mapOf("code", "COMPLIANCE_RISK", "label", isEn ? "Compliance or policy risk" : "준수 정책 위험")));
        response.put("evidenceRows", List.of(
                mapOf("fileName", isEn ? "trade-request-form.pdf" : "거래신청서.pdf", "category", isEn ? "Application" : "신청서", "statusLabel", isEn ? "Submitted" : "제출완료", "owner", selectedTrade.get("sellerName")),
                mapOf("fileName", isEn ? "counterparty-confirmation.pdf" : "상대기관확인서.pdf", "category", isEn ? "Counterparty" : "상대기관 확인", "statusLabel", isEn ? "Missing signature" : "서명 누락", "owner", selectedTrade.get("buyerName")),
                mapOf("fileName", isEn ? "settlement-sheet.xlsx" : "정산내역.xlsx", "category", isEn ? "Settlement" : "정산자료", "statusLabel", isEn ? "Value mismatch" : "수치 불일치", "owner", isEn ? "Operations desk" : "운영 데스크")));
        response.put("historyRows", List.of(
                mapOf("occurredAt", "2026-03-30 09:10", "actor", selectedTrade.get("sellerName"), "actionLabel", isEn ? "Requested trade registration" : "거래 등록 요청", "note", isEn ? "Initial trade request submitted." : "초기 거래 요청이 접수되었습니다."),
                mapOf("occurredAt", "2026-03-30 10:05", "actor", isEn ? "Matching engine" : "매칭 엔진", "actionLabel", isEn ? "Detected mismatch" : "불일치 탐지", "note", isEn ? "Buyer quantity and submitted contract differ." : "매수 기관 수량과 제출 계약서 수치가 다릅니다."),
                mapOf("occurredAt", "2026-03-30 10:40", "actor", isEn ? "Operations desk" : "운영 담당", "actionLabel", isEn ? "Requested resubmission evidence" : "보완 증빙 요청", "note", isEn ? "Counterparty signature was requested." : "상대 기관 서명 보완을 요청했습니다."),
                mapOf("occurredAt", "2026-03-30 13:20", "actor", selectedTrade.get("buyerName"), "actionLabel", isEn ? "Uploaded revised file" : "수정 파일 업로드", "note", isEn ? "Updated file still omits settlement annex." : "수정 파일에도 정산 부속서가 누락되어 있습니다.")));
        response.put("notificationPlan", List.of(
                mapOf("target", selectedTrade.get("sellerName"), "channel", isEn ? "Portal inbox + email" : "포털 알림 + 이메일", "detail", isEn ? "Include resubmission deadline and evidence checklist." : "재제출 기한과 증빙 체크리스트를 함께 안내합니다."),
                mapOf("target", selectedTrade.get("buyerName"), "channel", isEn ? "Portal inbox" : "포털 알림", "detail", isEn ? "Notify counterpart that trade was returned for correction." : "거래가 보완 요청 상태로 전환됐음을 통지합니다."),
                mapOf("target", isEn ? "Settlement desk" : "정산 운영팀", "channel", isEn ? "Internal note" : "내부 메모", "detail", isEn ? "Keep settlement hold until corrected evidence arrives." : "보완 증빙 접수 전까지 정산 보류 상태를 유지합니다.")));
        response.put("quickLinks", List.of(
                mapOf("label", isEn ? "Back to trade list" : "거래 목록으로", "href", buildAdminPath(isEn, "/trade/list")),
                mapOf("label", isEn ? "Open emission validation" : "검증 관리 이동", "href", buildAdminPath(isEn, "/emission/validate")),
                mapOf("label", isEn ? "Open certificate review" : "발급 검토 이동", "href", buildAdminPath(isEn, "/certificate/review"))));
        return response;
    }

    public Map<String, Object> buildTradeApprovePageData(
            String pageIndexParam,
            String searchKeyword,
            String approvalStatus,
            String tradeType,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedApprovalStatus = safeString(approvalStatus).toUpperCase(Locale.ROOT);
        if (normalizedApprovalStatus.isEmpty()) {
            normalizedApprovalStatus = "PENDING";
        }
        String normalizedTradeType = safeString(tradeType).toUpperCase(Locale.ROOT);

        List<Map<String, String>> allRows = buildTradeApproveRows(isEn);
        List<Map<String, String>> filteredRows = new ArrayList<>();
        for (Map<String, String> row : allRows) {
            String searchable = String.join(" ",
                    safeString(row.get("tradeId")),
                    safeString(row.get("productType")),
                    safeString(row.get("sellerName")),
                    safeString(row.get("buyerName")),
                    safeString(row.get("contractName"))).toLowerCase(Locale.ROOT);
            boolean matchesKeyword = normalizedKeyword.isEmpty() || searchable.contains(normalizedKeyword);
            boolean matchesStatus = "ALL".equals(normalizedApprovalStatus)
                    || normalizedApprovalStatus.equalsIgnoreCase(safeString(row.get("approvalStatusCode")));
            boolean matchesTradeType = normalizedTradeType.isEmpty()
                    || normalizedTradeType.equalsIgnoreCase(safeString(row.get("tradeTypeCode")));
            if (matchesKeyword && matchesStatus && matchesTradeType) {
                filteredRows.add(row);
            }
        }

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("approvalRows", filteredRows.subList(fromIndex, toIndex));
        response.put("totalCount", totalCount);
        response.put("pendingCount", countByApprovalStatus(allRows, "PENDING"));
        response.put("approvedCount", countByApprovalStatus(allRows, "APPROVED"));
        response.put("rejectedCount", countByApprovalStatus(allRows, "REJECTED"));
        response.put("holdCount", countByApprovalStatus(allRows, "HOLD"));
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("approvalStatus", normalizedApprovalStatus);
        response.put("tradeType", normalizedTradeType);
        response.put("approvalStatusOptions", List.of(
                option("ALL", isEn ? "All" : "전체"),
                option("PENDING", isEn ? "Pending" : "승인 대기"),
                option("APPROVED", isEn ? "Approved" : "승인 완료"),
                option("REJECTED", isEn ? "Rejected" : "반려"),
                option("HOLD", isEn ? "On Hold" : "보류")));
        response.put("tradeTypeOptions", List.of(
                option("", isEn ? "All" : "전체"),
                option("KETS", isEn ? "K-ETS Credit" : "배출권"),
                option("REC", isEn ? "REC Package" : "REC 패키지"),
                option("VOLUNTARY", isEn ? "Voluntary Credit" : "자발적 감축실적")));
        response.put("canViewTradeApprove", true);
        response.put("canUseTradeApproveAction", true);
        return response;
    }

    public Map<String, Object> submitTradeApproveAction(Map<String, Object> payload, boolean isEn) {
        String action = stringValue(payload == null ? null : payload.get("action")).toLowerCase(Locale.ROOT);
        String tradeId = stringValue(payload == null ? null : payload.get("tradeId"));
        List<String> selectedIds = normalizeSelectedIds(payload == null ? null : payload.get("selectedIds"), tradeId);
        String rejectReason = stringValue(payload == null ? null : payload.get("rejectReason"));

        Map<String, Object> response = new LinkedHashMap<>();
        if (selectedIds.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Select at least one trade to process." : "처리할 거래를 하나 이상 선택해 주세요.");
            return response;
        }
        boolean approveAction = "approve".equals(action) || "batch_approve".equals(action);
        boolean rejectAction = "reject".equals(action) || "batch_reject".equals(action);
        if (!approveAction && !rejectAction) {
            response.put("success", false);
            response.put("message", isEn ? "The requested trade action is invalid." : "요청한 거래 처리 작업이 올바르지 않습니다.");
            return response;
        }
        if (rejectAction && rejectReason.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Enter a reject reason before submitting rejection." : "반려 처리 전에 반려 사유를 입력해 주세요.");
            return response;
        }

        ensureTradeApprovalState();
        for (String selectedId : selectedIds) {
            Map<String, String> state = tradeApprovalState.computeIfAbsent(selectedId, key -> defaultTradeApprovalState());
            state.put("approvalStatusCode", approveAction ? "APPROVED" : "REJECTED");
            state.put("reviewedAt", "2026-03-31 14:20");
            state.put("reviewerName", isEn ? "Trade Ops Desk" : "거래 운영팀");
            if (approveAction) {
                state.put("rejectReason", "");
            } else {
                state.put("rejectReason", rejectReason);
            }
        }

        response.put("success", true);
        response.put("result", approveAction
                ? (selectedIds.size() > 1 ? "batchApproved" : "approved")
                : (selectedIds.size() > 1 ? "batchRejected" : "rejected"));
        response.put("selectedIds", selectedIds);
        return response;
    }

    public Map<String, Object> submitTradeRejectAction(Map<String, Object> payload, boolean isEn) {
        String tradeId = stringValue(payload == null ? null : payload.get("tradeId"));
        String rejectReason = stringValue(payload == null ? null : payload.get("rejectReason"));
        String operatorNote = stringValue(payload == null ? null : payload.get("operatorNote"));

        Map<String, Object> response = new LinkedHashMap<>();
        if (tradeId.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Trade ID is required." : "거래 ID가 필요합니다.");
            return response;
        }
        if (rejectReason.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Select or enter a rejection reason before submitting." : "반려 사유를 선택하거나 입력한 뒤 제출하세요.");
            return response;
        }

        response.put("success", true);
        response.put("tradeId", tradeId);
        response.put("message", isEn
                ? String.format("Trade %s was marked for rejection review. Notify both counterparties with the updated evidence scope.", tradeId)
                : String.format("%s 거래를 반려 검토 상태로 기록했습니다. 양측 기관에 보완 범위를 안내하세요.", tradeId));
        response.put("reviewStatus", "REJECT_RECORDED");
        response.put("rejectReason", rejectReason);
        response.put("operatorNote", operatorNote);
        return response;
    }

    public Map<String, Object> buildEmissionResultDetailPageData(String resultId, boolean isEn) {
        String normalizedResultId = safeString(resultId);
        EmissionResultFilterSnapshot filterSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(isEn, "", "", "");
        EmissionResultSummaryView summary = filterSnapshot.getItems().stream()
                .filter(item -> normalizedResultId.equalsIgnoreCase(safeString(item.getResultId())))
                .findFirst()
                .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("resultId", normalizedResultId);
        response.put("listUrl", buildAdminPath(isEn, "/emission/result_list"));
        response.put("found", summary != null);
        if (summary == null) {
            response.put("pageError", isEn ? "The requested emission result could not be found." : "요청한 산정 결과를 찾을 수 없습니다.");
            return response;
        }

        response.put("projectName", summary.getProjectName());
        response.put("companyName", summary.getCompanyName());
        response.put("calculatedAt", summary.getCalculatedAt());
        response.put("totalEmission", summary.getTotalEmission());
        response.put("resultStatusCode", summary.getResultStatusCode());
        response.put("resultStatusLabel", summary.getResultStatusLabel());
        response.put("verificationStatusCode", summary.getVerificationStatusCode());
        response.put("verificationStatusLabel", summary.getVerificationStatusLabel());
        response.put("reportPeriod", resolveEmissionReportPeriod(summary.getResultId(), isEn));
        response.put("submittedAt", resolveEmissionSubmittedAt(summary.getResultId()));
        response.put("formulaVersion", resolveEmissionFormulaVersion(summary.getResultId()));
        response.put("verificationOwner", resolveEmissionVerificationOwner(summary.getResultId(), isEn));
        response.put("reviewMessage", resolveEmissionReviewMessage(summary.getResultStatusCode(), summary.getVerificationStatusCode(), isEn));
        response.put("reviewChecklist", buildEmissionReviewChecklist(summary.getResultId(), isEn));
        response.put("siteRows", buildEmissionResultSiteRows(summary.getResultId(), isEn));
        response.put("evidenceRows", buildEmissionEvidenceRows(summary.getResultId(), isEn));
        response.put("historyRows", buildEmissionHistoryRows(summary.getResultId(), isEn));
        response.put("siteCount", ((List<?>) response.get("siteRows")).size());
        response.put("evidenceCount", ((List<?>) response.get("evidenceRows")).size());
        response.put("verificationActionUrl", buildAdminPath(isEn, "/emission/validate?resultId=" + urlQueryValue(summary.getResultId())));
        response.put("historyUrl", buildAdminPath(isEn, "/emission/data_history?resultId=" + urlQueryValue(summary.getResultId())));
        return response;
    }

    public Map<String, Object> buildCertificateStatisticsPageData(
            String pageIndexParam,
            String searchKeyword,
            String periodFilter,
            String certificateType,
            String issuanceStatus,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedPeriodFilter = normalizeCertificatePeriodFilter(periodFilter);
        String normalizedCertificateType = safeString(certificateType).toUpperCase(Locale.ROOT);
        String normalizedIssuanceStatus = safeString(issuanceStatus).toUpperCase(Locale.ROOT);

        List<Map<String, String>> institutionRows = buildCertificateStatisticsInstitutionRows(isEn).stream()
                .filter(row -> normalizedCertificateType.isEmpty() || normalizedCertificateType.equals(safeString(row.get("certificateTypeCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedIssuanceStatus.isEmpty() || normalizedIssuanceStatus.equals(safeString(row.get("statusCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedKeyword.isEmpty() || matchesCertificateStatisticsKeyword(row, normalizedKeyword))
                .collect(Collectors.toList());

        List<Map<String, String>> monthlyRows = selectCertificateMonthlyRows(
                buildCertificateStatisticsMonthlyRows(isEn),
                normalizedPeriodFilter);
        List<Map<String, String>> certificateTypeRows = buildCertificateStatisticsTypeRows(isEn).stream()
                .filter(row -> normalizedCertificateType.isEmpty() || normalizedCertificateType.equals(safeString(row.get("certificateTypeCode")).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());

        int pageSize = 6;
        int totalCount = institutionRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageRows = institutionRows.subList(fromIndex, toIndex);

        int totalIssuedCount = sumCertificateStatistic(institutionRows, "issuedCount");
        int pendingCount = sumCertificateStatistic(institutionRows, "pendingCount");
        int rejectedCount = sumCertificateStatistic(institutionRows, "rejectedCount");
        int reissuedCount = sumCertificateStatistic(institutionRows, "reissuedCount");
        int totalRequestCount = sumCertificateStatistic(institutionRows, "requestCount");
        String issuanceRate = totalRequestCount <= 0
                ? "0.0"
                : String.format(Locale.ROOT, "%.1f", (totalIssuedCount * 100.0) / totalRequestCount);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("totalCount", totalCount);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("periodFilter", normalizedPeriodFilter);
        response.put("certificateType", normalizedCertificateType);
        response.put("issuanceStatus", normalizedIssuanceStatus);
        response.put("totalIssuedCount", totalIssuedCount);
        response.put("pendingCount", pendingCount);
        response.put("rejectedCount", rejectedCount);
        response.put("reissuedCount", reissuedCount);
        response.put("totalRequestCount", totalRequestCount);
        response.put("avgLeadDays", formatCertificateLeadDays(institutionRows));
        response.put("issuanceRate", issuanceRate);
        response.put("monthlyRows", monthlyRows);
        response.put("certificateTypeRows", certificateTypeRows);
        response.put("institutionRows", pageRows);
        response.put("alertRows", buildCertificateStatisticsAlertRows(isEn));
        return response;
    }

    private String resolveEmissionReportPeriod(String resultId, boolean isEn) {
        switch (safeString(resultId)) {
            case "ER-2026-001":
            case "ER-2026-002":
                return isEn ? "2026 Q1" : "2026년 1분기";
            case "ER-2026-003":
            case "ER-2026-004":
            case "ER-2026-005":
            default:
                return isEn ? "2026 February" : "2026년 2월";
        }
    }

    private String resolveEmissionSubmittedAt(String resultId) {
        switch (safeString(resultId)) {
            case "ER-2026-001": return "2026-03-05 10:24";
            case "ER-2026-002": return "2026-03-04 16:10";
            case "ER-2026-003": return "-";
            case "ER-2026-004": return "2026-02-27 09:40";
            case "ER-2026-005": return "2026-02-25 14:22";
            default: return "2026-02-21 11:05";
        }
    }

    private String resolveEmissionFormulaVersion(String resultId) {
        switch (safeString(resultId)) {
            case "ER-2026-001": return "CCUS-CALC-2.4";
            case "ER-2026-002": return "BLUE-H2-1.9";
            case "ER-2026-003": return "TRANS-NET-0.8";
            case "ER-2026-004": return "STORAGE-VERIFY-3.1";
            case "ER-2026-005": return "MEOH-CONV-1.4";
            default: return "REGIONAL-AUDIT-1.2";
        }
    }

    private String resolveEmissionVerificationOwner(String resultId, boolean isEn) {
        switch (safeString(resultId)) {
            case "ER-2026-001": return isEn ? "Verification Team A" : "검증 1팀";
            case "ER-2026-002": return isEn ? "Verification Team B" : "검증 2팀";
            case "ER-2026-003": return isEn ? "Calculation Operator" : "산정 담당자";
            case "ER-2026-004": return isEn ? "Storage Quality Team" : "저장소 품질팀";
            case "ER-2026-005": return isEn ? "Verification Team B" : "검증 2팀";
            default: return isEn ? "Regional Audit Cell" : "권역 감사 셀";
        }
    }

    private String resolveEmissionReviewMessage(String resultStatusCode, String verificationStatusCode, boolean isEn) {
        if ("VERIFIED".equalsIgnoreCase(verificationStatusCode)) {
            return isEn ? "Verification is complete. Review the site-level evidence and final calculation trace."
                    : "검증이 완료되었습니다. 배출지별 증빙과 최종 산정 이력을 확인하세요.";
        }
        if ("REVIEW".equalsIgnoreCase(resultStatusCode)) {
            return isEn ? "This result is in review. Confirm evidence completeness and anomaly notes before approval."
                    : "현재 검토 진행 중입니다. 승인 전 증빙 누락과 이상치 메모를 확인하세요.";
        }
        return isEn ? "The calculation draft is available for internal review before verification."
                : "검증 전 내부 검토를 위한 산정 초안입니다.";
    }

    private List<Map<String, String>> buildEmissionReviewChecklist(String resultId, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(mapOf("title", isEn ? "Calculation formula version" : "산정식 버전", "detail", resolveEmissionFormulaVersion(resultId)));
        rows.add(mapOf("title", isEn ? "Submission timestamp" : "제출 시각", "detail", resolveEmissionSubmittedAt(resultId)));
        rows.add(mapOf("title", isEn ? "Verification owner" : "검증 담당", "detail", resolveEmissionVerificationOwner(resultId, isEn)));
        return rows;
    }

    private String normalizeCertificatePeriodFilter(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        if ("LAST_6_MONTHS".equals(normalized) || "Q1_2026".equals(normalized)) {
            return normalized;
        }
        return "LAST_12_MONTHS";
    }

    private String normalizeTradeStatisticsPeriodFilter(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        if ("LAST_6_MONTHS".equals(normalized) || "Q1_2026".equals(normalized)) {
            return normalized;
        }
        return "LAST_12_MONTHS";
    }

    private boolean matchesCertificateStatisticsKeyword(Map<String, String> row, String normalizedKeyword) {
        return String.join(" ",
                        safeString(row.get("insttId")),
                        safeString(row.get("insttName")),
                        safeString(row.get("siteName")),
                        safeString(row.get("operatorName")),
                        safeString(row.get("certificateTypeLabel")))
                .toLowerCase(Locale.ROOT)
                .contains(normalizedKeyword);
    }

    private boolean matchesTradeStatisticsKeyword(Map<String, String> row, String normalizedKeyword) {
        return String.join(" ",
                        safeString(row.get("insttId")),
                        safeString(row.get("insttName")),
                        safeString(row.get("counterpartyName")),
                        safeString(row.get("tradeTypeLabel")),
                        safeString(row.get("primaryContractName")))
                .toLowerCase(Locale.ROOT)
                .contains(normalizedKeyword);
    }

    private List<Map<String, String>> selectCertificateMonthlyRows(List<Map<String, String>> sourceRows, String periodFilter) {
        if ("LAST_6_MONTHS".equals(periodFilter)) {
            return sourceRows.subList(Math.max(sourceRows.size() - 6, 0), sourceRows.size());
        }
        if ("Q1_2026".equals(periodFilter)) {
            return sourceRows.subList(Math.max(sourceRows.size() - 3, 0), sourceRows.size());
        }
        return sourceRows;
    }

    private List<Map<String, String>> selectTradeStatisticsMonthlyRows(List<Map<String, String>> sourceRows, String periodFilter) {
        if ("LAST_6_MONTHS".equals(periodFilter)) {
            return sourceRows.subList(Math.max(sourceRows.size() - 6, 0), sourceRows.size());
        }
        if ("Q1_2026".equals(periodFilter)) {
            return sourceRows.subList(Math.max(sourceRows.size() - 3, 0), sourceRows.size());
        }
        return sourceRows;
    }

    private int sumCertificateStatistic(List<Map<String, String>> rows, String key) {
        int total = 0;
        for (Map<String, String> row : rows) {
            String rawValue = safeString(row.get(key)).replace(",", "");
            if (rawValue.isEmpty()) {
                continue;
            }
            try {
                total += Integer.parseInt(rawValue);
            } catch (NumberFormatException ignored) {
                // Ignore malformed seed data and keep the screen available.
            }
        }
        return total;
    }

    private long sumTradeStatistic(List<Map<String, String>> rows, String key) {
        long total = 0L;
        for (Map<String, String> row : rows) {
            String rawValue = safeString(row.get(key)).replace(",", "");
            if (rawValue.isEmpty()) {
                continue;
            }
            try {
                total += Long.parseLong(rawValue);
            } catch (NumberFormatException ignored) {
                // Ignore malformed seed data and keep the screen available.
            }
        }
        return total;
    }

    private String formatCertificateLeadDays(List<Map<String, String>> rows) {
        double totalLeadDays = 0.0;
        int measuredRows = 0;
        for (Map<String, String> row : rows) {
            String rawValue = safeString(row.get("avgLeadDays")).replace(",", "");
            if (rawValue.isEmpty()) {
                continue;
            }
            try {
                totalLeadDays += Double.parseDouble(rawValue);
                measuredRows += 1;
            } catch (NumberFormatException ignored) {
                // Ignore malformed seed data and keep the screen available.
            }
        }
        if (measuredRows == 0) {
            return "0.0";
        }
        return String.format(Locale.ROOT, "%.1f", totalLeadDays / measuredRows);
    }

    private String formatTradeLeadDays(List<Map<String, String>> rows) {
        double totalLeadDays = 0.0;
        int measuredRows = 0;
        for (Map<String, String> row : rows) {
            String rawValue = safeString(row.get("avgSettlementDays")).replace(",", "");
            if (rawValue.isEmpty()) {
                continue;
            }
            try {
                totalLeadDays += Double.parseDouble(rawValue);
                measuredRows += 1;
            } catch (NumberFormatException ignored) {
                // Ignore malformed seed data and keep the screen available.
            }
        }
        if (measuredRows == 0) {
            return "0.0";
        }
        return String.format(Locale.ROOT, "%.1f", totalLeadDays / measuredRows);
    }

    private List<Map<String, String>> buildCertificateStatisticsMonthlyRows(boolean isEn) {
        return List.of(
                mapOf("monthLabel", isEn ? "Apr" : "04월", "issuedCount", "84", "reissuedCount", "7", "rejectedCount", "5"),
                mapOf("monthLabel", isEn ? "May" : "05월", "issuedCount", "91", "reissuedCount", "8", "rejectedCount", "6"),
                mapOf("monthLabel", isEn ? "Jun" : "06월", "issuedCount", "96", "reissuedCount", "10", "rejectedCount", "7"),
                mapOf("monthLabel", isEn ? "Jul" : "07월", "issuedCount", "108", "reissuedCount", "12", "rejectedCount", "8"),
                mapOf("monthLabel", isEn ? "Aug" : "08월", "issuedCount", "114", "reissuedCount", "12", "rejectedCount", "9"),
                mapOf("monthLabel", isEn ? "Sep" : "09월", "issuedCount", "120", "reissuedCount", "15", "rejectedCount", "8"),
                mapOf("monthLabel", isEn ? "Oct" : "10월", "issuedCount", "128", "reissuedCount", "15", "rejectedCount", "10"),
                mapOf("monthLabel", isEn ? "Nov" : "11월", "issuedCount", "136", "reissuedCount", "18", "rejectedCount", "11"),
                mapOf("monthLabel", isEn ? "Dec" : "12월", "issuedCount", "142", "reissuedCount", "17", "rejectedCount", "9"),
                mapOf("monthLabel", isEn ? "Jan" : "01월", "issuedCount", "149", "reissuedCount", "20", "rejectedCount", "11"),
                mapOf("monthLabel", isEn ? "Feb" : "02월", "issuedCount", "156", "reissuedCount", "21", "rejectedCount", "13"),
                mapOf("monthLabel", isEn ? "Mar" : "03월", "issuedCount", "164", "reissuedCount", "23", "rejectedCount", "14"));
    }

    private List<Map<String, String>> buildCertificateStatisticsTypeRows(boolean isEn) {
        return List.of(
                mapOf("certificateTypeCode", "EMISSION", "certificateTypeLabel", isEn ? "Emission Certificate" : "배출권 인증서", "requestCount", "342", "issuedCount", "281", "pendingCount", "31", "rejectedCount", "18", "avgLeadDays", "2.8", "successRate", "82.2"),
                mapOf("certificateTypeCode", "REDUCTION", "certificateTypeLabel", isEn ? "Reduction Confirmation" : "감축실적 확인서", "requestCount", "214", "issuedCount", "176", "pendingCount", "18", "rejectedCount", "9", "avgLeadDays", "2.3", "successRate", "82.2"),
                mapOf("certificateTypeCode", "REC", "certificateTypeLabel", isEn ? "REC Verification" : "REC 검증서", "requestCount", "168", "issuedCount", "132", "pendingCount", "17", "rejectedCount", "8", "avgLeadDays", "3.1", "successRate", "78.6"),
                mapOf("certificateTypeCode", "COMPLIANCE", "certificateTypeLabel", isEn ? "Compliance Report" : "준수 확인서", "requestCount", "122", "issuedCount", "95", "pendingCount", "14", "rejectedCount", "6", "avgLeadDays", "3.4", "successRate", "77.9"));
    }

    private List<Map<String, String>> buildCertificateStatisticsInstitutionRows(boolean isEn) {
        return List.of(
                mapOf("insttId", "INST-001", "insttName", isEn ? "Han River CCUS Demonstration Center" : "한강 CCUS 실증센터", "siteName", isEn ? "Capture Unit A" : "포집 설비 A", "operatorName", "review.lead", "certificateTypeCode", "EMISSION", "certificateTypeLabel", isEn ? "Emission Certificate" : "배출권 인증서", "statusCode", "ISSUED", "requestCount", "94", "issuedCount", "82", "pendingCount", "7", "rejectedCount", "3", "reissuedCount", "6", "avgLeadDays", "2.1", "lastIssuedAt", "2026-03-29 17:10", "detailUrl", buildAdminPath(isEn, "/certificate/review?insttId=INST-001")),
                mapOf("insttId", "INST-002", "insttName", isEn ? "Gyeonggi Carbon Storage Office" : "경기 저장소 운영본부", "siteName", isEn ? "Storage Block 2" : "저장 블록 2", "operatorName", "issue.master", "certificateTypeCode", "REDUCTION", "certificateTypeLabel", isEn ? "Reduction Confirmation" : "감축실적 확인서", "statusCode", "ISSUED", "requestCount", "73", "issuedCount", "61", "pendingCount", "6", "rejectedCount", "2", "reissuedCount", "4", "avgLeadDays", "2.4", "lastIssuedAt", "2026-03-28 14:42", "detailUrl", buildAdminPath(isEn, "/certificate/review?insttId=INST-002")),
                mapOf("insttId", "INST-003", "insttName", isEn ? "Southern CO2 Recovery Center" : "남부 CO2 회수센터", "siteName", isEn ? "Recovery Line 1" : "회수 라인 1", "operatorName", "queue.admin", "certificateTypeCode", "REC", "certificateTypeLabel", isEn ? "REC Verification" : "REC 검증서", "statusCode", "PENDING", "requestCount", "68", "issuedCount", "42", "pendingCount", "17", "rejectedCount", "4", "reissuedCount", "5", "avgLeadDays", "3.6", "lastIssuedAt", "2026-03-27 09:35", "detailUrl", buildAdminPath(isEn, "/certificate/pending_list?insttId=INST-003")),
                mapOf("insttId", "INST-004", "insttName", isEn ? "West Coast Capture Pilot Zone" : "서부 포집 시범단지", "siteName", isEn ? "Pilot Field" : "시범 부지", "operatorName", "audit.admin", "certificateTypeCode", "EMISSION", "certificateTypeLabel", isEn ? "Emission Certificate" : "배출권 인증서", "statusCode", "REJECTED", "requestCount", "51", "issuedCount", "29", "pendingCount", "8", "rejectedCount", "10", "reissuedCount", "3", "avgLeadDays", "4.2", "lastIssuedAt", "2026-03-26 12:05", "detailUrl", buildAdminPath(isEn, "/certificate/objection_list?insttId=INST-004")),
                mapOf("insttId", "INST-005", "insttName", isEn ? "East Sea Storage Validation Lab" : "동해 저장 검증랩", "siteName", isEn ? "Verification Bay" : "검증 베이", "operatorName", "review.team02", "certificateTypeCode", "COMPLIANCE", "certificateTypeLabel", isEn ? "Compliance Report" : "준수 확인서", "statusCode", "ISSUED", "requestCount", "66", "issuedCount", "55", "pendingCount", "5", "rejectedCount", "3", "reissuedCount", "5", "avgLeadDays", "2.9", "lastIssuedAt", "2026-03-25 16:22", "detailUrl", buildAdminPath(isEn, "/certificate/review?insttId=INST-005")),
                mapOf("insttId", "INST-006", "insttName", isEn ? "Chungcheong Monitoring Hub" : "충청 모니터링 허브", "siteName", isEn ? "Hub Control Room" : "허브 관제실", "operatorName", "ops.cert01", "certificateTypeCode", "REDUCTION", "certificateTypeLabel", isEn ? "Reduction Confirmation" : "감축실적 확인서", "statusCode", "ISSUED", "requestCount", "58", "issuedCount", "48", "pendingCount", "4", "rejectedCount", "2", "reissuedCount", "4", "avgLeadDays", "2.2", "lastIssuedAt", "2026-03-24 10:14", "detailUrl", buildAdminPath(isEn, "/certificate/review?insttId=INST-006")),
                mapOf("insttId", "INST-007", "insttName", isEn ? "Honam Conversion Cluster" : "호남 전환 클러스터", "siteName", isEn ? "Methanol Process" : "메탄올 공정", "operatorName", "ops.cert02", "certificateTypeCode", "REC", "certificateTypeLabel", isEn ? "REC Verification" : "REC 검증서", "statusCode", "REISSUED", "requestCount", "83", "issuedCount", "64", "pendingCount", "7", "rejectedCount", "5", "reissuedCount", "12", "avgLeadDays", "3.3", "lastIssuedAt", "2026-03-23 18:08", "detailUrl", buildAdminPath(isEn, "/certificate/review?insttId=INST-007")),
                mapOf("insttId", "INST-008", "insttName", isEn ? "Capital Compliance Group" : "수도권 준수 점검단", "siteName", isEn ? "Audit Desk" : "점검 데스크", "operatorName", "qa.cert03", "certificateTypeCode", "COMPLIANCE", "certificateTypeLabel", isEn ? "Compliance Report" : "준수 확인서", "statusCode", "PENDING", "requestCount", "53", "issuedCount", "31", "pendingCount", "14", "rejectedCount", "4", "reissuedCount", "2", "avgLeadDays", "3.8", "lastIssuedAt", "2026-03-22 11:47", "detailUrl", buildAdminPath(isEn, "/certificate/pending_list?insttId=INST-008")));
    }

    private List<Map<String, String>> buildCertificateStatisticsAlertRows(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Pending backlog above threshold" : "대기 백로그 임계치 초과",
                        "description", isEn ? "REC verification queue has 31 outstanding items across two institutions." : "REC 검증서 대기 건이 2개 기관에서 31건 누적되었습니다.",
                        "badge", isEn ? "Attention" : "주의",
                        "toneClassName", "bg-amber-100 text-amber-700",
                        "actionLabel", isEn ? "Open pending queue" : "대기열 열기",
                        "actionUrl", buildAdminPath(isEn, "/certificate/pending_list")),
                mapOf("title", isEn ? "Re-issuance concentration detected" : "재발급 집중 기관 감지",
                        "description", isEn ? "Honam Conversion Cluster exceeded the weekly re-issuance watch line." : "호남 전환 클러스터의 주간 재발급 건수가 감시선 이상입니다.",
                        "badge", isEn ? "Watch" : "관찰",
                        "toneClassName", "bg-sky-100 text-sky-700",
                        "actionLabel", isEn ? "Open review queue" : "검토 화면 열기",
                        "actionUrl", buildAdminPath(isEn, "/certificate/review?certificateType=REC")),
                mapOf("title", isEn ? "Rejected requests need follow-up" : "반려 건 후속 조치 필요",
                        "description", isEn ? "West Coast Capture Pilot Zone has unresolved objection candidates after rejection." : "서부 포집 시범단지에 반려 후 미해결 이의신청 후보가 남아 있습니다.",
                        "badge", isEn ? "Action" : "조치",
                        "toneClassName", "bg-rose-100 text-rose-700",
                        "actionLabel", isEn ? "Open objections" : "이의신청 열기",
                        "actionUrl", buildAdminPath(isEn, "/certificate/objection_list")));
    }

    private List<Map<String, String>> buildTradeStatisticsMonthlyRowsLegacyA(boolean isEn) {
        return List.of(
                mapOf("monthLabel", isEn ? "Apr" : "04월", "tradeVolume", "31800", "settlementAmount", "784000000", "pendingCount", "12", "exceptionCount", "2"),
                mapOf("monthLabel", isEn ? "May" : "05월", "tradeVolume", "33200", "settlementAmount", "826000000", "pendingCount", "11", "exceptionCount", "2"),
                mapOf("monthLabel", isEn ? "Jun" : "06월", "tradeVolume", "34800", "settlementAmount", "874000000", "pendingCount", "13", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Jul" : "07월", "tradeVolume", "36500", "settlementAmount", "915000000", "pendingCount", "14", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Aug" : "08월", "tradeVolume", "38100", "settlementAmount", "963000000", "pendingCount", "15", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Sep" : "09월", "tradeVolume", "39700", "settlementAmount", "1008000000", "pendingCount", "17", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Oct" : "10월", "tradeVolume", "41200", "settlementAmount", "1055000000", "pendingCount", "16", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Nov" : "11월", "tradeVolume", "42600", "settlementAmount", "1094000000", "pendingCount", "18", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Dec" : "12월", "tradeVolume", "44100", "settlementAmount", "1148000000", "pendingCount", "19", "exceptionCount", "5"),
                mapOf("monthLabel", isEn ? "Jan" : "01월", "tradeVolume", "45800", "settlementAmount", "1196000000", "pendingCount", "18", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Feb" : "02월", "tradeVolume", "47200", "settlementAmount", "1232000000", "pendingCount", "20", "exceptionCount", "5"),
                mapOf("monthLabel", isEn ? "Mar" : "03월", "tradeVolume", "48900", "settlementAmount", "1284000000", "pendingCount", "22", "exceptionCount", "6"));
    }

    private List<Map<String, String>> buildTradeStatisticsTypeRowsLegacyA(boolean isEn) {
        return List.of(
                mapOf("tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "requestCount", "164", "completedCount", "131", "pendingCount", "18", "exceptionCount", "5", "avgSettlementDays", "2.4", "settlementShare", "45.8"),
                mapOf("tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "requestCount", "118", "completedCount", "89", "pendingCount", "19", "exceptionCount", "4", "avgSettlementDays", "2.8", "settlementShare", "28.6"),
                mapOf("tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "requestCount", "96", "completedCount", "74", "pendingCount", "15", "exceptionCount", "6", "avgSettlementDays", "3.2", "settlementShare", "25.6"));
    }

    private List<Map<String, String>> buildTradeStatisticsInstitutionRowsLegacyA(boolean isEn) {
        return List.of(
                mapOf("insttId", "TRD-STAT-001", "insttName", isEn ? "Blue Energy" : "블루에너지", "counterpartyName", isEn ? "Hanul Steel" : "한울제철", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "settlementStatusCode", "PENDING", "tradeVolume", "12500", "settlementAmount", "418000000", "requestCount", "18", "completedCount", "12", "pendingCount", "4", "exceptionCount", "0", "avgSettlementDays", "2.6", "lastSettledAt", "2026-03-30 18:10", "primaryContractName", isEn ? "Quarterly offset bundle" : "분기 상쇄 배치", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Blue%20Energy")),
                mapOf("insttId", "TRD-STAT-002", "insttName", isEn ? "Seoul Mobility" : "서울모빌리티", "counterpartyName", isEn ? "Green Grid" : "그린그리드", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "settlementStatusCode", "IN_PROGRESS", "tradeVolume", "8000", "settlementAmount", "192000000", "requestCount", "14", "completedCount", "9", "pendingCount", "3", "exceptionCount", "0", "avgSettlementDays", "2.8", "lastSettledAt", "2026-03-30 16:25", "primaryContractName", isEn ? "Scope 2 hedge" : "Scope 2 헤지", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Seoul%20Mobility")),
                mapOf("insttId", "TRD-STAT-003", "insttName", isEn ? "Carbon Labs" : "카본랩스", "counterpartyName", isEn ? "Eco Farm" : "에코팜", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "settlementStatusCode", "PENDING", "tradeVolume", "4250", "settlementAmount", "87500000", "requestCount", "11", "completedCount", "7", "pendingCount", "3", "exceptionCount", "0", "avgSettlementDays", "3.1", "lastSettledAt", "2026-03-29 15:40", "primaryContractName", isEn ? "Biochar contract" : "바이오차 계약", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Carbon%20Labs")),
                mapOf("insttId", "TRD-STAT-004", "insttName", isEn ? "River Cement" : "리버시멘트", "counterpartyName", isEn ? "East Port" : "이스트포트", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "settlementStatusCode", "DONE", "tradeVolume", "15300", "settlementAmount", "522400000", "requestCount", "22", "completedCount", "20", "pendingCount", "1", "exceptionCount", "0", "avgSettlementDays", "2.2", "lastSettledAt", "2026-03-29 14:05", "primaryContractName", isEn ? "March balancing lot" : "3월 밸런싱 물량", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=River%20Cement")),
                mapOf("insttId", "TRD-STAT-005", "insttName", isEn ? "Urban Data" : "어반데이터", "counterpartyName", isEn ? "Sun Network" : "선네트워크", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "settlementStatusCode", "EXCEPTION", "tradeVolume", "6400", "settlementAmount", "154000000", "requestCount", "13", "completedCount", "8", "pendingCount", "2", "exceptionCount", "3", "avgSettlementDays", "4.4", "lastSettledAt", "2026-03-28 13:15", "primaryContractName", isEn ? "Data center reserve" : "데이터센터 예비물량", "detailUrl", buildAdminPath(isEn, "/trade/reject?tradeId=TRD-202603-005")),
                mapOf("insttId", "TRD-STAT-006", "insttName", isEn ? "Metro Heat" : "메트로히트", "counterpartyName", isEn ? "CCUS Plant A" : "CCUS 플랜트 A", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "settlementStatusCode", "IN_PROGRESS", "tradeVolume", "10100", "settlementAmount", "301000000", "requestCount", "19", "completedCount", "13", "pendingCount", "4", "exceptionCount", "1", "avgSettlementDays", "3.3", "lastSettledAt", "2026-03-28 17:42", "primaryContractName", isEn ? "Capture storage block" : "포집 저장 블록", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Metro%20Heat")),
                mapOf("insttId", "TRD-STAT-007", "insttName", isEn ? "Blue Energy" : "블루에너지", "counterpartyName", isEn ? "Nova Chemical" : "노바케미칼", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "settlementStatusCode", "PENDING", "tradeVolume", "9900", "settlementAmount", "333600000", "requestCount", "17", "completedCount", "11", "pendingCount", "5", "exceptionCount", "0", "avgSettlementDays", "2.7", "lastSettledAt", "2026-03-28 12:10", "primaryContractName", isEn ? "Seasonal hedge" : "계절성 헤지", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Nova%20Chemical")),
                mapOf("insttId", "TRD-STAT-008", "insttName", isEn ? "Harbor Cold Chain" : "하버콜드체인", "counterpartyName", isEn ? "Wind Core" : "윈드코어", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "settlementStatusCode", "DONE", "tradeVolume", "3200", "settlementAmount", "71000000", "requestCount", "9", "completedCount", "8", "pendingCount", "1", "exceptionCount", "0", "avgSettlementDays", "2.0", "lastSettledAt", "2026-03-28 10:32", "primaryContractName", isEn ? "Cold-chain coverage" : "콜드체인 커버리지", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Harbor%20Cold%20Chain")),
                mapOf("insttId", "TRD-STAT-009", "insttName", isEn ? "Green Grid" : "그린그리드", "counterpartyName", isEn ? "Forest Link" : "포레스트링크", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "settlementStatusCode", "PENDING", "tradeVolume", "5800", "settlementAmount", "126000000", "requestCount", "12", "completedCount", "9", "pendingCount", "2", "exceptionCount", "0", "avgSettlementDays", "2.9", "lastSettledAt", "2026-03-27 18:24", "primaryContractName", isEn ? "Afforestation offset" : "조림 상쇄 거래", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Green%20Grid")),
                mapOf("insttId", "TRD-STAT-010", "insttName", isEn ? "Seoul Mobility" : "서울모빌리티", "counterpartyName", isEn ? "River Cement" : "리버시멘트", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "settlementStatusCode", "DONE", "tradeVolume", "7700", "settlementAmount", "257000000", "requestCount", "15", "completedCount", "14", "pendingCount", "1", "exceptionCount", "0", "avgSettlementDays", "2.1", "lastSettledAt", "2026-03-27 09:08", "primaryContractName", isEn ? "Compliance shortfall fill" : "의무량 보전 계약", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Seoul%20Mobility")),
                mapOf("insttId", "TRD-STAT-011", "insttName", isEn ? "Metro Heat" : "메트로히트", "counterpartyName", isEn ? "North Solar" : "노스솔라", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "settlementStatusCode", "IN_PROGRESS", "tradeVolume", "2850", "settlementAmount", "59400000", "requestCount", "8", "completedCount", "5", "pendingCount", "2", "exceptionCount", "0", "avgSettlementDays", "3.0", "lastSettledAt", "2026-03-26 13:46", "primaryContractName", isEn ? "Heat network mix" : "열공급 믹스 거래", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Metro%20Heat")),
                mapOf("insttId", "TRD-STAT-012", "insttName", isEn ? "Hanul Steel" : "한울제철", "counterpartyName", isEn ? "Eco Farm" : "에코팜", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "settlementStatusCode", "EXCEPTION", "tradeVolume", "6900", "settlementAmount", "143500000", "requestCount", "10", "completedCount", "4", "pendingCount", "3", "exceptionCount", "2", "avgSettlementDays", "4.1", "lastSettledAt", "2026-03-25 16:18", "primaryContractName", isEn ? "Agriculture offset pool" : "농업 상쇄 풀", "detailUrl", buildAdminPath(isEn, "/trade/reject?tradeId=TRD-202603-012")));
    }

    private List<Map<String, String>> buildTradeStatisticsAlertRowsLegacyA(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Pending settlement backlog" : "정산 대기 백로그",
                        "description", isEn ? "Blue Energy and Seoul Mobility hold the largest unsettled queues this week." : "블루에너지와 서울모빌리티의 미정산 큐가 이번 주 가장 큽니다.",
                        "badge", isEn ? "Attention" : "주의",
                        "toneClassName", "bg-amber-100 text-amber-700",
                        "actionLabel", isEn ? "Open trade queue" : "거래 목록 열기",
                        "actionUrl", buildAdminPath(isEn, "/trade/list?settlementStatus=PENDING")),
                mapOf("title", isEn ? "Settlement exceptions concentrated" : "정산 예외 기관 집중",
                        "description", isEn ? "Urban Data and Hanul Steel need operator follow-up for exception resolution." : "어반데이터와 한울제철 건은 예외 해소를 위한 운영자 후속 조치가 필요합니다.",
                        "badge", isEn ? "Action" : "조치",
                        "toneClassName", "bg-rose-100 text-rose-700",
                        "actionLabel", isEn ? "Open exception queue" : "예외 큐 열기",
                        "actionUrl", buildAdminPath(isEn, "/trade/list?settlementStatus=EXCEPTION")),
                mapOf("title", isEn ? "REC settlement pace slowing" : "REC 정산 속도 저하",
                        "description", isEn ? "REC package settlement lead time exceeded the watch line for two consecutive weeks." : "REC 패키지의 정산 소요일이 2주 연속 감시선 이상입니다.",
                        "badge", isEn ? "Watch" : "관찰",
                        "toneClassName", "bg-sky-100 text-sky-700",
                        "actionLabel", isEn ? "Filter REC reports" : "REC 리포트 보기",
                        "actionUrl", buildAdminPath(isEn, "/trade/statistics?tradeType=REC")));
    }

    private List<Map<String, String>> buildTradeStatisticsMonthlyRows(boolean isEn) {
        return buildTradeStatisticsMonthlyRowsLegacyA(isEn);
    }

    private List<Map<String, String>> buildTradeStatisticsTypeRows(boolean isEn) {
        return buildTradeStatisticsTypeRowsLegacyA(isEn);
    }

    private List<Map<String, String>> buildTradeStatisticsInstitutionRows(boolean isEn) {
        return buildTradeStatisticsInstitutionRowsLegacyA(isEn);
    }

    private List<Map<String, String>> buildTradeStatisticsAlertRows(boolean isEn) {
        return buildTradeStatisticsAlertRowsLegacyA(isEn);
    }

    private List<Map<String, String>> buildEmissionResultSiteRows(String resultId, boolean isEn) {
        if ("ER-2026-002".equalsIgnoreCase(safeString(resultId))) {
            return List.of(
                    mapOf("siteName", isEn ? "Hydrogen Reforming Unit" : "수소 개질 설비", "scopeLabel", "Scope 1", "activityLabel", isEn ? "Natural gas 18,420 Nm3" : "천연가스 18,420 Nm3", "emissionValue", "41,200 tCO2e", "statusLabel", isEn ? "Evidence pending" : "증빙 보완 필요"),
                    mapOf("siteName", isEn ? "Steam Generator" : "스팀 발생기", "scopeLabel", "Scope 1", "activityLabel", isEn ? "Fuel 12,110 GJ" : "연료 12,110 GJ", "emissionValue", "21,480 tCO2e", "statusLabel", isEn ? "Reviewed" : "검토 완료"),
                    mapOf("siteName", isEn ? "Utility Power Feed" : "유틸리티 전력", "scopeLabel", "Scope 2", "activityLabel", isEn ? "Power 9,880 MWh" : "전력 9,880 MWh", "emissionValue", "21,530 tCO2e", "statusLabel", isEn ? "Reviewed" : "검토 완료"));
        }
        return List.of(
                mapOf("siteName", isEn ? "Capture Train A" : "포집 트레인 A", "scopeLabel", "Scope 1", "activityLabel", isEn ? "Fuel 22,400 GJ" : "연료 22,400 GJ", "emissionValue", "52,140 tCO2e", "statusLabel", isEn ? "Reviewed" : "검토 완료"),
                mapOf("siteName", isEn ? "Compression Line" : "압축 라인", "scopeLabel", "Scope 2", "activityLabel", isEn ? "Power 14,220 MWh" : "전력 14,220 MWh", "emissionValue", "37,880 tCO2e", "statusLabel", isEn ? "Reviewed" : "검토 완료"),
                mapOf("siteName", isEn ? "Storage & Transfer" : "저장·이송 설비", "scopeLabel", "Scope 3", "activityLabel", isEn ? "Transport 480 runs" : "운송 480회", "emissionValue", "35,420 tCO2e", "statusLabel", isEn ? "Reviewed" : "검토 완료"));
    }

    private List<Map<String, String>> buildEmissionEvidenceRows(String resultId, boolean isEn) {
        return List.of(
                mapOf("fileName", safeString(resultId) + "_activity-data.xlsx", "categoryLabel", isEn ? "Activity data" : "활동자료", "updatedAt", "2026-03-04 09:10", "owner", isEn ? "Emission operator" : "배출 담당자", "statusLabel", isEn ? "Submitted" : "제출 완료"),
                mapOf("fileName", safeString(resultId) + "_meter-log.pdf", "categoryLabel", isEn ? "Meter log" : "계측 로그", "updatedAt", "2026-03-04 11:30", "owner", isEn ? "Site manager" : "현장 관리자", "statusLabel", isEn ? "Reviewed" : "검토 완료"),
                mapOf("fileName", safeString(resultId) + "_verification-note.docx", "categoryLabel", isEn ? "Verification note" : "검증 메모", "updatedAt", "2026-03-05 14:00", "owner", resolveEmissionVerificationOwner(resultId, isEn), "statusLabel", isEn ? "Linked" : "연결 완료"));
    }

    private List<Map<String, String>> buildEmissionHistoryRows(String resultId, boolean isEn) {
        return List.of(
                mapOf("actionAt", "2026-03-04 08:55", "actor", isEn ? "Emission operator" : "배출 담당자", "actionLabel", isEn ? "Calculation executed" : "산정 실행", "note", resolveEmissionFormulaVersion(resultId) + (isEn ? " applied" : " 적용")),
                mapOf("actionAt", "2026-03-04 13:40", "actor", resolveEmissionVerificationOwner(resultId, isEn), "actionLabel", isEn ? "Review requested" : "검토 요청", "note", isEn ? "Evidence bundle attached." : "증빙 묶음 첨부"),
                mapOf("actionAt", "2026-03-05 10:05", "actor", resolveEmissionVerificationOwner(resultId, isEn), "actionLabel", isEn ? "Status updated" : "상태 변경", "note", resolveEmissionReviewMessage("", "VERIFIED", isEn)));
    }

    public Map<String, Object> buildEmissionDataHistoryPageData(
            String pageIndexParam,
            String searchKeyword,
            String changeType,
            String changeTarget,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedChangeType = safeString(changeType).toUpperCase(Locale.ROOT);
        String normalizedChangeTarget = safeString(changeTarget).toUpperCase(Locale.ROOT);
        String adminPrefix = isEn ? "/en/admin" : "/admin";

        List<Map<String, String>> allRows = buildEmissionDataHistoryRows(isEn, adminPrefix);
        List<Map<String, String>> filteredRows = allRows.stream()
                .filter(row -> normalizedChangeType.isEmpty() || normalizedChangeType.equals(safeString(row.get("changeTypeCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedChangeTarget.isEmpty() || normalizedChangeTarget.equals(safeString(row.get("changeTargetCode")).toUpperCase(Locale.ROOT)))
                .filter(row -> normalizedKeyword.isEmpty() || matchesEmissionHistoryKeyword(row, normalizedKeyword))
                .collect(Collectors.toList());

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pageItems = filteredRows.subList(fromIndex, toIndex);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("historyRows", pageItems);
        response.put("totalCount", totalCount);
        response.put("correctionCount", countEmissionHistoryByType(filteredRows, "CORRECTION"));
        response.put("approvalCount", countEmissionHistoryByType(filteredRows, "APPROVAL"));
        response.put("schemaCount", countEmissionHistoryByType(filteredRows, "SCHEMA"));
        response.put("summaryCards", buildEmissionDataHistorySummaryCards(filteredRows, isEn));
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("changeType", normalizedChangeType);
        response.put("changeTarget", normalizedChangeTarget);
        response.put("changeTypeOptions", buildEmissionDataHistoryChangeTypeOptions(isEn));
        response.put("changeTargetOptions", buildEmissionDataHistoryChangeTargetOptions(isEn));
        response.put("changeTypeMeta", buildEmissionDataHistoryChangeTypeMeta(isEn));
        response.put("changeTargetMeta", buildEmissionDataHistoryChangeTargetMeta(isEn));
        response.put("detailBaseUrl", adminPrefix + "/emission/result_list");
        return response;
    }

    public Map<String, Object> buildEmissionSiteManagementPageData(boolean isEn) {
        Map<String, Object> response = new LinkedHashMap<>();
        String menuCode = "A0020105";
        String adminPrefix = isEn ? "/en/admin" : "/admin";
        String homePrefix = isEn ? "/en" : "";
        String selfUrl = adminPrefix + "/emission/site-management";
        String homeReferenceUrl = homePrefix + "/emission/project_list";
        String functionManagementUrl = adminPrefix + "/system/feature-management?menuType=ADMIN&searchMenuCode=" + menuCode;
        String menuManagementUrl = adminPrefix + "/system/menu?menuType=ADMIN";
        String resultListUrl = adminPrefix + "/emission/result_list";
        String dataHistoryUrl = adminPrefix + "/emission/data_history";

        response.put("isEn", isEn);
        response.put("menuCode", menuCode);
        response.put("menuUrl", selfUrl);
        response.put("homeReferenceUrl", homeReferenceUrl);
        response.put("referenceFolder", "/opt/reference/screen/홈 화면/배출지 관리/한글");
        response.put("summaryCards", List.of(
                summaryCard(isEn ? "Admin Direct Registration" : "관리자 직접 등록", isEn ? "Enabled" : "사용 가능",
                        isEn ? "Use this menu as the direct admin entry for new emission site registration." : "신규 배출지 등록의 관리자 직접 진입 화면으로 사용합니다.", "text-[var(--kr-gov-blue)]"),
                summaryCard(isEn ? "Function Catalog" : "기능 카탈로그", "9",
                        isEn ? "Seeded feature codes are ready for role mapping and function management." : "역할 매핑과 기능 관리를 위한 시드 기능 코드 9개를 제공합니다.", "text-emerald-600"),
                summaryCard(isEn ? "Home Reference" : "홈 기준 경로", "/emission/project_list",
                        isEn ? "Keep the user-side workflow aligned with the home route." : "사용자용 흐름은 홈 화면 경로를 기준으로 맞춥니다.", "text-amber-600")
        ));
        response.put("quickLinks", List.of(
                quickLink(isEn ? "Direct Register" : "배출지 등록", selfUrl + "#register", "add_business"),
                quickLink(isEn ? "Function Management" : "기능 관리", functionManagementUrl, "deployed_code"),
                quickLink(isEn ? "Menu Management" : "메뉴 관리", menuManagementUrl, "account_tree"),
                quickLink(isEn ? "Data History" : "데이터 변경 이력", dataHistoryUrl, "history")
        ));
        response.put("operationCards", List.of(
                operationCard(isEn ? "Emission Site Registration" : "배출지 등록",
                        isEn ? "Create new emission site records directly from the admin workspace." : "관리자 작업공간에서 신규 배출지를 직접 등록합니다.",
                        isEn ? "Direct admin action" : "관리자 직접 처리",
                        selfUrl + "#register",
                        isEn ? "Open registration guide" : "등록 가이드 열기",
                        functionManagementUrl,
                        isEn ? "Manage function" : "기능 관리"),
                operationCard(isEn ? "Data Input" : "데이터 입력",
                        isEn ? "Control the input workflow from admin while keeping the home reference available." : "홈 기준 흐름을 유지하되 입력 통제는 관리자에서 관리합니다.",
                        isEn ? "Managed from admin" : "관리자 통제",
                        homeReferenceUrl,
                        isEn ? "Open home reference" : "홈 기준 경로 열기",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "Data Input" : "데이터 입력"),
                        isEn ? "Open related feature" : "관련 기능 열기"),
                operationCard(isEn ? "Calculation Logic Registration" : "산정 로직 등록",
                        isEn ? "Register and govern calculation logic under the same admin menu." : "동일한 관리자 메뉴 아래에서 산정 로직을 등록하고 관리합니다.",
                        isEn ? "Admin governed" : "관리자 거버넌스",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "Calculation Logic" : "산정 로직"),
                        isEn ? "Open feature setup" : "기능 설정 열기",
                        menuManagementUrl,
                        isEn ? "Review menu placement" : "메뉴 배치 보기"),
                operationCard(isEn ? "Document Supplement" : "서류 보완",
                        isEn ? "Follow up missing or rejected documents from the admin side." : "누락 또는 반려 서류는 관리자 화면에서 후속 처리합니다.",
                        isEn ? "Admin follow-up" : "관리자 후속 처리",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "Document" : "서류 보완"),
                        isEn ? "Open supplement feature" : "보완 기능 열기",
                        resultListUrl,
                        isEn ? "Check history" : "이력 보기"),
                operationCard(isEn ? "History Review" : "이력 확인",
                        isEn ? "Use result history and operational records to trace the emission site lifecycle." : "배출지 생명주기 추적은 결과 이력과 운영 기록을 함께 사용합니다.",
                        isEn ? "History enabled" : "이력 사용",
                        dataHistoryUrl,
                        isEn ? "Open data history" : "데이터 이력 열기",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "History" : "이력 확인"),
                        isEn ? "Open feature" : "기능 열기"),
                operationCard(isEn ? "Report Export" : "보고서 출력",
                        isEn ? "Connect report export authority and operator entry from one admin menu." : "동일 관리자 메뉴에서 보고서 출력 권한과 운영 진입을 함께 관리합니다.",
                        isEn ? "Export ready" : "출력 준비",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "Report" : "보고서 출력"),
                        isEn ? "Open report feature" : "보고서 기능 열기",
                        homeReferenceUrl,
                        isEn ? "Open home screen" : "홈 화면 열기"),
                operationCard(isEn ? "Administration" : "관리",
                        isEn ? "Keep menu, page, and function governance in the admin domain." : "메뉴, 화면, 기능 거버넌스는 관리자 도메인에서 유지합니다.",
                        isEn ? "Governed" : "거버넌스 적용",
                        menuManagementUrl,
                        isEn ? "Open menu management" : "메뉴 관리 열기",
                        functionManagementUrl,
                        isEn ? "Open function management" : "기능 관리 열기"),
                operationCard(isEn ? "Integrated Monitoring Report" : "종합 배출 모니터링 리포트",
                        isEn ? "Bind the integrated monitoring report to the same admin authority chain." : "종합 배출 모니터링 리포트를 동일한 관리자 권한 체인에 연결합니다.",
                        isEn ? "Monitoring ready" : "모니터링 준비",
                        resultListUrl,
                        isEn ? "Open monitoring result list" : "모니터링 결과 열기",
                        functionManagementUrl + "&searchKeyword=" + urlQueryValue(isEn ? "Monitoring" : "모니터링"),
                        isEn ? "Open monitoring feature" : "모니터링 기능 열기")
        ));
        response.put("featureRows", List.of(
                featureRow(menuCode + "_VIEW", isEn ? "View page access" : "화면 조회", isEn ? "Base page access feature for the admin menu." : "관리자 메뉴의 기본 조회 권한입니다.", functionManagementUrl),
                featureRow(menuCode + "_REGISTER", isEn ? "Emission site registration" : "배출지 등록", isEn ? "Admin direct registration capability." : "관리자 직접 등록 기능입니다.", functionManagementUrl),
                featureRow(menuCode + "_DATA_INPUT", isEn ? "Emission data input" : "배출 데이터 입력", isEn ? "Activity data input control." : "활동자료 입력 통제 기능입니다.", functionManagementUrl),
                featureRow(menuCode + "_CALCULATION", isEn ? "Calculation logic registration" : "산정 로직 등록", isEn ? "Calculation logic operation control." : "산정 로직 운영 통제 기능입니다.", functionManagementUrl),
                featureRow(menuCode + "_DOCUMENT", isEn ? "Document supplement" : "서류 보완 관리", isEn ? "Follow-up workflow for supplemental documents." : "보완 서류 후속 처리 기능입니다.", functionManagementUrl),
                featureRow(menuCode + "_HISTORY", isEn ? "History review" : "이력 확인", isEn ? "Operational history review authority." : "운영 이력 확인 권한입니다.", functionManagementUrl),
                featureRow(menuCode + "_REPORT", isEn ? "Report export" : "보고서 출력", isEn ? "Report generation and export authority." : "보고서 생성 및 출력 권한입니다.", functionManagementUrl),
                featureRow(menuCode + "_MANAGE", isEn ? "Administration" : "배출지 운영 관리", isEn ? "Administrative governance actions." : "관리자 운영 제어 기능입니다.", functionManagementUrl),
                featureRow(menuCode + "_MONITOR", isEn ? "Integrated monitoring report" : "종합 배출 모니터링 리포트", isEn ? "Integrated report and monitoring authority." : "종합 리포트 및 모니터링 권한입니다.", functionManagementUrl)
        ));
        response.put("referenceRows", List.of(
                referenceRow(isEn ? "Design reference folder" : "설계 기준 폴더", "/opt/reference/screen/홈 화면/배출지 관리/한글"),
                referenceRow(isEn ? "Home reference path" : "홈 기준 경로", homeReferenceUrl),
                referenceRow(isEn ? "Admin menu path" : "관리자 메뉴 경로", selfUrl),
                referenceRow(isEn ? "Function management link" : "기능 관리 링크", functionManagementUrl)
        ));
        return response;
    }

    public Map<String, Object> buildEmissionValidatePageData(
            String pageIndexParam,
            String resultId,
            String searchKeyword,
            String verificationStatus,
            String priorityFilter,
            boolean isEn) {
        int pageIndex = 1;
        if (!safeString(pageIndexParam).isEmpty()) {
            try {
                pageIndex = Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                pageIndex = 1;
            }
        }

        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String normalizedResultId = safeString(resultId);
        String normalizedVerificationStatus = safeString(verificationStatus).toUpperCase(Locale.ROOT);
        String normalizedPriority = safeString(priorityFilter).toUpperCase(Locale.ROOT);
        String menuCode = "A0020104";
        String adminPrefix = isEn ? "/en/admin" : "/admin";
        String resultListUrl = adminPrefix + "/emission/result_list";
        String functionManagementUrl = adminPrefix + "/system/feature-management?menuType=ADMIN&searchMenuCode=" + menuCode;

        EmissionResultFilterSnapshot filterSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(
                isEn,
                keyword,
                "",
                normalizedVerificationStatus);

        List<Map<String, String>> queueRows = new ArrayList<>();
        for (EmissionResultSummaryView item : filterSnapshot.getItems()) {
            String priorityCode = deriveVerificationPriorityCode(item);
            if (!normalizedPriority.isEmpty() && !normalizedPriority.equals(priorityCode)) {
                continue;
            }
            queueRows.add(verificationQueueRow(item, priorityCode, isEn));
        }

        int totalCount = queueRows.size();
        int pageSize = 8;
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        if (pageIndexParam == null || pageIndexParam.trim().isEmpty()) {
            int selectedIndex = -1;
            for (int i = 0; i < queueRows.size(); i++) {
                if (normalizedResultId.equalsIgnoreCase(safeString(queueRows.get(i).get("resultId")))) {
                    selectedIndex = i;
                    break;
                }
            }
            if (selectedIndex >= 0) {
                pageIndex = (selectedIndex / pageSize) + 1;
            }
        }
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.min((currentPage - 1) * pageSize, totalCount);
        int toIndex = Math.min(fromIndex + pageSize, totalCount);
        List<Map<String, String>> pagedRows = queueRows.subList(fromIndex, toIndex);
        Map<String, String> selectedResultSummary = null;
        if (!normalizedResultId.isEmpty()) {
            for (Map<String, String> row : queueRows) {
                if (normalizedResultId.equalsIgnoreCase(safeString(row.get("resultId")))) {
                    selectedResultSummary = new LinkedHashMap<>();
                    selectedResultSummary.put("resultId", safeString(row.get("resultId")));
                    selectedResultSummary.put("projectName", safeString(row.get("projectName")));
                    selectedResultSummary.put("companyName", safeString(row.get("companyName")));
                    selectedResultSummary.put("verificationStatusLabel", safeString(row.get("verificationStatusLabel")));
                    selectedResultSummary.put("priorityLabel", safeString(row.get("priorityLabel")));
                    selectedResultSummary.put("detailUrl", safeString(row.get("detailUrl")));
                    break;
                }
            }
        }

        long pendingCount = queueRows.stream()
                .filter(row -> "PENDING".equalsIgnoreCase(safeString(row.get("verificationStatusCode"))))
                .count();
        long inProgressCount = queueRows.stream()
                .filter(row -> "IN_PROGRESS".equalsIgnoreCase(safeString(row.get("verificationStatusCode"))))
                .count();
        long failedCount = queueRows.stream()
                .filter(row -> "FAILED".equalsIgnoreCase(safeString(row.get("verificationStatusCode"))))
                .count();
        long highPriorityCount = queueRows.stream()
                .filter(row -> "HIGH".equalsIgnoreCase(safeString(row.get("priorityCode"))))
                .count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("isEn", isEn);
        response.put("menuCode", menuCode);
        response.put("resultId", normalizedResultId);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("verificationStatus", normalizedVerificationStatus);
        response.put("priorityFilter", normalizedPriority);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("totalCount", totalCount);
        response.put("pendingCount", pendingCount);
        response.put("inProgressCount", inProgressCount);
        response.put("failedCount", failedCount);
        response.put("highPriorityCount", highPriorityCount);
        response.put("selectedResultFound", selectedResultSummary != null);
        response.put("selectedResult", selectedResultSummary);
        response.put("queueRows", pagedRows);
        response.put("summaryCards", List.of(
                summaryCard(isEn ? "Verification Queue" : "검증 대기열", String.valueOf(totalCount),
                        isEn ? "Items currently routed through verification management." : "검증 관리 작업공간에서 현재 처리 중인 건수입니다.", "text-[var(--kr-gov-blue)]"),
                summaryCard(isEn ? "Pending / In Progress" : "대기 / 진행중", pendingCount + " / " + inProgressCount,
                        isEn ? "Separate waiting items from actively reviewed items." : "대기 건과 실검토 건을 분리해서 추적합니다.", "text-amber-600"),
                summaryCard(isEn ? "Failed / High Priority" : "반려 / 고우선", failedCount + " / " + highPriorityCount,
                        isEn ? "Rejected or risky items should be triaged first." : "반려 또는 위험 건은 우선적으로 재검토합니다.", "text-red-600")
        ));
        response.put("priorityLegend", List.of(
                verificationLegendRow(isEn ? "High" : "높음", isEn ? "Missing evidence or failed verification" : "증빙 누락 또는 검증 반려 건", "HIGH"),
                verificationLegendRow(isEn ? "Medium" : "중간", isEn ? "Actively under verifier review" : "검증 담당자가 검토 중인 건", "MEDIUM"),
                verificationLegendRow(isEn ? "Normal" : "일반", isEn ? "Waiting for initial verification assignment" : "최초 검증 배정을 기다리는 건", "NORMAL")
        ));
        response.put("policyRows", List.of(
                verificationPolicyRow(isEn ? "Evidence completeness" : "증빙 완결성", isEn ? "Check source documents, meter logs, and factor references before approval." : "승인 전 원천 문서, 계측 로그, 계수 근거를 모두 확인합니다."),
                verificationPolicyRow(isEn ? "Calculation delta review" : "산정 편차 검토", isEn ? "Escalate items when emission totals shift sharply from the previous cycle." : "이전 주기 대비 총배출량 편차가 큰 건은 상향 검토합니다."),
                verificationPolicyRow(isEn ? "Final action trace" : "최종 조치 이력", isEn ? "Approval, rejection, and supplement requests must leave an operator trace." : "승인, 반려, 보완 요청은 모두 운영자 이력을 남겨야 합니다.")
        ));
        response.put("actionLinks", List.of(
                quickLink(isEn ? "Result List" : "산정 결과 목록", resultListUrl, "table_view"),
                quickLink(isEn ? "Pending Review" : "검토 대기", resultListUrl + "?verificationStatus=PENDING", "hourglass_top"),
                quickLink(isEn ? "Failed Review" : "반려 건", resultListUrl + "?verificationStatus=FAILED", "warning"),
                quickLink(isEn ? "Feature Management" : "기능 관리", functionManagementUrl, "deployed_code")
        ));
        return response;
    }

    private Map<String, String> statsRow(String key, String label, String percentage, String count, String colorClass) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("key", key);
        row.put("label", label);
        row.put("percentage", percentage);
        row.put("count", count);
        row.put("colorClass", colorClass);
        return row;
    }

    private Map<String, String> monthlySignupRow(String month, String currentHeight, String previousHeight, boolean active) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("month", month);
        row.put("currentHeight", currentHeight);
        row.put("previousHeight", previousHeight);
        row.put("active", active ? "Y" : "N");
        return row;
    }

    private Map<String, String> regionalDistributionRow(String region, String percentage, String countLabel) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("region", region);
        row.put("percentage", percentage);
        row.put("countLabel", countLabel);
        return row;
    }

    private Map<String, String> summaryCard(String title, String value, String description, String toneClass) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("value", value);
        row.put("description", description);
        row.put("toneClass", toneClass);
        return row;
    }

    private Map<String, String> summaryCard(String title,
                                            String value,
                                            String description,
                                            String toneClass,
                                            String surfaceClassName) {
        Map<String, String> row = summaryCard(title, value, description, toneClass);
        row.put("surfaceClassName", surfaceClassName);
        return row;
    }

    private Map<String, String> quickLink(String label, String url, String icon) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("url", url);
        row.put("icon", icon);
        return row;
    }

    private Map<String, String> operationCard(String title,
                                              String description,
                                              String statusLabel,
                                              String primaryUrl,
                                              String primaryLabel,
                                              String secondaryUrl,
                                              String secondaryLabel) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        row.put("statusLabel", statusLabel);
        row.put("primaryUrl", primaryUrl);
        row.put("primaryLabel", primaryLabel);
        row.put("secondaryUrl", secondaryUrl);
        row.put("secondaryLabel", secondaryLabel);
        return row;
    }

    private Map<String, String> featureRow(String featureCode, String featureName, String featureDescription, String functionManagementUrl) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("featureCode", featureCode);
        row.put("featureName", featureName);
        row.put("featureDescription", featureDescription);
        row.put("manageUrl", functionManagementUrl);
        return row;
    }

    private Map<String, String> referenceRow(String label, String value) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("value", value);
        return row;
    }

    private List<Map<String, String>> buildEmissionDataHistoryRows(boolean isEn, String adminPrefix) {
        return List.of(
                emissionDataHistoryRow("HIS-2026-0042", "2026-03-29 16:40", "동해 CCUS 실증", "포집시설 A-01", "system.admin", "CORRECTION",
                        isEn ? "Correction" : "정정", "ACTIVITY_DATA", isEn ? "Activity Data" : "활동자료",
                        isEn ? "Fuel usage 3,250 Nm3" : "연료 사용량 3,250 Nm3",
                        isEn ? "Fuel usage 3,480 Nm3" : "연료 사용량 3,480 Nm3",
                        adminPrefix + "/emission/result_list?searchKeyword=동해+CCUS"),
                emissionDataHistoryRow("HIS-2026-0041", "2026-03-29 13:12", "서해 저장소 검증", "압축라인 C-02", "qa.operator", "APPROVAL",
                        isEn ? "Approval" : "승인 반영", "VERIFICATION_STATUS", isEn ? "Verification Status" : "검증 상태",
                        isEn ? "Pending review" : "검증 대기",
                        isEn ? "Verified" : "검증 완료",
                        adminPrefix + "/emission/result_list?verificationStatus=VERIFIED"),
                emissionDataHistoryRow("HIS-2026-0040", "2026-03-28 19:08", "남부 배출원 점검", "배출원 S-11", "schema.bot", "SCHEMA",
                        isEn ? "Schema sync" : "스키마 동기화", "EMISSION_FACTOR", isEn ? "Emission Factor" : "배출계수",
                        isEn ? "Tier 2 factor 0.932" : "Tier 2 계수 0.932",
                        isEn ? "Tier 3 factor 0.918" : "Tier 3 계수 0.918",
                        adminPrefix + "/emission/result_list?searchKeyword=남부"),
                emissionDataHistoryRow("HIS-2026-0039", "2026-03-28 14:22", "인천 수송망 연계", "이송설비 B-08", "audit.manager", "CORRECTION",
                        isEn ? "Correction" : "정정", "ATTACHMENT", isEn ? "Attachment" : "첨부 문서",
                        isEn ? "Evidence file missing" : "증빙 파일 누락",
                        isEn ? "Evidence file uploaded" : "증빙 파일 업로드 완료",
                        adminPrefix + "/emission/result_list?searchKeyword=인천"),
                emissionDataHistoryRow("HIS-2026-0038", "2026-03-28 10:10", "중부 포집 시범", "포집설비 P-03", "review.lead", "APPROVAL",
                        isEn ? "Approval" : "승인 반영", "RESULT_STATUS", isEn ? "Result Status" : "산정 상태",
                        isEn ? "Under review" : "검토 중",
                        isEn ? "Completed" : "산정 완료",
                        adminPrefix + "/emission/result_list?resultStatus=COMPLETED"),
                emissionDataHistoryRow("HIS-2026-0037", "2026-03-27 17:32", "울산 저장소 운영", "저장탱크 T-09", "system.admin", "SCHEMA",
                        isEn ? "Schema sync" : "스키마 동기화", "SITE_METADATA", isEn ? "Site Metadata" : "배출지 메타데이터",
                        isEn ? "Storage class B" : "저장 등급 B",
                        isEn ? "Storage class A" : "저장 등급 A",
                        adminPrefix + "/emission/site-management"),
                emissionDataHistoryRow("HIS-2026-0036", "2026-03-27 09:56", "포항 연계 검토", "배관라인 R-04", "field.manager", "CORRECTION",
                        isEn ? "Correction" : "정정", "CALCULATION_FORMULA", isEn ? "Calculation Formula" : "산정식",
                        isEn ? "Recovery rate 91.2%" : "회수율 91.2%",
                        isEn ? "Recovery rate 92.6%" : "회수율 92.6%",
                        adminPrefix + "/emission/result_list?searchKeyword=포항"),
                emissionDataHistoryRow("HIS-2026-0035", "2026-03-26 18:41", "광양 실증 운영", "압축설비 G-07", "qa.operator", "APPROVAL",
                        isEn ? "Approval" : "승인 반영", "ATTACHMENT", isEn ? "Attachment" : "첨부 문서",
                        isEn ? "Supplement requested" : "보완 요청",
                        isEn ? "Supplement accepted" : "보완 승인",
                        adminPrefix + "/emission/result_list?searchKeyword=광양"),
                emissionDataHistoryRow("HIS-2026-0034", "2026-03-26 11:17", "강릉 테스트베드", "배출원 K-01", "schema.bot", "SCHEMA",
                        isEn ? "Schema sync" : "스키마 동기화", "MONITORING_RULE", isEn ? "Monitoring Rule" : "모니터링 규칙",
                        isEn ? "15 min interval" : "15분 간격",
                        isEn ? "5 min interval" : "5분 간격",
                        adminPrefix + "/emission/data_history?changeTarget=MONITORING_RULE"),
                emissionDataHistoryRow("HIS-2026-0033", "2026-03-25 15:03", "경기 포집 검증", "포집라인 Y-12", "review.lead", "CORRECTION",
                        isEn ? "Correction" : "정정", "VERIFICATION_STATUS", isEn ? "Verification Status" : "검증 상태",
                        isEn ? "Failed" : "재검토 필요",
                        isEn ? "In progress" : "검증 진행중",
                        adminPrefix + "/emission/result_list?verificationStatus=IN_PROGRESS"),
                emissionDataHistoryRow("HIS-2026-0032", "2026-03-25 09:28", "전북 실증 단지", "보정설비 J-05", "audit.manager", "APPROVAL",
                        isEn ? "Approval" : "승인 반영", "SITE_METADATA", isEn ? "Site Metadata" : "배출지 메타데이터",
                        isEn ? "Operator team Beta" : "운영팀 Beta",
                        isEn ? "Operator team Alpha" : "운영팀 Alpha",
                        adminPrefix + "/emission/site-management"),
                emissionDataHistoryRow("HIS-2026-0031", "2026-03-24 20:06", "부산 수송 실증", "운송라인 M-02", "system.admin", "CORRECTION",
                        isEn ? "Correction" : "정정", "ACTIVITY_DATA", isEn ? "Activity Data" : "활동자료",
                        isEn ? "Shipment count 14" : "운송 횟수 14회",
                        isEn ? "Shipment count 16" : "운송 횟수 16회",
                        adminPrefix + "/emission/result_list?searchKeyword=부산")
        );
    }

    private List<Map<String, String>> buildEmissionDataHistoryChangeTypeOptions(boolean isEn) {
        return List.of(
                mapOf("value", "", "label", isEn ? "All" : "전체"),
                mapOf("value", "CORRECTION", "label", isEn ? "Correction" : "정정"),
                mapOf("value", "APPROVAL", "label", isEn ? "Approval" : "승인 반영"),
                mapOf("value", "SCHEMA", "label", isEn ? "Schema Sync" : "스키마 동기화"));
    }

    private Map<String, Map<String, String>> buildEmissionDataHistoryChangeTypeMeta(boolean isEn) {
        Map<String, Map<String, String>> meta = new LinkedHashMap<>();
        meta.put("CORRECTION", mapOf(
                "label", isEn ? "Correction" : "정정",
                "badgeClass", "bg-amber-100 text-amber-700"));
        meta.put("APPROVAL", mapOf(
                "label", isEn ? "Approval" : "승인 반영",
                "badgeClass", "bg-emerald-100 text-emerald-700"));
        meta.put("SCHEMA", mapOf(
                "label", isEn ? "Schema Sync" : "스키마 동기화",
                "badgeClass", "bg-indigo-100 text-indigo-700"));
        return meta;
    }

    private List<Map<String, String>> buildEmissionDataHistoryChangeTargetOptions(boolean isEn) {
        return List.of(
                mapOf("value", "", "label", isEn ? "All" : "전체"),
                mapOf("value", "ACTIVITY_DATA", "label", isEn ? "Activity Data" : "활동자료"),
                mapOf("value", "VERIFICATION_STATUS", "label", isEn ? "Verification Status" : "검증 상태"),
                mapOf("value", "RESULT_STATUS", "label", isEn ? "Result Status" : "산정 상태"),
                mapOf("value", "ATTACHMENT", "label", isEn ? "Attachment" : "첨부 문서"),
                mapOf("value", "SITE_METADATA", "label", isEn ? "Site Metadata" : "배출지 메타데이터"),
                mapOf("value", "CALCULATION_FORMULA", "label", isEn ? "Calculation Formula" : "산정식"),
                mapOf("value", "EMISSION_FACTOR", "label", isEn ? "Emission Factor" : "배출계수"),
                mapOf("value", "MONITORING_RULE", "label", isEn ? "Monitoring Rule" : "모니터링 규칙"));
    }

    private Map<String, Map<String, String>> buildEmissionDataHistoryChangeTargetMeta(boolean isEn) {
        Map<String, Map<String, String>> meta = new LinkedHashMap<>();
        meta.put("ACTIVITY_DATA", mapOf(
                "label", isEn ? "Activity Data" : "활동자료",
                "badgeClass", "bg-blue-100 text-blue-700"));
        meta.put("VERIFICATION_STATUS", mapOf(
                "label", isEn ? "Verification Status" : "검증 상태",
                "badgeClass", "bg-emerald-100 text-emerald-700"));
        meta.put("RESULT_STATUS", mapOf(
                "label", isEn ? "Result Status" : "산정 상태",
                "badgeClass", "bg-amber-100 text-amber-700"));
        meta.put("ATTACHMENT", mapOf(
                "label", isEn ? "Attachment" : "첨부 문서",
                "badgeClass", "bg-rose-100 text-rose-700"));
        meta.put("SITE_METADATA", mapOf(
                "label", isEn ? "Site Metadata" : "배출지 메타데이터",
                "badgeClass", "bg-slate-100 text-slate-700"));
        meta.put("CALCULATION_FORMULA", mapOf(
                "label", isEn ? "Calculation Formula" : "산정식",
                "badgeClass", "bg-slate-100 text-slate-700"));
        meta.put("EMISSION_FACTOR", mapOf(
                "label", isEn ? "Emission Factor" : "배출계수",
                "badgeClass", "bg-slate-100 text-slate-700"));
        meta.put("MONITORING_RULE", mapOf(
                "label", isEn ? "Monitoring Rule" : "모니터링 규칙",
                "badgeClass", "bg-slate-100 text-slate-700"));
        return meta;
    }

    private Map<String, String> emissionDataHistoryRow(String historyId,
                                                       String changedAt,
                                                       String projectName,
                                                       String siteName,
                                                       String changedBy,
                                                       String changeTypeCode,
                                                       String changeTypeLabel,
                                                       String changeTargetCode,
                                                       String changeTargetLabel,
                                                       String beforeValue,
                                                       String afterValue,
                                                       String detailUrl) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("historyId", historyId);
        row.put("changedAt", changedAt);
        row.put("projectName", projectName);
        row.put("siteName", siteName);
        row.put("changedBy", changedBy);
        row.put("changeTypeCode", changeTypeCode);
        row.put("changeTypeLabel", changeTypeLabel);
        row.put("changeTargetCode", changeTargetCode);
        row.put("changeTargetLabel", changeTargetLabel);
        row.put("beforeValue", beforeValue);
        row.put("afterValue", afterValue);
        row.put("detailUrl", detailUrl);
        return row;
    }

    private List<Map<String, String>> buildEmissionDataHistorySummaryCards(List<Map<String, String>> rows, boolean isEn) {
        return List.of(
                summaryCard(isEn ? "Filtered History" : "조회 이력 수",
                        String.valueOf(rows.size()),
                        isEn ? "Rows matching the current filter set." : "현재 필터 조건에 맞는 이력 건수입니다.",
                        "text-[var(--kr-gov-blue)]"),
                summaryCard(isEn ? "Corrections" : "정정",
                        String.valueOf(countEmissionHistoryByType(rows, "CORRECTION")),
                        isEn ? "Operator corrections reflected in activity or attached evidence." : "활동자료나 첨부 증빙에 반영된 정정 건수입니다.",
                        "text-amber-600",
                        "bg-amber-50"),
                summaryCard(isEn ? "Approvals" : "승인 반영",
                        String.valueOf(countEmissionHistoryByType(rows, "APPROVAL")),
                        isEn ? "Approval or review state changes reflected in the ledger." : "검토·승인 상태 변경이 반영된 건수입니다.",
                        "text-emerald-600",
                        "bg-emerald-50"),
                summaryCard(isEn ? "Schema Sync" : "스키마 동기화",
                        String.valueOf(countEmissionHistoryByType(rows, "SCHEMA")),
                        isEn ? "Metadata or rule sync updates applied to emission calculation." : "배출 산정에 반영된 메타데이터·규칙 동기화 건수입니다.",
                        "text-indigo-600",
                        "bg-indigo-50"));
    }

    private boolean matchesEmissionHistoryKeyword(Map<String, String> row, String keyword) {
        return safeString(row.get("historyId")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("projectName")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("siteName")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("changedBy")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("beforeValue")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("afterValue")).toLowerCase(Locale.ROOT).contains(keyword);
    }

    private int countEmissionHistoryByType(List<Map<String, String>> rows, String changeTypeCode) {
        return (int) rows.stream()
                .filter(row -> changeTypeCode.equalsIgnoreCase(safeString(row.get("changeTypeCode"))))
                .count();
    }

    private Map<String, String> verificationQueueRow(EmissionResultSummaryView item, String priorityCode, boolean isEn) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("resultId", safeString(item.getResultId()));
        row.put("projectName", safeString(item.getProjectName()));
        row.put("companyName", safeString(item.getCompanyName()));
        row.put("calculatedAt", safeString(item.getCalculatedAt()));
        row.put("totalEmission", safeString(item.getTotalEmission()));
        row.put("resultStatusCode", safeString(item.getResultStatusCode()));
        row.put("resultStatusLabel", safeString(item.getResultStatusLabel()));
        row.put("verificationStatusCode", safeString(item.getVerificationStatusCode()));
        row.put("verificationStatusLabel", safeString(item.getVerificationStatusLabel()));
        row.put("priorityCode", priorityCode);
        row.put("priorityLabel", verificationPriorityLabel(priorityCode, isEn));
        row.put("priorityReason", verificationPriorityReason(priorityCode, item, isEn));
        row.put("assignee", verificationAssignee(priorityCode, isEn));
        row.put("actionLabel", "FAILED".equalsIgnoreCase(safeString(item.getVerificationStatusCode()))
                ? (isEn ? "Re-review" : "재검토")
                : (isEn ? "Open result" : "결과 보기"));
        row.put("detailUrl", safeString(item.getDetailUrl()));
        return row;
    }

    private String deriveVerificationPriorityCode(EmissionResultSummaryView item) {
        String verificationCode = safeString(item.getVerificationStatusCode()).toUpperCase(Locale.ROOT);
        String resultCode = safeString(item.getResultStatusCode()).toUpperCase(Locale.ROOT);
        if ("FAILED".equals(verificationCode) || "REVIEW".equals(resultCode)) {
            return "HIGH";
        }
        if ("IN_PROGRESS".equals(verificationCode)) {
            return "MEDIUM";
        }
        return "NORMAL";
    }

    private String verificationPriorityLabel(String priorityCode, boolean isEn) {
        switch (safeString(priorityCode).toUpperCase(Locale.ROOT)) {
            case "HIGH":
                return isEn ? "High" : "높음";
            case "MEDIUM":
                return isEn ? "Medium" : "중간";
            default:
                return isEn ? "Normal" : "일반";
        }
    }

    private String verificationPriorityReason(String priorityCode, EmissionResultSummaryView item, boolean isEn) {
        String verificationCode = safeString(item.getVerificationStatusCode()).toUpperCase(Locale.ROOT);
        if ("FAILED".equals(verificationCode)) {
            return isEn ? "Failed verification or missing evidence requires escalation." : "검증 반려 또는 증빙 누락으로 상향 검토가 필요합니다.";
        }
        if ("IN_PROGRESS".equals(verificationCode)) {
            return isEn ? "Verifier review is underway and should be monitored." : "검증 담당자가 검토 중이므로 진행 상황을 추적해야 합니다.";
        }
        return isEn ? "Ready to assign a verifier and evidence checklist." : "검증 담당자와 증빙 체크리스트를 배정할 준비 상태입니다.";
    }

    private String verificationAssignee(String priorityCode, boolean isEn) {
        switch (safeString(priorityCode).toUpperCase(Locale.ROOT)) {
            case "HIGH":
                return isEn ? "Lead verifier" : "수석 검증자";
            case "MEDIUM":
                return isEn ? "Assigned verifier" : "담당 검증자";
            default:
                return isEn ? "Verification queue" : "검증 대기열";
        }
    }

    private Map<String, String> verificationLegendRow(String label, String description, String code) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("description", description);
        row.put("code", code);
        return row;
    }

    private Map<String, String> verificationPolicyRow(String title, String description) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("description", description);
        return row;
    }

    private Map<String, String> backupProfileRow(String profileId, String profileName, String scheduledAt, String frequency, String retention, String status) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("profileId", profileId);
        row.put("profileName", profileName);
        row.put("scheduledAt", scheduledAt);
        row.put("frequency", frequency);
        row.put("retention", retention);
        row.put("status", status);
        return row;
    }

    private Map<String, String> backupStorageRow(String storageType, String location, String owner, String note) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("storageType", storageType);
        row.put("location", location);
        row.put("owner", owner);
        row.put("note", note);
        return row;
    }

    private Map<String, String> backupExecutionRow(String executedAt, String profileName, String result, String duration, String note) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("executedAt", executedAt);
        row.put("profileName", profileName);
        row.put("result", result);
        row.put("duration", duration);
        row.put("note", note);
        return row;
    }

    private Map<String, String> playbookRow(String title, String body) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("body", body);
        return row;
    }

    private String urlQueryValue(String value) {
        if (value == null) {
            return "";
        }
        return value.replace(" ", "+");
    }

    private List<Map<String, String>> buildAdminHomeSummaryCards(boolean isEn) {
        List<Map<String, String>> monitoringCards = adminSummaryService.getSecurityMonitoringCards(isEn);
        List<Map<String, String>> schedulerCards = adminSummaryService.getSchedulerSummary(isEn);
        List<Map<String, String>> blocklistCards = adminSummaryService.getBlocklistSummary(isEn);
        return List.of(
                homeSummaryCard(
                        safeCardValue(monitoringCards, 0, "title", isEn ? "Current RPS" : "현재 RPS"),
                        safeCardValue(monitoringCards, 0, "value", "0"),
                        safeCardValue(monitoringCards, 0, "description", ""),
                        "monitoring",
                        "text-[var(--kr-gov-green)]",
                        "border-l-[var(--kr-gov-green)]"),
                homeSummaryCard(
                        safeCardValue(schedulerCards, 2, "title", isEn ? "Failed Today" : "오늘 실패"),
                        safeCardValue(schedulerCards, 2, "value", "0"),
                        safeCardValue(schedulerCards, 2, "description", ""),
                        "schedule",
                        "text-orange-400",
                        "border-l-orange-400"),
                homeSummaryCard(
                        safeCardValue(blocklistCards, 0, "title", isEn ? "Active Blocks" : "활성 차단"),
                        safeCardValue(blocklistCards, 0, "value", "0"),
                        safeCardValue(blocklistCards, 0, "description", ""),
                        "gpp_bad",
                        "text-[var(--kr-gov-blue)]",
                        "border-l-[var(--kr-gov-blue)]"));
    }

    private List<Map<String, String>> buildAdminHomeReviewQueueRows(List<EmissionResultSummaryView> items, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (items != null) {
            for (EmissionResultSummaryView item : items) {
                if (item == null) {
                    continue;
                }
                if (!"REVIEW".equals(safeString(item.getResultStatusCode()))) {
                    continue;
                }
                rows.add(mapOf(
                        "title", safeString(item.getProjectName()),
                        "type", safeString(item.getCompanyName()),
                        "appliedOn", safeString(item.getCalculatedAt()),
                        "detailUrl", safeString(item.getDetailUrl()),
                        "statusLabel", safeString(item.getVerificationStatusLabel())));
                if (rows.size() >= 3) {
                    break;
                }
            }
        }
        if (!rows.isEmpty()) {
            return rows;
        }
        return List.of(
                mapOf(
                        "title", isEn ? "Blue Hydrogen Process Review" : "블루수소 공정 검토",
                        "type", isEn ? "Hanbit Energy" : "한빛에너지",
                        "appliedOn", "2026-03-03",
                        "detailUrl", buildAdminPath(isEn, "/emission/result_list?resultStatus=REVIEW"),
                        "statusLabel", isEn ? "Pending" : "검증 대기"),
                mapOf(
                        "title", isEn ? "Methanol Conversion Project" : "메탄올 전환 프로젝트",
                        "type", isEn ? "Daehan Synthesis" : "대한신소재",
                        "appliedOn", "2026-02-24",
                        "detailUrl", buildAdminPath(isEn, "/emission/result_list?resultStatus=REVIEW"),
                        "statusLabel", isEn ? "Pending" : "검증 대기"));
    }

    private List<Map<String, String>> buildAdminHomeReviewProgressRows(List<EmissionResultSummaryView> items, boolean isEn) {
        int draftCount = 0;
        int reviewCount = 0;
        int completedCount = 0;
        int verifiedCount = 0;
        int totalCount = 0;
        if (items != null) {
            for (EmissionResultSummaryView item : items) {
                if (item == null) {
                    continue;
                }
                totalCount++;
                String resultStatus = safeString(item.getResultStatusCode());
                String verificationStatus = safeString(item.getVerificationStatusCode());
                if ("DRAFT".equals(resultStatus)) {
                    draftCount++;
                }
                if ("REVIEW".equals(resultStatus)) {
                    reviewCount++;
                }
                if ("COMPLETED".equals(resultStatus)) {
                    completedCount++;
                }
                if ("VERIFIED".equals(verificationStatus)) {
                    verifiedCount++;
                }
            }
        }
        int normalizedTotal = Math.max(totalCount, 1);
        return List.of(
                homeProgressRow(isEn ? "Draft" : "임시 저장", draftCount, normalizedTotal, "bg-slate-400"),
                homeProgressRow(isEn ? "Under Review" : "검토 중", reviewCount, normalizedTotal, "bg-blue-500"),
                homeProgressRow(isEn ? "Completed" : "산정 완료", completedCount, normalizedTotal, "bg-emerald-500"),
                homeProgressRow(isEn ? "Verified" : "검증 완료", verifiedCount, normalizedTotal, "bg-[var(--kr-gov-green)]"));
    }

    private List<Map<String, String>> buildAdminHomeOperationalStatusRows(boolean isEn) {
        List<Map<String, String>> policyCards = adminSummaryService.getSecurityPolicySummary(isEn);
        List<Map<String, String>> whitelistCards = adminSummaryService.getIpWhitelistSummary(isEn);
        List<Map<String, String>> blocklistCards = adminSummaryService.getBlocklistSummary(isEn);
        return List.of(
                homeOperationalStatusRow(
                        "policy",
                        isEn ? "Security Policy Engine" : "보안 정책 엔진",
                        safeCardValue(policyCards, 0, "value", "0") + " " + safeCardValue(policyCards, 0, "title", ""),
                        "HEALTHY"),
                homeOperationalStatusRow(
                        "verified_user",
                        isEn ? "IP Allowlist Guard" : "IP 허용목록 가드",
                        safeCardValue(whitelistCards, 0, "value", "0") + " " + safeCardValue(whitelistCards, 0, "title", ""),
                        "HEALTHY"),
                homeOperationalStatusRow(
                        "shield_locked",
                        isEn ? "Threat Block Queue" : "위협 차단 큐",
                        safeCardValue(blocklistCards, 0, "value", "0") + " " + safeCardValue(blocklistCards, 0, "title", ""),
                        "WARNING"));
    }

    private List<Map<String, String>> buildAdminHomeSystemLogs(SecurityAuditSnapshot auditSnapshot, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        if (auditSnapshot != null && auditSnapshot.getAuditLogs() != null) {
            adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn).stream()
                    .limit(3)
                    .forEach(item -> rows.add(mapOf(
                            "level", safeString(item.get("action")).contains(isEn ? "Blocked" : "차단") ? "WARNING" : "INFO",
                            "message", safeString(item.get("detail")),
                            "timestamp", safeString(item.get("auditAt")))));
        }
        if (!rows.isEmpty()) {
            return rows;
        }
        return List.of(
                mapOf("level", "INFO",
                        "message", isEn ? "Admin home summary snapshot loaded successfully." : "관리자 홈 요약 스냅샷을 정상적으로 불러왔습니다.",
                        "timestamp", "2026-03-18 09:00"),
                mapOf("level", "WARNING",
                        "message", isEn ? "No recent security audit events were found." : "최근 보안 감사 이벤트가 없어 기본 로그를 사용 중입니다.",
                        "timestamp", "2026-03-18 08:58"));
    }

    private Map<String, String> homeSummaryCard(
            String title,
            String value,
            String description,
            String icon,
            String iconClass,
            String borderClass) {
        return mapOf(
                "title", title,
                "value", value,
                "description", description,
                "icon", icon,
                "iconClass", iconClass,
                "borderClass", borderClass);
    }

    private Map<String, String> homeProgressRow(String label, int value, int total, String barClass) {
        int width = Math.max(8, (int) Math.round((value * 100.0d) / Math.max(total, 1)));
        return mapOf(
                "label", label,
                "value", String.valueOf(value),
                "width", width + "%",
                "barClass", barClass);
    }

    private Map<String, String> homeOperationalStatusRow(String icon, String label, String meta, String status) {
        return mapOf(
                "icon", icon,
                "label", label,
                "meta", meta,
                "status", status);
    }

    private String safeCardValue(List<Map<String, String>> cards, int index, String key, String defaultValue) {
        if (cards == null || index < 0 || index >= cards.size() || cards.get(index) == null) {
            return defaultValue;
        }
        return safeString(cards.get(index).get(key)).isEmpty() ? defaultValue : safeString(cards.get(index).get(key));
    }

    private String buildAdminPath(boolean isEn, String path) {
        return isEn ? "/en/admin" + path : "/admin" + path;
    }

    private List<Map<String, String>> buildSecurityPolicyRows(boolean isEn) {
        return List.of(
                mapOf(
                        "policyId", "POL-001",
                        "targetUrl", "/signin/actionLogin",
                        "policyName", isEn ? "User login protection" : "사용자 로그인 보호",
                        "threshold", isEn ? "30 req/min per IP" : "IP당 분당 30회",
                        "burst", isEn ? "5 req / 10 sec" : "10초 5회 burst",
                        "action", isEn ? "Captcha -> 10 min block" : "CAPTCHA -> 10분 차단",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-12 08:20"),
                mapOf(
                        "policyId", "POL-002",
                        "targetUrl", "/admin/login/actionLogin",
                        "policyName", isEn ? "Admin login hardening" : "관리자 로그인 강화",
                        "threshold", isEn ? "10 req/min per IP" : "IP당 분당 10회",
                        "burst", isEn ? "3 req / 10 sec" : "10초 3회 burst",
                        "action", isEn ? "Immediate 30 min block" : "즉시 30분 차단",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-12 08:25"),
                mapOf(
                        "policyId", "POL-003",
                        "targetUrl", "/api/search/**",
                        "policyName", isEn ? "Search API throttle" : "검색 API 제어",
                        "threshold", isEn ? "120 req/min per token" : "토큰당 분당 120회",
                        "burst", isEn ? "20 req / 10 sec" : "10초 20회 burst",
                        "action", isEn ? "429 + alert" : "429 + 알림",
                        "status", "ACTIVE",
                        "updatedAt", "2026-03-11 18:10"));
    }

    private List<Map<String, String>> buildSecurityPolicyPlaybooks(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Login attack playbook" : "로그인 공격 플레이북",
                        "body", isEn ? "Raise admin login threshold only after verifying WAF and captcha counters." : "WAF 및 CAPTCHA 지표 확인 후에만 관리자 로그인 임계치를 상향합니다."),
                mapOf("title", isEn ? "Search API degradation" : "검색 API 완화 전략",
                        "body", isEn ? "If 429 spikes persist for over 10 minutes, shift to token-based limits and cache prebuilt queries." : "429 급증이 10분 이상 지속되면 토큰 기준 제한과 캐시 응답으로 전환합니다."),
                mapOf("title", isEn ? "Emergency block release" : "긴급 차단 해제",
                        "body", isEn ? "Release only after verifying owner, CIDR, expiry time, and related gateway policy." : "소유 조직, CIDR, 만료 시각, 게이트웨이 정책 연동을 모두 확인한 뒤 해제합니다."));
    }

    private List<Map<String, String>> buildSecurityMonitoringTargets(boolean isEn) {
        return List.of(
                mapOf("url", "/admin/login/actionLogin", "rps", "88", "status", isEn ? "Escalated" : "경계", "rule", isEn ? "Admin login hardening" : "관리자 로그인 강화"),
                mapOf("url", "/signin/actionLogin", "rps", "240", "status", isEn ? "Protected" : "방어중", "rule", isEn ? "User login protection" : "사용자 로그인 보호"),
                mapOf("url", "/api/search/carbon-footprint", "rps", "510", "status", isEn ? "Throttled" : "제한중", "rule", isEn ? "Search API throttle" : "검색 API 제어"));
    }

    private List<Map<String, String>> buildSecurityMonitoringIps(boolean isEn) {
        return List.of(
                mapOf("ip", "198.51.100.42", "country", "US", "requestCount", "4,120", "action", isEn ? "Temp blocked" : "임시차단"),
                mapOf("ip", "203.0.113.78", "country", "KR", "requestCount", "2,844", "action", isEn ? "Captcha enforced" : "CAPTCHA 전환"),
                mapOf("ip", "45.67.22.91", "country", "DE", "requestCount", "2,337", "action", isEn ? "429 only" : "429 응답"));
    }

    private List<Map<String, String>> buildSecurityMonitoringEvents(boolean isEn) {
        return List.of(
                mapOf("detectedAt", "2026-03-12 09:18", "title", isEn ? "Burst login attack detected" : "로그인 버스트 공격 감지", "detail", isEn ? "Admin login burst exceeded threshold from 3 IPs." : "3개 IP에서 관리자 로그인 burst 임계치 초과", "severity", "HIGH"),
                mapOf("detectedAt", "2026-03-12 09:12", "title", isEn ? "Search API abuse pattern" : "검색 API 남용 패턴", "detail", isEn ? "Single token generated 429 for 6 consecutive minutes." : "단일 토큰에서 6분 연속 429 다발", "severity", "MEDIUM"));
    }

    private List<Map<String, String>> buildSchedulerJobRows(boolean isEn) {
        return List.of(
                mapOf("jobId", "SCH-001", "jobName", isEn ? "Nightly emissions aggregation" : "야간 배출량 집계",
                        "cronExpression", "0 0 2 * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "ACTIVE", "lastRunAt", "2026-03-13 02:00", "nextRunAt", "2026-03-14 02:00",
                        "owner", isEn ? "Emissions Ops" : "배출 운영팀"),
                mapOf("jobId", "SCH-002", "jobName", isEn ? "Certificate expiry sync" : "인증서 만료 동기화",
                        "cronExpression", "0 */30 * * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "ACTIVE", "lastRunAt", "2026-03-13 11:30", "nextRunAt", "2026-03-13 12:00",
                        "owner", isEn ? "Certificate Admin" : "인증 운영자"),
                mapOf("jobId", "SCH-003", "jobName", isEn ? "External API token refresh" : "외부연계 토큰 갱신",
                        "cronExpression", "0 0/10 * * * ?", "executionTypeCode", "CRON", "executionType", isEn ? "CRON" : "정기",
                        "jobStatus", "PAUSED", "lastRunAt", "2026-03-13 10:40", "nextRunAt", "-",
                        "owner", isEn ? "Integration Team" : "외부연계팀"),
                mapOf("jobId", "SCH-004", "jobName", isEn ? "Manual backfill for trade settlement" : "거래 정산 수동 보정",
                        "cronExpression", "-", "executionTypeCode", "MANUAL", "executionType", isEn ? "MANUAL" : "수동",
                        "jobStatus", "REVIEW", "lastRunAt", "2026-03-12 18:10",
                        "nextRunAt", isEn ? "On request" : "요청 시 실행", "owner", isEn ? "Settlement Ops" : "정산 운영팀"));
    }

    private List<Map<String, String>> buildSchedulerNodeRows(boolean isEn) {
        return List.of(
                mapOf("nodeId", "batch-node-01", "role", isEn ? "Primary scheduler" : "주 스케줄러", "status", "HEALTHY", "runningJobs", "5", "heartbeatAt", "2026-03-13 11:46:11"),
                mapOf("nodeId", "batch-node-02", "role", isEn ? "Failover worker" : "대기 워커", "status", "STANDBY", "runningJobs", "0", "heartbeatAt", "2026-03-13 11:46:04"),
                mapOf("nodeId", "batch-node-03", "role", isEn ? "Settlement queue worker" : "정산 큐 워커", "status", "DEGRADED", "runningJobs", "2", "heartbeatAt", "2026-03-13 11:45:31"));
    }

    private List<Map<String, String>> buildSchedulerExecutionRows(boolean isEn) {
        return List.of(
                mapOf("executedAt", "2026-03-13 11:30", "jobId", "SCH-002", "result", "SUCCESS", "duration", "18s", "message", isEn ? "Certificate expiration cache synchronized." : "인증서 만료 캐시 동기화 완료"),
                mapOf("executedAt", "2026-03-13 11:10", "jobId", "SCH-003", "result", "FAILED", "duration", "47s", "message", isEn ? "Token endpoint timeout. Retry queued." : "토큰 엔드포인트 타임아웃, 재시도 대기"),
                mapOf("executedAt", "2026-03-13 10:00", "jobId", "SCH-001", "result", "SUCCESS", "duration", "3m 12s", "message", isEn ? "1,284 aggregation rows persisted." : "집계 1,284건 적재 완료"),
                mapOf("executedAt", "2026-03-12 18:10", "jobId", "SCH-004", "result", "REVIEW", "duration", "9m 05s", "message", isEn ? "Manual backfill requires settlement approval." : "수동 보정 후 정산 승인 필요"));
    }

    private List<Map<String, String>> buildSchedulerPlaybooks(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Cron expression review" : "Cron 표현식 점검",
                        "body", isEn ? "Validate time zone, duplicate trigger windows, and collision with settlement cut-off times before enabling a new job."
                                : "신규 잡 활성화 전 시간대, 중복 실행 구간, 정산 마감 시간과의 충돌 여부를 점검합니다."),
                mapOf("title", isEn ? "Failure response" : "실패 대응",
                        "body", isEn ? "Failed jobs should record retry policy, root cause, and linked operator before rerun approval."
                                : "실패 잡은 재시도 정책, 원인, 담당 운영자를 기록한 뒤 재실행 승인 절차를 거칩니다."),
                mapOf("title", isEn ? "Manual execution guardrail" : "수동 실행 가드레일",
                        "body", isEn ? "High-impact jobs such as trade settlement or certificate re-issuance should require a dual review and an execution reason."
                                : "거래 정산, 인증서 재발급처럼 영향이 큰 잡은 이중 검토와 실행 사유 기록을 요구합니다."));
    }

    private List<Map<String, String>> buildCertificateAuditLogRows(boolean isEn) {
        return List.of(
                mapOf(
                        "auditAt", "2026-03-30 14:25",
                        "requestId", "CERT-20260330-014",
                        "certificateNo", "KC-2026-44821",
                        "companyName", "한강에너지",
                        "companyId", "INSTT-110045",
                        "applicantName", "김지훈",
                        "applicantId", "jihun.kim",
                        "approverName", "박서연",
                        "auditType", isEn ? "Reissue after revocation" : "폐기 후 재발급",
                        "auditTypeCode", "REISSUE",
                        "certificateType", isEn ? "Emission certificate" : "배출 인증서",
                        "certificateTypeCode", "EMISSION",
                        "status", isEn ? "Approved" : "승인",
                        "statusCode", "APPROVED",
                        "riskLevel", isEn ? "High" : "높음",
                        "riskLevelCode", "HIGH",
                        "reason", isEn ? "Previous token was revoked after signer rotation." : "서명자 변경으로 기존 토큰 폐기 후 재발급"),
                mapOf(
                        "auditAt", "2026-03-30 10:40",
                        "requestId", "CERT-20260330-011",
                        "certificateNo", "KFTC-2026-99120",
                        "companyName", "그린포인트",
                        "companyId", "INSTT-220031",
                        "applicantName", "이수민",
                        "applicantId", "sumin.lee",
                        "approverName", "오승민",
                        "auditType", isEn ? "Issuance" : "신규 발급",
                        "auditTypeCode", "ISSUE",
                        "certificateType", isEn ? "Joint certificate" : "공동인증서",
                        "certificateTypeCode", "JOINT",
                        "status", isEn ? "Pending review" : "검토 대기",
                        "statusCode", "PENDING",
                        "riskLevel", isEn ? "Medium" : "보통",
                        "riskLevelCode", "MEDIUM",
                        "reason", isEn ? "Awaiting evidence file cross-check." : "증빙 파일 교차 점검 대기"),
                mapOf(
                        "auditAt", "2026-03-29 17:15",
                        "requestId", "CERT-20260329-027",
                        "certificateNo", "CC-2026-10294",
                        "companyName", "서해화학",
                        "companyId", "INSTT-130882",
                        "applicantName", "최민재",
                        "applicantId", "minjae.choi",
                        "approverName", "정해린",
                        "auditType", isEn ? "Renewal" : "갱신",
                        "auditTypeCode", "RENEW",
                        "certificateType", isEn ? "Cloud certificate" : "클라우드 인증서",
                        "certificateTypeCode", "CLOUD",
                        "status", isEn ? "Approved" : "승인",
                        "statusCode", "APPROVED",
                        "riskLevel", isEn ? "Low" : "낮음",
                        "riskLevelCode", "LOW",
                        "reason", isEn ? "Validity period extended after annual review." : "연간 점검 후 유효기간 연장"),
                mapOf(
                        "auditAt", "2026-03-29 11:08",
                        "requestId", "CERT-20260329-016",
                        "certificateNo", "KC-2026-44702",
                        "companyName", "동남스틸",
                        "companyId", "INSTT-140440",
                        "applicantName", "정가은",
                        "applicantId", "gaeun.jeong",
                        "approverName", "박서연",
                        "auditType", isEn ? "Revocation" : "폐기",
                        "auditTypeCode", "REVOKE",
                        "certificateType", isEn ? "Emission certificate" : "배출 인증서",
                        "certificateTypeCode", "EMISSION",
                        "status", isEn ? "Approved" : "승인",
                        "statusCode", "APPROVED",
                        "riskLevel", isEn ? "Medium" : "보통",
                        "riskLevelCode", "MEDIUM",
                        "reason", isEn ? "Compromised browser environment reported by the company." : "회원사 측 브라우저 환경 이상 신고"),
                mapOf(
                        "auditAt", "2026-03-28 18:44",
                        "requestId", "CERT-20260328-031",
                        "certificateNo", "JC-2026-55200",
                        "companyName", "한빛물산",
                        "companyId", "INSTT-180122",
                        "applicantName", "오하늘",
                        "applicantId", "haneul.oh",
                        "approverName", "오승민",
                        "auditType", isEn ? "Issuance" : "신규 발급",
                        "auditTypeCode", "ISSUE",
                        "certificateType", isEn ? "Joint certificate" : "공동인증서",
                        "certificateTypeCode", "JOINT",
                        "status", isEn ? "Rejected" : "반려",
                        "statusCode", "REJECTED",
                        "riskLevel", isEn ? "High" : "높음",
                        "riskLevelCode", "HIGH",
                        "reason", isEn ? "Registrant identity did not match the authority mapping." : "신청자 정보가 권한 맵핑과 불일치"),
                mapOf(
                        "auditAt", "2026-03-28 09:12",
                        "requestId", "CERT-20260328-007",
                        "certificateNo", "CC-2026-10210",
                        "companyName", "미래에코",
                        "companyId", "INSTT-200301",
                        "applicantName", "권도현",
                        "applicantId", "dohyun.kwon",
                        "approverName", "정해린",
                        "auditType", isEn ? "Renewal" : "갱신",
                        "auditTypeCode", "RENEW",
                        "certificateType", isEn ? "Cloud certificate" : "클라우드 인증서",
                        "certificateTypeCode", "CLOUD",
                        "status", isEn ? "Pending review" : "검토 대기",
                        "statusCode", "PENDING",
                        "riskLevel", isEn ? "Low" : "낮음",
                        "riskLevelCode", "LOW",
                        "reason", isEn ? "Auto-renewal scheduled after billing verification." : "정산 확인 후 자동 갱신 예정"),
                mapOf(
                        "auditAt", "2026-03-27 16:22",
                        "requestId", "CERT-20260327-022",
                        "certificateNo", "KC-2026-44651",
                        "companyName", "남부환경",
                        "companyId", "INSTT-170930",
                        "applicantName", "문서윤",
                        "applicantId", "seoyun.moon",
                        "approverName", "박서연",
                        "auditType", isEn ? "Reissue after department transfer" : "부서 이동 후 재발급",
                        "auditTypeCode", "REISSUE",
                        "certificateType", isEn ? "Emission certificate" : "배출 인증서",
                        "certificateTypeCode", "EMISSION",
                        "status", isEn ? "Approved" : "승인",
                        "statusCode", "APPROVED",
                        "riskLevel", isEn ? "Medium" : "보통",
                        "riskLevelCode", "MEDIUM",
                        "reason", isEn ? "Role transfer approved by both department managers." : "양 부서 관리자 승인 후 권한 이전"),
                mapOf(
                        "auditAt", "2026-03-26 13:05",
                        "requestId", "CERT-20260326-015",
                        "certificateNo", "JC-2026-55084",
                        "companyName", "북항리소스",
                        "companyId", "INSTT-190511",
                        "applicantName", "신유진",
                        "applicantId", "yujin.shin",
                        "approverName", "오승민",
                        "auditType", isEn ? "Revocation" : "폐기",
                        "auditTypeCode", "REVOKE",
                        "certificateType", isEn ? "Joint certificate" : "공동인증서",
                        "certificateTypeCode", "JOINT",
                        "status", isEn ? "Rejected" : "반려",
                        "statusCode", "REJECTED",
                        "riskLevel", isEn ? "High" : "높음",
                        "riskLevelCode", "HIGH",
                        "reason", isEn ? "Emergency revocation requested without incident ticket." : "장애 티켓 없이 긴급 폐기 요청 접수"));
    }

    private List<Map<String, String>> buildCertificateAuditAlerts(List<Map<String, String>> rows, boolean isEn) {
        List<Map<String, String>> alerts = new ArrayList<>();
        long pendingHighRiskCount = rows.stream()
                .filter(row -> "PENDING".equals(safeString(row.get("statusCode"))))
                .filter(row -> "HIGH".equals(safeString(row.get("riskLevelCode"))))
                .count();
        if (pendingHighRiskCount > 0) {
            alerts.add(mapOf(
                    "title", isEn ? "High-risk requests still pending" : "고위험 요청이 아직 대기 중입니다",
                    "body", isEn ? "High-risk reissue or revocation requests should be closed with dual review before shift handoff."
                            : "고위험 재발급/폐기 요청은 근무 교대 전 이중 검토로 종결해야 합니다.",
                    "tone", "danger"));
        }
        long rejectedCount = rows.stream().filter(row -> "REJECTED".equals(safeString(row.get("statusCode")))).count();
        if (rejectedCount > 0) {
            alerts.add(mapOf(
                    "title", isEn ? "Rejected requests need follow-up" : "반려 건에 대한 후속 조치가 필요합니다",
                    "body", isEn ? "Check that the rejection reason was sent back to the applicant and the evidence gap is documented."
                            : "반려 사유가 신청자에게 전달되었는지, 증빙 보완 항목이 기록되었는지 확인하세요.",
                    "tone", "warning"));
        }
        if (alerts.isEmpty()) {
            alerts.add(mapOf(
                    "title", isEn ? "No immediate escalation" : "즉시 에스컬레이션 대상 없음",
                    "body", isEn ? "Current certificate audit events are within the standard review window."
                            : "현재 인증서 감사 이벤트는 표준 검토 시간 안에서 처리되고 있습니다.",
                    "tone", "neutral"));
        }
        return alerts;
    }

    private List<Map<String, String>> buildTradeStatisticsMonthlyRowsLegacyB(boolean isEn) {
        return List.of(
                mapOf("monthLabel", isEn ? "Apr" : "04월", "tradeVolume", "118000", "settlementAmount", "428000000", "pendingCount", "12", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "May" : "05월", "tradeVolume", "126500", "settlementAmount", "451000000", "pendingCount", "11", "exceptionCount", "2"),
                mapOf("monthLabel", isEn ? "Jun" : "06월", "tradeVolume", "132800", "settlementAmount", "469000000", "pendingCount", "13", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Jul" : "07월", "tradeVolume", "141400", "settlementAmount", "495000000", "pendingCount", "9", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Aug" : "08월", "tradeVolume", "149600", "settlementAmount", "522000000", "pendingCount", "10", "exceptionCount", "2"),
                mapOf("monthLabel", isEn ? "Sep" : "09월", "tradeVolume", "156200", "settlementAmount", "548000000", "pendingCount", "8", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Oct" : "10월", "tradeVolume", "164300", "settlementAmount", "573000000", "pendingCount", "9", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Nov" : "11월", "tradeVolume", "171900", "settlementAmount", "598000000", "pendingCount", "7", "exceptionCount", "2"),
                mapOf("monthLabel", isEn ? "Dec" : "12월", "tradeVolume", "180500", "settlementAmount", "624000000", "pendingCount", "8", "exceptionCount", "3"),
                mapOf("monthLabel", isEn ? "Jan" : "01월", "tradeVolume", "174200", "settlementAmount", "601000000", "pendingCount", "10", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Feb" : "02월", "tradeVolume", "169800", "settlementAmount", "589000000", "pendingCount", "9", "exceptionCount", "4"),
                mapOf("monthLabel", isEn ? "Mar" : "03월", "tradeVolume", "182400", "settlementAmount", "642000000", "pendingCount", "11", "exceptionCount", "5"));
    }

    private List<Map<String, String>> buildTradeStatisticsTypeRowsLegacyB(boolean isEn) {
        return List.of(
                mapOf("tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "requestCount", "248", "completedCount", "201", "pendingCount", "18", "exceptionCount", "6", "avgSettlementDays", "2.7", "shareRate", "38.6"),
                mapOf("tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "requestCount", "214", "completedCount", "171", "pendingCount", "16", "exceptionCount", "5", "avgSettlementDays", "2.3", "shareRate", "33.3"),
                mapOf("tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "requestCount", "136", "completedCount", "103", "pendingCount", "12", "exceptionCount", "7", "avgSettlementDays", "3.1", "shareRate", "21.2"),
                mapOf("tradeTypeCode", "MIXED", "tradeTypeLabel", isEn ? "Mixed Settlement" : "혼합 정산", "requestCount", "44", "completedCount", "29", "pendingCount", "6", "exceptionCount", "3", "avgSettlementDays", "3.8", "shareRate", "6.9"));
    }

    private List<Map<String, String>> buildTradeStatisticsInstitutionRowsLegacyB(boolean isEn) {
        return List.of(
                mapOf("insttId", "INST-T001", "insttName", isEn ? "Hanul Steel" : "한울제철", "counterpartyName", isEn ? "Blue Energy" : "블루에너지", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "primaryContractName", isEn ? "Quarterly offset bundle" : "분기 상쇄 배치", "settlementStatusCode", "PENDING", "requestCount", "58", "tradeVolume", "41200", "settlementAmount", "148000000", "pendingCount", "6", "exceptionCount", "1", "completedCount", "49", "avgSettlementDays", "2.4", "lastSettledAt", "2026-03-29 17:10", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Hanul")),
                mapOf("insttId", "INST-T002", "insttName", isEn ? "Green Grid" : "그린그리드", "counterpartyName", isEn ? "Seoul Mobility" : "서울모빌리티", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "primaryContractName", isEn ? "Scope 2 hedge" : "Scope 2 헤지", "settlementStatusCode", "IN_PROGRESS", "requestCount", "61", "tradeVolume", "36800", "settlementAmount", "132000000", "pendingCount", "4", "exceptionCount", "1", "completedCount", "52", "avgSettlementDays", "2.1", "lastSettledAt", "2026-03-29 15:42", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Green")),
                mapOf("insttId", "INST-T003", "insttName", isEn ? "Eco Farm" : "에코팜", "counterpartyName", isEn ? "Carbon Labs" : "카본랩스", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "primaryContractName", isEn ? "Biochar contract" : "바이오차 계약", "settlementStatusCode", "EXCEPTION", "requestCount", "37", "tradeVolume", "21400", "settlementAmount", "78000000", "pendingCount", "5", "exceptionCount", "3", "completedCount", "26", "avgSettlementDays", "3.4", "lastSettledAt", "2026-03-27 10:18", "detailUrl", buildAdminPath(isEn, "/trade/duplicate?searchKeyword=Eco")),
                mapOf("insttId", "INST-T004", "insttName", isEn ? "East Port" : "이스트포트", "counterpartyName", isEn ? "River Cement" : "리버시멘트", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "primaryContractName", isEn ? "March balancing lot" : "3월 밸런싱 물량", "settlementStatusCode", "DONE", "requestCount", "44", "tradeVolume", "29800", "settlementAmount", "121000000", "pendingCount", "1", "exceptionCount", "0", "completedCount", "41", "avgSettlementDays", "2.0", "lastSettledAt", "2026-03-30 09:05", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=East")),
                mapOf("insttId", "INST-T005", "insttName", isEn ? "Sun Network" : "선네트워크", "counterpartyName", isEn ? "Urban Data" : "어반데이터", "tradeTypeCode", "REC", "tradeTypeLabel", isEn ? "REC Package" : "REC 패키지", "primaryContractName", isEn ? "Data center reserve" : "데이터센터 예비물량", "settlementStatusCode", "PENDING", "requestCount", "33", "tradeVolume", "18500", "settlementAmount", "64000000", "pendingCount", "4", "exceptionCount", "1", "completedCount", "26", "avgSettlementDays", "2.8", "lastSettledAt", "2026-03-26 14:28", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Sun")),
                mapOf("insttId", "INST-T006", "insttName", isEn ? "CCUS Plant A" : "CCUS 플랜트 A", "counterpartyName", isEn ? "Metro Heat" : "메트로히트", "tradeTypeCode", "VOLUNTARY", "tradeTypeLabel", isEn ? "Voluntary Credit" : "자발적 감축실적", "primaryContractName", isEn ? "Capture storage block" : "포집 저장 블록", "settlementStatusCode", "IN_PROGRESS", "requestCount", "29", "tradeVolume", "16900", "settlementAmount", "59000000", "pendingCount", "3", "exceptionCount", "0", "completedCount", "24", "avgSettlementDays", "2.6", "lastSettledAt", "2026-03-28 18:04", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=CCUS")),
                mapOf("insttId", "INST-T007", "insttName", isEn ? "Nova Chemical" : "노바케미칼", "counterpartyName", isEn ? "Blue Energy" : "블루에너지", "tradeTypeCode", "KETS", "tradeTypeLabel", isEn ? "K-ETS Credit" : "배출권", "primaryContractName", isEn ? "Seasonal hedge" : "계절성 헤지", "settlementStatusCode", "PENDING", "requestCount", "31", "tradeVolume", "19200", "settlementAmount", "71000000", "pendingCount", "3", "exceptionCount", "1", "completedCount", "25", "avgSettlementDays", "2.9", "lastSettledAt", "2026-03-25 16:11", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=Nova")),
                mapOf("insttId", "INST-T008", "insttName", isEn ? "Forest Link" : "포레스트링크", "counterpartyName", isEn ? "Green Grid" : "그린그리드", "tradeTypeCode", "MIXED", "tradeTypeLabel", isEn ? "Mixed Settlement" : "혼합 정산", "primaryContractName", isEn ? "Afforestation offset" : "조림 상쇄 거래", "settlementStatusCode", "EXCEPTION", "requestCount", "18", "tradeVolume", "8600", "settlementAmount", "29000000", "pendingCount", "2", "exceptionCount", "2", "completedCount", "11", "avgSettlementDays", "4.0", "lastSettledAt", "2026-03-24 11:39", "detailUrl", buildAdminPath(isEn, "/trade/duplicate?searchKeyword=Forest")));
    }

    private List<Map<String, String>> buildTradeStatisticsAlertRowsLegacyB(boolean isEn) {
        return List.of(
                mapOf("title", isEn ? "Pending settlement backlog is rising" : "정산 대기 백로그 증가",
                        "description", isEn ? "K-ETS and REC trades due this week should be reviewed before treasury close." : "이번 주 마감 예정인 배출권·REC 거래는 재무 마감 전에 우선 점검해야 합니다.",
                        "badge", isEn ? "Attention" : "주의",
                        "toneClassName", "bg-amber-100 text-amber-700",
                        "actionLabel", isEn ? "Open trade list" : "거래 목록 열기",
                        "actionUrl", buildAdminPath(isEn, "/trade/list?settlementStatus=PENDING")),
                mapOf("title", isEn ? "Exception concentration by institution" : "기관별 예외 거래 집중",
                        "description", isEn ? "Eco Farm and Forest Link account for most settlement exceptions in the current window." : "현재 정산 예외는 에코팜과 포레스트링크에 집중되어 있습니다.",
                        "badge", isEn ? "Watch" : "관찰",
                        "toneClassName", "bg-sky-100 text-sky-700",
                        "actionLabel", isEn ? "Open abnormal trade queue" : "이상거래 큐 열기",
                        "actionUrl", buildAdminPath(isEn, "/trade/duplicate")),
                mapOf("title", isEn ? "High-value month-end close" : "고액 월말 정산 마감",
                        "description", isEn ? "High-value balancing lots should be handed off with a final operator memo." : "고액 밸런싱 거래는 최종 운영 메모를 남긴 뒤 정산 이관해야 합니다.",
                        "badge", isEn ? "Action" : "조치",
                        "toneClassName", "bg-rose-100 text-rose-700",
                        "actionLabel", isEn ? "Open settlement calendar" : "정산 캘린더 열기",
                        "actionUrl", buildAdminPath(isEn, "/payment/settlement")));
    }

    private List<Map<String, String>> buildTradeDuplicateRows(boolean isEn) {
        return List.of(
                mapOf("reviewId", "TDR-2026-0411", "tradeId", "TRD-202603-005", "contractName", isEn ? "Data center reserve" : "데이터센터 예비물량", "sellerName", isEn ? "Sun Network" : "선네트워크", "buyerName", isEn ? "Urban Data" : "어반데이터", "analyst", isEn ? "Jiwon Park" : "박지원", "reason", isEn ? "Repeated counterparties and settlement gap in the same closing window." : "같은 마감 창구에서 거래 당사자 반복과 정산 불일치가 함께 감지되었습니다.", "detectionTypeCode", "SETTLEMENT_GAP", "detectionTypeLabel", isEn ? "Settlement gap" : "정산 불일치", "reviewStatusCode", "BLOCKED", "reviewStatusLabel", isEn ? "Settlement blocked" : "정산 보류", "riskLevelCode", "CRITICAL", "riskLevelLabel", isEn ? "Critical" : "치명", "detectedAt", "2026-03-31 08:45", "quantity", "6,400 MWh", "amount", "KRW 154,000,000", "investigationSummary", isEn ? "Closing ledger and trade ledger diverged after a duplicate counterparty check." : "중복 상대기관 확인 이후 마감 원장과 거래 원장 값이 어긋났습니다.", "recommendedAction", isEn ? "Keep blocked until ledger sync is complete." : "원장 동기화 완료 전까지 차단을 유지합니다.", "settlementActionLabel", isEn ? "Block settlement batch" : "정산 배치 차단", "detailUrl", buildAdminPath(isEn, "/trade/reject?tradeId=TRD-202603-005")),
                mapOf("reviewId", "TDR-2026-0410", "tradeId", "TRD-202603-007", "contractName", isEn ? "Seasonal hedge" : "계절성 헤지", "sellerName", isEn ? "Nova Chemical" : "노바케미칼", "buyerName", isEn ? "Blue Energy" : "블루에너지", "analyst", isEn ? "Dahye Seo" : "서다혜", "reason", isEn ? "Counterparty overlap with unusual price movement." : "거래 상대 중복과 비정상 가격 편차가 동시에 탐지되었습니다.", "detectionTypeCode", "DUPLICATE_PARTY", "detectionTypeLabel", isEn ? "Duplicate party" : "거래 당사자 중복", "reviewStatusCode", "ESCALATED", "reviewStatusLabel", isEn ? "Escalated" : "상향 검토", "riskLevelCode", "HIGH", "riskLevelLabel", isEn ? "High" : "높음", "detectedAt", "2026-03-31 08:12", "quantity", "9,900 tCO2eq", "amount", "KRW 333,600,000", "investigationSummary", isEn ? "The same counterpart group appeared in a high-premium hedge cluster." : "고프리미엄 헤지 묶음에서 동일 상대기관 그룹이 반복 확인되었습니다.", "recommendedAction", isEn ? "Escalate to supervisor and compare prior-day orders." : "상급자 검토로 전환하고 전일 주문과 대조합니다.", "settlementActionLabel", isEn ? "Supervisor approval required" : "상급자 승인 필요", "detailUrl", buildAdminPath(isEn, "/trade/duplicate?searchKeyword=Nova")),
                mapOf("reviewId", "TDR-2026-0409", "tradeId", "TRD-202603-003", "contractName", isEn ? "Biochar contract" : "바이오차 계약", "sellerName", isEn ? "Eco Farm" : "에코팜", "buyerName", isEn ? "Carbon Labs" : "카본랩스", "analyst", isEn ? "Yuna Choi" : "최유나", "reason", isEn ? "Order split pattern was repeated within the same day." : "동일 일자 내 주문 분할 패턴이 반복 확인되었습니다.", "detectionTypeCode", "SPLIT_ORDER", "detectionTypeLabel", isEn ? "Split order" : "주문 분할", "reviewStatusCode", "REVIEW", "reviewStatusLabel", isEn ? "Under review" : "검토 중", "riskLevelCode", "MEDIUM", "riskLevelLabel", isEn ? "Medium" : "중간", "detectedAt", "2026-03-30 17:40", "quantity", "4,250 tCO2eq", "amount", "KRW 87,500,000", "investigationSummary", isEn ? "Child orders stayed below review threshold but share the same pattern." : "하위 주문이 검토 임계치 이하로 쪼개졌지만 동일 패턴이 반복됩니다.", "recommendedAction", isEn ? "Review trader note and execution policy." : "거래 메모와 실행 정책을 검토합니다.", "settlementActionLabel", isEn ? "Review before settlement" : "정산 전 검토", "detailUrl", buildAdminPath(isEn, "/trade/duplicate?searchKeyword=Eco")),
                mapOf("reviewId", "TDR-2026-0407", "tradeId", "TRD-202603-012", "contractName", isEn ? "Agriculture offset pool" : "농업 상쇄 풀", "sellerName", isEn ? "Eco Farm" : "에코팜", "buyerName", isEn ? "Hanul Steel" : "한울제철", "analyst", isEn ? "Minji Lee" : "이민지", "reason", isEn ? "Trade volume exceeded the configured exposure threshold." : "거래 물량이 설정된 노출 한도를 초과했습니다.", "detectionTypeCode", "LIMIT_BREACH", "detectionTypeLabel", isEn ? "Limit breach" : "한도 초과", "reviewStatusCode", "REVIEW", "reviewStatusLabel", isEn ? "Under review" : "검토 중", "riskLevelCode", "HIGH", "riskLevelLabel", isEn ? "High" : "높음", "detectedAt", "2026-03-30 15:08", "quantity", "6,900 tCO2eq", "amount", "KRW 143,500,000", "investigationSummary", isEn ? "Exposure cap was already near limit from an earlier exception case." : "기존 예외 거래 영향으로 노출 한도가 이미 임계점에 가까웠습니다.", "recommendedAction", isEn ? "Confirm committee override or reject." : "위원회 예외승인 여부를 확인하거나 반려합니다.", "settlementActionLabel", isEn ? "Risk override required" : "리스크 예외승인 필요", "detailUrl", buildAdminPath(isEn, "/trade/reject?tradeId=TRD-202603-012")),
                mapOf("reviewId", "TDR-2026-0405", "tradeId", "TRD-202603-011", "contractName", isEn ? "Heat network mix" : "열공급 믹스 거래", "sellerName", isEn ? "North Solar" : "노스솔라", "buyerName", isEn ? "Metro Heat" : "메트로히트", "analyst", isEn ? "Ara Yun" : "윤아라", "reason", isEn ? "Price outlier flagged against the same-week REC bundle benchmark." : "동주차 REC 묶음 벤치마크 대비 가격 이상이 감지되었습니다.", "detectionTypeCode", "PRICE_OUTLIER", "detectionTypeLabel", isEn ? "Price outlier" : "가격 이상", "reviewStatusCode", "CLEARED", "reviewStatusLabel", isEn ? "Cleared" : "해소", "riskLevelCode", "LOW", "riskLevelLabel", isEn ? "Low" : "낮음", "detectedAt", "2026-03-30 11:26", "quantity", "2,850 MWh", "amount", "KRW 59,400,000", "investigationSummary", isEn ? "Operator note matched a temporary REC market premium and was accepted." : "운영 메모상 일시적 REC 프리미엄 사유가 확인되어 해소 처리되었습니다.", "recommendedAction", isEn ? "Proceed with settlement and keep note attached." : "메모를 첨부한 채 정산을 진행합니다.", "settlementActionLabel", isEn ? "Settlement can proceed" : "정산 진행 가능", "detailUrl", buildAdminPath(isEn, "/trade/list?searchKeyword=North")));
    }

    private List<Map<String, String>> buildTradeListRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(tradeRow("TRD-202603-001", isEn ? "K-ETS Credit" : "배출권", isEn ? "Hanul Steel" : "한울제철",
                isEn ? "Blue Energy" : "블루에너지", isEn ? "Quarterly offset bundle" : "분기 상쇄 배치",
                "12,500 tCO2eq", "KRW 418,000,000", "2026-03-30 09:10", "REQUESTED",
                isEn ? "Requested" : "요청", "PENDING", isEn ? "Pending" : "정산 대기"));
        rows.add(tradeRow("TRD-202603-002", isEn ? "REC Package" : "REC 패키지", isEn ? "Green Grid" : "그린그리드",
                isEn ? "Seoul Mobility" : "서울모빌리티", isEn ? "Scope 2 hedge" : "Scope 2 헤지",
                "8,000 MWh", "KRW 192,000,000", "2026-03-30 08:35", "MATCHING",
                isEn ? "Matching" : "매칭중", "IN_PROGRESS", isEn ? "In Progress" : "정산 진행"));
        rows.add(tradeRow("TRD-202603-003", isEn ? "Voluntary Credit" : "자발적 감축실적", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Carbon Labs" : "카본랩스", isEn ? "Biochar contract" : "바이오차 계약",
                "4,250 tCO2eq", "KRW 87,500,000", "2026-03-29 16:40", "APPROVED",
                isEn ? "Approved" : "승인", "PENDING", isEn ? "Pending" : "정산 대기"));
        rows.add(tradeRow("TRD-202603-004", isEn ? "K-ETS Credit" : "배출권", isEn ? "East Port" : "이스트포트",
                isEn ? "River Cement" : "리버시멘트", isEn ? "March balancing lot" : "3월 밸런싱 물량",
                "15,300 tCO2eq", "KRW 522,400,000", "2026-03-29 15:20", "COMPLETED",
                isEn ? "Completed" : "완료", "DONE", isEn ? "Done" : "정산 완료"));
        rows.add(tradeRow("TRD-202603-005", isEn ? "REC Package" : "REC 패키지", isEn ? "Sun Network" : "선네트워크",
                isEn ? "Urban Data" : "어반데이터", isEn ? "Data center reserve" : "데이터센터 예비물량",
                "6,400 MWh", "KRW 154,000,000", "2026-03-29 11:05", "HOLD",
                isEn ? "On Hold" : "보류", "EXCEPTION", isEn ? "Exception" : "예외"));
        rows.add(tradeRow("TRD-202603-006", isEn ? "Voluntary Credit" : "자발적 감축실적", isEn ? "CCUS Plant A" : "CCUS 플랜트 A",
                isEn ? "Metro Heat" : "메트로히트", isEn ? "Capture storage block" : "포집 저장 블록",
                "10,100 tCO2eq", "KRW 301,000,000", "2026-03-28 17:42", "MATCHING",
                isEn ? "Matching" : "매칭중", "IN_PROGRESS", isEn ? "In Progress" : "정산 진행"));
        rows.add(tradeRow("TRD-202603-007", isEn ? "K-ETS Credit" : "배출권", isEn ? "Nova Chemical" : "노바케미칼",
                isEn ? "Blue Energy" : "블루에너지", isEn ? "Seasonal hedge" : "계절성 헤지",
                "9,900 tCO2eq", "KRW 333,600,000", "2026-03-28 14:10", "REQUESTED",
                isEn ? "Requested" : "요청", "PENDING", isEn ? "Pending" : "정산 대기"));
        rows.add(tradeRow("TRD-202603-008", isEn ? "REC Package" : "REC 패키지", isEn ? "Wind Core" : "윈드코어",
                isEn ? "Harbor Cold Chain" : "하버콜드체인", isEn ? "Cold-chain coverage" : "콜드체인 커버리지",
                "3,200 MWh", "KRW 71,000,000", "2026-03-28 10:32", "COMPLETED",
                isEn ? "Completed" : "완료", "DONE", isEn ? "Done" : "정산 완료"));
        rows.add(tradeRow("TRD-202603-009", isEn ? "Voluntary Credit" : "자발적 감축실적", isEn ? "Forest Link" : "포레스트링크",
                isEn ? "Green Grid" : "그린그리드", isEn ? "Afforestation offset" : "조림 상쇄 거래",
                "5,800 tCO2eq", "KRW 126,000,000", "2026-03-27 18:24", "APPROVED",
                isEn ? "Approved" : "승인", "PENDING", isEn ? "Pending" : "정산 대기"));
        rows.add(tradeRow("TRD-202603-010", isEn ? "K-ETS Credit" : "배출권", isEn ? "River Cement" : "리버시멘트",
                isEn ? "Seoul Mobility" : "서울모빌리티", isEn ? "Compliance shortfall fill" : "의무량 보전 계약",
                "7,700 tCO2eq", "KRW 257,000,000", "2026-03-27 09:08", "COMPLETED",
                isEn ? "Completed" : "완료", "DONE", isEn ? "Done" : "정산 완료"));
        rows.add(tradeRow("TRD-202603-011", isEn ? "REC Package" : "REC 패키지", isEn ? "North Solar" : "노스솔라",
                isEn ? "Metro Heat" : "메트로히트", isEn ? "Heat network mix" : "열공급 믹스 거래",
                "2,850 MWh", "KRW 59,400,000", "2026-03-26 13:46", "MATCHING",
                isEn ? "Matching" : "매칭중", "IN_PROGRESS", isEn ? "In Progress" : "정산 진행"));
        rows.add(tradeRow("TRD-202603-012", isEn ? "Voluntary Credit" : "자발적 감축실적", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Hanul Steel" : "한울제철", isEn ? "Agriculture offset pool" : "농업 상쇄 풀",
                "6,900 tCO2eq", "KRW 143,500,000", "2026-03-25 16:18", "HOLD",
                isEn ? "On Hold" : "보류", "EXCEPTION", isEn ? "Exception" : "예외"));
        return rows;
    }

    private List<Map<String, String>> buildSettlementCalendarRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(settlementScheduleRow("SET-202604-001", "2026-04", isEn ? "March offset close" : "3월 상쇄 정산", isEn ? "Hanul Steel" : "한울제철",
                isEn ? "Lee Minji" : "이민지", "2026-04-01", "KRW 418,000,000", "PENDING", isEn ? "Pending" : "대기",
                "HIGH", isEn ? "High" : "높음", isEn ? "Counterparty evidence not signed" : "상대 기관 증빙 미서명"));
        rows.add(settlementScheduleRow("SET-202604-002", "2026-04", isEn ? "REC hedge settlement" : "REC 헤지 정산", isEn ? "Green Grid" : "그린그리드",
                isEn ? "Park Jiwon" : "박지원", "2026-04-01", "KRW 192,000,000", "READY", isEn ? "Ready" : "준비 완료",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Treasury confirmation pending" : "재무 확인 대기"));
        rows.add(settlementScheduleRow("SET-202604-003", "2026-04", isEn ? "Biochar partner payout" : "바이오차 파트너 정산", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Choi Yuna" : "최유나", "2026-04-02", "KRW 87,500,000", "BLOCKED", isEn ? "Blocked" : "차단",
                "HIGH", isEn ? "High" : "높음", isEn ? "Tax invoice mismatch" : "세금계산서 금액 불일치"));
        rows.add(settlementScheduleRow("SET-202604-004", "2026-04", isEn ? "Balancing lot treasury release" : "밸런싱 물량 자금 집행", isEn ? "East Port" : "이스트포트",
                isEn ? "Han Jaeho" : "한재호", "2026-04-02", "KRW 522,400,000", "READY", isEn ? "Ready" : "준비 완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Treasury batch assigned" : "재무 배치 편성 완료"));
        rows.add(settlementScheduleRow("SET-202604-005", "2026-04", isEn ? "Data center reserve settlement" : "데이터센터 예비물량 정산", isEn ? "Sun Network" : "선네트워크",
                isEn ? "Jeong Haein" : "정해인", "2026-04-03", "KRW 154,000,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Operator note update required" : "운영 메모 보완 필요"));
        rows.add(settlementScheduleRow("SET-202604-006", "2026-04", isEn ? "Capture storage close" : "포집 저장 블록 정산", isEn ? "CCUS Plant A" : "CCUS 플랜트 A",
                isEn ? "Kim Sujin" : "김수진", "2026-04-03", "KRW 301,000,000", "COMPLETED", isEn ? "Completed" : "완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Transferred to treasury archive" : "재무 이관 완료"));
        rows.add(settlementScheduleRow("SET-202604-007", "2026-04", isEn ? "Seasonal hedge settlement" : "계절성 헤지 정산", isEn ? "Nova Chemical" : "노바케미칼",
                isEn ? "Seo Dahye" : "서다혜", "2026-04-04", "KRW 333,600,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Need buyer confirmation" : "매수 기관 확인 필요"));
        rows.add(settlementScheduleRow("SET-202604-008", "2026-04", isEn ? "Cold-chain settlement run" : "콜드체인 정산 실행", isEn ? "Wind Core" : "윈드코어",
                isEn ? "Yun Ara" : "윤아라", "2026-04-05", "KRW 71,000,000", "COMPLETED", isEn ? "Completed" : "완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Month-end payout completed" : "월말 지급 완료"));
        rows.add(settlementScheduleRow("SET-202605-001", "2026-05", isEn ? "Afforestation offset close" : "조림 상쇄 정산", isEn ? "Forest Link" : "포레스트링크",
                isEn ? "Lee Minji" : "이민지", "2026-05-02", "KRW 126,000,000", "PENDING", isEn ? "Pending" : "대기",
                "MEDIUM", isEn ? "Medium" : "보통", isEn ? "Awaiting evidence bundle" : "증빙 묶음 수신 대기"));
        rows.add(settlementScheduleRow("SET-202605-002", "2026-05", isEn ? "Compliance fill settlement" : "의무량 보전 정산", isEn ? "River Cement" : "리버시멘트",
                isEn ? "Han Jaeho" : "한재호", "2026-05-03", "KRW 257,000,000", "READY", isEn ? "Ready" : "준비 완료",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Queued for treasury handoff" : "재무 이관 대기열 편성"));
        rows.add(settlementScheduleRow("SET-202606-001", "2026-06", isEn ? "Heat network mix settlement" : "열공급 믹스 정산", isEn ? "North Solar" : "노스솔라",
                isEn ? "Park Jiwon" : "박지원", "2026-06-01", "KRW 59,400,000", "PENDING", isEn ? "Pending" : "대기",
                "LOW", isEn ? "Low" : "낮음", isEn ? "Next month open queue" : "차월 오픈 큐"));
        rows.add(settlementScheduleRow("SET-202606-002", "2026-06", isEn ? "Agriculture offset pool" : "농업 상쇄 풀 정산", isEn ? "Eco Farm" : "에코팜",
                isEn ? "Choi Yuna" : "최유나", "2026-06-02", "KRW 143,500,000", "BLOCKED", isEn ? "Blocked" : "차단",
                "HIGH", isEn ? "High" : "높음", isEn ? "Rejection memo not closed" : "반려 메모 미종결"));
        return rows;
    }

    private Map<String, String> settlementScheduleRow(
            String settlementId,
            String settlementMonth,
            String settlementTitle,
            String institutionName,
            String ownerName,
            String dueDate,
            String amount,
            String statusCode,
            String statusLabel,
            String riskLevelCode,
            String riskLevelLabel,
            String blockerReason) {
        return mapOf(
                "settlementId", settlementId,
                "settlementMonth", settlementMonth,
                "settlementTitle", settlementTitle,
                "institutionName", institutionName,
                "ownerName", ownerName,
                "dueDate", dueDate,
                "amount", amount,
                "statusCode", statusCode,
                "statusLabel", statusLabel,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "blockerReason", blockerReason);
    }

    private List<Map<String, String>> buildSettlementCalendarDays(String selectedMonth, boolean isEn) {
        if ("2026-05".equals(selectedMonth)) {
            return List.of(
                    settlementCalendarDay("2026-05-02", isEn ? "Fri" : "금", "02", "6", "1", isEn ? "Lee Minji" : "이민지", "MEDIUM", isEn ? "Medium" : "보통",
                            isEn ? "Offset proof packet deadline" : "상쇄 증빙 패킷 마감"),
                    settlementCalendarDay("2026-05-03", isEn ? "Sat" : "토", "03", "4", "0", isEn ? "Han Jaeho" : "한재호", "LOW", isEn ? "Low" : "낮음",
                            isEn ? "Treasury handoff slots open" : "재무 이관 슬롯 오픈"));
        }
        if ("2026-06".equals(selectedMonth)) {
            return List.of(
                    settlementCalendarDay("2026-06-01", isEn ? "Mon" : "월", "01", "3", "0", isEn ? "Park Jiwon" : "박지원", "LOW", isEn ? "Low" : "낮음",
                            isEn ? "Open next-cycle settlement queue" : "차기 정산 큐 개시"),
                    settlementCalendarDay("2026-06-02", isEn ? "Tue" : "화", "02", "2", "1", isEn ? "Choi Yuna" : "최유나", "HIGH", isEn ? "High" : "높음",
                            isEn ? "Blocked memo needs closure" : "차단 메모 종결 필요"));
        }
        return List.of(
                settlementCalendarDay("2026-04-01", isEn ? "Wed" : "수", "01", "5", "1", isEn ? "Lee Minji" : "이민지", "HIGH", isEn ? "High" : "높음",
                        isEn ? "Daily close and counterparty confirmation overlap." : "일 마감과 상대 기관 확인 일정이 겹칩니다."),
                settlementCalendarDay("2026-04-02", isEn ? "Thu" : "목", "02", "4", "1", isEn ? "Han Jaeho" : "한재호", "MEDIUM", isEn ? "Medium" : "보통",
                        isEn ? "Tax invoice mismatch should be resolved before treasury release." : "재무 집행 전에 세금계산서 불일치를 정리해야 합니다."),
                settlementCalendarDay("2026-04-03", isEn ? "Fri" : "금", "03", "3", "0", isEn ? "Kim Sujin" : "김수진", "MEDIUM", isEn ? "Medium" : "보통",
                        isEn ? "15:00 treasury cut-off for ready schedules." : "준비 완료 건은 15시 재무 마감 전에 넘겨야 합니다."),
                settlementCalendarDay("2026-04-04", isEn ? "Sat" : "토", "04", "2", "0", isEn ? "Seo Dahye" : "서다혜", "LOW", isEn ? "Low" : "낮음",
                        isEn ? "Buyer confirmation follow-up window." : "매수 기관 확인 추적 구간입니다."),
                settlementCalendarDay("2026-04-05", isEn ? "Sun" : "일", "05", "1", "0", isEn ? "Yun Ara" : "윤아라", "LOW", isEn ? "Low" : "낮음",
                        isEn ? "Archive completed payouts and close notes." : "지급 완료 건 아카이브와 마감 메모 정리를 진행합니다."));
    }

    private Map<String, String> settlementCalendarDay(
            String date,
            String weekdayLabel,
            String dayLabel,
            String scheduledCount,
            String exceptionCount,
            String ownerName,
            String riskLevelCode,
            String riskLevelLabel,
            String focusNote) {
        return mapOf(
                "date", date,
                "weekdayLabel", weekdayLabel,
                "dayLabel", dayLabel,
                "scheduledCount", scheduledCount,
                "exceptionCount", exceptionCount,
                "ownerName", ownerName,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "focusNote", focusNote);
    }

    private List<Map<String, String>> buildRefundListRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(refundRow("RFD-202603-031", isEn ? "Hanul Steel" : "한울제철", isEn ? "Kim Minseo" : "김민서",
                isEn ? "Card Refund" : "카드 취소", "Shinhan 123-45****-88", "KRW 1,280,000", "KRW 1,280,000",
                "2026-03-31 15:10", "RECEIVED", isEn ? "Received" : "접수", "HIGH", isEn ? "High" : "높음",
                isEn ? "Duplicate payment detected during invoice closing." : "세금계산서 마감 중 이중 결제가 확인되었습니다.",
                isEn ? "Verify duplicate transaction evidence" : "중복 결제 증빙 확인"));
        rows.add(refundRow("RFD-202603-030", isEn ? "Blue Energy" : "블루에너지", isEn ? "Park Jiwon" : "박지원",
                isEn ? "Bank Transfer" : "계좌 이체", "KB 991-20****-11", "KRW 860,000", "KRW 860,000",
                "2026-03-31 13:42", "ACCOUNT_REVIEW", isEn ? "Account Review" : "계좌 검수", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Refund account was changed after submission." : "신청 후 환불 계좌가 변경되었습니다.",
                isEn ? "Confirm account ownership" : "예금주 확인"));
        rows.add(refundRow("RFD-202603-029", isEn ? "Metro Heat" : "메트로히트", isEn ? "Lee Seojun" : "이서준",
                isEn ? "Card Refund" : "카드 취소", "Hyundai 883-10****-04", "KRW 540,000", "KRW 540,000",
                "2026-03-31 11:05", "IN_REVIEW", isEn ? "In Review" : "검토중", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Service package downgrade before activation." : "서비스 개시 전 상품 등급 하향 요청입니다.",
                isEn ? "Review downgrade effective date" : "등급 변경 적용일 검토"));
        rows.add(refundRow("RFD-202603-028", isEn ? "Green Grid" : "그린그리드", isEn ? "Choi Yena" : "최예나",
                isEn ? "Bank Transfer" : "계좌 이체", "NH 118-77****-90", "KRW 2,140,000", "KRW 1,920,000",
                "2026-03-30 17:26", "APPROVED", isEn ? "Approved" : "승인", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Partial refund after monthly settlement offset." : "월 정산 상계 후 부분 환불 승인 건입니다.",
                isEn ? "Queue next transfer batch" : "다음 이체 배치 편성"));
        rows.add(refundRow("RFD-202603-027", isEn ? "River Cement" : "리버시멘트", isEn ? "Han Jaeho" : "한재호",
                isEn ? "Bank Transfer" : "계좌 이체", "Woori 227-00****-53", "KRW 3,400,000", "KRW 3,400,000",
                "2026-03-30 15:11", "TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Approved full refund awaiting treasury batch." : "전액 환불 승인 후 자금 배치 대기 중입니다.",
                isEn ? "Monitor transfer completion" : "이체 완료 모니터링"));
        rows.add(refundRow("RFD-202603-026", isEn ? "Sun Network" : "선네트워크", isEn ? "Jeong Haein" : "정해인",
                isEn ? "Card Refund" : "카드 취소", "Samsung 771-30****-61", "KRW 420,000", "KRW 420,000",
                "2026-03-29 18:08", "COMPLETED", isEn ? "Completed" : "처리 완료", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Cancellation completed with card acquirer." : "카드 매입사 취소 처리가 완료되었습니다.",
                isEn ? "Complete" : "완료"));
        rows.add(refundRow("RFD-202603-025", isEn ? "Carbon Labs" : "카본랩스", isEn ? "Yun Ara" : "윤아라",
                isEn ? "Bank Transfer" : "계좌 이체", "IBK 004-18****-32", "KRW 1,100,000", "KRW 0",
                "2026-03-29 12:14", "REJECTED", isEn ? "Rejected" : "반려", "HIGH", isEn ? "High" : "높음",
                isEn ? "Requested period already consumed by issued certificate." : "발급 완료된 인증서 사용 기간과 중복되어 반려되었습니다.",
                isEn ? "Notify rejection reason" : "반려 사유 안내"));
        rows.add(refundRow("RFD-202603-024", isEn ? "Seoul Mobility" : "서울모빌리티", isEn ? "Kang Doyun" : "강도윤",
                isEn ? "Bank Transfer" : "계좌 이체", "KakaoBank 333-22****-71", "KRW 780,000", "KRW 780,000",
                "2026-03-28 10:22", "IN_REVIEW", isEn ? "In Review" : "검토중", "MEDIUM", isEn ? "Medium" : "보통",
                isEn ? "Support escalation attached for service outage credit." : "서비스 장애 보상 사유로 고객지원 이관 메모가 첨부되었습니다.",
                isEn ? "Validate outage compensation rule" : "장애 보상 기준 확인"));
        rows.add(refundRow("RFD-202603-023", isEn ? "Nova Chemical" : "노바케미칼", isEn ? "Seo Dahye" : "서다혜",
                isEn ? "Card Refund" : "카드 취소", "Lotte 441-90****-15", "KRW 690,000", "KRW 690,000",
                "2026-03-27 16:35", "TRANSFER_SCHEDULED", isEn ? "Transfer Scheduled" : "이체 예정", "LOW", isEn ? "Low" : "낮음",
                isEn ? "Treasury approved same-week refund batch." : "재무팀이 주간 환불 배치를 승인했습니다.",
                isEn ? "Await batch completion" : "배치 완료 대기"));
        return rows;
    }

    private Map<String, String> refundRow(
            String refundId,
            String companyName,
            String applicantName,
            String paymentMethodLabel,
            String accountMasked,
            String requestedAmount,
            String refundableAmount,
            String requestedAt,
            String statusCode,
            String statusLabel,
            String riskLevelCode,
            String riskLevelLabel,
            String reasonSummary,
            String nextActionLabel) {
        return mapOf(
                "refundId", refundId,
                "companyName", companyName,
                "applicantName", applicantName,
                "paymentMethodLabel", paymentMethodLabel,
                "accountMasked", accountMasked,
                "requestedAmount", requestedAmount,
                "refundableAmount", refundableAmount,
                "requestedAt", requestedAt,
                "statusCode", statusCode,
                "statusLabel", statusLabel,
                "riskLevelCode", riskLevelCode,
                "riskLevelLabel", riskLevelLabel,
                "reasonSummary", reasonSummary,
                "nextActionLabel", nextActionLabel);
    }

    private List<Map<String, String>> buildTradeApproveRows(boolean isEn) {
        ensureTradeApprovalState();
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> baseRow : buildTradeListRows(isEn)) {
            Map<String, String> state = tradeApprovalState.computeIfAbsent(
                    safeString(baseRow.get("tradeId")),
                    key -> defaultTradeApprovalState());
            String approvalStatusCode = safeString(state.get("approvalStatusCode"));
            String approvalStatusLabel = approvalStatusLabel(approvalStatusCode, isEn);
            Map<String, String> row = mapOf(
                    "tradeId", safeString(baseRow.get("tradeId")),
                    "tradeTypeCode", inferTradeTypeCode(baseRow),
                    "productType", safeString(baseRow.get("productType")),
                    "sellerName", safeString(baseRow.get("sellerName")),
                    "buyerName", safeString(baseRow.get("buyerName")),
                    "contractName", safeString(baseRow.get("contractName")),
                    "quantity", safeString(baseRow.get("quantity")),
                    "amount", safeString(baseRow.get("amount")),
                    "requestedAt", safeString(baseRow.get("requestedAt")),
                    "settlementStatusCode", safeString(baseRow.get("settlementStatusCode")),
                    "settlementStatusLabel", safeString(baseRow.get("settlementStatusLabel")),
                    "approvalStatusCode", approvalStatusCode,
                    "approvalStatusLabel", approvalStatusLabel,
                    "reviewedAt", safeString(state.get("reviewedAt")),
                    "reviewerName", safeString(state.get("reviewerName")),
                    "reviewNote", safeString(isEn ? state.get("reviewNoteEn") : state.get("reviewNoteKo")),
                    "rejectReason", safeString(state.get("rejectReason")));
            rows.add(row);
        }
        rows.sort(Comparator.comparing((Map<String, String> row) -> safeString(row.get("requestedAt"))).reversed());
        return rows;
    }

    private void ensureTradeApprovalState() {
        if (!tradeApprovalState.isEmpty()) {
            return;
        }
        tradeApprovalState.put("TRD-202603-001", tradeApprovalState("PENDING", "", "거래 운영팀", "초기 증빙 확인 완료. 상대 기관 응답 대기", "Initial evidence reviewed. Waiting for counterparty confirmation.", ""));
        tradeApprovalState.put("TRD-202603-002", tradeApprovalState("HOLD", "", "거래 운영팀", "정산 연계 상태 점검 필요", "Settlement integration status needs review.", ""));
        tradeApprovalState.put("TRD-202603-003", tradeApprovalState("APPROVED", "2026-03-30 17:20", "Trade Ops Desk", "검토 승인 후 정산 대기 전환", "Approved after review and moved to settlement pending.", ""));
        tradeApprovalState.put("TRD-202603-004", tradeApprovalState("APPROVED", "2026-03-29 18:10", "Trade Ops Desk", "완료 거래로 후속 모니터링만 유지", "Completed trade retained for monitoring only.", ""));
        tradeApprovalState.put("TRD-202603-005", tradeApprovalState("REJECTED", "2026-03-29 13:40", "거래 운영팀", "상대 기관 서명본 누락으로 반려", "Rejected due to missing signed counterpart evidence.", "상대 기관 서명본 누락"));
        tradeApprovalState.put("TRD-202603-006", tradeApprovalState("HOLD", "", "Trade Ops Desk", "매칭 엔진 경고 검토 중", "Matching engine warning under review.", ""));
        tradeApprovalState.put("TRD-202603-007", tradeApprovalState("PENDING", "", "거래 운영팀", "담당자 최종 검토 전", "Awaiting final operator review.", ""));
        tradeApprovalState.put("TRD-202603-008", tradeApprovalState("APPROVED", "2026-03-28 11:50", "Trade Ops Desk", "정산 완료 거래", "Settlement completed trade.", ""));
        tradeApprovalState.put("TRD-202603-009", tradeApprovalState("APPROVED", "2026-03-27 19:00", "거래 운영팀", "조림 상쇄 거래 승인 완료", "Afforestation offset trade approved.", ""));
        tradeApprovalState.put("TRD-202603-010", tradeApprovalState("APPROVED", "2026-03-27 10:10", "Trade Ops Desk", "컴플라이언스 보전 거래 승인", "Compliance fill trade approved.", ""));
        tradeApprovalState.put("TRD-202603-011", tradeApprovalState("PENDING", "", "거래 운영팀", "열공급 믹스 거래 검토 대기", "Heat network mix trade pending review.", ""));
        tradeApprovalState.put("TRD-202603-012", tradeApprovalState("HOLD", "", "Trade Ops Desk", "농업 상쇄 풀 증빙 재확인 필요", "Agriculture offset pool evidence needs recheck.", ""));
    }

    private Map<String, String> tradeApprovalState(
            String approvalStatusCode,
            String reviewedAt,
            String reviewerName,
            String reviewNoteKo,
            String reviewNoteEn,
            String rejectReason) {
        Map<String, String> state = defaultTradeApprovalState();
        state.put("approvalStatusCode", approvalStatusCode);
        state.put("reviewedAt", reviewedAt);
        state.put("reviewerName", reviewerName);
        state.put("reviewNoteKo", reviewNoteKo);
        state.put("reviewNoteEn", reviewNoteEn);
        state.put("reviewNote", reviewNoteKo);
        state.put("rejectReason", rejectReason);
        return state;
    }

    private Map<String, String> defaultTradeApprovalState() {
        return mapOf(
                "approvalStatusCode", "PENDING",
                "reviewedAt", "",
                "reviewerName", "",
                "reviewNoteKo", "",
                "reviewNoteEn", "",
                "reviewNote", "",
                "rejectReason", "");
    }

    private long countByApprovalStatus(List<Map<String, String>> rows, String approvalStatusCode) {
        return rows.stream()
                .filter(row -> approvalStatusCode.equalsIgnoreCase(safeString(row.get("approvalStatusCode"))))
                .count();
    }

    private List<String> normalizeSelectedIds(Object selectedIds, String singleId) {
        List<String> resolved = new ArrayList<>();
        if (selectedIds instanceof List<?>) {
            for (Object value : (List<?>) selectedIds) {
                String normalized = stringValue(value);
                if (!normalized.isEmpty()) {
                    resolved.add(normalized);
                }
            }
        }
        String normalizedSingleId = safeString(singleId);
        if (resolved.isEmpty() && !normalizedSingleId.isEmpty()) {
            resolved.add(normalizedSingleId);
        }
        return resolved;
    }

    private String approvalStatusLabel(String approvalStatusCode, boolean isEn) {
        switch (safeString(approvalStatusCode).toUpperCase(Locale.ROOT)) {
            case "APPROVED":
                return isEn ? "Approved" : "승인 완료";
            case "REJECTED":
                return isEn ? "Rejected" : "반려";
            case "HOLD":
                return isEn ? "On Hold" : "보류";
            default:
                return isEn ? "Pending" : "승인 대기";
        }
    }

    private String inferTradeTypeCode(Map<String, String> row) {
        String productType = safeString(row.get("productType")).toLowerCase(Locale.ROOT);
        if (productType.contains("rec")) {
            return "REC";
        }
        if (productType.contains("voluntary") || productType.contains("자발적")) {
            return "VOLUNTARY";
        }
        return "KETS";
    }

    private Map<String, String> tradeRow(
            String tradeId,
            String productType,
            String sellerName,
            String buyerName,
            String contractName,
            String quantity,
            String amount,
            String requestedAt,
            String tradeStatusCode,
            String tradeStatusLabel,
            String settlementStatusCode,
            String settlementStatusLabel) {
        return mapOf(
                "tradeId", tradeId,
                "productType", productType,
                "sellerName", sellerName,
                "buyerName", buyerName,
                "contractName", contractName,
                "quantity", quantity,
                "amount", amount,
                "requestedAt", requestedAt,
                "tradeStatusCode", tradeStatusCode,
                "tradeStatusLabel", tradeStatusLabel,
                "settlementStatusCode", settlementStatusCode,
                "settlementStatusLabel", settlementStatusLabel);
    }

    private Map<String, String> option(String code, String label) {
        return mapOf("code", code, "label", label);
    }

    private Map<String, String> mapOf(String... values) {
        Map<String, String> row = new LinkedHashMap<>();
        for (int index = 0; index + 1 < values.length; index += 2) {
            row.put(values[index], values[index + 1]);
        }
        return row;
    }

    private List<Map<String, String>> filterAndSortSecurityAuditRows(
            List<Map<String, String>> rows,
            String searchKeyword,
            String actionType,
            String routeGroup,
            String sortKey,
            String sortDirection) {
        List<Map<String, String>> filtered = new ArrayList<>();
        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        for (Map<String, String> row : rows) {
            if (!matchesSecurityAuditActionType(row, actionType)) {
                continue;
            }
            if (!matchesSecurityAuditRouteGroup(row, routeGroup)) {
                continue;
            }
            if (!normalizedKeyword.isEmpty() && !matchesSecurityAuditKeyword(row, normalizedKeyword)) {
                continue;
            }
            filtered.add(new LinkedHashMap<>(row));
        }
        Comparator<Map<String, String>> comparator = securityAuditComparator(sortKey);
        filtered.sort("ASC".equals(sortDirection) ? comparator : comparator.reversed());
        return filtered;
    }

    private Comparator<Map<String, String>> securityAuditComparator(String sortKey) {
        switch (sortKey) {
            case "ACTOR":
                return Comparator.<Map<String, String>, String>comparing(
                                row -> extractSecurityAuditActorId(safeString(row.get("actor"))),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> safeString(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "ACTION":
                return Comparator.<Map<String, String>, String>comparing(
                                row -> safeString(row.get("action")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> safeString(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "TARGET":
                return Comparator.<Map<String, String>, String>comparing(
                                row -> safeString(row.get("target")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> safeString(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "AUDIT_AT":
            default:
                return Comparator.<Map<String, String>, String>comparing(
                                row -> safeString(row.get("auditAt")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> safeString(row.get("target")), String.CASE_INSENSITIVE_ORDER);
        }
    }

    private boolean matchesSecurityAuditKeyword(Map<String, String> row, String normalizedKeyword) {
        String actor = safeString(row.get("actor"));
        return actor.toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("target")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("detail")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("action")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || extractSecurityAuditActorId(actor).toLowerCase(Locale.ROOT).contains(normalizedKeyword);
    }

    private boolean matchesSecurityAuditActionType(Map<String, String> row, String actionType) {
        if ("ALL".equals(actionType)) {
            return true;
        }
        if ("BLOCKED".equals(actionType)) {
            return isBlockedSecurityAuditRow(row);
        }
        if ("ALLOWED".equals(actionType)) {
            return isAllowedSecurityAuditRow(row);
        }
        return !isBlockedSecurityAuditRow(row) && !isAllowedSecurityAuditRow(row);
    }

    private boolean matchesSecurityAuditRouteGroup(Map<String, String> row, String routeGroup) {
        if ("ALL".equals(routeGroup)) {
            return true;
        }
        String target = safeString(row.get("target")).toLowerCase(Locale.ROOT);
        if ("BLOCK".equals(routeGroup)) {
            return target.contains("block") || target.contains("deny");
        }
        if ("POLICY".equals(routeGroup)) {
            return target.contains("policy");
        }
        return true;
    }

    private boolean isBlockedSecurityAuditRow(Map<String, String> row) {
        String action = safeString(row.get("action")).toLowerCase(Locale.ROOT);
        return action.contains("차단") || action.contains("blocked");
    }

    private boolean isAllowedSecurityAuditRow(Map<String, String> row) {
        String action = safeString(row.get("action")).toLowerCase(Locale.ROOT);
        return action.contains("허용") || action.contains("allowed");
    }

    private boolean isSecurityAuditErrorRow(Map<String, String> row) {
        try {
            return Integer.parseInt(safeString(row.get("responseStatus"))) >= 400 || !safeString(row.get("errorMessage")).isEmpty();
        } catch (NumberFormatException ignored) {
            return !safeString(row.get("errorMessage")).isEmpty();
        }
    }

    private boolean isSecurityAuditSlowRow(Map<String, String> row) {
        try {
            return Long.parseLong(safeString(row.get("durationMs"))) >= 1000L;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    private long countRepeatedSecurityAuditValues(
            List<Map<String, String>> rows,
            Function<Map<String, String>, String> extractor) {
        return rows.stream()
                .map(extractor)
                .map(this::safeString)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                .values()
                .stream()
                .filter(count -> count > 1)
                .count();
    }

    private List<Map<String, String>> buildRepeatedSecurityAuditRows(
            List<Map<String, String>> rows,
            Function<Map<String, String>, String> extractor,
            String label) {
        return rows.stream()
                .map(extractor)
                .map(this::safeString)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
                .entrySet()
                .stream()
                .filter(entry -> entry.getValue() > 1)
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER)))
                .limit(5)
                .map(entry -> mapOf(
                        "label", label,
                        "value", entry.getKey(),
                        "count", String.valueOf(entry.getValue())))
                .collect(Collectors.toList());
    }

    private String extractSecurityAuditActorId(String actor) {
        String normalized = safeString(actor);
        int slashIndex = normalized.indexOf(" / ");
        if (slashIndex >= 0) {
            normalized = normalized.substring(0, slashIndex);
        }
        int typeStart = normalized.indexOf("(");
        if (typeStart >= 0) {
            normalized = normalized.substring(0, typeStart);
        }
        return normalized.trim();
    }

    private String normalizeSecurityAuditActionType(String actionType) {
        String normalized = safeString(actionType).toUpperCase(Locale.ROOT);
        if ("BLOCKED".equals(normalized) || "ALLOWED".equals(normalized) || "REVIEWED".equals(normalized)) {
            return normalized;
        }
        return "ALL";
    }

    private String normalizeSecurityAuditRouteGroup(String routeGroup) {
        String normalized = safeString(routeGroup).toUpperCase(Locale.ROOT);
        if ("BLOCK".equals(normalized) || "POLICY".equals(normalized)) {
            return normalized;
        }
        return "ALL";
    }

    private String normalizeSecurityAuditSortKey(String sortKey) {
        String normalized = safeString(sortKey).toUpperCase(Locale.ROOT);
        if ("ACTOR".equals(normalized) || "ACTION".equals(normalized) || "TARGET".equals(normalized)) {
            return normalized;
        }
        return "AUDIT_AT";
    }

    private String normalizeSecurityAuditSortDirection(String sortDirection) {
        return "ASC".equals(safeString(sortDirection).toUpperCase(Locale.ROOT)) ? "ASC" : "DESC";
    }

    private List<Map<String, String>> filterCertificateAuditLogRows(
            List<Map<String, String>> rows,
            String searchKeyword,
            String auditType,
            String status,
            String certificateType,
            String startDate,
            String endDate) {
        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        List<Map<String, String>> filtered = new ArrayList<>();
        for (Map<String, String> row : rows) {
            if (!"ALL".equals(auditType) && !auditType.equals(safeString(row.get("auditTypeCode")))) {
                continue;
            }
            if (!"ALL".equals(status) && !status.equals(safeString(row.get("statusCode")))) {
                continue;
            }
            if (!"ALL".equals(certificateType) && !certificateType.equals(safeString(row.get("certificateTypeCode")))) {
                continue;
            }
            String auditDate = safeString(row.get("auditAt"));
            String auditDateOnly = auditDate.length() >= 10 ? auditDate.substring(0, 10) : auditDate;
            if (!startDate.isEmpty() && auditDateOnly.compareTo(startDate) < 0) {
                continue;
            }
            if (!endDate.isEmpty() && auditDateOnly.compareTo(endDate) > 0) {
                continue;
            }
            if (!normalizedKeyword.isEmpty() && !matchesCertificateAuditKeyword(row, normalizedKeyword)) {
                continue;
            }
            filtered.add(new LinkedHashMap<>(row));
        }
        filtered.sort(Comparator.<Map<String, String>, String>comparing(row -> safeString(row.get("auditAt"))).reversed());
        return filtered;
    }

    private boolean matchesCertificateAuditKeyword(Map<String, String> row, String normalizedKeyword) {
        return safeString(row.get("requestId")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("certificateNo")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("companyName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("companyId")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("applicantName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("applicantId")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("approverName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(row.get("reason")).toLowerCase(Locale.ROOT).contains(normalizedKeyword);
    }

    private String normalizeCertificateAuditType(String auditType) {
        String normalized = safeString(auditType).toUpperCase(Locale.ROOT);
        if ("ISSUE".equals(normalized) || "REISSUE".equals(normalized) || "RENEW".equals(normalized) || "REVOKE".equals(normalized)) {
            return normalized;
        }
        return "ALL";
    }

    private String normalizeCertificateAuditStatus(String status) {
        String normalized = safeString(status).toUpperCase(Locale.ROOT);
        if ("PENDING".equals(normalized) || "APPROVED".equals(normalized) || "REJECTED".equals(normalized)) {
            return normalized;
        }
        return "ALL";
    }

    private String normalizeCertificateAuditCertificateType(String certificateType) {
        String normalized = safeString(certificateType).toUpperCase(Locale.ROOT);
        if ("EMISSION".equals(normalized) || "JOINT".equals(normalized) || "CLOUD".equals(normalized)) {
            return normalized;
        }
        return "ALL";
    }

    private String normalizeCertificateAuditDate(String date) {
        String normalized = safeString(date);
        return normalized.matches("\\d{4}-\\d{2}-\\d{2}") ? normalized : "";
    }

    private List<Map<String, Object>> buildCertificateRecCheckGroups() {
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(mapOfObjects(
                "id", "REC-DUP-240330-01",
                "recNo", "REC-2026-001248",
                "projectName", "여수 바이오매스 열병합",
                "companyName", "한빛에너지",
                "issuanceWindow", "2026-03-01 ~ 2026-03-15",
                "duplicateCount", 3,
                "riskScore", 98,
                "matchBasis", "SERIAL",
                "status", "BLOCKED",
                "lastCheckedAt", "2026-03-30 09:15",
                "actionOwner", "운영1팀 김주임",
                "reason", mapOfObjects(
                        "ko", "동일 REC 번호가 발급 검토 2건과 이의신청 반영 1건에 동시에 연결되었습니다.",
                        "en", "The same REC number is attached to two review cases and one objection reflection case."
                ),
                "comparedCertificates", List.of(
                        mapOfObjects("certificateId", "CERT-REVIEW-0912", "companyName", "한빛에너지", "status", "BLOCKED"),
                        mapOfObjects("certificateId", "CERT-OBJ-0311", "companyName", "한빛에너지", "status", "PENDING"),
                        mapOfObjects("certificateId", "CERT-REVIEW-0840", "companyName", "동해그린파워", "status", "PENDING")
                )));
        rows.add(mapOfObjects(
                "id", "REC-DUP-240330-02",
                "recNo", "REC-2026-001091",
                "projectName", "포항 수소환원 제철",
                "companyName", "에코스틸",
                "issuanceWindow", "2026-02-21 ~ 2026-03-04",
                "duplicateCount", 2,
                "riskScore", 84,
                "matchBasis", "REGISTRY",
                "status", "REVIEW",
                "lastCheckedAt", "2026-03-30 08:42",
                "actionOwner", "심사팀 박대리",
                "reason", mapOfObjects(
                        "ko", "등록원장 기준 감축량 합계는 같지만 서로 다른 신청번호로 재검토 요청이 접수되었습니다.",
                        "en", "The registry reduction total matches, but two different application numbers were submitted for re-review."
                ),
                "comparedCertificates", List.of(
                        mapOfObjects("certificateId", "CERT-REVIEW-0868", "companyName", "에코스틸", "status", "PENDING"),
                        mapOfObjects("certificateId", "CERT-REISSUE-0023", "companyName", "에코스틸", "status", "ELIGIBLE")
                )));
        rows.add(mapOfObjects(
                "id", "REC-DUP-240330-03",
                "recNo", "REC-2026-000774",
                "projectName", "서남권 해상풍력 연계",
                "companyName", "그린웨이브",
                "issuanceWindow", "2026-01-10 ~ 2026-01-31",
                "duplicateCount", 2,
                "riskScore", 41,
                "matchBasis", "PERIOD",
                "status", "CLEARED",
                "lastCheckedAt", "2026-03-29 18:10",
                "actionOwner", "심사팀 오과장",
                "reason", mapOfObjects(
                        "ko", "동일 기간으로 보였으나 모니터링 보고서 버전 정정으로 실제 발급 구간이 분리되었습니다.",
                        "en", "The periods initially looked identical, but a monitoring report revision separated the actual issuance windows."
                ),
                "comparedCertificates", List.of(
                        mapOfObjects("certificateId", "CERT-REVIEW-0741", "companyName", "그린웨이브", "status", "ELIGIBLE"),
                        mapOfObjects("certificateId", "CERT-REISSUE-0018", "companyName", "그린웨이브", "status", "ELIGIBLE")
                )));
        return rows;
    }

    private List<MenuInfoDTO> loadMenuTreeRows(String codeId) {
        try {
            List<MenuInfoDTO> rows = new ArrayList<>(menuInfoService.selectMenuTreeList(codeId));
            rows.sort(Comparator.comparing(row -> safeString(row == null ? null : row.getCode())));
            return rows;
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private MenuInfoDTO findMenuRow(List<MenuInfoDTO> menuRows, String menuCode) {
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        if (normalizedMenuCode.isEmpty()) {
            return null;
        }
        for (MenuInfoDTO row : menuRows) {
            if (normalizedMenuCode.equalsIgnoreCase(safeString(row == null ? null : row.getCode()))) {
                return row;
            }
        }
        return null;
    }

    private List<Map<String, Object>> buildMenuAncestry(List<MenuInfoDTO> menuRows, String menuCode, boolean isEn) {
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        if (normalizedMenuCode.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> ancestryCodes = new ArrayList<>();
        if (normalizedMenuCode.length() >= 4) {
            ancestryCodes.add(normalizedMenuCode.substring(0, 4));
        }
        if (normalizedMenuCode.length() >= 6) {
            ancestryCodes.add(normalizedMenuCode.substring(0, 6));
        }
        if (normalizedMenuCode.length() >= 8) {
            ancestryCodes.add(normalizedMenuCode.substring(0, 8));
        }
        List<Map<String, Object>> ancestry = new ArrayList<>();
        for (String code : ancestryCodes) {
            MenuInfoDTO row = findMenuRow(menuRows, code);
            if (row == null) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("code", safeString(row.getCode()));
            item.put("label", isEn ? firstNonBlank(row.getCodeDc(), row.getCodeNm(), row.getCode()) : firstNonBlank(row.getCodeNm(), row.getCodeDc(), row.getCode()));
            item.put("labelKo", firstNonBlank(row.getCodeNm(), row.getCodeDc(), row.getCode()));
            item.put("labelEn", firstNonBlank(row.getCodeDc(), row.getCodeNm(), row.getCode()));
            item.put("menuUrl", safeString(row.getMenuUrl()));
            item.put("menuIcon", safeString(row.getMenuIcon()));
            item.put("sortOrdr", row.getSortOrdr());
            ancestry.add(item);
        }
        return ancestry;
    }

    private List<Map<String, String>> buildNewPageGovernanceNotes(boolean isEn,
                                                                  String requiredViewFeatureCode,
                                                                  Map<String, Object> manifest,
                                                                  List<String> featureCodes) {
        List<Map<String, String>> notes = new ArrayList<>();
        notes.add(governanceNote(
                isEn ? "Route contract" : "라우트 계약",
                isEn
                        ? "The route is bootstrap-ready and uses the same page-data contract on first render and follow-up fetch."
                        : "이 경로는 bootstrap-ready 상태이며 첫 렌더와 후속 fetch에서 같은 page-data 계약을 사용합니다."));
        notes.add(governanceNote(
                isEn ? "Authority baseline" : "권한 기준선",
                isEn
                        ? "Required VIEW feature: " + firstNonBlank(requiredViewFeatureCode, "unresolved")
                        : "필수 VIEW 기능: " + firstNonBlank(requiredViewFeatureCode, "미해결")));
        notes.add(governanceNote(
                isEn ? "Manifest coverage" : "매니페스트 범위",
                isEn
                        ? "UI manifest component count: " + stringValue(manifest == null ? null : manifest.get("componentCount"))
                        : "UI 매니페스트 컴포넌트 수: " + stringValue(manifest == null ? null : manifest.get("componentCount"))));
        notes.add(governanceNote(
                isEn ? "Feature scope" : "기능 범위",
                isEn
                        ? "Linked feature count: " + featureCodes.size()
                        : "연결 기능 수: " + featureCodes.size()));
        return notes;
    }

    private List<Map<String, Object>> buildNewPageRoleAssignments(String requiredViewFeatureCode, boolean isEn) {
        String normalizedFeatureCode = safeString(requiredViewFeatureCode).toUpperCase(Locale.ROOT);
        if (normalizedFeatureCode.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> rows = new ArrayList<>();
            for (AuthorInfoVO author : authGroupManageService.selectAuthorList()) {
                String authorCode = safeString(author == null ? null : author.getAuthorCode()).toUpperCase(Locale.ROOT);
                if (authorCode.isEmpty()) {
                    continue;
                }
                boolean assigned = authGroupManageService.hasAuthorFeaturePermission(authorCode, normalizedFeatureCode);
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("authorCode", authorCode);
                row.put("authorName", safeString(author == null ? null : author.getAuthorNm()));
                row.put("authorDescription", safeString(author == null ? null : author.getAuthorDc()));
                row.put("assigned", assigned);
                row.put("statusLabel", assigned ? (isEn ? "Granted" : "부여됨") : (isEn ? "Not granted" : "미부여"));
                row.put("statusTone", assigned ? "healthy" : "warning");
                rows.add(row);
            }
            rows.sort((left, right) -> {
                boolean leftAssigned = Boolean.TRUE.equals(left.get("assigned"));
                boolean rightAssigned = Boolean.TRUE.equals(right.get("assigned"));
                if (leftAssigned != rightAssigned) {
                    return leftAssigned ? -1 : 1;
                }
                return safeString(String.valueOf(left.get("authorCode"))).compareTo(safeString(String.valueOf(right.get("authorCode"))));
            });
            return rows;
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }

    private Map<String, String> governanceNote(String title, String description) {
        Map<String, String> note = new LinkedHashMap<>();
        note.put("title", title);
        note.put("description", description);
        return note;
    }

    private String firstNonBlank(String... candidates) {
        if (candidates == null) {
            return "";
        }
        for (String candidate : candidates) {
            String normalized = safeString(candidate);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    private int parseInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(stringValue(value));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Map<String, Object> mapOfObjects(Object... values) {
        Map<String, Object> row = new LinkedHashMap<>();
        for (int index = 0; index + 1 < values.length; index += 2) {
            row.put(String.valueOf(values[index]), values[index + 1]);
        }
        return row;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
