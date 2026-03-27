-- IP whitelist persistence rollback
-- Scope:
-- - remove the bundled seed rows
-- - optionally drop the persistence tables if the feature must be fully rolled back
--
-- Recommended order:
-- 1. Run the seed delete section.
-- 2. Verify no operator-created rows remain.
-- 3. Only then run the optional destructive DROP section.

-- Seed cleanup
DELETE FROM COMTNIPWHITELISTRULE
WHERE RULE_ID IN ('WL-001', 'WL-002', 'WL-003', 'WL-004');

DELETE FROM COMTNIPWHITELISTREQUEST
WHERE REQUEST_ID IN ('REQ-240312-01', 'REQ-240311-07', 'REQ-240307-02');

-- Verification queries
SELECT RULE_ID, STATUS, UPDATED_AT
FROM COMTNIPWHITELISTRULE
ORDER BY UPDATED_AT DESC;

SELECT REQUEST_ID, APPROVAL_STATUS, REQUESTED_AT
FROM COMTNIPWHITELISTREQUEST
ORDER BY REQUESTED_AT DESC;

-- Optional full rollback
-- Run only when the feature must be removed completely and no retained data is needed.
-- ALTER TABLE COMTNIPWHITELISTRULE DROP CONSTRAINT FK_COMTNIPWHITELISTRULE_REQ;
-- DROP INDEX IDX_COMTNIPWHITELISTREQUEST_SCOPE_STATUS;
-- DROP INDEX IDX_COMTNIPWHITELISTRULE_SCOPE_STATUS;
-- DROP TABLE COMTNIPWHITELISTREQUEST;
-- DROP TABLE COMTNIPWHITELISTRULE;
