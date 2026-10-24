/* =========================================================
   GAYA "MOTION" — 5 varian, masing-masing punya:
   - galeri 3D sendiri: barrel, stack, ring, helix, sphere (geser + momentum + snap)
   - animasi buka sampul sendiri (iris, swipe, spin, blinds, pop)
   - animasi muncul sendiri (pegas/spring dari pustaka Motion)
   - bentuk kartu sendiri (diatur di motion.css)
   Pustaka animasi: assets/vendor/motion.min.js (Motion, lisensi MIT).
   Tanpa Motion / mode hemat gerak: semua tetap tampil, hanya tanpa animasi.
   ========================================================= */
(function () {
  'use strict';
  var DC = window.DECOR;
  if (!DC) return;
  var M = window.Motion || null;
  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ROOT = document.documentElement;
  var ON = !!(M && !REDUCED);
  if (ON) ROOT.classList.add('mo-on');

  /* ---------- util ---------- */
  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); });
    if (html) e.innerHTML = html;
    return e;
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function cssVar(n, fb) { var v = getComputedStyle(ROOT).getPropertyValue(n).trim(); return v || fb; }
  function rnd(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function stagger(t, o) { return M ? M.stagger(t, o) : 0; }
  function tween(from, to, opt, onUpdate) {
    if (!ON) { onUpdate(to); return { stop: function () {}, then: function (f) { f && f(); } }; }
    opt = Object.assign({}, opt, { onUpdate: onUpdate });
    return M.animate(from, to, opt);
  }

  /* =========================================================
     KONFIGURASI VARIAN
     ========================================================= */
  var VAR = {
    velvet: { gallery: 'barrel', count: 8, opening: openIris },
    sorbet: { gallery: 'stack', count: 7, opening: openSwipe },
    orbit: { gallery: 'ring', count: 10, opening: openSpin },
    sage: { gallery: 'helix', count: 9, opening: openBlinds },
    bubble: { gallery: 'sphere', count: 9, opening: openPop }
  };
  var vname = 'velvet', V = VAR.velvet, DATA = {};

  /* =========================================================
     ANIMASI MUNCUL (per varian)
     ========================================================= */
  var EASE = [0.22, 0.8, 0.2, 1], EASE_IO = [0.7, 0, 0.2, 1];
  var REVEAL = {
    velvet: {
      el: function (el, i) { return [{ opacity: [0, 1], y: [42, 0], filter: ['blur(12px)', 'blur(0px)'] }, { duration: 1.1, ease: EASE }]; },
      ch: function () { return [{ opacity: [0, 1], rotateX: [-95, 0] }, { duration: 0.9, ease: EASE }]; },
      gap: 0.12, chGap: 0.05
    },
    sorbet: {
      el: function (el, i) { return [{ opacity: [0, 1], y: [-56, 0], rotate: [i % 2 ? 7 : -7, 0], scale: [0.88, 1] }, { type: 'spring', stiffness: 260, damping: 15 }]; },
      ch: function () { return [{ opacity: [0, 1], y: [-34, 0] }, { type: 'spring', stiffness: 420, damping: 12 }]; },
      gap: 0.09, chGap: 0.04
    },
    orbit: {
      el: function (el, i) { return [{ opacity: [0, 1], scale: [0.4, 1], rotate: [i % 2 ? 22 : -22, 0] }, { type: 'spring', stiffness: 230, damping: 13 }]; },
      ch: function (c, k) { var r = rnd(k * 97 + 13)(); return [{ opacity: [0, 1], scale: [0, 1], rotate: [(r - 0.5) * 140, 0] }, { type: 'spring', stiffness: 300, damping: 14 }]; },
      gap: 0.08, chGap: 0.045
    },
    sage: {
      el: function (el, i) {
        var r = i % 2;
        return [{ opacity: [0, 1], clipPath: [r ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'], x: [r ? 26 : -26, 0] }, { duration: 1, ease: EASE_IO }];
      },
      ch: function () { return [{ opacity: [0, 1], transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: 0.75, ease: EASE }]; },
      gap: 0.11, chGap: 0.035
    },
    bubble: {
      el: function (el, i) { return [{ opacity: [0, 1], y: [64, 0], scale: [0.84, 1] }, { type: 'spring', stiffness: 120, damping: 11 }]; },
      ch: function () { return [{ opacity: [0, 1], y: [26, 0], scale: [0.6, 1] }, { type: 'spring', stiffness: 220, damping: 9 }]; },
      gap: 0.1, chGap: 0.06
    }
  };

  function settle(el) {
    el.classList.add('mo-in');
    ['transform', 'filter', 'clip-path', 'opacity'].forEach(function (p) { el.style.removeProperty(p); });
  }
  function reveal(scope) {
    if (!ON || scope.__mo) return; scope.__mo = 1;
    var R = REVEAL[vname] || REVEAL.velvet;
    var els = $$('[data-a]', scope).filter(function (e) { return !e.classList.contains('mo-in'); });
    var t0 = scope.classList.contains('cover') ? 0.15 : 0.05;
    els.forEach(function (el, i) {
      var kf = R.el(el, i), opt = Object.assign({ delay: t0 + Math.min(i, 9) * R.gap }, kf[1]);
      try { M.animate(el, kf[0], opt).then(function () { settle(el); }); } catch (e) { settle(el); }
    });
    $$('.letters', scope).forEach(function (L) {
      var chs = $$('.ch', L), base = parseInt(L.style.getPropertyValue('--base'), 10) || 0;
      chs.forEach(function (c, k) {
        var kf = R.ch(c, k), opt = Object.assign({ delay: t0 + base / 1000 * 0.5 + k * R.chGap }, kf[1]);
        try { M.animate(c, kf[0], opt).then(function () { settle(c); }); } catch (e) { settle(c); }
      });
    });
    /* pengaman: jangan sampai ada elemen yang tertinggal tak terlihat */
    setTimeout(function () { $$('[data-a], .letters .ch', scope).forEach(function (e) { if (!e.classList.contains('mo-in')) settle(e); }); }, 5200);
  }
  function watchReveals() {
    if (!ON) return;
    var mo = new MutationObserver(function (list) {
      list.forEach(function (m) {
        var t = m.target;
        if (t.classList && t.classList.contains('go') && !t.__mo && (t.classList.contains('reveal') || t.id === 'cover')) reveal(t);
        if (t.id === 'cover' && t.classList.contains('opening') && !t.__open) { t.__open = 1; runOpening(t); }
      });
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  /* =========================================================
     ANIMASI BUKA SAMPUL (per varian) — selesai < 2,6 detik
     ========================================================= */
  function runOpening(cover) {
    if (!ON) return;
    try { V.opening(cover); } catch (e) { cover.style.opacity = 0; }
  }
  function fadeInner(cover, d) {
    var inner = $('.cover-inner', cover);
    if (inner) M.animate(inner, { opacity: [1, 0], scale: [1, 0.94] }, { duration: d || 0.45, ease: EASE });
  }
  function openIris(cover) {
    fadeInner(cover, 0.5);
    var ring = $('.mo-iris', cover);
    if (ring) M.animate(ring, { scale: [0.3, 4.2], opacity: [0.9, 0] }, { duration: 1.6, ease: EASE, delay: 0.1 });
    M.animate(cover, { clipPath: ['circle(150% at 50% 50%)', 'circle(0% at 50% 50%)'] }, { duration: 1.5, ease: EASE_IO, delay: 0.35 });
  }
  function openSwipe(cover) {
    var inner = $('.cover-inner', cover);
    cover.style.transformOrigin = '50% 115%';
    if (inner) M.animate(inner, { scale: [1, 0.96, 1] }, { duration: 0.35 });
    M.animate(cover, { x: ['0%', '-5%', '125%'], rotate: [0, -4, 18] }, { duration: 1.25, times: [0, 0.22, 1], ease: [EASE_IO, EASE_IO], delay: 0.1 });
  }
  function openSpin(cover) {
    fadeInner(cover, 0.4);
    $$('.o-ring', cover).forEach(function (r, i) { M.animate(r, { scale: [1, 2.6 + i * 0.5], opacity: [1, 0] }, { duration: 1.2, ease: EASE, delay: i * 0.08 }); });
    M.animate(cover, { rotate: [0, -110], scale: [1, 0.05], borderRadius: ['0%', '50%'], opacity: [1, 1, 0] }, { duration: 1.45, ease: EASE_IO, delay: 0.3 });
  }
  function openBlinds(cover) {
    fadeInner(cover, 0.45);
    cover.classList.add('blinds-go');
    var strips = $$('.mo-blinds i', cover);
    M.animate(strips, { y: ['0%', '-102%'] }, { duration: 0.95, ease: EASE_IO, delay: stagger(0.08, { startDelay: 0.35, from: 'center' }) });
  }
  function openPop(cover) {
    fadeInner(cover, 0.45);
    M.animate(cover, { clipPath: ['circle(150% at 50% 58%)', 'circle(26% at 50% 58%)', 'circle(31% at 50% 58%)', 'circle(0% at 50% 58%)'] }, { duration: 1.6, times: [0, 0.55, 0.72, 1], ease: [EASE_IO, 'easeOut', 'easeIn'], delay: 0.25 });
    $$('.mo-drop', cover).forEach(function (d, i) {
      var a = i / 10 * Math.PI * 2;
      M.animate(d, { x: [0, Math.cos(a) * 180], y: [0, Math.sin(a) * 180], scale: [0, 1, 0], opacity: [0, 1, 0] }, { duration: 0.9, ease: 'easeOut', delay: 1.3 });
    });
  }

  /* =========================================================
     FOTO CONTOH (dipakai bila klien belum mengisi foto galeri)
     ========================================================= */
  function sampleArt(i, w, hgt) {
    var a = cssVar('--accent', '#9C4A64'), b = cssVar('--accent-2', '#E9A2B5'), c = cssVar('--bg-2', '#FBEFF1'), ink = cssVar('--ink', '#333');
    var R = rnd(i * 7919 + 17), id = 'g' + i + Math.floor(R() * 1e6);
    var sx = (0.2 + R() * 0.6) * w, sy = (0.18 + R() * 0.25) * hgt, sr = (0.12 + R() * 0.12) * w;
    var hill = function (y, amp, col, op) {
      var d = 'M0 ' + y;
      for (var k = 1; k <= 4; k++) d += ' Q' + (w * (k - 0.5) / 4) + ' ' + (y - amp * (R() + 0.3)) + ' ' + (w * k / 4) + ' ' + y;
      return '<path d="' + d + ' L' + w + ' ' + hgt + ' L0 ' + hgt + 'Z" fill="' + col + '" opacity="' + op + '"/>';
    };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + hgt + '" width="' + w + '" height="' + hgt + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="' + (i % 2) + '" y2="1"><stop offset="0" stop-color="' + c + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + hgt + '" fill="url(#' + id + ')"/>' +
      '<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="' + a + '" opacity=".55"/>' +
      hill(hgt * 0.72, hgt * 0.12, a, 0.35) + hill(hgt * 0.84, hgt * 0.1, ink, 0.18) +
      '<text x="' + (w / 2) + '" y="' + (hgt * 0.94) + '" font-family="sans-serif" font-size="' + (w * 0.075) + '" fill="' + ink + '" opacity=".55" text-anchor="middle" letter-spacing="2">FOTO ' + (i + 1) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* =========================================================
     MESIN GALERI
     ========================================================= */
  function buildGallery() {
    var sec = $('#galeri'), grid = sec && $('.gallery', sec);
    if (!grid) return;
    var g = DATA.gallery || {}, photos = (g.photos || []).filter(function (p) { return p && p.src; });
    var kind = (DATA.theme && DATA.theme.gallery) || V.gallery;
    var n = photos.length || g.placeholders || V.count;
    if (kind === 'sphere') n = Math.max(n, 14);
    var wrap = h('div', { class: 'mg mg-' + kind });
    var stage = h('div', { class: 'mg-stage', tabindex: '0', role: 'group', 'aria-roledescription': 'galeri', 'aria-label': 'Galeri foto. Geser atau pakai tombol panah.' });
    var track = h('div', { class: 'mg-track' });
    stage.appendChild(track);
    var items = [];
    var real = photos.length || g.placeholders || V.count;
    for (var i = 0; i < n; i++) {
      var k = i % real, p = photos[k];
      var it = h('figure', { class: 'mg-item', 'data-i': String(k) });
      if (i >= real) it.setAttribute('aria-hidden', 'true');
      var img = h('img', { alt: p ? (p.alt || 'Foto ' + (k + 1)) : 'Foto contoh ' + (k + 1), draggable: 'false', decoding: 'async' });
      img.src = p ? p.src : sampleArt(k, 400, kind === 'ring' || kind === 'sphere' ? 400 : 520);
      if (p) it.setAttribute('data-src', p.src);
      it.appendChild(img);
      it.appendChild(h('span', { class: 'mg-gloss', 'aria-hidden': 'true' }));
      it.appendChild(h('span', { class: 'mg-zoom', 'aria-hidden': 'true' }, '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'));
      it.setAttribute('aria-label', 'Lihat foto ' + (k + 1) + ' layar penuh');
      track.appendChild(it); items.push(it);
    }
    var ui = h('div', { class: 'mg-ui' });
    var prev = h('button', { class: 'mg-btn', type: 'button', 'aria-label': 'Sebelumnya' }, '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    var next = h('button', { class: 'mg-btn', type: 'button', 'aria-label': 'Berikutnya' }, '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    var count = h('span', { class: 'mg-count', 'aria-live': 'polite' });
    ui.append(prev, count, next);
    var hint = h('p', { class: 'mg-hint', text: { barrel: 'Geser untuk memutar · ketuk foto depan untuk layar penuh', stack: 'Lempar kartu ke kiri/kanan · ketuk untuk layar penuh', ring: 'Putar cakram · ketuk foto atas untuk layar penuh', helix: 'Geser spiral · ketuk foto depan untuk layar penuh', sphere: 'Seret untuk memutar · ketuk foto untuk layar penuh' }[kind] });
    wrap.append(stage, ui, hint);
    grid.replaceWith(wrap);

    /* daftar foto untuk penampil layar penuh (foto asli, atau foto contoh versi besar) */
    var full = [];
    for (var f = 0; f < real; f++) full.push(photos[f] ? { src: photos[f].src, alt: photos[f].alt || 'Foto ' + (f + 1) } : { src: sampleArt(f, 900, kind === 'ring' || kind === 'sphere' ? 900 : 1100), alt: 'Foto contoh ' + (f + 1) });
    function open(it) {
      var k = +it.getAttribute('data-i') || 0;
      if (ON) M.animate(it, { scale: [1, 1.06, 1] }, { duration: 0.35, ease: EASE });
      if (window.INV_VIEWER) setTimeout(function () { window.INV_VIEWER(full, k); }, ON ? 140 : 0);
    }
    var api = { wrap: wrap, stage: stage, items: items, count: count, prev: prev, next: next, open: open, real: real };
    if (kind === 'stack') Stack(api);
    else if (kind === 'sphere') Sphere(api);
    else Track(api, LAYOUT[kind] || LAYOUT.barrel);
  }

  /* --- interaksi geser umum --- */
  function dragger(stage, h2, opts) {
    var down = false, moved = false, axis = '', sx = 0, sy = 0, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0, both = false;
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      down = true; moved = false; axis = ''; sx = lx = e.clientX; sy = ly = e.clientY; lt = performance.now(); vx = vy = 0;
      both = e.pointerType === 'mouse' && opts && opts.both;
      h2.start && h2.start(e);
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = both ? 'xy' : (Math.abs(dx) > Math.abs(dy) ? 'x' : 'y');
        if (axis === 'y') { down = false; h2.cancel && h2.cancel(); return; }
      }
      moved = true; stage.classList.add('dragging');
      var now = performance.now(), dt = Math.max(1, now - lt);
      vx = 0.8 * ((e.clientX - lx) / dt) + 0.2 * vx; vy = 0.8 * ((e.clientY - ly) / dt) + 0.2 * vy;
      h2.move(dx, axis === 'xy' ? dy : 0, e.clientX - lx, axis === 'xy' ? e.clientY - ly : 0);
      lx = e.clientX; ly = e.clientY; lt = now;
    });
    function up() {
      if (!down) return; down = false; stage.classList.remove('dragging');
      if (moved) h2.end(vx, vy); else h2.cancel && h2.cancel();
      setTimeout(function () { moved = false; }, 0);
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
    return { moved: function () { return moved; } };
  }
  function autoplay(api, step, ms) {
    var on = ON, t = 0, vis = false, hover = false;
    function tick() { if (on && vis && !hover && !document.hidden && !(document.body.classList.contains('locked'))) step(); }
    function start() { if (!t && on) t = setInterval(tick, ms); }
    var a = { stop: function () { on = false; clearInterval(t); t = 0; } };
    api.wrap.addEventListener('mouseenter', function () { hover = true; });
    api.wrap.addEventListener('mouseleave', function () { hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) start(); }, { threshold: 0.35 }).observe(api.stage);
    return a;
  }
  function keys(api, go) {
    api.stage.addEventListener('keydown', function (e) {
      var m = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (m) { e.preventDefault(); go(m); }
    });
  }

  /* --- tata letak lintasan (barrel / ring / helix) --- */
  var LAYOUT = {
    barrel: {
      loop: true, unit: function (W) { return W * 0.85; },
      measure: function (W, H, n, s) { this.R = (W / 2) / Math.tan(Math.PI / n) + 14; s.style.setProperty('--R', this.R.toFixed(1) + 'px'); },
      place: function (d, W, H, n) {
        var a = d * 360 / n, c = Math.cos(a * Math.PI / 180);
        return { t: 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + this.R.toFixed(1) + 'px)', z: Math.round(c * 100) + 100, o: 0.35 + 0.65 * Math.max(0, c), shade: (1 - Math.max(0, c)) * 0.4 };
      }
    },
    ring: {
      loop: true, unit: function (W) { return W * 0.9; },
      measure: function (W, H, n, s) { this.R = Math.max(n * W * 1.02 / (2 * Math.PI), W * 1.7); s.style.height = Math.round(H + this.R * 0.62 + 30) + 'px'; },
      place: function (d, W, H, n) {
        var a = d * 360 / n, r = a * Math.PI / 180, ad = Math.abs(a);
        var x = this.R * Math.sin(r), y = this.R * (1 - Math.cos(r)), s = 1 - Math.min(Math.abs(d), 3) * 0.1;
        return { t: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')', z: 100 - Math.round(Math.abs(d) * 10), o: ad > 115 ? 0 : 1 - Math.max(0, ad - 70) / 45, shade: Math.min(Math.abs(d), 2) * 0.12 };
      }
    },
    helix: {
      loop: true, unit: function (W) { return W * 0.9; },
      measure: function (W, H, n, s) { this.R = W * 0.78; this.P = H * 0.44; s.style.height = Math.round(H + this.P * 3.2) + 'px'; },
      place: function (d, W, H, n) {
        var a = d * 60, r = a * Math.PI / 180, c = Math.cos(r), ad = Math.abs(d);
        var x = this.R * Math.sin(r), z = this.R * c - this.R, y = d * this.P;
        return { t: 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (a * 0.6).toFixed(2) + 'deg)', z: Math.round(c * 100 - ad * 3) + 200, o: ad > 2.4 ? Math.max(0, 3.2 - ad) / 0.8 * 0.6 : 0.35 + 0.65 * (c + 1) / 2, shade: (1 - (c + 1) / 2) * 0.35 };
      }
    }
  };

  function Track(api, L) {
    var items = api.items, n = items.length, pos = 0, ctrl = null, W = 160, H = 220, act = -1;
    function measure() { W = items[0].offsetWidth || W; H = items[0].offsetHeight || H; L.measure(W, H, n, api.stage); }
    function wrapD(d) { if (!L.loop) return d; d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; }
    function render() {
      for (var i = 0; i < n; i++) {
        var d = wrapD(i - pos), r = L.place(d, W, H, n), s = items[i].style;
        s.transform = r.t; s.zIndex = r.z; s.opacity = r.o.toFixed(3); s.visibility = r.o < 0.02 ? 'hidden' : 'visible';
        s.setProperty('--shade', (r.shade || 0).toFixed(3));
      }
      var a = ((Math.round(pos) % n) + n) % n;
      if (a !== act) { act = a; items.forEach(function (it, k) { it.classList.toggle('on', k === a); }); api.count.textContent = (a % api.real + 1) + ' / ' + api.real; }
    }
    function lim(t) { return L.loop ? t : clamp(t, 0, n - 1); }
    function to(t, v) {
      if (ctrl) ctrl.stop();
      t = lim(Math.round(t));
      ctrl = tween(pos, t, { type: 'spring', stiffness: 110, damping: 19, velocity: v || 0 }, function (x) { pos = x; render(); });
    }
    var sp = 0, auto;
    var drag = dragger(api.stage, {
      start: function () { if (ctrl) ctrl.stop(); sp = pos; auto && auto.stop(); },
      move: function (dx) { var p = sp - dx / L.unit(W); if (!L.loop) { if (p < 0) p *= 0.35; if (p > n - 1) p = n - 1 + (p - n + 1) * 0.35; } pos = p; render(); },
      end: function (vx) { var vi = -vx * 1000 / L.unit(W); to(pos + vi * 0.22, vi); },
      cancel: function () { to(pos); }
    });
    items.forEach(function (it, i) {
      it.addEventListener('click', function () {
        if (drag.moved()) return;
        auto && auto.stop();
        var d = wrapD(i - pos);
        if (Math.abs(d) < 0.5) api.open(it); else to(pos + d);
      });
    });
    function step(m) { auto && auto.stop(); to(Math.round(pos) + m); }
    api.prev.addEventListener('click', function () { step(-1); });
    api.next.addEventListener('click', function () { step(1); });
    keys(api, step);
    var wa = 0, wt = 0;
    api.stage.addEventListener('wheel', function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return; e.preventDefault(); wa += dx;
      var now = performance.now(); if (Math.abs(wa) > 40 && now - wt > 160) { step(wa > 0 ? 1 : -1); wa = 0; wt = now; }
    }, { passive: false });
    auto = autoplay(api, function () { var t = Math.round(pos) + 1; if (!L.loop && t > n - 1) t = 0; to(t); }, 2800);
    window.addEventListener('resize', function () { measure(); render(); });
    measure(); render();
    window.addEventListener('load', function () { measure(); render(); });
  }

  /* --- tumpukan kartu (stack) --- */
  function Stack(api) {
    var items = api.items, n = items.length, order = items.map(function (_, i) { return i; });
    var W = 220, peek = 22, depth = 46, visible = 3, busy = false;
    var st = items.map(function () { return { x: 0, y: 0, z: 0, s: 1, r: 0, o: 1 }; });
    function tilt(i) { return [-5, 4, -2.5, 6, -4.5, 2.5][i % 6]; }
    function apply(i) { var s = st[i], e = items[i].style; e.transform = 'translate3d(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px,' + s.z.toFixed(1) + 'px) rotate(' + s.r.toFixed(2) + 'deg) scale(' + s.s.toFixed(3) + ')'; e.opacity = s.o.toFixed(3); }
    function home(j, i) { return { x: j ? (i % 2 ? 9 : -9) * Math.min(j, 2) : 0, y: j * peek, z: -j * depth, s: 1 - j * 0.045, r: j === 0 ? 0 : tilt(i), o: j <= visible ? 1 : 0 }; }
    function lerp(a, b, t) { var o = {}; for (var k in a) o[k] = a[k] + (b[k] - a[k]) * t; return o; }
    function anim(i, to, opt) {
      var from = Object.assign({}, st[i]);
      return tween(0, 1, opt || { type: 'spring', stiffness: 260, damping: 24 }, function (t) { st[i] = lerp(from, to, t); apply(i); });
    }
    function layout() {
      order.forEach(function (i, j) { items[i].style.zIndex = n - j; items[i].classList.toggle('on', j === 0); anim(i, home(j, i)); });
      api.count.textContent = (order[0] % api.real + 1) + ' / ' + api.real;
    }
    function fly(dir, v) {
      if (busy) return; busy = true;
      var i = order[0];
      anim(i, { x: dir * W * 1.7, y: st[i].y - 30, z: 0, s: 1, r: dir * 26, o: 0 }, { duration: 0.55, ease: [0.3, 0.6, 0.4, 1] }).then(function () {
        order.push(order.shift());
        st[i] = Object.assign(home(Math.min(order.length - 1, visible + 1), i), { o: 0 }); apply(i);
        busy = false; layout();
      });
      setTimeout(function () { if (busy) { busy = false; } }, 1200);
    }
    function back() {
      if (busy) return;
      var i = order.pop(); order.unshift(i);
      st[i] = { x: -W * 1.7, y: -30, z: 0, s: 1, r: -26, o: 0 }; apply(i);
      layout();
    }
    var auto, top = -1;
    var drag = dragger(api.stage, {
      start: function () { auto && auto.stop(); top = order[0]; },
      move: function (dx) { if (busy) return; var s = st[top]; s.x = dx; s.r = dx * 0.07; s.y = -Math.abs(dx) * 0.06; apply(top); },
      end: function (vx) { if (busy) return; var x = st[top].x; if (Math.abs(x) > W * 0.3 || Math.abs(vx) > 0.55) fly(x + vx * 120 > 0 ? 1 : -1); else anim(top, home(0, top), { type: 'spring', stiffness: 380, damping: 20 }); },
      cancel: function () {}
    });
    items.forEach(function (it, i) { it.addEventListener('click', function () { if (drag.moved()) return; if (i === order[0]) api.open(it); }); });
    api.next.addEventListener('click', function () { auto && auto.stop(); fly(1); });
    api.prev.addEventListener('click', function () { auto && auto.stop(); back(); });
    keys(api, function (m) { auto && auto.stop(); if (m > 0) fly(1); else back(); });
    auto = autoplay(api, function () { fly(1); }, 3200);
    function measure() { W = items[0].offsetWidth || W; }
    window.addEventListener('resize', measure);
    order.forEach(function (i, j) { st[i] = home(j, i); apply(i); items[i].style.zIndex = n - j; });
    items[0].classList.add('on'); api.count.textContent = '1 / ' + api.real; measure();
  }

  /* --- bola foto (sphere) --- */
  function Sphere(api) {
    var items = api.items, n = items.length, pts = [];
    for (var i = 0; i < n; i++) { var y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    var yaw = 0, pitch = -0.28, vy = 0.0035, vp = 0, R = 150, drag = false, raf = 0, vis = false, base = ON ? 0.0035 : 0, front = -1;
    function measure() { var w = api.stage.offsetWidth || 360; R = clamp(w * 0.34, 115, 175); api.stage.style.height = Math.round(R * 2 + 120) + 'px'; }
    function render() {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), spn = Math.sin(pitch), best = -9, bi = 0;
      for (var i = 0; i < n; i++) {
        var p = pts[i], x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy, y2 = p[1] * cp - z1 * spn, z2 = p[1] * spn + z1 * cp;
        var k = (z2 + 1) / 2, s = items[i].style;
        s.transform = 'translate(' + (x1 * R).toFixed(1) + 'px,' + (y2 * R).toFixed(1) + 'px) scale(' + (0.42 + 0.58 * k).toFixed(3) + ')';
        s.zIndex = Math.round(k * 100) + 10; s.opacity = (0.2 + 0.8 * k).toFixed(3); s.setProperty('--shade', ((1 - k) * 0.5).toFixed(3));
        items[i].__z = z2; if (z2 > best) { best = z2; bi = i; }
      }
      if (bi !== front) { front = bi; items.forEach(function (it, k) { it.classList.toggle('on', k === bi); }); api.count.textContent = (bi % api.real + 1) + ' / ' + api.real; }
    }
    function loop() {
      if (!drag) { yaw += vy; vy += (base - vy) * 0.02; pitch += vp; vp *= 0.9; pitch += (-0.28 - pitch) * 0.01; }
      render();
      raf = (vis && !document.hidden) ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf && vis) raf = requestAnimationFrame(loop); }
    var dr = dragger(api.stage, {
      start: function () { drag = true; base = 0; },
      move: function (dx, dy, ddx, ddy) { yaw += ddx * 0.008; pitch = clamp(pitch - ddy * 0.008, -1.2, 1.2); render(); },
      end: function (vx, vyy) { drag = false; vy = vx * 0.12; vp = -vyy * 0.12; kick(); },
      cancel: function () { drag = false; }
    }, { both: true });
    items.forEach(function (it) { it.addEventListener('click', function () { if (dr.moved()) return; if (it.__z > 0.35) api.open(it); else { vy += 0.06; kick(); } }); });
    api.next.addEventListener('click', function () { base = 0; vy = 0.075; kick(); });
    api.prev.addEventListener('click', function () { base = 0; vy = -0.075; kick(); });
    keys(api, function (m) { base = 0; vy = m * 0.075; kick(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; kick(); }, { threshold: 0.1 }).observe(api.stage); else { vis = true; kick(); }
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('resize', function () { measure(); render(); });
    measure(); render();
  }

  /* =========================================================
     GERAK TAMBAHAN PER VARIAN
     ========================================================= */
  /* Sorbet: kartu miring mengikuti jari/kursor + tombol "kenyal" */
  function tiltCards() {
    $$('.main .card, .main .guest-box, .main .quote').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
      });
      c.addEventListener('pointerleave', function () { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
    });
  }
  function squishButtons() {
    if (!ON) return;
    document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('.btn, .fab, .mg-btn'); if (b) M.animate(b, { scale: 0.9 }, { type: 'spring', stiffness: 600, damping: 18 }); });
    document.addEventListener('pointerup', function () { $$('.btn, .fab, .mg-btn').forEach(function (b) { if (b.style.transform) M.animate(b, { scale: 1 }, { type: 'spring', stiffness: 500, damping: 10 }); }); });
  }
  /* Orbit: tombol magnetis + pita teks berjalan */
  function magnetic() {
    if (!ON) return;
    $$('.btn, .mg-btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = b.getBoundingClientRect();
        M.animate(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35 }, { type: 'spring', stiffness: 300, damping: 15 });
      });
      b.addEventListener('pointerleave', function () { M.animate(b, { x: 0, y: 0 }, { type: 'spring', stiffness: 260, damping: 10 }); });
    });
  }
  function marquee(after, text) {
    if (!after) return;
    var t = (text + ' ✦ ').repeat(6);
    var m = h('div', { class: 'mo-marquee', 'aria-hidden': 'true' }, '<div class="mq-row"><span>' + t + '</span><span>' + t + '</span></div><div class="mq-row rev"><span>' + t + '</span><span>' + t + '</span></div>');
    after.after(m);
  }
  /* Sage: sulur yang tumbuh mengikuti scroll */
  function vine() {
    var main = $('#main'); if (!main) return;
    var v = h('div', { class: 'mo-vine', 'aria-hidden': 'true' },
      '<svg viewBox="0 0 30 1000" preserveAspectRatio="none"><path class="vl" d="M15 0 C 2 60, 28 120, 15 180 S 2 300, 15 360 S 28 480, 15 540 S 2 660, 15 720 S 28 840, 15 900 S 8 960, 15 1000" fill="none" pathLength="1"/></svg>');
    for (var i = 0; i < 9; i++) v.appendChild(h('i', { class: 'lf' + (i % 2 ? ' r' : ''), style: 'top:' + (6 + i * 10.5) + '%', 'data-at': String((6 + i * 10.5) / 100) }));
    main.appendChild(v);
    var path = $('.vl', v), leaves = $$('.lf', v);
    function upd(p) { path.style.strokeDashoffset = (1 - p).toFixed(4); leaves.forEach(function (l) { l.classList.toggle('in', p + 0.04 >= +l.getAttribute('data-at')); }); }
    if (ON && M.scroll) M.scroll(function (p) { upd(p); }); else upd(1);
  }
  /* Bubble: gelembung paralaks mengikuti scroll */
  function bubbles() {
    var main = $('#main'); if (!main) return;
    var R = rnd(42);
    [0.6, 1.4].forEach(function (speed, li) {
      var layer = h('div', { class: 'mo-float l' + li, 'aria-hidden': 'true' });
      for (var i = 0; i < 9; i++) { var s = 18 + R() * (li ? 70 : 40); layer.appendChild(h('i', { style: 'left:' + (R() * 92).toFixed(1) + '%;top:' + (R() * 96).toFixed(1) + '%;width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) + 'px' })); }
      main.insertBefore(layer, main.firstChild);
      if (ON && M.scroll) M.scroll(function (p) { layer.style.transform = 'translate3d(0,' + (-p * 420 * speed).toFixed(1) + 'px,0)'; });
    });
  }

  /* =========================================================
     DEKORASI (sampul, panel samping, hero)
     ========================================================= */
  function deco(where) {
    var d = h('div', { class: 'mo-deco mo-' + vname + ' at-' + where, 'aria-hidden': 'true' });
    var html = '';
    if (vname === 'velvet') {
      html = '<div class="v-spot"></div><svg class="v-ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1.5 4"/><circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width=".35"/></svg>' +
        '<svg class="v-ring v2" viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" stroke-width=".4" stroke-dasharray="22 8 2 8"/></svg>';
      if (where === 'cover') html += '<span class="mo-iris"></span>';
    } else if (vname === 'sorbet') {
      html = '<i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i><i class="blob b4"></i>';
    } else if (vname === 'orbit') {
      html = '<div class="o-stars"></div><div class="o-ring r1"><i></i></div><div class="o-ring r2"><i></i><i class="b"></i></div><div class="o-ring r3"><i></i></div><div class="o-glow"></div>';
    } else if (vname === 'sage') {
      var leaf = function (x, y, r, s, k) { return '<g class="sw sw' + k + '" transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')"><path d="M0 0 C 10 -30, 10 -70, 0 -110" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        [20, 45, 70, 95].map(function (t, j) { var sd = j % 2 ? 1 : -1; return '<path d="M0 ' + (-t) + ' c ' + (sd * 14) + ' -6, ' + (sd * 26) + ' -2, ' + (sd * 30) + ' -16 c ' + (-sd * 12) + ' -4, ' + (-sd * 24) + ' 2, ' + (-sd * 30) + ' 16z" fill="currentColor" opacity=".85"/>'; }).join('') + '</g>'; };
      html = '<svg class="s-leaves" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">' + leaf(30, 800, 18, 1.5, 1) + leaf(380, 820, -22, 1.7, 2) + leaf(-10, 120, 140, 1.1, 3) + leaf(410, 60, -150, 1.2, 1) + '</svg>';
      if (where === 'cover') { html += '<div class="mo-blinds">'; for (var i = 0; i < 6; i++) html += '<i style="--k:' + i + '"></i>'; html += '</div>'; }
    } else if (vname === 'bubble') {
      var R = rnd(where.length * 31 + 5);
      for (var j = 0; j < 12; j++) { var s = 14 + R() * 60; html += '<i class="bb" style="left:' + (R() * 94).toFixed(1) + '%;width:' + s.toFixed(0) + 'px;height:' + s.toFixed(0) + 'px;--d:' + (9 + R() * 10).toFixed(1) + 's;--dl:-' + (R() * 12).toFixed(1) + 's"></i>'; }
      if (where === 'cover') for (var q = 0; q < 10; q++) html += '<i class="mo-drop"></i>';
    }
    d.innerHTML = html;
    return d;
  }

  /* =========================================================
     DAFTAR KE MESIN UNDANGAN
     ========================================================= */
  DC.register('motion', {
    section: function (i, mono, id, data) { setVariant(data); return id === 'home' ? [deco('hero')] : []; },
    cover: function (i, mono, id, data) { setVariant(data); return [deco('cover')]; },
    side: function () { return [deco('side')]; },
    page: function (i, mono, id, data) {
      setVariant(data);
      try { buildGallery(); } catch (e) { if (window.console) console.error(e); }
      if (vname === 'sorbet') { tiltCards(); squishButtons(); }
      if (vname === 'orbit') { var t = (data.cover && data.cover.title) || ''; marquee($('#home'), (data.cover && data.cover.eyebrow || '') + ' ✦ ' + t); marquee($('#ucapan') || $('#rsvp'), t); setTimeout(magnetic, 0); }
      if (vname === 'sage') vine();
      if (vname === 'bubble') bubbles();
      watchReveals();
      return [];
    }
  });
  function setVariant(data) {
    DATA = data || DATA;
    var v = (DATA.theme && DATA.theme.variant) || 'velvet';
    vname = VAR[v] ? v : 'velvet'; V = VAR[vname];
  }
})();
