package egovframework.com.feature.admin.web;

import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import egovframework.com.feature.admin.dto.request.EmissionSurveyDraftSetSaveRequest;
import egovframework.com.feature.admin.service.AdminEmissionSurveyWorkbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminEmissionSurveyApiController {

    private static final String DEFAULT_WORKBOOK_NAME = "데이터 수집 설문지 excel 양식_steel, electric, low-alloy.xlsx";
    private static final String BLANK_WORKBOOK_NAME = "데이터 수집 설문지 blank 양식_steel, electric, low-alloy.xlsx";
    private static final String SAMPLE_WORKBOOK_NAME = "데이터 수집 설문지 sample 양식_steel, electric, low-alloy.xlsx";
    private static final Path WORKSPACE_SAMPLE = Path.of("/opt/projects/carbonet", DEFAULT_WORKBOOK_NAME);
    private static final Path REFERENCE_SAMPLE = Path.of("/opt/reference/수식 설계 요", DEFAULT_WORKBOOK_NAME);

    private final AdminEmissionSurveyWorkbookService adminEmissionSurveyWorkbookService;

    @GetMapping({
            "/admin/emission/survey-admin/page-data",
            "/en/admin/emission/survey-admin/page-data"
    })
    public ResponseEntity<Map<String, Object>> getPageData(HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.getPagePayload(isEnglishRequest(request)));
    }

    @GetMapping({
            "/api/admin/emission-survey-admin/template-download",
            "/admin/api/admin/emission-survey-admin/template-download",
            "/en/admin/api/admin/emission-survey-admin/template-download"
    })
    public ResponseEntity<Resource> downloadTemplate() throws Exception {
        byte[] workbookBytes = adminEmissionSurveyWorkbookService.buildBlankTemplateBytes();
        return buildWorkbookResponse(workbookBytes, BLANK_WORKBOOK_NAME);
    }

    @GetMapping({
            "/api/admin/emission-survey-admin/sample-download",
            "/admin/api/admin/emission-survey-admin/sample-download",
            "/en/admin/api/admin/emission-survey-admin/sample-download"
    })
    public ResponseEntity<Resource> downloadSampleTemplate() throws Exception {
        Path templatePath = resolveTemplatePath();
        if (templatePath == null || !Files.exists(templatePath)) {
            return ResponseEntity.notFound().build();
        }
        InputStream inputStream = Files.newInputStream(templatePath);
        String fileName = SAMPLE_WORKBOOK_NAME;
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(Files.size(templatePath))
                .body(new InputStreamResource(inputStream));
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

    @PostMapping({
            "/api/admin/emission-survey-admin/draft-sets",
            "/admin/api/admin/emission-survey-admin/draft-sets",
            "/en/admin/api/admin/emission-survey-admin/draft-sets"
    })
    public ResponseEntity<Map<String, Object>> saveDraftSet(@RequestBody EmissionSurveyDraftSetSaveRequest request,
                                                            HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.saveDraftSet(
                request,
                resolveActorId(httpServletRequest),
                isEnglishRequest(httpServletRequest)
        ));
    }

    @DeleteMapping({
            "/api/admin/emission-survey-admin/case-drafts",
            "/admin/api/admin/emission-survey-admin/case-drafts",
            "/en/admin/api/admin/emission-survey-admin/case-drafts"
    })
    public ResponseEntity<Map<String, Object>> deleteCaseDraft(@RequestParam("sectionCode") String sectionCode,
                                                               @RequestParam("caseCode") String caseCode,
                                                               HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.deleteCaseDraft(sectionCode, caseCode, isEnglishRequest(request)));
    }

    @DeleteMapping({
            "/api/admin/emission-survey-admin/draft-sets",
            "/admin/api/admin/emission-survey-admin/draft-sets",
            "/en/admin/api/admin/emission-survey-admin/draft-sets"
    })
    public ResponseEntity<Map<String, Object>> deleteDraftSet(@RequestParam("setId") String setId,
                                                              HttpServletRequest request) {
        return ResponseEntity.ok(adminEmissionSurveyWorkbookService.deleteDraftSet(setId, isEnglishRequest(request)));
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

    private Path resolveTemplatePath() {
        if (Files.exists(REFERENCE_SAMPLE)) {
            return REFERENCE_SAMPLE;
        }
        if (Files.exists(WORKSPACE_SAMPLE)) {
            return WORKSPACE_SAMPLE;
        }
        return null;
    }

    private ResponseEntity<Resource> buildWorkbookResponse(byte[] workbookBytes, String fileName) throws Exception {
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(workbookBytes.length)
                .body(new InputStreamResource(new ByteArrayInputStream(workbookBytes)));
    }
}
