# Independent Runtime Deployment Guide

이 문서는 Carbonet 시스템의 **독립 프로젝트 런타임(Independent Project Runtime) 조립 및 배포 체계**를 설명합니다.

## 1. 개요 (Architecture Overview)
과거 단일 거대 JAR(`carbonet.jar`) 배포 방식에서 벗어나, **공통 엔진**(`project-runtime.jar`)과 **프로젝트 전용 비즈니스 로직**(`[projectId]-adapter.jar`, `[projectId]-runtime.jar`)을 분리하여 패키징하고 독립적으로 배포하는 체계입니다.

* **장점 1:** 특정 프로젝트 수정 시 다른 프로젝트나 공통 런타임에 영향을 주지 않고 개별 배포가 가능합니다.
* **장점 2:** 공통 모듈 업데이트 시 프로젝트 로직을 재빌드하지 않아도 됩니다.
* **장점 3:** 각 프로젝트별 독립적인 Systemd 서비스로 관리되어 장애 격리가 가능합니다.

---

## 2. 조립 (Assembly)
프로젝트 실행에 필요한 공통 엔진과 개별 라이브러리를 하나의 릴리즈 폴더로 모읍니다.

### 단일 프로젝트 조립
```bash
bash ops/scripts/assemble-project-release.sh [PROJECT_ID]
# 예: bash ops/scripts/assemble-project-release.sh p003
```
* **결과물 위치:** `var/releases/[PROJECT_ID]/`
* **구조:**
  * `project-runtime.jar`: 공통 엔진
  * `lib/`: 프로젝트 전용 JAR들 (예: `p003-adapter-1.0.0.jar`)
  * `config/`: 프로젝트별 설정 파일 (manifest.json, application.yml)
  * `run.sh`: 독립 실행 스크립트 (`PropertiesLauncher`를 통해 `lib/` 폴더를 동적으로 로드)

### 전체 프로젝트 조립 (CI/CD용)
```bash
bash ops/scripts/assemble-all-releases.sh
```

---

## 3. 배포 (Deployment)
조립된 릴리즈 폴더를 원격 서버로 전송합니다. rsync를 사용하여 변경된 파일만 효율적으로 전송합니다.

```bash
bash ops/scripts/deploy-project-release.sh [PROJECT_ID] [TARGET_IP]
# 예: bash ops/scripts/deploy-project-release.sh p003 carbonet2026@136.117.100.221
```

---

## 4. 서버 운영 관리 (Service Management)
원격 서버에서는 `carbonet@.service` 형태의 Systemd 템플릿을 사용하여 각 프로젝트를 독립적인 데몬으로 관리합니다.

### 서비스 템플릿 설치 (최초 1회)
로컬에서 아래 스크립트를 실행하여 서버에 Systemd 템플릿을 설치합니다.
```bash
bash ops/scripts/install-systemd-template.sh carbonet2026@136.117.100.221
```

### 프로젝트별 서비스 제어 (서버 내부 또는 원격 명령)
`carbonet@[PROJECT_ID]` 형식으로 서비스를 제어합니다.

* **시작:** `sudo systemctl start carbonet@p003`
* **정지:** `sudo systemctl stop carbonet@p003`
* **재시작:** `sudo systemctl restart carbonet@p003`
* **상태 확인:** `sudo systemctl status carbonet@p003`
* **로그 확인:** `sudo journalctl -u carbonet@p003 -f`
* **부팅 시 자동 시작 등록:** `sudo systemctl enable carbonet@p003`

## 5. 고급 운영 도구 (Advanced Operations)

### 신규 프로젝트 생성 (Bootstrapping)
`projects/project-template`을 기반으로 새로운 프로젝트를 즉시 생성합니다.
```bash
bash ops/scripts/create-new-project.sh [NEW_PROJECT_ID]
# 예: bash ops/scripts/create-new-project.sh p004
```

### 롤백 및 구버전 정리 (Rollback & Cleanup)
배포된 최신 버전에 문제가 발생하면 이전 버전으로 즉시 롤백합니다.
```bash
bash ops/scripts/rollback-project-release.sh [PROJECT_ID]
```
디스크 용량 확보를 위해 오래된 배포 버전을 지웁니다 (최신 5개 유지).
```bash
bash ops/scripts/cleanup-old-releases.sh [PROJECT_ID] 5
```

### 전체 런타임 상태 확인 (Monitoring Dashboard)
원격 서버에 떠 있는 모든 프로젝트 런타임의 상태와 포트, 활성 버전을 확인합니다.
```bash
bash ops/scripts/show-project-runtimes-status.sh
```

---

## 6. 클라우드 네이티브 지원 (Docker & K8s)
조립된 릴리즈 패키지는 도커 컨테이너로 손쉽게 구울 수 있습니다.

### Docker 이미지 빌드
```bash
bash ops/scripts/build-project-docker.sh [PROJECT_ID]
# 예: bash ops/scripts/build-project-docker.sh p003
```
* **결과물:** `carbonet-local/carbonet-[PROJECT_ID]:latest` 이미지가 로컬 레지스트리에 생성됩니다.
* **실행 예시:** `docker run -p 18000:8080 -e DB_USERNAME=dba -e DB_PASSWORD=secret carbonet-local/carbonet-p003:latest`

---

## 7. 보안 및 리소스 설정 (Security & Tuning)
* **DB 자격 증명:** DB 패스워드는 소스에 하드코딩되지 않습니다. 서버의 배포 폴더 내 `current/.env` 파일이나 도커 환경 변수(`DB_USERNAME`, `DB_PASSWORD`)를 통해 주입됩니다.
* **JVM 메모리 제한:** 각 프로젝트는 `JAVA_OPTS` 환경 변수(예: `-Xms256m -Xmx512m`)를 통해 메모리 할당량을 독립적으로 제어받아 "Noisy Neighbor" 문제를 방지합니다.

---

## 8. Trouble Shooting
**Q: ClassNotFoundException이 발생합니다.**
* `var/releases/[PROJECT_ID]/lib/` 폴더 안에 해당 프로젝트의 JAR가 정상적으로 들어있는지 확인하세요. `run.sh`가 `-Dloader.path=lib/` 옵션을 통해 클래스를 로드합니다.

**Q: 환경설정(DB 접속정보 등)을 바꾸고 싶습니다.**
* `var/releases/[PROJECT_ID]/config/` 폴더 내의 `manifest.json` 또는 `application.yml`을 수정하고 프로세스를 재시작(`systemctl restart carbonet@[PROJECT_ID]`)하세요. `config/` 디렉토리는 런타임에 의해 최우선으로 적용됩니다.
