#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

bash "$ROOT_DIR/ops/scripts/stop-18000.sh"
tmux new-session -d -s carbonet18000 "cd '$ROOT_DIR' && bash '$ROOT_DIR/ops/scripts/run-18000-supervised.sh'"
