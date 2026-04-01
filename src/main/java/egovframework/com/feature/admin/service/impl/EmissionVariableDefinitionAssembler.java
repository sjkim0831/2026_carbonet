package egovframework.com.feature.admin.service.impl;

import egovframework.com.feature.admin.model.vo.EmissionCategoryVO;
import egovframework.com.feature.admin.model.vo.EmissionVariableDefinitionVO;
import egovframework.com.common.model.ComDefaultCodeVO;
import egovframework.com.common.service.CmmnDetailCode;
import egovframework.com.common.service.CommonCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.firstNonBlank;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.option;
import static egovframework.com.feature.admin.service.impl.EmissionManagementValueSupport.safe;

final class EmissionVariableDefinitionAssembler {
    private static final Logger log = LoggerFactory.getLogger(EmissionVariableDefinitionAssembler.class);

    private final CommonCodeService commonCodeService;
    private final String carbonateTypeCodeId;
    private final String limeTypeTier1CodeId;
    private final String limeTypeTier2CodeId;
    private final String hydratedLimeProductionCodeId;
    private final String yes;
    private final String no;

    EmissionVariableDefinitionAssembler(CommonCodeService commonCodeService,
                                        String carbonateTypeCodeId,
                                        String limeTypeTier1CodeId,
                                        String limeTypeTier2CodeId,
                                        String hydratedLimeProductionCodeId,
                                        String yes,
                                        String no) {
        this.commonCodeService = commonCodeService;
        this.carbonateTypeCodeId = carbonateTypeCodeId;
        this.limeTypeTier1CodeId = limeTypeTier1CodeId;
        this.limeTypeTier2CodeId = limeTypeTier2CodeId;
        this.hydratedLimeProductionCodeId = hydratedLimeProductionCodeId;
        this.yes = yes;
        this.no = no;
    }

    List<EmissionVariableDefinitionVO> enrich(EmissionCategoryVO category,
                                              Integer tier,
                                              List<EmissionVariableDefinitionVO> variables,
                                              CalculationDefinition definition) {
        if (variables == null || variables.isEmpty()) {
            return Collections.emptyList();
        }
        List<Map<String, String>> carbonateOptions = loadCommonCodeOptions(carbonateTypeCodeId);
        List<Map<String, String>> limeTypeTier1Options = loadCommonCodeOptions(limeTypeTier1CodeId);
        List<Map<String, String>> limeTypeTier2Options = loadCommonCodeOptions(limeTypeTier2CodeId);
        List<Map<String, String>> hydratedLimeProductionOptions = List.of(
                option("Y", "생산함"),
                option("N", "생산하지 않음")
        );
        String subCode = safe(category == null ? null : category.getSubCode()).toUpperCase(Locale.ROOT);
        for (EmissionVariableDefinitionVO variable : variables) {
            applyVariableOptions(variable, subCode, tier, carbonateOptions, limeTypeTier1Options, limeTypeTier2Options, hydratedLimeProductionOptions);
            applyVariableUiMetadata(variable, definition);
        }
        return variables;
    }

    private void applyVariableOptions(EmissionVariableDefinitionVO variable,
                                      String subCode,
                                      Integer tier,
                                      List<Map<String, String>> carbonateOptions,
                                      List<Map<String, String>> limeTypeTier1Options,
                                      List<Map<String, String>> limeTypeTier2Options,
                                      List<Map<String, String>> hydratedLimeProductionOptions) {
        String varCode = safe(variable == null ? null : variable.getVarCode()).toUpperCase(Locale.ROOT);
        if (varCode.endsWith("CARBONATE_TYPE")) {
            variable.setCommonCodeId(carbonateTypeCodeId);
            variable.setOptions(carbonateOptions);
            return;
        }
        if ("LIME".equals(subCode) && "LIME_TYPE".equals(varCode)) {
            if (Objects.equals(tier, 1)) {
                variable.setCommonCodeId(limeTypeTier1CodeId);
                variable.setOptions(limeTypeTier1Options);
            } else if (Objects.equals(tier, 2)) {
                variable.setCommonCodeId(limeTypeTier2CodeId);
                variable.setOptions(limeTypeTier2Options);
            }
            return;
        }
        if ("LIME".equals(subCode) && Objects.equals(tier, 2) && "HYDRATED_LIME_PRODUCTION_YN".equals(varCode)) {
            variable.setCommonCodeId(hydratedLimeProductionCodeId);
            variable.setOptions(hydratedLimeProductionOptions);
        }
    }

    private void applyVariableUiMetadata(EmissionVariableDefinitionVO variable, CalculationDefinition definition) {
        String varCode = safe(variable == null ? null : variable.getVarCode()).toUpperCase(Locale.ROOT);
        if (varCode.isEmpty()) {
            return;
        }
        String displayName = firstNonBlank(safe(variable.getDisplayName()), definition.uiDefinition.displayName(varCode));
        if (!displayName.isEmpty()) {
            variable.setDisplayName(displayName);
        }
        String displayCode = firstNonBlank(safe(variable.getDisplayCode()), definition.uiDefinition.displayCode(varCode));
        if (!displayCode.isEmpty()) {
            variable.setDisplayCode(displayCode);
        }
        String uiHint = firstNonBlank(safe(variable.getUiHint()), definition.uiDefinition.uiHint(varCode));
        if (!uiHint.isEmpty()) {
            variable.setUiHint(uiHint);
        }
        variable.setDerivedYn(firstNonBlank(safe(variable.getDerivedYn()), definition.uiDefinition.isDerived(varCode) ? yes : no));
        variable.setSupplementalYn(firstNonBlank(safe(variable.getSupplementalYn()), definition.uiDefinition.isSupplemental(varCode) ? yes : no));
        String repeatGroupKey = firstNonBlank(safe(variable.getRepeatGroupKey()), definition.uiDefinition.repeatGroupKey(varCode));
        if (!repeatGroupKey.isEmpty()) {
            variable.setRepeatGroupKey(repeatGroupKey);
        }
        VariableSectionDefinition section = hasSectionMetadata(variable)
                ? new VariableSectionDefinition(
                safe(variable.getSectionId()),
                safe(variable.getSectionTitle()),
                safe(variable.getSectionDescription()),
                safe(variable.getSectionFormula()))
                : definition.uiDefinition.section(varCode);
        if (section != null && !section.id.isEmpty()) {
            setSection(variable, section.id, section.title, section.description, section.formula);
        }
    }

    private boolean hasSectionMetadata(EmissionVariableDefinitionVO variable) {
        return variable != null && !safe(variable.getSectionId()).isEmpty();
    }

    private void setSection(EmissionVariableDefinitionVO variable,
                            String sectionId,
                            String sectionTitle,
                            String sectionDescription,
                            String sectionFormula) {
        variable.setSectionId(sectionId);
        variable.setSectionTitle(sectionTitle);
        variable.setSectionDescription(sectionDescription);
        variable.setSectionFormula(sectionFormula);
    }

    private List<Map<String, String>> loadCommonCodeOptions(String codeId) {
        if (commonCodeService == null || safe(codeId).isEmpty()) {
            return Collections.emptyList();
        }
        try {
            ComDefaultCodeVO request = new ComDefaultCodeVO();
            request.setCodeId(codeId);
            List<CmmnDetailCode> detailCodes = commonCodeService.selectCmmCodeDetail(request);
            List<Map<String, String>> options = new ArrayList<>();
            for (CmmnDetailCode detailCode : detailCodes) {
                options.add(buildCommonCodeOption(detailCode));
            }
            return options;
        } catch (Exception e) {
            log.warn("Failed to load common code options. codeId={}", codeId, e);
            return Collections.emptyList();
        }
    }

    private Map<String, String> buildCommonCodeOption(CmmnDetailCode detailCode) {
        Map<String, String> option = new java.util.LinkedHashMap<>();
        option.put("code", safe(detailCode.getCode()));
        option.put("label", firstNonBlank(safe(detailCode.getCodeNm()), safe(detailCode.getCode())));
        option.put("description", safe(detailCode.getCodeDc()));
        return option;
    }
}
