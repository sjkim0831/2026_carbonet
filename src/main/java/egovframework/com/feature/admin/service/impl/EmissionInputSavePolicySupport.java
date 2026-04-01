package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionFactorVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.buildCategoryTierParams;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.safe;

final class EmissionInputSavePolicySupport {
    private final AdminEmissionManagementMapper adminEmissionManagementMapper;

    EmissionInputSavePolicySupport(AdminEmissionManagementMapper adminEmissionManagementMapper) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
    }

    Set<String> loadAcceptedVariableCodes(Long categoryId, Integer tier) {
        Set<String> codes = new LinkedHashSet<>();
        for (EmissionVariableDefinitionVO variable : adminEmissionManagementMapper.selectEmissionVariableDefinitions(buildCategoryTierParams(categoryId, tier))) {
            codes.add(safe(variable.getVarCode()).toUpperCase(Locale.ROOT));
        }
        for (EmissionFactorVO factor : adminEmissionManagementMapper.selectEmissionFactors(buildCategoryTierParams(categoryId, tier))) {
            codes.add(safe(factor.getFactorCode()).toUpperCase(Locale.ROOT));
        }
        return codes;
    }

    boolean isDerivedCarbonateFactorInput(EmissionCategoryVO category, int tier, String varCode) {
        String subCode = safe(category == null ? null : category.getSubCode()).toUpperCase(Locale.ROOT);
        return "CEMENT".equals(subCode) && tier == 3 && ("EFI".equals(varCode) || "EFK".equals(varCode));
    }
}
