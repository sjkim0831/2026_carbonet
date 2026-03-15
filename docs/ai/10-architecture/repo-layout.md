# Repo Layout

This file explains which folders matter most for AI speed and which ones should usually be ignored.

## High-Value Paths

- `PROJECT_PATHS.md`
  - top-level path-change note for repository moves or folder renames
- `src/main/java/egovframework/com/feature`
  - business controllers, services, domain logic
- `src/main/java/egovframework/com/common`
  - shared infrastructure and reusable backend helpers
- `src/main/resources/templates/egovframework/com`
  - server-rendered screens and migration shells
- `src/main/resources/egovframework/mapper`
  - MyBatis XML source of truth
- `frontend/src/features`
  - React migration screens
- `frontend/src/components`
  - reusable React UI components
  - shared concerns should be split into subfolders such as `access/` and `help/` to reduce multi-session conflicts
- `frontend/src/lib`
  - frontend shared code
  - keep role-based helpers separated by concern such as `api/`, `auth/`, and `navigation/`
- `docs/ai`
  - AI task acceleration layer
- `docs/ai/60-operations/session-orchestration`
  - standard location for AI session plans, contracts, and handoff templates
- `.codex/skills`
  - reusable AI project skills

## Medium-Value Paths

- `ops`
  - operational support
- `ops/project-paths.sh`
  - top-level runtime path variables shared by scripts
- `ops/scripts`
  - utility scripts and provisioning helpers
- `docs/sql`
  - SQL artifacts worth checking when a task is DB-related
- `var/file`
  - storage area; inspect only if the task is file-handling-related

## Low-Value Paths For Initial Analysis

- `target`
  - generated build output
- `var/logs`
  - runtime artifacts
- `frontend/node_modules`
  - third-party dependencies
- `src/main/resources/static/react-migration`
  - built frontend assets, not authoring sources

## Top-Level Cleanup Rule

Do not scatter new ad hoc notes or temporary summaries at repository root.

Preferred locations:

- long-lived architecture or process docs -> `docs/`
- AI-oriented maps -> `docs/ai/`
- SQL changes -> `docs/sql/`
- utility scripts -> `ops/scripts/`
- temporary analysis -> keep out of git or place under a clearly scoped doc folder

## Naming Rule For New Docs

- use lowercase kebab-case for new Markdown docs under `docs/` and `docs/ai/`
- keep one purpose per document
- prefer CSV when mapping many-to-many relationships

## External Design Workspace

The repository depends on the external local design workspace:

- `/home/imaneya/workspace/화면설계`

For broad scope or ambiguous work, always start with:

1. `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`
2. `/home/imaneya/workspace/화면설계/2. main_home_menu.html`
3. `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`
4. `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`
