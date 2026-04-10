package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminCodeManageService;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.MenuFeatureManageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminFeatureManagementCommandService {

    private static final Logger log = LoggerFactory.getLogger(AdminFeatureManagementCommandService.class);

    private final AdminCodeManageService adminCodeManageService;
    private final MenuFeatureManageService menuFeatureManageService;
    private final AuthGroupManageService authGroupManageService;
    private final AdminReactRouteSupport adminReactRouteSupport;

    public String createFeatureManagement(
            String menuType,
            String menuCode,
            String featureCode,
            String featureNm,
            String featureNmEn,
            String featureDc,
            String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = adminReactRouteSupport.isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureNm = safeString(featureNm);
        String normalizedFeatureNmEn = safeString(featureNmEn);
        String normalizedFeatureDc = safeString(featureDc);
        String normalizedUseAt = normalizeUseAt(useAt);

        String error = validateFeatureManagementInput(
                normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedMenuType, isEn);
        if (!error.isEmpty()) {
            return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null, error);
        }

        try {
            if (menuFeatureManageService.countFeatureCode(normalizedFeatureCode) > 0) {
                return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null,
                        isEn ? "The feature code already exists." : "이미 등록된 기능 코드입니다.");
            }
            menuFeatureManageService.insertMenuFeature(
                    normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedFeatureDc, normalizedUseAt);
        } catch (Exception e) {
            log.error("Failed to create feature management. featureCode={}", normalizedFeatureCode, e);
            return redirectFunctionManagementError(request, locale, normalizedMenuType, normalizedMenuCode, null,
                    isEn ? "Failed to register the feature." : "기능 등록에 실패했습니다.");
        }

        return "redirect:" + adminPrefix(request, locale) + "/system/feature-management?menuType="
                + normalizedMenuType + "&searchMenuCode=" + urlEncode(normalizedMenuCode);
    }

    public ResponseEntity<Map<String, Object>> updateEnvironmentFeature(
            String menuType,
            String menuCode,
            String featureCode,
            String featureNm,
            String featureNmEn,
            String featureDc,
            String useAt,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = adminReactRouteSupport.isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
        String normalizedMenuCode = safeString(menuCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        String normalizedFeatureNm = safeString(featureNm);
        String normalizedFeatureNmEn = safeString(featureNmEn);
        String normalizedFeatureDc = safeString(featureDc);
        String normalizedUseAt = normalizeUseAt(useAt);

        Map<String, Object> response = new LinkedHashMap<>();
        String error = validateFeatureManagementInput(
                normalizedMenuCode, normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedMenuType, isEn);
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
                    normalizedFeatureCode, normalizedFeatureNm, normalizedFeatureNmEn, normalizedFeatureDc, normalizedUseAt);
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

    public ResponseEntity<Map<String, Object>> environmentFeatureImpact(
            String featureCode,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = adminReactRouteSupport.isEnglishRequest(request, locale);
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
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to load feature impact. featureCode={}", normalizedFeatureCode, e);
            response.put("success", false);
            response.put("message", isEn ? "Failed to load feature impact." : "기능 영향도를 불러오지 못했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    public String deleteFeatureManagement(
            String menuType,
            String featureCode,
            String searchMenuCode,
            String searchKeyword,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = adminReactRouteSupport.isEnglishRequest(request, locale);
        String normalizedMenuType = normalizeMenuType(menuType);
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

        return "redirect:" + adminPrefix(request, locale) + "/system/feature-management?menuType="
                + normalizedMenuType + "&searchMenuCode=" + urlEncode(searchMenuCode) + "&searchKeyword=" + urlEncode(searchKeyword);
    }

    public ResponseEntity<Map<String, Object>> deleteEnvironmentFeature(
            String featureCode,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = adminReactRouteSupport.isEnglishRequest(request, locale);
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

    private void deleteFeatureWithAssignments(String featureCode) throws Exception {
        String normalizedFeatureCode = safeString(featureCode).toUpperCase(Locale.ROOT);
        if (normalizedFeatureCode.isEmpty()) {
            return;
        }
        authGroupManageService.deleteAuthorFeatureRelationsByFeatureCode(normalizedFeatureCode);
        authGroupManageService.deleteUserFeatureOverridesByFeatureCode(normalizedFeatureCode);
        menuFeatureManageService.deleteMenuFeature(normalizedFeatureCode);
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
        redirect.append("&errorMessage=").append(urlEncode(errorMessage));
        return redirect.toString();
    }

    private void appendRedirectQuery(StringBuilder redirect, String name, String value) {
        String normalizedValue = safeString(value);
        if (!normalizedValue.isEmpty()) {
            redirect.append('&').append(name).append('=').append(urlEncode(normalizedValue));
        }
    }

    private String normalizeMenuType(String menuType) {
        return "USER".equalsIgnoreCase(safeString(menuType)) ? "USER" : "ADMIN";
    }

    private String resolveMenuCodeId(String menuType) {
        return "USER".equals(menuType) ? "HMENU1" : "AMENU1";
    }

    private String normalizeUseAt(String useAt) {
        String value = safeString(useAt).toUpperCase(Locale.ROOT);
        return "N".equals(value) ? "N" : "Y";
    }

    private String adminPrefix(HttpServletRequest request, Locale locale) {
        return adminReactRouteSupport.isEnglishRequest(request, locale) ? "/en/admin" : "/admin";
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(safeString(value), StandardCharsets.UTF_8);
    }

    private String safeString(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
