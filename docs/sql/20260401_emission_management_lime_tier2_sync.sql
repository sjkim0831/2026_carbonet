UPDATE emission_variable_def
SET var_desc = '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 고토석회는 기본 함유량 사용 시 선진국/개도국을 구분'
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'LIME_TYPE';

INSERT INTO COMTCCMMNDETAILCODE (
    CODE_ID,
    CODE,
    CODE_NM,
    CODE_DC,
    USE_AT,
    FRST_REGIST_PNTTM,
    FRST_REGISTER_ID
)
SELECT
    'EMLIM2',
    'DOLOMITIC_HIGH',
    '고토석회(선진국)',
    'Tier 2 고토석회 선진국',
    'Y',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNDETAILCODE
    WHERE CODE_ID = 'EMLIM2'
      AND CODE = 'DOLOMITIC_HIGH'
);

INSERT INTO COMTCCMMNDETAILCODE (
    CODE_ID,
    CODE,
    CODE_NM,
    CODE_DC,
    USE_AT,
    FRST_REGIST_PNTTM,
    FRST_REGISTER_ID
)
SELECT
    'EMLIM2',
    'DOLOMITIC_LOW',
    '고토석회(개도국)',
    'Tier 2 고토석회 개도국',
    'Y',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNDETAILCODE
    WHERE CODE_ID = 'EMLIM2'
      AND CODE = 'DOLOMITIC_LOW'
);

DELETE FROM COMTCCMMNDETAILCODE
WHERE CODE_ID = 'EMLIM2'
  AND CODE = 'DOLOMITIC';
