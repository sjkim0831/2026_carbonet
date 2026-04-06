# Emission Survey Admin Workbook Analysis

이 문서는 관리자 메뉴 `/admin/emission/survey-admin` 구현 시 기준으로 사용한 엑셀 원본 분석 결과를 정리한다.

## Canonical Source

- 원본 파일명: `데이터 수집 설문지 excel 양식_steel, electric, low-alloy.xlsx`
- 현재 작업 기준 복사본: `/opt/projects/carbonet/데이터 수집 설문지 excel 양식_steel, electric, low-alloy.xlsx`
- 사용자가 요청한 최종 참조 위치: `/opt/reference/수식 설계 요/데이터 수집 설문지 excel 양식_steel, electric, low-alloy.xlsx`
- 권한 이슈로 `/opt/reference/수식 설계 요` 복사는 아직 미완료

## Workbook Sheet Inventory

엑셀 워크북에는 다음 시트가 있다.

1. `기술 DB`
2. `표지`
3. `데이터 수집 범위`
4. `투입물 데이터 수집`
5. `산출물 데이터 수집`
6. `참고자료`

현재 관리자 화면은 이 중 `투입물 데이터 수집`, `산출물 데이터 수집` 두 시트만 직접 사용한다.

## Parsing Rule

현재 구현은 각 시트의 우측 예시 입력 영역을 seed 데이터로 사용한다.

- `투입물 데이터 수집`: 대략 `BT ~ CG` 열
- `산출물 데이터 수집`: 대략 `BQ ~ CC` 열

좌측은 원래 양식 설명, 우측은 예시 입력으로 간주한다.

## Hierarchy Used In UI

현재 화면에서 사용하는 계층은 다음과 같다.

- 대분류
  - `3. 투입물 데이터 수집`
  - `4. 산출물 데이터 수집`
- 중분류
  - 시트 안의 데이터 섹션
- 소분류
  - `3-1 시작`
  - `3-2 LCI DB를 알고 있는 경우`

즉, 현재 소분류는 엑셀 자체의 세 번째 구조가 아니라 사용자 요구사항의 두 Case를 의미하도록 모델링했다.

## Input Sheet Sections

`투입물 데이터 수집` 시트는 다음 섹션으로 나뉜다.

1. `원료 물질 및 보조 물질`
2. `에너지`
3. `에너지 스팀`
4. `기타`

### Input Raw Materials Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 용도
- 원산지
- 수송방법
- 물동량
- 운송경로
- 비고

예시 seed 값에는 `석회암`, `용수`, `다이너마이트`, `암포화확` 등이 포함된다.

### Input Energy Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 용도
- 비고

예시 seed 값에는 `전력`, `경유`가 포함된다.

### Input Steam Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 용도
- 스팀종류
- 스팀의 질량
- 응축수 질량
- 응축수 온도
- 스팀순환여부
- 외부스팀 여부

예시 seed 값에는 `스팀`이 포함된다.

### Input Misc Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 용도
- 비고

예시 seed 값에는 `윤활유`, `컨베이어 벨트`가 포함된다.

## Output Sheet Sections

`산출물 데이터 수집` 시트는 다음 섹션으로 나뉜다.

1. `제품 및 부산물`
2. `대기 배출물`
3. `수계 배출물`
4. `폐기물`

### Output Products Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 생산원가
- 비고

예시 seed 값에는 `재활용 플라스틱 펠렛`, `부산물1`이 포함된다.

### Output Air Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 데이터 수집 방법
- 배출계수
- 단위
- 비고

예시 seed 값에는 `NOx`가 포함된다.

### Output Water Columns

- 구분
- 물질명
- 양
- 단위(연간)
- 처리경로
- 배출계수
- 단위
- 처리방법
- 비고

예시 seed 값에는 `폐수`, `T-N`, `T-P`가 포함된다.

### Output Waste Columns

- 구분
- 물질명
- 양
- 단위
- 일반/지정 폐기물 구분
- 배출계수
- 단위
- 처리방법
- 수송 물동량
- 수송방법
- 운송경로
- 비고

예시 seed 값에는 `암석류`가 포함된다.

## Case Behavior

### Case `3-1 시작`

- 엑셀 seed 데이터를 기본 행으로 출력
- 이후 행 추가, 수정, 삭제 가능
- 현재는 브라우저 로컬 draft와 서버 draft 둘 다 저장 가능

### Case `3-2 LCI DB를 알고 있는 경우`

- `3-1`과 동일한 데이터 섹션 구조 유지
- 초기값은 빈 행 또는 빈 draft
- 사용자가 직접 행 추가 후 저장 가능

## Implemented Runtime Scope

현재 구현 범위는 다음과 같다.

- 관리자 메뉴 bootstrap
- React route 등록
- 엑셀 업로드 후 서버 파싱
- 탭 `3`, `4` 기반 섹션/컬럼/seed 행 구성
- `3-1`, `3-2` 2개 Case 동시 편집
- localStorage 저장
- 서버 draft 저장 API

## Draft Storage

현재 서버 draft 저장 위치:

- `data/admin/emission-survey-admin/case-drafts.json`

파일은 실제 관리자 세션에서 저장 버튼이 호출되면 생성된다.

저장 키 구조:

- `{sectionCode}:{caseCode}`

예:

- `INPUT_RAW_MATERIALS:CASE_3_1`
- `OUTPUT_WASTE:CASE_3_2`

## Known Gaps

현재 미완료 또는 후속 결정이 필요한 항목은 다음과 같다.

1. `/opt/reference/수식 설계 요`로의 원본 복사 권한 확보
2. 관리자 로그인 세션 기준 실제 저장 호출 검증
3. DB 영속화 여부 결정
4. `대분류/중분류/소분류`를 실제 업무 코드 테이블로 분리할지 여부 결정
5. `기술 DB`, `데이터 수집 범위`, `참고자료` 탭을 같은 메뉴 안에서 연결할지 여부 결정

## Recommended Next Step

다음 구현 단계는 아래 순서가 적절하다.

1. 관리자 세션으로 `3-1`, `3-2` 저장 호출 검증
2. `case-drafts.json` 실제 생성 확인
3. 저장 구조를 DB 테이블로 승격할지 결정
4. `기술 DB`, `데이터 수집 범위`, `참고자료` 탭까지 묶는 상위 워크스페이스 확장
