#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/var/logs"
APP_LOG="$LOG_DIR/carbonet-18000.log"
PORT=18000
JAR_PATH="$ROOT_DIR/target/carbonet.jar"
DB_HOST="${CUBRID_HOST:-localhost}"
DB_PORT="${CUBRID_PORT:-33000}"
DB_NAME="${CUBRID_DB:-carbonet}"
DB_USER="${CUBRID_USER:-dba}"
DB_PASSWORD="${CUBRID_PASSWORD:-}"
DB_URL="jdbc:cubrid:${DB_HOST}:${DB_PORT}:${DB_NAME}:::?charset=UTF-8"

mkdir -p "$LOG_DIR"

echo "[deploy] frontend build"
cd "$ROOT_DIR/frontend"
npm run build

echo "[deploy] backend package"
cd "$ROOT_DIR"
mvn -q -DskipTests package

echo "[deploy] stop existing process on :$PORT if present"
EXISTING_PID="$(sudo ss -lntp 2>/dev/null | awk '/:18000 / { if (match($0, /pid=[0-9]+/)) { print substr($0, RSTART + 4, RLENGTH - 4); exit } }')"
if [[ -n "${EXISTING_PID:-}" ]]; then
  kill -15 "$EXISTING_PID" || true
  sleep 5
fi

echo "[deploy] start application"
setsid sh -c "nohup java -jar '$JAR_PATH' --server.port=$PORT --spring.datasource.url=$DB_URL --spring.datasource.username=$DB_USER --spring.datasource.password=$DB_PASSWORD >> '$APP_LOG' 2>&1 < /dev/null &"

echo "[deploy] waiting for boot"
sleep 20

echo "[deploy] port status"
sudo ss -lntp | grep ":$PORT " || true

echo "[deploy] admin head check"
curl -sSI "http://localhost:$PORT/admin/" || true

echo "[deploy] recent log"
tail -n 20 "$APP_LOG" || true
