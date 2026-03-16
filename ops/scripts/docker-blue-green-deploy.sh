#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
STATE_DIR="$ROOT_DIR/var/blue-green"
NGINX_CONF="$ROOT_DIR/ops/docker/nginx/default.conf"
ACTIVE_FILE="$STATE_DIR/active-color"
TARGET_COLOR="${1:-}"
HEALTH_PATH="${HEALTH_PATH:-/actuator/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
SWITCH_SLEEP="${SWITCH_SLEEP:-5}"

mkdir -p "$STATE_DIR" "$ROOT_DIR/var/logs/blue" "$ROOT_DIR/var/logs/green" \
  "$ROOT_DIR/var/run/blue" "$ROOT_DIR/var/run/green" "$ROOT_DIR/var/file"

log() {
  printf '[blue-green] %s\n' "$*"
}

active_color() {
  if [ -f "$ACTIVE_FILE" ]; then
    cat "$ACTIVE_FILE"
    return 0
  fi
  printf 'blue\n'
}

inactive_color() {
  current=$(active_color)
  if [ "$current" = "blue" ]; then
    printf 'green\n'
  else
    printf 'blue\n'
  fi
}

resolve_target_color() {
  if [ -n "$TARGET_COLOR" ]; then
    case "$TARGET_COLOR" in
      blue|green) printf '%s\n' "$TARGET_COLOR" ;;
      *)
        printf 'Invalid target color: %s\n' "$TARGET_COLOR" >&2
        exit 1
        ;;
    esac
  else
    inactive_color
  fi
}

write_proxy_conf() {
  color="$1"
  cat > "$NGINX_CONF" <<EOF
upstream carbonet_upstream {
    server carbonet-$color:18000;
    keepalive 32;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://carbonet_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF
}

wait_for_http() {
  color="$1"
  container="carbonet-$color"
  attempt=0

  while [ "$attempt" -lt "$HEALTH_TIMEOUT" ]; do
    attempt=$((attempt + 1))
    if docker exec "$container" /bin/bash -lc '
      exec 3<>/dev/tcp/127.0.0.1/18000
      printf "GET '"$HEALTH_PATH"' HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n" >&3
      IFS= read -r status_line <&3 || exit 1
      printf "%s\n" "$status_line" | grep -Eq "HTTP/1\\.[01] 200"
    ' >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

reload_proxy() {
  docker compose -f "$COMPOSE_FILE" exec -T carbonet-proxy nginx -s reload >/dev/null
}

remove_legacy_single_container() {
  if docker ps -a --format '{{.Names}}' | grep -qx 'carbonet-app'; then
    log "Removing legacy single-container deployment"
    docker stop carbonet-app >/dev/null 2>&1 || true
    docker rm carbonet-app >/dev/null 2>&1 || true
  fi
}

target=$(resolve_target_color)
current=$(active_color)
old="carbonet-$current"
new="carbonet-$target"

log "active=$current target=$target"

log "Building app image"
docker compose -f "$COMPOSE_FILE" build carbonet-blue

log "Starting $new"
docker compose -f "$COMPOSE_FILE" up -d "$new"

log "Waiting for $new health check on $HEALTH_PATH"
if ! wait_for_http "$target"; then
  log "Health check failed for $new"
  docker compose -f "$COMPOSE_FILE" logs --tail 120 "$new" || true
  exit 1
fi

log "Ensuring proxy is up"
write_proxy_conf "$current"
remove_legacy_single_container
docker compose -f "$COMPOSE_FILE" up -d carbonet-proxy >/dev/null

log "Switching proxy to $new"
write_proxy_conf "$target"
reload_proxy
printf '%s\n' "$target" > "$ACTIVE_FILE"

sleep "$SWITCH_SLEEP"

log "Stopping old app $old"
docker compose -f "$COMPOSE_FILE" stop "$old" >/dev/null 2>&1 || true

log "Deployment completed. active=$target url=http://localhost:80"
