/* =========================================================
   Mesin undangan bersama + sistem animasi.
   Setiap template cukup mengisi window.INVITATION lalu memuat file ini.
   Semua teks dari data & dari tamu dimasukkan lewat textContent (aman dari XSS).
   ========================================================= */
(function () {
  'use strict';

  var D = window.INVITATION || {};
  var SITE = window.SITE || {};
  var T = D.theme || {};
  var TZ = D.timeZone || 'Asia/Jakarta';
  var SLUG = D.slug || location.pathname.replace(/\W+/g, '-');
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilitas ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'svg') el.innerHTML = v; /* hanya SVG milik file ini */
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* Tandai elemen untuk animasi masuk: up, down, left, right, zoom, blur, flip */
  function A(el, type) { if (el) el.setAttribute('data-a', type || 'up'); return el; }

  function fmtDate(iso, opts) {
    try { return new Intl.DateTimeFormat('id-ID', Object.assign({ timeZone: TZ }, opts)).format(new Date(iso)); }
    catch (e) { return iso; }
  }
  function longDate(iso) { return fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function dotDate(iso) { return fmtDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric' }).split(/\D+/).join(' · '); }

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { toast('Tersalin: ' + text); });
    }
    var ta = h('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Tersalin: ' + text); } catch (e) { toast('Salin manual: ' + text); }
    ta.remove();
    return Promise.resolve();
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---------- Nama tamu dari link (?to=Nama) ---------- */
  var GUEST = (function () {
    var q = new URLSearchParams(location.search);
    var n = q.get('to') || q.get('kepada') || '';
    return n.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  })();

  /* Inisial untuk monogram: dari data, atau dari judul "Raka & Nadia" → R & N */
  function monogram() {
    if (D.monogram) return D.monogram;
    var t = (D.cover && D.cover.title) || '';
    var parts = t.split(/\s*(?:&|\+|dan)\s*/i).filter(Boolean);
    if (parts.length >= 2) return parts[0].trim().charAt(0) + ' & ' + parts[1].trim().charAt(0);
    return t.trim().charAt(0);
  }

  /* ---------- Ornamen SVG ---------- */
  var ORN = {
    floral: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 40c30-24 60-24 90-4 30-20 60-20 90 4"/><circle cx="100" cy="30" r="5" fill="currentColor"/><path d="M100 25c-4-10 4-16 0-22M100 25c4-10-4-16 0-22"/><circle cx="58" cy="25" r="3.5"/><circle cx="142" cy="25" r="3.5"/><circle cx="34" cy="31" r="2"/><circle cx="166" cy="31" r="2"/><path d="M70 22c-6-6-14-4-16 2 6 4 12 4 16-2zM130 22c6-6 14-4 16 2-6 4-12 4-16-2z" fill="currentColor" fill-opacity=".25"/></svg>',
    batik: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><g><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/><circle cx="100" cy="28" r="2" fill="currentColor"/></g><g transform="translate(-50 0)"><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/></g><g transform="translate(50 0)"><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/></g><path d="M10 28h18M172 28h18"/></svg>',
    leaf: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20 30c40-4 120-4 160 0"/><path d="M60 29c-4-12 6-20 16-20-2 10-8 18-16 20zM100 28c0-14 10-22 20-22 0 12-8 20-20 22zM140 29c-2-12 8-20 18-18-2 10-10 18-18 18z" fill="currentColor" fill-opacity=".2"/><path d="M80 30c-6 10-2 18 8 20 2-10-2-18-8-20zM120 30c-4 10 2 18 10 18 0-10-4-16-10-18z" fill="currentColor" fill-opacity=".2"/></svg>',
    line: '<svg viewBox="0 0 200 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M10 12h78M112 12h78"/><path d="M100 4l8 8-8 8-8-8z"/></svg>',
    islamic: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="86" y="14" width="28" height="28"/><rect x="86" y="14" width="28" height="28" transform="rotate(45 100 28)"/><circle cx="100" cy="28" r="6"/><path d="M10 28h60M130 28h60"/><circle cx="76" cy="28" r="2.5" fill="currentColor"/><circle cx="124" cy="28" r="2.5" fill="currentColor"/><path d="M40 20l6 8-6 8-6-8zM160 20l6 8-6 8-6-8z"/></svg>',
    cloud: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M70 40h60a12 12 0 000-24 18 18 0 00-34-4 14 14 0 00-26 14 7 7 0 000 14z" fill="currentColor" fill-opacity=".12"/><path d="M30 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM170 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM158 40l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="currentColor"/></svg>',
    confetti: '<svg viewBox="0 0 200 56" aria-hidden="true"><g fill="currentColor"><rect x="20" y="12" width="10" height="5" rx="2" transform="rotate(-20 25 14)"/><circle cx="52" cy="38" r="4"/><rect x="78" y="8" width="5" height="12" rx="2" transform="rotate(30 80 14)"/><circle cx="118" cy="16" r="3"/><rect x="142" y="34" width="12" height="5" rx="2" transform="rotate(15 148 36)"/><circle cx="178" cy="20" r="4"/></g><g style="fill:var(--accent-2)"><circle cx="36" cy="30" r="3"/><rect x="62" y="16" width="10" height="5" rx="2" transform="rotate(40 67 18)"/><circle cx="100" cy="40" r="4.5"/><rect x="128" y="40" width="5" height="11" rx="2" transform="rotate(-25 130 45)"/><circle cx="164" cy="12" r="3"/></g></svg>',
    geo: '<svg viewBox="0 0 200 40" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 20h60"/><path d="M130 20h60"/><rect x="84" y="6" width="28" height="28" rx="3" transform="rotate(45 98 20)"/><circle cx="98" cy="20" r="4" fill="currentColor"/></svg>',
    deco: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M100 50L70 20M100 50L85 12M100 50V8M100 50l15-38M100 50l30-30"/><path d="M62 50h76"/><path d="M10 50h40M150 50h40"/><circle cx="56" cy="50" r="2.5" fill="currentColor"/><circle cx="144" cy="50" r="2.5" fill="currentColor"/><path d="M100 4l3 4-3 4-3-4z" fill="currentColor"/></svg>',
    wave: '<svg viewBox="0 0 200 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M10 22c15-12 25-12 40 0s25 12 40 0 25-12 40 0 25 12 40 0 15-8 20-4"/><path d="M40 32c10-6 20-6 30 0M130 32c10-6 20-6 30 0" opacity=".6"/><circle cx="100" cy="10" r="3" fill="currentColor"/></svg>',
    arch: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M80 52V30a20 20 0 0140 0v22"/><path d="M88 52V32a12 12 0 0124 0v20"/><path d="M100 14v-8M86 18l-5-6M114 18l5-6M76 28l-7-3M124 28l7-3"/><path d="M10 52h60M130 52h60"/><circle cx="100" cy="40" r="3" fill="currentColor"/></svg>',
    sparkle: '<svg viewBox="0 0 200 48" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M100 4c2 12 6 16 18 20-12 4-16 8-18 20-2-12-6-16-18-20 12-4 16-8 18-20z" fill="currentColor" fill-opacity=".2"/><path d="M60 18c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8zM140 18c1 5 3 7 8 8-5 1-7 3-8 8-1-5-3-7-8-8 5-1 7-3 8-8z"/><path d="M10 26h36M154 26h36"/></svg>'
  };
  function orn(extra) {
    var el = h('div', { class: 'orn ' + (extra || ''), svg: ORN[T.ornament] || ORN.line });
    /* pathLength=1 → semua garis bisa "digambar" dengan animasi yang sama */
    $$('path, circle, ellipse, rect', el).forEach(function (s) {
      if (s.getAttribute('fill') !== 'currentColor' && !s.closest('[style*=fill]') && !s.closest('g[fill]')) s.setAttribute('pathLength', '1');
    });
    return el;
  }

  var ICON = {
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>',
    disc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3a9 9 0 016.4 2.6" stroke-width="2.4"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-4 4 3 3-2 6 4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>',
    live: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.3 0 4 1.2 4.6 3.6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-8-4.8-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6.2-8 11-8 11z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 13h18M12 9v12M12 9c-2-4-7-4-6-1s6 1 6 1c2-4 7-4 6-1s-6 1-6 1"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10l5 5 5-5"/><path d="M7 5l5 5 5-5" opacity=".5"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>'
  };
  function icon(name) { return h('span', { 'aria-hidden': 'true', class: 'ic', svg: ICON[name] }); }

  /* Judul dengan animasi per huruf (pembaca layar tetap membaca utuh) */
  function letters(tag, cls, text, base) {
    var el = h(tag, { class: cls + ' letters', 'aria-label': text, style: base ? '--base:' + base + 'ms' : null });
    var i = 0;
    String(text).split(' ').forEach(function (word, wi, arr) {
      var w = h('span', { class: 'word', 'aria-hidden': 'true' });
      Array.from(word).forEach(function (ch) { w.appendChild(h('span', { class: 'ch', style: '--i:' + (i++), text: ch })); });
      el.appendChild(w);
      if (wi < arr.length - 1) { el.appendChild(document.createTextNode(' ')); i++; }
    });
    return el;
  }

  /* Bingkai lengkung/lingkaran berisi foto atau monogram */
  function frame(src, alt, size) {
    var shape = T.frame || 'arch';
    if (shape === 'none') return null;
    return h('div', { class: 'frame frame-' + shape + (size ? ' ' + size : '') },
      h('div', { class: 'frame-inner' },
        src ? h('img', { src: src, alt: alt || '', loading: 'eager' }) : h('span', { class: 'mono', text: monogram() })
      ),
      shape === 'circle' ? h('span', { class: 'ring', 'aria-hidden': 'true' }) : null
    );
  }

  /* ---------- Kalender Google ---------- */
  function calUrl(ev) {
    function z(iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var end = ev.end || new Date(new Date(ev.start).getTime() + 2 * 3600e3).toISOString();
    var p = new URLSearchParams({
      action: 'TEMPLATE',
      text: (ev.name || 'Acara') + ' — ' + ((D.cover && D.cover.title) || ''),
      dates: z(ev.start) + '/' + z(end),
      details: 'Undangan: ' + location.origin + location.pathname,
      location: [ev.venue, ev.address].filter(Boolean).join(', ')
    });
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }

  /* ---------- Bagian-bagian ---------- */
  function section(id, children, cls) {
    return h('section', { class: 'block reveal ' + (cls || ''), id: id, 'aria-labelledby': id + '-h' }, children);
  }
  function heading(id, eyebrow, text, lead) {
    return [
      eyebrow ? A(h('div', { class: 'eyebrow', text: eyebrow }), 'up') : null,
      A(h('h2', { id: id + '-h', text: text }), 'up'),
      orn('small'),
      lead ? A(h('p', { class: 'lead', text: lead }), 'up') : null
    ];
  }

  /* --- Layar memuat --- */
  function buildLoader() {
    return h('div', { class: 'loader', id: 'loader', role: 'status', 'aria-live': 'polite' },
      h('div', { class: 'loader-mono', text: monogram() }),
      h('div', { class: 'loader-bar' }, h('span')),
      h('div', { class: 'loader-text', text: 'Memuat undangan…' })
    );
  }

  /* --- Sampul --- */
  function buildCover() {
    var c = D.cover || {};
    var first = (D.events || [])[0];
    var eff = T.opening || 'slide-up';
    var inner = h('div', { class: 'cover-inner' },
      orn('top'),
      A(h('div', { class: 'eyebrow', text: c.eyebrow || 'Undangan' }), 'down'),
      A(frame(c.photo, c.title), 'zoom'),
      letters('h1', 'title-script', c.title || '', 500),
      first ? A(h('div', { class: 'date-line', text: dotDate(first.start) }), 'up') : null,
      A(h('div', { class: 'guest-box' },
        h('span', { class: 'to', text: c.toLabel || 'Kepada Yth. Bapak/Ibu/Saudara/i' }),
        h('span', { class: 'name', text: GUEST || c.defaultGuest || 'Tamu Undangan' }),
        h('span', { class: 'note', text: c.note || 'Mohon maaf bila ada kesalahan penulisan nama/gelar' })
      ), 'up'),
      A(h('button', { class: 'btn pulse', type: 'button', id: 'open-btn', onclick: openInvitation }, icon('mail'), c.button || 'Buka Undangan'), 'up'),
      orn('bottom flip')
    );
    var stagger = 0;
    $$('[data-a]', inner).forEach(function (el) { el.style.setProperty('--i', stagger++); });
    return h('div', { class: 'cover eff-' + eff, id: 'cover', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Sampul undangan' },
      h('div', { class: 'panel l', 'aria-hidden': 'true' }),
      h('div', { class: 'panel r', 'aria-hidden': 'true' }),
      eff === 'envelope' ? h('div', { class: 'flap', 'aria-hidden': 'true' }) : null,
      inner
    );
  }

  /* --- Panel kiri (desktop) --- */
  function buildSide() {
    var c = D.cover || {};
    var first = (D.events || [])[0];
    return h('aside', { class: 'side', 'aria-hidden': 'true' },
      h('div', { class: 'side-inner' },
        orn('top'),
        h('div', { class: 'eyebrow', text: c.eyebrow || '' }),
        frame(c.photo, c.title, 'lg'),
        h('div', { class: 'title-script', text: c.title || '' }),
        first ? h('div', { class: 'date-line', text: longDate(first.start) }) : null,
        orn('bottom flip')
      )
    );
  }

  function buildHero() {
    var hr = D.hero || {};
    var c = D.cover || {};
    var first = (D.events || [])[0];
    var target = D.countdownTo || (first && first.start);
    var cd = target ? A(h('div', { class: 'countdown', id: 'countdown', role: 'timer', 'aria-label': 'Hitung mundur acara' }), 'up') : null;
    return h('section', { class: 'block hero reveal', id: 'home', 'aria-label': 'Pembuka' },
      orn('top'),
      A(h('div', { class: 'eyebrow', text: hr.eyebrow || c.eyebrow || '' }), 'down'),
      letters('div', 'title-script', hr.title || c.title || '', 200),
      first ? A(h('div', { class: 'date-line', text: longDate(first.start) }), 'up') : null,
      hr.text ? A(h('p', { class: 'lead', text: hr.text }), 'up') : null,
      cd,
      first ? A(h('div', { class: 'actions' },
        h('a', { class: 'btn small ghost', href: calUrl(first), target: '_blank', rel: 'noopener' }, icon('cal'), 'Simpan ke Kalender')
      ), 'up') : null,
      A(h('div', { class: 'scroll-hint', 'aria-hidden': 'true' }, icon('scroll')), 'up')
    );
  }

  function startCountdown() {
    var el = $('#countdown');
    if (!el) return;
    var first = (D.events || [])[0];
    var t = new Date(D.countdownTo || first.start).getTime();
    var units = [['Hari', 864e5], ['Jam', 36e5], ['Menit', 6e4], ['Detik', 1e3]];
    var cells = units.map(function (u) { var b = h('b', { text: '00' }); el.appendChild(h('div', null, b, h('span', { text: u[0] }))); return b; });
    var timer;
    function tick() {
      var diff = t - Date.now();
      if (diff <= 0) {
        el.replaceChildren(h('div', { style: 'grid-column:1/-1' }, h('b', { text: D.countdownDone || 'Acara telah berlangsung', style: 'font-size:18px' })));
        clearInterval(timer); return;
      }
      units.forEach(function (u, i) {
        var v = String(Math.floor(diff / u[1])).padStart(2, '0'); diff -= Math.floor(diff / u[1]) * u[1];
        if (cells[i].textContent !== v) {
          cells[i].textContent = v;
          cells[i].classList.remove('tick'); void cells[i].offsetWidth; cells[i].classList.add('tick');
        }
      });
    }
    timer = setInterval(tick, 1000); tick();
  }

  function buildOpening() {
    var o = D.opening; if (!o) return null;
    return section('salam', [
      o.arabic ? A(h('div', { class: 'arabic', lang: 'ar', text: o.arabic }), 'blur') : null,
      o.greeting ? A(h('p', { class: 'greet', text: o.greeting }), 'up') : null,
      o.text ? A(h('p', { class: 'lead', text: o.text }), 'up') : null,
      D.quote ? A(h('blockquote', { class: 'quote' }, h('span', { class: 'qmark', 'aria-hidden': 'true', text: '“' }), D.quote.text, D.quote.source ? h('cite', { text: D.quote.source }) : null), 'zoom') : null
    ]);
  }

  function buildHosts() {
    var hs = D.hosts; if (!hs || !hs.people || !hs.people.length) return null;
    var list = h('div', { class: 'hosts' });
    hs.people.forEach(function (p, i) {
      if (i > 0 && hs.joiner) list.appendChild(A(h('div', { class: 'amp', 'aria-hidden': 'true', text: hs.joiner }), 'zoom'));
      var initial = (p.name || '?').trim().charAt(0).toUpperCase();
      var side = hs.people.length > 1 ? (i % 2 ? 'right' : 'left') : 'up';
      list.appendChild(A(h('div', { class: 'host' },
        h('div', { class: 'avatar' + (hs.hidePhotos ? ' no-photo' : '') }, p.photo && !hs.hidePhotos ? h('img', { src: p.photo, alt: p.name, loading: 'lazy' }) : h('span', { text: initial })),
        p.role ? h('div', { class: 'role', text: p.role }) : null,
        h('div', { class: 'name', text: p.name }),
        p.parents ? h('div', { class: 'parents', text: p.parents }) : null,
        p.instagram ? h('a', { class: 'ig', href: 'https://instagram.com/' + p.instagram.replace(/^@/, ''), target: '_blank', rel: 'noopener', text: '@' + p.instagram.replace(/^@/, '') }) : null
      ), side));
    });
    return section('tuan-rumah', [heading('tuan-rumah', hs.eyebrow, hs.heading, hs.intro), list]);
  }

  function buildEvents() {
    var evs = D.events; if (!evs || !evs.length) return null;
    var wrap = h('div', { class: 'events' });
    evs.forEach(function (ev, i) {
      var q = ev.mapQuery || [ev.venue, ev.address].filter(Boolean).join(', ');
      wrap.appendChild(A(h('div', { class: 'card event' },
        h('div', { class: 'ev-icon' }, icon(i % 2 ? 'heart' : 'cal')),
        h('h3', { text: ev.name }),
        h('div', { class: 'meta' },
          h('b', { text: longDate(ev.start) }),
          h('span', { text: ev.timeText || '' })
        ),
        ev.venue ? h('div', { class: 'venue', text: ev.venue }) : null,
        ev.address ? h('div', { class: 'addr', text: ev.address }) : null,
        ev.mapEmbed && q ? h('iframe', { class: 'map', title: 'Peta ' + (ev.venue || ev.name), loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', src: 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&output=embed' }) : null,
        h('div', { class: 'actions' },
          ev.mapsUrl ? h('a', { class: 'btn small', href: ev.mapsUrl, target: '_blank', rel: 'noopener' }, icon('map'), 'Buka Peta') : null,
          h('a', { class: 'btn small ghost', href: calUrl(ev), target: '_blank', rel: 'noopener' }, icon('cal'), 'Kalender')
        )
      ), i % 2 ? 'right' : 'left'));
    });
    var dc = D.dresscode;
    var dress = dc ? A(h('div', { class: 'dress' },
      h('div', { text: dc.text }),
      dc.colors ? h('div', { class: 'swatches' }, dc.colors.map(function (c) { return h('i', { style: 'background:' + c, title: c }); })) : null
    ), 'up') : null;
    var s = D.eventsSection || {};
    return section('acara', [heading('acara', s.eyebrow || 'Save the Date', s.heading || 'Waktu & Tempat', s.intro), wrap, dress]);
  }

  function buildTimeline(key, id, defHeading) {
    var t = D[key]; if (!t || !t.items || !t.items.length) return null;
    var tl = h('div', { class: 'timeline' });
    t.items.forEach(function (it) {
      tl.appendChild(A(h('div', { class: 'item' },
        it.photo ? h('img', { class: 'tl-photo', src: it.photo, alt: it.title, loading: 'lazy' }) : null,
        it.when ? h('div', { class: 'when', text: it.when }) : null,
        h('div', { class: 'what', text: it.title }),
        it.text ? h('div', { class: 'desc', text: it.text }) : null
      ), 'left'));
    });
    return section(id, [heading(id, t.eyebrow, t.heading || defHeading, t.intro), tl]);
  }

  function buildGallery() {
    var g = D.gallery; if (!g) return null;
    var photos = g.photos && g.photos.length ? g.photos : [];
    var grid = h('div', { class: 'gallery' });
    var dlg = h('dialog', { class: 'lightbox', 'aria-label': 'Foto' });
    var big = h('img', { alt: '' });
    dlg.append(big, h('button', { class: 'btn small', type: 'button', onclick: function () { dlg.close(); } }, 'Tutup'));
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    if (photos.length) {
      photos.forEach(function (p, i) {
        grid.appendChild(A(h('button', { class: 'tile', type: 'button', 'aria-label': 'Perbesar foto ' + (i + 1), onclick: function () {
          big.src = p.src; big.alt = p.alt || ''; if (dlg.showModal) dlg.showModal();
        } }, h('img', { src: p.src, alt: p.alt || '', loading: 'lazy' })), 'zoom'));
      });
    } else {
      for (var i = 0; i < (g.placeholders || 5); i++) {
        grid.appendChild(A(h('div', { class: 'tile placeholder' }, h('span', { svg: ICON.photo }), 'Foto ' + (i + 1)), 'zoom'));
      }
    }
    return section('galeri', [heading('galeri', g.eyebrow || 'Galeri', g.heading || 'Momen Kami', g.intro), grid, dlg]);
  }

  function buildVideo() {
    var v = D.video; if (!v || !v.youtubeId) return null;
    var id = String(v.youtubeId).replace(/[^\w-]/g, '');
    return section('video', [
      heading('video', v.eyebrow || 'Video', v.heading || 'Cerita Kami', v.text),
      A(h('div', { class: 'video' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + id, title: v.heading || 'Video', loading: 'lazy', allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: true })), 'zoom')
    ]);
  }

  function buildStreaming() {
    var s = D.streaming; if (!s || !s.url) return null;
    return section('streaming', [
      heading('streaming', 'Live Streaming', s.heading || 'Saksikan Secara Daring', s.text),
      A(h('a', { class: 'btn', href: s.url, target: '_blank', rel: 'noopener' }, icon('live'), s.button || 'Tonton Siaran'), 'zoom')
    ]);
  }

  function buildGift() {
    var g = D.gift; if (!g) return null;
    var list = h('div', { class: 'gifts' });
    (g.accounts || []).forEach(function (a, i) {
      list.appendChild(A(h('div', { class: 'card gift' },
        h('div', { class: 'chip-card', 'aria-hidden': 'true' }),
        h('div', { class: 'bank', text: a.bank }),
        h('div', { class: 'num', text: a.number }),
        h('div', { class: 'holder', text: 'a.n. ' + a.holder }),
        h('button', { class: 'btn small ghost', type: 'button', onclick: function () { copyText(String(a.number).replace(/\s/g, '')); } }, icon('copy'), 'Salin Nomor')
      ), 'flip'));
    });
    if (g.address) {
      list.appendChild(A(h('div', { class: 'card gift' },
        h('div', { class: 'bank', text: 'Kirim Kado' }),
        h('div', { class: 'holder', style: 'color:var(--ink)', text: g.address }),
        h('button', { class: 'btn small ghost', type: 'button', onclick: function () { copyText(g.address); } }, icon('copy'), 'Salin Alamat')
      ), 'flip'));
    }
    return section('hadiah', [heading('hadiah', g.eyebrow || 'Amplop Digital', g.heading || 'Tanda Kasih', g.text), list]);
  }

  /* ---------- RSVP & ucapan ---------- */
  var ENDPOINT = D.endpoint || '';
  function send(payload) {
    payload.slug = SLUG; payload.time = new Date().toISOString();
    if (!ENDPOINT) return Promise.resolve();
    return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
  }

  function buildRsvp() {
    if (!D.rsvp) return null;
    var r = typeof D.rsvp === 'object' ? D.rsvp : {};
    var status = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    var nameIn = h('input', { id: 'rsvp-name', name: 'name', required: true, maxlength: 60, autocomplete: 'name' });
    nameIn.value = GUEST;
    var count = h('select', { id: 'rsvp-count', name: 'count' });
    for (var i = 1; i <= (r.maxGuests || 4); i++) count.appendChild(h('option', { value: i, text: i + ' orang' }));
    var opts = r.options || ['Ya, saya akan hadir', 'Maaf, tidak bisa hadir', 'Masih ragu'];
    var form = A(h('form', { class: 'form card', novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'rsvp-name', text: 'Nama' }), nameIn),
      h('fieldset', { class: 'field' }, h('legend', { text: 'Konfirmasi kehadiran' }),
        h('div', { class: 'choices' }, opts.map(function (o, idx) {
          return h('label', null, h('input', { type: 'radio', name: 'attend', value: o, required: true, checked: idx === 0 }), o);
        }))
      ),
      h('div', { class: 'field' }, h('label', { for: 'rsvp-count', text: 'Jumlah tamu' }), count),
      h('button', { class: 'btn', type: 'submit' }, 'Kirim Konfirmasi'),
      status
    ), 'up');
    var stats = h('div', { class: 'stats', hidden: true });
    var done = store('rsvp:' + SLUG);
    if (done) status.textContent = 'Konfirmasi Anda sudah tercatat. Anda bisa mengirim ulang bila ada perubahan.';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameIn.value.trim();
      if (!name) { status.textContent = 'Mohon isi nama Anda.'; nameIn.focus(); return; }
      var attend = (form.querySelector('input[name=attend]:checked') || {}).value;
      var data = { type: 'rsvp', name: name.slice(0, 60), attend: attend, count: count.value };
      store('rsvp:' + SLUG, data);
      status.textContent = 'Mengirim…';
      send(data).then(function () {
        status.textContent = 'Terima kasih, ' + data.name + '! Konfirmasi Anda sudah kami terima.';
        form.classList.add('sent');
      }, function () { status.textContent = 'Gagal terkirim. Periksa koneksi lalu coba lagi.'; });
    });
    /* Rekap kehadiran (butuh Google Sheets) */
    if (ENDPOINT) {
      fetch(ENDPOINT + (ENDPOINT.indexOf('?') > -1 ? '&' : '?') + 'type=stats&slug=' + encodeURIComponent(SLUG))
        .then(function (res) { return res.json(); })
        .then(function (s) {
          if (!s || typeof s !== 'object' || Array.isArray(s)) return;
          [['Hadir', s.hadir], ['Tidak hadir', s.tidak], ['Ragu', s.ragu]].forEach(function (x) {
            stats.appendChild(h('div', null, h('b', { text: String(Number(x[1]) || 0) }), h('span', { text: x[0] })));
          });
          stats.hidden = false;
        }).catch(function () {});
    }
    return section('rsvp', [heading('rsvp', 'RSVP', r.heading || 'Konfirmasi Kehadiran', r.text || 'Bantu kami menyiapkan acara dengan mengonfirmasi kehadiran Anda.'), stats, form]);
  }

  function wishCard(w) {
    var t = '';
    try { t = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(w.time)); } catch (e) {}
    return h('div', { class: 'wish' },
      h('div', { class: 'who' }, h('span', { class: 'wav', 'aria-hidden': 'true', text: (w.name || '?').charAt(0).toUpperCase() }), h('span', { text: w.name }), w.attend ? h('span', { class: 'badge', text: w.attend }) : null),
      h('p', { class: 'msg', text: w.message }),
      t ? h('div', { class: 'time', text: t }) : null
    );
  }

  function buildWishes() {
    if (!D.wishes) return null;
    var w = typeof D.wishes === 'object' ? D.wishes : {};
    var list = h('div', { class: 'wishes', id: 'wish-list', 'aria-live': 'polite' });
    var nameIn = h('input', { id: 'wish-name', required: true, maxlength: 60, autocomplete: 'name' });
    nameIn.value = GUEST;
    var msg = h('textarea', { id: 'wish-msg', required: true, maxlength: 500 });
    var status = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    var form = A(h('form', { class: 'form card', novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'wish-name', text: 'Nama' }), nameIn),
      h('div', { class: 'field' }, h('label', { for: 'wish-msg', text: 'Ucapan & doa' }), msg),
      h('button', { class: 'btn', type: 'submit' }, 'Kirim Ucapan'),
      status
    ), 'up');
    var local = store('wishes:' + SLUG) || [];
    var remote = [];
    function render(newest) {
      var all = remote.concat(local.filter(function (l) {
        return !remote.some(function (r) { return r.name === l.name && r.message === l.message; });
      }));
      all.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
      list.replaceChildren();
      if (!all.length) list.appendChild(h('div', { class: 'empty', text: 'Belum ada ucapan. Jadilah yang pertama!' }));
      all.forEach(function (x, i) { var c = wishCard(x); if (newest && i === 0) c.classList.add('new'); list.appendChild(c); });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = nameIn.value.trim(), m = msg.value.trim();
      if (!n || !m) { status.textContent = 'Mohon isi nama dan ucapan.'; return; }
      var rs = store('rsvp:' + SLUG);
      var item = { type: 'wish', name: n.slice(0, 60), message: m.slice(0, 500), attend: rs && rs.name === n ? rs.attend : '', time: new Date().toISOString() };
      local.push(item); store('wishes:' + SLUG, local); render(true);
      msg.value = ''; status.textContent = 'Terima kasih atas ucapan dan doanya!';
      send(Object.assign({}, item));
    });
    render();
    if (ENDPOINT) {
      fetch(ENDPOINT + (ENDPOINT.indexOf('?') > -1 ? '&' : '?') + 'slug=' + encodeURIComponent(SLUG))
        .then(function (r) { return r.json(); })
        .then(function (rows) {
          if (Array.isArray(rows)) {
            remote = rows.filter(function (r) { return r && r.name && r.message; }).map(function (r) {
              return { name: String(r.name).slice(0, 60), message: String(r.message).slice(0, 500), attend: r.attend ? String(r.attend).slice(0, 40) : '', time: r.time };
            });
            render();
          }
        }).catch(function () {});
    }
    return section('ucapan', [heading('ucapan', 'Ucapan', w.heading || 'Doa & Ucapan', w.text || 'Kirimkan doa dan ucapan terbaik Anda.'), form, list]);
  }

  function buildClosing() {
    var c = D.closing || {};
    return section('penutup', [
      A(frame((D.cover || {}).photo, '', 'sm'), 'zoom'),
      c.text ? A(h('p', { text: c.text }), 'up') : null,
      c.greeting ? A(h('p', { class: 'greet', text: c.greeting }), 'up') : null,
      c.signatureLabel ? A(h('div', { class: 'eyebrow', text: c.signatureLabel }), 'up') : null,
      letters('div', 'script-sm', c.signature || (D.cover && D.cover.title) || '', 300),
      orn('bottom')
    ], 'closing');
  }

  function buildCredit() {
    return h('footer', { class: 'credit' }, 'Undangan digital oleh ', h('a', { href: '/', text: SITE.brandName || 'Undangan Digital' }));
  }

  /* ---------- Partikel melayang ---------- */
  var PSHAPE = {
    petals: function () { return '<svg viewBox="0 0 20 20"><path d="M10 1c5 4 6 10 0 18C4 11 5 5 10 1z" fill="currentColor"/></svg>'; },
    leaves: function () { return '<svg viewBox="0 0 20 20"><path d="M3 17C3 8 9 3 17 3c0 8-5 14-14 14z" fill="currentColor"/><path d="M3 17L13 7" stroke="rgba(255,255,255,.5)" stroke-width="1"/></svg>'; },
    snow: function () { return '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" fill="currentColor"/></svg>'; },
    bubbles: function () { return '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity=".6"/></svg>'; },
    confetti: function () { return Math.random() < .5 ? '<svg viewBox="0 0 20 20"><rect x="5" y="2" width="10" height="16" rx="2" fill="currentColor"/></svg>' : '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="currentColor"/></svg>'; },
    stars: function () { return '<svg viewBox="0 0 20 20"><path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="currentColor"/></svg>'; },
    sparkle: function () { return '<svg viewBox="0 0 20 20"><path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="currentColor"/></svg>'; },
    hearts: function () { return '<svg viewBox="0 0 20 20"><path d="M10 18S2 13 2 7a4 4 0 018-1.5A4 4 0 0118 7c0 6-8 11-8 11z" fill="currentColor"/></svg>'; }
  };
  function buildParticles() {
    var type = T.particles;
    if (!type || type === 'none' || REDUCED || !PSHAPE[type]) return null;
    var box = h('div', { class: 'particles p-' + type, 'aria-hidden': 'true' });
    var twinkle = type === 'stars' || type === 'sparkle';
    var n = T.particleCount || (twinkle ? 22 : type === 'confetti' ? 26 : 16);
    var colors = type === 'confetti' ? ['var(--accent)', 'var(--accent-2)', '#4CC9F0', '#FFD84D', '#FF5C8A'] : ['var(--particle, var(--accent-2))'];
    for (var i = 0; i < n; i++) {
      var size = twinkle ? rand(6, 14) : type === 'bubbles' ? rand(10, 26) : rand(10, 20);
      var p = h('span', { class: 'p' }, h('span', { class: 'pi', svg: PSHAPE[type]() }));
      p.style.cssText = 'left:' + rand(0, 100).toFixed(1) + '%;' +
        (twinkle ? 'top:' + rand(0, 100).toFixed(1) + '%;' : '') +
        '--size:' + size.toFixed(0) + 'px;--dur:' + rand(twinkle ? 2.5 : 9, twinkle ? 5 : 18).toFixed(1) + 's;' +
        '--delay:-' + rand(0, 18).toFixed(1) + 's;--drift:' + rand(-60, 60).toFixed(0) + 'px;--spin:' + rand(2.5, 6).toFixed(1) + 's;' +
        'color:' + colors[i % colors.length] + ';opacity:' + rand(.45, .9).toFixed(2);
      box.appendChild(p);
    }
    return box;
  }

  /* ---------- Menu navigasi bawah ---------- */
  function buildDock() {
    var items = [
      ['home', 'home', 'Beranda'],
      ['tuan-rumah', 'people', D.hosts && D.hosts.people && D.hosts.people.length > 1 ? 'Mempelai' : 'Profil'],
      ['acara', 'cal', 'Acara'],
      ['galeri', 'photo', 'Galeri'],
      ['rsvp', 'check', 'RSVP'],
      ['hadiah', 'gift', 'Hadiah'],
      ['ucapan', 'chat', 'Ucapan']
    ].filter(function (x) { return document.getElementById(x[0]); }).slice(0, 5);
    if (items.length < 3) return null;
    var nav = h('nav', { class: 'dock', 'aria-label': 'Navigasi undangan' });
    items.forEach(function (x) {
      nav.appendChild(h('a', { href: '#' + x[0], 'data-target': x[0], 'aria-label': x[2] }, icon(x[1]), h('span', { text: x[2] })));
    });
    document.body.appendChild(nav);
    if ('IntersectionObserver' in window) {
      var links = $$('a', nav);
      var io = new IntersectionObserver(function (ens) {
        ens.forEach(function (en) {
          if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-target') === en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      items.forEach(function (x) { io.observe(document.getElementById(x[0])); });
    }
    return nav;
  }

  /* ---------- Musik & gulir otomatis ---------- */
  var audio, musicBtn, autoBtn, autoOn = false, rafId;
  function buildFabs() {
    var stack = h('div', { class: 'fabs' });
    if (D.music) {
      audio = h('audio', { src: D.music, loop: true, preload: 'none' });
      musicBtn = h('button', { class: 'fab', type: 'button', 'aria-label': 'Putar/jeda musik', 'aria-pressed': 'false', svg: ICON.disc, onclick: function () {
        if (audio.paused) playMusic(); else { audio.pause(); setMusic(false); }
      } });
      document.body.appendChild(audio);
      stack.appendChild(musicBtn);
    }
    if (D.autoScroll !== false) {
      autoBtn = h('button', { class: 'fab', type: 'button', 'aria-label': 'Gulir otomatis', 'aria-pressed': 'false', svg: ICON.scroll, onclick: function () { toggleAuto(!autoOn); } });
      stack.appendChild(autoBtn);
      ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { if (autoOn) toggleAuto(false); }, { passive: true }); });
    }
    document.body.appendChild(stack);
  }
  function toggleAuto(on) {
    autoOn = on;
    autoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    autoBtn.innerHTML = on ? ICON.pause : ICON.scroll;
    autoBtn.classList.toggle('on', on);
    cancelAnimationFrame(rafId);
    if (!on) return;
    var last = performance.now();
    (function step(now) {
      var dt = Math.min(64, now - last); last = now;
      window.scrollBy(0, dt * 0.045);
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) { toggleAuto(false); return; }
      rafId = requestAnimationFrame(step);
    })(last);
  }
  function setMusic(on) { if (!musicBtn) return; musicBtn.classList.toggle('playing', on); musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function playMusic() {
    if (!audio) return;
    var p = audio.play();
    if (p && p.then) p.then(function () { setMusic(true); }, function () { setMusic(false); }); else setMusic(true);
  }

  /* ---------- Buka undangan ---------- */
  function openInvitation() {
    var cover = $('#cover');
    if (cover.classList.contains('opening')) return;
    cover.classList.add('opening');
    playMusic();
    setTimeout(function () { cover.classList.add('opened'); }, REDUCED ? 0 : 380);
    setTimeout(function () {
      document.body.classList.remove('locked');
      document.body.classList.add('is-open');
      window.scrollTo(0, 0);
      initReveal();
    }, REDUCED ? 50 : 900);
    setTimeout(function () {
      cover.hidden = true;
      var m = $('#main'); if (m) m.focus({ preventScroll: true });
    }, REDUCED ? 300 : 2000);
  }

  /* ---------- Animasi muncul saat scroll ---------- */
  function initReveal() {
    var els = $$('.reveal');
    els.forEach(function (sec) {
      $$('[data-a]', sec).forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 8)); });
    });
    if (!('IntersectionObserver' in window) || REDUCED) { els.forEach(function (e) { e.classList.add('go'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('go'); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Rakit halaman ---------- */
  function mount() {
    var c = D.cover || {};
    if (c.title) document.title = (c.eyebrow ? c.eyebrow + ' ' : '') + c.title + (GUEST ? ' — untuk ' + GUEST : '');
    if (T.pattern) document.documentElement.classList.add('pat-' + T.pattern);
    var main = h('main', { class: 'main', id: 'main', tabindex: '-1' },
      buildHero(),
      buildOpening(),
      buildHosts(),
      buildEvents(),
      buildTimeline('rundown', 'rundown', 'Susunan Acara'),
      buildTimeline('story', 'kisah', 'Kisah Kami'),
      buildGallery(),
      buildVideo(),
      buildStreaming(),
      buildRsvp(),
      buildGift(),
      buildWishes(),
      buildClosing(),
      buildCredit()
    );
    var loader = buildLoader();
    document.body.replaceChildren(loader, buildCover(), h('div', { class: 'layout' }, buildSide(), main));
    var parts = buildParticles(); if (parts) document.body.appendChild(parts);
    document.body.classList.add('locked');
    buildFabs();
    buildDock();
    startCountdown();

    /* Tutup layar memuat: tunggu font & halaman siap (maks. 3,5 detik) */
    var shown = Date.now(), closed = false;
    function ready() {
      if (closed) return; closed = true;
      setTimeout(function () {
        loader.classList.add('done');
        $('#cover').classList.add('go');
        var side = $('.side'); if (side) side.classList.add('go');
        var ob = $('#open-btn'); if (ob) ob.focus({ preventScroll: true });
        setTimeout(function () { loader.remove(); }, 700);
      }, Math.max(0, (REDUCED ? 0 : 900) - (Date.now() - shown)));
    }
    if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
    setTimeout(ready, 3500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
