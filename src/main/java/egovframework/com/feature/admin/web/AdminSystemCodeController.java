package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.model.vo.ClassCodeVO;
import egovframework.com.feature.admin.model.vo.CommonCodeVO;
import egovframework.com.feature.admin.model.vo.DetailCodeVO;
import egovframework.com.feature.admin.model.vo.MenuFeatureVO;
import egovframework.com.feature.admin.model.vo.PageManagementVO;
import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.service.MenuFeatureManageService;
import egovframework.com.feature.admin.service.MenuInfoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.web.csrf.CsrfToken;

import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;

@Controller
@RequestMapping({"/admin/system", "/en/admin/system"})
@RequiredArgsConstructor
public class AdminSystemCodeController {

    private static final Logger log = LoggerFactory.getLogger(AdminSystemCodeController.class);

    private final AdminCodeManageService adminCodeManageService;
    private final MenuInfoService menuInfoService;
    private final MenuFeatureManageService menuFeatureManageService;

    @RequestMapping(value = "/code", method = { RequestMethod.GET, RequestMethod.POST })
    public String system_codeManagement(
            @RequestParam(value = "detailCodeId", required = false) String detailCodeId,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        return populateCodeManagementPage(detailCodeId, isEn, model);
    }

    @RequestMapping(value = "/page-management", method = RequestMethod.GET)
    public String pageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "searchUrl", required = false) String searchUrl,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
        return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
    }

    @RequestMapping(value = "/ip_whitelist", method = RequestMethod.GET)
    public String ipWhitelist(
            @RequestParam(value = "searchIp", required = false) String searchIp,
            @RequestParam(value = "accessScope", required = false) String accessScope,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        populateIpWhitelistModel(model, isEn, searchIp, accessScope, status);
        return isEn ? "egovframework/com/admin/ip_whitelist_en" : "egovframework/com/admin/ip_whitelist";
    }

    @RequestMapping(value = {"/function-management", "/feature-management"}, method = RequestMethod.GET)
    public String functionManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "searchMenuCode", required = false) String searchMenuCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword);
        return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
    }

    @RequestMapping(value = "/menu-management", method = RequestMethod.GET)
    public String menuManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "saved", required = false) String saved,
            HttpServletRequest request,
            Locale locale,
            Model model) {
        boolean isEn = isEnglishRequest(request, locale);
        primeCsrfToken(request);
        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
        if ("Y".equalsIgnoreCase(safeString(saved))) {
            model.addAttribute("menuMgmtMessage", isEn ? "Menu order has been saved." : "메뉴 순서를 저장했습니다.");
        }
        return isEn ? "egovframework/com/admin/menu_management_en" : "egovframework/com/admin/menu_management";
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
        } catch (Exception e) {
            log.error("Failed to save menu order. menuType={}, payload={}", normalizedMenuType, orderPayload, e);
            model.addAttribute("menuMgmtError", isEn ? "Failed to save menu order." : "메뉴 순서 저장에 실패했습니다.");
            populateMenuManagementModel(model, isEn, normalizedMenuType, codeId);
            return isEn ? "egovframework/com/admin/menu_management_en" : "egovframework/com/admin/menu_management";
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/menu-management?menuType=" + normalizedMenuType + "&saved=Y";
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
            menuFeatureManageService.deleteMenuFeature(normalizedFeatureCode);
        } catch (Exception e) {
            log.error("Failed to delete feature management. featureCode={}", normalizedFeatureCode, e);
            model.addAttribute("featureMgmtError", isEn ? "Failed to delete the feature." : "기능 삭제에 실패했습니다.");
            populateFunctionManagementModel(model, isEn, normalizedMenuType, codeId, searchMenuCode, searchKeyword);
            return isEn ? "egovframework/com/admin/function_management_en" : "egovframework/com/admin/function_management";
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/feature-management?menuType=" + normalizedMenuType + "&searchMenuCode=" + urlEncode(searchMenuCode) + "&searchKeyword=" + urlEncode(searchKeyword);
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
        String normalizedUrl = safeString(menuUrl);
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
        } catch (Exception e) {
            log.error("Failed to create page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to register the page." : "페이지 등록에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, null, null);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType;
    }

    @RequestMapping(value = "/page-management/update", method = RequestMethod.POST)
    public String updatePageManagement(
            @RequestParam(value = "menuType", defaultValue = "ADMIN") String menuType,
            @RequestParam(value = "code", required = false) String code,
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
        String normalizedUrl = safeString(menuUrl);
        String normalizedIcon = safeString(menuIcon);
        String normalizedUseAt = normalizeUseAt(useAt);

        String normalizedMenuType = normalizeMenuType(menuType);
        String codeId = resolveMenuCodeId(normalizedMenuType);
        if (normalizedCode.isEmpty() || normalizedUrl.isEmpty()) {
            model.addAttribute("pageMgmtError", isEn ? "Page code and URL are required." : "페이지 코드와 URL은 필수입니다.");
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
            adminCodeManageService.updatePageManagement(normalizedCode, normalizedUrl, normalizedIcon, normalizedUseAt, "admin");
        } catch (Exception e) {
            log.error("Failed to update page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to update the page URL." : "페이지 URL 수정에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType + "&searchKeyword=" + urlEncode(searchKeyword) + "&searchUrl=" + urlEncode(searchUrl);
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

        try {
            adminCodeManageService.deletePageManagement(codeId, normalizedCode);
        } catch (Exception e) {
            log.error("Failed to delete page management. code={}", normalizedCode, e);
            model.addAttribute("pageMgmtError", isEn ? "Failed to delete the page." : "페이지 삭제에 실패했습니다.");
            populatePageManagementModel(model, isEn, normalizedMenuType, codeId, searchKeyword, searchUrl);
            return isEn ? "egovframework/com/admin/page_management_en" : "egovframework/com/admin/page_management";
        }
        return "redirect:" + adminPrefix(request, locale) + "/system/page-management?menuType=" + normalizedMenuType + "&searchKeyword=" + urlEncode(searchKeyword) + "&searchUrl=" + urlEncode(searchUrl);
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

        model.addAttribute("pageRows", pageRows);
        model.addAttribute("menuType", menuType);
        model.addAttribute("domainOptions", loadPageDomainOptions(isEn, codeId));
        model.addAttribute("iconOptions", List.of(
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
        ));
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
        model.addAttribute("searchUrl", safeString(searchUrl));
    }

    private void populateFunctionManagementModel(Model model, boolean isEn, String menuType, String codeId, String searchMenuCode, String searchKeyword) {
        model.addAttribute("menuType", menuType);
        model.addAttribute("featurePageOptions", loadFeaturePageOptions(codeId));
        model.addAttribute("featureUserPageOptions", loadFeaturePageOptions(resolveMenuCodeId("USER")));
        model.addAttribute("featureAdminPageOptions", loadFeaturePageOptions(resolveMenuCodeId("ADMIN")));
        model.addAttribute("featureRows", loadFeatureManagementRows(codeId, searchMenuCode, searchKeyword));
        model.addAttribute("useAtOptions", List.of("Y", "N"));
        model.addAttribute("searchMenuCode", safeString(searchMenuCode));
        model.addAttribute("searchKeyword", safeString(searchKeyword));
    }

    private void populateMenuManagementModel(Model model, boolean isEn, String menuType, String codeId) {
        List<MenuInfoDTO> menuRows = loadMenuTreeRows(codeId);
        model.addAttribute("menuType", menuType);
        model.addAttribute("menuRows", menuRows);
        model.addAttribute("menuTypes", List.of(
                menuTypeOption("USER", isEn ? "Home" : "홈"),
                menuTypeOption("ADMIN", isEn ? "Admin" : "관리자")
        ));
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
            return adminCodeManageService.selectPageManagementList(codeId, searchKeyword, searchUrl);
        } catch (Exception e) {
            log.error("Failed to load page management rows.", e);
            return Collections.emptyList();
        }
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
        if ("USER".equals(menuType) && !menuCode.startsWith("H")) {
            return isEn ? "Home screen features must be mapped to home pages." : "홈 화면 기능은 홈 페이지에만 연결할 수 있습니다.";
        }
        if ("ADMIN".equals(menuType) && !menuCode.startsWith("A")) {
            return isEn ? "Admin screen features must be mapped to admin pages." : "관리자 화면 기능은 관리자 페이지에만 연결할 수 있습니다.";
        }
        if (!featureCode.matches("^[A-Z0-9_\\-]{2,30}$")) {
            return isEn
                    ? "Feature codes must be 2-30 characters using uppercase letters, numbers, underscores, or hyphens."
                    : "기능 코드는 2~30자의 영문 대문자, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.";
        }
        return "";
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


    private boolean isValidPageManagementUrl(String menuUrl, String menuType) {
        if ("USER".equals(menuType)) {
            return menuUrl.startsWith("/home") || menuUrl.startsWith("/en/home");
        }
        return menuUrl.startsWith("/admin/") || menuUrl.startsWith("/en/admin/");
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

    private String adminPrefix(HttpServletRequest request, Locale locale) {
        return isEnglishRequest(request, locale) ? "/en/admin" : "/admin";
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
}
