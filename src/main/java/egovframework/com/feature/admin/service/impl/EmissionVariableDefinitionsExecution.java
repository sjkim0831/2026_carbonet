package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;

import java.util.List;

final class EmissionVariableDefinitionsExecution {
    final EmissionCategoryVO category;
    final int tier;
    final List<EmissionVariableDefinitionVO> variables;
    final List<EmissionFactorVO> factors;
    final CalculationDefinition definition;

    EmissionVariableDefinitionsExecution(EmissionCategoryVO category,
                                         int tier,
                                         List<EmissionVariableDefinitionVO> variables,
                                         List<EmissionFactorVO> factors,
                                         CalculationDefinition definition) {
        this.category = category;
        this.tier = tier;
        this.variables = variables;
        this.factors = factors;
        this.definition = definition;
    }
}
