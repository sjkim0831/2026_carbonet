#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESTART_MODE="${RESTART_MODE:-fresh}"

if [[ "$RESTART_MODE" == "runtime-only" ]]; then
  bash "$ROOT_DIR/ops/scripts/restart-18000-runtime.sh"
  exit 0
fi

if [[ "$RESTART_MODE" != "fresh" ]]; then
  echo "[restart-18000] unsupported RESTART_MODE=$RESTART_MODE (supported: fresh, runtime-only)" >&2
  exit 1
fi

echo "[restart-18000] fresh restart started"
(cd "$ROOT_DIR/frontend" && npm run build)
(cd "$ROOT_DIR" && mvn -q -DskipTests package)
bash "$ROOT_DIR/ops/scripts/restart-18000-runtime.sh"
echo "[restart-18000] fresh restart completed"
