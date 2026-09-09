#!/usr/bin/env bash
# Run this ON THE VPS to report what's already installed, so the deploy
# steps can be matched to it:
#     ssh root@YOUR_VPS_IP 'bash -s' < deploy/detect-stack.sh
echo "── OS ────────────────────────────────"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" || uname -a

echo; echo "── Web server ────────────────────────"
for s in nginx apache2 httpd caddy litespeed lshttpd openlitespeed; do
  if command -v "$s" >/dev/null 2>&1 || systemctl list-units --type=service 2>/dev/null | grep -q "^\s*${s}\."; then
    printf '%-12s installed' "$s"
    systemctl is-active "$s" 2>/dev/null | sed 's/^/  (/;s/$/)/' || echo
  fi
done
command -v nginx >/dev/null && nginx -v 2>&1

echo; echo "── Control panel ─────────────────────"
found=0
for p in /usr/local/CyberCP:CyberPanel /www/server/panel:aaPanel \
         /home/cloudpanel:CloudPanel /opt/psa:Plesk /usr/local/cpanel:cPanel \
         /data/coolify:Coolify /opt/hestiacp:HestiaCP; do
  path="${p%%:*}"; name="${p##*:}"
  [ -d "$path" ] && { echo "$name  ($path)"; found=1; }
done
command -v docker >/dev/null && { echo "docker $(docker --version 2>/dev/null | cut -d, -f1)"; found=1; }
[ "$found" = 0 ] && echo "none detected — plain server"

echo; echo "── Ports 80/443 ──────────────────────"
(ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null) | grep -E ':(80|443)\b' || echo "nothing listening"

echo; echo "── Existing sites ────────────────────"
ls /etc/nginx/sites-enabled/ 2>/dev/null || ls /etc/nginx/conf.d/ 2>/dev/null || echo "(no nginx site dir)"

echo; echo "── Certbot ───────────────────────────"
command -v certbot >/dev/null && certbot --version 2>&1 || echo "not installed"
