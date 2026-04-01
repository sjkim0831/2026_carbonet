UPDATE emission_variable_def
SET var_desc = '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 고토석회는 기본 함유량 사용 시 선진국/개도국을 구분'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'LIME_TYPE';

MERGE INTO emission_variable_def t
USING (
    SELECT 2 AS category_id, 2 AS tier, 'MD' AS var_code, 'LKD 질량' AS var_name, 'LKD의 무게 내지 질량. CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd 계산에 사용' AS var_desc, 'ton' AS unit, 'NUMBER' AS input_type, 'USER' AS source_type, 'Y' AS is_repeatable, 'N' AS is_required, 50 AS sort_order, 'Y' AS use_yn, 36 AS variable_id FROM db_root
    UNION ALL
    SELECT 2, 2, 'CD', 'LKD 원래 탄산염 비율', 'LKD 내 원래 탄산염의 무게 비율. CF_lkd,i 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 60, 'Y', 37 FROM db_root
    UNION ALL
    SELECT 2, 2, 'FD', 'LKD 소성 비율', 'LKD에 대해 달성된 소성 비율. CF_lkd,i 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 70, 'Y', 38 FROM db_root
    UNION ALL
    SELECT 2, 2, 'HYDRATED_LIME_PRODUCTION_YN', '수화석회 생산 여부', '수화석회 생산 여부. 생산하지 않으면 C_h,i = 1.00, 생산했는데 x,y 자료가 없으면 기본값 0.97 적용', 'YN', 'TEXT', 'USER', 'Y', 'N', 80, 'Y', 41 FROM db_root
    UNION ALL
    SELECT 2, 2, 'X', '수화석회 비율', '수화석회의 비율 x. C_h,i = 1 - (x × y) 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 90, 'Y', 39 FROM db_root
    UNION ALL
    SELECT 2, 2, 'Y', '석회 수분 함유량', '석회 내 수분 함유량 y. C_h,i = 1 - (x × y) 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 100, 'Y', 40 FROM db_root
) s
ON (t.category_id = s.category_id AND t.tier = s.tier AND t.var_code = s.var_code)
WHEN MATCHED THEN
    UPDATE SET
        t.var_name = s.var_name,
        t.var_desc = s.var_desc,
        t.unit = s.unit,
        t.input_type = s.input_type,
        t.source_type = s.source_type,
        t.is_repeatable = s.is_repeatable,
        t.is_required = s.is_required,
        t.sort_order = s.sort_order,
        t.use_yn = s.use_yn
WHEN NOT MATCHED THEN
    INSERT (variable_id, category_id, tier, var_code, var_name, var_desc, unit, input_type, source_type, is_repeatable, is_required, sort_order, use_yn)
    VALUES (s.variable_id, s.category_id, s.tier, s.var_code, s.var_name, s.var_desc, s.unit, s.input_type, s.source_type, s.is_repeatable, s.is_required, s.sort_order, s.use_yn);

MERGE INTO emission_factor t
USING (
    SELECT 2 AS category_id, 2 AS tier, 'CF_LKD' AS factor_code, '석회 LKD 보정계수 기본값' AS factor_name, 1.0200 AS factor_value, 'ratio' AS unit, 'Y' AS default_yn, '자료가 없을 때 CF_lkd,i 기본값 1.02' AS remark, 18 AS factor_id FROM db_root
    UNION ALL
    SELECT 2, 2, 'HYDRATED_LIME_CORRECTION_DEFAULT', '수화석회 보정 기본값', 0.9700, 'ratio', 'Y', 'x, y 자료가 없는 수화석회 생산 시 C_h,i 기본값 0.97', 19 FROM db_root
) s
ON (t.category_id = s.category_id AND t.tier = s.tier AND t.factor_code = s.factor_code)
WHEN MATCHED THEN
    UPDATE SET
        t.factor_name = s.factor_name,
        t.factor_value = s.factor_value,
        t.unit = s.unit,
        t.default_yn = s.default_yn,
        t.remark = s.remark
WHEN NOT MATCHED THEN
    INSERT (factor_id, category_id, tier, factor_code, factor_name, factor_value, unit, default_yn, remark)
    VALUES (s.factor_id, s.category_id, s.tier, s.factor_code, s.factor_name, s.factor_value, s.unit, s.default_yn, s.remark);
