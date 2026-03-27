# Codex Execution Console Handoff

## Scope

This document captures the current handoff state for Carbonet Codex execution work as of 2026-03-18.

Primary goals:

- make Codex CLI execution available from Spring Boot
- split SR execution into `prepare -> plan -> build`
- surface SR execution controls in `/admin/system/codex-request`
- leave enough context for another account to continue without chat history

## Current State

### Confirmed runtime facts

- `codex` CLI is installed at `/home/sjkim/.npm-global/bin/codex`
- `codex --version` returned `codex-cli 0.114.0`
- `codex login status` returned `Logged in using ChatGPT`
- `codex exec --skip-git-repo-check --sandbox read-only "Reply with exactly: OK"` returned `OK` when run outside the restricted sandbox
- `ops/scripts/codex-plan.sh /tmp/carbonet-safe-plan-prompt.txt /opt/projects/carbonet /tmp/carbonet-safe-plan-result.txt` returned `SAFE PLAN OK` when run outside the restricted sandbox on 2026-03-18
- sandboxed Codex execution failed only because outbound network access to Codex endpoints was blocked in the current agent environment
- the current interactive shell did not have `SECURITY_CODEX_*` variables exported, so runtime env must still be verified in the actual Spring target process
- the currently running `:18000` Spring process responded to `/actuator/health` with `{"status":"UP"}`, but its process environment did not contain `SECURITY_CODEX_*`
- after creating `ops/config/codex-runner.env` and restarting with `ops/scripts/start-18000.sh`, startup logs confirmed `codex enabled=true runner=true ... plan=configured build=configured`
- a Spring-based safe PLAN validation tool (`SrTicketSafePlanTool`) successfully executed the real SR flow on 2026-03-18:
  - `create -> approve -> prepare -> plan`
  - terminal ticket status became `PLAN_COMPLETED`
  - result file was written under `/tmp/carbonet-sr-codex-runner/.../artifacts/codex-plan-result.txt`
  - `changed-files.txt` was empty, confirming the read-only PLAN run did not modify repository files
  - the console refresh bug that could keep showing `아직 생성된 아티팩트가 없습니다.` for the same selected ticket after PLAN completion was fixed by forcing selected-ticket detail/artifact reload after ticket actions

### Implemented changes

#### 0. Local launcher source for `/opt/util/codex` was added

Key files:

- `/opt/projects/carbonet/ops/codex-launcher/app/server.py`
- `/opt/projects/carbonet/ops/codex-launcher/static/index.html`
- `/opt/projects/carbonet/ops/codex-launcher/config/workspaces.json`
- `/opt/projects/carbonet/ops/codex-launcher/config/actions.json`
- `/opt/projects/carbonet/ops/codex-launcher/scripts/install.sh`

Behavior:

- a standalone local launcher can now be installed under `/opt/util/codex`
- the launcher provides:
  - workspace selection
  - saved Codex login slot list with one-click activation
  - quick action buttons for common Carbonet commands
  - free-form Codex prompt execution through `codex exec`
  - free-form shell command execution
  - job history and live raw output polling
- action/workspace growth is config-driven so frequent commands can be upgraded without touching the core server flow
- this launcher is intentionally outside Spring and SR ticket flow, so it acts as an operator-side utility rather than replacing `/admin/system/codex-request`

#### 1. SR runner now supports `PLAN` and `BUILD`

Key files:

- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketCodexRunnerServiceImpl.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/model/vo/SrTicketRunnerExecutionVO.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/model/vo/SrTicketRecordVO.java`

Behavior:

- `PLAN` runs Codex in read-only mode
- `BUILD` runs Codex in full-auto mode
- plan and build use separate prompt/result/log files
- build verification still runs backend/frontend verify commands
- build verification now runs frontend build before backend package so refreshed `static/react-app` assets are included in the packaged jar
- approval token requirement is now defaulted to `false` in config unless re-enabled
- runner now accepts `PLAN_RUNNING` during the plan handoff so the ticket state transition does not self-block
- configured runner commands now resolve relative executable paths against `security.codex.runner.repo-root`, which fixes `ops/scripts/codex-plan.sh` and `ops/scripts/codex-build.sh` when the working directory is the isolated worktree

#### 2. Wrapper scripts were added

Files:

- `/opt/projects/carbonet/ops/scripts/codex-plan.sh`
- `/opt/projects/carbonet/ops/scripts/codex-build.sh`
- `/opt/projects/carbonet/ops/scripts/start-18000.sh`
- `/opt/projects/carbonet/ops/config/codex-runner.env.example`

Purpose:

- avoid embedding fragile shell logic directly in Java config
- centralize login-status checks
- keep Spring runner pointed at stable script entrypoints
- load runner env from an optional checked-in example / local env file path during `:18000` startup

#### 3. SR Workbench now exposes `Plan`

Key files:

- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/AdminSrWorkbenchController.java`
- `/opt/projects/carbonet/frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx`
- `/opt/projects/carbonet/frontend/src/lib/api/client.ts`

Behavior:

- SR lifecycle is now `Draft -> Approval -> Prepare -> Plan -> Execute`
- ticket row includes plan metadata such as `planRunId`, `planCompletedAt`, `planLogPath`, `planResultPath`
- build execution is blocked until ticket state reaches `PLAN_COMPLETED`

#### 4. `/admin/system/codex-request` now acts as a central queue console

Key files:

- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionPageController.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionAdminController.java`
- `/opt/projects/carbonet/frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx`
- `/opt/projects/carbonet/frontend/src/lib/api/client.ts`

Behavior:

- page-data now includes SR ticket queue data
- page-data now also exposes non-secret runner config summary:
  - runner enabled flag
  - repo root
  - workspace root
  - runner history file
  - plan/build command presence
- console can directly call:
  - prepare
  - plan
  - execute
  - delete
- console can now inspect:
  - selected ticket detail
  - plan artifact preview
  - build artifact preview
- console now surfaces additional execution-review data:
  - plan stderr path
  - build stderr path
  - backend/frontend verify stdout/stderr paths
  - backend/frontend verify exit codes
  - compact stderr/verify snippets in selected ticket detail
- this is still SR-ticket-backed, not yet a standalone stack model

#### 5. Right-click capture and SR Workbench stack bridge were added

Key files:

- `/opt/projects/carbonet/frontend/src/App.tsx`
- `/opt/projects/carbonet/frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx`
- `/opt/projects/carbonet/frontend/src/lib/api/client.ts`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/AdminSrWorkbenchController.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`

Behavior:

- any React-managed page can now open a custom Codex context menu by right-click
- while the menu is open, the hovered UI region is highlighted with a DevTools-style overlay based on the matched `screen-command` surface selector
- the menu lets the operator:
  - choose a change target
  - enter a free-form comment
  - add the current context to the SR Workbench stack
  - add and immediately open `/admin/system/sr-workbench`
  - trigger single-context immediate execution
- SR Workbench now exposes a file-backed stack list and can issue one SR ticket from selected stack items
- immediate execution path creates the SR ticket and then runs:
  - approve
  - prepare
  - plan
  - build
  in one backend flow
- current stack persistence is still file-backed JSONL at `security.codex.sr-workbench-stack-file`

#### 6. `/admin/system/codex-request` can reissue SR tickets

- central console queue rows now expose `Reissue`
- the action clones the selected SR ticket's page/surface/event/target/summary/instruction/context into a new SR ticket with a new `ticketId`
- endpoint:
  - `POST /admin/system/codex-request/tickets/{ticketId}/reissue`
- implementation references:
  - `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionAdminController.java`
  - `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`
  - `/opt/projects/carbonet/frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx`

## Required Configuration

At minimum:

```bash
export SECURITY_CODEX_ENABLED=true
export SECURITY_CODEX_RUNNER_ENABLED=true
export SECURITY_CODEX_RUNNER_REPO_ROOT=/opt/projects/carbonet
export SECURITY_CODEX_RUNNER_PLAN_COMMAND="ops/scripts/codex-plan.sh {promptFile} {worktree} {resultFile}"
export SECURITY_CODEX_RUNNER_BUILD_COMMAND="ops/scripts/codex-build.sh {promptFile} {worktree} {resultFile}"
```

Optional but relevant:

```bash
export SECURITY_CODEX_RUNNER_WORKSPACE_ROOT=/tmp/carbonet-sr-codex-runner
export SECURITY_CODEX_RUNNER_HISTORY_FILE=/tmp/carbonet-sr-codex-runner-history.jsonl
export SECURITY_CODEX_RUNNER_ALLOWED_PATH_PREFIXES="src/main/java,src/main/resources,frontend/src,docs/ai,ops/scripts"
export SECURITY_CODEX_RUNNER_BACKEND_VERIFY_COMMAND="mvn -q -DskipTests package"
export SECURITY_CODEX_RUNNER_FRONTEND_VERIFY_COMMAND="npm run build"
export SECURITY_CODEX_RUNNER_FRONTEND_VERIFY_WORKDIR="frontend"
```

Operational shortcut now added:

- `ops/scripts/start-18000.sh` loads these files when present:
  - `ops/config/carbonet-18000.env`
  - `ops/config/codex-runner.env`
- a committed template exists at:
  - `ops/config/codex-runner.env.example`
- startup logs now print a non-secret Codex config summary so runtime injection can be checked from `var/logs/carbonet-18000.log`

## Verification Already Performed

- `mvn -q -DskipTests package`
- `npm run build` in `/opt/projects/carbonet/frontend`
- restart of `:18000` with `ops/config/codex-runner.env`
- Spring safe PLAN validation via `egovframework.com.feature.admin.tools.SrTicketSafePlanTool`

Both were successful after the changes above.

## Known Gaps

### 1. Stack persistence is still bridge storage, not a real standalone console model

Current implementation:

- file-backed stack items for right-click capture
- SR Workbench stack panel
- immediate execution bridge through SR ticket lifecycle

Not implemented yet:

- dedicated DB-backed `stack`
- dedicated DB-backed `stack_item`
- reusable execution bundles
- richer stack audit/history beyond JSONL append-truncate flow

### 2. No dedicated delete audit for SR queue removal

Deletion works, but persistence is still file-backed JSONL and does not yet write a richer audit trail.

### 3. Runner command safety is script-based, not policy-based

Current safety depends on:

- wrapper scripts
- allowed path prefixes
- git diff inspection

Still missing:

- per-mode policy docs
- stronger approval workflow for build
- persistent artifact registry
- a stricter allowlist for what external/local docs Codex may inspect during PLAN, since current prompts can still lead the agent to broad repository inspection

### 4. Console still mixes queue-first execution with legacy provision proxy

The screen metadata and manifest now describe the execution-console role, but the old provision proxy remains on the same page for backward compatibility.

Still missing:

- a clean separation between runner console actions and legacy menu-provision payload execution
- a dedicated standalone console data model

## Next Recommended Steps

### Phase 1: Formalize the console contract

Completed in this handoff slice:

1. `/admin/system/codex-request` is now described in code and UI as a central execution console
2. `ScreenCommandCenterServiceImpl`, route label, frontend manifest, and help metadata were updated
3. explicit page sections were added for:
   - runtime config
   - queue
   - selected ticket detail
   - plan result
   - build result

Remaining work:

4. decide whether the legacy provision proxy stays on the same route or moves behind a secondary tab/route
5. add condensed stderr summaries to the page so operators do not always need full log previews
6. restart the `:18000` runtime with `ops/config/codex-runner.env` or exported env vars and confirm the startup log shows `codex enabled=true runner=true`

Completed:

- runtime restart path now supports `ops/config/codex-runner.env`
- startup log confirmation for runner config was completed

### Phase 2: Replace bridge stack storage with standalone persistence

Suggested models:

- `CODEX_STACK`
- `CODEX_STACK_ITEM`
- `CODEX_EXECUTION_RUN`
- `CODEX_EXECUTION_ARTIFACT`

Until then:

- stack items are stored in JSONL
- selected stack items are removed when converted into an SR ticket
- immediate execution still relies on SR ticket lifecycle under the hood

### Phase 3: Add context capture from target screens

Add actions such as:

- `Codex로 수정`
- `스택에 추가`
- `SR 생성`

Capture at least:

- `pageId`
- `routePath`
- `componentId`
- `surfaceId`
- `eventId`
- `traceId`
- `requestId`
- user comment

### Phase 4: Improve execution review

Expose in `codex-request`:

Implemented in part:

- plan result file contents
- build stdout/diff/changed-files preview
- plan/build stderr preview
- backend/frontend verify stdout/stderr preview
- backend/frontend verify exit codes

Still missing:

- stderr summary
- richer rollout/deploy hook visibility
- local self-deploy on `:18000` must not synchronously restart the same JVM before the runner persists final status and returns the HTTP response

## Files Most Likely To Need Further Edits

Backend:

- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketCodexRunnerServiceImpl.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionAdminController.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionPageController.java`
- `/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`

Frontend:

- `/opt/projects/carbonet/frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx`
- `/opt/projects/carbonet/frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx`
- `/opt/projects/carbonet/frontend/src/lib/api/client.ts`
- `/opt/projects/carbonet/frontend/src/app/screen-registry/pageManifests.ts`

Ops:

- `/opt/projects/carbonet/ops/scripts/codex-plan.sh`
- `/opt/projects/carbonet/ops/scripts/codex-build.sh`

## Suggested Continuation Order

1. create `ops/config/codex-runner.env` from `ops/config/codex-runner.env.example` or export the same vars in the service manager
2. keep `ops/config/codex-runner.env` or equivalent service-manager env in sync with production/local runtime
3. add compact stderr summary extraction in backend response payloads so the UI can show high-signal failure snippets without opening full logs
4. decide whether to expose the Spring safe-plan validation tool as an internal admin/ops command or keep it local-only
5. design and implement standalone stack persistence
6. add context-capture entrypoints from target screens

## Handoff Commands

Useful local checks:

```bash
codex login status
codex --version
printenv | grep '^SECURITY_CODEX'
```

Build checks:

```bash
cd /opt/projects/carbonet
mvn -q -DskipTests package
cd /opt/projects/carbonet/frontend
npm run build
```

## Notes For Another Account

- do not assume the current chat context exists
- start from this document first
- confirm config before debugging Java code
- if `codex exec` fails from Spring but succeeds in terminal, compare environment inheritance and working directory
- if `codex-request` behavior looks inconsistent with metadata, trust the implemented UI and controllers first, then update the governance metadata
