package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
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

    @RequestMapping(value = "/site-management", method = RequestMethod.GET)
    public String emissionSiteManagementPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-site-management");
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
