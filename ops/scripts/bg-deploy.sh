#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)

exec sh "$ROOT_DIR/ops/scripts/docker-blue-green-deploy.sh" "$@"
