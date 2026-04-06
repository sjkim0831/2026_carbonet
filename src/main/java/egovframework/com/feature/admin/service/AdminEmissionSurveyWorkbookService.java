package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AdminEmissionSurveyWorkbookService {

    Map<String, Object> getPagePayload(boolean isEn);

    Map<String, Object> parseWorkbook(MultipartFile uploadFile, boolean isEn);

    Map<String, Object> saveCaseDraft(EmissionSurveyCaseSaveRequest request, String actorId, boolean isEn);
}
