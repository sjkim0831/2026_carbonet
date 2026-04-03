package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.service.AdminShellBootstrapPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
public class AdminTradeController {

    private final AdminShellBootstrapPageService adminShellBootstrapPageService;

    @RequestMapping(value = "/trade/list", method = { RequestMethod.GET, RequestMethod.POST })
    public String tradeListPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "tradeStatus", required = false) String tradeStatus,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "trade-list");
    }

    @RequestMapping(value = "/trade/duplicate", method = { RequestMethod.GET, RequestMethod.POST })
    public String tradeDuplicatePage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "detectionType", required = false) String detectionType,
            @RequestParam(value = "reviewStatus", required = false) String reviewStatus,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "trade-duplicate");
    }

    @GetMapping("/trade/list/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tradeListPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "tradeStatus", required = false) String tradeStatus,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildTradeListPageData(
                pageIndexParam,
                searchKeyword,
                tradeStatus,
                settlementStatus,
                isEnglishRequest(request, locale))));
    }

    @RequestMapping(value = "/trade/statistics", method = { RequestMethod.GET, RequestMethod.POST })
    public String tradeStatisticsPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "periodFilter", required = false) String periodFilter,
            @RequestParam(value = "tradeType", required = false) String tradeType,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "trade-statistics");
    }

    @GetMapping("/trade/statistics/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tradeStatisticsPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "periodFilter", required = false) String periodFilter,
            @RequestParam(value = "tradeType", required = false) String tradeType,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildTradeStatisticsPageData(
                pageIndexParam,
                searchKeyword,
                periodFilter,
                tradeType,
                settlementStatus,
                isEnglishRequest(request, locale))));
    }

    @GetMapping("/trade/duplicate/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tradeDuplicatePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "detectionType", required = false) String detectionType,
            @RequestParam(value = "reviewStatus", required = false) String reviewStatus,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildTradeDuplicatePageData(
                pageIndexParam,
                searchKeyword,
                detectionType,
                reviewStatus,
                riskLevel,
                isEnglishRequest(request, locale))));
    }

    @RequestMapping(value = "/trade/approve", method = { RequestMethod.GET, RequestMethod.POST })
    public String tradeApprovePage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "approvalStatus", required = false) String approvalStatus,
            @RequestParam(value = "tradeType", required = false) String tradeType,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "trade-approve");
    }

    @GetMapping("/trade/approve/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tradeApprovePageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "approvalStatus", required = false) String approvalStatus,
            @RequestParam(value = "tradeType", required = false) String tradeType,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildTradeApprovePageData(
                pageIndexParam,
                searchKeyword,
                approvalStatus,
                tradeType,
                isEnglishRequest(request, locale))));
    }

    @RequestMapping(value = "/payment/settlement", method = { RequestMethod.GET, RequestMethod.POST })
    public String settlementCalendarPage(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "selectedMonth", required = false) String selectedMonth,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "settlement-calendar");
    }

    @GetMapping("/payment/settlement/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> settlementCalendarPageApi(
            @RequestParam(value = "pageIndex", required = false) String pageIndexParam,
            @RequestParam(value = "selectedMonth", required = false) String selectedMonth,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "settlementStatus", required = false) String settlementStatus,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildSettlementCalendarPageData(
                pageIndexParam,
                selectedMonth,
                searchKeyword,
                settlementStatus,
                riskLevel,
                isEnglishRequest(request, locale))));
    }

    @PostMapping("/api/admin/trade/approve/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitTradeApproveAction(
            @RequestBody(required = false) Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        Map<String, Object> response = new LinkedHashMap<>(adminShellBootstrapPageService.submitTradeApproveAction(
                payload,
                isEnglishRequest(request, locale)));
        boolean success = Boolean.TRUE.equals(response.get("success"));
        return ResponseEntity.status(success ? 200 : 400).body(response);
    }

    @RequestMapping(value = "/trade/reject", method = { RequestMethod.GET, RequestMethod.POST })
    public String tradeRejectPage(
            @RequestParam(value = "tradeId", required = false) String tradeId,
            @RequestParam(value = "returnUrl", required = false) String returnUrl,
            HttpServletRequest request,
            Locale locale) {
        return forwardReactMigration(request, locale, "trade-reject");
    }

    @GetMapping("/trade/reject/page-data")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> tradeRejectPageApi(
            @RequestParam(value = "tradeId", required = false) String tradeId,
            @RequestParam(value = "returnUrl", required = false) String returnUrl,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.buildTradeRejectPageData(
                tradeId,
                returnUrl,
                isEnglishRequest(request, locale))));
    }

    @PostMapping("/trade/reject/action")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitTradeRejectAction(
            @RequestBody(required = false) Map<String, Object> payload,
            HttpServletRequest request,
            Locale locale) {
        return ResponseEntity.ok(new LinkedHashMap<>(adminShellBootstrapPageService.submitTradeRejectAction(
                payload,
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
