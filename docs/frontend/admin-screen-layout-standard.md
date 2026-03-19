# Admin Screen Layout Standard

## 목적

관리자 화면의 버튼 크기, 액션 위치, 목록 툴바, 하단 저장 영역, 감사 이력/메타 패널 배치를 정형화해 화면별 편차를 줄이고 신규 화면 생산 속도를 높인다.

이 문서는 현재 `frontend/src/features/*`의 React 관리자 화면을 기준으로 작성했다.

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

## 표준 화면 타입

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
