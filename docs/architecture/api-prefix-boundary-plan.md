# API Prefix Boundary Plan

## 1. 목적

이 문서는 `Carbonet Runtime`과 `Resonance Control Plane`의 API 경계를 URL 수준에서 분리하기 위한 기준안이다.

목표는 다음과 같다.

- 운영 통제 API와 프로젝트 업무 API를 분리한다.
- 공통 플랫폼 기능과 프로젝트 기능의 책임을 URL만 봐도 알 수 있게 한다.
- 이후 패키지 이동, 권한 분리, 메뉴 분리, 배포 분리를 쉽게 만든다.

## 2. 기본 원칙

### Platform API

여러 프로젝트를 공통 규칙으로 관리하거나 운영 통제 기능을 제공하는 API는 아래 prefix를 사용한다.

- `/api/platform/*`

예:

- `/api/platform/observability/*`
- `/api/platform/screen/*`
- `/api/platform/menu/*`
- `/api/platform/auth/*`
- `/api/platform/deploy/*`
- `/api/platform/runtime/*`
- `/api/platform/workbench/*`
- `/api/platform/codex/*`

### Project API

특정 프로젝트 업무를 처리하는 API는 아래 prefix를 사용한다.

- `/api/project/{projectCode}/*`

Carbonet 기준:

- `/api/project/carbonet/*`

예:

- `/api/project/carbonet/emission/*`
- `/api/project/carbonet/monitoring/*`
- `/api/project/carbonet/member/*`
- `/api/project/carbonet/company/*`
- `/api/project/carbonet/education/*`

## 3. 관리자 화면 URL 원칙

관리자 화면도 동일한 경계를 따라간다.

### Platform Admin

- `/admin/platform/*`

예:

- `/admin/platform/observability`
- `/admin/platform/environment`
- `/admin/platform/screen-builder`
- `/admin/platform/workbench`
- `/admin/platform/codex-request`

### Carbonet Admin

- `/admin/carbonet/*`

예:

- `/admin/carbonet/emission/management`
- `/admin/carbonet/external/monitoring`
- `/admin/carbonet/member/list`
- `/admin/carbonet/company/approve`

## 4. 1차 매핑 기준

| 기존 성격 | 신규 prefix |
|---|---|
| 감사, 추적, 진단 | `/api/platform/observability/*` |
| 화면 manifest, registry, builder | `/api/platform/screen/*` |
| 메뉴, 권한 거버넌스 | `/api/platform/menu/*`, `/api/platform/auth/*` |
| 환경, 서버, 배포, 런타임 제어 | `/api/platform/runtime/*`, `/api/platform/deploy/*` |
| Codex 실행, SR workbench | `/api/platform/codex/*`, `/api/platform/workbench/*` |
| 배출 관리 | `/api/project/carbonet/emission/*` |
| 외부 모니터링 | `/api/project/carbonet/monitoring/*` |
| 회원, 기업, 교육 | `/api/project/carbonet/member/*`, `/api/project/carbonet/company/*`, `/api/project/carbonet/education/*` |

## 5. 예시 경로 재설계

### Observability

기존:

- `/api/admin/observability/audit-events`
- `/api/admin/observability/trace-events`

변경:

- `/api/platform/observability/audit-events`
- `/api/platform/observability/trace-events`

### Screen / Builder

기존:

- `/api/admin/screen-builder/*`
- `/api/admin/screen-command-center/*`

변경:

- `/api/platform/screen/builder/*`
- `/api/platform/screen/command-center/*`

### Codex / Workbench

기존:

- `/api/admin/codex/*`
- `/api/admin/sr/*`

변경:

- `/api/platform/codex/*`
- `/api/platform/workbench/*`

### Emission

기존:

- `/api/admin/emission/*`

변경:

- `/api/project/carbonet/emission/*`

### External Monitoring

기존:

- `/api/admin/external/monitoring/*`

변경:

- `/api/project/carbonet/monitoring/*`

## 6. 프런트엔드 API 클라이언트 원칙

프런트에서는 API helper를 아래 기준으로 나눈다.

- `buildPlatformApiPath(...)`
- `buildProjectApiPath("carbonet", ...)`

금지:

- 운영 API와 업무 API를 같은 helper에서 구분 없이 생성
- `/api/admin/*`를 계속 범용 prefix처럼 사용

## 7. 권한 원칙

Platform API는 platform 권한으로 보호한다.
Project API는 project 권한으로 보호한다.

예:

- `PLATFORM_OBSERVABILITY_VIEW`
- `PLATFORM_DEPLOY_EXECUTE`
- `PROJECT_CARBONET_EMISSION_EDIT`
- `PROJECT_CARBONET_MONITORING_VIEW`

즉 권한도 URL 경계를 따라간다.

## 8. 마이그레이션 원칙

1. 기존 API를 즉시 제거하지 않는다.
2. 신규 prefix를 먼저 추가한다.
3. 프런트 클라이언트를 신규 prefix로 전환한다.
4. 메뉴, 라우트, 권한을 신규 prefix에 맞춘다.
5. 안정화 후 구 prefix를 제거한다.

## 9. 금지 사항

- `/api/admin/*`를 계속 모든 관리자 기능의 공용 prefix로 사용하지 않는다.
- platform API가 project-specific payload 구조를 직접 소유하지 않는다.
- project API가 배포, 운영, 거버넌스 기능을 직접 제공하지 않는다.

## 10. 완료 기준

- URL만 보고 platform, project 소속을 구분할 수 있다.
- 프런트 API client가 platform, project helper로 분리된다.
- 권한명이 URL 경계와 일치한다.
- 메뉴 URL과 실제 controller mapping이 일관된다.
