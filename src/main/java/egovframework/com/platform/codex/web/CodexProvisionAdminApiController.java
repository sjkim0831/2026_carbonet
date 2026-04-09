package egovframework.com.platform.codex.web;

import egovframework.com.common.security.AdminActionRateLimitService;
import egovframework.com.platform.codex.model.CodexAdminActorContext;
import egovframework.com.feature.admin.service.AuthGroupManageService;
import egovframework.com.feature.auth.domain.entity.EmplyrInfo;
import egovframework.com.feature.auth.domain.repository.EmployeeMemberRepository;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import egovframework.com.platform.codex.model.CodexExecutionHistoryResponse;
import egovframework.com.platform.codex.model.CodexProvisionResponse;
import egovframework.com.platform.codex.service.CodexExecutionAdminPort;
import egovframework.com.platform.request.codex.CodexProvisionRequest;
import egovframework.com.platform.workbench.service.SrTicketWorkbenchService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
@RequestMapping({
        "/admin/system/codex-request",
        "/en/admin/system/codex-request",
        "/admin/system/codex-provision",
        "/en/admin/system/codex-provision"
})
@RequiredArgsConstructor
@Slf4j
public class CodexProvisionAdminApiController {
    private static final int CODEX_EXECUTION_RATE_LIMIT = 5;
    private static final long CODEX_EXECUTION_WINDOW_SECONDS = 300L;

    @Value("${security.codex.enabled:false}")
    private boolean codexEnabled;

    @Value("${security.codex.api-key:}")
    private String configuredApiKey;

    private final CodexExecutionAdminPort codexExecutionAdminService;
    private final SrTicketWorkbenchService srTicketWorkbenchService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthGroupManageService authGroupManageService;
    private final EmployeeMemberRepository employeeMemberRepository;
    private final AdminActionRateLimitService adminActionRateLimitService;

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
        ResponseEntity<?> blocked = enforceCodexRateLimit(request, "execute");
        if (blocked != null) {
            return blocked;
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

    @GetMapping("/tickets")
    @ResponseBody
    public ResponseEntity<?> tickets() {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.getPage(""));
        } catch (Exception e) {
            log.error("Failed to load SR tickets for Codex request console.", e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to load SR tickets."));
        }
    }

    @GetMapping("/tickets/{ticketId}")
    @ResponseBody
    public ResponseEntity<?> ticketDetail(@PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.getTicketDetail(ticketId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to load SR ticket detail. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to load SR ticket detail."));
        }
    }

    @GetMapping("/tickets/{ticketId}/artifacts/{artifactType}")
    @ResponseBody
    public ResponseEntity<?> ticketArtifact(@PathVariable("ticketId") String ticketId,
                                            @PathVariable("artifactType") String artifactType) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.getTicketArtifact(ticketId, artifactType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to load SR ticket artifact. ticketId={} artifactType={}", ticketId, artifactType, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to load SR ticket artifact."));
        }
    }

    @PostMapping("/tickets/{ticketId}/prepare")
    @ResponseBody
    public ResponseEntity<?> prepareTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.prepareExecution(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to prepare SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to prepare SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/plan")
    @ResponseBody
    public ResponseEntity<?> planTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.planTicket(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to plan SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to plan SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/execute")
    @ResponseBody
    public ResponseEntity<?> executeTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        ResponseEntity<?> blocked = enforceCodexRateLimit(request, "execute-ticket");
        if (blocked != null) {
            return blocked;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.executeTicket(ticketId, resolveActorContext(request).getActorUserId(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to execute SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to execute SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/direct-execute")
    @ResponseBody
    public ResponseEntity<?> directExecuteTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        ResponseEntity<?> blocked = enforceCodexRateLimit(request, "direct-execute-ticket");
        if (blocked != null) {
            return blocked;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.directExecuteTicket(ticketId, resolveActorContext(request).getActorUserId(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to direct execute SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to direct execute SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/queue-direct-execute")
    @ResponseBody
    public ResponseEntity<?> queueDirectExecuteTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        ResponseEntity<?> blocked = enforceCodexRateLimit(request, "queue-direct-execute-ticket");
        if (blocked != null) {
            return blocked;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.queueDirectExecuteTicket(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to queue direct execute SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to queue SR ticket execution."));
        }
    }

    @PostMapping("/tickets/{ticketId}/skip-plan-execute")
    @ResponseBody
    public ResponseEntity<?> skipPlanExecuteTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        ResponseEntity<?> blocked = enforceCodexRateLimit(request, "skip-plan-execute-ticket");
        if (blocked != null) {
            return blocked;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.skipPlanExecuteTicket(ticketId, resolveActorContext(request).getActorUserId(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to skip-plan execute SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to skip-plan execute SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/rollback")
    @ResponseBody
    public ResponseEntity<?> rollbackTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.rollbackTicket(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to rollback SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to rollback SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/reissue")
    @ResponseBody
    public ResponseEntity<?> reissueTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.reissueTicket(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to reissue SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to reissue SR ticket."));
        }
    }

    @PostMapping("/tickets/{ticketId}/delete")
    @ResponseBody
    public ResponseEntity<?> deleteTicket(HttpServletRequest request, @PathVariable("ticketId") String ticketId) {
        ResponseEntity<?> availability = validateInternalAvailability();
        if (!availability.getStatusCode().is2xxSuccessful()) {
            return availability;
        }
        try {
            return ResponseEntity.ok(srTicketWorkbenchService.deleteTicket(ticketId, resolveActorContext(request).getActorUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody("fail", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete SR ticket. ticketId={}", ticketId, e);
            return ResponseEntity.internalServerError().body(errorBody("error", "Failed to delete SR ticket."));
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

    private CodexAdminActorContext resolveActorContext(HttpServletRequest request) {
        CodexAdminActorContext context = new CodexAdminActorContext();
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

    private ResponseEntity<?> enforceCodexRateLimit(HttpServletRequest request, String actionKey) {
        CodexAdminActorContext actorContext = resolveActorContext(request);
        String actorId = safeString(actorContext.getActorUserId());
        String remoteAddr = request == null ? "" : safeString(request.getRemoteAddr());
        String scope = "codex-execution:" + actionKey + ":" + (actorId.isEmpty() ? remoteAddr : actorId);
        AdminActionRateLimitService.RateLimitDecision decision =
                adminActionRateLimitService.check(scope, CODEX_EXECUTION_RATE_LIMIT, CODEX_EXECUTION_WINDOW_SECONDS);
        if (decision.isAllowed()) {
            return null;
        }
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(decision.getRetryAfterSeconds()))
                .body(errorBody("rate_limited", "Codex execution is temporarily throttled."));
    }
}
