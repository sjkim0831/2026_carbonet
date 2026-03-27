#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-18000}"
RUN_DIR="${RUN_DIR:-$ROOT_DIR/var/run}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/var/logs}"
PID_FILE="$RUN_DIR/carbonet-${PORT}.pid"
SUPERVISOR_LOG_FILE="${LOG_DIR}/carbonet-${PORT}-supervisor.log"
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-3}"

mkdir -p "$RUN_DIR" "$LOG_DIR"

while true; do
  printf '[run-18000-supervised] %s starting port=%s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$PORT" >>"$SUPERVISOR_LOG_FILE"

  if ! bash "$ROOT_DIR/ops/scripts/start-18000.sh" >>"$SUPERVISOR_LOG_FILE" 2>&1; then
    printf '[run-18000-supervised] %s startup failed; retry in %ss\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$RESTART_DELAY_SECONDS" >>"$SUPERVISOR_LOG_FILE"
    sleep "$RESTART_DELAY_SECONDS"
    continue
  fi

  APP_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -z "${APP_PID:-}" ]]; then
    printf '[run-18000-supervised] %s pid file missing after startup; retry in %ss\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$RESTART_DELAY_SECONDS" >>"$SUPERVISOR_LOG_FILE"
    sleep "$RESTART_DELAY_SECONDS"
    continue
  fi

  while kill -0 "$APP_PID" 2>/dev/null; do
    sleep 5
  done

  rm -f "$PID_FILE"
  printf '[run-18000-supervised] %s process exited pid=%s; restart in %ss\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$APP_PID" "$RESTART_DELAY_SECONDS" >>"$SUPERVISOR_LOG_FILE"
  sleep "$RESTART_DELAY_SECONDS"
done
