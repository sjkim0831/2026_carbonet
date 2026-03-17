# Carbonet Menu Work Order WBS

기준일: 2026-03-17

기준 소스:

- `frontend/src/app/routes/definitions.ts`
- `docs/ai/20-ui/screen-index.csv`
- `data/full-stack-management/registry.json`

## 1. 현재 메뉴 인벤토리 요약

- 전체 라우트형 메뉴: 71개
- 홈/공개: 11개
- 가입 플로우: 11개
- 관리자: 49개

### 홈/공개 메뉴

| ID | 메뉴명 | 경로 |
| --- | --- | --- |
| home | 홈 | `/home` |
| signin-login | 로그인 | `/signin/loginView` |
| signin-auth-choice | 인증선택 | `/signin/authChoice` |
| signin-find-id | 아이디 찾기 | `/signin/findId` |
| signin-find-id-result | 아이디 찾기 결과 | `/signin/findId/result` |
| signin-find-password | 비밀번호 찾기 | `/signin/findPassword` |
| signin-find-password-result | 비밀번호 재설정 완료 | `/signin/findPassword/result` |
| signin-forbidden | 접근 거부 | `/signin/loginForbidden` |
| mypage | 마이페이지 | `/mypage` |
| sitemap | 사이트맵 | `/sitemap` |
| home-menu-placeholder | 사용자 메뉴 플레이스홀더 | `/placeholder` |

### 가입 메뉴

| ID | 메뉴명 | 경로 |
| --- | --- | --- |
| join-company-register | 공개 회원사 등록 | `/join/companyRegister` |
| join-company-register-complete | 회원사 등록 완료 | `/join/companyRegisterComplete` |
| join-company-status | 가입 현황 조회 | `/join/companyJoinStatusSearch` |
| join-company-status-guide | 가입 현황 안내 | `/join/companyJoinStatusGuide` |
| join-company-status-detail | 가입 현황 상세 | `/join/companyJoinStatusDetail` |
| join-company-reapply | 반려 재신청 | `/join/companyReapply` |
| join-wizard | 회원가입 위저드 | `/join/step1` |
| join-terms | 회원가입 약관 | `/join/step2` |
| join-auth | 회원가입 본인확인 | `/join/step3` |
| join-info | 회원가입 정보입력 | `/join/step4` |
| join-complete | 회원가입 완료 | `/join/step5` |

### 관리자 메뉴

| 묶음 | 메뉴 |
| --- | --- |
| 관리자 진입 | `admin-home`, `admin-login`, `admin-sitemap`, `admin-menu-placeholder` |
| 권한/계정 | `auth-group`, `auth-change`, `dept-role`, `admin-permission`, `admin-create`, `admin-list` |
| 회원/회원사 운영 | `member-list`, `member-detail`, `member-edit`, `member-approve`, `member-register`, `member-stats`, `company-list`, `company-detail`, `company-account`, `company-approve`, `password-reset`, `login-history` |
| 배출/업무 | `emission-result-list` |
| 시스템 운영 | `system-code`, `ip-whitelist`, `security-history`, `security-policy`, `security-monitoring`, `blocklist`, `security-audit`, `scheduler-management`, `observability` |
| 플랫폼/거버넌스 | `page-management`, `function-management`, `menu-management`, `full-stack-management`, `platform-studio`, `screen-elements-management`, `event-management-console`, `function-management-console`, `api-management-console`, `controller-management-console`, `db-table-management`, `column-management-console`, `automation-studio`, `environment-management`, `help-management`, `sr-workbench`, `codex-request` |

## 2. 추천 작업 순서

기준:

- 운영 영향도가 큰 화면을 먼저 안정화
- 다수 화면이 의존하는 공통 계약을 먼저 정리
- 관리자 거버넌스 화면은 뒤로 미루되, 메뉴/권한 체계는 너무 늦게 가지 않음

### Wave 0. 공통 진입 안정화

대상:

- `home`
- `signin-login`
- `admin-home`
- `admin-login`
- `sitemap`
- `admin-sitemap`
- `home-menu-placeholder`
- `admin-menu-placeholder`

이유:

- 모든 화면의 진입점이라 여기서 꼬이면 나머지 검증이 무의미함
- 현재 React shell, sitemap, placeholder 계열은 공통 라우팅과 캐시 영향이 큼

완료 기준:

- 직접 URL 진입, 새로고침, 국문/영문 전환, 비로그인/로그인 분기 확인
- fallback 메뉴와 실제 메뉴가 각각 정상 진입

### Wave 1. 공개 인증/회원가입 플로우

대상:

- `signin-auth-choice`
- `signin-find-id`
- `signin-find-id-result`
- `signin-find-password`
- `signin-find-password-result`
- `signin-forbidden`
- `join-wizard`
- `join-terms`
- `join-auth`
- `join-info`
- `join-complete`
- `join-company-register`
- `join-company-register-complete`
- `join-company-status`
- `join-company-status-guide`
- `join-company-status-detail`
- `join-company-reapply`

이유:

- 외부 사용자 유입 플로우라 장애 체감이 바로 큼
- 세션, CSRF, 인증수단, 파일 업로드, 다국어가 한 번에 엮임

완료 기준:

- 첫 단계부터 완료 단계까지 끊김 없이 이동
- 뒤로가기, 만료 세션, 반려 재신청, 가입현황 조회 예외 케이스 확인

### Wave 2. 관리자 권한/계정 체계

대상:

- `auth-group`
- `auth-change`
- `dept-role`
- `admin-permission`
- `admin-create`
- `admin-list`

이유:

- 이후 관리자 화면 접근권한의 기준 데이터
- 여기서 feature/menu 권한이 흔들리면 나머지 관리자 검증이 왜곡됨

완료 기준:

- VIEW 권한과 저장 권한이 구분 동작
- 비마스터 계정에서 grantable 범위 제한 확인
- 권한 저장 후 메뉴 노출과 API 사용 범위가 일치

### Wave 3. 회원/회원사 운영 핵심

대상:

- `member-list`
- `member-detail`
- `member-edit`
- `member-approve`
- `member-register`
- `member-stats`
- `company-list`
- `company-detail`
- `company-account`
- `company-approve`
- `password-reset`
- `login-history`
- `mypage`

이유:

- 실제 운영자가 가장 자주 쓰는 메뉴 묶음
- 조회, 상세, 수정, 승인, 비밀번호 초기화가 하나의 업무 흐름으로 이어짐

완료 기준:

- 목록 -> 상세 -> 수정 -> 승인 흐름이 모두 연결
- 엑셀/검색/필터/상세 이동 링크 이상 없음
- 회원/회원사 상태값 변경이 화면과 데이터에 일관 반영

### Wave 4. 시스템 보안/운영

대상:

- `system-code`
- `ip-whitelist`
- `security-history`
- `security-policy`
- `security-monitoring`
- `blocklist`
- `security-audit`
- `scheduler-management`
- `observability`
- `emission-result-list`

이유:

- 운영 리스크가 높지만 선행 권한체계와 회원 업무가 먼저 안정화되어야 점검 효율이 남
- 감사/추적/스케줄러는 장애 시 파급이 큼

완료 기준:

- 조회성 메뉴는 필터와 목록 렌더링 정상
- 정책 저장 메뉴는 권한, 감사로그, 저장 후 재조회까지 확인
- 스케줄러/추적 메뉴는 빈 상태와 데이터 존재 상태 모두 확인

### Wave 5. 플랫폼/거버넌스 관리

대상:

- `page-management`
- `function-management`
- `menu-management`
- `full-stack-management`
- `platform-studio`
- `screen-elements-management`
- `event-management-console`
- `function-management-console`
- `api-management-console`
- `controller-management-console`
- `db-table-management`
- `column-management-console`
- `automation-studio`
- `environment-management`
- `help-management`
- `sr-workbench`
- `codex-request`

이유:

- 운영 도구 성격이 강하고 상위 구조를 건드리므로 마지막에 묶어 처리하는 편이 안전함
- 일부는 아직 placeholder 또는 관리 콘솔 성격이라 우선순위를 뒤로 둬도 됨

완료 기준:

- 메뉴/기능/페이지/이벤트/API/DB 연계가 서로 끊기지 않음
- 관리 콘솔에서 저장한 메타데이터가 실제 화면과 권한 체계에 반영
- 도움말, SR, Codex 요청, 관측성 메뉴의 감사 추적 가능

## 3. 실행용 WBS

| WBS | 단계 | 대상 메뉴 | 산출물 | 선행조건 | 우선순위 |
| --- | --- | --- | --- | --- | --- |
| 1.0 | 공통 진입 안정화 | Wave 0 전체 | 진입/새로고침 체크리스트, 라우팅 수정사항 | 없음 | 최고 |
| 1.1 | React shell 점검 | `home`, `admin-home`, 로그인 2종 | shell/bootstrap 점검 결과 | 없음 | 최고 |
| 1.2 | 공통 탐색 점검 | `sitemap`, `admin-sitemap`, placeholder 2종 | 메뉴 진입 매핑표 | 1.1 | 최고 |
| 2.0 | 공개 인증/가입 | Wave 1 전체 | 공개 플로우 테스트 시나리오 | 1.0 | 높음 |
| 2.1 | 로그인/계정복구 | `signin-*` | 인증/세션 예외 목록 | 1.0 | 높음 |
| 2.2 | 회원가입 기본 플로우 | `join-wizard` ~ `join-complete` | 단계별 입력/검증 표 | 2.1 | 높음 |
| 2.3 | 회원사 가입/재신청 | `join-company-*` | 가입현황/재신청 검증표 | 2.2 | 높음 |
| 3.0 | 관리자 권한체계 | Wave 2 전체 | 권한 메뉴 매핑표 | 1.0 | 높음 |
| 3.1 | 권한그룹/권한변경 | `auth-group`, `auth-change`, `dept-role` | 저장/조회 검증 결과 | 3.0 | 높음 |
| 3.2 | 관리자 계정 | `admin-permission`, `admin-create`, `admin-list` | 계정/권한 연결 검증 | 3.1 | 높음 |
| 4.0 | 회원 운영 | Wave 3 전체 | 운영 핵심 메뉴 점검표 | 3.0 | 높음 |
| 4.1 | 회원 관리 | `member-*`, `password-reset`, `login-history` | 목록-상세-수정-승인 흐름표 | 4.0 | 높음 |
| 4.2 | 회원사 관리 | `company-*` | 회원사 수정/승인 검증표 | 4.0 | 높음 |
| 4.3 | 사용자 개인영역 | `mypage` | 사용자 셀프서비스 검증표 | 4.1 | 중간 |
| 5.0 | 시스템 운영 | Wave 4 전체 | 보안/운영 메뉴 점검표 | 4.0 | 중간 |
| 5.1 | 보안 정책/감사 | `security-*`, `blocklist`, `ip-whitelist` | 보안 운영 체크리스트 | 5.0 | 중간 |
| 5.2 | 스케줄/관측/업무 | `scheduler-management`, `observability`, `emission-result-list`, `system-code` | 운영성 메뉴 점검표 | 5.0 | 중간 |
| 6.0 | 플랫폼 거버넌스 | Wave 5 전체 | 메타관리 메뉴 점검표 | 3.0 | 중간 |
| 6.1 | 메뉴/기능/페이지 관리 | `page-management`, `function-management`, `menu-management`, `full-stack-management`, `environment-management` | 메뉴-기능-페이지 연계표 | 6.0 | 중간 |
| 6.2 | 개발 콘솔군 | `platform-studio`, `screen-elements-management`, `event-management-console`, `function-management-console`, `api-management-console`, `controller-management-console`, `db-table-management`, `column-management-console`, `automation-studio` | 콘솔별 readiness 판정 | 6.1 | 낮음 |
| 6.3 | 운영 보조도구 | `help-management`, `sr-workbench`, `codex-request` | 운영자 도구 검증표 | 6.1 | 낮음 |

## 4. 실제 착수 순서 제안

가장 현실적인 착수 순서는 아래와 같다.

1. Wave 0에서 진입점과 shell 문제를 먼저 닫는다.
2. Wave 1로 공개 사용자 플로우를 끝까지 점검한다.
3. Wave 2로 관리자 권한 체계를 정리한다.
4. Wave 3로 회원/회원사 운영 핵심 메뉴를 안정화한다.
5. Wave 4로 보안/운영 메뉴를 점검한다.
6. Wave 5로 거버넌스/메타관리 메뉴를 마지막에 묶어서 처리한다.

## 5. 메모

- `screen-route-map.csv` 는 아직 실질 인벤토리보다 비어 있어서 이번 문서는 `routes/definitions.ts` 기준으로 잡았다.
- `data/full-stack-management/registry.json` 에 자동 수집된 메뉴만 별도 검증 우선순위를 부여하면, `auth-group`, `member-list`, `company-account`, `auth-change`, `help-management` 부터 세부 점검을 시작하는 방식이 가장 효율적이다.
- 실제 구현 착수 시에는 각 Wave 시작 전에 `권한`, `국문/영문`, `새로고침`, `직접 URL 진입`, `POST/GET 호환`, `감사로그` 체크를 공통 항목으로 둔다.
