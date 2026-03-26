package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.trace.TraceEventSearchVO;
import egovframework.com.feature.admin.dto.request.AdminBackupConfigSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupRunRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminUnifiedLogSearchRequestDTO;
import egovframework.com.feature.auth.service.CurrentUserContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.security.web.csrf.CsrfToken;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminObservabilityController {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<Map<String, Object>>() {};
    private final ObservabilityQueryService observabilityQueryService;
    private final AdminObservabilityPageService adminObservabilityPageService;
    private final CurrentUserContextService currentUserContextService;

    @RequestMapping(value = "/system/observability", method = RequestMethod.GET)
    public String observabilityPage(HttpServletRequest request, Locale locale, Model model) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append("observability");
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    @RequestMapping(value = "/system/unified_log", method = RequestMethod.GET)
    public String unifiedLogPage(HttpServletRequest request, Locale locale, Model model) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append("unified-log");
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    @RequestMapping(value = "/system/unified_log/trace", method = RequestMethod.GET)
    public String unifiedTraceLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "trace", "", "", "");
    }

    @RequestMapping(value = "/system/unified_log/page-events", method = RequestMethod.GET)
    public String unifiedPageEventLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "trace", "PAGE_VIEW,PAGE_LEAVE", "", "");
    }

    @RequestMapping(value = "/system/unified_log/ui-actions", method = RequestMethod.GET)
    public String unifiedUiActionLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "trace", "UI_ACTION", "", "");
    }

    @RequestMapping(value = "/system/unified_log/api-trace", method = RequestMethod.GET)
    public String unifiedApiTraceLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "trace", "API_REQUEST,API_RESPONSE", "", "");
    }

    @RequestMapping(value = "/system/unified_log/ui-errors", method = RequestMethod.GET)
    public String unifiedUiErrorLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "error", "UI_ERROR,WINDOW_ERROR,UNHANDLED_REJECTION,REACT_ERROR_BOUNDARY,FRONTEND_REPORT,FRONTEND_TELEMETRY", "", "");
    }

    @RequestMapping(value = "/system/unified_log/layout-render", method = RequestMethod.GET)
    public String unifiedLayoutRenderLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardUnifiedLogPreset(request, locale, "trace", "LAYOUT_RENDER", "", "");
    }

    @RequestMapping(value = "/system/security", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityHistoryPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "security-history");
    }

    @RequestMapping(value = "/system/access_history", method = { RequestMethod.GET, RequestMethod.POST })
    public String accessHistoryPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "access-history");
    }

    @RequestMapping(value = "/system/error-log", method = { RequestMethod.GET, RequestMethod.POST })
    public String errorLogPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "sourceType", required = false) String sourceType,
            @RequestParam(value = "errorType", required = false) String errorType,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "error-log");
    }

    @GetMapping("/system/error-log/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> errorLogPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "sourceType", required = false) String sourceType,
            @RequestParam(value = "errorType", required = false) String errorType,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildErrorLogPagePayload(
                pageIndexParam,
                searchKeyword,
                insttId,
                sourceType,
                errorType,
                request,
                isEnglishRequest(request, locale)));
    }

    @GetMapping("/system/security/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityHistoryPagePayload(
                pageIndexParam,
                searchKeyword,
                userSe,
                insttId,
                request,
                isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/security-policy", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityPolicyPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "security-policy");
    }

    @GetMapping("/system/security-policy/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityPolicyPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityPolicyPagePayload(isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/security-monitoring", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityMonitoringPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "security-monitoring");
    }

    @GetMapping("/system/security-monitoring/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityMonitoringPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityMonitoringPagePayload(isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/blocklist", method = { RequestMethod.GET, RequestMethod.POST })
    public String blocklistPage(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "blockType", required = false) String blockType,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "blocklist");
    }

    @GetMapping("/system/blocklist/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> blocklistPageApi(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "blockType", required = false) String blockType,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBlocklistPagePayload(
                searchKeyword,
                blockType,
                status,
                isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/security-audit", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityAuditPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "security-audit");
    }

    @GetMapping("/system/security-audit/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityAuditPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityAuditPagePayload(isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/scheduler", method = { RequestMethod.GET, RequestMethod.POST })
    public String schedulerPage(
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(value = "executionType", required = false) String executionType,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "scheduler-management");
    }

    @GetMapping("/system/scheduler/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> schedulerPageApi(
            @RequestParam(value = "jobStatus", required = false) String jobStatus,
            @RequestParam(value = "executionType", required = false) String executionType,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSchedulerPagePayload(
                jobStatus,
                executionType,
                isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/backup_config", method = { RequestMethod.GET, RequestMethod.POST })
    public String backupConfigPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "backup-config");
    }

    @RequestMapping(value = "/system/backup", method = { RequestMethod.GET, RequestMethod.POST })
    public String backupExecutionPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "backup-execution");
    }

    @RequestMapping(value = "/system/restore", method = { RequestMethod.GET, RequestMethod.POST })
    public String restoreExecutionPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "restore-execution");
    }

    @RequestMapping(value = "/system/version", method = { RequestMethod.GET, RequestMethod.POST })
    public String versionManagementPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "version-management");
    }

    @GetMapping({ "/system/backup_config/page-data", "/system/backup/page-data", "/system/restore/page-data", "/system/version/page-data" })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> backupConfigPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBackupConfigPagePayload(isEnglishRequest(request, locale)));
    }

    @PostMapping("/system/backup_config/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBackupConfigPageApi(
            @RequestBody AdminBackupConfigSaveRequestDTO requestBody,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        CurrentUserContextService.CurrentUserContext currentUser = currentUserContextService.resolve(request);
        String actorId = safe(currentUser == null ? "" : currentUser.getUserId());
        return ResponseEntity.ok(adminObservabilityPageService.saveBackupConfigPayload(requestBody, actorId, isEnglishRequest(request, locale)));
    }

    @PostMapping("/system/backup/run")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> runBackupPageApi(
            @RequestBody AdminBackupRunRequestDTO requestBody,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        CurrentUserContextService.CurrentUserContext currentUser = currentUserContextService.resolve(request);
        String actorId = safe(currentUser == null ? "" : currentUser.getUserId());
        return ResponseEntity.ok(adminObservabilityPageService.runBackupPayload(requestBody, actorId, isEnglishRequest(request, locale)));
    }

    @GetMapping("/system/backup/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> backupExecutionPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBackupConfigPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/system/restore/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> restoreExecutionPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBackupConfigPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/system/version/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> versionManagementPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBackupConfigPagePayload(isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/member/login_history", method = { RequestMethod.GET, RequestMethod.POST })
    public String loginHistoryPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "login-history");
    }

    @GetMapping("/api/admin/member/login-history/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "userSe", required = false) String userSe,
            @RequestParam(value = "loginResult", required = false) String loginResult,
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildLoginHistoryPagePayload(
                pageIndexParam,
                searchKeyword,
                userSe,
                loginResult,
                insttId,
                request,
                isEnglishRequest(request, locale)));
    }

    @GetMapping("/api/admin/observability/audit-events")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchAuditEvents(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "pageSize", required = false) String pageSizeParam,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "actorId", required = false) String actorId,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        int pageIndex = parsePositiveInt(pageIndexParam, 1);
        int pageSize = parsePositiveInt(pageSizeParam, 20);
        AuditEventSearchVO searchVO = new AuditEventSearchVO();
        searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * Math.max(pageSize, 1));
        searchVO.setRecordCountPerPage(Math.max(pageSize, 1));
        searchVO.setTraceId(safe(traceId));
        searchVO.setActorId(safe(actorId));
        searchVO.setActionCode(safe(actionCode));
        searchVO.setMenuCode(safe(menuCode));
        searchVO.setPageId(safe(pageId));
        searchVO.setResultStatus(safe(resultStatus));
        searchVO.setSearchKeyword(safe(searchKeyword));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pageIndex", pageIndex);
        response.put("pageSize", pageSize);
        response.put("totalCount", observabilityQueryService.selectAuditEventCount(searchVO));
        response.put("items", enrichAuditItems(observabilityQueryService.selectAuditEventList(searchVO)));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/observability/trace-events")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchTraceEvents(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "pageSize", required = false) String pageSizeParam,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "functionId", required = false) String functionId,
            @RequestParam(value = "apiId", required = false) String apiId,
            @RequestParam(value = "eventType", required = false) String eventType,
            @RequestParam(value = "resultCode", required = false) String resultCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        int pageIndex = parsePositiveInt(pageIndexParam, 1);
        int pageSize = parsePositiveInt(pageSizeParam, 20);
        TraceEventSearchVO searchVO = new TraceEventSearchVO();
        searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * Math.max(pageSize, 1));
        searchVO.setRecordCountPerPage(Math.max(pageSize, 1));
        searchVO.setTraceId(safe(traceId));
        searchVO.setPageId(safe(pageId));
        searchVO.setComponentId(safe(componentId));
        searchVO.setFunctionId(safe(functionId));
        searchVO.setApiId(safe(apiId));
        searchVO.setEventType(safe(eventType));
        searchVO.setResultCode(safe(resultCode));
        searchVO.setSearchKeyword(safe(searchKeyword));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pageIndex", pageIndex);
        response.put("pageSize", pageSize);
        response.put("totalCount", observabilityQueryService.selectTraceEventCount(searchVO));
        response.put("items", observabilityQueryService.selectTraceEventList(searchVO));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/observability/unified-log")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchUnifiedLog(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "pageSize", required = false) String pageSizeParam,
            @RequestParam(value = "tab", required = false) String tab,
            @RequestParam(value = "logType", required = false) String logType,
            @RequestParam(value = "detailType", required = false) String detailType,
            @RequestParam(value = "resultCode", required = false) String resultCode,
            @RequestParam(value = "actorId", required = false) String actorId,
            @RequestParam(value = "actorRole", required = false) String actorRole,
            @RequestParam(value = "insttId", required = false) String insttId,
            @RequestParam(value = "memberType", required = false) String memberType,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "functionId", required = false) String functionId,
            @RequestParam(value = "apiId", required = false) String apiId,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            @RequestParam(value = "targetType", required = false) String targetType,
            @RequestParam(value = "targetId", required = false) String targetId,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "requestUri", required = false) String requestUri,
            @RequestParam(value = "remoteAddr", required = false) String remoteAddr,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        int pageIndex = parsePositiveInt(pageIndexParam, 1);
        int pageSize = parsePositiveInt(pageSizeParam, 20);
        AdminUnifiedLogSearchRequestDTO searchDTO = new AdminUnifiedLogSearchRequestDTO();
        searchDTO.setPageIndex(pageIndex);
        searchDTO.setPageSize(pageSize);
        searchDTO.setTab(safe(tab));
        searchDTO.setLogType(safe(logType));
        searchDTO.setDetailType(safe(detailType));
        searchDTO.setResultCode(safe(resultCode));
        searchDTO.setActorId(safe(actorId));
        searchDTO.setActorRole(safe(actorRole));
        searchDTO.setInsttId(safe(insttId));
        searchDTO.setMemberType(safe(memberType));
        searchDTO.setMenuCode(safe(menuCode));
        searchDTO.setPageId(safe(pageId));
        searchDTO.setComponentId(safe(componentId));
        searchDTO.setFunctionId(safe(functionId));
        searchDTO.setApiId(safe(apiId));
        searchDTO.setActionCode(safe(actionCode));
        searchDTO.setTargetType(safe(targetType));
        searchDTO.setTargetId(safe(targetId));
        searchDTO.setTraceId(safe(traceId));
        searchDTO.setRequestUri(safe(requestUri));
        searchDTO.setRemoteAddr(safe(remoteAddr));
        searchDTO.setFromDate(safe(fromDate));
        searchDTO.setToDate(safe(toDate));
        searchDTO.setSearchKeyword(safe(searchKeyword));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pageIndex", pageIndex);
        response.put("pageSize", pageSize);
        response.put("totalCount", observabilityQueryService.selectUnifiedLogCount(searchDTO));
        response.put("items", observabilityQueryService.selectUnifiedLogList(searchDTO));
        return ResponseEntity.ok(response);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private int parsePositiveInt(String value, int defaultValue) {
        String normalized = safe(value);
        if (normalized.isEmpty()) {
            return defaultValue;
        }
        try {
            return Math.max(Integer.parseInt(normalized), 1);
        } catch (NumberFormatException ignored) {
            return defaultValue;
        }
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null && safe(request.getRequestURI()).startsWith("/en/admin")) {
            return true;
        }
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage());
    }

    private String forwardReactMigration(HttpServletRequest request, Locale locale, String route) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route);
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    private String forwardUnifiedLogPreset(HttpServletRequest request,
                                           Locale locale,
                                           String tab,
                                           String eventType,
                                           String actionCode,
                                           String pageId) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append("unified-log");
        builder.append("&tab=").append(safe(tab));
        if (!safe(eventType).isEmpty()) {
            builder.append("&eventType=").append(safe(eventType));
        }
        if (!safe(actionCode).isEmpty()) {
            builder.append("&actionCode=").append(safe(actionCode));
        }
        if (!safe(pageId).isEmpty()) {
            builder.append("&pageId=").append(safe(pageId));
        }
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    private void primeCsrfToken(HttpServletRequest request) {
        if (request == null) {
            return;
        }
        Object token = request.getAttribute("_csrf");
        if (token instanceof CsrfToken) {
            ((CsrfToken) token).getToken();
        }
    }

    private List<Map<String, Object>> enrichAuditItems(List<AuditEventRecordVO> items) {
        List<Map<String, Object>> enriched = new ArrayList<>();
        if (items == null) {
            return enriched;
        }
        for (AuditEventRecordVO item : items) {
            Map<String, Object> row = OBJECT_MAPPER.convertValue(item, MAP_TYPE);
            Map<String, Object> before = parseSnapshot(item.getBeforeSummaryJson());
            Map<String, Object> after = parseSnapshot(item.getAfterSummaryJson());
            List<Map<String, Object>> changedFields = buildChangedFields(before, after);
            List<String> addedFeatureCodes = buildAddedFeatureCodes(before, after);
            List<String> removedFeatureCodes = buildRemovedFeatureCodes(before, after);
            row.put("changedFields", changedFields);
            row.put("addedFeatureCodes", addedFeatureCodes);
            row.put("removedFeatureCodes", removedFeatureCodes);
            row.put("interpretedDiffSummary", buildInterpretedDiffSummary(changedFields, addedFeatureCodes, removedFeatureCodes));
            enriched.add(row);
        }
        return enriched;
    }

    private Map<String, Object> parseSnapshot(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new LinkedHashMap<>();
        }
        try {
            Map<String, Object> parsed = OBJECT_MAPPER.readValue(json, MAP_TYPE);
            return parsed == null ? new LinkedHashMap<>() : parsed;
        } catch (Exception ignored) {
            return new LinkedHashMap<>();
        }
    }

    private List<Map<String, Object>> buildChangedFields(Map<String, Object> before, Map<String, Object> after) {
        Set<String> keys = new LinkedHashSet<>();
        keys.addAll(before.keySet());
        keys.addAll(after.keySet());
        List<Map<String, Object>> changed = new ArrayList<>();
        for (String key : keys) {
            Object beforeValue = before.get(key);
            Object afterValue = after.get(key);
            if (Objects.equals(normalizeScalar(beforeValue), normalizeScalar(afterValue))) {
                continue;
            }
            if (isFeatureCollectionKey(key)) {
                continue;
            }
            Map<String, Object> field = new LinkedHashMap<>();
            field.put("field", key);
            field.put("before", normalizeScalar(beforeValue));
            field.put("after", normalizeScalar(afterValue));
            changed.add(field);
        }
        return changed;
    }

    private List<String> buildAddedFeatureCodes(Map<String, Object> before, Map<String, Object> after) {
        Set<String> beforeCodes = new LinkedHashSet<>(extractFeatureCodes(before));
        Set<String> afterCodes = new LinkedHashSet<>(extractFeatureCodes(after));
        List<String> added = new ArrayList<>();
        for (String code : afterCodes) {
            if (!beforeCodes.contains(code)) {
                added.add(code);
            }
        }
        return added;
    }

    private List<String> buildRemovedFeatureCodes(Map<String, Object> before, Map<String, Object> after) {
        Set<String> beforeCodes = new LinkedHashSet<>(extractFeatureCodes(before));
        Set<String> afterCodes = new LinkedHashSet<>(extractFeatureCodes(after));
        List<String> removed = new ArrayList<>();
        for (String code : beforeCodes) {
            if (!afterCodes.contains(code)) {
                removed.add(code);
            }
        }
        return removed;
    }

    private List<String> extractFeatureCodes(Object value) {
        List<String> result = new ArrayList<>();
        if (value == null) {
            return result;
        }
        if (value instanceof String) {
            String text = safe((String) value);
            if (!text.isEmpty() && (text.contains("_") || text.startsWith("ROLE_"))) {
                result.add(text);
            }
            return result;
        }
        if (value instanceof Collection<?>) {
            for (Object item : (Collection<?>) value) {
                result.addAll(extractFeatureCodes(item));
            }
            return result;
        }
        if (value instanceof Map<?, ?>) {
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet()) {
                String key = entry.getKey() == null ? "" : entry.getKey().toString();
                if (isFeatureCollectionKey(key)) {
                    result.addAll(extractFeatureCodes(entry.getValue()));
                }
            }
        }
        return result;
    }

    private boolean isFeatureCollectionKey(String key) {
        return "selectedFeatureCodes".equals(key)
                || "featureCodes".equals(key)
                || "features".equals(key)
                || "grantedFeatures".equals(key)
                || "mappedFeatures".equals(key);
    }

    private Object normalizeScalar(Object value) {
        if (value instanceof Map || value instanceof Collection) {
            return null;
        }
        return value == null ? "" : value;
    }

    private String buildInterpretedDiffSummary(List<Map<String, Object>> changedFields,
                                               List<String> addedFeatureCodes,
                                               List<String> removedFeatureCodes) {
        List<String> parts = new ArrayList<>();
        if (!changedFields.isEmpty()) {
            List<String> labels = new ArrayList<>();
            for (Map<String, Object> field : changedFields) {
                labels.add(String.valueOf(field.get("field")));
                if (labels.size() >= 3) {
                    break;
                }
            }
            parts.add("fields:" + String.join(",", labels) + (changedFields.size() > 3 ? "+" + (changedFields.size() - 3) : ""));
        }
        if (!addedFeatureCodes.isEmpty()) {
            parts.add("added:" + String.join(",", addedFeatureCodes.subList(0, Math.min(3, addedFeatureCodes.size()))) + (addedFeatureCodes.size() > 3 ? "+" + (addedFeatureCodes.size() - 3) : ""));
        }
        if (!removedFeatureCodes.isEmpty()) {
            parts.add("removed:" + String.join(",", removedFeatureCodes.subList(0, Math.min(3, removedFeatureCodes.size()))) + (removedFeatureCodes.size() > 3 ? "+" + (removedFeatureCodes.size() - 3) : ""));
        }
        return String.join(" / ", parts);
    }
}
