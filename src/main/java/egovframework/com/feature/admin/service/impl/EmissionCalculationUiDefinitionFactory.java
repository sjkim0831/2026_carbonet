package egovframework.com.feature.admin.service.impl;

final class EmissionCalculationUiDefinitionFactory {
    private EmissionCalculationUiDefinitionFactory() {
    }

    static VariableUiDefinition cementTier1() {
        return VariableUiDefinition.builder()
                .repeatGroup("cement-tier1-clinker", "MCI", "CCLI")
                .build();
    }

    static VariableUiDefinition cementTier3() {
        return VariableUiDefinition.builder()
                .displayName("CARBONATE_TYPE", "EFI 탄산염 종류")
                .displayName("LKD_CARBONATE_TYPE", "EFD 탄산염 종류")
                .displayName("RAW_MATERIAL_CARBONATE_TYPE", "EFK 탄산염 종류")
                .displayCode("CARBONATE_TYPE", "EFI")
                .displayCode("LKD_CARBONATE_TYPE", "EFD")
                .displayCode("RAW_MATERIAL_CARBONATE_TYPE", "EFK")
                .derived("EFI", "EFK")
                .repeatGroup("cement-tier3-carbonate", "CARBONATE_TYPE", "MI", "FI", "EFI")
                .repeatGroup("cement-tier3-raw-material", "RAW_MATERIAL_CARBONATE_TYPE", "MK", "XK", "EFK")
                .build();
    }

    static VariableUiDefinition limeTier1() {
        return VariableUiDefinition.builder()
                .displayName("LIME_TYPE", "EF석회,i 유형")
                .displayCode("LIME_TYPE", "EFi")
                .repeatGroup("lime-tier1-production", "LIME_TYPE", "MLI")
                .build();
    }

    static VariableUiDefinition limeTier2() {
        VariableSectionDefinition productionSection = new VariableSectionDefinition(
                "lime-tier2-production",
                "기본 활동자료 입력",
                "각 행별로 석회 유형과 생산량 Ml,i를 입력합니다.",
                "사용자 입력: 석회 유형, Ml,i"
        );
        VariableSectionDefinition efSection = new VariableSectionDefinition(
                "lime-tier2-ef",
                "EF석회,i 산정 입력",
                "여기서는 조성 입력값만 받습니다. EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i는 아래에서 표 2.4 기준으로 계산됩니다.",
                "산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO"
        );
        VariableSectionDefinition cfSection = new VariableSectionDefinition(
                "lime-tier2-cf",
                "CF_lkd,i 산정 입력",
                "Md, Cd, Fd를 입력하면 아래에서 CF_lkd,i를 계산합니다.",
                "산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd"
        );
        VariableSectionDefinition chSection = new VariableSectionDefinition(
                "lime-tier2-ch",
                "C_h,i 산정 입력",
                "수화석회 생산 여부와 x, y를 입력하면 문서 규칙에 따라 아래에서 C_h,i를 계산합니다.",
                "산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값"
        );
        return VariableUiDefinition.builder()
                .displayName("LIME_TYPE", "EF석회,i 유형")
                .displayName("MLI", "Ml,i 석회 생산량")
                .displayName("CAO_CONTENT", "CaO 함유량")
                .displayName("CAO_MGO_CONTENT", "CaO·MgO 함유량")
                .displayName("MGO_CONTENT", "MgO 함유량")
                .displayName("MD", "Md LKD 질량")
                .displayName("CD", "Cd LKD 내 원래 탄산염 비율")
                .displayName("FD", "Fd LKD 소성 비율")
                .displayName("X", "x 수화석회 비율")
                .displayName("Y", "y 석회 내 수분 함유량")
                .displayName("HYDRATED_LIME_PRODUCTION_YN", "수화석회 생산 여부")
                .displayCode("LIME_TYPE", "EFi")
                .displayCode("CAO_CONTENT", "CAO")
                .displayCode("CAO_MGO_CONTENT", "CAO_MGO")
                .displayCode("MGO_CONTENT", "MGO")
                .displayCode("HYDRATED_LIME_PRODUCTION_YN", "HYDRATED_YN")
                .displayCode("X", "x")
                .displayCode("Y", "y")
                .supplemental("CAO_CONTENT", "CAO_MGO_CONTENT", "MGO_CONTENT", "MD", "CD", "FD", "HYDRATED_LIME_PRODUCTION_YN", "X", "Y")
                .uiHint("CAO_CONTENT", "Tier 2 전용 원입력입니다. EF석회,a 또는 EF석회,c 산정에 사용하며, 비워두면 문서 기본 함유량을 사용합니다.")
                .uiHint("CAO_MGO_CONTENT", "Tier 2 전용 원입력입니다. 고토석회에서 EF석회,b를 산정할 때 우선 사용하는 값이며, 비워두면 문서 기본 함유량을 사용합니다.")
                .uiHint("MGO_CONTENT", "Tier 2 전용 보조 원입력입니다. CaO·MgO 함유량을 직접 모를 때 사용합니다.")
                .uiHint("MD", "Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.")
                .uiHint("CD", "Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.")
                .uiHint("FD", "Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.")
                .uiHint("X", "Tier 2 전용 원입력입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.")
                .uiHint("Y", "Tier 2 전용 원입력입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.")
                .uiHint("HYDRATED_LIME_PRODUCTION_YN", "Tier 2 전용 원입력입니다. C_h,i에 1.00, 0.97, 또는 1-(x×y) 중 무엇을 적용할지 결정합니다.")
                .repeatGroup("lime-tier2-line", "LIME_TYPE", "MLI", "CAO_CONTENT", "CAO_MGO_CONTENT", "MGO_CONTENT", "MD", "CD", "FD", "HYDRATED_LIME_PRODUCTION_YN", "X", "Y")
                .section(productionSection, "LIME_TYPE", "MLI")
                .section(efSection, "CAO_CONTENT", "CAO_MGO_CONTENT", "MGO_CONTENT")
                .section(cfSection, "MD", "CD", "FD")
                .section(chSection, "HYDRATED_LIME_PRODUCTION_YN", "X", "Y")
                .build();
    }

    static VariableUiDefinition limeTier3() {
        return VariableUiDefinition.builder()
                .displayName("CARBONATE_TYPE", "EFi 탄산염 종류")
                .displayName("LKD_CARBONATE_TYPE", "EFd 탄산염 종류")
                .displayCode("CARBONATE_TYPE", "EFi")
                .displayCode("LKD_CARBONATE_TYPE", "EFd")
                .repeatGroup("lime-tier3-carbonate", "CARBONATE_TYPE", "MI", "FI")
                .build();
    }
}
