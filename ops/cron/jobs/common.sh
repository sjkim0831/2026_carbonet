#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/projects/carbonet"
LOG_DIR="${PROJECT_ROOT}/logs/cron"
APP_URL="http://127.0.0.1:18000/home"

mkdir -p "${LOG_DIR}"

timestamp() {
    date '+%Y-%m-%d %H:%M:%S %Z'
}

probe_app() {
    local http_code
    http_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${APP_URL}" || true)"
    if [[ "${http_code}" == "200" || "${http_code}" == "302" || "${http_code}" == "401" || "${http_code}" == "403" ]]; then
        echo "UP(${http_code})"
    else
        echo "DOWN(${http_code:-000})"
    fi
}

log_job() {
    local job_name="$1"
    local message="$2"
    printf '[%s] [%s] %s\n' "$(timestamp)" "${job_name}" "${message}"
}
