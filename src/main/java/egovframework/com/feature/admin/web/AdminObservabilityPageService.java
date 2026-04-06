package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.error.ErrorEventRecordVO;
import egovframework.com.common.error.ErrorEventSearchVO;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.help.HelpContentService;
import egovframework.com.common.logging.AccessEventRecordVO;
import egovframework.com.common.logging.AccessEventSearchVO;
import egovframework.com.common.logging.RequestExecutionLogPage;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.common.menu.model.SiteMapNode;
import egovframework.com.common.trace.TraceEventRecordVO;
import egovframework.com.common.trace.TraceEventSearchVO;
import egovframework.com.common.menu.service.SiteMapService;
import egovframework.com.feature.admin.mapper.AdminNotificationHistoryMapper;
import egovframework.com.feature.admin.dto.request.AdminBackupConfigSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupVersionRestoreRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupRunRequestDTO;
import egovframework.com.feature.admin.dto.response.AdminAccessHistoryRowResponse;
import egovframework.com.feature.admin.dto.response.AdminErrorLogRowResponse;
import egovframework.com.feature.admin.model.vo.EmissionResultFilterSnapshot;
import egovframework.com.feature.admin.model.vo.EmissionResultSummaryView;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.feature.admin.service.AdminSummaryService;
import egovframework.com.feature.admin.service.BackupConfigManagementService;
import egovframework.com.feature.admin.service.ExternalConnectionProfileStoreService;
import egovframework.com.platform.workbench.service.SrTicketWorkbenchService;
import egovframework.com.feature.auth.service.CurrentUserContextService;
import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import egovframework.com.feature.member.model.vo.InsttInfoVO;
import egovframework.com.feature.member.model.vo.InstitutionStatusVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import egovframework.com.platform.observability.service.ObservabilityQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.ui.ExtendedModelMap;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Comparator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AdminObservabilityPageService {

    private static final Logger log = LoggerFactory.getLogger(AdminObservabilityPageService.class);
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";
    private static final int SECURITY_AUDIT_PAGE_SIZE = 10;
    private static final int CERTIFICATE_AUDIT_LOG_PAGE_SIZE = 10;
    private static final int CERTIFICATE_AUDIT_LOG_FETCH_SIZE = 200;
    private static final int NOTIFICATION_HISTORY_PAGE_SIZE = 10;
    private static final int PERFORMANCE_REQUEST_SAMPLE_SIZE = 200;
    private static final int PERFORMANCE_HOTSPOT_LIMIT = 8;
    private static final int PERFORMANCE_SLOW_REQUEST_LIMIT = 12;
    private static final long PERFORMANCE_SLOW_THRESHOLD_MS = 1000L;

    private final AdminListPageModelAssembler adminListPageModelAssembler;
    private final AdminSystemPageModelAssembler adminSystemPageModelAssembler;
    private final AdminSummaryService adminSummaryService;
    private final AdminNotificationHistoryMapper adminNotificationHistoryMapper;
    private final ObservabilityQueryService observabilityQueryService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final EnterpriseMemberService enterpriseMemberService;
    private final CurrentUserContextService currentUserContextService;
    private final AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport;
    private final BackupConfigManagementService backupConfigManagementService;
    private final AdminApprovalPagePayloadService adminApprovalPagePayloadService;
    private final AdminMemberPagePayloadService adminMemberPagePayloadService;
    private final SrTicketWorkbenchService srTicketWorkbenchService;
    private final HelpContentService helpContentService;
    private final SiteMapService siteMapService;
    private final ExternalConnectionProfileStoreService externalConnectionProfileStoreService;
    private final AdminCertificateApprovalService adminCertificateApprovalService;
    private final ObjectMapper objectMapper;
    private final ConcurrentMap<String, String> companyNameCache = new ConcurrentHashMap<>();

    public AdminObservabilityPageService(AdminListPageModelAssembler adminListPageModelAssembler,
                                         AdminSystemPageModelAssembler adminSystemPageModelAssembler,
                                         AdminSummaryService adminSummaryService,
                                         AdminNotificationHistoryMapper adminNotificationHistoryMapper,
                                         ObservabilityQueryService observabilityQueryService,
                                         RequestExecutionLogService requestExecutionLogService,
                                         EnterpriseMemberService enterpriseMemberService,
                                         CurrentUserContextService currentUserContextService,
                                         AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport,
                                         BackupConfigManagementService backupConfigManagementService,
                                         AdminApprovalPagePayloadService adminApprovalPagePayloadService,
                                         AdminMemberPagePayloadService adminMemberPagePayloadService,
                                         SrTicketWorkbenchService srTicketWorkbenchService,
                                         HelpContentService helpContentService,
                                         SiteMapService siteMapService,
                                         ExternalConnectionProfileStoreService externalConnectionProfileStoreService,
                                         AdminCertificateApprovalService adminCertificateApprovalService,
                                         ObjectMapper objectMapper) {
        this.adminListPageModelAssembler = adminListPageModelAssembler;
        this.adminSystemPageModelAssembler = adminSystemPageModelAssembler;
        this.adminSummaryService = adminSummaryService;
        this.adminNotificationHistoryMapper = adminNotificationHistoryMapper;
        this.observabilityQueryService = observabilityQueryService;
        this.requestExecutionLogService = requestExecutionLogService;
        this.enterpriseMemberService = enterpriseMemberService;
        this.currentUserContextService = currentUserContextService;
        this.adminAuthorityPagePayloadSupport = adminAuthorityPagePayloadSupport;
        this.backupConfigManagementService = backupConfigManagementService;
        this.adminApprovalPagePayloadService = adminApprovalPagePayloadService;
        this.adminMemberPagePayloadService = adminMemberPagePayloadService;
        this.srTicketWorkbenchService = srTicketWorkbenchService;
        this.helpContentService = helpContentService;
        this.siteMapService = siteMapService;
        this.externalConnectionProfileStoreService = externalConnectionProfileStoreService;
        this.adminCertificateApprovalService = adminCertificateApprovalService;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> buildSecurityHistoryPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String insttId,
            String actionStatus,
            HttpServletRequest request,
            boolean isEn) {
        int pageIndex = parsePageIndex(pageIndexParam);
        int pageSize = 10;
        AdminListPageModelAssembler.LoginHistoryDataset dataset = adminListPageModelAssembler.loadBlockedLoginHistoryDataset(
                searchKeyword,
                userSe,
                insttId,
                request);
        List<Map<String, String>> actionRows = new ArrayList<>(adminSummaryService.getSecurityHistoryActionRows(isEn));
        Map<String, Map<String, String>> actionByHistoryKey = new LinkedHashMap<>();
        for (Map<String, String> row : actionRows) {
            String historyKey = safeString(row.get("historyKey"));
            if (historyKey.isEmpty() || actionByHistoryKey.containsKey(historyKey)) {
                continue;
            }
            actionByHistoryKey.put(historyKey, new LinkedHashMap<>(row));
        }
        String normalizedActionStatus = safeString(actionStatus).toUpperCase(Locale.ROOT);
        List<Map<String, Object>> filteredRows = new ArrayList<>();
        Map<String, Map<String, Integer>> relatedCountsByHistoryKey = new HashMap<>();
        Map<String, Integer> ipCounts = new HashMap<>();
        Map<String, Integer> userCounts = new HashMap<>();
        Map<String, Integer> companyCounts = new HashMap<>();
        Map<String, Integer> userSeSummary = new LinkedHashMap<>();

        for (egovframework.com.feature.admin.model.vo.LoginHistoryVO item : dataset.getRows()) {
            String historyKey = safeString(item.getHistId()).isEmpty()
                    ? String.join("|", safeString(item.getUserId()), safeString(item.getLoginIp()), safeString(item.getLoginPnttm()))
                    : safeString(item.getHistId());
            String latestAction = safeString(actionByHistoryKey.getOrDefault(historyKey, Map.of()).get("action")).toUpperCase(Locale.ROOT);
            boolean include = normalizedActionStatus.isEmpty()
                    || ("NONE".equals(normalizedActionStatus) && latestAction.isEmpty())
                    || normalizedActionStatus.equals(latestAction);
            if (!include) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("histId", safeString(item.getHistId()));
            row.put("userId", safeString(item.getUserId()));
            row.put("userNm", safeString(item.getUserNm()));
            row.put("userSe", safeString(item.getUserSe()));
            row.put("loginResult", safeString(item.getLoginResult()));
            row.put("loginIp", safeString(item.getLoginIp()));
            row.put("loginMessage", safeString(item.getLoginMessage()));
            row.put("loginPnttm", safeString(item.getLoginPnttm()));
            row.put("insttId", safeString(item.getInsttId()));
            row.put("companyName", safeString(item.getCompanyName()));
            filteredRows.add(row);
            incrementCount(ipCounts, safeString(item.getLoginIp()));
            incrementCount(userCounts, safeString(item.getUserId()));
            incrementCount(companyCounts, safeString(item.getInsttId()));
            incrementCount(userSeSummary, safeString(item.getUserSe()));
        }

        for (Map<String, Object> row : filteredRows) {
            String rowHistId = safeString(row.get("histId") == null ? null : String.valueOf(row.get("histId")));
            String rowUserId = safeString(row.get("userId") == null ? null : String.valueOf(row.get("userId")));
            String rowLoginIp = safeString(row.get("loginIp") == null ? null : String.valueOf(row.get("loginIp")));
            String rowLoginPnttm = safeString(row.get("loginPnttm") == null ? null : String.valueOf(row.get("loginPnttm")));
            String rowInsttId = safeString(row.get("insttId") == null ? null : String.valueOf(row.get("insttId")));
            String historyKey = rowHistId.isEmpty()
                    ? String.join("|", rowUserId, rowLoginIp, rowLoginPnttm)
                    : rowHistId;
            Map<String, Integer> related = new LinkedHashMap<>();
            related.put("sameIpCount", ipCounts.getOrDefault(rowLoginIp, 0));
            related.put("sameUserCount", userCounts.getOrDefault(rowUserId, 0));
            related.put("sameCompanyCount", companyCounts.getOrDefault(rowInsttId, 0));
            relatedCountsByHistoryKey.put(historyKey, related);
        }

        int filteredTotalCount = filteredRows.size();
        int totalPages = filteredTotalCount == 0 ? 1 : (int) Math.ceil(filteredTotalCount / (double) pageSize);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int fromIndex = Math.max(0, Math.min((currentPage - 1) * pageSize, filteredRows.size()));
        int toIndex = Math.max(fromIndex, Math.min(fromIndex + pageSize, filteredRows.size()));
        List<Map<String, Object>> pagedRows = filteredRows.isEmpty()
                ? Collections.emptyList()
                : new ArrayList<>(filteredRows.subList(fromIndex, toIndex));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("loginHistoryList", pagedRows);
        payload.put("totalCount", filteredTotalCount);
        payload.put("pageIndex", currentPage);
        payload.put("pageSize", pageSize);
        payload.put("totalPages", totalPages);
        payload.put("searchKeyword", dataset.getKeyword());
        payload.put("userSe", dataset.getNormalizedUserSe());
        payload.put("loginResult", dataset.getNormalizedLoginResult());
        payload.put("actionStatus", normalizedActionStatus);
        payload.put("companyOptions", dataset.getCompanyOptions());
        payload.put("selectedInsttId", dataset.getSelectedInsttId());
        payload.put("canManageAllCompanies", dataset.isMasterAccess());
        payload.put("securityHistoryActionRows", actionRows);
        payload.put("securityHistoryActionByHistoryKey", actionByHistoryKey);
        payload.put("securityHistoryRelatedCountByHistoryKey", relatedCountsByHistoryKey);
        payload.put("securityHistoryAggregate", Map.of(
                "uniqueIpCount", ipCounts.size(),
                "uniqueUserCount", userCounts.size(),
                "userSeSummary", userSeSummary,
                "filteredTotalCount", filteredTotalCount));
        payload.put("isEn", isEn);
        return payload;
    }

    private void incrementCount(Map<String, Integer> counts, String key) {
        if (key == null || key.isEmpty()) {
            return;
        }
        counts.put(key, counts.getOrDefault(key, 0) + 1);
    }

    private Map<String, Object> castObjectMap(Object value) {
        if (!(value instanceof Map<?, ?>)) {
            return Collections.emptyMap();
        }
        Map<?, ?> map = (Map<?, ?>) value;
        Map<String, Object> normalized = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            normalized.put(safeString(entry.getKey()), entry.getValue());
        }
        return normalized;
    }

    private Map<String, String> castStringMap(Object value) {
        if (!(value instanceof Map<?, ?>)) {
            return Collections.emptyMap();
        }
        Map<?, ?> map = (Map<?, ?>) value;
        Map<String, String> normalized = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            normalized.put(safeString(entry.getKey()), safeString(entry.getValue()));
        }
        return normalized;
    }

    private Map<String, String> summaryMetricRow(String title, String value, String description, String tone) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("value", value);
        row.put("description", description);
        row.put("tone", tone);
        return row;
    }

    private Map<String, String> quickLinkRow(String label, String targetRoute) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("targetRoute", targetRoute);
        return row;
    }

    private Map<String, String> guidanceRow(String title, String body, String tone) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("body", body);
        row.put("tone", tone);
        return row;
    }

    private List<Map<String, String>> filterNotificationDeliveryRows(List<Map<String, String>> rows,
                                                                     String deliveryChannel,
                                                                     String deliveryStatus,
                                                                     String deliveryKeyword) {
        String normalizedChannel = safeString(deliveryChannel);
        String normalizedStatus = safeString(deliveryStatus);
        String normalizedKeyword = safeString(deliveryKeyword).toLowerCase(Locale.ROOT);
        return rows.stream()
                .filter(row -> normalizedChannel.isEmpty()
                        || normalizedChannel.equals(safeString(row.get("channel")))
                        || normalizedChannel.equals(safeString(row.get("deliveryType"))))
                .filter(row -> normalizedStatus.isEmpty()
                        || normalizedStatus.equals(safeString(row.get("deliveryStatus")))
                        || normalizedStatus.equals(safeString(row.get("status"))))
                .filter(row -> normalizedKeyword.isEmpty()
                        || String.join(" ",
                                safeString(row.get("title")),
                                safeString(row.get("subject")),
                                safeString(row.get("message")),
                                safeString(row.get("description")),
                                safeString(row.get("target")))
                        .toLowerCase(Locale.ROOT)
                        .contains(normalizedKeyword))
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> filterNotificationActivityRows(List<Map<String, String>> rows,
                                                                     String activityAction,
                                                                     String activityKeyword) {
        String normalizedAction = safeString(activityAction);
        String normalizedKeyword = safeString(activityKeyword).toLowerCase(Locale.ROOT);
        return rows.stream()
                .filter(row -> normalizedAction.isEmpty()
                        || normalizedAction.equals(safeString(row.get("actionCode")))
                        || normalizedAction.equals(safeString(row.get("action"))))
                .filter(row -> normalizedKeyword.isEmpty()
                        || String.join(" ",
                                safeString(row.get("actionCode")),
                                safeString(row.get("action")),
                                safeString(row.get("summary")),
                                safeString(row.get("message")),
                                safeString(row.get("category")),
                                safeString(row.get("actorId")),
                                safeString(row.get("owner")))
                        .toLowerCase(Locale.ROOT)
                        .contains(normalizedKeyword))
                .collect(Collectors.toList());
    }

    private List<String> uniqueNotificationValues(List<Map<String, String>> rows, String... keys) {
        LinkedHashSet<String> values = new LinkedHashSet<>();
        for (Map<String, String> row : rows) {
            for (String key : keys) {
                String value = safeString(row.get(key));
                if (!value.isEmpty()) {
                    values.add(value);
                    break;
                }
            }
        }
        return new ArrayList<>(values);
    }

    public Map<String, Object> buildLoginHistoryPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String userSe,
            String loginResult,
            String insttId,
            HttpServletRequest request,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminListPageModelAssembler.populateLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                loginResult,
                insttId,
                model,
                request);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityPolicyPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityPolicyPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildNotificationPagePayload(boolean isEn,
                                                            String deliveryChannel,
                                                            String deliveryStatus,
                                                            String deliveryKeyword,
                                                            String deliveryPageParam,
                                                            String activityAction,
                                                            String activityKeyword,
                                                            String activityPageParam) {
        Map<String, Object> payload = buildSecurityPolicyPagePayload(isEn);
        Map<String, Object> diagnostics = new LinkedHashMap<>(castObjectMap(payload.get("menuPermissionDiagnostics")));
        Map<String, String> notificationConfig = castStringMap(diagnostics.get("securityInsightNotificationConfig"));
        List<Map<String, String>> snapshotDeliveryRows = castStringRowList(diagnostics.get("securityInsightDeliveryRows"));
        List<Map<String, String>> snapshotActivityRows = castStringRowList(diagnostics.get("securityInsightActivityRows"));
        List<Map<String, String>> insightItems = castStringRowList(diagnostics.get("securityInsightItems"));
        Map<String, Object> deliveryHistoryData = loadNotificationDeliveryHistory(
                snapshotDeliveryRows,
                deliveryChannel,
                deliveryStatus,
                deliveryKeyword,
                deliveryPageParam);
        Map<String, Object> activityHistoryData = loadNotificationActivityHistory(
                snapshotActivityRows,
                activityAction,
                activityKeyword,
                activityPageParam);
        List<Map<String, String>> deliveryRows = castStringRowList(deliveryHistoryData.get("allRows"));
        List<Map<String, String>> activityRows = castStringRowList(activityHistoryData.get("allRows"));
        List<Map<String, String>> filteredDeliveryRows = castStringRowList(deliveryHistoryData.get("filteredRows"));
        List<Map<String, String>> filteredActivityRows = castStringRowList(activityHistoryData.get("filteredRows"));
        List<Map<String, String>> pagedDeliveryRows = castStringRowList(deliveryHistoryData.get("pagedRows"));
        List<Map<String, String>> pagedActivityRows = castStringRowList(activityHistoryData.get("pagedRows"));
        int filteredDeliveryCount = parsePositiveInt(stringValue(deliveryHistoryData.get("filteredCount")), filteredDeliveryRows.size());
        int filteredActivityCount = parsePositiveInt(stringValue(activityHistoryData.get("filteredCount")), filteredActivityRows.size());
        int totalDeliveryCount = parsePositiveInt(stringValue(deliveryHistoryData.get("totalCount")), deliveryRows.size());
        int totalActivityCount = parsePositiveInt(stringValue(activityHistoryData.get("totalCount")), activityRows.size());
        int deliveryCurrentPage = parsePositiveInt(stringValue(deliveryHistoryData.get("page")), 1);
        int deliveryTotalPages = parsePositiveInt(stringValue(deliveryHistoryData.get("totalPages")), 1);
        int activityCurrentPage = parsePositiveInt(stringValue(activityHistoryData.get("page")), 1);
        int activityTotalPages = parsePositiveInt(stringValue(activityHistoryData.get("totalPages")), 1);

        diagnostics.put("securityInsightDeliveryRows", pagedDeliveryRows);
        diagnostics.put("securityInsightActivityRows", pagedActivityRows);
        payload.put("menuPermissionDiagnostics", diagnostics);

        int enabledChannelCount = 0;
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("slackEnabled")))) {
            enabledChannelCount++;
        }
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("mailEnabled")))) {
            enabledChannelCount++;
        }
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("webhookEnabled")))) {
            enabledChannelCount++;
        }

        int routingIssueCount = 0;
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("slackEnabled")))
                && safeString(notificationConfig.get("slackChannel")).isEmpty()) {
            routingIssueCount++;
        }
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("mailEnabled")))
                && safeString(notificationConfig.get("mailRecipients")).isEmpty()) {
            routingIssueCount++;
        }
        if ("Y".equalsIgnoreCase(safeString(notificationConfig.get("webhookEnabled")))
                && safeString(notificationConfig.get("webhookUrl")).isEmpty()) {
            routingIssueCount++;
        }

        int deliveryFailureCount = (int) filteredDeliveryRows.stream()
                .filter(row -> {
                    String status = safeString(row.get("deliveryStatus"));
                    if (status.isEmpty()) {
                        status = safeString(row.get("status"));
                    }
                    String upper = status.toUpperCase(Locale.ROOT);
                    return upper.contains("FAIL") || upper.contains("ERROR") || upper.contains("BLOCK");
                })
                .count();

        int pendingCriticalFindings = (int) insightItems.stream()
                .filter(row -> "CRITICAL".equalsIgnoreCase(safeString(row.get("severity"))))
                .count();

        payload.put("notificationCenterSummary", List.of(
                summaryMetricRow(
                        isEn ? "Enabled Channels" : "활성 채널",
                        enabledChannelCount + "/3",
                        isEn ? "Slack, mail, webhook active count" : "Slack, 메일, Webhook 활성 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Delivery Failures" : "발송 실패",
                        String.valueOf(deliveryFailureCount),
                        isEn ? "Recent blocked or failed deliveries" : "최근 차단 또는 실패 건수",
                        deliveryFailureCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Routing Issues" : "라우팅 점검",
                        String.valueOf(routingIssueCount),
                        isEn ? "Missing channel destination or webhook target" : "채널 목적지 또는 Webhook 대상 누락",
                        routingIssueCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Critical Findings" : "Critical 탐지",
                        String.valueOf(pendingCriticalFindings),
                        isEn ? "Potential urgent alerts from policy diagnostics" : "정책 진단 기준 긴급 발송 후보",
                        pendingCriticalFindings > 0 ? "danger" : "neutral")));
        payload.put("notificationCenterQuickLinks", List.of(
                quickLinkRow(isEn ? "Security Policy" : "보안 정책", localizedAdminPath("/system/security-policy", isEn)),
                quickLinkRow(isEn ? "Security Monitoring" : "보안 모니터링", localizedAdminPath("/system/security-monitoring", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn))));
        payload.put("notificationCenterFilterOptions", Map.of(
                "deliveryChannels", uniqueNotificationValues(snapshotDeliveryRows.isEmpty() ? deliveryRows : snapshotDeliveryRows, "channel", "deliveryType", "mode"),
                "deliveryStatuses", uniqueNotificationValues(snapshotDeliveryRows.isEmpty() ? deliveryRows : snapshotDeliveryRows, "deliveryStatus", "status"),
                "activityActions", uniqueNotificationValues(snapshotActivityRows.isEmpty() ? activityRows : snapshotActivityRows, "actionCode", "action")));
        payload.put("notificationCenterGuidance", List.of(
                guidanceRow(
                        isEn ? "Critical" : "Critical",
                        isEn ? "Use immediate Slack or mail delivery for urgent security and runtime failures." : "긴급 보안 이슈와 런타임 장애는 Slack 또는 메일 즉시 발송으로 운영합니다.",
                        "danger"),
                guidanceRow(
                        isEn ? "High" : "High",
                        isEn ? "Keep daily digest on and require owner acknowledgement for recurring alerts." : "반복 알림은 일일 요약을 유지하고 담당자 확인 흐름과 같이 관리합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Check Logs" : "로그 확인",
                        isEn ? "If routing looks healthy but delivery still fails, inspect the unified log and monitoring pages." : "라우팅은 정상인데 발송이 실패하면 통합 로그와 보안 모니터링 화면에서 상세 원인을 확인합니다.",
                        "neutral")));
        Map<String, Object> notificationCenterMeta = new LinkedHashMap<>();
        notificationCenterMeta.put("enabledChannelCount", enabledChannelCount);
        notificationCenterMeta.put("deliveryFailureCount", deliveryFailureCount);
        notificationCenterMeta.put("routingIssueCount", routingIssueCount);
        notificationCenterMeta.put("pendingCriticalFindings", pendingCriticalFindings);
        notificationCenterMeta.put("deliveryCount", pagedDeliveryRows.size());
        notificationCenterMeta.put("activityCount", pagedActivityRows.size());
        notificationCenterMeta.put("filteredDeliveryCount", filteredDeliveryCount);
        notificationCenterMeta.put("filteredActivityCount", filteredActivityCount);
        notificationCenterMeta.put("totalDeliveryCount", totalDeliveryCount);
        notificationCenterMeta.put("totalActivityCount", totalActivityCount);
        notificationCenterMeta.put("deliveryChannel", safeString(deliveryChannel));
        notificationCenterMeta.put("deliveryStatus", safeString(deliveryStatus));
        notificationCenterMeta.put("deliveryKeyword", safeString(deliveryKeyword));
        notificationCenterMeta.put("deliveryPage", deliveryCurrentPage);
        notificationCenterMeta.put("deliveryPageSize", NOTIFICATION_HISTORY_PAGE_SIZE);
        notificationCenterMeta.put("deliveryTotalPages", deliveryTotalPages);
        notificationCenterMeta.put("deliveryHistoryRetentionLimit", 500);
        notificationCenterMeta.put("activityAction", safeString(activityAction));
        notificationCenterMeta.put("activityKeyword", safeString(activityKeyword));
        notificationCenterMeta.put("activityPage", activityCurrentPage);
        notificationCenterMeta.put("activityPageSize", NOTIFICATION_HISTORY_PAGE_SIZE);
        notificationCenterMeta.put("activityTotalPages", activityTotalPages);
        notificationCenterMeta.put("activityHistoryRetentionLimit", 500);
        payload.put("notificationCenterMeta", notificationCenterMeta);
        return payload;
    }

    private Map<String, Object> loadNotificationDeliveryHistory(List<Map<String, String>> snapshotRows,
                                                                String deliveryChannel,
                                                                String deliveryStatus,
                                                                String deliveryKeyword,
                                                                String deliveryPageParam) {
        Map<String, Object> params = buildNotificationHistoryParams(deliveryPageParam);
        params.put("deliveryChannel", safeString(deliveryChannel));
        params.put("deliveryStatus", safeString(deliveryStatus));
        params.put("deliveryKeyword", safeString(deliveryKeyword));
        try {
            int totalCount = adminNotificationHistoryMapper.countDeliveryHistory(params);
            List<Map<String, String>> pagedRows = adminNotificationHistoryMapper.selectDeliveryHistory(params);
            if (totalCount > 0 || !pagedRows.isEmpty()) {
                List<Map<String, String>> allRows = normalizeNotificationDeliveryRows(pagedRows);
                int totalPages = Math.max(1, (int) Math.ceil(totalCount / (double) NOTIFICATION_HISTORY_PAGE_SIZE));
                return Map.of(
                        "allRows", allRows,
                        "filteredRows", allRows,
                        "pagedRows", allRows,
                        "filteredCount", totalCount,
                        "totalCount", totalCount,
                        "page", parsePositiveInt(stringValue(params.get("page")), 1),
                        "totalPages", totalPages);
            }
        } catch (Exception e) {
            log.debug("Notification delivery history table lookup failed. Falling back to snapshot rows.", e);
        }
        List<Map<String, String>> filteredRows = filterNotificationDeliveryRows(snapshotRows, deliveryChannel, deliveryStatus, deliveryKeyword);
        Map<String, Object> pagination = paginateNotificationRows(filteredRows, deliveryPageParam);
        return Map.of(
                "allRows", snapshotRows,
                "filteredRows", filteredRows,
                "pagedRows", castStringRowList(pagination.get("rows")),
                "filteredCount", filteredRows.size(),
                "totalCount", snapshotRows.size(),
                "page", pagination.get("page"),
                "totalPages", pagination.get("totalPages"));
    }

    private Map<String, Object> loadNotificationActivityHistory(List<Map<String, String>> snapshotRows,
                                                                String activityAction,
                                                                String activityKeyword,
                                                                String activityPageParam) {
        Map<String, Object> params = buildNotificationHistoryParams(activityPageParam);
        params.put("activityAction", safeString(activityAction));
        params.put("activityKeyword", safeString(activityKeyword));
        try {
            int totalCount = adminNotificationHistoryMapper.countActivityHistory(params);
            List<Map<String, String>> pagedRows = adminNotificationHistoryMapper.selectActivityHistory(params);
            if (totalCount > 0 || !pagedRows.isEmpty()) {
                List<Map<String, String>> allRows = normalizeNotificationActivityRows(pagedRows);
                int totalPages = Math.max(1, (int) Math.ceil(totalCount / (double) NOTIFICATION_HISTORY_PAGE_SIZE));
                return Map.of(
                        "allRows", allRows,
                        "filteredRows", allRows,
                        "pagedRows", allRows,
                        "filteredCount", totalCount,
                        "totalCount", totalCount,
                        "page", parsePositiveInt(stringValue(params.get("page")), 1),
                        "totalPages", totalPages);
            }
        } catch (Exception e) {
            log.debug("Notification activity history table lookup failed. Falling back to snapshot rows.", e);
        }
        List<Map<String, String>> filteredRows = filterNotificationActivityRows(snapshotRows, activityAction, activityKeyword);
        Map<String, Object> pagination = paginateNotificationRows(filteredRows, activityPageParam);
        return Map.of(
                "allRows", snapshotRows,
                "filteredRows", filteredRows,
                "pagedRows", castStringRowList(pagination.get("rows")),
                "filteredCount", filteredRows.size(),
                "totalCount", snapshotRows.size(),
                "page", pagination.get("page"),
                "totalPages", pagination.get("totalPages"));
    }

    private Map<String, Object> buildNotificationHistoryParams(String pageParam) {
        int page = parsePageIndex(pageParam);
        int offset = Math.max(0, (page - 1) * NOTIFICATION_HISTORY_PAGE_SIZE);
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("page", page);
        params.put("pageSize", NOTIFICATION_HISTORY_PAGE_SIZE);
        params.put("offset", offset);
        return params;
    }

    private List<Map<String, String>> normalizeNotificationDeliveryRows(List<Map<String, String>> rows) {
        return rows == null ? Collections.emptyList() : rows.stream()
                .map(row -> {
                    Map<String, String> normalized = new LinkedHashMap<>(row);
                    normalized.put("channel", firstNonBlank(safeString(row.get("deliveryType")), safeString(row.get("channel"))));
                    normalized.put("status", firstNonBlank(safeString(row.get("deliveryStatus")), safeString(row.get("status"))));
                    normalized.put("message", firstNonBlank(safeString(row.get("message")), safeString(row.get("deliveryDetail"))));
                    return normalized;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> normalizeNotificationActivityRows(List<Map<String, String>> rows) {
        return rows == null ? Collections.emptyList() : rows.stream()
                .map(row -> {
                    Map<String, String> normalized = new LinkedHashMap<>(row);
                    normalized.put("action", firstNonBlank(safeString(row.get("actionCode")), safeString(row.get("action"))));
                    normalized.put("owner", firstNonBlank(safeString(row.get("actorId")), safeString(row.get("owner"))));
                    return normalized;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> paginateNotificationRows(List<Map<String, String>> rows, String pageParam) {
        List<Map<String, String>> safeRows = rows == null ? Collections.emptyList() : rows;
        int totalCount = safeRows.size();
        int totalPages = Math.max(1, (int) Math.ceil(totalCount / (double) NOTIFICATION_HISTORY_PAGE_SIZE));
        int requestedPage = parsePageIndex(pageParam);
        int currentPage = Math.max(1, Math.min(requestedPage, totalPages));
        int fromIndex = Math.min((currentPage - 1) * NOTIFICATION_HISTORY_PAGE_SIZE, totalCount);
        int toIndex = Math.min(fromIndex + NOTIFICATION_HISTORY_PAGE_SIZE, totalCount);

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("rows", totalCount == 0
                ? Collections.<Map<String, String>>emptyList()
                : new ArrayList<>(safeRows.subList(fromIndex, toIndex)));
        pagination.put("page", currentPage);
        pagination.put("pageSize", NOTIFICATION_HISTORY_PAGE_SIZE);
        pagination.put("totalPages", totalPages);
        pagination.put("totalCount", totalCount);
        return pagination;
    }

    public Map<String, Object> buildSecurityMonitoringPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityMonitoringPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildPerformancePagePayload(HttpServletRequest request, boolean isEn) {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = Math.max(0L, totalMemory - freeMemory);
        long availableMemory = Math.max(0L, maxMemory - usedMemory);
        int processors = runtime.availableProcessors();

        List<RequestExecutionLogVO> logs = requestExecutionLogService
                .searchRecent(this::isPerformanceLogCandidate, 1, PERFORMANCE_REQUEST_SAMPLE_SIZE)
                .getItems();
        List<RequestExecutionLogVO> meaningfulLogs = logs.stream()
                .filter(this::isMeaningfulPerformanceLog)
                .collect(Collectors.toList());
        List<Long> durations = meaningfulLogs.stream()
                .map(RequestExecutionLogVO::getDurationMs)
                .filter(duration -> duration > 0L)
                .sorted()
                .collect(Collectors.toList());
        long requestCount = meaningfulLogs.size();
        long slowCount = meaningfulLogs.stream().filter(this::isSlowPerformanceLog).count();
        long errorCount = meaningfulLogs.stream().filter(this::isErrorPerformanceLog).count();
        long averageDurationMs = durations.isEmpty()
                ? 0L
                : Math.round(durations.stream().mapToLong(Long::longValue).average().orElse(0D));
        long p95DurationMs = durations.isEmpty() ? 0L : durations.get((int) Math.min(durations.size() - 1, Math.ceil(durations.size() * 0.95D) - 1));
        long maxDurationMs = durations.isEmpty() ? 0L : durations.get(durations.size() - 1);
        int heapUsagePercent = maxMemory <= 0L ? 0 : (int) Math.round((usedMemory * 100D) / maxMemory);
        int slowRatePercent = requestCount == 0L ? 0 : (int) Math.round((slowCount * 100D) / requestCount);
        int errorRatePercent = requestCount == 0L ? 0 : (int) Math.round((errorCount * 100D) / requestCount);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("overallStatus", resolvePerformanceStatus(heapUsagePercent, slowRatePercent, errorRatePercent));
        payload.put("refreshedAt", LocalDateTime.now().toString().replace('T', ' '));
        payload.put("slowThresholdMs", PERFORMANCE_SLOW_THRESHOLD_MS);
        payload.put("requestWindowSize", PERFORMANCE_REQUEST_SAMPLE_SIZE);
        payload.put("runtimeSummary", List.of(
                summaryMetricRow(
                        isEn ? "Heap Usage" : "힙 사용률",
                        heapUsagePercent + "%",
                        isEn ? formatBytes(usedMemory) + " used of " + formatBytes(maxMemory) : formatBytes(maxMemory) + " 중 " + formatBytes(usedMemory) + " 사용",
                        heapUsagePercent >= 85 ? "danger" : heapUsagePercent >= 70 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Heap Headroom" : "가용 메모리",
                        formatBytes(availableMemory),
                        isEn ? "Remaining memory before max heap" : "최대 힙 대비 남은 메모리",
                        availableMemory <= 256L * 1024L * 1024L ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "vCPU Threads" : "가용 프로세서",
                        String.valueOf(processors),
                        isEn ? "Runtime available processors" : "런타임이 인식한 프로세서 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Observed Requests" : "관측 요청 수",
                        String.valueOf(requestCount),
                        isEn ? "Recent request executions in the current sample" : "현재 샘플에서 최근 요청 실행 수",
                        requestCount == 0L ? "warning" : "neutral")));
        payload.put("requestSummary", List.of(
                summaryMetricRow(
                        isEn ? "Average Duration" : "평균 응답시간",
                        formatDurationMs(averageDurationMs),
                        isEn ? "Average across recent non-static requests" : "최근 비정적 요청 기준 평균",
                        averageDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "p95 Duration" : "p95 응답시간",
                        formatDurationMs(p95DurationMs),
                        isEn ? "95th percentile from the current sample" : "현재 샘플 기준 95퍼센타일",
                        p95DurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Slow Request Rate" : "지연 요청 비율",
                        slowRatePercent + "%",
                        isEn ? slowCount + " requests exceeded " + PERFORMANCE_SLOW_THRESHOLD_MS + "ms" : PERFORMANCE_SLOW_THRESHOLD_MS + "ms 초과 " + slowCount + "건",
                        slowRatePercent >= 20 ? "danger" : slowRatePercent >= 10 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Error Rate" : "오류 비율",
                        errorRatePercent + "%",
                        isEn ? errorCount + " requests returned error responses" : "오류 응답 " + errorCount + "건",
                        errorRatePercent >= 10 ? "danger" : errorRatePercent > 0 ? "warning" : "neutral")));
        payload.put("hotspotRoutes", buildPerformanceHotspotRoutes(meaningfulLogs, isEn));
        payload.put("recentSlowRequests", buildRecentSlowPerformanceRows(meaningfulLogs, isEn));
        payload.put("responseStatusSummary", buildPerformanceResponseStatusSummary(meaningfulLogs, maxDurationMs, isEn));
        payload.put("quickLinks", List.of(
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)),
                quickLinkRow(isEn ? "Error Log" : "에러 로그", localizedAdminPath("/system/error-log", isEn)),
                quickLinkRow(isEn ? "Operations Center" : "운영센터", localizedAdminPath("/monitoring/center", isEn))));
        payload.put("guidance", List.of(
                guidanceRow(
                        isEn ? "Interpretation" : "해석 기준",
                        isEn ? "This screen uses the latest request execution sample, not a long-term APM time series." : "이 화면은 장기 APM 시계열이 아니라 최근 요청 실행 샘플을 기준으로 합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "When p95 spikes" : "p95 급증 시",
                        isEn ? "Open observability or unified log with the same route to compare trace, status, and actor context." : "같은 경로를 추적 조회 또는 통합 로그에서 열어 trace, 상태, 사용자 맥락을 함께 확인합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "When heap rises" : "메모리 상승 시",
                        isEn ? "If heap usage stays high after traffic calms down, inspect scheduler, cache, or repeated admin batch execution." : "트래픽이 잦아든 뒤에도 힙 사용률이 높으면 스케줄러, 캐시, 반복 배치 실행을 점검합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildOperationsCenterPagePayload(HttpServletRequest request, boolean isEn) {
        Locale locale = request != null && request.getLocale() != null
                ? request.getLocale()
                : (isEn ? Locale.ENGLISH : Locale.KOREAN);
        Map<String, Object> monitoringPayload = buildSecurityMonitoringPagePayload(isEn);
        Map<String, Object> schedulerPayload = buildSchedulerPagePayload("", "", isEn);
        Map<String, Object> errorPayload = buildErrorLogPagePayload("1", "", "", "", "", request, isEn);
        Map<String, Object> auditPayload = buildSecurityAuditPagePayload("1", "", "", "", "", "", "AUDIT_AT", "DESC", isEn);
        Map<String, Object> memberApprovePayload = adminApprovalPagePayloadService.buildMemberApprovePagePayload("1", "", "", "A", "", request, locale);
        Map<String, Object> companyApprovePayload = adminApprovalPagePayloadService.buildCompanyApprovePagePayload("1", "", "A", "", request, locale);
        Map<String, Object> memberListPayload = adminMemberPagePayloadService.buildMemberListPagePayload("1", "", "", "", request, locale);
        Map<String, Object> companyListPayload = adminMemberPagePayloadService.buildCompanyListPagePayload("1", "", "", request, locale);
        Map<String, Object> withdrawnMemberPayload = adminMemberPagePayloadService.buildMemberListPagePayload("1", "", "", "D", request, locale);
        Map<String, Object> dormantMemberPayload = adminMemberPagePayloadService.buildMemberListPagePayload("1", "", "", "X", request, locale);
        Map<String, Object> blockedCompanyPayload = adminMemberPagePayloadService.buildCompanyListPagePayload("1", "", "X", request, locale);
        Map<String, Object> srWorkbenchPayload = loadSrWorkbenchPayload();
        Map<String, Object> operationsCenterHelpPayload = helpContentService.getPageHelpForAdmin("operations-center");
        EmissionResultFilterSnapshot emissionSnapshot = adminSummaryService.buildEmissionResultFilterSnapshot(isEn, "", "", "");

        List<Map<String, String>> monitoringCards = castStringRowList(monitoringPayload.get("securityMonitoringCards"));
        List<Map<String, String>> monitoringEvents = castStringRowList(monitoringPayload.get("securityMonitoringEvents"));
        List<Map<String, String>> schedulerSummary = castStringRowList(schedulerPayload.get("schedulerSummary"));
        List<Map<String, String>> schedulerExecutions = castStringRowList(schedulerPayload.get("schedulerExecutionRows"));
        List<Map<String, String>> errorRows = castStringRowList(errorPayload.get("errorLogList"));
        List<Map<String, String>> securityAuditRows = castStringRowList(auditPayload.get("securityAuditRows"));
        List<Map<String, String>> memberApprovalRows = castStringRowList(memberApprovePayload.get("approvalRows"));
        List<Map<String, String>> companyApprovalRows = castStringRowList(companyApprovePayload.get("approvalRows"));
        int memberApprovalCount = parseCount(memberApprovePayload.get("memberApprovalTotalCount"));
        int companyApprovalCount = parseCount(companyApprovePayload.get("memberApprovalTotalCount"));
        int memberCount = parseCount(memberListPayload.get("totalCount"));
        int companyCount = parseCount(companyListPayload.get("totalCount"));
        int withdrawnMemberCount = parseCount(withdrawnMemberPayload.get("totalCount"));
        int dormantMemberCount = parseCount(dormantMemberPayload.get("totalCount"));
        int blockedCompanyCount = parseCount(blockedCompanyPayload.get("totalCount"));
        List<Map<String, String>> srTicketRows = castStringRowList(srWorkbenchPayload.get("tickets"));
        int srTicketCount = parseCount(srWorkbenchPayload.get("ticketCount"));
        int srStackCount = parseCount(srWorkbenchPayload.get("stackCount"));
        boolean codexEnabled = Boolean.parseBoolean(stringValue(srWorkbenchPayload.get("codexEnabled")));
        int operationsCenterHelpStepCount = countListEntries(operationsCenterHelpPayload.get("items"));
        boolean operationsCenterHelpActive = !"N".equalsIgnoreCase(stringValue(operationsCenterHelpPayload.get("activeYn")));
        List<?> adminSitemapSections = loadAdminSitemapSections(request);
        int adminSitemapSectionCount = countListEntries(adminSitemapSections);
        Map<String, String> integrationSignals = buildIntegrationSignals();
        Map<String, String> contentSignals = buildContentSignals(adminSitemapSections, operationsCenterHelpPayload, isEn);
        Map<String, String> operationsToolSignals = buildOperationsToolSignals(srTicketRows, codexEnabled, isEn);
        Map<String, String> memberSignals = buildMemberSignals(
                memberApprovalCount,
                companyApprovalCount,
                withdrawnMemberCount,
                dormantMemberCount,
                blockedCompanyCount,
                memberCount,
                companyCount,
                isEn);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("overallStatus", resolveOperationsCenterOverallStatus(
                monitoringEvents,
                errorRows,
                schedulerExecutions,
                memberApprovalCount,
                companyApprovalCount,
                emissionSnapshot));
        payload.put("refreshedAt", LocalDateTime.now().toString().replace('T', ' '));
        payload.put("summaryCards", buildOperationsCenterSummaryCards(
                memberApprovalCount,
                companyApprovalCount,
                memberCount,
                companyCount,
                srTicketCount,
                memberSignals,
                integrationSignals,
                contentSignals,
                operationsToolSignals,
                emissionSnapshot,
                monitoringEvents,
                errorRows,
                schedulerSummary,
                isEn));
        payload.put("priorityItems", buildOperationsCenterPriorityItems(
                memberApprovalRows,
                companyApprovalRows,
                emissionSnapshot.getItems(),
                srTicketRows,
                buildIntegrationPriorityItems(isEn),
                buildContentPriorityItems(adminSitemapSections, operationsCenterHelpPayload, contentSignals, isEn),
                monitoringEvents,
                errorRows,
                schedulerExecutions,
                isEn));
        payload.put("widgetGroups", buildOperationsCenterWidgetGroups(
                memberApprovalCount,
                companyApprovalCount,
                memberCount,
                companyCount,
                emissionSnapshot,
                srTicketCount,
                srStackCount,
                codexEnabled,
                integrationSignals,
                adminSitemapSectionCount,
                operationsCenterHelpStepCount,
                operationsCenterHelpActive,
                monitoringCards,
                errorRows,
                schedulerSummary,
                securityAuditRows,
                isEn));
        payload.put("navigationSections", buildOperationsCenterNavigationSections(isEn));
        payload.put("recentActions", buildOperationsCenterRecentActions(securityAuditRows, isEn));
        payload.put("playbooks", buildOperationsCenterPlaybooks(isEn));
        return payload;
    }

    public Map<String, Object> buildSensorListPagePayload(boolean isEn) {
        Map<String, Object> monitoringPayload = buildSecurityMonitoringPagePayload(isEn);
        List<Map<String, String>> monitoringEvents = castStringRowList(monitoringPayload.get("securityMonitoringEvents"));
        List<Map<String, String>> activityRows = castStringRowList(monitoringPayload.get("securityMonitoringActivityRows"));
        List<Map<String, String>> blockCandidateRows = castStringRowList(monitoringPayload.get("securityMonitoringBlockCandidates"));
        List<Map<String, String>> sensorRows = buildSensorListRows(monitoringEvents, blockCandidateRows, isEn);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().toString().replace('T', ' '));
        payload.put("totalCount", sensorRows.size());
        payload.put("sensorSummary", buildSensorListSummary(sensorRows, blockCandidateRows, isEn));
        payload.put("sensorRows", sensorRows);
        payload.put("sensorActivityRows", activityRows);
        return payload;
    }

    public Map<String, Object> buildBlocklistPagePayload(
            String searchKeyword,
            String blockType,
            String status,
            String source,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateBlocklistPage(searchKeyword, blockType, status, source, model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityAuditPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String actionType,
            String routeGroup,
            String startDate,
            String endDate,
            String sortKey,
            String sortDirection,
            boolean isEn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        int pageIndex = parsePageIndex(pageIndexParam);
        String normalizedKeyword = safeString(searchKeyword);
        String normalizedActionType = normalizeSecurityAuditActionType(actionType);
        String normalizedRouteGroup = normalizeSecurityAuditRouteGroup(routeGroup);
        String normalizedStartDate = normalizeSecurityAuditDate(startDate);
        String normalizedEndDate = normalizeSecurityAuditDate(endDate);
        String normalizedSortKey = normalizeSecurityAuditSortKey(sortKey);
        String normalizedSortDirection = normalizeSecurityAuditSortDirection(sortDirection);
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        List<Map<String, String>> allRows = adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn);
        List<Map<String, String>> filteredRows = filterAndSortSecurityAuditRows(
                allRows,
                normalizedKeyword,
                normalizedActionType,
                normalizedRouteGroup,
                normalizedStartDate,
                normalizedEndDate,
                normalizedSortKey,
                normalizedSortDirection);
        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) SECURITY_AUDIT_PAGE_SIZE);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int startIndex = Math.max(currentPage - 1, 0) * SECURITY_AUDIT_PAGE_SIZE;
        int endIndex = Math.min(startIndex + SECURITY_AUDIT_PAGE_SIZE, filteredRows.size());
        List<Map<String, String>> pagedRows = startIndex >= endIndex
                ? Collections.emptyList()
                : new ArrayList<>(filteredRows.subList(startIndex, endIndex));

        payload.put("isEn", isEn);
        payload.put("pageIndex", currentPage);
        payload.put("pageSize", SECURITY_AUDIT_PAGE_SIZE);
        payload.put("totalCount", totalCount);
        payload.put("totalPages", totalPages);
        payload.put("searchKeyword", normalizedKeyword);
        payload.put("actionType", normalizedActionType);
        payload.put("routeGroup", normalizedRouteGroup);
        payload.put("startDate", normalizedStartDate);
        payload.put("endDate", normalizedEndDate);
        payload.put("sortKey", normalizedSortKey);
        payload.put("sortDirection", normalizedSortDirection);
        payload.put("filteredBlockedCount", filteredRows.stream().filter(this::isBlockedSecurityAuditRow).count());
        payload.put("filteredAllowedCount", filteredRows.stream().filter(this::isAllowedSecurityAuditRow).count());
        payload.put("filteredUniqueActorCount", filteredRows.stream()
                .map(row -> extractSecurityAuditActorId(safeString(row.get("actor"))))
                .filter(value -> !value.isEmpty())
                .distinct()
                .count());
        payload.put("filteredRouteCount", filteredRows.stream()
                .map(row -> safeString(row.get("target")))
                .filter(value -> !value.isEmpty())
                .distinct()
                .count());
        payload.put("filteredErrorCount", filteredRows.stream().filter(this::isSecurityAuditErrorRow).count());
        payload.put("filteredSlowCount", filteredRows.stream().filter(this::isSecurityAuditSlowRow).count());
        payload.put("filteredRepeatedActorCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> extractSecurityAuditActorId(safeString(row.get("actor")))));
        payload.put("filteredRepeatedTargetCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> safeString(row.get("target"))));
        payload.put("filteredRepeatedRemoteAddrCount",
                countRepeatedSecurityAuditValues(filteredRows, row -> safeString(row.get("remoteAddr"))));
        payload.put("latestSecurityAuditRow", filteredRows.isEmpty() ? null : filteredRows.get(0));
        payload.put("securityAuditSummary", adminSummaryService.getSecurityAuditSummary(auditSnapshot, isEn));
        payload.put("securityAuditRepeatedActors",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> extractSecurityAuditActorId(safeString(row.get("actor"))),
                        isEn ? "Actor" : "수행자"));
        payload.put("securityAuditRepeatedTargets",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> safeString(row.get("target")),
                        isEn ? "Target Route" : "대상 경로"));
        payload.put("securityAuditRepeatedRemoteAddrs",
                buildRepeatedSecurityAuditRows(filteredRows,
                        row -> safeString(row.get("remoteAddr")),
                        isEn ? "Remote IP" : "원격 IP"));
        payload.put("securityAuditRows", pagedRows);
        return payload;
    }

    public Map<String, Object> buildCertificateAuditLogPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String auditType,
            String status,
            String certificateType,
            String startDate,
            String endDate,
            boolean isEn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        int pageIndex = parsePageIndex(pageIndexParam);
        String normalizedKeyword = safeString(searchKeyword);
        String normalizedAuditType = normalizeCertificateAuditType(auditType);
        String normalizedStatus = normalizeCertificateAuditStatus(status);
        String normalizedCertificateType = normalizeCertificateAuditCertificateType(certificateType);
        String normalizedStartDate = normalizeSecurityAuditDate(startDate);
        String normalizedEndDate = normalizeSecurityAuditDate(endDate);

        Map<String, Map<String, Object>> approvalSnapshotById = adminCertificateApprovalService.buildAuditSnapshotRows().stream()
                .collect(Collectors.toMap(
                        row -> safeString(row.get("certificateNo")),
                        row -> row,
                        (left, right) -> left,
                        LinkedHashMap::new));

        List<Map<String, String>> mergedRows = new ArrayList<>();
        for (Map<String, Object> row : approvalSnapshotById.values()) {
            String rowStatus = safeString(row.get("status")).toUpperCase(Locale.ROOT);
            if ("PENDING".equals(rowStatus) || "HOLD".equals(rowStatus)) {
                mergedRows.add(buildPendingCertificateAuditRow(row, isEn));
            }
        }

        AuditEventSearchVO searchVO = new AuditEventSearchVO();
        searchVO.setFirstIndex(0);
        searchVO.setRecordCountPerPage(CERTIFICATE_AUDIT_LOG_FETCH_SIZE);
        searchVO.setMenuCode("AMENU_CERTIFICATE_APPROVE");
        searchVO.setPageId("certificate-approve");
        searchVO.setResultStatus("SUCCESS");

        for (AuditEventRecordVO item : observabilityQueryService.selectAuditEventList(searchVO)) {
            if (!safeString(item.getActionCode()).startsWith("CERTIFICATE_APPROVAL_")) {
                continue;
            }
            for (String certificateId : extractCertificateAuditEntityIds(item)) {
                Map<String, Object> snapshot = approvalSnapshotById.getOrDefault(certificateId, Collections.emptyMap());
                mergedRows.add(buildPersistedCertificateAuditRow(item, certificateId, snapshot, isEn));
            }
        }

        List<Map<String, String>> filteredRows = filterCertificateAuditRows(
                mergedRows,
                normalizedKeyword,
                normalizedAuditType,
                normalizedStatus,
                normalizedCertificateType,
                normalizedStartDate,
                normalizedEndDate);

        int totalCount = filteredRows.size();
        int totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) CERTIFICATE_AUDIT_LOG_PAGE_SIZE);
        int currentPage = Math.max(1, Math.min(pageIndex, totalPages));
        int startIndex = Math.max(currentPage - 1, 0) * CERTIFICATE_AUDIT_LOG_PAGE_SIZE;
        int endIndex = Math.min(startIndex + CERTIFICATE_AUDIT_LOG_PAGE_SIZE, filteredRows.size());
        List<Map<String, String>> pagedRows = startIndex >= endIndex
                ? Collections.emptyList()
                : new ArrayList<>(filteredRows.subList(startIndex, endIndex));

        long pendingCount = filteredRows.stream().filter(row -> "PENDING".equals(safeString(row.get("statusCode")))).count();
        long rejectedCount = filteredRows.stream().filter(row -> "REJECTED".equals(safeString(row.get("statusCode")))).count();
        long reissuedCount = filteredRows.stream().filter(row -> "REISSUE".equals(safeString(row.get("auditTypeCode")))).count();
        long highRiskCount = filteredRows.stream().filter(row -> "HIGH".equals(safeString(row.get("riskLevelCode")))).count();

        payload.put("isEn", isEn);
        payload.put("pageIndex", currentPage);
        payload.put("pageSize", CERTIFICATE_AUDIT_LOG_PAGE_SIZE);
        payload.put("totalCount", totalCount);
        payload.put("totalPages", totalPages);
        payload.put("searchKeyword", normalizedKeyword);
        payload.put("auditType", normalizedAuditType);
        payload.put("status", normalizedStatus);
        payload.put("certificateType", normalizedCertificateType);
        payload.put("startDate", normalizedStartDate);
        payload.put("endDate", normalizedEndDate);
        payload.put("lastUpdated", filteredRows.isEmpty() ? "" : safeString(filteredRows.get(0).get("auditAt")));
        payload.put("certificateAuditSummary", List.of(
                metricRow(isEn ? "Pending Reviews" : "검토 대기", String.valueOf(pendingCount),
                        isEn ? "Requests still waiting for certificate approval or supplement review." : "승인 또는 보완 검토가 남아 있는 요청입니다."),
                metricRow(isEn ? "Rejected" : "반려", String.valueOf(rejectedCount),
                        isEn ? "Requests returned with a rejection reason." : "반려 사유와 함께 반환된 요청입니다."),
                metricRow(isEn ? "Reissues" : "재발급", String.valueOf(reissuedCount),
                        isEn ? "Reissue-related decisions within the current filter." : "현재 조건에서 재발급 관련 처리 건수입니다."),
                metricRow(isEn ? "High Risk" : "고위험", String.valueOf(highRiskCount),
                        isEn ? "Rows flagged for duplicate or urgent handling." : "중복·긴급 처리로 분류된 건수입니다.")));
        payload.put("certificateAuditAlerts", buildCertificateAuditAlerts(filteredRows, isEn));
        payload.put("certificateAuditRows", pagedRows);
        return payload;
    }

    public String exportSecurityAuditCsv(
            String searchKeyword,
            String actionType,
            String routeGroup,
            String startDate,
            String endDate,
            String sortKey,
            String sortDirection,
            boolean isEn) {
        SecurityAuditSnapshot auditSnapshot = adminSummaryService.loadSecurityAuditSnapshot();
        List<Map<String, String>> allRows = adminSummaryService.buildSecurityAuditRows(auditSnapshot.getAuditLogs(), isEn);
        List<Map<String, String>> filteredRows = filterAndSortSecurityAuditRows(
                allRows,
                safeString(searchKeyword),
                normalizeSecurityAuditActionType(actionType),
                normalizeSecurityAuditRouteGroup(routeGroup),
                normalizeSecurityAuditDate(startDate),
                normalizeSecurityAuditDate(endDate),
                normalizeSecurityAuditSortKey(sortKey),
                normalizeSecurityAuditSortDirection(sortDirection));
        List<String> lines = new ArrayList<>();
        lines.add(String.join(",",
                csvCell(isEn ? "Audit Time" : "감사 시각"),
                csvCell(isEn ? "Actor" : "수행자"),
                csvCell(isEn ? "Action" : "행위"),
                csvCell(isEn ? "Target Route" : "대상 경로"),
                csvCell(isEn ? "Scope Detail" : "스코프 상세")));
        for (Map<String, String> row : filteredRows) {
            lines.add(String.join(",",
                    csvCell(safeString(row.get("auditAt"))),
                    csvCell(safeString(row.get("actor"))),
                    csvCell(safeString(row.get("action"))),
                    csvCell(safeString(row.get("target"))),
                    csvCell(safeString(row.get("detail")))));
        }
        return String.join("\n", lines);
    }

    public Map<String, Object> buildSchedulerPagePayload(
            String jobStatus,
            String executionType,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSchedulerPage(jobStatus, executionType, model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildBatchManagementPagePayload(boolean isEn) {
        Map<String, Object> schedulerPayload = buildSchedulerPagePayload("", "", isEn);
        List<Map<String, String>> batchJobRows = buildBatchJobRows(castStringRowList(schedulerPayload.get("schedulerJobRows")), isEn);
        List<Map<String, String>> batchNodeRows = buildBatchNodeRows(castStringRowList(schedulerPayload.get("schedulerNodeRows")), isEn);
        List<Map<String, String>> batchExecutionRows = castStringRowList(schedulerPayload.get("schedulerExecutionRows"));
        List<Map<String, String>> batchQueueRows = buildBatchQueueRows(isEn);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("batchSummary", buildBatchSummary(batchJobRows, batchQueueRows, batchNodeRows, batchExecutionRows, isEn));
        payload.put("batchJobRows", batchJobRows);
        payload.put("batchQueueRows", batchQueueRows);
        payload.put("batchNodeRows", batchNodeRows);
        payload.put("batchExecutionRows", batchExecutionRows);
        payload.put("batchRunbooks", buildBatchRunbooks(isEn));
        payload.put("isEn", isEn);
        return payload;
    }

    public Map<String, Object> buildExternalConnectionListPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        long unstableCount = connectionRows.stream()
                .filter(row -> !"HEALTHY".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        int avgLatency = connectionRows.isEmpty()
                ? 0
                : (int) Math.round(connectionRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("avgDurationMs"), 0L))
                .average()
                .orElse(0D));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", resolveExternalConnectionOverallStatus(connectionRows));
        payload.put("externalConnectionSummary", List.of(
                summaryMetricRow(
                        isEn ? "Observed Connections" : "관측 연결 수",
                        String.valueOf(connectionRows.size()),
                        isEn ? "Distinct API or endpoint connections observed from recent traces." : "최근 trace 기준으로 관측된 API 또는 엔드포인트 연결 수",
                        connectionRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Registered Profiles" : "등록 프로필 수",
                        String.valueOf(connectionRows.stream()
                                .filter(row -> "Y".equalsIgnoreCase(safeString(row.get("profileRegistered"))))
                                .count()),
                        isEn ? "Connections with saved registry profile data and operations ownership." : "운영 담당과 정책 정보가 저장된 외부연계 프로필 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Unstable Connections" : "불안정 연결",
                        String.valueOf(unstableCount),
                        isEn ? "Connections with repeated errors or slow latency." : "오류 반복 또는 지연이 높은 연결 수",
                        unstableCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Average Latency" : "평균 지연",
                        formatDurationMs(avgLatency),
                        isEn ? "Average response time across observed integration calls." : "관측된 연계 호출 전체 평균 응답시간",
                        avgLatency >= PERFORMANCE_SLOW_THRESHOLD_MS ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Recent API Errors" : "최근 API 오류",
                        String.valueOf(errorEvents.size()),
                        isEn ? "Recent error events linked to external integrations." : "외부연계와 연결된 최근 오류 이벤트 수",
                        errorEvents.size() > 0 ? "danger" : "neutral")));
        payload.put("externalConnectionRows", connectionRows);
        payload.put("externalConnectionIssueRows", buildExternalConnectionIssueRows(accessEvents, errorEvents, isEn));
        payload.put("externalConnectionQuickLinks", List.of(
                quickLinkRow(isEn ? "API Trace Log" : "API 추적 로그", localizedAdminPath("/system/unified_log/api-trace", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)),
                quickLinkRow(isEn ? "IP Whitelist" : "IP 화이트리스트", localizedAdminPath("/system/ip_whitelist", isEn)),
                quickLinkRow(isEn ? "Performance" : "성능", localizedAdminPath("/system/performance", isEn))));
        payload.put("externalConnectionGuidance", List.of(
                guidanceRow(
                        isEn ? "Read by endpoint" : "엔드포인트 기준 해석",
                        isEn ? "Each row merges recent access, trace, and error events by API id or request URI." : "각 행은 API ID 또는 요청 URI 기준으로 최근 access, trace, error 이벤트를 합친 결과입니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "When errors repeat" : "오류 반복 시",
                        isEn ? "Move into API trace log or observability using the linked route and compare response status, traceId, and actor context." : "링크된 화면에서 API trace 로그나 추적 조회로 이동해 response status, traceId, actor 맥락을 함께 비교합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "When access opens externally" : "외부 접근 개방 시",
                        isEn ? "Review whitelist approval and expiration before allowing vendor or partner ingress." : "협력사나 외부 기관 접근 허용 전에는 화이트리스트 승인과 만료 일정을 함께 점검합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalKeysPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> keyRows = buildExternalKeyRows(connectionRows, isEn);
        List<Map<String, String>> rotationRows = buildExternalKeyRotationRows(keyRows, isEn);
        long expiringCount = keyRows.stream()
                .filter(row -> {
                    String rotationStatus = safeString(row.get("rotationStatus")).toUpperCase(Locale.ROOT);
                    return "ROTATE_SOON".equals(rotationStatus) || "ROTATE_NOW".equals(rotationStatus) || "EXPIRED".equals(rotationStatus);
                })
                .count();
        long manualCount = keyRows.stream()
                .filter(row -> "MANUAL".equalsIgnoreCase(safeString(row.get("rotationPolicy"))))
                .count();
        long observedOnlyCount = keyRows.stream()
                .filter(row -> "OBSERVED".equalsIgnoreCase(safeString(row.get("authMethod"))))
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", rotationRows.isEmpty() ? "HEALTHY" : safeString(rotationRows.get(0).get("rotationStatus")));
        payload.put("externalKeysSummary", List.of(
                summaryMetricRow(
                        isEn ? "Credential Records" : "인증키 관리 대상",
                        String.valueOf(keyRows.size()),
                        isEn ? "External connection credentials tracked without exposing secret values." : "비밀값 노출 없이 상태 추적 중인 외부 연계 인증키 수",
                        keyRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Rotation Due" : "교체 필요",
                        String.valueOf(expiringCount),
                        isEn ? "Credentials nearing expiry or already outside the rotation window." : "만료 임박 또는 교체 허용 구간을 넘긴 인증키 수",
                        expiringCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Manual Rotation" : "수동 교체",
                        String.valueOf(manualCount),
                        isEn ? "Credentials that require coordinated manual rotation and handoff." : "수동 교체와 운영 인계가 함께 필요한 인증키 수",
                        manualCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Observed Only" : "관측 전용",
                        String.valueOf(observedOnlyCount),
                        isEn ? "Connections seen in logs but not yet registered with explicit credential governance." : "로그에서만 관측되고 아직 명시적 키 거버넌스에 등록되지 않은 연계 수",
                        observedOnlyCount > 0 ? "warning" : "neutral")));
        payload.put("externalKeyRows", keyRows);
        payload.put("externalKeyRotationRows", rotationRows);
        payload.put("externalKeyQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "IP Whitelist" : "IP 화이트리스트", localizedAdminPath("/system/ip_whitelist", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn))));
        payload.put("externalKeyGuidance", List.of(
                guidanceRow(
                        isEn ? "Do not expose secrets" : "비밀값 비노출 원칙",
                        isEn ? "Use this screen for ownership, expiry, and rotation timing only. Actual secrets must remain in secure storage." : "이 화면은 담당자, 만료, 교체 시점만 다룹니다. 실제 비밀값은 별도 안전 저장소에 유지해야 합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Rotate with downstream windows" : "하위 시스템 점검 시간 연동",
                        isEn ? "Coordinate rotation with downstream maintenance windows and retry policy to avoid replay storms." : "교체 작업은 하위 시스템 점검 시간과 재시도 정책을 함께 확인한 뒤 수행해야 재처리 폭주를 막을 수 있습니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Observed rows need registration" : "관측 전용 행 등록 필요",
                        isEn ? "Observed-only rows should move into the connection registry once owner, auth method, and scope are confirmed." : "관측 전용 행은 담당자, 인증 방식, 권한 범위를 확정한 뒤 연결 레지스트리에 등록해 관리 대상으로 전환해야 합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalSchemaPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> schemaRows = buildExternalSchemaRows(connectionRows, isEn);
        List<Map<String, String>> reviewRows = buildExternalSchemaReviewRows(schemaRows, isEn);
        long reviewCount = schemaRows.stream()
                .filter(row -> !"ACTIVE".equalsIgnoreCase(safeString(row.get("validationStatus"))))
                .count();
        long piiCount = schemaRows.stream()
                .filter(row -> {
                    String piiLevel = safeString(row.get("piiLevel")).toUpperCase(Locale.ROOT);
                    return "MODERATE".equals(piiLevel) || "HIGH".equals(piiLevel);
                })
                .count();
        long totalColumns = schemaRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("columnCount"), 0L))
                .sum();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", reviewCount > 0 ? "REVIEW" : "ACTIVE");
        payload.put("externalSchemaSummary", List.of(
                summaryMetricRow(
                        isEn ? "Managed Schemas" : "관리 스키마",
                        String.valueOf(schemaRows.size()),
                        isEn ? "External payload contracts grouped by observed or registered integration connection." : "관측 또는 등록된 외부연계 기준으로 묶은 payload 계약 수",
                        schemaRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Columns Tracked" : "추적 컬럼 수",
                        String.valueOf(totalColumns),
                        isEn ? "Canonical fields tracked for request, response, and sync control payloads." : "요청, 응답, 동기화 제어 payload에 대해 추적 중인 표준 필드 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Review Required" : "검토 필요",
                        String.valueOf(reviewCount),
                        isEn ? "Schemas with unstable source signals, version mismatch, or manual governance follow-up." : "원천 신호 불안정, 버전 차이, 수동 거버넌스 확인이 필요한 스키마 수",
                        reviewCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "PII Aware" : "개인정보 주의",
                        String.valueOf(piiCount),
                        isEn ? "Schemas that include identity or authorization fields and need tighter masking or retention review." : "식별/권한 필드가 포함되어 마스킹·보존 정책 검토가 필요한 스키마 수",
                        piiCount > 0 ? "warning" : "neutral")));
        payload.put("externalSchemaRows", schemaRows);
        payload.put("externalSchemaReviewRows", reviewRows);
        payload.put("externalSchemaQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Full-Stack Management" : "풀스택 관리", localizedAdminPath("/system/full-stack-management", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn))));
        payload.put("externalSchemaGuidance", List.of(
                guidanceRow(
                        isEn ? "Schema rows are contract views" : "스키마 행은 계약 관점 요약",
                        isEn ? "Each row summarizes the canonical payload boundary for one integration rather than exposing raw request bodies." : "각 행은 개별 연계의 대표 payload 경계를 요약하며 원문 request body를 그대로 노출하지 않습니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Review breaking changes first" : "호환성 변경 우선 검토",
                        isEn ? "If version, required field count, or direction changes, align downstream parser, retry, and queue policy before rollout." : "버전, 필수 필드 수, 송수신 방향이 바뀌면 배포 전 하위 파서, 재시도, 큐 정책을 함께 맞춰야 합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Mask identity-bearing fields" : "식별 필드는 마스킹 우선",
                        isEn ? "Schemas with member, auth, or token semantics need masking, retention, and audit confirmation before wider sharing." : "회원, 인증, 토큰 성격의 필드가 있는 스키마는 공유 확대 전에 마스킹, 보존기간, 감사 근거를 먼저 확인해야 합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalUsagePagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> usageRows = buildExternalUsageRows(connectionRows, isEn);
        List<Map<String, String>> keyRows = buildExternalUsageKeyRows(usageRows);
        List<Map<String, String>> trendRows = buildExternalUsageTrendRows(accessEvents, errorEvents, isEn);
        long highTrafficCount = usageRows.stream()
                .filter(row -> parsePositiveLong(row.get("requestCount"), 0L) >= 1000L)
                .count();
        long errorHeavyCount = usageRows.stream()
                .filter(row -> parsePositiveLong(row.get("errorCount"), 0L) >= 5L)
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", errorHeavyCount > 0 ? "REVIEW" : "ACTIVE");
        payload.put("externalUsageSummary", List.of(
                summaryMetricRow(isEn ? "Active APIs" : "활성 API", String.valueOf(usageRows.size()), isEn ? "Observed integration APIs with current request volume tracking." : "현재 요청량을 추적 중인 외부연계 API 수", usageRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(isEn ? "High Traffic" : "고트래픽", String.valueOf(highTrafficCount), isEn ? "APIs exceeding the normal traffic baseline." : "기준선보다 호출량이 높은 API 수", highTrafficCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(isEn ? "Error Heavy" : "오류 집중", String.valueOf(errorHeavyCount), isEn ? "APIs with repeated error bursts." : "오류가 반복적으로 집중된 API 수", errorHeavyCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(isEn ? "Tracked Consumers" : "소비 시스템", String.valueOf(keyRows.size()), isEn ? "Top consumers or integration owners by observed traffic." : "트래픽 기준 상위 소비 시스템 또는 담당 주체 수", "neutral")));
        payload.put("externalUsageRows", usageRows);
        payload.put("externalUsageKeyRows", keyRows);
        payload.put("externalUsageTrendRows", trendRows);
        payload.put("externalUsageQuickLinks", List.of(
                quickLinkRow(isEn ? "Schema Registry" : "외부 스키마", localizedAdminPath("/external/schema", isEn)),
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                quickLinkRow(isEn ? "Performance" : "성능", localizedAdminPath("/system/performance", isEn))));
        payload.put("externalUsageGuidance", List.of(
                guidanceRow(isEn ? "Traffic spikes need source review" : "트래픽 급증 시 원천 검토", isEn ? "Check upstream rollout, retry loops, and queue replay before scaling traffic allowances." : "호출 허용량 조정보다 먼저 상위 시스템 배포, 재시도 루프, 큐 재처리 여부를 확인합니다.", "warning"),
                guidanceRow(isEn ? "Separate throughput from errors" : "처리량과 오류 분리 확인", isEn ? "High volume alone is not a fault. Prioritize APIs where volume and errors rise together." : "호출량 증가 자체는 장애가 아닙니다. 호출량과 오류가 함께 증가한 API를 우선 확인합니다.", "neutral"),
                guidanceRow(isEn ? "Coordinate consumer changes" : "소비 시스템 변경 연동", isEn ? "If a new consumer appears, confirm scope, key ownership, and schema compatibility before broad rollout." : "새 소비 시스템이 보이면 전체 확산 전에 권한 범위, 키 담당, 스키마 호환성을 먼저 확인합니다.", "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalLogsPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(180);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(120);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(180);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> logRows = buildExternalLogRows(accessEvents, errorEvents, traceEvents, isEn);
        List<Map<String, String>> issueRows = buildExternalConnectionIssueRows(accessEvents, errorEvents, isEn);
        List<Map<String, String>> watchRows = connectionRows.stream()
                .filter(row -> {
                    String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
                    return "WARNING".equals(status) || "DEGRADED".equals(status) || "REVIEW".equals(status);
                })
                .limit(8)
                .collect(Collectors.toList());
        long traceLinkedCount = logRows.stream()
                .filter(row -> !safeString(row.get("traceId")).isEmpty())
                .count();
        long dangerCount = logRows.stream()
                .filter(row -> "DANGER".equalsIgnoreCase(safeString(row.get("severity"))))
                .count();
        long slowCount = accessEvents.stream()
                .filter(item -> item != null && item.getDurationMs() != null && item.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS)
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", dangerCount > 0 ? "REVIEW" : "ACTIVE");
        payload.put("externalLogSummary", List.of(
                summaryMetricRow(
                        isEn ? "Recent Events" : "최근 이벤트",
                        String.valueOf(logRows.size()),
                        isEn ? "Recent external integration access, error, and trace records shown in one queue." : "외부연계 접근, 오류, 추적 이벤트를 하나의 운영 큐로 합쳐 표시합니다.",
                        logRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "High-Risk Events" : "고위험 이벤트",
                        String.valueOf(dangerCount),
                        isEn ? "Errors or failing responses that should be escalated first." : "실패 응답과 오류 이벤트처럼 우선 조치가 필요한 항목 수입니다.",
                        dangerCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Slow Calls" : "지연 호출",
                        String.valueOf(slowCount),
                        isEn ? "Observed integration calls exceeding the slow threshold." : "기준 임계치를 초과한 외부연계 지연 호출 수입니다.",
                        slowCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Trace-Linked" : "추적 연결",
                        String.valueOf(traceLinkedCount),
                        isEn ? "Events carrying a trace id for drill-down into observability or unified log." : "추적 ID가 있어 추적 조회나 통합 로그로 바로 넘길 수 있는 이벤트 수입니다.",
                        "neutral")));
        payload.put("externalLogRows", logRows);
        payload.put("externalLogIssueRows", issueRows);
        payload.put("externalLogConnectionRows", watchRows);
        payload.put("externalLogQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "API Usage" : "API 사용량", localizedAdminPath("/external/usage", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn))));
        payload.put("externalLogGuidance", List.of(
                guidanceRow(
                        isEn ? "Use one trace for one incident" : "한 장애는 한 trace로 묶기",
                        isEn ? "When access, trace, and error records share the same trace id, review them as one incident before retrying." : "접근, 추적, 오류 기록이 같은 trace id를 공유하면 재시도 전에 하나의 장애 단위로 함께 봐야 합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Latency without errors still matters" : "오류 없는 지연도 중요",
                        isEn ? "Sustained slow calls usually precede retries, queue growth, or partner throttling even when status codes stay green." : "상태 코드는 정상이더라도 지연이 누적되면 재시도, 큐 적체, 파트너 제한으로 이어질 수 있습니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Escalate repeated failures by connection" : "연계 단위 반복 실패 우선 조치",
                        isEn ? "If the same connection appears repeatedly, move into usage, sync, and schema screens before widening the blast radius." : "같은 연계가 반복 등장하면 영향 범위를 넓히기 전에 사용량, 동기화, 스키마 화면까지 함께 확인해야 합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalConnectionFormPagePayload(String mode, String connectionId, boolean isEn) {
        boolean addMode = "add".equalsIgnoreCase(safeString(mode));
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        Map<String, String> connectionProfile = addMode
                ? defaultExternalConnectionProfile(isEn)
                : loadExternalConnectionProfile(connectionId, isEn);
        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        String resolvedConnectionId = safeString(connectionProfile.get("connectionId"));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("mode", addMode ? "add" : "edit");
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("connectionProfile", connectionProfile);
        payload.put("externalConnectionFormSummary", buildExternalConnectionFormSummary(connectionProfile, connectionRows, isEn));
        payload.put("externalConnectionIssueRows", buildExternalConnectionFormIssueRows(
                buildExternalConnectionIssueRows(accessEvents, errorEvents, isEn),
                resolvedConnectionId));
        payload.put("externalConnectionQuickLinks", buildExternalConnectionFormQuickLinks(resolvedConnectionId, isEn));
        payload.put("externalConnectionGuidance", buildExternalConnectionFormGuidance(addMode, isEn));
        return payload;
    }

    public Map<String, Object> buildExternalSyncPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> syncRows = buildExternalSyncRows(connectionRows, isEn);
        List<Map<String, String>> queueRows = buildExternalSyncQueueRows(syncRows, isEn);
        List<Map<String, String>> executionRows = buildExternalSyncExecutionRows(syncRows, isEn);
        long scheduledCount = syncRows.stream()
                .filter(row -> !"EVENT".equalsIgnoreCase(safeString(row.get("triggerType"))))
                .count();
        long reviewCount = syncRows.stream()
                .filter(row -> {
                    String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
                    return "REVIEW".equals(status) || "DEGRADED".equals(status) || "DISABLED".equals(status);
                })
                .count();
        long backlogCount = queueRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("backlogCount"), 0L))
                .sum();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("externalSyncSummary", List.of(
                summaryMetricRow(
                        isEn ? "Sync Targets" : "동기화 대상",
                        String.valueOf(syncRows.size()),
                        isEn ? "Registered partner connections tracked for scheduled or event-driven sync." : "정기 또는 이벤트 기반으로 추적 중인 외부 연계 대상 수",
                        syncRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Scheduled Jobs" : "정기 실행 잡",
                        String.valueOf(scheduledCount),
                        isEn ? "Targets using cron-like scheduled pulls or hybrid execution." : "스케줄 수집 또는 혼합형 실행을 사용하는 대상 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Queue Backlog" : "큐 적체",
                        String.valueOf(backlogCount),
                        isEn ? "Pending sync messages waiting for worker consumption." : "워커 소비를 기다리는 동기화 대기 메시지 수",
                        backlogCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Review Required" : "재검토 필요",
                        String.valueOf(reviewCount),
                        isEn ? "Connections with degraded sync health, backlog, or repeated errors." : "동기화 상태 저하, 적체, 반복 오류로 확인이 필요한 연계 수",
                        reviewCount > 0 ? "danger" : "neutral")));
        payload.put("externalSyncRows", syncRows);
        payload.put("externalSyncQueueRows", queueRows);
        payload.put("externalSyncExecutionRows", executionRows);
        payload.put("externalSyncQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Scheduler" : "스케줄러 관리", localizedAdminPath("/system/scheduler", isEn)),
                quickLinkRow(isEn ? "Batch Queue" : "배치 관리", localizedAdminPath("/system/batch", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn))));
        payload.put("externalSyncGuidance", List.of(
                guidanceRow(
                        isEn ? "Scheduled vs event-driven" : "정기 실행과 이벤트 실행",
                        isEn ? "Webhook targets stay event-driven, while scheduled and hybrid targets must keep next-run and backlog together." : "웹훅 대상은 이벤트 기반으로 유지하고, 스케줄/혼합형 대상은 다음 실행 시각과 적체를 함께 점검합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Before manual rerun" : "수동 재실행 전 확인",
                        isEn ? "Confirm retry policy, duplicate guard, and downstream maintenance windows before forcing a replay." : "강제 재실행 전에는 재시도 정책, 중복 방지, 하위 시스템 점검 시간대를 먼저 확인합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "When backlog rises" : "적체 증가 시",
                        isEn ? "Inspect worker ownership and connection-specific errors before scaling consumers or moving queues." : "소비자 증설이나 큐 이동 전에 담당 워커와 연계별 오류 증가 여부를 먼저 확인합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalMaintenancePagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> syncRows = buildExternalSyncRows(connectionRows, isEn);
        List<Map<String, String>> webhookRows = buildExternalWebhookRows(connectionRows, isEn);
        List<Map<String, String>> maintenanceRows = buildExternalMaintenanceRows(connectionRows, syncRows, webhookRows, isEn);
        List<Map<String, String>> impactRows = buildExternalMaintenanceImpactRows(maintenanceRows, isEn);
        long blockedCount = maintenanceRows.stream()
                .filter(row -> "BLOCKED".equalsIgnoreCase(safeString(row.get("maintenanceStatus"))))
                .count();
        long dueSoonCount = maintenanceRows.stream()
                .filter(row -> "DUE_SOON".equalsIgnoreCase(safeString(row.get("maintenanceStatus"))))
                .count();
        long webhookImpactCount = maintenanceRows.stream()
                .filter(row -> {
                    String impact = safeString(row.get("impactScope")).toUpperCase(Locale.ROOT);
                    return impact.contains("WEBHOOK") || impact.contains("이벤트");
                })
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("externalMaintenanceSummary", List.of(
                summaryMetricRow(
                        isEn ? "Tracked Windows" : "점검 대상",
                        String.valueOf(maintenanceRows.size()),
                        isEn ? "External connections with maintenance owner, fallback route, and recovery scope." : "점검 담당, 대체 경로, 복구 범위를 함께 추적하는 외부연계 대상 수",
                        maintenanceRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Due Soon" : "임박 점검",
                        String.valueOf(dueSoonCount),
                        isEn ? "Maintenance windows that need pre-check confirmation before the next sync or event window." : "다음 동기화 또는 이벤트 전에 사전 확인이 필요한 점검 건수",
                        dueSoonCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Blocked Flows" : "차단 영향",
                        String.valueOf(blockedCount),
                        isEn ? "Connections currently blocked by maintenance hold, unresolved errors, or backlog pressure." : "점검 보류, 미해결 오류, 적체 영향으로 차단된 연계 수",
                        blockedCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Webhook/Event Scope" : "이벤트 영향 범위",
                        String.valueOf(webhookImpactCount),
                        isEn ? "Connections affecting webhook or hybrid event delivery during the maintenance window." : "점검 중 웹훅 또는 혼합형 이벤트 전달에 영향을 주는 연계 수",
                        webhookImpactCount > 0 ? "warning" : "neutral")));
        payload.put("externalMaintenanceRows", maintenanceRows);
        payload.put("externalMaintenanceImpactRows", impactRows);
        payload.put("externalMaintenanceRunbooks", buildExternalMaintenanceRunbooks(isEn));
        payload.put("externalMaintenanceQuickLinks", List.of(
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Webhooks" : "웹훅 설정", localizedAdminPath("/external/webhooks", isEn)),
                quickLinkRow(isEn ? "Retry Control" : "재시도 관리", localizedAdminPath("/external/retry", isEn)),
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn))));
        payload.put("externalMaintenanceGuidance", List.of(
                guidanceRow(
                        isEn ? "Freeze changes before the window" : "점검 전 변경 동결",
                        isEn ? "Confirm owner, fallback route, and duplicate-guard behavior before moving a connection into maintenance." : "연계를 점검 상태로 전환하기 전에 담당자, 대체 경로, 중복 방지 동작을 먼저 확인합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Watch backlog and event fan-out" : "적체와 이벤트 확산 확인",
                        isEn ? "Hybrid and webhook-linked rows need queue backlog and partner event fan-out reviewed together." : "혼합형과 웹훅 연계는 큐 적체와 파트너 이벤트 확산 범위를 함께 점검해야 합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Recovery proof is required" : "복구 증적 필수",
                        isEn ? "Verify health, next sync time, and partner delivery recovery before closing the maintenance window." : "점검 종료 전에는 상태 복구, 다음 실행 시각, 파트너 전달 회복 여부를 반드시 확인해야 합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalRetryPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> syncRows = buildExternalSyncRows(connectionRows, isEn);
        List<Map<String, String>> retryRows = buildExternalRetryRows(syncRows, isEn);
        List<Map<String, String>> retryPolicyRows = buildExternalRetryPolicyRows(retryRows, isEn);
        List<Map<String, String>> retryExecutionRows = buildExternalRetryExecutionRows(retryRows, isEn);
        long blockedCount = retryRows.stream()
                .filter(row -> "BLOCKED".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        long manualCount = retryRows.stream()
                .filter(row -> "MANUAL".equalsIgnoreCase(safeString(row.get("retryClass"))))
                .count();
        long backlogCount = retryRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("backlogCount"), 0L))
                .sum();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", blockedCount > 0 ? "REVIEW" : "ACTIVE");
        payload.put("externalRetrySummary", List.of(
                summaryMetricRow(
                        isEn ? "Retry Candidates" : "재시도 대상",
                        String.valueOf(retryRows.size()),
                        isEn ? "Connections that currently need replay, deferred processing, or manual review." : "현재 재처리, 지연 처리, 수동 검토가 필요한 외부연계 대상 수",
                        retryRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Manual Approval" : "수동 승인 필요",
                        String.valueOf(manualCount),
                        isEn ? "Targets requiring explicit operator replay rather than immediate automatic retry." : "즉시 자동 재시도 대신 운영자 재실행 판단이 필요한 대상 수",
                        manualCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Queued Backlog" : "대기 적체",
                        String.valueOf(backlogCount),
                        isEn ? "Messages still waiting in retry or replay queues." : "재시도 또는 재처리 큐에 남아 있는 메시지 수",
                        backlogCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Blocked Replays" : "차단 재처리",
                        String.valueOf(blockedCount),
                        isEn ? "Targets blocked by duplicate guard, rate limit, or maintenance windows." : "중복 방지, rate limit, 점검 시간대로 재처리가 차단된 대상 수",
                        blockedCount > 0 ? "danger" : "neutral")));
        payload.put("externalRetryRows", retryRows);
        payload.put("externalRetryPolicyRows", retryPolicyRows);
        payload.put("externalRetryExecutionRows", retryExecutionRows);
        payload.put("externalRetryQuickLinks", List.of(
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Webhook Settings" : "웹훅 설정", localizedAdminPath("/external/webhooks", isEn)),
                quickLinkRow(isEn ? "Batch Queue" : "배치 관리", localizedAdminPath("/system/batch", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn))));
        payload.put("externalRetryGuidance", List.of(
                guidanceRow(
                        isEn ? "Replay is not the first move" : "재처리는 첫 조치가 아님",
                        isEn ? "Confirm root cause, duplicate guard, and downstream maintenance status before increasing replay pressure." : "재처리 강도를 높이기 전에 원인, 중복 방지, 하위 시스템 점검 상태를 먼저 확인합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Blocked means intentional control" : "차단 상태는 의도된 보호 장치",
                        isEn ? "Blocked rows usually mean duplicate windows, rate limits, or maintenance holds are active and should not be bypassed blindly." : "차단 행은 대개 중복 허용 구간, rate limit, 점검 보류가 활성화된 상태이므로 임의 우회를 피해야 합니다.",
                        "danger"),
                guidanceRow(
                        isEn ? "Keep retry policy aligned" : "재시도 정책 정합성 유지",
                        isEn ? "Connection-level retry, webhook delivery retry, and queue replay limits should stay aligned to avoid replay storms." : "연계 단위 재시도, 웹훅 전달 재시도, 큐 재처리 한도를 맞춰야 재처리 폭주를 피할 수 있습니다.",
                        "neutral")));
        return payload;
    }

    public Map<String, Object> buildExternalMonitoringPagePayload(boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> usageRows = buildExternalUsageRows(connectionRows, isEn);
        List<Map<String, String>> syncRows = buildExternalSyncRows(connectionRows, isEn);
        List<Map<String, String>> webhookRows = buildExternalWebhookRows(connectionRows, isEn);
        List<Map<String, String>> alertRows = buildExternalMonitoringAlertRows(usageRows, syncRows, webhookRows, isEn);
        List<Map<String, String>> monitoringRows = buildExternalMonitoringRows(connectionRows, usageRows, syncRows, alertRows, isEn);
        List<Map<String, String>> timelineRows = buildExternalMonitoringTimelineRows(alertRows, isEn);
        long reviewCount = monitoringRows.stream()
                .filter(row -> {
                    String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
                    return "REVIEW".equals(status) || "DEGRADED".equals(status);
                })
                .count();
        long backlogCount = monitoringRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("backlogCount"), 0L))
                .sum();
        long criticalCount = alertRows.stream()
                .filter(row -> "CRITICAL".equalsIgnoreCase(safeString(row.get("severity"))))
                .count();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("overallStatus", criticalCount > 0 ? "DEGRADED" : (reviewCount > 0 ? "REVIEW" : "ACTIVE"));
        payload.put("externalMonitoringSummary", List.of(
                summaryMetricRow(
                        isEn ? "Monitored Connections" : "모니터링 연계",
                        String.valueOf(monitoringRows.size()),
                        isEn ? "Observed partner integrations combined into one monitoring board." : "관측 중인 외부연계를 하나의 운영 보드로 통합한 수",
                        monitoringRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Open Alerts" : "활성 경보",
                        String.valueOf(alertRows.size()),
                        isEn ? "Backlog, delivery, and degradation alerts awaiting follow-up." : "적체, 전달 실패, 상태 저하 신호 중 후속 조치가 필요한 경보 수",
                        alertRows.isEmpty() ? "neutral" : "warning"),
                summaryMetricRow(
                        isEn ? "Review Required" : "재검토 필요",
                        String.valueOf(reviewCount),
                        isEn ? "Connections currently marked review or degraded." : "현재 REVIEW 또는 DEGRADED 상태로 운영 중인 연계 수",
                        reviewCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Queued Backlog" : "누적 적체",
                        String.valueOf(backlogCount),
                        isEn ? "Estimated pending messages across monitored sync queues." : "모니터링 대상 동기화 큐에 남아 있는 추정 대기 메시지 수",
                        backlogCount > 0 ? "warning" : "neutral")));
        payload.put("externalMonitoringRows", monitoringRows);
        payload.put("externalMonitoringAlertRows", alertRows);
        payload.put("externalMonitoringTimelineRows", timelineRows);
        payload.put("externalMonitoringQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Webhook Settings" : "웹훅 설정", localizedAdminPath("/external/webhooks", isEn)),
                quickLinkRow(isEn ? "API Usage" : "API 사용량", localizedAdminPath("/external/usage", isEn))));
        payload.put("externalMonitoringGuidance", List.of(
                guidanceRow(
                        isEn ? "Check cause before rerun" : "재실행 전 원인 확인",
                        isEn ? "Do not force a rerun until backlog cause, duplicate guard, and downstream maintenance windows are confirmed." : "적체 원인, 중복 방지, 하위 시스템 점검 시간을 먼저 확인하기 전에는 강제 재실행하지 않습니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Separate traffic from failure" : "트래픽과 실패를 분리 판단",
                        isEn ? "High traffic alone is not an incident. Escalate when traffic growth and success degradation appear together." : "호출량 증가만으로 장애로 보지 않습니다. 호출량 증가와 성공률 저하가 함께 나타날 때 우선 승격합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Escalate webhook drift early" : "웹훅 이상 조기 승격",
                        isEn ? "If delivery failure or degraded webhook state repeats, move into webhook settings before broadening retries." : "전달 실패나 웹훅 상태 저하가 반복되면 재시도 확대 전 먼저 웹훅 설정 화면에서 기준을 조정합니다.",
                        "danger")));
        return payload;
    }

    public Map<String, Object> buildExternalWebhooksPagePayload(String keyword, String syncMode, String status, boolean isEn) {
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        List<Map<String, String>> connectionRows = mergeExternalConnectionRegistry(
                buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn),
                isEn);
        List<Map<String, String>> webhookRows = filterExternalWebhookRows(
                buildExternalWebhookRows(connectionRows, isEn),
                keyword,
                syncMode,
                status);
        List<Map<String, String>> deliveryRows = filterExternalWebhookDeliveryRows(
                buildExternalWebhookDeliveryRows(webhookRows, isEn),
                keyword,
                status);
        long reviewCount = webhookRows.stream()
                .filter(row -> {
                    String rowStatus = safeString(row.get("status")).toUpperCase(Locale.ROOT);
                    return "REVIEW".equals(rowStatus) || "DEGRADED".equals(rowStatus) || "DISABLED".equals(rowStatus);
                })
                .count();
        long activeCount = webhookRows.stream()
                .filter(row -> "ACTIVE".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        long failedDeliveries = deliveryRows.stream()
                .mapToLong(row -> parsePositiveLong(row.get("failedCount"), 0L))
                .sum();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("keyword", safeString(keyword));
        payload.put("syncMode", normalizeFilterValue(syncMode));
        payload.put("status", normalizeFilterValue(status));
        payload.put("refreshedAt", LocalDateTime.now().withSecond(0).withNano(0).toString().replace('T', ' '));
        payload.put("externalWebhookSummary", List.of(
                summaryMetricRow(
                        isEn ? "Webhook Targets" : "웹훅 대상",
                        String.valueOf(webhookRows.size()),
                        isEn ? "Registered endpoints receiving event or hybrid webhook delivery." : "이벤트 또는 혼합형 웹훅 수신 대상으로 관리 중인 연계 수",
                        webhookRows.isEmpty() ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Active Endpoints" : "정상 엔드포인트",
                        String.valueOf(activeCount),
                        isEn ? "Webhook targets currently marked active and deliverable." : "현재 활성 상태로 운영 중인 웹훅 엔드포인트 수",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "Review Required" : "재검토 필요",
                        String.valueOf(reviewCount),
                        isEn ? "Endpoints with repeated failures, disabled signatures, or degraded health." : "반복 실패, 서명 비활성화, 상태 저하로 재검토가 필요한 엔드포인트 수",
                        reviewCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Failed Deliveries" : "실패 전달",
                        String.valueOf(failedDeliveries),
                        isEn ? "Estimated failed webhook deliveries across recent event windows." : "최근 이벤트 구간 기준 추정 웹훅 전달 실패 수",
                        failedDeliveries > 0 ? "warning" : "neutral")));
        payload.put("externalWebhookRows", webhookRows);
        payload.put("externalWebhookDeliveryRows", deliveryRows);
        payload.put("externalWebhookQuickLinks", List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Unified Log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                quickLinkRow(isEn ? "Notification Center" : "알림센터", localizedAdminPath("/system/notification", isEn))));
        payload.put("externalWebhookGuidance", List.of(
                guidanceRow(
                        isEn ? "Signature and replay guard" : "서명과 재전송 방지",
                        isEn ? "Keep secret rotation, signature validation, and replay windows aligned before enabling public delivery." : "대외 공개 전에는 시크릿 교체, 서명 검증, 재전송 허용 구간을 함께 맞춰야 합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "When failures rise" : "실패 증가 시",
                        isEn ? "Check destination availability, timeout budget, and payload schema drift before forcing retries." : "재시도 전에 대상 시스템 가용성, 타임아웃 예산, payload 스키마 변경 여부를 먼저 확인합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "During maintenance windows" : "점검 시간대 운영",
                        isEn ? "Use disabled or review state intentionally and document fallback queues or digest notifications." : "점검 시간에는 의도적으로 비활성화 또는 검토 상태를 사용하고 대체 큐나 요약 알림 경로를 함께 기록합니다.",
                        "danger")));
        return payload;
    }

    private List<Map<String, String>> filterExternalWebhookRows(
            List<Map<String, String>> webhookRows,
            String keyword,
            String syncMode,
            String status) {
        String normalizedKeyword = safeString(keyword).trim().toLowerCase(Locale.ROOT);
        String normalizedSyncMode = normalizeFilterValue(syncMode);
        String normalizedStatus = normalizeFilterValue(status);
        return webhookRows.stream()
                .filter(row -> matchesExternalWebhookKeyword(row, normalizedKeyword))
                .filter(row -> "ALL".equals(normalizedSyncMode)
                        || normalizedSyncMode.equals(safeString(row.get("syncMode")).toUpperCase(Locale.ROOT)))
                .filter(row -> "ALL".equals(normalizedStatus)
                        || normalizedStatus.equals(safeString(row.get("status")).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    private boolean matchesExternalWebhookKeyword(Map<String, String> row, String normalizedKeyword) {
        if (normalizedKeyword.isEmpty()) {
            return true;
        }
        String haystack = String.join(" ",
                safeString(row.get("webhookId")),
                safeString(row.get("connectionId")),
                safeString(row.get("connectionName")),
                safeString(row.get("partnerName")),
                safeString(row.get("endpointUrl")),
                safeString(row.get("ownerName"))).toLowerCase(Locale.ROOT);
        return haystack.contains(normalizedKeyword);
    }

    private List<Map<String, String>> filterExternalWebhookDeliveryRows(
            List<Map<String, String>> deliveryRows,
            String keyword,
            String status) {
        String normalizedKeyword = safeString(keyword).trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = normalizeFilterValue(status);
        return deliveryRows.stream()
                .filter(row -> {
                    if (normalizedKeyword.isEmpty()) {
                        return true;
                    }
                    String haystack = String.join(" ",
                            safeString(row.get("connectionName")),
                            safeString(row.get("eventType")),
                            safeString(row.get("retryPolicy")),
                            safeString(row.get("deadLetterPolicy"))).toLowerCase(Locale.ROOT);
                    return haystack.contains(normalizedKeyword);
                })
                .filter(row -> "ALL".equals(normalizedStatus)
                        || normalizedStatus.equals(safeString(row.get("status")).toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    private String normalizeFilterValue(String value) {
        String normalized = safeString(value).trim().toUpperCase(Locale.ROOT);
        return normalized.isEmpty() ? "ALL" : normalized;
    }

    private List<Map<String, String>> buildExternalMonitoringRows(
            List<Map<String, String>> connectionRows,
            List<Map<String, String>> usageRows,
            List<Map<String, String>> syncRows,
            List<Map<String, String>> alertRows,
            boolean isEn) {
        Map<String, Map<String, String>> usageByConnectionId = usageRows.stream()
                .collect(Collectors.toMap(row -> safeString(row.get("connectionId")), row -> row, (left, right) -> left, LinkedHashMap::new));
        Map<String, Map<String, String>> syncByConnectionId = syncRows.stream()
                .collect(Collectors.toMap(row -> safeString(row.get("connectionId")), row -> row, (left, right) -> left, LinkedHashMap::new));
        Map<String, List<Map<String, String>>> alertsByConnectionId = alertRows.stream()
                .collect(Collectors.groupingBy(row -> safeString(row.get("connectionId")), LinkedHashMap::new, Collectors.toList()));

        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> connection : connectionRows) {
            String connectionId = firstNonBlank(safeString(connection.get("connectionId")), safeString(connection.get("apiId")));
            Map<String, String> usage = usageByConnectionId.getOrDefault(connectionId, Collections.emptyMap());
            Map<String, String> sync = syncByConnectionId.getOrDefault(connectionId, Collections.emptyMap());
            List<Map<String, String>> alerts = alertsByConnectionId.getOrDefault(connectionId, Collections.emptyList());
            String status = "ACTIVE";
            for (Map<String, String> alert : alerts) {
                String severity = safeString(alert.get("severity")).toUpperCase(Locale.ROOT);
                if ("CRITICAL".equals(severity)) {
                    status = "DEGRADED";
                    break;
                }
                if ("HIGH".equals(severity) || "MEDIUM".equals(severity)) {
                    status = "REVIEW";
                }
            }

            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionId", connectionId);
            row.put("connectionName", firstNonBlank(safeString(connection.get("connectionName")), connectionId));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("protocol", firstNonBlank(safeString(connection.get("protocol")), safeString(connection.get("connectionType")), "REST"));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("requestCount", firstNonBlank(safeString(usage.get("requestCount")), "0"));
            row.put("successRate", firstNonBlank(safeString(usage.get("successRate")), "100%"));
            row.put("backlogCount", firstNonBlank(safeString(sync.get("backlogCount")), "0"));
            row.put("alertCount", String.valueOf(alerts.size()));
            row.put("topAlertLevel", alerts.isEmpty() ? "NONE" : safeString(alerts.get(0).get("severity")));
            row.put("lastObservedAt", firstNonBlank(
                    safeString(usage.get("lastSeenAt")),
                    safeString(sync.get("lastSyncAt")),
                    safeString(connection.get("lastSeenAt")),
                    "2026-03-30 09:00"));
            row.put("status", status);
            row.put("targetRoute", firstNonBlank(
                    safeString(connection.get("targetRoute")),
                    appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId)));
            rows.add(row);
        }

        rows.sort(Comparator
                .comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("alertCount"), 0L)).reversed()
                .thenComparing(Comparator.comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("backlogCount"), 0L)).reversed())
                .thenComparing(Comparator.comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("requestCount"), 0L)).reversed()));
        return rows;
    }

    private List<Map<String, String>> buildExternalMonitoringAlertRows(
            List<Map<String, String>> usageRows,
            List<Map<String, String>> syncRows,
            List<Map<String, String>> webhookRows,
            boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int sequence = 0;

        for (Map<String, String> row : syncRows) {
            long backlogCount = parsePositiveLong(row.get("backlogCount"), 0L);
            String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
            if (backlogCount >= 10L || "REVIEW".equals(status) || "DEGRADED".equals(status)) {
                sequence++;
                Map<String, String> alert = new LinkedHashMap<>();
                alert.put("alertId", "SYNC-" + sequence);
                alert.put("connectionId", safeString(row.get("connectionId")));
                alert.put("connectionName", safeString(row.get("connectionName")));
                alert.put("severity", backlogCount >= 25L ? "CRITICAL" : (backlogCount >= 10L ? "HIGH" : "MEDIUM"));
                alert.put("title", backlogCount >= 10L
                        ? (isEn ? "Sync backlog exceeded normal threshold." : "동기화 적체가 기준치를 초과했습니다.")
                        : (isEn ? "Sync target needs review." : "동기화 대상 재검토가 필요합니다."));
                alert.put("recommendedAction", isEn
                        ? "Review worker ownership, retry loops, and downstream maintenance windows."
                        : "워커 담당 노드, 재시도 루프, 하위 시스템 점검 시간대를 먼저 확인하세요.");
                alert.put("occurredAt", firstNonBlank(safeString(row.get("lastSyncAt")), "2026-03-30 09:00"));
                alert.put("targetRoute", firstNonBlank(safeString(row.get("targetRoute")), localizedAdminPath("/external/sync", isEn)));
                rows.add(alert);
            }
        }

        for (Map<String, String> row : usageRows) {
            long requestCount = parsePositiveLong(row.get("requestCount"), 0L);
            long errorCount = parsePositiveLong(row.get("errorCount"), 0L);
            String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
            if (errorCount >= 5L || "DEGRADED".equals(status) || "WARNING".equals(status)) {
                sequence++;
                Map<String, String> alert = new LinkedHashMap<>();
                alert.put("alertId", "USAGE-" + sequence);
                alert.put("connectionId", safeString(row.get("connectionId")));
                alert.put("connectionName", safeString(row.get("connectionName")));
                alert.put("severity", errorCount >= 10L ? "CRITICAL" : (requestCount >= 1000L ? "HIGH" : "MEDIUM"));
                alert.put("title", isEn ? "Error-heavy traffic was detected." : "오류가 집중된 호출량이 관측되었습니다.");
                alert.put("recommendedAction", isEn
                        ? "Separate upstream rollout issues from capacity changes before adjusting throughput."
                        : "처리량 조정보다 먼저 상위 시스템 배포 영향과 용량 문제를 분리해서 확인하세요.");
                alert.put("occurredAt", firstNonBlank(safeString(row.get("lastSeenAt")), "2026-03-30 09:00"));
                alert.put("targetRoute", firstNonBlank(safeString(row.get("targetRoute")), localizedAdminPath("/external/usage", isEn)));
                rows.add(alert);
            }
        }

        for (Map<String, String> row : webhookRows) {
            String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
            long failedCount = parsePositiveLong(row.get("failedCount"), 0L);
            if ("REVIEW".equals(status) || "DEGRADED".equals(status) || failedCount > 0L) {
                sequence++;
                Map<String, String> alert = new LinkedHashMap<>();
                alert.put("alertId", "WEBHOOK-" + sequence);
                alert.put("connectionId", safeString(row.get("connectionId")));
                alert.put("connectionName", safeString(row.get("connectionName")));
                alert.put("severity", failedCount >= 3L ? "HIGH" : "MEDIUM");
                alert.put("title", isEn ? "Webhook delivery health needs attention." : "웹훅 전달 상태 점검이 필요합니다.");
                alert.put("recommendedAction", isEn
                        ? "Inspect signature validation, timeout budget, and destination availability."
                        : "서명 검증, 타임아웃 예산, 대상 시스템 가용성을 먼저 점검하세요.");
                alert.put("occurredAt", firstNonBlank(safeString(row.get("lastEventAt")), "2026-03-30 09:00"));
                alert.put("targetRoute", firstNonBlank(safeString(row.get("targetRoute")), localizedAdminPath("/external/webhooks", isEn)));
                rows.add(alert);
            }
        }

        rows.sort(Comparator
                .comparingInt((Map<String, String> row) -> monitoringSeverityRank(safeString(row.get("severity"))))
                .thenComparing((Map<String, String> row) -> safeString(row.get("occurredAt")), Comparator.reverseOrder()));
        return rows;
    }

    private List<Map<String, String>> buildExternalMonitoringTimelineRows(List<Map<String, String>> alertRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> alert : alertRows.stream().limit(8).collect(Collectors.toList())) {
            index++;
            Map<String, String> row = new LinkedHashMap<>();
            row.put("timelineId", "TIMELINE-" + index);
            row.put("occurredAt", firstNonBlank(safeString(alert.get("occurredAt")), "2026-03-30 09:00"));
            row.put("connectionName", safeString(alert.get("connectionName")));
            row.put("summary", firstNonBlank(safeString(alert.get("title")), isEn ? "Monitoring follow-up recorded." : "모니터링 후속 조치 포인트가 기록되었습니다."));
            row.put("targetRoute", safeString(alert.get("targetRoute")));
            rows.add(row);
        }
        if (rows.isEmpty()) {
            Map<String, String> emptyRow = new LinkedHashMap<>();
            emptyRow.put("timelineId", "TIMELINE-1");
            emptyRow.put("occurredAt", "2026-03-30 09:00");
            emptyRow.put("connectionName", isEn ? "All monitored connections" : "전체 모니터링 연계");
            emptyRow.put("summary", isEn ? "No immediate follow-up events were detected." : "즉시 후속 조치가 필요한 이벤트는 감지되지 않았습니다.");
            emptyRow.put("targetRoute", localizedAdminPath("/external/connection_list", isEn));
            rows.add(emptyRow);
        }
        return rows;
    }

    private int monitoringSeverityRank(String severity) {
        String normalized = safeString(severity).toUpperCase(Locale.ROOT);
        if ("CRITICAL".equals(normalized)) {
            return 0;
        }
        if ("HIGH".equals(normalized)) {
            return 1;
        }
        if ("MEDIUM".equals(normalized)) {
            return 2;
        }
        return 3;
    }

    public Map<String, Object> saveExternalConnection(Map<String, String> payload, boolean isEn) {
        Map<String, String> normalized = normalizeExternalConnectionPayload(payload, isEn);
        String connectionId = safeString(normalized.get("connectionId")).toUpperCase(Locale.ROOT);
        String originalConnectionId = safeString(payload == null ? null : payload.get("originalConnectionId")).toUpperCase(Locale.ROOT);
        boolean addMode = "add".equalsIgnoreCase(safeString(payload == null ? null : payload.get("mode")));
        if (connectionId.isEmpty()) {
            return Map.of(
                    "success", false,
                    "message", isEn ? "Connection ID is required." : "연계 ID는 필수입니다.");
        }
        if (addMode && externalConnectionProfileStoreService.exists(connectionId)) {
            return Map.of(
                    "success", false,
                    "message", isEn ? "Connection ID already exists. Enter a new ID." : "이미 사용 중인 연계 ID입니다. 새 ID를 입력하세요.");
        }
        if (!addMode
                && !originalConnectionId.isEmpty()
                && !originalConnectionId.equalsIgnoreCase(connectionId)
                && externalConnectionProfileStoreService.exists(connectionId)) {
            return Map.of(
                    "success", false,
                    "message", isEn ? "Connection ID already exists. Enter a new ID." : "이미 사용 중인 연계 ID입니다. 새 ID를 입력하세요.");
        }
        Map<String, String> savedProfile = externalConnectionProfileStoreService.saveProfile(normalized, originalConnectionId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", isEn ? "External connection profile saved." : "외부연계 프로필을 저장했습니다.");
        response.put("mode", safeString(payload == null ? null : payload.get("mode")));
        response.put("connectionProfile", savedProfile);
        return response;
    }

    private List<Map<String, String>> buildExternalSchemaRows(List<Map<String, String>> connectionRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> connection : connectionRows) {
            index++;
            String connectionId = firstNonBlank(safeString(connection.get("connectionId")), safeString(connection.get("apiId")), "EXT-" + index);
            String domain = resolveExternalSchemaDomain(connection);
            List<String> columns = resolveExternalSchemaColumns(connection, domain);
            String validationStatus = resolveExternalSchemaValidationStatus(connection, columns.size());
            String token = sanitizeExternalSchemaToken(connectionId, "EXT_" + index);

            Map<String, String> row = new LinkedHashMap<>();
            row.put("schemaId", token + "_PAYLOAD");
            row.put("connectionId", connectionId);
            row.put("connectionName", firstNonBlank(safeString(connection.get("connectionName")), connectionId));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("domain", domain);
            row.put("tableName", "EXT_" + token + "_PAYLOAD");
            row.put("direction", resolveExternalSchemaDirection(connection));
            row.put("schemaVersion", resolveExternalSchemaVersion(connection));
            row.put("protocol", firstNonBlank(safeString(connection.get("protocol")), "REST"));
            row.put("columnCount", String.valueOf(columns.size()));
            row.put("requiredFieldCount", String.valueOf(Math.max(3, Math.min(columns.size(), 4 + (index % 4)))));
            row.put("columns", String.join(", ", columns));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("piiLevel", resolveExternalSchemaPiiLevel(domain, columns));
            row.put("validationStatus", validationStatus);
            row.put("lastSeenAt", firstNonBlank(safeString(connection.get("lastSeenAt")), "2026-03-30 09:00"));
            row.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId));
            rows.add(row);
        }
        rows.sort(Comparator.comparing((Map<String, String> row) -> safeString(row.get("validationStatus")))
                .thenComparing(row -> safeString(row.get("schemaId"))));
        return rows;
    }

    private List<Map<String, String>> buildExternalSchemaReviewRows(List<Map<String, String>> schemaRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> schemaRow : schemaRows) {
            String validationStatus = safeString(schemaRow.get("validationStatus")).toUpperCase(Locale.ROOT);
            String piiLevel = safeString(schemaRow.get("piiLevel")).toUpperCase(Locale.ROOT);
            if ("ACTIVE".equals(validationStatus) && "LOW".equals(piiLevel)) {
                continue;
            }
            Map<String, String> row = new LinkedHashMap<>();
            row.put("schemaId", safeString(schemaRow.get("schemaId")));
            row.put("connectionName", safeString(schemaRow.get("connectionName")));
            row.put("reviewType", "ACTIVE".equals(validationStatus)
                    ? (isEn ? "Masking review" : "마스킹 검토")
                    : (isEn ? "Contract review" : "계약 검토"));
            row.put("reason", "ACTIVE".equals(validationStatus)
                    ? (isEn ? "Identity-bearing fields require masking and retention confirmation." : "식별 필드가 있어 마스킹·보존기간 확인이 필요합니다.")
                    : (isEn ? "Version, required fields, or source stability changed from the normal baseline." : "버전, 필수 필드, 원천 안정성이 기준선과 달라졌습니다."));
            row.put("ownerName", safeString(schemaRow.get("ownerName")));
            row.put("status", "ACTIVE".equals(validationStatus) ? "WATCH" : validationStatus);
            row.put("targetRoute", safeString(schemaRow.get("targetRoute")));
            rows.add(row);
        }
        if (rows.isEmpty()) {
            for (Map<String, String> schemaRow : schemaRows.stream().limit(3).collect(Collectors.toList())) {
                Map<String, String> row = new LinkedHashMap<>();
                row.put("schemaId", safeString(schemaRow.get("schemaId")));
                row.put("connectionName", safeString(schemaRow.get("connectionName")));
                row.put("reviewType", isEn ? "Routine review" : "정기 점검");
                row.put("reason", isEn ? "No immediate drift was detected. Keep version and field ownership current." : "즉시 조치가 필요한 이탈은 없습니다. 버전과 필드 담당 정보만 최신으로 유지하세요.");
                row.put("ownerName", safeString(schemaRow.get("ownerName")));
                row.put("status", "ACTIVE");
                row.put("targetRoute", safeString(schemaRow.get("targetRoute")));
                rows.add(row);
            }
        }
        return rows.stream().limit(8).collect(Collectors.toList());
    }

    private String resolveExternalSchemaDomain(Map<String, String> connection) {
        String haystack = String.join(" ",
                safeString(connection.get("connectionId")),
                safeString(connection.get("connectionName")),
                safeString(connection.get("partnerName")),
                safeString(connection.get("endpointUrl")),
                safeString(connection.get("requestUri")),
                safeString(connection.get("dataScope"))).toLowerCase(Locale.ROOT);
        if (containsAny(haystack, "member", "user", "join", "account", "auth")) {
            return "MEMBER";
        }
        if (containsAny(haystack, "emission", "carbon", "site", "project")) {
            return "EMISSION";
        }
        if (containsAny(haystack, "token", "key", "oauth", "cert")) {
            return "SECURITY";
        }
        if (containsAny(haystack, "batch", "queue", "sync", "schedule", "webhook")) {
            return "OPERATIONS";
        }
        return "COMMON";
    }

    private List<String> resolveExternalSchemaColumns(Map<String, String> connection, String domain) {
        LinkedHashSet<String> columns = new LinkedHashSet<>();
        columns.add("request_id");
        columns.add("partner_code");
        columns.add("sync_at");
        columns.add("status_code");
        String normalizedDomain = safeString(domain).toUpperCase(Locale.ROOT);
        if ("MEMBER".equals(normalizedDomain)) {
            columns.add("member_id");
            columns.add("company_id");
            columns.add("auth_scope");
        } else if ("EMISSION".equals(normalizedDomain)) {
            columns.add("site_id");
            columns.add("project_id");
            columns.add("emission_amount");
        } else if ("SECURITY".equals(normalizedDomain)) {
            columns.add("token_id");
            columns.add("expires_at");
            columns.add("issuer_code");
        } else if ("OPERATIONS".equals(normalizedDomain)) {
            columns.add("job_id");
            columns.add("queue_id");
            columns.add("retry_count");
        } else {
            columns.add("resource_id");
            columns.add("resource_type");
            columns.add("updated_at");
        }
        String protocol = safeString(connection.get("protocol")).toUpperCase(Locale.ROOT);
        if ("SFTP".equals(protocol) || "MQ".equals(protocol)) {
            columns.add("file_sequence");
        } else {
            columns.add("trace_id");
        }
        return new ArrayList<>(columns);
    }

    private String resolveExternalSchemaDirection(Map<String, String> connection) {
        String syncMode = safeString(connection.get("syncMode")).toUpperCase(Locale.ROOT);
        String endpoint = firstNonBlank(safeString(connection.get("endpointUrl")), safeString(connection.get("requestUri"))).toLowerCase(Locale.ROOT);
        if ("WEBHOOK".equals(syncMode) || endpoint.contains("webhook") || endpoint.contains("callback")) {
            return "INBOUND";
        }
        if ("HYBRID".equals(syncMode)) {
            return "BIDIRECTIONAL";
        }
        return "OUTBOUND";
    }

    private String resolveExternalSchemaVersion(Map<String, String> connection) {
        String protocol = safeString(connection.get("protocol")).toUpperCase(Locale.ROOT);
        if ("SOAP".equals(protocol)) {
            return "WSDL-1.0";
        }
        if ("SFTP".equals(protocol) || "MQ".equals(protocol)) {
            return "FLAT-1.0";
        }
        return "REST-2026.03";
    }

    private String resolveExternalSchemaPiiLevel(String domain, List<String> columns) {
        if ("MEMBER".equalsIgnoreCase(domain) || columns.stream().anyMatch(item -> item.contains("auth") || item.contains("token"))) {
            return "HIGH";
        }
        if ("COMMON".equalsIgnoreCase(domain)) {
            return "LOW";
        }
        return "MODERATE";
    }

    private String resolveExternalSchemaValidationStatus(Map<String, String> connection, int columnCount) {
        String operationStatus = safeString(connection.get("operationStatus")).toUpperCase(Locale.ROOT);
        long errorCount = parsePositiveLong(connection.get("errorCount"), 0L);
        long avgDurationMs = parsePositiveLong(connection.get("avgDurationMs"), 0L);
        if ("DISABLED".equals(operationStatus)) {
            return "DISABLED";
        }
        if ("REVIEW".equals(operationStatus) || errorCount >= 3 || avgDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS || columnCount >= 8) {
            return "REVIEW";
        }
        if (errorCount > 0) {
            return "WATCH";
        }
        return "ACTIVE";
    }

    private String sanitizeExternalSchemaToken(String value, String fallback) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_").replaceAll("^_+|_+$", "");
        return normalized.isEmpty() ? fallback : normalized;
    }

    private boolean containsAny(String value, String... keywords) {
        for (String keyword : keywords) {
            if (value.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private List<Map<String, String>> buildExternalUsageRows(List<Map<String, String>> connectionRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> connection : connectionRows) {
            long successCount = parsePositiveLong(connection.get("successCount"), 0L);
            long errorCount = parsePositiveLong(connection.get("errorCount"), 0L);
            long requestCount = Math.max(successCount + errorCount, parsePositiveLong(connection.get("traceCount"), 0L));
            long avgDurationMs = parsePositiveLong(connection.get("avgDurationMs"), 0L);
            double successRate = requestCount <= 0L ? 100D : ((double) successCount * 100D) / (double) requestCount;
            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionKey", safeString(connection.get("connectionKey")));
            row.put("connectionId", firstNonBlank(safeString(connection.get("connectionId")), safeString(connection.get("apiId"))));
            row.put("connectionName", safeString(connection.get("connectionName")));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("requestUri", firstNonBlank(safeString(connection.get("requestUri")), safeString(connection.get("endpointUrl"))));
            row.put("authMethod", firstNonBlank(safeString(connection.get("authMethod")), "OBSERVED"));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("requestCount", String.valueOf(requestCount));
            row.put("errorCount", String.valueOf(errorCount));
            row.put("successRate", String.format(Locale.ROOT, "%.1f", successRate));
            row.put("avgDurationMs", String.valueOf(avgDurationMs));
            row.put("avgDurationText", formatDurationMs(avgDurationMs));
            row.put("lastSeenAt", firstNonBlank(safeString(connection.get("lastSeenAt")), "2026-03-30 09:00"));
            row.put("status", firstNonBlank(safeString(connection.get("status")), "HEALTHY"));
            row.put("targetRoute", firstNonBlank(
                    appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", safeString(connection.get("connectionId"))),
                    safeString(connection.get("targetRoute"))));
            rows.add(row);
        }
        rows.sort(Comparator
                .comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("requestCount"), 0L)).reversed()
                .thenComparingDouble((Map<String, String> row) -> parsePercentageValue(row.get("successRate")))
                .thenComparing((Map<String, String> row) -> safeString(row.get("lastSeenAt")), Comparator.reverseOrder()));
        return rows;
    }

    private List<Map<String, String>> buildExternalUsageKeyRows(List<Map<String, String>> usageRows) {
        Map<String, List<Map<String, String>>> rowsByAuthMethod = usageRows.stream()
                .collect(Collectors.groupingBy(row -> firstNonBlank(safeString(row.get("authMethod")), "OBSERVED"), LinkedHashMap::new, Collectors.toList()));
        List<Map<String, String>> rows = new ArrayList<>();
        rowsByAuthMethod.forEach((authMethod, items) -> {
            long requestCount = items.stream().mapToLong(row -> parsePositiveLong(row.get("requestCount"), 0L)).sum();
            long errorCount = items.stream().mapToLong(row -> parsePositiveLong(row.get("errorCount"), 0L)).sum();
            double successRate = requestCount <= 0L ? 100D : ((double) (requestCount - errorCount) * 100D) / (double) requestCount;
            Map<String, String> row = new LinkedHashMap<>();
            row.put("authMethod", authMethod);
            row.put("connectionCount", String.valueOf(items.size()));
            row.put("requestCount", String.valueOf(requestCount));
            row.put("errorCount", String.valueOf(errorCount));
            row.put("successRate", String.format(Locale.ROOT, "%.1f", successRate));
            rows.add(row);
        });
        rows.sort(Comparator.comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("requestCount"), 0L)).reversed());
        return rows;
    }

    private List<Map<String, String>> buildExternalUsageTrendRows(
            List<AccessEventRecordVO> accessEvents,
            List<ErrorEventRecordVO> errorEvents,
            boolean isEn) {
        Map<String, List<AccessEventRecordVO>> accessByDate = accessEvents.stream()
                .collect(Collectors.groupingBy(item -> usageDateKey(item == null ? null : item.getCreatedAt()), LinkedHashMap::new, Collectors.toList()));
        Map<String, List<ErrorEventRecordVO>> errorByDate = errorEvents.stream()
                .collect(Collectors.groupingBy(item -> usageDateKey(item == null ? null : item.getCreatedAt()), LinkedHashMap::new, Collectors.toList()));
        LinkedHashSet<String> dates = new LinkedHashSet<>();
        dates.addAll(accessByDate.keySet());
        dates.addAll(errorByDate.keySet());
        List<Map<String, String>> rows = new ArrayList<>();
        for (String date : dates) {
            if (safeString(date).isEmpty()) {
                continue;
            }
            List<AccessEventRecordVO> accessItems = accessByDate.getOrDefault(date, Collections.emptyList());
            List<ErrorEventRecordVO> errorItems = errorByDate.getOrDefault(date, Collections.emptyList());
            long slowCount = accessItems.stream()
                    .filter(item -> item != null && item.getDurationMs() != null && item.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS)
                    .count();
            String topConnection = accessItems.stream()
                    .collect(Collectors.groupingBy(item -> resolveIntegrationConnectionName(
                            safeString(item == null ? null : item.getApiId()),
                            normalizePerformanceUri(item == null ? null : item.getRequestUri()),
                            isEn), LinkedHashMap::new, Collectors.counting()))
                    .entrySet()
                    .stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("");
            Map<String, String> row = new LinkedHashMap<>();
            row.put("date", date);
            row.put("requestCount", String.valueOf(accessItems.size()));
            row.put("errorCount", String.valueOf(errorItems.size()));
            row.put("slowCount", String.valueOf(slowCount));
            row.put("topConnection", topConnection);
            rows.add(row);
        }
        rows.sort(Comparator.comparing((Map<String, String> row) -> safeString(row.get("date")), Comparator.reverseOrder()));
        return rows.stream().limit(7).collect(Collectors.toList());
    }

    private List<Map<String, String>> buildExternalMaintenanceRows(
            List<Map<String, String>> connectionRows,
            List<Map<String, String>> syncRows,
            List<Map<String, String>> webhookRows,
            boolean isEn) {
        Map<String, Map<String, String>> syncByConnection = syncRows.stream()
                .collect(Collectors.toMap(
                        row -> safeString(row.get("connectionId")),
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new));
        Map<String, Map<String, String>> webhookByConnection = webhookRows.stream()
                .collect(Collectors.toMap(
                        row -> safeString(row.get("connectionId")),
                        Function.identity(),
                        (left, right) -> left,
                        LinkedHashMap::new));
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> connection : connectionRows) {
            index++;
            String connectionId = firstNonBlank(
                    safeString(connection.get("connectionId")),
                    safeString(connection.get("apiId")),
                    "EXT-MAINT-" + index);
            Map<String, String> syncRow = syncByConnection.getOrDefault(connectionId, Collections.emptyMap());
            Map<String, String> webhookRow = webhookByConnection.getOrDefault(connectionId, Collections.emptyMap());
            long backlogCount = parsePositiveLong(syncRow.get("backlogCount"), 0L);
            long errorCount = parsePositiveLong(connection.get("errorCount"), 0L);
            String syncMode = firstNonBlank(safeString(connection.get("syncMode")), safeString(syncRow.get("syncMode")), "SCHEDULED");
            Map<String, String> row = new LinkedHashMap<>();
            row.put("maintenanceId", "MT-" + String.format(Locale.ROOT, "%03d", index));
            row.put("connectionId", connectionId);
            row.put("connectionName", firstNonBlank(safeString(connection.get("connectionName")), connectionId));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("syncMode", syncMode);
            row.put("maintenanceWindow", firstNonBlank(
                    safeString(connection.get("maintenanceWindow")),
                    safeString(webhookRow.get("deliveryWindow")),
                    defaultMaintenanceWindow(index, isEn)));
            row.put("plannedAt", plannedMaintenanceAt(index));
            row.put("fallbackRoute", resolveFallbackRoute(syncMode, !webhookRow.isEmpty(), isEn));
            row.put("impactScope", resolveMaintenanceImpactScope(syncMode, !webhookRow.isEmpty(), backlogCount, isEn));
            row.put("backlogCount", String.valueOf(backlogCount));
            row.put("lastSeenAt", firstNonBlank(safeString(connection.get("lastSeenAt")), safeString(syncRow.get("lastSyncAt"))));
            row.put("maintenanceStatus", resolveMaintenanceStatus(safeString(connection.get("operationStatus")), backlogCount, errorCount, index));
            row.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId));
            rows.add(row);
        }
        rows.sort(Comparator
                .comparing((Map<String, String> row) -> maintenanceStatusRank(safeString(row.get("maintenanceStatus"))))
                .reversed()
                .thenComparing((Map<String, String> row) -> safeString(row.get("plannedAt")))
                .thenComparing((Map<String, String> row) -> safeString(row.get("connectionName"))));
        return rows;
    }

    private List<Map<String, String>> buildExternalMaintenanceImpactRows(
            List<Map<String, String>> maintenanceRows,
            boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> maintenanceRow : maintenanceRows.stream().limit(8).collect(Collectors.toList())) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionName", safeString(maintenanceRow.get("connectionName")));
            row.put("impactScope", safeString(maintenanceRow.get("impactScope")));
            row.put("fallbackRoute", safeString(maintenanceRow.get("fallbackRoute")));
            row.put("operatorAction", operatorActionForMaintenance(safeString(maintenanceRow.get("maintenanceStatus")), isEn));
            row.put("plannedAt", safeString(maintenanceRow.get("plannedAt")));
            row.put("targetRoute", safeString(maintenanceRow.get("targetRoute")));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalMaintenanceRunbooks(boolean isEn) {
        return List.of(
                guidanceRow(
                        isEn ? "Pre-window checklist" : "사전 점검 체크리스트",
                        isEn ? "Freeze connection changes, verify owner contact, and confirm whether retries or queues must pause." : "연계 변경을 동결하고 담당자 연락망, 재시도 중지 여부, 큐 정지 여부를 먼저 확인합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "In-window execution" : "점검 중 운영 절차",
                        isEn ? "Route scheduled pulls to maintenance mode, watch backlog growth, and keep partner-facing webhook messaging explicit." : "정기 수집을 점검 상태로 전환하고 적체 증가를 관찰하며 파트너 웹훅 안내를 명확히 유지합니다.",
                        "warning"),
                guidanceRow(
                        isEn ? "Post-window recovery" : "점검 후 복구 절차",
                        isEn ? "Check the next run time, delivery recovery, and unresolved blocked rows before closing the change ticket." : "다음 실행 시각, 전달 복구 여부, 차단 상태 잔여 건을 확인한 뒤 변경 티켓을 종료합니다.",
                        "danger"));
    }

    private List<Map<String, String>> buildExternalLogRows(
            List<AccessEventRecordVO> accessEvents,
            List<ErrorEventRecordVO> errorEvents,
            List<TraceEventRecordVO> traceEvents,
            boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (AccessEventRecordVO item : accessEvents) {
            if (item == null) {
                continue;
            }
            int responseStatus = item.getResponseStatus() == null ? 0 : item.getResponseStatus();
            boolean slow = item.getDurationMs() != null && item.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS;
            String severity = responseStatus >= 500 ? "DANGER" : responseStatus >= 400 || slow ? "WARNING" : "NEUTRAL";
            Map<String, String> row = new LinkedHashMap<>();
            row.put("id", firstNonBlank(safeString(item.getEventId()), safeString(item.getTraceId()), safeString(item.getApiId())));
            row.put("occurredAt", safeString(item.getCreatedAt()));
            row.put("logType", "ACCESS");
            row.put("severity", severity);
            row.put("traceId", safeString(item.getTraceId()));
            row.put("apiId", safeString(item.getApiId()));
            row.put("actorId", safeString(item.getActorId()));
            row.put("connectionName", resolveIntegrationConnectionName(safeString(item.getApiId()), normalizePerformanceUri(item.getRequestUri()), isEn));
            row.put("requestUri", normalizePerformanceUri(item.getRequestUri()));
            row.put("status", responseStatus > 0 ? String.valueOf(responseStatus) : (slow ? "SLOW" : "OK"));
            row.put("detail", firstNonBlank(
                    item.getDurationMs() == null ? "" : item.getDurationMs() + "ms",
                    safeString(item.getErrorMessage()),
                    safeString(item.getHttpMethod())));
            row.put("targetRoute", !safeString(item.getApiId()).isEmpty()
                    ? appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", safeString(item.getApiId()))
                    : appendQuery(localizedAdminPath("/system/unified_log", isEn), "traceId", safeString(item.getTraceId())));
            rows.add(row);
        }
        for (ErrorEventRecordVO item : errorEvents) {
            if (item == null) {
                continue;
            }
            Map<String, String> row = new LinkedHashMap<>();
            row.put("id", firstNonBlank(safeString(item.getErrorId()), safeString(item.getTraceId()), safeString(item.getApiId())));
            row.put("occurredAt", safeString(item.getCreatedAt()));
            row.put("logType", "ERROR");
            row.put("severity", "DANGER");
            row.put("traceId", safeString(item.getTraceId()));
            row.put("apiId", safeString(item.getApiId()));
            row.put("actorId", safeString(item.getActorId()));
            row.put("connectionName", resolveIntegrationConnectionName(safeString(item.getApiId()), normalizePerformanceUri(item.getRequestUri()), isEn));
            row.put("requestUri", normalizePerformanceUri(item.getRequestUri()));
            row.put("status", firstNonBlank(safeString(item.getResultStatus()), safeString(item.getErrorType()), "ERROR"));
            row.put("detail", firstNonBlank(safeString(item.getMessage()), safeString(item.getErrorType()), safeString(item.getSourceType())));
            row.put("targetRoute", !safeString(item.getApiId()).isEmpty()
                    ? appendQuery(localizedAdminPath("/system/error-log", isEn), "apiId", safeString(item.getApiId()))
                    : appendQuery(localizedAdminPath("/system/error-log", isEn), "searchKeyword", safeString(item.getRequestUri())));
            rows.add(row);
        }
        for (TraceEventRecordVO item : traceEvents) {
            if (item == null) {
                continue;
            }
            String resultCode = safeString(item.getResultCode()).toUpperCase(Locale.ROOT);
            String severity = resultCode.contains("FAIL") || resultCode.contains("ERROR")
                    ? "DANGER"
                    : item.getDurationMs() != null && item.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS ? "WARNING" : "NEUTRAL";
            Map<String, String> row = new LinkedHashMap<>();
            row.put("id", firstNonBlank(safeString(item.getEventId()), safeString(item.getTraceId()), safeString(item.getApiId())));
            row.put("occurredAt", safeString(item.getCreatedAt()));
            row.put("logType", "TRACE");
            row.put("severity", severity);
            row.put("traceId", safeString(item.getTraceId()));
            row.put("apiId", safeString(item.getApiId()));
            row.put("actorId", safeString(item.getPageId()));
            row.put("connectionName", resolveIntegrationConnectionName(safeString(item.getApiId()), "", isEn));
            row.put("requestUri", safeString(item.getComponentId()));
            row.put("status", firstNonBlank(safeString(item.getResultCode()), safeString(item.getEventType()), "TRACE"));
            row.put("detail", firstNonBlank(
                    item.getDurationMs() == null ? "" : item.getDurationMs() + "ms",
                    safeString(item.getEventType()),
                    safeString(item.getFunctionId())));
            row.put("targetRoute", appendQuery(localizedAdminPath("/system/unified_log", isEn), "traceId", safeString(item.getTraceId())));
            rows.add(row);
        }
        rows.sort(Comparator.comparing((Map<String, String> row) -> safeString(row.get("occurredAt")), Comparator.reverseOrder()));
        return rows.stream().limit(120).collect(Collectors.toList());
    }

    private String usageDateKey(String value) {
        String normalized = safeString(value);
        return normalized.length() >= 10 ? normalized.substring(0, 10) : normalized;
    }

    private double parsePercentageValue(String value) {
        String normalized = safeString(value).replace("%", "");
        if (normalized.isEmpty()) {
            return 0D;
        }
        try {
            return Double.parseDouble(normalized);
        } catch (NumberFormatException ex) {
            return 0D;
        }
    }

    private List<Map<String, String>> buildExternalSyncRows(List<Map<String, String>> connectionRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> connection : connectionRows) {
            index++;
            String connectionId = firstNonBlank(safeString(connection.get("connectionId")), safeString(connection.get("apiId")), "SYNC-" + index);
            String syncMode = firstNonBlank(safeString(connection.get("syncMode")), "SCHEDULED");
            String operationStatus = safeString(connection.get("operationStatus")).toUpperCase(Locale.ROOT);
            long errorCount = parsePositiveLong(connection.get("errorCount"), 0L);
            long avgDurationMs = parsePositiveLong(connection.get("avgDurationMs"), 0L);
            long backlogCount = "WEBHOOK".equalsIgnoreCase(syncMode)
                    ? Math.max(0L, errorCount)
                    : Math.max(0L, errorCount * 2L + (avgDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS ? 3L : 0L) + (index % 3L));

            Map<String, String> row = new LinkedHashMap<>();
            row.put("jobId", "EXT-" + String.format(Locale.ROOT, "%03d", index));
            row.put("connectionId", connectionId);
            row.put("connectionName", safeString(connection.get("connectionName")));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("syncMode", syncMode);
            row.put("triggerType", resolveExternalSyncTriggerType(syncMode));
            row.put("schedule", resolveExternalSyncSchedule(syncMode, index, isEn));
            row.put("endpointUrl", safeString(connection.get("endpointUrl")));
            row.put("lastSyncAt", firstNonBlank(safeString(connection.get("lastSeenAt")), "2026-03-30 09:00"));
            row.put("nextSyncAt", resolveExternalSyncNextRun(syncMode, index, isEn));
            row.put("backlogCount", String.valueOf(backlogCount));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("status", resolveExternalSyncStatus(operationStatus, errorCount, backlogCount, avgDurationMs));
            row.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalWebhookRows(List<Map<String, String>> connectionRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> connection : connectionRows) {
            String syncMode = safeString(connection.get("syncMode")).toUpperCase(Locale.ROOT);
            if (!"WEBHOOK".equals(syncMode) && !"HYBRID".equals(syncMode)) {
                continue;
            }
            index++;
            String connectionId = firstNonBlank(safeString(connection.get("connectionId")), safeString(connection.get("apiId")), "WEBHOOK-" + index);
            long errorCount = parsePositiveLong(connection.get("errorCount"), 0L);
            long avgDurationMs = parsePositiveLong(connection.get("avgDurationMs"), 0L);
            String operationStatus = safeString(connection.get("operationStatus")).toUpperCase(Locale.ROOT);

            Map<String, String> row = new LinkedHashMap<>();
            row.put("webhookId", "WH-" + String.format(Locale.ROOT, "%03d", index));
            row.put("connectionId", connectionId);
            row.put("connectionName", safeString(connection.get("connectionName")));
            row.put("partnerName", safeString(connection.get("partnerName")));
            row.put("endpointUrl", safeString(connection.get("endpointUrl")));
            row.put("syncMode", syncMode);
            row.put("status", resolveExternalSyncStatus(operationStatus, errorCount, Math.max(0L, errorCount), avgDurationMs));
            row.put("signatureStatus", errorCount > 2L ? (isEn ? "Rotate required" : "교체 필요") : (isEn ? "Healthy" : "정상"));
            row.put("lastEventAt", firstNonBlank(safeString(connection.get("lastSeenAt")), "2026-03-30 09:00"));
            row.put("deliveryWindow", firstNonBlank(safeString(connection.get("maintenanceWindow")), isEn ? "24x7 with 5m retry window" : "상시 운영 / 5분 재시도"));
            row.put("ownerName", firstNonBlank(safeString(connection.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("failedCount", String.valueOf(Math.max(0L, errorCount)));
            row.put("successRate", resolveWebhookSuccessRate(errorCount, avgDurationMs) + "%");
            row.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId));
            rows.add(row);
        }

        if (rows.isEmpty()) {
            Map<String, String> sample = new LinkedHashMap<>();
            sample.put("webhookId", "WH-001");
            sample.put("connectionId", "EXT-WEBHOOK-DEMO");
            sample.put("connectionName", isEn ? "Partner Event Relay" : "파트너 이벤트 릴레이");
            sample.put("partnerName", isEn ? "Demo Agency" : "샘플 기관");
            sample.put("endpointUrl", "https://partner.example.com/webhooks/carbonet");
            sample.put("syncMode", "WEBHOOK");
            sample.put("status", "REVIEW");
            sample.put("signatureStatus", isEn ? "Rotation overdue" : "교체 지연");
            sample.put("lastEventAt", "2026-03-30 09:00");
            sample.put("deliveryWindow", isEn ? "24x7 with manual fallback" : "상시 운영 / 수동 대체");
            sample.put("ownerName", isEn ? "Integration Team" : "외부연계팀");
            sample.put("failedCount", "3");
            sample.put("successRate", "97%");
            sample.put("targetRoute", localizedAdminPath("/external/connection_add", isEn));
            rows.add(sample);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalWebhookDeliveryRows(List<Map<String, String>> webhookRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> webhook : webhookRows) {
            index++;
            long failedCount = parsePositiveLong(webhook.get("failedCount"), 0L);
            long retriedCount = failedCount == 0L ? 0L : failedCount + (index % 3L);
            Map<String, String> row = new LinkedHashMap<>();
            row.put("deliveryId", "DLV-" + String.format(Locale.ROOT, "%03d", index));
            row.put("connectionName", safeString(webhook.get("connectionName")));
            row.put("eventType", resolveWebhookEventType(index, isEn));
            row.put("retryPolicy", index % 2 == 0 ? "EXP_BACKOFF_5" : "LINEAR_3");
            row.put("timeoutSeconds", String.valueOf(15 + (index % 3) * 5));
            row.put("failedCount", String.valueOf(failedCount));
            row.put("retriedCount", String.valueOf(retriedCount));
            row.put("deadLetterPolicy", index % 2 == 0 ? "DLQ_AFTER_5" : "DIGEST_AFTER_3");
            row.put("lastDeliveryAt", firstNonBlank(safeString(webhook.get("lastEventAt")), "2026-03-30 09:00"));
            row.put("status", safeString(webhook.get("status")));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalSyncQueueRows(List<Map<String, String>> syncRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> syncRow : syncRows.stream().limit(6).collect(Collectors.toList())) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("queueId", "Q-" + safeString(syncRow.get("jobId")));
            row.put("queueName", safeString(syncRow.get("connectionName")) + " " + (isEn ? "sync queue" : "동기화 큐"));
            row.put("backlogCount", safeString(syncRow.get("backlogCount")));
            row.put("consumerNode", "integration-node-" + ((rows.size() % 3) + 1));
            row.put("lastMessageAt", safeString(syncRow.get("lastSyncAt")));
            row.put("status", safeString(syncRow.get("status")));
            rows.add(row);
        }
        rows.sort(Comparator.comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("backlogCount"), 0L)).reversed());
        return rows;
    }

    private List<Map<String, String>> buildExternalSyncExecutionRows(List<Map<String, String>> syncRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> syncRow : syncRows.stream().limit(8).collect(Collectors.toList())) {
            index++;
            long backlogCount = parsePositiveLong(syncRow.get("backlogCount"), 0L);
            String status = safeString(syncRow.get("status"));
            Map<String, String> row = new LinkedHashMap<>();
            row.put("executedAt", safeString(syncRow.get("lastSyncAt")));
            row.put("jobId", safeString(syncRow.get("jobId")));
            row.put("connectionName", safeString(syncRow.get("connectionName")));
            row.put("triggerType", safeString(syncRow.get("triggerType")));
            row.put("result", "ACTIVE".equalsIgnoreCase(status) ? "SUCCESS" : ("DEGRADED".equalsIgnoreCase(status) ? "REVIEW" : status));
            row.put("duration", (12 + (index * 7)) + "s");
            row.put("message", backlogCount > 0
                    ? (isEn ? "Backlog remained after the last sync window." : "최근 동기화 이후 대기 메시지가 남아 있습니다.")
                    : (isEn ? "Latest sync window completed within policy." : "최근 동기화 주기가 기준 시간 내에 완료되었습니다."));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalRetryRows(List<Map<String, String>> syncRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> syncRow : syncRows) {
            long backlogCount = parsePositiveLong(syncRow.get("backlogCount"), 0L);
            String status = safeString(syncRow.get("status")).toUpperCase(Locale.ROOT);
            if (backlogCount <= 0L && "ACTIVE".equals(status)) {
                continue;
            }
            index++;
            long attemptCount = Math.max(1L, Math.min(5L, backlogCount > 0L ? backlogCount : index));
            long maxAttempts = "WEBHOOK".equalsIgnoreCase(safeString(syncRow.get("syncMode"))) ? 5L : 3L;
            String retryClass = resolveExternalRetryClass(syncRow, backlogCount, status);
            String guardStatus = resolveExternalRetryGuardStatus(backlogCount, status, attemptCount, maxAttempts, isEn);
            Map<String, String> row = new LinkedHashMap<>();
            row.put("queueId", "RQ-" + safeString(syncRow.get("jobId")));
            row.put("jobId", safeString(syncRow.get("jobId")));
            row.put("connectionId", safeString(syncRow.get("connectionId")));
            row.put("connectionName", safeString(syncRow.get("connectionName")));
            row.put("partnerName", safeString(syncRow.get("partnerName")));
            row.put("retryClass", retryClass);
            row.put("retryReason", resolveExternalRetryReason(syncRow, backlogCount, status, isEn));
            row.put("attemptCount", String.valueOf(attemptCount));
            row.put("maxAttempts", String.valueOf(maxAttempts));
            row.put("backlogCount", String.valueOf(backlogCount));
            row.put("guardStatus", guardStatus);
            row.put("nextRetryAt", resolveExternalRetryNextWindow(syncRow, backlogCount, status, index, isEn));
            row.put("ownerName", firstNonBlank(safeString(syncRow.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("status", resolveExternalRetryStatus(backlogCount, status, attemptCount, maxAttempts));
            row.put("targetRoute", safeString(syncRow.get("targetRoute")));
            rows.add(row);
        }
        if (rows.isEmpty() && !syncRows.isEmpty()) {
            Map<String, String> seed = syncRows.get(0);
            Map<String, String> row = new LinkedHashMap<>();
            row.put("queueId", "RQ-" + safeString(seed.get("jobId")));
            row.put("jobId", safeString(seed.get("jobId")));
            row.put("connectionId", safeString(seed.get("connectionId")));
            row.put("connectionName", safeString(seed.get("connectionName")));
            row.put("partnerName", safeString(seed.get("partnerName")));
            row.put("retryClass", "MANUAL");
            row.put("retryReason", isEn ? "Scheduled verification replay" : "정기 검증용 재처리");
            row.put("attemptCount", "1");
            row.put("maxAttempts", "3");
            row.put("backlogCount", "0");
            row.put("guardStatus", isEn ? "Healthy" : "정상");
            row.put("nextRetryAt", isEn ? "On operator approval" : "운영자 승인 시");
            row.put("ownerName", firstNonBlank(safeString(seed.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("status", "ACTIVE");
            row.put("targetRoute", safeString(seed.get("targetRoute")));
            rows.add(row);
        }
        rows.sort(Comparator
                .comparing((Map<String, String> row) -> safeString(row.get("status")))
                .thenComparingLong((Map<String, String> row) -> parsePositiveLong(row.get("backlogCount"), 0L)).reversed());
        return rows.stream().limit(10).collect(Collectors.toList());
    }

    private List<Map<String, String>> buildExternalRetryPolicyRows(List<Map<String, String>> retryRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> retryRow : retryRows) {
            index++;
            Map<String, String> row = new LinkedHashMap<>();
            row.put("queueId", safeString(retryRow.get("queueId")));
            row.put("connectionId", safeString(retryRow.get("connectionId")));
            row.put("connectionName", safeString(retryRow.get("connectionName")));
            row.put("retryPolicy", "MANUAL".equalsIgnoreCase(safeString(retryRow.get("retryClass")))
                    ? "OPERATOR_GATE + EXP_BACKOFF_3"
                    : ("WEBHOOK".equalsIgnoreCase(safeString(retryRow.get("retryClass"))) ? "SIGNATURE_CHECK + LINEAR_5" : "EXP_BACKOFF_3"));
            row.put("guardWindow", (5 + (index % 4) * 5) + (isEn ? " minutes" : "분"));
            row.put("fallbackPolicy", "BLOCKED".equalsIgnoreCase(safeString(retryRow.get("status")))
                    ? (isEn ? "Hold queue + notify owner" : "큐 보류 + 담당자 알림")
                    : (isEn ? "DLQ after limit" : "한도 초과 시 DLQ"));
            row.put("ownerName", safeString(retryRow.get("ownerName")));
            row.put("status", safeString(retryRow.get("status")));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildExternalRetryExecutionRows(List<Map<String, String>> retryRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int index = 0;
        for (Map<String, String> retryRow : retryRows.stream().limit(8).collect(Collectors.toList())) {
            index++;
            Map<String, String> row = new LinkedHashMap<>();
            row.put("executedAt", resolveExternalRetryExecutedAt(index));
            row.put("jobId", safeString(retryRow.get("jobId")));
            row.put("connectionName", safeString(retryRow.get("connectionName")));
            row.put("result", "BLOCKED".equalsIgnoreCase(safeString(retryRow.get("status")))
                    ? "BLOCKED"
                    : ("REVIEW".equalsIgnoreCase(safeString(retryRow.get("status"))) ? "REVIEW" : "SUCCESS"));
            row.put("duration", (9 + index * 4) + "s");
            row.put("message", "BLOCKED".equalsIgnoreCase(safeString(retryRow.get("status")))
                    ? (isEn ? "Replay stayed blocked by duplicate or maintenance guard." : "중복 또는 점검 보호장치로 재처리가 차단되었습니다.")
                    : (isEn ? "Retry window executed under current queue policy." : "현재 큐 정책에 따라 재처리 구간이 실행되었습니다."));
            rows.add(row);
        }
        return rows;
    }

    private String resolveExternalRetryClass(Map<String, String> syncRow, long backlogCount, String status) {
        String syncMode = safeString(syncRow.get("syncMode")).toUpperCase(Locale.ROOT);
        if ("WEBHOOK".equals(syncMode)) {
            return "WEBHOOK";
        }
        if (backlogCount >= 4L || "REVIEW".equals(status)) {
            return "MANUAL";
        }
        return "AUTO";
    }

    private String resolveExternalRetryReason(Map<String, String> syncRow, long backlogCount, String status, boolean isEn) {
        if (backlogCount >= 8L) {
            return isEn ? "Backlog exceeded the replay baseline." : "적체가 재처리 기준선을 초과했습니다.";
        }
        if ("REVIEW".equals(status)) {
            return isEn ? "Repeated error or latency drift requires operator review." : "반복 오류 또는 지연 증가로 운영 검토가 필요합니다.";
        }
        if ("WEBHOOK".equalsIgnoreCase(safeString(syncRow.get("syncMode")))) {
            return isEn ? "Webhook delivery failure needs guarded replay." : "웹훅 전달 실패로 보호된 재처리가 필요합니다.";
        }
        return isEn ? "Deferred sync window left replayable messages." : "지연된 동기화 구간에 재처리 가능한 메시지가 남아 있습니다.";
    }

    private String resolveExternalRetryGuardStatus(long backlogCount, String status, long attemptCount, long maxAttempts, boolean isEn) {
        if (attemptCount >= maxAttempts) {
            return isEn ? "Attempt limit reached" : "시도 한도 도달";
        }
        if ("REVIEW".equals(status) && backlogCount >= 6L) {
            return isEn ? "Maintenance hold" : "점검 보류";
        }
        if (backlogCount >= 3L) {
            return isEn ? "Duplicate guard active" : "중복 방지 활성";
        }
        return isEn ? "Healthy" : "정상";
    }

    private String resolveExternalRetryNextWindow(Map<String, String> syncRow, long backlogCount, String status, int index, boolean isEn) {
        if ("BLOCKED".equals(resolveExternalRetryStatus(backlogCount, status,
                Math.max(1L, Math.min(5L, backlogCount > 0L ? backlogCount : index)),
                "WEBHOOK".equalsIgnoreCase(safeString(syncRow.get("syncMode"))) ? 5L : 3L))) {
            return isEn ? "After maintenance approval" : "점검 승인 이후";
        }
        if ("WEBHOOK".equalsIgnoreCase(safeString(syncRow.get("syncMode")))) {
            return isEn ? "On next signed delivery window" : "다음 서명 검증 구간";
        }
        return "2026-03-30 1" + (index % 10) + ":" + String.format(Locale.ROOT, "%02d", (index * 7) % 60);
    }

    private String resolveExternalRetryStatus(long backlogCount, String syncStatus, long attemptCount, long maxAttempts) {
        if (attemptCount >= maxAttempts) {
            return "BLOCKED";
        }
        if ("REVIEW".equalsIgnoreCase(syncStatus) || backlogCount >= 5L) {
            return "REVIEW";
        }
        if ("DEGRADED".equalsIgnoreCase(syncStatus) || backlogCount > 0L) {
            return "DEGRADED";
        }
        return "ACTIVE";
    }

    private String resolveExternalRetryExecutedAt(int index) {
        return "2026-03-30 0" + ((index + 1) % 10) + ":" + String.format(Locale.ROOT, "%02d", (index * 11) % 60);
    }

    private String resolveExternalSyncTriggerType(String syncMode) {
        String normalized = safeString(syncMode).toUpperCase(Locale.ROOT);
        if ("WEBHOOK".equals(normalized)) {
            return "EVENT";
        }
        if ("HYBRID".equals(normalized)) {
            return "HYBRID";
        }
        return "SCHEDULE";
    }

    private String resolveExternalSyncSchedule(String syncMode, int index, boolean isEn) {
        String normalized = safeString(syncMode).toUpperCase(Locale.ROOT);
        if ("WEBHOOK".equals(normalized)) {
            return isEn ? "Webhook / event driven" : "웹훅 / 이벤트 기반";
        }
        if ("HYBRID".equals(normalized)) {
            return "0/" + (15 + (index % 3) * 15) + " * * * * + webhook";
        }
        return "0/" + (10 + (index % 4) * 10) + " * * * *";
    }

    private String resolveExternalSyncNextRun(String syncMode, int index, boolean isEn) {
        String normalized = safeString(syncMode).toUpperCase(Locale.ROOT);
        if ("WEBHOOK".equals(normalized)) {
            return isEn ? "On next event" : "다음 이벤트 수신 시";
        }
        return "2026-03-30 1" + (index % 10) + ":" + String.format(Locale.ROOT, "%02d", (index * 5) % 60);
    }

    private String resolveExternalSyncStatus(String operationStatus, long errorCount, long backlogCount, long avgDurationMs) {
        if ("DISABLED".equalsIgnoreCase(operationStatus)) {
            return "DISABLED";
        }
        if (errorCount >= 3 || backlogCount >= 8 || avgDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS) {
            return "REVIEW";
        }
        if (errorCount > 0 || backlogCount > 0) {
            return "DEGRADED";
        }
        return "ACTIVE";
    }

    private long resolveWebhookSuccessRate(long errorCount, long avgDurationMs) {
        long penalty = Math.min(18L, errorCount * 3L + (avgDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS ? 4L : 0L));
        return Math.max(81L, 100L - penalty);
    }

    private String resolveWebhookEventType(int index, boolean isEn) {
        switch (index % 4) {
            case 1:
                return isEn ? "Emission result updated" : "배출결과 변경";
            case 2:
                return isEn ? "Approval status changed" : "승인 상태 변경";
            case 3:
                return isEn ? "Member access incident" : "회원 접근 이상";
            default:
                return isEn ? "Batch completion digest" : "배치 완료 요약";
        }
    }

    private List<Map<String, String>> buildOperationsCenterSummaryCards(
            int memberApprovalCount,
            int companyApprovalCount,
            int memberCount,
            int companyCount,
            int srTicketCount,
            Map<String, String> memberSignals,
            Map<String, String> integrationSignals,
            Map<String, String> contentSignals,
            Map<String, String> operationsToolSignals,
            EmissionResultFilterSnapshot emissionSnapshot,
            List<Map<String, String>> monitoringEvents,
            List<Map<String, String>> errorRows,
            List<Map<String, String>> schedulerSummary,
            boolean isEn) {
        List<Map<String, String>> cards = new ArrayList<>();
        cards.add(summaryCard(
                "approval",
                "MEMBER",
                isEn ? "Approval Queue" : "승인 대기",
                String.valueOf(memberApprovalCount + companyApprovalCount),
                isEn ? "Pending member and company approvals." : "회원 및 회원사 승인 대기 건수입니다.",
                localizedAdminPath("/member/approve", isEn)));
        cards.add(summaryCard(
                "member-base",
                "MEMBER",
                isEn ? "Member / Company Issues" : "회원/회원사 점검",
                safeString(memberSignals.get("issueCount")),
                isEn
                        ? "Pending approvals plus dormant, withdrawn, or blocked membership issues."
                        : "승인 대기와 휴면, 탈퇴, 차단 회원사 이슈를 합산한 건수입니다.",
                safeString(memberSignals.get("targetRoute"))));
        cards.add(summaryCard(
                "emission",
                "EMISSION",
                isEn ? "Emission Review Queue" : "배출 검토 대기",
                String.valueOf(emissionSnapshot.getReviewCount()),
                isEn ? "Emission results waiting for review." : "검토가 필요한 배출 결과 건수입니다.",
                appendQuery(localizedAdminPath("/emission/result_list", isEn), "resultStatus", "REVIEW")));
        cards.add(summaryCard(
                "ops-tools",
                "OPERATIONS_TOOLS",
                isEn ? "Operations Tool Alerts" : "운영도구 경고",
                safeString(operationsToolSignals.get("attentionCount")),
                isEn
                        ? "SR execution tickets that are blocked, failed, or ready for action."
                        : "차단, 실패, 또는 즉시 실행 준비가 필요한 SR 작업 건수입니다.",
                "0".equals(safeString(operationsToolSignals.get("attentionCount")))
                        ? localizedAdminPath("/system/sr-workbench", isEn)
                        : localizedAdminPath("/system/codex-request", isEn)));
        cards.add(summaryCard(
                "integration",
                "INTEGRATION",
                isEn ? "Integration Alerts" : "외부연계 경고",
                safeString(integrationSignals.get("recentApiErrorCount")),
                isEn ? "Recent API-linked errors detected from trace and log signals." : "trace 및 로그 기준 최근 API 연계 오류 건수입니다.",
                localizedAdminPath("/system/unified_log", isEn)));
        cards.add(summaryCard(
                "content",
                "CONTENT",
                isEn ? "Content Issues" : "콘텐츠 점검",
                safeString(contentSignals.get("contentIssueCount")),
                isEn ? "Pending help or sitemap content checks in admin operations." : "관리자 운영에서 점검이 필요한 도움말/사이트맵 이슈 건수입니다.",
                "0".equals(safeString(contentSignals.get("contentIssueCount")))
                        ? localizedAdminPath("/content/sitemap", isEn)
                        : appendQuery(localizedAdminPath("/system/help-management", isEn), "pageId", "operations-center")));
        cards.add(summaryCard(
                "system-alerts",
                "SECURITY_SYSTEM",
                isEn ? "Security / System Alerts" : "보안/시스템 경고",
                String.valueOf(monitoringEvents.size() + errorRows.size() + parsePositiveInt(resolveSchedulerAlertCount(schedulerSummary), 0)),
                isEn ? "Critical monitoring, error, and scheduler items." : "보안 탐지, 오류, 스케줄러 경고를 합산합니다.",
                localizedAdminPath("/system/security-monitoring", isEn)));
        return cards;
    }

    private List<Map<String, String>> buildBatchSummary(
            List<Map<String, String>> jobRows,
            List<Map<String, String>> queueRows,
            List<Map<String, String>> nodeRows,
            List<Map<String, String>> executionRows,
            boolean isEn) {
        int activeJobs = 0;
        for (Map<String, String> row : jobRows) {
            if ("ACTIVE".equalsIgnoreCase(safeString(row.get("jobStatus")))) {
                activeJobs++;
            }
        }

        int backlogCount = 0;
        for (Map<String, String> row : queueRows) {
            backlogCount += parsePositiveInt(row.get("backlogCount"), 0);
        }

        int healthyNodes = 0;
        for (Map<String, String> row : nodeRows) {
            String status = safeString(row.get("status")).toUpperCase(Locale.ROOT);
            if ("HEALTHY".equals(status) || "STANDBY".equals(status)) {
                healthyNodes++;
            }
        }

        int failedExecutions = 0;
        for (Map<String, String> row : executionRows) {
            String result = safeString(row.get("result")).toUpperCase(Locale.ROOT);
            if ("FAILED".equals(result) || "REVIEW".equals(result)) {
                failedExecutions++;
            }
        }

        List<Map<String, String>> summary = new ArrayList<>();
        summary.add(summaryCard(isEn ? "Active Jobs" : "활성 잡", String.valueOf(activeJobs),
                isEn ? "Jobs currently enabled for scheduled or manual execution." : "정기 또는 수동 실행 대상으로 활성화된 잡 수입니다."));
        summary.add(summaryCard(isEn ? "Queue Backlog" : "큐 적체", String.valueOf(backlogCount),
                isEn ? "Pending batch messages that still need to be consumed." : "아직 소비되지 않은 배치 대기 메시지 수입니다."));
        summary.add(summaryCard(isEn ? "Healthy Nodes" : "정상 노드", String.valueOf(healthyNodes),
                isEn ? "Worker nodes that can safely accept new workloads." : "새 작업을 안전하게 받을 수 있는 워커 노드 수입니다."));
        summary.add(summaryCard(isEn ? "Failed / Review Runs" : "실패/재검토 실행", String.valueOf(failedExecutions),
                isEn ? "Recent batch runs that require follow-up." : "후속 조치가 필요한 최근 배치 실행 건수입니다."));
        return summary;
    }

    private List<Map<String, String>> buildBatchJobRows(List<Map<String, String>> schedulerRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> row : schedulerRows) {
            Map<String, String> batchRow = new LinkedHashMap<>(row);
            batchRow.put("queueName", resolveBatchQueueName(safeString(row.get("jobId")), isEn));
            batchRow.put("note", resolveBatchJobNote(safeString(row.get("jobId")), isEn));
            rows.add(batchRow);
        }
        return rows;
    }

    private List<Map<String, String>> buildBatchNodeRows(List<Map<String, String>> schedulerRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> row : schedulerRows) {
            Map<String, String> nodeRow = new LinkedHashMap<>(row);
            nodeRow.put("affinity", resolveBatchNodeAffinity(safeString(row.get("nodeId")), isEn));
            rows.add(nodeRow);
        }
        return rows;
    }

    private List<Map<String, String>> buildBatchQueueRows(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(batchQueueRow("Q-SETTLEMENT", isEn ? "Settlement aggregation queue" : "정산 집계 큐", "124", "batch-node-01", "2026-03-13 11:46", "WARN"));
        rows.add(batchQueueRow("Q-CERT", isEn ? "Certificate sync queue" : "인증서 동기화 큐", "8", "batch-node-02", "2026-03-13 11:44", "HEALTHY"));
        rows.add(batchQueueRow("Q-TOKEN", isEn ? "External token refresh queue" : "외부 토큰 갱신 큐", "17", "batch-node-03", "2026-03-13 11:41", "DEGRADED"));
        rows.add(batchQueueRow("Q-BACKFILL", isEn ? "Manual backfill queue" : "수동 보정 큐", "3", "batch-node-03", "2026-03-12 18:10", "REVIEW"));
        return rows;
    }

    private Map<String, String> batchQueueRow(
            String queueId,
            String queueName,
            String backlogCount,
            String consumerNode,
            String lastMessageAt,
            String status) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("queueId", queueId);
        row.put("queueName", queueName);
        row.put("backlogCount", backlogCount);
        row.put("consumerNode", consumerNode);
        row.put("lastMessageAt", lastMessageAt);
        row.put("status", status);
        return row;
    }

    private List<Map<String, String>> buildBatchRunbooks(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(runbookRow(
                isEn ? "Backlog spike response" : "적체 급증 대응",
                isEn ? "Check queue owner, replay guard, and downstream DB pressure before forcing a consumer scale-up."
                        : "소비 노드, 재처리 가드, 하위 DB 부하를 먼저 확인한 뒤 소비자를 증설합니다."));
        rows.add(runbookRow(
                isEn ? "Manual rerun guardrail" : "수동 재실행 가드레일",
                isEn ? "Leave an execution reason and a rollback owner before rerunning settlement or token jobs manually."
                        : "정산/토큰 잡을 수동 재실행할 때는 실행 사유와 롤백 담당자를 먼저 남깁니다."));
        rows.add(runbookRow(
                isEn ? "Node degradation triage" : "노드 성능 저하 점검",
                isEn ? "Move heavy queues away from degraded nodes first, then inspect heartbeat lag and JVM pressure."
                        : "성능 저하 노드에서는 무거운 큐를 먼저 분리하고 heartbeat 지연과 JVM 압박을 점검합니다."));
        return rows;
    }

    private Map<String, String> runbookRow(String title, String body) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("body", body);
        return row;
    }

    private String resolveBatchQueueName(String jobId, boolean isEn) {
        switch (safeString(jobId).toUpperCase(Locale.ROOT)) {
            case "SCH-001":
                return isEn ? "Settlement aggregation queue" : "정산 집계 큐";
            case "SCH-002":
                return isEn ? "Certificate sync queue" : "인증서 동기화 큐";
            case "SCH-003":
                return isEn ? "External token refresh queue" : "외부 토큰 갱신 큐";
            case "SCH-004":
                return isEn ? "Manual backfill queue" : "수동 보정 큐";
            default:
                return isEn ? "General batch queue" : "일반 배치 큐";
        }
    }

    private String resolveBatchJobNote(String jobId, boolean isEn) {
        switch (safeString(jobId).toUpperCase(Locale.ROOT)) {
            case "SCH-001":
                return isEn ? "High-volume settlement aggregation job." : "대용량 정산 집계 잡입니다.";
            case "SCH-002":
                return isEn ? "Certificate cache and expiry synchronization." : "인증서 캐시 및 만료 동기화 작업입니다.";
            case "SCH-003":
                return isEn ? "Integration token refresh with retry queue." : "재시도 큐를 가진 연계 토큰 갱신 작업입니다.";
            case "SCH-004":
                return isEn ? "Operator-approved manual correction flow." : "운영자 승인 후 수행하는 수동 보정 흐름입니다.";
            default:
                return "";
        }
    }

    private String resolveBatchNodeAffinity(String nodeId, boolean isEn) {
        switch (safeString(nodeId).toLowerCase(Locale.ROOT)) {
            case "batch-node-01":
                return isEn ? "Settlement / nightly aggregation" : "정산 / 야간 집계";
            case "batch-node-02":
                return isEn ? "Certificate / standby failover" : "인증서 / 대기 failover";
            case "batch-node-03":
                return isEn ? "Token refresh / manual backfill" : "토큰 갱신 / 수동 보정";
            default:
                return isEn ? "Shared batch queues" : "공용 배치 큐";
        }
    }

    private List<Map<String, String>> buildOperationsCenterPriorityItems(
            List<Map<String, String>> memberApprovalRows,
            List<Map<String, String>> companyApprovalRows,
            List<EmissionResultSummaryView> emissionItems,
            List<Map<String, String>> srTicketRows,
            List<Map<String, String>> integrationPriorityItems,
            List<Map<String, String>> contentPriorityItems,
            List<Map<String, String>> monitoringEvents,
            List<Map<String, String>> errorRows,
            List<Map<String, String>> schedulerExecutions,
            boolean isEn) {
        List<Map<String, String>> items = new ArrayList<>();
        int memberLimit = Math.min(2, memberApprovalRows.size());
        for (int index = 0; index < memberLimit; index++) {
            Map<String, String> row = memberApprovalRows.get(index);
            items.add(priorityItem(
                    safeString(row.get("memberId")),
                    "MEMBER",
                    "APPROVAL",
                    "WARNING",
                    firstNonBlank(safeString(row.get("memberName")), safeString(row.get("memberId")), isEn ? "Pending member approval" : "회원 승인 대기"),
                    firstNonBlank(
                            safeString(row.get("companyName")),
                            safeString(row.get("departmentName")),
                            safeString(row.get("membershipTypeLabel"))),
                    safeString(row.get("joinDate")),
                    firstNonBlank(safeString(row.get("detailUrl")), localizedAdminPath("/member/approve", isEn))));
        }
        if (items.size() < 4) {
            int companyLimit = Math.min(2, companyApprovalRows.size());
            for (int index = 0; index < companyLimit; index++) {
                Map<String, String> row = companyApprovalRows.get(index);
                items.add(priorityItem(
                        safeString(row.get("insttId")),
                        "MEMBER",
                        "COMPANY_APPROVAL",
                        "WARNING",
                        firstNonBlank(safeString(row.get("companyName")), isEn ? "Pending company approval" : "회원사 승인 대기"),
                        firstNonBlank(
                                safeString(row.get("representativeName")),
                                safeString(row.get("businessNumber")),
                                safeString(row.get("membershipTypeLabel"))),
                        safeString(row.get("statusLabel")),
                        firstNonBlank(safeString(row.get("detailUrl")), localizedAdminPath("/member/company-approve", isEn))));
                if (items.size() >= 4) {
                    break;
                }
            }
        }
        if (items.size() < 6) {
            for (EmissionResultSummaryView item : emissionItems) {
                if (!isEmissionReviewCandidate(item)) {
                    continue;
                }
                items.add(priorityItem(
                        item.getResultId(),
                        "EMISSION",
                        "RESULT_REVIEW",
                        "WARNING",
                        firstNonBlank(item.getProjectName(), isEn ? "Emission review pending" : "배출 결과 검토 대기"),
                        firstNonBlank(item.getCompanyName(), item.getVerificationStatusLabel(), item.getResultStatusLabel()),
                        firstNonBlank(item.getCalculatedAt(), item.getVerificationStatusLabel()),
                        firstNonBlank(item.getDetailUrl(), appendQuery(localizedAdminPath("/emission/result_list", isEn), "resultStatus", "REVIEW"))));
                if (items.size() >= 6) {
                    break;
                }
            }
        }
        if (items.size() < 8) {
            for (Map<String, String> row : srTicketRows) {
                String executionStatus = safeString(row.get("executionStatus")).toUpperCase(Locale.ROOT);
                if (!(executionStatus.contains("READY")
                        || executionStatus.contains("RUNNING")
                        || executionStatus.contains("FAILED")
                        || executionStatus.contains("BLOCKED")
                        || executionStatus.contains("PLAN_COMPLETED"))) {
                    continue;
                }
                items.add(priorityItem(
                        safeString(row.get("ticketId")),
                        "OPERATIONS_TOOLS",
                        "SR_WORKBENCH",
                        resolveSrTicketSeverity(executionStatus),
                        firstNonBlank(safeString(row.get("summary")), safeString(row.get("pageLabel")), isEn ? "SR workbench ticket" : "SR 워크벤치 티켓"),
                        firstNonBlank(safeString(row.get("executionComment")), safeString(row.get("executionStatus")), safeString(row.get("status"))),
                        firstNonBlank(safeString(row.get("queueSubmittedAt")), safeString(row.get("createdAt"))),
                        localizedAdminPath("/system/sr-workbench", isEn)));
                if (items.size() >= 8) {
                    break;
                }
            }
        }
        if (items.size() < 8) {
            for (Map<String, String> row : integrationPriorityItems) {
                items.add(new LinkedHashMap<>(row));
                if (items.size() >= 8) {
                    break;
                }
            }
        }
        if (items.size() < 8) {
            for (Map<String, String> row : contentPriorityItems) {
                items.add(new LinkedHashMap<>(row));
                if (items.size() >= 8) {
                    break;
                }
            }
        }
        for (Map<String, String> event : monitoringEvents) {
            if (items.size() >= 8) {
                break;
            }
            String severity = safeString(event.get("severity"));
            if (!severity.toUpperCase(Locale.ROOT).contains("CRITICAL")
                    && !severity.toUpperCase(Locale.ROOT).contains("HIGH")) {
                continue;
            }
            items.add(priorityItem(
                    safeString(event.get("fingerprint")),
                    "SECURITY_SYSTEM",
                    "SECURITY",
                    severity,
                    safeString(event.get("title")),
                    firstNonBlank(
                            safeString(event.get("detail")),
                            safeString(event.get("stateNote"))),
                    safeString(event.get("detectedAt")),
                    appendQuery(localizedAdminPath("/system/security-monitoring", isEn), "fingerprint", safeString(event.get("fingerprint")))));
        }
        if (items.size() < 6) {
            for (Map<String, String> row : errorRows) {
                items.add(priorityItem(
                        safeString(row.get("logId")),
                        "SECURITY_SYSTEM",
                        "ERROR",
                        "WARNING",
                        firstNonBlank(safeString(row.get("errorType")), isEn ? "Error log" : "에러 로그"),
                        firstNonBlank(safeString(row.get("errorMessage")), safeString(row.get("searchableText")), safeString(row.get("requestUri"))),
                        firstNonBlank(safeString(row.get("createdAt")), safeString(row.get("errorAt"))),
                        appendQuery(localizedAdminPath("/system/error-log", isEn), "searchKeyword", safeString(row.get("requestUri")))));
                if (items.size() >= 6) {
                    break;
                }
            }
        }
        if (items.size() < 8) {
            for (Map<String, String> row : schedulerExecutions) {
                String result = safeString(row.get("result")).toUpperCase(Locale.ROOT);
                if (!(result.contains("FAIL") || result.contains("REVIEW") || result.contains("ERROR"))) {
                    continue;
                }
                items.add(priorityItem(
                        safeString(row.get("jobId")) + "-" + safeString(row.get("executedAt")),
                        "SECURITY_SYSTEM",
                        "SCHEDULER",
                        result.contains("FAIL") ? "CRITICAL" : "WARNING",
                        firstNonBlank(safeString(row.get("jobId")), isEn ? "Scheduler execution" : "스케줄러 실행"),
                        safeString(row.get("message")),
                        safeString(row.get("executedAt")),
                        appendQuery(localizedAdminPath("/system/scheduler", isEn), "jobStatus", "REVIEW")));
                if (items.size() >= 8) {
                    break;
                }
            }
        }
        return items;
    }

    private List<Map<String, String>> buildSensorListRows(
            List<Map<String, String>> monitoringEvents,
            List<Map<String, String>> blockCandidateRows,
            boolean isEn) {
        Map<String, Map<String, String>> blockCandidatesByFingerprint = new LinkedHashMap<>();
        for (Map<String, String> candidate : blockCandidateRows) {
            String fingerprint = safeString(candidate.get("sourceFingerprint"));
            if (!fingerprint.isEmpty()) {
                blockCandidatesByFingerprint.put(fingerprint, candidate);
            }
        }

        Map<String, Integer> groupedSignalCount = new LinkedHashMap<>();
        for (Map<String, String> event : monitoringEvents) {
            String groupKey = firstNonBlank(
                    extractMonitoringTargetUrl(safeString(event.get("detail"))),
                    extractMonitoringSourceIp(safeString(event.get("detail"))),
                    resolveSensorTypeCode(event));
            groupedSignalCount.merge(groupKey, 1, Integer::sum);
        }

        List<Map<String, String>> rows = new ArrayList<>();
        int index = 1;
        for (Map<String, String> event : monitoringEvents) {
            String fingerprint = safeString(event.get("fingerprint"));
            Map<String, String> blockCandidate = blockCandidatesByFingerprint.getOrDefault(fingerprint, Collections.emptyMap());
            String typeCode = resolveSensorTypeCode(event);
            String targetUrl = extractMonitoringTargetUrl(safeString(event.get("detail")));
            String sourceIp = extractMonitoringSourceIp(safeString(event.get("detail")));
            String groupKey = firstNonBlank(targetUrl, sourceIp, typeCode);
            String statusCode = resolveSensorStatusCode(event, blockCandidate);

            Map<String, String> row = new LinkedHashMap<>();
            row.put("sensorId", String.format(Locale.ROOT, "SNS-%03d", index++));
            row.put("fingerprint", fingerprint);
            row.put("sensorName", firstNonBlank(safeString(event.get("title")), isEn ? "Monitoring sensor" : "모니터링 센서"));
            row.put("sensorType", typeCode);
            row.put("sensorTypeLabel", resolveSensorTypeLabel(typeCode, isEn));
            row.put("severity", safeString(event.get("severity")));
            row.put("status", statusCode);
            row.put("statusLabel", resolveSensorStatusLabel(statusCode, isEn));
            row.put("eventCount", String.valueOf(groupedSignalCount.getOrDefault(groupKey, 1)));
            row.put("detectedAt", safeString(event.get("detectedAt")));
            row.put("sourceIp", sourceIp);
            row.put("targetUrl", targetUrl);
            row.put("owner", firstNonBlank(safeString(event.get("stateOwner")), safeString(blockCandidate.get("owner"))));
            row.put("note", firstNonBlank(safeString(event.get("stateNote")), safeString(blockCandidate.get("reason"))));
            row.put("blockStatus", safeString(blockCandidate.get("status")));
            row.put("blockStatusLabel", resolveBlockStatusLabel(safeString(blockCandidate.get("status")), isEn));
            row.put("blockId", safeString(blockCandidate.get("blockId")));
            row.put("detail", safeString(event.get("detail")));
            row.put("targetRoute", appendQuery(localizedAdminPath("/system/security-monitoring", isEn), "fingerprint", fingerprint));
            row.put("sensorKey", groupKey);
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> buildSensorListSummary(
            List<Map<String, String>> sensorRows,
            List<Map<String, String>> blockCandidateRows,
            boolean isEn) {
        long alertCount = sensorRows.stream()
                .filter(row -> "ALERT".equalsIgnoreCase(safeString(row.get("status")))
                        || "BLOCKED".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        long reviewCount = sensorRows.stream()
                .filter(row -> "REVIEW".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        long activeBlockCount = blockCandidateRows.stream()
                .filter(row -> "ACTIVE".equalsIgnoreCase(safeString(row.get("status"))))
                .count();
        long stableCount = sensorRows.stream()
                .filter(row -> "STABLE".equalsIgnoreCase(safeString(row.get("status"))))
                .count();

        List<Map<String, String>> summary = new ArrayList<>();
        summary.add(summaryCard(
                "sensor-total",
                "SECURITY_SYSTEM",
                isEn ? "Registered Sensors" : "등록 센서",
                String.valueOf(sensorRows.size()),
                isEn ? "Current monitoring-derived sensor rows available in this list." : "현재 목록에 노출되는 모니터링 기반 센서 행 수",
                localizedAdminPath("/monitoring/sensor_list", isEn)));
        summary.add(summaryCard(
                "sensor-alert",
                "SECURITY_SYSTEM",
                isEn ? "Alert Sensors" : "경보 센서",
                String.valueOf(alertCount),
                isEn ? "Critical or blocked sensors that need immediate handling." : "즉시 확인이 필요한 위험 또는 차단 상태 센서 수",
                localizedAdminPath("/monitoring/sensor_list", isEn)));
        summary.add(summaryCard(
                "sensor-review",
                "SECURITY_SYSTEM",
                isEn ? "Review Queue" : "검토 대기",
                String.valueOf(reviewCount),
                isEn ? "Sensors with operator review or note follow-up still pending." : "운영자 검토 또는 메모 후속 조치가 남아 있는 센서 수",
                localizedAdminPath("/monitoring/sensor_list", isEn)));
        summary.add(summaryCard(
                "sensor-stable",
                "SECURITY_SYSTEM",
                isEn ? "Stable Sensors" : "안정 센서",
                String.valueOf(stableCount),
                isEn ? "Sensors without active escalation or block actions." : "활성 승격이나 차단 조치 없이 유지 중인 센서 수",
                localizedAdminPath("/monitoring/sensor_list", isEn)));
        summary.add(summaryCard(
                "sensor-block",
                "SECURITY_SYSTEM",
                isEn ? "Active Blocks" : "활성 차단",
                String.valueOf(activeBlockCount),
                isEn ? "Block candidates already promoted to active control." : "차단 후보 중 실제 활성 제어로 승격된 건수",
                localizedAdminPath("/system/blocklist", isEn)));
        return summary;
    }

    private String resolveSensorTypeCode(Map<String, String> event) {
        String title = safeString(event.get("title")).toLowerCase(Locale.ROOT);
        String detail = safeString(event.get("detail")).toLowerCase(Locale.ROOT);
        if (title.contains("login") || detail.contains("login")) {
            return "AUTH";
        }
        if (detail.contains("/admin") || title.contains("admin")) {
            return "ADMIN";
        }
        if (detail.contains("/api")) {
            return "API";
        }
        if (detail.contains("/system") || title.contains("scheduler") || title.contains("error")) {
            return "OPS";
        }
        return "WEB";
    }

    private String resolveSensorTypeLabel(String typeCode, boolean isEn) {
        switch (safeString(typeCode).toUpperCase(Locale.ROOT)) {
            case "AUTH":
                return isEn ? "Authentication" : "인증";
            case "ADMIN":
                return isEn ? "Admin Access" : "관리자 접근";
            case "API":
                return isEn ? "API Traffic" : "API 트래픽";
            case "OPS":
                return isEn ? "Operations" : "운영";
            default:
                return isEn ? "Web Access" : "웹 접근";
        }
    }

    private String resolveSensorStatusCode(Map<String, String> event, Map<String, String> blockCandidate) {
        String blockStatus = safeString(blockCandidate.get("status")).toUpperCase(Locale.ROOT);
        if ("ACTIVE".equals(blockStatus)) {
            return "BLOCKED";
        }
        if ("REVIEW".equals(blockStatus)) {
            return "REVIEW";
        }
        String stateStatus = safeString(event.get("stateStatus")).toUpperCase(Locale.ROOT);
        if ("IN_PROGRESS".equals(stateStatus) || "REVIEW".equals(stateStatus)) {
            return "REVIEW";
        }
        String severity = safeString(event.get("severity")).toUpperCase(Locale.ROOT);
        if (severity.contains("CRITICAL") || severity.contains("HIGH")) {
            return "ALERT";
        }
        return "STABLE";
    }

    private String resolveSensorStatusLabel(String statusCode, boolean isEn) {
        switch (safeString(statusCode).toUpperCase(Locale.ROOT)) {
            case "BLOCKED":
                return isEn ? "Blocked" : "차단";
            case "REVIEW":
                return isEn ? "Review" : "검토";
            case "ALERT":
                return isEn ? "Alert" : "경보";
            default:
                return isEn ? "Stable" : "안정";
        }
    }

    private String resolveBlockStatusLabel(String statusCode, boolean isEn) {
        switch (safeString(statusCode).toUpperCase(Locale.ROOT)) {
            case "ACTIVE":
                return isEn ? "Active Block" : "활성 차단";
            case "REVIEW":
                return isEn ? "Review Candidate" : "검토 후보";
            case "RELEASED":
                return isEn ? "Released" : "해제";
            default:
                return "";
        }
    }

    private String extractMonitoringSourceIp(String detail) {
        String normalized = safeString(detail);
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?:remote|ip)\\s*[:=]\\s*([^\\s,]+)", java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(normalized);
        if (matcher.find()) {
            return safeString(matcher.group(1));
        }
        return "";
    }

    private String extractMonitoringTargetUrl(String detail) {
        String normalized = safeString(detail);
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\/[-A-Za-z0-9_./?=&%]+)")
                .matcher(normalized);
        while (matcher.find()) {
            String candidate = safeString(matcher.group(1));
            if (candidate.startsWith("/")) {
                return candidate;
            }
        }
        return "";
    }

    private Map<String, String> buildMemberSignals(
            int memberApprovalCount,
            int companyApprovalCount,
            int withdrawnMemberCount,
            int dormantMemberCount,
            int blockedCompanyCount,
            int memberCount,
            int companyCount,
            boolean isEn) {
        Map<String, String> signals = new LinkedHashMap<>();
        int issueCount = memberApprovalCount + companyApprovalCount + withdrawnMemberCount + dormantMemberCount + blockedCompanyCount;
        String targetRoute = localizedAdminPath("/member/list", isEn);
        if (memberApprovalCount + companyApprovalCount > 0) {
            targetRoute = localizedAdminPath("/member/approve", isEn);
        } else if (dormantMemberCount > 0) {
            targetRoute = localizedAdminPath("/member/activate", isEn);
        } else if (withdrawnMemberCount > 0) {
            targetRoute = localizedAdminPath("/member/withdrawn", isEn);
        } else if (blockedCompanyCount > 0) {
            targetRoute = appendQuery(localizedAdminPath("/member/company_list", isEn), "sbscrbSttus", "X");
        }
        signals.put("issueCount", String.valueOf(issueCount));
        signals.put("memberApprovalCount", String.valueOf(memberApprovalCount));
        signals.put("companyApprovalCount", String.valueOf(companyApprovalCount));
        signals.put("withdrawnMemberCount", String.valueOf(withdrawnMemberCount));
        signals.put("dormantMemberCount", String.valueOf(dormantMemberCount));
        signals.put("blockedCompanyCount", String.valueOf(blockedCompanyCount));
        signals.put("memberCount", String.valueOf(memberCount));
        signals.put("companyCount", String.valueOf(companyCount));
        signals.put("targetRoute", targetRoute);
        return signals;
    }

    private Map<String, String> buildOperationsToolSignals(
            List<Map<String, String>> srTicketRows,
            boolean codexEnabled,
            boolean isEn) {
        Map<String, String> signals = new LinkedHashMap<>();
        int blockedCount = 0;
        int failedCount = 0;
        int readyCount = 0;
        for (Map<String, String> row : srTicketRows) {
            String executionStatus = safeString(row.get("executionStatus")).toUpperCase(Locale.ROOT);
            if (executionStatus.contains("BLOCKED")) {
                blockedCount++;
            }
            if (executionStatus.contains("FAILED")) {
                failedCount++;
            }
            if (executionStatus.contains("READY")
                    || executionStatus.contains("PLAN_COMPLETED")
                    || executionStatus.contains("APPROVED")) {
                readyCount++;
            }
        }
        int attentionCount = blockedCount + failedCount + readyCount + (codexEnabled ? 0 : 1);
        signals.put("blockedCount", String.valueOf(blockedCount));
        signals.put("failedCount", String.valueOf(failedCount));
        signals.put("readyCount", String.valueOf(readyCount));
        signals.put("attentionCount", String.valueOf(attentionCount));
        signals.put("codexReadyLabel", codexEnabled ? (isEn ? "Ready" : "사용 가능") : (isEn ? "Disabled" : "비활성"));
        return signals;
    }

    private List<Map<String, String>> buildContentPriorityItems(
            List<?> adminSitemapSections,
            Map<String, Object> operationsCenterHelpPayload,
            Map<String, String> contentSignals,
            boolean isEn) {
        List<Map<String, String>> items = new ArrayList<>();
        boolean helpActive = !"N".equalsIgnoreCase(stringValue(operationsCenterHelpPayload.get("activeYn")));
        int helpStepCount = countListEntries(operationsCenterHelpPayload.get("items"));
        if (!helpActive) {
            items.add(priorityItem(
                    "operations-center-help-inactive",
                    "CONTENT",
                    "HELP_CONTENT",
                    "WARNING",
                    isEn ? "Operations center help is inactive" : "운영센터 도움말이 비활성 상태입니다",
                    isEn ? "Operators cannot open overlay guidance for this hub page." : "운영센터 화면에서 overlay 도움말을 열 수 없는 상태입니다.",
                    LocalDateTime.now().toString().replace('T', ' '),
                    appendQuery(localizedAdminPath("/system/help-management", isEn), "pageId", "operations-center")));
        }
        if (items.size() < 2 && helpStepCount == 0) {
            items.add(priorityItem(
                    "operations-center-help-empty",
                    "CONTENT",
                    "HELP_CONTENT",
                    "WARNING",
                    isEn ? "Operations center help steps are empty" : "운영센터 도움말 단계가 비어 있습니다",
                    isEn ? "The page is active but no guided help steps are registered." : "도움말은 활성일 수 있지만 안내 단계가 등록되지 않았습니다.",
                    LocalDateTime.now().toString().replace('T', ' '),
                    appendQuery(localizedAdminPath("/system/help-management", isEn), "pageId", "operations-center")));
        }
        if (items.size() < 2) {
            for (Object section : adminSitemapSections) {
                if (!(section instanceof SiteMapNode)) {
                    continue;
                }
                SiteMapNode node = (SiteMapNode) section;
                if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                    continue;
                }
                items.add(priorityItem(
                        firstNonBlank(safeString(node.getCode()), safeString(node.getLabel()), "empty-sitemap-section"),
                        "CONTENT",
                        "SITEMAP",
                        "INFO",
                        firstNonBlank(safeString(node.getLabel()), isEn ? "Empty sitemap section" : "빈 사이트맵 섹션"),
                        isEn ? "This admin sitemap section has no visible child pages." : "이 관리자 사이트맵 섹션에는 노출되는 하위 페이지가 없습니다.",
                        LocalDateTime.now().toString().replace('T', ' '),
                        localizedAdminPath("/content/sitemap", isEn)));
                if (items.size() >= 2) {
                    break;
                }
            }
        }
        return items;
    }

    private Map<String, String> buildContentSignals(
            List<?> adminSitemapSections,
            Map<String, Object> operationsCenterHelpPayload,
            boolean isEn) {
        Map<String, String> signals = new LinkedHashMap<>();
        boolean helpActive = !"N".equalsIgnoreCase(stringValue(operationsCenterHelpPayload.get("activeYn")));
        int helpStepCount = countListEntries(operationsCenterHelpPayload.get("items"));
        int emptySectionCount = 0;
        for (Object section : adminSitemapSections) {
            if (!(section instanceof SiteMapNode)) {
                continue;
            }
            SiteMapNode node = (SiteMapNode) section;
            if (node.getChildren() == null || node.getChildren().isEmpty()) {
                emptySectionCount++;
            }
        }
        int issueCount = (helpActive ? 0 : 1) + (helpStepCount == 0 ? 1 : 0) + emptySectionCount;
        signals.put("contentIssueCount", String.valueOf(issueCount));
        signals.put("emptySectionCount", String.valueOf(emptySectionCount));
        signals.put("helpActiveLabel", helpActive ? (isEn ? "Active" : "활성") : (isEn ? "Inactive" : "비활성"));
        signals.put("helpStepCount", String.valueOf(helpStepCount));
        return signals;
    }

    private List<Map<String, Object>> buildOperationsCenterWidgetGroups(
            int memberApprovalCount,
            int companyApprovalCount,
            int memberCount,
            int companyCount,
            EmissionResultFilterSnapshot emissionSnapshot,
            int srTicketCount,
            int srStackCount,
            boolean codexEnabled,
            Map<String, String> integrationSignals,
            int adminSitemapSectionCount,
            int operationsCenterHelpStepCount,
            boolean operationsCenterHelpActive,
            List<Map<String, String>> monitoringCards,
            List<Map<String, String>> errorRows,
            List<Map<String, String>> schedulerSummary,
            List<Map<String, String>> securityAuditRows,
            boolean isEn) {
        List<Map<String, Object>> groups = new ArrayList<>();
        groups.add(widgetGroup(
                "member-operations",
                "MEMBER",
                isEn ? "Member / Company Operations" : "회원/회원사 운영",
                isEn ? "Review approval backlogs and current managed member scope." : "승인 대기와 현재 운영 대상 회원 규모를 함께 확인합니다.",
                localizedAdminPath("/member/approve", isEn),
                List.of(
                        metricRow(isEn ? "Member approvals" : "회원 승인 대기", String.valueOf(memberApprovalCount)),
                        metricRow(isEn ? "Company approvals" : "회원사 승인 대기", String.valueOf(companyApprovalCount)),
                        metricRow(isEn ? "Members" : "회원 수", String.valueOf(memberCount)),
                        metricRow(isEn ? "Companies" : "회원사 수", String.valueOf(companyCount))),
                List.of(
                        navigationLink(isEn ? "Open approvals" : "승인 보기", localizedAdminPath("/member/approve", isEn)),
                        navigationLink(isEn ? "Company approvals" : "회원사 승인", localizedAdminPath("/member/company-approve", isEn)),
                        navigationLink(isEn ? "Member list" : "회원 목록", localizedAdminPath("/member/list", isEn)))));
        groups.add(widgetGroup(
                "emission-operations",
                "EMISSION",
                isEn ? "Emission / Business Operations" : "배출/업무 운영",
                isEn ? "Track review backlog and verification progress for emission results." : "배출 결과 검토 대기와 검증 진행 상태를 확인합니다.",
                appendQuery(localizedAdminPath("/emission/result_list", isEn), "resultStatus", "REVIEW"),
                List.of(
                        metricRow(isEn ? "Total results" : "전체 결과", String.valueOf(emissionSnapshot.getTotalCount())),
                        metricRow(isEn ? "Under review" : "검토 대기", String.valueOf(emissionSnapshot.getReviewCount())),
                        metricRow(isEn ? "Verified" : "검증 완료", String.valueOf(emissionSnapshot.getVerifiedCount())),
                        metricRow(isEn ? "Latest result" : "최신 결과", emissionSnapshot.getItems().isEmpty()
                                ? "-"
                                : firstNonBlank(emissionSnapshot.getItems().get(0).getCalculatedAt(), emissionSnapshot.getItems().get(0).getProjectName()))),
                List.of(
                        navigationLink(isEn ? "Review queue" : "검토 대기", appendQuery(localizedAdminPath("/emission/result_list", isEn), "resultStatus", "REVIEW")),
                        navigationLink(isEn ? "Result list" : "결과 목록", localizedAdminPath("/emission/result_list", isEn)),
                        navigationLink(isEn ? "Emission sites" : "배출지 관리", localizedAdminPath("/emission/site-management", isEn)))));
        groups.add(widgetGroup(
                "security",
                "SECURITY_SYSTEM",
                isEn ? "Security Monitoring" : "보안 모니터링",
                isEn ? "Track active detections and escalation candidates." : "현재 탐지와 조치 후보를 확인합니다.",
                localizedAdminPath("/system/security-monitoring", isEn),
                toMetricRowsFromSummary(monitoringCards, 4),
                List.of(
                        navigationLink(isEn ? "Monitoring" : "모니터링", localizedAdminPath("/system/security-monitoring", isEn)),
                        navigationLink(isEn ? "Sensor list" : "센서 목록", localizedAdminPath("/monitoring/sensor_list", isEn)),
                        navigationLink(isEn ? "Unified log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                        navigationLink(isEn ? "Audit" : "감사 이력", localizedAdminPath("/system/security-audit", isEn)))));
        groups.add(widgetGroup(
                "system-operations",
                "SECURITY_SYSTEM",
                isEn ? "System Operations" : "시스템 운영",
                isEn ? "Review error logs, scheduler alerts, and recent operator actions together." : "에러 로그, 스케줄러 경고, 최근 운영 조치를 함께 점검합니다.",
                localizedAdminPath("/system/error-log", isEn),
                List.of(
                        metricRow(isEn ? "Error rows" : "에러 건수", String.valueOf(errorRows.size())),
                        metricRow(isEn ? "Scheduler alerts" : "스케줄러 경고", resolveSchedulerAlertCount(schedulerSummary)),
                        metricRow(isEn ? "Recent actions" : "최근 조치", String.valueOf(securityAuditRows.size())),
                        metricRow(isEn ? "Latest actor" : "최근 수행자", valueFromFirst(securityAuditRows, "actor"))),
                List.of(
                        navigationLink(isEn ? "Error log" : "에러 로그", localizedAdminPath("/system/error-log", isEn)),
                        navigationLink(isEn ? "Scheduler" : "스케줄러", localizedAdminPath("/system/scheduler", isEn)),
                        navigationLink(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)))));
        groups.add(widgetGroup(
                "integration-operations",
                "INTEGRATION",
                isEn ? "External Integration" : "외부연계",
                isEn
                        ? "Track real API request/response traces and recent integration-side errors."
                        : "실제 API 요청/응답 trace와 최근 연계 오류를 기준으로 외부연계 상태를 점검합니다.",
                localizedAdminPath("/system/api-management-console", isEn),
                List.of(
                        metricRow(isEn ? "API request traces" : "API 요청 trace", safeString(integrationSignals.get("apiRequestTraceCount"))),
                        metricRow(isEn ? "API response traces" : "API 응답 trace", safeString(integrationSignals.get("apiResponseTraceCount"))),
                        metricRow(isEn ? "Recent API errors" : "최근 API 오류", safeString(integrationSignals.get("recentApiErrorCount"))),
                        metricRow(isEn ? "Observed APIs" : "관측된 API 수", safeString(integrationSignals.get("observedApiCount")))),
                List.of(
                        navigationLink(isEn ? "API management" : "API 관리", localizedAdminPath("/system/api-management-console", isEn)),
                        navigationLink(isEn ? "Unified log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                        navigationLink(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)))));
        groups.add(widgetGroup(
                "content-operations",
                "CONTENT",
                isEn ? "Content Operations" : "콘텐츠 운영",
                isEn ? "Track sitemap exposure and help content readiness." : "사이트맵 노출 구조와 도움말 운영 상태를 확인합니다.",
                localizedAdminPath("/content/sitemap", isEn),
                List.of(
                        metricRow(isEn ? "Sitemap sections" : "사이트맵 섹션", String.valueOf(adminSitemapSectionCount)),
                        metricRow(isEn ? "Center help steps" : "운영센터 도움말 단계", String.valueOf(operationsCenterHelpStepCount)),
                        metricRow(isEn ? "Center help active" : "운영센터 도움말 활성", operationsCenterHelpActive ? (isEn ? "Yes" : "예") : (isEn ? "No" : "아니오")),
                        metricRow(isEn ? "Content screens" : "콘텐츠 화면", "2")),
                List.of(
                        navigationLink(isEn ? "Admin sitemap" : "관리자 사이트맵", localizedAdminPath("/content/sitemap", isEn)),
                        navigationLink(isEn ? "Help management" : "도움말 운영", localizedAdminPath("/system/help-management", isEn)))));
        groups.add(widgetGroup(
                "ops-tooling",
                "OPERATIONS_TOOLS",
                isEn ? "Operations Tooling" : "운영도구",
                isEn ? "Track SR execution backlog, Codex readiness, and operations-center help content." : "SR 실행 대기, Codex 사용 가능 여부, 운영센터 도움말 상태를 함께 확인합니다.",
                localizedAdminPath("/system/sr-workbench", isEn),
                List.of(
                        metricRow(isEn ? "SR tickets" : "SR 티켓", String.valueOf(srTicketCount)),
                        metricRow(isEn ? "Stack items" : "스택 항목", String.valueOf(srStackCount)),
                        metricRow(isEn ? "Codex ready" : "Codex 사용 가능", codexEnabled ? (isEn ? "Yes" : "예") : (isEn ? "No" : "아니오")),
                        metricRow(isEn ? "Execution lane" : "실행 흐름", isEn ? "SR -> Plan -> Codex" : "SR -> 계획 -> Codex")),
                List.of(
                        navigationLink(isEn ? "SR workbench" : "SR 워크벤치", localizedAdminPath("/system/sr-workbench", isEn)),
                        navigationLink(isEn ? "Codex console" : "Codex 실행 콘솔", localizedAdminPath("/system/codex-request", isEn)))));
        return groups;
    }

    private List<Map<String, String>> buildIntegrationPriorityItems(boolean isEn) {
        List<Map<String, String>> items = new ArrayList<>();
        try {
            ErrorEventSearchVO apiErrorSearch = new ErrorEventSearchVO();
            apiErrorSearch.setFirstIndex(0);
            apiErrorSearch.setRecordCountPerPage(20);
            List<ErrorEventRecordVO> recentApiErrors = observabilityQueryService.selectErrorEventList(apiErrorSearch);
            for (ErrorEventRecordVO item : recentApiErrors) {
                if (item == null || safeString(item.getApiId()).isEmpty()) {
                    continue;
                }
                items.add(priorityItem(
                        firstNonBlank(safeString(item.getErrorId()), safeString(item.getTraceId()), safeString(item.getApiId())),
                        "INTEGRATION",
                        "API_ERROR",
                        resolveIntegrationSeverityFromResult(item.getResultStatus()),
                        firstNonBlank(safeString(item.getApiId()), isEn ? "API error" : "API 오류"),
                        firstNonBlank(
                                safeString(item.getMessage()),
                                safeString(item.getRequestUri()),
                                safeString(item.getErrorType())),
                        safeString(item.getCreatedAt()),
                        appendQuery(localizedAdminPath("/system/unified_log", isEn), "apiId", safeString(item.getApiId()))));
                if (items.size() >= 2) {
                    return items;
                }
            }

            AccessEventSearchVO accessSearch = new AccessEventSearchVO();
            accessSearch.setFirstIndex(0);
            accessSearch.setRecordCountPerPage(30);
            List<AccessEventRecordVO> recentAccessEvents = observabilityQueryService.selectAccessEventList(accessSearch);
            for (AccessEventRecordVO item : recentAccessEvents) {
                Integer responseStatus = item == null ? null : item.getResponseStatus();
                if (item == null
                        || safeString(item.getApiId()).isEmpty()
                        || responseStatus == null
                        || responseStatus < 400) {
                    continue;
                }
                items.add(priorityItem(
                        firstNonBlank(safeString(item.getEventId()), safeString(item.getTraceId()), safeString(item.getApiId())),
                        "INTEGRATION",
                        "API_RESPONSE",
                        responseStatus >= 500 ? "CRITICAL" : "WARNING",
                        firstNonBlank(safeString(item.getApiId()), isEn ? "API response issue" : "API 응답 이상"),
                        firstNonBlank(
                                safeString(item.getRequestUri()),
                                safeString(item.getErrorMessage()),
                                safeString(item.getFeatureType())),
                        safeString(item.getCreatedAt()),
                        appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", safeString(item.getApiId()))));
                if (items.size() >= 2) {
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to build integration priority items for operations center.", e);
        }
        return items;
    }

    private Map<String, String> buildIntegrationSignals() {
        Map<String, String> signals = new LinkedHashMap<>();
        signals.put("apiRequestTraceCount", "0");
        signals.put("apiResponseTraceCount", "0");
        signals.put("recentApiErrorCount", "0");
        signals.put("observedApiCount", "0");
        try {
            TraceEventSearchVO requestTraceSearch = new TraceEventSearchVO();
            requestTraceSearch.setFirstIndex(0);
            requestTraceSearch.setRecordCountPerPage(1);
            requestTraceSearch.setEventType("API_REQUEST");
            signals.put("apiRequestTraceCount", String.valueOf(observabilityQueryService.selectTraceEventCount(requestTraceSearch)));

            TraceEventSearchVO responseTraceSearch = new TraceEventSearchVO();
            responseTraceSearch.setFirstIndex(0);
            responseTraceSearch.setRecordCountPerPage(1);
            responseTraceSearch.setEventType("API_RESPONSE");
            signals.put("apiResponseTraceCount", String.valueOf(observabilityQueryService.selectTraceEventCount(responseTraceSearch)));

            TraceEventSearchVO requestTraceWindow = new TraceEventSearchVO();
            requestTraceWindow.setFirstIndex(0);
            requestTraceWindow.setRecordCountPerPage(100);
            requestTraceWindow.setEventType("API_REQUEST");

            TraceEventSearchVO responseTraceWindow = new TraceEventSearchVO();
            responseTraceWindow.setFirstIndex(0);
            responseTraceWindow.setRecordCountPerPage(100);
            responseTraceWindow.setEventType("API_RESPONSE");

            List<TraceEventRecordVO> recentRequestTraces = observabilityQueryService.selectTraceEventList(requestTraceWindow);
            List<TraceEventRecordVO> recentResponseTraces = observabilityQueryService.selectTraceEventList(responseTraceWindow);
            List<TraceEventRecordVO> recentApiTraces = new ArrayList<>();
            recentApiTraces.addAll(recentRequestTraces);
            recentApiTraces.addAll(recentResponseTraces);
            long observedApiCount = recentApiTraces.stream()
                    .map(item -> safeString(item == null ? null : item.getApiId()))
                    .filter(value -> !value.isEmpty())
                    .distinct()
                    .count();
            signals.put("observedApiCount", String.valueOf(observedApiCount));

            ErrorEventSearchVO apiErrorSearch = new ErrorEventSearchVO();
            apiErrorSearch.setFirstIndex(0);
            apiErrorSearch.setRecordCountPerPage(100);
            List<ErrorEventRecordVO> recentApiErrors = observabilityQueryService.selectErrorEventList(apiErrorSearch).stream()
                    .filter(item -> item != null && !safeString(item.getApiId()).isEmpty())
                    .collect(Collectors.toList());
            signals.put("recentApiErrorCount", String.valueOf(recentApiErrors.size()));
        } catch (Exception e) {
            log.warn("Failed to build integration signals for operations center.", e);
        }
        return signals;
    }

    private String resolveIntegrationSeverityFromResult(String resultStatus) {
        String normalized = safeString(resultStatus).toUpperCase(Locale.ROOT);
        if (normalized.contains("FAIL") || normalized.contains("ERROR") || normalized.contains("500")) {
            return "CRITICAL";
        }
        if (normalized.contains("WARN") || normalized.contains("400") || normalized.contains("403") || normalized.contains("404")) {
            return "WARNING";
        }
        return "INFO";
    }

    private List<Map<String, String>> buildOperationsCenterRecentActions(
            List<Map<String, String>> securityAuditRows,
            boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        int limit = Math.min(5, securityAuditRows.size());
        for (int index = 0; index < limit; index++) {
            Map<String, String> row = securityAuditRows.get(index);
            Map<String, String> item = new LinkedHashMap<>();
            item.put("actionId", safeString(row.get("traceId")) + "-" + index);
            item.put("actedAt", firstNonBlank(safeString(row.get("auditAt")), safeString(row.get("createdAt"))));
            item.put("actorId", extractSecurityAuditActorId(safeString(row.get("actor"))));
            item.put("actionType", safeString(row.get("action")));
            item.put("targetLabel", safeString(row.get("target")));
            item.put("resultStatus", deriveAuditResultStatus(row, isEn));
            item.put("targetRoute", appendQuery(localizedAdminPath("/system/security-audit", isEn), "searchKeyword", safeString(row.get("target"))));
            rows.add(item);
        }
        return rows;
    }

    private List<Map<String, Object>> buildOperationsCenterNavigationSections(boolean isEn) {
        List<Map<String, Object>> sections = new ArrayList<>();
        sections.add(navigationSection(
                "member",
                isEn ? "Member / Company" : "회원/회원사",
                isEn ? "Move into approval, member, and company operations." : "승인, 회원, 회원사 운영 화면으로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "Member approvals" : "회원 승인", localizedAdminPath("/member/approve", isEn)),
                        navigationLink(isEn ? "Company approvals" : "회원사 승인", localizedAdminPath("/member/company-approve", isEn)),
                        navigationLink(isEn ? "Member list" : "회원 목록", localizedAdminPath("/member/list", isEn)),
                        navigationLink(isEn ? "Company list" : "회원사 목록", localizedAdminPath("/member/company_list", isEn)))));
        sections.add(navigationSection(
                "emission",
                isEn ? "Emission / Business" : "배출/업무",
                isEn ? "Review emission results and site management." : "배출 결과와 배출지 운영 화면으로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "Emission results" : "배출 결과 목록", localizedAdminPath("/emission/result_list", isEn)),
                        navigationLink(isEn ? "Review queue" : "검토 대기", appendQuery(localizedAdminPath("/emission/result_list", isEn), "resultStatus", "REVIEW")),
                        navigationLink(isEn ? "Emission sites" : "배출지 관리", localizedAdminPath("/emission/site-management", isEn)))));
        sections.add(navigationSection(
                "security-system",
                isEn ? "Security / System" : "보안/시스템",
                isEn ? "Continue detailed analysis in observability and system diagnostics." : "상세 분석은 로그/추적/시스템 진단 화면으로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "Sensor list" : "센서 목록", localizedAdminPath("/monitoring/sensor_list", isEn)),
                        navigationLink(isEn ? "Security monitoring" : "보안 모니터링", localizedAdminPath("/system/security-monitoring", isEn)),
                        navigationLink(isEn ? "Unified log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                        navigationLink(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)),
                        navigationLink(isEn ? "Error log" : "에러 로그", localizedAdminPath("/system/error-log", isEn)),
                        navigationLink(isEn ? "Scheduler" : "스케줄러", localizedAdminPath("/system/scheduler", isEn)))));
        sections.add(navigationSection(
                "integration",
                isEn ? "External Integration" : "외부연계",
                isEn ? "Move into API governance and trace consoles for integration troubleshooting." : "외부연계 장애나 계약 점검은 API 거버넌스와 추적 콘솔로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "API management" : "API 관리", localizedAdminPath("/system/api-management-console", isEn)),
                        navigationLink(isEn ? "Unified log" : "통합 로그", localizedAdminPath("/system/unified_log", isEn)),
                        navigationLink(isEn ? "Observability" : "추적 조회", localizedAdminPath("/system/observability", isEn)),
                        navigationLink(isEn ? "Full-stack management" : "풀스택 관리", localizedAdminPath("/system/full-stack-management", isEn)),
                        navigationLink(isEn ? "Error log" : "에러 로그", localizedAdminPath("/system/error-log", isEn)))));
        sections.add(navigationSection(
                "content",
                isEn ? "Content" : "콘텐츠",
                isEn ? "Move into content governance and menu exposure validation." : "콘텐츠 거버넌스와 메뉴 노출 검증 화면으로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "Admin sitemap" : "관리자 사이트맵", localizedAdminPath("/content/sitemap", isEn)),
                        navigationLink(isEn ? "Help management" : "도움말 운영", localizedAdminPath("/system/help-management", isEn)))));
        sections.add(navigationSection(
                "ops-tools",
                isEn ? "Operations Tools" : "운영도구",
                isEn ? "Move into execution tooling that supports operations." : "운영을 지원하는 실행 도구 화면으로 이동합니다.",
                List.of(
                        navigationLink(isEn ? "SR workbench" : "SR 워크벤치", localizedAdminPath("/system/sr-workbench", isEn)),
                        navigationLink(isEn ? "Codex console" : "Codex 실행 콘솔", localizedAdminPath("/system/codex-request", isEn)))));
        return sections;
    }

    private List<Map<String, String>> buildOperationsCenterPlaybooks(boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        rows.add(playbook("info",
                isEn ? "Approval evidence" : "승인 근거 확인",
                isEn ? "Open member or company detail first and verify evidence files before approval or rejection." : "회원 또는 회원사 상세로 들어가 증빙 파일을 확인한 뒤 승인 또는 반려합니다."));
        rows.add(playbook("info",
                isEn ? "Emission review" : "배출 결과 검토",
                isEn ? "Review pending emission results with project and company context before marking them verified." : "배출 결과는 프로젝트와 회원사 맥락을 확인한 뒤 검토 완료 처리합니다."));
        rows.add(playbook("warning",
                isEn ? "Whitelist requests" : "화이트리스트 요청",
                isEn ? "Use the whitelist approval flow before opening external access." : "외부 허용은 반드시 화이트리스트 승인 흐름을 거친 뒤 반영합니다."));
        rows.add(playbook("warning",
                isEn ? "Scheduler reruns" : "스케줄러 재실행",
                isEn ? "Review execution history before rerunning jobs in REVIEW or FAIL state." : "REVIEW 또는 FAIL 상태 작업은 최근 실행 이력을 먼저 확인한 뒤 재실행합니다."));
        rows.add(playbook("info",
                isEn ? "Trace-first analysis" : "trace 기준 분석",
                isEn ? "For repeated errors, move into unified log or observability with trace-linked queries." : "반복 오류는 trace 기준으로 통합 로그나 추적 조회 화면에서 원인을 확인합니다."));
        rows.add(playbook("info",
                isEn ? "SR/Codex execution" : "SR/Codex 실행",
                isEn ? "Use SR Workbench for approval and execution state tracking before opening Codex execution console." : "Codex 실행 콘솔로 이동하기 전에 SR 워크벤치에서 승인과 실행 상태를 먼저 확인합니다."));
        return rows;
    }

    private Map<String, Object> loadSrWorkbenchPayload() {
        try {
            return srTicketWorkbenchService.getPage("");
        } catch (Exception e) {
            log.warn("Failed to load SR workbench payload for operations center.", e);
            return Collections.emptyMap();
        }
    }

    private List<?> loadAdminSitemapSections(HttpServletRequest request) {
        try {
            return siteMapService.getAdminSiteMap(false, request);
        } catch (Exception e) {
            log.warn("Failed to load admin sitemap sections for operations center.", e);
            return Collections.emptyList();
        }
    }

    private String resolveOperationsCenterOverallStatus(
            List<Map<String, String>> monitoringEvents,
            List<Map<String, String>> errorRows,
            List<Map<String, String>> schedulerExecutions,
            int memberApprovalCount,
            int companyApprovalCount,
            EmissionResultFilterSnapshot emissionSnapshot) {
        boolean hasCriticalEvent = monitoringEvents.stream().anyMatch(row ->
                safeString(row.get("severity")).toUpperCase(Locale.ROOT).contains("CRITICAL"));
        boolean hasSchedulerFailure = schedulerExecutions.stream().anyMatch(row -> {
            String result = safeString(row.get("result")).toUpperCase(Locale.ROOT);
            return result.contains("FAIL") || result.contains("ERROR");
        });
        if (hasCriticalEvent || hasSchedulerFailure) {
            return "CRITICAL";
        }
        if (!monitoringEvents.isEmpty()
                || !errorRows.isEmpty()
                || memberApprovalCount > 0
                || companyApprovalCount > 0
                || emissionSnapshot.getReviewCount() > 0) {
            return "WARNING";
        }
        return "HEALTHY";
    }

    private boolean isEmissionReviewCandidate(EmissionResultSummaryView item) {
        if (item == null) {
            return false;
        }
        return "REVIEW".equalsIgnoreCase(safeString(item.getResultStatusCode()))
                || "REVIEW".equalsIgnoreCase(safeString(item.getVerificationStatusCode()));
    }

    private String resolveSchedulerAlertCount(List<Map<String, String>> schedulerSummary) {
        for (Map<String, String> row : schedulerSummary) {
            String title = safeString(row.get("title")).toUpperCase(Locale.ROOT);
            if (title.contains("REVIEW") || title.contains("실패") || title.contains("FAIL")) {
                return safeString(row.get("value"));
            }
        }
        return schedulerSummary.isEmpty() ? "0" : safeString(schedulerSummary.get(0).get("value"));
    }

    private List<Map<String, String>> toMetricRowsFromSummary(List<Map<String, String>> rows, int limit) {
        List<Map<String, String>> metrics = new ArrayList<>();
        int max = Math.min(limit, rows.size());
        for (int index = 0; index < max; index++) {
            Map<String, String> row = rows.get(index);
            metrics.add(metricRow(firstNonBlank(safeString(row.get("title")), safeString(row.get("label"))), safeString(row.get("value"))));
        }
        return metrics;
    }

    private Map<String, String> summaryCard(String key, String domainType, String title, String value, String description, String targetRoute) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("key", key);
        row.put("domainType", domainType);
        row.put("title", title);
        row.put("value", value);
        row.put("description", description);
        row.put("targetRoute", targetRoute);
        return row;
    }

    private Map<String, String> summaryCard(String title, String value, String description) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("title", title);
        row.put("value", value);
        row.put("description", description);
        return row;
    }

    private Map<String, String> priorityItem(
            String itemId,
            String domainType,
            String sourceType,
            String severity,
            String title,
            String description,
            String occurredAt,
            String targetRoute) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("itemId", itemId);
        row.put("domainType", domainType);
        row.put("sourceType", sourceType);
        row.put("severity", severity);
        row.put("title", title);
        row.put("description", description);
        row.put("occurredAt", occurredAt);
        row.put("targetRoute", targetRoute);
        return row;
    }

    private Map<String, Object> widgetGroup(
            String widgetId,
            String domainType,
            String title,
            String description,
            String targetRoute,
            List<Map<String, String>> metricRows,
            List<Map<String, String>> quickLinks) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("widgetId", widgetId);
        row.put("domainType", domainType);
        row.put("title", title);
        row.put("description", description);
        row.put("targetRoute", targetRoute);
        row.put("metricRows", metricRows);
        row.put("quickLinks", quickLinks);
        return row;
    }

    private Map<String, String> metricRow(String label, String value) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("value", value);
        return row;
    }

    private Map<String, String> metricRow(String label, String value, String description) {
        Map<String, String> row = metricRow(label, value);
        row.put("description", description);
        return row;
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

    private Map<String, String> buildPendingCertificateAuditRow(Map<String, Object> row, boolean isEn) {
        String certificateNo = safeString(row.get("certificateNo"));
        String requestTypeCode = safeString(row.get("requestType")).toUpperCase(Locale.ROOT);
        String statusCode = safeString(row.get("status")).toUpperCase(Locale.ROOT);
        String certificateTypeCode = safeString(row.get("certificateTypeCode")).toUpperCase(Locale.ROOT);
        Map<String, String> auditRow = new LinkedHashMap<>();
        auditRow.put("auditAt", safeString(row.get("requestedAt")));
        auditRow.put("requestId", safeString(row.get("requestId")));
        auditRow.put("certificateNo", certificateNo);
        auditRow.put("companyName", safeString(row.get("companyName")));
        auditRow.put("companyId", safeString(row.get("companyId")));
        auditRow.put("applicantName", safeString(row.get("applicantName")));
        auditRow.put("applicantId", safeString(row.get("applicantName")));
        auditRow.put("approverName", isEn ? "Pending assignment" : "담당자 배정 대기");
        auditRow.put("auditTypeCode", requestTypeCode);
        auditRow.put("auditType", resolveCertificateAuditTypeLabel(requestTypeCode, isEn));
        auditRow.put("certificateTypeCode", certificateTypeCode);
        auditRow.put("certificateType", resolveCertificateAuditCertificateTypeLabel(certificateTypeCode, isEn));
        auditRow.put("statusCode", normalizePendingCertificateAuditStatus(statusCode));
        auditRow.put("status", resolveCertificateAuditStatusLabel(normalizePendingCertificateAuditStatus(statusCode), isEn));
        auditRow.put("riskLevelCode", resolveCertificateAuditRiskLevelCode(requestTypeCode, statusCode, safeString(row.get("recCheckStatus"))));
        auditRow.put("riskLevel", resolveCertificateAuditRiskLevelLabel(auditRow.get("riskLevelCode"), isEn));
        auditRow.put("reason", firstNonBlank(safeString(row.get("reason")), safeString(row.get("reviewerMemo")), safeString(row.get("gridCheckSummary"))));
        return auditRow;
    }

    private Map<String, String> buildPersistedCertificateAuditRow(AuditEventRecordVO item,
                                                                  String certificateId,
                                                                  Map<String, Object> snapshot,
                                                                  boolean isEn) {
        String actionCode = safeString(item.getActionCode()).toUpperCase(Locale.ROOT);
        String statusCode = "SUCCESS".equalsIgnoreCase(safeString(item.getResultStatus())) ? "APPROVED" : "REJECTED";
        String auditTypeCode = resolveCertificateAuditTypeCodeFromAction(actionCode, snapshot);
        String certificateTypeCode = safeString(snapshot.get("certificateTypeCode")).toUpperCase(Locale.ROOT);
        Map<String, String> row = new LinkedHashMap<>();
        row.put("auditAt", safeString(item.getCreatedAt()));
        row.put("requestId", firstNonBlank(safeString(snapshot.get("requestId")), certificateId));
        row.put("certificateNo", firstNonBlank(certificateId, safeString(snapshot.get("certificateNo"))));
        row.put("companyName", safeString(snapshot.get("companyName")));
        row.put("companyId", safeString(snapshot.get("companyId")));
        row.put("applicantName", safeString(snapshot.get("applicantName")));
        row.put("applicantId", safeString(snapshot.get("applicantName")));
        row.put("approverName", firstNonBlank(safeString(item.getActorId()), isEn ? "System" : "시스템"));
        row.put("auditTypeCode", auditTypeCode);
        row.put("auditType", resolveCertificateAuditTypeLabel(auditTypeCode, isEn));
        row.put("certificateTypeCode", certificateTypeCode);
        row.put("certificateType", resolveCertificateAuditCertificateTypeLabel(certificateTypeCode, isEn));
        row.put("statusCode", statusCode);
        row.put("status", resolveCertificateAuditStatusLabel(statusCode, isEn));
        row.put("riskLevelCode", resolveCertificateAuditRiskLevelCode(auditTypeCode, statusCode, safeString(snapshot.get("recCheckStatus"))));
        row.put("riskLevel", resolveCertificateAuditRiskLevelLabel(row.get("riskLevelCode"), isEn));
        row.put("reason", firstNonBlank(safeString(item.getReasonSummary()), safeString(snapshot.get("reason")), safeString(snapshot.get("reviewerMemo"))));
        return row;
    }

    private List<String> extractCertificateAuditEntityIds(AuditEventRecordVO item) {
        String entityId = safeString(item == null ? null : item.getEntityId());
        if (entityId.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> ids = Stream.of(entityId.split("[,|]"))
                .map(this::safeString)
                .filter(value -> !value.isEmpty())
                .distinct()
                .collect(Collectors.toList());
        return ids.isEmpty() ? Collections.singletonList(entityId) : ids;
    }

    private List<Map<String, String>> filterCertificateAuditRows(List<Map<String, String>> rows,
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
            if (!normalizedKeyword.isEmpty()
                    && !safeString(row.get("requestId")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("certificateNo")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("companyName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("companyId")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("applicantName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("approverName")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                    && !safeString(row.get("reason")).toLowerCase(Locale.ROOT).contains(normalizedKeyword)) {
                continue;
            }
            filtered.add(new LinkedHashMap<>(row));
        }
        filtered.sort(Comparator.<Map<String, String>, String>comparing(row -> safeString(row.get("auditAt"))).reversed());
        return filtered;
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

    private String normalizePendingCertificateAuditStatus(String statusCode) {
        if ("HOLD".equals(statusCode)) {
            return "PENDING";
        }
        if ("APPROVED".equals(statusCode) || "REJECTED".equals(statusCode) || "PENDING".equals(statusCode)) {
            return statusCode;
        }
        return "PENDING";
    }

    private String resolveCertificateAuditTypeCodeFromAction(String actionCode, Map<String, Object> snapshot) {
        if (actionCode.contains("REISSUE")) {
            return "REISSUE";
        }
        if (actionCode.contains("RENEW")) {
            return "RENEW";
        }
        if (actionCode.contains("REVOKE")) {
            return "REVOKE";
        }
        String snapshotType = safeString(snapshot.get("requestType")).toUpperCase(Locale.ROOT);
        return snapshotType.isEmpty() ? "ISSUE" : snapshotType;
    }

    private String resolveCertificateAuditTypeLabel(String code, boolean isEn) {
        switch (safeString(code).toUpperCase(Locale.ROOT)) {
            case "REISSUE":
                return isEn ? "Reissue" : "재발급";
            case "RENEW":
                return isEn ? "Renewal" : "갱신";
            case "REVOKE":
                return isEn ? "Revocation" : "폐기";
            default:
                return isEn ? "Issue" : "발급";
        }
    }

    private String resolveCertificateAuditCertificateTypeLabel(String code, boolean isEn) {
        switch (safeString(code).toUpperCase(Locale.ROOT)) {
            case "JOINT":
                return isEn ? "Joint Certificate" : "공동인증서";
            case "CLOUD":
                return isEn ? "Cloud Certificate" : "클라우드 인증서";
            default:
                return isEn ? "Emission Certificate" : "배출 인증서";
        }
    }

    private String resolveCertificateAuditStatusLabel(String code, boolean isEn) {
        switch (safeString(code).toUpperCase(Locale.ROOT)) {
            case "APPROVED":
                return isEn ? "Approved" : "승인";
            case "REJECTED":
                return isEn ? "Rejected" : "반려";
            default:
                return isEn ? "Pending" : "대기";
        }
    }

    private String resolveCertificateAuditRiskLevelCode(String auditTypeCode, String statusCode, String recCheckStatus) {
        String normalizedType = safeString(auditTypeCode).toUpperCase(Locale.ROOT);
        String normalizedStatus = safeString(statusCode).toUpperCase(Locale.ROOT);
        String normalizedRec = safeString(recCheckStatus).toUpperCase(Locale.ROOT);
        if ("REVOKE".equals(normalizedType) || "REISSUE".equals(normalizedType) && "PENDING".equals(normalizedStatus) || normalizedRec.contains("중복")) {
            return "HIGH";
        }
        if ("REJECTED".equals(normalizedStatus) || "RENEW".equals(normalizedType)) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String resolveCertificateAuditRiskLevelLabel(String code, boolean isEn) {
        switch (safeString(code).toUpperCase(Locale.ROOT)) {
            case "HIGH":
                return isEn ? "High" : "높음";
            case "MEDIUM":
                return isEn ? "Medium" : "중간";
            default:
                return isEn ? "Low" : "낮음";
        }
    }
    private Map<String, String> playbook(String tone, String title, String body) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("tone", tone);
        row.put("title", title);
        row.put("body", body);
        return row;
    }

    private Map<String, String> mapOf(String key1, String value1, String key2, String value2, String key3, String value3) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put(key1, value1);
        row.put(key2, value2);
        row.put(key3, value3);
        return row;
    }

    private Map<String, Object> navigationSection(
            String sectionId,
            String title,
            String description,
            List<Map<String, String>> links) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sectionId", sectionId);
        row.put("title", title);
        row.put("description", description);
        row.put("links", links);
        return row;
    }

    private Map<String, String> navigationLink(String label, String href) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("label", label);
        row.put("href", href);
        return row;
    }

    private String localizedAdminPath(String path, boolean isEn) {
        return isEn ? "/en/admin" + path : "/admin" + path;
    }

    private String resolveMaintenanceStatus(String operationStatus, long backlogCount, long errorCount, int index) {
        String normalized = safeString(operationStatus).toUpperCase(Locale.ROOT);
        if ("REVIEW".equals(normalized) || backlogCount >= 6L || errorCount >= 4L) {
            return "BLOCKED";
        }
        if (backlogCount > 0L || index % 3 == 0) {
            return "DUE_SOON";
        }
        return "READY";
    }

    private String resolveMaintenanceImpactScope(String syncMode, boolean hasWebhook, long backlogCount, boolean isEn) {
        String normalized = safeString(syncMode).toUpperCase(Locale.ROOT);
        if (hasWebhook || "WEBHOOK".equals(normalized) || "HYBRID".equals(normalized)) {
            return isEn ? "Webhook and partner event delivery" : "웹훅 및 파트너 이벤트 전달";
        }
        if (backlogCount > 0L) {
            return isEn ? "Scheduled pull with queue backlog" : "정기 수집 및 큐 적체 영향";
        }
        return isEn ? "Scheduled sync consumers" : "정기 동기화 소비자";
    }

    private String resolveFallbackRoute(String syncMode, boolean hasWebhook, boolean isEn) {
        String normalized = safeString(syncMode).toUpperCase(Locale.ROOT);
        if (hasWebhook || "WEBHOOK".equals(normalized)) {
            return isEn ? "Digest notification and replay queue" : "요약 알림 및 재처리 큐";
        }
        if ("HYBRID".equals(normalized)) {
            return isEn ? "Batch queue and manual replay" : "배치 큐 및 수동 재실행";
        }
        return isEn ? "Scheduled retry after maintenance" : "점검 후 예약 재시도";
    }

    private String defaultMaintenanceWindow(int index, boolean isEn) {
        switch (index % 3) {
            case 1:
                return isEn ? "Tue 02:00-03:00" : "화 02:00-03:00";
            case 2:
                return isEn ? "Wed 01:00-02:30" : "수 01:00-02:30";
            default:
                return isEn ? "Sun 01:00-02:00" : "일 01:00-02:00";
        }
    }

    private String plannedMaintenanceAt(int index) {
        LocalDateTime plannedAt = LocalDate.now().plusDays((index % 4) + 1L).atTime(1 + (index % 3), 0);
        return plannedAt.withSecond(0).withNano(0).toString().replace('T', ' ');
    }

    private int maintenanceStatusRank(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        if ("BLOCKED".equals(normalized)) {
            return 3;
        }
        if ("DUE_SOON".equals(normalized)) {
            return 2;
        }
        if ("READY".equals(normalized)) {
            return 1;
        }
        return 0;
    }

    private String operatorActionForMaintenance(String status, boolean isEn) {
        String normalized = safeString(status).toUpperCase(Locale.ROOT);
        if ("BLOCKED".equals(normalized)) {
            return isEn ? "Hold release and notify partner owner" : "배포 보류 후 파트너 담당자 통지";
        }
        if ("DUE_SOON".equals(normalized)) {
            return isEn ? "Confirm fallback and operator handoff" : "대체 경로와 운영 인계 확인";
        }
        return isEn ? "Keep monitoring baseline" : "모니터링 기준선 유지";
    }

    private String appendQuery(String path, String key, String value) {
        if (path == null) {
            return "";
        }
        String normalizedValue = safeString(value);
        if (normalizedValue.isEmpty()) {
            return path;
        }
        String separator = path.contains("?") ? "&" : "?";
        return path + separator + key + "=" + normalizedValue;
    }

    private String valueFromFirst(List<Map<String, String>> rows, String key) {
        return rows.isEmpty() ? "" : safeString(rows.get(0).get(key));
    }

    private int parseCount(Object value) {
        return parsePositiveInt(stringValue(value), 0);
    }

    private int countListEntries(Object value) {
        return value instanceof List<?> ? ((List<?>) value).size() : 0;
    }

    private boolean isPerformanceLogCandidate(RequestExecutionLogVO item) {
        String requestUri = normalizePerformanceUri(item == null ? "" : item.getRequestUri());
        if (requestUri.isEmpty()) {
            return false;
        }
        return !requestUri.startsWith("/react-app/")
                && !requestUri.startsWith("/assets/")
                && !requestUri.startsWith("/css/")
                && !requestUri.startsWith("/js/")
                && !requestUri.startsWith("/images/")
                && !requestUri.contains("/health")
                && !requestUri.contains("/codex-verify-18000-freshness");
    }

    private boolean isMeaningfulPerformanceLog(RequestExecutionLogVO item) {
        String requestUri = normalizePerformanceUri(item == null ? "" : item.getRequestUri());
        return !requestUri.isEmpty() && !"/".equals(requestUri);
    }

    private boolean isSlowPerformanceLog(RequestExecutionLogVO item) {
        return item != null && item.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS;
    }

    private boolean isErrorPerformanceLog(RequestExecutionLogVO item) {
        return item != null && (item.getResponseStatus() >= 400 || !safeString(item.getErrorMessage()).isEmpty());
    }

    private List<Map<String, String>> buildPerformanceHotspotRoutes(List<RequestExecutionLogVO> logs, boolean isEn) {
        return logs.stream()
                .collect(Collectors.groupingBy(
                        item -> normalizePerformanceUri(item.getRequestUri()),
                        LinkedHashMap::new,
                        Collectors.toList()))
                .entrySet()
                .stream()
                .filter(entry -> !safeString(entry.getKey()).isEmpty())
                .map(entry -> {
                    List<RequestExecutionLogVO> routeLogs = entry.getValue();
                    long hits = routeLogs.size();
                    long errors = routeLogs.stream().filter(this::isErrorPerformanceLog).count();
                    long slows = routeLogs.stream().filter(this::isSlowPerformanceLog).count();
                    long avgDuration = Math.round(routeLogs.stream().mapToLong(RequestExecutionLogVO::getDurationMs).average().orElse(0D));
                    long maxDuration = routeLogs.stream().mapToLong(RequestExecutionLogVO::getDurationMs).max().orElse(0L);
                    Map<String, String> row = new LinkedHashMap<>();
                    row.put("requestUri", entry.getKey());
                    row.put("httpMethod", routeLogs.stream().map(RequestExecutionLogVO::getHttpMethod).map(this::safeString).filter(value -> !value.isEmpty()).findFirst().orElse("GET"));
                    row.put("hits", String.valueOf(hits));
                    row.put("avgDurationMs", String.valueOf(avgDuration));
                    row.put("maxDurationMs", String.valueOf(maxDuration));
                    row.put("slowCount", String.valueOf(slows));
                    row.put("errorCount", String.valueOf(errors));
                    row.put("lastExecutedAt", routeLogs.stream().map(RequestExecutionLogVO::getExecutedAt).map(this::safeString).filter(value -> !value.isEmpty()).findFirst().orElse(""));
                    row.put("targetRoute", appendQuery(localizedAdminPath("/system/unified_log", isEn), "searchKeyword", entry.getKey()));
                    return row;
                })
                .sorted(Comparator
                        .comparingLong((Map<String, String> row) -> parsePositiveLong(row.get("avgDurationMs"), 0L)).reversed()
                        .thenComparingLong(row -> parsePositiveLong(row.get("maxDurationMs"), 0L)).reversed()
                        .thenComparingLong(row -> parsePositiveLong(row.get("errorCount"), 0L)).reversed()
                        .thenComparingLong(row -> parsePositiveLong(row.get("hits"), 0L)).reversed())
                .limit(PERFORMANCE_HOTSPOT_LIMIT)
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> buildRecentSlowPerformanceRows(List<RequestExecutionLogVO> logs, boolean isEn) {
        return logs.stream()
                .filter(item -> isSlowPerformanceLog(item) || isErrorPerformanceLog(item))
                .sorted(Comparator.comparing(RequestExecutionLogVO::getExecutedAt, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)).reversed())
                .limit(PERFORMANCE_SLOW_REQUEST_LIMIT)
                .map(item -> {
                    Map<String, String> row = new LinkedHashMap<>();
                    row.put("executedAt", safeString(item.getExecutedAt()));
                    row.put("httpMethod", safeString(item.getHttpMethod()));
                    row.put("requestUri", normalizePerformanceUri(item.getRequestUri()));
                    row.put("durationMs", String.valueOf(item.getDurationMs()));
                    row.put("responseStatus", String.valueOf(item.getResponseStatus()));
                    row.put("actorUserId", safeString(item.getActorUserId()));
                    row.put("traceId", safeString(item.getTraceId()));
                    row.put("errorMessage", safeString(item.getErrorMessage()));
                    row.put("targetRoute", appendQuery(localizedAdminPath("/system/unified_log", isEn), "traceId", safeString(item.getTraceId())));
                    return row;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> buildPerformanceResponseStatusSummary(List<RequestExecutionLogVO> logs, long maxDurationMs, boolean isEn) {
        long successCount = logs.stream().filter(item -> item.getResponseStatus() > 0 && item.getResponseStatus() < 400).count();
        long clientErrorCount = logs.stream().filter(item -> item.getResponseStatus() >= 400 && item.getResponseStatus() < 500).count();
        long serverErrorCount = logs.stream().filter(item -> item.getResponseStatus() >= 500).count();
        long slowCount = logs.stream().filter(this::isSlowPerformanceLog).count();
        return List.of(
                summaryMetricRow(
                        isEn ? "2xx/3xx" : "2xx/3xx",
                        String.valueOf(successCount),
                        isEn ? "Successful or redirected responses" : "성공 및 리다이렉트 응답",
                        "neutral"),
                summaryMetricRow(
                        isEn ? "4xx" : "4xx",
                        String.valueOf(clientErrorCount),
                        isEn ? "Client-side or validation failures" : "클라이언트 또는 검증 오류",
                        clientErrorCount > 0 ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "5xx" : "5xx",
                        String.valueOf(serverErrorCount),
                        isEn ? "Server-side failures" : "서버 오류 응답",
                        serverErrorCount > 0 ? "danger" : "neutral"),
                summaryMetricRow(
                        isEn ? "Max Duration" : "최대 응답시간",
                        formatDurationMs(maxDurationMs),
                        isEn ? slowCount + " requests exceeded slow threshold" : "지연 임계치 초과 " + slowCount + "건",
                        maxDurationMs >= PERFORMANCE_SLOW_THRESHOLD_MS ? "warning" : "neutral"));
    }

    private String normalizePerformanceUri(String value) {
        String normalized = safeString(value);
        if (normalized.startsWith("/en/")) {
            normalized = normalized.substring(3);
            if (!normalized.startsWith("/")) {
                normalized = "/" + normalized;
            }
        }
        int queryIndex = normalized.indexOf('?');
        if (queryIndex >= 0) {
            normalized = normalized.substring(0, queryIndex);
        }
        return normalized;
    }

    private boolean isIntegrationAccessEvent(AccessEventRecordVO item) {
        if (item == null) {
            return false;
        }
        String apiId = safeString(item.getApiId());
        String requestUri = normalizePerformanceUri(item.getRequestUri());
        String featureType = safeString(item.getFeatureType()).toUpperCase(Locale.ROOT);
        return !apiId.isEmpty()
                || requestUri.contains("/api/")
                || requestUri.contains("/external/")
                || featureType.contains("API");
    }

    private boolean isIntegrationErrorEvent(ErrorEventRecordVO item) {
        if (item == null) {
            return false;
        }
        String apiId = safeString(item.getApiId());
        String requestUri = normalizePerformanceUri(item.getRequestUri());
        return !apiId.isEmpty() || requestUri.contains("/api/") || requestUri.contains("/external/");
    }

    private boolean isIntegrationTraceEvent(TraceEventRecordVO item) {
        if (item == null) {
            return false;
        }
        String eventType = safeString(item.getEventType()).toUpperCase(Locale.ROOT);
        return !safeString(item.getApiId()).isEmpty() || eventType.contains("API");
    }

    private List<Map<String, String>> mergeExternalConnectionRegistry(List<Map<String, String>> observedRows, boolean isEn) {
        Map<String, Map<String, String>> merged = new LinkedHashMap<>();
        for (Map<String, String> row : observedRows) {
            merged.put(safeString(row.get("connectionKey")), new LinkedHashMap<>(row));
        }
        externalConnectionProfileStoreService.listProfiles().forEach(profile -> {
            Map<String, String> normalizedProfile = normalizeExternalConnectionPayload(profile, isEn);
            String connectionKey = firstNonBlank(
                    safeString(normalizedProfile.get("connectionId")),
                    safeString(normalizedProfile.get("endpointUrl")));
            if (connectionKey.isEmpty()) {
                return;
            }
            Map<String, String> existing = merged.getOrDefault(connectionKey, new LinkedHashMap<>());
            existing.put("connectionKey", connectionKey);
            existing.put("apiId", firstNonBlank(safeString(existing.get("apiId")), safeString(normalizedProfile.get("connectionId"))));
            existing.put("connectionName", safeString(normalizedProfile.get("connectionName")));
            existing.put("requestUri", firstNonBlank(safeString(normalizedProfile.get("endpointUrl")), safeString(existing.get("requestUri"))));
            existing.put("httpMethod", firstNonBlank(safeString(existing.get("httpMethod")), "POST"));
            existing.put("partnerName", safeString(normalizedProfile.get("partnerName")));
            existing.put("protocol", safeString(normalizedProfile.get("protocol")));
            existing.put("authMethod", safeString(normalizedProfile.get("authMethod")));
            existing.put("syncMode", safeString(normalizedProfile.get("syncMode")));
            existing.put("retryPolicy", safeString(normalizedProfile.get("retryPolicy")));
            existing.put("timeoutSeconds", safeString(normalizedProfile.get("timeoutSeconds")));
            existing.put("dataScope", safeString(normalizedProfile.get("dataScope")));
            existing.put("ownerName", safeString(normalizedProfile.get("ownerName")));
            existing.put("ownerContact", safeString(normalizedProfile.get("ownerContact")));
            existing.put("operationStatus", safeString(normalizedProfile.get("operationStatus")));
            existing.put("maintenanceWindow", safeString(normalizedProfile.get("maintenanceWindow")));
            existing.put("notes", safeString(normalizedProfile.get("notes")));
            existing.put("profileRegistered", "Y");
            existing.put("sourceType", safeString(existing.get("lastSeenAt")).isEmpty() ? "PROFILE_ONLY" : "REGISTERED_AND_OBSERVED");
            existing.put("lastSeenAt", firstNonBlank(safeString(existing.get("lastSeenAt")), isEn ? "Not observed yet" : "아직 관측 이력 없음"));
            existing.put("traceCount", firstNonBlank(safeString(existing.get("traceCount")), "0"));
            existing.put("successCount", firstNonBlank(safeString(existing.get("successCount")), "0"));
            existing.put("errorCount", firstNonBlank(safeString(existing.get("errorCount")), "0"));
            existing.put("avgDurationMs", firstNonBlank(safeString(existing.get("avgDurationMs")), "0"));
            if (safeString(existing.get("status")).isEmpty()) {
                existing.put("status", "REVIEW".equalsIgnoreCase(safeString(normalizedProfile.get("operationStatus"))) ? "WARNING" : "HEALTHY");
            }
            existing.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", safeString(normalizedProfile.get("connectionId"))));
            merged.put(connectionKey, existing);
        });
        return new ArrayList<>(merged.values());
    }

    private List<Map<String, String>> buildExternalConnectionRows(
            List<AccessEventRecordVO> accessEvents,
            List<ErrorEventRecordVO> errorEvents,
            List<TraceEventRecordVO> traceEvents,
            boolean isEn) {
        Map<String, List<AccessEventRecordVO>> accessByConnection = accessEvents.stream()
                .collect(Collectors.groupingBy(this::resolveIntegrationConnectionKey, LinkedHashMap::new, Collectors.toList()));
        Map<String, Long> traceCounts = traceEvents.stream()
                .collect(Collectors.groupingBy(this::resolveIntegrationConnectionKey, LinkedHashMap::new, Collectors.counting()));
        Map<String, List<ErrorEventRecordVO>> errorByConnection = errorEvents.stream()
                .collect(Collectors.groupingBy(this::resolveIntegrationConnectionKey, LinkedHashMap::new, Collectors.toList()));

        LinkedHashSet<String> connectionKeys = new LinkedHashSet<>();
        connectionKeys.addAll(accessByConnection.keySet());
        connectionKeys.addAll(traceCounts.keySet());
        connectionKeys.addAll(errorByConnection.keySet());

        List<Map<String, String>> rows = new ArrayList<>();
        for (String connectionKey : connectionKeys) {
            if (safeString(connectionKey).isEmpty()) {
                continue;
            }
            List<AccessEventRecordVO> events = accessByConnection.getOrDefault(connectionKey, Collections.emptyList());
            List<ErrorEventRecordVO> connectionErrors = errorByConnection.getOrDefault(connectionKey, Collections.emptyList());
            long avgDuration = Math.round(events.stream()
                    .map(AccessEventRecordVO::getDurationMs)
                    .filter(value -> value != null && value > 0)
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0D));
            int maxStatus = events.stream()
                    .map(AccessEventRecordVO::getResponseStatus)
                    .filter(value -> value != null)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);
            long errorCount = connectionErrors.size() + events.stream()
                    .filter(item -> item.getResponseStatus() != null && item.getResponseStatus() >= 400)
                    .count();
            long successCount = events.stream()
                    .filter(item -> item.getResponseStatus() != null && item.getResponseStatus() < 400)
                    .count();
            String apiId = firstNonBlank(
                    events.stream().map(AccessEventRecordVO::getApiId).filter(value -> !safeString(value).isEmpty()).findFirst().orElse(""),
                    connectionErrors.stream().map(ErrorEventRecordVO::getApiId).filter(value -> !safeString(value).isEmpty()).findFirst().orElse(""),
                    connectionKey.startsWith("/") ? "" : connectionKey);
            String requestUri = events.stream()
                    .map(AccessEventRecordVO::getRequestUri)
                    .map(this::normalizePerformanceUri)
                    .filter(value -> !value.isEmpty())
                    .findFirst()
                    .orElse(connectionKey.startsWith("/") ? connectionKey : "");
            String method = events.stream()
                    .map(AccessEventRecordVO::getHttpMethod)
                    .map(this::safeString)
                    .filter(value -> !value.isEmpty())
                    .findFirst()
                    .orElse("GET");
            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionKey", connectionKey);
            row.put("apiId", apiId);
            row.put("connectionName", resolveIntegrationConnectionName(apiId, requestUri, isEn));
            row.put("requestUri", requestUri);
            row.put("httpMethod", method);
            row.put("connectionId", apiId);
            row.put("endpointUrl", requestUri);
            row.put("protocol", "REST");
            row.put("authMethod", "OBSERVED");
            row.put("syncMode", "OBSERVED");
            row.put("operationStatus", "HEALTHY".equals(resolveExternalConnectionStatus(avgDuration, errorCount, maxStatus)) ? "ACTIVE" : "REVIEW");
            row.put("ownerName", isEn ? "Integration Team" : "외부연계팀");
            row.put("ownerContact", "integration@carbonet.local");
            row.put("profileRegistered", "N");
            row.put("sourceType", "OBSERVED");
            row.put("traceCount", String.valueOf(traceCounts.getOrDefault(connectionKey, 0L)));
            row.put("successCount", String.valueOf(successCount));
            row.put("errorCount", String.valueOf(errorCount));
            row.put("avgDurationMs", String.valueOf(avgDuration));
            row.put("lastStatus", maxStatus > 0 ? String.valueOf(maxStatus) : "-");
            row.put("lastSeenAt", resolveLatestIntegrationSeenAt(events, connectionErrors));
            row.put("status", resolveExternalConnectionStatus(avgDuration, errorCount, maxStatus));
            row.put("targetRoute", !safeString(apiId).isEmpty()
                    ? appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", apiId)
                    : appendQuery(localizedAdminPath("/system/unified_log", isEn), "searchKeyword", requestUri));
            rows.add(row);
        }
        rows.sort(Comparator
                .comparing((Map<String, String> row) -> statusRank(safeString(row.get("status"))))
                .reversed()
                .thenComparingLong(row -> parsePositiveLong(row.get("errorCount"), 0L)).reversed()
                .thenComparingLong(row -> parsePositiveLong(row.get("avgDurationMs"), 0L)).reversed()
                .thenComparing((Map<String, String> row) -> safeString(row.get("lastSeenAt")), Comparator.reverseOrder()));
        return rows;
    }

    private List<Map<String, String>> buildExternalConnectionIssueRows(
            List<AccessEventRecordVO> accessEvents,
            List<ErrorEventRecordVO> errorEvents,
            boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (ErrorEventRecordVO item : errorEvents.stream()
                .sorted(Comparator.comparing(ErrorEventRecordVO::getCreatedAt, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)).reversed())
                .limit(8)
                .collect(Collectors.toList())) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("issueType", "ERROR");
            row.put("occurredAt", safeString(item.getCreatedAt()));
            row.put("connectionName", resolveIntegrationConnectionName(safeString(item.getApiId()), normalizePerformanceUri(item.getRequestUri()), isEn));
            row.put("status", firstNonBlank(safeString(item.getResultStatus()), "ERROR"));
            row.put("detail", firstNonBlank(safeString(item.getMessage()), safeString(item.getRequestUri()), safeString(item.getErrorType())));
            row.put("targetRoute", !safeString(item.getApiId()).isEmpty()
                    ? appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", safeString(item.getApiId()))
                    : appendQuery(localizedAdminPath("/system/error-log", isEn), "searchKeyword", safeString(item.getRequestUri())));
            rows.add(row);
        }
        for (AccessEventRecordVO item : accessEvents.stream()
                .filter(entry -> (entry.getDurationMs() != null && entry.getDurationMs() >= PERFORMANCE_SLOW_THRESHOLD_MS)
                        || (entry.getResponseStatus() != null && entry.getResponseStatus() >= 400))
                .sorted(Comparator.comparing(AccessEventRecordVO::getCreatedAt, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)).reversed())
                .limit(8)
                .collect(Collectors.toList())) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("issueType", item.getResponseStatus() != null && item.getResponseStatus() >= 400 ? "RESPONSE" : "LATENCY");
            row.put("occurredAt", safeString(item.getCreatedAt()));
            row.put("connectionName", resolveIntegrationConnectionName(safeString(item.getApiId()), normalizePerformanceUri(item.getRequestUri()), isEn));
            row.put("status", item.getResponseStatus() == null ? "" : String.valueOf(item.getResponseStatus()));
            row.put("detail", firstNonBlank(
                    (item.getDurationMs() == null ? "" : item.getDurationMs() + "ms"),
                    safeString(item.getErrorMessage()),
                    normalizePerformanceUri(item.getRequestUri())));
            row.put("targetRoute", !safeString(item.getApiId()).isEmpty()
                    ? appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", safeString(item.getApiId()))
                    : appendQuery(localizedAdminPath("/system/unified_log", isEn), "searchKeyword", normalizePerformanceUri(item.getRequestUri())));
            rows.add(row);
        }
        rows.sort(Comparator.comparing((Map<String, String> row) -> safeString(row.get("occurredAt")), Comparator.reverseOrder()));
        return rows.stream().limit(12).collect(Collectors.toList());
    }

    private List<Map<String, String>> buildExternalKeyRows(List<Map<String, String>> connectionRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int index = 0;
        for (Map<String, String> connectionRow : connectionRows) {
            String connectionId = firstNonBlank(
                    safeString(connectionRow.get("connectionId")),
                    safeString(connectionRow.get("apiId")),
                    safeString(connectionRow.get("connectionKey")));
            if (connectionId.isEmpty()) {
                continue;
            }
            String authMethod = normalizeExternalAuthMethod(connectionRow.get("authMethod"));
            LocalDate lastRotatedAt = deriveCredentialRotationDate(today, authMethod, index);
            LocalDate expiresAt = deriveCredentialExpiryDate(lastRotatedAt, authMethod, index);
            String rotationStatus = resolveCredentialRotationStatus(expiresAt, today);
            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionId", connectionId);
            row.put("connectionName", firstNonBlank(safeString(connectionRow.get("connectionName")), connectionId));
            row.put("partnerName", safeString(connectionRow.get("partnerName")));
            row.put("credentialLabel", credentialLabel(authMethod, isEn));
            row.put("maskedReference", buildMaskedCredentialReference(connectionId, authMethod, index));
            row.put("authMethod", authMethod);
            row.put("scopeSummary", firstNonBlank(
                    safeString(connectionRow.get("dataScope")),
                    safeString(connectionRow.get("requestUri")),
                    isEn ? "Partner integration scope" : "연계 대상 범위"));
            row.put("lastRotatedAt", lastRotatedAt.toString());
            row.put("expiresAt", expiresAt.toString());
            row.put("rotationStatus", rotationStatus);
            row.put("rotationPolicy", rotationPolicy(authMethod));
            row.put("ownerName", firstNonBlank(safeString(connectionRow.get("ownerName")), isEn ? "Integration Team" : "외부연계팀"));
            row.put("ownerContact", firstNonBlank(safeString(connectionRow.get("ownerContact")), "integration@carbonet.local"));
            row.put("targetRoute", appendQuery(localizedAdminPath("/external/connection_edit", isEn), "connectionId", connectionId));
            rows.add(row);
            index++;
        }
        rows.sort(Comparator
                .comparing((Map<String, String> row) -> credentialRotationRank(safeString(row.get("rotationStatus"))))
                .reversed()
                .thenComparing((Map<String, String> row) -> safeString(row.get("expiresAt")), Comparator.naturalOrder())
                .thenComparing((Map<String, String> row) -> safeString(row.get("connectionName"))));
        return rows;
    }

    private List<Map<String, String>> buildExternalKeyRotationRows(List<Map<String, String>> keyRows, boolean isEn) {
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, String> keyRow : keyRows) {
            String rotationStatus = safeString(keyRow.get("rotationStatus"));
            if ("HEALTHY".equalsIgnoreCase(rotationStatus)) {
                continue;
            }
            Map<String, String> row = new LinkedHashMap<>();
            row.put("connectionId", safeString(keyRow.get("connectionId")));
            row.put("connectionName", safeString(keyRow.get("connectionName")));
            row.put("credentialLabel", safeString(keyRow.get("credentialLabel")));
            row.put("rotationWindow", safeString(keyRow.get("expiresAt")));
            row.put("rotationPolicy", safeString(keyRow.get("rotationPolicy")));
            row.put("rotationStatus", rotationStatus);
            row.put("reason", rotationReason(rotationStatus, safeString(keyRow.get("authMethod")), isEn));
            row.put("targetRoute", safeString(keyRow.get("targetRoute")));
            rows.add(row);
        }
        if (rows.isEmpty()) {
            Map<String, String> emptyRow = new LinkedHashMap<>();
            emptyRow.put("connectionId", "STABLE");
            emptyRow.put("connectionName", isEn ? "No immediate rotation blockers" : "즉시 교체가 필요한 항목 없음");
            emptyRow.put("credentialLabel", isEn ? "Monitoring baseline" : "모니터링 기준선");
            emptyRow.put("rotationWindow", LocalDate.now().plusDays(30).toString());
            emptyRow.put("rotationPolicy", "AUTO");
            emptyRow.put("rotationStatus", "HEALTHY");
            emptyRow.put("reason", isEn ? "Current credentials are inside the managed rotation window." : "현재 인증키는 관리 기준 교체 주기 안에 있습니다.");
            emptyRow.put("targetRoute", localizedAdminPath("/external/connection_list", isEn));
            rows.add(emptyRow);
        }
        return rows.stream().limit(8).collect(Collectors.toList());
    }

    private Map<String, String> defaultExternalConnectionProfile(boolean isEn) {
        Map<String, String> profile = new LinkedHashMap<>();
        profile.put("connectionName", "");
        profile.put("connectionId", "");
        profile.put("partnerName", "");
        profile.put("endpointUrl", "https://");
        profile.put("protocol", "REST");
        profile.put("authMethod", "OAUTH2");
        profile.put("syncMode", "SCHEDULED");
        profile.put("retryPolicy", "EXP_BACKOFF_3");
        profile.put("timeoutSeconds", "30");
        profile.put("dataScope", "");
        profile.put("ownerName", "");
        profile.put("ownerContact", "");
        profile.put("operationStatus", "REVIEW");
        profile.put("maintenanceWindow", "Sun 01:00-02:00");
        profile.put("notes", isEn
                ? "Record token rotation owner, replay policy, and maintenance impact before requesting production approval."
                : "운영 승인 요청 전에 토큰 교체 담당, 재처리 정책, 점검 영향 범위를 먼저 기록합니다.");
        return profile;
    }

    private List<Map<String, String>> buildExternalConnectionFormSummary(
            Map<String, String> profile,
            List<Map<String, String>> connectionRows,
            boolean isEn) {
        Map<String, String> matchedRow = connectionRows.stream()
                .filter(row -> matchesExternalConnectionId(row, safeString(profile.get("connectionId"))))
                .findFirst()
                .orElse(Collections.emptyMap());
        String sourceType = firstNonBlank(safeString(profile.get("sourceType")), safeString(matchedRow.get("sourceType")), "REGISTERED");
        String lastSeenAt = firstNonBlank(safeString(profile.get("lastSeenAt")), safeString(matchedRow.get("lastSeenAt")), "-");
        String avgDurationMs = firstNonBlank(safeString(profile.get("avgDurationMs")), safeString(matchedRow.get("avgDurationMs")), "0");
        String traceCount = firstNonBlank(safeString(profile.get("traceCount")), safeString(matchedRow.get("traceCount")), "0");
        String errorCount = firstNonBlank(safeString(profile.get("errorCount")), safeString(matchedRow.get("errorCount")), "0");
        return List.of(
                summaryMetricRow(
                        isEn ? "Profile Source" : "프로필 기준",
                        sourceType,
                        isEn ? "Shows whether the profile comes from observed traffic or saved registry data." : "관측 트래픽 기반인지 저장된 레지스트리 기반인지 표시합니다.",
                        "OBSERVED".equalsIgnoreCase(sourceType) ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Last Seen" : "최근 관측",
                        lastSeenAt,
                        isEn ? "Most recent observed traffic for this connection." : "이 연계의 최근 관측 시각입니다.",
                        "-".equals(lastSeenAt) ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Observed Latency" : "관측 지연",
                        "0".equals(avgDurationMs) ? "-" : formatDurationMs(parsePositiveLong(avgDurationMs, 0L)),
                        isEn ? "Average latency across recent observed requests." : "최근 관측 요청 기준 평균 지연입니다.",
                        parsePositiveLong(avgDurationMs, 0L) >= PERFORMANCE_SLOW_THRESHOLD_MS ? "warning" : "neutral"),
                summaryMetricRow(
                        isEn ? "Trace / Errors" : "추적 / 오류",
                        traceCount + " / " + errorCount,
                        isEn ? "Observed trace count and recent error count for this connection." : "이 연계의 관측 추적 수와 최근 오류 수입니다.",
                        parsePositiveLong(errorCount, 0L) > 0L ? "danger" : "neutral"));
    }

    private List<Map<String, String>> buildExternalConnectionFormIssueRows(
            List<Map<String, String>> issueRows,
            String connectionId) {
        List<Map<String, String>> matchedRows = issueRows.stream()
                .filter(row -> matchesExternalConnectionId(row, connectionId))
                .limit(5)
                .collect(Collectors.toList());
        if (!matchedRows.isEmpty()) {
            return matchedRows;
        }
        return issueRows.stream().limit(5).collect(Collectors.toList());
    }

    private List<Map<String, String>> buildExternalConnectionFormQuickLinks(String connectionId, boolean isEn) {
        String observabilityRoute = safeString(connectionId).isEmpty()
                ? localizedAdminPath("/system/observability", isEn)
                : appendQuery(localizedAdminPath("/system/observability", isEn), "apiId", connectionId);
        return List.of(
                quickLinkRow(isEn ? "Connection Registry" : "외부 연계 목록", localizedAdminPath("/external/connection_list", isEn)),
                quickLinkRow(isEn ? "Schema Registry" : "스키마 현황", localizedAdminPath("/external/schema", isEn)),
                quickLinkRow(isEn ? "Sync Execution" : "동기화 실행", localizedAdminPath("/external/sync", isEn)),
                quickLinkRow(isEn ? "Observability" : "추적 조회", observabilityRoute));
    }

    private List<Map<String, String>> buildExternalConnectionFormGuidance(boolean addMode, boolean isEn) {
        return List.of(
                guidanceRow(
                        addMode
                                ? (isEn ? "Register policy before opening traffic" : "트래픽 개방 전 정책 먼저 등록")
                                : (isEn ? "Review recent incidents before editing" : "수정 전에 최근 이슈 먼저 확인"),
                        addMode
                                ? (isEn ? "Capture owner, auth method, retry policy, and maintenance impact before the first live call." : "첫 실호출 전에는 담당자, 인증 방식, 재시도 정책, 점검 영향 범위를 먼저 기록합니다.")
                                : (isEn ? "When errors repeat, compare endpoint, auth, and timeout changes with recent incident history before saving." : "오류가 반복될 때는 저장 전에 최근 이력과 엔드포인트, 인증, timeout 변경을 함께 비교합니다."),
                        "warning"),
                guidanceRow(
                        isEn ? "Keep identifiers stable" : "식별자는 안정적으로 유지",
                        isEn ? "Use a durable connection ID so schema, sync, and observability screens can keep pointing at the same target." : "스키마, 동기화, 추적 화면이 같은 대상을 계속 가리키도록 연계 ID는 안정적으로 유지해야 합니다.",
                        "neutral"),
                guidanceRow(
                        isEn ? "Treat owner contact as runtime metadata" : "담당자 연락처도 런타임 메타데이터",
                        isEn ? "The owner contact should be current enough for retry approvals, outage escalations, and token rotation handoffs." : "담당자 연락처는 재처리 승인, 장애 전파, 토큰 교체 인수인계에 바로 쓸 수 있어야 합니다.",
                        "danger"));
    }

    private Map<String, String> loadExternalConnectionProfile(String connectionId, boolean isEn) {
        String normalizedConnectionId = safeString(connectionId).toUpperCase(Locale.ROOT);
        Map<String, String> persistedProfile = externalConnectionProfileStoreService.getProfile(normalizedConnectionId);
        if (persistedProfile != null && !persistedProfile.isEmpty()) {
            return new LinkedHashMap<>(persistedProfile);
        }
        return loadObservedExternalConnectionProfile(normalizedConnectionId, isEn)
                .orElseGet(() -> {
                    LinkedHashMap<String, String> fallback = new LinkedHashMap<>(defaultExternalConnectionProfile(isEn));
                    fallback.put("connectionId", normalizedConnectionId);
                    return fallback;
                });
    }

    private java.util.Optional<Map<String, String>> loadObservedExternalConnectionProfile(String normalizedConnectionId, boolean isEn) {
        if (normalizedConnectionId.isEmpty()) {
            return java.util.Optional.empty();
        }
        AccessEventSearchVO accessSearch = new AccessEventSearchVO();
        accessSearch.setFirstIndex(0);
        accessSearch.setRecordCountPerPage(150);
        List<AccessEventRecordVO> accessEvents = observabilityQueryService.selectAccessEventList(accessSearch).stream()
                .filter(this::isIntegrationAccessEvent)
                .collect(Collectors.toList());

        ErrorEventSearchVO errorSearch = new ErrorEventSearchVO();
        errorSearch.setFirstIndex(0);
        errorSearch.setRecordCountPerPage(80);
        List<ErrorEventRecordVO> errorEvents = observabilityQueryService.selectErrorEventList(errorSearch).stream()
                .filter(this::isIntegrationErrorEvent)
                .collect(Collectors.toList());

        TraceEventSearchVO traceSearch = new TraceEventSearchVO();
        traceSearch.setFirstIndex(0);
        traceSearch.setRecordCountPerPage(120);
        List<TraceEventRecordVO> traceEvents = observabilityQueryService.selectTraceEventList(traceSearch).stream()
                .filter(this::isIntegrationTraceEvent)
                .collect(Collectors.toList());

        return buildExternalConnectionRows(accessEvents, errorEvents, traceEvents, isEn).stream()
                .filter(row -> normalizedConnectionId.equalsIgnoreCase(safeString(row.get("connectionId")))
                        || normalizedConnectionId.equalsIgnoreCase(safeString(row.get("apiId")))
                        || normalizedConnectionId.equalsIgnoreCase(safeString(row.get("connectionKey"))))
                .findFirst()
                .map(row -> {
                    LinkedHashMap<String, String> observedProfile = new LinkedHashMap<>(defaultExternalConnectionProfile(isEn));
                    observedProfile.putAll(row);
                    observedProfile.put("connectionId", firstNonBlank(
                            safeString(row.get("connectionId")),
                            safeString(row.get("apiId")),
                            normalizedConnectionId));
                    observedProfile.put("endpointUrl", firstNonBlank(
                            safeString(row.get("endpointUrl")),
                            safeString(row.get("requestUri")),
                            safeString(observedProfile.get("endpointUrl"))));
                    return observedProfile;
                });
    }

    private boolean matchesExternalConnectionId(Map<String, String> row, String connectionId) {
        String normalizedConnectionId = safeString(connectionId).toUpperCase(Locale.ROOT);
        if (normalizedConnectionId.isEmpty() || row == null || row.isEmpty()) {
            return false;
        }
        return normalizedConnectionId.equalsIgnoreCase(safeString(row.get("connectionId")))
                || normalizedConnectionId.equalsIgnoreCase(safeString(row.get("apiId")))
                || normalizedConnectionId.equalsIgnoreCase(safeString(row.get("connectionKey")));
    }

    private Map<String, String> normalizeExternalConnectionPayload(Map<String, String> payload, boolean isEn) {
        Map<String, String> normalized = defaultExternalConnectionProfile(isEn);
        if (payload == null) {
            return normalized;
        }
        normalized.put("connectionName", trimToDefault(payload.get("connectionName"), 120));
        normalized.put("connectionId", trimToDefault(payload.get("connectionId"), 60).toUpperCase(Locale.ROOT));
        normalized.put("partnerName", trimToDefault(payload.get("partnerName"), 120));
        normalized.put("endpointUrl", trimToDefault(payload.get("endpointUrl"), 255));
        normalized.put("protocol", trimToDefault(payload.get("protocol"), 20));
        normalized.put("authMethod", trimToDefault(payload.get("authMethod"), 30));
        normalized.put("syncMode", trimToDefault(payload.get("syncMode"), 30));
        normalized.put("retryPolicy", trimToDefault(payload.get("retryPolicy"), 40));
        normalized.put("timeoutSeconds", trimToDefault(payload.get("timeoutSeconds"), 10));
        normalized.put("dataScope", trimToDefault(payload.get("dataScope"), 200));
        normalized.put("ownerName", trimToDefault(payload.get("ownerName"), 80));
        normalized.put("ownerContact", trimToDefault(payload.get("ownerContact"), 120));
        normalized.put("operationStatus", trimToDefault(payload.get("operationStatus"), 30));
        normalized.put("maintenanceWindow", trimToDefault(payload.get("maintenanceWindow"), 80));
        normalized.put("notes", trimToDefault(payload.get("notes"), 1000));
        return normalized;
    }

    private String trimToDefault(String value, int maxLength) {
        String normalized = safeString(value);
        return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength);
    }

    private String resolveIntegrationConnectionKey(AccessEventRecordVO item) {
        return firstNonBlank(safeString(item == null ? null : item.getApiId()), normalizePerformanceUri(item == null ? null : item.getRequestUri()));
    }

    private String resolveIntegrationConnectionKey(ErrorEventRecordVO item) {
        return firstNonBlank(safeString(item == null ? null : item.getApiId()), normalizePerformanceUri(item == null ? null : item.getRequestUri()));
    }

    private String resolveIntegrationConnectionKey(TraceEventRecordVO item) {
        return firstNonBlank(safeString(item == null ? null : item.getApiId()), safeString(item == null ? null : item.getPageId()));
    }

    private String resolveIntegrationConnectionName(String apiId, String requestUri, boolean isEn) {
        if (!safeString(apiId).isEmpty()) {
            return apiId;
        }
        if (!safeString(requestUri).isEmpty()) {
            return requestUri;
        }
        return isEn ? "External connection" : "외부 연계";
    }

    private String resolveLatestIntegrationSeenAt(List<AccessEventRecordVO> accessEvents, List<ErrorEventRecordVO> errorEvents) {
        return Stream.concat(
                        accessEvents.stream().map(AccessEventRecordVO::getCreatedAt),
                        errorEvents.stream().map(ErrorEventRecordVO::getCreatedAt))
                .map(this::safeString)
                .filter(value -> !value.isEmpty())
                .max(String.CASE_INSENSITIVE_ORDER)
                .orElse("");
    }

    private String resolveExternalConnectionStatus(long avgDuration, long errorCount, int maxStatus) {
        if (errorCount > 0 || maxStatus >= 500) {
            return "DEGRADED";
        }
        if (avgDuration >= PERFORMANCE_SLOW_THRESHOLD_MS || maxStatus >= 400) {
            return "WARNING";
        }
        return "HEALTHY";
    }

    private String resolveExternalConnectionOverallStatus(List<Map<String, String>> rows) {
        if (rows.stream().anyMatch(row -> "DEGRADED".equalsIgnoreCase(safeString(row.get("status"))))) {
            return "CRITICAL";
        }
        if (rows.stream().anyMatch(row -> "WARNING".equalsIgnoreCase(safeString(row.get("status"))))) {
            return "WARNING";
        }
        return rows.isEmpty() ? "WARNING" : "HEALTHY";
    }

    private String normalizeExternalAuthMethod(String authMethod) {
        String normalized = safeString(authMethod).toUpperCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "OBSERVED";
        }
        if ("OAUTH2_CLIENT".equals(normalized)) {
            return "OAUTH2";
        }
        if ("BASIC_AUTH".equals(normalized)) {
            return "BASIC";
        }
        return normalized;
    }

    private LocalDate deriveCredentialRotationDate(LocalDate today, String authMethod, int index) {
        int offset;
        switch (authMethod) {
            case "API_KEY":
                offset = 78 + (index % 3) * 9;
                break;
            case "OAUTH2":
                offset = 52 + (index % 4) * 6;
                break;
            case "MUTUAL_TLS":
                offset = 110 + (index % 2) * 15;
                break;
            case "BASIC":
                offset = 64 + (index % 3) * 7;
                break;
            default:
                offset = 35 + (index % 4) * 5;
                break;
        }
        return today.minusDays(offset);
    }

    private LocalDate deriveCredentialExpiryDate(LocalDate lastRotatedAt, String authMethod, int index) {
        int validDays;
        switch (authMethod) {
            case "API_KEY":
                validDays = 90;
                break;
            case "OAUTH2":
                validDays = 75;
                break;
            case "MUTUAL_TLS":
                validDays = 180;
                break;
            case "BASIC":
                validDays = 60;
                break;
            default:
                validDays = 45;
                break;
        }
        return lastRotatedAt.plusDays(validDays - (index % 3) * 4L);
    }

    private String resolveCredentialRotationStatus(LocalDate expiresAt, LocalDate today) {
        if (expiresAt.isBefore(today)) {
            return "EXPIRED";
        }
        if (!expiresAt.isAfter(today.plusDays(3))) {
            return "ROTATE_NOW";
        }
        if (!expiresAt.isAfter(today.plusDays(14))) {
            return "ROTATE_SOON";
        }
        return "HEALTHY";
    }

    private String credentialLabel(String authMethod, boolean isEn) {
        switch (authMethod) {
            case "API_KEY":
                return isEn ? "API key fingerprint" : "API 키 지문";
            case "OAUTH2":
                return isEn ? "Client secret binding" : "클라이언트 시크릿 바인딩";
            case "MUTUAL_TLS":
                return isEn ? "mTLS certificate pair" : "mTLS 인증서 페어";
            case "BASIC":
                return isEn ? "Basic credential alias" : "Basic 인증 별칭";
            default:
                return isEn ? "Observed credential placeholder" : "관측 전용 인증 placeholder";
        }
    }

    private String buildMaskedCredentialReference(String connectionId, String authMethod, int index) {
        String normalizedConnectionId = connectionId.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        String suffix = normalizedConnectionId.length() <= 4
                ? normalizedConnectionId
                : normalizedConnectionId.substring(normalizedConnectionId.length() - 4);
        return authMethod + "-****-" + String.format(Locale.ROOT, "%02d", (index % 17) + 1) + suffix;
    }

    private String rotationPolicy(String authMethod) {
        switch (authMethod) {
            case "API_KEY":
            case "BASIC":
                return "MANUAL";
            case "OBSERVED":
                return "REVIEW";
            default:
                return "AUTO";
        }
    }

    private int credentialRotationRank(String rotationStatus) {
        switch (safeString(rotationStatus).toUpperCase(Locale.ROOT)) {
            case "EXPIRED":
                return 4;
            case "ROTATE_NOW":
                return 3;
            case "ROTATE_SOON":
                return 2;
            case "HEALTHY":
                return 1;
            default:
                return 0;
        }
    }

    private String rotationReason(String rotationStatus, String authMethod, boolean isEn) {
        switch (safeString(rotationStatus).toUpperCase(Locale.ROOT)) {
            case "EXPIRED":
                return isEn ? "The managed rotation window is already exceeded." : "관리 기준 교체 주기를 이미 초과했습니다.";
            case "ROTATE_NOW":
                return isEn ? "Coordinate immediate rotation before the next downstream window closes." : "다음 하위 시스템 점검 창이 닫히기 전에 즉시 교체를 조율해야 합니다.";
            case "ROTATE_SOON":
                return isEn ? "Prepare owner handoff and secure-store update in this cycle." : "이번 주기 안에 담당자 인계와 안전 저장소 갱신을 준비해야 합니다.";
            default:
                return "OBSERVED".equalsIgnoreCase(authMethod)
                        ? (isEn ? "Observed-only connection needs explicit credential registration." : "관측 전용 연결이라 명시적 인증 등록이 필요합니다.")
                        : (isEn ? "Within the governed rotation baseline." : "관리 기준 교체 주기 안에 있습니다.");
        }
    }

    private String resolveExternalMaintenanceStatus(Map<String, String> syncRow, Map<String, String> webhookRow, int index) {
        String syncStatus = safeString(syncRow.get("status")).toUpperCase(Locale.ROOT);
        String webhookStatus = safeString(webhookRow.get("status")).toUpperCase(Locale.ROOT);
        if ("DEGRADED".equals(syncStatus) || "DISABLED".equals(syncStatus) || "DEGRADED".equals(webhookStatus) || "DISABLED".equals(webhookStatus)) {
            return "BLOCKED";
        }
        if ("REVIEW".equals(syncStatus) || "REVIEW".equals(webhookStatus) || index % 3 == 0) {
            return "DUE_SOON";
        }
        return "READY";
    }

    private String determineExternalFallbackRoute(Map<String, String> syncRow, Map<String, String> webhookRow, boolean isEn) {
        if (!safeString(webhookRow.get("webhookId")).isEmpty()) {
            return isEn ? "Manual relay + webhook pause" : "수동 릴레이 + 웹훅 일시중지";
        }
        if ("WEBHOOK".equalsIgnoreCase(safeString(syncRow.get("syncMode")))) {
            return isEn ? "Queue drain + partner callback hold" : "큐 배출 후 콜백 보류";
        }
        return isEn ? "Scheduled pull fallback" : "스케줄 수집 대체";
    }

    private String determineExternalImpactScope(Map<String, String> syncRow, Map<String, String> webhookRow, boolean isEn) {
        if (!safeString(webhookRow.get("webhookId")).isEmpty() && !safeString(syncRow.get("jobId")).isEmpty()) {
            return isEn ? "Webhook + sync queue" : "웹훅 + 동기화 큐";
        }
        if (!safeString(webhookRow.get("webhookId")).isEmpty()) {
            return isEn ? "Webhook delivery" : "웹훅 전달";
        }
        return isEn ? "Scheduled sync" : "정기 동기화";
    }

    private String resolveExternalMaintenanceNextAction(String maintenanceStatus, boolean isEn) {
        switch (safeString(maintenanceStatus).toUpperCase(Locale.ROOT)) {
            case "BLOCKED":
                return isEn ? "Clear errors and backlog before opening the window." : "점검 창을 열기 전에 오류와 적체를 먼저 해소합니다.";
            case "DUE_SOON":
                return isEn ? "Confirm owner handoff and fallback route this cycle." : "이번 주기 안에 담당자 인계와 대체 경로를 확정합니다.";
            default:
                return isEn ? "Window can open with the governed checklist." : "관리 체크리스트 기준으로 점검 창을 열 수 있습니다.";
        }
    }

    private int externalMaintenanceRank(String maintenanceStatus) {
        switch (safeString(maintenanceStatus).toUpperCase(Locale.ROOT)) {
            case "BLOCKED":
                return 3;
            case "DUE_SOON":
                return 2;
            case "READY":
                return 1;
            default:
                return 0;
        }
    }

    private String resolveExternalMaintenanceReason(String maintenanceStatus, boolean isEn) {
        switch (safeString(maintenanceStatus).toUpperCase(Locale.ROOT)) {
            case "BLOCKED":
                return isEn ? "Errors, backlog, or degraded delivery must be cleared first." : "오류, 적체, 전달 저하를 먼저 해소해야 합니다.";
            case "DUE_SOON":
                return isEn ? "Upcoming window requires pre-check confirmation." : "예정된 점검 창 전에 사전 확인이 필요합니다.";
            default:
                return isEn ? "Governed baseline is satisfied." : "관리 기준선을 충족했습니다.";
        }
    }

    private int statusRank(String status) {
        String normalized = safeString(status).toUpperCase(Locale.ROOT);
        if ("DEGRADED".equals(normalized)) {
            return 3;
        }
        if ("WARNING".equals(normalized)) {
            return 2;
        }
        if ("HEALTHY".equals(normalized)) {
            return 1;
        }
        return 0;
    }

    private String resolvePerformanceStatus(int heapUsagePercent, int slowRatePercent, int errorRatePercent) {
        if (heapUsagePercent >= 85 || errorRatePercent >= 10 || slowRatePercent >= 20) {
            return "CRITICAL";
        }
        if (heapUsagePercent >= 70 || errorRatePercent > 0 || slowRatePercent >= 10) {
            return "WARNING";
        }
        return "HEALTHY";
    }

    private String formatBytes(long value) {
        if (value <= 0L) {
            return "0 B";
        }
        double size = value;
        String[] units = { "B", "KB", "MB", "GB", "TB" };
        int unitIndex = 0;
        while (size >= 1024D && unitIndex < units.length - 1) {
            size /= 1024D;
            unitIndex++;
        }
        return unitIndex == 0
                ? String.format(Locale.ROOT, "%.0f %s", size, units[unitIndex])
                : String.format(Locale.ROOT, "%.1f %s", size, units[unitIndex]);
    }

    private String formatDurationMs(long value) {
        if (value <= 0L) {
            return "0 ms";
        }
        if (value >= 1000L) {
            return String.format(Locale.ROOT, "%.2f s", value / 1000D);
        }
        return value + " ms";
    }

    private String resolveSrTicketSeverity(String executionStatus) {
        String normalized = safeString(executionStatus).toUpperCase(Locale.ROOT);
        if (normalized.contains("FAILED") || normalized.contains("BLOCKED")) {
            return "CRITICAL";
        }
        if (normalized.contains("RUNNING")) {
            return "WARNING";
        }
        return "INFO";
    }

    private String deriveAuditResultStatus(Map<String, String> row, boolean isEn) {
        String detail = safeString(row.get("detail")).toUpperCase(Locale.ROOT);
        if (detail.contains("ERROR") || detail.contains("FAIL")) {
            return isEn ? "Error" : "오류";
        }
        if (detail.contains("BLOCK")) {
            return isEn ? "Blocked" : "차단";
        }
        if (detail.contains("ALLOW")) {
            return isEn ? "Allowed" : "허용";
        }
        return isEn ? "Completed" : "완료";
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> castStringRowList(Object value) {
        if (!(value instanceof List<?>)) {
            return Collections.emptyList();
        }
        List<Map<String, String>> rows = new ArrayList<>();
        for (Object item : (List<?>) value) {
            if (!(item instanceof Map<?, ?>)) {
                continue;
            }
            Map<String, String> row = new LinkedHashMap<>();
            ((Map<?, ?>) item).forEach((key, entryValue) -> row.put(String.valueOf(key), entryValue == null ? "" : String.valueOf(entryValue).trim()));
            rows.add(row);
        }
        return rows;
    }

    public Map<String, Object> buildBackupConfigPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateBackupConfigPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> saveBackupConfigPayload(AdminBackupConfigSaveRequestDTO requestBody, String actorId, boolean isEn) {
        return backupConfigManagementService.save(requestBody, actorId, isEn);
    }

    public Map<String, Object> restoreBackupConfigVersionPayload(AdminBackupVersionRestoreRequestDTO requestBody, String actorId, boolean isEn) {
        return backupConfigManagementService.restoreVersion(requestBody == null ? null : requestBody.getVersionId(), actorId, isEn);
    }

    public Map<String, Object> runBackupPayload(AdminBackupRunRequestDTO requestBody, String actorId, boolean isEn) {
        return backupConfigManagementService.run(requestBody, actorId, isEn);
    }

    public Map<String, Object> buildAccessHistoryPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String requestedInsttId,
            HttpServletRequest request,
            boolean isEn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        int pageIndex = parsePageIndex(pageIndexParam);
        CurrentUserContextService.CurrentUserContext context = currentUserContextService.resolve(request);
        String currentUserId = safeString(context.getUserId());
        String currentUserAuthorCode = safeString(context.getAuthorCode());
        boolean webmasterAccess = "webmaster".equalsIgnoreCase(currentUserId);
        boolean masterAccess = ROLE_SYSTEM_MASTER.equalsIgnoreCase(currentUserAuthorCode);
        boolean systemAccess = ROLE_SYSTEM_ADMIN.equalsIgnoreCase(currentUserAuthorCode);
        boolean adminAccess = ROLE_ADMIN.equalsIgnoreCase(currentUserAuthorCode);
        boolean operationAccess = ROLE_OPERATION_ADMIN.equalsIgnoreCase(currentUserAuthorCode);
        boolean canView = webmasterAccess || masterAccess || systemAccess || adminAccess || operationAccess;
        payload.put("canViewAccessHistory", canView);
        payload.put("canManageAllCompanies", webmasterAccess || masterAccess);
        payload.put("searchKeyword", safeString(searchKeyword));

        String currentUserInsttId = safeString(context.getInsttId());
        List<Map<String, String>> companyOptions = (webmasterAccess || masterAccess)
                ? loadAccessHistoryCompanyOptions()
                : buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = (webmasterAccess || masterAccess)
                ? adminAuthorityPagePayloadSupport.resolveSelectedInsttId(requestedInsttId, companyOptions, true)
                : currentUserInsttId;
        payload.put("companyOptions", companyOptions);
        payload.put("selectedInsttId", selectedInsttId);

        if (!(webmasterAccess || masterAccess) && currentUserInsttId.isEmpty()) {
            return deniedPayload(payload, "accessHistoryError",
                    isEn ? "Your administrator account is missing company information."
                            : "관리자 계정에 회사 정보가 없습니다.",
                    "accessHistoryList",
                    isEn);
        }

        if (!canView) {
            return deniedPayload(payload, "accessHistoryError",
                    isEn ? "Only master administrators and system administrators can view access history."
                            : "접속 로그는 마스터 관리자와 시스템 관리자만 조회할 수 있습니다.",
                    "accessHistoryList",
                    isEn);
        }

        Map<String, String> companyNameById = new LinkedHashMap<>();
        for (Map<String, String> option : companyOptions) {
            companyNameById.put(safeString(option.get("insttId")), safeString(option.get("cmpnyNm")));
        }

        String forcedInsttId = (webmasterAccess || masterAccess) ? selectedInsttId : currentUserInsttId;
        String errorMessage = "";
        int pageSize = 10;
        List<AdminAccessHistoryRowResponse> rows = new ArrayList<>();
        int totalCount = 0;
        int totalPages = 1;
        int currentPage = 1;
        try {
            AccessEventSearchVO searchVO = new AccessEventSearchVO();
            searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * pageSize);
            searchVO.setRecordCountPerPage(pageSize);
            searchVO.setSearchKeyword(safeString(searchKeyword));
            searchVO.setInsttId(forcedInsttId);
            searchVO.setFeatureType("PAGE_VIEW");
            totalCount = observabilityQueryService.selectAccessEventCount(searchVO);
            totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            currentPage = Math.max(1, Math.min(pageIndex, totalPages));
            searchVO.setFirstIndex(Math.max(currentPage - 1, 0) * pageSize);
            for (AccessEventRecordVO item : observabilityQueryService.selectAccessEventList(searchVO)) {
                String scopedInsttId = firstNonBlank(
                        safeString(item.getTargetCompanyContextId()),
                        safeString(item.getCompanyContextId()),
                        safeString(item.getActorInsttId()));
                if (scopedInsttId.isEmpty()) {
                    scopedInsttId = "__GLOBAL__";
                }
                rows.add(createAccessHistoryRowFromAccessEvent(
                        item,
                        scopedInsttId,
                        companyNameById.getOrDefault(scopedInsttId,
                                "__GLOBAL__".equals(scopedInsttId) ? (isEn ? "Global" : "공통/전체") : resolveCompanyNameByInsttId(scopedInsttId))));
            }
        } catch (Exception e) {
            log.error("Failed to load persisted access history. Falling back to recent file logs.", e);
            errorMessage = isEn
                    ? "Persistent access history is not ready yet. Showing recent log file data."
                    : "영구 접속 로그가 아직 준비되지 않아 최근 파일 로그를 대신 표시합니다.";
            String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
            try {
                RequestExecutionLogPage fallbackPage = requestExecutionLogService.searchRecent(item -> {
                    if (isAccessHistorySelfNoise(item) || !isFallbackPageAccessCandidate(item)) {
                        return false;
                    }
                    String scopedInsttId = resolveAccessHistoryInsttId(item);
                    if (scopedInsttId.isEmpty() && !masterAccess) {
                        return false;
                    }
                    if (scopedInsttId.isEmpty()) {
                        scopedInsttId = "__GLOBAL__";
                    }
                    if (!forcedInsttId.isEmpty() && !forcedInsttId.equals(scopedInsttId)) {
                        return false;
                    }
                    return normalizedKeyword.isEmpty()
                            || matchesAccessHistoryKeyword(item, normalizedKeyword, companyNameById.get(scopedInsttId));
                }, pageIndex, pageSize);
                totalCount = fallbackPage.getTotalCount();
                totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
                currentPage = Math.max(1, Math.min(pageIndex, totalPages));
                for (RequestExecutionLogVO item : fallbackPage.getItems()) {
                    String scopedInsttId = resolveAccessHistoryInsttId(item);
                    if (scopedInsttId.isEmpty()) {
                        scopedInsttId = "__GLOBAL__";
                    }
                    rows.add(createAccessHistoryRowFromExecutionLog(
                            item,
                            scopedInsttId,
                            companyNameById.getOrDefault(scopedInsttId,
                                    "__GLOBAL__".equals(scopedInsttId) ? (isEn ? "Global" : "공통/전체") : scopedInsttId)));
                }
            } catch (Exception inner) {
                log.error("Failed to load fallback access history.", inner);
            }
        }

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
        payload.put("accessHistoryError", errorMessage);
        payload.put("accessHistoryList", rows);
        payload.put("totalCount", totalCount);
        payload.put("pageIndex", currentPage);
        payload.put("pageSize", pageSize);
        payload.put("totalPages", totalPages);
        payload.put("startPage", startPage);
        payload.put("endPage", endPage);
        payload.put("prevPage", Math.max(1, currentPage - 1));
        payload.put("nextPage", Math.min(totalPages, currentPage + 1));
        payload.put("isEn", isEn);
        return payload;
    }

    public Map<String, Object> buildErrorLogPagePayload(
            String pageIndexParam,
            String searchKeyword,
            String requestedInsttId,
            String sourceType,
            String errorType,
            HttpServletRequest request,
            boolean isEn) {
        Map<String, Object> payload = new LinkedHashMap<>();
        int pageIndex = parsePageIndex(pageIndexParam);
        CurrentUserContextService.CurrentUserContext context = currentUserContextService.resolve(request);
        String currentUserAuthorCode = safeString(context.getAuthorCode());
        boolean masterAccess = ROLE_SYSTEM_MASTER.equalsIgnoreCase(currentUserAuthorCode);
        boolean systemAccess = ROLE_SYSTEM_ADMIN.equalsIgnoreCase(currentUserAuthorCode);
        boolean canView = masterAccess || systemAccess;
        payload.put("canViewErrorLog", canView);
        payload.put("canManageAllCompanies", masterAccess);
        payload.put("searchKeyword", safeString(searchKeyword));
        payload.put("selectedSourceType", safeString(sourceType));
        payload.put("selectedErrorType", safeString(errorType));

        String currentUserInsttId = safeString(context.getInsttId());
        List<Map<String, String>> companyOptions = masterAccess
                ? loadAccessHistoryCompanyOptions()
                : buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = masterAccess
                ? adminAuthorityPagePayloadSupport.resolveSelectedInsttId(requestedInsttId, companyOptions, true)
                : currentUserInsttId;
        payload.put("companyOptions", companyOptions);
        payload.put("selectedInsttId", selectedInsttId);

        if (!masterAccess && currentUserInsttId.isEmpty()) {
            return deniedPayload(payload, "errorLogError",
                    isEn ? "Your administrator account is missing company information."
                            : "관리자 계정에 회사 정보가 없습니다.",
                    "errorLogList",
                    isEn);
        }
        if (!canView) {
            return deniedPayload(payload, "errorLogError",
                    isEn ? "Only master administrators and system administrators can view error logs."
                            : "에러 로그는 마스터 관리자와 시스템 관리자만 조회할 수 있습니다.",
                    "errorLogList",
                    isEn);
        }

        String forcedInsttId = masterAccess ? selectedInsttId : currentUserInsttId;
        int pageSize = 10;
        int totalCount = 0;
        int totalPages = 1;
        int currentPage = 1;
        List<AdminErrorLogRowResponse> rows = new ArrayList<>();
        String errorMessage = "";
        try {
            ErrorEventSearchVO searchVO = new ErrorEventSearchVO();
            searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * pageSize);
            searchVO.setRecordCountPerPage(pageSize);
            searchVO.setSearchKeyword(safeString(searchKeyword));
            searchVO.setInsttId(forcedInsttId);
            searchVO.setSourceType(safeString(sourceType));
            searchVO.setErrorType(safeString(errorType));
            totalCount = observabilityQueryService.selectErrorEventCount(searchVO);
            totalPages = totalCount == 0 ? 1 : (int) Math.ceil(totalCount / (double) pageSize);
            currentPage = Math.max(1, Math.min(pageIndex, totalPages));
            searchVO.setFirstIndex(Math.max(currentPage - 1, 0) * pageSize);
            for (ErrorEventRecordVO item : observabilityQueryService.selectErrorEventList(searchVO)) {
                String scopedInsttId = safeString(item.getActorInsttId());
                rows.add(createErrorLogRow(
                        item,
                        scopedInsttId,
                        scopedInsttId.isEmpty() ? "-" : resolveCompanyNameByInsttId(scopedInsttId)));
            }
        } catch (Exception e) {
            log.error("Failed to load error log page.", e);
            errorMessage = isEn ? "An error occurred while retrieving error logs." : "에러 로그 조회 중 오류가 발생했습니다.";
        }

        int startPage = Math.max(1, currentPage - 4);
        int endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) {
            startPage = Math.max(1, endPage - 9);
        }
        payload.put("errorLogError", errorMessage);
        payload.put("errorLogList", rows);
        payload.put("totalCount", totalCount);
        payload.put("pageIndex", currentPage);
        payload.put("pageSize", pageSize);
        payload.put("totalPages", totalPages);
        payload.put("startPage", startPage);
        payload.put("endPage", endPage);
        payload.put("prevPage", Math.max(1, currentPage - 1));
        payload.put("nextPage", Math.min(totalPages, currentPage + 1));
        payload.put("sourceTypeOptions", buildObservabilityOptionList("", "BACKEND_ERROR_CONTROLLER", "PAGE_EXCEPTION_ADVICE", "FRONTEND_REPORT", "FRONTEND_TELEMETRY"));
        payload.put("errorTypeOptions", buildObservabilityOptionList("", "UI_ERROR", "ERROR_DISPATCH", "PAGE_EXCEPTION"));
        payload.put("isEn", isEn);
        return payload;
    }

    public List<Map<String, String>> loadAccessHistoryCompanyOptions() {
        try {
            Map<String, Object> searchParams = new LinkedHashMap<>();
            searchParams.put("keyword", "");
            searchParams.put("status", "");
            searchParams.put("offset", 0);
            searchParams.put("pageSize", 500);
            List<?> companies = enterpriseMemberService.searchCompanyListPaged(searchParams);
            Map<String, String> dedup = new LinkedHashMap<>();
            for (Object item : companies) {
                String insttId = "";
                String cmpnyNm = "";
                if (item instanceof CompanyListItemVO) {
                    CompanyListItemVO company = (CompanyListItemVO) item;
                    insttId = safeString(company.getInsttId());
                    cmpnyNm = safeString(company.getCmpnyNm());
                } else if (item instanceof Map) {
                    Map<?, ?> row = (Map<?, ?>) item;
                    insttId = stringValue(row.get("insttId"));
                    if (insttId.isEmpty()) {
                        insttId = stringValue(row.get("INSTT_ID"));
                    }
                    cmpnyNm = stringValue(row.get("cmpnyNm"));
                    if (cmpnyNm.isEmpty()) {
                        cmpnyNm = stringValue(row.get("CMPNY_NM"));
                    }
                }
                if (!insttId.isEmpty() && !dedup.containsKey(insttId)) {
                    dedup.put(insttId, cmpnyNm);
                }
            }
            List<Map<String, String>> options = new ArrayList<>();
            for (Map.Entry<String, String> entry : dedup.entrySet()) {
                Map<String, String> option = new LinkedHashMap<>();
                option.put("insttId", entry.getKey());
                option.put("cmpnyNm", entry.getValue());
                options.add(option);
            }
            return options;
        } catch (Exception e) {
            log.warn("Failed to load access history company options.", e);
            return Collections.emptyList();
        }
    }

    public List<Map<String, String>> buildScopedAccessHistoryCompanyOptions(String insttId) {
        String normalizedInsttId = safeString(insttId);
        if (normalizedInsttId.isEmpty()) {
            return Collections.emptyList();
        }
        List<Map<String, String>> masterOptions = loadAccessHistoryCompanyOptions();
        if (masterOptions.isEmpty()) {
            Map<String, String> fallback = new LinkedHashMap<>();
            fallback.put("insttId", normalizedInsttId);
            fallback.put("cmpnyNm", normalizedInsttId);
            return Collections.singletonList(fallback);
        }
        return masterOptions.stream()
                .filter(option -> normalizedInsttId.equals(option.get("insttId")))
                .collect(Collectors.toList());
    }

    private Map<String, Object> deniedPayload(Map<String, Object> payload,
                                              String errorKey,
                                              String message,
                                              String listKey,
                                              boolean isEn) {
        payload.put(errorKey, message);
        payload.put(listKey, Collections.emptyList());
        payload.put("totalCount", 0);
        payload.put("pageIndex", 1);
        payload.put("pageSize", 10);
        payload.put("totalPages", 1);
        payload.put("startPage", 1);
        payload.put("endPage", 1);
        payload.put("prevPage", 1);
        payload.put("nextPage", 1);
        payload.put("isEn", isEn);
        return payload;
    }

    private int parsePageIndex(String pageIndexParam) {
        if (pageIndexParam != null && !pageIndexParam.trim().isEmpty()) {
            try {
                return Integer.parseInt(pageIndexParam.trim());
            } catch (NumberFormatException ignored) {
                return 1;
            }
        }
        return 1;
    }

    private String resolveCompanyNameByInsttId(String insttId) {
        String normalizedInsttId = safeString(insttId);
        if (normalizedInsttId.isEmpty()) {
            return "";
        }
        return companyNameCache.computeIfAbsent(normalizedInsttId, this::lookupCompanyNameByInsttId);
    }

    private String lookupCompanyNameByInsttId(String normalizedInsttId) {
        InstitutionStatusVO institution = loadInstitutionInfoByInsttId(normalizedInsttId);
        if (institution == null) {
            return normalizedInsttId;
        }
        String companyName = safeString(institution.getInsttNm());
        return companyName.isEmpty() ? normalizedInsttId : companyName;
    }

    private InstitutionStatusVO loadInstitutionInfoByInsttId(String insttId) {
        try {
            InsttInfoVO searchVO = new InsttInfoVO();
            searchVO.setInsttId(safeString(insttId));
            return enterpriseMemberService.selectInsttInfoForStatus(searchVO);
        } catch (Exception e) {
            log.warn("Failed to load institution info. insttId={}", safeString(insttId), e);
            return null;
        }
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            String normalized = safeString(value);
            if (!normalized.isEmpty()) {
                return normalized;
            }
        }
        return "";
    }

    private AdminAccessHistoryRowResponse createAccessHistoryRowFromAccessEvent(
            AccessEventRecordVO item,
            String insttId,
            String companyName) {
        return new AdminAccessHistoryRowResponse(
                safeString(item.getCreatedAt()),
                insttId,
                companyName,
                safeString(item.getActorId()),
                safeString(item.getActorType()),
                safeString(item.getActorRole()),
                safeString(item.getRequestUri()),
                safeString(item.getHttpMethod()),
                item.getResponseStatus(),
                item.getDurationMs(),
                safeString(item.getRemoteAddr()),
                safeString(item.getFeatureType()),
                safeString(item.getCompanyScopeDecision()),
                safeString(item.getPageId()),
                safeString(item.getApiId()));
    }

    private AdminAccessHistoryRowResponse createAccessHistoryRowFromExecutionLog(
            RequestExecutionLogVO item,
            String insttId,
            String companyName) {
        return new AdminAccessHistoryRowResponse(
                safeString(item.getExecutedAt()),
                insttId,
                companyName,
                safeString(item.getActorUserId()),
                safeString(item.getActorType()),
                safeString(item.getActorAuthorCode()),
                safeString(item.getRequestUri()),
                safeString(item.getHttpMethod()),
                item.getResponseStatus(),
                item.getDurationMs(),
                safeString(item.getRemoteAddr()),
                safeString(item.getFeatureType()),
                safeString(item.getCompanyScopeDecision()),
                "",
                "");
    }

    private AdminErrorLogRowResponse createErrorLogRow(ErrorEventRecordVO item, String insttId, String companyName) {
        return new AdminErrorLogRowResponse(
                safeString(item.getCreatedAt()),
                insttId,
                companyName,
                safeString(item.getSourceType()),
                safeString(item.getErrorType()),
                safeString(item.getActorId()),
                safeString(item.getActorRole()),
                safeString(item.getRequestUri()),
                safeString(item.getPageId()),
                safeString(item.getApiId()),
                safeString(item.getRemoteAddr()),
                safeString(item.getMessage()),
                safeString(item.getResultStatus()));
    }

    private List<Map<String, String>> buildObservabilityOptionList(String... values) {
        List<Map<String, String>> items = new ArrayList<>();
        if (values == null) {
            return items;
        }
        for (String value : values) {
            Map<String, String> option = new LinkedHashMap<>();
            option.put("value", safeString(value));
            option.put("label", safeString(value).isEmpty() ? "전체" : safeString(value));
            items.add(option);
        }
        return items;
    }

    private String resolveAccessHistoryInsttId(RequestExecutionLogVO item) {
        if (item == null) {
            return "";
        }
        String[] candidates = {
                safeString(item.getCompanyContextId()),
                safeString(item.getTargetCompanyContextId()),
                safeString(item.getActorInsttId())
        };
        for (String candidate : candidates) {
            if (!candidate.isEmpty()) {
                return candidate;
            }
        }
        return "";
    }

    private boolean matchesAccessHistoryKeyword(RequestExecutionLogVO item, String keyword, String companyName) {
        String normalizedKeyword = safeString(keyword).toLowerCase(Locale.ROOT);
        if (normalizedKeyword.isEmpty()) {
            return true;
        }
        return safeString(item.getActorUserId()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(item.getRequestUri()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(item.getRemoteAddr()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(item.getActorAuthorCode()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(companyName).toLowerCase(Locale.ROOT).contains(normalizedKeyword);
    }

    private boolean isAccessHistorySelfNoise(RequestExecutionLogVO item) {
        String uri = safeString(item == null ? null : item.getRequestUri());
        return "/admin/system/access_history".equals(uri)
                || "/en/admin/system/access_history".equals(uri)
                || "/admin/system/access_history/page-data".equals(uri)
                || "/en/admin/system/access_history/page-data".equals(uri);
    }

    private boolean isFallbackPageAccessCandidate(RequestExecutionLogVO item) {
        String uri = safeString(item == null ? null : item.getRequestUri()).toLowerCase(Locale.ROOT);
        String method = safeString(item == null ? null : item.getHttpMethod()).toUpperCase(Locale.ROOT);
        if (!"GET".equals(method)) {
            return false;
        }
        if (uri.isEmpty()
                || uri.startsWith("/api/")
                || uri.contains("/api/")
                || uri.endsWith("/page-data")
                || uri.startsWith("/css/")
                || uri.startsWith("/js/")
                || uri.startsWith("/images/")) {
            return false;
        }
        return uri.startsWith("/admin/") || uri.startsWith("/en/admin/");
    }

    private List<Map<String, String>> filterAndSortSecurityAuditRows(
            List<Map<String, String>> rows,
            String searchKeyword,
            String actionType,
            String routeGroup,
            String startDate,
            String endDate,
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
            if (!matchesSecurityAuditDateRange(row, startDate, endDate)) {
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
                                row -> extractSecurityAuditActorId(stringValue(row.get("actor"))),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> stringValue(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "ACTION":
                return Comparator.<Map<String, String>, String>comparing(
                                row -> stringValue(row.get("action")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> stringValue(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "TARGET":
                return Comparator.<Map<String, String>, String>comparing(
                                row -> stringValue(row.get("target")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> stringValue(row.get("auditAt")), String.CASE_INSENSITIVE_ORDER);
            case "AUDIT_AT":
            default:
                return Comparator.<Map<String, String>, String>comparing(
                                row -> stringValue(row.get("auditAt")),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(row -> stringValue(row.get("target")), String.CASE_INSENSITIVE_ORDER);
        }
    }

    private boolean matchesSecurityAuditKeyword(Map<String, String> row, String normalizedKeyword) {
        String actor = safeString(row.get("actor"));
        String target = safeString(row.get("target"));
        String detail = safeString(row.get("detail"));
        String action = safeString(row.get("action"));
        return actor.toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || target.toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || detail.toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || action.toLowerCase(Locale.ROOT).contains(normalizedKeyword)
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

    private boolean matchesSecurityAuditDateRange(Map<String, String> row, String startDate, String endDate) {
        if (startDate.isEmpty() && endDate.isEmpty()) {
            return true;
        }
        LocalDate auditDate = parseSecurityAuditRowDate(safeString(row.get("auditAt")));
        if (auditDate == null) {
            return true;
        }
        LocalDate start = parseSecurityAuditDate(startDate);
        LocalDate end = parseSecurityAuditDate(endDate);
        if (start != null && auditDate.isBefore(start)) {
            return false;
        }
        if (end != null && auditDate.isAfter(end)) {
            return false;
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
        int responseStatus = parsePositiveInt(safeString(row.get("responseStatus")), 0);
        return responseStatus >= 400 || !safeString(row.get("errorMessage")).isEmpty();
    }

    private boolean isSecurityAuditSlowRow(Map<String, String> row) {
        long durationMs = parsePositiveLong(safeString(row.get("durationMs")), 0L);
        return durationMs >= 1000L;
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
                .map(entry -> {
                    Map<String, String> item = new LinkedHashMap<>();
                    item.put("label", label);
                    item.put("value", entry.getKey());
                    item.put("count", String.valueOf(entry.getValue()));
                    return item;
                })
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
        return safeString(normalized);
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
        return "ASC".equalsIgnoreCase(safeString(sortDirection)) ? "ASC" : "DESC";
    }

    private String normalizeSecurityAuditDate(String value) {
        LocalDate parsed = parseSecurityAuditDate(value);
        return parsed == null ? "" : parsed.toString();
    }

    private LocalDate parseSecurityAuditDate(String value) {
        String normalized = safeString(value);
        if (normalized.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(normalized);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private LocalDate parseSecurityAuditRowDate(String auditAt) {
        String normalized = safeString(auditAt);
        if (normalized.length() < 10) {
            return null;
        }
        try {
            return LocalDate.parse(normalized.substring(0, 10));
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private int parsePositiveInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(safeString(value));
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }
    }

    private long parsePositiveLong(String value, long defaultValue) {
        try {
            return Long.parseLong(safeString(value));
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }
    }

    private String csvCell(String value) {
        return "\"" + safeString(value).replace("\"", "\"\"") + "\"";
    }

    private String stringValue(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
