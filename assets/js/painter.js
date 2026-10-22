/* =========================================================
   MESIN LUKIS — gaya "painted" (lukisan di atas kanvas).
   Setiap lapisan adegan digambar dari ratusan sapuan kuas (SVG), diberi filter
   tepi-kuas + tekstur cat (impasto), lalu dirender SEKALI sebagai gambar (blob URL)
   sehingga animasi tetap ringan. Adegan per adat ada di adat.js.
   ========================================================= */
(function () {
  'use strict';
  var DC = window.DECOR;
  if (!DC) return;

  /* ---------- Utilitas ---------- */
  function f(n) { return Math.round(n * 10) / 10; }
  function f2(n) { return Math.round(n * 100) / 100; }
  function rng(seed) { return DC.rng(seed); }
  function hx(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function toHex(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var A = hx(a), B = hx(b); return toHex(A.map(function (v, i) { return v + (B[i] - v) * t; })); }
  function lighten(c, t) { return mix(c, '#ffffff', t); }
  function darken(c, t) { return mix(c, '#000000', t); }
  function pick(R, arr) { return arr[Math.floor(R() * arr.length) % arr.length]; }
  function tones(c) { return [darken(c, .32), darken(c, .14), c, lighten(c, .2), lighten(c, .42)]; }

  /* ---------- Bentuk dasar ---------- */
  function E(x, y, rx, ry, rot, fill, op) {
    return '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(Math.max(.3, rx)) + '" ry="' + f(Math.max(.3, ry)) + '"' +
      (rot ? ' transform="rotate(' + f(rot) + ' ' + f(x) + ' ' + f(y) + ')"' : '') + ' fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + f2(op) + '"' : '') + '/>';
  }
  function P(pts) { return pts.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' '); }
  function poly(pts, fill, extra) { return '<polygon points="' + P(pts) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function line(d, stroke, w, op, cap) { return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + f(w) + '"' + (op != null && op < 1 ? ' stroke-opacity="' + f2(op) + '"' : '') + ' stroke-linecap="' + (cap || 'round') + '" stroke-linejoin="round"/>'; }
  function bbox(pts) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  var CLIP = 0;
  /* Sapuan kuas di dalam bentuk (dipotong oleh clipPath) */
  function streaks(R, shape, bb, n, cols, angle, len, w, op) {
    var id = 'k' + (CLIP++), s = '<clipPath id="' + id + '">' + shape + '</clipPath><g clip-path="url(#' + id + ')">';
    for (var i = 0; i < n; i++) s += E(bb.x + R() * bb.w, bb.y + R() * bb.h, len * (.5 + R()), w * (.5 + R() * .9), angle + (R() - .5) * 16, pick(R, cols), op * (.6 + R() * .5));
    return s + '</g>';
  }
  /* Poligon yang "dicat": warna dasar + sapuan + garis tepi kuas */
  function paintPoly(R, pts, base, opt) {
    opt = opt || {};
    var t = opt.tones || tones(base), bb = bbox(pts), area = bb.w * bb.h;
    var n = opt.n || Math.min(260, Math.max(14, Math.round(area / 260)));
    return poly(pts, base) + streaks(R, poly(pts, '#000'), bb, n, t, opt.angle || 0, opt.len || 22, opt.w || 3.2, opt.op || .5) +
      (opt.edge === false ? '' : '<polygon points="' + P(pts) + '" fill="none" stroke="' + darken(base, .4) + '" stroke-width="' + (opt.edgeW || 2.2) + '" stroke-opacity=".55" stroke-linejoin="round"/>');
  }
  function paintPath(R, d, base, b, opt) {
    opt = opt || {};
    var t = opt.tones || tones(base), n = opt.n || Math.min(260, Math.max(14, Math.round(b.w * b.h / 260)));
    return path(d, base) + streaks(R, path(d, '#000'), b, n, t, opt.angle || 0, opt.len || 22, opt.w || 3.2, opt.op || .5) +
      (opt.edge === false ? '' : '<path d="' + d + '" fill="none" stroke="' + darken(base, .4) + '" stroke-width="' + (opt.edgeW || 2.2) + '" stroke-opacity=".55" stroke-linejoin="round"/>');
  }
  /* Kumpulan sapuan berbentuk elips (dedaunan, awan, semak) — terang di kiri-atas */
  function dabs(R, cx, cy, rx, ry, n, cols, smin, smax, opt) {
    opt = opt || {};
    var s = opt.noBase ? '' : E(cx, cy + ry * .08, rx * .92, ry * .88, 0, cols[0], .95);
    for (var i = 0; i < n; i++) {
      var a = R() * Math.PI * 2, r = Math.sqrt(R()), x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      var lit = ((cx - x) / rx * (opt.lx == null ? .45 : opt.lx) + (cy - y) / ry * (opt.ly == null ? .7 : opt.ly) + 1) / 2;
      var idx = Math.max(0, Math.min(cols.length - 1, Math.floor((lit * .75 + R() * .4) * cols.length)));
      var sz = smin + R() * (smax - smin);
      s += E(x, y, sz, sz * (.45 + R() * .45), (opt.rot != null ? opt.rot : 0) + R() * (opt.rotJ != null ? opt.rotJ : 180), cols[idx], .7 + R() * .3);
    }
    return s;
  }

  /* ---------- Dokumen SVG + filter lukisan ---------- */
  function filterDefs(o) {
    o = o || {};
    var seed = o.seed || 3;
    return '<filter id="pt" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + (o.warpF || .022) + '" numOctaves="2" seed="' + seed + '" result="w"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="w" scale="' + (o.warp == null ? 9 : o.warp) + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="' + (o.texF || '.2 .13') + '" numOctaves="3" seed="' + (seed + 7) + '" result="n"/>' +
      '<feDiffuseLighting in="n" surfaceScale="' + (o.relief || 1.2) + '" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="56"/></feDiffuseLighting>' +
      '<feComposite in="d" in2="l" operator="arithmetic" k1="' + (o.k1 || .42) + '" k2="' + (o.k2 || .68) + '" k3="0" k4="0" result="t"/>' +
      '<feComposite in="t" in2="d" operator="in"/></filter>' +
      '<filter id="mist" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="' + (o.blur || 9) + '"/></filter>';
  }
  function doc(inner, vb, par, o) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="' + (par || 'xMidYMax slice') + '"><defs>' + filterDefs(o) + ((o && o.defs) || '') + '</defs><g filter="url(#' + ((o && o.filter) || 'pt') + ')">' + inner + '</g></svg>';
  }
  var URLS = {};
  function toURL(key, svg) {
    if (URLS[key]) return URLS[key];
    try { URLS[key] = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); }
    catch (e) { URLS[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
    return URLS[key];
  }
  var VB = '-400 0 1200 700';

  /* ---------- Alam ---------- */
  function sky(p) {
    var R = rng(11), s = '<rect x="-400" y="0" width="1200" height="700" fill="url(#sg)"/>';
    var cols = [p.sky[0], p.sky[1], p.sky[2], lighten(p.sky[0], .5), '#FFFFFF'];
    for (var i = 0; i < 90; i++) { var y = R() * 520; s += E(-400 + R() * 1200, y, 50 + R() * 140, 3 + R() * 7, (R() - .5) * 6, cols[Math.min(4, Math.floor((1 - y / 520) * 3 + R() * 2))], .22 + R() * .2); }
    s += '<circle cx="' + p.sun[0] + '" cy="' + p.sun[1] + '" r="300" fill="url(#sun)"/>';
    var defs = '<linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset=".55" stop-color="' + p.sky[1] + '"/><stop offset=".85" stop-color="' + p.sky[2] + '"/></linearGradient>' +
      '<radialGradient id="sun"><stop offset="0" stop-color="#FFFDF2"/><stop offset=".25" stop-color="' + lighten(p.sky[0], .7) + '" stop-opacity=".8"/><stop offset="1" stop-color="' + p.sky[0] + '" stop-opacity="0"/></radialGradient>';
    return { inner: s, defs: defs };
  }
  function cloud(R, cx, cy, w, p) {
    var shade = p.cloudShade || mix(p.sky[2], '#8A8A9A', .25);
    return dabs(R, cx, cy, w / 2, w / 6.5, Math.round(w / 2.6), [shade, mix(shade, '#FFFFFF', .5), '#F6F3EC', '#FFFFFF', '#FFFFFF'], 6, 16, { lx: .1, ly: 1.1, noBase: true, rotJ: 20 });
  }
  function clouds(p) {
    var R = rng(23), s = '';
    [[-300, 120, 220], [-90, 90, 180], [120, 150, 150], [330, 80, 230], [560, 130, 200], [720, 70, 160], [30, 210, 120]].forEach(function (c) { s += cloud(R, c[0], c[1], c[2], p); });
    return s;
  }
  function volcano(R, cx, base, w, h, col, opt) {
    opt = opt || {};
    var t = tones(col), crater = w * .07;
    var pts = [[cx - w / 2, base], [cx - w * .3, base - h * .35], [cx - w * .14, base - h * .78], [cx - crater, base - h], [cx + crater, base - h], [cx + w * .15, base - h * .76], [cx + w * .32, base - h * .33], [cx + w / 2, base]];
    var s = paintPoly(R, pts, col, { angle: -62, len: 30, w: 3.5, n: 140, edge: false, op: .45 });
    // sisi terang & bayangan
    s += streaks(R, poly([[cx - w / 2, base], [cx - crater, base - h], [cx, base - h], [cx - w * .1, base]], '#000'), bbox([[cx - w / 2, base], [cx, base - h]]), 50, [t[3], t[4]], -60, 34, 3, .45);
    for (var r = 0; r < 9; r++) { var x = cx + (R() - .5) * crater * 2; s += line('M' + f(x) + ' ' + f(base - h + 4) + ' Q' + f(x + (x - cx) * 2) + ' ' + f(base - h * .5) + ' ' + f(x + (x - cx) * 5 + (R() - .5) * 60) + ' ' + f(base - h * .1), t[0], 1.5 + R() * 1.5, .35); }
    if (opt.snow) s += dabs(R, cx, base - h + 8, crater * 2.2, 10, 30, ['#E8E6E0', '#F7F5EF', '#FFFFFF'], 3, 7, { noBase: true });
    return s;
  }
  function hillsRow(R, y, amp, col, x0, x1, n) {
    var d = 'M' + x0 + ' 700 L' + x0 + ' ' + y, step = (x1 - x0) / n;
    for (var i = 0; i < n; i++) { var xm = x0 + step * (i + .5), xe = x0 + step * (i + 1); d += ' Q' + f(xm) + ' ' + f(y - amp * (.6 + R() * .8)) + ' ' + f(xe) + ' ' + f(y + (R() - .5) * amp * .3); }
    d += ' L' + x1 + ' 700Z';
    return paintPath(R, d, col, { x: x0, y: y - amp * 1.5, w: x1 - x0, h: 700 - y + amp * 1.5 }, { angle: -8, len: 34, w: 3, op: .4, edge: false, n: 160 });
  }
  function karst(R, base, col, xs) {
    var s = '';
    xs.forEach(function (k) {
      var x = k[0], w = k[1], h = k[2];
      var d = 'M' + f(x - w / 2) + ' ' + base + ' C' + f(x - w / 2) + ' ' + f(base - h * .7) + ' ' + f(x - w * .3) + ' ' + f(base - h) + ' ' + f(x) + ' ' + f(base - h) + ' C' + f(x + w * .3) + ' ' + f(base - h) + ' ' + f(x + w / 2) + ' ' + f(base - h * .7) + ' ' + f(x + w / 2) + ' ' + base + 'Z';
      s += paintPath(R, d, col, { x: x - w / 2, y: base - h, w: w, h: h }, { angle: -75, len: 26, w: 3, op: .45, edge: false });
    });
    return s;
  }
  function mist(y, h, col) {
    var R = rng(31), s = '';
    for (var i = 0; i < 16; i++) s += E(-400 + R() * 1200, y + (R() - .5) * h, 120 + R() * 200, 10 + R() * 18, 0, col || '#FFFFFF', .35 + R() * .3);
    return s;
  }
  function terraces(R, x0, x1, y0, y1, rows, greens, waterCol) {
    var s = '';
    for (var k = 0; k < rows; k++) {
      var ya = y0 + (y1 - y0) * k / rows, yb = y0 + (y1 - y0) * (k + 1) / rows + 2, wv = 10 + k * 3;
      var d = 'M' + x0 + ' ' + f(ya) + ' Q' + f((x0 + x1) * .25) + ' ' + f(ya - wv) + ' ' + f((x0 + x1) / 2) + ' ' + f(ya) + ' T' + x1 + ' ' + f(ya) + ' L' + x1 + ' ' + f(yb) + ' L' + x0 + ' ' + f(yb) + 'Z';
      var col = greens[k % greens.length];
      s += paintPath(R, d, col, { x: x0, y: ya - wv, w: x1 - x0, h: yb - ya + wv }, { angle: 0, len: 18, w: 2.2, op: .45, edge: false, n: 120 });
      s += line('M' + x0 + ' ' + f(ya + 1) + ' Q' + f((x0 + x1) * .25) + ' ' + f(ya - wv + 1) + ' ' + f((x0 + x1) / 2) + ' ' + f(ya + 1) + ' T' + x1 + ' ' + f(ya + 1), waterCol || '#E4F1EE', 2, .7);
    }
    return s;
  }
  function trunk(R, x, base, h, w, col, lean) {
    lean = lean || 0;
    var d = 'M' + f(x - w) + ' ' + base + ' Q' + f(x - w * .6 + lean * .3) + ' ' + f(base - h * .5) + ' ' + f(x - w * .4 + lean) + ' ' + f(base - h) + ' L' + f(x + w * .4 + lean) + ' ' + f(base - h) + ' Q' + f(x + w * .6 + lean * .3) + ' ' + f(base - h * .5) + ' ' + f(x + w) + ' ' + base + 'Z';
    return paintPath(R, d, col, { x: x - w, y: base - h, w: w * 2 + Math.abs(lean), h: h }, { angle: 88, len: 16, w: 2, op: .55 });
  }
  function roundTree(R, x, base, s, greens, trunkCol) {
    var g = trunk(R, x, base, 110 * s, 9 * s, trunkCol, (R() - .5) * 10);
    var blobs = [[0, -150, 70], [-50, -120, 55], [50, -118, 56], [-25, -185, 50], [28, -190, 48], [0, -215, 38]];
    blobs.forEach(function (b) { g += dabs(R, x + b[0] * s, base + b[1] * s, b[2] * s, b[2] * s * .85, Math.round(b[2] * 1.2), greens, 4 * s, 11 * s); });
    return g;
  }
  function banyan(R, x, base, s, greens, trunkCol, poleng) {
    var g = trunk(R, x, base, 130 * s, 22 * s, trunkCol);
    for (var k = 0; k < 14; k++) { var rx = x + (R() - .5) * 170 * s; g += line('M' + f(rx) + ' ' + f(base - 120 * s - R() * 30 * s) + ' Q' + f(rx + (R() - .5) * 10) + ' ' + f(base - 60 * s) + ' ' + f(rx + (R() - .5) * 14) + ' ' + f(base - R() * 30 * s), darken(trunkCol, .1), 1.5 + R() * 2, .7); }
    if (poleng) {
      var id = 'k' + (CLIP++), bw = 22 * s, ty = base - 70 * s, th = 46 * s, sq = 8 * s;
      g += '<clipPath id="' + id + '"><rect x="' + f(x - bw) + '" y="' + f(ty) + '" width="' + f(bw * 2) + '" height="' + f(th) + '"/></clipPath><g clip-path="url(#' + id + ')">';
      for (var cy = 0; cy < th / sq + 1; cy++) for (var cx = 0; cx < bw * 2 / sq + 1; cx++) g += '<rect x="' + f(x - bw + cx * sq) + '" y="' + f(ty + cy * sq) + '" width="' + f(sq) + '" height="' + f(sq) + '" fill="' + ((cx + cy) % 2 ? '#1E1C1A' : '#F4F0E6') + '"/>';
      g += '</g>' + line('M' + f(x - bw) + ' ' + f(ty) + ' Q' + x + ' ' + f(ty - 8) + ' ' + f(x + bw) + ' ' + f(ty), '#1E1C1A', 2, .8);
    }
    var blobs = [[0, -200, 120, 70], [-110, -170, 80, 55], [110, -168, 85, 56], [-60, -240, 75, 48], [60, -245, 72, 46], [-150, -130, 50, 40], [150, -128, 52, 40]];
    blobs.forEach(function (b) { g += dabs(R, x + b[0] * s, base + b[1] * s, b[2] * s, b[3] * s, Math.round(b[2] * 1.5), greens, 4 * s, 12 * s); });
    return g;
  }
  function palm(R, x, base, h, lean, greens, trunkCol) {
    var tx = x + lean, ty = base - h, g = '';
    for (var w = 7; w >= 3; w -= 2) g += line('M' + f(x) + ' ' + base + ' Q' + f(x + lean * .2) + ' ' + f(base - h * .5) + ' ' + f(tx) + ' ' + f(ty), w === 7 ? darken(trunkCol, .15) : (w === 5 ? trunkCol : lighten(trunkCol, .25)), w * 1.2, 1);
    for (var r = 1; r < 12; r++) { var t = r / 12, px = x + (tx - x) * t + lean * .2 * Math.sin(t * 3), py = base - h * t; g += line('M' + f(px - 5) + ' ' + f(py) + ' l10 0', darken(trunkCol, .3), 1.2, .5); }
    for (var k = 0; k < 9; k++) {
      var a = -Math.PI / 2 + (k - 4) * .42 + (R() - .5) * .15, len = 70 + R() * 30, ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .6 + len * .35;
      var cxp = tx + Math.cos(a) * len * .5, cyp = ty + Math.sin(a) * len * .5 - 22;
      g += line('M' + f(tx) + ' ' + f(ty) + ' Q' + f(cxp) + ' ' + f(cyp) + ' ' + f(ex) + ' ' + f(ey), greens[0], 2.2, .9);
      for (var j = 1; j < 14; j++) {
        var u = j / 14, qx = (1 - u) * (1 - u) * tx + 2 * u * (1 - u) * cxp + u * u * ex, qy = (1 - u) * (1 - u) * ty + 2 * u * (1 - u) * cyp + u * u * ey;
        var ang = Math.atan2(ey - ty, ex - tx) * 180 / Math.PI, ll = 14 * (1 - u * .6);
        g += E(qx + 5, qy + 6, ll, 2.2, ang + 60, pick(R, greens), .9) + E(qx - 5, qy + 6, ll, 2.2, ang - 60, pick(R, greens), .9);
      }
    }
    return g + E(tx, ty + 4, 9, 7, 0, darken(trunkCol, .2));
  }
  function banana(R, x, base, s, greens) {
    var g = poly([[x - 7 * s, base], [x + 7 * s, base], [x + 4 * s, base - 70 * s], [x - 4 * s, base - 70 * s]], greens[1]) + streaks(R, poly([[x - 7 * s, base], [x + 7 * s, base], [x + 4 * s, base - 70 * s], [x - 4 * s, base - 70 * s]], '#000'), { x: x - 7 * s, y: base - 70 * s, w: 14 * s, h: 70 * s }, 14, [greens[2], greens[3]], 90, 12, 1.5, .6);
    [-150, -120, -80, -40, -10, 25].forEach(function (deg, i) {
      var a = deg * Math.PI / 180, L = (70 + R() * 30) * s, ex = x + Math.cos(a) * L, ey = base - 70 * s + Math.sin(a) * L * .7, ang = Math.atan2(ey - (base - 70 * s), ex - x) * 180 / Math.PI;
      var mx = (x + ex) / 2, my = (base - 70 * s + ey) / 2 - 6 * s;
      g += E(mx, my, L / 2, 13 * s, ang, greens[(i % 2) + 1], .95) + E(mx, my - 3 * s, L / 2.2, 6 * s, ang, greens[3], .5) + line('M' + f(x) + ' ' + f(base - 70 * s) + ' L' + f(ex) + ' ' + f(ey), greens[0], 1.6, .7);
      for (var c = 0; c < 4; c++) { var u = .3 + c * .15; g += line('M' + f(x + (ex - x) * u) + ' ' + f(base - 70 * s + (ey - base + 70 * s) * u) + ' l' + f(Math.cos(a + 1.4) * 10 * s) + ' ' + f(Math.sin(a + 1.4) * 10 * s), lighten(greens[2], .3), 1.2, .6); }
    });
    return g;
  }
  function bamboo(R, x, base, h, n, greens) {
    var g = '';
    for (var i = 0; i < n; i++) {
      var bx = x + (i - n / 2) * 11 + (R() - .5) * 6, lean = (R() - .5) * 40, hh = h * (.75 + R() * .3);
      g += line('M' + f(bx) + ' ' + base + ' Q' + f(bx + lean * .3) + ' ' + f(base - hh * .5) + ' ' + f(bx + lean) + ' ' + f(base - hh), i % 2 ? greens[2] : greens[1], 5, 1);
      for (var k = 1; k < 8; k++) { var t = k / 8; g += line('M' + f(bx + lean * t * t - 3) + ' ' + f(base - hh * t) + ' l6 0', greens[0], 1.6, .8); }
      for (var j = 0; j < 9; j++) { var t2 = .45 + R() * .55, lx = bx + lean * t2 * t2, ly = base - hh * t2; g += E(lx + 10, ly, 14, 2.6, 20 + R() * 40, pick(R, greens), .9) + E(lx - 10, ly + 2, 13, 2.4, 140 + R() * 40, pick(R, greens), .9); }
    }
    return g;
  }
  function pflower(R, x, y, r, petal, center, n) {
    var s = '';
    n = n || 5;
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + R() * .3; s += E(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .58, r * .34, a * 180 / Math.PI, i % 2 ? petal : lighten(petal, .15), .95); }
    return s + E(x, y, r * .25, r * .25, 0, center);
  }
  function bush(R, x, y, w, h, greens, flowers) {
    var s = dabs(R, x, y, w / 2, h / 2, Math.round(w * .9), greens, 4, 10);
    if (flowers) for (var i = 0; i < Math.round(w / 9); i++) { var a = R() * Math.PI * 2, r = Math.sqrt(R()) * .9; var fl = pick(R, flowers); s += pflower(R, x + Math.cos(a) * w / 2 * r, y + Math.sin(a) * h / 2 * r - 4, 5 + R() * 6, fl[0], fl[1], fl[2]); }
    return s;
  }
  function ground(R, p, y) {
    var d = 'M-420 ' + y + ' Q200 ' + (y - 22) + ' 820 ' + y + ' L820 700 L-420 700Z';
    return paintPath(R, d, p.ground, { x: -420, y: y - 22, w: 1240, h: 700 - y + 22 }, { angle: 0, len: 26, w: 2.6, op: .45, edge: false, n: 260, tones: tones(p.ground) });
  }
  function courtPath(R, p, cx, top, w0, w1) {
    var pts = [[cx - w0, top], [cx + w0, top], [cx + w1, 700], [cx - w1, 700]];
    return paintPoly(R, pts, p.path, { angle: 90, len: 20, w: 2.5, op: .4, edge: false });
  }

  /* ---------- Burung (tanpa filter, dianimasikan CSS) ---------- */
  function birds(col) {
    var b = function (x, y, s) { return '<g class="pbird"><path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" d="M-10 0 Q-5 -6 0 0 Q5 -6 10 0"/></g>'; };
    return '<svg class="pbirds" viewBox="0 0 400 200" aria-hidden="true">' + b(40, 60, 1) + b(72, 80, .8) + b(18, 96, .7) + b(96, 46, .9) + b(120, 74, .6) + '</svg>';
  }

  /* ---------- Aset UI yang dilukis ---------- */
  function paperTile(p) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs>' +
      '<filter id="pp" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="3" seed="2" stitchTiles="stitch" result="blot"/>' +
      '<feColorMatrix in="blot" type="matrix" values="0 0 0 0 ' + f2(hx(p.paper2)[0] / 255) + ' 0 0 0 0 ' + f2(hx(p.paper2)[1] / 255) + ' 0 0 0 0 ' + f2(hx(p.paper2)[2] / 255) + ' 0 0 0 1.6 -.55" result="blots"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency=".45 .2" numOctaves="3" seed="9" stitchTiles="stitch" result="n"/>' +
      '<feDiffuseLighting in="n" surfaceScale="1" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>' +
      '<feFlood flood-color="' + p.paper + '" result="base"/><feComposite in="blots" in2="base" operator="over" result="col"/>' +
      '<feComposite in="col" in2="l" operator="arithmetic" k1=".3" k2=".76" k3="0" k4="0"/></filter></defs>' +
      '<rect width="512" height="512" filter="url(#pp)"/></svg>';
    return toURL('paper-' + p.key, svg);
  }
  function borderStrip(p, motif, flip) {
    var H = 640, W = 170, R = rng(77), s = '';
    var items = motif(R, W, H, p);   // [{y, svg(y)}] — digambar 3x (y-H, y, y+H) agar sambung
    [-H, 0, H].forEach(function (off) { items.forEach(function (it) { s += it(off); }); });
    var inner = flip ? '<g transform="translate(' + W + ' 0) scale(-1 1)">' + s + '</g>' : s;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs>' + filterDefs({ warp: 5, seed: 13 }) + '</defs><g filter="url(#pt)">' + inner + '</g></svg>';
    return toURL('strip-' + p.key + (flip ? 'r' : 'l'), svg);
  }
  function roughRect(R, x, y, w, h, j) {
    var pts = [], n = 12;
    for (var i = 0; i <= n; i++) pts.push([x + w * i / n, y + (R() - .5) * j]);
    for (i = 1; i <= n; i++) pts.push([x + w + (R() - .5) * j, y + h * i / n]);
    for (i = n - 1; i >= 0; i--) pts.push([x + w * i / n, y + h + (R() - .5) * j]);
    for (i = n - 1; i > 0; i--) pts.push([x + (R() - .5) * j, y + h * i / n]);
    return pts;
  }
  function buttonImg(p, ghost) {
    var R = rng(ghost ? 88 : 66), s = '', col = p.btn;
    if (!ghost) {
      s += paintPoly(R, roughRect(R, 14, 14, 292, 62, 10), col, { angle: (R() - .5) * 4, len: 60, w: 3, op: .55, n: 120, edgeW: 3 });
      s += E(110, 32, 80, 4, -2, lighten(col, .45), .45) + E(200, 64, 90, 3, 1, darken(col, .25), .35);
    } else {
      var pts = roughRect(R, 16, 16, 288, 58, 6), d = 'M' + P(pts).split(' ').join(' L') + 'Z';
      s += '<path d="' + d + '" fill="' + p.paper + '" fill-opacity=".55" stroke="' + col + '" stroke-width="6" stroke-linejoin="round"/>';
      s += '<path d="' + d + '" fill="none" stroke="' + lighten(col, .3) + '" stroke-width="2" stroke-dasharray="40 14 70 10" stroke-linejoin="round"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 90" preserveAspectRatio="none"><defs>' + filterDefs({ warp: 6, seed: 21, texF: '.4 .12' }) + '</defs><g filter="url(#pt)">' + s + '</g></svg>';
    return toURL('btn-' + p.key + (ghost ? 'g' : ''), svg);
  }
  function cardImg(p) {
    var R = rng(44), s = '', fr = p.frame;
    s += paintPoly(R, roughRect(R, 12, 12, 216, 216, 6), fr, { angle: 0, len: 30, w: 2.6, op: .4, n: 120 });
    s += poly(roughRect(R, 26, 26, 188, 188, 3), lighten(p.paper, .45));
    s += streaks(R, '<rect x="26" y="26" width="188" height="188"/>', { x: 26, y: 26, w: 188, h: 188 }, 26, [p.paper, lighten(p.paper, .6)], 0, 50, 3, .25);
    s += '<rect x="24" y="24" width="192" height="192" fill="none" stroke="' + p.gold + '" stroke-width="2.2" stroke-opacity=".9"/>';
    [[24, 24], [216, 24], [24, 216], [216, 216]].forEach(function (c) { s += E(c[0], c[1], 6, 6, 0, p.gold) + E(c[0] - 1.5, c[1] - 1.5, 2.4, 2.4, 0, lighten(p.gold, .5)); });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs>' + filterDefs({ warp: 4, seed: 17, relief: .8, k1: .3, k2: .76 }) + '</defs><g filter="url(#pt)">' + s + '</g></svg>';
    return toURL('card-' + p.key, svg);
  }
  function blobImg(p) {
    var R = rng(55), pts = [];
    for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2, r = 42 + (R() - .5) * 6; pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>' + filterDefs({ warp: 5, seed: 9 }) + '</defs><g filter="url(#pt)">' + paintPoly(R, pts, p.btn, { angle: 30, len: 20, w: 2.5, op: .5, n: 50 }) + '</g></svg>';
    return toURL('blob-' + p.key, svg);
  }
  function frameImg(p, crest) {
    var R = rng(99), s = '', cx = 150, cy = 200, rx = 108, ry = 142;
    for (var k = 0; k < 3; k++) {
      var w = [16, 6, 4][k], rr = [0, 13, -11][k];
      s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx + rr) + '" ry="' + (ry + rr) + '" fill="none" stroke="' + [p.gold, lighten(p.gold, .35), darken(p.gold, .25)][k] + '" stroke-width="' + w + '"/>';
    }
    for (var i = 0; i < 70; i++) { var a = R() * Math.PI * 2; s += E(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 6 + R() * 6, 2.4, a * 180 / Math.PI + 90, pick(R, tones(p.gold)), .8); }
    for (var j = 0; j < 24; j++) { var b = j / 24 * Math.PI * 2; s += E(cx + Math.cos(b) * (rx + 13), cy + Math.sin(b) * (ry + 13), 3, 3, 0, lighten(p.gold, .5)); }
    s += crest ? crest(R, cx, cy - ry - 6, p) : '';
    // rangkaian bunga di bawah
    var fl = p.flowers || [['#FFFFFF', p.gold, 5]];
    s += dabs(R, cx + 40, cy + ry + 2, 46, 20, 40, tones(p.leaf), 4, 9);
    for (var q = 0; q < 7; q++) { var fc = pick(R, fl); s += pflower(R, cx + 10 + R() * 70, cy + ry - 8 + R() * 20, 9 + R() * 6, fc[0], fc[1], fc[2]); }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs>' + filterDefs({ warp: 5, seed: 5, relief: 2 }) + '</defs><g filter="url(#pt)">' + s + '</g></svg>';
    return toURL('frame-' + p.key, svg);
  }
  function dividerImg(p, motif) {
    var R = rng(12), s = '';
    s += line('M20 30 Q90 18 120 30', p.gold, 2.4, .9) + line('M280 30 Q210 18 180 30', p.gold, 2.4, .9);
    s += line('M40 36 Q90 28 118 36', p.gold, 1.2, .7) + line('M260 36 Q210 28 182 36', p.gold, 1.2, .7);
    s += E(20, 30, 3, 3, 0, p.gold) + E(280, 30, 3, 3, 0, p.gold);
    s += motif ? motif(R, 150, 30, p) : E(150, 30, 10, 10, 45, p.gold);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60"><defs>' + filterDefs({ warp: 3, seed: 7 }) + '</defs><g filter="url(#pt)">' + s + '</g></svg>';
    return toURL('div-' + p.key, svg);
  }

  /* Lapisan SVG berfilter dipanggang SEKALI menjadi bitmap seukuran layar,
     sehingga zoom kamera & goyangan tidak memicu render ulang filter. */
  var RASTER = {}, PENDING = [];
  function rasterSize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var h = Math.round(Math.max(window.innerHeight || 800, (window.innerWidth || 400) * 700 / 1200) * dpr * 1.15);
    h = Math.max(700, Math.min(1200, h));
    return { w: Math.round(h * 1200 / 700), h: h };
  }
  function bake(name, svg) {
    if (RASTER[name]) return RASTER[name];
    var sz = rasterSize();
    var sized = svg.replace('<svg ', '<svg width="' + sz.w + '" height="' + sz.h + '" ');
    var svgUrl = toURL(name + '-svg', sized);
    RASTER[name] = new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement('canvas'); c.width = sz.w; c.height = sz.h;
          c.getContext('2d').drawImage(im, 0, 0, sz.w, sz.h);
          c.toBlob(function (b) { resolve(b ? URL.createObjectURL(b) : svgUrl); }, 'image/webp', .9);
        } catch (e) { resolve(svgUrl); }
      };
      im.onerror = function () { resolve(svgUrl); };
      im.src = svgUrl;
    });
    PENDING.push(RASTER[name]);
    return RASTER[name];
  }
  function img(cls, promise) {
    var i = document.createElement('img'); i.className = 'ply ' + cls; i.alt = ''; i.decoding = 'async'; i.setAttribute('aria-hidden', 'true');
    promise.then(function (u) { i.onload = function () { i.classList.add('on'); }; i.src = u; });
    return i;
  }
  var SVGS = {};
  function layerSvgs(key) {
    if (SVGS[key]) return SVGS[key];
    var A = window.PAINTER.ADAT[key];
    var p = A.pal; p.key = key;
    var sk = sky(p), L = A.scene(p);
    SVGS[key] = {
      sky: doc(sk.inner, VB, null, { defs: sk.defs, warp: 3, seed: 2, relief: .45, texF: '.12 .12' }),
      clouds: doc(clouds(p), VB, 'xMidYMin slice', { warp: 10, seed: 4, relief: .9 }),
      far: doc(L.far, VB, null, { warp: 7, seed: 6, relief: .9 }),
      mist: doc(L.mist || mist(L.mistY || 430, 50, p.mist), VB, null, { filter: 'mist', blur: 10 }),
      trees: doc(L.trees, VB, null, { warp: 9, seed: 8 }),
      arch: doc(L.arch, VB, null, { warp: 5, seed: 10, relief: 1.7 }),
      props: L.props ? doc(L.props, VB, null, { warp: 6, seed: 12 }) : null,
      front: doc(L.front, VB, null, { warp: 9, seed: 14 }),
      birdCol: p.bird || darken(p.ink, .1)
    };
    return SVGS[key];
  }
  function scene(key, cls) {
    var S = layerSvgs(key);
    var sc = document.createElement('div'); sc.className = 'pscene ' + (cls || ''); sc.setAttribute('aria-hidden', 'true');
    var cam = document.createElement('div'); cam.className = 'pcam';
    ['sky', 'clouds', 'far', 'mist', 'trees', 'arch', 'props', 'front'].forEach(function (n) {
      if (S[n]) cam.appendChild(img('ly-' + n, bake(key + '-' + n, S[n])));
    });
    cam.insertAdjacentHTML('beforeend', birds(S.birdCol));
    sc.appendChild(cam);
    return sc;
  }
  function applyUI(key) {
    var A = window.PAINTER.ADAT[key], p = A.pal, root = document.documentElement.style;
    p.key = key;
    var set = function (k, u) { root.setProperty(k, 'url("' + u + '")'); };
    set('--pt-paper', paperTile(p));
    set('--pt-bl', borderStrip(p, A.border, false));
    set('--pt-br', borderStrip(p, A.border, true));
    set('--pt-btn', buttonImg(p, false));
    set('--pt-btn-ghost', buttonImg(p, true));
    set('--pt-card', cardImg(p));
    set('--pt-blob', blobImg(p));
    set('--pt-frame', frameImg(p, A.crest));
    set('--pt-div', dividerImg(p, A.motif));
  }

  window.PAINTER = {
    ADAT: {},
    whenReady: function () { return Promise.all(PENDING.slice()); },
    util: { f: f, f2: f2, rng: rng, mix: mix, lighten: lighten, darken: darken, pick: pick, tones: tones, E: E, P: P, poly: poly, path: path, line: line, bbox: bbox, streaks: streaks, paintPoly: paintPoly, paintPath: paintPath, dabs: dabs, pflower: pflower },
    nature: { volcano: volcano, hillsRow: hillsRow, karst: karst, mist: mist, terraces: terraces, trunk: trunk, roundTree: roundTree, banyan: banyan, palm: palm, banana: banana, bamboo: bamboo, bush: bush, ground: ground, courtPath: courtPath, cloud: cloud }
  };

  DC.register('painted', {
    section: function (i, mono, id, data) {
      var key = (data && data.theme && data.theme.adat) || 'jawa';
      if (!window.PAINTER.ADAT[key]) return [];
      if (id === 'home') return [scene(key, 'ps-hero')];
      if (id === 'tuan-rumah' || id === 'penutup') { var v = document.createElement('div'); v.className = 'pvignette'; v.setAttribute('aria-hidden', 'true'); v.appendChild(scene(key, 'ps-vig')); return [v]; }
      return [];
    },
    cover: function (i, mono, id, data) { var key = (data && data.theme && data.theme.adat) || 'jawa'; return window.PAINTER.ADAT[key] ? [scene(key, 'ps-cover')] : []; },
    side: function (i, mono, id, data) { var key = (data && data.theme && data.theme.adat) || 'jawa'; return window.PAINTER.ADAT[key] ? [scene(key, 'ps-side')] : []; },
    page: function (i, mono, id, data) { var key = (data && data.theme && data.theme.adat) || 'jawa'; if (window.PAINTER.ADAT[key]) applyUI(key); return []; }
  });
})();
