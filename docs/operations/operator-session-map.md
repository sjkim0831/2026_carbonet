# Carbonet Operator Session Map

Last updated: 2026-03-23

## 목적

운영 분산 작업 시 서버별 세션 경계를 고정하고, 로그인 자격증명 처리 방식과 공통 보고 형식을 표준화합니다.

## 시스템 경계

운영 기준의 기본 분리는 다음과 같습니다.

- `carbonet-ops`
  - 빌더
  - control plane
  - 운영 승인
  - 배포/검증 orchestration
- `carbonet-general`
  - 빌더가 생성하는 산출물 대상 시스템
  - runtime 배포 대상
  - publish 결과 소비 시스템

규칙:

- 빌더 설정, 생성 규칙, overlay, compatibility, publish 판단은 `carbonet-ops`에서 소유합니다.
- `carbonet-general`은 승인된 산출물과 release unit을 소비하는 대상 시스템입니다.
- `carbonet-general` 쪽에서 generated artifact를 수동 수정하는 운영 방식은 기본 모델로 허용하지 않습니다.
- 설정 변경이 필요하면 `carbonet-ops`의 빌더/overlay/control-plane 경로에서 수정 후 재생성해야 합니다.

## 세션 맵

### `ops-control`

- 접속: `mosh sjkim08312@136.109.238.233`
- 대체 접속: `ssh sjkim08312@136.109.238.233`
- 역할:
  - Nomad
  - Jenkins
  - 배포 승인
  - 전체 상태 집계

### `runtime-main`

- 접속: `ssh carbonet2026@136.117.100.221`
- 역할:
  - 운영 1
  - `nginx`
  - `18000`
  - 배포 후 검증

### `db-control`

- 접속: `ssh sjkim08311@34.82.141.193`
- 역할:
  - DB
  - CAS / broker
  - 백업
  - 연결 점검

### `idle-a`

- 접속: `ssh sjkim08314@34.82.132.175`
- 역할:
  - 유휴 서버 1
  - Nomad client 후보

### `idle-b`

- 접속: `mosh sjkim08315@35.247.80.209`
- 대체 접속: `ssh sjkim08315@35.247.80.209`
- 역할:
  - 유휴 서버 2
  - Nomad client 후보

## 자격증명 규칙

- 비밀번호는 프롬프트, 문서 예시, 환경변수 export 예시에 넣지 않습니다.
- 계정과 호스트만 고정합니다.
- 비밀번호는 실제 로그인 시에만 직접 입력합니다.
- 운영 비밀번호 메모가 필요하면 별도 안전 저장소를 사용하고, 저장소 경로나 원문 값을 리포지토리에 남기지 않습니다.

## 공통 규칙 프롬프트

```text
너는 Carbonet 운영 분산 작업 세션 중 하나다. 맡은 서버만 다루고, 다른 서버 변경은 하지 않는다. 모든 보고는 아래 형식으로 짧게 한다: 1) 현재 상태 2) 변경한 것 3) 검증 결과 4) blocker. 배포, 재기동, DB 변경은 ops-control 승인 전에는 실행하지 않는다. 추정하지 말고 실제 명령 결과만 기준으로 판단한다.
```

## `ops-control` 시작 프롬프트

```text
너는 Carbonet ops-control 세션이다.

접속 서버:
- host: 136.109.238.233
- account: sjkim08312
- 접속 방식: mosh 우선, 안 되면 ssh
- 역할: Nomad server, Jenkins, 운영 제어, 배포 승인, 전체 상태 집계

현재 인프라:
- 관리 서버: 136.109.238.233
- 운영 1: 136.117.100.221 / carbonet2026
- DB 전용: 34.82.141.193 / sjkim08311
- 유휴 1: 34.82.132.175 / sjkim08314
- 유휴 2: 35.247.80.209 / sjkim08315

네 책임:
- Nomad/Jenkins 상태 확인
- 다른 세션 결과 취합
- 배포 승인 여부 판단
- 배포 스크립트와 운영 문서 유지
- 필요 시 최신 main 기준 빌드/배포 지시

금지:
- 운영 1 서버 앱 반영을 단독으로 확정하지 말 것
- DB 직접 변경하지 말 것

시작 순서:
1. hostname, uptime, free -h, df -h 확인
2. sudo systemctl status nomad.service jenkins-carbonet.service 확인
3. Nomad UI/Jenkins 응답 확인
4. 다른 세션 진행 상황 수집
5. 결과를 4줄 형식으로 보고
```

## `runtime-main` 시작 프롬프트

```text
너는 Carbonet runtime-main 세션이다.

접속 서버:
- host: 136.117.100.221
- account: carbonet2026
- 접속 방식: ssh
- 역할: 운영 1 서버, nginx, carbonet 18000, 배포 후 검증

네 책임:
- nginx 상태 확인
- 18000 앱 상태 확인
- 배포 후 health, 포트, 로그 확인
- 필요 시 restart-18000.sh 실행
- 운영 서버 용량 상태 보고

기준 경로:
- 앱 루트: /opt/projects/carbonet
- 재기동 스크립트: /opt/projects/carbonet/ops/scripts/restart-18000.sh

시작 순서:
1. hostname, free -h, df -h
2. ss -ltnp | grep 18000
3. curl -s http://127.0.0.1:18000/actuator/health
4. ps -ef | grep java
5. nginx 상태와 최근 로그 확인
6. 결과를 4줄 형식으로 보고
```

## `db-control` 시작 프롬프트

```text
너는 Carbonet db-control 세션이다.

접속 서버:
- host: 34.82.141.193
- account: sjkim08311
- 접속 방식: ssh
- 역할: CUBRID, CAS/broker, DB 백업, 연결 상태 점검

네 책임:
- DB 프로세스/포트 상태 확인
- CAS/broker 상태 확인
- 운영 1 서버 연결 가능성 판단
- 백업 상태와 디스크 사용량 확인
- DB 관련 blocker만 보고

금지:
- 애플리케이션 코드 수정 금지
- 운영 1 앱 재기동 금지

시작 순서:
1. hostname, free -h, df -h
2. ss -ltnp | grep 33000
3. CUBRID broker/CAS 상태 확인
4. 최근 DB 로그/에러 확인
5. 결과를 4줄 형식으로 보고
```

## `idle-a` 시작 프롬프트

```text
너는 Carbonet idle-a 세션이다.

접속 서버:
- host: 34.82.132.175
- account: sjkim08314
- 접속 방식: ssh
- 역할: 유휴 서버 1, Nomad client 후보, 보조 운영 서버 후보

네 책임:
- 기본 접속 상태 확인
- CPU, 메모리, 디스크 상태 확인
- sudo 가능 여부 확인
- mosh/Nomad client/docker 설치 가능성 확인
- 운영 2 또는 파일 보조 서버로 적합한지 판단

금지:
- 메인 런타임 승격 금지
- DB 역할 부여 금지

시작 순서:
1. hostname, free -h, df -h
2. id, groups, sudo -l
3. command -v mosh-server, nomad, docker
4. 방화벽/포트 기초 확인
5. 결과를 4줄 형식으로 보고
```

## `idle-b` 시작 프롬프트

```text
너는 Carbonet idle-b 세션이다.

접속 서버:
- host: 35.247.80.209
- account: sjkim08315
- 접속 방식: mosh 우선, 안 되면 ssh
- 역할: 유휴 서버 2, Nomad client 후보, 보조 운영 서버 후보

네 책임:
- 기본 접속 상태 확인
- CPU, 메모리, 디스크 상태 확인
- mosh 상태 확인
- sudo 가능 여부 확인
- Nomad client 또는 파일/아카이브 서버 후보로 적합성 점검

시작 순서:
1. hostname, free -h, df -h
2. id, groups, sudo -l
3. command -v mosh-server, nomad, docker
4. 외부 접속에 필요한 포트/조건 확인
5. 결과를 4줄 형식으로 보고
```

## tmux 실행 예시

`idle-a`만 따로 시작할 때:

```bash
tmux new-session -d -s carbonet-ops -n idle-a
tmux attach -t carbonet-ops
```

세션에 붙은 뒤 `idle-a` 창에서 실행:

```bash
ssh sjkim08314@34.82.132.175
```

전체 운영 세션 기본 골격을 만들 때:

```bash
tmux new-session -d -s carbonet-ops -n control
tmux new-window -t carbonet-ops -n main
tmux new-window -t carbonet-ops -n db
tmux new-window -t carbonet-ops -n idle-a
tmux new-window -t carbonet-ops -n idle-b
tmux attach -t carbonet-ops
```

세션에 붙은 뒤 각 창에서 실행:

```bash
# control
mosh sjkim08312@136.109.238.233

# main
ssh carbonet2026@136.117.100.221

# db
ssh sjkim08311@34.82.141.193

# idle-a
ssh sjkim08314@34.82.132.175

# idle-b
mosh sjkim08315@35.247.80.209
```

## 보고 형식

모든 운영 세션은 아래 4줄 형식을 사용합니다.

```text
1) 현재 상태
2) 변경한 것
3) 검증 결과
4) blocker
```
