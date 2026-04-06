#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CERT_DIR="${CERT_DIR:-$ROOT_DIR/ops/config/certs}"
CERT_ALIAS="${CERT_ALIAS:-carbonet-local}"
CERT_PASSWORD="${CERT_PASSWORD:-changeit}"
CERT_DNAME="${CERT_DNAME:-CN=localhost, OU=Carbonet, O=Carbonet, L=Seoul, ST=Seoul, C=KR}"
CERT_FILE="${CERT_FILE:-$CERT_DIR/carbonet-localhost.p12}"
CERT_VALIDITY_DAYS="${CERT_VALIDITY_DAYS:-3650}"

mkdir -p "$CERT_DIR"

keytool -genkeypair \
  -alias "$CERT_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -storetype PKCS12 \
  -keystore "$CERT_FILE" \
  -storepass "$CERT_PASSWORD" \
  -keypass "$CERT_PASSWORD" \
  -validity "$CERT_VALIDITY_DAYS" \
  -dname "$CERT_DNAME" \
  -ext "SAN=dns:localhost,ip:127.0.0.1"

echo "[generate-localhost-https-cert] generated $CERT_FILE"
echo "[generate-localhost-https-cert] add these to ops/config/carbonet-18000.env if needed:"
echo "SERVER_SSL_ENABLED=true"
echo "SERVER_SSL_KEY_STORE=$CERT_FILE"
echo "SERVER_SSL_KEY_STORE_PASSWORD=$CERT_PASSWORD"
echo "SERVER_SSL_KEY_STORE_TYPE=PKCS12"
echo "SERVER_SSL_KEY_ALIAS=$CERT_ALIAS"
echo "CARBONET_RUNTIME_SCHEME=https"
echo "CARBONET_CURL_INSECURE=true"
echo "CARBONET_HEALTH_CHECK_URL=https://127.0.0.1:18000/actuator/health"
