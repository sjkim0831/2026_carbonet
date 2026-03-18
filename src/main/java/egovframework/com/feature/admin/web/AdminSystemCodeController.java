package egovframework.com.feature.admin.web;

import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.trace.UiManifestRegistryService;
import egovframework.com.common.util.ReactPageUrlMapper;
import egovframework.com.feature.admin.model.vo.ClassCodeVO;
import egovframework.com.feature.admin.model.vo.CommonCodeVO;
import egovframework.com.feature.admin.model.vo.DetailCodeVO;
import egovframework.com.feature.admin.model.vo.FeatureAssignmentStatVO;
import egovframework.com.feature.admin.model.vo.FeatureReferenceCountVO;
import egovframework.com.feature.admin.model.vo.MenuFeatureVO;
import egovframework.com.feature.admin.model.vo.PageManagementVO;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.FullStackGovernanceRegistryService;
import egovframework.com.feature.admin.service.MenuFeatureManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import egovframework.com.feature.admin.service.WbsManagementService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.security.web.csrf.CsrfToken;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
import java.util.function.Consumer;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class AdminSystemCodeController {

    private static final Logger log = LoggerFactory.getLogger(AdminSystemCodeController.class);
    private static final Map<String, String> PLATFORM_STUDIO_ROUTE_BY_SUFFIX = buildPlatformStudioRouteMap();

    private final AdminCodeManageService adminCodeManageService;
    private final MenuInfoService menuInfoService;
    private final MenuFeatureManageService menuFeatureManageService;
    private final AuthGroupManageService authGroupManageService;
    private final AuditTrailService auditTrailService;
    private final UiManifestRegistryService uiManifestRegistryService;
    private final ScreenCommandCenterService screenCommandCenterService;
    private final FullStackGovernanceRegistryService fullStackGovernanceRegistryService;
    private final WbsManagementService wbsManagementService;

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
        return buildPageDataResponse(request, model -> populateCodeManagementPage(detailCodeId, isEn, model));
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
        return buildPageDataResponse(request, model -> populateIpWhitelistModel(model, isEn, searchIp, accessScope, status));
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
        return buildPageDataResponse(request, model -> populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword));
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

    @RequestMapping(value = "/environment-management", method = RequestMethod.GET)
    public String environmentManagement(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "environment-management");
    }

    @RequestMapping(value = "/wbs-management", method = RequestMethod.GET)
    public String wbsManagement(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "wbs-management");
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

    @RequestMapping(value = "/menu-management/order", method = RequestMethod.POST)
    public String saveMenuManagementOrder(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "orderPayload", required = false) String orderPayload,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        List<MenuInfoDTO> menuRows = loadMenuTreeRows(codeId);
        String error = validateMenuOrderPayload(normalizedMenuType, orderPayload, menuRows, isEn);
        if (!error.isEmpty()) {
            model.addAttribute("menuMgmtError", error);
            populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
            return isEn ? "egovframework/com/admin/menu_management_en" : "egovframework/com/admin/menu_management";
        }

        try {
            for (String token : safeString(orderPayload).split(",")) {
                String[] parts = token.split(":");
                if (parts.length != 2) {
                    continue;
                }
                String code = safeString(parts[0]).toUpperCase(Locale.ROOT);
                int sortOrdr = Integer.parseInt(safeString(parts[1]));
                menuInfoService.saveMenuOrder(code, sortOrdr);
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
            model.addAttribute("menuMgmtError", isEn ? "Failed to save menu order." : "메뉴 순서 저장에 실패했습니다.");
            populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
            return isEn ? "egovframework/com/admin/menu_management_en" : "egovframework/com/admin/menu_management";
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/menu-management?menuType=" + normalizedMenuType + "&saved=Y";
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
            menuInfoService.saveMenuOrder(nextPageCode, resolveNextSiblingSortOrder(codeId, normalizedParentCode));
            String draftPageId = buildManagedDraftPageId(normalizedUrl, nextPageCode);
            Map<String, Object> draftRegistry = uiManifestRegistryService.ensureManagedPageDraft(
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
            model.addAttribute("featureMgmtError", error);
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, normalizedMenuCode, null);
            return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
        }

        try {
            if (menuFeatureManageService.countFeatureCode(normalizedFeatureCode) > 0) {
                model.addAttribute("featureMgmtError", isEn ? "The feature code already exists." : "이미 등록된 기능 코드입니다.");
                populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, normalizedMenuCode, null);
                return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
            }
            menuFeatureManageService.insertMenuFeature(normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedFeatureDc, normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to create feature management. featureCode={}", normalizedFeatureCode, e);
            model.addAttribute("featureMgmtError", isEn ? "Failed to register the feature." : "기능 등록에 실패했습니다.");
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, normalizedMenuCode, null);
            return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
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
            model.addAttribute("featureMgmtError", isEn ? "Feature code is required." : "기능 코드를 확인해 주세요.");
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword);
            return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
        }

        try {
            deleteFeatureWithAssignments(normalizedFeatureCode);
        } catch (Exception e) {
            log.error("Failed to delete feature management. featureCode={}", normalizedFeatureCode, e);
            model.addAttribute("featureMgmtError", isEn ? "Failed to delete the feature." : "기능 삭제에 실패했습니다.");
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword);
            return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
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
            model.addAttribute("pageMgmtError", error);
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, null, null);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }

        try {
            if (adminCodeManageService.countPageManagementByCode(codeId, normalizedCode) > 0) {
                model.addAttribute("pageMgmtError", isEn ? "The page code already exists." : "이미 등록된 페이지 코드입니다.");
                populatePageManagementModel(model, isEn, normalizedMenuType, codeId, null, null);
                return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
            }
            adminCodeManageService.insertPageManagement(codeId, normalizedCode, normalizedName, normalizedNameEn, normalizedUrl, normalizedIcon, normalizedUseAt, "admin");
            ensureDefaultViewFeature(normalizedCode, normalizedName, normalizedNameEn, normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to create page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to register the page." : "페이지 등록에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, null, null);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
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
            model.addAttribute("pageMgmtError", isEn ? "Page code, page names, and URL are required." : "페이지 코드, 페이지명, 영문 페이지명, URL은 필수입니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }
        if (!isValidPageManagementUrl(normalizedUrl, normalizedMenuType)) {
            model.addAttribute("pageMgmtError", isEn
                    ? ("USER".equals(normalizedMenuType)
                        ? "Home page URLs must start with /home or /en/home."
                        : "Admin page URLs must start with /admin/ or /en/admin/.")
                    : ("USER".equals(normalizedMenuType)
                        ? "홈 화면 URL은 /home 또는 /en/home 으로 시작해야 합니다."
                        : "관리자 화면 URL은 /admin/ 또는 /en/admin/ 으로 시작해야 합니다."));
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }

        try {
            adminCodeManageService.updatePageManagement(normalizedCode, normalizedName, normalizedNameEn, normalizedUrl, normalizedIcon, normalizedUseAt, "admin");
            syncDefaultViewFeatureMetadata(normalizedCode, normalizedUseAt, normalizedMenuType);
        } catch (Exception e) {
            log.error("Failed to update page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to update the page URL." : "페이지 URL 수정에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
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
            model.addAttribute("pageMgmtError", isEn ? "Page code is required." : "페이지 코드를 확인해 주세요.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
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
                model.addAttribute("pageMgmtError", isEn
                        ? "Delete the page-specific action features first. Remaining features: " + featureCodeSummary
                            + " | Default VIEW cleanup impact: role mappings " + defaultViewRoleRefCount
                            + ", user overrides " + defaultViewUserOverrideCount
                        : "페이지 전용 액션 기능을 먼저 삭제해 주세요. 남아 있는 기능: " + featureCodeSummary
                            + " | 기본 VIEW 정리 영향: 권한그룹 매핑 " + defaultViewRoleRefCount
                            + "건, 사용자 예외권한 " + defaultViewUserOverrideCount + "건");
                model.addAttribute("pageMgmtBlockedFeatureLinks",
                        buildPageManagementBlockedFeatureLinks(nonDefaultFeatureCodes, normalizedMenuType, normalizedCode, request, locale));
                populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
                return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
            }
            if (linkedFeatureCodes.stream().anyMatch(featureCode -> defaultViewFeatureCode.equalsIgnoreCase(safeString(featureCode)))) {
                deleteFeatureWithAssignments(defaultViewFeatureCode);
            }
            adminCodeManageService.deletePageManagement(codeId, normalizedCode);
        } catch (Exception e) {
            log.error("Failed to delete page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to delete the page." : "페이지 삭제에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
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
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        String name = safeString(clCodeNm);
        String desc = safeString(clCodeDc);
        String use = normalizeUseAt(useAt);

        if (code.isEmpty() || name.isEmpty()) {
            model.addAttribute("codeMgmtError", isEn ? "Class code and name are required." : "분류 코드와 분류명은 필수입니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            adminCodeManageService.insertClassCode(code, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to create class code. clCode={}", code, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to create class code." : "분류 코드 등록에 실패했습니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
    }

    @RequestMapping(value = "/code/class/update", method = RequestMethod.POST)
    public String updateClassCode(
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "clCodeNm", required = false) String clCodeNm,
            @RequestParam(value = "clCodeDc", required = false) String clCodeDc,
            @RequestParam(value = "useAt", required = false) String useAt,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        String name = safeString(clCodeNm);
        String desc = safeString(clCodeDc);
        String use = normalizeUseAt(useAt);

        if (code.isEmpty() || name.isEmpty()) {
            model.addAttribute("codeMgmtError", isEn ? "Class code and name are required." : "분류 코드와 분류명은 필수입니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            adminCodeManageService.updateClassCode(code, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to update class code. clCode={}", code, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to update class code." : "분류 코드 수정에 실패했습니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
    }

    @RequestMapping(value = "/code/class/delete", method = RequestMethod.POST)
    public String deleteClassCode(
            @RequestParam(value = "clCode", required = false) String clCode,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String code = safeString(clCode).toUpperCase(Locale.ROOT);
        if (code.isEmpty()) {
            model.addAttribute("codeMgmtError", isEn ? "Class code is required." : "분류 코드를 입력해 주세요.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            int refCount = adminCodeManageService.countCodesByClass(code);
            if (refCount > 0) {
                model.addAttribute("codeMgmtError", isEn ? "Cannot delete: codes are still linked." : "연결된 코드가 있어 삭제할 수 없습니다.");
                return populateCodeManagementPage(null, isEn, model);
            }
            adminCodeManageService.deleteClassCode(code);
        } catch (Exception e) {
            log.error("Failed to delete class code. clCode={}", code, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to delete class code." : "분류 코드 삭제에 실패했습니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
    }

    @RequestMapping(value = "/code/group/create", method = RequestMethod.POST)
    public String createCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "codeIdNm", required = false) String codeIdNm,
            @RequestParam(value = "codeIdDc", required = false) String codeIdDc,
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "useAt", required = false) String useAt,
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
            model.addAttribute("codeMgmtError", isEn ? "Code ID, name, and class code are required." : "코드 ID, 코드명, 분류 코드는 필수입니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            adminCodeManageService.insertCommonCode(id, name, desc, use, cl, "admin");
        } catch (Exception e) {
            log.error("Failed to create common code. codeId={}", id, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to create code ID." : "코드 ID 등록에 실패했습니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
    }

    @RequestMapping(value = "/code/group/update", method = RequestMethod.POST)
    public String updateCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            @RequestParam(value = "codeIdNm", required = false) String codeIdNm,
            @RequestParam(value = "codeIdDc", required = false) String codeIdDc,
            @RequestParam(value = "clCode", required = false) String clCode,
            @RequestParam(value = "useAt", required = false) String useAt,
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
            model.addAttribute("codeMgmtError", isEn ? "Code ID, name, and class code are required." : "코드 ID, 코드명, 분류 코드는 필수입니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            adminCodeManageService.updateCommonCode(id, name, desc, use, cl, "admin");
        } catch (Exception e) {
            log.error("Failed to update common code. codeId={}", id, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to update code ID." : "코드 ID 수정에 실패했습니다.");
            return populateCodeManagementPage(null, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
    }

    @RequestMapping(value = "/code/group/delete", method = RequestMethod.POST)
    public String deleteCommonCode(
            @RequestParam(value = "codeId", required = false) String codeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        String id = safeString(codeId).toUpperCase(Locale.ROOT);

        if (id.isEmpty()) {
            model.addAttribute("codeMgmtError", isEn ? "Code ID is required." : "코드 ID를 입력해 주세요.");
            return populateCodeManagementPage(null, isEn, model);
        }

        try {
            int refCount = adminCodeManageService.countDetailCodesByCodeId(id);
            if (refCount > 0) {
                model.addAttribute("codeMgmtError", isEn ? "Cannot delete: detail codes are linked." : "연결된 상세 코드가 있어 삭제할 수 없습니다.");
                return populateCodeManagementPage(id, isEn, model);
            }
            adminCodeManageService.deleteCommonCode(id);
        } catch (Exception e) {
            log.error("Failed to delete common code. codeId={}", id, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to delete code ID." : "코드 ID 삭제에 실패했습니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code";
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
            model.addAttribute("codeMgmtError", isEn ? "Code ID, code, and name are required." : "코드 ID, 코드, 코드명은 필수입니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        try {
            adminCodeManageService.insertDetailCode(id, c, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to create detail code. codeId={}, code={}", id, c, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to create detail code." : "상세 코드 등록에 실패했습니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code?detailCodeId=" + urlEncode(id);
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
            model.addAttribute("codeMgmtError", isEn ? "Code ID, code, and name are required." : "코드 ID, 코드, 코드명은 필수입니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        try {
            adminCodeManageService.updateDetailCode(id, c, name, desc, use, "admin");
        } catch (Exception e) {
            log.error("Failed to update detail code. codeId={}, code={}", id, c, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to update detail code." : "상세 코드 수정에 실패했습니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code?detailCodeId=" + urlEncode(id);
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
            model.addAttribute("codeMgmtError", isEn ? "Code ID and code are required." : "코드 ID와 코드값을 입력해 주세요.");
            return populateCodeManagementPage(id, isEn, model);
        }

        try {
            adminCodeManageService.deleteDetailCode(id, c);
        } catch (Exception e) {
            log.error("Failed to delete detail code. codeId={}, code={}", id, c, e);
            model.addAttribute("codeMgmtError", isEn ? "Failed to delete detail code." : "상세 코드 삭제에 실패했습니다.");
            return populateCodeManagementPage(id, isEn, model);
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/code?detailCodeId=" + urlEncode(id);
    }

    private String populateCodeManagementPage(String detailCodeId, boolean isEn, Model model) {
        String viewName = isEn ? "egovframework/com/admin/system_code_en" : "egovframework/com/admin/system_code";
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

        model.addAttribute("clCodeList", clCodeList);
        model.addAttribute("codeList", codeList);
        model.addAttribute("detailCodeList", detailCodeList);
        model.addAttribute("detailCodeId", selectedCodeId);
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        return viewName;
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
        Map<String, Map<String, Object>> governanceRegistryByMenuCode = fullStackGovernanceRegistryService.getAllEntries();
        for (Map<String, Object> option : uiManifestRegistryService.selectActivePageOptions()) {
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

    private void populateIpWhitelistModel(Model model, boolean isEn, String searchIp, String accessScope, String status) {
        String normalizedKeyword = safeString(searchIp).toLowerCase(Locale.ROOT);
        String normalizedScope = safeString(accessScope).toUpperCase(Locale.ROOT);
        String normalizedStatus = safeString(status).toUpperCase(Locale.ROOT);

        List<Map<String, String>> rows = new java.util.ArrayList<>(List.of(
                ipWhitelistRow("WL-001", "203.248.117.0/24", "ADMIN", "운영센터 고정망", "정책관리팀", "ACTIVE", "2026-03-10 09:20", "상시 허용", "Primary office network", "Policy Admin Team", "Always allowed"),
                ipWhitelistRow("WL-002", "10.10.20.15", "BATCH", "배치 서버", "플랫폼운영팀", "ACTIVE", "2026-03-09 18:40", "API 연동 전용", "Batch server", "Platform Ops Team", "API integration only"),
                ipWhitelistRow("WL-003", "175.213.44.82", "ADMIN", "외부 협력사 점검 단말", "보안담당", "PENDING", "2026-03-12 08:50", "2026-03-20까지 임시 허용", "Vendor inspection terminal", "Security Officer", "Temporary access until 2026-03-20"),
                ipWhitelistRow("WL-004", "192.168.0.0/16", "INTERNAL", "사내 VPN 대역", "인프라팀", "INACTIVE", "2026-02-25 14:05", "VPN 정책 재정비 대기", "Internal VPN range", "Infrastructure Team", "Waiting for VPN policy update")
        ));

        if (!normalizedKeyword.isEmpty()) {
            rows.removeIf(row -> !matchesIpWhitelistKeyword(row, normalizedKeyword));
        }
        if (!normalizedScope.isEmpty()) {
            rows.removeIf(row -> !normalizedScope.equalsIgnoreCase(row.get("accessScope")));
        }
        if (!normalizedStatus.isEmpty()) {
            rows.removeIf(row -> !normalizedStatus.equalsIgnoreCase(row.get("status")));
        }

        model.addAttribute("ipWhitelistRows", rows);
        model.addAttribute("ipWhitelistRequestRows", List.of(
                ipWhitelistRequestRow("REQ-240312-01", "175.213.44.82", "ADMIN", "협력사 취약점 점검", "검토중", "2026-03-12 08:45", "보안담당 김민수", "Vendor security inspection", "Under Review", "Security Officer Minsu Kim"),
                ipWhitelistRequestRow("REQ-240311-07", "210.96.14.0/24", "API", "관계기관 API 테스트", "승인완료", "2026-03-11 16:10", "플랫폼운영팀 이지훈", "Partner API test", "Approved", "Platform Ops Jihun Lee"),
                ipWhitelistRequestRow("REQ-240307-02", "121.166.77.19", "ADMIN", "퇴사자 계정 사용 종료", "반려", "2026-03-07 11:20", "감사담당 박선영", "User retired", "Rejected", "Audit Officer Sunyoung Park")
        ));
        model.addAttribute("searchIp", safeString(searchIp));
        model.addAttribute("accessScope", normalizedScope);
        model.addAttribute("status", normalizedStatus);
        model.addAttribute("ipWhitelistSummary", List.of(
                summaryCard(isEn ? "Active Rules" : "활성 규칙", "12", isEn ? "Currently applied to admin and integration paths" : "관리자 및 연계 경로에 현재 적용 중"),
                summaryCard(isEn ? "Pending Requests" : "승인 대기", "3", isEn ? "Temporary requests awaiting review" : "검토 대기 중인 임시 허용 요청"),
                summaryCard(isEn ? "Blocked Hits Today" : "오늘 차단", "27", isEn ? "Denied requests from non-whitelisted IPs" : "화이트리스트 미등록 IP 차단 건수"),
                summaryCard(isEn ? "Last Sync" : "최종 반영", "2026-03-12 09:00", isEn ? "Applied to gateway and admin security policy" : "게이트웨이 및 관리자 보안 정책 반영 완료")
        ));
    }

    private boolean matchesIpWhitelistKeyword(Map<String, String> row, String keyword) {
        return safeString(row.get("ipAddress")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("description")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("owner")).toLowerCase(Locale.ROOT).contains(keyword)
                || safeString(row.get("memo")).toLowerCase(Locale.ROOT).contains(keyword);
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
            List<MenuInfoDTO> rows = menuInfoService.selectAdminMenuDetailList(codeId);
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
            List<MenuInfoDTO> rows = new ArrayList<>(menuInfoService.selectMenuTreeList(codeId));
            for (MenuInfoDTO row : rows) {
                row.setMenuUrl(canonicalMenuUrl(row.getMenuUrl()));
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

    private String canonicalMenuUrl(String value) {
        String normalized = safeString(value);
        if (normalized.isEmpty()) {
            return "";
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
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route);
        String query = request == null ? "" : safeString(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    private String normalizeUseAt(String useAt) {
        String value = safeString(useAt).toUpperCase(Locale.ROOT);
        return "N".equals(value) ? "N" : "Y";
    }

    private String safeString(String value) {
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
        if (session == null) {
            return "";
        }
        Object loginVO = session.getAttribute("LoginVO");
        if (loginVO == null) {
            return "";
        }
        try {
            Object value = loginVO.getClass().getMethod("getId").invoke(loginVO);
            return value == null ? "" : value.toString();
        } catch (Exception ignored) {
            return "";
        }
    }

    private String resolveActorRole(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return "";
        }
        Object loginVO = session.getAttribute("LoginVO");
        if (loginVO == null) {
            return "";
        }
        try {
            Object value = loginVO.getClass().getMethod("getAuthorCode").invoke(loginVO);
            return value == null ? "" : value.toString();
        } catch (Exception ignored) {
            return "";
        }
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
