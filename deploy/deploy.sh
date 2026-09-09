#!/usr/bin/env bash
# Push the site to the VPS. Run from the project root:
#     bash deploy/deploy.sh
#
# Set these once (or export them in your shell):
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-CHANGE_ME}"          # e.g. 203.0.113.45
VPS_PATH="${VPS_PATH:-/var/www/ppf.tdmhyderabad.in}"

set -euo pipefail

if [ "$VPS_HOST" = "CHANGE_ME" ]; then
  echo "Set VPS_HOST first:  VPS_HOST=1.2.3.4 bash deploy/deploy.sh" >&2
  exit 1
fi

echo "Deploying to ${VPS_USER}@${VPS_HOST}:${VPS_PATH}"

# --delete keeps the server matching the repo exactly.
# Everything excluded below is dev-only and must never be served.
rsync -avz --delete \
  --exclude '.git/' \
  --exclude '.claude/' \
  --exclude 'deploy/' \
  --exclude 'content/' \
  --exclude 'CNAME' \
  --exclude '.gitignore' \
  --exclude 'README.md' \
  ./ "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

ssh "${VPS_USER}@${VPS_HOST}" "chown -R www-data:www-data ${VPS_PATH} && chmod -R 755 ${VPS_PATH}"

echo "Done — https://ppf.tdmhyderabad.in"
