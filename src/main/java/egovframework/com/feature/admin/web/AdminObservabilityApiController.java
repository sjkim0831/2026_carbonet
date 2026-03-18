package egovframework.com.feature.admin.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.common.audit.AuditEventRecordVO;
import egovframework.com.common.audit.AuditEventSearchVO;
import egovframework.com.common.service.ObservabilityQueryService;
import egovframework.com.common.trace.TraceEventSearchVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/observability")
public class AdminObservabilityApiController {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<Map<String, Object>>() {};
    private final ObservabilityQueryService observabilityQueryService;

    @GetMapping("/audit-events")
    public ResponseEntity<Map<String, Object>> searchAuditEvents(
            @RequestParam(value = "pageIndex", required = false, defaultValue = "1") int pageIndex,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "actorId", required = false) String actorId,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            @RequestParam(value = "menuCode", required = false) String menuCode,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "resultStatus", required = false) String resultStatus,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        AuditEventSearchVO searchVO = new AuditEventSearchVO();
        searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * Math.max(pageSize, 1));
        searchVO.setRecordCountPerPage(Math.max(pageSize, 1));
        searchVO.setTraceId(safe(traceId));
        searchVO.setActorId(safe(actorId));
        searchVO.setActionCode(safe(actionCode));
        searchVO.setMenuCode(safe(menuCode));
        searchVO.setPageId(safe(pageId));
        searchVO.setResultStatus(safe(resultStatus));
        searchVO.setSearchKeyword(safe(searchKeyword));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pageIndex", pageIndex);
        response.put("pageSize", pageSize);
        response.put("totalCount", observabilityQueryService.selectAuditEventCount(searchVO));
        response.put("items", enrichAuditItems(observabilityQueryService.selectAuditEventList(searchVO)));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trace-events")
    public ResponseEntity<Map<String, Object>> searchTraceEvents(
            @RequestParam(value = "pageIndex", required = false, defaultValue = "1") int pageIndex,
            @RequestParam(value = "pageSize", required = false, defaultValue = "20") int pageSize,
            @RequestParam(value = "traceId", required = false) String traceId,
            @RequestParam(value = "pageId", required = false) String pageId,
            @RequestParam(value = "componentId", required = false) String componentId,
            @RequestParam(value = "functionId", required = false) String functionId,
            @RequestParam(value = "apiId", required = false) String apiId,
            @RequestParam(value = "eventType", required = false) String eventType,
            @RequestParam(value = "resultCode", required = false) String resultCode,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword) {
        TraceEventSearchVO searchVO = new TraceEventSearchVO();
        searchVO.setFirstIndex(Math.max(pageIndex - 1, 0) * Math.max(pageSize, 1));
        searchVO.setRecordCountPerPage(Math.max(pageSize, 1));
        searchVO.setTraceId(safe(traceId));
        searchVO.setPageId(safe(pageId));
        searchVO.setComponentId(safe(componentId));
        searchVO.setFunctionId(safe(functionId));
        searchVO.setApiId(safe(apiId));
        searchVO.setEventType(safe(eventType));
        searchVO.setResultCode(safe(resultCode));
        searchVO.setSearchKeyword(safe(searchKeyword));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pageIndex", pageIndex);
        response.put("pageSize", pageSize);
        response.put("totalCount", observabilityQueryService.selectTraceEventCount(searchVO));
        response.put("items", observabilityQueryService.selectTraceEventList(searchVO));
        return ResponseEntity.ok(response);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private List<Map<String, Object>> enrichAuditItems(List<AuditEventRecordVO> items) {
        List<Map<String, Object>> enriched = new ArrayList<>();
        if (items == null) {
            return enriched;
        }
        for (AuditEventRecordVO item : items) {
            Map<String, Object> row = OBJECT_MAPPER.convertValue(item, MAP_TYPE);
            Map<String, Object> before = parseSnapshot(item.getBeforeSummaryJson());
            Map<String, Object> after = parseSnapshot(item.getAfterSummaryJson());
            List<Map<String, Object>> changedFields = buildChangedFields(before, after);
            List<String> addedFeatureCodes = buildAddedFeatureCodes(before, after);
            List<String> removedFeatureCodes = buildRemovedFeatureCodes(before, after);
            row.put("changedFields", changedFields);
            row.put("addedFeatureCodes", addedFeatureCodes);
            row.put("removedFeatureCodes", removedFeatureCodes);
            row.put("interpretedDiffSummary", buildInterpretedDiffSummary(changedFields, addedFeatureCodes, removedFeatureCodes));
            enriched.add(row);
        }
        return enriched;
    }

    private Map<String, Object> parseSnapshot(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new LinkedHashMap<>();
        }
        try {
            Map<String, Object> parsed = OBJECT_MAPPER.readValue(json, MAP_TYPE);
            return parsed == null ? new LinkedHashMap<>() : parsed;
        } catch (Exception ignored) {
            return new LinkedHashMap<>();
        }
    }

    private List<Map<String, Object>> buildChangedFields(Map<String, Object> before, Map<String, Object> after) {
        Set<String> keys = new LinkedHashSet<>();
        keys.addAll(before.keySet());
        keys.addAll(after.keySet());
        List<Map<String, Object>> changed = new ArrayList<>();
        for (String key : keys) {
            Object beforeValue = before.get(key);
            Object afterValue = after.get(key);
            if (Objects.equals(normalizeScalar(beforeValue), normalizeScalar(afterValue))) {
                continue;
            }
            if (isFeatureCollectionKey(key)) {
                continue;
            }
            Map<String, Object> field = new LinkedHashMap<>();
            field.put("field", key);
            field.put("before", normalizeScalar(beforeValue));
            field.put("after", normalizeScalar(afterValue));
            changed.add(field);
        }
        return changed;
    }

    private List<String> buildAddedFeatureCodes(Map<String, Object> before, Map<String, Object> after) {
        Set<String> beforeCodes = new LinkedHashSet<>(extractFeatureCodes(before));
        Set<String> afterCodes = new LinkedHashSet<>(extractFeatureCodes(after));
        List<String> added = new ArrayList<>();
        for (String code : afterCodes) {
            if (!beforeCodes.contains(code)) {
                added.add(code);
            }
        }
        return added;
    }

    private List<String> buildRemovedFeatureCodes(Map<String, Object> before, Map<String, Object> after) {
        Set<String> beforeCodes = new LinkedHashSet<>(extractFeatureCodes(before));
        Set<String> afterCodes = new LinkedHashSet<>(extractFeatureCodes(after));
        List<String> removed = new ArrayList<>();
        for (String code : beforeCodes) {
            if (!afterCodes.contains(code)) {
                removed.add(code);
            }
        }
        return removed;
    }

    private List<String> extractFeatureCodes(Object value) {
        List<String> result = new ArrayList<>();
        if (value == null) {
            return result;
        }
        if (value instanceof String) {
            String text = safe((String) value);
            if (!text.isEmpty() && (text.contains("_") || text.startsWith("ROLE_"))) {
                result.add(text);
            }
            return result;
        }
        if (value instanceof Collection<?>) {
            for (Object item : (Collection<?>) value) {
                result.addAll(extractFeatureCodes(item));
            }
            return result;
        }
        if (value instanceof Map<?, ?>) {
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) value).entrySet()) {
                String key = entry.getKey() == null ? "" : entry.getKey().toString();
                if (isFeatureCollectionKey(key)) {
                    result.addAll(extractFeatureCodes(entry.getValue()));
                }
            }
        }
        return result;
    }

    private boolean isFeatureCollectionKey(String key) {
        return "selectedFeatureCodes".equals(key)
                || "featureCodes".equals(key)
                || "features".equals(key)
                || "grantedFeatures".equals(key)
                || "mappedFeatures".equals(key);
    }

    private Object normalizeScalar(Object value) {
        if (value instanceof Map || value instanceof Collection) {
            return null;
        }
        return value == null ? "" : value;
    }

    private String buildInterpretedDiffSummary(List<Map<String, Object>> changedFields,
                                               List<String> addedFeatureCodes,
                                               List<String> removedFeatureCodes) {
        List<String> parts = new ArrayList<>();
        if (!changedFields.isEmpty()) {
            List<String> labels = new ArrayList<>();
            for (Map<String, Object> field : changedFields) {
                labels.add(String.valueOf(field.get("field")));
                if (labels.size() >= 3) {
                    break;
                }
            }
            parts.add("fields:" + String.join(",", labels) + (changedFields.size() > 3 ? "+" + (changedFields.size() - 3) : ""));
        }
        if (!addedFeatureCodes.isEmpty()) {
            parts.add("added:" + String.join(",", addedFeatureCodes.subList(0, Math.min(3, addedFeatureCodes.size()))) + (addedFeatureCodes.size() > 3 ? "+" + (addedFeatureCodes.size() - 3) : ""));
        }
        if (!removedFeatureCodes.isEmpty()) {
            parts.add("removed:" + String.join(",", removedFeatureCodes.subList(0, Math.min(3, removedFeatureCodes.size()))) + (removedFeatureCodes.size() > 3 ? "+" + (removedFeatureCodes.size() - 3) : ""));
        }
        return String.join(" / ", parts);
    }
}
