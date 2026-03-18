#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[build-restart-18000] frontend build started"
(cd "$ROOT_DIR/frontend" && npm run build)

echo "[build-restart-18000] backend package started"
(cd "$ROOT_DIR" && mvn -q -DskipTests package)

echo "[build-restart-18000] service restart started"
bash "$ROOT_DIR/ops/scripts/restart-18000.sh"

echo "[build-restart-18000] completed"
