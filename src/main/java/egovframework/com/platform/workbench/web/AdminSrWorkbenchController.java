package egovframework.com.platform.workbench.web;

import egovframework.com.feature.home.web.ReactAppViewSupport;
import egovframework.com.platform.request.workbench.SrTicketApprovalRequest;
import egovframework.com.platform.request.workbench.SrTicketCreateRequest;
import egovframework.com.platform.request.workbench.SrTicketExecuteRequest;
import egovframework.com.platform.request.workbench.SrWorkbenchStackItemCreateRequest;
import egovframework.com.platform.service.workbench.SrTicketWorkbenchPort;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Locale;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AdminSrWorkbenchController {

    private final SrTicketWorkbenchPort srTicketWorkbenchService;
    private final ObjectProvider<ReactAppViewSupport> reactAppViewSupportProvider;

    @RequestMapping(value = {"/admin/system/sr-workbench", "/en/admin/system/sr-workbench"}, method = RequestMethod.GET)
    public String srWorkbenchPage(HttpServletRequest request, Locale locale, Model model) {
        boolean en = isEnglishRequest(request, locale);
        return reactAppViewSupportProvider.getObject().render(model, "sr-workbench", en, true);
    }

    @GetMapping({
            "/api/platform/workbench/page",
            "/en/api/platform/workbench/page",
            "/admin/api/platform/workbench/page",
            "/en/admin/api/platform/workbench/page",
            "/admin/api/admin/sr-workbench/page",
            "/en/admin/api/admin/sr-workbench/page"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPage(
            @RequestParam(value = "pageId", required = false) String pageId) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.getPage(pageId));
    }

    @PostMapping({
            "/api/platform/workbench/tickets",
            "/en/api/platform/workbench/tickets",
            "/admin/api/platform/workbench/tickets",
            "/en/admin/api/platform/workbench/tickets",
            "/admin/api/admin/sr-workbench/tickets",
            "/en/admin/api/admin/sr-workbench/tickets"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody(required = false) SrTicketCreateRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.createTicket(request, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/quick-execute",
            "/en/api/platform/workbench/quick-execute",
            "/admin/api/platform/workbench/quick-execute",
            "/en/admin/api/platform/workbench/quick-execute",
            "/admin/api/admin/sr-workbench/quick-execute",
            "/en/admin/api/admin/sr-workbench/quick-execute"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> quickExecuteTicket(
            @RequestBody(required = false) SrTicketCreateRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.quickExecuteTicket(request, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/stack-items",
            "/en/api/platform/workbench/stack-items",
            "/admin/api/platform/workbench/stack-items",
            "/en/admin/api/platform/workbench/stack-items",
            "/admin/api/admin/sr-workbench/stack-items",
            "/en/admin/api/admin/sr-workbench/stack-items"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> addStackItem(
            @RequestBody(required = false) SrWorkbenchStackItemCreateRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.addStackItem(request, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/stack-items/{stackItemId}/delete",
            "/en/api/platform/workbench/stack-items/{stackItemId}/delete",
            "/admin/api/platform/workbench/stack-items/{stackItemId}/delete",
            "/en/admin/api/platform/workbench/stack-items/{stackItemId}/delete",
            "/admin/api/admin/sr-workbench/stack-items/{stackItemId}/delete",
            "/en/admin/api/admin/sr-workbench/stack-items/{stackItemId}/delete"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> removeStackItem(
            @PathVariable("stackItemId") String stackItemId,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.removeStackItem(stackItemId, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/stack-items/clear",
            "/en/api/platform/workbench/stack-items/clear",
            "/admin/api/platform/workbench/stack-items/clear",
            "/en/admin/api/platform/workbench/stack-items/clear",
            "/admin/api/admin/sr-workbench/stack-items/clear",
            "/en/admin/api/admin/sr-workbench/stack-items/clear"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> clearStack(
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.clearStack(resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/approve",
            "/en/api/platform/workbench/tickets/{ticketId}/approve",
            "/admin/api/platform/workbench/tickets/{ticketId}/approve",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/approve",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/approve",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/approve"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> approveTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketApprovalRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.updateApproval(ticketId, request, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/prepare-execution",
            "/en/api/platform/workbench/tickets/{ticketId}/prepare-execution",
            "/admin/api/platform/workbench/tickets/{ticketId}/prepare-execution",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/prepare-execution",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/prepare-execution",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/prepare-execution"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> prepareExecution(
            @PathVariable("ticketId") String ticketId,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.prepareExecution(ticketId, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/plan",
            "/en/api/platform/workbench/tickets/{ticketId}/plan",
            "/admin/api/platform/workbench/tickets/{ticketId}/plan",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/plan",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/plan",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/plan"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> planTicket(
            @PathVariable("ticketId") String ticketId,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.planTicket(ticketId, resolveActorId(httpServletRequest)));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/execute",
            "/en/api/platform/workbench/tickets/{ticketId}/execute",
            "/admin/api/platform/workbench/tickets/{ticketId}/execute",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/execute",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/execute",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/execute"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> executeTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketExecuteRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        String approvalToken = request != null ? request.getApprovalToken() : null;
        return ResponseEntity.ok(srTicketWorkbenchService.executeTicket(ticketId, resolveActorId(httpServletRequest), approvalToken));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/direct-execute",
            "/en/api/platform/workbench/tickets/{ticketId}/direct-execute",
            "/admin/api/platform/workbench/tickets/{ticketId}/direct-execute",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/direct-execute",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/direct-execute",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/direct-execute"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> directExecuteTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketExecuteRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        String approvalToken = request != null ? request.getApprovalToken() : null;
        return ResponseEntity.ok(srTicketWorkbenchService.directExecuteTicket(ticketId, resolveActorId(httpServletRequest), approvalToken));
    }

    @PostMapping({
            "/api/platform/workbench/tickets/{ticketId}/skip-plan-execute",
            "/en/api/platform/workbench/tickets/{ticketId}/skip-plan-execute",
            "/admin/api/platform/workbench/tickets/{ticketId}/skip-plan-execute",
            "/en/admin/api/platform/workbench/tickets/{ticketId}/skip-plan-execute",
            "/admin/api/admin/sr-workbench/tickets/{ticketId}/skip-plan-execute",
            "/en/admin/api/admin/sr-workbench/tickets/{ticketId}/skip-plan-execute"
    })
    @ResponseBody
    public ResponseEntity<Map<String, Object>> skipPlanExecuteTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketExecuteRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        String approvalToken = request != null ? request.getApprovalToken() : null;
        return ResponseEntity.ok(srTicketWorkbenchService.skipPlanExecuteTicket(ticketId, resolveActorId(httpServletRequest), approvalToken));
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
