package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.CodexProvisionRequest;
import egovframework.com.feature.admin.dto.response.CodexExecutionHistoryResponse;
import egovframework.com.feature.admin.dto.response.CodexProvisionResponse;
import egovframework.com.feature.admin.model.vo.CodexAdminActorContextVO;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.admin.service.CodexExecutionAdminService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Controller
@RequestMapping({"/admin/system/codex-provision", "/en/admin/system/codex-provision"})
@RequiredArgsConstructor
@Slf4j
public class CodexProvisionAdminController {

    @Value("${security.codex.enabled:false}")
    private boolean codexEnabled;

    @Value("${security.codex.api-key:}")
    private String configuredApiKey;

    private final CodexExecutionAdminService codexExecutionAdminService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employeeMemberRepository;

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<?> login() {
        return validateInternalAvailability();
    }

    @PostMapping("/execute")
    @ResponseBody
    public ResponseEntity<?> execute(HttpServletRequest request,
                                     @RequestBody(required = false) CodexProvisionRequest provisionRequest) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }

        try {
            CodexProvisionResponse response = codexExecutionAdminService.execute(provisionRequest, resolveActorContext(request));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Admin Codex provisioning request rejected. reason={}", e.getMessage());
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Admin Codex provisioning failed.", e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Provisioning failed."));
        }
    }

    @GetMapping("/history")
    @ResponseBody
    public ResponseEntity<?> history() {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }

        try {
            return ResponseEntity.ok(codexExecutionAdminService.getRecentHistory(30));
        } catch (Exception e) {
            log.error("Failed to load Codex history.", e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to load history."));
        }
    }

    @PostMapping("/history/{logId}/inspect")
    @ResponseBody
    public ResponseEntity<?> inspect(@PathVariable("logId") String logId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }

        try {
            CodexExecutionHistoryResponse.CodexExecutionHistoryRow response = codexExecutionAdminService.inspect(logId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to inspect Codex history. logId={}", logId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Inspection failed."));
        }
    }

    @PostMapping("/history/{logId}/remediate")
    @ResponseBody
    public ResponseEntity<?> remediate(HttpServletRequest request, @PathVariable("logId") String logId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }

        try {
            CodexProvisionResponse response = codexExecutionAdminService.remediate(logId, resolveActorContext(request));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to remediate Codex history. logId={}", logId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Remediation failed."));
        }
    }

    private ResponseEntity<?> validateInternalAvailability() {
        if (!codexEnabled) {
            return ResponseEntity.status(503).body(errorBody("disabled", "Codex API is disabled."));
        }
        if (ObjectUtils.isEmpty(configuredApiKey) || configuredApiKey.trim().isEmpty()) {
            return ResponseEntity.status(503).body(errorBody("misconfigured", "Codex API key is not configured."));
        }
        return ResponseEntity.ok(successBody());
    }

    private Map<String, Object> successBody() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", "success");
        body.put("mode", "admin-proxy");
        return body;
    }

    private Map<String, Object> errorBody(String status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("message", message);
        return body;
    }

    private CodexAdminActorContextVO resolveActorContext(HttpServletRequest request) {
        CodexAdminActorContextVO context = new CodexAdminActorContextVO();
        String accessToken = request == null ? "" : safeString(jwtTokenProvider.getCookie(request, "accessToken"));
        String userId = extractCurrentUserId(accessToken);
        context.setActorUserId(userId);
        try {
            String authorCode = safeString(authGroupManageService.selectAuthorCodeByUserId(userId)).toUpperCase(Locale.ROOT);
            context.setActorAuthorCode(authorCode);
            context.setMaster("ROLE_SYSTEM_MASTER".equals(authorCode));
        } catch (Exception e) {
            log.warn("Failed to resolve Codex admin actor role. userId={}", userId, e);
        }
        try {
            context.setActorInsttId(employeeMemberRepository.findById(userId)
                    .map(EmplyrInfo::getInsttId)
                    .map(this::safeString)
                    .orElse(""));
        } catch (Exception e) {
            log.warn("Failed to resolve Codex admin actor company. userId={}", userId, e);
        }
        return context;
    }

    private String extractCurrentUserId(String accessToken) {
        if (safeString(accessToken).isEmpty()) {
            return "";
        }
        try {
            Claims claims = jwtTokenProvider.accessExtractClaims(accessToken);
            Object encryptedUserId = claims.get("userId");
            if (ObjectUtils.isEmpty(encryptedUserId)) {
                return "";
            }
            return safeString(jwtTokenProvider.decrypt(encryptedUserId.toString()));
        } catch (Exception e) {
            return "";
        }
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }
}
