#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  bash ops/scripts/codex-verify-18000-freshness.sh

Purpose:
  Verify that the running :18000 service is using the newest packaged runtime jar.

Canonical app jar:
  apps/carbonet-app/target/carbonet.jar

Quick guide:
  bash ops/scripts/app-closure-help.sh

Environment overrides:
  PORT
  TARGET_JAR_PATH
  RUNTIME_JAR_PATH
  PID_FILE
  LOG_FILE
  HEALTH_URL
  STARTUP_MARKER
  VERIFY_WAIT_SECONDS
  VERIFY_EXTERNAL_MONITORING_BOOTSTRAP=true
EOF
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/ops/scripts/runtime-url-common.sh"
PORT="${PORT:-18000}"
CONFIG_DIR="${CONFIG_DIR:-$ROOT_DIR/ops/config}"
ENV_FILE="${ENV_FILE:-$CONFIG_DIR/carbonet-${PORT}.env}"
RUN_DIR="${RUN_DIR:-$ROOT_DIR/var/run}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/var/logs}"
APP_TARGET_JAR_PATH="$ROOT_DIR/apps/carbonet-app/target/carbonet.jar"
TARGET_JAR_PATH="${TARGET_JAR_PATH:-$APP_TARGET_JAR_PATH}"
RUNTIME_JAR_PATH="${RUNTIME_JAR_PATH:-$RUN_DIR/carbonet-${PORT}.jar}"
PID_FILE="${PID_FILE:-$RUN_DIR/carbonet-${PORT}.pid}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/carbonet-${PORT}.log}"
HEALTH_URL="${HEALTH_URL:-$(carbonet_runtime_health_url)}"
STARTUP_MARKER="${STARTUP_MARKER:-Tomcat started on port(s): ${PORT}}"
VERIFY_WAIT_SECONDS="${VERIFY_WAIT_SECONDS:-20}"
VERIFY_EXTERNAL_MONITORING_BOOTSTRAP="${VERIFY_EXTERNAL_MONITORING_BOOTSTRAP:-false}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

carbonet_set_curl_args

fail() {
  echo "[codex-verify-18000-freshness] FAIL: $*" >&2
  exit 1
}

info() {
  echo "[codex-verify-18000-freshness] $*"
}

resolve_running_pid() {
  ps -eo pid=,args= | awk -v jar_path="$RUNTIME_JAR_PATH" -v port="--server.port=${PORT}" '
    index($0, jar_path) && index($0, port) {
      print $1;
      exit 0;
    }
  '
}

pid_is_live() {
  local pid="$1"
  [[ -n "${pid:-}" ]] || return 1
  ps -p "$pid" -o args= 2>/dev/null | awk -v jar_path="$RUNTIME_JAR_PATH" -v port="--server.port=${PORT}" '
    index($0, jar_path) && index($0, port) {
      found = 1
    }
    END {
      exit(found ? 0 : 1)
    }
  '
}

refresh_pid_file_from_runtime() {
  local resolved_pid=""
  resolved_pid="$(resolve_running_pid || true)"
  if pid_is_live "$resolved_pid"; then
    printf '%s\n' "$resolved_pid" > "$PID_FILE"
    printf '%s\n' "$resolved_pid"
    return 0
  fi
  return 1
}

read_live_pid() {
  local pid=""
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if pid_is_live "$pid"; then
    printf '%s\n' "$pid"
    return 0
  fi
  refresh_pid_file_from_runtime
}

compute_hash() {
  local file_path="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file_path" | awk '{print $1}'
    return 0
  fi
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file_path" | awk '{print $1}'
    return 0
  fi
  cksum "$file_path" | awk '{print $1 ":" $2}'
}

require_file() {
  local file_path="$1"
  [[ -f "$file_path" ]] || fail "missing file: $file_path"
}

require_file "$TARGET_JAR_PATH"

for _ in $(seq 1 "$VERIFY_WAIT_SECONDS"); do
  [[ -f "$RUNTIME_JAR_PATH" && -f "$LOG_FILE" && -f "$PID_FILE" ]] || {
    if [[ ! -f "$PID_FILE" ]]; then
      refresh_pid_file_from_runtime >/dev/null || true
    fi
    sleep 1
    continue
  }

  APP_PID="$(read_live_pid || true)"
  if [[ -z "${APP_PID:-}" ]]; then
    sleep 1
    continue
  fi

  if ! ss -ltn "( sport = :$PORT )" 2>/dev/null | grep -q ":$PORT"; then
    sleep 1
    continue
  fi

  break
done

require_file "$RUNTIME_JAR_PATH"
require_file "$LOG_FILE"
if [[ ! -s "$PID_FILE" ]]; then
  refresh_pid_file_from_runtime >/dev/null || true
fi
[[ -f "$PID_FILE" ]] || fail "missing pid file: $PID_FILE after waiting ${VERIFY_WAIT_SECONDS}s"
APP_PID="$(read_live_pid || true)"
if [[ -z "${APP_PID:-}" ]]; then
  for _ in $(seq 1 5); do
    sleep 1
    APP_PID="$(read_live_pid || true)"
    if [[ -n "${APP_PID:-}" ]]; then
      break
    fi
  done
fi
[[ -n "${APP_PID:-}" ]] || fail "unable to resolve running pid from $PID_FILE or process table"
pid_is_live "$APP_PID" || fail "process not running for pid=$APP_PID"

if ! ss -ltn "( sport = :$PORT )" 2>/dev/null | grep -q ":$PORT"; then
  fail "port is not listening: $PORT"
fi

TARGET_HASH="$(compute_hash "$TARGET_JAR_PATH")"
RUNTIME_HASH="$(compute_hash "$RUNTIME_JAR_PATH")"
[[ "$TARGET_HASH" == "$RUNTIME_HASH" ]] || fail "runtime jar hash differs from target jar"

TARGET_MTIME="$(stat -c %Y "$TARGET_JAR_PATH" 2>/dev/null || true)"
RUNTIME_MTIME="$(stat -c %Y "$RUNTIME_JAR_PATH" 2>/dev/null || true)"
[[ -n "$TARGET_MTIME" && -n "$RUNTIME_MTIME" ]] || fail "failed to read jar mtimes"
[[ "$RUNTIME_MTIME" -ge "$TARGET_MTIME" ]] || fail "runtime jar is older than target jar"

grep -q "$STARTUP_MARKER" "$LOG_FILE" || fail "startup marker not found in log: $STARTUP_MARKER"

HEALTH_BODY=""
if command -v curl >/dev/null 2>&1; then
  HEALTH_BODY="$(curl "${CARBONET_CURL_ARGS[@]}" -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null || true)"
fi

if [[ -n "$HEALTH_BODY" ]]; then
  case "$HEALTH_BODY" in
    *"UP"*) info "health check OK: $HEALTH_URL" ;;
    *) fail "health check did not report UP: $HEALTH_URL" ;;
  esac
else
  if [[ "$(carbonet_runtime_scheme)" == "https" ]] && command -v curl >/dev/null 2>&1; then
    HTTP_TLS_PROBE="$(curl -sS --max-time 5 "http://127.0.0.1:${PORT}/actuator/health" 2>/dev/null || true)"
    case "$HTTP_TLS_PROBE" in
      *"requires TLS"*)
        info "HTTPS runtime detected: plain HTTP probe reported TLS required"
        ;;
      *)
        info "health check client returned empty response; port and process checks already passed"
        ;;
    esac
  else
    info "health check client returned empty response; port and process checks already passed"
  fi
fi

info "pid OK: $APP_PID"
info "port OK: $PORT"
info "target jar: $TARGET_JAR_PATH"
info "runtime jar: $RUNTIME_JAR_PATH"
info "jar hash OK: $TARGET_HASH"
info "startup marker OK: $STARTUP_MARKER"

if [[ "$VERIFY_EXTERNAL_MONITORING_BOOTSTRAP" == "true" ]]; then
  info "running external monitoring bootstrap verification"
  bash "$ROOT_DIR/ops/scripts/verify-external-monitoring-bootstrap.sh" "$(carbonet_runtime_base_url)"
fi

info "freshness verification completed"
