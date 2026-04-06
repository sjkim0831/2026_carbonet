package egovframework.com.feature.admin.service;

import egovframework.com.feature.admin.dto.request.EmissionSurveyCaseSaveRequest;
import egovframework.com.feature.admin.dto.request.EmissionSurveyDraftSetSaveRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface AdminEmissionSurveyWorkbookService {

    Map<String, Object> getPagePayload(boolean isEn);

    Map<String, Object> parseWorkbook(MultipartFile uploadFile, boolean isEn);

    Map<String, Object> saveCaseDraft(EmissionSurveyCaseSaveRequest request, String actorId, boolean isEn);

    Map<String, Object> deleteCaseDraft(String sectionCode, String caseCode, boolean isEn);

    Map<String, Object> saveDraftSet(EmissionSurveyDraftSetSaveRequest request, String actorId, boolean isEn);

    Map<String, Object> deleteDraftSet(String setId, boolean isEn);

    byte[] buildBlankTemplateBytes();
}
