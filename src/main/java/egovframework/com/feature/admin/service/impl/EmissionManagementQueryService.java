package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;
import egovframework.com.feature.admin.service.AdminEmissionDefinitionStudioService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.buildTierItems;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.buildUnsupportedTierItems;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.safe;

final class EmissionManagementQueryService {
    private final AdminEmissionManagementMapper adminEmissionManagementMapper;
    private final EmissionCalculationDefinitionRegistry calculationDefinitionRegistry;
    private final EmissionVariableDefinitionAssembler variableDefinitionAssembler;
    private final EmissionManagementValidationSupport validationSupport;
    private final EmissionCalculationResultTransformer resultTransformer;
    private final EmissionCategoryTierDataProvider categoryTierDataProvider;
    private final EmissionCategoryMetadataProvider categoryMetadataProvider;
    private final AdminEmissionDefinitionStudioService definitionStudioService;

    EmissionManagementQueryService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                   EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                   EmissionVariableDefinitionAssembler variableDefinitionAssembler,
                                   EmissionManagementValidationSupport validationSupport,
                                   EmissionCalculationResultTransformer resultTransformer,
                                   EmissionCategoryTierDataProvider categoryTierDataProvider,
                                   EmissionCategoryMetadataProvider categoryMetadataProvider,
                                   AdminEmissionDefinitionStudioService definitionStudioService) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
        this.calculationDefinitionRegistry = calculationDefinitionRegistry;
        this.variableDefinitionAssembler = variableDefinitionAssembler;
        this.validationSupport = validationSupport;
        this.resultTransformer = resultTransformer;
        this.categoryTierDataProvider = categoryTierDataProvider;
        this.categoryMetadataProvider = categoryMetadataProvider;
        this.definitionStudioService = definitionStudioService;
    }

    List<EmissionCategoryVO> getCategoryList(String searchKeyword) {
        return adminEmissionManagementMapper.selectEmissionCategories(safe(searchKeyword));
    }

    EmissionTierListExecution getTierList(Long categoryId) {
        EmissionCategoryVO category = validationSupport.requireCategory(categoryId);
        List<Integer> supportedTiers = new ArrayList<>();
        List<Integer> unsupportedTiers = new ArrayList<>();
        for (Integer tier : adminEmissionManagementMapper.selectEmissionTierList(categoryId)) {
            if (calculationDefinitionRegistry.supports(category, tier)) {
                supportedTiers.add(tier);
            } else {
                unsupportedTiers.add(tier);
            }
        }
        return new EmissionTierListExecution(
                category,
                buildTierItems(supportedTiers),
                buildUnsupportedTierItems(unsupportedTiers, "Missing calculation definition")
        );
    }

    EmissionVariableDefinitionsExecution getVariableDefinitions(Long categoryId, Integer tier) {
        EmissionCategoryVO category = validationSupport.requireCategory(categoryId);
        int normalizedTier = validationSupport.requireTier(category, tier);
        CalculationDefinition definition = calculationDefinitionRegistry.require(category, normalizedTier);
        List<EmissionVariableDefinitionVO> variables = variableDefinitionAssembler.enrich(
                category,
                normalizedTier,
                categoryTierDataProvider.loadVariableDefinitions(categoryId, normalizedTier),
                definition
        );
        Map<String, Object> publishedDefinition = definitionStudioService.findPublishedDefinitionRaw(category.getSubCode(), normalizedTier);
        variables = variableDefinitionAssembler.applyDefinitionOverrides(variables, publishedDefinition, categoryId, normalizedTier);
        List<EmissionFactorVO> factors = categoryTierDataProvider.loadFactors(categoryId, normalizedTier);
        return new EmissionVariableDefinitionsExecution(category, normalizedTier, variables, factors, definition, publishedDefinition);
    }

    EmissionInputSessionExecution getInputSession(Long sessionId) {
        Map<String, Object> session = validationSupport.requireSession(sessionId);
        return new EmissionInputSessionExecution(
                session,
                adminEmissionManagementMapper.selectEmissionInputValues(sessionId),
                resultTransformer.enrichStoredResult(adminEmissionManagementMapper.selectLatestEmissionCalcResult(sessionId))
        );
    }

    Map<String, Object> getLimeDefaultFactor() {
        return categoryMetadataProvider.limeDefaultFactor();
    }

    List<Map<String, Object>> getLatestCalculationRolloutRows() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> stored : adminEmissionManagementMapper.selectLatestEmissionCalcResultsByScope()) {
            Map<String, Object> enriched = resultTransformer.enrichStoredResult(new LinkedHashMap<>(stored));
            Map<String, Object> comparison = asMap(enriched.get("definitionFormulaComparison"));
            Map<String, Object> preview = asMap(enriched.get("definitionFormulaPreview"));
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("categoryId", enriched.get("categoryId"));
            row.put("categoryCode", enriched.get("categoryCode"));
            row.put("categoryName", enriched.get("categoryName"));
            row.put("tier", enriched.get("tier"));
            row.put("tierLabel", "Tier " + EmissionManagementValueSupport.intValue(enriched.get("tier")));
            row.put("resultId", enriched.get("resultId"));
            row.put("sessionId", enriched.get("sessionId"));
            row.put("createdAt", enriched.get("createdAt"));
            row.put("co2Total", enriched.get("co2Total"));
            row.put("formulaSummary", enriched.get("formulaSummary"));
            row.put("definitionFormulaAdopted", enriched.get("definitionFormulaAdopted"));
            row.put("draftId", preview.get("draftId"));
            row.put("unresolvedCount", preview.getOrDefault("unresolvedCount", 0));
            row.put("traceCount", preview.getOrDefault("traceCount", 0));
            row.put("promotionStatus", comparison.isEmpty() ? "LEGACY_ONLY" : comparison.get("promotionStatus"));
            row.put("promotionMessage", comparison.isEmpty()
                    ? "No definition formula comparison has been calculated for this scope yet."
                    : comparison.get("promotionMessage"));
            row.put("matched", comparison.getOrDefault("matched", false));
            row.put("legacyTotal", comparison.getOrDefault("legacyTotal", enriched.get("co2Total")));
            row.put("definitionTotal", comparison.get("definitionTotal"));
            row.put("delta", comparison.getOrDefault("delta", 0));
            rows.add(row);
        }
        return rows;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?>) {
            return new LinkedHashMap<>((Map<String, Object>) value);
        }
        return new LinkedHashMap<>();
    }
}
