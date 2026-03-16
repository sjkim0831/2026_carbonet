#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-18000}"
RUN_DIR="${RUN_DIR:-$ROOT_DIR/var/run}"
PID_FILE="$RUN_DIR/carbonet-${PORT}.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "[stop-18000] pid file not found: $PID_FILE"
  exit 0
fi

APP_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
if [[ -z "${APP_PID:-}" ]]; then
  rm -f "$PID_FILE"
  echo "[stop-18000] stale pid file removed"
  exit 0
fi

if ! kill -0 "$APP_PID" 2>/dev/null; then
  rm -f "$PID_FILE"
  echo "[stop-18000] process already stopped: pid=$APP_PID"
  exit 0
fi

kill "$APP_PID" 2>/dev/null || true

for _ in $(seq 1 20); do
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "[stop-18000] stopped: pid=$APP_PID"
    exit 0
  fi
  sleep 1
done

kill -9 "$APP_PID" 2>/dev/null || true
rm -f "$PID_FILE"
echo "[stop-18000] force stopped: pid=$APP_PID"
