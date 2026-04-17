# Carbonet Deployment & Runtime Management

## Server Path
- Base Directory: `/opt/projects/carbonet`
- Common Libraries: `var/lib/common`
- Project Runtimes: `var/run/project-runtime/{PROJECT_ID}`
- Project Logs: `var/logs/project-runtime/{PROJECT_ID}`

## Build Commands
To build the Operations Console and Project Runtimes as independent JARs:
```bash
bash ops/scripts/build-independent-runtimes.sh
```

## Runtime Management

### Operations Console (Platform Lane)
Runs on port 18001. Provides the web UI for project management and centralized operations.
- Start: `bash ops/scripts/start-operations-console.sh`
- Stop: Find PID via `pgrep -f operations-console.jar` and `kill -9`

### Project Runtimes (Independent Lane)
Runs on port 18000. Each project boots a dedicated runtime loading project-specific DB and adapter settings via `project-runtime-manifest.json`.
You can manage these via the **Package Governance Screen UI** (`/admin/system/package-governance`), or manually via script:
- Status: `bash ops/scripts/manage-project-runtime.sh status {PROJECT_ID}`
- Start: `bash ops/scripts/manage-project-runtime.sh start {PROJECT_ID}`
- Stop: `bash ops/scripts/manage-project-runtime.sh stop {PROJECT_ID}`
- Restart: `bash ops/scripts/manage-project-runtime.sh restart {PROJECT_ID}`
- Bootstrap Thin Project: `bash ops/scripts/bootstrap-thin-project.sh {PROJECT_ID}`

Example:
```bash
bash ops/scripts/bootstrap-thin-project.sh P003
bash ops/scripts/manage-project-runtime.sh start P003
```

## Typical Deploy Flow
1. Pull the latest code.
2. Build the independent JARs: `bash ops/scripts/build-independent-runtimes.sh`
3. Restart the Operations Console if needed.
4. Manage specific projects through the Operations Console UI (`/admin/system/package-governance`) or CLI.

## Notes
- File Uploads: Default to `/opt/projects/carbonet/var/file/instt`
- Database Connections: Now resolved dynamically per project via `ProjectManifestService` referencing `var/run/project-runtime/{PROJECT_ID}/config/manifest.json` (Managed centrally from `data/version-control/project-runtime-manifest.json`).
