# Carbonet Local Agent Rules

These repository-local rules tighten the default AI workflow for Carbonet delivery and runtime freshness work.

## Build And Restart Rule

When the request touches any of these:

- compile
- package
- restart
- bootstrap freshness
- hard refresh visibility
- stale jar prevention
- stale asset prevention
- local `:18000` verification

use:

- `carbonet-fast-bootstrap-ops`

read first:

- `docs/operations/fast-bootstrap-runtime-freshness.md`

## Canonical Local Refresh Sequence

For work that must be visible on the local runtime at `:18000`, default to:

1. `cd frontend && npm run build`
2. `mvn -q -DskipTests package`
3. `bash ops/scripts/restart-18000.sh`
4. `bash ops/scripts/codex-verify-18000-freshness.sh`

If the repository standard script is sufficient, prefer:

1. `bash ops/scripts/build-restart-18000.sh`
2. `bash ops/scripts/codex-verify-18000-freshness.sh`

For `/admin/external/monitoring` bootstrap-first verification, you can also use:

1. `bash ops/scripts/build-restart-verify-external-monitoring-18000.sh`

For `/admin/emission/management` save/calculate verification, you can also use:

1. `bash ops/scripts/build-restart-verify-emission-management-18000.sh`

## Non-Negotiable Freshness Rules

- Do not treat `restart-18000.sh` alone as proof that the newest frontend or bootstrap changes are live.
- Do not claim success based only on `target/` output.
- Do not claim success based only on source diffs.
- When `:18000` is part of the task, prove runtime freshness against `var/run/carbonet-18000.jar` and the running process.

## Verification Rule

After changing files that affect runtime behavior on `:18000`, verify at least:

- runtime jar matches `target/carbonet.jar`
- pid is alive
- port `18000` is listening
- startup log contains the current startup marker
- health endpoint responds when available
- when the task added or changed a specific route, the exact route URL responds after restart

Prefer the repository script:

- `ops/scripts/codex-verify-18000-freshness.sh`

If verification starts immediately after `restart-18000.sh`, the verifier may need its built-in grace wait for pid/log/socket recreation:

- `VERIFY_WAIT_SECONDS=20 ops/scripts/codex-verify-18000-freshness.sh`

When `/admin/external/monitoring` first-entry bootstrap behavior itself must be proven, also use:

- `ops/scripts/verify-external-monitoring-bootstrap.sh`
- `VERIFY_EXTERNAL_MONITORING_BOOTSTRAP=true ops/scripts/codex-verify-18000-freshness.sh`

When `/admin/emission/management` load, save, and calculate behavior itself must be proven, also use:

- `ops/scripts/verify-emission-management-flow.sh`
- `ops/scripts/build-restart-verify-emission-management-18000.sh`

When the user reported that a newly built page "does not show", do not stop at the freshness verifier alone.
Also call the exact changed route, for example:

- `curl -sI http://127.0.0.1:18000/edu/survey`
- `curl -s http://127.0.0.1:18000/edu/survey | sed -n '1,80p'`

## Cache And Bootstrap Boundary

- `carbonet-fast-bootstrap-ops` owns compile/package/restart/runtime-proof
- `carbonet-react-refresh-consistency` owns shell cache, manifest, and hard-refresh policy
- when both are affected, use both
