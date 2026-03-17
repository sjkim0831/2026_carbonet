package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.SrTicketApprovalRequest;
import egovframework.com.feature.admin.dto.request.SrTicketCreateRequest;
import egovframework.com.feature.admin.dto.request.SrTicketExecuteRequest;
import egovframework.com.feature.admin.service.SrTicketWorkbenchService;
import egovframework.com.feature.home.web.ReactAppViewSupport;
import lombok.RequiredArgsConstructor;
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
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class AdminSrWorkbenchController {

    private final SrTicketWorkbenchService srTicketWorkbenchService;
    private final ReactAppViewSupport reactAppViewSupport;

    @RequestMapping(value = "/system/sr-workbench", method = RequestMethod.GET)
    public String srWorkbenchPage(HttpServletRequest request, Locale locale, Model model) {
        boolean en = isEnglishRequest(request, locale);
        reactAppViewSupport.populate(model, "sr-workbench", en, true);
        model.addAttribute("pageTitle", en ? "SR Workbench" : "SR 워크벤치");
        model.addAttribute("pageSubtitle", en
                ? "Issue SR tickets, review approvals, and prepare Codex execution in the shared admin workspace."
                : "공통 관리자 작업공간에서 SR 티켓 발행, 승인 검토, Codex 실행 준비를 처리합니다.");
        return en ? "egovframework/com/admin/sr_workbench_en" : "egovframework/com/admin/sr_workbench";
    }

    @GetMapping("/api/admin/sr-workbench/page")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPage(
            @RequestParam(value = "pageId", required = false) String pageId) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.getPage(pageId));
    }

    @PostMapping("/api/admin/sr-workbench/tickets")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody(required = false) SrTicketCreateRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.createTicket(request, resolveActorId(httpServletRequest)));
    }

    @PostMapping("/api/admin/sr-workbench/tickets/{ticketId}/approve")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> approveTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketApprovalRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.updateApproval(ticketId, request, resolveActorId(httpServletRequest)));
    }

    @PostMapping("/api/admin/sr-workbench/tickets/{ticketId}/prepare-execution")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> prepareExecution(
            @PathVariable("ticketId") String ticketId,
            HttpServletRequest httpServletRequest) throws Exception {
        return ResponseEntity.ok(srTicketWorkbenchService.prepareExecution(ticketId, resolveActorId(httpServletRequest)));
    }

    @PostMapping("/api/admin/sr-workbench/tickets/{ticketId}/execute")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> executeTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) SrTicketExecuteRequest request,
            HttpServletRequest httpServletRequest) throws Exception {
        String approvalToken = request != null ? request.getApprovalToken() : null;
        return ResponseEntity.ok(srTicketWorkbenchService.executeTicket(ticketId, resolveActorId(httpServletRequest), approvalToken));
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
