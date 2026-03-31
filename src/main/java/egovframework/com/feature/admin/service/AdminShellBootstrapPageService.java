package egovframework.com.feature.admin.service;

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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminShellBootstrapPageService {

    private final AdminSummaryService adminSummaryService;
    private final BackupConfigManagementService backupConfigManagementService;
    private final ObjectProvider<egovframework.com.feature.admin.web.AdminObservabilityPageService> adminObservabilityPageServiceProvider;

    private static final int SECURITY_AUDIT_BOOTSTRAP_PAGE_SIZE = 10;

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
        String normalizedAuditType = normalizeCertificateAuditType(auditType);
        String normalizedStatus = normalizeCertificateAuditStatus(status);
        String normalizedCertificateType = normalizeCertificateAuditCertificateType(certificateType);
        String normalizedStartDate = normalizeCertificateAuditDate(startDate);
        String normalizedEndDate = normalizeCertificateAuditDate(endDate);

        List<Map<String, String>> allRows = buildCertificateAuditLogRows(isEn);
        List<Map<String, String>> filteredRows = filterCertificateAuditLogRows(
                allRows,
                normalizedKeyword,
                normalizedAuditType,
                normalizedStatus,
                normalizedCertificateType,
                normalizedStartDate,
                normalizedEndDate);

        int pageSize = 10;
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int startIndex = Math.max(currentPage - 1, 0) * pageSize;
        int endIndex = Math.min(startIndex + pageSize, filteredRows.size());
        List<Map<String, String>> pagedRows = startIndex >= endIndex
                ? Collections.emptyList()
                : new ArrayList<>(filteredRows.subList(startIndex, endIndex));

        long pendingCount = filteredRows.stream().filter(row -> "PENDING".equals(safeString(row.get("statusCode")))).count();
        long rejectedCount = filteredRows.stream().filter(row -> "REJECTED".equals(safeString(row.get("statusCode")))).count();
        long reissuedCount = filteredRows.stream().filter(row -> "REISSUE".equals(safeString(row.get("auditTypeCode")))).count();
        long highRiskCount = filteredRows.stream().filter(row -> "HIGH".equals(safeString(row.get("riskLevelCode")))).count();

        response.put("isEn", isEn);
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalCount", totalCount);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", normalizedKeyword);
        response.put("auditType", normalizedAuditType);
        response.put("status", normalizedStatus);
        response.put("certificateType", normalizedCertificateType);
        response.put("startDate", normalizedStartDate);
        response.put("endDate", normalizedEndDate);
        response.put("certificateAuditSummary", List.of(
                mapOf(
                        "label", isEn ? "Pending Reviews" : "검토 대기",
                        "value", String.valueOf(pendingCount),
                        "description", isEn ? "Requests waiting for approver action." : "승인자 조치 대기 건수",
                        "tone", "warning"),
                mapOf(
                        "label", isEn ? "Rejected" : "반려",
                        "value", String.valueOf(rejectedCount),
                        "description", isEn ? "Requests returned with a rejection reason." : "반려 사유와 함께 반환된 건수",
                        "tone", "danger"),
                mapOf(
                        "label", isEn ? "Reissued" : "재발급",
                        "value", String.valueOf(reissuedCount),
                        "description", isEn ? "Cases involving renewal or reissuance." : "갱신 또는 재발급이 포함된 건수",
                        "tone", "neutral"),
                mapOf(
                        "label", isEn ? "High Risk" : "고위험",
                        "value", String.valueOf(highRiskCount),
                        "description", isEn ? "Events requiring dual review or immediate follow-up." : "이중 검토 또는 즉시 후속 조치가 필요한 이벤트",
                        "tone", "danger")));
        response.put("certificateAuditAlerts", buildCertificateAuditAlerts(filteredRows, isEn));
        response.put("certificateAuditRows", pagedRows);
        response.put("lastUpdated", safeString(allRows.isEmpty() ? "" : allRows.get(0).get("auditAt")));
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

    private List<Map<String, String>> selectCertificateMonthlyRows(List<Map<String, String>> sourceRows, String periodFilter) {
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
        response.put("pageIndex", currentPage);
        response.put("pageSize", pageSize);
        response.put("totalPages", totalPages);
        response.put("searchKeyword", safeString(searchKeyword));
        response.put("changeType", normalizedChangeType);
        response.put("changeTarget", normalizedChangeTarget);
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
        String menuManagementUrl = adminPrefix + "/system/menu-management?menuType=ADMIN";
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

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
