/* ExoClass × Singapore · vanilla JS + GSAP/ScrollTrigger · rule 16 tracking */
(function () {
  'use strict';

  // ---------- config ----------
  // TODO(Neuron/Kris): create a Microsoft Clarity project "ExoClass Singapore" (Strict masking) and paste its id here.
  // While empty, Clarity never loads and the consent banner stays hidden (nothing to consent to).
  var CLARITY_ID = 'y4gk0je1j0';
  var CONSENT_KEY = 'exo-sg-consent-v1';
  var MAIL_SUBJECT = 'ExoClass × Singapore';
  var MAIL = { kris: 'kris@exoclass.lt', lukas: 'lukas@exoclass.lt' };

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
      var body = encodeURIComponent('Hi Kris and Lukas,\n\nI would like to book a 20-minute call while you are in Singapore (25–30 Oct).\n\nMy organisation:\nWhat we run:\nBest days/times:\n');
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

  // ---------- providers by category (only names on the public exoclass.lt/exoclass-partneriai list) ----------
  var P = {
    dance: ['SKILLZ', 'DEMO šokių studija', 'MG šokių studija', 'Lietuvos tarptautinė baleto akademija', 'Šokio harmonija', 'Rai Academy', 'Agnės Kavaliauskaitės šokių studija', 'Follow me', 'Šok šok', 'Modus Dance', 'Šokių studija „Pase“', 'Hooo šokių studija', 'Vip mokykla', 'Neli Beliakaitės Baltijos baleto akademija', 'Šokio namai „Špagatas“'],
    sport: ['Kūdikių ir vaikų gimnastikos mokykla', 'Gero vėjo klubas', 'Atrask sportą', 'Sporto galia', 'Gymland', 'Vaikų lavinimo akademija', 'DSR sporto klubas', 'Sumanus žiogas', 'Oro akrobatikos studija „Delarija“'],
    basket: ['Krepšinio mokykla „Snaiperis“', 'Krepšinio akademija „Saulė“'],
    foot: ['Talentų futbolo akademija'],
    stem: ['Robotikos Akademija*', 'LINEŠA', 'Jaunųjų mokslininkų akademija', 'Robotics & AI club', 'BrAIn club*', 'Naujos kartos kompiuterių mokykla'],
    think: ['EIQ akademija', 'Laikas kartu'],
    lang: ['Išminties kristalas', 'Šiaurės kryptimi', 'Helen Doron'],
    model: ['DuoKidz', 'MPodiumas', 'CatWalk'],
    arts: ['ADI keramika', 'Meninio ugdymo studija „Spalvoti sapnai“', 'Muzikutis', 'Paupio Molynė', 'Muzikali Lapė'],
    martial: ['Kyokushin karate klubas TOSHI', 'Kyokushin karate mokykla SHIN', 'Kapoeristas'],
    tennis: ['Riešės teniso mokykla', 'Teniso akademija „Septyni Šeši“', 'Mostai', 'Play Date']
  };
  var provList = $('#provList'), provCount = $('#provCount'), qEmpty = $('#qEmpty');
  function renderProviders(cat) {
    if (cat === 'all-full') cat = 'full';
    var names = (cat === 'all' || cat === 'full') ? Object.keys(P).reduce(function (acc, k) { return acc.concat(P[k]); }, []) : P[cat] || [];
    provList.innerHTML = '';
    var LIMIT = 12, more = cat === 'all' && names.length > LIMIT ? names.length - LIMIT : 0;
    names.slice(0, more ? LIMIT : names.length).forEach(function (n) {
      var li = document.createElement('li');
      var own = n.slice(-1) === '*';
      li.textContent = own ? n.slice(0, -1) + ' (founder-related)' : n;
      if (own) li.className = 'own';
      provList.appendChild(li);
    });
    if (more) {
      var li = document.createElement('li'), btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'more'; btn.textContent = '+' + more + ' more';
      btn.addEventListener('click', function () { renderProviders('all-full'); track('engage', { what: 'providers_more' }); });
      li.appendChild(btn); provList.appendChild(li);
    }
    provCount.textContent = '· ' + names.length + ((cat === 'all' || cat === 'full') ? ' named publicly' : '');
  }
  function filterQuotes(cat) {
    var shown = 0;
    $$('.q').forEach(function (q) {
      var ok = cat === 'all' || (' ' + q.getAttribute('data-cats') + ' ').indexOf(' ' + cat + ' ') > -1;
      q.hidden = !ok; if (ok) shown++;
    });
    qEmpty.hidden = shown > 0;
    if (!reduce && window.gsap) window.gsap.fromTo('.q:not([hidden])', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .06, ease: 'power2.out' });
  }
  $$('.tabs [role=tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.tabs [role=tab]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      var cat = b.getAttribute('data-cat');
      renderProviders(cat); filterQuotes(cat);
      track('engage', { what: 'category_tab', cat: cat });
    });
  });
  renderProviders('all');

  // ---------- marquee: duplicate row for seamless loop ----------
  var row = $('.mq-row');
  if (row) { var clone = row.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); row.parentNode.appendChild(clone); }

  // ---------- video slots ----------
  var ex = $('#explainer'), soon = $('#explainerSoon');
  if (ex && ex.getAttribute('src')) { ex.hidden = false; if (soon) soon.hidden = true; ex.addEventListener('play', function () { track('value', { what: 'explainer_play' }); }, { once: true }); }
  $$('.yt').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-yt');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true; f.title = b.getAttribute('aria-label') || 'YouTube';
      b.innerHTML = ''; b.appendChild(f); b.disabled = true; b.style.cursor = 'default';
      track('value', { what: 'video', id: id });
    });
  });

  // ---------- reached contact = value ----------
  var contact = $('#contact');
  if (contact && 'IntersectionObserver' in window) {
    var seen = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; track('value', { what: 'reached_contact' }); } }); }, { threshold: .3 }).observe(contact);
  }

  // ---------- testimonial hover tilt (pointer devices only) ----------
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.q').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(800px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  // ---------- counters ----------
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function counters() {
    $$('[data-count]').forEach(function (el) {
      var to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
      if (reduce || !window.gsap) { el.textContent = fmt(to) + suf; return; }
      var o = { v: 0 }; el.textContent = "0" + suf;
      window.gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top bottom', once: true },
        onUpdate: function () { el.textContent = fmt(o.v) + suf; } });
    });
  }

  // ---------- GSAP motion ----------
  function motion() {
    var g = window.gsap;
    if (!g) return;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    counters();
    if (reduce) return;

    // hero entrance
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.eyebrow', { y: 12, opacity: 0, duration: .5 })
      .from('.h1 .ln', { y: 28, opacity: 0, duration: .7, stagger: .12 }, '-=.2')
      .from('.lead, .hero .cta-row, .faces', { y: 16, opacity: 0, duration: .5, stagger: .08 }, '-=.35')
      .from('.phone', { y: 40, rotate: -4, opacity: 0, duration: .9 }, .2)
      .from('.float', { scale: .6, opacity: 0, duration: .5, stagger: .25, ease: 'back.out(2)' }, '-=.3');
    // phone screen slowly scrolls the real widget
    g.to('.phone-shot', { yPercent: -18, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
    g.to('.float', { y: -8, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .5 });

    // problem: forms stack collapses
    g.from('.forms span', { y: -30, opacity: 0, stagger: .08, duration: .4, scrollTrigger: { trigger: '.versus', start: 'top 80%' } });
    g.from('.vs-card', { y: 30, opacity: 0, stagger: .15, duration: .6, scrollTrigger: { trigger: '.versus', start: 'top 85%' } });
    g.from('.mission', { x: -30, opacity: 0, duration: .7, scrollTrigger: { trigger: '.mission', start: 'top 85%' } });

    // product steps
    g.from('.step', { y: 40, opacity: 0, stagger: .14, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: '.flow', start: 'top 80%' } });
    g.from('.stamp', { scale: 2.4, opacity: 0, duration: .45, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.m-inv', start: 'top 80%' } });
    g.from('.m-att .tick', { scale: 0, opacity: 0, stagger: .3, duration: .35, ease: 'back.out(3)', scrollTrigger: { trigger: '.m-att', start: 'top 85%' } });
    g.from('.browser', { y: 50, opacity: 0, duration: .8, scrollTrigger: { trigger: '.browser', start: 'top 88%' } });

    // dashboard: chips fly in from scattered positions and assemble (plays once)
    var chipTl = g.timeline({ scrollTrigger: { trigger: '.board', start: 'top 80%', once: true } });
    $$('.chips li').forEach(function (li, i) {
      chipTl.from(li, { x: (i % 2 ? 1 : -1) * (40 + (i * 37) % 90), y: 50 + (i * 53) % 90, rotate: ((i * 29) % 30) - 15, opacity: 0, duration: .7, ease: 'back.out(1.6)' }, i * .06);
    });

    // quotes
    g.from('.q', { y: 30, opacity: 0, stagger: .07, duration: .5, scrollTrigger: { trigger: '.quotes', start: 'top 85%' } });

    // agents: bubbles + bar
    $$('.agent').forEach(function (a) {
      var t = g.timeline({ scrollTrigger: { trigger: a, start: 'top 85%' } });
      t.from(a.querySelectorAll('.bub'), { y: 14, opacity: 0, scale: .9, stagger: .45, duration: .4, ease: 'back.out(2)' });
      var bar = a.querySelector('.bar-fill span');
      if (bar) t.from(bar, { scaleX: 0, duration: 1, ease: 'power2.out' }, 0);
    });

    // founders
    g.from('.illus', { scale: .94, opacity: 0, duration: .8, scrollTrigger: { trigger: '.founders', start: 'top 80%' } });
    g.from('.person', { x: 30, opacity: 0, stagger: .12, duration: .5, scrollTrigger: { trigger: '.people', start: 'top 85%' } });
    g.from('.pt, .ccard', { y: 24, opacity: 0, stagger: .08, duration: .5, scrollTrigger: { trigger: '.ptypes', start: 'top 85%' } });
  }
  if (document.readyState === 'complete') motion(); else window.addEventListener('load', motion);
  // no GSAP (CDN blocked)? counters already show final text in HTML.

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
  // ask once the visitor scrolls past the hero (never over the first screen); ?consent=preview forces it for QA
  if (params.get('consent') === 'preview') openBanner();
  else if (!saved && CLARITY_ID && 'IntersectionObserver' in window) {
    var hero = $('#hero'), asked = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (!asked && !e.isIntersecting && e.boundingClientRect.top < 0) { asked = true; openBanner(); } }); }).observe(hero);
  }
})();
