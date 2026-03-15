#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$FRONTEND_DIR"

echo "[react-dev] starting Vite dev server on http://127.0.0.1:5173"
echo "[react-dev] use Spring pages with ?dev=1 to load live React source"
echo "[react-dev] example: http://localhost:18000/mypage?dev=1"
echo "[react-dev] example: http://localhost:18000/home?dev=1"

npm run dev -- --host 127.0.0.1
