package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.mapper.ObservabilityMapper;
import egovframework.com.common.trace.UiComponentRegistryVO;
import egovframework.com.common.trace.UiComponentUsageVO;
import egovframework.com.feature.admin.dto.response.MenuInfoDTO;
import egovframework.com.feature.admin.model.ScreenBuilderAuthorityProfileVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryItemVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistrySaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentUsageVO;
import egovframework.com.feature.admin.model.ScreenBuilderComponentRegistryUpdateRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderDraftDocumentVO;
import egovframework.com.feature.admin.model.ScreenBuilderEventBindingVO;
import egovframework.com.feature.admin.model.ScreenBuilderNodeVO;
import egovframework.com.feature.admin.model.ScreenBuilderSaveRequestVO;
import egovframework.com.feature.admin.model.ScreenBuilderVersionSummaryVO;
import egovframework.com.feature.admin.service.MenuInfoService;
import egovframework.com.feature.admin.service.ScreenCommandCenterService;
import egovframework.com.feature.admin.service.ScreenBuilderDraftService;
import egovframework.com.framework.authority.model.FrameworkAuthorityRoleContractVO;
import egovframework.com.framework.authority.service.FrameworkAuthorityContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ScreenBuilderDraftServiceImpl implements ScreenBuilderDraftService {

    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss", Locale.KOREA);
    private static final String DEFAULT_TEMPLATE_TYPE = "EDIT_PAGE";
    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final List<Map<String, Object>> COMPONENT_PALETTE = Arrays.asList(
            palette("section", "Section", "섹션", "Form section container"),
            palette("heading", "Heading", "제목", "Section heading"),
            palette("text", "Text", "설명", "Static guidance text"),
            palette("input", "Input", "입력", "Single-line input field"),
            palette("textarea", "Textarea", "긴 입력", "Multi-line text input"),
            palette("select", "Select", "선택", "Option selector"),
            palette("checkbox", "Checkbox", "체크박스", "Boolean toggle"),
            palette("button", "Button", "버튼", "Submit or utility button"),
            palette("table", "Table", "테이블", "List or grid result block"),
            palette("pagination", "Pagination", "페이지네이션", "Paged list navigation")
    );

    private final ObjectMapper objectMapper;
    private final MenuInfoService menuInfoService;
    private final ObservabilityMapper observabilityMapper;
    private final FrameworkAuthorityContractService frameworkAuthorityContractService;
    private final ScreenCommandCenterService screenCommandCenterService;

    @Override
    public Map<String, Object> getPagePayload(String menuCode, String pageId, String menuTitle, String menuUrl, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(menuCode, pageId, menuTitle, menuUrl);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("menuCode", safe(draft.getMenuCode()));
        payload.put("pageId", safe(draft.getPageId()));
        payload.put("menuTitle", safe(draft.getMenuTitle()));
        payload.put("menuUrl", safe(draft.getMenuUrl()));
        payload.put("builderId", safe(draft.getBuilderId()));
        payload.put("versionId", safe(draft.getVersionId()));
        payload.put("versionStatus", safe(draft.getVersionStatus().isEmpty() ? "DRAFT" : draft.getVersionStatus()));
        payload.put("templateType", safe(draft.getTemplateType().isEmpty() ? DEFAULT_TEMPLATE_TYPE : draft.getTemplateType()));
        payload.put("authorityProfile", draft.getAuthorityProfile());
        payload.put("componentPalette", COMPONENT_PALETTE);
        payload.put("componentRegistry", getComponentRegistry(isEn));
        payload.put("componentTypeOptions", getComponentRegistry(isEn).stream()
                .map(ScreenBuilderComponentRegistryItemVO::getComponentType)
                .filter(value -> !safe(value).isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList()));
        payload.put("registryDiagnostics", getRegistryDiagnostics(draft, isEn));
        payload.put("nodes", draft.getNodes());
        payload.put("events", draft.getEvents());
        List<ScreenBuilderVersionSummaryVO> versionHistory = getVersionHistory(menuCode);
        payload.put("versionHistory", versionHistory);
        ScreenBuilderVersionSummaryVO publishedVersion = findLatestPublishedVersion(versionHistory);
        payload.put("publishedVersionId", publishedVersion == null ? "" : safe(publishedVersion.getVersionId()));
        payload.put("publishedSavedAt", publishedVersion == null ? "" : safe(publishedVersion.getSavedAt()));
        payload.put("previewAvailable", !draft.getNodes().isEmpty());
        payload.put("screenBuilderMessage", safe(menuCode).isEmpty()
                ? (isEn ? "Select a page menu from environment management to start the builder." : "환경관리 화면에서 페이지 메뉴를 선택한 뒤 빌더를 시작하세요.")
                : "");
        return payload;
    }

    @Override
    public Map<String, Object> saveDraft(ScreenBuilderSaveRequestVO request, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = createNormalizedDraft(request);
        validateDraft(draft);
        Path draftPath = resolveDraftPath(draft.getMenuCode());
        Files.createDirectories(draftPath.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(draftPath.toFile(), draft);
        writeHistorySnapshot(draft);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", draft.getMenuCode());
        response.put("builderId", draft.getBuilderId());
        response.put("versionId", draft.getVersionId());
        response.put("message", isEn ? "Screen builder draft saved." : "화면 빌더 초안을 저장했습니다.");
        return response;
    }

    @Override
    public ScreenBuilderDraftDocumentVO getDraft(String menuCode, String pageId, String menuTitle, String menuUrl) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        if (normalizedMenuCode.isEmpty()) {
            return createDefaultDraft(pageId, normalizedMenuCode, menuTitle, menuUrl);
        }
        Path draftPath = resolveDraftPath(normalizedMenuCode);
        if (Files.exists(draftPath)) {
            try (InputStream inputStream = Files.newInputStream(draftPath)) {
                ScreenBuilderDraftDocumentVO stored = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                if (stored != null) {
                    if (safe(stored.getMenuTitle()).isEmpty() || safe(stored.getMenuUrl()).isEmpty() || safe(stored.getPageId()).isEmpty()) {
                        hydrateMenuMetadata(stored, pageId, menuTitle, menuUrl);
                    }
                    return stored;
                }
            }
        }
        return createDefaultDraft(pageId, normalizedMenuCode, menuTitle, menuUrl);
    }

    @Override
    public List<ScreenBuilderVersionSummaryVO> getVersionHistory(String menuCode) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        List<ScreenBuilderVersionSummaryVO> rows = new ArrayList<>();
        if (normalizedMenuCode.isEmpty()) {
            return rows;
        }
        Path historyDir = resolveHistoryDir(normalizedMenuCode);
        if (!Files.exists(historyDir)) {
            return rows;
        }
        List<Path> files = new ArrayList<>();
        try (Stream<Path> stream = Files.list(historyDir)) {
            stream.filter(path -> path.getFileName().toString().endsWith(".json"))
                    .forEach(files::add);
        }
        files.sort((left, right) -> right.getFileName().toString().compareTo(left.getFileName().toString()));
        for (Path file : files) {
            try (InputStream inputStream = Files.newInputStream(file)) {
                ScreenBuilderDraftDocumentVO document = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                ScreenBuilderVersionSummaryVO item = new ScreenBuilderVersionSummaryVO();
                item.setVersionId(safe(document.getVersionId()));
                item.setVersionStatus(firstNonBlank(document.getVersionStatus(), "DRAFT"));
                item.setMenuCode(safe(document.getMenuCode()));
                item.setPageId(safe(document.getPageId()));
                item.setTemplateType(safe(document.getTemplateType()));
                item.setSavedAt(extractSavedAt(document.getVersionId(), file));
                item.setNodeCount(document.getNodes() == null ? 0 : document.getNodes().size());
                item.setEventCount(document.getEvents() == null ? 0 : document.getEvents().size());
                rows.add(item);
            }
        }
        return rows;
    }

    @Override
    public Map<String, Object> restoreDraftVersion(String menuCode, String versionId, boolean isEn) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        String normalizedVersionId = safe(versionId);
        if (normalizedMenuCode.isEmpty() || normalizedVersionId.isEmpty()) {
            throw new IllegalArgumentException("menuCode and versionId are required");
        }
        Path versionPath = resolveHistoryDir(normalizedMenuCode).resolve(normalizedVersionId + ".json");
        if (!Files.exists(versionPath)) {
            throw new IllegalArgumentException("Selected version does not exist");
        }
        ScreenBuilderDraftDocumentVO restored;
        try (InputStream inputStream = Files.newInputStream(versionPath)) {
            restored = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
        }
        if ("PUBLISHED".equalsIgnoreCase(safe(restored.getVersionStatus()))) {
            throw new IllegalArgumentException(isEn
                    ? "Published snapshots are protected and cannot be restored as draft."
                    : "Publish 스냅샷은 보호되어 있어 초안으로 복원할 수 없습니다.");
        }
        restored.setVersionId(UUID.randomUUID().toString());
        restored.setVersionStatus("DRAFT");
        Path draftPath = resolveDraftPath(normalizedMenuCode);
        Files.createDirectories(draftPath.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(draftPath.toFile(), restored);
        writeHistorySnapshot(restored);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", normalizedMenuCode);
        response.put("versionId", restored.getVersionId());
        response.put("message", isEn ? "Draft restored from selected version." : "선택한 버전으로 초안을 복원했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> publishDraft(String menuCode, boolean isEn) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        if (normalizedMenuCode.isEmpty()) {
            throw new IllegalArgumentException("menuCode is required");
        }
        ScreenBuilderDraftDocumentVO currentDraft = getDraft(normalizedMenuCode, "", "", "");
        Map<String, Object> diagnostics = getRegistryDiagnostics(currentDraft, isEn);
        int unregisteredCount = sizeOfList(diagnostics.get("unregisteredNodes"));
        int missingCount = sizeOfList(diagnostics.get("missingNodes"));
        int deprecatedCount = sizeOfList(diagnostics.get("deprecatedNodes"));
        List<String> authorityValidationErrors = validateAuthorityProfile(currentDraft, true);
        if (!authorityValidationErrors.isEmpty()) {
            throw new IllegalArgumentException(firstNonBlank(authorityValidationErrors.get(0), "Authority profile is invalid."));
        }
        List<String> authorityAlignmentErrors = validateAuthorityEventAlignment(currentDraft, true);
        if (!authorityAlignmentErrors.isEmpty()) {
            throw new IllegalArgumentException(firstNonBlank(authorityAlignmentErrors.get(0), "Authority profile is not aligned with builder actions."));
        }
        if (unregisteredCount > 0 || missingCount > 0 || deprecatedCount > 0) {
            throw new IllegalArgumentException(isEn
                    ? String.format("Publish is blocked. Unregistered=%d, Missing=%d, Deprecated=%d", unregisteredCount, missingCount, deprecatedCount)
                    : String.format("Publish가 차단되었습니다. 미등록=%d, 누락=%d, Deprecated=%d", unregisteredCount, missingCount, deprecatedCount));
        }
        currentDraft.setVersionId(UUID.randomUUID().toString());
        currentDraft.setVersionStatus("PUBLISHED");
        writeHistorySnapshot(currentDraft, false);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", normalizedMenuCode);
        response.put("versionId", currentDraft.getVersionId());
        response.put("message", isEn ? "Current draft published as a version snapshot." : "현재 초안을 publish 스냅샷으로 저장했습니다.");
        return response;
    }

    @Override
    public ScreenBuilderDraftDocumentVO getLatestPublishedDraft(String menuCode) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        if (normalizedMenuCode.isEmpty()) {
            return null;
        }
        Path historyDir = resolveHistoryDir(normalizedMenuCode);
        if (!Files.exists(historyDir)) {
            return null;
        }
        List<Path> files = new ArrayList<>();
        try (Stream<Path> stream = Files.list(historyDir)) {
            stream.filter(path -> path.getFileName().toString().endsWith(".json"))
                    .forEach(files::add);
        }
        files.sort((left, right) -> right.getFileName().toString().compareTo(left.getFileName().toString()));
        for (Path file : files) {
            try (InputStream inputStream = Files.newInputStream(file)) {
                ScreenBuilderDraftDocumentVO document = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                if ("PUBLISHED".equalsIgnoreCase(safe(document.getVersionStatus()))) {
                    return document;
                }
            }
        }
        return null;
    }

    @Override
    public List<ScreenBuilderComponentRegistryItemVO> getComponentRegistry(boolean isEn) throws Exception {
        return readComponentRegistry(isEn);
    }

    @Override
    public ScreenBuilderComponentRegistryItemVO registerComponent(ScreenBuilderComponentRegistrySaveRequestVO request, boolean isEn) throws Exception {
        String componentType = safe(request == null ? null : request.getComponentType());
        String label = safe(request == null ? null : request.getLabel());
        if (componentType.isEmpty()) {
            throw new IllegalArgumentException("componentType is required");
        }
        if (label.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Component label is required." : "컴포넌트 이름은 필수입니다.");
        }

        List<ScreenBuilderComponentRegistryItemVO> items = readComponentRegistry(isEn);
        String componentId = firstNonBlank(
                request == null ? "" : request.getComponentId(),
                buildSuggestedComponentId(componentType, label)
        );
        String uniqueComponentId = componentId;
        int suffix = 2;
        while (containsComponentId(items, uniqueComponentId)) {
            uniqueComponentId = componentId + "-" + suffix;
            suffix++;
        }

        ScreenBuilderComponentRegistryItemVO item = new ScreenBuilderComponentRegistryItemVO();
        item.setComponentId(uniqueComponentId);
        item.setComponentType(componentType);
        item.setLabel(label);
        item.setLabelEn(safe(request == null ? null : request.getLabelEn()));
        item.setDescription(safe(request == null ? null : request.getDescription()));
        item.setStatus(ACTIVE_STATUS);
        item.setReplacementComponentId("");
        item.setSourceType("CUSTOM");
        item.setCreatedAt(LocalDateTime.now().format(TIMESTAMP_FORMAT));
        item.setUpdatedAt(item.getCreatedAt());
        item.setPropsTemplate(request == null || request.getPropsTemplate() == null
                ? new LinkedHashMap<>()
                : new LinkedHashMap<>(request.getPropsTemplate()));
        upsertComponentRegistryItem(item);
        return item;
    }

    @Override
    public ScreenBuilderComponentRegistryItemVO updateComponentRegistryItem(ScreenBuilderComponentRegistryUpdateRequestVO request, boolean isEn) throws Exception {
        String componentId = safe(request == null ? null : request.getComponentId());
        if (componentId.isEmpty()) {
            throw new IllegalArgumentException("componentId is required");
        }
        List<ScreenBuilderComponentRegistryItemVO> items = readComponentRegistry(isEn);
        ScreenBuilderComponentRegistryItemVO matched = findRegistryItem(items, componentId);
        if (matched == null) {
            throw new IllegalArgumentException(isEn ? "Component does not exist." : "컴포넌트를 찾을 수 없습니다.");
        }
        matched.setComponentType(firstNonBlank(request == null ? "" : request.getComponentType(), matched.getComponentType()));
        matched.setLabel(firstNonBlank(request == null ? "" : request.getLabel(), matched.getLabel()));
        matched.setLabelEn(firstNonBlank(request == null ? "" : request.getLabelEn(), matched.getLabelEn()));
        matched.setDescription(firstNonBlank(request == null ? "" : request.getDescription(), matched.getDescription()));
        matched.setStatus(firstNonBlank(request == null ? "" : request.getStatus(), matched.getStatus(), ACTIVE_STATUS));
        matched.setReplacementComponentId(safe(request == null ? null : request.getReplacementComponentId()));
        if (request != null && request.getPropsTemplate() != null) {
            matched.setPropsTemplate(new LinkedHashMap<>(request.getPropsTemplate()));
        }
        matched.setUpdatedAt(LocalDateTime.now().format(TIMESTAMP_FORMAT));
        upsertComponentRegistryItem(matched);
        return matched;
    }

    @Override
    public List<ScreenBuilderComponentUsageVO> getComponentRegistryUsage(String componentId, boolean isEn) throws Exception {
        String normalizedComponentId = safe(componentId);
        List<ScreenBuilderComponentUsageVO> usages = new ArrayList<>();
        if (normalizedComponentId.isEmpty()) {
            return usages;
        }
        for (UiComponentUsageVO usage : observabilityMapper.selectUiComponentUsageList(normalizedComponentId)) {
            ScreenBuilderComponentUsageVO row = new ScreenBuilderComponentUsageVO();
            row.setUsageSource("MANIFEST");
            row.setUsageStatus("ACTIVE");
            row.setMenuCode(safe(usage.getMenuCode()));
            row.setPageId(safe(usage.getPageId()));
            row.setMenuTitle(firstNonBlank(usage.getPageName(), usage.getPageId()));
            row.setMenuUrl(safe(usage.getRoutePath()));
            row.setLayoutZone(safe(usage.getLayoutZone()));
            row.setInstanceKey(safe(usage.getInstanceKey()));
            row.setComponentId(normalizedComponentId);
            usages.add(row);
        }
        usages.addAll(scanBuilderDraftUsage(normalizedComponentId, false));
        usages.addAll(scanBuilderDraftUsage(normalizedComponentId, true));
        usages.sort(Comparator.comparing(ScreenBuilderComponentUsageVO::getUsageSource, Comparator.nullsLast(String::compareTo))
                .thenComparing(ScreenBuilderComponentUsageVO::getMenuCode, Comparator.nullsLast(String::compareTo))
                .thenComparing(ScreenBuilderComponentUsageVO::getPageId, Comparator.nullsLast(String::compareTo))
                .thenComparing(ScreenBuilderComponentUsageVO::getNodeId, Comparator.nullsLast(String::compareTo)));
        return usages;
    }

    @Override
    public Map<String, Object> replaceComponentRegistryUsage(String fromComponentId, String toComponentId, boolean isEn) throws Exception {
        String normalizedFromComponentId = safe(fromComponentId);
        String normalizedToComponentId = safe(toComponentId);
        if (normalizedFromComponentId.isEmpty() || normalizedToComponentId.isEmpty()) {
            throw new IllegalArgumentException(isEn ? "Both source and replacement componentId are required." : "기존/대체 componentId는 모두 필요합니다.");
        }
        if (normalizedFromComponentId.equalsIgnoreCase(normalizedToComponentId)) {
            throw new IllegalArgumentException(isEn ? "Replacement component must be different." : "대체 컴포넌트는 달라야 합니다.");
        }
        List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
        ScreenBuilderComponentRegistryItemVO fromItem = findRegistryItem(registry, normalizedFromComponentId);
        ScreenBuilderComponentRegistryItemVO toItem = findRegistryItem(registry, normalizedToComponentId);
        if (fromItem == null || toItem == null) {
            throw new IllegalArgumentException(isEn ? "Selected component does not exist in registry." : "선택한 컴포넌트가 레지스트리에 없습니다.");
        }
        Map<String, String> mapPayload = new LinkedHashMap<>();
        mapPayload.put("fromComponentId", normalizedFromComponentId);
        mapPayload.put("toComponentId", normalizedToComponentId);
        observabilityMapper.updateUiPageComponentMapComponentId(mapPayload);

        int updatedDraftCount = replaceComponentIdAcrossDrafts(normalizedFromComponentId, normalizedToComponentId, false);
        int updatedPublishedCount = 0;
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("fromComponentId", normalizedFromComponentId);
        response.put("toComponentId", normalizedToComponentId);
        response.put("updatedDraftCount", updatedDraftCount);
        response.put("updatedPublishedCount", updatedPublishedCount);
        response.put("message", isEn ? "Component usages remapped." : "컴포넌트 사용처를 재매핑했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> deleteComponentRegistryItem(String componentId, boolean isEn) throws Exception {
        String normalizedComponentId = safe(componentId);
        if (normalizedComponentId.isEmpty()) {
            throw new IllegalArgumentException("componentId is required");
        }
        List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
        ScreenBuilderComponentRegistryItemVO item = findRegistryItem(registry, normalizedComponentId);
        if (item == null) {
            throw new IllegalArgumentException(isEn ? "Component does not exist." : "컴포넌트를 찾을 수 없습니다.");
        }
        if ("SYSTEM".equalsIgnoreCase(safe(item.getSourceType()))) {
            throw new IllegalArgumentException(isEn ? "System components cannot be deleted." : "시스템 컴포넌트는 삭제할 수 없습니다.");
        }
        List<ScreenBuilderComponentUsageVO> usages = getComponentRegistryUsage(normalizedComponentId, isEn);
        if (!usages.isEmpty()) {
            throw new IllegalArgumentException(isEn
                    ? String.format("Component is still used by %d screens. Remap usages first.", usages.size())
                    : String.format("이 컴포넌트는 아직 %d개 화면에서 사용 중입니다. 먼저 사용처를 재매핑하세요.", usages.size()));
        }
        observabilityMapper.deleteUiComponentRegistry(normalizedComponentId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("componentId", normalizedComponentId);
        response.put("message", isEn ? "Component deleted from registry." : "레지스트리에서 컴포넌트를 삭제했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> autoReplaceDeprecatedComponents(String menuCode, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(menuCode, "", "", "");
        Map<String, Object> plan = buildDeprecatedReplacementPlan(draft, isEn);
        int replacedCount = ((Number) plan.getOrDefault("replacedCount", 0)).intValue();
        @SuppressWarnings("unchecked")
        List<ScreenBuilderNodeVO> nextNodes = (List<ScreenBuilderNodeVO>) plan.get("nextNodes");
        draft.setNodes(nextNodes);
        Path draftPath = resolveDraftPath(draft.getMenuCode());
        Files.createDirectories(draftPath.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(draftPath.toFile(), draft);
        writeHistorySnapshot(draft);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", safe(menuCode));
        response.put("replacedCount", replacedCount);
        response.put("message", isEn ? "Deprecated components replaced in draft." : "초안에서 deprecated 컴포넌트를 대체했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> previewAutoReplaceDeprecatedComponents(String menuCode, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(menuCode, "", "", "");
        Map<String, Object> plan = buildDeprecatedReplacementPlan(draft, isEn);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("menuCode", safe(menuCode));
        response.put("replacedCount", plan.getOrDefault("replacedCount", 0));
        response.put("items", plan.get("items"));
        return response;
    }

    @Override
    public Map<String, Object> scanAllDraftRegistryDiagnostics(boolean isEn) throws Exception {
        List<Map<String, Object>> items = new ArrayList<>();
        Path draftRoot = Paths.get("data", "screen-builder");
        if (Files.exists(draftRoot)) {
            try (Stream<Path> stream = Files.list(draftRoot)) {
                List<Path> files = stream
                        .filter(path -> Files.isRegularFile(path))
                        .filter(path -> path.getFileName().toString().endsWith(".json"))
                        .filter(path -> !"component-registry.json".equals(path.getFileName().toString()))
                        .sorted()
                        .collect(Collectors.toList());
                List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
                for (Path file : files) {
                    try (InputStream inputStream = Files.newInputStream(file)) {
                        ScreenBuilderDraftDocumentVO draft = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                        Map<String, Object> diagnostics = buildRegistryDiagnostics(draft, registry);
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("menuCode", safe(draft.getMenuCode()));
                        row.put("pageId", safe(draft.getPageId()));
                        row.put("menuTitle", safe(draft.getMenuTitle()));
                        row.put("unregisteredCount", sizeOfList(diagnostics.get("unregisteredNodes")));
                        row.put("missingCount", sizeOfList(diagnostics.get("missingNodes")));
                        row.put("deprecatedCount", sizeOfList(diagnostics.get("deprecatedNodes")));
                        items.add(row);
                    }
                }
            }
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("totalCount", items.size());
        return response;
    }

    @Override
    public Map<String, Object> addNodeFromComponent(String menuCode, String componentId, String parentNodeId, Map<String, Object> propsOverride, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(menuCode, "", "", "");
        List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
        ScreenBuilderComponentRegistryItemVO matched = null;
        for (ScreenBuilderComponentRegistryItemVO item : registry) {
            if (safe(componentId).equalsIgnoreCase(safe(item.getComponentId()))) {
                matched = item;
                break;
            }
        }
        if (matched == null) {
            throw new IllegalArgumentException(isEn ? "Component does not exist." : "컴포넌트를 찾을 수 없습니다.");
        }
        String targetParentNodeId = firstNonBlank(parentNodeId, findDefaultParentNodeId(draft, matched.getComponentType()));
        ScreenBuilderNodeVO node = new ScreenBuilderNodeVO();
        node.setNodeId(safe(matched.getComponentType()) + "-" + System.currentTimeMillis());
        node.setComponentId(safe(matched.getComponentId()));
        node.setParentNodeId(targetParentNodeId);
        node.setComponentType(safe(matched.getComponentType()));
        node.setSlotName("button".equalsIgnoreCase(safe(matched.getComponentType())) ? "actions" : "content");
        node.setSortOrder(draft.getNodes().size());
        Map<String, Object> props = matched.getPropsTemplate() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(matched.getPropsTemplate());
        if (propsOverride != null && !propsOverride.isEmpty()) {
            props.putAll(propsOverride);
        }
        node.setProps(props);
        draft.getNodes().add(node);
        draft.setNodes(sortNodesForPersistence(draft.getNodes()));
        Path draftPath = resolveDraftPath(draft.getMenuCode());
        Files.createDirectories(draftPath.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(draftPath.toFile(), draft);
        writeHistorySnapshot(draft);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", safe(menuCode));
        response.put("nodeId", safe(node.getNodeId()));
        response.put("componentId", safe(node.getComponentId()));
        response.put("message", isEn ? "Node added from registered component." : "등록 컴포넌트로 노드를 추가했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> addNodeTreeFromComponents(String menuCode, List<Map<String, Object>> items, boolean isEn) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(menuCode, "", "", "");
        List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
        Map<String, ScreenBuilderComponentRegistryItemVO> registryMap = new LinkedHashMap<>();
        for (ScreenBuilderComponentRegistryItemVO item : registry) {
            registryMap.put(safe(item.getComponentId()), item);
        }
        int addedCount = 0;
        Map<String, String> aliasNodeIds = new LinkedHashMap<>();
        List<ScreenBuilderNodeVO> nextNodes = new ArrayList<>(draft.getNodes());
        List<Map<String, Object>> addedItems = new ArrayList<>();
        if (items != null) {
            for (Map<String, Object> row : items) {
                if (row == null) {
                    continue;
                }
                String componentId = safe(String.valueOf(row.getOrDefault("componentId", "")));
                if (componentId.isEmpty() || !registryMap.containsKey(componentId)) {
                    continue;
                }
                ScreenBuilderComponentRegistryItemVO matched = registryMap.get(componentId);
                String alias = safe(String.valueOf(row.getOrDefault("alias", "")));
                String parentAlias = safe(String.valueOf(row.getOrDefault("parentAlias", "")));
                String parentNodeId = aliasNodeIds.getOrDefault(parentAlias, safe(String.valueOf(row.getOrDefault("parentNodeId", ""))));
                String resolvedParentNodeId = firstNonBlank(parentNodeId, findDefaultParentNodeId(draft, matched.getComponentType()));
                @SuppressWarnings("unchecked")
                Map<String, Object> propsOverride = row.get("props") instanceof Map ? new LinkedHashMap<>((Map<String, Object>) row.get("props")) : new LinkedHashMap<>();
                ScreenBuilderNodeVO node = new ScreenBuilderNodeVO();
                node.setNodeId(safe(matched.getComponentType()) + "-" + System.currentTimeMillis() + "-" + addedCount);
                node.setComponentId(safe(matched.getComponentId()));
                node.setParentNodeId(resolvedParentNodeId);
                node.setComponentType(safe(matched.getComponentType()));
                node.setSlotName("button".equalsIgnoreCase(safe(matched.getComponentType())) ? "actions" : "content");
                node.setSortOrder(nextNodes.size());
                Map<String, Object> props = matched.getPropsTemplate() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(matched.getPropsTemplate());
                props.putAll(propsOverride);
                node.setProps(props);
                nextNodes.add(node);
                if (!alias.isEmpty()) {
                    aliasNodeIds.put(alias, node.getNodeId());
                }
                Map<String, Object> addedRow = new LinkedHashMap<>();
                addedRow.put("nodeId", node.getNodeId());
                addedRow.put("componentId", node.getComponentId());
                addedRow.put("parentNodeId", node.getParentNodeId());
                addedItems.add(addedRow);
                addedCount++;
            }
        }
        draft.setNodes(sortNodesForPersistence(nextNodes));
        Path draftPath = resolveDraftPath(draft.getMenuCode());
        Files.createDirectories(draftPath.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(draftPath.toFile(), draft);
        writeHistorySnapshot(draft);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("menuCode", safe(menuCode));
        response.put("addedCount", addedCount);
        response.put("items", addedItems);
        response.put("message", isEn ? "Node tree added from component contracts." : "컴포넌트 계약으로 노드 트리를 추가했습니다.");
        return response;
    }

    @Override
    public Map<String, Object> getRegistryDiagnostics(ScreenBuilderDraftDocumentVO draft, boolean isEn) throws Exception {
        return buildRegistryDiagnostics(draft, getComponentRegistry(isEn));
    }

    private void hydrateMenuMetadata(ScreenBuilderDraftDocumentVO draft, String pageId, String menuTitle, String menuUrl) throws Exception {
        MenuInfoDTO menu = findMenu(draft.getMenuCode());
        draft.setPageId(firstNonBlank(pageId, draft.getPageId(), derivePageId(draft.getMenuCode(), menu)));
        draft.setMenuTitle(firstNonBlank(menuTitle, draft.getMenuTitle(), menu == null ? "" : menu.getCodeNm()));
        draft.setMenuUrl(firstNonBlank(menuUrl, draft.getMenuUrl(), menu == null ? "" : menu.getMenuUrl()));
    }

    private ScreenBuilderDraftDocumentVO createNormalizedDraft(ScreenBuilderSaveRequestVO request) throws Exception {
        ScreenBuilderDraftDocumentVO draft = getDraft(request == null ? "" : request.getMenuCode(), request == null ? "" : request.getPageId(), request == null ? "" : request.getMenuTitle(), request == null ? "" : request.getMenuUrl());
        draft.setTemplateType(firstNonBlank(request == null ? "" : request.getTemplateType(), draft.getTemplateType(), DEFAULT_TEMPLATE_TYPE));
        draft.setPageId(firstNonBlank(request == null ? "" : request.getPageId(), draft.getPageId()));
        draft.setMenuCode(firstNonBlank(request == null ? "" : request.getMenuCode(), draft.getMenuCode()));
        draft.setMenuTitle(firstNonBlank(request == null ? "" : request.getMenuTitle(), draft.getMenuTitle()));
        draft.setMenuUrl(firstNonBlank(request == null ? "" : request.getMenuUrl(), draft.getMenuUrl()));
        draft.setAuthorityProfile(normalizeAuthorityProfile(request == null ? null : request.getAuthorityProfile(), draft.getAuthorityProfile()));
        draft.setVersionStatus("DRAFT");
        draft.setVersionId(UUID.randomUUID().toString());
        draft.setNodes(normalizeNodes(request == null ? null : request.getNodes()));
        draft.setEvents(normalizeEvents(request == null ? null : request.getEvents()));
        return draft;
    }

    private void writeHistorySnapshot(ScreenBuilderDraftDocumentVO draft) throws IOException {
        writeHistorySnapshot(draft, true);
    }

    private void writeHistorySnapshot(ScreenBuilderDraftDocumentVO draft, boolean preferDraftCopy) throws IOException {
        Path draftPath = resolveDraftPath(draft.getMenuCode());
        Path historyDir = resolveHistoryDir(draft.getMenuCode());
        Files.createDirectories(historyDir);
        Path historyPath = historyDir.resolve(safe(draft.getVersionId()) + ".json");
        if (preferDraftCopy && Files.exists(draftPath)) {
            Files.copy(draftPath, historyPath, StandardCopyOption.REPLACE_EXISTING);
            return;
        }
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(historyPath.toFile(), draft);
    }

    private void validateDraft(ScreenBuilderDraftDocumentVO draft) {
        if (safe(draft.getMenuCode()).isEmpty()) {
            throw new IllegalArgumentException("menuCode is required");
        }
        if (draft.getNodes().isEmpty()) {
            throw new IllegalArgumentException("At least one node is required");
        }
        long rootCount = draft.getNodes().stream()
                .filter(node -> "page".equalsIgnoreCase(safe(node.getComponentType())))
                .count();
        if (rootCount != 1) {
            throw new IllegalArgumentException("Exactly one page root node is required");
        }
        List<String> authorityErrors = validateAuthorityProfile(draft, false);
        if (!authorityErrors.isEmpty()) {
            throw new IllegalArgumentException(authorityErrors.get(0));
        }
    }

    private List<String> validateAuthorityProfile(ScreenBuilderDraftDocumentVO draft, boolean publishing) {
        ScreenBuilderAuthorityProfileVO profile = draft == null ? null : draft.getAuthorityProfile();
        if (profile == null || safe(profile.getAuthorCode()).isEmpty()) {
            return Collections.singletonList(publishing
                    ? "Publish is blocked until an authority profile is assigned."
                    : "authorityProfile.authorCode is required");
        }
        try {
            FrameworkAuthorityRoleContractVO contractRole = findAuthorityRoleByAuthorCode(profile.getAuthorCode());
            if (contractRole == null) {
                return Collections.singletonList("authorityProfile.authorCode is not registered in the framework authority contract");
            }
            List<String> errors = new ArrayList<>();
            if (!safe(profile.getRoleKey()).isEmpty() && !safe(profile.getRoleKey()).equalsIgnoreCase(safe(contractRole.getRoleKey()))) {
                errors.add("authorityProfile.roleKey does not match the framework authority contract");
            }
            if (!safe(profile.getTier()).isEmpty() && !safe(profile.getTier()).equalsIgnoreCase(safe(contractRole.getTier()))) {
                errors.add("authorityProfile.tier does not match the framework authority contract");
            }
            if (!safe(profile.getScopePolicy()).isEmpty() && !safe(profile.getScopePolicy()).equalsIgnoreCase(safe(contractRole.getScopePolicy()))) {
                errors.add("authorityProfile.scopePolicy does not match the framework authority contract");
            }
            List<String> requestedFeatureCodes = normalizeStringList(profile.getFeatureCodes(), true);
            List<String> allowedFeatureCodes = normalizeStringList(contractRole.getFeatureCodes(), true);
            boolean wildcard = allowedFeatureCodes.contains("*");
            for (String featureCode : requestedFeatureCodes) {
                if (!wildcard && !allowedFeatureCodes.contains(featureCode)) {
                    errors.add("authorityProfile.featureCodes contains codes not granted by the selected role");
                    break;
                }
            }
            return errors;
        } catch (Exception e) {
            return Collections.singletonList("Failed to validate authorityProfile against the framework authority contract");
        }
    }

    private List<String> validateAuthorityEventAlignment(ScreenBuilderDraftDocumentVO draft, boolean publishing) {
        ScreenBuilderAuthorityProfileVO profile = draft == null ? null : draft.getAuthorityProfile();
        List<String> featureCodes = profile == null ? Collections.emptyList() : normalizeStringList(profile.getFeatureCodes(), true);
        String authorCode = profile == null ? "" : safe(profile.getAuthorCode()).toUpperCase(Locale.ROOT);
        boolean wildcard = featureCodes.contains("*") || "ROLE_SYSTEM_MASTER".equals(authorCode);
        if (draft == null || draft.getEvents() == null || draft.getEvents().isEmpty()) {
            return Collections.emptyList();
        }
        CommandAuthorityContext commandAuthorityContext = resolveCommandAuthorityContext(draft);
        List<String> errors = new ArrayList<>();
        for (ScreenBuilderEventBindingVO event : draft.getEvents()) {
            if (event == null) {
                continue;
            }
            String actionType = safe(event.getActionType()).toLowerCase(Locale.ROOT);
            Map<String, Object> actionConfig = event.getActionConfig() == null ? Collections.emptyMap() : event.getActionConfig();
            String explicitFeatureCode = safe(asString(actionConfig.get("featureCode"))).toUpperCase(Locale.ROOT);
            String explicitRequiredFeatureCode = safe(asString(actionConfig.get("requiredFeatureCode"))).toUpperCase(Locale.ROOT);
            String apiId = safe(asString(actionConfig.get("apiId")));
            boolean mutatingAction = isMutatingActionType(actionType);

            if (!apiId.isEmpty() && !commandAuthorityContext.allowedApiIds.isEmpty() && !commandAuthorityContext.allowedApiIds.contains(apiId)) {
                errors.add(publishing
                        ? "Publish is blocked because an event references an API that is not registered in the screen-command page."
                        : "event.actionConfig.apiId is not registered in the screen-command page");
                break;
            }
            if (!explicitFeatureCode.isEmpty() && !wildcard && !featureCodes.contains(explicitFeatureCode)) {
                errors.add(publishing
                        ? "Publish is blocked because an event requires a feature code outside the assigned authority profile."
                        : "event.actionConfig.featureCode is outside authorityProfile.featureCodes");
                break;
            }
            if (!explicitRequiredFeatureCode.isEmpty() && !wildcard && !featureCodes.contains(explicitRequiredFeatureCode)) {
                errors.add(publishing
                        ? "Publish is blocked because an event requires a requiredFeatureCode outside the assigned authority profile."
                        : "event.actionConfig.requiredFeatureCode is outside authorityProfile.featureCodes");
                break;
            }
            if ((mutatingAction || !apiId.isEmpty()) && !wildcard && featureCodes.isEmpty()) {
                errors.add(publishing
                        ? "Publish is blocked because API or mutating actions require an authority profile with feature grants."
                        : "authorityProfile.featureCodes must not be empty for API or mutating actions");
                break;
            }
            if ((mutatingAction || !apiId.isEmpty())
                    && !wildcard
                    && !commandAuthorityContext.menuFeatureCodes.isEmpty()
                    && Collections.disjoint(featureCodes, commandAuthorityContext.menuFeatureCodes)) {
                errors.add(publishing
                        ? "Publish is blocked because the authority profile does not overlap with the page menu permission feature set."
                        : "authorityProfile.featureCodes must overlap with screen-command menuPermission.featureCodes for API or mutating actions");
                break;
            }
        }
        return errors;
    }

    private CommandAuthorityContext resolveCommandAuthorityContext(ScreenBuilderDraftDocumentVO draft) {
        if (draft == null || safe(draft.getPageId()).isEmpty()) {
            return CommandAuthorityContext.empty();
        }
        try {
            Map<String, Object> response = screenCommandCenterService.getScreenCommandPage(draft.getPageId());
            Map<String, Object> page = safeMap(response.get("page"));
            Set<String> allowedApiIds = new LinkedHashSet<>();
            for (Map<String, Object> api : safeMapList(page.get("apis"))) {
                String apiId = safe(asString(api.get("apiId")));
                if (!apiId.isEmpty()) {
                    allowedApiIds.add(apiId);
                }
            }
            Map<String, Object> menuPermission = safeMap(page.get("menuPermission"));
            Set<String> menuFeatureCodes = new LinkedHashSet<>();
            for (String featureCode : safeStringList(menuPermission.get("featureCodes"))) {
                String normalized = safe(featureCode).toUpperCase(Locale.ROOT);
                if (!normalized.isEmpty()) {
                    menuFeatureCodes.add(normalized);
                }
            }
            String requiredViewFeatureCode = safe(asString(menuPermission.get("requiredViewFeatureCode"))).toUpperCase(Locale.ROOT);
            if (!requiredViewFeatureCode.isEmpty()) {
                menuFeatureCodes.add(requiredViewFeatureCode);
            }
            return new CommandAuthorityContext(allowedApiIds, menuFeatureCodes);
        } catch (Exception e) {
            return CommandAuthorityContext.empty();
        }
    }

    private boolean isMutatingActionType(String actionType) {
        String normalized = safe(actionType).toLowerCase(Locale.ROOT);
        return "api_call".equals(normalized)
                || "submit".equals(normalized)
                || "set_state".equals(normalized)
                || "toggle_section".equals(normalized)
                || "open_modal".equals(normalized)
                || "close_modal".equals(normalized);
    }

    private FrameworkAuthorityRoleContractVO findAuthorityRoleByAuthorCode(String authorCode) throws Exception {
        String normalizedAuthorCode = safe(authorCode).toUpperCase(Locale.ROOT);
        if (normalizedAuthorCode.isEmpty()) {
            return null;
        }
        List<FrameworkAuthorityRoleContractVO> roles = frameworkAuthorityContractService.getAuthorityContract().getAuthorityRoles();
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        for (FrameworkAuthorityRoleContractVO role : roles) {
            if (role != null && normalizedAuthorCode.equalsIgnoreCase(safe(role.getAuthorCode()))) {
                return role;
            }
        }
        return null;
    }

    private List<ScreenBuilderNodeVO> normalizeNodes(List<ScreenBuilderNodeVO> source) {
        if (source == null || source.isEmpty()) {
            return createEditPageNodes("Edit Page");
        }
        List<ScreenBuilderNodeVO> nodes = new ArrayList<>();
        int index = 0;
        for (ScreenBuilderNodeVO node : source) {
            ScreenBuilderNodeVO copy = new ScreenBuilderNodeVO();
            copy.setNodeId(firstNonBlank(node == null ? "" : node.getNodeId(), "node-" + index));
            copy.setComponentId(node == null ? "" : safe(node.getComponentId()));
            copy.setParentNodeId(node == null ? "" : safe(node.getParentNodeId()));
            copy.setComponentType(firstNonBlank(node == null ? "" : node.getComponentType(), "text"));
            copy.setSlotName(node == null ? "" : safe(node.getSlotName()));
            copy.setSortOrder(node == null ? index : node.getSortOrder());
            copy.setProps(node == null || node.getProps() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(node.getProps()));
            nodes.add(copy);
            index++;
        }
        return nodes;
    }

    private List<ScreenBuilderEventBindingVO> normalizeEvents(List<ScreenBuilderEventBindingVO> source) {
        if (source == null) {
            return new ArrayList<>();
        }
        List<ScreenBuilderEventBindingVO> events = new ArrayList<>();
        int index = 0;
        for (ScreenBuilderEventBindingVO item : source) {
            ScreenBuilderEventBindingVO copy = new ScreenBuilderEventBindingVO();
            copy.setEventBindingId(firstNonBlank(item == null ? "" : item.getEventBindingId(), "event-" + index));
            copy.setNodeId(item == null ? "" : safe(item.getNodeId()));
            copy.setEventName(firstNonBlank(item == null ? "" : item.getEventName(), "onClick"));
            copy.setActionType(firstNonBlank(item == null ? "" : item.getActionType(), "set_state"));
            copy.setActionConfig(item == null || item.getActionConfig() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(item.getActionConfig()));
            events.add(copy);
            index++;
        }
        return events;
    }

    private ScreenBuilderDraftDocumentVO createDefaultDraft(String pageId, String menuCode, String menuTitle, String menuUrl) throws Exception {
        MenuInfoDTO menu = findMenu(menuCode);
        ScreenBuilderDraftDocumentVO draft = new ScreenBuilderDraftDocumentVO();
        draft.setBuilderId("builder-" + (safe(menuCode).isEmpty() ? UUID.randomUUID() : safe(menuCode)));
        draft.setVersionId("draft-" + LocalDateTime.now().format(TIMESTAMP_FORMAT));
        draft.setPageId(firstNonBlank(pageId, derivePageId(menuCode, menu)));
        draft.setMenuCode(safe(menuCode));
        draft.setMenuTitle(firstNonBlank(menuTitle, menu == null ? "" : menu.getCodeNm()));
        draft.setMenuUrl(firstNonBlank(menuUrl, menu == null ? "" : menu.getMenuUrl()));
        draft.setTemplateType(resolveDefaultTemplateType(draft.getPageId(), draft.getMenuUrl()));
        draft.setAuthorityProfile(new ScreenBuilderAuthorityProfileVO());
        draft.setVersionStatus("DRAFT");
        draft.setNodes(createDefaultNodes(draft.getTemplateType(), draft.getPageId(), draft.getMenuTitle()));
        draft.setEvents(new ArrayList<>());
        return draft;
    }

    private ScreenBuilderAuthorityProfileVO normalizeAuthorityProfile(ScreenBuilderAuthorityProfileVO requested,
                                                                     ScreenBuilderAuthorityProfileVO current) {
        ScreenBuilderAuthorityProfileVO source = requested != null ? requested : current;
        ScreenBuilderAuthorityProfileVO profile = new ScreenBuilderAuthorityProfileVO();
        if (source == null) {
            return profile;
        }
        profile.setRoleKey(safe(source.getRoleKey()));
        profile.setAuthorCode(safe(source.getAuthorCode()).toUpperCase(Locale.ROOT));
        profile.setLabel(safe(source.getLabel()));
        profile.setDescription(safe(source.getDescription()));
        profile.setTier(safe(source.getTier()));
        profile.setActorType(safe(source.getActorType()));
        profile.setScopePolicy(safe(source.getScopePolicy()));
        profile.setHierarchyLevel(source.getHierarchyLevel() == null ? 0 : source.getHierarchyLevel());
        profile.setFeatureCodes(normalizeStringList(source.getFeatureCodes(), true));
        profile.setTags(normalizeStringList(source.getTags(), false));
        return profile;
    }

    private List<String> normalizeStringList(List<String> source, boolean uppercase) {
        if (source == null || source.isEmpty()) {
            return new ArrayList<>();
        }
        List<String> items = new ArrayList<>();
        for (String item : source) {
            String normalized = safe(item);
            if (uppercase) {
                normalized = normalized.toUpperCase(Locale.ROOT);
            }
            if (!normalized.isEmpty() && !items.contains(normalized)) {
                items.add(normalized);
            }
        }
        return items;
    }

    private List<ScreenBuilderNodeVO> createDefaultNodes(String templateType, String pageId, String menuTitle) {
        if ("LIST_PAGE".equalsIgnoreCase(safe(templateType)) || isListPageCandidate(pageId)) {
            return createListPageNodes(menuTitle);
        }
        return createEditPageNodes(menuTitle);
    }

    private List<ScreenBuilderNodeVO> createEditPageNodes(String menuTitle) {
        List<ScreenBuilderNodeVO> nodes = new ArrayList<>();
        nodes.add(node("root", "", "page", "root", 0, mapOf("title", firstNonBlank(menuTitle, "Edit Page"))));
        nodes.add(node("section-1", "root", "section", "content", 1, mapOf("title", "기본 섹션")));
        nodes.add(node("heading-1", "section-1", "heading", "content", 2, mapOf("text", "기본 정보")));
        nodes.add(node("input-1", "section-1", "input", "content", 3, mapOf("label", "필드명", "placeholder", "값 입력")));
        nodes.add(node("button-1", "section-1", "button", "actions", 4, mapOf("label", "저장", "variant", "primary")));
        return nodes;
    }

    private List<ScreenBuilderNodeVO> createListPageNodes(String menuTitle) {
        List<ScreenBuilderNodeVO> nodes = new ArrayList<>();
        nodes.add(node("root", "", "page", "root", 0, mapOf("title", firstNonBlank(menuTitle, "List Page"))));
        nodes.add(node("search-section", "root", "section", "content", 1, mapOf("title", "검색 조건")));
        nodes.add(node("search-heading", "search-section", "heading", "content", 2, mapOf("text", "회원 검색")));
        nodes.add(node("search-type", "search-section", "select", "content", 3, mapOf("label", "회원 유형", "placeholder", "회원 유형 선택")));
        nodes.add(node("search-status", "search-section", "select", "content", 4, mapOf("label", "상태", "placeholder", "상태 선택")));
        nodes.add(node("search-keyword", "search-section", "input", "content", 5, mapOf("label", "검색어", "placeholder", "신청자명, 아이디, 회사명 검색")));
        nodes.add(node("search-button", "search-section", "button", "actions", 6, mapOf("label", "검색", "variant", "primary")));
        nodes.add(node("toolbar-section", "root", "section", "content", 7, mapOf("title", "목록 액션")));
        nodes.add(node("toolbar-text", "toolbar-section", "text", "content", 8, mapOf("text", "총 건수, 엑셀 다운로드, 신규 등록 액션")));
        nodes.add(node("result-table", "root", "table", "content", 9, mapOf("title", "회원 목록", "columns", "번호|성명 (아이디)|회원 유형|소속 기관|가입일|상태|관리", "emptyText", "조회된 회원이 없습니다.")));
        nodes.add(node("result-pagination", "root", "pagination", "actions", 10, mapOf("summary", "페이지 이동 영역")));
        return nodes;
    }

    private ScreenBuilderNodeVO node(String nodeId, String parentNodeId, String type, String slotName, int sortOrder, Map<String, Object> props) {
        ScreenBuilderNodeVO node = new ScreenBuilderNodeVO();
        node.setNodeId(nodeId);
        node.setComponentId("");
        node.setParentNodeId(parentNodeId);
        node.setComponentType(type);
        node.setSlotName(slotName);
        node.setSortOrder(sortOrder);
        node.setProps(props);
        return node;
    }

    private static Map<String, Object> palette(String type, String labelEn, String labelKo, String description) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("componentType", type);
        row.put("label", labelKo);
        row.put("labelEn", labelEn);
        row.put("description", description);
        return row;
    }

    private Map<String, Object> mapOf(Object... values) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int index = 0; index + 1 < values.length; index += 2) {
            map.put(String.valueOf(values[index]), values[index + 1]);
        }
        return map;
    }

    private String resolveDefaultTemplateType(String pageId, String menuUrl) {
        if (isListPageCandidate(pageId) || safe(menuUrl).endsWith("/list")) {
            return "LIST_PAGE";
        }
        return DEFAULT_TEMPLATE_TYPE;
    }

    private boolean isListPageCandidate(String pageId) {
        String normalized = safe(pageId).toLowerCase(Locale.ROOT);
        return normalized.endsWith("list") || normalized.contains("member-list") || normalized.contains("company-list");
    }

    private MenuInfoDTO findMenu(String menuCode) throws Exception {
        String normalizedMenuCode = safe(menuCode);
        if (normalizedMenuCode.isEmpty()) {
            return null;
        }
        List<MenuInfoDTO> rows = new ArrayList<>(menuInfoService.selectMenuTreeList("AMENU1"));
        for (MenuInfoDTO row : rows) {
            if (normalizedMenuCode.equalsIgnoreCase(safe(row.getMenuCode()))) {
                return row;
            }
            if (normalizedMenuCode.equalsIgnoreCase(safe(row.getCode()))) {
                return row;
            }
        }
        return null;
    }

    private String derivePageId(String menuCode, MenuInfoDTO menu) {
        String url = menu == null ? "" : safe(menu.getMenuUrl());
        if (url.startsWith("/admin/system/")) {
            return url.substring("/admin/system/".length()).replace('_', '-').replace('/', '-');
        }
        if (url.startsWith("/admin/member/")) {
            return url.substring("/admin/member/".length()).replace('_', '-').replace('/', '-');
        }
        if (safe(menuCode).isEmpty()) {
            return "";
        }
        return "builder-" + safe(menuCode).toLowerCase(Locale.ROOT);
    }

    private Path resolveDraftPath(String menuCode) {
        return Paths.get("data", "screen-builder", safe(menuCode) + ".json");
    }

    private Path resolveHistoryDir(String menuCode) {
        return Paths.get("data", "screen-builder", "history", safe(menuCode));
    }

    private List<ScreenBuilderComponentRegistryItemVO> readComponentRegistry(boolean isEn) throws Exception {
        seedDefaultRegistryItems(isEn);
        importLegacyComponentRegistryIfPresent(isEn);
        return observabilityMapper.selectUiComponentRegistryList().stream()
                .map(this::mapRegistryRow)
                .sorted(Comparator.comparing(ScreenBuilderComponentRegistryItemVO::getSourceType, Comparator.nullsLast(String::compareTo))
                        .thenComparing(ScreenBuilderComponentRegistryItemVO::getComponentId, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());
    }

    private boolean containsComponentId(List<ScreenBuilderComponentRegistryItemVO> items, String componentId) {
        String normalized = safe(componentId);
        if (normalized.isEmpty()) {
            return false;
        }
        return items.stream().anyMatch(item -> normalized.equalsIgnoreCase(safe(item.getComponentId())));
    }

    private String buildSuggestedComponentId(String componentType, String label) {
        String base = ("comp." + safe(componentType) + "." + safe(label))
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "")
                .replaceAll("-{2,}", "-");
        return base.isEmpty() ? "comp." + safe(componentType) + "." + UUID.randomUUID().toString().substring(0, 8) : base;
    }

    private List<ScreenBuilderComponentRegistryItemVO> createDefaultComponentRegistry(boolean isEn) {
        List<ScreenBuilderComponentRegistryItemVO> rows = new ArrayList<>();
        rows.add(defaultRegistryItem("core.page", "page", isEn ? "Page Root" : "페이지 루트", "System root container", mapOf("title", "Edit Page")));
        rows.add(defaultRegistryItem("core.section", "section", isEn ? "Section" : "섹션", "Reusable layout section", mapOf("title", isEn ? "Section" : "섹션")));
        rows.add(defaultRegistryItem("core.heading", "heading", isEn ? "Heading" : "제목", "Static heading text", mapOf("text", isEn ? "Heading" : "제목")));
        rows.add(defaultRegistryItem("core.text", "text", isEn ? "Text" : "설명", "Static description text", mapOf("text", isEn ? "Description" : "설명")));
        rows.add(defaultRegistryItem("core.input", "input", isEn ? "Input" : "입력", "Single line input field", mapOf("label", isEn ? "Input" : "입력", "placeholder", isEn ? "Type a value" : "값 입력")));
        rows.add(defaultRegistryItem("core.textarea", "textarea", isEn ? "Textarea" : "긴 입력", "Multiline text field", mapOf("label", isEn ? "Textarea" : "긴 입력", "placeholder", isEn ? "Type details" : "상세 입력")));
        rows.add(defaultRegistryItem("core.select", "select", isEn ? "Select" : "선택", "Selectable option input", mapOf("label", isEn ? "Select" : "선택", "placeholder", isEn ? "Choose one" : "옵션 선택")));
        rows.add(defaultRegistryItem("core.checkbox", "checkbox", isEn ? "Checkbox" : "체크박스", "Boolean agreement field", mapOf("label", isEn ? "Checkbox" : "체크박스", "required", false)));
        rows.add(defaultRegistryItem("core.button", "button", isEn ? "Button" : "버튼", "Action button", mapOf("label", isEn ? "Submit" : "저장", "variant", "primary")));
        rows.add(defaultRegistryItem("core.table", "table", isEn ? "Table" : "테이블", "List result block", mapOf("title", isEn ? "Result Table" : "목록 테이블", "columns", isEn ? "No.|Name|Type|Company|Joined|Status|Actions" : "번호|성명|회원 유형|소속 기관|가입일|상태|관리", "emptyText", isEn ? "No rows found." : "조회된 데이터가 없습니다.")));
        rows.add(defaultRegistryItem("core.pagination", "pagination", isEn ? "Pagination" : "페이지네이션", "Paged result navigator", mapOf("summary", isEn ? "Page 1 of 1" : "1 / 1 페이지")));
        return rows;
    }

    private ScreenBuilderComponentRegistryItemVO defaultRegistryItem(String componentId, String componentType, String label, String description, Map<String, Object> propsTemplate) {
        ScreenBuilderComponentRegistryItemVO item = new ScreenBuilderComponentRegistryItemVO();
        item.setComponentId(componentId);
        item.setComponentType(componentType);
        item.setLabel(label);
        item.setDescription(description);
        item.setStatus(ACTIVE_STATUS);
        item.setReplacementComponentId("");
        item.setSourceType("SYSTEM");
        item.setCreatedAt("SYSTEM");
        item.setUpdatedAt("SYSTEM");
        item.setPropsTemplate(propsTemplate == null ? new LinkedHashMap<>() : new LinkedHashMap<>(propsTemplate));
        return item;
    }

    private ScreenBuilderComponentRegistryItemVO findRegistryItem(List<ScreenBuilderComponentRegistryItemVO> items, String componentId) {
        for (ScreenBuilderComponentRegistryItemVO item : items) {
            if (safe(componentId).equalsIgnoreCase(safe(item.getComponentId()))) {
                return item;
            }
        }
        return null;
    }

    private void seedDefaultRegistryItems(boolean isEn) throws Exception {
        for (ScreenBuilderComponentRegistryItemVO item : createDefaultComponentRegistry(isEn)) {
            if (observabilityMapper.countUiComponentRegistry(item.getComponentId()) > 0) {
                continue;
            }
            upsertComponentRegistryItem(item);
        }
    }

    private void importLegacyComponentRegistryIfPresent(boolean isEn) throws Exception {
        Path path = Paths.get("data", "screen-builder", "component-registry.json");
        if (!Files.exists(path)) {
            return;
        }
        try (InputStream inputStream = Files.newInputStream(path)) {
            ScreenBuilderComponentRegistryItemVO[] rows = objectMapper.readValue(inputStream, ScreenBuilderComponentRegistryItemVO[].class);
            if (rows == null) {
                return;
            }
            for (ScreenBuilderComponentRegistryItemVO row : rows) {
                if (row == null || safe(row.getComponentId()).isEmpty()) {
                    continue;
                }
                if (observabilityMapper.countUiComponentRegistry(row.getComponentId()) > 0) {
                    continue;
                }
                if (safe(row.getStatus()).isEmpty()) {
                    row.setStatus(ACTIVE_STATUS);
                }
                if (safe(row.getSourceType()).isEmpty()) {
                    row.setSourceType("CUSTOM");
                }
                upsertComponentRegistryItem(row);
            }
        }
    }

    private void upsertComponentRegistryItem(ScreenBuilderComponentRegistryItemVO item) throws Exception {
        UiComponentRegistryVO row = new UiComponentRegistryVO();
        row.setComponentId(safe(item.getComponentId()));
        row.setComponentName(firstNonBlank(item.getLabel(), item.getComponentId()));
        row.setComponentType(firstNonBlank(item.getComponentType(), "button"));
        row.setOwnerDomain(firstNonBlank(item.getSourceType(), "CUSTOM"));
        row.setPropsSchemaJson(buildRegistryMetadataJson(item));
        row.setDesignReference(safe(item.getDescription()));
        row.setActiveYn("INACTIVE".equalsIgnoreCase(safe(item.getStatus())) ? "N" : "Y");
        if (observabilityMapper.countUiComponentRegistry(row.getComponentId()) > 0) {
            observabilityMapper.updateUiComponentRegistry(row);
        } else {
            observabilityMapper.insertUiComponentRegistry(row);
        }
    }

    private String buildRegistryMetadataJson(ScreenBuilderComponentRegistryItemVO item) throws Exception {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("propsTemplate", item.getPropsTemplate() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(item.getPropsTemplate()));
        metadata.put("labelEn", safe(item.getLabelEn()));
        metadata.put("description", safe(item.getDescription()));
        metadata.put("status", firstNonBlank(item.getStatus(), ACTIVE_STATUS));
        metadata.put("replacementComponentId", safe(item.getReplacementComponentId()));
        metadata.put("sourceType", firstNonBlank(item.getSourceType(), "CUSTOM"));
        return objectMapper.writeValueAsString(metadata);
    }

    private ScreenBuilderComponentRegistryItemVO mapRegistryRow(UiComponentRegistryVO row) {
        ScreenBuilderComponentRegistryItemVO item = new ScreenBuilderComponentRegistryItemVO();
        item.setComponentId(safe(row.getComponentId()));
        item.setComponentType(safe(row.getComponentType()));
        item.setLabel(firstNonBlank(row.getComponentName(), row.getComponentId()));
        item.setLabelEn("");
        item.setDescription(safe(row.getDesignReference()));
        item.setStatus("Y".equalsIgnoreCase(safe(row.getActiveYn())) ? ACTIVE_STATUS : "INACTIVE");
        item.setReplacementComponentId("");
        item.setSourceType(firstNonBlank(row.getOwnerDomain(), "CUSTOM"));
        item.setCreatedAt(safe(row.getCreatedAt()));
        item.setUpdatedAt(safe(row.getUpdatedAt()));
        item.setPropsTemplate(new LinkedHashMap<>());
        Map<String, Object> metadata = parseRegistryMetadata(row.getPropsSchemaJson());
        item.setLabelEn(safe(asString(metadata.get("labelEn"))));
        item.setDescription(firstNonBlank(asString(metadata.get("description")), item.getDescription()));
        item.setStatus(firstNonBlank(asString(metadata.get("status")), item.getStatus()));
        item.setReplacementComponentId(safe(asString(metadata.get("replacementComponentId"))));
        item.setSourceType(firstNonBlank(asString(metadata.get("sourceType")), item.getSourceType()));
        Object propsTemplate = metadata.get("propsTemplate");
        if (propsTemplate instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> casted = new LinkedHashMap<>((Map<String, Object>) propsTemplate);
            item.setPropsTemplate(casted);
        }
        item.setUsageCount(getComponentUsageCount(item.getComponentId()));
        return item;
    }

    private Map<String, Object> parseRegistryMetadata(String json) {
        String normalized = safe(json);
        if (normalized.isEmpty()) {
            return new LinkedHashMap<>();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> metadata = objectMapper.readValue(normalized.getBytes(StandardCharsets.UTF_8), LinkedHashMap.class);
            return metadata == null ? new LinkedHashMap<>() : metadata;
        } catch (IOException ignored) {
            return new LinkedHashMap<>();
        }
    }

    private int getComponentUsageCount(String componentId) {
        try {
            return observabilityMapper.selectUiComponentUsageList(componentId).size()
                    + scanBuilderDraftUsage(componentId, false).size()
                    + scanBuilderDraftUsage(componentId, true).size();
        } catch (Exception ignored) {
            return 0;
        }
    }

    private List<ScreenBuilderComponentUsageVO> scanBuilderDraftUsage(String componentId, boolean publishedOnly) throws Exception {
        List<ScreenBuilderComponentUsageVO> usages = new ArrayList<>();
        Path draftRoot = Paths.get("data", "screen-builder");
        if (!Files.exists(draftRoot)) {
            return usages;
        }
        if (publishedOnly) {
            Path historyRoot = draftRoot.resolve("history");
            if (!Files.exists(historyRoot)) {
                return usages;
            }
            try (Stream<Path> menuDirs = Files.list(historyRoot)) {
                for (Path menuDir : menuDirs.filter(Files::isDirectory).collect(Collectors.toList())) {
                    ScreenBuilderDraftDocumentVO published = getLatestPublishedDraft(menuDir.getFileName().toString());
                    if (published != null) {
                        usages.addAll(collectDocumentComponentUsage(published, componentId, "PUBLISHED"));
                    }
                }
            }
            return usages;
        }
        try (Stream<Path> stream = Files.list(draftRoot)) {
            for (Path file : stream.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".json"))
                    .filter(path -> !"component-registry.json".equals(path.getFileName().toString()))
                    .collect(Collectors.toList())) {
                try (InputStream inputStream = Files.newInputStream(file)) {
                    ScreenBuilderDraftDocumentVO draft = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                    usages.addAll(collectDocumentComponentUsage(draft, componentId, "DRAFT"));
                }
            }
        }
        return usages;
    }

    private List<ScreenBuilderComponentUsageVO> collectDocumentComponentUsage(ScreenBuilderDraftDocumentVO document, String componentId, String usageSource) {
        List<ScreenBuilderComponentUsageVO> usages = new ArrayList<>();
        if (document == null || document.getNodes() == null) {
            return usages;
        }
        for (ScreenBuilderNodeVO node : document.getNodes()) {
            if (!safe(componentId).equalsIgnoreCase(safe(node.getComponentId()))) {
                continue;
            }
            ScreenBuilderComponentUsageVO row = new ScreenBuilderComponentUsageVO();
            row.setUsageSource(usageSource);
            row.setUsageStatus(firstNonBlank(document.getVersionStatus(), usageSource));
            row.setMenuCode(safe(document.getMenuCode()));
            row.setPageId(safe(document.getPageId()));
            row.setMenuTitle(firstNonBlank(document.getMenuTitle(), document.getPageId()));
            row.setMenuUrl(safe(document.getMenuUrl()));
            row.setLayoutZone(safe(node.getSlotName()));
            row.setInstanceKey(firstNonBlank(asString(node.getProps().get("label")), asString(node.getProps().get("title")), asString(node.getProps().get("text")), node.getNodeId()));
            row.setNodeId(safe(node.getNodeId()));
            row.setComponentId(safe(node.getComponentId()));
            row.setVersionId(safe(document.getVersionId()));
            usages.add(row);
        }
        return usages;
    }

    private int replaceComponentIdAcrossDrafts(String fromComponentId, String toComponentId, boolean publishedOnly) throws Exception {
        int updatedDraftCount = 0;
        if (publishedOnly) {
            return 0;
        }
        Path draftRoot = Paths.get("data", "screen-builder");
        if (!Files.exists(draftRoot)) {
            return updatedDraftCount;
        }
        try (Stream<Path> stream = Files.list(draftRoot)) {
            for (Path file : stream.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith(".json"))
                    .filter(path -> !"component-registry.json".equals(path.getFileName().toString()))
                    .collect(Collectors.toList())) {
                boolean changed = false;
                ScreenBuilderDraftDocumentVO draft;
                try (InputStream inputStream = Files.newInputStream(file)) {
                    draft = objectMapper.readValue(inputStream, ScreenBuilderDraftDocumentVO.class);
                }
                for (ScreenBuilderNodeVO node : draft.getNodes()) {
                    if (safe(fromComponentId).equalsIgnoreCase(safe(node.getComponentId()))) {
                        node.setComponentId(toComponentId);
                        changed = true;
                    }
                }
                if (changed) {
                    draft.setVersionId(UUID.randomUUID().toString());
                    draft.setVersionStatus("DRAFT");
                    objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), draft);
                    writeHistorySnapshot(draft);
                    updatedDraftCount++;
                }
            }
        }
        return updatedDraftCount;
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> safeMap(Object value) {
        if (!(value instanceof Map)) {
            return Collections.emptyMap();
        }
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> safeMapList(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : (List<?>) value) {
            if (item instanceof Map) {
                rows.add((Map<String, Object>) item);
            }
        }
        return rows;
    }

    private List<String> safeStringList(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<String> rows = new ArrayList<>();
        for (Object item : (List<?>) value) {
            if (item != null) {
                rows.add(String.valueOf(item));
            }
        }
        return rows;
    }

    private static final class CommandAuthorityContext {
        private final Set<String> allowedApiIds;
        private final Set<String> menuFeatureCodes;

        private CommandAuthorityContext(Set<String> allowedApiIds, Set<String> menuFeatureCodes) {
            this.allowedApiIds = allowedApiIds == null ? Collections.emptySet() : allowedApiIds;
            this.menuFeatureCodes = menuFeatureCodes == null ? Collections.emptySet() : menuFeatureCodes;
        }

        private static CommandAuthorityContext empty() {
            return new CommandAuthorityContext(Collections.emptySet(), Collections.emptySet());
        }
    }

    private Map<String, Object> buildRegistryDiagnostics(ScreenBuilderDraftDocumentVO draft, List<ScreenBuilderComponentRegistryItemVO> registry) {
        Map<String, Object> diagnostics = new LinkedHashMap<>();
        Map<String, ScreenBuilderComponentRegistryItemVO> registryMap = new LinkedHashMap<>();
        for (ScreenBuilderComponentRegistryItemVO item : registry) {
            registryMap.put(safe(item.getComponentId()), item);
        }
        List<Map<String, Object>> unregisteredNodes = new ArrayList<>();
        List<Map<String, Object>> missingNodes = new ArrayList<>();
        List<Map<String, Object>> deprecatedNodes = new ArrayList<>();
        for (ScreenBuilderNodeVO node : draft.getNodes()) {
            if ("page".equalsIgnoreCase(safe(node.getComponentType()))) {
                continue;
            }
            String componentId = safe(node.getComponentId());
            if (componentId.isEmpty()) {
                unregisteredNodes.add(nodeIssue(node, "UNREGISTERED", null));
                continue;
            }
            ScreenBuilderComponentRegistryItemVO item = registryMap.get(componentId);
            if (item == null) {
                missingNodes.add(nodeIssue(node, "MISSING", null));
                continue;
            }
            if ("DEPRECATED".equalsIgnoreCase(safe(item.getStatus()))) {
                deprecatedNodes.add(nodeIssue(node, "DEPRECATED", item.getReplacementComponentId()));
            }
        }
        diagnostics.put("unregisteredNodes", unregisteredNodes);
        diagnostics.put("missingNodes", missingNodes);
        diagnostics.put("deprecatedNodes", deprecatedNodes);
        diagnostics.put("componentPromptSurface", registry.stream().map(this::promptSurface).collect(Collectors.toList()));
        return diagnostics;
    }

    private Map<String, Object> buildDeprecatedReplacementPlan(ScreenBuilderDraftDocumentVO draft, boolean isEn) throws Exception {
        List<ScreenBuilderComponentRegistryItemVO> registry = getComponentRegistry(isEn);
        Map<String, ScreenBuilderComponentRegistryItemVO> registryMap = new LinkedHashMap<>();
        for (ScreenBuilderComponentRegistryItemVO item : registry) {
            registryMap.put(safe(item.getComponentId()), item);
        }
        int replacedCount = 0;
        List<Map<String, Object>> items = new ArrayList<>();
        List<ScreenBuilderNodeVO> nextNodes = new ArrayList<>();
        for (ScreenBuilderNodeVO node : draft.getNodes()) {
            ScreenBuilderNodeVO next = node;
            String componentId = safe(node.getComponentId());
            ScreenBuilderComponentRegistryItemVO item = registryMap.get(componentId);
            if (item != null
                    && "DEPRECATED".equalsIgnoreCase(safe(item.getStatus()))
                    && !safe(item.getReplacementComponentId()).isEmpty()
                    && registryMap.containsKey(safe(item.getReplacementComponentId()))) {
                ScreenBuilderComponentRegistryItemVO replacement = registryMap.get(safe(item.getReplacementComponentId()));
                next = new ScreenBuilderNodeVO();
                next.setNodeId(node.getNodeId());
                next.setComponentId(replacement.getComponentId());
                next.setParentNodeId(node.getParentNodeId());
                next.setComponentType(firstNonBlank(replacement.getComponentType(), node.getComponentType()));
                next.setSlotName(node.getSlotName());
                next.setSortOrder(node.getSortOrder());
                next.setProps(replacement.getPropsTemplate() == null || replacement.getPropsTemplate().isEmpty()
                        ? new LinkedHashMap<>(node.getProps())
                        : new LinkedHashMap<>(replacement.getPropsTemplate()));
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("nodeId", safe(node.getNodeId()));
                row.put("fromComponentId", safe(node.getComponentId()));
                row.put("toComponentId", safe(replacement.getComponentId()));
                row.put("label", firstNonBlank(
                        String.valueOf(node.getProps().getOrDefault("label", "")),
                        String.valueOf(node.getProps().getOrDefault("title", "")),
                        String.valueOf(node.getProps().getOrDefault("text", "")),
                        safe(node.getNodeId())
                ));
                items.add(row);
                replacedCount++;
            }
            nextNodes.add(next);
        }
        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("replacedCount", replacedCount);
        plan.put("items", items);
        plan.put("nextNodes", nextNodes);
        return plan;
    }

    private int sizeOfList(Object value) {
        return value instanceof List ? ((List<?>) value).size() : 0;
    }

    private String findDefaultParentNodeId(ScreenBuilderDraftDocumentVO draft, String componentType) {
        if ("section".equalsIgnoreCase(safe(componentType))) {
            for (ScreenBuilderNodeVO node : draft.getNodes()) {
                if ("page".equalsIgnoreCase(safe(node.getComponentType()))) {
                    return safe(node.getNodeId());
                }
            }
        }
        for (ScreenBuilderNodeVO node : draft.getNodes()) {
            if ("section".equalsIgnoreCase(safe(node.getComponentType()))) {
                return safe(node.getNodeId());
            }
        }
        for (ScreenBuilderNodeVO node : draft.getNodes()) {
            if ("page".equalsIgnoreCase(safe(node.getComponentType()))) {
                return safe(node.getNodeId());
            }
        }
        return "";
    }

    private List<ScreenBuilderNodeVO> sortNodesForPersistence(List<ScreenBuilderNodeVO> nodes) {
        List<ScreenBuilderNodeVO> sorted = new ArrayList<>(nodes);
        sorted.sort(Comparator.comparingInt(ScreenBuilderNodeVO::getSortOrder).thenComparing(ScreenBuilderNodeVO::getNodeId, Comparator.nullsLast(String::compareTo)));
        for (int index = 0; index < sorted.size(); index++) {
            sorted.get(index).setSortOrder(index);
        }
        return sorted;
    }

    private Map<String, Object> nodeIssue(ScreenBuilderNodeVO node, String reason, String replacementComponentId) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("nodeId", safe(node.getNodeId()));
        row.put("componentId", safe(node.getComponentId()));
        row.put("componentType", safe(node.getComponentType()));
        row.put("label", firstNonBlank(
                String.valueOf(node.getProps().getOrDefault("label", "")),
                String.valueOf(node.getProps().getOrDefault("title", "")),
                String.valueOf(node.getProps().getOrDefault("text", "")),
                safe(node.getNodeId())
        ));
        row.put("reason", reason);
        row.put("replacementComponentId", safe(replacementComponentId));
        return row;
    }

    private Map<String, Object> promptSurface(ScreenBuilderComponentRegistryItemVO item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("componentId", safe(item.getComponentId()));
        row.put("componentType", safe(item.getComponentType()));
        row.put("status", safe(item.getStatus()));
        row.put("replacementComponentId", safe(item.getReplacementComponentId()));
        row.put("label", safe(item.getLabel()));
        row.put("description", safe(item.getDescription()));
        row.put("allowedPropKeys", item.getPropsTemplate() == null ? new ArrayList<>() : new ArrayList<>(item.getPropsTemplate().keySet()));
        row.put("propsTemplate", item.getPropsTemplate() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(item.getPropsTemplate()));
        return row;
    }

    private String extractSavedAt(String versionId, Path file) {
        String normalizedVersionId = safe(versionId);
        if (normalizedVersionId.startsWith("draft-") && normalizedVersionId.length() > "draft-".length()) {
            return normalizedVersionId.substring("draft-".length());
        }
        String fileName = file == null ? "" : safe(file.getFileName().toString()).replace(".json", "");
        return fileName;
    }

    private ScreenBuilderVersionSummaryVO findLatestPublishedVersion(List<ScreenBuilderVersionSummaryVO> history) {
        if (history == null || history.isEmpty()) {
            return null;
        }
        for (ScreenBuilderVersionSummaryVO item : history) {
            if ("PUBLISHED".equalsIgnoreCase(safe(item.getVersionStatus()))) {
                return item;
            }
        }
        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!safe(value).isEmpty()) {
                return safe(value);
            }
        }
        return "";
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }
}
