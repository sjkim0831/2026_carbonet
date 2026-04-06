package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import egovframework.com.feature.admin.service.AdminEmissionSurveyWorkbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminEmissionSurveyApiController {

    private final AdminEmissionSurveyWorkbookService adminEmissionSurveyWorkbookService;

    @GetMapping({
            "/admin/emission/survey-admin/page-data",
            "/en/admin/emission/survey-admin/page-data"
    })
    public ResponseEntity<Map<String, Object>> getPageData(HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.getPagePayload(isEnglishRequest(request)));
    }

    @PostMapping({
            "/api/admin/emission-survey-admin/parse-workbook",
            "/admin/api/admin/emission-survey-admin/parse-workbook",
            "/en/admin/api/admin/emission-survey-admin/parse-workbook"
    })
    public ResponseEntity<Map<String, Object>> parseWorkbook(@RequestParam("uploadFile") MultipartFile uploadFile,
                                                             HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.parseWorkbook(uploadFile, isEnglishRequest(request)));
    }

    @PostMapping({
            "/api/admin/emission-survey-admin/case-drafts",
            "/admin/api/admin/emission-survey-admin/case-drafts",
            "/en/admin/api/admin/emission-survey-admin/case-drafts"
    })
    public ResponseEntity<Map<String, Object>> saveCaseDraft(@RequestBody EmissionSurveyCaseSaveRequest request,
                                                             HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.saveCaseDraft(
                request,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest)
        ));
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", exception.getMessage()));
    }

    private boolean isEnglishRequest(HttpServletRequest request) {
        String uri = request == null ? "" : String.valueOf(request.getRequestURI());
        return uri.startsWith("/en/");
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
