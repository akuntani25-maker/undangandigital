/* =========================================================
   Gaya "canvas" — adegan ilustrasi penuh yang menyambung, bertekstur kanvas,
   dengan animasi loop (kamera bergerak, awan berarak, pohon & ondel-ondel bergoyang,
   lampion berayun, api tugu berkelip, burung & kupu-kupu terbang, air mancur mengalir).
   Semua ilustrasi digambar dengan kode (SVG orisinal). Warna lewat variabel CSS --cv-*.
   Butuh decor.js dimuat lebih dulu.
   ========================================================= */
(function () {
  'use strict';
  var DC = window.DECOR;
  if (!DC) return;
  var R = DC.rng(42);
  function f(n) { return Math.round(n * 10) / 10; }
  function c(v) { return 'style="fill:var(' + v + ')"'; }

  /* ---------- Unsur-unsur ---------- */
  function mountains() {
    return '<path ' + c('--cv-mtn-1') + ' d="M-220 430 Q-160 360 -110 375 Q-60 300 0 330 Q50 280 110 325 Q160 270 230 318 Q290 285 340 330 Q400 275 460 320 Q520 290 560 335 Q600 315 620 340 L620 480 L-220 480Z"/>' +
      '<path ' + c('--cv-mtn-1') + ' opacity=".55" d="M-220 400 Q-120 300 -40 340 Q30 250 120 300 Q200 240 270 300 Q360 250 430 300 Q520 245 620 310 L620 440 L-220 440Z"/>' +
      '<path ' + c('--cv-mtn-2') + ' d="M-220 455 Q-110 395 0 435 Q100 385 200 428 Q300 388 400 432 Q500 398 620 444 L620 490 L-220 490Z"/>' +
      '<path style="fill:none;stroke:rgba(255,255,255,.35);stroke-width:2" d="M-60 340 Q-20 360 10 345 M100 330 Q130 345 160 335 M300 335 Q330 350 360 338"/>';
  }

  function tugu(cx, base, top) {
    return '<g class="tugu">' +
      '<rect x="' + (cx - 40) + '" y="' + (base - 14) + '" width="80" height="14" ' + c('--cv-tugu-d') + '/>' +
      '<rect x="' + (cx - 28) + '" y="' + (base - 26) + '" width="56" height="12" ' + c('--cv-tugu') + '/>' +
      '<polygon points="' + (cx - 9) + ',' + (base - 26) + ' ' + (cx + 9) + ',' + (base - 26) + ' ' + (cx + 5) + ',' + (top + 30) + ' ' + (cx - 5) + ',' + (top + 30) + '" ' + c('--cv-tugu') + '/>' +
      '<polygon points="' + cx + ',' + (base - 26) + ' ' + (cx + 9) + ',' + (base - 26) + ' ' + (cx + 5) + ',' + (top + 30) + ' ' + cx + ',' + (top + 30) + '" ' + c('--cv-tugu-d') + ' opacity=".55"/>' +
      '<polygon points="' + (cx - 16) + ',' + (top + 32) + ' ' + (cx + 16) + ',' + (top + 32) + ' ' + (cx + 10) + ',' + (top + 22) + ' ' + (cx - 10) + ',' + (top + 22) + '" ' + c('--cv-tugu-d') + '/>' +
      '<g class="flame"><path ' + c('--cv-flame') + ' d="M' + cx + ' ' + (top + 23) + ' C' + (cx - 11) + ' ' + (top + 10) + ' ' + (cx - 6) + ' ' + (top - 6) + ' ' + cx + ' ' + (top - 18) + ' C' + (cx + 6) + ' ' + (top - 6) + ' ' + (cx + 11) + ' ' + (top + 10) + ' ' + cx + ' ' + (top + 23) + 'Z"/>' +
      '<path style="fill:#FFF3C4" d="M' + cx + ' ' + (top + 20) + ' C' + (cx - 5) + ' ' + (top + 12) + ' ' + (cx - 3) + ' ' + (top + 2) + ' ' + cx + ' ' + (top - 6) + ' C' + (cx + 3) + ' ' + (top + 2) + ' ' + (cx + 5) + ' ' + (top + 12) + ' ' + cx + ' ' + (top + 20) + 'Z"/></g></g>';
  }

  function cypress(x, base, h, w) {
    return '<ellipse cx="' + x + '" cy="' + f(base - h / 2) + '" rx="' + w + '" ry="' + f(h / 2) + '" ' + c('--cv-cypress') + '/>' +
      '<ellipse cx="' + f(x - w * .3) + '" cy="' + f(base - h * .55) + '" rx="' + f(w * .4) + '" ry="' + f(h * .4) + '" ' + c('--cv-tree-1') + ' opacity=".6"/>';
  }

  function tree(x, base, s, d) {
    var parts = [[0, -150, 52, 1], [-42, -118, 42, 1], [42, -116, 44, 1], [-24, -178, 40, 1], [26, -182, 38, 1], [0, -208, 32, 1], [-60, -88, 30, 1], [60, -86, 32, 1]];
    var g = '<path ' + c('--cv-trunk') + ' d="M' + f(x - 7 * s) + ' ' + base + ' Q' + f(x - 4 * s) + ' ' + f(base - 70 * s) + ' ' + f(x - 18 * s) + ' ' + f(base - 110 * s) + ' L' + f(x - 12 * s) + ' ' + f(base - 112 * s) + ' Q' + x + ' ' + f(base - 80 * s) + ' ' + f(x + 2 * s) + ' ' + f(base - 120 * s) + ' L' + f(x + 8 * s) + ' ' + f(base - 118 * s) + ' Q' + f(x + 6 * s) + ' ' + f(base - 70 * s) + ' ' + f(x + 8 * s) + ' ' + base + 'Z"/>';
    parts.forEach(function (p) { g += '<circle cx="' + f(x + p[0] * s + 4) + '" cy="' + f(base + p[1] * s + 6) + '" r="' + f(p[2] * s) + '" ' + c('--cv-tree-1') + '/>'; });
    parts.forEach(function (p) { g += '<circle cx="' + f(x + p[0] * s) + '" cy="' + f(base + p[1] * s) + '" r="' + f(p[2] * s * .9) + '" ' + c('--cv-tree-2') + '/>'; });
    parts.forEach(function (p, i) { if (i % 2 === 0) g += '<circle cx="' + f(x + p[0] * s - p[2] * s * .35) + '" cy="' + f(base + p[1] * s - p[2] * s * .35) + '" r="' + f(p[2] * s * .42) + '" ' + c('--cv-tree-3') + '/>'; });
    for (var k = 0; k < 10; k++) g += '<circle cx="' + f(x + (R() - .5) * 120 * s) + '" cy="' + f(base - (80 + R() * 130) * s) + '" r="' + f(2 + R() * 3) + '" style="fill:#FFFBE6" opacity=".7"/>';
    return '<g class="tree" style="--d:' + (d || 0) + 's">' + g + '</g>';
  }

  function lantern(x, y, d) {
    return '<g class="lantern" style="--d:' + d + 's"><path d="M' + x + ' ' + y + ' V' + (y + 8) + '" style="stroke:var(--cv-trim);stroke-width:1.2"/>' +
      '<rect x="' + (x - 4) + '" y="' + (y + 7) + '" width="8" height="3" ' + c('--cv-gold') + '/>' +
      '<ellipse cx="' + x + '" cy="' + (y + 17) + '" rx="6" ry="8" ' + c('--cv-lantern') + '/>' +
      '<ellipse cx="' + (x - 2) + '" cy="' + (y + 15) + '" rx="2" ry="4" style="fill:#FFE7A6" opacity=".8"/>' +
      '<rect x="' + (x - 3) + '" y="' + (y + 24) + '" width="6" height="3" ' + c('--cv-gold') + '/><path d="M' + x + ' ' + (y + 27) + ' v6" style="stroke:var(--cv-lantern);stroke-width:1.4"/></g>';
  }

  function house(cx, base, s) {
    s = s || 1;
    var W = 150 * s, g = '';
    // atap bertingkat
    g += '<polygon points="' + f(cx - 48 * s) + ',' + f(base - 128 * s) + ' ' + f(cx + 48 * s) + ',' + f(base - 128 * s) + ' ' + f(cx + 76 * s) + ',' + f(base - 100 * s) + ' ' + f(cx - 76 * s) + ',' + f(base - 100 * s) + '" ' + c('--cv-roof-d') + '/>';
    g += '<polygon points="' + f(cx - 108 * s) + ',' + f(base - 100 * s) + ' ' + f(cx + 108 * s) + ',' + f(base - 100 * s) + ' ' + f(cx + W) + ',' + f(base - 60 * s) + ' ' + f(cx - W) + ',' + f(base - 60 * s) + '" ' + c('--cv-roof') + '/>';
    for (var t = -5; t <= 5; t++) g += '<path d="M' + f(cx + t * 19 * s) + ' ' + f(base - 100 * s) + ' L' + f(cx + t * 26.5 * s) + ' ' + f(base - 60 * s) + '" style="stroke:var(--cv-roof-d);stroke-width:' + f(1.2 * s) + ';opacity:.6"/>';
    // lis "gigi balang"
    var pts = [], step = 9 * s;
    for (var x = cx - W; x <= cx + W + .1; x += step) { pts.push(f(x) + ',' + f(base - 60 * s)); pts.push(f(x + step / 2) + ',' + f(base - 50 * s)); }
    pts.push(f(cx + W) + ',' + f(base - 60 * s));
    g += '<rect x="' + f(cx - W) + '" y="' + f(base - 63 * s) + '" width="' + f(W * 2) + '" height="' + f(4 * s) + '" ' + c('--cv-trim') + '/>';
    g += '<polyline points="' + pts.join(' ') + '" ' + c('--cv-trim') + '/>';
    // dinding, tiang, pintu, jendela
    g += '<rect x="' + f(cx - 122 * s) + '" y="' + f(base - 52 * s) + '" width="' + f(244 * s) + '" height="' + f(52 * s) + '" ' + c('--cv-wall') + '/>';
    [-128, -64, 64, 128].forEach(function (px) { g += '<rect x="' + f(cx + px * s - 3 * s) + '" y="' + f(base - 56 * s) + '" width="' + f(6 * s) + '" height="' + f(56 * s) + '" style="fill:#FFF8E6"/>'; });
    g += '<rect x="' + f(cx - 15 * s) + '" y="' + f(base - 44 * s) + '" width="' + f(30 * s) + '" height="' + f(44 * s) + '" ' + c('--cv-door') + '/>';
    g += '<path d="M' + cx + ' ' + f(base - 44 * s) + ' V' + base + '" style="stroke:var(--cv-gold);stroke-width:' + f(1.2 * s) + '"/>';
    [-100, -52, 32, 80].forEach(function (wx) {
      g += '<rect x="' + f(cx + wx * s) + '" y="' + f(base - 42 * s) + '" width="' + f(20 * s) + '" height="' + f(24 * s) + '" style="fill:var(--cv-door);stroke:#FFF8E6;stroke-width:' + f(2 * s) + '"/>';
      g += '<path d="M' + f(cx + wx * s + 10 * s) + ' ' + f(base - 42 * s) + ' v' + f(24 * s) + ' M' + f(cx + wx * s) + ' ' + f(base - 30 * s) + ' h' + f(20 * s) + '" style="stroke:#FFF8E6;stroke-width:' + f(1.2 * s) + '"/>';
    });
    g += '<rect x="' + f(cx - 132 * s) + '" y="' + f(base - 4 * s) + '" width="' + f(264 * s) + '" height="' + f(7 * s) + '" ' + c('--cv-path') + '/>';
    // lampion di teritis
    [-110, -40, 40, 110].forEach(function (lx, i) { g += lantern(f(cx + lx * s), f(base - 52 * s), i * .4); });
    return '<g class="house">' + g + '</g>';
  }

  /* Ondel-ondel (gaya flat, orisinal). g = 'm' (merah) / 'f' (putih) */
  function ondel(g) {
    var m = g === 'm', s = '';
    var face = m ? '--on-face-m' : '--on-face-f', robe = m ? '--on-robe-m' : '--on-robe-f', sash = m ? '--on-sash-m' : '--on-sash-f';
    // hiasan kepala "kembang kelapa"
    var cols = ['--on-gold', '--on-sash-m', '--on-robe-m'];
    s += '<g class="kembang">';
    for (var k = -6; k <= 6; k++) {
      var a = k * 13 * Math.PI / 180, L = 42 + (k % 2 ? 6 : 0);
      var x2 = 60 + Math.sin(a) * L, y2 = 46 - Math.cos(a) * L;
      s += '<path d="M60 46 L' + f(x2) + ' ' + f(y2) + '" style="stroke:var(--on-gold);stroke-width:1.4"/><circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="3.4" ' + c(cols[(k + 6) % 3]) + '/>';
    }
    s += '</g>';
    s += '<ellipse cx="60" cy="70" rx="35" ry="31" ' + c('--on-hair') + '/>';
    s += '<path d="M28 52 Q60 30 92 52 L88 60 Q60 44 32 60Z" ' + c('--on-gold') + '/>';
    s += '<ellipse cx="60" cy="80" rx="27" ry="32" ' + c(face) + '/>';
    if (m) {
      s += '<path d="M40 64 Q49 58 56 64" style="fill:none;stroke:#1E1A17;stroke-width:3.4;stroke-linecap:round"/><path d="M64 64 Q71 58 80 64" style="fill:none;stroke:#1E1A17;stroke-width:3.4;stroke-linecap:round"/>' +
        '<circle cx="49" cy="73" r="6" style="fill:#FFF"/><circle cx="71" cy="73" r="6" style="fill:#FFF"/><circle cx="50" cy="74" r="2.8" style="fill:#1E1A17"/><circle cx="70" cy="74" r="2.8" style="fill:#1E1A17"/>' +
        '<path d="M57 78 Q60 88 63 78" style="fill:none;stroke:rgba(0,0,0,.35);stroke-width:2"/>' +
        '<path d="M40 94 Q48 86 60 91 Q72 86 80 94 Q74 96 70 92 Q64 96 60 95 Q56 96 50 92 Q46 96 40 94Z" style="fill:#1E1A17"/>' +
        '<path d="M52 101 Q60 105 68 101" style="fill:none;stroke:#FFE3D6;stroke-width:2;stroke-linecap:round"/>';
    } else {
      s += '<path d="M42 66 Q49 62 56 66" style="fill:none;stroke:#1E1A17;stroke-width:1.6;stroke-linecap:round"/><path d="M64 66 Q71 62 78 66" style="fill:none;stroke:#1E1A17;stroke-width:1.6;stroke-linecap:round"/>' +
        '<path d="M43 74 Q49 69 55 74 Q49 77 43 74Z" style="fill:#1E1A17"/><path d="M65 74 Q71 69 77 74 Q71 77 65 74Z" style="fill:#1E1A17"/>' +
        '<circle cx="45" cy="86" r="5" style="fill:#F2A2A8" opacity=".7"/><circle cx="75" cy="86" r="5" style="fill:#F2A2A8" opacity=".7"/>' +
        '<path d="M53 96 Q60 92 67 96 Q60 101 53 96Z" style="fill:#C62E3B"/><circle cx="60" cy="58" r="2.2" style="fill:#C62E3B"/>' +
        '<circle cx="32" cy="88" r="3" ' + c('--on-gold') + '/><circle cx="88" cy="88" r="3" ' + c('--on-gold') + '/>';
    }
    // badan, selendang, ikat pinggang, rumbai
    s += '<path d="M42 108 Q60 116 78 108 L80 118 Q60 124 40 118Z" ' + c('--on-gold') + '/>';
    s += '<path d="M30 116 Q60 108 90 116 L106 236 Q60 248 14 236Z" ' + c(robe) + '/>';
    s += '<path d="M30 116 Q60 108 90 116 L92 130 Q60 122 28 130Z" style="fill:rgba(0,0,0,.12)"/>';
    s += '<path d="M34 118 L52 118 L96 214 L80 222Z" ' + c(sash) + '/>';
    for (var i = 0; i < 9; i++) s += '<circle cx="' + f(46 + i * 5.4) + '" cy="' + f(126 + i * 10.6) + '" r="1.8" style="fill:#FFF5D6" opacity=".9"/>';
    s += '<rect x="22" y="168" width="76" height="12" ' + c(sash) + '/>';
    for (var j = 0; j < 7; j++) s += '<path d="M' + (27 + j * 11) + ' 170 l4 4 l-4 4 l-4 -4z" ' + c('--on-gold') + '/>';
    s += '<path d="M20 196 Q60 206 100 196" style="fill:none;stroke:rgba(255,255,255,.35);stroke-width:2"/>';
    for (var r = 0; r < 22; r++) s += '<path d="M' + f(18 + r * 4) + ' ' + f(236 + Math.sin(r) * 1.5) + ' v20" style="stroke:var(--on-fringe);stroke-width:2.2;stroke-linecap:round"/>';
    return s;
  }
  function ondelAt(g, x, base, s, d) {
    return '<g transform="translate(' + f(x - 60 * s) + ' ' + f(base - 258 * s) + ') scale(' + s + ')"><g class="ondel" style="--d:' + d + 's">' + ondel(g) + '</g></g>';
  }

  function fountain(cx, base) {
    return '<g class="fountain"><ellipse cx="' + cx + '" cy="' + base + '" rx="46" ry="10" ' + c('--cv-tugu-d') + '/><ellipse cx="' + cx + '" cy="' + (base - 3) + '" rx="40" ry="7" ' + c('--cv-water') + '/>' +
      '<rect x="' + (cx - 5) + '" y="' + (base - 34) + '" width="10" height="32" ' + c('--cv-tugu') + '/><ellipse cx="' + cx + '" cy="' + (base - 34) + '" rx="18" ry="5" ' + c('--cv-tugu-d') + '/>' +
      '<path class="jet" pathLength="1" d="M' + cx + ' ' + (base - 36) + ' Q' + (cx - 20) + ' ' + (base - 70) + ' ' + (cx - 36) + ' ' + (base - 6) + '"/>' +
      '<path class="jet" pathLength="1" d="M' + cx + ' ' + (base - 36) + ' Q' + (cx + 20) + ' ' + (base - 70) + ' ' + (cx + 36) + ' ' + (base - 6) + '" style="animation-delay:-.6s"/>' +
      '<path class="jet" pathLength="1" d="M' + cx + ' ' + (base - 36) + ' V' + (base - 62) + '" style="animation-delay:-.3s"/></g>';
  }

  function flowerRow(x0, x1, y, rmin, rmax, seed) {
    var rr = DC.rng(seed || 5), kinds = ['blossom', 'daisy', 'peony', 'rose', 'blossom'], s = '';
    for (var x = x0; x <= x1; x += 14 + rr() * 12) {
      s += '<g transform="translate(' + f(x) + ' ' + f(y + (rr() - .5) * 12) + ') rotate(' + f(rr() * 360) + ')">' + DC.flower[kinds[Math.floor(rr() * kinds.length)]](rmin + rr() * (rmax - rmin)) + '</g>';
    }
    return s;
  }

  function nested(svg, x, y, w, h, flip) {
    if (flip) return '<g transform="translate(' + (x + w) + ' ' + y + ') scale(-1 1)">' + svg.replace('<svg ', '<svg x="0" y="0" width="' + w + '" height="' + h + '" ') + '</g>';
    return svg.replace('<svg ', '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ');
  }

  /* ---------- Adegan ---------- */
  /* Adegan utama: lebar -200..600 agar bagus di HP (tengah) & desktop (penuh) */
  function worldScene(opts) {
    opts = opts || {};
    var s = '<g transform="matrix(1.5 0 0 1 -100 0)">' + mountains() + '</g>';
    s += tugu(200, 458, 168);
    [-360, -310, -250, -170, -120, -60, 30, 74, 326, 372, 462, 520, 572, 650, 700, 760].forEach(function (x, i) { s += cypress(x, 476, 96 + (i % 3) * 24, 13 + (i % 2) * 3); });
    s += '<rect x="-420" y="462" width="1240" height="26" rx="13" ' + c('--cv-hedge') + '/>';
    s += tree(-330, 556, 1.1, 2.4) + tree(730, 556, 1.1, .9);
    s += tree(-150, 560, 1.15, 0) + tree(560, 560, 1.15, 1.4);
    s += house(200, 528, 1);
    s += tree(-10, 600, 1.35, .6) + tree(410, 600, 1.35, 2);
    s += '<path ' + c('--cv-lawn') + ' d="M-420 522 Q200 498 820 522 L820 700 L-420 700Z"/>';
    s += '<path ' + c('--cv-path') + ' d="M184 528 L216 528 L300 700 L100 700Z" opacity=".85"/>';
    s += '<path ' + c('--cv-lawn-2') + ' opacity=".7" d="M-420 562 Q0 545 120 560 L60 700 L-420 700Z M820 562 Q400 545 280 560 L340 700 L820 700Z"/>';
    s += flowerRow(-400, 90, 556, 5, 9, 11) + flowerRow(310, 800, 556, 5, 9, 17);
    if (opts.fountain) s += fountain(200, 600);
    if (opts.couple !== false) s += ondelAt('m', 150, 690, .92, 0) + ondelAt('f', 252, 690, .92, .8);
    s += nested(DC.bouquet(7, { kinds: ['peony', 'rose', 'blossom', 'daisy', 'bud'] }), -110, 470, 260, 260) +
      nested(DC.bouquet(9, { kinds: ['rose', 'peony', 'daisy', 'blossom', 'bud'] }), 250, 470, 260, 260, true) +
      nested(DC.bouquet(13), -420, 480, 240, 240) + nested(DC.bouquet(15), 580, 480, 240, 240, true);
    return '<svg class="world" viewBox="-400 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  function cloudsSvg() {
    var cl = function (x, y, k) { return '<g class="cloud" style="--d:' + (k * 3) + 's"><path style="fill:#FFFFFF" opacity=".92" d="M' + x + ' ' + y + ' q12 -22 34 -12 q14 -20 38 -6 q22 -10 32 10 q20 2 16 18 h-128 q-10 -6 8 -10z"/><path style="fill:var(--cv-sky-3)" opacity=".35" d="M' + (x - 6) + ' ' + (y + 10) + ' h126 q-4 6 -14 8 h-104 q-10 -2 -8 -8z"/></g>'; };
    return '<svg class="clouds" viewBox="-400 0 1200 260" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' +
      cl(-340, 100, 5) + cl(-120, 120, 0) + cl(40, 80, 1) + cl(250, 130, 2) + cl(420, 90, 3) + cl(130, 175, 4) + cl(620, 120, 6) + '</svg>';
  }

  function birdsSvg() {
    var b = function (x, y, s, d) { return '<g class="bird" style="--d:' + d + 's"><path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" style="fill:none;stroke:var(--cv-bird);stroke-width:2.2;stroke-linecap:round" d="M-10 0 Q-5 -6 0 0 Q5 -6 10 0"/></g>'; };
    return '<svg class="birds" viewBox="0 0 400 200" aria-hidden="true" focusable="false">' + b(40, 60, 1, 0) + b(70, 80, .8, -2) + b(20, 95, .7, -5) + b(90, 50, .9, -8) + '</svg>';
  }

  function garland(seed) {
    var rr = DC.rng(seed || 3), s = '', kinds = ['peony', 'rose', 'blossom', 'peony', 'daisy', 'rose'];
    for (var i = 0; i < 26; i++) s += '<g transform="translate(' + f(-10 + i * 17 + rr() * 8) + ' ' + f(18 + rr() * 22) + ') rotate(' + f(-60 - rr() * 60 + (i % 2) * 120) + ')">' + DC.leaf(28 + rr() * 14, 9, i % 2 ? 'var(--leaf)' : 'var(--leaf-2)') + '</g>';
    for (var j = 0; j < 15; j++) s += '<g transform="translate(' + f(4 + j * 28 + rr() * 6) + ' ' + f(26 + rr() * 16) + ') rotate(' + f(rr() * 360) + ')"><g class="fl" style="--d:' + j + '">' + DC.flower[kinds[j % kinds.length]](12 + rr() * 10) + '</g></g>';
    return '<svg class="garland-svg" viewBox="0 0 420 90" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  function vines(seed) {
    var rr = DC.rng(seed || 9), s = '<path d="M20 0 C30 80 6 160 22 300" style="fill:none;stroke:var(--leaf-2);stroke-width:2.2"/>';
    for (var k = 0; k < 6; k++) {
      var y0 = 20 + k * 46, x0 = 22 + Math.sin(k) * 6;
      s += '<g class="wis" style="--d:' + (k * .5) + 's">';
      for (var n = 0; n < 9; n++) s += '<circle cx="' + f(x0 + 8 + (rr() - .5) * 8) + '" cy="' + f(y0 + n * 5) + '" r="' + f(5.5 - n * .45) + '" ' + c(n % 3 ? '--cv-wisteria' : '--cv-wisteria-2') + '/>';
      s += '</g>';
      s += '<g transform="translate(' + f(x0) + ' ' + f(y0) + ') rotate(' + f(-130 + rr() * 30) + ')">' + DC.leaf(18, 6, 'var(--leaf)') + '</g>';
    }
    return '<svg class="vines-svg" viewBox="0 0 60 300" preserveAspectRatio="xMinYMin meet" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  function lanternString() {
    var s = '<path d="M-10 6 Q100 40 210 10 Q320 40 430 6" style="fill:none;stroke:var(--cv-trim);stroke-width:1.4"/>';
    [[30, 14], [90, 26], [150, 22], [270, 22], [330, 26], [390, 14]].forEach(function (p, i) { s += lantern(p[0], p[1], i * .35); });
    return '<svg class="lanterns-svg" viewBox="0 0 420 70" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  function gardenScene(withCouple) {
    var s = '';
    [-150, -100, -40, 440, 500, 560].forEach(function (x, i) { s += cypress(x, 160, 90 + (i % 3) * 20, 12); });
    s += tree(-130, 210, .8, .4) + tree(530, 210, .8, 1.1);
    s += '<rect x="-220" y="150" width="840" height="20" rx="10" ' + c('--cv-hedge') + '/>';
    s += house(200, 190, .62);
    s += '<path ' + c('--cv-lawn') + ' d="M-220 186 Q200 172 620 186 L620 330 L-220 330Z"/>';
    s += '<path ' + c('--cv-path') + ' opacity=".85" d="M188 190 L212 190 L270 330 L130 330Z"/>';
    s += fountain(200, 258);
    s += flowerRow(-200, 120, 230, 5, 9, 23) + flowerRow(280, 600, 230, 5, 9, 29);
    if (withCouple) s += ondelAt('m', 70, 326, .52, 0) + ondelAt('f', 330, 326, .52, .8);
    s += nested(DC.bouquet(21), -130, 150, 200, 200) + nested(DC.bouquet(25), 330, 150, 200, 200, true);
    return '<svg class="garden-svg" viewBox="-200 0 800 330" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  function el(cls, html) { var e = document.createElement('div'); e.className = cls; e.setAttribute('aria-hidden', 'true'); e.innerHTML = html || ''; return e; }

  function bigScene(opts) {
    var scene = el('scene' + (opts && opts.cls ? ' ' + opts.cls : ''));
    var cam = el('cam');
    cam.appendChild(el('sky'));
    cam.appendChild(el('sun'));
    cam.insertAdjacentHTML('beforeend', cloudsSvg() + worldScene(opts) + birdsSvg());
    scene.appendChild(cam);
    scene.appendChild(el('canvas-tex'));
    return scene;
  }

  /* ---------- Daftarkan gaya ---------- */
  DC.register('canvas', {
    section: function (i, mono, id) {
      var out = [el('canvas-tex')];
      if (id === 'home') return [bigScene({ cls: 'scene-hero' })];
      if (id === 'penutup') { out.push(el('garden', gardenScene(true))); out.push(el('birds-wrap', birdsSvg())); }
      else if (id === 'tuan-rumah') { out.push(el('garden', gardenScene(false))); }
      if (id === 'acara') out.push(el('lanterns', lanternString()));
      else out.push(el('garland', garland(i * 7 + 3)));
      if (id !== 'acara') { out.push(el('vines vl', vines(i + 4))); out.push(el('vines vr', vines(i + 9))); }
      if (i % 2 === 1) out.push(el('bfly c-bfly', DC.butterfly()));
      return out;
    },
    cover: function () { return [bigScene({ cls: 'scene-cover', couple: true })]; },
    side: function () { return [bigScene({ cls: 'scene-side', fountain: false })]; },
    page: function () { return []; }
  });
})();
