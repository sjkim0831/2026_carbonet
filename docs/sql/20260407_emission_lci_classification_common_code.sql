-- LCI DB classification hierarchy aligned to the spreadsheet "분류 정의.xlsx".
-- Storage target: common code group EMLCI under class code EMM.
-- Hierarchy rule:
--   2 digits   = major classification
--   4 digits   = middle classification
--   6 digits   = small classification

INSERT INTO COMTCCMMNCLCODE (
    CL_CODE,
    CL_CODE_NM,
    CL_CODE_DC,
    USE_AT,
    FRST_REGIST_PNTTM,
    FRST_REGISTER_ID
)
SELECT
    'EMM',
    '배출 관리',
    '배출 관리 공통코드 분류',
    'Y',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNCLCODE
    WHERE CL_CODE = 'EMM'
);

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
    'EMLCI',
    'LCI DB 분류 체계',
    'LCI DB 대분류/중분류/소분류 공통코드',
    'Y',
    'EMM',
    CURRENT_DATETIME,
    'carbonet'
FROM db_root
WHERE NOT EXISTS (
    SELECT 1
    FROM COMTCCMMNCODE
    WHERE CODE_ID = 'EMLCI'
);

INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '01', '광물산업', '{"level":"MAJOR","majorCode":"01","majorName":"광물산업","middleCode":"","middleName":"","smallCode":"","smallName":"","tierLabel":"","aliases":[]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '01');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0101', '시멘트', '{"level":"MIDDLE","majorCode":"01","majorName":"광물산업","middleCode":"0101","middleName":"시멘트","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["CEMENT"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0101');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0102', '석회', '{"level":"MIDDLE","majorCode":"01","majorName":"광물산업","middleCode":"0102","middleName":"석회","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["LIME"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0102');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0103', '유리', '{"level":"MIDDLE","majorCode":"01","majorName":"광물산업","middleCode":"0103","middleName":"유리","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["GLASS"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0103');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0104', '탄산염의 기타 공정', '{"level":"MIDDLE","majorCode":"01","majorName":"광물산업","middleCode":"0104","middleName":"탄산염의 기타 공정","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["OTHER_CARBONATE"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0104');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '02', '화학산업', '{"level":"MAJOR","majorCode":"02","majorName":"화학산업","middleCode":"","middleName":"","smallCode":"","smallName":"","tierLabel":"","aliases":[]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '02');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0201', '암모니아', '{"level":"MIDDLE","majorCode":"02","majorName":"화학산업","middleCode":"0201","middleName":"암모니아","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["AMMONIA"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0201');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0202', '카바이드', '{"level":"MIDDLE","majorCode":"02","majorName":"화학산업","middleCode":"0202","middleName":"카바이드","smallCode":"","smallName":"","tierLabel":"Tier 1","aliases":["CARBIDE"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0202');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0203', '이산화티타늄(티탄슬래그, 합성 금홍석, TiO2)', '{"level":"MIDDLE","majorCode":"02","majorName":"화학산업","middleCode":"0203","middleName":"이산화티타늄(티탄슬래그, 합성 금홍석, TiO2)","smallCode":"","smallName":"","tierLabel":"Tier 1-2","aliases":["TITANIUM_DIOXIDE"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0203');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0204', '소다회', '{"level":"MIDDLE","majorCode":"02","majorName":"화학산업","middleCode":"0204","middleName":"소다회","smallCode":"","smallName":"","tierLabel":"Tier 1","aliases":["SODA_ASH"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0204');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '020401', '천연소다회', '{"level":"SMALL","majorCode":"02","majorName":"화학산업","middleCode":"0204","middleName":"소다회","smallCode":"020401","smallName":"천연소다회","tierLabel":"Tier 1","aliases":["NATURAL_SODA_ASH"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '020401');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '020402', '솔베이법 소다회', '{"level":"SMALL","majorCode":"02","majorName":"화학산업","middleCode":"0204","middleName":"소다회","smallCode":"020402","smallName":"솔베이법 소다회","tierLabel":"","aliases":["SOLVAY_SODA_ASH"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '020402');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0205', '석유화학제품 및 카본블랙 생산', '{"level":"MIDDLE","majorCode":"02","majorName":"화학산업","middleCode":"0205","middleName":"석유화학제품 및 카본블랙 생산","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["PETROCHEMICAL_AND_CARBON_BLACK"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0205');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '03', '금속산업', '{"level":"MAJOR","majorCode":"03","majorName":"금속산업","middleCode":"","middleName":"","smallCode":"","smallName":"","tierLabel":"","aliases":[]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '03');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0301', '야금 코크스', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0301","middleName":"야금 코크스","smallCode":"","smallName":"","tierLabel":"Tier 1 / Tier 2","aliases":["METALLURGICAL_COKE"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0301');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030101', '코크스', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0301","middleName":"야금 코크스","smallCode":"030101","smallName":"코크스","tierLabel":"Tier 1","aliases":["COKE"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030101');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030102', '현지 코크스 생산', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0301","middleName":"야금 코크스","smallCode":"030102","smallName":"현지 코크스 생산","tierLabel":"Tier 2","aliases":["ONSITE_COKE_PRODUCTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030102');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030103', '외부 코크스 생산', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0301","middleName":"야금 코크스","smallCode":"030103","smallName":"외부 코크스 생산","tierLabel":"Tier 2","aliases":["OFFSITE_COKE_PRODUCTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030103');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0302', '철, 강', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0302","middleName":"철, 강","smallCode":"","smallName":"","tierLabel":"Tier 1, 2","aliases":["IRON_AND_STEEL"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0302');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0303', '선철가 강으로 제조 되지 않은', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0303","middleName":"선철가 강으로 제조 되지 않은","smallCode":"","smallName":"","tierLabel":"Tier 1","aliases":["PIG_IRON_NOT_CONVERTED_TO_STEEL"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0303');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0304', '직접 환원 철', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0304","middleName":"직접 환원 철","smallCode":"","smallName":"","tierLabel":"Tier 1, 2","aliases":["DIRECT_REDUCED_IRON"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0304');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0305', '소결물', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0305","middleName":"소결물","smallCode":"","smallName":"","tierLabel":"Tier 1, 2","aliases":["SINTER"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0305');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0306', '펠렛', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0306","middleName":"펠렛","smallCode":"","smallName":"","tierLabel":"Tier 1","aliases":["PELLETS"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0306');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0307', '합금철', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0307","middleName":"합금철","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["FERROALLOYS"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0307');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0308', '알루미늄', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"","smallName":"","tierLabel":"Tier 1 / Tier 2, 3","aliases":["ALUMINUM"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0308');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030801', '양극 또는 페이스트 소비', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"030801","smallName":"양극 또는 페이스트 소비","tierLabel":"Tier 1","aliases":["ANODE_OR_PASTE_CONSUMPTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030801');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030802', 'Prebaked 양극 소비', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"030802","smallName":"Prebaked 양극 소비","tierLabel":"Tier 2, 3","aliases":["PREBAKED_ANODE_CONSUMPTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030802');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030803', '피치 휘발성 물질 연소', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"030803","smallName":"피치 휘발성 물질 연소","tierLabel":"Tier 2, 3","aliases":["PITCH_VOLATILE_COMBUSTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030803');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030804', 'bake 포장재', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"030804","smallName":"bake 포장재","tierLabel":"Tier 2, 3","aliases":["BAKE_PACKAGING"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030804');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030805', '페이스트 소비', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0308","middleName":"알루미늄","smallCode":"030805","smallName":"페이스트 소비","tierLabel":"Tier 2, 3","aliases":["PASTE_CONSUMPTION"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030805');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0309', '마그네슘', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0309","middleName":"마그네슘","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["MAGNESIUM"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0309');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '030901', '1차 마그네슘', '{"level":"SMALL","majorCode":"03","majorName":"금속산업","middleCode":"0309","middleName":"마그네슘","smallCode":"030901","smallName":"1차 마그네슘","tierLabel":"Tier 1-3","aliases":["PRIMARY_MAGNESIUM"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '030901');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0310', '납', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0310","middleName":"납","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["LEAD"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0310');
INSERT INTO COMTCCMMNDETAILCODE (CODE_ID, CODE, CODE_NM, CODE_DC, USE_AT, FRST_REGIST_PNTTM, FRST_REGISTER_ID)
SELECT 'EMLCI', '0311', '아연', '{"level":"MIDDLE","majorCode":"03","majorName":"금속산업","middleCode":"0311","middleName":"아연","smallCode":"","smallName":"","tierLabel":"Tier 1-3","aliases":["ZINC"]}', 'Y', CURRENT_DATETIME, 'carbonet'
FROM db_root
WHERE NOT EXISTS (SELECT 1 FROM COMTCCMMNDETAILCODE WHERE CODE_ID = 'EMLCI' AND CODE = '0311');
