# Carbonet / Resonance 기능 분류표

## 1. 목적

이 문서는 현재 저장소의 기능을 아래 두 영역으로 분류하기 위한 기준 문서다.

- `Carbonet Runtime`
- `Resonance Control Plane`

목표는 관리자 기능, 운영 기능, 공통 거버넌스 기능, 프로젝트 업무 기능이 한 경계 안에서 혼재되는 문제를 줄이는 것이다.

현재 진행 상태와 파일 단위 혼재 지점은 별도 상태 문서에서 추적한다.

- `docs/architecture/carbonet-resonance-separation-status.md`

## 2. 분류 원칙

### Carbonet Runtime

다음 조건에 해당하면 `Carbonet Runtime`으로 본다.

- Carbonet 프로젝트의 실제 업무 처리 기능이다.
- 탄소, 회원, 기업, 교육, 모니터링 등 프로젝트 고유 도메인 로직이다.
- 프로젝트 전용 DB 처리, 계산, 입력, 조회, 승인 흐름이다.
- 최종 사용자 또는 프로젝트 관리자 업무를 직접 수행한다.

### Resonance Control Plane

다음 조건에 해당하면 `Resonance Control Plane`으로 본다.

- 여러 프로젝트를 공통 규칙으로 관리한다.
- 메뉴, 화면, 컴포넌트, API, 권한, 배포를 거버넌스한다.
- 운영 콘솔, 설치 관리, 빌드, 배포, 검증, 롤백을 담당한다.
- 감사, 추적, 비교, 진단, 생성, 통제 기능을 담당한다.

### Mixed / Pending

다음 조건에 해당하면 보류한다.

- 이름상 관리자 기능이지만 실제로는 업무 기능과 운영 기능이 섞여 있다.
- 메뉴 bootstrap 안에 공통 정책과 업무 초기화 로직이 함께 있다.
- 화면은 공통 같지만 내부 데이터와 행위가 Carbonet 전용이다.

## 3. 영역별 1차 분류

| 기능군 | 세부 기능 | 분류 | 비고 |
|---|---|---|---|
| 배출 관리 | 배출량 입력, 계산, 저장, 결과 조회 | Carbonet Runtime | 핵심 업무 |
| 배출 계산 | 계산기, tier, factor, formula 처리 | Carbonet Runtime | 프로젝트 업무 엔진 |
| 외부 모니터링 | 센서, 사용량, 외부 데이터 조회 | Carbonet Runtime | 프로젝트 업무 |
| 회원/기업 | 회원 관리, 기업 승인, 담당자 관리 | Carbonet Runtime | 업무 관리자 기능 |
| 교육/인증 | 교육 신청, 수료, 인증서 처리 | Carbonet Runtime | 업무 기능 |
| 공통 로그인 | 세션, capability, 권한 해석 | Resonance 후보 | 공통 플랫폼화 대상 |
| 메뉴 관리 | 메뉴 코드, 트리, 화면 연결 | Resonance Control Plane | 공통 거버넌스 |
| 화면 메타 | page manifest, component registry | Resonance Control Plane | 공통 메타 자산 |
| 감사 로그 | audit event 저장, 조회 | Resonance Control Plane | 운영 감사 |
| 추적 로그 | traceId, API, 화면 상관관계 | Resonance Control Plane | 공통 관측 |
| 운영 진단 | 검색, 비교, 점검, 복구 | Resonance Control Plane | 통제 기능 |
| 배포 관리 | 빌드, 배포, 검증, 롤백 | Resonance Control Plane | 운영계 |
| Codex 실행 | runner, workbench, self-healing | Resonance Control Plane | 운영, 생성 계층 |
| 화면 생성 | screen builder, scaffold, design synthesis | Resonance Control Plane | 생성 플랫폼 |
| 환경 관리 | 서버, 환경, 토폴로지 관리 | Resonance Control Plane | 운영 거버넌스 |

## 4. 현재 코드 기준 후보 분류

### Resonance Control Plane 후보

#### Backend

- `ScreenCommandCenterServiceImpl`
- `ScreenBuilderDraftServiceImpl`
- `RuntimeControlPlaneServiceImpl`
- `CodexExecutionAdminServiceImpl`
- `CodexProvisioningServiceImpl`
- `SrTicketWorkbenchServiceImpl`
- `SrTicketCodexRunnerServiceImpl`
- `SrSelfHealingServiceImpl`
- `AdminEnvironmentManagementMenuBootstrap`
- `AdminUnifiedLogMenuBootstrap`
- `AdminSystemAuditLogMenuBootstrap`

#### Frontend

- `frontend/src/app/telemetry/*`
- `frontend/src/app/screen-registry/*`
- `frontend/src/lib/api/observability.ts`
- `frontend/src/lib/api/resonanceControlPlane.ts`
- `frontend/src/lib/api/environmentManagement.ts`
- `frontend/src/lib/api/screenBuilder.ts`

### Carbonet Runtime 후보

#### Backend

- `AdminEmissionManagementServiceImpl`
- `EmissionManagementQueryService`
- `EmissionCalculationApplicationService`
- `EmissionDefinitionMaterializationService`
- `EmissionInputSaveExecution`
- `EmissionInputSessionExecution`
- `EmissionTierListExecution`
- `CementEmissionCalculator`
- `LimeEmissionCalculator`
- `CarbonateFactorStrategy`
- `CorrectionFactorStrategy`

#### Frontend

- `frontend/src/features/external-monitoring/*`
- `frontend/src/features/emission-*`
- `frontend/src/features/member-*`
- `frontend/src/features/company-*`
- `frontend/src/features/education-*`
- `frontend/src/features/certificate-*`

## 5. 보류 대상

다음은 추가 판단이 필요하다.

| 대상 | 이유 | 임시 상태 |
|---|---|---|
| `Admin*MenuBootstrap` 일부 | 공통 메뉴 정책과 업무 초기화가 혼재 가능 | Pending |
| `AuthGroupManageServiceImpl` | 공통 권한인지 Carbonet 전용 권한인지 추가 판단 필요 | Pending |
| `MenuFeatureManageServiceImpl` | 메뉴 거버넌스와 업무 메뉴 관리 혼재 가능 | Pending |
| `AdminLoginHistoryServiceImpl` | 전 시스템 공통 보안 감사인지 업무 관리자 이력인지 추가 확인 필요 | Pending |

## 6. 이동 우선순위

1. `telemetry`, `observability`, `screen-registry`
2. `codex`, `workbench`, `runtimecontrol`
3. `menu`, `auth`, `governance`
4. `carbonet emission`, `monitoring`, `member` 업무 모듈

## 7. 금지 사항

- 이름만 보고 `platform` 또는 `project`를 판단하지 않는다.
- 패키지 이동 중 기능 동작을 동시에 바꾸지 않는다.
- `platform` 계층이 프로젝트 업무 규칙을 직접 소유하지 않는다.
- 업무 기능과 운영 기능을 같은 controller, service에서 계속 확장하지 않는다.

## 8. 다음 단계

- 클래스 단위 이동 매핑 확정
- API prefix 분리안 작성
- package structure 초안 반영
- 1차 리팩터링 대상부터 순차 이동
