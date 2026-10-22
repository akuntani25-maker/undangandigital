/* =========================================================
   Pustaka dekorasi SVG orisinal untuk mesin undangan.
   Semua gambar dibuat dari kode (tanpa file gambar luar).
   Warna mengikuti variabel CSS template: --fl-1, --fl-2, --fl-3, --leaf, --leaf-2, --gold.
   ========================================================= */
(function () {
  'use strict';

  /* Angka acak yang bisa diulang (agar posisi bunga konsisten) */
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- Bunga ---------- */
  function petalRing(n, rx, ry, dist, color, rot0, extra) {
    var s = '';
    for (var i = 0; i < n; i++) {
      s += '<ellipse cx="0" cy="' + f(-dist) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" transform="rotate(' + f(rot0 + i * 360 / n) + ')" style="fill:' + color + '"' + (extra || '') + '/>';
    }
    return s;
  }
  var FLOWER = {
    peony: function (r) {
      return petalRing(9, r * .42, r * .62, r * .42, 'var(--fl-1)', 0, ' opacity=".92"') +
        petalRing(7, r * .34, r * .5, r * .28, 'var(--fl-2)', 20) +
        petalRing(5, r * .24, r * .34, r * .14, 'var(--fl-1)', 8, ' opacity=".9"') +
        '<circle r="' + f(r * .16) + '" style="fill:var(--fl-3)"/>';
    },
    rose: function (r) {
      var s = petalRing(6, r * .5, r * .5, r * .42, 'var(--fl-2)', 0);
      for (var k = 0; k < 4; k++) {
        var rr = r * (.62 - k * .14);
        s += '<path d="M' + f(-rr) + ' 0 A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' + f(rr * .9) + ' ' + f(-rr * .3) + '" style="fill:none;stroke:var(--fl-1);stroke-width:' + f(r * .07) + '" transform="rotate(' + (k * 75) + ')" opacity=".75"/>';
      }
      return s + '<circle r="' + f(r * .14) + '" style="fill:var(--fl-1)"/>';
    },
    blossom: function (r) {
      return petalRing(5, r * .36, r * .5, r * .44, 'var(--fl-3)', 0) +
        '<circle r="' + f(r * .2) + '" style="fill:var(--fl-2)"/>' +
        '<circle r="' + f(r * .08) + '" style="fill:var(--gold)"/>';
    },
    daisy: function (r) {
      return petalRing(12, r * .14, r * .44, r * .5, 'var(--fl-3)', 0) +
        '<circle r="' + f(r * .24) + '" style="fill:var(--gold)"/>';
    },
    bud: function (r) {
      return '<path d="M0 ' + f(r * .6) + ' C' + f(-r * .6) + ' 0 ' + f(-r * .3) + ' ' + f(-r * .7) + ' 0 ' + f(-r * .8) + ' C' + f(r * .3) + ' ' + f(-r * .7) + ' ' + f(r * .6) + ' 0 0 ' + f(r * .6) + 'Z" style="fill:var(--fl-1)"/>' +
        '<path d="M0 ' + f(r * .6) + ' C' + f(-r * .4) + ' ' + f(r * .3) + ' ' + f(-r * .2) + ' 0 0 ' + f(-r * .2) + ' C' + f(r * .2) + ' 0 ' + f(r * .4) + ' ' + f(r * .3) + ' 0 ' + f(r * .6) + 'Z" style="fill:var(--leaf)"/>';
    },
    berry: function (r) {
      var s = '';
      for (var i = 0; i < 5; i++) s += '<circle cx="' + f(Math.cos(i * 1.3) * r * .4) + '" cy="' + f(Math.sin(i * 1.3) * r * .4) + '" r="' + f(r * .2) + '" style="fill:var(--fl-2)"/>';
      return s;
    }
  };
  function leaf(len, w, color) {
    return '<path d="M0 0 C' + f(w) + ' ' + f(-len * .3) + ' ' + f(w * .8) + ' ' + f(-len * .8) + ' 0 ' + f(-len) + ' C' + f(-w * .8) + ' ' + f(-len * .8) + ' ' + f(-w) + ' ' + f(-len * .3) + ' 0 0Z" style="fill:' + color + '"/>' +
      '<path d="M0 0 L0 ' + f(-len * .92) + '" style="stroke:rgba(255,255,255,.35);stroke-width:1;fill:none"/>';
  }
  function fern(len, color) {
    var s = '<path d="M0 0 Q' + f(len * .1) + ' ' + f(-len * .5) + ' 0 ' + f(-len) + '" style="fill:none;stroke:' + color + ';stroke-width:1.6"/>';
    for (var i = 1; i < 8; i++) {
      var y = -len * i / 8, l = len * .22 * (1 - i / 10);
      s += '<g transform="translate(0 ' + f(y) + ') rotate(55)">' + leaf(l, l * .28, color) + '</g>';
      s += '<g transform="translate(0 ' + f(y) + ') rotate(-55)">' + leaf(l, l * .28, color) + '</g>';
    }
    return s;
  }

  /* Rangkaian bunga di sudut kiri-bawah (dicerminkan lewat CSS untuk kanan) */
  function bouquet(seed, opts) {
    opts = opts || {};
    var R = rng(seed || 7), parts = [], i;
    var kinds = opts.kinds || ['peony', 'rose', 'blossom', 'daisy', 'bud'];
    // daun & pakis di belakang
    for (i = 0; i < 9; i++) {
      var a = -95 + R() * 120, len = 50 + R() * 60;
      parts.push('<g transform="translate(' + f(30 + R() * 90) + ' ' + f(200 + R() * 20) + ') rotate(' + f(a) + ')"><g class="lf" style="--d:' + i + '">' +
        (i % 3 === 0 ? fern(len * 1.3, 'var(--leaf-2)') : leaf(len, len * .3, i % 2 ? 'var(--leaf)' : 'var(--leaf-2)')) + '</g></g>');
    }
    // bunga
    var spots = opts.spots || [[70, 175, 46], [135, 195, 34], [30, 125, 30], [105, 120, 24], [175, 215, 22], [20, 200, 26], [150, 150, 16], [60, 80, 14]];
    spots.forEach(function (p, j) {
      var k = kinds[j % kinds.length];
      parts.push('<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + f(R() * 360) + ')"><g class="fl" style="--d:' + j + '">' + FLOWER[k](p[2]) + '</g></g>');
    });
    return '<svg class="bouquet-svg" viewBox="0 0 240 240" aria-hidden="true" focusable="false">' + parts.join('') + '</svg>';
  }

  /* Ranting sakura dari sudut kiri-atas */
  function branch(seed) {
    var R = rng(seed || 3);
    var s = '<path class="br-line" d="M-10 10 C40 30 70 30 110 60 S170 120 230 130" pathLength="1" style="fill:none;stroke:var(--branch);stroke-width:5;stroke-linecap:round"/>' +
      '<path class="br-line" d="M80 45 C95 20 120 12 140 8" pathLength="1" style="fill:none;stroke:var(--branch);stroke-width:3;stroke-linecap:round"/>' +
      '<path class="br-line" d="M150 100 C160 80 180 70 200 66" pathLength="1" style="fill:none;stroke:var(--branch);stroke-width:2.5;stroke-linecap:round"/>';
    var pts = [[40, 26], [75, 36], [110, 60], [138, 9], [125, 16], [160, 104], [198, 66], [185, 72], [228, 130], [205, 124], [95, 50], [60, 30]];
    pts.forEach(function (p, i) {
      s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + f(R() * 360) + ')"><g class="fl" style="--d:' + i + '">' + FLOWER.blossom(8 + R() * 8) + '</g></g>';
    });
    return '<svg class="branch-svg" viewBox="0 0 240 150" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  /* Kupu-kupu */
  function butterfly() {
    return '<svg class="bfly-svg" viewBox="-20 -16 40 32" aria-hidden="true" focusable="false">' +
      '<g class="wing wl"><path d="M0 0 C-6 -14 -20 -16 -18 -4 C-17 2 -8 3 0 0Z" style="fill:var(--fl-1)"/><path d="M0 0 C-8 4 -16 12 -9 14 C-4 15 -1 7 0 0Z" style="fill:var(--fl-2)"/></g>' +
      '<g class="wing wr"><path d="M0 0 C6 -14 20 -16 18 -4 C17 2 8 3 0 0Z" style="fill:var(--fl-1)"/><path d="M0 0 C8 4 16 12 9 14 C4 15 1 7 0 0Z" style="fill:var(--fl-2)"/></g>' +
      '<ellipse rx="1.4" ry="7" style="fill:var(--ink)"/></svg>';
  }

  /* Ornamen sudut (filigri) — kiri-atas, dicerminkan untuk sudut lain */
  function corner() {
    return '<svg class="corner-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false" style="fill:none;stroke:var(--gold);stroke-width:1.6;stroke-linecap:round">' +
      '<path pathLength="1" d="M6 114 V22 Q6 6 22 6 H114"/>' +
      '<path pathLength="1" d="M14 106 V30 Q14 14 30 14 H106" opacity=".6"/>' +
      '<path pathLength="1" d="M22 22 C40 24 52 36 50 52 C48 64 34 64 32 54 C30 46 38 42 42 46"/>' +
      '<path pathLength="1" d="M22 22 C24 40 36 52 52 50"/>' +
      '<path pathLength="1" d="M50 52 C64 50 76 40 92 40 C100 40 104 46 100 50 C96 54 90 50 92 46"/>' +
      '<path pathLength="1" d="M52 50 C50 64 40 76 40 92 C40 100 46 104 50 100 C54 96 50 90 46 92"/>' +
      '<path d="M22 22 l6 -10 l6 10 l-6 10z" style="fill:var(--gold);stroke:none"/>' +
      '<circle cx="62" cy="62" r="3" style="fill:var(--gold);stroke:none"/></svg>';
  }

  /* Mahkota ornamen di atas bingkai oval */
  function crest() {
    return '<svg class="crest-svg" viewBox="0 0 160 50" aria-hidden="true" focusable="false" style="fill:none;stroke:var(--gold);stroke-width:1.6;stroke-linecap:round">' +
      '<path pathLength="1" d="M80 46 C70 30 50 26 34 32 C22 37 18 28 26 24 C34 20 40 28 34 32"/>' +
      '<path pathLength="1" d="M80 46 C90 30 110 26 126 32 C138 37 142 28 134 24 C126 20 120 28 126 32"/>' +
      '<path pathLength="1" d="M80 46 V14"/><path d="M80 4 l7 10 l-7 10 l-7 -10z" style="fill:var(--gold);stroke:none"/>' +
      '<circle cx="60" cy="22" r="2.5" style="fill:var(--gold);stroke:none"/><circle cx="100" cy="22" r="2.5" style="fill:var(--gold);stroke:none"/></svg>';
  }

  /* Segel lilin dengan monogram */
  function seal(text, seed) {
    var R = rng(seed || 11), pts = [], n = 28;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, r = 44 + (R() - .5) * 7;
      pts.push(f(50 + Math.cos(a) * r) + ' ' + f(50 + Math.sin(a) * r));
    }
    return '<svg class="seal-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<polygon points="' + pts.join(' ') + '" style="fill:var(--seal);stroke:var(--seal);stroke-width:4;stroke-linejoin:round"/>' +
      '<circle cx="50" cy="50" r="32" style="fill:none;stroke:rgba(0,0,0,.25);stroke-width:3"/>' +
      '<circle cx="50" cy="50" r="27" style="fill:none;stroke:rgba(255,255,255,.18);stroke-width:1.5"/>' +
      '<text x="50" y="58" text-anchor="middle" style="font-family:var(--font-script);font-size:24px;fill:rgba(255,255,255,.75)">' + esc(text) + '</text>' +
      '<ellipse cx="38" cy="32" rx="12" ry="6" transform="rotate(-30 38 32)" style="fill:rgba(255,255,255,.18)"/></svg>';
  }

  /* Lanskap bukit berlapis (latar botanical) */
  function hills() {
    return '<svg class="hills-svg" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="h1" d="M0 90 C60 60 110 70 160 82 C220 96 260 56 320 60 C360 63 380 74 400 80 V160 H0Z" style="fill:var(--hill-1)"/>' +
      '<path class="h2" d="M0 112 C50 96 90 100 140 110 C200 122 250 96 300 98 C350 100 380 110 400 116 V160 H0Z" style="fill:var(--hill-2)"/>' +
      '<path class="h3" d="M0 134 C70 120 120 128 190 136 C250 142 320 122 400 132 V160 H0Z" style="fill:var(--hill-3)"/></svg>';
  }

  /* Gelombang laut (watercolor ocean) & awan */
  function waves() {
    return '<svg class="waves-svg" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="w1" d="M0 30 C40 20 60 40 100 30 S160 20 200 30 S260 40 300 30 S360 20 400 30 V80 H0Z" style="fill:var(--fl-3);opacity:.5"/>' +
      '<path class="w2" d="M0 46 C40 36 60 56 100 46 S160 36 200 46 S260 56 300 46 S360 36 400 46 V80 H0Z" style="fill:var(--fl-2);opacity:.55"/>' +
      '<path class="w3" d="M0 62 C40 52 60 72 100 62 S160 52 200 62 S260 72 300 62 S360 52 400 62 V80 H0Z" style="fill:var(--fl-1);opacity:.6"/></svg>';
  }

  /* Pita/selotip */
  function tape(rot) { var e = document.createElement('span'); e.className = 'tape'; e.style.setProperty('--r', rot + 'deg'); e.setAttribute('aria-hidden', 'true'); return e; }

  function node(cls, svg) {
    var e = document.createElement('div');
    e.className = cls; e.setAttribute('aria-hidden', 'true');
    if (svg) e.innerHTML = svg; /* SVG dibuat oleh file ini; teks dari data sudah di-escape */
    return e;
  }

  /* ---------- Dekorasi per gaya ---------- */
  var STYLE = {
    botanical: {
      section: function (i) {
        var out = [node('deco bq bq-l', bouquet(10 + i * 3)), node('deco bq bq-r', bouquet(20 + i * 5))];
        if (i % 3 === 1) out.push(node('deco bq bq-tl', bouquet(40 + i, { spots: [[70, 175, 30], [120, 200, 22], [30, 140, 20], [160, 215, 14]] })));
        return out;
      },
      cover: function () { return [node('deco bq bq-l big', bouquet(3)), node('deco bq bq-r big', bouquet(5)), node('deco bq bq-tl', bouquet(9)), node('deco bq bq-tr', bouquet(13)), node('deco hills', hills())]; },
      side: function () { return [node('deco hills', hills()), node('deco bq bq-l big', bouquet(31)), node('deco bq bq-r big', bouquet(37))]; },
      page: function () { return [node('deco hills fixed', hills())]; }
    },
    editorial: {
      section: function () { return []; },
      cover: function () { return []; },
      side: function () { return []; },
      page: function () { return [node('deco paper-grain')]; }
    },
    collage: {
      section: function (i, mono) {
        var out = [tape(i % 2 ? 6 : -8)];
        if (i % 3 === 0) out.push(node('deco seal-deco', seal(mono, 50 + i)));
        if (i % 3 === 1) out.push(node('deco pearls'));
        if (i % 3 === 2) out.push(node('deco bq bq-r small', bouquet(60 + i, { kinds: ['rose', 'peony', 'blossom', 'bud'] })));
        return out;
      },
      cover: function (i, mono) { return [node('deco env-seal', seal(mono, 2))]; },
      side: function (i, mono) { return [node('deco pearls'), node('deco bq bq-r big', bouquet(77, { kinds: ['rose', 'peony', 'blossom', 'bud'] })), node('deco seal-deco', seal(mono, 8))]; },
      page: function () { return [node('deco velvet-grain')]; }
    },
    royal: {
      section: function () { return [node('deco cn cn-tl', corner()), node('deco cn cn-tr', corner()), node('deco cn cn-bl', corner()), node('deco cn cn-br', corner())]; },
      cover: function () { return [node('deco valance'), node('deco pillar pl'), node('deco pillar pr'), node('deco cn cn-tl', corner()), node('deco cn cn-tr', corner()), node('deco cn cn-bl', corner()), node('deco cn cn-br', corner())]; },
      side: function () { return [node('deco valance'), node('deco pillar pl'), node('deco pillar pr')]; },
      page: function () { return []; }
    },
    watercolor: {
      section: function (i) {
        var out = [node('deco wash w-a'), node('deco wash w-b')];
        if (i % 2 === 0) out.push(node('deco branch br-tl', branch(5 + i)));
        else out.push(node('deco branch br-tr', branch(9 + i)));
        if (i % 3 === 1) out.push(node('deco bfly', butterfly()));
        return out;
      },
      cover: function () { return [node('deco wash w-a big'), node('deco wash w-b big'), node('deco wash w-c big'), node('deco branch br-tl', branch(1)), node('deco branch br-br', branch(2)), node('deco bfly b1', butterfly()), node('deco bfly b2', butterfly())]; },
      side: function () { return [node('deco wash w-a big'), node('deco wash w-c big'), node('deco branch br-tl', branch(4)), node('deco bfly b1', butterfly())]; },
      page: function () { return []; }
    }
  };

  window.DECOR = {
    style: function (name) { return STYLE[name] || null; },
    seal: seal, crest: crest, corner: corner, bouquet: bouquet, branch: branch, butterfly: butterfly, waves: waves,
    node: node, flower: FLOWER, leaf: leaf, rng: rng, esc: esc,
    register: function (name, def) { STYLE[name] = def; }
  };
})();
