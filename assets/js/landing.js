(function () {
  'use strict';
  var S = window.SITE || {};
  var num = String(S.whatsapp || '').replace(/\D/g, '');
  function waLink(msg) { return 'https://wa.me/' + num + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

  function el(tag, props) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') e.textContent = props[k];
      else if (k === 'class') e.className = props[k];
      else e.setAttribute(k, props[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }

  /* ---------- Kartu template dari templates-data.js ---------- */
  var grid = document.getElementById('tgrid');
  var SPARK = '<svg viewBox="0 0 20 20" width="8" height="8" aria-hidden="true"><path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="currentColor"/></svg>';
  if (grid && window.TEMPLATES) {
    window.TEMPLATES.forEach(function (t) {
      var demo = '/templates/' + t.slug + '?to=Tamu+Undangan';
      var prev = el('a', { class: 'tprev', href: demo, target: '_blank', rel: 'noopener', 'aria-label': 'Demo ' + t.name,
        style: '--bg:' + t.bg + ';--fg:' + t.fg + ';--f:' + t.font + ';--s:' + t.size + 'px;--w:' + t.weight },
        el('span', { class: 'ey', text: t.eyebrow }),
        el('span', { class: 'tt', text: t.title }),
        el('span', { class: 'dt', text: t.date })
      );
      for (var i = 0; i < 3; i++) { var s = el('span', { class: 'spark' }); s.innerHTML = SPARK; prev.appendChild(s); }
      var fx = el('div', { class: 'fx' }, el('span', { text: 'Buka: ' + t.fx }), t.px && t.px !== '—' ? el('span', { text: t.px }) : null);
      var card = el('article', { class: 'tcard rv', 'data-cat': t.cat },
        prev,
        el('div', { class: 'tbody' },
          el('div', { class: 'top' }, el('h3', { text: t.name }), el('span', { class: 'chip', text: t.label })),
          fx,
          el('div', { class: 'row' },
            el('a', { class: 'btn sm outline', href: demo, target: '_blank', rel: 'noopener', text: 'Lihat Demo' }),
            el('a', { class: 'btn sm', 'data-wa': 'Halo, saya ingin pesan undangan template ' + t.name + '.', href: '#', text: 'Pilih' })
          )
        )
      );
      grid.appendChild(card);
    });
  }

  /* ---------- Isi nama brand, kota, tahun ---------- */
  document.querySelectorAll('[data-brand]').forEach(function (e) { if (S.brandName) e.textContent = S.brandName; });
  document.querySelectorAll('[data-city]').forEach(function (e) { if (S.city) e.textContent = S.city; });
  document.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  if (S.brandName) document.title = S.brandName + ' — Jasa Undangan Digital';

  /* Tombol WhatsApp: href dari nomor + pesan di data-wa */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') || '');
    a.target = '_blank'; a.rel = 'noopener';
  });
  document.querySelectorAll('[data-ig]').forEach(function (a) {
    if (S.instagram) { var ig = S.instagram.replace(/^@/, ''); a.href = 'https://instagram.com/' + ig; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Instagram @' + ig; }
    else a.remove();
  });

  /* ---------- Menu HP ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- Filter template ---------- */
  var buttons = document.querySelectorAll('[data-filter]');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.tcard').forEach(function (c) {
        c.hidden = !(f === 'all' || c.getAttribute('data-cat') === f);
        c.classList.add('in');
      });
    });
  });

  /* ---------- Animasi muncul saat scroll ---------- */
  document.querySelectorAll('.cat, .feature, .plan, .addons, .domain, .steps li, .faq details, .cta, .sec-head').forEach(function (e) { e.classList.add('rv'); });
  var items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var sibs = Array.prototype.indexOf.call(en.target.parentNode.children, en.target);
      en.target.style.transitionDelay = Math.min(sibs % 4, 3) * 90 + 'ms';
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.1 });
  items.forEach(function (e) { io.observe(e); });
})();
