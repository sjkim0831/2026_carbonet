package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.security.AdminActionRateLimitService;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.trace.TraceEventSearchVO;
import egovframework.com.feature.admin.dto.request.AdminBackupConfigSaveRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupRunRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminBackupVersionRestoreRequestDTO;
import egovframework.com.feature.admin.dto.request.AdminUnifiedLogSearchRequestDTO;
import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.feature.auth.service.CurrentUserContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
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
    private static final int SENSITIVE_ACTION_RATE_LIMIT = 3;
    private static final long SENSITIVE_ACTION_WINDOW_SECONDS = 300L;
    private final ObservabilityQueryService observabilityQueryService;
    private final AdminObservabilityPageService adminObservabilityPageService;
    private final AdminShellBootstrapPageService adminShellBootstrapPageService;
    private final CurrentUserContextService currentUserContextService;
    private final AuditTrailService auditTrailService;
    private final AdminActionRateLimitService adminActionRateLimitService;

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
            @RequestParam(value = "actionStatus", required = false) String actionStatus,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityHistoryPagePayload(
                pageIndexParam,
                searchKeyword,
                userSe,
                insttId,
                actionStatus,
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

    @RequestMapping(value = "/system/notification", method = { RequestMethod.GET, RequestMethod.POST })
    public String notificationPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "notification");
    }

    @GetMapping("/system/notification/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> notificationPageApi(
            @RequestParam(value = "deliveryChannel", required = false) String deliveryChannel,
            @RequestParam(value = "deliveryStatus", required = false) String deliveryStatus,
            @RequestParam(value = "deliveryKeyword", required = false) String deliveryKeyword,
            @RequestParam(value = "deliveryPage", required = false) String deliveryPage,
            @RequestParam(value = "activityAction", required = false) String activityAction,
            @RequestParam(value = "activityKeyword", required = false) String activityKeyword,
            @RequestParam(value = "activityPage", required = false) String activityPage,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildNotificationPagePayload(
                isEnglishRequest(request, locale),
                deliveryChannel,
                deliveryStatus,
                deliveryKeyword,
                deliveryPage,
                activityAction,
                activityKeyword,
                activityPage));
    }

    @RequestMapping(value = "/system/performance", method = { RequestMethod.GET, RequestMethod.POST })
    public String performancePage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "performance");
    }

    @GetMapping("/system/performance/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> performancePageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildPerformancePagePayload(request, isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/external/connection_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalConnectionListPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-connection-list");
    }

    @RequestMapping(value = "/external/schema", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalSchemaPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-schema");
    }

    @RequestMapping(value = "/external/keys", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalKeysPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-keys");
    }

    @RequestMapping(value = "/external/usage", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalUsagePage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-usage");
    }

    @RequestMapping(value = "/external/logs", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalLogsPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-logs");
    }

    @RequestMapping(value = "/external/sync", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalSyncPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-sync");
    }

    @RequestMapping(value = "/external/monitoring", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalMonitoringPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-monitoring");
    }

    @RequestMapping(value = "/external/maintenance", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalMaintenancePage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-maintenance");
    }

    @RequestMapping(value = "/external/retry", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalRetryPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-retry");
    }

    @RequestMapping(value = "/external/webhooks", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalWebhooksPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-webhooks");
    }

    @GetMapping("/external/connection_list/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalConnectionListPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalConnectionListPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/schema/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalSchemaPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalSchemaPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/keys/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalKeysPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalKeysPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/usage/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalUsagePageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalUsagePagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/logs/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalLogsPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalLogsPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/sync/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalSyncPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalSyncPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/monitoring/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalMonitoringPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalMonitoringPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/maintenance/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalMaintenancePageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalMaintenancePagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/retry/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalRetryPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalRetryPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/webhooks/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalWebhooksPageApi(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "syncMode", required = false) String syncMode,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalWebhooksPagePayload(
                keyword,
                syncMode,
                status,
                isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/connection_add/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalConnectionAddPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalConnectionFormPagePayload("add", "", isEnglishRequest(request, locale)));
    }

    @GetMapping("/external/connection_edit/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalConnectionEditPageApi(
            @RequestParam(value = "connectionId", required = false) String connectionId,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildExternalConnectionFormPagePayload("edit", connectionId, isEnglishRequest(request, locale)));
    }

    @PostMapping("/external/connection/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> externalConnectionSaveApi(
            @RequestBody(required = false) Map<String, String> payload,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.saveExternalConnection(payload, isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/security-monitoring", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityMonitoringPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "security-monitoring");
    }

    @RequestMapping(value = "/monitoring/center", method = { RequestMethod.GET, RequestMethod.POST })
    public String operationsCenterPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "monitoring-center");
    }

    @RequestMapping(value = "/monitoring/sensor_add", method = { RequestMethod.GET, RequestMethod.POST })
    public String sensorAddPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "sensor-add");
    }

    @RequestMapping(value = "/monitoring/sensor_edit", method = { RequestMethod.GET, RequestMethod.POST })
    public String sensorEditPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "sensor-edit");
    }

    @RequestMapping(value = "/monitoring/sensor_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String sensorListPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "sensor-list");
    }

    @RequestMapping(value = "/external/connection_add", method = { RequestMethod.GET, RequestMethod.POST })
    public String externalConnectionAddPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "external-connection-add");
    }

    @GetMapping("/monitoring/center/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> operationsCenterPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildOperationsCenterPagePayload(request, isEnglishRequest(request, locale)));
    }

    @GetMapping("/monitoring/sensor_list/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sensorListPageApi(HttpServletRequest request, Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSensorListPagePayload(isEnglishRequest(request, locale)));
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
            @RequestParam(value = "source", required = false) String source,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBlocklistPagePayload(
                searchKeyword,
                blockType,
                status,
                source,
                isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/system/security-audit", method = { RequestMethod.GET, RequestMethod.POST })
    public String securityAuditPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "security-audit");
    }

    @GetMapping("/system/security-audit/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> securityAuditPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "actionType", required = false) String actionType,
            @RequestParam(value = "routeGroup", required = false) String routeGroup,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "sortKey", required = false) String sortKey,
            @RequestParam(value = "sortDirection", required = false) String sortDirection,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildSecurityAuditPagePayload(
                pageIndexParam,
                searchKeyword,
                actionType,
                routeGroup,
                startDate,
                endDate,
                sortKey,
                sortDirection,
                isEnglishRequest(request, locale)));
    }

    @RequestMapping(value = "/certificate/audit-log", method = { RequestMethod.GET, RequestMethod.POST })
    public String certificateAuditLogPage(HttpServletRequest request, Locale locale, Model model) {
        return forwardReactMigration(request, locale, "certificate-audit-log");
    }

    @GetMapping("/certificate/audit-log/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> certificateAuditLogPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "auditType", required = false) String auditType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "certificateType", required = false) String certificateType,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminShellBootstrapPageService.buildCertificateAuditLogPageData(
                pageIndexParam,
                searchKeyword,
                auditType,
                status,
                certificateType,
                startDate,
                endDate,
                isEnglishRequest(request, locale)));
    }

    @GetMapping("/system/security-audit/export.csv")
    @ResponseBody
    public ResponseEntity<String> securityAuditExportCsv(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "actionType", required = false) String actionType,
            @RequestParam(value = "routeGroup", required = false) String routeGroup,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "sortKey", required = false) String sortKey,
            @RequestParam(value = "sortDirection", required = false) String sortDirection,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        String filename = isEn ? "security-audit-export.csv" : "security-audit-내보내기.csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(adminObservabilityPageService.exportSecurityAuditCsv(
                        searchKeyword,
                        actionType,
                        routeGroup,
                        startDate,
                        endDate,
                        sortKey,
                        sortDirection,
                        isEn));
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

    @RequestMapping(value = "/system/batch", method = { RequestMethod.GET, RequestMethod.POST })
    public String batchPage(
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return forwardReactMigration(request, locale, "batch-management");
    }

    @GetMapping("/system/batch/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> batchPageApi(
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        return ResponseEntity.ok(adminObservabilityPageService.buildBatchManagementPagePayload(
                isEnglishRequest(request, locale)));
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
        Map<String, Object> payload = adminObservabilityPageService.saveBackupConfigPayload(requestBody, actorId, isEnglishRequest(request, locale));
        recordBackupAudit(request, currentUser, "BACKUP_CONFIG_SAVE", "BACKUP_CONFIG", "backup-config",
                safe(actorId), "SUCCESS", "backup_config",
                "{\"versionMemo\":\"" + safe(requestBody == null ? "" : requestBody.getVersionMemo()) + "\"}");
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/system/version/restore")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> restoreBackupConfigVersionApi(
            @RequestBody AdminBackupVersionRestoreRequestDTO requestBody,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        CurrentUserContextService.CurrentUserContext currentUser = currentUserContextService.resolve(request);
        ResponseEntity<Map<String, Object>> blocked = enforceSensitiveActionRateLimit(request, currentUser, "version-restore");
        if (blocked != null) {
            return blocked;
        }
        String actorId = safe(currentUser == null ? "" : currentUser.getUserId());
        Map<String, Object> payload = adminObservabilityPageService.restoreBackupConfigVersionPayload(requestBody, actorId, isEnglishRequest(request, locale));
        recordBackupAudit(request, currentUser, "BACKUP_VERSION_RESTORE", "BACKUP_CONFIG_VERSION", "version-management",
                safe(requestBody == null ? "" : requestBody.getVersionId()), "SUCCESS", "version",
                "{\"versionId\":\"" + safe(requestBody == null ? "" : requestBody.getVersionId()) + "\"}");
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/system/backup/run")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> runBackupPageApi(
            @RequestBody AdminBackupRunRequestDTO requestBody,
            HttpServletRequest request,
            Locale locale) {
        primeCsrfToken(request);
        boolean isEn = isEnglishRequest(request, locale);
        CurrentUserContextService.CurrentUserContext currentUser = currentUserContextService.resolve(request);
        ResponseEntity<Map<String, Object>> blocked = enforceSensitiveActionRateLimit(
                request,
                currentUser,
                resolveBackupRateLimitActionKey(requestBody),
                isEn);
        if (blocked != null) {
            return blocked;
        }
        String actorId = safe(currentUser == null ? "" : currentUser.getUserId());
        Map<String, Object> payload = adminObservabilityPageService.runBackupPayload(requestBody, actorId, isEn);
        recordBackupAudit(request, currentUser, "BACKUP_RUN", "BACKUP_EXECUTION", resolveBackupEntityType(requestBody),
                resolveBackupEntityId(requestBody), "SUCCESS", resolveBackupPageId(requestBody),
                "{\"executionType\":\"" + safe(requestBody == null ? "" : requestBody.getExecutionType()) + "\",\"dbRestoreType\":\""
                        + safe(requestBody == null ? "" : requestBody.getDbRestoreType()) + "\"}");
        return ResponseEntity.ok(payload);
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
        int pageSize = parsePositiveInt(pageSizeParam, 10);
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
        int pageSize = parsePositiveInt(pageSizeParam, 10);
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
        int pageSize = parsePositiveInt(pageSizeParam, 10);
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

    private ResponseEntity<Map<String, Object>> enforceSensitiveActionRateLimit(HttpServletRequest request,
                                                                                CurrentUserContextService.CurrentUserContext currentUser,
                                                                                String actionKey) {
        return enforceSensitiveActionRateLimit(request, currentUser, actionKey, false);
    }

    private ResponseEntity<Map<String, Object>> enforceSensitiveActionRateLimit(HttpServletRequest request,
                                                                                CurrentUserContextService.CurrentUserContext currentUser,
                                                                                String actionKey,
                                                                                boolean isEn) {
        String actorId = safe(currentUser == null ? "" : currentUser.getUserId());
        String remoteAddr = safe(request == null ? "" : request.getRemoteAddr());
        String scope = "admin-sensitive:" + actionKey + ":" + (actorId.isEmpty() ? remoteAddr : actorId);
        AdminActionRateLimitService.RateLimitDecision decision =
                adminActionRateLimitService.check(scope, SENSITIVE_ACTION_RATE_LIMIT, SENSITIVE_ACTION_WINDOW_SECONDS);
        if (decision.isAllowed()) {
            return null;
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "rate_limited");
        String message = isEn
                ? "Too many sensitive admin requests. Try again shortly."
                : "민감한 관리자 작업 요청이 너무 많습니다. 잠시 후 다시 시도하세요.";
        body.put("message", message);
        body.put("backupConfigMessage", message);
        body.put("retryAfterSeconds", decision.getRetryAfterSeconds());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(decision.getRetryAfterSeconds()))
                .body(body);
    }

    private String resolveBackupRateLimitActionKey(AdminBackupRunRequestDTO requestBody) {
        String executionType = safe(requestBody == null ? "" : requestBody.getExecutionType())
                .trim()
                .toUpperCase(Locale.ROOT);
        if (executionType.isEmpty()) {
            executionType = "UNKNOWN";
        }
        return "backup-run:" + executionType;
    }

    private void recordBackupAudit(HttpServletRequest request,
                                   CurrentUserContextService.CurrentUserContext currentUser,
                                   String actionCode,
                                   String entityType,
                                   String pageId,
                                   String entityId,
                                   String resultStatus,
                                   String menuCode,
                                   String afterSummaryJson) {
        if (currentUser == null) {
            return;
        }
        auditTrailService.record(
                safe(currentUser.getUserId()),
                safe(currentUser.getAuthorCode()),
                safe(menuCode),
                safe(pageId),
                safe(actionCode),
                safe(entityType),
                safe(entityId),
                safe(resultStatus),
                safe(actionCode),
                "",
                safe(afterSummaryJson),
                safe(request == null ? "" : request.getRemoteAddr()),
                safe(request == null ? "" : request.getHeader("User-Agent")));
    }

    private String resolveBackupEntityType(AdminBackupRunRequestDTO requestBody) {
        String executionType = safe(requestBody == null ? "" : requestBody.getExecutionType()).toUpperCase(Locale.ROOT);
        if (executionType.contains("RESTORE") || executionType.contains("PITR")) {
            return "BACKUP_RESTORE";
        }
        return "BACKUP_EXECUTION";
    }

    private String resolveBackupEntityId(AdminBackupRunRequestDTO requestBody) {
        if (requestBody == null) {
            return "";
        }
        if (!safe(requestBody.getGitRestoreCommit()).isEmpty()) {
            return safe(requestBody.getGitRestoreCommit());
        }
        if (!safe(requestBody.getDbRestoreTarget()).isEmpty()) {
            return safe(requestBody.getDbRestoreTarget());
        }
        return safe(requestBody.getExecutionType());
    }

    private String resolveBackupPageId(AdminBackupRunRequestDTO requestBody) {
        String executionType = safe(requestBody == null ? "" : requestBody.getExecutionType()).toUpperCase(Locale.ROOT);
        if (executionType.contains("RESTORE") || executionType.contains("PITR")) {
            return "restore-execution";
        }
        if (executionType.contains("VERSION")) {
            return "version-management";
        }
        return "backup-execution";
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
