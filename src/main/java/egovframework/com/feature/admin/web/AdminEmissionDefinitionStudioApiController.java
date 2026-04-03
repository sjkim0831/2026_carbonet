package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.EmissionDefinitionDraftSaveRequest;
import egovframework.com.feature.admin.service.AdminEmissionDefinitionStudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Locale;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping({
        "/api/admin/emission-definition-studio",
        "/admin/api/admin/emission-definition-studio",
        "/en/admin/api/admin/emission-definition-studio"
})
public class AdminEmissionDefinitionStudioApiController {

    private final AdminEmissionDefinitionStudioService adminEmissionDefinitionStudioService;

    @PostMapping("/drafts")
    public ResponseEntity<Map<String, Object>> saveDraft(@RequestBody EmissionDefinitionDraftSaveRequest request,
                                                         HttpServletRequest httpServletRequest,
                                                         Locale locale) {
        return ResponseEntity.ok(adminEmissionDefinitionStudioService.saveDraft(
                request,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest, locale)));
    }

    @PostMapping("/drafts/{draftId}/publish")
    public ResponseEntity<Map<String, Object>> publishDraft(@PathVariable("draftId") String draftId,
                                                            HttpServletRequest httpServletRequest,
                                                            Locale locale) {
        return ResponseEntity.ok(adminEmissionDefinitionStudioService.publishDraft(
                draftId,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest, locale)));
    }

    private boolean isEnglishRequest(HttpServletRequest request, Locale locale) {
        String uri = request == null ? "" : safe(request.getRequestURI());
        if (uri.startsWith("/en/")) {
            return true;
        }
        return locale != null && Locale.ENGLISH.getLanguage().equalsIgnoreCase(locale.getLanguage());
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
}
