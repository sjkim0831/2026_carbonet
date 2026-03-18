---
name: carbonet-codex-execution-console
description: Continue or extend Carbonet Codex execution console work for `/admin/system/codex-request`, SR Workbench `prepare/plan/build` flow, Spring runner integration, Codex wrapper scripts, and cross-account handoff. Use when Codex execution, runner configuration, SR ticket execution lifecycle, or central execution console behavior must be implemented, debugged, or documented.
---

# Carbonet Codex Execution Console

Use this skill when the task is about:

- `/admin/system/codex-request`
- SR Workbench Codex execution flow
- Spring Boot to Codex CLI integration
- plan/build runner behavior
- wrapper scripts under `ops/scripts`
- handoff documentation for another AI account

Read only what you need:

- Read [`/opt/projects/carbonet/docs/architecture/codex-execution-console-handoff.md`](/opt/projects/carbonet/docs/architecture/codex-execution-console-handoff.md) first.
- Read [`/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketCodexRunnerServiceImpl.java`](/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketCodexRunnerServiceImpl.java) when changing execution behavior.
- Read [`/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java`](/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/service/impl/SrTicketWorkbenchServiceImpl.java) when changing SR lifecycle or ticket persistence.
- Read [`/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionAdminController.java`](/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionAdminController.java) and [`/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionPageController.java`](/opt/projects/carbonet/src/main/java/egovframework/com/feature/admin/web/CodexProvisionPageController.java) when changing central console APIs or page-data.
- Read [`/opt/projects/carbonet/frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx`](/opt/projects/carbonet/frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx) for console UI changes.
- Read [`/opt/projects/carbonet/frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx`](/opt/projects/carbonet/frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx) for SR Workbench execution flow changes.
- Read [`/opt/projects/carbonet/frontend/src/lib/api/client.ts`](/opt/projects/carbonet/frontend/src/lib/api/client.ts) for frontend API contracts.
- Read [`/opt/projects/carbonet/ops/scripts/codex-plan.sh`](/opt/projects/carbonet/ops/scripts/codex-plan.sh) and [`/opt/projects/carbonet/ops/scripts/codex-build.sh`](/opt/projects/carbonet/ops/scripts/codex-build.sh) before changing runner command behavior.

## Workflow

1. Confirm whether the task is:
   - config/debug
   - runner behavior
   - SR execution flow
   - central console UI
   - stack-model extension
2. Verify environment before editing code:
   - `codex login status`
   - relevant `SECURITY_CODEX_*` variables
3. If terminal Codex works but Spring execution fails, compare:
   - working directory
   - inherited env vars
   - configured script paths
4. Keep `PLAN` and `BUILD` behavior separate.
5. Treat `codex-request` as the central console and `sr-workbench` as the ticket/approval side unless the user explicitly wants to redesign both.
6. If implementing multi-screen grouping, do not overload SR ticket JSON further; move toward standalone stack persistence.
7. After changes, run:
   - `mvn -q -DskipTests package`
   - `npm run build` in `frontend`

## Current Design Rules

- `PLAN` should be read-only and should not modify files intentionally.
- `BUILD` is the actual implementation path.
- Wrapper scripts are preferred over embedding complex shell command logic in Spring config.
- `codex-request` may act as a queue console even before standalone stack tables exist.
- SR ticket persistence is currently file-backed JSONL and is an interim storage model.

## Continuation Checklist

1. Open the handoff doc first.
2. Verify the runtime config.
3. Check whether the task belongs in:
   - runner
   - SR Workbench
   - codex-request
   - shared governance metadata
4. Update handoff documentation again if you materially change:
   - execution flow
   - required env vars
   - ownership boundaries
   - next-step priorities
