#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-18000}"
RUN_DIR="${RUN_DIR:-$ROOT_DIR/var/run}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/var/logs}"
TARGET_JAR_PATH="${TARGET_JAR_PATH:-$ROOT_DIR/target/carbonet.jar}"
RUNTIME_JAR_PATH="${RUNTIME_JAR_PATH:-$RUN_DIR/carbonet-${PORT}.jar}"
PID_FILE="${PID_FILE:-$RUN_DIR/carbonet-${PORT}.pid}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/carbonet-${PORT}.log}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/actuator/health}"
STARTUP_MARKER="${STARTUP_MARKER:-Tomcat started on port(s): ${PORT}}"

fail() {
  echo "[codex-verify-18000-freshness] FAIL: $*" >&2
  exit 1
}

info() {
  echo "[codex-verify-18000-freshness] $*"
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
require_file "$RUNTIME_JAR_PATH"
require_file "$LOG_FILE"

[[ -f "$PID_FILE" ]] || fail "missing pid file: $PID_FILE"
APP_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
[[ -n "${APP_PID:-}" ]] || fail "empty pid file: $PID_FILE"
kill -0 "$APP_PID" 2>/dev/null || fail "process not running for pid=$APP_PID"

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

if command -v curl >/dev/null 2>&1; then
  HEALTH_BODY="$(curl -fsS --max-time 5 "$HEALTH_URL" || true)"
  [[ -n "$HEALTH_BODY" ]] || fail "health check returned empty response: $HEALTH_URL"
  case "$HEALTH_BODY" in
    *"UP"*) ;;
    *) fail "health check did not report UP: $HEALTH_URL" ;;
  esac
  info "health check OK: $HEALTH_URL"
else
  info "curl not found; skipped health check"
fi

info "pid OK: $APP_PID"
info "port OK: $PORT"
info "target jar: $TARGET_JAR_PATH"
info "runtime jar: $RUNTIME_JAR_PATH"
info "jar hash OK: $TARGET_HASH"
info "startup marker OK: $STARTUP_MARKER"
info "freshness verification completed"
