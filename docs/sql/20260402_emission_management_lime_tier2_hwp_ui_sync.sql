UPDATE emission_variable_def
SET display_name = '석회 유형',
    display_code = 'EFi',
    var_desc = '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 고토석회는 기본 함유량 사용 시 선진국/개도국을 구분',
    section_title = '기본 활동자료 입력',
    section_description = '각 행별로 석회 유형과 석회 생산량(Ml,i)을 입력합니다.',
    section_formula = '사용자 입력: 석회 유형, Ml,i'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'LIME_TYPE';

UPDATE emission_variable_def
SET display_name = '석회 생산량',
    display_code = 'Ml,i',
    var_desc = 'i 유형의 석회 생산량',
    section_title = '기본 활동자료 입력',
    section_description = '각 행별로 석회 유형과 석회 생산량(Ml,i)을 입력합니다.',
    section_formula = '사용자 입력: 석회 유형, Ml,i'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'MLI';

UPDATE emission_variable_def
SET display_name = 'CaO 함유량',
    display_code = 'CaO',
    var_desc = '고칼슘석회 또는 수경성석회의 CaO 함유량. 0~1 비율 또는 0~100 퍼센트 입력 가능',
    ui_hint = '문서 기준 원입력값입니다. EF석회,a 또는 EF석회,c 산정에 사용하며, 비워두면 표 2.4 기본 함유량을 사용합니다.',
    section_title = 'EF석회,i 산정 입력',
    section_description = '조성 입력값을 입력하면 EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i를 아래 미리보기에서 즉시 확인할 수 있습니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'CAO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'CaO·MgO 함유량',
    display_code = 'CaO·MgO',
    var_desc = '고토석회의 CaO·MgO 함유량. 0~1 비율 또는 0~100 퍼센트 입력 가능',
    ui_hint = '문서 기준 원입력값입니다. 고토석회에서는 EF석회,b 산정에 우선 사용하며, 비워두면 표 2.4 기본 함유량을 사용합니다.',
    section_title = 'EF석회,i 산정 입력',
    section_description = '조성 입력값을 입력하면 EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i를 아래 미리보기에서 즉시 확인할 수 있습니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'CAO_MGO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'MgO 함유량',
    display_code = 'MgO',
    var_desc = '고토석회의 MgO 함유량. CaO·MgO 함유량을 별도로 모를 때 CaO 함유량과 합산해 사용할 수 있습니다. 0~1 비율 또는 0~100 퍼센트 입력 가능',
    ui_hint = '보조 원입력값입니다. CaO·MgO 함유량을 직접 모를 때만 사용합니다.',
    section_title = 'EF석회,i 산정 입력',
    section_description = '조성 입력값을 입력하면 EF석회,a, EF석회,b, EF석회,c와 적용 EF석회,i를 아래 미리보기에서 즉시 확인할 수 있습니다.',
    section_formula = '산정식: EF석회,a = SR_CAO × CaO, EF석회,b = SR_CAO·MgO × (CaO·MgO), EF석회,c = SR_CAO × CaO'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'MGO_CONTENT';

UPDATE emission_variable_def
SET display_name = 'LKD 질량',
    display_code = 'Md',
    var_desc = 'LKD의 무게 내지 질량. CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd 계산에 사용',
    ui_hint = '문서 기준 원입력값입니다. CF_lkd,i 산정에 사용합니다.',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래 미리보기에서 CF_lkd,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'MD';

UPDATE emission_variable_def
SET display_name = 'LKD 원래 탄산염 비율',
    display_code = 'Cd',
    var_desc = 'LKD 내 원래 탄산염의 무게 비율. CF_lkd,i 계산에 사용',
    ui_hint = '문서 기준 원입력값입니다. CF_lkd,i 산정에 사용합니다.',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래 미리보기에서 CF_lkd,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'CD';

UPDATE emission_variable_def
SET display_name = 'LKD 소성 비율',
    display_code = 'Fd',
    var_desc = 'LKD에 대해 달성된 소성 비율. CF_lkd,i 계산에 사용',
    ui_hint = '문서 기준 원입력값입니다. CF_lkd,i 산정에 사용합니다.',
    section_title = 'CF_lkd,i 산정 입력',
    section_description = 'Md, Cd, Fd를 입력하면 아래 미리보기에서 CF_lkd,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'FD';

UPDATE emission_variable_def
SET display_name = '수화석회 생산 여부',
    display_code = 'C_h,i 조건',
    var_desc = '수화석회 생산 여부. 생산하지 않으면 C_h,i = 1.00, 생산했는데 x,y 자료가 없으면 기본값 0.97 적용',
    ui_hint = '문서 기준 선택값입니다. C_h,i에 1.00, 0.97, 또는 1-(x×y) 중 무엇을 적용할지 결정합니다.',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 아래 미리보기에서 C_h,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'HYDRATED_LIME_PRODUCTION_YN';

UPDATE emission_variable_def
SET display_name = '수화석회 비율',
    display_code = 'x',
    var_desc = '수화석회의 비율 x. C_h,i = 1 - (x × y) 계산에 사용',
    ui_hint = '문서 기준 원입력값입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 아래 미리보기에서 C_h,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'X';

UPDATE emission_variable_def
SET display_name = '석회 수분 함유량',
    display_code = 'y',
    var_desc = '석회 내 수분 함유량 y. C_h,i = 1 - (x × y) 계산에 사용',
    ui_hint = '문서 기준 원입력값입니다. 수화석회를 생산할 때 C_h,i 산정에 사용합니다.',
    section_title = 'C_h,i 산정 입력',
    section_description = '수화석회 생산 여부와 x, y를 입력하면 아래 미리보기에서 C_h,i 값을 즉시 확인할 수 있습니다.',
    section_formula = '산정식: C_h,i = 1 - (x × y), 또는 조건별 문서 기본값'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'Y';

UPDATE emission_factor
SET factor_name = '석회 LKD 보정계수 기본값',
    remark = '자료가 없을 때 문서 기준 CF_lkd,i 기본값 1.02'
WHERE category_id = 2
  AND tier = 2
  AND factor_code = 'CF_LKD';

UPDATE emission_factor
SET factor_name = '석회 기본 배출계수',
    remark = '85% 고칼슘석회 + 15% 고토석회 + 0% 수화석회'
WHERE category_id = 2
  AND tier = 1
  AND factor_code = 'EF_LIME';

UPDATE emission_factor
SET factor_name = '수화석회 보정 기본값',
    remark = 'x, y 자료가 없는 수화석회 생산 시 문서 기준 C_h,i 기본값 0.97'
WHERE category_id = 2
  AND tier = 2
  AND factor_code = 'HYDRATED_LIME_CORRECTION_DEFAULT';
