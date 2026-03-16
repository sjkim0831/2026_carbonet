#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

bash "$ROOT_DIR/ops/scripts/stop-18000.sh"
bash "$ROOT_DIR/ops/scripts/start-18000.sh"
