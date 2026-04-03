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
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminShellBootstrapPageService adminShellBootstrapPageService;

    @RequestMapping(value = "/payment/refund_list", method = { RequestMethod.GET, RequestMethod.POST })
    public String refundListPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "refund-list");
    }

    @GetMapping("/payment/refund_list/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refundListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildRefundListPageData(
                pageIndexParam,
                searchKeyword,
                status,
                riskLevel,
                isEnglishRequest(request, locale))));
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null && request.getRequestURI() != null && request.getRequestURI().startsWith("/en/admin")) {
            return true;
        }
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage());
    }

    private String forwardReactMigration(HttpServletRequest request, Locale locale, String route) {
        StringBuilder builder = new StringBuilder("forward:");
        builder.append(isEnglishRequest(request, locale) ? "/en/admin/app?route=" : "/admin/app?route=");
        builder.append(route);
        String query = request == null ? "" : request.getQueryString();
        if (query != null && !query.trim().isEmpty()) {
            builder.append("&").append(query.trim());
        }
        return builder.toString();
    }
}
