#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROOT_TARGET_JAR_PATH="$ROOT_DIR/target/carbonet.jar"
APP_TARGET_JAR_PATH="$ROOT_DIR/apps/carbonet-app/target/carbonet.jar"
SOURCE_JAR_PATH="${SOURCE_JAR_PATH:-}"
FRONTEND_STATIC_DIR="$ROOT_DIR/src/main/resources/static/react-app"
FRONTEND_MANIFEST_PATH="$FRONTEND_STATIC_DIR/.vite/manifest.json"

if [[ -z "$SOURCE_JAR_PATH" ]]; then
  if [[ -f "$ROOT_TARGET_JAR_PATH" ]]; then
    SOURCE_JAR_PATH="$ROOT_TARGET_JAR_PATH"
  else
    SOURCE_JAR_PATH="$APP_TARGET_JAR_PATH"
  fi
fi

require_fresh_source_jar() {
  if [[ ! -f "$SOURCE_JAR_PATH" ]]; then
    echo "[restart-18000-runtime] missing source jar: $SOURCE_JAR_PATH" >&2
    exit 1
  fi

  if [[ ! -d "$FRONTEND_STATIC_DIR" ]]; then
    return 0
  fi

  local jar_mtime
  local manifest_mtime
  jar_mtime="$(stat -c %Y "$SOURCE_JAR_PATH" 2>/dev/null || echo 0)"
  manifest_mtime="$(stat -c %Y "$FRONTEND_MANIFEST_PATH" 2>/dev/null || echo 0)"

  if [[ "$manifest_mtime" -gt "$jar_mtime" ]]; then
    echo "[restart-18000-runtime] source jar is older than frontend manifest. package before runtime-only restart." >&2
    echo "[restart-18000-runtime] required sequence: (cd frontend && npm run build) && mvn -q -DskipTests package" >&2
    exit 1
  fi

  local newest_static_file
  newest_static_file="$(find "$FRONTEND_STATIC_DIR" -type f -newer "$SOURCE_JAR_PATH" ! -path '*/.git/*' | head -n 1 || true)"
  if [[ -n "$newest_static_file" ]]; then
    echo "[restart-18000-runtime] source jar is older than frontend asset: $newest_static_file" >&2
    echo "[restart-18000-runtime] required sequence: (cd frontend && npm run build) && mvn -q -DskipTests package" >&2
    exit 1
  fi
}

require_fresh_source_jar
bash "$ROOT_DIR/ops/scripts/stop-18000.sh"
tmux new-session -d -s carbonet18000 "cd '$ROOT_DIR' && bash '$ROOT_DIR/ops/scripts/run-18000-supervised.sh'"
