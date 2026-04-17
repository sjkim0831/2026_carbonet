# carbonet

## Working Directory

```bash
cd <PROJECT_ROOT>
```

## Build

```bash
mvn -DskipTests package
```

## Run

```bash
java -jar target/carbonet.jar
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## AI Fast Path

Use the routing gate first:

1. [ai-skill-doc-routing-matrix.md](/opt/projects/carbonet/docs/ai/00-governance/ai-skill-doc-routing-matrix.md)
2. [ai-reference-reduction-policy.md](/opt/projects/carbonet/docs/ai/00-governance/ai-reference-reduction-policy.md)
3. [ai-fast-path.md](/opt/projects/carbonet/docs/ai/00-governance/ai-fast-path.md)

Read these only when the chosen route needs them:

1. [STRUCTURE.md](/opt/projects/carbonet/STRUCTURE.md)
2. [PROJECT_PATHS.md](/opt/projects/carbonet/PROJECT_PATHS.md)
3. [docs/ai/README.md](/opt/projects/carbonet/docs/ai/README.md)
4. [docs/ai/10-architecture/repo-layout.md](/opt/projects/carbonet/docs/ai/10-architecture/repo-layout.md)

Operational and history docs:

- [docs/operations/stable-restart-guide.md](/opt/projects/carbonet/docs/operations/stable-restart-guide.md)
- [docs/operations/backup-db-fast-workflow.md](/opt/projects/carbonet/docs/operations/backup-db-fast-workflow.md)
- [docs/operations/codex-provision-api.md](/opt/projects/carbonet/docs/operations/codex-provision-api.md)
- [docs/history/refactor-summary-20260310.md](/opt/projects/carbonet/docs/history/refactor-summary-20260310.md)
- [docs/frontend/react-migration.md](/opt/projects/carbonet/docs/frontend/react-migration.md)
- [docs/audit/non-admin-react-migration-audit.md](/opt/projects/carbonet/docs/audit/non-admin-react-migration-audit.md)
- [docs/architecture/system-observability-audit-trace-design.md](/opt/projects/carbonet/docs/architecture/system-observability-audit-trace-design.md)

Design-driven tasks should also start from:

1. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
2. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
3. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
4. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`

## Notes

- `<PROJECT_ROOT>` default is documented in `PROJECT_PATHS.md` and `ops/project-paths.sh`.
- This repository is the active full-stack Carbonet workspace: React authoring sources live under `frontend/`, and the packaged runtime is served by Spring Boot from `src/main/resources/static/react-app`.
- This app runs Carbonet directly without Eureka/Config/Gateway orchestration.
- DB host default is `localhost` and can be overridden with `CUBRID_HOST`.
- Runtime logs are written under `var/logs/`.
- Local uploaded files are stored under `var/file/`.
- Build output is written under `target/`.

---

## 멀티 프로젝트 독립 런타임 플랫폼 (Multi-Project Independent Runtime)

Carbonet은 단일 앱 배포(`carbonet.jar`) 방식 외에도, **공통 엔진 위에서 여러 프로젝트(고객사)가 독립적으로 배포되고 실행되는 아키텍처**를 지원합니다. 이를 통해 각 프로젝트는 고유한 DB와 포트를 가지며 장애가 격리됩니다.

상세 아키텍처 및 운영 방법은 [독립 런타임 배포 가이드](docs/operations/independent-runtime-deployment-guide.md)를 참고하세요.

### 🚀 관리 명령어 (Makefile)

프로젝트 최상단의 `Makefile`을 통해 복잡한 배포 및 운영 과정을 쉽게 제어할 수 있습니다.

**1. 신규 프로젝트 런칭 (P004 예시)**
```bash
make new-project project=p004
make db-create project=p004
```

**2. 로컬 개발 (Docker)**
```bash
make local-docker project=p004 port=18001
```

**3. 빌드 및 서버 배포**
```bash
make build project=p004
make deploy project=p004 port=18001
```

**4. 운영 상태 및 롤백**
```bash
make status
make rollback project=p004
make cleanup project=p004
```
