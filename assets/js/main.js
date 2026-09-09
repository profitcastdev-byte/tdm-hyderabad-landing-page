/* ==========================================================================
   The Detailing Mafia — Hyderabad | PPF Landing Page
   --------------------------------------------------------------------------
   >>> CLIENT DETAILS — EDIT THIS BLOCK ONLY <<<
   Change the values below and every phone / WhatsApp link on the page updates
   automatically (header, hero, cards, footer, floating buttons, mobile bar).
   ========================================================================== */
const CLIENT = {
  // Phone number for tel: links. Digits only, with country code.
  phone: '919700463786',
  // Human-readable version shown in the footer.
  phoneDisplay: '+91 97004 63786',
  // WhatsApp number. Digits only, with country code, no '+' and no spaces.
  whatsapp: '919700463786',
  // Pre-filled WhatsApp message.
  whatsappMessage: "Hi, I'd like a free PPF inspection in Hyderabad. My car model is: ",
  // Contact email.
  email: 'hello@example.com',
  // Studio address (use <br> for line breaks).
  address: 'D.No: 8-2-120/86/9/A/44, Road No. 14,<br>BNR Colony, Venkat Nagar, Banjara Hills,<br>Hyderabad, Telangana 500034',
  // Opening hours, shown in the Visit section.
  hours: 'Monday – Sunday · 10:00 AM – 8:00 PM',
  // Map embed for the Visit section.
  // Google Maps -> find the studio -> Share -> Embed a map -> copy the src URL.
  mapEmbed: 'https://www.google.com/maps?q=8-2-120%2F86%2F9%2FA%2F44%2C%20Road%20No.%2014%2C%20BNR%20Colony%2C%20Venkat%20Nagar%2C%20Banjara%20Hills%2C%20Hyderabad%2C%20Telangana%20500034&z=17&output=embed',
  // Where the "Get directions" link goes.
  mapLink: 'https://www.google.com/maps/search/?api=1&query=8-2-120%2F86%2F9%2FA%2F44%2C%20Road%20No.%2014%2C%20BNR%20Colony%2C%20Venkat%20Nagar%2C%20Banjara%20Hills%2C%20Hyderabad%2C%20Telangana%20500034'
};
/* ====================== END OF CLIENT DETAILS BLOCK ====================== */


/* ==========================================================================
   GOOGLE ADS CONVERSION TRACKING
   The base gtag.js tag is in the <head> of index.html; only the conversion
   labels live here.

   NOTE: Google hands you the same function name (`gtag_report_conversion`)
   in every snippet. Pasting both as-is means the second definition silently
   overwrites the first, and every conversion reports as whichever snippet
   loaded last. That is why the two labels are kept as data below and fired
   through one function instead.
   ========================================================================== */
const ADS = {
  id: 'AW-18240961500',
  conversions: {
    phone:    { send_to: 'AW-18240961500/-qDzCOvKtcEcENz3-_lD', value: 1.0, currency: 'INR' },
    whatsapp: { send_to: 'AW-18240961500/ux-ZCKWatsEcENz3-_lD', value: 1.0, currency: 'INR' }
  }
};
/* ==================== END OF CONVERSION TRACKING BLOCK ==================== */


(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     1. Inject client contact details into every link
     ---------------------------------------------------------------------- */
  function applyClientDetails() {
    const telHref = 'tel:+' + CLIENT.phone;
    const waHref  = 'https://wa.me/' + CLIENT.whatsapp +
                    '?text=' + encodeURIComponent(CLIENT.whatsappMessage);

    $$('a[href^="tel:"]').forEach(a => { a.href = telHref; });
    $$('a[href*="wa.me/"]').forEach(a => { a.href = waHref; });
    $$('a[href^="mailto:"]').forEach(a => { a.href = 'mailto:' + CLIENT.email; });

    const footerPhone = $('.footer-col a[data-cta="footer-phone"]');
    if (footerPhone) footerPhone.textContent = CLIENT.phoneDisplay;

    const addr = $('.footer-addr');
    if (addr) addr.innerHTML = CLIENT.address;

    // Visit / map section
    const visitPhone = $('[data-visit="phone"]');
    if (visitPhone) visitPhone.textContent = CLIENT.phoneDisplay;

    const visitAddr = $('[data-visit="address"]');
    if (visitAddr) visitAddr.innerHTML = CLIENT.address.replace(/<br\s*\/?>/gi, ' ');

    const visitHours = $('[data-visit="hours"]');
    if (visitHours) visitHours.textContent = CLIENT.hours;

    // every address block on the page opens the map
    $$('[data-maplink]').forEach(a => { a.href = CLIENT.mapLink; });

    // only reassign if it differs, so the iframe isn't fetched twice
    const map = $('[data-visit="map"]');
    if (map && CLIENT.mapEmbed && map.getAttribute('src') !== CLIENT.mapEmbed) {
      map.src = CLIENT.mapEmbed;
    }

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------------------
     2. Scroll progress bar
     ---------------------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)).toFixed(4) + ')';
    };
    onScroll(update);
    update();
  }

  /* ----------------------------------------------------------------------
     3. Sticky header state
     ---------------------------------------------------------------------- */
  function initHeader() {
    const header = $('#siteHeader');
    if (!header) return;
    onScroll(() => header.classList.toggle('is-stuck', window.scrollY > 24));
  }

  /* ----------------------------------------------------------------------
     4. Smooth scroll for in-page anchors
        Hand-rolled rather than `behavior:'smooth'`, because the native curve
        is short and decelerates abruptly. This eases in and out over a
        distance-scaled duration, which reads far calmer on a long page.
     ---------------------------------------------------------------------- */
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function scrollToY(targetY) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    // 620ms for a short hop, up to 1100ms across the whole page
    const duration = Math.min(1100, Math.max(620, Math.abs(distance) * 0.5));
    const startTime = performance.now();

    const step = now => {
      const t = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initSmoothScroll() {
    const headerH = () => ($('#siteHeader')?.offsetHeight || 0) + 20;

    $$('a[href^="#"]').forEach(link => {
      const id = link.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;

      link.addEventListener('click', e => {
        const target = document.getElementById(id.slice(1));
        if (!target) return;

        e.preventDefault();
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerH());

        if (prefersReducedMotion) window.scrollTo(0, top);
        else scrollToY(top);

        // keep keyboard focus in sync without a second jump
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. Scroll reveal animations
     ---------------------------------------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');

    // stagger delay from data-delay
    items.forEach(el => {
      const d = el.dataset.delay;
      if (d) el.style.setProperty('--d', d);
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });

    items.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------------------
     6. FAQ accordion — one open at a time.
        The open/close animation is pure CSS (grid-template-rows 0fr → 1fr),
        so all this does is toggle a class and keep aria in sync.
     ---------------------------------------------------------------------- */
  function initAccordion() {
    const items = $$('.acc-item');

    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      $('.acc-head', item).setAttribute('aria-expanded', String(open));
    };

    items.forEach(item => {
      setOpen(item, false);

      $('.acc-head', item).addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach(other => { if (other !== item) setOpen(other, false); });
        setOpen(item, willOpen);
      });
    });
  }

  /* ----------------------------------------------------------------------
     7. Floating buttons + persistent mobile CTA bar
     ---------------------------------------------------------------------- */
  function initFloatingCTAs() {
    const fabs = $$('.fab');
    const bar  = $('#mobileBar');
    const footer = $('.site-footer');

    let footerVisible = false;
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        footerVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(footer);
    }

    function update() {
      const scrolled = window.scrollY > 320;
      fabs.forEach(f => f.classList.toggle('is-visible', scrolled));
      if (bar) bar.classList.toggle('is-visible', scrolled && !footerVisible);
    }

    onScroll(update);
    update();
  }

  /* ----------------------------------------------------------------------
     8. Subtle parallax drift on the hero banner (desktop, motion-safe only)
        The image is scaled up first so there is margin to move into —
        without it, drifting would expose a gap at the edge of the section.
     ---------------------------------------------------------------------- */
  const PARALLAX_SCALE = 1.08;
  const PARALLAX_RATE  = 0.05;   // px moved per px scrolled

  function initHeroParallax() {
    const img = $('.hero-bg img');
    if (!img || prefersReducedMotion || window.innerWidth < 900) return;

    const hero = $('.hero');
    img.style.willChange = 'transform';

    const draw = () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      // never travel further than the margin the scale-up bought us
      const limit = hero.offsetHeight * (PARALLAX_SCALE - 1) / 2;
      const shift = Math.min(limit, y * PARALLAX_RATE);
      img.style.transform =
        'translate3d(0,' + shift.toFixed(2) + 'px,0) scale(' + PARALLAX_SCALE + ')';
    };

    draw();
    onScroll(draw);
  }

  /* ----------------------------------------------------------------------
     9. Trust marquee
        Duplicates the row until the track covers the viewport twice over,
        so the loop point never becomes visible, and derives the duration
        from the row width so the strip always drifts at MARQUEE_SPEED —
        the same slow pace on a phone as on an ultrawide monitor.
     ---------------------------------------------------------------------- */
  const MARQUEE_SPEED = 32; // px per second

  function initMarquee() {
    if (prefersReducedMotion) return;

    $$('.marquee').forEach(marquee => {
      const track = $('.marquee-track', marquee);
      if (!track) return;

      // drop any clones from a previous run so this is safe to re-invoke
      $$('.marquee-row', track).forEach((row, i) => { if (i) row.remove(); });

      const base = $('.marquee-row', track);
      if (!base) return;

      const rowW = base.getBoundingClientRect().width;
      if (!rowW) return;

      const copies = Math.max(2, Math.ceil((marquee.clientWidth * 2) / rowW));
      for (let i = 1; i < copies; i++) {
        const clone = base.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true'); // screen readers read the row once
        track.appendChild(clone);
      }

      track.style.setProperty('--marquee-copies', copies);
      track.style.setProperty('--marquee-dur', (rowW / MARQUEE_SPEED).toFixed(2) + 's');
    });
  }

  /* ----------------------------------------------------------------------
     10. Google Ads conversion tracking
         Fires on every phone and WhatsApp link on the page — found by href,
         so links added later are covered automatically, with no inline
         onclick handlers to keep in sync.
     ---------------------------------------------------------------------- */
  function reportConversion(type, url) {
    const conv = ADS.conversions[type];

    // gtag missing (ad blocker, offline, tag not loaded yet) — never let
    // tracking stand between the visitor and the call
    if (!conv || typeof window.gtag !== 'function') {
      if (url) window.location = url;
      return false;
    }

    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      if (url) window.location = url;
    };

    window.gtag('event', 'conversion', Object.assign({}, conv, {
      event_callback: go
    }));

    // don't strand the visitor if the callback never comes back
    if (url) setTimeout(go, 900);
    return false;
  }

  // exposed for manual use, e.g. onclick="return gtagReportPhone(this.href)"
  window.gtagReportPhone    = url => reportConversion('phone', url);
  window.gtagReportWhatsApp = url => reportConversion('whatsapp', url);

  function initConversionTracking() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const type = href.startsWith('tel:')     ? 'phone'
                 : href.includes('wa.me/')     ? 'whatsapp'
                 : null;
      if (!type) return;

      // let ctrl/cmd/middle clicks open in a new tab untouched
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // tel: hands off to the dialer and target=_blank opens a new tab —
      // neither unloads this page, so the ping has time to send without
      // us having to intercept navigation
      reportConversion(type, null);
    }, true);
  }

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */
  const scrollHandlers = [];
  let ticking = false;

  function onScroll(fn) {
    scrollHandlers.push(fn);
    if (scrollHandlers.length === 1) {
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          scrollHandlers.forEach(h => h());
          ticking = false;
        });
      }, { passive: true });
    }
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ----------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */
  function init() {
    applyClientDetails();
    initScrollProgress();
    initHeader();
    initSmoothScroll();
    initReveal();
    initAccordion();
    initFloatingCTAs();
    initHeroParallax();
    initMarquee();
    initConversionTracking();

    // the row is measured in px, so re-measure once the webfont swaps in
    // and whenever the viewport changes width
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initMarquee);
    }
    window.addEventListener('resize', debounce(initMarquee, 200));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
