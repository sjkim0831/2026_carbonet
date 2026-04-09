package egovframework.com.feature.admin.web;

import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.logging.RequestExecutionLogService;
import egovframework.com.common.logging.RequestExecutionLogPage;
import egovframework.com.common.logging.RequestExecutionLogVO;
import egovframework.com.common.trace.UiManifestRegistryPort;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.model.vo.ClassCodeVO;
import egovframework.com.feature.admin.model.vo.CommonCodeVO;
import egovframework.com.feature.admin.model.vo.DetailCodeVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureReferenceCountVO;
import egovframework.com.feature.admin.model.vo.MenuFeatureVO;
import egovframework.com.feature.admin.model.vo.PageManagementVO;
import egovframework.com.feature.admin.model.vo.UserAuthorityTargetVO;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.dto.response.SystemAccessHistoryRowResponse;
import egovframework.com.feature.admin.service.AdminIpWhitelistSupportService;
import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.IpWhitelistFirewallService;
import egovframework.com.feature.admin.service.MenuFeatureManageService;
import egovframework.com.feature.admin.service.MenuInfoCommandService;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import egovframework.com.feature.admin.service.WbsManagementService;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.domain.repository.EnterpriseMemberRepository;
import egovframework.com.feature.auth.service.CurrentUserContextService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.security.web.csrf.CsrfToken;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Consumer;
import egovframework.com.platform.read.FullStackGovernanceRegistryReadPort;
import egovframework.com.platform.read.MenuInfoReadPort;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class AdminSystemCodeController {

    private static final Logger log = LoggerFactory.getLogger(AdminSystemCodeController.class);
    private static final Map<String, String> PLATFORM_STUDIO_ROUTE_BY_SUFFIX = buildPlatformStudioRouteMap();
    private static final String ROLE_SYSTEM_MASTER = "ROLE_SYSTEM_MASTER";
    private static final String ROLE_SYSTEM_ADMIN = "ROLE_SYSTEM_ADMIN";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_OPERATION_ADMIN = "ROLE_OPERATION_ADMIN";
    private static final int ACCESS_HISTORY_PAGE_SIZE = 10;
    private static final int ACCESS_HISTORY_RECENT_LIMIT = 500;
    private static final DateTimeFormatter IP_WHITELIST_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final AdminCodeManageService adminCodeManageService;
    private final AdminIpWhitelistSupportService adminIpWhitelistSupportService;
    private final AdminShellBootstrapPageService adminShellBootstrapPageService;
    private final MenuInfoCommandService menuInfoCommandService;
    private final MenuInfoReadPort menuInfoReadPort;
    private final MenuFeatureManageService menuFeatureManageService;
    private final AuthGroupManageService authGroupManageService;
    private final AuditTrailService auditTrailService;
    private final UiManifestRegistryPort uiManifestRegistryPort;
    private final ScreenCommandCenterService screenCommandCenterService;
    private final FullStackGovernanceRegistryReadPort fullStackGovernanceRegistryReadPort;
    private final WbsManagementService wbsManagementService;
    private final RequestExecutionLogService requestExecutionLogService;
    private final EmployeeMemberRepository employeeMemberRepository;
    private final EnterpriseMemberRepository enterpriseMemberRepository;
    private final CurrentUserContextService currentUserContextService;
    private final AdminReactRouteSupport adminReactRouteSupport;
    private final ConcurrentMap<String, String> companyNameCache = new ConcurrentHashMap<>();
    private final ObjectProvider<IpWhitelistFirewallService> ipWhitelistFirewallServiceProvider;

    @RequestMapping(value = "/code", method = { RequestMethod.GET, RequestMethod.POST })
    public String system_codeManagement(
            @RequestParam(value = "detailCodeId", required = false) String detailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "system-code");
    }

    @GetMapping("/code/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> systemCodeManagementPageApi(
            @RequestParam(value = "detailCodeId", required = false) String detailCodeId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return buildPageDataResponse(request, model -> {
            populateCodeManagementPage(detailCodeId, isEn, model);
            applyQueryMessage(model, "codeMgmtMessage", request);
            applyQueryError(model, "codeMgmtError", request);
        });
    }

    @RequestMapping(value = "/page-management", method = RequestMethod.GET)
    public String pageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "searchUrl", required = false) String searchUrl,
            @RequestParam(value = "autoFeature", required = false) String autoFeature,
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "deleted", required = false) String deleted,
            @RequestParam(value = "deletedRoleRefs", required = false) String deletedRoleRefs,
            @RequestParam(value = "deletedUserOverrides", required = false) String deletedUserOverrides,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "page-management");
    }

    @GetMapping("/page-management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> pageManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "searchUrl", required = false) String searchUrl,
            @RequestParam(value = "autoFeature", required = false) String autoFeature,
            @RequestParam(value = "updated", required = false) String updated,
            @RequestParam(value = "deleted", required = false) String deleted,
            @RequestParam(value = "deletedRoleRefs", required = false) String deletedRoleRefs,
            @RequestParam(value = "deletedUserOverrides", required = false) String deletedUserOverrides,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        return buildPageDataResponse(request, model -> {
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            applyPageManagementMessage(model, isEn, autoFeature, updated, deleted, deletedRoleRefs, deletedUserOverrides);
            applyQueryError(model, "pageMgmtError", request);
        });
    }

    @RequestMapping(value = "/ip_whitelist", method = RequestMethod.GET)
    public String ipWhitelist(
            @RequestParam(value = "searchIp", required = false) String searchIp,
            @RequestParam(value = "accessScope", required = false) String accessScope,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "ip-whitelist");
    }

    @GetMapping("/ip_whitelist/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> ipWhitelistPageApi(
            @RequestParam(value = "searchIp", required = false) String searchIp,
            @RequestParam(value = "accessScope", required = false) String accessScope,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return buildPageDataResponse(request, model -> model.addAllAttributes(
                adminIpWhitelistSupportService.buildPageData(isEn, searchIp, accessScope, status)));
    }

    @PostMapping("/ip-whitelist/request")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createIpWhitelistRequest(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String applicationName = normalizeIpWhitelistApplicationName(safeString(payload == null ? null : payload.get("applicationName")));
        String ipAddress = safeString(payload == null ? null : payload.get("ipAddress"));
        String port = safeString(payload == null ? null : payload.get("port"));
        String firewallAction = normalizeIpWhitelistFirewallAction(safeString(payload == null ? null : payload.get("openFirewall")));
        String accessScope = normalizeIpWhitelistScope(safeString(payload == null ? null : payload.get("accessScope")));
        String reason = safeString(payload == null ? null : payload.get("reason"));
        String requester = safeString(payload == null ? null : payload.get("requester"));
        String expiresAt = safeString(payload == null ? null : payload.get("expiresAt"));
        String memo = safeString(payload == null ? null : payload.get("memo"));
        Map<String, Object> response = new LinkedHashMap<>();

        if (ipAddress.isEmpty() || port.isEmpty() || reason.isEmpty() || requester.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn
                    ? "Enter app, IP, port, reason, and requester before submitting."
                    : "앱, IP, 포트, 요청 사유, 요청자를 입력한 뒤 등록하세요.");
            return ResponseEntity.badRequest().body(response);
        }

        String requestId = "REQ-" + System.currentTimeMillis();
        String ruleId = "WL-DRAFT-" + String.valueOf(System.currentTimeMillis()).substring(7);
        String nowLabel = formatIpWhitelistTimestamp(LocalDateTime.now());
        String actorId = resolveActorId(request);
        String requestReason = buildIpWhitelistExecutionReason(applicationName, port, firewallAction, reason, isEn);
        String executionMemo = buildIpWhitelistExecutionMemo(applicationName, port, firewallAction, memo, expiresAt, isEn);
        String executionFeedback = buildIpWhitelistExecutionFeedback(applicationName, ipAddress, port, firewallAction, false, isEn);

        Map<String, String> requestRow = ipWhitelistRequestRow(
                requestId,
                ipAddress,
                accessScope,
                requestReason,
                "검토중",
                nowLabel,
                requester,
                buildIpWhitelistExecutionReason(applicationName, port, firewallAction, reason, true),
                "Pending Approval",
                requester);
        requestRow.put("ruleId", ruleId);
        requestRow.put("expiresAt", expiresAt);
        requestRow.put("memo", executionMemo);
        requestRow.put("memoEn", buildIpWhitelistExecutionMemo(applicationName, port, firewallAction, memo, expiresAt, true));
        requestRow.put("reviewNote", "");
        requestRow.put("reviewedAt", "");
        requestRow.put("reviewedBy", "");
        requestRow.put("reviewedByEn", "");
        adminIpWhitelistSupportService.saveIpWhitelistRequestRow(requestRow);

        Map<String, String> ruleRow = ipWhitelistRow(
                ruleId,
                ipAddress,
                accessScope,
                requestReason,
                requester,
                "PENDING",
                nowLabel,
                executionMemo,
                buildIpWhitelistExecutionReason(applicationName, port, firewallAction, reason, true),
                requester,
                buildIpWhitelistExecutionMemo(applicationName, port, firewallAction, memo, expiresAt, true));
        ruleRow.put("requestId", requestId);
        ruleRow.put("expiresAt", expiresAt);
        adminIpWhitelistSupportService.saveIpWhitelistRuleRow(ruleRow);

        auditTrailService.record(
                actorId,
                resolveActorRole(request),
                "ip-whitelist",
                "admin-system",
                "IP_WHITELIST_REQUEST_CREATE",
                "IP_WHITELIST_REQUEST",
                requestId,
                "SUCCESS",
                "IP whitelist request created",
                "",
                safeJson(String.valueOf(requestRow)),
                resolveRequestIp(request),
                request == null ? "" : safeString(request.getHeader("User-Agent"))
        );

        response.put("success", true);
        response.put("message", isEn
                ? "Temporary allowlist request has been queued for review."
                : "임시 허용 요청을 검토 대기열에 등록했습니다.");
        response.put("requestId", requestId);
        response.put("ruleId", ruleId);
        response.put("executionFeedback", executionFeedback);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ip-whitelist/request-decision")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> decideIpWhitelistRequest(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String requestId = safeString(payload == null ? null : payload.get("requestId"));
        String decision = safeString(payload == null ? null : payload.get("decision")).toUpperCase(Locale.ROOT);
        String reviewNote = safeString(payload == null ? null : payload.get("reviewNote"));
        Map<String, Object> response = new LinkedHashMap<>();

        if (requestId.isEmpty() || (!"APPROVE".equals(decision) && !"REJECT".equals(decision))) {
            response.put("success", false);
            response.put("message", isEn ? "Select a valid request and decision." : "유효한 요청과 처리 결과를 선택하세요.");
            return ResponseEntity.badRequest().body(response);
        }

        Map<String, String> existingRequest = adminIpWhitelistSupportService.findIpWhitelistRequestById(requestId);
        if (existingRequest == null) {
            response.put("success", false);
            response.put("message", isEn ? "Request was not found." : "승인 요청을 찾지 못했습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        Map<String, String> updatedRequest = new LinkedHashMap<>(existingRequest);
        String reviewedAt = formatIpWhitelistTimestamp(LocalDateTime.now());
        String reviewedBy = resolveActorId(request).isEmpty()
                ? (isEn ? "Security Operator" : "보안 운영자")
                : resolveActorId(request);
        String applicationName = extractIpWhitelistApplicationName(updatedRequest);
        String port = extractIpWhitelistPort(updatedRequest);
        String firewallAction = extractIpWhitelistFirewallAction(updatedRequest);
        String firewallFeedback = "";
        updatedRequest.put("approvalStatus", "APPROVE".equals(decision) ? "승인완료" : "반려");
        updatedRequest.put("approvalStatusEn", "APPROVE".equals(decision) ? "Approved" : "Rejected");
        updatedRequest.put("reviewNote", reviewNote);
        updatedRequest.put("reviewedAt", reviewedAt);
        updatedRequest.put("reviewedBy", reviewedBy);
        updatedRequest.put("reviewedByEn", reviewedBy);
        adminIpWhitelistSupportService.saveIpWhitelistRequestRow(updatedRequest);

        String ruleId = safeString(updatedRequest.get("ruleId"));
        Map<String, String> currentRule = adminIpWhitelistSupportService.findIpWhitelistRuleById(ruleId);
        if (currentRule == null && "APPROVE".equals(decision)) {
            currentRule = ipWhitelistRow(
                    ruleId.isEmpty() ? "WL-" + requestId.replaceAll("[^0-9A-Z]", "") : ruleId,
                    safeString(updatedRequest.get("ipAddress")),
                    safeString(updatedRequest.get("accessScope")),
                    safeString(updatedRequest.get("reason")),
                    reviewedBy,
                    "ACTIVE",
                    reviewedAt,
                    reviewNote.isEmpty() ? "승인 처리 후 반영" : reviewNote,
                    safeString(updatedRequest.get("reasonEn")),
                    reviewedBy,
                    reviewNote.isEmpty() ? "Applied after approval" : reviewNote);
        }
        if (currentRule != null) {
            Map<String, String> updatedRule = new LinkedHashMap<>(currentRule);
            updatedRule.put("status", "APPROVE".equals(decision) ? "ACTIVE" : "INACTIVE");
            updatedRule.put("updatedAt", reviewedAt);
            updatedRule.put("owner", reviewedBy);
            updatedRule.put("ownerEn", reviewedBy);
            if ("APPROVE".equals(decision) && "OPEN".equals(firewallAction)) {
                firewallFeedback = executeIpWhitelistFirewall(applicationName, safeString(updatedRequest.get("ipAddress")), port, isEn);
            } else if ("APPROVE".equals(decision)) {
                firewallFeedback = isEn
                        ? "Firewall action skipped: request was approved with keep-closed option."
                        : "방화벽 처리 생략: 방화벽 미개방 옵션으로 승인되었습니다.";
            } else {
                firewallFeedback = isEn
                        ? "Firewall action skipped: request was rejected."
                        : "방화벽 처리 생략: 요청이 반려되었습니다.";
            }
            if (!reviewNote.isEmpty()) {
                updatedRule.put("memo", reviewNote + " | " + firewallFeedback);
                updatedRule.put("memoEn", reviewNote + " | " + firewallFeedback);
            } else if (!firewallFeedback.isEmpty()) {
                String existingMemo = safeString(updatedRule.get("memo"));
                String existingMemoEn = safeString(updatedRule.get("memoEn"));
                updatedRule.put("memo", existingMemo + (existingMemo.isEmpty() ? "" : " | ") + firewallFeedback);
                updatedRule.put("memoEn", existingMemoEn + (existingMemoEn.isEmpty() ? "" : " | ") + firewallFeedback);
            }
            updatedRule.put("requestId", requestId);
            adminIpWhitelistSupportService.saveIpWhitelistRuleRow(updatedRule);
        }

        auditTrailService.record(
                resolveActorId(request),
                resolveActorRole(request),
                "ip-whitelist",
                "admin-system",
                "IP_WHITELIST_REQUEST_DECISION",
                "IP_WHITELIST_REQUEST",
                requestId,
                "SUCCESS",
                "IP whitelist request " + decision,
                safeJson(String.valueOf(existingRequest)),
                safeJson(String.valueOf(updatedRequest)),
                resolveRequestIp(request),
                request == null ? "" : safeString(request.getHeader("User-Agent"))
        );

        response.put("success", true);
        response.put("message", "APPROVE".equals(decision)
                ? (isEn ? "The request was approved and the allowlist was updated." : "요청을 승인하고 화이트리스트에 반영했습니다.")
                : (isEn ? "The request was rejected and the review history was saved." : "요청을 반려했고 검토 이력을 저장했습니다."));
        response.put("requestId", requestId);
        response.put("executionFeedback", buildIpWhitelistDecisionFeedback(updatedRequest, decision, reviewNote, firewallFeedback, isEn));
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/access_history/legacy", method = RequestMethod.GET)
    public String legacyAccessHistory(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "access-history");
    }

    @GetMapping("/access_history/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> accessHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "insttId", required = false) String insttId,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return buildPageDataResponse(request,
                model -> populateAccessHistoryModel(model, isEn, pageIndexParam, searchKeyword, insttId, request));
    }

    @RequestMapping(value = {"/function-management", "/feature-management"}, method = RequestMethod.GET)
    public String functionManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchMenuCode", required = false) String searchMenuCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "function-management");
    }

    @GetMapping({"/function-management/page-data", "/feature-management/page-data"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> functionManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchMenuCode", required = false) String searchMenuCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        return buildPageDataResponse(request, model -> {
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword);
            applyQueryError(model, "featureMgmtError", request);
        });
    }

    @RequestMapping(value = "/menu-management", method = RequestMethod.GET)
    public String menuManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "menu-management");
    }

    @GetMapping("/menu-management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> menuManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        return buildPageDataResponse(request, model -> {
            populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
            applyMenuManagementMessage(model, isEn, saved, false);
            applyQueryError(model, "menuMgmtError", request);
        });
    }

    @RequestMapping(value = "/full-stack-management", method = RequestMethod.GET)
    public String fullStackManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        return redirectReactMigration(request, locale, "full-stack-management");
    }

    @RequestMapping(value = "/infra", method = RequestMethod.GET)
    public String infraManagement(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "infra");
    }

    @RequestMapping(value = "/environment-management", method = RequestMethod.GET)
    public String environmentManagement(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "environment-management");
    }

    @RequestMapping(value = "/wbs-management", method = RequestMethod.GET)
    public String wbsManagement(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "wbs-management");
    }

    @RequestMapping(value = "/new-page", method = RequestMethod.GET)
    public String newPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "new-page");
    }

    @GetMapping("/new-page/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> newPagePageApi(
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return buildPageDataResponse(request, model -> model.addAllAttributes(adminShellBootstrapPageService.buildNewPagePageData(isEn)));
    }

    @GetMapping("/wbs-management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> wbsManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            HttpServletRequest request,
            Locale locale) {
        String normalizedMenuType = normalizeMenuType(menuType);
        return buildPageDataResponse(request, model -> model.addAllAttributes(wbsManagementService.buildPagePayload(normalizedMenuType)));
    }

    @RequestMapping(value = {
            "/platform-studio",
            "/screen-elements-management",
            "/event-management-console",
            "/function-management-console",
            "/api-management-console",
            "/controller-management-console",
            "/db-table-management",
            "/column-management-console",
            "/automation-studio"
    }, method = RequestMethod.GET)
    public String platformStudioPages(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, resolvePlatformStudioRoute(request));
    }

    @GetMapping("/full-stack-management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> fullStackManagementPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        return buildPageDataResponse(request, model -> {
            populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
            model.addAttribute("fullStackSummaryRows", buildFullStackSummaryRows(codeId));
            applyMenuManagementMessage(model, isEn, saved, true);
            applyQueryError(model, "menuMgmtError", request);
        });
    }

    @PostMapping("/full-stack-management/menu-visibility")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateFullStackMenuVisibility(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedUseAt = normalizeUseAt(useAt);
        Map<String, Object> response = new LinkedHashMap<>();

        if (normalizedMenuCode.length() != 8) {
            response.put("success", false);
            response.put("message", isEn ? "Select a valid 8-digit page menu." : "유효한 8자리 페이지 메뉴를 선택하세요.");
            return ResponseEntity.badRequest().body(response);
        }

        MenuInfoDTO currentRow = loadMenuTreeRows(codeId).stream()
                .filter(item -> normalizedMenuCode.equalsIgnoreCase(safeString(item.getCode())))
                .findFirst()
                .orElse(null);
        if (currentRow == null) {
            response.put("success", false);
            response.put("message", isEn ? "Menu code was not found in the selected scope." : "선택한 범위에서 메뉴 코드를 찾지 못했습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            adminCodeManageService.updatePageManagement(
                    normalizedMenuCode,
                    safeString(currentRow.getCodeNm()),
                    safeString(currentRow.getCodeDc()),
                    safeString(currentRow.getMenuUrl()),
                    safeString(currentRow.getMenuIcon()),
                    normalizedUseAt,
                    resolveActorId(request));
            syncDefaultViewFeatureMetadata(normalizedMenuCode, normalizedUseAt, normalizedMenuType);
            recordMenuManagementAudit(
                    request,
                    normalizedMenuCode,
                    "ADMIN-FULL-STACK-MENU-VISIBILITY",
                    normalizedMenuCode,
                    "{\"beforeUseAt\":\"" + safeJson(currentRow.getUseAt()) + "\"}",
                    "{\"afterUseAt\":\"" + safeJson(normalizedUseAt) + "\"}");
        } catch (Exception e) {
            log.error("Failed to update full-stack menu visibility. menuCode={}, useAt={}", normalizedMenuCode, normalizedUseAt, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to update menu visibility." : "메뉴 표시 상태 변경에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("message", "Y".equalsIgnoreCase(normalizedUseAt)
                ? (isEn ? "The menu is now visible." : "메뉴를 다시 보이도록 변경했습니다.")
                : (isEn ? "The menu is now hidden." : "메뉴를 숨김 처리했습니다."));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/menu-management/order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveMenuManagementOrder(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        List<MenuInfoDTO> menuRows = loadMenuTreeRows(codeId);
        Map<String, Object> response = new LinkedHashMap<>();
        String error = validateMenuOrderPayload(normalizedMenuType, orderPayload, menuRows, isEn);
        if (!error.isEmpty()) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            for (String token : safeString(orderPayload).split(",")) {
                String[] parts = token.split(":");
                if (parts.length != 2) {
                    continue;
                }
                String code = safeString(parts[0]).toUpperCase(Locale.ROOT);
                int sortOrdr = Integer.parseInt(safeString(parts[1]));
                menuInfoCommandService.saveMenuOrder(code, sortOrdr);
            }
            recordMenuManagementAudit(
                    request,
                    normalizedMenuType,
                    "ADMIN-MENU-MANAGEMENT-ORDER-SAVE",
                    normalizedMenuType,
                    "{\"menuType\":\"" + safeJson(normalizedMenuType) + "\"}",
                    "{\"orderPayload\":\"" + safeJson(orderPayload) + "\"}");
        } catch (Exception e) {
            log.error("Failed to save menu order. menuType={}, payload={}", normalizedMenuType, orderPayload, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to save menu order." : "메뉴 순서 저장에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("message", isEn ? "Menu order has been saved." : "메뉴 순서를 저장했습니다.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/menu-management/create-page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createMenuManagedPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "parentCode", required = false) String parentCode,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedParentCode = safeString(parentCode).toUpperCase(Locale.ROOT);
        String normalizedName = safeString(codeNm);
        String normalizedNameEn = safeString(codeDc);
        String normalizedUrl = canonicalMenuUrl(menuUrl);
        String normalizedIcon = safeString(menuIcon);
        String normalizedUseAt = normalizeUseAt(useAt);

        Map<String, Object> response = new LinkedHashMap<>();
        String validationError = validateMenuManagedPageInput(
                normalizedMenuType,
                codeId,
                normalizedParentCode,
                normalizedName,
                normalizedNameEn,
                normalizedUrl,
                isEn);
        if (!validationError.isEmpty()) {
            response.put("success", false);
            response.put("message", validationError);
            return ResponseEntity.badRequest().body(response);
        }

        String nextPageCode = resolveNextPageCode(codeId, normalizedParentCode);
        if (nextPageCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn
                    ? "No more page codes are available under the selected group."
                    : "선택한 그룹 메뉴 아래에서 더 이상 사용할 페이지 코드를 만들 수 없습니다.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String actorId = resolveActorId(request);
            adminCodeManageService.insertPageManagement(
                    codeId,
                    nextPageCode,
                    normalizedName,
                    normalizedNameEn,
                    normalizedUrl,
                    normalizedIcon,
                    normalizedUseAt,
                    actorId.isEmpty() ? "admin" : actorId);
            ensureDefaultViewFeature(nextPageCode, normalizedName, normalizedNameEn, normalizedUseAt);
            menuInfoCommandService.saveMenuOrder(nextPageCode, resolveNextSiblingSortOrder(codeId, normalizedParentCode));
            String draftPageId = buildManagedDraftPageId(normalizedUrl, nextPageCode);
            Map<String, Object> draftRegistry = uiManifestRegistryPort.ensureManagedPageDraft(
                    draftPageId,
                    normalizedName,
                    normalizedUrl,
                    nextPageCode,
                    "USER".equals(normalizedMenuType) ? "home" : "admin");
            recordMenuManagementAudit(
                    request,
                    nextPageCode,
                    "ADMIN-MENU-MANAGEMENT-CREATE-PAGE",
                    nextPageCode,
                    "",
                    "{\"menuType\":\"" + safeJson(normalizedMenuType)
                            + "\",\"parentCode\":\"" + safeJson(normalizedParentCode)
                            + "\",\"pageCode\":\"" + safeJson(nextPageCode)
                            + "\",\"menuUrl\":\"" + safeJson(normalizedUrl)
                            + "\"}");
            response.put("draftPageId", draftPageId);
            response.put("manifestRegistry", draftRegistry);
        } catch (Exception e) {
            log.error("Failed to create menu managed page. menuType={}, parentCode={}, menuUrl={}",
                    normalizedMenuType, normalizedParentCode, normalizedUrl, e);
            response.put("success", false);
            response.put("message", isEn
                    ? "Failed to create the page from menu management."
                    : "메뉴 관리에서 페이지를 생성하지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("createdCode", nextPageCode);
        response.put("message", isEn
                ? "The page, menu metadata, and default VIEW feature have been created."
                : "페이지와 메뉴 메타데이터, 기본 VIEW 기능을 함께 생성했습니다.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/environment-management/page/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEnvironmentManagedPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        String normalizedName = safeString(codeNm);
        String normalizedNameEn = safeString(codeDc);
        String normalizedUrl = canonicalMenuUrl(menuUrl);
        String normalizedIcon = safeString(menuIcon);
        String normalizedUseAt = normalizeUseAt(useAt);

        Map<String, Object> response = new LinkedHashMap<>();
        String error = validateEnvironmentManagedPageUpdateInput(
                normalizedCode,
                normalizedName,
                normalizedNameEn,
                normalizedUrl,
                normalizedMenuType,
                codeId,
                isEn);
        if (!error.isEmpty()) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String actorId = resolveActorId(request);
            adminCodeManageService.updatePageManagement(
                    normalizedCode,
                    normalizedName,
                    normalizedNameEn,
                    normalizedUrl,
                    normalizedIcon,
                    normalizedUseAt,
                    actorId.isEmpty() ? "admin" : actorId);
            syncDefaultViewFeatureMetadata(normalizedCode, normalizedUseAt, normalizedMenuType);
        } catch (Exception e) {
            log.error("Failed to update environment managed page. code={}", normalizedCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to update the selected menu." : "선택한 메뉴를 수정하지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("code", normalizedCode);
        response.put("message", isEn ? "The selected menu has been updated." : "선택한 메뉴를 수정했습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/environment-management/page-impact")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> environmentManagedPageImpactApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        Map<String, Object> response = new LinkedHashMap<>();

        String error = validateEnvironmentManagedPageDeleteTarget(normalizedCode, codeId, isEn);
        if (!error.isEmpty()) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String defaultViewFeatureCode = buildDefaultViewFeatureCode(normalizedCode);
            List<String> linkedFeatureCodes = authGroupManageService.selectFeatureCodesByMenuCode(normalizedCode);
            List<String> nonDefaultFeatureCodes = new ArrayList<>();
            for (String featureCode : linkedFeatureCodes) {
                String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                if (!normalizedFeatureCode.isEmpty() && !normalizedFeatureCode.equals(defaultViewFeatureCode)) {
                    nonDefaultFeatureCodes.add(normalizedFeatureCode);
                }
            }
            response.put("success", true);
            response.put("code", normalizedCode);
            response.put("defaultViewFeatureCode", defaultViewFeatureCode);
            response.put("linkedFeatureCodes", linkedFeatureCodes);
            response.put("nonDefaultFeatureCodes", nonDefaultFeatureCodes);
            response.put("defaultViewRoleRefCount", authGroupManageService.countAuthorFeatureRelationsByFeatureCode(defaultViewFeatureCode));
            response.put("defaultViewUserOverrideCount", authGroupManageService.countUserFeatureOverridesByFeatureCode(defaultViewFeatureCode));
            response.put("blocked", !nonDefaultFeatureCodes.isEmpty());
        } catch (Exception e) {
            log.error("Failed to load environment managed page impact. code={}", normalizedCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to load page delete impact." : "페이지 삭제 영향도를 불러오지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/environment-management/page/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteEnvironmentManagedPageApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        Map<String, Object> response = new LinkedHashMap<>();

        String error = validateEnvironmentManagedPageDeleteTarget(normalizedCode, codeId, isEn);
        if (!error.isEmpty()) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        int defaultViewRoleRefCount = 0;
        int defaultViewUserOverrideCount = 0;
        try {
            List<String> linkedFeatureCodes = authGroupManageService.selectFeatureCodesByMenuCode(normalizedCode);
            String defaultViewFeatureCode = buildDefaultViewFeatureCode(normalizedCode);
            defaultViewRoleRefCount = authGroupManageService.countAuthorFeatureRelationsByFeatureCode(defaultViewFeatureCode);
            defaultViewUserOverrideCount = authGroupManageService.countUserFeatureOverridesByFeatureCode(defaultViewFeatureCode);
            List<String> nonDefaultFeatureCodes = new ArrayList<>();
            for (String featureCode : linkedFeatureCodes) {
                String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                if (!normalizedFeatureCode.isEmpty() && !normalizedFeatureCode.equals(defaultViewFeatureCode)) {
                    nonDefaultFeatureCodes.add(normalizedFeatureCode);
                }
            }
            if (!nonDefaultFeatureCodes.isEmpty()) {
                response.put("success", false);
                response.put("message", isEn
                        ? "Delete the page-specific action features first."
                        : "페이지 전용 액션 기능을 먼저 삭제해 주세요.");
                response.put("nonDefaultFeatureCodes", nonDefaultFeatureCodes);
                response.put("defaultViewRoleRefCount", defaultViewRoleRefCount);
                response.put("defaultViewUserOverrideCount", defaultViewUserOverrideCount);
                return ResponseEntity.badRequest().body(response);
            }
            if (linkedFeatureCodes.stream().anyMatch(featureCode -> defaultViewFeatureCode.equalsIgnoreCase(safeString(featureCode)))) {
                deleteFeatureWithAssignments(defaultViewFeatureCode);
            }
            adminCodeManageService.deletePageManagement(codeId, normalizedCode);
        } catch (Exception e) {
            log.error("Failed to delete environment managed page. code={}", normalizedCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to delete the selected page menu." : "선택한 페이지 메뉴 삭제에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("code", normalizedCode);
        response.put("defaultViewRoleRefCount", defaultViewRoleRefCount);
        response.put("defaultViewUserOverrideCount", defaultViewUserOverrideCount);
        response.put("message", isEn
                ? "The page menu and default VIEW permission have been deleted."
                : "페이지 메뉴와 기본 VIEW 권한을 삭제했습니다.");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/feature-management/create", method = RequestMethod.POST)
    public String createFeatureManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "featureCode", required = false) String featureCode,
            @RequestParam(value = "featureNm", required = false) String featureNm,
            @RequestParam(value = "featureNmEn", required = false) String featureNmEn,
            @RequestParam(value = "featureDc", required = false) String featureDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureNm = safeString(featureNm);
        String normalizedFeatureNmEn = safeString(featureNmEn);
        String normalizedFeatureDc = safeString(featureDc);
        String normalizedUseAt = normalizeUseAt(useAt);

        String error = validateFeatureManagementInput(normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedMenuType, isEn);
        if (!error.isEmpty()) {
            return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null, error);
        }

        try {
            if (menuFeatureManageService.countFeatureCode(normalizedFeatureCode) > 0) {
                return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null,
                        isEn ? "The feature code already exists." : "이미 등록된 기능 코드입니다.");
            }
            menuFeatureManageService.insertMenuFeature(normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedFeatureDc, normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to create feature management. featureCode={}", normalizedFeatureCode, e);
            return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null,
                    isEn ? "Failed to register the feature." : "기능 등록에 실패했습니다.");
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/feature-management?menuType=" + normalizedMenuType + "&searchMenuCode=" + urlEncode(normalizedMenuCode);
    }

    @PostMapping("/environment-management/feature/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateEnvironmentFeatureApi(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "featureCode", required = false) String featureCode,
            @RequestParam(value = "featureNm", required = false) String featureNm,
            @RequestParam(value = "featureNmEn", required = false) String featureNmEn,
            @RequestParam(value = "featureDc", required = false) String featureDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureNm = safeString(featureNm);
        String normalizedFeatureNmEn = safeString(featureNmEn);
        String normalizedFeatureDc = safeString(featureDc);
        String normalizedUseAt = normalizeUseAt(useAt);

        Map<String, Object> response = new LinkedHashMap<>();
        String error = validateFeatureManagementInput(
                normalizedMenuCode,
                normalizedFeatureCode,
                normalizedFeatureNm,
                normalizedFeatureNmEn,
                normalizedMenuType,
                isEn);
        if (!error.isEmpty()) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            if (menuFeatureManageService.countFeatureCode(normalizedFeatureCode) == 0) {
                response.put("success", false);
                response.put("message", isEn ? "The feature code does not exist." : "등록된 기능 코드를 찾지 못했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            menuFeatureManageService.updateMenuFeatureMetadata(
                    normalizedFeatureCode,
                    normalizedFeatureNm,
                    normalizedFeatureNmEn,
                    normalizedFeatureDc,
                    normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to update environment feature. featureCode={}", normalizedFeatureCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to update the feature." : "기능을 수정하지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }

        response.put("success", true);
        response.put("featureCode", normalizedFeatureCode);
        response.put("message", isEn ? "The feature has been updated." : "기능을 수정했습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/environment-management/feature-impact")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> environmentFeatureImpactApi(
            @RequestParam(value = "featureCode", required = false) String featureCode,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        Map<String, Object> response = new LinkedHashMap<>();
        if (normalizedFeatureCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Feature code is required." : "기능 코드를 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            response.put("success", true);
            response.put("featureCode", normalizedFeatureCode);
            response.put("assignedRoleCount", authGroupManageService.countAuthorFeatureRelationsByFeatureCode(normalizedFeatureCode));
            response.put("userOverrideCount", authGroupManageService.countUserFeatureOverridesByFeatureCode(normalizedFeatureCode));
        } catch (Exception e) {
            log.error("Failed to load feature impact. featureCode={}", normalizedFeatureCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to load feature impact." : "기능 영향도를 불러오지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/feature-management/delete", method = RequestMethod.POST)
    public String deleteFeatureManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "featureCode", required = false) String featureCode,
            @RequestParam(value = "searchMenuCode", required = false) String searchMenuCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);

        if (normalizedFeatureCode.isEmpty()) {
            return redirectFunctionManagementError(request, locale, normalizedMenuType, searchMenuCode, searchKeyword,
                    isEn ? "Feature code is required." : "기능 코드를 확인해 주세요.");
        }

        try {
            deleteFeatureWithAssignments(normalizedFeatureCode);
        } catch (Exception e) {
            log.error("Failed to delete feature management. featureCode={}", normalizedFeatureCode, e);
            return redirectFunctionManagementError(request, locale, normalizedMenuType, searchMenuCode, searchKeyword,
                    isEn ? "Failed to delete the feature." : "기능 삭제에 실패했습니다.");
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/feature-management?menuType=" + normalizedMenuType + "&searchMenuCode=" + urlEncode(searchMenuCode) + "&searchKeyword=" + urlEncode(searchKeyword);
    }

    @PostMapping("/environment-management/feature/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteEnvironmentFeatureApi(
            @RequestParam(value = "featureCode", required = false) String featureCode,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        Map<String, Object> response = new LinkedHashMap<>();

        if (normalizedFeatureCode.isEmpty()) {
            response.put("success", false);
            response.put("message", isEn ? "Feature code is required." : "기능 코드를 확인해 주세요.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            int assignedRoleCount = authGroupManageService.countAuthorFeatureRelationsByFeatureCode(normalizedFeatureCode);
            int userOverrideCount = authGroupManageService.countUserFeatureOverridesByFeatureCode(normalizedFeatureCode);
            deleteFeatureWithAssignments(normalizedFeatureCode);
            response.put("success", true);
            response.put("featureCode", normalizedFeatureCode);
            response.put("assignedRoleCount", assignedRoleCount);
            response.put("userOverrideCount", userOverrideCount);
            response.put("message", isEn
                    ? "The feature and linked permissions have been deleted."
                    : "기능과 연결된 권한 정보를 함께 삭제했습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete environment feature. featureCode={}", normalizedFeatureCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to delete the feature." : "기능 삭제에 실패했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String resolveMenuCodeId(String menuType) {
        return "USER".equals(menuType) ? "HMENU1" : "AMENU1";
    }

    private String normalizeMenuType(String menuType) {
        return "USER".equalsIgnoreCase(safeString(menuType)) ? "USER" : "ADMIN";
    }

    @RequestMapping(value = "/page-management/create", method = RequestMethod.POST)
    public String createPageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "domainCode", required = false) String domainCode,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        String normalizedName = safeString(codeNm);
        String normalizedNameEn = safeString(codeDc);
        String normalizedUrl = canonicalMenuUrl(menuUrl);
        String normalizedIcon = safeString(menuIcon);
        String normalizedDomainCode = safeString(domainCode).toUpperCase(Locale.ROOT);
        String normalizedUseAt = normalizeUseAt(useAt);

        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        String error = validatePageManagementInput(normalizedCode, normalizedName, normalizedNameEn, normalizedUrl, normalizedDomainCode, normalizedMenuType, isEn);
        if (!error.isEmpty()) {
            return redirectPageManagementError(request, locale, normalizedMenuType, null, null, error, null, null);
        }

        try {
            if (adminCodeManageService.countPageManagementByCode(codeId, normalizedCode) > 0) {
                return redirectPageManagementError(request, locale, normalizedMenuType, null, null,
                        isEn ? "The page code already exists." : "이미 등록된 페이지 코드입니다.", null, null);
            }
            adminCodeManageService.insertPageManagement(codeId, normalizedCode, normalizedName, normalizedNameEn, normalizedUrl, normalizedIcon, normalizedUseAt, "admin");
            ensureDefaultViewFeature(normalizedCode, normalizedName, normalizedNameEn, normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to create page management. code={}", normalizedCode, e);
            return redirectPageManagementError(request, locale, normalizedMenuType, null, null,
                    isEn ? "Failed to register the page." : "페이지 등록에 실패했습니다.", null, null);
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType + "&autoFeature=Y";
    }

    @RequestMapping(value = "/page-management/update", method = RequestMethod.POST)
    public String updatePageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "menuUrl", required = false) String menuUrl,
            @RequestParam(value = "menuIcon", required = false) String menuIcon,
            @RequestParam(value = "useAt", required = false) String useAt,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "searchUrl", required = false) String searchUrl,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        String normalizedName = safeString(codeNm);
        String normalizedNameEn = safeString(codeDc);
        String normalizedUrl = canonicalMenuUrl(menuUrl);
        String normalizedIcon = safeString(menuIcon);
        String normalizedUseAt = normalizeUseAt(useAt);

        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        if (normalizedCode.isEmpty() || normalizedName.isEmpty() || normalizedNameEn.isEmpty() || normalizedUrl.isEmpty()) {
            return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                    isEn ? "Page code, page names, and URL are required." : "페이지 코드, 페이지명, 영문 페이지명, URL은 필수입니다.",
                    null, null);
        }
        if (!isValidPageManagementUrl(normalizedUrl, normalizedMenuType)) {
            return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                    isEn
                            ? ("USER".equals(normalizedMenuType)
                            ? "Home page URLs must start with /home or /en/home."
                            : "Admin page URLs must start with /admin/ or /en/admin/.")
                            : ("USER".equals(normalizedMenuType)
                            ? "홈 화면 URL은 /home 또는 /en/home 으로 시작해야 합니다."
                            : "관리자 화면 URL은 /admin/ 또는 /en/admin/ 으로 시작해야 합니다."),
                    null, null);
        }

        try {
            adminCodeManageService.updatePageManagement(normalizedCode, normalizedName, normalizedNameEn, normalizedUrl, normalizedIcon, normalizedUseAt, "admin");
            syncDefaultViewFeatureMetadata(normalizedCode, normalizedUseAt, normalizedMenuType);
        } catch (Exception e) {
            log.error("Failed to update page management. code={}", normalizedCode, e);
            return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                    isEn ? "Failed to update the page URL." : "페이지 URL 수정에 실패했습니다.", null, null);
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType + "&searchKeyword=" + urlEncode(searchKeyword) + "&searchUrl=" + urlEncode(searchUrl) + "&updated=Y";
    }

    @RequestMapping(value = "/page-management/delete", method = RequestMethod.POST)
    public String deletePageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "searchUrl", required = false) String searchUrl,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedCode = safeString(code).toUpperCase(Locale.ROOT);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        if (normalizedCode.isEmpty()) {
            return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                    isEn ? "Page code is required." : "페이지 코드를 확인해 주세요.", null, null);
        }

        int defaultViewRoleRefCount = 0;
        int defaultViewUserOverrideCount = 0;
        try {
            List<String> linkedFeatureCodes = authGroupManageService.selectFeatureCodesByMenuCode(normalizedCode);
            String defaultViewFeatureCode = buildDefaultViewFeatureCode(normalizedCode);
            defaultViewRoleRefCount = authGroupManageService.countAuthorFeatureRelationsByFeatureCode(defaultViewFeatureCode);
            defaultViewUserOverrideCount = authGroupManageService.countUserFeatureOverridesByFeatureCode(defaultViewFeatureCode);
            List<String> nonDefaultFeatureCodes = new ArrayList<>();
            for (String featureCode : linkedFeatureCodes) {
                String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
                if (!normalizedFeatureCode.isEmpty() && !normalizedFeatureCode.equals(defaultViewFeatureCode)) {
                    nonDefaultFeatureCodes.add(normalizedFeatureCode);
                }
            }
            if (!nonDefaultFeatureCodes.isEmpty()) {
                String featureCodeSummary = String.join(", ", nonDefaultFeatureCodes);
                return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                        isEn
                                ? "Delete the page-specific action features first. Remaining features: " + featureCodeSummary
                                + " | Default VIEW cleanup impact: role mappings " + defaultViewRoleRefCount
                                + ", user overrides " + defaultViewUserOverrideCount
                                : "페이지 전용 액션 기능을 먼저 삭제해 주세요. 남아 있는 기능: " + featureCodeSummary
                                + " | 기본 VIEW 정리 영향: 권한그룹 매핑 " + defaultViewRoleRefCount
                                + "건, 사용자 예외권한 " + defaultViewUserOverrideCount + "건",
                        defaultViewRoleRefCount,
                        defaultViewUserOverrideCount);
            }
            if (linkedFeatureCodes.stream().anyMatch(featureCode -> defaultViewFeatureCode.equalsIgnoreCase(safeString(featureCode)))) {
                deleteFeatureWithAssignments(defaultViewFeatureCode);
            }
            adminCodeManageService.deletePageManagement(codeId, normalizedCode);
        } catch (Exception e) {
            log.error("Failed to delete page management. code={}", normalizedCode, e);
            return redirectPageManagementError(request, locale, normalizedMenuType, searchKeyword, searchUrl,
                    isEn ? "Failed to delete the page." : "페이지 삭제에 실패했습니다.", null, null);
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType
                + "&searchKeyword=" + urlEncode(searchKeyword)
                + "&searchUrl=" + urlEncode(searchUrl)
                + "&deleted=Y"
                + "&deletedRoleRefs=" + defaultViewRoleRefCount
                + "&deletedUserOverrides=" + defaultViewUserOverrideCount;
    }

    @RequestMapping(value = "/code/class/create", method = RequestMethod.POST)
    public String createClassCode(
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "clCodeNm", required = false) String clCodeNm,
            @RequestParam(value = "clCodeDc", required = false) String clCodeDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        String name = safeString(clCodeNm);
        String desc = safeString(clCodeDc);
        String use = normalizeUseAt(useAt);

        if (code.isEmpty() || name.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Class code and name are required." : "분류 코드와 분류명은 필수입니다.");
        }
        try {
            boolean duplicate = adminCodeManageService.selectClassCodeList().stream()
                    .anyMatch(item -> code.equalsIgnoreCase(safeString(item == null ? null : item.getClCode())));
            if (duplicate) {
                return redirectCodeManagementError(request, locale, currentDetailCodeId,
                        isEn ? "The class code already exists." : "이미 등록된 분류 코드입니다.");
            }
        } catch (Exception e) {
            log.error("Failed to validate duplicate class code. clCode={}", code, e);
            return redirectCodeManagementError(request, locale, currentDetailCodeId,
                    isEn ? "Failed to validate class code duplication." : "분류 코드 중복 확인에 실패했습니다.");
        }

        try {
            adminCodeManageService.insertClassCode(code, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to create class code. clCode={}", code, e);
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Failed to create class code." : "분류 코드 등록에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Class code has been created." : "분류 코드가 등록되었습니다.");
    }

    @RequestMapping(value = "/code/class/update", method = RequestMethod.POST)
    public String updateClassCode(
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "clCodeNm", required = false) String clCodeNm,
            @RequestParam(value = "clCodeDc", required = false) String clCodeDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        String name = safeString(clCodeNm);
        String desc = safeString(clCodeDc);
        String use = normalizeUseAt(useAt);

        if (code.isEmpty() || name.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Class code and name are required." : "분류 코드와 분류명은 필수입니다.");
        }

        try {
            adminCodeManageService.updateClassCode(code, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to update class code. clCode={}", code, e);
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Failed to update class code." : "분류 코드 수정에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Class code has been updated." : "분류 코드가 수정되었습니다.");
    }

    @RequestMapping(value = "/code/class/delete", method = RequestMethod.POST)
    public String deleteClassCode(
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        if (code.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Class code is required." : "분류 코드를 입력해 주세요.");
        }

        try {
            int refCount = adminCodeManageService.countCodesByClass(code);
            if (refCount > 0) {
                return redirectCodeManagementError(request, locale, null,
                        isEn ? "Cannot delete: codes are still linked." : "연결된 코드가 있어 삭제할 수 없습니다.");
            }
            adminCodeManageService.deleteClassCode(code);
        } catch (Exception e) {
            log.error("Failed to delete class code. clCode={}", code, e);
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Failed to delete class code." : "분류 코드 삭제에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Class code has been deleted." : "분류 코드가 삭제되었습니다.");
    }

    @RequestMapping(value = "/code/group/create", method = RequestMethod.POST)
    public String createCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "codeIdNm", required = false) String codeIdNm,
            @RequestParam(value = "codeIdDc", required = false) String codeIdDc,
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "useAt", required = false) String useAt,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String name = safeString(codeIdNm);
        String desc = safeString(codeIdDc);
        String cl = safeString(clCode).toUpperCase(Locale.ROOT);
        String use = normalizeUseAt(useAt);

        if (id.isEmpty() || name.isEmpty() || cl.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Code ID, name, and class code are required." : "코드 ID, 코드명, 분류 코드는 필수입니다.");
        }
        try {
            boolean duplicate = adminCodeManageService.selectCodeList().stream()
                    .anyMatch(item -> id.equalsIgnoreCase(safeString(item == null ? null : item.getCodeId())));
            if (duplicate) {
                return redirectCodeManagementError(request, locale, currentDetailCodeId,
                        isEn ? "The code ID already exists." : "이미 등록된 코드 ID입니다.");
            }
        } catch (Exception e) {
            log.error("Failed to validate duplicate code ID. codeId={}", id, e);
            return redirectCodeManagementError(request, locale, currentDetailCodeId,
                    isEn ? "Failed to validate code ID duplication." : "코드 ID 중복 확인에 실패했습니다.");
        }

        try {
            adminCodeManageService.insertCommonCode(id, name, desc, use, cl, "admin");
        } catch (Exception e) {
            log.error("Failed to create common code. codeId={}", id, e);
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Failed to create code ID." : "코드 ID 등록에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Code ID has been created." : "코드 ID가 등록되었습니다.");
    }

    @RequestMapping(value = "/code/group/update", method = RequestMethod.POST)
    public String updateCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "codeIdNm", required = false) String codeIdNm,
            @RequestParam(value = "codeIdDc", required = false) String codeIdDc,
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "useAt", required = false) String useAt,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String name = safeString(codeIdNm);
        String desc = safeString(codeIdDc);
        String cl = safeString(clCode).toUpperCase(Locale.ROOT);
        String use = normalizeUseAt(useAt);

        if (id.isEmpty() || name.isEmpty() || cl.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Code ID, name, and class code are required." : "코드 ID, 코드명, 분류 코드는 필수입니다.");
        }

        try {
            adminCodeManageService.updateCommonCode(id, name, desc, use, cl, "admin");
        } catch (Exception e) {
            log.error("Failed to update common code. codeId={}", id, e);
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Failed to update code ID." : "코드 ID 수정에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Code ID has been updated." : "코드 ID가 수정되었습니다.");
    }

    @RequestMapping(value = "/code/group/delete", method = RequestMethod.POST)
    public String deleteCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "currentDetailCodeId", required = false) String currentDetailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);

        if (id.isEmpty()) {
            return redirectCodeManagementError(request, locale, null,
                    isEn ? "Code ID is required." : "코드 ID를 입력해 주세요.");
        }

        try {
            int refCount = adminCodeManageService.countDetailCodesByCodeId(id);
            if (refCount > 0) {
                return redirectCodeManagementError(request, locale, id,
                        isEn ? "Cannot delete: detail codes are linked." : "연결된 상세 코드가 있어 삭제할 수 없습니다.");
            }
            adminCodeManageService.deleteCommonCode(id);
        } catch (Exception e) {
            log.error("Failed to delete common code. codeId={}", id, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to delete code ID." : "코드 ID 삭제에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, currentDetailCodeId,
                isEn ? "Code ID has been deleted." : "코드 ID가 삭제되었습니다.");
    }

    @RequestMapping(value = "/code/detail/create", method = RequestMethod.POST)
    public String createDetailCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String c = safeString(code).toUpperCase(Locale.ROOT);
        String name = safeString(codeNm);
        String desc = safeString(codeDc);
        String use = normalizeUseAt(useAt);

        if (id.isEmpty() || c.isEmpty() || name.isEmpty()) {
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Code ID, code, and name are required." : "코드 ID, 코드, 코드명은 필수입니다.");
        }
        try {
            boolean duplicate = adminCodeManageService.selectDetailCodeList(id).stream()
                    .anyMatch(item -> id.equalsIgnoreCase(safeString(item == null ? null : item.getCodeId()))
                            && c.equalsIgnoreCase(safeString(item == null ? null : item.getCode())));
            if (duplicate) {
                return redirectCodeManagementError(request, locale, id,
                        isEn ? "The detail code already exists." : "이미 등록된 상세 코드입니다.");
            }
        } catch (Exception e) {
            log.error("Failed to validate duplicate detail code. codeId={}, code={}", id, c, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to validate detail code duplication." : "상세 코드 중복 확인에 실패했습니다.");
        }

        try {
            adminCodeManageService.insertDetailCode(id, c, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to create detail code. codeId={}, code={}", id, c, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to create detail code." : "상세 코드 등록에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, id,
                isEn ? "Detail code has been created." : "상세 코드가 등록되었습니다.");
    }

    @RequestMapping(value = "/code/detail/update", method = RequestMethod.POST)
    public String updateDetailCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codeNm", required = false) String codeNm,
            @RequestParam(value = "codeDc", required = false) String codeDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String c = safeString(code).toUpperCase(Locale.ROOT);
        String name = safeString(codeNm);
        String desc = safeString(codeDc);
        String use = normalizeUseAt(useAt);

        if (id.isEmpty() || c.isEmpty() || name.isEmpty()) {
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Code ID, code, and name are required." : "코드 ID, 코드, 코드명은 필수입니다.");
        }

        try {
            adminCodeManageService.updateDetailCode(id, c, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to update detail code. codeId={}, code={}", id, c, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to update detail code." : "상세 코드 수정에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, id,
                isEn ? "Detail code has been updated." : "상세 코드가 수정되었습니다.");
    }

    @RequestMapping(value = "/code/detail/bulk-use", method = RequestMethod.POST)
    public String bulkUpdateDetailCodeUseAt(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "codes", required = false) String codes,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String normalizedUseAt = normalizeUseAt(useAt);
        Set<String> selectedCodeSet = new LinkedHashSet<>();
        for (String token : safeString(codes).split(",")) {
            String normalizedCode = safeStaticString(token).toUpperCase(Locale.ROOT);
            if (!normalizedCode.isEmpty()) {
                selectedCodeSet.add(normalizedCode);
            }
        }
        List<String> selectedCodes = new ArrayList<>(selectedCodeSet);

        if (id.isEmpty() || selectedCodes.isEmpty()) {
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Select at least one detail code." : "하나 이상의 상세 코드를 선택하세요.");
        }

        try {
            List<DetailCodeVO> detailCodeList = adminCodeManageService.selectDetailCodeList(id);
            Map<String, DetailCodeVO> detailCodeByCode = new LinkedHashMap<>();
            for (DetailCodeVO item : detailCodeList) {
                String code = safeString(item == null ? null : item.getCode()).toUpperCase(Locale.ROOT);
                if (!code.isEmpty()) {
                    detailCodeByCode.put(code, item);
                }
            }
            for (String selectedCode : selectedCodes) {
                DetailCodeVO detailCode = detailCodeByCode.get(selectedCode);
                if (detailCode == null) {
                    continue;
                }
                adminCodeManageService.updateDetailCode(
                        id,
                        selectedCode,
                        safeString(detailCode.getCodeNm()),
                        safeString(detailCode.getCodeDc()),
                        normalizedUseAt,
                        "admin");
            }
        } catch (Exception e) {
            log.error("Failed to bulk update detail code useAt. codeId={}, useAt={}, codes={}", id, normalizedUseAt, selectedCodes, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to update selected detail codes." : "선택한 상세 코드 일괄 수정에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, id,
                isEn ? "Selected detail codes have been updated." : "선택한 상세 코드가 일괄 수정되었습니다.");
    }

    @RequestMapping(value = "/code/detail/delete", method = RequestMethod.POST)
    public String deleteDetailCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "code", required = false) String code,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);
        String c = safeString(code).toUpperCase(Locale.ROOT);

        if (id.isEmpty() || c.isEmpty()) {
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Code ID and code are required." : "코드 ID와 코드값을 입력해 주세요.");
        }

        try {
            adminCodeManageService.deleteDetailCode(id, c);
        } catch (Exception e) {
            log.error("Failed to delete detail code. codeId={}, code={}", id, c, e);
            return redirectCodeManagementError(request, locale, id,
                    isEn ? "Failed to delete detail code." : "상세 코드 삭제에 실패했습니다.");
        }

        return redirectCodeManagementMessage(request, locale, id,
                isEn ? "Detail code has been deleted." : "상세 코드가 삭제되었습니다.");
    }

    private String populateCodeManagementPage(String detailCodeId, boolean isEn, Model model) {
        List<ClassCodeVO> clCodeList = Collections.emptyList();
        List<CommonCodeVO> codeList = Collections.emptyList();
        try {
            clCodeList = adminCodeManageService.selectClassCodeList();
            codeList = adminCodeManageService.selectCodeList();
        } catch (Exception e) {
            log.error("Failed to load code management lists.", e);
        }

        String selectedCodeId = safeString(detailCodeId).toUpperCase(Locale.ROOT);
        if (selectedCodeId.isEmpty() && !codeList.isEmpty()) {
            selectedCodeId = safeString(codeList.get(0).getCodeId()).toUpperCase(Locale.ROOT);
        }

        List<DetailCodeVO> detailCodeList;
        try {
            detailCodeList = adminCodeManageService.selectDetailCodeList(selectedCodeId.isEmpty() ? null : selectedCodeId);
        } catch (Exception e) {
            log.error("Failed to load detail code list.", e);
            detailCodeList = Collections.emptyList();
        }

        Map<String, Integer> classCodeRefCounts = new LinkedHashMap<>();
        for (ClassCodeVO classCode : clCodeList) {
            String clCode = safeString(classCode == null ? null : classCode.getClCode()).toUpperCase(Locale.ROOT);
            if (clCode.isEmpty()) {
                continue;
            }
            try {
                classCodeRefCounts.put(clCode, adminCodeManageService.countCodesByClass(clCode));
            } catch (Exception e) {
                log.warn("Failed to count linked code groups. clCode={}", clCode, e);
                classCodeRefCounts.put(clCode, 0);
            }
        }

        Map<String, Integer> codeDetailRefCounts = new LinkedHashMap<>();
        for (CommonCodeVO commonCode : codeList) {
            String codeId = safeString(commonCode == null ? null : commonCode.getCodeId()).toUpperCase(Locale.ROOT);
            if (codeId.isEmpty()) {
                continue;
            }
            try {
                codeDetailRefCounts.put(codeId, adminCodeManageService.countDetailCodesByCodeId(codeId));
            } catch (Exception e) {
                log.warn("Failed to count linked detail codes. codeId={}", codeId, e);
                codeDetailRefCounts.put(codeId, 0);
            }
        }

        model.addAttribute("clCodeList", clCodeList);
        model.addAttribute("codeList", codeList);
        model.addAttribute("detailCodeList", detailCodeList);
        model.addAttribute("detailCodeId", selectedCodeId);
        model.addAttribute("classCodeRefCounts", classCodeRefCounts);
        model.addAttribute("codeDetailRefCounts", codeDetailRefCounts);
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        return "";
    }

    private void applyQueryMessage(Model model, String attributeName, HttpServletRequest request) {
        String message = safeString(request == null ? null : request.getParameter("message"));
        if (!message.isEmpty()) {
            model.addAttribute(attributeName, message);
        }
    }

    private void applyQueryError(Model model, String attributeName, HttpServletRequest request) {
        String errorMessage = safeString(request == null ? null : request.getParameter("errorMessage"));
        if (!errorMessage.isEmpty()) {
            model.addAttribute(attributeName, errorMessage);
        }
    }

    private String redirectCodeManagementMessage(HttpServletRequest request, Locale locale, String detailCodeId, String message) {
        StringBuilder redirect = new StringBuilder("redirect:")
                .append(adminPrefix(request, locale))
                .append("/system/code");
        boolean hasQuery = false;
        String normalizedDetailCodeId = safeString(detailCodeId);
        if (!normalizedDetailCodeId.isEmpty()) {
            redirect.append("?detailCodeId=").append(urlEncode(normalizedDetailCodeId));
            hasQuery = true;
        }
        redirect.append(hasQuery ? '&' : '?')
                .append("message=")
                .append(urlEncode(message));
        return redirect.toString();
    }

    private String redirectCodeManagementError(HttpServletRequest request, Locale locale, String detailCodeId, String errorMessage) {
        StringBuilder redirect = new StringBuilder("redirect:")
                .append(adminPrefix(request, locale))
                .append("/system/code");
        boolean hasQuery = false;
        String normalizedDetailCodeId = safeString(detailCodeId);
        if (!normalizedDetailCodeId.isEmpty()) {
            redirect.append("?detailCodeId=").append(urlEncode(normalizedDetailCodeId));
            hasQuery = true;
        }
        return appendErrorQuery(redirect, hasQuery, errorMessage);
    }

    private String redirectMenuManagementError(HttpServletRequest request, Locale locale, String menuType, String errorMessage) {
        StringBuilder redirect = new StringBuilder("redirect:")
                .append(adminPrefix(request, locale))
                .append("/system/menu?menuType=")
                .append(urlEncode(menuType));
        return appendErrorQuery(redirect, true, errorMessage);
    }

    private String redirectFunctionManagementError(
            HttpServletRequest request,
            Locale locale,
            String menuType,
            String searchMenuCode,
            String searchKeyword,
            String errorMessage) {
        StringBuilder redirect = new StringBuilder("redirect:")
                .append(adminPrefix(request, locale))
                .append("/system/feature-management?menuType=")
                .append(urlEncode(menuType));
        appendRedirectQuery(redirect, "searchMenuCode", searchMenuCode);
        appendRedirectQuery(redirect, "searchKeyword", searchKeyword);
        return appendErrorQuery(redirect, true, errorMessage);
    }

    private String redirectPageManagementError(
            HttpServletRequest request,
            Locale locale,
            String menuType,
            String searchKeyword,
            String searchUrl,
            String errorMessage,
            Integer deletedRoleRefs,
            Integer deletedUserOverrides) {
        StringBuilder redirect = new StringBuilder("redirect:")
                .append(adminPrefix(request, locale))
                .append("/system/page-management?menuType=")
                .append(urlEncode(menuType));
        appendRedirectQuery(redirect, "searchKeyword", searchKeyword);
        appendRedirectQuery(redirect, "searchUrl", searchUrl);
        if (deletedRoleRefs != null) {
            appendRedirectQuery(redirect, "deletedRoleRefs", String.valueOf(deletedRoleRefs));
        }
        if (deletedUserOverrides != null) {
            appendRedirectQuery(redirect, "deletedUserOverrides", String.valueOf(deletedUserOverrides));
        }
        return appendErrorQuery(redirect, true, errorMessage);
    }

    private void appendRedirectQuery(StringBuilder redirect, String name, String value) {
        String normalizedValue = safeString(value);
        if (!normalizedValue.isEmpty()) {
            redirect.append('&').append(name).append('=').append(urlEncode(normalizedValue));
        }
    }

    private String appendErrorQuery(StringBuilder redirect, boolean hasQuery, String errorMessage) {
        redirect.append(hasQuery ? '&' : '?')
                .append("errorMessage=")
                .append(urlEncode(errorMessage));
        return redirect.toString();
    }

    private void populatePageManagementModel(Model model, boolean isEn, String menuType, String codeId, String searchKeyword, String searchUrl) {
        List<PageManagementVO> pageRows = loadPageManagementRows(codeId, searchKeyword, searchUrl);
        applyPageManagementPermissionImpact(pageRows);
        if ("USER".equals(menuType)) {
            pageRows = mergeUserPublicCatalogRows(pageRows, isEn, searchKeyword, searchUrl);
        }

        model.addAttribute("pageRows", pageRows);
        model.addAttribute("menuType", menuType);
        model.addAttribute("domainOptions", loadPageDomainOptions(isEn, codeId));
        model.addAttribute("iconOptions", buildPageIconOptions());
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("searchUrl", safeString(searchUrl));
    }

    private void populateFunctionManagementModel(Model model, boolean isEn, String menuType, String codeId, String searchMenuCode, String searchKeyword) {
        List<MenuFeatureVO> featureRows = loadFeatureManagementRows(codeId, searchMenuCode, searchKeyword);
        Map<String, Integer> featureAssignmentCounts = loadFeatureAssignmentCountMap();
        int unassignedFeatureCount = 0;
        for (MenuFeatureVO row : featureRows) {
            String featureCode = safeString(row.getFeatureCode()).toUpperCase(Locale.ROOT);
            int assignedRoleCount = featureAssignmentCounts.getOrDefault(featureCode, 0);
            row.setAssignedRoleCount(assignedRoleCount);
            row.setUnassignedToRole(assignedRoleCount == 0);
            if (assignedRoleCount == 0) {
                unassignedFeatureCount++;
            }
        }
        model.addAttribute("menuType", menuType);
        model.addAttribute("featurePageOptions", loadFeaturePageOptions(codeId));
        model.addAttribute("featureUserPageOptions", loadFeaturePageOptions(resolveMenuCodeId("USER")));
        model.addAttribute("featureAdminPageOptions", loadFeaturePageOptions(resolveMenuCodeId("ADMIN")));
        model.addAttribute("featureRows", featureRows);
        model.addAttribute("featureTotalCount", featureRows.size());
        model.addAttribute("featureUnassignedCount", unassignedFeatureCount);
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        model.addAttribute("searchMenuCode", safeString(searchMenuCode));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
    }

    private Map<String, Integer> loadFeatureAssignmentCountMap() {
        try {
            List<FeatureAssignmentStatVO> stats = authGroupManageService.selectFeatureAssignmentStats();
            Map<String, Integer> result = new LinkedHashMap<>();
            for (FeatureAssignmentStatVO stat : stats) {
                String featureCode = safeString(stat.getFeatureCode()).toUpperCase(Locale.ROOT);
                if (!featureCode.isEmpty()) {
                    result.put(featureCode, stat.getAssignedRoleCount());
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to load feature assignment statistics.", e);
            return Collections.emptyMap();
        }
    }

    private void populateMenuManagementModel(Model model, boolean isEn, String menuType, String codeId) {
        List<MenuInfoDTO> menuRows = loadMenuTreeRows(codeId);
        model.addAttribute("menuType", menuType);
        model.addAttribute("menuRows", menuRows);
        model.addAttribute("menuTypes", List.of(
                menuTypeOption("USER", isEn ? "Home" : "홈"),
                menuTypeOption("ADMIN", isEn ? "Admin" : "관리자")
        ));
        model.addAttribute("groupMenuOptions", buildGroupMenuOptions(menuRows));
        model.addAttribute("iconOptions", buildPageIconOptions());
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        model.addAttribute("menuMgmtGuide", isEn
                ? "Create page menus here first. Existing legacy screens can stay registered and be hidden later with useAt."
                : "새 페이지 메뉴는 여기서 먼저 등록하고, 기존 동작 중인 화면은 그대로 두고 나중에 useAt으로 숨김 처리합니다.");
        model.addAttribute("siteMapMgmtGuide", isEn
                ? "Site map exposure should be managed separately through a dedicated site-map management menu."
                : "사이트맵 노출은 별도 사이트맵 관리 메뉴에서 분리해서 운영하는 것을 기본 원칙으로 둡니다.");
    }

    private List<Map<String, Object>> buildFullStackSummaryRows(String codeId) {
        List<MenuInfoDTO> menuRows = loadMenuTreeRows(codeId);
        if (menuRows.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Map<String, Object>> registryByMenuCode = new HashMap<>();
        Map<String, Map<String, Object>> registryByRoutePath = new HashMap<>();
        Map<String, Map<String, Object>> governanceRegistryByMenuCode = fullStackGovernanceRegistryReadPort.getAllEntries();
        for (Map<String, Object> option : uiManifestRegistryPort.selectActivePageOptions()) {
            String menuCode = safeString(asString(option.get("menuCode"))).toUpperCase(Locale.ROOT);
            String routePath = safeString(asString(option.get("routePath")));
            if (!menuCode.isEmpty()) {
                registryByMenuCode.put(menuCode, option);
            }
            if (!routePath.isEmpty()) {
                registryByRoutePath.put(routePath, option);
            }
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (MenuInfoDTO menuRow : menuRows) {
            String menuCode = safeString(menuRow.getCode()).toUpperCase(Locale.ROOT);
            if (menuCode.length() != 8) {
                continue;
            }
            Map<String, Object> summary = new LinkedHashMap<>();
            String menuUrl = safeString(menuRow.getMenuUrl());
            List<String> featureCodes;
            String requiredViewFeatureCode;
            try {
                featureCodes = authGroupManageService.selectFeatureCodesByMenuCode(menuCode);
                requiredViewFeatureCode = safeString(authGroupManageService.selectRequiredViewFeatureCodeByMenuUrl(menuUrl));
            } catch (Exception e) {
                log.error("Failed to resolve feature metadata for managed menu {}.", menuCode, e);
                featureCodes = Collections.emptyList();
                requiredViewFeatureCode = "";
            }
            if (featureCodes == null) {
                featureCodes = Collections.emptyList();
            }

            Map<String, Object> registryOption = registryByMenuCode.get(menuCode);
            if (registryOption == null && !menuUrl.isEmpty()) {
                registryOption = registryByRoutePath.get(menuUrl);
            }
            Map<String, Object> governanceRegistry = governanceRegistryByMenuCode.get(menuCode);
            String pageId = registryOption == null ? "" : safeString(asString(registryOption.get("pageId")));
            if (pageId.isEmpty()) {
                pageId = safeString(asString(safeMap(governanceRegistry).get("pageId")));
            }

            int eventCount = 0;
            int componentCount = 0;
            int functionCount = 0;
            int parameterCount = 0;
            int resultCount = 0;
            int apiCount = 0;
            int controllerCount = 0;
            int serviceCount = 0;
            int mapperCount = 0;
            int schemaCount = 0;
            int tableCount = 0;
            int columnCount = 0;
            int commonCodeGroupCount = 0;
            int relationTableCount = 0;
            int resolverNoteCount = 0;
            int tagCount = 0;
            boolean hasManifestRegistry = false;
            boolean hasScreenCommand = false;
            boolean hasGovernanceRegistry = governanceRegistry != null && !"DEFAULT".equalsIgnoreCase(safeString(asString(governanceRegistry.get("source"))));
            List<String> gaps = new ArrayList<>();

            if (pageId.isEmpty()) {
                gaps.add("screen-command");
            } else {
                try {
                    Map<String, Object> payload = screenCommandCenterService.getScreenCommandPage(pageId);
                    Map<String, Object> page = safeMap(payload.get("page"));
                    hasScreenCommand = !page.isEmpty();
                    Map<String, Object> manifestRegistry = safeMap(page.get("manifestRegistry"));
                    hasManifestRegistry = !safeString(asString(manifestRegistry.get("pageId"))).isEmpty();
                    componentCount = safeMapList(page.get("surfaces")).size() + safeMapList(manifestRegistry.get("components")).size();
                    eventCount = safeMapList(page.get("events")).size();
                    functionCount = countDistinctValues(safeMapList(page.get("events")), "frontendFunction");
                    apiCount = safeMapList(page.get("apis")).size();
                    List<Map<String, Object>> schemas = safeMapList(page.get("schemas"));
                    schemaCount = schemas.size();
                    commonCodeGroupCount = safeMapList(page.get("commonCodeGroups")).size();
                    parameterCount = countFieldSpecRows(safeMapList(page.get("events")), safeMapList(page.get("apis")), true);
                    resultCount = countFieldSpecRows(safeMapList(page.get("events")), safeMapList(page.get("apis")), false);
                    controllerCount = countChainValues(safeMapList(page.get("apis")), "controllerActions", "controllerAction");
                    serviceCount = countChainValues(safeMapList(page.get("apis")), "serviceMethods", "serviceMethod");
                    mapperCount = countChainValues(safeMapList(page.get("apis")), "mapperQueries", "mapperQuery");
                    relationTableCount = safeStringList(safeMap(page.get("menuPermission")).get("relationTables")).size();
                    resolverNoteCount = safeStringList(safeMap(page.get("menuPermission")).get("resolverNotes")).size();
                    LinkedHashSet<String> tables = new LinkedHashSet<>();
                    int columns = 0;
                    for (Map<String, Object> schema : schemas) {
                        String tableName = safeString(asString(schema.get("tableName")));
                        if (!tableName.isEmpty()) {
                            tables.add(tableName);
                        }
                        columns += safeStringList(schema.get("columns")).size();
                    }
                    for (Map<String, Object> api : safeMapList(page.get("apis"))) {
                        tables.addAll(safeStringList(api.get("relatedTables")));
                    }
                    tables.addAll(safeStringList(safeMap(page.get("menuPermission")).get("relationTables")));
                    tableCount = tables.size();
                    columnCount = columns;
                    if (!hasManifestRegistry) {
                        gaps.add("manifest");
                    }
                    if (componentCount == 0) {
                        gaps.add("component");
                    }
                    if (functionCount == 0 && eventCount > 0) {
                        gaps.add("function");
                    }
                    if (controllerCount == 0 && apiCount > 0) {
                        gaps.add("controller");
                    }
                    if (serviceCount == 0 && apiCount > 0) {
                        gaps.add("service");
                    }
                    if (mapperCount == 0 && apiCount > 0) {
                        gaps.add("mapper");
                    }
                    if (schemaCount == 0) {
                        gaps.add("schema");
                    }
                    if (tableCount == 0) {
                        gaps.add("table");
                    }
                    if (columnCount == 0) {
                        gaps.add("column");
                    }
                } catch (Exception e) {
                    log.warn("Failed to build full-stack summary for pageId={}", pageId, e);
                    gaps.add("screen-command-error");
                }
            }
            if (governanceRegistry != null) {
                componentCount = Math.max(componentCount, safeStringList(governanceRegistry.get("componentIds")).size());
                eventCount = Math.max(eventCount, safeStringList(governanceRegistry.get("eventIds")).size());
                functionCount = Math.max(functionCount, safeStringList(governanceRegistry.get("functionIds")).size());
                parameterCount = Math.max(parameterCount, safeStringList(governanceRegistry.get("parameterSpecs")).size());
                resultCount = Math.max(resultCount, safeStringList(governanceRegistry.get("resultSpecs")).size());
                apiCount = Math.max(apiCount, safeStringList(governanceRegistry.get("apiIds")).size());
                controllerCount = Math.max(controllerCount, safeStringList(governanceRegistry.get("controllerActions")).size());
                serviceCount = Math.max(serviceCount, safeStringList(governanceRegistry.get("serviceMethods")).size());
                mapperCount = Math.max(mapperCount, safeStringList(governanceRegistry.get("mapperQueries")).size());
                schemaCount = Math.max(schemaCount, safeStringList(governanceRegistry.get("schemaIds")).size());
                tableCount = Math.max(tableCount, safeStringList(governanceRegistry.get("tableNames")).size());
                columnCount = Math.max(columnCount, safeStringList(governanceRegistry.get("columnNames")).size());
                commonCodeGroupCount = Math.max(commonCodeGroupCount, safeStringList(governanceRegistry.get("commonCodeGroups")).size());
                tagCount = Math.max(tagCount, safeStringList(governanceRegistry.get("tags")).size());
            }

            if (menuUrl.isEmpty()) {
                gaps.add("menu-url");
            }
            if (requiredViewFeatureCode.isEmpty()) {
                gaps.add("view-feature");
            }
            if (!hasGovernanceRegistry) {
                gaps.add("governance-registry");
            }

            summary.put("menuCode", menuCode);
            summary.put("menuNm", safeString(menuRow.getCodeNm()));
            summary.put("menuUrl", menuUrl);
            summary.put("pageId", pageId);
            summary.put("hasManifestRegistry", hasManifestRegistry);
            summary.put("hasScreenCommand", hasScreenCommand);
            summary.put("hasGovernanceRegistry", hasGovernanceRegistry);
            summary.put("requiredViewFeatureCode", requiredViewFeatureCode);
            summary.put("featureCount", featureCodes.size());
            summary.put("componentCount", componentCount);
            summary.put("eventCount", eventCount);
            summary.put("functionCount", functionCount);
            summary.put("parameterCount", parameterCount);
            summary.put("resultCount", resultCount);
            summary.put("apiCount", apiCount);
            summary.put("controllerCount", controllerCount);
            summary.put("serviceCount", serviceCount);
            summary.put("mapperCount", mapperCount);
            summary.put("schemaCount", schemaCount);
            summary.put("tableCount", tableCount);
            summary.put("columnCount", columnCount);
            summary.put("commonCodeGroupCount", commonCodeGroupCount);
            summary.put("relationTableCount", relationTableCount);
            summary.put("resolverNoteCount", resolverNoteCount);
            summary.put("tagCount", tagCount);
            summary.put("gaps", gaps);
            summary.put("coverageScore", computeCoverageScore(summary));
            rows.add(summary);
        }

        rows.sort(Comparator
                .comparingInt((Map<String, Object> row) -> safeParseInt(asString(row.get("coverageScore"))))
                .thenComparing(row -> safeString(asString(row.get("menuCode")))));
        return rows;
    }

    private int computeCoverageScore(Map<String, Object> summary) {
        int score = 0;
        if (!safeString(asString(summary.get("menuUrl"))).isEmpty()) score += 10;
        if (!safeString(asString(summary.get("requiredViewFeatureCode"))).isEmpty()) score += 15;
        if (Boolean.TRUE.equals(summary.get("hasManifestRegistry"))) score += 15;
        if (Boolean.TRUE.equals(summary.get("hasScreenCommand"))) score += 15;
        if (Boolean.TRUE.equals(summary.get("hasGovernanceRegistry"))) score += 10;
        if (safeParseInt(asString(summary.get("featureCount"))) > 0) score += 10;
        if (safeParseInt(asString(summary.get("componentCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("eventCount"))) > 0) score += 10;
        if (safeParseInt(asString(summary.get("functionCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("apiCount"))) > 0) score += 10;
        if (safeParseInt(asString(summary.get("controllerCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("serviceCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("mapperCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("schemaCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("tableCount"))) > 0) score += 5;
        if (safeParseInt(asString(summary.get("columnCount"))) > 0) score += 5;
        return Math.min(score, 100);
    }

    private int countDistinctValues(List<Map<String, Object>> rows, String key) {
        Set<String> values = new LinkedHashSet<>();
        for (Map<String, Object> row : rows) {
            String value = safeString(asString(row.get(key)));
            if (!value.isEmpty()) {
                values.add(value);
            }
        }
        return values.size();
    }

    private int countChainValues(List<Map<String, Object>> rows, String arrayKey, String singleKey) {
        Set<String> values = new LinkedHashSet<>();
        for (Map<String, Object> row : rows) {
            values.addAll(safeStringList(row.get(arrayKey)));
            String single = safeString(asString(row.get(singleKey)));
            if (!single.isEmpty()) {
                values.add(single);
            }
        }
        return values.size();
    }

    private int countFieldSpecRows(List<Map<String, Object>> events,
                                   List<Map<String, Object>> apis,
                                   boolean input) {
        int count = 0;
        for (Map<String, Object> event : events) {
            count += safeMapList(event.get(input ? "functionInputs" : "functionOutputs")).size();
        }
        for (Map<String, Object> api : apis) {
            count += safeMapList(api.get(input ? "requestFields" : "responseFields")).size();
        }
        return count;
    }

    private Map<String, Object> safeMap(Object value) {
        if (value instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> casted = (Map<String, Object>) value;
            return casted;
        }
        return Collections.emptyMap();
    }

    private List<Map<String, Object>> safeMapList(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<?> source = (List<?>) value;
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : source) {
            if (item instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> casted = (Map<String, Object>) item;
                result.add(casted);
            }
        }
        return result;
    }

    private List<String> safeStringList(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<?> source = (List<?>) value;
        List<String> result = new ArrayList<>();
        for (Object item : source) {
            if (item != null) {
                result.add(safeString(item.toString()));
            }
        }
        return result;
    }

    private String asString(Object value) {
        return value == null ? "" : value.toString();
    }

    private List<String> buildPageIconOptions() {
        return List.of(
                "web", "category", "settings", "dashboard", "admin_panel_settings",
                "monitoring", "api", "list_alt", "article", "folder",
                "manage_accounts", "groups", "person_search", "how_to_reg", "history",
                "bar_chart", "search", "badge", "co2", "verified",
                "fact_check", "receipt_long", "payments", "currency_exchange", "ad",
                "open_in_new", "hub", "dns", "security", "backup",
                "sensors", "apartment", "support_agent", "dataset", "description",
                "inventory", "menu", "menu_open", "home", "settings_applications",
                "tune", "display_settings", "terminal", "storage", "database",
                "view_list", "table_rows", "edit_note", "edit_square", "note_add",
                "delete", "delete_forever", "check_circle", "cancel", "warning",
                "error", "info", "notifications", "mail", "call",
                "public", "language", "travel_explore", "account_tree", "schema",
                "lan", "link", "integration_instructions", "sync", "sync_alt",
                "cloud", "cloud_sync", "cloud_done", "download", "upload",
                "download_for_offline", "upload_file", "attach_file", "image",
                "photo", "smart_display", "campaign", "flag", "help",
                "help_center", "extension", "widgets", "apps", "grid_view",
                "filter_alt", "sort", "calendar_month", "schedule", "today",
                "assignment", "assignment_ind", "assignment_turned_in", "task",
                "rule", "policy", "gavel", "shield", "shield_lock",
                "lock", "lock_open", "key", "vpn_key", "fingerprint",
                "bolt", "construction", "build", "build_circle", "engineering",
                "science", "psychology", "precision_manufacturing", "settings_ethernet", "router",
                "wifi", "memory", "developer_board", "devices", "desktop_windows",
                "laptop", "phone_iphone", "print", "qr_code", "sell",
                "shopping_cart", "request_quote", "account_balance", "insights", "timeline"
        );
    }

    private List<Map<String, String>> buildGroupMenuOptions(List<MenuInfoDTO> menuRows) {
        List<Map<String, String>> options = new ArrayList<>();
        for (MenuInfoDTO row : menuRows) {
            String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (code.length() != 6) {
                continue;
            }
            Map<String, String> option = new LinkedHashMap<>();
            option.put("value", code);
            option.put("label", code + " · " + safeString(row.getCodeNm()));
            option.put("urlPrefix", safeString(row.getMenuUrl()));
            options.add(option);
        }
        return options;
    }

    private void populateAccessHistoryModel(Model model,
                                            boolean isEn,
                                            String pageIndexParam,
                                            String searchKeyword,
                                            String insttId,
                                            HttpServletRequest request) {
        int requestedPageIndex = Math.max(1, safeParseInt(pageIndexParam, 1));
        String normalizedKeyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String currentUserId = resolveActorId(request);
        String currentAuthorCode = resolveCurrentAuthorCode(currentUserId, request);
        String currentUserInsttId = resolveCurrentUserInsttId(currentUserId, request);
        boolean canManageAllCompanies = canManageAllCompanies(currentUserId, currentAuthorCode);
        boolean canViewAccessHistory = canViewAccessHistory(currentUserId, currentAuthorCode);

        List<Map<String, String>> companyOptions = canManageAllCompanies
                ? buildAccessHistoryCompanyOptions()
                : buildScopedAccessHistoryCompanyOptions(currentUserInsttId);
        String selectedInsttId = resolveSelectedInsttId(insttId, companyOptions, canManageAllCompanies);
        if (!canManageAllCompanies) {
            selectedInsttId = currentUserInsttId;
        }

        AccessHistoryRowsPage accessHistoryPage = canViewAccessHistory
                ? buildAccessHistoryPage(normalizedKeyword, selectedInsttId, canManageAllCompanies, requestedPageIndex)
                : new AccessHistoryRowsPage(Collections.emptyList(), 0);
        int totalCount = accessHistoryPage.getTotalCount();
        int totalPages = Math.max(1, (int) Math.ceil(totalCount / (double) ACCESS_HISTORY_PAGE_SIZE));
        int pageIndex = Math.min(requestedPageIndex, totalPages);
        int startPage = Math.max(1, ((pageIndex - 1) / 10) * 10 + 1);
        int endPage = Math.min(totalPages, startPage + 9);

        model.addAttribute("canViewAccessHistory", canViewAccessHistory);
        model.addAttribute("canManageAllCompanies", canManageAllCompanies);
        model.addAttribute("companyOptions", companyOptions);
        model.addAttribute("selectedInsttId", safeString(selectedInsttId));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("pageIndex", pageIndex);
        model.addAttribute("pageSize", ACCESS_HISTORY_PAGE_SIZE);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("prevPage", startPage > 1 ? startPage - 1 : 1);
        model.addAttribute("nextPage", endPage < totalPages ? endPage + 1 : totalPages);
        model.addAttribute("accessHistoryList", accessHistoryPage.getRows());
        model.addAttribute("isEn", isEn);
    }

    private AccessHistoryRowsPage buildAccessHistoryPage(String normalizedKeyword,
                                                         String selectedInsttId,
                                                         boolean canManageAllCompanies,
                                                         int pageIndex) {
        Map<String, String> companyNameByInsttId = buildAccessHistoryCompanyNameMap();
        RequestExecutionLogPage logPage = requestExecutionLogService.searchRecent(item -> {
            String effectiveInsttId = resolveEffectiveInsttId(item);
            if (!canManageAllCompanies && !selectedInsttId.isEmpty() && !selectedInsttId.equals(effectiveInsttId)) {
                return false;
            }
            if (canManageAllCompanies && !safeString(selectedInsttId).isEmpty() && !selectedInsttId.equals(effectiveInsttId)) {
                return false;
            }
            return matchesAccessHistoryKeyword(item, normalizedKeyword, effectiveInsttId, companyNameByInsttId.get(effectiveInsttId));
        }, pageIndex, ACCESS_HISTORY_PAGE_SIZE);
        if (logPage.getItems().isEmpty()) {
            return new AccessHistoryRowsPage(Collections.emptyList(), logPage.getTotalCount());
        }

        List<SystemAccessHistoryRowResponse> rows = new ArrayList<>();
        for (RequestExecutionLogVO item : logPage.getItems()) {
            String effectiveInsttId = resolveEffectiveInsttId(item);
            rows.add(new SystemAccessHistoryRowResponse(
                    safeString(item.getLogId()),
                    safeString(item.getExecutedAt()),
                    safeString(item.getRequestUri()),
                    safeString(item.getHttpMethod()),
                    safeString(item.getFeatureType()),
                    safeString(item.getActorUserId()),
                    safeString(item.getActorType()),
                    safeString(item.getActorAuthorCode()),
                    safeString(item.getActorInsttId()),
                    effectiveInsttId,
                    safeString(item.getCompanyContextId()),
                    safeString(item.getTargetCompanyContextId()),
                    item.getResponseStatus(),
                    item.getDurationMs(),
                    safeString(item.getErrorMessage()),
                    extractRemoteAddr(item),
                    safeString(companyNameByInsttId.get(effectiveInsttId))));
        }
        return new AccessHistoryRowsPage(rows, logPage.getTotalCount());
    }

    private boolean matchesAccessHistoryKeyword(RequestExecutionLogVO item,
                                                String normalizedKeyword,
                                                String effectiveInsttId,
                                                String companyName) {
        if (normalizedKeyword.isEmpty()) {
            return true;
        }
        return safeString(item.getActorUserId()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(item.getRequestUri()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(item.getParameterSummary()).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(companyName).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || safeString(effectiveInsttId).toLowerCase(Locale.ROOT).contains(normalizedKeyword)
                || extractRemoteAddr(item).toLowerCase(Locale.ROOT).contains(normalizedKeyword);
    }

    private List<Map<String, String>> buildAccessHistoryCompanyOptions() {
        List<RequestExecutionLogVO> logs = requestExecutionLogService
                .searchRecent(item -> true, 1, ACCESS_HISTORY_RECENT_LIMIT)
                .getItems();
        if (logs == null || logs.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, String> companyNameByInsttId = buildCompanyNameMap(logs);
        List<Map<String, String>> options = new ArrayList<>();
        for (Map.Entry<String, String> entry : companyNameByInsttId.entrySet()) {
            if (entry.getKey().isEmpty()) {
                continue;
            }
            Map<String, String> option = new LinkedHashMap<>();
            option.put("insttId", entry.getKey());
            option.put("cmpnyNm", safeString(entry.getValue()).isEmpty() ? entry.getKey() : entry.getValue());
            options.add(option);
        }
        return options;
    }

    private Map<String, String> buildAccessHistoryCompanyNameMap() {
        return buildCompanyNameMap(requestExecutionLogService
                .searchRecent(item -> true, 1, ACCESS_HISTORY_RECENT_LIMIT)
                .getItems());
    }

    private static final class AccessHistoryRowsPage {

        private final List<SystemAccessHistoryRowResponse> rows;
        private final int totalCount;

        private AccessHistoryRowsPage(List<SystemAccessHistoryRowResponse> rows, int totalCount) {
            this.rows = rows == null ? Collections.emptyList() : rows;
            this.totalCount = Math.max(totalCount, 0);
        }

        private List<SystemAccessHistoryRowResponse> getRows() {
            return rows;
        }

        private int getTotalCount() {
            return totalCount;
        }
    }

    private List<Map<String, String>> buildScopedAccessHistoryCompanyOptions(String currentUserInsttId) {
        if (safeString(currentUserInsttId).isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, String> option = new LinkedHashMap<>();
        option.put("insttId", currentUserInsttId);
        option.put("cmpnyNm", resolveCompanyName(currentUserInsttId));
        return Collections.singletonList(option);
    }

    private Map<String, String> buildCompanyNameMap(List<RequestExecutionLogVO> logs) {
        Map<String, String> companyNameByInsttId = new LinkedHashMap<>();
        for (RequestExecutionLogVO item : logs) {
            String insttId = resolveEffectiveInsttId(item);
            if (insttId.isEmpty() || companyNameByInsttId.containsKey(insttId)) {
                continue;
            }
            companyNameByInsttId.put(insttId, resolveCompanyName(insttId));
        }
        return companyNameByInsttId;
    }

    private String resolveCompanyName(String insttId) {
        String normalizedInsttId = safeString(insttId);
        if (normalizedInsttId.isEmpty()) {
            return "";
        }
        return companyNameCache.computeIfAbsent(normalizedInsttId, this::lookupCompanyName);
    }

    private String lookupCompanyName(String normalizedInsttId) {
        try {
            List<UserAuthorityTargetVO> targets = authGroupManageService.selectUserAuthorityTargets(normalizedInsttId, "");
            if (targets != null) {
                for (UserAuthorityTargetVO target : targets) {
                    String companyName = safeString(target.getCmpnyNm());
                    if (!companyName.isEmpty()) {
                        return companyName;
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Failed to resolve company name from authority targets. insttId={}", normalizedInsttId, e);
        }
        return normalizedInsttId;
    }

    private String resolveEffectiveInsttId(RequestExecutionLogVO item) {
        String insttId = safeString(item.getCompanyContextId());
        if (insttId.isEmpty()) {
            insttId = safeString(item.getTargetCompanyContextId());
        }
        if (insttId.isEmpty()) {
            insttId = safeString(item.getActorInsttId());
        }
        return insttId;
    }

    private String extractRemoteAddr(RequestExecutionLogVO item) {
        String remoteAddr = safeString(item.getRemoteAddr());
        if (!remoteAddr.isEmpty()) {
            return remoteAddr;
        }
        String parameterSummary = safeString(item.getParameterSummary());
        if (parameterSummary.isEmpty()) {
            return "";
        }
        for (String token : parameterSummary.split(",")) {
            String normalized = safeString(token);
            if (normalized.toLowerCase(Locale.ROOT).startsWith("remoteaddr=")) {
                return normalized.substring("remoteAddr=".length());
            }
        }
        return "";
    }

    private String resolveCurrentAuthorCode(String currentUserId, HttpServletRequest request) {
        String authorCode = safeString(resolveActorRole(request)).toUpperCase(Locale.ROOT);
        if (!authorCode.isEmpty()) {
            return authorCode;
        }
        if (safeString(currentUserId).isEmpty()) {
            return "";
        }
        if ("webmaster".equalsIgnoreCase(currentUserId)) {
            return ROLE_SYSTEM_MASTER;
        }
        try {
            authorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(currentUserId)).toUpperCase(Locale.ROOT);
            if (authorCode.isEmpty()) {
                authorCode = safeString(authGroupManageService.selectEnterpriseAuthorCodeByUserId(currentUserId)).toUpperCase(Locale.ROOT);
            }
            return authorCode;
        } catch (Exception e) {
            log.warn("Failed to resolve current author code for access history. userId={}", currentUserId, e);
            return "";
        }
    }

    private String resolveCurrentUserInsttId(String currentUserId, HttpServletRequest request) {
        if (request != null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Object loginVO = session.getAttribute("LoginVO");
                if (loginVO != null) {
                    try {
                        Object value = loginVO.getClass().getMethod("getInsttId").invoke(loginVO);
                        String sessionInsttId = value == null ? "" : safeString(String.valueOf(value));
                        if (!sessionInsttId.isEmpty()) {
                            return sessionInsttId;
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        String normalizedUserId = safeString(currentUserId);
        if (normalizedUserId.isEmpty() || "webmaster".equalsIgnoreCase(normalizedUserId)) {
            return "";
        }
        return employeeMemberRepository.findById(normalizedUserId)
                .map(item -> safeString(item.getInsttId()))
                .filter(value -> !value.isEmpty())
                .orElseGet(() -> enterpriseMemberRepository.findById(normalizedUserId)
                        .map(item -> safeString(item.getInsttId()))
                        .filter(value -> !value.isEmpty())
                        .orElseGet(() -> {
                            try {
                                return safeString(authGroupManageService.selectEnterpriseInsttIdByUserId(normalizedUserId));
                            } catch (Exception e) {
                                log.warn("Failed to resolve current institution for access history. userId={}", normalizedUserId, e);
                                return "";
                            }
                        }));
    }

    private boolean canManageAllCompanies(String currentUserId, String authorCode) {
        if ("webmaster".equalsIgnoreCase(safeString(currentUserId))) {
            return true;
        }
        return ROLE_SYSTEM_MASTER.equals(safeString(authorCode).toUpperCase(Locale.ROOT));
    }

    private boolean canViewAccessHistory(String currentUserId, String authorCode) {
        if ("webmaster".equalsIgnoreCase(safeString(currentUserId))) {
            return true;
        }
        String normalized = safeString(authorCode).toUpperCase(Locale.ROOT);
        return ROLE_SYSTEM_MASTER.equals(normalized)
                || ROLE_SYSTEM_ADMIN.equals(normalized)
                || ROLE_ADMIN.equals(normalized)
                || ROLE_OPERATION_ADMIN.equals(normalized);
    }

    private String resolveSelectedInsttId(String insttId, List<Map<String, String>> companyOptions, boolean allowEmptySelection) {
        String normalized = safeString(insttId);
        if (allowEmptySelection && normalized.isEmpty()) {
            return "";
        }
        if (normalized.isEmpty()) {
            return companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId"));
        }
        for (Map<String, String> option : companyOptions) {
            if (normalized.equals(safeString(option.get("insttId")))) {
                return normalized;
            }
        }
        return companyOptions.isEmpty() ? "" : safeString(companyOptions.get(0).get("insttId"));
    }


    private String normalizeIpWhitelistScope(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "ADMIN";
        }
        return Set.of("ADMIN", "BATCH", "INTERNAL", "API").contains(normalized) ? normalized : "ADMIN";
    }

    private String normalizeIpWhitelistApplicationName(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return "ADMIN_WEB";
        }
        return Set.of("ADMIN_WEB", "API_GATEWAY", "BATCH_AGENT", "INTERNAL_TOOL", "DB_ADMIN", "CUSTOM").contains(normalized)
                ? normalized
                : "CUSTOM";
    }

    private String normalizeIpWhitelistFirewallAction(String value) {
        String normalized = safeString(value).toUpperCase(Locale.ROOT);
        return "OPEN".equals(normalized) ? "OPEN" : "KEEP_CLOSED";
    }

    private String resolveIpWhitelistApplicationLabel(String applicationName, boolean isEn) {
        switch (normalizeIpWhitelistApplicationName(applicationName)) {
            case "API_GATEWAY":
                return isEn ? "API Gateway" : "API 게이트웨이";
            case "BATCH_AGENT":
                return isEn ? "Batch Agent" : "배치 에이전트";
            case "INTERNAL_TOOL":
                return isEn ? "Internal Tool" : "내부 운영 도구";
            case "DB_ADMIN":
                return isEn ? "DB Admin" : "DB 관리";
            case "CUSTOM":
                return isEn ? "Custom" : "직접 입력";
            case "ADMIN_WEB":
            default:
                return isEn ? "Admin Web" : "관리자 웹";
        }
    }

    private String resolveIpWhitelistFirewallLabel(String firewallAction, boolean isEn) {
        return "OPEN".equals(normalizeIpWhitelistFirewallAction(firewallAction))
                ? (isEn ? "Open Firewall" : "방화벽 열기")
                : (isEn ? "Keep Closed" : "방화벽 열지 않기");
    }

    private String buildIpWhitelistExecutionReason(String applicationName,
                                                   String port,
                                                   String firewallAction,
                                                   String reason,
                                                   boolean isEn) {
        String appLabel = resolveIpWhitelistApplicationLabel(applicationName, isEn);
        String firewallLabel = resolveIpWhitelistFirewallLabel(firewallAction, isEn);
        return safeString(reason)
                + (isEn ? " | App " : " | 앱 ")
                + appLabel
                + (isEn ? " | Port " : " | 포트 ")
                + safeString(port)
                + (isEn ? " | Firewall " : " | 방화벽 ")
                + firewallLabel;
    }

    private String buildIpWhitelistExecutionMemo(String applicationName,
                                                 String port,
                                                 String firewallAction,
                                                 String memo,
                                                 String expiresAt,
                                                 boolean isEn) {
        String appLabel = resolveIpWhitelistApplicationLabel(applicationName, isEn);
        String firewallLabel = resolveIpWhitelistFirewallLabel(firewallAction, isEn);
        String baseMemo = safeString(memo);
        StringBuilder builder = new StringBuilder();
        builder.append(isEn ? "Execution plan: " : "실행 계획: ");
        builder.append(appLabel)
                .append(isEn ? ", port " : ", 포트 ")
                .append(safeString(port))
                .append(isEn ? ", firewall " : ", 방화벽 ")
                .append(firewallLabel);
        if (!safeString(expiresAt).isEmpty()) {
            builder.append(isEn ? ", expires " : ", 만료 ")
                    .append(safeString(expiresAt));
        }
        if (!baseMemo.isEmpty()) {
            builder.append(isEn ? " | Memo: " : " | 메모: ").append(baseMemo);
        }
        return builder.toString();
    }

    private String buildIpWhitelistExecutionFeedback(String applicationName,
                                                     String ipAddress,
                                                     String port,
                                                     String firewallAction,
                                                     boolean approved,
                                                     boolean isEn) {
        String appLabel = resolveIpWhitelistApplicationLabel(applicationName, isEn);
        String firewallLabel = resolveIpWhitelistFirewallLabel(firewallAction, isEn);
        if (approved) {
            return isEn
                    ? "Execution result: " + appLabel + " allowlist was approved for " + safeString(ipAddress) + ":" + safeString(port) + ". Firewall action: " + firewallLabel + "."
                    : "실행 결과: " + appLabel + " 허용 요청이 " + safeString(ipAddress) + ":" + safeString(port) + " 기준으로 승인되었습니다. 방화벽 처리: " + firewallLabel + ".";
        }
        return isEn
                ? "Execution queued: " + appLabel + " request for " + safeString(ipAddress) + ":" + safeString(port) + " is waiting for review. Firewall action: " + firewallLabel + "."
                : "실행 접수: " + appLabel + " 요청이 " + safeString(ipAddress) + ":" + safeString(port) + " 기준으로 검토 대기열에 등록되었습니다. 방화벽 처리: " + firewallLabel + ".";
    }

    private String buildIpWhitelistDecisionFeedback(Map<String, String> updatedRequest,
                                                    String decision,
                                                    String reviewNote,
                                                    String firewallFeedback,
                                                    boolean isEn) {
        String detail = safeString(updatedRequest == null ? null : updatedRequest.get(isEn ? "reasonEn" : "reason"));
        String note = safeString(reviewNote);
        String firewall = safeString(firewallFeedback);
        if ("APPROVE".equalsIgnoreCase(decision)) {
            return (isEn ? "Approval feedback: " : "승인 피드백: ")
                    + detail
                    + (note.isEmpty() ? "" : (isEn ? " | Note: " : " | 메모: ") + note)
                    + (firewall.isEmpty() ? "" : (isEn ? " | Firewall: " : " | 방화벽: ") + firewall);
        }
        return (isEn ? "Rejection feedback: " : "반려 피드백: ")
                + detail
                + (note.isEmpty() ? "" : (isEn ? " | Note: " : " | 메모: ") + note)
                + (firewall.isEmpty() ? "" : (isEn ? " | Firewall: " : " | 방화벽: ") + firewall);
    }

    private String executeIpWhitelistFirewall(String applicationName, String ipAddress, String port, boolean isEn) {
        IpWhitelistFirewallService firewallService = ipWhitelistFirewallServiceProvider.getIfAvailable();
        if (firewallService == null) {
            return isEn
                    ? "Firewall service is unavailable."
                    : "방화벽 서비스가 비활성화되어 있습니다.";
        }
        IpWhitelistFirewallService.FirewallExecutionResult result = firewallService.openPortForIp(applicationName, ipAddress, port);
        if (result == null) {
            return isEn
                    ? "Firewall execution returned no result."
                    : "방화벽 실행 결과가 반환되지 않았습니다.";
        }
        return safeString(result.getMessage());
    }

    private String extractIpWhitelistApplicationName(Map<String, String> row) {
        return normalizeIpWhitelistApplicationName(extractExecutionSegment(row, "앱 ", "App "));
    }

    private String extractIpWhitelistPort(Map<String, String> row) {
        return safeString(extractExecutionSegment(row, "포트 ", "Port "));
    }

    private String extractIpWhitelistFirewallAction(Map<String, String> row) {
        String value = extractExecutionSegment(row, "방화벽 ", "Firewall ");
        return value.contains("Open Firewall") || value.contains("방화벽 열기") ? "OPEN" : "KEEP_CLOSED";
    }

    private String extractExecutionSegment(Map<String, String> row, String koPrefix, String enPrefix) {
        String reason = safeString(row == null ? null : row.get("reason"));
        String reasonEn = safeString(row == null ? null : row.get("reasonEn"));
        for (String token : reason.split("\\|")) {
            String trimmed = safeString(token);
            if (trimmed.startsWith(koPrefix)) {
                return safeString(trimmed.substring(koPrefix.length()));
            }
        }
        for (String token : reasonEn.split("\\|")) {
            String trimmed = safeString(token);
            if (trimmed.startsWith(enPrefix)) {
                return safeString(trimmed.substring(enPrefix.length()));
            }
        }
        return "";
    }

    private String formatIpWhitelistTimestamp(LocalDateTime value) {
        return value == null ? "" : IP_WHITELIST_TIMESTAMP_FORMAT.format(value);
    }

    private Map<String, String> ipWhitelistRow(
            String ruleId,
            String ipAddress,
            String accessScope,
            String description,
            String owner,
            String status,
            String updatedAt,
            String memo,
            String descriptionEn,
            String ownerEn,
            String memoEn) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("ruleId", ruleId);
        row.put("ipAddress", ipAddress);
        row.put("accessScope", accessScope);
        row.put("description", description);
        row.put("descriptionEn", descriptionEn);
        row.put("owner", owner);
        row.put("ownerEn", ownerEn);
        row.put("status", status);
        row.put("updatedAt", updatedAt);
        row.put("memo", memo);
        row.put("memoEn", memoEn);
        return row;
    }

    private Map<String, String> ipWhitelistRequestRow(
            String requestId,
            String ipAddress,
            String accessScope,
            String reason,
            String approvalStatus,
            String requestedAt,
            String requester,
            String reasonEn,
            String approvalStatusEn,
            String requesterEn) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("requestId", requestId);
        row.put("ipAddress", ipAddress);
        row.put("accessScope", accessScope);
        row.put("reason", reason);
        row.put("reasonEn", reasonEn);
        row.put("approvalStatus", approvalStatus);
        row.put("approvalStatusEn", approvalStatusEn);
        row.put("requestedAt", requestedAt);
        row.put("requester", requester);
        row.put("requesterEn", requesterEn);
        return row;
    }

    private Map<String, String> summaryCard(String label, String value, String caption) {
        Map<String, String> card = new LinkedHashMap<>();
        card.put("label", label);
        card.put("value", value);
        card.put("caption", caption);
        return card;
    }

    private List<PageManagementVO> loadPageManagementRows(String codeId, String searchKeyword, String searchUrl) {
        try {
            List<PageManagementVO> rows = adminCodeManageService.selectPageManagementList(codeId, searchKeyword, searchUrl);
            for (PageManagementVO row : rows) {
                row.setMenuUrl(canonicalMenuUrl(row.getMenuUrl()));
            }
            return rows;
        } catch (Exception e) {
            log.error("Failed to load page management rows.", e);
            return Collections.emptyList();
        }
    }

    private void applyPageManagementPermissionImpact(List<PageManagementVO> pageRows) {
        if (pageRows == null || pageRows.isEmpty()) {
            return;
        }
        List<String> featureCodes = new ArrayList<>();
        for (PageManagementVO row : pageRows) {
            String pageCode = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (pageCode.isEmpty()) {
                row.setDefaultViewRoleRefCount(0);
                row.setDefaultViewUserOverrideCount(0);
                continue;
            }
            featureCodes.add(buildDefaultViewFeatureCode(pageCode));
        }

        if (featureCodes.isEmpty()) {
            return;
        }

        Map<String, Integer> roleRefCountMap = Collections.emptyMap();
        Map<String, Integer> userOverrideCountMap = Collections.emptyMap();
        try {
            roleRefCountMap = toReferenceCountMap(authGroupManageService.selectAuthorFeatureRelationCounts(featureCodes));
            userOverrideCountMap = toReferenceCountMap(authGroupManageService.selectUserFeatureOverrideCounts(featureCodes));
        } catch (Exception e) {
            log.error("Failed to load page permission impact batch. featureCodes={}", featureCodes, e);
        }

        for (PageManagementVO row : pageRows) {
            String pageCode = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (pageCode.isEmpty()) {
                continue;
            }
            String featureCode = buildDefaultViewFeatureCode(pageCode);
            row.setDefaultViewRoleRefCount(roleRefCountMap.getOrDefault(featureCode, 0));
            row.setDefaultViewUserOverrideCount(userOverrideCountMap.getOrDefault(featureCode, 0));
        }
    }

    private Map<String, Integer> toReferenceCountMap(List<FeatureReferenceCountVO> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Integer> counts = new HashMap<>();
        for (FeatureReferenceCountVO row : rows) {
            String featureCode = safeString(row.getFeatureCode()).toUpperCase(Locale.ROOT);
            if (!featureCode.isEmpty()) {
                counts.put(featureCode, row.getReferenceCount());
            }
        }
        return counts;
    }

    private List<MenuFeatureVO> loadFeaturePageOptions(String codeId) {
        try {
            return menuFeatureManageService.selectMenuPageOptions(codeId);
        } catch (Exception e) {
            log.error("Failed to load feature page options.", e);
            return Collections.emptyList();
        }
    }

    private List<MenuFeatureVO> loadFeatureManagementRows(String codeId, String searchMenuCode, String searchKeyword) {
        try {
            return menuFeatureManageService.selectMenuFeatureList(codeId, safeString(searchMenuCode), safeString(searchKeyword));
        } catch (Exception e) {
            log.error("Failed to load feature management rows.", e);
            return Collections.emptyList();
        }
    }

    private List<Map<String, String>> loadPageDomainOptions(boolean isEn, String codeId) {
        try {
            List<MenuInfoDTO> rows = menuInfoReadPort.selectAdminMenuDetailList(codeId);
            List<Map<String, String>> options = new java.util.ArrayList<>();
            for (MenuInfoDTO row : rows) {
                String code = safeString(row.getCode());
                if (code.length() != 4) {
                    continue;
                }
                Map<String, String> option = new LinkedHashMap<>();
                option.put("code", code);
                option.put("label", (isEn ? fallbackLabel(row.getCodeDc(), row.getCodeNm()) : fallbackLabel(row.getCodeNm(), row.getCodeDc())) + " (" + code + ")");
                options.add(option);
            }
            return options;
        } catch (Exception e) {
            log.error("Failed to load page domain options.", e);
            return Collections.emptyList();
        }
    }

    private Map<String, String> menuTypeOption(String value, String label) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("value", value);
        row.put("label", label);
        return row;
    }

    private String fallbackLabel(String primary, String fallback) {
        String value = safeString(primary);
        return value.isEmpty() ? safeString(fallback) : value;
    }

    private Map<String, String> pageRow(String code, String name, String url, String domain, String useAt, String status) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("code", code);
        row.put("name", name);
        row.put("url", url);
        row.put("domain", domain);
        row.put("useAt", useAt);
        row.put("status", status);
        return row;
    }

    private String validatePageManagementInput(
            String code,
            String codeNm,
            String codeDc,
            String menuUrl,
            String domainCode,
            String menuType,
            boolean isEn) {
        if (code.isEmpty() || codeNm.isEmpty() || codeDc.isEmpty() || menuUrl.isEmpty() || domainCode.isEmpty()) {
            return isEn
                    ? "Page code, page name, English page name, URL, and domain are required."
                    : "페이지 코드, 페이지명, 영문 페이지명, URL, 도메인은 필수입니다.";
        }
        if (!code.startsWith(domainCode)) {
            return isEn
                    ? "The page code must start with the selected domain code."
                    : "페이지 코드는 선택한 도메인 코드로 시작해야 합니다.";
        }
        if (code.length() != 8) {
            return isEn
                    ? "The page code must be 8 characters long."
                    : "페이지 코드는 8자리로 입력해 주세요.";
        }
        if (!isValidPageManagementUrl(menuUrl, menuType)) {
            return isEn
                    ? ("USER".equals(menuType)
                        ? "Home page URLs must start with /home or /en/home."
                        : "Admin page URLs must start with /admin/ or /en/admin/.")
                    : ("USER".equals(menuType)
                        ? "홈 화면 URL은 /home 또는 /en/home 으로 시작해야 합니다."
                        : "관리자 화면 URL은 /admin/ 또는 /en/admin/ 으로 시작해야 합니다.");
        }
        return "";
    }

    private String validateMenuManagedPageInput(
            String menuType,
            String codeId,
            String parentCode,
            String codeNm,
            String codeDc,
            String menuUrl,
            boolean isEn) {
        if (parentCode.length() != 6) {
            return isEn ? "Please select a valid group menu." : "유효한 그룹 메뉴를 선택해 주세요.";
        }
        boolean parentExists = loadMenuTreeRows(codeId).stream()
                .map(MenuInfoDTO::getCode)
                .map(this::safeString)
                .map(value -> value.toUpperCase(Locale.ROOT))
                .anyMatch(parentCode::equals);
        if (!parentExists) {
            return isEn ? "The selected group menu does not exist." : "선택한 그룹 메뉴가 존재하지 않습니다.";
        }
        String generatedCode = resolveNextPageCode(codeId, parentCode);
        if (generatedCode.isEmpty()) {
            return isEn
                    ? "No more page codes are available under the selected group."
                    : "선택한 그룹 메뉴 아래에서 더 이상 사용할 페이지 코드를 만들 수 없습니다.";
        }
        String baseError = validatePageManagementInput(generatedCode, codeNm, codeDc, menuUrl, parentCode, menuType, isEn);
        if (!baseError.isEmpty()) {
            return baseError;
        }
        if (hasExistingManagedPageUrl(codeId, menuUrl)) {
            return isEn ? "The page URL is already registered." : "이미 등록된 페이지 URL입니다.";
        }
        return "";
    }

    private String validateFeatureManagementInput(
            String menuCode,
            String featureCode,
            String featureNm,
            String featureNmEn,
            String menuType,
            boolean isEn) {
        if (menuCode.isEmpty() || featureCode.isEmpty() || featureNm.isEmpty() || featureNmEn.isEmpty()) {
            return isEn
                    ? "Page, feature code, feature name, and English feature name are required."
                    : "페이지, 기능 코드, 기능명, 영문 기능명은 필수입니다.";
        }
        if (menuCode.length() != 8) {
            return isEn ? "Features can only be linked to 8-digit page menus." : "기능은 8자리 페이지 메뉴에만 연결할 수 있습니다.";
        }
        if ("USER".equals(menuType) && !menuCode.startsWith("H")) {
            return isEn ? "Home screen features must be mapped to home pages." : "홈 화면 기능은 홈 페이지에만 연결할 수 있습니다.";
        }
        if ("ADMIN".equals(menuType) && !menuCode.startsWith("A")) {
            return isEn ? "Admin screen features must be mapped to admin pages." : "관리자 화면 기능은 관리자 페이지에만 연결할 수 있습니다.";
        }
        try {
            String codeId = resolveMenuCodeId(menuType);
            if (adminCodeManageService.countPageManagementByCode(codeId, menuCode) == 0) {
                return isEn ? "The selected page menu does not exist." : "선택한 페이지 메뉴가 존재하지 않습니다.";
            }
        } catch (Exception e) {
            log.error("Failed to validate feature management page menu. menuCode={}", menuCode, e);
            return isEn ? "Failed to validate the selected page menu." : "선택한 페이지 메뉴 검증에 실패했습니다.";
        }
        if (!featureCode.matches("^[A-Z0-9_\\-]{2,30}$")) {
            return isEn
                    ? "Feature codes must be 2-30 characters using uppercase letters, numbers, underscores, or hyphens."
                    : "기능 코드는 2~30자의 영문 대문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.";
        }
        return "";
    }

    private String validateEnvironmentManagedPageUpdateInput(
            String code,
            String codeNm,
            String codeDc,
            String menuUrl,
            String menuType,
            String codeId,
            boolean isEn) {
        if (code.length() != 8) {
            return isEn ? "Select a valid 8-digit page menu." : "유효한 8자리 페이지 메뉴를 선택해 주세요.";
        }
        if (codeNm.isEmpty() || codeDc.isEmpty() || menuUrl.isEmpty()) {
            return isEn ? "Page names and URL are required." : "페이지명, 영문 페이지명, URL은 필수입니다.";
        }
        if (!isValidPageManagementUrl(menuUrl, menuType)) {
            return isEn
                    ? ("USER".equals(menuType)
                        ? "Home page URLs must start with /home or /en/home."
                        : "Admin page URLs must start with /admin/ or /en/admin/.")
                    : ("USER".equals(menuType)
                        ? "홈 화면 URL은 /home 또는 /en/home 으로 시작해야 합니다."
                        : "관리자 화면 URL은 /admin/ 또는 /en/admin/ 으로 시작해야 합니다.");
        }
        try {
            if (adminCodeManageService.countPageManagementByCode(codeId, code) == 0) {
                return isEn ? "The selected page menu does not exist." : "선택한 페이지 메뉴가 존재하지 않습니다.";
            }
        } catch (Exception e) {
            log.error("Failed to validate environment managed page. code={}", code, e);
            return isEn ? "Failed to validate the selected page menu." : "선택한 페이지 메뉴 검증에 실패했습니다.";
        }
        return "";
    }

    private String validateEnvironmentManagedPageDeleteTarget(String code, String codeId, boolean isEn) {
        if (code.length() != 8) {
            return isEn ? "Only 8-digit page menus can be deleted here." : "이 화면에서는 8자리 페이지 메뉴만 삭제할 수 있습니다.";
        }
        try {
            if (adminCodeManageService.countPageManagementByCode(codeId, code) == 0) {
                return isEn ? "The selected page menu does not exist." : "선택한 페이지 메뉴가 존재하지 않습니다.";
            }
        } catch (Exception e) {
            log.error("Failed to validate environment managed page delete target. code={}", code, e);
            return isEn ? "Failed to validate the selected page menu." : "선택한 페이지 메뉴 검증에 실패했습니다.";
        }
        return "";
    }

    private void ensureDefaultViewFeature(String pageCode, String pageNameKo, String pageNameEn, String useAt) throws Exception {
        String featureCode = buildDefaultViewFeatureCode(pageCode);
        if (featureCode.isEmpty()) {
            return;
        }
        if (menuFeatureManageService.countFeatureCode(featureCode) > 0) {
            return;
        }
        menuFeatureManageService.insertMenuFeature(
                pageCode,
                featureCode,
                buildDefaultViewFeatureName(pageNameKo, false),
                buildDefaultViewFeatureName(pageNameEn, true),
                buildDefaultViewFeatureDescription(pageNameKo, pageNameEn),
                useAt);
    }

    private void syncDefaultViewFeatureMetadata(String pageCode, String useAt, String menuType) throws Exception {
        String featureCode = buildDefaultViewFeatureCode(pageCode);
        if (featureCode.isEmpty() || menuFeatureManageService.countFeatureCode(featureCode) == 0) {
            return;
        }
        String codeId = resolveMenuCodeId(menuType);
        List<PageManagementVO> pageRows = loadPageManagementRows(codeId, pageCode, null);
        for (PageManagementVO row : pageRows) {
            if (!pageCode.equalsIgnoreCase(safeString(row.getCode()))) {
                continue;
            }
            menuFeatureManageService.updateMenuFeatureMetadata(
                    featureCode,
                    buildDefaultViewFeatureName(row.getCodeNm(), false),
                    buildDefaultViewFeatureName(row.getCodeDc(), true),
                    buildDefaultViewFeatureDescription(row.getCodeNm(), row.getCodeDc()),
                    useAt);
            return;
        }
    }

    private void deleteFeatureWithAssignments(String featureCode) throws Exception {
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        if (normalizedFeatureCode.isEmpty()) {
            return;
        }
        authGroupManageService.deleteAuthorFeatureRelationsByFeatureCode(normalizedFeatureCode);
        authGroupManageService.deleteUserFeatureOverridesByFeatureCode(normalizedFeatureCode);
        menuFeatureManageService.deleteMenuFeature(normalizedFeatureCode);
    }

    private String buildDefaultViewFeatureCode(String pageCode) {
        String normalizedPageCode = safeString(pageCode).toUpperCase(Locale.ROOT);
        if (normalizedPageCode.isEmpty()) {
            return "";
        }
        return normalizedPageCode + "_VIEW";
    }

    private String buildDefaultViewFeatureName(String pageName, boolean english) {
        String normalizedPageName = safeString(pageName);
        if (normalizedPageName.isEmpty()) {
            return english ? "View Page" : "페이지 조회";
        }
        return english ? "View " + normalizedPageName : normalizedPageName + " 조회";
    }

    private String buildDefaultViewFeatureDescription(String pageNameKo, String pageNameEn) {
        String normalizedKo = safeString(pageNameKo);
        String normalizedEn = safeString(pageNameEn);
        if (!normalizedKo.isEmpty() && !normalizedEn.isEmpty()) {
            return normalizedKo + " / " + normalizedEn + " page default VIEW permission";
        }
        if (!normalizedKo.isEmpty()) {
            return normalizedKo + " 페이지 기본 VIEW 권한";
        }
        if (!normalizedEn.isEmpty()) {
            return normalizedEn + " page default VIEW permission";
        }
        return "Default VIEW permission for the page";
    }

    private String validateMenuOrderPayload(String menuType, String orderPayload, List<MenuInfoDTO> menuRows, boolean isEn) {
        if (safeString(orderPayload).isEmpty()) {
            return isEn ? "Menu order payload is empty." : "메뉴 순서 정보가 없습니다.";
        }
        Set<String> knownCodes = new LinkedHashSet<>();
        for (MenuInfoDTO row : menuRows) {
            String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (!code.isEmpty()) {
                knownCodes.add(code);
            }
        }
        Set<String> submittedCodes = new LinkedHashSet<>();
        for (String token : safeString(orderPayload).split(",")) {
            String[] parts = token.split(":");
            if (parts.length != 2) {
                return isEn ? "Invalid menu order payload." : "메뉴 순서 형식이 올바르지 않습니다.";
            }
            String code = safeString(parts[0]).toUpperCase(Locale.ROOT);
            String orderText = safeString(parts[1]);
            if (code.isEmpty() || !knownCodes.contains(code)) {
                return isEn ? "Unknown menu code exists in the request." : "알 수 없는 메뉴 코드가 포함되어 있습니다.";
            }
            if ("USER".equals(menuType) && !code.startsWith("H")) {
                return isEn ? "Home menu order can only include home menu codes." : "홈 메뉴 정렬에는 홈 메뉴 코드만 포함할 수 있습니다.";
            }
            if ("ADMIN".equals(menuType) && !code.startsWith("A")) {
                return isEn ? "Admin menu order can only include admin menu codes." : "관리자 메뉴 정렬에는 관리자 메뉴 코드만 포함할 수 있습니다.";
            }
            try {
                int order = Integer.parseInt(orderText);
                if (order < 1) {
                    return isEn ? "Menu order must start from 1." : "메뉴 순서는 1 이상이어야 합니다.";
                }
            } catch (NumberFormatException e) {
                return isEn ? "Menu order contains a non-numeric value." : "메뉴 순서에 숫자가 아닌 값이 포함되어 있습니다.";
            }
            submittedCodes.add(code);
        }
        if (!submittedCodes.containsAll(knownCodes) || submittedCodes.size() != knownCodes.size()) {
            return isEn ? "Some menu nodes are missing from the order payload." : "일부 메뉴 노드가 순서 저장 대상에서 누락되었습니다.";
        }
        return "";
    }

    private List<MenuInfoDTO> loadMenuTreeRows(String codeId) {
        try {
            List<MenuInfoDTO> rows = new ArrayList<>(menuInfoReadPort.selectMenuTreeList(codeId));
            for (MenuInfoDTO row : rows) {
                row.setMenuUrl(canonicalMenuUrl(row.getMenuUrl()));
                normalizeManagedAdminMenuRow(row);
            }
            Map<String, Integer> sortOrderMap = new LinkedHashMap<>();
            for (MenuInfoDTO row : rows) {
                sortOrderMap.put(safeString(row.getCode()).toUpperCase(Locale.ROOT), row.getSortOrdr());
            }
            rows.sort(Comparator
                    .comparingInt((MenuInfoDTO row) -> codeDepth(row.getCode()))
                    .thenComparing(row -> safeString(row.getCode()).substring(0, Math.min(4, safeString(row.getCode()).length())))
                    .thenComparingInt(row -> parentDepthSort(row, sortOrderMap))
                    .thenComparingInt(row -> effectiveSort(row.getCode(), row.getSortOrdr()))
                    .thenComparing(row -> safeString(row.getCode())));
            return rows;
        } catch (Exception e) {
            log.error("Failed to load menu tree rows. codeId={}", codeId, e);
            return Collections.emptyList();
        }
    }

    private void normalizeManagedAdminMenuRow(MenuInfoDTO row) {
        String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
        String menuUrl = safeString(row.getMenuUrl());
        if ("A006".equals(code)) {
            row.setCodeNm("시스템");
            row.setCodeDc("System");
            return;
        }
        if ("A00601".equals(code)) {
            row.setCodeNm("환경");
            row.setCodeDc("Environment");
            return;
        }
        if ("A008".equals(code)) {
            row.setCodeNm("배출/인증");
            row.setCodeDc("Emission / Certification");
            return;
        }
        if ("A00801".equals(code)) {
            row.setCodeNm("배출지 운영");
            row.setCodeDc("Emission Site Operations");
            return;
        }
        if (!menuUrl.startsWith("/admin/system/")) {
            return;
        }
        if ("/admin/system/page-management".equals(menuUrl)) {
            row.setCodeNm("화면 관리");
            row.setCodeDc("Screen Management");
        }
    }

    private boolean hasExistingManagedPageUrl(String codeId, String menuUrl) {
        String normalizedUrl = canonicalMenuUrl(menuUrl);
        if (normalizedUrl.isEmpty()) {
            return false;
        }
        List<PageManagementVO> existingRows = loadPageManagementRows(codeId, null, normalizedUrl);
        for (PageManagementVO row : existingRows) {
            if (normalizedUrl.equalsIgnoreCase(safeString(row.getMenuUrl()))) {
                return true;
            }
        }
        return false;
    }

    private String resolveNextPageCode(String codeId, String parentCode) {
        if (parentCode.length() != 6) {
            return "";
        }
        int maxSuffix = 0;
        for (MenuInfoDTO row : loadMenuTreeRows(codeId)) {
            String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (!code.startsWith(parentCode) || code.length() != 8) {
                continue;
            }
            int suffix = safeParseInt(code.substring(6));
            if (suffix > maxSuffix) {
                maxSuffix = suffix;
            }
        }
        if (maxSuffix >= 99) {
            return "";
        }
        return parentCode + String.format(Locale.ROOT, "%02d", maxSuffix + 1);
    }

    private int resolveNextSiblingSortOrder(String codeId, String parentCode) {
        int maxSortOrdr = 0;
        int siblingCount = 0;
        for (MenuInfoDTO row : loadMenuTreeRows(codeId)) {
            String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
            if (!code.startsWith(parentCode) || code.length() != 8) {
                continue;
            }
            siblingCount++;
            maxSortOrdr = Math.max(maxSortOrdr, row.getSortOrdr() == null ? 0 : row.getSortOrdr());
        }
        return Math.max(maxSortOrdr, siblingCount) + 1;
    }

    private int codeDepth(String code) {
        return safeString(code).length();
    }

    private int parentDepthSort(MenuInfoDTO row, Map<String, Integer> sortOrderMap) {
        String code = safeString(row.getCode()).toUpperCase(Locale.ROOT);
        if (code.length() == 6) {
            return normalizeSort(sortOrderMap.get(code.substring(0, 4)));
        }
        if (code.length() == 8) {
            return normalizeSort(sortOrderMap.get(code.substring(0, 6)));
        }
        return 0;
    }

    private int normalizeSort(Integer sortOrdr) {
        return sortOrdr == null ? Integer.MAX_VALUE : sortOrdr;
    }

    private int effectiveSort(String code, Integer sortOrdr) {
        if (sortOrdr != null) {
            return sortOrdr;
        }
        return fallbackCodeSort(code);
    }

    private int fallbackCodeSort(String code) {
        String normalized = safeString(code);
        if (normalized.length() == 4) {
            return parseSort(normalized.substring(1));
        }
        if (normalized.length() >= 6) {
            return parseSort(normalized.substring(normalized.length() - 2));
        }
        return Integer.MAX_VALUE;
    }

    private int parseSort(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return Integer.MAX_VALUE;
        }
    }

    private int safeParseInt(String value) {
        try {
            return Integer.parseInt(safeString(value));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private int safeParseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(safeString(value));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private String canonicalMenuUrl(String value) {
        String normalized = safeString(value);
        if (normalized.isEmpty()) {
            return "";
        }
        if (normalized.startsWith("/admin/system/unified_log/")
                || normalized.startsWith("/en/admin/system/unified_log/")) {
            return normalized;
        }
        String canonical = ReactPageUrlMapper.toCanonicalMenuUrl(normalized);
        return canonical.isEmpty() ? normalized : canonical;
    }

    private List<Map<String, String>> buildPageManagementBlockedFeatureLinks(
            List<String> featureCodes,
            String menuType,
            String menuCode,
            HttpServletRequest request,
            Locale locale) {
        List<Map<String, String>> links = new ArrayList<>();
        for (String featureCode : featureCodes) {
            String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
            if (normalizedFeatureCode.isEmpty()) {
                continue;
            }
            Map<String, String> item = new LinkedHashMap<>();
            item.put("featureCode", normalizedFeatureCode);
            item.put("href", adminPrefix(request, locale) + "/system/feature-management?menuType="
                    + urlEncode(menuType)
                    + "&searchMenuCode=" + urlEncode(menuCode)
                    + "&searchKeyword=" + urlEncode(normalizedFeatureCode));
            links.add(item);
        }
        return links;
    }


    private boolean isValidPageManagementUrl(String menuUrl, String menuType) {
        if ("USER".equals(menuType)) {
            return menuUrl.startsWith("/home")
                    || menuUrl.startsWith("/en/home")
                    || menuUrl.startsWith("/join/")
                    || menuUrl.startsWith("/join/en/")
                    || menuUrl.startsWith("/signin/")
                    || menuUrl.startsWith("/en/signin/")
                    || "/mypage".equals(menuUrl)
                    || "/en/mypage".equals(menuUrl)
                    || "/sitemap".equals(menuUrl)
                    || "/en/sitemap".equals(menuUrl);
        }
        return menuUrl.startsWith("/admin/") || menuUrl.startsWith("/en/admin/");
    }

    private List<PageManagementVO> mergeUserPublicCatalogRows(List<PageManagementVO> pageRows, boolean isEn, String searchKeyword, String searchUrl) {
        Map<String, PageManagementVO> rowByUrl = new LinkedHashMap<>();
        for (PageManagementVO row : pageRows) {
            rowByUrl.put(safeString(row.getMenuUrl()), row);
        }

        List<PageManagementVO> merged = new ArrayList<>(pageRows);
        for (PageManagementVO catalogRow : buildUserPublicCatalogRows(isEn)) {
            String url = safeString(catalogRow.getMenuUrl());
            PageManagementVO existing = rowByUrl.get(url);
            if (existing != null) {
                existing.setCatalogManaged(true);
                existing.setCatalogRegistered(true);
                existing.setManagementNote(isEn ? "Public flow catalog synced" : "공개 플로우 카탈로그 반영");
                continue;
            }
            if (matchesPageManagementSearch(catalogRow, searchKeyword, searchUrl)) {
                merged.add(catalogRow);
            }
        }

        merged.sort(Comparator
                .comparing(PageManagementVO::getDomainName, Comparator.nullsLast(String::compareTo))
                .thenComparing(PageManagementVO::getMenuUrl, Comparator.nullsLast(String::compareTo))
                .thenComparing(PageManagementVO::getCode, Comparator.nullsLast(String::compareTo)));
        return merged;
    }

    private boolean matchesPageManagementSearch(PageManagementVO row, String searchKeyword, String searchUrl) {
        String keyword = safeString(searchKeyword).toLowerCase(Locale.ROOT);
        String urlKeyword = safeString(searchUrl).toLowerCase(Locale.ROOT);
        if (!keyword.isEmpty()) {
            String code = safeString(row.getCode()).toLowerCase(Locale.ROOT);
            String codeNm = safeString(row.getCodeNm()).toLowerCase(Locale.ROOT);
            String codeDc = safeString(row.getCodeDc()).toLowerCase(Locale.ROOT);
            if (!code.contains(keyword) && !codeNm.contains(keyword) && !codeDc.contains(keyword)) {
                return false;
            }
        }
        return urlKeyword.isEmpty() || safeString(row.getMenuUrl()).toLowerCase(Locale.ROOT).contains(urlKeyword);
    }

    private List<PageManagementVO> buildUserPublicCatalogRows(boolean isEn) {
        return Arrays.asList(
                catalogRow("CAT-SIGNIN-01", "로그인", "Login", "/signin/loginView", "로그인·계정찾기", "Sign In", "login", isEn),
                catalogRow("CAT-SIGNIN-02", "인증방식 선택", "Choose Authentication", "/signin/authChoice", "로그인·계정찾기", "Sign In", "verified_user", isEn),
                catalogRow("CAT-SIGNIN-03", "아이디 찾기", "Find ID", "/signin/findId", "로그인·계정찾기", "Sign In", "search", isEn),
                catalogRow("CAT-SIGNIN-04", "아이디 찾기 결과", "Find ID Result", "/signin/findId/result", "로그인·계정찾기", "Sign In", "fact_check", isEn),
                catalogRow("CAT-SIGNIN-05", "비밀번호 찾기", "Reset Password", "/signin/findPassword", "로그인·계정찾기", "Sign In", "vpn_key", isEn),
                catalogRow("CAT-SIGNIN-06", "비밀번호 찾기 결과", "Reset Password Result", "/signin/findPassword/result", "로그인·계정찾기", "Sign In", "task_alt", isEn),
                catalogRow("CAT-JOIN-01", "1단계. 회원유형 선택", "Step 1. Member Type", "/join/step1", "회원가입", "Join", "how_to_reg", isEn),
                catalogRow("CAT-JOIN-02", "2단계. 약관 동의", "Step 2. Terms Agreement", "/join/step2", "회원가입", "Join", "article", isEn),
                catalogRow("CAT-JOIN-03", "3단계. 본인인증", "Step 3. Identity Verification", "/join/step3", "회원가입", "Join", "verified", isEn),
                catalogRow("CAT-JOIN-04", "4단계. 회원정보 입력", "Step 4. Member Information", "/join/step4", "회원가입", "Join", "edit_note", isEn),
                catalogRow("CAT-JOIN-05", "5단계. 가입 완료", "Step 5. Complete", "/join/step5", "회원가입", "Join", "check_circle", isEn),
                catalogRow("CAT-COMPANY-01", "회원사 가입 신청", "Company Registration", "/join/companyRegister", "회원사 가입", "Company Membership", "apartment", isEn),
                catalogRow("CAT-COMPANY-02", "회원사 가입 신청 완료", "Registration Complete", "/join/companyRegisterComplete", "회원사 가입", "Company Membership", "task", isEn),
                catalogRow("CAT-COMPANY-03", "가입현황 조회", "Status Search", "/join/companyJoinStatusSearch", "회원사 가입", "Company Membership", "travel_explore", isEn),
                catalogRow("CAT-COMPANY-04", "가입현황 안내", "Status Guide", "/join/companyJoinStatusGuide", "회원사 가입", "Company Membership", "info", isEn),
                catalogRow("CAT-COMPANY-05", "가입현황 상세", "Status Detail", "/join/companyJoinStatusDetail", "회원사 가입", "Company Membership", "description", isEn),
                catalogRow("CAT-COMPANY-06", "재신청", "Reapply", "/join/companyReapply", "회원사 가입", "Company Membership", "sync", isEn),
                catalogRow("CAT-MEMBER-01", "마이페이지", "My Page", "/mypage", "회원 공통", "Member Common", "person", isEn),
                catalogRow("CAT-SITEMAP-01", "사이트맵", "Site Map", "/sitemap", "회원 공통", "Member Common", "account_tree", isEn)
        );
    }

    private PageManagementVO catalogRow(String code, String codeNm, String codeDc, String menuUrl,
                                        String domainNameKo, String domainNameEn, String menuIcon, boolean isEn) {
        PageManagementVO row = new PageManagementVO();
        row.setCode(code);
        row.setCodeNm(codeNm);
        row.setCodeDc(codeDc);
        row.setMenuUrl(isEn ? mapEnglishPublicUrl(menuUrl) : menuUrl);
        row.setMenuIcon(menuIcon);
        row.setUseAt("Y");
        row.setDomainName(domainNameKo);
        row.setDomainNameEn(domainNameEn);
        row.setCatalogManaged(true);
        row.setCatalogRegistered(false);
        row.setManagementNote(isEn ? "Catalog-only public flow" : "카탈로그 기준 공개 플로우");
        return row;
    }

    private String mapEnglishPublicUrl(String menuUrl) {
        String normalized = safeString(menuUrl);
        if (normalized.startsWith("/signin/")) {
            return "/en" + normalized;
        }
        if (normalized.startsWith("/join/")) {
            if (normalized.startsWith("/join/en/")) {
                return normalized;
            }
            if ("/join/step1".equals(normalized)) {
                return "/join/en/step1";
            }
            return normalized.replaceFirst("^/join/", "/join/en/");
        }
        if ("/mypage".equals(normalized)) {
            return "/en/mypage";
        }
        if ("/sitemap".equals(normalized)) {
            return "/en/sitemap";
        }
        return normalized;
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null) {
            String path = request.getRequestURI();
            if (path != null && path.startsWith("/en/")) {
                return true;
            }
            String param = request.getParameter("language");
            if ("en".equalsIgnoreCase(param)) {
                return true;
            }
        }
        return locale != null && locale.getLanguage().toLowerCase(Locale.ROOT).startsWith("en");
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

    private ResponseEntity<Map<String, Object>> buildPageDataResponse(HttpServletRequest request,
                                                                      Consumer<ExtendedModelMap> populator) {
        primeCsrfToken(request);
        ExtendedModelMap model = new ExtendedModelMap();
        populator.accept(model);
        return ResponseEntity.ok(new LinkedHashMap<>(model));
    }

    private void applyPageManagementMessage(ExtendedModelMap model,
                                            boolean isEn,
                                            String autoFeature,
                                            String updated,
                                            String deleted,
                                            String deletedRoleRefs,
                                            String deletedUserOverrides) {
        if ("Y".equalsIgnoreCase(safeString(autoFeature))) {
            model.addAttribute("pageMgmtMessage", isEn
                    ? "The page was saved and the default VIEW feature was generated."
                    : "페이지를 저장했고 기본 VIEW 기능도 함께 생성했습니다.");
            return;
        }
        if ("Y".equalsIgnoreCase(safeString(updated))) {
            model.addAttribute("pageMgmtMessage", isEn
                    ? "The page was updated and the default VIEW feature metadata was synchronized."
                    : "페이지를 수정했고 기본 VIEW 기능 메타데이터도 함께 동기화했습니다.");
            return;
        }
        if ("Y".equalsIgnoreCase(safeString(deleted))) {
            int deletedRoleRefCount = safeParseInt(deletedRoleRefs);
            int deletedUserOverrideCount = safeParseInt(deletedUserOverrides);
            model.addAttribute("pageMgmtMessage", isEn
                    ? "The page was deleted and default VIEW permission references were cleaned up. Role mappings: "
                    + deletedRoleRefCount + ", user overrides: " + deletedUserOverrideCount + "."
                    : "페이지를 삭제했고 기본 VIEW 권한 참조도 함께 정리했습니다. 권한그룹 매핑 "
                    + deletedRoleRefCount + "건, 사용자 예외권한 " + deletedUserOverrideCount + "건.");
        }
    }

    private void applyMenuManagementMessage(ExtendedModelMap model, boolean isEn, String saved, boolean fullStack) {
        if (!"Y".equalsIgnoreCase(safeString(saved))) {
            return;
        }
        model.addAttribute("menuMgmtMessage", fullStack
                ? (isEn ? "Full-stack management data has been refreshed." : "풀스택 관리 데이터를 새로 불러왔습니다.")
                : (isEn ? "Menu order has been saved." : "메뉴 순서를 저장했습니다."));
    }

    private String resolvePlatformStudioRoute(HttpServletRequest request) {
        String requestUri = request == null ? "" : safeString(request.getRequestURI());
        for (Map.Entry<String, String> routeEntry : PLATFORM_STUDIO_ROUTE_BY_SUFFIX.entrySet()) {
            if (requestUri.endsWith(routeEntry.getKey())) {
                return routeEntry.getValue();
            }
        }
        return "platform-studio";
    }

    private static Map<String, String> buildPlatformStudioRouteMap() {
        Map<String, String> routeMap = new LinkedHashMap<>();
        routeMap.put("/screen-elements-management", "screen-elements-management");
        routeMap.put("/event-management-console", "event-management-console");
        routeMap.put("/function-management-console", "function-management-console");
        routeMap.put("/api-management-console", "api-management-console");
        routeMap.put("/controller-management-console", "controller-management-console");
        routeMap.put("/db-table-management", "db-table-management");
        routeMap.put("/column-management-console", "column-management-console");
        routeMap.put("/automation-studio", "automation-studio");
        return Collections.unmodifiableMap(routeMap);
    }

    private String adminPrefix(HttpServletRequest request, Locale locale) {
        return isEnglishRequest(request, locale) ? "/en/admin" : "/admin";
    }

    private String redirectReactMigration(HttpServletRequest request, Locale locale, String route) {
        return adminReactRouteSupport.forwardAdminRoute(request, locale, route);
    }

    private String normalizeUseAt(String useAt) {
        String value = safeString(useAt).toUpperCase(Locale.ROOT);
        return "N".equals(value) ? "N" : "Y";
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeString(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private static String safeStaticString(String value) {
        return value == null ? "" : value.trim();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(safeString(value), StandardCharsets.UTF_8);
    }

    private void recordMenuManagementAudit(HttpServletRequest request,
                                           String menuCode,
                                           String actionCode,
                                           String entityId,
                                           String beforeSummaryJson,
                                           String afterSummaryJson) {
        try {
            auditTrailService.record(
                    resolveActorId(request),
                    resolveActorRole(request),
                    menuCode,
                    "menu-management",
                    actionCode,
                    "MENU_MANAGEMENT",
                    entityId,
                    "SUCCESS",
                    "",
                    beforeSummaryJson,
                    afterSummaryJson,
                    resolveRequestIp(request),
                    request == null ? "" : safeString(request.getHeader("User-Agent"))
            );
        } catch (Exception e) {
            log.warn("Failed to record menu-management audit. actionCode={}, entityId={}", actionCode, entityId, e);
        }
    }

    private String resolveActorId(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object loginVO = session.getAttribute("LoginVO");
            if (loginVO != null) {
                try {
                    Object value = loginVO.getClass().getMethod("getId").invoke(loginVO);
                    String actorId = value == null ? "" : value.toString();
                    if (!actorId.isEmpty()) {
                        return actorId;
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return safeString(currentUserContextService.resolve(request).getUserId());
    }

    private String resolveActorRole(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object loginVO = session.getAttribute("LoginVO");
            if (loginVO != null) {
                try {
                    Object value = loginVO.getClass().getMethod("getAuthorCode").invoke(loginVO);
                    String actorRole = value == null ? "" : value.toString();
                    if (!actorRole.isEmpty()) {
                        return actorRole;
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return safeString(currentUserContextService.resolve(request).getAuthorCode());
    }

    private String resolveRequestIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwarded = safeString(request.getHeader("X-Forwarded-For"));
        if (!forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return safeString(request.getRemoteAddr());
    }

    private String safeJson(String value) {
        return safeString(value).replace("\"", "'");
    }

    private String buildManagedDraftPageId(String menuUrl, String menuCode) {
        String normalizedUrl = safeString(menuUrl).toLowerCase(Locale.ROOT);
        if (!normalizedUrl.isEmpty()) {
            String compact = normalizedUrl
                    .replaceFirst("^/en/", "/")
                    .replaceFirst("^/", "")
                    .replace('/', '-')
                    .replace('_', '-')
                    .replaceAll("[^a-z0-9\\-]", "")
                    .replaceAll("-{2,}", "-");
            if (!compact.isEmpty()) {
                return compact;
            }
        }
        return safeString(menuCode).toLowerCase(Locale.ROOT);
    }
}
