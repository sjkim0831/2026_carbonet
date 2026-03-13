#!/usr/bin/env bash
set -euo pipefail

source /opt/projects/carbonet/ops/cron/jobs/common.sh

APP_STATUS="$(probe_app)"
log_job "nightly_emission_aggregation" "nightly emissions aggregation probe, app_status=${APP_STATUS}"
