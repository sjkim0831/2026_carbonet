-- Banner management meta migration
-- Apply order:
-- 1. Run `20260331_banner_management_meta.sql` once if the table does not exist yet.
-- 2. Run this migration to refresh the bundled baseline rows safely.
--
-- Notes:
-- - This migration is re-runnable for the bundled banner IDs.
-- - It refreshes the admin React migration metadata only.

DELETE FROM COMTNBANNERMETA
WHERE BANNER_ID IN ('BNR-240301', 'BNR-240288', 'BNR-240271', 'BNR-240199');

INSERT INTO COMTNBANNERMETA (
    BANNER_ID,
    BANNER_NM_EN,
    PLACEMENT_KO,
    PLACEMENT_EN,
    STATUS_CODE,
    START_AT,
    END_AT,
    CLICK_COUNT,
    NOTE_EN,
    FRST_REGISTER_ID,
    FRST_REGIST_PNTTM,
    LAST_UPDUSR_ID,
    LAST_UPDT_PNTTM
) VALUES (
    'BNR-240301',
    '2026 Emission Trading Notice',
    '메인 상단',
    'Main Hero',
    'LIVE',
    TO_DATETIME('2026-03-25 09:00', 'YYYY-MM-DD HH24:MI'),
    TO_DATETIME('2026-04-30 18:00', 'YYYY-MM-DD HH24:MI'),
    1248,
    'Pinned as the quarterly campaign banner on the main page.',
    'seed',
    CURRENT_DATETIME,
    'seed',
    CURRENT_DATETIME
);

INSERT INTO COMTNBANNERMETA (
    BANNER_ID,
    BANNER_NM_EN,
    PLACEMENT_KO,
    PLACEMENT_EN,
    STATUS_CODE,
    START_AT,
    END_AT,
    CLICK_COUNT,
    NOTE_EN,
    FRST_REGISTER_ID,
    FRST_REGIST_PNTTM,
    LAST_UPDUSR_ID,
    LAST_UPDT_PNTTM
) VALUES (
    'BNR-240288',
    'Submission Deadline Alert',
    '마이페이지',
    'My Page',
    'SCHEDULED',
    TO_DATETIME('2026-04-01 00:00', 'YYYY-MM-DD HH24:MI'),
    TO_DATETIME('2026-04-10 23:59', 'YYYY-MM-DD HH24:MI'),
    0,
    'Scheduled reminder banner for the early April submission window.',
    'seed',
    CURRENT_DATETIME,
    'seed',
    CURRENT_DATETIME
);

INSERT INTO COMTNBANNERMETA (
    BANNER_ID,
    BANNER_NM_EN,
    PLACEMENT_KO,
    PLACEMENT_EN,
    STATUS_CODE,
    START_AT,
    END_AT,
    CLICK_COUNT,
    NOTE_EN,
    FRST_REGISTER_ID,
    FRST_REGIST_PNTTM,
    LAST_UPDUSR_ID,
    LAST_UPDT_PNTTM
) VALUES (
    'BNR-240271',
    'External Integration Maintenance',
    '공지형 사이드',
    'Side Notice',
    'PAUSED',
    TO_DATETIME('2026-03-20 09:00', 'YYYY-MM-DD HH24:MI'),
    TO_DATETIME('2026-04-05 18:00', 'YYYY-MM-DD HH24:MI'),
    226,
    'Paused while the maintenance window is being rescheduled.',
    'seed',
    CURRENT_DATETIME,
    'seed',
    CURRENT_DATETIME
);

INSERT INTO COMTNBANNERMETA (
    BANNER_ID,
    BANNER_NM_EN,
    PLACEMENT_KO,
    PLACEMENT_EN,
    STATUS_CODE,
    START_AT,
    END_AT,
    CLICK_COUNT,
    NOTE_EN,
    FRST_REGISTER_ID,
    FRST_REGIST_PNTTM,
    LAST_UPDUSR_ID,
    LAST_UPDT_PNTTM
) VALUES (
    'BNR-240199',
    'Past Event Archive',
    '이벤트 배너',
    'Event Banner',
    'ENDED',
    TO_DATETIME('2026-02-01 09:00', 'YYYY-MM-DD HH24:MI'),
    TO_DATETIME('2026-03-01 18:00', 'YYYY-MM-DD HH24:MI'),
    870,
    'Completed and archived after the campaign review.',
    'seed',
    CURRENT_DATETIME,
    'seed',
    CURRENT_DATETIME
);
