-- Add carbonate selector for cement tier 3 raw-material summation group.

UPDATE emission_variable_def
SET sort_order = 100
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'MK';

UPDATE emission_variable_def
SET sort_order = 110
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'XK';

UPDATE emission_variable_def
SET sort_order = 120,
    var_desc = '원료 k의 배출계수. 미입력 시 원료 k 탄산염 종류를 표 2.1에 매핑하고, 열량 기여가 5% 미만이면 해당 항은 0으로 처리 가능'
WHERE category_id = 1
  AND tier = 3
  AND var_code = 'EFK';

INSERT INTO emission_variable_def (
    variable_id,
    category_id,
    tier,
    var_code,
    var_name,
    var_desc,
    unit,
    input_type,
    source_type,
    is_repeatable,
    is_required,
    sort_order,
    use_yn
)
SELECT
    35,
    1,
    3,
    'RAW_MATERIAL_CARBONATE_TYPE',
    '원료 k 탄산염 종류',
    '표 2.1 기준 원료 k 탄산염 종류. EFK 미입력 시 선택값으로 배출계수를 유도',
    'text',
    'TEXT',
    'USER',
    'Y',
    'N',
    90,
    'Y'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM emission_variable_def
    WHERE category_id = 1
      AND tier = 3
      AND var_code = 'RAW_MATERIAL_CARBONATE_TYPE'
);
