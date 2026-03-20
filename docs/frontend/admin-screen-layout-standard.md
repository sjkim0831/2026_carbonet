# Admin Screen Layout Standard

## 목적

관리자 화면의 버튼 크기, 액션 위치, 목록 툴바, 하단 저장 영역, 감사 이력/메타 패널 배치를 정형화해 화면별 편차를 줄이고 신규 화면 생산 속도를 높인다.

이 문서는 현재 `frontend/src/features/*`의 React 관리자 화면을 기준으로 작성했다.

같은 원칙은 공개 홈페이지와 회원가입 계열에도 적용되어야 한다.

즉:

- 공용 헤더
- 공용 메뉴
- 공용 유틸리티 영역
- 공용 푸터
- 공용 하단 액션바

도 페이지 로컬 구현이 아니라 공통 셸 자산으로 다뤄야 한다.

## 현재 진단

현재 관리자 화면은 크게 세 층으로 나뉜다.

1. 회원관리 계열
- `MemberActionBar`
- `MemberToolbar`
- `MemberListToolbar`
- `ReviewModalFrame`
- `MemberSectionCard`

위 공통 컴포넌트가 일부 적용되어 있어 가장 정형화가 진척된 상태다.

2. 시스템/운영 계열
- `environment-management`
- `auth-group`
- `security-policy`
- `help-management`
- `sr-workbench`
- `wbs-management`

기능은 풍부하지만 액션 위치와 버튼 계층이 화면별로 다르다.

3. 레거시 이행 계열
- `system-code`
- `function-management`
- 일부 관리 도구 화면

폼 내부 액션, 표 내부 액션, 페이지 상단 액션이 혼합되어 있다.

## 확인된 문제

### 액션 위치 불일치

- 어떤 화면은 상단 우측에 전역 버튼이 있다.
- 어떤 화면은 그리드 안쪽 헤더에 버튼이 있다.
- 어떤 화면은 폼 하단에만 저장 버튼이 있다.
- 어떤 화면은 하단 액션이 좌우 분리형이고, 어떤 화면은 한쪽 정렬형이다.

### 버튼 계층 불일치

- 동일 의미의 `목록`, `저장`, `조회`, `수정`, `삭제`가 화면마다 크기와 색이 다르다.
- 파괴 액션과 일반 액션의 시각적 우선순위가 섞여 있다.
- 상단/행단위/모달 버튼이 같은 스타일을 공유하지 않는다.

### 화면 타입 미정의

- 목록형, 상세형, 편집형, 승인형, 정책형이 명확한 레이아웃 템플릿 없이 개별 구현되어 있다.
- 감사 이력, 메타데이터, 상태 요약을 어디에 붙일지 공통 규칙이 없다.

### 상품화 시 어색해 보일 수 있는 위험

- 페이지마다 제목, 요약, 액션바의 밀도와 간격이 다르면 저품질로 보인다.
- 공용 셸을 쓰더라도 홈, 로그인, 회원가입, 게시판, 관리자 화면의 목적별 강조점이 없으면 템플릿 티가 난다.
- 팝업, 그리드, 검색폼, 하단 액션바가 화면마다 미세하게 다른 위치와 간격을 쓰면 관리도 어렵고 완성도도 떨어진다.
- 상태 화면, 빈 화면, 오류 화면, 권한 없음 화면이 설계되지 않으면 “만든 티”가 난다.
- 운영 화면은 기능이 많기 때문에 compare, diagnostics, help rail이 레이아웃에 자연스럽게 통합되지 않으면 급조된 인상이 강해진다.

## 상품화 UI 보장 규칙

운영 시스템에서 만든 화면이 일반 시스템으로 배포될 때 다음은 기본적으로 맞아야 한다.

- 헤더/메뉴/푸터/페이지 프레임이 승인된 셸 조합 안에서만 생성될 것
- 같은 화면 패밀리에서는 같은 검색 밀도, 테이블 밀도, 버튼 슬롯, 섹션 간격을 유지할 것
- 하단 주요 액션은 위치와 우선순위가 일관될 것
- 팝업, 그리드, 검색폼, 위저드, 승인 모달은 공통 블록을 재사용할 것
- 로그인, 회원가입, 게시판, 관리자 주요 화면은 목적별 기본 레이아웃 프로필을 가져야 할 것
- 첫 배포된 일반 시스템에서도 현재 시스템과 비교해 낯설거나 조잡한 인상을 주지 않을 것
- 미리 설계 등록된 디자인, 페이지 프레임, 액션 레이아웃, 컴포넌트만 출력에 사용될 것

## HTML5 And Semantic Markup Rule

React frontend outputs for both the operations system and deployed general systems should follow HTML5 semantic structure by default.

Use this rule:

- page shells should resolve to semantic landmarks such as `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer`
- interactive controls should use real `button`, `a`, `input`, `select`, `textarea`, `dialog`, `details`, `summary`, `fieldset`, and `legend` semantics where appropriate
- layout-only `div` nesting must not replace semantics for page title, navigation, search, table controls, step navigation, or bottom action regions
- search areas should be rendered as governed form regions with proper labels and grouping
- popup and modal layers should preserve valid dialog semantics, focus return, and keyboard escape behavior
- table-like UI should prefer real table semantics unless the scenario explicitly requires virtualized grid behavior
- icon-only actions must carry accessible names and governed help anchors

Release blockers:

- missing `main` or equivalent primary content landmark
- navigation rendered without a governed `nav` context
- clickable `div` or `span` used where a `button` or link is required
- unlabeled search, popup, upload, or step controls
- invalid heading order or section hierarchy that breaks operator comprehension

## HTML5 Verification Checklist

Before a page family is marked publish-ready, confirm:

1. one governed `main` landmark exists for the primary content area
2. header and navigation areas resolve through approved shell assets
3. search areas use real form semantics with labels and grouping
4. popup and modal actions use dialog semantics and focus-return handling
5. table-like outputs use real table semantics unless a governed virtual-grid exception exists
6. action triggers use `button` or `a` instead of clickable layout nodes
7. heading order is valid and section hierarchy is readable
8. icon-only controls have accessible names and governed help anchors
9. step, wizard, tab, upload, and bottom-action regions expose keyboard-safe semantics
10. no custom page-local markup bypasses approved primitives for shell, form, grid, popup, or action zones

If one item fails:

- record the violation in compare or repair history
- block parity-ready release
- reopen selected-screen or selected-element repair

출력물이 어색하다고 판단되는 대표 조건:

- 제목/요약/상태 배지가 없는 화면
- primary action이 둘 이상 충돌하는 화면
- 검색폼과 결과 그리드 간 간격이 테마 규격에서 벗어난 화면
- 화면별로 다른 버튼 문법을 쓰는 화면
- 팝업 내 액션과 페이지 하단 액션이 같은 계층으로 섞인 화면
- 홈, 회원가입, 관리자 화면이 동일 셸처럼 보여 역할 구분이 약한 화면
- 미등록 버튼 위치 또는 미등록 섹션 레이아웃이 포함된 화면

## 사전 등록 디자인 우선 규칙

화면은 임의 배치가 아니라 아래 순서로만 생성되어야 한다.

1. 페이지 프레임 선택
2. 액션 레이아웃 선택
3. 요소 패밀리 선택
4. 승인된 컴포넌트 선택
5. 페이지 조립
6. 비교/검증 후 publish

따라서:

- 버튼 위치는 섹션마다 제각각 정하지 않는다
- 검색폼, 그리드, 팝업, 상세카드, 하단 액션바는 공통 블록과 조립 규칙을 따른다
- 대략 설계 단계에서 페이지와 요소를 먼저 등록하고, 실제 화면은 그 등록본으로만 출력한다

## 컴포넌트 내부 슬롯 표준화 규칙

같은 분류와 같은 위치의 컴포넌트는 내부 요소의 위치도 같아야 한다.

예를 들면:

- 같은 검색폼 패밀리는 제목, 조건영역, 보조설명, 액션버튼 순서가 동일해야 한다
- 같은 그리드 패밀리는 총건수, 툴바, 행 액션, 페이지네이션 위치가 동일해야 한다
- 같은 상세카드 패밀리는 상태배지, 메타정보, 본문, 로컬 액션의 위치가 동일해야 한다
- 같은 하단 액션바 패밀리는 primary, secondary, danger 버튼 군의 위치가 동일해야 한다

따라서 페이지 생성은 단순 컴포넌트 선택이 아니라 다음을 같이 고정해야 한다.

- `componentFamily`
- `slotProfileId`
- `pageZone`
- `spacingProfileId`
- `densityProfileId`

금지:

- 같은 family인데 화면마다 다른 위치에 primary action을 두는 것
- helper text, counter, status badge가 화면마다 다른 슬롯으로 이동하는 것
- 페이지 로컬 CSS로 내부 슬롯 배치를 우회하는 것

허용:

- 새 목적이 명확하고 새 슬롯 프로필이 승인된 경우에만 내부 구조 변형

## 패러티 UI 승인 기준

일반 시스템으로 빌드 배포되기 전 다음 항목이 모두 확인되어야 한다.

- 홈, 로그인, 회원가입, 게시판, 관리자 핵심 화면 패밀리의 셸 패리티
- 버튼 계층, 검색/그리드 밀도, 팝업 액션 계층의 균일성
- 상태 화면, 빈 화면, 오류 화면, 권한 없음 화면의 완성도
- 도움말, 가이드, 진단 패널의 자연스러운 배치
- 모바일/반응형에서의 구조 붕괴 여부
- 현재 시스템 대비 과도하게 단순해진 화면이 없는지 여부

하나라도 실패하면:

- compare 결과에 기록
- repair queue에 등록
- patch release 전까지 parity-ready로 표시하지 않는다

## 표준 화면 타입

### 0-A. DashboardPage

대상:

- 운영 대시보드
- 통계/예측 대시보드
- 모니터링/요약 대시보드
- 가격 예측, 리스크 예측, 트렌드 분석형 화면

구조:

- 상단 `PageHeader`
- 1행 `summary KPI cards`
- 2행 `primary insight panel + trend/chart panel`
- 3행 `explanation/driver panel + action/recommendation panel`
- 하단 `detail grid / drill-down list / filter rail`

배치 규칙:

- `GWT + price-prediction` 스타일로, 상단은 빠른 KPI, 중단은 추세/예측, 하단은 설명/세부표로 고정
- 카드, 차트, 추천 패널, 상세 그리드는 승인된 dashboard block만 사용
- 상단 KPI는 4개 또는 6개 배수를 기본으로 하고 임의 카드 밀도를 금지
- 주 차트는 항상 페이지의 중심 시각 요소 1개만 둔다
- 보조 차트는 주 차트 아래나 우측 rail에 제한한다
- 설명 패널은 모델 근거, 규칙 근거, 운영 가이드처럼 읽기 쉬운 섹션으로 분리한다
- 필터는 상단 sticky filter bar 또는 좌측 filter rail 중 하나만 사용한다
- 대시보드에서도 하단 액션바는 공용 action-layout profile을 따른다

확장 규칙:

- 대시보드 외 일반 화면도 가능하면 같은 카드 위계와 패널 밀도를 따른다
- 상세/편집/검토 화면에서도 `summary -> primary content -> secondary evidence -> bottom action` 순서를 우선 사용한다
- 즉 대시보드 전용 미학이 아니라, 전체 운영 화면의 시각 문법으로 재사용 가능해야 한다

### 0. PublicShellPage

대상:

- `home`
- `signin`
- `join-*`
- 공용 안내/조회/게시판 계열

구조:

- 상단 `PublicHeader`
- 전역 `GlobalNavigation`
- 본문 `PageFrame`
- 보조 `Help/Guide rail` 또는 상태 안내
- 하단 `PublicFooter`

액션 규칙:

- 헤더 유틸리티 액션은 우측 상단 고정
- 글로벌 메뉴는 헤더 하단 또는 좌측 drawer 변형 중 하나로 통일
- 공개 페이지 하단 CTA는 페이지별 제멋대로 두지 말고 공용 action slot을 사용
- 회원가입/신청 wizard 계열은 `step header + content + bottom action bar` 구조를 유지
- 푸터는 회사정보, 약관/개인정보 링크, 사이트맵/고객지원 링크, 저작권/정책 문구를 공용 슬롯으로 유지
- 페이지마다 임의 푸터를 다시 그리지 않고 `PublicFooter` 자산을 재사용

변형 규칙:

- `home`은 `fullHeader + fullMenu + fullFooter`를 기본으로 사용
- `signin`과 일부 `join-*` 화면은 `compactHeader + hiddenMenu + legalFooter` 변형을 사용할 수 있다
- 게시판/고객지원 계열은 `publicHeader + contextualMenu + standardFooter` 변형을 사용할 수 있다
- 같은 홈페이지 계열 안에서도 시스템별로 다른 셸 조합을 선택할 수 있지만, 반드시 승인된 shell profile만 사용한다

항목 관리 규칙:

- 헤더의 로고, 유틸리티 링크, 빠른 메뉴, CTA 버튼은 개별 항목으로 등록 가능해야 한다
- 메뉴의 그룹, 1depth, 2depth, 강조 메뉴는 개별 항목으로 등록 가능해야 한다
- 푸터의 법적 링크, 사이트맵 링크, 회사정보, 고객지원, 배지 영역은 개별 항목으로 등록 가능해야 한다
- 항목 추가는 운영 시스템 GUI에서 처리하고, 일반 시스템은 승인된 결과만 빌드에 포함한다

### 1. ListPage

대상:
- `member-list`
- `company-list`
- `admin-list`
- `password-reset`
- `security-history`
- `blocklist`
- `ip-whitelist`

구조:
- 상단 `PageHeader`
- 검색 영역
- 목록 툴바
- 테이블
- 페이지네이션

액션 규칙:
- 전역 액션은 상단 우측
- 검색 관련 액션은 검색 폼 우측 하단
- 엑셀/신규등록은 목록 툴바 우측
- 행별 액션은 표 마지막 열

### 2. DetailPage

대상:
- `member-detail`
- `company-detail`

구조:
- 상단 요약 카드
- 상세 섹션 카드들
- 하단 이동 액션바

액션 규칙:
- 상단에는 읽기 전용 보조 액션만 허용
- 주 액션은 하단 `BottomActionBar`
- `목록/이전`은 좌측, `수정/다음행동`은 우측

### 3. EditPage

대상:
- `member-edit`
- `company-account`
- `admin-account-create`
- `admin-permission`

구조:
- 상단 요약/주의사항
- 편집 섹션 카드들
- 하단 저장 액션바

액션 규칙:
- 임시 검증, 중복확인, 주소검색, 파일추가 등은 섹션 내부 보조 액션
- `저장`은 하단 우측 고정
- `목록/상세/취소`는 하단 좌측

### 4. ReviewPage

대상:
- `member-approve`
- `company-approve`
- 승인형 상세 검토 모달이 있는 화면

구조:
- 필터 영역
- 승인 대기 목록
- 행별 `상세 검토`
- 공통 리뷰 모달

액션 규칙:
- 일괄 액션은 목록 상단 툴바 우측
- 승인/반려는 리뷰 모달 하단 우측
- 닫기/이전은 리뷰 모달 하단 좌측

### 5. AuthorityPage

대상:
- `auth-group`
- `auth-change`
- `dept-role-mapping`

구조:
- 상단 상태/요약 카드
- 좌측 필터 혹은 회사/권한 선택
- 우측 매핑/변경 표
- 하단 저장 또는 즉시 저장 액션

액션 규칙:
- 포커스 이동 버튼은 상단 보조 액션
- 저장은 페이지 하단 또는 우측 패널 하단
- 권한 관련 위험 액션은 `dangerSecondary` 또는 `danger`

### 6. PolicyPage

대상:
- `security-policy`
- `security-monitoring`
- `security-audit`
- `observability`
- `scheduler-management`

구조:
- 상단 요약 카드
- 본문 정책/이벤트 테이블
- 우측 또는 하단 진단/플레이북 카드

액션 규칙:
- 정책 전체 수준 액션은 상단 우측
- 진단 카드 안 보조 액션은 카드 footer 또는 내부 버튼군
- SQL 복사, 링크 열기, 실행 전 검토는 진단 카드 하단에 묶음

### 7. WorkspacePage

대상:
- `environment-management`
- `help-management`
- `sr-workbench`
- `wbs-management`
- `codex-provision`

구조:
- 상단 내비게이션/상태 요약
- 다중 패널 또는 다중 섹션 작업 공간
- 우측 보조 정보 또는 하단 결과 패널

액션 규칙:
- 페이지 이동용 quick action은 상단
- 섹션별 액션은 각 섹션 헤더
- 실행/저장/생성은 섹션 내부 우측 또는 하단 우측
- 전역 destructive action은 페이지 하단이 아니라 해당 섹션 경계 안에 둔다

## 표준 액션 슬롯

### Slot A. PageHeaderActions

위치:
- 페이지 제목 우측 상단

용도:
- 신규 등록
- 엑셀 다운로드
- 전역 이동
- 전역 새로고침

금지:
- 파괴 액션
- 저장 확정 액션

### Slot B. SearchActions

위치:
- 검색 폼 마지막 컬럼 또는 우측 정렬

용도:
- `조회`
- `초기화`

규칙:
- `조회`는 `primary`
- `초기화`는 `secondary`

### Slot C. GridToolbarActions

위치:
- 목록/그리드 헤더 우측

용도:
- 엑셀
- 일괄승인
- 일괄해제
- 신규추가

### Slot D. SectionActions

위치:
- 섹션 카드 헤더 우측

용도:
- 중복확인
- 주소검색
- 파일추가
- 포커스 이동
- 접기/펼치기

### Slot E. InlineRowActions

위치:
- 테이블 마지막 열

용도:
- `상세`
- `수정`
- `검토`
- `삭제`

규칙:
- 기본은 `xs`
- 한 행에 최대 3개
- 3개 초과 시 드롭다운 또는 상세 패널로 이동

### Slot F. BottomActionBar

위치:
- 페이지 최하단

구조:
- 좌측: 이동/보조 액션
- 우측: 저장/승인/생성 같은 주 액션

규칙:
- 상세/편집/등록 화면은 이 슬롯을 기본 채택
- `저장`, `승인`, `생성`은 우측 primary
- `목록`, `이전`, `상세`는 좌측 secondary

### Slot G. ModalFooter

위치:
- 모달 하단

구조:
- 좌측: 닫기/취소
- 우측: 승인/저장/확정

## 버튼 규격

### 사이즈

- `xs`
  - 행단위 버튼
  - 보조 제어
- `sm`
  - 카드 내부 보조 액션
  - 필터 보조 버튼
- `md`
  - 기본 버튼
  - 상단 툴바 버튼
- `lg`
  - 하단 액션바
  - 최종 저장/승인

### 색상 계층

- `primary`
  - 저장
  - 생성
  - 승인
  - 주 실행
- `secondary`
  - 목록
  - 닫기
  - 초기화
  - 일반 이동
- `success`
  - 신규 등록
  - 등록 완료 이동
- `danger`
  - 실제 삭제
  - 반려 확정
- `dangerSecondary`
  - 삭제 영향 검토
  - 위험 경고 후속 액션
- `info`
  - 상태 확인
  - 미리보기
- `ghost`
  - 아이콘 버튼
  - 닫기

## 감사 이력 / 메타데이터 배치 규칙

### 감사 이력

- 기본 위치는 우측 보조 패널 또는 하단 탭
- 상세/편집 화면은 하단 탭 우선
- 정책/운영 화면은 우측 패널 우선

### 메타데이터

- 화면 운영 메타는 `PolicyPage`나 `WorkspacePage`의 우측 패널에 둔다
- 목록형 화면에는 메타 패널을 두지 않고 요약 카드만 허용

### 로그 / SQL / 진단

- 진단과 SQL 프리뷰는 카드 내부로 제한
- 즉시 실행 버튼은 별도 승인 흐름이 생기기 전까지 두지 않는다

## 현재 화면 분류 초안

### 정형화가 이미 비교적 진행된 화면

- `member-list`
- `company-list`
- `member-detail`
- `company-detail`
- `member-edit`
- `company-account`
- `member-approve`
- `company-approve`

### 정형화 대상 1순위

- `auth-group`
- `auth-change`
- `dept-role-mapping`
- `security-policy`
- `environment-management`

### 정형화 대상 2순위

- `help-management`
- `sr-workbench`
- `wbs-management`
- `system-code`
- `function-management`

## 공통 컴포넌트 확장 제안

현재 존재:
- `MemberButton`
- `MemberLinkButton`
- `MemberPermissionButton`
- `MemberIconButton`
- `MemberToolbar`
- `MemberSectionToolbar`
- `MemberModalFooter`
- `MemberActionBar`
- `MemberPagination`
- `MemberSectionCard`
- `DetailSummaryCard`
- `ReviewModalFrame`

다음 추가 권장:
- `PageHeaderActions`
- `GridToolbar`
- `SearchActionRow`
- `InlineRowActionGroup`
- `AuditPanel`
- `MetadataPanel`
- `DiagnosticCard`
- `CopyableCodeBlock`

## 전환 순서

### 1단계

권한/보안/회원관리 공통 슬롯 정리

- `auth-group`
- `auth-change`
- `dept-role-mapping`
- `security-policy`

### 2단계

운영 워크스페이스형 화면 정리

- `environment-management`
- `help-management`
- `sr-workbench`

### 3단계

레거시 관리형 폼 정리

- `system-code`
- `function-management`
- `admin-permission`
- `admin-account-create`

## 구현 원칙

- 새 관리자 화면은 반드시 표준 화면 타입 하나를 먼저 선택한다.
- 버튼 위치는 개별 JSX에서 새로 결정하지 않고 슬롯 규칙을 따른다.
- 감사 이력과 메타데이터는 기능 구현 후 임의 위치에 붙이지 않고, 화면 타입에 맞는 보조 패널 슬롯에 넣는다.
- destructive action은 항상 영향 검토 또는 확인 절차를 거친다.
- 목록형/상세형/편집형/정책형의 하단 액션바 배치는 예외 없이 동일 계층을 사용한다.

## 바로 다음 실행 작업

1. `security-policy`, `auth-group`, `auth-change`, `dept-role-mapping`을 위 표준 슬롯으로 맞춘다.
2. `PageHeaderActions`, `GridToolbar`, `DiagnosticCard`, `CopyableCodeBlock`을 공통 컴포넌트로 추가한다.
3. `environment-management`를 `WorkspacePage` 규격에 맞춰 상단 quick action, 섹션 액션, 하단 destructive action 경계를 정리한다.
