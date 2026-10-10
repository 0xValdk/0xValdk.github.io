/* Atlas des sites industriels — moteur de carte (aucune dépendance).
   Vos données sont dans mes-sites.js : inutile de modifier ce fichier. */
(function () {
  'use strict';

  // ---------- Projection Web Mercator (identique au fond de carte) ----------
  var W = 1000, H = 968.4658, K = 818.5111359, MAX_S = 40;
  var MY1 = Math.log(Math.tan(Math.PI / 4 + 71.5 * Math.PI / 360));
  function proj(lon, lat) {
    return { x: (lon + 25) * Math.PI / 180 * K, y: (MY1 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) * K };
  }
  function latAt(y) { return (2 * Math.atan(Math.exp(MY1 - y / K)) - Math.PI / 2) * 180 / Math.PI; }

  // ---------- Configuration & données ----------
  var CFG = Object.assign({ nom: '', fonction: '', theme: 'clair', accent: '#C2410C', vueInitiale: 'europe' }, window.ATLAS_CONFIG || {});
  var dark = /^(nuit|dark|sombre)$/i.test(String(CFG.theme));
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.style.setProperty('--accent', CFG.accent);

  var SITES = (window.SITES || []).filter(function (s) {
    var ok = s && typeof s.lat === 'number' && typeof s.lon === 'number';
    if (!ok) console.warn('Site ignoré (lat/lon manquants ou invalides) :', s);
    return ok;
  }).map(function (s, i) {
    var site = Object.assign({}, s);
    // un texte vide ou fait d'espaces compte comme absent
    Object.keys(site).forEach(function (k) { if (typeof site[k] === 'string') site[k] = site[k].trim(); });
    site.id = 's' + i; site.num = i + 1; site.p = proj(s.lon, s.lat);
    site.period = s.start && s.end && s.end !== s.start ? s.start + '–' + s.end : String(s.start || s.end || '');
    site.meta = [s.sector, [s.city, s.country].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
    return site;
  });
  var N = SITES.length;

  var COUNTRIES = [
    ['France', 2.4, 46.7, 0], ['Espagne', -3.7, 40.0, 0], ['Portugal', -8.0, 39.8, 0], ['Allemagne', 10.3, 51.2, 0],
    ['Italie', 12.4, 43.0, 0], ['Royaume-Uni', -1.8, 52.9, 0], ['Irlande', -8.0, 53.2, 0], ['Norvège', 9.0, 61.6, 0],
    ['Suède', 15.2, 62.6, 0], ['Finlande', 26.2, 63.6, 0], ['Pologne', 19.3, 52.1, 0], ['Ukraine', 31.5, 49.2, 0],
    ['Roumanie', 24.8, 45.9, 0], ['Islande', -18.6, 64.9, 0], ['Biélorussie', 28.0, 53.5, 0], ['Turquie', 34.5, 39.2, 0],
    ['Grèce', 22.0, 39.5, 0], ['Danemark', 9.2, 56.1, 2.6], ['Belgique', 4.6, 50.6, 2.6], ['Pays-Bas', 5.6, 52.4, 2.6],
    ['Suisse', 8.1, 46.8, 2.6], ['Autriche', 14.4, 47.6, 2.6], ['Tchéquie', 15.4, 49.8, 2.6], ['Slovaquie', 19.6, 48.7, 2.6],
    ['Hongrie', 19.4, 47.1, 2.6], ['Serbie', 20.8, 44.0, 2.6], ['Bulgarie', 25.3, 42.7, 2.6], ['Lituanie', 23.9, 55.3, 2.6],
    ['Lettonie', 25.0, 56.9, 2.6], ['Estonie', 25.6, 58.7, 2.6], ['Croatie', 16.0, 45.6, 3.2], ['Bosnie-Herz.', 17.8, 44.2, 3.2],
    ['Slovénie', 14.8, 46.1, 4.2], ['Moldavie', 28.5, 47.2, 3.2], ['Albanie', 20.0, 41.0, 3.2], ['Macédoine du N.', 21.7, 41.6, 4.2],
    ['Luxembourg', 6.1, 49.8, 6]
  ].map(function (c) { return { key: 'c:' + c[0], name: c[0], p: proj(c[1], c[2]), minS: c[3] }; });

  var PL = window.PLACES || { cities: [], regions: [] };
  var CITIES = PL.cities.map(function (c, i) {
    var big = c[5] === 2 || c[4] >= 1000000, mid = !big && (c[5] === 1 || c[4] >= 150000);
    var size = big ? 13 : mid ? 12 : 11, dot = big ? 7 : mid ? 6 : 5;
    return { key: 'v:' + i, name: c[0], p: proj(c[1], c[2]), minZ: c[3], tier: big ? 'big' : mid ? 'mid' : '', size: size, dot: dot,
      w: dot + 5 + c[0].length * size * 0.56 + 4 };
  });
  var REGIONS = PL.regions.map(function (r, i) {
    return { key: 'r:' + i, name: r[0], p: proj(r[1], r[2]), level: r[3], area: r[4] / Math.pow(Math.cos(r[2] * Math.PI / 180), 2) };
  });

  // ---------- Éléments ----------
  var $ = function (id) { return document.getElementById(id); };
  var mapEl = $('map'), layer = $('layer'), imgReg = $('img-reg'), imgSub = $('img-sub');
  var labelsEl = $('labels'), pinsEl = $('pins'), tipEl = $('tip'), panel = $('panel');
  $('img-base').src = dark ? 'carte/base-dark.svg' : 'carte/base-light.svg';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- Lexique : termes du métier soulignés dans les descriptions ----------
  var LEX = (window.LEXIQUE || []).filter(function (x) { return x && String(x.terme || '').trim() && String(x.definition || '').trim(); });
  var LEX_BY = {}, LEX_RE = null;
  (function () {
    var forms = [];
    LEX.forEach(function (x) {
      [x.terme].concat(x.variantes || []).forEach(function (f) {
        f = String(f).trim(); if (!f) return;
        LEX_BY[esc(f).toLowerCase()] = x; forms.push(esc(f));
      });
    });
    forms.sort(function (a, b) { return b.length - a.length; });   // la forme la plus longue l'emporte
    if (forms.length) {
      try {
        // le pluriel en -s / -x est reconnu sans variante
        LEX_RE = new RegExp('(^|[^\\p{L}\\p{N}])((?:' + forms.map(function (f) { return f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')(?:s|x)?)(?![\\p{L}\\p{N}])', 'giu');
      } catch (e) { LEX_RE = null; }
    }
  })();
  // renvoie le texte échappé avec les termes balisés, et la liste des entrées rencontrées
  function lexify(text, used) {
    var html = esc(text);
    if (!LEX_RE) return html;
    return html.replace(LEX_RE, function (m, pre, term) {
      var k = term.toLowerCase(), x = LEX_BY[k] || LEX_BY[k.replace(/[sx]$/, '')];
      if (!x) return m;
      if (used.indexOf(x) < 0) used.push(x);
      return pre + '<span class="lx">' + term + '</span>';
    });
  }

  // ---------- État ----------
  var vw = 0, vh = 0;
  var view = { s: 1, tx: 0, ty: 0 };   // vue affichée
  var sb = 1;                           // échelle à laquelle le fond est dessiné net
  var hoverId = null, selId = null, query = '', sector = 'Tous';
  var tween = null, wheel = null, raf = 0, idleT = 0, drag = null, justDragged = false;

  // ---------- Vue ----------
  function minS() { return Math.max(vw / W, vh / H); }
  function clampS(s) { return Math.min(Math.max(s, minS()), MAX_S); }
  function clampView(v) {
    var s = clampS(v.s), tx = v.tx, ty = v.ty;
    if (s !== v.s) { var cx = (vw / 2 - v.tx) / v.s, cy = (vh / 2 - v.ty) / v.s; tx = vw / 2 - cx * s; ty = vh / 2 - cy * s; }
    return { s: s, tx: Math.min(0, Math.max(vw - W * s, tx)), ty: Math.min(0, Math.max(vh - H * s, ty)) };
  }
  function centerOf(v) { return { cx: (vw / 2 - v.tx) / v.s, cy: (vh / 2 - v.ty) / v.s, s: v.s }; }
  function fromCenter(c) { return { s: c.s, tx: vw / 2 - c.cx * c.s, ty: vh / 2 - c.cy * c.s }; }
  function fitBox(x0, y0, x1, y1, pad, maxS) {
    var s = Math.min((vw - pad * 2) / Math.max(x1 - x0, 1), (vh - pad * 2) / Math.max(y1 - y0, 1));
    if (maxS) s = Math.min(s, maxS);
    s = clampS(s);
    return clampView({ s: s, tx: vw / 2 - (x0 + x1) / 2 * s, ty: vh / 2 - (y0 + y1) / 2 * s });
  }
  function europeView() { var a = proj(-11, 62), b = proj(33, 35); return fitBox(a.x, a.y, b.x, b.y, 0); }
  function sitesView() {
    var vis = SITES.filter(matches);
    if (!vis.length) return null;
    var xs = vis.map(function (s) { return s.p.x; }), ys = vis.map(function (s) { return s.p.y; });
    return fitBox(Math.min.apply(0, xs), Math.min.apply(0, ys) - 12, Math.max.apply(0, xs), Math.max.apply(0, ys), 90, 7);
  }

  // Animation fluide : interpolation du centre et du log de l'échelle
  function flyTo(target, dur) {
    target = clampView(target);
    wheel = null;
    tween = { a: centerOf(view), b: centerOf(target), t0: performance.now(), dur: dur || 650 };
    kick();
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    var moving = false;
    if (tween) {
      var t = Math.min(1, (now - tween.t0) / tween.dur), e = ease(t), a = tween.a, b = tween.b;
      var s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e);
      view = clampView(fromCenter({ s: s, cx: a.cx + (b.cx - a.cx) * e, cy: a.cy + (b.cy - a.cy) * e }));
      if (t < 1) moving = true; else tween = null;
    } else if (wheel) {
      var ls = Math.log(view.s), lt = Math.log(wheel.s), nl = ls + (lt - ls) * 0.3;
      if (Math.abs(lt - nl) < 0.002) nl = lt; else moving = true;
      var ns = Math.exp(nl);
      view = clampView({ s: ns, tx: wheel.px - wheel.wx * ns, ty: wheel.py - wheel.wy * ns });
      if (!moving) wheel = null;
    }
    render();
    if (moving) kick(); else scheduleIdle();
  }
  function scheduleIdle() {
    clearTimeout(idleT);
    idleT = setTimeout(function () {
      if (tween || wheel || (drag && drag.moved)) return;
      if (Math.abs(sb / view.s - 1) > 0.02) sb = view.s;   // redessine le fond net
      updateLabels();
      render();
    }, 140);
  }
  function setView(v) { tween = null; wheel = null; view = clampView(v); render(); scheduleIdle(); }

  function zoomAt(px, py, factor, smooth) {
    if (!smooth) {
      var base = wheel ? wheel.s : view.s;
      var ts = clampS(base * factor);
      tween = null;
      wheel = { s: ts, px: px, py: py, wx: (px - view.tx) / view.s, wy: (py - view.ty) / view.s };
      kick();
      return;
    }
    var s = clampS(view.s * factor);
    var wx = (px - view.tx) / view.s, wy = (py - view.ty) / view.s;
    flyTo({ s: s, tx: px - wx * s, ty: py - wy * s }, 450);
  }
  function localPoint(e) {
    var r = mapEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  // ---------- Rendu (chaque image d'animation) ----------
  function render() {
    var s = view.s, tx = view.tx, ty = view.ty, k = s / sb;
    layer.style.width = (W * sb) + 'px';
    layer.style.height = (H * sb) + 'px';
    layer.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + k + ')';
    imgReg.style.opacity = Math.max(0, Math.min(1, (s - 2.3) / 1.4));
    imgSub.style.opacity = Math.max(0, Math.min(1, (s - 6) / 3));

    for (var i = 0; i < SITES.length; i++) {
      var st = SITES[i];
      st.sx = tx + st.p.x * s; st.sy = ty + st.p.y * s;
      st.el.style.transform = 'translate3d(' + st.sx + 'px,' + st.sy + 'px,0)';
    }
    for (var key in shown) {
      var L = shown[key];
      L.el.style.transform = 'translate3d(' + (tx + L.item.p.x * s) + 'px,' + (ty + L.item.p.y * s) + 'px,0)';
    }
    renderTip();
    renderScale();
  }

  // ---------- Étiquettes (recalculées à l'arrêt seulement) ----------
  var shown = {};
  function updateLabels() {
    if (!vw) return;
    var s = view.s, tx = view.tx, ty = view.ty, z = Math.log(20.09 * s) / Math.LN2, ppd = 1000 * s / 70;
    var boxes = [], next = [];
    function inView(x, y) { return x > -60 && x < vw + 60 && y > -20 && y < vh + 20; }
    function fits(x0, y0, x1, y1) {
      for (var i = 0; i < boxes.length; i++) { var b = boxes[i]; if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false; }
      boxes.push([x0, y0, x1, y1]); return true;
    }
    // les épingles réservent leur place
    SITES.forEach(function (st) { boxes.push([st.sx - 16, st.sy - 44, st.sx + 16, st.sy + 2]); });
    COUNTRIES.forEach(function (c) {
      if (s < c.minS) return;
      var x = tx + c.p.x * s, y = ty + c.p.y * s, w = c.name.length * 8.6 + 8;
      if (inView(x, y) && fits(x - w / 2, y - 9, x + w / 2, y + 9)) next.push({ item: c, cls: 'country' });
    });
    var nc = 0;
    CITIES.forEach(function (c) {
      if (nc >= 140 || z < c.minZ - 0.7) return;
      var x = tx + c.p.x * s, y = ty + c.p.y * s;
      if (!inView(x, y)) return;
      if (!fits(x - c.dot / 2 - 2, y - c.size * .75, x - c.dot / 2 + c.w, y + c.size * .75)) return;
      nc++; next.push({ item: c, cls: 'city ' + c.tier });
    });
    REGIONS.forEach(function (r) {
      if (r.level === 1 && z < 5.6) return;
      if (r.level === 2 && z < 7.1) return;
      if (r.area * ppd * ppd < (r.level === 1 ? 7000 : 5000)) return;
      var x = tx + r.p.x * s, y = ty + r.p.y * s;
      if (!inView(x, y)) return;
      var w = r.name.length * (r.level === 1 ? 8 : 6.4) + 6;
      if (fits(x - w / 2, y - 8, x + w / 2, y + 8)) next.push({ item: r, cls: r.level === 1 ? 'region' : 'dept' });
    });

    var keep = {};
    next.forEach(function (n) {
      var key = n.item.key;
      keep[key] = true;
      if (shown[key]) return;
      var el = document.createElement('div');
      el.className = 'lbl ' + n.cls;
      el.innerHTML = n.cls.indexOf('city') === 0 ? '<span><i></i>' + esc(n.item.name) + '</span>' : '<span>' + esc(n.item.name) + '</span>';
      labelsEl.appendChild(el);
      shown[key] = { el: el, item: n.item };
    });
    for (var key in shown) if (!keep[key]) { labelsEl.removeChild(shown[key].el); delete shown[key]; }
  }

  // ---------- Épingles ----------
  var PIN_PATH = 'M15 1C7.3 1 1 7.1 1 14.7c0 10.2 12.2 22.9 13.3 24 .4.4 1 .4 1.4 0C16.8 37.6 29 24.9 29 14.7 29 7.1 22.7 1 15 1z';
  SITES.forEach(function (st) {
    var el = document.createElement('div');
    el.className = 'pin';
    el.innerHTML = '<button type="button" aria-label="' + esc(st.name + ', ' + (st.city || '') + (st.period ? ' (' + st.period + ')' : '')) + '">' +
      '<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="' + PIN_PATH + '"/></svg>' +
      '<span class="n mono">' + st.num + '</span></button>';
    var btn = el.firstChild;
    btn.addEventListener('click', function () { if (!justDragged) select(st.id, false); });
    btn.addEventListener('mouseenter', function () { if (!drag) setHover(st.id); });
    btn.addEventListener('mouseleave', function () { if (hoverId === st.id) setHover(null); });
    btn.addEventListener('focus', function () { setHover(st.id); });
    btn.addEventListener('blur', function () { if (hoverId === st.id) setHover(null); });
    btn.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    st.el = el;
    pinsEl.appendChild(el);
  });
  function paintPins() {
    SITES.forEach(function (st) {
      var on = matches(st);
      st.el.className = 'pin' + (on ? '' : ' off') + (st.id === hoverId ? ' hot' : '') + (st.id === selId ? ' sel' : '');
      st.el.style.zIndex = st.id === selId ? 1000 : st.id === hoverId ? 999 : Math.round(st.p.y);
      var ring = st.el.querySelector('.ring');
      if (st.id === selId && !ring) { ring = document.createElement('span'); ring.className = 'ring'; st.el.insertBefore(ring, st.el.firstChild); }
      if (st.id !== selId && ring) ring.remove();
    });
  }
  function setHover(id) {
    hoverId = id;
    paintPins();
    Array.prototype.forEach.call(document.querySelectorAll('.row'), function (r) { r.classList.toggle('hot', r.dataset.id === id); });
    renderTip();
  }
  function renderTip() {
    var st = hoverId && !(drag && drag.moved) ? SITES.find(function (x) { return x.id === hoverId && matches(x); }) : null;
    if (!st || !vw) { tipEl.hidden = true; return; }
    tipEl.hidden = false;
    tipEl.firstChild.textContent = st.name;
    tipEl.lastChild.textContent = [st.meta, st.period].filter(Boolean).join(' · ');
    tipEl.lastChild.hidden = !tipEl.lastChild.textContent;
    var pinH = 40 * (st.id === selId ? 1.3 : 1.16), below = st.sy - pinH < 90;
    var x = Math.min(Math.max(st.sx, 140), vw - 140);
    tipEl.style.transform = 'translate3d(' + x + 'px,' + (below ? st.sy + 12 : st.sy - pinH - 10) + 'px,0) translate(-50%,' + (below ? '0' : '-100%') + ')';
  }

  // ---------- Échelle ----------
  function renderScale() {
    if (!vw) return;
    var lat = latAt((vh / 2 - view.ty) / view.s);
    var mpp = 6371000 * Math.cos(lat * Math.PI / 180) / (K * view.s), km = 1;
    [1, 2, 5, 10, 20, 50, 100, 200, 300, 500, 1000].forEach(function (k) { if (k * 1000 / mpp <= 110) km = k; });
    $('scale-bar').style.width = Math.round(km * 1000 / mpp) + 'px';
    $('scale-label').textContent = km + ' km';
  }

  // ---------- Filtres & liste ----------
  function matches(st) {
    if (sector !== 'Tous' && st.sector !== sector) return false;
    var q = query.trim().toLowerCase();
    if (!q) return true;
    return [st.name, st.city, st.country, st.sector, st.operator, st.role].join(' ').toLowerCase().indexOf(q) !== -1;
  }
  function renderChips() {
    var sectors = ['Tous'];
    SITES.forEach(function (s) { if (s.sector && sectors.indexOf(s.sector) === -1) sectors.push(s.sector); });
    $('chips').innerHTML = sectors.map(function (x) {
      return '<button type="button" class="chip" data-sector="' + esc(x) + '" aria-pressed="' + (x === sector) + '">' + esc(x) + '</button>';
    }).join('');
  }
  function renderList() {
    var vis = SITES.filter(matches);
    $('list').innerHTML = vis.map(function (st) {
      return '<button type="button" class="row' + (st.id === hoverId ? ' hot' : '') + '" data-id="' + st.id + '">' +
        '<span class="num mono">' + st.num + '</span>' +
        '<span class="row-main"><span class="row-name">' + esc(st.name) + '</span>' + (st.meta ? '<span class="row-meta">' + esc(st.meta) + '</span>' : '') + '</span>' +
        '<span class="row-period mono">' + esc(st.period) + '</span></button>';
    }).join('');
    $('list-label').textContent = vis.length === N ? 'Sites · ' + N : vis.length + ' sur ' + N + ' sites';
    $('empty').hidden = vis.length !== 0;
    paintPins();
  }
  function renderStats() {
    var countries = [], ys = [];
    SITES.forEach(function (s) { if (s.country && countries.indexOf(s.country) === -1) countries.push(s.country); if (s.start) ys.push(s.start); if (s.end) ys.push(s.end); });
    $('st-sites').textContent = N;
    $('st-countries').textContent = countries.length;
    if (ys.length) {
      var a = Math.min.apply(0, ys), b = Math.max.apply(0, ys);
      $('st-years').textContent = b - a + 1;
      $('st-years-label').textContent = 'Années · ' + a + '–' + b;
    }
    $('profile').textContent = String(CFG.presentation || '').trim();
    $('profile').hidden = !$('profile').textContent;
    $('st-years').parentNode.hidden = !ys.length;
    $('st-countries').parentNode.hidden = !countries.length;
    var cols = 1 + (ys.length ? 1 : 0) + (countries.length ? 1 : 0);
    document.querySelector('.stats').style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
  }

  // ---------- Fiche détaillée ----------
  var ICON = {
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>',
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    ext: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    aim: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>'
  };
  function coord(v, p, n) { return Math.abs(v).toFixed(4).replace('.', ',') + '° ' + (v >= 0 ? p : n); }
  function renderDetail() {
    var box = $('view-detail');
    var st = SITES.find(function (x) { return x.id === selId; });
    $('view-list').hidden = !!st;
    box.hidden = !st;
    if (!st) return;
    var facts = [['Période', st.period], ['Intervention', st.role], ['Exploitant', st.operator], ['Secteur', st.sector]].filter(function (f) { return f[1]; });
    var extras = (st.extras || []).filter(function (x) { return x && String(x.label || '').trim() && String(x.value == null ? '' : x.value).trim(); });
    var place = [st.city, st.country].filter(Boolean).join(', ');
    var used = [];
    var gmaps = st.gmaps || 'https://www.google.com/maps/search/?api=1&query=' + st.lat + ',' + st.lon;
    box.innerHTML =
      '<div class="rise">' +
      '<div class="d-bar"><button type="button" class="ghost" data-act="close">' + ICON.back + '<span>Tous les sites</span></button>' +
      '<div class="d-nav"><button type="button" class="ghost" data-act="prev" aria-label="Site précédent">' + ICON.prev + '</button>' +
      '<span class="d-pos mono">' + st.num + ' / ' + N + '</span>' +
      '<button type="button" class="ghost" data-act="next" aria-label="Site suivant">' + ICON.next + '</button></div></div>' +
      '<div class="d-head"><div class="d-tags"><span class="num mono">' + st.num + '</span>' + (st.sector ? '<span class="tag">' + esc(st.sector) + '</span>' : '') + '</div>' +
      '<h2>' + esc(st.name) + '</h2>' +
      (place ? '<div class="d-place">' + ICON.pin + '<span>' + esc(place) + '</span></div>' : '') +
      '<div class="d-actions"><a class="btn" href="' + esc(gmaps) + '" target="_blank" rel="noopener noreferrer"><span>Voir sur Google Maps</span>' + ICON.ext + '</a>' +
      '<button type="button" class="btn-2" data-act="center">' + ICON.aim + '<span>Recentrer</span></button></div></div>' +
      (facts.length ? '<div class="facts">' + facts.map(function (f) { return '<div class="fact"><span class="k mono">' + f[0] + '</span><span class="v">' + (f[0] === 'Intervention' ? lexify(f[1], used) : esc(f[1])) + '</span></div>'; }).join('') + '</div>' : '') +
      (st.description || st.video ? '<div class="d-sec"><span class="k mono">Mission</span>' + (st.description ? '<p>' + lexify(st.description, used) + '</p>' : '') +
        (st.video ? '<a class="btn-2 d-video" href="' + esc(st.video) + '" target="_blank" rel="noopener noreferrer">' + ICON.play + '<span>Voir la vidéo</span></a>' : '') + '</div>' : '') +
      (used.length ? '<div class="d-sec lexique"><span class="k mono">Lexique</span><dl>' + used.map(function (x) {
        return '<div><dt>' + esc(x.terme) + '</dt><dd>' + esc(x.definition) +
          (x.video ? ' <a class="lx-video" href="' + esc(x.video) + '" target="_blank" rel="noopener noreferrer">Voir le principe en vidéo' + ICON.ext + '</a>' : '') + '</dd></div>';
      }).join('') + '</dl></div>' : '') +
      (extras.length ? '<div class="d-sec" style="gap:4px"><span class="k mono" style="padding-bottom:6px">Informations complémentaires</span>' +
        extras.map(function (x) { return '<div class="xrow"><span>' + esc(x.label) + '</span><span>' + esc(x.value) + '</span></div>'; }).join('') + '</div>' : '') +
      (st.notes && String(st.notes).trim() ? '<div class="notes"><span class="k mono">Notes</span><p>' + esc(st.notes) + '</p></div>' : '') +
      '<div class="coords mono">' + coord(st.lat, 'N', 'S') + ' · ' + coord(st.lon, 'E', 'O') + '</div>' +
      '</div>';
  }
  function flyToSite(st) {
    var s = Math.max(view.s, 4.6);
    flyTo({ s: s, tx: vw / 2 - st.p.x * s, ty: vh / 2 - st.p.y * s + 30 }, 750);
  }
  function select(id, fly) {
    selId = id;
    paintPins();
    renderDetail();
    renderTip();
    panel.scrollTop = 0;
    if (id && fly) { var st = SITES.find(function (x) { return x.id === id; }); if (st) flyToSite(st); }
  }

  // ---------- Événements ----------
  $('q').addEventListener('input', function (e) { query = e.target.value; renderList(); });
  $('chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    sector = b.dataset.sector; renderChips(); renderList();
  });
  $('clear').addEventListener('click', function () { query = ''; sector = 'Tous'; $('q').value = ''; renderChips(); renderList(); });
  $('list').addEventListener('click', function (e) { var r = e.target.closest('.row'); if (r) select(r.dataset.id, true); });
  $('list').addEventListener('mouseover', function (e) { var r = e.target.closest('.row'); if (r && r.dataset.id !== hoverId) setHover(r.dataset.id); });
  $('list').addEventListener('mouseleave', function () { setHover(null); });
  $('view-detail').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var i = SITES.findIndex(function (x) { return x.id === selId; });
    var act = b.dataset.act;
    if (act === 'close') select(null);
    else if (act === 'prev') select(SITES[(i - 1 + N) % N].id, true);
    else if (act === 'next') select(SITES[(i + 1) % N].id, true);
    else if (act === 'center') flyToSite(SITES[i]);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && selId) select(null); });

  $('zin').addEventListener('click', function () { zoomAt(vw / 2, vh / 2, 1.8, true); });
  $('zout').addEventListener('click', function () { zoomAt(vw / 2, vh / 2, 1 / 1.8, true); });
  $('fit').addEventListener('click', function () { var v = sitesView(); if (v) flyTo(v, 750); });
  $('europe').addEventListener('click', function () { flyTo(europeView(), 750); });
  document.querySelector('.controls').addEventListener('dblclick', function (e) { e.stopPropagation(); });

  mapEl.addEventListener('wheel', function (e) {
    e.preventDefault();
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
    dy = Math.max(-150, Math.min(150, dy));
    var p = localPoint(e);
    zoomAt(p.x, p.y, Math.exp(-dy * 0.0032), false);
  }, { passive: false });
  mapEl.addEventListener('dblclick', function (e) { if (justDragged) return; var p = localPoint(e); zoomAt(p.x, p.y, 2, true); });
  mapEl.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.target.closest('.controls')) return;
    drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false, id: e.pointerId };
  });
  mapEl.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) + Math.abs(dy) < 5) return;
      drag.moved = true;
      try { mapEl.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
      mapEl.classList.add('dragging');
      tween = null; wheel = null;
      drag.tx = view.tx; drag.ty = view.ty; drag.x = e.clientX; drag.y = e.clientY; dx = dy = 0;
    }
    setView({ s: view.s, tx: drag.tx + dx, ty: drag.ty + dy });
  });
  function endDrag() {
    if (drag && drag.moved) {
      justDragged = true; setTimeout(function () { justDragged = false; }, 60);
      mapEl.classList.remove('dragging');
      scheduleIdle();
    }
    drag = null;
  }
  mapEl.addEventListener('pointerup', endDrag);
  mapEl.addEventListener('pointercancel', endDrag);

  function measure() {
    var w = mapEl.clientWidth, h = mapEl.clientHeight;
    if (!w || !h || (w === vw && h === vh)) return;
    var first = !vw;
    vw = w; vh = h;
    if (first) {
      view = (CFG.vueInitiale === 'sites' && sitesView()) || europeView();
      sb = view.s;
    } else view = clampView(view);
    render();
    updateLabels();
    render();
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(mapEl);
  window.addEventListener('resize', measure);

  // ---------- Démarrage ----------
  renderStats();
  renderChips();
  renderList();
  measure();
})();
