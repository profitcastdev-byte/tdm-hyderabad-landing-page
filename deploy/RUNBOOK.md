# Deploying to the Profitcast KVM VPS

Static site — no Node, no PHP, no database. Nginx serving a folder is all it needs.

---

## 1. DNS

The site was previously pointed at GitHub Pages with a `CNAME` record. Hosting
it on the VPS means an **A record to the VPS IP instead** — you cannot have both
a CNAME and an A record on the same name.

At Hostinger (hPanel → Domains → DNS Zone), **delete** any `CNAME` for `ppf`,
then add:

| Type | Name | Points to | TTL |
|---|---|---|---|
| `A` | `ppf` | *your VPS IPv4* | default |

Add an `AAAA` record too if the VPS has IPv6.

Check it before going further — a wrong record here is the usual reason
certbot fails:

```bash
dig +short ppf.tdmhyderabad.in     # should print the VPS IP, nothing else
```

---

## 2. Server prep (once)

```bash
ssh root@YOUR_VPS_IP

apt update && apt install -y nginx certbot python3-certbot-nginx rsync
mkdir -p /var/www/ppf.tdmhyderabad.in /var/www/certbot

ufw allow 'Nginx Full' && ufw allow OpenSSH && ufw --force enable
```

---

## 3. Upload the site

From your machine, in the project root:

```bash
VPS_HOST=YOUR_VPS_IP bash deploy/deploy.sh
```

That rsyncs the site and excludes everything dev-only — `.git`, `.claude`,
`deploy`, `content`, `CNAME`, `README.md`. Only `index.html` and `assets/`
end up served.

---

## 4. Nginx + HTTPS

```bash
# copy the config up (from your machine)
scp deploy/nginx-ppf.tdmhyderabad.in.conf \
    root@YOUR_VPS_IP:/etc/nginx/sites-available/ppf.tdmhyderabad.in

# then on the server
ln -s /etc/nginx/sites-available/ppf.tdmhyderabad.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

certbot --nginx -d ppf.tdmhyderabad.in
```

Certbot writes the `ssl_certificate` lines into the config and sets up renewal.
Confirm renewal works:

```bash
certbot renew --dry-run
```

---

## 5. Check it

```bash
curl -sI https://ppf.tdmhyderabad.in | head -5          # expect 200
curl -s  https://ppf.tdmhyderabad.in | grep -c AW-18240961500   # expect 3
```

Then load it in a browser and click one Call and one WhatsApp button to confirm
the Google Ads conversions still fire.

---

## Redeploying later

One command:

```bash
VPS_HOST=YOUR_VPS_IP bash deploy/deploy.sh
```

`--delete` keeps the server byte-identical to the repo, so removed files
disappear from the server too.

---

## If the VPS runs a control panel

If the KVM has **CyberPanel, aaPanel, CloudPanel, Plesk or Coolify** on it,
don't hand-edit nginx — create the site in the panel instead, let it issue the
SSL certificate, then upload the contents of `index.html` + `assets/` into the
document root it gives you (usually `public_html/` or `htdocs/`). The caching
and gzip rules in `deploy/nginx-*.conf` are still worth copying into the panel's
custom-config box, but everything else is handled for you.

---

## Note on GitHub Pages

`CNAME` in the repo root is a GitHub Pages file and is ignored by nginx — the
deploy script excludes it. If you're moving fully to the VPS you can delete it
and turn Pages off in the repo settings, so the two copies can't drift apart or
compete in search results.
