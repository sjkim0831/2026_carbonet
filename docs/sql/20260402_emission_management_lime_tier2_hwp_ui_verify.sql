SELECT
    var_code,
    display_name,
    display_code,
    ui_hint,
    section_title
FROM emission_variable_def
WHERE category_id = 2
  AND tier = 2
  AND var_code IN ('LIME_TYPE', 'MLI', 'CAO_CONTENT', 'CAO_MGO_CONTENT', 'MD', 'CD', 'FD', 'HYDRATED_LIME_PRODUCTION_YN', 'X', 'Y')
ORDER BY sort_order;

SELECT
    factor_code,
    factor_name,
    remark
FROM emission_factor
WHERE category_id = 2
  AND tier = 2
  AND factor_code IN ('CF_LKD', 'HYDRATED_LIME_CORRECTION_DEFAULT')
ORDER BY factor_code;
