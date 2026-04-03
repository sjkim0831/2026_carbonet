-- Banner management meta rollback
-- Scope:
-- - remove the bundled baseline metadata rows
-- - optionally drop the sidecar table if the feature must be removed completely

DELETE FROM COMTNBANNERMETA
WHERE BANNER_ID IN ('BNR-240301', 'BNR-240288', 'BNR-240271', 'BNR-240199');

-- Verification query
SELECT
    BANNER_ID,
    STATUS_CODE,
    TO_CHAR(START_AT, 'YYYY-MM-DD HH24:MI') AS START_AT,
    TO_CHAR(END_AT, 'YYYY-MM-DD HH24:MI') AS END_AT
FROM COMTNBANNERMETA
ORDER BY BANNER_ID;

-- Optional full rollback
-- Run only when banner meta persistence must be removed completely.
-- ALTER TABLE COMTNBANNERMETA DROP CONSTRAINT FK_COMTNBANNERMETA_01;
-- DROP TABLE COMTNBANNERMETA;
