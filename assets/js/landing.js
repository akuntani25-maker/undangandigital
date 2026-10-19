(function () {
  'use strict';
  var S = window.SITE || {};

  // Isi nama brand, kota, tahun
  document.querySelectorAll('[data-brand]').forEach(function (el) { if (S.brandName) el.textContent = S.brandName; });
  document.querySelectorAll('[data-city]').forEach(function (el) { if (S.city) el.textContent = S.city; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (S.brandName) document.title = S.brandName + ' — Jasa Undangan Digital';

  // Semua tombol WhatsApp: href dibuat dari nomor + pesan di atribut data-wa
  var num = String(S.whatsapp || '').replace(/\D/g, '');
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var msg = el.getAttribute('data-wa') || '';
    el.href = 'https://wa.me/' + num + (msg ? '?text=' + encodeURIComponent(msg) : '');
    el.target = '_blank';
    el.rel = 'noopener';
  });

  document.querySelectorAll('[data-ig]').forEach(function (el) {
    if (S.instagram) { el.href = 'https://instagram.com/' + S.instagram.replace(/^@/, ''); el.target = '_blank'; el.rel = 'noopener'; el.textContent = 'Instagram @' + S.instagram.replace(/^@/, ''); }
    else el.remove();
  });

  // Menu HP
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

  // Filter template
  var buttons = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('.tcard');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) { c.hidden = !(f === 'all' || c.getAttribute('data-cat') === f); });
    });
  });
})();
