CREATE TABLE emission_category (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    major_code VARCHAR(50) NOT NULL,
    major_name VARCHAR(100) NOT NULL,
    sub_code VARCHAR(50) NOT NULL,
    sub_name VARCHAR(100) NOT NULL,
    use_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

CREATE UNIQUE INDEX uk_emission_category_code
    ON emission_category (major_code, sub_code);

CREATE TABLE emission_variable_def (
    variable_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    tier INT NOT NULL,
    var_code VARCHAR(50) NOT NULL,
    var_name VARCHAR(200) NOT NULL,
    var_desc VARCHAR(1000),
    unit VARCHAR(50),
    input_type VARCHAR(30) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    is_repeatable CHAR(1) NOT NULL DEFAULT 'N',
    is_required CHAR(1) NOT NULL DEFAULT 'N',
    sort_order INT NOT NULL DEFAULT 0,
    display_name VARCHAR(200),
    display_code VARCHAR(50),
    ui_hint VARCHAR(1000),
    derived_yn CHAR(1) NOT NULL DEFAULT 'N',
    supplemental_yn CHAR(1) NOT NULL DEFAULT 'N',
    repeat_group_key VARCHAR(100),
    section_id VARCHAR(100),
    section_title VARCHAR(200),
    section_description VARCHAR(1000),
    section_formula VARCHAR(1000),
    use_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

CREATE UNIQUE INDEX uk_emission_variable
    ON emission_variable_def (category_id, tier, var_code);

CREATE TABLE emission_factor (
    factor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    tier INT NOT NULL,
    factor_code VARCHAR(50) NOT NULL,
    factor_name VARCHAR(200) NOT NULL,
    factor_value DOUBLE NOT NULL,
    unit VARCHAR(50),
    default_yn CHAR(1) NOT NULL DEFAULT 'N',
    remark VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

CREATE UNIQUE INDEX uk_emission_factor
    ON emission_factor (category_id, tier, factor_code);

CREATE TABLE emission_input_session (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    tier INT NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    calc_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

CREATE TABLE emission_input_value (
    input_value_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    var_code VARCHAR(50) NOT NULL,
    line_no INT NOT NULL DEFAULT 1,
    value_num DOUBLE,
    value_text VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

CREATE UNIQUE INDEX uk_emission_input_value
    ON emission_input_value (session_id, var_code, line_no);

CREATE TABLE emission_calc_result (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    co2_total DOUBLE NOT NULL,
    formula_summary VARCHAR(2000),
    factor_snapshot_json VARCHAR(4000),
    default_applied_yn CHAR(1) NOT NULL DEFAULT 'N',
    created_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME
);

INSERT INTO emission_category (category_id, major_code, major_name, sub_code, sub_name, use_yn)
VALUES
    (1, 'MINERAL', '광물산업', 'CEMENT', '시멘트 생산', 'Y'),
    (2, 'MINERAL', '광물산업', 'LIME', '석회 생산', 'Y');

INSERT INTO emission_variable_def (variable_id, category_id, tier, var_code, var_name, var_desc, unit, input_type, source_type, is_repeatable, is_required, sort_order, use_yn)
VALUES
    (1, 1, 1, 'MCI', '생산된 I유형 시멘트 i 질량', '생산된 I 유형 시멘트 i의 무게(질량). SUM(Mci×Ccli) 계산을 위해 행 추가 입력 가능', 'ton', 'NUMBER', 'USER', 'Y', 'Y', 10, 'Y'),
    (2, 1, 1, 'CCLI', 'I유형 시멘트 i의 클링커 비율', 'I 유형 시멘트 i의 클링커 비율. SUM(Mci×Ccli) 계산을 위해 MCI와 같은 lineNo로 입력', 'ratio', 'NUMBER', 'USER', 'Y', 'Y', 20, 'Y'),
    (3, 1, 1, 'IM', '클링커 수입량', '클링커 소비를 위한 수입량', 'ton', 'NUMBER', 'USER', 'N', 'N', 30, 'Y'),
    (4, 1, 1, 'EX', '클링커 수출량', '클링커 수출량', 'ton', 'NUMBER', 'USER', 'N', 'N', 40, 'Y'),
    (5, 1, 2, 'MCL', '생산된 클링커 질량', '생산된 클링커의 질량', 'ton', 'NUMBER', 'USER', 'N', 'Y', 10, 'Y'),
    (6, 1, 2, 'MD', '재활용되지 않은 CKD 질량', '킬른에 재활용되지 않은 CKD 질량', 'ton', 'NUMBER', 'USER', 'N', 'N', 20, 'Y'),
    (7, 1, 2, 'CD', 'CKD 원래 탄산염 비율', 'CKD에서 원래 탄산염의 비율', 'ratio', 'NUMBER', 'USER', 'N', 'N', 30, 'Y'),
    (8, 1, 2, 'FD', 'CKD 소성 비율', 'CKD에서 달성된 소성 비율', 'ratio', 'NUMBER', 'USER', 'N', 'N', 40, 'Y'),
    (9, 1, 3, 'CARBONATE_TYPE', '탄산염 종류', '표 2.1 기준 탄산염 종류. 예: CaCO3, MgCO3, CaMg(CO3)2, FeCO3, Ca(Fe,Mg,Mn)(CO3)2, MnCO3, Na2CO3', 'text', 'TEXT', 'USER', 'Y', 'Y', 10, 'Y'),
    (10, 1, 3, 'MI', '탄산염 i 질량', '킬른에서 소비된 탄산염 i의 질량', 'ton', 'NUMBER', 'USER', 'Y', 'Y', 20, 'Y'),
    (11, 1, 3, 'FI', '탄산염 i 소성 비율', '탄산염 i에 대해 달성된 소성 비율', 'ratio', 'NUMBER', 'USER', 'Y', 'Y', 30, 'Y'),
    (12, 1, 3, 'EFI', '탄산염 i 배출계수', '탄산염 i에 대한 배출계수. 입력하지 않으면 CARBONATE_TYPE을 표 2.1에 매핑', 'tCO2/ton', 'NUMBER', 'USER', 'Y', 'N', 40, 'Y'),
    (13, 1, 3, 'MD', '손실 CKD 질량', '킬른으로 재활용되지 않은 CKD 질량', 'ton', 'NUMBER', 'USER', 'N', 'Y', 50, 'Y'),
    (14, 1, 3, 'CD', '손실 CKD 원래 탄산염 비율', '킬른으로 재활용되지 않은 CKD 내 원래 탄산염 비율', 'ratio', 'NUMBER', 'USER', 'N', 'Y', 60, 'Y'),
    (15, 1, 3, 'FD', '손실 CKD 소성 비율', '킬른으로 재활용되지 않은 CKD에 대해 달성된 소성 비율', 'ratio', 'NUMBER', 'USER', 'N', 'Y', 70, 'Y'),
    (16, 1, 3, 'LKD_CARBONATE_TYPE', 'CKD 탄산염 종류', '표 2.1 기준 CKD 잔류 탄산염 종류. 미입력 시 기본 EFd 또는 DB 값 사용', 'text', 'TEXT', 'USER', 'N', 'N', 80, 'Y'),
    (17, 1, 3, 'RAW_MATERIAL_CARBONATE_TYPE', '원료 k 탄산염 종류', '표 2.1 기준 원료 k 탄산염 종류. EFK 미입력 시 선택값으로 배출계수를 유도', 'text', 'TEXT', 'USER', 'Y', 'N', 90, 'Y'),
    (18, 1, 3, 'MK', '비연료 원료 k 질량', '유기물 또는 기타 탄소를 포함하는 비연료 원료 k의 질량', 'ton', 'NUMBER', 'USER', 'Y', 'N', 100, 'Y'),
    (19, 1, 3, 'XK', '비연료 원료 k 탄소 비율', '원료 k의 총 유기물 또는 기타 탄소 비율', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 110, 'Y'),
    (35, 1, 3, 'EFK', '비연료 원료 k 배출계수', '원료 k의 배출계수. 미입력 시 원료 k 탄산염 종류를 표 2.1에 매핑하고, 열량 기여가 5% 미만이면 해당 항은 0으로 처리 가능', 'tCO2/ton', 'NUMBER', 'USER', 'Y', 'N', 120, 'Y'),
    (20, 2, 1, 'LIME_TYPE', '석회 유형', '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 미입력 시 85% 고칼슘 + 15% 고토석회 + 0% 수화석 기본값 적용', 'text', 'TEXT', 'USER', 'Y', 'N', 10, 'Y'),
    (21, 2, 1, 'MLI', '석회 생산량', 'i 유형의 석회 생산량', 'ton', 'NUMBER', 'USER', 'Y', 'Y', 20, 'Y'),
    (23, 2, 2, 'LIME_TYPE', '석회 유형', '고칼슘석회, 고토석회(선진국), 고토석회(개도국), 수경성석회 중 입력. 미입력 시 문서 기본 석회 배출계수 fallback을 적용하고, 고토석회는 기본 함유량 사용 시 선진국/개도국을 구분', 'text', 'TEXT', 'USER', 'Y', 'N', 10, 'Y'),
    (24, 2, 2, 'MLI', '석회 생산량', 'i 유형의 석회 생산량', 'ton', 'NUMBER', 'USER', 'Y', 'Y', 20, 'Y'),
    (25, 2, 2, 'CAO_CONTENT', 'CaO 함유량', '고칼슘석회 또는 수경성석회의 CaO 함유량. 0~1 비율 또는 0~100 퍼센트 입력 가능', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 30, 'Y'),
    (26, 2, 2, 'CAO_MGO_CONTENT', 'CaO·MgO 함유량', '고토석회의 CaO·MgO 함유량. 0~1 비율 또는 0~100 퍼센트 입력 가능', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 40, 'Y'),
    (34, 2, 2, 'MGO_CONTENT', 'MgO 함유량', '고토석회의 MgO 함유량. CaO·MgO 함유량을 별도로 모를 때 CaO 함유량과 합산해 사용할 수 있습니다. 0~1 비율 또는 0~100 퍼센트 입력 가능', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 45, 'Y'),
    (36, 2, 2, 'MD', 'LKD 질량', 'LKD의 무게 내지 질량. CF_lkd,i = 1 + (Md / Ml,i) × Cd × Fd 계산에 사용', 'ton', 'NUMBER', 'USER', 'Y', 'N', 50, 'Y'),
    (37, 2, 2, 'CD', 'LKD 원래 탄산염 비율', 'LKD 내 원래 탄산염의 무게 비율. CF_lkd,i 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 60, 'Y'),
    (38, 2, 2, 'FD', 'LKD 소성 비율', 'LKD에 대해 달성된 소성 비율. CF_lkd,i 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 70, 'Y'),
    (41, 2, 2, 'HYDRATED_LIME_PRODUCTION_YN', '수화석회 생산 여부', '수화석회 생산 여부. 생산하지 않으면 C_h,i = 1.00, 생산했는데 x,y 자료가 없으면 기본값 0.97 적용', 'YN', 'TEXT', 'USER', 'Y', 'N', 80, 'Y'),
    (39, 2, 2, 'X', '수화석회 비율', '수화석회의 비율 x. C_h,i = 1 - (x × y) 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 90, 'Y'),
    (40, 2, 2, 'Y', '석회 수분 함유량', '석회 내 수분 함유량 y. C_h,i = 1 - (x × y) 계산에 사용', 'ratio', 'NUMBER', 'USER', 'Y', 'N', 100, 'Y'),
    (27, 2, 3, 'CARBONATE_TYPE', '탄산염 종류', '표 2.1 기준 탄산염 종류. 예: CaCO3, MgCO3, CaMg(CO3)2, FeCO3, Ca(Fe,Mg,Mn)(CO3)2, MnCO3, Na2CO3', 'text', 'TEXT', 'USER', 'Y', 'Y', 10, 'Y'),
    (28, 2, 3, 'MI', '탄산염 i 질량', '소비된 탄산염 i의 질량', 'ton', 'NUMBER', 'USER', 'Y', 'Y', 20, 'Y'),
    (29, 2, 3, 'FI', '탄산염 i 소성 비율', '탄산염 i에 대해 달성된 소성 비율', 'ratio', 'NUMBER', 'USER', 'Y', 'Y', 30, 'Y'),
    (30, 2, 3, 'MD', 'LKD 질량', 'LKD의 질량', 'ton', 'NUMBER', 'USER', 'N', 'Y', 40, 'Y'),
    (31, 2, 3, 'CD', 'LKD 원래 탄산염 비율', 'LKD 내 원래 탄산염의 무게 비율', 'ratio', 'NUMBER', 'USER', 'N', 'Y', 50, 'Y'),
    (32, 2, 3, 'FD', 'LKD 소성 비율', 'LKD에 대해 달성된 소성 비율', 'ratio', 'NUMBER', 'USER', 'N', 'Y', 60, 'Y'),
    (33, 2, 3, 'LKD_CARBONATE_TYPE', 'LKD 탄산염 종류', '표 2.1 기준 LKD 잔류 탄산염 종류. 미입력 시 기본 EFd 또는 DB 값 사용', 'text', 'TEXT', 'USER', 'N', 'N', 70, 'Y');

INSERT INTO emission_factor (factor_id, category_id, tier, factor_code, factor_name, factor_value, unit, default_yn, remark)
VALUES
    (1, 1, 1, 'EFCLC', '시멘트 클링커 배출계수', 0.5200, 'tCO2/ton', 'Y', '문서 비고 기준 EFclc = 0.52'),
    (2, 1, 2, 'EFC', '탄산염 배출계수', 0.4397, 'tCO2/ton', 'Y', '문서 비고 기준 EFc = 0.4397'),
    (3, 1, 2, 'EFCL', '클링커 배출계수', 0.5100, 'tCO2/ton', 'Y', '문서 비고 기준 EFcl = 0.510'),
    (4, 1, 2, 'CFCKD', 'CKD 보정계수', 1.0200, 'ratio', 'Y', '자료가 없을 때 문서 기본값 1.020'),
    (5, 1, 3, 'EFD', '손실 CKD 배출계수', 0.4397, 'tCO2/ton', 'Y', '문서 비고 기준 EFd = 0.4397'),
    (6, 2, 1, 'EF_LIME', '석회 기본 배출계수', 0.7500, 'tCO2/t-lime', 'Y', '85% 고칼슘 + 15% 고토석회 + 0% 수화석'),
    (7, 2, 1, 'EF_LIME_HIGH_CALCIUM', '고칼슘석회 기본 배출계수', 0.7500, 'tCO2/t-lime', 'Y', '표 2.4 비고 기준'),
    (8, 2, 1, 'EF_LIME_DOLOMITIC_HIGH', '고토석회 기본 배출계수(선진국)', 0.8600, 'tCO2/t-lime', 'Y', '표 2.4 비고 기준 높은 값'),
    (9, 2, 1, 'EF_LIME_DOLOMITIC_LOW', '고토석회 기본 배출계수(개도국)', 0.7700, 'tCO2/t-lime', 'Y', '표 2.4 비고 기준 낮은 값'),
    (10, 2, 1, 'EF_LIME_HYDRAULIC', '수경성석회 기본 배출계수', 0.5900, 'tCO2/t-lime', 'Y', '표 2.4 비고 기준'),
    (11, 2, 2, 'SR_CAO', 'CO2와 CaO의 화학량 비율', 0.7850, 'tCO2/t-CaO', 'Y', '표 2.4 1열'),
    (12, 2, 2, 'SR_CAO_MGO', 'CO2와 CaO·MgO의 화학량 비율', 0.9130, 'tCO2/t-CaO·MgO', 'Y', '표 2.4 1열'),
    (13, 2, 2, 'HIGH_CALCIUM_CONTENT_DEFAULT', '고칼슘석회 기본 CaO 함유량', 0.9500, 'ratio', 'Y', '표 2.4 2열 default 값'),
    (14, 2, 2, 'DOLOMITIC_HIGH_CONTENT_DEFAULT', '고토석회 기본 CaO·MgO 함유량(선진국)', 0.9500, 'ratio', 'Y', '표 2.4 2열 default 값 높은 값'),
    (15, 2, 2, 'DOLOMITIC_LOW_CONTENT_DEFAULT', '고토석회 기본 CaO·MgO 함유량(개도국)', 0.8500, 'ratio', 'Y', '표 2.4 2열 default 값 낮은 값'),
    (16, 2, 2, 'HYDRAULIC_CONTENT_DEFAULT', '수경성석회 기본 CaO 함유량', 0.7500, 'ratio', 'Y', '표 2.4 2열 default 값'),
    (18, 2, 2, 'CF_LKD', '석회 LKD 보정계수 기본값', 1.0200, 'ratio', 'Y', '자료가 없을 때 CF_lkd,i 기본값 1.02'),
    (19, 2, 2, 'HYDRATED_LIME_CORRECTION_DEFAULT', '수화석회 보정 기본값', 0.9700, 'ratio', 'Y', 'x, y 자료가 없는 수화석회 생산 시 C_h,i 기본값 0.97'),
    (17, 2, 3, 'EFD', 'LKD 비소성 탄산염 배출계수', 0.43971, 'tCO2/ton', 'Y', '표 2.1 CaCO3 기준 기본값');
