#!/usr/bin/env bash
# Independent run script for p003
cd "$(dirname "$0")"
exec java -Dloader.path=lib/ -jar project-runtime.jar \
  --spring.profiles.active=prod \
  --app.project-id="p003" \
  "$@"
