---
name: carbonet-fast-bootstrap-ops
description: Keep Carbonet work fast and safe when tasks involve compile, package, restart, bootstrap freshness, or runtime verification. Use when Codex must ensure the newest frontend/backend/bootstrap outputs are actually deployed and running on local service flows such as `:18000` without stale jars or stale assets.
---

# Carbonet Fast Bootstrap Ops

Use this skill when the main risk is not feature logic but delivery freshness and restart safety, especially for:

- `npm run build`
- `mvn -q -DskipTests package`
- `ops/scripts/build-restart-18000.sh`
- `ops/scripts/restart-18000.sh`
- `ops/scripts/start-18000.sh`
- runtime jar freshness under `var/run`
- bootstrap/page shell freshness
- hard-refresh visibility after rebuild
- verifying the latest compiled output is actually what the server is running

Use this skill as the primary skill when the user asks for:

- fast work loops
- compile/package/restart flow
- no server-down or safer restart behavior
- bootstrap latest reflection
- stale asset or stale jar prevention
- reliable local deployment verification

If the task is mainly about React cache headers or manifest delivery, pair with `carbonet-react-refresh-consistency`.
If the task is mainly about server topology or multi-node rollout, pair with `carbonet-runtime-topology-ops`.
If the task is mainly about Codex runner execution flow, pair with `carbonet-codex-execution-console`.

Read only what you need:

- Read [`/opt/projects/carbonet/docs/operations/fast-bootstrap-runtime-freshness.md`](/opt/projects/carbonet/docs/operations/fast-bootstrap-runtime-freshness.md) first.
- Read [`/opt/projects/carbonet/docs/operations/ai-change-baseline-and-regression-rule.md`](/opt/projects/carbonet/docs/operations/ai-change-baseline-and-regression-rule.md) when an existing route or workflow must keep working after the change.
- Read [`/opt/projects/carbonet/docs/ai/60-operations/react-refresh-and-cache-control.md`](/opt/projects/carbonet/docs/ai/60-operations/react-refresh-and-cache-control.md) when frontend freshness or hard refresh matters.
- Read [`/opt/projects/carbonet/docs/operations/stable-restart-guide.md`](/opt/projects/carbonet/docs/operations/stable-restart-guide.md) when startup stability, auto-restart, or service behavior matters.
- Read [`/opt/projects/carbonet/ops/scripts/build-restart-18000.sh`](/opt/projects/carbonet/ops/scripts/build-restart-18000.sh), [`/opt/projects/carbonet/ops/scripts/restart-18000.sh`](/opt/projects/carbonet/ops/scripts/restart-18000.sh), and [`/opt/projects/carbonet/ops/scripts/start-18000.sh`](/opt/projects/carbonet/ops/scripts/start-18000.sh) before changing the local deploy sequence.
- If the work includes remote DB apply, DB diff, queue execution, or remote app restart after DB reflection, also read [`/opt/projects/carbonet/docs/operations/ai-agent-db-patch-governance.md`](/opt/projects/carbonet/docs/operations/ai-agent-db-patch-governance.md).

## Fast Path Rules

1. Default to the repository-safe local refresh sequence:
   - `cd frontend && npm run build`
   - `mvn -q -DskipTests package`
   - `bash ops/scripts/restart-18000.sh`
2. If the user wants one command and the standard script is still correct, prefer:
   - `bash ops/scripts/build-restart-18000.sh`
3. Never treat `restart-18000.sh` alone as proof that the latest frontend or bootstrap changes are live.
4. Remember the real runtime chain:
   - `frontend/src`
   - `src/main/resources/static/...`
   - `target/classes/static/...`
   - `target/carbonet.jar`
   - `var/run/carbonet-18000.jar`
   - running Java process on `:18000`
5. If any step in that chain was skipped, freshness is not guaranteed.
6. If AI-created work changes DB state, freshness proof is not enough by itself.
   Also prove:
   - DB patch file or queue item exists
   - `DB_PATCH_HISTORY` or `DEPLOYABLE_DB_PATCH_RESULT` evidence exists for actual apply
   - remote restart verification happens only after DB patch recording is complete

## Workflow

1. Classify the request:
   - compile only
   - frontend freshness
   - backend packaging
   - restart stability
   - bootstrap freshness
   - runtime verification
2. Confirm which files changed:
   - frontend source
   - backend Java/resources/templates
   - shell/bootstrap code
   - scripts/env
3. Choose the minimum safe command sequence:
   - frontend-only source change with runtime verification: frontend build -> backend package -> restart
   - backend/resource change: backend package -> restart
   - script/env-only change affecting startup: restart and log verification
4. Verify the running service, not just the build:
   - startup confirmed in logs
   - correct port listening
   - health or route responds
   - newest jar copied into `var/run`
   - when the task is a page or route, request the exact changed URL after restart and confirm it returns the React shell or expected page response
   - when the task changes bootstrap routing or page-shell entry behavior, also request the exact bootstrap endpoint and confirm the returned route/payload owner is correct
5. If the task changed an existing route or workflow, run a pre-change and post-change baseline on the same exact path whenever feasible:
   - route response or redirect
   - metadata endpoint when available
   - one critical existing action or state signal
6. When remote runtime is involved, verify the full server lifecycle when requested:
   - stop
   - start
   - runtime restart
   - post-restart port and route response
7. If the task changes startup, bootstrap, refresh behavior, or DB apply flow, update the doc in the same turn.

## Delivery Rules

- Prefer repository scripts over ad hoc manual kill/start command lines.
- Keep build, package, and restart sequential.
- Do not claim success based only on `target/` output.
- Do not claim freshness based only on source files.
- When local `:18000` is involved, verify runtime jar and startup log behavior.
- When remote DB or remote app restart is involved, do not claim success from script launch alone.
  Verify remote stop/start/restart state, remote port listen state, and an internal route response from the remote host itself.
- When the task adds or changes a concrete route such as `/edu/...` or `/admin/...`, verify that exact route over HTTP after `codex-verify-18000-freshness.sh`.
- When the task adds or changes a bootstrap adapter, bootstrap registry, login entry path, or shell route resolver, verify both:
  - the page URL such as `/admin/login/loginView`
  - the paired bootstrap URL such as `/admin/login/api/app/bootstrap`
- If changes can affect hard refresh behavior, mention whether shell freshness and asset freshness are both preserved.

## Verification Minimum

After making relevant changes, verify at least:

- frontend build if frontend or shell changed
- backend package if runtime jar contents changed
- local restart if `:18000` behavior changed
- a runtime signal such as startup log, listening port, or HTTP response

When bootstrap compatibility changed, verify at least:

- bootstrap endpoint returns the intended route id
- bootstrap endpoint returns the intended requested-path or equivalent binding signal
- page URL does not regress into redirect loops

## Response Shape

For implementation requests, provide:

- which freshness boundary was at risk
- which command sequence is now canonical
- how the running server proves it picked up the newest output
- any residual risk, especially around stale runtime jar or stale browser shell
