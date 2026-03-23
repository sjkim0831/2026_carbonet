package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyResultRequest;
import egovframework.com.feature.admin.dto.request.RepairApplyRequest;
import egovframework.com.feature.admin.dto.request.RepairOpenRequest;
import egovframework.com.feature.admin.dto.request.VerificationMenuRequest;
import egovframework.com.feature.admin.mapper.ResonanceControlPlaneMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

class ResonanceControlPlaneServiceImplTest {

    @TempDir
    Path tempDir;

    @Test
    void applyModuleSelectionPersistsProfileSpecificPreviewSummaries() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertModuleBindingPreview(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        ModuleSelectionApplyRequest request = new ModuleSelectionApplyRequest();
        request.setProjectId("proj-01");
        request.setScenarioId("scenario-alpha");
        request.setGuidedStateId("guided-01");
        request.setTemplateLineId("template-admin");
        request.setScreenFamilyRuleId("sfr-member-v1");
        request.setSelectionMode("INLINE_CHECK");
        request.setOperator("lane-06");
        request.setSelectedModuleSet(Arrays.asList("board-faq", "excel-export-extended"));

        Map<String, Object> response = service.applyModuleSelection(request);

        assertEquals(3, response.get("blockingIssueCount"));
        assertFalse((Boolean) response.get("readyForScaffoldYn"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertModuleBindingPreview(captor.capture());
        Map persisted = captor.getValue();
        assertTrue(String.valueOf(persisted.get("frontendImpactSummary")).contains("board-faq"));
        assertTrue(String.valueOf(persisted.get("frontendImpactSummary")).contains("excel-export-extended"));
        assertTrue(String.valueOf(persisted.get("backendImpactSummary")).contains("FAQ board controller/service/mapper chain"));
        assertTrue(String.valueOf(persisted.get("runtimePackageAttachPreview")).contains("TRACE_HOOK"));
        assertEquals("N", persisted.get("readyForApplyYn"));
    }

    @Test
    void openRepairSessionUsesGuidedStateForScenarioFamilyPersistence() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertRepairSession(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        RepairOpenRequest request = new RepairOpenRequest();
        request.setProjectId("proj-01");
        request.setReleaseUnitId("ru-01");
        request.setGuidedStateId("guided-state-06");
        request.setScreenFamilyRuleId("sfr-01");
        request.setOwnerLane("06");
        request.setSelectedScreenId("screen-runtime-gap");
        request.setSelectedElementSet(Arrays.asList("grid", "toolbar"));
        request.setCompareBaseline("CURRENT_RUNTIME");
        request.setReasonCode("PARITY_GAP");
        request.setExistingAssetReuseSet(Collections.singletonList("page-design.json"));
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");

        service.openRepairSession(request);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertRepairSession(captor.capture());
        assertEquals("guided-state-06-family", captor.getValue().get("scenarioFamilyId"));
    }

    @Test
    void getModuleSelectionApplyResultBuildsDerivedAssetsAndPersistsDbPayload() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertModuleBindingPreview(anyMap());
        doNothing().when(mapper).insertModuleBindingResult(anyMap());
        when(mapper.selectModuleBindingResultByPreviewId(anyString())).thenReturn(null);
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        ModuleSelectionApplyRequest applyRequest = new ModuleSelectionApplyRequest();
        applyRequest.setProjectId("proj-01");
        applyRequest.setScenarioId("scenario-alpha");
        applyRequest.setGuidedStateId("guided-01");
        applyRequest.setTemplateLineId("template-admin");
        applyRequest.setScreenFamilyRuleId("sfr-member-v1");
        applyRequest.setSelectionMode("POPUP_REVIEW");
        applyRequest.setOperator("lane-06");
        applyRequest.setSelectedModuleSet(Arrays.asList("board-faq", "excel-export-extended"));

        Map<String, Object> previewResponse = service.applyModuleSelection(applyRequest);

        ModuleSelectionApplyResultRequest resultRequest = new ModuleSelectionApplyResultRequest();
        resultRequest.setProjectId("proj-01");
        resultRequest.setScenarioId("scenario-alpha");
        resultRequest.setGuidedStateId("guided-01");
        resultRequest.setModuleBindingPreviewId(String.valueOf(previewResponse.get("moduleBindingPreviewId")));

        Map<String, Object> response = service.getModuleSelectionApplyResult(resultRequest);

        assertEquals("guided-01", response.get("guidedStateId"));
        assertEquals(Boolean.TRUE, response.get("selectionAppliedYn"));
        assertEquals(Arrays.asList("page-family:board-faq", "page-family:excel-export-extended"),
                response.get("attachedPageAssetSet"));
        assertEquals(Arrays.asList("db-draft:board-faq", "db-draft:excel-export-extended"),
                response.get("attachedDbAssetSet"));
        assertEquals(Boolean.TRUE, response.get("repairNeededYn"));
        assertEquals("Open repair workbench", response.get("nextRecommendedAction"));
        assertNotNull(response.get("releaseUnitId"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertModuleBindingResult(captor.capture());
        Map persisted = captor.getValue();
        assertEquals("scenario-alpha-family", persisted.get("scenarioFamilyId"));
        assertEquals("Y", persisted.get("selectionAppliedYn"));
        assertEquals("Y", persisted.get("repairNeededYn"));
        assertTrue(String.valueOf(persisted.get("attachedBackendAssetSetJson")).contains("backend-chain:board-faq"));
    }

    @Test
    void applyRepairFallsBackToRepairSessionContextForPersistence() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertRepairSession(anyMap());
        doNothing().when(mapper).insertRepairApplyRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        RepairOpenRequest openRequest = new RepairOpenRequest();
        openRequest.setProjectId("proj-01");
        openRequest.setReleaseUnitId("ru-01");
        openRequest.setGuidedStateId("guided-state-06");
        openRequest.setScreenFamilyRuleId("sfr-01");
        openRequest.setOwnerLane("06");
        openRequest.setSelectedScreenId("screen-runtime-gap");
        openRequest.setSelectedElementSet(Arrays.asList("grid", "toolbar"));
        openRequest.setCompareBaseline("CURRENT_RUNTIME");
        openRequest.setReasonCode("PARITY_GAP");
        openRequest.setExistingAssetReuseSet(Collections.singletonList("page-design.json"));
        openRequest.setRequestedBy("lane-06");
        openRequest.setRequestedByType("AI");

        Map<String, Object> openResponse = service.openRepairSession(openRequest);

        RepairApplyRequest applyRequest = new RepairApplyRequest();
        applyRequest.setRepairSessionId(String.valueOf(openResponse.get("repairSessionId")));
        applyRequest.setProjectId("proj-01");
        applyRequest.setGuidedStateId("guided-state-06");
        applyRequest.setScreenFamilyRuleId("sfr-01");
        applyRequest.setOwnerLane("06");
        applyRequest.setSelectedScreenId("screen-runtime-gap");
        applyRequest.setUpdatedAssetSet(Arrays.asList("page-runtime.json", "controller.java"));
        applyRequest.setUpdatedBindingSet(Collections.singletonList("binding:member-grid"));
        applyRequest.setPublishMode("REVIEW_READY");
        applyRequest.setRequestedBy("lane-06");
        applyRequest.setRequestedByType("AI");
        applyRequest.setChangeSummary("repair replay");

        Map<String, Object> response = service.applyRepair(applyRequest);

        assertEquals("ru-01", response.get("releaseUnitId"));
        assertEquals("guided-state-06", response.get("guidedStateId"));
        assertEquals(Arrays.asList("grid", "toolbar"), response.get("selectedElementSet"));
        assertEquals("CURRENT_RUNTIME", response.get("compareBaseline"));
        assertEquals(Boolean.TRUE, response.get("smokeRequiredYn"));
        assertEquals("APPLIED", response.get("status"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertRepairApplyRun(captor.capture());
        Map persisted = captor.getValue();
        assertEquals("guided-state-06-family", persisted.get("scenarioFamilyId"));
        assertEquals("Y", persisted.get("smokeRequiredYn"));
        assertEquals("Y", persisted.get("rollbackAnchorYn"));
        assertTrue(String.valueOf(persisted.get("updatedAssetTraceSetJson")).contains("trace-page-runtime-json"));
    }

    @Test
    void verifyMenuToRenderedScreenUsesGuidedStateForScenarioFamilyPersistence() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertVerificationRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        VerificationMenuRequest request = new VerificationMenuRequest();
        request.setProjectId("proj-01");
        request.setMenuId("ADMIN_DASHBOARD");
        request.setGuidedStateId("guided-verify-01");
        request.setOwnerLane("09");
        request.setTargetRuntime("GENERATED_TARGET");
        request.setReleaseUnitId("ru-02");
        request.setVerifyShellYn(Boolean.TRUE);
        request.setVerifyComponentYn(Boolean.TRUE);
        request.setVerifyBindingYn(Boolean.TRUE);
        request.setVerifyBackendYn(Boolean.TRUE);
        request.setVerifyHelpSecurityYn(Boolean.TRUE);
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");

        Map<String, Object> response = service.verifyMenuToRenderedScreen(request);

        assertEquals("PASS", response.get("result"));
        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertVerificationRun(captor.capture());
        assertEquals("guided-verify-01-family", captor.getValue().get("scenarioFamilyId"));
    }

    private void configureFileTargets(ResonanceControlPlaneServiceImpl service) {
        ReflectionTestUtils.setField(service, "modulePreviewFilePath", tempDir.resolve("module-preview.jsonl").toString());
        ReflectionTestUtils.setField(service, "parityCompareFilePath", tempDir.resolve("parity.jsonl").toString());
        ReflectionTestUtils.setField(service, "moduleResultFilePath", tempDir.resolve("module-result.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairSessionFilePath", tempDir.resolve("repair-session.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairApplyFilePath", tempDir.resolve("repair-apply.jsonl").toString());
        ReflectionTestUtils.setField(service, "verificationFilePath", tempDir.resolve("verification.jsonl").toString());
    }
}
