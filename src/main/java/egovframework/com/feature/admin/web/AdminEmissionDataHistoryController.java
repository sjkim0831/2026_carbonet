package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin/emission", "/en/admin/emission"})
@RequiredArgsConstructor
public class AdminEmissionDataHistoryController {

    private final AdminShellBootstrapPageService adminShellBootstrapPageService;

    @RequestMapping(value = "/data_history", method = RequestMethod.GET)
    public String emissionDataHistoryPage(HttpServletRequest request, Locale locale) {
        return redirectReactMigration(request, locale, "emission-data-history");
    }

    @GetMapping("/data_history/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> emissionDataHistoryPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "changeType", required = false) String changeType,
            @RequestParam(value = "changeTarget", required = false) String changeTarget,
            HttpServletRequest request,
            Locale locale) {
        boolean isEn = isEnglishRequest(request, locale);
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildEmissionDataHistoryPageData(
                pageIndexParam,
                searchKeyword,
                changeType,
                changeTarget,
                isEn)));
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
