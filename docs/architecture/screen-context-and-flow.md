# Screen Context And Flow

## 목적

이 문서는 메뉴 노출, active 메뉴, breadcrumb, 버튼 진입, 숨김 화면 진입을 일관되게 처리하기 위한 화면 컨텍스트와 흐름 규칙을 정의한다.

## 문제 정의

일반적인 업무 메뉴는 다음과 같은 구조를 가진다.

- 목록 화면은 메뉴에 노출된다.
- 상세/수정 화면은 메뉴에 숨긴다.
- 사용자는 목록의 버튼이나 행 클릭으로 상세/수정에 진입한다.
- 상세/수정에 들어가도 좌측 active는 목록 메뉴여야 한다.

이 규칙이 모델로 관리되지 않으면:
- 메뉴 active가 깨진다.
- 숨김 여부를 코드로 하드코딩하게 된다.
- 화면이 늘어날수록 운영이 불가능해진다.

## 컨텍스트 규칙

### visible_in_menu

좌측 메뉴나 GNB에 노출할지 여부다.

- `Y`: 메뉴 노출
- `N`: 메뉴 숨김

### active_menu_id

현재 화면이 어느 메뉴를 active 처리해야 하는지 지정한다.

예:
- `member_detail` -> `member_list`
- `member_edit` -> `member_list`
- `company_account?insttId=...` -> `company_list`

### breadcrumb_menu_id

브레드크럼 또는 상단 컨텍스트가 어느 메뉴 기준으로 보일지 지정한다.

일반적으로 `active_menu_id`와 같게 시작하되, 필요 시 분리한다.

### landing_at

화면군의 대표 landing 화면인지 표시한다.

예:
- `member_list` = `Y`
- `member_detail` = `N`

## 흐름 규칙

### flow_type

권장 타입:
- `LIST_TO_DETAIL`
- `DETAIL_TO_EDIT`
- `LIST_TO_CREATE`
- `LIST_TO_APPROVE`
- `TAB_INTERNAL`
- `MODAL_ACTION`
- `ROW_ACTION`

### action_code

버튼 또는 트리거를 식별한다.

예:
- `ROW_CLICK`
- `CREATE`
- `EDIT`
- `APPROVE`
- `WITHDRAWN`
- `ACTIVATE`
- `RESET_PASSWORD`

## 예시

### 회원관리 > 회원

#### 노출 화면

- `member_list`
- `member_register`
- `member_approve`
- `member_withdrawn`
- `member_activate`

#### 숨김 화면

- `member_detail`
- `member_edit`

#### 컨텍스트

- `member_detail`
  - `visible_in_menu = N`
  - `active_menu_id = member_list`
- `member_edit`
  - `visible_in_menu = N`
  - `active_menu_id = member_list`

#### 흐름

- `member_list` -> `member_detail` via `ROW_CLICK`
- `member_detail` -> `member_edit` via `EDIT`
- `member_list` -> `member_register` via `CREATE`
- `member_list` -> `member_withdrawn` via `WITHDRAWN`
- `member_list` -> `member_activate` via `ACTIVATE`

## 관리자 화면 요구사항

관리자 화면은 최소 다음 작업을 지원해야 한다.

- 메뉴에 보일 화면 선택
- 숨길 화면 선택
- active 메뉴 지정
- breadcrumb 기준 지정
- 버튼 진입 흐름 지정
- 화면군 대표 landing 지정

즉 메뉴 관리만으로는 부족하고, 별도 `화면-메뉴 연결 관리`와 `화면 흐름 관리`가 필요하다.

## 런타임 요구사항

런타임은 다음을 지원해야 한다.

- 현재 URL -> screen code resolve
- screen code -> context rule lookup
- context rule -> active menu 계산
- context rule -> visible menu tree filtering
- flow rule -> 버튼/행 클릭 이동 검증

## 검증 체크리스트

- 숨김 화면에 직접 URL 진입해도 올바른 active가 잡히는가
- 목록에서 수정/상세로 들어갔을 때 메뉴 active가 유지되는가
- 메뉴에 숨김 처리한 화면이 API에는 남아 있어도 사이드바에서 제외되는가
- 화면군이 커져도 하드코딩 없이 관리 가능한가

## 금지 사항

- URL 접두어만으로 active 메뉴를 추론하지 않는다.
- 상세/수정 화면을 메뉴 노출로 억지 관리하지 않는다.
- 숨김 여부를 프런트 코드 상수로만 처리하지 않는다.
