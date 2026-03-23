#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRANCH="${BRANCH:-main}"
WORKSPACE_DIR="${WORKSPACE_DIR:-$ROOT_DIR/.jenkins-workspace}"
REPO_URL="${REPO_URL:-https://github.com/sjkim0831/2026_carbonet.git}"
BUILD_DIR="${BUILD_DIR:-$WORKSPACE_DIR/repo}"
ARTIFACT_DIR="${ARTIFACT_DIR:-$ROOT_DIR/var/artifacts/jenkins}"
ARTIFACT_NAME="${ARTIFACT_NAME:-carbonet.jar}"
GIT_CREDENTIALS_HEADER="${GIT_CREDENTIALS_HEADER:-}"
MAIN_TARGET="${MAIN_TARGET:-carbonet2026@136.117.100.221}"
MAIN_REMOTE_ROOT="${MAIN_REMOTE_ROOT:-/opt/projects/carbonet}"
MAIN_REMOTE_PASSWORD="${MAIN_REMOTE_PASSWORD:-}"
MAIN_SSH_PASSWORD="${MAIN_SSH_PASSWORD:-$MAIN_REMOTE_PASSWORD}"
IDLE_SCALE_ENABLED="${IDLE_SCALE_ENABLED:-true}"
IDLE_RESTORE_ENABLED="${IDLE_RESTORE_ENABLED:-true}"
IDLE_SSH_PASSWORD="${IDLE_SSH_PASSWORD:-}"

log() {
  printf '[jenkins-deploy-carbonet] %s\n' "$*"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

git_fetch() {
  if [[ -d "$BUILD_DIR/.git" ]]; then
    if [[ -n "$GIT_CREDENTIALS_HEADER" ]]; then
      git -C "$BUILD_DIR" -c "http.https://github.com/.extraheader=${GIT_CREDENTIALS_HEADER}" fetch origin "$BRANCH"
    else
      git -C "$BUILD_DIR" fetch origin "$BRANCH"
    fi
    git -C "$BUILD_DIR" checkout -f FETCH_HEAD
    return 0
  fi

  mkdir -p "$WORKSPACE_DIR"
  if [[ -n "$GIT_CREDENTIALS_HEADER" ]]; then
    git -c "http.https://github.com/.extraheader=${GIT_CREDENTIALS_HEADER}" clone --branch "$BRANCH" --single-branch "$REPO_URL" "$BUILD_DIR"
  else
    git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$BUILD_DIR"
  fi
}

build_artifact() {
  log "frontend build"
  (cd "$BUILD_DIR/frontend" && npm run build)

  log "backend package"
  (cd "$BUILD_DIR" && mvn -q -DskipTests package)
}

archive_artifact() {
  mkdir -p "$ARTIFACT_DIR"
  cp "$BUILD_DIR/target/$ARTIFACT_NAME" "$ARTIFACT_DIR/$ARTIFACT_NAME"
  cp "$BUILD_DIR/target/$ARTIFACT_NAME" "$ARTIFACT_DIR/carbonet-$(date +%Y%m%d-%H%M%S).jar"
}

deploy_main() {
  local remote_tmp="/tmp/$ARTIFACT_NAME"
  if [[ -n "$MAIN_REMOTE_PASSWORD" ]]; then
    require_command sshpass
    sshpass -p "$MAIN_REMOTE_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
      "$ARTIFACT_DIR/$ARTIFACT_NAME" "${MAIN_TARGET}:${remote_tmp}"
    sshpass -p "$MAIN_REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$MAIN_TARGET" \
      "mkdir -p '$MAIN_REMOTE_ROOT/target' && mv '$remote_tmp' '$MAIN_REMOTE_ROOT/target/$ARTIFACT_NAME' && bash '$MAIN_REMOTE_ROOT/ops/scripts/deploy-blue-green-221.sh'"
    return 0
  fi

  scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    "$ARTIFACT_DIR/$ARTIFACT_NAME" "${MAIN_TARGET}:${remote_tmp}"
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$MAIN_TARGET" \
    "mkdir -p '$MAIN_REMOTE_ROOT/target' && mv '$remote_tmp' '$MAIN_REMOTE_ROOT/target/$ARTIFACT_NAME' && bash '$MAIN_REMOTE_ROOT/ops/scripts/deploy-blue-green-221.sh'"
}

scale_idle_if_needed() {
  if [[ "$IDLE_SCALE_ENABLED" != "true" ]]; then
    log "idle scale skipped"
    return 0
  fi
  SOURCE_JAR_PATH="$ARTIFACT_DIR/$ARTIFACT_NAME" bash "$ROOT_DIR/ops/scripts/scale-out-idle-runtime.sh"
}

restore_idle_if_requested() {
  if [[ "$IDLE_RESTORE_ENABLED" != "true" ]]; then
    log "idle restore skipped"
    return 0
  fi
  if [[ "${DRAIN_IDLE_TARGET_IP:-}" == "" ]]; then
    return 0
  fi
  TARGET_IP="$DRAIN_IDLE_TARGET_IP" bash "$ROOT_DIR/ops/scripts/restore-idle-node-state.sh"
}

main() {
  require_command git
  require_command npm
  require_command mvn

  git_fetch
  build_artifact
  archive_artifact
  deploy_main
  scale_idle_if_needed
  restore_idle_if_requested
  log "completed"
}

main "$@"
