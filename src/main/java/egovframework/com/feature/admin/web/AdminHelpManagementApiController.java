package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.common.help.HelpContentService;
import egovframework.com.common.help.HelpManagementSaveRequest;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/help-management")
public class AdminHelpManagementApiController {

    private final HelpContentService helpContentService;
    private final AuditTrailService auditTrailService;
    private final ScreenCommandCenterService screenCommandCenterService;
    private final ObjectMapper objectMapper;

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getHelpPage(
            @RequestParam(value = "pageId", required = false) String pageId) {
        return ResponseEntity.ok(helpContentService.getPageHelpForAdmin(pageId));
    }

    @GetMapping("/screen-command/page")
    public ResponseEntity<Map<String, Object>> getScreenCommandPage(
            @RequestParam(value = "pageId", required = false) String pageId) throws Exception {
        return ResponseEntity.ok(screenCommandCenterService.getScreenCommandPage(pageId));
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveHelpPage(
            @RequestBody HelpManagementSaveRequest request,
            HttpServletRequest httpServletRequest) {
        Map<String, Object> beforeState = helpContentService.getPageHelpForAdmin(request == null ? "" : request.getPageId());
        helpContentService.savePageHelp(request);
        Map<String, Object> afterState = helpContentService.getPageHelpForAdmin(request == null ? "" : request.getPageId());
        auditTrailService.record(
                resolveActorId(httpServletRequest),
                resolveActorRole(httpServletRequest),
                "A1900101",
                "help-management",
                "HELP_CONTENT_SAVE",
                "UI_HELP_PAGE",
                safe(request == null ? null : request.getPageId()),
                "SUCCESS",
                "Admin help content saved",
                safeJson(beforeState),
                safeJson(afterState),
                resolveRequestIp(httpServletRequest),
                httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("pageId", request == null ? "" : safe(request.getPageId()));
        response.put("message", "도움말을 저장했습니다.");
        return ResponseEntity.ok(response);
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
