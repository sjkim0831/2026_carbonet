package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.feature.admin.dto.request.WbsManagementSaveRequest;
import egovframework.com.feature.admin.service.WbsManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/api/admin/wbs-management",
        "/admin/api/admin/wbs-management",
        "/en/admin/api/admin/wbs-management"
})
public class AdminWbsManagementApiController {

    private static final String MENU_CODE = "A1900104";

    private final WbsManagementService wbsManagementService;
    private final AuditTrailService auditTrailService;
    private final ObjectMapper objectMapper;

    @GetMapping("/excel")
    public ResponseEntity<byte[]> downloadExcel(@RequestParam(value = "menuType", required = false) String menuType,
                                                @RequestParam(value = "statusFilter", required = false) String statusFilter,
                                                @RequestParam(value = "searchKeyword", required = false) String searchKeyword) throws Exception {
        byte[] content = wbsManagementService.buildExcel(menuType, statusFilter, searchKeyword);
        String scope = "USER".equalsIgnoreCase(safe(menuType)) ? "home" : "admin";
        String baseName = "wbs_" + scope + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        String encoded = URLEncoder.encode(baseName, StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded);

        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }

    @PostMapping("/entry")
    public ResponseEntity<Map<String, Object>> saveEntry(@RequestBody WbsManagementSaveRequest request,
                                                         HttpServletRequest httpServletRequest) {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
            Map<String, Object> saved = wbsManagementService.saveEntry(request);
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    MENU_CODE,
                    "wbs-management",
                    "WBS_ENTRY_SAVE",
                    "WBS_MANAGEMENT_ENTRY",
                    safe(request == null ? null : request.getMenuCode()),
                    "SUCCESS",
                    "WBS management entry saved",
                    "",
                    safeJson(saved),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            response.put("success", true);
            response.put("message", "WBS 항목을 저장했습니다.");
            response.put("entry", saved);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", safe(e.getMessage()));
            return ResponseEntity.badRequest().body(response);
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
        String forwarded = safe(request.getHeader("X-Forwarded-For"));
        if (!forwarded.isEmpty()) {
            int commaIndex = forwarded.indexOf(',');
            return commaIndex >= 0 ? forwarded.substring(0, commaIndex).trim() : forwarded;
        }
        return safe(request.getRemoteAddr());
    }

    private String safeJson(Object value) {
        if (value == null) {
            return "";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "";
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
