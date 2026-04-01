package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;

import java.util.ArrayList;
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

    EmissionManagementQueryService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                   EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                   EmissionVariableDefinitionAssembler variableDefinitionAssembler,
                                   EmissionManagementValidationSupport validationSupport,
                                   EmissionCalculationResultTransformer resultTransformer,
                                   EmissionCategoryTierDataProvider categoryTierDataProvider,
                                   EmissionCategoryMetadataProvider categoryMetadataProvider) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
        this.calculationDefinitionRegistry = calculationDefinitionRegistry;
        this.variableDefinitionAssembler = variableDefinitionAssembler;
        this.validationSupport = validationSupport;
        this.resultTransformer = resultTransformer;
        this.categoryTierDataProvider = categoryTierDataProvider;
        this.categoryMetadataProvider = categoryMetadataProvider;
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
        List<EmissionFactorVO> factors = categoryTierDataProvider.loadFactors(categoryId, normalizedTier);
        return new EmissionVariableDefinitionsExecution(category, normalizedTier, variables, factors, definition);
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
}
