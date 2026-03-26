# 탄소배출 배출량산정 및 배출량 관리 화면 설계

## 1. 설계 목적

이 문서는 Carbonet 관리자 기준으로 다음 두 업무 화면을 설계한다.

- `배출량 산정`
  - 배출지별 활동자료와 산정 로직을 이용해 대략적인 배출량을 계산
- `배출량 관리`
  - 배출지 목록 등록
  - 활동자료 입력
  - 산정 실행
  - 검증 로직 수행
  - 보고서 제출

본 설계는 현재 저장소의 관리자 화면 규칙을 따른다.

- 목록 화면은 메뉴에 노출
- 상세/편집/검증/제출 화면은 hidden screen으로 연결
- 좌측 active 메뉴는 항상 대표 목록 메뉴에 고정
- 화면 타입은 `LIST`, `DETAIL`, `EDIT`, `APPROVE`, `WORKSPACE` 조합으로 관리

## 2. 메뉴와 화면군 제안

### 2.1 메뉴 구조

- `산정·인증`
  - `배출량 산정`
  - `배출량 관리`
  - `산정 결과 목록`

### 2.2 화면군 정의

#### A. 배출량 산정 화면군

- `screen_family`: `emission-calculation`
- 대표 메뉴: `배출량 산정`
- 목적:
  - 배출지 유형별 산정 조건 입력
  - 산정식 미리보기
  - 배출량 시뮬레이션

실행 화면:

- `emission_calculation_workspace`
  - URL: `/admin/emission/calculation`
  - type: `WORKSPACE`
  - visible_in_menu: `Y`
- `emission_calculation_result`
  - URL: `/admin/emission/calculation/result`
  - type: `DETAIL`
  - visible_in_menu: `N`
  - active_menu_id: `emission_calculation_workspace`

#### B. 배출량 관리 화면군

- `screen_family`: `emission-management`
- 대표 메뉴: `배출량 관리`
- 목적:
  - 배출지 등록
  - 활동자료 입력
  - 산정 실행
  - 검증
  - 보고 제출

실행 화면:

- `emission_management_list`
  - URL: `/admin/emission/manage`
  - type: `LIST`
  - visible_in_menu: `Y`
- `emission_management_detail`
  - URL: `/admin/emission/manage/detail`
  - type: `DETAIL`
  - visible_in_menu: `N`
  - active_menu_id: `emission_management_list`
- `emission_management_edit`
  - URL: `/admin/emission/manage/edit`
  - type: `EDIT`
  - visible_in_menu: `N`
  - active_menu_id: `emission_management_list`
- `emission_management_verify`
  - URL: `/admin/emission/manage/verify`
  - type: `APPROVE`
  - visible_in_menu: `N`
  - active_menu_id: `emission_management_list`
- `emission_management_report`
  - URL: `/admin/emission/manage/report`
  - type: `APPROVE`
  - visible_in_menu: `N`
  - active_menu_id: `emission_management_list`

## 3. 사용자와 역할

- `배출 담당자`
  - 배출지 등록
  - 활동자료 입력
  - 산정 실행
  - 보고서 초안 생성
- `검증 담당자`
  - 산정값 검토
  - 증빙 누락 확인
  - 검증 승인/반려
- `관리자`
  - 배출계수 관리
  - 검증 규칙 관리
  - 제출 현황 모니터링

## 4. 업무 상태 모델

배출량 관리 건의 상태는 다음처럼 단순화해 시작하는 것이 안전하다.

- `DRAFT`
  - 배출지 또는 활동자료 작성 중
- `READY_FOR_CALC`
  - 산정 가능 조건 충족
- `CALCULATED`
  - 산정 완료
- `NEEDS_VERIFICATION`
  - 검증 대기
- `VERIFICATION_FAILED`
  - 검증 반려
- `VERIFIED`
  - 검증 완료
- `REPORT_DRAFT`
  - 보고서 초안 생성
- `SUBMITTED`
  - 제출 완료

배출지 단위 검증 상태:

- `NOT_STARTED`
- `WARNING`
- `PASSED`
- `FAILED`

## 5. 배출량 산정 화면 설계

## 5.1 화면 목적

배출량 산정 화면은 배출지별 데이터 입력 전에 대략적인 배출량을 빠르게 계산해 보는 `시뮬레이션형 워크스페이스`다.

## 5.2 레이아웃

화면 타입은 `WorkspacePage`를 권장한다.

상단:

- 페이지 제목: `배출량 산정`
- 설명: `배출지별 활동자료와 배출계수를 기반으로 예상 배출량을 산정합니다.`
- 상태 배지:
  - 선택 배출지 수
  - 입력 완료 항목 수
  - 예상 총배출량

본문 3열:

- 좌측 `배출지 선택 패널`
- 중앙 `산정 입력 패널`
- 우측 `산정 결과/식 설명 패널`

하단 고정 액션바:

- `초기화`
- `임시저장`
- `산정 실행`
- `관리 화면으로 넘기기`

## 5.3 배출지 선택 패널

목록 컬럼:

- 체크
- 배출지명
- 배출원 구분
- Scope
- 최근 입력일
- 현재 상태

필터:

- 사업장
- 배출원 구분
- Scope1/2/3
- 사용 여부

## 5.4 산정 입력 패널

공통 입력:

- 기준연도
- 기준월 또는 기간
- 사업장
- 배출지
- 배출원 유형
- 활동자료 값
- 활동자료 단위
- 배출계수
- 배출계수 출처
- 산화율/보정계수

유형별 동적 입력 예시:

- 연료연소
  - 연료종
  - 사용량
  - 발열량
- 전력사용
  - 사용전력량
  - 계통 배출계수
- 공정배출
  - 공정코드
  - 생산량
  - 공정별 계수
- 차량이동
  - 연료종
  - 주행거리
  - 평균연비

## 5.5 산정 결과 패널

표시 항목:

- 적용 산정식
- 산정 로직 버전
- 계산식 펼침 보기
- 예상 배출량(tCO2eq)
- 이전 입력 대비 증감
- 이상치 여부
- 검증 사전 경고

보조 UI:

- `식 보기`
- `계수 근거 보기`
- `입력 누락 보기`

## 6. 배출량 관리 화면 설계

## 6.1 화면 목적

배출량 관리 화면은 배출지별 데이터 수집부터 산정, 검증, 보고 제출까지 운영하는 중심 화면이다.

## 6.2 메인 목록 화면

화면 타입은 `ListPage`를 권장한다.

상단 요약 카드:

- 전체 배출지 수
- 산정 완료 건수
- 검증 대기 건수
- 제출 완료 건수

검색 조건:

- 기준연도
- 사업장
- 배출지명
- 배출원 구분
- 산정 상태
- 검증 상태
- 제출 상태
- 담당자

목록 컬럼:

- 번호
- 사업장
- 배출지명
- 배출원 구분
- Scope
- 최근 활동자료 입력일
- 산정 배출량
- 산정 상태
- 검증 상태
- 보고 상태
- 담당자
- 관리

행 액션:

- `상세`
- `입력`
- `산정`
- `검증`
- `보고서`

상단 액션:

- `배출지 추가`
- `엑셀 업로드`
- `일괄 산정`
- `검증 요청`
- `제출 대상 생성`

## 6.3 상세/입력 화면

화면 타입은 `Detail + Edit` 조합을 권장한다.

영역 1. 기본정보 카드

- 사업장
- 배출지명
- 배출원 코드
- Scope
- 시설/라인
- 담당부서
- 담당자
- 상태 배지

영역 2. 활동자료 입력 테이블

컬럼:

- 항목명
- 산정기준
- 입력값
- 단위
- 수집방법
- 증빙첨부
- 입력일시
- 입력자
- 검증 경고

영역 3. 산정 결과 카드

- 당월 배출량
- 누적 배출량
- 배출원별 비중
- 전월 대비 증감
- 이상치 플래그

영역 4. 이력/로그 패널

- 활동자료 수정 이력
- 산정 실행 이력
- 검증 의견 이력
- 보고 제출 이력

하단 액션바:

- `목록`
- `임시저장`
- `산정 실행`
- `검증 요청`

## 6.4 검증 화면

화면 타입은 `ApprovePage`를 권장한다.

검증 기준 블록:

- 필수값 누락 여부
- 단위 불일치 여부
- 배출계수 최신 버전 여부
- 전월/전년 대비 급증 여부
- 증빙파일 첨부 여부
- 산정식 변경 여부

검증 결과 구성:

- 자동검증 결과
  - PASS/WARNING/FAIL
- 수기검토 의견
- 반려 사유
- 보완 요청 항목
- 승인자
- 승인일시

액션:

- `자동검증 재실행`
- `보완 요청`
- `검증 승인`
- `검증 반려`

## 6.5 보고서 제출 화면

화면 타입은 `ApprovePage` 또는 `WorkspacePage`를 권장한다.

영역:

- 제출 요약
  - 기준기간
  - 제출 대상 수
  - 총 배출량
  - 검증 완료 수
- 보고서 본문 미리보기
- 첨부파일 업로드
- 제출 전 체크리스트
- 제출 이력

제출 전 체크리스트:

- 검증 완료 건만 포함되었는가
- 필수 첨부가 모두 등록되었는가
- 산정 기준년도와 보고서 기준년도가 일치하는가
- 반려 상태 건이 포함되지 않았는가

하단 액션:

- `초안 저장`
- `PDF 생성`
- `제출`
- `제출 취소`

## 7. 주요 업무 흐름

기본 흐름:

1. 배출 담당자가 배출지 목록을 등록한다.
2. 배출지별 활동자료를 입력한다.
3. 산정 로직으로 배출량을 계산한다.
4. 자동검증 로직을 수행한다.
5. 검증 담당자가 승인 또는 반려한다.
6. 승인 건을 기준으로 보고서를 생성한다.
7. 최종 제출한다.

상세 흐름 매핑:

- `emission_management_list` -> `emission_management_edit` via `CREATE`
- `emission_management_list` -> `emission_management_detail` via `ROW_CLICK`
- `emission_management_detail` -> `emission_management_edit` via `EDIT`
- `emission_management_detail` -> `emission_management_verify` via `VERIFY`
- `emission_management_verify` -> `emission_management_report` via `APPROVE`

## 8. 검증 로직 제안

자동검증 규칙은 초기 버전에서 다음 정도가 적절하다.

- 입력값이 0 또는 음수이면 `FAIL`
- 필수 단위 누락이면 `FAIL`
- 배출계수 미선택이면 `FAIL`
- 전월 대비 30% 이상 급증이면 `WARNING`
- 동일 배출지 중복 입력이면 `WARNING`
- 증빙 미첨부이면 `WARNING`
- 계산값이 허용 최대치 초과이면 `FAIL`

검증 결과는 `룰별 상세 로그`로 남겨야 한다.

필드:

- rule_id
- rule_name
- severity
- execution_result
- message
- reviewed_by
- reviewed_at

## 9. 데이터 모델 초안

핵심 엔터티 제안:

- `emission_source`
  - 배출지 마스터
- `emission_activity_data`
  - 활동자료 입력값
- `emission_factor`
  - 배출계수
- `emission_calculation_result`
  - 산정 결과
- `emission_verification_result`
  - 검증 결과
- `emission_report_submission`
  - 보고 제출 헤더
- `emission_report_submission_item`
  - 보고 제출 상세
- `emission_evidence_file`
  - 증빙 첨부

## 10. UI 컴포넌트 규칙

현재 관리자 표준에 맞춰 다음을 고정한다.

- 검색 조건은 상단 검색 카드로 통일
- 결과 목록은 실제 table semantic 유지
- 상태값은 badge color 규칙 통일
- 하단 액션은 고정 액션바 사용
- 검증/제출은 모달보다 독립 화면 우선
- hidden 상세 화면도 active 메뉴는 대표 목록에 고정

## 11. 구현 우선순위

1차:

- 배출량 관리 목록
- 배출지 등록/입력
- 산정 실행
- 자동검증

2차:

- 배출량 산정 워크스페이스
- 이상치 비교
- 보고서 초안

3차:

- 제출 이력
- PDF 생성
- 배출계수 버전 비교
- 대시보드 연계

## 12. 현재 기준 가정

이번 설계는 요청 내용과 저장소 내부 관리자 패턴만으로 정리했다.

명시적으로 확정되지 않은 항목:

- 실제 법정 보고서 포맷
- 배출계수 공식 소스
- 사업장/시설/라인 상세 조직 모델
- Scope3 세부 카테고리 분류
- 검증 승인권자 체계

외부 화면설계 워크스페이스 경로가 현재 환경에 없어, 기존 산출물 대조는 이번 문서에 반영하지 못했다.
