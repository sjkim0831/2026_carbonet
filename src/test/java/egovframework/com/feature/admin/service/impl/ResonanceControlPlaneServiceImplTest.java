package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyResultRequest;
import egovframework.com.feature.admin.dto.request.ParityCompareRequest;
import egovframework.com.feature.admin.dto.request.RepairApplyRequest;
import egovframework.com.feature.admin.dto.request.RepairOpenRequest;
import egovframework.com.feature.admin.dto.request.VerificationMenuRequest;
import egovframework.com.feature.admin.mapper.ResonanceControlPlaneMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Path;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

class ResonanceControlPlaneServiceImplTest {

    @TempDir
    Path tempDir;

    @Test
    void getParityComparePersistsTemplateLineAndComparePayloadToDb() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertParityCompareRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        ParityCompareRequest request = new ParityCompareRequest();
        request.setProjectId("proj-01");
        request.setGuidedStateId("guided-compare-01");
        request.setTemplateLineId("template-admin-runtime");
        request.setScreenFamilyRuleId("sfr-runtime-01");
        request.setOwnerLane("09");
        request.setSelectedScreenId("screen-runtime-01");
        request.setReleaseUnitId("ru-compare-01");
        request.setCompareBaseline("CURRENT_RUNTIME");
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");

        Map<String, Object> response = service.getParityCompare(request);

        assertEquals("template-admin-runtime", response.get("templateLineId"));
        assertEquals("ru-compare-01", response.get("releaseUnitId"));
        assertNotNull(response.get("traceId"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertParityCompareRun(captor.capture());
        assertEquals("template-admin-runtime", captor.getValue().get("templateLineId"));
        assertEquals("CURRENT_RUNTIME", captor.getValue().get("compareBaseline"));
        assertTrue(String.valueOf(captor.getValue().get("compareTargetSetJson")).contains("Template Line"));
        assertTrue(String.valueOf(captor.getValue().get("resultPayloadJson")).contains("template-admin-runtime"));
    }

    @Test
    void getParityCompareCarriesBuilderAndRuntimeContextForRepairHandoff() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertParityCompareRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        ParityCompareRequest request = new ParityCompareRequest();
        request.setProjectId("proj-01");
        request.setGuidedStateId("guided-compare-02");
        request.setTemplateLineId("template-admin-runtime");
        request.setScreenFamilyRuleId("sfr-runtime-02");
        request.setOwnerLane("09");
        request.setSelectedScreenId("screen-runtime-02");
        request.setReleaseUnitId("ru-compare-02");
        request.setCompareBaseline("PATCH_TARGET");
        request.setSelectedElementSet(Arrays.asList("toolbar", "grid"));
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");
        Map<String, Object> builderInput = new LinkedHashMap<String, Object>();
        builderInput.put("pageId", "admin-runtime-compare-page");
        builderInput.put("menuUrl", "/admin/runtime/compare");
        request.setBuilderInput(builderInput);
        Map<String, Object> runtimeEvidence = new LinkedHashMap<String, Object>();
        runtimeEvidence.put("currentRuntimeTraceId", "runtime-compare-02");
        request.setRuntimeEvidence(runtimeEvidence);

        Map<String, Object> response = service.getParityCompare(request);

        Map<?, ?> responseBuilderInput = (Map<?, ?>) response.get("builderInput");
        Map<?, ?> responseRuntimeEvidence = (Map<?, ?>) response.get("runtimeEvidence");
        assertEquals("admin-runtime-compare-page", responseBuilderInput.get("pageId"));
        assertEquals("/admin/runtime/compare", responseBuilderInput.get("menuUrl"));
        assertEquals("runtime-compare-02", responseRuntimeEvidence.get("currentRuntimeTraceId"));
        assertEquals(Integer.valueOf(2), responseRuntimeEvidence.get("currentNodeCount"));
        assertEquals(Arrays.asList("toolbar", "grid"), response.get("selectedElementSet"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertParityCompareRun(captor.capture());
        assertTrue(String.valueOf(captor.getValue().get("resultPayloadJson")).contains("admin-runtime-compare-page"));
        assertTrue(String.valueOf(captor.getValue().get("resultPayloadJson")).contains("runtime-compare-02"));
    }

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
        request.setOwnerLane("10");
        request.setReleaseUnitId("ru-module-01");
        request.setSelectionMode("INLINE_CHECK");
        request.setOperator("lane-06");
        request.setSelectedModuleSet(Arrays.asList("board-faq", "excel-export-extended"));

        Map<String, Object> response = service.applyModuleSelection(request);

        assertEquals(5, response.get("blockingIssueCount"));
        assertFalse((Boolean) response.get("readyForScaffoldYn"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertModuleBindingPreview(captor.capture());
        Map persisted = captor.getValue();
        assertTrue(String.valueOf(persisted.get("frontendImpactSummary")).contains("board-faq"));
        assertTrue(String.valueOf(persisted.get("frontendImpactSummary")).contains("excel-export-extended"));
        assertTrue(String.valueOf(persisted.get("backendImpactSummary")).contains("FAQ board controller/service/mapper chain"));
        assertTrue(String.valueOf(persisted.get("runtimePackageAttachPreview")).contains("TRACE_HOOK"));
        assertEquals("N", persisted.get("readyForApplyYn"));
        assertTrue(String.valueOf(persisted.get("blockingIssueSetJson")).contains("popup-member-selector: required module missing"));
        assertTrue(String.valueOf(persisted.get("blockingIssueSetJson")).contains("board-toolbar-common: required module missing"));
        assertTrue(String.valueOf(persisted.get("previewPayloadJson")).contains("\"ownerLane\":\"10\""));
        assertTrue(String.valueOf(persisted.get("previewPayloadJson")).contains("\"releaseUnitId\":\"ru-module-01\""));
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
        request.setTemplateLineId("template-admin-detail");
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
        assertEquals("template-admin-detail", captor.getValue().get("templateLineId"));
    }

    @Test
    void openRepairSessionMergesBuilderInputAndRuntimeEvidenceIntoResponsePayload() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertRepairSession(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        RepairOpenRequest request = new RepairOpenRequest();
        request.setProjectId("proj-01");
        request.setReleaseUnitId("ru-01");
        request.setGuidedStateId("guided-state-06");
        request.setTemplateLineId("template-admin-detail");
        request.setScreenFamilyRuleId("sfr-01");
        request.setOwnerLane("06");
        request.setSelectedScreenId("screen-runtime-gap");
        request.setSelectedElementSet(Arrays.asList("grid", "toolbar"));
        request.setCompareBaseline("CURRENT_RUNTIME");
        request.setReasonCode("PARITY_GAP");
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");
        Map<String, Object> builderInput = new LinkedHashMap<String, Object>();
        builderInput.put("pageId", "admin-member-detail-page");
        builderInput.put("menuUrl", "/admin/member/detail");
        request.setBuilderInput(builderInput);
        Map<String, Object> runtimeEvidence = new LinkedHashMap<String, Object>();
        runtimeEvidence.put("publishedVersionId", "published-ru-01");
        runtimeEvidence.put("currentRuntimeTraceId", "runtime-trace-01");
        request.setRuntimeEvidence(runtimeEvidence);

        Map<String, Object> response = service.openRepairSession(request);

        Map<?, ?> responseBuilderInput = (Map<?, ?>) response.get("builderInput");
        Map<?, ?> responseRuntimeEvidence = (Map<?, ?>) response.get("runtimeEvidence");
        assertEquals("admin-member-detail-page", responseBuilderInput.get("pageId"));
        assertEquals("/admin/member/detail", responseBuilderInput.get("menuUrl"));
        assertEquals("published-ru-01", responseRuntimeEvidence.get("publishedVersionId"));
        assertEquals("runtime-trace-01", responseRuntimeEvidence.get("currentRuntimeTraceId"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertRepairSession(captor.capture());
        assertTrue(String.valueOf(captor.getValue().get("sessionPayloadJson")).contains("admin-member-detail-page"));
        assertTrue(String.valueOf(captor.getValue().get("sessionPayloadJson")).contains("runtime-trace-01"));
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
        applyRequest.setOwnerLane("10");
        applyRequest.setReleaseUnitId("ru-module-01");
        applyRequest.setSelectionMode("POPUP_REVIEW");
        applyRequest.setOperator("lane-06");
        applyRequest.setSelectedModuleSet(Arrays.asList("board-faq", "excel-export-extended"));

        Map<String, Object> previewResponse = service.applyModuleSelection(applyRequest);

        ModuleSelectionApplyResultRequest resultRequest = new ModuleSelectionApplyResultRequest();
        resultRequest.setProjectId("proj-01");
        resultRequest.setScenarioId("scenario-alpha");
        resultRequest.setGuidedStateId("guided-01");
        resultRequest.setOwnerLane("10");
        resultRequest.setModuleBindingPreviewId(String.valueOf(previewResponse.get("moduleBindingPreviewId")));

        Map<String, Object> response = service.getModuleSelectionApplyResult(resultRequest);

        assertEquals("guided-01", response.get("guidedStateId"));
        assertEquals("10", response.get("ownerLane"));
        assertEquals(Boolean.TRUE, response.get("selectionAppliedYn"));
        assertEquals(Arrays.asList("page-family:board-faq", "page-family:excel-export-extended"),
                response.get("attachedPageAssetSet"));
        assertEquals(Arrays.asList("db-draft:board-faq", "db-draft:excel-export-extended"),
                response.get("attachedDbAssetSet"));
        assertEquals(Boolean.TRUE, response.get("repairNeededYn"));
        assertEquals("Open repair workbench", response.get("nextRecommendedAction"));
        assertEquals("ru-module-01", response.get("releaseUnitId"));
        assertEquals("rbt-ru-module-01-guided-01", response.get("releaseBindingTraceId"));
        assertEquals(response.get("publishedAssetTraceSet"), response.get("assetTraceSet"));
        assertEquals(Boolean.TRUE, response.get("rollbackAnchorYn"));
        assertEquals(response.get("occurredAt"), response.get("boundAt"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertModuleBindingResult(captor.capture());
        Map persisted = captor.getValue();
        assertEquals("scenario-alpha-family", persisted.get("scenarioFamilyId"));
        assertEquals("Y", persisted.get("selectionAppliedYn"));
        assertEquals("Y", persisted.get("repairNeededYn"));
        assertEquals("Y", persisted.get("rollbackAnchorYn"));
        assertTrue(String.valueOf(persisted.get("attachedBackendAssetSetJson")).contains("backend-chain:board-faq"));
        assertNotNull(persisted.get("occurredAt"));
    }

    @Test
    void getModuleSelectionApplyResultRehydratesExistingDbRowWithoutPayloadJson() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertModuleBindingPreview(anyMap());
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

        Map<String, Object> existingRow = new LinkedHashMap<String, Object>();
        existingRow.put("moduleBindingResultId", "mbr-existing-01");
        existingRow.put("moduleBindingPreviewId", previewResponse.get("moduleBindingPreviewId"));
        existingRow.put("traceId", "trace-existing-01");
        existingRow.put("projectId", "proj-01");
        existingRow.put("scenarioId", "scenario-alpha");
        existingRow.put("guidedStateId", "guided-01");
        existingRow.put("pageAssemblyId", "scenario-alpha-assembly");
        existingRow.put("templateLineId", "template-admin");
        existingRow.put("screenFamilyRuleId", "sfr-member-v1");
        existingRow.put("releaseUnitId", "proj-01-release-unit");
        existingRow.put("runtimePackageId", "scenario-alpha-runtime-package");
        existingRow.put("generationRunId", "scenario-alpha-generation-run");
        existingRow.put("selectionAppliedYn", "Y");
        existingRow.put("appliedModuleSetJson", "[\"board-faq\",\"excel-export-extended\"]");
        existingRow.put("attachedPageAssetSetJson", "[\"page-family:board-faq\",\"page-family:excel-export-extended\"]");
        existingRow.put("attachedComponentAssetSetJson", "[\"component-family:board-faq\",\"component-family:excel-export-extended\"]");
        existingRow.put("attachedBackendAssetSetJson", "[\"backend-chain:board-faq\",\"backend-chain:excel-export-extended\"]");
        existingRow.put("attachedDbAssetSetJson", "[\"db-draft:board-faq\",\"db-draft:excel-export-extended\"]");
        existingRow.put("runtimePackageImpactSummary", "Selected modules: board-faq, excel-export-extended");
        existingRow.put("releaseBlockerDeltaJson", "[\"css dedupe pending\",\"rollback sql missing\"]");
        existingRow.put("followUpChecklistSummary", "Repair workbench review and release blocker closure required.");
        existingRow.put("repairNeededYn", "Y");
        existingRow.put("repairQueueCount", 2);
        existingRow.put("repairSessionCandidateId", "repair-candidate-existing-01");
        existingRow.put("compareContextId", "cmpctx-existing-01");
        existingRow.put("publishedAssetTraceSetJson", "[\"published-asset-trace:board-faq\"]");
        existingRow.put("traceLinkSetJson", "[\"generation-trace:board-faq\"]");
        existingRow.put("nextRecommendedAction", "Open repair workbench");
        existingRow.put("rollbackAnchorYn", "Y");
        existingRow.put("occurredAt", "2026-03-24 23:00:00");
        existingRow.put("resultPayloadJson", "");
        when(mapper.selectModuleBindingResultByPreviewId(anyString())).thenReturn(existingRow);

        ModuleSelectionApplyResultRequest resultRequest = new ModuleSelectionApplyResultRequest();
        resultRequest.setProjectId("proj-01");
        resultRequest.setScenarioId("scenario-alpha");
        resultRequest.setGuidedStateId("guided-01");
        resultRequest.setOwnerLane("10");
        resultRequest.setModuleBindingPreviewId(String.valueOf(previewResponse.get("moduleBindingPreviewId")));

        Map<String, Object> response = service.getModuleSelectionApplyResult(resultRequest);

        assertEquals("mbr-existing-01", response.get("moduleBindingResultId"));
        assertEquals(Boolean.TRUE, response.get("selectionAppliedYn"));
        assertEquals(Arrays.asList("page-family:board-faq", "page-family:excel-export-extended"),
                response.get("attachedPageAssetSet"));
        assertEquals(Arrays.asList("backend-chain:board-faq", "backend-chain:excel-export-extended"),
                response.get("attachedBackendAssetSet"));
        assertEquals(Boolean.TRUE, response.get("repairNeededYn"));
        assertEquals(Integer.valueOf(2), response.get("repairQueueCount"));
        assertEquals("10", response.get("ownerLane"));
        assertEquals("rbt-proj-01-release-unit-guided-01", response.get("releaseBindingTraceId"));
        assertEquals(Arrays.asList("published-asset-trace:board-faq"), response.get("assetTraceSet"));
        assertEquals(Boolean.TRUE, response.get("rollbackAnchorYn"));
        assertEquals("2026-03-24 23:00:00", response.get("boundAt"));
        verify(mapper, never()).insertModuleBindingResult(anyMap());
    }

    @Test
    void getModuleSelectionApplyResultRecoversOwnerLaneFromPreviewPayloadWhenRequestOmitsIt() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertModuleBindingPreview(anyMap());
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
        applyRequest.setSelectedModuleSet(Collections.singletonList("board-faq"));

        Map<String, Object> previewResponse = service.applyModuleSelection(applyRequest);

        Map<String, Object> existingRow = new LinkedHashMap<String, Object>();
        existingRow.put("moduleBindingResultId", "mbr-existing-owner-lane");
        existingRow.put("moduleBindingPreviewId", previewResponse.get("moduleBindingPreviewId"));
        existingRow.put("traceId", "trace-existing-owner-lane");
        existingRow.put("projectId", "proj-01");
        existingRow.put("scenarioId", "scenario-alpha");
        existingRow.put("guidedStateId", "guided-01");
        existingRow.put("pageAssemblyId", "scenario-alpha-assembly");
        existingRow.put("templateLineId", "template-admin");
        existingRow.put("screenFamilyRuleId", "sfr-member-v1");
        existingRow.put("releaseUnitId", "proj-01-release-unit");
        existingRow.put("runtimePackageId", "scenario-alpha-runtime-package");
        existingRow.put("generationRunId", "scenario-alpha-generation-run");
        existingRow.put("selectionAppliedYn", "Y");
        existingRow.put("appliedModuleSetJson", "[\"board-faq\"]");
        existingRow.put("attachedPageAssetSetJson", "[\"page-family:board-faq\"]");
        existingRow.put("attachedComponentAssetSetJson", "[\"component-family:board-faq\"]");
        existingRow.put("attachedBackendAssetSetJson", "[\"backend-chain:board-faq\"]");
        existingRow.put("attachedDbAssetSetJson", "[\"db-draft:board-faq\"]");
        existingRow.put("runtimePackageImpactSummary", "Selected modules: board-faq");
        existingRow.put("releaseBlockerDeltaJson", "[]");
        existingRow.put("followUpChecklistSummary", "Repair workbench review and release blocker closure required.");
        existingRow.put("repairNeededYn", "Y");
        existingRow.put("repairQueueCount", 1);
        existingRow.put("repairSessionCandidateId", "repair-candidate-existing-06");
        existingRow.put("compareContextId", "cmpctx-existing-06");
        existingRow.put("publishedAssetTraceSetJson", "[\"published-asset-trace:board-faq\"]");
        existingRow.put("traceLinkSetJson", "[\"generation-trace:board-faq\"]");
        existingRow.put("nextRecommendedAction", "Open repair workbench");
        existingRow.put("rollbackAnchorYn", "Y");
        existingRow.put("occurredAt", "2026-03-24 23:30:00");
        existingRow.put("resultPayloadJson", "");
        when(mapper.selectModuleBindingResultByPreviewId(anyString())).thenReturn(existingRow);
        Map<String, Object> previewRow = new LinkedHashMap<String, Object>();
        previewRow.put("moduleBindingPreviewId", previewResponse.get("moduleBindingPreviewId"));
        previewRow.put("previewPayloadJson", "{\"ownerLane\":\"06\"}");
        when(mapper.selectModuleBindingPreviewById(anyString())).thenReturn(previewRow);

        ModuleSelectionApplyResultRequest request = new ModuleSelectionApplyResultRequest();
        request.setProjectId("proj-01");
        request.setScenarioId("scenario-alpha");
        request.setGuidedStateId("guided-01");
        request.setModuleBindingPreviewId(String.valueOf(previewResponse.get("moduleBindingPreviewId")));

        Map<String, Object> response = service.getModuleSelectionApplyResult(request);

        assertEquals("06", response.get("ownerLane"));
        assertEquals("rbt-proj-01-release-unit-guided-01", response.get("releaseBindingTraceId"));
        verify(mapper).selectModuleBindingPreviewById(anyString());
        verify(mapper, never()).insertModuleBindingResult(anyMap());
    }

    @Test
    void getModuleSelectionApplyResultEnrichesExistingFileRecordWithReleaseBindingEvidence() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        Path resultFile = tempDir.resolve("module-result.jsonl");
        Files.writeString(resultFile, "{\"moduleBindingPreviewId\":\"mbp-file-01\",\"projectId\":\"proj-01\","
                + "\"guidedStateId\":\"guided-01\",\"releaseUnitId\":\"ru-existing-01\","
                + "\"publishedAssetTraceSet\":[\"published-asset-trace:board-faq\"],"
                + "\"occurredAt\":\"2026-03-24 23:10:00\"}\n");

        ModuleSelectionApplyResultRequest request = new ModuleSelectionApplyResultRequest();
        request.setProjectId("proj-01");
        request.setScenarioId("scenario-alpha");
        request.setGuidedStateId("guided-01");
        request.setOwnerLane("10");
        request.setModuleBindingPreviewId("mbp-file-01");

        Map<String, Object> response = service.getModuleSelectionApplyResult(request);

        assertEquals("10", response.get("ownerLane"));
        assertEquals("rbt-ru-existing-01-guided-01", response.get("releaseBindingTraceId"));
        assertEquals(Arrays.asList("published-asset-trace:board-faq"), response.get("publishedAssetTraceSet"));
        assertEquals(response.get("publishedAssetTraceSet"), response.get("assetTraceSet"));
        assertEquals("2026-03-24 23:10:00", response.get("boundAt"));
        verify(mapper, never()).selectModuleBindingResultByPreviewId(anyString());
    }

    @Test
    void getModuleSelectionApplyResultEnrichesExistingDbPayloadJsonWithReleaseBindingEvidence() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertModuleBindingPreview(anyMap());
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
        applyRequest.setSelectedModuleSet(Arrays.asList("board-faq"));

        Map<String, Object> previewResponse = service.applyModuleSelection(applyRequest);

        Map<String, Object> existingRow = new LinkedHashMap<String, Object>();
        existingRow.put("moduleBindingPreviewId", previewResponse.get("moduleBindingPreviewId"));
        existingRow.put("resultPayloadJson", "{\"moduleBindingResultId\":\"mbr-existing-json-01\","
                + "\"projectId\":\"proj-01\",\"guidedStateId\":\"guided-01\","
                + "\"releaseUnitId\":\"ru-existing-json-01\","
                + "\"publishedAssetTraceSet\":[\"published-asset-trace:board-faq\"],"
                + "\"occurredAt\":\"2026-03-24 23:20:00\"}");
        when(mapper.selectModuleBindingResultByPreviewId(anyString())).thenReturn(existingRow);

        ModuleSelectionApplyResultRequest request = new ModuleSelectionApplyResultRequest();
        request.setProjectId("proj-01");
        request.setScenarioId("scenario-alpha");
        request.setGuidedStateId("guided-01");
        request.setOwnerLane("10");
        request.setModuleBindingPreviewId(String.valueOf(previewResponse.get("moduleBindingPreviewId")));

        Map<String, Object> response = service.getModuleSelectionApplyResult(request);

        assertEquals("mbr-existing-json-01", response.get("moduleBindingResultId"));
        assertEquals("10", response.get("ownerLane"));
        assertEquals("rbt-ru-existing-json-01-guided-01", response.get("releaseBindingTraceId"));
        assertEquals(Arrays.asList("published-asset-trace:board-faq"), response.get("assetTraceSet"));
        assertEquals("2026-03-24 23:20:00", response.get("boundAt"));
        verify(mapper, never()).insertModuleBindingResult(anyMap());
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
        openRequest.setTemplateLineId("template-admin-detail");
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
        applyRequest.setTemplateLineId("template-admin-detail");
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
        assertEquals("template-admin-detail", persisted.get("templateLineId"));
        assertEquals("Y", persisted.get("smokeRequiredYn"));
        assertEquals("Y", persisted.get("rollbackAnchorYn"));
        assertTrue(String.valueOf(persisted.get("updatedAssetTraceSetJson")).contains("trace-page-runtime-json"));
    }

    @Test
    void applyRepairMergesStoredAndRequestedPayloadContext() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertRepairSession(anyMap());
        doNothing().when(mapper).insertRepairApplyRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        RepairOpenRequest openRequest = new RepairOpenRequest();
        openRequest.setProjectId("proj-01");
        openRequest.setReleaseUnitId("ru-01");
        openRequest.setGuidedStateId("guided-state-06");
        openRequest.setTemplateLineId("template-admin-detail");
        openRequest.setScreenFamilyRuleId("sfr-01");
        openRequest.setOwnerLane("06");
        openRequest.setSelectedScreenId("screen-runtime-gap");
        openRequest.setSelectedElementSet(Arrays.asList("grid", "toolbar"));
        openRequest.setCompareBaseline("CURRENT_RUNTIME");
        openRequest.setReasonCode("PARITY_GAP");
        openRequest.setRequestedBy("lane-06");
        openRequest.setRequestedByType("AI");
        Map<String, Object> openBuilderInput = new LinkedHashMap<String, Object>();
        openBuilderInput.put("pageId", "admin-member-detail-page");
        openBuilderInput.put("menuUrl", "/admin/member/detail");
        openRequest.setBuilderInput(openBuilderInput);
        Map<String, Object> openRuntimeEvidence = new LinkedHashMap<String, Object>();
        openRuntimeEvidence.put("publishedVersionId", "published-ru-01");
        openRuntimeEvidence.put("currentRuntimeTraceId", "runtime-trace-01");
        openRequest.setRuntimeEvidence(openRuntimeEvidence);

        Map<String, Object> openResponse = service.openRepairSession(openRequest);

        RepairApplyRequest applyRequest = new RepairApplyRequest();
        applyRequest.setRepairSessionId(String.valueOf(openResponse.get("repairSessionId")));
        applyRequest.setProjectId("proj-01");
        applyRequest.setGuidedStateId("guided-state-06");
        applyRequest.setTemplateLineId("template-admin-detail");
        applyRequest.setScreenFamilyRuleId("sfr-01");
        applyRequest.setOwnerLane("06");
        applyRequest.setSelectedScreenId("screen-runtime-gap");
        applyRequest.setUpdatedAssetSet(Arrays.asList("page-runtime.json", "controller.java"));
        applyRequest.setUpdatedBindingSet(Collections.singletonList("binding:member-grid"));
        applyRequest.setPublishMode("REVIEW_READY");
        applyRequest.setRequestedBy("lane-06");
        applyRequest.setRequestedByType("AI");
        applyRequest.setChangeSummary("repair replay");
        Map<String, Object> applyBuilderInput = new LinkedHashMap<String, Object>();
        applyBuilderInput.put("draftVersionId", "draft-override-02");
        applyRequest.setBuilderInput(applyBuilderInput);
        Map<String, Object> applyRuntimeEvidence = new LinkedHashMap<String, Object>();
        applyRuntimeEvidence.put("currentNodeCount", 5);
        applyRequest.setRuntimeEvidence(applyRuntimeEvidence);

        Map<String, Object> response = service.applyRepair(applyRequest);

        Map<?, ?> responseBuilderInput = (Map<?, ?>) response.get("builderInput");
        Map<?, ?> responseRuntimeEvidence = (Map<?, ?>) response.get("runtimeEvidence");
        assertEquals("admin-member-detail-page", responseBuilderInput.get("pageId"));
        assertEquals("draft-override-02", responseBuilderInput.get("draftVersionId"));
        assertEquals("published-ru-01", responseRuntimeEvidence.get("publishedVersionId"));
        assertEquals(Integer.valueOf(5), responseRuntimeEvidence.get("currentNodeCount"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertRepairApplyRun(captor.capture());
        assertTrue(String.valueOf(captor.getValue().get("applyPayloadJson")).contains("draft-override-02"));
        assertTrue(String.valueOf(captor.getValue().get("applyPayloadJson")).contains("published-ru-01"));
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
        request.setTemplateLineId("template-admin-detail");
        request.setScreenFamilyRuleId("sfr-admin-dashboard");
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
        assertEquals("template-admin-detail", captor.getValue().get("templateLineId"));
    }

    @Test
    void verifyMenuToRenderedScreenPrefersGovernedBuilderInputPageAndMenuUrl() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertVerificationRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        VerificationMenuRequest request = new VerificationMenuRequest();
        request.setProjectId("proj-01");
        request.setMenuId("MENU_JOIN_MEMBER_INFO");
        request.setGuidedStateId("guided-verify-join");
        request.setTemplateLineId("template-public-join");
        request.setScreenFamilyRuleId("PUBLIC_JOIN_STEP");
        request.setOwnerLane("09");
        request.setTargetRuntime("MAIN_SERVER_CURRENT");
        request.setReleaseUnitId("ru-join-01");
        request.setVerifyShellYn(Boolean.TRUE);
        request.setVerifyComponentYn(Boolean.TRUE);
        request.setVerifyBindingYn(Boolean.TRUE);
        request.setVerifyBackendYn(Boolean.TRUE);
        request.setVerifyHelpSecurityYn(Boolean.TRUE);
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");

        Map<String, Object> builderInput = new LinkedHashMap<String, Object>();
        builderInput.put("pageId", "join-member-info-page");
        builderInput.put("menuUrl", "/member/join/info");
        request.setBuilderInput(builderInput);

        Map<String, Object> response = service.verifyMenuToRenderedScreen(request);

        assertEquals("join-member-info-page", response.get("pageId"));
        assertEquals("/member/join/info", response.get("routeId"));
        assertEquals("join-member-info-page", response.get("selectedScreenId"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertVerificationRun(captor.capture());
        assertEquals("join-member-info-page", captor.getValue().get("selectedScreenId"));
        assertTrue(String.valueOf(captor.getValue().get("resultPayloadJson")).contains("/member/join/info"));
    }

    @Test
    void verifyMenuToRenderedScreenCarriesRuntimeEvidenceAndSelectedElementPayload() throws Exception {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        doNothing().when(mapper).insertVerificationRun(anyMap());
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        VerificationMenuRequest request = new VerificationMenuRequest();
        request.setProjectId("proj-01");
        request.setMenuId("MENU_JOIN_MEMBER_INFO");
        request.setGuidedStateId("guided-verify-join");
        request.setTemplateLineId("template-public-join");
        request.setScreenFamilyRuleId("PUBLIC_JOIN_STEP");
        request.setOwnerLane("09");
        request.setTargetRuntime("PATCH_TARGET");
        request.setReleaseUnitId("ru-join-01");
        request.setSelectedElementSet(Arrays.asList("wizard", "terms"));
        request.setVerifyShellYn(Boolean.TRUE);
        request.setVerifyComponentYn(Boolean.TRUE);
        request.setVerifyBindingYn(Boolean.TRUE);
        request.setVerifyBackendYn(Boolean.TRUE);
        request.setVerifyHelpSecurityYn(Boolean.TRUE);
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");
        Map<String, Object> runtimeEvidence = new LinkedHashMap<String, Object>();
        runtimeEvidence.put("currentRuntimeTraceId", "runtime-join-02");
        request.setRuntimeEvidence(runtimeEvidence);

        Map<String, Object> response = service.verifyMenuToRenderedScreen(request);

        Map<?, ?> responseRuntimeEvidence = (Map<?, ?>) response.get("runtimeEvidence");
        assertEquals("runtime-join-02", responseRuntimeEvidence.get("currentRuntimeTraceId"));
        assertEquals(Integer.valueOf(2), responseRuntimeEvidence.get("currentNodeCount"));
        assertEquals(Arrays.asList("wizard", "terms"), response.get("selectedElementSet"));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(mapper).insertVerificationRun(captor.capture());
        assertTrue(String.valueOf(captor.getValue().get("selectedElementSetJson")).contains("wizard"));
        assertTrue(String.valueOf(captor.getValue().get("resultPayloadJson")).contains("runtime-join-02"));
    }

    @Test
    void verifyMenuToRenderedScreenRequiresScreenFamilyRuleIdPerGovernedContract() {
        ResonanceControlPlaneMapper mapper = mock(ResonanceControlPlaneMapper.class);
        ResonanceControlPlaneServiceImpl service = new ResonanceControlPlaneServiceImpl(new ObjectMapper(), mapper);
        configureFileTargets(service);

        VerificationMenuRequest request = new VerificationMenuRequest();
        request.setProjectId("proj-01");
        request.setMenuId("ADMIN_DASHBOARD");
        request.setGuidedStateId("guided-verify-01");
        request.setTemplateLineId("template-admin-detail");
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

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.verifyMenuToRenderedScreen(request));

        assertEquals("screenFamilyRuleId is required.", exception.getMessage());
    }

    private void configureFileTargets(ResonanceControlPlaneServiceImpl service) {
        ReflectionTestUtils.setField(service, "modulePreviewFilePath", tempDir.resolve("module-preview.jsonl").toString());
        ReflectionTestUtils.setField(service, "parityCompareFilePath", tempDir.resolve("parity-compare.jsonl").toString());
        ReflectionTestUtils.setField(service, "moduleResultFilePath", tempDir.resolve("module-result.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairSessionFilePath", tempDir.resolve("repair-session.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairApplyFilePath", tempDir.resolve("repair-apply.jsonl").toString());
        ReflectionTestUtils.setField(service, "verificationFilePath", tempDir.resolve("verification.jsonl").toString());
    }
}
