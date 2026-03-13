#!/usr/bin/env bash
set -euo pipefail

source /opt/projects/carbonet/ops/cron/jobs/common.sh

APP_STATUS="$(probe_app)"
log_job "heartbeat" "cron heartbeat check, app_status=${APP_STATUS}"
