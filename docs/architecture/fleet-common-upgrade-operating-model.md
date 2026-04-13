# Fleet Common Upgrade Operating Model

이 문서는 Carbonet 공통 코어를 여러 프로젝트에 지속적으로 업데이트하기 위한 운영 기준이다. 목표는 프로젝트 adapter를 매번 고치지 않고도 공통 보안, 운영, UI, 배포, 관측 기능을 계속 유지보수하는 것이다.

## 핵심 입장

100개 프로젝트를 관리하려면 공통을 넓게 복사하는 방식이 아니라 좁고 안정적인 계약을 중심으로 운영해야 한다.

기본 분리는 다음과 같다.

- `COMMON_CORE`: 공통 구현. 자주 개선 가능.
- `STABLE_ADAPTER_CONTRACT`: 프로젝트 adapter가 바라보는 안정 port, DTO, manifest, capability key.
- `PROJECT_ADAPTER`: 프로젝트 DB, 메뉴, route, 정책, 업무 executor를 공통 계약에 연결하는 얇은 코드.
- `PROJECT_BUSINESS`: 프로젝트별 업무 로직과 데이터.
- `PROJECT_DB`: 프로젝트별 업무 DB.
- `COMMON_GOVERNANCE_DB`: 공통 artifact, release, 권한, 배포, 호환성, 감사 metadata.

공통 코어는 자주 바뀔 수 있지만, stable adapter contract는 천천히 바뀌어야 한다.

## 공통으로 유지하기 좋은 영역

- 인증, 세션, CSRF
- 권한, 기능 코드, 메뉴 shell
- 감사 로그, trace id, 실행 이력
- 공통 오류 응답, API envelope
- 공통 화면 프레임, 테이블, 폼, 버튼, 권한 컴포넌트
- 파일 업로드/다운로드 프레임
- 백업, 복구, 배포, 버전 관리 프레임워크
- 공통 보안 패치
- 운영 관측, 상태 점검, smoke test
- artifact registry와 release manifest

## 프로젝트에 남겨야 하는 영역

- 프로젝트별 업무 계산식
- 프로젝트별 승인/반려/정산/처리 흐름
- 프로젝트별 DB query와 schema detail
- 프로젝트별 기준정보
- 고객사별 화면 필드, 문구, 정책 override
- 프로젝트 데이터에 의존하는 성능 튜닝
- 데이터 삭제, 보정, destructive migration 판단

## 버전 정책

SemVer 기준으로 공통 업데이트 정책을 나눈다.

- `PATCH`: 하위 호환 버그 수정, 보안 패치, 내부 구현 개선. 자동 candidate 생성과 ring rollout 가능.
- `MINOR`: 하위 호환 기능 추가. 자동 candidate 생성은 가능하지만 broad rollout 전 운영 승인 필요.
- `MAJOR`: adapter contract, DTO 의미, API 의미, manifest 필수 필드, capability key가 깨질 수 있는 변경. 명시적 migration plan과 새 contract line 필요.

깨지는 변경은 기존 계약을 수정하지 말고 새 계약을 추가한다.

예시:

```java
public interface ProjectVersionPortV1 {
    VersionStatus getStatus(String projectId);
}

public interface ProjectVersionPortV2 {
    VersionStatus getStatus(String projectId, VersionQueryOptions options);
}
```

## Artifact Lock

각 프로젝트 release는 어떤 공통 artifact를 사용했는지 고정해야 한다.

```json
{
  "projectId": "carbonet",
  "releaseUnitId": "release-unit-carbonet-20260413-001",
  "artifacts": [
    {
      "groupId": "com.carbonet.platform",
      "artifactId": "platform-contract-api",
      "version": "1.1.0"
    },
    {
      "groupId": "com.carbonet.platform",
      "artifactId": "platform-common-core",
      "version": "1.2.4"
    },
    {
      "groupId": "com.carbonet.project",
      "artifactId": "project-carbonet-adapter",
      "version": "1.0.7"
    }
  ]
}
```

한 애플리케이션 런타임에는 같은 `groupId:artifactId`의 여러 버전을 동시에 넣지 않는다. 프로젝트마다 다른 공통 버전을 써야 하면 프로젝트 app/JVM/release artifact를 분리한다.

## Compatibility Matrix

공통 업데이트 후보마다 모든 프로젝트의 결과를 기록한다.

필수 컬럼:

- `projectId`
- `currentCommonCoreVersion`
- `targetCommonCoreVersion`
- `adapterContractVersion`
- `projectAdapterVersion`
- `buildStatus`
- `adapterContractStatus`
- `dbDiffStatus`
- `smokeStatus`
- `compatibilityStatus`
- `blockingReason`
- `rollbackReleaseUnitId`
- `testedAt`

예시 상태:

- `PASS`: 자동 ring rollout 가능
- `WARN`: operator 승인 필요
- `FAIL`: adapter-fix ticket 필요
- `BLOCKED`: contract migration 필요

## 표준 업데이트 흐름

1. 공통 변경을 `COMMON_CORE` 또는 `STABLE_ADAPTER_CONTRACT` 변경으로 분류한다.
2. contract 영향 분석을 실행한다.
3. 공통 artifact를 새 버전으로 publish한다.
4. 모든 프로젝트의 artifact lock을 target version으로 바꾼 candidate를 만든다.
5. 프로젝트별 빌드를 실행한다.
6. adapter contract check를 실행한다.
7. DB schema diff를 생성하되 destructive 변경은 별도 게이트로 분리한다.
8. 내부 smoke test를 실행한다.
9. 프로젝트별 compatibility matrix를 기록한다.
10. `PASS` 프로젝트만 ring rollout 대상으로 등록한다.
11. `FAIL` 프로젝트는 adapter-fix ticket으로 전환한다.
12. rollout 결과와 rollback anchor를 release governance에 기록한다.

## Ring Rollout

모든 프로젝트를 한 번에 운영 반영하지 않는다.

- `Ring 0`: 내부 샘플 또는 테스트 프로젝트 1개
- `Ring 1`: 영향이 낮은 운영 프로젝트 3-5개
- `Ring 2`: 일반 프로젝트 일부
- `Ring 3`: 전체 프로젝트

각 ring은 다음 조건을 통과해야 다음 ring으로 넘어간다.

- 배포 성공률 기준 충족
- 외부 smoke test 통과
- 주요 오류 로그 증가 없음
- rollback 발생 없음 또는 허용 범위 이내
- DB destructive patch 없음 또는 승인 완료

## 자동 업데이트 가능 조건

아래를 모두 만족하면 자동 업데이트 후보가 될 수 있다.

- SemVer가 `PATCH` 또는 승인된 `MINOR`
- adapter contract 변경 없음
- DTO 필드 삭제 없음
- API path 삭제 없음
- capability key 삭제/rename 없음
- manifest 필수 필드 삭제 없음
- DB destructive diff 없음
- 프로젝트 빌드 성공
- smoke test 성공
- rollback release unit 존재

## 자동 업데이트 금지 조건

아래 중 하나라도 있으면 자동 운영 반영하지 않는다.

- `MAJOR` 버전 변경
- adapter method signature 변경
- DTO 의미 변경
- API response 의미 변경
- capability key rename 또는 삭제
- destructive DB diff
- 프로젝트 business query 변경 필요
- smoke test 실패
- rollback anchor 없음

## 첫 구현 순서

가장 먼저 필요한 것은 코드 이동이 아니라 추적 기반이다.

1. `ARTIFACT_LOCK` 또는 release manifest에 공통 artifact 버전 기록
2. `PROJECT_COMPATIBILITY_RUN` 테이블 또는 JSON 파일 생성
3. 공통 artifact 변경 감지와 영향 분석 리포트 생성
4. 한 프로젝트 기준 candidate build 자동화
5. adapter contract check 최소판 구현
6. smoke URL 세트 정의
7. ring rollout 상태 모델 추가
8. 실패 프로젝트 adapter-fix ticket 생성 흐름 추가
9. 공통 patch release를 한 프로젝트에 반복 적용
10. 여러 프로젝트로 확장

## 최소 DB 모델

초기에는 아래 두 테이블만 있어도 시작할 수 있다.

```sql
CREATE TABLE ARTIFACT_LOCK (
  PROJECT_ID VARCHAR(80),
  RELEASE_UNIT_ID VARCHAR(120),
  GROUP_ID VARCHAR(160),
  ARTIFACT_ID VARCHAR(160),
  ARTIFACT_VERSION VARCHAR(80),
  ARTIFACT_SHA256 VARCHAR(128),
  CREATED_AT DATETIME,
  PRIMARY KEY (PROJECT_ID, RELEASE_UNIT_ID, GROUP_ID, ARTIFACT_ID)
);
```

```sql
CREATE TABLE PROJECT_COMPATIBILITY_RUN (
  RUN_ID VARCHAR(120) PRIMARY KEY,
  PROJECT_ID VARCHAR(80),
  SOURCE_RELEASE_UNIT_ID VARCHAR(120),
  TARGET_COMMON_VERSION VARCHAR(80),
  BUILD_STATUS VARCHAR(40),
  ADAPTER_CONTRACT_STATUS VARCHAR(40),
  DB_DIFF_STATUS VARCHAR(40),
  SMOKE_STATUS VARCHAR(40),
  COMPATIBILITY_STATUS VARCHAR(40),
  BLOCKING_REASON VARCHAR(4000),
  ROLLBACK_RELEASE_UNIT_ID VARCHAR(120),
  TESTED_AT DATETIME
);
```

이후 SQL 문 단위, smoke URL 단위, ring 단위 상세 테이블을 추가한다.

## AI 작업 원칙

AI가 공통을 수정할 때 기본 질문은 “이 프로젝트에서 동작하나?”가 아니라 “이 stable adapter contract를 쓰는 모든 프로젝트에서 깨지지 않나?”여야 한다.

필수 확인:

- 변경된 public interface
- 변경된 DTO field와 의미
- 변경된 API path와 response
- 변경된 capability key
- 변경된 manifest field
- 변경된 DB migration
- 변경된 frontend shared component prop

AI는 `PATCH` 업데이트에서는 프로젝트 adapter를 직접 고치지 않는 방향을 우선해야 한다. adapter 수정이 필요하면 그 common update는 더 이상 patch-safe가 아니며 compatibility matrix에 `FAIL` 또는 `CONTRACT_AWARE`로 기록한다.
