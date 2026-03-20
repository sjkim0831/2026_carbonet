# Resonance 10-Session Assignment / 10세션 배정 문서

2026-03-21 기준 다중 계정 AI 실행 운영 문서입니다.

2026-03-21 작업 트리 기준 최신 정리를 반영했습니다.

이 상태 스냅샷은 저장소 변경 파일을 바탕으로 추정한 내용이며,
실시간 tmux 로그나 계정별 실행 로그는 아닙니다.

## 목표

운영자가 번호만 보고도 각 AI 세션을 시작, 추적, 넘길 수 있도록
겹치지 않는 단일 배정표를 제공합니다.

## 운영자 빠른 지시

- 운영자가 `N번에 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`라고 말하면 기본 대상은 항상 해당 번호 세션입니다
- 이 지시는 새 세션을 만들지 않고 해당 번호 세션에 이어 붙는 뜻으로 해석합니다
- 붙은 뒤에는 1분 주기로 마지막 미완료 작업을 확인하고, 가능하면 이어서 진행하고 아니면 같은 범위에서 재실행합니다
- 소유 범위나 선행 계약이 바뀌면 반복을 멈추고 `HANDOFF` 또는 `BLOCKED`로 상태를 먼저 갱신합니다

## 상태 코드

- `READY`: 시작 가능
- `IN_PROGRESS`: 진행 중
- `BLOCKED`: 막힘
- `HANDOFF`: 넘김 대기 또는 넘김 완료
- `DONE`: 완료

## 추정 진행 현황

각 작업 레인이 이 파일에서 직접 상태를 갱신하기 전까지 임시 운영 대시보드로 사용합니다.

| 세션 | 현재 상태 | 추정 진행률 | 오늘 목표 |
| --- | --- | ---: | --- |
| `01` 계약 조정 | `IN_PROGRESS` | `80%` | 공통 계약군을 마감하고 인계 기준 확정 |
| `02` 제안 및 요구 접수 | `IN_PROGRESS` | `78%` | 제안 흐름 계약과 프로토타입 연결 마감 |
| `03` 테마, 셸, 디자인 시스템 | `IN_PROGRESS` | `65%` | 공개/관리자 템플릿 라인과 테마 규칙 마감 |
| `04` 빌더 및 자산 스튜디오 | `IN_PROGRESS` | `68%` | 빌더/자산/화면 빌더 프로토타입 정합성 마감 |
| `05` 프런트엔드 런타임 및 운영자 UI | `READY` | `15%` | 동결 이후 리액트 구현 시작 대기 |
| `06` 백엔드 제어 평면 | `READY` | `10%` | 동결 이후 인터페이스와 서비스 구현 시작 대기 |
| `07` DB, SQL, 마이그레이션, 롤백 | `READY` | `15%` | `06` 인터페이스 윤곽이 또렷해진 뒤 DB 초안 보강 |
| `08` 배포, 런타임 패키지, 서버 | `IN_PROGRESS` | `55%` | 운영 흐름 문서와 반복 스크립트 기준 마감 |
| `09` 정합성, 비교, 복구, 검증 | `IN_PROGRESS` | `60%` | 정합성 점검표와 복구 계약/프로토타입 정리 |
| `10` 설치형 모듈 및 공통 계열 | `IN_PROGRESS` | `65%` | 모듈 선택 결과와 추적 연계 규칙 마감 |

## 비가역 기본 규칙

`01`만 공통 교차 계약 문서를 먼저 수정할 수 있습니다.

다른 세션은 해당 문서를 읽을 수는 있지만, `01`이 동결 처리하거나 넘기기 전에는 공통 계약 계열을 다시 쓰면 안 됩니다.

## 번호 세션

### 01. 계약 조정

- 상태: `IN_PROGRESS`
- 추정 진행률: `80%`
- 운영 메모: 공통 계약 문서군이 거의 정리됐고 인계 기준 마감이 남아 있습니다
- 목적: 공통 계약, 스키마, 점검표, 공통 규칙을 먼저 확정합니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/ai/80-skills`
- 금지 경로:
  - `/opt/projects/carbonet/frontend/src`
  - `/opt/projects/carbonet/src/main/java`
  - `/opt/projects/carbonet/src/main/resources/egovframework/mapper`
- 시작 시점:
  - 즉시
- 인계 대상:
  - `02`, `03`, `04`, `05`, `06`, `07`, `08`, `09`, `10`
- 핵심 범위:
  - 공통 스키마
  - 정합성/체크리스트 게이트
  - 공개/관리자 분리
  - 모듈 설치 규칙
  - 단계별 유도 규칙

### 02. 제안 및 요구 접수

- 상태: `IN_PROGRESS`
- 추정 진행률: `78%`
- 운영 메모: 제안 매핑, 인벤토리, 산출 흐름 문서와 프로토타입 연결이 진행 중입니다
- 목적: 제안 업로드, 매핑 초안, 인벤토리, 매트릭스, 시나리오/설계 산출 흐름을 정리합니다
- 붙기/반복 기준:
  - 운영자가 `2번 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`라고 말하면 항상 이 레인으로 해석합니다
  - 새 레인을 만들지 않고 현재 `02` 레인의 마지막 미완료 문서부터 이어갑니다
  - 약 1분마다 아래 반복 체크 순서대로 다시 확인합니다
- 반복 체크 순서:
  - `docs/architecture/project-proposal-generation-api-contracts.md`
  - `docs/architecture/project-proposal-generation-inventory-checklist.md`
  - `docs/architecture/project-proposal-generation-matrix.md`
  - `docs/architecture/project-scenario-and-design-output-contract.md`
  - `docs/prototypes/resonance-ui/proposal-mapping-draft.html`
  - `docs/prototypes/resonance-ui/project-proposal-inventory.html`
  - `docs/prototypes/resonance-ui/project-proposal-matrix.html`
  - `docs/prototypes/resonance-ui/project-scenario-output.html`
  - `docs/prototypes/resonance-ui/project-design-output.html`
- 반복 실행 규칙:
  - 위 문서 중 가장 마지막으로 수정한 항목과 연결된 미완료 계약 또는 프로토타입을 우선 이어갑니다
  - 계약 필드, 카운트, 화면 흐름이 서로 어긋나면 같은 레인 안에서 정합성부터 맞춥니다
  - 새 공통 계약이 필요해 `01` 소유 범위를 건드려야 하면 즉시 `BLOCKED` 또는 `HANDOFF`로 바꿉니다
  - `04`나 `09`가 바로 받을 수 있을 정도로 제안 흐름, 인벤토리, 매트릭스, 산출 흐름이 연결되면 `HANDOFF`로 넘깁니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
- 금지 경로:
  - 백엔드 소스
  - 프런트엔드 런타임 소스
- 시작 시점:
  - 즉시
- 선행 의존:
  - 새로운 공통 계약이 생기면 `01`
- 인계 대상:
  - `04`, `09`

### 03. 테마, 셸, 디자인 시스템

- 상태: `IN_PROGRESS`
- 추정 진행률: `65%`
- 운영 메모: 테마, 템플릿 라인, 셸 규칙 문서 정리가 진행 중입니다
- 목적: 공개/관리자 템플릿 라인, 테마 세트, 색상/폰트/간격/토큰, 셸 구성을 정리합니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/frontend`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
- 금지 경로:
  - 백엔드 소스
- 시작 시점:
  - 즉시
- 선행 의존:
  - 계열 규칙 변경이 있으면 `01`
- 인계 대상:
  - `04`, `05`, `09`

### 04. 빌더 및 자산 스튜디오

- 상태: `IN_PROGRESS`
- 추정 진행률: `68%`
- 운영 메모: 빌더/자산/화면 빌더 프로토타입이 계속 수정 중이라 아직 넘기기 완료 전입니다
- 목적: 테마 세트 스튜디오, 증분 자산 스튜디오, 화면 빌더, 페이지/요소/조합 거버넌스를 정리합니다
- 인계 기준:
  - 빌더 연계 계약 문서 추가 수정이 더 이상 필요 없다
  - 유도 흐름, 화면 빌더, 자산 스튜디오 관련 프로토타입이 1차 검토 가능한 상태다
  - `05`가 문서를 다시 뜯지 않고 화면 구현을 시작할 수 있다
  - `09`가 정합성/복구 기준으로 검토할 입력물이 준비돼 있다
  - `04` 범위의 열린 이슈가 새 작업이 아니라 메모로만 남아 있다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
  - `/opt/projects/carbonet/frontend/src/features`
- 금지 경로:
  - 명시적으로 넘겨받지 않은 백엔드 소스
- 시작 시점:
  - `01`이 빌더 연계 계약을 동결한 뒤
- 선행 의존:
  - `01`, `03`
- 인계 대상:
  - `05`, `09`

### 05. 프런트엔드 런타임 및 운영자 UI

- 상태: `READY`
- 추정 진행률: `15%`
- 운영 메모: `01` 동결 이후 리액트 기반 화면 작업을 시작합니다
- 목적: 리액트 운영 화면, 런타임 관리자 UI와 공개 UI의 일관성, 공통 기본 구성요소를 구현합니다
- 허용 경로:
  - `/opt/projects/carbonet/frontend/src`
  - `/opt/projects/carbonet/frontend/scripts`
- 금지 경로:
  - 넘겨받지 않은 공통 계약 문서
  - 백엔드 소스
- 시작 시점:
  - `01` 동결 이후
- 선행 의존:
  - `01`, `03`, `04`
- 인계 대상:
  - `09`

### 06. 백엔드 제어 평면

- 상태: `READY`
- 추정 진행률: `10%`
- 운영 메모: 계약은 있으나 구현은 아직 본격 시작 전입니다
- 목적: 제어 평면 인터페이스, 레지스트리, 수명주기, 비교, 보정, 릴리스 서비스를 구현합니다
- 허용 경로:
  - `/opt/projects/carbonet/src/main/java`
  - `/opt/projects/carbonet/src/main/resources/egovframework/mapper`
- 금지 경로:
  - 프런트엔드 소스
  - 넘겨받지 않은 공통 계약
- 시작 시점:
  - `01` 동결 이후
- 선행 의존:
  - `01`
- 인계 대상:
  - `07`, `09`

### 07. DB, SQL, 마이그레이션, 롤백

- 상태: `READY`
- 추정 진행률: `15%`
- 운영 메모: `06` 백엔드 인터페이스가 안정된 뒤 DB 초안 작업을 시작합니다
- 목적: SQL 초안, DB 기준, 마이그레이션, 롤백, 공통/프로젝트 DB 분리를 정리합니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/sql`
  - `/opt/projects/carbonet/docs/architecture`
- 금지 경로:
  - 프런트엔드 소스
  - `06`과 조율되지 않은 런타임 백엔드 소스
- 시작 시점:
  - `01` 동결 이후
- 선행 의존:
  - `01`, `06`
- 인계 대상:
  - `06`, `08`, `09`

### 08. 배포, 런타임 패키지, 서버

- 상태: `IN_PROGRESS`
- 추정 진행률: `55%`
- 운영 메모: 운영 흐름 문서, 배포 콘솔, 반복 스크립트 기준 정리가 진행 중입니다
- 목적: Jenkins/Nomad/Nginx, 런타임 패키지 매트릭스, 193->221 배포 흐름, 서버 세트 소유를 정리합니다
- 허용 경로:
  - `/opt/projects/carbonet/ops`
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
- 금지 경로:
  - 프런트엔드 런타임 소스
  - 넘겨받지 않은 백엔드 핵심 소스
- 시작 시점:
  - `01` 동결 이후
- 선행 의존:
  - `01`, `06`, `07`
- 인계 대상:
  - `09`

### 09. 정합성, 비교, 복구, 검증

- 상태: `IN_PROGRESS`
- 추정 진행률: `60%`
- 운영 메모: 점검표, 복구 계약, 누락 자산/비교 프로토타입 정리가 진행 중입니다
- 목적: 비교, 스모크 점검, 누락 자산 대기열, 복구 작업대, 정합성 및 일관성 검증을 정리합니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
  - `/opt/projects/carbonet/frontend/src/features`
- 금지 경로:
  - 넘겨받지 않은 백엔드 핵심 소스
- 시작 시점:
  - `02`, `04`, `05`, `06`, `08`의 초기 결과가 나온 뒤
- 선행 의존:
  - `01`, `02`, `04`, `05`, `06`, `08`
- 인계 대상:
  - `01`

### 10. 설치형 모듈 및 공통 계열

- 상태: `IN_PROGRESS`
- 추정 진행률: `65%`
- 운영 메모: 모듈 선택 문서와 프로토타입은 많이 진행됐고 백엔드 연계가 남아 있습니다
- 목적: 모듈 수집, 선택 팝업, 공통 JAR 구성, 메일/SMS/인증/결재/인장 공통 연동기를 정리합니다
- 허용 경로:
  - `/opt/projects/carbonet/docs/architecture`
  - `/opt/projects/carbonet/docs/prototypes/resonance-ui`
  - `/opt/projects/carbonet/src/main/java`
- 금지 경로:
  - 넘겨받지 않은 프런트엔드 런타임 소스
  - `01`과 조율되지 않은 공통 계약
- 시작 시점:
  - `01` 동결 이후
- 선행 의존:
  - `01`, `06`
- 인계 대상:
  - `08`, `09`

## 세션 실행 기준

세션을 `tmux`로 운영할 때는 기본 이름과 창 구성을 아래 기준으로 맞춥니다.

`tmux` 세션 이름:
- `res-01-contract`
- `res-02-proposal`
- `res-03-theme`
- `res-04-builder`
- `res-05-frontend`
- `res-06-backend`
- `res-07-db`
- `res-08-deploy`
- `res-09-verify`
- `res-10-module`

세션별 기본 `tmux` 창:
- `0: main` 메인 작업
- `1: audit` 점검/검토
- `2: notes` 메모
- `3: verify` 확인/검증

## 운영자 라우팅 규칙

AI에게 숫자만 말하면:

- 이 파일에서 해당 번호 섹션을 사용합니다
- 시작하면 그 섹션 상태를 `IN_PROGRESS`로 바꿉니다
- 끝나면 그 섹션 상태를 `HANDOFF` 또는 `DONE`으로 바꿉니다

AI에게 번호 대신 작업 내용을 말하면:

- 가장 가까운 번호 세션으로 매핑합니다
- 소유 범위가 실제로 바뀌지 않는 한 중복 작업 레인을 새로 만들지 않습니다

AI에게 `N에 붙어`, `0N에 붙어`, `N에 붙어서`, `0N에 붙어서`, `N번에 붙어`, `N번에 붙어서` 같은 번호 부착 표현을 말하면:

- 해당 번호 세션에 붙습니다
- 그 세션의 마지막 미완료 지점부터 이어갑니다
- 그 세션의 소유 범위, 허용 경로, 인계 순서, 경로 경계를 유지합니다
- 소유 범위가 실제로 바뀌지 않는 한 중복 작업 레인을 새로 열지 않습니다
- 표현 안에 `무한 반복`, `무한반복`, `1분마다 재실행`, `이어서 해줘`가 함께 있으면 새 세션을 열지 않고 같은 번호 세션에서 반복을 계속합니다

AI에게 `docs/ai/80-skills/resonance-10-session-assignment.md 붙어`, `resonance-10-session-assignment.md 붙어서`, `/opt/projects/carbonet/docs/ai/80-skills/resonance-10-session-assignment.md 붙어` 같은 파일 경로 부착 표현을 말하면:

- 이 문서를 붙기/반복 라우팅 기준으로 사용합니다
- 명시적인 번호 세션이 함께 있으면 그 번호가 우선합니다
- 그렇지 않으면 현재 활성 번호 세션이나 가장 최근에 붙은 번호 세션을 이어갑니다
- 파일 경로가 같이 나왔다는 이유만으로 중복 작업 레인을 새로 만들지 않습니다

AI에게 `무한 반복 1분마다 재실행` 또는 `1분마다 재실행 혹은 이어서 해줘`를 말하면:

- 현재 번호 세션이나 명시적으로 지정한 번호 세션에 그대로 머뭅니다
- 각 반복 사이에는 약 1분을 둡니다
- 각 반복마다 다음 확인 작업을 다시 실행하거나 마지막 미완료 지점부터 이어갑니다
- 병렬 중복 세션을 새로 만들지 않고 같은 세션 상태만 갱신합니다
- 운영자가 중지를 말하거나, 작업이 `DONE`이 되거나, 세션이 `BLOCKED` 되면 멈춥니다

예시:

- `N번에 붙어서 무한 반복 1분마다 재실행`
- `N번에 붙어서 이어서 해줘`
- `무한반복 N번에 붙어`
- `docs/ai/80-skills/resonance-10-session-assignment.md 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`
- `docs/ai/80-skills/resonance-10-session-assignment.md N번에 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`
- `resonance-10-session-assignment.md N번에 붙어서 이어서 해줘`

AI에게 `이어서 해줘`를 말하면:

- 현재 활성 번호 세션이 있으면 그 세션을 계속 진행합니다
- 현재 활성 세션이 없으면 가장 최근에 붙은 번호 세션을 이어갑니다
- 마지막 미완료 지점부터 재개하고 새 작업 레인은 열지 않습니다

AI에게 `무한반복 N번에 붙어서`, `N번에 붙어서 무한 반복` 같은 조합형 표현을 말하면:

- 해당 번호 세션에 붙습니다
- 같은 세션에서 1분 간격 재실행 또는 이어서 진행 규칙을 적용합니다
- 그 세션이 명시적으로 넘기기 전까지는 해당 소유 범위 안에서만 작업합니다

## 추가 계정 기준

추가 계정은 아래 경우에만 늘립니다:

- `04`와 `05`가 모두 포화된 경우
- `09`에 별도 런타임 수집 레인이 필요한 경우
- `10`에 공급자별 모듈 작업을 분리할 필요가 있는 경우

추가 선택 레인:

- `11. 런타임 수집`
- `12. 성능 및 캐시`
- `13. 스타일 및 토큰 점검`

## 함께 사용할 문서

다음 문서와 함께 사용합니다:

- [tmux-multi-account-delivery-playbook.md](/opt/projects/carbonet/docs/architecture/tmux-multi-account-delivery-playbook.md)
- 이 문서의 `운영자 라우팅 규칙` 섹션은 `붙어`, `붙어서`, `이어서 해줘`, `무한반복` 표현을 `tmux` 운영에 어떻게 해석할지 정한 기준입니다
- [resonance-ai-track-partition-map.md](/opt/projects/carbonet/docs/architecture/resonance-ai-track-partition-map.md)
- [guided-operator-build-flow.md](/opt/projects/carbonet/docs/architecture/guided-operator-build-flow.md)
