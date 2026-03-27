# Fast Bootstrap Runtime Freshness

Use this document when Carbonet work must stay fast while still guaranteeing that the newest compiled output is the one actually running.

This document is for the local operational path centered on `:18000`.

## Goal

Keep all of these true at once:

- the shortest safe build and restart loop is obvious
- Codex does not skip the packaging step when it matters
- the running service picks up the newest frontend, backend, and bootstrap outputs
- restart behavior stays stable instead of drifting into ad hoc commands

## Canonical Local Sequence

For changes that must be reflected in the running app on `:18000`, the default safe sequence is:

1. `cd frontend && npm run build`
2. `mvn -q -DskipTests package`
3. `bash ops/scripts/restart-18000.sh`

If one command is preferred and the standard script still matches the repository flow, use:

1. `bash ops/scripts/build-restart-18000.sh`
2. `bash ops/scripts/codex-verify-18000-freshness.sh`

That script already enforces:

1. frontend build
2. backend package
3. restart

## Why Restart Alone Is Not Enough

`ops/scripts/restart-18000.sh` only restarts the supervised runtime.

It does not:

- rebuild frontend assets
- rebuild `target/carbonet.jar`
- guarantee new bootstrap resources were packaged

So `restart-18000.sh` alone is not a freshness command.
It is only a process restart command.

## Runtime Freshness Chain

The latest user-visible output reaches the running server through this chain:

1. `frontend/src`
2. frontend build output written into source-controlled static resources
3. `target/classes`
4. `target/carbonet.jar`
5. `var/run/carbonet-18000.jar`
6. Java process started by `ops/scripts/start-18000.sh`

If any earlier stage is stale, later stages can also be stale.

## Script Ownership

### `ops/scripts/build-restart-18000.sh`

Purpose:

- shortest safe full-refresh path for local runtime

Behavior:

- runs frontend build
- runs backend package
- restarts `:18000`

Use when:

- frontend changed
- bootstrap or shell changed
- backend changed and you want one standard command

### `ops/scripts/restart-18000.sh`

Purpose:

- supervised process restart only

Behavior:

- stops `:18000`
- starts supervised loop through tmux

Use when:

- no rebuild is required
- env or process supervision changed
- a fresh jar already exists and only process restart is needed

### `ops/scripts/start-18000.sh`

Purpose:

- actual startup implementation

Behavior:

- loads optional env files
- copies `target/carbonet.jar` into `var/run/carbonet-18000.jar`
- starts Java with DB settings
- waits for startup confirmation
- writes runtime log evidence

Critical implication:

- the running process starts from `var/run/carbonet-18000.jar`
- if `target/carbonet.jar` is stale, runtime will also be stale

## Bootstrap Freshness Rules

Treat these changes as requiring the full canonical local sequence:

- React shell changes
- page bootstrap data composition changes
- static resource changes included in jar packaging
- frontend asset changes
- controller or template changes that affect admin app shell behavior

Do not assume a source edit is live because:

- source files changed
- frontend build passed
- backend package passed

Only the running service proves freshness.

## Fast Decision Table

### Frontend source changed

Run:

- frontend build
- backend package
- restart

Reason:

- new assets must enter the jar and then the runtime jar

### Backend Java or Spring resource changed

Run:

- backend package
- restart

Reason:

- runtime starts from packaged jar, not loose class files

### Startup env or startup script changed

Run:

- restart
- startup log verification

Reason:

- process behavior changed even if jar did not

### Unsure whether bootstrap path changed

Run:

- full canonical local sequence

Reason:

- cheaper than debugging a stale runtime misunderstanding

## Verification Minimum

After a local refresh, verify at least:

1. `var/logs/carbonet-18000.log` shows a fresh startup attempt
2. startup confirmation appears for port `18000`
3. `ss -ltn` shows the port listening
4. the relevant route or health check responds

When frontend freshness matters, also verify:

1. the latest frontend build completed
2. packaged jar was rebuilt afterward
3. hard refresh loads the new shell and asset set

Preferred repository check:

- `bash ops/scripts/codex-verify-18000-freshness.sh`

That script verifies:

- `target/carbonet.jar` exists
- `var/run/carbonet-18000.jar` exists
- runtime jar hash matches target jar hash
- PID is alive
- port `18000` is listening
- startup marker exists in the runtime log
- health endpoint reports `UP` when `curl` is available

## AI Agent Rule

When Codex changes files that affect runtime behavior on `:18000`, default to this document unless the user explicitly asks for a different operational path.

The safe bias is:

- build before package
- package before restart
- verify runtime after restart

Never collapse those steps just to save one command if freshness would become ambiguous.
