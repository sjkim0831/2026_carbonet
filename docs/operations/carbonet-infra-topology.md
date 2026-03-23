# Carbonet Infra Topology

## 목적

Carbonet 운영을 위한 현재 서버 역할과 이후 확장 규칙을 고정합니다.

핵심 원칙은 다음과 같습니다.

- 관리 서버와 운영 서버를 분리한다.
- DB 서버는 항상 전용으로 둔다.
- 운영 2 서버는 보조 런타임이면서 파일/아카이브 성격도 함께 가진다.
- 시스템이 늘어날 때는 `운영 1 + 운영 2 + DB 1` 세트를 기본 단위로 추가한다.

운영자 세션 경계와 접속 프롬프트 표준은 [operator-session-map.md](/opt/projects/carbonet/docs/operations/operator-session-map.md)를 기준으로 관리한다.

## 현재 서버 역할

### 1. 관리 서버

- Host: `136.109.238.233`
- Account: `sjkim08312`
- 역할:
  - Nomad server
  - Jenkins
  - 운영 관리/control plane
  - 배포 기준 서버

이 서버는 앱 메인 런타임을 직접 처리하는 서버가 아니라 운영/배포/오케스트레이션을 담당하는 서버다.

### 2. Carbonet 운영 1 서버

- Host: `136.117.100.221`
- Account: `carbonet2026`
- 역할:
  - Carbonet main runtime
  - `nginx :80`
  - 앱 런타임 `:18000`

현재 Carbonet 서비스의 실사용 런타임 서버다.

### 3. Carbonet DB 전용 서버

- Host: `34.82.141.193`
- Name: `carbonetdb`
- 역할:
  - DB 전용
  - CUBRID
  - CAS / broker

DB 서버에는 Jenkins, Nomad client, 일반 웹 런타임을 섞지 않는다.

### 4. 유휴 서버 1

- Host: `34.82.132.175`
- Account: `sjkim08314`
- 역할:
  - idle server
  - 추후 Nomad client
  - 추후 보조 운영 서버
  - 추후 파일/아카이브 보조

### 5. 유휴 서버 2

- Host: `35.247.80.209`
- Account: `sjkim08315`
- 역할:
  - idle server
  - 추후 Nomad client
  - 추후 보조 운영 서버
  - 추후 파일/아카이브 보조

## 현재 배치도

```text
                        [ 136.109.238.233 ]
                        sjkim08312
                  Nomad Server + Jenkins + Ops
                               |
                               |
                 build / deploy control / orchestration
                               |
                               v
                        [ 136.117.100.221 ]
                        carbonet2026
                  Nginx :80 + Carbonet :18000
                               |
                               |
                               v
                        [ 34.82.141.193 ]
                           carbonetdb
                    CUBRID + CAS/Broker only

          standby / expansion:
          - 34.82.132.175 (sjkim08314)
          - 35.247.80.209 (sjkim08315)
```

## Nomad 배치 전략

### 현재

- `136.109.238.233`
  - Nomad server

### 후보 client

- `136.117.100.221`
  - 필요 시 Nomad client 편입 가능
  - 다만 현재는 운영 1 역할이 우선

- `34.82.132.175`
  - Nomad client 후보

- `35.247.80.209`
  - Nomad client 후보

### 원칙

- Nomad server는 관리 서버에 둔다.
- DB 서버에는 Nomad를 두지 않는다.
- 운영 1, 운영 2, 유휴 서버는 Nomad client 후보로 본다.

## Carbonet 배포 흐름

현재 권장 흐름은 다음과 같다.

1. 관리 서버 `136.109.238.233`에서 최신 소스를 가져온다.
2. 관리 서버에서 빌드한다.
3. 승인된 jar만 운영 1 서버 `136.117.100.221`로 보낸다.
4. 운영 1 서버에서 `18000`을 재기동한다.
5. `nginx :80`은 운영 1 서버에서 앱으로 연결한다.
6. DB 연결은 `34.82.141.193` 전용 서버를 사용한다.

관련 스크립트:

- [check-runtime-pressure.sh](/opt/projects/carbonet/ops/scripts/check-runtime-pressure.sh)
- [deploy-193-to-221.sh](/opt/projects/carbonet/ops/scripts/deploy-193-to-221.sh)
- [restart-18000.sh](/opt/projects/carbonet/ops/scripts/restart-18000.sh)
- [start-18000.sh](/opt/projects/carbonet/ops/scripts/start-18000.sh)

## 리소스 부족 판단 기준

운영 1 서버가 부족한지 여부는 추정이 아니라 아래 지표로 판단한다.

- 가용 메모리 `<= 384MB`: 경고
- 가용 메모리 `<= 256MB`: 심각
- 루트 디스크 사용률 `>= 85%`: 경고
- 루트 디스크 사용률 `>= 92%`: 심각
- 1분 load / 코어 수 `>= 1.50`: 경고
- 1분 load / 코어 수 `>= 2.50`: 심각
- `:18000` 앱 RSS `>= 650MB`: 경고
- `:18000` 앱 RSS `>= 800MB`: 심각

점검 스크립트:

```bash
bash /opt/projects/carbonet/ops/scripts/check-runtime-pressure.sh carbonet2026@136.117.100.221
bash /opt/projects/carbonet/ops/scripts/check-runtime-pressure.sh sjkim08314@34.82.132.175
```

여러 서버를 한 번에 볼 때:

```bash
bash /opt/projects/carbonet/ops/scripts/check-runtime-pressure.sh \
  carbonet2026@136.117.100.221 \
  sjkim08314@34.82.132.175
```

출력 해석:

- `severity=healthy`: 현재 기준으로 여유 있음
- `severity=warning`: 유휴 서버 편입 준비 검토
- `severity=critical`: 즉시 유휴 서버 할당 또는 트래픽 완화 검토

종료 코드는 아래를 따른다.

- `0`: healthy
- `10`: warning
- `20`: critical

`deploy-193-to-221.sh`는 배포 시작 전에 운영 서버와 유휴 서버에 대해 이 체크를 함께 출력한다.

## 운영 2 서버 추가 원칙

운영 2 서버가 추가되면 역할은 다음 두 가지를 함께 가진다.

- 보조 런타임
- 파일/아카이브 서버

즉 운영 2는 다음 데이터를 받는 후보가 된다.

- 오래된 파일
- 자주 안 쓰는 파일
- 아카이브 데이터
- 보조 작업/배치성 실행 자원

운영 1은 핫 경로에 집중하고, 운영 2는 콜드 파일과 보조 런타임을 받는다.

## 시스템 추가 시 확장 규칙

새로운 시스템이 추가될 때는 아래 3개 세트를 기본 단위로 추가한다.

- 운영 1
- 운영 2
- DB 1

관리 서버는 가급적 공통 control plane으로 유지한다.

즉 시스템별 기본 배치는 다음을 따른다.

```text
System N
- 운영 1: main runtime
- 운영 2: sub runtime + file/archive
- DB 1: dedicated DB
```

## 권장 역할 분리

### 관리 서버

- Jenkins
- Nomad server
- 배포 스크립트
- 운영자 접속 지점

### 운영 1

- Nginx
- 메인 앱
- 핫 파일 경로

### 운영 2

- 보조 앱
- 오래된 파일
- 저빈도 파일
- 필요 시 Nomad client

### DB 1

- CUBRID
- CAS/Broker
- 백업/복구

## 비권장

- DB 서버에 Jenkins 설치
- DB 서버에 Nomad client 설치
- 관리 서버를 운영 메인 런타임과 혼용
- 운영 1 서버에 오래된 파일을 계속 누적

## 다음 단계

현재 구조에서 바로 이어서 할 작업은 다음 순서가 적합하다.

1. Nomad ACL 및 기본 보안 설정
2. 유휴 서버 2대를 Nomad client 후보로 정리
3. Jenkins 배포 파이프라인을 `136.117.100.221` 반영 흐름과 연결
4. 운영 2 서버 추가 시 파일/보조 런타임 정책 분리

## 리소스 부족 시 유휴 서버 편입 흐름

`233`에서 운영 1 서버 리소스를 관찰하다가 `warning` 또는 `critical`이 나오면, 아래 순서로 유휴 서버를 임시 런타임으로 편입한다.

1. [check-runtime-pressure.sh](/opt/projects/carbonet/ops/scripts/check-runtime-pressure.sh)로 `221` 상태를 확인한다.
2. [scale-out-idle-runtime.sh](/opt/projects/carbonet/ops/scripts/scale-out-idle-runtime.sh)로 `221`의 현재 `jar`를 유휴 서버로 복사한다.
3. [render-idle-nomad-job.sh](/opt/projects/carbonet/ops/scripts/render-idle-nomad-job.sh)로 만든 Nomad job을 유휴 서버에서 실행한다.
4. 유휴 서버 `:18000/actuator/health`가 올라오면 `221`의 Nginx upstream 관리 include를 갱신한다.
5. `nginx -t`와 reload가 성공하면 유휴 서버를 트래픽 풀에 포함한다.

관련 스크립트:

- [scale-out-idle-runtime.sh](/opt/projects/carbonet/ops/scripts/scale-out-idle-runtime.sh)
- [render-idle-nomad-job.sh](/opt/projects/carbonet/ops/scripts/render-idle-nomad-job.sh)
- [write-idle-upstream.sh](/opt/projects/carbonet/ops/scripts/write-idle-upstream.sh)
- [save-idle-node-state.sh](/opt/projects/carbonet/ops/scripts/save-idle-node-state.sh)
- [switch-idle-node-to-carbonet.sh](/opt/projects/carbonet/ops/scripts/switch-idle-node-to-carbonet.sh)
- [restore-idle-node-state.sh](/opt/projects/carbonet/ops/scripts/restore-idle-node-state.sh)

### Nginx 전제조건

`221`의 메인 Nginx upstream block 안에는 아래처럼 관리 include 파일이 들어 있어야 한다.

```nginx
upstream carbonet_app {
    server 127.0.0.1:18000 max_fails=3 fail_timeout=10s;
    include /etc/nginx/conf.d/carbonet-idle-upstream.conf;
}
```

초기 비활성 상태의 include 파일은 아래처럼 둘 수 있다.

```nginx
# Managed by write-idle-upstream.sh
# Idle upstream disabled.
```

### 실행 예시

```bash
bash /opt/projects/carbonet/ops/scripts/scale-out-idle-runtime.sh
```

기본값은 `175`를 대상으로 잡고 있으며, `209`로 바꾸려면 실행 전에 아래 값을 조정한다.

```bash
export IDLE_TARGET='sjkim08315@35.247.80.209'
export IDLE_HTTP_HOST='35.247.80.209'
bash /opt/projects/carbonet/ops/scripts/scale-out-idle-runtime.sh
```

## `175` 수정용 전환과 복원

`175`를 수정용으로 잠깐 쓰려면, `233`에서 기존 유휴 작업 상태를 저장한 뒤 Carbonet 수정용 job으로 전환하고, 작업이 끝나면 원래 상태를 복원한다.

전제:

- `233`에서 `nomad`, `jq`, `curl`, `ssh`, `scp`가 가능해야 한다.
- `233`의 Nomad는 `http://127.0.0.1:4646`에서 접근 가능해야 한다.
- `175`의 기존 유휴 작업도 가급적 Nomad job으로 관리해야 복원이 단순하다.
- `221` Nginx는 앞 절의 managed include 구성을 가져야 한다.

상태 저장:

```bash
bash /opt/projects/carbonet/ops/scripts/save-idle-node-state.sh 34.82.132.175
```

수정용 전환:

```bash
bash /opt/projects/carbonet/ops/scripts/switch-idle-node-to-carbonet.sh
```

이 스크립트는 아래를 수행한다.

1. `175`에 배치된 현재 Nomad job spec 저장
2. 저장된 job 정지
3. `233`의 최신 `jar`를 `175`로 복사
4. `175`에서 Carbonet Nomad job 기동
5. `175` health 확인
6. `221` Nginx upstream에 `175` 포함

복원:

```bash
bash /opt/projects/carbonet/ops/scripts/restore-idle-node-state.sh
```

이 스크립트는 아래를 수행한다.

1. `221` Nginx에서 `175` 제외
2. Carbonet idle job 정지
3. 저장해둔 기존 Nomad job spec 재실행

저장 경로는 로컬 전용인 `/opt/projects/carbonet/ops/state/idle-node` 아래를 사용하며, `.gitignore`로 제외한다.
