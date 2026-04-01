package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.safe;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.stringValue;

final class EmissionCalculationResultTransformer {
    private final ObjectMapper objectMapper;

    EmissionCalculationResultTransformer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    String writeSnapshotJson(CalculationResult result) {
        try {
            return objectMapper.writeValueAsString(result.snapshot());
        } catch (Exception ignored) {
            return "[]";
        }
    }

    Map<String, Object> enrichStoredResult(Map<String, Object> storedResult) {
        if (storedResult == null || storedResult.isEmpty()) {
            return storedResult;
        }
        Object snapshotJson = storedResult.get("factorSnapshotJson");
        if (!(snapshotJson instanceof String) || safe((String) snapshotJson).isEmpty()) {
            return storedResult;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> snapshot = objectMapper.readValue((String) snapshotJson, LinkedHashMap.class);
            storedResult.put("appliedFactors", snapshot.getOrDefault("appliedFactors", Collections.emptyList()));
            storedResult.put("formulaDisplay", snapshot.getOrDefault("formulaDisplay", ""));
            storedResult.put("substitutedFormula", snapshot.getOrDefault("substitutedFormula", ""));
            storedResult.put("calculationLogs", snapshot.getOrDefault("calculationLogs", Collections.emptyList()));
            storedResult.put("defaultApplied", "Y".equalsIgnoreCase(stringValue(storedResult.get("defaultAppliedYn"))));
        } catch (Exception ignored) {
            storedResult.put("appliedFactors", Collections.emptyList());
            storedResult.put("formulaDisplay", "");
            storedResult.put("substitutedFormula", "");
            storedResult.put("calculationLogs", Collections.emptyList());
            storedResult.put("defaultApplied", "Y".equalsIgnoreCase(stringValue(storedResult.get("defaultAppliedYn"))));
        }
        return storedResult;
    }
}
