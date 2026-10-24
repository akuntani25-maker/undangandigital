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
      var shot = el('img', { class: 'tshot', src: '/assets/img/thumbs/' + t.slug + '.webp?v=8', alt: 'Tampilan sampul template ' + t.name, loading: 'lazy', decoding: 'async', width: '520', height: '960' });
      shot.addEventListener('error', function () { this.parentNode.classList.remove('has-shot'); this.remove(); });
      prev.classList.add('has-shot'); prev.appendChild(shot);
      var fx = el('div', { class: 'fx' }, el('span', { text: 'Gaya ' + t.px }), el('span', { text: 'Buka: ' + t.fx }));
      var card = el('article', { class: 'tcard rv', 'data-cat': t.cat },
        prev,
        el('div', { class: 'tbody' },
          el('div', { class: 'top' }, el('h3', { text: t.name }), el('span', { class: 'chip', text: t.isNew ? 'Baru · ' + t.label : t.label })),
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

  /* ---------- Coverflow template (gaya galeri 3D) ----------
     Kartu tengah datar, kartu samping miring 3D dan bertumpuk di belakang.
     Bisa digeser (momentum + snap), scroll menyamping, keyboard, klik kartu samping. */
  var CF = (function () {
    var root = document.getElementById('cflow'), stage = document.getElementById('cf-stage');
    if (!root || !stage || !window.TEMPLATES) return null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var OPT = { turn: 55, depth: 0.5, centerSpacing: 0.66, spread: 0.3 };
    var list = [], items = [], pos = 0, vel = 0, target = 0, W = 240, raf = 0, active = -1;
    var $ = function (id) { return document.getElementById(id); };
    var nameEl = $('cf-name'), chipsEl = $('cf-chips'), iEl = $('cf-i'), nEl = $('cf-n'), demoEl = $('cf-demo'), pickEl = $('cf-pick'), prog = $('cf-prog');
    var demoUrl = function (t) { return '/templates/' + t.slug + '?to=Tamu+Undangan'; };

    function build(f) {
      list = window.TEMPLATES.filter(function (t) { return f === 'all' || t.cat === f; });
      stage.innerHTML = ''; items = [];
      list.forEach(function (t, i) {
        var it = el('a', { class: 'cf-item', href: demoUrl(t), target: '_blank', rel: 'noopener', 'aria-label': t.name + ' — ' + t.label, draggable: 'false', style: '--bg:' + t.bg });
        var img = el('img', { src: '/assets/img/thumbs/' + t.slug + '.webp?v=8', alt: '', draggable: 'false', decoding: 'async', loading: i < 6 ? 'eager' : 'lazy', width: '520', height: '960' });
        img.addEventListener('error', function () { this.remove(); it.classList.add('noimg'); it.appendChild(el('span', { class: 'cf-txt', style: '--fg:' + t.fg + ';--f:' + t.font, text: t.title })); });
        it.appendChild(img);
        if (t.isNew) it.appendChild(el('span', { class: 'cf-new', text: 'Baru' }));
        it.addEventListener('click', function (e) {
          if (moved) { e.preventDefault(); return; }
          if (i !== active) { e.preventDefault(); go(i); stopAuto(); }
        });
        stage.appendChild(it); items.push(it);
      });
      nEl.textContent = list.length;
      pos = target = 0; vel = 0; active = -1; measure(); render(); setActive(0);
    }
    function measure() { var it = items[0]; if (it) W = it.offsetWidth || W; }
    function render() {
      for (var i = 0; i < items.length; i++) {
        var d = i - pos, a = Math.abs(d), s = d < 0 ? -1 : 1, c = Math.min(a, 1);
        var x = (a <= 1 ? a * OPT.centerSpacing : OPT.centerSpacing + (a - 1) * OPT.spread) * W * s;
        var st = items[i].style;
        if (a > 6) { st.visibility = 'hidden'; continue; }
        st.visibility = 'visible';
        st.transform = 'translate3d(' + x.toFixed(1) + 'px,0,' + (-c * OPT.depth * W - Math.max(0, a - 1) * 18).toFixed(1) + 'px) rotateY(' + (-s * c * OPT.turn).toFixed(2) + 'deg)';
        st.zIndex = 100 - Math.round(a * 10);
        st.setProperty('--shade', (c * .38 + Math.max(0, a - 1) * .06).toFixed(3));
        st.opacity = a > 5 ? (6 - a).toFixed(2) : 1;
      }
      prog.style.width = (list.length > 1 ? (pos / (list.length - 1)) * 100 : 100) + '%';
      var r = Math.round(pos); if (r !== active) setActive(r);
    }
    function setActive(i) {
      i = Math.max(0, Math.min(list.length - 1, i)); active = i; var t = list[i]; if (!t) return;
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); it.setAttribute('tabindex', '-1'); });
      nameEl.textContent = t.name; iEl.textContent = i + 1;
      chipsEl.innerHTML = '';
      [ (t.isNew ? 'Baru · ' : '') + t.label, 'Gaya ' + t.px, 'Buka: ' + t.fx ].forEach(function (x, k) { chipsEl.appendChild(el('span', { class: k ? '' : 'main', text: x })); });
      demoEl.href = demoUrl(t); demoEl.setAttribute('aria-label', 'Lihat demo ' + t.name);
      pickEl.href = waLink('Halo, saya ingin pesan undangan template ' + t.name + '.');
      root.style.setProperty('--cf-tint', t.bg);
    }
    function clampT(v) { return Math.max(0, Math.min(list.length - 1, v)); }
    /* pegas (spring) menuju target */
    function loop() {
      var k = 170, damp = 2 * Math.sqrt(k) * 0.9, dt = 1 / 60;
      vel += (k * (target - pos) - damp * vel) * dt; pos += vel * dt;
      if (Math.abs(target - pos) < 0.0008 && Math.abs(vel) < 0.002) { pos = target; vel = 0; render(); raf = 0; return; }
      render(); raf = requestAnimationFrame(loop);
    }
    function kick() { if (reduce) { pos = target; vel = 0; render(); return; } if (!raf) raf = requestAnimationFrame(loop); }
    function go(i) { target = clampT(Math.round(i)); kick(); }

    /* geser (drag) dengan momentum */
    var down = false, moved = false, sx = 0, sy = 0, sp = 0, lastX = 0, lastT = 0, v = 0, axis = '';
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true; moved = false; axis = ''; sx = lastX = e.clientX; sy = e.clientY; sp = pos; lastT = performance.now(); v = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      stopAuto();
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!axis) { if (Math.abs(dx) > 6 || Math.abs(dy) > 6) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; else return; }
      if (axis === 'y') { down = false; target = clampT(Math.round(pos)); kick(); return; }
      moved = true; root.classList.add('dragging');
      var p = sp - dx / (W * 0.62);
      if (p < 0) p = p * 0.35; if (p > list.length - 1) p = list.length - 1 + (p - list.length + 1) * 0.35; /* tahanan di ujung */
      pos = p; render();
      var now = performance.now(), dtm = Math.max(1, now - lastT);
      v = 0.8 * ((e.clientX - lastX) / dtm) + 0.2 * v; lastX = e.clientX; lastT = now;
    });
    function up() {
      if (!down) return; down = false; root.classList.remove('dragging');
      if (!moved) return;
      var fling = -v * 260 / (W * 0.62); /* momentum */
      target = clampT(Math.round(pos + fling)); vel = -v * 1000 / (W * 0.62) * 0.5; kick();
      setTimeout(function () { moved = false; }, 0);
    }
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* scroll menyamping (trackpad / shift+scroll) */
    var wheelAcc = 0, wheelT = 0;
    stage.addEventListener('wheel', function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return;
      e.preventDefault(); stopAuto();
      wheelAcc += dx; var now = performance.now();
      if (Math.abs(wheelAcc) > 40 && now - wheelT > 140) { go(target + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelT = now; }
    }, { passive: false });

    /* keyboard */
    stage.addEventListener('keydown', function (e) {
      var m = { ArrowRight: 1, ArrowLeft: -1, PageDown: 3, PageUp: -3 }[e.key];
      if (m) { e.preventDefault(); stopAuto(); go(target + m); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(list.length - 1); }
      else if (e.key === 'Enter') { var a = items[active]; if (a) window.open(a.href, '_blank', 'noopener'); }
    });
    root.querySelector('.cf-nav.prev').addEventListener('click', function () { stopAuto(); go(target - 1); });
    root.querySelector('.cf-nav.next').addEventListener('click', function () { stopAuto(); go(target + 1); });
    window.addEventListener('resize', function () { measure(); render(); });

    /* putar otomatis pelan sampai pengunjung berinteraksi */
    var auto = 0, autoOn = !reduce, visible = false;
    function stopAuto() { autoOn = false; clearInterval(auto); auto = 0; }
    function startAuto() { if (!autoOn || auto) return; auto = setInterval(function () { if (!visible || document.hidden) return; go(target >= list.length - 1 ? 0 : target + 1); }, 3200); }
    root.addEventListener('mouseenter', function () { clearInterval(auto); auto = 0; });
    root.addEventListener('mouseleave', startAuto);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) startAuto(); }, { threshold: .4 }).observe(stage);

    build('all');
    window.addEventListener('load', function () { measure(); render(); });
    return { filter: function (f) { build(f); }, stopAuto: stopAuto };
  })();

  /* Ganti tampilan coverflow / grid */
  var views = document.querySelectorAll('[data-view]');
  views.forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view');
      views.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var flow = document.getElementById('cflow'); if (flow) flow.hidden = v !== 'flow';
      if (grid) grid.hidden = v !== 'grid';
      if (v === 'grid' && CF) CF.stopAuto();
      if (v === 'grid') grid.querySelectorAll('.tcard').forEach(function (c) { c.classList.add('in'); });
    });
  });

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
      if (CF) CF.filter(f);
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
