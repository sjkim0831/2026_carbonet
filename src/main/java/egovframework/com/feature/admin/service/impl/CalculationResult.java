package egovframework.com.feature.admin.service.impl;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class CalculationResult {
    final double total;
    final String formulaSummary;
    final String formulaDisplay;
    final String substitutedFormula;
    final List<Map<String, Object>> appliedFactors;
    final List<Map<String, Object>> calculationLogs;
    final boolean defaultApplied;

    CalculationResult(double total,
                      String formulaSummary,
                      String formulaDisplay,
                      String substitutedFormula,
                      List<Map<String, Object>> appliedFactors,
                      List<Map<String, Object>> calculationLogs,
                      boolean defaultApplied) {
        this.total = total;
        this.formulaSummary = formulaSummary;
        this.appliedFactors = appliedFactors;
        this.formulaDisplay = formulaDisplay;
        this.substitutedFormula = substitutedFormula;
        this.calculationLogs = calculationLogs;
        this.defaultApplied = defaultApplied;
    }

    Map<String, Object> snapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("appliedFactors", appliedFactors);
        snapshot.put("formulaDisplay", formulaDisplay);
        snapshot.put("substitutedFormula", substitutedFormula);
        snapshot.put("calculationLogs", calculationLogs);
        return snapshot;
    }
}
