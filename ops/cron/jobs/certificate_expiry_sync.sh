#!/usr/bin/env bash
set -euo pipefail

source /opt/projects/carbonet/ops/cron/jobs/common.sh

APP_STATUS="$(probe_app)"
log_job "certificate_expiry_sync" "certificate expiry sync probe, app_status=${APP_STATUS}"
