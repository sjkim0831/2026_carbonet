package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import egovframework.com.feature.admin.service.AdminEmissionDefinitionStudioService;
import egovframework.com.feature.admin.service.AdminEmissionManagementService;
import egovframework.com.feature.admin.service.AdminEmissionManagementElementRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin/emission", "/en/admin/emission"})
@RequiredArgsConstructor
public class AdminEmissionSiteController {

    private final AdminShellBootstrapPageService adminShellBootstrapPageService;
    private final AdminEmissionDefinitionStudioService adminEmissionDefinitionStudioService;
    private final AdminEmissionManagementService adminEmissionManagementService;
    private final AdminEmissionManagementElementRegistryService adminEmissionManagementElementRegistryService;

    @RequestMapping(value = "/site-management", method = RequestMethod.GET)
    public String emissionSiteManagementPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-site-management");
    }

    @RequestMapping(value = "/management", method = RequestMethod.GET)
    public String emissionManagementPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-management");
    }

    @RequestMapping(value = "/definition-studio", method = RequestMethod.GET)
    public String emissionDefinitionStudioPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-definition-studio");
    }

    @GetMapping("/management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionManagementPageApi(HttpServletRequest request, Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("menuCode", "A0020107");
        payload.put("menuUrl", isEn ? "/en/admin/emission/management" : "/admin/emission/management");
        payload.put("pageTitle", "배출 변수 관리");
        payload.put("pageTitleEn", "Emission Variable Management");
        payload.put("pageDescription", "카테고리, Tier, 입력 세션, 계산 실행을 관리자 작업공간에서 직접 검증합니다.");
        payload.put("pageDescriptionEn", "Validate category, tier, input session, and calculation execution directly from the admin workspace.");
        payload.putAll(adminEmissionManagementElementRegistryService.buildRegistryPayload(isEn));
        payload.putAll(adminEmissionManagementService.getRolloutStatusSummary());
        Map<String, Object> definitionStudioPayload = adminEmissionDefinitionStudioService.buildPagePayload(isEn);
        payload.put("definitionDraftRows", definitionStudioPayload.get("definitionRows"));
        payload.put("definitionPolicyOptions", definitionStudioPayload.get("policyOptions"));
        payload.put("selectedDefinitionDraft", definitionStudioPayload.get("selectedDefinition"));
        payload.put("publishedDefinitionRows", adminEmissionDefinitionStudioService.buildPublishedDefinitionRows(isEn));
        payload.put("selectedPublishedDefinition", adminEmissionDefinitionStudioService.findLatestPublishedDefinition(isEn));
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/definition-studio/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionDefinitionStudioPageApi(HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(adminEmissionDefinitionStudioService.buildPagePayload(isEnglishRequest(request, locale)));
    }

    @GetMapping("/site-management/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionSiteManagementPageApi(HttpServletRequest request, Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildEmissionSiteManagementPageData(isEnglishRequest(request, locale))));
    }

    @RequestMapping(value = "/validate", method = RequestMethod.GET)
    public String emissionValidatePage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-validate");
    }

    @GetMapping("/validate/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionValidatePageApi(
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildEmissionValidatePageData(
                request == null ? "" : request.getParameter("pageIndex"),
                request == null ? "" : request.getParameter("resultId"),
                request == null ? "" : request.getParameter("searchKeyword"),
                request == null ? "" : request.getParameter("verificationStatus"),
                request == null ? "" : request.getParameter("priorityFilter"),
                isEnglishRequest(request, locale))));
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        String uri = request == null ? "" : safe(request.getRequestURI());
        if (uri.startsWith("/en/")) {
            return true;
        }
        return locale != null && Locale.ENGLISH.getLanguage().equalsIgnoreCase(locale.getLanguage());
    }

    private String redirectReactMigration(HttpServletRequest request, Locale locale, String route) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route == null ? "" : route.replace('-', '_'));
        String query = request == null ? "" : safe(request.getQueryString());
        if (!query.isEmpty()) {
            builder.append("&").append(query);
        }
        return builder.toString();
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

}
