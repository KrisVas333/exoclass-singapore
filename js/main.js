/* ExoClass × Singapore · vanilla JS + GSAP/ScrollTrigger · rule 16 tracking */
(function () {
  'use strict';

  // ---------- config ----------
  var CLARITY_ID = 'y4gk0je1j0'; // krisvas umbrella project, filter by URL
  var CONSENT_KEY = 'exo-sg-consent-v1';
  var MAIL_SUBJECT = 'ExoClass × Singapore';
  var MAIL = { kris: 'kristijonas.vasiliauskas@gmail.com', lukas: 'lukas.edu@exoclass.io' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  var SRC = (params.get('src') || 'direct').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'direct';
  function track(name, props) { if (typeof window.bt === 'function') { try { window.bt(name, Object.assign({ src: SRC }, props || {})); } catch (e) {} } }

  // ---------- mailto links (prefilled subject) ----------
  function mailto(kind) {
    var s = encodeURIComponent(MAIL_SUBJECT);
    if (kind === 'call') {
      var body = encodeURIComponent('Hi Kris and Lukas,\n\nI would like a 15-minute ExoClass demo while you are in Singapore (25–30 Oct) or online.\n\nMy organisation:\nWhat we run (activity, number of kids):\nBest days/times:\n');
      return 'mailto:' + MAIL.kris + '?cc=' + MAIL.lukas + '&subject=' + s + '&body=' + body;
    }
    return 'mailto:' + MAIL[kind] + '?subject=' + s;
  }
  $$('[data-mail]').forEach(function (a) { a.setAttribute('href', mailto(a.getAttribute('data-mail'))); });

  // WhatsApp: hidden until a real number is set in data-whatsapp
  var wa = $('#waBtn');
  if (wa) {
    var n = (wa.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
    if (n.length >= 8) { wa.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent(MAIL_SUBJECT); wa.hidden = false; }
  }

  // ---------- CTA tracking ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cta]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    track('cta', { where: a.getAttribute('data-cta'), type: href.indexOf('mailto:') === 0 ? 'mailto' : href.indexOf('wa.me') > -1 ? 'whatsapp' : 'link' });
  });

  // ---------- presenter video: shown only when a file is wired in ----------
  var ex = $('#explainer');
  if (ex && ex.getAttribute('src')) {
    ex.hidden = false;
    ex.addEventListener('play', function () { track('value', { what: 'explainer_play' }); }, { once: true });
    ex.addEventListener('ended', function () { track('value', { what: 'explainer_end' }); }, { once: true });
  } else if (ex) {
    var sec = $('#video'); if (sec) sec.hidden = true; // never show a broken player
    $$('a[href="#video"]').forEach(function (a) { a.hidden = true; });
  }
  var fa = $('#filmA');
  if (fa) {
    fa.addEventListener('play', function () { track('value', { what: 'filmA_play' }); }, { once: true });
    fa.addEventListener('ended', function () { track('value', { what: 'filmA_end' }); }, { once: true });
  }

  // ---------- client video (YouTube, loads only on click) ----------
  $$('.yt-link').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-yt'), slot = b.nextElementSibling;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true; f.title = 'Client story video';
      slot.appendChild(f); slot.hidden = false; b.hidden = true;
      track('value', { what: 'video', id: id });
    });
  });

  // ---------- admin-time calculator (user's own numbers) ----------
  var cH = $('#cHours'), cR = $('#cRate');
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function calc() {
    var h = +cH.value, r = +cR.value, yh = h * 52;
    $('#oHours').textContent = h + ' h';
    $('#oRate').textContent = 'S$' + r;
    $('#rHours').textContent = fmt(yh);
    $('#rMoney').textContent = 'S$' + fmt(yh * r);
  }
  if (cH && cR) {
    var used = false;
    [cH, cR].forEach(function (i) { i.addEventListener('input', function () { calc(); if (!used) { used = true; track('engage', { what: 'calculator' }); } }); });
    calc();
  }

  // ---------- reached contact = value ----------
  var contact = $('#contact');
  if (contact && 'IntersectionObserver' in window) {
    var seen = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; track('value', { what: 'reached_contact' }); } }); }, { threshold: .3 }).observe(contact);
  }

  // ---------- counters + light motion ----------
  function motion() {
    var g = window.gsap;
    if (!g) return;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    $$('[data-count]').forEach(function (el) {
      var to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
      if (reduce) return;
      var o = { v: 0 };
      g.to(o, { v: to, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top bottom', once: true },
        onStart: function () { el.textContent = '0' + suf; }, onUpdate: function () { el.textContent = fmt(o.v) + suf; } });
    });
    if (reduce) return;
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.eyebrow', { y: 12, opacity: 0, duration: .5 })
      .from('.h1 .ln', { y: 28, opacity: 0, duration: .7, stagger: .12 }, '-=.2')
      .from('.lead, .hero .cta-row, .faces', { y: 16, opacity: 0, duration: .5, stagger: .08 }, '-=.35')
      .from('.phone', { y: 40, rotate: -4, opacity: 0, duration: .9 }, .2)
      .from('.float', { scale: .6, opacity: 0, duration: .5, stagger: .25, ease: 'back.out(2)' }, '-=.3');
    g.to('.phone-shot', { yPercent: -18, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
    ['.pains li', '.mods li', '.q', '.act-grid li', '.person', '.sg-card'].forEach(function (s) {
      var first = $(s); if (!first) return;
      g.from(s, { y: 24, opacity: 0, stagger: .06, duration: .45, ease: 'power2.out', scrollTrigger: { trigger: first.parentNode, start: 'top 85%', once: true } });
    });
  }
  if (document.readyState === 'complete') motion(); else window.addEventListener('load', motion);

  // ---------- consent (rule 16): Clarity only after "Allow" ----------
  var banner = $('#consent');
  function loadClarity() {
    if (!CLARITY_ID || window.clarity) return;
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('set', 'src', SRC);
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    banner.classList.remove('on');
    if (v === 'yes') loadClarity();
    track('engage', { what: 'consent', v: v });
  }
  function openBanner() { banner.classList.add('on'); }
  var saved = null; try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (saved === 'yes') loadClarity();
  $('#consentYes').addEventListener('click', function () { setConsent('yes'); });
  $('#consentNo').addEventListener('click', function () { setConsent('no'); });
  $('#consentOpen').addEventListener('click', openBanner);
  if (params.get('consent') === 'preview') openBanner();
  else if (!saved && CLARITY_ID && 'IntersectionObserver' in window) {
    var hero = $('#hero'), asked = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (!asked && !e.isIntersecting && e.boundingClientRect.top < 0) { asked = true; openBanner(); } }); }).observe(hero);
  }
})();
