package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.EmissionInputSessionSaveRequest;
import egovframework.com.feature.admin.service.AdminEmissionManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/api/admin/emission-management",
        "/admin/api/admin/emission-management",
        "/en/admin/api/admin/emission-management"
})
public class AdminEmissionManagementApiController {

    private final AdminEmissionManagementService adminEmissionManagementService;

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories(
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        return ResponseEntity.ok(adminEmissionManagementService.getCategoryList(searchKeyword));
    }

    @GetMapping("/categories/{categoryId}/tiers")
    public ResponseEntity<Map<String, Object>> getTiers(@PathVariable("categoryId") Long categoryId) {
        return ResponseEntity.ok(adminEmissionManagementService.getTierList(categoryId));
    }

    @GetMapping("/categories/{categoryId}/tiers/{tier}/variables")
    public ResponseEntity<Map<String, Object>> getVariableDefinitions(@PathVariable("categoryId") Long categoryId,
                                                                      @PathVariable("tier") Integer tier) {
        return ResponseEntity.ok(adminEmissionManagementService.getVariableDefinitions(categoryId, tier));
    }

    @PostMapping("/input-sessions")
    public ResponseEntity<Map<String, Object>> saveInputSession(@RequestBody EmissionInputSessionSaveRequest request,
                                                                HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionManagementService.saveInputSession(request, resolveActorId(httpServletRequest)));
    }

    @GetMapping("/input-sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getInputSession(@PathVariable("sessionId") Long sessionId) {
        return ResponseEntity.ok(adminEmissionManagementService.getInputSession(sessionId));
    }

    @PostMapping("/input-sessions/{sessionId}/calculate")
    public ResponseEntity<Map<String, Object>> calculateInputSession(@PathVariable("sessionId") Long sessionId) {
        return ResponseEntity.ok(adminEmissionManagementService.calculateInputSession(sessionId));
    }

    @GetMapping("/lime/default-factor")
    public ResponseEntity<Map<String, Object>> getLimeDefaultFactor() {
        return ResponseEntity.ok(adminEmissionManagementService.getLimeDefaultFactor());
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
}
