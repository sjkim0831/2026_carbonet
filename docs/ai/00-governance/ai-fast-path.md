# AI Fast Path

Use this file as the default starting point for AI-assisted work in this repository.

## Read First

1. `README.md`
2. `STRUCTURE.md`
3. `PROJECT_PATHS.md`
4. `docs/ai/10-architecture/repo-layout.md`
5. `docs/ai/70-reference/screen-design-source-map.md`
6. `docs/ai/00-governance/ai-session-partitioning.md` before planning or implementation so session ownership is decided early
7. `docs/ai/60-operations/session-orchestration/README.md` when the task needs durable plan, contract, or handoff artifacts
8. `docs/ai/60-operations/react-refresh-and-cache-control.md` when frontend delivery, React shell behavior, or cache freshness matters
9. `docs/operations/backup-db-fast-workflow.md` when the task touches the backup DB server, CUBRID runtime operations, or remote DB inspection/update work
10. `docs/operations/fast-bootstrap-runtime-freshness.md` when the task touches compile, package, restart, bootstrap freshness, runtime jar freshness, or local `:18000` verification
11. `AGENTS.md` when the task touches local build/restart/freshness rules so the repository-local runtime verification path is followed

If the task comes from local design assets, read these external files first:

1. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
2. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
3. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
4. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`

## Search Order

Use this exploration order unless the task clearly says otherwise:

1. `docs/ai/20-ui`
2. `docs/ai/40-backend`
3. `docs/ai/50-data`
4. `src/main/java`
5. `src/main/resources/templates`
6. `src/main/resources/egovframework/mapper`
7. `frontend/src/features`

## Do Not Start Here

These locations are usually noise for AI unless the task is runtime- or build-specific:

- `target/`
- `frontend/node_modules/`
- `var/logs/`
- built assets under `src/main/resources/static/react-migration/assets`

## Folder Intent

- `src/` is the implementation source of truth
- `frontend/src/` is the React migration source of truth
- `docs/ai/` is the AI navigation and impact-analysis layer
- `ops/scripts/` and `ops/cron/` are the primary operational tooling locations
- `var/logs/` and `var/file/` are mutable runtime or local data areas
- `/home/imaneya/workspace/화면설계` is the primary external design workspace

## Minimum Maps To Update After Code Changes

- `docs/ai/20-ui/screen-index.csv`
- `docs/ai/20-ui/event-map.csv`
- `docs/ai/40-backend/api-catalog.csv`
- `docs/ai/50-data/table-screen-api-map.csv`

## Multi-Session Default

Use session partitioning for every request before implementation.

Do not split work by task title alone.

Use `docs/ai/00-governance/ai-session-partitioning.md` first and assign work by:

- path ownership
- contract ownership
- merge-risk boundary

Prefer a coordinator-first split over ad hoc parallel edits.

Use `docs/ai/60-operations/session-orchestration/` for durable session planning artifacts when the work is not trivially isolated.
