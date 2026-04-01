-- Add the missing MgO content input for lime Tier 2 so the UI matches the
-- formula reference and the service can derive CaO·MgO content from CaO + MgO.

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
    34,
    2,
    2,
    'MGO_CONTENT',
    'MgO 함유량',
    '고토석회의 MgO 함유량. CaO·MgO 함유량을 별도로 모를 때 CaO 함유량과 합산해 사용할 수 있습니다. 0~1 비율 또는 0~100 퍼센트 입력 가능',
    'ratio',
    'NUMBER',
    'USER',
    'Y',
    'N',
    45,
    'Y'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM emission_variable_def
    WHERE category_id = 2
      AND tier = 2
      AND var_code = 'MGO_CONTENT'
);
