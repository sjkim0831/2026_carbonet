#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
STATE_DIR="$ROOT_DIR/var/blue-green"
ACTIVE_FILE="$STATE_DIR/active-color"

if [ -f "$ACTIVE_FILE" ]; then
  active=$(cat "$ACTIVE_FILE")
else
  active="blue"
fi

if [ "$active" = "blue" ]; then
  target="green"
else
  target="blue"
fi

exec sh "$ROOT_DIR/ops/scripts/docker-blue-green-deploy.sh" "$target"
