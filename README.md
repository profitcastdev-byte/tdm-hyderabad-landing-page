# The Detailing Mafia — Hyderabad | PPF Landing Page

Static landing page built from `TDM Hyderabad - Landing Page Content Brief.pdf`.
Live at <https://ppf.tdmhyderabad.in>.
No build step, no dependencies — open `index.html` or drop the folder on any host.

```
index.html
deploy/                     ← VPS nginx config + deploy script
CNAME                       ← custom domain for GitHub Pages
assets/
  css/style.css
  js/main.js
  img/  hero-banner.jpg, problem-swirl-marks.jpg, work-*.jpg,
        favicon.png, tdm-logo.png, tdm-logo-white.png
content/content-brief.txt   ← text extracted from the source PDF
.claude/                    ← local preview server (not needed for deploy)
```

---

## Client details

Every phone number, WhatsApp link, address and map on the page is driven from
one block at the top of [`assets/js/main.js`](assets/js/main.js). Edit it and the
whole page updates — header, hero, cards, Visit section, footer, floating buttons
and the mobile bar (6 `tel:` links + 6 WhatsApp links).

```js
const CLIENT = {
  phone:            '919700463786',        // digits only, with country code
  phoneDisplay:     '+91 97004 63786',
  whatsapp:         '919700463786',        // digits only, no '+' or spaces
  whatsappMessage:  "Hi, I'd like a free PPF inspection in Hyderabad. My car model is: ",
  email:            'hello@example.com',   // ← still a placeholder
  address:          'D.No: 8-2-120/86/9/A/44, Road No. 14,<br>BNR Colony, …',
  hours:            'Monday – Sunday · 10:00 AM – 8:00 PM',
  mapEmbed:         'https://www.google.com/maps?q=8-2-120…&z=17&output=embed',
  mapLink:          'https://www.google.com/maps/search/?api=1&query=8-2-120…'
};
```

The map is geocoded from the street address, which lands on Road No. 14 in
Banjara Hills. If the studio has a **Google Business Profile**, prefer its own
embed — Google Maps → the business → **Share → Embed a map** → copy the `src`
URL into `mapEmbed`. That pins the exact premises and shows the business name on
the pin instead of a street-level match.

Still placeholder:

| What | Where |
|---|---|
| `email` | `main.js` — `hello@example.com` |
| `<link rel="canonical">` | `index.html` line 9 — set the real domain |

---

## Images

All artwork is in place — the placeholder SVGs have been deleted.

| Slot | File | Size | Weight |
|---|---|---|---|
| Hero banner | `hero-banner.jpg` | 1440 × 900 | 438 KB |
| The Problem | `problem-swirl-marks.jpg` | 1400 × 1050 | 879 KB |
| Studio work 1 | `work-full-body-ppf.jpg` | 1200 × 900 | 536 KB |
| Studio work 2 | `work-luxury-car-protection.jpg` | 1200 × 900 | 539 KB |
| Studio work 3 | `work-certified-installation.jpg` | 1200 × 900 | 466 KB |
| Favicon | `favicon.png` | 1080 × 1080 | 69 KB |
| Logo | `tdm-logo.png` | 881 × 241 | supplied original |
| Logo (white) | `tdm-logo-white.png` | 881 × 241 | generated for dark grounds |

The favicon also serves as the `apple-touch-icon`, and `hero-banner.jpg` is the
`og:image` for link previews.

### Two things worth fixing when you get a chance

**1. The hero banner is smaller than the slot wants.** It's 1440 px wide; the
banner is full-bleed, so on anything wider than a 1440 px screen the browser
upscales it:

| Screen | Upscale applied |
|---|---|
| 1440 | ~7% — fine |
| 1920 | ~43% — visibly soft |
| 2560 | ~90% — clearly soft |

A **2400 × 1350** re-export of the same shot fixes it and needs no code change.
(I reduced the hero parallax zoom from 1.14 to 1.08 to stop it compounding the
upscale — worth putting back to 1.14 for a stronger drift once a larger file
lands. It's `PARALLAX_SCALE` in `main.js`.)

**2. The photos are heavy.** ~2.9 MB across five JPEGs, and the hero is
render-blocking-ish since it loads eagerly. Re-saving at ~75% JPEG quality, or
converting to WebP, typically cuts that by half to two-thirds with no visible
difference. `problem-swirl-marks.jpg` at 879 KB is the worst offender. Nothing
in the code needs to change — same filenames, same dimensions.

### If you replace an image later

Keep the filename and the aspect ratio and it drops straight in. Ratios in use:
hero 16:10 (cropped, see below), The Problem 4:3, studio work 4:3.

**The hero is cropped differently at every viewport** — `object-fit: cover`
across the whole section, so it's never seen whole:

| Viewport | Banner area | Visible of the file |
|---|---|---|
| 1440 × 900 | 1425 × 702 | full width, middle ~78% of height |
| 375 × 812 phone | 375 × 601 | **middle ~39% of the width only** |

On a phone the sides are gone, so **keep the car in the middle third**. The
current banner works because the car is centred. Also avoid text baked into the
image — the headline sits on top of it — and prefer a darker shot, since the
scrim adds its own darkening on top.

---

## Design decisions

**Colour palette — sampled from the supplied logo** (`TDM - Logo.png`), which
contains only three colours:

| Token | Value | Use |
|---|---|---|
| `--red` | `#FF0000` | CTAs, accents, kickers, active states |
| black | `#000000` / `#050505` | Dark ground |
| white | `#FFFFFF` | Light ground |

WhatsApp green (`#25D366`) is the only colour outside the logo — used solely on
the WhatsApp buttons, where the platform colour is the recognisable cue.

**Light and dark, combined.** The page alternates light and dark bands rather
than running dark end to end:

| # | Section | Surface |
|---|---|---|
| 1 | Hero | dark |
| 2 | Trust marquee | **light** |
| 3 | The Problem | dark |
| 4 | Why Us | **light** |
| 5 | What You Get | dark |
| 6 | Process | **light** |
| 7 | Our Work | dark |
| 8 | FAQ | **light** |
| 9–11 | Visit · Final CTA · Footer | dark (one closing block) |

This runs on **surface tokens**, not duplicated rules. `:root` declares the dark
palette; adding `class="surface-light"` to a section re-declares the same token
names and everything inside re-colours automatically:

```css
--bg  --bg-alt  --bg-alt-2      /* grounds: section, card, card hover */
--fg  --fg-strong  --fg-muted  --fg-faint
--border  --border-strong  --scrim  --scrim-hover
--red-ink                       /* red safe for body-size text */
```

Two things to know if you add sections or flip a band:

- **Never hardcode a text or border colour** — reach for a token, or it won't
  survive a surface flip.
- `.surface-light` sets `color` as well as the tokens. `color` inherits as a
  computed value, so without that line every child would keep the dark body
  colour even with the tokens swapped.
- `--red-ink` exists because pure `#FF0000` only reaches ~4:1 on white, under
  the 4.5:1 needed for small text. The light surface swaps in `#C40000` (~6.5:1)
  for kickers, links and the FAQ icons. Large red fills — buttons, the process
  hover marker, the ticks — stay `--red`.

The header stays dark on every surface: it's a constant brand bar carrying the
white logo, and it goes near-opaque as soon as you scroll so it reads cleanly
over the light bands.

**Logo.** The supplied PNG is black artwork on transparency, so it disappears on
a dark ground. `tdm-logo-white.png` was generated from it — ink inverted to white,
the red hat left untouched — and is what the header and footer use. The original
is kept as `tdm-logo.png` for any light-background use; the browser tab uses the
supplied `favicon.png`.

**Font.** Requested Google Sans. It is not distributed on Google Fonts, so the
stack asks for it first and falls back to a matching geometric sans:

```css
--font: "Google Sans", "Google Sans Text", "Product Sans", "Poppins", …
```

Poppins is loaded from Google Fonts and renders for anyone without Google Sans
installed. If you have a licensed Google Sans web font, drop the `.woff2` files
into `assets/img/../fonts/` and add an `@font-face` — the stack already prefers it.

---

## Animation

- **Anchor scrolling** — hand-rolled easing, not `scroll-behavior: smooth`, whose
  curve is short and stops abruptly. Eases in *and* out over a duration that
  scales with distance (620 ms for a short hop, up to 1100 ms across the whole
  page), offset for the sticky header, keyboard focus kept in sync.
  `scroll-behavior` is deliberately **off** in CSS — with both enabled they fight
  each other and the result stutters.
- **Scroll reveal** — `IntersectionObserver`, fires once per element, staggered
  via `data-delay` (90 ms steps). A short 20 px lift over a long, soft curve, so
  sections settle in rather than snapping to a stop.
- **Trust marquee** — the credentials strip drifts left forever at a constant
  **32 px/sec**, set in `MARQUEE_SPEED` in `main.js`. The row is cloned until the
  track covers the viewport twice, and the animation travels exactly one row
  width, so the loop point is never visible at any screen size. Edges fade out,
  and it pauses on hover.
- **Process rows** — oversized ghost numerals beside each step with hairline
  rules between them. Hover wipes a red edge marker down the row, nudges the
  numeral and turns it red. Deliberately *not* another rail — the trust marquee
  already owns the long horizontal motif on this page.
- **Cards** — 6 px lift, border lightens, red rule wipes in across the top.
- **Buttons** — 2 px lift, deeper shadow, light sheen sweeps across on hover.
- **FAQ accordion** — animates `grid-template-rows` 0fr → 1fr instead of a
  JS-measured pixel height. No per-frame height maths, no `height: auto` handoff
  at the end, and it re-measures itself for free when the text reflows on
  resize. The answer fades and lifts in behind it. One panel open at a time.
- **Scroll progress bar** — 3 px red rule at the top, driven by
  `transform: scaleX()` rather than `width`, so it composites instead of
  triggering layout on every scroll frame.
- All of it collapses under `prefers-reduced-motion: reduce`.

## Conversion tracking (Google Ads)

Account **AW-18240961500**. The base gtag.js tag sits in the `<head>` of
`index.html`; the two conversion labels are in the `ADS` block at the top of
`assets/js/main.js`:

```js
const ADS = {
  id: 'AW-18240961500',
  conversions: {
    phone:    { send_to: 'AW-18240961500/-qDzCOvKtcEcENz3-_lD', value: 1.0, currency: 'INR' },
    whatsapp: { send_to: 'AW-18240961500/ux-ZCKWatsEcENz3-_lD', value: 1.0, currency: 'INR' }
  }
};
```

### Why it isn't Google's copy-paste snippet

Google gives you the **same function name — `gtag_report_conversion` — in every
snippet**. Paste the phone one and the WhatsApp one into the same page and the
second silently overwrites the first, so *every* click reports as whichever
loaded last. Both labels are kept as data here and fired through one function,
which sidesteps that entirely.

### How clicks are wired

One delegated listener matches links by `href`, so **every** phone and WhatsApp
link is covered and any added later are too — no inline `onclick` to keep in
sync across 12 buttons:

| Link | Fires |
|---|---|
| `href^="tel:"` — 7 of them | phone conversion |
| `href*="wa.me/"` — 5 of them | WhatsApp conversion |
| everything else (map, logo, anchors) | nothing |

Two deliberate differences from the stock snippet:

- **Navigation is never blocked.** `tel:` hands off to the dialer and the
  WhatsApp links are `target="_blank"` — neither unloads the page, so the ping
  has time to send on its own. Google's version returns `false` and waits on
  `event_callback` to navigate, which strands the visitor if gtag is blocked.
- **Ad-blocker safe.** If `gtag` never loads, the click still works normally.

If you ever need the inline form, two helpers are on `window`:

```html
<a href="tel:..." onclick="return gtagReportPhone(this.href)">Call</a>
<a href="https://wa.me/..." onclick="return gtagReportWhatsApp(this.href)">WhatsApp</a>
```

### Verifying it

Verified locally: the tag loads in `<head>`, and clicking each CTA fires the
right label — all 7 phone links send `-qDzCOvKtcEcENz3-_lD`, both WhatsApp
buttons send `ux-ZCKWatsEcENz3-_lD`, and the map and logo links fire nothing.

Once live, confirm in Google Ads under **Goals → Conversions** (clicks take a
few hours to show), or use the **Google Tag Assistant** browser extension for an
instant check.

---

## Call & WhatsApp buttons

- **Desktop** — round FABs pinned bottom-left (call, red) and bottom-right
  (WhatsApp, green). They fade in past 320 px of scroll and expand to show a
  label on hover.
- **Mobile** — the FABs lift to clear a persistent bottom bar carrying
  **Free Inspection** and **WhatsApp**, per the brief's note that the primary CTA
  should persist on mobile scroll. The bar hides once the footer is in view so it
  never covers the contact details.

---

## Hosting

> **Moving to the Profitcast KVM VPS?** See [`deploy/RUNBOOK.md`](deploy/RUNBOOK.md)
> for the DNS change (CNAME → A record), the nginx config, SSL, and the
> one-command rsync deploy. The GitHub Pages setup below stays valid until you
> switch — but run one or the other, not both.

Live at **https://ppf.tdmhyderabad.in** — served by GitHub Pages from this repo.
The `CNAME` file in the root is what tells Pages to answer on that hostname;
don't delete it, Pages rewrites it if you change the domain in Settings.

### One-time setup

**1. DNS** — at whoever manages `tdmhyderabad.in`, add a CNAME record:

| Type | Name / Host | Value |
|---|---|---|
| `CNAME` | `ppf` | `profitcastdev-byte.github.io.` |

Point it at the **github.io host**, not at this repo's URL. Propagation is
usually minutes, occasionally up to a few hours.

**2. GitHub** — Settings → Pages:
- Source: *Deploy from a branch* → `main` / `(root)`
- Custom domain: `ppf.tdmhyderabad.in` → Save
- Wait for the DNS check to go green, then tick **Enforce HTTPS**

The HTTPS certificate is issued automatically and is free, but only once DNS
resolves — if "Enforce HTTPS" is greyed out, DNS hasn't propagated yet. Come
back in an hour rather than changing anything.

After that, every `git push` redeploys the live site.

### Alternatives

| Host | How | Notes |
|---|---|---|
| **Netlify** | Drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop) | Custom domain in the dashboard |
| **Cloudflare Pages** | Connect this repo | Best option if the DNS is already on Cloudflare |
| **cPanel host** | Upload folder contents to `public_html` | Whatever hosts `tdmhyderabad.in` today |

If you move off GitHub Pages, the only file-level change is deleting `CNAME`.
Three absolute URLs in the `<head>` of `index.html` — `canonical`, `og:url`,
`og:image` — carry the domain; everything else on the page is relative.

---

## Local preview

Open `index.html` directly, or run the bundled static server:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File ".claude/serve.ps1"
```

Then visit <http://localhost:5599>. `.claude/` is a dev convenience only — it
does not need to be deployed.

---

## Section order

Hero → Trust marquee → The Problem → Why Us → What You Get → Process →
Studio work → FAQ → **Visit / map** → Final CTA → Footer.

The Visit section sits directly before the closing CTA so the "where do I go"
answer lands right before the conversion ask. The map renders in **full colour** —
no CSS filter — so the pin, roads and labels read the way people expect them to.

The footer carries the brand block, a **Get in Touch** column (phone and address
only), and an agency
credit — "Designed & managed by **Profitcast Growth Marketing**", where the brand
name links to <https://www.profitcast.com> in a new tab with a red underline on
hover.

## Responsive behaviour

Four breakpoints, each chosen for where a specific layout stops working rather
than for a device name:

| Width | What changes |
|---|---|
| ≤ 720 | Process numeral gutter narrows from 132px to 62px so the copy keeps a usable measure |
| ≤ 1080 | Card grid and What-You-Get grid go 3 → 2 across |
| ≤ 900 | Hero and Problem stack (image first); work grid 3 → 2; Visit stacks with the map on top; footer 2 columns |
| ≤ 640 | Everything single column; header becomes the **centred logo alone**; CTAs go full width; the persistent bottom bar replaces the header CTA |

On phones the header drops the Call button entirely — calling is already covered
twice over by the floating red button and the sticky bottom bar, so the header
is just the logo, centred.

## Checked

Rendered and measured at **320, 360, 375, 414, 480, 640, 768, 1024, 1280, 1440
and 1920 px**. At every one: no horizontal overflow, no element escaping the
viewport, no console errors. The accordion behaves correctly, all contact links
resolve from the single config block, and the timeline nodes sit exactly on the
rail in both the horizontal and vertical layouts.
