package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;

import java.util.List;
import java.util.Map;

import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.longValue;

final class EmissionManagementValidationSupport {
    private final AdminEmissionManagementMapper adminEmissionManagementMapper;
    private final EmissionCalculationDefinitionRegistry calculationDefinitionRegistry;

    EmissionManagementValidationSupport(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                        EmissionCalculationDefinitionRegistry calculationDefinitionRegistry) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
        this.calculationDefinitionRegistry = calculationDefinitionRegistry;
    }

    Map<String, Object> requireSession(Long sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("sessionId is required.");
        }
        Map<String, Object> session = adminEmissionManagementMapper.selectEmissionInputSession(sessionId);
        if (session == null || session.isEmpty()) {
            throw new IllegalArgumentException("Emission input session not found.");
        }
        return session;
    }

    EmissionCategoryVO requireCategory(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("categoryId is required.");
        }
        EmissionCategoryVO category = adminEmissionManagementMapper.selectEmissionCategory(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("Emission category not found.");
        }
        return category;
    }

    int requireTier(EmissionCategoryVO category, Integer tier) {
        if (tier == null) {
            throw new IllegalArgumentException("tier is required.");
        }
        Long categoryId = category == null ? null : category.getCategoryId();
        List<Integer> tiers = adminEmissionManagementMapper.selectEmissionTierList(categoryId);
        if (!tiers.contains(tier)) {
            throw new IllegalArgumentException("Unsupported tier for category.");
        }
        if (!calculationDefinitionRegistry.supports(category, tier)) {
            throw new IllegalArgumentException("Tier is defined in metadata but no calculation definition is registered for "
                    + EmissionManagementValueSupport.safe(category == null ? null : category.getSubCode())
                    + "/" + tier + ".");
        }
        return tier;
    }

    Long requireGeneratedId(Map<String, Object> params, String key, String entityName) {
        Long generatedId = longValue(params.get(key));
        if (generatedId == null || generatedId < 1L) {
            throw new IllegalStateException("Failed to generate ID for " + entityName + ".");
        }
        return generatedId;
    }
}
