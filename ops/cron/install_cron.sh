#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/projects/carbonet"
CRON_FILE="${PROJECT_ROOT}/ops/cron/carbonet.crontab"
BEGIN_MARKER="# BEGIN CARBONET MANAGED CRON"
END_MARKER="# END CARBONET MANAGED CRON"
TMP_FILE="$(mktemp)"

mkdir -p "${PROJECT_ROOT}/logs/cron"

CURRENT_CRONTAB="$(mktemp)"
if crontab -l > "${CURRENT_CRONTAB}" 2>/dev/null; then
    :
else
    : > "${CURRENT_CRONTAB}"
fi

awk -v begin="${BEGIN_MARKER}" -v end="${END_MARKER}" '
    $0 == begin { skip=1; next }
    $0 == end { skip=0; next }
    skip != 1 { print }
' "${CURRENT_CRONTAB}" > "${TMP_FILE}"

{
    cat "${TMP_FILE}"
    echo
    echo "${BEGIN_MARKER}"
    cat "${CRON_FILE}"
    echo "${END_MARKER}"
} | crontab -

rm -f "${TMP_FILE}" "${CURRENT_CRONTAB}"
echo "Installed Carbonet managed cron block."
crontab -l
