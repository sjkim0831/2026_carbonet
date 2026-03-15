package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditTrailService;
import egovframework.com.feature.admin.dto.request.FullStackGovernanceAutoCollectRequest;
import egovframework.com.feature.admin.dto.request.FullStackGovernanceSaveRequest;
import egovframework.com.feature.admin.service.FullStackGovernanceRegistryService;
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
@RequestMapping("/api/admin/full-stack-management")
public class AdminFullStackManagementApiController {

    private final FullStackGovernanceRegistryService fullStackGovernanceRegistryService;
    private final AuditTrailService auditTrailService;
    private final ObjectMapper objectMapper;

    @GetMapping("/registry")
    public ResponseEntity<Map<String, Object>> getRegistry(
            @RequestParam(value = "menuCode", required = false) String menuCode) {
        return ResponseEntity.ok(fullStackGovernanceRegistryService.getEntry(menuCode));
    }

    @PostMapping("/registry")
    public ResponseEntity<Map<String, Object>> saveRegistry(
            @RequestBody FullStackGovernanceSaveRequest request,
            HttpServletRequest httpServletRequest) {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
        Map<String, Object> beforeState = fullStackGovernanceRegistryService.getEntry(request == null ? "" : request.getMenuCode());
        Map<String, Object> saved = fullStackGovernanceRegistryService.saveEntry(request);
        auditTrailService.record(
                resolveActorId(httpServletRequest),
                resolveActorRole(httpServletRequest),
                "A1900101",
                "full-stack-management",
                "FULL_STACK_GOVERNANCE_SAVE",
                "FULL_STACK_GOVERNANCE_REGISTRY",
                safe(request == null ? null : request.getMenuCode()),
                "SUCCESS",
                "Full-stack governance registry saved",
                safeJson(beforeState),
                safeJson(saved),
                resolveRequestIp(httpServletRequest),
                httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
        );

        response.put("success", true);
        response.put("message", "풀스택 관리 메타데이터를 저장했습니다.");
        response.put("entry", saved);
        return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", safe(e.getMessage()));
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/registry/auto-collect")
    public ResponseEntity<Map<String, Object>> autoCollectRegistry(
            @RequestBody(required = false) FullStackGovernanceAutoCollectRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        Map<String, Object> response = new LinkedHashMap<>();
        try {
            Map<String, Object> beforeState = fullStackGovernanceRegistryService.getEntry(request == null ? "" : request.getMenuCode());
            Map<String, Object> collected = fullStackGovernanceRegistryService.autoCollectEntry(request);
            auditTrailService.record(
                    resolveActorId(httpServletRequest),
                    resolveActorRole(httpServletRequest),
                    "A1900101",
                    "platform-studio",
                    "FULL_STACK_GOVERNANCE_AUTO_COLLECT",
                    "FULL_STACK_GOVERNANCE_REGISTRY",
                    safe(request == null ? null : request.getMenuCode()),
                    "SUCCESS",
                    "Full-stack governance registry auto-collected",
                    safeJson(beforeState),
                    safeJson(collected),
                    resolveRequestIp(httpServletRequest),
                    httpServletRequest == null ? "" : safe(httpServletRequest.getHeader("User-Agent"))
            );
            response.put("success", true);
            response.put("message", "화면 메타데이터를 자동 수집해 거버넌스 레지스트리에 반영했습니다.");
            response.put("entry", collected);
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
