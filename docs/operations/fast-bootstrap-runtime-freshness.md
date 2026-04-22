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

If the task is specifically the `/admin/external/monitoring` first-entry bootstrap path, you can also use:

1. `bash ops/scripts/build-restart-verify-external-monitoring-18000.sh`

If the task is specifically the `/admin/emission/management` load plus save/calculate path, you can also use:

1. `bash ops/scripts/build-restart-verify-emission-management-18000.sh`

If the task is specifically the `/admin/emission/management` rollout board and all supported scopes must be repopulated and rechecked, you can also use:

1. `bash ops/scripts/build-restart-fill-verify-emission-management-rollout-18000.sh`

That script already enforces:

1. frontend build
2. backend package
3. restart

If `CARBONET_REACT_APP_FS_OVERRIDE_ENABLED=true` is active for local `:18000`, frontend-only reflection can also use:

1. `bash ops/scripts/frontend-refresh-18000.sh`

That path rebuilds `src/main/resources/static/react-app/**` and the running app serves those assets directly from the filesystem override path without repackaging the backend jar.

## Why Restart Alone Is Not Enough

`ops/scripts/restart-18000.sh` now defaults to a freshness-safe restart.

It does:

- rebuild frontend assets
- rebuild the packaged app jar, typically `apps/carbonet-app/target/carbonet.jar`
- restart the supervised runtime with the rebuilt jar

If you explicitly need process restart only, use:

- `RESTART_MODE=runtime-only bash ops/scripts/restart-18000.sh`
- or `bash ops/scripts/restart-18000-runtime.sh`

## Runtime Freshness Chain

The latest user-visible output reaches the running server through this chain:

1. `frontend/src`
2. frontend build output written into source-controlled static resources under `src/main/resources/static/react-app`
3. frontend build output mirrored into the packaged app resources under `apps/carbonet-app/src/main/resources/static/react-app`
4. `target/classes`
5. packaged app jar, typically `apps/carbonet-app/target/carbonet.jar`
6. `var/run/carbonet-18000.jar`
7. Java process started by `ops/scripts/start-18000.sh`

If any earlier stage is stale, later stages can also be stale.

## Filesystem Override Mode

Local `:18000` can run with React asset filesystem override enabled through:

- `CARBONET_REACT_APP_FS_OVERRIDE_ENABLED=true`
- `CARBONET_REACT_APP_FS_OVERRIDE_PATH=/opt/projects/carbonet/src/main/resources/static/react-app`

In that mode:

- runtime jar freshness is still required for Java, Spring resources, and startup proof
- React asset freshness is served from the filesystem override path first
- `codex-verify-18000-freshness.sh` must prove override freshness from the override manifest and actual HTTP responses, not only from jar-internal assets

Do not force a backend package just to prove a frontend-only rebuild when override mode is intentionally active.
Use `bash ops/scripts/frontend-refresh-18000.sh` for the fast path, and keep the full build-package-restart flow for backend or bootstrap changes.

## Script Ownership

### `ops/scripts/build-restart-18000.sh`

Purpose:

- shortest safe full-refresh path for local runtime

Behavior:

- runs frontend build
- removes stale `apps/carbonet-app/target/classes/static/react-app` assets before packaging
- runs backend package
- restarts `:18000` through the runtime-only helper

Use when:

- frontend changed
- bootstrap or shell changed
- backend changed and you want one standard command

### `ops/scripts/restart-18000.sh`

Purpose:

- default freshness-safe local restart

Behavior:

- runs frontend build
- removes stale `apps/carbonet-app/target/classes/static/react-app` assets before packaging
- runs backend package
- restarts `:18000` through the supervised runtime flow

Use when:

- the user expects local `:18000` to reflect the newest frontend, backend, or shell output

If you need process restart only, use:

- `RESTART_MODE=runtime-only bash ops/scripts/restart-18000.sh`
- `bash ops/scripts/restart-18000-runtime.sh`

### `ops/scripts/restart-18000-runtime.sh`

Purpose:

- supervised process restart only

Behavior:

- stops `:18000`
- starts supervised loop through tmux

Use when:

- no rebuild is required
- env or process supervision changed
- a fresh jar already exists and only process restart is needed

Guard:

- runtime-only restart now refuses to start when the packaged app jar is older than `src/main/resources/static/react-app` assets or the Vite manifest
- freshness verification compares the Vite manifest and React file list in the running jar with both root static resources and `apps/carbonet-app` static resources
- this prevents stale frontend bundles from being copied into `var/run` when someone restarts before packaging finishes

### `ops/scripts/start-18000.sh`

Purpose:

- actual startup implementation

Behavior:

- loads optional env files
- copies the packaged app jar into `var/run/carbonet-18000.jar`
- starts Java with DB settings
- waits for startup confirmation
- writes runtime log evidence

Critical implication:

- the running process starts from `var/run/carbonet-18000.jar`
- if the packaged app jar is stale, runtime will also be stale

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

## Local CUBRID CLOB Permission Drift

If route probes work but `var/logs/carbonet-18000.log` shows repeated observability fallbacks such as:

- `Access event persistence failed due to CLOB binding`
- `Audit event persistence failed due to CLOB binding`
- `Error event persistence failed due to CLOB binding`
- `Trace payload persistence failed due to CLOB binding`

check the local CUBRID LOB volume ownership. The Docker CUBRID server runs as `cubrid`, so root-owned `700` directories under `/var/lib/cubrid/com/lob` can make CLOB creation fail even while normal SQL and health checks pass.

Use the repository helper:

```bash
bash ops/scripts/codex-fix-cubrid-lob-permissions.sh
```

Then re-run the exact route probe that produced the warning and confirm no new CLOB fallback log lines appear.

The default freshness verifier also checks for these fallback patterns after the latest startup marker:

```bash
bash ops/scripts/codex-verify-18000-freshness.sh
```

Set `VERIFY_CLOB_FALLBACK_LOGS=false` only when intentionally diagnosing unrelated startup freshness and you have already captured the CLOB warning separately.

## Local Blocklist Persistence Schema Drift

If admin route probes work but `var/logs/carbonet-18000.log` shows blocklist fallback warnings such as:

- `Failed to load persisted blocklist rows. Falling back to snapshot source.`
- `Unknown class "dba.comtnblocklistentry"`

the local DB is missing the DB-backed blocklist persistence schema. Use the repository helper:

```bash
bash ops/scripts/codex-fix-cubrid-blocklist-schema.sh
```

Then restart only the local runtime process so the JDBC pool opens fresh connections:

```bash
RESTART_MODE=runtime-only bash ops/scripts/restart-18000.sh
VERIFY_WAIT_SECONDS=20 bash ops/scripts/codex-verify-18000-freshness.sh
```

After restart, re-run the route probe and confirm the latest startup section of `var/logs/carbonet-18000.log` does not contain the blocklist fallback warning.

The default freshness verifier checks these blocklist fallback patterns after the latest startup marker. Set `VERIFY_BLOCKLIST_FALLBACK_LOGS=false` only when intentionally separating schema repair from runtime freshness diagnosis.

## Verification Minimum

After a local refresh, verify at least:

1. `var/logs/carbonet-18000.log` shows a fresh startup attempt
2. startup confirmation appears for port `18000`
3. `ss -ltn` shows the port listening
4. the relevant route or health check responds
5. if the task added or changed a specific page such as `/edu/survey`, call that exact URL and confirm the response after restart

If the task changed an existing page or workflow rather than adding a brand-new one, also verify:

1. the same exact route or metadata endpoint that was checked before editing still behaves the same unless intentionally changed
2. one preserved action, state, or permission signal still matches the pre-change baseline

Use `docs/operations/ai-change-baseline-and-regression-rule.md` for the lightweight pre-change and post-change baseline rule.

When frontend freshness matters, also verify:

1. the latest frontend build completed
2. packaged jar was rebuilt afterward
3. hard refresh loads the new shell and asset set
4. `/react-shell/index.html` responds with no-store cache headers when the changed route is a React migration page

Preferred repository check:

- `bash ops/scripts/codex-verify-18000-freshness.sh`

Recommended route smoke-check after freshness verification:

- `curl -sI http://127.0.0.1:18000/<changed-route>`
- `curl -s http://127.0.0.1:18000/<changed-route> | sed -n '1,80p'`

When the user reports "same screen still shows" for a React admin route such as `/admin/emission/survey-admin`, also verify:

- `curl -sI http://127.0.0.1:18000/react-shell/index.html`
- confirm `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` or equivalent no-store policy
- confirm the latest hashed bundle names are present under `src/main/resources/static/react-app/assets/`

Use this when:

- a new React route was added
- a fallback route must now resolve to a concrete screen
- the user previously reported that "the screen does not show"

That script verifies:

- `target/carbonet.jar` exists
- `var/run/carbonet-18000.jar` exists
- runtime jar hash matches target jar hash
- PID is alive
- port `18000` is listening
- startup marker exists in the runtime log
- health endpoint reports `UP` when `curl` is available
- it can wait briefly for restart-side PID/log/socket creation via `VERIFY_WAIT_SECONDS` when verification starts immediately after `restart-18000.sh`

When the task specifically needs proof that `/admin/external/monitoring` uses bootstrap payload on first entry, also run:

- `bash ops/scripts/verify-external-monitoring-bootstrap.sh`
- `VERIFY_EXTERNAL_MONITORING_BOOTSTRAP=true bash ops/scripts/codex-verify-18000-freshness.sh`

When the task specifically needs proof that `/admin/emission/management` can load, save input sessions, and execute calculation on the running local service, also run:

- `bash ops/scripts/verify-emission-management-flow.sh`
- `bash ops/scripts/build-restart-verify-emission-management-18000.sh`

When the task specifically needs proof that a published emission definition snapshot is running in `PRIMARY` mode instead of only `AUTO` parity mode, use:

- `env VERIFY_DEFINITION_PUBLISH=true DEFINITION_RUNTIME_MODE=PRIMARY EXPECTED_PROMOTION_STATUS=PRIMARY_READY EXPECTED_DRAFT_ID_PREFIX='' bash ops/scripts/verify-emission-management-flow.sh`
- `env VERIFY_DEFINITION_PUBLISH=true DEFINITION_RUNTIME_MODE=PRIMARY EXPECTED_PROMOTION_STATUS=PRIMARY_READY EXPECTED_DRAFT_ID_PREFIX='' bash ops/scripts/build-restart-verify-emission-management-18000.sh`

When the task specifically needs proof that `/admin/emission/management` rollout-board rows are populated for the current supported scopes, also run:

- `bash ops/scripts/help-emission-management-rollout.sh`
- `EMISSION_HELP_OUTPUT=json bash ops/scripts/help-emission-management-rollout.sh`
- `EMISSION_HELP_OUTPUT=flat-json bash ops/scripts/help-emission-management-rollout.sh`
- `EMISSION_HELP_OUTPUT=commands bash ops/scripts/help-emission-management-rollout.sh`
- `bash ops/scripts/list-emission-management-rollout-scopes.sh`
- `bash ops/scripts/verify-emission-management-rollout-fixtures.sh`
- `bash ops/scripts/verify-emission-management-rollout-tooling.sh`
- `bash ops/scripts/show-emission-management-rollout-status.sh`
- `bash ops/scripts/show-emission-management-rollout-board.sh`
- `bash ops/scripts/verify-emission-management-rollout-readonly.sh`
- `bash ops/scripts/verify-emission-management-rollout-board-ready.sh`
- `bash ops/scripts/fill-emission-management-rollout-snapshots.sh`
- `bash ops/scripts/verify-emission-management-rollout-scope.sh CEMENT:1`
- `bash ops/scripts/build-restart-fill-verify-emission-management-rollout-18000.sh`

For the read-only board command, these output controls are also available:

- `EMISSION_ROLLOUT_OUTPUT=json`
- `EMISSION_ROLLOUT_FILTER_SCOPES="CEMENT:1 LIME:2"`

For the read-only verification bundle, this output control is also available:

- `EMISSION_READONLY_VERIFY_OUTPUT=json`
- `EMISSION_EXPECT_READY_SCOPES="CEMENT:1 LIME:2"`

If `EMISSION_EXPECT_READY_SCOPES` is omitted for the read-only status or
verification commands, they derive the expected scope set from
`ops/fixtures/emission-management-rollout/scopes.tsv`.

Useful read-only JSON shortcuts:

- `EMISSION_STATUS_OUTPUT=json EMISSION_STATUS_INCLUDE_BOARD=false bash ops/scripts/show-emission-management-rollout-status.sh`
- `EMISSION_READONLY_VERIFY_OUTPUT=json bash ops/scripts/verify-emission-management-rollout-readonly.sh`

These JSON outputs, and the help catalog JSON, currently expose `schemaVersion=1`.
The `commands` help mode is intentionally unstructured, and invalid `EMISSION_HELP_OUTPUT` values now fail fast instead of silently falling back to text output.

To emit the default rollout scope set in a copy-pasteable form before setting `EMISSION_SCOPES`, use:

- `EMISSION_SCOPE_LIST_OUTPUT=scopes bash ops/scripts/list-emission-management-rollout-scopes.sh`
- `EMISSION_SCOPE_LIST_OUTPUT=json bash ops/scripts/list-emission-management-rollout-scopes.sh`
- `EMISSION_FIXTURE_VERIFY_OUTPUT=json bash ops/scripts/verify-emission-management-rollout-fixtures.sh`

Scope metadata lookup/default-scope derivation are shared through `ops/scripts/emission-management-auth-common.sh`, and rollout schema/text render helpers are shared through `ops/scripts/emission_rollout_json_common.py`.

The full wrapper now ends with `show-emission-management-rollout-board.sh`, so on a normal local shell it should print the final summary cards and scope rows after the fill and verify steps complete.
It also starts with `verify-emission-management-rollout-fixtures.sh`, so scope metadata and canonical payload fixtures are checked before any rebuild or restart work begins.
By default, that final read-only board step asserts the same scope set passed in `EMISSION_SCOPES`. You can override the asserted set through `EMISSION_EXPECT_READY_SCOPES`.
When `EMISSION_SCOPES` is omitted, the wrapper now derives its default scope set from `ops/fixtures/emission-management-rollout/scopes.tsv`.

If you want the wrapper to skip that last read-only summary step, or to fail hard when the summary cannot be loaded, use:

- `SHOW_ROLLOUT_BOARD_AT_END=false`
- `IGNORE_ROLLOUT_BOARD_SHOW_FAILURE=false`

These wrapper boolean selectors also fail fast on unsupported values instead of silently falling back.

If one long parent shell cannot reliably reach local `:18000` in your execution environment, print the split commands and run them one by one:

- `EMISSION_PRINT_COMMANDS=true bash ops/scripts/fill-emission-management-rollout-snapshots.sh`

If transient local HTTP failures occur while reproducing the authenticated emission-management flow, these retry controls are available:

- `EMISSION_HTTP_RETRIES`
- `EMISSION_HTTP_RETRY_SECONDS`
- `EMISSION_SCOPE_VERIFY_RETRIES`
- `EMISSION_SCOPE_VERIFY_DELAY_SECONDS`

Use this when:

- rollout summary cards must move out of `LEGACY_ONLY`
- category and tier comparison rows must be visible after login
- definition-comparison fallback or adoption behavior changed

If the verifier is being run immediately after a restart and the supervised loop needs a little time to recreate the pid file, you can override the grace period:

- `VERIFY_WAIT_SECONDS=20 bash ops/scripts/codex-verify-18000-freshness.sh`

That script verifies:

- local authenticated `webmaster` session bootstrap can be reproduced against the running `:18000` service
- `/api/admin/app/bootstrap?route=external-monitoring` returns `externalMonitoringPageData`
- `/admin/external/monitoring` loads through the admin shell bootstrap path
- no `/admin/external/monitoring/page-data` request appears in the same verification window

## AI Agent Rule

When Codex changes files that affect runtime behavior on `:18000`, default to this document unless the user explicitly asks for a different operational path.

The safe bias is:

- build before package
- package before restart
- verify runtime after restart
- for route work, verify the exact changed URL after runtime freshness is proven

Never collapse those steps just to save one command if freshness would become ambiguous.

## Deploy Version Governance Rule

When deploy/version governance is the active owner lane, keep these evidence anchors aligned with runtime freshness proof:

- `releaseUnitId`
- `runtimePackageId`
- `deployTraceId`
- rollback-anchor evidence
- packaged app jar: `apps/carbonet-app/target/carbonet.jar`
- runtime jar: `var/run/carbonet-18000.jar`

For that lane, local closeout is incomplete unless both commands pass in order:

1. `bash ops/scripts/build-restart-18000.sh`
2. `VERIFY_WAIT_SECONDS=20 bash ops/scripts/codex-verify-18000-freshness.sh`

Do not claim deploy/version closeout from any weaker proof such as:

- process restart only
- packaged jar presence without runtime-jar parity
- route probing before the runtime freshness check passes
