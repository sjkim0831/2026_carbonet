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

Prefer the repository script:

- `ops/scripts/codex-verify-18000-freshness.sh`

## Cache And Bootstrap Boundary

- `carbonet-fast-bootstrap-ops` owns compile/package/restart/runtime-proof
- `carbonet-react-refresh-consistency` owns shell cache, manifest, and hard-refresh policy
- when both are affected, use both
