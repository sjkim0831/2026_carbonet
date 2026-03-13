# Carbonet Structure

## Java
- `src/main/java/egovframework/com/common`
  - 공통 설정, 필터, 인터셉터, 유틸, 공통 서비스, mapper support
- `src/main/java/egovframework/com/config`
  - `common`, `data`, `filter`, `web` 설정
- `src/main/java/egovframework/com/feature/admin`
  - 관리자 기능
- `src/main/java/egovframework/com/feature/auth`
  - 로그인, 인증, 토큰, 사용자 조회
- `src/main/java/egovframework/com/feature/home`
  - 홈, 마이페이지, 공통 홈 메뉴
- `src/main/java/egovframework/com/feature/member`
  - 회원, 회원사, 부서, 가입

## Resources
- `src/main/resources/templates/egovframework/com/common`
  - 공통 fragment, 공통 오류 화면
- `src/main/resources/templates/egovframework/com/admin`
  - 관리자 화면 템플릿
- `src/main/resources/templates/egovframework/com/auth`
  - 로그인/인증 화면 템플릿
- `src/main/resources/templates/egovframework/com/home`
  - 홈/마이페이지 템플릿
- `src/main/resources/templates/egovframework/com/member`
  - 회원가입/회원사 가입 템플릿
- `src/main/resources/messages/egovframework/com/common`
  - 공통 메시지
- `src/main/resources/messages/egovframework/com/auth`
  - 인증 메시지
- `src/main/resources/egovframework/mapper/com/common`
  - 공통 MyBatis XML
- `src/main/resources/egovframework/mapper/com/feature/admin`
  - 관리자 MyBatis XML
- `src/main/resources/egovframework/mapper/com/feature/member`
  - 회원/회원사 MyBatis XML

## Naming Rules
- 기능 패키지: `feature/<domain>`
- 레이어: `web`, `service`, `service/impl`, `mapper`, `model/vo`, `dto`
- 템플릿 파일명: `snake_case`
- 영문 템플릿: `_en` suffix
- 공통 리소스는 `common` 아래에만 둠

## Notes
- 외부 프레임워크 타입명 `Egov*` 는 유지한다.
- 우리 소유 클래스는 기능/역할 기준 이름을 사용한다.

## URL Mapping
- `/home` -> `HomePageController#index` -> `templates/egovframework/com/home/index.html`
- `/en/home` -> `HomePageController#indexEn` -> `templates/egovframework/com/home/index_en.html`
- `/mypage` -> `HomePageController#mypage` -> `templates/egovframework/com/home/mypage.html`
- `/signin/loginView` -> `AuthPageController#loginView` -> `templates/egovframework/com/auth/login.html`
- `/admin/login/loginView` -> `AuthPageController#adminLoginView` -> `templates/egovframework/com/auth/admin_login.html`
- `/join/step1` -> `MemberJoinController#step1` -> `templates/egovframework/com/member/step1_join.html`
- `/join/step4` -> `MemberJoinController#step4` -> `templates/egovframework/com/member/step4_info.html`
- `/admin/member/list` -> `AdminMainController#member_list` -> `templates/egovframework/com/admin/member_list.html`
- `/admin/member/company_list` -> `AdminMainController#company_list` -> `templates/egovframework/com/admin/company_list.html`
- `/admin/system/code` -> `AdminSystemCodeController#systemCodeManagement` -> `templates/egovframework/com/admin/system_code.html`
