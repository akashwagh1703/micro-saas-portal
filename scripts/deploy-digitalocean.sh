#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/autowave/micro-saas-portal}"
BRANCH="${DEPLOY_BRANCH:-master}"
VITE_API_URL="${VITE_API_URL:-https://api.autowave.playltp.in/api}"

cd "$APP_DIR"

echo "==> Deploy portal in $APP_DIR (branch $BRANCH)"
echo "    VITE_API_URL=$VITE_API_URL"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> npm ci"
npm ci

echo "==> vite build"
VITE_API_URL="$VITE_API_URL" npm run build

if command -v nginx >/dev/null 2>&1; then
  echo "==> nginx reload"
  sudo nginx -t && sudo systemctl reload nginx
fi

echo "==> Portal deploy OK (static files in $APP_DIR/dist)"
