# Phase 1 Refactoring Kickoff Plan

## 1. 목표

1차 리팩터링의 목표는 아래 3개 영역을 `platform` 경계로 먼저 분리하는 것이다.

- `telemetry`
- `screen registry`
- `observability`

이번 단계에서는 업무 기능을 건드리지 않는다.
동작 변경 없이 구조 경계만 드러내는 것이 목적이다.

## 2. 범위

### 포함

#### Frontend

- `frontend/src/app/telemetry/*`
- `frontend/src/app/screen-registry/*`
- `frontend/src/lib/api/observability.ts`

#### Backend

- observability 관련 controller, service, dto 중 공통 운영 성격이 분명한 항목
- audit, trace 조회 API 연결부

### 제외

- `emission`
- `external monitoring`
- `member`, `company`, `education`
- `codex`, `workbench`, `runtimecontrol`
- `menu bootstrap` 대규모 재배치

## 3. 디렉터리 생성

### Frontend

- `frontend/src/platform/telemetry`
- `frontend/src/platform/screen-registry`
- `frontend/src/platform/observability`

### Backend

- `src/main/java/egovframework/com/platform/observability`

필요 시 하위:

- `controller`
- `service`
- `dto`

## 4. 파일 이동 계획

### Frontend 1차

현재:

- `app/telemetry/*`
- `app/screen-registry/*`
- `lib/api/observability.ts`

변경:

- `platform/telemetry/*`
- `platform/screen-registry/*`
- `platform/observability/observability.ts`

### Frontend import 정리 순서

1. 이동 대상 파일 복사 또는 이동
2. 내부 상대경로 import 수정
3. 라우트, feature 쪽 참조 import 수정
4. 타입 import 깨짐 점검
5. build 확인

## 5. API helper 정리

현재 `observability.ts`는 admin API 성격으로 보이므로 아래 방향으로 바꾼다.

- `buildAdminApiPath(...)` 사용 영역 점검
- 가능하면 `buildPlatformApiPath(...)` helper 추가
- 1차에서는 경로를 즉시 바꾸지 않아도 되지만 helper는 분리 시작

즉:

- 구조 분리
- 경로 분리는 준비
- 실제 endpoint rename은 2차

## 6. Backend 1차

### 대상 원칙

다음 조건을 만족하는 클래스만 우선 이동한다.

- 여러 프로젝트에서 공통으로 쓸 수 있다.
- 업무 도메인 계산, 입력, 승인 로직이 아니다.
- audit, trace 조회 또는 운영 진단 성격이 분명하다.

### 이동 방식

1. `platform/observability` 패키지 신설
2. controller, service, dto 이동
3. package 선언 변경
4. import 정리
5. 관련 config, component scan 영향 점검
6. 기존 API 경로는 유지

## 7. 검증 항목

### Frontend

- `cd frontend && npm run build`
- observability 화면 import 오류 없음
- page manifest import 오류 없음
- telemetry 관련 타입 오류 없음

### Backend

- `mvn -q -DskipTests package`
- observability API endpoint 기동 실패 없음
- actuator health 응답 가능
- audit, trace 조회 API 기본 응답 확인

### Runtime

구조 변경이 로컬 `:18000`에 반영되는 작업이면 아래 순서 사용:

1. `bash ops/scripts/build-restart-18000.sh`
2. `bash ops/scripts/codex-verify-18000-freshness.sh`

## 8. 리스크

1. `app` 아래 공용 코드가 사실상 여러 feature의 암묵적 루트 역할일 수 있다.
2. 상대경로 import가 많으면 이동 후 타입 깨짐이 연쇄 발생할 수 있다.
3. observability API가 admin prefix와 강결합일 수 있다.
4. backend observability 코드가 security config와 묶여 있을 수 있다.

## 9. 성공 기준

- `platform/telemetry`, `platform/screen-registry`, `platform/observability`가 생성된다.
- 기존 기능 동작은 바뀌지 않는다.
- 프런트 빌드와 백엔드 패키징이 통과한다.
- 이후 2차에서 `codex`, `workbench`, `runtimecontrol` 분리가 가능해진다.

## 10. 다음 단계

1차 완료 후 2차로 이동한다.

2차 대상:

- `platform/codex`
- `platform/workbench`
- `platform/runtimecontrol`

3차 대상:

- `platform/menu`
- `platform/auth`
- `platform/governance`

4차 대상:

- `project/carbonet/emission`
- `project/carbonet/monitoring`
- `project/carbonet/member`
