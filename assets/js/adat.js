/* =========================================================
   ADEGAN ADAT untuk gaya "painted": Jawa, Bali, Minangkabau, Toraja, Sasak.
   Masing-masing: palet, adegan berlapis (far/trees/arch/props/front),
   motif bingkai samping, mahkota bingkai foto, motif pembatas judul.
   Semua digambar orisinal dengan sapuan kuas dari painter.js.
   ========================================================= */
(function () {
  'use strict';
  var PT = window.PAINTER;
  if (!PT) return;
  var U = PT.util, N = PT.nature;
  var f = U.f, E = U.E, poly = U.poly, path = U.path, line = U.line, pick = U.pick, tones = U.tones, mix = U.mix, lighten = U.lighten, darken = U.darken;
  var paintPoly = U.paintPoly, paintPath = U.paintPath, dabs = U.dabs, pflower = U.pflower, streaks = U.streaks, bbox = U.bbox;
  function rng(s) { return U.rng(s); }

  /* ---------- Orang berbusana adat (kecil, gaya lukisan) ---------- */
  function person(R, x, base, s, o) {
    var g = '', fem = o.female;
    var kain = [[x - 21 * s, base], [x + 21 * s, base], [x + 16 * s, base - 62 * s], [x - 16 * s, base - 62 * s]];
    g += paintPoly(R, kain, o.bottom, { angle: 90, len: 8, w: 1.6, op: .5, n: 34 });
    for (var i = 0; i < 20; i++) g += E(x + (R() - .5) * 30 * s, base - 4 * s - R() * 56 * s, 1.5 * s, 1.5 * s, 0, o.motif || lighten(o.bottom, .45), .85);
    var top = fem ? [[x - 18 * s, base - 58 * s], [x + 18 * s, base - 58 * s], [x + 12 * s, base - 84 * s], [x + 15 * s, base - 108 * s], [x - 15 * s, base - 108 * s], [x - 12 * s, base - 84 * s]]
      : [[x - 18 * s, base - 58 * s], [x + 18 * s, base - 58 * s], [x + 16 * s, base - 108 * s], [x - 16 * s, base - 108 * s]];
    g += paintPoly(R, top, o.top, { angle: 90, len: 10, w: 1.8, op: .5, n: 40 });
    if (o.trim) g += line('M' + f(x) + ' ' + f(base - 108 * s) + ' L' + f(x) + ' ' + f(base - 60 * s), o.trim, 2 * s, .9) + line('M' + f(x - 17 * s) + ' ' + f(base - 60 * s) + ' L' + f(x + 17 * s) + ' ' + f(base - 60 * s), o.trim, 3 * s, .9);
    g += E(x - 19 * s, base - 84 * s, 4.5 * s, 22 * s, 8, o.top) + E(x + 19 * s, base - 84 * s, 4.5 * s, 22 * s, -8, o.top);
    g += E(x - 20 * s, base - 62 * s, 3.4 * s, 3.4 * s, 0, o.skin) + E(x + 20 * s, base - 62 * s, 3.4 * s, 3.4 * s, 0, o.skin);
    if (o.sash) g += poly([[x - 15 * s, base - 106 * s], [x - 8 * s, base - 108 * s], [x + 16 * s, base - 66 * s], [x + 9 * s, base - 62 * s]], o.sash);
    g += E(x, base - 112 * s, 4 * s, 5 * s, 0, darken(o.skin, .08)) + E(x, base - 124 * s, 10.5 * s, 12.5 * s, 0, o.skin);
    g += E(x - 3.5 * s, base - 124 * s, 1.1 * s, 1.1 * s, 0, '#2A1A12') + E(x + 3.5 * s, base - 124 * s, 1.1 * s, 1.1 * s, 0, '#2A1A12') + E(x, base - 117 * s, 2.4 * s, 1 * s, 0, darken(o.skin, .3), .8);
    g += o.head(R, x, base - 124 * s, s);
    return g;
  }
  function couple(R, cx, base, s, groom, bride) {
    return person(R, cx - 26 * s, base, s, groom) + person(R, cx + 26 * s, base + 2, s * .96, bride);
  }
  function goldPins(R, x, y, s, n, gold) { var g = ''; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + (i - (n - 1) / 2) * .35; g += line('M' + f(x) + ' ' + f(y) + ' l' + f(Math.cos(a) * 12 * s) + ' ' + f(Math.sin(a) * 12 * s), gold, 1 * s, .9) + E(x + Math.cos(a) * 13 * s, y + Math.sin(a) * 13 * s, 2.2 * s, 2.2 * s, 0, lighten(gold, .3)); } return g; }

  /* ---------- Gunungan wayang ---------- */
  function gunungan(R, cx, bottom, h, p, simple) {
    var w = h * .62, top = bottom - h;
    var d = 'M' + f(cx) + ' ' + f(top) + ' C' + f(cx + w * .38) + ' ' + f(top + h * .22) + ' ' + f(cx + w * .52) + ' ' + f(bottom - h * .3) + ' ' + f(cx + w * .5) + ' ' + f(bottom) + ' L' + f(cx - w * .5) + ' ' + f(bottom) + ' C' + f(cx - w * .52) + ' ' + f(bottom - h * .3) + ' ' + f(cx - w * .38) + ' ' + f(top + h * .22) + ' ' + f(cx) + ' ' + f(top) + 'Z';
    var g = simple ? path(d, p.gold) : paintPath(R, d, darken(p.accent, .1), { x: cx - w / 2, y: top, w: w, h: h }, { angle: 90, len: 10, w: 2, op: .5 });
    if (!simple) {
      g += '<path d="' + d + '" fill="none" stroke="' + p.gold + '" stroke-width="' + f(h * .035) + '"/>';
      g += dabs(R, cx, top + h * .45, w * .3, h * .25, 60, tones(p.leaf), h * .02, h * .045);
      g += line('M' + f(cx) + ' ' + f(bottom - h * .18) + ' L' + f(cx) + ' ' + f(top + h * .3), p.wood ? p.wood[0] : '#5A3A22', h * .03, .9);
      g += poly([[cx - w * .16, bottom], [cx + w * .16, bottom], [cx + w * .16, bottom - h * .16], [cx, bottom - h * .23], [cx - w * .16, bottom - h * .16]], p.stone ? p.stone[0] : '#B9A88C');
      for (var i = 0; i < 18; i++) { var t = i / 18; g += E(cx + (i % 2 ? 1 : -1) * w * (.18 + .25 * Math.sin(t * Math.PI)), top + h * (.12 + t * .7), h * .018, h * .018, 0, lighten(p.gold, .3)); }
    }
    return g;
  }

  /* ---------- Penjor / janur ---------- */
  function penjor(R, x, base, h, dir, p, lamak) {
    var g = '', topX = x + dir * 18, topY = base - h * .78, tipX = x + dir * 120, tipY = base - h * .72, peakX = x + dir * 70, peakY = base - h * 1.02;
    for (var w = 6; w >= 2; w -= 2) g += line('M' + f(x) + ' ' + base + ' Q' + f(x + dir * 6) + ' ' + f(base - h * .4) + ' ' + f(topX) + ' ' + f(topY) + ' Q' + f(peakX) + ' ' + f(peakY) + ' ' + f(tipX) + ' ' + f(tipY), w === 6 ? '#B49A62' : (w === 4 ? '#D8C38C' : '#F1E3B4'), w, 1);
    for (var k = 0; k < 16; k++) {
      var t = k / 16, px = x + dir * 6 * t * 2, py = base - h * (.15 + t * .6);
      for (var j = 0; j < 4; j++) g += E(px + dir * (4 + j * 3), py + 8 + j * 3, 9, 1.8, dir * (60 + j * 8), pick(R, ['#E9D46A', '#D7C255', '#F4E58C', '#A8B84A']), .95);
    }
    for (var q = 0; q < 30; q++) { var u = q / 30, qx = (1 - u) * (1 - u) * topX + 2 * u * (1 - u) * peakX + u * u * tipX, qy = (1 - u) * (1 - u) * topY + 2 * u * (1 - u) * peakY + u * u * tipY; g += E(qx, qy + 10, 1.6, 11, (R() - .5) * 20, pick(R, ['#E9D46A', '#F4E58C', '#C8B848']), .9); }
    g += dabs(R, tipX, tipY + 22, 12, 18, 30, ['#C8A23A', '#E9D46A', '#F7EDB0', p.accent, '#FFFFFF'], 2, 5, { noBase: true });
    if (lamak) { var lx = x + dir * 4; g += poly([[lx - 7, base - h * .42], [lx + 7, base - h * .42], [lx + 7, base - h * .12], [lx, base - h * .08], [lx - 7, base - h * .12]], '#E3CF6A'); for (var m = 0; m < 6; m++) g += E(lx, base - h * (.38 - m * .045), 4, 3, 45, m % 2 ? p.accent : '#3E7A3A', .9); }
    return g;
  }

  /* ========================================================= JAWA */
  var JAWA_P = {
    sky: ['#F8E9C8', '#F2D4A2', '#E8BD88'], sun: [200, 230], mist: '#FFF5E4', cloudShade: '#D9B98E',
    leaf: '#5E7E38', ground: '#9AAE62', path: '#E3D2A6', paper: '#F3E6CB', paper2: '#E2CBA0', ink: '#3E2A18',
    accent: '#7E2E22', gold: '#C9982C', frame: '#6E3E22', btn: '#7E3A24', wood: ['#4E3220', '#6E4A2C', '#93663E'], stone: ['#B9A88C', '#9A8A70'], roof: '#5C3826',
    flowers: [['#FFFDF5', '#E9D9A0', 6], ['#F4E7C8', '#D9B86A', 5]]
  };
  function joglo(R, cx, base, s, p) {
    var g = '';
    g += paintPoly(R, [[cx - 185 * s, base], [cx + 185 * s, base], [cx + 172 * s, base - 18 * s], [cx - 172 * s, base - 18 * s]], p.stone[0], { angle: 0, len: 20, w: 2.4 });
    g += paintPoly(R, [[cx - 40 * s, base + 2], [cx + 40 * s, base + 2], [cx + 30 * s, base - 18 * s], [cx - 30 * s, base - 18 * s]], p.stone[1], { angle: 0, len: 14, w: 2 });
    g += poly([[cx - 168 * s, base - 18 * s], [cx + 168 * s, base - 18 * s], [cx + 168 * s, base - 92 * s], [cx - 168 * s, base - 92 * s]], '#3A2416', ' opacity=".55"');
    [-150, -90, -32, 32, 90, 150].forEach(function (px) {
      var X = cx + px * s;
      g += paintPoly(R, [[X - 5 * s, base - 18 * s], [X + 5 * s, base - 18 * s], [X + 4.5 * s, base - 92 * s], [X - 4.5 * s, base - 92 * s]], p.wood[1], { angle: 90, len: 10, w: 1.4, edgeW: 1.4 });
      g += poly([[X - 6 * s, base - 84 * s], [X + 6 * s, base - 84 * s], [X + 6 * s, base - 78 * s], [X - 6 * s, base - 78 * s]], p.gold) + poly([[X - 6 * s, base - 30 * s], [X + 6 * s, base - 30 * s], [X + 6 * s, base - 26 * s], [X - 6 * s, base - 26 * s]], p.accent);
    });
    [-90, 0, 90].forEach(function (lx) { g += line('M' + f(cx + lx * s) + ' ' + f(base - 92 * s) + ' v' + f(10 * s), p.gold, 1, .8) + E(cx + lx * s, base - 78 * s, 5 * s, 6.5 * s, 0, '#F2C95A') + E(cx + lx * s, base - 79 * s, 2.5 * s, 3 * s, 0, '#FFF3C4'); });
    var lower = 'M' + f(cx - 212 * s) + ' ' + f(base - 88 * s) + ' Q' + f(cx - 170 * s) + ' ' + f(base - 100 * s) + ' ' + f(cx - 118 * s) + ' ' + f(base - 126 * s) + ' L' + f(cx + 118 * s) + ' ' + f(base - 126 * s) + ' Q' + f(cx + 170 * s) + ' ' + f(base - 100 * s) + ' ' + f(cx + 212 * s) + ' ' + f(base - 88 * s) + 'Z';
    g += paintPath(R, lower, p.roof, { x: cx - 212 * s, y: base - 126 * s, w: 424 * s, h: 38 * s }, { angle: 12, len: 26, w: 2.6, n: 160 });
    for (var k = -9; k <= 9; k++) g += line('M' + f(cx + k * 12 * s) + ' ' + f(base - 126 * s) + ' L' + f(cx + k * 22 * s) + ' ' + f(base - 89 * s), darken(p.roof, .35), 1, .45);
    g += paintPoly(R, [[cx - 214 * s, base - 92 * s], [cx + 214 * s, base - 92 * s], [cx + 214 * s, base - 86 * s], [cx - 214 * s, base - 86 * s]], p.wood[0], { angle: 0, len: 30, w: 1.4, edgeW: 1 });
    for (var d = -20; d <= 20; d++) g += E(cx + d * 10.5 * s, base - 84 * s, 2.4 * s, 3 * s, 0, p.gold, .9);
    var upper = 'M' + f(cx - 122 * s) + ' ' + f(base - 122 * s) + ' Q' + f(cx - 95 * s) + ' ' + f(base - 150 * s) + ' ' + f(cx - 46 * s) + ' ' + f(base - 210 * s) + ' L' + f(cx + 46 * s) + ' ' + f(base - 210 * s) + ' Q' + f(cx + 95 * s) + ' ' + f(base - 150 * s) + ' ' + f(cx + 122 * s) + ' ' + f(base - 122 * s) + 'Z';
    g += paintPath(R, upper, darken(p.roof, .08), { x: cx - 122 * s, y: base - 210 * s, w: 244 * s, h: 88 * s }, { angle: 62, len: 22, w: 2.4, n: 150 });
    for (var u = -6; u <= 6; u++) g += line('M' + f(cx + u * 7 * s) + ' ' + f(base - 210 * s) + ' L' + f(cx + u * 19 * s) + ' ' + f(base - 123 * s), darken(p.roof, .4), 1, .4);
    g += paintPoly(R, [[cx - 50 * s, base - 214 * s], [cx + 50 * s, base - 214 * s], [cx + 46 * s, base - 208 * s], [cx - 46 * s, base - 208 * s]], p.wood[0], { edgeW: 1 });
    g += gunungan(R, cx - 50 * s, base - 213 * s, 18 * s, p, true) + gunungan(R, cx + 50 * s, base - 213 * s, 18 * s, p, true) + gunungan(R, cx, base - 213 * s, 22 * s, p, true);
    return g;
  }
  function candiFar(R, cx, base, s, col) {
    var g = '', t = tones(col);
    for (var k = 0; k < 6; k++) { var w = (60 - k * 9) * s, y = base - k * 26 * s; g += paintPoly(R, [[cx - w, y], [cx + w, y], [cx + w * .85, y - 26 * s], [cx - w * .85, y - 26 * s]], t[2], { angle: 0, len: 12, w: 2, edge: false, op: .35 }); }
    g += poly([[cx - 6 * s, base - 156 * s], [cx + 6 * s, base - 156 * s], [cx, base - 190 * s]], t[1]);
    return g;
  }
  JAWA_P.scene = function (p) {
    var R = rng(101), greens = tones(p.leaf);
    var far = N.volcano(R, 360, 470, 620, 300, '#9DA284', {}) + N.volcano(R, -120, 470, 460, 200, '#B4B395', {});
    far += line('M362 178 Q330 120 380 80 Q430 40 400 0', '#EFE6D6', 18, .35) + line('M362 178 Q340 130 372 96', '#FFFFFF', 8, .3);
    far += candiFar(R, -260, 472, .9, '#A99E86') + candiFar(R, 640, 472, 1, '#A99E86') + candiFar(R, 700, 476, .6, '#B5AB92');
    far += N.hillsRow(R, 470, 30, '#8FA36A', -420, 820, 10) + N.terraces(R, -420, 820, 488, 520, 3, ['#A9BB6A', '#B9C77A', '#9CB05E'], '#F4EBD2');
    var trees = N.banyan(R, -120, 560, 1.15, greens, p.wood[0]) + N.banyan(R, 530, 560, 1.15, greens, p.wood[0]) + N.roundTree(R, -330, 548, 1, greens, p.wood[0]) + N.roundTree(R, 730, 548, 1, greens, p.wood[0]);
    var arch = N.ground(R, p, 528) + joglo(R, 200, 528, .9, p) + N.courtPath(R, p, 200, 530, 34, 120);
    arch += couple(R, 200, 650, 1.15,
      { skin: '#C68E64', top: '#2A1C16', bottom: '#7A4A26', motif: '#E2C08A', trim: p.gold, head: function (R, x, y, s) { return E(x, y - 6 * s, 12 * s, 8.5 * s, 0, '#4A2E1C') + E(x, y - 9 * s, 9 * s, 4 * s, 0, '#6E4A2C', .9) + E(x - 4 * s, y - 10 * s, 2 * s, 2 * s, 0, '#E2C08A') + E(x + 4 * s, y - 8 * s, 2 * s, 2 * s, 0, '#E2C08A'); } },
      { female: true, skin: '#D39B72', top: '#1E1614', bottom: '#8A5A2E', motif: '#E9CB8E', trim: p.gold, head: function (R, x, y, s) { var g = E(x, y - 3 * s, 11.5 * s, 10 * s, 0, '#1A1210') + E(x, y - 15 * s, 10 * s, 6 * s, 0, '#1A1210') + E(x, y - 5 * s, 8 * s, 3 * s, 0, '#0E0A08'); g += goldPins(R, x, y - 17 * s, s, 5, p.gold); for (var i = 0; i < 9; i++) g += E(x + 11 * s, y + i * 4.5 * s, 2 * s, 1.6 * s, 0, '#FFFDF5'); return g; } });
    var props = penjor(R, 70, 560, 260, -1, p, false) + penjor(R, 330, 560, 260, 1, p, false) + N.banana(R, 20, 600, 1.4, tones('#7C9A3E')) + N.banana(R, 380, 600, 1.4, tones('#7C9A3E'));
    var fl = p.flowers.concat([['#E85A4F', '#F2C95A', 5]]);
    var front = N.bush(R, -30, 650, 300, 140, greens, fl) + N.bush(R, 430, 650, 300, 140, greens, fl) + N.bush(R, -300, 640, 280, 130, greens, fl) + N.bush(R, 700, 640, 280, 130, greens, fl);
    return { far: far, trees: trees, arch: arch, props: props, front: front, mistY: 455 };
  };
  JAWA_P.border = function (R, W, H, p) {
    var items = [];
    [16, 44, 72].forEach(function (x, si) {
      items.push(function (off) {
        var s = line('M' + x + ' ' + off + ' L' + x + ' ' + (off + H), '#6E8A48', 1.6, .8);
        for (var y = 0; y < H; y += 16) { s += E(x - 4, off + y, 6 - si * .6, 4.6, 30, '#FFFDF6', .98) + E(x + 4, off + y + 8, 6 - si * .6, 4.6, -30, '#FFFDF6', .98) + E(x, off + y + 4, 2, 2, 0, (y / 16) % 5 === 2 ? '#E8C25A' : '#C9C3A6', .9); }
        return s;
      });
    });
    [0, 160, 320, 480].forEach(function (y, i) {
      var leaves = '', R2 = rng(y + 21);
      for (var k = 0; k < 10; k++) leaves += E(22 + R2() * 90, y + (R2() - .5) * 50, 30, 10, R2() * 360, pick(R2, tones(p.leaf)), .95);
      leaves += pflower(R2, 50, y, 22, '#F4E7C8', '#D9B86A', 6) + pflower(R2, 96, y + 22, 16, '#FFFDF5', '#E9D9A0', 5) + pflower(R2, 30, y + 32, 15, i % 2 ? '#E85A4F' : '#F4E7C8', '#F2C95A', 5);
      items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + leaves + '</g>'; });
    });
    return items;
  };
  JAWA_P.crest = function (R, cx, y, p) { return gunungan(R, cx, y + 6, 60, p, false); };
  JAWA_P.motif = function (R, cx, cy, p) { return gunungan(R, cx, cy + 22, 44, p, false); };

  /* ========================================================= BALI */
  var BALI_P = {
    sky: ['#FCE2BE', '#F7B98F', '#EE927C'], sun: [230, 300], mist: '#FFE9D6', cloudShade: '#E7A58E',
    leaf: '#4F7E32', ground: '#7FA348', path: '#D9C9A6', paper: '#F8EBD6', paper2: '#EBCDA8', ink: '#3A2416',
    accent: '#B5402A', gold: '#D2A032', frame: '#8A3A24', btn: '#B5482C', brick: '#B4553A', stone: ['#A8A291', '#C6BFAC'], thatch: '#2E2A26',
    flowers: [['#FFFFFF', '#F2C94C', 5], ['#FBE7A1', '#E9A93A', 5], ['#E8476A', '#F7D35A', 5]]
  };
  function candiBentar(R, cx, base, s, p) {
    var g = '', gap = 40 * s;
    function half(dir) {
      var xi = cx + dir * gap / 2, pts = [[xi, base]], steps = [[100, 0], [100, 34], [88, 34], [88, 80], [76, 80], [76, 120], [62, 120], [62, 156], [48, 156], [48, 190], [34, 190], [34, 220], [20, 220], [20, 250], [8, 250], [8, 270], [0, 270]];
      steps.forEach(function (st) { pts.push([xi + dir * st[0] * s, base - st[1] * s]); });
      var out = paintPoly(R, pts, p.brick, { angle: 0, len: 16, w: 2.4, n: 200 });
      [34, 80, 120, 156, 190, 220].forEach(function (y, i) { var w = [100, 88, 76, 62, 48, 34][i] * s; out += paintPoly(R, [[xi, base - y * s], [xi + dir * w, base - y * s], [xi + dir * w, base - (y + 8) * s], [xi, base - (y + 8) * s]], p.stone[1], { angle: 0, len: 10, w: 1.6, edgeW: 1 }); for (var k = 0; k < w / (7 * s); k++) out += E(xi + dir * (k * 7 + 4) * s, base - (y + 4) * s, 2 * s, 2.6 * s, 0, p.stone[0], .9); });
      for (var b = 0; b < 30; b++) { var by = base - R() * 250 * s; out += line('M' + f(xi + dir * R() * 70 * s) + ' ' + f(by) + ' l' + f(dir * 10 * s) + ' 0', darken(p.brick, .3), 1, .45); }
      return out;
    }
    g += half(-1) + half(1);
    g += paintPoly(R, [[cx - 30 * s, base + 4], [cx + 30 * s, base + 4], [cx + 22 * s, base - 14 * s], [cx - 22 * s, base - 14 * s]], p.stone[0], { angle: 0, len: 12, w: 2 });
    return g;
  }
  function meru(R, x, base, tiers, s, p) {
    var g = paintPoly(R, [[x - 34 * s, base], [x + 34 * s, base], [x + 30 * s, base - 36 * s], [x - 30 * s, base - 36 * s]], p.stone[0], { angle: 0, len: 12, w: 2 });
    g += poly([[x - 26 * s, base - 36 * s], [x + 26 * s, base - 36 * s], [x + 26 * s, base - 56 * s], [x - 26 * s, base - 56 * s]], '#5A3A26');
    for (var k = 0; k < tiers; k++) {
      var w = (62 - k * 8) * s, y = base - (56 + k * 24) * s;
      g += paintPoly(R, [[x - w, y], [x + w, y], [x + w * .55, y - 18 * s], [x - w * .55, y - 18 * s]], p.thatch, { angle: 14, len: 14, w: 2, n: 50, tones: tones('#3E3832') });
      g += poly([[x - w * .5, y - 18 * s], [x + w * .5, y - 18 * s], [x + w * .5, y - 24 * s], [x - w * .5, y - 24 * s]], '#6E4A2C');
    }
    g += line('M' + f(x) + ' ' + f(base - (56 + tiers * 24) * s) + ' v' + f(-18 * s), p.gold, 3 * s, 1) + E(x, base - (56 + tiers * 24 + 20) * s, 4 * s, 5 * s, 0, p.gold);
    return g;
  }
  function tedung(R, x, base, h, p) {
    var g = line('M' + x + ' ' + base + ' L' + x + ' ' + (base - h), '#7A4E2C', 3, 1);
    var d = 'M' + (x - 34) + ' ' + (base - h + 16) + ' Q' + x + ' ' + (base - h - 22) + ' ' + (x + 34) + ' ' + (base - h + 16) + 'Z';
    g += paintPath(R, d, '#E8B83A', { x: x - 34, y: base - h - 22, w: 68, h: 38 }, { angle: 0, len: 10, w: 2 });
    for (var i = 0; i < 14; i++) g += E(x - 32 + i * 5, base - h + 19, 2.2, 5, 0, i % 2 ? '#FFFFFF' : '#F4E3A1');
    return g + E(x, base - h - 10, 3, 4, 0, p.gold);
  }
  function kamboja(R, x, base, s, p) {
    var g = '', br = '#7A6A5A';
    var limbs = [[0, 0, -10, -60], [-10, -60, -50, -110], [-10, -60, 30, -120], [30, -120, 70, -140], [-50, -110, -80, -130], [30, -120, 10, -160]];
    limbs.forEach(function (l, i) { g += line('M' + f(x + l[0] * s) + ' ' + f(base + l[1] * s) + ' Q' + f(x + (l[0] + l[2]) / 2 * s + 8) + ' ' + f(base + (l[1] + l[3]) / 2 * s) + ' ' + f(x + l[2] * s) + ' ' + f(base + l[3] * s), i ? br : darken(br, .2), (i ? 6 : 11) * s, 1); });
    [[-50, -118], [30, -128], [-80, -136], [70, -148], [10, -168], [-20, -90]].forEach(function (c) {
      for (var k = 0; k < 7; k++) { var a = k / 7 * Math.PI * 2; g += E(x + c[0] * s + Math.cos(a) * 14 * s, base + c[1] * s + Math.sin(a) * 8 * s, 14 * s, 5 * s, a * 180 / Math.PI, pick(R, tones(p.leaf)), .95); }
      for (var q = 0; q < 4; q++) g += pflower(R, x + c[0] * s + (R() - .5) * 18 * s, base + c[1] * s - 6 * s + (R() - .5) * 8 * s, 7 * s, '#FFFFFF', '#F2C94C', 5);
    });
    return g;
  }
  BALI_P.scene = function (p) {
    var R = rng(202), greens = tones(p.leaf);
    var far = N.volcano(R, 140, 460, 760, 320, '#8A7BA0', {}) + N.hillsRow(R, 462, 26, '#7E8B6A', -420, 820, 9);
    far += N.terraces(R, -420, 820, 470, 528, 6, ['#7FAA3E', '#97C152', '#B4D46A', '#8CB64A'], '#FCE8D2');
    far += N.palm(R, -250, 500, 160, 30, tones('#4F7A36'), '#8A6A48') + N.palm(R, 660, 498, 170, -24, tones('#4F7A36'), '#8A6A48') + N.palm(R, 720, 505, 130, 18, tones('#5A8A3A'), '#8A6A48');
    var trees = N.banyan(R, -130, 560, 1.1, greens, '#5E4A3A', true) + kamboja(R, 560, 560, 1.4, p) + N.palm(R, -330, 560, 240, 40, tones('#4A7A32'), '#8A6A48') + N.palm(R, 740, 560, 250, -40, tones('#4A7A32'), '#8A6A48');
    var arch = meru(R, 20, 520, 5, .9, p) + meru(R, 380, 520, 3, .8, p) + N.ground(R, p, 528) + candiBentar(R, 200, 532, 1, p) + N.courtPath(R, p, 200, 534, 22, 110);
    arch += couple(R, 200, 652, 1.15,
      { skin: '#B97E56', top: '#F6F0E2', bottom: '#E3B33E', motif: '#B5402A', sash: '#D2A032', head: function (R, x, y, s) { return poly([[x - 11 * s, y - 6 * s], [x + 11 * s, y - 6 * s], [x + 9 * s, y - 13 * s], [x + 3 * s, y - 22 * s], [x - 9 * s, y - 13 * s]], '#F6F0E2') + line('M' + f(x - 11 * s) + ' ' + f(y - 7 * s) + ' L' + f(x + 11 * s) + ' ' + f(y - 7 * s), '#D2A032', 2.4 * s, 1); } },
      { female: true, skin: '#C88C62', top: '#B5402A', bottom: '#D2A032', motif: '#7A2A1A', sash: '#E3B33E', head: function (R, x, y, s) { var g = E(x, y - 3 * s, 11 * s, 10 * s, 0, '#1A1210') + poly([[x - 13 * s, y - 8 * s], [x + 13 * s, y - 8 * s], [x + 9 * s, y - 34 * s], [x, y - 44 * s], [x - 9 * s, y - 34 * s]], '#D2A032'); for (var i = 0; i < 6; i++) g += E(x + (i - 2.5) * 4 * s, y - (14 + (i % 2) * 10) * s, 1.8 * s, 1.8 * s, 0, '#B5402A'); g += pflower(R, x - 12 * s, y - 10 * s, 5 * s, '#FFFFFF', '#F2C94C', 5) + pflower(R, x + 12 * s, y - 10 * s, 5 * s, '#FFFFFF', '#F2C94C', 5); return g; } });
    var props = penjor(R, 72, 560, 300, -1, p, true) + penjor(R, 328, 560, 300, 1, p, true) + tedung(R, 140, 560, 120, p) + tedung(R, 260, 560, 120, p);
    var front = N.bush(R, -40, 650, 300, 140, greens, p.flowers) + N.bush(R, 440, 650, 300, 140, greens, p.flowers) + N.bush(R, -300, 640, 260, 120, greens, p.flowers) + N.bush(R, 700, 640, 260, 120, greens, p.flowers);
    return { far: far, trees: trees, arch: arch, props: props, front: front, mistY: 450 };
  };
  BALI_P.border = function (R, W, H, p) {
    var items = [];
    items.push(function (off) { return line('M24 ' + off + ' C44 ' + (off + 80) + ' 8 ' + (off + 160) + ' 24 ' + (off + 320) + ' C40 ' + (off + 400) + ' 6 ' + (off + 480) + ' 24 ' + (off + 640), '#7A6A5A', 6, 1); });
    [60, 220, 380, 540].forEach(function (y, i) {
      var R2 = rng(y + 3), g = '';
      for (var k = 0; k < 7; k++) { var a = (k / 7) * Math.PI * 2; g += E(36 + Math.cos(a) * 22, y + Math.sin(a) * 12, 22, 7, a * 180 / Math.PI, pick(R2, tones(p.leaf)), .95); }
      for (var q = 0; q < 4; q++) g += pflower(R2, 30 + R2() * 40, y - 6 + (R2() - .5) * 16, 11, i % 2 ? '#FBE7A1' : '#FFFFFF', '#F2C94C', 5);
      items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + g + '</g>'; });
    });
    return items;
  };
  BALI_P.crest = function (R, cx, y, p) { var g = ''; [-24, 0, 24].forEach(function (dx, i) { g += pflower(R, cx + dx, y - (i === 1 ? 10 : 0), i === 1 ? 16 : 12, '#FFFFFF', '#F2C94C', 5); }); return g + E(cx, y - 32, 4, 9, 0, p.gold); };
  BALI_P.motif = function (R, cx, cy, p) { return pflower(R, cx - 16, cy + 2, 10, '#FFFFFF', '#F2C94C', 5) + pflower(R, cx + 16, cy + 2, 10, '#FBE7A1', '#E9A93A', 5) + pflower(R, cx, cy - 6, 12, '#FFFFFF', '#F2C94C', 5); };

  /* ========================================================= MINANGKABAU */
  var MINANG_P = {
    sky: ['#EEF6F4', '#D2E8E2', '#B7D9CC'], sun: [240, 200], mist: '#F4FBF8', cloudShade: '#AFC7C2',
    leaf: '#3F7A2E', ground: '#76A645', path: '#E2D3A8', paper: '#F5EAD6', paper2: '#E5D0AA', ink: '#2E1E14',
    accent: '#B3261E', gold: '#D4A52C', frame: '#7A1F16', btn: '#A82A1E', ijuk: '#2E2A26', wall: '#7A2E1F',
    flowers: [['#D9322E', '#F2C94C', 5], ['#F7D35A', '#C8322B', 5], ['#FFFFFF', '#F2C94C', 5]]
  };
  function songketBand(R, x0, y0, w, h, p) {
    var g = '', id = 'k' + Math.floor(R() * 1e6);
    g += '<clipPath id="' + id + '"><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath><g clip-path="url(#' + id + ')">';
    var cols = [p.accent, p.gold, '#1E1A16', '#2E6B3A'];
    for (var x = x0; x < x0 + w; x += h) { var c = cols[Math.floor((x - x0) / h) % 4]; g += '<rect x="' + f(x + h * .15) + '" y="' + f(y0 + h * .15) + '" width="' + f(h * .7) + '" height="' + f(h * .7) + '" fill="' + c + '" transform="rotate(45 ' + f(x + h / 2) + ' ' + f(y0 + h / 2) + ')"/>' + E(x + h / 2, y0 + h / 2, h * .12, h * .12, 0, '#F7E3A1'); }
    return g + '</g>';
  }
  function rumahGadang(R, cx, base, s, p) {
    var g = '';
    for (var i = -6; i <= 6; i++) g += paintPoly(R, [[cx + i * 26 * s - 4 * s, base], [cx + i * 26 * s + 4 * s, base], [cx + i * 26 * s + 4 * s, base - 44 * s], [cx + i * 26 * s - 4 * s, base - 44 * s]], '#3E2A1C', { angle: 90, len: 8, w: 1.4, edgeW: 1 });
    var body = [[cx - 168 * s, base - 42 * s], [cx + 168 * s, base - 42 * s], [cx + 192 * s, base - 116 * s], [cx - 192 * s, base - 116 * s]];
    g += paintPoly(R, body, p.wall, { angle: 0, len: 20, w: 2.4, n: 180 });
    g += songketBand(R, cx - 186 * s, base - 112 * s, 372 * s, 14 * s, p) + songketBand(R, cx - 172 * s, base - 58 * s, 344 * s, 12 * s, p);
    for (var w = -5; w <= 5; w++) { var X = cx + w * 30 * s; g += poly([[X - 9 * s, base - 94 * s], [X + 9 * s, base - 94 * s], [X + 9 * s, base - 66 * s], [X - 9 * s, base - 66 * s]], '#2A1A12') + '<rect x="' + f(X - 10 * s) + '" y="' + f(base - 95 * s) + '" width="' + f(20 * s) + '" height="' + f(30 * s) + '" fill="none" stroke="' + p.gold + '" stroke-width="' + f(1.6 * s) + '"/>'; }
    var b = base, d = 'M' + f(cx - 205 * s) + ' ' + f(b - 112 * s) +
      ' Q' + f(cx - 230 * s) + ' ' + f(b - 180 * s) + ' ' + f(cx - 275 * s) + ' ' + f(b - 248 * s) +
      ' Q' + f(cx - 205 * s) + ' ' + f(b - 175 * s) + ' ' + f(cx - 150 * s) + ' ' + f(b - 166 * s) +
      ' Q' + f(cx - 120 * s) + ' ' + f(b - 185 * s) + ' ' + f(cx - 112 * s) + ' ' + f(b - 236 * s) +
      ' Q' + f(cx - 75 * s) + ' ' + f(b - 175 * s) + ' ' + f(cx) + ' ' + f(b - 168 * s) +
      ' Q' + f(cx + 75 * s) + ' ' + f(b - 175 * s) + ' ' + f(cx + 112 * s) + ' ' + f(b - 236 * s) +
      ' Q' + f(cx + 120 * s) + ' ' + f(b - 185 * s) + ' ' + f(cx + 150 * s) + ' ' + f(b - 166 * s) +
      ' Q' + f(cx + 205 * s) + ' ' + f(b - 175 * s) + ' ' + f(cx + 275 * s) + ' ' + f(b - 248 * s) +
      ' Q' + f(cx + 230 * s) + ' ' + f(b - 180 * s) + ' ' + f(cx + 205 * s) + ' ' + f(b - 112 * s) + 'Z';
    g += paintPath(R, d, p.ijuk, { x: cx - 275 * s, y: b - 248 * s, w: 550 * s, h: 136 * s }, { angle: 70, len: 18, w: 2.2, n: 240, tones: tones('#3E3832') });
    [[-275, -248], [-112, -236], [112, -236], [275, -248]].forEach(function (t) { g += line('M' + f(cx + t[0] * s) + ' ' + f(b + t[1] * s) + ' l' + f((t[0] < 0 ? -1 : 1) * 6 * s) + ' ' + f(-14 * s), p.gold, 2.4 * s, 1); });
    g += paintPoly(R, [[cx - 22 * s, base + 2], [cx + 22 * s, base + 2], [cx + 12 * s, base - 44 * s], [cx - 12 * s, base - 44 * s]], '#6E4A2C', { angle: 0, len: 10, w: 1.6 });
    for (var st = 0; st < 5; st++) g += line('M' + f(cx - 16 * s + st * 2 * s) + ' ' + f(base - st * 9 * s) + ' l' + f(32 * s - st * 4 * s) + ' 0', '#3E2A1C', 1.6, .8);
    return g;
  }
  function rangkiang(R, x, base, s, p) {
    var g = '';
    [-14, 14].forEach(function (dx) { g += poly([[x + dx * s - 3 * s, base], [x + dx * s + 3 * s, base], [x + dx * s + 3 * s, base - 30 * s], [x + dx * s - 3 * s, base - 30 * s]], '#3E2A1C'); });
    g += paintPoly(R, [[x - 24 * s, base - 30 * s], [x + 24 * s, base - 30 * s], [x + 30 * s, base - 82 * s], [x - 30 * s, base - 82 * s]], p.wall, { angle: 0, len: 12, w: 2 });
    g += songketBand(R, x - 28 * s, base - 78 * s, 56 * s, 9 * s, p);
    var d = 'M' + f(x - 36 * s) + ' ' + f(base - 80 * s) + ' Q' + f(x - 44 * s) + ' ' + f(base - 110 * s) + ' ' + f(x - 58 * s) + ' ' + f(base - 140 * s) + ' Q' + f(x - 20 * s) + ' ' + f(base - 112 * s) + ' ' + f(x) + ' ' + f(base - 110 * s) + ' Q' + f(x + 20 * s) + ' ' + f(base - 112 * s) + ' ' + f(x + 58 * s) + ' ' + f(base - 140 * s) + ' Q' + f(x + 44 * s) + ' ' + f(base - 110 * s) + ' ' + f(x + 36 * s) + ' ' + f(base - 80 * s) + 'Z';
    return g + paintPath(R, d, p.ijuk, { x: x - 58 * s, y: base - 140 * s, w: 116 * s, h: 60 * s }, { angle: 70, len: 12, w: 2, tones: tones('#3E3832') });
  }
  function marawa(R, x, base, h, dir, p) {
    var g = line('M' + x + ' ' + base + ' Q' + (x + dir * 6) + ' ' + (base - h * .6) + ' ' + (x + dir * 24) + ' ' + (base - h), '#C8B080', 4, 1);
    var tx = x + dir * 24, ty = base - h, cols = ['#1E1A16', '#C8322B', '#E8C23A'];
    cols.forEach(function (c, i) {
      var x0 = tx + dir * (2 + i * 9), pts = [[x0, ty], [x0 + dir * 9, ty + 2], [x0 + dir * 12, ty + h * .5], [x0 + dir * 8, ty + h * .62], [x0 + dir * 2, ty + h * .55]];
      g += paintPoly(R, pts, c, { angle: 88, len: 14, w: 1.6, edgeW: 1 });
    });
    return g;
  }
  MINANG_P.scene = function (p) {
    var R = rng(303), greens = tones(p.leaf);
    var far = N.volcano(R, -80, 465, 560, 280, '#6F9B8A', {}) + N.volcano(R, 470, 465, 600, 300, '#5E8C7A', {});
    far += N.hillsRow(R, 466, 30, '#5E9446', -420, 820, 10) + N.terraces(R, -420, 820, 476, 528, 5, ['#6FA840', '#86BC4A', '#A6D062', '#7CB244'], '#E8F4EE');
    far += N.palm(R, -260, 500, 150, 24, tones('#3E7030'), '#7A5E40') + N.palm(R, 680, 500, 160, -20, tones('#3E7030'), '#7A5E40');
    var trees = N.roundTree(R, -150, 556, 1.25, greens, '#4A3220') + N.roundTree(R, 560, 556, 1.25, greens, '#4A3220') + N.palm(R, -330, 560, 250, 30, tones('#3A6A2C'), '#7A5E40') + N.palm(R, 740, 560, 250, -34, tones('#3A6A2C'), '#7A5E40');
    var arch = N.ground(R, p, 528) + rangkiang(R, -10, 530, .9, p) + rangkiang(R, 410, 530, .9, p) + rumahGadang(R, 200, 530, .72, p) + N.courtPath(R, p, 200, 532, 18, 110);
    arch += couple(R, 200, 652, 1.15,
      { skin: '#B97E56', top: '#B3261E', bottom: '#1E1A16', motif: '#D4A52C', trim: '#D4A52C', head: function (R, x, y, s) { return poly([[x - 13 * s, y - 5 * s], [x + 13 * s, y - 5 * s], [x + 11 * s, y - 16 * s], [x + 5 * s, y - 12 * s], [x, y - 20 * s], [x - 5 * s, y - 12 * s], [x - 11 * s, y - 16 * s]], '#B3261E') + line('M' + f(x - 13 * s) + ' ' + f(y - 6 * s) + ' L' + f(x + 13 * s) + ' ' + f(y - 6 * s), '#D4A52C', 2.4 * s, 1); } },
      { female: true, skin: '#C88C62', top: '#9E1E18', bottom: '#D4A52C', motif: '#7A1F16', trim: '#D4A52C', head: function (R, x, y, s) { var g = E(x, y - 3 * s, 11 * s, 10 * s, 0, '#1A1210'); for (var r = 0; r < 4; r++) for (var k = 0; k <= 10; k++) { var a = Math.PI + k / 10 * Math.PI, rr = (16 + r * 6) * s; g += E(x + Math.cos(a) * rr, y - 6 * s + Math.sin(a) * rr * .85, (3 - r * .4) * s, (5 - r * .6) * s, a * 180 / Math.PI + 90, r % 2 ? '#F2CF5E' : '#D4A52C', .95); } return g; } });
    var props = marawa(R, 60, 560, 240, -1, p) + marawa(R, 340, 560, 240, 1, p) + marawa(R, -40, 566, 200, -1, p) + marawa(R, 440, 566, 200, 1, p);
    var front = N.bush(R, -40, 650, 300, 140, greens, p.flowers) + N.bush(R, 440, 650, 300, 140, greens, p.flowers) + N.bush(R, -300, 640, 260, 120, greens, p.flowers) + N.bush(R, 700, 640, 260, 120, greens, p.flowers);
    return { far: far, trees: trees, arch: arch, props: props, front: front, mistY: 455 };
  };
  MINANG_P.border = function (R, W, H, p) {
    var items = [];
    [40, 200, 360, 520].forEach(function (y, i) {
      var R2 = rng(y + 7), g = '';
      for (var k = 0; k < 5; k++) { var x0 = 10 + k * 9, h = 70 + R2() * 30; g += line('M' + x0 + ' ' + (y + 80) + ' Q' + (x0 + 6) + ' ' + (y + 30) + ' ' + (x0 + 22) + ' ' + (y + 80 - h), '#B89A44', 2, 1); for (var j = 0; j < 10; j++) { var t = j / 10; g += E(x0 + 22 * t * t + 4, y + 80 - h * t + 4, 4, 2, 60, pick(R2, ['#D9B84A', '#E8CC66', '#C8A23A']), .95); } }
      g += pflower(R2, 50, y + 34, 14, i % 2 ? '#F7D35A' : '#D9322E', i % 2 ? '#C8322B' : '#F2C94C', 5);
      for (var q = 0; q < 4; q++) g += E(30 + R2() * 40, y + 50 + R2() * 20, 16, 5, R2() * 360, pick(R2, tones(p.leaf)), .95);
      items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + g + '</g>'; });
    });
    return items;
  };
  function gonjongMini(R, cx, cy, w, p) {
    var d = 'M' + f(cx - w) + ' ' + f(cy + w * .3) + ' Q' + f(cx - w * .9) + ' ' + f(cy - w * .2) + ' ' + f(cx - w * 1.2) + ' ' + f(cy - w * .6) + ' Q' + f(cx - w * .5) + ' ' + f(cy - w * .15) + ' ' + f(cx) + ' ' + f(cy - w * .1) + ' Q' + f(cx + w * .5) + ' ' + f(cy - w * .15) + ' ' + f(cx + w * 1.2) + ' ' + f(cy - w * .6) + ' Q' + f(cx + w * .9) + ' ' + f(cy - w * .2) + ' ' + f(cx + w) + ' ' + f(cy + w * .3) + 'Z';
    return path(d, p.gold) + poly([[cx - w * .8, cy + w * .3], [cx + w * .8, cy + w * .3], [cx + w * .7, cy + w * .7], [cx - w * .7, cy + w * .7]], darken(p.gold, .2));
  }
  MINANG_P.crest = function (R, cx, y, p) { return gonjongMini(R, cx, y - 16, 40, p); };
  MINANG_P.motif = function (R, cx, cy, p) { return gonjongMini(R, cx, cy, 20, p); };

  /* ========================================================= TORAJA */
  var TORAJA_P = {
    sky: ['#E6EEF0', '#CCDADD', '#B2C6C8'], sun: [180, 220], mist: '#F4F8F8', cloudShade: '#A9B9BC',
    leaf: '#3A6A3E', ground: '#6F9A4E', path: '#D8CBA6', paper: '#F0E8DA', paper2: '#DCCDB2', ink: '#2A1E18',
    accent: '#8E1F1A', gold: '#D19A2A', frame: '#3A1E16', btn: '#8E2A1E', roof: '#2B2522',
    flowers: [['#F4EEE2', '#D19A2A', 5], ['#E0A92E', '#8E1F1A', 5], ['#B8455A', '#F2D06A', 5]]
  };
  function torajaCarving(R, x0, y0, w, h, p) {
    var id = 'k' + Math.floor(R() * 1e6), g = '<clipPath id="' + id + '"><rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '"/></clipPath><g clip-path="url(#' + id + ')">';
    g += '<rect x="' + f(x0) + '" y="' + f(y0) + '" width="' + f(w) + '" height="' + f(h) + '" fill="#8E1F1A"/>';
    var c = Math.max(6, h / 3);
    for (var x = x0; x < x0 + w; x += c) for (var y = y0; y < y0 + h; y += c) {
      var k = (Math.round((x - x0) / c) + Math.round((y - y0) / c)) % 3;
      if (k === 0) g += '<circle cx="' + f(x + c / 2) + '" cy="' + f(y + c / 2) + '" r="' + f(c * .32) + '" fill="none" stroke="#E0A92E" stroke-width="' + f(c * .12) + '"/>';
      else if (k === 1) g += '<path d="M' + f(x + c * .15) + ' ' + f(y + c * .85) + ' L' + f(x + c / 2) + ' ' + f(y + c * .15) + ' L' + f(x + c * .85) + ' ' + f(y + c * .85) + 'Z" fill="#1C1714"/>';
      else g += '<path d="M' + f(x + c * .2) + ' ' + f(y + c / 2) + ' q' + f(c * .3) + ' ' + f(-c * .4) + ' ' + f(c * .6) + ' 0" fill="none" stroke="#F3EEE2" stroke-width="' + f(c * .1) + '"/>';
    }
    return g + '</g>';
  }
  function tongkonan(R, cx, base, s, p, horns) {
    var g = '';
    for (var i = -4; i <= 4; i++) g += paintPoly(R, [[cx + i * 26 * s - 4 * s, base], [cx + i * 26 * s + 4 * s, base], [cx + i * 26 * s + 4 * s, base - 46 * s], [cx + i * 26 * s - 4 * s, base - 46 * s]], '#3A2618', { angle: 90, len: 8, w: 1.4, edgeW: 1 });
    var body = 'M' + f(cx - 120 * s) + ' ' + f(base - 44 * s) + ' L' + f(cx - 120 * s) + ' ' + f(base - 186 * s) + ' Q' + f(cx) + ' ' + f(base - 112 * s) + ' ' + f(cx + 120 * s) + ' ' + f(base - 186 * s) + ' L' + f(cx + 120 * s) + ' ' + f(base - 44 * s) + 'Z';
    g += path(body, '#8E1F1A');
    g += torajaCarving(R, cx - 120 * s, base - 150 * s, 240 * s, 104 * s, p);
    g += '<path d="' + body + '" fill="none" stroke="#1C1714" stroke-width="' + f(3 * s) + '"/>';
    [[-60, -100], [60, -100]].forEach(function (b) { g += poly([[cx + b[0] * s - 14 * s, base + b[1] * s - 10 * s], [cx + b[0] * s + 14 * s, base + b[1] * s - 10 * s], [cx + b[0] * s + 14 * s, base + b[1] * s + 10 * s], [cx + b[0] * s - 14 * s, base + b[1] * s + 10 * s]], '#1C1714'); });
    var roof = 'M' + f(cx - 225 * s) + ' ' + f(base - 262 * s) + ' Q' + f(cx) + ' ' + f(base - 118 * s) + ' ' + f(cx + 225 * s) + ' ' + f(base - 262 * s) + ' L' + f(cx + 196 * s) + ' ' + f(base - 236 * s) + ' Q' + f(cx) + ' ' + f(base - 62 * s) + ' ' + f(cx - 196 * s) + ' ' + f(base - 236 * s) + 'Z';
    g += paintPath(R, roof, p.roof, { x: cx - 225 * s, y: base - 262 * s, w: 450 * s, h: 170 * s }, { angle: 0, len: 22, w: 2.4, n: 220, tones: tones('#3E3530') });
    for (var k = 0; k < 8; k++) { var t = k / 8; g += line('M' + f(cx - 225 * s + t * 30 * s) + ' ' + f(base - 262 * s + t * 26 * s) + ' Q' + f(cx) + ' ' + f(base - 118 * s + t * 56 * s) + ' ' + f(cx + 225 * s - t * 30 * s) + ' ' + f(base - 262 * s + t * 26 * s), '#58493F', 1.2, .5); }
    [-1, 1].forEach(function (d) { g += line('M' + f(cx + d * 200 * s) + ' ' + base + ' L' + f(cx + d * 206 * s) + ' ' + f(base - 238 * s), '#3A2618', 6 * s, 1); });
    if (horns) {
      var hx = cx + 150 * s;
      g += line('M' + f(hx) + ' ' + base + ' L' + f(hx) + ' ' + f(base - 150 * s), '#3A2618', 6 * s, 1);
      for (var q = 0; q < 7; q++) { var y = base - (40 + q * 15) * s, w = (24 - q * 1.4) * s; g += line('M' + f(hx - w) + ' ' + f(y - 8 * s) + ' Q' + f(hx - w * .6) + ' ' + f(y + 4 * s) + ' ' + f(hx) + ' ' + f(y) + ' Q' + f(hx + w * .6) + ' ' + f(y + 4 * s) + ' ' + f(hx + w) + ' ' + f(y - 8 * s), q % 2 ? '#E8E0CC' : '#D6CCB4', 4 * s, 1); }
    }
    return g;
  }
  TORAJA_P.scene = function (p) {
    var R = rng(404), greens = tones(p.leaf);
    var far = N.karst(R, 470, '#7A9690', [[-330, 200, 240], [-160, 180, 290], [20, 220, 230], [230, 200, 300], [420, 240, 250], [620, 200, 280], [760, 160, 220]]);
    far += N.karst(R, 480, '#5E7C76', [[-260, 160, 170], [-60, 200, 150], [160, 150, 190], [360, 190, 160], [560, 170, 180], [730, 150, 140]]);
    far += N.terraces(R, -420, 820, 480, 528, 4, ['#6A9A4A', '#82AE5A', '#5E8E44'], '#EAF0EE');
    var trees = N.bamboo(R, -150, 560, 300, 7, tones('#5E8A3C')) + N.bamboo(R, 560, 560, 300, 7, tones('#5E8A3C')) + N.roundTree(R, -320, 548, 1.1, greens, '#3E2A1C') + N.roundTree(R, 720, 548, 1.1, greens, '#3E2A1C');
    var arch = tongkonan(R, -60, 520, .55, p, false) + tongkonan(R, 460, 520, .55, p, false) + N.ground(R, p, 528) + tongkonan(R, 200, 534, .78, p, true) + N.courtPath(R, p, 200, 536, 20, 110);
    arch += couple(R, 200, 652, 1.15,
      { skin: '#B07650', top: '#1C1714', bottom: '#1C1714', motif: '#E0A92E', trim: '#E0A92E', sash: '#8E1F1A', head: function (R, x, y, s) { var g = E(x, y - 4 * s, 11 * s, 9 * s, 0, '#1A1210') + line('M' + f(x - 11 * s) + ' ' + f(y - 6 * s) + ' L' + f(x + 11 * s) + ' ' + f(y - 6 * s), '#E0A92E', 3 * s, 1); for (var i = 0; i < 6; i++) g += E(x - 10 * s + i * 4 * s, y - 6 * s, 1.4 * s, 1.4 * s, 0, i % 2 ? '#8E1F1A' : '#F3EEE2'); return g; } },
      { female: true, skin: '#C08660', top: '#E07A2A', bottom: '#1C1714', motif: '#E0A92E', trim: '#E0A92E', head: function (R, x, y, s) { var g = E(x, y - 3 * s, 11 * s, 10 * s, 0, '#1A1210') + line('M' + f(x - 12 * s) + ' ' + f(y - 8 * s) + ' Q' + f(x) + ' ' + f(y - 16 * s) + ' ' + f(x + 12 * s) + ' ' + f(y - 8 * s), '#E0A92E', 3.5 * s, 1); for (var i = 0; i < 7; i++) g += line('M' + f(x - 10 * s + i * 3.4 * s) + ' ' + f(y - 10 * s) + ' l0 ' + f(10 * s), i % 2 ? '#8E1F1A' : '#F3EEE2', 1.2 * s, .9); return g; } });
    var props = N.bamboo(R, 40, 600, 160, 3, tones('#6E9A44')) + N.bamboo(R, 360, 600, 160, 3, tones('#6E9A44'));
    var front = N.bush(R, -40, 650, 300, 140, greens, p.flowers) + N.bush(R, 440, 650, 300, 140, greens, p.flowers) + N.bush(R, -300, 640, 260, 120, greens, p.flowers) + N.bush(R, 700, 640, 260, 120, greens, p.flowers);
    var mistL = N.mist(400, 70, '#FFFFFF') + N.mist(470, 40, '#FFFFFF');
    return { far: far, trees: trees, arch: arch, props: props, front: front, mist: mistL };
  };
  TORAJA_P.border = function (R, W, H, p) {
    var items = [];
    [16, 34, 52].forEach(function (x, i) {
      items.push(function (off) {
        var g = line('M' + x + ' ' + off + ' L' + x + ' ' + (off + H), i === 1 ? '#7E9E4A' : '#6A8A3C', 7, 1);
        for (var y = 40 + i * 25; y < H; y += 80) g += line('M' + (x - 4) + ' ' + (off + y) + ' l8 0', '#4E6A2C', 2, .9);
        return g;
      });
    });
    [100, 300, 500].forEach(function (y) { var R2 = rng(y + 9), g = ''; for (var k = 0; k < 10; k++) g += E(60 + R2() * 40, y + (R2() - .5) * 60, 22, 3.4, 10 + R2() * 50, pick(R2, tones('#5E8A3C')), .95); items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + g + '</g>'; }); });
    return items;
  };
  function patedong(R, cx, cy, w, p) {
    var g = line('M' + f(cx - w) + ' ' + f(cy - w * .2) + ' Q' + f(cx - w * .8) + ' ' + f(cy - w * .9) + ' ' + f(cx - w * .2) + ' ' + f(cy - w * .55), p.gold, w * .16, 1) + line('M' + f(cx + w) + ' ' + f(cy - w * .2) + ' Q' + f(cx + w * .8) + ' ' + f(cy - w * .9) + ' ' + f(cx + w * .2) + ' ' + f(cy - w * .55), p.gold, w * .16, 1);
    g += path('M' + f(cx - w * .32) + ' ' + f(cy - w * .5) + ' Q' + f(cx) + ' ' + f(cy - w * .7) + ' ' + f(cx + w * .32) + ' ' + f(cy - w * .5) + ' L' + f(cx + w * .2) + ' ' + f(cy + w * .35) + ' Q' + f(cx) + ' ' + f(cy + w * .5) + ' ' + f(cx - w * .2) + ' ' + f(cy + w * .35) + 'Z', '#8E1F1A');
    return g + E(cx - w * .14, cy - w * .2, w * .06, w * .06, 0, p.gold) + E(cx + w * .14, cy - w * .2, w * .06, w * .06, 0, p.gold);
  }
  TORAJA_P.crest = function (R, cx, y, p) { return patedong(R, cx, y - 14, 36, p); };
  TORAJA_P.motif = function (R, cx, cy, p) { return patedong(R, cx, cy + 4, 20, p); };

  /* ========================================================= SASAK (LOMBOK) */
  var SASAK_P = {
    sky: ['#EAF5FA', '#C9E4F2', '#A9D2E6'], sun: [150, 190], mist: '#F4FAFC', cloudShade: '#A3BCCB',
    leaf: '#467A36', ground: '#7EA44C', path: '#E4D6AE', paper: '#F5EEDC', paper2: '#E3D3AE', ink: '#2E2416',
    accent: '#A8322B', gold: '#CFA032', frame: '#3E3A5E', btn: '#3E4A7A', thatch: '#B79A5E', wood: ['#5E4028', '#7E5A38'],
    flowers: [['#E8559A', '#F7D35A', 5], ['#F28AB8', '#F7E08A', 5], ['#FFFFFF', '#F2C94C', 5]]
  };
  function lumbung(R, x, base, s, p) {
    var g = '';
    [-22, -8, 8, 22].forEach(function (dx) { g += poly([[x + dx * s - 3 * s, base], [x + dx * s + 3 * s, base], [x + dx * s + 3 * s, base - 46 * s], [x + dx * s - 3 * s, base - 46 * s]], p.wood[0]) + E(x + dx * s, base - 46 * s, 7 * s, 3 * s, 0, p.wood[1]); });
    g += paintPoly(R, [[x - 34 * s, base - 50 * s], [x + 34 * s, base - 50 * s], [x + 34 * s, base - 56 * s], [x - 34 * s, base - 56 * s]], p.wood[1], { edgeW: 1 });
    var d = 'M' + f(x - 50 * s) + ' ' + f(base - 56 * s) + ' Q' + f(x - 36 * s) + ' ' + f(base - 70 * s) + ' ' + f(x - 34 * s) + ' ' + f(base - 110 * s) + ' Q' + f(x - 32 * s) + ' ' + f(base - 176 * s) + ' ' + f(x) + ' ' + f(base - 180 * s) + ' Q' + f(x + 32 * s) + ' ' + f(base - 176 * s) + ' ' + f(x + 34 * s) + ' ' + f(base - 110 * s) + ' Q' + f(x + 36 * s) + ' ' + f(base - 70 * s) + ' ' + f(x + 50 * s) + ' ' + f(base - 56 * s) + 'Z';
    g += paintPath(R, d, p.thatch, { x: x - 50 * s, y: base - 180 * s, w: 100 * s, h: 124 * s }, { angle: 86, len: 16, w: 2, n: 120, tones: tones(p.thatch) });
    for (var k = 0; k < 6; k++) g += line('M' + f(x - 34 * s) + ' ' + f(base - (70 + k * 18) * s) + ' Q' + f(x) + ' ' + f(base - (78 + k * 18) * s) + ' ' + f(x + 34 * s) + ' ' + f(base - (70 + k * 18) * s), darken(p.thatch, .3), 1.2, .5);
    g += poly([[x - 10 * s, base - 92 * s], [x + 10 * s, base - 92 * s], [x + 10 * s, base - 118 * s], [x - 10 * s, base - 118 * s]], '#3A2A1A') + line('M' + f(x) + ' ' + f(base - 180 * s) + ' v' + f(-12 * s), p.wood[0], 2.4 * s, 1);
    return g;
  }
  function bale(R, x, base, s, p) {
    var g = paintPoly(R, [[x - 70 * s, base], [x + 70 * s, base], [x + 70 * s, base - 40 * s], [x - 70 * s, base - 40 * s]], '#D8C08A', { angle: 0, len: 10, w: 1.6, n: 60 });
    for (var i = 0; i < 14; i++) g += line('M' + f(x - 70 * s + i * 10 * s) + ' ' + base + ' l0 ' + f(-40 * s), '#B89A64', 1, .5);
    g += poly([[x - 10 * s, base], [x + 10 * s, base], [x + 10 * s, base - 30 * s], [x - 10 * s, base - 30 * s]], '#3A2A1A');
    return g + paintPoly(R, [[x - 96 * s, base - 30 * s], [x + 96 * s, base - 30 * s], [x + 50 * s, base - 92 * s], [x - 50 * s, base - 92 * s]], p.thatch, { angle: 30, len: 16, w: 2, n: 90, tones: tones(p.thatch) });
  }
  SASAK_P.scene = function (p) {
    var R = rng(505), greens = tones(p.leaf);
    var far = N.volcano(R, 260, 466, 820, 330, '#7C8FA6', { snow: false }) + N.hillsRow(R, 470, 34, '#6E9A5A', -420, 820, 9);
    far += N.palm(R, -280, 500, 170, 26, tones('#3E7030'), '#8A6A48') + N.palm(R, -200, 504, 140, -14, tones('#3E7030'), '#8A6A48') + N.palm(R, 640, 500, 170, -22, tones('#3E7030'), '#8A6A48') + N.palm(R, 720, 504, 150, 16, tones('#3E7030'), '#8A6A48');
    far += N.terraces(R, -420, 820, 486, 528, 3, ['#86AE52', '#9CC060', '#78A448'], '#EEF6F4');
    var trees = N.roundTree(R, -160, 556, 1.2, greens, '#4A3220') + N.roundTree(R, 570, 556, 1.2, greens, '#4A3220') + N.palm(R, -340, 560, 260, 36, tones('#3A6A2C'), '#8A6A48') + N.palm(R, 750, 560, 260, -36, tones('#3A6A2C'), '#8A6A48');
    var arch = bale(R, -60, 520, .9, p) + bale(R, 470, 520, .9, p) + N.ground(R, p, 528) + lumbung(R, 120, 534, 1.05, p) + lumbung(R, 290, 534, 1.05, p) + N.courtPath(R, p, 205, 536, 22, 110);
    arch += couple(R, 205, 652, 1.15,
      { skin: '#B07650', top: '#2A2E52', bottom: '#1C1A2E', motif: '#CFA032', trim: '#CFA032', sash: '#A8322B', head: function (R, x, y, s) { return poly([[x - 11 * s, y - 6 * s], [x + 11 * s, y - 6 * s], [x + 9 * s, y - 13 * s], [x - 2 * s, y - 22 * s], [x - 9 * s, y - 13 * s]], '#3E3A5E') + line('M' + f(x - 11 * s) + ' ' + f(y - 7 * s) + ' L' + f(x + 11 * s) + ' ' + f(y - 7 * s), '#CFA032', 2.4 * s, 1); } },
      { female: true, skin: '#C08660', top: '#1C1A2E', bottom: '#6A2E6E', motif: '#CFA032', trim: '#CFA032', sash: '#CFA032', head: function (R, x, y, s) { return E(x, y - 3 * s, 11 * s, 10 * s, 0, '#1A1210') + E(x, y - 14 * s, 9 * s, 6 * s, 0, '#1A1210') + goldPins(R, x, y - 16 * s, s, 7, '#CFA032'); } });
    var props = N.banana(R, 20, 600, 1.3, tones('#6E9A3A')) + N.banana(R, 390, 600, 1.3, tones('#6E9A3A'));
    var front = N.bush(R, -40, 650, 300, 140, greens, p.flowers) + N.bush(R, 450, 650, 300, 140, greens, p.flowers) + N.bush(R, -300, 640, 260, 120, greens, p.flowers) + N.bush(R, 710, 640, 260, 120, greens, p.flowers);
    return { far: far, trees: trees, arch: arch, props: props, front: front, mistY: 460 };
  };
  SASAK_P.border = function (R, W, H, p) {
    var items = [];
    [100, 420].forEach(function (y) {
      var R2 = rng(y + 11), g = line('M0 ' + y + ' Q50 ' + (y - 40) + ' 120 ' + (y - 10), '#5E7A34', 2.2, 1);
      for (var j = 1; j < 16; j++) { var t = j / 16, qx = 120 * t, qy = y - 40 * 2 * t * (1 - t) - 10 * t * t; g += E(qx + 4, qy + 8, 14 * (1 - t * .5), 2.4, 65, pick(R2, tones(p.leaf)), .95) + E(qx + 4, qy - 6, 14 * (1 - t * .5), 2.4, -55, pick(R2, tones(p.leaf)), .95); }
      items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + g + '</g>'; });
    });
    [260, 580].forEach(function (y) {
      var R2 = rng(y + 5), g = '';
      for (var k = 0; k < 8; k++) g += E(20 + R2() * 50, y + (R2() - .5) * 40, 14, 5, R2() * 360, pick(R2, tones(p.leaf)), .95);
      for (var q = 0; q < 9; q++) g += pflower(R2, 20 + R2() * 60, y + (R2() - .5) * 46, 7, pick(R2, ['#E8559A', '#F28AB8', '#D63C84']), '#F7E08A', 3);
      items.push(function (off) { return '<g transform="translate(0 ' + off + ')">' + g + '</g>'; });
    });
    return items;
  };
  function lumbungMini(R, cx, cy, w, p) {
    var d = 'M' + f(cx - w * .7) + ' ' + f(cy + w * .5) + ' Q' + f(cx - w * .5) + ' ' + f(cy - w * .9) + ' ' + f(cx) + ' ' + f(cy - w) + ' Q' + f(cx + w * .5) + ' ' + f(cy - w * .9) + ' ' + f(cx + w * .7) + ' ' + f(cy + w * .5) + 'Z';
    return path(d, p.gold) + line('M' + f(cx - w * .3) + ' ' + f(cy + w * .5) + ' l0 ' + f(w * .4) + ' M' + f(cx + w * .3) + ' ' + f(cy + w * .5) + ' l0 ' + f(w * .4), darken(p.gold, .2), w * .1, 1) + E(cx, cy - w * .1, w * .14, w * .2, 0, darken(p.gold, .35));
  }
  SASAK_P.crest = function (R, cx, y, p) { return lumbungMini(R, cx, y - 10, 30, p); };
  SASAK_P.motif = function (R, cx, cy, p) { return lumbungMini(R, cx, cy + 2, 18, p); };

  PT.ADAT.jawa = { pal: JAWA_P, scene: JAWA_P.scene, border: JAWA_P.border, crest: JAWA_P.crest, motif: JAWA_P.motif };
  PT.ADAT.bali = { pal: BALI_P, scene: BALI_P.scene, border: BALI_P.border, crest: BALI_P.crest, motif: BALI_P.motif };
  PT.ADAT.minang = { pal: MINANG_P, scene: MINANG_P.scene, border: MINANG_P.border, crest: MINANG_P.crest, motif: MINANG_P.motif };
  PT.ADAT.toraja = { pal: TORAJA_P, scene: TORAJA_P.scene, border: TORAJA_P.border, crest: TORAJA_P.crest, motif: TORAJA_P.motif };
  PT.ADAT.sasak = { pal: SASAK_P, scene: SASAK_P.scene, border: SASAK_P.border, crest: SASAK_P.crest, motif: SASAK_P.motif };
})();
