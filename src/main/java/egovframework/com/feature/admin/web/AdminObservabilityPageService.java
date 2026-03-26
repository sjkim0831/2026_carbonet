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
import egovframework.com.feature.admin.dto.request.AdminBackupRunRequestDTO;
import egovframework.com.feature.admin.dto.response.AdminAccessHistoryRowResponse;
import egovframework.com.feature.admin.dto.response.AdminErrorLogRowResponse;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Service
public class AdminObservabilityPageService {

    private static final Logger log = LoggerFactory.getLogger(AdminObservabilityPageService.class);
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";

    private final AdminListPageModelAssembler adminListPageModelAssembler;
    private final AdminSystemPageModelAssembler adminSystemPageModelAssembler;
    private final ObservabilityQueryService observabilityQueryService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final EnterpriseMemberService enterpriseMemberService;
    private final CurrentUserContextService currentUserContextService;
    private final AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport;
    private final BackupConfigManagementService backupConfigManagementService;
    private final ConcurrentMap<String, String> companyNameCache = new ConcurrentHashMap<>();

    public AdminObservabilityPageService(AdminListPageModelAssembler adminListPageModelAssembler,
                                         AdminSystemPageModelAssembler adminSystemPageModelAssembler,
                                         ObservabilityQueryService observabilityQueryService,
                                         RequestExecutionLogService requestExecutionLogService,
                                         EnterpriseMemberService enterpriseMemberService,
                                         CurrentUserContextService currentUserContextService,
                                         AdminAuthorityPagePayloadSupport adminAuthorityPagePayloadSupport,
                                         BackupConfigManagementService backupConfigManagementService) {
        this.adminListPageModelAssembler = adminListPageModelAssembler;
        this.adminSystemPageModelAssembler = adminSystemPageModelAssembler;
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
            HttpServletRequest request,
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminListPageModelAssembler.populateBlockedLoginHistory(
                pageIndexParam,
                searchKeyword,
                userSe,
                insttId,
                model,
                request);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
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
            boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateBlocklistPage(searchKeyword, blockType, status, model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
    }

    public Map<String, Object> buildSecurityAuditPagePayload(boolean isEn) {
        ExtendedModelMap model = new ExtendedModelMap();
        adminSystemPageModelAssembler.populateSecurityAuditPage(model, isEn);
        model.addAttribute("isEn", isEn);
        return new LinkedHashMap<>(model);
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

    private String stringValue(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
