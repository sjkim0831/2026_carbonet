-- Align cement Tier 1 variable definitions with the document's SUM(Mci × Ccli) structure.

UPDATE emission_variable_def
SET
    var_name = '생산된 I유형 시멘트 i 질량',
    var_desc = '생산된 I 유형 시멘트 i의 무게(질량). SUM(Mci×Ccli) 계산을 위해 행 추가 입력 가능',
    is_repeatable = 'Y',
    updated_at = CURRENT_DATETIME
WHERE category_id = 1
  AND tier = 1
  AND var_code = 'MCI';

UPDATE emission_variable_def
SET
    var_name = 'I유형 시멘트 i의 클링커 비율',
    var_desc = 'I 유형 시멘트 i의 클링커 비율. SUM(Mci×Ccli) 계산을 위해 MCI와 같은 lineNo로 입력',
    is_repeatable = 'Y',
    updated_at = CURRENT_DATETIME
WHERE category_id = 1
  AND tier = 1
  AND var_code = 'CCLI';
