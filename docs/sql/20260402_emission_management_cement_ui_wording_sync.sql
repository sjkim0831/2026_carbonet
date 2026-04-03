UPDATE emission_variable_def
SET display_name = '비재활용 CKD 질량',
    var_desc = '재활용되지 않은 CKD 질량',
    ui_hint = '문서 기준 원입력값입니다. CKD 보정 또는 손실 보정 계산에 사용합니다.'
WHERE category_id = 1
  AND tier IN (2, 3)
  AND var_code = 'MD';

UPDATE emission_variable_def
SET display_name = '비재활용 CKD 원래 탄산염 비율',
    var_desc = '재활용되지 않은 CKD 내 원래 탄산염 비율',
    ui_hint = '문서 기준 원입력값입니다. CKD 보정 또는 손실 보정 계산에 사용합니다.'
WHERE category_id = 1
  AND tier IN (2, 3)
  AND var_code = 'CD';

UPDATE emission_variable_def
SET display_name = '비재활용 CKD 소성 비율',
    var_desc = '재활용되지 않은 CKD에 대해 달성된 소성 비율',
    ui_hint = '문서 기준 원입력값입니다. CKD 보정 또는 손실 보정 계산에 사용합니다.'
WHERE category_id = 1
  AND tier IN (2, 3)
  AND var_code = 'FD';

UPDATE emission_variable_def
SET display_name = '탄산염 종류'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = '손실 CKD 탄산염 종류',
    var_desc = '표 2.1 기준 손실 CKD 잔류 탄산염 종류. 미입력 시 기본 EFd 또는 DB 값 사용'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'LKD_CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = '원료 탄산염 종류',
    var_desc = '표 2.1 기준 원료 탄산염 종류. EFk 미입력 시 선택값으로 배출계수를 유도'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'RAW_MATERIAL_CARBONATE_TYPE';

UPDATE emission_variable_def
SET display_name = '원료 질량',
    var_desc = '비연료 원료의 질량'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'MK';

UPDATE emission_variable_def
SET display_name = '원료 탄소 비율',
    var_desc = '원료의 총 유기물 또는 기타 탄소 비율'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'XK';

UPDATE emission_factor
SET factor_name = '비재활용 CKD 배출계수'
WHERE category_id = 1
  AND tier = 3
  AND factor_code = 'EFD';

UPDATE emission_factor
SET factor_name = '비재활용 CKD 보정 기본값',
    remark = '자료가 없을 때 적용하는 문서 기준 CKD 보정 기본값 1.020'
WHERE category_id = 1
  AND tier = 2
  AND factor_code = 'CFCKD';
