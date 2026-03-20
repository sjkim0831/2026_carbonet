#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: resonance-session-loop.sh <session-number|tmux-session> [interval-seconds]

Examples:
  resonance-session-loop.sh 02
  resonance-session-loop.sh res-02-proposal 30

Environment:
  LOOP_PROMPT        Override the prompt sent into tmux.
  LOOP_COMMAND       Override the full command sent into tmux.
  LOOP_WORKDIR       Working directory for a newly created tmux session.
  LOOP_WINDOW        Target window index or name. Default: 0
  LOOP_MODE          auto|rerun. Default: auto
  LOOP_LOG_FILE      Optional log file path.
EOF
}

if [ "${1:-}" = "" ] || [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 1
fi

SESSION_INPUT="$1"
INTERVAL_SECONDS="${2:-60}"
WINDOW_TARGET="${LOOP_WINDOW:-0}"
WORKDIR="${LOOP_WORKDIR:-/opt/projects/carbonet}"
LOOP_MODE="${LOOP_MODE:-auto}"
LOG_FILE="${LOOP_LOG_FILE:-}"

resolve_session_name() {
  case "$1" in
    1|01) echo "res-01-contract" ;;
    2|02) echo "res-02-proposal" ;;
    3|03) echo "res-03-theme" ;;
    4|04) echo "res-04-builder" ;;
    5|05) echo "res-05-frontend" ;;
    6|06) echo "res-06-backend" ;;
    7|07) echo "res-07-db" ;;
    8|08) echo "res-08-deploy" ;;
    9|09) echo "res-09-verify" ;;
    10) echo "res-10-module" ;;
    *) echo "$1" ;;
  esac
}

resolve_default_prompt() {
  case "$1" in
    [0-9]|[0-9][0-9])
      local lane
      lane=$((10#$1))
      echo "docs/ai/80-skills/resonance-10-session-assignment.md ${lane}번 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘"
      ;;
    *)
      echo "재실행 혹은 이어서 해줘"
      ;;
  esac
}

SESSION_NAME="$(resolve_session_name "$SESSION_INPUT")"
DEFAULT_PROMPT="$(resolve_default_prompt "$SESSION_INPUT")"

PROMPT="${LOOP_PROMPT:-$DEFAULT_PROMPT}"
COMMAND="${LOOP_COMMAND:-}"

if ! [[ "$INTERVAL_SECONDS" =~ ^[0-9]+$ ]] || [ "$INTERVAL_SECONDS" -le 0 ]; then
  echo "Interval must be a positive integer: $INTERVAL_SECONDS" >&2
  exit 2
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux not found in PATH." >&2
  exit 3
fi

if [ "$LOOP_MODE" != "auto" ] && [ "$LOOP_MODE" != "rerun" ]; then
  echo "LOOP_MODE must be auto or rerun: $LOOP_MODE" >&2
  exit 4
fi

log_line() {
  local line
  line="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$line"
  if [ -n "$LOG_FILE" ]; then
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "$line" >> "$LOG_FILE"
  fi
}

ensure_session() {
  if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux new-session -d -s "$SESSION_NAME" -c "$WORKDIR"
    log_line "created tmux session $SESSION_NAME at $WORKDIR"
  fi
}

ensure_target() {
  if ! tmux list-panes -t "${SESSION_NAME}:${WINDOW_TARGET}" >/dev/null 2>&1; then
    echo "tmux target not found: ${SESSION_NAME}:${WINDOW_TARGET}" >&2
    exit 5
  fi
}

pane_command() {
  tmux display-message -p -t "${SESSION_NAME}:${WINDOW_TARGET}" '#{pane_current_command}'
}

pane_idle() {
  case "$(pane_command)" in
    bash|zsh|sh|fish) return 0 ;;
    *) return 1 ;;
  esac
}

send_prompt() {
  if [ "$LOOP_MODE" = "rerun" ]; then
    tmux send-keys -t "${SESSION_NAME}:${WINDOW_TARGET}" C-c
  elif ! pane_idle; then
    log_line "pane busy on ${SESSION_NAME}:${WINDOW_TARGET}; current command=$(pane_command); continuing current run"
    return 0
  fi

  if [ -z "$COMMAND" ]; then
    COMMAND="codex exec --skip-git-repo-check -C $(printf '%q' "$WORKDIR") $(printf '%q' "$PROMPT")"
  fi

  tmux send-keys -t "${SESSION_NAME}:${WINDOW_TARGET}" "$COMMAND" C-m
  log_line "sent command to ${SESSION_NAME}:${WINDOW_TARGET}: $COMMAND"
}

log_line "starting loop for $SESSION_NAME every ${INTERVAL_SECONDS}s"

while true; do
  ensure_session
  ensure_target
  send_prompt
  sleep "$INTERVAL_SECONDS"
done
