# HTML To React Page Contract

## 목적

이 문서는 외부에서 전달받은 HTML 화면을 현재 Carbonet 마이그레이션 구조의 React 화면으로 포팅할 때 지켜야 할 최소 계약을 정의한다.

이 문서는 HTML 자체를 런타임에 포함시키기 위한 문서가 아니다. HTML은 참고 디자인 소스일 뿐이며, 최종 산출물은 React 페이지와 공통 컴포넌트 조합이어야 한다.

## 전제

- 기존 템플릿 기반 JSP/HTML 직접 사용은 종료된 상태다.
- 새 화면은 React migration 구조에 맞춰야 한다.
- 디자인 통합은 페이지별 복붙이 아니라 페이지 타입 템플릿을 통해 유지해야 한다.

## 입력 산출물

HTML 화면을 받으면 먼저 아래 정보를 추출해야 한다.

- 화면명
- URL 후보
- 페이지 타입
- 화면군 코드
- 검색 조건
- 테이블 컬럼
- 폼 필드
- 버튼 목록
- 상태 메시지
- API 후보
- 권한 코드 후보

HTML을 그대로 옮기지 말고 구조화된 화면 정의로 먼저 변환해야 한다.

## 페이지 타입 분류

HTML은 반드시 아래 중 하나로 분류한다.

- `LIST`
- `DETAIL`
- `EDIT`
- `CREATE`
- `APPROVE`
- `AUTHORITY`
- `LOG`
- `WORKSPACE`

페이지 타입이 정해지지 않으면 구현하지 않는다.

## 타입별 필수 프레임

### LIST

필수:
- `SearchFilterCard`
- `ResultToolbar`
- `TableSection`
- `PageStatusNotice`

### DETAIL

필수:
- `LookupContextStrip`
- `DetailPageFrame`
- `ActionBar`

### EDIT

필수:
- `LookupContextStrip`
- `EditPageFrame`
- `ActionBar`

### CREATE

필수:
- `CreatePageFrame`
- `ActionBar`

### APPROVE

필수:
- `ApprovalPageFrame`
- `ApprovalActionBar`
- `PageStatusNotice`

### AUTHORITY

필수:
- `AuthorityPageFrame`
- `ActionBar`
- `PageStatusNotice`

### LOG

필수:
- `SearchFilterCard`
- `LogTable`
- `PageStatusNotice`

## 공통 UI 규칙

### 버튼

- raw `<button>` 사용 금지
- 공통 버튼 컴포넌트 사용
- 하단 primary 버튼 최소 폭 통일
- `whitespace-nowrap` 유지

### 입력 필드

- raw `<input>` 사용 금지
- raw `<select>` 사용 금지
- 공통 `AdminInput`, `AdminSelect`, `AdminCheckbox` 사용
- 페이지별 임의 높이 override 금지

### 상태 메시지

- 권한 없음, 정보 없음, 저장 실패, 조회 실패는 공통 상태 컴포넌트 사용
- 페이지별 문구 박스 직접 구현 금지
- 로딩 중에는 권한 없음/정보 없음 메시지 먼저 노출 금지

### 메뉴 컨텍스트

- 상세/수정/내부 화면은 메뉴 active 규칙을 별도 선언해야 한다.
- 페이지 URL만으로 active를 맞추지 않는다.

## 구현 절차

1. HTML을 페이지 타입으로 분류
2. 화면군을 결정
3. 화면 컨텍스트 규칙을 정의
4. 공통 프레임을 선택
5. 섹션을 React 컴포넌트로 분해
6. API 바인딩 연결
7. 상태 메시지와 액션바를 공통 규칙으로 정리
8. 자동 검사 통과

## 산출물 규칙

한 HTML당 최종 산출물은 다음이어야 한다.

- React page component
- 공통 컴포넌트 조합
- page manifest entry
- route definition
- menu/screen context rule
- API binding definition

HTML 파일 자체는 최종 런타임 산출물이 아니다.

## 자동 검사 대상

포팅 후 반드시 검사해야 한다.

- raw `input/select/button` 존재 여부
- 공통 `ActionBar` 사용 여부
- `PageStatusNotice` 사용 여부
- 페이지 타입별 필수 프레임 사용 여부
- 메뉴 active 규칙 존재 여부

## 금지 사항

- HTML을 그대로 React 안에 큰 덩어리로 옮기지 않는다.
- inline style로 디자인을 맞추지 않는다.
- 페이지별로 독자적인 버튼 크기와 인풋 높이를 만들지 않는다.
- 동일 화면군에서 다른 레이아웃 규칙을 만들지 않는다.

## 운영 권장

대량 화면 이행 시에는 다음 순서를 따른다.

1. HTML 수집
2. 타입 분류
3. 화면군별 묶기
4. 공통 프레임 포팅
5. 자동 검사
6. 관리자 등록

이 순서를 지키지 않으면 100개 이상부터 디자인 편차와 운영 편차가 급격히 증가한다.
