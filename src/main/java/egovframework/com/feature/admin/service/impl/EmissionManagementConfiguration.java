package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.common.service.CommonCodeService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class EmissionManagementConfiguration {
    @Bean
    EmissionCalculationDefinitionRegistry emissionCalculationDefinitionRegistry() {
        return EmissionCalculationComponents.createDefault().calculationDefinitionRegistry;
    }

    @Bean
    EmissionCalculationInputMapper emissionCalculationInputMapper() {
        return new EmissionCalculationInputMapper();
    }

    @Bean
    EmissionManagementValidationSupport emissionManagementValidationSupport(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                                                            EmissionCalculationDefinitionRegistry calculationDefinitionRegistry) {
        return new EmissionManagementValidationSupport(adminEmissionManagementMapper, calculationDefinitionRegistry);
    }

    @Bean
    EmissionCalculationResultTransformer emissionCalculationResultTransformer(ObjectMapper objectMapper) {
        return new EmissionCalculationResultTransformer(objectMapper);
    }

    @Bean
    EmissionCategoryTierDataProvider emissionCategoryTierDataProvider(AdminEmissionManagementMapper adminEmissionManagementMapper) {
        return new EmissionCategoryTierDataProvider(adminEmissionManagementMapper);
    }

    @Bean
    EmissionInputSavePolicySupport emissionInputSavePolicySupport(AdminEmissionManagementMapper adminEmissionManagementMapper) {
        return new EmissionInputSavePolicySupport(adminEmissionManagementMapper);
    }

    @Bean
    EmissionManagementCommandBuilder emissionManagementCommandBuilder() {
        return new EmissionManagementCommandBuilder();
    }

    @Bean
    EmissionCategoryMetadataProvider emissionCategoryMetadataProvider() {
        return new EmissionCategoryMetadataProvider();
    }

    @Bean
    EmissionVariableDefinitionAssembler emissionVariableDefinitionAssembler(CommonCodeService commonCodeService) {
        return new EmissionVariableDefinitionAssembler(
                commonCodeService,
                EmissionManagementConstants.CARBONATE_CODE_ID,
                EmissionManagementConstants.LIME_TYPE_TIER1_CODE_ID,
                EmissionManagementConstants.LIME_TYPE_TIER23_CODE_ID,
                EmissionManagementConstants.HYDRATED_LIME_CODE_ID,
                EmissionManagementConstants.FLAG_Y,
                EmissionManagementConstants.FLAG_N
        );
    }

    @Bean
    EmissionManagementResponsePresenter emissionManagementResponsePresenter() {
        return new EmissionManagementResponsePresenter();
    }

    @Bean
    EmissionManagementQueryService emissionManagementQueryService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                                                  EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                                                  EmissionVariableDefinitionAssembler variableDefinitionAssembler,
                                                                  EmissionManagementValidationSupport validationSupport,
                                                                  EmissionCalculationResultTransformer resultTransformer,
                                                                  EmissionCategoryTierDataProvider categoryTierDataProvider,
                                                                  EmissionCategoryMetadataProvider categoryMetadataProvider) {
        return new EmissionManagementQueryService(
                adminEmissionManagementMapper,
                calculationDefinitionRegistry,
                variableDefinitionAssembler,
                validationSupport,
                resultTransformer,
                categoryTierDataProvider,
                categoryMetadataProvider
        );
    }

    @Bean
    EmissionInputSaveApplicationService emissionInputSaveApplicationService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                                                            EmissionManagementValidationSupport validationSupport,
                                                                            EmissionInputSavePolicySupport inputSavePolicySupport,
                                                                            EmissionManagementCommandBuilder commandBuilder) {
        return new EmissionInputSaveApplicationService(
                adminEmissionManagementMapper,
                validationSupport,
                inputSavePolicySupport,
                commandBuilder
        );
    }

    @Bean
    EmissionCalculationApplicationService emissionCalculationApplicationService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                                                                EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                                                                EmissionCalculationInputMapper calculationInputMapper,
                                                                                EmissionManagementValidationSupport validationSupport,
                                                                                EmissionCalculationResultTransformer resultTransformer,
                                                                                EmissionCategoryTierDataProvider categoryTierDataProvider,
                                                                                EmissionManagementCommandBuilder commandBuilder) {
        return new EmissionCalculationApplicationService(
                adminEmissionManagementMapper,
                calculationDefinitionRegistry,
                calculationInputMapper,
                validationSupport,
                resultTransformer,
                categoryTierDataProvider,
                commandBuilder
        );
    }
}
