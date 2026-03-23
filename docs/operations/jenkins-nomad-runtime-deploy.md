# Jenkins Nomad Runtime Deploy

이 문서는 `136.109.238.233`의 Jenkins가 저장소를 clone 받아 빌드하고, `136.117.100.221` 운영 서버에 무중단 배포한 뒤, 필요 시 유휴 서버를 Nomad로 확장/해제하는 기준 절차를 정리한다.

## 흐름

1. Jenkins가 저장소 `main` 또는 지정 브랜치를 clone/fetch 한다.
2. 프런트 `npm run build`, 백엔드 `mvn -q -DskipTests package` 를 수행한다.
3. 산출물 `target/carbonet.jar` 를 `233`의 `var/artifacts/jenkins` 아래에 보관한다.
4. Jenkins가 `221`에 jar 를 업로드한다.
5. `221`는 `ops/scripts/deploy-blue-green-221.sh` 로 `18001` 임시 기동 -> `nginx` 전환 -> `18000` 재기동 -> `nginx` 복귀 -> `18001` 종료 순서로 무중단 배포한다.
6. `221` 메모리 압박이 `warning/critical` 이면 `ops/scripts/scale-out-idle-runtime.sh` 가 jar 를 유휴 서버에 배포하고 Nomad job 을 실행한 뒤 `221` nginx upstream 에 유휴 서버를 추가한다.
7. 유휴 서버를 해제할 때는 `ops/scripts/restore-idle-node-state.sh` 로 먼저 `221` nginx 에서 idle upstream 을 제거한 뒤 Nomad job 을 중단하고 원래 job 상태를 복원한다.

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
