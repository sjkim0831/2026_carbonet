package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.mapper.AdminEmissionManagementMapper;
import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

final class EmissionCalculationApplicationService {
    private final AdminEmissionManagementMapper adminEmissionManagementMapper;
    private final EmissionCalculationDefinitionRegistry calculationDefinitionRegistry;
    private final EmissionCalculationInputMapper calculationInputMapper;
    private final EmissionManagementValidationSupport validationSupport;
    private final EmissionCalculationResultTransformer resultTransformer;
    private final EmissionCategoryTierDataProvider categoryTierDataProvider;
    private final EmissionManagementCommandBuilder commandBuilder;
    private final DefinitionFormulaPreviewService definitionFormulaPreviewService;

    EmissionCalculationApplicationService(AdminEmissionManagementMapper adminEmissionManagementMapper,
                                          EmissionCalculationDefinitionRegistry calculationDefinitionRegistry,
                                          EmissionCalculationInputMapper calculationInputMapper,
                                          EmissionManagementValidationSupport validationSupport,
                                          EmissionCalculationResultTransformer resultTransformer,
                                          EmissionCategoryTierDataProvider categoryTierDataProvider,
                                          EmissionManagementCommandBuilder commandBuilder,
                                          DefinitionFormulaPreviewService definitionFormulaPreviewService) {
        this.adminEmissionManagementMapper = adminEmissionManagementMapper;
        this.calculationDefinitionRegistry = calculationDefinitionRegistry;
        this.calculationInputMapper = calculationInputMapper;
        this.validationSupport = validationSupport;
        this.resultTransformer = resultTransformer;
        this.categoryTierDataProvider = categoryTierDataProvider;
        this.commandBuilder = commandBuilder;
        this.definitionFormulaPreviewService = definitionFormulaPreviewService;
    }

    EmissionCalculationExecution calculateAndStore(Long sessionId) {
        Map<String, Object> session = validationSupport.requireSession(sessionId);
        Long categoryId = EmissionManagementValueSupport.longValue(session.get("categoryId"));
        Integer tier = EmissionManagementValueSupport.intValue(session.get("tier"));
        EmissionCategoryVO category = validationSupport.requireCategory(categoryId);
        List<Map<String, Object>> values = adminEmissionManagementMapper.selectEmissionInputValues(sessionId);
        validationSupport.validateRequiredDirectInputsFromStoredValues(category, tier, values);
        Map<String, Double> scalarValues = calculationInputMapper.toScalarMap(values);
        Map<String, Map<Integer, Double>> lineValues = calculationInputMapper.toLineValueMap(values);
        Map<String, String> scalarTexts = calculationInputMapper.toScalarTextMap(values);
        Map<String, Map<Integer, String>> lineTextValues = calculationInputMapper.toLineTextMap(values);
        Map<String, Double> factorValues = calculationInputMapper.toFactorMap(categoryTierDataProvider.loadFactors(categoryId, tier));

        CalculationDefinition definition = calculationDefinitionRegistry.require(category, tier);
        CalculationContext context = new CalculationContext(
                definition,
                scalarValues,
                lineValues,
                scalarTexts,
                lineTextValues,
                factorValues
        );
        CalculationResult calculated = definition.executor.execute(context);
        Map<String, Object> definitionFormulaPreview = definitionFormulaPreviewService.preview(category, tier, context);
        if (definitionFormulaPreview.isEmpty()) {
            definitionFormulaPreview = builtInDefinitionPreview(category, tier, definition, calculated);
        }
        Map<String, Object> definitionFormulaComparison = new java.util.LinkedHashMap<>();
        String runtimeMode = EmissionManagementValueSupport.safe(String.valueOf(definitionFormulaPreview.get("runtimeMode"))).toUpperCase(Locale.ROOT);
        if (runtimeMode.isEmpty()) {
            runtimeMode = "AUTO";
        }
        boolean previewPromotable = Boolean.TRUE.equals(definitionFormulaPreview.get("promotable"));
        if (!definitionFormulaPreview.isEmpty() && definitionFormulaPreview.get("total") instanceof Number) {
            double previewTotal = ((Number) definitionFormulaPreview.get("total")).doubleValue();
            double delta = calculated.total - previewTotal;
            boolean matched = Math.abs(delta) < 0.000001d;
            definitionFormulaComparison.put("legacyTotal", calculated.total);
            definitionFormulaComparison.put("definitionTotal", previewTotal);
            definitionFormulaComparison.put("delta", delta);
            definitionFormulaComparison.put("matched", matched);
            definitionFormulaComparison.put("promotable", previewPromotable);
            definitionFormulaComparison.put("runtimeMode", runtimeMode);
            if (!previewPromotable) {
                definitionFormulaComparison.put("promotionStatus", "BLOCKED");
                definitionFormulaComparison.put("promotionMessage", "Definition formula preview still contains unresolved tokens or invalid arithmetic.");
            } else if ("PRIMARY".equals(runtimeMode) && matched) {
                definitionFormulaComparison.put("promotionStatus", "PRIMARY_READY");
                definitionFormulaComparison.put("promotionMessage", "Published formula is configured as the primary runtime path and still matches the legacy calculator.");
            } else if ("PRIMARY".equals(runtimeMode)) {
                definitionFormulaComparison.put("promotionStatus", "PRIMARY_WITH_DRIFT");
                definitionFormulaComparison.put("promotionMessage", "Published formula is configured as the primary runtime path. Legacy output is retained as a shadow comparison because the totals still differ.");
            } else if (matched) {
                definitionFormulaComparison.put("promotionStatus", "READY");
                definitionFormulaComparison.put("promotionMessage", "AUTO mode can adopt this definition because it matches the legacy calculator and has no unresolved tokens.");
            } else {
                definitionFormulaComparison.put("promotionStatus", "SHADOW_ONLY");
                definitionFormulaComparison.put("promotionMessage", "Definition formula is evaluable, but AUTO/SHADOW mode keeps the legacy calculator active because the result does not yet match.");
            }
        }
        boolean definitionFormulaAdopted =
                ("PRIMARY".equals(runtimeMode) && previewPromotable)
                        || ("AUTO".equals(runtimeMode) && "READY".equals(definitionFormulaComparison.get("promotionStatus")));
        double finalTotal = definitionFormulaAdopted && definitionFormulaComparison.get("definitionTotal") instanceof Number
                ? ((Number) definitionFormulaComparison.get("definitionTotal")).doubleValue()
                : calculated.total;
        String effectiveFormula = definitionFormulaAdopted
                ? EmissionManagementValueSupport.safe(String.valueOf(definitionFormulaPreview.get("formula")))
                : calculated.formulaDisplay;
        String effectiveSubstitutedFormula = definitionFormulaAdopted
                ? EmissionManagementValueSupport.firstNonBlank(
                EmissionManagementValueSupport.safe(String.valueOf(definitionFormulaPreview.get("formula"))),
                calculated.substitutedFormula
        )
                : calculated.substitutedFormula;
        java.util.List<java.util.Map<String, Object>> effectiveLogs = definitionFormulaAdopted
                ? definitionTraceAsLogs(definitionFormulaPreview)
                : calculated.calculationLogs;
        CalculationResult result = new CalculationResult(
                finalTotal,
                effectiveFormula,
                effectiveFormula,
                effectiveSubstitutedFormula,
                calculated.appliedFactors,
                effectiveLogs,
                calculated.defaultApplied,
                definitionFormulaPreview,
                definitionFormulaComparison,
                definitionFormulaAdopted,
                definitionFormulaAdopted ? "PUBLISHED_DEFINITION" : "LEGACY",
                calculated.formulaDisplay,
                calculated.substitutedFormula,
                calculated.calculationLogs
        );

        Map<String, Object> insertParams = commandBuilder.calcResult(sessionId, result, resultTransformer.writeSnapshotJson(result));
        adminEmissionManagementMapper.insertEmissionCalcResult(insertParams);
        Long resultId = validationSupport.requireGeneratedId(insertParams, "resultId", "emission calculation result");
        return new EmissionCalculationExecution(category, tier, result, resultId);
    }

    private Map<String, Object> builtInDefinitionPreview(EmissionCategoryVO category,
                                                         Integer tier,
                                                         CalculationDefinition definition,
                                                         CalculationResult calculated) {
        Map<String, Object> preview = new LinkedHashMap<>();
        String subCode = EmissionManagementValueSupport.safe(category == null ? null : category.getSubCode()).toUpperCase(Locale.ROOT);
        preview.put("draftId", "BUILTIN:" + subCode + ":" + (tier == null ? 0 : tier));
        preview.put("formula", definition == null ? "" : definition.formulaSummary);
        preview.put("total", calculated.total);
        preview.put("trace", new java.util.ArrayList<Map<String, Object>>());
        preview.put("unresolvedCount", 0);
        preview.put("traceCount", 0);
        preview.put("promotable", true);
        preview.put("previewSource", "built-in-definition");
        preview.put("runtimeMode", "AUTO");
        return preview;
    }

    @SuppressWarnings("unchecked")
    private java.util.List<java.util.Map<String, Object>> definitionTraceAsLogs(Map<String, Object> preview) {
        Object trace = preview == null ? null : preview.get("trace");
        if (!(trace instanceof java.util.List<?>)) {
            return java.util.Collections.emptyList();
        }
        java.util.List<java.util.Map<String, Object>> logs = new java.util.ArrayList<>();
        for (Object item : (java.util.List<?>) trace) {
            if (!(item instanceof java.util.Map<?, ?>)) {
                continue;
            }
            java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) item);
            java.util.Map<String, Object> log = new java.util.LinkedHashMap<>();
            log.put("label", row.getOrDefault("label", "definition"));
            log.put("lineNo", null);
            log.put("formula", row.getOrDefault("expression", ""));
            log.put("substituted", row.getOrDefault("expression", ""));
            log.put("result", row.getOrDefault("result", 0));
            if (row.get("note") != null) {
                log.put("note", row.get("note"));
            }
            logs.add(log);
        }
        return logs;
    }
}
