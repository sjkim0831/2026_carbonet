package egovframework.com.feature.admin.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class CalculationTrace {
    private final List<Map<String, Object>> appliedFactors = new ArrayList<>();
    private final List<Map<String, Object>> calculationLogs = new ArrayList<>();
    private boolean defaultApplied;

    void addResolvedFactor(String factorCode, ResolvedFactor factor) {
        addFactor(factorCode, factor.value, factor.defaultApplied);
    }

    void addFactor(String factorCode, double factorValue, boolean defaultApplied) {
        appliedFactors.add(factorEntry(factorCode, factorValue, defaultApplied));
        this.defaultApplied = this.defaultApplied || defaultApplied;
    }

    void addLog(String label,
                Integer lineNo,
                String formula,
                String substituted,
                double result,
                String note) {
        calculationLogs.add(logEntry(label, lineNo, formula, substituted, result, note));
    }

    List<Map<String, Object>> appliedFactors() {
        return appliedFactors;
    }

    List<Map<String, Object>> logs() {
        return calculationLogs;
    }

    boolean defaultApplied() {
        return defaultApplied;
    }

    private Map<String, Object> factorEntry(String factorCode, double factorValue, boolean defaultApplied) {
        Map<String, Object> factor = new java.util.LinkedHashMap<>();
        factor.put("factorCode", factorCode);
        factor.put("factorValue", factorValue);
        factor.put("defaultApplied", defaultApplied);
        return factor;
    }

    private Map<String, Object> logEntry(String label,
                                         Integer lineNo,
                                         String formula,
                                         String substituted,
                                         double result,
                                         String note) {
        Map<String, Object> entry = new java.util.LinkedHashMap<>();
        entry.put("label", label);
        entry.put("lineNo", lineNo);
        entry.put("formula", formula);
        entry.put("substituted", substituted);
        entry.put("result", result);
        if (note != null && !note.trim().isEmpty()) {
            entry.put("note", note.trim());
        }
        return entry;
    }
}
