package egovframework.com.feature.admin.web;

import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.trace.TraceEventSearchVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminObservabilityController {

    private final ObservabilityQueryService observabilityQueryService;

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

    @GetMapping("/api/admin/observability/audit-events")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchAuditEvents(
            @RequestParam(value = "pageIndex", required = false, defaultValue = "1") int pageIndex,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "actorId", required = false) String actorId,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
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
        response.put("items", observabilityQueryService.selectAuditEventList(searchVO));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/observability/trace-events")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchTraceEvents(
            @RequestParam(value = "pageIndex", required = false, defaultValue = "1") int pageIndex,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "functionId", required = false) String functionId,
            @RequestParam(value = "apiId", required = false) String apiId,
            @RequestParam(value = "eventType", required = false) String eventType,
            @RequestParam(value = "resultCode", required = false) String resultCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
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

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        if (request != null && safe(request.getRequestURI()).startsWith("/en/admin")) {
            return true;
        }
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage());
    }
}
