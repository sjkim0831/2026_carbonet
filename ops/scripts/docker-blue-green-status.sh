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

printf 'active=%s\n' "$active"
printf 'url=http://localhost:80\n'
docker compose -f "$ROOT_DIR/docker-compose.yml" ps
