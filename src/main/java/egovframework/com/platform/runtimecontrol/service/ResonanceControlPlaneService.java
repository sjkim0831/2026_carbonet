package egovframework.com.platform.runtimecontrol.service;

import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyResultRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionCandidatesRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionPreviewRequest;
import egovframework.com.feature.admin.dto.request.ParityCompareRequest;
import egovframework.com.feature.admin.dto.request.RepairApplyRequest;
import egovframework.com.feature.admin.dto.request.RepairOpenRequest;
import egovframework.com.feature.admin.dto.request.VerificationMenuRequest;

import java.util.Map;

public interface ResonanceControlPlaneService {

    Map<String, Object> getParityCompare(ParityCompareRequest request) throws Exception;

    Map<String, Object> getModuleSelectionCandidates(ModuleSelectionCandidatesRequest request) throws Exception;

    Map<String, Object> getModuleSelectionPreview(ModuleSelectionPreviewRequest request) throws Exception;

    Map<String, Object> applyModuleSelection(ModuleSelectionApplyRequest request) throws Exception;

    Map<String, Object> getModuleSelectionApplyResult(ModuleSelectionApplyResultRequest request) throws Exception;

    Map<String, Object> openRepairSession(RepairOpenRequest request) throws Exception;

    Map<String, Object> applyRepair(RepairApplyRequest request) throws Exception;

    Map<String, Object> verifyMenuToRenderedScreen(VerificationMenuRequest request) throws Exception;
}
