-- CUBRID-safe admin full-stack management menu registration
--
-- Creates:
-- - COMTCCMMNDETAILCODE
-- - COMTNMENUINFO
-- - COMTNMENUORDER
-- - COMTNMENUFUNCTIONINFO
-- - COMTNAUTHORFUNCTIONRELATE

-- =========================================================
-- 1) Pre-check
-- =========================================================

SELECT
    base.MENU_CODE AS base_menu_code,
    SUBSTR(base.MENU_CODE, 1, 6) AS parent_group_code,
    COALESCE((
        SELECT MAX(CAST(SUBSTR(d.CODE, 7, 2) AS INTEGER))
        FROM COMTCCMMNDETAILCODE d
        WHERE d.CODE_ID = 'AMENU1'
          AND LENGTH(d.CODE) = 8
          AND SUBSTR(d.CODE, 1, 6) = SUBSTR(base.MENU_CODE, 1, 6)
    ), 0) + 1 AS next_suffix
FROM COMTNMENUINFO base
WHERE base.MENU_URL = '/admin/system/menu-management';

SELECT
    'MENU_URL_EXISTS' AS check_name,
    COUNT(*) AS row_count
FROM COMTNMENUINFO
WHERE MENU_URL = '/admin/system/full-stack-management'
UNION ALL
SELECT
    'FEATURE_CODE_EXISTS' AS check_name,
    COUNT(*) AS row_count
FROM COMTNMENUFUNCTIONINFO
WHERE FEATURE_CODE = 'A0060108_VIEW'
UNION ALL
SELECT
    'AUTHOR_REL_EXISTS' AS check_name,
    COUNT(*) AS row_count
FROM COMTNAUTHORFUNCTIONRELATE
WHERE FEATURE_CODE = 'A0060108_VIEW'
UNION ALL
SELECT
    'DETAIL_NAME_EXISTS' AS check_name,
    COUNT(*) AS row_count
FROM COMTCCMMNDETAILCODE
WHERE CODE_ID = 'AMENU1'
  AND CODE_NM = '풀스택 관리';

SELECT
    r.AUTHOR_CODE,
    COUNT(*) AS current_menu_management_feature_count
FROM COMTNAUTHORFUNCTIONRELATE r
JOIN COMTNMENUFUNCTIONINFO f
  ON f.FEATURE_CODE = r.FEATURE_CODE
JOIN COMTNMENUINFO m
  ON m.MENU_CODE = f.MENU_CODE
WHERE m.MENU_URL = '/admin/system/menu-management'
GROUP BY r.AUTHOR_CODE
ORDER BY r.AUTHOR_CODE;

-- =========================================================
-- 2) Insert detail code + menu
-- =========================================================

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
    'AMENU1',
    SUBSTR(base.MENU_CODE, 1, 6)
      || LPAD(CAST(COALESCE((
            SELECT MAX(CAST(SUBSTR(d.CODE, 7, 2) AS INTEGER))
            FROM COMTCCMMNDETAILCODE d
            WHERE d.CODE_ID = 'AMENU1'
              AND LENGTH(d.CODE) = 8
              AND SUBSTR(d.CODE, 1, 6) = SUBSTR(base.MENU_CODE, 1, 6)
        ), 0) + 1 AS VARCHAR), 2, '0') AS new_menu_code,
    '풀스택 관리',
    'Full-Stack Management',
    'Y',
    CURRENT_DATETIME,
    'codex'
FROM COMTNMENUINFO base
WHERE base.MENU_URL = '/admin/system/menu-management'
  AND NOT EXISTS (
      SELECT 1
      FROM COMTNMENUINFO m
      WHERE m.MENU_URL = '/admin/system/full-stack-management'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM COMTCCMMNDETAILCODE d2
      WHERE d2.CODE_ID = 'AMENU1'
        AND d2.CODE_NM = '풀스택 관리'
  );

INSERT INTO COMTNMENUINFO (
    MENU_CODE,
    MENU_NM,
    MENU_NM_EN,
    MENU_URL,
    MENU_ICON,
    USE_AT,
    FRST_REGIST_PNTTM,
    LAST_UPDT_PNTTM
)
SELECT
    d.CODE,
    '풀스택 관리',
    'Full-Stack Management',
    '/admin/system/full-stack-management',
    'hub',
    'Y',
    CURRENT_DATETIME,
    CURRENT_DATETIME
FROM COMTCCMMNDETAILCODE d
WHERE d.CODE_ID = 'AMENU1'
  AND d.CODE_NM = '풀스택 관리'
  AND d.CODE_DC = 'Full-Stack Management'
  AND LENGTH(d.CODE) = 8
  AND NOT EXISTS (
      SELECT 1
      FROM COMTNMENUINFO m
      WHERE m.MENU_URL = '/admin/system/full-stack-management'
  );

INSERT INTO COMTNMENUORDER (
    MENU_CODE,
    SORT_ORDR,
    FRST_REGIST_PNTTM,
    LAST_UPDT_PNTTM
)
SELECT
    m.MENU_CODE,
    COALESCE((
        SELECT MAX(o.SORT_ORDR) + 1
        FROM COMTNMENUORDER o
        WHERE SUBSTR(o.MENU_CODE, 1, 6) = SUBSTR(m.MENU_CODE, 1, 6)
    ), 1),
    CURRENT_DATETIME,
    CURRENT_DATETIME
FROM COMTNMENUINFO m
WHERE m.MENU_URL = '/admin/system/full-stack-management'
  AND NOT EXISTS (
      SELECT 1
      FROM COMTNMENUORDER o2
      WHERE o2.MENU_CODE = m.MENU_CODE
  );

INSERT INTO COMTNMENUFUNCTIONINFO (
    MENU_CODE,
    FEATURE_CODE,
    FEATURE_NM,
    FEATURE_NM_EN,
    FEATURE_DC,
    USE_AT,
    FRST_REGIST_PNTTM,
    LAST_UPDT_PNTTM
)
SELECT
    m.MENU_CODE,
    'A0060108_VIEW',
    '풀스택 관리 조회',
    'Full-Stack Management View',
    '풀스택 관리 기본 VIEW 권한',
    'Y',
    CURRENT_DATETIME,
    CURRENT_DATETIME
FROM COMTNMENUINFO m
WHERE m.MENU_URL = '/admin/system/full-stack-management'
  AND NOT EXISTS (
      SELECT 1
      FROM COMTNMENUFUNCTIONINFO f
      WHERE f.FEATURE_CODE = 'A0060108_VIEW'
  );

INSERT INTO COMTNAUTHORFUNCTIONRELATE (
    AUTHOR_CODE,
    FEATURE_CODE,
    GRANT_AUTHORITY_YN,
    CREAT_DT
)
SELECT
    author_targets.AUTHOR_CODE,
    'A0060108_VIEW',
    'N',
    CURRENT_DATETIME
FROM (
    SELECT DISTINCT
        r.AUTHOR_CODE
    FROM COMTNAUTHORFUNCTIONRELATE r
    JOIN COMTNMENUFUNCTIONINFO f
      ON f.FEATURE_CODE = r.FEATURE_CODE
    JOIN COMTNMENUINFO m
      ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL = '/admin/system/menu-management'

    UNION ALL

    SELECT 'ROLE_ADMIN'
    FROM db_root
    WHERE NOT EXISTS (
        SELECT 1
        FROM COMTNAUTHORFUNCTIONRELATE r2
        JOIN COMTNMENUFUNCTIONINFO f2
          ON f2.FEATURE_CODE = r2.FEATURE_CODE
        JOIN COMTNMENUINFO m2
          ON m2.MENU_CODE = f2.MENU_CODE
        WHERE m2.MENU_URL = '/admin/system/menu-management'
    )
) author_targets
WHERE EXISTS (
    SELECT 1
    FROM COMTNMENUFUNCTIONINFO f3
    WHERE f3.FEATURE_CODE = 'A0060108_VIEW'
)
AND EXISTS (
    SELECT 1
    FROM COMTNAUTHORINFO a
    WHERE a.AUTHOR_CODE = author_targets.AUTHOR_CODE
)
AND NOT EXISTS (
    SELECT 1
    FROM COMTNAUTHORFUNCTIONRELATE r3
    WHERE r3.AUTHOR_CODE = author_targets.AUTHOR_CODE
      AND r3.FEATURE_CODE = 'A0060108_VIEW'
);

-- =========================================================
-- 3) Post-check
-- =========================================================

SELECT
    d.CODE_ID,
    d.CODE,
    d.CODE_NM,
    d.CODE_DC,
    d.USE_AT,
    m.MENU_URL,
    m.MENU_ICON,
    o.SORT_ORDR
FROM COMTCCMMNDETAILCODE d
LEFT JOIN COMTNMENUINFO m
    ON m.MENU_CODE = d.CODE
LEFT JOIN COMTNMENUORDER o
    ON o.MENU_CODE = d.CODE
WHERE d.CODE_ID = 'AMENU1'
  AND (d.CODE_NM = '풀스택 관리' OR m.MENU_URL = '/admin/system/full-stack-management')
ORDER BY d.CODE;

SELECT
    MENU_CODE,
    FEATURE_CODE,
    FEATURE_NM,
    FEATURE_NM_EN,
    USE_AT
FROM COMTNMENUFUNCTIONINFO
WHERE FEATURE_CODE = 'A0060108_VIEW';

SELECT
    AUTHOR_CODE,
    FEATURE_CODE,
    GRANT_AUTHORITY_YN
FROM COMTNAUTHORFUNCTIONRELATE
WHERE FEATURE_CODE = 'A0060108_VIEW'
ORDER BY AUTHOR_CODE;
