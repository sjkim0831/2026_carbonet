package egovframework.com.feature.admin.web;

import egovframework.com.common.error.ErrorEventRecordVO;
import egovframework.com.common.error.ErrorEventSearchVO;
import egovframework.com.common.logging.AccessEventRecordVO;
import egovframework.com.common.logging.AccessEventSearchVO;
import egovframework.com.common.logging.RequestExecutionLogPage;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.feature.admin.dto.request.AdminBackupConfigSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupVersionRestoreRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupRunRequestDTO;
import egovframework.com.feature.admin.dto.response.AdminAccessHistoryRowResponse;
import egovframework.com.feature.admin.dto.response.AdminErrorLogRowResponse;
import egovframework.com.feature.admin.model.vo.SecurityAuditSnapshot;
import egovframework.com.feature.admin.service.AdminSummaryService;
import egovframework.com.feature.admin.service.BackupConfigManagementService;
import egovframework.com.feature.auth.service.CurrentUserContextService;
import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import egovframework.com.feature.member.model.vo.InsttInfoVO;
import egovframework.com.feature.member.model.vo.InstitutionStatusVO;
import egovframework.com.feature.member.service.EnterpriseMemberService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.ui.ExtendedModelMap;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Comparator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminObservabilityPageService {

    private static final Logger log = LoggerFactory.getLogger(AdminObservabilityPageService.class);
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";
    private static final int SECURITY_AUDIT_PAGE_SIZE = 10;

    private final AdminListPageModelAssembler adminListPageModelAssembler;
    private final AdminSystemPageModelAssembler adminSystemPageModelAssembler;
    private final AdminSummaryService adminSummaryService;
    private final ObservabilityQueryService observabilityQueryService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final EnterpriseMemberService enterpriseMemberService;
    private final CurrentUserContextService currentUserContextService;
    private final AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport;
    private final BackupConfigManagementService backupConfigManagementService;
    private final ConcurrentMap<String, String> companyNameCache = new ConcurrentHashMap<>();

    public AdminObservabilityPageService(AdminListPageModelAssembler adminListPageModelAssembler,
                                         AdminSystemPageModelAssembler adminSystemPageModelAssembler,
                                         AdminSummaryService adminSummaryService,
                                         ObservabilityQueryService observabilityQueryService,
                                         RequestExecutionLogService requestExecutionLogService,
                                         EnterpriseMemberService enterpriseMemberService,
                                         CurrentUserContextService currentUserContextService,
                                         AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport,
                                         BackupConfigManagementService backupConfigManagementService) {
        this.adminListPageModelAssembler = adminListPageModelAssembler;
        this.adminSystemPageModelAssembler = adminSystemPageModelAssembler;
        this.adminSummaryService = adminSummaryService;
        this.observabilityQueryService = observabilityQueryService;
        this.requestExecutionLogService = requestExecutionLogService;
        this.enterpriseMemberService = enterpriseMemberService;
        this.currentUserContextService = currentUserContextService;
        this.adminAuthorityPagePayloadSupport = adminAuthorityPagePayloadSupport;
        this.backupConfigManagementService = backupConfigManagementService;
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

    public Map<String, Object> buildSecurityMonitoringPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityMonitoringPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
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
}
