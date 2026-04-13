# Web Runtime Blue-Green Deploy

이 문서는 Carbonet 운영 배포에서 DB, JAR, 앱 포트, Nginx 웹서버, 외부 도메인 검증까지 하나의 추적 가능한 프로세스로 묶기 위한 기준이다.

## 목표

- 기존 서비스 포트를 죽이기 전에 candidate 포트를 먼저 띄운다.
- candidate가 내부 헬스 체크와 외부 도메인 smoke test를 통과한 뒤에만 Nginx 트래픽을 전환한다.
- 배포마다 DB 백업, DB diff SQL, JAR artifact, Nginx 설정, active/candidate 포트, rollback target을 manifest로 남긴다.
- 앱/web 롤백과 DB 롤백을 분리해서 판단한다.
- 실패한 배포도 원인과 중단 지점이 기록되게 한다.

## 기본 포트 모델

운영 서버는 최소 두 개의 앱 포트를 가진다.

- `18000`: 현재 active 또는 candidate 앱 포트
- `18001`: 현재 active 반대편 candidate 앱 포트

Nginx는 직접 Java 프로세스를 재시작하지 않는다. Nginx는 active upstream만 바라보고, 배포 스크립트가 candidate 포트를 검증한 후 upstream을 바꾼다.

## 표준 배포 흐름

1. 배포 lock을 잡는다.
2. `BACKUP_RUN_STAMP`를 만들고 배포 작업 폴더를 만든다.
3. 로컬 DB 백업을 생성한다.
4. 원격 DB 백업을 생성한다.
5. 로컬과 원격 DB schema diff를 생성한다.
6. DB patch history 테이블을 보장하고 diff SQL을 기록한다.
7. DB diff SQL을 적용한다.
8. DB diff closure verification을 수행한다.
9. frontend build와 Maven package를 수행한다.
10. JAR를 release archive에 저장하고 SHA-256을 기록한다.
11. git commit/push 또는 artifact publish를 수행한다.
12. 원격 서버에 candidate JAR를 배치한다.
13. 현재 active 포트의 반대 포트에 candidate 앱을 기동한다.
14. candidate 내부 헬스 체크를 수행한다.
15. candidate 주요 URL smoke test를 수행한다.
16. Nginx 설정을 백업하고 candidate upstream 설정을 준비한다.
17. `nginx -t`를 통과한 경우에만 Nginx reload를 수행한다.
18. 외부 도메인 기준 smoke test를 수행한다.
19. deploy manifest와 상태 테이블을 `SUCCESS`로 갱신한다.
20. 이전 active 앱은 grace 기간 후 정리하거나 rollback 대기 상태로 유지한다.
21. 배포 lock을 해제한다.

## Manifest

각 배포는 아래 파일을 반드시 남긴다.

```text
/opt/projects/carbonet/var/releases/YYYYMMDD-HHMMSS/deploy-manifest.json
```

Manifest 필수 필드는 다음과 같다.

- `releaseUnitId`: 화면/DB에서 사용하는 릴리스 단위 ID
- `deployTraceId`: 배포 추적 ID
- `projectId`: 프로젝트 ID
- `gitCommit`: 빌드 기준 commit
- `artifactPath`: 보관 JAR 경로
- `artifactSha256`: JAR SHA-256
- `backupFolder`: DB 백업 폴더
- `localDbSnapshot`: 로컬 DB 백업 SQL
- `remoteDbBeforeSnapshot`: 원격 DB 적용 전 백업 SQL
- `remoteDbAfterSnapshot`: 원격 DB 적용 후 백업 SQL
- `schemaDiffLocalToRemote`: 로컬에서 원격으로 적용한 diff SQL
- `schemaDiffRemoteToLocal`: 원격에서 로컬로 적용한 diff SQL
- `schemaDiffVerifyLocalToRemote`: 적용 후 검증 diff SQL
- `schemaDiffVerifyRemoteToLocal`: 적용 후 검증 diff SQL
- `nginxBeforeConfig`: 전환 전 Nginx 설정 백업
- `nginxAfterConfig`: 전환 후 Nginx 설정 백업
- `nginxConfigSha256`: 적용 Nginx 설정 SHA-256
- `previousActivePort`: 전환 전 active 포트
- `candidatePort`: candidate 포트
- `activePortAfterSwitch`: 전환 후 active 포트
- `rollbackArtifactPath`: 이전 JAR 경로
- `rollbackPort`: 즉시 되돌릴 포트
- `startedAt`: 배포 시작 시각
- `completedAt`: 배포 완료 시각
- `status`: `RUNNING`, `SUCCESS`, `FAILED`, `ROLLED_BACK`

## 상태 테이블 권장 모델

로그 파일만으로는 UI에서 추적하기 어렵다. 운영 화면은 아래 테이블 계층을 기준으로 조회하는 것이 좋다.

- `DEPLOY_RUN`: 배포 1회 실행의 상위 상태
- `DEPLOY_RUN_STEP`: 백업, diff, build, candidate start, Nginx switch 같은 단계별 상태
- `DB_PATCH_HISTORY`: DB diff SQL 적용 기록
- `DB_PATCH_HISTORY_DETAIL`: SQL 문 단위 또는 테이블 단위 세부 기록
- `DEPLOY_ARTIFACT_HISTORY`: JAR, SHA-256, git commit, archive path
- `WEB_ROUTE_SWITCH_HISTORY`: Nginx upstream 전환 기록

## 성공 게이트

아래가 모두 통과해야 운영 배포 성공으로 기록한다.

- 배포 lock 획득 성공
- 로컬 DB 백업 성공
- 원격 DB 백업 성공
- DB diff 생성 성공
- DB patch history 기록 성공
- DB diff 적용 성공
- 적용 후 diff closure verification 성공
- frontend build 성공
- Maven package 성공
- JAR archive 저장 및 SHA-256 기록 성공
- candidate 앱 기동 성공
- candidate 내부 `actuator/health` 성공
- candidate 주요 URL smoke test 성공
- Nginx 설정 백업 성공
- `nginx -t` 성공
- `nginx reload` 성공
- 외부 도메인 smoke test 성공
- deploy manifest `SUCCESS` 기록 성공

## 실패 정책

실패 시점별 처리 기준은 다르다.

- DB 백업 전 실패: 배포 중단, 롤백 불필요
- DB 백업 후 diff 실패: 배포 중단, 기존 웹 서비스 유지
- DB patch 실패: `DB_PATCH_HISTORY`에 `FAILED` 기록, 웹 전환 금지
- build/package 실패: DB 변경이 있었다면 forward fix 또는 백업 복구 판단 필요
- candidate 앱 실패: 기존 active 포트 유지
- `nginx -t` 실패: 기존 Nginx 설정 유지
- Nginx reload 후 외부 smoke 실패: 즉시 이전 upstream으로 되돌리고 `ROLLED_BACK` 기록

## 롤백 경계

앱/web 롤백과 DB 롤백은 같은 작업이 아니다.

- 앱/web 롤백: 이전 JAR 또는 이전 active 포트로 Nginx upstream을 되돌린다.
- DB 롤백: 백업 SQL 복원, rollback SQL 적용, 또는 forward fix 중 하나를 선택한다.
- DB 구조 변경이 이미 운영에 적용된 경우 앱만 롤백하면 구버전 앱과 신버전 DB 스키마가 충돌할 수 있다.
- `DROP`, `RENAME`, `MODIFY COLUMN` 계열은 반드시 `DB_PATCH_HISTORY`에 `DESTRUCTIVE`로 남기고 rollback 가능 여부를 manifest에 표시한다.

## Smoke Test 기준

내부 candidate 검증은 포트 직접 호출로 수행한다.

```bash
curl -fsS http://127.0.0.1:${CANDIDATE_PORT}/actuator/health
curl -fsSI http://127.0.0.1:${CANDIDATE_PORT}/home
curl -fsSI http://127.0.0.1:${CANDIDATE_PORT}/admin/system/version
```

외부 검증은 실제 도메인으로 수행한다.

```bash
curl -fsSI https://carbonet.duckdns.org/home
curl -fsSI https://carbonet.duckdns.org/admin/system/version
```

필요하면 로그인 필요 없는 read-only API를 smoke URL에 추가한다.

## Nginx 전환 규칙

- 전환 전 `/etc/nginx` 적용 파일을 release folder에 백업한다.
- 전환 후 생성될 설정 파일도 release folder에 저장한다.
- `nginx -t` 실패 시 reload하지 않는다.
- reload 후 외부 smoke test 실패 시 이전 upstream으로 되돌린다.
- Nginx 설정 변경은 배포 manifest에 hash로 남긴다.

## DB 자동 패치와 웹 전환의 관계

DB diff 자동 적용은 웹 전환보다 앞에 온다. 다만 DB patch 실패 또는 closure verification 실패가 있으면 candidate 앱을 띄우더라도 Nginx 전환은 금지한다.

운영에서 먼저 생긴 DB 변경은 `remote -> local` diff로 개발 DB에 반영한다. 개발에서 생긴 DB 변경은 `local -> remote` diff로 운영 DB에 반영한다. 양방향 모두 `DB_PATCH_HISTORY`에 남겨야 한다.

## 구현 우선순위

1. 배포 lock 추가
2. deploy manifest 생성 및 갱신
3. active/candidate 포트 탐지
4. candidate 포트 기동 스크립트 분리
5. 내부 health/smoke test 추가
6. Nginx 설정 백업, `nginx -t`, reload 자동화
7. 외부 도메인 smoke test 추가
8. 즉시 app/web rollback 스크립트 추가
9. `DEPLOY_RUN_STEP` 상태 기록 추가
10. `DB_PATCH_HISTORY_DETAIL` 문 단위 기록 추가

## 금지 사항

- candidate 검증 전에 active 앱을 먼저 중지하지 않는다.
- 내부 `127.0.0.1` 헬스 체크만으로 운영 성공 처리하지 않는다.
- Nginx 설정 백업 없이 reload하지 않는다.
- DB patch 실패 상태에서 웹 트래픽을 전환하지 않는다.
- JAR SHA-256 없이 artifact를 운영 반영하지 않는다.
- manifest 없이 rollback 가능하다고 표시하지 않는다.
