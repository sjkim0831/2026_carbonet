ALTER TABLE emission_variable_def ADD COLUMN display_name VARCHAR(200);
ALTER TABLE emission_variable_def ADD COLUMN display_code VARCHAR(50);
ALTER TABLE emission_variable_def ADD COLUMN ui_hint VARCHAR(1000);
ALTER TABLE emission_variable_def ADD COLUMN derived_yn CHAR(1) NOT NULL DEFAULT 'N';
ALTER TABLE emission_variable_def ADD COLUMN supplemental_yn CHAR(1) NOT NULL DEFAULT 'N';
ALTER TABLE emission_variable_def ADD COLUMN repeat_group_key VARCHAR(100);
ALTER TABLE emission_variable_def ADD COLUMN section_id VARCHAR(100);
ALTER TABLE emission_variable_def ADD COLUMN section_title VARCHAR(200);
ALTER TABLE emission_variable_def ADD COLUMN section_description VARCHAR(1000);
ALTER TABLE emission_variable_def ADD COLUMN section_formula VARCHAR(1000);

UPDATE emission_variable_def
SET repeat_group_key = 'cement-tier1-clinker'
WHERE category_id = 1 AND tier = 1 AND var_code IN ('MCI', 'CCLI');

UPDATE emission_variable_def
SET display_name = 'EFI 탄산염 종류',
    display_code = 'EFI',
    repeat_group_key = 'cement-tier3-carbonate'
WHERE category_id = 1 AND tier = 3 AND var_code = 'CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = 'EFD 탄산염 종류',
    display_code = 'EFD'
WHERE category_id = 1 AND tier = 3 AND var_code = 'LKD_CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = 'EFK 탄산염 종류',
    display_code = 'EFK',
    repeat_group_key = 'cement-tier3-raw-material'
WHERE category_id = 1 AND tier = 3 AND var_code = 'RAW_MATERIAL_CARBONATE_TYPE';

UPDATE emission_variable_def
SET derived_yn = 'Y',
    repeat_group_key = 'cement-tier3-carbonate'
WHERE category_id = 1 AND tier = 3 AND var_code = 'EFI';

UPDATE emission_variable_def
SET repeat_group_key = 'cement-tier3-carbonate'
WHERE category_id = 1 AND tier = 3 AND var_code IN ('MI', 'FI');

UPDATE emission_variable_def
SET derived_yn = 'Y',
    repeat_group_key = 'cement-tier3-raw-material'
WHERE category_id = 1 AND tier = 3 AND var_code = 'EFK';

UPDATE emission_variable_def
SET repeat_group_key = 'cement-tier3-raw-material'
WHERE category_id = 1 AND tier = 3 AND var_code IN ('MK', 'XK');

UPDATE emission_variable_def
SET display_name = 'EF석회,i 유형',
    display_code = 'EFi',
    repeat_group_key = 'lime-tier1-production'
WHERE category_id = 2 AND tier = 1 AND var_code = 'LIME_TYPE';

UPDATE emission_variable_def
SET repeat_group_key = 'lime-tier1-production'
WHERE category_id = 2 AND tier = 1 AND var_code = 'MLI';

UPDATE emission_variable_def
SET display_name = 'EF석회,i 유형',
    display_code = 'EFi',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-production',
    section_title = '기본 활동자료 입력',
    section_description = '각 행별로 석회 유형과 생산량 Ml,i를 입력합니다.',
    section_formula = '사용자 입력: 석회 유형, Ml,i'
WHERE category_id = 2 AND tier = 2 AND var_code = 'LIME_TYPE';

UPDATE emission_variable_def
SET display_name = 'Ml,i 석회 생산량',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-production',
    section_title = '기본 활동자료 입력',
    section_description = '각 행별로 석회 유형과 생산량 Ml,i를 입력합니다.',
    section_formula = '사용자 입력: 석회 유형, Ml,i'
WHERE category_id = 2 AND tier = 2 AND var_code = 'MLI';

UPDATE emission_variable_def
SET display_name = 'CaO 함유량',
    display_code = 'CAO',
    ui_hint = 'Tier 2 전용 원입력입니다. EF석회,a 또는 EF석회,c 산정에 사용하며, 비워두면 문서 기본 함유량을 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ef',
    section_title = 'EF석회,i 산정 입력',
    section_description = '여기서는 조성 입력값만 받습니다. EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i는 아래에서 표 2.4 기준으로 계산됩니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2 AND tier = 2 AND var_code = 'CAO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'CaO·MgO 함유량',
    display_code = 'CAO_MGO',
    ui_hint = 'Tier 2 전용 원입력입니다. 고토석회에서 EF석회,b를 산정할 때 우선 사용하는 값이며, 비워두면 문서 기본 함유량을 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ef',
    section_title = 'EF석회,i 산정 입력',
    section_description = '여기서는 조성 입력값만 받습니다. EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i는 아래에서 표 2.4 기준으로 계산됩니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2 AND tier = 2 AND var_code = 'CAO_MGO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'MgO 함유량',
    display_code = 'MGO',
    ui_hint = 'Tier 2 전용 보조 원입력입니다. CaO·MgO 함유량을 직접 모를 때 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ef',
    section_title = 'EF석회,i 산정 입력',
    section_description = '여기서는 조성 입력값만 받습니다. EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i는 아래에서 표 2.4 기준으로 계산됩니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2 AND tier = 2 AND var_code = 'MGO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'Md LKD 질량',
    ui_hint = 'Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-cf',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래에서 CF_lkd,i를 계산합니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2 AND tier = 2 AND var_code = 'MD';

UPDATE emission_variable_def
SET display_name = 'Cd LKD 내 원래 탄산염 비율',
    ui_hint = 'Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-cf',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래에서 CF_lkd,i를 계산합니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2 AND tier = 2 AND var_code = 'CD';

UPDATE emission_variable_def
SET display_name = 'Fd LKD 소성 비율',
    ui_hint = 'Tier 2 전용 원입력입니다. CF_lkd,i 산정에 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-cf',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래에서 CF_lkd,i를 계산합니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2 AND tier = 2 AND var_code = 'FD';

UPDATE emission_variable_def
SET display_name = '수화석회 생산 여부',
    display_code = 'HYDRATED_YN',
    ui_hint = 'Tier 2 전용 원입력입니다. C_h,i에 1.00, 0.97, 또는 1-(x×y) 중 무엇을 적용할지 결정합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ch',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 문서 규칙에 따라 아래에서 C_h,i를 계산합니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2 AND tier = 2 AND var_code = 'HYDRATED_LIME_PRODUCTION_YN';

UPDATE emission_variable_def
SET display_name = 'x 수화석회 비율',
    display_code = 'x',
    ui_hint = 'Tier 2 전용 원입력입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ch',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 문서 규칙에 따라 아래에서 C_h,i를 계산합니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2 AND tier = 2 AND var_code = 'X';

UPDATE emission_variable_def
SET display_name = 'y 석회 내 수분 함유량',
    display_code = 'y',
    ui_hint = 'Tier 2 전용 원입력입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.',
    supplemental_yn = 'Y',
    repeat_group_key = 'lime-tier2-line',
    section_id = 'lime-tier2-ch',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 문서 규칙에 따라 아래에서 C_h,i를 계산합니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2 AND tier = 2 AND var_code = 'Y';

UPDATE emission_variable_def
SET display_name = 'EFi 탄산염 종류',
    display_code = 'EFi',
    repeat_group_key = 'lime-tier3-carbonate'
WHERE category_id = 2 AND tier = 3 AND var_code = 'CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = 'EFd 탄산염 종류',
    display_code = 'EFd'
WHERE category_id = 2 AND tier = 3 AND var_code = 'LKD_CARBONATE_TYPE';

UPDATE emission_variable_def
SET repeat_group_key = 'lime-tier3-carbonate'
WHERE category_id = 2 AND tier = 3 AND var_code IN ('MI', 'FI');
