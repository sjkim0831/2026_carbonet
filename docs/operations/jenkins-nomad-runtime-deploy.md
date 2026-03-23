# Jenkins Nomad Runtime Deploy

이 문서는 `136.109.238.233`의 Jenkins가 저장소를 clone 받아 빌드하고, `136.117.100.221` 운영 서버에 무중단 배포한 뒤, 필요 시 유휴 서버를 Nomad로 확장/해제하는 기준 절차를 정리한다.

## 흐름

1. Jenkins가 2분 주기로 `main` 또는 지정 브랜치의 변경 여부를 확인한다.
2. 변경이 감지되면 `233`은 임시 작업 디렉터리에 fresh clone 을 만든다.
3. fresh clone 기준으로 프런트 `npm run build`, 백엔드 `mvn -q -DskipTests package` 를 수행한다.
4. 빌드가 끝나면 임시 clone 디렉터리는 삭제하고, 산출물 `carbonet.jar` 와 타임스탬프 jar 만 `233`의 `var/artifacts/jenkins` 아래에 보관한다.
5. Jenkins가 `221`에 jar 를 업로드한다.
6. `221`는 `ops/scripts/deploy-blue-green-221.sh` 로 `18001` 임시 기동 -> `nginx` 전환 -> `18000` 재기동 -> `nginx` 복귀 -> `18001` 종료 순서로 무중단 배포한다.
7. `221` 메모리 압박이 `warning/critical` 이면 `ops/scripts/scale-out-idle-runtime.sh` 가 jar 를 유휴 서버에 배포하고 Nomad job 을 실행한 뒤 `221` nginx upstream 에 유휴 서버를 추가한다.
8. 유휴 서버를 해제할 때는 `ops/scripts/restore-idle-node-state.sh` 로 먼저 `221` nginx 에서 idle upstream 을 제거한 뒤 Nomad job 을 중단하고 원래 job 상태를 복원한다.

## Jenkins Credentials

- `carbonet-github-token`
- `carbonet-main-ssh-password`
- `carbonet-idle-ssh-password`

유휴 서버 SSH 는 현재 `233`에서 직접 접속 가능하다는 전제를 둔다. 현재 스크립트는 `sshpass` 기반 비밀번호 접속도 지원한다.

## 운영 서버 전제

`221` nginx upstream block 안에는 main include 와 idle include 가 같이 들어 있어야 한다.

```nginx
upstream carbonet_app {
    include /etc/nginx/carbonet/carbonet-main-upstream.inc;
    include /etc/nginx/carbonet/carbonet-idle-upstream.inc;
}
```

초기 main include 예시:

```nginx
server 127.0.0.1:18000 max_fails=3 fail_timeout=10s;
```

idle include 비활성 예시:

```nginx
# Managed by write-idle-upstream.sh
# Idle upstream disabled.
```

추가 전제:

- `233` Jenkins 서버에 `sshpass` 설치
- `221`의 `carbonet2026` 계정은 `write-main-upstream.sh` 를 `sudo`로 실행할 수 있어야 함
- `221` nginx config 는 `/etc/nginx/carbonet/carbonet-main-upstream.inc`, `/etc/nginx/carbonet/carbonet-idle-upstream.inc` 를 실제 upstream block 안에서 읽어야 함

## Jenkins Trigger

- 기본 잡은 2분 주기 `TimerTrigger` 로 실행된다.
- 기본 잡 정의 [carbonet-deploy-job-config.xml](/opt/projects/carbonet/ops/jenkins/carbonet-deploy-job-config.xml) 는 `Pipeline` 인라인 스크립트 방식이라 Jenkins `git` 플러그인 없이도 동작한다.
- 잡은 실행 시 Jenkins 워크스페이스에 임시로 저장소를 clone 한 뒤 배포 스크립트를 실행하고, 완료 후 워크스페이스를 삭제한다.
- 잡은 `var/artifacts/jenkins/last-deployed-<branch>.txt` 에 직전 배포 커밋을 기록하고, 같은 커밋이면 fresh clone 이후 즉시 skip 한다.
- GitHub webhook 기반 즉시 실행으로 바꾸려면 Jenkins에 `git`/`github` 또는 `generic-webhook-trigger` 플러그인이 추가로 필요하다.

## Source Retention Policy

- `233` 빌드 서버에는 장기 보관용 소스 working tree 를 두지 않는다.
- 소스 정본은 GitHub 저장소에만 둔다.
- `221` 운영 서버와 유휴 서버에는 소스코드를 두지 않고 jar 만 배포한다.
- 빌드 서버에는 jar 아카이브와 직전 배포 커밋 메타데이터만 유지한다.
## Jenkins Parameters

- `BRANCH`
- `ENABLE_IDLE_SCALE`
- `ENABLE_IDLE_DRAIN`
- `DRAIN_IDLE_TARGET_IP`

## 주요 스크립트

- [jenkins-deploy-carbonet.sh](/opt/projects/carbonet/ops/scripts/jenkins-deploy-carbonet.sh)
- [deploy-blue-green-221.sh](/opt/projects/carbonet/ops/scripts/deploy-blue-green-221.sh)
- [write-main-upstream.sh](/opt/projects/carbonet/ops/scripts/write-main-upstream.sh)
- [scale-out-idle-runtime.sh](/opt/projects/carbonet/ops/scripts/scale-out-idle-runtime.sh)
- [restore-idle-node-state.sh](/opt/projects/carbonet/ops/scripts/restore-idle-node-state.sh)
