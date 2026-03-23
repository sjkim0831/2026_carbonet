# Two-Host Runtime Deploy

`136.109.238.233`에서 최신 소스를 pull 하고 빌드한 뒤, 운영 런타임 서버 `136.117.100.221`에 jar를 전송하고 `18000`을 재기동하는 운영 절차입니다.

## 목적

- 소스 빌드는 `233`에서만 수행
- 런타임 반영은 `221`에서만 수행
- 운영 반영 직전 `main` 서버와 유휴 서버 메모리/디스크 상태를 같이 확인

## 스크립트

- [deploy-193-to-221.sh](/opt/projects/carbonet/ops/scripts/deploy-193-to-221.sh)

## 준비

계정과 호스트만 고정하고, 비밀번호는 로그인 시에만 직접 입력합니다.

```bash
export GITHUB_TOKEN='<github token>'
export DEPLOY_REMOTE_USER='carbonet2026'
export DEPLOY_REMOTE_HOST='136.117.100.221'
```

필요하면 유휴 서버 목록도 조정합니다.

```bash
export IDLE_SSH_TARGETS='sjkim08314@34.82.132.175 sjkim08315@35.247.80.209'
```

## 실행

```bash
bash /opt/projects/carbonet/ops/scripts/deploy-193-to-221.sh
```

## 동작 순서

1. `233`에서 현재 운영 서버와 유휴 서버 메모리/디스크 스냅샷 확인
2. `origin/main` fetch
3. 임시 worktree를 만들고 최신 `main`만 분리 빌드
4. `frontend` 빌드
5. `mvn -q -DskipTests package`
6. 빌드된 `carbonet.jar`를 `221:/opt/projects/carbonet/target/carbonet.jar`로 교체
7. `221`에서 [restart-18000.sh](/opt/projects/carbonet/ops/scripts/restart-18000.sh) 실행
8. `221`에서 `http://127.0.0.1:18000/actuator/health` 확인

## 주의

- 토큰과 비밀번호는 스크립트에 하드코딩하지 않습니다.
- 비밀번호를 프롬프트나 `export` 예시에 넣지 않습니다.
- 현재 스크립트는 `DEPLOY_REMOTE_PASSWORD`가 비어 있으면 일반 `ssh` / `scp` 인증 흐름을 사용합니다.
- `221`의 `80` 포트 Nginx는 별도이며, 이 스크립트는 앱 jar 교체와 `18000` 재기동만 담당합니다.
- 메모리 부족 시 유휴 서버는 자동 전환하지 않습니다. 현재 스크립트는 용량 확인까지만 수행합니다.
- 로컬 작업트리가 더러워도, 배포 빌드는 임시 worktree에서 수행합니다.
- 유휴 서버를 실제 런타임으로 승격하려면 별도 Nginx/upstream/DB/서비스 스위치 절차가 필요합니다.
