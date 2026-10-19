/* =========================================================
   Mesin undangan bersama.
   Setiap template cukup mengisi window.INVITATION lalu memuat file ini.
   Semua teks dari data & dari tamu dimasukkan lewat textContent (aman dari XSS).
   ========================================================= */
(function () {
  'use strict';

  var D = window.INVITATION || {};
  var SITE = window.SITE || {};
  var TZ = D.timeZone || 'Asia/Jakarta';
  var SLUG = D.slug || location.pathname.replace(/\W+/g, '-');

  /* ---------- Utilitas ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'svg') el.innerHTML = v; /* hanya untuk SVG milik file ini */
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
  function $(sel) { return document.querySelector(sel); }

  function fmtDate(iso, opts) {
    try {
      return new Intl.DateTimeFormat('id-ID', Object.assign({ timeZone: TZ }, opts)).format(new Date(iso));
    } catch (e) { return iso; }
  }
  function longDate(iso) { return fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function dotDate(iso) {
    var p = fmtDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric' }).split(/\D+/);
    return p.join(' · ');
  }

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
  function guestName() {
    var q = new URLSearchParams(location.search);
    var n = q.get('to') || q.get('kepada') || '';
    n = n.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return n;
  }
  var GUEST = guestName();

  /* ---------- Ornamen SVG ---------- */
  var ORN = {
    floral: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 40c30-24 60-24 90-4 30-20 60-20 90 4"/><circle cx="100" cy="30" r="5" fill="currentColor"/><path d="M100 25c-4-10 4-16 0-22M100 25c4-10-4-16 0-22"/><circle cx="58" cy="25" r="3.5"/><circle cx="142" cy="25" r="3.5"/><circle cx="34" cy="31" r="2"/><circle cx="166" cy="31" r="2"/><path d="M70 22c-6-6-14-4-16 2 6 4 12 4 16-2zM130 22c6-6 14-4 16 2-6 4-12 4-16-2z" fill="currentColor" fill-opacity=".25"/></svg>',
    batik: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><g><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/><circle cx="100" cy="28" r="2" fill="currentColor"/></g><g transform="translate(-50 0)"><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/></g><g transform="translate(50 0)"><ellipse cx="100" cy="18" rx="6" ry="10"/><ellipse cx="100" cy="38" rx="6" ry="10"/><ellipse cx="90" cy="28" rx="10" ry="6"/><ellipse cx="110" cy="28" rx="10" ry="6"/></g><path d="M10 28h18M172 28h18"/></svg>',
    leaf: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M20 30c40-4 120-4 160 0"/><path d="M60 29c-4-12 6-20 16-20-2 10-8 18-16 20zM100 28c0-14 10-22 20-22 0 12-8 20-20 22zM140 29c-2-12 8-20 18-18-2 10-10 18-18 18z" fill="currentColor" fill-opacity=".2"/><path d="M80 30c-6 10-2 18 8 20 2-10-2-18-8-20zM120 30c-4 10 2 18 10 18 0-10-4-16-10-18z" fill="currentColor" fill-opacity=".2"/></svg>',
    line: '<svg viewBox="0 0 200 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M10 12h78M112 12h78"/><path d="M100 4l8 8-8 8-8-8z"/></svg>',
    islamic: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="86" y="14" width="28" height="28"/><rect x="86" y="14" width="28" height="28" transform="rotate(45 100 28)"/><circle cx="100" cy="28" r="6"/><path d="M10 28h60M130 28h60"/><circle cx="76" cy="28" r="2.5" fill="currentColor"/><circle cx="124" cy="28" r="2.5" fill="currentColor"/><path d="M40 20l6 8-6 8-6-8zM160 20l6 8-6 8-6-8z"/></svg>',
    cloud: '<svg viewBox="0 0 200 56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M70 40h60a12 12 0 000-24 18 18 0 00-34-4 14 14 0 00-26 14 7 7 0 000 14z" fill="currentColor" fill-opacity=".12"/><path d="M30 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM170 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM158 40l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="currentColor"/></svg>',
    confetti: '<svg viewBox="0 0 200 56" aria-hidden="true"><g fill="currentColor"><rect x="20" y="12" width="10" height="5" rx="2" transform="rotate(-20 25 14)"/><circle cx="52" cy="38" r="4"/><rect x="78" y="8" width="5" height="12" rx="2" transform="rotate(30 80 14)"/><circle cx="118" cy="16" r="3"/><rect x="142" y="34" width="12" height="5" rx="2" transform="rotate(15 148 36)"/><circle cx="178" cy="20" r="4"/></g><g style="fill:var(--accent-2)"><circle cx="36" cy="30" r="3"/><rect x="62" y="16" width="10" height="5" rx="2" transform="rotate(40 67 18)"/><circle cx="100" cy="40" r="4.5"/><rect x="128" y="40" width="5" height="11" rx="2" transform="rotate(-25 130 45)"/><circle cx="164" cy="12" r="3"/></g></svg>',
    geo: '<svg viewBox="0 0 200 40" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 20h60"/><path d="M130 20h60"/><rect x="84" y="6" width="28" height="28" rx="3" transform="rotate(45 98 20)"/><circle cx="98" cy="20" r="4" fill="currentColor"/></svg>'
  };
  function orn(extra) {
    return h('div', { class: 'orn ' + (extra || ''), svg: ORN[(D.theme && D.theme.ornament) || 'line'] || ORN.line });
  }

  var ICON = {
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    disc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-4 4 3 3-2 6 4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>',
    live: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/></svg>'
  };
  function icon(name) { return h('span', { 'aria-hidden': 'true', style: 'display:inline-flex', svg: ICON[name] }); }

  /* ---------- Kalender Google ---------- */
  function calUrl(ev) {
    function z(iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var end = ev.end || new Date(new Date(ev.start).getTime() + 2 * 3600e3).toISOString();
    var p = new URLSearchParams({
      action: 'TEMPLATE',
      text: (ev.name || 'Acara') + ' — ' + (D.cover && D.cover.title || ''),
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
      eyebrow ? h('div', { class: 'eyebrow', text: eyebrow }) : null,
      h('h2', { id: id + '-h', text: text }),
      lead ? h('p', { class: 'lead', text: lead }) : null
    ];
  }

  function buildCover() {
    var c = D.cover || {};
    var first = (D.events || [])[0];
    return h('div', { class: 'cover', id: 'cover', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Sampul undangan' },
      orn('big'),
      h('div', { class: 'eyebrow', text: c.eyebrow || 'Undangan' }),
      h('h1', { class: 'title-script', text: c.title || '' }),
      first ? h('div', { class: 'date-line', text: dotDate(first.start) }) : null,
      h('div', { class: 'guest-box' },
        h('span', { class: 'to', text: c.toLabel || 'Kepada Yth. Bapak/Ibu/Saudara/i' }),
        h('span', { class: 'name', text: GUEST || (c.defaultGuest || 'Tamu Undangan') }),
        h('span', { class: 'note', text: c.note || 'Mohon maaf bila ada kesalahan penulisan nama/gelar' })
      ),
      h('button', { class: 'btn', type: 'button', id: 'open-btn', style: 'margin-top:18px', onclick: openInvitation }, icon('mail'), c.button || 'Buka Undangan'),
      orn('flip')
    );
  }

  function buildSide() {
    var c = D.cover || {};
    var first = (D.events || [])[0];
    return h('aside', { class: 'side', 'aria-hidden': 'true' },
      orn('big'),
      h('div', { class: 'eyebrow', text: c.eyebrow || '' }),
      h('div', { class: 'title-script', text: c.title || '' }),
      first ? h('div', { class: 'date-line', style: 'letter-spacing:.14em', text: longDate(first.start) }) : null,
      orn('flip')
    );
  }

  function buildHero() {
    var hr = D.hero || {};
    var c = D.cover || {};
    var first = (D.events || [])[0];
    var target = D.countdownTo || (first && first.start);
    var cd = target ? h('div', { class: 'countdown', id: 'countdown', role: 'timer', 'aria-label': 'Hitung mundur acara' }) : null;
    return h('section', { class: 'block hero', id: 'home' },
      orn(),
      h('div', { class: 'eyebrow', text: hr.eyebrow || c.eyebrow || '' }),
      h('div', { class: 'title-script', text: hr.title || c.title || '' }),
      first ? h('div', { text: longDate(first.start), style: 'letter-spacing:.06em' }) : null,
      hr.text ? h('p', { class: 'lead', style: 'margin-bottom:0', text: hr.text }) : null,
      cd,
      first ? h('div', { class: 'actions' },
        h('a', { class: 'btn small ghost', href: calUrl(first), target: '_blank', rel: 'noopener' }, icon('cal'), 'Simpan ke Kalender')
      ) : null
    );
  }

  function startCountdown() {
    var el = $('#countdown');
    if (!el) return;
    var first = (D.events || [])[0];
    var t = new Date(D.countdownTo || first.start).getTime();
    var units = [['Hari', 864e5], ['Jam', 36e5], ['Menit', 6e4], ['Detik', 1e3]];
    var cells = units.map(function (u) { var b = h('b', { text: '0' }); el.appendChild(h('div', null, b, h('span', { text: u[0] }))); return b; });
    function tick() {
      var diff = t - Date.now();
      if (diff <= 0) {
        el.replaceChildren(h('div', { style: 'grid-column:1/-1' }, h('b', { text: D.countdownDone || 'Acara telah berlangsung', style: 'font-size:18px' })));
        clearInterval(timer); return;
      }
      units.forEach(function (u, i) { var v = Math.floor(diff / u[1]); diff -= v * u[1]; cells[i].textContent = String(v).padStart(2, '0'); });
    }
    var timer = setInterval(tick, 1000); tick();
  }

  function buildOpening() {
    var o = D.opening; if (!o) return null;
    return section('salam', [
      o.arabic ? h('div', { class: 'arabic', lang: 'ar', text: o.arabic }) : null,
      o.greeting ? h('p', { style: 'font-weight:600;margin:10px 0', text: o.greeting }) : null,
      o.text ? h('p', { class: 'lead', style: 'margin-bottom:0', text: o.text }) : null,
      D.quote ? h('blockquote', { class: 'quote', style: 'margin-top:26px' }, D.quote.text, D.quote.source ? h('cite', { text: D.quote.source }) : null) : null
    ]);
  }

  function buildHosts() {
    var hs = D.hosts; if (!hs || !hs.people || !hs.people.length) return null;
    var list = h('div', { class: 'hosts' });
    hs.people.forEach(function (p, i) {
      if (i > 0 && hs.joiner) list.appendChild(h('div', { class: 'amp', 'aria-hidden': 'true', text: hs.joiner }));
      var initial = (p.name || '?').trim().charAt(0).toUpperCase();
      list.appendChild(h('div', { class: 'host' },
        h('div', { class: 'avatar' }, p.photo ? h('img', { src: p.photo, alt: p.name, loading: 'lazy' }) : initial),
        p.role ? h('div', { class: 'role', text: p.role }) : null,
        h('div', { class: 'name', text: p.name }),
        p.parents ? h('div', { class: 'parents', text: p.parents }) : null,
        p.instagram ? h('a', { class: 'ig', href: 'https://instagram.com/' + p.instagram.replace(/^@/, ''), target: '_blank', rel: 'noopener', text: '@' + p.instagram.replace(/^@/, '') }) : null
      ));
    });
    return section('tuan-rumah', [heading('tuan-rumah', hs.eyebrow, hs.heading, hs.intro), list]);
  }

  function buildEvents() {
    var evs = D.events; if (!evs || !evs.length) return null;
    var wrap = h('div', { class: 'events' });
    evs.forEach(function (ev) {
      wrap.appendChild(h('div', { class: 'card' },
        h('h3', { text: ev.name }),
        h('div', { class: 'meta' },
          h('b', { text: longDate(ev.start) }),
          h('span', { text: ev.timeText || '' })
        ),
        ev.venue ? h('div', { style: 'font-weight:600;margin-top:6px', text: ev.venue }) : null,
        ev.address ? h('div', { class: 'addr', text: ev.address }) : null,
        h('div', { class: 'actions' },
          ev.mapsUrl ? h('a', { class: 'btn small', href: ev.mapsUrl, target: '_blank', rel: 'noopener' }, icon('map'), 'Buka Peta') : null,
          h('a', { class: 'btn small ghost', href: calUrl(ev), target: '_blank', rel: 'noopener' }, icon('cal'), 'Kalender')
        )
      ));
    });
    var dc = D.dresscode;
    var dress = dc ? h('div', { class: 'dress' },
      h('div', { text: dc.text }),
      dc.colors ? h('div', { class: 'swatches' }, dc.colors.map(function (c) { return h('i', { style: 'background:' + c, title: c }); })) : null
    ) : null;
    var s = D.eventsSection || {};
    return section('acara', [heading('acara', s.eyebrow || 'Save the Date', s.heading || 'Waktu & Tempat', s.intro), wrap, dress]);
  }

  function buildTimeline(key, id, defHeading) {
    var t = D[key]; if (!t || !t.items || !t.items.length) return null;
    var tl = h('div', { class: 'timeline' });
    t.items.forEach(function (it) {
      tl.appendChild(h('div', { class: 'item' },
        it.when ? h('div', { class: 'when', text: it.when }) : null,
        h('div', { class: 'what', text: it.title }),
        it.text ? h('div', { class: 'desc', text: it.text }) : null
      ));
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
        grid.appendChild(h('button', { class: 'tile', type: 'button', 'aria-label': 'Perbesar foto ' + (i + 1), onclick: function () {
          big.src = p.src; big.alt = p.alt || ''; if (dlg.showModal) dlg.showModal();
        } }, h('img', { src: p.src, alt: p.alt || '', loading: 'lazy' })));
      });
    } else {
      for (var i = 0; i < (g.placeholders || 5); i++) {
        grid.appendChild(h('div', { class: 'tile placeholder' }, h('span', { svg: ICON.photo }), 'Foto ' + (i + 1)));
      }
    }
    return section('galeri', [heading('galeri', g.eyebrow, g.heading || 'Galeri', g.intro), grid, dlg]);
  }

  function buildStreaming() {
    var s = D.streaming; if (!s || !s.url) return null;
    return section('streaming', [
      heading('streaming', 'Live Streaming', s.heading || 'Saksikan Secara Daring', s.text),
      h('a', { class: 'btn', href: s.url, target: '_blank', rel: 'noopener' }, icon('live'), s.button || 'Tonton Siaran')
    ]);
  }

  function buildGift() {
    var g = D.gift; if (!g) return null;
    var list = h('div', { class: 'gifts' });
    (g.accounts || []).forEach(function (a) {
      list.appendChild(h('div', { class: 'card gift' },
        h('div', { class: 'bank', text: a.bank }),
        h('div', { class: 'num', text: a.number }),
        h('div', { class: 'holder', text: 'a.n. ' + a.holder }),
        h('button', { class: 'btn small ghost', type: 'button', onclick: function () { copyText(String(a.number).replace(/\s/g, '')); } }, icon('copy'), 'Salin Nomor')
      ));
    });
    if (g.address) {
      list.appendChild(h('div', { class: 'card gift' },
        h('div', { class: 'bank', text: 'Kirim Kado' }),
        h('div', { class: 'holder', style: 'color:var(--ink)', text: g.address }),
        h('button', { class: 'btn small ghost', type: 'button', onclick: function () { copyText(g.address); } }, icon('copy'), 'Salin Alamat')
      ));
    }
    return section('hadiah', [heading('hadiah', g.eyebrow || 'Amplop Digital', g.heading || 'Tanda Kasih', g.text), list]);
  }

  /* ---------- RSVP & ucapan ---------- */
  var ENDPOINT = D.endpoint || '';
  function send(payload) {
    payload.slug = SLUG; payload.time = new Date().toISOString();
    if (!ENDPOINT) return Promise.resolve();
    /* Google Apps Script: text/plain agar tidak memicu preflight CORS */
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
    var form = h('form', { class: 'form', novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'rsvp-name', text: 'Nama' }), nameIn),
      h('fieldset', { class: 'field' }, h('legend', { text: 'Konfirmasi kehadiran' }),
        h('div', { class: 'choices' }, opts.map(function (o, idx) {
          return h('label', null, h('input', { type: 'radio', name: 'attend', value: o, required: true, checked: idx === 0 }), o);
        }))
      ),
      h('div', { class: 'field' }, h('label', { for: 'rsvp-count', text: 'Jumlah tamu' }), count),
      h('button', { class: 'btn', type: 'submit' }, 'Kirim Konfirmasi'),
      status
    );
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
      }, function () {
        status.textContent = 'Gagal terkirim. Periksa koneksi lalu coba lagi.';
      });
    });
    return section('rsvp', [heading('rsvp', 'RSVP', r.heading || 'Konfirmasi Kehadiran', r.text || 'Bantu kami menyiapkan acara dengan mengonfirmasi kehadiran Anda.'), form]);
  }

  function wishCard(w) {
    var t = '';
    try { t = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(w.time)); } catch (e) {}
    return h('div', { class: 'wish' },
      h('div', { class: 'who' }, h('span', { text: w.name }), w.attend ? h('span', { class: 'badge', text: w.attend }) : null),
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
    var form = h('form', { class: 'form', novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'wish-name', text: 'Nama' }), nameIn),
      h('div', { class: 'field' }, h('label', { for: 'wish-msg', text: 'Ucapan & doa' }), msg),
      h('button', { class: 'btn', type: 'submit' }, 'Kirim Ucapan'),
      status
    );
    var local = store('wishes:' + SLUG) || [];
    var remote = [];
    function render() {
      var all = remote.concat(local.filter(function (l) {
        return !remote.some(function (r) { return r.name === l.name && r.message === l.message; });
      }));
      all.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
      list.replaceChildren();
      if (!all.length) list.appendChild(h('div', { class: 'empty', text: 'Belum ada ucapan. Jadilah yang pertama!' }));
      all.forEach(function (x) { list.appendChild(wishCard(x)); });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = nameIn.value.trim(), m = msg.value.trim();
      if (!n || !m) { status.textContent = 'Mohon isi nama dan ucapan.'; return; }
      var rs = store('rsvp:' + SLUG);
      var item = { type: 'wish', name: n.slice(0, 60), message: m.slice(0, 500), attend: rs && rs.name === n ? rs.attend : '', time: new Date().toISOString() };
      local.push(item); store('wishes:' + SLUG, local); render();
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
      orn(),
      c.text ? h('p', { text: c.text }) : null,
      c.greeting ? h('p', { style: 'font-weight:600', text: c.greeting }) : null,
      c.signatureLabel ? h('div', { class: 'eyebrow', style: 'margin-top:18px', text: c.signatureLabel }) : null,
      h('div', { class: 'script-sm', text: c.signature || (D.cover && D.cover.title) || '' })
    ], 'closing');
  }

  function buildCredit() {
    var brand = SITE.brandName || 'Undangan Digital';
    return h('footer', { class: 'credit' }, 'Undangan digital oleh ', h('a', { href: '/', text: brand }));
  }

  /* ---------- Musik ---------- */
  var audio, musicBtn;
  function buildMusic() {
    if (!D.music) return;
    audio = h('audio', { src: D.music, loop: true, preload: 'none' });
    musicBtn = h('button', { class: 'music', type: 'button', 'aria-label': 'Putar/jeda musik', 'aria-pressed': 'false', svg: ICON.disc, onclick: function () {
      if (audio.paused) playMusic(); else { audio.pause(); setMusic(false); }
    } });
    document.body.append(audio, musicBtn);
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
    cover.classList.add('opened');
    document.body.classList.remove('locked');
    if (musicBtn) musicBtn.classList.add('show');
    playMusic();
    window.scrollTo(0, 0);
    setTimeout(function () { cover.hidden = true; var m = $('#main'); if (m) m.focus({ preventScroll: true }); }, 900);
  }

  /* ---------- Animasi scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Rakit halaman ---------- */
  function mount() {
    if (D.cover && D.cover.title) document.title = (D.cover.eyebrow ? D.cover.eyebrow + ' ' : '') + D.cover.title + (GUEST ? ' — untuk ' + GUEST : '');
    var main = h('main', { class: 'main', id: 'main', tabindex: '-1' },
      buildHero(),
      buildOpening(),
      buildHosts(),
      buildEvents(),
      buildTimeline('rundown', 'rundown', 'Susunan Acara'),
      buildTimeline('story', 'kisah', 'Kisah Kami'),
      buildGallery(),
      buildStreaming(),
      buildRsvp(),
      buildGift(),
      buildWishes(),
      buildClosing(),
      buildCredit()
    );
    var app = h('div', { class: 'layout' }, buildSide(), main);
    document.body.replaceChildren(buildCover(), app);
    document.body.classList.add('locked');
    buildMusic();
    startCountdown();
    initReveal();
    var ob = $('#open-btn'); if (ob) ob.focus({ preventScroll: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
