package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;

import java.util.List;
import java.util.Map;

final class EmissionCalculationApplicationService {
    private final AdminEmissionManagementMapper adminEmissionManagementMapper;
    private final EmissionCalculationDefinitionRegistry calculationDefinitionRegistry;
    private final EmissionCalculationInputMapper calculationInputMapper;
    private final EmissionManagementValidationSupport validationSupport;
    private final EmissionCalculationResultTransformer resultTransformer;
    private final EmissionCategoryTierDataProvider categoryTierDataProvider;
    private final EmissionManagementCommandBuilder commandBuilder;

    EmissionCalculationApplicationService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                          EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                          EmissionCalculationInputMapper calculationInputMapper,
                                          EmissionManagementValidationSupport validationSupport,
                                          EmissionCalculationResultTransformer resultTransformer,
                                          EmissionCategoryTierDataProvider categoryTierDataProvider,
                                          EmissionManagementCommandBuilder commandBuilder) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
        this.calculationDefinitionRegistry = calculationDefinitionRegistry;
        this.calculationInputMapper = calculationInputMapper;
        this.validationSupport = validationSupport;
        this.resultTransformer = resultTransformer;
        this.categoryTierDataProvider = categoryTierDataProvider;
        this.commandBuilder = commandBuilder;
    }

    EmissionCalculationExecution calculateAndStore(Long sessionId) {
        Map<String, Object> session = validationSupport.requireSession(sessionId);
        Long categoryId = EmissionManagementValueSupport.longValue(session.get("categoryId"));
        Integer tier = EmissionManagementValueSupport.intValue(session.get("tier"));
        EmissionCategoryVO category = validationSupport.requireCategory(categoryId);
        List<Map<String, Object>> values = adminEmissionManagementMapper.selectEmissionInputValues(sessionId);
        Map<String, Double> scalarValues = calculationInputMapper.toScalarMap(values);
        Map<String, Map<Integer, Double>> lineValues = calculationInputMapper.toLineValueMap(values);
        Map<String, String> scalarTexts = calculationInputMapper.toScalarTextMap(values);
        Map<String, Map<Integer, String>> lineTextValues = calculationInputMapper.toLineTextMap(values);
        Map<String, Double> factorValues = calculationInputMapper.toFactorMap(categoryTierDataProvider.loadFactors(categoryId, tier));

        CalculationDefinition definition = calculationDefinitionRegistry.require(category, tier);
        CalculationResult result = definition.executor.execute(new CalculationContext(
                definition,
                scalarValues,
                lineValues,
                scalarTexts,
                lineTextValues,
                factorValues
        ));

        Map<String, Object> insertParams = commandBuilder.calcResult(sessionId, result, resultTransformer.writeSnapshotJson(result));
        adminEmissionManagementMapper.insertEmissionCalcResult(insertParams);
        Long resultId = validationSupport.requireGeneratedId(insertParams, "resultId", "emission calculation result");
        return new EmissionCalculationExecution(category, tier, result, resultId);
    }
}
