#!/usr/bin/env bash
set -euo pipefail

source /opt/projects/carbonet/ops/cron/jobs/common.sh

APP_STATUS="$(probe_app)"
log_job "external_token_refresh" "external integration token refresh probe, app_status=${APP_STATUS}"
