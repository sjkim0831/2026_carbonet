# Screen Family Model

## 목적

이 문서는 홈 메뉴 하나에 다수의 실제 업무 화면이 연결되는 구조를 운영 가능하게 만들기 위한 기준 모델을 정의한다.

핵심 원칙:
- 메뉴는 진입점이다.
- 화면은 실제 실행 단위다.
- 화면군(screen family)은 같은 업무 흐름을 가진 화면 묶음이다.
- 메뉴 노출과 화면 실행은 분리한다.

## 개념 모델

### Menu

사용자가 좌측 메뉴, 상단 메뉴, 홈 화면에서 처음 진입하는 entry node다.

예:
- 회원관리 > 회원
- 회원관리 > 회원사
- 회원관리 > 관리자

### Screen Family

한 업무 묶음을 대표하는 논리 단위다. 한 메뉴는 하나 이상의 화면군을 가질 수 있고, 한 화면군은 여러 실제 화면을 가진다.

예:
- `member-management`
- `company-management`
- `admin-account-management`

### Screen

실제 URL과 권한, 데이터 바인딩, 화면 타입을 가진 실행 단위다.

예:
- `member_list`
- `member_detail`
- `member_edit`
- `member_register`
- `member_approve`

### Screen Type

화면의 UI 계약과 행동 패턴을 분류하는 타입이다.

허용 타입:
- `LIST`
- `DETAIL`
- `EDIT`
- `CREATE`
- `APPROVE`
- `AUTHORITY`
- `LOG`
- `WORKSPACE`

### Screen Flow

화면 간 전이 규칙이다.

예:
- `member_list` -> `member_detail` via `ROW_CLICK`
- `member_detail` -> `member_edit` via `EDIT`
- `member_list` -> `member_register` via `CREATE`

### Screen Context Rule

화면이 어떤 메뉴 아래에 속하고, 어떤 메뉴를 active 처리하며, 메뉴에 보일지를 정의한다.

이 규칙이 있어야 숨겨진 상세/수정 화면도 올바른 메뉴 컨텍스트를 유지할 수 있다.

## 권장 관계

### 메뉴와 화면의 관계

- 한 메뉴는 여러 화면을 대표할 수 있다.
- 모든 화면이 메뉴에 직접 노출될 필요는 없다.
- 메뉴 노출 여부와 화면 사용 여부는 분리한다.

### 예시

메뉴:
- `회원관리 > 회원`

실제 화면:
- `member_list` visible
- `member_register` visible
- `member_approve` visible
- `member_detail` hidden
- `member_edit` hidden
- `member_withdrawn` visible
- `member_activate` visible

컨텍스트:
- `member_detail` active menu = `member_list`
- `member_edit` active menu = `member_list`

## 데이터 모델 기준

필수 엔터티:
- `menu_info`
- `screen_family`
- `screen_info`
- `screen_flow`
- `screen_context_rule`
- `screen_binding`
- `screen_template_rule`

각 엔터티의 책임:
- `menu_info`: 메뉴 구조와 노출
- `screen_family`: 업무 묶음
- `screen_info`: URL, 권한, 타입
- `screen_flow`: 화면 전이
- `screen_context_rule`: active/hide/breadcrumb
- `screen_binding`: API, 검색, 폼, 테이블, 엑셀
- `screen_template_rule`: 타입별 공통 레이아웃 계약

## 관리자 운영 기준

운영자는 다음 순서로 화면군을 관리해야 한다.

1. 메뉴 생성 또는 선택
2. 화면군 생성
3. 화면 등록
4. 화면 흐름 등록
5. 화면 컨텍스트 규칙 등록
6. 데이터 바인딩 연결
7. 권한 코드 연결

## 금지 사항

- 메뉴만으로 모든 화면을 직접 표현하지 않는다.
- 상세/수정/승인 내부 화면을 메뉴 노출로 관리하지 않는다.
- URL 비교만으로 active 메뉴를 결정하지 않는다.
- 페이지별 임시 하드코딩으로 메뉴 컨텍스트를 맞추지 않는다.

## 구현 체크리스트

- 메뉴 하나에 20개 이상의 화면이 있어도 모델이 유지되는가
- 숨겨진 화면도 active 메뉴가 지정되는가
- 동일 화면군의 화면이 같은 UI 규칙을 따르는가
- 데이터 바인딩이 화면 코드 기준으로 분리되는가
- 권한이 화면 단위로 관리되는가
