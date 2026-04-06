-- Emission survey admin draft persistence
-- Scope: /admin/emission/survey-admin
-- Purpose:
-- 1. Persist workbook-based survey case drafts beyond localStorage/file draft
-- 2. Keep hierarchy: major -> section -> case -> row -> cell payload
-- 3. Preserve current runtime model used by CASE_3_1 and CASE_3_2

CREATE TABLE ADMIN_EMISSION_SURVEY_CASE (
    CASE_ID           VARCHAR(40)   NOT NULL,
    SECTION_CODE      VARCHAR(60)   NOT NULL,
    CASE_CODE         VARCHAR(30)   NOT NULL,
    MAJOR_CODE        VARCHAR(30)   NOT NULL,
    SECTION_LABEL     VARCHAR(200)  NOT NULL,
    SOURCE_FILE_NM    VARCHAR(300),
    SOURCE_PATH       VARCHAR(500),
    TARGET_PATH       VARCHAR(500),
    CASE_STATUS       VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    ROW_COUNT         INT           NOT NULL DEFAULT 0,
    ROW_SCHEMA_JSON   CLOB,
    GUIDANCE_JSON     CLOB,
    LAST_SAVED_BY     VARCHAR(60),
    LAST_SAVED_AT     DATETIME      NOT NULL DEFAULT CURRENT_DATETIME,
    FRST_REGIST_PNTTM DATETIME      NOT NULL DEFAULT CURRENT_DATETIME,
    FRST_REGISTER_ID  VARCHAR(60),
    LAST_UPDT_PNTTM   DATETIME      NOT NULL DEFAULT CURRENT_DATETIME,
    LAST_UPDUSR_ID    VARCHAR(60),
    PRIMARY KEY (CASE_ID)
);

CREATE UNIQUE INDEX IDX_ADMIN_EMISSION_SURVEY_CASE_01
    ON ADMIN_EMISSION_SURVEY_CASE (SECTION_CODE, CASE_CODE);

CREATE INDEX IDX_ADMIN_EMISSION_SURVEY_CASE_02
    ON ADMIN_EMISSION_SURVEY_CASE (MAJOR_CODE, SECTION_CODE, LAST_SAVED_AT);

CREATE TABLE ADMIN_EMISSION_SURVEY_CASE_ROW (
    CASE_ROW_ID        VARCHAR(40)   NOT NULL,
    CASE_ID            VARCHAR(40)   NOT NULL,
    ROW_ORDR           INT           NOT NULL,
    ROW_KEY            VARCHAR(120),
    ROW_VALUES_JSON    CLOB          NOT NULL,
    USE_AT             CHAR(1)       NOT NULL DEFAULT 'Y',
    FRST_REGIST_PNTTM  DATETIME      NOT NULL DEFAULT CURRENT_DATETIME,
    FRST_REGISTER_ID   VARCHAR(60),
    LAST_UPDT_PNTTM    DATETIME      NOT NULL DEFAULT CURRENT_DATETIME,
    LAST_UPDUSR_ID     VARCHAR(60),
    PRIMARY KEY (CASE_ROW_ID)
);

CREATE UNIQUE INDEX IDX_ADMIN_EMISSION_SURVEY_CASE_ROW_01
    ON ADMIN_EMISSION_SURVEY_CASE_ROW (CASE_ID, ROW_ORDR);

CREATE INDEX IDX_ADMIN_EMISSION_SURVEY_CASE_ROW_02
    ON ADMIN_EMISSION_SURVEY_CASE_ROW (CASE_ID, USE_AT);

-- Suggested code semantics
-- CASE_CODE:
--   CASE_3_1 : 엑셀 seed 기반 시작
--   CASE_3_2 : LCI DB 알고 있는 경우
--
-- CASE_STATUS:
--   DRAFT
--   SAVED
--   SUBMITTED
--   ARCHIVED
--
-- ROW_SCHEMA_JSON payload example:
-- [
--   {"key":"구분","label":"구분"},
--   {"key":"물질명","label":"물질명"},
--   {"key":"양","label":"양"}
-- ]
--
-- ROW_VALUES_JSON payload example:
-- {
--   "구분":"원료 물질",
--   "물질명":"석회암",
--   "양":"1000",
--   "단위_연간":"kg/yr"
-- }
