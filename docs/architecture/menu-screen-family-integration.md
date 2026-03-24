# Menu Screen Family Integration

## 목적

이 문서는 기존 Carbonet 메뉴 체계인 `COMTNMENUINFO`, `COMTCCMMNDETAILCODE`, `COMTNMENUFUNCTIONINFO`와 새 화면군 모델인 `screen_family`, `screen`, `screen_flow`, `screen_context_rule`를 어떻게 함께 운영할지 정의한다.

## 전제

기존 시스템에서 이미 메뉴와 권한의 기준은 다음 테이블에 있다.

- `COMTNMENUINFO`
- `COMTCCMMNDETAILCODE`
- `COMTNMENUFUNCTIONINFO`
- `COMTNAUTHORFUNCTIONRELATE`

새 화면군 모델은 이를 대체하지 않는다. 보완한다.

## 역할 분리

### 기존 메뉴 체계가 계속 담당하는 것

- 메뉴 코드
- 메뉴 계층
- 메뉴명
- URL
- 사용 여부
- 노출 여부
- 기본 기능 코드
- 역할 권한 연결

### 새 화면군 모델이 담당하는 것

- 한 메뉴 아래 여러 실제 화면 묶음 관리
- 목록/상세/수정/승인 등의 흐름
- 숨김 화면의 active 메뉴 규칙
- 화면 타입별 공통 디자인 계약
- API/폼/테이블/엑셀 바인딩 메타데이터

## 연결 방식

### menu_info -> screen_context_rule

`screen_context_rule.menu_no`
- 기준 메뉴

`screen_context_rule.active_menu_no`
- 현재 화면이 active 처리해야 하는 메뉴

즉 `COMTNMENUINFO.MENU_NO`는 화면 컨텍스트의 anchor로 사용된다.

### screen_info.screen_url -> COMTNMENUINFO.PROGRM_FILE_NM

화면 URL이 메뉴 URL과 동일한 경우:
- 화면은 메뉴 entry다.

화면 URL이 메뉴 URL과 다르지만 같은 업무 흐름인 경우:
- 메뉴는 유지
- 화면은 숨김 컨텍스트로 연결

예:
- 메뉴 URL `/admin/member/list`
- 숨김 화면 `/admin/member/detail`
- 숨김 화면 `/admin/member/edit`

### feature_code 연결

`screen_info.feature_code`
- `COMTNMENUFUNCTIONINFO.FEATURE_CODE`와 연결

즉 화면 단위 권한은 기존 기능 코드 체계를 재사용한다.

## 권장 설치 순서

새 화면군을 도입할 때는 아래 순서를 따른다.

1. `COMTCCMMNDETAILCODE`에 페이지 코드 등록
2. `COMTNMENUINFO`에 메뉴 등록 또는 기존 메뉴 선택
3. `COMTNMENUFUNCTIONINFO`에 기본 VIEW 기능 등록
4. `screen_family_info`에 화면군 등록
5. `screen_info`에 실제 화면 등록
6. `screen_flow_info`에 흐름 등록
7. `screen_context_rule`에 active/hide 규칙 등록
8. `screen_binding_info`에 API/폼/테이블 바인딩 등록

## 운영 예시

### 회원관리 > 회원

메뉴:
- `COMTNMENUINFO`
  - `회원 목록`
  - `신규 회원 등록`
  - `가입 승인`
  - `탈퇴 회원`
  - `휴면 계정`

숨김 화면:
- `member_detail`
- `member_edit`

화면군:
- `member-management`

연결:
- `member_detail`
  - `menu_no = 회원 상세 메뉴코드`
  - `active_menu_no = 회원 목록 메뉴코드`
  - `visible_in_menu_at = N`
- `member_edit`
  - `menu_no = 회원 수정 메뉴코드`
  - `active_menu_no = 회원 목록 메뉴코드`
  - `visible_in_menu_at = N`

## 관리자 화면 요구사항

기존 `메뉴 관리`는 아래만 다룬다.
- 순서
- 사용 여부
- 노출 여부
- 메뉴 URL

새로 필요한 운영 화면:
- 화면 관리
- 화면 흐름 관리
- 화면-메뉴 연결 관리
- 화면 바인딩 관리

즉 메뉴 관리는 entry 관리, 화면 관리는 execution 관리다.

## 마이그레이션 원칙

- 기존 메뉴 테이블은 그대로 유지한다.
- 새 모델은 overlay 방식으로 추가한다.
- 기존 권한 테이블도 그대로 유지한다.
- 숨김 화면의 active 규칙은 새 모델에서 관리한다.
- 프런트 하드코딩은 최종적으로 제거 대상이다.

## 검증 체크리스트

- 메뉴 하나에 20개 이상의 화면이 묶일 수 있는가
- 상세/수정 같은 숨김 화면도 active 메뉴가 지정되는가
- 기존 기능 코드와 새 screen code가 충돌 없이 연결되는가
- 메뉴 관리와 화면 관리 책임이 분리되는가
