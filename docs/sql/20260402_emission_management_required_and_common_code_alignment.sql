-- Align emission management required flags and hydrated-lime common codes with the KTL reference interpretation.

UPDATE emission_variable_def
SET
    is_required = 'N',
    updated_at = CURRENT_DATETIME
WHERE category_id = 1
  AND tier = 2
  AND var_code IN ('MD', 'CD', 'FD');

UPDATE emission_variable_def
SET
    is_required = 'N',
    var_desc = '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 미입력 시 문서 기본 석회 배출계수 fallback을 적용하고, 고토석회는 기본 함유량 사용 시 선진국/개도국을 구분',
    updated_at = CURRENT_DATETIME
WHERE category_id = 2
  AND tier = 2
  AND var_code = 'LIME_TYPE';

INSERT INTO COMTCCMMNCODE (
    CODE_ID,
    CODE_ID_NM,
    CODE_ID_DC,
    USE_AT,
    CL_CODE,
    FRST_REGIST_PNTTM,
    FRST_REGISTER_ID
)
SELECT
    'EMHYDRYN',
    '수화석회 생산 여부',
    '배출 관리 수화석회 생산 여부 공통코드',
    'Y',
    'EMM',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNCODE
    WHERE CODE_ID = 'EMHYDRYN'
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
    'EMHYDRYN',
    'Y',
    '생산함',
    '수화석회를 생산하는 경우',
    'Y',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNDETAILCODE
    WHERE CODE_ID = 'EMHYDRYN'
      AND CODE = 'Y'
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
    'EMHYDRYN',
    'N',
    '생산하지 않음',
    '수화석회를 생산하지 않는 경우',
    'Y',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNDETAILCODE
    WHERE CODE_ID = 'EMHYDRYN'
      AND CODE = 'N'
);
