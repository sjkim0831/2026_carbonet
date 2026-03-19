# carbonet-react-migration

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

Read these first before making structural changes:

1. [STRUCTURE.md](/opt/projects/carbonet-react-migration/STRUCTURE.md)
2. [PROJECT_PATHS.md](/opt/projects/carbonet-react-migration/PROJECT_PATHS.md)
3. [docs/ai/README.md](/opt/projects/carbonet-react-migration/docs/ai/README.md)
4. [docs/ai/00-governance/ai-fast-path.md](/opt/projects/carbonet-react-migration/docs/ai/00-governance/ai-fast-path.md)
5. [docs/ai/10-architecture/repo-layout.md](/opt/projects/carbonet-react-migration/docs/ai/10-architecture/repo-layout.md)

Operational and history docs:

- [docs/operations/stable-restart-guide.md](/opt/projects/carbonet-react-migration/docs/operations/stable-restart-guide.md)
- [docs/operations/backup-db-fast-workflow.md](/opt/projects/carbonet/docs/operations/backup-db-fast-workflow.md)
- [docs/operations/codex-provision-api.md](/opt/projects/carbonet-react-migration/docs/operations/codex-provision-api.md)
- [docs/history/refactor-summary-20260310.md](/opt/projects/carbonet-react-migration/docs/history/refactor-summary-20260310.md)
- [docs/frontend/react-migration.md](/opt/projects/carbonet-react-migration/docs/frontend/react-migration.md)
- [docs/audit/non-admin-react-migration-audit.md](/opt/projects/carbonet-react-migration/docs/audit/non-admin-react-migration-audit.md)
- [docs/architecture/system-observability-audit-trace-design.md](/opt/projects/carbonet-react-migration/docs/architecture/system-observability-audit-trace-design.md)

Design-driven tasks should also start from:

1. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
2. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
3. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
4. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`

## Notes

- `<PROJECT_ROOT>` default is documented in `PROJECT_PATHS.md` and `ops/project-paths.sh`.
- This app runs Carbonet directly without Eureka/Config/Gateway orchestration.
- DB host default is `localhost` and can be overridden with `CUBRID_HOST`.
- Runtime logs are written under `var/logs/`.
- Local uploaded files are stored under `var/file/`.
- Build output is written under `target/`.
