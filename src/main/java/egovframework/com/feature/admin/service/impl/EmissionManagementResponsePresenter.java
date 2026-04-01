package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class EmissionManagementResponsePresenter {
    Map<String, Object> categoryList(List<EmissionCategoryVO> items) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        return response;
    }

    Map<String, Object> tierList(EmissionCategoryVO category,
                                 List<Map<String, Object>> tiers,
                                 List<Map<String, Object>> unsupportedTiers) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("category", category);
        response.put("tiers", tiers);
        response.put("unsupportedTiers", unsupportedTiers);
        if (unsupportedTiers != null && !unsupportedTiers.isEmpty()) {
            response.put("warning", "Some metadata tiers were excluded because no calculation definition is registered yet.");
        }
        return response;
    }

    Map<String, Object> variableDefinitions(EmissionCategoryVO category,
                                            int tier,
                                            List<EmissionVariableDefinitionVO> variables,
                                            List<EmissionFactorVO> factors,
                                            CalculationDefinition definition) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("category", category);
        response.put("tier", tier);
        response.put("variables", variables);
        response.put("factors", factors);
        response.put("formulaSummary", definition.formulaSummary);
        response.put("formulaDisplay", definition.formulaDisplay);
        return response;
    }

    Map<String, Object> saveInputSession(boolean success,
                                         Long sessionId,
                                         EmissionCategoryVO category,
                                         int tier,
                                         int savedCount) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", success);
        response.put("sessionId", sessionId);
        response.put("category", category);
        response.put("tier", tier);
        response.put("savedCount", savedCount);
        return response;
    }

    Map<String, Object> inputSession(Map<String, Object> session,
                                     List<Map<String, Object>> values,
                                     Map<String, Object> result) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("session", session);
        response.put("values", values);
        response.put("result", result);
        return response;
    }

    Map<String, Object> calculationResult(Long sessionId,
                                          EmissionCategoryVO category,
                                          Integer tier,
                                          CalculationResult result,
                                          Long resultId) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("sessionId", sessionId);
        response.put("category", category);
        response.put("tier", tier);
        response.put("co2Total", result.total);
        response.put("unit", "tCO2");
        response.put("formulaSummary", result.formulaSummary);
        response.put("formulaDisplay", result.formulaDisplay);
        response.put("substitutedFormula", result.substitutedFormula);
        response.put("appliedFactors", result.appliedFactors);
        response.put("calculationLogs", result.calculationLogs);
        response.put("defaultApplied", result.defaultApplied);
        response.put("resultId", resultId);
        return response;
    }
}
