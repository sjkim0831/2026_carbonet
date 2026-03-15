# Carbonet Structure

## AI Entry Order

When AI starts work, prefer this order:

1. `README.md`
2. `STRUCTURE.md`
3. `PROJECT_PATHS.md`
4. `docs/ai/README.md`
5. `docs/ai/00-governance/ai-fast-path.md`
6. `docs/ai/10-architecture/repo-layout.md`
7. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
8. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
9. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
10. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`

Avoid spending time in `target/`, `frontend/node_modules/`, and `var/logs/` unless the task is specifically about runtime output or build artifacts.

## Top-Level Directories

- `.codex/skills`
  - project-specific AI skills
- `docs`
  - project documentation, including AI-oriented maps under `docs/ai`
  - path-change entry docs at repository root and under operations
  - architecture docs under `docs/architecture`
  - audit docs under `docs/audit`
  - frontend docs under `docs/frontend`
  - catalogs under `docs/catalog`
  - operational guides under `docs/operations`
  - history and change summaries under `docs/history`
- `frontend`
  - React migration frontend
- `ops`
  - operational helpers such as cron-related assets
  - shared path variables under `ops/project-paths.sh`
  - reusable project scripts under `ops/scripts`
- `src`
  - Spring application source
- `target`
  - generated build output, not a source-of-truth location
- `var`
  - runtime and local mutable data
  - `var/logs` for runtime logs
  - `var/file` for uploaded or mounted local files

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
- `src/main/resources/static/react-migration`
  - built React assets consumed by Spring

## Frontend

- `frontend/src/app`
  - app shell, routing, shared frontend composition
- `frontend/src/features`
  - screen-oriented React migration modules
- `frontend/src/components`
  - shared React UI pieces
- `frontend/src/lib`
  - frontend helper libraries such as API wrappers
- `frontend/src/styles.css`
  - shared migration styling and parity fixes

## AI Docs

- `docs/ai/00-governance`
  - AI rules, forbidden changes, fast-path entry docs
- `docs/ai/10-architecture`
  - repo layout, package map, request flow
- `docs/ai/20-ui`
  - screen, route, component, event maps
- `docs/ai/30-domain`
  - state machines, business rules, code dictionaries
- `docs/ai/40-backend`
  - API, controller-service, mapper, auth maps
- `docs/ai/50-data`
  - table dictionary and DB impact maps
- `docs/ai/60-operations`
  - release, audit, incident, risk docs
- `docs/ai/70-reference`
  - design-source ordering and glossary
- `docs/ai/80-skills`
  - skill routing and gap tracking

## Naming Rules
- 기능 패키지: `feature/<domain>`
- 레이어: `web`, `service`, `service/impl`, `mapper`, `model/vo`, `dto`
- 템플릿 파일명: `snake_case`
- 영문 템플릿: `_en` suffix
- 공통 리소스는 `common` 아래에만 둠

## Notes
- 외부 프레임워크 타입명 `Egov*` 는 유지한다.
- 우리 소유 클래스는 기능/역할 기준 이름을 사용한다.
- 코드 탐색 시 generated asset보다 source file을 우선 본다.
- 설계 기준이 필요하면 `/home/imaneya/workspace/화면설계`를 먼저 보고, 상세는 그 다음에 본다.
- 로컬 파일 저장 기본경로는 `var/file`, 런타임 로그 기본경로는 `var/logs` 이다.

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
