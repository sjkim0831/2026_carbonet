package egovframework.com.feature.admin.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.feature.admin.dto.request.EmissionInputSessionSaveRequest;
import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.service.AdminEmissionManagementService;
import egovframework.com.feature.admin.service.AdminEmissionDefinitionStudioService;
import egovframework.com.common.service.CommonCodeService;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("adminEmissionManagementService")
public class AdminEmissionManagementServiceImpl extends EgovAbstractServiceImpl implements AdminEmissionManagementService {
    private final EmissionManagementResponsePresenter responsePresenter;
    private final EmissionManagementQueryService queryService;
    private final EmissionInputSaveApplicationService inputSaveApplicationService;
    private final EmissionCalculationApplicationService calculationApplicationService;

    @Autowired
    public AdminEmissionManagementServiceImpl(EmissionManagementResponsePresenter responsePresenter,
                                              EmissionManagementQueryService queryService,
                                              EmissionInputSaveApplicationService inputSaveApplicationService,
                                              EmissionCalculationApplicationService calculationApplicationService) {
        this.responsePresenter = responsePresenter;
        this.queryService = queryService;
        this.inputSaveApplicationService = inputSaveApplicationService;
        this.calculationApplicationService = calculationApplicationService;
    }

    AdminEmissionManagementServiceImpl(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                       CommonCodeService commonCodeService,
                                       ObjectMapper objectMapper) {
        EmissionManagementConfiguration configuration = new EmissionManagementConfiguration();
        AdminEmissionDefinitionStudioService adminEmissionDefinitionStudioService =
                new AdminEmissionDefinitionStudioService(objectMapper);
        EmissionCalculationDefinitionRegistry calculationDefinitionRegistry =
                configuration.emissionCalculationDefinitionRegistry();
        EmissionCalculationInputMapper calculationInputMapper =
                configuration.emissionCalculationInputMapper();
        EmissionVariableDefinitionAssembler variableDefinitionAssembler =
                configuration.emissionVariableDefinitionAssembler(commonCodeService);
        EmissionManagementValidationSupport validationSupport =
                configuration.emissionManagementValidationSupport(
                        adminEmissionManagementMapper,
                        calculationDefinitionRegistry,
                        adminEmissionDefinitionStudioService,
                        variableDefinitionAssembler
                );
        EmissionCalculationResultTransformer resultTransformer =
                configuration.emissionCalculationResultTransformer(objectMapper);
        DefinitionFormulaPreviewService definitionFormulaPreviewService =
                configuration.definitionFormulaPreviewService(objectMapper);
        EmissionCategoryTierDataProvider categoryTierDataProvider =
                configuration.emissionCategoryTierDataProvider(adminEmissionManagementMapper);
        EmissionInputSavePolicySupport inputSavePolicySupport =
                configuration.emissionInputSavePolicySupport(adminEmissionManagementMapper, adminEmissionDefinitionStudioService);
        EmissionManagementCommandBuilder commandBuilder =
                configuration.emissionManagementCommandBuilder();
        EmissionCategoryMetadataProvider categoryMetadataProvider =
                configuration.emissionCategoryMetadataProvider();

        this.responsePresenter = configuration.emissionManagementResponsePresenter();
        this.queryService = configuration.emissionManagementQueryService(
                adminEmissionManagementMapper,
                calculationDefinitionRegistry,
                variableDefinitionAssembler,
                validationSupport,
                resultTransformer,
                categoryTierDataProvider,
                categoryMetadataProvider,
                adminEmissionDefinitionStudioService
        );
        this.inputSaveApplicationService = configuration.emissionInputSaveApplicationService(
                adminEmissionManagementMapper,
                validationSupport,
                inputSavePolicySupport,
                commandBuilder
        );
        this.calculationApplicationService = configuration.emissionCalculationApplicationService(
                adminEmissionManagementMapper,
                calculationDefinitionRegistry,
                calculationInputMapper,
                validationSupport,
                resultTransformer,
                categoryTierDataProvider,
                commandBuilder,
                definitionFormulaPreviewService
        );
    }

    @Override
    public Map<String, Object> getCategoryList(String searchKeyword) {
        return responsePresenter.categoryList(queryService.getCategoryList(searchKeyword));
    }

    @Override
    public Map<String, Object> getTierList(Long categoryId) {
        EmissionTierListExecution execution = queryService.getTierList(categoryId);
        return responsePresenter.tierList(execution.category, execution.tiers, execution.unsupportedTiers);
    }

    @Override
    public Map<String, Object> getVariableDefinitions(Long categoryId, Integer tier) {
        EmissionVariableDefinitionsExecution execution = queryService.getVariableDefinitions(categoryId, tier);
        return responsePresenter.variableDefinitions(
                execution.category,
                execution.tier,
                execution.variables,
                execution.factors,
                execution.definition,
                execution.publishedDefinition
        );
    }

    @Override
    public Map<String, Object> saveInputSession(EmissionInputSessionSaveRequest request, String actorId) {
        EmissionInputSaveExecution execution = inputSaveApplicationService.save(request, actorId);
        return responsePresenter.saveInputSession(
                true,
                execution.sessionId,
                execution.category,
                execution.tier,
                execution.savedCount
        );
    }

    @Override
    public Map<String, Object> getInputSession(Long sessionId) {
        EmissionInputSessionExecution execution = queryService.getInputSession(sessionId);
        return responsePresenter.inputSession(execution.session, execution.values, execution.result);
    }

    @Override
    public Map<String, Object> calculateInputSession(Long sessionId) {
        EmissionCalculationExecution execution = calculationApplicationService.calculateAndStore(sessionId);
        return responsePresenter.calculationResult(
                sessionId,
                execution.category,
                execution.tier,
                execution.result,
                execution.resultId
        );
    }

    @Override
    public Map<String, Object> getLimeDefaultFactor() {
        return queryService.getLimeDefaultFactor();
    }

    @Override
    public Map<String, Object> getRolloutStatusSummary() {
        return responsePresenter.rolloutStatusSummary(queryService.getLatestCalculationRolloutRows());
    }
}
