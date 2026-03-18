-- Admin summary snapshot storage
--
-- Purpose:
-- - persist request-time / dashboard summary cards behind a shared service boundary
-- - allow later batch or write-time incremental refresh without changing controller contracts

CREATE TABLE COMTNADMINSUMMARYSNAPSHOT (
    SNAPSHOT_KEY VARCHAR(100) NOT NULL,
    SNAPSHOT_JSON CLOB,
    SNAPSHOT_TYPE VARCHAR(40) DEFAULT 'CARD_LIST',
    SOURCE_UPDATED_AT DATETIME,
    LAST_COMPUTED_AT DATETIME DEFAULT CURRENT_DATETIME,
    USE_AT CHAR(1) DEFAULT 'Y',
    PRIMARY KEY (SNAPSHOT_KEY)
);

-- Optional seed examples
-- INSERT INTO COMTNADMINSUMMARYSNAPSHOT (
--     SNAPSHOT_KEY, SNAPSHOT_JSON, SNAPSHOT_TYPE, SOURCE_UPDATED_AT, LAST_COMPUTED_AT, USE_AT
-- ) VALUES (
--     'IP_WHITELIST_SUMMARY_KO',
--     '[{"title":"활성 규칙","value":"12","description":"현재 게이트웨이에 반영 중인 CIDR/단일 IP 정책"}]',
--     'CARD_LIST',
--     CURRENT_DATETIME,
--     CURRENT_DATETIME,
--     'Y'
-- );
