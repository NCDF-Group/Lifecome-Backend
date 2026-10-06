#!/usr/bin/env bash
# Deploys the API to the VPS. Run from the repo root on your Mac:
#
#   SERVER=root@62.238.44.127 SSH_KEY=~/lifecome DOMAIN=api.example.com \
#     ./deploy/deploy.sh [--first-time] [--push-env]
#
#   --push-env     upload deploy/.env.production to the server (chmod 600). Required the first time.
#   --first-time   also install the Nginx site for $DOMAIN, and run certbot if CERTBOT_EMAIL is set.
#                  Point the domain's DNS A record at the server BEFORE this, or certbot will fail.
#
# Optional: USE_LOCAL_DB=1 runs Postgres on the server too (see .env.production.example, Option B).
#           APP_DIR (default /opt/lifecome-api).
#
# Needs deploy/server-setup.sh to have been run on the server once.
set -euo pipefail

: "${SERVER:?set SERVER, e.g. root@62.238.44.127}"
: "${SSH_KEY:?set SSH_KEY, e.g. ~/lifecome}"
APP_DIR="${APP_DIR:-/opt/lifecome-api}"
SSH_KEY="${SSH_KEY/#\~/$HOME}"

FIRST_TIME=0
PUSH_ENV=0
for arg in "$@"; do
  case "$arg" in
    --first-time) FIRST_TIME=1 ;;
    --push-env) PUSH_ENV=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if [[ $FIRST_TIME -eq 1 ]]; then
  : "${DOMAIN:?set DOMAIN, e.g. api.example.com (needed for --first-time)}"
fi

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)
ssh_run() { ssh "${SSH_OPTS[@]}" "$SERVER" "$@"; }

cd "$(dirname "$0")/.."

echo "==> Syncing code to $SERVER:$APP_DIR"
ssh_run "mkdir -p '$APP_DIR'"
rsync -az --delete \
  --exclude '.git' --exclude 'node_modules' --exclude 'dist' --exclude 'coverage' \
  --exclude '.env' --exclude '.env.*' --exclude 'deploy/.env.production' \
  -e "ssh ${SSH_OPTS[*]}" \
  ./ "$SERVER:$APP_DIR/"

if [[ $PUSH_ENV -eq 1 ]]; then
  [[ -f deploy/.env.production ]] || { echo "deploy/.env.production not found - copy .env.production.example and fill it in." >&2; exit 1; }
  echo "==> Uploading deploy/.env.production"
  scp "${SSH_OPTS[@]}" deploy/.env.production "$SERVER:$APP_DIR/deploy/.env.production"
  ssh_run "chmod 600 '$APP_DIR/deploy/.env.production'"
fi

ssh_run "test -f '$APP_DIR/deploy/.env.production'" || {
  echo "No .env.production on the server yet - re-run with --push-env." >&2
  exit 1
}

if [[ $FIRST_TIME -eq 1 ]]; then
  echo "==> Installing Nginx site for $DOMAIN"
  ssh_run "sed 's/DOMAIN_PLACEHOLDER/$DOMAIN/g' '$APP_DIR/deploy/nginx/lifecome-api.conf' > /etc/nginx/sites-available/lifecome-api \
    && ln -sf /etc/nginx/sites-available/lifecome-api /etc/nginx/sites-enabled/lifecome-api \
    && rm -f /etc/nginx/sites-enabled/default \
    && nginx -t && systemctl reload nginx"
fi

PROFILE=""
[[ "${USE_LOCAL_DB:-0}" == "1" ]] && PROFILE="COMPOSE_PROFILES=local-db"

echo "==> Building and starting containers (migrations run on API boot)"
ssh_run "cd '$APP_DIR/deploy' && $PROFILE docker compose -f docker-compose.prod.yml up -d --build"

echo "==> Waiting for the API to report healthy"
for i in $(seq 1 30); do
  if ssh_run "curl -fsS http://127.0.0.1:3001/api/v1/health/live" >/dev/null 2>&1; then
    echo "API is up."
    ssh_run "docker image prune -f >/dev/null"
    if [[ $FIRST_TIME -eq 1 && -n "${CERTBOT_EMAIL:-}" ]]; then
      echo "==> Requesting a certificate for $DOMAIN"
      ssh_run "certbot --nginx -d '$DOMAIN' --non-interactive --agree-tos -m '$CERTBOT_EMAIL' --redirect"
    elif [[ $FIRST_TIME -eq 1 ]]; then
      echo "Skipped HTTPS. Once DNS points at the server, run on it:"
      echo "  certbot --nginx -d $DOMAIN --agree-tos -m you@example.com --redirect"
    fi
    echo "Done. Check: curl https://${DOMAIN:-<your-domain>}/api/v1/health/ready"
    exit 0
  fi
  sleep 3
done

echo "API did not become healthy in time. Logs:" >&2
ssh_run "cd '$APP_DIR/deploy' && docker compose -f docker-compose.prod.yml logs --tail=50 api" >&2
exit 1
