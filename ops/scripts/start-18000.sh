#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-18000}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/var/logs}"
RUN_DIR="${RUN_DIR:-$ROOT_DIR/var/run}"
JAR_PATH="${JAR_PATH:-$ROOT_DIR/target/carbonet.jar}"
PID_FILE="$RUN_DIR/carbonet-${PORT}.pid"
LOG_FILE="$LOG_DIR/carbonet-${PORT}.log"

DB_HOST="${CUBRID_HOST:-127.0.0.1}"
DB_PORT="${CUBRID_PORT:-33000}"
DB_NAME="${CUBRID_DB:-carbonet}"
DB_USER="${CUBRID_USER:-dba}"
DB_PASSWORD="${CUBRID_PASSWORD:-}"
DB_URL="jdbc:cubrid:${DB_HOST}:${DB_PORT}:${DB_NAME}:::?charset=UTF-8"
STARTUP_WAIT_SECONDS="${STARTUP_WAIT_SECONDS:-60}"
START_RETRY_COUNT="${START_RETRY_COUNT:-10}"
RETRY_DELAY_SECONDS="${RETRY_DELAY_SECONDS:-5}"

mkdir -p "$LOG_DIR" "$RUN_DIR"

if [[ ! -f "$JAR_PATH" ]]; then
  echo "[start-18000] missing jar: $JAR_PATH" >&2
  exit 1
fi

LOG_START_LINE=1
if [[ -f "$LOG_FILE" ]]; then
  EXISTING_LOG_LINES="$(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)"
  LOG_START_LINE=$((EXISTING_LOG_LINES + 1))
fi

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${EXISTING_PID:-}" ]] && kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "[start-18000] already running: pid=$EXISTING_PID port=$PORT"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

for attempt in $(seq 1 "$START_RETRY_COUNT"); do
  printf '\n[start-18000] %s attempt=%s/%s db=%s log=%s\n' \
    "$(date '+%Y-%m-%d %H:%M:%S')" "$attempt" "$START_RETRY_COUNT" "$DB_URL" "$LOG_FILE" >>"$LOG_FILE"
  setsid java \
    -jar "$JAR_PATH" \
    --server.port="$PORT" \
    --spring.datasource.url="$DB_URL" \
    --spring.datasource.username="$DB_USER" \
    --spring.datasource.password="$DB_PASSWORD" \
    >>"$LOG_FILE" 2>&1 </dev/null &

  APP_PID=$!
  echo "$APP_PID" > "$PID_FILE"

  for _ in $(seq 1 "$STARTUP_WAIT_SECONDS"); do
    if ! kill -0 "$APP_PID" 2>/dev/null; then
      break
    fi
    if tail -n +"$LOG_START_LINE" "$LOG_FILE" 2>/dev/null | grep -q "Tomcat started on port(s): $PORT"; then
      echo "[start-18000] started: pid=$APP_PID port=$PORT log=$LOG_FILE"
      exit 0
    fi
    sleep 1
  done

  if ! kill -0 "$APP_PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    if [[ "$attempt" -lt "$START_RETRY_COUNT" ]]; then
      echo "[start-18000] startup attempt ${attempt}/${START_RETRY_COUNT} exited early. retrying in ${RETRY_DELAY_SECONDS}s..." >&2
      sleep "$RETRY_DELAY_SECONDS"
      continue
    fi
    echo "[start-18000] process exited early. recent log:" >&2
    tail -n +"$LOG_START_LINE" "$LOG_FILE" | tail -n 60 >&2 || true
    exit 1
  fi

  echo "[start-18000] process is running but startup was not confirmed in ${STARTUP_WAIT_SECONDS}s. recent log:" >&2
  tail -n +"$LOG_START_LINE" "$LOG_FILE" | tail -n 60 >&2 || true
  exit 1
done

exit 1
