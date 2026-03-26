package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionApplyResultRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionCandidatesRequest;
import egovframework.com.feature.admin.dto.request.ModuleSelectionPreviewRequest;
import egovframework.com.feature.admin.dto.request.ParityCompareRequest;
import egovframework.com.feature.admin.dto.request.RepairApplyRequest;
import egovframework.com.feature.admin.dto.request.RepairOpenRequest;
import egovframework.com.feature.admin.dto.request.VerificationMenuRequest;
import egovframework.com.feature.admin.mapper.ResonanceControlPlaneMapper;
import egovframework.com.feature.admin.service.ResonanceControlPlaneService;
import egovframework.com.feature.admin.service.model.ControlPlaneCompareRow;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service("resonanceControlPlaneService")
@RequiredArgsConstructor
@Slf4j
public class ResonanceControlPlaneServiceImpl implements ResonanceControlPlaneService {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE = new TypeReference<LinkedHashMap<String, Object>>() {};
    private static final TypeReference<List<Object>> LIST_TYPE = new TypeReference<List<Object>>() {};

    private final ObjectMapper objectMapper;
    private final ResonanceControlPlaneMapper resonanceControlPlaneMapper;

    @Value("${security.resonance.control-plane.module-preview-file:/tmp/carbonet-resonance-module-preview.jsonl}")
    private String modulePreviewFilePath;

    @Value("${security.resonance.control-plane.parity-compare-file:/tmp/carbonet-resonance-parity-compare.jsonl}")
    private String parityCompareFilePath;

    @Value("${security.resonance.control-plane.module-result-file:/tmp/carbonet-resonance-module-result.jsonl}")
    private String moduleResultFilePath;

    @Value("${security.resonance.control-plane.repair-session-file:/tmp/carbonet-resonance-repair-session.jsonl}")
    private String repairSessionFilePath;

    @Value("${security.resonance.control-plane.repair-apply-file:/tmp/carbonet-resonance-repair-apply.jsonl}")
    private String repairApplyFilePath;

    @Value("${security.resonance.control-plane.verification-file:/tmp/carbonet-resonance-verification.jsonl}")
    private String verificationFilePath;

    private final ReentrantLock fileLock = new ReentrantLock();

    @Override
    public Map<String, Object> getParityCompare(ParityCompareRequest request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getOwnerLane(), "ownerLane");
        requireField(request == null ? null : request.getSelectedScreenId(), "selectedScreenId");

        List<String> selectedElementSet = normalizeList(request == null ? null : request.getSelectedElementSet());
        Map<String, Object> requestedBuilderInput = request == null ? Collections.<String, Object>emptyMap()
                : normalizeObjectMap(request.getBuilderInput());
        Map<String, Object> requestedRuntimeEvidence = request == null ? Collections.<String, Object>emptyMap()
                : normalizeObjectMap(request.getRuntimeEvidence());
        Map<String, Object> builderInput = mergeMap(buildDefaultBuilderInput(
                request == null ? null : request.getTemplateLineId(),
                request == null ? null : request.getSelectedScreenId(),
                request == null ? null : request.getSelectedScreenId(),
                request == null ? null : request.getSelectedScreenId(),
                ""),
                requestedBuilderInput);
        Map<String, Object> runtimeEvidence = mergeMap(buildDefaultRuntimeEvidence(
                request == null ? null : request.getReleaseUnitId(),
                firstNonBlank(request == null ? null : request.getCompareBaseline(), "CURRENT_RUNTIME"),
                selectedElementSet.size()),
                requestedRuntimeEvidence);
        List<ControlPlaneCompareRow> compareTargetSet = buildCompareTargetSet(request);
        List<String> blockerSet = buildCompareBlockerSet(compareTargetSet);
        List<String> repairCandidateSet = buildRepairCandidateSet(compareTargetSet);

        int mismatchCount = 0;
        for (ControlPlaneCompareRow row : compareTargetSet) {
            if (!"MATCH".equals(row.getResult())) {
                mismatchCount++;
            }
        }

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("compareContextId", buildId("cmpctx"));
        response.put("projectId", safe(request.getProjectId()));
        response.put("guidedStateId", safe(request.getGuidedStateId()));
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("ownerLane", safe(request.getOwnerLane()));
        response.put("selectedScreenId", safe(request.getSelectedScreenId()));
        response.put("releaseUnitId", safe(request.getReleaseUnitId()));
        response.put("compareBaseline", firstNonBlank(safe(request.getCompareBaseline()), "CURRENT_RUNTIME"));
        response.put("builderInput", builderInput);
        response.put("runtimeEvidence", runtimeEvidence);
        response.put("selectedElementSet", selectedElementSet);
        response.put("compareTargetSet", compareTargetSet);
        response.put("parityScore", Math.max(0, 100 - (mismatchCount * 3)));
        response.put("uniformityScore", Math.max(0, 100 - (blockerSet.size() * 4)));
        response.put("blockerSet", blockerSet);
        response.put("repairCandidateSet", repairCandidateSet);
        response.put("result", blockerSet.isEmpty() ? "PASS" : "WARN");
        response.put("requestedBy", safe(request.getRequestedBy()));
        response.put("requestedByType", safe(request.getRequestedByType()));
        response.put("occurredAt", now());
        response.put("traceId", buildTraceId());

        appendJsonLine(resolvePath(parityCompareFilePath), response);
        insertParityCompareRunDb(response);
        return response;
    }

    @Override
    public Map<String, Object> getModuleSelectionCandidates(ModuleSelectionCandidatesRequest request) {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getScenarioFamilyId(), "scenarioFamilyId");
        requireField(request == null ? null : request.getScenarioId(), "scenarioId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getPageDesignId(), "pageDesignId");
        requireField(request == null ? null : request.getThemeSetId(), "themeSetId");

        List<Map<String, Object>> candidates = new ArrayList<Map<String, Object>>();
        candidates.add(buildCandidate("popup-member-selector", "회원 선택 팝업", "POPUP_SELECTOR",
                "REQUIRED", true, true, true, true, false,
                "popup, search form, result grid"));
        candidates.add(buildCandidate("board-faq", "FAQ 게시판", "BOARD",
                "RECOMMENDED", false, true, false, true, true,
                "board page family + backend/DB/CSS"));
        candidates.add(buildCandidate("excel-export-extended", "확장 엑셀 내보내기", "EXPORT",
                "OPTIONAL", true, true, true, true, false,
                "toolbar action, download API, export audit trace"));

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("candidateModuleSet", candidates);
        return response;
    }

    @Override
    public Map<String, Object> getModuleSelectionPreview(ModuleSelectionPreviewRequest request) {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getScenarioId(), "scenarioId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getInstallableModuleId(), "installableModuleId");

        ModuleProfile profile = resolveModuleProfile(request.getInstallableModuleId());
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("installableModuleId", profile.installableModuleId);
        response.put("modulePatternFamilyId", profile.modulePatternFamilyId);
        response.put("moduleDepthProfileId", profile.moduleDepthProfileId);
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("dependencySet", new ArrayList<String>(profile.dependencySet));
        response.put("frontendImpactSummary", profile.frontendImpactSummary);
        response.put("backendImpactSummary", profile.backendImpactSummary);
        response.put("dbImpactSummary", profile.dbImpactSummary);
        response.put("cssImpactSummary", profile.cssImpactSummary);
        response.put("runtimePackageAttachPreview", profile.runtimePackageAttachPreview);
        response.put("rollbackPlanSummary", profile.rollbackPlanSummary);
        response.put("blockingIssueSet", new ArrayList<String>(profile.blockingIssueSet));
        return response;
    }

    @Override
    public Map<String, Object> applyModuleSelection(ModuleSelectionApplyRequest request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getScenarioId(), "scenarioId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getSelectionMode(), "selectionMode");
        requireField(request == null ? null : request.getOperator(), "operator");
        if (request == null || request.getSelectedModuleSet() == null || request.getSelectedModuleSet().isEmpty()) {
            throw new IllegalArgumentException("selectedModuleSet is required.");
        }

        String previewId = buildId("mbp");
        String traceId = buildTraceId();
        String releaseUnitId = firstNonBlank(request.getReleaseUnitId(), buildReleaseUnitId(request.getProjectId()));
        List<String> selectedModuleSet = normalizeList(request.getSelectedModuleSet());
        ModuleProfile primaryProfile = resolveModuleProfile(selectedModuleSet.isEmpty() ? "" : selectedModuleSet.get(0));
        List<String> blockingIssues = new ArrayList<String>();
        List<String> impactParts = new ArrayList<String>();
        List<ModuleProfile> selectedProfiles = resolveModuleProfiles(selectedModuleSet);
        List<String> missingRequiredModuleSet = findMissingRequiredModules(selectedModuleSet, selectedProfiles);

        for (String moduleId : selectedModuleSet) {
            ModuleProfile profile = resolveModuleProfile(moduleId);
            impactParts.add(profile.installableModuleId);
            if ("INLINE_CHECK".equalsIgnoreCase(safe(request.getSelectionMode())) && profile.requiresPopupReviewYn) {
                blockingIssues.add(profile.installableModuleId + ": popup review acknowledgment required");
            }
            blockingIssues.addAll(profile.blockingIssueSet);
        }

        for (String missingModuleId : missingRequiredModuleSet) {
            blockingIssues.add(missingModuleId + ": required module missing");
        }

        blockingIssues = normalizeList(blockingIssues);
        boolean readyForScaffold = blockingIssues.isEmpty();

        Map<String, Object> previewRecord = new LinkedHashMap<String, Object>();
        previewRecord.put("moduleBindingPreviewId", previewId);
        previewRecord.put("traceId", traceId);
        previewRecord.put("projectId", safe(request.getProjectId()));
        previewRecord.put("scenarioFamilyId", deriveScenarioFamilyId(request.getScenarioId()));
        previewRecord.put("scenarioId", safe(request.getScenarioId()));
        previewRecord.put("guidedStateId", safe(request.getGuidedStateId()));
        previewRecord.put("pageAssemblyId", derivePageAssemblyId(request.getScenarioId()));
        previewRecord.put("templateLineId", safe(request.getTemplateLineId()));
        previewRecord.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        previewRecord.put("ownerLane", safe(request.getOwnerLane()));
        previewRecord.put("releaseUnitId", releaseUnitId);
        previewRecord.put("themeSetId", deriveThemeSetId(request.getTemplateLineId()));
        previewRecord.put("installableModuleId", primaryProfile.installableModuleId);
        previewRecord.put("modulePatternFamilyId", primaryProfile.modulePatternFamilyId);
        previewRecord.put("moduleDepthProfileId", primaryProfile.moduleDepthProfileId);
        previewRecord.put("selectionMode", safe(request.getSelectionMode()).toUpperCase(Locale.ROOT));
        previewRecord.put("operator", safe(request.getOperator()));
        previewRecord.put("selectedModuleSet", selectedModuleSet);
        previewRecord.put("frontendImpactSummary", joinProfileValues(selectedProfiles, ProfileValueExtractor.FRONTEND));
        previewRecord.put("backendImpactSummary", joinProfileValues(selectedProfiles, ProfileValueExtractor.BACKEND));
        previewRecord.put("dbImpactSummary", joinProfileValues(selectedProfiles, ProfileValueExtractor.DB));
        previewRecord.put("cssImpactSummary", joinProfileValues(selectedProfiles, ProfileValueExtractor.CSS));
        previewRecord.put("runtimePackageAttachPreview", joinProfileValues(selectedProfiles, ProfileValueExtractor.RUNTIME));
        previewRecord.put("rollbackPlanSummary", joinProfileValues(selectedProfiles, ProfileValueExtractor.ROLLBACK));
        previewRecord.put("runtimePackageImpactSummary", "Selected modules: " + String.join(", ", impactParts));
        previewRecord.put("blockingIssueCount", blockingIssues.size());
        previewRecord.put("blockingIssueSet", blockingIssues);
        previewRecord.put("readyForScaffoldYn", readyForScaffold);
        previewRecord.put("occurredAt", now());

        appendJsonLine(resolvePath(modulePreviewFilePath), previewRecord);
        insertModuleBindingPreviewDb(previewRecord);

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("moduleBindingPreviewId", previewId);
        response.put("guidedStateId", safe(request.getGuidedStateId()));
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("ownerLane", safe(request.getOwnerLane()));
        response.put("releaseUnitId", releaseUnitId);
        response.put("selectedModuleSet", selectedModuleSet);
        response.put("runtimePackageImpactSummary", previewRecord.get("runtimePackageImpactSummary"));
        response.put("blockingIssueCount", blockingIssues.size());
        response.put("readyForScaffoldYn", readyForScaffold);
        return response;
    }

    @Override
    public Map<String, Object> getModuleSelectionApplyResult(ModuleSelectionApplyResultRequest request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getScenarioId(), "scenarioId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getModuleBindingPreviewId(), "moduleBindingPreviewId");

        Map<String, Object> existing = findLastRecord(resolvePath(moduleResultFilePath),
                "moduleBindingPreviewId", safe(request.getModuleBindingPreviewId()));
        if (!existing.isEmpty()) {
            return mergeModuleBindingResultRequestContext(enrichModuleBindingResult(existing), request);
        }
        existing = findExistingModuleBindingResult(safe(request.getModuleBindingPreviewId()));
        if (!existing.isEmpty()) {
            return mergeModuleBindingResultRequestContext(existing, request);
        }

        Map<String, Object> preview = findLastRecord(resolvePath(modulePreviewFilePath),
                "moduleBindingPreviewId", safe(request.getModuleBindingPreviewId()));
        if (preview.isEmpty()) {
            throw new IllegalArgumentException("moduleBindingPreviewId was not found.");
        }

        List<String> selectedModuleSet = normalizeObjectList(preview.get("selectedModuleSet"));
        List<String> attachedPageAssetSet = new ArrayList<String>();
        List<String> attachedComponentAssetSet = new ArrayList<String>();
        List<String> attachedBackendAssetSet = new ArrayList<String>();
        List<String> attachedDbAssetSet = new ArrayList<String>();
        List<String> traceLinkSet = new ArrayList<String>();
        List<String> jsonRevisionSet = new ArrayList<String>();
        List<String> publishedAssetTraceSet = new ArrayList<String>();

        for (String moduleId : selectedModuleSet) {
            attachedPageAssetSet.add("page-family:" + moduleId);
            attachedComponentAssetSet.add("component-family:" + moduleId);
            attachedBackendAssetSet.add("backend-chain:" + moduleId);
            attachedDbAssetSet.add("db-draft:" + moduleId);
            traceLinkSet.add("generation-trace:" + moduleId);
            jsonRevisionSet.add("json-revision:" + normalizeToken(moduleId));
            publishedAssetTraceSet.add("published-asset-trace:" + normalizeToken(moduleId));
        }

        boolean repairNeeded = !normalizeObjectList(preview.get("blockingIssueSet")).isEmpty();
        String traceId = firstNonBlank(safe(preview.get("traceId")), buildTraceId());
        String releaseUnitId = firstNonBlank(safe(preview.get("releaseUnitId")),
                safe(request.getReleaseUnitId()),
                buildReleaseUnitId(safe(request.getProjectId())));
        String runtimePackageId = deriveRuntimePackageId(safe(request.getScenarioId()));
        String generationRunId = buildGenerationRunId(safe(request.getScenarioId()));
        String compareContextId = "cmpctx-" + normalizeToken(safe(request.getModuleBindingPreviewId()));
        String repairSessionCandidateId = repairNeeded
                ? "repair-candidate-" + normalizeToken(safe(request.getModuleBindingPreviewId()))
                : "";
        String ownerLane = firstNonBlank(safe(preview.get("ownerLane")), safe(request.getOwnerLane()));
        String occurredAt = now();
        String releaseBindingTraceId = buildReleaseBindingTraceId(releaseUnitId, request.getGuidedStateId());
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("moduleBindingResultId", buildId("mbr"));
        result.put("traceId", traceId);
        result.put("projectId", safe(request.getProjectId()));
        result.put("scenarioId", safe(request.getScenarioId()));
        result.put("pageAssemblyId", safe(preview.get("pageAssemblyId")));
        result.put("moduleBindingPreviewId", safe(request.getModuleBindingPreviewId()));
        result.put("guidedStateId", safe(request.getGuidedStateId()));
        result.put("templateLineId", safe(preview.get("templateLineId")));
        result.put("screenFamilyRuleId", safe(preview.get("screenFamilyRuleId")));
        result.put("ownerLane", ownerLane);
        result.put("selectionAppliedYn", true);
        result.put("appliedModuleSet", selectedModuleSet);
        result.put("attachedPageAssetSet", attachedPageAssetSet);
        result.put("attachedComponentAssetSet", attachedComponentAssetSet);
        result.put("attachedBackendAssetSet", attachedBackendAssetSet);
        result.put("attachedDbAssetSet", attachedDbAssetSet);
        result.put("generationRunId", generationRunId);
        result.put("jsonRevisionSet", jsonRevisionSet);
        result.put("publishedAssetTraceSet", publishedAssetTraceSet);
        result.put("releaseUnitId", releaseUnitId);
        result.put("runtimePackageId", runtimePackageId);
        result.put("repairSessionCandidateId", repairSessionCandidateId);
        result.put("compareContextId", compareContextId);
        result.put("runtimePackageImpactSummary", safe(preview.get("runtimePackageImpactSummary")));
        result.put("releaseBlockerDelta", normalizeObjectList(preview.get("blockingIssueSet")));
        result.put("followUpChecklistSummary", repairNeeded
                ? "Repair workbench review and release blocker closure required."
                : "Ready for scaffold and runtime package attach review.");
        result.put("repairNeededYn", repairNeeded);
        result.put("repairQueueCount", repairNeeded ? normalizeObjectList(preview.get("blockingIssueSet")).size() : 0);
        result.put("nextRecommendedAction", repairNeeded ? "Open repair workbench" : "Continue to scaffold generate");
        result.put("traceLinkSet", traceLinkSet);
        result.put("releaseBindingTraceId", releaseBindingTraceId);
        result.put("assetTraceSet", publishedAssetTraceSet);
        result.put("rollbackAnchorYn", true);
        result.put("boundAt", occurredAt);
        result.put("occurredAt", occurredAt);

        appendJsonLine(resolvePath(moduleResultFilePath), result);
        insertModuleBindingResultDb(result, preview);
        return mergeModuleBindingResultRequestContext(result, request);
    }

    @Override
    public Map<String, Object> openRepairSession(RepairOpenRequest request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getReleaseUnitId(), "releaseUnitId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getOwnerLane(), "ownerLane");
        requireField(request == null ? null : request.getSelectedScreenId(), "selectedScreenId");
        requireField(request == null ? null : request.getCompareBaseline(), "compareBaseline");
        requireField(request == null ? null : request.getReasonCode(), "reasonCode");
        requireField(request == null ? null : request.getRequestedBy(), "requestedBy");
        requireField(request == null ? null : request.getRequestedByType(), "requestedByType");

        List<String> blockingGapSet = deriveBlockingGapSet(request.getReasonCode(), request.getSelectedElementSet());
        List<String> reuseRecommendationSet = normalizeList(request.getExistingAssetReuseSet());
        List<String> requiredContractSet = new ArrayList<String>(Arrays.asList(
                "page-design.json",
                "page-assembly.json",
                "backend-chain-manifest"
        ));
        if (!"CURRENT_RUNTIME".equalsIgnoreCase(safe(request.getCompareBaseline()))) {
            requiredContractSet.add("compare-baseline-manifest");
        }

        String repairSessionId = buildId("repair");
        Map<String, Object> builderInput = mergeMap(buildDefaultBuilderInput(
                request == null ? null : request.getTemplateLineId(),
                request == null ? null : request.getSelectedScreenId(),
                request == null ? null : request.getSelectedScreenId(),
                "",
                ""),
                request == null ? null : request.getBuilderInput());
        Map<String, Object> runtimeEvidence = mergeMap(buildDefaultRuntimeEvidence(
                request == null ? null : request.getReleaseUnitId(),
                "CURRENT_RUNTIME",
                normalizeList(request == null ? null : request.getSelectedElementSet()).size()),
                request == null ? null : request.getRuntimeEvidence());
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("repairSessionId", repairSessionId);
        response.put("projectId", safe(request.getProjectId()));
        response.put("guidedStateId", safe(request.getGuidedStateId()));
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("ownerLane", safe(request.getOwnerLane()));
        response.put("selectedScreenId", safe(request.getSelectedScreenId()));
        response.put("builderInput", builderInput);
        response.put("runtimeEvidence", runtimeEvidence);
        response.put("selectedElementSet", normalizeList(request.getSelectedElementSet()));
        response.put("compareSnapshotId", buildId("cmp"));
        response.put("blockingGapSet", blockingGapSet);
        response.put("reuseRecommendationSet", reuseRecommendationSet);
        response.put("requiredContractSet", requiredContractSet);
        response.put("status", resolveRepairOpenStatus(blockingGapSet, request));
        response.put("result", response.get("status"));
        response.put("releaseUnitId", safe(request.getReleaseUnitId()));
        response.put("compareBaseline", safe(request.getCompareBaseline()));
        response.put("reasonCode", safe(request.getReasonCode()));
        response.put("requestedBy", safe(request.getRequestedBy()));
        response.put("requestedByType", safe(request.getRequestedByType()));
        response.put("requestNote", safe(request.getRequestNote()));
        response.put("occurredAt", now());
        response.put("traceId", buildTraceId());

        appendJsonLine(resolvePath(repairSessionFilePath), response);
        insertRepairSessionDb(response, request);
        return response;
    }

    @Override
    public Map<String, Object> applyRepair(RepairApplyRequest request) throws Exception {
        requireField(request == null ? null : request.getRepairSessionId(), "repairSessionId");
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getOwnerLane(), "ownerLane");
        requireField(request == null ? null : request.getSelectedScreenId(), "selectedScreenId");
        requireField(request == null ? null : request.getPublishMode(), "publishMode");
        requireField(request == null ? null : request.getRequestedBy(), "requestedBy");
        requireField(request == null ? null : request.getRequestedByType(), "requestedByType");

        List<String> updatedAssetSet = normalizeList(request.getUpdatedAssetSet());
        List<String> updatedAssetTraceSet = new ArrayList<String>();
        for (String asset : updatedAssetSet) {
            updatedAssetTraceSet.add("trace-" + normalizeToken(asset));
        }

        Map<String, Object> repairSession = findLastRecord(resolvePath(repairSessionFilePath),
                "repairSessionId", safe(request.getRepairSessionId()));
        List<String> selectedElementSet = normalizeList(request.getSelectedElementSet());
        if (selectedElementSet.isEmpty()) {
            selectedElementSet = normalizeObjectList(repairSession.get("selectedElementSet"));
        }
        String compareBaseline = firstNonBlank(request.getCompareBaseline(),
                safe(repairSession.get("compareBaseline")),
                "PATCH_TARGET");
        String releaseUnitId = firstNonBlank(request.getReleaseUnitId(),
                safe(repairSession.get("releaseUnitId")));
        requireField(releaseUnitId, "releaseUnitId");
        Map<String, Object> builderInput = mergeMap(
                buildDefaultBuilderInput(
                        request == null ? null : request.getTemplateLineId(),
                        request == null ? null : request.getSelectedScreenId(),
                        request == null ? null : request.getSelectedScreenId(),
                        "",
                        ""),
                normalizeObjectMap(repairSession.get("builderInput")),
                request == null ? null : request.getBuilderInput());
        Map<String, Object> runtimeEvidence = mergeMap(
                normalizeObjectMap(repairSession.get("runtimeEvidence")),
                buildDefaultRuntimeEvidence(releaseUnitId, "PATCH_TARGET", selectedElementSet.size()),
                request == null ? null : request.getRuntimeEvidence());
        String updatedReleaseCandidateId = buildUpdatedReleaseCandidateId(request.getProjectId(), releaseUnitId);

        boolean smokeRequired = !"DRAFT_ONLY".equalsIgnoreCase(safe(request.getPublishMode()));
        boolean hasAnyRepairUpdate = hasRepairUpdate(request);
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("repairApplyRunId", buildId("repair-apply"));
        response.put("repairSessionId", safe(request.getRepairSessionId()));
        response.put("guidedStateId", safe(request.getGuidedStateId()));
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("ownerLane", safe(request.getOwnerLane()));
        response.put("builderInput", builderInput);
        response.put("runtimeEvidence", runtimeEvidence);
        response.put("updatedAssetTraceSet", updatedAssetTraceSet);
        response.put("updatedReleaseCandidateId", updatedReleaseCandidateId);
        response.put("parityRecheckRequiredYn", true);
        response.put("uniformityRecheckRequiredYn", true);
        response.put("smokeRequiredYn", smokeRequired);
        response.put("status", resolveRepairApplyStatus(hasAnyRepairUpdate, updatedAssetTraceSet));
        response.put("result", response.get("status"));
        response.put("projectId", safe(request.getProjectId()));
        response.put("releaseUnitId", releaseUnitId);
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("selectedScreenId", safe(request.getSelectedScreenId()));
        response.put("selectedElementSet", selectedElementSet);
        response.put("updatedBindingSet", normalizeList(request.getUpdatedBindingSet()));
        response.put("updatedThemeOrLayoutSet", normalizeList(request.getUpdatedThemeOrLayoutSet()));
        response.put("sqlDraftSet", normalizeList(request.getSqlDraftSet()));
        response.put("publishMode", safe(request.getPublishMode()));
        response.put("requestedBy", safe(request.getRequestedBy()));
        response.put("requestedByType", safe(request.getRequestedByType()));
        response.put("changeSummary", safe(request.getChangeSummary()));
        response.put("compareBaseline", compareBaseline);
        response.put("occurredAt", now());
        response.put("traceId", buildTraceId());

        appendJsonLine(resolvePath(repairApplyFilePath), response);
        insertRepairApplyRunDb(response);
        return response;
    }

    @Override
    public Map<String, Object> verifyMenuToRenderedScreen(VerificationMenuRequest request) throws Exception {
        requireField(request == null ? null : request.getProjectId(), "projectId");
        requireField(request == null ? null : request.getMenuId(), "menuId");
        requireField(request == null ? null : request.getGuidedStateId(), "guidedStateId");
        requireField(request == null ? null : request.getTemplateLineId(), "templateLineId");
        requireField(request == null ? null : request.getScreenFamilyRuleId(), "screenFamilyRuleId");
        requireField(request == null ? null : request.getOwnerLane(), "ownerLane");
        requireField(request == null ? null : request.getTargetRuntime(), "targetRuntime");
        requireField(request == null ? null : request.getReleaseUnitId(), "releaseUnitId");
        requireField(request == null ? null : request.getRequestedBy(), "requestedBy");
        requireField(request == null ? null : request.getRequestedByType(), "requestedByType");
        requireFlag(request == null ? null : request.getVerifyShellYn(), "verifyShellYn");
        requireFlag(request == null ? null : request.getVerifyComponentYn(), "verifyComponentYn");
        requireFlag(request == null ? null : request.getVerifyBindingYn(), "verifyBindingYn");
        requireFlag(request == null ? null : request.getVerifyBackendYn(), "verifyBackendYn");
        requireFlag(request == null ? null : request.getVerifyHelpSecurityYn(), "verifyHelpSecurityYn");

        Map<String, Object> requestedBuilderInput = request == null ? Collections.<String, Object>emptyMap()
                : normalizeObjectMap(request.getBuilderInput());
        String selectedScreenId = firstNonBlank(request.getSelectedScreenId(),
                safe(requestedBuilderInput.get("pageId")),
                derivePageIdFromMenuId(request.getMenuId()));
        String pageId = firstNonBlank(safe(requestedBuilderInput.get("pageId")), selectedScreenId,
                derivePageIdFromMenuId(request.getMenuId()));
        String routeId = firstNonBlank(safe(requestedBuilderInput.get("menuUrl")), deriveRouteId(pageId));
        String componentCoverageState = coverageState(request.getVerifyComponentYn());
        String bindingCoverageState = coverageState(request.getVerifyBindingYn());
        String backendChainState = coverageState(request.getVerifyBackendYn());
        String helpSecurityState = coverageState(request.getVerifyHelpSecurityYn());
        List<String> selectedElementSet = normalizeList(request.getSelectedElementSet());
        Map<String, Object> builderInput = mergeMap(buildDefaultBuilderInput(
                request == null ? null : request.getTemplateLineId(),
                selectedScreenId,
                pageId,
                safe(request.getMenuId()),
                deriveRouteId(pageId)),
                requestedBuilderInput);
        Map<String, Object> runtimeEvidence = mergeMap(buildDefaultRuntimeEvidence(
                request == null ? null : request.getReleaseUnitId(),
                request == null ? null : request.getTargetRuntime(),
                selectedElementSet.size()),
                request == null ? null : request.getRuntimeEvidence());
        List<String> blockerSet = new ArrayList<String>();

        if (!Boolean.TRUE.equals(request.getVerifyShellYn())) {
            blockerSet.add("shell verification skipped");
        }
        if (!Boolean.TRUE.equals(request.getVerifyComponentYn())) {
            blockerSet.add("component verification skipped");
        }
        if (!Boolean.TRUE.equals(request.getVerifyBindingYn())) {
            blockerSet.add("binding verification skipped");
        }
        if (!Boolean.TRUE.equals(request.getVerifyBackendYn())) {
            blockerSet.add("backend verification skipped");
        }
        if (!Boolean.TRUE.equals(request.getVerifyHelpSecurityYn())) {
            blockerSet.add("help/security verification skipped");
        }
        String result = resolveVerificationResult(request, blockerSet);

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("verificationRunId", buildId("verify"));
        response.put("menuId", safe(request.getMenuId()));
        response.put("pageId", pageId);
        response.put("routeId", routeId);
        response.put("templateLineId", safe(request.getTemplateLineId()));
        response.put("screenFamilyRuleId", safe(request.getScreenFamilyRuleId()));
        response.put("shellProfileId", deriveShellProfileId(request.getTargetRuntime()));
        response.put("pageFrameId", derivePageFrameId(pageId));
        response.put("builderInput", builderInput);
        response.put("runtimeEvidence", runtimeEvidence);
        response.put("componentCoverageState", componentCoverageState);
        response.put("bindingCoverageState", bindingCoverageState);
        response.put("backendChainState", backendChainState);
        response.put("helpSecurityState", helpSecurityState);
        response.put("blockerSet", blockerSet);
        response.put("ownerLane", safe(request.getOwnerLane()));
        response.put("result", result);
        response.put("projectId", safe(request.getProjectId()));
        response.put("guidedStateId", safe(request.getGuidedStateId()));
        response.put("targetRuntime", safe(request.getTargetRuntime()));
        response.put("releaseUnitId", safe(request.getReleaseUnitId()));
        response.put("selectedScreenId", selectedScreenId);
        response.put("selectedElementSet", selectedElementSet);
        response.put("compareBaseline", firstNonBlank(request.getCompareBaseline(), "CURRENT_RUNTIME"));
        response.put("requestedBy", safe(request.getRequestedBy()));
        response.put("requestedByType", safe(request.getRequestedByType()));
        response.put("occurredAt", now());
        response.put("traceId", buildTraceId());

        appendJsonLine(resolvePath(verificationFilePath), response);
        insertVerificationRunDb(response, request);
        return response;
    }

    private Map<String, Object> buildCandidate(String installableModuleId,
                                               String moduleName,
                                               String moduleFamily,
                                               String selectionClass,
                                               boolean installReadyYn,
                                               boolean dependencyResolvedYn,
                                               boolean styleReadyYn,
                                               boolean dbImpactReviewedYn,
                                               boolean requiresPopupReviewYn,
                                               String impactSummary) {
        Map<String, Object> row = new LinkedHashMap<String, Object>();
        row.put("installableModuleId", installableModuleId);
        row.put("moduleName", moduleName);
        row.put("moduleFamily", moduleFamily);
        row.put("selectionClass", selectionClass);
        row.put("installReadyYn", installReadyYn);
        row.put("dependencyResolvedYn", dependencyResolvedYn);
        row.put("styleReadyYn", styleReadyYn);
        row.put("dbImpactReviewedYn", dbImpactReviewedYn);
        row.put("rollbackReadyYn", installReadyYn && dbImpactReviewedYn);
        row.put("requiresPopupReviewYn", requiresPopupReviewYn);
        row.put("impactSummary", impactSummary);
        return row;
    }

    private ModuleProfile resolveModuleProfile(String installableModuleId) {
        String moduleId = safe(installableModuleId);
        if ("board-faq".equalsIgnoreCase(moduleId)) {
            return new ModuleProfile(
                    "board-faq",
                    "BOARD_STANDARD",
                    "BOARD_DEPTH_V1",
                    Arrays.asList("board-toolbar-common", "popup-member-selector"),
                    "Adds board list/detail/edit page family.",
                    "Adds FAQ board controller/service/mapper chain.",
                    "Adds FAQ table and rollback SQL requirement.",
                    "One duplicate toolbar class must be deduped.",
                    "FEATURE_MODULE + CSS_BUNDLE + BACKEND_CHAIN + DB_SQL_DRAFT",
                    "Detach module, rollback SQL, restore previous release unit.",
                    Arrays.asList("css dedupe pending", "rollback sql missing"),
                    true
            );
        }
        if ("excel-export-extended".equalsIgnoreCase(moduleId)) {
            return new ModuleProfile(
                    "excel-export-extended",
                    "EXPORT_STANDARD",
                    "EXPORT_DEPTH_V1",
                    Collections.singletonList("popup-member-selector"),
                    "Adds export action and result formatter.",
                    "Adds export service, audit trace, and download endpoint.",
                    "No new tables, but export audit retention must be reviewed.",
                    "Reuses current toolbar spacing tokens.",
                    "FEATURE_MODULE + BACKEND_CHAIN + TRACE_HOOK",
                    "Disable export feature flag and detach helper binding.",
                    Collections.<String>emptyList(),
                    false
            );
        }
        return new ModuleProfile(
                "popup-member-selector",
                "POPUP_SELECTOR_STANDARD",
                "POPUP_DEPTH_V1",
                Collections.<String>emptyList(),
                "Adds popup selector and caller binding.",
                "Adds lookup endpoint and selector binding service.",
                "No DB schema change required.",
                "Reuses current modal token set.",
                "FEATURE_MODULE + FRONTEND_BINDING",
                "Detach popup binding and restore selector caller configuration.",
                Collections.<String>emptyList(),
                false
        );
    }

    private List<String> findMissingRequiredModules(List<String> selectedModuleSet, List<ModuleProfile> selectedProfiles) {
        LinkedHashSet<String> requiredModuleSet = new LinkedHashSet<String>();
        requiredModuleSet.add("popup-member-selector");
        if (selectedProfiles != null) {
            for (ModuleProfile profile : selectedProfiles) {
                if (profile == null) {
                    continue;
                }
                requiredModuleSet.addAll(normalizeList(profile.dependencySet));
            }
        }

        LinkedHashSet<String> selectedModuleIdSet = new LinkedHashSet<String>();
        for (String moduleId : normalizeList(selectedModuleSet)) {
            selectedModuleIdSet.add(normalizeToken(moduleId));
        }

        List<String> missingModuleSet = new ArrayList<String>();
        for (String requiredModuleId : requiredModuleSet) {
            String normalizedRequired = normalizeToken(requiredModuleId);
            if (!normalizedRequired.isEmpty() && !selectedModuleIdSet.contains(normalizedRequired)) {
                missingModuleSet.add(requiredModuleId);
            }
        }
        return missingModuleSet;
    }

    private List<String> deriveBlockingGapSet(String reasonCode, List<String> selectedElementSet) {
        LinkedHashSet<String> gaps = new LinkedHashSet<String>();
        String normalizedReason = safe(reasonCode).toUpperCase(Locale.ROOT);
        if ("PARITY_GAP".equals(normalizedReason)) {
            gaps.add("BUTTON_ZONE_DRIFT");
            gaps.add("SPACING_PROFILE_MISMATCH");
        } else if ("RUNTIME_DRIFT".equals(normalizedReason)) {
            gaps.add("RUNTIME_BINDING_DRIFT");
        } else if ("MISSING_BINDING".equals(normalizedReason)) {
            gaps.add("BACKEND_CHAIN_GAP");
        }
        if (selectedElementSet != null && selectedElementSet.size() > 1) {
            gaps.add("MULTI_ELEMENT_ALIGNMENT_REVIEW");
        }
        return new ArrayList<String>(gaps);
    }

    private String resolveRepairOpenStatus(List<String> blockingGapSet, RepairOpenRequest request) {
        if (blockingGapSet != null && !blockingGapSet.isEmpty()) {
            return "REPAIR_REQUIRED";
        }
        String reasonCode = safe(request == null ? null : request.getReasonCode()).toUpperCase(Locale.ROOT);
        if ("UNIFORMITY_GAP".equals(reasonCode)
                || "MISSING_PAGE_FAMILY".equals(reasonCode)
                || "MISSING_COMPONENT_FAMILY".equals(reasonCode)) {
            return "REVIEW_REQUIRED";
        }
        return "OPEN";
    }

    private boolean hasRepairUpdate(RepairApplyRequest request) {
        if (request == null) {
            return false;
        }
        return !normalizeList(request.getUpdatedAssetSet()).isEmpty()
                || !normalizeList(request.getUpdatedBindingSet()).isEmpty()
                || !normalizeList(request.getUpdatedThemeOrLayoutSet()).isEmpty()
                || !normalizeList(request.getSqlDraftSet()).isEmpty();
    }

    private String resolveRepairApplyStatus(boolean hasAnyRepairUpdate, List<String> updatedAssetTraceSet) {
        if (!hasAnyRepairUpdate) {
            return "REJECTED";
        }
        return updatedAssetTraceSet.isEmpty() ? "APPLIED_WITH_BLOCKERS" : "APPLIED";
    }

    private String resolveVerificationResult(VerificationMenuRequest request, List<String> blockerSet) {
        return blockerSet.isEmpty() ? "PASS" : "WARN";
    }

    private List<ControlPlaneCompareRow> buildCompareTargetSet(ParityCompareRequest request) {
        List<ControlPlaneCompareRow> rows = new ArrayList<ControlPlaneCompareRow>();
        String templateLineId = safe(request.getTemplateLineId());
        String screenFamilyRuleId = safe(request.getScreenFamilyRuleId());
        String normalizedScreen = normalizeToken(safe(request.getSelectedScreenId()));

        rows.add(compareRow("Template Line",
                templateLineId,
                templateLineId,
                templateLineId,
                templateLineId,
                false));
        rows.add(compareRow("Screen Family Rule",
                screenFamilyRuleId,
                screenFamilyRuleId,
                screenFamilyRuleId,
                screenFamilyRuleId,
                false));
        rows.add(compareRow("Shell Profile",
                deriveShellProfileId("MAIN_SERVER_CURRENT"),
                deriveShellProfileId("GENERATED_TARGET"),
                deriveShellProfileId(firstNonBlank(request.getCompareBaseline(), "PROPOSAL_BASELINE")),
                deriveShellProfileId("PATCH_TARGET"),
                false));
        rows.add(compareRow("Action Layout",
                "detail-footer-left-right",
                "detail-footer-standard",
                "detail-footer-standard",
                "detail-footer-standard",
                true));
        rows.add(compareRow("Help Anchors",
                "12",
                "10",
                "12",
                "12",
                true));
        rows.add(compareRow("Binding Chain",
                "backend-chain:" + normalizedScreen,
                "backend-chain:" + normalizedScreen,
                "backend-chain:" + normalizedScreen,
                "backend-chain:" + normalizedScreen,
                false));
        return rows;
    }

    private ControlPlaneCompareRow compareRow(String target,
                                              String currentRuntime,
                                              String generatedTarget,
                                              String proposalBaseline,
                                              String patchTarget,
                                              boolean mismatch) {
        return new ControlPlaneCompareRow(target,
                currentRuntime,
                generatedTarget,
                proposalBaseline,
                patchTarget,
                mismatch ? "MISMATCH" : "MATCH");
    }

    private List<String> buildCompareBlockerSet(List<ControlPlaneCompareRow> compareTargetSet) {
        List<String> blockers = new ArrayList<String>();
        for (ControlPlaneCompareRow row : compareTargetSet) {
            if ("MISMATCH".equals(row.getResult())) {
                blockers.add(normalizeToken(row.getTarget()).toUpperCase(Locale.ROOT) + "_DRIFT");
            }
        }
        return blockers;
    }

    private List<String> buildRepairCandidateSet(List<ControlPlaneCompareRow> compareTargetSet) {
        List<String> repairCandidateSet = new ArrayList<String>();
        for (ControlPlaneCompareRow row : compareTargetSet) {
            if ("MISMATCH".equals(row.getResult())) {
                repairCandidateSet.add(normalizeToken(row.getTarget()) + "-repair");
            }
        }
        return repairCandidateSet;
    }

    private void insertModuleBindingPreviewDb(Map<String, Object> previewRecord) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("moduleBindingPreviewId", safe(previewRecord.get("moduleBindingPreviewId")));
            params.put("traceId", safe(previewRecord.get("traceId")));
            params.put("projectId", safe(previewRecord.get("projectId")));
            params.put("scenarioFamilyId", safe(previewRecord.get("scenarioFamilyId")));
            params.put("scenarioId", safe(previewRecord.get("scenarioId")));
            params.put("guidedStateId", safe(previewRecord.get("guidedStateId")));
            params.put("pageAssemblyId", safe(previewRecord.get("pageAssemblyId")));
            params.put("templateLineId", safe(previewRecord.get("templateLineId")));
            params.put("screenFamilyRuleId", safe(previewRecord.get("screenFamilyRuleId")));
            params.put("themeSetId", safe(previewRecord.get("themeSetId")));
            params.put("installableModuleId", safe(previewRecord.get("installableModuleId")));
            params.put("modulePatternFamilyId", safe(previewRecord.get("modulePatternFamilyId")));
            params.put("moduleDepthProfileId", safe(previewRecord.get("moduleDepthProfileId")));
            params.put("selectionMode", safe(previewRecord.get("selectionMode")));
            params.put("operatorId", safe(previewRecord.get("operator")));
            params.put("frontendImpactSummary", safe(previewRecord.get("frontendImpactSummary")));
            params.put("backendImpactSummary", safe(previewRecord.get("backendImpactSummary")));
            params.put("dbImpactSummary", safe(previewRecord.get("dbImpactSummary")));
            params.put("cssImpactSummary", safe(previewRecord.get("cssImpactSummary")));
            params.put("runtimePackageAttachPreview", safe(previewRecord.get("runtimePackageAttachPreview")));
            params.put("rollbackPlanSummary", safe(previewRecord.get("rollbackPlanSummary")));
            params.put("blockingIssueCount", previewRecord.get("blockingIssueCount"));
            params.put("blockingIssueSetJson", toJson(previewRecord.get("blockingIssueSet")));
            params.put("readyForApplyYn", yn(Boolean.TRUE.equals(previewRecord.get("readyForScaffoldYn"))));
            params.put("previewPayloadJson", toJson(previewRecord));
            params.put("createdBy", safe(previewRecord.get("operator")));
            params.put("updatedBy", safe(previewRecord.get("operator")));
            resonanceControlPlaneMapper.insertModuleBindingPreview(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_MODULE_BINDING_PREVIEW insert", previewRecord, e);
        }
    }

    private void insertParityCompareRunDb(Map<String, Object> response) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("compareContextId", safe(response.get("compareContextId")));
            params.put("traceId", safe(response.get("traceId")));
            params.put("projectId", safe(response.get("projectId")));
            params.put("guidedStateId", safe(response.get("guidedStateId")));
            params.put("templateLineId", safe(response.get("templateLineId")));
            params.put("screenFamilyRuleId", safe(response.get("screenFamilyRuleId")));
            params.put("ownerLane", safe(response.get("ownerLane")));
            params.put("selectedScreenId", safe(response.get("selectedScreenId")));
            params.put("releaseUnitId", safe(response.get("releaseUnitId")));
            params.put("compareBaseline", safe(response.get("compareBaseline")));
            params.put("parityScore", response.get("parityScore"));
            params.put("uniformityScore", response.get("uniformityScore"));
            params.put("result", safe(response.get("result")));
            params.put("compareTargetSetJson", toJson(response.get("compareTargetSet")));
            params.put("blockerSetJson", toJson(response.get("blockerSet")));
            params.put("repairCandidateSetJson", toJson(response.get("repairCandidateSet")));
            params.put("requestedBy", safe(response.get("requestedBy")));
            params.put("requestedByType", safe(response.get("requestedByType")));
            params.put("resultPayloadJson", toJson(response));
            params.put("occurredAt", safe(response.get("occurredAt")));
            params.put("createdBy", firstNonBlank(safe(response.get("requestedBy")), "res-09-verify"));
            params.put("updatedBy", firstNonBlank(safe(response.get("requestedBy")), "res-09-verify"));
            resonanceControlPlaneMapper.insertParityCompareRun(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_PARITY_COMPARE_RUN insert", response, e);
        }
    }

    private void insertModuleBindingResultDb(Map<String, Object> result, Map<String, Object> preview) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("moduleBindingResultId", safe(result.get("moduleBindingResultId")));
            params.put("moduleBindingPreviewId", safe(result.get("moduleBindingPreviewId")));
            params.put("traceId", safe(result.get("traceId")));
            params.put("projectId", safe(result.get("projectId")));
            params.put("scenarioFamilyId", firstNonBlank(safe(preview.get("scenarioFamilyId")),
                    deriveScenarioFamilyId(safe(result.get("scenarioId")))));
            params.put("scenarioId", safe(result.get("scenarioId")));
            params.put("guidedStateId", safe(result.get("guidedStateId")));
            params.put("pageAssemblyId", safe(result.get("pageAssemblyId")));
            params.put("templateLineId", safe(result.get("templateLineId")));
            params.put("screenFamilyRuleId", safe(result.get("screenFamilyRuleId")));
            params.put("themeSetId", safe(preview.get("themeSetId")));
            params.put("releaseUnitId", safe(result.get("releaseUnitId")));
            params.put("runtimePackageId", safe(result.get("runtimePackageId")));
            params.put("generationRunId", safe(result.get("generationRunId")));
            params.put("jsonRevisionSetJson", toJson(result.get("jsonRevisionSet")));
            params.put("selectionAppliedYn", yn(Boolean.TRUE.equals(result.get("selectionAppliedYn"))));
            params.put("appliedModuleSetJson", toJson(result.get("appliedModuleSet")));
            params.put("attachedPageAssetSetJson", toJson(result.get("attachedPageAssetSet")));
            params.put("attachedComponentAssetSetJson", toJson(result.get("attachedComponentAssetSet")));
            params.put("attachedBackendAssetSetJson", toJson(result.get("attachedBackendAssetSet")));
            params.put("attachedDbAssetSetJson", toJson(result.get("attachedDbAssetSet")));
            params.put("runtimePackageImpactSummary", safe(result.get("runtimePackageImpactSummary")));
            params.put("releaseBlockerDeltaJson", toJson(result.get("releaseBlockerDelta")));
            params.put("followUpChecklistSummary", safe(result.get("followUpChecklistSummary")));
            params.put("repairNeededYn", yn(Boolean.TRUE.equals(result.get("repairNeededYn"))));
            params.put("repairQueueCount", result.get("repairQueueCount"));
            params.put("repairSessionCandidateId", safe(result.get("repairSessionCandidateId")));
            params.put("compareContextId", safe(result.get("compareContextId")));
            params.put("publishedAssetTraceSetJson", toJson(result.get("publishedAssetTraceSet")));
            params.put("traceLinkSetJson", toJson(result.get("traceLinkSet")));
            params.put("nextRecommendedAction", safe(result.get("nextRecommendedAction")));
            params.put("rollbackAnchorYn", yn(Boolean.TRUE.equals(result.get("rollbackAnchorYn"))));
            params.put("occurredAt", safe(result.get("occurredAt")));
            params.put("resultPayloadJson", toJson(result));
            params.put("createdBy", firstNonBlank(safe(preview.get("operator")), "res-06-backend"));
            params.put("updatedBy", firstNonBlank(safe(preview.get("operator")), "res-06-backend"));
            resonanceControlPlaneMapper.insertModuleBindingResult(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_MODULE_BINDING_RESULT insert", result, e);
        }
    }

    private Map<String, Object> findExistingModuleBindingResult(String moduleBindingPreviewId) {
        try {
            Map<String, Object> existing = resonanceControlPlaneMapper
                    .selectModuleBindingResultByPreviewId(moduleBindingPreviewId);
            if (existing == null || existing.isEmpty()) {
                return Collections.emptyMap();
            }
            String payload = safe(existing.get("resultPayloadJson"));
            if (!payload.isEmpty()) {
                return enrichModuleBindingResult(objectMapper.readValue(payload, MAP_TYPE));
            }
            return rehydrateModuleBindingResult(existing);
        } catch (Exception e) {
            log.debug("RSN_MODULE_BINDING_RESULT lookup skipped: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private Map<String, Object> rehydrateModuleBindingResult(Map<String, Object> existing) throws Exception {
        if (existing == null || existing.isEmpty()) {
            return Collections.emptyMap();
        }

        String moduleBindingPreviewId = safe(existing.get("moduleBindingPreviewId"));
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("moduleBindingResultId", safe(existing.get("moduleBindingResultId")));
        result.put("moduleBindingPreviewId", moduleBindingPreviewId);
        result.put("traceId", safe(existing.get("traceId")));
        result.put("projectId", safe(existing.get("projectId")));
        result.put("scenarioId", safe(existing.get("scenarioId")));
        result.put("pageAssemblyId", safe(existing.get("pageAssemblyId")));
        result.put("guidedStateId", safe(existing.get("guidedStateId")));
        result.put("templateLineId", safe(existing.get("templateLineId")));
        result.put("screenFamilyRuleId", safe(existing.get("screenFamilyRuleId")));
        result.put("ownerLane", resolveModuleBindingOwnerLane(existing, moduleBindingPreviewId));
        result.put("releaseUnitId", safe(existing.get("releaseUnitId")));
        result.put("runtimePackageId", safe(existing.get("runtimePackageId")));
        result.put("generationRunId", safe(existing.get("generationRunId")));
        result.put("selectionAppliedYn", isYnTrue(existing.get("selectionAppliedYn")));
        result.put("appliedModuleSet", parseJsonStringList(existing.get("appliedModuleSetJson")));
        result.put("attachedPageAssetSet", parseJsonStringList(existing.get("attachedPageAssetSetJson")));
        result.put("attachedComponentAssetSet", parseJsonStringList(existing.get("attachedComponentAssetSetJson")));
        result.put("attachedBackendAssetSet", parseJsonStringList(existing.get("attachedBackendAssetSetJson")));
        result.put("attachedDbAssetSet", parseJsonStringList(existing.get("attachedDbAssetSetJson")));
        result.put("runtimePackageImpactSummary", safe(existing.get("runtimePackageImpactSummary")));
        result.put("releaseBlockerDelta", parseJsonStringList(existing.get("releaseBlockerDeltaJson")));
        result.put("followUpChecklistSummary", safe(existing.get("followUpChecklistSummary")));
        result.put("repairNeededYn", isYnTrue(existing.get("repairNeededYn")));
        result.put("repairQueueCount", parseInteger(existing.get("repairQueueCount")));
        result.put("repairSessionCandidateId", safe(existing.get("repairSessionCandidateId")));
        result.put("compareContextId", safe(existing.get("compareContextId")));
        result.put("publishedAssetTraceSet", parseJsonStringList(existing.get("publishedAssetTraceSetJson")));
        result.put("releaseBindingTraceId", buildReleaseBindingTraceId(existing.get("releaseUnitId"),
                existing.get("guidedStateId")));
        result.put("assetTraceSet", parseJsonStringList(existing.get("publishedAssetTraceSetJson")));
        result.put("rollbackAnchorYn", isYnTrue(existing.get("rollbackAnchorYn")));
        result.put("traceLinkSet", parseJsonStringList(existing.get("traceLinkSetJson")));
        result.put("nextRecommendedAction", safe(existing.get("nextRecommendedAction")));
        result.put("boundAt", safe(existing.get("occurredAt")));
        result.put("occurredAt", safe(existing.get("occurredAt")));
        return enrichModuleBindingResult(result);
    }

    private String resolveModuleBindingOwnerLane(Map<String, Object> existing, String moduleBindingPreviewId) {
        String ownerLane = safe(existing.get("ownerLane"));
        if (!ownerLane.isEmpty()) {
            return ownerLane;
        }
        if (moduleBindingPreviewId.isEmpty()) {
            return "";
        }
        try {
            Map<String, Object> preview = resonanceControlPlaneMapper.selectModuleBindingPreviewById(moduleBindingPreviewId);
            if (preview == null || preview.isEmpty()) {
                return "";
            }
            String payload = safe(preview.get("previewPayloadJson"));
            if (payload.isEmpty()) {
                return "";
            }
            return safe(objectMapper.readValue(payload, MAP_TYPE).get("ownerLane"));
        } catch (Exception e) {
            log.debug("RSN_MODULE_BINDING_PREVIEW ownerLane lookup skipped: {}", e.getMessage());
            return "";
        }
    }

    private Map<String, Object> enrichModuleBindingResult(Map<String, Object> record) {
        if (record == null || record.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> enriched = new LinkedHashMap<String, Object>(record);
        List<String> publishedAssetTraceSet = normalizeObjectList(firstNonEmpty(record.get("publishedAssetTraceSet"),
                record.get("assetTraceSet")));

        if (!publishedAssetTraceSet.isEmpty()) {
            enriched.put("publishedAssetTraceSet", publishedAssetTraceSet);
        }
        if (safe(enriched.get("releaseBindingTraceId")).isEmpty()) {
            enriched.put("releaseBindingTraceId", buildReleaseBindingTraceId(enriched.get("releaseUnitId"),
                    enriched.get("guidedStateId")));
        }
        if (safe(enriched.get("boundAt")).isEmpty()) {
            enriched.put("boundAt", firstNonBlank(safe(enriched.get("occurredAt")), now()));
        }
        if (safe(enriched.get("occurredAt")).isEmpty()) {
            enriched.put("occurredAt", safe(enriched.get("boundAt")));
        }
        if (enriched.get("assetTraceSet") == null && !publishedAssetTraceSet.isEmpty()) {
            enriched.put("assetTraceSet", publishedAssetTraceSet);
        }
        return enriched;
    }

    private Map<String, Object> mergeModuleBindingResultRequestContext(Map<String, Object> record,
                                                                       ModuleSelectionApplyResultRequest request) {
        if (record == null || record.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> enriched = new LinkedHashMap<String, Object>(record);
        String releaseUnitId = firstNonBlank(safe(enriched.get("releaseUnitId")),
                request == null ? "" : safe(request.getReleaseUnitId()));
        String ownerLane = firstNonBlank(safe(enriched.get("ownerLane")),
                request == null ? "" : safe(request.getOwnerLane()));

        if (!releaseUnitId.isEmpty()) {
            enriched.put("releaseUnitId", releaseUnitId);
            enriched.put("releaseBindingTraceId", buildReleaseBindingTraceId(releaseUnitId,
                    firstNonBlank(safe(enriched.get("guidedStateId")),
                            request == null ? "" : safe(request.getGuidedStateId()))));
        }
        if (!ownerLane.isEmpty()) {
            enriched.put("ownerLane", ownerLane);
        }
        return enriched;
    }

    private void insertRepairSessionDb(Map<String, Object> response, RepairOpenRequest request) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("repairSessionId", safe(response.get("repairSessionId")));
            params.put("traceId", safe(response.get("traceId")));
            params.put("projectId", safe(response.get("projectId")));
            params.put("scenarioFamilyId", resolveScenarioFamilyId("", "", safe(response.get("guidedStateId")),
                    safe(response.get("selectedScreenId"))));
            params.put("releaseUnitId", safe(response.get("releaseUnitId")));
            params.put("guidedStateId", safe(response.get("guidedStateId")));
            params.put("templateLineId", safe(response.get("templateLineId")));
            params.put("screenFamilyRuleId", safe(response.get("screenFamilyRuleId")));
            params.put("ownerLane", safe(response.get("ownerLane")));
            params.put("selectedScreenId", safe(response.get("selectedScreenId")));
            params.put("compareSnapshotId", safe(response.get("compareSnapshotId")));
            params.put("compareBaseline", safe(response.get("compareBaseline")));
            params.put("reasonCode", safe(response.get("reasonCode")));
            params.put("requestedBy", safe(response.get("requestedBy")));
            params.put("requestedByType", safe(response.get("requestedByType")));
            params.put("requestNote", safe(response.get("requestNote")));
            params.put("selectedElementSetJson", toJson(response.get("selectedElementSet")));
            params.put("existingAssetReuseSetJson", toJson(request == null ? null : request.getExistingAssetReuseSet()));
            params.put("blockingGapSetJson", toJson(response.get("blockingGapSet")));
            params.put("reuseRecommendationSetJson", toJson(response.get("reuseRecommendationSet")));
            params.put("requiredContractSetJson", toJson(response.get("requiredContractSet")));
            params.put("status", safe(response.get("status")));
            params.put("blockingGapCount", normalizeObjectList(response.get("blockingGapSet")).size());
            params.put("sessionPayloadJson", toJson(response));
            params.put("occurredAt", safe(response.get("occurredAt")));
            params.put("createdBy", safe(response.get("requestedBy")));
            params.put("updatedBy", safe(response.get("requestedBy")));
            resonanceControlPlaneMapper.insertRepairSession(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_REPAIR_SESSION insert", response, e);
        }
    }

    private void insertRepairApplyRunDb(Map<String, Object> response) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("repairApplyRunId", safe(response.get("repairApplyRunId")));
            params.put("repairSessionId", safe(response.get("repairSessionId")));
            params.put("traceId", safe(response.get("traceId")));
            params.put("projectId", safe(response.get("projectId")));
            params.put("scenarioFamilyId", resolveScenarioFamilyId("", "", safe(response.get("guidedStateId")),
                    safe(response.get("selectedScreenId"))));
            params.put("releaseUnitId", safe(response.get("releaseUnitId")));
            params.put("guidedStateId", safe(response.get("guidedStateId")));
            params.put("templateLineId", safe(response.get("templateLineId")));
            params.put("screenFamilyRuleId", safe(response.get("screenFamilyRuleId")));
            params.put("ownerLane", safe(response.get("ownerLane")));
            params.put("selectedScreenId", safe(response.get("selectedScreenId")));
            params.put("selectedElementSetJson", toJson(response.get("selectedElementSet")));
            params.put("compareBaseline", safe(response.get("compareBaseline")));
            params.put("updatedReleaseCandidateId", safe(response.get("updatedReleaseCandidateId")));
            params.put("publishMode", safe(response.get("publishMode")));
            params.put("requestedBy", safe(response.get("requestedBy")));
            params.put("requestedByType", safe(response.get("requestedByType")));
            params.put("parityRecheckRequiredYn", yn(Boolean.TRUE.equals(response.get("parityRecheckRequiredYn"))));
            params.put("uniformityRecheckRequiredYn", yn(Boolean.TRUE.equals(response.get("uniformityRecheckRequiredYn"))));
            params.put("smokeRequiredYn", yn(Boolean.TRUE.equals(response.get("smokeRequiredYn"))));
            params.put("status", safe(response.get("status")));
            params.put("rollbackAnchorYn", yn(Boolean.TRUE.equals(response.get("smokeRequiredYn"))));
            params.put("changeSummary", safe(response.get("changeSummary")));
            params.put("updatedAssetTraceSetJson", toJson(response.get("updatedAssetTraceSet")));
            params.put("updatedBindingSetJson", toJson(response.get("updatedBindingSet")));
            params.put("updatedThemeLayoutSetJson", toJson(response.get("updatedThemeOrLayoutSet")));
            params.put("sqlDraftSetJson", toJson(response.get("sqlDraftSet")));
            params.put("applyPayloadJson", toJson(response));
            params.put("occurredAt", safe(response.get("occurredAt")));
            params.put("createdBy", safe(response.get("requestedBy")));
            params.put("updatedBy", safe(response.get("requestedBy")));
            resonanceControlPlaneMapper.insertRepairApplyRun(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_REPAIR_APPLY_RUN insert", response, e);
        }
    }

    private void insertVerificationRunDb(Map<String, Object> response, VerificationMenuRequest request) {
        try {
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put("verificationRunId", safe(response.get("verificationRunId")));
            params.put("traceId", safe(response.get("traceId")));
            params.put("projectId", safe(response.get("projectId")));
            params.put("scenarioFamilyId", resolveScenarioFamilyId("", "", safe(response.get("guidedStateId")),
                    safe(response.get("pageId"))));
            params.put("menuId", safe(response.get("menuId")));
            params.put("guidedStateId", safe(response.get("guidedStateId")));
            params.put("templateLineId", safe(response.get("templateLineId")));
            params.put("ownerLane", safe(response.get("ownerLane")));
            params.put("targetRuntime", safe(response.get("targetRuntime")));
            params.put("releaseUnitId", safe(response.get("releaseUnitId")));
            params.put("screenFamilyRuleId", safe(response.get("screenFamilyRuleId")));
            params.put("selectedScreenId", safe(response.get("selectedScreenId")));
            params.put("selectedElementSetJson", toJson(response.get("selectedElementSet")));
            params.put("compareBaseline", safe(response.get("compareBaseline")));
            params.put("pageId", safe(response.get("pageId")));
            params.put("routeId", safe(response.get("routeId")));
            params.put("shellProfileId", safe(response.get("shellProfileId")));
            params.put("pageFrameId", safe(response.get("pageFrameId")));
            params.put("componentCoverageState", safe(response.get("componentCoverageState")));
            params.put("bindingCoverageState", safe(response.get("bindingCoverageState")));
            params.put("backendChainState", safe(response.get("backendChainState")));
            params.put("helpSecurityState", safe(response.get("helpSecurityState")));
            params.put("result", safe(response.get("result")));
            params.put("blockerCount", normalizeObjectList(response.get("blockerSet")).size());
            params.put("verifyShellYn", yn(Boolean.TRUE.equals(request == null ? null : request.getVerifyShellYn())));
            params.put("verifyComponentYn", yn(Boolean.TRUE.equals(request == null ? null : request.getVerifyComponentYn())));
            params.put("verifyBindingYn", yn(Boolean.TRUE.equals(request == null ? null : request.getVerifyBindingYn())));
            params.put("verifyBackendYn", yn(Boolean.TRUE.equals(request == null ? null : request.getVerifyBackendYn())));
            params.put("verifyHelpSecurityYn", yn(Boolean.TRUE.equals(request == null ? null : request.getVerifyHelpSecurityYn())));
            params.put("requestedBy", safe(response.get("requestedBy")));
            params.put("requestedByType", safe(response.get("requestedByType")));
            params.put("blockerSetJson", toJson(response.get("blockerSet")));
            params.put("resultPayloadJson", toJson(response));
            params.put("occurredAt", safe(response.get("occurredAt")));
            params.put("createdBy", firstNonBlank(safe(response.get("requestedBy")), "res-06-backend"));
            params.put("updatedBy", firstNonBlank(safe(response.get("requestedBy")), "res-06-backend"));
            resonanceControlPlaneMapper.insertVerificationRun(params);
        } catch (Exception e) {
            logPersistenceSkip("RSN_VERIFICATION_RUN insert", response, e);
        }
    }

    private void logPersistenceSkip(String operation, Map<String, Object> record, Exception e) {
        log.warn("{} skipped; control-plane persistence drift likely. context={}; reason={}",
                operation,
                summarizePersistenceContext(record),
                e == null ? "" : e.getMessage());
        if (e != null) {
            log.debug("{} stack trace", operation, e);
        }
    }

    private Map<String, Object> summarizePersistenceContext(Map<String, Object> record) {
        Map<String, Object> summary = new LinkedHashMap<String, Object>();
        if (record == null || record.isEmpty()) {
            return summary;
        }
        putIfPresent(summary, "projectId", record.get("projectId"));
        putIfPresent(summary, "guidedStateId", record.get("guidedStateId"));
        putIfPresent(summary, "templateLineId", record.get("templateLineId"));
        putIfPresent(summary, "screenFamilyRuleId", record.get("screenFamilyRuleId"));
        putIfPresent(summary, "releaseUnitId", record.get("releaseUnitId"));
        putIfPresent(summary, "ownerLane", record.get("ownerLane"));
        putIfPresent(summary, "menuId", record.get("menuId"));
        putIfPresent(summary, "selectedScreenId", record.get("selectedScreenId"));
        putIfPresent(summary, "moduleBindingPreviewId", record.get("moduleBindingPreviewId"));
        putIfPresent(summary, "repairSessionId", record.get("repairSessionId"));
        putIfPresent(summary, "verificationRunId", record.get("verificationRunId"));
        return summary;
    }

    private void putIfPresent(Map<String, Object> summary, String key, Object value) {
        String safeValue = safe(value);
        if (!safeValue.isEmpty()) {
            summary.put(key, safeValue);
        }
    }

    private Object firstNonEmpty(Object... values) {
        if (values == null) {
            return null;
        }
        for (Object value : values) {
            if (value instanceof List && !((List<?>) value).isEmpty()) {
                return value;
            }
            if (!safe(value).isEmpty()) {
                return value;
            }
        }
        return null;
    }

    private void appendJsonLine(Path file, Map<String, Object> record) throws Exception {
        fileLock.lock();
        try {
            Files.createDirectories(file.getParent());
            BufferedWriter writer = Files.newBufferedWriter(file, StandardCharsets.UTF_8,
                    java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
            try {
                writer.write(objectMapper.writeValueAsString(record));
                writer.newLine();
            } finally {
                writer.close();
            }
        } finally {
            fileLock.unlock();
        }
    }

    private Map<String, Object> findLastRecord(Path file, String key, String value) throws Exception {
        fileLock.lock();
        try {
            if (!Files.exists(file)) {
                return Collections.emptyMap();
            }
            Map<String, Object> matched = Collections.emptyMap();
            BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8);
            try {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (safe(line).isEmpty()) {
                        continue;
                    }
                    Map<String, Object> row = objectMapper.readValue(line, MAP_TYPE);
                    if (safe(row.get(key)).equals(safe(value))) {
                        matched = row;
                    }
                }
            } finally {
                reader.close();
            }
            return matched;
        } finally {
            fileLock.unlock();
        }
    }

    private Path resolvePath(String pathValue) {
        return Paths.get(safe(pathValue)).toAbsolutePath().normalize();
    }

    private List<String> parseJsonStringList(Object value) throws Exception {
        String json = safe(value);
        if (json.isEmpty()) {
            return Collections.emptyList();
        }
        List<Object> parsed = objectMapper.readValue(json, LIST_TYPE);
        List<String> values = new ArrayList<String>();
        for (Object item : parsed) {
            String normalized = safe(item);
            if (!normalized.isEmpty()) {
                values.add(normalized);
            }
        }
        return values;
    }

    private Integer parseInteger(Object value) {
        if (value instanceof Number) {
            return Integer.valueOf(((Number) value).intValue());
        }
        String normalized = safe(value);
        if (normalized.isEmpty()) {
            return Integer.valueOf(0);
        }
        try {
            return Integer.valueOf(Integer.parseInt(normalized));
        } catch (NumberFormatException e) {
            return Integer.valueOf(0);
        }
    }

    private boolean isYnTrue(Object value) {
        return "Y".equalsIgnoreCase(safe(value)) || Boolean.TRUE.equals(value);
    }

    private void requireField(String value, String fieldName) {
        if (safe(value).isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
    }

    private void requireFlag(Boolean value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
    }

    private String coverageState(Boolean verifyYn) {
        return Boolean.TRUE.equals(verifyYn) ? "PASS" : "SKIPPED";
    }

    private String derivePageIdFromMenuId(String menuId) {
        return safe(menuId).toLowerCase(Locale.ROOT).replace('_', '-');
    }

    private String deriveRouteId(String pageId) {
        return "/" + normalizeToken(pageId).replace('-', '/');
    }

    private String deriveScreenFamilyRuleId(String pageId) {
        return "sfr-" + normalizeToken(pageId) + "-v1";
    }

    private String deriveShellProfileId(String targetRuntime) {
        return safe(targetRuntime).toLowerCase(Locale.ROOT).contains("main") ? "admin-main-shell" : "generated-shell";
    }

    private String derivePageFrameId(String pageId) {
        return "frame-" + normalizeToken(pageId);
    }

    private Map<String, Object> buildDefaultBuilderInput(String templateLineId,
                                                         String selectedScreenId,
                                                         String pageId,
                                                         String menuCode,
                                                         String menuUrl) {
        Map<String, Object> defaults = new LinkedHashMap<String, Object>();
        defaults.put("builderId", "builder-" + normalizeToken(firstNonBlank(selectedScreenId, pageId, templateLineId)));
        defaults.put("draftVersionId", "draft-" + normalizeToken(firstNonBlank(selectedScreenId, pageId, templateLineId)));
        defaults.put("menuCode", firstNonBlank(menuCode, selectedScreenId));
        defaults.put("pageId", firstNonBlank(pageId, selectedScreenId));
        defaults.put("menuUrl", firstNonBlank(menuUrl, "/" + normalizeToken(firstNonBlank(pageId, selectedScreenId))));
        return defaults;
    }

    private Map<String, Object> buildDefaultRuntimeEvidence(String releaseUnitId,
                                                            String runtimeTarget,
                                                            int selectedElementCount) {
        Map<String, Object> defaults = new LinkedHashMap<String, Object>();
        defaults.put("publishedVersionId", "published-" + normalizeToken(firstNonBlank(releaseUnitId, runtimeTarget)));
        defaults.put("currentRuntimeTraceId", "runtime-" + normalizeToken(firstNonBlank(releaseUnitId, runtimeTarget)));
        defaults.put("currentNodeCount", Math.max(1, selectedElementCount));
        defaults.put("currentEventCount", Math.max(1, selectedElementCount));
        return defaults;
    }

    private String deriveScenarioFamilyId(String token) {
        return normalizeToken(firstNonBlank(token, "default-scenario")) + "-family";
    }

    private String resolveScenarioFamilyId(String explicitScenarioFamilyId,
                                           String scenarioId,
                                           String guidedStateId,
                                           String fallbackToken) {
        return deriveScenarioFamilyId(firstNonBlank(explicitScenarioFamilyId, scenarioId, guidedStateId, fallbackToken));
    }

    private List<ModuleProfile> resolveModuleProfiles(List<String> selectedModuleSet) {
        List<ModuleProfile> profiles = new ArrayList<ModuleProfile>();
        for (String moduleId : normalizeList(selectedModuleSet)) {
            profiles.add(resolveModuleProfile(moduleId));
        }
        return profiles;
    }

    private String joinProfileValues(List<ModuleProfile> profiles, ProfileValueExtractor extractor) {
        List<String> values = new ArrayList<String>();
        if (profiles != null) {
            for (ModuleProfile profile : profiles) {
                String value = extractor.extract(profile);
                if (!safe(value).isEmpty()) {
                    values.add(profile.installableModuleId + ": " + value);
                }
            }
        }
        return String.join(" | ", values);
    }

    private String derivePageAssemblyId(String scenarioId) {
        return "page-assembly-" + normalizeToken(firstNonBlank(scenarioId, "default"));
    }

    private String deriveThemeSetId(String templateLineId) {
        return "theme-set-" + normalizeToken(firstNonBlank(templateLineId, "default"));
    }

    private String deriveRuntimePackageId(String scenarioId) {
        return "runtime-package-" + normalizeToken(firstNonBlank(scenarioId, "default"));
    }

    private String buildGenerationRunId(String scenarioId) {
        return "gen-" + normalizeToken(firstNonBlank(scenarioId, "default")) + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toLowerCase(Locale.ROOT);
    }

    private String buildReleaseUnitId(String projectId) {
        return "ru-" + normalizeToken(firstNonBlank(projectId, "carbonet")) + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    private String buildUpdatedReleaseCandidateId(String projectId, String releaseUnitId) {
        String baseReleaseUnitId = safe(releaseUnitId);
        if (!baseReleaseUnitId.isEmpty()) {
            return baseReleaseUnitId + "-patch";
        }
        return buildReleaseUnitId(projectId);
    }

    private String buildReleaseBindingTraceId(Object releaseUnitId, Object guidedStateId) {
        String releaseKey = normalizeToken(firstNonBlank(safe(releaseUnitId), "release"));
        String guidedKey = normalizeToken(firstNonBlank(safe(guidedStateId), "guided"));
        return "rbt-" + releaseKey + "-" + guidedKey;
    }

    private String buildId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toLowerCase(Locale.ROOT);
    }

    private String buildTraceId() {
        return "trace-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toLowerCase(Locale.ROOT);
    }

    private List<String> normalizeList(List<String> values) {
        LinkedHashSet<String> unique = new LinkedHashSet<String>();
        if (values != null) {
            for (String value : values) {
                String normalized = safe(value);
                if (!normalized.isEmpty()) {
                    unique.add(normalized);
                }
            }
        }
        return new ArrayList<String>(unique);
    }

    private List<String> normalizeObjectList(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        if (value instanceof List<?>) {
            List<?> raw = (List<?>) value;
            List<String> normalized = new ArrayList<String>();
            for (Object item : raw) {
                String token = safe(item);
                if (!token.isEmpty()) {
                    normalized.add(token);
                }
            }
            return normalized;
        }
        return Collections.singletonList(safe(value));
    }

    private Map<String, Object> normalizeObjectMap(Object value) {
        if (value instanceof Map<?, ?>) {
            Map<?, ?> raw = (Map<?, ?>) value;
            Map<String, Object> normalized = new LinkedHashMap<String, Object>();
            for (Map.Entry<?, ?> entry : raw.entrySet()) {
                String key = safe(entry.getKey());
                if (!key.isEmpty()) {
                    normalized.put(key, entry.getValue());
                }
            }
            return normalized;
        }
        return Collections.emptyMap();
    }

    @SafeVarargs
    private final Map<String, Object> mergeMap(Map<String, Object>... candidates) {
        Map<String, Object> merged = new LinkedHashMap<String, Object>();
        if (candidates == null) {
            return merged;
        }
        for (Map<String, Object> candidate : candidates) {
            if (candidate == null || candidate.isEmpty()) {
                continue;
            }
            for (Map.Entry<String, Object> entry : candidate.entrySet()) {
                String key = safe(entry.getKey());
                if (!key.isEmpty() && entry.getValue() != null) {
                    merged.put(key, entry.getValue());
                }
            }
        }
        return merged;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? Collections.emptyMap() : value);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String now() {
        return LocalDateTime.now().format(TS_FORMAT);
    }

    private String yn(boolean value) {
        return value ? "Y" : "N";
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (!safe(value).isEmpty()) {
                return safe(value);
            }
        }
        return "";
    }

    private String normalizeToken(String value) {
        String normalized = safe(value).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
        normalized = normalized.replaceAll("(^-+|-+$)", "");
        return normalized.isEmpty() ? "item" : normalized;
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private static final class ModuleProfile {
        private final String installableModuleId;
        private final String modulePatternFamilyId;
        private final String moduleDepthProfileId;
        private final List<String> dependencySet;
        private final String frontendImpactSummary;
        private final String backendImpactSummary;
        private final String dbImpactSummary;
        private final String cssImpactSummary;
        private final String runtimePackageAttachPreview;
        private final String rollbackPlanSummary;
        private final List<String> blockingIssueSet;
        private final boolean requiresPopupReviewYn;

        private ModuleProfile(String installableModuleId,
                              String modulePatternFamilyId,
                              String moduleDepthProfileId,
                              List<String> dependencySet,
                              String frontendImpactSummary,
                              String backendImpactSummary,
                              String dbImpactSummary,
                              String cssImpactSummary,
                              String runtimePackageAttachPreview,
                              String rollbackPlanSummary,
                              List<String> blockingIssueSet,
                              boolean requiresPopupReviewYn) {
            this.installableModuleId = installableModuleId;
            this.modulePatternFamilyId = modulePatternFamilyId;
            this.moduleDepthProfileId = moduleDepthProfileId;
            this.dependencySet = dependencySet;
            this.frontendImpactSummary = frontendImpactSummary;
            this.backendImpactSummary = backendImpactSummary;
            this.dbImpactSummary = dbImpactSummary;
            this.cssImpactSummary = cssImpactSummary;
            this.runtimePackageAttachPreview = runtimePackageAttachPreview;
            this.rollbackPlanSummary = rollbackPlanSummary;
            this.blockingIssueSet = blockingIssueSet;
            this.requiresPopupReviewYn = requiresPopupReviewYn;
        }
    }

    private interface ProfileValueExtractor {
        ProfileValueExtractor FRONTEND = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.frontendImpactSummary;
            }
        };
        ProfileValueExtractor BACKEND = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.backendImpactSummary;
            }
        };
        ProfileValueExtractor DB = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.dbImpactSummary;
            }
        };
        ProfileValueExtractor CSS = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.cssImpactSummary;
            }
        };
        ProfileValueExtractor RUNTIME = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.runtimePackageAttachPreview;
            }
        };
        ProfileValueExtractor ROLLBACK = new ProfileValueExtractor() {
            @Override
            public String extract(ModuleProfile profile) {
                return profile.rollbackPlanSummary;
            }
        };

        String extract(ModuleProfile profile);
    }
}
