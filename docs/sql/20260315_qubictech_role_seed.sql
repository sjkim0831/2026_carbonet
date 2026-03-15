-- CUBRID-safe authority seed for QubicTech company roles
--
-- Purpose
-- - normalize baseline admin role-feature mappings
-- - create QubicTech company-scoped department roles
-- - attach page/feature permissions using currently registered menu metadata
--
-- Notes
-- - target company is resolved from COMTNENTRPRSMBER.CMPNY_NM like '%큐빅테크%'
-- - company-scoped role codes follow ROLE_DEPT_I{INSTT_LAST8}_{ROLE_TYPE}
-- - INSTT_TOKEN matches AdminMainController.normalizeInsttScopeToken: uppercase instt_id with non-alnum removed

-- =========================================================
-- 1) Pre-check
-- =========================================================

SELECT
    TRIM(INSTT_ID) AS instt_id,
    REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS instt_token,
    MAX(CMPNY_NM) AS cmpny_nm,
    COUNT(*) AS member_count
FROM COMTNENTRPRSMBER
WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
  AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
GROUP BY TRIM(INSTT_ID)
ORDER BY TRIM(INSTT_ID);

SELECT AUTHOR_CODE, AUTHOR_NM
FROM COMTNAUTHORINFO
WHERE AUTHOR_CODE IN (
    'ROLE_ADMIN',
    'ROLE_OPERATION_ADMIN',
    'ROLE_SYSTEM_ADMIN',
    'ROLE_COMPANY_ADMIN'
)
ORDER BY AUTHOR_CODE;

-- =========================================================
-- 2) Insert baseline admin roles if missing
-- =========================================================

INSERT INTO COMTNAUTHORINFO (
    AUTHOR_CODE,
    AUTHOR_NM,
    AUTHOR_DC,
    AUTHOR_CREAT_DE
)
SELECT
    seed.AUTHOR_CODE,
    seed.AUTHOR_NM,
    seed.AUTHOR_DC,
    TO_CHAR(CURRENT_DATE, 'MM/DD/YYYY')
FROM (
    SELECT 'ROLE_ADMIN' AS AUTHOR_CODE, '일반 관리자' AS AUTHOR_NM, '회원/회원사 운영 및 승인 화면 기준 관리자 롤' AS AUTHOR_DC FROM db_root
    UNION ALL
    SELECT 'ROLE_OPERATION_ADMIN', '운영 관리자', '회사 범위 권한 그룹/부서 권한/회원 운영을 담당하는 관리자 롤' FROM db_root
    UNION ALL
    SELECT 'ROLE_SYSTEM_ADMIN', '시스템 관리자', '시스템 설정, 권한, 자동화 승인까지 담당하는 관리자 롤' FROM db_root
    UNION ALL
    SELECT 'ROLE_COMPANY_ADMIN', '회원사 관리자', '단일 회원사 범위 권한 운영 기준 롤' FROM db_root
) seed
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTNAUTHORINFO a
    WHERE a.AUTHOR_CODE = seed.AUTHOR_CODE
);

-- =========================================================
-- 3) Insert QubicTech department roles if missing
-- =========================================================

INSERT INTO COMTNAUTHORINFO (
    AUTHOR_CODE,
    AUTHOR_NM,
    AUTHOR_DC,
    AUTHOR_CREAT_DE
)
SELECT
    seed.AUTHOR_CODE,
    seed.AUTHOR_NM,
    seed.AUTHOR_DC,
    TO_CHAR(CURRENT_DATE, 'MM/DD/YYYY')
FROM (
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_ESG' AS AUTHOR_CODE,
           '큐빅테크 탄소/ESG 부서' AS AUTHOR_NM,
           '큐빅테크 탄소배출/ESG 데이터 관리, 회원 정보 조회, 결과 검토 권한' AS AUTHOR_DC
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_PROD',
           '큐빅테크 생산 부서',
           '큐빅테크 생산/공정 담당자의 배출 결과 조회와 회원사 정보 열람 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_PROC',
           '큐빅테크 구매 부서',
           '큐빅테크 구매/SCM 담당자의 회원사/기관 조회 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_QUAL',
           '큐빅테크 품질/인증 부서',
           '큐빅테크 품질/인증 담당자의 가입 승인 검토와 심사 화면 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_SALE',
           '큐빅테크 영업 부서',
           '큐빅테크 고객사/기관 조회와 담당 정보 확인 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_CS',
           '큐빅테크 고객지원 부서',
           '큐빅테크 고객지원 담당자의 회원 상세/수정과 응대 화면 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    UNION ALL
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_MGMT',
           '큐빅테크 경영지원 부서',
           '큐빅테크 경영지원/재무/인사 담당자의 기관/회원 기준 정보 조회 및 수정 권한'
    FROM (
        SELECT REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '') AS INSTT_TOKEN,
               SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 8
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 7
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
) seed
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTNAUTHORINFO a
    WHERE a.AUTHOR_CODE = seed.AUTHOR_CODE
);

-- =========================================================
-- 4) Insert admin role-feature mappings if missing
-- =========================================================

INSERT INTO COMTNAUTHORFUNCTIONRELATE (
    AUTHOR_CODE,
    FEATURE_CODE,
    GRANT_AUTHORITY_YN,
    CREAT_DT
)
SELECT
    target.AUTHOR_CODE,
    target.FEATURE_CODE,
    'N',
    CURRENT_DATETIME
FROM (
    SELECT 'ROLE_ADMIN' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM COMTNMENUFUNCTIONINFO f
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/register',
        '/admin/member/approve',
        '/admin/member/company-approve',
        '/admin/member/company_list',
        '/admin/member/company_detail',
        '/admin/member/company_account',
        '/admin/member/admin_list',
        '/admin/system/help-management',
        '/admin/system/full-stack-management',
        '/admin/system/sr-workbench'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_CREATE'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
          OR f.FEATURE_CODE LIKE '%_APPROVE'
          OR f.FEATURE_CODE LIKE '%_REJECT'
          OR f.FEATURE_CODE LIKE '%_BATCH_APPROVE'
          OR f.FEATURE_CODE LIKE '%_BATCH_REJECT'
      )

    UNION ALL

    SELECT 'ROLE_OPERATION_ADMIN' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM COMTNMENUFUNCTIONINFO f
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/auth/group',
        '/admin/member/dept-role-mapping',
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/approve',
        '/admin/member/company-approve',
        '/admin/member/company_list',
        '/admin/member/company_detail',
        '/admin/member/company_account',
        '/admin/member/admin_list'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_CREATE'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
          OR f.FEATURE_CODE LIKE '%_APPROVE'
          OR f.FEATURE_CODE LIKE '%_REJECT'
          OR f.FEATURE_CODE LIKE '%_BATCH_APPROVE'
          OR f.FEATURE_CODE LIKE '%_BATCH_REJECT'
          OR f.FEATURE_CODE LIKE 'AUTH_GROUP_%'
          OR f.FEATURE_CODE LIKE 'DEPT_ROLE_MAPPING_%'
          OR f.FEATURE_CODE LIKE 'MEMBER_EDIT_PERMISSION_%'
      )

    UNION ALL

    SELECT 'ROLE_SYSTEM_ADMIN' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM COMTNMENUFUNCTIONINFO f
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/auth/group',
        '/admin/member/dept-role-mapping',
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/register',
        '/admin/member/approve',
        '/admin/member/company-approve',
        '/admin/member/company_list',
        '/admin/member/company_detail',
        '/admin/member/company_account',
        '/admin/member/admin_list',
        '/admin/member/admin_account',
        '/admin/member/admin_account/permissions',
        '/admin/system/menu-management',
        '/admin/system/page-management',
        '/admin/system/feature-management',
        '/admin/system/help-management',
        '/admin/system/full-stack-management',
        '/admin/system/sr-workbench'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_CREATE'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
          OR f.FEATURE_CODE LIKE '%_APPROVE'
          OR f.FEATURE_CODE LIKE '%_REJECT'
          OR f.FEATURE_CODE LIKE '%_BATCH_APPROVE'
          OR f.FEATURE_CODE LIKE '%_BATCH_REJECT'
          OR f.FEATURE_CODE LIKE '%_PREPARE'
          OR f.FEATURE_CODE LIKE '%_EXECUTE'
          OR f.FEATURE_CODE LIKE 'AUTH_GROUP_%'
          OR f.FEATURE_CODE LIKE 'DEPT_ROLE_MAPPING_%'
          OR f.FEATURE_CODE LIKE 'ADMIN_PERMISSION_%'
          OR f.FEATURE_CODE LIKE 'MEMBER_EDIT_PERMISSION_%'
          OR f.FEATURE_CODE LIKE 'PAGE_CODE_VIEW'
          OR f.FEATURE_CODE LIKE 'FEATURE_CODE%'
          OR f.FEATURE_CODE LIKE 'MENU_MANAGEMENT_%'
      )
) target
WHERE EXISTS (
    SELECT 1
    FROM COMTNAUTHORINFO a
    WHERE a.AUTHOR_CODE = target.AUTHOR_CODE
)
AND NOT EXISTS (
    SELECT 1
    FROM COMTNAUTHORFUNCTIONRELATE r
    WHERE r.AUTHOR_CODE = target.AUTHOR_CODE
      AND r.FEATURE_CODE = target.FEATURE_CODE
);

-- =========================================================
-- 5) Insert QubicTech department role-feature mappings if missing
-- =========================================================

INSERT INTO COMTNAUTHORFUNCTIONRELATE (
    AUTHOR_CODE,
    FEATURE_CODE,
    GRANT_AUTHORITY_YN,
    CREAT_DT
)
SELECT
    target.AUTHOR_CODE,
    target.FEATURE_CODE,
    'N',
    CURRENT_DATETIME
FROM (
    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_ESG' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/company_list',
        '/admin/member/company_detail'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
      )

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_PROD' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/company_detail',
        '/admin/emission/result_list'
    )
      AND f.FEATURE_CODE LIKE '%_VIEW'

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_PROC' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/company_list',
        '/admin/member/company_detail'
    )
      AND f.FEATURE_CODE LIKE '%_VIEW'

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_QUAL' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/approve',
        '/admin/member/company-approve',
        '/admin/member/company_detail'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_APPROVE'
          OR f.FEATURE_CODE LIKE '%_REJECT'
          OR f.FEATURE_CODE LIKE '%_BATCH_APPROVE'
          OR f.FEATURE_CODE LIKE '%_BATCH_REJECT'
      )

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_SALE' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/company_list',
        '/admin/member/company_detail',
        '/admin/member/company_account'
    )
      AND f.FEATURE_CODE LIKE '%_VIEW'

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_CS' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/company_detail'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
      )

    UNION ALL

    SELECT 'ROLE_DEPT_I' || company.SHORT_TOKEN || '_MGMT' AS AUTHOR_CODE, f.FEATURE_CODE
    FROM (
        SELECT SUBSTR(
                   REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', ''),
                   CASE
                       WHEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) > 5
                           THEN LENGTH(REPLACE(REPLACE(REPLACE(UPPER(TRIM(INSTT_ID)), '_', ''), '-', ''), ' ', '')) - 4
                       ELSE 1
                   END
               ) AS SHORT_TOKEN
        FROM COMTNENTRPRSMBER
        WHERE TRIM(COALESCE(INSTT_ID, '')) != ''
          AND UPPER(COALESCE(CMPNY_NM, '')) LIKE '%큐빅테크%'
        GROUP BY TRIM(INSTT_ID)
    ) company
    JOIN COMTNMENUFUNCTIONINFO f ON 1 = 1
    JOIN COMTNMENUINFO m ON m.MENU_CODE = f.MENU_CODE
    WHERE m.MENU_URL IN (
        '/admin/member/list',
        '/admin/member/detail',
        '/admin/member/edit',
        '/admin/member/company_list',
        '/admin/member/company_detail',
        '/admin/member/company_account'
    )
      AND (
          f.FEATURE_CODE LIKE '%_VIEW'
          OR f.FEATURE_CODE LIKE '%_UPDATE'
          OR f.FEATURE_CODE LIKE '%_SAVE'
          OR f.FEATURE_CODE LIKE '%_EDIT'
      )
) target
WHERE EXISTS (
    SELECT 1
    FROM COMTNAUTHORINFO a
    WHERE a.AUTHOR_CODE = target.AUTHOR_CODE
)
AND NOT EXISTS (
    SELECT 1
    FROM COMTNAUTHORFUNCTIONRELATE r
    WHERE r.AUTHOR_CODE = target.AUTHOR_CODE
      AND r.FEATURE_CODE = target.FEATURE_CODE
);

-- =========================================================
-- 6) Post-check
-- =========================================================

SELECT AUTHOR_CODE, AUTHOR_NM, AUTHOR_DC
FROM COMTNAUTHORINFO
WHERE AUTHOR_CODE IN (
    'ROLE_ADMIN',
    'ROLE_OPERATION_ADMIN',
    'ROLE_SYSTEM_ADMIN',
    'ROLE_COMPANY_ADMIN'
)
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_ESG'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_PROD'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_PROC'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_QUAL'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_SALE'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_CS'
   OR AUTHOR_CODE LIKE 'ROLE_DEPT_I%_MGMT'
ORDER BY AUTHOR_CODE;

SELECT
    r.AUTHOR_CODE,
    COUNT(*) AS feature_count
FROM COMTNAUTHORFUNCTIONRELATE r
WHERE r.AUTHOR_CODE IN (
    'ROLE_ADMIN',
    'ROLE_OPERATION_ADMIN',
    'ROLE_SYSTEM_ADMIN'
)
   OR r.AUTHOR_CODE LIKE 'ROLE_DEPT_I%'
GROUP BY r.AUTHOR_CODE
ORDER BY r.AUTHOR_CODE;
