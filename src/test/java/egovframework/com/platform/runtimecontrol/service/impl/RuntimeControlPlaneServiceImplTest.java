package egovframework.com.platform.runtimecontrol.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.platform.runtimecontrol.model.ParityCompareRequest;
import egovframework.com.platform.runtimecontrol.model.ProjectPipelineRunRequest;
import egovframework.com.platform.runtimecontrol.model.ProjectPipelineStatusRequest;
import egovframework.com.platform.runtimecontrol.model.RepairApplyRequest;
import egovframework.com.platform.runtimecontrol.model.RepairOpenRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RuntimeControlPlaneServiceImplTest {

    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE =
            new TypeReference<LinkedHashMap<String, Object>>() {};

    @TempDir
    Path tempDir;

    @Test
    void getParityCompareNormalizesPayloadAndPersistsJsonlRecord() throws Exception {
        RuntimeControlPlaneServiceImpl service = createService();

        ParityCompareRequest request = new ParityCompareRequest();
        request.setProjectId("proj-01");
        request.setGuidedStateId("guided-01");
        request.setTemplateLineId("template-runtime");
        request.setScreenFamilyRuleId("screen-family-runtime");
        request.setOwnerLane("project-binding");
        request.setSelectedScreenId("screen-runtime-main");
        request.setReleaseUnitId("rel-01");
        request.setCompareBaseline("CURRENT_RUNTIME");
        request.setRequestedBy("lane-06");
        request.setRequestedByType("AI");
        request.setSelectedElementSet(Arrays.asList("toolbar", " ", "grid"));
        request.setBuilderInput(mapOf("pageId", "runtime-page"));
        request.setRuntimeEvidence(mapOf("traceId", "runtime-trace-01"));

        Map<String, Object> response = service.getParityCompare(request);

        assertEquals("proj-01", response.get("projectId"));
        assertEquals(Arrays.asList("toolbar", "grid"), response.get("selectedElementSet"));
        assertEquals("runtime-page", map(response.get("builderInput")).get("pageId"));
        assertEquals("runtime-trace-01", map(response.get("runtimeEvidence")).get("traceId"));
        assertEquals("REPAIR_REQUIRED", response.get("result"));
        assertTrue(String.valueOf(response.get("traceId")).startsWith("trace-"));

        Map<String, Object> persisted = lastJsonLine(tempDir.resolve("parity-compare.jsonl"));
        assertEquals("proj-01", persisted.get("projectId"));
        assertEquals("template-runtime", persisted.get("templateLineId"));
        assertEquals("CURRENT_RUNTIME", persisted.get("compareBaseline"));
    }

    @Test
    void openRepairSessionCarriesReuseAssetsAndDefaultRecommendations() throws Exception {
        RuntimeControlPlaneServiceImpl service = createService();

        RepairOpenRequest request = new RepairOpenRequest();
        request.setProjectId("proj-02");
        request.setReleaseUnitId("rel-02");
        request.setExistingAssetReuseSet(Arrays.asList("page-design.json", "adapter-binding.json"));
        request.setBuilderInput(mapOf("pageId", "repair-page"));
        request.setRuntimeEvidence(mapOf("runtimeTraceId", "runtime-02"));

        Map<String, Object> response = service.openRepairSession(request);

        assertEquals("READY_FOR_REPAIR", response.get("result"));
        assertEquals("repair-page", map(response.get("builderInput")).get("pageId"));
        assertEquals("runtime-02", map(response.get("runtimeEvidence")).get("runtimeTraceId"));
        assertTrue(stringList(response.get("reuseRecommendationSet")).contains("page-design.json"));
        assertTrue(stringList(response.get("reuseRecommendationSet")).contains("reuse governed layout shell"));

        Map<String, Object> persisted = lastJsonLine(tempDir.resolve("repair-open.jsonl"));
        assertEquals("proj-02", persisted.get("projectId"));
        assertEquals("OPEN", persisted.get("status"));
    }

    @Test
    void applyRepairPersistsMergedArtifactsAndRecheckFlags() throws Exception {
        RuntimeControlPlaneServiceImpl service = createService();

        RepairApplyRequest request = new RepairApplyRequest();
        request.setProjectId("proj-03");
        request.setRepairSessionId("repair-03");
        request.setUpdatedAssetSet(Arrays.asList("asset/custom-panel"));
        request.setUpdatedBindingSet(Arrays.asList("binding:onLoad->customAction"));
        request.setUpdatedThemeOrLayoutSet(Arrays.asList("theme:custom.brand"));
        request.setSqlDraftSet(Arrays.asList("ALTER TABLE SAMPLE"));
        request.setPublishMode("CONTROLLED_PACKAGE");

        Map<String, Object> response = service.applyRepair(request);

        assertEquals("APPLIED", response.get("status"));
        assertEquals(Boolean.TRUE, response.get("parityRecheckRequiredYn"));
        assertTrue(stringList(response.get("updatedAssetTraceSet")).contains("asset/custom-panel"));
        assertTrue(stringList(response.get("updatedAssetTraceSet")).contains("asset/layout-shell"));
        assertTrue(stringList(response.get("updatedBindingSet")).contains("binding:onLoad->customAction"));
        assertTrue(stringList(response.get("updatedThemeOrLayoutSet")).contains("theme:custom.brand"));

        Map<String, Object> persisted = lastJsonLine(tempDir.resolve("repair-apply.jsonl"));
        assertEquals("proj-03", persisted.get("projectId"));
        assertEquals("repair-03", persisted.get("repairSessionId"));
        assertEquals("CONTROLLED_PACKAGE", persisted.get("publishMode"));
    }

    @Test
    void getProjectPipelineStatusReturnsLastMatchingStoredRun() throws Exception {
        RuntimeControlPlaneServiceImpl service = createService();

        ProjectPipelineRunRequest first = new ProjectPipelineRunRequest();
        first.setProjectId("proj-pipeline");
        first.setReleaseUnitPrefix("rel");
        first.setRuntimePackagePrefix("pkg");
        Map<String, Object> firstRun = service.runProjectPipeline(first);

        ProjectPipelineRunRequest second = new ProjectPipelineRunRequest();
        second.setProjectId("proj-pipeline");
        second.setReleaseUnitPrefix("rel");
        second.setRuntimePackagePrefix("pkg");
        second.setDeploymentTarget("ops-runtime-main-02");
        Map<String, Object> secondRun = service.runProjectPipeline(second);

        ProjectPipelineStatusRequest request = new ProjectPipelineStatusRequest();
        request.setProjectId("proj-pipeline");

        Map<String, Object> status = service.getProjectPipelineStatus(request);

        assertEquals(secondRun.get("pipelineRunId"), status.get("pipelineRunId"));
        assertEquals(secondRun.get("releaseUnitId"), status.get("releaseUnitId"));
        assertEquals("ops-runtime-main-02", map(status.get("deployContract")).get("deploymentTarget"));
        assertTrue(!String.valueOf(firstRun.get("pipelineRunId")).equals(String.valueOf(status.get("pipelineRunId"))));
    }

    private RuntimeControlPlaneServiceImpl createService() {
        RuntimeControlPlaneServiceImpl service = new RuntimeControlPlaneServiceImpl(new ObjectMapper(), null);
        ReflectionTestUtils.setField(service, "parityCompareStore", tempDir.resolve("parity-compare.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairOpenStore", tempDir.resolve("repair-open.jsonl").toString());
        ReflectionTestUtils.setField(service, "repairApplyStore", tempDir.resolve("repair-apply.jsonl").toString());
        ReflectionTestUtils.setField(service, "projectPipelineStore", tempDir.resolve("project-pipeline.jsonl").toString());
        return service;
    }

    private Map<String, Object> lastJsonLine(Path path) throws Exception {
        List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
        String line = lines.get(lines.size() - 1);
        return new ObjectMapper().readValue(line, MAP_TYPE);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> map(Object value) {
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private List<String> stringList(Object value) {
        return (List<String>) value;
    }

    private Map<String, Object> mapOf(String key, Object value) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put(key, value);
        return map;
    }
}
