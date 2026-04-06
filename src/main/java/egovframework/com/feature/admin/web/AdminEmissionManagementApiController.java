package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.EmissionManagementElementSaveRequest;
import egovframework.com.feature.admin.dto.request.EmissionInputSessionSaveRequest;
import egovframework.com.feature.admin.service.AdminEmissionManagementService;
import egovframework.com.feature.admin.service.AdminEmissionManagementElementRegistryService;
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
    private final AdminEmissionManagementElementRegistryService adminEmissionManagementElementRegistryService;

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

    @GetMapping("/element-definitions")
    public ResponseEntity<Map<String, Object>> getElementDefinitions(HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionManagementElementRegistryService.buildRegistryPayload(isEnglishRequest(request)));
    }

    @PostMapping("/element-definitions")
    public ResponseEntity<Map<String, Object>> saveElementDefinition(@RequestBody EmissionManagementElementSaveRequest request,
                                                                     HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionManagementElementRegistryService.saveElementDefinition(
                request,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest)
        ));
    }

    @PostMapping("/definition-scopes/{draftId}/materialize")
    public ResponseEntity<Map<String, Object>> materializeDefinitionScope(@PathVariable("draftId") String draftId,
                                                                          HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionManagementService.materializePublishedDefinitionScope(
                draftId,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest)
        ));
    }

    @GetMapping("/scopes/{categoryCode}/{tier}/status")
    public ResponseEntity<Map<String, Object>> getScopeStatus(@PathVariable("categoryCode") String categoryCode,
                                                              @PathVariable("tier") Integer tier,
                                                              HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionManagementService.getScopeStatus(
                categoryCode,
                tier,
                isEnglishRequest(httpServletRequest)
        ));
    }

    @PostMapping("/definition-scopes/{draftId}/precheck")
    public ResponseEntity<Map<String, Object>> precheckDefinitionScope(@PathVariable("draftId") String draftId,
                                                                       HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionManagementService.precheckPublishedDefinitionScope(
                draftId,
                isEnglishRequest(httpServletRequest)
        ));
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

    private boolean isEnglishRequest(HttpServletRequest request) {
        String uri = request == null ? "" : String.valueOf(request.getRequestURI());
        return uri.startsWith("/en/");
    }
}
