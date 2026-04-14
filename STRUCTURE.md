# Carbonet Structure

## AI Entry Order

When AI starts work, prefer this order:

1. `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
2. the selected primary skill file
3. one or two task-specific docs only
4. `docs/ai/00-governance/ai-reference-reduction-policy.md`
5. `docs/ai/00-governance/ai-fast-path.md` when additional routing detail is needed
6. `docs/architecture/system-folder-structure-alignment.md` when the task is about folder placement or source-of-truth rules
7. `docs/architecture/builder-structure-wave-20260409-closure.md` when the task is about builder structure closure, source-of-truth, or shim/delete rules
8. `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md` when the task is about continuing builder resource ownership closure
9. `docs/architecture/builder-resource-ownership-queue-map.md` when the task needs the shortest builder resource ownership row queue
10. `docs/architecture/builder-resource-entry-pair-maintenance-contract.md` when the task changes live builder resource ownership continuation state
11. `docs/architecture/builder-resource-executable-app-evidence-checklist.md` when row `5` executable-app fallback proof or blocker reasoning is being updated
12. canonical partial phrase for the current builder resource ownership state:
   - `PARTIAL_DONE: builder resource ownership closure still counts rows 3 and 5 as blockers, rows 1 and 2 now carry bounded DELETE_NOW notes, row 4 now carries a stronger non-blocker note, and unresolved fallback blocker count is <n>.`
13. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
14. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
15. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
16. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`

Avoid spending time in `target/`, `frontend/node_modules/`, and `var/logs/` unless the task is specifically about runtime output or build artifacts.
Also avoid `docs/ai/60-operations/session-orchestration/archive/` and `**/*example.md` unless a live-entry doc explicitly routes there.

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
  - full-stack frontend authoring source for routes, screen registry, page manifests, and framework contracts
- `modules`
  - reusable backend module lines
  - builder core, builder adapters, platform contracts, platform observability/help/runtime-control/version-control families
- `apps`
  - executable runtime assemblies
  - current executable app target under `apps/carbonet-app`
- `templates`
  - project bootstrap templates and install manifests
- `ops`
  - operational helpers such as cron-related assets
  - shared path variables under `ops/project-paths.sh`
  - reusable project scripts under `ops/scripts`
- `src`
  - legacy root Spring application source still being cut over
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
- `src/main/java/egovframework/com/platform`
  - 레거시 루트에 남아 있는 플랫폼 제어면 경로
  - 점진적으로 `modules/platform-*` 계열로 줄여나가는 전환 영역
- `modules/screenbuilder-core`
  - 빌더 공통 코어와 포트
- `modules/screenbuilder-runtime-common-adapter`
  - 프로젝트 공통 런타임 기본 어댑터
- `modules/screenbuilder-carbonet-adapter`
  - Carbonet 전용 빌더 어댑터와 브리지
- `modules/platform-*`
  - request/service contracts, help, observability, runtime-control, version-control 등 공통 플랫폼 모듈
- `apps/carbonet-app`
  - 실행 앱 조립과 부트스트랩 대상

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
- `templates/screenbuilder-project-bootstrap`
  - 빌더/프로젝트 bootstrap 템플릿과 install manifest

## Frontend

- `frontend/src/app`
  - app shell, routing, shared frontend composition
- `frontend/src/platform`
  - platform telemetry, manifest, observability, screen-registry source
- `frontend/src/framework`
  - frontend-facing full-stack contract boundary for builder, authority, and metadata
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
  - full-stack package and ownership map should be kept current when frontend/backend contract boundaries move
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

## Folder Alignment Rules

- 새 공통 플랫폼 백엔드 코드는 가능하면 `modules/` 아래에 둔다.
- 새 실행 조립 관련 코드는 `apps/` 아래에 둔다.
- 새 React authoring 소스는 `frontend/src/` 아래에 둔다.
- 새 bootstrap/install 자산은 `templates/` 아래에 둔다.
- 루트 `src/` 는 전환 경로로 보고, 이미 live module이 있는 family는 다시 루트로 키우지 않는다.
- 빌더 관련 공통 코어는 `screenbuilder-core`, 공통 기본정책은 `screenbuilder-runtime-common-adapter`, Carbonet 전용 연결은 `screenbuilder-carbonet-adapter` 를 우선한다.
- 빌더 구조 정리의 wave-level 완료 판단은 `docs/architecture/builder-structure-wave-20260409-closure.md` 를 source of truth로 본다.
- 루트 legacy builder 경로는 source of truth가 아니며, 남아 있다면 explicit shim 또는 제거 대상이다.
- 빌더 resource ownership continuation은 `builder-resource-ownership-current-closeout.md` 와 `builder-resource-ownership-queue-map.md` 를 먼저 보고 row별 review card로 들어간다.
- 위 두 문서는 `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` 의 single live entry pair 로 취급한다.
- blocker count, active row, next review target, partial-closeout wording이 바뀌면 위 두 문서를 같은 턴에 같이 갱신한다.

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
