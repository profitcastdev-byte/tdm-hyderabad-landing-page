# Deploying to the Profitcast KVM VPS

Static site — no Node, no PHP, no database. Nginx serving a folder is all it needs.

---

## 0. What's already on the box

If the VPS already runs other Profitcast sites, or came with a control panel
template, don't fight it — match what's there. One command reports everything
that matters:

```bash
ssh root@YOUR_VPS_IP 'bash -s' < deploy/detect-stack.sh
```

It prints the OS, web server, any control panel, what's listening on 80/443,
the existing nginx sites, and whether certbot is installed.

- **Nothing listening on 80/443, no panel** → follow steps 1–5 below as written.
- **A panel is installed** (CyberPanel, aaPanel, CloudPanel, Plesk, HestiaCP) →
  skip step 4 and use the panel, see *If the VPS runs a control panel* at the
  bottom.
- **Other sites already in `sites-enabled/`** → still fine. Adding this server
  block is additive; nothing existing is touched.

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

## Cutover order (so the page is never down)

The domain can only point at one place, so do it in this order:

1. **Leave GitHub Pages serving** while you set up the VPS. If Pages is already
   live on `ppf.tdmhyderabad.in`, ads keep running throughout.
2. Get the VPS serving the site over **plain HTTP on its IP first** —
   `http://YOUR_VPS_IP` should show the page. Nothing has changed publicly yet.
3. Only then switch DNS: delete the `CNAME` for `ppf`, add the `A` record.
4. Wait for `dig +short ppf.tdmhyderabad.in` to return the VPS IP, then run
   certbot. It can't issue a certificate until DNS points at the VPS.
5. Once HTTPS is live and the page loads, **turn GitHub Pages off** (repo
   Settings → Pages → Source: None) and delete `CNAME` from the repo.

Step 5 matters: two public copies of the same page can compete in search, and
they drift apart the moment you edit one. The repo stays the source of truth
either way — the VPS just becomes what it deploys to.

`CNAME` is a GitHub Pages file, ignored by nginx, and the deploy script excludes
it — so leaving it in place during the transition breaks nothing.
